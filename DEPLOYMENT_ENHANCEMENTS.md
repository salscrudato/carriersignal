# Deployment Guide: Firebase Enhancements

## Pre-Deployment Checklist

- [ ] All new modules compile without errors
- [ ] Firestore security rules updated
- [ ] Required indexes created
- [ ] Environment variables configured
- [ ] Test suite passes
- [ ] Backup of current Firestore data

## Step 1: Build and Verify

```bash
cd functions
npm run build

# Check for type errors
npm run lint
```

## Step 2: Create Firestore Indexes

Add to `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "monitoring_cycles",
      "queryScope": "Collection",
      "fields": [
        {"fieldPath": "status", "order": "ASCENDING"},
        {"fieldPath": "startTime", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "monitoring_cycles",
      "queryScope": "Collection",
      "fields": [
        {"fieldPath": "status", "order": "ASCENDING"},
        {"fieldPath": "endTime", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "schedule_state",
      "queryScope": "Collection",
      "fields": [
        {"fieldPath": "status", "order": "ASCENDING"},
        {"fieldPath": "scheduledTime", "order": "ASCENDING"}
      ]
    },
    {
      "collectionGroup": "retry_queue",
      "queryScope": "Collection",
      "fields": [
        {"fieldPath": "status", "order": "ASCENDING"},
        {"fieldPath": "scheduledFor", "order": "ASCENDING"}
      ]
    },
    {
      "collectionGroup": "feed_metrics",
      "queryScope": "Collection",
      "fields": [
        {"fieldPath": "successRate", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "feed_priorities",
      "queryScope": "Collection",
      "fields": [
        {"fieldPath": "priority", "order": "ASCENDING"},
        {"fieldPath": "weight", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "trending_topics",
      "queryScope": "Collection",
      "fields": [
        {"fieldPath": "score", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "user_interactions",
      "queryScope": "Collection",
      "fields": [
        {"fieldPath": "articleId", "order": "ASCENDING"},
        {"fieldPath": "timestamp", "order": "DESCENDING"}
      ]
    }
  ]
}
```

Deploy indexes:
```bash
firebase deploy --only firestore:indexes
```

## Step 3: Update Firestore Security Rules

Add to `firestore.rules`:

```
// Monitoring collections (read-only for users)
match /monitoring_cycles/{document=**} {
  allow read: if request.auth != null;
  allow write: if request.auth.token.admin == true;
}

match /metrics_aggregated/{document=**} {
  allow read: if request.auth != null;
  allow write: if request.auth.token.admin == true;
}

match /schedule_state/{document=**} {
  allow read: if request.auth.token.admin == true;
  allow write: if request.auth.token.admin == true;
}

match /retry_queue/{document=**} {
  allow read: if request.auth.token.admin == true;
  allow write: if request.auth.token.admin == true;
}

match /fallback_tasks/{document=**} {
  allow read: if request.auth.token.admin == true;
  allow write: if request.auth.token.admin == true;
}

match /feed_metrics/{document=**} {
  allow read: if request.auth != null;
  allow write: if request.auth.token.admin == true;
}

match /feed_priorities/{document=**} {
  allow read: if request.auth != null;
  allow write: if request.auth.token.admin == true;
}

match /trending_topics/{document=**} {
  allow read: if request.auth != null;
  allow write: if request.auth.token.admin == true;
}

match /user_interactions/{document=**} {
  allow create: if request.auth != null;
  allow read: if request.auth.token.admin == true;
  allow write: if request.auth.token.admin == true;
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

## Step 4: Deploy Functions

```bash
firebase deploy --only functions
```

Monitor deployment:
```bash
firebase functions:log
```

## Step 5: Verify Deployment

### Check Health Endpoint
```bash
curl https://[project].cloudfunctions.net/getSystemHealth
```

Expected response:
```json
{
  "success": true,
  "health": {
    "status": "healthy",
    "lastCycleStatus": "completed",
    "hoursSinceLastCycle": 0.5,
    "articlesInDatabase": 1000,
    "averageSuccessRate": 0.98
  }
}
```

### Check Cycle Status
```bash
curl https://[project].cloudfunctions.net/getCycleStatus
```

### Run Test Suite
```bash
cd functions
npm run build
npx ts-node scripts/test-enhancements.ts
```

## Step 6: Monitor Initial Cycles

### Watch Logs
```bash
firebase functions:log --follow
```

### Check Monitoring Collection
```bash
firebase firestore:get /monitoring_cycles --limit=5 --order-by=startTime --order-direction=desc
```

### Verify Feed Metrics
```bash
firebase firestore:get /feed_metrics --limit=10 --order-by=successRate --order-direction=desc
```

## Step 7: Set Up Monitoring Dashboard

Create a monitoring dashboard in Firebase Console:
1. Go to Firestore → Data
2. Create views for:
   - `monitoring_cycles` (filter by status)
   - `feed_metrics` (sort by successRate)
   - `schedule_state` (filter by status)

## Rollback Plan

If issues occur:

```bash
# Revert to previous function version
gcloud functions deploy refreshFeeds \
  --gen2 \
  --runtime nodejs20 \
  --trigger-topic projects/[PROJECT]/topics/firebase-schedule-refreshFeeds-us-central1

# Or redeploy previous version
git checkout HEAD~1 functions/src/index.ts
firebase deploy --only functions
```

## Post-Deployment Validation

### 1. Verify 12-Hour Cycle
- [ ] `refreshFeeds` runs on schedule
- [ ] `comprehensiveIngest` runs on schedule
- [ ] Monitoring cycle completes successfully
- [ ] Articles are processed and scored

### 2. Verify Real-time Updates
- [ ] `scheduledRealtimeScoring` runs hourly
- [ ] Article scores update between cycles
- [ ] Trending topics are tracked

### 3. Verify Feed Prioritization
- [ ] `scheduledFeedWeightAdjustment` runs every 6 hours
- [ ] Feed weights are adjusted based on performance
- [ ] Feed priorities are calculated correctly

### 4. Verify Overdue Detection
- [ ] `scheduledOverdueCheck` runs every 30 minutes
- [ ] Overdue cycles are detected
- [ ] Recovery is triggered automatically

### 5. Verify Health Checks
- [ ] Health endpoint returns correct status
- [ ] Cycle status endpoint works
- [ ] Alerts are generated for anomalies

## Performance Targets

After deployment, verify:
- **12-hour cycle completion**: 100%
- **Article processing**: <100ms per article
- **Success rate**: >95%
- **System availability**: 99.9%
- **Response time**: <1 second for health endpoints

## Troubleshooting

### Functions Not Running
```bash
# Check scheduler jobs
gcloud scheduler jobs list --project=[PROJECT]

# Check function status
gcloud functions describe refreshFeeds --gen2 --project=[PROJECT]

# Check logs
firebase functions:log --limit=50
```

### High Error Rates
```bash
# Check monitoring cycles
firebase firestore:get /monitoring_cycles --limit=10

# Check feed metrics
firebase firestore:get /feed_metrics --limit=20

# Check recent alerts
firebase firestore:get /monitoring_cycles --limit=5 --where="alerts != []"
```

### Overdue Cycles
```bash
# Check schedule state
firebase firestore:get /schedule_state --where="status == 'failed'"

# Check retry queue
firebase firestore:get /retry_queue --where="status == 'pending'"

# Manually trigger recovery
curl -X POST https://[project].cloudfunctions.net/checkOverdueCycles
```

## Support

For issues or questions:
1. Check Firebase Console logs
2. Review monitoring_cycles collection
3. Check health endpoint status
4. Review FIREBASE_ENHANCEMENTS.md documentation

