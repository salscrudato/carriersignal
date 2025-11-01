/**
 * News Domain Types
 * Type definitions for P&C insurance news, signals, clusters, and related entities
 */

import type { LOB, Regulator, SeverityLevel, Actionability, HazardType, USState, Carrier } from '../constants/news';

// ============================================================================
// NEWS SOURCE
// ============================================================================

export interface NewsSource {
  id: string;
  name: string;
  type: 'rss' | 'atom' | 'json' | 'html' | 'api';
  url: string;
  region?: string; // e.g., 'national', 'TX', 'CA'
  lobHints?: LOB[];
  trustScore: number; // 0-100
  active: boolean;
  lastFetchedAt?: number;
  fetchErrorCount?: number;
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// RAW NEWS ARTICLE (ingestion)
// ============================================================================

export interface NewsRaw {
  id: string;
  sourceId: string;
  fetchedAt: number;
  hash: string; // SHA1 of normalized content
  raw: string; // Raw XML/JSON/HTML
  status: 'pending' | 'processed' | 'failed';
  error?: string;
  createdAt: number;
}

// ============================================================================
// NORMALIZED NEWS ARTICLE
// ============================================================================

export interface NewsArticle {
  id: string;
  title: string;
  link: string;
  canonicalLink: string;
  publishedAt: number;
  sourceId: string;
  authors?: string[];
  excerpt: string;
  contentHtml?: string;
  contentText?: string;
  
  // Extracted metadata
  states: USState[];
  lobs: LOB[];
  carriers: Carrier[];
  cikList: string[];
  regulators: Regulator[];
  
  // Clustering & ranking
  clusterKey: string;
  severity: SeverityLevel;
  actionability: Actionability;
  score: number; // Final composite score
  topics: string[];
  
  // Hazard metadata (for catastrophe events)
  hazard?: {
    type: HazardType;
    geo?: {
      lat: number;
      lng: number;
    };
    capFields?: Record<string, unknown>; // CAP alert fields
  };
  
  // Confidence & validation
  confidence: number; // 0-1
  validationPass: boolean;
  
  // Timestamps
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// NEWS CLUSTER
// ============================================================================

export interface NewsCluster {
  id: string;
  clusterKey: string;
  articleIds: string[];
  primaryId: string; // Highest-scoring article
  mergedSignals: Partial<NewsArticle>; // Merged metadata
  score: number;
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// USER WATCHLIST
// ============================================================================

export interface WatchlistItem {
  id: string;
  userId: string;
  type: 'carrier' | 'state' | 'topic';
  value: string;
  weight: number; // 0-1, for personalized scoring
  createdAt: number;
}

// ============================================================================
// STRUCTURED CLASSIFICATION OUTPUT (from LLM)
// ============================================================================

export interface NewsClassification {
  headline: string;
  summary: string; // <= 2 sentences
  states: USState[];
  lobs: LOB[];
  regulators: Regulator[];
  carriers: Carrier[];
  tickers: string[];
  ciks: string[];
  actionability: Actionability;
  severity: SeverityLevel;
  confidence: number; // 0-1
}

// ============================================================================
// SIGNAL CARD (UI)
// ============================================================================

export interface SignalCardProps {
  article: NewsArticle;
  cluster?: NewsCluster;
  onExpand?: () => void;
  isExpanded?: boolean;
}

// ============================================================================
// FILTER STATE
// ============================================================================

export interface NewsFilterState {
  timeWindow?: 'today' | 'week' | 'month' | 'all';
  states?: USState[];
  lobs?: LOB[];
  regulators?: Regulator[];
  sources?: string[];
  hazardOnly?: boolean;
  watchlistOnly?: boolean;
}

// ============================================================================
// INGESTION METRICS
// ============================================================================

export interface IngestionMetrics {
  batchId: string;
  timestamp: number;
  sourcesProcessed: number;
  articlesProcessed: number;
  articlesSkipped: number;
  errors: number;
  totalTokens: number;
  totalLatencyMs: number;
  successRate: number; // 0-1
}

