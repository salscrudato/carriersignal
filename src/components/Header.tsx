import { Shield } from 'lucide-react';
import { useState, useEffect, memo } from 'react';

interface HeaderProps {
  isLoading: boolean;
}

function HeaderComponent({
  isLoading,
}: HeaderProps) {
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Calculate shadow intensity based on scroll position (0-8px)
  const shadowIntensity = Math.min(scrollY / 20, 1);
  const shadowOpacity = shadowIntensity * 0.08;

  return (
    <header
      className="w-full liquid-glass-ultra border-b border-[#C7D2E1]/20 transition-all duration-200 backdrop-blur-lg relative overflow-hidden"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        boxShadow: `0 ${Math.min(scrollY / 10, 6)}px ${12 + shadowIntensity * 6}px rgba(0, 0, 0, ${shadowOpacity})`,
      }}
      onMouseMove={handleMouseMove}
    >


      {/* Specular highlight layer - dynamic light reflection */}
      <div
        className="absolute inset-0 pointer-events-none rounded-b-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.25) 0%, transparent 50%)`,
        }}
      />
      <div className="mx-auto w-full max-w-full px-4 sm:px-6 lg:px-8 relative z-10 overflow-x-hidden">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4 touch-manipulation relative w-full max-w-full overflow-x-hidden">
          {/* Left: Empty space for balance */}
          <div className="flex-1 hidden sm:block" />

          {/* Center: Logo & Branding - Centered */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 group flex-shrink-0">
            {/* Shield Icon with Enhanced Aurora Gradient - Premium Glow */}
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-[#5AA6FF] via-[#7B9FFF] via-[#6BB3FF] to-[#4A96EF] flex items-center justify-center group-hover:scale-110 transition-all duration-300 animate-softGlow group-hover:animate-enhancedPremiumGlow shadow-lg shadow-[#5AA6FF]/30 group-hover:shadow-[#5AA6FF]/50 relative overflow-hidden">
              {/* Gradient overlay for depth */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {/* Inner shine effect - Subtle */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Shield size={20} className="text-white sm:w-6 sm:h-6 relative z-10 group-hover:scale-120 transition-transform duration-250 drop-shadow-sm" />
            </div>

            {/* Title & Tagline */}
            <div className="flex flex-col justify-center items-start gap-0.5 sm:gap-1">
              <h1
                className="font-bold tracking-tight transition-all duration-250 group-hover:scale-105 whitespace-nowrap"
                style={{
                  fontSize: 'clamp(1.3rem, 5vw, 1.8rem)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  lineHeight: '1.1',
                  background: 'linear-gradient(135deg, #5AA6FF 0%, #6BB3FF 18%, #7B9FFF 32%, #8B7CFF 50%, #9B8CFF 68%, #B08CFF 82%, #4A96EF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 2px 4px rgba(90, 166, 255, 0.1))',
                }}
              >
                Carrier Signal
              </h1>
              <p className="text-xs font-semibold text-[#5AA6FF] group-hover:text-[#6BB3FF] transition-colors duration-250 tracking-wide opacity-90 group-hover:opacity-100">
                AI-Curated Insurance News
              </p>
            </div>
          </div>

          {/* Right: Status Indicators */}
          <div className="flex items-center gap-2 flex-shrink-0 flex-1 justify-end">
            {isLoading && (
              <div className="flex items-center gap-2.5 px-3.5 py-2 liquid-glass-premium rounded-full border border-[#5AA6FF]/35 shadow-md shadow-[#5AA6FF]/15 transition-all duration-250 hover:border-[#5AA6FF]/50 hover:shadow-lg hover:shadow-[#5AA6FF]/25">
                <div className="relative w-2.5 h-2.5">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#5AA6FF] via-[#8B7CFF] to-[#B08CFF] rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#5AA6FF] via-[#8B7CFF] to-[#B08CFF] rounded-full animate-pulseGlow opacity-40"></div>
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

export const Header = memo(HeaderComponent);

