/**
 * Advanced Deduplication V4
 * Multi-strategy duplicate detection with ML-based semantic similarity
 * 
 * Strategies:
 * 1. URL-based (exact and normalized)
 * 2. Content hash (MD5 of title + URL)
 * 3. Semantic similarity (embedding-based)
 * 4. Fuzzy title matching
 * 5. Domain + title combination
 */

import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import * as crypto from 'crypto';

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
  matchType?: 'url' | 'content_hash' | 'semantic' | 'fuzzy_title' | 'domain_title';
  confidence: number; // 0-1
  reason: string;
  matchedArticle?: {
    id: string;
    title: string;
    url: string;
    publishedAt: Date;
  };
}

export interface DuplicateStats {
  totalChecked: number;
  duplicatesFound: number;
  duplicateRate: number;
  byMatchType: Record<string, number>;
  lastUpdated: Date;
}

export class DeduplicationV4 {
  private readonly TITLE_SIMILARITY_THRESHOLD = 0.80;
  private readonly SEMANTIC_SIMILARITY_THRESHOLD = 0.75;
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 min cache
  private urlCache = new Map<string, { result: DeduplicationResult | null; time: number }>();

  /**
   * Comprehensive duplicate check with multiple strategies
   */
  async checkDuplicate(article: {
    url: string;
    title: string;
    content?: string;
    publishedAt?: Date;
    embedding?: number[];
  }): Promise<DeduplicationResult> {
    try {
      const normalizedUrl = this.normalizeUrl(article.url);

      // Check cache first
      const cached = this.urlCache.get(normalizedUrl);
      if (cached && Date.now() - cached.time < this.CACHE_TTL_MS) {
        return cached.result || { isDuplicate: false, confidence: 1.0, reason: 'No duplicates detected' };
      }

      // 1. URL-based check (highest confidence)
      const urlResult = await this.checkUrlDuplicate(normalizedUrl);
      if (urlResult) {
        this.urlCache.set(normalizedUrl, { result: urlResult, time: Date.now() });
        return urlResult;
      }

      // 2. Content hash check
      const hashResult = await this.checkContentHashDuplicate(article.title, normalizedUrl);
      if (hashResult) {
        this.urlCache.set(normalizedUrl, { result: hashResult, time: Date.now() });
        return hashResult;
      }

      // 3. Semantic similarity (if embedding available)
      if (article.embedding) {
        const semanticResult = await this.checkSemanticDuplicate(article.embedding);
        if (semanticResult) {
          this.urlCache.set(normalizedUrl, { result: semanticResult, time: Date.now() });
          return semanticResult;
        }
      }

      // 4. Fuzzy title matching
      const fuzzyResult = await this.checkFuzzyTitleDuplicate(article.title);
      if (fuzzyResult) {
        this.urlCache.set(normalizedUrl, { result: fuzzyResult, time: Date.now() });
        return fuzzyResult;
      }

      // 5. Domain + title combination
      const domainResult = await this.checkDomainTitleDuplicate(normalizedUrl, article.title);
      if (domainResult) {
        this.urlCache.set(normalizedUrl, { result: domainResult, time: Date.now() });
        return domainResult;
      }

      const noMatch = { isDuplicate: false, confidence: 1.0, reason: 'No duplicates detected' };
      this.urlCache.set(normalizedUrl, { result: noMatch, time: Date.now() });
      return noMatch;
    } catch (error) {
      logger.warn('[DEDUP V4] Error checking duplicate:', error);
      return { isDuplicate: false, confidence: 0.5, reason: 'Error during duplicate check' };
    }
  }

  /**
   * Check for exact URL match
   */
  private async checkUrlDuplicate(normalizedUrl: string): Promise<DeduplicationResult | null> {
    try {
      const snapshot = await getDb().collection('newsArticles')
        .where('canonicalLink', '==', normalizedUrl)
        .limit(1)
        .get();

      return snapshot.empty ? null : this.buildResult(snapshot.docs[0], 'url', 1.0, 'Exact URL match');
    } catch (error) {
      logger.warn('[DEDUP V4] Error checking URL duplicate:', error);
      return null;
    }
  }

  /**
   * Check for content hash duplicate
   */
  private async checkContentHashDuplicate(title: string, normalizedUrl: string): Promise<DeduplicationResult | null> {
    try {
      const contentHash = this.computeContentHash(title, normalizedUrl);
      const snapshot = await getDb().collection('newsArticles')
        .where('contentHash', '==', contentHash)
        .limit(1)
        .get();

      return snapshot.empty ? null : this.buildResult(snapshot.docs[0], 'content_hash', 0.95, 'Content hash match');
    } catch (error) {
      logger.warn('[DEDUP V4] Error checking content hash duplicate:', error);
      return null;
    }
  }

