# CarrierSignal Architecture

## Overview

CarrierSignal is an AI-curated Property & Casualty (P&C) insurance news web application built with React, TypeScript, Firebase, and OpenAI. The application fetches RSS feeds, processes articles with AI, stores them in Firestore, and displays them in an intuitive, modern UI.

## Technology Stack

### Frontend
- **Framework**: React 19.1.1 with TypeScript 5.9.3 (strict mode)
- **Build Tool**: Vite 7.1.7
- **Styling**: Tailwind CSS 4.1.16
- **State Management**: Context API + Custom Hooks
- **UI Components**: Custom liquid glass design system
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js 20 (Firebase Cloud Functions)
- **Database**: Firestore
- **AI/ML**: OpenAI GPT-4o-mini for summarization/tagging
- **Embeddings**: text-embedding-3-small for semantic search
- **Validation**: Zod schemas with custom validators

## Architecture Patterns

### Frontend Architecture

#### State Management
- **ArticleContext**: Centralized article state management
- **UIContext**: Global UI state (view mode, sort mode, palette state)
- **Custom Hooks**: `useArticles()` for data fetching with pagination

#### Component Structure
```
src/
├── components/
│   ├── primitives/          # Reusable UI components
│   │   ├── GlassCard.tsx    # Liquid glass card
│   │   ├── GlowButton.tsx   # Button with glow effects
│   │   ├── Badge.tsx        # Tag/status badge
│   │   ├── Modal.tsx        # Modal dialog
│   │   ├── Spinner.tsx      # Loading indicator
│   │   └── Tooltip.tsx      # Tooltip component
│   ├── Header.tsx           # App header
│   ├── SearchFirst.tsx      # Main feed view
│   ├── ArticleCard.tsx      # Article display card
│   ├── BriefPanel.tsx       # Article details panel
│   ├── Dashboard.tsx        # Analytics dashboard
│   ├── Bookmarks.tsx        # Saved articles
│   ├── CommandPalette.tsx   # Command palette
│   └── SettingsPanel.tsx    # User settings
├── context/
│   ├── ArticleContext.tsx   # Article state provider
│   └── UIContext.tsx        # UI state provider
├── hooks/
│   └── useArticles.ts       # Article fetching hook
├── utils/
│   ├── api.ts               # API calls with retry logic
│   ├── logger.ts            # Structured logging
│   ├── validation.ts        # Validation helpers
│   ├── errorBoundary.tsx    # Error boundary component
│   └── rankingSystem.ts     # Article ranking algorithm
├── types/
│   └── index.ts             # TypeScript type definitions
└── config.ts                # Configuration
```

#### Design System
- **Theme**: Liquid glass (frosted glass) aesthetic
- **Colors**: Aurora palette (Blue #5AA6FF → Violet #8B7CFF → Lilac #B08CFF)
- **Animations**: Subtle glow effects, smooth transitions
- **Responsive**: Mobile-first design with Tailwind breakpoints

### Backend Architecture

#### Cloud Functions
- **RSS Feed Processing**: Fetches and parses RSS feeds
- **Article Extraction**: Extracts content from URLs using Readability
- **AI Processing**: Summarization, tagging, scoring with OpenAI
- **Deduplication**: Identifies and removes duplicate articles
- **Semantic Search**: RAG-based search with embeddings

#### Data Flow
```
RSS Feeds → Extract → Process with AI → Validate → Store in Firestore → Frontend
```

#### Key Functions
- `processRSSFeeds()`: Fetch and process RSS feeds
- `extractArticle()`: Extract article content from URL
- `summarizeArticle()`: Generate AI summary
- `tagArticle()`: Extract tags and metadata
- `scoreArticle()`: Calculate relevance and impact scores
- `deduplicateArticles()`: Remove duplicate articles
- `askBrief()`: RAG-based semantic search
- `getQuickRead()`: Generate quick read summary

## Data Models

### Article
```typescript
interface Article {
  url: string;
  source: string;
  title: string;
  publishedAt?: string;
  description?: string;
  bullets5: string[];
  whyItMatters: {
    underwriting: string;
    claims: string;
    brokerage: string;
    actuarial: string;
  };
  tags: {
    lob: string[];           // Lines of Business
    perils: string[];        // Risk types
    regions: string[];       // Geographic regions
    companies: string[];     // Insurance companies
    trends: string[];        // Industry trends
    regulations: string[];   // Regulatory aspects
  };
  smartScore: number;        // 0-100 relevance score
  aiScore: number;           // 0-100 AI relevance
  impactScore: number;       // 0-100 business impact
  riskPulse: 'LOW' | 'MEDIUM' | 'HIGH';
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  confidence: number;        // 0-1 confidence level
}
```

## Key Features

### 1. Intelligent Feed Curation
- Multiple RSS sources across regulatory, market, technology, claims, and underwriting categories
- AI-powered relevance scoring
- Smart ranking combining AI relevance with recency

### 2. Advanced AI Processing
- Few-shot prompting with chain-of-thought reasoning
- Anti-hallucination clauses in prompts
- Structured output validation with Zod schemas
- Citation matching to prevent false claims

### 3. Semantic Search (RAG)
- Embeddings-based search using text-embedding-3-small
- Hybrid retrieval combining keyword and semantic search
- Context-aware query expansion

### 4. Modern UI/UX
- Liquid glass design system with Aurora gradients
- Smooth animations and micro-interactions
- Responsive mobile-first design
- Accessibility features (ARIA labels, keyboard navigation)

### 5. Error Handling & Logging
- React Error Boundary for graceful error handling
- Structured logging with severity levels
- Retry logic with exponential backoff
- Comprehensive error messages

## Performance Optimizations

### Frontend
- Infinite scroll with Intersection Observer
- Pagination (20 items per page)
- Code splitting with Vite
- CSS optimization with Tailwind
- Image lazy loading

### Backend
- Batch processing of RSS feeds
- Caching of processed articles
- Efficient Firestore queries with indexes
- Exponential backoff for API retries

## Security

### Frontend
- XSS protection with React's built-in escaping
- CSRF protection via Firebase Auth
- Content Security Policy headers

### Backend
- Firebase Security Rules for Firestore access
- API rate limiting
- Input validation with Zod schemas
- Secure environment variables

## Testing Strategy

### Unit Tests
- Component tests with React Testing Library
- Utility function tests
- Hook tests with custom test utilities

### Integration Tests
- API integration tests
- Context provider tests
- End-to-end user flows

### Test Utilities
- Mock article data
- Mock API responses
- Mock localStorage
- Async test helpers

## Deployment

### Frontend
- Deployed to Firebase Hosting
- Automatic builds on push to main
- Environment-specific configurations

### Backend
- Cloud Functions deployed to Firebase
- Scheduled triggers for RSS feed processing
- Pub/Sub for async processing

## Configuration

### Environment Variables
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_API_BASE_URL=...
```

### RSS Feeds
Configured in `functions/src/rss-feeds.ts` with:
- Feed URL
- Category (regulatory, market, technology, claims, underwriting)
- Priority (high, medium, low)
- Update frequency (hourly, daily, weekly)

## Future Enhancements

1. **Real-time Updates**: WebSocket support for live article updates
2. **Advanced Analytics**: Trend analysis and predictive insights
3. **Personalization**: User-specific article recommendations
4. **Collaboration**: Team sharing and commenting features
5. **Mobile App**: Native iOS/Android applications
6. **API**: Public API for third-party integrations

