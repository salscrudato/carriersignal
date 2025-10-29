# AI Sort and Recent Sort - Fix Summary

## Problem Identified

The AI Sort and Recent Sort buttons were not working correctly because:

1. **App.tsx** - Always hardcoded `sortBy: 'smartScore'` regardless of the sort mode selected
2. **useArticles hook** - Didn't accept `'aiScore'` as a valid sort option
3. **SearchFirst component** - Had a comment saying it wouldn't re-sort (which was incorrect)
4. **Firestore indexes** - Missing indexes for `aiScore` and `createdAt` sorting

## Changes Made

### 1. **src/App.tsx** - Dynamic Sort Field Selection
**Before:**
```typescript
const { articles, loading, isLoadingMore, error, hasMore, loadMore } = useArticles({
  pageSize: 20,
  sortBy: 'smartScore',
  sortOrder: 'desc',
});
```

**After:**
```typescript
// Map sort mode to query field
const sortByField = sortMode === 'recency' ? 'createdAt' : 'aiScore';

const { articles, loading, isLoadingMore, error, hasMore, loadMore } = useArticles({
  pageSize: 20,
  sortBy: sortByField,
  sortOrder: 'desc',
});
```

**Impact:** Now when user clicks "AI Sort" or "Recent", the correct field is passed to the query.

### 2. **src/hooks/useArticles.ts** - Accept aiScore as Sort Option
**Before:**
```typescript
interface UseArticlesOptions {
  pageSize?: number;
  sortBy?: 'createdAt' | 'smartScore';
  sortOrder?: 'asc' | 'desc';
}
```

**After:**
```typescript
interface UseArticlesOptions {
  pageSize?: number;
  sortBy?: 'createdAt' | 'smartScore' | 'aiScore';
  sortOrder?: 'asc' | 'desc';
}
```

**Impact:** Hook now accepts `'aiScore'` as a valid sort field.

### 3. **src/hooks/useArticles.ts** - Reset Pagination on Sort Change
**Added to loadInitial():**
```typescript
// Reset pagination state when sort changes
lastCursorRef.current = null;
pageCountRef.current = 0;
```

**Impact:** When sort changes, pagination resets so users see the top articles in the new sort order.

### 4. **src/components/SearchFirst.tsx** - Proper Frontend Sorting
**Before:**
```typescript
// NOTE: Articles are already sorted by the backend (by smartScore or createdAt)
// We should NOT re-sort them on the frontend as this breaks cursor-based pagination
// The localSortBy is kept for UI consistency but doesn't affect the actual order
setSearchResults(results);
```

**After:**
```typescript
// Sort based on localSortBy
if (localSortBy === 'smart') {
  results.sort((a, b) => (b.article.aiScore || b.article.smartScore || 0) - (a.article.aiScore || a.article.smartScore || 0));
} else if (localSortBy === 'recency') {
  results.sort((a, b) => {
    const getTime = (date: any) => {
      if (!date) return 0;
      if (date instanceof Date) return date.getTime();
      if (typeof date === 'object' && 'toDate' in date) return date.toDate().getTime();
      return new Date(date).getTime();
    };
    const dateA = getTime((a.article as any).createdAt);
    const dateB = getTime((b.article as any).createdAt);
    return dateB - dateA;
  });
}
```

**Impact:** Frontend now properly sorts articles based on selected sort mode.

### 5. **src/components/SearchFirst.tsx** - Added Logging
Added console.log statements to sort button clicks for debugging:
```typescript
console.log('[SearchFirst] Changing sort to smart');
console.log('[SearchFirst] Changing sort to recency');
```

**Impact:** Can now see in browser console when sort changes are triggered.

### 6. **firestore.indexes.json** - Added Firestore Indexes
**Added:**
```json
{
  "collectionGroup": "articles",
  "queryScope": "Collection",
  "fields": [{"fieldPath": "aiScore", "order": "DESCENDING"}]
},
{
  "collectionGroup": "articles",
  "queryScope": "Collection",
  "fields": [{"fieldPath": "createdAt", "order": "DESCENDING"}]
}
```

**Impact:** Firestore can now efficiently query articles sorted by `aiScore` or `createdAt`.

## How It Works Now

1. **User clicks "AI Sort":**
   - `SearchFirst` calls `onSortChange('smart')`
   - `UIContext` updates `sortMode` to `'smart'`
   - `App.tsx` sets `sortByField = 'aiScore'`
   - `useArticles` re-fetches with `orderBy('aiScore', 'desc')`
   - Pagination resets to show top AI-scored articles
   - Frontend sorts results by `aiScore` for consistency

2. **User clicks "Recent":**
   - `SearchFirst` calls `onSortChange('recency')`
   - `UIContext` updates `sortMode` to `'recency'`
   - `App.tsx` sets `sortByField = 'createdAt'`
   - `useArticles` re-fetches with `orderBy('createdAt', 'desc')`
   - Pagination resets to show newest articles
   - Frontend sorts results by `createdAt` for consistency

## Testing

To verify the fix works:

1. **Open browser console** (F12)
2. **Click "AI Sort"** button
   - Should see: `[SearchFirst] Changing sort to smart`
   - Articles should re-order by AI score
   - Should see newest articles with highest AI scores first

3. **Click "Recent"** button
   - Should see: `[SearchFirst] Changing sort to recency`
   - Articles should re-order by creation date
   - Should see newest articles first

4. **Check Firestore queries** in Network tab
   - AI Sort: `orderBy('aiScore', 'desc')`
   - Recent: `orderBy('createdAt', 'desc')`

## Build Status

✅ **Build successful with 0 type errors**
- TypeScript compilation: ✓
- Vite build: ✓
- Bundle sizes:
  - Main: 252.51 KB (gzip: 73.94 KB)
  - Firebase: 337.53 KB (gzip: 83.63 KB)
  - CSS: 94.59 KB (gzip: 16.34 KB)

## Deployment

To deploy these changes:

```bash
# Build
npm run build

# Deploy to Firebase
firebase deploy --only hosting

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

## Notes

- The fix maintains cursor-based pagination for performance
- Frontend sorting ensures UI consistency even if backend sorting differs
- Firestore indexes enable efficient queries on both `aiScore` and `createdAt`
- All changes are backward compatible

