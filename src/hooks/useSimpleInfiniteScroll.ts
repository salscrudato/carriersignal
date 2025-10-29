/**
 * Simple Infinite Scroll Hook
 * Uses scroll event listener instead of Intersection Observer for more reliable pagination
 */

import { useEffect, useRef, useCallback } from 'react';

export interface UseSimpleInfiniteScrollOptions {
  onLoadMore: () => void | Promise<void>;
  isLoading?: boolean;
  hasMore?: boolean;
  enabled?: boolean;
  scrollContainer?: HTMLElement | null;
  threshold?: number; // pixels from bottom to trigger load
}

export interface UseSimpleInfiniteScrollReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Simple infinite scroll hook that uses scroll events
 * More reliable than Intersection Observer for nested scrolling containers
 */
export function useSimpleInfiniteScroll({
  onLoadMore,
  isLoading = false,
  hasMore = true,
  enabled = true,
  scrollContainer,
  threshold = 500,
}: UseSimpleInfiniteScrollOptions): UseSimpleInfiniteScrollReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const lastLoadTimeRef = useRef(0);
  const DEBOUNCE_MS = 300;

  const handleScroll = useCallback(() => {
    // Prevent concurrent loads
    if (isLoadingRef.current || isLoading) {
      return;
    }

    // Check if enough time has passed since last load
    const now = Date.now();
    if (now - lastLoadTimeRef.current < DEBOUNCE_MS) {
      return;
    }

    // Don't load if no more articles or not enabled
    if (!hasMore || !enabled) {
      return;
    }

    // Get the scroll container
    const container = scrollContainer || containerRef.current;
    if (!container) {
      console.log('[SimpleInfiniteScroll] No container found');
      return;
    }

    // Calculate scroll position
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

    console.log('[SimpleInfiniteScroll] Scroll event:', {
      scrollTop,
      scrollHeight,
      clientHeight,
      distanceFromBottom,
      threshold,
      shouldLoad: distanceFromBottom < threshold,
    });

    // Check if we're near the bottom
    if (distanceFromBottom < threshold) {
      lastLoadTimeRef.current = now;
      isLoadingRef.current = true;
      console.log('[SimpleInfiniteScroll] ✅ Triggering loadMore');

      try {
        const result = onLoadMore();

        // Handle both sync and async callbacks
        if (result instanceof Promise) {
          result
            .catch((error) => {
              console.error('[SimpleInfiniteScroll] Error loading more items:', error);
            })
            .finally(() => {
              isLoadingRef.current = false;
            });
        } else {
          isLoadingRef.current = false;
        }
      } catch (error) {
        console.error('[SimpleInfiniteScroll] Error in onLoadMore callback:', error);
        isLoadingRef.current = false;
      }
    }
  }, [onLoadMore, isLoading, hasMore, enabled, scrollContainer, threshold]);

  // Attach scroll listener when container is ready
  useEffect(() => {
    let container = scrollContainer;

    // If no container provided, try to find it by looking for the scrollable div
    if (!container) {
      // Look for a div with overflow-y-auto class
      const scrollableDiv = document.querySelector('[class*="overflow-y-auto"]') as HTMLElement;
      if (scrollableDiv && scrollableDiv !== document.documentElement) {
        container = scrollableDiv;
        console.log('[SimpleInfiniteScroll] Found scrollable container automatically');
      }
    }

    if (!container) {
      console.log('[SimpleInfiniteScroll] Waiting for container...');
      // Retry after a short delay
      const timeout = setTimeout(() => {
        console.log('[SimpleInfiniteScroll] Still waiting for container...');
      }, 500);
      return () => clearTimeout(timeout);
    }

    console.log('[SimpleInfiniteScroll] Attaching scroll listener to container', {
      containerHeight: container.clientHeight,
      scrollHeight: container.scrollHeight,
    });
    container.addEventListener('scroll', handleScroll);

    return () => {
      console.log('[SimpleInfiniteScroll] Removing scroll listener');
      container?.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, scrollContainer]);

  return {
    containerRef,
  };
}

