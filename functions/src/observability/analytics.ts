/**
 * Analytics Service
 * Structured event tracking and observability
 */

import { db } from '../ingestion/firebase';

export interface AnalyticsEvent {
  eventType: string;
  userId?: string;
  sessionId: string;
  timestamp: string;
  properties: Record<string, unknown>;
  context: {
    userAgent: string;
    url: string;
    referrer?: string;
  };
}

export interface UserEngagement {
  userId: string;
  sessionCount: number;
  totalTimeSpent: number; // seconds
  articlesViewed: number;
  articlesBookmarked: number;
  filtersApplied: number;
  lastActive: string;
}

export interface SourceMetrics {
  sourceId: string;
  articlesIngested: number;
  articlesProcessed: number;
  averageProcessingTime: number; // ms
  errorRate: number; // 0-1
  lastIngestionTime: string;
}

export class AnalyticsService {
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track analytics event
   */
  async trackEvent(
    eventType: string,
    userId: string | undefined,
    properties: Record<string, unknown>,
    context: { userAgent: string; url: string; referrer?: string }
  ): Promise<void> {
    try {
      const event: AnalyticsEvent = {
        eventType,
        userId,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        properties,
        context,
      };

      await db.collection('analytics_events').add(event);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  /**
   * Track article view
   */
  async trackArticleView(userId: string, articleId: string, timeSpent: number): Promise<void> {
    await this.trackEvent(
      'article_view',
      userId,
      {
        articleId,
        timeSpent,
      },
      {
        userAgent: navigator.userAgent,
        url: window.location.href,
      }
    );
  }

  /**
   * Track bookmark action
   */
  async trackBookmark(userId: string, articleId: string, action: 'add' | 'remove'): Promise<void> {
    await this.trackEvent(
      'bookmark',
      userId,
      {
        articleId,
        action,
      },
      {
        userAgent: navigator.userAgent,
        url: window.location.href,
      }
    );
  }

  /**
   * Track filter application
   */
  async trackFilterApplied(userId: string, filters: Record<string, unknown>): Promise<void> {
    await this.trackEvent(
      'filter_applied',
      userId,
      {
        filters,
        filterCount: Object.keys(filters).length,
      },
      {
        userAgent: navigator.userAgent,
        url: window.location.href,
      }
    );
  }

  /**
   * Track search query
   */
  async trackSearch(userId: string, query: string, resultCount: number): Promise<void> {
    await this.trackEvent(
      'search',
      userId,
      {
        query,
        resultCount,
      },
      {
        userAgent: navigator.userAgent,
        url: window.location.href,
      }
    );
  }

  /**
   * Get user engagement metrics
   */
  async getUserEngagement(userId: string): Promise<UserEngagement> {
    try {
      const snapshot = await db
        .collection('analytics_events')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(1000)
        .get();

      const events = snapshot.docs.map((doc) => doc.data() as AnalyticsEvent);

      const sessionCount = new Set(events.map((e) => e.sessionId)).size;
      const articlesViewed = events.filter((e) => e.eventType === 'article_view').length;
      const articlesBookmarked = events.filter((e) => e.eventType === 'bookmark').length;
      const filtersApplied = events.filter((e) => e.eventType === 'filter_applied').length;

      const totalTimeSpent = events
        .filter((e) => e.eventType === 'article_view')
        .reduce((sum, e) => sum + ((e.properties.timeSpent as number) || 0), 0);

      const lastActive = events.length > 0 ? events[0].timestamp : new Date().toISOString();

      return {
        userId,
        sessionCount,
        totalTimeSpent,
        articlesViewed,
        articlesBookmarked,
        filtersApplied,
        lastActive,
      };
    } catch (error) {
      console.error('Failed to get user engagement:', error);
      return {
        userId,
        sessionCount: 0,
        totalTimeSpent: 0,
        articlesViewed: 0,
        articlesBookmarked: 0,
        filtersApplied: 0,
        lastActive: new Date().toISOString(),
      };
    }
  }

  /**
   * Get source metrics
   */
  async getSourceMetrics(sourceId: string): Promise<SourceMetrics> {
    try {
      const articlesSnapshot = await db
        .collection('articles')
        .where('sourceId', '==', sourceId)
        .get();

      const articles = articlesSnapshot.docs.map((doc) => doc.data());
      const processedArticles = articles.filter((a) => a.processed).length;

      const sourceDoc = await db.collection('ingestionSources').doc(sourceId).get();
      const source = sourceDoc.data();

      return {
        sourceId,
        articlesIngested: articles.length,
        articlesProcessed: processedArticles,
        averageProcessingTime: 0,
        errorRate: 0,
        lastIngestionTime: (source?.lastFetched as string) || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to get source metrics:', error);
      return {
        sourceId,
        articlesIngested: 0,
        articlesProcessed: 0,
        averageProcessingTime: 0,
        errorRate: 0,
        lastIngestionTime: new Date().toISOString(),
      };
    }
  }
}

export default new AnalyticsService();

