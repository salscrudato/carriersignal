/**
 * Database Population Script for CarrierSignal
 * 
 * This script:
 * 1. Clears existing articles from Firestore
 * 2. Fetches fresh US insurance news from the past week
 * 3. Processes and stores articles with AI summaries and rankings
 * 
 * Run with: npx ts-node scripts/populateDatabase.ts
 */

import * as admin from 'firebase-admin';
import Parser from 'rss-parser';

// Initialize Firebase Admin
const serviceAccount = require('../firebase-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// US-focused insurance news sources
const US_INSURANCE_SOURCES = [
  'https://www.insurancejournal.com/rss/news/national/',
  'https://www.claimsjournal.com/rss/news/national/',
  'https://riskandinsurance.com/feed/',
  'https://www.propertycasualty360.com/feed/',
  'https://www.insurancebusinessmag.com/us/rss/',
  'https://www.carriermanagement.com/feed/',
  'https://insurancenewsnet.com/feed',
];

interface Article {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  description?: string;
  content?: string;
  image?: string;
  aiScore?: number;
  impactScore?: number;
  regulatory?: boolean;
  stormName?: string;
  createdAt: number;
  updatedAt: number;
}

async function clearDatabase() {
  console.log('🗑️  Clearing existing articles...');
  const snapshot = await db.collection('articles').get();
  const batch = db.batch();
  
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  console.log(`✓ Cleared ${snapshot.size} articles`);
}

async function fetchArticlesFromRSS(): Promise<Article[]> {
  console.log('📰 Fetching articles from RSS feeds...');
  const parser = new Parser();
  const articles: Article[] = [];
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  for (const feedUrl of US_INSURANCE_SOURCES) {
    try {
      const feed = await parser.parseURL(feedUrl);
      
      feed.items.forEach(item => {
        const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
        
        // Only include articles from the past week
        if (pubDate >= oneWeekAgo) {
          articles.push({
            title: item.title || 'Untitled',
            url: item.link || '',
            source: feed.title || 'Unknown Source',
            publishedAt: pubDate.toISOString(),
            description: item.content || item.summary || '',
            content: item.content || item.summary || '',
            aiScore: Math.random() * 100, // Placeholder - will be updated by backend
            impactScore: Math.random() * 100,
            regulatory: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
      });
    } catch (error) {
      console.warn(`⚠️  Failed to fetch from ${feedUrl}:`, error);
    }
  }

  console.log(`✓ Fetched ${articles.length} articles from RSS feeds`);
  return articles;
}

async function storeArticles(articles: Article[]) {
  console.log(`💾 Storing ${articles.length} articles to Firestore...`);
  const batch = db.batch();
  let count = 0;

  articles.forEach(article => {
    const docRef = db.collection('articles').doc();
    batch.set(docRef, article);
    count++;

    // Firestore batch limit is 500
    if (count % 500 === 0) {
      batch.commit();
      console.log(`✓ Stored ${count} articles`);
    }
  });

  if (count % 500 !== 0) {
    await batch.commit();
    console.log(`✓ Stored ${count} articles`);
  }
}

async function main() {
  try {
    console.log('🚀 Starting database population...\n');
    
    // Clear existing data
    await clearDatabase();
    
    // Fetch fresh articles
    const articles = await fetchArticlesFromRSS();
    
    if (articles.length === 0) {
      console.log('⚠️  No articles found. Exiting.');
      process.exit(0);
    }
    
    // Store articles
    await storeArticles(articles);
    
    console.log('\n✅ Database population complete!');
    console.log(`📊 Total articles stored: ${articles.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during population:', error);
    process.exit(1);
  }
}

main();

