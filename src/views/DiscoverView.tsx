import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Search,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { apiClient } from '../api/client.ts';
import { StockQuote, StockScoreBreakdown, ScreenerFilterCriteria } from '../types/index.ts';

interface DiscoverViewProps {
  onOpenStockModal: (symbol: string) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({ onOpenStockModal }) => {
  const [criteria, setCriteria] = useState<ScreenerFilterCriteria>({
    minPrice: 10,
    maxPrice: 3000,
    sector: 'All',
    maxPe: undefined,
    minRoe: 15,
    minRoce: 15,
    maxDebtToEquity: 1.0,
    minIndianSharesScore: 70,
    minDividendYield: undefined,
  });

  const [results, setResults] = useState<(StockQuote & { scores: StockScoreBreakdown; rank: number })[]>([]);
  const [totalMatched, setTotalMatched] = useState(0);
  const [loading, setLoading] = useState(true);

  const executeScreener = async (crit = criteria) => {
    try {
      setLoading(true);
      const res = await apiClient.discoverShares(crit);
      setResults(res.results || []);
      setTotalMatched(res.totalMatched || 0);
    } catch (err) {
      console.error('Error discovering shares:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeScreener();
  }, []);

  const applyPreset = (presetName: string) => {
    let newCrit = { ...criteria };
    if (presetName === 'COMPOUNDERS') {
      newCrit = {
        minPrice: 10,
        maxPrice: 5000,
        sector: 'All',
        maxPe: 60,
        minRoe: 20,
        minRoce: 22,
        maxDebtToEquity: 0.5,
        minIndianSharesScore: 80,
      };
    } else if (presetName === 'UNDER_2000') {
      newCrit = {
        minPrice: 10,
        maxPrice: 2000,
        sector: 'All',
        minRoe: 15,
        minRoce: 15,
        maxDebtToEquity: 1.0,
        minIndianSharesScore: 75,
      };
    } else if (presetName === 'HIGH_DIVIDEND') {
      newCrit = {
        minPrice: 10,
        maxPrice: 5000,
        sector: 'All',
        minDividendYield: 2.0,
        maxDebtToEquity: 1.0,
        minIndianSharesScore: 70,
      };
    }
    setCriteria(newCrit);
    executeScreener(newCrit);
  };

  const handleReset = () => {
    const def: ScreenerFilterCriteria = {
      minPrice: 10,
      maxPrice: 3000,
      sector: 'All',
      minRoe: 15,
      minRoce: 15,
      maxDebtToEquity: 1.0,
      minIndianSharesScore: 70,
    };
    setCriteria(def);
    executeScreener(def);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 p-6 rounded-xl border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1 rounded-md bg-amber-500/20 text-amber-400">
                <Sliders className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Multi-Pillar Stock Screener
              </span>
              <span className="text-xs text-slate-400">Normalized Fundamentals Engine</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Discover Quality Indian Shares
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Screen the Indian equity universe using verified fundamental parameters, cash flow strength, debt thresholds,
              and IndianShares algorithmic composite score ratings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold mr-1">Presets:</span>
            <button
              onClick={() => applyPreset('COMPOUNDERS')}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-lg text-xs font-semibold"
            >
              High RoE Compounders
            </button>
            <button
              onClick={() => applyPreset('UNDER_2000')}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 rounded-lg text-xs font-semibold"
            >
              Under ₹2,000 Universe
            </button>
            <button
              onClick={() => applyPreset('HIGH_DIVIDEND')}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-lg text-xs font-semibold"
            >
              Yield &gt; 2%
            </button>
          </div>
        </div>

        {/* Filter Controls Grid */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          {/* Price Range */}
          <div className="space-y-1 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <label className="text-slate-300 font-medium block">
              Share Price Range (₹{criteria.minPrice} - ₹{criteria.maxPrice})
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={criteria.minPrice || 0}
                onChange={(e) => setCriteria({ ...criteria, minPrice: Number(e.target.value) })}
                className="w-1/2 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                placeholder="Min ₹"
              />
              <input
                type="number"
                value={criteria.maxPrice || 5000}
                onChange={(e) => setCriteria({ ...criteria, maxPrice: Number(e.target.value) })}
                className="w-1/2 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                placeholder="Max ₹"
              />
            </div>
          </div>

          {/* Sector */}
          <div className="space-y-1 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <label className="text-slate-300 font-medium block">Sector</label>
            <select
              value={criteria.sector || 'All'}
              onChange={(e) => setCriteria({ ...criteria, sector: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
            >
              <option value="All">All Sectors</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Banking & Financials">Banking & Financials</option>
              <option value="Automobiles & Auto Components">Automobiles</option>
              <option value="Capital Goods & Electricals">Capital Goods & Electricals</option>
              <option value="Pharmaceuticals & Healthcare">Pharmaceuticals</option>
              <option value="Consumer Discretionary">Consumer Discretionary</option>
            </select>
          </div>

          {/* Min RoE % */}
          <div className="space-y-1 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <label className="text-slate-300 font-medium block">
              Min RoE: <strong className="text-emerald-400 font-mono">{criteria.minRoe || 0}%</strong>
            </label>
            <input
              type="range"
              min="0"
              max="35"
              value={criteria.minRoe || 0}
              onChange={(e) => setCriteria({ ...criteria, minRoe: Number(e.target.value) })}
              className="w-full accent-emerald-500"
            />
          </div>

          {/* Max Debt/Equity */}
          <div className="space-y-1 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <label className="text-slate-300 font-medium block">
              Max Debt / Equity: <strong className="text-amber-400 font-mono">{criteria.maxDebtToEquity || 2.0}</strong>
            </label>
            <input
              type="range"
              min="0.1"
              max="2.5"
              step="0.1"
              value={criteria.maxDebtToEquity || 2.0}
              onChange={(e) => setCriteria({ ...criteria, maxDebtToEquity: Number(e.target.value) })}
              className="w-full accent-amber-500"
            />
          </div>

          {/* Min IS Composite Score */}
          <div className="space-y-1 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <label className="text-slate-300 font-medium block">
              Min IndianShares Score:{' '}
              <strong className="text-amber-400 font-mono">{criteria.minIndianSharesScore || 0}/100</strong>
            </label>
            <input
              type="range"
              min="40"
              max="95"
              value={criteria.minIndianSharesScore || 40}
              onChange={(e) =>
                setCriteria({ ...criteria, minIndianSharesScore: Number(e.target.value) })
              }
              className="w-full accent-amber-500"
            />
          </div>

          {/* Max P/E Ratio */}
          <div className="space-y-1 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <label className="text-slate-300 font-medium block">Max P/E Multiple</label>
            <input
              type="number"
              value={criteria.maxPe || ''}
              onChange={(e) =>
                setCriteria({
                  ...criteria,
                  maxPe: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              placeholder="Any (e.g. 50)"
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
            />
          </div>

          {/* Min Dividend Yield */}
          <div className="space-y-1 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <label className="text-slate-300 font-medium block">Min Dividend Yield (%)</label>
            <input
              type="number"
              step="0.5"
              value={criteria.minDividendYield || ''}
              onChange={(e) =>
                setCriteria({
                  ...criteria,
                  minDividendYield: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              placeholder="Any (e.g. 1.5)"
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
            />
          </div>

          {/* Actions */}
          <div className="flex items-end gap-2">
            <button
              onClick={() => executeScreener()}
              className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors text-xs"
            >
              Apply Filter ({totalMatched})
            </button>
            <button
              onClick={handleReset}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              title="Reset Criteria"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Screener Results Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200">
            Matched Companies: <strong className="text-amber-400">{results.length}</strong>
          </span>
          <span className="text-slate-400">Sorted by IndianShares Composite Score</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Rank / Symbol</th>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4 text-right">Price (₹)</th>
                <th className="py-3 px-4 text-right">Change (%)</th>
                <th className="py-3 px-4 text-center">IS Score</th>
                <th className="py-3 px-4 text-right">52W High</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {results.map((stock, idx) => {
                const isPos = stock.percentChange >= 0;
                return (
                  <tr
                    key={stock.symbol}
                    className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    onClick={() => onOpenStockModal(stock.symbol)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-slate-500 font-mono text-xs font-semibold w-5">
                          #{idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-white group-hover:text-amber-400 transition-colors text-sm">
                            {stock.symbol}
                          </span>
                          <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                            {stock.companyName}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-xs text-slate-300">{stock.sector}</span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-white text-sm">
                      ₹{(stock.price ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td
                      className={`py-3 px-4 text-right font-mono font-bold text-sm ${
                        isPos ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPos ? '+' : ''}
                      {(stock.percentChange ?? 0).toFixed(2)}%
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {stock.scores?.overallScore || '—'}/100
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      ₹{(stock.high52Week ?? 0).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenStockModal(stock.symbol);
                        }}
                        className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ml-auto"
                      >
                        Research <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
