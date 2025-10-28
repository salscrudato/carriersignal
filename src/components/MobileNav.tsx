import { useState, useEffect } from 'react';
import { Search, BarChart3, Bookmark, Settings, X } from 'lucide-react';

interface MobileNavProps {
  onViewChange?: (view: 'feed' | 'dashboard' | 'bookmarks' | 'settings') => void;
  currentView?: 'feed' | 'dashboard' | 'bookmarks' | 'settings';
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

  const handleNavClick = (view: 'feed' | 'dashboard' | 'bookmarks' | 'settings') => {
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
          className={`pointer-events-auto transition-all duration-300 ease-out ${
            isOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="liquid-glass-ultra border-t border-blue-200/20 rounded-t-3xl shadow-2xl animate-enhancedPremiumGlow">
            {/* Handle Bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full" />
            </div>

            {/* Navigation Items */}
            <div className="px-4 pb-6 space-y-2">
              {/* Feed Button */}
              <button
                onClick={() => handleNavClick('feed')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  currentView === 'feed'
                    ? 'liquid-glass-premium text-blue-700 shadow-md border border-blue-200/30'
                    : 'liquid-glass-light text-slate-700 hover:border-blue-200/40'
                }`}
              >
                <Search size={20} />
                <span>News Feed</span>
              </button>

              {/* Dashboard Button */}
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  currentView === 'dashboard'
                    ? 'liquid-glass-premium text-blue-700 shadow-md border border-blue-200/30'
                    : 'liquid-glass-light text-slate-700 hover:border-blue-200/40'
                }`}
              >
                <BarChart3 size={20} />
                <span>Dashboard</span>
              </button>

              {/* Bookmarks Button */}
              <button
                onClick={() => handleNavClick('bookmarks')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  currentView === 'bookmarks'
                    ? 'liquid-glass-premium text-amber-700 shadow-md border border-amber-200/30'
                    : 'liquid-glass-light text-slate-700 hover:border-amber-200/40'
                }`}
              >
                <Bookmark size={20} />
                <span>Bookmarks</span>
              </button>

              {/* Settings Button */}
              <button
                onClick={() => handleNavClick('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  currentView === 'settings'
                    ? 'liquid-glass-premium text-blue-700 shadow-md border border-blue-200/30'
                    : 'liquid-glass-light text-slate-700 hover:border-blue-200/40'
                }`}
              >
                <Settings size={20} />
                <span>Settings</span>
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold liquid-glass-light text-slate-700 hover:border-slate-300/40 transition-all duration-300 mt-4 border border-slate-200/30"
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
          className="md:hidden fixed inset-0 z-30 bg-black/30 backdrop-blur-sm pointer-events-auto transition-all duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

