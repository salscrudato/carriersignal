# Testing Guide: 12-Hour Cycle & Feed Quality
## Comprehensive Testing for Best-in-Class News Feed

---

## 🎯 Quick Start

### 1. Verify 12-Hour Cycle is Running

```bash
# Check cycle status
curl https://us-central1-carriersignal-app.cloudfunctions.net/getCycleDashboardV2 | jq

# Expected response:
{
  "cycleStatus": "on-schedule",
  "hoursSinceLastRefresh": 11.5,
  "hoursSinceLastIngest": 11.5,
  "articlesIn24Hours": 342,
  "duplicatesIn24Hours": 18,
  "duplicateRate": 0.053,
  "alerts": [],
  "recommendations": []
}
```

**What to check**:
- ✅ `cycleStatus` should be "on-schedule"
- ✅ `hoursSinceLastRefresh` should be < 12.5
- ✅ `hoursSinceLastIngest` should be < 12.5
- ✅ `alerts` array should be empty
- ✅ `articlesIn24Hours` > 0

---

### 2. View 24-Hour Feed with Deduplication

```bash
# Get all articles from past 24 hours
curl "https://us-central1-carriersignal-app.cloudfunctions.net/get24HourFeedViewerV2?hours=24" | jq

# Expected response:
{
  "totalArticles": 342,
  "uniqueArticles": 324,
  "duplicatesDetected": 18,
  "duplicateRate": 0.053,
  "qualityMetrics": {
    "averageScore": 62.5,
    "averageQualityScore": 0.72,
    "highQualityCount": 156,
    "mediumQualityCount": 124,
    "lowQualityCount": 44
  },
  "topSources": [
    {"source": "Insurance Journal", "count": 45, "avgScore": 68.2},
    {"source": "PropertyShark", "count": 38, "avgScore": 65.1}
  ],
  "articles": [...]
}
```

**What to check**:
- ✅ `totalArticles` > 0
- ✅ `uniqueArticles` < `totalArticles` (duplicates detected)
- ✅ `duplicateRate` < 0.15 (less than 15% duplicates)
- ✅ `averageQualityScore` > 0.6
- ✅ `highQualityCount` > `lowQualityCount`
- ✅ Articles have all required fields

---

### 3. Check Duplicate Detection

```bash
# Scan for duplicates (dry run - no deletion)
curl -X POST "https://us-central1-carriersignal-app.cloudfunctions.net/scanDuplicates?dryRun=true" | jq

# Expected response:
{
  "totalArticlesScanned": 342,
  "duplicatesIdentified": 18,
  "duplicatesMarked": 18,
  "errors": 0,
  "processingTimeMs": 1234,
  "details": [
    {
      "primaryArticleId": "abc123",
      "duplicateArticleIds": ["def456", "ghi789"],
      "reason": "URL match",
      "action": "marked"
    }
  ]
}
```

**What to check**:
- ✅ `duplicatesIdentified` > 0
- ✅ `errors` = 0
- ✅ `processingTimeMs` < 30000 (less than 30 seconds)
- ✅ All duplicates have a reason

---

### 4. Get Duplicate Statistics

```bash
# View duplicate metrics
curl https://us-central1-carriersignal-app.cloudfunctions.net/getDuplicateStats | jq

# Expected response:
{
  "totalDuplicates": 156,
  "markedDuplicates": 45,
  "oldMarkedDuplicates": 12,
  "duplicateRate": 0.087
}
```

**What to check**:
- ✅ `duplicateRate` < 0.15 (less than 15%)
- ✅ `oldMarkedDuplicates` < `markedDuplicates`
- ✅ `markedDuplicates` < `totalDuplicates`

---

### 5. View Feed by Source

```bash
# Get articles from specific source
curl "https://us-central1-carriersignal-app.cloudfunctions.net/getFeedBySourceV2?sourceId=insurance_journal&hours=24" | jq

# Expected response:
{
  "sourceId": "insurance_journal",
  "count": 45,
  "articles": [
    {
      "id": "article_1",
      "title": "...",
      "source": "insurance_journal",
      "score": 75,
      "qualityScore": 0.85,
      "isDuplicate": false
    }
  ]
}
```

**What to check**:
- ✅ All articles from requested source
- ✅ `count` > 0
- ✅ Quality scores are reasonable (0-1)
- ✅ No duplicates within source feed

