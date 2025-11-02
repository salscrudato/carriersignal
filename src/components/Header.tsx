import { Shield } from 'lucide-react';
import { useState, useEffect, memo } from 'react';

interface HeaderProps {
  isLoading: boolean;
}

function HeaderComponent({
  isLoading,
}: HeaderProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate shadow intensity based on scroll position
  const shadowIntensity = Math.min(scrollY / 20, 1);

  return (
    <header
      className="w-full bg-white border-b border-[#F0F0F0] transition-all duration-300 relative"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        boxShadow: shadowIntensity > 0.1 ? `0 1px 3px rgba(0, 0, 0, ${0.02 + shadowIntensity * 0.03})` : 'none',
      }}
    >
      <div className="mx-auto w-full max-w-full px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-4 touch-manipulation">
          {/* Left: Logo & Branding */}
          <div className="flex items-center gap-3 flex-shrink-0 group">
            {/* Icon - Modern, clean gradient */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-[#14B8A6] to-[#0D9488] flex items-center justify-center group-hover:shadow-md transition-all duration-300 hover:scale-105">
              <Shield size={18} className="text-white sm:w-5 sm:h-5" />
            </div>

            {/* Title - Clean typography */}
            <div className="flex flex-col justify-center items-start gap-0">
              <h1 className="font-semibold text-sm sm:text-base text-[#171717] whitespace-nowrap tracking-tight">
                Carrier Signal
              </h1>
              <p className="text-xs text-[#737373] font-medium">
                Insurance News
              </p>
            </div>
          </div>

          {/* Right: Status Indicators */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isLoading && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F5F5F5] rounded-full border border-[#E5E5E5] transition-all duration-300">
                <div className="relative w-2 h-2">
                  <div className="absolute inset-0 bg-[#14B8A6] rounded-full animate-pulse"></div>
                </div>
                <span className="text-xs font-medium text-[#525252] hidden sm:inline">Loading…</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export const Header = memo(HeaderComponent);

