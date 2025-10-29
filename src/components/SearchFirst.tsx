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
      <div className="sticky top-0 z-40 liquid-glass-premium border-b border-[#C7D2E1]/25 shadow-sm p-3 sm:p-4 flex-shrink-0 w-full max-w-full overflow-x-hidden">
        <div className="flex items-center gap-2 sm:gap-3 w-full max-w-full overflow-x-hidden">
          {/* Sort Buttons - Two Options Only */}
          <div className="flex items-center gap-1 sm:gap-1.5 liquid-glass-light rounded-lg p-1 border border-[#C7D2E1]/25 flex-shrink-0">
            <button
              onClick={() => {
                setLocalSortBy('smart');
                onSortChange?.('smart');
              }}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                localSortBy === 'smart'
                  ? 'liquid-glass-premium text-[#5AA6FF] shadow-md border border-[#5AA6FF]/30'
                  : 'text-[#5AA6FF] hover:text-[#8B7CFF] hover:bg-[#F9FBFF]/50'
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
                  ? 'liquid-glass-premium text-[#8B7CFF] shadow-md border border-[#8B7CFF]/30'
                  : 'text-[#8B7CFF] hover:text-[#5AA6FF] hover:bg-[#F9FBFF]/50'
              }`}
            >
              <Clock size={13} className="hidden sm:inline flex-shrink-0" />
              <Clock size={12} className="sm:hidden flex-shrink-0" />
              <span className="hidden sm:inline">Recent</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>

          {/* Results Count - Right Aligned */}
          <div className="ml-auto text-xs text-[#5AA6FF] font-semibold whitespace-nowrap flex-shrink-0">
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
          ? 'liquid-glass-ultra border-[#5AA6FF]/60 shadow-lg animate-premiumGlow elevated-glow'
          : 'liquid-glass border-[#C7D2E1]/40 hover:border-[#5AA6FF]/60 hover:shadow-lg hover:scale-102 hover:animate-subtleGlowPulse micro-glow'
      }`}
    >
      {/* Gradient Accent Top - Aurora Colors */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#5AA6FF] via-[#8B7CFF] to-[#B08CFF] opacity-90 shadow-md"></div>

      {/* Content Section with Subtle Gradient */}
      <div className="p-4 space-y-3 flex-1 flex flex-col bg-gradient-to-br from-white via-[#F9FBFF]/25 to-[#E8F2FF]/15 w-full max-w-full overflow-x-hidden">
        {/* Header with Source and Time (moved to top right) */}
        <div className="flex items-start justify-between gap-3 w-full max-w-full overflow-x-hidden">
          <div className="flex-1 min-w-0 overflow-hidden">
            <span className="text-xs font-semibold text-[#5AA6FF] bg-gradient-to-r from-[#F9FBFF] to-[#E8F2FF] px-2.5 py-1 rounded-full inline-block truncate">
              {article.source}
            </span>
          </div>
          {timeAgo && (
            <span className="text-xs text-[#8B7CFF] font-medium flex-shrink-0 whitespace-nowrap">{timeAgo}</span>
          )}
        </div>

        {/* Title - Enhanced Typography */}
        <h3 className="font-bold text-[#0F172A] text-sm md:text-base leading-snug line-clamp-3 hover:text-[#5AA6FF] transition-colors w-full max-w-full overflow-hidden break-words">
          {article.title}
        </h3>

        {/* AI-Generated Summary - Expanded with larger font */}
        {article.bullets5 && article.bullets5.length > 0 && (
          <div className="space-y-3 py-3 border-t border-[#C7D2E1]/25 pt-3 w-full max-w-full overflow-x-hidden">
            <div className="flex items-center gap-2 w-full max-w-full overflow-x-hidden">
              <div className="w-5 h-5 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-[#0F172A] uppercase tracking-widest truncate">AI Summary</span>
            </div>
            <div className="space-y-2 w-full max-w-full overflow-x-hidden">
              {article.bullets5.slice(0, 3).map((bullet: string, idx: number) => (
                <div key={idx} className="flex gap-2 text-sm text-[#2D3748] leading-relaxed w-full max-w-full overflow-x-hidden">
                  <span className="text-[#5AA6FF] font-bold flex-shrink-0 mt-0.5">→</span>
                  <span className="flex-1 overflow-hidden break-words">{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags Section */}
        {article.tags && Object.values(article.tags).some((tagArray: any) => tagArray && tagArray.length > 0) && (
          <div className="space-y-2 py-3 border-t border-[#C7D2E1]/25 pt-3 w-full max-w-full overflow-x-hidden">
            <div className="flex flex-wrap gap-2 w-full max-w-full">
              {/* LOB Tags - Cyan */}
              {article.tags.lob && article.tags.lob.length > 0 && (
                article.tags.lob.map((tag: string, idx: number) => (
                  <span key={`lob-${idx}`} className="px-2.5 py-1 rounded-full liquid-glass-light text-[#06B6D4] text-xs font-medium whitespace-nowrap border border-[#06B6D4]/30">
                    {tag}
                  </span>
                ))
              )}
              {/* Perils Tags - Indigo */}
              {article.tags.perils && article.tags.perils.length > 0 && (
                article.tags.perils.map((tag: string, idx: number) => (
                  <span key={`perils-${idx}`} className="px-2.5 py-1 rounded-full liquid-glass-light text-[#5AA6FF] text-xs font-medium whitespace-nowrap border border-[#5AA6FF]/30">
                    {tag}
                  </span>
                ))
              )}
              {/* Regions Tags - Aurora Blue */}
              {article.tags.regions && article.tags.regions.length > 0 && (
                article.tags.regions.map((tag: string, idx: number) => (
                  <span key={`regions-${idx}`} className="px-2.5 py-1 rounded-full liquid-glass-light text-[#5AA6FF] text-xs font-medium whitespace-nowrap border border-[#5AA6FF]/30">
                    {tag}
                  </span>
                ))
              )}
              {/* Companies Tags - Aurora Violet */}
              {article.tags.companies && article.tags.companies.length > 0 && (
                article.tags.companies.map((tag: string, idx: number) => (
                  <span key={`companies-${idx}`} className="px-2.5 py-1 rounded-full liquid-glass-light text-[#8B7CFF] text-xs font-medium whitespace-nowrap border border-[#8B7CFF]/30">
                    {tag}
                  </span>
                ))
              )}
              {/* Trends Tags - Aurora Lilac */}
              {article.tags.trends && article.tags.trends.length > 0 && (
                article.tags.trends.map((tag: string, idx: number) => (
                  <span key={`trends-${idx}`} className="px-2.5 py-1 rounded-full liquid-glass-light text-[#B08CFF] text-xs font-medium whitespace-nowrap border border-[#B08CFF]/30">
                    {tag}
                  </span>
                ))
              )}
              {/* Regulations Tags - Aurora Blue */}
              {article.tags.regulations && article.tags.regulations.length > 0 && (
                article.tags.regulations.map((tag: string, idx: number) => (
                  <span key={`regulations-${idx}`} className="px-2.5 py-1 rounded-full liquid-glass-light text-[#5AA6FF] text-xs font-medium whitespace-nowrap border border-[#5AA6FF]/30">
                    {tag}
                  </span>
                ))
              )}
            </div>
          </div>
        )}

        {/* Bottom Action Buttons */}
        <div className="flex gap-2 pt-4 mt-auto border-t border-[#C7D2E1]/25 pt-3 w-full max-w-full overflow-x-hidden">
          <button
            onClick={handleViewMore}
            className="flex-1 px-3 py-2 text-xs font-semibold text-[#5AA6FF] liquid-glass-light rounded-lg hover:border-[#5AA6FF]/50 transition-all duration-200 min-h-[44px] touch-action-manipulation border border-[#C7D2E1]/30"
          >
            View More
          </button>
          <button
            onClick={handleViewArticle}
            className="flex-1 px-3 py-2 text-xs font-semibold text-[#5AA6FF] liquid-glass-light rounded-lg hover:border-[#5AA6FF]/50 transition-all duration-200 flex items-center justify-center gap-1 min-h-[44px] touch-action-manipulation border border-[#C7D2E1]/30"
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

