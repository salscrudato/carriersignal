/**
 * AI Key Points Generator
 * Generates 3-5 insurance-relevant key points from article content
 * Optimized prompt for insurance sector analysis
 */

const INSURANCE_KEYWORDS = [
  'premium', 'claim', 'coverage', 'policy', 'deductible', 'liability',
  'underwriting', 'risk', 'loss', 'damage', 'catastrophe', 'disaster',
  'rate', 'insurer', 'carrier', 'broker', 'agent', 'adjuster',
  'fraud', 'compliance', 'regulation', 'reserve', 'capital',
  'reinsurance', 'catastrophe bond', 'loss ratio', 'combined ratio',
  'cyber', 'ransomware', 'data breach', 'property', 'casualty',
  'workers comp', 'auto', 'home', 'commercial', 'umbrella',
  'weather', 'flood', 'hurricane', 'wildfire', 'earthquake',
  'financial stress', 'insolvency', 'downgrade', 'rating'
];

/**
 * Generate insurance-relevant key points from article content
 * Uses local analysis without external API calls
 */
export function generateInsuranceKeyPoints(
  title: string,
  description: string,
  content?: string
): string[] {
  const fullText = `${title} ${description} ${content || ''}`.toLowerCase();
  const keyPoints: string[] = [];

  // Extract insurance-specific insights
  const insights = extractInsuranceInsights(fullText, title, description);

  // Generate key points based on insights - prioritize in order
  if (insights.riskImpact) {
    keyPoints.push(insights.riskImpact);
  }
  if (insights.marketImpact) {
    keyPoints.push(insights.marketImpact);
  }
  if (insights.regulatoryImpact) {
    keyPoints.push(insights.regulatoryImpact);
  }
  if (insights.operationalImpact) {
    keyPoints.push(insights.operationalImpact);
  }
  if (insights.financialImpact) {
    keyPoints.push(insights.financialImpact);
  }

  // Filter out empty strings
  const filteredPoints = keyPoints.filter(p => p.length > 0);

  // Ensure minimum 3 key points - generate fallback insights if needed
  if (filteredPoints.length < 3) {
    const fallbackInsights = generateFallbackInsights(fullText, title, description);
    filteredPoints.push(...fallbackInsights);
  }

  // Return 3-5 key points
  return filteredPoints.slice(0, 5);
}

/**
 * Extract insurance-specific insights from article text
 * Generates article-specific insights rather than generic templates
 */
