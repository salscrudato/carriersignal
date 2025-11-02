/**
 * Health Check & Status Endpoint
 * Provides comprehensive system health and 12-hour cycle status
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

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  lastCycleId: string | null;
  lastCycleStatus: 'completed' | 'failed' | 'running' | null;
  lastCycleTime: Date | null;
  hoursSinceLastCycle: number;
  nextCycleTime: Date;
  articlesInDatabase: number;
  averageSuccessRate: number;
  recentErrors: number;
  feedHealth: Record<string, {status: 'healthy' | 'degraded' | 'failed'; lastSuccess: Date | null}>;
  alerts: Array<{severity: string; message: string; timestamp: Date}>;
}

export class HealthCheckService {
  /**
   * Get comprehensive system health status
   */
  async getSystemHealth(): Promise<SystemHealth> {
    try {
      const [lastCycle, articleCount, recentErrors, feedHealth] = await Promise.all([
        this.getLastCycle(),
        this.getArticleCount(),
        this.getRecentErrors(),
        this.getFeedHealth(),
      ]);

      const now = new Date();
      const lastCycleTime = lastCycle?.endTime || lastCycle?.startTime;
      const hoursSinceLastCycle = lastCycleTime ? (now.getTime() - lastCycleTime.getTime()) / (1000 * 60 * 60) : 24;

      // Calculate next cycle time (every 12 hours from last cycle)
      const nextCycleTime = lastCycleTime ? new Date(lastCycleTime.getTime() + 12 * 60 * 60 * 1000) : now;

      // Determine overall status
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      if (hoursSinceLastCycle > 13) {
        status = 'unhealthy'; // Cycle is overdue
      } else if (hoursSinceLastCycle > 12.5) {
        status = 'degraded'; // Cycle is slightly late
      }

      const recentAlerts = await this.getRecentAlerts();

      return {
        status,
        timestamp: now,
        lastCycleId: lastCycle?.cycleId || null,
        lastCycleStatus: lastCycle?.status || null,
        lastCycleTime,
        hoursSinceLastCycle,
        nextCycleTime,
        articlesInDatabase: articleCount,
        averageSuccessRate: lastCycle?.metrics?.successRate || 0,
        recentErrors,
        feedHealth,
        alerts: recentAlerts,
      };
    } catch (error) {
      logger.error('[HEALTH CHECK] Error getting system health:', error);
      throw error;
    }
  }

  /**
   * Get last completed cycle
   */
  private async getLastCycle() {
    try {
      const snapshot = await getDb().collection('monitoring_cycles')
        .where('status', '==', 'completed')
        .orderBy('endTime', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) return null;
      return snapshot.docs[0].data();
    } catch (error) {
      logger.warn('[HEALTH CHECK] Error getting last cycle:', error);
      return null;
    }
  }

  /**
   * Get article count
   */
  private async getArticleCount(): Promise<number> {
    try {
      const snapshot = await getDb().collection('newsArticles').count().get();
      return snapshot.data().count;
    } catch (error) {
      logger.warn('[HEALTH CHECK] Error getting article count:', error);
      return 0;
    }
  }

  /**
   * Get recent error count
   */
  private async getRecentErrors(): Promise<number> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const snapshot = await getDb().collection('monitoring_cycles')
        .where('metrics.timestamp', '>=', oneHourAgo)
        .where('metrics.errors', '>', 0)
        .get();

      return snapshot.docs.reduce((sum, doc) => sum + (doc.data().metrics?.errors || 0), 0);
    } catch (error) {
      logger.warn('[HEALTH CHECK] Error getting recent errors:', error);
      return 0;
    }
  }

  /**
   * Get feed health status
   */
  private async getFeedHealth(): Promise<Record<string, {status: 'healthy' | 'degraded' | 'failed'; lastSuccess: Date | null}>> {
    try {
      const snapshot = await getDb().collection('feed_health').get();
      const health: Record<string, {status: 'healthy' | 'degraded' | 'failed'; lastSuccess: Date | null}> = {};

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        health[doc.id] = {
          status: data.status || 'healthy',
          lastSuccess: data.lastSuccess?.toDate() || null,
        };
      });

      return health;
    } catch (error) {
      logger.warn('[HEALTH CHECK] Error getting feed health:', error);
      return {};
    }
  }

  /**
   * Get recent alerts
   */
  private async getRecentAlerts() {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const snapshot = await getDb().collection('monitoring_cycles')
        .where('startTime', '>=', oneDayAgo)
        .get();

      const alerts: Array<{severity: string; message: string; timestamp: Date}> = [];
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.alerts && Array.isArray(data.alerts)) {
          data.alerts.forEach((alert: {severity: string; message: string; timestamp: unknown}) => {
            alerts.push({
              severity: alert.severity,
              message: alert.message,
              timestamp: (alert.timestamp as {toDate: () => Date})?.toDate() || new Date(),
            });
          });
        }
      });

      return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
    } catch (error) {
      logger.warn('[HEALTH CHECK] Error getting recent alerts:', error);
      return [];
    }
  }

  /**
   * Check if 12-hour cycle is overdue
   */
  async isCycleOverdue(): Promise<boolean> {
    const health = await this.getSystemHealth();
    return health.hoursSinceLastCycle > 13;
  }

  /**
   * Get cycle status for dashboard
   */
  async getCycleStatus() {
    const health = await this.getSystemHealth();
    return {
      isOverdue: health.hoursSinceLastCycle > 13,
      hoursSinceLastCycle: health.hoursSinceLastCycle,
      nextCycleTime: health.nextCycleTime,
      lastCycleStatus: health.lastCycleStatus,
      articlesProcessed: health.articlesInDatabase,
      successRate: health.averageSuccessRate,
    };
  }
}

export const healthCheck = new HealthCheckService();

