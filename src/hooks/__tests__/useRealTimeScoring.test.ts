/**
 * Tests for real-time scoring hook
 * Verifies that scores are recalculated periodically and articles are re-ranked
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useRealTimeScoring } from '../useRealTimeScoring';
import type { Article } from '../../types';

describe('useRealTimeScoring', () => {
  // Helper to create test articles
  const createArticle = (overrides: Partial<Article> = {}): Article => ({
    title: 'Test Article',
    url: 'https://example.com/article',
    source: 'Test Source',
    publishedAt: new Date().toISOString(),
    impactScore: 50,
    ...overrides,
  });

  it('should call onScoresUpdate on mount', () => {
    const mockOnUpdate = jest.fn();
    const articles = [createArticle()];

    renderHook(() =>
      useRealTimeScoring({
        articles,
        onScoresUpdate: mockOnUpdate,
        updateInterval: 1000,
        enabled: true,
      })
    );

    expect(mockOnUpdate).toHaveBeenCalled();
  });

  it('should recalculate scores periodically', async () => {
    jest.useFakeTimers();
    const mockOnUpdate = jest.fn();
    const articles = [createArticle()];

    renderHook(() =>
      useRealTimeScoring({
        articles,
        onScoresUpdate: mockOnUpdate,
        updateInterval: 1000,
        enabled: true,
      })
    );

    const initialCallCount = mockOnUpdate.mock.calls.length;

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockOnUpdate.mock.calls.length).toBeGreaterThan(initialCallCount);

    jest.useRealTimers();
  });

  it('should not update when disabled', () => {
    jest.useFakeTimers();
    const mockOnUpdate = jest.fn();
    const articles = [createArticle()];

    renderHook(() =>
      useRealTimeScoring({
        articles,
        onScoresUpdate: mockOnUpdate,
        updateInterval: 1000,
        enabled: false,
      })
    );

    const initialCallCount = mockOnUpdate.mock.calls.length;

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockOnUpdate.mock.calls.length).toBe(initialCallCount);

    jest.useRealTimers();
  });

  it('should sort articles by updated scores', () => {
    const mockOnUpdate = jest.fn();
    const now = new Date();
    const articles = [
      createArticle({
        title: 'Old Article',
        publishedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        impactScore: 50,
      }),
      createArticle({
        title: 'Fresh Article',
        publishedAt: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
        impactScore: 50,
      }),
    ];

    renderHook(() =>
      useRealTimeScoring({
        articles,
        onScoresUpdate: mockOnUpdate,
        updateInterval: 1000,
        enabled: true,
      })
    );

    const updatedArticles = mockOnUpdate.mock.calls[0][0];
    expect(updatedArticles[0].title).toBe('Fresh Article');
  });

  it('should handle empty articles array', () => {
    const mockOnUpdate = jest.fn();

    renderHook(() =>
      useRealTimeScoring({
        articles: [],
        onScoresUpdate: mockOnUpdate,
        updateInterval: 1000,
        enabled: true,
      })
    );

    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  it('should clean up interval on unmount', () => {
    jest.useFakeTimers();
    const mockOnUpdate = jest.fn();
    const articles = [createArticle()];

    const { unmount } = renderHook(() =>
      useRealTimeScoring({
        articles,
        onScoresUpdate: mockOnUpdate,
        updateInterval: 1000,
        enabled: true,
      })
    );

    unmount();

    const callCountBeforeAdvance = mockOnUpdate.mock.calls.length;

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockOnUpdate.mock.calls.length).toBe(callCountBeforeAdvance);

    jest.useRealTimers();
  });
});

