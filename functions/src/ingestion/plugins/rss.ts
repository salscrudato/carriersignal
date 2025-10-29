/**
 * RSS/Atom Feed Ingestion Plugin
 * Fetches and parses RSS and Atom feeds using rss-parser
 * Includes timeout, error handling, and filtering for recent articles
 */

import Parser from 'rss-parser';
import { IngestionPlugin, RawArticle, IngestionSource } from '../types';

export class RSSPlugin implements IngestionPlugin {
  name = 'RSS/Atom Feed Plugin';
  type: 'rss' | 'atom' = 'rss';
  private parser: Parser;
  private readonly FETCH_TIMEOUT_MS = 30000; // 30 second timeout
  private readonly MAX_ARTICLES_PER_FEED = 100; // Limit articles per feed
  private readonly ARTICLE_AGE_HOURS = 48; // Only fetch articles from last 48 hours

  constructor() {
    this.parser = new Parser({
      customFields: {
        item: [
          ['content:encoded', 'content'],
          ['dc:creator', 'creator'],
          ['media:content', 'mediaContent'],
          ['media:thumbnail', 'mediaThumbnail'],
        ],
      },
      timeout: this.FETCH_TIMEOUT_MS,
    });
  }

  async fetch(source: IngestionSource): Promise<RawArticle[]> {
    if (!source.url) {
      throw new Error('RSS source URL is required');
    }

    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.FETCH_TIMEOUT_MS);

      try {
        const feed = await this.parser.parseURL(source.url);
        clearTimeout(timeoutId);

        const articles: RawArticle[] = [];
        const now = Date.now();
        const maxAge = this.ARTICLE_AGE_HOURS * 60 * 60 * 1000;

        if (feed.items) {
          for (const item of feed.items) {
            // Filter articles by age
            const pubDate = item.pubDate || item.isoDate;
            if (pubDate) {
              const itemTime = new Date(pubDate).getTime();
              if (now - itemTime > maxAge) {
                continue; // Skip old articles
              }
            }

            const article = this.parseItem(item, source.name);
            if (article) {
              articles.push(article);
              if (articles.length >= this.MAX_ARTICLES_PER_FEED) {
                break; // Limit articles per feed
              }
            }
          }
        }

        return articles;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Failed to fetch RSS feed from ${source.url}: ${errorMsg}`
      );
    }
  }

  private parseItem(item: Parser.Item, source: string): RawArticle | null {
    try {
      const url = item.link || '';
      const title = item.title || '';

      if (!url || !title) {
        return null;
      }

      const itemData = item as Record<string, unknown>;

      // Extract image from various possible fields
      let mainImage = '';
      if (itemData.mediaThumbnail) {
        const thumb = itemData.mediaThumbnail as Record<string, unknown>;
        mainImage = (thumb.$ as Record<string, unknown>)?.url as string || '';
      }
      if (!mainImage && itemData.mediaContent) {
        const media = itemData.mediaContent as Record<string, unknown>;
        mainImage = (media.$ as Record<string, unknown>)?.url as string || '';
      }
      if (!mainImage && item.enclosure?.url) {
        mainImage = item.enclosure.url;
      }

      return {
        url,
        source,
        title,
        publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
        description: item.contentSnippet || (itemData.summary as string) || '',
        html: (itemData.content as string) || item.content || (itemData.description as string) || '',
        text: item.contentSnippet || (itemData.summary as string) || '',
        author: (itemData.creator as string) || (itemData.author as string) || '',
        mainImage: mainImage || undefined,
      };
    } catch (error) {
      console.warn(`Failed to parse RSS item: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  validate(article: RawArticle): boolean {
    return !!(article.url && article.title && article.source);
  }
}

export default new RSSPlugin();

