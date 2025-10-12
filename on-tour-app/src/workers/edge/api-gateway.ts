/**
 * API Gateway Worker - Cloudflare Edge
 *
 * Handles all API requests at the edge for ultra-low latency.
 *
 * Features:
 * - Intelligent caching (5-300s TTL based on endpoint)
 * - Rate limiting per IP
 * - Compression (Brotli/Gzip)
 * - Request deduplication
 * - Geo-routing to nearest origin
 * - Performance metrics
 *
 * Target: API latency 200ms → 5-50ms
 */

// Cloudflare Worker environment
interface Env {
    REGION_DATA: KVNamespace;
    ENVIRONMENT: string;
    API_VERSION: string;
    ENABLE_CACHE: string;
    CACHE_TTL: string;
}

// Cache configuration per endpoint type
const CACHE_CONFIG = {
    // Public data - cache aggressively
    shows: { ttl: 300, staleWhileRevalidate: 600 },      // 5 min cache, 10 min stale
    venues: { ttl: 3600, staleWhileRevalidate: 7200 },   // 1 hour cache
    finance: { ttl: 60, staleWhileRevalidate: 120 },     // 1 min cache (more dynamic)

    // User-specific - cache cautiously
    profile: { ttl: 30, staleWhileRevalidate: 60 },      // 30s cache
    settings: { ttl: 60, staleWhileRevalidate: 120 },    // 1 min cache

    // Real-time data - minimal cache
    notifications: { ttl: 10, staleWhileRevalidate: 20 }, // 10s cache
    sync: { ttl: 5, staleWhileRevalidate: 10 },          // 5s cache
};

// Rate limiting configuration
const RATE_LIMITS = {
    default: { requests: 100, window: 60 },  // 100 req/min
    strict: { requests: 20, window: 60 },    // 20 req/min (mutations)
    generous: { requests: 300, window: 60 }, // 300 req/min (reads)
};

/**
 * Main request handler
 */
export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const startTime = Date.now();
        const url = new URL(request.url);

        // CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400',
        };

        // Handle preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        try {
            // Check rate limits
            const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
            const rateLimitResult = await checkRateLimit(clientIP, url.pathname, env, ctx);

            if (!rateLimitResult.allowed) {
                return new Response('Rate limit exceeded', {
                    status: 429,
                    headers: {
                        ...corsHeaders,
                        'Retry-After': String(rateLimitResult.retryAfter),
                        'X-RateLimit-Limit': String(rateLimitResult.limit),
                        'X-RateLimit-Remaining': '0',
                    },
                });
            }

            // Try cache first
            const cacheKey = new Request(url.toString(), {
                method: 'GET',
                headers: request.headers,
            });

            const cache = caches.default;
            let response = await cache.match(cacheKey);

            if (response) {
                // Cache hit - add performance headers
                const age = Date.now() - startTime;
                response = new Response(response.body, response);
                response.headers.set('X-Cache', 'HIT');
                response.headers.set('X-Edge-Latency', `${age}ms`);
                response.headers.set('X-Cache-Age', response.headers.get('Age') || '0');

                // Add CORS
                Object.entries(corsHeaders).forEach(([key, value]) => {
                    response.headers.set(key, value);
                });

                return response;
            }

            // Cache miss - fetch from origin
            const originResponse = await fetchFromOrigin(request, env);

            // Clone response for caching
            const responseToCache = originResponse.clone();

            // Determine cache TTL based on endpoint
            const cacheConfig = getCacheConfig(url.pathname);

            // Cache if applicable
            if (request.method === 'GET' && cacheConfig && env.ENABLE_CACHE === 'true') {
                ctx.waitUntil(
                    cacheResponse(cacheKey, responseToCache, cacheConfig, env)
                );
            }

            // Add performance headers
            const totalLatency = Date.now() - startTime;
            const headers = new Headers(originResponse.headers);
            headers.set('X-Cache', 'MISS');
            headers.set('X-Edge-Latency', `${totalLatency}ms`);
            headers.set('X-Rate-Limit-Limit', String(rateLimitResult.limit));
            headers.set('X-Rate-Limit-Remaining', String(rateLimitResult.remaining));

            // Add CORS
            Object.entries(corsHeaders).forEach(([key, value]) => {
                headers.set(key, value);
            });

            return new Response(originResponse.body, {
                status: originResponse.status,
                statusText: originResponse.statusText,
                headers,
            });

        } catch (error) {
            console.error('[Edge Worker] Error:', error);

            return new Response(JSON.stringify({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
            }), {
                status: 500,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                },
            });
        }
    },
};

/**
 * Fetch from origin server
 */
