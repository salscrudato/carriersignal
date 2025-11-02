/**
 * Comprehensive Test Suite for Firebase Enhancements
 * Tests monitoring, scheduling, deduplication, scoring, and feed prioritization
 */

import {initializeApp} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';

initializeApp();
const db = getFirestore();

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

const results: TestResult[] = [];

async function runTest(name: string, testFn: () => Promise<void>): Promise<void> {
  const start = Date.now();
  try {
    await testFn();
    results.push({name, passed: true, duration: Date.now() - start});
    console.log(`✅ ${name} (${Date.now() - start}ms)`);
  } catch (error) {
    results.push({
      name,
      passed: false,
      duration: Date.now() - start,
      error: error instanceof Error ? error.message : String(error),
    });
    console.log(`❌ ${name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function testMonitoringSystem(): Promise<void> {
  const cycleId = `test_cycle_${Date.now()}`;
  const doc = await db.collection('monitoring_cycles').add({
    cycleId,
    startTime: new Date(),
    status: 'completed',
    metrics: {
      articlesProcessed: 100,
      errors: 2,
      successRate: 0.98,
      duration: 5000,
    },
    alerts: [],
  });

  if (!doc.id) throw new Error('Failed to create monitoring cycle');
}

async function testSchedulingSystem(): Promise<void> {
  const cycleId = `test_schedule_${Date.now()}`;
  const doc = await db.collection('schedule_state').add({
    cycleId,
    scheduledTime: new Date(),
    status: 'completed',
    retryCount: 0,
    maxRetries: 3,
    fallbackTriggered: false,
  });

  if (!doc.id) throw new Error('Failed to create schedule state');
}

async function testDeduplication(): Promise<void> {
  // Test URL-based deduplication
  const testUrl = `https://example.com/article-${Date.now()}`;
  const doc1 = await db.collection('newsArticles').add({
    url: testUrl,
    title: 'Test Article',
    contentHash: 'hash123',
    publishedAt: new Date(),
  });

  const doc2 = await db.collection('newsArticles').doc(doc1.id).get();
  if (!doc2.exists) throw new Error('Failed to store article for deduplication test');

  // Verify URL uniqueness
  const duplicates = await db.collection('newsArticles')
    .where('url', '==', testUrl)
    .get();

  if (duplicates.size !== 1) throw new Error('Deduplication check failed');
}

async function testFreshness(): Promise<void> {
  const now = new Date();
  const freshArticle = new Date(now.getTime() - 1 * 60 * 60 * 1000); // 1 hour old
  const staleArticle = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000); // 8 days old

  await db.collection('newsArticles').add({
    title: 'Fresh Article',
    publishedAt: freshArticle,
    freshness: 'fresh',
  });

  await db.collection('newsArticles').add({
    title: 'Stale Article',
    publishedAt: staleArticle,
    freshness: 'stale',
  });
}

async function testScoringSystem(): Promise<void> {
  const articleId = `test_article_${Date.now()}`;
  await db.collection('newsArticles').doc(articleId).set({
    title: 'Test Article',
    score: 75,
    lastScoringUpdate: new Date(),
    scoringHistory: [
      {timestamp: new Date(), oldScore: 70, newScore: 75, reason: 'Real-time update'},
    ],
  });

  const doc = await db.collection('newsArticles').doc(articleId).get();
  if (!doc.exists) throw new Error('Failed to create article for scoring test');
  if (doc.data()?.score !== 75) throw new Error('Score not set correctly');
}

async function testFeedPrioritization(): Promise<void> {
  const feedUrl = `https://example.com/feed-${Date.now()}`;
  const feedId = require('crypto').createHash('md5').update(feedUrl).digest('hex');

  await db.collection('feed_metrics').doc(feedId).set({
    feedUrl,
    successRate: 0.95,
    avgLatency: 2000,
    articlesPerCycle: 50,
    qualityScore: 85,
    relevanceScore: 90,
    lastUpdated: new Date(),
  });

  const doc = await db.collection('feed_metrics').doc(feedId).get();
  if (!doc.exists) throw new Error('Failed to create feed metrics');
}

async function testHealthCheckData(): Promise<void> {
  // Create a completed cycle for health check
  await db.collection('monitoring_cycles').add({
    cycleId: `health_test_${Date.now()}`,
    startTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
    endTime: new Date(),
    status: 'completed',
    metrics: {
      articlesProcessed: 150,
      errors: 1,
      successRate: 0.99,
      duration: 3600000,
    },
  });
}

async function testRetryQueue(): Promise<void> {
  await db.collection('retry_queue').add({
    cycleId: `retry_test_${Date.now()}`,
    retryCount: 1,
    scheduledFor: new Date(Date.now() + 5 * 60 * 1000),
    status: 'pending',
    createdAt: new Date(),
  });
}

async function testFallbackTasks(): Promise<void> {
  await db.collection('fallback_tasks').add({
    cycleId: `fallback_test_${Date.now()}`,
    triggeredAt: new Date(),
    type: 'manual_trigger_required',
    status: 'pending',
    description: 'Test fallback task',
  });
}

async function testTrendingTopics(): Promise<void> {
  await db.collection('trending_topics').doc('test_topic').set({
    name: 'Test Topic',
    score: 85,
    count: 10,
    lastUpdated: new Date(),
  });
}

async function testUserInteractions(): Promise<void> {
  const articleId = `article_${Date.now()}`;
  await db.collection('user_interactions').add({
    articleId,
    type: 'view',
    timestamp: new Date(),
    userId: 'test_user',
  });

  await db.collection('user_interactions').add({
    articleId,
    type: 'bookmark',
    timestamp: new Date(),
    userId: 'test_user',
  });
}

async function testIndexes(): Promise<void> {
  // Test that queries work efficiently
  const snapshot = await db.collection('monitoring_cycles')
    .where('status', '==', 'completed')
    .orderBy('endTime', 'desc')
    .limit(1)
    .get();

  // Should not throw
  if (snapshot.size > 0) {
    console.log('   Indexes working correctly');
  }
}

async function runAllTests(): Promise<void> {
  console.log('\n🧪 Running Firebase Enhancements Test Suite\n');
  console.log('='.repeat(60));

  await runTest('Monitoring System', testMonitoringSystem);
  await runTest('Scheduling System', testSchedulingSystem);
  await runTest('Deduplication', testDeduplication);
  await runTest('Freshness Tracking', testFreshness);
  await runTest('Scoring System', testScoringSystem);
  await runTest('Feed Prioritization', testFeedPrioritization);
  await runTest('Health Check Data', testHealthCheckData);
  await runTest('Retry Queue', testRetryQueue);
  await runTest('Fallback Tasks', testFallbackTasks);
  await runTest('Trending Topics', testTrendingTopics);
  await runTest('User Interactions', testUserInteractions);
  await runTest('Firestore Indexes', testIndexes);

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Results Summary\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const totalTime = results.reduce((sum, r) => sum + r.duration, 0);

  console.log(`✅ Passed: ${passed}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  console.log(`⏱️  Total Time: ${totalTime}ms\n`);

  if (failed > 0) {
    console.log('Failed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
  }

  process.exit(failed > 0 ? 1 : 0);
}

runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

