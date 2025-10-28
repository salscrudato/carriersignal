/**
 * Search-First UI Component for CarrierSignal v2
 * 
 * Innovative search interface with:
 * - Fuzzy search with typo tolerance
 * - Semantic understanding (synonyms)
 * - Real-time suggestions
 * - Visual match indicators
 * - Mobile-optimized
 */

import { useState, useEffect } from 'react';
import { Zap, Clock, ExternalLink } from 'lucide-react';
import { rankArticlesByAI, rankArticlesByRecency } from '../utils/rankingSystem';
import { InfiniteScrollLoader, ScrollSentinelLoader } from './InfiniteScrollLoader';

interface Article {
  title: string;
  url: string;
  source: string;
  publishedAt?: string;
  description?: string;
  image?: string;
  bullets5?: string[];
  tags?: {
    lob?: string[];
    perils?: string[];
    regions?: string[];
    companies?: string[];
    trends?: string[];
    regulations?: string[];
  };
  smartScore?: number;
  aiScore?: number;
  impactScore?: number;
  regulatory?: boolean;
  stormName?: string;
}

interface SearchFirstProps {
  articles: Article[];
  onArticleSelect: (article: Article) => void;
  selectedArticle?: Article | null;
  sortMode?: 'smart' | 'recency';
  onSortChange?: (sort: 'smart' | 'recency') => void;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  sentinelRef?: React.RefObject<HTMLDivElement | null>;
}

export function SearchFirst({
  articles,
  onArticleSelect,
  selectedArticle,
  sortMode = 'smart',
  onSortChange,
  isLoadingMore = false,
  hasMore = true,
  sentinelRef,
}: SearchFirstProps) {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [localSortBy, setLocalSortBy] = useState<'smart' | 'recency'>(sortMode || 'smart');

  // Display articles with sorting
  useEffect(() => {
    const timer = setTimeout(() => {
      // Map to results format
      const results = articles.map(article => ({
        article,
        score: article.aiScore || article.smartScore || 0,
        matchType: 'combined',
        highlights: [],
      }));

      // Apply sorting
      const sorted = applySorting(results, localSortBy);
      setSearchResults(sorted);
    }, 300);

    return () => clearTimeout(timer);
  }, [articles, localSortBy]);

  // Sorting function
  const applySorting = (results: any[], sortType: string) => {
    const articles = results.map(r => r.article);

    let sorted;
    if (sortType === 'smart') {
      // Smart sort: blend AI relevance with recency
      sorted = rankArticlesByAI(articles);
    } else {
      // Recency sort
      sorted = rankArticlesByRecency(articles);
    }

    // Map back to result format
    return sorted.map(article => ({
      article,
      score: (article as any).finalScore || article.aiScore || 0,
      matchType: 'combined',
      highlights: [],
    }));
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-0 flex flex-col h-full">

      {/* Sort Controls Header - Mobile Optimized */}
      <div className="sticky top-0 z-40 liquid-glass-premium border-b border-purple-200/30 shadow-sm p-3 sm:p-4 flex-shrink-0 w-full max-w-full overflow-x-hidden">
        <div className="flex items-center gap-2 sm:gap-3 w-full max-w-full overflow-x-hidden">
          {/* Sort Buttons - Two Options Only */}
          <div className="flex items-center gap-1 sm:gap-1.5 liquid-glass-light rounded-lg p-1 border border-purple-200/30 flex-shrink-0">
            <button
              onClick={() => {
                setLocalSortBy('smart');
                onSortChange?.('smart');
              }}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                localSortBy === 'smart'
                  ? 'liquid-glass-premium text-purple-700 shadow-md border border-purple-200/30'
                  : 'text-purple-600 hover:text-purple-900 hover:bg-purple-50/50'
              }`}
            >
              <Zap size={13} className="hidden sm:inline flex-shrink-0" />
              <Zap size={12} className="sm:hidden flex-shrink-0" />
              <span className="hidden sm:inline">AI Sort</span>
              <span className="sm:hidden">AI</span>
            </button>
            <button
              onClick={() => {
                setLocalSortBy('recency');
                onSortChange?.('recency');
              }}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                localSortBy === 'recency'
                  ? 'liquid-glass-premium text-blue-700 shadow-md border border-blue-200/30'
                  : 'text-blue-600 hover:text-blue-900 hover:bg-blue-50/50'
              }`}
            >
              <Clock size={13} className="hidden sm:inline flex-shrink-0" />
              <Clock size={12} className="sm:hidden flex-shrink-0" />
              <span className="hidden sm:inline">Recent</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>

          {/* Results Count - Right Aligned */}
          <div className="ml-auto text-xs text-blue-600 font-semibold whitespace-nowrap flex-shrink-0">
            <span className="hidden sm:inline">{searchResults.length} articles</span>
            <span className="sm:hidden">{searchResults.length} ARTICLES</span>
          </div>
        </div>
      </div>

      {/* Results - Scrollable */}
      <div className="flex-1 overflow-y-auto w-full max-w-full overflow-x-hidden">
        <div className="w-full max-w-full px-4 pb-20 pt-4 overflow-x-hidden">
          <div className="space-y-3 w-full max-w-full">
            {searchResults.map((result, idx) => (
              <SearchResultCard
                key={`${result.article.url}-${idx}`}
                result={result}
                isSelected={selectedArticle?.url === result.article.url}
                onSelect={() => onArticleSelect(result.article)}
                index={idx}
              />
            ))}
          </div>

          {/* Loading indicator for infinite scroll */}
          {isLoadingMore && (
            <div className="mt-6">
              <ScrollSentinelLoader />
            </div>
          )}

          {/* Sentinel element for infinite scroll trigger */}
          <div ref={sentinelRef} className="h-4 w-full" />

          {/* End of list or error states */}
          {!isLoadingMore && (
            <InfiniteScrollLoader
              isLoading={false}
              hasMore={hasMore}
              isEmpty={searchResults.length === 0}
              itemCount={3}
            />
          )}
        </div>
      </div>

    </div>
  );
}

