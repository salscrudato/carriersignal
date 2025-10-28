/**
 * Infinite Scroll Loading Component
 * 
 * Displays loading states for infinite scroll:
 * - Loading skeleton cards
 * - End of list indicator
 * - Error states
 * - Empty states
 */

import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface InfiniteScrollLoaderProps {
  isLoading?: boolean;
  hasMore?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  itemCount?: number;
}

export function InfiniteScrollLoader({
  isLoading = false,
  hasMore = true,
  error = null,
  isEmpty = false,
  itemCount = 3,
}: InfiniteScrollLoaderProps) {
  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="rounded-full liquid-glass-light p-3 mb-4 border border-red-200/40 animate-iconGlow">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <p className="text-sm font-semibold text-slate-900 mb-1">Failed to load articles</p>
        <p className="text-xs text-slate-600 text-center">{error}</p>
      </div>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="rounded-full liquid-glass-premium p-3 mb-4 border border-blue-200/40 animate-iconGlow">
          <CheckCircle2 className="w-6 h-6 text-blue-600" />
        </div>
        <p className="text-sm font-semibold text-slate-900">No articles found</p>
        <p className="text-xs text-slate-600 mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  // End of list
  if (!hasMore && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="rounded-full liquid-glass-light p-3 mb-4 border border-blue-200/40 animate-iconGlow">
          <CheckCircle2 className="w-6 h-6 text-blue-600" />
        </div>
        <p className="text-sm font-semibold text-slate-900">You've reached the end</p>
        <p className="text-xs text-slate-600 mt-1">No more articles to load</p>
      </div>
    );
  }

  // Loading state - show skeleton cards
  if (isLoading) {
    return (
      <div className="space-y-3 w-full max-w-full px-4 pb-20">
        {Array.from({ length: itemCount }).map((_, idx) => (
          <SkeletonCard key={idx} delay={idx * 50} />
        ))}
      </div>
    );
  }

  return null;
}

/**
 * Skeleton card for loading state
 */
function SkeletonCard({ delay = 0 }: { delay?: number }) {
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className="w-full max-w-full rounded-xl border-2 border-blue-200/40 overflow-hidden animate-slideInWithBounce liquid-glass"
    >
      {/* Gradient Accent Top - Aurora Colors */}
      <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-85"></div>

      {/* Content Section */}
      <div className="p-4 space-y-3 flex-1 flex flex-col bg-gradient-to-br from-white via-blue-50/25 to-purple-50/15 w-full max-w-full overflow-x-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 w-full max-w-full overflow-x-hidden">
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="h-4 bg-slate-200 rounded-full w-24 animate-shimmer"></div>
          </div>
          <div className="h-4 bg-slate-200 rounded-full w-16 animate-shimmer flex-shrink-0"></div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="h-5 bg-slate-200 rounded-lg w-full animate-shimmer"></div>
          <div className="h-5 bg-slate-200 rounded-lg w-5/6 animate-shimmer"></div>
        </div>

        {/* Summary Lines */}
        <div className="space-y-2 py-3 border-t border-blue-200/30 pt-3">
          <div className="h-4 bg-slate-100 rounded-lg w-full animate-shimmer"></div>
          <div className="h-4 bg-slate-100 rounded-lg w-5/6 animate-shimmer"></div>
          <div className="h-4 bg-slate-100 rounded-lg w-4/5 animate-shimmer"></div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-4 mt-auto border-t border-blue-200/30 pt-3">
          <div className="flex-1 h-10 bg-slate-100 rounded-lg animate-shimmer"></div>
          <div className="flex-1 h-10 bg-slate-100 rounded-lg animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading indicator for scroll sentinel
 */
export function ScrollSentinelLoader() {
  return (
    <div className="flex items-center justify-center py-8 px-4">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
      <span className="ml-3 text-xs font-medium text-slate-600">Loading more...</span>
    </div>
  );
}

