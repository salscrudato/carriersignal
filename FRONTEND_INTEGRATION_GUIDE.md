# Frontend Integration Guide - 12-Hour Cycle Monitoring

## Overview

Integrate the new Firebase Functions endpoints into your React frontend to display real-time cycle status, feed monitoring, and article feeds.

## Setup

### 1. Create API Service

```typescript
// src/services/cycleApi.ts
import { httpsCallable, getFunctions } from 'firebase/functions';

const functions = getFunctions();

export const cycleApi = {
  async verifyCycleCompletion() {
    const response = await fetch(
      'https://us-central1-carriersignal-app.cloudfunctions.net/verifyCycleCompletion'
    );
    return response.json();
  },

  async getFeedMonitoring() {
    const response = await fetch(
      'https://us-central1-carriersignal-app.cloudfunctions.net/getFeedMonitoring'
    );
    return response.json();
  },

  async get24HourFeed(hours = 24, limit = 100) {
    const response = await fetch(
      `https://us-central1-carriersignal-app.cloudfunctions.net/get24HourFeed?hours=${hours}&limit=${limit}`
    );
    return response.json();
  },

  async getTrendingArticles(limit = 20, hours = 24) {
    const response = await fetch(
      `https://us-central1-carriersignal-app.cloudfunctions.net/getTrendingArticles?limit=${limit}&hours=${hours}`
    );
    return response.json();
  },
};
```

## Components

### 1. Cycle Status Monitor

```typescript
// src/components/CycleStatusMonitor.tsx
import { useEffect, useState } from 'react';
import { cycleApi } from '../services/cycleApi';

