# CarrierSignal Development Guide

## Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- Firebase CLI
- OpenAI API key

### Installation

```bash
# Clone repository
git clone https://github.com/salscrudato/carriersignal.git
cd carriersignal

# Install frontend dependencies
npm install

# Install backend dependencies
cd functions
npm install
cd ..

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase and OpenAI credentials
```

### Development Server

```bash
# Start frontend dev server (connects to live Firebase)
npm run dev

# In another terminal, start backend emulator
cd functions
npm run serve
```

The app will be available at `http://localhost:5173`

## Project Structure

### Frontend (`src/`)
- **components/**: React components
- **context/**: Context providers for state management
- **hooks/**: Custom React hooks
- **utils/**: Utility functions and helpers
- **types/**: TypeScript type definitions
- **config.ts**: Configuration constants

### Backend (`functions/src/`)
- **index.ts**: Cloud Functions entry point
- **agents.ts**: AI processing agents
- **utils.ts**: Backend utilities
- **prompts.ts**: AI prompts with few-shot examples
- **rss-feeds.ts**: RSS feed configuration
- **schemas.ts**: Zod validation schemas

## Code Style & Standards

### TypeScript
- Strict mode enabled
- Type-only imports for types
- Explicit return types on functions
- No `any` types without justification

### React Components
- Functional components with hooks
- Props interface defined above component
- JSDoc comments for complex logic
- Memoization for expensive computations

### Naming Conventions
- Components: PascalCase (e.g., `ArticleCard`)
- Functions: camelCase (e.g., `fetchArticles`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_ARTICLES`)
- Types: PascalCase (e.g., `Article`)

## Common Tasks

### Adding a New Component

1. Create component file in `src/components/`
2. Define props interface
3. Add JSDoc comments
4. Export component
5. Add to appropriate parent component

```typescript
// src/components/MyComponent.tsx
import type { ReactNode } from 'react';

interface MyComponentProps {
  title: string;
  children: ReactNode;
}

/**
 * MyComponent - Description of what it does
 */
export function MyComponent({ title, children }: MyComponentProps) {
  return (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  );
}
```

### Adding a New API Endpoint

1. Create function in `functions/src/index.ts`
2. Define request/response types
3. Add validation with Zod
4. Implement error handling
5. Add to `src/utils/api.ts` client

```typescript
// functions/src/index.ts
export const myEndpoint = onRequest(async (req, res) => {
  try {
    const data = MySchema.parse(req.body);
    // Process data
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});
```

### Adding a New RSS Feed

1. Add to `functions/src/rss-feeds.ts`
2. Test feed URL is valid
3. Verify content is P&C insurance related
4. Set appropriate category and priority

```typescript
{
  name: 'New Feed',
  url: 'https://example.com/feed.xml',
  category: 'market',
  priority: 'high',
  updateFrequency: 'daily',
}
```

### Updating AI Prompts

1. Edit prompt in `functions/src/prompts.ts`
2. Add few-shot examples if needed
3. Include anti-hallucination clauses
4. Test with sample articles
5. Validate output with Zod schema

## Testing

### Running Tests

```bash
# Frontend tests
npm run test

# Backend tests
cd functions
npm run test
```

### Writing Tests

```typescript
// src/__tests__/MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders title', () => {
    render(<MyComponent title="Test">Content</MyComponent>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

## Debugging

### Frontend
- Use React DevTools browser extension
- Check browser console for errors
- Use `logger.debug()` for structured logging
- Check Network tab for API calls

### Backend
- Use Firebase Emulator Suite
- Check Cloud Functions logs
- Add console.log statements
- Use `logger.error()` for errors

## Performance Tips

### Frontend
- Use React.memo for expensive components
- Implement code splitting with React.lazy
- Optimize images with next-gen formats
- Use Intersection Observer for infinite scroll

### Backend
- Batch process RSS feeds
- Cache processed articles
- Use Firestore indexes for queries
- Implement rate limiting

## Deployment

### Frontend
```bash
npm run build
firebase deploy --only hosting
```

### Backend
```bash
cd functions
npm run build
firebase deploy --only functions
```

### Environment Variables
Set in Firebase Console:
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `EMBEDDING_MODEL`

## Troubleshooting

### Build Errors
- Clear `node_modules` and reinstall
- Check TypeScript errors: `npm run build`
- Verify all imports are correct

### Runtime Errors
- Check browser console
- Check Cloud Functions logs
- Verify Firebase configuration
- Check API keys and permissions

### Performance Issues
- Profile with Chrome DevTools
- Check Firestore query performance
- Monitor Cloud Functions execution time
- Optimize images and assets

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [OpenAI API](https://platform.openai.com/docs)

## Getting Help

- Check existing issues on GitHub
- Review ARCHITECTURE.md for system design
- Check test files for usage examples
- Ask in team Slack channel

