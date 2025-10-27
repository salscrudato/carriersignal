/**
 * RSS Feed Parser Utility
 * Parses RSS feeds from insurance news sources
 */

export interface RSSArticle {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  guid?: string;
}

/**
 * Parse RSS feed XML and extract articles
 */
export async function parseRSSFeed(feedUrl: string, sourceName: string): Promise<RSSArticle[]> {
  try {
    const response = await fetch(feedUrl);
    if (!response.ok) {
      console.error(`Failed to fetch RSS feed from ${sourceName}: ${response.statusText}`);
      return [];
    }

    const text = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');

    // Check for parsing errors
    if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
      console.error(`Failed to parse RSS feed from ${sourceName}`);
      return [];
    }

    const items = xmlDoc.getElementsByTagName('item');
    const articles: RSSArticle[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      const title = item.getElementsByTagName('title')[0]?.textContent || '';
      const link = item.getElementsByTagName('link')[0]?.textContent || '';
      const description = item.getElementsByTagName('description')[0]?.textContent || '';
      const pubDate = item.getElementsByTagName('pubDate')[0]?.textContent || new Date().toISOString();
      const guid = item.getElementsByTagName('guid')[0]?.textContent || link;

      if (title && link) {
        articles.push({
          title,
          link,
          description: stripHtml(description),
          pubDate,
          source: sourceName,
          guid,
        });
      }
    }

    return articles;
  } catch (error) {
    console.error(`Error parsing RSS feed from ${sourceName}:`, error);
    return [];
  }
}

/**
 * Strip HTML tags from text
 */
function stripHtml(html: string): string {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

/**
 * Fetch all RSS feeds in parallel
 */
export async function fetchAllRSSFeeds(): Promise<RSSArticle[]> {
  const feeds = [
    {
      url: 'https://www.insurancejournal.com/rss/news',
      name: 'Insurance Journal',
    },
    {
      url: 'https://www.propertycasualty360.com/feed/',
      name: 'Property Casualty 360',
    },
    {
      url: 'https://insurancenewsnet.com/feed/',
      name: 'InsuranceNewsNet',
    },
    {
      url: 'https://web.ambest.com/news/rss',
      name: 'A.M. Best',
    },
    {
      url: 'https://www.artemis.bm/news/feed/',
      name: 'Artemis.bm',
    },
  ];

  const results = await Promise.all(
    feeds.map(feed => parseRSSFeed(feed.url, feed.name))
  );

  return results.flat();
}

/**
 * Deduplicate articles by URL
 */
export function deduplicateArticles(articles: RSSArticle[]): RSSArticle[] {
  const seen = new Set<string>();
  const unique: RSSArticle[] = [];

  for (const article of articles) {
    if (!seen.has(article.link)) {
      seen.add(article.link);
      unique.push(article);
    }
  }

  return unique;
}

/**
 * Sort articles by publication date (newest first)
 */
export function sortArticlesByDate(articles: RSSArticle[]): RSSArticle[] {
  return articles.sort((a, b) => {
    const dateA = new Date(a.pubDate).getTime();
    const dateB = new Date(b.pubDate).getTime();
    return dateB - dateA;
  });
}

/**
 * Convert RSS articles to Article format
 */
export function convertRSSToArticles(rssArticles: RSSArticle[]): any[] {
  return rssArticles.map(rss => ({
    title: rss.title,
    url: rss.link,
    source: rss.source,
    publishedAt: rss.pubDate,
    description: rss.description,
    content: rss.description,
  }));
}

