/**
 * NewsAPI.org integration for CarrierSignal
 * Fetches insurance-related news from NewsAPI and normalizes to Article format
 */

import { z } from "zod";

const NEWSAPI_KEY = "15e136769e114bc6990a7af1eb78ba4b";
const NEWSAPI_BASE = "https://newsapi.org/v2";

/**
 * Insurance-specific keywords for filtering
 * Ensures we only get relevant P&C insurance news
 */
const INSURANCE_KEYWORDS = [
  "insurance",
  "underwriting",
  "claims",
  "premium",
  "policy",
  "carrier",
  "insurer",
  "reinsurance",
  "catastrophe",
  "peril",
  "risk management",
  "liability",
  "property damage",
  "casualty",
  "homeowners",
  "commercial",
  "workers compensation",
  "auto insurance",
  "flood insurance",
  "earthquake",
  "hurricane",
  "wildfire",
  "actuarial",
  "loss ratio",
  "combined ratio",
  "NAIC",
  "DOI",
  "insurance commissioner",
];

/**
 * NewsAPI article schema
 */
const NewsAPIArticleSchema = z.object({
  source: z.object({
    id: z.string().nullable(),
    name: z.string(),
  }),
  author: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  url: z.string().url(),
  urlToImage: z.string().url().nullable(),
  publishedAt: z.string(),
  content: z.string().nullable(),
});



/**
 * Normalized article format for CarrierSignal
 */
export interface NormalizedArticle {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  description?: string;
  content?: string;
  image?: string;
  origin: 'newsapi' | 'rss';
}

/**
 * Build insurance-focused search query
 * Uses multiple keywords to maximize relevance
 */
function buildInsuranceQuery(): string {
  // Use OR logic to catch any insurance-related article
  const query = INSURANCE_KEYWORDS.slice(0, 5).join(" OR ");
  return query;
}

/**
 * Fetch insurance news from NewsAPI
 * Implements pagination and filtering
 */
export async function fetchNewsAPIArticles(
  page: number = 1,
  pageSize: number = 100
): Promise<NormalizedArticle[]> {
  try {
    const query = buildInsuranceQuery();
    const sortBy = "publishedAt"; // Most recent first
    const language = "en";

    const url = new URL(`${NEWSAPI_BASE}/everything`);
    url.searchParams.append("q", query);
    url.searchParams.append("sortBy", sortBy);
    url.searchParams.append("language", language);
    url.searchParams.append("page", page.toString());
    url.searchParams.append("pageSize", pageSize.toString());
    url.searchParams.append("apiKey", NEWSAPI_KEY);

    console.log(`[NEWSAPI] Fetching page ${page} with query: "${query}"`);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== "ok") {
      throw new Error(`NewsAPI error: ${data.message}`);
    }

    // Validate and normalize articles
    const articles: NormalizedArticle[] = [];
    for (const article of data.articles || []) {
      try {
        const validated = NewsAPIArticleSchema.parse(article);
        
        // Additional insurance relevance check
        const text = `${validated.title} ${validated.description || ''}`.toLowerCase();
        const isRelevant = INSURANCE_KEYWORDS.some(keyword => text.includes(keyword));
        
        if (isRelevant) {
          articles.push({
            title: validated.title,
            url: validated.url,
            source: validated.source.name,
            publishedAt: validated.publishedAt,
            description: validated.description || undefined,
            content: validated.content || undefined,
            image: validated.urlToImage || undefined,
            origin: 'newsapi',
          });
        }
      } catch (e) {
        console.warn('[NEWSAPI] Skipping invalid article:', e);
      }
    }

    console.log(`[NEWSAPI] Fetched ${articles.length} relevant articles from page ${page}`);
    return articles;
  } catch (error) {
    console.error('[NEWSAPI ERROR]', error);
    throw error;
  }
}

/**
 * Fetch multiple pages of insurance news
 * Useful for initial bulk load
 */
export async function fetchNewsAPIBulk(pages: number = 3): Promise<NormalizedArticle[]> {
  const allArticles: NormalizedArticle[] = [];

  for (let page = 1; page <= pages; page++) {
    try {
      const articles = await fetchNewsAPIArticles(page, 100);
      allArticles.push(...articles);
      
      // Respect rate limits - NewsAPI free tier: 500 requests/day
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`[NEWSAPI] Error fetching page ${page}:`, error);
      // Continue with next page on error
    }
  }

  return allArticles;
}

/**
 * Search NewsAPI for specific insurance topics
 */
export async function searchNewsAPI(
  topic: string,
  pageSize: number = 50
): Promise<NormalizedArticle[]> {
  try {
    const query = `(${topic}) AND (${INSURANCE_KEYWORDS.slice(0, 3).join(" OR ")})`;
    
    const url = new URL(`${NEWSAPI_BASE}/everything`);
    url.searchParams.append("q", query);
    url.searchParams.append("sortBy", "publishedAt");
    url.searchParams.append("language", "en");
    url.searchParams.append("pageSize", pageSize.toString());
    url.searchParams.append("apiKey", NEWSAPI_KEY);

    console.log(`[NEWSAPI SEARCH] Searching for: "${topic}"`);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status}`);
    }

    const data = await response.json();
    if (data.status !== "ok") {
      throw new Error(`NewsAPI error: ${data.message}`);
    }

    const articles: NormalizedArticle[] = [];
    for (const article of data.articles || []) {
      try {
        const validated = NewsAPIArticleSchema.parse(article);
        articles.push({
          title: validated.title,
          url: validated.url,
          source: validated.source.name,
          publishedAt: validated.publishedAt,
          description: validated.description || undefined,
          content: validated.content || undefined,
          image: validated.urlToImage || undefined,
          origin: 'newsapi',
        });
      } catch (e) {
        console.warn('[NEWSAPI SEARCH] Skipping invalid article:', e);
      }
    }

    console.log(`[NEWSAPI SEARCH] Found ${articles.length} articles for "${topic}"`);
    return articles;
  } catch (error) {
    console.error('[NEWSAPI SEARCH ERROR]', error);
    throw error;
  }
}

