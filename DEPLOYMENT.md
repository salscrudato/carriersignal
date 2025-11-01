# CarrierSignal v2 (Signals) Deployment Guide

## Overview

CarrierSignal v2 introduces a comprehensive news signal system with AI-powered classification, clustering, and personalization. This guide covers deployment, feature flag rollout, and health monitoring.

## Pre-Deployment Checklist

- [ ] All tests passing (unit, integration, E2E)
- [ ] Performance budgets met (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] Bundle size within limits (main: 250KB, firebase: 337KB, CSS: 86KB)
- [ ] Firestore indexes deployed
- [ ] Security rules updated
- [ ] Cloud Functions deployed
- [ ] Environment variables configured

## Deployment Steps

### 1. Deploy Cloud Functions

```bash
cd functions
npm run build
firebase deploy --only functions
```

Functions deployed:
- `ingestAllFeeds` - Scheduled ingestion (hourly)
- `classifyArticles` - AI classification (on newsRaw creation)
- `clusterAndScore` - Clustering and scoring (scheduled)
- `linkHazards` - Hazard linking (scheduled)
- `backfillEDGAR` - EDGAR backfill (daily)

### 2. Deploy Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

Indexes created:
- `newsArticles`: score DESC + publishedAt DESC
- `newsArticles`: states + publishedAt DESC
- `newsArticles`: lobs + publishedAt DESC
- `newsArticles`: regulators + publishedAt DESC
- `newsClusters`: score DESC + createdAt DESC

### 3. Update Security Rules

```bash
firebase deploy --only firestore:rules
```

### 4. Deploy Frontend

```bash
npm run build
firebase deploy --only hosting
```

### 5. Initialize Feature Flags

```bash
# Start with 5% rollout
firebase firestore:set featureFlags/signals_v2 \
  --data '{
    "id": "signals_v2",
    "name": "Signals v2",
    "description": "New news signal system",
    "enabled": true,
    "rolloutPercentage": 5,
    "createdAt": '$(date +%s)'000',
    "updatedAt": '$(date +%s)'000'
  }'
```

## Rollout Strategy

### Phase 1: Canary (5%)
- Monitor health dashboard
- Check error rates and performance
- Duration: 24 hours

### Phase 2: Early Access (25%)
- Expand to early adopters
- Gather feedback
- Duration: 48 hours

### Phase 3: Gradual Rollout (50% → 100%)
- Increase by 25% every 24 hours
- Monitor metrics continuously
- Duration: 2-3 days

### Phase 4: Full Rollout (100%)
- All users on v2
- Monitor for 7 days
- Prepare rollback plan

## Health Monitoring

### Key Metrics

1. **Ingestion Success Rate** (Target: > 99.5%)
   - Location: `ingestionMetrics` collection
   - Alert if < 99%

2. **Core Web Vitals**
   - LCP: < 2.5s
   - FID: < 100ms
   - CLS: < 0.1
   - Location: `performanceMetrics` collection

3. **Error Rate** (Target: < 0.5%)
   - Location: `errorLogs` collection
   - Alert if > 1%

4. **Processing Time** (Target: < 5s per batch)
   - Location: `ingestionMetrics.duration`
   - Alert if > 10s

### Dashboard Access

```
https://carriersignal.app/admin/health
```

Displays:
- Real-time ingestion metrics
- Performance budgets status
- Error logs
- Feature flag status

## Rollback Procedure

If critical issues detected:

```bash
# Disable feature flag
firebase firestore:set featureFlags/signals_v2 \
  --data '{
    "id": "signals_v2",
    "enabled": false,
    "rolloutPercentage": 0
  }'

# Revert to previous version
git revert <commit-hash>
npm run build
firebase deploy --only hosting
```

## Post-Deployment

### Day 1
- Monitor health dashboard every hour
- Check error logs for patterns
- Verify ingestion pipeline

### Days 2-3
- Continue monitoring
- Gather user feedback
- Prepare for next rollout phase

### Week 1
- Full analysis of metrics
- Performance optimization if needed
- Document lessons learned

## Troubleshooting

### High Error Rate
1. Check Cloud Functions logs
2. Verify API keys and credentials
3. Check Firestore quota
4. Review recent code changes

### Performance Issues
1. Check bundle size
2. Review database queries
3. Check network latency
4. Profile with Chrome DevTools

### Ingestion Failures
1. Verify news sources are accessible
2. Check rate limiting
3. Review classification errors
4. Check Firestore write quota

## Support

For deployment issues:
1. Check Cloud Functions logs: `firebase functions:log`
2. Check Firestore logs: Firebase Console
3. Review error tracking: Sentry/Rollbar
4. Contact DevOps team

## Success Criteria

✅ Deployment successful when:
- Ingestion success rate > 99.5%
- All CWV budgets green
- Error rate < 0.5%
- User feedback positive
- No critical issues reported

