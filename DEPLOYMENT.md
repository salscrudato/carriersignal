# CarrierSignal Deployment Guide

## Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project created
- Google Cloud project configured
- OpenAI API key
- Domain configured (optional)

## Environment Setup

### 1. Firebase Project Configuration

```bash
# Login to Firebase
firebase login

# Initialize Firebase project
firebase init

# Select features:
# - Firestore
# - Cloud Functions
# - Hosting
# - Storage
```

### 2. Environment Variables

Create `.env.local` for frontend:

```
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
VITE_API_BASE_URL=https://us-central1-carriersignal.cloudfunctions.net
```

Set backend secrets in Firebase Console:

```bash
firebase functions:config:set openai.api_key="xxx"
firebase functions:config:set openai.model="gpt-4o-mini"
firebase functions:config:set embedding.model="text-embedding-3-small"
```

## Frontend Deployment

### 1. Build

```bash
npm run build
```

Verify build output in `dist/` directory.

### 2. Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

### 3. Custom Domain (Optional)

```bash
firebase hosting:channel:deploy preview
firebase hosting:domain:create carriersignal.com
```

## Backend Deployment

### 1. Build Cloud Functions

```bash
cd functions
npm run build
```

### 2. Deploy Cloud Functions

```bash
firebase deploy --only functions
```

### 3. Verify Deployment

```bash
firebase functions:list
firebase functions:log
```

## Database Setup

### 1. Create Firestore Indexes

```bash
firebase firestore:indexes
```

Or manually create in Firebase Console:
- Articles: indexed by `publishedAt`, `smartScore`
- Bookmarks: indexed by `userId`, `createdAt`
- Preferences: indexed by `userId`

### 2. Initialize Collections

```bash
firebase firestore:delete articles --recursive
firebase firestore:delete bookmarks --recursive
firebase firestore:delete preferences --recursive
```

### 3. Set Security Rules

```bash
firebase deploy --only firestore:rules
```

## Monitoring & Logging

### 1. Enable Monitoring

```bash
# View Cloud Functions logs
firebase functions:log

# View Firestore usage
firebase firestore:usage

# View Hosting analytics
firebase hosting:analytics
```

### 2. Set Up Alerts

In Google Cloud Console:
- CPU usage > 80%
- Memory usage > 80%
- Error rate > 1%
- Response time > 5s

### 3. Enable Debug Logging

```typescript
// In functions/src/index.ts
import * as functions from 'firebase-functions';

functions.logger.info('Processing article', { url });
```

## Continuous Deployment

### 1. GitHub Actions Setup

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      - run: npm install
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: carriersignal
```

### 2. Set Up Service Account

```bash
# Generate service account key
firebase init:hosting

# Add to GitHub Secrets as FIREBASE_SERVICE_ACCOUNT
```

## Rollback Procedure

### 1. Rollback Hosting

```bash
firebase hosting:channel:list
firebase hosting:clone production staging
```

### 2. Rollback Functions

```bash
# View deployment history
firebase functions:list

# Redeploy previous version
git checkout <previous-commit>
firebase deploy --only functions
```

## Performance Optimization

### 1. Enable Caching

```bash
# In firebase.json
{
  "hosting": {
    "headers": [
      {
        "source": "/assets/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

### 2. Enable Compression

```bash
firebase deploy --only hosting
# Compression is automatic
```

### 3. CDN Configuration

```bash
# In firebase.json
{
  "hosting": {
    "cdn": true,
    "cacheControl": {
      "default": "public, max-age=3600"
    }
  }
}
```

## Backup & Recovery

### 1. Firestore Backup

```bash
# Automated backups (Firebase Console)
# Or manual export
gcloud firestore export gs://carriersignal-backups/backup-$(date +%s)
```

### 2. Restore from Backup

```bash
gcloud firestore import gs://carriersignal-backups/backup-timestamp
```

## Scaling

### 1. Auto-scaling Configuration

```bash
# In firebase.json
{
  "functions": {
    "memory": 512,
    "timeoutSeconds": 60,
    "maxInstances": 100
  }
}
```

### 2. Database Scaling

- Firestore automatically scales
- Monitor read/write operations
- Archive old articles to reduce size

## Troubleshooting

### Deployment Fails

```bash
# Check logs
firebase functions:log

# Verify configuration
firebase projects:list

# Clear cache
rm -rf node_modules
npm install
```

### Functions Not Updating

```bash
# Force redeploy
firebase deploy --only functions --force

# Check function status
firebase functions:list
```

### High Latency

```bash
# Check function performance
firebase functions:log

# Optimize queries
# Check Firestore indexes
firebase firestore:indexes
```

## Post-Deployment Checklist

- [ ] Frontend loads without errors
- [ ] API endpoints responding
- [ ] Firestore data accessible
- [ ] Authentication working
- [ ] Monitoring alerts configured
- [ ] Backups enabled
- [ ] SSL certificate valid
- [ ] Performance acceptable
- [ ] Error rate < 1%
- [ ] Users can access app

## Support

For deployment issues, contact: devops@carriersignal.com

