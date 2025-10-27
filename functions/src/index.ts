import {onSchedule} from "firebase-functions/v2/scheduler";
import {onRequest} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import OpenAI from "openai";
import Parser from "rss-parser";
import {extractArticle, summarizeAndTag, embedForRAG, hashUrl} from "./agents";

initializeApp();
const db = getFirestore();
const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

/**
 * RSS Feed sources for batch processing
 * Configured for reliable insurance news feeds
 */
const FEEDS = [
  "https://www.insurancejournal.com/rss/news/national/",
  "https://www.insurancejournal.com/rss/news/international/",
  // Note: Some feeds require authentication or block automated access
  // Add more working RSS feeds as needed
];

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

          // Build an embedding for Ask‑the‑Brief
          const emb = await embedForRAG(
            client,
            `${brief.title}\n${brief.bullets5.join("\n")}\n${Object.values(brief.whyItMatters).join("\n")}`
          );

          await docRef.set({
            ...brief,
            publishedAt: item.isoDate || item.pubDate || "",
            createdAt: new Date(),
            embedding: emb,
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
      console.error(`[FEED ERROR] Error fetching feed ${feedUrl}:`, error);
      results.errors++;
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

// 1b) Manual trigger for batch refresh (HTTP callable)
export const refreshFeedsManual = onRequest(
  {cors: true, secrets: [OPENAI_API_KEY], timeoutSeconds: 540},
  async (req, res) => {
    try {
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

// 2) Ask‑the‑Brief (RAG over last N summaries; anonymous)
export const askBrief = onRequest({cors: true, secrets: [OPENAI_API_KEY]}, async (req, res) => {
  try {
    const q = (req.query.q || req.body?.q || "").toString().slice(0, 500);
    if (!q) {
      res.status(400).json({error: "q required"});
      return;
    }
    const client = new OpenAI({apiKey: OPENAI_API_KEY.value()});

    // Fetch recent docs (keep it simple; Firestore has no native vector search)
    const snap = await db.collection("articles").orderBy("createdAt", "desc").limit(500).get();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = snap.docs.map((d) => ({id: d.id, ...d.data()} as any));

    // Embed the query
    const qEmb = (await client.embeddings.create({
      model: "text-embedding-3-small",
      input: q,
      dimensions: 256,
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

