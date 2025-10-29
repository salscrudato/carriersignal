/**
 * API Utility Functions
 * Centralized API calls with error handling and retry logic
 */

import { logger } from './logger';
import { API_CONFIG } from '../config';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const REQUEST_TIMEOUT_MS = 30000;

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retries = 0
): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error: ApiError = new Error(`HTTP ${response.status}`);
        error.status = response.status;
        throw error;
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    const isRetryable =
      error instanceof TypeError ||
      (error as ApiError).status === 503 ||
      (error instanceof Error && error.name === 'AbortError');

    if (retries < MAX_RETRIES && isRetryable) {
      logger.warn('api', `Retry attempt ${retries + 1}/${MAX_RETRIES}`, { url });
      await delay(RETRY_DELAY_MS * (retries + 1));
      return fetchWithRetry<T>(url, options, retries + 1);
    }
    throw error;
  }
}

export async function askBrief(query: string): Promise<ApiResponse<unknown>> {
  try {
    if (!query || query.trim().length === 0) {
      throw new Error('Query cannot be empty');
    }

    logger.info('api', 'Calling askBrief', { query });

    const url = new URL(`${API_CONFIG.FUNCTIONS_URL}${API_CONFIG.ENDPOINTS.ASK_BRIEF}`);
    url.searchParams.append('query', query);

    const data = await fetchWithRetry<unknown>(url.toString(), {
      method: 'GET',
    });

    logger.info('api', 'askBrief success');
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('api', 'askBrief failed', { error: message });
    return { success: false, error: message };
  }
}

export async function getQuickRead(url: string): Promise<ApiResponse<unknown>> {
  try {
    if (!url || url.trim().length === 0) {
      throw new Error('URL cannot be empty');
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      throw new Error('Invalid URL format');
    }

    logger.info('api', 'Calling getQuickRead', { url });

    const apiUrl = new URL(`${API_CONFIG.FUNCTIONS_URL}/getQuickRead`);
    apiUrl.searchParams.append('url', url);

    const data = await fetchWithRetry<unknown>(apiUrl.toString(), {
      method: 'GET',
    });

    logger.info('api', 'getQuickRead success');
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('api', 'getQuickRead failed', { error: message });
    return { success: false, error: message };
  }
}

