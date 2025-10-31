/**
 * UI Context Type Definition
 */

import { createContext } from 'react';

export type ViewMode = 'feed' | 'dashboard' | 'bookmarks' | 'settings' | 'test';
export type SortMode = 'smart' | 'recency';

export interface UIContextType {
  view: ViewMode;
  setView: (view: ViewMode) => void;
  sortMode: SortMode;
  setSortMode: (mode: SortMode) => void;
  isPaletteOpen: boolean;
  setIsPaletteOpen: (open: boolean) => void;
  quickReadArticleUrl: string | null;
  setQuickReadArticleUrl: (url: string | null) => void;
}

export const UIContext = createContext<UIContextType | undefined>(undefined);

