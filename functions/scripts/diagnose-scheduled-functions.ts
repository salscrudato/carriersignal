/**
 * Diagnostic script to check scheduled functions status
 * Verifies Cloud Scheduler jobs and function triggers
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

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

async function diagnoseScheduledFunctions() {
  console.log('🔍 Diagnosing Scheduled Functions Status\n');
  console.log('=' .repeat(60));

  try {
    // 1. Check Cloud Scheduler jobs
    console.log('\n📅 Cloud Scheduler Jobs:');
    try {
      const schedulerOutput = execSync(
        'gcloud scheduler jobs list --project=carriersignal-app --format=json',
        { encoding: 'utf-8' }
      );
      const jobs = JSON.parse(schedulerOutput);
      if (jobs.length === 0) {
        console.log('❌ NO SCHEDULER JOBS FOUND!');
        console.log('   Expected: refreshFeeds, comprehensiveIngest');
      } else {
        console.log(`✅ Found ${jobs.length} scheduler job(s):`);
        jobs.forEach((job: any) => {
          console.log(`   - ${job.name.split('/').pop()}`);
          console.log(`     Schedule: ${job.schedule}`);
          console.log(`     Status: ${job.state}`);
        });
      }
    } catch (error) {
      console.log('⚠️  Could not query Cloud Scheduler');
    }

    // 2. Check Cloud Functions
    console.log('\n☁️  Cloud Functions:');
    try {
      const functionsOutput = execSync(
        'gcloud functions list --project=carriersignal-app --format=json',
        { encoding: 'utf-8' }
      );
      const functions = JSON.parse(functionsOutput);
      const scheduledFunctions = ['refreshFeeds', 'comprehensiveIngest'];
      
      scheduledFunctions.forEach(funcName => {
        const func = functions.find((f: any) => f.name.includes(funcName));
        if (func) {
          console.log(`\n   ${funcName}:`);
          console.log(`     Status: ${func.state}`);
          console.log(`     Trigger: ${func.trigger || 'NONE'}`);
          console.log(`     Runtime: ${func.runtime}`);
        }
      });
    } catch (error) {
      console.log('⚠️  Could not query Cloud Functions');
    }

    // 3. Check batch logs in Firestore
    console.log('\n📊 Recent Batch Logs (last 5):');
    const batchLogs = await db.collection('batch_logs')
      .orderBy('timestamp', 'desc')
      .limit(5)
      .get();

    if (batchLogs.empty) {
      console.log('❌ NO BATCH LOGS FOUND - Functions may not be running');
    } else {
      batchLogs.docs.forEach((doc, idx) => {
        const data = doc.data();
        const timestamp = data.timestamp?.toDate?.() || new Date(data.timestamp);
        const hoursAgo = Math.round((Date.now() - timestamp.getTime()) / (1000 * 60 * 60));
        console.log(`\n   ${idx + 1}. ${timestamp.toISOString()}`);
        console.log(`      (${hoursAgo} hours ago)`);
        console.log(`      Processed: ${data.processed || 0} articles`);
        console.log(`      Errors: ${data.errors || 0}`);
      });
    }

    // 4. Check article count and recency
    console.log('\n📰 Article Statistics:');
    const articleStats = await db.collection('newsArticles')
      .orderBy('publishedAt', 'desc')
      .limit(1)
      .get();

    if (!articleStats.empty) {
      const latestArticle = articleStats.docs[0].data();
      const publishedAt = latestArticle.publishedAt?.toDate?.() || new Date(latestArticle.publishedAt);
      const hoursOld = Math.round((Date.now() - publishedAt.getTime()) / (1000 * 60 * 60));
      console.log(`   Latest article: ${hoursOld} hours old`);
      console.log(`   Title: ${latestArticle.title?.substring(0, 60)}...`);
    }

    const totalArticles = await db.collection('newsArticles').count().get();
    console.log(`   Total articles: ${totalArticles.data().count}`);

    // 5. Recommendations
    console.log('\n' + '='.repeat(60));
    console.log('💡 Recommendations:\n');
    
    if (batchLogs.empty) {
      console.log('1. ❌ No batch logs found - scheduled functions are NOT running');
      console.log('   ACTION: Redeploy functions with: firebase deploy --only functions');
    } else {
      const lastLog = batchLogs.docs[0].data();
      const lastTimestamp = lastLog.timestamp?.toDate?.() || new Date(lastLog.timestamp);
      const hoursSinceLastRun = Math.round((Date.now() - lastTimestamp.getTime()) / (1000 * 60 * 60));
      
      if (hoursSinceLastRun > 13) {
        console.log(`1. ⚠️  Last batch ran ${hoursSinceLastRun} hours ago (expected every 12 hours)`);
        console.log('   ACTION: Check Cloud Scheduler jobs and redeploy if needed');
      } else {
        console.log(`1. ✅ Functions appear to be running (last batch: ${hoursSinceLastRun} hours ago)`);
      }
    }

    console.log('\n2. To manually trigger a batch:');
    console.log('   npm run refreshFeedsManual');
    console.log('\n3. To view live logs:');
    console.log('   firebase functions:log');

  } catch (error) {
    console.error('Error during diagnosis:', error);
  }

  process.exit(0);
}

diagnoseScheduledFunctions();

