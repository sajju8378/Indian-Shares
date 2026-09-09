// IndianShares Core Data Models & API Types

export type DataStatus = 'verified' | 'estimated' | 'unavailable' | 'stale';

export interface DataQualityMeta {
  source: string;
  sourceType: 'exchange_filing' | 'official_feed' | 'verified_feed' | 'indicative_market';
  observedAt: string;
  retrievedAt: string;
  confidence: number; // 0 to 100
  status: DataStatus;
}

export interface MarketIndex {
  id: string;
  symbol: string;
  name: string;
  currentValue: number;
  change: number;
  percentChange: number;
  previousClose: number;
  dayHigh: number;
  dayLow: number;
  marketStatus: 'OPEN' | 'CLOSED' | 'PRE-OPEN';
  timestamp: string;
  quality: DataQualityMeta;
}

export interface MarketBreadth {
  advances: number;
  declines: number;
  unchanged: number;
  advanceDeclineRatio: number;
  totalTraded: number;
  updatedAt: string;
  quality: DataQualityMeta;
}

export interface SectorPerformance {
  sector: string;
  percentChange: number;
  trend: 'bullish' | 'neutral' | 'bearish';
  leadingStocks: { symbol: string; change: number }[];
  laggingStocks: { symbol: string; change: number }[];
  updatedAt: string;
}

export interface Fundamentals {
  revenueCr: number;
  ebitdaCr: number;
  operatingProfitCr: number;
  netProfitCr: number;
  eps: number;
  operatingMarginPercent: number;
  netMarginPercent: number;
  roePercent: number;
  rocePercent: number;
  debtToEquity: number;
  operatingCashFlowCr: number;
  freeCashFlowCr: number;
  revenueCagr3Yr?: number;
  profitCagr3Yr?: number;
  epsCagr3Yr?: number;
}

export interface ValuationMetrics {
  peRatio?: number;
  industryPe?: number;
  pbRatio?: number;
  evToEbitda?: number;
  pegRatio?: number;
  dividendYield?: number;
  bookValue?: number;
}

export interface ShareholdingQuarter {
  period: string; // e.g., "Q1 FY25", "Q2 FY25", "Q3 FY25", "Q4 FY25"
  promoter: number;
  fii: number;
  dii: number;
  mutualFunds: number;
  public: number;
  pledgedPromoterPercent?: number;
}

export interface CorporateAction {
  id: string;
  symbol: string;
  type: 'DIVIDEND' | 'SPLIT' | 'BONUS' | 'RIGHTS' | 'BUYBACK';
  details: string;
  announcementDate: string;
  exDate?: string;
  recordDate?: string;
  status: 'DECLARED' | 'EXECUTED' | 'PROPOSED';
}

export interface DividendItem {
  id: string;
  symbol: string;
  companyName: string;
  amountPerShare: number;
  dividendType: 'INTERIM' | 'FINAL' | 'SPECIAL';
  announcementDate: string;
  exDate: string;
  recordDate: string;
  paymentDate?: string;
  dividendYield: number;
  payoutRatio?: number;
  isConfirmed: boolean; // false for expected/estimated
  status: 'DECLARED' | 'EXPECTED' | 'HISTORICAL';
  dividendScore?: {
    score: number;
    rating: 'Strong' | 'Good' | 'Average' | 'Weak' | 'Unavailable';
    consistency: string;
    growthQuality: string;
    payoutSustainability: string;
    cashFlowSupport: string;
  };
}

export interface StockQuote {
  symbol: string;
  companyName: string;
  isin: string;
  sector: string;
  industry: string;
  price: number;
  change: number;
  percentChange: number;
  volume: number;
  averageVolume30D: number;
  relativeVolume?: number;
  marketCapCr: number;
  capCategory: 'Large Cap' | 'Mid Cap' | 'Small Cap';
  high52Week: number;
  low52Week: number;
  openPrice: number;
  previousClose: number;
  dayHigh: number;
  dayLow: number;
  quality: DataQualityMeta;
  catalyst?: string;
}

export interface StockScoreBreakdown {
  fundamentalScore: number;
  growthScore: number;
  momentumScore: number;
  institutionalScore: number;
  newsScore: number;
  sectorScore: number;
  riskPenalty: number;
  overallScore: number; // 0 - 100
  rank?: number;
  confidence: number;
  majorPositives: string[];
  majorRisks: string[];
  reasoning: string;
  timestamp: string;
}

