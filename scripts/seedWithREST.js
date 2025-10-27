/**
 * Seed Articles Script for CarrierSignal using Firebase REST API
 * 
 * Fetches US insurance news from RSS feeds and populates Firestore via REST
 * Run with: node scripts/seedWithREST.js
 */

const Parser = require('rss-parser');
const https = require('https');
require('dotenv').config({ path: '.env.local' });

const parser = new Parser();
const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID;

// Sample articles to seed
const SAMPLE_ARTICLES = [
  {
    title: 'Major Insurance Carrier Reports Record Q4 Earnings',
    url: 'https://example.com/article1',
    source: 'Insurance Journal',
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Leading P&C insurer announces strong financial results driven by improved underwriting discipline and premium growth.',
    content: 'Leading P&C insurer announces strong financial results driven by improved underwriting discipline and premium growth. The company reported a combined ratio of 94%, indicating profitable underwriting operations.',
    aiScore: 78,
    impactScore: 82,
    regulatory: false,
  },
  {
    title: 'New Regulatory Framework for Cyber Insurance Takes Effect',
    url: 'https://example.com/article2',
    source: 'Claims Journal',
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Regulators introduce comprehensive guidelines for cyber insurance coverage and claims handling.',
    content: 'Regulators introduce comprehensive guidelines for cyber insurance coverage and claims handling. The new framework aims to standardize coverage definitions and improve consumer protection.',
    aiScore: 85,
    impactScore: 88,
    regulatory: true,
  },
  {
    title: 'Hurricane Season Preparedness: Insurers Strengthen Reserves',
    url: 'https://example.com/article3',
    source: 'Risk and Insurance',
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Insurance industry increases catastrophe reserves ahead of active hurricane season.',
    content: 'Insurance industry increases catastrophe reserves ahead of active hurricane season. Carriers are implementing stricter underwriting guidelines in coastal regions.',
    aiScore: 82,
    impactScore: 85,
    regulatory: false,
    stormName: 'Hurricane Season 2025',
  },
  {
    title: 'AI and Machine Learning Transform Claims Processing',
    url: 'https://example.com/article4',
    source: 'Property Casualty 360',
    publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Insurers deploy advanced AI systems to accelerate claims settlement and reduce fraud.',
    content: 'Insurers deploy advanced AI systems to accelerate claims settlement and reduce fraud. Early adopters report 40% faster processing times and improved customer satisfaction.',
    aiScore: 79,
    impactScore: 75,
    regulatory: false,
  },
  {
    title: 'Workers Compensation Rates Stabilize Across Major Markets',
    url: 'https://example.com/article5',
    source: 'Insurance Business',
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Workers compensation insurance rates show signs of stabilization after years of volatility.',
    content: 'Workers compensation insurance rates show signs of stabilization after years of volatility. Improved loss experience and reduced medical cost inflation contribute to rate moderation.',
    aiScore: 72,
    impactScore: 70,
    regulatory: false,
  },
  {
    title: 'Commercial Auto Insurance Market Sees Competitive Pricing',
    url: 'https://example.com/article6',
    source: 'Carrier Management',
    publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Increased competition drives down commercial auto insurance premiums.',
    content: 'Increased competition drives down commercial auto insurance premiums. New market entrants and digital-first carriers are reshaping the competitive landscape.',
    aiScore: 75,
    impactScore: 72,
    regulatory: false,
  },
  {
    title: 'Homeowners Insurance Crisis Deepens in High-Risk States',
    url: 'https://example.com/article7',
    source: 'Insurance News Net',
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Homeowners insurance market faces continued challenges in catastrophe-prone regions.',
    content: 'Homeowners insurance market faces continued challenges in catastrophe-prone regions. Multiple carriers have exited or reduced exposure in high-risk areas.',
    aiScore: 88,
    impactScore: 90,
    regulatory: false,
  },
];

function postToFirestore(article) {
  return new Promise((resolve, reject) => {
    const data = {
      fields: {
        title: { stringValue: article.title },
        url: { stringValue: article.url },
        source: { stringValue: article.source },
        publishedAt: { stringValue: article.publishedAt },
        description: { stringValue: article.description || '' },
        content: { stringValue: article.content || '' },
        aiScore: { doubleValue: article.aiScore },
        impactScore: { doubleValue: article.impactScore },
        regulatory: { booleanValue: article.regulatory },
        createdAt: { integerValue: Date.now().toString() },
        updatedAt: { integerValue: Date.now().toString() },
      },
    };

    if (article.stormName) {
      data.fields.stormName = { stringValue: article.stormName };
    }

    const postData = JSON.stringify(data);
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/articles`;

    const options = {
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/articles`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        if (res.statusCode === 201) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Status ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function seedDatabase() {
  try {
    console.log('🚀 Starting database seeding...\n');
    console.log(`📊 Using Firebase Project: ${PROJECT_ID}\n`);
    
    console.log('💾 Storing articles to Firestore...');
    let count = 0;

    for (const article of SAMPLE_ARTICLES) {
      try {
        await postToFirestore(article);
        count++;
        console.log(`  ✓ Stored: ${article.title}`);
      } catch (error) {
        console.warn(`  ⚠️  Failed to store: ${article.title}`, error.message);
      }
    }

    console.log(`\n✅ Database seeding complete!`);
    console.log(`📊 Total articles stored: ${count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

seedDatabase();

