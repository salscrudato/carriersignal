/**
 * 24-Hour Feed Viewer V2
 * Comprehensive feed viewer with deduplication, quality scoring, and analytics
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

export interface FeedArticleV2 {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: Date;
  ingestedAt: Date;
  summary?: string;
  score: number;
  tags: string[];
  category: string;
  qualityScore: number;
  isDuplicate: boolean;
  duplicateOf?: string;
  sentiment?: string;
  imageUrl?: string;
}

export interface Feed24HourResult {
  timeRange: {
    start: Date;
    end: Date;
    hoursBack: number;
  };
  totalArticles: number;
  uniqueArticles: number;
  duplicatesDetected: number;
  duplicateRate: number;
  articles: FeedArticleV2[];
  sourceBreakdown: Record<string, number>;
  categoryBreakdown: Record<string, number>;
  qualityMetrics: {
    averageScore: number;
    averageQualityScore: number;
    highQualityCount: number;
    mediumQualityCount: number;
    lowQualityCount: number;
  };
  sentimentBreakdown: Record<string, number>;
  topSources: Array<{source: string; count: number; avgScore: number}>;
  topCategories: Array<{category: string; count: number; avgScore: number}>;
}

class FeedViewerV2 {
  /**
   * Get 24-hour feed with comprehensive deduplication and analytics
   */
  async get24HourFeed(hoursBack: number = 24): Promise<Feed24HourResult> {
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);

      // Fetch all articles from time range
      const snapshot = await getDb().collection('newsArticles')
        .where('publishedAt', '>=', startTime)
        .where('publishedAt', '<=', now)
        .orderBy('publishedAt', 'desc')
        .limit(1000)
        .get();

      const articles: FeedArticleV2[] = [];
      const seenUrls = new Set<string>();
      const sourceBreakdown: Record<string, number> = {};
      const categoryBreakdown: Record<string, number> = {};
      const sentimentBreakdown: Record<string, number> = {};
      let duplicateCount = 0;
      let totalScore = 0;
      let totalQualityScore = 0;
      let highQualityCount = 0;
      let mediumQualityCount = 0;
      let lowQualityCount = 0;

      for (const doc of snapshot.docs) {
        const data = doc.data();
        const normalizedUrl = this.normalizeUrl(data.url || data.canonicalLink);

        // Check for duplicates
        const isDuplicate = seenUrls.has(normalizedUrl);
        if (isDuplicate) {
          duplicateCount++;
        } else {
          seenUrls.add(normalizedUrl);
        }

        const qualityScore = this.calculateQualityScore(data);
        const article: FeedArticleV2 = {
          id: doc.id,
          title: data.title,
          url: data.url || data.canonicalLink,
          source: data.source || data.sourceId || 'Unknown',
          publishedAt: data.publishedAt?.toDate() || new Date(),
          ingestedAt: data.createdAt?.toDate() || new Date(),
          summary: data.summary || data.excerpt,
          score: data.score || 0,
          tags: data.tags || [],
          category: data.category || 'general',
          qualityScore,
          isDuplicate,
          sentiment: data.sentiment,
          imageUrl: data.imageUrl,
        };

        articles.push(article);

        // Accumulate metrics
        totalScore += article.score;
        totalQualityScore += qualityScore;
        sourceBreakdown[article.source] = (sourceBreakdown[article.source] || 0) + 1;
        categoryBreakdown[article.category] = (categoryBreakdown[article.category] || 0) + 1;
        if (article.sentiment) {
          sentimentBreakdown[article.sentiment] = (sentimentBreakdown[article.sentiment] || 0) + 1;
        }

        // Quality score distribution
        if (qualityScore >= 0.8) highQualityCount++;
        else if (qualityScore >= 0.5) mediumQualityCount++;
        else lowQualityCount++;
      }

      const uniqueCount = seenUrls.size;
      const totalCount = snapshot.size;

      // Calculate top sources and categories
      const topSources = Object.entries(sourceBreakdown)
        .map(([source, count]) => ({
          source,
          count,
          avgScore: articles.filter(a => a.source === source).reduce((sum, a) => sum + a.score, 0) / count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const topCategories = Object.entries(categoryBreakdown)
        .map(([category, count]) => ({
          category,
          count,
          avgScore: articles.filter(a => a.category === category).reduce((sum, a) => sum + a.score, 0) / count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        timeRange: {
          start: startTime,
          end: now,
          hoursBack,
        },
        totalArticles: totalCount,
        uniqueArticles: uniqueCount,
        duplicatesDetected: duplicateCount,
        duplicateRate: totalCount > 0 ? duplicateCount / totalCount : 0,
        articles: articles.slice(0, 500), // Return top 500
        sourceBreakdown,
        categoryBreakdown,
        qualityMetrics: {
          averageScore: totalCount > 0 ? totalScore / totalCount : 0,
          averageQualityScore: totalCount > 0 ? totalQualityScore / totalCount : 0,
          highQualityCount,
          mediumQualityCount,
          lowQualityCount,
        },
        sentimentBreakdown,
        topSources,
        topCategories,
      };
    } catch (error) {
      logger.error('[FEED VIEWER V2] Error getting 24-hour feed:', error);
      throw error;
    }
  }

  /**
   * Get feed by source
   */
  async getFeedBySource(sourceId: string, hoursBack: number = 24): Promise<FeedArticleV2[]> {
    try {
      const startTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
      const snapshot = await getDb().collection('newsArticles')
        .where('sourceId', '==', sourceId)
        .where('publishedAt', '>=', startTime)
        .orderBy('publishedAt', 'desc')
        .limit(100)
        .get();

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          url: data.url || data.canonicalLink,
          source: data.source || sourceId,
          publishedAt: data.publishedAt?.toDate() || new Date(),
          ingestedAt: data.createdAt?.toDate() || new Date(),
          summary: data.summary || data.excerpt,
          score: data.score || 0,
          tags: data.tags || [],
          category: data.category || 'general',
          qualityScore: this.calculateQualityScore(data),
          isDuplicate: false,
          sentiment: data.sentiment,
          imageUrl: data.imageUrl,
        };
      });
    } catch (error) {
      logger.error('[FEED VIEWER V2] Error getting feed by source:', error);
      return [];
    }
  }

  /**
   * Calculate quality score for an article
   */
  private calculateQualityScore(article: Record<string, unknown>): number {
    let score = 0.5; // Base score

    // Has summary/excerpt
    if (article.summary || article.excerpt) score += 0.15;

    // Has tags
    const tags = article.tags as unknown[];
    if (tags && Array.isArray(tags) && tags.length > 0) score += 0.1;

    // Has image
    if (article.imageUrl) score += 0.1;

    // Has sentiment
    if (article.sentiment) score += 0.05;

    // High AI score
    const articleScore = article.score as number | undefined;
    if (articleScore && articleScore > 70) score += 0.1;

    // Recent
    const pubDate = article.publishedAt as { toDate?: () => Date } | undefined;
    const ageHours = (Date.now() - (pubDate?.toDate?.() || new Date()).getTime()) / (1000 * 60 * 60);
    if (ageHours < 6) score += 0.05;

    return Math.min(score, 1.0);
  }

  /**
   * Normalize URL for comparison
   */
  private normalizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      return `${parsed.protocol}//${parsed.hostname}${parsed.pathname}`.toLowerCase();
    } catch {
      return url.toLowerCase();
    }
  }
}

export const feedViewerV2 = new FeedViewerV2();

