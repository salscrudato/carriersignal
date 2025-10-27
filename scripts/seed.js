/**
 * Simple Seed Script for CarrierSignal
 * Uses Firebase Admin SDK with default credentials
 * Run with: GOOGLE_APPLICATION_CREDENTIALS=path/to/key.json node scripts/seed.js
 * Or: firebase emulators:start --only firestore (in another terminal)
 * Then: FIRESTORE_EMULATOR_HOST=localhost:8080 node scripts/seed.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
// Uses GOOGLE_APPLICATION_CREDENTIALS env var or default credentials
try {
  admin.initializeApp({
    projectId: 'carriersignal-app',
  });
} catch (error) {
  console.log('Using existing Firebase app instance');
}

const db = admin.firestore();

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

async function seedDatabase() {
  try {
    console.log('🚀 Starting database seeding...\n');
    
    // Clear existing articles
    console.log('🗑️  Clearing existing articles...');
    const snapshot = await db.collection('articles').get();
    const batch = db.batch();
    
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    if (snapshot.size > 0) {
      await batch.commit();
      console.log(`✓ Cleared ${snapshot.size} articles\n`);
    } else {
      console.log('✓ No existing articles to clear\n');
    }
    
    // Store new articles
    console.log(`💾 Storing ${SAMPLE_ARTICLES.length} articles to Firestore...`);
    const storeBatch = db.batch();
    let count = 0;

    SAMPLE_ARTICLES.forEach(article => {
      const docRef = db.collection('articles').doc();
      storeBatch.set(docRef, {
        ...article,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      count++;
    });

    await storeBatch.commit();
    console.log(`✓ Stored ${count} articles\n`);
    
    console.log('✅ Database seeding complete!');
    console.log(`📊 Total articles stored: ${count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

seedDatabase();

