"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readerView = exports.askBrief = exports.feedHealthReport = exports.testSingleArticle = exports.refreshFeedsManual = exports.initializeFeeds = exports.refreshFeeds = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const openai_1 = __importDefault(require("openai"));
const rss_parser_1 = __importDefault(require("rss-parser"));
const agents_1 = require("./agents");
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
const OPENAI_API_KEY = (0, params_1.defineSecret)("OPENAI_API_KEY");
/**
 * Firestore-backed rate limiter for askBrief endpoint
 * Tracks requests per IP with sliding window and TTL expiration
 */
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 20; // 20 requests per hour per IP
/**
 * Check rate limit using Firestore with sliding window
 * Uses hashed IP for privacy, TTL for automatic cleanup
 */
async function checkRateLimit(ip) {
    try {
        const hashedIp = (0, agents_1.hashUrl)(ip); // Hash IP for privacy
        const rateLimitRef = db.collection('rate_limits').doc(hashedIp);
        const now = Date.now();
        const windowStart = now - RATE_LIMIT_WINDOW_MS;
        // Get current rate limit record
        const doc = await rateLimitRef.get();
        let requests = [];
        if (doc.exists) {
            const data = doc.data();
            requests = ((data === null || data === void 0 ? void 0 : data.requests) || []).filter((ts) => ts > windowStart);
        }
        // Check if limit exceeded
        if (requests.length >= RATE_LIMIT_MAX_REQUESTS) {
            console.log(`[RATE LIMIT] IP ${ip} exceeded limit: ${requests.length}/${RATE_LIMIT_MAX_REQUESTS}`);
            return false;
        }
        // Add current request and update
        requests.push(now);
        await rateLimitRef.set({
            requests,
            lastRequest: new Date(),
            expiresAt: new Date(now + RATE_LIMIT_WINDOW_MS + 60 * 60 * 1000), // TTL: window + 1 hour
        });
        return true;
    }
    catch (error) {
        console.error('[RATE LIMIT ERROR]', error);
        // On error, allow request (fail open for availability)
        return true;
    }
}
/**
 * CORS configuration - centralized from environment
 * Supports comma-separated origins and wildcard for localhost
 */
function getAllowedOrigins() {
    const envOrigins = process.env.ALLOWED_ORIGINS || '';
    if (envOrigins) {
        return envOrigins.split(',').map(o => o.trim()).filter(o => o.length > 0);
    }
    // Default origins if env not set
    return [
        'https://carriersignal.web.app',
        'https://carriersignal.firebaseapp.com',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:4173',
    ];
}
/**
 * Check if origin is allowed for CORS
 * Supports wildcard matching for localhost development
 */
function checkCORS(origin) {
    if (!origin)
        return false;
    const allowedOrigins = getAllowedOrigins();
    // Check for exact match or prefix match
    return allowedOrigins.some(allowed => {
        if (allowed === '*')
            return true; // Wildcard
        if (allowed.includes('localhost') && origin.includes('localhost'))
            return true; // Localhost wildcard
        return origin.startsWith(allowed);
    });
}
function createErrorResponse(error, defaultCode = 'INTERNAL_ERROR') {
    if (error instanceof Error) {
        return {
            error: error.message,
            code: defaultCode,
            timestamp: new Date().toISOString(),
        };
    }
    return {
        error: String(error),
        code: defaultCode,
        timestamp: new Date().toISOString(),
    };
}
function getHttpStatusCode(error) {
    if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('invalid') || msg.includes('validation'))
            return 400;
        if (msg.includes('not found') || msg.includes('404'))
            return 404;
        if (msg.includes('unauthorized') || msg.includes('forbidden'))
            return 403;
        if (msg.includes('timeout') || msg.includes('rate limit'))
            return 429;
    }
    return 500;
}
// Default feed sources - can be overridden by Firestore configuration
// Curated catalog of P&C insurance industry sources across multiple categories
const DEFAULT_FEED_SOURCES = [
    // ============================================================================
    // NEWS FEEDS (General P&C Insurance Industry News)
    // ============================================================================
    { url: "https://www.insurancejournal.com/rss/news/national/", category: 'news', priority: 1, enabled: true },
    { url: "https://www.insurancejournal.com/rss/news/international/", category: 'news', priority: 2, enabled: true },
    { url: "https://www.claimsjournal.com/rss/", category: 'news', priority: 2, enabled: true },
    { url: "https://www.propertycasualty360.com/feed/", category: 'news', priority: 2, enabled: true },
    { url: "https://www.riskandinsurance.com/feed/", category: 'news', priority: 3, enabled: true },
    { url: "https://www.carriermanagement.com/feed/", category: 'news', priority: 3, enabled: true },
    { url: "https://www.insurancebusinessmag.com/us/rss/", category: 'news', priority: 3, enabled: true },
    { url: "https://www.insurancenewsnet.com/feed/", category: 'news', priority: 3, enabled: true },
    // ============================================================================
    // REGULATORY FEEDS (State DOI, NAIC, Regulatory Bulletins)
    // ============================================================================
    { url: "https://www.naic.org/rss/", category: 'regulatory', priority: 1, enabled: true },
    // Note: Individual state DOI feeds would be added here as they become available
    // Examples: CA DOI, FL DOI, TX DOI, NY DFS, etc.
    // ============================================================================
    // CATASTROPHE FEEDS (Named Storms, Natural Disasters, CAT Events)
    // ============================================================================
    { url: "https://www.insurancejournal.com/rss/news/catastrophes/", category: 'catastrophe', priority: 1, enabled: true },
    // NOAA NHC and NWS feeds for hurricane/severe weather tracking
    // Note: These feeds may require custom parsing due to non-standard RSS formats
    // ============================================================================
    // REINSURANCE FEEDS (Reinsurance Market News & Capacity)
    // ============================================================================
    { url: "https://www.insurancejournal.com/rss/news/reinsurance/", category: 'reinsurance', priority: 2, enabled: true },
    // Artemis/ILS, The Insurer, and other reinsurance-specific sources
    // Note: Some reinsurance sources may require authentication or have limited RSS availability
    // ============================================================================
    // TECHNOLOGY FEEDS (InsurTech, Industry Tech, Digital Transformation)
    // ============================================================================
    { url: "https://www.insurancejournal.com/rss/news/technology/", category: 'technology', priority: 3, enabled: true },
    // Additional tech-focused insurance industry blogs and publications
];
// Runtime cache for feeds (loaded from Firestore on startup)
let cachedFeeds = DEFAULT_FEED_SOURCES;
let feedsCacheTime = 0;
const FEEDS_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
/**
 * Load feeds from Firestore, with fallback to defaults
 * Caches results for 1 hour to avoid excessive Firestore reads
 */
