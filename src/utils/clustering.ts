/**
 * Article Clustering Utilities
 * Groups related articles by topic, trend, or event
 */

import type { Article } from '../types';

export interface ArticleCluster {
  id: string;
  name: string;
  description: string;
  articles: Article[];
  tags: {
    lob?: string[];
    perils?: string[];
    regions?: string[];
    companies?: string[];
    trends?: string[];
    regulations?: string[];
  };
  score: number;
  createdAt: Date;
}

/**
 * Calculate similarity between two articles (0-1)
 */
function calculateSimilarity(article1: Article, article2: Article): number {
  let similarity = 0;
  let factors = 0;

  // Title similarity (simple substring matching)
  const title1 = (article1.title || '').toLowerCase();
  const title2 = (article2.title || '').toLowerCase();
  const titleWords1 = title1.split(/\s+/);
  const titleWords2 = title2.split(/\s+/);
  const commonWords = titleWords1.filter(word => titleWords2.includes(word)).length;
  similarity += commonWords / Math.max(titleWords1.length, titleWords2.length);
  factors++;

  // Tag similarity
  if (article1.tags && article2.tags) {
    let tagMatches = 0;
    let tagTotal = 0;

    if (article1.tags.lob && article2.tags.lob) {
      const matches = article1.tags.lob.filter(tag => article2.tags!.lob!.includes(tag)).length;
      tagMatches += matches;
      tagTotal += Math.max(article1.tags.lob.length, article2.tags.lob.length);
    }

    if (article1.tags.perils && article2.tags.perils) {
      const matches = article1.tags.perils.filter(tag => article2.tags!.perils!.includes(tag)).length;
      tagMatches += matches;
      tagTotal += Math.max(article1.tags.perils.length, article2.tags.perils.length);
    }

    if (article1.tags.regions && article2.tags.regions) {
      const matches = article1.tags.regions.filter(tag => article2.tags!.regions!.includes(tag)).length;
      tagMatches += matches;
      tagTotal += Math.max(article1.tags.regions.length, article2.tags.regions.length);
    }

    if (tagTotal > 0) {
      similarity += tagMatches / tagTotal;
      factors++;
    }
  }

  // Source similarity
  if (article1.source === article2.source) {
    similarity += 0.2;
    factors++;
  }

  // Sentiment similarity
  if (article1.sentiment === article2.sentiment) {
    similarity += 0.1;
    factors++;
  }

  return factors > 0 ? similarity / factors : 0;
}

/**
 * Cluster articles using simple agglomerative clustering
 */
export function clusterArticles(
  articles: Article[],
  similarityThreshold: number = 0.5
): ArticleCluster[] {
  if (articles.length === 0) return [];

  // Initialize clusters with single articles
  const clusters: ArticleCluster[] = articles.map((article, index) => ({
    id: `cluster-${index}`,
    name: article.title || 'Untitled',
    description: article.description || '',
    articles: [article],
    tags: article.tags || {},
    score: article.smartScore || 0,
    createdAt: new Date(),
  }));

  // Merge similar clusters
  let merged = true;
  while (merged) {
    merged = false;

    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        // Calculate cluster similarity (average of article similarities)
        let totalSimilarity = 0;
        let comparisons = 0;

        for (const article1 of clusters[i].articles) {
          for (const article2 of clusters[j].articles) {
            totalSimilarity += calculateSimilarity(article1, article2);
            comparisons++;
          }
        }

        const avgSimilarity = totalSimilarity / comparisons;

        if (avgSimilarity >= similarityThreshold) {
          // Merge clusters
          const mergedCluster: ArticleCluster = {
            id: `cluster-${i}-${j}`,
            name: clusters[i].name, // Use first cluster's name
            description: clusters[i].description,
            articles: [...clusters[i].articles, ...clusters[j].articles],
            tags: mergeTags(clusters[i].tags || {}, clusters[j].tags || {}),
            score: Math.max(clusters[i].score, clusters[j].score),
            createdAt: new Date(),
          };

          clusters.splice(j, 1);
          clusters[i] = mergedCluster;
          merged = true;
          break;
        }
      }
      if (merged) break;
    }
  }

  // Sort by score
  return clusters.sort((a, b) => b.score - a.score);
}

/**
 * Merge tags from two clusters
 */
function mergeTags(
  tags1: Article['tags'] | undefined,
  tags2: Article['tags'] | undefined
): {
  lob?: string[];
  perils?: string[];
  regions?: string[];
  companies?: string[];
  trends?: string[];
  regulations?: string[];
} {
  if (!tags1 && !tags2) return {};
  if (!tags1) return tags2 || {};
  if (!tags2) return tags1 || {};

  return {
    lob: [...new Set([...(tags1.lob || []), ...(tags2.lob || [])])],
    perils: [...new Set([...(tags1.perils || []), ...(tags2.perils || [])])],
    regions: [...new Set([...(tags1.regions || []), ...(tags2.regions || [])])],
    companies: [...new Set([...(tags1.companies || []), ...(tags2.companies || [])])],
    trends: [...new Set([...(tags1.trends || []), ...(tags2.trends || [])])],
    regulations: [...new Set([...(tags1.regulations || []), ...(tags2.regulations || [])])],
  };
}

/**
 * Group articles by tag
 */
export function groupByTag(
  articles: Article[],
  tagType: 'lob' | 'perils' | 'regions' | 'companies' | 'trends'
): Map<string, Article[]> {
  const groups = new Map<string, Article[]>();

  articles.forEach(article => {
    const tags = article.tags?.[tagType] || [];
    tags.forEach(tag => {
      if (!groups.has(tag)) {
        groups.set(tag, []);
      }
      groups.get(tag)!.push(article);
    });
  });

  return groups;
}

/**
 * Detect trending topics
 */
export function detectTrends(
  articles: Article[],
  timeWindowDays: number = 7
): Array<{ trend: string; count: number; articles: Article[] }> {
  const now = Date.now();
  const cutoff = now - timeWindowDays * 24 * 60 * 60 * 1000;

  const recentArticles = articles.filter(article => {
    if (!article.publishedAt) return false;
    return new Date(article.publishedAt).getTime() > cutoff;
  });

  const trendMap = new Map<string, Article[]>();

  recentArticles.forEach(article => {
    const trends = article.tags?.trends || [];
    trends.forEach(trend => {
      if (!trendMap.has(trend)) {
        trendMap.set(trend, []);
      }
      trendMap.get(trend)!.push(article);
    });
  });

  return Array.from(trendMap.entries())
    .map(([trend, articles]) => ({
      trend,
      count: articles.length,
      articles,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Find articles related to a specific event
 */
export function findEventArticles(
  articles: Article[],
  eventName: string
): Article[] {
  const lowerEvent = eventName.toLowerCase();

  return articles.filter(article => {
    const title = (article.title || '').toLowerCase();
    const description = (article.description || '').toLowerCase();
    const stormName = (article.stormName || '').toLowerCase();

    return (
      title.includes(lowerEvent) ||
      description.includes(lowerEvent) ||
      stormName.includes(lowerEvent)
    );
  });
}

/**
 * Calculate cluster statistics
 */
export function getClusterStats(clusters: ArticleCluster[]) {
  return {
    totalClusters: clusters.length,
    totalArticles: clusters.reduce((sum, c) => sum + c.articles.length, 0),
    avgClusterSize: clusters.reduce((sum, c) => sum + c.articles.length, 0) / clusters.length,
    largestCluster: Math.max(...clusters.map(c => c.articles.length)),
    avgScore: clusters.reduce((sum, c) => sum + c.score, 0) / clusters.length,
  };
}

