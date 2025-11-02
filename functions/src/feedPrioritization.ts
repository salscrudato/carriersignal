/**
 * Smart Feed Prioritization System
 * ML-based feed source prioritization and dynamic weight adjustment
 */

import {getFirestore, Firestore} from "firebase-admin/firestore";
import {logger} from "firebase-functions";
import {createHash} from "crypto";

let db: Firestore | null = null;

function getDb(): Firestore {
  if (!db) {
    db = getFirestore();
  }
  return db;
}

export interface FeedMetrics {
  feedUrl: string;
  feedName: string;
  successRate: number;
  avgLatency: number;
  articlesPerCycle: number;
  qualityScore: number;
  relevanceScore: number;
  priority: number;
  weight: number;
  lastUpdated: Date;
}

export interface FeedPriority {
  feedUrl: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  weight: number;
  reason: string;
}

export class FeedPrioritizationService {
  private readonly QUALITY_WEIGHT = 0.3;
  private readonly RELEVANCE_WEIGHT = 0.3;
  private readonly RELIABILITY_WEIGHT = 0.2;
  private readonly LATENCY_WEIGHT = 0.2;

  /**
   * Calculate feed priority based on multiple factors
   */
  async calculateFeedPriority(feedUrl: string): Promise<FeedPriority> {
    try {
      const metrics = await this.getFeedMetrics(feedUrl);
      if (!metrics) {
        return {
          feedUrl,
          priority: 'medium',
          weight: 1.0,
          reason: 'No historical data',
        };
      }

      // Calculate composite score
      const compositeScore = (
        metrics.qualityScore * this.QUALITY_WEIGHT +
        metrics.relevanceScore * this.RELEVANCE_WEIGHT +
        metrics.successRate * 100 * this.RELIABILITY_WEIGHT +
        (100 - Math.min(100, metrics.avgLatency / 100)) * this.LATENCY_WEIGHT
      ) / 100;

      // Determine priority level
      let priority: 'critical' | 'high' | 'medium' | 'low';
      let weight: number;
      let reason: string;

      if (compositeScore >= 85) {
        priority = 'critical';
        weight = 2.0;
        reason = 'High quality, reliable, relevant source';
      } else if (compositeScore >= 70) {
        priority = 'high';
        weight = 1.5;
        reason = 'Good quality and reliability';
      } else if (compositeScore >= 50) {
        priority = 'medium';
        weight = 1.0;
        reason = 'Moderate quality and reliability';
      } else {
        priority = 'low';
        weight = 0.5;
        reason = 'Low quality or reliability';
      }

      // Persist priority
      await this.saveFeedPriority(feedUrl, {priority, weight, compositeScore});

      return {feedUrl, priority, weight, reason};
    } catch (error) {
      logger.error('[PRIORITIZATION] Error calculating feed priority:', error);
      return {
        feedUrl,
        priority: 'medium',
        weight: 1.0,
        reason: 'Error calculating priority',
      };
    }
  }

  /**
   * Get feed metrics
   */
  private async getFeedMetrics(feedUrl: string): Promise<FeedMetrics | null> {
    try {
      const doc = await getDb().collection('feed_metrics').doc(this.hashUrl(feedUrl)).get();
      if (!doc.exists) return null;

      const data = doc.data();
      if (!data) return null;

      return {
        feedUrl,
        feedName: data.feedName || '',
        successRate: data.successRate || 0,
        avgLatency: data.avgLatency || 0,
        articlesPerCycle: data.articlesPerCycle || 0,
        qualityScore: data.qualityScore || 50,
        relevanceScore: data.relevanceScore || 50,
        priority: data.priority || 0,
        weight: data.weight || 1.0,
        lastUpdated: data.lastUpdated?.toDate() || new Date(),
      };
    } catch (error) {
      logger.warn('[PRIORITIZATION] Error getting feed metrics:', error);
      return null;
    }
  }

