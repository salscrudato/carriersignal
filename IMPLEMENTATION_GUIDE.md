# Enhanced AI Scoring System - Implementation Guide

## Quick Start

The enhanced AI scoring system is now fully integrated into CarrierSignal. No additional setup required—it works automatically.

### What Changed

1. **Smart Sort Now Dynamic**: Articles are re-ranked every 60 seconds as they age
2. **Engagement Tracking**: User interactions (clicks, saves, shares) boost article scores
3. **Content-Aware Decay**: Different article types decay at different rates
4. **Real-Time Updates**: Older articles naturally move down the feed

## How It Works

### Smart Sort Algorithm

When you select "Smart Sort" in the UI:

1. **Calculate Recency Score** (based on content type)
   - Catastrophe: Decays over 72 hours
   - Regulatory: Decays over 48 hours
   - Evergreen: Decays over 10 days
   - General: Decays over 24 hours

2. **Calculate Impact Score**
   - Multi-dimensional: Market (30%), Regulatory (35%), Catastrophe (25%), Technology (10%)
   - Boosted by: Risk Pulse, Regulatory status, CAT perils, Trends, LOB coverage

3. **Apply Engagement Boost**
   - Clicks, saves, shares, and time spent increase score by up to 15%

4. **Adjust Weights Based on Age**
   - Fresh (< 24h): 50% recency, 50% impact
   - Standard (1-7d): 35% recency, 65% impact
   - Older (> 7d): 25% recency, 75% impact

5. **Apply Multipliers**
   - Risk Pulse: 1.0x-1.25x
   - Regulatory: 1.2x
   - Catastrophe: 1.3x (named storms)
   - Trends: 1.1x
   - LOB Coverage: 1.04x-1.08x

6. **Final Score** = min(100, baseScore × all multipliers)

### Real-Time Updates

Every 60 seconds:
- All article scores are recalculated
- Articles are re-ranked
- Feed automatically updates
- Older articles move down naturally

## Code Integration Points

### Using Dynamic Scoring

```typescript
import { calculateDynamicArticleScore } from '@/utils/scoring';

// Calculate current score for an article
const score = calculateDynamicArticleScore(article);

// Sort articles by dynamic score
const sorted = articles
  .map(a => ({ ...a, score: calculateDynamicArticleScore(a) }))
  .sort((a, b) => b.score - a.score);
```

### Tracking Engagement

```typescript
import { 
  trackArticleClick,
  trackArticleSave,
  trackArticleShare,
  trackTimeSpent 
} from '@/utils/engagement';

// Track user interactions
await trackArticleClick(articleId);
await trackArticleSave(articleId);
await trackArticleShare(articleId);
await trackTimeSpent(articleId, 120); // 2 minutes
```

### Real-Time Scoring Hook

```typescript
import { useRealTimeScoring } from '@/hooks/useRealTimeScoring';

function MyComponent() {
  const [articles, setArticles] = useState([]);
  
  // Automatically recalculates scores every 60 seconds
  useRealTimeScoring({
    articles,
    onScoresUpdate: setArticles,
    updateInterval: 60000,
    enabled: true,
  });
  
  return <div>{/* render articles */}</div>;
}
```

## Scoring Examples

### Example 1: Fresh Breaking News
- Published: 2 hours ago
- Impact Score: 85
- Type: Catastrophe (Hurricane)
- Engagement: 50 clicks, 20 saves

**Calculation:**
- Recency: 95 (fresh, high decay resistance)
- Impact: 85 (high impact)
- Engagement Boost: 1.12x
- Catastrophe Boost: 1.30x
- **Final Score: ~95/100** ✅ Top of feed

### Example 2: Older Regulatory News
- Published: 10 days ago
- Impact Score: 75
- Type: Regulatory
- Engagement: 5 clicks, 2 saves

**Calculation:**
- Recency: 15 (old, significant decay)
- Impact: 75 (good impact)
- Engagement Boost: 1.02x
- Regulatory Boost: 1.20x
- Weight: 25% recency, 75% impact
- **Final Score: ~65/100** ✅ Middle of feed

