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
import { Zap, Clock, ExternalLink, ArrowUp } from 'lucide-react';
import { InfiniteScrollLoader, ScrollSentinelLoader } from './InfiniteScrollLoader';
import { calculateDynamicArticleScore } from '../utils/scoring';
import { logger } from '../utils/logger';
import { getTimeAgo } from '../utils/validation';
import { getFeedSourceName } from '../constants/feedSources';
import type { Article } from '../types';

interface SearchResult {
  article: Article;
  score: number;
  matchType: string;
}

interface SearchFirstProps {
  articles: Article[];
  onArticleSelect: (article: Article) => void;
  selectedArticle?: Article | null;
  sortMode?: 'smart' | 'recency';
  onSortChange?: (sort: 'smart' | 'recency') => void;
  isLoadingMore?: boolean;
  hasMore?: boolean;
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
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [localSortBy, setLocalSortBy] = useState<'smart' | 'recency'>(sortMode || 'smart');
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Display articles with dynamic scoring and sorting
  useEffect(() => {
    // Map to results format with dynamic score calculation
    const results = articles.map(article => {
      // Calculate dynamic score in real-time to account for article age
      const dynamicScore = calculateDynamicArticleScore(article);
      return {
        article,
        score: dynamicScore,
        matchType: 'combined',
      };
    });

    // Sort based on localSortBy
    // Smart sort: Uses dynamic scoring that accounts for recency decay
    // Recency sort: Uses published date
    if (localSortBy === 'smart') {
      results.sort((a, b) => b.score - a.score);
    } else if (localSortBy === 'recency') {
      results.sort((a, b) => {
        const getTime = (date: string | Date | { toDate: () => Date } | undefined): number => {
          if (!date) return 0;
          if (date instanceof Date) return date.getTime();
          if (typeof date === 'object' && 'toDate' in date) return date.toDate().getTime();
          return new Date(date).getTime();
        };
        const dateA = getTime(a.article.publishedAt);
        const dateB = getTime(b.article.publishedAt);
        return dateB - dateA;
      });
    }

    setSearchResults(results);
  }, [articles, localSortBy]);

  // Attach scroll listener to the scrollable container with passive option for better performance
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = (e: Event) => {
      // Show scroll-to-top button when scrolled down
      const target = e.target as HTMLDivElement;
      setShowScrollToTop(target.scrollTop > 300);

      // Call the parent's onScroll handler if provided
      onScroll?.(e);
    };

