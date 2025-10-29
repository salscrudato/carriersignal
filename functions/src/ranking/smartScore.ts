/**
 * SmartScore Ranking System
 * Computes P&C-relevant article scores with feature extraction and MMR diversification
 */

export interface ScoreFeatures {
  recency: number; // 0-1: scaled by 48h half-life
  pcRelevance: number; // 0-1: from AI classifier
  sourceCredibility: number; // 0.7-1.1: multiplier
  entitySalience: number; // 0-1: presence of major carriers/reinsurers
  magnitude: number; // 0-1: concrete metrics present
  novelty: number; // 0-1: MMR diversity score
  engagementPrior: number; // 0-1: title quality heuristic
}

export interface SmartScoreResult {
  articleId: string;
  smartScore: number; // 0-100
  scoreFeatures: ScoreFeatures;
  explanation: string;
}

const MAJOR_ENTITIES = {
  carriers: [
    'State Farm', 'Progressive', 'GEICO', 'Allstate', 'Liberty Mutual',
    'Farmers', 'Nationwide', 'Travelers', 'American Family', 'Chubb',
    'The Hartford', 'AIG', 'Zurich', 'Allianz', 'AXA', 'Berkshire Hathaway'
  ],
  reinsurers: [
    'RenRe', 'Everest', 'PartnerRe', 'Axis', 'Endurance', 'Aspen',
    'Arch', 'Montpelier', 'Axis Capital', 'Aspen Insurance'
  ],
  regulators: [
    'NAIC', 'SEC', 'FEMA', 'HHS', 'DOJ', 'FTC', 'State Insurance Commissioner'
  ]
};

const SCORE_WEIGHTS = {
  recency: 0.15,
  pcRelevance: 0.30,
  sourceCredibility: 0.10,
  entitySalience: 0.15,
  magnitude: 0.10,
  novelty: 0.10,
  engagementPrior: 0.10,
};

/**
 * Calculate recency score with 48-hour half-life
 */
export function calculateRecencyScore(publishedAt: string | Date): number {
  const published = new Date(publishedAt);
  const now = new Date();
  const ageMs = now.getTime() - published.getTime();
  const ageHours = ageMs / (1000 * 60 * 60);
  
  // 48-hour half-life: score = 2^(-ageHours/48)
  const halfLife = 48;
  return Math.max(0, Math.pow(2, -ageHours / halfLife));
}

/**
 * Detect major entities in text
 */
export function detectEntitySalience(text: string): number {
  if (!text) return 0;
  
  const lowerText = text.toLowerCase();
  let entityCount = 0;
  
  for (const entity of [...MAJOR_ENTITIES.carriers, ...MAJOR_ENTITIES.reinsurers, ...MAJOR_ENTITIES.regulators]) {
    if (lowerText.includes(entity.toLowerCase())) {
      entityCount++;
    }
  }
  
  // Normalize: max 5 entities = 1.0
  return Math.min(entityCount / 5, 1.0);
}

/**
 * Detect concrete metrics (percentages, dollar amounts, ratios)
 */
export function detectMagnitude(text: string): number {
  if (!text) return 0;
  
  const patterns = [
    /\$[\d,]+(?:\.\d{2})?(?:\s*(?:million|billion|trillion|M|B|T))?/gi,
    /\d+(?:\.\d+)?%/g,
    /\d+(?:\.\d+)?x/g,
    /combined ratio|loss ratio|expense ratio/gi,
  ];
  
  let matches = 0;
  for (const pattern of patterns) {
    const found = text.match(pattern);
    matches += found ? found.length : 0;
  }
  
  // Normalize: 3+ metrics = 1.0
  return Math.min(matches / 3, 1.0);
}

/**
 * Title quality heuristic for engagement
 */