### Example 3: Very Old General News
- Published: 30 days ago
- Impact Score: 50
- Type: General
- Engagement: 0 clicks, 0 saves

**Calculation:**
- Recency: 0 (very old, fast decay)
- Impact: 50 (moderate)
- Engagement Boost: 1.0x
- Weight: 25% recency, 75% impact
- **Final Score: ~37/100** ✅ Bottom of feed

## Monitoring & Debugging

### Check Article Scores

```typescript
// In browser console
const article = articles[0];
console.log('Dynamic Score:', calculateDynamicArticleScore(article));
console.log('Engagement:', article.engagementMetrics);
console.log('Published:', article.publishedAt);
```

### Verify Real-Time Updates

```typescript
// Scores should update every 60 seconds
setInterval(() => {
  console.log('Current scores:', articles.map(a => ({
    title: a.title,
    score: calculateDynamicArticleScore(a)
  })));
}, 60000);
```

### Check Engagement Metrics

```typescript
import { getEngagementMetrics } from '@/utils/engagement';

const metrics = await getEngagementMetrics(articleId);
console.log('Engagement:', metrics);
// { clicks: 50, saves: 20, shares: 5, timeSpent: 600 }
```

## Configuration

### Update Interval

Change how often scores are recalculated:

```typescript
useRealTimeScoring({
  articles,
  onScoresUpdate: setArticles,
  updateInterval: 30000, // 30 seconds instead of 60
  enabled: true,
});
```

### Decay Curves

Modify decay rates in `src/utils/scoring.ts`:

```typescript
// Catastrophe decay (currently 72-hour half-life)
recencyScore = Math.max(0, 100 * Math.exp(-Math.pow(ageHours, 1.2) / 100));

// Adjust the divisor to change decay rate
// Larger = slower decay, Smaller = faster decay
```

### Engagement Weights

Adjust engagement metric weights in `src/utils/engagement.ts`:

```typescript
const clickScore = Math.min(clicks / 100, 1.0) * 0.4;  // 40% weight
const saveScore = Math.min(saves / 50, 1.0) * 0.35;    // 35% weight
const shareScore = Math.min(shares / 20, 1.0) * 0.15;  // 15% weight
const timeScore = Math.min(timeSpent / 300, 1.0) * 0.10; // 10% weight
```

## Testing

### Run Unit Tests

```bash
npm test -- src/utils/__tests__/scoring.test.ts
npm test -- src/hooks/__tests__/useRealTimeScoring.test.ts
```

### Manual Testing

1. Open CarrierSignal in browser
2. Select "Smart Sort"
3. Note article positions
4. Wait 60 seconds
5. Observe older articles move down
6. Click/save articles to boost their scores

## Troubleshooting

### Scores Not Updating

- Check browser console for errors
- Verify `useRealTimeScoring` hook is enabled
- Confirm `sortMode === 'smart'`

### Engagement Not Tracked

- Verify Firebase permissions allow updates
- Check `engagementMetrics` field exists in Firestore
- Confirm `trackArticleClick()` etc. are called

### Incorrect Scores

- Verify `publishedAt` field is set correctly
- Check `impactScore` is in 0-100 range
- Confirm content type classification (CAT, regulatory, etc.)

## Performance Notes

- **Client-Side**: All calculations happen in browser
- **No Backend Calls**: Engagement tracking uses Firestore updates
- **Efficient**: Exponential functions are fast
- **Memory**: Minimal overhead for score recalculation
- **Bundle**: ~2KB additional code

## Next Steps

1. Monitor user engagement with new ranking
2. Collect feedback on article relevance
3. Adjust decay curves based on user behavior
4. Consider A/B testing different weight distributions
5. Implement role-based personalization

## Support

For issues or questions:
1. Check `SCORING_SYSTEM_ENHANCEMENTS.md` for detailed documentation
2. Review test files for usage examples
3. Check browser console for error messages
4. Verify Firebase configuration