    // Use passive listener for better scroll performance
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll, { passive: true } as AddEventListenerOptions);
  }, [onScroll]);

  // Scroll to top handler
  const handleScrollToTop = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };





  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-0 flex flex-col h-full">
      {/* Results - Scrollable */}
      <div ref={scrollContainerRef} className="flex-1 w-full max-w-full overflow-y-auto overflow-x-hidden scroll-smooth">
        {/* Sort Controls Header - Enhanced Smooth Scrolling Experience */}
        <div className="liquid-glass-premium border-b border-[#C7D2E1]/25 p-4 sm:p-5 flex-shrink-0 w-full max-w-full overflow-x-hidden sticky top-0 z-40 backdrop-blur-xl flex justify-center transition-all duration-300 ease-out shadow-sm hover:shadow-md hover:border-[#5AA6FF]/20">
          {/* Ambient glow effect on scroll */}
          <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#5AA6FF]/15 to-transparent blur-lg opacity-0 transition-opacity duration-300"></div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 w-full max-w-4xl overflow-x-hidden relative z-10">
            {/* Sort Buttons - Two Options Only - Enhanced Interaction */}
            <div className="sort-button-group flex items-center gap-1.5 sm:gap-2 liquid-glass-light rounded-xl p-1.5 border border-[#C7D2E1]/35 flex-shrink-0 shadow-sm transition-all duration-300 hover:border-[#C7D2E1]/50 hover:shadow-md">
              <button
                onClick={() => {
                  logger.debug('SearchFirst', 'Changing sort to smart');
                  setLocalSortBy('smart');
                  onSortChange?.('smart');
                }}
                className={`sort-button flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-xs font-bold transition-all duration-300 whitespace-nowrap flex-shrink-0 transform hover:scale-105 active:scale-95 min-h-[44px] sm:min-h-[36px] will-change-transform ${
                  localSortBy === 'smart'
                    ? 'liquid-glass-premium text-[#5AA6FF] shadow-lg shadow-[#5AA6FF]/25 border border-[#5AA6FF]/40 animate-enhancedPremiumGlow'
                    : 'text-[#5AA6FF] hover:text-[#6BB3FF] hover:bg-[#F9FBFF]/70 hover:shadow-md hover:border-[#5AA6FF]/25 border border-transparent transition-colors duration-300'
                }`}
                aria-label="Sort by AI relevance"
                aria-pressed={localSortBy === 'smart'}
              >
                <Zap size={14} className={`hidden sm:inline flex-shrink-0 transition-all duration-300 ${localSortBy === 'smart' ? 'animate-pulse' : ''}`} />
                <Zap size={16} className={`sm:hidden flex-shrink-0 transition-all duration-300 ${localSortBy === 'smart' ? 'animate-pulse' : ''}`} />
                <span className="hidden sm:inline">AI Sort</span>
                <span className="sm:hidden">AI</span>
              </button>
              <button
                onClick={() => {
                  logger.debug('SearchFirst', 'Changing sort to recency');
                  setLocalSortBy('recency');
                  onSortChange?.('recency');
                }}
                className={`sort-button flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-xs font-bold transition-all duration-300 whitespace-nowrap flex-shrink-0 transform hover:scale-105 active:scale-95 min-h-[44px] sm:min-h-[36px] will-change-transform ${
                  localSortBy === 'recency'
                    ? 'liquid-glass-premium text-[#8B7CFF] shadow-lg shadow-[#8B7CFF]/25 border border-[#8B7CFF]/40 animate-enhancedPremiumGlow'
                    : 'text-[#8B7CFF] hover:text-[#9B8CFF] hover:bg-[#F9FBFF]/70 hover:shadow-md hover:border-[#8B7CFF]/25 border border-transparent transition-colors duration-300'
                }`}
                aria-label="Sort by recency"
                aria-pressed={localSortBy === 'recency'}
              >
                <Clock size={14} className={`hidden sm:inline flex-shrink-0 transition-all duration-300 ${localSortBy === 'recency' ? 'animate-pulse' : ''}`} />
                <Clock size={16} className={`sm:hidden flex-shrink-0 transition-all duration-300 ${localSortBy === 'recency' ? 'animate-pulse' : ''}`} />
                <span className="hidden sm:inline">Recent</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>

            {/* Results Count - Right Aligned - Enhanced Typography */}
            <div className="ml-auto text-xs text-[#5AA6FF] font-bold whitespace-nowrap flex-shrink-0 tracking-wide opacity-90 transition-opacity duration-300 hover:opacity-100">
              <span className="hidden sm:inline">{searchResults.length} articles</span>
              <span className="sm:hidden">{searchResults.length}</span>
            </div>
          </div>
        </div>

        <div className="w-full flex justify-center px-2 sm:px-4 pb-20 pt-3 sm:pt-4 overflow-x-hidden transition-all duration-300">
          <div className="space-y-2.5 sm:space-y-3 w-full max-w-4xl">
            {searchResults.map((result, idx) => (
              <div
                key={`${result.article.url}-${idx}`}
                className="transition-all duration-300 ease-out animate-fadeInScale"
              >
                <SearchResultCard
                  result={result}
                  isSelected={selectedArticle?.url === result.article.url}
                  onSelect={() => onArticleSelect(result.article)}
                  index={idx}
                />
              </div>
            ))}

            {/* Loading indicator for infinite scroll - Smooth transition */}
            {isLoadingMore && (
              <div className="mt-6 animate-fadeInScale">
                <ScrollSentinelLoader />
              </div>
            )}

            {/* End of list or error states - Smooth transition */}
            {!isLoadingMore && (
              <div className="animate-fadeInScale">
                <InfiniteScrollLoader
                  isLoading={false}
                  hasMore={hasMore}
                  isEmpty={searchResults.length === 0}
                  itemCount={3}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scroll to Top Button - Enhanced Smooth Interaction */}
      {showScrollToTop && (
        <button
          onClick={handleScrollToTop}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 p-3.5 rounded-full liquid-glass-premium border border-[#5AA6FF]/50 text-[#5AA6FF] shadow-2xl shadow-[#5AA6FF]/60 hover:shadow-[0_0_40px_rgba(90,166,255,1)] transition-all duration-300 ease-out hover:scale-125 active:scale-95 animate-fadeInUp hover:border-[#5AA6FF]/80 hover:bg-[#5AA6FF]/10 group will-change-transform"
          aria-label="Scroll to top"
          title="Scroll to top"
        >
          <ArrowUp size={22} className="transition-all duration-300 group-hover:translate-y-[-3px] group-hover:animate-bounce" />
        </button>
      )}
    </div>
  );
}

