/**
 * Network Resilience Utilities
 *
 * Provides robust network request handling with:
 * - Exponential backoff retry logic
 * - Configurable retry attempts
 * - Timeout handling
 * - Custom error handling
 * - Request deduplication
 */

interface FetchWithRetryOptions extends RequestInit {
    retries?: number;
    retryDelay?: number;
    timeout?: number;
    onRetry?: (attempt: number, error: Error) => void;
    shouldRetry?: (error: Error, response?: Response) => boolean;
}

interface RetryableError extends Error {
    isRetryable: boolean;
    statusCode?: number;
    response?: Response;
}

/**
 * Delay utility with promise
 */
const delay = (ms: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay
 */
const calculateBackoff = (attempt: number, baseDelay: number): number => {
    // Exponential: 1s, 2s, 4s, 8s...
    const exponential = baseDelay * Math.pow(2, attempt);
    // Add jitter (±20%) to prevent thundering herd
    const jitter = exponential * 0.2 * (Math.random() - 0.5);
    return Math.min(exponential + jitter, 30000); // Max 30s
};

/**
 * Check if error is retryable
 */
const isRetryableError = (error: Error, response?: Response): boolean => {
    // Network errors (no response)
    if (!response) return true;

    // Server errors (5xx)
    if (response.status >= 500) return true;

    // Rate limiting (429)
    if (response.status === 429) return true;

    // Timeout (408)
    if (response.status === 408) return true;

    // Client errors (4xx) are NOT retryable
    if (response.status >= 400 && response.status < 500) return false;

    return false;
};

/**
 * Fetch with timeout
 */
const fetchWithTimeout = async (
    url: string,
    options: RequestInit,
    timeout: number
): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

/**
 * Main fetch with retry function
 */
export async function fetchWithRetry(
    url: string,
    options: FetchWithRetryOptions = {}
): Promise<Response> {
    const {
        retries = 3,
        retryDelay = 1000,
        timeout = 10000,
        onRetry,
        shouldRetry = isRetryableError,
        ...fetchOptions
    } = options;

    let lastError: Error | null = null;
    let lastResponse: Response | undefined;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            // Add retry attempt to headers for debugging
            const headers = new Headers(fetchOptions.headers);
            if (attempt > 0) {
                headers.set('X-Retry-Attempt', String(attempt));
            }

            const response = await fetchWithTimeout(url, {
                ...fetchOptions,
                headers
            }, timeout);

            // Check if response is ok
            if (!response.ok) {
                lastResponse = response;

                // Check if we should retry this error
                const error = new Error(`HTTP ${response.status}: ${response.statusText}`) as RetryableError;
                error.statusCode = response.status;
                error.response = response;
                error.isRetryable = shouldRetry(error, response);

                if (!error.isRetryable || attempt === retries) {
                    throw error;
                }

                // Retry this error
                lastError = error;
                if (onRetry) {
                    onRetry(attempt + 1, error);
                }

                const backoffDelay = calculateBackoff(attempt, retryDelay);
                await delay(backoffDelay);
                continue;
            }

            // Success!
            return response;

        } catch (error) {
            const err = error as Error;
            lastError = err;

            // Don't retry if:
            // 1. This was the last attempt
            // 2. Error is not retryable
            // 3. Request was aborted by user
            if (
                attempt === retries ||
                (err.name === 'AbortError' && !err.message.includes('timeout')) ||
                !shouldRetry(err, lastResponse)
            ) {
                throw err;
            }

            // Call retry callback
            if (onRetry) {
                onRetry(attempt + 1, err);
            }

            // Wait before retry with exponential backoff
            const backoffDelay = calculateBackoff(attempt, retryDelay);
            await delay(backoffDelay);
        }
    }

    // Should never reach here, but TypeScript needs it
    throw lastError || new Error('Unknown error during fetch with retry');
}

/**
 * Request deduplication cache
 * Prevents multiple identical requests from firing simultaneously
 */
class RequestCache {
    private cache = new Map<string, Promise<Response>>();

    private getCacheKey(url: string, options?: RequestInit): string {
        return `${options?.method || 'GET'}:${url}:${JSON.stringify(options?.body || '')}`;
    }

    async fetch(
        url: string,
        options?: FetchWithRetryOptions
    ): Promise<Response> {
        const key = this.getCacheKey(url, options);

        // Return existing promise if in flight
        if (this.cache.has(key)) {
            return this.cache.get(key)!.then(res => res.clone());
        }

        // Create new request
        const promise = fetchWithRetry(url, options);
        this.cache.set(key, promise);

        try {
            const response = await promise;
            return response.clone();
        } finally {
            // Remove from cache after completion
            setTimeout(() => this.cache.delete(key), 100);
        }
    }

    clear(): void {
        this.cache.clear();
    }
}

// Singleton instance
export const requestCache = new RequestCache();

/**
 * Convenience wrapper for JSON API calls
 */
export async function fetchJSON<T = any>(
    url: string,
    options?: FetchWithRetryOptions
): Promise<T> {
    const response = await fetchWithRetry(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Convenience wrapper for deduplicated requests
 */
export async function fetchWithDedup(
    url: string,
    options?: FetchWithRetryOptions
): Promise<Response> {
    return requestCache.fetch(url, options);
}

/**
 * Health check utility
 */
export async function checkEndpointHealth(url: string): Promise<boolean> {
    try {
        const response = await fetchWithRetry(url, {
            method: 'HEAD',
            retries: 1,
            timeout: 5000
        });
        return response.ok;
    } catch {
        return false;
    }
}
