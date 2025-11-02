/**
 * Advanced AI Scoring V2
 * Real-time dynamic scoring with engagement metrics, trending detection, and adaptive weighting
 * 
 * Scoring factors:
 * - Recency (time decay)
 * - Impact (regulatory, catastrophe, market)
 * - Engagement (views, shares, comments)
 * - Trending (velocity, momentum)
 * - Quality (AI assessment, source trust)
 * - Relevance (LOB, tags, keywords)
 */

import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

let db: Firestore | null = null;

function getDb(): Firestore {
  if (!db) {
    db = getFirestore();
  }
  return db;
}

export interface ArticleEngagement {
  views: number;
  shares: number;
  comments: number;
  bookmarks: number;
  clicks: number;
  lastUpdated: Date;
}

export interface ScoringFactors {
  recencyScore: number; // 0-100
  impactScore: number; // 0-100
  engagementScore: number; // 0-100
  trendingScore: number; // 0-100
  qualityScore: number; // 0-100
  relevanceScore: number; // 0-100
}

export interface AdvancedScore {
  finalScore: number; // 0-100
  factors: ScoringFactors;
  breakdown: {
    recency: { weight: number; contribution: number };
    impact: { weight: number; contribution: number };
    engagement: { weight: number; contribution: number };
    trending: { weight: number; contribution: number };
    quality: { weight: number; contribution: number };
    relevance: { weight: number; contribution: number };
  };
  timestamp: Date;
  nextRecalculation: Date;
}

export class AdvancedScoringV2 {
  private readonly RECALC_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

  /**
   * Calculate comprehensive score for an article
   */
  async calculateAdvancedScore(article: {
    id: string;
    title: string;
    publishedAt: Date;
    impactScore?: number;
    impactBreakdown?: { market: number; regulatory: number; catastrophe: number; technology: number };
    tags?: { lob?: string[]; trends?: string[]; regulatory?: boolean; catastrophe?: boolean };
    source?: string;
    engagement?: ArticleEngagement;
  }): Promise<AdvancedScore> {
    try {
      // Calculate individual factors
      const recencyScore = this.calculateRecencyScore(article.publishedAt);
      const impactScore = this.calculateImpactScore(article.impactScore, article.impactBreakdown);
      const engagementScore = await this.calculateEngagementScore(article.id, article.engagement);
      const trendingScore = await this.calculateTrendingScore(article.id, article.publishedAt);
      const qualityScore = await this.calculateQualityScore(article.id);
      const relevanceScore = this.calculateRelevanceScore(article.tags);

      const factors: ScoringFactors = {
        recencyScore,
        impactScore,
        engagementScore,
        trendingScore,
        qualityScore,
        relevanceScore,
      };

      // Determine adaptive weights based on article age
      const weights = this.calculateAdaptiveWeights(article.publishedAt);

      // Calculate contributions
      const breakdown = {
        recency: { weight: weights.recency, contribution: recencyScore * weights.recency },
        impact: { weight: weights.impact, contribution: impactScore * weights.impact },
        engagement: { weight: weights.engagement, contribution: engagementScore * weights.engagement },
        trending: { weight: weights.trending, contribution: trendingScore * weights.trending },
        quality: { weight: weights.quality, contribution: qualityScore * weights.quality },
        relevance: { weight: weights.relevance, contribution: relevanceScore * weights.relevance },
      };

      // Calculate final score
      const finalScore = Math.min(100,
        breakdown.recency.contribution +
        breakdown.impact.contribution +
        breakdown.engagement.contribution +
        breakdown.trending.contribution +
        breakdown.quality.contribution +
        breakdown.relevance.contribution
      );

      const now = new Date();
      const nextRecalculation = new Date(now.getTime() + this.RECALC_INTERVAL_MS);

      return {
        finalScore: Math.round(finalScore * 10) / 10,
        factors,
        breakdown,
        timestamp: now,
        nextRecalculation,
      };
    } catch (error) {
      logger.error('[ADVANCED SCORING V2] Error calculating score:', error);
      throw error;
    }
  }

  /**
   * Calculate recency score with content-type-aware decay
   */
  private calculateRecencyScore(publishedAt: Date): number {
    const now = Date.now();
    const ageMs = now - publishedAt.getTime();
    const ageHours = ageMs / (1000 * 60 * 60);
    const ageDays = ageHours / 24;

    // Exponential decay: fresh articles score high, older articles decay
    if (ageHours < 1) return 100;
    if (ageHours < 6) return 95 - (ageHours / 6) * 15;
    if (ageHours < 24) return 80 - ((ageHours - 6) / 18) * 30;
    if (ageDays < 7) return 50 - ((ageDays - 1) / 6) * 30;
    return Math.max(10, 20 - (ageDays - 7) * 2);
  }

