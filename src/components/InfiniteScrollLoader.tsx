/**
 * Infinite Scroll Loading Component
 * 
 * Displays loading states for infinite scroll:
 * - Loading skeleton cards
 * - End of list indicator
 * - Error states
 * - Empty states
 */

import { CheckCircle2 } from 'lucide-react';

interface InfiniteScrollLoaderProps {
  isLoading?: boolean;
  hasMore?: boolean;
  isEmpty?: boolean;
  itemCount?: number;
}

export function InfiniteScrollLoader({
  isLoading = false,
  hasMore = true,
  isEmpty = false,
  itemCount = 3,
}: InfiniteScrollLoaderProps) {
  // Empty state
  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 w-full max-w-full">
        <div className="rounded-full bg-[#E8F5F0] p-3 mb-4 border border-[#10A37F]/20">
          <CheckCircle2 className="w-6 h-6 text-[#10A37F]" />
        </div>
        <p className="text-sm font-medium text-[#0D0D0D]">No articles found</p>
        <p className="text-xs text-[#8B8B9A] mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  // End of list
  if (!hasMore && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 w-full max-w-full">
        <div className="rounded-full bg-[#E8F5F0] p-3 mb-4 border border-[#10A37F]/20">
          <CheckCircle2 className="w-6 h-6 text-[#10A37F]" />
        </div>
        <p className="text-sm font-medium text-[#0D0D0D]">You've reached the end</p>
        <p className="text-xs text-[#8B8B9A] mt-1">No more articles to load</p>
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
      className="w-full max-w-full rounded-lg border border-[#E5E7EB] overflow-hidden"
    >
      {/* Accent line */}
      <div className="h-1 w-full bg-[#10A37F]"></div>

      {/* Content Section */}
      <div className="p-4 space-y-3 flex-1 flex flex-col bg-white w-full max-w-full overflow-x-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 w-full max-w-full overflow-x-hidden">
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="h-3 bg-[#D1D5DB] rounded-md w-24 animate-pulse"></div>
          </div>
          <div className="h-3 bg-[#D1D5DB] rounded-md w-16 animate-pulse flex-shrink-0"></div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="h-4 bg-[#D1D5DB] rounded-md w-full animate-pulse"></div>
          <div className="h-4 bg-[#D1D5DB] rounded-md w-5/6 animate-pulse"></div>
        </div>

        {/* Summary Lines */}
        <div className="space-y-2 py-3 border-t border-[#E5E7EB] pt-3">
          <div className="h-3 bg-[#E5E7EB] rounded-md w-full animate-pulse"></div>
          <div className="h-3 bg-[#E5E7EB] rounded-md w-5/6 animate-pulse"></div>
          <div className="h-3 bg-[#E5E7EB] rounded-md w-4/5 animate-pulse"></div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-4 mt-auto border-t border-[#E5E7EB] pt-3">
          <div className="flex-1 h-9 bg-[#E5E7EB] rounded-md animate-pulse"></div>
          <div className="flex-1 h-9 bg-[#E5E7EB] rounded-md animate-pulse"></div>
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
        <div className="w-2 h-2 rounded-full bg-[#10A37F] animate-pulse"></div>
        <div className="w-2 h-2 rounded-full bg-[#10A37F] animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 rounded-full bg-[#10A37F] animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
      <span className="ml-3 text-xs font-medium text-[#8B8B9A]">Loading more...</span>
    </div>
  );
}

