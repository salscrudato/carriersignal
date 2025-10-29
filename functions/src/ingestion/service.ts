/**
 * Ingestion Service
 * Orchestrates article ingestion, deduplication, and normalization
 */

import { db } from './firebase';
import { IngestionPlugin, RawArticle, IngestionSource, IngestionResult, IngestionError } from './types';
import { DeduplicationService } from './deduplication';
import { RSSPlugin } from './plugins/rss';
import { ArticleSchema } from '../schemas';

export class IngestionService {
  private plugins: Map<string, IngestionPlugin> = new Map();
  private deduplicationService: DeduplicationService;

  constructor() {
    this.deduplicationService = new DeduplicationService();
    this.registerPlugin(new RSSPlugin());
  }

  /**
   * Register an ingestion plugin
   */
  registerPlugin(plugin: IngestionPlugin): void {
    this.plugins.set(plugin.type, plugin);
  }

  /**
   * Fetch articles from a source with retry logic
   */
  async fetchFromSource(source: IngestionSource): Promise<IngestionResult> {
    const startTime = Date.now();
    const errors: IngestionError[] = [];
    let articlesProcessed = 0;
    let articlesAdded = 0;
    let articlesDuplicate = 0;

    try {
      const plugin = this.plugins.get(source.type);
      if (!plugin) {
        throw new Error(`No plugin found for source type: ${source.type}`);
      }

      // Fetch articles with retry logic
      let articles: RawArticle[] = [];
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= source.maxRetries; attempt++) {
        try {
          articles = await plugin.fetch(source);
          break;
        } catch (error) {
          lastError = error as Error;
          if (attempt < source.maxRetries) {
            const delay = Math.pow(source.backoffMultiplier, attempt) * 1000;
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }

      if (articles.length === 0 && lastError) {
        throw lastError;
      }

      // Process articles
      const existingArticles = await this.getExistingArticles();

      for (const article of articles) {
        articlesProcessed++;

        // Validate article
        const validation = ArticleSchema.safeParse(article);
        if (!validation.success) {
          errors.push({
            code: 'VALIDATION_ERROR',
            message: `Invalid article: ${validation.error.message}`,
            details: { url: article.url },
            timestamp: new Date().toISOString(),
          });
          continue;
        }

        // Check for duplicates
        const duplicateCheck = this.deduplicationService.isContentDuplicate(
          article.url,
          article.title,
          article.text || article.html || '',
          existingArticles
        );

        if (duplicateCheck.isDuplicate) {
          articlesDuplicate++;
          continue;
        }

        // Store article
        try {
          await this.storeArticle(article, source.id);
          articlesAdded++;
        } catch (error) {
          errors.push({
            code: 'STORAGE_ERROR',
            message: `Failed to store article: ${error instanceof Error ? error.message : String(error)}`,
            details: { url: article.url },
            timestamp: new Date().toISOString(),
          });
        }
      }

      // Update source last fetched time
      await this.updateSourceLastFetched(source.id);

      return {
        source: source.name,
        articlesProcessed,
        articlesAdded,
        articlesDuplicate,
        errors,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      errors.push({
        code: 'FETCH_ERROR',
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });

      return {
        source: source.name,
        articlesProcessed,
        articlesAdded,
        articlesDuplicate,
        errors,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get existing articles for deduplication
   */
  private async getExistingArticles(): Promise<Array<{ url: string; title: string; content?: string }>> {
    try {
      const snapshot = await db
        .collection('articles')
        .orderBy('publishedAt', 'desc')
        .limit(1000)
        .get();

      return snapshot.docs.map((doc) => ({
        url: doc.data().url,
        title: doc.data().title,
        content: doc.data().text || doc.data().html,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Store article in Firestore
   */
  private async storeArticle(article: RawArticle, sourceId: string): Promise<void> {
    const contentHash = this.deduplicationService.generateContentHash(
      article.text || article.html || ''
    );

    await db.collection('articles').add({
      ...article,
      sourceId,
      contentHash,
      createdAt: new Date().toISOString(),
      processed: false,
      eventId: null,
    });
  }

  /**
   * Update source last fetched time
   */
  private async updateSourceLastFetched(sourceId: string): Promise<void> {
    await db.collection('ingestionSources').doc(sourceId).update({
      lastFetched: new Date().toISOString(),
    });
  }
}

export default new IngestionService();

