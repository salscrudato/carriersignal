import { Shield } from 'lucide-react';

interface HeaderProps {
  isLoading: boolean;
}

export function Header({
  isLoading,
}: HeaderProps) {
  return (
    <header
      className="w-full liquid-glass-ultra border-b border-[#C7D2E1]/20 transition-all duration-300 backdrop-blur-lg"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="mx-auto w-full max-w-full px-4 sm:px-6 lg:px-8 relative z-10 overflow-x-hidden">
        <div className="flex items-center justify-center h-16 sm:h-20 gap-4 touch-manipulation relative w-full max-w-full overflow-x-hidden">
          {/* Center: Logo & Branding - Centered */}
          <div className="flex items-center justify-center gap-3 group flex-shrink-0">
            {/* Shield Icon with Blue Background - Enhanced Glow */}
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[#5AA6FF] to-[#4A96EF] flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 hover:shadow-[0_0_20px_rgba(90,166,255,0.4)]">
              {/* Glow backdrop - subtle Aurora glow */}
              <div className="absolute inset-0 rounded-lg bg-[#5AA6FF] opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-300"></div>
              <Shield size={16} className="text-white sm:w-5 sm:h-5 relative z-10 group-hover:scale-105 transition-transform duration-300" />
            </div>

            {/* Title & Tagline */}
            <div className="flex flex-col justify-center items-center">
              <h1
                className="font-semibold tracking-wide transition-all duration-300 group-hover:scale-102 whitespace-nowrap"
                style={{
                  fontSize: 'clamp(0.9rem, 4vw, 1.2rem)',
                  fontFamily: '"Helvetica Neue", "Helvetica", "Arial", sans-serif',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  lineHeight: '1.2',
                  background: 'linear-gradient(135deg, #5AA6FF 0%, #4A96EF 50%, #3B82F6 100%)',
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
              <div className="flex items-center gap-2 px-3 py-1.5 liquid-glass rounded-full border border-[#5AA6FF]/20">
                <div className="relative w-2 h-2">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#5AA6FF] to-[#8B7CFF] rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#5AA6FF] to-[#8B7CFF] rounded-full animate-pulseGlow opacity-40"></div>
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

