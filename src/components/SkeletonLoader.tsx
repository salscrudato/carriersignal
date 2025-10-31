/**
 * Skeleton Loader Components
 * Provides shimmer animations for loading states with liquid glass aesthetic
 * Enhanced with improved visual feedback and accessibility
 */

export function SkeletonLoader() {
  return (
    <div className="skeleton-item liquid-glass-premium rounded-3xl border border-[#C7D2E1]/50 overflow-hidden transition-all duration-400 animate-slideInWithBounce animate-enhancedPremiumGlow shadow-lg shadow-[#5AA6FF]/10" role="status" aria-label="Loading article details" aria-busy="true">
      {/* Premium accent line with Aurora gradient */}
      <div className="h-2.5 bg-gradient-to-r from-[#5AA6FF] via-[#8B7CFF] to-[#B08CFF] opacity-100 animate-liquidGlassShimmer"></div>

      {/* Header with liquid glass effect */}
      <div className="px-7 py-6 border-b border-[#C7D2E1]/30 bg-gradient-to-br from-white/50 to-[#F9FBFF]/30 backdrop-blur-sm">
        <div className="skeleton-item h-6 bg-gradient-to-r from-[#D4DFE8] via-[#C7D2E1] to-[#D4DFE8] rounded-lg w-3/4 mb-4"></div>
        <div className="flex items-center justify-between gap-3">
          <div className="skeleton-item h-4 bg-[#D4DFE8] rounded-lg w-1/4" style={{ animationDelay: '0.1s' }}></div>
          <div className="skeleton-item h-4 bg-[#D4DFE8] rounded-lg w-1/5" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>

      {/* Content */}
      <div className="px-7 py-6">
        {/* Key Points */}
        <div className="mb-6 p-6 glass rounded-2xl border border-[#C7D2E1]/40 bg-gradient-to-br from-[#F9FBFF]/70 to-[#E8F2FF]/50 backdrop-blur-sm">
          <div className="skeleton-item h-3 bg-[#D4DFE8] rounded-lg w-1/6 mb-4"></div>
          <div className="space-y-3.5">
            <div className="skeleton-item h-4 bg-[#E8F2FF] rounded-lg w-full" style={{ animationDelay: '0.1s' }}></div>
            <div className="skeleton-item h-4 bg-[#E8F2FF] rounded-lg w-5/6" style={{ animationDelay: '0.2s' }}></div>
            <div className="skeleton-item h-4 bg-[#E8F2FF] rounded-lg w-4/5" style={{ animationDelay: '0.3s' }}></div>
          </div>
        </div>

        {/* Why It Matters */}
        <div className="border-t border-[#C7D2E1]/30 pt-6">
          <div className="skeleton-item h-4 bg-[#D4DFE8] rounded-lg w-1/4"></div>
        </div>
      </div>

      {/* Tags */}
      <div className="px-7 py-6 bg-gradient-to-r from-[#F9FBFF]/50 to-[#E8F2FF]/40 border-t border-[#C7D2E1]/30 backdrop-blur-sm">
        <div className="flex flex-wrap gap-2.5">
          <div className="skeleton-item h-6 bg-[#D4DFE8] rounded-full w-16" style={{ animationDelay: '0.1s' }}></div>
          <div className="skeleton-item h-6 bg-[#D4DFE8] rounded-full w-20" style={{ animationDelay: '0.2s' }}></div>
          <div className="skeleton-item h-6 bg-[#D4DFE8] rounded-full w-24" style={{ animationDelay: '0.3s' }}></div>
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
    <div className="glass rounded-2xl border border-[#C7D2E1]/50 p-4 space-y-3.5 animate-fadeIn shadow-md shadow-[#5AA6FF]/10" role="status" aria-label="Loading article card" aria-busy="true">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="skeleton-item h-3 bg-[#D4DFE8] rounded-lg w-1/3 mb-2"></div>
          <div className="skeleton-item h-2 bg-[#E8F2FF] rounded-lg w-1/4" style={{ animationDelay: '0.1s' }}></div>
        </div>
        <div className="skeleton-item h-6 bg-[#E8F2FF] rounded-lg w-12" style={{ animationDelay: '0.2s' }}></div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <div className="skeleton-item h-4 bg-[#D4DFE8] rounded-lg w-full" style={{ animationDelay: '0.1s' }}></div>
        <div className="skeleton-item h-4 bg-[#D4DFE8] rounded-lg w-5/6" style={{ animationDelay: '0.2s' }}></div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <div className="skeleton-item h-3 bg-[#E8F2FF] rounded-lg w-full" style={{ animationDelay: '0.15s' }}></div>
        <div className="skeleton-item h-3 bg-[#E8F2FF] rounded-lg w-4/5" style={{ animationDelay: '0.25s' }}></div>
      </div>

      {/* Tags */}
      <div className="flex gap-2 pt-2">
        <div className="skeleton-item h-5 bg-[#D4DFE8] rounded-full w-12" style={{ animationDelay: '0.1s' }}></div>
        <div className="skeleton-item h-5 bg-[#D4DFE8] rounded-full w-16" style={{ animationDelay: '0.2s' }}></div>
        <div className="skeleton-item h-5 bg-[#D4DFE8] rounded-full w-14" style={{ animationDelay: '0.3s' }}></div>
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

