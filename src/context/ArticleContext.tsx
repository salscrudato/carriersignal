/**
 * Article Context Provider
 * Centralizes article state management and provides global access to article data
 */

import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Article } from '../types';

interface ArticleContextType {
  articles: Article[];
  setArticles: (articles: Article[]) => void;
  selectedArticle: Article | null;
  setSelectedArticle: (article: Article | null) => void;
  addArticles: (articles: Article[]) => void;
  removeArticle: (url: string) => void;
  updateArticle: (url: string, updates: Partial<Article>) => void;
  clearArticles: () => void;
}

const ArticleContext = createContext<ArticleContextType | undefined>(undefined);

export function ArticleProvider({ children }: { children: ReactNode }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const addArticles = useCallback((newArticles: Article[]) => {
    setArticles((prev) => {
      const urls = new Set(prev.map((a) => a.url));
      const filtered = newArticles.filter((a) => !urls.has(a.url));
      return [...prev, ...filtered];
    });
  }, []);

  const removeArticle = useCallback((url: string) => {
    setArticles((prev) => prev.filter((a) => a.url !== url));
  }, []);

  const updateArticle = useCallback((url: string, updates: Partial<Article>) => {
    setArticles((prev) =>
      prev.map((a) => (a.url === url ? { ...a, ...updates } : a))
    );
  }, []);

  const clearArticles = useCallback(() => {
    setArticles([]);
    setSelectedArticle(null);
  }, []);

  const value: ArticleContextType = {
    articles,
    setArticles,
    selectedArticle,
    setSelectedArticle,
    addArticles,
    removeArticle,
    updateArticle,
    clearArticles,
  };

  return (
    <ArticleContext.Provider value={value}>
      {children}
    </ArticleContext.Provider>
  );
}

export function useArticles() {
  const context = useContext(ArticleContext);
  if (!context) {
    throw new Error('useArticles must be used within ArticleProvider');
  }
  return context;
}

