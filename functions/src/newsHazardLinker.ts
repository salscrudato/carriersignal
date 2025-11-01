/**
 * News Hazard Linker
 * Joins catastrophe/hazard data (NWS, NHC, USGS) with news articles
 */

import { Firestore } from 'firebase-admin/firestore';

interface HazardData {
  type: string;
  location: string;
  lat?: number;
  lng?: number;
  severity?: number;
  timestamp: number;
  capFields?: Record<string, unknown>;
}

interface NewsArticle {
  id: string;
  title: string;
  states: string[];
  publishedAt: number;
  hazard?: {
    type: string;
    geo?: { lat: number; lng: number };
    capFields?: Record<string, unknown>;
  };
}

/**
 * State to approximate center coordinates
 */
const STATE_COORDS: Record<string, { lat: number; lng: number }> = {
  'AL': { lat: 32.8, lng: -86.8 }, 'AK': { lat: 64.2, lng: -152.5 }, 'AZ': { lat: 33.7, lng: -111.4 },
  'AR': { lat: 34.8, lng: -92.4 }, 'CA': { lat: 36.1, lng: -119.7 }, 'CO': { lat: 39.0, lng: -105.3 },
  'CT': { lat: 41.6, lng: -72.7 }, 'DE': { lat: 39.0, lng: -75.5 }, 'FL': { lat: 27.7, lng: -81.8 },
  'GA': { lat: 33.0, lng: -83.6 }, 'HI': { lat: 21.1, lng: -157.5 }, 'ID': { lat: 44.2, lng: -114.0 },
  'IL': { lat: 40.3, lng: -88.9 }, 'IN': { lat: 39.8, lng: -86.3 }, 'IA': { lat: 42.0, lng: -93.2 },
  'KS': { lat: 38.5, lng: -96.7 }, 'KY': { lat: 37.7, lng: -84.7 }, 'LA': { lat: 31.2, lng: -91.9 },
  'ME': { lat: 44.7, lng: -69.4 }, 'MD': { lat: 39.1, lng: -76.8 }, 'MA': { lat: 42.2, lng: -71.5 },
  'MI': { lat: 43.3, lng: -84.5 }, 'MN': { lat: 45.7, lng: -93.9 }, 'MS': { lat: 32.7, lng: -89.7 },
  'MO': { lat: 38.5, lng: -92.3 }, 'MT': { lat: 47.0, lng: -109.6 }, 'NE': { lat: 41.5, lng: -99.9 },
  'NV': { lat: 38.8, lng: -117.1 }, 'NH': { lat: 43.5, lng: -71.6 }, 'NJ': { lat: 40.2, lng: -74.5 },
  'NM': { lat: 34.8, lng: -106.2 }, 'NY': { lat: 42.2, lng: -74.9 }, 'NC': { lat: 35.6, lng: -79.8 },
  'ND': { lat: 47.5, lng: -99.8 }, 'OH': { lat: 40.4, lng: -82.9 }, 'OK': { lat: 35.6, lng: -97.5 },
  'OR': { lat: 43.8, lng: -120.6 }, 'PA': { lat: 40.6, lng: -77.2 }, 'RI': { lat: 41.7, lng: -71.5 },
  'SC': { lat: 34.0, lng: -81.2 }, 'SD': { lat: 44.3, lng: -99.4 }, 'TN': { lat: 35.7, lng: -86.7 },
  'TX': { lat: 31.9, lng: -99.9 }, 'UT': { lat: 39.3, lng: -111.1 }, 'VT': { lat: 44.0, lng: -72.7 },
  'VA': { lat: 37.8, lng: -78.2 }, 'WA': { lat: 47.4, lng: -121.5 }, 'WV': { lat: 38.5, lng: -82.5 },
  'WI': { lat: 44.3, lng: -89.6 }, 'WY': { lat: 42.8, lng: -107.3 },
};

/**
 * Calculate distance between two coordinates (in miles)
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Link hazard data to articles by state and time proximity
 */
