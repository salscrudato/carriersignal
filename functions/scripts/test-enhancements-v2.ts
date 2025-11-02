/**
 * Comprehensive Testing Suite for 12-Hour Cycle Enhancements V2
 * Tests all new endpoints and verifies 24-hour feed quality
 */

import axios from 'axios';

const BASE_URL = process.env.FUNCTIONS_URL || 'http://localhost:5001/carriersignal-app/us-central1';

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
    const duration = Date.now() - startTime;
    results.push({ name, passed: true, duration, details: 'Test passed' });
    console.log(`✅ ${name} (${duration}ms)`);
  } catch (error) {
    const duration = Date.now() - startTime;
    results.push({
      name,
      passed: false,
      duration,
      details: 'Test failed',
      error: error instanceof Error ? error.message : String(error),
    });
    console.log(`❌ ${name} (${duration}ms)`);
    console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// ============================================================================
// TEST SUITE
// ============================================================================

async function test24HourFeed(): Promise<void> {
  const response = await axios.get(`${BASE_URL}/get24HourFeedV3?hours=24&limit=100`);

  if (!response.data.success) throw new Error('Request failed');

  const feed = response.data.data;
  if (!feed.articles) throw new Error('No articles in response');
  if (feed.articles.length === 0) throw new Error('No articles found in 24-hour window');

  // Verify duplicate detection
  if (feed.duplicateRate === undefined) throw new Error('Missing duplicate rate');
  if (feed.duplicateRate > 0.5) throw new Error(`Duplicate rate too high: ${feed.duplicateRate}`);

  // Verify quality metrics
  if (feed.averageQualityScore === undefined) throw new Error('Missing quality score');
  if (feed.averageAIScore === undefined) throw new Error('Missing AI score');

  console.log(`   📰 Articles: ${feed.totalArticles} total, ${feed.uniqueArticles} unique`);
  console.log(`   🔄 Duplicate Rate: ${(feed.duplicateRate * 100).toFixed(2)}%`);
  console.log(`   ⭐ Quality Score: ${feed.averageQualityScore.toFixed(1)}/100`);
  console.log(`   🤖 AI Score: ${feed.averageAIScore.toFixed(1)}/100`);
}

async function testCycleHealthV2(): Promise<void> {
  const response = await axios.get(`${BASE_URL}/getCycleHealthV2`);

  if (!response.data.success) throw new Error('Request failed');

  const metrics = response.data.data;
  if (!metrics) {
    console.log('   ℹ️  No cycle health data available yet (expected on first run)');
    return;
  }

  if (!metrics.status) throw new Error('Missing status');
  if (!metrics.anomalies) throw new Error('Missing anomalies');
  if (!metrics.alerts) throw new Error('Missing alerts');

  console.log(`   📊 Status: ${metrics.status}`);
  console.log(`   📈 Articles Processed: ${metrics.articlesProcessed}`);
  console.log(`   🔄 Duplicate Rate: ${(metrics.duplicateRemovalRate * 100).toFixed(2)}%`);
  console.log(`   ⚠️  Anomalies: ${metrics.anomalies.length}`);
  console.log(`   🚨 Alerts: ${metrics.alerts.length}`);
}

async function testAdvancedScoring(): Promise<void> {
  // First, get an article ID
  const feedResponse = await axios.get(`${BASE_URL}/get24HourFeedV3?limit=1`);
  if (!feedResponse.data.data.articles || feedResponse.data.data.articles.length === 0) {
    throw new Error('No articles available for scoring test');
  }

  const articleId = feedResponse.data.data.articles[0].id;

  const response = await axios.get(`${BASE_URL}/getAdvancedArticleScore?articleId=${articleId}`);

  if (!response.data.success) throw new Error('Request failed');

  const score = response.data.data;
  if (!score.finalScore) throw new Error('Missing final score');
  if (!score.factors) throw new Error('Missing factors');
  if (!score.breakdown) throw new Error('Missing breakdown');

  console.log(`   📄 Article: ${articleId.substring(0, 8)}...`);
  console.log(`   🎯 Final Score: ${score.finalScore}/100`);
  console.log(`   📊 Recency: ${score.factors.recencyScore.toFixed(1)}`);
  console.log(`   💥 Impact: ${score.factors.impactScore.toFixed(1)}`);
  console.log(`   👥 Engagement: ${score.factors.engagementScore.toFixed(1)}`);
  console.log(`   📈 Trending: ${score.factors.trendingScore.toFixed(1)}`);
}

async function testDuplicateDetection(): Promise<void> {
  // Get an article
  const feedResponse = await axios.get(`${BASE_URL}/get24HourFeedV3?limit=1`);
  if (!feedResponse.data.data.articles || feedResponse.data.data.articles.length === 0) {
    throw new Error('No articles available for duplicate test');
  }

  const articleId = feedResponse.data.data.articles[0].id;

  const response = await axios.get(`${BASE_URL}/checkArticleDuplicates?articleId=${articleId}`);

  if (!response.data.success) throw new Error('Request failed');

  const result = response.data.data;
  if (result.isDuplicate === undefined) throw new Error('Missing isDuplicate flag');
  if (result.confidence === undefined) throw new Error('Missing confidence');

  console.log(`   📄 Article: ${articleId.substring(0, 8)}...`);
  console.log(`   🔍 Is Duplicate: ${result.isDuplicate ? 'Yes' : 'No'}`);
  console.log(`   📊 Confidence: ${(result.confidence * 100).toFixed(1)}%`);
  console.log(`   🏷️  Match Type: ${result.matchType || 'N/A'}`);
}

async function testCycleHealthHistory(): Promise<void> {
  const response = await axios.get(`${BASE_URL}/getCycleHealthHistory?days=7`);

  if (!response.data.success) throw new Error('Request failed');

  const data = response.data;
  if (data.cycleCount === undefined) throw new Error('Missing cycle count');
  if (!data.trends) throw new Error('Missing trends');

  console.log(`   📊 Cycles in past 7 days: ${data.cycleCount}`);
  console.log(`   ✅ Healthy Rate: ${(data.trends.avgStatus * 100).toFixed(1)}%`);
  console.log(`   🔄 Avg Duplicate Rate: ${(data.trends.avgDuplicateRate * 100).toFixed(2)}%`);
  console.log(`   ⭐ Avg Quality Score: ${data.trends.avgQualityScore.toFixed(1)}`);
}

async function testFeedQualityReport(): Promise<void> {
  const response = await axios.get(`${BASE_URL}/getFeedQualityReport?hours=24`);

  if (!response.data.success) throw new Error('Request failed');

  const report = response.data.data;
  if (!report.articleMetrics) throw new Error('Missing article metrics');
  if (!report.scoringMetrics) throw new Error('Missing scoring metrics');
  if (!report.recommendations) throw new Error('Missing recommendations');

  console.log(`   📰 Total Articles: ${report.articleMetrics.total}`);
  console.log(`   ✅ Unique Articles: ${report.articleMetrics.unique}`);
  console.log(`   🔄 Duplicate Rate: ${(report.articleMetrics.duplicateRate * 100).toFixed(2)}%`);
  console.log(`   ⭐ Avg Quality: ${report.scoringMetrics.avgQualityScore.toFixed(1)}`);
  console.log(`   🤖 Avg AI Score: ${report.scoringMetrics.avgAIScore.toFixed(1)}`);
  console.log(`   💡 Recommendations:`);
  report.recommendations.forEach((rec: string) => console.log(`      ${rec}`));
}

async function runAllTests(): Promise<void> {
  console.log('\n🧪 Testing 12-Hour Cycle Enhancements V2\n');
  console.log(`Functions URL: ${BASE_URL}\n`);
  console.log('='.repeat(70) + '\n');

  await runTest('24-Hour Feed with Duplicate Detection', test24HourFeed);
  await runTest('Cycle Health Metrics V2', testCycleHealthV2);
  await runTest('Advanced Article Scoring', testAdvancedScoring);
  await runTest('Duplicate Detection', testDuplicateDetection);
  await runTest('Cycle Health History', testCycleHealthHistory);
  await runTest('Feed Quality Report', testFeedQualityReport);

  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 Test Summary\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  console.log(`✅ Passed: ${passed}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  console.log(`⏱️  Total Duration: ${totalDuration}ms\n`);

  if (failed > 0) {
    console.log('Failed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  ❌ ${r.name}`);
      console.log(`     ${r.error}`);
    });
  }

  process.exit(failed > 0 ? 1 : 0);
}

runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

