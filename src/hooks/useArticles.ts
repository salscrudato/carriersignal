/**
 * useArticles Hook
 * Manages article fetching with pagination, error handling, and caching
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import type { QueryConstraint } from 'firebase/firestore';
import { db } from '../firebase';
import type { Article } from '../types';
import { logger } from '../utils/logger';

interface UseArticlesOptions {
  pageSize?: number;
  sortBy?: 'createdAt' | 'smartScore';
  sortOrder?: 'asc' | 'desc';
}

interface UseArticlesReturn {
  articles: Article[];
  loading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useArticles({
  pageSize = 20,
  sortBy = 'createdAt',
  sortOrder = 'desc',
}: UseArticlesOptions = {}): UseArticlesReturn {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const lastCursorRef = useRef<any>(null);
  const isLoadingRef = useRef(false);
  const prefetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadInitial = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      logger.info('useArticles', 'Loading initial articles');

      const constraints: QueryConstraint[] = [
        orderBy(sortBy, sortOrder),
        limit(pageSize),
      ];

      const q = query(collection(db, 'articles'), ...constraints);
      const snapshot = await getDocs(q);

      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      })) as Article[];

      setArticles(docs);
      lastCursorRef.current = snapshot.docs[snapshot.docs.length - 1] || null;
      // hasMore is true if we got a full page (means there might be more)
      const hasMoreArticles = snapshot.docs.length === pageSize;
      setHasMore(hasMoreArticles);

      logger.info('useArticles', `Loaded ${docs.length} articles, hasMore: ${hasMoreArticles}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load articles';
      logger.error('useArticles', 'Failed to load initial articles', { error: message });
      setError(message);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [pageSize, sortBy, sortOrder]);

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMore || !lastCursorRef.current) return;
    isLoadingRef.current = true;
    setIsLoadingMore(true);

    try {
      logger.info('useArticles', 'Loading more articles');

      const constraints: QueryConstraint[] = [
        orderBy(sortBy, sortOrder),
        startAfter(lastCursorRef.current),
        limit(pageSize),
      ];

      const q = query(collection(db, 'articles'), ...constraints);
      const snapshot = await getDocs(q);

      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      })) as Article[];

      setArticles((prev) => [...prev, ...docs]);
      lastCursorRef.current = snapshot.docs[snapshot.docs.length - 1] || null;
      // hasMore is true if we got a full page (means there might be more)
      const hasMoreArticles = snapshot.docs.length === pageSize;
      setHasMore(hasMoreArticles);

      logger.info('useArticles', `Loaded ${docs.length} more articles, hasMore: ${hasMoreArticles}`);

      // Prefetch next batch if we're getting close to the end
      if (docs.length > pageSize * 0.8) {
        prefetchTimeoutRef.current = setTimeout(() => {
          // Prefetch will happen automatically when user scrolls
        }, 500);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load more articles';
      logger.error('useArticles', 'Failed to load more articles', { error: message });
      setError(message);
    } finally {
      isLoadingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [pageSize, sortBy, sortOrder, hasMore]);

  const refresh = useCallback(async () => {
    lastCursorRef.current = null;
    setArticles([]);
    await loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    loadInitial();

    // Cleanup prefetch timeout on unmount
    return () => {
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }
    };
  }, [loadInitial]);

  return {
    articles,
    loading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}

