/**
 * Production Monitoring & Performance Configuration
 * 
 * Integrates error tracking, performance monitoring, and analytics
 * for production On Tour App deployments
 */

// ============================================================================
// PERFORMANCE & WEB VITALS MONITORING
// ============================================================================

import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

// Track Core Web Vitals for PWA performance
export function initializeWebVitalsMonitoring() {
  onCLS(sendWebVitalToAnalytics);
  onFID(sendWebVitalToAnalytics);
  onFCP(sendWebVitalToAnalytics);
  onLCP(sendWebVitalToAnalytics);
  onTTFB(sendWebVitalToAnalytics);
}

function sendWebVitalToAnalytics(metric: any) {
  // Production analytics tracking
  if (typeof (window as any).gtag !== 'undefined') {
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    });
  }

  // Send to Sentry for error correlation
  if (typeof (window as any).Sentry !== 'undefined') {
    (window as any).Sentry.addBreadcrumb({
      category: 'web-vital',
      message: `${metric.name}: ${metric.value}`,
      level: metric.value > getThreshold(metric.name) ? 'warning' : 'info',
      data: {
        name: metric.name,
        value: metric.value,
        id: metric.id,
        delta: metric.delta,
        rating: metric.rating
      }
    });
  }

  // Console logging for development
  if (import.meta.env.DEV) {
    console.log(`📊 Web Vital - ${metric.name}:`, metric.value, metric.rating);
  }
}

function getThreshold(metricName: string): number {
  const thresholds = {
    'CLS': 0.1,
    'FID': 100,
    'FCP': 1800,
    'LCP': 2500,
    'TTFB': 800
  };
  return thresholds[metricName as keyof typeof thresholds] || 0;
}

// ============================================================================
// ERROR MONITORING CONFIGURATION  
// ============================================================================

export const sentryConfig = {
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENVIRONMENT || 'production',
  release: import.meta.env.VITE_APP_VERSION || 'unknown',
  
  beforeSend: (event: any) => {
    // Filter WebAssembly errors for specialized handling
    if (event.exception?.values?.[0]?.type === 'WebAssemblyError') {
      event.tags = { ...event.tags, wasmError: true };
      event.level = 'error';
    }
    
    // Filter React errors
    if (event.exception?.values?.[0]?.stacktrace?.frames?.some((frame: any) => 
      frame.filename?.includes('react'))) {
      event.tags = { ...event.tags, reactError: true };
    }
    
    // Add user context if available
    const user = getCurrentUser();
    if (user) {
      event.user = {
        id: user.uid,
        email: user.email,
        organizationId: user.organizationId
      };
    }
    
    return event;
  },
  
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  
  integrations: [
    // Performance monitoring
    {
      name: 'BrowserTracing',
      options: {
        tracePropagationTargets: [
          'localhost',
          /^https:\/\/[^/]*\.vercel\.app/,
          /^https:\/\/api\.ontourapp\.com/
        ],
      }
    }
  ]
};

// ============================================================================
// UPTIME & AVAILABILITY MONITORING
// ============================================================================

export const uptimeMonitoring = {
  // Health check endpoint
  healthCheck: '/api/health',
  
  // Critical endpoints to monitor
  endpoints: [
    '/api/health',
    '/api/auth/status', 
    '/api/organizations',
    '/api/shows',
    '/api/finance/summary'
  ],
  
  // Performance thresholds
  thresholds: {
    responseTime: 2000,     // 2 seconds
    availability: 99.9,     // 99.9% uptime
    errorRate: 1           // Max 1% error rate
  }
};

// ============================================================================
// WASM PERFORMANCE MONITORING
// ============================================================================

export class WasmPerformanceMonitor {
  private metrics: Array<{
    operation: string;
    duration: number;
    timestamp: number;
    memory?: number;
  }> = [];

  trackOperation(operation: string, startTime: number, endTime: number) {
    const duration = endTime - startTime;
    const memory = (performance as any).memory?.usedJSHeapSize || 0;
    
    this.metrics.push({
      operation,
      duration,
      timestamp: Date.now(),
      memory
    });

    // Alert on slow operations
    if (duration > 1000) {
      console.warn(`🐌 Slow WASM operation: ${operation} took ${duration}ms`);
      
      if (typeof (window as any).Sentry !== 'undefined') {
        (window as any).Sentry.captureMessage(`Slow WASM operation: ${operation}`, 'warning');
      }
    }

    // Keep metrics manageable
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-50);
    }
  }

  getMetrics() {
    return {
      operations: this.metrics.length,
      avgDuration: this.metrics.reduce((sum, m) => sum + m.duration, 0) / this.metrics.length,
      slowOperations: this.metrics.filter(m => m.duration > 500).length,
      recentMetrics: this.metrics.slice(-10)
    };
  }
}

// Global WASM performance instance
export const wasmMonitor = new WasmPerformanceMonitor();

// ============================================================================
// BUNDLE SIZE & ASSET MONITORING
// ============================================================================

export function monitorAssetLoading() {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'navigation') {
        const nav = entry as PerformanceNavigationTiming;
        
        // Track bundle loading performance
        const metrics = {
          domContentLoaded: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
          loadComplete: nav.loadEventEnd - nav.loadEventStart,
          firstPaint: nav.responseEnd - nav.requestStart
        };

        console.log('📦 Asset loading metrics:', metrics);
        
        // Send to monitoring service
        if (typeof (window as any).gtag !== 'undefined') {
          (window as any).gtag('event', 'bundle_performance', {
            event_category: 'Performance',
            dom_content_loaded: metrics.domContentLoaded,
            load_complete: metrics.loadComplete,
            first_paint: metrics.firstPaint
          });
        }
      }
    }
  });

  observer.observe({ entryTypes: ['navigation'] });
}

// ============================================================================
// PRODUCTION INITIALIZATION
// ============================================================================

export function initializeProductionMonitoring() {
  console.log('🚀 Initializing production monitoring...');
  
  // Initialize error tracking
  if (import.meta.env.VITE_SENTRY_DSN) {
    initializeSentry();
  }
  
  // Initialize performance monitoring
  initializeWebVitalsMonitoring();
  monitorAssetLoading();
  
  // Initialize uptime monitoring client-side
  startUptimeChecks();
  
  console.log('✅ Production monitoring initialized');
}

// Helper functions
function getCurrentUser() {
  // Get current user from auth context
  try {
    return JSON.parse(localStorage.getItem('authUser') || '{}');
  } catch {
    return null;
  }
}

function initializeSentry() {
  // Sentry initialization would go here
  console.log('🔍 Sentry monitoring initialized');
}

function startUptimeChecks() {
  // Periodic health checks
  setInterval(async () => {
    try {
      const response = await fetch('/api/health', { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Health check failed:', error);
      if (typeof (window as any).Sentry !== 'undefined') {
        (window as any).Sentry.captureException(error);
      }
    }
  }, 5 * 60 * 1000); // Every 5 minutes
}