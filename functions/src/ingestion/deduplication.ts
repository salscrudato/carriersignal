/**
 * Deduplication Service
 * Detects and handles duplicate articles using multiple strategies
 */

import * as crypto from 'crypto';
import { DuplicateCheckResult } from './types';

export class DeduplicationService {
  private readonly SIMILARITY_THRESHOLD = 0.85;
  private urlHashes: Map<string, string> = new Map();

  /**
   * Generate content hash for fast duplicate detection
   */
  generateContentHash(content: string): string {
    return crypto
      .createHash('sha256')
      .update(content.toLowerCase().trim())
      .digest('hex');
  }

  /**
   * Generate URL hash for quick lookups
   */
  generateUrlHash(url: string): string {
    return crypto
      .createHash('md5')
      .update(url.toLowerCase().trim())
      .digest('hex');
  }

  /**
   * Normalize URL for comparison
   */
  normalizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      // Remove tracking parameters
      const params = new URLSearchParams(parsed.search);
      params.delete('utm_source');
      params.delete('utm_medium');
      params.delete('utm_campaign');
      params.delete('utm_content');
      params.delete('utm_term');

      parsed.search = params.toString();
      return parsed.toString().toLowerCase();
    } catch {
      return url.toLowerCase();
    }
  }

  /**
   * Check if URL is duplicate
   */
  isUrlDuplicate(url: string, existingUrls: string[]): DuplicateCheckResult {
    const normalizedUrl = this.normalizeUrl(url);

    // Check exact match
    for (const existing of existingUrls) {
      const normalizedExisting = this.normalizeUrl(existing);
      if (normalizedUrl === normalizedExisting) {
        return {
          isDuplicate: true,
          similarity: 1.0,
          matchedUrl: existing,
          reason: 'Exact URL match',
        };
      }
    }

    return {
      isDuplicate: false,
      similarity: 0,
    };
  }

  /**
   * Calculate Levenshtein distance for string similarity
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = Array(len2 + 1)
      .fill(null)
      .map(() => Array(len1 + 1).fill(0));

    for (let i = 0; i <= len1; i++) matrix[0][i] = i;
    for (let j = 0; j <= len2; j++) matrix[j][0] = j;

    for (let j = 1; j <= len2; j++) {
      for (let i = 1; i <= len1; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    const distance = matrix[len2][len1];
    const maxLen = Math.max(len1, len2);
    return 1 - distance / maxLen;
  }

  /**
   * Check if titles are similar
   */
  isTitleDuplicate(title1: string, title2: string): DuplicateCheckResult {
    const normalized1 = title1.toLowerCase().trim();
    const normalized2 = title2.toLowerCase().trim();

    // Exact match
    if (normalized1 === normalized2) {
      return {
        isDuplicate: true,
        similarity: 1.0,
        reason: 'Exact title match',
      };
    }

    // Calculate similarity
    const similarity = this.levenshteinDistance(normalized1, normalized2);

    if (similarity >= this.SIMILARITY_THRESHOLD) {
      return {
        isDuplicate: true,
        similarity,
        reason: 'Similar title',
      };
    }

    return {
      isDuplicate: false,
      similarity,
    };
  }

  /**
   * Extract key phrases from content for semantic comparison
   */
  private extractKeyPhrases(content: string): Set<string> {
    // Extract 2-3 word phrases that are likely to be unique to the article
    const words = content.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    const phrases = new Set<string>();

    for (let i = 0; i < words.length - 1; i++) {
      phrases.add(`${words[i]} ${words[i + 1]}`);
      if (i < words.length - 2) {
        phrases.add(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
      }
    }

    return phrases;
  }

  /**
   * Calculate semantic similarity between two content pieces
   */
  private calculateSemanticSimilarity(content1: string, content2: string): number {
    const phrases1 = this.extractKeyPhrases(content1);
    const phrases2 = this.extractKeyPhrases(content2);

    if (phrases1.size === 0 || phrases2.size === 0) return 0;

    let matches = 0;
    for (const phrase of phrases1) {
      if (phrases2.has(phrase)) matches++;
    }

    const totalPhrases = Math.max(phrases1.size, phrases2.size);
    return matches / totalPhrases;
  }

  /**
   * Check if content is duplicate using multiple strategies
   */
  isContentDuplicate(
    url: string,
    title: string,
    content: string,
    existingArticles: Array<{ url: string; title: string; content?: string }>
  ): DuplicateCheckResult {
    // First check URL
    const urlCheck = this.isUrlDuplicate(url, existingArticles.map((a) => a.url));
    if (urlCheck.isDuplicate) {
      return urlCheck;
    }

    // Then check title similarity
    for (const existing of existingArticles) {
      const titleCheck = this.isTitleDuplicate(title, existing.title);
      if (titleCheck.isDuplicate) {
        return {
          ...titleCheck,
          matchedUrl: existing.url,
        };
      }
    }

    // Finally, check semantic similarity of content
    if (content && content.length > 100) {
      for (const existing of existingArticles) {
        if (existing.content && existing.content.length > 100) {
          const semanticSimilarity = this.calculateSemanticSimilarity(content, existing.content);
          if (semanticSimilarity >= 0.7) {
            return {
              isDuplicate: true,
              similarity: semanticSimilarity,
              matchedUrl: existing.url,
              reason: 'Semantic content similarity',
            };
          }
        }
      }
    }

    return {
      isDuplicate: false,
      similarity: 0,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.urlHashes.clear();
  }
}

export default new DeduplicationService();

