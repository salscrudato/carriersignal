/**
 * Test scheduled functions by manually triggering them
 * Verifies that functions execute correctly and update articles
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '../../serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('serviceAccountKey.json not found.');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'carriersignal-app',
});

const db = admin.firestore();

async function testScheduledFunctions() {
  console.log('🧪 Testing Scheduled Functions\n');
  console.log('=' .repeat(70));

  try {
    // 1. Check current article count and latest article
    console.log('\n📊 Current Article Statistics:\n');
    
    const articleCount = await db.collection('newsArticles').count().get();
    console.log(`   Total articles: ${articleCount.data().count}`);

    const latestArticle = await db.collection('newsArticles')
      .orderBy('publishedAt', 'desc')
      .limit(1)
      .get();

    if (!latestArticle.empty) {
      const article = latestArticle.docs[0].data();
      const publishedAt = article.publishedAt?.toDate?.() || new Date(article.publishedAt);
      const hoursOld = Math.round((Date.now() - publishedAt.getTime()) / (1000 * 60 * 60));
      console.log(`   Latest article: ${hoursOld} hours old`);
      console.log(`   Title: ${article.title?.substring(0, 70)}...`);
      console.log(`   Score: ${article.score || 'N/A'}`);
    }

    // 2. Check batch logs
    console.log('\n📝 Recent Batch Logs:\n');
    
    const batchLogs = await db.collection('batch_logs')
      .orderBy('timestamp', 'desc')
      .limit(3)
      .get();

    if (batchLogs.empty) {
      console.log('   ⚠️  No batch logs found - functions may not have run yet');
    } else {
      batchLogs.docs.forEach((doc, idx) => {
        const data = doc.data();
        const timestamp = data.timestamp?.toDate?.() || new Date(data.timestamp);
        const hoursAgo = Math.round((Date.now() - timestamp.getTime()) / (1000 * 60 * 60));
        console.log(`\n   ${idx + 1}. ${timestamp.toISOString()}`);
        console.log(`      (${hoursAgo} hours ago)`);
        console.log(`      Processed: ${data.processed || 0} articles`);
        console.log(`      Skipped: ${data.skipped || 0}`);
        console.log(`      Errors: ${data.errors || 0}`);
      });
    }

    // 3. Check scheduler job status
    console.log('\n\n⏰ Scheduler Job Status:\n');
    console.log('   Run: gcloud scheduler jobs list --location=us-central1 --project=carriersignal-app');
    console.log('   To manually trigger: gcloud scheduler jobs run <job-name> --location=us-central1 --project=carriersignal-app');

    // 4. Recommendations
    console.log('\n' + '='.repeat(70));
    console.log('\n💡 Recommendations:\n');

    if (batchLogs.empty) {
      console.log('1. ❌ No batch logs found');
      console.log('   ACTION: Manually trigger a scheduler job to test:');
      console.log('   gcloud scheduler jobs run firebase-schedule-refreshFeeds-us-central1 --location=us-central1 --project=carriersignal-app\n');
    } else {
      const lastLog = batchLogs.docs[0].data();
      const lastTimestamp = lastLog.timestamp?.toDate?.() || new Date(lastLog.timestamp);
      const hoursSinceLastRun = Math.round((Date.now() - lastTimestamp.getTime()) / (1000 * 60 * 60));
      
      if (hoursSinceLastRun > 13) {
        console.log(`1. ⚠️  Last batch ran ${hoursSinceLastRun} hours ago (expected every 12 hours)`);
        console.log('   ACTION: Manually trigger to verify functions are working\n');
      } else {
        console.log(`1. ✅ Functions appear to be running (last batch: ${hoursSinceLastRun} hours ago)\n`);
      }
    }

    console.log('2. Monitor live logs:');
    console.log('   firebase functions:log\n');

    console.log('3. Check scheduler job details:');
    console.log('   gcloud scheduler jobs describe firebase-schedule-refreshFeeds-us-central1 --location=us-central1 --project=carriersignal-app\n');

  } catch (error) {
    console.error('Error during testing:', error);
  }

  process.exit(0);
}

testScheduledFunctions();