/**
 * Individual search result card
 */
interface SearchResultCardProps {
  result: SearchResult;
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
      className={`w-full max-w-full rounded-xl border-2 transition-all duration-300 ease-out animate-slideInWithBounce overflow-hidden flex flex-col cursor-pointer group ${
        isSelected
          ? 'liquid-glass-ultra border-[#5AA6FF]/70 animate-premiumGlow elevated-glow scale-101 shadow-xl shadow-[#5AA6FF]/25'
          : 'liquid-glass border-[#C7D2E1]/40 hover:border-[#5AA6FF]/60 hover:scale-[1.02] hover:animate-subtleGlowPulse micro-glow hover:shadow-xl hover:shadow-[#5AA6FF]/20 hover:bg-gradient-to-br hover:from-white hover:via-[#F9FBFF]/50 hover:to-[#E8F2FF]/30'
      }`}
    >
      {/* Content Section with Subtle Gradient and Enhanced Depth */}
      <div className="p-5 space-y-3.5 flex-1 flex flex-col bg-gradient-to-br from-white via-[#F9FBFF]/30 to-[#E8F2FF]/20 w-full max-w-full overflow-x-hidden transition-all duration-300">
        {/* Header with Source and Time (moved to top right) */}
        <div className="flex items-start justify-between gap-3 w-full max-w-full overflow-x-hidden">
          <div className="flex-1 min-w-0 overflow-hidden">
            <span className="text-xs font-semibold text-[#5AA6FF] bg-gradient-to-r from-[#F9FBFF] to-[#E8F2FF] px-2.5 py-1 rounded-full inline-block truncate">
              {getFeedSourceName(article.source)}
            </span>
          </div>
          {timeAgo && (
            <span className="text-xs text-[#8B7CFF] font-medium flex-shrink-0 whitespace-nowrap">{timeAgo}</span>
          )}
        </div>

        {/* Title - Enhanced Typography with Better Hierarchy */}
        <h3 className="font-bold text-[#0F172A] text-base md:text-lg leading-tight line-clamp-3 group-hover:text-[#5AA6FF] transition-all duration-300 w-full max-w-full overflow-hidden break-words group-hover:translate-x-1">
          {article.title}
        </h3>

