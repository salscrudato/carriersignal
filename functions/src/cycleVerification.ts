/**
 * 12-Hour Cycle Verification & Monitoring
 * Comprehensive verification that both refreshFeeds and comprehensiveIngest complete successfully
 */

import {getFirestore, Firestore} from "firebase-admin/firestore";
import {logger} from "firebase-functions";
import {CyclePhase, CycleMetrics} from "./monitoring";
import {FeedMetrics} from "./feedPrioritization";

let db: Firestore | null = null;

function getDb(): Firestore {
  if (!db) {
    db = getFirestore();
  }
  return db;
}

export interface CycleVerification {
  cycleId: string;
  scheduledTime: Date;
  refreshFeedsCompleted: boolean;
  refreshFeedsTime?: Date;
  comprehensiveIngestCompleted: boolean;
  comprehensiveIngestTime?: Date;
  bothPhasesCompleted: boolean;
  totalDuration?: number;
  articlesProcessed: number;
  duplicatesRemoved: number;
  qualityScore: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'partial';
  nextScheduledCycle: Date;
  alerts: Array<{severity: 'info' | 'warning' | 'critical'; message: string}>;
}

export interface FeedMonitoring {
  feedUrl: string;
  feedName: string;
  lastFetchTime: Date;
  articlesIngested: number;
  duplicatesDetected: number;
  errorCount: number;
  successRate: number;
  avgLatency: number;
  status: 'healthy' | 'degraded' | 'failed';
  lastError?: string;
}

class CycleVerificationService {
  private readonly CYCLE_INTERVAL_MS = 12 * 60 * 60 * 1000; // 12 hours

  /**
   * Get comprehensive cycle verification status
   */
  async getCycleVerification(): Promise<CycleVerification> {
    try {
      
      // Get the most recent cycle
      const cycleSnapshot = await getDb().collection('monitoring_cycles')
        .orderBy('startTime', 'desc')
        .limit(1)
        .get();

      if (cycleSnapshot.empty) {
        return this.getDefaultVerification();
      }

      const cycleDoc = cycleSnapshot.docs[0];
      const cycle = cycleDoc.data();

      // Check phase completion
      const phases = (cycle.phases as CyclePhase[]) || [];
      const refreshFeedsPhase = phases.find((p: CyclePhase) => p.name === 'refreshFeeds');
      const comprehensiveIngestPhase = phases.find((p: CyclePhase) => p.name === 'comprehensiveIngest');

      const refreshFeedsCompleted = refreshFeedsPhase?.status === 'completed';
      const comprehensiveIngestCompleted = comprehensiveIngestPhase?.status === 'completed';
      const bothPhasesCompleted = refreshFeedsCompleted && comprehensiveIngestCompleted;

      // Calculate status
      let status: CycleVerification['status'] = 'pending';
      if (bothPhasesCompleted) {
        status = 'completed';
      } else if (refreshFeedsCompleted || comprehensiveIngestCompleted) {
        status = 'partial';
      } else if (cycle.status === 'running') {
        status = 'in_progress';
      } else if (cycle.status === 'failed') {
        status = 'failed';
      }

      // Generate alerts
      const alerts: CycleVerification['alerts'] = [];
      if (!refreshFeedsCompleted) {
        alerts.push({severity: 'warning', message: 'refreshFeeds phase not completed'});
      }
      if (!comprehensiveIngestCompleted) {
        alerts.push({severity: 'warning', message: 'comprehensiveIngest phase not completed'});
      }
      if (cycle.metrics?.successRate < 0.8) {
        alerts.push({severity: 'critical', message: `Low success rate: ${(cycle.metrics.successRate * 100).toFixed(1)}%`});
      }

      const nextScheduledCycle = new Date(cycle.startTime.toDate().getTime() + this.CYCLE_INTERVAL_MS);

      return {
        cycleId: cycle.cycleId,
        scheduledTime: cycle.startTime instanceof Date ? cycle.startTime : (cycle.startTime as {toDate: () => Date}).toDate(),
        refreshFeedsCompleted,
        refreshFeedsTime: refreshFeedsPhase?.endTime instanceof Date ? refreshFeedsPhase.endTime : (refreshFeedsPhase?.endTime as unknown as {toDate: () => Date})?.toDate?.(),
        comprehensiveIngestCompleted,
        comprehensiveIngestTime: comprehensiveIngestPhase?.endTime instanceof Date ? comprehensiveIngestPhase.endTime : (comprehensiveIngestPhase?.endTime as unknown as {toDate: () => Date})?.toDate?.(),
        bothPhasesCompleted,
        totalDuration: cycle.metrics?.duration,
        articlesProcessed: cycle.metrics?.articlesProcessed || 0,
        duplicatesRemoved: cycle.duplicatesDetected || 0,
        qualityScore: this.calculateQualityScore(cycle as CycleMetrics),
        status,
        nextScheduledCycle,
        alerts,
      };
    } catch (error) {
      logger.error('[CYCLE VERIFICATION] Error getting cycle verification:', error);
      return this.getDefaultVerification();
    }
  }

