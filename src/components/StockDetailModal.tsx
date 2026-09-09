import React, { useState, useEffect } from 'react';
import {
  X,
  Award,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Building2,
  PieChart,
  Calendar,
  DollarSign,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { CompanyStockDetail } from '../types/index.ts';
import { apiClient } from '../api/client.ts';

interface StockDetailModalProps {
  symbol: string | null;
  onClose: () => void;
  onWatchlistUpdated: () => void;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({
  symbol,
  onClose,
  onWatchlistUpdated,
}) => {
  const [data, setData] = useState<CompanyStockDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'FUNDAMENTALS' | 'VALUATION' | 'SHAREHOLDING' | 'ACTIONS' | 'NEWS'
  >('OVERVIEW');

  // AI research summary state
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Watchlist & Save Research state
  const [isSaved, setIsSaved] = useState(false);
  const [saveNote, setSaveNote] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);
    setError(null);
    setAiSummary(null);

    apiClient
      .getStockDetail(symbol)
      .then((res) => {
        setData(res);
        // Pre-fetch or generate grounded AI summary
        fetchAiSummary(symbol);
      })
      .catch((err) => {
        setError(err?.message || 'Failed to load stock detail');
      })
      .finally(() => setLoading(false));
  }, [symbol]);

  const fetchAiSummary = async (sym: string) => {
    try {
      setAiLoading(true);
      const res = await apiClient.getStockAiSummary(sym);
      setAiSummary(res.summary);
    } catch (err) {
      console.error('Error loading AI summary:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveToWatchlist = async () => {
    if (!symbol) return;
    try {
      await apiClient.addToWatchlist({
        symbol,
        notes: saveNote || 'Saved from Stock Research Dossier',
        dividendAlert: true,
        scoreAlert: true,
      });
      setIsSaved(true);
      setShowSaveForm(false);
      onWatchlistUpdated();
    } catch (err) {
      console.error('Error adding to watchlist:', err);
    }
  };

  const handleSaveResearchDossier = async () => {
    if (!symbol || !data) return;
    try {
      await apiClient.saveResearch({
        symbol,
        title: `Research Dossier Snapshot for ${symbol}`,
        notes: saveNote || `Saved analysis snapshot with IndianShares score of ${data.scores.overallScore}/100.`,
        scoreAtSave: data.scores.overallScore,
      });
      setIsSaved(true);
      setShowSaveForm(false);
    } catch (err) {
      console.error('Error saving research dossier:', err);
    }
  };

  if (!symbol) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-start justify-between gap-4">
          {data ? (
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  {data.quote.symbol}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                  {data.quote.sector}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  NSE: {data.quote.symbol} | BSE: {data.quote.bseCode || '—'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                  IS Score: {data.scores.overallScore}/100
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{data.quote.companyName}</p>
            </div>
          ) : (
            <div className="text-slate-400 text-sm">Loading Stock Dossier...</div>
          )}

          <div className="flex items-center gap-3 shrink-0">
            {data && (
              <button
                onClick={() => setShowSaveForm(!showSaveForm)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Bookmark className="h-3.5 w-3.5" />
                {isSaved ? 'Saved' : 'Save / Watch'}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Quick Save Note Flyout */}
        {showSaveForm && (
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row items-center gap-3 text-xs animate-in slide-in-from-top-2">
            <input
              type="text"
              value={saveNote}
              onChange={(e) => setSaveNote(e.target.value)}
              placeholder="Add personal investment thesis or price target note..."
              className="flex-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleSaveToWatchlist}
                className="flex-1 sm:flex-none px-3 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400"
              >
                Add to Watchlist
              </button>
              <button
                onClick={handleSaveResearchDossier}
                className="flex-1 sm:flex-none px-3 py-2 bg-slate-800 text-slate-200 font-semibold rounded-lg hover:bg-slate-700"
              >
                Save Research Snapshot
              </button>
            </div>
          </div>
        )}

        {/* Modal Navigation Tabs */}
        <div className="px-5 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs font-semibold scrollbar-none">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'OVERVIEW'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview & Scorecard
          </button>
          <button
            onClick={() => setActiveTab('FUNDAMENTALS')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'FUNDAMENTALS'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Fundamentals & Cash Flow
          </button>
          <button
            onClick={() => setActiveTab('VALUATION')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'VALUATION'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Valuation Multiples
          </button>
          <button
            onClick={() => setActiveTab('SHAREHOLDING')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'SHAREHOLDING'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Shareholding & FII/DII
          </button>
          <button
            onClick={() => setActiveTab('ACTIONS')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'ACTIONS'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Dividends & Corporate Actions
          </button>
          <button
            onClick={() => setActiveTab('NEWS')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'NEWS'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Regulatory News ({data?.news?.length || 0})
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-200">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
              <p className="text-xs text-slate-400">Loading verified exchange data...</p>
            </div>
          ) : error || !data ? (
            <div className="p-8 text-center bg-rose-950/30 border border-rose-900 rounded-xl">
              <p className="text-rose-300 text-sm font-semibold">{error || 'Data unavailable'}</p>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW & SCORECARD */}
              {activeTab === 'OVERVIEW' && (
                <div className="space-y-6">
                  {/* Pricing Key Metric Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                        Market Price
                      </span>
                      <span className="text-lg font-bold font-mono text-white block mt-0.5">
                        ₹{(data.quote.price ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <span
                        className={`text-xs font-mono font-bold ${
                          (data.quote.percentChange ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {(data.quote.percentChange ?? 0) >= 0 ? '+' : ''}
                        {(data.quote.percentChange ?? 0).toFixed(2)}%
                      </span>
                    </div>

                    <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                        Market Cap
                      </span>
                      <span className="text-base font-bold font-mono text-slate-200 block mt-0.5">
                        ₹{(data.quote.marketCapCr ?? 0).toLocaleString('en-IN')} Cr
                      </span>
                      <span className="text-[10px] text-slate-400">{data.quote.capCategory}</span>
                    </div>

                    <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                        52-Week Range
                      </span>
                      <span className="text-xs font-mono text-slate-200 block mt-1">
                        L: ₹{(data.quote.low52Week ?? 0).toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs font-mono text-emerald-400 block">
                        H: ₹{(data.quote.high52Week ?? 0).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                        Day Volume
                      </span>
                      <span className="text-base font-bold font-mono text-slate-200 block mt-0.5">
                        {(data.quote.volume / 100000).toFixed(2)}L
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Rel: {(data.quote.relativeVolume || 1.0).toFixed(2)}x
                      </span>
                    </div>

                    <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                        Industry P/E
                      </span>
                      <span className="text-base font-bold font-mono text-slate-200 block mt-0.5">
                        {data.valuation?.peRatio ? `${data.valuation.peRatio}x` : '—'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Sector: {data.valuation?.industryPe ? `${data.valuation.industryPe}x` : '—'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                        RoE / RoCE
                      </span>
                      <span className="text-base font-bold font-mono text-emerald-400 block mt-0.5">
                        {data.fundamentals?.roePercent || '—'}% / {data.fundamentals?.rocePercent || '—'}%
                      </span>
                      <span className="text-[10px] text-slate-400">
                        D/E: {data.fundamentals?.debtToEquity ?? '—'}
                      </span>
                    </div>
                  </div>

                  {/* IndianShares Scorecard Matrix */}
                  <div className="p-5 bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 rounded-xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-amber-500" />
                        <h2 className="text-base font-bold text-white">
                          IndianShares Proprietary Research Scorecard
                        </h2>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">Composite Score:</span>
                        <span className="text-2xl font-black font-mono text-amber-400">
                          {data.scores.overallScore}
                          <span className="text-xs text-slate-500 font-normal">/100</span>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">Fundamental</span>
                        <span className="text-lg font-bold font-mono text-emerald-400 block mt-1">
                          {data.scores.fundamentalScore}/100
                        </span>
                        <span className="text-[10px] text-slate-500">RoE, RoCE, Margin</span>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">Compounding Growth</span>
                        <span className="text-lg font-bold font-mono text-emerald-400 block mt-1">
                          {data.scores.growthScore}/100
                        </span>
                        <span className="text-[10px] text-slate-500">3Y Revenue/PAT CAGR</span>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">Momentum & Volume</span>
                        <span className="text-lg font-bold font-mono text-sky-400 block mt-1">
                          {data.scores.momentumScore}/100
                        </span>
                        <span className="text-[10px] text-slate-500">52W Proximity</span>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">Institutional Posture</span>
                        <span className="text-lg font-bold font-mono text-purple-400 block mt-1">
                          {data.scores.institutionalScore}/100
                        </span>
                        <span className="text-[10px] text-slate-500">FII / DII Absorption</span>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">Sector Context</span>
                        <span className="text-lg font-bold font-mono text-indigo-400 block mt-1">
                          {data.scores.sectorScore}/100
                        </span>
                        <span className="text-[10px] text-slate-500">Industry Tailwinds</span>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">Risk Deduction</span>
                        <span className="text-lg font-bold font-mono text-rose-400 block mt-1">
                          -{data.scores.riskPenalty} pts
                        </span>
                        <span className="text-[10px] text-slate-500">Valuation / Leverage</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="p-3.5 bg-emerald-950/20 border border-emerald-900/50 rounded-lg text-xs space-y-1.5">
                        <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Major Positives
                        </span>
                        <ul className="space-y-1 text-slate-300">
                          {data.scores.majorPositives.map((p, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-emerald-400">•</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3.5 bg-rose-950/20 border border-rose-900/50 rounded-lg text-xs space-y-1.5">
                        <span className="text-rose-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5" /> Key Risks & Monitorables
                        </span>
                        <ul className="space-y-1 text-slate-300">
                          {data.scores.majorRisks.map((r, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-rose-400">•</span>
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* AI Research Dossier Commentary (Gemini 3.8 Flash) */}
                  <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-400" />
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                          AI Research Commentary (Gemini 3.8 Flash)
                        </h2>
                      </div>
                      <button
                        onClick={() => fetchAiSummary(data.quote.symbol)}
                        disabled={aiLoading}
                        className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                      >
                        <RotateCcw className="h-3 w-3" />
                        {aiLoading ? 'Synthesizing...' : 'Regenerate'}
                      </button>
                    </div>

                    <div className="p-4 bg-slate-900/80 border border-slate-800/80 rounded-lg text-xs text-slate-300 leading-relaxed font-sans space-y-2">
                      {aiLoading ? (
                        <div className="py-6 text-center space-y-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500 mx-auto" />
                          <p className="text-slate-400">Synthesizing verified filings and score pillars...</p>
                        </div>
                      ) : aiSummary ? (
                        <div className="whitespace-pre-line">{aiSummary}</div>
                      ) : (
                        <p className="text-slate-500 italic">No summary generated yet.</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>Grounded exclusively in authoritative IndianShares normalized data model</span>
                      <span>Not investment advice • Research signal only</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: FUNDAMENTALS */}
              {activeTab === 'FUNDAMENTALS' && (
                <div className="space-y-6 text-xs">
                  {data.fundamentals ? (
                    <>
                      {/* P&L Snapshot */}
                      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-emerald-400" />
                          Income Statement & Margins (FY24 / LTM)
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">Annual Revenue</span>
                            <span className="text-base font-bold font-mono text-white mt-1 block">
                              ₹{(data.fundamentals.revenueCr ?? 0).toLocaleString('en-IN')} Cr
                            </span>
                          </div>
                          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">Operating EBITDA</span>
                            <span className="text-base font-bold font-mono text-white mt-1 block">
                              ₹{(data.fundamentals.ebitdaCr ?? 0).toLocaleString('en-IN')} Cr
                            </span>
                          </div>
                          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">Net Profit (PAT)</span>
                            <span className="text-base font-bold font-mono text-emerald-400 mt-1 block">
                              ₹{(data.fundamentals.netProfitCr ?? 0).toLocaleString('en-IN')} Cr
                            </span>
                          </div>
                          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">Earnings Per Share</span>
                            <span className="text-base font-bold font-mono text-white mt-1 block">
                              ₹{data.fundamentals.eps.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">Operating Margin</span>
                            <span className="text-base font-bold font-mono text-emerald-400 mt-1 block">
                              {data.fundamentals.operatingMarginPercent}%
                            </span>
                          </div>
                          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">Net Profit Margin</span>
                            <span className="text-base font-bold font-mono text-emerald-400 mt-1 block">
                              {data.fundamentals.netMarginPercent}%
                            </span>
                          </div>
                          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">Return on Equity (RoE)</span>
                            <span className="text-base font-bold font-mono text-emerald-400 mt-1 block">
                              {data.fundamentals.roePercent}%
                            </span>
                          </div>
                          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">Return on Capital (RoCE)</span>
                            <span className="text-base font-bold font-mono text-emerald-400 mt-1 block">
                              {data.fundamentals.rocePercent}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Cash Flow & Capital Discipline */}
                      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-sky-400" />
                          Cash Flow Conversion & Balance Sheet Health
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">
                              Operating Cash Flow (OCF)
                            </span>
                            <span className="text-base font-bold font-mono text-emerald-400 mt-1 block">
                              ₹{(data.fundamentals.operatingCashFlowCr ?? 0).toLocaleString('en-IN')} Cr
                            </span>
                            <span className="text-[10px] text-slate-500">Cash from primary operations</span>
                          </div>

                          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">
                              Free Cash Flow (FCF)
                            </span>
                            <span className="text-base font-bold font-mono text-emerald-400 mt-1 block">
                              ₹{(data.fundamentals.freeCashFlowCr ?? 0).toLocaleString('en-IN')} Cr
                            </span>
                            <span className="text-[10px] text-slate-500">After capital expenditures</span>
                          </div>

                          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">
                              Debt to Equity Ratio
                            </span>
                            <span className="text-base font-bold font-mono text-amber-400 mt-1 block">
                              {data.fundamentals.debtToEquity}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {data.fundamentals.debtToEquity <= 0.2
                                ? 'Virtually Debt-Free'
                                : 'Moderate Leverage'}
                            </span>
                          </div>
                        </div>

                        {/* Compounding CAGR */}
                        <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                          <span className="text-slate-300 font-semibold block mb-2">
                            3-Year Historical Compounding Speed (CAGR):
                          </span>
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div>
                              <span className="text-[10px] text-slate-400 block">Revenue CAGR</span>
                              <span className="text-sm font-bold font-mono text-emerald-400">
                                {data.fundamentals.revenueCagr3Yr || '—'}%
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">Net Profit CAGR</span>
                              <span className="text-sm font-bold font-mono text-emerald-400">
                                {data.fundamentals.profitCagr3Yr || '—'}%
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">EPS CAGR</span>
                              <span className="text-sm font-bold font-mono text-emerald-400">
                                {data.fundamentals.epsCagr3Yr || '—'}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-8 text-center text-slate-500 italic">
                      Awaiting verified fundamental financial statements for {data.quote.symbol}.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: VALUATION */}
              {activeTab === 'VALUATION' && (
                <div className="space-y-6 text-xs">
                  {data.valuation ? (
                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Valuation Multiples & Comparison
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Price to Earnings (P/E)</span>
                          <span className="text-lg font-bold font-mono text-white mt-1 block">
                            {data.valuation.peRatio}x
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Industry P/E: {data.valuation.industryPe}x
                          </span>
                        </div>

                        <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Price to Book (P/B)</span>
                          <span className="text-lg font-bold font-mono text-white mt-1 block">
                            {data.valuation.pbRatio}x
                          </span>
                          <span className="text-[10px] text-slate-500">Book multiple</span>
                        </div>

                        <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">EV / EBITDA</span>
                          <span className="text-lg font-bold font-mono text-white mt-1 block">
                            {data.valuation.evToEbitda}x
                          </span>
                          <span className="text-[10px] text-slate-500">Enterprise multiple</span>
                        </div>

                        <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">PEG Ratio</span>
                          <span className="text-lg font-bold font-mono text-amber-400 mt-1 block">
                            {data.valuation.pegRatio}
                          </span>
                          <span className="text-[10px] text-slate-500">P/E to Growth</span>
                        </div>

                        <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Dividend Yield</span>
                          <span className="text-lg font-bold font-mono text-emerald-400 mt-1 block">
                            {data.valuation.dividendYield}%
                          </span>
                          <span className="text-[10px] text-slate-500">Cash yield</span>
                        </div>

                        <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Market Cap Classification</span>
                          <span className="text-base font-bold font-mono text-white mt-1 block">
                            {data.quote.capCategory}
                          </span>
                          <span className="text-[10px] text-slate-500">Liquidity Tier</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-500 italic">
                      Awaiting verified valuation metrics.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: SHAREHOLDING */}
              {activeTab === 'SHAREHOLDING' && (
                <div className="space-y-6 text-xs">
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <PieChart className="h-4 w-4 text-purple-400" />
                      Quarterly Shareholding Pattern Disclosures (BSE / NSE)
                    </h3>

                    {data.shareholding.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800 text-[11px]">
                            <tr>
                              <th className="py-2.5 px-3">Filing Period</th>
                              <th className="py-2.5 px-3 text-right">Promoter (%)</th>
                              <th className="py-2.5 px-3 text-right">FII / FPI (%)</th>
                              <th className="py-2.5 px-3 text-right">DII (%)</th>
                              <th className="py-2.5 px-3 text-right">Mutual Funds (%)</th>
                              <th className="py-2.5 px-3 text-right">Public (%)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 text-slate-200">
                            {data.shareholding.map((q) => (
                              <tr key={q.period} className="hover:bg-slate-800/40 font-mono">
                                <td className="py-2.5 px-3 font-sans font-semibold text-white">
                                  {q.period}
                                </td>
                                <td className="py-2.5 px-3 text-right">{q.promoter.toFixed(2)}%</td>
                                <td className="py-2.5 px-3 text-right text-sky-400 font-bold">
                                  {q.fii.toFixed(2)}%
                                </td>
                                <td className="py-2.5 px-3 text-right text-purple-400 font-bold">
                                  {q.dii.toFixed(2)}%
                                </td>
                                <td className="py-2.5 px-3 text-right text-emerald-400">
                                  {q.mutualFunds.toFixed(2)}%
                                </td>
                                <td className="py-2.5 px-3 text-right text-slate-400">
                                  {q.public.toFixed(2)}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-slate-500 italic">No quarterly filings found.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: DIVIDENDS & CORPORATE ACTIONS */}
              {activeTab === 'ACTIONS' && (
                <div className="space-y-6 text-xs">
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-emerald-400" />
                      Dividends & Board Actions History
                    </h3>

                    {data.dividends.length > 0 ? (
                      <div className="divide-y divide-slate-800/80">
                        {data.dividends.map((div) => (
                          <div key={div.id} className="py-3 flex items-center justify-between">
                            <div>
                              <span className="font-bold text-white text-sm">
                                ₹{div.amountPerShare.toFixed(2)} per share
                              </span>
                              <span className="text-[10px] ml-2 px-2 py-0.5 rounded bg-emerald-950 text-emerald-400">
                                {div.dividendType} Dividend
                              </span>
                              <p className="text-[11px] text-slate-400 mt-1">
                                Ex-Date: {div.exDate} | Record Date: {div.recordDate} | Payout Date: {div.payoutDate}
                              </p>
                            </div>
                            <div className="text-right font-mono">
                              <span className="text-emerald-400 font-bold text-sm">
                                Yield: {div.dividendYield.toFixed(2)}%
                              </span>
                              <p className="text-[10px] text-slate-500">
                                Sustainability: {div.dividendScore?.score || '85'}/100
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 italic">No historical dividend items found.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: REGULATORY NEWS */}
              {activeTab === 'NEWS' && (
                <div className="space-y-4 text-xs">
                  {data.news.length > 0 ? (
                    data.news.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-400">{item.eventType}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                              item.sentiment === 'POSITIVE'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : item.sentiment === 'NEGATIVE'
                                ? 'bg-rose-500/10 text-rose-400'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {item.sentiment}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-white">{item.headline}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">{item.summary}</p>
                        <div className="pt-2 text-[10px] text-slate-500 flex items-center justify-between">
                          <span>Source: {item.source}</span>
                          <span>{item.publishedAt ? new Date(item.publishedAt).toLocaleString('en-IN') : 'Recent'}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-500 italic">
                      No recent regulatory filings observed for {data.quote.symbol}.
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