export function CycleStatusMonitor() {
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await cycleApi.verifyCycleCompletion();
        setVerification(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5 * 60 * 1000); // Every 5 minutes
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading cycle status...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!verification) return <div>No data available</div>;

  const { verification: v, completion: c } = verification;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-bold mb-4">12-Hour Cycle Status</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Status</p>
          <p className="text-lg font-semibold">{v.status.toUpperCase()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Quality Score</p>
          <p className="text-lg font-semibold">{v.qualityScore.toFixed(1)}/100</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Hours Elapsed</p>
          <p className="text-lg font-semibold">{c.hoursElapsed}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Overdue</p>
          <p className={`text-lg font-semibold ${c.isOverdue ? 'text-red-500' : 'text-green-500'}`}>
            {c.isOverdue ? 'YES' : 'NO'}
          </p>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-2">Phase Status</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>refreshFeeds</span>
            <span className={v.refreshFeedsCompleted ? '✅' : '❌'}>
              {v.refreshFeedsCompleted ? 'Completed' : 'Pending'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>comprehensiveIngest</span>
            <span className={v.comprehensiveIngestCompleted ? '✅' : '❌'}>
              {v.comprehensiveIngestCompleted ? 'Completed' : 'Pending'}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t pt-4 mt-4">
        <h3 className="font-semibold mb-2">Metrics</h3>
        <div className="space-y-1 text-sm">
          <p>Articles Processed: {v.articlesProcessed}</p>
          <p>Duplicates Removed: {v.duplicatesRemoved}</p>
          <p>Total Duration: {v.totalDuration}ms</p>
        </div>
      </div>

      {v.alerts.length > 0 && (
        <div className="border-t pt-4 mt-4">
          <h3 className="font-semibold mb-2">Alerts</h3>
          {v.alerts.map((alert, i) => (
            <div key={i} className={`text-sm p-2 rounded ${
              alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
              alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {alert.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 2. Feed Monitoring Dashboard

```typescript
// src/components/FeedMonitoringDashboard.tsx
import { useEffect, useState } from 'react';
import { cycleApi } from '../services/cycleApi';

export function FeedMonitoringDashboard() {
  const [monitoring, setMonitoring] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMonitoring = async () => {
      try {
        const data = await cycleApi.getFeedMonitoring();
        setMonitoring(data);
      } finally {
        setLoading(false);
      }
    };

    fetchMonitoring();
    const interval = setInterval(fetchMonitoring, 10 * 60 * 1000); // Every 10 minutes
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading feed monitoring...</div>;
  if (!monitoring) return <div>No data available</div>;

  const { summary, feeds } = monitoring;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-bold mb-4">Feed Monitoring</h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded">
          <p className="text-sm text-gray-600">Healthy Feeds</p>
          <p className="text-2xl font-bold text-green-600">{summary.healthyFeeds}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded">
          <p className="text-sm text-gray-600">Degraded Feeds</p>
          <p className="text-2xl font-bold text-yellow-600">{summary.degradedFeeds}</p>
        </div>
        <div className="bg-red-50 p-4 rounded">
          <p className="text-sm text-gray-600">Failed Feeds</p>
          <p className="text-2xl font-bold text-red-600">{summary.failedFeeds}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">Average Success Rate</p>
        <p className="text-lg font-semibold">{summary.avgSuccessRate}</p>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-3">Feed Details</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {feeds.map((feed, i) => (
            <div key={i} className="border rounded p-3 text-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium">{feed.feedName}</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  feed.status === 'healthy' ? 'bg-green-100 text-green-800' :
                  feed.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {feed.status.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <p>Success Rate: {(feed.successRate * 100).toFixed(1)}%</p>
                <p>Latency: {feed.avgLatency.toFixed(0)}ms</p>
                <p>Articles: {feed.articlesIngested}</p>
                <p>Duplicates: {feed.duplicatesDetected}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 3. 24-Hour Feed Display

```typescript
// src/components/Feed24Hour.tsx
import { useEffect, useState } from 'react';
import { cycleApi } from '../services/cycleApi';

export function Feed24Hour() {
  const [feed, setFeed] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const data = await cycleApi.get24HourFeed(24, 50);
        setFeed(data);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  if (loading) return <div>Loading feed...</div>;
  if (!feed) return <div>No data available</div>;

  const { summary, articles, sourceBreakdown, topTrendingTopics } = feed;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-4">24-Hour Feed Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Articles</p>
            <p className="text-2xl font-bold">{summary.totalArticles}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Unique Articles</p>
            <p className="text-2xl font-bold">{summary.uniqueArticles}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Duplicates</p>
            <p className="text-2xl font-bold text-orange-600">{summary.duplicatesDetected}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Removal Rate</p>
            <p className="text-2xl font-bold">{summary.duplicateRemovalRate}</p>
          </div>
        </div>
      </div>

      {/* Trending Topics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-bold mb-3">Trending Topics</h3>
        <div className="flex flex-wrap gap-2">
          {topTrendingTopics.map((topic, i) => (
            <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Articles */}
      <div className="space-y-3">
        {articles.map((article, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg flex-1">{article.title}</h3>
              <span className="text-sm font-bold text-blue-600 ml-2">{article.score.toFixed(1)}</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{article.source}</p>
            {article.summary && (
              <p className="text-sm text-gray-700 mb-3">{article.summary.substring(0, 150)}...</p>
            )}
            <div className="flex justify-between items-center">
              <div className="flex gap-2 flex-wrap">
                {article.tags.slice(0, 3).map((tag, j) => (
                  <span key={j} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <a href={article.url} target="_blank" rel="noopener noreferrer" 
                 className="text-blue-600 hover:underline text-sm">
                Read →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Usage in App

```typescript
// src/App.tsx
import { CycleStatusMonitor } from './components/CycleStatusMonitor';
import { FeedMonitoringDashboard } from './components/FeedMonitoringDashboard';
import { Feed24Hour } from './components/Feed24Hour';

export function App() {
  return (
    <div className="p-6 space-y-6">
      <CycleStatusMonitor />
      <FeedMonitoringDashboard />
      <Feed24Hour />
    </div>
  );
}
```

## Error Handling

```typescript
// Add error boundary
import { ReactNode } from 'react';

export function ErrorBoundary({ children }: { children: ReactNode }) {
  const [error, setError] = useState(null);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4">
        <p className="text-red-800">Error: {error}</p>
        <button onClick={() => setError(null)} className="text-red-600 underline mt-2">
          Dismiss
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
```

## Performance Tips

1. Use React.memo for components
2. Implement pagination for large feeds
3. Cache API responses
4. Use virtual scrolling for long lists
5. Debounce refresh intervals

## Deployment

Deploy frontend with functions:
```bash
npm run build
firebase deploy
```

## Support

For issues:
1. Check browser console for errors
2. Verify API endpoints are accessible
3. Check Firebase logs
4. Review network requests in DevTools

