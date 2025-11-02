# 12-Hour Cycle API Reference

## Base URL
```
https://us-central1-carriersignal-app.cloudfunctions.net
```

## Endpoints

### 1. Get Cycle Dashboard

**Endpoint**: `GET /getCycleDashboard`

**Description**: Real-time visibility into the 12-hour update cycle

**Response**:
```json
{
  "success": true,
  "dashboard": {
    "currentCycle": {
      "cycleId": "cycle_1234567890",
      "status": "running",
      "startTime": "2025-11-02T12:00:00Z",
      "progress": 45
    },
    "lastCycle": {
      "cycleId": "cycle_1234567800",
      "status": "completed",
      "startTime": "2025-11-02T00:00:00Z",
      "endTime": "2025-11-02T00:30:00Z",
      "duration": 1800000,
      "articlesProcessed": 250,
      "duplicatesDetected": 12,
      "successRate": 0.95
    },
    "nextCycleTime": "2025-11-03T00:00:00Z",
    "cycleHealth": {
      "isOnSchedule": true,
      "hoursSinceLastCycle": 11.5,
      "expectedInterval": 12,
      "status": "healthy"
    },
    "phases": [
      {
        "name": "refreshFeeds",
        "status": "completed",
        "startTime": "2025-11-02T12:00:00Z",
        "endTime": "2025-11-02T12:10:00Z",
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
  },
  "timestamp": "2025-11-02T12:30:00Z"
}
```

---

### 2. Get Deduplication Report

**Endpoint**: `GET /getDeduplicationReport`

**Description**: Comprehensive duplicate detection analysis

**Response**:
```json
{
  "success": true,
  "report": {
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
  },
  "timestamp": "2025-11-02T12:30:00Z"
}
```

---

### 3. Get 24-Hour Feed V2

**Endpoint**: `GET /get24HourFeedV2`

**Query Parameters**:
- `hours` (optional, default: 24) - Hours to look back
- `limit` (optional, default: 100) - Max articles to return

**Example**: `/get24HourFeedV2?hours=24&limit=50`

**Response**:
```json
{
  "success": true,
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
    },
    {
      "topic": "Flood",
      "count": 32,
      "score": 82.1
    }
  ],
  "articles": [
    {
      "id": "article_123",
      "title": "Major Hurricane Impacts Insurance Market",
      "url": "https://example.com/article",
      "source": "Insurance Journal",
      "category": "catastrophe",
      "publishedAt": "2025-11-02T11:30:00Z",
      "score": 92.5,
      "tags": ["Hurricane", "Catastrophe", "Claims"],
      "summary": "Article summary...",
      "sentiment": "negative"
    }
  ],
  "timestamp": "2025-11-02T12:30:00Z"
}
```

---

### 4. Get Trending Articles V2

**Endpoint**: `GET /getTrendingArticlesV2`

**Query Parameters**:
- `limit` (optional, default: 20) - Max articles to return
- `hours` (optional, default: 24) - Hours to look back

**Example**: `/getTrendingArticlesV2?limit=10&hours=24`

**Response**:
```json
{
  "success": true,
  "count": 10,
  "articles": [
    {
      "id": "article_123",
      "title": "Major Hurricane Impacts Insurance Market",
      "url": "https://example.com/article",
      "source": "Insurance Journal",
      "category": "catastrophe",
      "publishedAt": "2025-11-02T11:30:00Z",
      "score": 92.5,
      "tags": ["Hurricane", "Catastrophe"],
      "summary": "Article summary..."
    }
  ],
  "timestamp": "2025-11-02T12:30:00Z"
}
```

---

### 5. Get Feed Monitoring

**Endpoint**: `GET /getFeedMonitoring`

**Description**: Feed health status and performance metrics

