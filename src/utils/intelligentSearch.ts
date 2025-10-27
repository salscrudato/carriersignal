/**
 * Intelligent Search Engine for CarrierSignal
 * 
 * Features:
 * - Fuzzy matching (typo tolerance)
 * - Semantic understanding (synonyms, related terms)
 * - Multi-field search (title, description, tags)
 * - Relevance scoring with multiple factors
 * - Real-time filtering with debouncing
 */

interface Article {
  title: string;
  url: string;
  source: string;
  publishedAt?: string;
  description?: string;
  bullets5?: string[];
  tags?: {
    lob?: string[];
    perils?: string[];
    regions?: string[];
    companies?: string[];
    trends?: string[];
    regulations?: string[];
  };
  smartScore?: number;
  aiScore?: number;
  impactScore?: number;
  regulatory?: boolean;
  stormName?: string;
}

interface SearchResult {
  article: Article;
  score: number;
  matchType: 'exact' | 'fuzzy' | 'semantic' | 'tag' | 'combined';
  highlights: string[];
}

/**
 * Insurance domain synonyms and related terms
 * Enables semantic search understanding
 */
const INSURANCE_SYNONYMS: Record<string, string[]> = {
  'hurricane': ['tropical storm', 'cyclone', 'typhoon', 'wind damage', 'coastal'],
  'wildfire': ['forest fire', 'brush fire', 'fire damage', 'california', 'oregon'],
  'earthquake': ['seismic', 'temblor', 'ground shaking', 'california', 'fault'],
  'flood': ['water damage', 'inundation', 'precipitation', 'rain', 'storm surge'],
  'claim': ['loss', 'damage', 'incident', 'event', 'payout'],
  'premium': ['rate', 'price', 'cost', 'fee', 'charge'],
  'underwriting': ['underwriter', 'underwrite', 'risk assessment', 'approval'],
  'policy': ['coverage', 'contract', 'agreement', 'terms'],
  'carrier': ['insurer', 'insurance company', 'provider'],
  'catastrophe': ['cat', 'disaster', 'major loss', 'natural disaster'],
  'regulatory': ['compliance', 'regulation', 'doi', 'commissioner', 'filing'],
  'rate increase': ['rate hike', 'premium increase', 'price increase'],
  'market': ['industry', 'sector', 'business'],
};

/**
 * Levenshtein distance for fuzzy matching
 * Measures string similarity (0-1, where 1 is identical)
 */
function levenshteinSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  if (s1 === s2) return 1;
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1;
  
  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calculate edit distance between two strings
 */
function getEditDistance(s1: string, s2: string): number {
  const costs: number[] = [];
  
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  
  return costs[s2.length];
}

/**
 * Expand search query with semantic synonyms
 */
function expandQueryWithSynonyms(query: string): string[] {
  const terms = query.toLowerCase().split(/\s+/);
  const expanded = new Set<string>(terms);
  
  for (const term of terms) {
    if (INSURANCE_SYNONYMS[term]) {
      INSURANCE_SYNONYMS[term].forEach(syn => expanded.add(syn));
    }
  }
  
  return Array.from(expanded);
}

/**
 * Score article based on search query
 */
function scoreArticle(article: Article, query: string, expandedTerms: string[]): number {
  let score = 0;
  const queryLower = query.toLowerCase();
  const titleLower = article.title.toLowerCase();
  const descLower = (article.description || '').toLowerCase();
  const bulletsText = (article.bullets5 || []).join(' ').toLowerCase();
  
  // Exact match in title (highest weight)
  if (titleLower.includes(queryLower)) {
    score += 100;
  }
  
  // Fuzzy match in title
  const titleFuzzy = levenshteinSimilarity(titleLower, queryLower);
  score += titleFuzzy * 80;
  
  // Expanded terms in title
  for (const term of expandedTerms) {
    if (titleLower.includes(term)) {
      score += 40;
    }
  }
  
  // Exact match in description
  if (descLower.includes(queryLower)) {
    score += 50;
  }
  
  // Expanded terms in description
  for (const term of expandedTerms) {
    if (descLower.includes(term)) {
      score += 20;
    }
  }
  
  // Expanded terms in bullets
  for (const term of expandedTerms) {
    if (bulletsText.includes(term)) {
      score += 15;
    }
  }
  
  // Tag matching
  const allTags = [
    ...(article.tags?.lob || []),
    ...(article.tags?.perils || []),
    ...(article.tags?.regions || []),
    ...(article.tags?.companies || []),
    ...(article.tags?.trends || []),
  ];
  
  for (const tag of allTags) {
    if (tag.toLowerCase().includes(queryLower)) {
      score += 30;
    }
  }
  
  // Boost regulatory articles if searching for compliance/regulatory
  if (article.regulatory && (queryLower.includes('regulatory') || queryLower.includes('compliance'))) {
    score += 50;
  }
  
  // Boost high-impact articles
  if (article.impactScore && article.impactScore > 75) {
    score += article.impactScore * 0.3;
  }

  // Use AI score if available (highest priority)
  if (article.aiScore) {
    score += article.aiScore * 0.5;
  }

  // Boost recent articles slightly
  if (article.publishedAt) {
    const ageHours = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
    if (ageHours < 24) score += 10;
    if (ageHours < 1) score += 20;
  }

  return score;
}

