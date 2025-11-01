/**
 * Feature Flags
 * Manages feature flag state and rollout
 */

import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { logger } from './logger';

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number; // 0-100
  targetUsers?: string[];
  targetGroups?: string[];
  createdAt: number;
  updatedAt: number;
}

// Feature flags
export const FEATURE_FLAGS = {
  SIGNALS_V2: 'signals_v2',
  DARK_MODE: 'dark_mode',
  WATCHLISTS: 'watchlists',
  HAZARD_LINKING: 'hazard_linking',
  EDGAR_BACKFILL: 'edgar_backfill',
} as const;

// Cache for feature flags
let flagCache: Map<string, FeatureFlag> = new Map();
let cacheExpiry = 0;

/**
 * Check if a feature is enabled for a user
 */
export async function isFeatureEnabled(
  flagName: string,
  userId?: string,
  userGroup?: string
): Promise<boolean> {
  try {
    // Check cache first
    if (Date.now() < cacheExpiry && flagCache.has(flagName)) {
      const flag = flagCache.get(flagName)!;
      return evaluateFlag(flag, userId, userGroup);
    }

    // Fetch from Firestore
    const q = query(collection(db, 'featureFlags'), where('id', '==', flagName));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      logger.warn('featureFlags', `Flag not found: ${flagName}`);
      return false;
    }

    const flag = snapshot.docs[0].data() as FeatureFlag;
    flagCache.set(flagName, flag);
    cacheExpiry = Date.now() + 5 * 60 * 1000; // 5 minute cache

    return evaluateFlag(flag, userId, userGroup);
  } catch (error) {
    logger.error('featureFlags', `Error checking flag ${flagName}:`, error);
    return false;
  }
}

/**
 * Evaluate if a flag is enabled for a specific user
 */
function evaluateFlag(flag: FeatureFlag, userId?: string, userGroup?: string): boolean {
  if (!flag.enabled) {
    return false;
  }

  // Check target users
  if (flag.targetUsers && userId && flag.targetUsers.includes(userId)) {
    return true;
  }

  // Check target groups
  if (flag.targetGroups && userGroup && flag.targetGroups.includes(userGroup)) {
    return true;
  }

  // Check rollout percentage
  if (flag.rolloutPercentage < 100) {
    if (!userId) {
      return false;
    }

    // Deterministic rollout based on user ID
    const hash = hashUserId(userId);
    const percentage = (hash % 100) + 1;
    return percentage <= flag.rolloutPercentage;
  }

  return true;
}

/**
 * Hash user ID for deterministic rollout
 */
function hashUserId(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Create or update a feature flag
 */
export async function setFeatureFlag(flag: FeatureFlag): Promise<void> {
  try {
    await setDoc(doc(db, 'featureFlags', flag.id), {
      ...flag,
      updatedAt: Date.now(),
    });

    // Invalidate cache
    flagCache.delete(flag.id);
    cacheExpiry = 0;

    logger.info('featureFlags', `Flag updated: ${flag.id}`);
  } catch (error) {
    logger.error('featureFlags', `Error setting flag ${flag.id}:`, error);
    throw error;
  }
}

/**
 * Enable a feature flag
 */
export async function enableFeature(flagName: string, rolloutPercentage: number = 100): Promise<void> {
  const flag: FeatureFlag = {
    id: flagName,
    name: flagName,
    description: `Feature flag for ${flagName}`,
    enabled: true,
    rolloutPercentage,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await setFeatureFlag(flag);
}

/**
 * Disable a feature flag
 */
export async function disableFeature(flagName: string): Promise<void> {
  const flag: FeatureFlag = {
    id: flagName,
    name: flagName,
    description: `Feature flag for ${flagName}`,
    enabled: false,
    rolloutPercentage: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await setFeatureFlag(flag);
}

/**
 * Gradual rollout (increase percentage over time)
 */
export async function gradualRollout(flagName: string, targetPercentage: number): Promise<void> {
  const q = query(collection(db, 'featureFlags'), where('id', '==', flagName));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    await enableFeature(flagName, targetPercentage);
    return;
  }

  const flag = snapshot.docs[0].data() as FeatureFlag;
  flag.rolloutPercentage = Math.min(targetPercentage, 100);
  flag.updatedAt = Date.now();

  await setFeatureFlag(flag);
}

/**
 * React hook for feature flags
 */
export function useFeatureFlag(flagName: string, userId?: string, userGroup?: string) {
  const [enabled, setEnabled] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    isFeatureEnabled(flagName, userId, userGroup)
      .then(setEnabled)
      .finally(() => setLoading(false));
  }, [flagName, userId, userGroup]);

  return { enabled, loading };
}

// Import React for the hook
import React from 'react';

