# CarrierSignal AI Scoring & Ranking System - Enhancements

## Overview

The enhanced AI scoring and ranking system dynamically sorts articles based on **relevance**, **level of interest**, and **recency**. Scores update over time so that older articles naturally appear lower on the AI sort feed.

## Key Improvements

### 1. Dynamic Recency Decay (v4)

**Problem Solved**: Previous system calculated scores once at ingestion; older articles maintained high scores indefinitely.

**Solution**: Implemented sophisticated decay curves that vary by content type:

- **Catastrophe News** (72-hour half-life): High relevance for 72 hours, then gradual decay
  - Formula: `100 * exp(-age^1.2 / 100)`
  - Stays relevant longer due to ongoing impact

- **Regulatory News** (48-hour half-life): High relevance for 48 hours, then gradual decay
  - Formula: `100 * exp(-age^1.1 / 80)`
  - Compliance-critical but time-sensitive

- **Evergreen Content** (10-day half-life): Slow decay, maintains relevance for weeks
  - Formula: `100 * exp(-age / 240)`
  - Structural changes, trends, best practices

- **General News** (24-hour half-life): Fast decay, quickly becomes less relevant
  - Formula: `100 * exp(-age / 24)`
  - Breaking news, company announcements

### 2. Interest-Based Scoring

**Problem Solved**: No engagement metrics; all users saw identical rankings regardless of professional interest.

**Solution**: Integrated engagement metrics that boost scores based on user interactions:

- **Clicks** (40% weight): Direct engagement signal
- **Saves/Bookmarks** (35% weight): Indicates high professional value
- **Shares** (15% weight): Peer validation and relevance
- **Time Spent** (10% weight): Reading depth and engagement

Engagement boost: Up to 15% score increase based on normalized metrics

### 3. Dynamic Weight Adjustment

**Problem Solved**: Fixed weights (35% recency, 65% impact) didn't adapt to article age.

**Solution**: Adaptive weighting based on article age:

- **Fresh Content** (< 24 hours): 50% recency, 50% impact
  - Prioritizes breaking news and urgent developments
  
- **Standard Content** (1-7 days): 35% recency, 65% impact
  - Balanced approach for typical news

- **Older Content** (> 7 days): 25% recency, 75% impact
  - Prioritizes substance over timing for evergreen content

### 4. Real-Time Score Updates

**Problem Solved**: Scores were static; users saw stale rankings that didn't reflect current relevance.

**Solution**: Implemented periodic score recalculation:

- **Update Frequency**: Every 60 seconds (configurable)
- **Scope**: Only for "smart" sort mode
- **Mechanism**: `useRealTimeScoring` hook recalculates all scores and re-ranks articles
- **Performance**: Efficient client-side calculation, no backend calls

### 5. Enhanced Multipliers

Maintained and refined existing boost mechanisms:

- **Risk Pulse Multiplier**: 1.0x (LOW) → 1.25x (HIGH)
- **Regulatory Boost**: 1.2x for regulatory content
- **Catastrophe Boost**: 1.3x for named storms, 1.15x for CAT perils
- **Trend Boost**: 1.1x for high-value trends
- **LOB Boost**: 1.08x for 3+ LOBs, 1.04x for 2+ LOBs

## Implementation Details

### Backend Changes

**File**: `functions/src/utils.ts`

- Enhanced `calculateSmartScore()` function with dynamic decay curves
- New `calculateDynamicScore()` function for real-time calculation
- Support for engagement metrics in scoring

**File**: `src/types/index.ts`

- Added `engagementMetrics` field to Article interface
- Added `isEvergreen` flag for content classification

### Frontend Changes

**File**: `src/utils/scoring.ts` (NEW)

- `calculateDynamicArticleScore()`: Real-time score calculation
- `sortByDynamicScore()`: Sort articles by dynamic scores
- `sortByRecency()`: Sort by published date

**File**: `src/utils/engagement.ts` (NEW)

- `trackArticleClick()`: Track click events
- `trackArticleSave()`: Track save/bookmark events
- `trackArticleShare()`: Track share events
- `trackTimeSpent()`: Track reading time
- `calculateEngagementScore()`: Normalize engagement metrics

**File**: `src/hooks/useRealTimeScoring.ts` (NEW)

- `useRealTimeScoring()`: Periodic score recalculation hook
- `useArticleTimeTracking()`: Track time spent reading

**File**: `src/components/SearchFirst.tsx`

- Integrated `calculateDynamicArticleScore()` for real-time ranking
- Updated sorting logic to use dynamic scores

**File**: `src/App.tsx`

- Integrated `useRealTimeScoring()` hook
- Displays dynamically scored articles in feed and dashboard

**File**: `src/hooks/useArticles.ts`

- Enhanced to ensure `publishedAt` field is always available
- Supports dynamic score calculation

## Scoring Formula

```
baseScore = (recencyScore * recencyWeight) + (weightedImpact * impactWeight)

dynamicScore = min(100,
  baseScore *
  engagementBoost *
  riskPulseMultiplier *
  regulatoryBoost *
  catastropheBoost *
  trendBoost *
  lobBoost
)
```

## Testing

### Unit Tests

**File**: `src/utils/__tests__/scoring.test.ts`

- Tests for dynamic score calculation
- Verification of decay curves
- Boost multiplier validation
- Engagement metric integration

**File**: `src/hooks/__tests__/useRealTimeScoring.test.ts`

- Tests for periodic updates
- Verification of score recalculation
- Hook lifecycle management

### Test Coverage

- ✅ Fresh vs. old article scoring
- ✅ Catastrophe/regulatory/evergreen content decay
- ✅ Engagement boost application
- ✅ Risk pulse multiplier
- ✅ Real-time score updates
- ✅ Article re-ranking over time

## Usage

### Smart Sort (AI-Driven)

Articles are sorted by dynamic score, which:
1. Calculates recency decay based on content type
2. Applies engagement boosts
3. Adjusts weights based on article age
4. Updates every 60 seconds

### Recency Sort

Articles are sorted by published date (newest first).

### Engagement Tracking

Track user interactions to improve ranking:

```typescript
import { trackArticleClick, trackArticleSave } from '@/utils/engagement';

// Track click
await trackArticleClick(articleId);

// Track save
await trackArticleSave(articleId);
```

## Performance Considerations

- **Client-side Calculation**: No backend calls for score updates
- **Efficient Decay**: Exponential functions avoid expensive operations
- **Periodic Updates**: 60-second interval balances freshness and performance
- **Lazy Evaluation**: Scores calculated only when needed

## Future Enhancements

1. **User Preferences**: Personalize decay curves by role
2. **A/B Testing**: Test different weight distributions
3. **Machine Learning**: Learn optimal weights from user behavior
4. **Collaborative Filtering**: Recommend articles based on similar users
5. **Seasonal Adjustments**: Adjust weights for seasonal trends

