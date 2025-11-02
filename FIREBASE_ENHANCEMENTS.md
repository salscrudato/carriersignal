# Firebase Functions Enhancements: Best-in-Class AI News Feed

## Overview

Comprehensive enhancement suite for CarrierSignal's Firebase Functions to ensure reliable 12-hour update cycles with advanced monitoring, intelligent scheduling, real-time scoring, and dynamic feed prioritization.

## Key Enhancements

### 1. **Comprehensive Monitoring & Observability** (`monitoring.ts`)

**Purpose**: Real-time health tracking and cycle metrics collection

**Features**:
- Cycle-based metrics tracking (start/end times, success rates, latency)
- Automatic anomaly detection (high error rates, latency spikes, feed failures)
- Alert generation with severity levels (info, warning, critical)
- Metrics buffer with automatic Firestore persistence
- Memory and CPU usage tracking

**Collections**:
- `monitoring_cycles`: Complete cycle records with metrics and alerts
- `metrics_aggregated`: Aggregated metrics for analytics

**Usage**:
```typescript
monitoring.startCycle(cycleId);
monitoring.recordMetrics({articlesProcessed: 100, errors: 2, ...});
await monitoring.completeCycle('completed');
```

### 2. **Advanced Scheduling with Fallback** (`advancedScheduling.ts`)

**Purpose**: Ensure 12-hour cycles complete with automatic recovery

**Features**:
- Cycle registration and state tracking
- Automatic retry logic (max 3 retries with 5-minute delays)
- Timeout detection (45-minute limit per cycle)
- Fallback task creation for manual intervention
- Overdue cycle detection and recovery

**Collections**:
- `schedule_state`: Current state of each cycle
- `retry_queue`: Pending retries with scheduling info
- `fallback_tasks`: Tasks requiring manual intervention

**Guarantees**:
- No cycle left behind (automatic recovery)
- Exponential backoff for retries
- Clear audit trail of all attempts

### 3. **Health Check Service** (`healthCheck.ts`)

**Purpose**: Comprehensive system health status API

**Endpoints**:
- `getSystemHealth()`: Full system status with alerts
- `getCycleStatus()`: Current 12-hour cycle status
- `isCycleOverdue()`: Boolean check for overdue cycles

**Metrics Tracked**:
- Hours since last cycle
- Next scheduled cycle time
- Article count in database
- Average success rate
- Recent error count
- Feed health status
- Recent alerts (last 24 hours)

**Status Levels**:
- `healthy`: Cycle on schedule, >80% success rate
- `degraded`: Cycle slightly late or 50-80% success rate
- `unhealthy`: Cycle overdue (>13 hours) or <50% success rate

### 4. **Intelligent Deduplication** (`deduplication.ts`)

**Purpose**: Prevent duplicate articles and ensure content freshness

**Deduplication Methods**:
1. **URL-based**: Exact URL matching (confidence: 1.0)
2. **Content Hash**: SHA-256 content matching (confidence: 0.95)
3. **Title Similarity**: Fuzzy matching with Levenshtein distance (confidence: 0.85+)

**Freshness Scoring**:
- 100 points: Fresh (<24 hours)
- Decays 10 points per day for first 7 days
- Decays 5 points per day after 7 days
- Stale threshold: 7 days

**Collections**:
- `newsArticles`: Stores deduplication metadata

### 5. **Real-time Scoring System** (`realtimeScoring.ts`)

**Purpose**: Continuous AI score updates between 12-hour cycles

**Scoring Components**:
- **Recency Decay**: 5% decay per hour (exponential)
- **Engagement Boost**: Based on user interactions (views, clicks, bookmarks, shares)
- **Trending Boost**: 10% of trend score for trending topics
- **Max Score**: 100 points

**Update Frequency**:
- Hourly recalculation for top 100 articles
- Trending topic boosts applied continuously
- Score history maintained for analytics

**Collections**:
- `trending_topics`: Current trending topics with scores
- `user_interactions`: User engagement events

### 6. **Smart Feed Prioritization** (`feedPrioritization.ts`)

**Purpose**: ML-based feed source prioritization and dynamic weight adjustment

**Priority Calculation**:
- Quality Score (30%): Content quality metrics
- Relevance Score (30%): P&C insurance relevance
- Reliability (20%): Success rate and uptime
- Latency (20%): Average response time