/**
 * Individual search result card
 */
interface SearchResultCardProps {
  result: any;
  isSelected: boolean;
  onSelect: () => void;
  index?: number;
}

function SearchResultCard({ result, isSelected, onSelect, index = 0 }: SearchResultCardProps) {
  const { article } = result;
  const timeAgo = article.publishedAt ? getTimeAgo(new Date(article.publishedAt)) : 'Unknown';

  const handleViewMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  const handleViewArticle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (article.url) {
      window.open(article.url, '_blank');
    }
  };

  return (
    <div
      style={{ animationDelay: `${index * 50}ms` }}
      className={`w-full max-w-full rounded-xl border-2 transition-all duration-300 animate-slideInWithBounce overflow-hidden flex flex-col ${
        isSelected
          ? 'liquid-glass-ultra border-blue-300/50 shadow-lg animate-premiumGlow elevated-glow'
          : 'liquid-glass border-blue-200/30 hover:border-blue-300/50 hover:shadow-lg hover:scale-102 hover:animate-subtleGlowPulse micro-glow'
      }`}
    >
      {/* Gradient Accent Top - Blue to Purple to Pink */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80"></div>

      {/* Content Section with Subtle Gradient */}
      <div className="p-4 space-y-3 flex-1 flex flex-col bg-gradient-to-br from-white via-blue-50/20 to-purple-50/10 w-full max-w-full overflow-x-hidden">
        {/* Header with Source and Time (moved to top right) */}
        <div className="flex items-start justify-between gap-3 w-full max-w-full overflow-x-hidden">
          <div className="flex-1 min-w-0 overflow-hidden">
            <span className="text-xs font-semibold text-blue-600 bg-gradient-to-r from-blue-50 to-purple-50 px-2.5 py-1 rounded-full inline-block truncate">
              {article.source}
            </span>
          </div>
          {timeAgo && (
            <span className="text-xs text-blue-500 font-medium flex-shrink-0 whitespace-nowrap">{timeAgo}</span>
          )}
        </div>

        {/* Title - Enhanced Typography */}
        <h3 className="font-bold text-slate-900 text-sm md:text-base leading-snug line-clamp-3 hover:text-blue-700 transition-colors w-full max-w-full overflow-hidden break-words">
          {article.title}
        </h3>

        {/* AI-Generated Summary - Expanded with larger font */}
        {article.bullets5 && article.bullets5.length > 0 && (
          <div className="space-y-3 py-3 border-t border-blue-100 pt-3 w-full max-w-full overflow-x-hidden">
            <div className="flex items-center gap-2 w-full max-w-full overflow-x-hidden">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-blue-900 uppercase tracking-widest truncate">AI Summary</span>
            </div>
            <div className="space-y-2 w-full max-w-full overflow-x-hidden">
              {article.bullets5.slice(0, 3).map((bullet: string, idx: number) => (
                <div key={idx} className="flex gap-2 text-sm text-slate-700 leading-relaxed w-full max-w-full overflow-x-hidden">
                  <span className="text-blue-600 font-bold flex-shrink-0 mt-0.5">→</span>
                  <span className="flex-1 overflow-hidden break-words">{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags Section */}
        {article.tags && Object.values(article.tags).some((tagArray: any) => tagArray && tagArray.length > 0) && (
          <div className="space-y-2 py-3 border-t border-blue-100 pt-3 w-full max-w-full overflow-x-hidden">
            <div className="flex flex-wrap gap-2 w-full max-w-full">
              {/* LOB Tags */}
              {article.tags.lob && article.tags.lob.length > 0 && (
                article.tags.lob.map((tag: string, idx: number) => (
                  <span key={`lob-${idx}`} className="px-2.5 py-1 rounded-full liquid-glass-light text-slate-600 text-xs font-medium whitespace-nowrap border border-slate-200/40">
                    {tag}
                  </span>
                ))
              )}
              {/* Perils Tags */}
              {article.tags.perils && article.tags.perils.length > 0 && (
                article.tags.perils.map((tag: string, idx: number) => (
                  <span key={`perils-${idx}`} className="px-2.5 py-1 rounded-full liquid-glass-light text-slate-600 text-xs font-medium whitespace-nowrap border border-slate-200/40">
                    {tag}
                  </span>
                ))
              )}
              {/* Regions Tags */}
              {article.tags.regions && article.tags.regions.length > 0 && (
                article.tags.regions.map((tag: string, idx: number) => (
                  <span key={`regions-${idx}`} className="px-2.5 py-1 rounded-full liquid-glass-light text-slate-600 text-xs font-medium whitespace-nowrap border border-slate-200/40">
                    {tag}
                  </span>
                ))
              )}
              {/* Companies Tags */}
              {article.tags.companies && article.tags.companies.length > 0 && (
                article.tags.companies.map((tag: string, idx: number) => (
                  <span key={`companies-${idx}`} className="px-2.5 py-1 rounded-full liquid-glass-light text-slate-600 text-xs font-medium whitespace-nowrap border border-slate-200/40">
                    {tag}
                  </span>
                ))
              )}
              {/* Trends Tags */}
              {article.tags.trends && article.tags.trends.length > 0 && (
                article.tags.trends.map((tag: string, idx: number) => (
                  <span key={`trends-${idx}`} className="px-2.5 py-1 rounded-full liquid-glass-light text-slate-600 text-xs font-medium whitespace-nowrap border border-slate-200/40">
                    {tag}
                  </span>
                ))
              )}
              {/* Regulations Tags */}
              {article.tags.regulations && article.tags.regulations.length > 0 && (
                article.tags.regulations.map((tag: string, idx: number) => (
                  <span key={`regulations-${idx}`} className="px-2.5 py-1 rounded-full liquid-glass-light text-slate-600 text-xs font-medium whitespace-nowrap border border-slate-200/40">
                    {tag}
                  </span>
                ))
              )}
            </div>
          </div>
        )}

        {/* Bottom Action Buttons */}
        <div className="flex gap-2 pt-4 mt-auto border-t border-blue-100/50 pt-3 w-full max-w-full overflow-x-hidden">
          <button
            onClick={handleViewMore}
            className="flex-1 px-3 py-2 text-xs font-semibold text-blue-700 liquid-glass-light rounded-lg hover:border-blue-300/50 transition-all duration-200 min-h-[44px] touch-action-manipulation border border-blue-200/30"
          >
            View More
          </button>
          <button
            onClick={handleViewArticle}
            className="flex-1 px-3 py-2 text-xs font-semibold text-blue-700 liquid-glass-light rounded-lg hover:border-blue-300/50 transition-all duration-200 flex items-center justify-center gap-1 min-h-[44px] touch-action-manipulation border border-blue-200/30"
          >
            <span className="hidden sm:inline">View Article</span>
            <span className="sm:hidden">Article</span>
            <ExternalLink size={12} className="flex-shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Utility: Format time ago
 */
function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

