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
        <div className="rounded-full liquid-glass-light p-3 mb-4 border border-[#EF4444]/40 animate-iconGlow">
          <AlertCircle className="w-6 h-6 text-[#EF4444]" />
        </div>
        <p className="text-sm font-semibold text-[#0F172A] mb-1">Failed to load articles</p>
        <p className="text-xs text-[#64748B] text-center">{error}</p>
      </div>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="rounded-full liquid-glass-premium p-3 mb-4 border border-[#5AA6FF]/40 animate-iconGlow">
          <CheckCircle2 className="w-6 h-6 text-[#5AA6FF]" />
        </div>
        <p className="text-sm font-semibold text-[#0F172A]">No articles found</p>
        <p className="text-xs text-[#64748B] mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  // End of list
  if (!hasMore && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="rounded-full liquid-glass-light p-3 mb-4 border border-[#5AA6FF]/40 animate-iconGlow">
          <CheckCircle2 className="w-6 h-6 text-[#5AA6FF]" />
        </div>
        <p className="text-sm font-semibold text-[#0F172A]">You've reached the end</p>
        <p className="text-xs text-[#64748B] mt-1">No more articles to load</p>
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
      className="w-full max-w-full rounded-xl border-2 border-[#C7D2E1]/40 overflow-hidden animate-slideInWithBounce liquid-glass"
    >
      {/* Gradient Accent Top - Aurora Colors */}
      <div className="h-2 w-full bg-gradient-primary opacity-85"></div>

      {/* Content Section */}
      <div className="p-4 space-y-3 flex-1 flex flex-col bg-gradient-to-br from-white via-[#F9FBFF]/25 to-[#E8F2FF]/15 w-full max-w-full overflow-x-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 w-full max-w-full overflow-x-hidden">
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="h-4 bg-[#D4DFE8] rounded-full w-24 animate-shimmer"></div>
          </div>
          <div className="h-4 bg-[#D4DFE8] rounded-full w-16 animate-shimmer flex-shrink-0"></div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="h-5 bg-[#D4DFE8] rounded-lg w-full animate-shimmer"></div>
          <div className="h-5 bg-[#D4DFE8] rounded-lg w-5/6 animate-shimmer"></div>
        </div>

        {/* Summary Lines */}
        <div className="space-y-2 py-3 border-t border-[#C7D2E1]/30 pt-3">
          <div className="h-4 bg-[#E8F2FF] rounded-lg w-full animate-shimmer"></div>
          <div className="h-4 bg-[#E8F2FF] rounded-lg w-5/6 animate-shimmer"></div>
          <div className="h-4 bg-[#E8F2FF] rounded-lg w-4/5 animate-shimmer"></div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-4 mt-auto border-t border-[#C7D2E1]/30 pt-3">
          <div className="flex-1 h-10 bg-[#E8F2FF] rounded-lg animate-shimmer"></div>
          <div className="flex-1 h-10 bg-[#E8F2FF] rounded-lg animate-shimmer"></div>
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
        <div className="w-2 h-2 rounded-full bg-[#5AA6FF] animate-pulse"></div>
        <div className="w-2 h-2 rounded-full bg-[#8B7CFF] animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 rounded-full bg-[#B08CFF] animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
      <span className="ml-3 text-xs font-medium text-[#64748B]">Loading more...</span>
    </div>
  );
}

