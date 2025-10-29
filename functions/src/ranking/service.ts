/**
 * Ranking Service
 * Implements materiality scoring and event ranking algorithms
 */

import { db } from '../ingestion/firebase';
import { MaterialityScore, RankingResult, UserInterests } from './types';

export class RankingService {
  private readonly MATERIALITY_WEIGHTS = {
    severity: 0.3,
    insuredLoss: 0.25,
    regulatory: 0.2,
    lob: 0.15,
    novelty: 0.1,
  };

  private readonly RANKING_WEIGHTS = {
    materiality: 0.4,
    freshness: 0.25,
    sourceQuality: 0.15,
    userInterest: 0.2,
  };

  /**
   * Calculate materiality score for an event
   */
  calculateMaterialityScore(event: Record<string, unknown>): MaterialityScore {
    const eventSeverity = (event.severityScore as number) || 50;
    const insuredLoss = this.estimateInsuredLoss(event);
    const regulatoryImpact = (event.regulatoryFlags as string[])?.length > 0 ? 75 : 25;
    const affectedLOB = Math.min((event.lob as string[])?.length * 20, 100);
    const novelty = this.calculateNovelty(event);

    const breakdown = {
      severity: eventSeverity,
      insuredLoss,
      regulatory: regulatoryImpact,
      lob: affectedLOB,
      novelty,
    };

    const finalScore =
      breakdown.severity * this.MATERIALITY_WEIGHTS.severity +
      breakdown.insuredLoss * this.MATERIALITY_WEIGHTS.insuredLoss +
      breakdown.regulatory * this.MATERIALITY_WEIGHTS.regulatory +
      breakdown.lob * this.MATERIALITY_WEIGHTS.lob +
      breakdown.novelty * this.MATERIALITY_WEIGHTS.novelty;

    return {
      eventId: event.id as string,
      baseScore: 50,
      eventSeverity,
      insuredLoss,
      regulatoryImpact,
      affectedLOB,
      novelty,
      finalScore: Math.round(finalScore),
      breakdown,
    };
  }

  /**
   * Estimate insured loss based on event characteristics
   */
  private estimateInsuredLoss(event: Record<string, unknown>): number {
    const eventType = event.eventType as string;
    const keyNumbers = (event.keyNumbers as string[]) || [];

    let baseScore = 25;

    if (eventType === 'catastrophe') {
      baseScore = 85;
    } else if (eventType === 'regulatory') {
      baseScore = 60;
    } else if (eventType === 'market') {
      baseScore = 45;
    }

    // Boost if large numbers mentioned
    const hasLargeNumbers = keyNumbers.some((num) => {
      const parsed = parseInt(num.replace(/[^0-9]/g, ''), 10);
      return parsed > 1000000000; // > $1B
    });

    if (hasLargeNumbers) {
      baseScore = Math.min(baseScore + 25, 100);
    }

    return baseScore;
  }

  /**
   * Calculate novelty score
   */
  private calculateNovelty(event: Record<string, unknown>): number {
    const createdAt = new Date((event.createdAt as string) || new Date().toISOString());
    const now = new Date();
    const ageHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    // Decay novelty over time
    if (ageHours < 1) return 100;
    if (ageHours < 6) return 80;
    if (ageHours < 24) return 60;
    if (ageHours < 72) return 40;
    return 20;
  }

  /**
   * Calculate freshness score
   */
  private calculateFreshnessScore(publishedAt: string): number {
    const published = new Date(publishedAt);
    const now = new Date();
    const ageHours = (now.getTime() - published.getTime()) / (1000 * 60 * 60);

    if (ageHours < 1) return 100;
    if (ageHours < 6) return 85;
    if (ageHours < 24) return 70;
    if (ageHours < 72) return 50;
    if (ageHours < 168) return 30;
    return 10;
  }

  /**
   * Calculate source quality score
   */
  private async calculateSourceQualityScore(sourceId: string): Promise<number> {
    try {
      const sourceDoc = await db.collection('ingestionSources').doc(sourceId).get();
      if (!sourceDoc.exists) return 50;

      const source = sourceDoc.data();
      if (!source) return 50;

      const isOfficialSource = ['SEC', 'NAIC', 'FEMA', 'Reuters', 'Bloomberg'].some((s) =>
        (source.name as string)?.includes(s)
      );

      return isOfficialSource ? 90 : 70;
    } catch {
      return 50;
    }
  }

  /**
   * Calculate user interest score
   */
  private calculateUserInterestScore(event: Record<string, unknown>, userInterests: UserInterests): number {
    let score = 0;
    let matchCount = 0;

    // Check LOB matches
    const eventLOBs = (event.lob as string[]) || [];
    const lobMatches = eventLOBs.filter((lob) => userInterests.preferredLOBs.includes(lob)).length;
    if (lobMatches > 0) {
      score += 25;
      matchCount++;
    }

    // Check peril matches
    const eventPerils = (event.perils as string[]) || [];
    const perilMatches = eventPerils.filter((peril) => userInterests.preferredPerils.includes(peril)).length;
    if (perilMatches > 0) {
      score += 25;
      matchCount++;
    }

    // Check region matches
    const eventRegions = (event.regions as string[]) || [];
    const regionMatches = eventRegions.filter((region) => userInterests.preferredRegions.includes(region)).length;
    if (regionMatches > 0) {
      score += 25;
      matchCount++;
    }

    // Check company matches
    const eventCompanies = (event.companies as string[]) || [];
    const companyMatches = eventCompanies.filter((company) => userInterests.preferredCompanies.includes(company))
      .length;
    if (companyMatches > 0) {
      score += 25;
      matchCount++;
    }

    return matchCount > 0 ? Math.min(score, 100) : 50;
  }

  /**
   * Rank events for a user
   */
  async rankEvents(
    events: Record<string, unknown>[],
    userInterests?: UserInterests
  ): Promise<RankingResult[]> {
    const results: RankingResult[] = [];

    for (const event of events) {
      const materialityScore = this.calculateMaterialityScore(event);
      const freshnessScore = this.calculateFreshnessScore((event.publishedAt as string) || new Date().toISOString());
      const sourceQualityScore = await this.calculateSourceQualityScore((event.sourceId as string) || '');
      const userInterestScore = userInterests
        ? this.calculateUserInterestScore(event, userInterests)
        : 50;

      const finalScore =
        materialityScore.finalScore * this.RANKING_WEIGHTS.materiality +
        freshnessScore * this.RANKING_WEIGHTS.freshness +
        sourceQualityScore * this.RANKING_WEIGHTS.sourceQuality +
        userInterestScore * this.RANKING_WEIGHTS.userInterest;

      results.push({
        eventId: event.id as string,
        title: (event.title as string) || '',
        scores: {
          eventId: event.id as string,
          materialityScore: materialityScore.finalScore,
          freshnessScore,
          sourceQualityScore,
          userInterestScore,
          finalScore: Math.round(finalScore),
          rank: 0,
        },
        rank: 0,
        relevanceExplanation: `Materiality: ${materialityScore.finalScore}, Freshness: ${freshnessScore}, Quality: ${sourceQualityScore}`,
      });
    }

    // Sort by final score and assign ranks
    results.sort((a, b) => b.scores.finalScore - a.scores.finalScore);
    results.forEach((result, index) => {
      result.rank = index + 1;
      result.scores.rank = index + 1;
    });

    return results;
  }
}

export default new RankingService();

