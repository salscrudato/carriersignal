/**
 * News Domain Constants
 * Enums and constants for P&C insurance news, LOBs, regulators, severity, actionability
 */

// ============================================================================
// LINES OF BUSINESS (LOBs)
// ============================================================================

export const LOB_OPTIONS = [
  'Homeowners',
  'Auto',
  'Commercial Property',
  'Workers Comp',
  'Cyber',
  'General Liability',
  'Directors & Officers',
  'Errors & Omissions',
  'Inland Marine',
  'Flood',
] as const;

export type LOB = typeof LOB_OPTIONS[number];

// ============================================================================
// REGULATORY BODIES
// ============================================================================

export const REGULATOR_OPTIONS = [
  'NAIC',
  'TDI',
  'CA DOI',
  'NY DFS',
  'FEMA',
  'NWS',
  'USGS',
  'NHC',
  'SEC',
  'State DOI',
] as const;

export type Regulator = typeof REGULATOR_OPTIONS[number];

// ============================================================================
// SEVERITY LEVELS
// ============================================================================

export const SEVERITY_LEVELS = {
  CRITICAL: 5,
  HIGH: 4,
  MEDIUM: 3,
  LOW: 2,
  MINIMAL: 1,
} as const;

export type SeverityLevel = typeof SEVERITY_LEVELS[keyof typeof SEVERITY_LEVELS];

export const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  5: 'Critical',
  4: 'High',
  3: 'Medium',
  2: 'Low',
  1: 'Minimal',
};

// ============================================================================
// ACTIONABILITY
// ============================================================================

export const ACTIONABILITY_OPTIONS = [
  'Monitor',
  'Review Portfolio',
  'File Response',
  'Client Advisory',
] as const;

export type Actionability = typeof ACTIONABILITY_OPTIONS[number];

// ============================================================================
// HAZARD TYPES
// ============================================================================

export const HAZARD_TYPES = [
  'severe_thunderstorm',
  'tornado',
  'hurricane',
  'winter_storm',
  'flood',
  'earthquake',
  'wildfire',
  'hail',
  'wind',
  'other',
] as const;

export type HazardType = typeof HAZARD_TYPES[number];

// ============================================================================
// NEWS CATEGORIES
// ============================================================================

export const NEWS_CATEGORIES = [
  'regulatory',
  'market',
  'catastrophe',
  'litigation',
  'technology',
  'earnings',
  'reinsurance',
] as const;

export type NewsCategory = typeof NEWS_CATEGORIES[number];

// ============================================================================
// SOURCE TYPES
// ============================================================================

export const SOURCE_TYPES = [
  'rss',
  'atom',
  'json',
  'html',
  'api',
] as const;

export type SourceType = typeof SOURCE_TYPES[number];

// ============================================================================
// US STATES (for filtering)
// ============================================================================

export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
] as const;

export type USState = typeof US_STATES[number];

// ============================================================================
// MAJOR P&C CARRIERS (for tagging)
// ============================================================================

export const MAJOR_CARRIERS = [
  'Allstate',
  'Progressive',
  'Chubb',
  'Travelers',
  'Hartford',
  'Zurich',
  'AIG',
  'Berkshire Hathaway',
  'State Farm',
  'GEICO',
  'Nationwide',
  'Liberty Mutual',
  'Safeco',
  'Kemper',
  'Hanover',
  'Homeowners Choice',
  'Universal Insurance',
  'Heritage Insurance',
  'Federated National',
  'United Insurance',
] as const;

export type Carrier = typeof MAJOR_CARRIERS[number];

// ============================================================================
// CARRIER TICKERS (for SEC/EDGAR linking)
// ============================================================================

export const CARRIER_TICKERS: Record<string, string> = {
  'Allstate': 'ALL',
  'Progressive': 'PGR',
  'Chubb': 'CB',
  'Travelers': 'TRV',
  'Hartford': 'HIG',
  'Zurich': 'ZURN',
  'AIG': 'AIG',
  'Berkshire Hathaway': 'BRK.B',
  'Nationwide': 'NWL',
  'Liberty Mutual': 'LMVH',
  'Kemper': 'KMPR',
  'Hanover': 'THG',
  'Homeowners Choice': 'HCI',
  'Universal Insurance': 'UVE',
  'Heritage Insurance': 'HRTG',
  'Federated National': 'FNHC',
  'United Insurance': 'UPH',
};

// ============================================================================
// CARRIER CIKs (SEC EDGAR)
// ============================================================================

export const CARRIER_CIKS: Record<string, string> = {
  'Allstate': '0000003548',
  'Progressive': '0000080661',
  'Chubb': '0000896159',
  'Travelers': '0001540570',
  'Hartford': '0000874766',
  'AIG': '0000005272',
  'Kemper': '0000049071',
  'Hanover': '0000049071',
};

// ============================================================================
// LOG CATEGORIES (for structured logging)
// ============================================================================

export const LOG_CATEGORIES = {
  NEWS: 'NEWS',
  EARNINGS: 'EARNINGS',
  CLAIMS: 'CLAIMS',
  PERFORMANCE: 'PERFORMANCE',
  INGESTION: 'INGESTION',
  CLUSTERING: 'CLUSTERING',
  SCORING: 'SCORING',
  HAZARD: 'HAZARD',
} as const;

export type LogCategory = typeof LOG_CATEGORIES[keyof typeof LOG_CATEGORIES];

