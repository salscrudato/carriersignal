/**
 * EDGAR Backfill for Earnings & Filings
 * Subscribes to SEC EDGAR RSS feeds for P&C carriers
 */

import Parser from 'rss-parser';
import { Firestore } from 'firebase-admin/firestore';

interface CarrierMapping {
  name: string;
  ticker: string;
  cik: string;
}

// Major P&C carriers with SEC identifiers
const MAJOR_CARRIERS: CarrierMapping[] = [
  { name: 'Allstate', ticker: 'ALL', cik: '0000003548' },
  { name: 'Progressive', ticker: 'PGR', cik: '0000080661' },
  { name: 'Chubb', ticker: 'CB', cik: '0000896159' },
  { name: 'Travelers', ticker: 'TRV', cik: '0001540570' },
  { name: 'Hartford', ticker: 'HIG', cik: '0000874766' },
  { name: 'AIG', ticker: 'AIG', cik: '0000005272' },
  { name: 'Kemper', ticker: 'KMPR', cik: '0000049071' },
  { name: 'Hanover', ticker: 'THG', cik: '0000049071' },
];

interface EDGARArticle {
  title: string;
  link: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
  carrier: string;
  ticker: string;
  cik: string;
  filingType: string;
}

/**
 * Extract filing type from EDGAR feed item
 */
function extractFilingType(title: string): string {
  if (title.includes('8-K')) return '8-K';
  if (title.includes('10-Q')) return '10-Q';
  if (title.includes('10-K')) return '10-K';
  if (title.includes('20-F')) return '20-F';
  if (title.includes('424B')) return '424B';
  return 'Other';
}

/**
 * Fetch EDGAR RSS feed for a specific carrier
 */
async function fetchCarrierEDGARFeed(carrier: CarrierMapping, timeout: number = 10000): Promise<EDGARArticle[]> {
  const parser = new Parser({ timeout });

  try {
    // EDGAR RSS URL for company filings
    const url = `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${carrier.cik}&type=&dateb=&owner=exclude&count=100&search_text=&output=atom`;

    const feed = await parser.parseURL(url);
    return (feed.items || []).map(item => ({
      title: item.title || '',
      link: item.link || '',
      pubDate: item.pubDate,
      content: item.content || item.contentSnippet || '',
      contentSnippet: item.contentSnippet || '',
      carrier: carrier.name,
      ticker: carrier.ticker,
      cik: carrier.cik,
      filingType: extractFilingType(item.title || ''),
    }));
  } catch (error) {
    console.error(`[EDGAR] Failed to fetch EDGAR feed for ${carrier.name}:`, error);
    return [];
  }
}

/**
 * Backfill EDGAR filings for all carriers
 */
export async function backfillEDGARFilings(db: Firestore): Promise<void> {
  const batchId = `edgar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const batchStartTime = Date.now();

  console.log(`[EDGAR] Starting EDGAR backfill batch ${batchId}`);

  try {
    let totalProcessed = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    // Process each carrier
    for (const carrier of MAJOR_CARRIERS) {
      try {
        const articles = await fetchCarrierEDGARFeed(carrier);
        console.log(`[EDGAR] Fetched ${articles.length} filings for ${carrier.name}`);

        // Process each article
        for (const article of articles) {
          try {
            if (!article.title || !article.link) {
              totalSkipped++;
              continue;
            }

            // Check for duplicates
            const existing = await db
              .collection('newsArticles')
              .where('link', '==', article.link)
              .limit(1)
              .get();

            if (!existing.empty) {
              totalSkipped++;
              continue;
            }

            // Create article document
            const now = Date.now();
            const publishedAt = article.pubDate ? new Date(article.pubDate).getTime() : now;

            await db.collection('newsArticles').add({
              title: article.title,
              link: article.link,
              canonicalLink: article.link,
              publishedAt,
              sourceId: 'sec_edgar',
              excerpt: article.contentSnippet || article.title,
              contentText: article.content || '',
              states: [],
              lobs: [],
              carriers: [article.carrier],
              cikList: [article.cik],
              regulators: ['SEC'],
              clusterKey: `edgar_${article.ticker}_${article.filingType}`,
              severity: 3, // Medium severity for earnings
              actionability: 'Review Portfolio',
              score: 60,
              topics: ['earnings', 'filings', article.filingType],
              confidence: 0.9,
              validationPass: true,
              createdAt: now,
              updatedAt: now,
            });

            totalProcessed++;
          } catch (error) {
            console.error(`[EDGAR] Error processing article for ${carrier.name}:`, error);
            totalErrors++;
          }
        }

        // Rate limiting: wait 2 seconds between carriers
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`[EDGAR] Error processing carrier ${carrier.name}:`, error);
        totalErrors++;
      }
    }

    const batchDuration = Date.now() - batchStartTime;

    // Log batch completion
    await db.collection('ingestionMetrics').add({
      batchId,
      timestamp: Date.now(),
      source: 'edgar',
      articlesProcessed: totalProcessed,
      articlesSkipped: totalSkipped,
      errors: totalErrors,
      duration: batchDuration,
      successRate: totalProcessed / (totalProcessed + totalSkipped + totalErrors) || 0,
    });

    console.log(
      `[EDGAR] Batch ${batchId} complete: ${totalProcessed} processed, ${totalSkipped} skipped, ${totalErrors} errors (${batchDuration}ms)`
    );
  } catch (error) {
    console.error(`[EDGAR] Batch ${batchId} failed:`, error);
    throw error;
  }
}

/**
 * Schedule EDGAR backfill (daily)
 * Call this from a Cloud Scheduler job
 */
export async function scheduleEDGARBackfill(db: Firestore): Promise<void> {
  console.log('[EDGAR] Scheduled EDGAR backfill triggered');
  await backfillEDGARFilings(db);
}

