import React, { useState, useEffect } from 'react';
import {
  Award,
  Sliders,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
  Clock,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import { Top10Response, apiClient } from '../api/client.ts';

interface Top10ViewProps {
  onOpenStockModal: (symbol: string) => void;
}

export const Top10View: React.FC<Top10ViewProps> = ({ onOpenStockModal }) => {
  const [data, setData] = useState<Top10Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [weights, setWeights] = useState<Top10Response['weights'] | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [expandedStock, setExpandedStock] = useState<string | null>(null);

  const fetchTop10 = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getTop10();
      setData(res);
      setWeights(res.weights);
    } catch (err) {
      console.error('Error fetching Top 10:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTop10();
  }, []);

  const handleUpdateWeights = async () => {
    if (!weights) return;
    try {
      setIsUpdating(true);
      const res = await apiClient.updateTop10Weights(weights);
      setData(res);
    } catch (err) {
      console.error('Error updating weights:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetWeights = async () => {
    const defaults = {
      fundamentalWeight: 35,
      growthWeight: 25,
      momentumWeight: 15,
      institutionalWeight: 15,
      newsWeight: 5,
      sectorWeight: 5,
      riskPenaltyMax: 15,
      minPrice: 10,
      maxPrice: 3000,
    };
    setWeights(defaults);
    try {
      setIsUpdating(true);
      const res = await apiClient.updateTop10Weights(defaults);
      setData(res);
    } catch (err) {
      console.error('Error resetting weights:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" />
        <p className="text-slate-400 text-sm">Calculating multi-factor IndianShares rankings...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 p-6 rounded-xl border border-amber-500/20 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1 rounded-md bg-amber-500/20 text-amber-400">
                <Award className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Authoritative Algorithm
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {data.universeCriteria}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Top 10 IndianShares Research Selections
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Every position is backed by explicit mathematical scores across fundamentals, revenue compounding,
              institutional absorption, and risk penalties. No black-box hype.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
                showConfig
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Sliders className="h-4 w-4" />
              {showConfig ? 'Hide Weight Engine' : 'Configure Weight Engine'}
            </button>
          </div>
        </div>

        {/* Expandable Scoring Weights Engine Configuration */}
        {showConfig && weights && (
          <div className="mt-6 pt-6 border-t border-slate-800/80 bg-slate-950/60 p-5 rounded-lg border border-slate-800 space-y-5 animate-in slide-in-from-top-4 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-amber-400" />
                  Transparent Multi-Factor Weight Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Adjust parameter weights and price limits to customize your research universe.
                </p>
              </div>
              <button
                onClick={handleResetWeights}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Defaults
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
              {/* Fundamental Weight */}
              <div className="space-y-1.5 bg-slate-900 p-3 rounded-lg border border-slate-800">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-300">Fundamental Weight:</span>
                  <span className="font-mono text-amber-400 font-bold">{weights.fundamentalWeight}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={weights.fundamentalWeight}
                  onChange={(e) =>
                    setWeights({ ...weights, fundamentalWeight: Number(e.target.value) })
                  }
                  className="w-full accent-amber-500"
                />
                <span className="text-[10px] text-slate-500">ROE, ROCE, Debt/Equity, Operating Margin</span>
              </div>

              {/* Growth Weight */}
              <div className="space-y-1.5 bg-slate-900 p-3 rounded-lg border border-slate-800">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-300">Growth Weight:</span>
                  <span className="font-mono text-amber-400 font-bold">{weights.growthWeight}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={weights.growthWeight}
                  onChange={(e) =>
                    setWeights({ ...weights, growthWeight: Number(e.target.value) })
                  }
                  className="w-full accent-amber-500"
                />
                <span className="text-[10px] text-slate-500">Revenue CAGR, Net Profit CAGR, EPS Compounding</span>
              </div>

              {/* Momentum Weight */}
              <div className="space-y-1.5 bg-slate-900 p-3 rounded-lg border border-slate-800">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-300">Momentum & Volume:</span>
                  <span className="font-mono text-amber-400 font-bold">{weights.momentumWeight}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={weights.momentumWeight}
                  onChange={(e) =>
                    setWeights({ ...weights, momentumWeight: Number(e.target.value) })
                  }
                  className="w-full accent-amber-500"
                />
                <span className="text-[10px] text-slate-500">Relative Volume, 52W Proximity, Trend Strength</span>
              </div>

              {/* Institutional Weight */}
              <div className="space-y-1.5 bg-slate-900 p-3 rounded-lg border border-slate-800">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-300">Institutional Holding:</span>
                  <span className="font-mono text-amber-400 font-bold">{weights.institutionalWeight}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  value={weights.institutionalWeight}
                  onChange={(e) =>
                    setWeights({ ...weights, institutionalWeight: Number(e.target.value) })
                  }
                  className="w-full accent-amber-500"
                />
                <span className="text-[10px] text-slate-500">FII / Mutual Fund Accumulation Delta</span>
              </div>

              {/* Min & Max Price Universe Range */}
              <div className="space-y-1.5 bg-slate-900 p-3 rounded-lg border border-slate-800">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-300">Stock Price Universe Range:</span>
                  <span className="font-mono text-amber-400 font-bold">
                    ₹{weights.minPrice} - ₹{weights.maxPrice}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={weights.minPrice}
                    onChange={(e) =>
                      setWeights({ ...weights, minPrice: Number(e.target.value) })
                    }
                    className="w-1/2 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200"
                    placeholder="Min ₹"
                  />
                  <input
                    type="number"
                    value={weights.maxPrice}
                    onChange={(e) =>
                      setWeights({ ...weights, maxPrice: Number(e.target.value) })
                    }
                    className="w-1/2 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200"
                    placeholder="Max ₹"
                  />
                </div>
                <span className="text-[10px] text-slate-500">Configurable share price floor and ceiling</span>
              </div>

              {/* Max Risk Deduction */}
              <div className="space-y-1.5 bg-slate-900 p-3 rounded-lg border border-slate-800">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-300">Risk Penalty Max:</span>
                  <span className="font-mono text-rose-400 font-bold">-{weights.riskPenaltyMax} pts</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={weights.riskPenaltyMax}
                  onChange={(e) =>
                    setWeights({ ...weights, riskPenaltyMax: Number(e.target.value) })
                  }
                  className="w-full accent-rose-500"
                />
                <span className="text-[10px] text-slate-500">Deductions for extreme P/E or high Debt/Equity</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleUpdateWeights}
                disabled={isUpdating}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow transition-colors flex items-center gap-2"
              >
                {isUpdating ? 'Recalculating...' : 'Apply Weights & Recalculate Top 10'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Top 10 Ranked Cards */}
      <div className="space-y-4">
        {data.stocks.map((item) => {
          const isExpanded = expandedStock === item.symbol;
          const { scores } = item;

          return (
            <div
              key={item.symbol}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl transition-all shadow-md overflow-hidden"
            >
              {/* Header Bar */}
              <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black text-lg flex items-center justify-center shrink-0 shadow-md">
                    #{item.rank}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2
                        onClick={() => onOpenStockModal(item.symbol)}
                        className="text-lg font-bold text-white hover:text-amber-400 cursor-pointer transition-colors"
                      >
                        {item.symbol}
                      </h2>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {item.sector}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {item.capCategory}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{item.companyName}</p>
                  </div>
                </div>

                {/* Score & Pricing Badge */}
                <div className="flex items-center gap-6 justify-between md:justify-end">
                  {/* Market Price */}
                  <div className="text-right">
                    <div className="font-mono text-lg font-bold text-white">
                      ₹{(item.price ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div
                      className={`text-xs font-mono font-semibold ${
                        (item.percentChange ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {(item.percentChange ?? 0) >= 0 ? '+' : ''}
                      {(item.percentChange ?? 0).toFixed(2)}%
                    </div>
                  </div>

                  {/* IndianShares Composite Score */}
                  <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                        IS Score
                      </span>
                      <span className="text-2xl font-black font-mono text-amber-400">
                        {scores.overallScore}
                        <span className="text-xs text-slate-500 font-normal">/100</span>
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => onOpenStockModal(item.symbol)}
                        className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        Dossier
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => setExpandedStock(isExpanded ? null : item.symbol)}
                        className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1 py-0.5"
                      >
                        {isExpanded ? 'Hide' : 'Factors'}
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-score Summary Chips */}
              <div className="px-5 py-2.5 bg-slate-950/60 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-xs">
                <span className="text-slate-500 font-medium">Factor Scores:</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                  Fundamentals: <strong className="text-emerald-400">{scores.fundamentalScore}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                  Growth: <strong className="text-emerald-400">{scores.growthScore}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                  Momentum: <strong className="text-sky-400">{scores.momentumScore}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                  Institutional: <strong className="text-purple-400">{scores.institutionalScore}</strong>
                </span>
                {scores.riskPenalty > 0 && (
                  <span className="px-2 py-0.5 rounded bg-rose-950/40 border border-rose-900 text-rose-300 font-mono">
                    Risk Penalty: -{scores.riskPenalty}
                  </span>
                )}
                <span className="ml-auto text-[10px] text-slate-500 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  Confidence: {scores.confidence}%
                </span>
              </div>

              {/* Expanded Factor Detail Breakdown */}
              {isExpanded && (
                <div className="p-5 bg-slate-950/90 border-t border-slate-800 space-y-4 text-xs animate-in slide-in-from-top-2 duration-150">
                  <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800">
                    <span className="font-semibold text-slate-200 block mb-1">
                      IndianShares Calculation Logic:
                    </span>
                    <p className="text-slate-300 leading-relaxed font-sans">{scores.reasoning}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Positive Factors */}
                    <div className="p-3.5 bg-emerald-950/20 border border-emerald-900/50 rounded-lg space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Major Positive Pillars
                      </div>
                      <ul className="space-y-1.5 text-slate-300">
                        {scores.majorPositives.map((pos, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-400 mt-0.5">•</span>
                            <span>{pos}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Risk Factors */}
                    <div className="p-3.5 bg-rose-950/20 border border-rose-900/50 rounded-lg space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-rose-400 uppercase tracking-wider text-[11px]">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        Key Monitorables & Risks
                      </div>
                      <ul className="space-y-1.5 text-slate-300">
                        {scores.majorRisks.map((risk, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-rose-400 mt-0.5">•</span>
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Observed At: {scores.timestamp ? new Date(scores.timestamp).toLocaleString('en-IN') : 'Recent'}</span>
                    <button
                      onClick={() => onOpenStockModal(item.symbol)}
                      className="text-amber-400 hover:underline font-semibold"
                    >
                      Open Full Research Dossier & Financial Statements →
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
