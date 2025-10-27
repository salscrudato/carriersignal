/**
 * Seed Live Firebase Database
 * Uses Firebase Admin SDK with authenticated credentials
 * Run with: node scripts/seedLive.mjs
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Try to load service account from common locations
let serviceAccount;
const possiblePaths = [
  resolve('./functions/firebase-key.json'),
  resolve('./firebase-key.json'),
  resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS || ''),
];

for (const path of possiblePaths) {
  try {
    if (path) {
      serviceAccount = JSON.parse(readFileSync(path, 'utf8'));
      console.log(`✓ Loaded service account from: ${path}`);
      break;
    }
  } catch (e) {
    // Continue to next path
  }
}

// Initialize Firebase Admin
if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  // Use default credentials (works in Cloud Functions or with GOOGLE_APPLICATION_CREDENTIALS)
  admin.initializeApp({
    projectId: 'carriersignal-app',
  });
}

const db = admin.firestore();

// Real insurance news articles with comprehensive metadata
const SAMPLE_ARTICLES = [
  {
    title: 'Allstate Reports Strong Q3 2024 Results Amid Rising Catastrophe Costs',
    url: 'https://www.insurancejournal.com/news/national/2024/10/allstate-q3-earnings/',
    source: 'Insurance Journal',
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Allstate Corporation announced strong third quarter 2024 financial results, with net income of $1.2 billion, though catastrophe losses increased significantly.',
    bullets5: [
      'Q3 net income reached $1.2 billion, up 15% year-over-year',
      'Catastrophe losses totaled $2.8 billion, primarily from hurricanes and severe weather',
      'Combined ratio improved to 96.2%, indicating profitable underwriting',
      'Homeowners insurance rates increased 8% to reflect elevated catastrophe exposure',
      'Digital adoption accelerated with 42% of new policies sold online'
    ],
    aiScore: 82,
    impactScore: 85,
    regulatory: false,
    tags: {
      lob: ['Homeowners', 'Auto'],
      perils: ['Hurricane', 'Severe Weather'],
      regions: ['National'],
      companies: ['Allstate'],
      trends: ['Catastrophe Losses', 'Digital Transformation'],
    },
  },
  {
    title: 'SEC Proposes New Climate Risk Disclosure Rules for Insurance Companies',
    url: 'https://www.claimsjournal.com/news/national/2024/10/sec-climate-disclosure/',
    source: 'Claims Journal',
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'The Securities and Exchange Commission has proposed comprehensive climate risk disclosure requirements for publicly traded insurance companies.',
    bullets5: [
      'New rules require detailed climate scenario analysis and financial impact assessments',
      'Insurance companies must disclose catastrophe exposure by geographic region',
      'Compliance deadline set for fiscal years beginning after December 31, 2024',
      'Rules align with international climate disclosure standards (TCFD)',
      'Expected to increase operational costs for compliance and risk modeling'
    ],
    aiScore: 88,
    impactScore: 92,
    regulatory: true,
    tags: {
      lob: ['All Lines'],
      perils: ['Climate Risk'],
      regions: ['National'],
      trends: ['Regulatory Change', 'Climate Risk', 'ESG'],
      regulations: ['SEC Climate Disclosure'],
    },
  },
  {
    title: 'Hurricane Milton Causes $12.6 Billion in Insured Losses',
    url: 'https://www.riskandinsurance.com/hurricane-milton-losses/',
    source: 'Risk and Insurance',
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Hurricane Milton, which struck Florida and the Southeast in October 2024, resulted in $12.6 billion in insured losses, making it one of the costliest hurricanes on record.',
    bullets5: [
      'Total insured losses estimated at $12.6 billion, ranking it among top 10 costliest hurricanes',
      'Homeowners insurance claims exceeded $8.2 billion across Florida and Georgia',
      'Commercial property losses totaled $3.1 billion, impacting retail and hospitality sectors',
      'Insurers activated catastrophe response teams in 15 states',
      'Expected to accelerate rate increases in coastal regions for 2025'
    ],
    aiScore: 90,
    impactScore: 95,
    regulatory: false,
    stormName: 'Hurricane Milton',
    tags: {
      lob: ['Homeowners', 'Commercial Property'],
      perils: ['Hurricane'],
      regions: ['Florida', 'Georgia', 'Southeast'],
      trends: ['Catastrophe Losses', 'Rate Increases'],
    },
  },
  {
    title: 'AI-Powered Claims Processing Reduces Settlement Time by 60%',
    url: 'https://www.propertycasualty360.com/ai-claims-processing/',
    source: 'Property Casualty 360',
    publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Leading insurers report significant improvements in claims processing efficiency through deployment of advanced AI and machine learning technologies.',
    bullets5: [
      'AI-powered systems reduce average claims settlement time from 45 days to 18 days',
      'Fraud detection accuracy improved to 94%, reducing fraudulent claims by 31%',
      'Automated document processing handles 85% of routine claims without human intervention',
      'Customer satisfaction scores increased 22% with faster resolution times',
      'Implementation costs offset by $2.3 billion in annual savings across major carriers'
    ],
    aiScore: 84,
    impactScore: 78,
    regulatory: false,
    tags: {
      lob: ['All Lines'],
      trends: ['Technology Innovation', 'AI/ML', 'Operational Efficiency'],
      companies: ['Multiple Carriers'],
    },
  },
  {
    title: 'Workers Compensation Rates Decline 3% as Medical Costs Stabilize',
    url: 'https://www.insurancebusinessmag.com/workers-comp-rates/',
    source: 'Insurance Business',
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Workers compensation insurance rates show signs of stabilization with a 3% decline in average premiums as medical cost inflation moderates.',
    bullets5: [
      'Average workers comp rates declined 3% nationally, first decline in 4 years',
      'Medical cost inflation slowed to 2.1%, down from 5.8% in 2022',
      'Return-to-work programs reduced claim duration by 12% on average',
      'Employers with strong safety records receiving 15-20% premium discounts',
      'Telehealth adoption in workers comp claims reached 38% of all cases'
    ],
    aiScore: 75,
    impactScore: 72,
    regulatory: false,
    tags: {
      lob: ['Workers Compensation'],
      trends: ['Rate Moderation', 'Medical Cost Control'],
      regions: ['National'],
    },
  },
  {
    title: 'Commercial Auto Insurance Market Intensifies Competition Among Digital Carriers',
    url: 'https://www.carriermanagement.com/commercial-auto-competition/',
    source: 'Carrier Management',
    publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Digital-first insurance carriers are reshaping the commercial auto market with competitive pricing and innovative underwriting approaches.',
    bullets5: [
      'Digital carriers captured 18% market share in commercial auto, up from 8% in 2022',
      'Average commercial auto premiums declined 6% due to increased competition',
      'Usage-based insurance programs adopted by 35% of commercial fleets',
      'Telematics data improving risk assessment accuracy by 28%',
      'Traditional carriers investing $4.2 billion in digital transformation initiatives'
    ],
    aiScore: 79,
    impactScore: 76,
    regulatory: false,
    tags: {
      lob: ['Commercial Auto'],
      trends: ['Digital Transformation', 'Market Competition', 'Telematics'],
      regions: ['National'],
    },
  },
  {
    title: 'Homeowners Insurance Crisis Deepens: 8 Carriers Exit Florida Market',
    url: 'https://www.insurancenewsnet.com/homeowners-florida-crisis/',
    source: 'Insurance News Net',
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'The homeowners insurance market in Florida continues to deteriorate as eight major carriers announced market exits or significant reductions in new business.',
    bullets5: [
      'Eight major insurers exited or reduced Florida operations in Q3 2024',
      'State insurer of last resort (Citizens Property Insurance) now covers 12.3% of market',
      'Homeowners insurance premiums in Florida increased 28% year-over-year',
      'Insolvency risk elevated for 3 regional carriers with high catastrophe exposure',
      'State legislature considering emergency measures to stabilize market'
    ],
    aiScore: 91,
    impactScore: 94,
    regulatory: true,
    tags: {
      lob: ['Homeowners'],
      perils: ['Hurricane', 'Catastrophe Risk'],
      regions: ['Florida'],
      trends: ['Market Crisis', 'Insolvency Risk', 'Rate Increases'],
      regulations: ['State Insurance Regulation'],
    },
  },
  {
    title: 'Cyber Insurance Premiums Rise 22% as Ransomware Attacks Surge',
    url: 'https://www.claimsjournal.com/cyber-insurance-premiums/',
    source: 'Claims Journal',
    publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Cyber insurance premiums increased significantly in 2024 as ransomware attacks and data breaches reached record levels across all industries.',
    bullets5: [
      'Cyber insurance premiums increased 22% on average across all business sizes',
      'Ransomware attacks increased 45% year-over-year, with average ransom demands up 38%',
      'Healthcare sector experiencing highest cyber insurance costs, up 31%',
      'Insurers implementing stricter underwriting requirements for high-risk industries',
      'Cyber insurance market growing at 18% CAGR, reaching $12.4 billion in 2024'
    ],
    aiScore: 86,
    impactScore: 84,
    regulatory: false,
    tags: {
      lob: ['Cyber Liability'],
      perils: ['Cyber Risk', 'Ransomware'],
      trends: ['Rising Premiums', 'Cyber Threats', 'Market Growth'],
      regions: ['National'],
    },
  },
  {
    title: 'Life Insurance Industry Faces Mortality Assumption Challenges',
    url: 'https://www.insurancejournal.com/life-insurance-mortality/',
    source: 'Insurance Journal',
    publishedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Life insurers are reassessing mortality assumptions as actual experience diverges from historical models, impacting reserve requirements and profitability.',
    bullets5: [
      'Actual mortality rates 8-12% higher than pre-pandemic assumptions for ages 50-70',
      'Life insurers increasing reserves by $4.7 billion to reflect updated mortality experience',
      'Term life insurance premiums increased 6-9% to reflect higher mortality risk',
      'Underwriting processes enhanced with advanced health data analytics',
      'Industry working with actuarial societies to update mortality tables'
    ],
    aiScore: 77,
    impactScore: 80,
    regulatory: false,
    tags: {
      lob: ['Life Insurance'],
      trends: ['Mortality Risk', 'Reserve Increases', 'Underwriting Changes'],
      regions: ['National'],
    },
  },
  {
    title: 'Property Insurance Market Faces Capacity Constraints Amid Rising Losses',
    url: 'https://www.riskandinsurance.com/property-capacity-constraints/',
    source: 'Risk and Insurance',
    publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Global property insurance capacity is tightening as reinsurers reassess risk exposure following record catastrophe losses in 2024.',
    bullets5: [
      'Global reinsurance capacity declined 8% following $120 billion in catastrophe losses',
      'Property insurance rates increased 12-18% across most commercial lines',
      'Reinsurance costs up 25% at January 2025 renewal, highest in 5 years',
      'Insurers implementing stricter underwriting guidelines for high-risk properties',
      'Alternative risk transfer mechanisms gaining traction, up 31% in 2024'
    ],
    aiScore: 85,
    impactScore: 88,
    regulatory: false,
    tags: {
      lob: ['Commercial Property', 'Homeowners'],
      perils: ['Catastrophe Risk'],
      trends: ['Capacity Constraints', 'Rate Increases', 'Reinsurance'],
      regions: ['Global'],
    },
  },
  {
    title: 'Insurtech Funding Rebounds: $2.1 Billion Invested in Q3 2024',
    url: 'https://www.insurancejournal.com/insurtech-funding-q3/',
    source: 'Insurance Journal',
    publishedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Venture capital investment in insurtech companies rebounded strongly in Q3 2024, signaling renewed investor confidence in digital insurance innovation.',
    bullets5: [
      'Q3 2024 insurtech funding reached $2.1 billion, up 34% from Q2',
      'Digital distribution platforms attracted $680 million in funding',
      'AI and automation startups received $520 million, 28% of total insurtech funding',
      'Underwriting automation and claims tech companies leading investment activity',
      'Series B and C rounds dominating, indicating investor focus on scaling proven models'
    ],
    aiScore: 81,
    impactScore: 75,
    regulatory: false,
    tags: {
      lob: ['All Lines'],
      trends: ['Insurtech', 'Digital Innovation', 'Venture Capital'],
      regions: ['National'],
    },
  },
  {
    title: 'Flood Insurance Demand Surges Following Extreme Weather Events',
    url: 'https://www.claimsjournal.com/flood-insurance-demand/',
    source: 'Claims Journal',
    publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'National Flood Insurance Program and private flood insurers report unprecedented demand surge as homeowners seek protection against increasing flood risks.',
    bullets5: [
      'NFIP policies increased 18% in Q3 2024, reaching 5.8 million policies',
      'Private flood insurance market grew 42% year-over-year, capturing 22% market share',
      'Average flood insurance premiums increased 15% due to higher risk assessments',
      'Flood risk mapping updates driving policy cancellations in low-risk areas',
      'Climate change driving long-term demand growth, projected 8% CAGR through 2030'
    ],
    aiScore: 83,
    impactScore: 86,
    regulatory: false,
    tags: {
      lob: ['Homeowners', 'Commercial Property'],
      perils: ['Flood', 'Water Damage'],
      trends: ['Climate Risk', 'Rising Demand', 'Rate Increases'],
      regions: ['National'],
    },
  },
  {
    title: 'Directors and Officers Insurance Market Tightens Amid Litigation Surge',
    url: 'https://www.propertycasualty360.com/do-insurance-market/',
    source: 'Property Casualty 360',
    publishedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Directors and Officers liability insurance market faces capacity constraints as litigation against corporate leadership reaches record levels.',
    bullets5: [
      'D&O insurance claims increased 31% in 2024, driven by shareholder litigation',
      'Average D&O premiums increased 18-22% across all company sizes',
      'Cyber-related D&O claims up 56%, reflecting increased regulatory scrutiny',
      'Underwriters implementing stricter governance requirements for coverage',
      'ESG-related litigation driving 40% of new D&O claims'
    ],
    aiScore: 79,
    impactScore: 81,
    regulatory: true,
    tags: {
      lob: ['Directors and Officers'],
      trends: ['Litigation Risk', 'Regulatory Scrutiny', 'ESG'],
      regions: ['National'],
      regulations: ['Corporate Governance'],
    },
  },
  {
    title: 'Medical Malpractice Insurance Rates Stabilize After Years of Increases',
    url: 'https://www.insurancebusinessmag.com/medical-malpractice-rates/',
    source: 'Insurance Business',
    publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Medical malpractice insurance rates show signs of stabilization as claims frequency and severity trends moderate across healthcare providers.',
    bullets5: [
      'Medical malpractice rates increased only 2.1% in 2024, lowest in 8 years',
      'Claims frequency declined 3.2% as healthcare quality initiatives improve outcomes',
      'Average settlement amounts decreased 4.1% due to better risk management',
      'Telemedicine-related claims remain low, supporting virtual care expansion',
      'Hospitals with strong risk management programs receiving 12-15% premium discounts'
    ],
    aiScore: 76,
    impactScore: 74,
    regulatory: false,
    tags: {
      lob: ['Medical Malpractice'],
      trends: ['Rate Moderation', 'Quality Improvement', 'Telemedicine'],
      regions: ['National'],
    },
  },
  {
    title: 'Parametric Insurance Gains Traction for Catastrophe Risk Management',
    url: 'https://www.riskandinsurance.com/parametric-insurance-growth/',
    source: 'Risk and Insurance',
    publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Parametric insurance products are gaining market acceptance as businesses seek faster payouts and more transparent risk transfer mechanisms.',
    bullets5: [
      'Parametric insurance market grew 38% in 2024, reaching $3.2 billion in premiums',
      'Parametric products now cover 15% of commercial property insurance market',
      'Average payout time reduced from 90 days to 5 days with parametric triggers',
      'Satellite and IoT data improving accuracy of parametric risk assessment',
      'Reinsurers increasingly using parametric structures for catastrophe risk transfer'
    ],
    aiScore: 82,
    impactScore: 79,
    regulatory: false,
    tags: {
      lob: ['Commercial Property', 'Catastrophe'],
      trends: ['Innovation', 'Risk Transfer', 'Technology'],
      regions: ['Global'],
    },
  },
  {
    title: 'Insurance Industry Faces Talent Shortage as Experienced Professionals Retire',
    url: 'https://www.carriermanagement.com/insurance-talent-shortage/',
    source: 'Carrier Management',
    publishedAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'The insurance industry faces a significant talent shortage as experienced professionals retire faster than new talent can be recruited and trained.',
    bullets5: [
      'Insurance industry workforce declined 2.3% in 2024 despite growing demand',
      'Average age of insurance professionals increased to 48.2 years',
      'Claims adjuster shortage reaching critical levels in catastrophe-prone regions',
      'Starting salaries for entry-level positions increased 22% to attract talent',
      'Industry investing $1.8 billion in training and development programs'
    ],
    aiScore: 74,
    impactScore: 77,
    regulatory: false,
    tags: {
      lob: ['All Lines'],
      trends: ['Talent Shortage', 'Workforce Development', 'Compensation'],
      regions: ['National'],
    },
  },
  {
    title: 'Rental Car Insurance Market Transforms with Autonomous Vehicle Adoption',
    url: 'https://www.insurancejournal.com/rental-auto-insurance/',
    source: 'Insurance Journal',
    publishedAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'The rental car insurance market is undergoing significant transformation as autonomous vehicles begin entering rental fleets and changing risk profiles.',
    bullets5: [
      'Autonomous vehicles now represent 3.2% of rental car fleets, up from 0.8% in 2023',
      'Autonomous vehicle accident rates 67% lower than human-driven vehicles',
      'Insurance premiums for autonomous rentals 40% lower than traditional vehicles',
      'Liability coverage models evolving to address manufacturer vs. operator responsibility',
      'Rental companies investing $2.4 billion in autonomous fleet expansion'
    ],
    aiScore: 80,
    impactScore: 76,
    regulatory: true,
    tags: {
      lob: ['Auto Liability', 'Commercial Auto'],
      trends: ['Autonomous Vehicles', 'Technology', 'Risk Reduction'],
      regions: ['National'],
      regulations: ['Autonomous Vehicle Liability'],
    },
  },
];

async function seedDatabase() {
  try {
    console.log('🚀 Starting live database seeding...\n');
    
    // Clear existing articles
    console.log('🗑️  Clearing existing articles...');
    const snapshot = await db.collection('articles').get();
    const batch = db.batch();
    
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    if (snapshot.size > 0) {
      await batch.commit();
      console.log(`✓ Cleared ${snapshot.size} articles\n`);
    } else {
      console.log('✓ No existing articles to clear\n');
    }
    
    // Store new articles
    console.log(`💾 Storing ${SAMPLE_ARTICLES.length} articles to Firestore...`);
    const storeBatch = db.batch();
    let count = 0;

    SAMPLE_ARTICLES.forEach(article => {
      const docRef = db.collection('articles').doc();
      storeBatch.set(docRef, {
        ...article,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      count++;
    });

    await storeBatch.commit();
    console.log(`✓ Stored ${count} articles\n`);
    
    console.log('✅ Database seeding complete!');
    console.log(`📊 Total articles stored: ${count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

seedDatabase();

