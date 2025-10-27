/**
 * Government APIs Utility
 * Integrates OpenFEMA, NOAA Weather, and SEC EDGAR APIs
 */

export interface DisasterEvent {
  id: string;
  declarationDate: string;
  disasterType: string;
  state: string;
  county?: string;
  title: string;
  incidentType: string;
}

export interface WeatherAlert {
  id: string;
  event: string;
  headline: string;
  description: string;
  effective: string;
  expires: string;
  areaDesc: string;
  severity: string;
}

export interface SECFiling {
  accessionNumber: string;
  filingDate: string;
  reportDate: string;
  companyName: string;
  formType: string;
  url: string;
}

/**
 * Fetch disaster declarations from OpenFEMA API
 * No authentication required
 */
export async function fetchDisasterDeclarations(): Promise<DisasterEvent[]> {
  try {
    // Fetch recent disaster declarations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

    const response = await fetch(
      `https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries?$filter=declarationDate gt '${dateStr}'&$top=100`
    );

    if (!response.ok) {
      console.error('Failed to fetch OpenFEMA data:', response.statusText);
      return [];
    }

    const data = await response.json();
    const disasters: DisasterEvent[] = [];

    if (data.DisasterDeclarationsSummaries) {
      for (const item of data.DisasterDeclarationsSummaries) {
        disasters.push({
          id: item.disasterId?.toString() || '',
          declarationDate: item.declarationDate || '',
          disasterType: item.incidentType || '',
          state: item.state || '',
          county: item.county || '',
          title: item.title || '',
          incidentType: item.incidentType || '',
        });
      }
    }

    return disasters;
  } catch (error) {
    console.error('Error fetching OpenFEMA data:', error);
    return [];
  }
}

/**
 * Fetch active weather alerts from NOAA API
 * No authentication required
 */
export async function fetchWeatherAlerts(): Promise<WeatherAlert[]> {
  try {
    const response = await fetch('https://api.weather.gov/alerts/active');

    if (!response.ok) {
      console.error('Failed to fetch NOAA weather alerts:', response.statusText);
      return [];
    }

    const data = await response.json();
    const alerts: WeatherAlert[] = [];

    if (data.features) {
      for (const feature of data.features) {
        const props = feature.properties;
        alerts.push({
          id: props.id || '',
          event: props.event || '',
          headline: props.headline || '',
          description: props.description || '',
          effective: props.effective || '',
          expires: props.expires || '',
          areaDesc: props.areaDesc || '',
          severity: props.severity || '',
        });
      }
    }

    return alerts;
  } catch (error) {
    console.error('Error fetching NOAA weather alerts:', error);
    return [];
  }
}

/**
 * Fetch SEC EDGAR filings for insurance companies
 * Uses RSS feed - no authentication required
 */
export async function fetchSECFilings(): Promise<SECFiling[]> {
  try {
    // Fetch recent 10-K, 10-Q, and 8-K filings
    const response = await fetch(
      'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=&type=10-K|10-Q|8-K&dateb=&owner=exclude&count=100&search_text=insurance'
    );

    if (!response.ok) {
      console.error('Failed to fetch SEC EDGAR data:', response.statusText);
      return [];
    }

    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    const filings: SECFiling[] = [];
    const rows = doc.querySelectorAll('table tr');

    // Parse SEC EDGAR table (skip header)
    for (let i = 1; i < Math.min(rows.length, 51); i++) {
      const cells = rows[i].querySelectorAll('td');
      if (cells.length >= 4) {
        const companyName = cells[0]?.textContent?.trim() || '';
        const formType = cells[1]?.textContent?.trim() || '';
        const filingDate = cells[3]?.textContent?.trim() || '';
        const link = cells[1]?.querySelector('a')?.getAttribute('href') || '';

        if (companyName && formType) {
          filings.push({
            accessionNumber: link.split('/').pop() || '',
            filingDate,
            reportDate: filingDate,
            companyName,
            formType,
            url: `https://www.sec.gov${link}`,
          });
        }
      }
    }

    return filings;
  } catch (error) {
    console.error('Error fetching SEC EDGAR data:', error);
    return [];
  }
}

/**
 * Get state insurance department RSS feeds
 */
export function getStateInsuranceDepartmentFeeds(): Array<{ url: string; state: string }> {
  return [
    {
      url: 'https://www.tdi.texas.gov/news/rss.html',
      state: 'Texas',
    },
    {
      url: 'https://idoi.illinois.gov/news/rss.xml',
      state: 'Illinois',
    },
    {
      url: 'https://insurance.delaware.gov/news/rss/',
      state: 'Delaware',
    },
    {
      url: 'https://www.insurance.ca.gov/news/rss.xml',
      state: 'California',
    },
    {
      url: 'https://www.dfs.ny.gov/news_and_events/rss.xml',
      state: 'New York',
    },
  ];
}

/**
 * Fetch NAIC InsData statistics
 */
export async function fetchNAICData(): Promise<any> {
  try {
    const response = await fetch('https://content.naic.org/industry/insdata');

    if (!response.ok) {
      console.error('Failed to fetch NAIC data:', response.statusText);
      return null;
    }

    // NAIC provides downloadable data, return URL for reference
    return {
      source: 'NAIC InsData',
      url: 'https://content.naic.org/industry/insdata',
      description: 'Insurance industry financial and market share data',
    };
  } catch (error) {
    console.error('Error fetching NAIC data:', error);
    return null;
  }
}

/**
 * Correlate disasters with article locations
 */
export function correlateDisastersWithArticles(
  disasters: DisasterEvent[],
  articles: any[]
): Map<string, DisasterEvent[]> {
  const correlations = new Map<string, DisasterEvent[]>();

  for (const article of articles) {
    const articleText = `${article.title} ${article.description}`.toLowerCase();
    const relatedDisasters: DisasterEvent[] = [];

    for (const disaster of disasters) {
      const state = disaster.state.toLowerCase();
      const disasterType = disaster.disasterType.toLowerCase();

      // Check if article mentions the state or disaster type
      if (
        articleText.includes(state) ||
        articleText.includes(disasterType) ||
        articleText.includes(disaster.title.toLowerCase())
      ) {
        relatedDisasters.push(disaster);
      }
    }

    if (relatedDisasters.length > 0) {
      correlations.set(article.url, relatedDisasters);
    }
  }

  return correlations;
}

/**
 * Correlate weather alerts with article locations
 */
export function correlateWeatherWithArticles(
  alerts: WeatherAlert[],
  articles: any[]
): Map<string, WeatherAlert[]> {
  const correlations = new Map<string, WeatherAlert[]>();

  for (const article of articles) {
    const articleText = `${article.title} ${article.description}`.toLowerCase();
    const relatedAlerts: WeatherAlert[] = [];

    for (const alert of alerts) {
      const areaDesc = alert.areaDesc.toLowerCase();
      const event = alert.event.toLowerCase();

      // Check if article mentions the area or event type
      if (articleText.includes(areaDesc) || articleText.includes(event)) {
        relatedAlerts.push(alert);
      }
    }

    if (relatedAlerts.length > 0) {
      correlations.set(article.url, relatedAlerts);
    }
  }

  return correlations;
}

