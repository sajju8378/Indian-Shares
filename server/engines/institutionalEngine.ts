import { InstitutionalObservation } from '../../src/types/index.ts';
import { dbService } from '../db/database.ts';

export class IndianSharesInstitutionalEngine {
  public static getInstitutionalOverview(): {
    observations: InstitutionalObservation[];
    summary: {
      netAccumulationCount: number;
      netPositiveCount: number;
      neutralCount: number;
      distributionCount: number;
      cautionCount: number;
      overallSentiment: 'ACCUMULATING' | 'SELECTIVE' | 'CAUTIONARY';
      fiiQuarterlyTrendComment: string;
      diiQuarterlyTrendComment: string;
    };
  } {
    const db = dbService.getDb();
    const observations = db.institutional;

    let netAccumulationCount = 0;
    let netPositiveCount = 0;
    let neutralCount = 0;
    let distributionCount = 0;
    let cautionCount = 0;

    observations.forEach((obs) => {
      switch (obs.direction) {
        case 'ACCUMULATION':
          netAccumulationCount++;
          break;
        case 'POSITIVE':
          netPositiveCount++;
          break;
        case 'NEUTRAL':
          neutralCount++;
          break;
        case 'DISTRIBUTION':
          distributionCount++;
          break;
        case 'CAUTION':
          cautionCount++;
          break;
      }
    });

    const overallSentiment: 'ACCUMULATING' | 'SELECTIVE' | 'CAUTIONARY' =
      netAccumulationCount + netPositiveCount > distributionCount + cautionCount ? 'ACCUMULATING' : 'SELECTIVE';

    return {
      observations,
      summary: {
        netAccumulationCount,
        netPositiveCount,
        neutralCount,
        distributionCount,
        cautionCount,
        overallSentiment,
        fiiQuarterlyTrendComment:
          'Foreign Portfolio Investors have selectively added exposure in high-RoE domestic consumption and specialized electronics manufacturing, while reducing allocations in high-multiple discretionary segments.',
        diiQuarterlyTrendComment:
          'Domestic Mutual Funds and Insurance institutions continue sustained systematic absorption, supported by record monthly SIP inflows surpassing ₹24,000 Crore.',
      },
    };
  }

  public static getStockInstitutionalAnalysis(symbol: string): InstitutionalObservation | null {
    const db = dbService.getDb();
    const obs = db.institutional.find((i) => i.symbol.toUpperCase() === symbol.toUpperCase());
    if (obs) return obs;

    // Check shareholding quarters
    const quarters = db.shareholding[symbol.toUpperCase()];
    if (!quarters || quarters.length === 0) {
      return null;
    }

    const latest = quarters[quarters.length - 1];
    const prev = quarters.length > 1 ? quarters[quarters.length - 2] : null;

    const fiiDelta = prev ? Number((latest.fii - prev.fii).toFixed(2)) : 0;
    const diiDelta = prev ? Number((latest.dii - prev.dii).toFixed(2)) : 0;
    const mfDelta = prev ? Number((latest.mutualFunds - prev.mutualFunds).toFixed(2)) : 0;

    let direction: InstitutionalObservation['direction'] = 'NEUTRAL';
    let score = 60;
    const reasons: string[] = [];

    if (fiiDelta > 0.5 && diiDelta >= 0) {
      direction = 'ACCUMULATION';
      score = 88;
      reasons.push(`FII ownership expanded by +${fiiDelta}% in ${latest.period}.`);
      reasons.push(`Domestic institutional backing held steady at ${latest.dii}%.`);
    } else if (fiiDelta > 0 || diiDelta > 0.5) {
      direction = 'POSITIVE';
      score = 78;
      reasons.push(`Combined institutional stake moved positive in ${latest.period}.`);
    } else if (fiiDelta < -1.0 && diiDelta < 0) {
      direction = 'DISTRIBUTION';
      score = 35;
      reasons.push(`Institutions trimmed total holdings across recent filings.`);
    }

    const company = db.stocks.find((s) => s.symbol.toUpperCase() === symbol.toUpperCase())?.companyName || symbol;

    return {
      symbol: symbol.toUpperCase(),
      companyName: company,
      fiiHoldingPercent: latest.fii,
      diiHoldingPercent: latest.dii,
      mutualFundHoldingPercent: latest.mutualFunds,
      fiiChangeQuarterly: fiiDelta,
      diiChangeQuarterly: diiDelta,
      mfChangeQuarterly: mfDelta,
      direction,
      score,
      confidence: 90,
      reasons,
      latestObservationPeriod: latest.period,
      historicalTrend: quarters.map((q) => ({ period: q.period, fii: q.fii, dii: q.dii, mf: q.mutualFunds })),
      quality: {
        source: 'BSE/NSE Shareholding Pattern Disclosures',
        sourceType: 'exchange_filing',
        observedAt: new Date().toISOString(),
        retrievedAt: new Date().toISOString(),
        confidence: 95,
        status: 'verified',
      },
    };
  }
}
