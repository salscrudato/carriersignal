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
  citations: z.array(z.string().url()).max(10), // URLs cited in bullets (must be valid URLs)
  impactScore: z.number().min(0).max(100), // Overall impact score
  impactBreakdown: z.object({
    market: z.number().min(0).max(100),
    regulatory: z.number().min(0).max(100),
    catastrophe: z.number().min(0).max(100),
    technology: z.number().min(0).max(100),
  }),
  confidenceRationale: z.string().max(200), // Why this confidence level
  leadQuote: z.string().max(300), // Key factual excerpt (required for OpenAI structured output)
  disclosure: z.string().max(200), // If promotional/opinionated (required for OpenAI structured output)
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
        citations: { type: "array", items: { type: "string", format: "uri" }, maxItems: 10 },
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
      required: ["title", "url", "source", "bullets5", "whyItMatters", "tags", "riskPulse", "sentiment", "confidence", "citations", "impactScore", "impactBreakdown", "confidenceRationale", "leadQuote", "disclosure"],
    },
    strict: true,
  } as const;

  const currentDate = new Date().toISOString().split('T')[0]; // Use current date for timeliness

  const system = [
    "# ROLE & EXPERTISE",
    "You are a senior P&C insurance analyst with 20+ years experience across underwriting, claims, actuarial science, and risk management.",
    "You specialize in translating complex insurance news into actionable intelligence for industry professionals.",
    "",
    "# ANALYSIS FRAMEWORK",
    "Analyze articles through the P&C insurance lens focusing on:",
    "- Lines of Business: Personal Auto, Commercial Auto, Homeowners, Commercial Property, General Liability, Workers Comp, Professional Liability, Cyber, Umbrella/Excess",
    "- Perils: Hurricane, Wildfire, Earthquake, Flood, Tornado, Hail, Severe Weather, Cyber Attack, Litigation",
    "- Regions: Use ISO 3166-2 for US states (US-FL, US-CA, US-TX, etc.); spell out full country names (Canada, Mexico, etc.). NEVER use city names.",
    "- Companies: Use exact legal names (State Farm, Allstate, Chubb, The Hanover, Cincinnati Insurance, Erie Insurance, Selective, Hiscox, etc.). Normalize variations.",
    "- Key Trends (CONTROLLED LIST): Climate Risk, Social Inflation, GenAI, Litigation Funding, Tort Reform, Rate Adequacy, Reinsurance, Capacity Constraints, Nuclear Verdicts, AOB, Parametric Insurance, Telematics, ESG, Wildfire Mitigation",
    "- Regulations: Name the specific rule/bulletin if explicit (e.g., 'Florida HB 221', 'NAIC Model Law'); otherwise use 'State DOI Bulletin', 'NAIC', etc.",
    "",
    "# BULLET WRITING EXCELLENCE & FACTS & CITATIONS",
    "Create 3-5 executive summary bullets that tell a complete story:",
    "",
    "STRUCTURE:",
    "• Bullet 1 (HEADLINE): Lead with the most critical finding - what happened and why it matters (max 40 words)",
    "• Bullet 2 (DATA/CONTEXT): Provide quantitative evidence and key context (max 35 words)",
    "• Bullet 3 (IMPLICATIONS): Explain market/industry implications (max 35 words)",
    "• Bullet 4 (TRENDS/DRIVERS): Connect to broader trends or root causes (max 35 words, optional)",
    "• Bullet 5 (OUTLOOK/ACTION): Forward-looking implications or recommended actions (max 35 words, optional)",
    "",
    "FACTS & CITATIONS REQUIREMENTS:",
    "✓ EVERY quantitative claim (numbers, percentages, dollar amounts) MUST have a [n] citation marker",
    "✓ EVERY specific data point MUST map to an item in the citations[] array",
    "✓ If a specific number is not in the source, write 'no quantified data in source' instead of inventing",
    "✓ Citations array must contain ONLY absolute URLs that actually support the bracketed claims",
    "✓ Maximum 5 citations per article; prioritize sources that directly support key facts",
    "✓ Do NOT cite the main article URL unless it contains external links to supporting sources",
    "",
    "QUALITY STANDARDS:",
    "✓ Lead with impact, not background",
    "✓ Use specific numbers, percentages, dollar amounts when available (with citations)",
    "✓ Avoid jargon unless industry-standard (combined ratio, loss ratio, CAT losses, etc.)",
    "✓ Each bullet should stand alone but flow sequentially",
    "✓ Use active voice and strong verbs",
    "✓ Include [1], [2] citation markers for key facts (REQUIRED for all quantitative claims)",
    "",
    "EXAMPLES OF EXCELLENT BULLETS:",
    "✓ \"Florida's tort reforms reduced homeowners defense costs by 23% in Q3 2024, driving the state's combined ratio down to 94.2% from 108.5% in 2023, marking the first underwriting profit in three years.\"",
    "✓ \"California FAIR Plan exposure surged 29.8% to $458 billion as major carriers non-renewed 2.1 million policies in wildfire-prone areas, creating a residual market crisis that threatens state solvency.\"",
    "✓ \"Third-party litigation funding in auto injury claims increased average settlement costs by 47% across 12 states, with Florida, Louisiana, and California seeing the highest impact on loss ratios.\"",
    "",
    "# WHY IT MATTERS (Role-Specific Insights)",
    "Provide crisp, actionable insights for each role (20-120 chars, MUST be actionable):",
    "• Underwriting: What should underwriters watch/change/ask? Impact on risk selection, pricing, appetite, capacity, or underwriting guidelines",
    "• Claims: What should claims teams prepare for? Impact on loss costs, settlement strategies, litigation trends, fraud patterns, or reserve adequacy",
    "• Brokerage: What should brokers advise clients? Impact on market conditions, placement strategies, client risk profiles, or advisory opportunities",
    "• Actuarial: What should actuaries model/adjust? Impact on loss projections, reserving, pricing models, capital requirements, or assumption changes",
    "",
    "ROLE-SPECIFIC EXAMPLES:",
    "✓ Underwriting: 'Tighten underwriting for Florida homeowners; tort reforms reduce defense costs but exposure remains elevated.'",
    "✓ Claims: 'Prepare for higher litigation costs in California; FAIR Plan claims surge 29.8% YoY, requiring enhanced reserve strategies.'",
    "✓ Brokerage: 'Advise clients on residual market growth; placement challenges in FL/CA may require alternative risk transfer solutions.'",
    "✓ Actuarial: 'Update loss projections for CA FAIR Plan; 29.8% exposure growth and $2.7B claims require revised catastrophe models.'",
    "",
    "# SCORING METHODOLOGY",
    "",
    "IMPACT SCORE (0-100): Overall significance to P&C industry",
    "• 90-100: Industry-transforming (major CAT, regulatory overhaul, market crisis)",
    "• 70-89: Highly significant (large carrier action, state-level reform, emerging trend)",
    "• 50-69: Notable (regional impact, specific LOB changes, tactical shifts)",
    "• 30-49: Moderate (company news, incremental changes, niche topics)",
    "• 0-29: Low (tangential relevance, minor updates)",
    "",
    "IMPACT BREAKDOWN (each 0-100, MUST sum conceptually to overall impactScore):",
    "• Market: Effect on rates, capacity, competition, M&A, financial results (0-100)",
    "• Regulatory: Effect on compliance, rate filings, solvency, market conduct (0-100)",
    "• Catastrophe: Effect on loss exposure, reinsurance, accumulation risk (0-100)",
    "• Technology: Effect on operations, underwriting, claims, distribution (0-100)",
    "NOTE: impactBreakdown values reflect emphasis areas, NOT a sum. Each is independent 0-100.",
    "",
    "RISK PULSE (Industry Disruption Potential):",
    "• HIGH: Severe disruption - immediate action required (major CAT, market exit, regulatory emergency)",
    "• MEDIUM: Notable impact - strategic response needed (rate changes, capacity shifts, new regulations)",
    "• LOW: Minor impact - monitoring sufficient (incremental changes, niche developments)",
    "",
    "SENTIMENT:",
    "• POSITIVE: Favorable for industry profitability, stability, or growth",
    "• NEGATIVE: Challenges to profitability, capacity, or operations",
    "• NEUTRAL: Informational without clear directional impact",
    "",
    "CONFIDENCE (0-1): Based on article quality, data specificity, source credibility",
    "• 0.9-1.0: Authoritative source (NAIC, DOI, major carrier), specific quantified data, direct P&C relevance",
    "• 0.7-0.89: Credible source (industry publication), some quantified data, clear industry connection",
    "• 0.5-0.69: General source (news outlet), limited data, indirect relevance",
    "• 0-0.49: Questionable source, vague claims, tangential connection",
    "CONFIDENCE RATIONALE (≤200 chars): Explain WHY this confidence level (e.g., 'NAIC official source with specific loss data' or 'Industry blog with limited quantification')",
    "",
    "# OUTPUT REQUIREMENTS",
    "Return ONLY valid JSON matching the schema. Current date: " + currentDate,
    "Include all required fields: citations array, impactScore, impactBreakdown, confidenceRationale, leadQuote, disclosure.",
    "",
    "LEAD QUOTE (≤300 chars): Extract an exact, short factual excerpt from the article (with quotation marks if direct quote). No opinions or synthesis.",
    "DISCLOSURE (≤200 chars): Set to 'Vendor/Opinionated' if source is promotional or opinion-based; otherwise leave empty string ''.",
    "CITATIONS: Array of absolute URLs that directly support bracketed claims in bullets. Maximum 5 items.",
    "Use citation markers [1], [2] in bullets for ALL quantitative claims.",
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

/**
 * Ensure impactScore and impactBreakdown are coherent
 * - impactScore should be 0-100
 * - impactBreakdown fields should be 0-100
 * - impactBreakdown should sum to approximately impactScore (within tolerance)
 */
function ensureImpactCoherence(article: z.infer<typeof schema>): z.infer<typeof schema> {
  const impactScore = Math.max(0, Math.min(100, article.impactScore || 0));

  let impactBreakdown = article.impactBreakdown || {
    market: 0,
    regulatory: 0,
    catastrophe: 0,
    technology: 0,
  };

  // Ensure all breakdown fields are 0-100
  impactBreakdown = {
    market: Math.max(0, Math.min(100, impactBreakdown.market || 0)),
    regulatory: Math.max(0, Math.min(100, impactBreakdown.regulatory || 0)),
    catastrophe: Math.max(0, Math.min(100, impactBreakdown.catastrophe || 0)),
    technology: Math.max(0, Math.min(100, impactBreakdown.technology || 0)),
  };

  // Check coherence: breakdown sum should be close to impactScore
  const breakdownSum = (impactBreakdown.market + impactBreakdown.regulatory +
                        impactBreakdown.catastrophe + impactBreakdown.technology) / 4;

  if (Math.abs(breakdownSum - impactScore) > 20) {
    console.warn(`[IMPACT COHERENCE] Breakdown average (${Math.round(breakdownSum)}) differs from impactScore (${impactScore}) by >20 points`);
  }

  return {
    ...article,
    impactScore,
    impactBreakdown,
  };
}

/**
 * Post-parse validation for article data
 * - Deduplicates citations (case-insensitive)
 * - Validates all citations are proper URLs
 * - Ensures bullets only use [1],[2] markers if citations exist
 * - Removes citation markers from bullets if no valid citations
 * - Ensures impactScore and impactBreakdown are coherent
 */
export function validateAndCleanArticle(article: z.infer<typeof schema>): z.infer<typeof schema> {
  // Deduplicate citations (case-insensitive)
  const uniqueCitations = Array.from(
    new Set(article.citations.map(c => c.toLowerCase()))
  ).map(c => article.citations.find(orig => orig.toLowerCase() === c)!);

  // Validate all citations are proper URLs
  const validCitations = uniqueCitations.filter(c => {
    try {
      new URL(c);
      return true;
    } catch {
      console.warn(`Invalid citation URL: ${c}`);
      return false;
    }
  });

  // Clean bullets: remove citation markers if no valid citations exist
  let cleanedBullets = article.bullets5;
  if (validCitations.length === 0) {
    cleanedBullets = article.bullets5.map(b => {
      const hasMarkers = /\[\d+\]/.test(b);
      if (hasMarkers) {
        console.warn(`Removing citation markers from bullet: "${b}"`);
        return b.replace(/\s*\[\d+\]\s*/g, ' ').trim();
      }
      return b;
    });
  } else {
    // Validate that citation markers only reference valid citations
    cleanedBullets = article.bullets5.map(b => {
      const markers = b.match(/\[\d+\]/g) || [];
      const validMarkers = markers.filter(m => {
        const idx = parseInt(m.slice(1, -1), 10);
        return idx > 0 && idx <= validCitations.length;
      });

      if (validMarkers.length < markers.length) {
        console.warn(`Removing invalid citation markers from bullet: "${b}"`);
        let cleaned = b;
        markers.forEach(m => {
          const idx = parseInt(m.slice(1, -1), 10);
          if (idx < 1 || idx > validCitations.length) {
            cleaned = cleaned.replace(m, '');
          }
        });
        return cleaned.replace(/\s+/g, ' ').trim();
      }
      return b;
    });
  }

  let result = {
    ...article,
    bullets5: cleanedBullets,
    citations: validCitations,
  };

  // Ensure impactScore and impactBreakdown are coherent
  result = ensureImpactCoherence(result);

  return result;
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
 * Calculate SmartScore v3: Enhanced multi-dimensional scoring for P&C insurance
 * Returns a score 0-100 for ranking articles
 */
export function calculateSmartScore(params: {
  publishedAt?: string;
  impactScore: number;
  impactBreakdown?: {
    market?: number;
    regulatory?: number;
    catastrophe?: number;
    technology?: number;
  };
  tags?: {
    regulations?: string[];
    perils?: string[];
    lob?: string[];
    trends?: string[];
  };
  regulatory?: boolean;
  riskPulse?: 'LOW' | 'MEDIUM' | 'HIGH';
  stormName?: string;
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
 * AI-driven article scoring for P&C insurance professionals (v3 Enhanced)
 * Uses LLM to evaluate relevance, impact, and professional interest
 * Focuses on actionability and decision-making value
 * Includes timeout, retry, and fallback logic
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
    riskPulse?: string;
    sentiment?: string;
  }
): Promise<number> {
  const TIMEOUT_MS = 10000; // 10 second timeout
  const MAX_RETRIES = 2;

  const scoreWithTimeout = async (): Promise<number> => {
    const prompt = `You are a senior P&C insurance analyst evaluating article relevance for industry professionals (underwriters, claims adjusters, actuaries, brokers, risk managers).

ARTICLE ANALYSIS:
Title: ${article.title}

Executive Summary:
${(article.bullets5 || []).map((b, i) => `${i + 1}. ${b}`).join('\n')}

Professional Impact:
${Object.entries(article.whyItMatters || {})
  .map(([role, impact]) => `• ${role.toUpperCase()}: ${impact}`)
  .join('\n')}

Metadata:
• Tags: ${JSON.stringify(article.tags || {})}
• Impact Score: ${article.impactScore || 0}/100
• Risk Pulse: ${article.riskPulse || 'UNKNOWN'}
• Sentiment: ${article.sentiment || 'NEUTRAL'}
• Regulatory: ${article.regulatory ? 'Yes' : 'No'}
• Named Storm: ${article.stormName || 'None'}
• Published: ${article.publishedAt || 'Unknown'}

SCORING CRITERIA (0-100):

Rate this article's value to P&C insurance professionals based on:

1. PROFESSIONAL RELEVANCE (35 points):
   - Direct impact on underwriting decisions, pricing, or risk selection
   - Affects claims handling, settlement strategies, or loss costs
   - Influences actuarial models, reserving, or capital requirements
   - Impacts brokerage placement, client advisory, or market access

2. ACTIONABILITY (25 points):
   - Provides specific data, metrics, or quantitative insights
   - Enables immediate decision-making or strategic planning
   - Offers competitive intelligence or market positioning insights
   - Contains regulatory guidance or compliance requirements

3. MARKET SIGNIFICANCE (25 points):
   - Affects rates, capacity, or market availability
   - Involves major carriers, significant market share, or systemic risk
   - Represents emerging trends or structural market changes
   - Impacts reinsurance, capital markets, or industry economics

4. TIMELINESS & URGENCY (15 points):
   - Breaking news requiring immediate attention
   - Time-sensitive regulatory or catastrophe developments
   - Evolving situations with ongoing implications
   - Enduring relevance beyond immediate news cycle

SCORING GUIDELINES:
• 90-100: CRITICAL - Industry-transforming events (major CAT, regulatory overhaul, market crisis, carrier insolvency)
• 75-89: HIGH VALUE - Significant developments (state reforms, large carrier actions, emerging trends, material rate changes)
• 60-74: VALUABLE - Notable industry news (regional impacts, specific LOB changes, tactical intelligence)
• 45-59: MODERATE - Relevant updates (company news, incremental changes, niche topics)
• 30-44: LIMITED - Tangential relevance (peripheral topics, minor updates, low actionability)
• 0-29: LOW - Minimal P&C relevance (general business news, unrelated topics)

PRIORITIZE:
✓ Catastrophe loss events and accumulation risk
✓ Regulatory changes affecting rates, forms, or solvency
✓ Litigation trends and nuclear verdicts
✓ Market capacity shifts and carrier exits/entries
✓ Rate adequacy and combined ratio impacts
✓ Reinsurance market developments
✓ Technology disruption (AI, telematics, parametric)
✓ Climate risk and secondary perils
✓ Social inflation and claims cost trends

DEPRIORITIZE:
✗ Generic business news without P&C angle
✗ Promotional content or vendor marketing
✗ Life/health insurance topics
✗ International news without U.S. market impact
✗ Tangential technology without insurance application

Respond with ONLY a single integer 0-100, no explanation or additional text.`;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.1, // Low temperature for consistent scoring
        max_tokens: 10,
        messages: [{ role: "user", content: prompt }],
      });

      clearTimeout(timeoutId);

      const scoreText = (response.choices[0].message.content || "50").trim();
      const score = parseInt(scoreText, 10);

      if (isNaN(score) || score < 0 || score > 100) {
        console.warn(`[AI SCORE] Invalid score "${scoreText}", defaulting to 50`);
        return 50;
      }

      console.log(`[AI SCORE] "${article.title}" → ${score}/100`);
      return score;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  // Retry logic with exponential backoff
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await scoreWithTimeout();
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        console.error(`[AI SCORE] Failed after ${MAX_RETRIES + 1} attempts:`, error);
        return 50; // Final fallback
      }
      const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
      console.warn(`[AI SCORE] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return 50; // Should not reach here, but safety fallback
}