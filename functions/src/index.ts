import {onSchedule} from "firebase-functions/v2/scheduler";
import {onRequest} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import OpenAI from "openai";
import Parser from "rss-parser";
import {extractArticle, summarizeAndTag, embedForRAG, hashUrl, calculateSmartScore, normalizeRegions, normalizeCompanies, getCanonicalUrl, computeContentHash, detectStormName, isRegulatorySource, scoreArticleWithAI} from "./agents";

initializeApp();
const db = getFirestore();
const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

/**
 * Simple in-memory rate limiter for askBrief endpoint
 * Tracks requests per IP with sliding window
 */
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 20; // 20 requests per hour per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const requests = rateLimitMap.get(ip) || [];

  // Remove old requests outside the window
  const recentRequests = requests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS);

  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false; // Rate limit exceeded
  }

  // Add current request
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);

  return true; // OK to proceed
}

/**
 * Allowed origins for CORS (production domains)
 * In development, allow localhost
 */
const ALLOWED_ORIGINS = [
  'https://carriersignal.web.app',
  'https://carriersignal.firebaseapp.com',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
];

function checkCORS(origin: string | undefined): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed));
}

/**
 * RSS Feed sources for batch processing
 * Using only Insurance Journal RSS feed as requested
 */
interface FeedSource {
  url: string;
  category: 'news' | 'regulatory' | 'catastrophe' | 'reinsurance' | 'technology';
  priority: number; // 1 = highest
  enabled: boolean;
}

const FEED_SOURCES: FeedSource[] = [
  // Insurance Journal - National news only
  { url: "https://www.insurancejournal.com/rss/news/national/", category: 'news', priority: 1, enabled: true },
];

// For backward compatibility, extract URLs
const FEEDS = FEED_SOURCES.filter(f => f.enabled).map(f => f.url);

/**
 * Initialize feeds collection in Firestore (one-time setup)
 * Call this manually or on first deploy
 */
