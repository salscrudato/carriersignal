/**
 * Process Articles Script
 * Processes raw articles with AI to generate summaries, tags, and embeddings
 * This mimics what the refreshFeeds cloud function does
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';
import { summarizeAndTag, extractArticle, embedForRAG, calculateSmartScore, normalizeRegions, normalizeCompanies, getCanonicalUrl, computeContentHash, detectStormName, isRegulatorySource, checkRAGQuality, validateAndCleanArticle } from '../src/agents';

function initializeFirebase() {
  const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Using service account key');
  } else {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'carriersignal-app',
    });
    console.log('✅ Using default credentials');
  }
}

initializeFirebase();
const db = admin.firestore();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function processArticles() {
  try {
    console.log('🤖 Processing unprocessed articles with AI...\n');

    // Get unprocessed articles
    const snapshot = await db.collection('articles').where('processed', '==', false).limit(30).get();
    console.log(`📊 Found ${snapshot.size} unprocessed articles\n`);

    if (snapshot.size === 0) {
      console.log('✅ All articles are already processed!');
      process.exit(0);
    }

    let processed = 0;
    let failed = 0;

    for (const doc of snapshot.docs) {
      const article = doc.data();
      try {
        console.log(`[${processed + failed + 1}/${snapshot.size}] Processing: ${article.title.substring(0, 60)}...`);

        // Extract full article content
        let content;
        try {
          content = await extractArticle(article.url);
        } catch (error) {
          console.log(`  ⚠️  Could not extract content, using RSS data`);
          content = {
            url: article.url,
            title: article.title,
            text: article.text || article.description || '',
            html: article.html || '',
          };
        }

        // Skip if content is too short
        if (!content.text || content.text.length < 100) {
          console.log(`  ⚠️  Content too short (${content.text?.length || 0} chars), skipping`);
          failed++;
          continue;
        }

        // Summarize & tag with AI
        let brief = await summarizeAndTag(openai, {
          url: article.url,
          source: article.source,
          publishedAt: article.publishedAt,
          title: content.title,
          text: content.text,
        });

        // Validate and clean
        brief = validateAndCleanArticle(brief);

        // Calculate scores
        const smartScore = calculateSmartScore({
          publishedAt: article.publishedAt,
          impactScore: brief.impactScore || 50,
          impactBreakdown: brief.impactBreakdown,
          tags: brief.tags,
          regulatory: false,
          riskPulse: brief.riskPulse,
        });

        // Normalize regions and companies
        const regionsNormalized = normalizeRegions(brief.tags?.regions || []);
        const companiesNormalized = normalizeCompanies(brief.tags?.companies || []);

        // Get canonical URL
        const canonicalUrl = getCanonicalUrl(article.url);

        // Compute content hash
        const contentHash = computeContentHash(content.text);

        // Detect storm name
        const stormName = detectStormName(content.text);

        // Check if regulatory
        const regulatory = isRegulatorySource(article.url, article.source);

        // Check RAG quality
        const ragQuality = checkRAGQuality(brief);

        // Generate embedding
        let embedding: number[] = [];
        try {
          embedding = await embedForRAG(openai, content.text);
        } catch (error) {
          console.log(`  ⚠️  Could not generate embedding`);
        }

        // Update article in Firestore
        await db.collection('articles').doc(doc.id).update({
          ...brief,
          smartScore,
          aiScore: brief.impactScore || 50,
          ragQualityScore: ragQuality.score,
          ragQualityIssues: ragQuality.issues,
          regionsNormalized,
          companiesNormalized,
          canonicalUrl,
          contentHash,
          stormName: stormName || null,
          regulatory,
          processed: true,
          processedAt: new Date().toISOString(),
        });

        // Store embedding separately
        if (embedding.length > 0) {
          await db.collection('article_embeddings').doc(doc.id).set({
            embedding,
            articleId: doc.id,
            createdAt: new Date(),
          });
        }

        console.log(`  ✅ Processed successfully`);
        processed++;
      } catch (error) {
        console.error(`  ❌ Error processing article:`, error instanceof Error ? error.message : error);
        failed++;
      }
    }

    console.log(`\n📊 Processing complete!`);
    console.log(`   ✅ Processed: ${processed}`);
    console.log(`   ❌ Failed: ${failed}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

processArticles();

