/**
 * Seed Script for CarrierSignal
 * Fetches insurance news from the past 2 days and populates the database
 * 
 * Usage: npx ts-node scripts/seed-articles.ts
 */

import * as admin from 'firebase-admin';
import Parser from 'rss-parser';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// Initialize Firebase Admin
function initializeFirebase() {
  const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

  if (fs.existsSync(serviceAccountPath)) {
    // Use service account key if available
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Using service account key for Firebase authentication');
  } else {
    // Use default credentials (works with Firebase CLI authentication)
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'carriersignal-app',
    });
    console.log('✅ Using default credentials for Firebase authentication');
  }
}

initializeFirebase();

const db = admin.firestore();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Feed sources to seed from (imported from rss-feeds.ts)
const FEED_SOURCES = [
  {
    name: 'Insurance Journal - National',
    url: 'https://www.insurancejournal.com/rss/news/national/',
  },
  {
    name: 'Claims Journal',
    url: 'https://www.claimsjournal.com/rss/',
  },
  {
    name: 'PropertyShark',
    url: 'https://www.propertyshark.com/rss/',
  },
  {
    name: 'Risk & Insurance',
    url: 'https://www.riskandinsurance.com/feed/',
  },
  {
    name: 'Insurance News Net',
    url: 'https://www.insurancenewsnet.com/rss/',
  },
];

interface RawArticle {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  description?: string;
  html?: string;
  text?: string;
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
  
