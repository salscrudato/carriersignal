import OpenAI from "openai";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { z } from "zod";
import { backOff } from "exponential-backoff"; // Import for retry logic
import {
  normalizeRegions as normalizeRegionsUtil,
  normalizeCompanies as normalizeCompaniesUtil,
  computeContentHash as computeContentHashUtil,
  detectStormName as detectStormNameUtil,
  isRegulatorySource as isRegulatorySourceUtil,
  calculateSmartScore as calculateSmartScoreUtil,
  hashUrl as hashUrlUtil,
} from "./utils";

export type Article = {
  url: string;
  source: string;
  publishedAt?: string;
  title?: string;
  html?: string;
  text?: string;
  author?: string;
  mainImage?: string;
};

const schema = z.object({
  title: z.string(),
  url: z.string().url(),
  source: z.string(),
  bullets5: z.array(z.string()).min(3).max(5),
  whyItMatters: z.object({
    underwriting: z.string().min(20).max(200), // Ensure meaningful length
    claims: z.string().min(20).max(200),
    brokerage: z.string().min(20).max(200),
    actuarial: z.string().min(20).max(200),
  }),
  tags: z.object({
    lob: z.array(z.string()).max(6), // Lines of Business, e.g., "Auto", "Property"
    perils: z.array(z.string()).max(6), // Perils, e.g., "Hurricane", "Cyber"
    regions: z.array(z.string()).max(10), // ISO codes or names, e.g., "US-FL", "California"
    companies: z.array(z.string()).max(10), // Company names, e.g., "State Farm"
    trends: z.array(z.string()).max(8), // Trends like "GenAI", "Climate Risk", "Social Inflation", etc.
    regulations: z.array(z.string()).max(5), // Regulatory aspects, e.g., "NAIC Bulletin", "Tort Reform"
  }),
  riskPulse: z.enum(["LOW", "MEDIUM", "HIGH"]),
  sentiment: z.enum(["POSITIVE", "NEGATIVE", "NEUTRAL"]),
  confidence: z.number().min(0).max(1),
  // v2 additions
  citations: z.array(z.string()).max(10), // URLs cited in bullets
  impactScore: z.number().min(0).max(100), // Overall impact score
  impactBreakdown: z.object({
    market: z.number().min(0).max(100),
    regulatory: z.number().min(0).max(100),
    catastrophe: z.number().min(0).max(100),
    technology: z.number().min(0).max(100),
  }),
  confidenceRationale: z.string().max(200), // Why this confidence level
  leadQuote: z.string().max(300).optional(), // Key factual excerpt
  disclosure: z.string().max(200).optional(), // If promotional/opinionated
});

export function hashUrl(u: string) {
  return hashUrlUtil(u);
}

export async function extractArticle(url: string) {
  try {
    // Enhanced fetch with user-agent to mimic browser and avoid blocks
    const res = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const html = await res.text();
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const parsed = reader.parse();

    // Extract main image: Look for og:image or first relevant img
    let mainImage: string | undefined;
    const metaImage = dom.window.document.querySelector('meta[property="og:image"]')?.getAttribute("content");
    if (metaImage) {
      mainImage = metaImage.startsWith("http") ? metaImage : new URL(metaImage, url).href;
    } else {
      const images = dom.window.document.querySelectorAll("img");
      if (images.length > 0) {
        mainImage = images[0].src.startsWith("http") ? images[0].src : new URL(images[0].src, url).href;
      }
    }

    // Extract author: From meta or byline
    let author: string | undefined;
    const metaAuthor = dom.window.document.querySelector('meta[name="author"]')?.getAttribute("content");
    if (metaAuthor) {
      author = metaAuthor;
    } else {
      const byline = dom.window.document.querySelector(".byline, .author")?.textContent?.trim();
      if (byline) author = byline;
    }

    return {
      url,
      title: parsed?.title ?? dom.window.document.title ?? "",
      html,
      text: (parsed?.textContent ?? "").trim(),
      mainImage,
      author,
    };
  } catch (error) {
    console.error(`Error extracting article from ${url}:`, error);
    throw error; // Let caller handle fallback
  }
}

