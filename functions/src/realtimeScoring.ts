/**
 * Real-time Scoring Recalculation System
 * Continuously updates AI scores between 12-hour cycles for dynamic feed ranking
 */

import {getFirestore, Firestore} from "firebase-admin/firestore";
import {logger} from "firebase-functions";
import OpenAI from "openai";

let db: Firestore | null = null;

function getDb(): Firestore {
  if (!db) {
    db = getFirestore();
  }
  return db;
}

export interface ScoringUpdate {
  articleId: string;
  oldScore: number;
  newScore: number;
  reason: string;
  timestamp: Date;
  recencyDecay: number;
  engagementBoost: number;
}

export class RealtimeScoringService {
  private readonly RECALC_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
  private readonly ENGAGEMENT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
  private readonly RECENCY_DECAY_RATE = 0.95; // 5% decay per hour

  /**
   * Recalculate scores for top articles
   */
  async recalculateTopArticleScores(_client: OpenAI, limit: number = 50): Promise<ScoringUpdate[]> {
    try {
      const updates: ScoringUpdate[] = [];
      const {FieldValue} = await import('firebase-admin/firestore');

      // Get top articles by current score
      const snapshot = await getDb().collection('newsArticles')
        .orderBy('score', 'desc')
        .limit(limit)
        .get();

      for (const doc of snapshot.docs) {
        const article = doc.data();
        const oldScore = article.score || 0;

        // Calculate new score components
        const recencyDecay = this.calculateRecencyDecay(article.publishedAt?.toDate());
        const engagementBoost = await this.calculateEngagementBoost(doc.id);
        const newScore = Math.min(100, oldScore * recencyDecay + engagementBoost);

        // Only update if score changed significantly
        if (Math.abs(newScore - oldScore) > 2) {
          await getDb().collection('newsArticles').doc(doc.id).update({
            score: newScore,
            lastScoringUpdate: new Date(),
            scoringHistory: FieldValue.arrayUnion({
              timestamp: new Date(),
              oldScore,
              newScore,
              reason: 'Real-time recalculation',
            }),
          });

          updates.push({
            articleId: doc.id,
            oldScore,
            newScore,
            reason: 'Real-time recalculation',
            timestamp: new Date(),
            recencyDecay,
            engagementBoost,
          });

          logger.info(`[SCORING] Updated article ${doc.id}: ${oldScore.toFixed(1)} → ${newScore.toFixed(1)}`);
        }
      }

      return updates;
    } catch (error) {
      logger.error('[SCORING] Error recalculating scores:', error);
      return [];
    }
  }

  /**
   * Calculate recency decay
   */
  private calculateRecencyDecay(publishedAt: Date | undefined): number {
    if (!publishedAt) return 1.0;

    const ageHours = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60);
    return Math.pow(this.RECENCY_DECAY_RATE, ageHours);
  }

  /**
   * Calculate engagement boost based on user interactions
   */
  private async calculateEngagementBoost(articleId: string): Promise<number> {
    try {
      const snapshot = await getDb().collection('user_interactions')
        .where('articleId', '==', articleId)
        .where('timestamp', '>=', new Date(Date.now() - this.ENGAGEMENT_WINDOW_MS))
        .get();

      const interactions = snapshot.docs.map(doc => doc.data());
      let boost = 0;

      // Weight different interaction types
      for (const interaction of interactions) {
        switch (interaction.type) {
          case 'view':
            boost += 0.5;
            break;
          case 'click':
            boost += 1;
            break;
          case 'bookmark':
            boost += 3;
            break;
          case 'share':
            boost += 5;
            break;
        }
      }

      // Normalize boost (max 15 points)
      return Math.min(15, boost);
    } catch (error) {
      logger.warn('[SCORING] Error calculating engagement boost:', error);
      return 0;
    }
  }

  /**
   * Boost score for trending topics
   */
  async boostTrendingArticles(): Promise<ScoringUpdate[]> {
    try {
      const updates: ScoringUpdate[] = [];

      // Get trending topics from last 24 hours
      const trendingTopics = await this.getTrendingTopics();

      for (const topic of trendingTopics) {
        const snapshot = await getDb().collection('newsArticles')
          .where('tags', 'array-contains', topic.name)
          .orderBy('score', 'desc')
          .limit(10)
          .get();

        for (const doc of snapshot.docs) {
          const article = doc.data();
          const oldScore = article.score || 0;
          const trendBoost = topic.trendScore * 0.1; // 10% of trend score
          const newScore = Math.min(100, oldScore + trendBoost);

          if (newScore > oldScore) {
            await getDb().collection('newsArticles').doc(doc.id).update({
              score: newScore,
              lastScoringUpdate: new Date(),
            });

            updates.push({
              articleId: doc.id,
              oldScore,
              newScore,
              reason: `Trending topic boost: ${topic.name}`,
              timestamp: new Date(),
              recencyDecay: 1.0,
              engagementBoost: trendBoost,
            });
          }
        }
      }

      return updates;
    } catch (error) {
      logger.error('[SCORING] Error boosting trending articles:', error);
      return [];
    }
  }

  /**
   * Get trending topics
   */
  private async getTrendingTopics(): Promise<Array<{name: string; trendScore: number}>> {
    try {
      const snapshot = await getDb().collection('trending_topics')
        .orderBy('score', 'desc')
        .limit(10)
        .get();

      return snapshot.docs.map(doc => ({
        name: doc.id,
        trendScore: doc.data().score || 0,
      }));
    } catch (error) {
      logger.warn('[SCORING] Error getting trending topics:', error);
      return [];
    }
  }

  /**
   * Get scoring history for an article
   */
  async getScoringHistory(articleId: string): Promise<Array<{timestamp: Date; score: number}>> {
    try {
      const doc = await getDb().collection('newsArticles').doc(articleId).get();
      const article = doc.data();

      if (!article?.scoringHistory) return [];

      return article.scoringHistory.map((entry: {timestamp: unknown; newScore: number}) => ({
        timestamp: (entry.timestamp as {toDate: () => Date})?.toDate() || new Date(),
        score: entry.newScore || 0,
      }));
    } catch (error) {
      logger.warn('[SCORING] Error getting scoring history:', error);
      return [];
    }
  }

  /**
   * Get articles that need re-scoring
   */
  async getArticlesNeedingRescore(limit: number = 100): Promise<string[]> {
    try {
      const oneHourAgo = new Date(Date.now() - this.RECALC_INTERVAL_MS);
      const snapshot = await getDb().collection('newsArticles')
        .where('lastScoringUpdate', '<', oneHourAgo)
        .orderBy('lastScoringUpdate', 'asc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => doc.id);
    } catch (error) {
      logger.warn('[SCORING] Error getting articles needing rescore:', error);
      return [];
    }
  }
}

export const realtimeScoring = new RealtimeScoringService();

