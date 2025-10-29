/**
 * Modern Infinite Scroll Hook with Intersection Observer
 * 
 * Features:
 * - Efficient Intersection Observer API
 * - Virtual scrolling support
 * - Automatic pagination
 * - Loading state management
 * - Error handling
 * - Configurable thresholds
 */

import { useEffect, useRef, useCallback, useState } from 'react';

export interface UseInfiniteScrollOptions {
  threshold?: number | number[];
  rootMargin?: string;
  root?: Element | null;
  onLoadMore: () => void | Promise<void>;
  isLoading?: boolean;
  hasMore?: boolean;
  enabled?: boolean;
}

export interface UseInfiniteScrollReturn {
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  hasMore: boolean;
}

/**
 * Hook for infinite scroll with Intersection Observer
 * 
 * Usage:
 * const { sentinelRef, isLoading } = useInfiniteScroll({
 *   onLoadMore: () => fetchMoreArticles(),
 *   isLoading: loading,
 *   hasMore: articles.length < totalCount
 * });
 * 
 * Then place <div ref={sentinelRef} /> at the end of your list
 */
export function useInfiniteScroll({
  threshold = 0.1,
  rootMargin = '100px',
  root = null,
  onLoadMore,
  isLoading = false,
  hasMore = true,
  enabled = true,
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [localIsLoading, setLocalIsLoading] = useState(false);
  const lastTriggerTimeRef = useRef<number>(0);
  const DEBOUNCE_MS = 100; // Prevent rapid-fire triggers

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      const now = Date.now();

      if (!entry.isIntersecting) {
        return;
      }

      // Check if we should load more
      const shouldLoad = !isLoading && !localIsLoading && hasMore && enabled && (now - lastTriggerTimeRef.current > DEBOUNCE_MS);

      console.log('[InfiniteScroll] Sentinel visible:', {
        shouldLoad,
        isLoading,
        localIsLoading,
        hasMore,
        enabled,
        timeSinceLastTrigger: now - lastTriggerTimeRef.current,
      });

      if (shouldLoad) {
        lastTriggerTimeRef.current = now;
        setLocalIsLoading(true);
        console.log('[InfiniteScroll] ✅ Triggering loadMore');

        try {
          const result = onLoadMore();

          // Handle both sync and async callbacks
          if (result instanceof Promise) {
            result
              .catch((error) => {
                console.error('[InfiniteScroll] Error loading more items:', error);
              })
              .finally(() => {
                setLocalIsLoading(false);
              });
          } else {
            setLocalIsLoading(false);
          }
        } catch (error) {
          console.error('[InfiniteScroll] Error in onLoadMore callback:', error);
          setLocalIsLoading(false);
        }
      }
    },
    [onLoadMore, isLoading, hasMore, enabled, localIsLoading]
  );

  useEffect(() => {
    console.log('[InfiniteScroll] Setting up observer', { threshold, rootMargin, root: !!root, enabled, hasMore });

    // Disconnect old observer if it exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create observer with options
    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
      root: root || null, // null means use viewport
    });

    // Start observing sentinel element
    if (sentinelRef.current && enabled) {
      console.log('[InfiniteScroll] Observing sentinel element', { hasRoot: !!root });
      observerRef.current.observe(sentinelRef.current);
    } else {
      console.log('[InfiniteScroll] Not observing - sentinel or enabled check failed', {
        hasSentinel: !!sentinelRef.current,
        enabled,
      });
    }

    // Cleanup
    return () => {
      console.log('[InfiniteScroll] Cleaning up observer');
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, threshold, rootMargin, root, enabled]);

  return {
    sentinelRef,
    isLoading: isLoading || localIsLoading,
    hasMore,
  };
}

/**
 * Hook for virtual scrolling with dynamic item heights
 * Optimizes rendering of large lists by only rendering visible items
 */
export interface UseVirtualScrollOptions {
  items: any[];
  itemHeight?: number;
  containerHeight: number;
  overscan?: number;
}

export interface UseVirtualScrollReturn {
  visibleItems: any[];
  visibleRange: { start: number; end: number };
  totalHeight: number;
  offsetY: number;
  setScrollTop: (top: number) => void;
}

export function useVirtualScroll({
  items,
  itemHeight = 100,
  containerHeight,
  overscan = 3,
}: UseVirtualScrollOptions): UseVirtualScrollReturn {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = {
    start: Math.max(0, Math.floor(scrollTop / itemHeight) - overscan),
    end: Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    ),
  };

  const visibleItems = items.slice(visibleRange.start, visibleRange.end);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return {
    visibleItems,
    visibleRange,
    totalHeight,
    offsetY,
    setScrollTop,
  };
}

