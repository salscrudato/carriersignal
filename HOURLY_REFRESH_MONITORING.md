# CarrierSignal Hourly Feed Refresh - Monitoring & Verification Guide

## Overview

The CarrierSignal system automatically refreshes the news feed **every 60 minutes** with articles from **13 RSS sources** across 5 categories. Each article is processed with AI to generate summaries, rankings, and embeddings.

## Scheduled Function Configuration

**Function Name:** `refreshFeeds`
- **Schedule:** Every 60 minutes (hourly)
- **Timezone:** America/New_York
- **Batch Size:** 50 articles per batch
- **Max Retries:** 3 per article extraction
- **Timeout:** 540 seconds (9 minutes)

## Feed Sources (13 Total)

### News Feeds (8 sources)
1. Insurance Journal - National
2. Insurance Journal - International
3. Claims Journal
4. Property Casualty 360
5. Risk and Insurance
6. Carrier Management
7. Insurance Business Magazine
8. Insurance News Net

### Regulatory Feeds (1 source)
- NAIC

### Catastrophe Feeds (1 source)
- Insurance Journal - Catastrophes

### Reinsurance Feeds (1 source)
- Insurance Journal - Reinsurance

### Technology Feeds (1 source)
- Insurance Journal - Technology

## Article Processing Pipeline

Each article goes through:

1. **Extraction** - Full content extraction with retry logic
2. **Summarization** - AI-generated 3-5 bullet points using GPT-4o-mini
3. **Tagging** - Automatic classification (LOB, perils, regions, companies, trends, regulations)
4. **Scoring** - Dual scoring system:
   - **SmartScore v3** - Multi-dimensional ranking (0-100)
   - **AI Score** - P&C professional relevance (0-100)
5. **Embedding** - Vector embeddings for RAG retrieval
6. **Deduplication** - Content hash checking to prevent duplicates
7. **Link Health Check** - Verifies article URL accessibility

## Monitoring & Verification

### 1. Check Batch Logs in Firestore

Navigate to: `batch_logs` collection

```
db.collection('batch_logs')
  .orderBy('timestamp', 'desc')
  .limit(10)
```

**Key Metrics:**
- `processed` - Articles successfully processed
- `skipped` - Articles skipped (duplicates, too short, etc.)
- `errors` - Processing errors
- `duration` - Total batch time in milliseconds
- `status` - 'success' or 'failed'

### 2. Check Feed Health

Navigate to: `feed_health` collection

**Metrics per feed:**
- `successCount` - Successful fetches
- `failureCount` - Failed fetches
- `lastSuccessAt` - Last successful fetch timestamp
- `lastFailureAt` - Last failure timestamp
- `lastError` - Error message from last failure

### 3. Verify Articles Collection

Navigate to: `articles` collection

**Check recent articles:**
```
db.collection('articles')
  .orderBy('createdAt', 'desc')
  .limit(50)
```

**Key fields to verify:**
- `title` - Article headline
- `bullets5` - 3-5 key points (AI-generated)
- `whyItMatters` - Impact breakdown (underwriting, claims, brokerage, actuarial)
- `smartScore` - Multi-dimensional ranking score
- `aiScore` - P&C professional relevance score
- `tags` - Classification (lob, perils, regions, companies, trends, regulations)
- `riskPulse` - Risk level (LOW, MEDIUM, HIGH)
- `sentiment` - Article sentiment (POSITIVE, NEGATIVE, NEUTRAL)
- `batchProcessedAt` - When article was processed
- `linkOk` - Whether article URL is accessible

### 4. Check Circuit Breaker Status

The system uses circuit breakers to prevent hammering failing feeds:
- **CLOSED** - Feed is healthy, processing normally
- **OPEN** - Feed has failed 5+ times, temporarily disabled
- **HALF_OPEN** - Feed is recovering, testing with single request

**Threshold:** 5 consecutive failures
**Recovery Timeout:** 5 minutes

### 5. Monitor Function Logs

**Firebase Console:**
1. Go to Functions → Logs
2. Filter by function: `refreshFeeds`
3. Look for log entries with prefixes:
   - `[BATCH START]` - Batch beginning
   - `[BATCH CONFIG]` - Configuration details
   - `[FEED]` - Feed processing
   - `[ARTICLE]` - Article processing
   - `[BATCH COMPLETE]` - Batch completion
   - `[BATCH ERROR]` - Batch failures

**Key Log Patterns:**
```
[BATCH START] Initiating news feed batch refresh
[BATCH CONFIG] Interval: 60min, BatchSize: 50, MaxRetries: 3
[BATCH] [FEED] Found X items in Yms
[BATCH] [ARTICLE] Successfully processed in Zms
[BATCH COMPLETE] Refresh completed in Wms
[BATCH RESULTS] Processed: X, Skipped: Y, Errors: Z
```

## Manual Trigger

To manually trigger a refresh (for testing):

**Endpoint:** `POST /refreshFeedsManual`

**Response:**
```json
{
  "success": true,
  "message": "Batch feed refresh complete",
  "batchConfig": { ... },
  "results": {
    "processed": 45,
    "skipped": 5,
    "errors": 0,
    "feedsProcessed": 13
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Troubleshooting

### No articles appearing
1. Check `batch_logs` for errors
2. Verify feed sources are enabled in `feeds` collection
3. Check `feed_health` for circuit breaker status
4. Review function logs for extraction failures

### Low article count
1. Check `batch_logs` for high skip rate
2. Verify article content extraction (minimum 100 chars required)
3. Check for duplicate detection (content hash matching)

### Feed failures
1. Check `feed_health` collection for error messages
2. Verify feed URLs are still valid
3. Check circuit breaker status (may be OPEN)
4. Wait 5 minutes for recovery if HALF_OPEN

### AI scoring issues
1. Verify OpenAI API key is set
2. Check function logs for timeout errors
3. Review `aiScore` field in articles (should be 0-100)

## Performance Targets

- **Batch Duration:** < 5 minutes
- **Articles Processed:** 40-50 per batch
- **Success Rate:** > 90%
- **Average Article Latency:** 2-5 seconds
- **Feed Health:** All feeds CLOSED or HALF_OPEN

## Next Steps

1. Monitor the first few batches to ensure smooth operation
2. Adjust batch size if needed (currently 50)
3. Add additional feed sources as needed
4. Set up alerts for batch failures or high error rates

