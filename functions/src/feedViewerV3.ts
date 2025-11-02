/**
 * Feed Viewer V3
 * Comprehensive 24-hour feed with duplicate detection, quality metrics, and trending analysis
 * 
 * Features:
 * - Real-time duplicate detection across all articles
 * - Quality scoring and filtering
 * - Trending article detection
 * - Feed source attribution
 * - Engagement metrics
 */

import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

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
  imageUrl?: string;
  
  // Scoring
  aiScore: number;
  qualityScore: number;
  engagementScore: number;
  
  // Metadata
  tags?: {
    lob?: string[];
    trends?: string[];
    regulatory?: boolean;
    catastrophe?: boolean;
  };
  
  // Duplicate info
  isDuplicate: boolean;
  duplicateOf?: string;
  duplicateCount: number;
  
  // Trending
  isTrending: boolean;
  trendingScore?: number;
}

export interface Feed24HourResponse {
  success: boolean;
  timestamp: Date;
  timeRange: {
    start: Date;
    end: Date;
    hours: number;
  };
  
  // Article counts
  totalArticles: number;
  uniqueArticles: number;
  duplicateArticles: number;
  duplicateRate: number;
  
  // Quality metrics
  averageQualityScore: number;
  averageAIScore: number;
  articlesWithAIScore: number;
  
  // Trending
  trendingArticles: FeedArticle[];
  trendingTopics: Array<{ topic: string; count: number; score: number }>;
  
  // Feed breakdown
  bySource: Record<string, { count: number; uniqueCount: number; duplicateRate: number }>;
  
  // All articles
  articles: FeedArticle[];
  
  // Recommendations
  recommendations: string[];
}

export class FeedViewerV3 {
  /**
   * Get comprehensive 24-hour feed with duplicate detection
   */
  async get24HourFeed(options: {
    hours?: number;
    limit?: number;
    includeQualityFilter?: boolean;
    minQualityScore?: number;
  } = {}): Promise<Feed24HourResponse> {
    const hours = options.hours || 24;
    const limit = options.limit || 500;
    const includeQualityFilter = options.includeQualityFilter !== false;
    const minQualityScore = options.minQualityScore || 0;

    const now = new Date();
    const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);

