# Firebase Functions 12-Hour Cycle Integration Guide

## Quick Start

### 1. Deploy Functions

```bash
cd functions
npm run build
firebase deploy --only functions
```

### 2. Test Endpoints

```bash
# Test cycle verification
curl https://us-central1-carriersignal-app.cloudfunctions.net/verifyCycleCompletion

# Test feed monitoring
curl https://us-central1-carriersignal-app.cloudfunctions.net/getFeedMonitoring

# Test 24-hour feed
curl "https://us-central1-carriersignal-app.cloudfunctions.net/get24HourFeed?hours=24&limit=50"

# Test trending articles
curl "https://us-central1-carriersignal-app.cloudfunctions.net/getTrendingArticles?limit=20"
```

## Architecture Overview

### 12-Hour Cycle Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    12-Hour Cycle                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Phase 1: refreshFeeds (0-15 min)                           │
│  ├─ Fetch from all RSS feeds                                │
│  ├─ Normalize URLs                                          │
│  ├─ Check for duplicates                                    │
│  └─ Store raw articles                                      │
│                                                               │
│  Phase 2: comprehensiveIngest (15-30 min)                   │
│  ├─ Extract article content                                 │
│  ├─ AI summarization & tagging                              │
│  ├─ Calculate initial scores                                │
│  └─ Store processed articles                                │
│                                                               │
│  Phase 3: scoring (30-40 min)                               │
│  ├─ Real-time score recalculation                           │
│  ├─ Trending topic detection                                │
│  ├─ Engagement metrics                                      │
│  └─ Update article scores                                   │
│                                                               │
│  Phase 4: deduplication (40-45 min)                         │
│  ├─ Semantic hash comparison                                │
│  ├─ Title similarity check                                  │
│  ├─ URL normalization                                       │
│  └─ Mark/remove duplicates                                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Monitoring & Verification

```
Every 30 minutes:
  └─ scheduledOverdueCheck
     ├─ Check for stalled cycles
     ├─ Trigger recovery if needed
     └─ Log cycle status

Every 1 hour:
  └─ scheduledRealtimeScoring
     ├─ Update top 100 article scores
     ├─ Boost trending articles
     └─ Record metrics

Every 6 hours:
  └─ scheduledFeedWeightAdjustment
     ├─ Analyze feed performance
     ├─ Adjust feed priorities
     └─ Update weights

Every 12 hours:
  ├─ refreshFeeds (scheduled)
  └─ comprehensiveIngest (scheduled)
```

## Firestore Schema

### monitoring_cycles Collection

```typescript
{
  cycleId: string;
  startTime: Timestamp;
  endTime?: Timestamp;
  status: 'running' | 'completed' | 'failed';
  metrics: {
    timestamp: Timestamp;
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
  };
  phases: [
    {
      name: 'refreshFeeds' | 'comprehensiveIngest' | 'scoring' | 'deduplication';
      status: 'pending' | 'running' | 'completed' | 'failed';
      startTime?: Timestamp;
      endTime?: Timestamp;
      duration?: number;
      articlesProcessed?: number;
      error?: string;
    }
  ];
  duplicatesDetected: number;
  duplicateRemovalRate: number;
  alerts: [
    {
      id: string;
      severity: 'info' | 'warning' | 'critical';
      message: string;
      timestamp: Timestamp;
      resolved: boolean;
    }
  ];
}
```

### feed_metrics Collection

```typescript
{
  feedUrl: string;
  feedName: string;
  lastUpdated: Timestamp;
  articlesPerCycle: number;
  duplicatesDetected: number;
  errorCount: number;
  successRate: number;
  avgLatency: number;
  qualityScore: number;
  relevanceScore: number;
  lastError?: string;
}
```

### newsArticles Collection (Enhanced)

```typescript
{
  // Existing fields
  title: string;
  url: string;
  source: string;
  publishedAt: Timestamp;
  summary: string;
  score: number;
  tags: string[];
  category: string;
  
  // New deduplication fields
  normalizedUrl: string;
  semanticHash: string;
  isDuplicate: boolean;
  duplicateOf?: string;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Monitoring Dashboard Integration

### Frontend Components

Add to your React app:

```typescript
import { useEffect, useState } from 'react';

export function CycleMonitor() {
  const [verification, setVerification] = useState(null);
  const [feeds, setFeeds] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const cycleRes = await fetch('/api/verifyCycleCompletion');
      const feedRes = await fetch('/api/getFeedMonitoring');
      
      setVerification(await cycleRes.json());
      setFeeds(await feedRes.json());
    };

    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000); // Every 5 minutes
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2>12-Hour Cycle Status</h2>
      {verification && (
        <div>
          <p>Status: {verification.verification.status}</p>
          <p>Quality Score: {verification.verification.qualityScore}/100</p>
          <p>Articles: {verification.verification.articlesProcessed}</p>
          <p>Duplicates Removed: {verification.verification.duplicatesRemoved}</p>
        </div>
      )}
    </div>
  );
}
```

## Troubleshooting

### Cycle Not Completing

1. Check `verifyCycleCompletion` endpoint
2. Look for incomplete phases
3. Check Firebase logs for errors
4. Verify feed sources are accessible

### High Duplicate Rate

1. Check `get24HourFeed` endpoint
2. Review duplicate removal rate
3. Verify URL normalization is working
4. Check semantic hash calculation

### Feed Failures

1. Use `getFeedMonitoring` endpoint
2. Check individual feed status
3. Verify feed URLs are valid
4. Check network connectivity

### Performance Issues

1. Monitor cycle duration
2. Check average latency per feed
3. Review AI scoring latency
4. Optimize Firestore queries

## Performance Targets

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Cycle Duration | <45 min | >50 min |
| Success Rate | >95% | <80% |
| Duplicate Rate | <5% | >10% |
| Feed Availability | >98% | <90% |
| Avg Latency | <2s | >5s |
| Quality Score | >90 | <70 |

## Maintenance

### Weekly Tasks

- Review cycle completion rates
- Check feed health metrics
- Verify duplicate detection accuracy
- Monitor error logs

### Monthly Tasks

- Analyze trending topics
- Review feed performance
- Adjust feed weights if needed
- Update feed sources if necessary

### Quarterly Tasks

- Performance optimization review
- Duplicate detection algorithm tuning
- Feed source evaluation
- System capacity planning

## Support & Debugging

### Enable Debug Logging

```typescript
// In functions/src/index.ts
const DEBUG = true;

if (DEBUG) {
  console.log('[DEBUG] Cycle started:', cycleId);
  console.log('[DEBUG] Phase completed:', phaseName, duration);
}
```

### Export Metrics

```bash
# Export cycle metrics
firebase firestore:export gs://your-bucket/cycles --collection-ids=monitoring_cycles

# Export feed metrics
firebase firestore:export gs://your-bucket/feeds --collection-ids=feed_metrics
```

## Next Steps

1. Deploy functions: `firebase deploy --only functions`
2. Test endpoints with provided curl commands
3. Monitor cycle completion for 24 hours
4. Integrate monitoring dashboard into frontend
5. Set up alerts for failures
6. Review metrics weekly

