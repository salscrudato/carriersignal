/**
 * News Sources Registry
 * Seed data for P&C insurance news sources (RSS, Atom, JSON, HTML)
 */

import { Firestore } from 'firebase-admin/firestore';

// Local type definition for NewsSource
interface NewsSource {
  id: string;
  name: string;
  type: 'rss' | 'atom' | 'json' | 'html' | 'api';
  url: string;
  region?: string;
  lobHints?: string[];
  trustScore: number;
  active: boolean;
  lastFetchedAt?: number;
  fetchErrorCount?: number;
  createdAt: number;
  updatedAt: number;
}

export const NEWS_SOURCES_SEED: Omit<NewsSource, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // ============================================================================
  // CORE INDUSTRY / TRADE
  // ============================================================================
  {
    name: 'Insurance Journal - National News',
    type: 'rss',
    url: 'https://www.insurancejournal.com/news/national/feed/',
    region: 'national',
    lobHints: ['Homeowners', 'Auto', 'Commercial Property', 'Workers Comp'],
    trustScore: 95,
    active: true,
  },
  {
    name: 'Insurance Journal - Property & Casualty',
    type: 'rss',
    url: 'https://www.insurancejournal.com/news/property-casualty/feed/',
    region: 'national',
    lobHints: ['Commercial Property', 'Homeowners'],
    trustScore: 95,
    active: true,
  },

  // ============================================================================
  // REGULATORY - NATIONAL
  // ============================================================================
  {
    name: 'NAIC Newsroom',
    type: 'html',
    url: 'https://www.naic.org/newsroom.htm',
    region: 'national',
    lobHints: [],
    trustScore: 100,
    active: true,
  },

  // ============================================================================
  // REGULATORY - STATE (Texas)
  // ============================================================================
  {
    name: 'Texas Department of Insurance - News Releases',
    type: 'rss',
    url: 'https://www.tdi.texas.gov/news/newsreleases.html',
    region: 'TX',
    lobHints: [],
    trustScore: 100,
    active: true,
  },
  {
    name: 'Texas Department of Insurance - Commissioner Bulletins',
    type: 'rss',
    url: 'https://www.tdi.texas.gov/news/bulletins.html',
    region: 'TX',
    lobHints: [],
    trustScore: 100,
    active: true,
  },

  // ============================================================================
  // REGULATORY - STATE (California)
  // ============================================================================
  {
    name: 'California Department of Insurance - Press Releases',
    type: 'html',
    url: 'https://www.insurance.ca.gov/press-releases',
    region: 'CA',
    lobHints: [],
    trustScore: 100,
    active: true,
  },

  // ============================================================================
  // CATASTROPHE / HAZARDS
  // ============================================================================
  {
    name: 'National Weather Service - Alerts (ATOM)',
    type: 'atom',
    url: 'https://api.weather.gov/alerts/active?point=40,-95',
    region: 'national',
    lobHints: ['Homeowners', 'Commercial Property'],
    trustScore: 100,
    active: true,
  },
  {
    name: 'National Hurricane Center - Atlantic Advisories',
    type: 'rss',
    url: 'https://www.nhc.noaa.gov/index.shtml',
    region: 'national',
    lobHints: ['Homeowners', 'Commercial Property'],
    trustScore: 100,
    active: true,
  },
  {
    name: 'National Hurricane Center - GIS RSS',
    type: 'rss',
    url: 'https://www.nhc.noaa.gov/gis/forecast/archive/',
    region: 'national',
    lobHints: ['Homeowners', 'Commercial Property'],
    trustScore: 100,
    active: true,
  },
  {
    name: 'USGS Earthquakes - Real-time Feed',
    type: 'atom',
    url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.atom',
    region: 'national',
    lobHints: ['Commercial Property', 'Homeowners'],
    trustScore: 100,
    active: true,
  },

  // ============================================================================
  // FILINGS / EARNINGS
  // ============================================================================
  {
    name: 'SEC EDGAR - Insurance Company Filings',
    type: 'rss',
    url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&SIC=6331&owner=exclude&match=&count=100&myHID=&search_text=&CIK=&filenum=&State=&Country=&output=atom',
    region: 'national',
    lobHints: [],
    trustScore: 100,
    active: true,
  },

  // ============================================================================
  // OPTIONAL: REINSURANCE & SPECIALTY
  // ============================================================================
  {
    name: 'Artemis - Reinsurance News',
    type: 'rss',
    url: 'https://www.artemis.bm/feed/',
    region: 'national',
    lobHints: ['Reinsurance'],
    trustScore: 90,
    active: false, // Disabled by default, enable if needed
  },
  {
    name: 'Reinsurance News',
    type: 'rss',
    url: 'https://www.reinsurancene.ws/feed/',
    region: 'national',
    lobHints: ['Reinsurance'],
    trustScore: 85,
    active: false,
  },
  {
    name: 'Risk and Insurance',
    type: 'rss',
    url: 'https://riskandinsurance.com/feed/',
    region: 'national',
    lobHints: ['General Liability', 'Directors & Officers', 'Errors & Omissions'],
    trustScore: 85,
    active: false,
  },
  {
    name: 'Insurtech News',
    type: 'rss',
    url: 'https://www.insurtech.news/feed/',
    region: 'national',
    lobHints: ['Cyber', 'Technology'],
    trustScore: 80,
    active: false,
  },
];

/**
 * Initialize news sources in Firestore
 * Call this once during setup to seed the database
 */
export async function initializeNewsSources(db: Firestore): Promise<void> {
  const sourcesRef = db.collection('newsSources');
  const now = Date.now();

  for (const source of NEWS_SOURCES_SEED) {
    const docId = source.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    await sourcesRef.doc(docId).set({
      ...source,
      createdAt: now,
      updatedAt: now,
      lastFetchedAt: 0,
      fetchErrorCount: 0,
    });
  }

  console.log(`✅ Initialized ${NEWS_SOURCES_SEED.length} news sources`);
}

