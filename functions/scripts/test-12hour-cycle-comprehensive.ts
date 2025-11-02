/**
 * Comprehensive 12-Hour Cycle Testing Script
 * Tests all aspects of the news feed update cycle
 */

import axios from 'axios';

const BASE_URL = process.env.FIREBASE_FUNCTIONS_URL || 'http://localhost:5001/carriersignal-app/us-central1';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  duration: number;
  details?: Record<string, unknown>;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<void>) {
  const startTime = Date.now();
  try {
    await fn();
    results.push({
      name,
      status: 'PASS',
      message: 'Test passed',
      duration: Date.now() - startTime,
    });
    console.log(`✅ ${name}`);
  } catch (error) {
    results.push({
      name,
      status: 'FAIL',
      message: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
    });
    console.log(`❌ ${name}: ${error instanceof Error ? error.message : error}`);
  }
}

async function runTests() {
  console.log('\n🧪 Comprehensive 12-Hour Cycle Tests\n');
  console.log('='.repeat(70));

  // Test 1: Cycle Dashboard
  await test('Cycle Dashboard - Get current status', async () => {
    const response = await axios.get(`${BASE_URL}/getCycleDashboard`);
    if (!response.data.success) throw new Error('Dashboard request failed');
    
    const dashboard = response.data.dashboard;
    if (!dashboard.cycleHealth) throw new Error('Missing cycle health');
    if (dashboard.cycleHealth.status === 'overdue') {
      throw new Error('Cycle is overdue - 12-hour update may have failed');
    }
  });

  // Test 2: Deduplication Report
  await test('Deduplication - Generate report', async () => {
    const response = await axios.get(`${BASE_URL}/getDeduplicationReport`);
    if (!response.data.success) throw new Error('Dedup report request failed');
    
    const report = response.data.report;
    if (report.duplicateRemovalRate > 0.2) {
      throw new Error(`High duplicate rate: ${(report.duplicateRemovalRate * 100).toFixed(2)}%`);
    }
  });

  // Test 3: 24-Hour Feed
  await test('24-Hour Feed - Retrieve articles', async () => {
    const response = await axios.get(`${BASE_URL}/get24HourFeedV2?hours=24&limit=50`);
    if (!response.data.success) throw new Error('Feed request failed');
    
    const summary = response.data.summary;
    if (summary.uniqueArticles === 0) {
      throw new Error('No articles found in past 24 hours');
    }
    if (summary.duplicatesDetected > summary.totalArticles * 0.3) {
      throw new Error('Duplicate detection rate too high');
    }
  });

  // Test 4: Trending Articles
  await test('Trending Articles - Get top articles', async () => {
    const response = await axios.get(`${BASE_URL}/getTrendingArticlesV2?limit=20&hours=24`);
    if (!response.data.success) throw new Error('Trending articles request failed');
    
    if (response.data.articles.length === 0) {
      throw new Error('No trending articles found');
    }
  });

  // Test 5: Feed Monitoring
  await test('Feed Monitoring - Check feed health', async () => {
    const response = await axios.get(`${BASE_URL}/getFeedMonitoring`);
    if (!response.data.success) throw new Error('Feed monitoring request failed');
    
    const summary = response.data.summary;
    if (summary.failedFeeds > summary.totalFeeds * 0.2) {
      throw new Error(`Too many failed feeds: ${summary.failedFeeds}/${summary.totalFeeds}`);
    }
  });

  // Test 6: Cycle Verification
  await test('Cycle Verification - Verify completion', async () => {
    const response = await axios.get(`${BASE_URL}/verifyCycleCompletion`);
    if (!response.data.success) throw new Error('Cycle verification failed');
    
    const verification = response.data.verification;
    if (!verification.bothPhasesCompleted) {
      throw new Error('Not all phases completed');
    }
  });

  // Test 7: System Health
  await test('System Health - Check overall status', async () => {
    const response = await axios.get(`${BASE_URL}/getSystemHealth`);
    if (!response.data.success) throw new Error('Health check failed');
    
    const health = response.data.health;
    if (health.status === 'unhealthy') {
      throw new Error('System health is unhealthy');
    }
  });

  // Test 8: Article Quality
  await test('Article Quality - Verify quality scores', async () => {
    const response = await axios.get(`${BASE_URL}/get24HourFeedV2?hours=24&limit=10`);
    if (!response.data.success) throw new Error('Feed request failed');
    
    const articles = response.data.articles;
    const avgScore = articles.reduce((sum: number, a: any) => sum + a.score, 0) / articles.length;
    if (avgScore < 50) {
      throw new Error(`Average article score too low: ${avgScore.toFixed(2)}`);
    }
  });

  // Test 9: No Duplicates in Feed
  await test('Duplicate Detection - Verify no duplicates in feed', async () => {
    const response = await axios.get(`${BASE_URL}/get24HourFeedV2?hours=24&limit=100`);
    if (!response.data.success) throw new Error('Feed request failed');
    
    const articles = response.data.articles;
    const urls = new Set<string>();
    
    for (const article of articles) {
      const normalizedUrl = article.url.toLowerCase().replace(/\?.*$/, '');
      if (urls.has(normalizedUrl)) {
        throw new Error(`Duplicate URL found: ${article.url}`);
      }
      urls.add(normalizedUrl);
    }
  });

  // Test 10: Feed Freshness
  await test('Feed Freshness - Verify recent articles', async () => {
    const response = await axios.get(`${BASE_URL}/get24HourFeedV2?hours=24&limit=50`);
    if (!response.data.success) throw new Error('Feed request failed');
    
    const articles = response.data.articles;
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const article of articles) {
      const age = now - new Date(article.publishedAt).getTime();
      if (age > maxAge) {
        throw new Error(`Article too old: ${(age / (60 * 60 * 1000)).toFixed(1)} hours`);
      }
    }
  });

  console.log('\n' + '='.repeat(70));
  console.log('\n📊 Test Summary\n');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warned = results.filter(r => r.status === 'WARN').length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warned: ${warned}`);
  console.log(`📈 Total: ${results.length}`);

  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  console.log(`⏱️  Total Duration: ${totalDuration}ms\n`);

  if (failed > 0) {
    console.log('Failed Tests:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  - ${r.name}: ${r.message}`);
    });
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

