"use strict";
/**
 * Enhanced AI Prompts for CarrierSignal
 * Includes few-shot examples, chain-of-thought, and anti-hallucination clauses
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TREND_ANALYSIS_PROMPT = exports.ENTITY_EXTRACTION_PROMPT = exports.DEDUPLICATION_PROMPT = exports.SEMANTIC_SEARCH_PROMPT = exports.SCORING_PROMPT = exports.TAGGING_PROMPT = exports.SUMMARIZATION_PROMPT = void 0;
exports.SUMMARIZATION_PROMPT = `You are an expert insurance industry analyst. Analyze the following article and extract key insights for P&C insurance professionals.

CRITICAL RULES:
1. ONLY cite facts explicitly stated in the article
2. If information is not in the article, do NOT include it
3. Ensure all citations reference specific parts of the article
4. Be precise and avoid speculation

Extract the following in JSON format:
{
  "title": "Original article title",
  "bullets5": ["Bullet 1", "Bullet 2", "Bullet 3", "Bullet 4", "Bullet 5"],
  "whyItMatters": {
    "underwriting": "Impact on underwriting decisions",
    "claims": "Impact on claims handling",
    "brokerage": "Impact on broker operations",
    "actuarial": "Impact on actuarial analysis"
  },
  "leadQuote": "Most important direct quote from article",
  "citations": ["URL or source reference 1", "URL or source reference 2"]
}

Article to analyze:
{article_text}`;
exports.TAGGING_PROMPT = `You are an expert P&C insurance industry classifier. Analyze this article and assign appropriate tags.

CLASSIFICATION RULES:
1. Only assign tags that are clearly supported by article content
2. Be conservative - if unsure, omit the tag
3. Use standard insurance industry terminology
4. Maximum tags per category as specified

Article: {article_title}
{article_summary}

Assign tags in this JSON format:
{
  "lob": ["Auto", "Property", "Liability", "Workers Comp", "Cyber", "Specialty"],
  "perils": ["Hurricane", "Wildfire", "Flood", "Earthquake", "Cyber", "Hail"],
  "regions": ["US-CA", "US-FL", "US-TX", "US-NY"],
  "companies": ["State Farm", "Allstate", "Progressive"],
  "trends": ["Climate Risk", "Social Inflation", "GenAI", "Supply Chain"],
  "regulations": ["NAIC", "State DOI", "Tort Reform"]
}`;
exports.SCORING_PROMPT = `You are an expert P&C insurance news analyst. Score this article's relevance and impact.

SCORING METHODOLOGY:
- Relevance (0-100): How directly relevant to P&C insurance professionals
- Impact (0-100): Potential business impact on insurance operations
- Confidence (0-1): Your confidence in this assessment

Article Title: {article_title}
Summary: {article_summary}

Provide JSON response:
{
  "relevanceScore": 75,
  "impactScore": 80,
  "confidence": 0.85,
  "confidenceRationale": "Clear regulatory implications with specific company impacts",
  "riskPulse": "HIGH",
  "sentiment": "NEGATIVE"
}`;
exports.SEMANTIC_SEARCH_PROMPT = `You are an expert at understanding insurance industry queries. 
Expand this search query to include related terms and concepts that would help find relevant articles.

Query: {query}

Return a JSON object with:
{
  "expanded_terms": ["term1", "term2", "term3"],
  "related_concepts": ["concept1", "concept2"],
  "industry_synonyms": ["synonym1", "synonym2"]
}`;
exports.DEDUPLICATION_PROMPT = `You are an expert at identifying duplicate or near-duplicate news stories.
Compare these two article summaries and determine if they cover the same event/story.

Article 1 Title: {article1_title}
Article 1 Summary: {article1_summary}

Article 2 Title: {article2_title}
Article 2 Summary: {article2_summary}

Respond with JSON:
{
  "isDuplicate": true/false,
  "similarity": 0.95,
  "reasoning": "Both articles cover the same regulatory announcement from NAIC"
}`;
exports.ENTITY_EXTRACTION_PROMPT = `Extract key entities from this insurance news article.

Article: {article_text}

Return JSON with:
{
  "companies": ["Company1", "Company2"],
  "regulators": ["NAIC", "State DOI"],
  "perils": ["Hurricane", "Cyber"],
  "regions": ["Florida", "California"],
  "people": ["John Doe (CEO)"],
  "events": ["Rate Increase", "Merger"]
}`;
exports.TREND_ANALYSIS_PROMPT = `Analyze emerging trends in this batch of insurance articles.

Articles: {articles_summary}

Identify:
{
  "emergingTrends": ["Trend1", "Trend2"],
  "riskFactors": ["Risk1", "Risk2"],
  "opportunities": ["Opportunity1", "Opportunity2"],
  "timeframe": "Q4 2024"
}`;
//# sourceMappingURL=prompts.js.map