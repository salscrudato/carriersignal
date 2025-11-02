# Quick Start: 12-Hour Cycle Enhancements

## 🚀 Deploy in 3 Steps

### Step 1: Build
```bash
cd functions
npm run build
```
✅ Expected: No errors

### Step 2: Deploy
```bash
firebase deploy --only functions
```
✅ Expected: All functions deployed

### Step 3: Verify
```bash
curl https://us-central1-carriersignal-app.cloudfunctions.net/getCycleDashboard
```
✅ Expected: Valid JSON response

## 📊 Monitor the Cycle

### Real-Time Dashboard
```bash
npm run monitor:cycle-realtime
```
Shows live metrics every 30 seconds:
- Cycle status (healthy/degraded/overdue)
- Hours since last cycle
- Articles processed
- Duplicate rate
- Feed health score

### Check Status Manually
```bash
# Cycle dashboard
curl https://us-central1-carriersignal-app.cloudfunctions.net/getCycleDashboard | jq '.dashboard.cycleHealth'

# Deduplication report
curl https://us-central1-carriersignal-app.cloudfunctions.net/getDeduplicationReport | jq '.report'

# 24-hour feed
curl https://us-central1-carriersignal-app.cloudfunctions.net/get24HourFeedV2 | jq '.summary'
```

## 🧪 Run Tests

### Comprehensive Test Suite
```bash
npm run test:12hour-cycle-comprehensive
```
Runs 10 tests:
1. Cycle dashboard accessibility
2. Deduplication accuracy
3. 24-hour feed retrieval
4. Trending articles ranking
5. Feed monitoring health
6. Cycle completion verification
7. System health status
8. Article quality scores
9. No duplicates in feed
10. Feed freshness

✅ Expected: All tests pass

## 📈 Key Endpoints

| Endpoint | Purpose | Response Time |
|----------|---------|----------------|
| `/getCycleDashboard` | Cycle status & metrics | <500ms |
| `/getDeduplicationReport` | Duplicate analysis | <2s |
| `/get24HourFeedV2` | 24-hour articles | <3s |
| `/getTrendingArticlesV2` | Top articles | <1s |
| `/getFeedMonitoring` | Feed health | <1s |

## 🎯 Success Indicators

### Cycle Health ✅
- Status: `healthy`
- Hours since last cycle: ≤ 12.5
- No alerts

### Article Quality ✅
- Duplicate rate: < 5%
- Average score: > 75
- Unique articles: > 100

### Feed Health ✅
- Feed health score: > 90%
- Success rate: > 95%
- Failed feeds: < 20%

## ⚠️ Troubleshooting

### Cycle Overdue (>13 hours)
```bash
# Check scheduler jobs
gcloud scheduler jobs list --location=us-central1 --project=carriersignal-app

# Check function logs
firebase functions:log --limit=50

# Manually trigger
curl -X POST https://us-central1-carriersignal-app.cloudfunctions.net/refreshFeedsManual
```

### High Duplicate Rate (>10%)
```bash
# Check deduplication report
curl https://us-central1-carriersignal-app.cloudfunctions.net/getDeduplicationReport | jq '.report.duplicateRemovalRate'

# Review feed sources for overlaps
```

### Low Article Quality (<60)
```bash
# Check feed health
curl https://us-central1-carriersignal-app.cloudfunctions.net/getFeedMonitoring | jq '.summary'

# Check system health
curl https://us-central1-carriersignal-app.cloudfunctions.net/getSystemHealth | jq '.health'
```

## 📋 Monitoring Checklist

### Every 30 Minutes
- [ ] Check cycle status: `getCycleDashboard`
- [ ] Verify no overdue cycles
- [ ] Review active alerts

### Every 6 Hours
- [ ] Review feed health: `getFeedMonitoring`
- [ ] Check success rates
- [ ] Verify error counts

### Daily
- [ ] Analyze duplicate rate: `getDeduplicationReport`
- [ ] Review article quality: `get24HourFeedV2`
- [ ] Check unique article count

### Weekly
- [ ] Export cycle metrics
- [ ] Analyze performance trends
- [ ] Review error logs
- [ ] Adjust feed weights if needed

## 📚 Documentation

- **API Reference**: `API_REFERENCE_12HOUR_CYCLE.md`
- **Implementation Guide**: `IMPLEMENTATION_GUIDE_12HOUR_CYCLE.md`
- **Deployment Checklist**: `DEPLOYMENT_CHECKLIST_12HOUR_CYCLE.md`
- **Comprehensive Summary**: `COMPREHENSIVE_12HOUR_CYCLE_SUMMARY.md`
- **Enhancements Details**: `FIREBASE_12HOUR_CYCLE_ENHANCEMENTS.md`

## 🔧 Common Commands

```bash
# Build functions
npm run build

# Deploy functions
firebase deploy --only functions

# View logs
firebase functions:log

# Run tests
npm run test:12hour-cycle-comprehensive

# Monitor in real-time
npm run monitor:cycle-realtime

# Check cycle dashboard
curl https://us-central1-carriersignal-app.cloudfunctions.net/getCycleDashboard

# Get 24-hour feed
curl "https://us-central1-carriersignal-app.cloudfunctions.net/get24HourFeedV2?limit=50"

# Get trending articles
curl "https://us-central1-carriersignal-app.cloudfunctions.net/getTrendingArticlesV2?limit=10"
```

## ✅ Deployment Status

- [x] Code complete (0 type errors)
- [x] Tests created (10 comprehensive tests)
- [x] Documentation complete (6 documents)
- [x] Ready for deployment

## 🎉 You're All Set!

1. Deploy: `firebase deploy --only functions`
2. Test: `npm run test:12hour-cycle-comprehensive`
3. Monitor: `npm run monitor:cycle-realtime`
4. Integrate dashboard into frontend
5. Set up alerts for failures

**Status**: READY FOR PRODUCTION ✅

