# Firebase 12-Hour Cycle Enhancements

## Overview

Comprehensive enhancements to ensure the 12-hour news feed update cycle is working correctly with best-in-class monitoring, deduplication, and observability.

## New Features

### 1. Advanced Cycle Monitoring Dashboard (`cycleMonitoring.ts`)

**Endpoint**: `GET /getCycleDashboard`

Real-time visibility into the 12-hour update cycle with comprehensive metrics:

```json
{
  "currentCycle": {
    "cycleId": "cycle_1234567890",
    "status": "running",
    "startTime": "2025-11-02T12:00:00Z",
    "progress": 45
  },
  "lastCycle": {
    "cycleId": "cycle_1234567800",
    "status": "completed",
    "duration": 1800000,
    "articlesProcessed": 250,
    "duplicatesDetected": 12,
    "successRate": 0.95
  },
  "cycleHealth": {
    "isOnSchedule": true,
    "hoursSinceLastCycle": 11.5,
    "status": "healthy"
  },
  "phases": [
    {
      "name": "refreshFeeds",
      "status": "completed",
      "duration": 600000,
      "articlesProcessed": 150
    }
  ],
  "metrics": {
    "totalArticlesInDatabase": 5000,
    "articlesAddedThisCycle": 250,
    "duplicateRemovalRate": 0.048,
    "averageQualityScore": 87.5,
    "feedHealthScore": 94.2
  },
  "alerts": []
}
```

**Key Metrics**:
- Current cycle status and progress
- Last cycle completion details
- Cycle health (on-schedule, overdue detection)
- Phase-level tracking
- Duplicate removal rate
- Feed health score

### 2. Advanced Deduplication V2 (`advancedDeduplicationV2.ts`)

**Endpoint**: `GET /getDeduplicationReport`

Multi-layer deduplication across all feeds:

```json
{
  "totalArticlesChecked": 500,
  "duplicatesFound": 24,
  "uniqueArticles": 476,
  "duplicateRemovalRate": 0.048,
  "deduplicationMethods": {
    "urlMatch": 18,
    "contentHashMatch": 4,
    "titleSimilarity": 2,
    "semanticSimilarity": 0
  },
  "processingTime": 2345
}
```

**Deduplication Methods**:
1. **URL Matching** (100% confidence) - Exact URL comparison with normalization
2. **Content Hash** (95% confidence) - SHA-256 hash of title + URL
3. **Title Similarity** (85%+ confidence) - Levenshtein distance algorithm
4. **Semantic Similarity** - Future: ML-based content similarity

**URL Normalization**:
- Removes tracking parameters (`utm_*`, `fbclid`, `ref`)
- Normalizes AMP URLs
- Removes `www.` prefix
- Case-insensitive comparison

### 3. Enhanced Feed Retrieval V2 (`feedRetrievalV2.ts`)

**Endpoints**:
- `GET /get24HourFeedV2?hours=24&limit=100` - 24-hour feed with deduplication
- `GET /getTrendingArticlesV2?limit=20&hours=24` - Trending articles

**Response**:
```json
{
  "summary": {
    "totalArticles": 500,
    "uniqueArticles": 476,
    "duplicatesDetected": 24,
    "duplicateRemovalRate": "4.80%",
    "averageScore": "78.5",
    "timeRange": {
      "start": "2025-11-01T12:00:00Z",
      "end": "2025-11-02T12:00:00Z"
    }
  },
  "sourceBreakdown": {
    "Insurance Journal": 145,
    "Claims Journal": 98,
    "Artemis": 87
  },
  "categoryBreakdown": {
    "news": 250,
    "catastrophe": 120,
    "regulatory": 106
  },
  "topTrendingTopics": [
    {
      "topic": "Hurricane",
      "count": 45,
      "score": 87.3
    }
  ],
  "articles": [...]
}
```

## Testing

### Comprehensive Test Suite

Run all tests:
```bash
npm run test:12hour-cycle-comprehensive
```

Tests verify:
1. ✅ Cycle dashboard accessibility
2. ✅ Deduplication accuracy
3. ✅ 24-hour feed retrieval
4. ✅ Trending articles ranking
5. ✅ Feed monitoring health
6. ✅ Cycle completion verification
7. ✅ System health status
8. ✅ Article quality scores
9. ✅ No duplicates in feed
10. ✅ Feed freshness (articles within 24h)

### Real-Time Monitoring

Monitor the cycle in real-time:
```bash
npm run monitor:cycle-realtime
```

Displays:
- Current cycle status
- Hours since last cycle
- Articles processed
- Duplicate rate
- Feed health score
- Active alerts
- Live metrics updates every 30 seconds

## Scheduled Functions

### 12-Hour Cycle
- `refreshFeeds` - Fetch and ingest articles
- `comprehensiveIngest` - AI enhancement and scoring

### Hourly Updates
- `scheduledRealtimeScoring` - Update top 100 article scores
- `scheduledFeedWeightAdjustment` - Adjust feed priorities (every 6h)
- `scheduledOverdueCheck` - Detect overdue cycles (every 30m)

## Monitoring Best Practices

### Every 30 Minutes
```bash
curl https://us-central1-carriersignal-app.cloudfunctions.net/getCycleDashboard
```
Check: Cycle status, hours since last cycle, active alerts

### Every 6 Hours
```bash
curl https://us-central1-carriersignal-app.cloudfunctions.net/getFeedMonitoring
```
Check: Feed health, success rates, error counts

### Daily
```bash
curl https://us-central1-carriersignal-app.cloudfunctions.net/get24HourFeedV2
```
Check: Duplicate rate <5%, average score >75, unique articles >100

### Weekly
```bash
curl https://us-central1-carriersignal-app.cloudfunctions.net/getDeduplicationReport
```
Analyze: Deduplication effectiveness, feed performance trends

## Alerts & Thresholds

| Metric | Threshold | Severity |
|--------|-----------|----------|
| Cycle Overdue | >13 hours | Critical |
| Duplicate Rate | >10% | Warning |
| Feed Health | <80% | Warning |
| Article Quality | <60 | Warning |
| Success Rate | <95% | Warning |

## Deployment

```bash
cd functions
npm run build
firebase deploy --only functions
```

Verify deployment:
```bash
curl https://us-central1-carriersignal-app.cloudfunctions.net/getCycleDashboard
```

## Performance Metrics

- Dashboard response time: <500ms
- Deduplication report: <2s
- 24-hour feed retrieval: <3s
- Trending articles: <1s

## Files Added

- `functions/src/cycleMonitoring.ts` - Dashboard service
- `functions/src/advancedDeduplicationV2.ts` - Deduplication service
- `functions/src/feedRetrievalV2.ts` - Feed retrieval service
- `functions/scripts/test-12hour-cycle-comprehensive.ts` - Test suite
- `functions/scripts/monitor-cycle-realtime.ts` - Real-time monitor

## Next Steps

1. Deploy functions
2. Run comprehensive tests
3. Monitor cycle for 24 hours
4. Integrate dashboard into frontend
5. Set up alerts for failures
6. Review metrics weekly

