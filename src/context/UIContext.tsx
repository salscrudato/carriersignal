/**
 * UI Context Provider
 * Manages global UI state: view mode, sort mode, palette state, etc.
 */

import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type ViewMode = 'feed' | 'dashboard' | 'bookmarks' | 'settings';
type SortMode = 'smart' | 'recency';

interface UIContextType {
  view: ViewMode;
  setView: (view: ViewMode) => void;
  sortMode: SortMode;
  setSortMode: (mode: SortMode) => void;
  isPaletteOpen: boolean;
  setIsPaletteOpen: (open: boolean) => void;
  quickReadArticleUrl: string | null;
  setQuickReadArticleUrl: (url: string | null) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<ViewMode>('feed');
  const [sortMode, setSortMode] = useState<SortMode>('smart');
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [quickReadArticleUrl, setQuickReadArticleUrl] = useState<string | null>(null);

  const value: UIContextType = {
    view,
    setView,
    sortMode,
    setSortMode,
    isPaletteOpen,
    setIsPaletteOpen,
    quickReadArticleUrl,
    setQuickReadArticleUrl,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within UIProvider');
  }
  return context;
}

