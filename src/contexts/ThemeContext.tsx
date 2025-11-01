/**
 * Theme Context
 * Manages light/dark mode theme state
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { THEME, type ThemeMode } from '../design/theme';

interface ThemeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
  theme: typeof THEME.light;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem('theme-mode') as ThemeMode | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const initialMode: ThemeMode = stored || (prefersDark ? 'dark' : 'light');
    setModeState(initialMode);
    applyTheme(initialMode);
    setMounted(true);
  }, []);

  // Apply theme to DOM
  const applyTheme = (newMode: ThemeMode) => {
    const root = document.documentElement;
    if (newMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme-mode', newMode);
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    applyTheme(newMode);
  };

  const toggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
  };

  const theme = mode === 'dark' ? THEME.dark : THEME.light;

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, setMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

