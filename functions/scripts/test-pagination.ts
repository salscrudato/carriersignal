/**
 * Test Pagination Logic
 * Simulates the frontend pagination to debug infinite scroll
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

async function testPagination() {
  try {
    console.log('🧪 Testing Pagination Logic\n');

    const pageSize = 20;

    // First load
    console.log(`📄 First Load (limit: ${pageSize})`);
    const q1 = db.collection('articles')
      .orderBy('createdAt', 'desc')
      .limit(pageSize);
    
    const snapshot1 = await q1.get();
    console.log(`  ✓ Returned: ${snapshot1.docs.length} articles`);
    console.log(`  ✓ hasMore: ${snapshot1.docs.length === pageSize}`);
    
    if (snapshot1.docs.length === 0) {
      console.log('  ❌ No articles found!');
      process.exit(1);
    }

    const lastDoc = snapshot1.docs[snapshot1.docs.length - 1];
    console.log(`  ✓ Last document ID: ${lastDoc.id}`);
    console.log(`  ✓ Last document title: ${lastDoc.data().title.substring(0, 50)}...`);

    // Second load (pagination)
    console.log(`\n📄 Second Load (startAfter + limit: ${pageSize})`);
    const q2 = db.collection('articles')
      .orderBy('createdAt', 'desc')
      .startAfter(lastDoc)
      .limit(pageSize);
    
    const snapshot2 = await q2.get();
    console.log(`  ✓ Returned: ${snapshot2.docs.length} articles`);
    console.log(`  ✓ hasMore: ${snapshot2.docs.length === pageSize}`);

    if (snapshot2.docs.length > 0) {
      const firstDoc2 = snapshot2.docs[0];
      console.log(`  ✓ First document ID: ${firstDoc2.id}`);
      console.log(`  ✓ First document title: ${firstDoc2.data().title.substring(0, 50)}...`);
    } else {
      console.log('  ⚠️  No more articles to load');
    }

    // Summary
    console.log(`\n📊 Summary`);
    console.log(`  Total loaded: ${snapshot1.docs.length + snapshot2.docs.length} articles`);
    console.log(`  First batch: ${snapshot1.docs.length}`);
    console.log(`  Second batch: ${snapshot2.docs.length}`);
    console.log(`  Expected total: 30`);

    if (snapshot1.docs.length + snapshot2.docs.length === 30) {
      console.log(`  ✅ Pagination working correctly!`);
    } else {
      console.log(`  ⚠️  Pagination may have issues`);
    }

    // Check for duplicates
    const allIds = new Set();
    let duplicates = 0;
    for (const doc of [...snapshot1.docs, ...snapshot2.docs]) {
      if (allIds.has(doc.id)) {
        duplicates++;
      }
      allIds.add(doc.id);
    }
    console.log(`  Duplicates: ${duplicates}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testPagination();

