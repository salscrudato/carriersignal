import { useState, useEffect } from 'react';
import { Search, BarChart3, Bookmark, Settings, X } from 'lucide-react';

interface MobileNavProps {
  onViewChange?: (view: 'feed' | 'dashboard' | 'bookmarks' | 'settings' | 'test') => void;
  currentView?: 'feed' | 'dashboard' | 'bookmarks' | 'settings' | 'test';
}

interface NavButtonState {
  mousePos: { x: number; y: number };
}

export function MobileNav({ onViewChange, currentView = 'feed' }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [navButtonStates, setNavButtonStates] = useState<Record<string, NavButtonState>>({
    feed: { mousePos: { x: 0, y: 0 } },
    dashboard: { mousePos: { x: 0, y: 0 } },
    bookmarks: { mousePos: { x: 0, y: 0 } },
    settings: { mousePos: { x: 0, y: 0 } },
    close: { mousePos: { x: 0, y: 0 } },
  });

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

  const handleNavButtonMouseMove = (
    e: React.MouseEvent<HTMLButtonElement>,
    buttonId: string
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setNavButtonStates(prev => ({
      ...prev,
      [buttonId]: {
        mousePos: {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        },
      },
    }));
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
          <div className="liquid-glass-ultra border-t border-[#C7D2E1]/40 rounded-t-3xl shadow-2xl shadow-[#5AA6FF]/30 animate-enhancedPremiumGlow" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            {/* Handle Bar - Aurora Gradient */}
            <div className="flex justify-center pt-5 pb-4">
              <div className="w-12 h-1.5 bg-gradient-to-r from-[#5AA6FF] via-[#8B7CFF] to-[#B08CFF] rounded-full opacity-100 transition-all duration-300 hover:opacity-100 hover:scale-110" />
            </div>

            {/* Navigation Items */}
            <div className="px-5 pb-6 space-y-2.5">
              {/* Feed Button - Staggered Animation */}
              <button
                onClick={() => handleNavClick('feed')}
                onMouseMove={(e) => handleNavButtonMouseMove(e, 'feed')}
                className={`nav-button w-full flex items-center gap-3.5 px-5 py-3 rounded-xl font-bold transition-all duration-300 transform min-h-[52px] animate-slideInUp relative overflow-hidden ${
                  currentView === 'feed'
                    ? 'liquid-glass-premium text-[#5AA6FF] shadow-lg shadow-[#5AA6FF]/35 border border-[#5AA6FF]/50 scale-105'
                    : 'liquid-glass text-[#0F172A] hover:border-[#C7D2E1]/60 hover:shadow-md hover:shadow-[#5AA6FF]/15 hover:scale-[1.02] active:scale-95'
                }`}
                style={{ animationDelay: '0ms' }}
                aria-label="News Feed"
              >
                {/* Specular highlight layer */}
                <div
                  className="absolute inset-0 pointer-events-none rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at ${navButtonStates.feed.mousePos.x}px ${navButtonStates.feed.mousePos.y}px, rgba(255, 255, 255, 0.3) 0%, transparent 50%)`,
                  }}
                />
                <Search size={21} className="flex-shrink-0 relative z-10" />
                <span className="text-base font-semibold relative z-10">News Feed</span>
              </button>

              {/* Dashboard Button - Staggered Animation */}
              <button
                onClick={() => handleNavClick('dashboard')}
                onMouseMove={(e) => handleNavButtonMouseMove(e, 'dashboard')}
                className={`nav-button w-full flex items-center gap-3.5 px-5 py-3 rounded-xl font-bold transition-all duration-250 transform min-h-[48px] animate-slideInUp relative overflow-hidden ${
                  currentView === 'dashboard'
                    ? 'liquid-glass-premium text-[#8B7CFF] shadow-lg shadow-[#8B7CFF]/30 border border-[#8B7CFF]/40 scale-105'
                    : 'liquid-glass text-[#0F172A] hover:border-[#C7D2E1]/50 hover:shadow-md hover:scale-102 active:scale-98'
                }`}
                style={{ animationDelay: '50ms' }}
                aria-label="Dashboard"
              >
                {/* Specular highlight layer */}
                <div
                  className="absolute inset-0 pointer-events-none rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at ${navButtonStates.dashboard.mousePos.x}px ${navButtonStates.dashboard.mousePos.y}px, rgba(255, 255, 255, 0.3) 0%, transparent 50%)`,
                  }}
                />
                <BarChart3 size={21} className="flex-shrink-0 relative z-10" />
                <span className="text-base font-semibold relative z-10">Dashboard</span>
              </button>

              {/* Bookmarks Button - Staggered Animation */}
              <button
                onClick={() => handleNavClick('bookmarks')}
                onMouseMove={(e) => handleNavButtonMouseMove(e, 'bookmarks')}
                className={`nav-button w-full flex items-center gap-3.5 px-5 py-3 rounded-xl font-bold transition-all duration-250 transform min-h-[48px] animate-slideInUp relative overflow-hidden ${
                  currentView === 'bookmarks'
                    ? 'liquid-glass-premium text-[#B08CFF] shadow-lg shadow-[#B08CFF]/30 border border-[#B08CFF]/40 scale-105'
                    : 'liquid-glass text-[#0F172A] hover:border-[#C7D2E1]/50 hover:shadow-md hover:scale-102 active:scale-98'
                }`}
                style={{ animationDelay: '100ms' }}
                aria-label="Bookmarks"
              >
                {/* Specular highlight layer */}
                <div
                  className="absolute inset-0 pointer-events-none rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at ${navButtonStates.bookmarks.mousePos.x}px ${navButtonStates.bookmarks.mousePos.y}px, rgba(255, 255, 255, 0.3) 0%, transparent 50%)`,
                  }}
                />
                <Bookmark size={21} className="flex-shrink-0 relative z-10" />
                <span className="text-base font-semibold relative z-10">Bookmarks</span>
              </button>

              {/* Settings Button - Staggered Animation */}
              <button
                onClick={() => handleNavClick('settings')}
                onMouseMove={(e) => handleNavButtonMouseMove(e, 'settings')}
                className={`nav-button w-full flex items-center gap-3.5 px-5 py-3 rounded-xl font-bold transition-all duration-250 transform min-h-[48px] animate-slideInUp relative overflow-hidden ${
                  currentView === 'settings'
                    ? 'liquid-glass-premium text-[#5AA6FF] shadow-lg shadow-[#5AA6FF]/30 border border-[#5AA6FF]/40 scale-105'
                    : 'liquid-glass text-[#0F172A] hover:border-[#C7D2E1]/50 hover:shadow-md hover:scale-102 active:scale-98'
                }`}
                style={{ animationDelay: '150ms' }}
                aria-label="Settings"
              >
                {/* Specular highlight layer */}
                <div
                  className="absolute inset-0 pointer-events-none rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at ${navButtonStates.settings.mousePos.x}px ${navButtonStates.settings.mousePos.y}px, rgba(255, 255, 255, 0.3) 0%, transparent 50%)`,
                  }}
                />
                <Settings size={21} className="flex-shrink-0 relative z-10" />
                <span className="text-base font-semibold relative z-10">Settings</span>
              </button>

              {/* Close Button - Staggered Animation */}
              <button
                onClick={() => setIsOpen(false)}
                onMouseMove={(e) => handleNavButtonMouseMove(e, 'close')}
                className="nav-button w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl font-bold liquid-glass text-[#0F172A] hover:border-[#C7D2E1]/50 hover:shadow-md transition-all duration-250 mt-3 border border-[#C7D2E1]/35 transform hover:scale-102 active:scale-98 min-h-[48px] animate-slideInUp relative overflow-hidden"
                style={{ animationDelay: '200ms' }}
                aria-label="Close navigation"
              >
                {/* Specular highlight layer */}
                <div
                  className="absolute inset-0 pointer-events-none rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at ${navButtonStates.close.mousePos.x}px ${navButtonStates.close.mousePos.y}px, rgba(255, 255, 255, 0.3) 0%, transparent 50%)`,
                  }}
                />
                <X size={21} className="relative z-10" />
                <span className="text-base font-semibold relative z-10">Close</span>
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

