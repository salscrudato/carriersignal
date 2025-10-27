import OpenAI from "openai";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import crypto from "node:crypto";
import { z } from "zod";
import { backOff } from "exponential-backoff"; // Import for retry logic

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
    trends: z.array(z.string()).max(8), // New: Trends like "AI", "Climate Change", "InsurTech"
    regulations: z.array(z.string()).max(5), // New: Regulatory aspects, e.g., "NAIC Bulletin", "Tort Reform"
  }),
  riskPulse: z.enum(["LOW", "MEDIUM", "HIGH"]),
  sentiment: z.enum(["POSITIVE", "NEGATIVE", "NEUTRAL"]), // New: Overall sentiment
  confidence: z.number().min(0).max(1), // New: AI confidence in classification (0-1)
});

export function hashUrl(u: string) {
  return crypto.createHash("sha256").update(u).digest("hex").slice(0, 24);
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
      },
      required: ["title", "url", "source", "bullets5", "whyItMatters", "tags", "riskPulse", "sentiment", "confidence"],
    },
    strict: true,
  } as const;

  const currentDate = new Date().toISOString().split('T')[0]; // Use current date for timeliness

  const system = [
    "You are a senior P&C insurance analyst with 20+ years experience in underwriting, claims, and actuarial modeling.",
    "Analyze articles for relevance to U.S. P&C insurance: focus on lines like auto, property, casualty; perils like hurricane, cyber; regions (use ISO codes e.g., US-FL); companies (exact names).",
    "Add trends (e.g., 'AI Adoption', 'Climate Risk') and regulations (e.g., 'NAIC Bulletin', 'Tort Reform').",
    "Summarize in 3-5 precise, factual bullets (max 50 words each).",
    "For 'whyItMatters', provide concise, role-specific impacts (20-200 chars each): how it affects decisions, risks, opportunities.",
    "Assess riskPulse based on potential industry disruption: LOW (minor), MEDIUM (notable), HIGH (severe).",
    "Determine sentiment: POSITIVE (good for industry), NEGATIVE (challenges), NEUTRAL (informational).",
    "Provide confidence (0-1) based on article clarity and relevance to P&C.",
    "Return ONLY valid JSON per schema. Use current date " + currentDate + " for context if needed.",
    "",
    "Example Input:",
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