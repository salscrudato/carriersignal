# CarrierSignal Seed Script

This script populates the CarrierSignal database with insurance news articles from the past 2 days.

## Prerequisites

1. **Firebase Service Account Key**: Place your `serviceAccountKey.json` in the `functions/` directory
   - Download from Firebase Console → Project Settings → Service Accounts → Generate New Private Key

2. **OpenAI API Key**: Set the `OPENAI_API_KEY` environment variable
   ```bash
   export OPENAI_API_KEY=sk-...
   ```

3. **Dependencies**: Install dependencies in the functions directory
   ```bash
   cd functions
   npm install
   ```

## What the Script Does

1. **Clears the Database**: Deletes all existing articles and embeddings
2. **Fetches Articles**: Retrieves articles from the past 2 days from:
   - Insurance Journal (National)
   - Claims Journal
3. **Processes with AI**: Uses OpenAI GPT-4o-mini to generate:
   - 3-5 key bullet points
   - Impact analysis (underwriting, claims, brokerage, actuarial)
   - Tags (LOB, perils, regions, companies, trends, regulations)
   - Risk pulse (LOW/MEDIUM/HIGH)
   - Sentiment analysis
   - Impact scores and breakdowns
4. **Stores in Firestore**: Saves processed articles to the database

## Usage

### Run the Seed Script

```bash
cd functions
npm run seed
```

### With Custom OpenAI Key

```bash
cd functions
OPENAI_API_KEY=sk-... npm run seed
```

## Article Data Structure

Each article stored in Firestore contains:

```typescript
{
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  description?: string;
  bullets5: string[];
  whyItMatters: {
    underwriting: string;
    claims: string;
    brokerage: string;
    actuarial: string;
  };
  tags: {
    lob: string[];
    perils: string[];
    regions: string[];
    companies: string[];
    trends: string[];
    regulations: string[];
  };
  riskPulse: 'LOW' | 'MEDIUM' | 'HIGH';
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  confidence: number; // 0-1
  impactScore: number; // 0-100
  impactBreakdown: {
    market: number;
    regulatory: number;
    catastrophe: number;
    technology: number;
  };
  confidenceRationale: string;
  leadQuote: string;
  disclosure: string;
  createdAt: Date;
}
```

## Feed Sources

The script fetches from these RSS feeds:

1. **Insurance Journal - National**
   - URL: https://www.insurancejournal.com/rss/news/national/
   - Category: General P&C insurance news

2. **Claims Journal**
   - URL: https://www.claimsjournal.com/rss/
   - Category: Claims and litigation news

## Troubleshooting

### "serviceAccountKey.json not found"
- Download your Firebase service account key from Firebase Console
- Place it in the `functions/` directory

### "OPENAI_API_KEY not set"
- Set the environment variable: `export OPENAI_API_KEY=sk-...`
- Or pass it inline: `OPENAI_API_KEY=sk-... npm run seed`

### "No articles found to seed"
- The RSS feeds may not have recent articles
- Check that the feeds are accessible
- Verify your internet connection

### "Error processing article"
- OpenAI API may be rate limited
- Check your API key and quota
- Verify you have sufficient credits

## Performance Notes

- Processing ~10-20 articles typically takes 2-5 minutes
- Each article requires an OpenAI API call (~0.01-0.05 per article)
- Firestore write operations are batched for efficiency

## Next Steps

After seeding:

1. Start the development server: `npm run dev` (from root)
2. Open http://localhost:5173 to view the articles
3. Articles will be ranked and displayed in the feed

## Customization

To modify the script:

1. **Change feed sources**: Edit `FEED_SOURCES` in `seed-articles.ts`
2. **Adjust time window**: Modify the `twoDaysAgo` calculation
3. **Customize AI processing**: Update the prompt in `processArticleWithAI()`
4. **Change article fields**: Modify the Firestore document structure in `storeArticles()`

