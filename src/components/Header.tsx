interface HeaderProps {
  isLoading: boolean;
}

export function Header({ isLoading }: HeaderProps) {

  return (
    <header
      className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-lg backdrop-blur-xl bg-opacity-98 transition-all duration-350"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Subtle gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 opacity-50"></div>

      <div className="mx-auto w-full px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-16 sm:h-20 gap-4 touch-manipulation relative">
          {/* Centered Title with Enhanced Blue Gradient */}
          <div className="flex flex-col items-center justify-center">
            <h1
              className="text-3xl sm:text-5xl font-black tracking-tighter transition-all duration-350 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: '"Inter", "Helvetica Neue", sans-serif',
                fontWeight: 950,
                letterSpacing: '-0.035em',
              }}
            >
              CarrierSignal
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-bold tracking-widest mt-2 uppercase">AI-Curated Insurance News</p>
          </div>

          {/* Status Indicator - Right Side */}
          <div className="absolute right-3 sm:right-6 lg:right-8 flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              {isLoading && (
                <>
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
                  <span className="hidden sm:inline">Analyzing…</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

