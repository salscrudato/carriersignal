/**
 * Test regulatory feeds
 */

import Parser from 'rss-parser';

const parser = new Parser();

const REGULATORY_FEEDS = [
  { url: "https://oci.georgia.gov/rss/", name: "Georgia Office of Commissioner of Insurance" },
  { url: "https://insurance.delaware.gov/rss/", name: "Delaware Department of Insurance" },
  { url: "https://idoi.illinois.gov/rss/", name: "Illinois Department of Insurance" },
  { url: "https://www.nydfs.ny.gov/rss/", name: "New York Department of Financial Services" },
  { url: "https://www.dfs.ny.gov/rss/", name: "NY DFS (Alternative)" },
  { url: "https://www.insurance.ca.gov/rss/", name: "California Department of Insurance" },
  { url: "https://www.floir.com/rss/", name: "Florida Office of Insurance Regulation" },
];

async function testFeed(feedUrl: string, feedName: string) {
  try {
    const startTime = Date.now();
    const feed = await parser.parseURL(feedUrl);
    const duration = Date.now() - startTime;

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

async function testRegulatoryFeeds() {
  console.log('🔍 TESTING REGULATORY FEEDS\n');
  console.log('='.repeat(100));
  console.log('\nTesting state DOI and regulatory feeds...\n');

  const results: Awaited<ReturnType<typeof testFeed>>[] = [];

  for (const feed of REGULATORY_FEEDS) {
    process.stdout.write(`Testing ${feed.name}... `);
    const result = await testFeed(feed.url, feed.name);
    results.push(result);

    if (result.status === '✅') {
      console.log(`✅ (${result.itemCount} items, latest: ${result.hoursOld}h old, ${result.duration}ms)`);
    } else {
      console.log(`❌ ${result.error}`);
    }
  }

  console.log('\n' + '='.repeat(100));
  console.log('\n📊 RESULTS\n');

  const working = results.filter(r => r.status === '✅');
  const failed = results.filter(r => r.status === '❌');

  if (working.length > 0) {
    console.log(`✅ WORKING FEEDS (${working.length}/${REGULATORY_FEEDS.length}):\n`);
    working.forEach(r => {
      console.log(`   ${r.name}`);
      console.log(`   URL: ${r.url}`);
      console.log(`   Items: ${r.itemCount}, Latest: ${r.hoursOld}h old\n`);
    });
  }

  if (failed.length > 0) {
    console.log(`\n❌ FAILED FEEDS (${failed.length}/${REGULATORY_FEEDS.length}):\n`);
    failed.forEach(r => {
      console.log(`   ${r.name}`);
      console.log(`   Error: ${r.error}\n`);
    });
  }

  console.log('='.repeat(100) + '\n');
}

testRegulatoryFeeds().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

