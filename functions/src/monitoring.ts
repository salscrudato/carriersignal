/**
 * Comprehensive Monitoring & Observability System
 * Tracks 12-hour update cycles, health metrics, and system performance
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

export interface HealthMetrics {
  timestamp: Date;
  cycleId: string;
  status: 'healthy' | 'degraded' | 'failed';
  articlesProcessed: number;
  articlesSkipped: number;
  errors: number;
  duration: number;
  avgLatency: number;
  successRate: number;
  feedsProcessed: number;
  feedsFailed: number;
  aiScoringLatency: number;
  memoryUsed: number;
  cpuUsed: number;
}

export interface CyclePhase {
  name: 'refreshFeeds' | 'comprehensiveIngest' | 'scoring' | 'deduplication';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  articlesProcessed?: number;
  error?: string;
}

export interface CycleMetrics {
  cycleId: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed';
  metrics: HealthMetrics;
  alerts: Alert[];
  phases: CyclePhase[];
  duplicatesDetected: number;
  duplicateRemovalRate: number;
}

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

class MonitoringSystem {
  private currentCycle: CycleMetrics | null = null;
  private metricsBuffer: HealthMetrics[] = [];
  private readonly BUFFER_SIZE = 100;

  /**
   * Start a new monitoring cycle
   */
  startCycle(cycleId: string): void {
    this.currentCycle = {
      cycleId,
      startTime: new Date(),
      status: 'running',
      metrics: {
        timestamp: new Date(),
        cycleId,
        status: 'healthy',
        articlesProcessed: 0,
        articlesSkipped: 0,
        errors: 0,
        duration: 0,
        avgLatency: 0,
        successRate: 0,
        feedsProcessed: 0,
        feedsFailed: 0,
        aiScoringLatency: 0,
        memoryUsed: 0,
        cpuUsed: 0,
      },
      alerts: [],
      phases: [
        {name: 'refreshFeeds', status: 'pending'},
        {name: 'comprehensiveIngest', status: 'pending'},
        {name: 'scoring', status: 'pending'},
        {name: 'deduplication', status: 'pending'},
      ],
      duplicatesDetected: 0,
      duplicateRemovalRate: 0,
    };

    logger.info(`[MONITORING] Cycle ${cycleId} started`, {cycleId});
  }

  /**
   * Record metrics for current cycle
   */
  recordMetrics(metrics: Partial<HealthMetrics>): void {
    if (!this.currentCycle) return;

    this.currentCycle.metrics = {
      ...this.currentCycle.metrics,
      ...metrics,
      timestamp: new Date(),
    };

    // Check for anomalies
    this.checkAnomalies();
  }

  /**
   * Check for performance anomalies
   */
  private checkAnomalies(): void {
    if (!this.currentCycle) return;

    const metrics = this.currentCycle.metrics;

    // High error rate
    if (metrics.successRate < 0.8) {
      this.addAlert({
        severity: 'warning',
        message: `Low success rate: ${(metrics.successRate * 100).toFixed(1)}%`,
      });
    }

    // High latency
    if (metrics.avgLatency > 5000) {
      this.addAlert({
        severity: 'warning',
        message: `High average latency: ${metrics.avgLatency}ms`,
      });
    }

    // Feed failures
    if (metrics.feedsFailed > metrics.feedsProcessed * 0.2) {
      this.addAlert({
        severity: 'critical',
        message: `High feed failure rate: ${metrics.feedsFailed}/${metrics.feedsProcessed}`,
      });
    }

    // No articles processed
    if (metrics.articlesProcessed === 0 && metrics.duration > 60000) {
      this.addAlert({
        severity: 'critical',
        message: 'No articles processed after 1 minute',
      });
    }
  }

  /**
   * Add alert to current cycle
   */
  private addAlert(alert: {severity: 'info' | 'warning' | 'critical'; message: string}): void {
    if (!this.currentCycle) return;

    this.currentCycle.alerts.push({
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      severity: alert.severity,
      message: alert.message,
      timestamp: new Date(),
      resolved: false,
    });

    logger.warn(`[MONITORING] Alert: ${alert.message}`, {severity: alert.severity});
  }

  /**
   * Complete current cycle
   */
  async completeCycle(status: 'completed' | 'failed'): Promise<void> {
    if (!this.currentCycle) return;

    this.currentCycle.endTime = new Date();
    this.currentCycle.status = status;
    this.currentCycle.metrics.duration = this.currentCycle.endTime.getTime() - this.currentCycle.startTime.getTime();

    // Determine overall status
    if (this.currentCycle.metrics.successRate < 0.5) {
      this.currentCycle.metrics.status = 'failed';
    } else if (this.currentCycle.metrics.successRate < 0.8) {
      this.currentCycle.metrics.status = 'degraded';
    }

    // Persist to Firestore
    await this.persistCycle();

    logger.info(`[MONITORING] Cycle ${this.currentCycle.cycleId} completed`, {
      status: this.currentCycle.metrics.status,
      duration: this.currentCycle.metrics.duration,
      processed: this.currentCycle.metrics.articlesProcessed,
    });

    this.currentCycle = null;
  }

  /**
   * Persist cycle metrics to Firestore
   */
  private async persistCycle(): Promise<void> {
    if (!this.currentCycle) return;

    try {
      await getDb().collection('monitoring_cycles').add({
        ...this.currentCycle,
        startTime: this.currentCycle.startTime,
        endTime: this.currentCycle.endTime,
        metrics: {
          ...this.currentCycle.metrics,
          timestamp: this.currentCycle.metrics.timestamp,
        },
      });

      // Also add to metrics buffer for analytics
      this.metricsBuffer.push(this.currentCycle.metrics);
      if (this.metricsBuffer.length >= this.BUFFER_SIZE) {
        await this.flushMetricsBuffer();
      }
    } catch (error) {
      logger.error('[MONITORING] Failed to persist cycle:', error);
    }
  }

  /**
   * Flush metrics buffer to Firestore
   */
  private async flushMetricsBuffer(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    try {
      const batch = getDb().batch();
      const metricsRef = getDb().collection('metrics_aggregated');

      for (const metrics of this.metricsBuffer) {
        batch.set(metricsRef.doc(), metrics);
      }

      await batch.commit();
      this.metricsBuffer = [];
      logger.info('[MONITORING] Metrics buffer flushed');
    } catch (error) {
      logger.error('[MONITORING] Failed to flush metrics buffer:', error);
    }
  }

  /**
   * Get current cycle metrics
   */
  getCurrentMetrics(): HealthMetrics | null {
    return this.currentCycle?.metrics || null;
  }

  /**
   * Track phase start
   */
  startPhase(phaseName: CyclePhase['name']): void {
    if (!this.currentCycle) return;
    const phase = this.currentCycle.phases.find(p => p.name === phaseName);
    if (phase) {
      phase.status = 'running';
      phase.startTime = new Date();
    }
  }

  /**
   * Track phase completion
   */
  completePhase(phaseName: CyclePhase['name'], articlesProcessed?: number, error?: string): void {
    if (!this.currentCycle) return;
    const phase = this.currentCycle.phases.find(p => p.name === phaseName);
    if (phase) {
      phase.status = error ? 'failed' : 'completed';
      phase.endTime = new Date();
      if (phase.startTime) {
        phase.duration = phase.endTime.getTime() - phase.startTime.getTime();
      }
      if (articlesProcessed !== undefined) {
        phase.articlesProcessed = articlesProcessed;
      }
      if (error) {
        phase.error = error;
      }
    }
  }

  /**
   * Record duplicate detection metrics
   */
  recordDuplicates(count: number, removalRate: number): void {
    if (!this.currentCycle) return;
    this.currentCycle.duplicatesDetected = count;
    this.currentCycle.duplicateRemovalRate = removalRate;
  }

  /**
   * Get cycle status
   */
  getCycleStatus(): CycleMetrics | null {
    return this.currentCycle;
  }
}

export const monitoring = new MonitoringSystem();