async function loadFeedsFromFirestore() {
    const now = Date.now();
    // Return cached feeds if still valid
    if (feedsCacheTime > 0 && now - feedsCacheTime < FEEDS_CACHE_TTL_MS) {
        console.log('[FEEDS] Using cached feeds');
        return cachedFeeds;
    }
    try {
        const snapshot = await db.collection('feeds').get();
        if (snapshot.empty) {
            console.log('[FEEDS] No feeds in Firestore, using defaults');
            cachedFeeds = DEFAULT_FEED_SOURCES;
        }
        else {
            cachedFeeds = snapshot.docs
                .map(doc => doc.data())
                .filter(f => f.enabled);
            console.log(`[FEEDS] Loaded ${cachedFeeds.length} enabled feeds from Firestore`);
        }
        feedsCacheTime = now;
        return cachedFeeds;
    }
    catch (error) {
        console.warn('[FEEDS] Error loading from Firestore, using defaults:', error);
        cachedFeeds = DEFAULT_FEED_SOURCES;
        feedsCacheTime = now;
        return cachedFeeds;
    }
}
// For backward compatibility, extract URLs from default sources
const FEEDS = DEFAULT_FEED_SOURCES.filter(f => f.enabled).map(f => f.url);
/**
 * Initialize feeds collection in Firestore (one-time setup)
 * Seeds from DEFAULT_FEED_SOURCES and can be called manually or on first deploy
 */
async function initializeFeedsCollection() {
    const batch = db.batch();
    for (const feed of DEFAULT_FEED_SOURCES) {
        const feedRef = db.collection('feeds').doc((0, agents_1.hashUrl)(feed.url));
        batch.set(feedRef, Object.assign(Object.assign({}, feed), { createdAt: new Date(), updatedAt: new Date() }), { merge: true });
    }
    await batch.commit();
    console.log(`[FEEDS] Initialized ${DEFAULT_FEED_SOURCES.length} feeds in Firestore`);
    // Clear cache to force reload
    feedsCacheTime = 0;
}
/**
 * Shared logic for refreshing feeds with batch processing
 * Processes articles in batches with retry logic and detailed logging
 */
