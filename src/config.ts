/**
 * Centralized Configuration for CarrierSignal
 * 
 * All configuration values are defined here for easy management
 */

// ============================================================================
// API & ENDPOINTS
// ============================================================================

export const API_CONFIG = {
  // Firebase Functions base URL
  FUNCTIONS_URL: import.meta.env.VITE_FUNCTIONS_URL || 'http://localhost:5001/carriersignal-prod/us-central1',
  
  // API endpoints
  ENDPOINTS: {
    ASK_BRIEF: '/askBrief',
    REFRESH_FEEDS: '/refreshFeedsWithBatching',
  },
};

// ============================================================================
// FIRESTORE COLLECTIONS
// ============================================================================

export const FIRESTORE_COLLECTIONS = {
  ARTICLES: 'articles',
  ARTICLE_EMBEDDINGS: 'article_embeddings',
  FEED_SOURCES: 'feed_sources',
  RATE_LIMITS: 'rate_limits',
};

// ============================================================================
// RAG & SEARCH
// ============================================================================

export const RAG_CONFIG = {
  // Hybrid retrieval parameters
  HYBRID_RETRIEVAL: {
    INITIAL_FETCH: 500,      // Fetch top 500 articles for MMR
    COSINE_SIMILARITY_TOP_K: 20,  // Top 20 for MMR re-ranking
    MMR_FINAL_K: 12,         // Final 12 articles after MMR
    MMR_LAMBDA: 0.7,         // Balance between relevance (0.7) and diversity (0.3)
  },
  
  // Cluster diversity
  CLUSTER_DIVERSITY: {
    MAX_PER_CLUSTER: 1,      // Max 1 article per cluster
  },
  
  // Recency boost
  RECENCY_BOOST: {
    WEIGHT: 0.1,             // Recency boost weight
    WINDOW_DAYS: 30,         // 30-day window for recency boost
  },
};

// ============================================================================
// RATE LIMITING
// ============================================================================

export const RATE_LIMIT_CONFIG = {
  WINDOW_MS: 60 * 1000,      // 1 minute window
  MAX_REQUESTS: 100,         // Max 100 requests per window
  TTL_SECONDS: 3600,         // 1 hour TTL for rate limit records
};

// ============================================================================
// LINK VALIDATION
// ============================================================================

export const LINK_CONFIG = {
  TRUSTED_DOMAINS: [
    'insurancejournal.com',
    'claimsjournal.com',
    'insurancenewsnet.com',
    'riskandinsurance.com',
    'naic.org',
    'reuters.com',
    'bloomberg.com',
    'cnbc.com',
    'wsj.com',
    'ft.com',
    'bbc.com',
    'apnews.com',
    'businesswire.com',
    'prnewswire.com',
    'sec.gov',
    'treasury.gov',
    'federalreserve.gov',
  ],
  
  TRACKING_PARAMS: [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
    'fbclid', 'gclid', 'msclkid', 'ref', 'source', 'campaign',
    'tracking_id', 'track_id', 'cid', 'sid'
  ],
};

// ============================================================================
// AI & SUMMARIZATION
// ============================================================================

export const AI_CONFIG = {
  // OpenAI models - optimized for cost & speed
  MODELS: {
    SUMMARIZATION: 'gpt-4o-mini',      // Cheapest fast model (~$0.15/1M input tokens)
    EMBEDDING: 'text-embedding-3-small', // Cheapest embedding model (~$0.02/1M tokens)
    SCORING: 'gpt-4o-mini',             // Cheapest fast model for scoring
  },

  // Embedding dimensions
  EMBEDDING_DIMENSIONS: 512,

  // Timeout & retry
  TIMEOUT_MS: 10000,         // 10 second timeout
  MAX_RETRIES: 2,            // Max 2 retries
  RETRY_DELAYS_MS: [1000, 2000], // 1s, 2s exponential backoff

  // Fallback scores
  FALLBACK_SCORE: 50,        // Default score if AI fails
};

// ============================================================================
// FEED SOURCES
// ============================================================================

export const DEFAULT_FEED_SOURCES = [
  {
    url: 'https://www.insurancejournal.com/rss/news/national/',
    category: 'news',
    priority: 1,
  },
  {
    url: 'https://www.claimsjournal.com/rss/news/national/',
    category: 'claims',
    priority: 2,
  },
  {
    url: 'https://www.naic.org/rss/press_releases.xml',
    category: 'regulatory',
    priority: 2,
  },
  {
    url: 'https://www.sba.gov/rss/news.xml',
    category: 'regulatory',
    priority: 3,
  },
  {
    url: 'https://www.nhc.noaa.gov/rss_besttrack.xml',
    category: 'catastrophe',
    priority: 1,
  },
  {
    url: 'https://www.usgs.gov/faqs/rss.xml',
    category: 'catastrophe',
    priority: 2,
  },
  {
    url: 'https://insurancenewsnet.com/topics/property-casualty-insurance-news/feed',
    category: 'news',
    priority: 3,
  },
  {
    url: 'https://riskandinsurance.com/feed/',
    category: 'news',
    priority: 4,
  },
  {
    url: 'https://www.reinsurancene.ws/feed/',
    category: 'reinsurance',
    priority: 2,
  },
  {
    url: 'https://www.insurtech.news/feed/',
    category: 'technology',
    priority: 3,
  },
];

// ============================================================================
// LOGGING
// ============================================================================

export const LOGGING_CONFIG = {
  // Log levels
  LEVELS: {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
  },
  
  // Default log level
  DEFAULT_LEVEL: 'INFO',
  
  // Include batch IDs in logs
  INCLUDE_BATCH_ID: true,
  
  // Include latency metrics
  INCLUDE_LATENCY: true,
};

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FEATURE_FLAGS = {
  // Enable/disable features
  ENABLE_SEMANTIC_SEARCH: true,
  ENABLE_HYBRID_RETRIEVAL: true,
  ENABLE_RATE_LIMITING: true,
  ENABLE_LINK_VALIDATION: true,
  ENABLE_STRUCTURED_LOGGING: true,
};

