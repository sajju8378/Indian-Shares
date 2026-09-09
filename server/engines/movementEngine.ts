import { StockQuote } from '../../src/types/index.ts';
import { dbService } from '../db/database.ts';

export interface MarketMoverItem extends StockQuote {
  movementScore: number;
  possibleFactors: string[];
}

export class IndianSharesMovementEngine {
  public static getMovers(): {
    gainers: MarketMoverItem[];
    losers: MarketMoverItem[];
    volumeLeaders: MarketMoverItem[];
    unusualActivity: MarketMoverItem[];
  } {
    const db = dbService.getDb();
    const stocks = [...db.stocks];

    const enrich = (s: StockQuote): MarketMoverItem => {
      const possibleFactors: string[] = [];
      if (s.catalyst) {
        possibleFactors.push(s.catalyst);
      }
      const relatedNews = db.news.filter((n) => n.symbol === s.symbol);
      relatedNews.forEach((n) => {
        possibleFactors.push(`${n.eventType}: ${n.headline}`);
      });

      if (possibleFactors.length === 0) {
        possibleFactors.push('Market-wide sector rotation and institutional liquidity flows.');
      }

      // Movement score (0-100)
      const absChg = Math.abs(s.percentChange);
      const relVol = s.relativeVolume || 1.0;
      const movementScore = Math.min(99, Math.round(absChg * 12 + relVol * 25));

      return {
        ...s,
        movementScore,
        possibleFactors,
      };
    };

    const enriched = stocks.map(enrich);

    // Gainers: sorted by percentChange descending
    const gainers = [...enriched].sort((a, b) => b.percentChange - a.percentChange).slice(0, 6);

    // Losers: sorted by percentChange ascending
    const losers = [...enriched].sort((a, b) => a.percentChange - b.percentChange).slice(0, 6);

    // Volume Leaders: sorted by traded volume descending
    const volumeLeaders = [...enriched].sort((a, b) => b.volume - a.volume).slice(0, 6);

    // Unusual Activity: sorted by relative volume descending
    const unusualActivity = [...enriched]
      .filter((s) => (s.relativeVolume || 0) >= 1.2 || Math.abs(s.percentChange) >= 2.5)
      .sort((a, b) => (b.relativeVolume || 0) - (a.relativeVolume || 0))
      .slice(0, 6);

    return {
      gainers,
      losers,
      volumeLeaders,
      unusualActivity,
    };
  }
}
