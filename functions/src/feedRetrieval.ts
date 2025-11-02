/**
 * 24-Hour Feed Retrieval Service
 * Retrieves articles from past 24 hours with deduplication and quality scoring
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

export interface FeedArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: Date;
  summary?: string;
  score: number;
  tags: string[];
  category: string;
  isDuplicate: boolean;
  duplicateOf?: string;
  qualityScore: number;
  ingestedAt: Date;
}

export interface FeedRetrievalResult {
  totalArticles: number;
  uniqueArticles: number;
  duplicatesDetected: number;
  duplicateRemovalRate: number;
  articles: FeedArticle[];
  timeRange: {start: Date; end: Date};
  sourceBreakdown: Record<string, number>;
  categoryBreakdown: Record<string, number>;
  averageScore: number;
  topTrendingTopics: string[];
}

class FeedRetrievalService {
  /**
   * Get all articles from past 24 hours with deduplication
   */
  async get24HourFeed(hoursBack: number = 24): Promise<FeedRetrievalResult> {
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);

      // Fetch all articles from past 24 hours
      const snapshot = await getDb().collection('newsArticles')
        .where('publishedAt', '>=', startTime)
        .where('publishedAt', '<=', now)
        .orderBy('publishedAt', 'desc')
        .get();

      const articles: FeedArticle[] = [];
      const seenUrls = new Set<string>();
      const sourceBreakdown: Record<string, number> = {};
      const categoryBreakdown: Record<string, number> = {};
      let totalScore = 0;
      let duplicateCount = 0;

      for (const doc of snapshot.docs) {
        const data = doc.data();
        const normalizedUrl = this.normalizeUrl(data.url);

        // Check for duplicates
        const isDuplicate = seenUrls.has(normalizedUrl);
        if (isDuplicate) {
          duplicateCount++;
        } else {
          seenUrls.add(normalizedUrl);
        }

        const article: FeedArticle = {
          id: doc.id,
          title: data.title,
          url: data.url,
          source: data.source || 'Unknown',
          publishedAt: data.publishedAt?.toDate() || new Date(),
          summary: data.summary,
          score: data.score || 0,
          tags: data.tags || [],
          category: data.category || 'general',
          isDuplicate,
          qualityScore: this.calculateQualityScore(data as FeedArticle),
          ingestedAt: data.createdAt?.toDate() || new Date(),
        };

        articles.push(article);
        totalScore += article.score;

        // Track breakdown
        sourceBreakdown[article.source] = (sourceBreakdown[article.source] || 0) + 1;
        categoryBreakdown[article.category] = (categoryBreakdown[article.category] || 0) + 1;
      }

      // Remove duplicates from results
      const uniqueArticles = articles.filter(a => !a.isDuplicate);
      const duplicateRemovalRate = articles.length > 0 ? (duplicateCount / articles.length) : 0;

      // Extract trending topics
      const topicFrequency: Record<string, number> = {};
      for (const article of uniqueArticles) {
        for (const tag of article.tags) {
          topicFrequency[tag] = (topicFrequency[tag] || 0) + 1;
        }
      }

      const topTrendingTopics = Object.entries(topicFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([topic]) => topic);

      return {
        totalArticles: articles.length,
        uniqueArticles: uniqueArticles.length,
        duplicatesDetected: duplicateCount,
        duplicateRemovalRate,
        articles: uniqueArticles.sort((a, b) => b.score - a.score),
        timeRange: {start: startTime, end: now},
        sourceBreakdown,
        categoryBreakdown,
        averageScore: uniqueArticles.length > 0 ? totalScore / uniqueArticles.length : 0,
        topTrendingTopics,
      };
    } catch (error) {
      logger.error('[FEED RETRIEVAL] Error getting 24-hour feed:', error);
      throw error;
    }
  }

  /**
   * Get articles by category from past 24 hours
   */
  async get24HourFeedByCategory(category: string, hoursBack: number = 24): Promise<FeedArticle[]> {
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);

      const snapshot = await getDb().collection('newsArticles')
        .where('category', '==', category)
        .where('publishedAt', '>=', startTime)
        .where('publishedAt', '<=', now)
        .orderBy('score', 'desc')
        .limit(100)
        .get();

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          url: data.url,
          source: data.source || 'Unknown',
          publishedAt: data.publishedAt?.toDate() || new Date(),
          summary: data.summary,
          score: data.score || 0,
          tags: data.tags || [],
          category: data.category || 'general',
          isDuplicate: false,
          qualityScore: this.calculateQualityScore(data as FeedArticle),
          ingestedAt: data.createdAt?.toDate() || new Date(),
        };
      });
    } catch (error) {
      logger.error('[FEED RETRIEVAL] Error getting category feed:', error);
      return [];
    }
  }

  /**
   * Get trending articles from past 24 hours
   */
  async getTrendingArticles(limit: number = 20, hoursBack: number = 24): Promise<FeedArticle[]> {
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);

      const snapshot = await getDb().collection('newsArticles')
        .where('publishedAt', '>=', startTime)
        .where('publishedAt', '<=', now)
        .orderBy('score', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          url: data.url,
          source: data.source || 'Unknown',
          publishedAt: data.publishedAt?.toDate() || new Date(),
          summary: data.summary,
          score: data.score || 0,
          tags: data.tags || [],
          category: data.category || 'general',
          isDuplicate: false,
          qualityScore: this.calculateQualityScore(data as FeedArticle),
          ingestedAt: data.createdAt?.toDate() || new Date(),
        };
      });
    } catch (error) {
      logger.error('[FEED RETRIEVAL] Error getting trending articles:', error);
      return [];
    }
  }

  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      urlObj.hostname = urlObj.hostname.replace(/^www\./, '');
      urlObj.pathname = urlObj.pathname.replace(/\/$/, '');
      return urlObj.toString().toLowerCase();
    } catch {
      return url.toLowerCase();
    }
  }

  private calculateQualityScore(article: FeedArticle): number {
    let score = 50; // Base score

    // Add points for having summary
    if (article.summary) score += 15;

    // Add points for tags
    if (article.tags && article.tags.length > 0) score += 10;

    // Add points for high AI score
    if (article.score > 70) score += 15;
    else if (article.score > 50) score += 10;

    // Add points for recent publication
    const publishedTime = article.publishedAt instanceof Date ? article.publishedAt.getTime() : (article.publishedAt as {toDate: () => Date})?.toDate?.()?.getTime?.() || 0;
    const ageHours = (Date.now() - publishedTime) / (1000 * 60 * 60);
    if (ageHours < 1) score += 10;
    else if (ageHours < 6) score += 5;

    return Math.min(100, score);
  }
}

export const feedRetrieval = new FeedRetrievalService();

