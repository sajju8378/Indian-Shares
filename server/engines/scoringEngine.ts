import { StockQuote, Fundamentals, ValuationMetrics, StockScoreBreakdown } from '../../src/types/index.ts';
import { dbService, ScoringWeights } from '../db/database.ts';

export class IndianSharesScoringEngine {
  public static calculateStockScore(
    stock: StockQuote,
    fundamentals?: Fundamentals,
    valuation?: ValuationMetrics,
    weights?: ScoringWeights
  ): StockScoreBreakdown {
    const w = weights || dbService.getDb().scoringWeights;
    const db = dbService.getDb();

    // 1. Fundamental Score (0 - 100 scaled)
    let fundamentalScore = 50;
    if (fundamentals) {
      let fPts = 0;
      // ROE
      if (fundamentals.roePercent >= 25) fPts += 25;
      else if (fundamentals.roePercent >= 18) fPts += 20;
      else if (fundamentals.roePercent >= 12) fPts += 15;
      else if (fundamentals.roePercent > 0) fPts += 8;

      // ROCE
      if (fundamentals.rocePercent >= 25) fPts += 25;
      else if (fundamentals.rocePercent >= 18) fPts += 20;
      else if (fundamentals.rocePercent >= 12) fPts += 15;
      else if (fundamentals.rocePercent > 0) fPts += 8;

      // Debt to Equity
      if (fundamentals.debtToEquity <= 0.1) fPts += 25;
      else if (fundamentals.debtToEquity <= 0.5) fPts += 20;
      else if (fundamentals.debtToEquity <= 1.0) fPts += 12;
      else if (fundamentals.debtToEquity <= 2.0) fPts += 5;

      // Operating Margin & Cash flow
      if (fundamentals.operatingMarginPercent >= 20) fPts += 15;
      else if (fundamentals.operatingMarginPercent >= 10) fPts += 10;
      else if (fundamentals.operatingMarginPercent > 0) fPts += 5;

      if (fundamentals.freeCashFlowCr > 0) fPts += 10;

      fundamentalScore = Math.min(100, Math.max(0, fPts));
    }

    // 2. Growth Score (0 - 100 scaled)
    let growthScore = 50;
    if (fundamentals) {
      let gPts = 0;
      const revCagr = fundamentals.revenueCagr3Yr || 0;
      const patCagr = fundamentals.profitCagr3Yr || 0;
      const epsCagr = fundamentals.epsCagr3Yr || 0;

      if (revCagr >= 30) gPts += 35;
      else if (revCagr >= 20) gPts += 28;
      else if (revCagr >= 12) gPts += 20;
      else if (revCagr > 0) gPts += 10;

      if (patCagr >= 30) gPts += 35;
      else if (patCagr >= 20) gPts += 28;
      else if (patCagr >= 12) gPts += 20;
      else if (patCagr > 0) gPts += 10;

      if (epsCagr >= 25) gPts += 30;
      else if (epsCagr >= 15) gPts += 22;
      else if (epsCagr > 0) gPts += 12;

      growthScore = Math.min(100, Math.max(0, gPts));
    }

    // 3. Momentum Score (0 - 100 scaled)
    let momentumScore = 50;
    {
      let mPts = 0;
      // Proximity to 52w high
      const range52 = stock.high52Week - stock.low52Week;
      if (range52 > 0) {
        const distFromLow = (stock.price - stock.low52Week) / range52;
        mPts += Math.round(distFromLow * 40); // 0-40 pts
      }
      // Daily change %
      if (stock.percentChange > 3) mPts += 25;
      else if (stock.percentChange > 1.5) mPts += 20;
      else if (stock.percentChange > 0) mPts += 15;
      else if (stock.percentChange > -1.5) mPts += 8;

      // Relative volume
      const rVol = stock.relativeVolume || (stock.volume / (stock.averageVolume30D || 1));
      if (rVol >= 1.5) mPts += 35;
      else if (rVol >= 1.2) mPts += 25;
      else if (rVol >= 1.0) mPts += 18;
      else mPts += 10;

      momentumScore = Math.min(100, Math.max(0, mPts));
    }

    // 4. Institutional Score (0 - 100 scaled)
    let institutionalScore = 50;
    const instObs = db.institutional.find((i) => i.symbol === stock.symbol);
    if (instObs) {
      institutionalScore = instObs.score;
    } else {
      // derive from shareholding if available
      const quarters = db.shareholding[stock.symbol];
      if (quarters && quarters.length >= 2) {
        const latest = quarters[quarters.length - 1];
        const prev = quarters[quarters.length - 2];
        const fiiDelta = latest.fii - prev.fii;
        const diiDelta = latest.dii - prev.dii;
        let pts = 50;
        if (fiiDelta > 0) pts += 15;
        if (diiDelta > 0) pts += 15;
        if (latest.fii + latest.dii > 40) pts += 20;
        institutionalScore = Math.min(100, Math.max(0, pts));
      }
    }

    // 5. News Score (0 - 100 scaled)
    let newsScore = 50;
    const relatedNews = db.news.filter((n) => n.symbol === stock.symbol);
    if (relatedNews.length > 0) {
      const pos = relatedNews.filter((n) => n.sentiment === 'POSITIVE').length;
      const neg = relatedNews.filter((n) => n.sentiment === 'NEGATIVE').length;
      if (pos > neg) newsScore = 75 + Math.min(25, pos * 10);
      else if (neg > pos) newsScore = 30 - Math.min(20, neg * 10);
      else newsScore = 55;
    }

    // 6. Sector Score (0 - 100 scaled)
    let sectorScore = 50;
    const sec = db.sectors.find((s) => stock.sector.toLowerCase().includes(s.sector.replace('NIFTY ', '').toLowerCase()));
    if (sec) {
      if (sec.trend === 'bullish') sectorScore = 75 + Math.min(20, Math.round(sec.percentChange * 10));
      else if (sec.trend === 'bearish') sectorScore = 35;
      else sectorScore = 55;
    }

    // 7. Risk Penalty (0 - Max configured)
    let riskPenalty = 0;
    if (valuation) {
      // High PE relative to growth
      if (valuation.peRatio && valuation.peRatio > 70 && (!valuation.pegRatio || valuation.pegRatio > 2.0)) {
        riskPenalty += 6;
      }
    }
    if (fundamentals) {
      if (fundamentals.debtToEquity > 1.5 && !stock.sector.includes('Bank') && !stock.sector.includes('Financial')) {
        riskPenalty += 5;
      }
      if (fundamentals.operatingMarginPercent < 5) {
        riskPenalty += 4;
      }
    }
    riskPenalty = Math.min(w.riskPenaltyMax, riskPenalty);

    // Weighted Overall Score:
    const totalWeights =
      w.fundamentalWeight +
      w.growthWeight +
      w.momentumWeight +
      w.institutionalWeight +
      w.newsWeight +
      w.sectorWeight;

    const rawWeighted =
      (fundamentalScore * w.fundamentalWeight +
        growthScore * w.growthWeight +
        momentumScore * w.momentumWeight +
        institutionalScore * w.institutionalWeight +
        newsScore * w.newsWeight +
        sectorScore * w.sectorWeight) /
      totalWeights;

    const overallScore = Math.round(Math.max(10, Math.min(99, rawWeighted - riskPenalty)));

    // Generate factor descriptions
    const majorPositives: string[] = [];
    const majorRisks: string[] = [];

    if (fundamentalScore >= 75) {
      majorPositives.push(`Strong balance sheet with RoE at ${fundamentals?.roePercent || 20}% and RoCE at ${fundamentals?.rocePercent || 25}%.`);
    }
    if (growthScore >= 75) {
      majorPositives.push(`High compounding pace with 3-year revenue CAGR of ${fundamentals?.revenueCagr3Yr || 25}%.`);
    }
    if (institutionalScore >= 80) {
      majorPositives.push(`Positive institutional absorption with FII & Mutual Fund ownership accumulation.`);
    }
    if (momentumScore >= 75) {
      majorPositives.push(`Firm price strength with above-average volume participation.`);
    }
    if (sectorScore >= 70) {
      majorPositives.push(`Sector tailwind in ${stock.sector} supporting structural business demand.`);
    }

    if (riskPenalty > 4) {
      majorRisks.push(`Valuation multiple (${valuation?.peRatio ? `${valuation.peRatio}x P/E` : 'Elevated'}) leaves limited margin of safety.`);
    }
    if (fundamentals && fundamentals.debtToEquity > 1.0 && !stock.sector.includes('Bank')) {
      majorRisks.push(`Debt-to-equity ratio of ${fundamentals.debtToEquity} requires continuous interest coverage monitoring.`);
    }
    if (stock.price > stock.high52Week * 0.95) {
      majorRisks.push(`Trading near 52-week peak; susceptible to broader market consolidation.`);
    }

    if (majorPositives.length === 0) {
      majorPositives.push('Steady market liquidity and established sectoral footprint.');
    }
    if (majorRisks.length === 0) {
      majorRisks.push('Macro interest rate cycles and general equity market volatility.');
    }

    const reasoning = `IndianShares calculates an overall score of ${overallScore}/100 based on fundamental quality (${fundamentalScore}/100), compounding growth (${growthScore}/100), and institutional posture (${institutionalScore}/100), offset by a ${riskPenalty} pt risk deduction.`;

    return {
      fundamentalScore,
      growthScore,
      momentumScore,
      institutionalScore,
      newsScore,
      sectorScore,
      riskPenalty,
      overallScore,
      confidence: 96,
      majorPositives,
      majorRisks,
      reasoning,
      timestamp: new Date().toISOString(),
    };
  }

  public static getRankedUniverse(weights?: ScoringWeights): (StockQuote & { scores: StockScoreBreakdown; rank: number })[] {
    const db = dbService.getDb();
    const w = weights || db.scoringWeights;

    // Filter candidate universe based on price criteria (configurable, defaults ₹10 to ₹2000)
    const eligibleStocks = db.stocks.filter((s) => s.price >= w.minPrice && s.price <= w.maxPrice);

    const scored = eligibleStocks.map((stock) => {
      const fund = db.fundamentals[stock.symbol];
      const val = db.valuation[stock.symbol];
      const scores = this.calculateStockScore(stock, fund, val, w);
      return {
        ...stock,
        scores,
        rank: 0,
      };
    });

    // Sort descending by overallScore
    scored.sort((a, b) => b.scores.overallScore - a.scores.overallScore);

    // Assign rank
    return scored.map((item, idx) => ({
      ...item,
      rank: idx + 1,
      scores: {
        ...item.scores,
        rank: idx + 1,
      },
    }));
  }

  public static getTop10(weights?: ScoringWeights): (StockQuote & { scores: StockScoreBreakdown; rank: number })[] {
    return this.getRankedUniverse(weights).slice(0, 10);
  }
}
