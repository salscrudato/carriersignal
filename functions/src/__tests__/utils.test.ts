/**
 * Unit tests for utils.ts
 * Tests for normalization, scoring, and utility functions
 */

import {
  normalizeRegions,
  normalizeCompanies,
  calculateSmartScore,
  computeContentHash,
  detectStormName,
  isRegulatorySource,
  hashUrl,
} from '../utils';

describe('normalizeRegions', () => {
  it('should normalize state names to ISO codes', () => {
    expect(normalizeRegions(['Florida', 'California'])).toContain('US-FL');
    expect(normalizeRegions(['Florida', 'California'])).toContain('US-CA');
  });

  it('should handle abbreviations', () => {
    expect(normalizeRegions(['FL', 'CA', 'TX'])).toContain('US-FL');
    expect(normalizeRegions(['FL', 'CA', 'TX'])).toContain('US-CA');
    expect(normalizeRegions(['FL', 'CA', 'TX'])).toContain('US-TX');
  });

  it('should preserve already-normalized ISO codes', () => {
    expect(normalizeRegions(['US-FL', 'US-CA'])).toContain('US-FL');
    expect(normalizeRegions(['US-FL', 'US-CA'])).toContain('US-CA');
  });

  it('should handle case-insensitivity', () => {
    expect(normalizeRegions(['florida', 'CALIFORNIA'])).toContain('US-FL');
    expect(normalizeRegions(['florida', 'CALIFORNIA'])).toContain('US-CA');
  });
});

describe('normalizeCompanies', () => {
  it('should normalize company names', () => {
    expect(normalizeCompanies(['state farm', 'allstate'])).toContain('State Farm');
    expect(normalizeCompanies(['state farm', 'allstate'])).toContain('Allstate');
  });

  it('should handle case-insensitivity', () => {
    expect(normalizeCompanies(['STATE FARM', 'GEICO'])).toContain('State Farm');
    expect(normalizeCompanies(['STATE FARM', 'GEICO'])).toContain('GEICO');
  });

  it('should preserve unknown companies', () => {
    expect(normalizeCompanies(['UnknownCorp'])).toContain('UnknownCorp');
  });
});

describe('calculateSmartScore', () => {
  it('should return a score between 0 and 100', () => {
    const score = calculateSmartScore({
      impactScore: 50,
      publishedAt: new Date().toISOString(),
    });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('should boost catastrophe articles with named storms', () => {
    const withStorm = calculateSmartScore({
      impactScore: 50,
      stormName: 'Hurricane Milton',
      publishedAt: new Date().toISOString(),
    });
    const withoutStorm = calculateSmartScore({
      impactScore: 50,
      publishedAt: new Date().toISOString(),
    });
    expect(withStorm).toBeGreaterThan(withoutStorm);
  });

  it('should correctly detect catastrophe from impactBreakdown', () => {
    const catScore = calculateSmartScore({
      impactScore: 50,
      impactBreakdown: { catastrophe: 75, market: 20, regulatory: 20, technology: 10 },
      publishedAt: new Date().toISOString(),
    });
    const nonCatScore = calculateSmartScore({
      impactScore: 50,
      impactBreakdown: { catastrophe: 30, market: 50, regulatory: 10, technology: 10 },
      publishedAt: new Date().toISOString(),
    });
    expect(catScore).toBeGreaterThan(nonCatScore);
  });

  it('should boost regulatory articles', () => {
    const regScore = calculateSmartScore({
      impactScore: 50,
      regulatory: true,
      publishedAt: new Date().toISOString(),
    });
    const nonRegScore = calculateSmartScore({
      impactScore: 50,
      regulatory: false,
      publishedAt: new Date().toISOString(),
    });
    expect(regScore).toBeGreaterThan(nonRegScore);
  });

  it('should apply risk pulse multiplier', () => {
    const highRisk = calculateSmartScore({
      impactScore: 50,
      riskPulse: 'HIGH',
      publishedAt: new Date().toISOString(),
    });
    const lowRisk = calculateSmartScore({
      impactScore: 50,
      riskPulse: 'LOW',
      publishedAt: new Date().toISOString(),
    });
    expect(highRisk).toBeGreaterThan(lowRisk);
  });

  it('should apply recency decay', () => {
    const now = new Date();
    const recent = new Date(now.getTime() - 1 * 60 * 60 * 1000); // 1 hour ago
    const old = new Date(now.getTime() - 72 * 60 * 60 * 1000); // 72 hours ago

    const recentScore = calculateSmartScore({
      impactScore: 50,
      publishedAt: recent.toISOString(),
    });
    const oldScore = calculateSmartScore({
      impactScore: 50,
      publishedAt: old.toISOString(),
    });
    expect(recentScore).toBeGreaterThan(oldScore);
  });
});

describe('detectStormName', () => {
  it('should detect hurricane names', () => {
    expect(detectStormName('Hurricane Milton struck Florida')).toBe('Hurricane Milton');
  });

  it('should detect tropical storm names', () => {
    expect(detectStormName('Tropical Storm Debby affected the coast')).toBe('Tropical Storm Debby');
  });

  it('should return undefined if no storm detected', () => {
    expect(detectStormName('Regular weather news')).toBeUndefined();
  });
});

describe('isRegulatorySource', () => {
  it('should detect regulatory URLs', () => {
    expect(isRegulatorySource('https://insurance.ca.gov/bulletin', 'California DOI')).toBe(true);
    expect(isRegulatorySource('https://dfs.ny.gov/news', 'NY DFS')).toBe(true);
  });

  it('should detect regulatory sources by name', () => {
    expect(isRegulatorySource('https://example.com', 'NAIC')).toBe(true);
  });

  it('should return false for non-regulatory sources', () => {
    expect(isRegulatorySource('https://insurancejournal.com', 'Insurance Journal')).toBe(false);
  });
});

describe('computeContentHash', () => {
  it('should generate consistent hashes for same content', () => {
    const text = 'This is test content for hashing';
    const hash1 = computeContentHash(text);
    const hash2 = computeContentHash(text);
    expect(hash1).toBe(hash2);
  });

  it('should generate different hashes for different content', () => {
    const hash1 = computeContentHash('Content A');
    const hash2 = computeContentHash('Content B');
    expect(hash1).not.toBe(hash2);
  });

  it('should be case-insensitive', () => {
    const hash1 = computeContentHash('Test Content');
    const hash2 = computeContentHash('test content');
    expect(hash1).toBe(hash2);
  });
});

describe('hashUrl', () => {
  it('should generate consistent hashes for same URL', () => {
    const url = 'https://example.com/article';
    const hash1 = hashUrl(url);
    const hash2 = hashUrl(url);
    expect(hash1).toBe(hash2);
  });

  it('should generate different hashes for different URLs', () => {
    const hash1 = hashUrl('https://example.com/article1');
    const hash2 = hashUrl('https://example.com/article2');
    expect(hash1).not.toBe(hash2);
  });
});

