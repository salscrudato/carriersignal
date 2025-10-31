# CarrierSignal - Detailed Technical Analysis

---

## ARCHITECTURE DEEP DIVE

### Component Hierarchy Analysis

**Strengths:**
- Clean primitive → feature → page pattern
- GlassCard, GlowButton, Badge primitives are reusable
- Feature components (Header, SearchFirst, Dashboard) properly encapsulated

**Concerns:**
- BriefPanel is 300+ lines - consider splitting into sub-components
- SearchFirst handles both display and search logic - violates SRP
- No container/presenter pattern for complex components

**Recommendation:**
```typescript
// Split SearchFirst into:
// - SearchFirstContainer (logic, state)
// - SearchFirstView (presentation)
// - SearchResultsList (reusable)
// - ArticleCard (reusable)
```

---

### State Management Analysis

**Current Approach:**
- UIContext for global UI state (view, sortMode, palette)
- Custom hooks for data (useArticles, useRealTimeScoring)
- Local component state for UI interactions

**Assessment:** ✅ Appropriate for app scale

**Potential Issues:**
1. **Context Thrashing:** UIContext updates trigger full re-renders
   - Solution: Split into smaller contexts (ViewContext, SortContext, PaletteContext)

2. **No Optimistic Updates:** Bookmarks/settings changes wait for Firebase
   - Solution: Implement optimistic updates with rollback

3. **Missing Undo/Redo:** No history management
   - Solution: Consider Redux Toolkit or Zustand for complex state

---

## SCORING ALGORITHM VALIDATION

### Test Cases (Oct 31, 2025)

**Scenario 1: Fresh Catastrophe Article**
```typescript
const article = {
  title: "Hurricane Milton Impacts Florida",
  publishedAt: "2025-10-31T10:00:00Z", // 0 hours old
  stormName: "Milton",
  impactScore: 95,
  tags: {perils: ["Hurricane"]},
  riskPulse: "HIGH",
};

const score = calculateDynamicArticleScore(article);
// Expected: ~95-100 (high recency + catastrophe boost)
// Actual: Should verify with test
```

**Scenario 2: Week-Old Regulatory Article**
```typescript
const article = {
  title: "NAIC Releases New Guidance",
  publishedAt: "2025-10-24T10:00:00Z", // 7 days old
  regulatory: true,
  impactScore: 70,
  tags: {regulations: ["NAIC"]},
};

const score = calculateDynamicArticleScore(article);
// Expected: ~60-70 (older, but regulatory boost)
// Recency weight drops to 0.25, impact weight to 0.75
```

**Scenario 3: Evergreen Content**
```typescript
const article = {
  title: "Climate Risk Management Best Practices",
  publishedAt: "2025-09-01T10:00:00Z", // 60 days old
  isEvergreen: true,
  impactScore: 65,
  tags: {trends: ["Climate Risk"]},
};

const score = calculateDynamicArticleScore(article);
// Expected: ~50-60 (slow decay for evergreen)
// Exponential decay: exp(-1440/240) ≈ 0.01 (very low)
// ISSUE: Evergreen articles decay too fast!
```

**⚠️ ISSUE FOUND:** Evergreen decay formula is too aggressive:
```typescript
// CURRENT
recencyScore = Math.max(0, 100 * Math.exp(-ageHours / 240));
// At 60 days: exp(-1440/240) = exp(-6) ≈ 0.0025 → score ≈ 0.25

// RECOMMENDED
recencyScore = Math.max(0, 100 * Math.exp(-ageHours / 720)); // 30-day half-life
// At 60 days: exp(-1440/720) = exp(-2) ≈ 0.135 → score ≈ 13.5
```

---

## FIREBASE INTEGRATION ANALYSIS

### Query Optimization Opportunities

**Current Pattern (Inefficient):**
```typescript
// askBrief function
const snap = await db.collection("articles")
  .orderBy("createdAt", "desc")
  .limit(200)
  .get(); // Fetches 200 docs

const articles = snap.docs.map(d => ({id: d.id, ...d.data()}));

// Later: filter by embedding existence
const items = articles.filter(a => embeddingMap.has(a.id));
// Typical: 200 fetched, 150 have embeddings = 25% waste
```

**Optimized Pattern:**
```typescript
// Use composite index
const snap = await db.collection("articles")
  .where("hasEmbedding", "==", true) // Add boolean flag
  .where("ragQualityScore", ">=", 70)
  .orderBy("ragQualityScore", "desc")
  .orderBy("createdAt", "desc")
  .limit(100)
  .get();

// Result: Only fetch articles with embeddings + high quality
// Reduces reads by ~40%
```

