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
        {/* Sort Controls Header - Clean, minimal, sticky */}
        <div className="bg-white border-b border-[#E5E7EB] p-3 sm:p-4 flex-shrink-0 w-full max-w-full overflow-x-hidden flex justify-center transition-all duration-200 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3 sm:gap-4 w-full max-w-4xl overflow-x-hidden">
            {/* Sort Buttons - Clean, minimal design */}
            <div className="sort-button-group flex items-center gap-1 bg-[#F7F7F8] rounded-lg p-1 flex-shrink-0 border border-[#E5E7EB]">
              <button
                onClick={() => {
                  logger.debug('SearchFirst', 'Changing sort to smart');
                  setLocalSortBy('smart');
                  onSortChange?.('smart');
                }}
                className={`sort-button flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 min-h-[36px] ${
                  localSortBy === 'smart'
                    ? 'bg-white text-[#10A37F] border border-[#E5E7EB] shadow-sm'
                    : 'text-[#565869] hover:text-[#0D0D0D]'
                }`}
                aria-label="Sort by AI relevance"
                aria-pressed={localSortBy === 'smart'}
              >
                <Zap size={14} className="flex-shrink-0" />
                <span className="hidden sm:inline">AI</span>
              </button>
              <button
                onClick={() => {
                  logger.debug('SearchFirst', 'Changing sort to recency');
                  setLocalSortBy('recency');
                  onSortChange?.('recency');
                }}
                className={`sort-button flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 min-h-[36px] ${
                  localSortBy === 'recency'
                    ? 'bg-white text-[#10A37F] border border-[#E5E7EB] shadow-sm'
                    : 'text-[#565869] hover:text-[#0D0D0D]'
                }`}
                aria-label="Sort by recency"
                aria-pressed={localSortBy === 'recency'}
              >
                <Clock size={14} className="flex-shrink-0" />
                <span className="hidden sm:inline">New</span>
              </button>
            </div>

            {/* Results Count - Right Aligned */}
            <div className="ml-auto text-xs text-[#8B8B9A] font-medium whitespace-nowrap flex-shrink-0">
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
      className={`w-full max-w-full rounded-lg border transition-all duration-200 ease-out animate-slideInUp overflow-hidden flex flex-col cursor-pointer group ${
        isSelected
          ? 'bg-[#F7F7F8] border-[#10A37F] shadow-md'
          : 'bg-white border-[#E5E7EB] hover:border-[#D1D5DB] hover:shadow-md'
      }`}
    >
      {/* Content Section - Clean, minimal */}
      <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col w-full max-w-full overflow-x-hidden">
        {/* Header with Source and Time */}
        <div className="flex items-start justify-between gap-3 w-full max-w-full overflow-x-hidden">
          <div className="flex-1 min-w-0 overflow-hidden">
            <span className="text-xs font-medium text-[#10A37F] bg-[#E8F5F0] px-2 py-1 rounded-md inline-block truncate">
              {getFeedSourceName(article.source)}
            </span>
          </div>
          {timeAgo && (
            <span className="text-xs text-[#8B8B9A] font-medium flex-shrink-0 whitespace-nowrap">{timeAgo}</span>
          )}
        </div>

        {/* Title - Clean typography */}
        <h3 className="font-semibold text-[#0D0D0D] text-base leading-snug line-clamp-2 group-hover:text-[#10A37F] transition-colors duration-200 w-full max-w-full overflow-hidden break-words">
          {article.title}
        </h3>

        {/* AI-Generated Summary - Clean, minimal */}
        {article.bullets5 && article.bullets5.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-[#E5E7EB] w-full max-w-full overflow-x-hidden">
            <div className="flex items-center gap-2 w-full max-w-full overflow-x-hidden">
              <div className="w-4 h-4 rounded-full bg-[#10A37F] flex items-center justify-center flex-shrink-0">
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-[#10A37F] uppercase tracking-wide">Summary</span>
            </div>
            <div className="space-y-1.5 w-full max-w-full overflow-x-hidden">
              {article.bullets5.slice(0, 2).map((bullet: string, idx: number) => (
                <div key={idx} className="flex gap-2 text-xs text-[#565869] leading-relaxed w-full max-w-full overflow-x-hidden">
                  <span className="text-[#10A37F] font-semibold flex-shrink-0 mt-0.5">•</span>
                  <span className="flex-1 overflow-hidden break-words">{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags Section - Clean, minimal */}
        {article.tags && Object.values(article.tags).some((tagArray: string[] | undefined) => tagArray && tagArray.length > 0) && (
          <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[#E5E7EB] w-full max-w-full">
            {/* LOB Tags */}
            {article.tags.lob && article.tags.lob.length > 0 && (
              article.tags.lob.slice(0, 2).map((tag: string, idx: number) => (
                <span key={`lob-${idx}`} className="px-2 py-1 rounded-md bg-[#F7F7F8] text-[#565869] text-xs font-medium whitespace-nowrap border border-[#E5E7EB] hover:bg-[#ECECF1] transition-colors duration-200 cursor-default">
                  {tag}
                </span>
              ))
            )}
            {/* Perils Tags */}
            {article.tags.perils && article.tags.perils.length > 0 && (
              article.tags.perils.slice(0, 2).map((tag: string, idx: number) => (
                <span key={`perils-${idx}`} className="px-2 py-1 rounded-md bg-[#F7F7F8] text-[#565869] text-xs font-medium whitespace-nowrap border border-[#E5E7EB] hover:bg-[#ECECF1] transition-colors duration-200 cursor-default">
                  {tag}
                </span>
              ))
            )}
            {/* Regions Tags */}
            {article.tags.regions && article.tags.regions.length > 0 && (
              article.tags.regions.slice(0, 1).map((tag: string, idx: number) => (
                <span key={`regions-${idx}`} className="px-2 py-1 rounded-md bg-[#F7F7F8] text-[#565869] text-xs font-medium whitespace-nowrap border border-[#E5E7EB] hover:bg-[#ECECF1] transition-colors duration-200 cursor-default">
                  {tag}
                </span>
              ))
            )}
          </div>
        )}

        {/* Bottom Action Buttons - Clean, minimal */}
        <div className="flex gap-2 pt-3 mt-auto border-t border-[#E5E7EB] w-full max-w-full overflow-x-hidden">
          <button
            onClick={handleViewMore}
            className="flex-1 px-3 py-2 text-xs font-medium text-[#565869] bg-[#F7F7F8] rounded-md border border-[#E5E7EB] hover:bg-[#ECECF1] hover:text-[#0D0D0D] transition-all duration-200 min-h-[40px]"
          >
            View More
          </button>
          <button
            onClick={handleViewArticle}
            className="flex-1 px-3 py-2 text-xs font-medium text-white bg-[#10A37F] rounded-md border border-[#10A37F] hover:bg-[#0D8B6F] transition-all duration-200 flex items-center justify-center gap-1 min-h-[40px]"
          >
            <span className="hidden sm:inline">Article</span>
            <ExternalLink size={12} className="flex-shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}



