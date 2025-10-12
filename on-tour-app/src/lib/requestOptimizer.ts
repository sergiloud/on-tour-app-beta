/**
 * Request Batching and Deduplication
 *
 * Optimizes API calls by:
 * - Batching multiple requests into one
 * - Deduplicating identical requests
 * - Debouncing rapid requests
 * - Intelligent request queuing
 */

interface BatchRequest {
    id: string;
    endpoint: string;
    params: any;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    timestamp: number;
}

interface BatchConfig {
    maxBatchSize?: number;
    maxWaitTime?: number;
    batchEndpoint?: string;
}

/**
 * Request Batcher
 * Collects multiple requests and sends them as a single batch
 */
class RequestBatcher {
    private queue: BatchRequest[] = [];
    private timer: ReturnType<typeof setTimeout> | null = null;
    private processing = false;

    constructor(
        private config: BatchConfig = {}
    ) {
        this.config = {
            maxBatchSize: 10,
            maxWaitTime: 50, // 50ms
            ...config
        };
    }

    /**
     * Add request to batch queue
     */
    add(endpoint: string, params: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const request: BatchRequest = {
                id: `${endpoint}-${JSON.stringify(params)}-${Date.now()}`,
                endpoint,
                params,
                resolve,
                reject,
                timestamp: Date.now()
            };

            this.queue.push(request);

            // Flush if batch is full
            if (this.queue.length >= (this.config.maxBatchSize || 10)) {
                this.flush();
            } else {
                // Schedule flush
                this.scheduleFlush();
            }
        });
    }

    /**
     * Schedule batch flush
     */
    private scheduleFlush() {
        if (this.timer) return;

        this.timer = setTimeout(() => {
            this.flush();
        }, this.config.maxWaitTime);
    }

    /**
     * Flush batch queue
     */
    private async flush() {
        if (this.processing || this.queue.length === 0) return;

        // Clear timer
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }

        this.processing = true;
        const batch = [...this.queue];
        this.queue = [];

        try {
            // Group by endpoint
            const grouped = batch.reduce((acc, req) => {
                if (!acc[req.endpoint]) acc[req.endpoint] = [];
                const group = acc[req.endpoint];
                if (group) group.push(req);
                return acc;
            }, {} as Record<string, BatchRequest[]>);

            // Process each endpoint group
            await Promise.all(
                Object.entries(grouped).map(([endpoint, requests]) =>
                    this.processBatch(endpoint, requests)
                )
            );
        } catch (error) {
            console.error('[Batcher] Flush failed:', error);
        } finally {
            this.processing = false;

            // Re-schedule if queue has new items
            if (this.queue.length > 0) {
                this.scheduleFlush();
            }
        }
    }

    /**
     * Process a batch of requests
     */
    private async processBatch(endpoint: string, requests: BatchRequest[]) {
        try {
            // If only one request, send it directly
            if (requests.length === 1) {
                const req = requests[0];
                if (req) {
                    const response = await fetch(`${endpoint}?${new URLSearchParams(req.params)}`);
                    const data = await response.json();
                    req.resolve(data);
                }
                return;
            }

            // Send batch request
            const batchEndpoint = this.config.batchEndpoint || `${endpoint}/batch`;
            const response = await fetch(batchEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requests: requests.map(r => ({ id: r.id, params: r.params }))
                })
            });

            const results = await response.json();

            // Resolve individual requests
            requests.forEach(req => {
                const result = results.find((r: any) => r.id === req.id);
                if (result) {
                    req.resolve(result.data);
                } else {
                    req.reject(new Error('Request not found in batch response'));
                }
            });
        } catch (error) {
            // Reject all requests in batch
            requests.forEach(req => req.reject(error));
        }
    }

    /**
     * Clear queue
     */
    clear() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        this.queue = [];
    }
}

/**
 * Request Deduplicator
 * Prevents duplicate identical requests from being sent
 */
class RequestDeduplicator {
    private inFlight = new Map<string, Promise<any>>();
    private cache = new Map<string, { data: any; timestamp: number }>();

    constructor(
        private cacheDuration: number = 5000 // 5 seconds
    ) { }

