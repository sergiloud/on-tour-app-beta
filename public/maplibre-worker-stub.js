/**
 * MapLibre Web Worker Stub
 * Empty worker to prevent minification errors with esbuild + keepNames
 * 
 * The real MapLibre worker has minification issues in production,
 * causing "_ is not defined" errors. This stub disables worker-based
 * rendering, running everything on the main thread instead.
 */

// Empty worker - does nothing, forces main thread rendering
self.addEventListener('message', () => {
  // No-op - MapLibre will fallback to main thread
});
