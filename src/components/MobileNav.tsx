import { useState, useEffect } from 'react';
import { Search, BarChart3, Bookmark, Settings, X } from 'lucide-react';

interface MobileNavProps {
  onViewChange?: (view: 'feed' | 'dashboard') => void;
  currentView?: 'feed' | 'dashboard';
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

  const handleNavClick = (view: 'feed' | 'dashboard') => {
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
          <div className="bg-white border-t border-slate-200 rounded-t-3xl shadow-2xl">
            {/* Handle Bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-slate-300 rounded-full" />
            </div>

            {/* Navigation Items */}
            <div className="px-4 pb-6 space-y-2">
              {/* Feed Button */}
              <button
                onClick={() => handleNavClick('feed')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  currentView === 'feed'
                    ? 'bg-blue-100 text-blue-700 shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
                    ? 'bg-indigo-100 text-indigo-700 shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <BarChart3 size={20} />
                <span>Dashboard</span>
              </button>

              {/* Bookmarks Button */}
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all duration-300">
                <Bookmark size={20} />
                <span>Bookmarks</span>
              </button>

              {/* Settings Button */}
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all duration-300">
                <Settings size={20} />
                <span>Settings</span>
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all duration-300 mt-4"
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
          className="md:hidden fixed inset-0 z-30 bg-black/40 pointer-events-auto"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

