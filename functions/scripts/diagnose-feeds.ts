/**
 * Diagnose feed health and connectivity
 * Tests all configured feeds to ensure they're working
 */

import Parser from 'rss-parser';

const parser = new Parser();

const FEEDS = [
  { url: "https://www.insurancejournal.com/rss/news/national/", name: "Insurance Journal - National", category: 'news' },
  { url: "https://www.insurancejournal.com/rss/news/international/", name: "Insurance Journal - International", category: 'news' },
  { url: "https://www.claimsjournal.com/rss/", name: "Claims Journal", category: 'news' },
  { url: "https://www.propertycasualty360.com/feed/", name: "Property Casualty 360", category: 'news' },
  { url: "https://www.riskandinsurance.com/feed/", name: "Risk & Insurance", category: 'news' },
  { url: "https://www.carriermanagement.com/feed/", name: "Carrier Management", category: 'news' },
  { url: "https://www.insurancebusinessmag.com/us/rss/", name: "Insurance Business Mag", category: 'news' },
  { url: "https://www.insurancenewsnet.com/feed/", name: "Insurance News Net", category: 'news' },
  { url: "https://www.naic.org/rss/", name: "NAIC", category: 'regulatory' },
  { url: "https://www.insurancejournal.com/rss/news/catastrophes/", name: "Insurance Journal - Catastrophes", category: 'catastrophe' },
  { url: "https://www.insurancejournal.com/rss/news/reinsurance/", name: "Insurance Journal - Reinsurance", category: 'reinsurance' },
  { url: "https://www.insurancejournal.com/rss/news/technology/", name: "Insurance Journal - Technology", category: 'technology' },
];

async function diagnoseFeed(feedUrl: string, feedName: string) {
  try {
    const startTime = Date.now();
    const feed = await parser.parseURL(feedUrl);
    const duration = Date.now() - startTime;

    // Get latest article date
    let latestDate: Date | null = null;
    if (feed.items && feed.items.length > 0) {
      const firstItem = feed.items[0];
      latestDate = firstItem.isoDate ? new Date(firstItem.isoDate) : null;
    }

    const hoursOld = latestDate ? Math.round((Date.now() - latestDate.getTime()) / (1000 * 60 * 60)) : null;

    return {
      name: feedName,
      url: feedUrl,
      status: '✅',
      itemCount: feed.items?.length || 0,
      latestArticle: latestDate?.toISOString() || 'N/A',
      hoursOld,
      duration,
      error: null,
    };
  } catch (error) {
    return {
      name: feedName,
      url: feedUrl,
      status: '❌',
      itemCount: 0,
      latestArticle: 'N/A',
      hoursOld: null,
      duration: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function diagnoseFeedsHealth() {
  console.log('🔍 FEED HEALTH DIAGNOSTIC\n');
  console.log('=' .repeat(100));
  console.log('\nTesting all configured feeds...\n');

  const results = [];
  let successCount = 0;
  let failureCount = 0;

  for (const feed of FEEDS) {
    process.stdout.write(`Testing ${feed.name}... `);
    const result = await diagnoseFeed(feed.url, feed.name);
    results.push(result);

    if (result.status === '✅') {
      console.log(`✅ (${result.itemCount} items, latest: ${result.hoursOld}h old, ${result.duration}ms)`);
      successCount++;
    } else {
      console.log(`❌ ${result.error}`);
      failureCount++;
    }
  }

  console.log('\n' + '='.repeat(100));
  console.log('\n📊 SUMMARY\n');
  console.log(`Total Feeds: ${FEEDS.length}`);
  console.log(`✅ Working: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);

  console.log('\n' + '='.repeat(100));
  console.log('\n📰 FEED STATUS DETAILS\n');

  // Group by status
  const working = results.filter(r => r.status === '✅');
  const failed = results.filter(r => r.status === '❌');

  if (working.length > 0) {
    console.log('✅ WORKING FEEDS:\n');
    working.forEach(r => {
      console.log(`   ${r.name}`);
      console.log(`      Items: ${r.itemCount}`);
      console.log(`      Latest: ${r.hoursOld}h old`);
      console.log(`      Response time: ${r.duration}ms\n`);
    });
  }

  if (failed.length > 0) {
    console.log('\n❌ FAILED FEEDS:\n');
    failed.forEach(r => {
      console.log(`   ${r.name}`);
      console.log(`      Error: ${r.error}\n`);
    });
  }

  // Check for stale feeds (no articles in 24+ hours)
  const staleFeed = working.filter(r => r.hoursOld && r.hoursOld > 24);
  if (staleFeed.length > 0) {
    console.log('\n⚠️  STALE FEEDS (no articles in 24+ hours):\n');
    staleFeed.forEach(r => {
      console.log(`   ${r.name} - ${r.hoursOld}h old\n`);
    });
  }

  console.log('='.repeat(100));
  console.log('\n💡 RECOMMENDATIONS:\n');

  if (failureCount > 0) {
    console.log(`1. ${failureCount} feed(s) are failing. Check network connectivity and feed URLs.`);
  }

  if (staleFeed.length > 0) {
    console.log(`2. ${staleFeed.length} feed(s) haven't published articles in 24+ hours.`);
    console.log('   These feeds may be inactive or have stopped publishing.');
  }

  if (successCount === FEEDS.length && staleFeed.length === 0) {
    console.log('✅ All feeds are working correctly and publishing recent articles!');
  }

  console.log('\n');
}

diagnoseFeedsHealth().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