  /**
   * Calculate impact score from impact breakdown
   */
  private calculateImpactScore(
    baseScore?: number,
    breakdown?: { market: number; regulatory: number; catastrophe: number; technology: number }
  ): number {
    if (!breakdown) return baseScore || 50;

    // Weight different impact dimensions
    const weighted =
      (breakdown.market || 0) * 0.25 +
      (breakdown.regulatory || 0) * 0.35 +
      (breakdown.catastrophe || 0) * 0.25 +
      (breakdown.technology || 0) * 0.15;

    return Math.min(100, weighted);
  }

  /**
   * Calculate engagement score from user interactions
   */
  private async calculateEngagementScore(articleId: string, engagement?: ArticleEngagement): Promise<number> {
    try {
      if (!engagement) {
        const doc = await getDb().collection('article_engagement').doc(articleId).get();
        engagement = doc.data() as ArticleEngagement | undefined;
      }

      if (!engagement) return 50;

      // Normalize and calculate in single pass
      return Math.min(100,
        Math.min(100, (engagement.views || 0) / 10) * 0.30 +
        Math.min(100, (engagement.shares || 0) * 5) * 0.25 +
        Math.min(100, (engagement.comments || 0) * 10) * 0.20 +
        Math.min(100, (engagement.bookmarks || 0) * 20) * 0.15 +
        Math.min(100, (engagement.clicks || 0) / 5) * 0.10
      );
    } catch (error) {
      logger.warn('[ADVANCED SCORING V2] Error calculating engagement:', error);
      return 50;
    }
  }

  /**
   * Calculate trending score based on velocity and momentum
   */
  private async calculateTrendingScore(articleId: string, publishedAt: Date): Promise<number> {
    try {
      const ageHours = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60);
      if (ageHours === 0) return 50;

      const doc = await getDb().collection('article_engagement').doc(articleId).get();
      const engagement = doc.data() as ArticleEngagement | undefined;
      if (!engagement) return 50;

      const velocity = ((engagement.views || 0) + (engagement.shares || 0) * 5) / ageHours;
      return velocity > 100 ? 100 : velocity > 50 ? 80 : velocity > 20 ? 60 : velocity > 5 ? 40 : 20;
    } catch (error) {
      logger.warn('[ADVANCED SCORING V2] Error calculating trending score:', error);
      return 50;
    }
  }

  /**
   * Calculate quality score from AI assessment and source trust
   */
  private async calculateQualityScore(articleId: string): Promise<number> {
    try {
      const doc = await getDb().collection('newsArticles').doc(articleId).get();
      const article = doc.data();

      if (!article) return 50;

      let score = 50;

      // AI assessment
      if (article.aiScore) score += (article.aiScore / 100) * 30;

      // Source trust
      if (article.sourceTrustScore) score += (article.sourceTrustScore / 100) * 15;

      // Content completeness
      if (article.summary) score += 5;
      if (article.imageUrl) score += 5;
      if (article.tags) score += 5;

      return Math.min(100, score);
    } catch (error) {
      logger.warn('[ADVANCED SCORING V2] Error calculating quality score:', error);
      return 50;
    }
  }

  /**
   * Calculate relevance score based on tags and LOB
   */
  private calculateRelevanceScore(tags?: { lob?: string[]; trends?: string[]; regulatory?: boolean; catastrophe?: boolean }): number {
    if (!tags) return 50;

    let score = 50;

    // LOB relevance
    if (tags.lob && tags.lob.length > 0) {
      score += Math.min(20, tags.lob.length * 5);
    }

    // Trend relevance
    if (tags.trends && tags.trends.length > 0) {
      score += Math.min(15, tags.trends.length * 5);
    }

    // Regulatory boost
    if (tags.regulatory) score += 10;

    // Catastrophe boost
    if (tags.catastrophe) score += 10;

    return Math.min(100, score);
  }

  /**
   * Calculate adaptive weights based on article characteristics
   */
  private calculateAdaptiveWeights(publishedAt: Date): Record<string, number> {
    const ageHours = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60);

    // Fresh articles: emphasize recency and trending
    if (ageHours < 6) {
      return {
        recency: 0.25,
        impact: 0.20,
        engagement: 0.15,
        trending: 0.20,
        quality: 0.15,
        relevance: 0.05,
      };
    }

    // Established articles: emphasize impact and quality
    if (ageHours < 24) {
      return {
        recency: 0.15,
        impact: 0.30,
        engagement: 0.15,
        trending: 0.15,
        quality: 0.20,
        relevance: 0.05,
      };
    }

    // Older articles: emphasize impact and quality
    return {
      recency: 0.05,
      impact: 0.35,
      engagement: 0.10,
      trending: 0.05,
      quality: 0.35,
      relevance: 0.10,
    };
  }
}

export const advancedScoringV2 = new AdvancedScoringV2();

