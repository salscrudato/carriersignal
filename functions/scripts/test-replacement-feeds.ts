/**
 * Test replacement feeds for broken sources
 */

import Parser from 'rss-parser';

const parser = new Parser();

const REPLACEMENT_FEEDS = [
  // Reinsurance replacement
  { url: "https://www.reinsurancene.ws/feed/", name: "Reinsurance News", category: 'reinsurance' },
  { url: "https://www.artemis.bm/news/reinsurance-news/feed/", name: "Artemis - Reinsurance", category: 'reinsurance' },
  
  // Catastrophe replacement
  { url: "https://www.artemis.bm/news/catastrophe-bonds/feed/", name: "Artemis - Catastrophe Bonds", category: 'catastrophe' },
  { url: "https://www.artemis.bm/feed/", name: "Artemis - All News", category: 'catastrophe' },
  
  // Technology/InsurTech replacement
  { url: "https://www.insurancebusinessmag.com/us/rss/", name: "Insurance Business Mag (Tech)", category: 'technology' },
  { url: "https://www.insurancejournal.com/rss/news/", name: "Insurance Journal (All)", category: 'technology' },
  
  // Regulatory replacement
  { url: "https://www.tdi.texas.gov/rss/", name: "Texas Department of Insurance", category: 'regulatory' },
  { url: "https://www.insurancenewsnet.com/feed/", name: "Insurance News Net", category: 'regulatory' },
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

async function testReplacementFeeds() {
  console.log('🔍 TESTING REPLACEMENT FEEDS\n');
  console.log('='.repeat(100));
  console.log('\nTesting replacement feed sources...\n');

  const results: Awaited<ReturnType<typeof testFeed>>[] = [];

  for (const feed of REPLACEMENT_FEEDS) {
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
  console.log('\n📊 SUMMARY BY CATEGORY\n');

  const byCategory = REPLACEMENT_FEEDS.reduce((acc, feed) => {
    if (!acc[feed.category]) acc[feed.category] = [];
    const result = results.find(r => r.url === feed.url);
    if (result) acc[feed.category].push(result);
    return acc;
  }, {} as Record<string, Awaited<ReturnType<typeof testFeed>>[]>);

  for (const [category, feeds] of Object.entries(byCategory)) {
    const working = feeds.filter(f => f.status === '✅');
    console.log(`\n${category.toUpperCase()} (${working.length}/${feeds.length} working):`);
    
    working.forEach(f => {
      console.log(`  ✅ ${f.name}`);
      console.log(`     URL: ${f.url}`);
      console.log(`     Items: ${f.itemCount}, Latest: ${f.hoursOld}h old\n`);
    });

    const failed = feeds.filter(f => f.status === '❌');
    if (failed.length > 0) {
      failed.forEach(f => {
        console.log(`  ❌ ${f.name}`);
        console.log(`     Error: ${f.error}\n`);
      });
    }
  }

  console.log('='.repeat(100));
  console.log('\n💡 RECOMMENDATIONS\n');
  
  const allWorking = results.filter(r => r.status === '✅');
  const allFailed = results.filter(r => r.status === '❌');

  console.log(`Total Working: ${allWorking.length}/${REPLACEMENT_FEEDS.length}`);
  console.log(`Total Failed: ${allFailed.length}/${REPLACEMENT_FEEDS.length}\n`);

  if (allWorking.length > 0) {
    console.log('Best replacements by category:');
    const bestByCategory: Record<string, typeof results[0]> = {};
    
    allWorking.forEach(feed => {
      const category = REPLACEMENT_FEEDS.find(f => f.url === feed.url)?.category;
      if (category) {
        if (!bestByCategory[category] || feed.itemCount > bestByCategory[category].itemCount) {
          bestByCategory[category] = feed;
        }
      }
    });

    for (const [category, feed] of Object.entries(bestByCategory)) {
      console.log(`  ${category}: ${feed.name}`);
      console.log(`    ${feed.url}\n`);
    }
  }

  console.log('='.repeat(100) + '\n');
}

testReplacementFeeds().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

