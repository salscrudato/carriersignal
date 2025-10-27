/**
 * Advanced Scoring System
 * Incorporates recency, relevance, disaster correlation, weather correlation, and financial data
 */

export interface ScoringFactors {
  recencyScore: number;
  relevanceScore: number;
  disasterScore: number;
  weatherScore: number;
  financialScore: number;
  combinedScore: number;
}

/**
 * Calculate disaster correlation score
 * Articles about disasters in affected regions get boosted
 */
export function calculateDisasterScore(
  article: any,
  disasterCorrelations: Map<string, any[]>
): number {
  const disasters = disasterCorrelations.get(article.url) || [];

  if (disasters.length === 0) return 0;

  // Base score for disaster correlation
  let score = 3;

  // Boost for multiple disasters
  if (disasters.length > 1) score += 1;

  // Boost for recent disasters
  const recentDisasters = disasters.filter(d => {
    const daysSince = (Date.now() - new Date(d.declarationDate).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince < 7;
  });

  if (recentDisasters.length > 0) score += 2;

  return Math.min(10, score);
}

/**
 * Calculate weather correlation score
 * Articles about weather events get boosted
 */
export function calculateWeatherScore(
  article: any,
  weatherCorrelations: Map<string, any[]>
): number {
  const alerts = weatherCorrelations.get(article.url) || [];

  if (alerts.length === 0) return 0;

  // Base score for weather correlation
  let score = 2;

  // Boost for multiple alerts
  if (alerts.length > 1) score += 1;

  // Boost for severe weather
  const severeAlerts = alerts.filter(a => a.severity === 'Severe' || a.severity === 'Extreme');
  if (severeAlerts.length > 0) score += 2;

  return Math.min(10, score);
}

/**
 * Calculate financial health score
 * Articles about financially stressed companies get boosted
 */
export function calculateFinancialScore(
  article: any,
  secFilings: any[]
): number {
  const articleText = `${article.title} ${article.description}`.toLowerCase();

  // Keywords indicating financial stress
  const stressKeywords = [
    'bankruptcy',
    'insolvency',
    'financial stress',
    'liquidity',
    'capital',
    'reserve',
    'downgrade',
    'rating cut',
  ];

  let score = 0;
  for (const keyword of stressKeywords) {
    if (articleText.includes(keyword)) {
      score += 1;
    }
  }

  // Check if article mentions insurance companies with recent filings
  for (const filing of secFilings) {
    if (articleText.includes(filing.companyName.toLowerCase())) {
      score += 2;
      break;
    }
  }

  return Math.min(10, score);
}

/**
 * Calculate comprehensive combined score
 * Incorporates all factors with intelligent weighting
 */
export function calculateComprehensiveScore(
  _article: any,
  recencyScore: number,
  relevanceScore: number,
  disasterScore: number,
  weatherScore: number,
  financialScore: number
): number {
  // Base weights
  let recencyWeight = 0.35;
  let relevanceWeight = 0.35;
  let disasterWeight = 0.15;
  let weatherWeight = 0.10;
  let financialWeight = 0.05;

  // Adjust weights based on scores
  if (disasterScore > 5) {
    disasterWeight = 0.25;
    recencyWeight = 0.30;
    relevanceWeight = 0.30;
    weatherWeight = 0.10;
    financialWeight = 0.05;
  }

  if (weatherScore > 5) {
    weatherWeight = 0.20;
    recencyWeight = 0.30;
    relevanceWeight = 0.30;
    disasterWeight = 0.10;
    financialWeight = 0.10;
  }

  if (financialScore > 5) {
    financialWeight = 0.20;
    recencyWeight = 0.30;
    relevanceWeight = 0.30;
    disasterWeight = 0.10;
    weatherWeight = 0.10;
  }

  // Calculate weighted score
  const weighted =
    recencyScore * recencyWeight +
    relevanceScore * relevanceWeight +
    disasterScore * disasterWeight +
    weatherScore * weatherWeight +
    financialScore * financialWeight;

  // Apply exponential boosting
  const boosted = Math.pow(weighted / 10, 0.85) * 10;

  return Math.min(10, Math.max(1, boosted));
}

/**
 * Calculate all scoring factors for an article
 */
export function calculateAllScores(
  article: any,
  recencyScore: number,
  relevanceScore: number,
  disasterCorrelations: Map<string, any[]>,
  weatherCorrelations: Map<string, any[]>,
  secFilings: any[]
): ScoringFactors {
  const disasterScore = calculateDisasterScore(article, disasterCorrelations);
  const weatherScore = calculateWeatherScore(article, weatherCorrelations);
  const financialScore = calculateFinancialScore(article, secFilings);

  const combinedScore = calculateComprehensiveScore(
    article,
    recencyScore,
    relevanceScore,
    disasterScore,
    weatherScore,
    financialScore
  );

  return {
    recencyScore,
    relevanceScore,
    disasterScore,
    weatherScore,
    financialScore,
    combinedScore,
  };
}

/**
 * Identify high-risk articles
 * Articles with high disaster or weather scores
 */
export function identifyHighRiskArticles(articles: any[]): any[] {
  return articles
    .filter(a => (a.disasterScore || 0) > 5 || (a.weatherScore || 0) > 5)
    .sort((a, b) => (b.combinedScore || 0) - (a.combinedScore || 0))
    .slice(0, 10);
}

/**
 * Identify trending topics
 * Based on frequency of keywords in recent articles
 */
export function identifyTrendingTopics(articles: any[]): Map<string, number> {
  const keywords = new Map<string, number>();

  const insuranceKeywords = [
    'hurricane',
    'wildfire',
    'flood',
    'earthquake',
    'tornado',
    'hail',
    'cyber',
    'ransomware',
    'climate',
    'rate',
    'premium',
    'claim',
    'coverage',
    'policy',
  ];

  for (const item of articles.slice(0, 50)) {
    const text = `${item.title} ${item.description}`.toLowerCase();

    for (const keyword of insuranceKeywords) {
      if (text.includes(keyword)) {
        keywords.set(keyword, (keywords.get(keyword) || 0) + 1);
      }
    }
  }

  // Sort by frequency
  return new Map([...keywords.entries()].sort((a, b) => b[1] - a[1]));
}

