/**
 * Advanced AI Ranking System for CarrierSignal
 *
 * Composite Score (0-100) balancing:
 * - AI Relevance (40%): P&C-specific embeddings and keyword matches
 * - Newsworthiness (30%): Impact, regulatory, catastrophe signals
 * - Recency (15%): Time decay function with exponential decay
 * - User Feedback (5%): Thumbs up/down with Bayesian averaging
 * - RAG Quality (10%): Factual density and source credibility
 */

interface Article {
  url: string;
  title: string;
  publishedAt?: string;
  impactScore?: number;
  impactBreakdown?: {
    market?: number;
    regulatory?: number;
    catastrophe?: number;
    technology?: number;
  };
  regulatory?: boolean;
  stormName?: string;
  aiScore?: number;
  smartScore?: number;
  source?: string;
  ragQualityScore?: number; // RAG quality score 0-100
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
  ragQualityScore: number;
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
 * Enhanced with multi-dimensional P&C-specific signals
 */
function calculateNewsworthinessScore(article: Article): number {
  let score = 0;

  // Impact breakdown scoring (regulatory, catastrophe, market, technology)
  if (article.impactBreakdown) {
    const { regulatory = 0, catastrophe = 0, market = 0, technology = 0 } = article.impactBreakdown;

    // Regulatory impact - highest priority for P&C professionals
    if (regulatory > 75) score += 25;
    else if (regulatory > 50) score += 15;
    else if (regulatory > 25) score += 8;

    // Catastrophe impact - critical for risk management
    if (catastrophe > 75) score += 25;
    else if (catastrophe > 50) score += 15;
    else if (catastrophe > 25) score += 8;

    // Market impact - affects pricing and competition
    if (market > 75) score += 15;
    else if (market > 50) score += 10;

    // Technology impact - affects operations and innovation
    if (technology > 75) score += 10;
    else if (technology > 50) score += 5;
  } else if (article.impactScore) {
    // Fallback to overall impact score
    if (article.impactScore > 75) score += 30;
    else if (article.impactScore > 50) score += 15;
  }

  // Regulatory articles - very important for P&C professionals
  if (article.regulatory) {
    score += 20;
  }

  // Catastrophe/Storm articles - critical for risk management
  if (article.stormName) {
    score += 25;
  }

  // Regulation tags - specific regulatory mentions
  if (article.tags?.regulations && article.tags.regulations.length > 0) {
    score += 15;
  }

  // Multiple tags indicate comprehensive coverage
  const tagCount = (article.tags?.lob?.length || 0) +
                   (article.tags?.perils?.length || 0) +
                   (article.tags?.regions?.length || 0);
  if (tagCount >= 4) {
    score += 12;
  } else if (tagCount >= 3) {
    score += 8;
  } else if (tagCount >= 2) {
    score += 4;
  }

  // Trending topics boost - market trends are important
  if (article.tags?.trends && article.tags.trends.length > 0) {
    score += 8;
  }

  // Company mentions (market-moving news)
  if (article.tags?.companies && article.tags.companies.length > 0) {
    score += 10;
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
 * Calculate RAG quality score (normalized 0-100)
 * Higher quality articles are better for retrieval-augmented generation
 */
function calculateRAGQualityScore(article: Article): number {
  if (!article.ragQualityScore) return 70; // Default to acceptable quality
  // Normalize ragQualityScore to 0-100 range
  const normalized = Math.min(Math.max(article.ragQualityScore, 0), 100);
  // Apply slight boost for high-quality articles (>80)
  if (normalized >= 80) {
    return Math.min(normalized * 1.05, 100);
  }
  return normalized;
}

/**
 * Main ranking function - calculates final score for an article
 * Composite score (0-100) for P&C insurance professionals
 */
export function calculateArticleRankingScore(article: Article): RankedArticle {
  const recencyScore = calculateRecencyScore(article.publishedAt);
  const newsworthinessScore = calculateNewsworthinessScore(article);
  const userFeedbackScore = calculateUserFeedbackScore(article);
  const aiRelevanceScore = calculateAIRelevanceScore(article);
  const ragQualityScore = calculateRAGQualityScore(article);

  // Weighted combination for P&C insurance professionals:
  // - AI Relevance: 40% (core relevance to insurance domain)
  // - Newsworthiness: 30% (impact, regulatory, catastrophe - critical for decision-making)
  // - Recency: 15% (time decay - important but not dominant)
  // - RAG Quality: 10% (article quality for retrieval - ensures good context)
  // - User Feedback: 5% (light weighting - community signal)
  const finalScore =
    aiRelevanceScore * 0.40 +
    newsworthinessScore * 0.30 +
    recencyScore * 0.15 +
    ragQualityScore * 0.10 +
    userFeedbackScore * 0.05;

  return {
    ...article,
    aiRankingScore: aiRelevanceScore,
    recencyScore,
    newsworthinessScore,
    userFeedbackScore,
    ragQualityScore,
    smartScore: Math.round(finalScore * 100) / 100,
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



