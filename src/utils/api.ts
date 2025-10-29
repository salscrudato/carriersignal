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

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retries = 0
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error: ApiError = new Error(`HTTP ${response.status}`);
      error.status = response.status;
      throw error;
    }

    return await response.json();
  } catch (error) {
    if (retries < MAX_RETRIES && (error instanceof TypeError || (error as ApiError).status === 503)) {
      logger.warn('api', `Retry attempt ${retries + 1}/${MAX_RETRIES}`, { url });
      await delay(RETRY_DELAY_MS * (retries + 1));
      return fetchWithRetry<T>(url, options, retries + 1);
    }
    throw error;
  }
}

export async function askBrief(query: string): Promise<ApiResponse<any>> {
  try {
    logger.info('api', 'Calling askBrief', { query });
    
    const url = new URL(`${API_CONFIG.FUNCTIONS_URL}${API_CONFIG.ENDPOINTS.ASK_BRIEF}`);
    url.searchParams.append('query', query);

    const data = await fetchWithRetry<any>(url.toString(), {
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

export async function getQuickRead(url: string): Promise<ApiResponse<any>> {
  try {
    logger.info('api', 'Calling getQuickRead', { url });

    const apiUrl = new URL(`${API_CONFIG.FUNCTIONS_URL}/getQuickRead`);
    apiUrl.searchParams.append('url', url);

    const data = await fetchWithRetry<any>(apiUrl.toString(), {
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

