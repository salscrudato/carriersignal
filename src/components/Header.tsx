import { Shield } from 'lucide-react';
import { useState, useEffect } from 'react';

interface HeaderProps {
  isLoading: boolean;
}

export function Header({
  isLoading,
}: HeaderProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate shadow intensity based on scroll position (0-8px)
  const shadowIntensity = Math.min(scrollY / 20, 1);
  const shadowOpacity = shadowIntensity * 0.12;

  return (
    <header
      className="w-full liquid-glass-ultra border-b border-[#C7D2E1]/25 transition-all duration-200 backdrop-blur-lg"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        boxShadow: `0 ${Math.min(scrollY / 10, 8)}px ${16 + shadowIntensity * 8}px rgba(0, 0, 0, ${shadowOpacity})`,
      }}
    >
      <div className="mx-auto w-full max-w-full px-4 sm:px-6 lg:px-8 relative z-10 overflow-x-hidden">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4 touch-manipulation relative w-full max-w-full overflow-x-hidden">
          {/* Left: Empty space for balance */}
          <div className="flex-1 hidden sm:block" />

          {/* Center: Logo & Branding - Centered */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-3 group flex-shrink-0">
            {/* Shield Icon with Blue Background - Smooth Modern Glow */}
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#5AA6FF] via-[#6BB3FF] to-[#4A96EF] flex items-center justify-center group-hover:scale-110 transition-all duration-250 animate-softGlow group-hover:animate-enhancedPremiumGlow">
              {/* Inner shine effect - Subtle */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-300"></div>
              <Shield size={20} className="text-white sm:w-6 sm:h-6 relative z-10 group-hover:scale-125 transition-transform duration-250" />
            </div>

            {/* Title & Tagline */}
            <div className="flex flex-col justify-center items-start gap-0.5">
              <h1
                className="font-bold tracking-tight transition-all duration-250 group-hover:scale-105 whitespace-nowrap"
                style={{
                  fontSize: 'clamp(1.1rem, 4vw, 1.5rem)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  lineHeight: '1.1',
                  background: 'linear-gradient(135deg, #5AA6FF 0%, #6BB3FF 40%, #4A96EF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                CarrierSignal
              </h1>
              <p className="text-xs font-semibold text-[#5AA6FF] group-hover:text-[#6BB3FF] transition-colors duration-250 tracking-wide">
                AI-Curated Insurance News
              </p>
            </div>
          </div>

          {/* Right: Status Indicators */}
          <div className="flex items-center gap-2 flex-shrink-0 flex-1 justify-end">
            {isLoading && (
              <div className="flex items-center gap-2 px-3 py-1.5 liquid-glass rounded-full border border-[#5AA6FF]/30 shadow-sm hover:shadow-md transition-all duration-250">
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

