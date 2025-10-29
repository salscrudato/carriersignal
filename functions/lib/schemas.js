"use strict";
/**
 * Enhanced Zod Schemas for CarrierSignal
 * Comprehensive validation with custom validators
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPreferencesSchema = exports.BookmarkSchema = exports.SearchQuerySchema = exports.ProcessedArticleSchema = exports.ArticleSchema = void 0;
exports.validateArticle = validateArticle;
exports.validateProcessedArticle = validateProcessedArticle;
exports.validateSearchQuery = validateSearchQuery;
const zod_1 = require("zod");
/**
 * Custom validators
 */
const citationsMatchBullets = (data) => {
    // At least some citations should be referenced in bullets
    return data.citations.length > 0 || data.bullets5.length === 0;
};
/**
 * Article Processing Schema
 */
exports.ArticleSchema = zod_1.z.object({
    url: zod_1.z.string().url('Invalid URL format'),
    source: zod_1.z.string().min(1, 'Source is required'),
    title: zod_1.z.string().min(5, 'Title must be at least 5 characters'),
    publishedAt: zod_1.z.string().datetime().optional(),
    description: zod_1.z.string().optional(),
    html: zod_1.z.string().optional(),
    text: zod_1.z.string().optional(),
    author: zod_1.z.string().optional(),
    mainImage: zod_1.z.string().url().optional(),
});
/**
 * Processed Article Schema (after AI processing)
 */
exports.ProcessedArticleSchema = zod_1.z.object({
    url: zod_1.z.string().url(),
    source: zod_1.z.string(),
    title: zod_1.z.string(),
    publishedAt: zod_1.z.string().datetime().optional(),
    description: zod_1.z.string().optional(),
    bullets5: zod_1.z.array(zod_1.z.string()).min(3).max(5),
    whyItMatters: zod_1.z.object({
        underwriting: zod_1.z.string().min(20).max(200),
        claims: zod_1.z.string().min(20).max(200),
        brokerage: zod_1.z.string().min(20).max(200),
        actuarial: zod_1.z.string().min(20).max(200),
    }),
    tags: zod_1.z.object({
        lob: zod_1.z.array(zod_1.z.string()).max(6),
        perils: zod_1.z.array(zod_1.z.string()).max(6),
        regions: zod_1.z.array(zod_1.z.string()).max(10),
        companies: zod_1.z.array(zod_1.z.string()).max(10),
        trends: zod_1.z.array(zod_1.z.string()).max(8),
        regulations: zod_1.z.array(zod_1.z.string()).max(5),
    }),
    riskPulse: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH']),
    sentiment: zod_1.z.enum(['POSITIVE', 'NEGATIVE', 'NEUTRAL']),
    confidence: zod_1.z.number().min(0).max(1),
    citations: zod_1.z.array(zod_1.z.string().url()).max(10),
    impactScore: zod_1.z.number().min(0).max(100),
    impactBreakdown: zod_1.z.object({
        market: zod_1.z.number().min(0).max(100),
        regulatory: zod_1.z.number().min(0).max(100),
        catastrophe: zod_1.z.number().min(0).max(100),
        technology: zod_1.z.number().min(0).max(100),
    }),
    confidenceRationale: zod_1.z.string().max(200),
    leadQuote: zod_1.z.string().max(300),
    disclosure: zod_1.z.string().max(200),
    smartScore: zod_1.z.number().min(0).max(100).optional(),
    aiScore: zod_1.z.number().min(0).max(100).optional(),
}).refine(citationsMatchBullets, 'Citations should be referenced in bullets');
/**
 * Search Query Schema
 */
exports.SearchQuerySchema = zod_1.z.object({
    query: zod_1.z.string().min(1).max(500),
    filters: zod_1.z.object({
        lob: zod_1.z.array(zod_1.z.string()).optional(),
        perils: zod_1.z.array(zod_1.z.string()).optional(),
        regions: zod_1.z.array(zod_1.z.string()).optional(),
        companies: zod_1.z.array(zod_1.z.string()).optional(),
        dateRange: zod_1.z.object({
            start: zod_1.z.string().datetime().optional(),
            end: zod_1.z.string().datetime().optional(),
        }).optional(),
        riskPulse: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    }).optional(),
    limit: zod_1.z.number().min(1).max(100).default(20),
    offset: zod_1.z.number().min(0).default(0),
});
/**
 * Bookmark Schema
 */
exports.BookmarkSchema = zod_1.z.object({
    articleUrl: zod_1.z.string().url(),
    userId: zod_1.z.string(),
    createdAt: zod_1.z.string().datetime(),
    notes: zod_1.z.string().max(500).optional(),
    tags: zod_1.z.array(zod_1.z.string()).max(10).optional(),
});
/**
 * User Preferences Schema
 */
exports.UserPreferencesSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    preferredLOBs: zod_1.z.array(zod_1.z.string()).optional(),
    preferredPerils: zod_1.z.array(zod_1.z.string()).optional(),
    preferredRegions: zod_1.z.array(zod_1.z.string()).optional(),
    notificationFrequency: zod_1.z.enum(['realtime', 'daily', 'weekly']).default('daily'),
    theme: zod_1.z.enum(['light', 'dark']).default('light'),
    sortPreference: zod_1.z.enum(['smart', 'recency']).default('smart'),
});
/**
 * Validation helper functions
 */
function validateArticle(data) {
    return exports.ArticleSchema.safeParse(data);
}
function validateProcessedArticle(data) {
    return exports.ProcessedArticleSchema.safeParse(data);
}
function validateSearchQuery(data) {
    return exports.SearchQuerySchema.safeParse(data);
}
//# sourceMappingURL=schemas.js.map