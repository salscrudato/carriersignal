# CarrierSignal - Code Review Action Items & Fixes

---

## 🔴 CRITICAL ISSUES (Fix Before Production)

### 1. Memory Leak in useRealTimeScoring Hook
**File:** `src/hooks/useRealTimeScoring.ts`  
**Severity:** CRITICAL  
**Time:** 30 minutes

**Current Code (Lines 32-46):**
```typescript
const updateScores = useCallback(() => {
  if (!enabled || articles.length === 0) return;
  const updatedArticles = articles.map(article => ({
    ...article,
    dynamicScore: calculateDynamicArticleScore(article),
  }));
  updatedArticles.sort((a, b) => (b.dynamicScore || 0) - (a.dynamicScore || 0));
  onScoresUpdate(updatedArticles);
}, [articles, enabled, onScoresUpdate]); // ❌ PROBLEM: articles in deps
```

**Issue:** Every time articles array changes, updateScores is recreated, causing interval to be cleared and recreated. This leaks intervals.

**Fixed Code:**
```typescript
const updateScores = useCallback(() => {
  if (!enabled || articles.length === 0) return;
  const updatedArticles = articles.map(article => ({
    ...article,
    dynamicScore: calculateDynamicArticleScore(article),
  }));
  updatedArticles.sort((a, b) => (b.dynamicScore || 0) - (a.dynamicScore || 0));
  onScoresUpdate(updatedArticles);
}, [articles, enabled, onScoresUpdate]);

useEffect(() => {
  if (!enabled) {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return;
  }

  // Initial update
  updateScores();

  // Set up periodic updates
  intervalRef.current = setInterval(updateScores, updateInterval);

  return () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };
}, [updateScores, updateInterval, enabled]);
```

**Verification:**
```bash
# Check for interval leaks in DevTools
# Open Console → Performance tab → Record → Scroll for 2 minutes
# Should see stable memory, not growing intervals
```

---

### 2. Date Parsing Vulnerability in Scoring
**File:** `src/utils/scoring.ts` (Lines 15-18)  
**Severity:** CRITICAL  
**Time:** 20 minutes

**Current Code:**
```typescript
const pubDate = article.publishedAt ? new Date(article.publishedAt).getTime() : now;
const ageHours = Math.max(0, (now - pubDate) / (1000 * 60 * 60));
// If publishedAt is invalid, pubDate = NaN, ageHours = NaN
// This breaks all downstream calculations
```

**Fixed Code:**
```typescript
// Add helper function at top of file
function parseArticleDate(date: string | Date | undefined): number {
  if (!date) return Date.now();
  
  try {
    if (date instanceof Date) {
      return date.getTime();
    }
    
    const parsed = new Date(date).getTime();
    if (isNaN(parsed)) {
      console.warn('[SCORING] Invalid date:', date);
      return Date.now();
    }
    return parsed;
  } catch (error) {
    console.warn('[SCORING] Date parsing error:', error);
    return Date.now();
  }
}

// Use in calculateDynamicArticleScore
export function calculateDynamicArticleScore(article: Article): number {
  const now = Date.now();
  const pubDate = parseArticleDate(article.publishedAt);
  const ageHours = Math.max(0, (now - pubDate) / (1000 * 60 * 60));
  // ... rest of function
}
```

**Test Cases:**
```typescript
test('handles undefined publishedAt', () => {
  const score = calculateDynamicArticleScore({...mockArticle, publishedAt: undefined});
  expect(score).toBeGreaterThanOrEqual(0);
  expect(score).toBeLessThanOrEqual(100);
  expect(isNaN(score)).toBe(false);
});

test('handles invalid date string', () => {
  const score = calculateDynamicArticleScore({...mockArticle, publishedAt: 'invalid'});
  expect(score).toBeGreaterThanOrEqual(0);
  expect(score).toBeLessThanOrEqual(100);
});

test('handles Firestore Timestamp', () => {
  const score = calculateDynamicArticleScore({
    ...mockArticle,
    publishedAt: {toDate: () => new Date('2025-10-31')}
  });
  expect(score).toBeGreaterThanOrEqual(0);
});
```

