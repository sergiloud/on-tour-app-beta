/**
 * Safe API utilities with error handling and retry logic
 * Provides robust wrappers for fetch calls with automatic retries and timeouts
 */

import { logger } from './logger';

export interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  status: number;
}

/**
 * Safe fetch with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { timeout = 10000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Safe fetch with automatic retries and exponential backoff
 */
export async function safeFetch<T>(
  url: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const {
    timeout = 10000,
    retries = 3,
    retryDelay = 1000,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, {
        ...fetchOptions,
        timeout,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        data: data as T,
        error: null,
        status: response.status,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on certain errors
      if (
        lastError.message.includes('404') ||
        lastError.message.includes('401') ||
        lastError.message.includes('403')
      ) {
        break;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < retries - 1) {
        await new Promise(resolve =>
          setTimeout(resolve, retryDelay * Math.pow(2, attempt))
        );
      }
    }
  }

  return {
    data: null,
    error: lastError,
    status: 0,
  };
}

/**
 * Safe localStorage operations with error handling
 */
export const safeStorage = {
  get<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return fallback;
      return JSON.parse(item) as T;
    } catch (error) {
      logger.error(`Error reading key "${key}"`, error instanceof Error ? error : new Error(String(error)), {
        component: 'safeStorage',
        action: 'get',
        key
      });
      return fallback;
    }
  },

  set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error(`Error writing key "${key}"`, error instanceof Error ? error : new Error(String(error)), {
        component: 'safeStorage',
        action: 'set',
        key
      });
      return false;
    }
  },

  remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      logger.error(`Error removing key "${key}"`, error instanceof Error ? error : new Error(String(error)), {
        component: 'safeStorage',
        action: 'remove',
        key
      });
      return false;
    }
  },

  clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      logger.error('Error clearing storage', error instanceof Error ? error : new Error(String(error)), {
        component: 'safeStorage',
        action: 'clear'
      });
      return false;
    }
  },
};

/**
 * Debounced async function with error handling
 */
export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: NodeJS.Timeout | null = null;
  let pendingPromise: Promise<ReturnType<T>> | null = null;

  return function (...args: Parameters<T>): Promise<ReturnType<T>> {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (pendingPromise) {
      return pendingPromise;
    }

    pendingPromise = new Promise<ReturnType<T>>((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          const result = await fn(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          pendingPromise = null;
          timeoutId = null;
        }
      }, delay);
    });

    return pendingPromise;
  };
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    delay?: number;
    maxDelay?: number;
    shouldRetry?: (error: Error) => boolean;
  } = {}
): Promise<T> {
  const {
    retries = 3,
    delay = 1000,
    maxDelay = 10000,
    shouldRetry = () => true,
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (!shouldRetry(lastError) || attempt === retries - 1) {
        throw lastError;
      }

      const backoffDelay = Math.min(delay * Math.pow(2, attempt), maxDelay);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }

  throw lastError!;
}

/**
 * Timeout wrapper for promises
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutError = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutError)), timeoutMs)
    ),
  ]);
}

/**
 * Safe promise.all that doesn't fail on individual promise rejections
 */
export async function safePromiseAll<T>(
  promises: Promise<T>[]
): Promise<Array<T | null>> {
  const results = await Promise.allSettled(promises);

  return results.map(result => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      logger.error('Promise rejected', result.reason instanceof Error ? result.reason : new Error(String(result.reason)), {
        component: 'safePromiseAll'
      });
      return null;
    }
  });
}