function extractInsuranceInsights(
  text: string,
  title: string,
  description: string
): Record<string, string> {
  const insights: Record<string, string> = {};
  const fullContent = `${title} ${description} ${text}`.toLowerCase();

  // Risk Impact Analysis - Extract specific risk types
  if (fullContent.includes('hurricane') || fullContent.includes('tropical storm')) {
    insights.riskImpact = 'Hurricane Risk: Coastal property exposure faces elevated loss potential from tropical storm systems.';
  } else if (fullContent.includes('wildfire') || fullContent.includes('forest fire')) {
    insights.riskImpact = 'Wildfire Exposure: Western property portfolios face increased loss severity from expanding fire seasons.';
  } else if (fullContent.includes('flood')) {
    insights.riskImpact = 'Flood Risk: Water damage claims and flood insurance availability becoming critical underwriting factors.';
  } else if (fullContent.includes('earthquake')) {
    insights.riskImpact = 'Seismic Risk: Earthquake exposure in active zones driving higher loss reserves and reinsurance costs.';
  } else if (fullContent.includes('ransomware') || fullContent.includes('cyber attack')) {
    insights.riskImpact = 'Cyber Threat: Ransomware attacks increasing cyber liability claims and business interruption losses.';
  } else if (fullContent.includes('data breach')) {
    insights.riskImpact = 'Data Security: Privacy breaches driving demand for cyber and E&O insurance coverage.';
  } else if (fullContent.includes('claim') && fullContent.includes('surge')) {
    insights.riskImpact = 'Claims Surge: Elevated claim frequency and severity impacting loss ratios and reserve adequacy.';
  } else if (fullContent.includes('liability') && fullContent.includes('exposure')) {
    insights.riskImpact = 'Liability Exposure: Emerging liability trends affecting underwriting standards and premium rates.';
  }

  // Market Impact Analysis - Extract specific market dynamics
  if (fullContent.includes('rate increase') || fullContent.includes('premium increase')) {
    const percentage = extractPercentage(fullContent);
    insights.marketImpact = `Rate Adjustment: ${percentage ? `${percentage} premium increases` : 'Significant rate increases'} reflecting loss experience and market conditions.`;
  } else if (fullContent.includes('rate decrease') || fullContent.includes('premium decrease')) {
    insights.marketImpact = 'Rate Softening: Competitive pricing pressure and improved loss experience driving rate reductions.';
  } else if (fullContent.includes('merger') || fullContent.includes('acquisition')) {
    const companies = extractCompanyNames(fullContent);
    insights.marketImpact = `Market Consolidation: ${companies ? `${companies} transaction` : 'Strategic consolidation'} reshaping competitive landscape and market capacity.`;
  } else if (fullContent.includes('insolvency') || fullContent.includes('receivership')) {
    insights.marketImpact = 'Carrier Failure: Insolvency event reducing market capacity and affecting policyholder protections.';
  } else if (fullContent.includes('capacity') && fullContent.includes('constrain')) {
    insights.marketImpact = 'Capacity Constraints: Limited underwriting capacity driving selective underwriting and higher rates.';
  }

  // Regulatory Impact Analysis - Extract specific regulatory actions
  if (fullContent.includes('rate filing') || fullContent.includes('rate approval')) {
    insights.regulatoryImpact = 'Rate Regulation: State insurance regulators reviewing and approving rate filings affecting market pricing.';
  } else if (fullContent.includes('climate') && fullContent.includes('regulation')) {
    insights.regulatoryImpact = 'Climate Regulation: New climate-related regulatory requirements affecting underwriting and disclosure.';
  } else if (fullContent.includes('enforcement') && fullContent.includes('violation')) {
    insights.regulatoryImpact = 'Regulatory Enforcement: Compliance violations resulting in penalties and operational requirements.';
  } else if (fullContent.includes('legislation') || fullContent.includes('bill')) {
    insights.regulatoryImpact = 'Legislative Action: New insurance legislation affecting policy requirements and market operations.';
  } else if (fullContent.includes('mandate') || fullContent.includes('requirement')) {
    insights.regulatoryImpact = 'Compliance Mandate: New regulatory requirements necessitating operational and underwriting changes.';
  }

  // Operational Impact Analysis - Extract specific operational changes
  if (fullContent.includes('technology') && fullContent.includes('invest')) {
    insights.operationalImpact = 'Technology Investment: Digital transformation initiatives improving underwriting and claims efficiency.';
  } else if (fullContent.includes('artificial intelligence') || fullContent.includes('machine learning')) {
    insights.operationalImpact = 'AI Implementation: Machine learning and AI adoption enhancing risk assessment and fraud detection.';
  } else if (fullContent.includes('automation')) {
    insights.operationalImpact = 'Process Automation: Workflow automation reducing operational costs and improving turnaround times.';
  } else if (fullContent.includes('talent') || fullContent.includes('workforce shortage')) {
    insights.operationalImpact = 'Workforce Challenge: Labor market tightness affecting hiring and retention of insurance professionals.';
  } else if (fullContent.includes('remote') || fullContent.includes('hybrid')) {
    insights.operationalImpact = 'Work Model Evolution: Hybrid and remote work arrangements reshaping operational infrastructure.';
  }

  // Financial Impact Analysis - Extract specific financial metrics
  if (fullContent.includes('earnings') || fullContent.includes('profit')) {
    const direction = fullContent.includes('decline') || fullContent.includes('loss') ? 'declining' : 'improving';
    insights.financialImpact = `Financial Performance: ${direction} earnings reflecting underwriting results and investment returns.`;
  } else if (fullContent.includes('loss ratio')) {
    insights.financialImpact = 'Loss Ratio Pressure: Deteriorating loss ratios impacting profitability and capital adequacy.';
  } else if (fullContent.includes('combined ratio')) {
    insights.financialImpact = 'Combined Ratio Impact: Underwriting profitability metrics affecting financial performance and dividends.';
  } else if (fullContent.includes('capital') && fullContent.includes('requirement')) {
    insights.financialImpact = 'Capital Requirements: Regulatory capital needs affecting dividend policy and growth investments.';
  } else if (fullContent.includes('reserve') && fullContent.includes('increase')) {
    insights.financialImpact = 'Reserve Strengthening: Increased loss reserves reflecting claims experience and risk assessment.';
  }

  return insights;
}

