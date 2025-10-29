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
  const pageCountRef = useRef(0);

  const loadInitial = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      logger.info('useArticles', 'Loading initial articles', { pageSize, sortBy, sortOrder });

      const constraints: QueryConstraint[] = [
        orderBy(sortBy, sortOrder),
        limit(pageSize),
      ];

      const q = query(collection(db, 'articles'), ...constraints);
      const snapshot = await getDocs(q);

      console.log(`[useArticles] Initial query returned ${snapshot.docs.length} documents`);

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

      logger.info('useArticles', `Initial load complete: ${docs.length} articles loaded, hasMore: ${hasMoreArticles}`, {
        pageSize,
        docsLength: docs.length,
        hasMoreArticles,
      });

      console.log(`[useArticles] Initial load: ${docs.length} articles, hasMore: ${hasMoreArticles}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load articles';
      logger.error('useArticles', 'Failed to load initial articles', { error: message });
      console.error('[useArticles] Error loading initial articles:', err);
      setError(message);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [pageSize, sortBy, sortOrder]);

  const loadMore = useCallback(async () => {
    // Prevent concurrent loads
    if (isLoadingRef.current) {
      console.log('[useArticles] Already loading, skipping loadMore');
      return;
    }

    // Don't load if no more articles
    if (!hasMore) {
      console.log('[useArticles] No more articles available');
      return;
    }

    // Don't load if we don't have a cursor
    if (!lastCursorRef.current) {
      console.log('[useArticles] No cursor available, skipping loadMore');
      return;
    }

    isLoadingRef.current = true;
    setIsLoadingMore(true);

    try {
      pageCountRef.current += 1;
      console.log(`[useArticles] Loading page ${pageCountRef.current}...`);

      const constraints: QueryConstraint[] = [
        orderBy(sortBy, sortOrder),
        startAfter(lastCursorRef.current),
        limit(pageSize),
      ];

      const q = query(collection(db, 'articles'), ...constraints);
      const snapshot = await getDocs(q);

      console.log(`[useArticles] Page ${pageCountRef.current}: Fetched ${snapshot.docs.length} articles`);

      if (snapshot.docs.length === 0) {
        console.log('[useArticles] No more articles - reached end');
        setHasMore(false);
        return;
      }

      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      })) as Article[];

      // Update articles
      setArticles((prev) => {
        const updated = [...prev, ...docs];
        console.log(`[useArticles] Total articles now: ${updated.length}`);
        return updated;
      });

      // Update cursor for next page
      lastCursorRef.current = snapshot.docs[snapshot.docs.length - 1];

      // Check if there are more articles
      const hasMoreArticles = snapshot.docs.length === pageSize;
      setHasMore(hasMoreArticles);
      console.log(`[useArticles] Page ${pageCountRef.current} complete. hasMore: ${hasMoreArticles}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load more articles';
      console.error('[useArticles] Error loading more:', message);
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

