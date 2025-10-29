# CarrierSignal Testing Guide

## Overview

CarrierSignal uses a comprehensive testing strategy covering unit tests, integration tests, and end-to-end tests.

## Testing Stack

### Frontend
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing
- **Vitest**: Fast unit test runner
- **Cypress**: E2E testing

### Backend
- **Jest**: Unit testing
- **Firebase Emulator**: Local testing
- **Supertest**: HTTP assertion library

## Running Tests

### Frontend Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- ArticleCard.test.tsx
```

### Backend Tests

```bash
cd functions

# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## Test Structure

### Unit Tests

Test individual functions and components in isolation.

```typescript
// src/__tests__/utils/semanticSearch.test.ts
import { keywordSearch, filterByScore } from '../../utils/semanticSearch';
import { mockArticles } from '../test-utils';

describe('semanticSearch', () => {
  describe('keywordSearch', () => {
    it('should find articles matching keyword', () => {
      const results = keywordSearch(mockArticles, 'Florida');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title).toContain('Florida');
    });

    it('should be case-insensitive', () => {
      const results1 = keywordSearch(mockArticles, 'florida');
      const results2 = keywordSearch(mockArticles, 'FLORIDA');
      expect(results1.length).toBe(results2.length);
    });
  });

  describe('filterByScore', () => {
    it('should filter articles by score range', () => {
      const results = filterByScore(mockArticles, 70, 90);
      expect(results.every(a => (a.smartScore || 0) >= 70)).toBe(true);
      expect(results.every(a => (a.smartScore || 0) <= 90)).toBe(true);
    });
  });
});
```

### Component Tests

Test React components with React Testing Library.

```typescript
// src/__tests__/components/ArticleCard.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArticleCard } from '../../components/ArticleCard';
import { mockArticles } from '../test-utils';

describe('ArticleCard', () => {
  it('renders article title', () => {
    render(<ArticleCard article={mockArticles[0]} />);
    expect(screen.getByText(mockArticles[0].title)).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = jest.fn();
    render(<ArticleCard article={mockArticles[0]} onClick={onClick} />);
    
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('shows bookmark button on hover', async () => {
    const { container } = render(<ArticleCard article={mockArticles[0]} />);
    const card = container.querySelector('[role="button"]');
    
    await userEvent.hover(card!);
    expect(screen.getByLabelText('Bookmark article')).toBeVisible();
  });
});
```

### Integration Tests

Test multiple components working together.

```typescript
// src/__tests__/integration/SearchFlow.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchFirst } from '../../components/SearchFirst';
import { mockArticles } from '../test-utils';

describe('Search Flow', () => {
  it('should filter articles when sort changes', async () => {
    render(
      <SearchFirst
        articles={mockArticles}
        onArticleSelect={jest.fn()}
        sortMode="smart"
        onSortChange={jest.fn()}
      />
    );

    const smartButton = screen.getByText('AI Sort');
    await userEvent.click(smartButton);

    await waitFor(() => {
      expect(screen.getByText(/articles/)).toBeInTheDocument();
    });
  });
});
```

### E2E Tests

Test complete user workflows with Cypress.

```typescript
// cypress/e2e/article-search.cy.ts
describe('Article Search', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should display articles on load', () => {
    cy.get('[data-testid="article-card"]').should('have.length.greaterThan', 0);
  });

  it('should filter articles by sort', () => {
    cy.get('[data-testid="sort-smart"]').click();
    cy.get('[data-testid="article-card"]').first().should('be.visible');
  });

  it('should open article details on click', () => {
    cy.get('[data-testid="article-card"]').first().click();
    cy.get('[data-testid="brief-panel"]').should('be.visible');
  });
});
```

## Test Coverage

### Current Coverage Targets
- Statements: > 80%
- Branches: > 75%
- Functions: > 80%
- Lines: > 80%

### Generate Coverage Report

```bash
npm run test:coverage
```

Coverage report will be generated in `coverage/` directory.

## Testing Best Practices

### 1. Test Naming
```typescript
// Good
it('should filter articles when score is below minimum', () => {});

// Bad
it('filters', () => {});
```

### 2. Arrange-Act-Assert Pattern
```typescript
it('should update article when bookmark is clicked', () => {
  // Arrange
  const article = mockArticles[0];
  const onBookmark = jest.fn();

  // Act
  render(<ArticleCard article={article} onBookmark={onBookmark} />);
  userEvent.click(screen.getByLabelText('Bookmark'));

  // Assert
  expect(onBookmark).toHaveBeenCalledWith(article);
});
```

### 3. Use Test Utilities
```typescript
// Good
import { mockArticles, createMockArticle } from '../test-utils';

// Bad
const article = {
  url: 'https://example.com',
  title: 'Test',
  // ... many more fields
};
```

### 4. Mock External Dependencies
```typescript
jest.mock('../utils/api', () => ({
  fetchArticles: jest.fn().mockResolvedValue(mockArticles),
}));
```

## Debugging Tests

### Run Single Test
```bash
npm run test -- ArticleCard.test.tsx
```

### Debug Mode
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Watch Mode
```bash
npm run test:watch
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      - run: npm install
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v2
```

## Performance Testing

### Lighthouse
```bash
npm run build
npm run preview
# Open http://localhost:4173 in Chrome
# Run Lighthouse audit
```

### Bundle Analysis
```bash
npm run build -- --analyze
```

## Load Testing

### Artillery
```bash
npm install -g artillery

artillery quick --count 100 --num 10 https://carriersignal.com
```

## Accessibility Testing

### axe DevTools
```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should not have accessibility violations', async () => {
  const { container } = render(<ArticleCard article={mockArticles[0]} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Test Maintenance

### Update Snapshots
```bash
npm run test -- -u
```

### Clean Test Cache
```bash
npm run test -- --clearCache
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Cypress Documentation](https://docs.cypress.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Troubleshooting

### Tests Timeout
- Increase timeout: `jest.setTimeout(10000)`
- Check for unresolved promises
- Verify mock implementations

### Snapshot Mismatch
- Review changes carefully
- Update if intentional: `npm run test -- -u`

### Module Not Found
- Check import paths
- Verify mock setup
- Clear node_modules and reinstall

