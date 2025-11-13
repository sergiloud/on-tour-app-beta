/**
 * Sentry Error Tracking Integration
 * 
 * Setup:
 * 1. Install Sentry: npm install @sentry/browser
 * 2. Add VITE_SENTRY_DSN to .env.production
 * 3. Import this file in main.tsx before React render
 * 
 * Or use CDN approach (no npm install needed):
 * Add to index.html before other scripts:
 * <script src="https://browser.sentry-cdn.com/7.x.x/bundle.min.js" crossorigin="anonymous"></script>
 */

/**
 * Initialize Sentry for production error tracking
 * Call this in main.tsx before rendering React app
 */
export function initSentry() {
  // Only initialize in production
  if (import.meta.env.PROD && typeof window !== 'undefined') {
    const Sentry = (window as any).Sentry;
    const dsn = import.meta.env.VITE_SENTRY_DSN;

    if (Sentry && dsn) {
      Sentry.init({
        dsn,
        environment: import.meta.env.MODE,
        
        // Release tracking (optional - use git commit SHA)
        // release: import.meta.env.VITE_APP_VERSION || 'unknown',
        
        // Sample rate for performance monitoring (0.0 to 1.0)
        tracesSampleRate: 0.1, // 10% of transactions
        
        // Replay sessions for debugging
        replaysSessionSampleRate: 0.1, // 10% of sessions
        replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
        
        // Ignore common errors that are not actionable
        ignoreErrors: [
          // Browser extensions
          'top.GLOBALS',
          'chrome-extension://',
          'moz-extension://',
          
          // Network errors (user's connection issues)
          'NetworkError',
          'Failed to fetch',
          'Network request failed',
          
          // Script loading failures (usually user's adblocker)
          'ChunkLoadError',
          'Loading chunk',
          
          // ResizeObserver loop errors (browser rendering issue, not our bug)
          'ResizeObserver loop limit exceeded',
          'ResizeObserver loop completed with undelivered notifications',
        ],
        
        // Filter out sensitive data
        beforeSend(event: any) {
          // Remove passwords, tokens, API keys from request data
          if (event.request?.data) {
            const data = event.request.data;
            if (typeof data === 'object') {
              delete data.password;
              delete data.token;
              delete data.apiKey;
              delete data.accessToken;
            }
          }
          
          return event;
        },
        
        // Add user context from auth state
        integrations: [
          // Session Replay for visual debugging
          Sentry.replayIntegration({
            maskAllText: false, // Set true for GDPR compliance
            blockAllMedia: false, // Set true to block images/videos
          }),
        ],
      });

      console.log('[Sentry] Initialized for production error tracking');
    } else if (!dsn) {
      console.warn('[Sentry] No DSN configured in VITE_SENTRY_DSN. Error tracking disabled.');
    }
  }
}

/**
 * Set user context for Sentry
 * Call this when user logs in
 */
export function setSentryUser(userId: string, email?: string, orgId?: string) {
  if (typeof window !== 'undefined') {
    const Sentry = (window as any).Sentry;
    if (Sentry) {
      Sentry.setUser({
        id: userId,
        email,
        orgId,
      });
    }
  }
}

/**
 * Clear user context for Sentry
 * Call this when user logs out
 */
export function clearSentryUser() {
  if (typeof window !== 'undefined') {
    const Sentry = (window as any).Sentry;
    if (Sentry) {
      Sentry.setUser(null);
    }
  }
}

/**
 * Manually capture exception in Sentry
 * Use this for critical errors that should always be tracked
 */
export function captureSentryException(error: Error, context?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    const Sentry = (window as any).Sentry;
    if (Sentry) {
      Sentry.captureException(error, {
        extra: context,
      });
    }
  }
}

/**
 * Set breadcrumb for debugging context
 */
export function addSentryBreadcrumb(message: string, category: string, data?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    const Sentry = (window as any).Sentry;
    if (Sentry) {
      Sentry.addBreadcrumb({
        message,
        category,
        data,
        level: 'info',
      });
    }
  }
}
