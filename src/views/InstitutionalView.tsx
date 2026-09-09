import React, { useState, useEffect, useMemo } from 'react';
import {
  PieChart,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Filter,
  Layers,
  Info,
  Sparkles,
  Award,
  Search,
} from 'lucide-react';
import { InstitutionalOverviewData, apiClient } from '../api/client.ts';
import { InstitutionalObservation } from '../types/index.ts';

interface InstitutionalViewProps {
  onOpenStockModal: (symbol: string) => void;
}

export const InstitutionalView: React.FC<InstitutionalViewProps> = ({ onOpenStockModal }) => {
  const [data, setData] = useState<InstitutionalOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<string>('SUGGESTED');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    apiClient
      .getInstitutionalData()
      .then((res) => setData(res))
      .catch((err) => console.error('Error fetching institutional data:', err))
      .finally(() => setLoading(false));
  }, []);

  const observations = data?.observations || [];
  const summary = data?.summary;

  // High conviction institutional suggested picks
  const suggestedPicks = useMemo(() => {
    return observations
      .filter((obs) => obs.score >= 80 || obs.direction === 'ACCUMULATION')
      .sort((a, b) => b.score - a.score);
  }, [observations]);

  const filtered = useMemo(() => {
    return observations.filter((obs) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSymbol = obs.symbol.toLowerCase().includes(q);
        const matchesName = obs.companyName.toLowerCase().includes(q);
        if (!matchesSymbol && !matchesName) return false;
      }

      if (filterMode === 'SUGGESTED') {
        return obs.score >= 80 || obs.direction === 'ACCUMULATION';
      }
      if (filterMode === 'ACCUMULATION') {
        return obs.direction === 'ACCUMULATION';
      }
      if (filterMode === 'HIGH_FII') {
        return obs.fiiHoldingPercent >= 20;
      }
      if (filterMode === 'HIGH_MF') {
        return obs.mutualFundHoldingPercent >= 12;
      }
      if (filterMode === 'CAUTION') {
        return obs.direction === 'CAUTION' || obs.direction === 'DISTRIBUTION';
      }
      return true;
    });
  }, [observations, filterMode, searchQuery]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500" />
        <p className="text-slate-400 text-sm">Aggregating BSE/NSE institutional shareholding disclosures...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 p-6 rounded-xl border border-purple-500/20 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1 rounded-md bg-purple-500/20 text-purple-400">
                <PieChart className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Smart Money & Ownership Intelligence
              </span>
              <span className="text-xs text-slate-400">BSE/NSE Shareholding Pattern Filings</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Shares Suggested by Institutions & FII / Mutual Fund Accumulation
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Systematic detection of FII/FPI and Mutual Fund accumulation patterns. Track companies where smart money
              is actively increasing stakes across consecutive quarters, backed by verified regulatory disclosures.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-bold">
              Market Posture: {summary?.overallSentiment || 'Selective Accumulation'}
            </span>
          </div>
        </div>

        {/* Macro Inflows Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-5 border-t border-slate-800/80 text-xs text-slate-300">
          <div className="p-3.5 bg-slate-950/70 rounded-lg border border-slate-800">
            <span className="text-purple-400 font-bold block mb-1">
              FII / FPI Quarterly Posture:
            </span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {summary?.fiiQuarterlyTrendComment}
            </p>
          </div>
          <div className="p-3.5 bg-slate-950/70 rounded-lg border border-slate-800">
            <span className="text-emerald-400 font-bold block mb-1">
              DII & Domestic Mutual Fund Absorption:
            </span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {summary?.diiQuarterlyTrendComment}
            </p>
          </div>
        </div>
      </div>

      {/* Featured: Shares Suggested by Institutions (Top Smart-Money High-Conviction Picks) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Top Shares Suggested by Institutions (High Conviction Accumulation)
            </h2>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Ranked by IndianShares Smart Money Absorption Algorithm
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestedPicks.slice(0, 6).map((stock, idx) => (
            <div
              key={stock.symbol}
              onClick={() => onOpenStockModal(stock.symbol)}
              className="bg-slate-900/95 border border-purple-500/30 hover:border-purple-400/60 rounded-xl p-4 transition-all shadow-lg hover:shadow-purple-500/10 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-amber-400 font-bold">#{idx + 1}</span>
                      <span className="font-black text-lg text-white group-hover:text-purple-300 transition-colors">
                        {stock.symbol}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate max-w-[180px]">{stock.companyName}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block">Conviction</span>
                    <span className="text-base font-black font-mono text-purple-400">
                      {stock.score}
                      <span className="text-xs text-slate-500 font-normal">/100</span>
                    </span>
                  </div>
                </div>

                {/* Institutional Badges */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Suggested by Institutions
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {stock.direction}
                  </span>
                </div>

                {/* Ownership Stats */}
                <div className="grid grid-cols-3 gap-2 mt-3 p-2 bg-slate-950/70 rounded-lg text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">FII Stake</span>
                    <span className="font-mono font-bold text-slate-200">{stock.fiiHoldingPercent.toFixed(1)}%</span>
                    <span className="text-[10px] font-mono text-emerald-400 block">
                      +{stock.fiiChangeQuarterly.toFixed(2)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">DII Stake</span>
                    <span className="font-mono font-bold text-slate-200">{stock.diiHoldingPercent.toFixed(1)}%</span>
                    <span className="text-[10px] font-mono text-emerald-400 block">
                      +{stock.diiChangeQuarterly.toFixed(2)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Mutual Funds</span>
                    <span className="font-mono font-bold text-slate-200">{stock.mutualFundHoldingPercent.toFixed(1)}%</span>
                    <span className="text-[10px] font-mono text-emerald-400 block">
                      +{stock.mfChangeQuarterly.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Key Reason */}
                <p className="text-[11px] text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
                  {stock.reasons[0]}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-purple-400 group-hover:text-purple-300 font-semibold">
                <span className="text-[10px] text-slate-400 font-mono">{stock.latestObservationPeriod}</span>
                <span className="flex items-center gap-1">
                  Research Dossier <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-xl border border-slate-800 shadow-md">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 mr-1 font-semibold text-[11px] uppercase tracking-wider">Filter:</span>
          <button
            onClick={() => setFilterMode('SUGGESTED')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              filterMode === 'SUGGESTED'
                ? 'bg-purple-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Shares Suggested by Institutions ({suggestedPicks.length})
          </button>
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              filterMode === 'ALL'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Tracked ({observations.length})
          </button>
          <button
            onClick={() => setFilterMode('ACCUMULATION')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              filterMode === 'ACCUMULATION'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Strong Accumulation ({summary?.netAccumulationCount || 0})
          </button>
          <button
            onClick={() => setFilterMode('HIGH_FII')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              filterMode === 'HIGH_FII'
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            High FII Stake (&gt;20%)
          </button>
          <button
            onClick={() => setFilterMode('HIGH_MF')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              filterMode === 'HIGH_MF'
                ? 'bg-indigo-500 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            High MF Stake (&gt;12%)
          </button>
        </div>

        <div className="relative flex-1 md:w-56">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stock (e.g., TRENT, POLYCAB)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Institutional Observations Detailed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((obs) => {
          const isAcc = obs.direction === 'ACCUMULATION';
          const isPos = obs.direction === 'POSITIVE';
          const isCaution = obs.direction === 'CAUTION' || obs.direction === 'DISTRIBUTION';

          return (
            <div
              key={obs.symbol}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all shadow-md flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3
                        onClick={() => onOpenStockModal(obs.symbol)}
                        className="text-lg font-bold text-white hover:text-amber-400 cursor-pointer transition-colors"
                      >
                        {obs.symbol}
                      </h3>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                          isAcc
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : isPos
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            : isCaution
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {obs.direction}
                      </span>
                      {obs.score >= 85 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Smart Money Favorite
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{obs.companyName}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                      Inst. Score
                    </span>
                    <span className="text-xl font-black font-mono text-purple-400">
                      {obs.score}
                      <span className="text-xs text-slate-500 font-normal">/100</span>
                    </span>
                  </div>
                </div>

                {/* Holdings Snapshot */}
                <div className="grid grid-cols-3 gap-2 mt-4 p-3 bg-slate-950/70 rounded-lg border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">FII / FPI Stake</span>
                    <span className="font-mono text-slate-200 font-bold">
                      {obs.fiiHoldingPercent.toFixed(2)}%
                    </span>
                    <span
                      className={`text-[10px] font-mono font-semibold block ${
                        obs.fiiChangeQuarterly >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {obs.fiiChangeQuarterly >= 0 ? '+' : ''}
                      {obs.fiiChangeQuarterly.toFixed(2)}% QoQ
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px]">DII Stake</span>
                    <span className="font-mono text-slate-200 font-bold">
                      {obs.diiHoldingPercent.toFixed(2)}%
                    </span>
                    <span
                      className={`text-[10px] font-mono font-semibold block ${
                        obs.diiChangeQuarterly >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {obs.diiChangeQuarterly >= 0 ? '+' : ''}
                      {obs.diiChangeQuarterly.toFixed(2)}% QoQ
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px]">Mutual Funds</span>
                    <span className="font-mono text-slate-200 font-bold">
                      {obs.mutualFundHoldingPercent.toFixed(2)}%
                    </span>
                    <span
                      className={`text-[10px] font-mono font-semibold block ${
                        obs.mfChangeQuarterly >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {obs.mfChangeQuarterly >= 0 ? '+' : ''}
                      {obs.mfChangeQuarterly.toFixed(2)}% QoQ
                    </span>
                  </div>
                </div>

                {/* Reasons & Signals */}
                <div className="mt-4 space-y-1.5 text-xs text-slate-300">
                  <span className="font-semibold text-slate-400 text-[11px] block">
                    Observed Institutional Catalysts & Rationale:
                  </span>
                  {obs.reasons.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px]">
                      <span className="text-purple-400 mt-0.5">•</span>
                      <span className="text-slate-300">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500 font-mono">
                  Source: {obs.quality.source} ({obs.latestObservationPeriod})
                </span>
                <button
                  onClick={() => onOpenStockModal(obs.symbol)}
                  className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                >
                  Full Institutional Trend <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
