# CarrierSignal Hourly Refresh - Configuration Details

## Batch Configuration

```typescript
const BATCH_CONFIG = {
  // Primary batch: Every 60 minutes (hourly)
  interval: 60,
  timeZone: "America/New_York",
  // Batch size: Process up to 50 articles per batch
  batchSize: 50,
  // Retry configuration
  maxRetries: 3,
  retryDelayMs: 5000,
};
```

## Scheduled Function

```typescript
export const refreshFeeds = onSchedule(
  {
    schedule: `every ${BATCH_CONFIG.interval} minutes`,
    timeZone: BATCH_CONFIG.timeZone,
    secrets: [OPENAI_API_KEY]
  },
  async () => {
    await refreshFeedsWithBatching(OPENAI_API_KEY.value());
  }
);
```

**Result:** Runs `refreshFeedsWithBatching` every 60 minutes in America/New_York timezone

## Feed Sources Configuration

```typescript
const DEFAULT_FEED_SOURCES: FeedSource[] = [
  // NEWS FEEDS (8 sources)
  { url: "https://www.insurancejournal.com/rss/news/national/", 
    category: 'news', priority: 1, enabled: true },
  { url: "https://www.insurancejournal.com/rss/news/international/", 
    category: 'news', priority: 2, enabled: true },
  { url: "https://www.claimsjournal.com/rss/", 
    category: 'news', priority: 2, enabled: true },
  { url: "https://www.propertycasualty360.com/feed/", 
    category: 'news', priority: 2, enabled: true },
  { url: "https://www.riskandinsurance.com/feed/", 
    category: 'news', priority: 3, enabled: true },
  { url: "https://www.carriermanagement.com/feed/", 
    category: 'news', priority: 3, enabled: true },
  { url: "https://www.insurancebusinessmag.com/us/rss/", 
    category: 'news', priority: 3, enabled: true },
  { url: "https://www.insurancenewsnet.com/feed/", 
    category: 'news', priority: 3, enabled: true },

  // REGULATORY FEEDS (1 source)
  { url: "https://www.naic.org/rss/", 
    category: 'regulatory', priority: 1, enabled: true },

  // CATASTROPHE FEEDS (1 source)
  { url: "https://www.insurancejournal.com/rss/news/catastrophes/", 
    category: 'catastrophe', priority: 1, enabled: true },

  // REINSURANCE FEEDS (1 source)
  { url: "https://www.insurancejournal.com/rss/news/reinsurance/", 
    category: 'reinsurance', priority: 2, enabled: true },

  // TECHNOLOGY FEEDS (1 source)
  { url: "https://www.insurancejournal.com/rss/news/technology/", 
    category: 'technology', priority: 3, enabled: true },
];
```

## AI Summarization Configuration

```typescript
// Model: GPT-4o-mini with structured output
// Temperature: 0.2 (deterministic)
// Max tokens: 1200

const jsonSchema = {
  name: "InsuranceBrief",
  schema: {
    type: "object",
    properties: {
      title: { type: "string" },
      url: { type: "string" },
      source: { type: "string" },
      bullets5: { 
        type: "array", 
        items: { type: "string" }, 
        minItems: 3, 
        maxItems: 5 
      },
      whyItMatters: {
        type: "object",
        properties: {
          underwriting: { type: "string", minLength: 20, maxLength: 200 },
          claims: { type: "string", minLength: 20, maxLength: 200 },
          brokerage: { type: "string", minLength: 20, maxLength: 200 },
          actuarial: { type: "string", minLength: 20, maxLength: 200 },
        },
        required: ["underwriting", "claims", "brokerage", "actuarial"]
      },
      tags: {
        type: "object",
        properties: {
          lob: { type: "array", items: { type: "string" }, maxItems: 6 },
          perils: { type: "array", items: { type: "string" }, maxItems: 6 },
          regions: { type: "array", items: { type: "string" }, maxItems: 10 },
          companies: { type: "array", items: { type: "string" }, maxItems: 10 },
          trends: { type: "array", items: { type: "string" }, maxItems: 8 },
          regulations: { type: "array", items: { type: "string" }, maxItems: 5 },
        },
        required: ["lob", "perils", "regions", "companies", "trends", "regulations"]
      },
      riskPulse: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
      sentiment: { type: "string", enum: ["POSITIVE", "NEGATIVE", "NEUTRAL"] },
      confidence: { type: "number", minimum: 0, maximum: 1 },
      citations: { type: "array", items: { type: "string" }, maxItems: 10 },
      impactScore: { type: "number", minimum: 0, maximum: 100 },
      impactBreakdown: {
        type: "object",
        properties: {
          market: { type: "number", minimum: 0, maximum: 100 },
          regulatory: { type: "number", minimum: 0, maximum: 100 },
          catastrophe: { type: "number", minimum: 0, maximum: 100 },
          technology: { type: "number", minimum: 0, maximum: 100 },
        },
        required: ["market", "regulatory", "catastrophe", "technology"]
      },
      confidenceRationale: { type: "string", maxLength: 200 },
      leadQuote: { type: "string", maxLength: 300 },
      disclosure: { type: "string", maxLength: 200 },
    },
    required: [
      "title", "url", "source", "bullets5", "whyItMatters", "tags",
      "riskPulse", "sentiment", "confidence", "citations", "impactScore",
      "impactBreakdown", "confidenceRationale", "leadQuote", "disclosure"
    ]
  },
  strict: true
};
```