  /**
   * Update feed metrics after cycle
   */
  async updateFeedMetrics(feedUrl: string, cycleMetrics: {
    success: boolean;
    latency: number;
    articlesProcessed: number;
    qualityScore: number;
  }): Promise<void> {
    try {
      const feedId = this.hashUrl(feedUrl);
      const doc = await getDb().collection('feed_metrics').doc(feedId).get();
      const existing = doc.data() || {};

      // Calculate rolling averages
      const successCount = (existing.successCount || 0) + (cycleMetrics.success ? 1 : 0);
      const totalCycles = (existing.totalCycles || 0) + 1;
      const successRate = successCount / totalCycles;

      const avgLatency = (
        (existing.avgLatency || 0) * (totalCycles - 1) + cycleMetrics.latency
      ) / totalCycles;

      const avgArticles = (
        (existing.articlesPerCycle || 0) * (totalCycles - 1) + cycleMetrics.articlesProcessed
      ) / totalCycles;

      const qualityScore = (
        (existing.qualityScore || 50) * 0.7 + cycleMetrics.qualityScore * 0.3
      );

      await getDb().collection('feed_metrics').doc(feedId).set({
        feedUrl,
        feedName: existing.feedName || '',
        successRate,
        avgLatency,
        articlesPerCycle: avgArticles,
        qualityScore,
        relevanceScore: existing.relevanceScore || 50,
        successCount,
        totalCycles,
        lastUpdated: new Date(),
      });

      logger.info(`[PRIORITIZATION] Updated metrics for ${feedUrl}`, {
        successRate: (successRate * 100).toFixed(1),
        avgLatency: avgLatency.toFixed(0),
      });
    } catch (error) {
      logger.error('[PRIORITIZATION] Error updating feed metrics:', error);
    }
  }

  /**
   * Get all feed priorities
   */
  async getAllFeedPriorities(): Promise<FeedPriority[]> {
    try {
      const snapshot = await getDb().collection('feed_priorities').get();
      return snapshot.docs.map(doc => doc.data() as FeedPriority);
    } catch (error) {
      logger.warn('[PRIORITIZATION] Error getting all feed priorities:', error);
      return [];
    }
  }

  /**
   * Get feeds by priority level
   */
  async getFeedsByPriority(priority: 'critical' | 'high' | 'medium' | 'low'): Promise<string[]> {
    try {
      const snapshot = await getDb().collection('feed_priorities')
        .where('priority', '==', priority)
        .get();

      return snapshot.docs.map(doc => doc.data().feedUrl);
    } catch (error) {
      logger.warn('[PRIORITIZATION] Error getting feeds by priority:', error);
      return [];
    }
  }

  /**
   * Save feed priority
   */
  private async saveFeedPriority(feedUrl: string, data: {
    priority: string;
    weight: number;
    compositeScore: number;
  }): Promise<void> {
    try {
      await getDb().collection('feed_priorities').doc(this.hashUrl(feedUrl)).set({
        feedUrl,
        ...data,
        lastUpdated: new Date(),
      });
    } catch (error) {
      logger.warn('[PRIORITIZATION] Error saving feed priority:', error);
    }
  }

  /**
   * Hash URL for consistent document IDs
   */
  private hashUrl(url: string): string {
    return createHash('md5').update(url).digest('hex');
  }

  /**
   * Adjust feed weights dynamically
   */
  async adjustFeedWeights(): Promise<void> {
    try {
      const priorities = await this.getAllFeedPriorities();

      for (const priority of priorities) {
        // Recalculate based on latest metrics
        const newPriority = await this.calculateFeedPriority(priority.feedUrl);

        if (newPriority.weight !== priority.weight) {
          logger.info(`[PRIORITIZATION] Adjusted weight for ${priority.feedUrl}: ${priority.weight} → ${newPriority.weight}`);
        }
      }
    } catch (error) {
      logger.error('[PRIORITIZATION] Error adjusting feed weights:', error);
    }
  }
}

export const feedPrioritization = new FeedPrioritizationService();

