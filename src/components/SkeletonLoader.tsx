export function SkeletonLoader() {
  return (
    <div className="liquid-glass-premium rounded-3xl border border-blue-200/40 overflow-hidden hover:shadow-xl transition-all duration-400 animate-slideInWithBounce animate-enhancedPremiumGlow">
      {/* Premium accent line with Aurora gradient */}
      <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-85 animate-liquidGlassShimmer"></div>

      {/* Header with liquid glass effect */}
      <div className="px-7 py-6 border-b border-blue-200/30 bg-gradient-to-br from-white/40 to-blue-50/20 backdrop-blur-sm">
        <div className="h-6 bg-gradient-to-r from-slate-200 via-slate-150 to-slate-100 rounded-lg w-3/4 mb-4 animate-shimmer"></div>
        <div className="flex items-center justify-between">
          <div className="h-4 bg-slate-200 rounded-lg w-1/4 animate-shimmer"></div>
          <div className="h-4 bg-slate-200 rounded-lg w-1/5 animate-shimmer"></div>
        </div>
      </div>

      {/* Content */}
      <div className="px-7 py-6">
        {/* Key Points */}
        <div className="mb-6 p-6 glass rounded-2xl border border-blue-200/40 bg-gradient-to-br from-blue-50/60 to-purple-50/40 backdrop-blur-sm">
          <div className="h-3 bg-slate-200 rounded-lg w-1/6 mb-4 animate-shimmer"></div>
          <div className="space-y-3.5">
            <div className="h-4 bg-slate-100 rounded-lg w-full animate-shimmer"></div>
            <div className="h-4 bg-slate-100 rounded-lg w-5/6 animate-shimmer"></div>
            <div className="h-4 bg-slate-100 rounded-lg w-4/5 animate-shimmer"></div>
          </div>
        </div>

        {/* Why It Matters */}
        <div className="border-t border-blue-200/30 pt-6">
          <div className="h-4 bg-slate-200 rounded-lg w-1/4 animate-shimmer"></div>
        </div>
      </div>

      {/* Tags */}
      <div className="px-7 py-6 bg-gradient-to-r from-blue-50/40 to-purple-50/30 border-t border-blue-200/30 backdrop-blur-sm">
        <div className="flex flex-wrap gap-2.5">
          <div className="h-6 bg-slate-200 rounded-full w-16 animate-shimmer"></div>
          <div className="h-6 bg-slate-200 rounded-full w-20 animate-shimmer"></div>
          <div className="h-6 bg-slate-200 rounded-full w-24 animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonLoader key={i} />
      ))}
    </div>
  );
}

