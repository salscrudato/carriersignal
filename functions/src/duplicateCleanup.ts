/**
 * Duplicate Cleanup Service
 * Identifies and removes duplicate articles from database
 */

import { getFirestore, Firestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";

let db: Firestore | null = null;

function getDb(): Firestore {
  if (!db) {
    db = getFirestore();
  }
  return db;
}

export interface CleanupResult {
  totalArticlesScanned: number;
  duplicatesIdentified: number;
  duplicatesRemoved: number;
  duplicatesMarked: number;
  errors: number;
  processingTimeMs: number;
  details: CleanupDetail[];
}

export interface CleanupDetail {
  primaryArticleId: string;
  duplicateArticleIds: string[];
  reason: string;
  action: 'removed' | 'marked' | 'error';
}

class DuplicateCleanupService {
  /**
   * Scan and clean duplicates from past 24 hours
   */
  async cleanupDuplicates24Hours(dryRun: boolean = true): Promise<CleanupResult> {
    try {
      const startTime = Date.now();
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const result: CleanupResult = {
        totalArticlesScanned: 0,
        duplicatesIdentified: 0,
        duplicatesRemoved: 0,
        duplicatesMarked: 0,
        errors: 0,
        processingTimeMs: 0,
        details: [],
      };

      // Get all articles from past 24 hours
      const snapshot = await getDb().collection('newsArticles')
        .where('publishedAt', '>=', cutoff)
        .orderBy('publishedAt', 'desc')
        .get();

      result.totalArticlesScanned = snapshot.size;
      const seenUrls = new Map<string, string>(); // normalized URL -> article ID
      const duplicateGroups: Map<string, string[]> = new Map(); // primary ID -> duplicate IDs

      // First pass: identify duplicates
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const normalizedUrl = this.normalizeUrl(data.url || data.canonicalLink);

        if (seenUrls.has(normalizedUrl)) {
          const primaryId = seenUrls.get(normalizedUrl)!;
          if (!duplicateGroups.has(primaryId)) {
            duplicateGroups.set(primaryId, []);
          }
          duplicateGroups.get(primaryId)!.push(doc.id);
          result.duplicatesIdentified++;
        } else {
          seenUrls.set(normalizedUrl, doc.id);
        }
      }

      // Second pass: remove or mark duplicates
      for (const [primaryId, duplicateIds] of duplicateGroups.entries()) {
        try {
          if (dryRun) {
            result.duplicatesMarked += duplicateIds.length;
            result.details.push({
              primaryArticleId: primaryId,
              duplicateArticleIds: duplicateIds,
              reason: 'URL match',
              action: 'marked',
            });
          } else {
            // Mark duplicates
            for (const dupId of duplicateIds) {
              await getDb().collection('newsArticles').doc(dupId).update({
                isDuplicate: true,
                duplicateOf: primaryId,
                markedAt: new Date(),
              });
            }
            result.duplicatesMarked += duplicateIds.length;

            // Optionally delete after marking (keep for 7 days first)
            result.details.push({
              primaryArticleId: primaryId,
              duplicateArticleIds: duplicateIds,
              reason: 'URL match',
              action: 'marked',
            });
          }
        } catch (error) {
          logger.error(`[CLEANUP] Error processing duplicates for ${primaryId}:`, error);
          result.errors++;
        }
      }

      result.processingTimeMs = Date.now() - startTime;
      return result;
    } catch (error) {
      logger.error('[CLEANUP] Error during cleanup:', error);
      throw error;
    }
  }

  /**
   * Remove marked duplicates older than threshold
   */
  async removeOldMarkedDuplicates(daysOld: number = 7): Promise<{removed: number; errors: number}> {
    try {
      const cutoff = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

      const snapshot = await getDb().collection('newsArticles')
        .where('isDuplicate', '==', true)
        .where('markedAt', '<=', cutoff)
        .limit(100)
        .get();

      let removed = 0;
      let errors = 0;

      for (const doc of snapshot.docs) {
        try {
          await doc.ref.delete();
          removed++;
        } catch (error) {
          logger.error(`[CLEANUP] Error deleting duplicate ${doc.id}:`, error);
          errors++;
        }
      }

      logger.info(`[CLEANUP] Removed ${removed} old marked duplicates, ${errors} errors`);
      return { removed, errors };
    } catch (error) {
      logger.error('[CLEANUP] Error removing old duplicates:', error);
      throw error;
    }
  }

  /**
   * Identify duplicates by content hash
   */
  async identifyContentHashDuplicates(): Promise<{duplicateGroups: number; totalDuplicates: number}> {
    try {
      const snapshot = await getDb().collection('newsArticles')
        .where('contentHash', '!=', null)
        .limit(1000)
        .get();

      const hashGroups = new Map<string, string[]>();

      for (const doc of snapshot.docs) {
        const hash = doc.data().contentHash;
        if (hash) {
          if (!hashGroups.has(hash)) {
            hashGroups.set(hash, []);
          }
          hashGroups.get(hash)!.push(doc.id);
        }
      }

      let duplicateGroups = 0;
      let totalDuplicates = 0;

      for (const [, ids] of hashGroups.entries()) {
        if (ids.length > 1) {
          duplicateGroups++;
          totalDuplicates += ids.length - 1;
        }
      }

      logger.info(`[CLEANUP] Found ${duplicateGroups} content hash duplicate groups with ${totalDuplicates} total duplicates`);
      return { duplicateGroups, totalDuplicates };
    } catch (error) {
      logger.error('[CLEANUP] Error identifying content hash duplicates:', error);
      throw error;
    }
  }

  /**
   * Get duplicate statistics
   */
  async getDuplicateStats(): Promise<{
    totalDuplicates: number;
    markedDuplicates: number;
    oldMarkedDuplicates: number;
    duplicateRate: number;
  }> {
    try {
      const [totalDups, markedDups, oldMarkedDups, totalArticles] = await Promise.all([
        getDb().collection('newsArticles').where('isDuplicate', '==', true).count().get(),
        getDb().collection('newsArticles').where('isDuplicate', '==', true).where('markedAt', '!=', null).count().get(),
        getDb().collection('newsArticles')
          .where('isDuplicate', '==', true)
          .where('markedAt', '<=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          .count()
          .get(),
        getDb().collection('newsArticles').count().get(),
      ]);

      const totalCount = totalArticles.data().count;
      return {
        totalDuplicates: totalDups.data().count,
        markedDuplicates: markedDups.data().count,
        oldMarkedDuplicates: oldMarkedDups.data().count,
        duplicateRate: totalCount > 0 ? totalDups.data().count / totalCount : 0,
      };
    } catch (error) {
      logger.error('[CLEANUP] Error getting duplicate stats:', error);
      throw error;
    }
  }

  /**
   * Normalize URL for comparison
   */
  private normalizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      return `${parsed.protocol}//${parsed.hostname}${parsed.pathname}`.toLowerCase();
    } catch {
      return url.toLowerCase();
    }
  }
}

export const duplicateCleanup = new DuplicateCleanupService();