**Response**:
```json
{
  "success": true,
  "summary": {
    "totalFeeds": 15,
    "healthyFeeds": 14,
    "degradedFeeds": 1,
    "failedFeeds": 0,
    "avgSuccessRate": "96.50%",
    "totalArticlesIngested": 5000,
    "totalDuplicatesDetected": 240
  },
  "feeds": [
    {
      "feedUrl": "https://www.insurancejournal.com/rss/news/national/",
      "feedName": "Insurance Journal - National",
      "lastFetchTime": "2025-11-02T12:00:00Z",
      "articlesIngested": 150,
      "duplicatesDetected": 12,
      "errorCount": 0,
      "successRate": 0.98,
      "avgLatency": 1200,
      "status": "healthy"
    }
  ],
  "timestamp": "2025-11-02T12:30:00Z"
}
```

---

### 6. Verify Cycle Completion

**Endpoint**: `GET /verifyCycleCompletion`

**Description**: Verify both refreshFeeds and comprehensiveIngest completed

**Response**:
```json
{
  "success": true,
  "verification": {
    "cycleId": "cycle_1234567800",
    "bothPhasesCompleted": true,
    "refreshFeedsCompleted": true,
    "comprehensiveIngestCompleted": true,
    "lastCycleTime": "2025-11-02T00:30:00Z",
    "hoursSinceLastCycle": 11.5
  },
  "completion": {
    "status": "completed",
    "articlesProcessed": 250,
    "duplicatesDetected": 12,
    "successRate": 0.95
  },
  "timestamp": "2025-11-02T12:30:00Z"
}
```

---

### 7. Get System Health

**Endpoint**: `GET /getSystemHealth`

**Description**: Overall system health status

**Response**:
```json
{
  "success": true,
  "health": {
    "status": "healthy",
    "timestamp": "2025-11-02T12:30:00Z",
    "lastCycleId": "cycle_1234567800",
    "lastCycleStatus": "completed",
    "lastCycleTime": "2025-11-02T00:30:00Z",
    "hoursSinceLastCycle": 11.5,
    "nextCycleTime": "2025-11-03T00:00:00Z",
    "articlesInDatabase": 5000,
    "averageSuccessRate": 0.95,
    "recentErrors": [],
    "feedHealth": {
      "Insurance Journal": {
        "status": "healthy",
        "lastSuccess": "2025-11-02T12:00:00Z"
      }
    },
    "alerts": []
  },
  "timestamp": "2025-11-02T12:30:00Z"
}
```

---

## Error Responses

All endpoints return error responses in this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "timestamp": "2025-11-02T12:30:00Z"
}
```

**HTTP Status Codes**:
- `200` - Success
- `400` - Bad request (invalid parameters)
- `500` - Server error

---

## Rate Limiting

- No rate limiting on monitoring endpoints
- All endpoints are CORS-enabled
- Recommended refresh interval: 30 seconds for dashboard

---

## Performance

| Endpoint | Response Time | Data Size |
|----------|---------------|-----------|
| getCycleDashboard | <500ms | ~5KB |
| getDeduplicationReport | <2s | ~2KB |
| get24HourFeedV2 | <3s | ~50KB |
| getTrendingArticlesV2 | <1s | ~20KB |
| getFeedMonitoring | <1s | ~10KB |
| verifyCycleCompletion | <500ms | ~2KB |
| getSystemHealth | <500ms | ~5KB |

---

## Examples

### Check if cycle is on schedule
```bash
curl https://us-central1-carriersignal-app.cloudfunctions.net/getCycleDashboard | \
  jq '.dashboard.cycleHealth.status'
```

### Get duplicate rate
```bash
curl https://us-central1-carriersignal-app.cloudfunctions.net/getDeduplicationReport | \
  jq '.report.duplicateRemovalRate'
```

### Get top 5 trending articles
```bash
curl "https://us-central1-carriersignal-app.cloudfunctions.net/getTrendingArticlesV2?limit=5" | \
  jq '.articles'
```

### Monitor feed health
```bash
curl https://us-central1-carriersignal-app.cloudfunctions.net/getFeedMonitoring | \
  jq '.summary'
```

