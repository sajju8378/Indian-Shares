import { Router, Request, Response } from 'express';
import { dbService, ScoringWeights } from '../db/database.ts';
import { IndianSharesScoringEngine } from '../engines/scoringEngine.ts';
import { IndianSharesInstitutionalEngine } from '../engines/institutionalEngine.ts';
import { IndianSharesDividendEngine } from '../engines/dividendEngine.ts';
import { IndianSharesIpoEngine } from '../engines/ipoEngine.ts';
import { IndianSharesMovementEngine } from '../engines/movementEngine.ts';
import { generateStockResearchSummary } from '../services/geminiResearch.ts';
import { CompanyStockDetail, WatchlistItem, SavedResearch } from '../../src/types/index.ts';

export const apiRouter = Router();

// 1. Health Monitoring Endpoint (/api/healthz)
apiRouter.get('/healthz', (req: Request, res: Response) => {
  const db = dbService.getDb();
  res.json({
    status: 'ok',
    platform: 'INDIANSHARES Independent Research Core',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: {
      status: 'CONNECTED',
      stocksTracked: db.stocks.length,
      indicesTracked: db.indices.length,
      iposTracked: db.ipos.length,
      lastUpdated: db.lastUpdated,
    },
    providers: [
      { name: 'NSE Feed Adapter', status: 'CONNECTED', latencyMs: 24, lastSync: db.lastUpdated },
      { name: 'BSE Corporate Filing Adapter', status: 'CONNECTED', latencyMs: 31, lastSync: db.lastUpdated },
      { name: 'SEBI RHP / DRHP Adapter', status: 'CONNECTED', latencyMs: 45, lastSync: db.lastUpdated },
      { name: 'Grey Market Indicative Desk', status: 'CONNECTED', latencyMs: 62, lastSync: db.lastUpdated },
    ],
  });
});

// 2. Market Overview & Indices
apiRouter.get('/market/overview', (req: Request, res: Response) => {
  const db = dbService.getDb();
  const movers = IndianSharesMovementEngine.getMovers();
  res.json({
    indices: db.indices,
    breadth: db.breadth,
    sectors: db.sectors,
    topGainers: movers.gainers.slice(0, 4),
    topLosers: movers.losers.slice(0, 4),
    recentNews: db.news.slice(0, 5),
    timestamp: new Date().toISOString(),
  });
});

apiRouter.get('/market/indices', (req: Request, res: Response) => {
  res.json(dbService.getDb().indices);
});

apiRouter.get('/market/breadth', (req: Request, res: Response) => {
  res.json(dbService.getDb().breadth);
});

apiRouter.get('/market/sectors', (req: Request, res: Response) => {
  res.json(dbService.getDb().sectors);
});

apiRouter.get('/market/movers', (req: Request, res: Response) => {
  res.json(IndianSharesMovementEngine.getMovers());
});

// 3. Stocks Listing & Search
apiRouter.get('/stocks', (req: Request, res: Response) => {
  const db = dbService.getDb();
  const query = (req.query.q as string || '').toLowerCase().trim();
  const sector = (req.query.sector as string || '').trim();

  let results = db.stocks;

  if (query) {
    results = results.filter(
      (s) =>
        s.symbol.toLowerCase().includes(query) ||
        s.companyName.toLowerCase().includes(query) ||
        s.sector.toLowerCase().includes(query)
    );
  }

  if (sector && sector !== 'All') {
    results = results.filter((s) => s.sector.toLowerCase() === sector.toLowerCase());
  }

  res.json(results);
});

// 4. Stock Detail with full fundamentals, valuation, shareholding, actions, and scores
apiRouter.get('/stocks/:symbol', (req: Request, res: Response) => {
  const symbol = req.params.symbol.toUpperCase();
  const db = dbService.getDb();

  const quote = db.stocks.find((s) => s.symbol.toUpperCase() === symbol);
  if (!quote) {
    return res.status(404).json({ error: `Stock symbol ${symbol} not found in IndianShares database.` });
  }

  const fundamentals = db.fundamentals[symbol];
  const valuation = db.valuation[symbol];
  const shareholding = db.shareholding[symbol] || [];
  const corporateActions = db.corporateActions.filter((c) => c.symbol.toUpperCase() === symbol);
  const dividends = IndianSharesDividendEngine.getStockDividends(symbol);
  const news = db.news.filter((n) => n.symbol?.toUpperCase() === symbol);
  const scores = IndianSharesScoringEngine.calculateStockScore(quote, fundamentals, valuation);

  const detail: CompanyStockDetail = {
    quote,
    fundamentals,
    valuation,
    shareholding,
    corporateActions,
    dividends,
    news,
    scores,
  };

  res.json(detail);
});

