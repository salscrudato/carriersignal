/**
 * Advanced Deduplication Service
 * Semantic similarity, URL normalization, and cross-feed duplicate detection
 */

import {getFirestore, Firestore} from "firebase-admin/firestore";
import {logger} from "firebase-functions";
import * as crypto from 'crypto';

let db: Firestore | null = null;

function getDb(): Firestore {
  if (!db) {
    db = getFirestore();
  }
  return db;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingArticleId?: string;
  reason?: string;
  confidence: number;
  duplicateGroup?: string;
}

class AdvancedDeduplicationService {
  private readonly URL_SIMILARITY_THRESHOLD = 0.9;
  private readonly TITLE_SIMILARITY_THRESHOLD = 0.88;

  /**
   * Normalize URL for comparison
   */
  normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // Remove tracking parameters
      const params = new URLSearchParams(urlObj.search);
      const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];
      trackingParams.forEach(param => params.delete(param));
      
      urlObj.search = params.toString();
      
      // Normalize domain
      urlObj.hostname = urlObj.hostname.replace(/^www\./, '');
      
      // Remove trailing slash
      urlObj.pathname = urlObj.pathname.replace(/\/$/, '');
      
      return urlObj.toString().toLowerCase();
    } catch {
      return url.toLowerCase();
    }
  }

  /**
   * Create semantic hash for content
   */
  createSemanticHash(title: string, content: string): string {
    // Extract key terms (simplified semantic hashing)
    const keyTerms = this.extractKeyTerms(title + ' ' + content);
    const sorted = keyTerms.sort().join('|');
    return crypto.createHash('sha256').update(sorted).digest('hex');
  }

  /**
   * Extract key terms from text
   */
  private extractKeyTerms(text: string): string[] {
    // Remove common words and extract meaningful terms
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
    ]);

    const terms = text
      .toLowerCase()
      .split(/\s+/)
      .filter(term => term.length > 3 && !commonWords.has(term))
      .slice(0, 20); // Limit to first 20 meaningful terms

    return [...new Set(terms)];
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  calculateStringSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    if (s1 === s2) return 1;
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
        const cost = s2[i - 1] === s1[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    const maxLen = Math.max(s1.length, s2.length);
    return 1 - (matrix[s2.length][s1.length] / maxLen);
  }

  /**
   * Comprehensive duplicate check
   */
  async checkDuplicate(article: {
    url: string;
    title: string;
    content?: string;
  }): Promise<DuplicateCheckResult> {
    try {
      const normalizedUrl = this.normalizeUrl(article.url);
      const semanticHash = this.createSemanticHash(article.title, article.content || '');

      // 1. Check exact URL match
      const urlMatch = await this.checkUrlMatch(normalizedUrl);
      if (urlMatch) {
        return {
          isDuplicate: true,
          existingArticleId: urlMatch,
          reason: 'Exact URL match',
          confidence: 1.0,
        };
      }

      // 2. Check semantic hash match
      const hashMatch = await this.checkSemanticHashMatch(semanticHash);
      if (hashMatch) {
        return {
          isDuplicate: true,
          existingArticleId: hashMatch,
          reason: 'Semantic content match',
          confidence: 0.95,
        };
      }

      // 3. Check title similarity
      const titleMatch = await this.checkTitleSimilarity(article.title);
      if (titleMatch) {
        return {
          isDuplicate: true,
          existingArticleId: titleMatch.id,
          reason: 'Title similarity',
          confidence: titleMatch.similarity,
        };
      }

      // 4. Check URL similarity (for redirects/shortened URLs)
      const urlSimilarMatch = await this.checkUrlSimilarity(normalizedUrl);
      if (urlSimilarMatch) {
        return {
          isDuplicate: true,
          existingArticleId: urlSimilarMatch.id,
          reason: 'URL similarity',
          confidence: urlSimilarMatch.similarity,
        };
      }

      return {isDuplicate: false, confidence: 0};
    } catch (error) {
      logger.error('[ADVANCED DEDUP] Error checking duplicate:', error);
      return {isDuplicate: false, confidence: 0};
    }
  }

  private async checkUrlMatch(normalizedUrl: string): Promise<string | null> {
    try {
      const snapshot = await getDb().collection('newsArticles')
        .where('normalizedUrl', '==', normalizedUrl)
        .limit(1)
        .get();
      return snapshot.empty ? null : snapshot.docs[0].id;
    } catch {
      return null;
    }
  }

  private async checkSemanticHashMatch(hash: string): Promise<string | null> {
    try {
      const snapshot = await getDb().collection('newsArticles')
        .where('semanticHash', '==', hash)
        .limit(1)
        .get();
      return snapshot.empty ? null : snapshot.docs[0].id;
    } catch {
      return null;
    }
  }

  private async checkTitleSimilarity(title: string): Promise<{id: string; similarity: number} | null> {
    try {
      const snapshot = await getDb().collection('newsArticles')
        .orderBy('publishedAt', 'desc')
        .limit(100)
        .get();

      for (const doc of snapshot.docs) {
        const similarity = this.calculateStringSimilarity(title, doc.data().title);
        if (similarity >= this.TITLE_SIMILARITY_THRESHOLD) {
          return {id: doc.id, similarity};
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  private async checkUrlSimilarity(normalizedUrl: string): Promise<{id: string; similarity: number} | null> {
    try {
      const snapshot = await getDb().collection('newsArticles')
        .orderBy('publishedAt', 'desc')
        .limit(50)
        .get();

      for (const doc of snapshot.docs) {
        const existingUrl = doc.data().normalizedUrl || '';
        const similarity = this.calculateStringSimilarity(normalizedUrl, existingUrl);
        if (similarity >= this.URL_SIMILARITY_THRESHOLD) {
          return {id: doc.id, similarity};
        }
      }
      return null;
    } catch {
      return null;
    }
  }
}

export const advancedDeduplication = new AdvancedDeduplicationService();

