/**
 * Shared type definitions for CarrierSignal
 */

export interface Article {
  id?: string;
  title: string;
  url: string;
  source: string;
  publishedAt?: string;
  description?: string;
  content?: string;
  image?: string;
  bullets5?: string[];
  tags?: {
    lob?: string[];
    perils?: string[];
    regions?: string[];
    companies?: string[];
    trends?: string[];
    regulations?: string[];
  };
  smartScore?: number;
  aiScore?: number;
  impactScore?: number;
  impactBreakdown?: {
    market: number;
    regulatory: number;
    catastrophe: number;
    technology: number;
  };
  regulatory?: boolean;
  stormName?: string;
  whyItMatters?: Record<string, string>;
  citations?: string[];
  confidenceRationale?: string;
  leadQuote?: string;
  disclosure?: string;
  regionsNormalized?: string[];
  companiesNormalized?: string[];
  finalScore?: number;
  createdAt?: Date | { toDate: () => Date };
  riskPulse?: 'LOW' | 'MEDIUM' | 'HIGH';
  sentiment?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  confidence?: number;
  relevanceScore?: number;
  recencyScore?: number;
  combinedScore?: number;
  disasterScore?: number;
  weatherScore?: number;
  financialScore?: number;
  clusterId?: string;
  advisoryId?: string;
}

export interface RoleOption {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export interface SortOption {
  id: 'smart' | 'recency';
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

