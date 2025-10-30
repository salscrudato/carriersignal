import { useState, useEffect } from 'react';
import { Search, BarChart3, Bookmark, Settings, X } from 'lucide-react';

interface MobileNavProps {
  onViewChange?: (view: 'feed' | 'dashboard' | 'bookmarks' | 'settings' | 'test') => void;
  currentView?: 'feed' | 'dashboard' | 'bookmarks' | 'settings' | 'test';
}

export function MobileNav({ onViewChange, currentView = 'feed' }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEnd(e.changedTouches[0].clientY);
    handleSwipe();
  };

  const handleSwipe = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > 50;
    const isDownSwipe = distance < -50;

    if (isUpSwipe && !isOpen) {
      setIsOpen(true);
    } else if (isDownSwipe && isOpen) {
      setIsOpen(false);
    }
  };

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavClick = (view: 'feed' | 'dashboard' | 'bookmarks' | 'settings' | 'test') => {
    onViewChange?.(view);
    setIsOpen(false);
  };

  return (
    <>
      {/* Bottom Sheet Trigger - Visible on Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
        {/* Swipe Indicator - Hidden */}
        <div
          className="h-0 pointer-events-auto cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />

        {/* Bottom Sheet */}
        <div
          className={`pointer-events-auto transition-all duration-400 ease-out ${
            isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
        >
          <div className="liquid-glass-ultra border-t border-[#C7D2E1]/35 rounded-t-3xl shadow-2xl shadow-[#5AA6FF]/25 animate-enhancedPremiumGlow" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            {/* Handle Bar - Aurora Gradient */}
            <div className="flex justify-center pt-5 pb-4">
              <div className="w-12 h-1.5 bg-gradient-to-r from-[#5AA6FF] via-[#8B7CFF] to-[#B08CFF] rounded-full opacity-90 transition-all duration-300 hover:opacity-100" />
            </div>

            {/* Navigation Items */}
            <div className="px-5 pb-6 space-y-2.5">
              {/* Feed Button - Staggered Animation */}
              <button
                onClick={() => handleNavClick('feed')}
                className={`nav-button w-full flex items-center gap-3.5 px-5 py-3 rounded-xl font-bold transition-all duration-250 transform min-h-[48px] animate-slideInUp ${
                  currentView === 'feed'
                    ? 'liquid-glass-premium text-[#5AA6FF] shadow-lg shadow-[#5AA6FF]/30 border border-[#5AA6FF]/40 scale-105'
                    : 'liquid-glass text-[#0F172A] hover:border-[#C7D2E1]/50 hover:shadow-md hover:scale-102 active:scale-98'
                }`}
                style={{ animationDelay: '0ms' }}
                aria-label="News Feed"
              >
                <Search size={21} className="flex-shrink-0" />
                <span className="text-base font-semibold">News Feed</span>
              </button>

              {/* Dashboard Button - Staggered Animation */}
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`nav-button w-full flex items-center gap-3.5 px-5 py-3 rounded-xl font-bold transition-all duration-250 transform min-h-[48px] animate-slideInUp ${
                  currentView === 'dashboard'
                    ? 'liquid-glass-premium text-[#8B7CFF] shadow-lg shadow-[#8B7CFF]/30 border border-[#8B7CFF]/40 scale-105'
                    : 'liquid-glass text-[#0F172A] hover:border-[#C7D2E1]/50 hover:shadow-md hover:scale-102 active:scale-98'
                }`}
                style={{ animationDelay: '50ms' }}
                aria-label="Dashboard"
              >
                <BarChart3 size={21} className="flex-shrink-0" />
                <span className="text-base font-semibold">Dashboard</span>
              </button>

              {/* Bookmarks Button - Staggered Animation */}
              <button
                onClick={() => handleNavClick('bookmarks')}
                className={`nav-button w-full flex items-center gap-3.5 px-5 py-3 rounded-xl font-bold transition-all duration-250 transform min-h-[48px] animate-slideInUp ${
                  currentView === 'bookmarks'
                    ? 'liquid-glass-premium text-[#B08CFF] shadow-lg shadow-[#B08CFF]/30 border border-[#B08CFF]/40 scale-105'
                    : 'liquid-glass text-[#0F172A] hover:border-[#C7D2E1]/50 hover:shadow-md hover:scale-102 active:scale-98'
                }`}
                style={{ animationDelay: '100ms' }}
                aria-label="Bookmarks"
              >
                <Bookmark size={21} className="flex-shrink-0" />
                <span className="text-base font-semibold">Bookmarks</span>
              </button>

              {/* Settings Button - Staggered Animation */}
              <button
                onClick={() => handleNavClick('settings')}
                className={`nav-button w-full flex items-center gap-3.5 px-5 py-3 rounded-xl font-bold transition-all duration-250 transform min-h-[48px] animate-slideInUp ${
                  currentView === 'settings'
                    ? 'liquid-glass-premium text-[#5AA6FF] shadow-lg shadow-[#5AA6FF]/30 border border-[#5AA6FF]/40 scale-105'
                    : 'liquid-glass text-[#0F172A] hover:border-[#C7D2E1]/50 hover:shadow-md hover:scale-102 active:scale-98'
                }`}
                style={{ animationDelay: '150ms' }}
                aria-label="Settings"
              >
                <Settings size={21} className="flex-shrink-0" />
                <span className="text-base font-semibold">Settings</span>
              </button>

              {/* Close Button - Staggered Animation */}
              <button
                onClick={() => setIsOpen(false)}
                className="nav-button w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl font-bold liquid-glass text-[#0F172A] hover:border-[#C7D2E1]/50 hover:shadow-md transition-all duration-250 mt-3 border border-[#C7D2E1]/35 transform hover:scale-102 active:scale-98 min-h-[48px] animate-slideInUp"
                style={{ animationDelay: '200ms' }}
                aria-label="Close navigation"
              >
                <X size={21} />
                <span className="text-base font-semibold">Close</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/30 backdrop-blur-md pointer-events-auto transition-all duration-300 animate-fadeIn"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

