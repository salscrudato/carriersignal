/**
 * Fetch and process articles from new RSS sources
 * Adds 5 articles from each new source to Firestore
 */

import * as fs from 'fs';
import * as path from 'path';

// Load .env file manually
const envPath = path.join(__dirname, '../../.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && !key.startsWith('#')) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import OpenAI from 'openai';
import Parser from 'rss-parser';
import {
  extractArticle,
  summarizeAndTag,
  embedForRAG,
  hashUrl,
  calculateSmartScore,
  computeContentHash,
  getCanonicalUrl,
  normalizeRegions,
  normalizeCompanies,
  detectStormName,
  isRegulatorySource,
} from '../src/agents';

initializeApp();
const db = getFirestore();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const NEW_SOURCES = [
  {
    name: 'Claims Journal',
    url: 'https://www.claimsjournal.com/rss/news/national/',
    category: 'claims',
  },
  {
    name: 'Insurance NewsNet',
    url: 'https://insurancenewsnet.com/topics/property-casualty-insurance-news/feed',
    category: 'news',
  },
  {
    name: 'Risk & Insurance',
    url: 'https://riskandinsurance.com/feed/',
    category: 'news',
  },
];

async function fetchAndProcessArticles() {
  const parser = new Parser();
  let totalProcessed = 0;
  let totalErrors = 0;

  console.log('🚀 Starting article fetch from new sources...\n');

  for (const source of NEW_SOURCES) {
    console.log(`\n📡 Processing ${source.name}...`);
    console.log(`   URL: ${source.url}`);

    try {
      const feed = await parser.parseURL(source.url);
      console.log(`   ✅ Feed fetched: ${feed.items.length} items available`);

      // Process first 5 articles
      const articles = feed.items.slice(0, 5);
      console.log(`   📝 Processing ${articles.length} articles...\n`);

      for (let i = 0; i < articles.length; i++) {
        const item = articles[i];
        const itemNum = i + 1;

        try {
          console.log(`   [${itemNum}/5] Processing: ${item.title?.substring(0, 60)}...`);

          if (!item.link) {
            console.log(`   [${itemNum}/5] ⚠️  Skipped: No link found`);
            continue;
          }

          const url = item.link;
          const id = hashUrl(url);

          // Check if already exists
          const existing = await db.collection('articles').doc(id).get();
          if (existing.exists) {
            console.log(`   [${itemNum}/5] ⏭️  Already exists in database`);
            continue;
          }

          // Extract article content
          console.log(`   [${itemNum}/5] 🔍 Extracting content...`);
          let content;
          try {
            content = await extractArticle(url);
          } catch (extractError) {
            // If extraction fails (403, etc), use RSS content as fallback
            console.log(`   [${itemNum}/5] ⚠️  Extraction blocked, using RSS content...`);
            content = {
              title: item.title || 'Untitled',
              text: item.content || item.description || 'No content available',
              html: item.content || '',
            };
          }

          if (!content || !content.text) {
            console.log(`   [${itemNum}/5] ⚠️  Failed to extract content`);
            continue;
          }

          // Summarize and tag
          console.log(`   [${itemNum}/5] 🤖 Generating AI summary...`);
          const brief = await summarizeAndTag(openai, {
            url,
            source: source.name,
            publishedAt: item.pubDate,
            title: item.title,
            text: content.text,
            html: content.html,
          });

          if (!brief) {
            console.log(`   [${itemNum}/5] ⚠️  Failed to generate summary`);
            continue;
          }

          // Compute hashes
          const contentHash = computeContentHash(content.text);
          const canonicalUrl = getCanonicalUrl(url, content.html);

          // Check for duplicates
          const dupHash = await db
            .collection('articles')
            .where('contentHash', '==', contentHash)
            .limit(1)
            .get();

          if (!dupHash.empty) {
            console.log(`   [${itemNum}/5] 🔄 Duplicate content detected`);
            continue;
          }

          // Detect storm name
          const stormName = detectStormName(`${brief.title} ${content.text.slice(0, 1000)}`);

          // Regulatory detection
          const regulatory = isRegulatorySource(url, source.name) ||
            (brief.tags?.regulations && brief.tags.regulations.length > 0);

          // Calculate score
          const impactScore = brief.impactScore || 50;
          const smartScore = calculateSmartScore({
            publishedAt: item.pubDate || new Date().toISOString(),
            impactScore,
            impactBreakdown: brief.impactBreakdown,
            tags: brief.tags,
            regulatory,
            riskPulse: brief.riskPulse,
            stormName,
          });

          // Generate embedding
          console.log(`   [${itemNum}/5] 📊 Generating embedding...`);
          const embedding = await embedForRAG(
            openai,
            `${brief.title}\n${brief.bullets5.join("\n")}\n${Object.values(brief.whyItMatters).join("\n")}`
          );

          // Normalize entities
          const regionsNormalized = brief.tags?.regions ? normalizeRegions(brief.tags.regions) : [];
          const companiesNormalized = brief.tags?.companies ? normalizeCompanies(brief.tags.companies) : [];

          // Prepare document - ensure no undefined values
          const docData = {
            id,
            url,
            title: brief.title,
            bullets5: brief.bullets5,
            whyItMatters: brief.whyItMatters,
            content: content.text,
            source: source.name,
            category: source.category,
            publishedAt: new Date(item.pubDate || Date.now()),
            tags: {
              ...brief.tags,
              regions: regionsNormalized,
              companies: companiesNormalized,
            },
            impactScore,
            impactBreakdown: brief.impactBreakdown,
            smartScore,
            riskPulse: brief.riskPulse,
            sentiment: brief.sentiment,
            confidence: brief.confidence,
            contentHash,
            canonicalUrl,
            linkOk: true,
            regulatory,
            stormName: stormName || null,
            leadQuote: brief.leadQuote || '',
            disclosure: brief.disclosure || '',
            citations: brief.citations || [],
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Save to Firestore
          console.log(`   [${itemNum}/5] 💾 Saving to Firestore...`);
          await db.collection('articles').doc(id).set(docData);

          // Save embedding
          await db.collection('article_embeddings').doc(id).set({
            articleId: id,
            embedding,
            createdAt: new Date(),
          });

          console.log(`   [${itemNum}/5] ✅ Successfully added!\n`);
          totalProcessed++;
        } catch (error) {
          console.error(`   [${itemNum}/5] ❌ Error:`, error instanceof Error ? error.message : String(error));
          totalErrors++;
        }
      }
    } catch (error) {
      console.error(`❌ Error fetching ${source.name}:`, error instanceof Error ? error.message : String(error));
      totalErrors += 5;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 SUMMARY`);
  console.log(`${'='.repeat(60)}`);
  console.log(`✅ Successfully processed: ${totalProcessed} articles`);
  console.log(`❌ Errors: ${totalErrors}`);
  console.log(`📈 Total added to Firestore: ${totalProcessed}`);
  console.log(`${'='.repeat(60)}\n`);

  process.exit(totalErrors > 0 ? 1 : 0);
}

fetchAndProcessArticles().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

