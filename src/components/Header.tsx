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
      className="w-full bg-white border-b border-[#F3F4F6] transition-all duration-300 relative"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        boxShadow: shadowIntensity > 0.1 ? `0 1px 3px rgba(0, 0, 0, ${0.01 + shadowIntensity * 0.02})` : 'none',
      }}
    >
      <div className="mx-auto w-full max-w-full px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-4 touch-manipulation">
          {/* Left: Logo & Branding */}
          <div className="flex items-center gap-3 flex-shrink-0 group">
            {/* Icon - Modern, refined gradient */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center group-hover:shadow-md transition-all duration-300 hover:scale-105 active:scale-95">
              <Shield size={18} className="text-white sm:w-5 sm:h-5" />
            </div>

            {/* Title - Modern typography with better hierarchy */}
            <div className="flex flex-col justify-center items-start gap-0">
              <h1 className="font-bold text-sm sm:text-base text-[#111827] whitespace-nowrap tracking-tight">
                Carrier Signal
              </h1>
              <p className="text-xs text-[#9CA3AF] font-medium">
                Insurance News
              </p>
            </div>
          </div>

          {/* Right: Status Indicators */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isLoading && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F9FAFB] rounded-full border border-[#E5E7EB] transition-all duration-300 animate-smoothFadeIn">
                <div className="relative w-2 h-2">
                  <div className="absolute inset-0 bg-[#10B981] rounded-full animate-pulse"></div>
                </div>
                <span className="text-xs font-medium text-[#6B7280] hidden sm:inline">Loading…</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export const Header = memo(HeaderComponent);

