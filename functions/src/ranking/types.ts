/**
 * Ranking and Materiality Types
 * Defines interfaces for ranking and personalization
 */

export interface MaterialityScore {
  eventId: string;
  baseScore: number; // 0-100
  eventSeverity: number; // 0-100
  insuredLoss: number; // 0-100
  regulatoryImpact: number; // 0-100
  affectedLOB: number; // 0-100
  novelty: number; // 0-100
  finalScore: number; // 0-100
  breakdown: {
    severity: number; // 30%
    insuredLoss: number; // 25%
    regulatory: number; // 20%
    lob: number; // 15%
    novelty: number; // 10%
  };
}

export interface RankingScore {
  eventId: string;
  materialityScore: number; // 40%
  freshnessScore: number; // 25%
  sourceQualityScore: number; // 15%
  userInterestScore: number; // 20%
  finalScore: number; // 0-100
  rank: number;
}

export interface UserInterests {
  userId: string;
  preferredLOBs: string[];
  preferredPerils: string[];
  preferredRegions: string[];
  preferredCompanies: string[];
  excludedTopics: string[];
  interestWeights: Record<string, number>;
}

export interface SavedFilter {
  id: string;
  userId: string;
  name: string;
  description: string;
  filters: {
    lob?: string[];
    perils?: string[];
    regions?: string[];
    companies?: string[];
    riskPulse?: string;
    dateRange?: {
      start: string;
      end: string;
    };
  };
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
}

export interface RankingResult {
  eventId: string;
  title: string;
  scores: RankingScore;
  rank: number;
  relevanceExplanation: string;
}

export interface SourceQuality {
  source: string;
  reliability: number; // 0-100
  accuracy: number; // 0-100
  timeliness: number; // 0-100
  coverage: number; // 0-100
  overallScore: number; // 0-100
}

