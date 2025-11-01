/**
 * Setup Cloud Scheduler jobs for scheduled functions
 * This script creates the necessary Cloud Scheduler jobs if they don't exist
 */

import { execSync } from 'child_process';

const PROJECT_ID = 'carriersignal-app';
const REGION = 'us-central1';
const TIMEZONE = 'America/New_York';

interface SchedulerJob {
  name: string;
  schedule: string;
  functionName: string;
  description: string;
}

const JOBS: SchedulerJob[] = [
  {
    name: 'refreshFeeds-scheduler',
    schedule: 'every 12 hours',
    functionName: 'refreshFeeds',
    description: 'Refresh news feeds every 12 hours',
  },
  {
    name: 'comprehensiveIngest-scheduler',
    schedule: 'every 12 hours',
    functionName: 'comprehensiveIngest',
    description: 'Comprehensive ingestion with AI every 12 hours',
  },
];

async function setupSchedulerJobs() {
  console.log('🔧 Setting up Cloud Scheduler jobs\n');
  console.log('=' .repeat(60));

  for (const job of JOBS) {
    try {
      // Check if job exists
      console.log(`\n📋 Checking job: ${job.name}`);
      
      try {
        execSync(
          `gcloud scheduler jobs describe ${job.name} --location=${REGION} --project=${PROJECT_ID}`,
          { encoding: 'utf-8', stdio: 'pipe' }
        );
        console.log(`   ✅ Job already exists`);
        continue;
      } catch {
        console.log(`   ℹ️  Job does not exist, creating...`);
      }

      // Get the function URL
      const functionUrl = execSync(
        `gcloud functions describe ${job.functionName} --region=${REGION} --project=${PROJECT_ID} --format='value(serviceConfig.uri)'`,
        { encoding: 'utf-8' }
      ).trim();

      if (!functionUrl) {
        console.error(`   ❌ Could not find function URL for ${job.functionName}`);
        continue;
      }

      console.log(`   Function URL: ${functionUrl}`);

      // Create the scheduler job
      const createCmd = `gcloud scheduler jobs create http ${job.name} \
        --location=${REGION} \
        --schedule="${job.schedule}" \
        --time-zone="${TIMEZONE}" \
        --uri="${functionUrl}" \
        --http-method=POST \
        --oidc-service-account-email=108994576767-compute@developer.gserviceaccount.com \
        --oidc-token-audience="${functionUrl}" \
        --project=${PROJECT_ID}`;

      execSync(createCmd, { encoding: 'utf-8', stdio: 'pipe' });
      console.log(`   ✅ Job created successfully`);

    } catch (error) {
      console.error(`   ❌ Error setting up job ${job.name}:`, error instanceof Error ? error.message : error);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Scheduler jobs setup complete!\n');
  console.log('Verify jobs with:');
  console.log('  gcloud scheduler jobs list --project=carriersignal-app\n');
  console.log('View job details with:');
  console.log('  gcloud scheduler jobs describe refreshFeeds-scheduler --location=us-central1 --project=carriersignal-app\n');
}

setupSchedulerJobs().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

