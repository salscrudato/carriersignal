import { Shield } from 'lucide-react';

interface HeaderProps {
  isLoading: boolean;
}

export function Header({
  isLoading,
}: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-50 liquid-glass-premium border-b border-blue-200/20 transition-all duration-350 backdrop-blur-xl"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >

      <div className="mx-auto w-full max-w-full px-4 sm:px-6 lg:px-8 relative z-10 overflow-x-hidden">
        <div className="flex items-center justify-center h-16 sm:h-20 gap-4 touch-manipulation relative w-full max-w-full overflow-x-hidden">
          {/* Center: Logo & Branding - Centered */}
          <div className="flex items-center justify-center gap-2 group flex-shrink-0">
            {/* Modern Shield Icon with Blue-Purple-Pink Glow */}
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 animate-deepGlow elevated-glow">
              {/* Glow backdrop - subtle blue-purple-pink glow */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-300"></div>
              <Shield size={16} className="text-white sm:w-5 sm:h-5 animate-iconGlow relative z-10" />
            </div>

            {/* Title & Tagline */}
            <div className="flex flex-col justify-center items-center">
              <h1
                className="text-sm sm:text-lg font-bold tracking-tight transition-all duration-350 group-hover:scale-105 whitespace-nowrap"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #a855f7 50%, #ec4899 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontFamily: '"Inter", "Helvetica Neue", sans-serif',
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                }}
              >
                AI-Curated Insurance News
              </h1>
            </div>
          </div>

          {/* Right: Status Indicators */}
          <div className="flex items-center gap-2 flex-shrink-0 absolute right-0">

            {isLoading && (
              <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-full">
                <div className="relative w-2 h-2">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulseGlow opacity-50"></div>
                </div>
                <span className="text-xs font-semibold text-blue-700 hidden sm:inline">Analyzing…</span>
              </div>
            )}


          </div>
        </div>
      </div>
    </header>
  );
}