    try {
      // Fetch all articles from past N hours
      const snapshot = await getDb().collection('newsArticles')
        .where('publishedAt', '>=', startTime)
        .where('publishedAt', '<=', now)
        .orderBy('publishedAt', 'desc')
        .limit(limit)
        .get();

      const articles = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || '',
          canonicalLink: data.canonicalLink || '',
          source: data.source || '',
          publishedAt: data.publishedAt?.toDate?.() || new Date(),
          summary: data.summary,
          imageUrl: data.imageUrl,
          aiScore: data.aiScore || 0,
          qualityScore: data.qualityScore || 0,
          engagementScore: data.engagementScore || 0,
          tags: data.tags,
          contentHash: data.contentHash || '',
        };
      });

      // Detect duplicates
      const duplicateMap = await this.detectDuplicates(articles);

      // Build feed articles with duplicate info
      const feedArticles = articles.map((article) => ({
        id: article.id,
        title: article.title,
        url: article.canonicalLink,
        source: article.source,
        publishedAt: article.publishedAt,
        summary: article.summary,
        imageUrl: article.imageUrl,
        aiScore: article.aiScore || 0,
        qualityScore: article.qualityScore || 0,
        engagementScore: article.engagementScore || 0,
        tags: article.tags,
        isDuplicate: duplicateMap.isDuplicate[article.id] || false,
        duplicateOf: duplicateMap.duplicateOf[article.id],
        duplicateCount: duplicateMap.duplicateCount[article.id] || 0,
        isTrending: false,
        trendingScore: 0,
      } as FeedArticle));

      // Filter by quality if requested
      let filteredArticles = feedArticles;
      if (includeQualityFilter && minQualityScore > 0) {
        filteredArticles = feedArticles.filter(a => a.qualityScore >= minQualityScore);
      }

      // Calculate metrics in single pass
      let uniqueArticles = 0, duplicateArticles = 0, articlesWithAIScore = 0;
      let totalQualityScore = 0, totalAIScore = 0;

      for (const article of feedArticles) {
        if (article.isDuplicate) duplicateArticles++;
        else uniqueArticles++;
        if (article.aiScore > 0) {
          articlesWithAIScore++;
          totalAIScore += article.aiScore;
        }
        totalQualityScore += article.qualityScore;
      }

      const duplicateRate = feedArticles.length > 0 ? duplicateArticles / feedArticles.length : 0;
      const averageQualityScore = feedArticles.length > 0 ? totalQualityScore / feedArticles.length : 0;
      const averageAIScore = articlesWithAIScore > 0 ? totalAIScore / articlesWithAIScore : 0;

      // Detect trending articles
      const trendingArticles = this.detectTrendingArticles(filteredArticles);
      const trendingTopics = this.extractTrendingTopics(filteredArticles);

      // Breakdown by source
      const bySource = this.breakdownBySource(feedArticles);

      // Generate recommendations
      const recommendations = this.generateRecommendations({
        duplicateRate,
        averageQualityScore,
        articlesWithAIScore,
        totalArticles: feedArticles.length,
      });

      return {
        success: true,
        timestamp: now,
        timeRange: {
          start: startTime,
          end: now,
          hours,
        },
        totalArticles: feedArticles.length,
        uniqueArticles,
        duplicateArticles,
        duplicateRate,
        averageQualityScore: Math.round(averageQualityScore * 10) / 10,
        averageAIScore: Math.round(averageAIScore * 10) / 10,
        articlesWithAIScore,
        trendingArticles,
        trendingTopics,
        bySource,
        articles: filteredArticles,
        recommendations,
      };
    } catch (error) {
      logger.error('[FEED VIEWER V3] Error getting 24-hour feed:', error);
      throw error;
    }
  }

  /**
   * Detect duplicates using URL and content hash
   */
  private async detectDuplicates(articles: Array<{
    id: string;
    canonicalLink: string;
    contentHash: string;
  }>): Promise<{
    isDuplicate: Record<string, boolean>;
    duplicateOf: Record<string, string>;
    duplicateCount: Record<string, number>;
  }> {
    const isDuplicate: Record<string, boolean> = {};
    const duplicateOf: Record<string, string> = {};
    const duplicateCount: Record<string, number> = {};
    const urlMap = new Map<string, string>();
    const hashMap = new Map<string, string>();

    for (const article of articles) {
      const url = article.canonicalLink.toLowerCase();
      const hash = article.contentHash;
      let isDup = false;

      // Check URL duplicates
      if (url && urlMap.has(url)) {
        const originalId = urlMap.get(url)!;
        duplicateOf[article.id] = originalId;
        duplicateCount[originalId] = (duplicateCount[originalId] || 0) + 1;
        isDup = true;
      } else if (url) {
        urlMap.set(url, article.id);
      }

      // Check content hash duplicates only if not already marked as duplicate
      if (!isDup && hash && hashMap.has(hash)) {
        const originalId = hashMap.get(hash)!;
        duplicateOf[article.id] = originalId;
        duplicateCount[originalId] = (duplicateCount[originalId] || 0) + 1;
        isDup = true;
      } else if (!isDup && hash) {
        hashMap.set(hash, article.id);
      }

      isDuplicate[article.id] = isDup;
    }

    return { isDuplicate, duplicateOf, duplicateCount };
  }

  /**
   * Detect trending articles based on engagement and recency
   */
  private detectTrendingArticles(articles: FeedArticle[]): FeedArticle[] {
    const now = Date.now();
    const scored: Array<FeedArticle & { trendingScore: number }> = [];

    for (const article of articles) {
      const ageHours = (now - article.publishedAt.getTime()) / (1000 * 60 * 60);
      const trendingScore = Math.max(0, 1 - ageHours / 24) * 0.4 +
        ((article.engagementScore || 0) / 100) * 0.3 +
        ((article.aiScore || 0) / 100) * 0.3;

      if (trendingScore > 0.6) {
        scored.push({ ...article, trendingScore, isTrending: true });
      }
    }

    return scored.sort((a, b) => b.trendingScore - a.trendingScore).slice(0, 10);
  }

  /**
   * Extract trending topics from articles
   */
  private extractTrendingTopics(articles: FeedArticle[]): Array<{ topic: string; count: number; score: number }> {
    const topicMap = new Map<string, { count: number; totalScore: number }>();

    for (const article of articles) {
      const topics = [
        ...(article.tags?.lob || []),
        ...(article.tags?.trends || []),
      ];

      for (const topic of topics) {
        const current = topicMap.get(topic) || { count: 0, totalScore: 0 };
        current.count++;
        current.totalScore += article.aiScore || 0;
        topicMap.set(topic, current);
      }
    }

    return Array.from(topicMap.entries())
      .map(([topic, data]) => ({
        topic,
        count: data.count,
        score: Math.round((data.totalScore / data.count) * 10) / 10,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }

  /**
   * Breakdown articles by source
   */
  private breakdownBySource(
    articles: FeedArticle[]
  ): Record<string, { count: number; uniqueCount: number; duplicateRate: number }> {
    const breakdown: Record<string, { count: number; uniqueCount: number; duplicateRate: number }> = {};

    for (const article of articles) {
      if (!breakdown[article.source]) {
        breakdown[article.source] = { count: 0, uniqueCount: 0, duplicateRate: 0 };
      }
      breakdown[article.source].count++;
      if (!article.isDuplicate) {
        breakdown[article.source].uniqueCount++;
      }
    }

    for (const source in breakdown) {
      const data = breakdown[source];
      data.duplicateRate = data.count > 0 ? 1 - (data.uniqueCount / data.count) : 0;
    }

    return breakdown;
  }

  /**
   * Generate recommendations based on feed metrics
   */
  private generateRecommendations(metrics: {
    duplicateRate: number;
    averageQualityScore: number;
    articlesWithAIScore: number;
    totalArticles: number;
  }): string[] {
    const recommendations: string[] = [];

    if (metrics.duplicateRate > 0.10) {
      recommendations.push(`⚠️ High duplicate rate (${(metrics.duplicateRate * 100).toFixed(1)}%). Consider improving deduplication.`);
    }

    if (metrics.averageQualityScore < 70) {
      recommendations.push(`📊 Average quality score is low (${metrics.averageQualityScore.toFixed(1)}). Review article filtering.`);
    }

    if (metrics.articlesWithAIScore < metrics.totalArticles * 0.8) {
      recommendations.push(`🤖 Only ${((metrics.articlesWithAIScore / metrics.totalArticles) * 100).toFixed(1)}% of articles have AI scores. Ensure all articles are scored.`);
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Feed quality is excellent. All metrics within healthy ranges.');
    }

    return recommendations;
  }
}

export const feedViewerV3 = new FeedViewerV3();

