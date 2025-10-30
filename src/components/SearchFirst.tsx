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

import { useState, useEffect, useRef } from 'react';
import { Zap, Clock, ExternalLink } from 'lucide-react';
import { InfiniteScrollLoader, ScrollSentinelLoader } from './InfiniteScrollLoader';
import { calculateDynamicArticleScore } from '../utils/scoring';

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
  onScroll?: (e: Event) => void;
}

export function SearchFirst({
  articles,
  onArticleSelect,
  selectedArticle,
  sortMode = 'smart',
  onSortChange,
  isLoadingMore = false,
  hasMore = true,
  onScroll,
}: SearchFirstProps) {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [localSortBy, setLocalSortBy] = useState<'smart' | 'recency'>(sortMode || 'smart');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Display articles with dynamic scoring and sorting
  useEffect(() => {
    // Map to results format with dynamic score calculation
    let results = articles.map(article => {
      // Calculate dynamic score in real-time to account for article age
      const dynamicScore = calculateDynamicArticleScore(article);
      return {
        article,
        score: dynamicScore,
        matchType: 'combined',
        highlights: [],
      };
    });

    // Sort based on localSortBy
    // Smart sort: Uses dynamic scoring that accounts for recency decay
    // Recency sort: Uses published date
    if (localSortBy === 'smart') {
      results.sort((a, b) => b.score - a.score);
    } else if (localSortBy === 'recency') {
      results.sort((a, b) => {
        const getTime = (date: any) => {
          if (!date) return 0;
          if (date instanceof Date) return date.getTime();
          if (typeof date === 'object' && 'toDate' in date) return date.toDate().getTime();
          return new Date(date).getTime();
        };
        const dateA = getTime((a.article as any).publishedAt);
        const dateB = getTime((b.article as any).publishedAt);
        return dateB - dateA;
      });
    }

    setSearchResults(results);
  }, [articles, localSortBy]);

  // Attach scroll listener to the scrollable container with passive option for better performance
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !onScroll) return;

    // Use passive listener for better scroll performance
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll, { passive: true } as any);
  }, [onScroll]);





  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-0 flex flex-col h-full">
      {/* Results - Scrollable */}
      <div ref={scrollContainerRef} className="flex-1 w-full max-w-full overflow-y-auto overflow-x-hidden">
        {/* Sort Controls Header - Mobile Optimized - Scrolls with content */}
        <div className="liquid-glass-premium border-b border-[#C7D2E1]/30 p-4 sm:p-5 flex-shrink-0 w-full max-w-full overflow-x-hidden sticky top-0 z-40 backdrop-blur-xl flex justify-center">
          <div className="flex items-center gap-3 sm:gap-4 w-full max-w-4xl overflow-x-hidden">
            {/* Sort Buttons - Two Options Only - Mobile Optimized */}
            <div className="sort-button-group flex items-center gap-1.5 sm:gap-2 liquid-glass-light rounded-xl p-1.5 border border-[#C7D2E1]/35 flex-shrink-0 shadow-sm">
              <button
                onClick={() => {
                  console.log('[SearchFirst] Changing sort to smart');
                  setLocalSortBy('smart');
                  onSortChange?.('smart');
                }}
                className={`sort-button flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-xs font-bold transition-all duration-250 whitespace-nowrap flex-shrink-0 transform hover:scale-105 active:scale-95 min-h-[44px] sm:min-h-[36px] ${
                  localSortBy === 'smart'
                    ? 'liquid-glass-premium text-[#5AA6FF] shadow-lg shadow-[#5AA6FF]/25 border border-[#5AA6FF]/40 animate-enhancedPremiumGlow'
                    : 'text-[#5AA6FF] hover:text-[#8B7CFF] hover:bg-[#F9FBFF]/60 hover:shadow-md hover:border-[#5AA6FF]/30 border border-transparent'
                }`}
                aria-label="Sort by AI relevance"
                aria-pressed={localSortBy === 'smart'}
              >
                <Zap size={14} className={`hidden sm:inline flex-shrink-0 ${localSortBy === 'smart' ? 'animate-pulse' : ''}`} />
                <Zap size={16} className={`sm:hidden flex-shrink-0 ${localSortBy === 'smart' ? 'animate-pulse' : ''}`} />
                <span className="hidden sm:inline">AI Sort</span>
                <span className="sm:hidden">AI</span>
              </button>
              <button
                onClick={() => {
                  console.log('[SearchFirst] Changing sort to recency');
                  setLocalSortBy('recency');
                  onSortChange?.('recency');
                }}
                className={`sort-button flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-xs font-bold transition-all duration-250 whitespace-nowrap flex-shrink-0 transform hover:scale-105 active:scale-95 min-h-[44px] sm:min-h-[36px] ${
                  localSortBy === 'recency'
                    ? 'liquid-glass-premium text-[#8B7CFF] shadow-lg shadow-[#8B7CFF]/25 border border-[#8B7CFF]/40 animate-enhancedPremiumGlow'
                    : 'text-[#8B7CFF] hover:text-[#5AA6FF] hover:bg-[#F9FBFF]/60 hover:shadow-md hover:border-[#8B7CFF]/30 border border-transparent'
                }`}
                aria-label="Sort by recency"
                aria-pressed={localSortBy === 'recency'}
              >
                <Clock size={14} className={`hidden sm:inline flex-shrink-0 ${localSortBy === 'recency' ? 'animate-pulse' : ''}`} />
                <Clock size={16} className={`sm:hidden flex-shrink-0 ${localSortBy === 'recency' ? 'animate-pulse' : ''}`} />
                <span className="hidden sm:inline">Recent</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>

            {/* Results Count - Right Aligned */}
            <div className="ml-auto text-xs text-[#5AA6FF] font-bold whitespace-nowrap flex-shrink-0 tracking-wide">
              <span className="hidden sm:inline">{searchResults.length} articles</span>
              <span className="sm:hidden">{searchResults.length}</span>
            </div>
          </div>
        </div>

        <div className="w-full flex justify-center px-2 sm:px-4 pb-20 pt-4 overflow-x-hidden">
          <div className="space-y-2.5 sm:space-y-3 w-full max-w-4xl">
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

          {/* Sentinel element removed - using scroll-based pagination instead */}

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
      className={`w-full max-w-full rounded-xl border-2 transition-all duration-250 animate-slideInWithBounce overflow-hidden flex flex-col cursor-pointer ${
        isSelected
          ? 'liquid-glass-ultra border-[#5AA6FF]/60 animate-premiumGlow elevated-glow scale-101'
          : 'liquid-glass border-[#C7D2E1]/40 hover:border-[#5AA6FF]/60 hover:scale-101 hover:animate-subtleGlowPulse micro-glow'
      }`}
    >
      {/* Gradient Accent Top - Aurora Colors */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#5AA6FF] via-[#8B7CFF] to-[#B08CFF] opacity-90 shadow-sm"></div>

      {/* Content Section with Subtle Gradient */}
      <div className="p-5 space-y-3.5 flex-1 flex flex-col bg-gradient-to-br from-white via-[#F9FBFF]/30 to-[#E8F2FF]/20 w-full max-w-full overflow-x-hidden">
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