---

### 3. XSS Vulnerability in Article Content
**File:** `src/components/BriefPanel.tsx`  
**Severity:** CRITICAL  
**Time:** 15 minutes

**Step 1: Install DOMPurify**
```bash
npm install dompurify @types/dompurify
```

**Step 2: Update BriefPanel.tsx**
```typescript
import DOMPurify from 'dompurify';

// In render, replace any direct HTML rendering:
// BEFORE:
<div dangerouslySetInnerHTML={{__html: article.content}} />

// AFTER:
<div>{DOMPurify.sanitize(article.content)}</div>

// Or if you need HTML rendering:
<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(article.content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'title']
  })
}} />
```

---

## 🟠 HIGH PRIORITY ISSUES (Fix This Sprint)

### 4. Race Condition in useArticles Pagination
**File:** `src/hooks/useArticles.ts`  
**Severity:** HIGH  
**Time:** 45 minutes

**Problem:** Rapid sort changes can cause multiple concurrent loadInitial calls.

**Fix:**
```typescript
const abortControllerRef = useRef<AbortController | null>(null);

const loadInitial = useCallback(async () => {
  if (isLoadingRef.current) return;
  
  // Cancel previous request
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }
  abortControllerRef.current = new AbortController();
  
  isLoadingRef.current = true;
  setLoading(true);
  setError(null);

  try {
    logger.info('useArticles', 'Loading initial articles', { pageSize, sortBy, sortOrder });
    
    lastCursorRef.current = null;
    pageCountRef.current = 0;

    const constraints: QueryConstraint[] = [
      orderBy(sortBy, sortOrder),
      limit(pageSize),
    ];

    const q = query(collection(db, 'articles'), ...constraints);
    const snapshot = await getDocs(q);

    // Check if request was aborted
    if (abortControllerRef.current?.signal.aborted) {
      console.log('[useArticles] Request aborted');
      return;
    }

    // ... rest of logic
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.log('[useArticles] Request cancelled');
      return;
    }
    // ... error handling
  } finally {
    setLoading(false);
    isLoadingRef.current = false;
  }
}, [pageSize, sortBy, sortOrder]);
```

---

### 5. Firebase Query Inefficiency
**File:** `functions/src/index.ts` (Line 1186)  
**Severity:** HIGH  
**Time:** 30 minutes

**Current:**
```typescript
const snap = await db.collection("articles").orderBy("createdAt", "desc").limit(200).get();
```

**Optimized:**
```typescript
// Add hasEmbedding flag when storing articles
await docRef.set({
  ...brief,
  hasEmbedding: true, // Add this flag
  // ... rest
});

// Then query with filter
const snap = await db.collection("articles")
  .where("hasEmbedding", "==", true)
  .where("ragQualityScore", ">=", 70)
  .orderBy("ragQualityScore", "desc")
  .orderBy("createdAt", "desc")
  .limit(100)
  .get();
```

**Add to firestore.indexes.json:**
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

### 6. Missing Error Handling in Article Processing
**File:** `functions/src/index.ts` (Lines 460-463)  
**Severity:** HIGH  
**Time:** 40 minutes

**Current:**
```typescript
const emb = await embedForRAG(client, ...); // No error handling
```