  /**
   * Get real-time feed monitoring data
   */
  async getFeedMonitoring(): Promise<FeedMonitoring[]> {
    try {
      const feedMetrics = await getDb().collection('feed_metrics')
        .orderBy('lastUpdated', 'desc')
        .get();

      return feedMetrics.docs.map(doc => {
        const data = doc.data();
        return {
          feedUrl: data.feedUrl,
          feedName: data.feedName || 'Unknown',
          lastFetchTime: data.lastUpdated?.toDate() || new Date(),
          articlesIngested: data.articlesPerCycle || 0,
          duplicatesDetected: data.duplicatesDetected || 0,
          errorCount: data.errorCount || 0,
          successRate: data.successRate || 0,
          avgLatency: data.avgLatency || 0,
          status: this.determineFeedStatus(data as FeedMetrics),
          lastError: data.lastError,
        };
      });
    } catch (error) {
      logger.error('[FEED MONITORING] Error getting feed monitoring:', error);
      return [];
    }
  }

  /**
   * Verify cycle completion within expected timeframe
   */
  async verifyCycleCompletion(): Promise<{isComplete: boolean; isOverdue: boolean; hoursElapsed: number}> {
    try {
      const now = new Date();
      const cycleSnapshot = await getDb().collection('monitoring_cycles')
        .orderBy('startTime', 'desc')
        .limit(1)
        .get();

      if (cycleSnapshot.empty) {
        return {isComplete: false, isOverdue: true, hoursElapsed: 0};
      }

      const cycle = cycleSnapshot.docs[0].data();
      const startTime = cycle.startTime.toDate();
      const hoursElapsed = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      const isOverdue = hoursElapsed > 13; // More than 1 hour past 12-hour mark

      const phases = (cycle.phases as CyclePhase[]) || [];
      const allPhasesCompleted = phases.every((p: CyclePhase) => p.status === 'completed');

      return {
        isComplete: allPhasesCompleted,
        isOverdue,
        hoursElapsed: Math.round(hoursElapsed * 10) / 10,
      };
    } catch (error) {
      logger.error('[CYCLE VERIFICATION] Error verifying cycle completion:', error);
      return {isComplete: false, isOverdue: false, hoursElapsed: 0};
    }
  }

  private calculateQualityScore(cycle: CycleMetrics): number {
    let score = 100;

    // Deduct for low success rate
    if (cycle.metrics?.successRate < 0.95) {
      score -= (0.95 - cycle.metrics.successRate) * 100;
    }

    // Deduct for high error rate
    if (cycle.metrics?.errors > 0) {
      score -= Math.min(20, cycle.metrics.errors);
    }

    // Deduct for duplicates
    if (cycle.duplicatesDetected > 0) {
      score -= Math.min(10, cycle.duplicatesDetected / 10);
    }

    return Math.max(0, Math.min(100, score));
  }

  private determineFeedStatus(data: FeedMetrics): FeedMonitoring['status'] {
    if (data.successRate >= 0.95) return 'healthy';
    if (data.successRate >= 0.8) return 'degraded';
    return 'failed';
  }

  private getDefaultVerification(): CycleVerification {
    const now = new Date();
    return {
      cycleId: 'unknown',
      scheduledTime: now,
      refreshFeedsCompleted: false,
      comprehensiveIngestCompleted: false,
      bothPhasesCompleted: false,
      articlesProcessed: 0,
      duplicatesRemoved: 0,
      qualityScore: 0,
      status: 'pending',
      nextScheduledCycle: new Date(now.getTime() + this.CYCLE_INTERVAL_MS),
      alerts: [{severity: 'info', message: 'No cycle data available yet'}],
    };
  }
}

export const cycleVerification = new CycleVerificationService();

