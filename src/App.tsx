import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { StockDetailModal } from './components/StockDetailModal.tsx';
import { MarketDeskView } from './views/MarketDeskView.tsx';
import { Top10View } from './views/Top10View.tsx';
import { DividendsView } from './views/DividendsView.tsx';
import { IposView } from './views/IposView.tsx';
import { InstitutionalView } from './views/InstitutionalView.tsx';
import { MoversView } from './views/MoversView.tsx';
import { DiscoverView } from './views/DiscoverView.tsx';
import { WatchlistView } from './views/WatchlistView.tsx';
import { apiClient } from './api/client.ts';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('market-desk');
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string | null>(null);
  const [watchlistCount, setWatchlistCount] = useState<number>(0);

  const refreshWatchlistCount = async () => {
    try {
      const items = await apiClient.getWatchlist();
      setWatchlistCount(items.length);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshWatchlistCount();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenStockModal={(symbol) => setSelectedStockSymbol(symbol)}
        watchlistCount={watchlistCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {currentTab === 'market-desk' && (
          <MarketDeskView
            onOpenStockModal={(sym) => setSelectedStockSymbol(sym)}
            onSelectTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'top10' && (
          <Top10View onOpenStockModal={(sym) => setSelectedStockSymbol(sym)} />
        )}

        {currentTab === 'dividends' && (
          <DividendsView onOpenStockModal={(sym) => setSelectedStockSymbol(sym)} />
        )}

        {currentTab === 'ipos' && <IposView />}

        {currentTab === 'institutional' && (
          <InstitutionalView onOpenStockModal={(sym) => setSelectedStockSymbol(sym)} />
        )}

        {currentTab === 'movers' && (
          <MoversView onOpenStockModal={(sym) => setSelectedStockSymbol(sym)} />
        )}

        {currentTab === 'discover' && (
          <DiscoverView onOpenStockModal={(sym) => setSelectedStockSymbol(sym)} />
        )}

        {currentTab === 'watchlist' && (
          <WatchlistView
            onOpenStockModal={(sym) => setSelectedStockSymbol(sym)}
            onWatchlistUpdated={refreshWatchlistCount}
          />
        )}
      </main>

      {/* Stock Research Dossier Modal */}
      {selectedStockSymbol && (
        <StockDetailModal
          symbol={selectedStockSymbol}
          onClose={() => setSelectedStockSymbol(null)}
          onWatchlistUpdated={refreshWatchlistCount}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
