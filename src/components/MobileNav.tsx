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
          className={`pointer-events-auto transition-all duration-250 ease-out ${
            isOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="liquid-glass-ultra border-t border-[#C7D2E1]/25 rounded-t-3xl shadow-xl shadow-[#5AA6FF]/15 animate-enhancedPremiumGlow">
            {/* Handle Bar - Aurora Gradient */}
            <div className="flex justify-center pt-3.5 pb-2">
              <div className="w-10 h-1 bg-gradient-primary rounded-full opacity-70" />
            </div>

            {/* Navigation Items */}
            <div className="px-4 pb-5 space-y-1.5">
              {/* Feed Button */}
              <button
                onClick={() => handleNavClick('feed')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-semibold transition-all duration-250 ${
                  currentView === 'feed'
                    ? 'liquid-glass-premium text-[#5AA6FF] shadow-sm border border-[#5AA6FF]/25'
                    : 'liquid-glass-light text-[#0F172A] hover:border-[#C7D2E1]/30'
                }`}
              >
                <Search size={20} />
                <span>News Feed</span>
              </button>

              {/* Dashboard Button */}
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-semibold transition-all duration-250 ${
                  currentView === 'dashboard'
                    ? 'liquid-glass-premium text-[#8B7CFF] shadow-sm border border-[#8B7CFF]/25'
                    : 'liquid-glass-light text-[#0F172A] hover:border-[#C7D2E1]/30'
                }`}
              >
                <BarChart3 size={20} />
                <span>Dashboard</span>
              </button>

              {/* Bookmarks Button */}
              <button
                onClick={() => handleNavClick('bookmarks')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-semibold transition-all duration-250 ${
                  currentView === 'bookmarks'
                    ? 'liquid-glass-premium text-[#B08CFF] shadow-sm border border-[#B08CFF]/25'
                    : 'liquid-glass-light text-[#0F172A] hover:border-[#C7D2E1]/30'
                }`}
              >
                <Bookmark size={20} />
                <span>Bookmarks</span>
              </button>

              {/* Settings Button */}
              <button
                onClick={() => handleNavClick('settings')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-semibold transition-all duration-250 ${
                  currentView === 'settings'
                    ? 'liquid-glass-premium text-[#5AA6FF] shadow-sm border border-[#5AA6FF]/25'
                    : 'liquid-glass-light text-[#0F172A] hover:border-[#C7D2E1]/30'
                }`}
              >
                <Settings size={20} />
                <span>Settings</span>
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold liquid-glass-light text-[#0F172A] hover:border-[#C7D2E1]/30 transition-all duration-250 mt-3 border border-[#C7D2E1]/25"
              >
                <X size={20} />
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/25 backdrop-blur-sm pointer-events-auto transition-all duration-250"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

