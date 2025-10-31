import { useEffect, useState, useRef, useCallback, lazy, Suspense } from "react";
import { Header } from "./components/Header";
import { SearchFirst } from "./components/SearchFirst";
import { BriefPanel } from "./components/BriefPanel";
import { MobileNav } from "./components/MobileNav";
import { SkeletonGrid } from "./components/SkeletonLoader";
import { CommandPalette } from "./components/CommandPalette";
import { useArticles } from "./hooks/useArticles";
import { useRealTimeScoring } from "./hooks/useRealTimeScoring";
import { useUI } from "./context/UIContext";
import { ErrorBoundary } from "./utils/errorBoundary";
import { logger } from "./utils/logger";
import type { Article } from "./types";
import "./index.css";

// Lazy load components for code splitting
const Dashboard = lazy(() => import("./components/Dashboard"));
const Bookmarks = lazy(() => import("./components/Bookmarks"));
const SettingsPanel = lazy(() => import("./components/SettingsPanel"));

function AppContent() {
  // Use context for UI state
  const { view, setView, sortMode, setSortMode, isPaletteOpen, setIsPaletteOpen, quickReadArticleUrl, setQuickReadArticleUrl } = useUI();

  // Map sort mode to query field
  const sortByField = sortMode === 'recency' ? 'publishedAt' : 'aiScore';

  // Use custom hook for articles
  const { articles, loading, isLoadingMore, error, hasMore, loadMore } = useArticles({
    pageSize: 20,
    sortBy: sortByField,
    sortOrder: 'desc',
  });

  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [displayArticles, setDisplayArticles] = useState<Article[]>([]);
  const lastLoadTimeRef = useRef(0);
  const rafIdRef = useRef<number | undefined>(undefined);
  const DEBOUNCE_MS = 300;

  // Enable real-time scoring to ensure older articles naturally move down the feed
  // Recalculates scores every 60 seconds to account for article age decay
  useRealTimeScoring({
    articles,
    onScoresUpdate: setDisplayArticles,
    updateInterval: 60000, // Update every 1 minute
    enabled: sortMode === 'smart', // Only for smart sort
  });

  // Handle scroll events for infinite loading with RAF for smooth scrolling
  const handleScroll = useCallback((e: Event) => {
    if (isLoadingMore || !hasMore) return;

    // Cancel previous RAF to avoid multiple pending updates
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);

    rafIdRef.current = requestAnimationFrame(() => {
      const now = Date.now();
      if (now - lastLoadTimeRef.current < DEBOUNCE_MS) return;

      const container = e.target as HTMLDivElement;
      if (!container) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

      console.log('[App] Scroll event - distance from bottom:', distanceFromBottom, 'isLoadingMore:', isLoadingMore, 'hasMore:', hasMore);

      if (distanceFromBottom < 500) {
        lastLoadTimeRef.current = now;
        console.log('[App] ✅ Loading more articles');
        void loadMore();
      }
    });
  }, [isLoadingMore, hasMore, loadMore]);

  // Log errors and pagination state
  useEffect(() => {
    if (error) {
      logger.error('App', 'Article loading error', { error });
    }
  }, [error]);



  // Manual test button for pagination
  const handleManualLoadMore = async () => {
    console.log('[App] Manual loadMore triggered');
    await loadMore();
  };

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
      // Ctrl+Shift+T to open test view
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        setView(view === 'test' ? 'feed' : 'test');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaletteOpen, setIsPaletteOpen, setQuickReadArticleUrl, view, setView]);

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
    <div className="h-screen w-full max-w-full overflow-x-hidden bg-gradient-to-b from-white via-[#F9FBFF]/30 to-[#E8F2FF]/20 flex flex-col">
      {/* Professional Header - Sticky */}
      <div className="sticky top-0 z-50">
        <Header isLoading={false} />
      </div>

      {/* Main Content Area */}
      {view === 'feed' ? (
        <div className="flex-1 flex gap-0 w-full max-w-full min-h-0">
          {/* Left: Search Results - Full Width */}
          <SearchFirst
            articles={sortMode === 'smart' && displayArticles.length > 0 ? displayArticles : articles}
            onArticleSelect={setSelectedArticle}
            selectedArticle={selectedArticle}
            sortMode={sortMode}
            onSortChange={setSortMode}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            onScroll={handleScroll}
          />
        </div>
      ) : view === 'dashboard' ? (
        <div className="flex-1 overflow-y-auto">
          <Dashboard articles={sortMode === 'smart' && displayArticles.length > 0 ? displayArticles : articles} />
        </div>
      ) : view === 'test' ? (
        <div className="flex-1 flex flex-col bg-gradient-to-b from-white via-[#F9FBFF]/30 to-[#E8F2FF]/20 p-4">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Pagination Test</h1>
            <div className="space-y-2">
              <p>Articles loaded: {articles.length}</p>
              <p>Has more: {hasMore ? 'Yes' : 'No'}</p>
              <p>Is loading: {isLoadingMore ? 'Yes' : 'No'}</p>
            </div>
            <button
              onClick={handleManualLoadMore}
              disabled={isLoadingMore || !hasMore}
              className="px-4 py-2 bg-[#5AA6FF] text-white rounded-lg disabled:opacity-50"
            >
              Load More Articles
            </button>
            <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
              {articles.map((article, idx) => (
                <div key={idx} className="p-2 bg-white rounded border border-[#C7D2E1]/25">
                  <p className="font-semibold text-sm">{idx + 1}. {article.title?.substring(0, 60)}...</p>
                  <p className="text-xs text-gray-500">Score: {article.smartScore}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : view === 'bookmarks' ? (
        <div className="flex-1 flex flex-col bg-gradient-to-b from-white via-[#F9FBFF]/30 to-[#E8F2FF]/20">
          <Suspense fallback={<SkeletonGrid />}>
            <Bookmarks onArticleSelect={setSelectedArticle} />
          </Suspense>
        </div>
      ) : view === 'settings' ? (
        <div className="flex-1 flex flex-col bg-gradient-to-b from-white via-[#F9FBFF]/30 to-[#E8F2FF]/20">
          <Suspense fallback={<SkeletonGrid />}>
            <SettingsPanel onSortChange={setSortMode} />
          </Suspense>
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
              <BriefPanel article={selectedArticle} onClose={() => setSelectedArticle(null)} />
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
