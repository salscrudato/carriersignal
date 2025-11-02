import Parser from 'rss-parser';

const parser = new Parser({ timeout: 5000 });

const feeds = [
  { url: "https://www.insurancejournal.com/rss/news/national/", name: "Insurance Journal - National" },
  { url: "https://www.insurancejournal.com/rss/news/international/", name: "Insurance Journal - International" },
  { url: "https://www.claimsjournal.com/rss/", name: "Claims Journal" },
  { url: "https://www.riskandinsurance.com/feed/", name: "Risk & Insurance" },
  { url: "https://www.carriermanagement.com/feed/", name: "Carrier Management" },
  { url: "https://www.insurancebusinessmag.com/us/rss/", name: "Insurance Business Mag" },
  { url: "https://www.artemis.bm/news/catastrophe-bonds/feed/", name: "Artemis - CAT Bonds" },
  { url: "https://www.artemis.bm/feed/", name: "Artemis - General" },
  { url: "https://www.reinsurancene.ws/feed/", name: "Reinsurance News" },
  { url: "https://www.artemis.bm/news/reinsurance-news/feed/", name: "Artemis - Reinsurance" },
];

async function testFeeds() {
  console.log("Testing RSS feeds...\n");
  for (const feed of feeds) {
    try {
      const start = Date.now();
      const result = await parser.parseURL(feed.url);
      const time = Date.now() - start;
      console.log(`✓ ${feed.name}: ${result.items?.length || 0} items (${time}ms)`);
    } catch (error: any) {
      console.log(`✗ ${feed.name}: ${error.message}`);
    }
  }
}

testFeeds();