## AI Scoring Configuration

```typescript
// SmartScore v3 Weights
const SCORE_WEIGHTS = {
  recency: 0.35,           // 35% - Recent articles prioritized
  impact: 0.65,            // 65% - Substance over timing
  regulatory: 1.15,        // 15% boost for regulatory
  catastrophe: 1.20,       // 20% boost for catastrophe
  trends: 1.10,            // 10% boost for high-value trends
  lob: 1.08,               // 8% boost for multi-LOB coverage
};

// AI Score Configuration
const AI_SCORE_CONFIG = {
  model: "gpt-4o-mini",
  temperature: 0.1,        // Low for consistent scoring
  maxTokens: 10,
  timeoutMs: 10000,        // 10 second timeout
  maxRetries: 2,
  retryDelayMs: 1000,      // Exponential backoff: 1s, 2s, 4s
};
```

## Embedding Configuration

```typescript
// Vector Embeddings for RAG
const EMBEDDING_CONFIG = {
  model: "text-embedding-3-small",
  dimensions: 512,
  maxChars: 8000,
  prefix: "P&C Insurance Article: ",
};
```

## Circuit Breaker Configuration

```typescript
const CIRCUIT_BREAKER_THRESHOLD = 5;        // Failures before opening
const CIRCUIT_BREAKER_TIMEOUT_MS = 5 * 60 * 1000;  // 5 minutes before half-open

// States: CLOSED (normal), OPEN (disabled), HALF_OPEN (recovering)
```

## Rate Limiting Configuration

```typescript
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;  // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 20;           // 20 requests per hour per IP
```

## Content Validation

```typescript
// Minimum content length: 100 characters
const MIN_CONTENT_LENGTH = 100;

// Link health check timeout: 5 seconds
const LINK_HEALTH_TIMEOUT_MS = 5000;

// Idempotency TTL: 24 hours
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;

// Feed cache TTL: 1 hour
const FEEDS_CACHE_TTL_MS = 60 * 60 * 1000;
```

## Processing Pipeline

```
1. Load feeds from Firestore (cached 1 hour)
2. For each feed:
   a. Check circuit breaker status
   b. Fetch RSS feed
   c. For each article (up to 50):
      i. Check idempotency key
      ii. Check if already exists
      iii. Extract full content (with retry)
      iv. Validate content length
      v. Summarize with AI (GPT-4o-mini)
      vi. Validate and clean article
      vii. Check RAG quality
      viii. Normalize regions and companies
      ix. Calculate SmartScore v3
      x. Calculate AI Score
      xi. Generate embedding
      xii. Check link health
      xiii. Store article and embedding
      xiv. Record idempotency key
3. Log batch completion metrics
4. Update feed health
```

## Firestore Collections

- `articles` - Processed articles with metadata
- `article_embeddings` - Vector embeddings for RAG
- `feeds` - Feed source configuration
- `feed_health` - Per-feed success/failure metrics
- `batch_logs` - Batch processing logs
- `_idempotency` - Idempotency keys (TTL: 24 hours)
- `rate_limits` - Rate limit tracking (TTL: 2 hours)

## Environment Variables

- `OPENAI_API_KEY` - OpenAI API key (required)
- `ALLOWED_ORIGINS` - CORS allowed origins (optional, defaults provided)
- `FIREBASE_PROJECT_ID` - Firebase project ID (auto-configured)

## Deployment

```bash
# Deploy functions
npm run deploy

# View logs
npm run logs

# Manual trigger (for testing)
POST /refreshFeedsManual
```

## Monitoring Endpoints

- `GET /refreshFeedsManual` - Manual trigger
- `GET /initializeFeeds` - Initialize feeds collection
- `GET /testSingleArticle` - Test single article processing

