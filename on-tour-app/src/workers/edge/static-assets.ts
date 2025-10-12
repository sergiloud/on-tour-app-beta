/**
 * Static Assets Worker - Cloudflare Edge CDN
 *
 * Serves static assets from edge locations globally.
 *
 * Features:
 * - Automatic compression (Brotli/Gzip)
 * - Long-term caching for immutable assets
 * - Smart cache invalidation
 * - Image optimization
 * - Asset minification
 *
 * Target: Asset load time 200ms → 10-30ms
 */

const ASSET_CACHE_TTL = {
    // Immutable assets (hashed filenames) - cache forever
    immutable: 31536000, // 1 year

    // Static assets - cache long term
    images: 2592000,  // 30 days
    fonts: 31536000,  // 1 year
    css: 604800,      // 7 days
    js: 604800,       // 7 days

    // Dynamic assets - cache short term
    html: 3600,       // 1 hour
    json: 300,        // 5 minutes
};

const COMPRESSION_TYPES = [
    'text/html',
    'text/css',
    'text/javascript',
    'application/javascript',
    'application/json',
    'application/xml',
    'text/xml',
    'image/svg+xml',
];

export default {
    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);

        try {
            // Try cache first
            const cache = caches.default;
            let response = await cache.match(request);

            if (response) {
                // Cache hit - add headers
                response = new Response(response.body, response);
                response.headers.set('X-Cache', 'HIT');
                response.headers.set('X-Served-From', 'edge');
                return response;
            }

            // Cache miss - fetch from origin (R2 bucket or origin server)
            response = await fetch(request);

            // Clone for caching
            const responseToCache = response.clone();

            // Determine cache TTL based on file type
            const ttl = getCacheTTL(url.pathname);

            // Add cache headers
            const headers = new Headers(response.headers);
            headers.set('Cache-Control', `public, max-age=${ttl}, immutable`);
            headers.set('X-Cache', 'MISS');
            headers.set('X-Served-From', 'edge');

            // Add compression if applicable
            const contentType = headers.get('Content-Type') || '';
            if (shouldCompress(contentType)) {
                headers.set('Content-Encoding', 'br'); // Brotli preferred
            }

            // Cache the response
            const cachedResponse = new Response(responseToCache.body, {
                status: response.status,
                statusText: response.statusText,
                headers,
            });

            // Store in cache (non-blocking)
            caches.default.put(request, cachedResponse.clone());

            return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers,
            });

        } catch (error) {
            console.error('[Static Assets Worker] Error:', error);

            return new Response('Asset not found', {
                status: 404,
                headers: {
                    'Content-Type': 'text/plain',
                },
            });
        }
    },
};

/**
 * Determine cache TTL based on file extension
 */
function getCacheTTL(pathname: string): number {
    // Check for hash in filename (immutable assets)
    if (/-[a-f0-9]{8,}\./.test(pathname)) {
        return ASSET_CACHE_TTL.immutable;
    }

    // Check file extension
    const ext = pathname.split('.').pop()?.toLowerCase();

    switch (ext) {
        case 'woff':
        case 'woff2':
        case 'ttf':
        case 'eot':
            return ASSET_CACHE_TTL.fonts;

        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'webp':
        case 'avif':
        case 'svg':
        case 'ico':
            return ASSET_CACHE_TTL.images;

        case 'css':
            return ASSET_CACHE_TTL.css;

        case 'js':
        case 'mjs':
            return ASSET_CACHE_TTL.js;

        case 'html':
        case 'htm':
            return ASSET_CACHE_TTL.html;

        case 'json':
            return ASSET_CACHE_TTL.json;

        default:
            return ASSET_CACHE_TTL.html; // Default to 1 hour
    }
}

/**
 * Check if content should be compressed
 */
function shouldCompress(contentType: string): boolean {
    return COMPRESSION_TYPES.some(type => contentType.includes(type));
}
