/**
 * Engagement tracking utilities for interest-based scoring
 * Tracks user interactions to improve article ranking
 */

import { db } from '../firebase';
import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';

/**
 * Track article click event
 * @param articleId - ID of the clicked article
 */
export async function trackArticleClick(articleId: string): Promise<void> {
  try {
    const articleRef = doc(db, 'articles', articleId);
    await updateDoc(articleRef, {
      'engagementMetrics.clicks': increment(1),
    });
  } catch (error) {
    console.warn(`[Engagement] Failed to track click for article ${articleId}:`, error);
  }
}

/**
 * Track article save/bookmark event
 * @param articleId - ID of the saved article
 */
export async function trackArticleSave(articleId: string): Promise<void> {
  try {
    const articleRef = doc(db, 'articles', articleId);
    await updateDoc(articleRef, {
      'engagementMetrics.saves': increment(1),
    });
  } catch (error) {
    console.warn(`[Engagement] Failed to track save for article ${articleId}:`, error);
  }
}

/**
 * Track article share event
 * @param articleId - ID of the shared article
 */
export async function trackArticleShare(articleId: string): Promise<void> {
  try {
    const articleRef = doc(db, 'articles', articleId);
    await updateDoc(articleRef, {
      'engagementMetrics.shares': increment(1),
    });
  } catch (error) {
    console.warn(`[Engagement] Failed to track share for article ${articleId}:`, error);
  }
}

/**
 * Track time spent reading an article
 * @param articleId - ID of the article
 * @param seconds - Time spent in seconds
 */
export async function trackTimeSpent(articleId: string, seconds: number): Promise<void> {
  try {
    const articleRef = doc(db, 'articles', articleId);
    await updateDoc(articleRef, {
      'engagementMetrics.timeSpent': increment(seconds),
    });
  } catch (error) {
    console.warn(`[Engagement] Failed to track time spent for article ${articleId}:`, error);
  }
}

/**
 * Get engagement metrics for an article
 * @param articleId - ID of the article
 * @returns Engagement metrics object
 */
export async function getEngagementMetrics(articleId: string) {
  try {
    const articleRef = doc(db, 'articles', articleId);
    const snapshot = await getDoc(articleRef);
    
    if (!snapshot.exists()) {
      return { clicks: 0, saves: 0, shares: 0, timeSpent: 0 };
    }

    const data = snapshot.data();
    return data.engagementMetrics || { clicks: 0, saves: 0, shares: 0, timeSpent: 0 };
  } catch (error) {
    console.warn(`[Engagement] Failed to get metrics for article ${articleId}:`, error);
    return { clicks: 0, saves: 0, shares: 0, timeSpent: 0 };
  }
}

/**
 * Calculate engagement score (0-1) based on metrics
 * @param clicks - Number of clicks
 * @param saves - Number of saves
 * @param shares - Number of shares
 * @param timeSpent - Time spent in seconds
 * @returns Normalized engagement score
 */
export function calculateEngagementScore(
  clicks: number = 0,
  saves: number = 0,
  shares: number = 0,
  timeSpent: number = 0
): number {
  const clickScore = Math.min(clicks / 100, 1.0) * 0.4;
  const saveScore = Math.min(saves / 50, 1.0) * 0.35;
  const shareScore = Math.min(shares / 20, 1.0) * 0.15;
  const timeScore = Math.min(timeSpent / 300, 1.0) * 0.10;
  
  return clickScore + saveScore + shareScore + timeScore;
}

