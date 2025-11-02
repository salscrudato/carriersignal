/**
 * Intelligent Deduplication & Freshness System
 * Prevents duplicate articles and ensures content freshness
 */

import {getFirestore, Firestore} from "firebase-admin/firestore";
import {logger} from "firebase-functions";

let db: Firestore | null = null;

function getDb(): Firestore {
  if (!db) {
    db = getFirestore();
  }
  return db;
}

export interface DeduplicationResult {
  isDuplicate: boolean;
  existingArticleId?: string;
  reason?: string;
  confidence: number;
}

export interface FreshnessScore {
  score: number; // 0-100
  age: number; // hours
  isStale: boolean;
  shouldRefresh: boolean;
}

export class DeduplicationService {
  private readonly STALE_THRESHOLD_HOURS = 7 * 24; // 7 days
  private readonly DUPLICATE_SIMILARITY_THRESHOLD = 0.85;

  /**
   * Check if article is a duplicate
   */
  async checkDuplicate(article: {
    url: string;
    title: string;
    contentHash?: string;
  }): Promise<DeduplicationResult> {
    try {
      // 1. Check URL-based duplicates (exact match)
      const urlDuplicate = await this.checkUrlDuplicate(article.url);
      if (urlDuplicate) {
        return {
          isDuplicate: true,
          existingArticleId: urlDuplicate,
          reason: 'URL match',
          confidence: 1.0,
        };
      }

      // 2. Check content hash duplicates
      if (article.contentHash) {
        const hashDuplicate = await this.checkContentHashDuplicate(article.contentHash);
        if (hashDuplicate) {
          return {
            isDuplicate: true,
            existingArticleId: hashDuplicate,
            reason: 'Content hash match',
            confidence: 0.95,
          };
        }
      }

      // 3. Check title-based duplicates (fuzzy matching)
      const titleDuplicate = await this.checkTitleDuplicate(article.title);
      if (titleDuplicate) {
        return {
          isDuplicate: true,
          existingArticleId: titleDuplicate.id,
          reason: 'Title similarity',
          confidence: titleDuplicate.similarity,
        };
      }

      return {
        isDuplicate: false,
        confidence: 0,
      };
    } catch (error) {
      logger.error('[DEDUP] Error checking duplicate:', error);
      return {isDuplicate: false, confidence: 0};
    }
  }

  /**
   * Check for URL-based duplicates
   */
  private async checkUrlDuplicate(url: string): Promise<string | null> {
    try {
      const snapshot = await getDb().collection('newsArticles')
        .where('url', '==', url)
        .limit(1)
        .get();

      return snapshot.empty ? null : snapshot.docs[0].id;
    } catch (error) {
      logger.warn('[DEDUP] Error checking URL duplicate:', error);
      return null;
    }
  }

  /**
   * Check for content hash duplicates
   */
  private async checkContentHashDuplicate(contentHash: string): Promise<string | null> {
    try {
      const snapshot = await getDb().collection('newsArticles')
        .where('contentHash', '==', contentHash)
        .limit(1)
        .get();

      return snapshot.empty ? null : snapshot.docs[0].id;
    } catch (error) {
      logger.warn('[DEDUP] Error checking content hash duplicate:', error);
      return null;
    }
  }

  /**
   * Check for title-based duplicates using fuzzy matching
   */
  private async checkTitleDuplicate(title: string): Promise<{id: string; similarity: number} | null> {
    try {
      // Get recent articles with similar title length
      const titleLength = title.length;
      const snapshot = await getDb().collection('newsArticles')
        .where('titleLength', '>=', titleLength * 0.8)
        .where('titleLength', '<=', titleLength * 1.2)
        .orderBy('titleLength')
        .orderBy('publishedAt', 'desc')
        .limit(50)
        .get();

      for (const doc of snapshot.docs) {
        const similarity = this.calculateStringSimilarity(title, doc.data().title);
        if (similarity >= this.DUPLICATE_SIMILARITY_THRESHOLD) {
          return {id: doc.id, similarity};
        }
      }

      return null;
    } catch (error) {
      logger.warn('[DEDUP] Error checking title duplicate:', error);
      return null;
    }
  }

  /**
   * Calculate string similarity (Levenshtein distance)
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.getEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate edit distance between two strings
   */
  private getEditDistance(s1: string, s2: string): number {
    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  /**
   * Calculate freshness score for an article
   */
  calculateFreshness(publishedAt: Date): FreshnessScore {
    const now = new Date();
    const ageMs = now.getTime() - publishedAt.getTime();
    const ageHours = ageMs / (1000 * 60 * 60);

    let score = 100;
    if (ageHours > 24) score -= Math.min(50, (ageHours - 24) / 24 * 10);
    if (ageHours > 7 * 24) score -= Math.min(40, (ageHours - 7 * 24) / 24 * 5);

    return {
      score: Math.max(0, score),
      age: ageHours,
      isStale: ageHours > this.STALE_THRESHOLD_HOURS,
      shouldRefresh: ageHours > 24 && ageHours < 7 * 24,
    };
  }

  /**
   * Mark article as refreshed
   */
  async markRefreshed(articleId: string): Promise<void> {
    try {
      const {FieldValue} = await import('firebase-admin/firestore');
      await getDb().collection('newsArticles').doc(articleId).update({
        lastRefreshedAt: new Date(),
        refreshCount: FieldValue.increment(1),
      });
    } catch (error) {
      logger.warn('[DEDUP] Error marking article as refreshed:', error);
    }
  }

  /**
   * Get stale articles for refresh
   */
  async getStaleArticles(limit: number = 100): Promise<Array<{id: string; age: number}>> {
    try {
      const staleDate = new Date(Date.now() - this.STALE_THRESHOLD_HOURS * 60 * 60 * 1000);
      const snapshot = await getDb().collection('newsArticles')
        .where('publishedAt', '<', staleDate)
        .orderBy('publishedAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        age: (Date.now() - doc.data().publishedAt.toDate().getTime()) / (1000 * 60 * 60),
      }));
    } catch (error) {
      logger.warn('[DEDUP] Error getting stale articles:', error);
      return [];
    }
  }
}

export const deduplication = new DeduplicationService();