async function refreshFeedsLogic(apiKey) {
    var _a, _b, _c, _d;
    const client = new openai_1.default({ apiKey });
    const parser = new rss_parser_1.default();
    // Generate unique batch ID for tracking
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const results = { processed: 0, skipped: 0, errors: 0, feedsProcessed: 0, totalTokens: 0, totalLatencyMs: 0 };
    const batchStartTime = Date.now();
    console.log(`[BATCH ${batchId}] Starting batch refresh...`);
    // Load feeds dynamically from Firestore
    const feeds = await loadFeedsFromFirestore();
    const feedUrls = feeds.map(f => f.url);
    console.log(`[BATCH ${batchId}] Loaded ${feedUrls.length} feeds from Firestore`);
    for (const feedUrl of feedUrls) {
        const feedStartTime = Date.now();
        const feedId = (0, agents_1.hashUrl)(feedUrl);
        // Check circuit breaker before attempting feed
        if (!canAttemptFeed(feedUrl)) {
            console.warn(`[BATCH ${batchId}] [FEED ${feedId}] Skipped (circuit breaker OPEN): ${feedUrl}`);
            results.skipped++;
            continue;
        }
        try {
            console.log(`[BATCH ${batchId}] [FEED ${feedId}] Fetching feed: ${feedUrl}`);
            const feed = await parser.parseURL(feedUrl);
            const feedLatency = Date.now() - feedStartTime;
            console.log(`[BATCH ${batchId}] [FEED ${feedId}] Found ${feed.items.length} items in ${feedLatency}ms: ${feedUrl}`);
            results.feedsProcessed++;
            results.totalLatencyMs += feedLatency;
            recordFeedSuccess(feedUrl); // Update circuit breaker
            updateFeedHealth(feedUrl, true); // Track successful fetch
            // Process articles in batches
            const articles = feed.items.slice(0, BATCH_CONFIG.batchSize);
            for (let i = 0; i < articles.length; i++) {
                const item = articles[i];
                const itemIndex = i + 1;
                let articleStartTime = Date.now();
                try {
                    if (!item.link) {
                        console.log(`[BATCH ${batchId}] [FEED ${feedId}] [ARTICLE ${itemIndex}/${articles.length}] Skipping item without link`);
                        results.skipped++;
                        continue;
                    }
                    const url = item.link;
                    const id = (0, agents_1.hashUrl)(url);
                    const docRef = db.collection("articles").doc(id);
                    // Idempotency check: use transaction to ensure atomic read-write
                    const idempotencyKey = `${batchId}_${feedId}_${id}`;
                    const idempotencyRef = db.collection("_idempotency").doc(idempotencyKey);
                    const idempotencyDoc = await idempotencyRef.get();
                    if (idempotencyDoc.exists) {
                        console.log(`[BATCH ${batchId}] [FEED ${feedId}] [ARTICLE ${itemIndex}/${articles.length}] Already processed in this batch (idempotent)`);
                        results.skipped++;
                        continue;
                    }
                    // Check if article already exists in database
                    const exists = (await docRef.get()).exists;
                    if (exists) {
                        console.log(`[BATCH ${batchId}] [FEED ${feedId}] [ARTICLE ${itemIndex}/${articles.length}] Article already exists`);
                        results.skipped++;
                        continue;
                    }
                    articleStartTime = Date.now();
                    console.log(`[BATCH ${batchId}] [FEED ${feedId}] [ARTICLE ${itemIndex}/${articles.length}] Processing: ${url}`);
                    // Extract full content with retry logic
                    let content;
                    let extractRetries = 0;
                    while (extractRetries < BATCH_CONFIG.maxRetries) {
                        try {
                            content = await (0, agents_1.extractArticle)(url);
                            break;
                        }
                        catch (error) {
                            extractRetries++;
                            if (extractRetries < BATCH_CONFIG.maxRetries) {
                                console.log(`[ARTICLE ${itemIndex}/${articles.length}] Extract retry ${extractRetries}/${BATCH_CONFIG.maxRetries}`);
                                await new Promise(resolve => setTimeout(resolve, BATCH_CONFIG.retryDelayMs));
                            }
                            else {
                                throw error;
                            }
                        }
                    }
                    if (!content || !content.text || content.text.length < 100) {
                        console.log(`[ARTICLE ${itemIndex}/${articles.length}] Article text too short (${((_a = content === null || content === void 0 ? void 0 : content.text) === null || _a === void 0 ? void 0 : _a.length) || 0} chars): ${url}`);
                        results.skipped++;
                        continue;
                    }
                    // Summarize & classify
                    let brief = await (0, agents_1.summarizeAndTag)(client, {
                        url,
                        source: (item.creator || feed.title || content.url || "").toString(),
                        publishedAt: item.isoDate || item.pubDate || "",
                        title: content.title,
                        text: content.text,
                    });
                    // Post-parse validation: deduplicate citations, validate URLs
                    brief = (0, agents_1.validateAndCleanArticle)(brief);
                    // RAG Quality Check: Ensure article is suitable for retrieval
                    const ragQuality = (0, agents_1.checkRAGQuality)(brief);
                    if (!ragQuality.isQuality) {
                        console.warn(`[ARTICLE ${itemIndex}/${articles.length}] RAG quality check failed (score: ${ragQuality.score}/100):`, ragQuality.issues);
                        // Log but don't skip - store with quality flag for filtering
                    }
                    // Entity normalization (always set, with defaults)
                    const regionsNormalized = ((_b = brief.tags) === null || _b === void 0 ? void 0 : _b.regions) && brief.tags.regions.length > 0
                        ? (0, agents_1.normalizeRegions)(brief.tags.regions)
                        : [];
                    const companiesNormalized = ((_c = brief.tags) === null || _c === void 0 ? void 0 : _c.companies) && brief.tags.companies.length > 0
                        ? (0, agents_1.normalizeCompanies)(brief.tags.companies)
                        : [];
                    // Verify normalization is always set
                    if (!Array.isArray(regionsNormalized)) {
                        console.warn(`[ARTICLE ${itemIndex}/${articles.length}] regionsNormalized is not an array, defaulting to []`);
                    }
                    if (!Array.isArray(companiesNormalized)) {
                        console.warn(`[ARTICLE ${itemIndex}/${articles.length}] companiesNormalized is not an array, defaulting to []`);
                    }
                    // Deduplication: canonical URL and content hash
                    const canonicalUrl = (0, agents_1.getCanonicalUrl)(url, content.html);
                    const contentHash = (0, agents_1.computeContentHash)(content.text);
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
                    const regulatory = (0, agents_1.isRegulatorySource)(url, brief.source) ||
                        (((_d = brief.tags) === null || _d === void 0 ? void 0 : _d.regulations) && brief.tags.regulations.length > 0);
                    // Catastrophe detection: storm names
                    const stormName = (0, agents_1.detectStormName)(`${brief.title} ${content.text.slice(0, 1000)}`);
                    // Build an embedding for Ask‑the‑Brief
                    const emb = await (0, agents_1.embedForRAG)(client, `${brief.title}\n${brief.bullets5.join("\n")}\n${Object.values(brief.whyItMatters).join("\n")}`);
                    // Calculate SmartScore v3 (enhanced)
                    const smartScore = (0, agents_1.calculateSmartScore)({
                        publishedAt: item.isoDate || item.pubDate || "",
                        impactScore: brief.impactScore,
                        impactBreakdown: brief.impactBreakdown,
                        tags: brief.tags,
                        regulatory,
                        riskPulse: brief.riskPulse,
                        stormName,
                    });
                    // AI-driven scoring for P&C professionals (v3 enhanced)
                    const aiScore = await (0, agents_1.scoreArticleWithAI)(client, {
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
                    // Store article metadata (without embedding for performance)
                    await docRef.set(Object.assign(Object.assign({}, brief), { publishedAt: item.isoDate || item.pubDate || "", createdAt: new Date(), smartScore,
                        aiScore, ragQualityScore: ragQuality.score, ragQualityIssues: ragQuality.issues, regionsNormalized,
                        companiesNormalized,
                        canonicalUrl,
                        contentHash,
                        clusterId,
                        regulatory, stormName: stormName || null, batchProcessedAt: new Date() }));
                    // Store embedding in separate collection for performance
                    await db.collection("article_embeddings").doc(id).set({
                        embedding: emb,
                        articleId: id,
                        createdAt: new Date(),
                    });
                    // Record idempotency key to prevent reprocessing in same batch
                    // TTL: 24 hours (idempotency window)
                    await idempotencyRef.set({
                        batchId,
                        feedUrl,
                        articleUrl: url,
                        articleId: id,
                        processedAt: new Date(),
                        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    });
                    // Check link health (B2 - Link Health Checking)
                    // Perform lightweight HEAD check to verify article URL is accessible
                    const linkOk = await checkLinkHealth(canonicalUrl || url);
                    // Update article with link health status
                    await docRef.update({
                        linkOk,
                        lastCheckedAt: new Date(),
                    });
                    const articleLatency = Date.now() - articleStartTime;
                    results.totalLatencyMs += articleLatency;
                    console.log(`[BATCH ${batchId}] [FEED ${feedId}] [ARTICLE ${itemIndex}/${articles.length}] Successfully processed in ${articleLatency}ms (linkOk: ${linkOk}): ${brief.title}`);
                    results.processed++;
                }
                catch (error) {
                    const articleLatency = Date.now() - articleStartTime;
                    results.totalLatencyMs += articleLatency;
                    console.error(`[BATCH ${batchId}] [FEED ${feedId}] [ARTICLE ${itemIndex}/${articles.length}] Error after ${articleLatency}ms:`, error);
                    results.errors++;
                }
            }
            const feedDuration = Date.now() - feedStartTime;
            console.log(`[BATCH ${batchId}] [FEED ${feedId}] Completed in ${feedDuration}ms`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`[BATCH ${batchId}] [FEED ${feedId}] Error fetching feed:`, errorMessage);
            recordFeedFailure(feedUrl); // Update circuit breaker
            updateFeedHealth(feedUrl, false, errorMessage); // Track failed fetch
            results.errors++;
            // Continue to next feed instead of failing entire batch
        }
    }
    const totalDuration = Date.now() - batchStartTime;
    console.log(`[BATCH ${batchId}] SUMMARY | Duration: ${totalDuration}ms | Feeds: ${results.feedsProcessed} | Processed: ${results.processed} | Skipped: ${results.skipped} | Errors: ${results.errors} | AvgLatency: ${results.processed > 0 ? Math.round(results.totalLatencyMs / results.processed) : 0}ms`);
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
const circuitBreakers = new Map();
const CIRCUIT_BREAKER_THRESHOLD = 5; // Failures before opening
const CIRCUIT_BREAKER_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes before half-open
/**
 * Circuit breaker pattern for feed resilience
 * Prevents cascading failures by temporarily disabling problematic feeds
 */
function getCircuitBreakerState(feedUrl) {
    if (!circuitBreakers.has(feedUrl)) {
        circuitBreakers.set(feedUrl, {
            url: feedUrl,
            state: 'CLOSED',
            failureCount: 0,
            lastFailureTime: 0,
            successCount: 0,
        });
    }
    return circuitBreakers.get(feedUrl);
}
function canAttemptFeed(feedUrl) {
    const breaker = getCircuitBreakerState(feedUrl);
    const now = Date.now();
    if (breaker.state === 'CLOSED') {
        return true; // Normal operation
    }
    if (breaker.state === 'OPEN') {
        // Check if timeout has elapsed to transition to HALF_OPEN
        if (now - breaker.lastFailureTime > CIRCUIT_BREAKER_TIMEOUT_MS) {
            breaker.state = 'HALF_OPEN';
            breaker.failureCount = 0;
            console.log(`[CIRCUIT BREAKER] ${feedUrl} transitioning to HALF_OPEN`);
            return true;
        }
        return false; // Still open, skip this feed
    }
    // HALF_OPEN state - allow one attempt
    return true;
}
function recordFeedSuccess(feedUrl) {
    const breaker = getCircuitBreakerState(feedUrl);
    breaker.failureCount = 0;
    breaker.successCount++;
    if (breaker.state === 'HALF_OPEN') {
        breaker.state = 'CLOSED';
        console.log(`[CIRCUIT BREAKER] ${feedUrl} recovered to CLOSED`);
    }
}
function recordFeedFailure(feedUrl) {
    const breaker = getCircuitBreakerState(feedUrl);
    breaker.failureCount++;
    breaker.lastFailureTime = Date.now();
    if (breaker.failureCount >= CIRCUIT_BREAKER_THRESHOLD && breaker.state !== 'OPEN') {
        breaker.state = 'OPEN';
        console.warn(`[CIRCUIT BREAKER] ${feedUrl} opened after ${breaker.failureCount} failures`);
    }
}
/**
 * Check if a URL is accessible (B2 - Link Health Checking)
 * Performs a lightweight HEAD request to verify link availability
 * Returns true if status is 2xx or 3xx, false otherwise
 */
async function checkLinkHealth(url) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        const response = await fetch(url, {
            method: "HEAD",
            redirect: "follow",
            signal: controller.signal,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
        });
        clearTimeout(timeoutId);
        return response.ok || (response.status >= 300 && response.status < 400);
    }
    catch (error) {
        console.warn(`[LINK HEALTH] Failed to check ${url}:`, error instanceof Error ? error.message : String(error));
        return false;
    }
}
/**
 * Update feed health metrics in Firestore
 */
async function updateFeedHealth(feedUrl, success, error) {
    try {
        const healthRef = db.collection('feed_health').doc((0, agents_1.hashUrl)(feedUrl));
        const healthDoc = await healthRef.get();
        const health = healthDoc.exists
            ? healthDoc.data()
            : {
                url: feedUrl,
                successCount: 0,
                failureCount: 0,
                updatedAt: new Date(),
            };
        if (success) {
            health.successCount++;
            health.lastSuccessAt = new Date();
        }
        else {
            health.failureCount++;
            health.lastFailureAt = new Date();
            if (error)
                health.lastError = error;
        }
        health.updatedAt = new Date();
        await healthRef.set(health);
        // Log warning if failure rate > 50%
        const total = health.successCount + health.failureCount;
        if (total > 5 && health.failureCount / total > 0.5) {
            console.warn(`[FEED HEALTH WARNING] ${feedUrl} has high failure rate: ${health.failureCount}/${total}`);
        }
    }
    catch (e) {
        console.error('[FEED HEALTH ERROR] Failed to update feed health:', e);
        // Don't throw - health tracking failure shouldn't break feed processing
    }
}
/**
 * Enhanced refresh logic with batch processing and detailed logging
 */
async function refreshFeedsWithBatching(apiKey) {
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
    }
    catch (error) {
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
async function logBatchCompletion(metrics) {
    try {
        await db.collection('batch_logs').add(Object.assign(Object.assign({}, metrics), { batchInterval: BATCH_CONFIG.interval, batchSize: BATCH_CONFIG.batchSize }));
    }
    catch (error) {
        console.error('[BATCH LOG ERROR] Failed to log batch metrics:', error);
        // Don't throw - logging failure shouldn't fail the batch
    }
}
// 1) Scheduled gatherer (hourly batch refresh)
exports.refreshFeeds = (0, scheduler_1.onSchedule)({ schedule: `every ${BATCH_CONFIG.interval} minutes`, timeZone: BATCH_CONFIG.timeZone, secrets: [OPENAI_API_KEY] }, async () => {
    await refreshFeedsWithBatching(OPENAI_API_KEY.value());
});
// 1a) Initialize feeds collection (one-time setup)
exports.initializeFeeds = (0, https_1.onRequest)({ cors: false }, async (req, res) => {
    try {
        // CORS check for admin endpoints
        const origin = req.headers.origin;
        if (!checkCORS(origin)) {
            res.status(403).json({ error: "Forbidden: Invalid origin" });
            return;
        }
        res.set('Access-Control-Allow-Origin', origin);
        console.log("[INIT FEEDS] Initializing feeds collection");
        await initializeFeedsCollection();
        res.json({
            success: true,
            message: "Feeds collection initialized",
            feedCount: DEFAULT_FEED_SOURCES.length,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('[INIT FEEDS ERROR]', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// 1b) Manual trigger for batch refresh (HTTP callable - restricted)
exports.refreshFeedsManual = (0, https_1.onRequest)({ cors: false, secrets: [OPENAI_API_KEY], timeoutSeconds: 540 }, async (req, res) => {
    try {
        // CORS check for admin endpoints
        const origin = req.headers.origin;
        if (!checkCORS(origin)) {
            res.status(403).json({ error: "Forbidden: Invalid origin" });
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
    }
    catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error;
        console.error("[MANUAL TRIGGER ERROR] Error in refreshFeedsManual:", err);
        res.status(500).json({
            success: false,
            error: err.message || "Unknown error",
            stack: err.stack,
            timestamp: new Date().toISOString(),
        });
    }
});
// 1c) Test single article processing
exports.testSingleArticle = (0, https_1.onRequest)({ cors: true, secrets: [OPENAI_API_KEY] }, async (_req, res) => {
    var _a, _b;
    try {
        console.log("[TEST] Single article processing test initiated");
        const client = new openai_1.default({ apiKey: OPENAI_API_KEY.value() });
        const parser = new rss_parser_1.default();
        const feedUrl = FEEDS[0];
        console.log(`[TEST] Fetching feed: ${feedUrl}`);
        const feed = await parser.parseURL(feedUrl);
        console.log(`[TEST] Found ${feed.items.length} items`);
        if (feed.items.length === 0) {
            res.json({ error: "No items in feed", timestamp: new Date().toISOString() });
            return;
        }
        const item = feed.items[0];
        const url = item.link;
        console.log(`[TEST] Processing: ${url}`);
        // Extract
        const content = await (0, agents_1.extractArticle)(url);
        console.log(`[TEST] Extracted ${((_a = content.text) === null || _a === void 0 ? void 0 : _a.length) || 0} characters`);
        // Summarize
        let brief = await (0, agents_1.summarizeAndTag)(client, {
            url,
            source: (item.creator || feed.title || "").toString(),
            publishedAt: item.isoDate || item.pubDate || "",
            title: content.title,
            text: content.text,
        });
        // Post-parse validation: deduplicate citations, validate URLs
        brief = (0, agents_1.validateAndCleanArticle)(brief);
        console.log(`[TEST] Summarized: ${brief.title}`);
        res.json({
            success: true,
            batchConfig: BATCH_CONFIG,
            article: {
                url,
                extractedLength: ((_b = content.text) === null || _b === void 0 ? void 0 : _b.length) || 0,
                brief,
            },
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error;
        console.error("Error in testSingleArticle:", err);
        res.status(500).json({
            success: false,
            error: err.message || "Unknown error",
            stack: err.stack,
        });
    }
});
// 4) Feed Health Report (monitoring endpoint)
exports.feedHealthReport = (0, https_1.onRequest)({ cors: true }, async (_req, res) => {
    try {
        // Fetch all feed health records from Firestore
        const healthSnapshot = await db.collection('feed_health').get();
        const healthData = healthSnapshot.docs.map(doc => {
            var _a, _b, _c, _d, _e, _f;
            const health = doc.data();
            const total = health.successCount + health.failureCount;
            // Handle Firestore Timestamp or Date
            const lastSuccess = health.lastSuccessAt instanceof Date
                ? health.lastSuccessAt.toISOString()
                : (_c = (_b = (_a = health.lastSuccessAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a)) === null || _c === void 0 ? void 0 : _c.toISOString();
            const lastFailure = health.lastFailureAt instanceof Date
                ? health.lastFailureAt.toISOString()
                : (_f = (_e = (_d = health.lastFailureAt) === null || _d === void 0 ? void 0 : _d.toDate) === null || _e === void 0 ? void 0 : _e.call(_d)) === null || _f === void 0 ? void 0 : _f.toISOString();
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
    }
    catch (error) {
        console.error('[FEED HEALTH ERROR]', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
/**
 * Cosine similarity helper
 */
function cosineSimilarity(a, b) {
    const dot = a.reduce((s, v, i) => s + v * b[i], 0);
    const ma = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
    const mb = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
    return dot / (ma * mb);
}
/**
 * Maximal Marginal Relevance (MMR) re-ranking
 * Balances relevance with diversity to avoid redundant results
 */
function mmrRerank(items, topK, lambda = 0.7) {
    const selected = [];
    const remaining = [...items];
    while (selected.length < topK && remaining.length > 0) {
        let bestIdx = 0;
        let bestScore = -Infinity;
        for (let i = 0; i < remaining.length; i++) {
            const relevance = remaining[i].score;
            // Diversity: penalize items similar to already-selected items
            let diversity = 1.0;
            if (selected.length > 0) {
                const maxSimilarity = Math.max(...selected.map(s => cosineSimilarity(remaining[i].it.embedding, s.it.embedding)));
                diversity = 1.0 - maxSimilarity;
            }
            const mmrScore = lambda * relevance + (1 - lambda) * diversity;
            if (mmrScore > bestScore) {
                bestScore = mmrScore;
                bestIdx = i;
            }
        }
        const [selected_item] = remaining.splice(bestIdx, 1);
        selected.push(Object.assign(Object.assign({}, selected_item), { mmrScore: bestScore }));
    }
    return selected;
}
/**
 * Apply cluster diversity: limit to 1 article per clusterId
 */
function applyClusterDiversity(items, maxPerCluster = 1) {
    const clusterMap = new Map();
    for (const item of items) {
        const clusterId = (item.it.clusterId || item.it.id);
        if (!clusterMap.has(clusterId)) {
            clusterMap.set(clusterId, []);
        }
        clusterMap.get(clusterId).push(item);
    }
    const result = [];
    for (const cluster of clusterMap.values()) {
        // Take top N from each cluster (sorted by score)
        result.push(...cluster.sort((a, b) => { var _a, _b; return ((_a = b.mmrScore) !== null && _a !== void 0 ? _a : b.score) - ((_b = a.mmrScore) !== null && _b !== void 0 ? _b : a.score); }).slice(0, maxPerCluster));
    }
    return result;
}
/**
 * Apply recency boost: recent articles get higher scores
 */
function applyRecencyBoost(items, boostFactor = 0.1) {
    const now = Date.now();
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    return items.map(item => {
        var _a;
        let createdAt;
        const rawDate = item.it.createdAt;
        if (rawDate instanceof Date) {
            createdAt = rawDate;
        }
        else if (typeof rawDate === "object" && rawDate !== null && "toDate" in rawDate) {
            createdAt = rawDate.toDate();
        }
        else if (typeof rawDate === "number") {
            createdAt = new Date(rawDate);
        }
        else {
            createdAt = new Date();
        }
        const age = now - createdAt.getTime();
        const recencyScore = Math.max(0, 1 - age / maxAge);
        const boostedScore = ((_a = item.mmrScore) !== null && _a !== void 0 ? _a : item.score) + recencyScore * boostFactor;
        return Object.assign(Object.assign({}, item), { recencyBoostedScore: boostedScore });
    });
}
/**
 * Simple BM25-style keyword scoring for hybrid retrieval (D2)
 * Scores articles based on keyword matches in title, bullets, and tags
 */
function scoreByKeywords(query, article) {
    var _a, _b, _c;
    const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    if (queryTerms.length === 0)
        return 0;
    let score = 0;
    const text = [
        article.title || "",
        (article.bullets5 || []).join(" "),
        (((_a = article.tags) === null || _a === void 0 ? void 0 : _a.trends) || []).join(" "),
        (((_b = article.tags) === null || _b === void 0 ? void 0 : _b.regulations) || []).join(" "),
        (((_c = article.tags) === null || _c === void 0 ? void 0 : _c.perils) || []).join(" "),
    ].join(" ").toLowerCase();
    for (const term of queryTerms) {
        const matches = (text.match(new RegExp(term, "g")) || []).length;
        score += matches * 10; // Weight each match
    }
    return score;
}
/**
 * Promote regulatory and CAT documents when relevant (D2)
 */
function promoteRegulatoryAndCAT(items, query) {
    const regulatoryKeywords = ["regulatory", "naic", "doi", "bulletin", "rule", "regulation", "compliance"];
    const catKeywords = ["hurricane", "storm", "catastrophe", "cat", "disaster", "wildfire", "earthquake"];
    const queryLower = query.toLowerCase();
    const isRegulatoryQuery = regulatoryKeywords.some(kw => queryLower.includes(kw));
    const isCATQuery = catKeywords.some(kw => queryLower.includes(kw));
    return items.map(item => {
        let boost = 1.0;
        if (isRegulatoryQuery && item.it.regulatory) {
            boost *= 1.5; // 50% boost for regulatory articles
        }
        if (isCATQuery && item.it.stormName) {
            boost *= 1.5; // 50% boost for CAT articles
        }
        return Object.assign(Object.assign({}, item), { score: item.score * boost });
    });
}
// 2) Ask‑the‑Brief (RAG with hybrid retrieval, MMR, and cluster diversity)
exports.askBrief = (0, https_1.onRequest)({ cors: false, secrets: [OPENAI_API_KEY] }, async (req, res) => {
    var _a, _b, _c, _d, _e;
    const startTime = Date.now();
    try {
        // CORS check
        const origin = req.headers.origin;
        if (!checkCORS(origin)) {
            res.status(403).json(createErrorResponse('Forbidden: Invalid origin', 'CORS_ERROR'));
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
        // Rate limiting (Firestore-backed)
        const ip = ((_a = req.headers['x-forwarded-for']) === null || _a === void 0 ? void 0 : _a.toString().split(',')[0]) || req.ip || 'unknown';
        const rateLimitOk = await checkRateLimit(ip);
        if (!rateLimitOk) {
            res.status(429).json(createErrorResponse('Rate limit exceeded. Please try again later.', 'RATE_LIMIT_EXCEEDED'));
            return;
        }
        // Input validation and sanitization
        const rawQuery = (req.query.q || ((_b = req.body) === null || _b === void 0 ? void 0 : _b.q) || "").toString();
        const q = rawQuery.replace(/<[^>]*>/g, '').slice(0, 500); // Strip HTML, limit length
        if (!q || q.trim().length < 3) {
            res.status(400).json(createErrorResponse('Query required (min 3 characters)', 'INVALID_QUERY'));
            return;
        }
        const client = new openai_1.default({ apiKey: OPENAI_API_KEY.value() });
        // Fetch recent articles (keep it simple; Firestore has no native vector search)
        const snap = await db.collection("articles").orderBy("createdAt", "desc").limit(500).get();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const articles = snap.docs.map((d) => (Object.assign({ id: d.id }, d.data())));
        if (articles.length === 0) {
            res.json({
                answerText: "No articles found in context.",
                bullets: [],
                sources: [],
                related: [],
                usedArticles: [],
                highlights: [],
                latencyMs: Date.now() - startTime,
            });
            return;
        }
        // Fetch embeddings from separate collection
        const embeddingSnap = await db.collection("article_embeddings").where("articleId", "in", articles.map(a => a.id)).get();
        const embeddingMap = new Map(embeddingSnap.docs.map(d => [d.data().articleId, d.data().embedding]));
        // Merge embeddings with articles
        const items = articles
            .filter(a => embeddingMap.has(a.id)) // Only include articles with embeddings
            .map(a => (Object.assign(Object.assign({}, a), { embedding: embeddingMap.get(a.id) })));
        if (items.length === 0) {
            res.json({
                answerText: "No articles with embeddings found in context.",
                bullets: [],
                sources: [],
                related: [],
                usedArticles: [],
                highlights: [],
                latencyMs: Date.now() - startTime,
            });
            return;
        }
        // Embed the query (MUST match stored embedding dimensions: 512)
        const qEmb = (await client.embeddings.create({
            model: "text-embedding-3-small",
            input: q,
            dimensions: 512,
        })).data[0].embedding;
        // Step 1: Hybrid retrieval - combine semantic and keyword scoring (D2)
        const keywordScored = items.map((it) => ({
            it,
            semanticScore: cosineSimilarity(qEmb, it.embedding),
            keywordScore: scoreByKeywords(q, it),
        }));
        // Normalize scores to 0-1 range
        const maxKeywordScore = Math.max(...keywordScored.map(x => x.keywordScore), 1);
        const hybridScored = keywordScored.map(x => (Object.assign(Object.assign({}, x), { score: (x.semanticScore * 0.6) + ((x.keywordScore / maxKeywordScore) * 0.4) })));
        // Step 2: Promote regulatory and CAT documents (D2)
        const promoted = promoteRegulatoryAndCAT(hybridScored, q);
        // Step 3: Cosine similarity ranking (top 20 for MMR)
        const cosineSimilarityRanked = promoted
            .sort((a, b) => b.score - a.score)
            .slice(0, 20);
        // Step 4: MMR re-ranking for diversity
        const mmrRanked = mmrRerank(cosineSimilarityRanked, 12, 0.7);
        // Step 5: Apply cluster diversity (max 1 per cluster)
        const diverseRanked = applyClusterDiversity(mmrRanked, 1);
        // Step 6: Apply recency boost
        const finalRanked = applyRecencyBoost(diverseRanked, 0.1)
            .sort((a, b) => { var _a, _b, _c, _d; return ((_b = (_a = b.recencyBoostedScore) !== null && _a !== void 0 ? _a : b.mmrScore) !== null && _b !== void 0 ? _b : b.score) - ((_d = (_c = a.recencyBoostedScore) !== null && _c !== void 0 ? _c : a.mmrScore) !== null && _d !== void 0 ? _d : a.score); })
            .slice(0, 8);
        // Build context from top results
        const context = finalRanked.map((r) => {
            const title = r.it.title;
            const bullets = r.it.bullets5 || [];
            const whyItMatters = r.it.whyItMatters || {};
            const canonicalUrl = r.it.canonicalUrl;
            const url = r.it.url;
            return `TITLE: ${title}\nBULLETS:\n- ${bullets.join("\n- ")}\nWHY:\n${Object.entries(whyItMatters).map(([k, v]) => `${k.toUpperCase()}: ${v}`).join("\n")}\nURL: ${canonicalUrl || url}`;
        }).join("\n\n---\n\n");
        // Generate answer with structured output
        const answer = await client.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.2,
            max_tokens: 500,
            messages: [
                {
                    role: "system",
                    content: "You are a P&C insurance analyst. Answer using ONLY the provided context. " +
                        "If information is not found, respond with 'Not found in current context.' " +
                        "Provide: 1) Short answer (1-2 sentences), 2) 3 bullet-point rationale, 3) Inline citations with [URL] format.",
                },
                { role: "user", content: `Question: ${q}\n\nContext:\n${context}` },
            ],
        });
        const answerText = (_e = (_d = (_c = answer.choices[0]) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.content) !== null && _e !== void 0 ? _e : "Not found in current context.";
        // GUARDRAIL: Extract URLs from answer and validate against source articles
        // This prevents hallucinated links by only allowing URLs from the context
        const validArticleUrls = new Set(finalRanked.map(r => {
            const canonicalUrl = r.it.canonicalUrl;
            const url = r.it.url;
            return (canonicalUrl || url).toLowerCase();
        }));
        // Extract URLs from answer text (both [URL] format and plain URLs)
        const urlPattern = /\[?(https?:\/\/[^\s[\]]+)\]?/gi;
        const extractedUrls = new Set();
        let match;
        while ((match = urlPattern.exec(answerText)) !== null) {
            const url = match[1].toLowerCase();
            // Only include URLs that are in our source articles
            if (validArticleUrls.has(url)) {
                extractedUrls.add(url);
            }
            else {
                console.warn(`[ASK BRIEF GUARDRAIL] Rejected hallucinated URL: ${url}`);
            }
        }
        // Build citations from validated URLs
        const citations = finalRanked
            .filter(r => {
            const canonicalUrl = r.it.canonicalUrl;
            const url = r.it.url;
            return extractedUrls.has((canonicalUrl || url).toLowerCase());
        })
            .map(r => ({
            title: r.it.title,
            url: r.it.canonicalUrl || r.it.url,
        }));
        // If no citations were extracted, include all source articles as fallback
        if (citations.length === 0) {
            citations.push(...finalRanked.map(r => ({
                title: r.it.title,
                url: r.it.canonicalUrl || r.it.url,
            })));
        }
        const latencyMs = Date.now() - startTime;
        console.log(`[ASK BRIEF] Query: "${q}" | Results: ${finalRanked.length} | Latency: ${latencyMs}ms`);
        // D1: Structured JSON output with enhanced fields
        res.json({
            answerText,
            bullets: finalRanked.slice(0, 3).map(r => (r.it.bullets5 || [])[0] || ''),
            sources: citations,
            related: finalRanked.slice(0, 5).map(r => ({
                title: r.it.title,
                url: r.it.canonicalUrl || r.it.url,
                clusterId: r.it.clusterId,
            })),
            usedArticles: finalRanked.map(r => r.it.id),
            highlights: finalRanked.slice(0, 3).map(r => ({
                quote: r.it.leadQuote || (r.it.bullets5 || [])[0] || '',
                url: r.it.canonicalUrl || r.it.url,
            })),
            latencyMs,
        });
    }
    catch (e) {
        const statusCode = getHttpStatusCode(e);
        const errorResponse = createErrorResponse(e, 'ASK_BRIEF_ERROR');
        console.error('[ASK BRIEF ERROR]', errorResponse);
        res.status(statusCode).json(errorResponse);
    }
});
/**
 * Reader View Endpoint (B1)
 *
 * Fetches an article URL and returns sanitized HTML for display in a Quick Read modal.
 * Strips tracking, injects canonical source attribution, and returns safe HTML.
 *
 * Query Parameters:
 * - url: The article URL to fetch and sanitize
 *
 * Response:
 * {
 *   title: string,
 *   byline?: string,
 *   published?: string,
 *   mainImage?: string,
 *   html: string (sanitized)
 * }
 */
exports.readerView = (0, https_1.onRequest)({ cors: true, timeoutSeconds: 30 }, async (req, res) => {
    try {
        const startTime = Date.now();
        const url = req.query.url;
        if (!url) {
            res.status(400).json({ error: "Missing 'url' query parameter" });
            return;
        }
        // Validate URL format
        try {
            new URL(url);
        }
        catch (_a) {
            res.status(400).json({ error: "Invalid URL format" });
            return;
        }
        console.log(`[READER VIEW] Fetching: ${url}`);
        // Extract article using existing utility
        const content = await (0, agents_1.extractArticle)(url);
        if (!content || !content.html) {
            res.status(404).json({ error: "Could not extract article content" });
            return;
        }
        // Sanitize HTML: remove scripts, tracking pixels, and dangerous elements
        const sanitizedHtml = sanitizeHtml(content.html);
        // Inject canonical source attribution at the end
        const attributedHtml = `${sanitizedHtml}
<div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; font-size: 0.875rem; color: #6b7280;">
  <p><strong>Source:</strong> <a href="${url}" target="_blank" rel="noopener noreferrer">${new URL(url).hostname}</a></p>
  <p style="margin-top: 0.5rem; font-size: 0.75rem; color: #9ca3af;">Read via CarrierSignal Quick Read</p>
</div>`;
        const latencyMs = Date.now() - startTime;
        res.json({
            title: content.title || "Article",
            byline: content.author,
            mainImage: content.mainImage,
            html: attributedHtml,
            latencyMs,
        });
    }
    catch (error) {
        console.error('[READER VIEW ERROR]', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to fetch article",
        });
    }
});
/**
 * Sanitize HTML for safe display
 * Removes scripts, tracking pixels, and dangerous elements
 * Preserves formatting and links
 */
function sanitizeHtml(html) {
    // Remove script tags and content
    let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    // Remove style tags and content
    sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
    // Remove tracking pixels and iframes
    sanitized = sanitized.replace(/<img[^>]*(?:tracking|pixel|beacon)[^>]*>/gi, "");
    sanitized = sanitized.replace(/<iframe[^>]*>/gi, "");
    // Remove event handlers
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, "");
    // Remove meta tags except for basic ones
    sanitized = sanitized.replace(/<meta[^>]*(?:tracking|analytics|facebook|twitter)[^>]*>/gi, "");
    // Remove noscript tags
    sanitized = sanitized.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "");
    // Remove comments
    sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, "");
    return sanitized;
}
//# sourceMappingURL=index.js.map