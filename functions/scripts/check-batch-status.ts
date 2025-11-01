/**
 * Check the status of the latest batch execution
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '../../serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ serviceAccountKey.json not found.');
  console.log('Note: This script requires Firebase Admin credentials.');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'carriersignal-app',
});

const db = admin.firestore();

async function checkBatchStatus() {
  console.log('📊 Checking Latest Batch Status\n');
  console.log('=' .repeat(70));

  try {
    // Get the latest batch log
    const batchLogs = await db.collection('batch_logs')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (batchLogs.empty) {
      console.log('\n❌ No batch logs found');
      process.exit(0);
    }

    const latestBatch = batchLogs.docs[0].data();
    const timestamp = latestBatch.timestamp?.toDate?.() || new Date(latestBatch.timestamp);
    const now = new Date();
    const minutesAgo = Math.round((now.getTime() - timestamp.getTime()) / (1000 * 60));

    console.log('\n✅ Latest Batch Execution:\n');
    console.log(`   Timestamp: ${timestamp.toISOString()}`);
    console.log(`   (${minutesAgo} minutes ago)\n`);
    console.log(`   Status: ${latestBatch.status || 'unknown'}`);
    console.log(`   Duration: ${latestBatch.duration || 0}ms`);
    console.log(`   Processed: ${latestBatch.processed || 0} articles`);
    console.log(`   Skipped: ${latestBatch.skipped || 0} articles`);
    console.log(`   Errors: ${latestBatch.errors || 0}`);

    if (latestBatch.errorMessage) {
      console.log(`   Error: ${latestBatch.errorMessage}`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n📈 Summary:\n');

    if (latestBatch.status === 'success') {
      console.log('✅ Batch completed successfully!');
      console.log(`   - Processed ${latestBatch.processed} articles`);
      console.log(`   - Skipped ${latestBatch.skipped} duplicates`);
      if (latestBatch.errors > 0) {
        console.log(`   - ⚠️  ${latestBatch.errors} errors encountered`);
      }
    } else if (latestBatch.status === 'failed') {
      console.log('❌ Batch failed!');
      console.log(`   Error: ${latestBatch.errorMessage}`);
    }

    console.log('\n');

  } catch (error) {
    console.error('Error checking batch status:', error);
  }

  process.exit(0);
}

checkBatchStatus();

