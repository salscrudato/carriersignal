/**
 * Hook to access UI context
 */

import { useContext } from 'react';
import { UIContext } from '../context/UIContextType';

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within UIProvider');
  }
  return context;
}

