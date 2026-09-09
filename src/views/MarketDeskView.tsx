import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { MarketOverviewData, apiClient } from '../api/client.ts';

interface MarketDeskViewProps {
  onOpenStockModal: (symbol: string) => void;
  onSelectTab: (tab: string) => void;
}

export const MarketDeskView: React.FC<MarketDeskViewProps> = ({ onOpenStockModal, onSelectTab }) => {
  const [data, setData] = useState<MarketOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getMarketOverview();
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load market overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" />
        <p className="text-slate-400 text-sm">Synthesizing live NSE/BSE market intelligence...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-rose-950/30 border border-rose-900 rounded-xl my-8">
        <p className="text-rose-300 font-medium">Failed to communicate with IndianShares Data Core</p>
        <p className="text-xs text-rose-400 mt-1">{error}</p>
        <button
          onClick={fetchOverview}
          className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { indices, breadth, sectors, topGainers, topLosers, recentNews } = data;
  const advancePercent = Math.round((breadth.advances / breadth.totalTraded) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Overview Top Headline & Quick Action Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6 rounded-xl border border-slate-800 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              NSE / BSE Overview
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Live Indian Market Hours (09:15 - 15:30 IST)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Indian Equity Market Intelligence Desk
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Normalized price action, real-time market breadth, sector rotation trends, and IndianShares proprietary
            catalyst tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('top10')}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-md hover:shadow-amber-500/20 transition-all flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Top 10 IndianShares
          </button>
          <button
            onClick={() => onSelectTab('ipos')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg border border-slate-700 transition-colors flex items-center gap-2"
          >
            IPO & GMP Desk
          </button>
        </div>
      </div>

      {/* Major Indices Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Activity className="h-4 w-4 text-amber-500" />
            Benchmark & Broad Indices
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Updated: {new Date(data.timestamp).toLocaleTimeString('en-IN')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {indices.map((idx) => {
            const isPos = idx.change >= 0;
            return (
              <div
                key={idx.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all hover:shadow-lg relative overflow-hidden group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block">{idx.name}</span>
                    <span className="text-xl font-bold font-mono text-white mt-1 block">
                      {(idx.currentValue ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div
                    className={`p-1.5 rounded-md ${
                      isPos ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {isPos ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </div>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <span
                    className={`text-xs font-mono font-bold flex items-center gap-0.5 ${
                      isPos ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPos ? '+' : ''}
                    {(idx.change ?? 0).toFixed(2)} ({isPos ? '+' : ''}
                    {(idx.percentChange ?? 0).toFixed(2)}%)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Prev: {(idx.previousClose ?? 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>L: {(idx.dayLow ?? (idx as any).low ?? 0).toLocaleString('en-IN')}</span>
                  <span>H: {(idx.dayHigh ?? (idx as any).high ?? 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Market Breadth + Sector Heatmap Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Market Breadth Card (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <PieChart className="h-4 w-4 text-emerald-400" />
              Market Breadth (NSE)
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              ADR: {breadth.advanceDeclineRatio.toFixed(2)}
            </span>
          </div>

          {/* Graphical Breadth Bar */}
          <div>
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${advancePercent}%` }}
                className="bg-emerald-500 transition-all duration-500"
                title={`Advances: ${breadth.advances}`}
              />
              <div
                style={{
                  width: `${Math.round((breadth.unchanged / breadth.totalTraded) * 100)}%`,
                }}
                className="bg-slate-500 transition-all duration-500"
                title={`Unchanged: ${breadth.unchanged}`}
              />
              <div
                style={{
                  width: `${Math.round((breadth.declines / breadth.totalTraded) * 100)}%`,
                }}
                className="bg-rose-500 transition-all duration-500"
                title={`Declines: ${breadth.declines}`}
              />
            </div>
            <div className="flex justify-between items-center text-xs mt-2 text-slate-400 font-mono">
              <span className="text-emerald-400 font-semibold">{breadth.advances} Advances</span>
              <span className="text-slate-400">{breadth.unchanged} Unchanged</span>
              <span className="text-rose-400 font-semibold">{breadth.declines} Declines</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">52-Week Highs</span>
              <span className="text-lg font-bold font-mono text-emerald-400 mt-0.5 block">
                {breadth.fiftyTwoWeekHighs}
              </span>
              <span className="text-[10px] text-slate-500">Fresh annual peaks</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">52-Week Lows</span>
              <span className="text-lg font-bold font-mono text-rose-400 mt-0.5 block">
                {breadth.fiftyTwoWeekLows}
              </span>
              <span className="text-[10px] text-slate-500">Fresh annual troughs</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-800/40 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-white">IndianShares Liquidity Note:</span> Market breadth shows
            a positive advance-decline bias with {breadth.advances} stocks advancing against {breadth.declines} declining,
            reflecting broad-based participation across mid and large caps.
          </div>
        </div>

        {/* Sector Performance Grid (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Layers className="h-4 w-4 text-sky-400" />
              Sector Rotation & Performance
            </h2>
            <span className="text-xs text-slate-400">Relative Sector Strength</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {sectors.map((s) => {
              const isPos = s.percentChange >= 0;
              return (
                <div
                  key={s.sector}
                  className="p-3 bg-slate-950/60 border border-slate-800/90 hover:border-slate-700 rounded-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 truncate">{s.sector}</span>
                    <span
                      className={`text-xs font-mono font-bold ${
                        isPos ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPos ? '+' : ''}
                      {s.percentChange.toFixed(2)}%
                    </span>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-400 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Leader:</span>
                      {(() => {
                        const item = s.leadingStocks?.[0];
                        const sym = typeof item === 'object' && item ? (item as any).symbol : item;
                        return (
                          <button
                            onClick={() => sym && onOpenStockModal(sym)}
                            className="text-amber-400 hover:underline font-mono font-medium"
                          >
                            {sym || '—'}
                          </button>
                        );
                      })()}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Laggard:</span>
                      {(() => {
                        const item = s.laggingStocks?.[0];
                        const sym = typeof item === 'object' && item ? (item as any).symbol : item;
                        return (
                          <button
                            onClick={() => sym && onOpenStockModal(sym)}
                            className="text-slate-400 hover:underline font-mono"
                          >
                            {sym || '—'}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Gainers & Losers with Verified Catalysts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4" />
              Leading Gainers (With Verified Catalysts)
            </h2>
            <button
              onClick={() => onSelectTab('movers')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium"
            >
              All Movers <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800">
            {topGainers.map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => onOpenStockModal(stock.symbol)}
                className="py-3 px-2 hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors group flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white group-hover:text-amber-400 transition-colors text-sm">
                      {stock.symbol}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {stock.sector}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono">
                      IS Score: {stock.movementScore}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate max-w-[280px] mt-0.5">
                    {stock.companyName}
                  </p>
                  {stock.possibleFactors && stock.possibleFactors.length > 0 && (
                    <p className="text-[11px] text-emerald-400/90 mt-1 font-medium">
                      💡 {stock.possibleFactors[0]}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono text-sm font-bold text-white">
                    ₹{(stock.price ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs font-mono font-bold text-emerald-400">
                    +{(stock.percentChange ?? 0).toFixed(2)}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Vol: {((stock.volume ?? 0) / 100000).toFixed(1)}L shares
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
              <ArrowDownRight className="h-4 w-4" />
              Leading Laggards (Downside Pressure)
            </h2>
            <button
              onClick={() => onSelectTab('movers')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium"
            >
              All Movers <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800">
            {topLosers.map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => onOpenStockModal(stock.symbol)}
                className="py-3 px-2 hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors group flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white group-hover:text-amber-400 transition-colors text-sm">
                      {stock.symbol}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {stock.sector}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate max-w-[280px] mt-0.5">
                    {stock.companyName}
                  </p>
                  {stock.possibleFactors && stock.possibleFactors.length > 0 && (
                    <p className="text-[11px] text-rose-400/90 mt-1 font-medium">
                      ⚠️ {stock.possibleFactors[0]}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono text-sm font-bold text-white">
                    ₹{(stock.price ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs font-mono font-bold text-rose-400">
                    {(stock.percentChange ?? 0).toFixed(2)}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Vol: {((stock.volume ?? 0) / 100000).toFixed(1)}L shares
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Verified Corporate News & Filing Desk */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-amber-500" />
            Verified Exchange Disclosures & Corporate Catalysts
          </h2>
          <span className="text-xs text-slate-400">BSE/NSE Regulatory Filings Feed</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentNews.map((news) => {
            const isPos = news.sentiment === 'POSITIVE';
            const isNeg = news.sentiment === 'NEGATIVE';
            return (
              <div
                key={news.id}
                onClick={() => news.symbol && onOpenStockModal(news.symbol)}
                className="p-4 bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 rounded-lg cursor-pointer transition-all hover:bg-slate-900/60 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-amber-400">{news.symbol || 'MARKET'}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        isPos
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : isNeg
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {news.sentiment}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-slate-100 line-clamp-2 leading-snug">
                    {news.headline}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {news.summary}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{news.source}</span>
                  <span>{new Date(news.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
