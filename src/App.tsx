import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { SearchFirst } from "./components/SearchFirst";
import { BriefPanel } from "./components/BriefPanel";
import { Dashboard } from "./components/Dashboard";
import { MobileNav } from "./components/MobileNav";
import { SkeletonGrid } from "./components/SkeletonLoader";
import { CommandPalette } from "./components/CommandPalette";
import { Bookmarks } from "./components/Bookmarks";
import { SettingsPanel } from "./components/SettingsPanel";
import { useInfiniteScroll } from "./hooks/useInfiniteScroll";
import { useArticles } from "./hooks/useArticles";
import { useUI } from "./context/UIContext";
import { ErrorBoundary } from "./utils/errorBoundary";
import { logger } from "./utils/logger";
import "./index.css";

function AppContent() {
  // Use context for UI state
  const { view, setView, sortMode, setSortMode, isPaletteOpen, setIsPaletteOpen, quickReadArticleUrl, setQuickReadArticleUrl } = useUI();

  // Use custom hook for articles
  const { articles, loading, error, hasMore, loadMore } = useArticles({
    pageSize: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  // Infinite scroll hook
  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    isLoading: false,
    hasMore,
    threshold: 0.1,
    rootMargin: '200px',
  });

  // Log errors
  useEffect(() => {
    if (error) {
      logger.error('App', 'Article loading error', { error });
    }
  }, [error]);

  // Keyboard shortcuts for Command-K and Quick Read
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command-K or Ctrl-K to open palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(!isPaletteOpen);
      }
      // Escape to close palette or quick read
      if (e.key === 'Escape') {
        setIsPaletteOpen(false);
        setQuickReadArticleUrl(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaletteOpen, setIsPaletteOpen, setQuickReadArticleUrl]);

  // Render
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-[#F9FBFF]/30 to-[#E8F2FF]/20 flex flex-col">
        <Header isLoading={true} />
        <SkeletonGrid />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-gradient-to-b from-white via-[#F9FBFF]/30 to-[#E8F2FF]/20 flex flex-col">
      {/* Professional Header */}
      <Header isLoading={false} />

      {/* Main Content Area */}
      {view === 'feed' ? (
        <div className="flex-1 flex gap-0 overflow-hidden w-full max-w-full">
          {/* Left: Search Results - Full Width on Mobile */}
          <div className="flex-1 overflow-y-auto w-full max-w-full overflow-x-hidden">
            <SearchFirst
              articles={articles}
              onArticleSelect={setSelectedArticle}
              selectedArticle={selectedArticle}
              sortMode={sortMode}
              onSortChange={setSortMode}
              isLoadingMore={false}
              hasMore={hasMore}
              sentinelRef={sentinelRef}
            />
          </div>

          {/* Right: Brief Panel (Desktop Only) */}
          <div className="hidden lg:flex lg:w-1/3 border-l border-[#C7D2E1]/30 overflow-y-auto bg-white flex-col w-full max-w-full overflow-x-hidden">
            {selectedArticle ? (
              <BriefPanel article={selectedArticle} />
            ) : (
              <div className="flex-1 flex items-center justify-center p-6 text-center">
                <div>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E8F2FF] to-[#E8F2FF] flex items-center justify-center mx-auto mb-4 animate-subtleGlowPulse">
                    <svg className="w-8 h-8 text-[#5AA6FF] animate-iconGlow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-[#64748B]">Select an article</p>
                  <p className="text-xs text-[#94A3B8] mt-1">to view detailed insights</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : view === 'dashboard' ? (
        <div className="flex-1 overflow-y-auto">
          <Dashboard articles={articles} />
        </div>
      ) : view === 'bookmarks' ? (
        <div className="flex-1 flex flex-col bg-gradient-to-b from-white via-[#F9FBFF]/30 to-[#E8F2FF]/20">
          <Bookmarks onArticleSelect={setSelectedArticle} />
        </div>
      ) : view === 'settings' ? (
        <div className="flex-1 flex flex-col bg-gradient-to-b from-white via-[#F9FBFF]/30 to-[#E8F2FF]/20">
          <SettingsPanel onSortChange={setSortMode} />
        </div>
      ) : null}

      {/* Mobile: Full-Screen Brief Panel Modal */}
      {selectedArticle && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50 flex items-end animate-fadeIn"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="w-full liquid-glass-ultra rounded-t-3xl max-h-[90vh] overflow-y-auto border-t border-[#C7D2E1]/30 animate-slideInUp"
            onClick={(e) => e.stopPropagation()}
          >
            <BriefPanel article={selectedArticle} />
          </div>
        </div>
      )}

      {/* Quick Read Modal */}
      {quickReadArticleUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setQuickReadArticleUrl(null)}
        >
          <div
            className="w-full max-w-2xl liquid-glass-ultra rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#C7D2E1]/30 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Quick Read content will be rendered here by QuickReadModal component */}
            <div className="p-6 text-center text-[#64748B]">
              <p>Quick Read feature coming soon...</p>
            </div>
          </div>
        </div>
      )}

      {/* Command Palette */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        articles={articles}
        onArticleSelect={setSelectedArticle}
      />

      {/* Mobile Navigation */}
      <MobileNav onViewChange={setView} currentView={view} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
