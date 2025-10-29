import { Shield } from 'lucide-react';

interface HeaderProps {
  isLoading: boolean;
}

export function Header({
  isLoading,
}: HeaderProps) {
  return (
    <header
      className="w-full liquid-glass-ultra border-b border-[#C7D2E1]/25 transition-all duration-350 backdrop-blur-2xl"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="mx-auto w-full max-w-full px-4 sm:px-6 lg:px-8 relative z-10 overflow-x-hidden">
        <div className="flex items-center justify-center h-16 sm:h-20 gap-4 touch-manipulation relative w-full max-w-full overflow-x-hidden">
          {/* Center: Logo & Branding - Centered */}
          <div className="flex items-center justify-center gap-3 group flex-shrink-0">
            {/* Shield Icon with Blue Background */}
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#5AA6FF] flex items-center justify-center shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 hover:shadow-[0_0_20px_rgba(90,166,255,0.4)]">
              {/* Glow backdrop - subtle Aurora glow */}
              <div className="absolute inset-0 rounded-xl bg-[#5AA6FF] opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300"></div>
              <Shield size={16} className="text-white sm:w-5 sm:h-5 relative z-10" />
            </div>

            {/* Title & Tagline */}
            <div className="flex flex-col justify-center items-center">
              <h1
                className="text-xs sm:text-base font-bold tracking-tight transition-all duration-350 group-hover:scale-105 whitespace-nowrap"
                style={{
                  fontFamily: '"Inter", "Helvetica Neue", sans-serif',
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  background: 'linear-gradient(135deg, #5AA6FF 0%, #3B82F6 50%, #2563EB 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                AI-Curated Insurance News
              </h1>
            </div>
          </div>

          {/* Right: Status Indicators */}
          <div className="flex items-center gap-2 flex-shrink-0 absolute right-0">
            {isLoading && (
              <div className="flex items-center gap-2 px-3 py-1.5 liquid-glass-light rounded-full">
                <div className="relative w-2 h-2">
                  <div className="absolute inset-0 bg-gradient-primary rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-primary rounded-full animate-pulseGlow opacity-50"></div>
                </div>
                <span className="text-xs font-semibold text-[#5AA6FF] hidden sm:inline">Analyzing…</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

