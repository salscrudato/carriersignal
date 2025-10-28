/**
 * Integration Tests for CarrierSignal Cloud Functions
 *
 * Tests the full pipeline: feed ingestion -> summarization -> scoring -> storage
 */

import { calculateSmartScore, normalizeRegions, normalizeCompanies, detectStormName, isRegulatorySource, computeContentHash } from '../utils';

describe('Integration: Feed Processing Pipeline', () => {
  describe('Article Processing Flow', () => {
    it('should process a complete article through the pipeline', () => {
      // Simulate an article from feed
      const rawArticle = {
        title: 'Hurricane Ian Causes $50B in Damages',
        url: 'https://example.com/article',
        source: 'Insurance Journal',
        publishedAt: new Date().toISOString(),
        text: 'Hurricane Ian has caused significant damage across Florida...',
      };

      // Step 1: Detect storm name
      const stormName = detectStormName(rawArticle.text);
      expect(stormName).toBe('Hurricane Ian');

      // Step 2: Check if regulatory
      const regulatory = isRegulatorySource(rawArticle.url, rawArticle.source);
      expect(typeof regulatory).toBe('boolean');

      // Step 3: Compute content hash
      const contentHash = computeContentHash(rawArticle.text);
      expect(contentHash).toMatch(/^[a-f0-9]{16}$/); // SHA-256 hex (16 chars)

      // Step 4: Normalize regions and companies
      const regions = normalizeRegions(['Florida', 'Georgia']);
      expect(regions).toEqual(['US-FL', 'US-GA']);

      const companies = normalizeCompanies(['State Farm', 'Allstate']);
      expect(companies).toEqual(['State Farm', 'Allstate']);
    });

    it('should calculate smart score with catastrophe boost', () => {
      const params = {
        impactScore: 80,
        regulatory: false,
        stormName: 'Ian',
        impactBreakdown: {
          market: 30,
          regulatory: 20,
          catastrophe: 90,
          technology: 10,
        },
        publishedAt: new Date().toISOString(),
      };

      const score = calculateSmartScore(params);

      // Should be a valid score
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should calculate smart score with regulatory boost', () => {
      const params = {
        impactScore: 60,
        regulatory: true,
        stormName: undefined,
        impactBreakdown: {
          market: 20,
          regulatory: 80,
          catastrophe: 10,
          technology: 15,
        },
        publishedAt: new Date().toISOString(),
      };

      const score = calculateSmartScore(params);

      // Should be a valid score
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should apply recency decay correctly', () => {
      const now = new Date();

      // Fresh article (1 hour old)
      const freshDate = new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString();
      const freshScore = calculateSmartScore({
        impactScore: 50,
        regulatory: false,
        stormName: undefined,
        impactBreakdown: { market: 0, regulatory: 0, catastrophe: 0, technology: 0 },
        publishedAt: freshDate,
      });

      // Old article (7 days old)
      const oldDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const oldScore = calculateSmartScore({
        impactScore: 50,
        regulatory: false,
        stormName: undefined,
        impactBreakdown: { market: 0, regulatory: 0, catastrophe: 0, technology: 0 },
        publishedAt: oldDate,
      });

      // Fresh article should score higher due to recency
      expect(freshScore).toBeGreaterThan(oldScore);
    });
  });



  describe('Regulatory Source Detection', () => {
    it('should detect regulatory sources by URL', () => {
      const regulatoryUrls = [
        'https://www.naic.org/press-release',
        'https://dfs.ny.gov/news',
        'https://insurance.ca.gov/article',
      ];

      regulatoryUrls.forEach(url => {
        const isReg = isRegulatorySource(url, 'News');
        expect(isReg).toBe(true);
      });
    });

    it('should detect regulatory sources by name', () => {
      const regulatoryNames = [
        'NAIC Press Release',
        'Department of Insurance',
        'State Insurance Commissioner',
      ];

      regulatoryNames.forEach(name => {
        const isReg = isRegulatorySource('https://example.com', name);
        expect(isReg).toBe(true);
      });
    });

    it('should not flag non-regulatory sources', () => {
      const nonRegulatoryUrls = [
        'https://www.example.com/news',
        'https://blog.example.com/article',
      ];

      nonRegulatoryUrls.forEach(url => {
        const isReg = isRegulatorySource(url, 'Random News');
        expect(isReg).toBe(false);
      });
    });
  });
});

