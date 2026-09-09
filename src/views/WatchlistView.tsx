import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  FileText,
  Trash2,
  ArrowUpRight,
  Plus,
  Bell,
  CheckCircle2,
  Sparkles,
  Search,
} from 'lucide-react';
import { apiClient } from '../api/client.ts';
import { WatchlistItem, SavedResearch, StockQuote } from '../types/index.ts';

interface WatchlistViewProps {
  onOpenStockModal: (symbol: string) => void;
  onWatchlistUpdated: () => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  onOpenStockModal,
  onWatchlistUpdated,
}) => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [savedResearch, setSavedResearch] = useState<SavedResearch[]>([]);
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'WATCHLIST' | 'DOSSIERS'>('WATCHLIST');

  // Quick Add modal state
  const [newSymbol, setNewSymbol] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [wl, sr, stocks] = await Promise.all([
        apiClient.getWatchlist(),
        apiClient.getSavedResearch(),
        apiClient.searchStocks(''),
      ]);
      setWatchlist(wl || []);
      setSavedResearch(sr || []);

      const qMap: Record<string, StockQuote> = {};
      stocks.forEach((s) => {
        qMap[s.symbol] = s;
      });
      setQuotes(qMap);
    } catch (err) {
      console.error('Error fetching watchlist data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRemove = async (symbol: string) => {
    try {
      await apiClient.removeFromWatchlist(symbol);
      setWatchlist(watchlist.filter((w) => w.symbol !== symbol));
      onWatchlistUpdated();
    } catch (err) {
      console.error('Error removing from watchlist:', err);
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol.trim()) return;
    try {
      setIsAdding(true);
      await apiClient.addToWatchlist({
        symbol: newSymbol.toUpperCase().trim(),
        notes: newNotes.trim(),
        dividendAlert: true,
        scoreAlert: true,
      });
      setNewSymbol('');
      setNewNotes('');
      await fetchData();
      onWatchlistUpdated();
    } catch (err) {
      console.error('Error adding to watchlist:', err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/30 p-6 rounded-xl border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1 rounded-md bg-amber-500/20 text-amber-400">
                <Bookmark className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Personalized Research Workspace
              </span>
              <span className="text-xs text-slate-400">Persistent Intelligence Cache</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Watchlist & Saved Research Dossiers
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Track priority shares, monitor target price alerts and corporate dividend declarations, and review
              historic IndianShares score snapshots.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('WATCHLIST')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'WATCHLIST'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Bookmark className="h-4 w-4" />
              Watchlist ({watchlist.length})
            </button>
            <button
              onClick={() => setActiveSubTab('DOSSIERS')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'DOSSIERS'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <FileText className="h-4 w-4" />
              Saved Dossiers ({savedResearch.length})
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'WATCHLIST' ? (
        <div className="space-y-6">
          {/* Add to Watchlist Bar */}
          <form
            onSubmit={handleAddStock}
            className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center gap-3 text-xs"
          >
            <div className="flex-1 w-full">
              <input
                type="text"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                placeholder="Stock Symbol to track (e.g., POLYCAB, CDSL, TRENT)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 uppercase placeholder-normal placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex-1 w-full">
              <input
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Optional thesis note (e.g. Accumulate below ₹5,000)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              disabled={isAdding || !newSymbol.trim()}
              className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus className="h-4 w-4" />
              Add to Watchlist
            </button>
          </form>

          {/* Watchlist Items */}
          {watchlist.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-xl space-y-3">
              <Bookmark className="h-8 w-8 text-slate-600 mx-auto" />
              <p className="text-slate-400 font-medium">Your watchlist is currently empty.</p>
              <p className="text-xs text-slate-500">
                Add stocks above or click "Research" on any stock to monitor live price alerts.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {watchlist.map((item) => {
                const quote = quotes[item.symbol];
                const isPos = quote ? quote.percentChange >= 0 : true;

                return (
                  <div
                    key={item.id}
                    className="p-5 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl transition-all shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3
                              onClick={() => onOpenStockModal(item.symbol)}
                              className="text-lg font-bold text-white hover:text-amber-400 cursor-pointer transition-colors"
                            >
                              {item.symbol}
                            </h3>
                            {quote && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                                {quote.sector}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{item.companyName}</p>
                        </div>

                        {quote ? (
                          <div className="text-right">
                            <span className="text-base font-bold font-mono text-white block">
                              ₹{(quote.price ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                            <span
                              className={`text-xs font-mono font-semibold block ${
                                isPos ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {isPos ? '+' : ''}
                              {(quote.percentChange ?? 0).toFixed(2)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Live feed loading...</span>
                        )}
                      </div>

                      {item.notes && (
                        <div className="mt-3 p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-lg text-xs text-slate-300">
                          <strong className="text-amber-400 block text-[10px] mb-0.5">
                            My Thesis Note:
                          </strong>
                          {item.notes}
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-400">
                        {item.dividendAlert && (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <Bell className="h-3 w-3" /> Dividend Alert Active
                          </span>
                        )}
                        {item.scoreAlert && (
                          <span className="flex items-center gap-1 text-amber-400">
                            <CheckCircle2 className="h-3 w-3" /> Score Shift Alert
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-500">
                        Added: {new Date(item.addedAt).toLocaleDateString('en-IN')}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOpenStockModal(item.symbol)}
                          className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                        >
                          View Dossier <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemove(item.symbol)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Remove from watchlist"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Saved Research Dossiers */
        <div className="space-y-4">
          {savedResearch.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-xl space-y-3">
              <FileText className="h-8 w-8 text-slate-600 mx-auto" />
              <p className="text-slate-400 font-medium">No saved research dossiers yet.</p>
              <p className="text-xs text-slate-500">
                Open any stock research page and click "Save Research Dossier" to store your notes and score snapshot.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedResearch.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onOpenStockModal(item.symbol)}
                  className="p-5 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer transition-all shadow-md group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors">
                          {item.symbol}
                        </span>
                        <span className="text-xs text-slate-400 font-normal">
                          {item.companyName}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono font-bold">
                          Score at save: {item.scoreAtSave}/100
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-200 mt-1">{item.title}</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.notes}</p>
                    </div>

                    <div className="text-right shrink-0 text-[11px] text-slate-500">
                      <span>{new Date(item.createdAt).toLocaleDateString('en-IN')}</span>
                      <div className="mt-2 text-amber-400 font-semibold flex items-center justify-end gap-1 text-xs">
                        Open <ArrowUpRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
