/**
 * Monitor scheduled functions execution and health
 * Tracks execution history, errors, and article refresh status
 */

import { execSync } from 'child_process';

const PROJECT_ID = 'carriersignal-app';
const REGION = 'us-central1';

async function monitorScheduledFunctions() {
  console.log('📊 Monitoring Scheduled Functions\n');
  console.log('=' .repeat(70));

  try {
    // 1. Get scheduler jobs status
    console.log('\n☁️  Cloud Scheduler Jobs Status:\n');
    
    const jobsOutput = execSync(
      `gcloud scheduler jobs list --location=${REGION} --project=${PROJECT_ID} --format=json`,
      { encoding: 'utf-8' }
    );
    
    const jobs = JSON.parse(jobsOutput);
    const firebaseJobs = jobs.filter((j: any) => j.name.includes('firebase-schedule'));
    
    for (const job of firebaseJobs) {
      const jobName = job.name.split('/').pop();
      console.log(`📅 ${jobName}`);
      console.log(`   Schedule: ${job.schedule}`);
      console.log(`   State: ${job.state}`);
      console.log(`   Last Attempt: ${job.lastAttemptTime || 'Never'}`);
      console.log(`   Next Scheduled: ${job.scheduleTime || 'N/A'}`);
      console.log('');
    }

    // 2. Get recent function logs
    console.log('\n📝 Recent Function Logs (last 20 lines):\n');
    
    try {
      const logsOutput = execSync(
        'firebase functions:log --limit=20',
        { encoding: 'utf-8', cwd: '/Users/salscrudato/Projects/carriersignal' }
      );
      
      const logLines = logsOutput.split('\n').slice(0, 10);
      logLines.forEach(line => {
        if (line.trim()) {
          console.log(`   ${line}`);
        }
      });
    } catch (error) {
      console.log('   ⚠️  Could not fetch logs');
    }

    // 3. Check article statistics
    console.log('\n📰 Article Statistics:\n');
    console.log('   To check article refresh status, run:');
    console.log('   firebase firestore:get /newsArticles --limit=1 --order-by=publishedAt --order-direction=desc');

    // 4. Manual trigger option
    console.log('\n' + '='.repeat(70));
    console.log('\n🚀 Manual Trigger Options:\n');
    console.log('   Trigger refreshFeeds manually:');
    console.log('   curl -X POST https://refreshfeedsmanual-zcbtif53na-uc.a.run.app\n');
    console.log('   Trigger comprehensiveIngest manually:');
    console.log('   npm run trigger:comprehensive-ingest\n');

    // 5. Next execution times
    console.log('⏰ Next Scheduled Executions:\n');
    for (const job of firebaseJobs) {
      const nextTime = job.scheduleTime ? new Date(job.scheduleTime) : null;
      if (nextTime) {
        const now = new Date();
        const hoursUntil = ((nextTime.getTime() - now.getTime()) / (1000 * 60 * 60)).toFixed(1);
        console.log(`   ${job.name.split('/').pop()}: ${nextTime.toISOString()} (in ${hoursUntil} hours)`);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n✅ Monitoring complete!\n');

  } catch (error) {
    console.error('Error during monitoring:', error instanceof Error ? error.message : error);
  }
}

monitorScheduledFunctions().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

