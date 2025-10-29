# CarrierSignal

**AI-Curated Property & Casualty Insurance News Platform**

CarrierSignal is a modern, intelligent news aggregation platform designed specifically for P&C insurance professionals. It combines advanced AI processing, semantic search, and a beautiful liquid glass UI to deliver the most relevant insurance industry news.

## 🚀 Features

### Intelligent News Curation
- **AI-Powered Scoring**: Smart relevance scoring combining AI analysis with recency
- **Multi-Source Aggregation**: 15+ RSS feeds across regulatory, market, technology, and claims categories
- **Semantic Search**: RAG-based search with embeddings for intelligent query understanding
- **Automatic Deduplication**: Identifies and removes duplicate articles

### Advanced AI Processing
- **Summarization**: AI-generated 5-bullet summaries with impact analysis
- **Smart Tagging**: Automatic extraction of LOB, perils, regions, companies, trends, and regulations
- **Impact Scoring**: Multi-dimensional scoring (market, regulatory, catastrophe, technology)
- **Citation Matching**: Ensures all claims are backed by article content

### Modern UI/UX
- **Liquid Glass Design**: Apple Vision Pro-inspired frosted glass aesthetic
- **Aurora Gradients**: Beautiful blue-to-violet-to-lilac color palette
- **Responsive Design**: Mobile-first approach with full desktop support
- **Infinite Scroll**: Smooth pagination with 20 articles per page
- **Dark Mode Ready**: Light theme with dark mode support planned

### User Features
- **Bookmarks**: Save articles for later reading
- **Command Palette**: Quick navigation with keyboard shortcuts
- **Dashboard**: Analytics and trend insights
- **Settings**: Personalized preferences and notifications
- **Quick Read**: AI-generated quick summaries

## 📋 Tech Stack

### Frontend
- React 19.1.1 with TypeScript 5.9.3 (strict mode)
- Vite 7.1.7 for fast builds
- Tailwind CSS 4.1.16 for styling
- Context API + Custom Hooks for state management
- Lucide React for icons

### Backend
- Firebase Cloud Functions (Node.js 20)
- Firestore for data storage
- OpenAI GPT-4o-mini for AI processing
- text-embedding-3-small for semantic search

## 🏗️ Architecture

```
CarrierSignal
├── Frontend (React + TypeScript)
│   ├── Components (Primitives, Pages, Layouts)
│   ├── Context (Article, UI state)
│   ├── Hooks (useArticles, custom hooks)
│   ├── Utils (API, validation, search, clustering)
│   └── Styles (Tailwind CSS)
├── Backend (Firebase Cloud Functions)
│   ├── RSS Feed Processing
│   ├── Article Extraction
│   ├── AI Processing (Summarization, Tagging, Scoring)
│   ├── Semantic Search (RAG)
│   └── Deduplication
└── Database (Firestore)
    ├── Articles
    ├── Bookmarks
    └── User Preferences
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Firebase CLI
- OpenAI API key

### Installation

```bash
# Clone repository
git clone https://github.com/salscrudato/carriersignal.git
cd carriersignal

# Install dependencies
npm install
cd functions && npm install && cd ..

# Set up environment
cp .env.example .env.local
# Edit .env.local with your credentials
```

### Development

```bash
# Start frontend dev server
npm run dev

# In another terminal, start backend emulator
cd functions
npm run serve
```

Visit `http://localhost:5173`

### Build

```bash
npm run build
```

### Deploy

```bash
firebase deploy
```

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design and component structure
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development guide and best practices
- **[API.md](./API.md)** - API documentation and endpoints
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment and DevOps guide
- **[SECURITY.md](./SECURITY.md)** - Security practices and compliance
- **[PERFORMANCE.md](./PERFORMANCE.md)** - Performance optimization guide

## 🎨 Design System

### Colors
- **Primary**: Blue #5AA6FF
- **Secondary**: Violet #8B7CFF
- **Tertiary**: Lilac #B08CFF
- **Background**: White #FFFFFF
- **Surface**: #F9FBFF
- **Border**: #C7D2E1 (25% opacity)
- **Text**: #0F172A

### Components
- **GlassCard**: Liquid glass card with variants
- **GlowButton**: Button with Aurora glow effects
- **Badge**: Tag and status indicators
- **Modal**: Dialog with liquid glass styling
- **Spinner**: Loading indicator with Aurora gradient
- **Tooltip**: Accessible tooltips
- **Input**: Form input with validation

## 🔍 Key Features Deep Dive

### Smart Scoring Algorithm
Combines multiple factors:
- AI relevance score (0-100)
- Recency (recent articles weighted higher)
- Impact score (market, regulatory, catastrophe, technology)
- User engagement (bookmarks, views)

### Semantic Search
- Hybrid search combining keyword and semantic matching
- Query expansion with synonyms
- Tag-based filtering
- Date range filtering
- Sentiment and risk pulse filtering

### Article Clustering
- Automatic grouping of related articles
- Trend detection
- Event-based clustering
- Similarity scoring

## 📊 Performance

- **Bundle Size**: ~245 KB JS (gzipped: ~72 KB)
- **Page Load**: < 3 seconds
- **Time to Interactive**: < 5 seconds
- **Lighthouse Score**: > 90

## 🔒 Security

- Firebase Authentication with MFA support
- Firestore Security Rules for data protection
- Input validation with Zod schemas
- Rate limiting (100 req/min per user)
- TLS 1.3 encryption in transit
- AES-256 encryption at rest

## 🧪 Testing

```bash
# Run tests
npm run test

# Run with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## 📈 Roadmap

### Phase 1-3 ✅ Complete
- Codebase audit and refactoring
- UI/UX enhancements with liquid glass design
- Core infrastructure and state management

### Phase 4 🚀 In Progress
- Enhanced RSS sources
- Improved AI prompts
- Semantic search optimization

### Phase 5-8 📋 Planned
- Advanced features (clustering, trends, sharing)
- Comprehensive testing suite
- Security hardening and CI/CD
- Documentation and polish

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

## 📧 Contact

- **Email**: contact@carriersignal.com
- **Issues**: GitHub Issues
- **Security**: security@carriersignal.com

## 🙏 Acknowledgments

- OpenAI for GPT-4o-mini and embeddings
- Firebase for backend infrastructure
- React and TypeScript communities
- Tailwind CSS for styling framework

---

**CarrierSignal** - Making P&C insurance news intelligent and accessible.