export async function summarizeAndTag(
  client: OpenAI,
  art: Article & { text?: string; mainImage?: string; author?: string }
) {
  const jsonSchema = {
    name: "InsuranceBrief",
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        url: { type: "string" },
        source: { type: "string" },
        bullets5: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
        whyItMatters: {
          type: "object",
          properties: {
            underwriting: { type: "string", minLength: 20, maxLength: 200 },
            claims: { type: "string", minLength: 20, maxLength: 200 },
            brokerage: { type: "string", minLength: 20, maxLength: 200 },
            actuarial: { type: "string", minLength: 20, maxLength: 200 },
          },
          required: ["underwriting", "claims", "brokerage", "actuarial"],
          additionalProperties: false,
        },
        tags: {
          type: "object",
          properties: {
            lob: { type: "array", items: { type: "string" } },
            perils: { type: "array", items: { type: "string" } },
            regions: { type: "array", items: { type: "string" } },
            companies: { type: "array", items: { type: "string" } },
            trends: { type: "array", items: { type: "string" } },
            regulations: { type: "array", items: { type: "string" } },
          },
          required: ["lob", "perils", "regions", "companies", "trends", "regulations"],
          additionalProperties: false,
        },
        riskPulse: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
        sentiment: { type: "string", enum: ["POSITIVE", "NEGATIVE", "NEUTRAL"] },
        confidence: { type: "number", minimum: 0, maximum: 1 },
        citations: { type: "array", items: { type: "string" }, maxItems: 10 },
        impactScore: { type: "number", minimum: 0, maximum: 100 },
        impactBreakdown: {
          type: "object",
          properties: {
            market: { type: "number", minimum: 0, maximum: 100 },
            regulatory: { type: "number", minimum: 0, maximum: 100 },
            catastrophe: { type: "number", minimum: 0, maximum: 100 },
            technology: { type: "number", minimum: 0, maximum: 100 },
          },
          required: ["market", "regulatory", "catastrophe", "technology"],
          additionalProperties: false,
        },
        confidenceRationale: { type: "string", maxLength: 200 },
        leadQuote: { type: "string", maxLength: 300 },
        disclosure: { type: "string", maxLength: 200 },
      },
      required: ["title", "url", "source", "bullets5", "whyItMatters", "tags", "riskPulse", "sentiment", "confidence", "citations", "impactScore", "impactBreakdown", "confidenceRationale"],
    },
    strict: true,
  } as const;

  const currentDate = new Date().toISOString().split('T')[0]; // Use current date for timeliness

  const system = [
    "You are a senior P&C insurance analyst with 20+ years experience in underwriting, claims, and actuarial modeling.",
    "Analyze articles for relevance to U.S. P&C insurance: focus on lines like auto, property, casualty; perils like hurricane, cyber; regions (use ISO 3166-2 codes e.g., US-FL, US-CA); companies (exact names).",
    "Add trends (e.g., 'GenAI', 'Climate Risk', 'Social Inflation', 'Tort Reform', 'Secondary Perils', 'Litigation Funding') and regulations (e.g., 'NAIC Bulletin', 'DOI Bulletin', 'Rate Filing').",
    "CRITICAL: Create 3-5 precise, factual bullets (max 35 words each) that form a compelling 2-3 sentence executive summary when read sequentially.",
    "First bullet should be the headline impact. Second bullet should provide key context/data. Remaining bullets should detail implications and trends.",
    "Include quantitative data where present. Use [n] markers for citations that map to the citations array.",
    "For 'whyItMatters', provide outcome-oriented role-specific impacts (20-200 chars each): Decision, Risk, Action for each role.",
    "Assess riskPulse based on potential industry disruption: LOW (minor), MEDIUM (notable), HIGH (severe).",
    "Determine sentiment: POSITIVE (good for industry), NEGATIVE (challenges), NEUTRAL (informational).",
    "Provide confidence (0-1) based on article clarity and relevance to P&C, and explain in confidenceRationale (max 200 chars).",
    "Calculate impactScore (0-100) and break down by market, regulatory, catastrophe, technology dimensions.",
    "Include citations array with URLs referenced in bullets. Add leadQuote if there's a key factual excerpt. Add disclosure if article is promotional/opinionated.",
    "Return ONLY valid JSON per schema. Use current date " + currentDate + " for context if needed.",
    "Ensure bullets use [1], [2] citation markers. Include all v2 fields: citations, impactScore, impactBreakdown, confidenceRationale.",
    "URL: https://agencychecklists.com/2025/10/20/federal-report-2025-pc-sectors-decade-best-underwriting-profit-77765/",
    "SOURCE: Agency Checklists",
    "PUBLISHED: 2025-10-20",
    "TITLE: Federal Report 2025: P&C Sector’s Decade-Best Underwriting Profit",
    "CONTENT: [truncated content from the article...]",
    "",
    "Example Output:",
    '{"title":"Federal Report 2025: P&C Sector’s Decade-Best Underwriting Profit","url":"https://agencychecklists.com/2025/10/20/federal-report-2025-pc-sectors-decade-best-underwriting-profit-77765/","source":"Agency Checklists","bullets5":["The U.S. P&C sector achieved its best underwriting profit in a decade in 2024, with a combined ratio of 96.7% (down from 101.8% in 2023), net income of $171 billion (more than doubled), and record premiums of $1.06 trillion.","Investment income surged 28% to $88 billion, driven by a high-yield environment, while policyholder surplus grew 7% to $1.1 trillion, reflecting strong financial resilience despite high catastrophe losses.","Litigation costs declined in Florida due to tort reforms, reducing defense costs in homeowners multi-peril lines, while Third-Party Litigation Funding remains a concern.","Residential insurance markets face challenges: Florida Citizens reduced policies from 1.25 million to 924,732, but California’s FAIR Plan saw a 29.8% increase in dwelling policies and paid $2.7 billion in claims after major fires.","AI is transforming underwriting, claims, and fraud detection, with NAIC guidelines in place, while a new market for insuring digital assets is emerging, prompting regulatory discussions."],"whyItMatters":{"underwriting":"Improved combined ratio and premium growth indicate rate adequacy, but residential market pressures and litigation trends require careful risk selection and pricing adjustments.","claims":"Declining litigation costs in Florida signal potential cost savings, but rising claims in California’s FAIR Plan highlight the need for robust claims handling and reinsurance strategies.","brokerage":"Strong premium growth and investment income suggest a favorable market for brokers, but residual market growth and digital asset insurance present new opportunities and challenges.","actuarial":"Record catastrophe losses and litigation trends necessitate refined loss projections, while AI adoption and digital asset risks require updated modeling and regulatory compliance."},"tags":{"lob":["Property","Casualty","Personal Lines","Commercial Lines"],"perils":["Catastrophes","Litigation","Fire","Digital Asset Theft"],"regions":["US","US-FL","US-CA"],"companies":["Florida Citizens","California FAIR Plan"],"trends":["AI Adoption","Tort Reform","Digital Assets"],"regulations":["NAIC Bulletin","Florida Reforms"]},"riskPulse":"MEDIUM","sentiment":"POSITIVE","confidence":0.95}',
  ].join("\n");

  const input = [
    `URL: ${art.url}`,
    `SOURCE: ${art.source}`,
    `PUBLISHED: ${art.publishedAt ?? ""}`,
    `TITLE: ${art.title ?? ""}`,
    `AUTHOR: ${art.author ?? ""}`,
    "CONTENT:",
    (art.text ?? "").slice(0, 14000), // Truncate to avoid token limits
  ].join("\n");

  async function run(model: string) {
    const resp = await client.chat.completions.create({
      model,
      temperature: 0.2,
      max_tokens: 1200, // Increased for expanded schema
      response_format: { type: "json_schema", json_schema: jsonSchema },
      messages: [
        { role: "system", content: system },
        { role: "user", content: input },
      ],
    });
    const outText = resp.choices[0]?.message?.content ?? "{}";
    return schema.parse(JSON.parse(outText));
  }

  // Add exponential backoff retries (up to 5 attempts)
  try {
    return await backOff(() => run("gpt-4o-mini"), {
      numOfAttempts: 5,
      startingDelay: 1000,
      timeMultiple: 2,
      retry: (e) => {
        console.warn("OpenAI call failed, retrying:", e);
        return true;
      },
    });
  } catch (error) {
    console.error("Failed to summarize after retries:", error);
    throw error;
  }
}

