/**
 * AI Processing Types
 * Defines interfaces for AI summarization and tagging
 */

export interface ArticleSummary {
  url: string;
  headline: string;
  briefBullets: string[];
  keyNumbers: string[];
  materiality: number; // 0-100
  impacts: {
    underwriting: string;
    claims: string;
    brokerage: string;
    actuarial: string;
  };
  geos: string[];
  perils: string[];
  regulatoryFlags: string[];
  riskNotes: string;
  confidence: number; // 0-1
  citations: string[];
  leadQuote: string;
  disclosure: string;
}

export interface AIProcessingResult {
  articleId: string;
  summary: ArticleSummary;
  processingTime: number; // milliseconds
  model: string;
  tokensUsed: number;
  cached: boolean;
  timestamp: string;
}

export interface SummaryCache {
  url: string;
  contentHash: string;
  promptVersion: string;
  summary: ArticleSummary;
  createdAt: string;
  expiresAt: string;
  ttlDays: number;
}

export interface AIPromptConfig {
  version: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  examples: Array<{
    input: string;
    output: ArticleSummary;
  }>;
}

export interface TagInferenceResult {
  lob: string[];
  perils: string[];
  regions: string[];
  companies: string[];
  trends: string[];
  regulations: string[];
  confidence: number;
}

export interface QuoteExtractionResult {
  quotes: string[];
  sources: string[];
  confidence: number;
}