    /**
     * Get cache key for request
     */
    private getCacheKey(url: string, options?: RequestInit): string {
        const method = options?.method || 'GET';
        const body = options?.body ? JSON.stringify(options.body) : '';
        return `${method}:${url}:${body}`;
    }

    /**
     * Deduplicate request
     */
    async fetch(url: string, options?: RequestInit): Promise<any> {
        const key = this.getCacheKey(url, options);

        // Check cache
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
            return cached.data;
        }

        // Check in-flight requests
        const inFlight = this.inFlight.get(key);
        if (inFlight) {
            return inFlight;
        }

        // Make new request
        const promise = fetch(url, options)
            .then(async (response) => {
                const data = await response.json();

                // Cache result
                this.cache.set(key, { data, timestamp: Date.now() });

                // Remove from in-flight
                this.inFlight.delete(key);

                return data;
            })
            .catch((error) => {
                // Remove from in-flight
                this.inFlight.delete(key);
                throw error;
            });

        this.inFlight.set(key, promise);
        return promise;
    }

    /**
     * Clear cache
     */
    clear() {
        this.cache.clear();
        this.inFlight.clear();
    }

    /**
     * Clear expired cache entries
     */
    clearExpired() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp >= this.cacheDuration) {
                this.cache.delete(key);
            }
        }
    }
}

/**
 * Debounced Request Manager
 * Debounces rapid requests (e.g., search-as-you-type)
 */
class DebouncedRequestManager {
    private timers = new Map<string, ReturnType<typeof setTimeout>>();
    private latestPromises = new Map<string, { resolve: (value: any) => void; reject: (reason: any) => void }>();

    /**
     * Make debounced request
     */
    fetch(key: string, url: string, options?: RequestInit, delay: number = 300): Promise<any> {
        // Clear existing timer
        const existingTimer = this.timers.get(key);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }

        // Reject previous promise (if any)
        const previousPromise = this.latestPromises.get(key);
        if (previousPromise) {
            previousPromise.reject(new Error('Superseded by newer request'));
        }

        return new Promise((resolve, reject) => {
            // Store promise handlers
            this.latestPromises.set(key, { resolve, reject });

            // Schedule request
            const timer = setTimeout(async () => {
                try {
                    const response = await fetch(url, options);
                    const data = await response.json();
                    resolve(data);
                    this.latestPromises.delete(key);
                    this.timers.delete(key);
                } catch (error) {
                    reject(error);
                    this.latestPromises.delete(key);
                    this.timers.delete(key);
                }
            }, delay);

            this.timers.set(key, timer);
        });
    }

    /**
     * Cancel pending request
     */
    cancel(key: string) {
        const timer = this.timers.get(key);
        if (timer) {
            clearTimeout(timer);
            this.timers.delete(key);
        }

        const promise = this.latestPromises.get(key);
        if (promise) {
            promise.reject(new Error('Cancelled'));
            this.latestPromises.delete(key);
        }
    }

    /**
     * Clear all pending requests
     */
    clear() {
        this.timers.forEach(timer => clearTimeout(timer));
        this.timers.clear();
        this.latestPromises.clear();
    }
}

// Singleton instances
export const requestBatcher = new RequestBatcher();
export const requestDeduplicator = new RequestDeduplicator();
export const debouncedRequests = new DebouncedRequestManager();

/**
 * Convenience wrapper for batched requests
 */
export function batchFetch(endpoint: string, params: any = {}): Promise<any> {
    return requestBatcher.add(endpoint, params);
}

/**
 * Convenience wrapper for deduplicated requests
 */
export function dedupFetch(url: string, options?: RequestInit): Promise<any> {
    return requestDeduplicator.fetch(url, options);
}

/**
 * Convenience wrapper for debounced requests
 */
export function debouncedFetch(
    key: string,
    url: string,
    options?: RequestInit,
    delay?: number
): Promise<any> {
    return debouncedRequests.fetch(key, url, options, delay);
}

/**
 * Clear all caches and pending requests
 */
export function clearRequestCache() {
    requestBatcher.clear();
    requestDeduplicator.clear();
    debouncedRequests.clear();
}

/**
 * Periodic cleanup of expired cache entries
 */
if (typeof window !== 'undefined') {
    setInterval(() => {
        requestDeduplicator.clearExpired();
    }, 60000); // Every minute
}