---

## 📊 Comprehensive Test Checklist

### Cycle Verification
- [ ] Cycle status is "on-schedule"
- [ ] Hours since last refresh < 12.5
- [ ] Hours since last ingest < 12.5
- [ ] No critical alerts
- [ ] Feed health shows mostly "healthy" status
- [ ] Average success rate > 80%

### Feed Quality
- [ ] Total articles > 100 in 24 hours
- [ ] Duplicate rate < 15%
- [ ] Average quality score > 0.6
- [ ] High quality articles > low quality articles
- [ ] All articles have required fields
- [ ] Sentiment data present for most articles

### Deduplication
- [ ] Duplicates detected > 0
- [ ] URL matches have confidence 1.0
- [ ] Content hash matches have confidence 0.95
- [ ] Title similarity matches have confidence > 0.8
- [ ] No false positives in sample check

### Source Performance
- [ ] All sources have articles in 24 hours
- [ ] No source has 100% failure rate
- [ ] Average score per source > 50
- [ ] Top sources have consistent output

### Scoring
- [ ] Article scores range 0-100
- [ ] Recent articles have higher scores
- [ ] High-quality articles have higher scores
- [ ] Trending articles are boosted

---

## 🔍 Troubleshooting

### Issue: Cycle Status is "Overdue"
```bash
# Check last execution
curl https://us-central1-carriersignal-app.cloudfunctions.net/getCycleDashboardV2 | jq '.lastRefreshFeeds'

# Check Cloud Scheduler
gcloud scheduler jobs list --location=us-central1

# Check function logs
firebase functions:log
```

### Issue: High Duplicate Rate (>15%)
```bash
# Scan duplicates to see details
curl -X POST "https://us-central1-carriersignal-app.cloudfunctions.net/scanDuplicates?dryRun=true" | jq '.details'

# Check if same source is being ingested multiple times
curl "https://us-central1-carriersignal-app.cloudfunctions.net/get24HourFeedViewerV2" | jq '.sourceBreakdown'
```

### Issue: Low Quality Scores
```bash
# Check article structure
curl "https://us-central1-carriersignal-app.cloudfunctions.net/get24HourFeedViewerV2" | jq '.articles[0]'

# Verify AI scoring is running
firebase functions:log | grep "AI SCORE"
```

### Issue: Feed Not Updating
```bash
# Check cycle dashboard
curl https://us-central1-carriersignal-app.cloudfunctions.net/getCycleDashboardV2 | jq '.alerts'

# Check for errors in last cycle
curl https://us-central1-carriersignal-app.cloudfunctions.net/getCycleDashboardV2 | jq '.lastRefreshFeeds.errorMessages'
```

---

## 📈 Performance Benchmarks

### Expected Metrics
- **Cycle Duration**: 5-15 minutes
- **Articles per Cycle**: 100-500
- **Duplicate Rate**: 5-15%
- **Average Quality Score**: 0.65-0.75
- **Processing Time**: < 30 seconds per endpoint

### Monitoring Frequency
- **Every 30 minutes**: Check cycle status
- **Every 6 hours**: Review feed quality
- **Daily**: Analyze duplicate trends
- **Weekly**: Review source performance

---

## 🚀 Optimization Tips

1. **Reduce Duplicates**: Adjust deduplication thresholds
2. **Improve Quality**: Enhance AI scoring prompts
3. **Faster Cycles**: Optimize feed source fetching
4. **Better Scoring**: Refine engagement metrics
5. **Source Health**: Monitor and adjust feed priorities

---

## 📞 Quick Reference

| Endpoint | Purpose | Frequency |
|----------|---------|-----------|
| `/getCycleDashboardV2` | Verify cycle status | Every 30 min |
| `/get24HourFeedViewerV2` | View feed quality | Every 6 hours |
| `/scanDuplicates` | Identify duplicates | Daily |
| `/getDuplicateStats` | View duplicate metrics | Daily |
| `/getFeedBySourceV2` | Check source health | As needed |

---

## ✅ Success Criteria

Your news feed is best-in-class when:
- ✅ 12-hour cycle runs on schedule
- ✅ Duplicate rate < 10%
- ✅ Average quality score > 0.70
- ✅ All sources healthy
- ✅ No critical alerts
- ✅ Articles updated every 12 hours
- ✅ No false positives in deduplication