**Priority Levels**:
- `critical` (weight: 2.0): Score ≥85
- `high` (weight: 1.5): Score 70-84
- `medium` (weight: 1.0): Score 50-69
- `low` (weight: 0.5): Score <50

**Dynamic Adjustment**:
- Every 6 hours via scheduled function
- Based on rolling averages of feed performance
- Automatic weight redistribution

**Collections**:
- `feed_metrics`: Performance metrics per feed
- `feed_priorities`: Current priority assignments

## New HTTP Endpoints

### Health & Monitoring
- `GET /getSystemHealth`: Full system health status
- `GET /getCycleStatus`: Current cycle status
- `POST /checkOverdueCycles`: Trigger overdue cycle recovery

### Scoring & Prioritization
- `POST /updateRealtimeScores?limit=50`: Recalculate top article scores
- `GET /getFeedPriorities`: View all feed priorities
- `POST /adjustFeedWeights`: Manually trigger weight adjustment

## New Scheduled Functions

### Hourly (Every 1 hour)
- `scheduledRealtimeScoring`: Update top 100 article scores + trending boosts

### Every 6 Hours
- `scheduledFeedWeightAdjustment`: Recalculate feed priorities and weights

### Every 30 Minutes
- `scheduledOverdueCheck`: Detect and recover from overdue cycles

## Integration with Existing Functions

### `refreshFeeds` (Every 12 hours)
Enhanced with:
- Cycle registration and state tracking
- Comprehensive metrics collection
- Automatic retry on failure
- Monitoring cycle completion

### `comprehensiveIngest` (Every 12 hours)
Enhanced with:
- Deduplication checks
- Freshness scoring
- Feed prioritization weights
- Monitoring integration

## Firestore Collections

### New Collections
- `monitoring_cycles`: Cycle metrics and alerts
- `metrics_aggregated`: Aggregated analytics
- `schedule_state`: Cycle scheduling state
- `retry_queue`: Pending retries
- `fallback_tasks`: Manual intervention tasks
- `feed_metrics`: Feed performance data
- `feed_priorities`: Feed priority assignments
- `trending_topics`: Trending topic tracking
- `user_interactions`: User engagement events

### Indexes Required
```
monitoring_cycles: status + startTime DESC
schedule_state: status + scheduledTime
retry_queue: status + scheduledFor
feed_metrics: feedUrl (unique)
feed_priorities: priority + weight DESC
trending_topics: score DESC
user_interactions: articleId + timestamp DESC
```

## Monitoring Dashboard Queries

### System Health
```
GET /getSystemHealth
```

### Cycle Performance
```
db.collection('monitoring_cycles')
  .where('status', '==', 'completed')
  .orderBy('endTime', 'desc')
  .limit(10)
```

### Feed Performance
```
db.collection('feed_metrics')
  .orderBy('successRate', 'desc')
```

### Recent Alerts
```
db.collection('monitoring_cycles')
  .where('startTime', '>=', oneHourAgo)
  .where('alerts', '!=', [])
```

## Performance Targets

- **12-hour cycle completion**: 100% (with automatic recovery)
- **Article processing**: <100ms per article
- **Feed fetch latency**: <5 seconds per feed
- **AI scoring latency**: <2 seconds per article
- **Success rate**: >95% (with retries)
- **System availability**: 99.9%

## Deployment

1. Deploy new monitoring modules:
   ```bash
   firebase deploy --only functions
   ```

2. Create Firestore indexes:
   ```bash
   firebase deploy --only firestore:indexes
   ```

3. Verify health endpoint:
   ```bash
   curl https://[project].cloudfunctions.net/getSystemHealth
   ```

## Troubleshooting

### Overdue Cycles
- Check `schedule_state` collection for failed cycles
- Review `retry_queue` for pending retries
- Check `fallback_tasks` for manual intervention needs

### Low Success Rates
- Review `monitoring_cycles` for error patterns
- Check `feed_metrics` for problematic feeds
- Examine `feed_priorities` for weight distribution

### High Latency
- Monitor `feed_metrics.avgLatency`
- Check `monitoring_cycles.avgLatency`
- Review feed source performance

## Future Enhancements

- OpenTelemetry integration for distributed tracing
- Machine learning for anomaly detection
- Predictive cycle failure prevention
- Advanced feed source ML ranking
- Real-time dashboard with WebSocket updates