export async function linkHazardsToArticles(
  db: Firestore,
  articles: NewsArticle[],
  hazards: HazardData[],
  timeWindowHours: number = 24,
  distanceThresholdMiles: number = 200
): Promise<NewsArticle[]> {
  const now = Date.now();
  const timeWindow = timeWindowHours * 60 * 60 * 1000;

  const linkedArticles = articles.map(article => {
    // Find matching hazards
    const matchingHazards = hazards.filter(hazard => {
      // Time proximity check
      if (Math.abs(now - hazard.timestamp) > timeWindow) return false;

      // State proximity check
      if (hazard.location && article.states.some(state => hazard.location.includes(state))) {
        return true;
      }

      // Geographic proximity check (if coordinates available)
      if (hazard.lat && hazard.lng && article.states.length > 0) {
        const stateCoord = STATE_COORDS[article.states[0]];
        if (stateCoord) {
          const distance = calculateDistance(stateCoord.lat, stateCoord.lng, hazard.lat, hazard.lng);
          return distance <= distanceThresholdMiles;
        }
      }

      return false;
    });

    // Attach hazard data to article
    if (matchingHazards.length > 0) {
      const primaryHazard = matchingHazards[0];
      return {
        ...article,
        hazard: {
          type: primaryHazard.type,
          geo: primaryHazard.lat && primaryHazard.lng ? { lat: primaryHazard.lat, lng: primaryHazard.lng } : undefined,
          capFields: primaryHazard.capFields,
        },
      };
    }

    return article;
  });

  return linkedArticles;
}

/**
 * Fetch NWS alerts from ATOM feed
 */
export async function fetchNWSAlerts(): Promise<HazardData[]> {
  try {
    // This would fetch from https://api.weather.gov/alerts/active
    // For now, return empty array - implement actual fetching in production
    console.log('[HAZARD] NWS alerts fetch not yet implemented');
    return [];
  } catch (error) {
    console.error('[HAZARD] Failed to fetch NWS alerts:', error);
    return [];
  }
}

/**
 * Fetch NHC advisories from RSS
 */
export async function fetchNHCAdvisories(): Promise<HazardData[]> {
  try {
    // This would fetch from https://www.nhc.noaa.gov/rss_besttrack.xml
    // For now, return empty array - implement actual fetching in production
    console.log('[HAZARD] NHC advisories fetch not yet implemented');
    return [];
  } catch (error) {
    console.error('[HAZARD] Failed to fetch NHC advisories:', error);
    return [];
  }
}

/**
 * Fetch USGS earthquakes from ATOM feed
 */
export async function fetchUSGSEarthquakes(): Promise<HazardData[]> {
  try {
    // This would fetch from https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.atom
    // For now, return empty array - implement actual fetching in production
    console.log('[HAZARD] USGS earthquakes fetch not yet implemented');
    return [];
  } catch (error) {
    console.error('[HAZARD] Failed to fetch USGS earthquakes:', error);
    return [];
  }
}

/**
 * Main hazard linker orchestrator
 */
export async function linkAllHazards(db: Firestore): Promise<void> {
  try {
    console.log('[HAZARD] Starting hazard linking...');

    // Fetch all hazard data
    const [nwsAlerts, nhcAdvisories, usgsEarthquakes] = await Promise.all([
      fetchNWSAlerts(),
      fetchNHCAdvisories(),
      fetchUSGSEarthquakes(),
    ]);

    const allHazards = [...nwsAlerts, ...nhcAdvisories, ...usgsEarthquakes];
    console.log(`[HAZARD] Fetched ${allHazards.length} hazard events`);

    if (allHazards.length === 0) {
      console.log('[HAZARD] No active hazards to link');
      return;
    }

    // Fetch recent articles
    const articlesSnapshot = await db
      .collection('newsArticles')
      .where('publishedAt', '>', Date.now() - 24 * 60 * 60 * 1000)
      .limit(1000)
      .get();

    const articles = articlesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsArticle));

    // Link hazards to articles
    const linkedArticles = await linkHazardsToArticles(db, articles, allHazards);

    // Update articles with hazard data
    const batch = db.batch();
    for (const article of linkedArticles) {
      if (article.hazard) {
        const ref = db.collection('newsArticles').doc(article.id);
        batch.update(ref, {
          hazard: article.hazard,
          updatedAt: Date.now(),
        });
      }
    }
    await batch.commit();

    console.log(`[HAZARD] Linked ${linkedArticles.filter(a => a.hazard).length} articles to hazards`);
  } catch (error) {
    console.error('[HAZARD] Hazard linking failed:', error);
    throw error;
  }
}

