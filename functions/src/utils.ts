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
 * Calculate SmartScore v2
 */
export function calculateSmartScore(params: {
  publishedAt?: string;
  impactScore: number;
  tags?: {
    regulations?: string[];
    perils?: string[];
  };
  regulatory?: boolean;
}): number {
  const now = Date.now();
  const pubDate = params.publishedAt ? new Date(params.publishedAt).getTime() : now;
  const ageHours = Math.max(0, (now - pubDate) / (1000 * 60 * 60));

  const recencyScore = Math.exp(-ageHours / 168) * 100;
  const impactNormalized = params.impactScore;

  const regulatoryBoost = (params.regulatory || (params.tags?.regulations && params.tags.regulations.length > 0)) ? 1.2 : 1.0;

  const catPerils = ['Hurricane', 'Wildfire', 'Earthquake', 'Flood', 'Tornado', 'Severe Weather'];
  const hasCatPeril = params.tags?.perils?.some(p => catPerils.includes(p)) || false;
  const catastropheBoost = hasCatPeril ? 1.15 : 1.0;

  const baseScore = (recencyScore * 0.4) + (impactNormalized * 0.6);
  const smartScore = Math.min(100, baseScore * regulatoryBoost * catastropheBoost);

  return Math.round(smartScore * 10) / 10;
}

/**
 * Hash URL for document ID
 */
export function hashUrl(u: string): string {
  return crypto.createHash("sha256").update(u).digest("hex").slice(0, 24);
}

