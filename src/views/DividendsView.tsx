import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import { DividendItem } from '../types/index.ts';
import { apiClient } from '../api/client.ts';

interface DividendsViewProps {
  onOpenStockModal: (symbol: string) => void;
}

export const DividendsView: React.FC<DividendsViewProps> = ({ onOpenStockModal }) => {
  const [dividends, setDividends] = useState<DividendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'HIGH_YIELD' | 'UPCOMING'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    apiClient
      .getDividends()
      .then((res) => setDividends(res.items || []))
      .catch((err) => console.error('Error fetching dividends:', err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = dividends.filter((item) => {
    if (searchQuery) {
      const match =
        item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.companyName.toLowerCase().includes(searchQuery.toLowerCase());
      if (!match) return false;
    }
    if (filterType === 'HIGH_YIELD') {
      return item.dividendYield >= 2.0;
    }
    if (filterType === 'UPCOMING') {
      return new Date(item.exDate).getTime() >= Date.now() - 86400000;
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 p-6 rounded-xl border border-emerald-500/20 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
                <DollarSign className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Corporate Actions Intelligence
              </span>
              <span className="text-xs text-slate-400">BSE / NSE Disclosures</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Dividend Yield & Payout Sustainability Desk
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Analyze confirmed dividend declarations, record dates, ex-dividend calendars, and IndianShares proprietary
              payout sustainability scoring based on balance sheet free cash flow.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300">
              Only verified board resolutions are listed as confirmed payouts.
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterType === 'ALL'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Tracked ({dividends.length})
            </button>
            <button
              onClick={() => setFilterType('HIGH_YIELD')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterType === 'HIGH_YIELD'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              High Yield (≥2.0%)
            </button>
            <button
              onClick={() => setFilterType('UPCOMING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterType === 'UPCOMING'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Upcoming Ex-Dates
            </button>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dividend shares..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Dividends Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((item) => {
          const score = item.dividendScore;
          const isStrong = score?.rating === 'Strong';

          return (
            <div
              key={item.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all shadow-md flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3
                        onClick={() => onOpenStockModal(item.symbol)}
                        className="text-base font-bold text-white hover:text-amber-400 cursor-pointer transition-colors"
                      >
                        {item.symbol}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800 font-semibold">
                        {item.dividendType} Dividend
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        FY24-25
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{item.companyName}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black font-mono text-emerald-400 block">
                      ₹{item.amountPerShare.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Yield: <strong className="text-white">{item.dividendYield.toFixed(2)}%</strong>
                    </span>
                  </div>
                </div>

                {/* Key Corporate Action Dates */}
                <div className="grid grid-cols-3 gap-2 mt-4 p-3 bg-slate-950/70 rounded-lg border border-slate-800/80 text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Ex-Dividend Date</span>
                    <span className="font-mono text-slate-200 font-semibold">{item.exDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Record Date</span>
                    <span className="font-mono text-slate-200 font-semibold">{item.recordDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Payout Date</span>
                    <span className="font-mono text-slate-200 font-semibold">{item.payoutDate}</span>
                  </div>
                </div>

                {/* IndianShares Dividend Intelligence Breakdown */}
                {score && (
                  <div className="mt-4 p-3.5 bg-slate-900 border border-slate-800 rounded-lg space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        Payout Sustainability Score:
                      </span>
                      <span
                        className={`font-bold font-mono px-2 py-0.5 rounded text-xs ${
                          isStrong
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {score.score}/100 • {score.rating}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-400 pt-1">
                      <p>
                        <strong className="text-slate-300">Consistency:</strong> {score.consistency}
                      </p>
                      <p>
                        <strong className="text-slate-300">Cash Flow Support:</strong> {score.cashFlowSupport}
                      </p>
                      <p>
                        <strong className="text-slate-300">Payout Sustainability:</strong> {score.payoutSustainability}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500">
                  Payout Ratio: ~{item.payoutRatioPercent}%
                </span>
                <button
                  onClick={() => onOpenStockModal(item.symbol)}
                  className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                >
                  View Balance Sheet & FCF <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
