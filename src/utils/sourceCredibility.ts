/**
 * Source Credibility Ratings for CarrierSignal
 * Provides credibility scores and badges for news sources
 */

interface SourceCredibility {
  name: string;
  credibilityScore: number; // 0-100
  category: 'premium' | 'industry' | 'regulatory' | 'general';
  badge: string;
  color: string;
}

// Comprehensive source credibility database
const SOURCE_CREDIBILITY_MAP: Record<string, SourceCredibility> = {
  // Premium Insurance News Sources (95-100)
  'Insurance Journal': {
    name: 'Insurance Journal',
    credibilityScore: 98,
    category: 'premium',
    badge: '⭐ Premium',
    color: 'bg-yellow-100 text-yellow-700',
  },
  'Claims Journal': {
    name: 'Claims Journal',
    credibilityScore: 97,
    category: 'premium',
    badge: '⭐ Premium',
    color: 'bg-yellow-100 text-yellow-700',
  },
  'Risk and Insurance': {
    name: 'Risk and Insurance',
    credibilityScore: 96,
    category: 'premium',
    badge: '⭐ Premium',
    color: 'bg-yellow-100 text-yellow-700',
  },
  'Property & Casualty 360': {
    name: 'Property & Casualty 360',
    credibilityScore: 95,
    category: 'premium',
    badge: '⭐ Premium',
    color: 'bg-yellow-100 text-yellow-700',
  },
  'Insurance Business Magazine': {
    name: 'Insurance Business Magazine',
    credibilityScore: 94,
    category: 'premium',
    badge: '⭐ Premium',
    color: 'bg-yellow-100 text-yellow-700',
  },
  'Carrier Management': {
    name: 'Carrier Management',
    credibilityScore: 93,
    category: 'premium',
    badge: '⭐ Premium',
    color: 'bg-yellow-100 text-yellow-700',
  },
  'Insurance News Net': {
    name: 'Insurance News Net',
    credibilityScore: 92,
    category: 'premium',
    badge: '⭐ Premium',
    color: 'bg-yellow-100 text-yellow-700',
  },

  // Industry Organizations (90-95)
  'Insurance Information Institute': {
    name: 'Insurance Information Institute',
    credibilityScore: 95,
    category: 'industry',
    badge: '✓ Industry',
    color: 'bg-blue-100 text-blue-700',
  },
  'A.M. Best': {
    name: 'A.M. Best',
    credibilityScore: 94,
    category: 'industry',
    badge: '✓ Industry',
    color: 'bg-blue-100 text-blue-700',
  },
  'Reinsurance News': {
    name: 'Reinsurance News',
    credibilityScore: 92,
    category: 'industry',
    badge: '✓ Industry',
    color: 'bg-blue-100 text-blue-700',
  },
  'Artemis': {
    name: 'Artemis',
    credibilityScore: 91,
    category: 'industry',
    badge: '✓ Industry',
    color: 'bg-blue-100 text-blue-700',
  },

  // Regulatory Sources (95-100)
  'California Department of Insurance': {
    name: 'California Department of Insurance',
    credibilityScore: 100,
    category: 'regulatory',
    badge: '🏛️ Regulatory',
    color: 'bg-purple-100 text-purple-700',
  },
  'Florida Office of Insurance Regulation': {
    name: 'Florida Office of Insurance Regulation',
    credibilityScore: 100,
    category: 'regulatory',
    badge: '🏛️ Regulatory',
    color: 'bg-purple-100 text-purple-700',
  },
  'NOAA': {
    name: 'NOAA',
    credibilityScore: 99,
    category: 'regulatory',
    badge: '🏛️ Regulatory',
    color: 'bg-purple-100 text-purple-700',
  },
  'USGS': {
    name: 'USGS',
    credibilityScore: 99,
    category: 'regulatory',
    badge: '🏛️ Regulatory',
    color: 'bg-purple-100 text-purple-700',
  },
  'FEMA': {
    name: 'FEMA',
    credibilityScore: 98,
    category: 'regulatory',
    badge: '🏛️ Regulatory',
    color: 'bg-purple-100 text-purple-700',
  },

  // General News (70-85)
  'Reuters': {
    name: 'Reuters',
    credibilityScore: 85,
    category: 'general',
    badge: 'General',
    color: 'bg-slate-100 text-slate-700',
  },
  'Bloomberg': {
    name: 'Bloomberg',
    credibilityScore: 84,
    category: 'general',
    badge: 'General',
    color: 'bg-slate-100 text-slate-700',
  },
  'Associated Press': {
    name: 'Associated Press',
    credibilityScore: 83,
    category: 'general',
    badge: 'General',
    color: 'bg-slate-100 text-slate-700',
  },
};

/**
 * Get credibility information for a source
 */
export function getSourceCredibility(sourceName: string): SourceCredibility {
  // Try exact match first
  if (SOURCE_CREDIBILITY_MAP[sourceName]) {
    return SOURCE_CREDIBILITY_MAP[sourceName];
  }

  // Try partial match
  for (const [key, value] of Object.entries(SOURCE_CREDIBILITY_MAP)) {
    if (sourceName.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(sourceName.toLowerCase())) {
      return value;
    }
  }

  // Default for unknown sources
  return {
    name: sourceName,
    credibilityScore: 70,
    category: 'general',
    badge: 'General',
    color: 'bg-slate-100 text-slate-700',
  };
}

/**
 * Get credibility badge color based on score
 */
export function getCredibilityBadgeColor(score: number): string {
  if (score >= 95) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
  if (score >= 90) return 'bg-blue-100 text-blue-700 border-blue-300';
  if (score >= 80) return 'bg-green-100 text-green-700 border-green-300';
  if (score >= 70) return 'bg-slate-100 text-slate-700 border-slate-300';
  return 'bg-orange-100 text-orange-700 border-orange-300';
}

/**
 * Get credibility label
 */
export function getCredibilityLabel(score: number): string {
  if (score >= 95) return 'Highly Trusted';
  if (score >= 90) return 'Trusted';
  if (score >= 80) return 'Reliable';
  if (score >= 70) return 'General';
  return 'Verify';
}

