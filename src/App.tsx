import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import { Header } from "./components/Header";
import { SearchFirst } from "./components/SearchFirst";
import { BriefPanel } from "./components/BriefPanel";
import { Dashboard } from "./components/Dashboard";
import { MobileNav } from "./components/MobileNav";
import { SkeletonGrid } from "./components/SkeletonLoader";
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
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [view, setView] = useState<'feed' | 'dashboard'>('feed');

  // Real-time Firestore listener for latest 100 articles
  useEffect(() => {
    const q = query(
      collection(db, "articles"),
      orderBy("publishedAt", "desc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        })) as Article[];

        setArticles(docs);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching articles:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Render
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
        <Header isLoading={true} />
        <SkeletonGrid />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      {/* Professional Header */}
      <Header isLoading={false} view={view} onViewChange={setView} />

      {/* Main Content Area */}
      {view === 'feed' ? (
        <div className="flex-1 flex gap-0 overflow-hidden">
          {/* Left: Search Results - Full Width on Mobile */}
          <div className="flex-1 overflow-y-auto">
            <SearchFirst
              articles={articles}
              onArticleSelect={setSelectedArticle}
              selectedArticle={selectedArticle}
            />
          </div>

          {/* Right: Brief Panel (Desktop Only) */}
          <div className="hidden lg:flex lg:w-1/3 border-l border-slate-200 overflow-y-auto bg-white flex-col">
            {selectedArticle ? (
              <BriefPanel
                article={selectedArticle}
                onClose={() => setSelectedArticle(null)}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center p-6 text-center">
                <div>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      ) : (
        <div className="flex-1 overflow-y-auto">
          <Dashboard articles={articles} />
        </div>
      )}

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
              onClose={() => setSelectedArticle(null)}
            />
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      <MobileNav onViewChange={setView} currentView={view} />
    </div>
  );
}
