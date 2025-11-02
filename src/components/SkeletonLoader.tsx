/**
 * Skeleton Loader Components
 * Provides shimmer animations for loading states with liquid glass aesthetic
 * Enhanced with improved visual feedback and accessibility
 */

export function SkeletonLoader() {
  return (
    <div className="skeleton-item bg-white rounded-lg border border-[#E5E7EB] overflow-hidden transition-all duration-400" role="status" aria-label="Loading article details" aria-busy="true">
      {/* Accent line */}
      <div className="h-1 bg-[#10A37F] opacity-100 animate-pulse"></div>

      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E5E7EB] bg-[#F7F7F8]">
        <div className="skeleton-item h-5 bg-[#D1D5DB] rounded-md w-3/4 mb-3"></div>
        <div className="flex items-center justify-between gap-3">
          <div className="skeleton-item h-3 bg-[#E5E7EB] rounded-md w-1/4" style={{ animationDelay: '0.1s' }}></div>
          <div className="skeleton-item h-3 bg-[#E5E7EB] rounded-md w-1/5" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-4">
        {/* Key Points */}
        <div className="mb-4 p-4 rounded-lg border border-[#E5E7EB] bg-[#F7F7F8]">
          <div className="skeleton-item h-3 bg-[#D1D5DB] rounded-md w-1/6 mb-3"></div>
          <div className="space-y-2.5">
            <div className="skeleton-item h-3 bg-[#E5E7EB] rounded-md w-full" style={{ animationDelay: '0.1s' }}></div>
            <div className="skeleton-item h-3 bg-[#E5E7EB] rounded-md w-5/6" style={{ animationDelay: '0.2s' }}></div>
            <div className="skeleton-item h-3 bg-[#E5E7EB] rounded-md w-4/5" style={{ animationDelay: '0.3s' }}></div>
          </div>
        </div>

        {/* Why It Matters */}
        <div className="border-t border-[#E5E7EB] pt-4">
          <div className="skeleton-item h-3 bg-[#D1D5DB] rounded-md w-1/4"></div>
        </div>
      </div>

      {/* Tags */}
      <div className="px-5 py-4 bg-[#F7F7F8] border-t border-[#E5E7EB]">
        <div className="flex flex-wrap gap-2">
          <div className="skeleton-item h-5 bg-[#D1D5DB] rounded-md w-16" style={{ animationDelay: '0.1s' }}></div>
          <div className="skeleton-item h-5 bg-[#D1D5DB] rounded-md w-20" style={{ animationDelay: '0.2s' }}></div>
          <div className="skeleton-item h-5 bg-[#D1D5DB] rounded-md w-24" style={{ animationDelay: '0.3s' }}></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Card Skeleton - Compact loading state for article cards
 */
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 space-y-3" role="status" aria-label="Loading article card" aria-busy="true">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="skeleton-item h-3 bg-[#D1D5DB] rounded-md w-1/3 mb-2"></div>
          <div className="skeleton-item h-2 bg-[#E5E7EB] rounded-md w-1/4" style={{ animationDelay: '0.1s' }}></div>
        </div>
        <div className="skeleton-item h-5 bg-[#E5E7EB] rounded-md w-12" style={{ animationDelay: '0.2s' }}></div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <div className="skeleton-item h-3 bg-[#D1D5DB] rounded-md w-full" style={{ animationDelay: '0.1s' }}></div>
        <div className="skeleton-item h-3 bg-[#D1D5DB] rounded-md w-5/6" style={{ animationDelay: '0.2s' }}></div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <div className="skeleton-item h-2.5 bg-[#E5E7EB] rounded-md w-full" style={{ animationDelay: '0.15s' }}></div>
        <div className="skeleton-item h-2.5 bg-[#E5E7EB] rounded-md w-4/5" style={{ animationDelay: '0.25s' }}></div>
      </div>

      {/* Tags */}
      <div className="flex gap-2 pt-2">
        <div className="skeleton-item h-4 bg-[#D1D5DB] rounded-md w-12" style={{ animationDelay: '0.1s' }}></div>
        <div className="skeleton-item h-4 bg-[#D1D5DB] rounded-md w-16" style={{ animationDelay: '0.2s' }}></div>
        <div className="skeleton-item h-4 bg-[#D1D5DB] rounded-md w-14" style={{ animationDelay: '0.3s' }}></div>
      </div>
    </div>
  );
}

/**
 * Grid of card skeletons for article lists
 */
export function SkeletonGrid({ count = 3, variant = 'card' }: { count?: number; variant?: 'card' | 'full' }) {
  return (
    <div className={variant === 'card' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
      {Array.from({ length: count }).map((_, i) => (
        variant === 'card' ? <CardSkeleton key={i} /> : <SkeletonLoader key={i} />
      ))}
    </div>
  );
}

