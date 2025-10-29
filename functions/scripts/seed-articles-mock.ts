/**
 * Mock Seed Script for CarrierSignal
 * Populates the database with sample insurance news articles
 * Useful for testing without OpenAI API key
 * 
 * Usage: npx ts-node scripts/seed-articles-mock.ts
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin
function initializeFirebase() {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'carriersignal-app',
  });
}

initializeFirebase();
const db = admin.firestore();

// Sample articles data
const SAMPLE_ARTICLES = [
  {
    title: 'NAIC Proposes New Cybersecurity Standards for Insurance Industry',
    url: 'https://example.com/naic-cybersecurity-standards',
    source: 'Insurance Journal - National',
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'The National Association of Insurance Commissioners has proposed comprehensive cybersecurity standards...',
    bullets5: [
      'NAIC introduces mandatory cybersecurity framework for all insurers',
      'New standards require annual security audits and incident reporting',
      'Implementation deadline set for Q2 2025',
      'Compliance violations may result in fines up to $500,000',
      'Framework aligns with NIST Cybersecurity Framework 2.0',
    ],
    whyItMatters: {
      underwriting: 'Cyber insurance underwriting will need to incorporate NAIC compliance verification into risk assessment processes',
      claims: 'Claims teams must be prepared for increased cyber incident reporting and documentation requirements',
      brokerage: 'Brokers need to educate clients on compliance requirements and help them meet new standards',
      actuarial: 'Actuaries must recalibrate cyber risk models based on new regulatory requirements and incident data',
    },
    tags: {
      lob: ['Cyber', 'E&O'],
      perils: ['Cyber Attack', 'Data Breach'],
      regions: ['US-National'],
      companies: ['NAIC'],
      trends: ['Regulatory', 'Cybersecurity'],
      regulations: ['NAIC Bulletin', 'Cybersecurity Standards'],
    },
    riskPulse: 'HIGH',
    sentiment: 'NEUTRAL',
    confidence: 0.92,
    impactScore: 85,
    impactBreakdown: {
      market: 75,
      regulatory: 95,
      catastrophe: 20,
      technology: 90,
    },
    confidenceRationale: 'Official NAIC announcement with clear implementation timeline and compliance requirements',
    leadQuote: 'The NAIC cybersecurity standards represent a significant step forward in protecting consumer data and industry stability.',
    disclosure: 'This is regulatory guidance from the NAIC',
  },
  {
    title: 'Hurricane Season Outlook: Above-Average Activity Expected',
    url: 'https://example.com/hurricane-season-outlook',
    source: 'Insurance Journal - National',
    publishedAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'NOAA forecasts above-average hurricane activity for the 2025 Atlantic season...',
    bullets5: [
      'NOAA predicts 17-25 named storms for 2025 Atlantic hurricane season',
      '8-13 hurricanes expected, with 4-7 major hurricanes (Category 3+)',
      'Above-average activity driven by warm ocean temperatures and weak El Niño',
      'Insurers should prepare for increased claims volume and potential catastrophic losses',
      'Reinsurance market likely to see significant rate increases',
    ],
    whyItMatters: {
      underwriting: 'Property underwriters must adjust rates and limits for coastal exposures based on elevated hurricane risk',
      claims: 'Claims departments should prepare for surge in hurricane-related claims and establish disaster response protocols',
      brokerage: 'Brokers need to communicate elevated risk to clients and review coverage adequacy',
      actuarial: 'Actuaries must update catastrophe models and reserve estimates for increased hurricane activity',
    },
    tags: {
      lob: ['Property', 'Homeowners'],
      perils: ['Hurricane', 'Wind', 'Storm Surge'],
      regions: ['US-FL', 'US-LA', 'US-TX', 'US-NC'],
      companies: [],
      trends: ['Climate Risk', 'Catastrophe'],
      regulations: [],
    },
    riskPulse: 'HIGH',
    sentiment: 'NEGATIVE',
    confidence: 0.88,
    impactScore: 92,
    impactBreakdown: {
      market: 95,
      regulatory: 30,
      catastrophe: 98,
      technology: 10,
    },
    confidenceRationale: 'NOAA official forecast with historical accuracy and detailed methodology',
    leadQuote: 'The 2025 Atlantic hurricane season is expected to be significantly more active than average.',
    disclosure: 'NOAA official forecast',
  },
  {
    title: 'Social Inflation Continues to Drive Up Insurance Claims Costs',
    url: 'https://example.com/social-inflation-claims',
    source: 'Claims Journal',
    publishedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Industry experts warn that social inflation is accelerating claims costs across multiple lines...',
    bullets5: [
      'Social inflation driving 8-12% annual increases in claims costs',
      'Jury awards and settlement amounts significantly exceeding historical trends',
      'Medical cost inflation and litigation expenses contributing to trend',
      'Affects auto, workers comp, and general liability lines most severely',
      'Insurers implementing stricter underwriting and claims management strategies',
    ],
    whyItMatters: {
      underwriting: 'Underwriters must apply social inflation factors to rate calculations and increase loss reserves',
      claims: 'Claims adjusters need training on managing inflated settlement expectations and litigation risks',
      brokerage: 'Brokers should educate clients on social inflation impact and recommend adequate coverage limits',
      actuarial: 'Actuaries must incorporate social inflation trends into loss projections and pricing models',
    },
    tags: {
      lob: ['Auto', 'Workers Comp', 'General Liability'],
      perils: ['Litigation', 'Medical Inflation'],
      regions: ['US-National'],
      companies: [],
      trends: ['Social Inflation', 'Claims Cost'],
      regulations: [],
    },
    riskPulse: 'MEDIUM',
    sentiment: 'NEGATIVE',
    confidence: 0.85,
    impactScore: 78,
    impactBreakdown: {
      market: 85,
      regulatory: 40,
      catastrophe: 5,
      technology: 15,
    },
    confidenceRationale: 'Multiple industry sources and historical data support social inflation trend',
    leadQuote: 'Social inflation is one of the most significant challenges facing the insurance industry today.',
    disclosure: 'Industry analysis based on claims data trends',
  },
];

/**
 * Clear all articles and embeddings from the database
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
 * Store sample articles in Firestore
 */
async function storeArticles() {
  console.log('💾 Storing sample articles in Firestore...');

  let stored = 0;
  for (const article of SAMPLE_ARTICLES) {
    try {
      const docId = Buffer.from(article.url).toString('base64').substring(0, 20);
      await db.collection('articles').doc(docId).set({
        ...article,
        createdAt: new Date(),
      });
      stored++;
      console.log(`  ✅ Stored: ${article.title.substring(0, 50)}...`);
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
    console.log('🌱 Starting CarrierSignal mock seed script...\n');

    // Step 1: Clear database
    await clearDatabase();
    console.log();

    // Step 2: Store sample articles
    await storeArticles();
    console.log();

    console.log('✅ Mock seed script completed successfully!');
    console.log('\n📊 Sample data loaded:');
    console.log(`   - ${SAMPLE_ARTICLES.length} articles`);
    console.log('   - Ready for testing and development');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  }
}

main();