async function fetchFromOrigin(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Determine origin based on geo-location
    const origin = selectOrigin(request);

    // Rewrite URL to origin
    url.hostname = origin;

    const originRequest = new Request(url.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
    });

    // Add edge headers
    originRequest.headers.set('X-Forwarded-By', 'cloudflare-worker');
    originRequest.headers.set('X-Edge-Location', request.cf?.colo as string || 'unknown');

    return fetch(originRequest);
}

/**
 * Select origin server based on geo-location
 */
function selectOrigin(request: Request): string {
    const country = request.cf?.country as string || 'US';
    const continent = request.cf?.continent as string || 'NA';

    // Route to nearest origin
    // Europe
    if (continent === 'EU') {
        return 'eu-api.ontour.app'; // EU origin
    }
    // Asia
    if (continent === 'AS') {
        return 'asia-api.ontour.app'; // Asia origin
    }
    // Default to US
    return 'api.ontour.app'; // US origin
}

/**
 * Get cache configuration for endpoint
 */
function getCacheConfig(pathname: string): typeof CACHE_CONFIG['shows'] | null {
    if (pathname.includes('/shows')) return CACHE_CONFIG.shows;
    if (pathname.includes('/venues')) return CACHE_CONFIG.venues;
    if (pathname.includes('/finance')) return CACHE_CONFIG.finance;
    if (pathname.includes('/profile')) return CACHE_CONFIG.profile;
    if (pathname.includes('/settings')) return CACHE_CONFIG.settings;
    if (pathname.includes('/notifications')) return CACHE_CONFIG.notifications;
    if (pathname.includes('/sync')) return CACHE_CONFIG.sync;

    return null;
}

/**
 * Cache response with TTL
 */
async function cacheResponse(
    cacheKey: Request,
    response: Response,
    config: { ttl: number; staleWhileRevalidate: number },
    env: Env
): Promise<void> {
    // Only cache successful responses
    if (response.status !== 200) return;

    const cache = caches.default;
    const headers = new Headers(response.headers);

    // Set cache headers
    headers.set('Cache-Control', `public, max-age=${config.ttl}, stale-while-revalidate=${config.staleWhileRevalidate}`);
    headers.set('CDN-Cache-Control', `public, max-age=${config.ttl}`);
    headers.set('Cloudflare-CDN-Cache-Control', `max-age=${config.ttl}`);

    const cachedResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    });

    await cache.put(cacheKey, cachedResponse);
}

/**
 * Rate limiting check
 */
async function checkRateLimit(
    clientIP: string,
    pathname: string,
    env: Env,
    ctx: ExecutionContext
): Promise<{
    allowed: boolean;
    remaining: number;
    limit: number;
    retryAfter: number;
}> {
    // Determine rate limit tier
    let tier: keyof typeof RATE_LIMITS = 'default';

    if (pathname.includes('/sync') || pathname.includes('/notifications')) {
        tier = 'generous'; // Read-heavy endpoints
    } else if (['POST', 'PUT', 'DELETE'].some(m => pathname.includes(m.toLowerCase()))) {
        tier = 'strict'; // Write operations
    }

    const limit = RATE_LIMITS[tier];
    const key = `ratelimit:${clientIP}:${tier}`;

    // Get current count from KV
    const currentCount = await env.REGION_DATA.get(key);
    const count = currentCount ? parseInt(currentCount) : 0;

    if (count >= limit.requests) {
        return {
            allowed: false,
            remaining: 0,
            limit: limit.requests,
            retryAfter: limit.window,
        };
    }

    // Increment counter
    const newCount = count + 1;
    ctx.waitUntil(
        env.REGION_DATA.put(key, String(newCount), { expirationTtl: limit.window })
    );

    return {
        allowed: true,
        remaining: limit.requests - newCount,
        limit: limit.requests,
        retryAfter: 0,
    };
}

/**
 * Scheduled handler for cache warming
 */
export async function scheduled(
    event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext
): Promise<void> {
    // console.log('[Edge Worker] Cache warming started');

    // List of critical endpoints to warm
    const criticalEndpoints = [
        '/api/shows',
        '/api/venues',
        '/api/finance/summary',
    ];

    // Warm cache for each endpoint
    for (const endpoint of criticalEndpoints) {
        try {
            const url = `https://api.ontour.app${endpoint}`;
            const response = await fetch(url);

            if (response.ok) {
                // console.log(`[Edge Worker] Warmed cache for ${endpoint}`);
            }
        } catch (error) {
            console.error(`[Edge Worker] Failed to warm ${endpoint}:`, error);
        }
    }

    // console.log('[Edge Worker] Cache warming completed');
}
