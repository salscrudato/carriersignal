/**
 * Feed Health Admin Panel
 * Monitors RSS feed health, circuit breaker status, and processing metrics
 */

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { GlassCard } from './primitives/GlassCard';
import { Spinner } from './primitives/Spinner';

interface FeedHealthData {
  url: string;
  successCount: number;
  failureCount: number;
  successRate: string;
  lastSuccess?: string;
  lastFailure?: string;
  lastError?: string;
  status: 'HEALTHY' | 'UNHEALTHY' | 'UNKNOWN';
}

interface FeedHealthResponse {
  success: boolean;
  timestamp: string;
  totalFeeds: number;
  monitoredFeeds: number;
  feeds: FeedHealthData[];
}

export function FeedHealthPanel() {
  const [data, setData] = useState<FeedHealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchFeedHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/feedHealthReport');
      if (!response.ok) throw new Error('Failed to fetch feed health');
      const result = await response.json();
      setData(result);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedHealth();
    const interval = setInterval(fetchFeedHealth, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <GlassCard variant="premium" className="w-full">
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard variant="premium" className="w-full border-red-200">
        <div className="flex items-center gap-3 text-red-600">
          <AlertTriangle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      </GlassCard>
    );
  }

  if (!data) return null;

  const healthyCount = data.feeds.filter(f => f.status === 'HEALTHY').length;
  const unhealthyCount = data.feeds.filter(f => f.status === 'UNHEALTHY').length;

  return (
    <div className="space-y-4">
      <GlassCard variant="premium" className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#0F172A]">Feed Health Monitor</h3>
          <button
            onClick={fetchFeedHealth}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-[#E8F2FF] transition-colors disabled:opacity-50"
            aria-label="Refresh feed health"
          >
            <RefreshCw size={18} className={`text-[#5AA6FF] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-3 bg-[#E8F2FF]/50 rounded-lg">
            <p className="text-xs text-[#64748B] mb-1">Total Feeds</p>
            <p className="text-2xl font-bold text-[#5AA6FF]">{data.totalFeeds}</p>
          </div>
          <div className="p-3 bg-[#DCFCE7]/50 rounded-lg">
            <p className="text-xs text-[#64748B] mb-1">Healthy</p>
            <p className="text-2xl font-bold text-[#16A34A]">{healthyCount}</p>
          </div>
          <div className="p-3 bg-[#FEE2E2]/50 rounded-lg">
            <p className="text-xs text-[#64748B] mb-1">Unhealthy</p>
            <p className="text-2xl font-bold text-[#EF4444]">{unhealthyCount}</p>
          </div>
        </div>

        {/* Last Refresh */}
        {lastRefresh && (
          <p className="text-xs text-[#94A3B8] mb-4">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        )}
      </GlassCard>

      {/* Feed List */}
      <div className="space-y-2">
        {data.feeds.map((feed) => (
          <FeedHealthRow key={feed.url} feed={feed} />
        ))}
      </div>
    </div>
  );
}

function FeedHealthRow({ feed }: { feed: FeedHealthData }) {
  const isHealthy = feed.status === 'HEALTHY';
  const statusIcon = isHealthy ? (
    <CheckCircle size={16} className="text-[#16A34A]" />
  ) : (
    <AlertTriangle size={16} className="text-[#EF4444]" />
  );

  return (
    <GlassCard variant="default" className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {statusIcon}
            <p className="text-sm font-semibold text-[#0F172A] truncate">{feed.url}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-[#64748B]">
            <p>Success: {feed.successCount}</p>
            <p>Failure: {feed.failureCount}</p>
            <p>Rate: {feed.successRate}</p>
            {feed.lastSuccess && (
              <p className="flex items-center gap-1">
                <Clock size={12} />
                {new Date(feed.lastSuccess).toLocaleTimeString()}
              </p>
            )}
          </div>
          {feed.lastError && (
            <p className="text-xs text-[#EF4444] mt-2 truncate">Error: {feed.lastError}</p>
          )}
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
          isHealthy
            ? 'bg-[#DCFCE7] text-[#16A34A]'
            : 'bg-[#FEE2E2] text-[#EF4444]'
        }`}>
          {feed.status}
        </div>
      </div>
    </GlassCard>
  );
}