export async function embedForRAG(client: OpenAI, text: string) {
  // Enhanced text for better semantic capture: Prefix with P&C context
  const enhancedText = `P&C Insurance Article: ${text}`;
  const e = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: enhancedText,
    dimensions: 512, // Increased dimensions for better similarity
  });
  return e.data[0].embedding;
}

/**
 * Calculate SmartScore v2: recency × relevance × impact × regulatory/catastrophe boosts
 * Returns a score 0-100 for ranking articles
 */
export function calculateSmartScore(params: {
  publishedAt?: string;
  impactScore: number;
  tags?: {
    regulations?: string[];
    perils?: string[];
  };
  regulatory?: boolean;
}): number {
  return calculateSmartScoreUtil(params);
}



/**
 * Normalize regions to ISO 3166-2 codes
 */
export function normalizeRegions(regions: string[]): string[] {
  return normalizeRegionsUtil(regions);
}

/**
 * Normalize company names to canonical forms
 */
export function normalizeCompanies(companies: string[]): string[] {
  return normalizeCompaniesUtil(companies);
}

/**
 * Generate canonical URL (respect og:url if present)
 */
export function getCanonicalUrl(url: string, html?: string): string {
  if (!html) return url;

  try {
    const dom = new JSDOM(html);
    const ogUrl = dom.window.document.querySelector('meta[property="og:url"]')?.getAttribute("content");
    if (ogUrl) return ogUrl;

    const canonical = dom.window.document.querySelector('link[rel="canonical"]')?.getAttribute("href");
    if (canonical) {
      return canonical.startsWith('http') ? canonical : new URL(canonical, url).href;
    }
  } catch {
    // Ignore parsing errors
  }

  return url;
}

