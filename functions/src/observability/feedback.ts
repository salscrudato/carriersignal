/**
 * Feedback Service
 * Collects and processes user feedback for continuous improvement
 */

import { db } from '../ingestion/firebase';

export interface UserFeedback {
  id: string;
  userId: string;
  type: 'bug' | 'feature_request' | 'improvement' | 'other';
  title: string;
  description: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  context?: {
    url: string;
    userAgent: string;
    timestamp: string;
  };
  attachments?: string[];
  status: 'new' | 'acknowledged' | 'in_progress' | 'resolved' | 'wontfix';
  createdAt: string;
  updatedAt: string;
}

export interface SummaryAccuracy {
  summaryId: string;
  articleId: string;
  rating: 1 | 2 | 3 | 4 | 5; // 1-5 stars
  accuracy: number; // 0-100
  completeness: number; // 0-100
  clarity: number; // 0-100
  comments?: string;
  createdAt: string;
}

export interface RankingFeedback {
  eventId: string;
  userId: string;
  relevance: 1 | 2 | 3 | 4 | 5; // 1-5 stars
  helpful: boolean;
  comments?: string;
  createdAt: string;
}

export class FeedbackService {
  /**
   * Submit user feedback
   */
  async submitFeedback(
    userId: string,
    type: UserFeedback['type'],
    title: string,
    description: string,
    severity?: UserFeedback['severity']
  ): Promise<string> {
    try {
      const feedback: Omit<UserFeedback, 'id'> = {
        userId,
        type,
        title,
        description,
        severity,
        context: {
          url: typeof window !== 'undefined' ? window.location.href : '',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          timestamp: new Date().toISOString(),
        },
        status: 'new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await db.collection('user_feedback').add(feedback);
      return docRef.id;
    } catch (error) {
      throw new Error(`Failed to submit feedback: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Rate summary accuracy
   */
  async rateSummaryAccuracy(
    summaryId: string,
    articleId: string,
    rating: 1 | 2 | 3 | 4 | 5,
    accuracy: number,
    completeness: number,
    clarity: number,
    comments?: string
  ): Promise<void> {
    try {
      const feedback: SummaryAccuracy = {
        summaryId,
        articleId,
        rating,
        accuracy,
        completeness,
        clarity,
        comments,
        createdAt: new Date().toISOString(),
      };

      await db.collection('summary_accuracy_feedback').add(feedback);

      // Update summary quality metrics
      await db.collection('summaryCache').doc(summaryId).update({
        userRating: rating,
        accuracyScore: accuracy,
        completenessScore: completeness,
        clarityScore: clarity,
      });
    } catch (error) {
      throw new Error(`Failed to rate summary: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Rate ranking relevance
   */
  async rateRankingRelevance(
    eventId: string,
    userId: string,
    relevance: 1 | 2 | 3 | 4 | 5,
    helpful: boolean,
    comments?: string
  ): Promise<void> {
    try {
      const feedback: RankingFeedback = {
        eventId,
        userId,
        relevance,
        helpful,
        comments,
        createdAt: new Date().toISOString(),
      };

      await db.collection('ranking_feedback').add(feedback);
    } catch (error) {
      throw new Error(`Failed to rate ranking: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get feedback summary
   */
  async getFeedbackSummary(): Promise<{
    totalFeedback: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    averageSeverity: number;
  }> {
    try {
      const snapshot = await db.collection('user_feedback').get();
      const feedback = snapshot.docs.map((doc) => doc.data() as UserFeedback);

      const byType: Record<string, number> = {};
      const byStatus: Record<string, number> = {};
      let totalSeverity = 0;
      let severityCount = 0;

      for (const item of feedback) {
        byType[item.type] = (byType[item.type] || 0) + 1;
        byStatus[item.status] = (byStatus[item.status] || 0) + 1;

        if (item.severity) {
          const severityMap = { low: 1, medium: 2, high: 3, critical: 4 };
          totalSeverity += severityMap[item.severity];
          severityCount++;
        }
      }

      return {
        totalFeedback: feedback.length,
        byType,
        byStatus,
        averageSeverity: severityCount > 0 ? totalSeverity / severityCount : 0,
      };
    } catch (error) {
      console.error('Failed to get feedback summary:', error);
      return {
        totalFeedback: 0,
        byType: {},
        byStatus: {},
        averageSeverity: 0,
      };
    }
  }
}

export default new FeedbackService();