**Fixed:**
```typescript
let emb: number[] | null = null;
let embeddingError: string | null = null;

try {
  emb = await embedForRAG(client, 
    `${brief.title}\n${brief.bullets5.join("\n")}\n${Object.values(brief.whyItMatters).join("\n")}`
  );
} catch (error) {
  embeddingError = error instanceof Error ? error.message : String(error);
  console.warn(`[EMBEDDING FAILED] ${url}: ${embeddingError}`);
  // Continue without embedding - mark for retry
}

// Store article with embedding status
await docRef.set({
  ...brief,
  publishedAt: item.isoDate || item.pubDate || "",
  createdAt: new Date(),
  smartScore,
  aiScore,
  ragQualityScore: ragQuality.score,
  ragQualityIssues: ragQuality.issues,
  regionsNormalized,
  companiesNormalized,
  canonicalUrl,
  contentHash,
  clusterId,
  regulatory,
  stormName: stormName || null,
  batchProcessedAt: new Date(),
  hasEmbedding: emb !== null, // Add flag
  embeddingStatus: emb ? 'SUCCESS' : 'PENDING_RETRY',
  embeddingError: embeddingError,
});

// Only store embedding if successful
if (emb) {
  await db.collection("article_embeddings").doc(id).set({
    embedding: emb,
    articleId: id,
    createdAt: new Date(),
  });
}
```

---

### 7. HTTPS Enforcement
**File:** `functions/src/index.ts` (Lines 680-700)  
**Severity:** HIGH  
**Time:** 15 minutes

**Current:**
```typescript
async function checkLinkHealth(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow", // ❌ Could redirect to HTTP
    });
    return response.ok || (response.status >= 300 && response.status < 400);
  } catch (error) {
    return false;
  }
}
```

**Fixed:**
```typescript
async function checkLinkHealth(url: string): Promise<boolean> {
  try {
    // Reject non-HTTPS URLs
    if (!url.startsWith('https://')) {
      console.warn(`[LINK HEALTH] Rejecting non-HTTPS URL: ${url}`);
      return false;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    clearTimeout(timeoutId);
    
    // Verify response is HTTPS
    if (response.url && !response.url.startsWith('https://')) {
      console.warn(`[LINK HEALTH] URL redirected to non-HTTPS: ${response.url}`);
      return false;
    }

    return response.ok || (response.status >= 300 && response.status < 400);
  } catch (error) {
    console.warn(`[LINK HEALTH] Failed to check ${url}:`, error instanceof Error ? error.message : String(error));
    return false;
  }
}
```

---

## 🟡 MEDIUM PRIORITY ISSUES (Next Sprint)

### 8. Incomplete Liquid Glass Implementation
**Files:** `src/components/Header.tsx`, `src/components/MobileNav.tsx`  
**Severity:** MEDIUM  
**Time:** 60 minutes

Add specular highlights to Header and MobileNav components (see CODE_REVIEW_DETAILED_ANALYSIS.md for implementation).

---

### 9. Missing Fluid Animations
**File:** `src/components/primitives/GlowButton.tsx`  
**Severity:** MEDIUM  
**Time:** 30 minutes

Add wiggle animation on button press (see CODE_REVIEW_DETAILED_ANALYSIS.md for CSS).

---

### 10. Insufficient Test Coverage
**Severity:** MEDIUM  
**Time:** 120 minutes

Add tests for:
- useArticles pagination edge cases
- SearchFirst search logic
- Firebase functions (askBrief, refreshFeeds)
- Error boundary recovery

---

## DEPLOYMENT CHECKLIST

- [ ] Fix all 3 CRITICAL issues
- [ ] Fix all 4 HIGH priority issues
- [ ] Run full test suite
- [ ] Performance audit (Lighthouse)
- [ ] Security audit (OWASP)
- [ ] Manual QA testing
- [ ] Deploy to staging
- [ ] Monitor error logs for 24 hours
- [ ] Deploy to production

---

## ESTIMATED TIMELINE

| Phase | Issues | Time | Status |
|-------|--------|------|--------|
| Critical Fixes | 1-3 | 1.5 hrs | 🔴 TODO |
| High Priority | 4-7 | 2.5 hrs | 🔴 TODO |
| Medium Priority | 8-10 | 2 hrs | 🟡 NEXT SPRINT |
| **Total** | **10** | **6 hrs** | |