  /**
   * Build deduplication result from Firestore document
   */
  private buildResult(doc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>,
    matchType: DeduplicationResult['matchType'], confidence: number, reason: string): DeduplicationResult {
    const data = doc.data();
    return {
      isDuplicate: true,
      existingArticleId: doc.id,
      matchType,
      confidence,
      reason,
      matchedArticle: {
        id: doc.id,
        title: data.title,
        url: data.canonicalLink,
        publishedAt: data.publishedAt?.toDate?.() || new Date(),
      },
    };
  }

  /**
   * Check for semantic similarity using embeddings
   */
  private async checkSemanticDuplicate(embedding: number[]): Promise<DeduplicationResult | null> {
    try {
      const snapshot = await getDb().collection('newsArticles')
        .where('hasEmbedding', '==', true)
        .orderBy('publishedAt', 'desc')
        .limit(100)
        .get();

      let bestMatch: { doc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>; similarity: number } | null = null;

      for (const doc of snapshot.docs) {
        const storedEmbedding = doc.data().embedding as number[];
        if (!storedEmbedding) continue;

        const similarity = this.cosineSimilarity(embedding, storedEmbedding);
        if (similarity >= this.SEMANTIC_SIMILARITY_THRESHOLD && (!bestMatch || similarity > bestMatch.similarity)) {
          bestMatch = { doc, similarity };
        }
      }

      if (!bestMatch) return null;
      return this.buildResult(bestMatch.doc, 'semantic', bestMatch.similarity,
        `Semantic similarity: ${(bestMatch.similarity * 100).toFixed(1)}%`);
    } catch (error) {
      logger.warn('[DEDUP V4] Error checking semantic duplicate:', error);
      return null;
    }
  }

  /**
   * Check for fuzzy title match
   */
  private async checkFuzzyTitleDuplicate(title: string): Promise<DeduplicationResult | null> {
    try {
      const titleLength = title.length;
      const snapshot = await getDb().collection('newsArticles')
        .where('titleLength', '>=', titleLength * 0.8)
        .where('titleLength', '<=', titleLength * 1.2)
        .orderBy('titleLength')
        .limit(50)
        .get();

      let bestMatch: { doc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>; similarity: number } | null = null;

      for (const doc of snapshot.docs) {
        const similarity = this.stringSimilarity(title, doc.data().title);
        if (similarity >= this.TITLE_SIMILARITY_THRESHOLD && (!bestMatch || similarity > bestMatch.similarity)) {
          bestMatch = { doc, similarity };
        }
      }

      if (!bestMatch) return null;
      return this.buildResult(bestMatch.doc, 'fuzzy_title', bestMatch.similarity,
        `Fuzzy title match: ${(bestMatch.similarity * 100).toFixed(1)}%`);
    } catch (error) {
      logger.warn('[DEDUP V4] Error checking fuzzy title duplicate:', error);
      return null;
    }
  }

  /**
   * Check for domain + title combination
   */
  private async checkDomainTitleDuplicate(normalizedUrl: string, title: string): Promise<DeduplicationResult | null> {
    try {
      const domain = this.extractDomain(normalizedUrl);
      const titleHash = this.hashText(title);

      const snapshot = await getDb().collection('newsArticles')
        .where('domain', '==', domain)
        .where('titleHash', '==', titleHash)
        .limit(1)
        .get();

      return snapshot.empty ? null : this.buildResult(snapshot.docs[0], 'domain_title', 0.90, 'Domain + title match');
    } catch (error) {
      logger.warn('[DEDUP V4] Error checking domain+title duplicate:', error);
      return null;
    }
  }

  // ========== UTILITY METHODS ==========

  private normalizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      parsed.search = '';
      parsed.hash = '';
      return parsed.toString().toLowerCase();
    } catch {
      return url.toLowerCase();
    }
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname.toLowerCase();
    } catch {
      return '';
    }
  }

  private computeContentHash(title: string, url: string): string {
    return this.hashText(`${title}|${url}`);
  }

  private hashText(text: string): string {
    return crypto.createHash('md5').update(text).digest('hex');
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    let dotProduct = 0, magA = 0, magB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    magA = Math.sqrt(magA);
    magB = Math.sqrt(magB);
    return magA && magB ? dotProduct / (magA * magB) : 0;
  }

  private stringSimilarity(a: string, b: string): number {
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;
    if (longer.length === 0) return 1.0;
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(a: string, b: string): number {
    const prev: number[] = [];
    const curr: number[] = [];

    for (let i = 0; i <= b.length; i++) prev[i] = i;

    for (let i = 1; i <= a.length; i++) {
      curr[0] = i;
      for (let j = 1; j <= b.length; j++) {
        curr[j] = b[j - 1] === a[i - 1] ? prev[j - 1] : Math.min(prev[j - 1] + 1, prev[j] + 1, curr[j - 1] + 1);
      }
      [prev[0], curr[0]] = [curr[0], prev[0]];
      for (let j = 1; j <= b.length; j++) [prev[j], curr[j]] = [curr[j], prev[j]];
    }
    return prev[b.length];
  }
}

export const deduplicationV4 = new DeduplicationV4();

