/**
 * Health Dashboard Component
 * Displays system health metrics and ingestion status
 */

import React, { useState, useEffect } from 'react';
import { Activity, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { logger } from '../utils/logger';

interface HealthMetrics {
  ingestionSuccess: number;
  articlesProcessed: number;
  clustersCreated: number;
  avgProcessingTime: number;
  lastIngestionTime: number;
  errorRate: number;
}

export const HealthDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);

        // Fetch ingestion metrics from last 24 hours
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const q = query(
          collection(db, 'ingestionMetrics'),
          where('timestamp', '>', oneDayAgo),
          orderBy('timestamp', 'desc'),
          limit(100)
        );

        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map(doc => doc.data());

        if (docs.length === 0) {
          setMetrics(null);
          setLoading(false);
          return;
        }

        // Calculate metrics
        const totalProcessed = docs.reduce((sum, doc) => sum + (doc.articlesProcessed || 0), 0);
        const totalErrors = docs.reduce((sum, doc) => sum + (doc.errors || 0), 0);
        const totalAttempts = totalProcessed + totalErrors;
        const successRate = totalAttempts > 0 ? (totalProcessed / totalAttempts) * 100 : 0;
        const avgDuration = docs.reduce((sum, doc) => sum + (doc.duration || 0), 0) / docs.length;

        setMetrics({
          ingestionSuccess: successRate,
          articlesProcessed: totalProcessed,
          clustersCreated: docs.length,
          avgProcessingTime: avgDuration,
          lastIngestionTime: docs[0]?.timestamp || Date.now(),
          errorRate: (totalErrors / totalAttempts) * 100,
        });

        logger.info('HealthDashboard', 'Metrics fetched', { successRate, totalProcessed });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch metrics';
        setError(message);
        logger.error('HealthDashboard', message);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-600">Loading health metrics...</div>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle size={20} />
          <span>{error || 'No metrics available'}</span>
        </div>
      </div>
    );
  }

  const isHealthy = metrics.ingestionSuccess >= 99.5;
  const statusColor = isHealthy ? 'text-green-600' : 'text-yellow-600';
  const statusBg = isHealthy ? 'bg-green-50' : 'bg-yellow-50';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Activity size={20} />
          System Health
        </h2>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusBg}`}>
          {isHealthy ? (
            <CheckCircle size={16} className={statusColor} />
          ) : (
            <AlertCircle size={16} className={statusColor} />
          )}
          <span className={`text-sm font-medium ${statusColor}`}>
            {isHealthy ? 'Healthy' : 'Degraded'}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Ingestion Success Rate */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-600 font-medium mb-1">Ingestion Success</p>
          <p className="text-2xl font-bold text-gray-900">{metrics.ingestionSuccess.toFixed(2)}%</p>
          <p className="text-xs text-gray-500 mt-1">Target: 99.5%</p>
        </div>

        {/* Articles Processed */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-600 font-medium mb-1">Articles (24h)</p>
          <p className="text-2xl font-bold text-gray-900">{metrics.articlesProcessed.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
        </div>

        {/* Avg Processing Time */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-600 font-medium mb-1">Avg Processing</p>
          <p className="text-2xl font-bold text-gray-900">{metrics.avgProcessingTime.toFixed(0)}ms</p>
          <p className="text-xs text-gray-500 mt-1">Per batch</p>
        </div>

        {/* Error Rate */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-600 font-medium mb-1">Error Rate</p>
          <p className={`text-2xl font-bold ${metrics.errorRate > 0.5 ? 'text-red-600' : 'text-green-600'}`}>
            {metrics.errorRate.toFixed(2)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
        </div>
      </div>

      {/* Last Ingestion */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600 font-medium">
          Last ingestion: {new Date(metrics.lastIngestionTime).toLocaleString()}
        </p>
      </div>

      {/* Status Indicators */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700">Core Web Vitals Budget</span>
          <span className={`font-medium ${metrics.avgProcessingTime < 2500 ? 'text-green-600' : 'text-red-600'}`}>
            {metrics.avgProcessingTime < 2500 ? '✓ Pass' : '✗ Fail'}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700">Ingestion SLA (99.5%)</span>
          <span className={`font-medium ${metrics.ingestionSuccess >= 99.5 ? 'text-green-600' : 'text-red-600'}`}>
            {metrics.ingestionSuccess >= 99.5 ? '✓ Pass' : '✗ Fail'}
          </span>
        </div>
      </div>
    </div>
  );
};

