import { useState, useEffect } from 'react';

interface KeyboardShortcutsProps {
  onSearch?: () => void;
  onToggleFilters?: () => void;
}

export function KeyboardShortcuts({ onSearch, onToggleFilters }: KeyboardShortcutsProps) {
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onSearch?.();
      }
      // Cmd/Ctrl + F for filters
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        onToggleFilters?.();
      }
      // ? for help
      if (e.key === '?' && !showHelp) {
        setShowHelp(true);
      }
      // Escape to close help
      if (e.key === 'Escape' && showHelp) {
        setShowHelp(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onSearch, onToggleFilters, showHelp]);

  return (
    <>
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-96 overflow-y-auto animate-scaleIn">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Keyboard Shortcuts</h2>
              <button
                onClick={() => setShowHelp(false)}
                className="text-white hover:text-blue-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 font-medium">Search</span>
                  <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-semibold text-slate-700">
                    ⌘K
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 font-medium">Toggle Filters</span>
                  <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-semibold text-slate-700">
                    ⌘F
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 font-medium">Help</span>
                  <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-semibold text-slate-700">
                    ?
                  </kbd>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <p className="text-xs text-slate-500 text-center">
                  Press <kbd className="px-1 bg-slate-100 rounded text-xs">ESC</kbd> to close
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Button */}
      <button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-6 right-6 w-10 h-10 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center font-bold text-lg hover:scale-110 active:scale-95 z-40"
        title="Keyboard shortcuts (press ?)"
        aria-label="Show keyboard shortcuts"
      >
        ?
      </button>
    </>
  );
}

