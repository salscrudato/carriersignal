# Testing Guide - 12-Hour Cycle Enhancements V2

## Quick Start

### 1. Build Functions
```bash
cd functions
npm run build
```

Expected output: `✅ 0 errors`

### 2. Run Automated Tests
```bash
npm run test:enhancements-v2
```

This runs comprehensive tests for all 6 new endpoints.

### 3. Manual Testing

#### Test 24-Hour Feed
```bash
curl "http://localhost:5001/carriersignal-app/us-central1/get24HourFeedV3?hours=24&limit=50"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "totalArticles": 250,
    "uniqueArticles": 240,
    "duplicateArticles": 10,
    "duplicateRate": 0.04,
    "averageQualityScore": 82.5,
    "averageAIScore": 78.3,
    "trendingArticles": [...],
    "articles": [...]
  }
}
```

#### Test Cycle Health
```bash
curl "http://localhost:5001/carriersignal-app/us-central1/getCycleHealthV2"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "cycleId": "cycle_...",
    "status": "healthy",
    "articlesProcessed": 250,
    "duplicateRemovalRate": 0.04,
    "averageQualityScore": 82.5,
    "feedSuccessRate": 0.95,
    "anomalies": [],
    "alerts": []
  }
}
```

#### Test Feed Quality Report
```bash
curl "http://localhost:5001/carriersignal-app/us-central1/getFeedQualityReport?hours=24"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "articleMetrics": {
      "total": 250,
      "unique": 240,
      "duplicates": 10,
      "duplicateRate": 0.04
    },
    "scoringMetrics": {
      "articlesWithAIScore": 240,
      "avgAIScore": 78.3,
      "avgQualityScore": 82.5
    },
    "recommendations": [
      "✅ Duplicate rate acceptable",
      "✅ Quality score is good",
      "✅ All articles scored"
    ]
  }
}
```

#### Test Article Score
```bash
# First get an article ID from the feed
ARTICLE_ID="<article_id_from_feed>"

curl "http://localhost:5001/carriersignal-app/us-central1/getAdvancedArticleScore?articleId=$ARTICLE_ID"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "finalScore": 85.3,
    "factors": {
      "recencyScore": 90,
      "impactScore": 75,
      "engagementScore": 80,
      "trendingScore": 70,
      "qualityScore": 88,
      "relevanceScore": 85
    }
  }
}
```

#### Test Duplicate Detection
```bash
ARTICLE_ID="<article_id_from_feed>"

curl "http://localhost:5001/carriersignal-app/us-central1/checkArticleDuplicates?articleId=$ARTICLE_ID"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "isDuplicate": false,
    "confidence": 1.0,
    "reason": "No duplicates detected",
    "matchType": null
  }
}
```

#### Test Cycle Health History
```bash
curl "http://localhost:5001/carriersignal-app/us-central1/getCycleHealthHistory?days=7"
```

**Expected Response:**
```json
{
  "success": true,
  "cycleCount": 14,
  "trends": {
    "avgStatus": 0.95,
    "avgDuplicateRate": 0.045,
    "avgQualityScore": 81.2,
    "avgFeedSuccessRate": 0.94
  },
  "metrics": [...]
}
```

---

## Validation Checklist

### ✅ Duplicate Detection
- [ ] Duplicate rate < 5%
- [ ] All articles checked for duplicates
- [ ] Confidence scores present
- [ ] Multiple detection strategies working

### ✅ Article Scoring
- [ ] All articles have scores
- [ ] Scores between 0-100
- [ ] 6 factors present
- [ ] Adaptive weighting applied

### ✅ Cycle Health
- [ ] Status is "healthy" or "degraded"
- [ ] Metrics are tracked
- [ ] Anomalies detected if present
- [ ] Alerts generated if needed

### ✅ Feed Quality
- [ ] Quality metrics calculated
- [ ] Recommendations provided
- [ ] Trending articles identified
- [ ] Per-source breakdown available

### ✅ Performance
- [ ] Response times < 5 seconds
- [ ] No timeout errors
- [ ] Consistent results
- [ ] Proper error handling

---

## Troubleshooting

### Issue: "No articles found"
**Solution**: Ensure the 12-hour cycle has run and articles are in Firestore

### Issue: "High duplicate rate"
**Solution**: Check feed sources for duplicates, review deduplication thresholds

### Issue: "Low quality scores"
**Solution**: Review article sources, check AI scoring configuration

### Issue: "Cycle health degraded"
**Solution**: Check Firebase logs, review feed success rates, investigate anomalies

### Issue: "Timeout errors"
**Solution**: Increase timeout, check Firestore performance, optimize queries

---

## Performance Benchmarks

### Expected Metrics
- Duplicate rate: 3-5%
- Quality score: 75-85
- AI score: 70-80
- Feed success rate: 90-95%
- Cycle health: Healthy 95%+ of time

### Response Times
- 24-hour feed: 2-5 seconds
- Cycle health: < 500ms
- Article score: 1-2 seconds
- Duplicate check: 1-2 seconds
- History: < 1 second
- Quality report: 2-3 seconds

---

## Continuous Monitoring

### Daily Checks
```bash
# Check cycle health
curl "http://localhost:5001/carriersignal-app/us-central1/getCycleHealthV2"

# Check feed quality
curl "http://localhost:5001/carriersignal-app/us-central1/getFeedQualityReport?hours=24"
```

### Weekly Analysis
```bash
# Check 7-day trends
curl "http://localhost:5001/carriersignal-app/us-central1/getCycleHealthHistory?days=7"
```

### Monthly Review
```bash
# Check 30-day trends
curl "http://localhost:5001/carriersignal-app/us-central1/getCycleHealthHistory?days=30"
```

---

## Success Criteria

✅ **All tests pass**
✅ **0 TypeScript errors**
✅ **Duplicate rate < 5%**
✅ **Quality score > 80**
✅ **Feed success rate > 90%**
✅ **Response times < 5 seconds**
✅ **Cycle health healthy**

---

## Next Steps

1. Deploy to Firebase
2. Run automated tests
3. Monitor metrics daily
4. Adjust thresholds as needed
5. Gather user feedback