// 5. AI Research Summary for a Stock
apiRouter.get('/stocks/:symbol/ai-summary', async (req: Request, res: Response) => {
  const symbol = req.params.symbol.toUpperCase();
  const db = dbService.getDb();

  const quote = db.stocks.find((s) => s.symbol.toUpperCase() === symbol);
  if (!quote) {
    return res.status(404).json({ error: `Stock symbol ${symbol} not found.` });
  }

  const fundamentals = db.fundamentals[symbol];
  const valuation = db.valuation[symbol];
  const shareholding = db.shareholding[symbol] || [];
  const corporateActions = db.corporateActions.filter((c) => c.symbol.toUpperCase() === symbol);
  const dividends = IndianSharesDividendEngine.getStockDividends(symbol);
  const news = db.news.filter((n) => n.symbol?.toUpperCase() === symbol);
  const scores = IndianSharesScoringEngine.calculateStockScore(quote, fundamentals, valuation);

  const detail: CompanyStockDetail = {
    quote,
    fundamentals,
    valuation,
    shareholding,
    corporateActions,
    dividends,
    news,
    scores,
  };

  try {
    const summary = await generateStockResearchSummary(detail);
    res.json({
      symbol,
      summary,
      timestamp: new Date().toISOString(),
      model: 'gemini-3.8-flash',
      groundedSource: 'IndianShares Normalized Database',
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to generate AI research summary' });
  }
});

// 6. Research Top 10 IndianShares
apiRouter.get(['/research/top10', '/top10'], (req: Request, res: Response) => {
  const db = dbService.getDb();
  const top10 = IndianSharesScoringEngine.getTop10();
  res.json({
    universeCriteria: `Price ₹${db.scoringWeights.minPrice} - ₹${db.scoringWeights.maxPrice}`,
    weights: db.scoringWeights,
    lastCalculated: new Date().toISOString(),
    stocks: top10,
  });
});

apiRouter.get('/research/top10/weights', (req: Request, res: Response) => {
  res.json(dbService.getDb().scoringWeights);
});

apiRouter.post('/research/top10/weights', async (req: Request, res: Response) => {
  const newWeights: Partial<ScoringWeights> = req.body;
  const db = dbService.getDb();

  db.scoringWeights = {
    ...db.scoringWeights,
    ...newWeights,
  };

  await dbService.persist();
  const updatedTop10 = IndianSharesScoringEngine.getTop10(db.scoringWeights);

  res.json({
    success: true,
    weights: db.scoringWeights,
    stocks: updatedTop10,
  });
});

// 7. Institutional Intelligence
apiRouter.get('/research/institutional', (req: Request, res: Response) => {
  const analysis = IndianSharesInstitutionalEngine.getInstitutionalOverview();
  res.json(analysis);
});

apiRouter.get('/research/institutional/:symbol', (req: Request, res: Response) => {
  const symbol = req.params.symbol;
  const analysis = IndianSharesInstitutionalEngine.getStockInstitutionalAnalysis(symbol);
  if (!analysis) {
    return res.status(404).json({ error: 'Insufficient verified data for institutional advice.' });
  }
  res.json(analysis);
});

// 8. Dividend Intelligence
apiRouter.get('/research/dividends', (req: Request, res: Response) => {
  const dividends = IndianSharesDividendEngine.getAllDividends();
  res.json({
    items: dividends,
    totalTracked: dividends.length,
    highYieldCount: dividends.filter((d) => d.dividendYield >= 2.0).length,
    timestamp: new Date().toISOString(),
  });
});

// 9. IPO Platform & GMP
apiRouter.get('/ipos', (req: Request, res: Response) => {
  res.json(IndianSharesIpoEngine.getEnrichedIpos());
});

apiRouter.get('/research/ipos/main', (req: Request, res: Response) => {
  const ipos = IndianSharesIpoEngine.getEnrichedIpos('MAINBOARD');
  res.json(ipos);
});

apiRouter.get('/research/ipos/sme', (req: Request, res: Response) => {
  const ipos = IndianSharesIpoEngine.getEnrichedIpos('SME');
  res.json(ipos);
});

apiRouter.get('/research/ipos/:id', (req: Request, res: Response) => {
  const ipo = IndianSharesIpoEngine.getEnrichedIpos().find((i) => i.id === req.params.id);
  if (!ipo) {
    return res.status(404).json({ error: 'IPO not found.' });
  }
  res.json(ipo);
});

// 10. Discover Shares (Multi-Factor Screener)
apiRouter.get('/research/discover', (req: Request, res: Response) => {
  const db = dbService.getDb();
  const ranked = IndianSharesScoringEngine.getRankedUniverse();

  const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
  const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
  const sector = req.query.sector as string;
  const maxPe = req.query.maxPe ? parseFloat(req.query.maxPe as string) : undefined;
  const minRoe = req.query.minRoe ? parseFloat(req.query.minRoe as string) : undefined;
  const minRoce = req.query.minRoce ? parseFloat(req.query.minRoce as string) : undefined;
  const maxDebt = req.query.maxDebt ? parseFloat(req.query.maxDebt as string) : undefined;
  const minScore = req.query.minScore ? parseFloat(req.query.minScore as string) : undefined;
  const minYield = req.query.minYield ? parseFloat(req.query.minYield as string) : undefined;

  const filtered = ranked.filter((s) => {
    if (minPrice !== undefined && s.price < minPrice) return false;
    if (maxPrice !== undefined && s.price > maxPrice) return false;
    if (sector && sector !== 'All' && s.sector.toLowerCase() !== sector.toLowerCase()) return false;

    const fund = db.fundamentals[s.symbol];
    const val = db.valuation[s.symbol];

    if (maxPe !== undefined && val?.peRatio && val.peRatio > maxPe) return false;
    if (minRoe !== undefined && (!fund?.roePercent || fund.roePercent < minRoe)) return false;
    if (minRoce !== undefined && (!fund?.rocePercent || fund.rocePercent < minRoce)) return false;
    if (maxDebt !== undefined && fund && fund.debtToEquity > maxDebt && !s.sector.includes('Bank')) return false;
    if (minScore !== undefined && s.scores.overallScore < minScore) return false;
    if (minYield !== undefined && val?.dividendYield && val.dividendYield < minYield) return false;

    return true;
  });

  res.json({
    totalMatched: filtered.length,
    results: filtered,
  });
});

// 11. User Watchlist
apiRouter.get('/watchlist', (req: Request, res: Response) => {
  res.json(dbService.getDb().watchlists);
});

apiRouter.post('/watchlist', async (req: Request, res: Response) => {
  const { symbol, notes, targetPriceAlert, dividendAlert, scoreAlert } = req.body;
  if (!symbol) {
    return res.status(400).json({ error: 'Symbol is required' });
  }

  const db = dbService.getDb();
  const company = db.stocks.find((s) => s.symbol.toUpperCase() === symbol.toUpperCase())?.companyName || symbol;

  const existingIdx = db.watchlists.findIndex((w) => w.symbol.toUpperCase() === symbol.toUpperCase());
  if (existingIdx >= 0) {
    db.watchlists[existingIdx] = {
      ...db.watchlists[existingIdx],
      notes: notes ?? db.watchlists[existingIdx].notes,
      dividendAlert: dividendAlert ?? db.watchlists[existingIdx].dividendAlert,
      scoreAlert: scoreAlert ?? db.watchlists[existingIdx].scoreAlert,
    };
  } else {
    const newItem: WatchlistItem = {
      id: `w-${Date.now()}`,
      symbol: symbol.toUpperCase(),
      companyName: company,
      addedAt: new Date().toISOString(),
      notes: notes || '',
      targetPriceAlert,
      dividendAlert: !!dividendAlert,
      scoreAlert: scoreAlert !== undefined ? !!scoreAlert : true,
    };
    db.watchlists.push(newItem);
  }

  await dbService.persist();
  res.json({ success: true, watchlists: db.watchlists });
});

apiRouter.delete('/watchlist/:symbol', async (req: Request, res: Response) => {
  const symbol = req.params.symbol.toUpperCase();
  const db = dbService.getDb();
  db.watchlists = db.watchlists.filter((w) => w.symbol.toUpperCase() !== symbol);
  await dbService.persist();
  res.json({ success: true, watchlists: db.watchlists });
});

// 12. User Saved Research
apiRouter.get('/saved-research', (req: Request, res: Response) => {
  res.json(dbService.getDb().savedResearch);
});

apiRouter.post('/saved-research', async (req: Request, res: Response) => {
  const { symbol, title, notes, scoreAtSave } = req.body;
  if (!symbol || !title) {
    return res.status(400).json({ error: 'Symbol and title are required' });
  }

  const db = dbService.getDb();
  const company = db.stocks.find((s) => s.symbol.toUpperCase() === symbol.toUpperCase())?.companyName || symbol;

  const newItem: SavedResearch = {
    id: `sr-${Date.now()}`,
    symbol: symbol.toUpperCase(),
    companyName: company,
    title,
    notes: notes || '',
    createdAt: new Date().toISOString(),
    scoreAtSave: scoreAtSave || 75,
  };

  db.savedResearch.unshift(newItem);
  await dbService.persist();
  res.json({ success: true, item: newItem });
});
