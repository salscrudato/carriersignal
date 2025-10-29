/**
 * Tests for enhanced AI scoring and ranking system
 * Verifies dynamic recency decay, interest-based scoring, and real-time updates
 */

import { calculateDynamicArticleScore, sortByDynamicScore, sortByRecency } from '../scoring';
import type { Article } from '../../types';

describe('Enhanced Scoring System', () => {
  // Helper to create test articles
  const createArticle = (overrides: Partial<Article> = {}): Article => ({
    title: 'Test Article',
    url: 'https://example.com/article',
    source: 'Test Source',
    publishedAt: new Date().toISOString(),
    impactScore: 50,
    ...overrides,
  });

  describe('calculateDynamicArticleScore', () => {
    it('should calculate score for fresh articles', () => {
      const article = createArticle({
        publishedAt: new Date().toISOString(),
        impactScore: 75,
      });

      const score = calculateDynamicArticleScore(article);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should apply higher scores to fresh content', () => {
      const now = new Date();
      const freshArticle = createArticle({
        publishedAt: new Date(now.getTime() - 1000 * 60 * 60).toISOString(), // 1 hour old
        impactScore: 50,
      });

      const oldArticle = createArticle({
        publishedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days old
        impactScore: 50,
      });

      const freshScore = calculateDynamicArticleScore(freshArticle);
      const oldScore = calculateDynamicArticleScore(oldArticle);

      expect(freshScore).toBeGreaterThan(oldScore);
    });

    it('should apply catastrophe boost', () => {
      const regularArticle = createArticle({
        impactScore: 50,
        stormName: undefined,
      });

      const catArticle = createArticle({
        impactScore: 50,
        stormName: 'Hurricane Milton',
      });

      const regularScore = calculateDynamicArticleScore(regularArticle);
      const catScore = calculateDynamicArticleScore(catArticle);

      expect(catScore).toBeGreaterThan(regularScore);
    });

    it('should apply regulatory boost', () => {
      const regularArticle = createArticle({
        impactScore: 50,
        regulatory: false,
      });

      const regArticle = createArticle({
        impactScore: 50,
        regulatory: true,
      });

      const regularScore = calculateDynamicArticleScore(regularArticle);
      const regScore = calculateDynamicArticleScore(regArticle);

      expect(regScore).toBeGreaterThan(regularScore);
    });

    it('should apply engagement boost', () => {
      const noEngagementArticle = createArticle({
        impactScore: 50,
        engagementMetrics: { clicks: 0, saves: 0, shares: 0, timeSpent: 0 },
      });

      const engagedArticle = createArticle({
        impactScore: 50,
        engagementMetrics: { clicks: 50, saves: 25, shares: 10, timeSpent: 300 },
      });

      const noEngagementScore = calculateDynamicArticleScore(noEngagementArticle);
      const engagedScore = calculateDynamicArticleScore(engagedArticle);

      expect(engagedScore).toBeGreaterThan(noEngagementScore);
    });

    it('should apply risk pulse multiplier', () => {
      const lowRiskArticle = createArticle({
        impactScore: 50,
        riskPulse: 'LOW',
      });

      const highRiskArticle = createArticle({
        impactScore: 50,
        riskPulse: 'HIGH',
      });

      const lowScore = calculateDynamicArticleScore(lowRiskArticle);
      const highScore = calculateDynamicArticleScore(highRiskArticle);

      expect(highScore).toBeGreaterThan(lowScore);
    });

    it('should handle evergreen content with slower decay', () => {
      const now = new Date();
      const oldEvergreen = createArticle({
        publishedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 14).toISOString(), // 14 days old
        impactScore: 50,
        isEvergreen: true,
      });

      const oldRegular = createArticle({
        publishedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 14).toISOString(), // 14 days old
        impactScore: 50,
        isEvergreen: false,
      });

      const evergreenScore = calculateDynamicArticleScore(oldEvergreen);
      const regularScore = calculateDynamicArticleScore(oldRegular);

      expect(evergreenScore).toBeGreaterThan(regularScore);
    });
  });

  describe('sortByDynamicScore', () => {
    it('should sort articles by dynamic score', () => {
      const now = new Date();
      const articles = [
        createArticle({
          title: 'Old Article',
          publishedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7).toISOString(),
          impactScore: 50,
        }),
        createArticle({
          title: 'Fresh Article',
          publishedAt: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
          impactScore: 50,
        }),
        createArticle({
          title: 'High Impact Old Article',
          publishedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7).toISOString(),
          impactScore: 90,
        }),
      ];

      const sorted = sortByDynamicScore(articles);

      expect(sorted.length).toBe(3);
      expect(sorted[0].title).toBe('Fresh Article');
    });

    it('should maintain articles with high impact even if older', () => {
      const now = new Date();
      const articles = [
        createArticle({
          title: 'Fresh Low Impact',
          publishedAt: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
          impactScore: 30,
        }),
        createArticle({
          title: 'Old High Impact',
          publishedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(),
          impactScore: 85,
        }),
      ];

      const sorted = sortByDynamicScore(articles);

      // High impact should rank higher even if older
      expect(sorted[0].title).toBe('Old High Impact');
    });
  });

  describe('sortByRecency', () => {
    it('should sort articles by published date', () => {
      const now = new Date();
      const articles = [
        createArticle({
          title: 'Old Article',
          publishedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        }),
        createArticle({
          title: 'Fresh Article',
          publishedAt: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
        }),
      ];

      const sorted = sortByRecency(articles);

      expect(sorted[0].title).toBe('Fresh Article');
      expect(sorted[1].title).toBe('Old Article');
    });
  });
});

