import {
  StockQuote,
  Fundamentals,
  ValuationMetrics,
  ShareholdingQuarter,
  CorporateAction,
  DividendItem,
  IpoItem,
  InstitutionalObservation,
  NewsItem,
  MarketIndex,
  MarketBreadth,
  SectorPerformance,
  WatchlistItem,
  SavedResearch,
  StockScoreBreakdown,
  ScreenerFilterCriteria,
  CompanyStockDetail,
} from '../types/index.ts';
import {
  MarketOverviewData,
  MoversData,
  Top10Response,
  InstitutionalOverviewData,
} from '../api/client.ts';

export interface DbSchema {
  version: number;
  lastUpdated: string;
  indices: MarketIndex[];
  breadth: MarketBreadth;
  sectors: SectorPerformance[];
  stocks: StockQuote[];
  fundamentals: Record<string, Fundamentals>;
  valuation: Record<string, ValuationMetrics>;
  shareholding: Record<string, ShareholdingQuarter[]>;
  corporateActions: CorporateAction[];
  dividends: DividendItem[];
  ipos: IpoItem[];
  institutional: InstitutionalObservation[];
  news: NewsItem[];
  scoringWeights: {
    fundamentalWeight: number;
    growthWeight: number;
    momentumWeight: number;
    institutionalWeight: number;
    newsWeight: number;
    sectorWeight: number;
    riskPenaltyMax: number;
    minPrice: number;
    maxPrice: number;
  };
  watchlists: WatchlistItem[];
  savedResearch: SavedResearch[];
}

class ClientFallbackService {
  private db: DbSchema | null = null;
  private loadPromise: Promise<DbSchema> | null = null;

