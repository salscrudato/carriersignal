/**
 * One-time script to populate CarrierSignal with past week's data
 * Uses only Insurance Journal RSS feed
 *
 * Prerequisites:
 * 1. Build the functions: cd functions && npm run build && cd ..
 * 2. Set OPENAI_API_KEY in .env file
 * 3. Run with: npm run populate
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import OpenAI from 'openai';
import Parser from 'rss-parser';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import processing functions from the compiled cloud functions
const agentsPath = join(__dirname, '../functions/lib/agents.js');
let agents: any;

try {
  agents = await import(agentsPath);
} catch (error) {
  console.error('❌ Failed to import agents module. Make sure to build functions first:');
  console.error('   cd functions && npm run build && cd ..');
  process.exit(1);
}

const {
  extractArticle,
  summarizeAndTag,
  embedForRAG,
  hashUrl,
  calculateSmartScore,
  normalizeRegions,
  normalizeCompanies,
  getCanonicalUrl,
  computeContentHash,
  detectStormName,
  isRegulatorySource,
  scoreArticleWithAI,
} = agents;

// Initialize Firebase Client SDK (not Admin SDK)
const app = initializeApp({
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
});

const db = getFirestore(app);
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  console.error('❌ OPENAI_API_KEY environment variable is required');
  console.error('   Add it to your .env file');
  process.exit(1);
}

const client = new OpenAI({ apiKey: openaiApiKey });

/**
 * Insurance Journal RSS feed URL
 */
const INSURANCE_JOURNAL_FEED = 'https://www.insurancejournal.com/rss/news/national/';

/**
 * Fetch and process articles from the past week
 */
