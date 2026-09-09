import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  Search,
  Sliders,
  Award,
  Bookmark,
  Building2,
  PieChart,
  DollarSign,
  Activity,
  Layers,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  X,
} from 'lucide-react';
import { MarketIndex, StockQuote } from '../types/index.ts';
import { apiClient } from '../api/client.ts';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenStockModal: (symbol: string) => void;
  watchlistCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenStockModal,
  watchlistCount,
}) => {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockQuote[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isResearchDropdownOpen, setIsResearchDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiClient
      .getMarketOverview()
      .then((data) => setIndices(data.indices || []))
      .catch((err) => console.error('Error fetching indices for header:', err));
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await apiClient.searchStocks(searchQuery);
        setSearchResults(res.slice(0, 6));
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close search and dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchResults([]);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsResearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 shadow-md text-slate-100">
      {/* Top Live Ticker Bar */}
      <div className="bg-slate-950 border-b border-slate-800/80 px-4 py-1.5 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-6 scrollbar-none">
          <div className="flex items-center gap-6 shrink-0">
            <span className="flex items-center gap-1.5 font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              MARKET LIVE
            </span>
            {indices.map((idx) => {
              const isPositive = (idx.change ?? 0) >= 0;
              return (
                <div key={idx.id} className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-200">{idx.name}:</span>
                  <span className="font-mono text-slate-100">
                    {(idx.currentValue ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <span
                    className={`font-mono text-[11px] font-medium px-1 rounded ${
                      isPositive ? 'text-emerald-400 bg-emerald-950/60' : 'text-rose-400 bg-rose-950/60'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {(idx.percentChange ?? 0).toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-3 text-slate-400 shrink-0 text-[11px]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              NSE / BSE Normalized Core
            </span>
            <span>•</span>
            <span>IndianShares Engine v1.0</span>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand & Tagline */}
        <div className="flex items-center justify-between">
          <div
            id="brand-logo"
            onClick={() => onSelectTab('market-desk')}
            className="cursor-pointer flex items-center gap-2.5 group"
          >
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-inner font-black text-white text-base tracking-tighter">
              IS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  INDIAN<span className="text-amber-500">SHARES</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Research Core
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Independent Indian Equity Research & Intelligence Platform
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div ref={searchRef} className="relative flex-1 max-w-md mx-auto md:mx-4 w-full">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              id="header-stock-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stocks (e.g., TRENT, POLYCAB, CDSL, TATAMOTORS)..."
              className="w-full bg-slate-800/90 border border-slate-700/80 rounded-lg pl-9 pr-8 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50 divide-y divide-slate-800">
              {searchResults.map((stock) => (
                <div
                  key={stock.symbol}
                  onClick={() => {
                    onOpenStockModal(stock.symbol);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="px-3.5 py-2.5 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-100 text-sm">{stock.symbol}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {stock.sector}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate max-w-[220px]">{stock.companyName}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm text-slate-100">
                      ₹{(stock.price ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <p
                      className={`font-mono text-xs ${
                        (stock.percentChange ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {(stock.percentChange ?? 0) >= 0 ? '+' : ''}
                      {(stock.percentChange ?? 0).toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Primary Navigation Buttons */}
        <nav className="flex items-center justify-between md:justify-end gap-1 overflow-x-auto text-xs sm:text-sm scrollbar-none py-1">
          <button
            id="nav-market-desk"
            onClick={() => onSelectTab('market-desk')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              currentTab === 'market-desk'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Market Desk</span>
          </button>

          <button
            id="nav-top10"
            onClick={() => onSelectTab('top10')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              currentTab === 'top10'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400" />
            <span>Top 10</span>
          </button>

          {/* Direct Dividend Tab */}
          <button
            id="nav-dividends"
            onClick={() => onSelectTab('dividends')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              currentTab === 'dividends'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400" />
            <span>Dividends</span>
            <span className="hidden lg:inline-block px-1.5 py-0.2 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
              Yield
            </span>
          </button>

          {/* Direct IPO Tab */}
          <button
            id="nav-ipos"
            onClick={() => onSelectTab('ipos')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              currentTab === 'ipos'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sky-400" />
            <span>Upcoming & SME IPOs</span>
            <span className="hidden lg:inline-block px-1.5 py-0.2 text-[9px] font-bold bg-sky-500/20 text-sky-300 rounded border border-sky-500/30">
              18+
            </span>
          </button>

          {/* Direct Institutional Tab */}
          <button
            id="nav-institutional"
            onClick={() => onSelectTab('institutional')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              currentTab === 'institutional'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <PieChart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-400" />
            <span>Suggested by Institutions</span>
            <span className="hidden xl:inline-block px-1.5 py-0.2 text-[9px] font-bold bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
              Smart Money
            </span>
          </button>

          <button
            id="nav-movers"
            onClick={() => onSelectTab('movers')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              currentTab === 'movers'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-rose-400" />
            <span>Movers</span>
          </button>

          <button
            id="nav-discover"
            onClick={() => onSelectTab('discover')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              currentTab === 'discover'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sliders className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Discover</span>
          </button>

          <button
            id="nav-watchlist"
            onClick={() => onSelectTab('watchlist')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              currentTab === 'watchlist'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Watchlist</span>
            {watchlistCount > 0 && (
              <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                {watchlistCount}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Secondary Quick Desk Strip (Visible on all screen sizes) */}
      <div className="bg-slate-950/90 border-t border-slate-800/80 px-4 py-1.5 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Quick Desk:
          </span>

          <button
            onClick={() => onSelectTab('market-desk')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 flex items-center gap-1 ${
              currentTab === 'market-desk'
                ? 'bg-slate-800 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Market Overview
          </button>

          <button
            onClick={() => onSelectTab('top10')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 flex items-center gap-1 ${
              currentTab === 'top10'
                ? 'bg-slate-800 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Award className="h-3 w-3 text-amber-400" />
            Top 10 IndianShares
          </button>

          <button
            onClick={() => onSelectTab('dividends')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
              currentTab === 'dividends'
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                : 'text-emerald-400/80 hover:text-emerald-300 hover:bg-emerald-950/40'
            }`}
          >
            <DollarSign className="h-3 w-3 text-emerald-400" />
            Dividends Desk (High Yield)
          </button>

          <button
            onClick={() => onSelectTab('ipos')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
              currentTab === 'ipos'
                ? 'bg-sky-950/80 text-sky-400 border border-sky-500/40'
                : 'text-sky-400/80 hover:text-sky-300 hover:bg-sky-950/40'
            }`}
          >
            <Building2 className="h-3 w-3 text-sky-400" />
            Upcoming IPOs & SME (18+)
          </button>

          <button
            onClick={() => onSelectTab('institutional')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
              currentTab === 'institutional'
                ? 'bg-purple-950/80 text-purple-400 border border-purple-500/40'
                : 'text-purple-400/80 hover:text-purple-300 hover:bg-purple-950/40'
            }`}
          >
            <PieChart className="h-3 w-3 text-purple-400" />
            Shares Suggested by Institutions
          </button>

          <button
            onClick={() => onSelectTab('movers')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 flex items-center gap-1 ${
              currentTab === 'movers'
                ? 'bg-slate-800 text-rose-400 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Market Movers
          </button>

          <button
            onClick={() => onSelectTab('discover')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 flex items-center gap-1 ${
              currentTab === 'discover'
                ? 'bg-slate-800 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Stock Screener
          </button>

          <button
            onClick={() => onSelectTab('watchlist')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 flex items-center gap-1 ${
              currentTab === 'watchlist'
                ? 'bg-slate-800 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Watchlist ({watchlistCount})
          </button>
        </div>
      </div>
    </header>
  );
};
