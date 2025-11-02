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
      className="w-full bg-white border-b border-[#E5E7EB] transition-all duration-200 relative"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        boxShadow: shadowIntensity > 0.1 ? `0 1px 3px rgba(0, 0, 0, ${0.06 + shadowIntensity * 0.04})` : 'none',
      }}
    >
      <div className="mx-auto w-full max-w-full px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-4 touch-manipulation">
          {/* Left: Logo & Branding */}
          <div className="flex items-center gap-2.5 flex-shrink-0 group">
            {/* Icon - Clean, minimal */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-[#10A37F] to-[#0D8B6F] flex items-center justify-center group-hover:shadow-md transition-all duration-200">
              <Shield size={18} className="text-white sm:w-5 sm:h-5" />
            </div>

            {/* Title */}
            <div className="flex flex-col justify-center items-start gap-0">
              <h1 className="font-semibold text-sm sm:text-base text-[#0D0D0D] whitespace-nowrap">
                Carrier Signal
              </h1>
              <p className="text-xs text-[#8B8B9A] font-medium">
                Insurance News
              </p>
            </div>
          </div>

          {/* Right: Status Indicators */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isLoading && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F7F7F8] rounded-full border border-[#E5E7EB] transition-all duration-200">
                <div className="relative w-2 h-2">
                  <div className="absolute inset-0 bg-[#10A37F] rounded-full animate-pulse"></div>
                </div>
                <span className="text-xs font-medium text-[#565869] hidden sm:inline">Loading…</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export const Header = memo(HeaderComponent);

