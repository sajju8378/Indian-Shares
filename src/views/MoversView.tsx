import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Volume2,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import { MoversData, apiClient } from '../api/client.ts';

interface MoversViewProps {
  onOpenStockModal: (symbol: string) => void;
}

export const MoversView: React.FC<MoversViewProps> = ({ onOpenStockModal }) => {
  const [data, setData] = useState<MoversData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'GAINERS' | 'LOSERS' | 'VOLUME' | 'UNUSUAL'>('GAINERS');

  useEffect(() => {
    apiClient
      .getMarketMovers()
      .then((res) => setData(res))
      .catch((err) => console.error('Error fetching movers:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" />
        <p className="text-slate-400 text-sm">Screening live volume and price breakouts...</p>
      </div>
    );
  }

  if (!data) return null;

  const currentList =
    activeTab === 'GAINERS'
      ? data.gainers
      : activeTab === 'LOSERS'
      ? data.losers
      : activeTab === 'VOLUME'
      ? data.volumeLeaders
      : data.unusualActivity;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/30 p-6 rounded-xl border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1 rounded-md bg-rose-500/20 text-rose-400">
                <TrendingUp className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Momentum & Catalyst Tracking
              </span>
              <span className="text-xs text-slate-400">Live Tick Flow</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Market Movers, Volume Spikes & Verified Catalysts
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Real-time identification of outsized momentum, relative volume expansion (≥1.2x 30-day average),
              and verified regulatory catalysts driving share price action.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('GAINERS')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'GAINERS'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <ArrowUpRight className="h-4 w-4" />
              Top Gainers
            </button>
            <button
              onClick={() => setActiveTab('LOSERS')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'LOSERS'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <ArrowDownRight className="h-4 w-4" />
              Top Losers
            </button>
            <button
              onClick={() => setActiveTab('VOLUME')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'VOLUME'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Volume2 className="h-4 w-4" />
              Volume Leaders
            </button>
            <button
              onClick={() => setActiveTab('UNUSUAL')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'UNUSUAL'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Zap className="h-4 w-4" />
              Unusual Activity
            </button>
          </div>
        </div>
      </div>

      {/* Movers Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Company / Symbol</th>
                <th className="py-3.5 px-4 text-right">Price (₹)</th>
                <th className="py-3.5 px-4 text-right">Change (%)</th>
                <th className="py-3.5 px-4 text-right">Volume</th>
                <th className="py-3.5 px-4 text-right">Rel. Vol</th>
                <th className="py-3.5 px-4 text-center">Movement Score</th>
                <th className="py-3.5 px-4">Possible Verified Catalyst</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {currentList.map((item) => {
                const isPos = item.percentChange >= 0;
                return (
                  <tr
                    key={item.symbol}
                    className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    onClick={() => onOpenStockModal(item.symbol)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white group-hover:text-amber-400 transition-colors text-sm">
                          {item.symbol}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {item.sector}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        {item.companyName}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-100 text-sm">
                      ₹{(item.price ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td
                      className={`py-3.5 px-4 text-right font-mono font-bold text-sm ${
                        isPos ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPos ? '+' : ''}
                      {(item.percentChange ?? 0).toFixed(2)}%
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                      {(item.volume / 100000).toFixed(2)}L
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-semibold">
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          (item.relativeVolume || 1) >= 1.5
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'text-slate-400'
                        }`}
                      >
                        {(item.relativeVolume || 1.0).toFixed(2)}x
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400">
                        {item.movementScore}/100
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      {item.possibleFactors && item.possibleFactors.length > 0 ? (
                        <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
                          {item.possibleFactors[0]}
                        </p>
                      ) : (
                        <span className="text-slate-500 italic">Broader market rotation</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenStockModal(item.symbol);
                        }}
                        className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[11px] font-semibold transition-colors"
                      >
                        Research
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
