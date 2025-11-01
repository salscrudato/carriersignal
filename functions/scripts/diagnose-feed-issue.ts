/**
 * Diagnose why only one feed is being processed
 * Checks: feeds collection, circuit breaker status, feed health
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '../../serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ serviceAccountKey.json not found.');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'carriersignal-app',
});

const db = admin.firestore();

async function diagnoseFeedIssue() {
  console.log('🔍 DIAGNOSING FEED PROCESSING ISSUE\n');
  console.log('='.repeat(100));

  try {
    // 1. Check feeds collection
    console.log('\n1️⃣  FEEDS COLLECTION:\n');
    const feedsSnap = await db.collection('feeds').get();
    console.log(`   Total feeds in Firestore: ${feedsSnap.size}`);
    
    if (feedsSnap.size === 0) {
      console.log('   ⚠️  Feeds collection is EMPTY - will use DEFAULT_FEED_SOURCES');
    } else {
      let enabledCount = 0;
      feedsSnap.forEach(doc => {
        const data = doc.data();
        const status = data.enabled ? '✅' : '❌';
        console.log(`   ${status} ${data.url} (enabled: ${data.enabled})`);
        if (data.enabled) enabledCount++;
      });
      console.log(`\n   Enabled feeds: ${enabledCount}/${feedsSnap.size}`);
    }

    // 2. Check feed_health collection
    console.log('\n2️⃣  FEED HEALTH STATUS:\n');
    const healthSnap = await db.collection('feed_health').get();
    console.log(`   Total feed health records: ${healthSnap.size}`);
    
    healthSnap.forEach(doc => {
      const data = doc.data();
      const failureRate = data.successCount + data.failureCount > 0 
        ? ((data.failureCount / (data.successCount + data.failureCount)) * 100).toFixed(1)
        : 'N/A';
      console.log(`   ${data.url}`);
      console.log(`      Success: ${data.successCount}, Failures: ${data.failureCount}, Rate: ${failureRate}%`);
      if (data.lastError) console.log(`      Last Error: ${data.lastError}`);
    });

    // 3. Check article counts by source
    console.log('\n3️⃣  ARTICLE COUNTS BY SOURCE:\n');
    const articlesSnap = await db.collection('articles').get();
    const sourceMap = new Map<string, number>();
    
    articlesSnap.forEach(doc => {
      const data = doc.data();
      const source = data.source || 'unknown';
      sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
    });

    console.log(`   Total articles: ${articlesSnap.size}`);
    const sortedSources = Array.from(sourceMap.entries()).sort((a, b) => b[1] - a[1]);
    sortedSources.forEach(([source, count]) => {
      console.log(`   - ${source}: ${count} articles`);
    });

    // 4. Check batch logs
    console.log('\n4️⃣  RECENT BATCH LOGS:\n');
    const batchSnap = await db.collection('batch_logs')
      .orderBy('timestamp', 'desc')
      .limit(5)
      .get();

    batchSnap.forEach(doc => {
      const data = doc.data();
      const timestamp = data.timestamp?.toDate?.() || new Date(data.timestamp);
      console.log(`   ${timestamp.toISOString()}`);
      console.log(`      Status: ${data.status}, Processed: ${data.processed}, Skipped: ${data.skipped}, Errors: ${data.errors}`);
    });

    console.log('\n' + '='.repeat(100));
    console.log('\n💡 RECOMMENDATIONS:\n');

    if (feedsSnap.size === 0) {
      console.log('1. Feeds collection is empty. Call the initializeFeeds endpoint to populate it.');
      console.log('   curl -X POST https://your-function-url/initializeFeeds\n');
    } else if (Array.from(sourceMap.values()).reduce((a, b) => a + b, 0) === 0) {
      console.log('1. No articles found. Check if feeds are being fetched.');
      console.log('2. Verify circuit breaker status - feeds may be open.\n');
    } else {
      const totalSources = sourceMap.size;
      if (totalSources === 1) {
        console.log(`1. Only 1 source is producing articles. Other feeds may be failing.`);
        console.log('2. Check feed_health records for failure patterns.\n');
      }
    }

    console.log('\n');

  } catch (error) {
    console.error('Error during diagnosis:', error);
  }

  process.exit(0);
}

diagnoseFeedIssue();

