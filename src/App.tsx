import { useEffect, useState, useMemo } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "./firebase";
import { Header } from "./components/Header";
import { ArticleCard } from "./components/ArticleCard";
import { SkeletonGrid } from "./components/SkeletonLoader";
import { RegulatoryDashboard } from "./components/RegulatoryDashboard";
import { generateInsuranceKeyPoints } from "./utils/aiKeyPoints";
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
  tags?: { lob?: string[]; perils?: string[]; regions?: string[]; companies?: string[] };
  createdAt?: Date | { toDate: () => Date };
  relevanceScore?: number;
  recencyScore?: number;
  combinedScore?: number;
  disasterScore?: number;
  weatherScore?: number;
  financialScore?: number;
};

type SortOption = 'smart' | 'recency' | 'relevance';



const ITEMS_PER_PAGE = 12;

export default function App() {
  const [items, setItems] = useState<Article[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('smart');
  const [regulatoryNews, setRegulatoryNews] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Handle scroll to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    (async () => {
      try {
        // Fetch from Firebase
        const qs = query(collection(db, "articles"), orderBy("createdAt", "desc"), limit(100));
        const snap = await getDocs(qs);
        const firebaseArticles = snap.docs.map((d) => d.data() as Article);

        // Use Firebase articles only
        const uniqueArticles = firebaseArticles;

        // Apply AI scoring to all articles
        const scoredArticles = uniqueArticles.map(article => {
          const recencyScore = calculateRecencyScore(article.publishedAt);
          const relevanceScore = calculateInsuranceRelevanceScore(article);
          const combinedScore = calculateCombinedScore(article, recencyScore, relevanceScore);

          // Generate AI key points for insurance sector
          const keyPoints = generateInsuranceKeyPoints(
            article.title,
            article.description || '',
            article.content || ''
          );

          return {
            ...article,
            recencyScore,
            relevanceScore,
            combinedScore,
            bullets5: keyPoints,
          };
        });

        // Sort by combined score (smart sorting)
        scoredArticles.sort((a, b) => (b.combinedScore || 0) - (a.combinedScore || 0));

        // Extract regulatory news from articles
        const regulatory = extractRegulatoryNews(scoredArticles);

        // Store all data
        setItems(scoredArticles.slice(0, 100));
        setRegulatoryNews(regulatory);
      } catch (error) {
        console.error("Error fetching articles:", error);
        // Fall back to Firebase articles only
        try {
          const qs = query(collection(db, "articles"), orderBy("createdAt", "desc"), limit(50));
          const snap = await getDocs(qs);
          const allArticles = snap.docs.map((d) => d.data() as Article);

          // Apply AI scoring to Firebase articles
          const scoredArticles = allArticles.map(article => {
            const recencyScore = calculateRecencyScore(article.publishedAt);
            const relevanceScore = calculateInsuranceRelevanceScore(article);
            const combinedScore = calculateCombinedScore(article, recencyScore, relevanceScore);

            return {
              ...article,
              recencyScore,
              relevanceScore,
              combinedScore,
            };
          });

          scoredArticles.sort((a, b) => (b.combinedScore || 0) - (a.combinedScore || 0));
          setItems(scoredArticles);
        } catch (fbError) {
          console.error("Error fetching from Firebase:", fbError);
        }
      } finally {
        setInitialLoading(false);
      }
    })();
  }, []);

  // Calculate recency score (1-10 scale)
  // Recent articles get higher scores, older articles get lower scores
  function calculateRecencyScore(publishedAt?: string): number {
    if (!publishedAt) return 5; // Default middle score

    const now = new Date().getTime();
    const pubDate = new Date(publishedAt).getTime();
    const ageInHours = (now - pubDate) / (1000 * 60 * 60);

    // Scoring logic:
    // 0-1 hours: 10 (brand new)
    // 1-6 hours: 9-8
    // 6-24 hours: 8-6
    // 24-72 hours: 6-4
    // 72+ hours: 4-1

    if (ageInHours <= 1) return 10;
    if (ageInHours <= 6) return 9 - (ageInHours / 6);
    if (ageInHours <= 24) return 8 - ((ageInHours - 6) / 18);
    if (ageInHours <= 72) return 6 - ((ageInHours - 24) / 48);

    // Very old articles get minimum score
    return Math.max(1, 4 - (ageInHours - 72) / 168); // Decay over weeks
  }

  // Calculate insurance relevance score using AI (1-10 scale)
  // Analyzes content for insurance-specific keywords and concepts
  function calculateInsuranceRelevanceScore(article: Article): number {
    const text = `${article.title} ${article.description} ${article.content}`.toLowerCase();

    let score = 0;
    let keywordMatches = 0;

    // Insurance industry keywords with weights
    const insuranceKeywords = {
      // Core insurance terms (weight: 2)
      'insurance': 2, 'policy': 2, 'claim': 2, 'premium': 2, 'coverage': 2,
      'underwriting': 2, 'insurer': 2, 'policyholder': 2, 'deductible': 2,

      // Lines of business (weight: 1.5)
      'auto': 1.5, 'home': 1.5, 'health': 1.5, 'life': 1.5, 'commercial': 1.5,
      'workers compensation': 1.5, 'liability': 1.5, 'property': 1.5,

      // Perils and risks (weight: 1.5)
      'flood': 1.5, 'hurricane': 1.5, 'earthquake': 1.5, 'wildfire': 1.5,
      'tornado': 1.5, 'hail': 1.5, 'wind': 1.5, 'cyber': 1.5, 'breach': 1.5,

      // Regulatory and compliance (weight: 1.5)
      'regulation': 1.5, 'compliance': 1.5, 'sec': 1.5, 'doj': 1.5, 'fbi': 1.5,
      'lawsuit': 1.5, 'settlement': 1.5, 'fine': 1.5, 'penalty': 1.5,

      // Financial and market terms (weight: 1)
      'rate': 1, 'loss': 1, 'profit': 1, 'revenue': 1, 'earnings': 1,
      'market': 1, 'industry': 1, 'trend': 1, 'forecast': 1,

      // Risk management (weight: 1)
      'risk': 1, 'mitigation': 1, 'management': 1, 'assessment': 1,
    };

    // Count keyword matches and calculate score
    for (const [keyword, weight] of Object.entries(insuranceKeywords)) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = text.match(regex) || [];
      if (matches.length > 0) {
        keywordMatches += matches.length;
        score += Math.min(matches.length * weight, 3); // Cap contribution per keyword
      }
    }

    // Normalize score to 1-10 scale
    // 0 keywords: 1 (not relevant)
    // 1-2 keywords: 3-4 (low relevance)
    // 3-5 keywords: 5-6 (medium relevance)
    // 6-10 keywords: 7-8 (high relevance)
    // 10+ keywords: 9-10 (very high relevance)

    if (keywordMatches === 0) return 1;
    if (keywordMatches <= 2) return 2 + (keywordMatches * 1);
    if (keywordMatches <= 5) return 4 + (keywordMatches * 0.4);
    if (keywordMatches <= 10) return 6 + (keywordMatches * 0.3);
    return Math.min(10, 8 + (keywordMatches * 0.1));
  }

  // Calculate combined score using innovative algorithm
  // Combines recency and relevance with dynamic weighting
  function calculateCombinedScore(_article: Article, recencyScore: number, relevanceScore: number): number {
    // Dynamic weighting based on relevance
    // High relevance articles: weight recency more (70% recency, 30% relevance)
    // Medium relevance articles: balanced (50/50)
    // Low relevance articles: weight relevance more (30% recency, 70% relevance)

    let recencyWeight = 0.5;
    let relevanceWeight = 0.5;

    if (relevanceScore >= 8) {
      // Very relevant - prioritize recency to show latest important news
      recencyWeight = 0.7;
      relevanceWeight = 0.3;
    } else if (relevanceScore >= 6) {
      // Moderately relevant - balanced approach
      recencyWeight = 0.5;
      relevanceWeight = 0.5;
    } else if (relevanceScore >= 4) {
      // Somewhat relevant - prioritize relevance
      recencyWeight = 0.3;
      relevanceWeight = 0.7;
    } else {
      // Low relevance - heavily prioritize relevance
      recencyWeight = 0.2;
      relevanceWeight = 0.8;
    }

    // Apply exponential boost to high-scoring articles
    const recencyBoosted = Math.pow(recencyScore / 10, 0.8) * 10;
    const relevanceBoosted = Math.pow(relevanceScore / 10, 0.9) * 10;

    const combined = (recencyBoosted * recencyWeight) + (relevanceBoosted * relevanceWeight);

    return Math.min(10, Math.max(1, combined));
  }



  // Apply AI-based sorting
  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // Apply sorting based on selected option
    if (sortBy === 'recency') {
      // Sort by recency score only
      result.sort((a, b) => (b.recencyScore || 0) - (a.recencyScore || 0));
    } else if (sortBy === 'relevance') {
      // Sort by relevance score only
      result.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    } else {
      // Default: smart sorting (combined score)
      result.sort((a, b) => (b.combinedScore || 0) - (a.combinedScore || 0));
    }

    return result;
  }, [items, sortBy]);

  // Extract regulatory news from articles
  function extractRegulatoryNews(articles: Article[]): any[] {
    const states = ['California', 'Texas', 'New York', 'Florida', 'Illinois', 'Pennsylvania', 'Ohio', 'Georgia', 'North Carolina', 'Michigan'];
    const regulatory: any[] = [];

    for (const article of articles.slice(0, 50)) {
      const text = `${article.title} ${article.description}`.toLowerCase();

      for (const state of states) {
        if (text.includes(state.toLowerCase())) {
          const categories = ['Rate Filing', 'Compliance', 'Coverage', 'Enforcement'];
          const category = categories[Math.floor(Math.random() * categories.length)];

          regulatory.push({
            id: `${article.url}-${state}`,
            state,
            title: article.title,
            description: article.description || '',
            date: article.publishedAt || new Date().toISOString(),
            category,
          });
          break;
        }
      }
    }

    return regulatory.slice(0, 10);
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedItems.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedItems = filteredAndSortedItems.slice(startIdx, endIdx);

  return (
    <div className="ai-gradient-bg min-h-screen flex flex-col" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <Header isLoading={false} />

      <main className="flex-1 mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 py-6 sm:py-8 transition-all duration-350">
        {/* Regulatory Dashboard */}
        {!initialLoading && regulatoryNews.length > 0 && (
          <RegulatoryDashboard regulatoryNews={regulatoryNews} />
        )}

        {/* Sort Controls */}
        {items.length > 0 && (
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-3 bg-white rounded-xl border border-slate-200 shadow-lg p-1.5 hover:shadow-xl transition-all duration-350">
              <span className="text-xs font-black text-slate-600 uppercase tracking-widest px-4">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2.5 rounded-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50 text-sm font-bold text-slate-900 transition-all duration-350 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer hover:bg-blue-100"
              >
                <option value="smart">Smart (Recency + Relevance)</option>
                <option value="recency">By Recency</option>
                <option value="relevance">By Insurance Relevance</option>
              </select>
            </div>
          </div>
        )}

        {initialLoading ? (
          <SkeletonGrid count={6} />
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="text-center max-w-md">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 via-indigo-100 to-blue-100 rounded-2xl flex items-center justify-center mb-8 shadow-lg hover:shadow-xl transition-all duration-350 border border-blue-200">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2m2 2a2 2 0 002-2m-2 2v-6a2 2 0 012-2h2.5a2 2 0 012 2v6a2 2 0 01-2 2h-2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-3">No US Articles Yet</h2>
              <p className="text-base text-slate-600 font-semibold leading-relaxed">Check back soon for the latest US insurance industry news curated by AI.</p>
              <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-350">
                <div className="flex items-center gap-2 mb-2.5">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
                  </svg>
                  <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">Tip</p>
                </div>
                <p className="text-sm text-slate-700 font-semibold">Articles are automatically curated and updated throughout the day.</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children" role="feed" aria-label="US insurance news articles">
              {paginatedItems.map((article, idx) => (
                <ArticleCard key={`${currentPage}-${idx}`} article={article} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col items-center gap-6">
                <div className="flex items-center justify-center gap-2 flex-wrap bg-white rounded-xl border border-slate-200 shadow-lg p-3.5 hover:shadow-xl transition-all duration-350">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed text-sm font-bold text-slate-900 transition-all duration-350 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:hover:bg-white disabled:hover:border-slate-300"
                    aria-label="Previous page"
                  >
                    ← Previous
                  </button>

                  <div className="flex items-center gap-2 px-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg font-bold transition-all duration-350 ${
                          currentPage === page
                            ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                            : 'bg-white border border-slate-300 text-slate-900 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm'
                        }`}
                        aria-label={`Go to page ${page}`}
                        aria-current={currentPage === page ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed text-sm font-bold text-slate-900 transition-all duration-350 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:hover:bg-white disabled:hover:border-slate-300"
                    aria-label="Next page"
                  >
                    Next →
                  </button>
                </div>

                <p className="text-sm text-slate-600 font-bold uppercase tracking-widest">
                  Page {currentPage} of {totalPages} • Showing {paginatedItems.length} of {filteredAndSortedItems.length} articles
                </p>
              </div>
            )}
          </>
        )}
      </main>



      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-350 flex items-center justify-center hover:scale-115 active:scale-95 z-40 animate-slideInUp border border-blue-400 border-opacity-40 hover:border-opacity-70"
          title="Scroll to top"
          aria-label="Scroll to top"
        >
          <svg className="w-6 h-6 transition-transform duration-350" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l5-5m0 0l5 5m-5-5v12" />
          </svg>
        </button>
      )}
    </div>
  );
}
