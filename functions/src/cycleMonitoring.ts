/**
 * Advanced Cycle Monitoring & Dashboard
 * Real-time visibility into 12-hour update cycles with comprehensive metrics
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

export interface CycleDashboard {
  currentCycle: {
    cycleId: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    startTime: Date;
    endTime?: Date;
    duration?: number;
    progress: number; // 0-100
  };
  lastCycle: {
    cycleId: string;
    status: 'completed' | 'failed';
    startTime: Date;
    endTime: Date;
    duration: number;
    articlesProcessed: number;
    duplicatesDetected: number;
    successRate: number;
  } | null;
  nextCycleTime: Date;
  cycleHealth: {
    isOnSchedule: boolean;
    hoursSinceLastCycle: number;
    expectedInterval: number;
    status: 'healthy' | 'degraded' | 'overdue';
  };
  phases: {
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    startTime?: Date;
    endTime?: Date;
    duration?: number;
    articlesProcessed?: number;
    error?: string;
  }[];
  metrics: {
    totalArticlesInDatabase: number;
    articlesAddedThisCycle: number;
    duplicateRemovalRate: number;
    averageQualityScore: number;
    feedHealthScore: number;
  };
  alerts: {
    id: string;
    severity: 'info' | 'warning' | 'critical';
    message: string;
    timestamp: Date;
    resolved: boolean;
  }[];
}

class CycleMonitoringService {
  private readonly CYCLE_INTERVAL_MS = 12 * 60 * 60 * 1000;
  private readonly CYCLE_TIMEOUT_MS = 45 * 60 * 1000; // 45 minutes

  /**
   * Get comprehensive cycle dashboard
   */
  async getCycleDashboard(): Promise<CycleDashboard> {
    try {
      // Get current cycle
      const currentCycle = await this.getCurrentCycle();
      
      // Get last completed cycle
      const lastCycle = await this.getLastCompletedCycle();
      
      // Calculate next cycle time
      const nextCycleTime = this.calculateNextCycleTime(lastCycle);
      
      // Get cycle health
      const cycleHealth = this.calculateCycleHealth(lastCycle);

      // Get phases
      const phases = await this.getPhaseStatus(currentCycle?.cycleId);

      // Get metrics
      const metrics = await this.getMetrics();
      
      // Get alerts
      const alerts = await this.getRecentAlerts();

      return {
        currentCycle: currentCycle || {
          cycleId: 'none',
          status: 'pending',
          startTime: new Date(),
          progress: 0,
        },
        lastCycle,
        nextCycleTime,
        cycleHealth,
        phases,
        metrics,
        alerts,
      };
    } catch (error) {
      logger.error('[CYCLE MONITORING] Error getting dashboard:', error);
      throw error;
    }
  }

  /**
   * Get current running cycle
   */
  private async getCurrentCycle() {
    try {
      const snapshot = await getDb().collection('monitoring_cycles')
        .where('status', '==', 'running')
        .orderBy('startTime', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      const data = doc.data();
      const startTime = data.startTime?.toDate() || new Date();
      const now = new Date();
      const duration = now.getTime() - startTime.getTime();
      const progress = Math.min(100, (duration / this.CYCLE_TIMEOUT_MS) * 100);

      return {
        cycleId: data.cycleId,
        status: 'running' as const,
        startTime,
        progress,
      };
    } catch (error) {
      logger.warn('[CYCLE MONITORING] Error getting current cycle:', error);
      return null;
    }
  }

  /**
   * Get last completed cycle
   */
  private async getLastCompletedCycle() {
    try {
      const snapshot = await getDb().collection('monitoring_cycles')
        .where('status', '==', 'completed')
        .orderBy('endTime', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) return null;

      const data = snapshot.docs[0].data();
      const startTime = data.startTime?.toDate() || new Date();
      const endTime = data.endTime?.toDate() || new Date();
      const duration = endTime.getTime() - startTime.getTime();

      return {
        cycleId: data.cycleId,
        status: 'completed' as const,
        startTime,
        endTime,
        duration,
        articlesProcessed: data.metrics?.articlesProcessed || 0,
        duplicatesDetected: data.duplicatesDetected || 0,
        successRate: data.metrics?.successRate || 0,
      };
    } catch (error) {
      logger.warn('[CYCLE MONITORING] Error getting last cycle:', error);
      return null;
    }
  }

  /**
   * Calculate next cycle time
   */
  private calculateNextCycleTime(lastCycle: Record<string, unknown> | null): Date {
    if (!lastCycle?.endTime) {
      return new Date(Date.now() + this.CYCLE_INTERVAL_MS);
    }
    return new Date((lastCycle.endTime as Date).getTime() + this.CYCLE_INTERVAL_MS);
  }

  /**
   * Calculate cycle health
   */
  private calculateCycleHealth(lastCycle: Record<string, unknown> | null) {
    const now = new Date();
    const lastCycleTime = (lastCycle?.endTime || lastCycle?.startTime) as Date | undefined;
    const hoursSinceLastCycle = lastCycleTime
      ? (now.getTime() - lastCycleTime.getTime()) / (1000 * 60 * 60)
      : 24;

    let status: 'healthy' | 'degraded' | 'overdue' = 'healthy';
    if (hoursSinceLastCycle > 13) {
      status = 'overdue';
    } else if (hoursSinceLastCycle > 12.5) {
      status = 'degraded';
    }

    return {
      isOnSchedule: hoursSinceLastCycle <= 12.5,
      hoursSinceLastCycle,
      expectedInterval: 12,
      status,
    };
  }

  /**
   * Get phase status
   */
  private async getPhaseStatus(_cycleId?: string) {
    try {
      if (!_cycleId) {
        return [
          { name: 'refreshFeeds', status: 'pending' as const },
          { name: 'comprehensiveIngest', status: 'pending' as const },
          { name: 'scoring', status: 'pending' as const },
          { name: 'deduplication', status: 'pending' as const },
        ];
      }

      const snapshot = await getDb().collection('monitoring_cycles')
        .doc(_cycleId)
        .get();

      if (!snapshot.exists) return [];

      const data = snapshot.data();
      return data?.phases || [];
    } catch (error) {
      logger.warn('[CYCLE MONITORING] Error getting phases:', error);
      return [];
    }
  }

  /**
   * Get metrics
   */
  private async getMetrics() {
    try {
      const articlesSnapshot = await getDb().collection('newsArticles')
        .orderBy('publishedAt', 'desc')
        .limit(1)
        .get();

      const totalArticles = articlesSnapshot.size > 0 
        ? (await getDb().collection('newsArticles').count().get()).data().count
        : 0;

      // Get articles added in current cycle (last 12 hours)
      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
      const recentSnapshot = await getDb().collection('newsArticles')
        .where('publishedAt', '>=', twelveHoursAgo)
        .count()
        .get();

      const articlesAddedThisCycle = recentSnapshot.data().count;

      // Get duplicate metrics from last cycle
      const lastCycleSnapshot = await getDb().collection('monitoring_cycles')
        .where('status', '==', 'completed')
        .orderBy('endTime', 'desc')
        .limit(1)
        .get();

      let duplicateRemovalRate = 0;
      let averageQualityScore = 0;

      if (!lastCycleSnapshot.empty) {
        const lastCycleData = lastCycleSnapshot.docs[0].data();
        const duplicatesDetected = lastCycleData.duplicatesDetected || 0;
        const articlesProcessed = lastCycleData.metrics?.articlesProcessed || 1;
        duplicateRemovalRate = duplicatesDetected / (duplicatesDetected + articlesProcessed);
        averageQualityScore = lastCycleData.metrics?.qualityScore || 0;
      }

      // Calculate feed health score
      const feedHealthSnapshot = await getDb().collection('feed_health').get();
      let feedHealthScore = 100;
      if (feedHealthSnapshot.size > 0) {
        const healthyFeeds = feedHealthSnapshot.docs.filter(
          doc => doc.data().status === 'healthy'
        ).length;
        feedHealthScore = (healthyFeeds / feedHealthSnapshot.size) * 100;
      }

      return {
        totalArticlesInDatabase: totalArticles,
        articlesAddedThisCycle,
        duplicateRemovalRate,
        averageQualityScore,
        feedHealthScore,
      };
    } catch (error) {
      logger.warn('[CYCLE MONITORING] Error getting metrics:', error);
      return {
        totalArticlesInDatabase: 0,
        articlesAddedThisCycle: 0,
        duplicateRemovalRate: 0,
        averageQualityScore: 0,
        feedHealthScore: 0,
      };
    }
  }

  /**
   * Get recent alerts
   */
  private async getRecentAlerts() {
    try {
      const snapshot = await getDb().collection('monitoring_cycles')
        .orderBy('startTime', 'desc')
        .limit(5)
        .get();

      const alerts: Array<{ id: string; severity: 'critical' | 'warning' | 'info'; message: string; timestamp: Date; resolved: boolean }> = [];
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.alerts && Array.isArray(data.alerts)) {
          alerts.push(...(data.alerts as Array<{ id: string; severity: 'critical' | 'warning' | 'info'; message: string; timestamp: Date; resolved: boolean }>));
        }
      });

      return alerts.slice(0, 10);
    } catch (error) {
      logger.warn('[CYCLE MONITORING] Error getting alerts:', error);
      return [];
    }
  }
}

export const cycleMonitoring = new CycleMonitoringService();

