/**
 * Centralized API Client
 *
 * Provides a unified interface for all API requests with built-in resilience:
 * - Exponential backoff retry logic
 * - Automatic timeout handling
 * - Jitter to prevent thundering herd
 * - Consistent error handling
 *
 * Usage:
 * ```tsx
 * // Simple GET
 * const shows = await api.get('/api/shows');
 *
 * // POST with body
 * const newShow = await api.post('/api/shows', { title: 'New Show' });
 *
 * // PATCH with custom retry config
 * await api.patch('/api/shows/123', { status: 'confirmed' }, { retries: 5 });
 *
 * // DELETE
 * await api.delete('/api/shows/123');
 * ```
 */

import { fetchWithRetry } from './fetchWithRetry';

export interface ApiRequestOptions extends RequestInit {
  /**
   * Number of retry attempts for transient errors (3xx, 5xx, 408, 429)
   * @default 3
   */
  retries?: number;

  /**
   * Request timeout in milliseconds
   * @default 10000 (10 seconds)
   */
  timeout?: number;

  /**
   * Callback when a retry occurs
   */
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Generic API request with resilience
 *
 * Handles:
 * - Automatic retries for transient errors
 * - Exponential backoff with jitter
 * - Request timeout protection
 * - JSON parsing
 * - Error normalization
 *
 * @throws Error if request fails after all retries
 */
async function apiRequest<T = any>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const {
    retries = 3,
    timeout = 10000,
    onRetry,
    ...fetchOptions
  } = options;

  try {
    const response = await fetchWithRetry(url, {
      ...fetchOptions,
      retries,
      timeout,
      onRetry,
    });

    if (!response.ok) {
      let errorBody = '';
      try {
        errorBody = await response.text();
      } catch {
        errorBody = 'Unable to parse error response';
      }

      const error = new Error(
        `API Error (${response.status}): ${errorBody || response.statusText}`
      );
      (error as any).status = response.status;
      (error as any).response = response;
      throw error;
    }

    // Handle empty responses (204 No Content)
    const contentType = response.headers.get('content-type');
    if (!contentType || response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  } catch (error) {
    // Re-throw with consistent format
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`API request failed: ${String(error)}`);
  }
}

/**
 * Centralized API client
 * Use these methods for all API communication
 */
export const api = {
  /**
   * GET request
   */
  get: <T = any>(url: string, options?: ApiRequestOptions): Promise<T> =>
    apiRequest<T>(url, {
      ...options,
      method: 'GET',
    }),

  /**
   * POST request with JSON body
   */
  post: <T = any>(
    url: string,
    body?: any,
    options?: ApiRequestOptions
  ): Promise<T> =>
    apiRequest<T>(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    }),

  /**
   * PATCH request with JSON body
   */
  patch: <T = any>(
    url: string,
    body?: any,
    options?: ApiRequestOptions
  ): Promise<T> =>
    apiRequest<T>(url, {
      ...options,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    }),

  /**
   * PUT request with JSON body
   */
  put: <T = any>(
    url: string,
    body?: any,
    options?: ApiRequestOptions
  ): Promise<T> =>
    apiRequest<T>(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    }),

  /**
   * DELETE request
   */
  delete: <T = any>(url: string, options?: ApiRequestOptions): Promise<T> =>
    apiRequest<T>(url, {
      ...options,
      method: 'DELETE',
    }),

  /**
   * HEAD request
   */
  head: (url: string, options?: ApiRequestOptions): Promise<Response> =>
    fetch(url, {
      ...options,
      method: 'HEAD',
    }).then(r => {
      if (!r.ok) throw new Error(`HEAD request failed: ${r.statusText}`);
      return r;
    }),

  /**
   * Raw request with custom options
   * Use this for special cases not covered by above methods
   */
  request: <T = any>(
    url: string,
    options?: ApiRequestOptions
  ): Promise<T> => apiRequest<T>(url, options),
};

export default api;
