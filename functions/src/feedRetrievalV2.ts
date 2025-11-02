/**
 * Enhanced Feed Retrieval Service V2
 * 24-hour feed viewer with deduplication and quality metrics
 */

import { getFirestore, Firestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";

let db: Firestore | null = null;

function getDb(): Firestore {
  if (!db) {
    db = getFirestore();
  }
  return db;
}

export interface FeedArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  category: string;
  publishedAt: Date;
  score: number;
  tags: string[];
  summary?: string;
  imageUrl?: string;
  sentiment?: string;
}

export interface FeedRetrievalResult {
  totalArticles: number;
  uniqueArticles: number;
  duplicatesDetected: number;
  duplicateRemovalRate: number;
  averageScore: number;
  timeRange: {
    start: Date;
    end: Date;
  };
  sourceBreakdown: Record<string, number>;
  categoryBreakdown: Record<string, number>;
  topTrendingTopics: Array<{ topic: string; count: number; score: number }>;
  articles: FeedArticle[];
}

class FeedRetrievalV2 {
  /**
   * Get 24-hour feed with deduplication
   */
  async get24HourFeed(hoursBack: number = 24): Promise<FeedRetrievalResult> {
    try {
      const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
      const now = new Date();

      // Fetch articles from past N hours
      const snapshot = await getDb().collection('newsArticles')
        .where('publishedAt', '>=', cutoffTime)
        .where('publishedAt', '<=', now)
        .orderBy('publishedAt', 'desc')
        .limit(500)
        .get();

      // Deduplicate by URL
      const seenUrls = new Set<string>();
      const uniqueArticles: FeedArticle[] = [];
      let duplicatesDetected = 0;

      for (const doc of snapshot.docs) {
        const data = doc.data();
        const url = this.normalizeUrl(data.url);

        if (seenUrls.has(url)) {
          duplicatesDetected++;
          continue;
        }

        seenUrls.add(url);
        uniqueArticles.push({
          id: doc.id,
          title: data.title,
          url: data.url,
          source: data.source || 'Unknown',
          category: data.category || 'general',
          publishedAt: data.publishedAt?.toDate() || new Date(),
          score: data.score || 0,
          tags: data.tags || [],
          summary: data.summary,
          imageUrl: data.imageUrl,
          sentiment: data.sentiment,
        });
      }

      // Calculate metrics
      const averageScore = uniqueArticles.length > 0
        ? uniqueArticles.reduce((sum, a) => sum + a.score, 0) / uniqueArticles.length
        : 0;

      const sourceBreakdown = this.groupBy(uniqueArticles, 'source');
      const categoryBreakdown = this.groupBy(uniqueArticles, 'category');
      const topTrendingTopics = this.extractTrendingTopics(uniqueArticles);

      return {
        totalArticles: snapshot.size,
        uniqueArticles: uniqueArticles.length,
        duplicatesDetected,
        duplicateRemovalRate: snapshot.size > 0 ? duplicatesDetected / snapshot.size : 0,
        averageScore,
        timeRange: {
          start: cutoffTime,
          end: now,
        },
        sourceBreakdown,
        categoryBreakdown,
        topTrendingTopics,
        articles: uniqueArticles,
      };
    } catch (error) {
      logger.error('[FEED RETRIEVAL V2] Error getting 24-hour feed:', error);
      throw error;
    }
  }

  /**
   * Get trending articles
   */
  async getTrendingArticles(limit: number = 20, hoursBack: number = 24): Promise<FeedArticle[]> {
    try {
      const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

      const snapshot = await getDb().collection('newsArticles')
        .where('publishedAt', '>=', cutoffTime)
        .orderBy('score', 'desc')
        .orderBy('publishedAt', 'desc')
        .limit(limit * 2) // Fetch extra to account for duplicates
        .get();

      const seenUrls = new Set<string>();
      const articles: FeedArticle[] = [];

      for (const doc of snapshot.docs) {
        if (articles.length >= limit) break;

        const data = doc.data();
        const url = this.normalizeUrl(data.url);

        if (seenUrls.has(url)) continue;

        seenUrls.add(url);
        articles.push({
          id: doc.id,
          title: data.title,
          url: data.url,
          source: data.source || 'Unknown',
          category: data.category || 'general',
          publishedAt: data.publishedAt?.toDate() || new Date(),
          score: data.score || 0,
          tags: data.tags || [],
          summary: data.summary,
          imageUrl: data.imageUrl,
          sentiment: data.sentiment,
        });
      }

      return articles;
    } catch (error) {
      logger.error('[FEED RETRIEVAL V2] Error getting trending articles:', error);
      throw error;
    }
  }

  /**
   * Normalize URL for deduplication
   */
  private normalizeUrl(url: string): string {
    return url
      .toLowerCase()
      .replace(/\?utm_.*$/i, '')
      .replace(/\?fbclid=.*$/i, '')
      .replace(/\/amp\//i, '/')
      .replace(/www\./i, '')
      .trim();
  }

  /**
   * Group articles by field
   */
  private groupBy(articles: FeedArticle[], field: keyof FeedArticle): Record<string, number> {
    const groups: Record<string, number> = {};

    for (const article of articles) {
      const key = String(article[field]);
      groups[key] = (groups[key] || 0) + 1;
    }

    return groups;
  }

  /**
   * Extract trending topics from articles
   */
  private extractTrendingTopics(articles: FeedArticle[]): Array<{ topic: string; count: number; score: number }> {
    const topicMap = new Map<string, { count: number; totalScore: number }>();

    for (const article of articles) {
      for (const tag of article.tags) {
        const existing = topicMap.get(tag) || { count: 0, totalScore: 0 };
        existing.count++;
        existing.totalScore += article.score;
        topicMap.set(tag, existing);
      }
    }

    return Array.from(topicMap.entries())
      .map(([topic, data]) => ({
        topic,
        count: data.count,
        score: data.totalScore / data.count,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }
}

export const feedRetrievalV2 = new FeedRetrievalV2();

