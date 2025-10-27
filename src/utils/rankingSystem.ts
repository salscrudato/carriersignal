/**
 * Advanced AI Ranking System for CarrierSignal
 * 
 * Balances:
 * - Relevance (AI-generated relevance score)
 * - Newsworthiness (impact, regulatory, catastrophe signals)
 * - Recency (time decay function)
 * - User Feedback (thumbs up/down with light weighting)
 */

interface Article {
  url: string;
  title: string;
  publishedAt?: string;
  impactScore?: number;
  regulatory?: boolean;
  stormName?: string;
  aiScore?: number;
  source?: string;
  tags?: {
    lob?: string[];
    perils?: string[];
    regions?: string[];
    companies?: string[];
    trends?: string[];
    regulations?: string[];
  };
  userFeedback?: {
    thumbsUp: number;
    thumbsDown: number;
  };
}

interface RankedArticle extends Article {
  aiRankingScore: number;
  recencyScore: number;
  newsworthinessScore: number;
  userFeedbackScore: number;
  finalScore: number;
}

/**
 * Calculate recency score with time decay
 * Recent articles get higher scores, older articles decay exponentially
 */
function calculateRecencyScore(publishedAt?: string): number {
  if (!publishedAt) return 0;

  const now = Date.now();
  const publishedTime = new Date(publishedAt).getTime();
  const ageHours = (now - publishedTime) / (1000 * 60 * 60);

  // Exponential decay: fresh articles (0-1 hour) get 100, decays to 0 after 7 days
  const maxAge = 7 * 24; // 7 days in hours
  if (ageHours > maxAge) return 0;

  // Exponential decay function
  const decayFactor = Math.exp(-ageHours / (maxAge / 3));
  return Math.max(0, decayFactor * 100);
}

/**
 * Calculate newsworthiness score based on article signals
 * Enhanced with more signals for better relevance
 */
function calculateNewsworthinessScore(article: Article): number {
  let score = 0;

  // High impact articles (75+)
  if (article.impactScore && article.impactScore > 75) {
    score += 40;
  } else if (article.impactScore && article.impactScore > 50) {
    score += 20;
  }

  // Regulatory articles - very important for P&C professionals
  if (article.regulatory) {
    score += 35;
  }

  // Catastrophe/Storm articles - critical for risk management
  if (article.stormName) {
    score += 40;
  }

  // Multiple tags indicate comprehensive coverage
  const tagCount = (article.tags?.lob?.length || 0) +
                   (article.tags?.perils?.length || 0) +
                   (article.tags?.regions?.length || 0);
  if (tagCount >= 3) {
    score += 15;
  } else if (tagCount >= 2) {
    score += 8;
  }

  // Trending topics boost
  if (article.tags?.trends && article.tags.trends.length > 0) {
    score += 10;
  }

  // Company mentions (market-moving news)
  if (article.tags?.companies && article.tags.companies.length > 0) {
    score += 12;
  }

  return Math.min(score, 100);
}

/**
 * Calculate user feedback score
 * Light weighting: thumbs up/down have minimal impact on ranking
 */
function calculateUserFeedbackScore(article: Article): number {
  if (!article.userFeedback) return 50; // Neutral score

  const { thumbsUp = 0, thumbsDown = 0 } = article.userFeedback;
  const totalFeedback = thumbsUp + thumbsDown;

  if (totalFeedback === 0) return 50; // Neutral

  // Light weighting: feedback affects score by max ±10 points
  const feedbackRatio = (thumbsUp - thumbsDown) / totalFeedback;
  return 50 + feedbackRatio * 10;
}

/**
 * Calculate AI relevance score (normalized 0-100)
 */
function calculateAIRelevanceScore(article: Article): number {
  if (!article.aiScore) return 50;
  // Normalize aiScore to 0-100 range
  return Math.min(Math.max(article.aiScore, 0), 100);
}

/**
 * Main ranking function - calculates final score for an article
 */
export function calculateArticleRankingScore(article: Article): RankedArticle {
  const recencyScore = calculateRecencyScore(article.publishedAt);
  const newsworthinessScore = calculateNewsworthinessScore(article);
  const userFeedbackScore = calculateUserFeedbackScore(article);
  const aiRelevanceScore = calculateAIRelevanceScore(article);

  // Weighted combination for P&C insurance professionals:
  // - AI Relevance: 35% (core relevance to insurance)
  // - Newsworthiness: 35% (impact, regulatory, catastrophe - critical for decision-making)
  // - Recency: 20% (time decay - important but not dominant)
  // - User Feedback: 10% (light weighting - community signal)
  const finalScore =
    aiRelevanceScore * 0.35 +
    newsworthinessScore * 0.35 +
    recencyScore * 0.2 +
    userFeedbackScore * 0.1;

  return {
    ...article,
    aiRankingScore: aiRelevanceScore,
    recencyScore,
    newsworthinessScore,
    userFeedbackScore,
    finalScore: Math.round(finalScore * 100) / 100,
  };
}

/**
 * Rank articles by AI ranking score
 */
export function rankArticlesByAI(articles: Article[]): RankedArticle[] {
  return articles
    .map(calculateArticleRankingScore)
    .sort((a, b) => b.finalScore - a.finalScore);
}

/**
 * Rank articles by recency
 */
export function rankArticlesByRecency(articles: Article[]): RankedArticle[] {
  return articles
    .map(calculateArticleRankingScore)
    .sort((a, b) => {
      const dateA = new Date(a.publishedAt || 0).getTime();
      const dateB = new Date(b.publishedAt || 0).getTime();
      return dateB - dateA;
    });
}

/**
 * Record user feedback (thumbs up/down)
 */
export function recordUserFeedback(
  article: Article,
  feedback: 'up' | 'down'
): Article {
  const current = article.userFeedback || { thumbsUp: 0, thumbsDown: 0 };

  if (feedback === 'up') {
    current.thumbsUp += 1;
  } else {
    current.thumbsDown += 1;
  }

  return {
    ...article,
    userFeedback: current,
  };
}

