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
import type { Article } from "./types";
import "./index.css";

function AppContent() {
  // Use context for UI state
  const { view, setView, sortMode, setSortMode, isPaletteOpen, setIsPaletteOpen, quickReadArticleUrl, setQuickReadArticleUrl } = useUI();

  // Use custom hook for articles
  const { articles, loading, isLoadingMore, error, hasMore, loadMore } = useArticles({
    pageSize: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Infinite scroll hook
  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    isLoading: isLoadingMore,
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
          {/* Left: Search Results - Full Width */}
          <div className="flex-1 overflow-y-auto w-full max-w-full overflow-x-hidden">
            <SearchFirst
              articles={articles}
              onArticleSelect={setSelectedArticle}
              selectedArticle={selectedArticle}
              sortMode={sortMode}
              onSortChange={setSortMode}
              isLoadingMore={isLoadingMore}
              hasMore={hasMore}
              sentinelRef={sentinelRef}
            />
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

      {/* Article Details Modal - Desktop and Mobile */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center lg:items-end p-4 lg:p-0 animate-fadeIn overflow-hidden"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="w-full lg:w-full lg:rounded-t-3xl lg:max-h-[90vh] max-w-2xl lg:max-w-none liquid-glass-ultra rounded-3xl lg:rounded-t-3xl max-h-[90vh] border border-[#C7D2E1]/30 lg:border-t lg:border-l-0 lg:border-r-0 lg:border-b-0 animate-slideInUp lg:animate-slideInUp flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-y-auto flex-1">
              <BriefPanel article={selectedArticle} />
            </div>
          </div>
        </div>
      )}

      {/* Quick Read Modal */}
      {quickReadArticleUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fadeIn overflow-hidden"
          onClick={() => setQuickReadArticleUrl(null)}
        >
          <div
            className="w-full max-w-2xl liquid-glass-ultra rounded-3xl max-h-[90vh] shadow-2xl border border-[#C7D2E1]/30 animate-scaleIn flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-y-auto flex-1">
              {/* Quick Read content will be rendered here by QuickReadModal component */}
              <div className="p-6 text-center text-[#64748B]">
                <p>Quick Read feature coming soon...</p>
              </div>
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
