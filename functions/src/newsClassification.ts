/**
 * News Classification & Summarization
 * Extracts structured metadata from news articles using LLM
 */

import OpenAI from 'openai';
import { z } from 'zod';

// Zod schema for structured classification output
const NewsClassificationSchema = z.object({
  headline: z.string().max(200),
  summary: z.string().max(300), // <= 2 sentences
  states: z.array(z.string()).max(10),
  lobs: z.array(z.string()).max(10),
  regulators: z.array(z.string()).max(10),
  carriers: z.array(z.string()).max(10),
  tickers: z.array(z.string()).max(10),
  ciks: z.array(z.string()).max(10),
  actionability: z.enum(['Monitor', 'Review Portfolio', 'File Response', 'Client Advisory']),
  severity: z.number().min(1).max(5),
  confidence: z.number().min(0).max(1),
});

export type NewsClassification = z.infer<typeof NewsClassificationSchema>;

/**
 * Classify and summarize a news article
 * Extracts states, LOBs, carriers, regulators, and generates structured output
 */
export async function classifyAndSummarizeArticle(
  client: OpenAI,
  article: {
    title: string;
    excerpt: string;
    contentText?: string;
    source: string;
  },
  timeout: number = 10000
): Promise<NewsClassification | null> {
  const MAX_RETRIES = 2;

  const classifyWithTimeout = async (): Promise<NewsClassification> => {
    const content = `${article.title}\n\n${article.excerpt}\n\n${article.contentText || ''}`.slice(0, 3000);

    const systemPrompt = `You are a senior P&C insurance analyst specializing in news classification and summarization.
Your task is to extract structured metadata from insurance news articles.

LINES OF BUSINESS (LOBs):
- Homeowners, Auto, Commercial Property, Workers Comp, Cyber, General Liability, Directors & Officers, Errors & Omissions, Inland Marine, Flood

REGULATORY BODIES:
- NAIC, TDI, CA DOI, NY DFS, FEMA, NWS, USGS, NHC, SEC, State DOI

SEVERITY LEVELS (1-5):
1 = Minimal impact, 2 = Low, 3 = Medium, 4 = High, 5 = Critical

ACTIONABILITY:
- Monitor: Track for future impact
- Review Portfolio: Requires portfolio review
- File Response: Requires regulatory/legal response
- Client Advisory: Requires client communication

US STATES: Use 2-letter state codes (CA, TX, FL, NY, etc.)

MAJOR CARRIERS: Allstate, Progressive, Chubb, Travelers, Hartford, Zurich, AIG, Berkshire Hathaway, State Farm, GEICO, Nationwide, Liberty Mutual, Safeco, Kemper, Hanover, Homeowners Choice, Universal Insurance, Heritage Insurance, Federated National, United Insurance

CARRIER TICKERS: ALL, PGR, CB, TRV, HIG, ZURN, AIG, BRK.B, NWL, LMVH, KMPR, THG, HCI, UVE, HRTG, FNHC, UPH

Return ONLY valid JSON matching the schema. If information is not found, use empty arrays.`;

    const userPrompt = `Classify and summarize this insurance news article:

Title: ${article.title}
Source: ${article.source}

Content:
${content}

Extract:
1. Headline (concise, max 200 chars)
2. Summary (1-2 sentences, max 300 chars)
3. States affected (2-letter codes)
4. Lines of Business impacted
5. Regulatory bodies mentioned
6. Carriers/companies mentioned
7. Stock tickers (if public companies)
8. SEC CIK numbers (if applicable)
9. Actionability level
10. Severity (1-5)
11. Confidence (0-1)

Return valid JSON only.`;

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Classification timeout'));
      }, timeout);

      client.chat.completions
        .create({
          model: 'gpt-4o-mini',
          temperature: 0.3,
          max_tokens: 500,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        })
        .then(response => {
          clearTimeout(timeoutId);
          const content = response.choices[0].message.content || '{}';
          try {
            const parsed = JSON.parse(content);
            const validated = NewsClassificationSchema.parse(parsed);
            resolve(validated);
          } catch (error) {
            reject(new Error(`Invalid classification JSON: ${error}`));
          }
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  };

  // Retry logic with exponential backoff
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await classifyWithTimeout();
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        console.error(`[CLASSIFY] Failed after ${MAX_RETRIES + 1} attempts:`, error);
        return null;
      }
      const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
      console.warn(`[CLASSIFY] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return null;
}

/**
 * Fallback classification using regex heuristics
 * Used when LLM classification fails
 */
export function classifyArticleWithHeuristics(article: {
  title: string;
  excerpt: string;
  contentText?: string;
}): Partial<NewsClassification> {
  const text = `${article.title} ${article.excerpt} ${article.contentText || ''}`.toLowerCase();

  // State detection
  const stateMap: Record<string, string> = {
    california: 'CA', texas: 'TX', florida: 'FL', newyork: 'NY', pennsylvania: 'PA',
    illinois: 'IL', ohio: 'OH', georgia: 'GA', northcarolina: 'NC', michigan: 'MI',
  };
  const states: string[] = [];
  for (const [name, code] of Object.entries(stateMap)) {
    if (text.includes(name)) states.push(code);
  }

  // LOB detection
  const lobs: string[] = [];
  if (text.includes('homeowner') || text.includes('home insurance')) lobs.push('Homeowners');
  if (text.includes('auto') || text.includes('automobile')) lobs.push('Auto');
  if (text.includes('commercial property') || text.includes('property')) lobs.push('Commercial Property');
  if (text.includes('workers comp') || text.includes('workers compensation')) lobs.push('Workers Comp');
  if (text.includes('cyber') || text.includes('cybersecurity')) lobs.push('Cyber');

  // Regulator detection
  const regulators: string[] = [];
  if (text.includes('naic')) regulators.push('NAIC');
  if (text.includes('tdi') || text.includes('texas department')) regulators.push('TDI');
  if (text.includes('california') && text.includes('insurance')) regulators.push('CA DOI');
  if (text.includes('sec') || text.includes('securities')) regulators.push('SEC');

  // Carrier detection
  const carriers: string[] = [];
  const carrierNames = ['allstate', 'progressive', 'chubb', 'travelers', 'hartford', 'state farm', 'geico'];
  for (const carrier of carrierNames) {
    if (text.includes(carrier)) carriers.push(carrier.charAt(0).toUpperCase() + carrier.slice(1));
  }

  // Severity heuristic
  let severity = 2;
  if (text.includes('critical') || text.includes('catastrophe') || text.includes('disaster')) severity = 5;
  else if (text.includes('major') || text.includes('significant')) severity = 4;
  else if (text.includes('moderate')) severity = 3;

  // Actionability heuristic
  let actionability: NewsClassification['actionability'] = 'Monitor';
  if (text.includes('regulatory') || text.includes('filing')) actionability = 'File Response';
  else if (text.includes('portfolio') || text.includes('review')) actionability = 'Review Portfolio';
  else if (text.includes('client') || text.includes('advisory')) actionability = 'Client Advisory';

  return {
    states,
    lobs,
    regulators,
    carriers,
    severity,
    actionability,
    confidence: 0.5, // Low confidence for heuristic
  };
}

