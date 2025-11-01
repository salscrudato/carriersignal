/**
 * useWatchlist Hook
 * Manages user watchlists for carriers, states, and topics
 */

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import { logger } from '../utils/logger';
import type { WatchlistItem } from '../types/news';

interface UseWatchlistOptions {
  userId?: string;
}

interface UseWatchlistResult {
  items: WatchlistItem[];
  loading: boolean;
  error: string | null;
  addItem: (type: 'carrier' | 'state' | 'topic', value: string, weight?: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateWeight: (id: string, weight: number) => Promise<void>;
  hasItem: (type: string, value: string) => boolean;
}

export function useWatchlist({ userId }: UseWatchlistOptions = {}): UseWatchlistResult {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to watchlist items
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'users', userId, 'watchlistItems'),
        where('userId', '==', userId)
      );

      const unsubscribe = onSnapshot(q, snapshot => {
        const watchlistItems = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as WatchlistItem));

        setItems(watchlistItems);
        setLoading(false);
        logger.info('useWatchlist', `Loaded ${watchlistItems.length} watchlist items`);
      });

      return () => unsubscribe();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load watchlist';
      setError(message);
      setLoading(false);
      logger.error('useWatchlist', message);
    }
  }, [userId]);

  // Add item to watchlist
  const addItem = useCallback(
    async (type: 'carrier' | 'state' | 'topic', value: string, weight: number = 1) => {
      if (!userId) {
        setError('User not authenticated');
        return;
      }

      try {
        // Check if item already exists
        if (hasItem(type, value)) {
          logger.warn('useWatchlist', `Item already in watchlist: ${type}/${value}`);
          return;
        }

        await addDoc(collection(db, 'users', userId, 'watchlistItems'), {
          userId,
          type,
          value,
          weight: Math.max(0, Math.min(1, weight)),
          createdAt: Date.now(),
        });

        logger.info('useWatchlist', `Added to watchlist: ${type}/${value}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add item';
        setError(message);
        logger.error('useWatchlist', message);
      }
    },
    [userId]
  );

  // Remove item from watchlist
  const removeItem = useCallback(
    async (id: string) => {
      if (!userId) {
        setError('User not authenticated');
        return;
      }

      try {
        await deleteDoc(doc(db, 'users', userId, 'watchlistItems', id));
        logger.info('useWatchlist', `Removed from watchlist: ${id}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to remove item';
        setError(message);
        logger.error('useWatchlist', message);
      }
    },
    [userId]
  );

  // Update item weight
  const updateWeight = useCallback(
    async (id: string, weight: number) => {
      if (!userId) {
        setError('User not authenticated');
        return;
      }

      try {
        await updateDoc(doc(db, 'users', userId, 'watchlistItems', id), {
          weight: Math.max(0, Math.min(1, weight)),
          updatedAt: Date.now(),
        });

        logger.info('useWatchlist', `Updated weight for: ${id}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update weight';
        setError(message);
        logger.error('useWatchlist', message);
      }
    },
    [userId]
  );

  // Check if item exists in watchlist
  const hasItem = useCallback(
    (type: string, value: string) => {
      return items.some(item => item.type === type && item.value === value);
    },
    [items]
  );

  return {
    items,
    loading,
    error,
    addItem,
    removeItem,
    updateWeight,
    hasItem,
  };
}

