/**
 * Unit tests for pure utility functions
 */

import {
  normalizeRegions,
  normalizeCompanies,
  computeContentHash,
  detectStormName,
  isRegulatorySource,
  calculateSmartScore,
  hashUrl,
} from '../utils';

describe('Utility Functions', () => {
  describe('normalizeRegions', () => {
    it('should normalize state names to ISO codes', () => {
      const result = normalizeRegions(['California', 'florida', 'Texas']);
      expect(result).toContain('US-CA');
      expect(result).toContain('US-FL');
      expect(result).toContain('US-TX');
    });

    it('should preserve already-normalized ISO codes', () => {
      const result = normalizeRegions(['US-CA', 'US-FL']);
      expect(result).toContain('US-CA');
      expect(result).toContain('US-FL');
    });

    it('should handle mixed case and abbreviations', () => {
      const result = normalizeRegions(['ca', 'FL', 'new york']);
      expect(result).toContain('US-CA');
      expect(result).toContain('US-FL');
      expect(result).toContain('US-NY');
    });
  });

  describe('normalizeCompanies', () => {
    it('should normalize company names to canonical forms', () => {
      const result = normalizeCompanies(['state farm', 'GEICO', 'progressive']);
      expect(result).toContain('State Farm');
      expect(result).toContain('GEICO');
      expect(result).toContain('Progressive');
    });

    it('should preserve unknown company names', () => {
      const result = normalizeCompanies(['Unknown Insurance Co']);
      expect(result).toContain('Unknown Insurance Co');
    });
  });

  describe('computeContentHash', () => {
    it('should generate consistent hash for same content', () => {
      const text = 'This is a test article about insurance';
      const hash1 = computeContentHash(text);
      const hash2 = computeContentHash(text);
      expect(hash1).toBe(hash2);
    });

    it('should generate different hash for different content', () => {
      const hash1 = computeContentHash('Article one');
      const hash2 = computeContentHash('Article two');
      expect(hash1).not.toBe(hash2);
    });

    it('should be case-insensitive', () => {
      const hash1 = computeContentHash('Insurance Article');
      const hash2 = computeContentHash('insurance article');
      expect(hash1).toBe(hash2);
    });
  });

  describe('detectStormName', () => {
    it('should detect hurricane names', () => {
      const result = detectStormName('Hurricane Milton approaches Florida');
      expect(result).toBe('Hurricane Milton');
    });

    it('should detect tropical storm names', () => {
      const result = detectStormName('Tropical Storm Debby expected');
      expect(result).toBe('Tropical Storm Debby');
    });

    it('should return undefined for no storm', () => {
      const result = detectStormName('Regular insurance news article');
      expect(result).toBeUndefined();
    });
  });

  describe('isRegulatorySource', () => {
    it('should identify regulatory sources by URL', () => {
      expect(isRegulatorySource('https://insurance.ca.gov/news', 'California DOI')).toBe(true);
      expect(isRegulatorySource('https://floir.com/press', 'Florida OIR')).toBe(true);
    });

    it('should identify regulatory sources by source name', () => {
      expect(isRegulatorySource('https://example.com', 'naic.org')).toBe(true);
    });

    it('should return false for non-regulatory sources', () => {
      expect(isRegulatorySource('https://insurancejournal.com', 'Insurance Journal')).toBe(false);
    });
  });

  describe('calculateSmartScore', () => {
    it('should calculate score with impact and recency', () => {
      const score = calculateSmartScore({
        publishedAt: new Date().toISOString(),
        impactScore: 80,
        regulatory: false,
      });
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should boost regulatory articles', () => {
      const now = new Date().toISOString();
      const regularScore = calculateSmartScore({
        publishedAt: now,
        impactScore: 50,
        regulatory: false,
      });
      const regulatoryScore = calculateSmartScore({
        publishedAt: now,
        impactScore: 50,
        regulatory: true,
      });
      expect(regulatoryScore).toBeGreaterThan(regularScore);
    });

    it('should decay score for older articles', () => {
      const oldDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const newDate = new Date().toISOString();
      const oldScore = calculateSmartScore({
        publishedAt: oldDate,
        impactScore: 80,
        regulatory: false,
      });
      const newScore = calculateSmartScore({
        publishedAt: newDate,
        impactScore: 80,
        regulatory: false,
      });
      expect(newScore).toBeGreaterThan(oldScore);
    });
  });

  describe('hashUrl', () => {
    it('should generate consistent hash for same URL', () => {
      const url = 'https://example.com/article';
      const hash1 = hashUrl(url);
      const hash2 = hashUrl(url);
      expect(hash1).toBe(hash2);
    });

    it('should generate different hash for different URLs', () => {
      const hash1 = hashUrl('https://example.com/article1');
      const hash2 = hashUrl('https://example.com/article2');
      expect(hash1).not.toBe(hash2);
    });
  });
});

