import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  TrendingUp,
  ShieldCheck,
  Calendar,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Clock,
  Sparkles,
  Info,
  Search,
  Filter,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { apiClient } from '../api/client.ts';
import { IpoItem } from '../types/index.ts';

export const IposView: React.FC = () => {
  const [selectedType, setSelectedType] = useState<'ALL' | 'MAINBOARD' | 'SME'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'OPEN' | 'UPCOMING' | 'CLOSED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [mainboardIpos, setMainboardIpos] = useState<IpoItem[]>([]);
  const [smeIpos, setSmeIpos] = useState<IpoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIpo, setExpandedIpo] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([apiClient.getMainboardIpos(), apiClient.getSmeIpos()])
      .then(([main, sme]) => {
        setMainboardIpos(main || []);
        setSmeIpos(sme || []);
      })
      .catch((err) => console.error('Error fetching IPOs:', err))
      .finally(() => setLoading(false));
  }, []);

  const allIpos = useMemo(() => [...mainboardIpos, ...smeIpos], [mainboardIpos, smeIpos]);

  const filteredIpos = useMemo(() => {
    return allIpos.filter((ipo) => {
      if (selectedType !== 'ALL' && ipo.ipoType !== selectedType) {
        return false;
      }
      if (selectedStatus !== 'ALL' && ipo.status !== selectedStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = ipo.companyName.toLowerCase().includes(q);
        const matchesDesc = ipo.description?.toLowerCase().includes(q) || false;
        const matchesType = ipo.ipoType.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesType) return false;
      }
      return true;
    });
  }, [allIpos, selectedType, selectedStatus, searchQuery]);

  // Summary Metrics
  const openCount = allIpos.filter((i) => i.status === 'OPEN').length;
  const upcomingCount = allIpos.filter((i) => i.status === 'UPCOMING').length;
  const mainboardCount = mainboardIpos.length;
  const smeCount = smeIpos.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="bg-gradient-to-r from-sky-950/40 via-slate-900 to-slate-900 p-6 rounded-xl border border-sky-500/20 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1 rounded-md bg-sky-500/20 text-sky-400">
                <Building2 className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                Primary Market Intelligence Desk
              </span>
              <span className="text-xs text-slate-400">NSE / BSE Mainboard & SME Offerings</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Upcoming & Active IPOs with Indicative GMP Intelligence
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Real-time tracking of Indian IPO offerings, live bidding subscriptions, lot sizes, SEBI DRHP filing metrics,
              and normalized Grey Market Premium (GMP) support scores across Mainboard and SME platforms.
            </p>
          </div>

          {/* Quick Filter Counts */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {openCount} Open for Bidding
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/20 text-xs font-bold">
              {upcomingCount} Upcoming Issues
            </span>
          </div>
        </div>

        {/* Statistical Summary Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs">
          <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Total IPO Pipeline</span>
            <span className="text-lg font-black text-white font-mono">{allIpos.length} Issues</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Mainboard & SME</span>
          </div>
          <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
            <span className="text-sky-400 block text-[11px]">Mainboard Offerings</span>
            <span className="text-lg font-black text-white font-mono">{mainboardCount} Issues</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Institutional Grade</span>
          </div>
          <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
            <span className="text-purple-400 block text-[11px]">SME Growth Platform</span>
            <span className="text-lg font-black text-white font-mono">{smeCount} Issues</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">NSE Emerge / BSE SME</span>
          </div>
          <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
            <span className="text-emerald-400 block text-[11px]">Highest Indicative GMP</span>
            <span className="text-lg font-black text-emerald-400 font-mono">+63.4%</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Strong Listing Support</span>
          </div>
        </div>

        {/* Disclaimer on GMP */}
        <div className="mt-5 p-3.5 bg-slate-950/80 rounded-lg border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-400 leading-relaxed">
          <Info className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-200">IndianShares GMP Disclosure:</strong> Grey Market Premium (GMP) is an
            indicative, unofficial market sentiment proxy observed among active market dealers. It does not represent a
            guaranteed listing price. IndianShares filters spurious rates and cross-checks QIB subscription momentum.
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-xl border border-slate-800 shadow-md">
        {/* Type Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 mr-1 font-semibold text-[11px] uppercase tracking-wider">Type:</span>
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              selectedType === 'ALL'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All IPOs ({allIpos.length})
          </button>
          <button
            onClick={() => setSelectedType('MAINBOARD')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              selectedType === 'MAINBOARD'
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Mainboard IPOs ({mainboardCount})
          </button>
          <button
            onClick={() => setSelectedType('SME')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              selectedType === 'SME'
                ? 'bg-purple-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            SME IPOs ({smeCount})
          </button>
        </div>

        {/* Status Filter & Search */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-slate-400 mr-1 font-semibold text-[11px] uppercase tracking-wider">Status:</span>
            <button
              onClick={() => setSelectedStatus('ALL')}
              className={`px-2.5 py-1.5 rounded text-[11px] font-medium transition-all ${
                selectedStatus === 'ALL'
                  ? 'bg-slate-700 text-white font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedStatus('OPEN')}
              className={`px-2.5 py-1.5 rounded text-[11px] font-medium transition-all ${
                selectedStatus === 'OPEN'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
              }`}
            >
              Open Now ({openCount})
            </button>
            <button
              onClick={() => setSelectedStatus('UPCOMING')}
              className={`px-2.5 py-1.5 rounded text-[11px] font-medium transition-all ${
                selectedStatus === 'UPCOMING'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                  : 'text-slate-400 hover:text-sky-400 hover:bg-slate-800'
              }`}
            >
              Upcoming ({upcomingCount})
            </button>
          </div>

          <div className="relative flex-1 md:w-56">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search company or sector..."
              className="w-full bg-slate-950 border border-slate-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500" />
          <p className="text-slate-400 text-sm">Aggregating SEBI primary market filings and GMP feeds...</p>
        </div>
      ) : filteredIpos.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
          <Building2 className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-semibold">No IPO offerings match your current filter.</p>
          <button
            onClick={() => {
              setSelectedType('ALL');
              setSelectedStatus('ALL');
              setSearchQuery('');
            }}
            className="mt-3 px-4 py-1.5 rounded-md bg-slate-800 text-slate-300 hover:text-white text-xs"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* IPO List */
        <div className="space-y-4">
          {filteredIpos.map((ipo) => {
            const isExpanded = expandedIpo === ipo.id;
            const minInv = ipo.priceBandMax * ipo.lotSize;
            const scores = ipo.scores;
            const gmp = ipo.latestGmp;
            const totalSub = ipo.subscriptions.find((s) => s.category === 'Total')?.timesSubscribed || 0;

            return (
              <div
                key={ipo.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl transition-all shadow-md overflow-hidden"
              >
                {/* Main Card Header */}
                <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                          ipo.ipoType === 'MAINBOARD'
                            ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                            : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        }`}
                      >
                        {ipo.ipoType} IPO
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          ipo.status === 'UPCOMING'
                            ? 'bg-amber-500/10 text-amber-400'
                            : ipo.status === 'OPEN'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        Status: {ipo.status}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Issue Size: ₹{(ipo.issueSizeCr ?? 0).toLocaleString('en-IN')} Cr
                      </span>
                      {ipo.listingDate && (
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Listing: {ipo.listingDate}
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl font-bold text-white mt-2">{ipo.companyName}</h2>
                    <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                      {ipo.description}
                    </p>
                  </div>

                  {/* Pricing & Key Metrics Block */}
                  <div className="flex flex-wrap items-center gap-6 justify-between lg:justify-end shrink-0">
                    {/* Price Band & Min Investment */}
                    <div className="text-left lg:text-right">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                        Price Band & Lot
                      </span>
                      <span className="text-base font-bold font-mono text-white">
                        ₹{ipo.priceBandMin} - ₹{ipo.priceBandMax}
                      </span>
                      <span className="text-xs text-slate-400 block font-mono">
                        Lot: {ipo.lotSize} shares (₹{(minInv ?? 0).toLocaleString('en-IN')})
                      </span>
                    </div>

                    {/* Indicative GMP */}
                    <div className="text-left lg:text-right pl-4 border-l border-slate-800">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                        Indicative GMP
                      </span>
                      {gmp ? (
                        <div>
                          <span className="text-base font-bold font-mono text-emerald-400">
                            +₹{gmp.gmpValue}{' '}
                            <span className="text-xs font-semibold">
                              (+{gmp.estimatedPremiumPercent.toFixed(1)}%)
                            </span>
                          </span>
                          <span className="text-[11px] text-slate-400 block font-mono">
                            Est. Listing: ~₹{gmp.estimatedListingPrice}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Awaiting quotes</span>
                      )}
                    </div>

                    {/* Subscription Status */}
                    <div className="text-left lg:text-right pl-4 border-l border-slate-800">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                        Subscription
                      </span>
                      <span className="text-base font-bold font-mono text-sky-400">
                        {totalSub > 0 ? `${totalSub.toFixed(2)}x` : 'Open / Pipeline'}
                      </span>
                      <span className="text-[11px] text-slate-400 block font-mono">
                        Demand: {scores?.demandScore ?? 50}/100
                      </span>
                    </div>

                    {/* Expand Toggle */}
                    <button
                      onClick={() => setExpandedIpo(isExpanded ? null : ipo.id)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="View Detailed Metrics"
                    >
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="bg-slate-950/80 border-t border-slate-800 p-5 space-y-6 animate-in slide-in-from-top duration-200">
                    {/* Bidding Timeline */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-slate-900 rounded border border-slate-800">
                        <span className="text-slate-400 block text-[11px]">Bidding Dates</span>
                        <span className="font-semibold text-white font-mono">
                          {ipo.openDate} to {ipo.closeDate}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-900 rounded border border-slate-800">
                        <span className="text-slate-400 block text-[11px]">Listing Date</span>
                        <span className="font-semibold text-emerald-400 font-mono">
                          {ipo.listingDate || 'To be announced'}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-900 rounded border border-slate-800">
                        <span className="text-slate-400 block text-[11px]">Fresh Issue / OFS</span>
                        <span className="font-semibold text-slate-200 font-mono">
                          ₹{ipo.freshIssueCr} Cr / ₹{ipo.ofsCr} Cr
                        </span>
                      </div>
                    </div>

                    {/* Subscription Breakdown Table */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                        SEBI Live Category-wise Subscription
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                        {ipo.subscriptions.map((sub) => (
                          <div
                            key={sub.category}
                            className="p-2.5 bg-slate-900 rounded border border-slate-800"
                          >
                            <span className="text-slate-400 text-[10px] uppercase block font-semibold">
                              {sub.category}
                            </span>
                            <span className="font-bold text-white font-mono text-sm block">
                              {sub.timesSubscribed.toFixed(2)}x
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono block">
                              Shares: {(sub.sharesBid ?? 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* GMP Intelligence Desk */}
                    {scores?.gmpSupportScore && (
                      <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                            <TrendingUp className="h-4 w-4" />
                            IndianShares GMP Support Analysis
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold font-mono">
                            {scores.gmpSupportScore.category} ({scores.gmpSupportScore.score}/100)
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {scores.gmpSupportScore.summary}
                        </p>
                        {gmp && (
                          <div className="text-[10px] text-slate-500 font-mono pt-1">
                            Source Desk: {gmp.source} • Observed: {gmp.observedAt ? new Date(gmp.observedAt).toLocaleDateString('en-IN') : 'Recent'}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 7-Pillar IndianShares Overall IPO Score Matrix */}
                    {scores && (
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                          IndianShares Multi-Pillar IPO Scoring Matrix
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                          <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-center">
                            <span className="text-slate-400 text-[10px] block">Business Model</span>
                            <span className="font-mono font-bold text-white text-sm">
                              {scores.overallIpoScore.business}/100
                            </span>
                          </div>
                          <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-center">
                            <span className="text-slate-400 text-[10px] block">Financials</span>
                            <span className="font-mono font-bold text-white text-sm">
                              {scores.overallIpoScore.financials}/100
                            </span>
                          </div>
                          <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-center">
                            <span className="text-slate-400 text-[10px] block">Valuation</span>
                            <span className="font-mono font-bold text-white text-sm">
                              {scores.overallIpoScore.valuation}/100
                            </span>
                          </div>
                          <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-center">
                            <span className="text-slate-400 text-[10px] block">QIB Subscription</span>
                            <span className="font-mono font-bold text-sky-400 text-sm">
                              {scores.overallIpoScore.subscription}/100
                            </span>
                          </div>
                          <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-center">
                            <span className="text-slate-400 text-[10px] block">GMP Support</span>
                            <span className="font-mono font-bold text-emerald-400 text-sm">
                              {scores.overallIpoScore.gmpSupport}/100
                            </span>
                          </div>
                          <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-center">
                            <span className="text-slate-400 text-[10px] block">Sector Context</span>
                            <span className="font-mono font-bold text-purple-400 text-sm">
                              {scores.overallIpoScore.marketSector}/100
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
