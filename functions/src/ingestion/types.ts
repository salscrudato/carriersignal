/**
 * Ingestion Layer Types
 * Defines interfaces for plugin architecture
 */

export interface RawArticle {
  url: string;
  source: string;
  title: string;
  publishedAt?: string;
  description?: string;
  html?: string;
  text?: string;
  author?: string;
  mainImage?: string;
  contentHash?: string;
}

export interface IngestionSource {
  id: string;
  name: string;
  type: 'rss' | 'atom' | 'sitemap' | 'json' | 'csv' | 'manual';
  url?: string;
  enabled: boolean;
  lastFetched?: string;
  fetchInterval: number; // in minutes
  retryCount: number;
  maxRetries: number;
  backoffMultiplier: number;
}

export interface IngestionResult {
  source: string;
  articlesProcessed: number;
  articlesAdded: number;
  articlesDuplicate: number;
  errors: IngestionError[];
  duration: number; // in milliseconds
  timestamp: string;
}

export interface IngestionError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface IngestionPlugin {
  name: string;
  type: IngestionSource['type'];
  fetch(source: IngestionSource): Promise<RawArticle[]>;
  validate(article: RawArticle): boolean;
}

export interface ContentHash {
  url: string;
  hash: string;
  timestamp: string;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  similarity: number;
  matchedUrl?: string;
  reason?: string;
}

