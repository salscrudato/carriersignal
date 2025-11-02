/**
 * SignalsFeed Component
 * Main feed view for news signals with filtering and infinite scroll
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SignalCard } from './SignalCard';
import { FilterBar } from './FilterBar';
import { SkeletonGrid } from './SkeletonLoader';
import { useNewsSignals } from '../hooks/useNewsSignals';
import { logger } from '../utils/logger';
import type { NewsFilterState } from '../types/news';

interface SignalsFeedProps {
  title?: string;
  initialFilters?: NewsFilterState;
}

export const SignalsFeed: React.FC<SignalsFeedProps> = ({
  title = 'Top Signals',
  initialFilters = {},
}) => {
  const [filters, setFilters] = useState<NewsFilterState>(initialFilters);
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const { articles, loading, error, hasMore, loadMore, refresh } = useNewsSignals({
    pageSize: 20,
    filters,
  });

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  const handleFilterChange = useCallback((newFilters: NewsFilterState) => {
    setFilters(newFilters);
    setExpandedCluster(null);
    logger.info('SignalsFeed', 'Filters updated', newFilters);
  }, []);

  const handleRefresh = useCallback(async () => {
    await refresh();
    logger.info('SignalsFeed', 'Feed refreshed');
  }, [refresh]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-[#0D0D0D]">{title}</h1>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-[#10A37F] text-white rounded-lg hover:bg-[#0D8B6F] disabled:opacity-50 transition-all duration-200 font-medium text-sm"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        <p className="text-sm text-[#8B8B9A]">
          {articles.length} signals {loading && '(loading...)'}
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar filters={filters} onFiltersChange={handleFilterChange} />

      {/* Error State */}
      {error && (
        <div className="bg-[#FEE2E2] border border-[#EF4444]/20 text-[#EF4444] p-4 m-4 rounded-lg">
          <p className="font-medium">Error loading signals</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Feed */}
      <div className="flex-1 overflow-y-auto">
        {loading && articles.length === 0 ? (
          <div className="p-4">
            <SkeletonGrid count={5} />
          </div>
        ) : articles.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-[#565869] text-lg font-medium">No signals found</p>
              <p className="text-[#8B8B9A] text-sm mt-1">Try adjusting your filters</p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {articles.map(article => (
              <SignalCard
                key={article.id}
                article={article}
                onExpand={() => setExpandedCluster(expandedCluster === article.id ? null : article.id)}
                isExpanded={expandedCluster === article.id}
              />
            ))}

            {/* Infinite scroll trigger */}
            <div ref={observerTarget} className="h-10 flex items-center justify-center">
              {loading && hasMore && (
                <div className="flex items-center gap-2 text-[#8B8B9A]">
                  <div className="w-4 h-4 border-2 border-[#E5E7EB] border-t-[#10A37F] rounded-full animate-spin" />
                  <span className="text-sm">Loading more...</span>
                </div>
              )}
              {!hasMore && articles.length > 0 && (
                <p className="text-sm text-[#ABABBA]">No more signals</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

