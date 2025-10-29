/**
 * useRealTimeScoring Hook
 * Periodically recalculates article scores to ensure proper ranking as articles age
 * Ensures older articles naturally move down the feed
 */

import { useEffect, useRef, useCallback } from 'react';
import type { Article } from '../types';
import { calculateDynamicArticleScore } from '../utils/scoring';

interface UseRealTimeScoringOptions {
  articles: Article[];
  onScoresUpdate: (articles: Article[]) => void;
  updateInterval?: number; // milliseconds, default 60000 (1 minute)
  enabled?: boolean;
}

/**
 * Hook that periodically recalculates article scores
 * This ensures that as articles age, their scores decay appropriately
 * and older articles naturally move down the feed
 */
export function useRealTimeScoring({
  articles,
  onScoresUpdate,
  updateInterval = 60000, // 1 minute default
  enabled = true,
}: UseRealTimeScoringOptions): void {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const updateScores = useCallback(() => {
    if (!enabled || articles.length === 0) return;

    // Recalculate scores for all articles
    const updatedArticles = articles.map(article => ({
      ...article,
      dynamicScore: calculateDynamicArticleScore(article),
    }));

    // Sort by updated scores
    updatedArticles.sort((a, b) => (b.dynamicScore || 0) - (a.dynamicScore || 0));

    onScoresUpdate(updatedArticles);
    lastUpdateRef.current = Date.now();
  }, [articles, enabled, onScoresUpdate]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial update
    updateScores();

    // Set up periodic updates
    intervalRef.current = setInterval(updateScores, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [updateScores, updateInterval, enabled]);
}

/**
 * Hook for tracking time spent on an article
 * Useful for engagement metrics
 */
export function useArticleTimeTracking(
  articleId: string | undefined,
  onTimeUpdate?: (seconds: number) => void
): void {
  const startTimeRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!articleId) return;

    startTimeRef.current = Date.now();

    return () => {
      if (startTimeRef.current) {
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
        accumulatedTimeRef.current += timeSpent;
        onTimeUpdate?.(accumulatedTimeRef.current);
      }
    };
  }, [articleId, onTimeUpdate]);
}