  private async loadDb(): Promise<DbSchema> {
    if (this.db) return this.db;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      try {
        const res = await fetch('./data/indianshares_db.json');
        if (res.ok) {
          this.db = await res.json();
          return this.db!;
        }
      } catch {}

      try {
        const res2 = await fetch('/data/indianshares_db.json');
        if (res2.ok) {
          this.db = await res2.json();
          return this.db!;
        }
      } catch {}

      throw new Error('Static dataset unavailable');
    })();

    return this.loadPromise;
  }

  public async getMarketOverview(): Promise<MarketOverviewData> {
    const db = await this.loadDb();
    const sortedMovers = [...db.stocks].sort((a, b) => b.percentChange - a.percentChange);
    const topGainers = sortedMovers.slice(0, 5).map((s) => ({
      ...s,
      movementScore: Math.abs(Math.round(s.percentChange * 12)),
      possibleFactors: ['Strong quarterly results', 'Institutional accumulation'],
    }));
    const topLosers = sortedMovers
      .slice(-5)
      .reverse()
      .map((s) => ({
        ...s,
        movementScore: Math.abs(Math.round(s.percentChange * 12)),
        possibleFactors: ['Profit booking', 'Sectoral profit taking'],
      }));

    return {
      indices: db.indices,
      breadth: db.breadth,
      sectors: db.sectors,
      topGainers,
      topLosers,
      recentNews: db.news,
      timestamp: db.lastUpdated,
    };
  }

  public async getMarketMovers(): Promise<MoversData> {
    const db = await this.loadDb();
    const sorted = [...db.stocks].sort((a, b) => b.percentChange - a.percentChange);
    const gainers = sorted.slice(0, 8).map((s) => ({
      ...s,
      movementScore: Math.abs(Math.round(s.percentChange * 12)),
      possibleFactors: ['Strong quarterly results', 'Positive brokerage upgrade'],
    }));
    const losers = sorted
      .slice(-8)
      .reverse()
      .map((s) => ({
        ...s,
        movementScore: Math.abs(Math.round(s.percentChange * 12)),
        possibleFactors: ['Sector headwinds', 'Profit booking'],
      }));
    const volumeLeaders = [...db.stocks]
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 8)
      .map((s) => ({
        ...s,
        movementScore: 75,
        possibleFactors: ['Heavy institutional turnover', 'Index rebalancing'],
      }));
    const unusualActivity = [...db.stocks]
      .filter((s) => Math.abs(s.percentChange) > 3)
      .map((s) => ({
        ...s,
        movementScore: 88,
        possibleFactors: ['Delivery surge', 'Breakout momentum'],
      }));

    return { gainers, losers, volumeLeaders, unusualActivity };
  }

  public calculateScore(
    stock: StockQuote,
    fundamentals?: Fundamentals,
    weights?: DbSchema['scoringWeights']
  ): StockScoreBreakdown {
    let fundamentalScore = 65;
    if (fundamentals) {
      let pts = 0;
      if (fundamentals.roePercent >= 20) pts += 35;
      else if (fundamentals.roePercent >= 12) pts += 20;
      if (fundamentals.debtToEquity <= 0.5) pts += 35;
      else if (fundamentals.debtToEquity <= 1.0) pts += 20;
      if (fundamentals.operatingMarginPercent >= 15) pts += 30;
      fundamentalScore = pts;
    }

    let growthScore = 70;
    if (fundamentals) {
      let g = 0;
      if ((fundamentals.profitCagr3Yr || 0) >= 20) g += 50;
      else if ((fundamentals.profitCagr3Yr || 0) > 0) g += 30;
      if ((fundamentals.revenueCagr3Yr || 0) >= 15) g += 50;
      else if ((fundamentals.revenueCagr3Yr || 0) > 0) g += 30;
      growthScore = g;
    }

    const momentumScore = stock.percentChange >= 0 ? 75 : 45;
    const institutionalScore = 80;
    const newsScore = 70;
    const sectorScore = 72;

    const w = weights || {
      fundamentalWeight: 25,
      growthWeight: 20,
      momentumWeight: 15,
      institutionalWeight: 20,
      newsWeight: 10,
      sectorWeight: 10,
      riskPenaltyMax: 20,
      minPrice: 10,
      maxPrice: 2000,
    };

    const weightedScore =
      (fundamentalScore * w.fundamentalWeight +
        growthScore * w.growthWeight +
        momentumScore * w.momentumWeight +
        institutionalScore * w.institutionalWeight +
        newsScore * w.newsWeight +
        sectorScore * w.sectorWeight) /
      100;

    return {
      fundamentalScore,
      growthScore,
      momentumScore,
      institutionalScore,
      newsScore,
      sectorScore,
      riskPenalty: 5,
      overallScore: Math.round(weightedScore),
      confidence: 88,
      rank: 1,
      majorPositives: ['High capital return efficiency', 'Consistent institutional support'],
      majorRisks: ['Valuation at upper historical range'],
      reasoning: 'Strong multi-pillar balance sheet and steady earnings momentum.',
      timestamp: new Date().toISOString(),
    };
  }

  public async getTop10(): Promise<Top10Response> {
    const db = await this.loadDb();
    const weights = db.scoringWeights;

    const eligible = db.stocks.filter((s) => {
      const price = s.price;
      return price >= weights.minPrice && price <= weights.maxPrice;
    });

    const scored = eligible.map((stock) => {
      const fund = db.fundamentals[stock.symbol];
      const scores = this.calculateScore(stock, fund, weights);
      return {
        ...stock,
        scores,
        rank: 0,
      };
    });

    scored.sort((a, b) => b.scores.overallScore - a.scores.overallScore);

    const top10 = scored.slice(0, 10).map((item, idx) => ({
      ...item,
      rank: idx + 1,
      scores: { ...item.scores, rank: idx + 1 },
    }));

    return {
      universeCriteria: `Price ₹${weights.minPrice} - ₹${weights.maxPrice}`,
      weights,
      lastCalculated: db.lastUpdated,
      stocks: top10,
    };
  }

  public async getStockDetail(symbol: string): Promise<CompanyStockDetail> {
    const db = await this.loadDb();
    const sym = symbol.toUpperCase();
    const quote = db.stocks.find((s) => s.symbol.toUpperCase() === sym) || db.stocks[0];
    const fundamentals = db.fundamentals[sym] || db.fundamentals['RELIANCE'];
    const valuation = db.valuation[sym] || db.valuation['RELIANCE'];
    const shareholding = db.shareholding[sym] || [];
    const corporateActions = db.corporateActions.filter((c) => c.symbol.toUpperCase() === sym);
    const relatedNews = db.news.filter((n) => n.symbol?.toUpperCase() === sym);
    const dividends = db.dividends.filter((d) => d.symbol.toUpperCase() === sym);

    return {
      quote,
      fundamentals,
      valuation,
      shareholding,
      corporateActions,
      dividends,
      news: relatedNews,
      scores: this.calculateScore(quote, fundamentals, db.scoringWeights),
    };
  }

  public async getDividends() {
    const db = await this.loadDb();
    const items = db.dividends;
    return {
      items,
      totalTracked: items.length,
      highYieldCount: items.filter((d) => d.dividendYield >= 3.0).length,
    };
  }

  public async getMainboardIpos() {
    const db = await this.loadDb();
    return db.ipos.filter((i) => i.ipoType === 'MAINBOARD');
  }

  public async getSmeIpos() {
    const db = await this.loadDb();
    return db.ipos.filter((i) => i.ipoType === 'SME');
  }

  public async getInstitutionalData(): Promise<InstitutionalOverviewData> {
    const db = await this.loadDb();
    const observations = db.institutional;
    const netAccumulationCount = observations.filter((o) => o.direction === 'ACCUMULATION').length;
    const netPositiveCount = observations.filter((o) => o.direction === 'POSITIVE').length;
    const neutralCount = observations.filter((o) => o.direction === 'NEUTRAL').length;
    const cautionCount = observations.filter((o) => o.direction === 'CAUTION').length;
    const distributionCount = observations.filter((o) => o.direction === 'DISTRIBUTION').length;

    return {
      observations,
      summary: {
        netAccumulationCount,
        netPositiveCount,
        neutralCount,
        cautionCount,
        distributionCount,
        overallSentiment: 'ACCUMULATING',
        fiiQuarterlyTrendComment: 'FIIs demonstrating strategic net accumulation in domestic demand leaders.',
        diiQuarterlyTrendComment: 'Domestic mutual funds providing sustained liquidity absorption.',
      },
    };
  }

  public async discoverShares(criteria: ScreenerFilterCriteria) {
    const db = await this.loadDb();
    let matches = db.stocks.map((stock) => {
      const fund = db.fundamentals[stock.symbol];
      const val = db.valuation[stock.symbol];
      const score = this.calculateScore(stock, fund, db.scoringWeights);
      return { stock, fund, val, score };
    });

    if (criteria.minPrice !== undefined) matches = matches.filter((m) => m.stock.price >= criteria.minPrice!);
    if (criteria.maxPrice !== undefined) matches = matches.filter((m) => m.stock.price <= criteria.maxPrice!);
    if (criteria.sector) matches = matches.filter((m) => m.stock.sector.toLowerCase() === criteria.sector!.toLowerCase());
    if (criteria.maxPe !== undefined) matches = matches.filter((m) => (m.val?.peRatio || 999) <= criteria.maxPe!);
    if (criteria.minRoe !== undefined) matches = matches.filter((m) => (m.fund?.roePercent || 0) >= criteria.minRoe!);
    if (criteria.minRoce !== undefined) matches = matches.filter((m) => (m.fund?.rocePercent || 0) >= criteria.minRoce!);
    if (criteria.maxDebtToEquity !== undefined) matches = matches.filter((m) => (m.fund?.debtToEquity || 99) <= criteria.maxDebtToEquity!);
    if (criteria.minIndianSharesScore !== undefined) matches = matches.filter((m) => m.score.overallScore >= criteria.minIndianSharesScore!);

    const results = matches.map((m, idx) => ({
      ...m.stock,
      scores: m.score,
      rank: idx + 1,
    }));

    return {
      totalMatched: results.length,
      results,
    };
  }

  public getLocalWatchlist(): WatchlistItem[] {
    try {
      const raw = localStorage.getItem('indianshares_watchlist');
      if (raw) return JSON.parse(raw);
    } catch {}
    return [
      {
        id: 'wl_trent',
        symbol: 'TRENT',
        companyName: 'Trent Ltd',
        addedAt: new Date().toISOString(),
        notes: 'Retail compounding leader',
        dividendAlert: true,
        scoreAlert: true,
      },
      {
        id: 'wl_polycab',
        symbol: 'POLYCAB',
        companyName: 'Polycab India Ltd',
        addedAt: new Date().toISOString(),
        notes: 'Cables & infrastructure momentum',
        dividendAlert: true,
        scoreAlert: true,
      },
    ];
  }

  public saveLocalWatchlist(list: WatchlistItem[]) {
    try {
      localStorage.setItem('indianshares_watchlist', JSON.stringify(list));
    } catch {}
  }
}

export const clientFallback = new ClientFallbackService();
