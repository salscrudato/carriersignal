import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import { Header } from "./components/Header";
import { SearchFirst } from "./components/SearchFirst";
import { BriefPanel } from "./components/BriefPanel";
import { Dashboard } from "./components/Dashboard";
import { MobileNav } from "./components/MobileNav";
import { SkeletonGrid } from "./components/SkeletonLoader";
import { CommandPalette } from "./components/CommandPalette";
import { Bookmarks } from "./components/Bookmarks";
import { SettingsPanel } from "./components/SettingsPanel";
import "./index.css";

type Article = {
  title: string;
  url: string;
  source: string;
  publishedAt?: string;
  bullets5?: string[];
  description?: string;
  content?: string;
  image?: string;
  whyItMatters?: Record<string, string>;
  tags?: {
    lob?: string[];
    perils?: string[];
    regions?: string[];
    companies?: string[];
    trends?: string[];
    regulations?: string[];
  };
  riskPulse?: 'LOW' | 'MEDIUM' | 'HIGH';
  sentiment?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  confidence?: number;
  createdAt?: Date | { toDate: () => Date };
  relevanceScore?: number;
  recencyScore?: number;
  combinedScore?: number;
  disasterScore?: number;
  weatherScore?: number;
  financialScore?: number;
  // v2 fields
  citations?: string[];
  impactScore?: number;
  impactBreakdown?: {
    market: number;
    regulatory: number;
    catastrophe: number;
    technology: number;
  };
  confidenceRationale?: string;
  leadQuote?: string;
  disclosure?: string;
  smartScore?: number;
  aiScore?: number;
  regulatory?: boolean;
  clusterId?: string;
  regionsNormalized?: string[];
  companiesNormalized?: string[];
  stormName?: string;
  advisoryId?: string;
};

export default function App() {
  // Core state
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [view, setView] = useState<'feed' | 'dashboard' | 'bookmarks' | 'settings'>('feed');

  // A1: Global UI state for enhanced experience
  const [sortMode, setSortMode] = useState<'smart' | 'recency'>('smart');
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [quickReadArticle, setQuickReadArticle] = useState<Article | null>(null);

  // Real-time Firestore listener for latest 100 articles
  useEffect(() => {
    const q = query(
      collection(db, "articles"),
      orderBy("createdAt", "desc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log(`[Firestore] Received ${snapshot.docs.length} articles`);
        const docs = snapshot.docs.map((doc) => ({
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        })) as Article[];

        setArticles(docs);
        setLoading(false);
      },
      (error) => {
        console.error("[Error] Error fetching articles:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // A1: Keyboard shortcuts for Command-K and Quick Read
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
        setQuickReadArticle(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaletteOpen]);

  // Render
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-purple-50/20 flex flex-col">
        <Header isLoading={true} />
        <SkeletonGrid />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-gradient-to-b from-white via-blue-50/30 to-purple-50/20 flex flex-col">
      {/* Professional Header */}
      <Header
        isLoading={false}
      />

      {/* Main Content Area */}
      {view === 'feed' ? (
        <div className="flex-1 flex gap-0 overflow-hidden w-full max-w-full">
          {/* Left: Search Results - Full Width on Mobile */}
          <div className="flex-1 overflow-y-auto w-full max-w-full overflow-x-hidden">
            <SearchFirst
              articles={articles as any[]}
              onArticleSelect={(article: any) => setSelectedArticle(article)}
              selectedArticle={selectedArticle as any}
              sortMode={sortMode}
              onSortChange={setSortMode}
            />
          </div>

          {/* Right: Brief Panel (Desktop Only) */}
          <div className="hidden lg:flex lg:w-1/3 border-l border-blue-200/30 overflow-y-auto bg-white flex-col w-full max-w-full overflow-x-hidden">
            {selectedArticle ? (
              <BriefPanel
                article={selectedArticle}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center p-6 text-center">
                <div>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-4 animate-subtleGlowPulse">
                    <svg className="w-8 h-8 text-blue-600 animate-iconGlow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-600">Select an article</p>
                  <p className="text-xs text-slate-500 mt-1">to view detailed insights</p>
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
        <div className="flex-1 flex flex-col bg-gradient-to-b from-white via-blue-50/30 to-purple-50/20">
          <Bookmarks onArticleSelect={setSelectedArticle} />
        </div>
      ) : view === 'settings' ? (
        <div className="flex-1 flex flex-col bg-gradient-to-b from-white via-blue-50/30 to-purple-50/20">
          <SettingsPanel
            onSortChange={setSortMode}
          />
        </div>
      ) : null}

      {/* Mobile: Full-Screen Brief Panel Modal */}
      {selectedArticle && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50 flex items-end"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="w-full bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <BriefPanel
              article={selectedArticle}
            />
          </div>
        </div>
      )}

      {/* Quick Read Modal */}
      {quickReadArticle && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setQuickReadArticle(null)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Quick Read content will be rendered here by QuickReadModal component */}
            <div className="p-6 text-center text-slate-500">
              <p>Quick Read feature coming soon...</p>
            </div>
          </div>
        </div>
      )}

      {/* A3: Command Palette */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        articles={articles as any[]}
        onArticleSelect={(article: any) => setSelectedArticle(article)}
      />

      {/* Mobile Navigation */}
      <MobileNav onViewChange={setView} currentView={view} />
    </div>
  );
}
