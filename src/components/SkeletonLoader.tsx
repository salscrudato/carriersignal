/**
 * Skeleton Loader Components
 * Provides shimmer animations for loading states with liquid glass aesthetic
 */

export function SkeletonLoader() {
  return (
    <div className="liquid-glass-premium rounded-3xl border border-[#C7D2E1]/40 overflow-hidden hover:shadow-xl transition-all duration-400 animate-slideInWithBounce animate-enhancedPremiumGlow" role="status" aria-label="Loading article details">
      {/* Premium accent line with Aurora gradient */}
      <div className="h-2 bg-gradient-primary opacity-85 animate-liquidGlassShimmer"></div>

      {/* Header with liquid glass effect */}
      <div className="px-7 py-6 border-b border-[#C7D2E1]/30 bg-gradient-to-br from-white/40 to-[#F9FBFF]/20 backdrop-blur-sm">
        <div className="h-6 bg-gradient-to-r from-[#D4DFE8] via-[#C7D2E1] to-[#D4DFE8] rounded-lg w-3/4 mb-4 animate-shimmer"></div>
        <div className="flex items-center justify-between">
          <div className="h-4 bg-[#D4DFE8] rounded-lg w-1/4 animate-shimmer"></div>
          <div className="h-4 bg-[#D4DFE8] rounded-lg w-1/5 animate-shimmer"></div>
        </div>
      </div>

      {/* Content */}
      <div className="px-7 py-6">
        {/* Key Points */}
        <div className="mb-6 p-6 glass rounded-2xl border border-[#C7D2E1]/40 bg-gradient-to-br from-[#F9FBFF]/60 to-[#E8F2FF]/40 backdrop-blur-sm">
          <div className="h-3 bg-[#D4DFE8] rounded-lg w-1/6 mb-4 animate-shimmer"></div>
          <div className="space-y-3.5">
            <div className="h-4 bg-[#E8F2FF] rounded-lg w-full animate-shimmer"></div>
            <div className="h-4 bg-[#E8F2FF] rounded-lg w-5/6 animate-shimmer"></div>
            <div className="h-4 bg-[#E8F2FF] rounded-lg w-4/5 animate-shimmer"></div>
          </div>
        </div>

        {/* Why It Matters */}
        <div className="border-t border-[#C7D2E1]/30 pt-6">
          <div className="h-4 bg-[#D4DFE8] rounded-lg w-1/4 animate-shimmer"></div>
        </div>
      </div>

      {/* Tags */}
      <div className="px-7 py-6 bg-gradient-to-r from-[#F9FBFF]/40 to-[#E8F2FF]/30 border-t border-[#C7D2E1]/30 backdrop-blur-sm">
        <div className="flex flex-wrap gap-2.5">
          <div className="h-6 bg-[#D4DFE8] rounded-full w-16 animate-shimmer"></div>
          <div className="h-6 bg-[#D4DFE8] rounded-full w-20 animate-shimmer"></div>
          <div className="h-6 bg-[#D4DFE8] rounded-full w-24 animate-shimmer"></div>
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
    <div className="glass rounded-2xl border border-[#C7D2E1]/40 p-4 space-y-3" role="status" aria-label="Loading article card">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="h-3 bg-[#D4DFE8] rounded-lg w-1/3 mb-2 animate-shimmer"></div>
          <div className="h-2 bg-[#E8F2FF] rounded-lg w-1/4 animate-shimmer"></div>
        </div>
        <div className="h-6 bg-[#E8F2FF] rounded-lg w-12 animate-shimmer"></div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <div className="h-4 bg-[#D4DFE8] rounded-lg w-full animate-shimmer"></div>
        <div className="h-4 bg-[#D4DFE8] rounded-lg w-5/6 animate-shimmer"></div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <div className="h-3 bg-[#E8F2FF] rounded-lg w-full animate-shimmer"></div>
        <div className="h-3 bg-[#E8F2FF] rounded-lg w-4/5 animate-shimmer"></div>
      </div>

      {/* Tags */}
      <div className="flex gap-2 pt-2">
        <div className="h-5 bg-[#D4DFE8] rounded-full w-12 animate-shimmer"></div>
        <div className="h-5 bg-[#D4DFE8] rounded-full w-16 animate-shimmer"></div>
        <div className="h-5 bg-[#D4DFE8] rounded-full w-14 animate-shimmer"></div>
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

