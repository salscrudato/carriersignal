/**
 * Clear Database and Reseed Script
 * Deletes all articles and related data, then triggers a fresh ingest
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
  projectId: 'carriersignal-app',
});

const db = admin.firestore();

async function clearDatabase() {
  console.log('🗑️  CLEARING DATABASE...\n');

  try {
    // Delete all articles
    console.log('Deleting articles collection...');
    const articlesSnapshot = await db.collection('articles').limit(1000).get();
    let deletedCount = 0;
    
    for (const doc of articlesSnapshot.docs) {
      await doc.ref.delete();
      deletedCount++;
    }
    console.log(`✅ Deleted ${deletedCount} articles`);

    // Delete all idempotency records
    console.log('Deleting idempotency records...');
    const idempotencySnapshot = await db.collection('_idempotency').limit(1000).get();
    let idempotencyCount = 0;
    
    for (const doc of idempotencySnapshot.docs) {
      await doc.ref.delete();
      idempotencyCount++;
    }
    console.log(`✅ Deleted ${idempotencyCount} idempotency records`);

    // Delete all ingestion metrics
    console.log('Deleting ingestion metrics...');
    const metricsSnapshot = await db.collection('ingestion_metrics').limit(1000).get();
    let metricsCount = 0;
    
    for (const doc of metricsSnapshot.docs) {
      await doc.ref.delete();
      metricsCount++;
    }
    console.log(`✅ Deleted ${metricsCount} ingestion metrics`);

    console.log('\n✅ DATABASE CLEARED SUCCESSFULLY\n');
    return true;
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    return false;
  }
}

async function verifyFeeds() {
  console.log('🔍 VERIFYING FEEDS...\n');

  try {
    const feedsSnapshot = await db.collection('feeds').get();
    const feeds = feedsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`Found ${feeds.length} feeds:\n`);
    
    let enabledCount = 0;
    feeds.forEach((feed: any) => {
      const status = feed.enabled ? '✅' : '❌';
      console.log(`${status} ${feed.url}`);
      if (feed.enabled) enabledCount++;
    });

    console.log(`\n✅ ${enabledCount}/${feeds.length} feeds enabled\n`);
    return enabledCount > 0;
  } catch (error) {
    console.error('❌ Error verifying feeds:', error);
    return false;
  }
}

async function main() {
  console.log('====================================================================================================');
  console.log('🚀 DATABASE CLEAR & RESEED SCRIPT');
  console.log('====================================================================================================\n');

  // Step 1: Clear database
  const cleared = await clearDatabase();
  if (!cleared) {
    console.error('Failed to clear database');
    process.exit(1);
  }

  // Step 2: Verify feeds
  const verified = await verifyFeeds();
  if (!verified) {
    console.error('No feeds enabled');
    process.exit(1);
  }

  console.log('====================================================================================================');
  console.log('✅ DATABASE CLEARED AND READY FOR RESEED');
  console.log('====================================================================================================');
  console.log('\n📝 Next steps:');
  console.log('1. Run: gcloud scheduler jobs run firebase-schedule-refreshFeeds-us-central1 --location=us-central1 --project=carriersignal-app');
  console.log('2. Monitor: firebase functions:log 2>&1 | grep refreshfeeds');
  console.log('\n');

  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

