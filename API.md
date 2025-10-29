# CarrierSignal API Documentation

## Overview

CarrierSignal provides a comprehensive REST API for accessing AI-curated P&C insurance news. All endpoints are implemented as Firebase Cloud Functions.

## Base URL

```
https://us-central1-carriersignal.cloudfunctions.net
```

## Authentication

All requests require Firebase authentication. Include the Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase_id_token>
```

## Response Format

All responses follow this format:

```json
{
  "success": true,
  "data": { /* response data */ },
  "error": null
}
```

Error responses:

```json
{
  "success": false,
  "data": null,
  "error": "Error message"
}
```

## Endpoints

### Articles

#### Get Articles
Fetch paginated list of articles with optional filtering and sorting.

**Request:**
```
GET /articles
```

**Query Parameters:**
- `limit` (number, default: 20): Number of articles to return
- `offset` (number, default: 0): Pagination offset
- `sort` (string, default: 'smart'): Sort by 'smart' or 'recency'
- `lob` (string[]): Filter by lines of business
- `perils` (string[]): Filter by perils
- `regions` (string[]): Filter by regions
- `minScore` (number): Minimum relevance score

**Response:**
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "url": "https://example.com/article",
        "source": "Insurance Journal",
        "title": "Article Title",
        "publishedAt": "2024-01-15T10:30:00Z",
        "smartScore": 85,
        "tags": { /* tags */ }
      }
    ],
    "total": 1234,
    "hasMore": true
  }
}
```

#### Get Article Details
Fetch full details for a specific article.

**Request:**
```
GET /articles/:url
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://example.com/article",
    "source": "Insurance Journal",
    "title": "Article Title",
    "bullets5": ["Bullet 1", "Bullet 2", ...],
    "whyItMatters": { /* impact analysis */ },
    "tags": { /* tags */ },
    "smartScore": 85,
    "impactScore": 88
  }
}
```

### Search

#### Ask Brief (RAG Search)
Semantic search using RAG (Retrieval-Augmented Generation).

**Request:**
```
POST /askBrief
```

**Body:**
```json
{
  "query": "What are the latest rate increases in Florida?",
  "limit": 5,
  "filters": {
    "regions": ["US-FL"],
    "lob": ["Property"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "answer": "Based on recent articles, State Farm and Allstate have announced 15-20% rate increases in Florida...",
    "sources": [
      {
        "url": "https://example.com/article1",
        "title": "Article Title",
        "relevance": 0.95
      }
    ],
    "confidence": 0.87
  }
}
```

#### Quick Read
Generate a quick read summary for an article.

**Request:**
```
POST /quickRead
```

**Body:**
```json
{
  "url": "https://example.com/article"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": "Quick read summary...",
    "readingTime": 3,
    "keyPoints": ["Point 1", "Point 2", "Point 3"]
  }
}
```

### Bookmarks

#### Get Bookmarks
Fetch user's bookmarked articles.

**Request:**
```
GET /bookmarks
```

**Query Parameters:**
- `limit` (number, default: 20)
- `offset` (number, default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "bookmarks": [
      {
        "articleUrl": "https://example.com/article",
        "createdAt": "2024-01-15T10:30:00Z",
        "notes": "Important for Q1 planning"
      }
    ],
    "total": 42
  }
}
```

#### Add Bookmark
Bookmark an article.

**Request:**
```
POST /bookmarks
```

**Body:**
```json
{
  "articleUrl": "https://example.com/article",
  "notes": "Important for Q1 planning"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookmarkId": "bookmark_123",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Remove Bookmark
Remove a bookmark.

**Request:**
```
DELETE /bookmarks/:articleUrl
```

**Response:**
```json
{
  "success": true,
  "data": { "deleted": true }
}
```

### User Preferences

#### Get Preferences
Fetch user preferences.

**Request:**
```
GET /preferences
```

**Response:**
```json
{
  "success": true,
  "data": {
    "preferredLOBs": ["Property", "Auto"],
    "preferredPerils": ["Hurricane", "Wildfire"],
    "preferredRegions": ["US-FL", "US-CA"],
    "notificationFrequency": "daily",
    "theme": "light",
    "sortPreference": "smart"
  }
}
```

#### Update Preferences
Update user preferences.

**Request:**
```
PUT /preferences
```

**Body:**
```json
{
  "preferredLOBs": ["Property", "Auto"],
  "notificationFrequency": "daily",
  "theme": "light"
}
```

**Response:**
```json
{
  "success": true,
  "data": { "updated": true }
}
```

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | User not authorized for resource |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

## Rate Limiting

- 100 requests per minute per user
- 1000 requests per hour per user
- 10000 requests per day per user

## Pagination

Use `limit` and `offset` for pagination:

```
GET /articles?limit=20&offset=0
GET /articles?limit=20&offset=20
GET /articles?limit=20&offset=40
```

## Filtering

Combine multiple filters:

```
GET /articles?lob=Property&lob=Auto&regions=US-FL&minScore=70
```

## Sorting

Available sort options:
- `smart`: AI relevance + recency
- `recency`: Most recent first
- `score`: Highest score first

## Examples

### Get latest high-impact articles
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://us-central1-carriersignal.cloudfunctions.net/articles?sort=smart&limit=10&minScore=75"
```

### Search for Florida property insurance news
```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Florida property insurance rate increases",
    "filters": {
      "regions": ["US-FL"],
      "lob": ["Property"]
    }
  }' \
  "https://us-central1-carriersignal.cloudfunctions.net/askBrief"
```

### Bookmark an article
```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "articleUrl": "https://example.com/article",
    "notes": "Important for Q1 planning"
  }' \
  "https://us-central1-carriersignal.cloudfunctions.net/bookmarks"
```

## Webhooks

Webhooks are available for real-time notifications:

- `article.published`: New article added
- `article.updated`: Article updated
- `bookmark.created`: Bookmark created
- `bookmark.deleted`: Bookmark deleted

Configure webhooks in user preferences.

## SDK

JavaScript/TypeScript SDK available:

```typescript
import { CarrierSignalClient } from '@carriersignal/sdk';

const client = new CarrierSignalClient({
  apiKey: 'your-api-key',
});

const articles = await client.articles.list({
  limit: 20,
  sort: 'smart',
});

const answer = await client.search.askBrief({
  query: 'Florida rate increases',
});
```

## Support

For API support, contact: api-support@carriersignal.com

