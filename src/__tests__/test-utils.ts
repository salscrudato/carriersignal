/**
 * Test Utilities for CarrierSignal
 * Helper functions and mock data for testing
 */

import type { Article } from '../types';

// Type definitions for jest (when used in test environment)
declare const jest: {
  fn: (implementation?: (...args: unknown[]) => unknown) => {
    (...args: unknown[]): unknown;
    mockResolvedValue: (value: unknown) => unknown;
    mockRejectedValue: (value: unknown) => unknown;
  };
};

/**
 * Mock article data for testing
 */
export const mockArticles: Article[] = [
  {
    url: 'https://example.com/article1',
    source: 'Insurance Journal',
    title: 'Florida Insurance Market Faces Rate Increases',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    description: 'Major insurers announce rate increases in Florida market',
    smartScore: 85,
    aiScore: 82,
    impactScore: 88,
    tags: {
      lob: ['Property'],
      perils: ['Hurricane'],
      regions: ['US-FL'],
      companies: ['State Farm', 'Allstate'],
      trends: ['Climate Risk'],
      regulations: [],
    },
    riskPulse: 'HIGH',
    sentiment: 'NEGATIVE',
    confidence: 0.92,
    bullets5: [
      'State Farm and Allstate announce 15-20% rate increases',
      'Florida market experiencing unprecedented claims',
      'Regulatory approval expected within 30 days',
      'Smaller carriers exiting market',
      'Reinsurance costs driving increases',
    ],
    whyItMatters: {
      underwriting: 'Significant impact on underwriting guidelines and risk assessment',
      claims: 'Higher claims frequency expected in Florida region',
      brokerage: 'Broker commissions may be affected by rate changes',
      actuarial: 'Actuarial models need updating for new rate environment',
    },
    citations: ['https://example.com/source1', 'https://example.com/source2'],
    confidenceRationale: 'Multiple sources confirm rate increases with specific percentages',
    leadQuote: 'State Farm announces 15% rate increase in Florida',
    disclosure: 'No promotional content detected',
    impactBreakdown: {
      market: 90,
      regulatory: 75,
      catastrophe: 85,
      technology: 20,
    },
  },
  {
    url: 'https://example.com/article2',
    source: 'Claims Journal',
    title: 'AI-Powered Claims Processing Reduces Settlement Time',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    description: 'New AI technology speeds up claims processing',
    smartScore: 72,
    aiScore: 75,
    impactScore: 68,
    tags: {
      lob: ['Auto', 'Property'],
      perils: [],
      regions: ['US-CA', 'US-TX'],
      companies: ['Progressive'],
      trends: ['GenAI'],
      regulations: [],
    },
    riskPulse: 'MEDIUM',
    sentiment: 'POSITIVE',
    confidence: 0.88,
    bullets5: [
      'Progressive deploys AI for claims assessment',
      'Settlement time reduced by 40%',
      'Customer satisfaction scores increase',
      'Fraud detection improved',
      'Operational costs decrease',
    ],
    whyItMatters: {
      underwriting: 'Demonstrates operational efficiency improvements',
      claims: 'Significant reduction in claims processing time',
      brokerage: 'Faster settlements improve customer retention',
      actuarial: 'Operational data supports efficiency models',
    },
    citations: ['https://example.com/source3'],
    confidenceRationale: 'Company announcement with specific metrics',
    leadQuote: 'Progressive reduces claims settlement time by 40%',
    disclosure: 'Company press release',
    impactBreakdown: {
      market: 65,
      regulatory: 30,
      catastrophe: 10,
      technology: 95,
    },
  },
];

/**
 * Create a mock article with custom properties
 */
export function createMockArticle(overrides: Partial<Article> = {}): Article {
  return {
    ...mockArticles[0],
    ...overrides,
  };
}

/**
 * Mock API responses
 */
export const mockApiResponses = {
  askBrief: {
    success: true,
    data: {
      answer: 'Mock answer to query',
      sources: ['source1', 'source2'],
      confidence: 0.85,
    },
  },
  getQuickRead: {
    success: true,
    data: {
      content: 'Mock quick read content',
      readingTime: 3,
    },
  },
};

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now();
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

/**
 * Create a mock fetch response
 */
export function createMockFetchResponse(data: unknown, _ok = true, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  );
}

/**
 * Mock localStorage
 */
export function setupMockLocalStorage() {
  const store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach(key => delete store[key]);
    },
  };
}

/**
 * Create multiple mock articles
 */
export function createMockArticles(count: number, overrides?: Partial<Article>): Article[] {
  return Array.from({ length: count }, (_, i) =>
    createMockArticle({
      url: `https://example.com/article-${i}`,
      title: `Mock Article ${i + 1}`,
      ...overrides,
    })
  );
}

/**
 * Mock fetch API
 */
export function mockFetch(response: unknown, status = 200) {
  return jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => response,
    text: async () => JSON.stringify(response),
  });
}

/**
 * Mock API error response
 */
export function mockFetchError(message: string) {
  return jest.fn().mockRejectedValue(new Error(message));
}

/**
 * Create mock context value
 */
export function createMockArticleContext() {
  return {
    articles: mockArticles,
    addArticles: jest.fn(),
    removeArticle: jest.fn(),
    updateArticle: jest.fn(),
    clearArticles: jest.fn(),
  };
}

/**
 * Create mock UI context value
 */
export function createMockUIContext() {
  return {
    view: 'feed' as const,
    setView: jest.fn(),
    sortMode: 'smart' as const,
    setSortMode: jest.fn(),
    paletteState: 'aurora' as const,
    setPaletteState: jest.fn(),
    quickReadArticleUrl: null,
    setQuickReadArticleUrl: jest.fn(),
  };
}

