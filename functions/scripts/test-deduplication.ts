/**
 * Test Deduplication Logic
 * Verifies that the multi-layer deduplication prevents duplicate articles
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '../../serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ serviceAccountKey.json not found');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function testDeduplication() {
  console.log('🧪 Testing Deduplication Logic\n');

  try {
    // Get all articles
    const articlesSnapshot = await db.collection('articles').get();
    console.log(`📊 Total articles in database: ${articlesSnapshot.size}`);

    if (articlesSnapshot.size === 0) {
      console.log('⚠️  No articles found. Run feed refresh first.');
      process.exit(0);
    }

    // Check for duplicates by content hash
    console.log('\n🔍 Checking for duplicate content hashes...');
    const contentHashMap = new Map<string, string[]>();
    
    articlesSnapshot.forEach(doc => {
      const data = doc.data();
      const contentHash = data.contentHash;
      if (contentHash) {
        if (!contentHashMap.has(contentHash)) {
          contentHashMap.set(contentHash, []);
        }
        contentHashMap.get(contentHash)!.push(doc.id);
      }
    });

    let duplicatesByContentHash = 0;
    contentHashMap.forEach((ids, hash) => {
      if (ids.length > 1) {
        console.log(`  ⚠️  Content hash ${hash} appears ${ids.length} times`);
        duplicatesByContentHash++;
      }
    });

    if (duplicatesByContentHash === 0) {
      console.log('  ✅ No duplicate content hashes found');
    }

    // Check for duplicates by canonical URL
    console.log('\n🔍 Checking for duplicate canonical URLs...');
    const canonicalUrlMap = new Map<string, string[]>();
    
    articlesSnapshot.forEach(doc => {
      const data = doc.data();
      const canonicalUrl = data.canonicalUrl;
      if (canonicalUrl) {
        if (!canonicalUrlMap.has(canonicalUrl)) {
          canonicalUrlMap.set(canonicalUrl, []);
        }
        canonicalUrlMap.get(canonicalUrl)!.push(doc.id);
      }
    });

    let duplicatesByCanonicalUrl = 0;
    canonicalUrlMap.forEach((ids) => {
      if (ids.length > 1) {
        console.log(`  ⚠️  Canonical URL appears ${ids.length} times`);
        duplicatesByCanonicalUrl++;
      }
    });

    if (duplicatesByCanonicalUrl === 0) {
      console.log('  ✅ No duplicate canonical URLs found');
    }

    // Check for duplicates by title + source
    console.log('\n🔍 Checking for duplicate title + source combinations...');
    const titleSourceMap = new Map<string, string[]>();
    
    articlesSnapshot.forEach(doc => {
      const data = doc.data();
      const key = `${data.title}|${data.source}`;
      if (!titleSourceMap.has(key)) {
        titleSourceMap.set(key, []);
      }
      titleSourceMap.get(key)!.push(doc.id);
    });

    let duplicatesByTitleSource = 0;
    titleSourceMap.forEach((ids) => {
      if (ids.length > 1) {
        console.log(`  ⚠️  Title+Source combination appears ${ids.length} times`);
        duplicatesByTitleSource++;
      }
    });

    if (duplicatesByTitleSource === 0) {
      console.log('  ✅ No duplicate title + source combinations found');
    }

    // Summary
    console.log('\n📋 Deduplication Test Summary:');
    console.log(`  Total articles: ${articlesSnapshot.size}`);
    console.log(`  Duplicate content hashes: ${duplicatesByContentHash}`);
    console.log(`  Duplicate canonical URLs: ${duplicatesByCanonicalUrl}`);
    console.log(`  Duplicate title+source: ${duplicatesByTitleSource}`);

    if (duplicatesByContentHash === 0 && duplicatesByCanonicalUrl === 0 && duplicatesByTitleSource === 0) {
      console.log('\n✅ All deduplication checks passed!');
    } else {
      console.log('\n❌ Deduplication issues detected!');
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

testDeduplication();

