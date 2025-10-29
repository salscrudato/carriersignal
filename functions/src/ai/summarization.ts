/**
 * AI Summarization Service
 * Generates deterministic JSON summaries with schema validation
 */

import OpenAI from 'openai';
import { z } from 'zod';
import { db } from '../ingestion/firebase';
import { ArticleSummary, AIProcessingResult, SummaryCache } from './types';
import * as crypto from 'crypto';

const SummarySchema = z.object({
  url: z.string().url(),
  headline: z.string().min(10).max(200),
  briefBullets: z.array(z.string()).min(3).max(5),
  keyNumbers: z.array(z.string()).max(10),
  materiality: z.number().min(0).max(100),
  impacts: z.object({
    underwriting: z.string().min(20).max(200),
    claims: z.string().min(20).max(200),
    brokerage: z.string().min(20).max(200),
    actuarial: z.string().min(20).max(200),
  }),
  geos: z.array(z.string()).max(10),
  perils: z.array(z.string()).max(10),
  regulatoryFlags: z.array(z.string()).max(5),
  riskNotes: z.string().max(500),
  confidence: z.number().min(0).max(1),
  citations: z.array(z.string().url()).max(10),
  leadQuote: z.string().max(300),
  disclosure: z.string().max(200),
});

export class SummarizationService {
  private openai: OpenAI;
  private readonly CACHE_TTL_DAYS = 30;
  private readonly PROMPT_VERSION = '1.0';

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Generate content hash for caching
   */
  private generateContentHash(content: string): string {
    return crypto
      .createHash('sha256')
      .update(content.toLowerCase().trim())
      .digest('hex');
  }

  /**
   * Check cache for existing summary
   */
  private async checkCache(url: string, contentHash: string): Promise<ArticleSummary | null> {
    try {
      const cacheKey = `${url}|${contentHash}|${this.PROMPT_VERSION}`;
      const cacheHash = crypto.createHash('md5').update(cacheKey).digest('hex');

      const doc = await db.collection('summaryCache').doc(cacheHash).get();

      if (doc.exists) {
        const cache = doc.data() as SummaryCache;
        if (new Date(cache.expiresAt) > new Date()) {
          return cache.summary;
        }
      }
    } catch (error) {
      console.error('Cache check error:', error);
    }

    return null;
  }

  /**
   * Store summary in cache
   */
  private async storeInCache(url: string, contentHash: string, summary: ArticleSummary): Promise<void> {
    try {
      const cacheKey = `${url}|${contentHash}|${this.PROMPT_VERSION}`;
      const cacheHash = crypto.createHash('md5').update(cacheKey).digest('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + this.CACHE_TTL_DAYS);

      const cache: SummaryCache = {
        url,
        contentHash,
        promptVersion: this.PROMPT_VERSION,
        summary,
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
        ttlDays: this.CACHE_TTL_DAYS,
      };

      await db.collection('summaryCache').doc(cacheHash).set(cache);
    } catch (error) {
      console.error('Cache storage error:', error);
    }
  }

  /**
   * Summarize article using OpenAI
   */
  async summarizeArticle(
    articleId: string,
    url: string,
    title: string,
    content: string
  ): Promise<AIProcessingResult> {
    const startTime = Date.now();
    const contentHash = this.generateContentHash(content);

    try {
      // Check cache
      const cached = await this.checkCache(url, contentHash);
      if (cached) {
        return {
          articleId,
          summary: cached,
          processingTime: Date.now() - startTime,
          model: 'gpt-4-turbo',
          tokensUsed: 0,
          cached: true,
          timestamp: new Date().toISOString(),
        };
      }

      // Generate summary
      const systemPrompt = `You are an expert P&C insurance analyst. Analyze the provided article and output ONLY valid JSON matching the required schema. Be deterministic and precise.`;

      const userPrompt = `Analyze this insurance article and provide a comprehensive summary:

Title: ${title}
URL: ${url}
Content: ${content.substring(0, 2000)}

Provide output as valid JSON with these fields:
- headline: concise headline (10-200 chars)
- briefBullets: 3-5 key points
- keyNumbers: any important numbers mentioned
- materiality: 0-100 score
- impacts: object with underwriting, claims, brokerage, actuarial impacts
- geos: affected geographies
- perils: relevant perils
- regulatoryFlags: regulatory implications
- riskNotes: risk assessment
- confidence: 0-1 confidence score
- citations: relevant URLs
- leadQuote: key quote from article
- disclosure: any important disclosures`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        temperature: 0,
        max_tokens: 1500,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      const content_text = response.choices[0]?.message?.content || '';
      const jsonMatch = content_text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const summaryData = JSON.parse(jsonMatch[0]);
      const parsedSummary = SummarySchema.parse({ url, ...summaryData });
      const summary: ArticleSummary = parsedSummary;

      // Store in cache
      await this.storeInCache(url, contentHash, summary);

      return {
        articleId,
        summary,
        processingTime: Date.now() - startTime,
        model: 'gpt-4-turbo',
        tokensUsed: response.usage?.total_tokens || 0,
        cached: false,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(
        `Summarization failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

export default SummarizationService;