export function calculateEngagementPrior(title: string): number {
  if (!title) return 0.3;
  
  const length = title.length;
  const hasActionVerb = /^(breaking|new|exclusive|alert|warning|surge|plunge|soars|crashes|reveals|announces)/i.test(title);
  const hasBrand = /state farm|progressive|geico|allstate|travelers|chubb|aig|hartford/i.test(title);
  
  let score = 0.5;
  
  // Length heuristic: 40-85 chars is optimal
  if (length >= 40 && length <= 85) {
    score += 0.2;
  }
  
  if (hasActionVerb) score += 0.15;
  if (hasBrand) score += 0.15;
  
  return Math.min(score, 1.0);
}

/**
 * Compute SmartScore for an article
 */
export function computeSmartScore(
  articleId: string,
  title: string,
  content: string,
  publishedAt: string | Date,
  pcRelevance: number = 0.7,
  sourceCredibility: number = 1.0
): SmartScoreResult {
  const features: ScoreFeatures = {
    recency: calculateRecencyScore(publishedAt),
    pcRelevance: Math.max(0, Math.min(pcRelevance, 1.0)),
    sourceCredibility: Math.max(0.7, Math.min(sourceCredibility, 1.1)),
    entitySalience: detectEntitySalience(`${title} ${content}`),
    magnitude: detectMagnitude(content),
    novelty: 0.5, // Set by MMR during ranking
    engagementPrior: calculateEngagementPrior(title),
  };
  
  // Weighted sum
  const smartScore = Math.round(
    (features.recency * SCORE_WEIGHTS.recency +
     features.pcRelevance * SCORE_WEIGHTS.pcRelevance +
     features.sourceCredibility * SCORE_WEIGHTS.sourceCredibility +
     features.entitySalience * SCORE_WEIGHTS.entitySalience +
     features.magnitude * SCORE_WEIGHTS.magnitude +
     features.novelty * SCORE_WEIGHTS.novelty +
     features.engagementPrior * SCORE_WEIGHTS.engagementPrior) * 100
  );
  
  return {
    articleId,
    smartScore: Math.max(0, Math.min(smartScore, 100)),
    scoreFeatures: features,
    explanation: `Recency: ${(features.recency * 100).toFixed(0)}%, Relevance: ${(features.pcRelevance * 100).toFixed(0)}%, Entities: ${(features.entitySalience * 100).toFixed(0)}%`,
  };
}

/**
 * Rank articles with MMR (Maximal Marginal Relevance) diversification
 */
export function rankArticlesWithMMR(
  articles: Array<{ id: string; title: string; content: string; publishedAt: string; pcRelevance?: number }>,
  limit: number = 20,
  lambda: number = 0.7 // Balance between relevance (1.0) and diversity (0.0)
): string[] {
  if (articles.length === 0) return [];
  
  const scores = articles.map(a => 
    computeSmartScore(a.id, a.title, a.content, a.publishedAt, a.pcRelevance || 0.7)
  );
  
  const ranked: string[] = [];
  const remaining = new Set(scores.map(s => s.articleId));
  
  while (ranked.length < limit && remaining.size > 0) {
    let bestId = '';
    let bestScore = -Infinity;
    
    for (const id of remaining) {
      const score = scores.find(s => s.articleId === id)!.smartScore;
      
      // Calculate diversity penalty
      let diversityPenalty = 0;
      if (ranked.length > 0) {
        // Simple diversity: penalize if similar to already-ranked
        const rankedArticles = articles.filter(a => ranked.includes(a.id));
        const avgSimilarity = rankedArticles.reduce((sum, ra) => {
          const similarity = calculateSimilarity(
            `${articles.find(a => a.id === id)!.title} ${articles.find(a => a.id === id)!.content}`,
            `${ra.title} ${ra.content}`
          );
          return sum + similarity;
        }, 0) / rankedArticles.length;
        diversityPenalty = avgSimilarity;
      }
      
      const mmrScore = lambda * (score / 100) - (1 - lambda) * diversityPenalty;
      
      if (mmrScore > bestScore) {
        bestScore = mmrScore;
        bestId = id;
      }
    }
    
    if (bestId) {
      ranked.push(bestId);
      remaining.delete(bestId);
    } else {
      break;
    }
  }
  
  return ranked;
}

/**
 * Simple text similarity (Jaccard on words)
 */
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