        {/* AI-Generated Summary - Enhanced with Better Visual Hierarchy */}
        {article.bullets5 && article.bullets5.length > 0 && (
          <div className="space-y-3 py-3 border-t border-[#C7D2E1]/25 pt-3 w-full max-w-full overflow-x-hidden group-hover:border-[#5AA6FF]/20 transition-colors duration-300">
            <div className="flex items-center gap-2 w-full max-w-full overflow-x-hidden">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#5AA6FF] to-[#8B7CFF] flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-[#5AA6FF] uppercase tracking-widest truncate group-hover:text-[#8B7CFF] transition-colors duration-300">AI Summary</span>
            </div>
            <div className="space-y-2 w-full max-w-full overflow-x-hidden">
              {article.bullets5.slice(0, 3).map((bullet: string, idx: number) => (
                <div key={idx} className="flex gap-2 text-sm text-[#2D3748] leading-relaxed w-full max-w-full overflow-x-hidden group-hover:text-[#0F172A] transition-colors duration-300">
                  <span className="text-[#5AA6FF] font-bold flex-shrink-0 mt-0.5 group-hover:text-[#8B7CFF] transition-colors duration-300">→</span>
                  <span className="flex-1 overflow-hidden break-words">{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags Section - Enhanced with Better Visual Hierarchy */}
        {article.tags && Object.values(article.tags).some((tagArray: string[] | undefined) => tagArray && tagArray.length > 0) && (
          <div className="space-y-2 py-3 border-t border-[#C7D2E1]/25 pt-3 w-full max-w-full overflow-x-hidden group-hover:border-[#5AA6FF]/20 transition-colors duration-300">
            <div className="flex flex-wrap gap-2 w-full max-w-full">
              {/* LOB Tags - Cyan */}
              {article.tags.lob && article.tags.lob.length > 0 && (
                article.tags.lob.map((tag: string, idx: number) => (
                  <span key={`lob-${idx}`} className="px-2.5 py-1 rounded-full liquid-glass-light text-[#06B6D4] text-xs font-medium whitespace-nowrap border border-[#06B6D4]/30 hover:border-[#06B6D4]/60 hover:bg-[#06B6D4]/10 transition-all duration-300 cursor-default">
                    {tag}
                  </span>
                ))
              )}
              {/* Perils Tags - Indigo */}
              {article.tags.perils && article.tags.perils.length > 0 && (
                article.tags.perils.map((tag: string, idx: number) => (
                  <span key={`perils-${idx}`} className="px-2.5 py-1 rounded-full liquid-glass-light text-[#5AA6FF] text-xs font-medium whitespace-nowrap border border-[#5AA6FF]/30 hover:border-[#5AA6FF]/60 hover:bg-[#5AA6FF]/10 transition-all duration-300 cursor-default">
                    {tag}
                  </span>
                ))
              )}
              {/* Regions Tags - Aurora Blue */}
              {article.tags.regions && article.tags.regions.length > 0 && (
                article.tags.regions.map((tag: string, idx: number) => (
                  <span key={`regions-${idx}`} className="px-2.5 py-1 rounded-full liquid-glass-light text-[#5AA6FF] text-xs font-medium whitespace-nowrap border border-[#5AA6FF]/30 hover:border-[#5AA6FF]/60 hover:bg-[#5AA6FF]/10 transition-all duration-300 cursor-default">
                    {tag}
                  </span>
                ))
              )}
              {/* Companies Tags - Aurora Violet */}
              {article.tags.companies && article.tags.companies.length > 0 && (
                article.tags.companies.map((tag: string, idx: number) => (
                  <span key={`companies-${idx}`} className="px-2.5 py-1 rounded-full liquid-glass-light text-[#8B7CFF] text-xs font-medium whitespace-nowrap border border-[#8B7CFF]/30 hover:border-[#8B7CFF]/60 hover:bg-[#8B7CFF]/10 transition-all duration-300 cursor-default">
                    {tag}
                  </span>
                ))
              )}
              {/* Trends Tags - Aurora Lilac */}
              {article.tags.trends && article.tags.trends.length > 0 && (
                article.tags.trends.map((tag: string, idx: number) => (
                  <span key={`trends-${idx}`} className="px-2.5 py-1 rounded-full liquid-glass-light text-[#B08CFF] text-xs font-medium whitespace-nowrap border border-[#B08CFF]/30 hover:border-[#B08CFF]/60 hover:bg-[#B08CFF]/10 transition-all duration-300 cursor-default">
                    {tag}
                  </span>
                ))
              )}
              {/* Regulations Tags - Aurora Blue */}
              {article.tags.regulations && article.tags.regulations.length > 0 && (
                article.tags.regulations.map((tag: string, idx: number) => (
                  <span key={`regulations-${idx}`} className="px-2.5 py-1 rounded-full liquid-glass-light text-[#5AA6FF] text-xs font-medium whitespace-nowrap border border-[#5AA6FF]/30 hover:border-[#5AA6FF]/60 hover:bg-[#5AA6FF]/10 transition-all duration-300 cursor-default">
                    {tag}
                  </span>
                ))
              )}
            </div>
          </div>
        )}

        {/* Bottom Action Buttons - Enhanced with Better Interactions */}
        <div className="flex gap-2 pt-4 mt-auto border-t border-[#C7D2E1]/25 pt-3 w-full max-w-full overflow-x-hidden group-hover:border-[#5AA6FF]/20 transition-colors duration-300">
          <button
            onClick={handleViewMore}
            className="flex-1 px-3 py-2 text-xs font-semibold text-[#5AA6FF] liquid-glass-light rounded-lg border border-[#C7D2E1]/30 hover:border-[#5AA6FF]/60 hover:bg-[#5AA6FF]/10 hover:text-[#4A96EF] transition-all duration-300 min-h-[44px] touch-action-manipulation transform hover:scale-105 active:scale-95"
          >
            View More
          </button>
          <button
            onClick={handleViewArticle}
            className="flex-1 px-3 py-2 text-xs font-semibold text-[#5AA6FF] liquid-glass-light rounded-lg border border-[#C7D2E1]/30 hover:border-[#8B7CFF]/60 hover:bg-[#8B7CFF]/10 hover:text-[#7B6CEF] transition-all duration-300 flex items-center justify-center gap-1 min-h-[44px] touch-action-manipulation transform hover:scale-105 active:scale-95"
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



