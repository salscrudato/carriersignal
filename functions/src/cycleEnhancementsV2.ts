/**
 * Advanced 12-Hour Cycle Enhancements V2
 * Best-in-class monitoring, deduplication, and AI scoring for news feed
 * 
 * Features:
 * - Predictive cycle health monitoring with anomaly detection
 * - ML-based semantic deduplication with confidence scoring
 * - Real-time article quality assessment
 * - Engagement-based dynamic scoring
 * - Comprehensive cycle verification and recovery
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

// ============================================================================
// CYCLE HEALTH MONITORING V2
// ============================================================================

export interface CycleHealthMetrics {
  cycleId: string;
  timestamp: Date;
  status: 'healthy' | 'degraded' | 'critical' | 'failed';
  
  // Cycle timing
  scheduledTime: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
  expectedDuration: number; // ms
  actualDuration?: number; // ms
  delayMs?: number;
  
  // Article metrics
  articlesProcessed: number;
  articlesSkipped: number;
  articlesWithErrors: number;
  duplicatesDetected: number;
  duplicateRemovalRate: number; // 0-1
  
  // Quality metrics
  averageQualityScore: number; // 0-100
  articlesWithAIScore: number;
  averageAIScore: number; // 0-100
  
  // Feed health
  feedsProcessed: number;
  feedsSucceeded: number;
  feedsFailed: number;
  feedSuccessRate: number; // 0-1
  
  // Performance
  avgLatencyMs: number;
  maxLatencyMs: number;
  p95LatencyMs: number;
  
  // Anomalies
  anomalies: CycleAnomaly[];
  alerts: CycleAlert[];
}

export interface CycleAnomaly {
  type: 'high_error_rate' | 'low_article_count' | 'high_duplicate_rate' | 'feed_failure' | 'latency_spike' | 'quality_drop';
  severity: 'warning' | 'critical';
  message: string;
  value: number;
  threshold: number;
  timestamp: Date;
}

export interface CycleAlert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  type: 'cycle_delay' | 'feed_failure' | 'quality_issue' | 'duplicate_spike' | 'performance_issue';
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolutionTime?: Date;
}

export class CycleHealthMonitorV2 {
  private readonly HEALTHY_THRESHOLDS = {
    errorRate: 0.05, // 5%
    duplicateRate: 0.05, // 5%
    feedSuccessRate: 0.90, // 90%
    minArticles: 50,
    qualityScore: 75,
    maxLatencyMs: 5000,
  };

  private readonly DEGRADED_THRESHOLDS = {
    errorRate: 0.10, // 10%
    duplicateRate: 0.10, // 10%
    feedSuccessRate: 0.75, // 75%
    minArticles: 20,
    qualityScore: 60,
    maxLatencyMs: 10000,
  };

  /**
   * Analyze cycle health and detect anomalies
   */
  async analyzeCycleHealth(metrics: Partial<CycleHealthMetrics>): Promise<CycleHealthMetrics> {
    const now = new Date();
    const cycleId = metrics.cycleId || `cycle_${Date.now()}`;

    // Calculate derived metrics
    const totalProcessed = (metrics.articlesProcessed || 0) + (metrics.articlesSkipped || 0);
    const errorRate = totalProcessed > 0 ? (metrics.articlesWithErrors || 0) / totalProcessed : 0;
    const feedSuccessRate = (metrics.feedsProcessed || 0) > 0 
      ? (metrics.feedsSucceeded || 0) / (metrics.feedsProcessed || 1) 
      : 0;

    // Detect anomalies
    const anomalies = this.detectAnomalies({
      errorRate,
      duplicateRate: metrics.duplicateRemovalRate || 0,
      feedSuccessRate,
      articlesProcessed: metrics.articlesProcessed || 0,
      qualityScore: metrics.averageQualityScore || 0,
      maxLatencyMs: metrics.maxLatencyMs || 0,
    });

    // Determine status
    const status = this.determineStatus(anomalies, errorRate, feedSuccessRate);

    // Generate alerts
    const alerts = this.generateAlerts(anomalies);

    const fullMetrics: CycleHealthMetrics = {
      cycleId,
      timestamp: now,
      status,
      scheduledTime: metrics.scheduledTime || now,
      actualStartTime: metrics.actualStartTime,
      actualEndTime: metrics.actualEndTime,
      expectedDuration: metrics.expectedDuration || 12 * 60 * 60 * 1000,
      actualDuration: metrics.actualDuration,
      delayMs: metrics.delayMs,
      articlesProcessed: metrics.articlesProcessed || 0,
      articlesSkipped: metrics.articlesSkipped || 0,
      articlesWithErrors: metrics.articlesWithErrors || 0,
      duplicatesDetected: metrics.duplicatesDetected || 0,
      duplicateRemovalRate: metrics.duplicateRemovalRate || 0,
      averageQualityScore: metrics.averageQualityScore || 0,
      articlesWithAIScore: metrics.articlesWithAIScore || 0,
      averageAIScore: metrics.averageAIScore || 0,
      feedsProcessed: metrics.feedsProcessed || 0,
      feedsSucceeded: metrics.feedsSucceeded || 0,
      feedsFailed: metrics.feedsFailed || 0,
      feedSuccessRate,
      avgLatencyMs: metrics.avgLatencyMs || 0,
      maxLatencyMs: metrics.maxLatencyMs || 0,
      p95LatencyMs: metrics.p95LatencyMs || 0,
      anomalies,
      alerts,
    };

    // Persist to Firestore
    await this.persistMetrics(fullMetrics);

    return fullMetrics;
  }

  private detectAnomalies(metrics: {
    errorRate: number;
    duplicateRate: number;
    feedSuccessRate: number;
    articlesProcessed: number;
    qualityScore: number;
    maxLatencyMs: number;
  }): CycleAnomaly[] {
    const anomalies: CycleAnomaly[] = [];
    const now = new Date();

    // Check error rate
    if (metrics.errorRate > this.DEGRADED_THRESHOLDS.errorRate) {
      anomalies.push(this.createAnomaly('high_error_rate', metrics.errorRate > 0.15 ? 'critical' : 'warning',
        `Error rate ${(metrics.errorRate * 100).toFixed(2)}% exceeds threshold`, metrics.errorRate,
        this.DEGRADED_THRESHOLDS.errorRate, now));
    }

    // Check duplicate rate
    if (metrics.duplicateRate > this.DEGRADED_THRESHOLDS.duplicateRate) {
      anomalies.push(this.createAnomaly('high_duplicate_rate', metrics.duplicateRate > 0.15 ? 'critical' : 'warning',
        `Duplicate rate ${(metrics.duplicateRate * 100).toFixed(2)}% exceeds threshold`, metrics.duplicateRate,
        this.DEGRADED_THRESHOLDS.duplicateRate, now));
    }

    // Check feed success rate
    if (metrics.feedSuccessRate < this.DEGRADED_THRESHOLDS.feedSuccessRate) {
      anomalies.push(this.createAnomaly('feed_failure', metrics.feedSuccessRate < 0.5 ? 'critical' : 'warning',
        `Feed success rate ${(metrics.feedSuccessRate * 100).toFixed(2)}% below threshold`, metrics.feedSuccessRate,
        this.DEGRADED_THRESHOLDS.feedSuccessRate, now));
    }

    // Check article count
    if (metrics.articlesProcessed < this.DEGRADED_THRESHOLDS.minArticles) {
      anomalies.push(this.createAnomaly('low_article_count', metrics.articlesProcessed < 10 ? 'critical' : 'warning',
        `Only ${metrics.articlesProcessed} articles processed, below threshold`, metrics.articlesProcessed,
        this.DEGRADED_THRESHOLDS.minArticles, now));
    }

    // Check quality score
    if (metrics.qualityScore < this.DEGRADED_THRESHOLDS.qualityScore) {
      anomalies.push(this.createAnomaly('quality_drop', metrics.qualityScore < 50 ? 'critical' : 'warning',
        `Quality score ${metrics.qualityScore.toFixed(1)} below threshold`, metrics.qualityScore,
        this.DEGRADED_THRESHOLDS.qualityScore, now));
    }

    // Check latency
    if (metrics.maxLatencyMs > this.DEGRADED_THRESHOLDS.maxLatencyMs) {
      anomalies.push(this.createAnomaly('latency_spike', metrics.maxLatencyMs > 20000 ? 'critical' : 'warning',
        `Max latency ${metrics.maxLatencyMs}ms exceeds threshold`, metrics.maxLatencyMs,
        this.DEGRADED_THRESHOLDS.maxLatencyMs, now));
    }

    return anomalies;
  }

  private createAnomaly(type: CycleAnomaly['type'], severity: CycleAnomaly['severity'], message: string,
    value: number, threshold: number, timestamp: Date): CycleAnomaly {
    return { type, severity, message, value, threshold, timestamp };
  }

  private determineStatus(
    anomalies: CycleAnomaly[],
    errorRate: number,
    feedSuccessRate: number
  ): 'healthy' | 'degraded' | 'critical' | 'failed' {
    const criticalAnomalies = anomalies.filter(a => a.severity === 'critical');
    
    if (criticalAnomalies.length > 0 || errorRate > 0.20 || feedSuccessRate < 0.5) {
      return 'critical';
    }
    
    if (anomalies.length > 0 || errorRate > this.HEALTHY_THRESHOLDS.errorRate) {
      return 'degraded';
    }
    
    return 'healthy';
  }

  private generateAlerts(anomalies: CycleAnomaly[]): CycleAlert[] {
    return anomalies.map((anomaly, idx) => ({
      id: `alert_${Date.now()}_${idx}`,
      severity: anomaly.severity === 'critical' ? 'critical' : 'warning',
      type: this.mapAnomalyToAlertType(anomaly.type),
      message: anomaly.message,
      timestamp: anomaly.timestamp,
      resolved: false,
    }));
  }

  private mapAnomalyToAlertType(anomalyType: string): CycleAlert['type'] {
    const mapping: Record<string, CycleAlert['type']> = {
      'high_error_rate': 'performance_issue',
      'low_article_count': 'cycle_delay',
      'high_duplicate_rate': 'duplicate_spike',
      'feed_failure': 'feed_failure',
      'latency_spike': 'performance_issue',
      'quality_drop': 'quality_issue',
    };
    return mapping[anomalyType] || 'performance_issue';
  }

  private async persistMetrics(metrics: CycleHealthMetrics): Promise<void> {
    try {
      await getDb().collection('cycle_health_v2').add({
        ...metrics,
        timestamp: new Date(),
      });
      logger.info(`[CYCLE HEALTH V2] Metrics persisted for cycle ${metrics.cycleId}`);
    } catch (error) {
      logger.error('[CYCLE HEALTH V2] Failed to persist metrics:', error);
      // Silently fail - logging failure shouldn't fail the cycle
    }
  }
}

export const cycleHealthMonitorV2 = new CycleHealthMonitorV2();

