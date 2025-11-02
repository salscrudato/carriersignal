/**
 * Comprehensive 12-Hour Cycle Testing Script
 * Tests cycle verification, feed monitoring, and 24-hour feed retrieval
 */

import axios from 'axios';

const FUNCTIONS_URL = process.env.FUNCTIONS_URL || 'http://localhost:5001/carriersignal-app/us-central1';

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  details: string;
  error?: string;
}

const results: TestResult[] = [];

async function runTest(name: string, testFn: () => Promise<void>): Promise<void> {
  const startTime = Date.now();
  try {
    await testFn();
    results.push({
      name,
      passed: true,
      duration: Date.now() - startTime,
      details: 'Test passed',
    });
    console.log(`✅ ${name} (${Date.now() - startTime}ms)`);
  } catch (error) {
    results.push({
      name,
      passed: false,
      duration: Date.now() - startTime,
      details: 'Test failed',
      error: error instanceof Error ? error.message : String(error),
    });
    console.log(`❌ ${name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function testCycleVerification(): Promise<void> {
  const response = await axios.get(`${FUNCTIONS_URL}/verifyCycleCompletion`);
  
  if (!response.data.success) {
    throw new Error('Cycle verification failed');
  }

  const {verification, completion} = response.data;

  // Verify structure
  if (!verification.cycleId) throw new Error('Missing cycleId');
  if (verification.status === undefined) throw new Error('Missing status');
  if (completion.isComplete === undefined) throw new Error('Missing completion status');

  // Check if cycle is overdue
  if (completion.isOverdue) {
    console.log(`   ⚠️  Cycle is overdue by ${completion.hoursElapsed - 12} hours`);
  } else {
    console.log(`   ✓ Cycle on schedule (${completion.hoursElapsed} hours elapsed)`);
  }

  // Check phase completion
  if (!verification.bothPhasesCompleted) {
    console.log(`   ⚠️  Not all phases completed:`);
    console.log(`      - refreshFeeds: ${verification.refreshFeedsCompleted ? '✓' : '✗'}`);
    console.log(`      - comprehensiveIngest: ${verification.comprehensiveIngestCompleted ? '✓' : '✗'}`);
  } else {
    console.log(`   ✓ All phases completed`);
  }

  console.log(`   Quality Score: ${verification.qualityScore}/100`);
}

async function testFeedMonitoring(): Promise<void> {
  const response = await axios.get(`${FUNCTIONS_URL}/getFeedMonitoring`);

  if (!response.data.success) {
    throw new Error('Feed monitoring failed');
  }

  const {summary, feeds} = response.data;

  if (!summary) throw new Error('Missing summary');
  if (!Array.isArray(feeds)) throw new Error('Feeds not an array');

  console.log(`   Total Feeds: ${summary.totalFeeds}`);
  console.log(`   Healthy: ${summary.healthyFeeds} | Degraded: ${summary.degradedFeeds} | Failed: ${summary.failedFeeds}`);
  console.log(`   Avg Success Rate: ${summary.avgSuccessRate}`);
  console.log(`   Total Articles Ingested: ${summary.totalArticlesIngested}`);
  console.log(`   Total Duplicates Detected: ${summary.totalDuplicatesDetected}`);

  // Check for unhealthy feeds
  const unhealthyFeeds = feeds.filter((f: any) => f.status !== 'healthy');
  if (unhealthyFeeds.length > 0) {
    console.log(`   ⚠️  ${unhealthyFeeds.length} unhealthy feeds detected`);
  }
}

async function test24HourFeed(): Promise<void> {
  const response = await axios.get(`${FUNCTIONS_URL}/get24HourFeed?hours=24&limit=50`);

  if (!response.data.success) {
    throw new Error('24-hour feed retrieval failed');
  }

  const {summary, articles, sourceBreakdown, categoryBreakdown, topTrendingTopics} = response.data;

  if (!summary) throw new Error('Missing summary');
  if (!Array.isArray(articles)) throw new Error('Articles not an array');

  console.log(`   Total Articles: ${summary.totalArticles}`);
  console.log(`   Unique Articles: ${summary.uniqueArticles}`);
  console.log(`   Duplicates Detected: ${summary.duplicatesDetected}`);
  console.log(`   Duplicate Removal Rate: ${summary.duplicateRemovalRate}`);
  console.log(`   Average Score: ${summary.averageScore}`);

  // Check for duplicates in results
  const urls = new Set<string>();
  let duplicatesInResults = 0;
  for (const article of articles) {
    if (urls.has(article.url)) {
      duplicatesInResults++;
    }
    urls.add(article.url);
  }

  if (duplicatesInResults > 0) {
    throw new Error(`Found ${duplicatesInResults} duplicates in results!`);
  }

  console.log(`   ✓ No duplicates in results`);
  console.log(`   Top Sources: ${Object.entries(sourceBreakdown).slice(0, 3).map(([k, v]) => `${k} (${v})`).join(', ')}`);
  console.log(`   Top Categories: ${Object.entries(categoryBreakdown).slice(0, 3).map(([k, v]) => `${k} (${v})`).join(', ')}`);
  console.log(`   Trending Topics: ${topTrendingTopics.slice(0, 5).join(', ')}`);
}

async function testTrendingArticles(): Promise<void> {
  const response = await axios.get(`${FUNCTIONS_URL}/getTrendingArticles?limit=20&hours=24`);

  if (!response.data.success) {
    throw new Error('Trending articles retrieval failed');
  }

  const {count, articles} = response.data;

  if (!Array.isArray(articles)) throw new Error('Articles not an array');

  console.log(`   Retrieved ${count} trending articles`);

  // Verify articles are sorted by score
  let prevScore = Infinity;
  for (const article of articles) {
    if (article.score > prevScore) {
      throw new Error('Articles not sorted by score');
    }
    prevScore = article.score;
  }

  console.log(`   ✓ Articles properly sorted by score`);

  if (articles.length > 0) {
    console.log(`   Top Article: "${articles[0].title.substring(0, 60)}..."`);
    console.log(`   Score: ${articles[0].score}`);
  }
}

async function testDuplicateDetection(): Promise<void> {
  const response = await axios.get(`${FUNCTIONS_URL}/get24HourFeed?hours=24&limit=200`);

  if (!response.data.success) {
    throw new Error('Feed retrieval failed');
  }

  const {articles, summary} = response.data;

  // Comprehensive duplicate check
  const urlMap = new Map<string, string[]>();
  const titleMap = new Map<string, string[]>();

  for (const article of articles) {
    // Check URL duplicates
    if (!urlMap.has(article.url)) {
      urlMap.set(article.url, []);
    }
    urlMap.get(article.url)!.push(article.id);

    // Check title duplicates
    if (!titleMap.has(article.title)) {
      titleMap.set(article.title, []);
    }
    titleMap.get(article.title)!.push(article.id);
  }

  // Find duplicates
  let urlDuplicates = 0;
  let titleDuplicates = 0;

  for (const [, ids] of urlMap) {
    if (ids.length > 1) urlDuplicates += ids.length - 1;
  }

  for (const [, ids] of titleMap) {
    if (ids.length > 1) titleDuplicates += ids.length - 1;
  }

  console.log(`   URL Duplicates: ${urlDuplicates}`);
  console.log(`   Title Duplicates: ${titleDuplicates}`);
  console.log(`   System Reported Duplicates: ${summary.duplicatesDetected}`);

  if (urlDuplicates > 0 || titleDuplicates > 0) {
    console.log(`   ⚠️  Duplicates detected in feed`);
  } else {
    console.log(`   ✓ No duplicates detected`);
  }
}

async function runAllTests(): Promise<void> {
  console.log('\n🧪 Starting 12-Hour Cycle Verification Tests\n');
  console.log(`Functions URL: ${FUNCTIONS_URL}\n`);

  await runTest('Cycle Verification', testCycleVerification);
  await runTest('Feed Monitoring', testFeedMonitoring);
  await runTest('24-Hour Feed Retrieval', test24HourFeed);
  await runTest('Trending Articles', testTrendingArticles);
  await runTest('Duplicate Detection', testDuplicateDetection);

  // Print summary
  console.log('\n📊 Test Summary\n');
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    console.log('Failed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
  }

  process.exit(failed > 0 ? 1 : 0);
}

runAllTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});

