/**
 * Article Sharing & Export Utilities
 * Handles sharing, exporting, and distribution of articles
 */

import type { Article } from '../types';

/**
 * Generate shareable article URL
 */
export function generateShareUrl(article: Article, baseUrl: string = 'https://carriersignal.com'): string {
  const params = new URLSearchParams({
    article: encodeURIComponent(article.url),
    source: article.source,
  });
  return `${baseUrl}/share?${params.toString()}`;
}

/**
 * Generate social media share text
 */
export function generateShareText(article: Article): {
  twitter: string;
  linkedin: string;
  email: string;
} {
  const title = article.title || 'Check out this article';
  const source = article.source || 'CarrierSignal';

  return {
    twitter: `📰 ${title}\n\nVia ${source} on CarrierSignal\n#Insurance #P&C`,
    linkedin: `I found this interesting article on CarrierSignal:\n\n${title}\n\nSource: ${source}`,
    email: `Check out this article: ${title}\n\nSource: ${source}\n\nRead more on CarrierSignal`,
  };
}

/**
 * Generate social media share URLs
 */
export function generateSocialShareUrls(article: Article, shareUrl: string): {
  twitter: string;
  linkedin: string;
  facebook: string;
} {
  const { twitter } = generateShareText(article);

  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitter)}&url=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
  };
}

/**
 * Export articles to CSV
 */
export function exportToCSV(articles: Article[]): string {
  const headers = [
    'Title',
    'Source',
    'Published Date',
    'URL',
    'Smart Score',
    'Impact Score',
    'LOB',
    'Perils',
    'Regions',
    'Sentiment',
    'Risk Pulse',
  ];

  const rows = articles.map(article => [
    `"${(article.title || '').replace(/"/g, '""')}"`,
    article.source,
    article.publishedAt || '',
    article.url,
    article.smartScore || '',
    article.impactScore || '',
    (article.tags?.lob || []).join(';'),
    (article.tags?.perils || []).join(';'),
    (article.tags?.regions || []).join(';'),
    article.sentiment || '',
    article.riskPulse || '',
  ]);

  const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  return csv;
}

/**
 * Export articles to JSON
 */
export function exportToJSON(articles: Article[]): string {
  return JSON.stringify(articles, null, 2);
}

/**
 * Export articles to PDF (requires external library)
 */
export function generatePDFContent(articles: Article[]): string {
  let content = 'CarrierSignal - Article Export\n';
  content += `Generated: ${new Date().toISOString()}\n`;
  content += `Total Articles: ${articles.length}\n\n`;

  articles.forEach((article, index) => {
    content += `${index + 1}. ${article.title}\n`;
    content += `   Source: ${article.source}\n`;
    content += `   Published: ${article.publishedAt || 'N/A'}\n`;
    content += `   Score: ${article.smartScore || 'N/A'}\n`;
    content += `   URL: ${article.url}\n`;
    if (article.description) {
      content += `   Description: ${article.description}\n`;
    }
    content += '\n';
  });

  return content;
}

/**
 * Download file helper
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export articles to CSV file
 */
export function downloadAsCSV(articles: Article[]): void {
  const csv = exportToCSV(articles);
  const filename = `carriersignal-articles-${new Date().toISOString().split('T')[0]}.csv`;
  downloadFile(csv, filename, 'text/csv');
}

/**
 * Export articles to JSON file
 */
export function downloadAsJSON(articles: Article[]): void {
  const json = exportToJSON(articles);
  const filename = `carriersignal-articles-${new Date().toISOString().split('T')[0]}.json`;
  downloadFile(json, filename, 'application/json');
}

/**
 * Copy article to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate article summary for sharing
 */
export function generateArticleSummary(article: Article): string {
  let summary = `${article.title}\n\n`;
  summary += `Source: ${article.source}\n`;
  summary += `Published: ${article.publishedAt || 'N/A'}\n\n`;

  if (article.description) {
    summary += `${article.description}\n\n`;
  }

  if (article.bullets5 && article.bullets5.length > 0) {
    summary += 'Key Points:\n';
    article.bullets5.forEach((bullet, index) => {
      summary += `${index + 1}. ${bullet}\n`;
    });
    summary += '\n';
  }

  summary += `Read more: ${article.url}`;

  return summary;
}

/**
 * Generate email body for sharing
 */
export function generateEmailBody(article: Article, recipientName?: string): string {
  let body = recipientName ? `Hi ${recipientName},\n\n` : '';
  body += `I thought you might find this article interesting:\n\n`;
  body += `${article.title}\n`;
  body += `Source: ${article.source}\n`;
  body += `Published: ${article.publishedAt || 'N/A'}\n\n`;

  if (article.description) {
    body += `${article.description}\n\n`;
  }

  if (article.bullets5 && article.bullets5.length > 0) {
    body += 'Key Points:\n';
    article.bullets5.forEach((bullet, index) => {
      body += `${index + 1}. ${bullet}\n`;
    });
    body += '\n';
  }

  body += `Read the full article: ${article.url}\n\n`;
  body += `Shared via CarrierSignal - AI-Curated Insurance News\n`;
  body += `https://carriersignal.com`;

  return body;
}

/**
 * Generate mailto link
 */
export function generateMailtoLink(article: Article, recipientEmail?: string): string {
  const subject = encodeURIComponent(`Check out: ${article.title}`);
  const body = encodeURIComponent(generateEmailBody(article));
  const to = recipientEmail ? encodeURIComponent(recipientEmail) : '';

  return `mailto:${to}?subject=${subject}&body=${body}`;
}

/**
 * Share via Web Share API (if available)
 */
export async function shareViaWebAPI(article: Article, shareUrl: string): Promise<boolean> {
  if (!navigator.share) {
    return false;
  }

  try {
    await navigator.share({
      title: article.title,
      text: article.description,
      url: shareUrl,
    });
    return true;
  } catch {
    return false;
  }
}

