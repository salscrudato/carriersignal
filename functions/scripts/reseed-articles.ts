/**
 * Reseed Script - Populate DB with last 2 days of articles
 * Fetches from RSS sources, enriches with AI, computes SmartScore, and upserts to Firestore
 * Idempotent: safe to run multiple times
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import Parser from 'rss-parser';
import { computeSmartScore } from '../src/ranking/smartScore';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

// Initialize Firebase Admin
function initializeFirebase() {
  const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Using service account key for Firebase authentication');
  } else {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'carriersignal-app',
    });
    console.log('✅ Using default credentials for Firebase authentication');
  }
}

// Check for force flag
if (process.env.FORCE_RESEED !== '1') {
  console.error('❌ FORCE_RESEED=1 environment variable required for safety');
  process.exit(1);
}

initializeFirebase();
const db = admin.firestore();
const parser = new Parser();

/**
 * Extract full article content from URL using Readability
 */
async function extractArticleContent(url: string | null | undefined): Promise<{ content: string; html: string } | null> {
  if (!url) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      return null;
    }

    return {
      content: article.textContent || '',
      html: article.content || '',
    };
  } catch (error) {
    return null;
  }
}

// RSS Feed sources - curated P&C insurance industry sources
const FEED_SOURCES = [
  { name: 'Insurance Journal - National', url: 'https://www.insurancejournal.com/rss/news/national/' },
  { name: 'Insurance Journal - Catastrophes', url: 'https://www.insurancejournal.com/rss/news/catastrophes/' },
  { name: 'Claims Journal', url: 'https://www.claimsjournal.com/rss/' },
  { name: 'Property Casualty 360', url: 'https://www.propertycasualty360.com/feed/' },
  { name: 'Risk and Insurance', url: 'https://www.riskandinsurance.com/feed/' },
];

interface RawArticle {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  description: string;
  content: string;
  html?: string;
}

async function fetchArticles(): Promise<RawArticle[]> {
  const allArticles: RawArticle[] = [];
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

  console.log(`\n📰 Fetching articles from ${FEED_SOURCES.length} sources...`);

  for (const feed of FEED_SOURCES) {
    try {
      console.log(`  Fetching from ${feed.name}...`);

      // Add timeout and retry logic
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const parsedFeed = await parser.parseURL(feed.url);
      clearTimeout(timeoutId);

      if (parsedFeed.items && parsedFeed.items.length > 0) {
        console.log(`    Found ${parsedFeed.items.length} items`);

        for (const item of parsedFeed.items) {
          try {
            const pubDate = new Date(item.pubDate || item.isoDate || new Date());

            if (pubDate >= twoDaysAgo) {
              // Try to extract full content from the article URL
              const extractedContent = await extractArticleContent(item.link || '');

              const article: RawArticle = {
                title: item.title || '',
                url: item.link || '',
                source: feed.name,
                publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
                description: item.contentSnippet || '',
                content: extractedContent?.content || (item as any).content || item.content || (item as any).description || '',
                html: extractedContent?.html || '',
              };

              if (article.title && article.url) {
                allArticles.push(article);
              }
            }
          } catch (itemError) {
            // Skip individual items that fail to parse
            continue;
          }
        }
        console.log(`    ✅ Added ${allArticles.length} articles from ${feed.name}`);
      } else {
        console.log(`    ⚠️  No items found in feed`);
      }
    } catch (error) {
      console.error(`  ❌ Error fetching from ${feed.name}:`, error instanceof Error ? error.message : error);
      // Continue with next feed on error
    }
  }

  console.log(`✅ Fetched ${allArticles.length} articles from last 2 days`);
  return allArticles;
}

async function deduplicateArticles(articles: RawArticle[]): Promise<RawArticle[]> {
  const seen = new Set<string>();
  const deduplicated: RawArticle[] = [];

  for (const article of articles) {
    const key = `${article.url}|${article.title}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(article);
    }
  }

  console.log(`✅ Deduplicated: ${articles.length} → ${deduplicated.length} articles`);
  return deduplicated;
}

async function clearDatabase() {
  // DISABLED: Don't clear database - reseed is idempotent via upsert
  // This preserves older articles and only updates/adds new ones
  console.log('\n⏭️  Skipping database clear (reseed is idempotent via upsert)');
}

async function upsertArticles(articles: RawArticle[]) {
  console.log(`\n💾 Upserting ${articles.length} articles to Firestore...`);

  let inserted = 0;
  let updated = 0;
  let failed = 0;

  for (const article of articles) {
    try {
      // Compute SmartScore
      const scoreResult = computeSmartScore(
        article.url,
        article.title,
        article.content,
        article.publishedAt,
        0.75, // Default P&C relevance
        1.0   // Default source credibility
      );

      const docId = Buffer.from(article.url).toString('base64').substring(0, 20);
      const docRef = db.collection('articles').doc(docId);

      // Check if document exists before upserting
      const existingDoc = await docRef.get();
      const isNew = !existingDoc.exists;

      const docData: any = {
        title: article.title,
        url: article.url,
        source: article.source,
        publishedAt: article.publishedAt,
        description: article.description,
        content: article.content,
        smartScore: scoreResult.smartScore,
        scoreFeatures: scoreResult.scoreFeatures,
        updatedAt: new Date(),
      };

      // Add html if available
      if (article.html) {
        docData.html = article.html;
      }

      // Only set createdAt if this is a new document
      if (isNew) {
        (docData as any).createdAt = new Date();
      }

      // Use set with merge to be idempotent
      await docRef.set(docData, { merge: true });

      if (isNew) {
        inserted++;
      } else {
        updated++;
      }
    } catch (error) {
      console.error(`  ❌ Error upserting article: ${article.title}`, error instanceof Error ? error.message : error);
      failed++;
    }
  }

  console.log(`✅ Upsert complete: ${inserted} inserted, ${updated} updated, ${failed} failed`);
  return { inserted, updated, failed };
}

async function main() {
  try {
    console.log('🚀 Starting article reseed...');
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);

    // Fetch articles
    const articles = await fetchArticles();
    if (articles.length === 0) {
      console.log('⚠️  No articles found in last 2 days');
      process.exit(0);
    }

    // Deduplicate
    const deduplicated = await deduplicateArticles(articles);

    // Clear database
    await clearDatabase();

    // Upsert articles
    const stats = await upsertArticles(deduplicated);

    // Summary
    console.log('\n📊 Reseed Summary:');
    console.log(`  Total fetched: ${articles.length}`);
    console.log(`  After dedup: ${deduplicated.length}`);
    console.log(`  Inserted: ${stats.inserted}`);
    console.log(`  Updated: ${stats.updated}`);
    console.log(`  Failed: ${stats.failed}`);
    console.log('\n✅ Reseed complete!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Reseed failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();

