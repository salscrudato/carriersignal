/**
 * Verification Script for CarrierSignal Articles
 * Checks if articles are properly stored in Firestore
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

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

async function verifyArticles() {
  try {
    console.log('🔍 Verifying articles in Firestore...\n');

    // Get all articles
    const articlesSnapshot = await db.collection('articles').get();
    console.log(`📊 Total articles: ${articlesSnapshot.size}\n`);

    if (articlesSnapshot.size === 0) {
      console.log('⚠️  No articles found in Firestore!');
      process.exit(1);
    }

    // Show first 5 articles
    console.log('📰 First 5 articles:\n');
    let count = 0;
    for (const doc of articlesSnapshot.docs) {
      if (count >= 5) break;
      const data = doc.data();
      console.log(`${count + 1}. ${data.title}`);
      console.log(`   URL: ${data.url}`);
      console.log(`   Source: ${data.source}`);
      console.log(`   Impact Score: ${data.impactScore}`);
      console.log(`   Smart Score: ${data.smartScore}`);
      console.log(`   Created At: ${data.createdAt?.toDate?.() || data.createdAt}`);
      console.log(`   Has bullets5: ${!!data.bullets5 && data.bullets5.length > 0}`);
      console.log(`   Has tags: ${!!data.tags && Object.keys(data.tags).length > 0}`);
      console.log();
      count++;
    }

    // Check for required fields
    console.log('✅ Field verification:\n');
    let missingCreatedAt = 0;
    let missingSmartScore = 0;
    let missingImpactScore = 0;

    for (const doc of articlesSnapshot.docs) {
      const data = doc.data();
      if (!data.createdAt) missingCreatedAt++;
      if (!data.smartScore) missingSmartScore++;
      if (!data.impactScore) missingImpactScore++;
    }

    console.log(`  • createdAt: ${articlesSnapshot.size - missingCreatedAt}/${articlesSnapshot.size} ✓`);
    console.log(`  • smartScore: ${articlesSnapshot.size - missingSmartScore}/${articlesSnapshot.size} ✓`);
    console.log(`  • impactScore: ${articlesSnapshot.size - missingImpactScore}/${articlesSnapshot.size} ✓`);

    // Test query with orderBy
    console.log('\n🔍 Testing Firestore queries:\n');
    
    try {
      const q1 = await db.collection('articles')
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get();
      console.log(`  ✓ Query with orderBy('createdAt', 'desc'): ${q1.size} articles`);
    } catch (err) {
      console.log(`  ✗ Query with orderBy('createdAt', 'desc'): ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    try {
      const q2 = await db.collection('articles')
        .orderBy('smartScore', 'desc')
        .limit(5)
        .get();
      console.log(`  ✓ Query with orderBy('smartScore', 'desc'): ${q2.size} articles`);
    } catch (err) {
      console.log(`  ✗ Query with orderBy('smartScore', 'desc'): ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    console.log('\n✅ Verification complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

verifyArticles();

