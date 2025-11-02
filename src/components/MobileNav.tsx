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
          className={`pointer-events-auto transition-all duration-300 ease-out ${
            isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
        >
          <div className="bg-white border-t border-[#E5E7EB] rounded-t-2xl shadow-lg" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            {/* Handle Bar - Minimal */}
            <div className="flex justify-center pt-3 pb-3">
              <div className="w-10 h-1 bg-[#D1D5DB] rounded-full" />
            </div>

            {/* Navigation Items */}
            <div className="px-4 pb-4 space-y-2">
              {/* Feed Button */}
              <button
                onClick={() => handleNavClick('feed')}
                className={`nav-button w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 transform min-h-[48px] ${
                  currentView === 'feed'
                    ? 'bg-[#E8F5F0] text-[#10A37F] border border-[#10A37F]/30'
                    : 'bg-[#F7F7F8] text-[#565869] hover:bg-[#ECECF1] border border-[#E5E7EB]'
                }`}
                aria-label="News Feed"
              >
                <Search size={20} className="flex-shrink-0" />
                <span className="text-sm font-medium">News Feed</span>
              </button>

              {/* Dashboard Button */}
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`nav-button w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 transform min-h-[48px] ${
                  currentView === 'dashboard'
                    ? 'bg-[#E8F5F0] text-[#10A37F] border border-[#10A37F]/30'
                    : 'bg-[#F7F7F8] text-[#565869] hover:bg-[#ECECF1] border border-[#E5E7EB]'
                }`}
                aria-label="Dashboard"
              >
                <BarChart3 size={20} className="flex-shrink-0" />
                <span className="text-sm font-medium">Dashboard</span>
              </button>

              {/* Bookmarks Button */}
              <button
                onClick={() => handleNavClick('bookmarks')}
                className={`nav-button w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 transform min-h-[48px] ${
                  currentView === 'bookmarks'
                    ? 'bg-[#E8F5F0] text-[#10A37F] border border-[#10A37F]/30'
                    : 'bg-[#F7F7F8] text-[#565869] hover:bg-[#ECECF1] border border-[#E5E7EB]'
                }`}
                aria-label="Bookmarks"
              >
                <Bookmark size={20} className="flex-shrink-0" />
                <span className="text-sm font-medium">Bookmarks</span>
              </button>

              {/* Settings Button */}
              <button
                onClick={() => handleNavClick('settings')}
                className={`nav-button w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 transform min-h-[48px] ${
                  currentView === 'settings'
                    ? 'bg-[#E8F5F0] text-[#10A37F] border border-[#10A37F]/30'
                    : 'bg-[#F7F7F8] text-[#565869] hover:bg-[#ECECF1] border border-[#E5E7EB]'
                }`}
                aria-label="Settings"
              >
                <Settings size={20} className="flex-shrink-0" />
                <span className="text-sm font-medium">Settings</span>
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="nav-button w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium bg-[#F7F7F8] text-[#565869] hover:bg-[#ECECF1] transition-all duration-200 mt-2 border border-[#E5E7EB] transform min-h-[48px]"
                aria-label="Close navigation"
              >
                <X size={20} />
                <span className="text-sm font-medium">Close</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/20 pointer-events-auto transition-all duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

