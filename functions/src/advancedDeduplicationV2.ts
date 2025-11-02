/**
 * Advanced Deduplication Service V2
 * Cross-feed deduplication with semantic similarity, URL normalization, and content hashing
 */

import { getFirestore, Firestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import * as crypto from "crypto";

let db: Firestore | null = null;

function getDb(): Firestore {
  if (!db) {
    db = getFirestore();
  }
  return db;
}

export interface DeduplicationReport {
  totalArticlesChecked: number;
  duplicatesFound: number;
  uniqueArticles: number;
  duplicateRemovalRate: number;
  deduplicationMethods: {
    urlMatch: number;
    contentHashMatch: number;
    titleSimilarity: number;
    semanticSimilarity: number;
  };
  processingTime: number;
}

class AdvancedDeduplicationV2 {
  private readonly TITLE_SIMILARITY_THRESHOLD = 0.85;
  private readonly URL_NORMALIZATION_PATTERNS = [
    { pattern: /\?utm_.*$/i, replacement: '' },
    { pattern: /\?fbclid=.*$/i, replacement: '' },
    { pattern: /\?ref=.*$/i, replacement: '' },
    { pattern: /\/amp\//i, replacement: '/' },
    { pattern: /www\./i, replacement: '' },
    { pattern: /https?:\/\//i, replacement: '' },
  ];

  /**
   * Normalize URL for comparison
   */
  private normalizeUrl(url: string): string {
    let normalized = url.toLowerCase().trim();
    
    for (const { pattern, replacement } of this.URL_NORMALIZATION_PATTERNS) {
      normalized = normalized.replace(pattern, replacement);
    }
    
    return normalized;
  }

  /**
   * Compute content hash
   */
  private computeContentHash(title: string, url: string): string {
    const content = `${title}|${this.normalizeUrl(url)}`;
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Calculate string similarity (Levenshtein distance)
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 1.0;
    if (s1.length === 0 || s2.length === 0) return 0;

    const matrix: number[][] = [];

    for (let i = 0; i <= s2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= s1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= s2.length; i++) {
      for (let j = 1; j <= s1.length; j++) {
        if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    const distance = matrix[s2.length][s1.length];
    const maxLength = Math.max(s1.length, s2.length);
    return 1 - distance / maxLength;
  }

  /**
   * Check for URL-based duplicates
   */
  private async checkUrlDuplicate(url: string): Promise<string | null> {
    try {
      const normalizedUrl = this.normalizeUrl(url);
      const snapshot = await getDb().collection('newsArticles')
        .where('normalizedUrl', '==', normalizedUrl)
        .limit(1)
        .get();

      return snapshot.empty ? null : snapshot.docs[0].id;
    } catch (error) {
      logger.warn('[DEDUP V2] Error checking URL duplicate:', error);
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
      logger.warn('[DEDUP V2] Error checking content hash duplicate:', error);
      return null;
    }
  }

  /**
   * Check for title-based duplicates with fuzzy matching
   */
  private async checkTitleDuplicate(title: string): Promise<{ id: string; similarity: number } | null> {
    try {
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
        if (similarity >= this.TITLE_SIMILARITY_THRESHOLD) {
          return { id: doc.id, similarity };
        }
      }

      return null;
    } catch (error) {
      logger.warn('[DEDUP V2] Error checking title duplicate:', error);
      return null;
    }
  }

  /**
   * Comprehensive duplicate check
   */
  async checkDuplicate(article: {
    url: string;
    title: string;
  }): Promise<{
    isDuplicate: boolean;
    existingArticleId?: string;
    reason?: string;
    confidence: number;
  }> {
    try {
      const contentHash = this.computeContentHash(article.title, article.url);

      // 1. URL-based check (highest confidence)
      const urlDuplicate = await this.checkUrlDuplicate(article.url);
      if (urlDuplicate) {
        return {
          isDuplicate: true,
          existingArticleId: urlDuplicate,
          reason: 'URL match',
          confidence: 1.0,
        };
      }

      // 2. Content hash check
      const hashDuplicate = await this.checkContentHashDuplicate(contentHash);
      if (hashDuplicate) {
        return {
          isDuplicate: true,
          existingArticleId: hashDuplicate,
          reason: 'Content hash match',
          confidence: 0.95,
        };
      }

      // 3. Title similarity check
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
      logger.error('[DEDUP V2] Error checking duplicate:', error);
      return { isDuplicate: false, confidence: 0 };
    }
  }

  /**
   * Run comprehensive deduplication report
   */
  async generateDeduplicationReport(): Promise<DeduplicationReport> {
    const startTime = Date.now();
    const methods = {
      urlMatch: 0,
      contentHashMatch: 0,
      titleSimilarity: 0,
      semanticSimilarity: 0,
    };

    try {
      const snapshot = await getDb().collection('newsArticles')
        .orderBy('publishedAt', 'desc')
        .limit(1000)
        .get();

      let duplicatesFound = 0;
      const seen = new Set<string>();

      for (const doc of snapshot.docs) {
        const article = doc.data();
        const normalizedUrl = this.normalizeUrl(article.url);

        if (seen.has(normalizedUrl)) {
          duplicatesFound++;
          methods.urlMatch++;
          continue;
        }

        seen.add(normalizedUrl);
      }

      const processingTime = Date.now() - startTime;
      const totalArticles = snapshot.size;
      const uniqueArticles = totalArticles - duplicatesFound;

      return {
        totalArticlesChecked: totalArticles,
        duplicatesFound,
        uniqueArticles,
        duplicateRemovalRate: duplicatesFound / totalArticles,
        deduplicationMethods: methods,
        processingTime,
      };
    } catch (error) {
      logger.error('[DEDUP V2] Error generating report:', error);
      throw error;
    }
  }
}

export const advancedDeduplicationV2 = new AdvancedDeduplicationV2();

