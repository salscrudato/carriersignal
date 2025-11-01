/**
 * useNewsSignals Hook
 * Fetches and manages news signals with filtering and pagination
 */

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, limit, startAfter, getDocs, QueryConstraint } from 'firebase/firestore';
import { db } from '../firebase';
import { logger } from '../utils/logger';
import type { NewsArticle, NewsFilterState } from '../types/news';

interface UseNewsSignalsOptions {
  pageSize?: number;
  filters?: NewsFilterState;
}

interface UseNewsSignalsResult {
  articles: NewsArticle[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useNewsSignals({
  pageSize = 20,
  filters = {},
}: UseNewsSignalsOptions = {}): UseNewsSignalsResult {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);

  // Build query constraints based on filters
  const buildQueryConstraints = useCallback((): QueryConstraint[] => {
    const constraints: QueryConstraint[] = [];

    // Time window filter
    if (filters.timeWindow && filters.timeWindow !== 'all') {
      const now = Date.now();
      let timeMs = 0;
      switch (filters.timeWindow) {
        case 'today':
          timeMs = 24 * 60 * 60 * 1000;
          break;
        case 'week':
          timeMs = 7 * 24 * 60 * 60 * 1000;
          break;
        case 'month':
          timeMs = 30 * 24 * 60 * 60 * 1000;
          break;
      }
      constraints.push(where('publishedAt', '>', now - timeMs));
    }

    // State filter
    if (filters.states && filters.states.length > 0) {
      constraints.push(where('states', 'array-contains-any', filters.states));
    }

    // LOB filter
    if (filters.lobs && filters.lobs.length > 0) {
      constraints.push(where('lobs', 'array-contains-any', filters.lobs));
    }

    // Regulator filter
    if (filters.regulators && filters.regulators.length > 0) {
      constraints.push(where('regulators', 'array-contains-any', filters.regulators));
    }

    // Hazard filter
    if (filters.hazardOnly) {
      constraints.push(where('hazard', '!=', null));
    }

    // Watchlist filter (would require user context)
    // if (filters.watchlistOnly) { ... }

    // Sort by score descending, then by published date
    constraints.push(orderBy('score', 'desc'));
    constraints.push(orderBy('publishedAt', 'desc'));
    constraints.push(limit(pageSize + 1)); // +1 to check if more exist

    return constraints;
  }, [filters, pageSize]);

  // Fetch initial articles
  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const constraints = buildQueryConstraints();
      const q = query(collection(db, 'newsArticles'), ...constraints);
      const snapshot = await getDocs(q);

      const docs = snapshot.docs;
      const hasMoreDocs = docs.length > pageSize;

      if (hasMoreDocs) {
        docs.pop(); // Remove the extra doc used to check if more exist
      }

      const fetchedArticles = docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as NewsArticle));

      setArticles(fetchedArticles);
      setLastDoc(docs[docs.length - 1] || null);
      setHasMore(hasMoreDocs);

      logger.info('useNewsSignals', `Fetched ${fetchedArticles.length} articles`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch articles';
      setError(message);
      logger.error('useNewsSignals', message);
    } finally {
      setLoading(false);
    }
  }, [buildQueryConstraints, pageSize]);

  // Load more articles
  const loadMore = useCallback(async () => {
    if (!hasMore || !lastDoc) return;

    try {
      const constraints = buildQueryConstraints();
      // Replace limit with startAfter
      const filteredConstraints = constraints.filter(c => c.type !== 'limit');
      filteredConstraints.push(startAfter(lastDoc));
      filteredConstraints.push(limit(pageSize + 1));

      const q = query(collection(db, 'newsArticles'), ...filteredConstraints);
      const snapshot = await getDocs(q);

      const docs = snapshot.docs;
      const hasMoreDocs = docs.length > pageSize;

      if (hasMoreDocs) {
        docs.pop();
      }

      const newArticles = docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as NewsArticle));

      setArticles(prev => [...prev, ...newArticles]);
      setLastDoc(docs[docs.length - 1] || null);
      setHasMore(hasMoreDocs);

      logger.info('useNewsSignals', `Loaded ${newArticles.length} more articles`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load more articles';
      logger.error('useNewsSignals', message);
    }
  }, [buildQueryConstraints, hasMore, lastDoc, pageSize]);

  // Refresh articles
  const refresh = useCallback(async () => {
    setLastDoc(null);
    await fetchArticles();
  }, [fetchArticles]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return {
    articles,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}