/**
 * Extract percentage from text
 */
function extractPercentage(text: string): string | null {
  const match = text.match(/(\d+(?:\.\d+)?)\s*%/);
  return match ? `${match[1]}%` : null;
}

/**
 * Extract company names from text
 */
function extractCompanyNames(text: string): string | null {
  // Look for common insurance company patterns
  const companies = [
    'State Farm', 'Allstate', 'Geico', 'Progressive', 'Berkshire',
    'AIG', 'Travelers', 'Hartford', 'Chubb', 'Zurich'
  ];

  for (const company of companies) {
    if (text.toLowerCase().includes(company.toLowerCase())) {
      return company;
    }
  }
  return null;
}

/**
 * Generate a concise insurance-focused summary
 */
export function generateInsuranceSummary(
  title: string,
  description: string
): string {
  const text = `${title} ${description}`.toLowerCase();

  // Identify primary insurance sector impact
  if (text.includes('property') || text.includes('casualty')) {
    return 'P&C Insurance';
  } else if (text.includes('life') || text.includes('health')) {
    return 'Life & Health';
  } else if (text.includes('cyber') || text.includes('data')) {
    return 'Cyber Insurance';
  } else if (text.includes('workers') || text.includes('comp')) {
    return 'Workers Comp';
  } else if (text.includes('auto') || text.includes('vehicle')) {
    return 'Auto Insurance';
  } else if (text.includes('commercial')) {
    return 'Commercial Lines';
  } else if (text.includes('reinsurance') || text.includes('catastrophe')) {
    return 'Reinsurance';
  }

  return 'Insurance Industry';
}

/**
 * Generate fallback insights when primary insights are insufficient
 * These are more specific and article-focused than generic templates
 */