async function populateWeekData() {
  console.log('🚀 Starting one-time population of past week\'s data...');
  console.log(`📰 Source: ${INSURANCE_JOURNAL_FEED}`);
  console.log('');

  const parser = new Parser();
  const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  
  const stats = {
    total: 0,
    processed: 0,
    skipped: 0,
    errors: 0,
    alreadyExists: 0,
  };

  try {
    // Fetch RSS feed
    console.log('📡 Fetching RSS feed...');
    const feed = await parser.parseURL(INSURANCE_JOURNAL_FEED);
    console.log(`✓ Found ${feed.items.length} items in feed`);
    console.log('');

    // Filter articles from the past week
    const recentArticles = feed.items.filter(item => {
      if (!item.pubDate) return false;
      const pubDate = new Date(item.pubDate).getTime();
      return pubDate >= oneWeekAgo;
    });

    console.log(`📅 ${recentArticles.length} articles from the past week`);
    console.log('');

    stats.total = recentArticles.length;

    // Process each article
    for (let i = 0; i < recentArticles.length; i++) {
      const item = recentArticles[i];
      const itemIndex = i + 1;

      try {
        if (!item.link) {
          console.log(`⏭️  [${itemIndex}/${recentArticles.length}] Skipping item without link`);
          stats.skipped++;
          continue;
        }

        const url = item.link;
        const id = hashUrl(url);
        const docRef = doc(db, 'articles', id);

        // Check if article already exists
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          console.log(`⏭️  [${itemIndex}/${recentArticles.length}] Already exists: ${item.title}`);
          stats.alreadyExists++;
          continue;
        }

        console.log(`\n🔄 [${itemIndex}/${recentArticles.length}] Processing: ${item.title}`);
        console.log(`   URL: ${url}`);

        // Extract full content
        console.log('   📄 Extracting article content...');
        const content = await extractArticle(url);
        
        if (!content || !content.text || content.text.length < 100) {
          console.log(`   ⚠️  Article text too short (${content?.text?.length || 0} chars), skipping`);
          stats.skipped++;
          continue;
        }

        console.log(`   ✓ Extracted ${content.text.length} characters`);

        // Summarize & classify with AI
        console.log('   🤖 Generating AI summary and tags...');
        const brief = await summarizeAndTag(client, {
          url,
          source: (item.creator || feed.title || content.url || '').toString(),
          publishedAt: item.isoDate || item.pubDate || '',
          title: content.title,
          text: content.text,
          mainImage: content.mainImage,
          author: content.author,
        });

        console.log(`   ✓ Generated summary: "${brief.title}"`);

        // Entity normalization
        const regionsNormalized = brief.tags?.regions
          ? normalizeRegions(brief.tags.regions)
          : [];
        const companiesNormalized = brief.tags?.companies
          ? normalizeCompanies(brief.tags.companies)
          : [];

        // Deduplication
        const canonicalUrl = getCanonicalUrl(url, content.html);
        const contentHash = computeContentHash(content.text);

        const duplicateQuery = query(
          collection(db, 'articles'),
          where('contentHash', '==', contentHash)
        );
        const duplicateCheck = await getDocs(duplicateQuery);

        let clusterId = contentHash;
        if (!duplicateCheck.empty) {
          const existingDoc = duplicateCheck.docs[0];
          clusterId = existingDoc.data().clusterId || contentHash;
          console.log(`   ℹ️  Duplicate content detected (cluster: ${clusterId.slice(0, 8)}...)`);
        }

        // Regulatory detection
        const regulatory = isRegulatorySource(url, brief.source) ||
                          (brief.tags?.regulations && brief.tags.regulations.length > 0);

        // Catastrophe detection
        const stormName = detectStormName(`${brief.title} ${content.text.slice(0, 1000)}`);

        // Build embedding for RAG
        console.log('   🧠 Generating embedding...');
        const emb = await embedForRAG(
          client,
          `${brief.title}\n${brief.bullets5.join('\n')}\n${Object.values(brief.whyItMatters).join('\n')}`
        );

        // Calculate SmartScore v3 (enhanced)
        const smartScore = calculateSmartScore({
          publishedAt: item.isoDate || item.pubDate || '',
          impactScore: brief.impactScore,
          impactBreakdown: brief.impactBreakdown,
          tags: brief.tags,
          regulatory,
          riskPulse: brief.riskPulse,
          stormName,
        });

        // AI-driven scoring (v3 enhanced)
        console.log('   📊 Calculating AI score...');
        const aiScore = await scoreArticleWithAI(client, {
          title: brief.title,
          bullets5: brief.bullets5,
          whyItMatters: brief.whyItMatters,
          tags: brief.tags,
          impactScore: brief.impactScore,
          publishedAt: item.isoDate || item.pubDate,
          regulatory,
          stormName,
          riskPulse: brief.riskPulse,
          sentiment: brief.sentiment,
        });

        // Save to Firestore
        console.log('   💾 Saving to Firestore...');
        await setDoc(docRef, {
          ...brief,
          image: content.mainImage,
          author: content.author,
          publishedAt: item.isoDate || item.pubDate || '',
          createdAt: new Date(),
          embedding: emb,
          smartScore,
          aiScore,
          regionsNormalized,
          companiesNormalized,
          canonicalUrl,
          contentHash,
          clusterId,
          regulatory,
          stormName: stormName || null,
          batchProcessedAt: new Date(),
          populationScript: true, // Mark as populated by script
        });

        console.log(`   ✅ Successfully processed!`);
        console.log(`   📈 Scores - Smart: ${smartScore.toFixed(1)}, AI: ${aiScore}`);
        stats.processed++;

        // Rate limiting - be nice to the servers
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`   ❌ Error processing article [${itemIndex}/${recentArticles.length}]:`, error);
        stats.errors++;
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 POPULATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total articles found:     ${stats.total}`);
    console.log(`Successfully processed:   ${stats.processed}`);
    console.log(`Already existed:          ${stats.alreadyExists}`);
    console.log(`Skipped:                  ${stats.skipped}`);
    console.log(`Errors:                   ${stats.errors}`);
    console.log('='.repeat(60));
    console.log('');
    console.log('✅ Population complete!');

  } catch (error) {
    console.error('❌ Fatal error during population:', error);
    process.exit(1);
  }
}

// Run the script
populateWeekData()
  .then(() => {
    console.log('👋 Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });

