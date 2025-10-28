/**
 * Pure utility functions for CarrierSignal
 * These functions have no external dependencies and can be easily tested
 */

import crypto from 'node:crypto';

/**
 * US State normalization map: common names/abbreviations → ISO 3166-2 codes
 */
const STATE_NORMALIZATION: Record<string, string> = {
  'alabama': 'US-AL', 'al': 'US-AL',
  'alaska': 'US-AK', 'ak': 'US-AK',
  'arizona': 'US-AZ', 'az': 'US-AZ',
  'arkansas': 'US-AR', 'ar': 'US-AR',
  'california': 'US-CA', 'ca': 'US-CA', 'calif': 'US-CA',
  'colorado': 'US-CO', 'co': 'US-CO',
  'connecticut': 'US-CT', 'ct': 'US-CT',
  'delaware': 'US-DE', 'de': 'US-DE',
  'florida': 'US-FL', 'fl': 'US-FL', 'fla': 'US-FL',
  'georgia': 'US-GA', 'ga': 'US-GA',
  'hawaii': 'US-HI', 'hi': 'US-HI',
  'idaho': 'US-ID', 'id': 'US-ID',
  'illinois': 'US-IL', 'il': 'US-IL',
  'indiana': 'US-IN', 'in': 'US-IN',
  'iowa': 'US-IA', 'ia': 'US-IA',
  'kansas': 'US-KS', 'ks': 'US-KS',
  'kentucky': 'US-KY', 'ky': 'US-KY',
  'louisiana': 'US-LA', 'la': 'US-LA',
  'maine': 'US-ME', 'me': 'US-ME',
  'maryland': 'US-MD', 'md': 'US-MD',
  'massachusetts': 'US-MA', 'ma': 'US-MA', 'mass': 'US-MA',
  'michigan': 'US-MI', 'mi': 'US-MI',
  'minnesota': 'US-MN', 'mn': 'US-MN',
  'mississippi': 'US-MS', 'ms': 'US-MS',
  'missouri': 'US-MO', 'mo': 'US-MO',
  'montana': 'US-MT', 'mt': 'US-MT',
  'nebraska': 'US-NE', 'ne': 'US-NE',
  'nevada': 'US-NV', 'nv': 'US-NV',
  'new hampshire': 'US-NH', 'nh': 'US-NH',
  'new jersey': 'US-NJ', 'nj': 'US-NJ',
  'new mexico': 'US-NM', 'nm': 'US-NM',
  'new york': 'US-NY', 'ny': 'US-NY',
  'north carolina': 'US-NC', 'nc': 'US-NC',
  'north dakota': 'US-ND', 'nd': 'US-ND',
  'ohio': 'US-OH', 'oh': 'US-OH',
  'oklahoma': 'US-OK', 'ok': 'US-OK',
  'oregon': 'US-OR', 'or': 'US-OR',
  'pennsylvania': 'US-PA', 'pa': 'US-PA',
  'rhode island': 'US-RI', 'ri': 'US-RI',
  'south carolina': 'US-SC', 'sc': 'US-SC',
  'south dakota': 'US-SD', 'sd': 'US-SD',
  'tennessee': 'US-TN', 'tn': 'US-TN',
  'texas': 'US-TX', 'tx': 'US-TX',
  'utah': 'US-UT', 'ut': 'US-UT',
  'vermont': 'US-VT', 'vt': 'US-VT',
  'virginia': 'US-VA', 'va': 'US-VA',
  'washington': 'US-WA', 'wa': 'US-WA',
  'west virginia': 'US-WV', 'wv': 'US-WV',
  'wisconsin': 'US-WI', 'wi': 'US-WI',
  'wyoming': 'US-WY', 'wy': 'US-WY',
  'district of columbia': 'US-DC', 'dc': 'US-DC', 'washington dc': 'US-DC',
};

/**
 * Company name normalization map
 */
const COMPANY_NORMALIZATION: Record<string, string> = {
  'state farm': 'State Farm',
  'statefarm': 'State Farm',
  'allstate': 'Allstate',
  'geico': 'GEICO',
  'progressive': 'Progressive',
  'usaa': 'USAA',
  'liberty mutual': 'Liberty Mutual',
  'farmers': 'Farmers Insurance',
  'nationwide': 'Nationwide',
  'travelers': 'Travelers',
  'american family': 'American Family Insurance',
  'chubb': 'Chubb',
  'hartford': 'The Hartford',
  'aig': 'AIG',
  'zurich': 'Zurich',
  'allianz': 'Allianz',
  'axa': 'AXA',
  'berkshire hathaway': 'Berkshire Hathaway',
  'markel': 'Markel',
  'fairfax': 'Fairfax Financial',
  'citizens': 'Citizens Property Insurance',
  'florida citizens': 'Citizens Property Insurance',
  'california fair plan': 'California FAIR Plan',
  'fair plan': 'California FAIR Plan',
};

/**
 * Normalize regions to ISO 3166-2 codes
 */
export function normalizeRegions(regions: string[]): string[] {
  const normalized = new Set<string>();

  for (const region of regions) {
    const lower = region.toLowerCase().trim();

    // Already ISO format
    if (lower.startsWith('us-') && lower.length === 5) {
      normalized.add(region.toUpperCase());
      continue;
    }

    // Check normalization map
    if (STATE_NORMALIZATION[lower]) {
      normalized.add(STATE_NORMALIZATION[lower]);
    } else {
      // Keep original if not found
      normalized.add(region);
    }
  }

  return Array.from(normalized);
}

/**
 * Normalize company names to canonical forms
 */
export function normalizeCompanies(companies: string[]): string[] {
  const normalized = new Set<string>();

  for (const company of companies) {
    const lower = company.toLowerCase().trim();

    if (COMPANY_NORMALIZATION[lower]) {
      normalized.add(COMPANY_NORMALIZATION[lower]);
    } else {
      // Keep original if not found
      normalized.add(company);
    }
  }

  return Array.from(normalized);
}

/**
 * Compute content hash for deduplication
 */
export function computeContentHash(text: string): string {
  const normalized = text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const sample = normalized.slice(0, 500);
  return crypto.createHash("sha256").update(sample).digest("hex").slice(0, 16);
}

/**
 * Detect storm/hurricane names from text
 */
export function detectStormName(text: string): string | undefined {
  const patterns = [
    /Hurricane\s+([A-Z][a-z]+)/gi,
    /Tropical\s+Storm\s+([A-Z][a-z]+)/gi,
    /Typhoon\s+([A-Z][a-z]+)/gi,
    /Cyclone\s+([A-Z][a-z]+)/gi,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      return match[0];
    }
  }

  return undefined;
}

/**
 * Detect if article is from a regulatory source
 */
export function isRegulatorySource(url: string, source: string): boolean {
  const regulatoryKeywords = [
    'doi.', 'insurance.ca.gov', 'floir.com', 'tdi.texas.gov',
    'dfs.ny.gov', 'insurance.pa.gov', 'naic.org',
  ];

  const urlLower = url.toLowerCase();
  const sourceLower = source.toLowerCase();

  return regulatoryKeywords.some(keyword =>
    urlLower.includes(keyword) || sourceLower.includes(keyword)
  );
}

/**
 * Calculate SmartScore v3 - Enhanced for P&C Insurance Professionals
 *
 * Scoring Philosophy:
 * - Balances recency with enduring relevance (breaking news vs. structural changes)
 * - Prioritizes actionable intelligence over general news
 * - Weights catastrophe, regulatory, and market-moving events heavily
 * - Considers multi-dimensional impact (market, regulatory, catastrophe, technology)
 */
export function calculateSmartScore(params: {
  publishedAt?: string;
  impactScore: number;
  impactBreakdown?: {
    market?: number;
    regulatory?: number;
    catastrophe?: number;
    technology?: number;
  };
  tags?: {
    regulations?: string[];
    perils?: string[];
    lob?: string[];
    trends?: string[];
  };
  regulatory?: boolean;
  riskPulse?: 'LOW' | 'MEDIUM' | 'HIGH';
  stormName?: string;
}): number {
  const now = Date.now();
  const pubDate = params.publishedAt ? new Date(params.publishedAt).getTime() : now;
  const ageHours = Math.max(0, (now - pubDate) / (1000 * 60 * 60));

  // Enhanced recency decay with different curves for different content types
  // Catastrophe/regulatory news: slower decay (72h half-life)
  // Market news: medium decay (48h half-life)
  // General news: faster decay (24h half-life)
  const isCatastrophe = params.stormName || params.impactBreakdown?.catastrophe || 0 > 50;
  const isRegulatory = params.regulatory || (params.tags?.regulations && params.tags.regulations.length > 0);

  let halfLife = 24; // Default: 24 hours
  if (isCatastrophe) halfLife = 72; // Catastrophe news stays relevant longer
  else if (isRegulatory) halfLife = 48; // Regulatory news has medium longevity

  const recencyScore = Math.exp(-ageHours / (halfLife * 1.44)) * 100; // 1.44 converts half-life to decay constant

  // Multi-dimensional impact scoring
  const impactBreakdown = params.impactBreakdown || {
    market: params.impactScore * 0.25,
    regulatory: params.impactScore * 0.25,
    catastrophe: params.impactScore * 0.25,
    technology: params.impactScore * 0.25,
  };

  // Weight different impact dimensions based on P&C industry priorities
  const weightedImpact =
    (impactBreakdown.market || 0) * 0.30 +        // Market impact: 30% (rates, capacity, competition)
    (impactBreakdown.regulatory || 0) * 0.35 +    // Regulatory: 35% (highest - directly affects operations)
    (impactBreakdown.catastrophe || 0) * 0.25 +   // Catastrophe: 25% (loss events, exposure)
    (impactBreakdown.technology || 0) * 0.10;     // Technology: 10% (innovation, but less immediate)

  // Risk pulse multiplier (industry disruption potential)
  const riskPulseMultiplier =
    params.riskPulse === 'HIGH' ? 1.25 :
    params.riskPulse === 'MEDIUM' ? 1.10 :
    1.0;

  // Regulatory boost (critical for compliance and operations)
  const regulatoryBoost = isRegulatory ? 1.20 : 1.0;

  // Catastrophe boost with graduated scale
  const catPerils = ['Hurricane', 'Wildfire', 'Earthquake', 'Flood', 'Tornado', 'Severe Weather', 'Hail', 'Winter Storm', 'Convective Storm'];
  const hasCatPeril = params.tags?.perils?.some(p =>
    catPerils.some(cat => p.toLowerCase().includes(cat.toLowerCase()))
  ) || false;

  // Named storm gets higher boost
  const catastropheBoost = params.stormName ? 1.30 : (hasCatPeril ? 1.15 : 1.0);

  // High-value trend boost (emerging risks and opportunities)
  const highValueTrends = [
    'Climate Risk', 'Social Inflation', 'GenAI', 'Litigation Funding',
    'Tort Reform', 'Rate Adequacy', 'Reinsurance', 'Capacity Constraints',
    'Nuclear Verdicts', 'Assignment of Benefits', 'Parametric Insurance'
  ];
  const hasHighValueTrend = params.tags?.trends?.some(t =>
    highValueTrends.some(hvt => t.toLowerCase().includes(hvt.toLowerCase()))
  ) || false;
  const trendBoost = hasHighValueTrend ? 1.10 : 1.0;

  // Multi-LOB coverage boost (broader industry relevance)
  const lobCount = params.tags?.lob?.length || 0;
  const lobBoost = lobCount >= 3 ? 1.08 : (lobCount >= 2 ? 1.04 : 1.0);

  // Calculate base score with enhanced weighting
  // Recency: 35% (down from 40% to reduce recency bias)
  // Impact: 65% (up from 60% to prioritize substance over timing)
  const baseScore = (recencyScore * 0.35) + (weightedImpact * 0.65);

  // Apply all multipliers
  const smartScore = Math.min(100,
    baseScore *
    riskPulseMultiplier *
    regulatoryBoost *
    catastropheBoost *
    trendBoost *
    lobBoost
  );

  return Math.round(smartScore * 10) / 10;
}

/**
 * Hash URL for document ID
 */
export function hashUrl(u: string): string {
  return crypto.createHash("sha256").update(u).digest("hex").slice(0, 24);
}