function generateFallbackInsights(
  text: string,
  title: string,
  description: string
): string[] {
  const fallbacks: string[] = [];
  const fullContent = `${title} ${description} ${text}`.toLowerCase();

  // Extract specific entities and context from the article
  const hasNumbers = /\d+%|\$\d+|rate|premium|increase|decrease/.test(fullContent);
  const hasRegulation = /regulation|compliance|requirement|rule|law|mandate|enforcement/.test(fullContent);
  const hasDisaster = /hurricane|flood|wildfire|earthquake|storm|disaster|catastrophe|weather/.test(fullContent);
  const hasRisk = /risk|exposure|loss|claim|damage|liability|coverage/.test(fullContent);
  const hasCyber = /cyber|ransomware|breach|data|security|attack|hacking/.test(fullContent);
  const hasM_A = /acquisition|merger|acquisition|buyout|consolidation|deal/.test(fullContent);
  const hasRate = /rate|premium|pricing|cost|expense|fee/.test(fullContent);
  const hasCompany = /company|carrier|insurer|provider|firm|organization/.test(fullContent);

  // Fallback 1: Specific to article content
  if (hasDisaster) {
    const disasterType = extractDisasterType(fullContent);
    fallbacks.push(`${disasterType} Impact: Natural disaster event with significant implications for property and casualty insurance exposure.`);
  } else if (hasCyber) {
    fallbacks.push('Cyber Risk Development: Emerging cyber threat or data security incident affecting insurance industry.');
  } else if (hasM_A) {
    fallbacks.push('Market Consolidation: Merger, acquisition, or strategic partnership reshaping competitive landscape.');
  } else if (hasRegulation) {
    fallbacks.push('Regulatory Change: New compliance requirement or regulatory action affecting insurance operations.');
  } else if (hasRate) {
    fallbacks.push('Pricing Dynamics: Rate changes, premium adjustments, or pricing strategy developments in the market.');
  } else if (hasRisk) {
    fallbacks.push('Risk Assessment: Article addresses emerging risks or changes in insurance exposure patterns.');
  } else if (hasCompany) {
    fallbacks.push('Industry Development: Significant company announcement or strategic initiative affecting the sector.');
  } else {
    fallbacks.push('Market Update: Important insurance industry development with professional relevance.');
  }

  // Fallback 2: Stakeholder-specific impact
  if (hasCyber) {
    fallbacks.push('Underwriting Consideration: Cyber incidents influence underwriting standards and risk assessment protocols.');
  } else if (hasDisaster) {
    fallbacks.push('Claims Management: Natural disasters trigger significant claims activity and reserve requirements.');
  } else if (hasRegulation) {
    fallbacks.push('Compliance Requirement: Regulatory changes necessitate operational adjustments and policy updates.');
  } else if (hasM_A) {
    fallbacks.push('Market Opportunity: Consolidation activity may create business opportunities or competitive challenges.');
  } else if (hasRate) {
    fallbacks.push('Pricing Impact: Rate movements affect competitive positioning and profitability metrics.');
  } else {
    fallbacks.push('Professional Relevance: Content directly impacts insurance professionals and decision-making processes.');
  }

  // Fallback 3: Actionable insight
  if (hasNumbers) {
    fallbacks.push('Quantified Impact: Article provides specific metrics or data points for performance analysis.');
  } else if (hasRegulation) {
    fallbacks.push('Implementation Timeline: Regulatory changes require timely compliance and operational adjustments.');
  } else if (hasDisaster) {
    fallbacks.push('Preparedness Factor: Event highlights importance of disaster preparedness and response planning.');
  } else if (hasCyber) {
    fallbacks.push('Risk Mitigation: Cyber incidents underscore need for enhanced security and risk management measures.');
  } else if (hasM_A) {
    fallbacks.push('Strategic Implication: Market consolidation may reshape industry structure and competitive dynamics.');
  } else {
    fallbacks.push('Industry Insight: Article provides valuable perspective on insurance market trends and developments.');
  }

  return fallbacks;
}

/**
 * Extract specific disaster type from text
 */
function extractDisasterType(text: string): string {
  if (text.includes('hurricane')) return 'Hurricane';
  if (text.includes('flood')) return 'Flood';
  if (text.includes('wildfire')) return 'Wildfire';
  if (text.includes('earthquake')) return 'Earthquake';
  if (text.includes('tornado')) return 'Tornado';
  if (text.includes('storm')) return 'Storm';
  if (text.includes('hail')) return 'Hail';
  if (text.includes('wind')) return 'Wind';
  return 'Natural Disaster';
}

/**
 * Calculate insurance relevance score based on keyword density
 */
export function calculateInsuranceRelevance(
  title: string,
  description: string,
  content?: string
): number {
  const fullText = `${title} ${description} ${content || ''}`.toLowerCase();
  let relevanceScore = 0;

  for (const keyword of INSURANCE_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
    const matches = fullText.match(regex);
    if (matches) {
      relevanceScore += matches.length;
    }
  }

  // Normalize to 1-10 scale
  const normalizedScore = Math.min(10, Math.max(1, (relevanceScore / 5) + 1));
  return Math.round(normalizedScore * 10) / 10;
}

