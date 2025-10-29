/**
 * Enhanced Seed Script - Populate DB with last 2 days of articles
 * Fetches from RSS feeds, processes through AI pipeline, and stores with full enrichment
 * 
 * Usage: OPENAI_API_KEY=sk-... npx ts-node scripts/seed-2days-enhanced.ts
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import Parser from 'rss-parser';
import OpenAI from 'openai';
import {
  extractArticle,
  summarizeAndTag,
  embedForRAG,
  hashUrl,
  calculateSmartScore,
  normalizeRegions,
  normalizeCompanies,
  getCanonicalUrl,
  computeContentHash,
  scoreArticleWithAI,
  validateAndCleanArticle,
} from '../src/agents';

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

// Feed sources
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

          if (pubDate >= twoDaysAgo) {
            const itemData = item as any;
            const article: RawArticle = {
              title: item.title || '',
              url: item.link || '',
              source: feed.name,
              publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
              description: item.contentSnippet || '',
              html: itemData.content || item.content || itemData.description || '',
              text: item.contentSnippet || '',
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
 * Process and store articles with full AI enrichment
 */
async function processAndStoreArticles(articles: RawArticle[], openai: OpenAI) {
  console.log(`\n💾 Processing and storing ${articles.length} articles...\n`);

  let stored = 0;
  let skipped = 0;

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    try {
      console.log(`[${i + 1}/${articles.length}] Processing: ${article.title.substring(0, 60)}...`);

      // Extract full content
      const content = await extractArticle(article.url);
      if (!content || !content.text || content.text.length < 100) {
        console.log(`  ⚠️  Article text too short, skipping`);
        skipped++;
        continue;
      }

      // Summarize & classify
      let brief = await summarizeAndTag(openai, {
        url: article.url,
        source: article.source,
        publishedAt: article.publishedAt || '',
        title: content.title,
        text: content.text,
      });

      brief = validateAndCleanArticle(brief);

      // Compute hashes and URLs
      const canonicalUrl = getCanonicalUrl(article.url, content.html);
      const contentHash = computeContentHash(content.text);

      // Multi-layer deduplication check
      const duplicateByContentHash = await db.collection('articles')
        .where('contentHash', '==', contentHash)
        .limit(1)
        .get();

      if (!duplicateByContentHash.empty) {
        console.log(`  ⚠️  Duplicate detected (content hash), skipping`);
        skipped++;
        continue;
      }

      const duplicateByCanonicalUrl = await db.collection('articles')
        .where('canonicalUrl', '==', canonicalUrl)
        .limit(1)
        .get();

      if (!duplicateByCanonicalUrl.empty) {
        console.log(`  ⚠️  Duplicate detected (canonical URL), skipping`);
        skipped++;
        continue;
      }

      // Normalize entities
      const regionsNormalized = brief.tags?.regions ? normalizeRegions(brief.tags.regions) : [];
      const companiesNormalized = brief.tags?.companies ? normalizeCompanies(brief.tags.companies) : [];

      // Generate embedding
      const emb = await embedForRAG(
        openai,
        `${brief.title}\n${brief.bullets5.join("\n")}\n${Object.values(brief.whyItMatters).join("\n")}`
      );

      // Calculate scores
      const smartScore = calculateSmartScore({
        publishedAt: article.publishedAt || '',
        impactScore: brief.impactScore,
        impactBreakdown: brief.impactBreakdown,
        tags: brief.tags,
        regulatory: false,
        riskPulse: brief.riskPulse,
      });

      const aiScore = await scoreArticleWithAI(openai, {
        title: brief.title,
        bullets5: brief.bullets5,
        whyItMatters: brief.whyItMatters,
        tags: brief.tags,
        impactScore: brief.impactScore,
        publishedAt: article.publishedAt,
        regulatory: false,
        riskPulse: brief.riskPulse,
        sentiment: brief.sentiment,
      });

      // Store article
      const id = hashUrl(article.url);
      const docRef = db.collection('articles').doc(id);

      await docRef.set({
        ...brief,
        publishedAt: article.publishedAt || '',
        createdAt: new Date(),
        smartScore,
        aiScore,
        regionsNormalized,
        companiesNormalized,
        canonicalUrl,
        contentHash,
        clusterId: contentHash,
        regulatory: false,
        stormName: null,
        batchProcessedAt: new Date(),
      });

      // Store embedding
      await db.collection('article_embeddings').doc(id).set({
        embedding: emb,
        articleId: id,
        createdAt: new Date(),
      });

      console.log(`  ✅ Stored successfully`);
      stored++;
    } catch (error) {
      console.error(`  ❌ Error processing article:`, error instanceof Error ? error.message : error);
      skipped++;
    }
  }

  console.log(`\n📊 Processing complete:`);
  console.log(`  ✅ Stored: ${stored}`);
  console.log(`  ⚠️  Skipped: ${skipped}`);
}

/**
 * Main function
 */
async function main() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('❌ OPENAI_API_KEY environment variable is required');
      process.exit(1);
    }

    const openai = new OpenAI({ apiKey });

    console.log('🌱 Starting enhanced 2-day seed script...\n');

    // Fetch articles
    const articles = await fetchArticles();
    console.log();

    if (articles.length === 0) {
      console.log('⚠️  No articles found to seed.');
      process.exit(0);
    }

    // Process and store
    await processAndStoreArticles(articles, openai);

    console.log('\n✅ Seed script completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  }
}

main();

