# 12-Hour Cycle Implementation Guide

## Quick Start

### 1. Deploy Functions

```bash
cd functions
npm run build
firebase deploy --only functions
```

### 2. Verify Deployment

```bash
# Check cycle dashboard
curl https://us-central1-carriersignal-app.cloudfunctions.net/getCycleDashboard

# Check deduplication
curl https://us-central1-carriersignal-app.cloudfunctions.net/getDeduplicationReport

# Check 24-hour feed
curl https://us-central1-carriersignal-app.cloudfunctions.net/get24HourFeedV2
```

## New Endpoints

### Dashboard & Monitoring

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/getCycleDashboard` | GET | Real-time cycle status and metrics |
| `/getDeduplicationReport` | GET | Duplicate detection analysis |
| `/get24HourFeedV2` | GET | 24-hour articles with deduplication |
| `/getTrendingArticlesV2` | GET | Top trending articles |
| `/getFeedMonitoring` | GET | Feed health status |
| `/verifyCycleCompletion` | GET | Verify both phases completed |
| `/getSystemHealth` | GET | Overall system health |

### Query Parameters

**get24HourFeedV2**:
- `hours` (default: 24) - Hours to look back
- `limit` (default: 100) - Max articles to return

**getTrendingArticlesV2**:
- `limit` (default: 20) - Max articles to return
- `hours` (default: 24) - Hours to look back

## Testing

### Run All Tests

```bash
npm run test:12hour-cycle-comprehensive
```

Tests include:
- Cycle dashboard accessibility
- Deduplication accuracy
- 24-hour feed retrieval
- Trending articles ranking
- Feed monitoring health
- Cycle completion verification
- System health status
- Article quality scores
- Duplicate detection
- Feed freshness

### Real-Time Monitoring

```bash
npm run monitor:cycle-realtime
```

Displays live metrics every 30 seconds:
- Cycle status (healthy/degraded/overdue)
- Hours since last cycle
- Articles processed
- Duplicate rate
- Feed health score
- Active alerts

## Monitoring Schedule

### Every 30 Minutes
Check cycle status and alerts:
```bash
curl https://us-central1-carriersignal-app.cloudfunctions.net/getCycleDashboard | jq '.dashboard.cycleHealth'
```

### Every 6 Hours
Review feed health:
```bash
curl https://us-central1-carriersignal-app.cloudfunctions.net/getFeedMonitoring | jq '.summary'
```

### Daily
Verify feed quality:
```bash
curl https://us-central1-carriersignal-app.cloudfunctions.net/get24HourFeedV2 | jq '.summary'
```

### Weekly
Analyze deduplication:
```bash
curl https://us-central1-carriersignal-app.cloudfunctions.net/getDeduplicationReport | jq '.report'
```

## Key Metrics

### Cycle Health
- **Status**: healthy/degraded/overdue
- **Hours Since Last Cycle**: Should be ≤12.5
- **Expected Interval**: 12 hours

### Article Quality
- **Duplicate Rate**: <5% (target)
- **Average Score**: >75 (target)
- **Unique Articles**: >100 per cycle (target)

### Feed Health
- **Feed Health Score**: >90% (target)
- **Success Rate**: >95% (target)
- **Failed Feeds**: <20% (target)

## Troubleshooting

### Cycle Overdue (>13 hours)

1. Check scheduler jobs:
```bash
gcloud scheduler jobs list --location=us-central1 --project=carriersignal-app
```

2. Check function logs:
```bash
firebase functions:log --limit=50
```

3. Manually trigger refresh:
```bash
curl -X POST https://us-central1-carriersignal-app.cloudfunctions.net/refreshFeedsManual
```

### High Duplicate Rate (>10%)

1. Check deduplication report:
```bash
curl https://us-central1-carriersignal-app.cloudfunctions.net/getDeduplicationReport
```

2. Review feed sources for overlaps
3. Adjust deduplication thresholds if needed

### Low Article Quality (<60)

1. Check feed sources are active
2. Verify AI scoring is running
3. Review article content extraction

## Architecture

### Services

**cycleMonitoring.ts**
- Tracks 12-hour cycle status
- Monitors phase completion
- Calculates health metrics
- Generates alerts

**advancedDeduplicationV2.ts**
- Multi-layer deduplication
- URL normalization
- Content hashing
- Title similarity matching

**feedRetrievalV2.ts**
- 24-hour feed retrieval
- Duplicate removal
- Trending article ranking
- Topic extraction

### Firestore Collections

- `monitoring_cycles` - Cycle execution records
- `newsArticles` - Article database
- `feed_health` - Feed status tracking
- `schedule_state` - Scheduler state

## Performance

- Dashboard response: <500ms
- Dedup report: <2s
- 24-hour feed: <3s
- Trending articles: <1s

## Files Added

```
functions/src/
  ├── cycleMonitoring.ts
  ├── advancedDeduplicationV2.ts
  └── feedRetrievalV2.ts

functions/scripts/
  ├── test-12hour-cycle-comprehensive.ts
  └── monitor-cycle-realtime.ts
```

## Next Steps

1. ✅ Deploy functions
2. ✅ Run comprehensive tests
3. ⏳ Monitor cycle for 24 hours
4. ⏳ Integrate dashboard into frontend
5. ⏳ Set up alerts for failures
6. ⏳ Review metrics weekly

## Support

For issues or questions:
1. Check function logs: `firebase functions:log`
2. Review monitoring dashboard
3. Run comprehensive tests
4. Check Firestore collections for data

