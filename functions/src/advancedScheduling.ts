/**
 * Advanced Scheduling with Fallback Mechanisms
 * Ensures 12-hour cycles complete with redundancy and automatic recovery
 */

import {getFirestore, Firestore} from "firebase-admin/firestore";
import {logger} from "firebase-functions";

let db: Firestore | null = null;

function getDb(): Firestore {
  if (!db) {
    db = getFirestore();
  }
  return db;
}

export interface ScheduleState {
  cycleId: string;
  scheduledTime: Date;
  executionTime?: Date;
  completionTime?: Date;
  status: 'scheduled' | 'running' | 'completed' | 'failed' | 'retrying';
  retryCount: number;
  maxRetries: number;
  error?: string;
  fallbackTriggered: boolean;
}

export class AdvancedScheduler {
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 5 * 60 * 1000; // 5 minutes
  private readonly CYCLE_TIMEOUT_MS = 45 * 60 * 1000; // 45 minutes

  /**
   * Register a scheduled cycle
   */
  async registerCycle(cycleId: string): Promise<void> {
    try {
      await getDb().collection('schedule_state').doc(cycleId).set({
        cycleId,
        scheduledTime: new Date(),
        status: 'scheduled',
        retryCount: 0,
        maxRetries: this.MAX_RETRIES,
        fallbackTriggered: false,
      });

      logger.info(`[SCHEDULER] Cycle ${cycleId} registered`, {cycleId});
    } catch (error) {
      logger.error('[SCHEDULER] Failed to register cycle:', error);
    }
  }

  /**
   * Mark cycle as running
   */
  async markRunning(cycleId: string): Promise<void> {
    try {
      await getDb().collection('schedule_state').doc(cycleId).update({
        status: 'running',
        executionTime: new Date(),
      });
    } catch (error) {
      logger.error('[SCHEDULER] Failed to mark cycle as running:', error);
    }
  }

  /**
   * Mark cycle as completed
   */
  async markCompleted(cycleId: string): Promise<void> {
    try {
      await getDb().collection('schedule_state').doc(cycleId).update({
        status: 'completed',
        completionTime: new Date(),
      });

      logger.info(`[SCHEDULER] Cycle ${cycleId} completed successfully`, {cycleId});
    } catch (error) {
      logger.error('[SCHEDULER] Failed to mark cycle as completed:', error);
    }
  }

  /**
   * Mark cycle as failed and trigger retry
   */
  async markFailed(cycleId: string, error: Error): Promise<boolean> {
    try {
      const state = await getDb().collection('schedule_state').doc(cycleId).get();
      const data = state.data() as ScheduleState;

      if (!data) {
        logger.warn(`[SCHEDULER] Cycle ${cycleId} not found`);
        return false;
      }

      const retryCount = (data.retryCount || 0) + 1;
      const shouldRetry = retryCount <= this.MAX_RETRIES;

      await getDb().collection('schedule_state').doc(cycleId).update({
        status: shouldRetry ? 'retrying' : 'failed',
        retryCount,
        error: error.message,
      });

      if (shouldRetry) {
        logger.warn(`[SCHEDULER] Cycle ${cycleId} failed, scheduling retry ${retryCount}/${this.MAX_RETRIES}`, {
          error: error.message,
        });

        // Schedule retry via Cloud Tasks
        await this.scheduleRetry(cycleId, retryCount);
      } else {
        logger.error(`[SCHEDULER] Cycle ${cycleId} failed after ${this.MAX_RETRIES} retries`, {
          error: error.message,
        });

        // Trigger fallback mechanism
        await this.triggerFallback(cycleId);
      }

      return shouldRetry;
    } catch (error) {
      logger.error('[SCHEDULER] Failed to mark cycle as failed:', error);
      return false;
    }
  }

  /**
   * Schedule a retry for a failed cycle
   */
  private async scheduleRetry(cycleId: string, retryCount: number): Promise<void> {
    try {
      // Store retry task in Firestore for manual triggering if needed
      await getDb().collection('retry_queue').add({
        cycleId,
        retryCount,
        scheduledFor: new Date(Date.now() + this.RETRY_DELAY_MS),
        status: 'pending',
        createdAt: new Date(),
      });

      logger.info(`[SCHEDULER] Retry scheduled for cycle ${cycleId}`, {retryCount});
    } catch (error) {
      logger.error('[SCHEDULER] Failed to schedule retry:', error);
    }
  }

  /**
   * Trigger fallback mechanism when cycle fails
   */
  private async triggerFallback(cycleId: string): Promise<void> {
    try {
      await getDb().collection('schedule_state').doc(cycleId).update({
        fallbackTriggered: true,
      });

      // Create fallback task
      await getDb().collection('fallback_tasks').add({
        cycleId,
        triggeredAt: new Date(),
        type: 'manual_trigger_required',
        status: 'pending',
        description: 'Cycle failed after max retries. Manual intervention may be required.',
      });

      logger.error(`[SCHEDULER] Fallback triggered for cycle ${cycleId}`);
    } catch (error) {
      logger.error('[SCHEDULER] Failed to trigger fallback:', error);
    }
  }

  /**
   * Check for overdue cycles and trigger recovery
   */
  async checkForOverdueCycles(): Promise<void> {
    try {
      const now = new Date();
      const overdueCycles = await getDb().collection('schedule_state')
        .where('status', 'in', ['scheduled', 'running'])
        .where('scheduledTime', '<', new Date(now.getTime() - this.CYCLE_TIMEOUT_MS))
        .get();

      for (const doc of overdueCycles.docs) {
        const cycle = doc.data() as ScheduleState;
        logger.warn(`[SCHEDULER] Overdue cycle detected: ${cycle.cycleId}`, {
          scheduledTime: cycle.scheduledTime,
          status: cycle.status,
        });

        // Mark as failed and trigger retry
        await this.markFailed(cycle.cycleId, new Error('Cycle timeout - exceeded 45 minutes'));
      }
    } catch (error) {
      logger.error('[SCHEDULER] Error checking for overdue cycles:', error);
    }
  }

  /**
   * Get cycle state
   */
  async getCycleState(cycleId: string): Promise<ScheduleState | null> {
    try {
      const doc = await getDb().collection('schedule_state').doc(cycleId).get();
      return doc.data() as ScheduleState || null;
    } catch (error) {
      logger.error('[SCHEDULER] Error getting cycle state:', error);
      return null;
    }
  }

  /**
   * Get all pending retries
   */
  async getPendingRetries(): Promise<Array<{cycleId: string; retryCount: number; scheduledFor: Date}>> {
    try {
      const now = new Date();
      const snapshot = await getDb().collection('retry_queue')
        .where('status', '==', 'pending')
        .where('scheduledFor', '<=', now)
        .get();

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          cycleId: data.cycleId,
          retryCount: data.retryCount,
          scheduledFor: data.scheduledFor?.toDate() || new Date(),
        };
      });
    } catch (error) {
      logger.error('[SCHEDULER] Error getting pending retries:', error);
      return [];
    }
  }
}

export const scheduler = new AdvancedScheduler();