/**
 * Compute content hash for deduplication (simhash-style)
 */
export function computeContentHash(text: string): string {
  return computeContentHashUtil(text);
}

/**
 * Detect storm/hurricane names from text
 * Returns storm name if found (e.g., "Hurricane Milton", "Tropical Storm Debby")
 */
export function detectStormName(text: string): string | undefined {
  return detectStormNameUtil(text);
}

/**
 * Detect if article is from a regulatory source (DOI bulletin, etc.)
 */
export function isRegulatorySource(url: string, source: string): boolean {
  return isRegulatorySourceUtil(url, source);
}

/**
 * AI-driven article scoring for P&C insurance professionals
 * Uses LLM to evaluate relevance, impact, and interest for underwriters, claims, brokers, actuaries
 */
export async function scoreArticleWithAI(
  client: OpenAI,
  article: {
    title: string;
    bullets5?: string[];
    whyItMatters?: Record<string, string>;
    tags?: Record<string, unknown>;
    impactScore?: number;
    publishedAt?: string;
    regulatory?: boolean;
    stormName?: string;
  }
): Promise<number> {
  try {
    const prompt = `You are an expert P&C insurance analyst scoring articles for relevance and impact to insurance professionals.

Article Title: ${article.title}

Key Points:
${(article.bullets5 || []).map((b, i) => `${i + 1}. ${b}`).join('\n')}

Professional Impact:
${Object.entries(article.whyItMatters || {})
  .map(([role, impact]) => `- ${role}: ${impact}`)
  .join('\n')}

Tags: ${JSON.stringify(article.tags || {})}
Impact Score: ${article.impactScore || 0}/100
Regulatory: ${article.regulatory ? 'Yes' : 'No'}
Storm/Catastrophe: ${article.stormName || 'None'}
Published: ${article.publishedAt || 'Unknown'}

Score this article on a scale of 0-100 for P&C insurance professionals based on:
1. Relevance to underwriting, claims, risk management, or actuarial work (40%)
2. Timeliness and recency (20%)
3. Impact on market, regulations, or catastrophe exposure (30%)
4. Actionability for insurance professionals (10%)

Consider:
- Regulatory changes affecting P&C insurance
- Catastrophe/peril developments
- Market trends affecting rates or availability
- Claims patterns or litigation trends
- Technology/innovation in insurance
- Competitive landscape changes

Respond with ONLY a single number 0-100, no explanation.`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 10,
      messages: [{ role: "user", content: prompt }],
    });

    const scoreText = (response.choices[0].message.content || "50").trim();
    const score = parseInt(scoreText, 10);

    if (isNaN(score) || score < 0 || score > 100) {
      console.warn(`[AI SCORE] Invalid score "${scoreText}", defaulting to 50`);
      return 50;
    }

    return score;
  } catch (error) {
    console.error('[AI SCORE ERROR]', error);
    return 50; // Default fallback score
  }
}