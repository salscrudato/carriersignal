/**
 * Seed Script - Populate DB with last 2 days of articles from primary sources
 * Fetches from Insurance Journal and Claims Journal RSS feeds
 * Clears database first, then loads fresh articles
 * 
 * Usage: npx ts-node scripts/seed-2days.ts
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import Parser from 'rss-parser';

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

initializeFirebase();
const db = admin.firestore();
const parser = new Parser({
  customFields: {
    item: [
      ['content:encoded', 'content'],
      ['dc:creator', 'creator'],
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
    ],
  },
});

// Primary feed sources for P&C insurance news
const FEED_SOURCES = [
  {
    name: 'Insurance Journal - National',
    url: 'https://www.insurancejournal.com/rss/news/national/',
  },
  {
    name: 'Claims Journal',
    url: 'https://www.claimsjournal.com/rss/',
  },
];

interface RawArticle {
  url: string;
  source: string;
  title: string;
  publishedAt?: string;
  description?: string;
  html?: string;
  text?: string;
  author?: string;
  mainImage?: string;
}

/**
 * Clear all articles, events, and embeddings from the database
 */
async function clearDatabase() {
  console.log('🗑️  Clearing database...');

  try {
    // Delete articles
    const articlesSnapshot = await db.collection('articles').get();
    let deletedCount = 0;
    for (const doc of articlesSnapshot.docs) {
      await doc.ref.delete();
      deletedCount++;
    }
    console.log(`✅ Deleted ${deletedCount} articles`);

    // Delete events
    const eventsSnapshot = await db.collection('events').get();
    let eventsDeleted = 0;
    for (const doc of eventsSnapshot.docs) {
      await doc.ref.delete();
      eventsDeleted++;
    }
    console.log(`✅ Deleted ${eventsDeleted} events`);

    // Delete embeddings
    const embeddingsSnapshot = await db.collection('article_embeddings').get();
    let embeddingsDeleted = 0;
    for (const doc of embeddingsSnapshot.docs) {
      await doc.ref.delete();
      embeddingsDeleted++;
    }
    console.log(`✅ Deleted ${embeddingsDeleted} embeddings`);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
}

/**
 * Fetch articles from RSS feeds published in the past 2 days
 */
async function fetchArticles(): Promise<RawArticle[]> {
  console.log('📰 Fetching articles from RSS feeds...');

  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const allArticles: RawArticle[] = [];

  for (const feed of FEED_SOURCES) {
    try {
      console.log(`  Fetching from ${feed.name}...`);
      const parsedFeed = await parser.parseURL(feed.url);

      if (parsedFeed.items) {
        for (const item of parsedFeed.items) {
          const pubDate = new Date(item.pubDate || item.isoDate || new Date());

          // Only include articles from the past 2 days
          if (pubDate >= twoDaysAgo) {
            const itemData = item as any;

            // Extract image from various possible fields
            let mainImage = '';
            if (itemData.mediaThumbnail) {
              const thumb = itemData.mediaThumbnail as Record<string, unknown>;
              mainImage = ((thumb.$ as Record<string, unknown>)?.url as string) || '';
            }
            if (!mainImage && itemData.mediaContent) {
              const media = itemData.mediaContent as Record<string, unknown>;
              mainImage = ((media.$ as Record<string, unknown>)?.url as string) || '';
            }
            if (!mainImage && item.enclosure?.url) {
              mainImage = item.enclosure.url;
            }

            const article: RawArticle = {
              title: item.title || '',
              url: item.link || '',
              source: feed.name,
              publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
              description: item.contentSnippet || '',
              html: itemData.content || item.content || itemData.description || '',
              text: item.contentSnippet || '',
              author: itemData.creator || itemData.author || '',
              mainImage: mainImage || undefined,
            };

            if (article.title && article.url) {
              allArticles.push(article);
            }
          }
        }
      }
      console.log(`  ✅ Found ${allArticles.length} articles so far`);
    } catch (error) {
      console.error(`  ❌ Error fetching from ${feed.name}:`, error);
    }
  }

  console.log(`✅ Total articles fetched: ${allArticles.length}`);
  return allArticles;
}

/**
 * Store raw articles in Firestore
 */
async function storeArticles(articles: RawArticle[]) {
  console.log('💾 Storing articles in Firestore...');

  let stored = 0;
  for (const article of articles) {
    try {
      // Generate unique ID using URL hash
      const hash = Buffer.from(article.url).toString('base64').substring(0, 20);
      const docId = `${hash}_${Date.now()}`;

      // Build document data, only including defined fields
      const docData: any = {
        url: article.url,
        source: article.source,
        title: article.title,
        createdAt: new Date().toISOString(),
        processed: false,
        eventId: null,
      };

      // Add optional fields only if they have values
      if (article.publishedAt) docData.publishedAt = article.publishedAt;
      if (article.description) docData.description = article.description;
      if (article.html) docData.html = article.html;
      if (article.text) docData.text = article.text;
      if (article.author) docData.author = article.author;
      if (article.mainImage) docData.mainImage = article.mainImage;

      await db.collection('articles').doc(docId).set(docData);
      stored++;
    } catch (error) {
      console.error(`  ❌ Error storing article: ${article.title}`, error);
    }
  }

  console.log(`✅ Stored ${stored} articles`);
}

/**
 * Main seed function
 */
async function main() {
  try {
    console.log('🌱 Starting CarrierSignal 2-day seed script...\n');

    // Step 1: Clear database
    await clearDatabase();
    console.log();

    // Step 2: Fetch articles from past 2 days
    const rawArticles = await fetchArticles();
    console.log();

    if (rawArticles.length === 0) {
      console.log('⚠️  No articles found to seed.');
      process.exit(0);
    }

    // Step 3: Store articles
    await storeArticles(rawArticles);
    console.log();

    console.log('📊 Seed script completed successfully!');
    console.log(`✅ Seeded ${rawArticles.length} articles from the past 2 days`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  }
}

main();

