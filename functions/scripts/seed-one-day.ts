/**
 * Seed Script - Clear DB and populate with 1 day of articles
 * Fetches from all news sources and stores raw articles for processing
 * 
 * Usage: OPENAI_API_KEY=sk-... npx ts-node scripts/seed-one-day.ts
 */

import Parser from 'rss-parser';
import { initializeFirebase, getDb } from './firebase-init';
import * as crypto from 'crypto';

initializeFirebase();
const db = getDb();

// News sources to fetch from
const NEWS_SOURCES = [
  { id: 'insurance_journal', name: 'Insurance Journal', url: 'https://www.insurancejournal.com/feed/rss/' },
  { id: 'naic', name: 'NAIC', url: 'https://www.naic.org/rss.xml' },
  { id: 'nws_alerts', name: 'NWS Alerts', url: 'https://alerts.weather.gov/cap/us.php?x=1' },
  { id: 'nhc', name: 'National Hurricane Center', url: 'https://www.nhc.noaa.gov/index.shtml' },
  { id: 'usgs_earthquakes', name: 'USGS Earthquakes', url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.atom' },
  { id: 'sec_edgar', name: 'SEC EDGAR', url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000320193&type=&dateb=&owner=exclude&count=100&search_text=' },
  { id: 'reuters_insurance', name: 'Reuters Insurance', url: 'https://www.reuters.com/finance/insurance' },
  { id: 'bloomberg_insurance', name: 'Bloomberg Insurance', url: 'https://www.bloomberg.com/industries/insurance' },
];

interface RawArticle {
  title: string;
  link: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
  author?: string;
  source: string;
}

/**
 * Clear all collections
 */
async function clearDatabase() {
  console.log('🗑️  Clearing database...\n');

  try {
    // Delete newsArticles
    const articlesSnapshot = await db.collection('newsArticles').get();
    let deletedCount = 0;
    for (const doc of articlesSnapshot.docs) {
      await doc.ref.delete();
      deletedCount++;
    }
    console.log(`✅ Deleted ${deletedCount} newsArticles`);

    // Delete newsRaw
    const rawSnapshot = await db.collection('newsRaw').get();
    let rawDeleted = 0;
    for (const doc of rawSnapshot.docs) {
      await doc.ref.delete();
      rawDeleted++;
    }
    console.log(`✅ Deleted ${rawDeleted} newsRaw`);

    // Delete newsClusters
    const clustersSnapshot = await db.collection('newsClusters').get();
    let clustersDeleted = 0;
    for (const doc of clustersSnapshot.docs) {
      await doc.ref.delete();
      clustersDeleted++;
    }
    console.log(`✅ Deleted ${clustersDeleted} newsClusters`);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
}

/**
 * Fetch articles from RSS feeds published in the past 1 day
 */
async function fetchArticles(): Promise<RawArticle[]> {
  console.log('\n📰 Fetching articles from RSS feeds...\n');

  const parser = new Parser({
    timeout: 10000,
    customFields: {
      item: [
        ['content:encoded', 'content'],
        ['dc:creator', 'creator'],
      ],
    },
  });

  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const allArticles: RawArticle[] = [];

  for (const source of NEWS_SOURCES) {
    try {
      console.log(`  📡 Fetching from ${source.name}...`);
      const parsedFeed = await parser.parseURL(source.url);

      const articles = (parsedFeed.items || [])
        .filter(item => {
          if (!item.pubDate) return true;
          const pubDate = new Date(item.pubDate);
          return pubDate >= oneDayAgo;
        })
        .map(item => ({
          title: item.title || '',
          link: item.link || '',
          pubDate: item.pubDate,
          content: (item as any).content || item.contentSnippet || '',
          contentSnippet: item.contentSnippet || '',
          author: (item as any).creator || '',
          source: parsedFeed.title || source.name,
        }));

      console.log(`     ✓ Found ${articles.length} articles`);
      allArticles.push(...articles);
    } catch (error) {
      console.log(`     ⚠️  Error fetching from ${source.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return allArticles;
}

/**
 * Store raw articles in Firestore
 */
async function storeArticles(articles: RawArticle[]) {
  console.log(`\n💾 Storing ${articles.length} articles in Firestore...\n`);

  let stored = 0;
  let skipped = 0;

  for (const article of articles) {
    try {
      if (!article.title || !article.link) {
        skipped++;
        continue;
      }

      // Normalize URL
      const url = new URL(article.link);
      const canonicalLink = url.toString();

      // Check for duplicates
      const existing = await db
        .collection('newsArticles')
        .where('canonicalLink', '==', canonicalLink)
        .limit(1)
        .get();

      if (!existing.empty) {
        skipped++;
        continue;
      }

      // Compute hash
      const hash = crypto
        .createHash('sha1')
        .update(`${article.title}|${canonicalLink}`)
        .digest('hex');

      // Store article
      await db.collection('newsArticles').add({
        title: article.title,
        link: article.link,
        canonicalLink,
        contentHash: hash,
        pubDate: article.pubDate ? new Date(article.pubDate).getTime() : Date.now(),
        content: article.content || '',
        contentSnippet: article.contentSnippet || '',
        author: article.author || '',
        source: article.source,
        sourceType: 'rss',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        processed: false,
        score: 0,
      });

      stored++;
    } catch (error) {
      console.error(`  ❌ Error storing article: ${article.title}`, error);
    }
  }

  console.log(`✅ Stored ${stored} articles (${skipped} duplicates skipped)\n`);
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🌱 Starting 1-day seed script...\n');

    // Step 1: Clear database
    await clearDatabase();

    // Step 2: Fetch articles from past 1 day
    const articles = await fetchArticles();

    if (articles.length === 0) {
      console.log('⚠️  No articles found to seed.');
      process.exit(0);
    }

    // Step 3: Store articles
    await storeArticles(articles);

    console.log('📊 Seed script completed successfully!');
    console.log(`✅ Seeded ${articles.length} articles from the past 1 day`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  }
}

main();

