# CarrierSignal DevOps & CI/CD Guide

## Overview

This guide covers deployment, CI/CD pipelines, monitoring, and infrastructure management for CarrierSignal.

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20.x]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Build
        run: npm run build

      - name: Test
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

      - name: Run OWASP dependency check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'CarrierSignal'
          path: '.'
          format: 'JSON'

  deploy:
    needs: [test, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: carriersignal-prod

      - name: Deploy Cloud Functions
        run: |
          npm install -g firebase-tools
          firebase deploy --only functions --token ${{ secrets.FIREBASE_TOKEN }}
```

## Deployment Strategy

### Staging Deployment

```bash
# Deploy to staging environment
firebase deploy --project carriersignal-staging

# Run smoke tests
npm run test:e2e:staging

# Monitor staging
firebase functions:log --project carriersignal-staging
```

### Production Deployment

```bash
# Create release tag
git tag -a v2.0.0 -m "Release version 2.0.0"
git push origin v2.0.0

# Deploy to production
firebase deploy --project carriersignal-prod

# Verify deployment
curl https://carriersignal.com/health
```

### Rollback Procedure

```bash
# Rollback to previous version
firebase hosting:rollback --project carriersignal-prod

# Or deploy specific version
firebase deploy --only hosting:carriersignal-prod --version <version-id>
```

## Infrastructure

### Firebase Configuration

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "/index.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=3600"
          }
        ]
      }
    ]
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs20"
  }
}
```

### Environment Configuration

```bash
# .env.production
VITE_FIREBASE_PROJECT_ID=carriersignal-prod
VITE_FIREBASE_API_KEY=xxx
VITE_API_URL=https://api.carriersignal.com
VITE_SENTRY_DSN=xxx

# functions/.env.production
OPENAI_API_KEY=xxx
FIREBASE_ADMIN_SDK_KEY=xxx
SENDGRID_API_KEY=xxx
```

## Monitoring & Observability

### Cloud Monitoring

```typescript
// functions/src/monitoring.ts
import { monitoring_v3 } from '@google-cloud/monitoring';

const client = new monitoring_v3.MetricServiceClient();

export async function recordMetric(
  metricType: string,
  value: number,
  labels?: Record<string, string>
): Promise<void> {
  const projectName = client.projectPath(process.env.GCP_PROJECT_ID!);

  const dataPoint = {
    interval: {
      endTime: { seconds: Math.floor(Date.now() / 1000) },
    },
    value: { doubleValue: value },
  };

  const timeSeries = {
    metric: {
      type: `custom.googleapis.com/${metricType}`,
      labels,
    },
    points: [dataPoint],
  };

  await client.createTimeSeries({
    name: projectName,
    timeSeries: [timeSeries],
  });
}
```

### Logging

```typescript
// functions/src/logging.ts
import { Logging } from '@google-cloud/logging';

const logging = new Logging();
const log = logging.log('carriersignal');

export async function logEvent(
  severity: string,
  message: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const entry = log.entry({ severity }, {
    message,
    ...metadata,
    timestamp: new Date().toISOString(),
  });

  await log.write(entry);
}
```

### Error Tracking

```typescript
// Sentry integration
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

export function captureException(error: Error, context?: Record<string, unknown>): void {
  Sentry.captureException(error, { extra: context });
}
```

## Performance Monitoring

### Web Vitals

```typescript
// Monitor Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function initWebVitals(): void {
  getCLS(metric => console.log('CLS:', metric.value));
  getFID(metric => console.log('FID:', metric.value));
  getFCP(metric => console.log('FCP:', metric.value));
  getLCP(metric => console.log('LCP:', metric.value));
  getTTFB(metric => console.log('TTFB:', metric.value));
}
```

### Lighthouse CI

```json
{
  "ci": {
    "collect": {
      "url": ["https://carriersignal.com"],
      "numberOfRuns": 3,
      "settings": {
        "configPath": "./lighthouserc.json"
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.9 }]
      }
    }
  }
}
```

## Backup & Disaster Recovery

### Firestore Backup

```bash
# Automated daily backups
gcloud firestore backups create \
  --collection-ids=articles,users,bookmarks \
  --retention-days=30

# Restore from backup
gcloud firestore restore BACKUP_ID
```

### Database Replication

```typescript
// Replicate critical data to secondary region
export async function replicateData(): Promise<void> {
  const articles = await admin
    .firestore()
    .collection('articles')
    .get();

  const secondaryDb = admin.firestore({ databaseId: 'secondary' });

  const batch = secondaryDb.batch();
  articles.docs.forEach(doc => {
    batch.set(secondaryDb.collection('articles').doc(doc.id), doc.data());
  });

  await batch.commit();
}
```

## Scaling

### Auto-scaling Configuration

```yaml
# Cloud Functions auto-scaling
runtime: nodejs20
maxInstances: 100
minInstances: 1
availableMemoryMb: 512
timeoutSeconds: 60
```

### Database Scaling

```typescript
// Implement pagination for large datasets
export async function getArticles(pageSize = 20, cursor?: string) {
  let query = admin
    .firestore()
    .collection('articles')
    .orderBy('publishedAt', 'desc')
    .limit(pageSize + 1);

  if (cursor) {
    const cursorDoc = await admin
      .firestore()
      .collection('articles')
      .doc(cursor)
      .get();
    query = query.startAfter(cursorDoc);
  }

  const docs = await query.get();
  const hasMore = docs.size > pageSize;
  const articles = docs.docs.slice(0, pageSize);

  return {
    articles: articles.map(doc => doc.data()),
    nextCursor: hasMore ? articles[articles.length - 1].id : null,
  };
}
```

## Incident Response

### Incident Severity Levels

- **Critical**: Service down, data loss
- **High**: Degraded performance, security issue
- **Medium**: Feature broken, workaround available
- **Low**: Minor issue, cosmetic problem

### Response Procedure

```bash
# 1. Declare incident
firebase functions:log --project carriersignal-prod

# 2. Investigate
gcloud logging read "resource.type=cloud_function" --limit 50

# 3. Mitigate
firebase deploy --only functions --project carriersignal-prod

# 4. Communicate
# Update status page
# Notify stakeholders

# 5. Post-mortem
# Document root cause
# Implement preventive measures
```

## Maintenance

### Regular Tasks

- [ ] Update dependencies weekly
- [ ] Review security logs daily
- [ ] Monitor performance metrics
- [ ] Backup database daily
- [ ] Review error logs
- [ ] Update documentation
- [ ] Security patches immediately

### Scheduled Maintenance

```bash
# Monthly: Full system audit
npm audit
firebase security-rules:test

# Quarterly: Performance review
npm run build -- --analyze
firebase functions:log --project carriersignal-prod

# Annually: Disaster recovery drill
# Test backup restoration
# Verify failover procedures
```

## Resources

- [Firebase Deployment](https://firebase.google.com/docs/hosting/deploying)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Google Cloud Monitoring](https://cloud.google.com/monitoring/docs)
- [Sentry Documentation](https://docs.sentry.io/)

