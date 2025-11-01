/**
 * News Ingestion Pipeline
 * Fetches, parses, normalizes, and deduplicates news from multiple sources
 */

import Parser from 'rss-parser';
import * as crypto from 'crypto';
import { Firestore } from 'firebase-admin/firestore';

interface NewsSource {
  id: string;
  name: string;
  type: 'rss' | 'atom' | 'json' | 'html' | 'api';
  url: string;
  region?: string;
  lobHints?: string[];
  trustScore: number;
  active: boolean;
}

interface ParsedArticle {
  title: string;
  link: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
  author?: string;
  source: string;
}

interface IngestionResult {
  sourceId: string;
  sourceName: string;
  articlesProcessed: number;
  articlesSkipped: number;
  errors: number;
  duration: number;
}

/**
 * Compute SHA1 hash of normalized content for deduplication
 */
function computeContentHash(title: string, link: string, source: string): string {
  const normalized = `${title.toLowerCase().trim()}|${link.toLowerCase().trim()}|${source.toLowerCase().trim()}`;
  return crypto.createHash('sha1').update(normalized).digest('hex');
}

/**
 * Normalize URL to canonical form
 */
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove tracking parameters
    const params = new URLSearchParams(parsed.search);
    params.delete('utm_source');
    params.delete('utm_medium');
    params.delete('utm_campaign');
    params.delete('utm_content');
    params.delete('utm_term');
    parsed.search = params.toString();
    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * Fetch and parse RSS/Atom feed
 */
async function fetchRssFeed(url: string, timeout: number = 10000): Promise<ParsedArticle[]> {
  const parser = new Parser({
    timeout,
    customFields: {
      item: [
        ['content:encoded', 'content'],
        ['description', 'contentSnippet'],
      ],
    },
  });

  try {
    const feed = await parser.parseURL(url);
    return (feed.items || []).map(item => ({
      title: item.title || '',
      link: item.link || '',
      pubDate: item.pubDate,
      content: item.content || item.contentSnippet || '',
      contentSnippet: item.contentSnippet || '',
      author: item.creator || '',
      source: feed.title || 'Unknown',
    }));
  } catch (error) {
    console.error(`[INGEST] Failed to fetch RSS from ${url}:`, error);
    return [];
  }
}

/**
 * Ingest articles from a single source
 */
async function ingestFromSource(
  db: Firestore,
  source: NewsSource,
  startTime: number
): Promise<IngestionResult> {
  const result: IngestionResult = {
    sourceId: source.id,
    sourceName: source.name,
    articlesProcessed: 0,
    articlesSkipped: 0,
    errors: 0,
    duration: 0,
  };

  try {
    let articles: ParsedArticle[] = [];

    // Fetch based on source type
    if (source.type === 'rss' || source.type === 'atom') {
      articles = await fetchRssFeed(source.url);
    } else {
      console.warn(`[INGEST] Unsupported source type: ${source.type}`);
      return result;
    }

    // Process each article
    for (const article of articles) {
      try {
        if (!article.title || !article.link) {
          result.articlesSkipped++;
          continue;
        }

        const canonicalLink = normalizeUrl(article.link);
        const contentHash = computeContentHash(article.title, canonicalLink, source.id);

        // Check for duplicates
        const existing = await db
          .collection('newsArticles')
          .where('canonicalLink', '==', canonicalLink)
          .limit(1)
          .get();

        if (!existing.empty) {
          result.articlesSkipped++;
          continue;
        }

        // Write raw article for processing
        await db.collection('newsRaw').add({
          sourceId: source.id,
          fetchedAt: Date.now(),
          hash: contentHash,
          raw: JSON.stringify(article),
          status: 'pending',
          createdAt: Date.now(),
        });

        result.articlesProcessed++;
      } catch (error) {
        console.error(`[INGEST] Error processing article from ${source.name}:`, error);
        result.errors++;
      }
    }

    // Update source metadata
    await db.collection('newsSources').doc(source.id).update({
      lastFetchedAt: Date.now(),
      fetchErrorCount: result.errors > 0 ? 1 : 0,
      updatedAt: Date.now(),
    });

    result.duration = Date.now() - startTime;
    return result;
  } catch (error) {
    console.error(`[INGEST] Fatal error ingesting from ${source.name}:`, error);
    result.errors++;
    result.duration = Date.now() - startTime;
    return result;
  }
}

/**
 * Main ingestion orchestrator
 * Fetches all active sources and processes articles
 */
export async function ingestAllFeeds(db: Firestore): Promise<void> {
  const batchId = `ingest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const batchStartTime = Date.now();

  console.log(`[INGEST] Starting batch ${batchId}`);

  try {
    // Fetch all active sources
    const sourcesSnapshot = await db
      .collection('newsSources')
      .where('active', '==', true)
      .get();

    const results: IngestionResult[] = [];
    let totalProcessed = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    // Process each source sequentially with rate limiting
    for (const sourceDoc of sourcesSnapshot.docs) {
      const source = { id: sourceDoc.id, ...sourceDoc.data() } as NewsSource;
      const sourceStartTime = Date.now();

      const result = await ingestFromSource(db, source, sourceStartTime);
      results.push(result);

      totalProcessed += result.articlesProcessed;
      totalSkipped += result.articlesSkipped;
      totalErrors += result.errors;

      console.log(
        `[INGEST] ${source.name}: ${result.articlesProcessed} processed, ${result.articlesSkipped} skipped, ${result.errors} errors (${result.duration}ms)`
      );

      // Rate limiting: wait 1 second between sources
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const batchDuration = Date.now() - batchStartTime;

    // Log batch completion
    await db.collection('ingestionMetrics').add({
      batchId,
      timestamp: Date.now(),
      sourcesProcessed: sourcesSnapshot.size,
      articlesProcessed: totalProcessed,
      articlesSkipped: totalSkipped,
      errors: totalErrors,
      duration: batchDuration,
      successRate: totalProcessed / (totalProcessed + totalSkipped + totalErrors) || 0,
      results,
    });

    console.log(
      `[INGEST] Batch ${batchId} complete: ${totalProcessed} processed, ${totalSkipped} skipped, ${totalErrors} errors (${batchDuration}ms)`
    );
  } catch (error) {
    console.error(`[INGEST] Batch ${batchId} failed:`, error);
    throw error;
  }
}