/**
 * Determine match type for highlighting
 */
function getMatchType(article: Article, query: string, expandedTerms: string[]): 'exact' | 'fuzzy' | 'semantic' | 'tag' | 'combined' {
  const queryLower = query.toLowerCase();
  const titleLower = article.title.toLowerCase();
  
  if (titleLower.includes(queryLower)) return 'exact';
  
  const fuzzyScore = levenshteinSimilarity(titleLower, queryLower);
  if (fuzzyScore > 0.8) return 'fuzzy';
  
  const hasSemanticMatch = expandedTerms.some(term => titleLower.includes(term));
  if (hasSemanticMatch) return 'semantic';
  
  const allTags = [
    ...(article.tags?.lob || []),
    ...(article.tags?.perils || []),
    ...(article.tags?.regions || []),
  ];
  
  if (allTags.some(tag => tag.toLowerCase().includes(queryLower))) return 'tag';
  
  return 'combined';
}

/**
 * Main search function
 */
export function intelligentSearch(articles: Article[], query: string): SearchResult[] {
  if (!query.trim()) {
    // Return all articles sorted by smartScore when no query
    return articles
      .map(article => ({
        article,
        score: article.smartScore || 0,
        matchType: 'combined' as const,
        highlights: [],
      }))
      .sort((a, b) => b.score - a.score);
  }
  
  const expandedTerms = expandQueryWithSynonyms(query);
  
  const results = articles
    .map(article => ({
      article,
      score: scoreArticle(article, query, expandedTerms),
      matchType: getMatchType(article, query, expandedTerms),
      highlights: extractHighlights(article, query),
    }))
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score);
  
  return results;
}

/**
 * Extract highlights for display
 */
function extractHighlights(article: Article, query: string): string[] {
  const highlights: string[] = [];
  const queryLower = query.toLowerCase();
  
  // Highlight from title
  if (article.title.toLowerCase().includes(queryLower)) {
    highlights.push(`Title: "${article.title}"`);
  }
  
  // Highlight from description
  if (article.description?.toLowerCase().includes(queryLower)) {
    const start = article.description.toLowerCase().indexOf(queryLower);
    const snippet = article.description.substring(Math.max(0, start - 30), start + queryLower.length + 30);
    highlights.push(`"...${snippet}..."`);
  }
  
  // Highlight matching tags
  const matchingTags = [
    ...(article.tags?.lob || []),
    ...(article.tags?.perils || []),
    ...(article.tags?.regions || []),
  ].filter(tag => tag.toLowerCase().includes(queryLower));
  
  if (matchingTags.length > 0) {
    highlights.push(`Tags: ${matchingTags.join(', ')}`);
  }
  
  return highlights.slice(0, 2); // Limit to 2 highlights
}

/**
 * Get trending topics from articles
 */
export function getTrendingTopics(articles: Article[]): string[] {
  const topicFrequency = new Map<string, number>();

  articles.slice(0, 50).forEach(article => {
    // Extract from tags
    const allTags = [
      ...(article.tags?.lob || []),
      ...(article.tags?.perils || []),
      ...(article.tags?.regions || []),
      ...(article.tags?.trends || []),
    ];

    allTags.forEach(tag => {
      topicFrequency.set(tag, (topicFrequency.get(tag) || 0) + 1);
    });

    // Extract key words from title
    const titleWords = article.title.toLowerCase().split(/\s+/);
    titleWords.forEach(word => {
      if (word.length > 4 && !['that', 'this', 'with', 'from', 'have', 'been'].includes(word)) {
        topicFrequency.set(word, (topicFrequency.get(word) || 0) + 1);
      }
    });
  });

  return Array.from(topicFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([topic]) => topic);
}

/**
 * Get search suggestions based on partial query
 */
export function getSearchSuggestions(articles: Article[], partialQuery: string): string[] {
  if (!partialQuery.trim()) return [];

  const suggestions = new Set<string>();
  const queryLower = partialQuery.toLowerCase();

  // Suggest from article titles
  articles.forEach(article => {
    const words = article.title.toLowerCase().split(/\s+/);
    words.forEach(word => {
      if (word.startsWith(queryLower) && word.length > queryLower.length) {
        suggestions.add(word);
      }
    });
  });

  // Suggest from tags
  articles.forEach(article => {
    const allTags = [
      ...(article.tags?.lob || []),
      ...(article.tags?.perils || []),
      ...(article.tags?.regions || []),
      ...(article.tags?.trends || []),
    ];

    allTags.forEach(tag => {
      if (tag.toLowerCase().startsWith(queryLower)) {
        suggestions.add(tag);
      }
    });
  });

  // Suggest from synonyms
  Object.keys(INSURANCE_SYNONYMS).forEach(key => {
    if (key.startsWith(queryLower)) {
      suggestions.add(key);
    }
  });

  return Array.from(suggestions).slice(0, 5);
}