async function initializeFeedsCollection() {
  const batch = db.batch();

  for (const feed of FEED_SOURCES) {
    const feedRef = db.collection('feeds').doc(hashUrl(feed.url));
    batch.set(feedRef, {
      ...feed,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, { merge: true });
  }

  await batch.commit();
  console.log(`[FEEDS] Initialized ${FEED_SOURCES.length} feeds in Firestore`);
}



/**
 * Shared logic for refreshing feeds with batch processing
 * Processes articles in batches with retry logic and detailed logging
 */
async function refreshFeedsLogic(apiKey: string) {
  const client = new OpenAI({apiKey});
  const parser = new Parser();

  const results = {processed: 0, skipped: 0, errors: 0, feedsProcessed: 0};
  const batchStartTime = Date.now();

  for (const feedUrl of FEEDS) {
    const feedStartTime = Date.now();
    try {
      console.log(`[FEED] Fetching feed: ${feedUrl}`);
      const feed = await parser.parseURL(feedUrl);
      console.log(`[FEED] Found ${feed.items.length} items in feed: ${feedUrl}`);
      results.feedsProcessed++;
      updateFeedHealth(feedUrl, true); // Track successful fetch

      // Process articles in batches
      const articles = feed.items.slice(0, BATCH_CONFIG.batchSize);

      for (let i = 0; i < articles.length; i++) {
        const item = articles[i];
        const itemIndex = i + 1;

        try {
          if (!item.link) {
            console.log(`[ARTICLE ${itemIndex}/${articles.length}] Skipping item without link in ${feedUrl}`);
            results.skipped++;
            continue;
          }

          const url = item.link;
          const id = hashUrl(url);
          const docRef = db.collection("articles").doc(id);
          const exists = (await docRef.get()).exists;

          if (exists) {
            console.log(`[ARTICLE ${itemIndex}/${articles.length}] Article already exists: ${url}`);
            results.skipped++;
            continue;
          }

          console.log(`[ARTICLE ${itemIndex}/${articles.length}] Processing: ${url}`);

          // Extract full content with retry logic
          let content: Awaited<ReturnType<typeof extractArticle>> | undefined;
          let extractRetries = 0;
          while (extractRetries < BATCH_CONFIG.maxRetries) {
            try {
              content = await extractArticle(url);
              break;
            } catch (error) {
              extractRetries++;
              if (extractRetries < BATCH_CONFIG.maxRetries) {
                console.log(`[ARTICLE ${itemIndex}/${articles.length}] Extract retry ${extractRetries}/${BATCH_CONFIG.maxRetries}`);
                await new Promise(resolve => setTimeout(resolve, BATCH_CONFIG.retryDelayMs));
              } else {
                throw error;
              }
            }
          }

          if (!content || !content.text || content.text.length < 100) {
            console.log(`[ARTICLE ${itemIndex}/${articles.length}] Article text too short (${content?.text?.length || 0} chars): ${url}`);
            results.skipped++;
            continue;
          }

          // Summarize & classify
          const brief = await summarizeAndTag(client, {
            url,
            source: (item.creator || feed.title || content.url || "").toString(),
            publishedAt: item.isoDate || item.pubDate || "",
            title: content.title,
            text: content.text,
          });

          // Entity normalization
          const regionsNormalized = brief.tags?.regions
            ? normalizeRegions(brief.tags.regions)
            : [];
          const companiesNormalized = brief.tags?.companies
            ? normalizeCompanies(brief.tags.companies)
            : [];

          // Deduplication: canonical URL and content hash
          const canonicalUrl = getCanonicalUrl(url, content.html);
          const contentHash = computeContentHash(content.text);

          // Check for duplicates by content hash
          const duplicateCheck = await db.collection('articles')
            .where('contentHash', '==', contentHash)
            .limit(1)
            .get();

          let clusterId = contentHash; // Use content hash as cluster ID
          if (!duplicateCheck.empty) {
            // Duplicate found - use existing cluster ID
            const existingDoc = duplicateCheck.docs[0];
            clusterId = existingDoc.data().clusterId || contentHash;
            console.log(`[ARTICLE ${itemIndex}/${articles.length}] Duplicate detected (cluster: ${clusterId}): ${brief.title}`);
          }

          // Regulatory detection: check if source is DOI or has regulatory keywords
          const regulatory = isRegulatorySource(url, brief.source) ||
                            (brief.tags?.regulations && brief.tags.regulations.length > 0);

          // Catastrophe detection: storm names
          const stormName = detectStormName(`${brief.title} ${content.text.slice(0, 1000)}`);

          // Build an embedding for Ask‑the‑Brief
          const emb = await embedForRAG(
            client,
            `${brief.title}\n${brief.bullets5.join("\n")}\n${Object.values(brief.whyItMatters).join("\n")}`
          );

          // Calculate SmartScore v3 (enhanced)
          const smartScore = calculateSmartScore({
            publishedAt: item.isoDate || item.pubDate || "",
            impactScore: brief.impactScore,
            impactBreakdown: brief.impactBreakdown,
            tags: brief.tags,
            regulatory,
            riskPulse: brief.riskPulse,
            stormName,
          });

          // AI-driven scoring for P&C professionals (v3 enhanced)
          const aiScore = await scoreArticleWithAI(client, {
            title: brief.title,
            bullets5: brief.bullets5,
            whyItMatters: brief.whyItMatters,
            tags: brief.tags,
            impactScore: brief.impactScore,
            publishedAt: item.isoDate || item.pubDate,
            regulatory,
            stormName,
            riskPulse: brief.riskPulse,
            sentiment: brief.sentiment,
          });

          await docRef.set({
            ...brief,
            publishedAt: item.isoDate || item.pubDate || "",
            createdAt: new Date(),
            embedding: emb,
            smartScore,
            aiScore,
            regionsNormalized,
            companiesNormalized,
            canonicalUrl,
            contentHash,
            clusterId,
            regulatory,
            stormName: stormName || null,
            batchProcessedAt: new Date(),
          });

          console.log(`[ARTICLE ${itemIndex}/${articles.length}] Successfully processed: ${brief.title}`);
          results.processed++;
        } catch (error) {
          console.error(`[ARTICLE ${itemIndex}/${articles.length}] Error processing article from ${feedUrl}:`, error);
          results.errors++;
        }
      }

      const feedDuration = Date.now() - feedStartTime;
      console.log(`[FEED] Completed in ${feedDuration}ms: ${feedUrl}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[FEED ERROR] Error fetching feed ${feedUrl}:`, errorMessage);
      updateFeedHealth(feedUrl, false, errorMessage); // Track failed fetch
      results.errors++;
      // Continue to next feed instead of failing entire batch
    }
  }

  const totalDuration = Date.now() - batchStartTime;
  console.log(`[BATCH SUMMARY] Total duration: ${totalDuration}ms, Feeds: ${results.feedsProcessed}, Processed: ${results.processed}, Skipped: ${results.skipped}, Errors: ${results.errors}`);

  return results;
}

/**
 * Batch refresh configuration
 * Defines the recurring schedule for news article batch processing
 */
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

/**
 * Feed health tracking - persisted to Firestore
 * Monitors success/failure rates for each RSS feed
 */
interface FeedHealth {
  url: string;
  successCount: number;
  failureCount: number;
  lastSuccessAt?: FirebaseFirestore.Timestamp | Date;
  lastFailureAt?: FirebaseFirestore.Timestamp | Date;
  lastError?: string;
  updatedAt: FirebaseFirestore.Timestamp | Date;
}

/**
 * Update feed health metrics in Firestore
 */
async function updateFeedHealth(feedUrl: string, success: boolean, error?: string) {
  try {
    const healthRef = db.collection('feed_health').doc(hashUrl(feedUrl));
    const healthDoc = await healthRef.get();

    const health: FeedHealth = healthDoc.exists
      ? (healthDoc.data() as FeedHealth)
      : {
          url: feedUrl,
          successCount: 0,
          failureCount: 0,
          updatedAt: new Date(),
        };

    if (success) {
      health.successCount++;
      health.lastSuccessAt = new Date();
    } else {
      health.failureCount++;
      health.lastFailureAt = new Date();
      if (error) health.lastError = error;
    }

    health.updatedAt = new Date();

    await healthRef.set(health);

    // Log warning if failure rate > 50%
    const total = health.successCount + health.failureCount;
    if (total > 5 && health.failureCount / total > 0.5) {
      console.warn(
        `[FEED HEALTH WARNING] ${feedUrl} has high failure rate: ${health.failureCount}/${total}`
      );
    }
  } catch (e) {
    console.error('[FEED HEALTH ERROR] Failed to update feed health:', e);
    // Don't throw - health tracking failure shouldn't break feed processing
  }
}

/**
 * Enhanced refresh logic with batch processing and detailed logging
 */
async function refreshFeedsWithBatching(apiKey: string) {
  const startTime = Date.now();
  console.log(`[BATCH START] Initiating news feed batch refresh at ${new Date().toISOString()}`);
  console.log(`[BATCH CONFIG] Interval: ${BATCH_CONFIG.interval}min, BatchSize: ${BATCH_CONFIG.batchSize}, MaxRetries: ${BATCH_CONFIG.maxRetries}`);

  try {
    const results = await refreshFeedsLogic(apiKey);
    const duration = Date.now() - startTime;

    console.log(`[BATCH COMPLETE] Refresh completed in ${duration}ms`);
    console.log(`[BATCH RESULTS] Processed: ${results.processed}, Skipped: ${results.skipped}, Errors: ${results.errors}`);

    // Log batch completion to Firestore for monitoring
    await logBatchCompletion({
      timestamp: new Date(),
      duration,
      processed: results.processed,
      skipped: results.skipped,
      errors: results.errors,
      status: 'success',
    });

    return results;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[BATCH ERROR] Batch refresh failed after ${duration}ms:`, error);

    // Log batch failure to Firestore for monitoring
    await logBatchCompletion({
      timestamp: new Date(),
      duration,
      processed: 0,
      skipped: 0,
      errors: 1,
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
}

/**
 * Log batch completion metrics to Firestore for monitoring and analytics
 */
async function logBatchCompletion(metrics: Record<string, unknown>) {
  try {
    await db.collection('batch_logs').add({
      ...metrics,
      batchInterval: BATCH_CONFIG.interval,
      batchSize: BATCH_CONFIG.batchSize,
    });
  } catch (error) {
    console.error('[BATCH LOG ERROR] Failed to log batch metrics:', error);
    // Don't throw - logging failure shouldn't fail the batch
  }
}

// 1) Scheduled gatherer (hourly batch refresh)
export const refreshFeeds = onSchedule(
  {schedule: `every ${BATCH_CONFIG.interval} minutes`, timeZone: BATCH_CONFIG.timeZone, secrets: [OPENAI_API_KEY]},
  async () => {
    await refreshFeedsWithBatching(OPENAI_API_KEY.value());
  }
);

// 1a) Initialize feeds collection (one-time setup)
export const initializeFeeds = onRequest(
  {cors: false},
  async (req, res) => {
    try {
      // CORS check for admin endpoints
      const origin = req.headers.origin;
      if (!checkCORS(origin)) {
        res.status(403).json({error: "Forbidden: Invalid origin"});
        return;
      }
      res.set('Access-Control-Allow-Origin', origin);

      console.log("[INIT FEEDS] Initializing feeds collection");
      await initializeFeedsCollection();
      res.json({
        success: true,
        message: "Feeds collection initialized",
        feedCount: FEED_SOURCES.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[INIT FEEDS ERROR]', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// 1b) Manual trigger for batch refresh (HTTP callable - restricted)
export const refreshFeedsManual = onRequest(
  {cors: false, secrets: [OPENAI_API_KEY], timeoutSeconds: 540},
  async (req, res) => {
    try {
      // CORS check for admin endpoints
      const origin = req.headers.origin;
      if (!checkCORS(origin)) {
        res.status(403).json({error: "Forbidden: Invalid origin"});
        return;
      }
      res.set('Access-Control-Allow-Origin', origin);

      console.log("[MANUAL TRIGGER] Feed refresh initiated via HTTP request");
      const results = await refreshFeedsWithBatching(OPENAI_API_KEY.value());
      res.json({
        success: true,
        message: "Batch feed refresh complete",
        batchConfig: BATCH_CONFIG,
        results,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      console.error("[MANUAL TRIGGER ERROR] Error in refreshFeedsManual:", err);
      res.status(500).json({
        success: false,
        error: err.message || "Unknown error",
        stack: err.stack,
        timestamp: new Date().toISOString(),
      });
    }
  }
);

// 1c) Test single article processing
export const testSingleArticle = onRequest(
  {cors: true, secrets: [OPENAI_API_KEY]},
  async (req, res) => {
    try {
      console.log("[TEST] Single article processing test initiated");
      const client = new OpenAI({apiKey: OPENAI_API_KEY.value()});
      const parser = new Parser();

      const feedUrl = FEEDS[0];
      console.log(`[TEST] Fetching feed: ${feedUrl}`);
      const feed = await parser.parseURL(feedUrl);
      console.log(`[TEST] Found ${feed.items.length} items`);

      if (feed.items.length === 0) {
        res.json({error: "No items in feed", timestamp: new Date().toISOString()});
        return;
      }

      const item = feed.items[0];
      const url = item.link!;
      console.log(`[TEST] Processing: ${url}`);

      // Extract
      const content = await extractArticle(url);
      console.log(`[TEST] Extracted ${content.text?.length || 0} characters`);

      // Summarize
      const brief = await summarizeAndTag(client, {
        url,
        source: (item.creator || feed.title || "").toString(),
        publishedAt: item.isoDate || item.pubDate || "",
        title: content.title,
        text: content.text,
      });

      console.log(`[TEST] Summarized: ${brief.title}`);

      res.json({
        success: true,
        batchConfig: BATCH_CONFIG,
        article: {
          url,
          extractedLength: content.text?.length || 0,
          brief,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      console.error("Error in testSingleArticle:", err);
      res.status(500).json({
        success: false,
        error: err.message || "Unknown error",
        stack: err.stack,
      });
    }
  }
);

// 4) Feed Health Report (monitoring endpoint)
export const feedHealthReport = onRequest({cors: true}, async (req, res) => {
  try {
    // Fetch all feed health records from Firestore
    const healthSnapshot = await db.collection('feed_health').get();

    const healthData = healthSnapshot.docs.map(doc => {
      const health = doc.data() as FeedHealth;
      const total = health.successCount + health.failureCount;

      // Handle Firestore Timestamp or Date
      const lastSuccess = health.lastSuccessAt instanceof Date
        ? health.lastSuccessAt.toISOString()
        : health.lastSuccessAt?.toDate?.()?.toISOString();
      const lastFailure = health.lastFailureAt instanceof Date
        ? health.lastFailureAt.toISOString()
        : health.lastFailureAt?.toDate?.()?.toISOString();

      return {
        url: health.url,
        successCount: health.successCount,
        failureCount: health.failureCount,
        successRate: total > 0 ? (health.successCount / total * 100).toFixed(2) + '%' : 'N/A',
        lastSuccess,
        lastFailure,
        lastError: health.lastError,
        status: total === 0 ? 'UNKNOWN' : (health.failureCount / total > 0.5 ? 'UNHEALTHY' : 'HEALTHY'),
      };
    });

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      totalFeeds: FEEDS.length,
      monitoredFeeds: healthData.length,
      feeds: healthData,
    });
  } catch (error) {
    console.error('[FEED HEALTH ERROR]', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// 2) Ask‑the‑Brief (RAG over last N summaries; anonymous)
export const askBrief = onRequest({cors: false, secrets: [OPENAI_API_KEY]}, async (req, res) => {
  try {
    // CORS check
    const origin = req.headers.origin;
    if (!checkCORS(origin)) {
      res.status(403).json({error: "Forbidden: Invalid origin"});
      return;
    }
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    // Rate limiting
    const ip = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.ip || 'unknown';
    if (!checkRateLimit(ip)) {
      res.status(429).json({error: "Rate limit exceeded. Please try again later."});
      return;
    }

    // Input validation and sanitization
    const rawQuery = (req.query.q || req.body?.q || "").toString();
    const q = rawQuery.replace(/<[^>]*>/g, '').slice(0, 500); // Strip HTML, limit length
    if (!q || q.trim().length < 3) {
      res.status(400).json({error: "Query required (min 3 characters)"});
      return;
    }

    const client = new OpenAI({apiKey: OPENAI_API_KEY.value()});

    // Fetch recent docs (keep it simple; Firestore has no native vector search)
    const snap = await db.collection("articles").orderBy("createdAt", "desc").limit(500).get();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = snap.docs.map((d) => ({id: d.id, ...d.data()} as any));

    // Embed the query (MUST match stored embedding dimensions: 512)
    const qEmb = (await client.embeddings.create({
      model: "text-embedding-3-small",
      input: q,
      dimensions: 512,
    })).data[0].embedding;

    // Cosine similarity (naive in-memory)
    const cos = (a: number[], b: number[]) => {
      const dot = a.reduce((s, v, i) => s + v * b[i], 0);
      const ma = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
      const mb = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
      return dot / (ma * mb);
    };
    const ranked = items
      .map((it) => ({it, score: cos(qEmb, it.embedding)}))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    const context = ranked.map((r) =>
      `TITLE: ${r.it.title}\nBULLETS:\n- ${r.it.bullets5.join("\n- ")}\nWHY:\n${
        Object.entries(r.it.whyItMatters).map(([k, v]) => `${k.toUpperCase()}: ${v}`).join("\n")
      }\nURL: ${r.it.url}`
    ).join("\n\n---\n\n");

    const answer = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 400,
      messages: [
        {
          role: "system",
          content: "Answer using ONLY the provided context. If not found, say so. " +
            "Provide short answer + 3 bullet rationale + cite URLs you used.",
        },
        {role: "user", content: `Question: ${q}\n\nContext:\n${context}`},
      ],
    });

    const text = answer.choices[0]?.message?.content ?? "No answer.";

    res.json({answer: text, sources: ranked.map((r) => ({url: r.it.url, title: r.it.title}))});
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const error = e as any;
    res.status(500).json({error: error.message || "unknown_error"});
  }
});

/**
 * Hourly refresh of articles
 * Fetches new articles from Insurance Journal RSS feed
 * Runs every hour at minute 0
 */
export const hourlyArticleRefresh = onSchedule("every 1 hours", async () => {
  console.log("🔄 Starting hourly article refresh...");

  try {
    const client = new OpenAI({apiKey: OPENAI_API_KEY.value()});
    const parser = new Parser();

    // Insurance Journal RSS feed only
    const feedSources = [
      "https://www.insurancejournal.com/rss/news/national/",
    ];

    const newArticles: Array<{
      title: string;
      url: string;
      source: string;
      publishedAt: string;
      description: string;
      content: string;
      createdAt: number;
      updatedAt: number;
    }> = [];
    const oneHourAgo = Date.now() - (60 * 60 * 1000);

    // Fetch from all sources
    for (const feedUrl of feedSources) {
      try {
        const feed = await parser.parseURL(feedUrl);

        feed.items.forEach(item => {
          const pubDate = item.pubDate ? new Date(item.pubDate).getTime() : Date.now();

          // Only include articles from the last hour
          if (pubDate >= oneHourAgo) {
            newArticles.push({
              title: item.title || "Untitled",
              url: item.link || "",
              source: feed.title || "Unknown Source",
              publishedAt: new Date(pubDate).toISOString(),
              description: item.content || item.summary || "",
              content: item.content || item.summary || "",
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
          }
        });
      } catch (error) {
        console.warn(`Failed to fetch from ${feedUrl}:`, error);
      }
    }

    if (newArticles.length === 0) {
      console.log("✓ No new articles found in the last hour");
      return;
    }

    // Process and store new articles
    const batch = db.batch();
    let processedCount = 0;

    for (const article of newArticles) {
      try {
        // Check if article already exists
        const existing = await db.collection("articles")
          .where("url", "==", article.url)
          .limit(1)
          .get();

        if (existing.empty) {
          // Extract and process article
          const extracted = await extractArticle(article.url);
          const processed = await summarizeAndTag(client, { ...extracted, source: article.source });

          const docRef = db.collection("articles").doc();
          batch.set(docRef, {
            ...article,
            ...processed,
            aiScore: Math.random() * 100,
            impactScore: processed.impactScore || Math.random() * 100,
          });

          processedCount++;
        }
      } catch (error) {
        console.warn(`Failed to process article ${article.url}:`, error);
      }
    }

    if (processedCount > 0) {
      await batch.commit();
      console.log(`✓ Added ${processedCount} new articles`);
    }

    console.log("✓ Hourly refresh complete");
  } catch (error) {
    console.error("❌ Error during hourly refresh:", error);
  }
});

