/**
 * Server Entry Point for SSR
 *
 * Handles server-side rendering with React 18 streaming.
 */

import React, { Suspense } from 'react';
import { renderToReadableStream } from 'react-dom/server';
import { App } from './App';
import { AppShellSkeleton } from './components/skeletons/PageSkeletons';

/**
 * Render app to readable stream for streaming SSR
 */
export async function render(url: string, context: { nonce?: string } = {}) {
    const { nonce } = context;

    // For React Router v7, we'll handle routing on the client side
    // Server just renders the shell with Suspense for streaming
    const stream = await renderToReadableStream(
        <Suspense fallback={<AppShellSkeleton />}>
            <App />
        </Suspense>,
        {
            bootstrapScripts: ['/src/entry-client.tsx'],
            nonce,
            onError(error: unknown) {
                console.error('SSR Error:', error);
                // You can customize error handling here
            },
        }
    );

    return stream;
}

/**
 * Render HTML shell with streaming support
 */
export async function renderToString(url: string): Promise<string> {
    const stream = await render(url);
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let html = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        html += decoder.decode(value, { stream: true });
    }

    return html;
}

/**
 * HTML template for SSR with streaming placeholders
 */
export function getHTMLTemplate(options: {
    head?: string;
    nonce?: string;
    criticalCSS?: string;
} = {}) {
    const { head = '', nonce = '', criticalCSS = '' } = options;

    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="On Tour App - Tour Management Platform" />

    <!-- DNS Prefetch & Preconnect -->
    <link rel="dns-prefetch" href="https://api.ontour.app" />
    <link rel="preconnect" href="https://api.ontour.app" crossorigin />
    <link rel="dns-prefetch" href="https://cdn.ontour.app" />
    <link rel="preconnect" href="https://cdn.ontour.app" crossorigin />

    ${criticalCSS ? `<style ${nonce ? `nonce="${nonce}"` : ''}>${criticalCSS}</style>` : ''}
    ${head}

    <title>On Tour App</title>
  </head>
  <body>
    <div id="root"><!--app-html--></div>
    <script type="module" src="/src/entry-client.tsx" ${nonce ? `nonce="${nonce}"` : ''}></script>
  </body>
</html>`;
}
