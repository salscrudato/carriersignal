/**
 * Clustering Module Exports
 * Event clustering and deduplication functionality
 */

export { ClusteringService } from './service';
export type {
  Event,
  ClusteringResult,
  ClusteringMetrics,
  SimilarityScore,
  EventUpdate,
} from './types';

import { ClusteringService } from './service';

export const clusteringService = new ClusteringService();