export interface CompanyStockDetail {
  quote: StockQuote;
  fundamentals: Fundamentals;
  valuation: ValuationMetrics;
  shareholding: ShareholdingQuarter[];
  corporateActions: CorporateAction[];
  dividends: DividendItem[];
  news: NewsItem[];
  scores: StockScoreBreakdown;
  aiResearchSummary?: string;
  aiGeneratedAt?: string;
}

export interface InstitutionalObservation {
  symbol: string;
  companyName: string;
  fiiHoldingPercent: number;
  diiHoldingPercent: number;
  mutualFundHoldingPercent: number;
  fiiChangeQuarterly: number; // in percentage points
  diiChangeQuarterly: number;
  mfChangeQuarterly: number;
  direction: 'ACCUMULATION' | 'POSITIVE' | 'NEUTRAL' | 'DISTRIBUTION' | 'CAUTION' | 'UNAVAILABLE';
  score: number; // 0 - 100
  confidence: number;
  reasons: string[];
  latestObservationPeriod: string;
  historicalTrend: { period: string; fii: number; dii: number; mf: number }[];
  quality: DataQualityMeta;
}

export interface IpoSubscriptionCategory {
  category: 'QIB' | 'NII' | 'Retail' | 'Employee' | 'Total';
  sharesOffered: number;
  sharesBid: number;
  timesSubscribed: number;
  updatedAt: string;
}

export interface GmpObservation {
  id: string;
  ipoId: string;
  gmpValue: number;
  previousGmp?: number;
  trend: 'UP' | 'DOWN' | 'FLAT';
  changeAmount: number;
  estimatedListingPrice: number;
  estimatedPremiumPercent: number;
  observedAt: string;
  source: string;
  sourceConfidence: number;
}

export interface IpoItem {
  id: string;
  symbol?: string;
  companyName: string;
  ipoType: 'MAINBOARD' | 'SME';
  openDate: string;
  closeDate: string;
  listingDate?: string;
  priceBandMin: number;
  priceBandMax: number;
  lotSize: number;
  minInvestment: number;
  issueSizeCr: number;
  freshIssueCr: number;
  ofsCr: number;
  faceValue: number;
  status: 'UPCOMING' | 'OPEN' | 'CLOSED' | 'LISTED';
  subscriptions: IpoSubscriptionCategory[];
  latestGmp?: GmpObservation;
  gmpHistory: GmpObservation[];
  scores?: {
    demandScore: number;
    gmpSupportScore: {
      score: number;
      category: 'Strong Positive Support' | 'Positive Support' | 'Neutral' | 'Weak' | 'Negative' | 'Unavailable';
      summary: string;
    };
    overallIpoScore?: {
      total: number;
      business: number;
      financials: number;
      valuation: number;
      subscription: number;
      gmpSupport: number;
      marketSector: number;
      riskLevel: 'Low' | 'Medium' | 'High';
    };
  };
  quality: DataQualityMeta;
}

export interface NewsItem {
  id: string;
  symbol?: string;
  companyName?: string;
  headline: string;
  summary: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  eventType:
    | 'Results'
    | 'Order wins'
    | 'Management changes'
    | 'Regulatory'
    | 'Debt'
    | 'Acquisition'
    | 'Merger'
    | 'Dividend'
    | 'Buyback'
    | 'Fund raising'
    | 'Promoter activity'
    | 'Sector events'
    | 'Government policy';
  source: string;
  publishedAt: string;
  sourceUrl?: string;
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  companyName: string;
  addedAt: string;
  notes?: string;
  targetPriceAlert?: number;
  dividendAlert: boolean;
  scoreAlert: boolean;
}

export interface SavedResearch {
  id: string;
  symbol: string;
  companyName: string;
  title: string;
  notes: string;
  createdAt: string;
  scoreAtSave: number;
}

export interface ScreenerFilterCriteria {
  minPrice?: number;
  maxPrice?: number;
  capCategory?: string;
  sector?: string;
  maxPe?: number;
  minRoe?: number;
  minRoce?: number;
  maxDebtToEquity?: number;
  minProfitGrowth?: number;
  minDividendYield?: number;
  minIndianSharesScore?: number;
  minInstitutionalHolding?: number;
}
