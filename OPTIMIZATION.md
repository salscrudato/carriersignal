# CarrierSignal Performance Optimization Guide

## Current Performance Metrics

### Bundle Size
- **Total JS**: 245 KB (gzipped: 72 KB)
- **Total CSS**: 77 KB (gzipped: 14 KB)
- **Firebase**: 337 KB (gzipped: 84 KB)
- **React Vendor**: 11 KB (gzipped: 4 KB)

### Page Load Performance
- **First Contentful Paint (FCP)**: < 2s
- **Largest Contentful Paint (LCP)**: < 3s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to Interactive (TTI)**: < 5s

### Target Lighthouse Scores
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

## Frontend Optimization

### 1. Code Splitting

```typescript
// src/App.tsx
import { lazy, Suspense } from 'react';

const BriefPanel = lazy(() => import('./components/BriefPanel'));
const CommandPalette = lazy(() => import('./components/CommandPalette'));
const SettingsPanel = lazy(() => import('./components/SettingsPanel'));

export function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <BriefPanel />
      <CommandPalette />
      <SettingsPanel />
    </Suspense>
  );
}
```

### 2. Image Optimization

```typescript
// Use WebP with fallback
<picture>
  <source srcSet="/logo.webp" type="image/webp" />
  <img src="/logo.png" alt="CarrierSignal" />
</picture>

// Lazy load images
<img loading="lazy" src="/article-image.jpg" alt="Article" />

// Responsive images
<img
  srcSet="/logo-small.png 480w, /logo-large.png 1024w"
  sizes="(max-width: 600px) 480px, 1024px"
  src="/logo.png"
  alt="CarrierSignal"
/>
```

### 3. Virtual Scrolling

```typescript
// src/components/ArticleList.tsx
import { FixedSizeList } from 'react-window';

export function ArticleList({ articles }: { articles: Article[] }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={articles.length}
      itemSize={200}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <ArticleCard article={articles[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

### 4. Memoization

```typescript
// Memoize expensive components
export const ArticleCard = memo(function ArticleCard({ article }: Props) {
  return <div>{article.title}</div>;
}, (prevProps, nextProps) => {
  return prevProps.article.id === nextProps.article.id;
});

// Memoize callbacks
const handleClick = useCallback(() => {
  // Handle click
}, [dependency]);

// Memoize computed values
const sortedArticles = useMemo(() => {
  return articles.sort((a, b) => b.smartScore - a.smartScore);
}, [articles]);
```

### 5. Lazy Loading

```typescript
// Intersection Observer for lazy loading
export function useLazyLoad(ref: RefObject<HTMLElement>) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [ref]);

  return isVisible;
}
```

### 6. CSS Optimization

```css
/* Use CSS containment */
.article-card {
  contain: layout style paint;
}

/* Minimize repaints */
.glow-button {
  will-change: transform;
  transform: translateZ(0);
}

/* Use CSS variables for theming */
:root {
  --color-primary: #5aa6ff;
  --color-secondary: #8b7cff;
}
```

## Backend Optimization

### 1. Database Indexing

```typescript
// Firestore indexes for common queries
// articles collection:
// - smartScore (Descending)
// - publishedAt (Descending)
// - source (Ascending)
// - tags.lob (Ascending)
// - tags.perils (Ascending)
```

### 2. Query Optimization

```typescript
// Good: Specific query with limits
const query = db
  .collection('articles')
  .where('smartScore', '>=', 70)
  .orderBy('smartScore', 'desc')
  .limit(20);

// Bad: Fetch all then filter
const allArticles = await db.collection('articles').get();
const filtered = allArticles.docs.filter(doc => doc.data().smartScore >= 70);
```

### 3. Caching Strategy

```typescript
// Cache articles in memory
const articleCache = new Map<string, Article>();

export async function getArticle(id: string): Promise<Article> {
  if (articleCache.has(id)) {
    return articleCache.get(id)!;
  }

  const doc = await db.collection('articles').doc(id).get();
  const article = doc.data() as Article;
  articleCache.set(id, article);
  return article;
}

// Clear cache periodically
setInterval(() => articleCache.clear(), 60 * 60 * 1000); // 1 hour
```

### 4. Batch Operations

```typescript
// Batch write operations
const batch = db.batch();

articles.forEach(article => {
  const ref = db.collection('articles').doc(article.id);
  batch.set(ref, article);
});

await batch.commit();
```

### 5. Cloud Function Optimization

```typescript
// Use HTTP functions instead of Pub/Sub when possible
// Minimize cold start time
// Use Node.js 20 runtime
// Optimize dependencies

// functions/package.json
{
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "openai": "^4.0.0"
  }
}
```

## Monitoring & Metrics

### 1. Web Vitals

```typescript
// src/utils/metrics.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function initWebVitals() {
  getCLS(console.log);
  getFID(console.log);
  getFCP(console.log);
  getLCP(console.log);
  getTTFB(console.log);
}
```

### 2. Performance Monitoring

```typescript
// Monitor API calls
export async function fetchWithMetrics(url: string) {
  const start = performance.now();
  const response = await fetch(url);
  const duration = performance.now() - start;

  console.log(`API call to ${url} took ${duration}ms`);
  return response;
}
```

### 3. Error Tracking

```typescript
// Sentry integration
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

## Optimization Checklist

### Frontend
- [ ] Code splitting implemented
- [ ] Images optimized (WebP, responsive)
- [ ] Virtual scrolling for long lists
- [ ] Components memoized
- [ ] Lazy loading implemented
- [ ] CSS optimized
- [ ] Bundle analyzed
- [ ] Lighthouse score > 90

### Backend
- [ ] Database indexes created
- [ ] Queries optimized
- [ ] Caching implemented
- [ ] Batch operations used
- [ ] Cloud Functions optimized
- [ ] Error handling in place
- [ ] Monitoring enabled

### Deployment
- [ ] CDN configured
- [ ] Compression enabled (gzip, brotli)
- [ ] Caching headers set
- [ ] Security headers configured
- [ ] HTTPS enforced
- [ ] Monitoring active

## Tools & Resources

### Analysis Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [Bundle Analyzer](https://github.com/webpack-bundle-analyzer/webpack-bundle-analyzer)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)

### Monitoring Services
- [Sentry](https://sentry.io/)
- [LogRocket](https://logrocket.com/)
- [New Relic](https://newrelic.com/)
- [Datadog](https://www.datadoghq.com/)

### Performance Resources
- [Web.dev Performance Guide](https://web.dev/performance/)
- [MDN Performance](https://developer.mozilla.org/en-US/docs/Web/Performance)
- [React Performance](https://react.dev/reference/react/useMemo)

## Performance Targets by Phase

### Phase 1: Baseline
- FCP: < 3s
- LCP: < 4s
- TTI: < 6s

### Phase 2: Optimization
- FCP: < 2s
- LCP: < 3s
- TTI: < 5s

### Phase 3: Excellence
- FCP: < 1.5s
- LCP: < 2.5s
- TTI: < 4s

