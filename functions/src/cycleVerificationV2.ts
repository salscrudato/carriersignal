/**
 * Enhanced 12-Hour Cycle Verification & Monitoring
 * Comprehensive dashboard for verifying cycle execution, timing, and health
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

export interface CycleExecutionRecord {
  functionName: 'refreshFeeds' | 'comprehensiveIngest';
  cycleId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'running' | 'completed' | 'failed';
  articlesProcessed: number;
  articlesSkipped: number;
  duplicatesDetected: number;
  errors: number;
  errorMessages?: string[];
  successRate: number;
}

export interface CycleDashboard {
  currentTime: Date;
  lastRefreshFeeds: CycleExecutionRecord | null;
  lastComprehensiveIngest: CycleExecutionRecord | null;
  cycleStatus: 'on-schedule' | 'delayed' | 'overdue' | 'failed';
  hoursSinceLastRefresh: number;
  hoursSinceLastIngest: number;
  nextExpectedRefresh: Date;
  nextExpectedIngest: Date;
  articlesIn24Hours: number;
  duplicatesIn24Hours: number;
  averageArticlesPerCycle: number;
  feedHealth: Record<string, FeedHealthMetric>;
  alerts: CycleAlert[];
  recommendations: string[];
}

export interface FeedHealthMetric {
  feedId: string;
  feedName: string;
  lastSuccessfulFetch: Date | null;
  consecutiveFailures: number;
  articlesInLast24h: number;
  averageScore: number;
  status: 'healthy' | 'degraded' | 'failed';
}

export interface CycleAlert {
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  suggestedAction?: string;
}

class CycleVerificationV2 {
  /**
   * Get comprehensive cycle dashboard
   */
  async getCycleDashboard(): Promise<CycleDashboard> {
    try {
      const now = new Date();
      const [lastRefresh, lastIngest, articlesIn24h, duplicatesIn24h, feedHealth, avgArticles] = await Promise.all([
        this.getLastExecution('refreshFeeds'),
        this.getLastExecution('comprehensiveIngest'),
        this.countArticlesIn24Hours(),
        this.countDuplicatesIn24Hours(),
        this.getFeedHealthMetrics(),
        this.getAverageArticlesPerCycle(),
      ]);

      const hoursSinceRefresh = lastRefresh ? (now.getTime() - (lastRefresh.endTime || lastRefresh.startTime).getTime()) / (1000 * 60 * 60) : 24;
      const hoursSinceIngest = lastIngest ? (now.getTime() - (lastIngest.endTime || lastIngest.startTime).getTime()) / (1000 * 60 * 60) : 24;

      // Determine cycle status
      let cycleStatus: 'on-schedule' | 'delayed' | 'overdue' | 'failed' = 'on-schedule';
      if (hoursSinceRefresh > 13 || hoursSinceIngest > 13) {
        cycleStatus = 'overdue';
      } else if (hoursSinceRefresh > 12.5 || hoursSinceIngest > 12.5) {
        cycleStatus = 'delayed';
      } else if (lastRefresh?.status === 'failed' || lastIngest?.status === 'failed') {
        cycleStatus = 'failed';
      }

      // Generate alerts and recommendations
      const alerts = this.generateAlerts(lastRefresh, lastIngest, hoursSinceRefresh, hoursSinceIngest, feedHealth);
      const recommendations = this.generateRecommendations(cycleStatus, lastRefresh, lastIngest, feedHealth);

      return {
        currentTime: now,
        lastRefreshFeeds: lastRefresh,
        lastComprehensiveIngest: lastIngest,
        cycleStatus,
        hoursSinceLastRefresh: hoursSinceRefresh,
        hoursSinceLastIngest: hoursSinceIngest,
        nextExpectedRefresh: new Date(now.getTime() + Math.max(0, 12 * 60 * 60 * 1000 - hoursSinceRefresh * 60 * 60 * 1000)),
        nextExpectedIngest: new Date(now.getTime() + Math.max(0, 12 * 60 * 60 * 1000 - hoursSinceIngest * 60 * 60 * 1000)),
        articlesIn24Hours: articlesIn24h,
        duplicatesIn24Hours: duplicatesIn24h,
        averageArticlesPerCycle: avgArticles,
        feedHealth,
        alerts,
        recommendations,
      };
    } catch (error) {
      logger.error('[CYCLE VERIFICATION] Error getting dashboard:', error);
      throw error;
    }
  }

  /**
   * Get last execution of a function
   */
  private async getLastExecution(functionName: string): Promise<CycleExecutionRecord | null> {
    try {
      const snapshot = await getDb().collection('cycle_executions')
        .where('functionName', '==', functionName)
        .orderBy('startTime', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) return null;
      const data = snapshot.docs[0].data();
      return {
        functionName: data.functionName,
        cycleId: data.cycleId,
        startTime: data.startTime?.toDate() || new Date(),
        endTime: data.endTime?.toDate(),
        duration: data.duration,
        status: data.status,
        articlesProcessed: data.articlesProcessed || 0,
        articlesSkipped: data.articlesSkipped || 0,
        duplicatesDetected: data.duplicatesDetected || 0,
        errors: data.errors || 0,
        errorMessages: data.errorMessages,
        successRate: data.successRate || 0,
      };
    } catch (error) {
      logger.warn(`[CYCLE VERIFICATION] Error getting last execution for ${functionName}:`, error);
      return null;
    }
  }

  /**
   * Count articles in past 24 hours
   */
  private async countArticlesIn24Hours(): Promise<number> {
    try {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const snapshot = await getDb().collection('newsArticles')
        .where('publishedAt', '>=', cutoff)
        .count()
        .get();
      return snapshot.data().count;
    } catch (error) {
      logger.warn('[CYCLE VERIFICATION] Error counting articles:', error);
      return 0;
    }
  }

  /**
   * Count duplicates in past 24 hours
   */
  private async countDuplicatesIn24Hours(): Promise<number> {
    try {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const snapshot = await getDb().collection('newsArticles')
        .where('publishedAt', '>=', cutoff)
        .where('isDuplicate', '==', true)
        .count()
        .get();
      return snapshot.data().count;
    } catch (error) {
      logger.warn('[CYCLE VERIFICATION] Error counting duplicates:', error);
      return 0;
    }
  }

  /**
   * Get feed health metrics
   */
  private async getFeedHealthMetrics(): Promise<Record<string, FeedHealthMetric>> {
    try {
      const snapshot = await getDb().collection('feed_metrics')
        .orderBy('lastSuccessfulFetch', 'desc')
        .limit(50)
        .get();

      const metrics: Record<string, FeedHealthMetric> = {};
      for (const doc of snapshot.docs) {
        const data = doc.data();
        metrics[data.feedId] = {
          feedId: data.feedId,
          feedName: data.feedName,
          lastSuccessfulFetch: data.lastSuccessfulFetch?.toDate() || null,
          consecutiveFailures: data.consecutiveFailures || 0,
          articlesInLast24h: data.articlesInLast24h || 0,
          averageScore: data.averageScore || 0,
          status: data.consecutiveFailures > 3 ? 'failed' : data.consecutiveFailures > 0 ? 'degraded' : 'healthy',
        };
      }
      return metrics;
    } catch (error) {
      logger.warn('[CYCLE VERIFICATION] Error getting feed health:', error);
      return {};
    }
  }

  /**
   * Get average articles per cycle
   */
  private async getAverageArticlesPerCycle(): Promise<number> {
    try {
      const snapshot = await getDb().collection('cycle_executions')
        .where('functionName', '==', 'refreshFeeds')
        .where('status', '==', 'completed')
        .orderBy('startTime', 'desc')
        .limit(10)
        .get();

      if (snapshot.empty) return 0;
      const total = snapshot.docs.reduce((sum, doc) => sum + (doc.data().articlesProcessed || 0), 0);
      return Math.round(total / snapshot.size);
    } catch (error) {
      logger.warn('[CYCLE VERIFICATION] Error calculating average:', error);
      return 0;
    }
  }

  /**
   * Generate alerts based on cycle status
   */
  private generateAlerts(
    lastRefresh: CycleExecutionRecord | null,
    _lastIngest: CycleExecutionRecord | null,
    hoursSinceRefresh: number,
    hoursSinceIngest: number,
    feedHealth: Record<string, FeedHealthMetric>
  ): CycleAlert[] {
    const alerts: CycleAlert[] = [];

    if (hoursSinceRefresh > 13) {
      alerts.push({
        severity: 'critical',
        message: `refreshFeeds is overdue by ${(hoursSinceRefresh - 12).toFixed(1)} hours`,
        timestamp: new Date(),
        suggestedAction: 'Manually trigger refreshFeeds or check Cloud Scheduler configuration',
      });
    }

    if (hoursSinceIngest > 13) {
      alerts.push({
        severity: 'critical',
        message: `comprehensiveIngest is overdue by ${(hoursSinceIngest - 12).toFixed(1)} hours`,
        timestamp: new Date(),
        suggestedAction: 'Manually trigger comprehensiveIngest or check Cloud Scheduler configuration',
      });
    }

    if (lastRefresh?.status === 'failed') {
      alerts.push({
        severity: 'critical',
        message: `Last refreshFeeds execution failed with ${lastRefresh.errors} errors`,
        timestamp: new Date(),
        suggestedAction: 'Check function logs for error details',
      });
    }

    const failedFeeds = Object.values(feedHealth).filter(f => f.status === 'failed');
    if (failedFeeds.length > 0) {
      alerts.push({
        severity: 'warning',
        message: `${failedFeeds.length} feeds are failing`,
        timestamp: new Date(),
        suggestedAction: `Check feeds: ${failedFeeds.map(f => f.feedName).join(', ')}`,
      });
    }

    return alerts;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    cycleStatus: string,
    lastRefresh: CycleExecutionRecord | null,
    _lastIngest: CycleExecutionRecord | null,
    feedHealth: Record<string, FeedHealthMetric>
  ): string[] {
    const recommendations: string[] = [];

    if (cycleStatus === 'overdue') {
      recommendations.push('Cycle is overdue - check Cloud Scheduler jobs and function logs');
    }

    if (lastRefresh && lastRefresh.successRate < 0.8) {
      recommendations.push(`refreshFeeds success rate is low (${(lastRefresh.successRate * 100).toFixed(1)}%) - investigate feed sources`);
    }

    const degradedFeeds = Object.values(feedHealth).filter(f => f.status === 'degraded');
    if (degradedFeeds.length > 0) {
      recommendations.push(`${degradedFeeds.length} feeds are degraded - monitor for recovery`);
    }

    return recommendations;
  }
}

export const cycleVerificationV2 = new CycleVerificationV2();

