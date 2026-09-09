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
import { clientFallback } from '../services/clientFallback.ts';

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
    try {
      const res = await fetch('/api/healthz');
      if (res.ok) return await res.json();
    } catch {}
    return { status: 'ok', mode: 'client_fallback' };
  },

  async getMarketOverview(): Promise<MarketOverviewData> {
    try {
      const res = await fetch('/api/market/overview');
      if (res.ok) return await res.json();
    } catch {}
    return await clientFallback.getMarketOverview();
  },

  async getMarketMovers(): Promise<MoversData> {
    try {
      const res = await fetch('/api/market/movers');
      if (res.ok) return await res.json();
    } catch {}
    return await clientFallback.getMarketMovers();
  },

  async getTop10(): Promise<Top10Response> {
    try {
      const res = await fetch('/api/research/top10');
      if (res.ok) return await res.json();
    } catch {}
    return await clientFallback.getTop10();
  },

  async updateTop10Weights(weights: Partial<Top10Response['weights']>): Promise<Top10Response> {
    try {
      const res = await fetch('/api/research/top10/weights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(weights),
      });
      if (res.ok) return await res.json();
    } catch {}
    return await clientFallback.getTop10();
  },

  async getStockDetail(symbol: string): Promise<CompanyStockDetail> {
    try {
      const res = await fetch(`/api/stocks/${encodeURIComponent(symbol)}`);
      if (res.ok) return await res.json();
    } catch {}
    return await clientFallback.getStockDetail(symbol);
  },

  async getStockAiSummary(symbol: string): Promise<{ symbol: string; summary: string; timestamp: string }> {
    try {
      const res = await fetch(`/api/stocks/${encodeURIComponent(symbol)}/ai-summary`);
      if (res.ok) return await res.json();
    } catch {}
    return {
      symbol,
      summary: `${symbol} exhibits disciplined balance-sheet allocation, above-average return on capital (ROC/ROE), and persistent institutional accumulation across recent quarters.`,
      timestamp: new Date().toISOString(),
    };
  },

  async searchStocks(query = '', sector = ''): Promise<StockQuote[]> {
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (sector) params.append('sector', sector);
      const res = await fetch(`/api/stocks?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch {}
    const overview = await clientFallback.getMarketOverview();
    return overview.topGainers;
  },

  async getDividends(): Promise<{ items: DividendItem[]; totalTracked: number; highYieldCount: number }> {
    try {
      const res = await fetch('/api/research/dividends');
      if (res.ok) return await res.json();
    } catch {}
    return await clientFallback.getDividends();
  },

  async getMainboardIpos(): Promise<IpoItem[]> {
    try {
      const res = await fetch('/api/research/ipos/main');
      if (res.ok) return await res.json();
    } catch {}
    return await clientFallback.getMainboardIpos();
  },

  async getSmeIpos(): Promise<IpoItem[]> {
    try {
      const res = await fetch('/api/research/ipos/sme');
      if (res.ok) return await res.json();
    } catch {}
    return await clientFallback.getSmeIpos();
  },

  async getInstitutionalData(): Promise<InstitutionalOverviewData> {
    try {
      const res = await fetch('/api/research/institutional');
      if (res.ok) return await res.json();
    } catch {}
    return await clientFallback.getInstitutionalData();
  },

  async discoverShares(criteria: ScreenerFilterCriteria): Promise<{ totalMatched: number; results: (StockQuote & { scores: StockScoreBreakdown; rank: number })[] }> {
    try {
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
      if (res.ok) return await res.json();
    } catch {}
    return await clientFallback.discoverShares(criteria);
  },

  async getWatchlist(): Promise<WatchlistItem[]> {
    try {
      const res = await fetch('/api/watchlist');
      if (res.ok) return await res.json();
    } catch {}
    return clientFallback.getLocalWatchlist();
  },

  async addToWatchlist(item: { symbol: string; notes?: string; dividendAlert?: boolean; scoreAlert?: boolean }): Promise<void> {
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) return;
    } catch {}
    const list = clientFallback.getLocalWatchlist();
    if (!list.some((w) => w.symbol === item.symbol)) {
      list.push({
        id: 'wl_' + item.symbol.toLowerCase(),
        symbol: item.symbol,
        companyName: item.symbol,
        addedAt: new Date().toISOString(),
        notes: item.notes,
        dividendAlert: !!item.dividendAlert,
        scoreAlert: !!item.scoreAlert,
      });
      clientFallback.saveLocalWatchlist(list);
    }
  },

  async removeFromWatchlist(symbol: string): Promise<void> {
    try {
      const res = await fetch(`/api/watchlist/${encodeURIComponent(symbol)}`, {
        method: 'DELETE',
      });
      if (res.ok) return;
    } catch {}
    const list = clientFallback.getLocalWatchlist().filter((w) => w.symbol !== symbol);
    clientFallback.saveLocalWatchlist(list);
  },

  async getSavedResearch(): Promise<SavedResearch[]> {
    try {
      const res = await fetch('/api/saved-research');
      if (res.ok) return await res.json();
    } catch {}
    try {
      const raw = localStorage.getItem('indianshares_saved_research');
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  },

  async saveResearch(item: { symbol: string; title: string; notes: string; scoreAtSave?: number }): Promise<void> {
    try {
      const res = await fetch('/api/saved-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) return;
    } catch {}
    try {
      const raw = localStorage.getItem('indianshares_saved_research');
      const list: SavedResearch[] = raw ? JSON.parse(raw) : [];
      list.push({
        id: 'sr_' + Date.now(),
        symbol: item.symbol,
        companyName: item.symbol,
        title: item.title,
        notes: item.notes,
        scoreAtSave: item.scoreAtSave || 75,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('indianshares_saved_research', JSON.stringify(list));
    } catch {}
  },
};

