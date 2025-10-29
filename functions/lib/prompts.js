"use strict";
/**
 * Enhanced AI Prompts for CarrierSignal
 * Includes few-shot examples, chain-of-thought, and anti-hallucination clauses
 * Optimized for P&C insurance domain with actionable insights
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TREND_ANALYSIS_PROMPT = exports.ENTITY_EXTRACTION_PROMPT = exports.DEDUPLICATION_PROMPT = exports.SEMANTIC_SEARCH_PROMPT = exports.SCORING_PROMPT = exports.TAGGING_PROMPT = exports.SUMMARIZATION_PROMPT = void 0;
exports.SUMMARIZATION_PROMPT = `You are a senior P&C insurance analyst with expertise in underwriting, claims, actuarial science, and regulatory compliance. Analyze the following article and extract key insights for insurance professionals.

CRITICAL RULES:
1. ONLY cite facts explicitly stated in the article - NO speculation or inference
2. Focus on actionable insights for P&C professionals (underwriters, claims adjusters, actuaries, brokers, risk managers)
3. Identify specific regulatory implications, market impacts, and operational changes
4. Ensure all bullets are concrete, factual, and directly quoted or paraphrased from the article
5. Prioritize information that affects underwriting decisions, claims handling, or risk assessment

CHAIN-OF-THOUGHT ANALYSIS:
- First, identify the core news event or announcement
- Then, determine which P&C segments are affected (Auto, Property, Liability, Workers Comp, Cyber, Specialty)
- Next, assess regulatory, market, and operational impacts
- Finally, extract actionable insights for each professional role

Extract the following in JSON format:
{
  "title": "Original article title",
  "bullets5": ["Bullet 1 - specific, factual, actionable", "Bullet 2", "Bullet 3", "Bullet 4", "Bullet 5"],
  "whyItMatters": {
    "underwriting": "Specific impact on underwriting decisions, risk assessment, or pricing",
    "claims": "Impact on claims handling procedures, reserves, or litigation strategy",
    "brokerage": "Impact on broker operations, client communication, or policy placement",
    "actuarial": "Impact on actuarial analysis, reserving, or rate-making"
  },
  "leadQuote": "Most important direct quote from article (must be verbatim or clearly paraphrased)",
  "citations": ["URL or source reference 1", "URL or source reference 2"]
}

Article to analyze:
{article_text}`;
exports.TAGGING_PROMPT = `You are an expert P&C insurance industry classifier with deep knowledge of lines of business, perils, regulatory frameworks, and market trends. Analyze this article and assign appropriate tags.

CLASSIFICATION RULES:
1. Only assign tags that are EXPLICITLY supported by article content - no inference
2. Be conservative: if unsure, omit the tag
3. Use standard insurance industry terminology and ISO codes for regions
4. Maximum tags per category as specified
5. Prioritize accuracy over coverage

TAGGING GUIDELINES:
- LOB: Auto, Property, Homeowners, Commercial, Liability, Workers Comp, Cyber, Specialty, Umbrella
- PERILS: Hurricane, Tornado, Wildfire, Flood, Earthquake, Hail, Winter Storm, Cyber, Terrorism, Pollution
- REGIONS: Use ISO 3166-2 codes (US-CA, US-FL, etc.) or country codes
- COMPANIES: Major insurers, reinsurers, MGAs mentioned in article
- TRENDS: Climate Risk, Social Inflation, GenAI/Automation, Supply Chain, Underwriting Capacity, Rate Hardening, Reinsurance Costs, Catastrophe Bonds, Parametric Insurance
- REGULATIONS: NAIC, State DOI, Tort Reform, Rate Regulation, Solvency Requirements, Cybersecurity Mandates

Article: {article_title}
{article_summary}

Assign tags in this JSON format:
{
  "lob": ["Auto", "Property"],
  "perils": ["Hurricane"],
  "regions": ["US-FL", "US-LA"],
  "companies": ["State Farm"],
  "trends": ["Climate Risk"],
  "regulations": ["NAIC"]
}`;
exports.SCORING_PROMPT = `You are a senior P&C insurance analyst evaluating article relevance and impact for industry professionals. Use chain-of-thought reasoning to score this article.

SCORING METHODOLOGY:
- Relevance (0-100): Direct relevance to P&C insurance professionals' decision-making
  * 80-100: Critical for underwriting, claims, actuarial, or regulatory compliance
  * 60-79: Important market or operational information
  * 40-59: Tangential to insurance operations
  * 0-39: Minimal relevance to P&C professionals

- Impact (0-100): Potential business impact on insurance operations
  * 80-100: Affects pricing, underwriting criteria, claims handling, or regulatory compliance
  * 60-79: Affects market dynamics or competitive positioning
  * 40-59: Affects specific segments or regions
  * 0-39: Minimal operational impact

- Confidence (0-1): Your confidence in this assessment (0.5-1.0 range)

CHAIN-OF-THOUGHT ANALYSIS:
1. Identify the core news event and affected P&C segments
2. Assess regulatory, market, and operational implications
3. Determine actionability for insurance professionals
4. Evaluate confidence based on clarity and specificity of information

Article Title: {article_title}
Summary: {article_summary}

Provide JSON response:
{
  "relevanceScore": 75,
  "impactScore": 80,
  "confidence": 0.85,
  "confidenceRationale": "Clear regulatory implications with specific company impacts and underwriting implications",
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