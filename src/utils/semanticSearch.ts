/**
 * Semantic Search Utilities
 * Implements hybrid search combining keyword and semantic matching
 */

import type { Article } from '../types';

/**
 * Keyword search with fuzzy matching
 */
export function keywordSearch(
  articles: Article[],
  query: string,
  fields: (keyof Article)[] = ['title', 'description']
): Article[] {
  const lowerQuery = query.toLowerCase();
  const queryTerms = lowerQuery.split(/\s+/);

  return articles.filter(article => {
    return queryTerms.some(term => {
      return fields.some(field => {
        const value = article[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(term);
        }
        return false;
      });
    });
  });
}

/**
 * Tag-based filtering
 */
export function filterByTags(
  articles: Article[],
  filters: {
    lob?: string[];
    perils?: string[];
    regions?: string[];
    companies?: string[];
    trends?: string[];
  }
): Article[] {
  return articles.filter(article => {
    if (!article.tags) return true;

    if (filters.lob && filters.lob.length > 0) {
      if (!article.tags.lob?.some(tag => filters.lob!.includes(tag))) {
        return false;
      }
    }

    if (filters.perils && filters.perils.length > 0) {
      if (!article.tags.perils?.some(tag => filters.perils!.includes(tag))) {
        return false;
      }
    }

    if (filters.regions && filters.regions.length > 0) {
      if (!article.tags.regions?.some(tag => filters.regions!.includes(tag))) {
        return false;
      }
    }

    if (filters.companies && filters.companies.length > 0) {
      if (!article.tags.companies?.some(tag => filters.companies!.includes(tag))) {
        return false;
      }
    }

    if (filters.trends && filters.trends.length > 0) {
      if (!article.tags.trends?.some(tag => filters.trends!.includes(tag))) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Score-based filtering
 */
export function filterByScore(
  articles: Article[],
  minScore: number = 0,
  maxScore: number = 100
): Article[] {
  return articles.filter(article => {
    const score = article.smartScore || article.aiScore || 0;
    return score >= minScore && score <= maxScore;
  });
}

/**
 * Sentiment-based filtering
 */
export function filterBySentiment(
  articles: Article[],
  sentiments: string[]
): Article[] {
  return articles.filter(article => sentiments.includes(article.sentiment || ''));
}

/**
 * Risk pulse filtering
 */
export function filterByRiskPulse(
  articles: Article[],
  riskLevels: string[]
): Article[] {
  return articles.filter(article => riskLevels.includes(article.riskPulse || ''));
}

/**
 * Date range filtering
 */
export function filterByDateRange(
  articles: Article[],
  startDate?: Date,
  endDate?: Date
): Article[] {
  return articles.filter(article => {
    if (!article.publishedAt) return true;

    const pubDate = new Date(article.publishedAt);

    if (startDate && pubDate < startDate) return false;
    if (endDate && pubDate > endDate) return false;

    return true;
  });
}

/**
 * Hybrid search combining multiple strategies
 */
export function hybridSearch(
  articles: Article[],
  query: string,
  options: {
    keywordWeight?: number;
    scoreWeight?: number;
    recencyWeight?: number;
    filters?: {
      lob?: string[];
      perils?: string[];
      regions?: string[];
      minScore?: number;
      sentiment?: string[];
      riskPulse?: string[];
      dateRange?: { start?: Date; end?: Date };
    };
  } = {}
): Article[] {
  const {
    keywordWeight = 0.4,
    scoreWeight = 0.4,
    recencyWeight = 0.2,
    filters = {},
  } = options;

  // Apply filters first
  let filtered = articles;

  if (filters.lob || filters.perils || filters.regions) {
    filtered = filterByTags(filtered, {
      lob: filters.lob,
      perils: filters.perils,
      regions: filters.regions,
    });
  }

  if (filters.minScore !== undefined) {
    filtered = filterByScore(filtered, filters.minScore);
  }

  if (filters.sentiment) {
    filtered = filterBySentiment(filtered, filters.sentiment);
  }

  if (filters.riskPulse) {
    filtered = filterByRiskPulse(filtered, filters.riskPulse);
  }

  if (filters.dateRange) {
    filtered = filterByDateRange(
      filtered,
      filters.dateRange.start,
      filters.dateRange.end
    );
  }

  // Score results
  const now = Date.now();
  const scored = filtered.map(article => {
    // Keyword score (0-1)
    const keywordMatches = query
      .toLowerCase()
      .split(/\s+/)
      .filter(term => {
        const title = (article.title || '').toLowerCase();
        const desc = (article.description || '').toLowerCase();
        return title.includes(term) || desc.includes(term);
      }).length;
    const keywordScore = Math.min(keywordMatches / query.split(/\s+/).length, 1);

    // Relevance score (0-1)
    const relevanceScore = (article.smartScore || article.aiScore || 0) / 100;

    // Recency score (0-1)
    const pubDate = article.publishedAt ? new Date(article.publishedAt).getTime() : 0;
    const daysSince = (now - pubDate) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(1 - daysSince / 30, 0); // Decay over 30 days

    // Combined score
    const combinedScore =
      keywordScore * keywordWeight +
      relevanceScore * scoreWeight +
      recencyScore * recencyWeight;

    return { article, score: combinedScore };
  });

  // Sort by score and return
  return scored
    .sort((a, b) => b.score - a.score)
    .map(item => item.article);
}

/**
 * Expand search query with synonyms and related terms
 */
export function expandQuery(query: string): string[] {
  const synonyms: Record<string, string[]> = {
    'rate increase': ['rate hike', 'premium increase', 'rate adjustment'],
    'climate risk': ['climate change', 'weather risk', 'environmental risk'],
    'cyber': ['cybersecurity', 'data breach', 'ransomware'],
    'ai': ['artificial intelligence', 'machine learning', 'automation'],
    'florida': ['florida', 'fl', 'sunshine state'],
    'california': ['california', 'ca', 'golden state'],
    'property': ['property', 'homeowners', 'dwelling'],
    'auto': ['auto', 'automobile', 'vehicle', 'car'],
  };

  const expanded = [query];
  const lowerQuery = query.toLowerCase();

  for (const [key, values] of Object.entries(synonyms)) {
    if (lowerQuery.includes(key)) {
      values.forEach(value => {
        expanded.push(query.replace(key, value));
      });
    }
  }

  return [...new Set(expanded)];
}

/**
 * Get related articles based on tags
 */
export function getRelatedArticles(
  article: Article,
  allArticles: Article[],
  limit: number = 5
): Article[] {
  if (!article.tags) return [];

  const scored = allArticles
    .filter(a => a.url !== article.url)
    .map(a => {
      let score = 0;

      if (a.tags?.lob && article.tags?.lob) {
        score += a.tags.lob.filter(tag => article.tags!.lob!.includes(tag)).length * 3;
      }

      if (a.tags?.perils && article.tags?.perils) {
        score += a.tags.perils.filter(tag => article.tags!.perils!.includes(tag)).length * 2;
      }

      if (a.tags?.regions && article.tags?.regions) {
        score += a.tags.regions.filter(tag => article.tags!.regions!.includes(tag)).length * 2;
      }

      if (a.tags?.companies && article.tags?.companies) {
        score += a.tags.companies.filter(tag => article.tags!.companies!.includes(tag)).length;
      }

      return { article: a, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(item => item.article);
}

