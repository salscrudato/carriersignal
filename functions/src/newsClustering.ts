/**
 * News Clustering & Scoring
 * Groups similar articles and computes composite scores
 */

import { Firestore } from 'firebase-admin/firestore';

interface NewsArticle {
  id: string;
  title: string;
  canonicalLink: string;
  publishedAt: number;
  sourceId: string;
  states: string[];
  lobs: string[];
  carriers: string[];
  severity: number;
  actionability: string;
  confidence: number;
}

interface NewsCluster {
  id: string;
  clusterKey: string;
  articleIds: string[];
  primaryId: string;
  score: number;
  createdAt: number;
  updatedAt: number;
}

/**
 * Generate cluster key from article metadata
 * Used to group similar articles
 */
function generateClusterKey(article: NewsArticle): string {
  // Normalize title for clustering
  const titleNorm = article.title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3)
    .slice(0, 5)
    .join('_');

  // Include domain from link
  let domain = 'unknown';
  try {
    const url = new URL(article.canonicalLink);
    domain = url.hostname.replace('www.', '');
  } catch {
    // Ignore URL parsing errors
  }

  // Include primary state if available
  const state = article.states[0] || 'national';

  // Include date (day-level grouping)
  const date = new Date(article.publishedAt).toISOString().split('T')[0];

  return `${titleNorm}_${domain}_${state}_${date}`;
}

/**
 * Compute composite score for an article
 * v1 heuristic model
 */
function computeArticleScore(
  article: NewsArticle,
  sourceTrustScores: Record<string, number>,
  userWatchlist?: { carriers: Set<string>; states: Set<string>; topics: Set<string> }
): number {
  const now = Date.now();
  const ageHours = (now - article.publishedAt) / (1000 * 60 * 60);

  // Recency decay: exponential decay over 48 hours
  const recencyDecay = Math.exp(-ageHours / 48);
  const recencyScore = 100 * recencyDecay;

  // Source trust (0-100)
  const sourceTrust = sourceTrustScores[article.sourceId] || 50;

  // Impact score: severity × actionability
  const actionabilityWeight: Record<string, number> = {
    'Monitor': 0.5,
    'Review Portfolio': 0.75,
    'File Response': 1.0,
    'Client Advisory': 0.9,
  };
  const actionWeight = actionabilityWeight[article.actionability] || 0.5;
  const impactScore = 40 * (article.severity / 5) * actionWeight;

  // Watchlist match (0-25)
  let watchlistScore = 0;
  if (userWatchlist) {
    const carrierMatch = article.carriers.some(c => userWatchlist.carriers.has(c)) ? 1 : 0;
    const stateMatch = article.states.some(s => userWatchlist.states.has(s)) ? 1 : 0;
    watchlistScore = 25 * Math.max(carrierMatch, stateMatch);
  }

  // Confidence bonus (0-10)
  const confidenceBonus = 10 * article.confidence;

  // Composite score
  const score = recencyScore + sourceTrust * 0.25 + impactScore + watchlistScore + confidenceBonus;

  return Math.min(100, Math.max(0, score));
}

/**
 * Cluster articles by similarity
 * Groups articles with similar titles, domains, and dates
 */
export async function clusterArticles(
  db: Firestore,
  articles: NewsArticle[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _similarityThreshold: number = 0.7
): Promise<NewsCluster[]> {
  const clusters: Map<string, NewsArticle[]> = new Map();

  // Group by cluster key
  for (const article of articles) {
    const key = generateClusterKey(article);
    if (!clusters.has(key)) {
      clusters.set(key, []);
    }
    clusters.get(key)!.push(article);
  }

  // Merge similar clusters
  const mergedClusters: NewsCluster[] = [];
  const sourceTrustScores: Record<string, number> = {};

  // Fetch source trust scores
  const sourcesSnapshot = await db.collection('newsSources').get();
  for (const doc of sourcesSnapshot.docs) {
    const data = doc.data();
    sourceTrustScores[doc.id] = data.trustScore || 50;
  }

  for (const [clusterKey, clusterArticles] of clusters.entries()) {
    // Sort by score
    const scored = clusterArticles.map(a => ({
      article: a,
      score: computeArticleScore(a, sourceTrustScores),
    }));
    scored.sort((a, b) => b.score - a.score);

    const primaryArticle = scored[0].article;
    const clusterScore = scored[0].score;

    const cluster: NewsCluster = {
      id: `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      clusterKey,
      articleIds: clusterArticles.map(a => a.id),
      primaryId: primaryArticle.id,
      score: clusterScore,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    mergedClusters.push(cluster);
  }

  // Sort by score descending
  mergedClusters.sort((a, b) => b.score - a.score);

  return mergedClusters;
}

/**
 * Persist clusters to Firestore
 */
export async function persistClusters(db: Firestore, clusters: NewsCluster[]): Promise<void> {
  const batch = db.batch();

  for (const cluster of clusters) {
    const ref = db.collection('newsClusters').doc(cluster.id);
    batch.set(ref, cluster);
  }

  await batch.commit();
  console.log(`[CLUSTER] Persisted ${clusters.length} clusters`);
}

/**
 * Update article scores based on clustering
 */
export async function updateArticleScores(
  db: Firestore,
  clusters: NewsCluster[]
): Promise<void> {
  const batch = db.batch();

  for (const cluster of clusters) {
    for (const articleId of cluster.articleIds) {
      const ref = db.collection('newsArticles').doc(articleId);
      batch.update(ref, {
        clusterKey: cluster.clusterKey,
        score: cluster.score,
        updatedAt: Date.now(),
      });
    }
  }

  await batch.commit();
  console.log(`[CLUSTER] Updated scores for ${clusters.reduce((sum, c) => sum + c.articleIds.length, 0)} articles`);
}

