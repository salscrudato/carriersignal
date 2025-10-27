export function SkeletonLoader() {
  return (
    <div className="liquid-glass-premium rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-400 animate-slideInWithBounce">
      {/* Premium accent line with shimmer */}
      <div className="h-2 bg-gradient-to-r from-slate-200 via-slate-150 to-slate-100 opacity-60 animate-liquidGlassShimmer"></div>

      {/* Header with liquid glass effect */}
      <div className="px-7 py-6 border-b border-slate-100/50 bg-gradient-to-br from-white/40 to-slate-50/30 backdrop-blur-sm">
        <div className="h-6 bg-gradient-to-r from-slate-200 via-slate-150 to-slate-100 rounded-lg w-3/4 mb-4 animate-shimmer"></div>
        <div className="flex items-center justify-between">
          <div className="h-4 bg-slate-200 rounded-lg w-1/4 animate-shimmer"></div>
          <div className="h-4 bg-slate-200 rounded-lg w-1/5 animate-shimmer"></div>
        </div>
      </div>

      {/* Content */}
      <div className="px-7 py-6">
        {/* Key Points */}
        <div className="mb-6 p-6 glass rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 backdrop-blur-sm">
          <div className="h-3 bg-slate-200 rounded-lg w-1/6 mb-4 animate-shimmer"></div>
          <div className="space-y-3.5">
            <div className="h-4 bg-slate-100 rounded-lg w-full animate-shimmer"></div>
            <div className="h-4 bg-slate-100 rounded-lg w-5/6 animate-shimmer"></div>
            <div className="h-4 bg-slate-100 rounded-lg w-4/5 animate-shimmer"></div>
          </div>
        </div>

        {/* Why It Matters */}
        <div className="border-t border-slate-100/50 pt-6">
          <div className="h-4 bg-slate-200 rounded-lg w-1/4 animate-shimmer"></div>
        </div>
      </div>

      {/* Tags */}
      <div className="px-7 py-6 bg-gradient-to-r from-slate-50/50 to-slate-100/50 border-t border-slate-200/50 backdrop-blur-sm">
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

