/**
 * Feed Sources Configuration
 * Maps feed URLs to display names and metadata
 */

export interface FeedSourceConfig {
  url: string;
  name: string;
  category: 'news' | 'regulatory' | 'catastrophe' | 'reinsurance' | 'technology';
  priority: number;
  color?: string; // Optional badge color
}

export const FEED_SOURCES: FeedSourceConfig[] = [
  // NEWS FEEDS
  {
    url: 'https://www.insurancejournal.com/rss/news/national/',
    name: 'Insurance Journal - National',
    category: 'news',
    priority: 1,
    color: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  {
    url: 'https://www.insurancejournal.com/rss/news/international/',
    name: 'Insurance Journal - International',
    category: 'news',
    priority: 2,
    color: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  {
    url: 'https://www.claimsjournal.com/rss/',
    name: 'Claims Journal',
    category: 'news',
    priority: 2,
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
  {
    url: 'https://www.riskandinsurance.com/feed/',
    name: 'Risk & Insurance',
    category: 'news',
    priority: 3,
    color: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  },
  {
    url: 'https://www.carriermanagement.com/feed/',
    name: 'Carrier Management',
    category: 'news',
    priority: 3,
    color: 'bg-teal-100 text-teal-800 border-teal-300',
  },
  {
    url: 'https://www.insurancebusinessmag.com/us/rss/',
    name: 'Insurance Business Mag',
    category: 'news',
    priority: 3,
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },

  // CATASTROPHE FEEDS
  {
    url: 'https://www.artemis.bm/news/catastrophe-bonds/feed/',
    name: 'Artemis - Catastrophe Bonds',
    category: 'catastrophe',
    priority: 1,
    color: 'bg-red-100 text-red-800 border-red-300',
  },
  {
    url: 'https://www.artemis.bm/feed/',
    name: 'Artemis - All News',
    category: 'catastrophe',
    priority: 2,
    color: 'bg-orange-100 text-orange-800 border-orange-300',
  },

  // REINSURANCE FEEDS
  {
    url: 'https://www.reinsurancene.ws/feed/',
    name: 'Reinsurance News',
    category: 'reinsurance',
    priority: 1,
    color: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  {
    url: 'https://www.artemis.bm/news/reinsurance-news/feed/',
    name: 'Artemis - Reinsurance',
    category: 'reinsurance',
    priority: 2,
    color: 'bg-violet-100 text-violet-800 border-violet-300',
  },

  // TECHNOLOGY FEEDS
  {
    url: 'https://www.insurancejournal.com/rss/news/',
    name: 'Insurance Journal - All News',
    category: 'technology',
    priority: 1,
    color: 'bg-pink-100 text-pink-800 border-pink-300',
  },
];

/**
 * Get feed source config by URL
 */
export function getFeedSourceByUrl(url: string): FeedSourceConfig | undefined {
  return FEED_SOURCES.find(feed => feed.url === url);
}

/**
 * Get feed source name by URL
 */
export function getFeedSourceName(url: string): string {
  const feed = getFeedSourceByUrl(url);
  return feed?.name || 'Unknown Source';
}

/**
 * Get feed source color by URL
 */
export function getFeedSourceColor(url: string): string {
  const feed = getFeedSourceByUrl(url);
  return feed?.color || 'bg-gray-100 text-gray-800 border-gray-300';
}

/**
 * Get all feed sources by category
 */
export function getFeedsByCategory(category: FeedSourceConfig['category']): FeedSourceConfig[] {
  return FEED_SOURCES.filter(feed => feed.category === category);
}

