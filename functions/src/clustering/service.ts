/**
 * Clustering Service
 * Groups similar articles into events using similarity metrics
 */

import { db } from '../ingestion/firebase';
import { Event, SimilarityScore, ClusteringMetrics } from './types';

export class ClusteringService {
  private readonly SIMILARITY_THRESHOLD = 0.75;
  private readonly TITLE_WEIGHT = 0.4;
  private readonly CONTENT_WEIGHT = 0.6;
  private readonly TAG_WEIGHT = 0.3; // Weight for tag-based similarity
  private readonly TEMPORAL_WINDOW_HOURS = 24; // Cluster articles within 24 hours

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
   * Calculate tag-based similarity (P&C-specific)
   */
  private calculateTagSimilarity(
    tags1: Record<string, string[]> | undefined,
    tags2: Record<string, string[]> | undefined
  ): number {
    if (!tags1 || !tags2) return 0;

    let matchCount = 0;
    let totalTags = 0;

    // Check LOB matches
    const lob1 = tags1.lob || [];
    const lob2 = tags2.lob || [];
    totalTags += Math.max(lob1.length, lob2.length);
    matchCount += lob1.filter(l => lob2.includes(l)).length;

    // Check peril matches
    const perils1 = tags1.perils || [];
    const perils2 = tags2.perils || [];
    totalTags += Math.max(perils1.length, perils2.length);
    matchCount += perils1.filter(p => perils2.includes(p)).length;

    // Check region matches
    const regions1 = tags1.regions || [];
    const regions2 = tags2.regions || [];
    totalTags += Math.max(regions1.length, regions2.length);
    matchCount += regions1.filter(r => regions2.includes(r)).length;

    return totalTags > 0 ? matchCount / totalTags : 0;
  }

  /**
   * Calculate similarity between two articles
   */
  async calculateSimilarity(
    article1: Record<string, unknown>,
    article2: Record<string, unknown>
  ): Promise<SimilarityScore> {
    const title1 = (article1.title as string) || '';
    const title2 = (article2.title as string) || '';
    const content1 = ((article1.text as string) || (article1.html as string) || '').substring(0, 500);
    const content2 = ((article2.text as string) || (article2.html as string) || '').substring(0, 500);

    const titleSimilarity = this.levenshteinDistance(title1.toLowerCase(), title2.toLowerCase());
    const contentSimilarity = this.levenshteinDistance(content1.toLowerCase(), content2.toLowerCase());
    const tagSimilarity = this.calculateTagSimilarity(
      article1.tags as Record<string, string[]> | undefined,
      article2.tags as Record<string, string[]> | undefined
    );

    // Weighted combination: title 40%, content 40%, tags 20%
    const overallSimilarity =
      (this.TITLE_WEIGHT * titleSimilarity) +
      (this.CONTENT_WEIGHT * contentSimilarity) +
      (this.TAG_WEIGHT * tagSimilarity);

    return {
      articleId1: article1.id as string,
      articleId2: article2.id as string,
      titleSimilarity,
      contentSimilarity,
      overallSimilarity,
      shouldCluster: overallSimilarity >= this.SIMILARITY_THRESHOLD,
    };
  }

  /**
   * Check if two articles are within temporal window
   */
  private isWithinTemporalWindow(date1: string, date2: string): boolean {
    const time1 = new Date(date1).getTime();
    const time2 = new Date(date2).getTime();
    const diffHours = Math.abs(time1 - time2) / (1000 * 60 * 60);
    return diffHours <= this.TEMPORAL_WINDOW_HOURS;
  }

  /**
   * Cluster unprocessed articles into events
   */
  async clusterArticles(): Promise<ClusteringMetrics> {
    const startTime = Date.now();
    let totalArticles = 0;
    let totalEvents = 0;
    let totalClustered = 0;

    try {
      // Get unprocessed articles from last 48 hours
      const cutoffTime = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const unprocessedSnapshot = await db
        .collection('articles')
        .where('processed', '==', false)
        .where('publishedAt', '>=', cutoffTime)
        .orderBy('publishedAt', 'desc')
        .limit(200)
        .get();

      totalArticles = unprocessedSnapshot.size;

      if (totalArticles === 0) {
        return {
          totalArticles: 0,
          totalEvents: 0,
          averageClusterSize: 0,
          processingTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        };
      }

      const articles = unprocessedSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Cluster articles
      const processedArticleIds = new Set<string>();

      for (let i = 0; i < articles.length; i++) {
        if (processedArticleIds.has(articles[i].id)) continue;

        const cluster: string[] = [articles[i].id];
        processedArticleIds.add(articles[i].id);

        // Find similar articles within temporal window
        for (let j = i + 1; j < articles.length; j++) {
          if (processedArticleIds.has(articles[j].id)) continue;

          // Check temporal proximity first (faster check)
          const publishedAt1 = ((articles[i] as Record<string, unknown>).publishedAt as string) || '';
          const publishedAt2 = ((articles[j] as Record<string, unknown>).publishedAt as string) || '';
          if (!this.isWithinTemporalWindow(publishedAt1, publishedAt2)) {
            continue;
          }

          const similarity = await this.calculateSimilarity(articles[i], articles[j]);
          if (similarity.shouldCluster) {
            cluster.push(articles[j].id);
            processedArticleIds.add(articles[j].id);
          }
        }

        // Create or update event
        if (cluster.length > 0) {
          await this.createOrUpdateEvent(articles[i], cluster);
          totalEvents++;
          totalClustered += cluster.length;
        }
      }

      return {
        totalArticles,
        totalEvents,
        averageClusterSize: totalClustered > 0 ? totalClustered / totalEvents : 0,
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Clustering error:', error);
      throw error;
    }
  }

  /**
   * Create or update event
   */
  private async createOrUpdateEvent(
    canonicalArticle: Record<string, unknown>,
    articleIds: string[]
  ): Promise<void> {
    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const event: Event = {
      id: eventId,
      canonicalArticleId: canonicalArticle.id as string,
      articleIds,
      title: (canonicalArticle.title as string) || '',
      description: (canonicalArticle.description as string) || '',
      publishedAt: (canonicalArticle.publishedAt as string) || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      materialityScore: 50,
      severityScore: 50,
      impactScore: 50,
      lob: (canonicalArticle.lob as string[]) || [],
      perils: (canonicalArticle.perils as string[]) || [],
      regions: (canonicalArticle.regions as string[]) || [],
      companies: (canonicalArticle.companies as string[]) || [],
      eventType: 'other',
      riskPulse: 'MEDIUM',
      sentiment: 'NEUTRAL',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      articleCount: articleIds.length,
      sourceCount: 1,
      regulatoryFlags: [],
      trendingScore: 0,
      isHotTopic: false,
    };

    await db.collection('events').doc(eventId).set(event);

    // Mark articles as processed
    for (const articleId of articleIds) {
      await db.collection('articles').doc(articleId).update({
        processed: true,
        eventId,
      });
    }
  }
}

export default new ClusteringService();

