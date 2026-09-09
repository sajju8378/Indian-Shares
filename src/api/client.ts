import {
  MarketIndex,
  MarketBreadth,
  SectorPerformance,
  StockQuote,
  CompanyStockDetail,
  DividendItem,
  IpoItem,
  InstitutionalObservation,
  NewsItem,
  WatchlistItem,
  SavedResearch,
  StockScoreBreakdown,
  ScreenerFilterCriteria,
} from '../types/index.ts';

export interface MarketOverviewData {
  indices: MarketIndex[];
  breadth: MarketBreadth;
  sectors: SectorPerformance[];
  topGainers: (StockQuote & { movementScore: number; possibleFactors: string[] })[];
  topLosers: (StockQuote & { movementScore: number; possibleFactors: string[] })[];
  recentNews: NewsItem[];
  timestamp: string;
}

export interface MoversData {
  gainers: (StockQuote & { movementScore: number; possibleFactors: string[] })[];
  losers: (StockQuote & { movementScore: number; possibleFactors: string[] })[];
  volumeLeaders: (StockQuote & { movementScore: number; possibleFactors: string[] })[];
  unusualActivity: (StockQuote & { movementScore: number; possibleFactors: string[] })[];
}

export interface Top10Response {
  universeCriteria: string;
  weights: {
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
  lastCalculated: string;
  stocks: (StockQuote & { scores: StockScoreBreakdown; rank: number })[];
}

export interface InstitutionalOverviewData {
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
}

export const apiClient = {
  async getHealthz() {
    const res = await fetch('/api/healthz');
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  async getMarketOverview(): Promise<MarketOverviewData> {
    const res = await fetch('/api/market/overview');
    if (!res.ok) throw new Error('Failed to fetch market overview');
    return res.json();
  },

  async getMarketMovers(): Promise<MoversData> {
    const res = await fetch('/api/market/movers');
    if (!res.ok) throw new Error('Failed to fetch market movers');
    return res.json();
  },

  async getTop10(): Promise<Top10Response> {
    const res = await fetch('/api/research/top10');
    if (!res.ok) throw new Error('Failed to fetch Top 10 IndianShares');
    return res.json();
  },

  async updateTop10Weights(weights: Partial<Top10Response['weights']>): Promise<Top10Response> {
    const res = await fetch('/api/research/top10/weights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(weights),
    });
    if (!res.ok) throw new Error('Failed to update scoring weights');
    return res.json();
  },

  async getStockDetail(symbol: string): Promise<CompanyStockDetail> {
    const res = await fetch(`/api/stocks/${encodeURIComponent(symbol)}`);
    if (!res.ok) throw new Error(`Failed to fetch stock detail for ${symbol}`);
    return res.json();
  },

  async getStockAiSummary(symbol: string): Promise<{ symbol: string; summary: string; timestamp: string }> {
    const res = await fetch(`/api/stocks/${encodeURIComponent(symbol)}/ai-summary`);
    if (!res.ok) throw new Error(`Failed to generate AI research summary for ${symbol}`);
    return res.json();
  },

  async searchStocks(query = '', sector = ''): Promise<StockQuote[]> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (sector) params.append('sector', sector);
    const res = await fetch(`/api/stocks?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to search stocks');
    return res.json();
  },

  async getDividends(): Promise<{ items: DividendItem[]; totalTracked: number; highYieldCount: number }> {
    const res = await fetch('/api/research/dividends');
    if (!res.ok) throw new Error('Failed to fetch dividend research');
    return res.json();
  },

  async getMainboardIpos(): Promise<IpoItem[]> {
    const res = await fetch('/api/research/ipos/main');
    if (!res.ok) throw new Error('Failed to fetch mainboard IPOs');
    return res.json();
  },

  async getSmeIpos(): Promise<IpoItem[]> {
    const res = await fetch('/api/research/ipos/sme');
    if (!res.ok) throw new Error('Failed to fetch SME IPOs');
    return res.json();
  },

  async getInstitutionalData(): Promise<InstitutionalOverviewData> {
    const res = await fetch('/api/research/institutional');
    if (!res.ok) throw new Error('Failed to fetch institutional advice');
    return res.json();
  },

  async discoverShares(criteria: ScreenerFilterCriteria): Promise<{ totalMatched: number; results: (StockQuote & { scores: StockScoreBreakdown; rank: number })[] }> {
    const params = new URLSearchParams();
    if (criteria.minPrice !== undefined) params.append('minPrice', criteria.minPrice.toString());
    if (criteria.maxPrice !== undefined) params.append('maxPrice', criteria.maxPrice.toString());
    if (criteria.sector) params.append('sector', criteria.sector);
    if (criteria.maxPe !== undefined) params.append('maxPe', criteria.maxPe.toString());
    if (criteria.minRoe !== undefined) params.append('minRoe', criteria.minRoe.toString());
    if (criteria.minRoce !== undefined) params.append('minRoce', criteria.minRoce.toString());
    if (criteria.maxDebtToEquity !== undefined) params.append('maxDebt', criteria.maxDebtToEquity.toString());
    if (criteria.minIndianSharesScore !== undefined) params.append('minScore', criteria.minIndianSharesScore.toString());
    if (criteria.minDividendYield !== undefined) params.append('minYield', criteria.minDividendYield.toString());

    const res = await fetch(`/api/research/discover?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to screen shares');
    return res.json();
  },

  async getWatchlist(): Promise<WatchlistItem[]> {
    const res = await fetch('/api/watchlist');
    if (!res.ok) throw new Error('Failed to fetch watchlist');
    return res.json();
  },

  async addToWatchlist(item: { symbol: string; notes?: string; dividendAlert?: boolean; scoreAlert?: boolean }): Promise<void> {
    const res = await fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to update watchlist');
  },

  async removeFromWatchlist(symbol: string): Promise<void> {
    const res = await fetch(`/api/watchlist/${encodeURIComponent(symbol)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete from watchlist');
  },

  async getSavedResearch(): Promise<SavedResearch[]> {
    const res = await fetch('/api/saved-research');
    if (!res.ok) throw new Error('Failed to fetch saved research');
    return res.json();
  },

  async saveResearch(item: { symbol: string; title: string; notes: string; scoreAtSave?: number }): Promise<void> {
    const res = await fetch('/api/saved-research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to save research');
  },
};
