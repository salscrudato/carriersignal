/**
 * Client-side scoring utilities for dynamic article ranking
 * Calculates real-time scores as articles age to ensure proper ranking
 */

import type { Article } from '../types';

/**
 * Calculate dynamic score for an article at query time
 * This ensures scores reflect current time and engagement metrics
 * 
 * @param article - Article with original scoring data
 * @returns Updated score reflecting current recency and engagement
 */
export function calculateDynamicArticleScore(article: Article): number {
  const now = Date.now();
  const pubDate = article.publishedAt ? new Date(article.publishedAt).getTime() : now;
  const ageHours = Math.max(0, (now - pubDate) / (1000 * 60 * 60));
  const ageDays = ageHours / 24;

  // Classify content type for appropriate decay curve
  const isCatastrophe = !!article.stormName || (article.impactBreakdown?.catastrophe ?? 0) > 50;
  const isRegulatory = article.regulatory || (article.tags?.regulations && article.tags.regulations.length > 0);
  const isEvergreen = article.isEvergreen || (article.tags?.trends?.length ?? 0) > 0;

  // DYNAMIC RECENCY DECAY: Different curves for different content types
  let recencyScore: number;
  
  if (isCatastrophe) {
    // Catastrophe news: High relevance for 72 hours, then gradual decay
    recencyScore = Math.max(0, 100 * Math.exp(-Math.pow(ageHours, 1.2) / 100));
  } else if (isRegulatory) {
    // Regulatory news: High relevance for 48 hours, then gradual decay
    recencyScore = Math.max(0, 100 * Math.exp(-Math.pow(ageHours, 1.1) / 80));
  } else if (isEvergreen) {
    // Evergreen content: Slow decay, maintains relevance for weeks
    recencyScore = Math.max(0, 100 * Math.exp(-ageHours / 240));
  } else {
    // General news: Fast decay, becomes less relevant quickly
    recencyScore = Math.max(0, 100 * Math.exp(-ageHours / 24));
  }

  // Get base impact score
  const impactBreakdown = article.impactBreakdown || {
    market: (article.impactScore || 50) * 0.25,
    regulatory: (article.impactScore || 50) * 0.25,
    catastrophe: (article.impactScore || 50) * 0.25,
    technology: (article.impactScore || 50) * 0.25,
  };

  // Weight different impact dimensions
  const weightedImpact =
    (impactBreakdown.market || 0) * 0.30 +
    (impactBreakdown.regulatory || 0) * 0.35 +
    (impactBreakdown.catastrophe || 0) * 0.25 +
    (impactBreakdown.technology || 0) * 0.10;

  // Calculate engagement boost
  let engagementBoost = 1.0;
  if (article.engagementMetrics) {
    const { clicks = 0, saves = 0, shares = 0, timeSpent = 0 } = article.engagementMetrics;
    const clickScore = Math.min(clicks / 100, 1.0) * 0.4;
    const saveScore = Math.min(saves / 50, 1.0) * 0.35;
    const shareScore = Math.min(shares / 20, 1.0) * 0.15;
    const timeScore = Math.min(timeSpent / 300, 1.0) * 0.10;
    const normalizedEngagement = clickScore + saveScore + shareScore + timeScore;
    engagementBoost = 1.0 + (normalizedEngagement * 0.15);
  }

  // Apply multipliers
  const riskPulseMultiplier =
    article.riskPulse === 'HIGH' ? 1.25 :
    article.riskPulse === 'MEDIUM' ? 1.10 :
    1.0;

  const regulatoryBoost = isRegulatory ? 1.20 : 1.0;

  const catPerils = ['Hurricane', 'Wildfire', 'Earthquake', 'Flood', 'Tornado', 'Severe Weather', 'Hail', 'Winter Storm', 'Convective Storm'];
  const hasCatPeril = article.tags?.perils?.some(p =>
    catPerils.some(cat => p.toLowerCase().includes(cat.toLowerCase()))
  ) || false;
  const catastropheBoost = article.stormName ? 1.30 : (hasCatPeril ? 1.15 : 1.0);

  const highValueTrends = [
    'Climate Risk', 'Social Inflation', 'GenAI', 'Litigation Funding',
    'Tort Reform', 'Rate Adequacy', 'Reinsurance', 'Capacity Constraints',
    'Nuclear Verdicts', 'Assignment of Benefits', 'Parametric Insurance'
  ];
  const hasHighValueTrend = article.tags?.trends?.some(t =>
    highValueTrends.some(hvt => t.toLowerCase().includes(hvt.toLowerCase()))
  ) || false;
  const trendBoost = hasHighValueTrend ? 1.10 : 1.0;

  const lobCount = article.tags?.lob?.length || 0;
  const lobBoost = lobCount >= 3 ? 1.08 : (lobCount >= 2 ? 1.04 : 1.0);

  // Dynamic weight adjustment based on age
  let recencyWeight = 0.35;
  let impactWeight = 0.65;
  
  if (ageDays < 1) {
    recencyWeight = 0.50;
    impactWeight = 0.50;
  } else if (ageDays > 7) {
    recencyWeight = 0.25;
    impactWeight = 0.75;
  }

  // Calculate final score
  const baseScore = (recencyScore * recencyWeight) + (weightedImpact * impactWeight);
  const dynamicScore = Math.min(100,
    baseScore *
    engagementBoost *
    riskPulseMultiplier *
    regulatoryBoost *
    catastropheBoost *
    trendBoost *
    lobBoost
  );

  return Math.round(dynamicScore * 10) / 10;
}

/**
 * Sort articles by dynamic score, recalculating scores in real-time
 * This ensures older articles naturally move down the feed
 * 
 * @param articles - Array of articles to sort
 * @returns Sorted articles with updated dynamic scores
 */
export function sortByDynamicScore(articles: Article[]): Article[] {
  return articles
    .map(article => ({
      ...article,
      dynamicScore: calculateDynamicArticleScore(article),
    }))
    .sort((a, b) => (b.dynamicScore || 0) - (a.dynamicScore || 0));
}

/**
 * Sort articles by recency (published date)
 * 
 * @param articles - Array of articles to sort
 * @returns Sorted articles by published date (newest first)
 */
export function sortByRecency(articles: Article[]): Article[] {
  return articles.sort((a, b) => {
    const getTime = (date: any) => {
      if (!date) return 0;
      if (date instanceof Date) return date.getTime();
      if (typeof date === 'object' && 'toDate' in date) return date.toDate().getTime();
      return new Date(date).getTime();
    };
    return getTime(b.publishedAt) - getTime(a.publishedAt);
  });
}

