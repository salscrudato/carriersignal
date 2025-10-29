# CarrierSignal Quick Reference Guide

## Common Commands

### Development
```bash
# Start dev server
npm run dev

# Start backend emulator
cd functions && npm run serve

# Build for production
npm run build

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Type check
npm run type-check
```

### Deployment
```bash
# Deploy everything
firebase deploy

# Deploy only frontend
firebase deploy --only hosting

# Deploy only functions
firebase deploy --only functions

# Deploy to staging
firebase deploy --project carriersignal-staging

# View logs
firebase functions:log

# Rollback
firebase hosting:rollback
```

## Project Structure Quick Map

```
src/
├── components/primitives/    → UI building blocks
├── components/               → Page components
├── context/                  → State management
├── hooks/                    → Custom React hooks
├── utils/                    → Utility functions
├── types/                    → TypeScript types
└── __tests__/               → Test utilities

functions/
├── src/
│   ├── index.ts             → Cloud Functions entry
│   ├── agents.ts            → AI agents
│   ├── prompts.ts           → AI prompts
│   ├── rss-feeds.ts         → RSS configuration
│   └── schemas.ts           → Validation schemas
```

## Key Files & Their Purpose

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main app component |
| `src/context/ArticleContext.tsx` | Article state |
| `src/context/UIContext.tsx` | UI state |
| `src/hooks/useArticles.ts` | Article fetching |
| `src/utils/api.ts` | API calls |
| `src/utils/logger.ts` | Logging |
| `src/utils/semanticSearch.ts` | Search |
| `src/utils/clustering.ts` | Article clustering |
| `src/utils/sharing.ts` | Sharing utilities |
| `functions/src/index.ts` | Cloud Functions |

## Common Tasks

### Add a New Component
```typescript
// src/components/MyComponent.tsx
import type { ReactNode } from 'react';

interface MyComponentProps {
  children: ReactNode;
}

export function MyComponent({ children }: MyComponentProps) {
  return <div>{children}</div>;
}
```

### Use Article Context
```typescript
import { useArticleContext } from '../context/ArticleContext';

export function MyComponent() {
  const { articles, addArticles } = useArticleContext();
  // Use articles and methods
}
```

### Use UI Context
```typescript
import { useUI } from '../context/UIContext';

export function MyComponent() {
  const { view, setView, sortMode, setSortMode } = useUI();
  // Use UI state
}
```

### Fetch Articles
```typescript
import { useArticles } from '../hooks/useArticles';

export function MyComponent() {
  const { articles, loading, error, loadMore } = useArticles();
  // Use articles
}
```

### Log Events
```typescript
import { logger } from '../utils/logger';

logger.info('Article loaded', { articleId: '123' });
logger.error('Failed to fetch', { error });
```

### Validate Input
```typescript
import { isValidUrl, formatDate } from '../utils/validation';

const isValid = isValidUrl(url);
const formatted = formatDate(new Date());
```

### Search Articles
```typescript
import { keywordSearch, hybridSearch } from '../utils/semanticSearch';

const results = keywordSearch(articles, 'Florida');
const hybrid = hybridSearch(articles, 'hurricane', { minScore: 70 });
```

### Cluster Articles
```typescript
import { clusterArticles, detectTrends } from '../utils/clustering';

const clusters = clusterArticles(articles, 0.5);
const trends = detectTrends(articles, 7);
```

### Share Articles
```typescript
import { generateShareUrl, downloadAsCSV } from '../utils/sharing';

const url = generateShareUrl(article);
downloadAsCSV(articles);
```

### Send Notifications
```typescript
import { useNotifications } from '../utils/notifications';

const { success, error } = useNotifications();
success('Article saved!');
error('Failed to save article');
```

## Environment Variables

### Frontend (.env.local)
```
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
VITE_API_URL=http://localhost:5001
```

### Backend (functions/.env)
```
OPENAI_API_KEY=xxx
FIREBASE_ADMIN_SDK_KEY=xxx
GCP_PROJECT_ID=xxx
```

## TypeScript Tips

### Type-only Imports
```typescript
import type { Article } from '../types';
```

### Const Objects Instead of Enums
```typescript
const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
} as const;

type LogLevel = typeof LogLevel[keyof typeof LogLevel];
```

### Strict Mode
- All functions have explicit return types
- No implicit any
- Strict null checks enabled

## Testing

### Run Tests
```bash
npm run test
npm run test:watch
npm run test:coverage
```

### Test Utilities
```typescript
import { mockArticles, createMockArticle } from '../__tests__/test-utils';

const article = createMockArticle({ title: 'Test' });
```

## Performance Tips

### Memoization
```typescript
import { memo, useMemo, useCallback } from 'react';

const Component = memo(function Component() {
  const value = useMemo(() => expensiveComputation(), []);
  const handler = useCallback(() => {}, []);
});
```

### Code Splitting
```typescript
import { lazy, Suspense } from 'react';

const Component = lazy(() => import('./Component'));

<Suspense fallback={<Spinner />}>
  <Component />
</Suspense>
```

## Debugging

### Enable Debug Logging
```typescript
import { logger } from '../utils/logger';

logger.setLevel('DEBUG');
```

### Browser DevTools
- React DevTools extension
- Redux DevTools (if using Redux)
- Network tab for API calls
- Console for errors

### Firebase Emulator
```bash
firebase emulators:start
```

## Troubleshooting

### Build Fails
```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

### Tests Fail
```bash
# Clear Jest cache
npm run test -- --clearCache

# Run single test
npm run test -- MyComponent.test.tsx
```

### Firebase Issues
```bash
# Check project
firebase projects:list

# Switch project
firebase use carriersignal-prod

# View logs
firebase functions:log
```

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/)

## Getting Help

1. Check documentation files (README.md, ARCHITECTURE.md, etc.)
2. Search GitHub issues
3. Check test files for examples
4. Review similar components
5. Contact: contact@carriersignal.com

## Keyboard Shortcuts

- `Cmd/Ctrl + K` - Open Command Palette
- `Cmd/Ctrl + /` - Toggle sidebar
- `Cmd/Ctrl + B` - Toggle bookmarks
- `Cmd/Ctrl + S` - Open settings
- `Cmd/Ctrl + Q` - Quick read

## Useful Links

- [GitHub Repository](https://github.com/salscrudato/carriersignal)
- [Firebase Console](https://console.firebase.google.com)
- [OpenAI API](https://platform.openai.com)
- [Tailwind UI](https://tailwindui.com)
- [Lucide Icons](https://lucide.dev)

---

**Last Updated**: January 2024
**Version**: 2.0.0

