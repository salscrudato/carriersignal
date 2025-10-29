/**
 * Ingestion Module Exports
 * Core ingestion functionality for CarrierSignal
 */

export { IngestionService } from './service';
export { DeduplicationService } from './deduplication';
export { RSSPlugin } from './plugins/rss';
export type {
  RawArticle,
  IngestionSource,
  IngestionResult,
  IngestionError,
  IngestionPlugin,
  ContentHash,
  DuplicateCheckResult,
} from './types';

import { IngestionService } from './service';

export const ingestionService = new IngestionService();