  const parser = new Parser({
    customFields: {
      item: [
        ['content:encoded', 'content'],
        ['dc:creator', 'creator'],
      ],
    },
  });

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
            const itemData = item as unknown;
            const article: RawArticle = {
              title: item.title || '',
              url: item.link || '',
              source: feed.name,
              publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
              description: item.contentSnippet || '',
              html: ((itemData as Record<string, unknown>).content as string) || item.content || ((itemData as Record<string, unknown>).description as string) || '',
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
 * Process articles with AI to generate summaries and tags
 */
async function processArticleWithAI(article: RawArticle): Promise<Record<string, unknown> | null> {
  try {
    const prompt = `Analyze this insurance news article and provide structured insights:

Title: ${article.title}
Source: ${article.source}
Published: ${article.publishedAt}
Content: ${article.text?.substring(0, 2000) || article.description}

Provide a JSON response with:
- bullets5: Array of 3-5 key bullet points
- whyItMatters: Object with underwriting, claims, brokerage, actuarial impacts (20-200 chars each)
- tags: Object with lob, perils, regions, companies, trends, regulations arrays
- riskPulse: LOW, MEDIUM, or HIGH
- sentiment: POSITIVE, NEGATIVE, or NEUTRAL
- confidence: 0-1 score
- impactScore: 0-100 overall impact
- impactBreakdown: Object with market, regulatory, catastrophe, technology scores (0-100 each)
- confidenceRationale: Why this confidence level (max 200 chars)
- leadQuote: Key factual excerpt (max 300 chars)
- disclosure: Any promotional/opinionated content (max 200 chars)`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    return {
      ...article,
      ...parsed,
      impactScore: parsed.impactScore || 50,
      confidence: parsed.confidence || 0.7,
    };
  } catch (error) {
    console.error(`  ❌ Error processing article: ${article.title}`, error);
    return null;
  }
}

/**
 * Calculate composite smart score using improved ranking algorithm
 */
function calculateSmartScore(article: Record<string, unknown>): number {
  // Weights: AI Relevance 40%, Newsworthiness 30%, Recency 15%, RAG Quality 10%, User Feedback 5%
  const aiRelevanceWeight = 0.40;
  const newsworthinessWeight = 0.30;
  const recencyWeight = 0.15;
  const ragQualityWeight = 0.10;
  const userFeedbackWeight = 0.05;

  // AI Relevance Score (0-100)
  const aiScore = Math.min(100, ((article.impactScore as number) || 50) * ((article.confidence as number) || 0.7) * 100);

  // Newsworthiness Score (0-100) - based on impact breakdown
  let newsworthinessScore = 50;
  if (article.impactBreakdown) {
    const breakdown = article.impactBreakdown as Record<string, number>;
    const { regulatory = 0, catastrophe = 0, market = 0, technology = 0 } = breakdown;
    newsworthinessScore = (regulatory + catastrophe + market + technology) / 4;
  }

  // Recency Score (0-100) - articles from today get 100, older articles decay
  const publishedDate = new Date(article.publishedAt as string);
  const now = new Date();
  const hoursOld = (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60);
  const recencyScore = Math.max(0, 100 - (hoursOld * 2)); // Decay 2 points per hour

  // RAG Quality Score (0-100) - default to 85 for seeded articles
  const ragQualityScore = 85;

  // User Feedback Score (0-100) - default to 50 for new articles
  const userFeedbackScore = 50;

  // Calculate composite score
  const smartScore =
    (aiScore * aiRelevanceWeight) +
    (newsworthinessScore * newsworthinessWeight) +
    (recencyScore * recencyWeight) +
    (ragQualityScore * ragQualityWeight) +
    (userFeedbackScore * userFeedbackWeight);

  return Math.round(smartScore);
}

/**
 * Store processed articles in Firestore with improved ranking
 */
async function storeArticles(articles: Record<string, unknown>[]) {
  console.log('💾 Storing articles in Firestore with improved ranking...');

  let stored = 0;
  for (const article of articles) {
    if (!article) continue;

    try {
      // Calculate improved smart score
      const smartScore = calculateSmartScore(article);

      // Generate unique ID using hash of URL + title to avoid collisions
      const hash = crypto.createHash('md5').update((article.url as string) + (article.title as string)).digest('hex').substring(0, 20);
      const docId = `${hash}_${Date.now()}`;

      await db.collection('articles').doc(docId).set({
        title: article.title,
        url: article.url,
        source: article.source,
        publishedAt: article.publishedAt,
        description: article.description,
        bullets5: article.bullets5 || [],
        whyItMatters: article.whyItMatters || {},
        tags: article.tags || {},
        riskPulse: article.riskPulse || 'MEDIUM',
        sentiment: article.sentiment || 'NEUTRAL',
        confidence: article.confidence || 0.5,
        impactScore: article.impactScore || 50,
        impactBreakdown: article.impactBreakdown || {},
        confidenceRationale: article.confidenceRationale || '',
        leadQuote: article.leadQuote || '',
        disclosure: article.disclosure || '',
        aiScore: article.impactScore || 50,
        smartScore: smartScore, // Improved composite score
        ragQualityScore: 85, // High quality for seeded articles
        createdAt: new Date(),
        processed: false, // Mark for clustering
      });
      stored++;
    } catch (error) {
      console.error(`  ❌ Error storing article: ${article.title}`, error);
    }
  }

  console.log(`✅ Stored ${stored} articles with improved ranking`);
}

/**
 * Main seed function
 */
async function main() {
  try {
    console.log('🌱 Starting CarrierSignal seed script...\n');

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

    // Step 3: Process articles with AI
    console.log('🤖 Processing articles with AI...');
    const processedArticles = [];
    for (let i = 0; i < rawArticles.length; i++) {
      const article = rawArticles[i];
      console.log(`  Processing ${i + 1}/${rawArticles.length}: ${article.title.substring(0, 50)}...`);
      const processed = await processArticleWithAI(article);
      if (processed) {
        processedArticles.push(processed);
      }
    }
    console.log();

    // Step 4: Store articles with improved ranking
    await storeArticles(processedArticles);
    console.log();

    // Step 5: Trigger clustering (optional - can be done via cloud function)
    console.log('📊 Seed script completed successfully!');
    console.log(`✅ Seeded ${processedArticles.length} articles with improved ranking and metadata`);
    console.log('💡 Tip: Run clustering via cloud function to group similar articles into events');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  }
}

main();