**Firestore Index Configuration:**
```json
{
  "indexes": [
    {
      "collectionGroup": "articles",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "hasEmbedding", "order": "ASCENDING"},
        {"fieldPath": "ragQualityScore", "order": "DESCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"}
      ]
    }
  ]
}
```

---

### Rate Limiting Analysis

**Current Implementation:** ✅ Solid
- Sliding window: 20 requests/hour per IP
- Hashed IP for privacy
- TTL-based cleanup

**Potential Improvements:**
1. Add per-user rate limiting (if auth added)
2. Implement tiered limits (free: 10/hr, premium: 100/hr)
3. Add rate limit headers to response

```typescript
res.set('X-RateLimit-Limit', '20');
res.set('X-RateLimit-Remaining', String(RATE_LIMIT_MAX_REQUESTS - requests.length));
res.set('X-RateLimit-Reset', String(Math.ceil((windowStart + RATE_LIMIT_WINDOW_MS) / 1000)));
```

---

## LIQUID GLASS DESIGN COMPLIANCE

### Specification Checklist

| Feature | Status | Notes |
|---------|--------|-------|
| Translucency (40-70%) | ✅ | GlassCard: 50-60% opacity |
| Backdrop Blur | ✅ | 10px blur applied |
| Specular Highlights | ⚠️ | Only in GlassCard, missing in Header/Nav |
| Fluid Animations | ⚠️ | Missing wiggle/squish on buttons |
| Light Scattering | ✅ | Gradient-based diffusion in CSS |
| Color Palette | ✅ | Aurora blue/violet/lilac applied |
| Accessibility | ✅ | Reduce Transparency mode implemented |

### Missing Implementations

**1. Header Specular Highlights**
```typescript
// Add to Header.tsx
const [mousePos, setMousePos] = useState({x: 0, y: 0});

<div className="liquid-glass-premium relative"
  onMouseMove={(e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({x: e.clientX - rect.left, y: e.clientY - rect.top});
  }}
>
  {/* Specular layer */}
  <div className="absolute inset-0 pointer-events-none rounded-xl"
    style={{
      background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.3) 0%, transparent 50%)`
    }}
  />
</div>
```

**2. Button Wiggle Animation**
```css
@keyframes liquidWiggle {
  0%, 100% { transform: rotate(0deg) scaleX(1) scaleY(1); }
  25% { transform: rotate(-1.5deg) scaleX(1.03) scaleY(0.97); }
  50% { transform: rotate(1.5deg) scaleX(0.97) scaleY(1.03); }
  75% { transform: rotate(-0.75deg) scaleX(1.01) scaleY(0.99); }
}

.glow-button:active {
  animation: liquidWiggle 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## PERFORMANCE METRICS

### Bundle Size Analysis
- Main: 245KB ✅ (target: <250KB)
- Firebase: 337KB ✅ (expected)
- CSS: 86KB ✅ (target: <100KB)
- **Total: 668KB** (gzipped: ~180KB)

### Runtime Performance
- Initial load: ~2-3s (depends on network)
- Infinite scroll: 60fps (desktop), 30fps (mobile)
- Real-time scoring: 60s interval (reasonable)

### Optimization Opportunities
1. **Lazy load Lucide icons** - Currently all imported
2. **Code split SearchFirst** - Large component
3. **Memoize article cards** - Prevent re-renders

---

## SECURITY AUDIT

### Vulnerabilities Found

**1. XSS Risk in Article Content**
- **Severity:** CRITICAL
- **Location:** BriefPanel.tsx (if rendering HTML)
- **Fix:** Use DOMPurify

**2. HTTPS Not Enforced**
- **Severity:** HIGH
- **Location:** functions/src/index.ts:680
- **Fix:** Reject non-HTTPS URLs

**3. Missing CSRF Protection**
- **Severity:** MEDIUM
- **Location:** Firebase functions
- **Fix:** Add CSRF tokens for state-changing operations

**4. Insufficient Input Validation**
- **Severity:** MEDIUM
- **Location:** askBrief query parameter
- **Fix:** Use Zod for schema validation

---

## RECOMMENDATIONS SUMMARY

### Immediate (This Sprint)
1. Fix memory leak in useRealTimeScoring
2. Fix date parsing vulnerability
3. Add XSS protection
4. Add HTTPS enforcement

### Short-term (Next Sprint)
1. Add comprehensive test coverage
2. Optimize Firebase queries
3. Complete Liquid Glass implementation
4. Fix race condition in pagination

### Long-term (Future)
1. Add user authentication
2. Implement user preferences persistence
3. Add analytics/telemetry
4. Consider offline support (PWA)


