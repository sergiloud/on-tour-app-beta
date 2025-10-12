/**
 * Edge SSR Handler for Cloudflare Workers
 *
 * Handles server-side rendering at the edge with streaming HTML delivery.
 * Integrates with the SSR infrastructure from entry-server.tsx.
 */

import { renderToString, getHTMLTemplate } from '../../entry-server';

// Cloudflare Workers types
declare global {
    interface KVNamespace {
        get(key: string, type?: 'text'): Promise<string | null>;
        put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
        delete(key: string): Promise<void>;
        list(options?: { prefix?: string }): Promise<{ keys: Array<{ name: string }> }>;
    }

    interface Fetcher {
        fetch(request: Request): Promise<Response>;
    }

    interface ExecutionContext {
        waitUntil(promise: Promise<unknown>): void;
        passThroughOnException(): void;
    }
}

// Cache configuration
const SSR_CACHE_TTL = 300; // 5 minutes
const SSR_CACHE_PREFIX = 'ssr:v1:';

// Routes that should be SSR'd
const SSR_ROUTES = [
    '/',
    '/dashboard',
    '/dashboard/finance',
    '/dashboard/shows',
    '/dashboard/travel',
    '/dashboard/mission/lab',
    '/dashboard/org',
];

// Routes that should skip SSR (auth, API, etc.)
const SKIP_SSR_ROUTES = [
    '/login',
    '/register',
    '/api/',
    '/_worker/',
];

interface SSRContext {
    request: Request;
    env: {
        SSR_CACHE?: KVNamespace;
        ASSETS?: Fetcher;
    };
    ctx: ExecutionContext;
}

/**
 * Check if route should use SSR
 */
function shouldSSR(url: URL): boolean {
    const pathname = url.pathname;

    // Skip certain routes
    if (SKIP_SSR_ROUTES.some(route => pathname.startsWith(route))) {
        return false;
    }

    // SSR specific routes
    if (SSR_ROUTES.some(route => pathname === route || pathname.startsWith(route))) {
        return true;
    }

    return false;
}

/**
 * Generate cache key for SSR'd pages
 */
function getCacheKey(url: URL): string {
    const pathname = url.pathname;
    const search = url.search;
    return `${SSR_CACHE_PREFIX}${pathname}${search}`;
}

/**
 * Handle SSR request at the edge
 */
export async function handleSSR(context: SSRContext): Promise<Response> {
    const { request, env, ctx } = context;
    const url = new URL(request.url);

    // Check if this route should use SSR
    if (!shouldSSR(url)) {
        // Forward to static assets or SPA fallback
        return fetch(request);
    }

    try {
        const cacheKey = getCacheKey(url);
        const cache = env.SSR_CACHE;

        // Check cache first (if KV is available)
        if (cache) {
            const cached = await cache.get(cacheKey, 'text');
            if (cached) {
                // console.log(`[SSR Cache HIT] ${url.pathname}`);
                return new Response(cached, {
                    headers: {
                        'Content-Type': 'text/html; charset=utf-8',
                        'Cache-Control': 'public, max-age=300, s-maxage=300',
                        'X-SSR-Cache': 'hit',
                        'X-SSR-Generated': new Date().toISOString(),
                    },
                });
            }
        }

        // console.log(`[SSR Cache MISS] ${url.pathname}`);

        // Render at the edge (CSP nonce handling is done in render function)
        const html = await renderToString(url.pathname);

        // Cache the rendered HTML (if KV is available)
        if (cache) {
            ctx.waitUntil(
                cache.put(cacheKey, html, {
                    expirationTtl: SSR_CACHE_TTL,
                })
            );
        }

        return new Response(html, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'public, max-age=300, s-maxage=300',
                'X-SSR-Cache': 'miss',
                'X-SSR-Generated': new Date().toISOString(),
            },
        });

    } catch (error) {
        console.error('[SSR Error]', error);

        // Fallback to SPA mode on error
        return new Response(
            getHTMLTemplate({}),
            {
                status: 500,
                headers: {
                    'Content-Type': 'text/html; charset=utf-8',
                    'Cache-Control': 'no-cache',
                    'X-SSR-Error': 'true',
                },
            }
        );
    }
}

/**
 * Invalidate SSR cache for a specific route or pattern
 */
export async function invalidateSSRCache(
    cache: KVNamespace,
    pattern: string
): Promise<number> {
    // List all keys matching the pattern
    const list = await cache.list({ prefix: `${SSR_CACHE_PREFIX}${pattern}` });

    // Delete all matching keys
    const deletePromises = list.keys.map(key => cache.delete(key.name));
    await Promise.all(deletePromises);

    // console.log(`[SSR Cache] Invalidated ${deletePromises.length} entries for pattern: ${pattern}`);
    return deletePromises.length;
}

/**
 * Prefetch and warm cache for critical routes
 */
export async function warmSSRCache(
    context: SSRContext,
    routes: string[] = SSR_ROUTES
): Promise<void> {
    const { env } = context;
    const cache = env.SSR_CACHE;

    if (!cache) {
        // console.log('[SSR Cache] KV not available, skipping warm-up');
        return;
    }

    // console.log(`[SSR Cache] Warming up ${routes.length} routes...`);

    // Render and cache each route
    const warmPromises = routes.map(async (route) => {
        try {
            const html = await renderToString(route);
            const cacheKey = getCacheKey(new URL(route, 'https://example.com'));
            await cache.put(cacheKey, html, {
                expirationTtl: SSR_CACHE_TTL,
            });
            // console.log(`[SSR Cache] Warmed: ${route}`);
        } catch (error) {
            console.error(`[SSR Cache] Failed to warm ${route}:`, error);
        }
    });

    await Promise.all(warmPromises);
    // console.log('[SSR Cache] Warm-up complete');
}

/**
 * Get SSR cache statistics
 */
export async function getSSRCacheStats(cache: KVNamespace): Promise<{
    totalKeys: number;
    ssrKeys: number;
    oldestEntry?: string;
    newestEntry?: string;
}> {
    const list = await cache.list({ prefix: SSR_CACHE_PREFIX });

    return {
        totalKeys: list.keys.length,
        ssrKeys: list.keys.length,
        oldestEntry: list.keys[0]?.name,
        newestEntry: list.keys[list.keys.length - 1]?.name,
    };
}
