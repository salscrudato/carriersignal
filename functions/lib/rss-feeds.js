"use strict";
/**
 * Enhanced RSS Feed Configuration for CarrierSignal
 * Comprehensive P&C insurance news sources
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RSS_FEEDS = void 0;
exports.getFeedsByCategory = getFeedsByCategory;
exports.getHighPriorityFeeds = getHighPriorityFeeds;
exports.getHourlyFeeds = getHourlyFeeds;
exports.RSS_FEEDS = [
    // Regulatory & Compliance
    {
        name: 'NAIC News',
        url: 'https://www.naic.org/news_feed.xml',
        category: 'regulatory',
        priority: 'high',
        updateFrequency: 'daily',
    },
    {
        name: 'Insurance Journal',
        url: 'https://www.insurancejournal.com/feed/',
        category: 'general',
        priority: 'high',
        updateFrequency: 'hourly',
    },
    {
        name: 'PropertyShark',
        url: 'https://www.propertyshark.com/feed/',
        category: 'market',
        priority: 'high',
        updateFrequency: 'daily',
    },
    // Market & Business
    {
        name: 'Insurance Thought Leadership',
        url: 'https://www.insurancethoughtleadership.com/feed/',
        category: 'market',
        priority: 'medium',
        updateFrequency: 'daily',
    },
    {
        name: 'Best\'s Insurance News',
        url: 'https://www.ambest.com/news/feed.xml',
        category: 'market',
        priority: 'high',
        updateFrequency: 'daily',
    },
    // Technology & Innovation
    {
        name: 'InsurTech Insights',
        url: 'https://www.insurtechinsights.com/feed/',
        category: 'technology',
        priority: 'medium',
        updateFrequency: 'daily',
    },
    {
        name: 'Insurtech Trends',
        url: 'https://www.insurtechtrends.com/feed/',
        category: 'technology',
        priority: 'medium',
        updateFrequency: 'daily',
    },
    // Claims & Operations
    {
        name: 'Claims Journal',
        url: 'https://www.claimsjournal.com/feed/',
        category: 'claims',
        priority: 'high',
        updateFrequency: 'daily',
    },
    {
        name: 'Risk & Insurance',
        url: 'https://www.riskandinsurance.com/feed/',
        category: 'general',
        priority: 'high',
        updateFrequency: 'daily',
    },
    // Underwriting & Actuarial
    {
        name: 'Actuarial News',
        url: 'https://www.actuarialnews.com/feed/',
        category: 'underwriting',
        priority: 'medium',
        updateFrequency: 'weekly',
    },
    {
        name: 'Underwriting News',
        url: 'https://www.underwritingnews.com/feed/',
        category: 'underwriting',
        priority: 'medium',
        updateFrequency: 'daily',
    },
    // Catastrophe & Risk
    {
        name: 'Catastrophe News',
        url: 'https://www.catastrophenews.com/feed/',
        category: 'market',
        priority: 'high',
        updateFrequency: 'hourly',
    },
    {
        name: 'Weather & Climate Risk',
        url: 'https://www.weatherclimatereport.com/feed/',
        category: 'market',
        priority: 'high',
        updateFrequency: 'daily',
    },
    // Cyber & Specialty
    {
        name: 'Cyber Insurance News',
        url: 'https://www.cyberinsurancenews.com/feed/',
        category: 'technology',
        priority: 'high',
        updateFrequency: 'daily',
    },
    {
        name: 'Specialty Insurance',
        url: 'https://www.specialtyinsurance.com/feed/',
        category: 'general',
        priority: 'medium',
        updateFrequency: 'daily',
    },
];
/**
 * Get feeds by category
 */
function getFeedsByCategory(category) {
    return exports.RSS_FEEDS.filter(feed => feed.category === category);
}
/**
 * Get high-priority feeds
 */
function getHighPriorityFeeds() {
    return exports.RSS_FEEDS.filter(feed => feed.priority === 'high');
}
/**
 * Get feeds that should be updated hourly
 */
function getHourlyFeeds() {
    return exports.RSS_FEEDS.filter(feed => feed.updateFrequency === 'hourly');
}
//# sourceMappingURL=rss-feeds.js.map