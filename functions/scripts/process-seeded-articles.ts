/**
 * Process Seeded Articles Script
 * Takes raw articles from seed and processes them through the AI pipeline
 * 
 * Usage: OPENAI_API_KEY=sk-... npx ts-node scripts/process-seeded-articles.ts
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
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

/**
 * Process and enrich raw articles
 */
async function processSeededArticles(openai: OpenAI) {
  console.log('📚 Fetching raw articles from database...\n');

  // Get all raw articles (processed: false)
  const snapshot = await db.collection('articles')
    .where('processed', '==', false)
    .limit(50)
    .get();

  console.log(`Found ${snapshot.size} unprocessed articles\n`);

  if (snapshot.size === 0) {
    console.log('✅ No unprocessed articles found');
    return;
  }

  let processed = 0;
  let skipped = 0;

  for (let i = 0; i < snapshot.docs.length; i++) {
    const doc = snapshot.docs[i];
    const article = doc.data();

    try {
      console.log(`[${i + 1}/${snapshot.size}] Processing: ${article.title.substring(0, 60)}...`);

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

      // Check for duplicates
      const duplicateByContentHash = await db.collection('articles')
        .where('contentHash', '==', contentHash)
        .where('processed', '==', true)
        .limit(1)
        .get();

      if (!duplicateByContentHash.empty) {
        console.log(`  ⚠️  Duplicate detected (content hash), skipping`);
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

      // Update article with enriched data
      const id = hashUrl(article.url);
      await db.collection('articles').doc(doc.id).update({
        ...brief,
        smartScore,
        aiScore,
        regionsNormalized,
        companiesNormalized,
        canonicalUrl,
        contentHash,
        clusterId: contentHash,
        regulatory: false,
        stormName: null,
        processed: true,
        processedAt: new Date(),
      });

      // Store embedding
      await db.collection('article_embeddings').doc(id).set({
        embedding: emb,
        articleId: id,
        createdAt: new Date(),
      });

      console.log(`  ✅ Processed successfully`);
      processed++;
    } catch (error) {
      console.error(`  ❌ Error processing article:`, error instanceof Error ? error.message : error);
      skipped++;
    }
  }

  console.log(`\n📊 Processing complete:`);
  console.log(`  ✅ Processed: ${processed}`);
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

    console.log('🔄 Starting article processing script...\n');
    await processSeededArticles(openai);

    console.log('\n✅ Processing script completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Processing script failed:', error);
    process.exit(1);
  }
}

main();

