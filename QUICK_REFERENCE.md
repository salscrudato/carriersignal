# Quick Reference - 12-Hour Cycle Verification

## Endpoints

### 1. Verify Cycle Completion
```bash
GET /verifyCycleCompletion
```
**Returns**: Cycle status, phase completion, quality score, alerts

**Key Fields**:
- `status`: pending | in_progress | completed | failed | partial
- `bothPhasesCompleted`: true/false
- `qualityScore`: 0-100
- `articlesProcessed`: number
- `duplicatesRemoved`: number

### 2. Feed Monitoring
```bash
GET /getFeedMonitoring
```
**Returns**: Real-time feed health, per-feed metrics

**Key Fields**:
- `summary.healthyFeeds`: number
- `summary.avgSuccessRate`: percentage
- `feeds[].status`: healthy | degraded | failed
- `feeds[].successRate`: 0-1

### 3. 24-Hour Feed
```bash
GET /get24HourFeed?hours=24&limit=50
```
**Returns**: All articles from past 24 hours, deduplicated

**Key Fields**:
- `summary.totalArticles`: number
- `summary.uniqueArticles`: number
- `summary.duplicateRemovalRate`: percentage
- `articles[]`: Article objects
- `topTrendingTopics`: string[]

### 4. Trending Articles
```bash
GET /getTrendingArticles?limit=20&hours=24
```
**Returns**: Top trending articles sorted by score

**Key Fields**:
- `count`: number
- `articles[]`: Article objects sorted by score

## Monitoring Checklist

### Every 30 Minutes
- [ ] Check `verifyCycleCompletion` endpoint
- [ ] Verify `bothPhasesCompleted` is true
- [ ] Check for alerts

### Every 6 Hours
- [ ] Review `getFeedMonitoring` summary
- [ ] Check for degraded/failed feeds
- [ ] Verify average success rate >95%

### Daily
- [ ] Analyze `get24HourFeed` metrics
- [ ] Check duplicate removal rate <5%
- [ ] Review trending topics
- [ ] Check quality score >90

### Weekly
- [ ] Export cycle metrics
- [ ] Analyze feed performance trends
- [ ] Review error logs
- [ ] Adjust feed weights if needed

## Troubleshooting

### Cycle Not Completing
1. Check `verifyCycleCompletion` for incomplete phases
2. Look for alerts in response
3. Check Firebase logs: `firebase functions:log`
4. Verify feed sources are accessible

### High Duplicate Rate
1. Check `get24HourFeed` duplicate removal rate
2. If >10%, review URL normalization
3. Check semantic hash calculation
4. Verify feed sources aren't duplicating content

### Feed Failures
1. Use `getFeedMonitoring` to identify failing feeds
2. Check feed URL is valid
3. Verify network connectivity
4. Check feed format (RSS/Atom)

### Low Quality Score
1. Check success rate in cycle verification
2. Review error count
3. Check duplicate detection rate
4. Verify AI scoring is working

## Performance Targets

| Metric | Target | Alert |
|--------|--------|-------|
| Cycle Duration | <45 min | >50 min |
| Success Rate | >95% | <80% |
| Duplicate Rate | <5% | >10% |
| Quality Score | >90 | <70 |
| Feed Availability | >98% | <90% |

## API Response Examples

### Cycle Verification Success
```json
{
  "success": true,
  "verification": {
    "cycleId": "cycle-2024-11-02-12h",
    "status": "completed",
    "bothPhasesCompleted": true,
    "qualityScore": 94.5,
    "articlesProcessed": 1250,
    "duplicatesRemoved": 45
  },
  "completion": {
    "isComplete": true,
    "isOverdue": false,
    "hoursElapsed": 11.8
  }
}
```

### Feed Monitoring Summary
```json
{
  "success": true,
  "summary": {
    "totalFeeds": 15,
    "healthyFeeds": 14,
    "degradedFeeds": 1,
    "failedFeeds": 0,
    "avgSuccessRate": "98.5%",
    "totalArticlesIngested": 2500,
    "totalDuplicatesDetected": 120
  }
}
```

### 24-Hour Feed Summary
```json
{
  "success": true,
  "summary": {
    "totalArticles": 1250,
    "uniqueArticles": 1205,
    "duplicatesDetected": 45,
    "duplicateRemovalRate": "3.6%",
    "averageScore": "72.3"
  },
  "topTrendingTopics": ["hurricane", "claims", "insurance"]
}
```

## Deployment Commands

```bash
# Build functions
cd functions && npm run build

# Deploy
firebase deploy --only functions

# View logs
firebase functions:log

# List functions
firebase functions:list

# Test endpoint
curl https://us-central1-carriersignal-app.cloudfunctions.net/verifyCycleCompletion
```

## Key Files

| File | Purpose |
|------|---------|
| `functions/src/monitoring.ts` | Enhanced monitoring with phases |
| `functions/src/cycleVerification.ts` | Cycle verification service |
| `functions/src/advancedDeduplication.ts` | Duplicate detection |
| `functions/src/feedRetrieval.ts` | 24-hour feed retrieval |
| `functions/src/index.ts` | HTTP endpoints |
| `functions/scripts/test-12hour-cycle.ts` | Test suite |

## Alert Severity Levels

| Level | Condition | Action |
|-------|-----------|--------|
| Critical | Success <50%, Feed failure >20% | Immediate investigation |
| Warning | Success 50-80%, Latency >5s | Review and monitor |
| Info | Status updates, Phase completion | Log and track |

## Duplicate Detection Layers

1. **Exact URL Match** (Confidence: 1.0)
   - Normalized URL comparison
   - Removes tracking parameters

2. **Semantic Hash** (Confidence: 0.95)
   - Key term extraction
   - Content-based matching

3. **Title Similarity** (Confidence: 0.88-0.99)
   - Levenshtein distance
   - Threshold: 0.88

4. **URL Similarity** (Confidence: 0.9-0.99)
   - Handles redirects
   - Threshold: 0.9

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Cycle overdue | Check Firebase logs, verify feed sources |
| High duplicates | Review URL normalization, check feeds |
| Feed failures | Verify feed URLs, check network |
| Low quality score | Check success rate, review errors |
| Missing articles | Verify feed sources are active |

## Next Steps

1. Deploy functions: `firebase deploy --only functions`
2. Test endpoints with curl commands
3. Monitor cycle for 24 hours
4. Integrate frontend components
5. Set up alerts
6. Review metrics weekly

## Support Resources

- Firebase Functions Docs: https://firebase.google.com/docs/functions
- Firestore Docs: https://firebase.google.com/docs/firestore
- Test Script: `functions/scripts/test-12hour-cycle.ts`
- Documentation: `CYCLE_VERIFICATION_ENHANCEMENTS.md`
- Integration Guide: `FIREBASE_CYCLE_INTEGRATION.md`

