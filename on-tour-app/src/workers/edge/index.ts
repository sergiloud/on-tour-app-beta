/**
 * Main Cloudflare Worker
 *
 * Combines Edge SSR, API Gateway, and Static Assets handling.
 * This is the entry point for all requests.
 */

import { handleSSR } from './ssr-handler';
import apiGateway from './api-gateway';
import staticAssets from './static-assets';

export interface Env {
    // KV Namespaces
    SSR_CACHE?: KVNamespace;
    CACHE?: KVNamespace;
    RATE_LIMIT?: KVNamespace;

    // Assets
    ASSETS?: Fetcher;

    // Environment variables
    ENVIRONMENT?: string;
    API_BASE_URL?: string;
}

export default {
    async fetch(
        request: Request,
        env: Env,
        ctx: ExecutionContext
    ): Promise<Response> {
        const url = new URL(request.url);
        const pathname = url.pathname;

        try {
            // 1. API Routes - Forward to API Gateway
            if (pathname.startsWith('/api/')) {
                return apiGateway.fetch(request, env, ctx);
            }

            // 2. Static Assets - Serve from CDN with caching
            if (
                pathname.startsWith('/assets/') ||
                pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|ico)$/)
            ) {
                return staticAssets.fetch(request, env, ctx);
            }

            // 3. HTML Pages - Use SSR
            if (
                pathname === '/' ||
                pathname.startsWith('/dashboard') ||
                request.headers.get('accept')?.includes('text/html')
            ) {
                return handleSSR({ request, env, ctx });
            }

            // 4. Fallback - Forward to origin
            return env.ASSETS ? env.ASSETS.fetch(request) : fetch(request);

        } catch (error) {
            console.error('[Worker Error]', error);

            return new Response('Internal Server Error', {
                status: 500,
                headers: {
                    'Content-Type': 'text/plain',
                    'X-Worker-Error': 'true',
                },
            });
        }
    },

    /**
     * Scheduled handler for cache warming and maintenance
     */
    async scheduled(
        event: ScheduledEvent,
        env: Env,
        ctx: ExecutionContext
    ): Promise<void> {
        // console.log('[Scheduled] Running cache maintenance...');

        try {
            // Import the warm cache function
            const { warmSSRCache } = await import('./ssr-handler');

            // Warm critical routes
            const mockRequest = new Request('https://ontour.app/');
            await warmSSRCache({
                request: mockRequest,
                env,
                ctx,
            });

            // console.log('[Scheduled] Cache maintenance complete');
        } catch (error) {
            console.error('[Scheduled Error]', error);
        }
    },
};
