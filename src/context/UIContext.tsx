/**
 * UI Context Provider
 * Manages global UI state: view mode, sort mode, palette state, etc.
 */

import { useState } from 'react';
import type { ReactNode } from 'react';
import { UIContext, type UIContextType, type ViewMode, type SortMode } from './UIContextType';

export function UIProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<ViewMode>('feed');
  const [sortMode, setSortMode] = useState<SortMode>('smart');
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const value: UIContextType = {
    view,
    setView,
    sortMode,
    setSortMode,
    isPaletteOpen,
    setIsPaletteOpen,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}

