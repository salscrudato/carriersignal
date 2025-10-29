/**
 * Clustering and Event Types
 * Defines Event model and clustering interfaces
 */

export interface Event {
  id: string;
  canonicalArticleId: string;
  articleIds: string[];
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  
  // Materiality scoring
  materialityScore: number; // 0-100
  severityScore: number; // 0-100
  impactScore: number; // 0-100
  
  // Categorization
  lob: string[]; // Lines of business
  perils: string[]; // Peril types
  regions: string[]; // Geographic regions
  companies: string[]; // Affected companies
  
  // Metadata
  eventType: 'catastrophe' | 'regulatory' | 'market' | 'technology' | 'other';
  riskPulse: 'LOW' | 'MEDIUM' | 'HIGH';
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  
  // Tracking
  createdAt: string;
  lastUpdated: string;
  articleCount: number;
  sourceCount: number;
  
  // Regulatory flags
  regulatoryFlags: string[];
  stormName?: string;
  
  // Trending
  trendingScore: number; // 0-100
  isHotTopic: boolean;
}

export interface ClusteringResult {
  eventId: string;
  articleIds: string[];
  similarity: number;
  reason: string;
}

export interface ClusteringMetrics {
  totalArticles: number;
  totalEvents: number;
  averageClusterSize: number;
  processingTime: number; // milliseconds
  timestamp: string;
}

export interface SimilarityScore {
  articleId1: string;
  articleId2: string;
  titleSimilarity: number;
  contentSimilarity: number;
  overallSimilarity: number;
  shouldCluster: boolean;
}

export interface EventUpdate {
  eventId: string;
  newArticleIds: string[];
  updatedMaterialityScore: number;
  updatedSeverityScore: number;
  reason: string;
  timestamp: string;
}

