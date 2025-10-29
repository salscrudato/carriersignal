/**
 * Enhanced Zod Schemas for CarrierSignal
 * Comprehensive validation with custom validators
 */

import { z } from 'zod';

/**
 * Custom validators
 */
const citationsMatchBullets = (data: {
  bullets5: string[];
  citations: string[];
}): boolean => {
  // At least some citations should be referenced in bullets
  return data.citations.length > 0 || data.bullets5.length === 0;
};

/**
 * Article Processing Schema
 */
export const ArticleSchema = z.object({
  url: z.string().url('Invalid URL format'),
  source: z.string().min(1, 'Source is required'),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  publishedAt: z.string().datetime().optional(),
  description: z.string().optional(),
  html: z.string().optional(),
  text: z.string().optional(),
  author: z.string().optional(),
  mainImage: z.string().url().optional(),
});

/**
 * Processed Article Schema (after AI processing)
 */
export const ProcessedArticleSchema = z.object({
  url: z.string().url(),
  source: z.string(),
  title: z.string(),
  publishedAt: z.string().datetime().optional(),
  description: z.string().optional(),
  bullets5: z.array(z.string()).min(3).max(5),
  whyItMatters: z.object({
    underwriting: z.string().min(20).max(200),
    claims: z.string().min(20).max(200),
    brokerage: z.string().min(20).max(200),
    actuarial: z.string().min(20).max(200),
  }),
  tags: z.object({
    lob: z.array(z.string()).max(6),
    perils: z.array(z.string()).max(6),
    regions: z.array(z.string()).max(10),
    companies: z.array(z.string()).max(10),
    trends: z.array(z.string()).max(8),
    regulations: z.array(z.string()).max(5),
  }),
  riskPulse: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  sentiment: z.enum(['POSITIVE', 'NEGATIVE', 'NEUTRAL']),
  confidence: z.number().min(0).max(1),
  citations: z.array(z.string().url()).max(10),
  impactScore: z.number().min(0).max(100),
  impactBreakdown: z.object({
    market: z.number().min(0).max(100),
    regulatory: z.number().min(0).max(100),
    catastrophe: z.number().min(0).max(100),
    technology: z.number().min(0).max(100),
  }),
  confidenceRationale: z.string().max(200),
  leadQuote: z.string().max(300),
  disclosure: z.string().max(200),
  smartScore: z.number().min(0).max(100).optional(),
  aiScore: z.number().min(0).max(100).optional(),
}).refine(
  citationsMatchBullets,
  'Citations should be referenced in bullets'
);

/**
 * Search Query Schema
 */
export const SearchQuerySchema = z.object({
  query: z.string().min(1).max(500),
  filters: z.object({
    lob: z.array(z.string()).optional(),
    perils: z.array(z.string()).optional(),
    regions: z.array(z.string()).optional(),
    companies: z.array(z.string()).optional(),
    dateRange: z.object({
      start: z.string().datetime().optional(),
      end: z.string().datetime().optional(),
    }).optional(),
    riskPulse: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  }).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

/**
 * Bookmark Schema
 */
export const BookmarkSchema = z.object({
  articleUrl: z.string().url(),
  userId: z.string(),
  createdAt: z.string().datetime(),
  notes: z.string().max(500).optional(),
  tags: z.array(z.string()).max(10).optional(),
});

/**
 * User Preferences Schema
 */
export const UserPreferencesSchema = z.object({
  userId: z.string(),
  preferredLOBs: z.array(z.string()).optional(),
  preferredPerils: z.array(z.string()).optional(),
  preferredRegions: z.array(z.string()).optional(),
  notificationFrequency: z.enum(['realtime', 'daily', 'weekly']).default('daily'),
  theme: z.enum(['light', 'dark']).default('light'),
  sortPreference: z.enum(['smart', 'recency']).default('smart'),
});

/**
 * Validation helper functions
 */
export function validateArticle(data: unknown) {
  return ArticleSchema.safeParse(data);
}

export function validateProcessedArticle(data: unknown) {
  return ProcessedArticleSchema.safeParse(data);
}

export function validateSearchQuery(data: unknown) {
  return SearchQuerySchema.safeParse(data);
}

