/**
 * Performance Monitoring Component
 * Shows load time metrics in development
 */

import React, { useEffect, useState } from 'react';

interface PerfMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  loadTime: number;
}

export const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<Partial<PerfMetrics>>({});
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show in development
    if (import.meta.env.PROD) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
          setMetrics(m => ({ ...m, fcp: entry.startTime }));
        }
        if (entry.entryType === 'largest-contentful-paint') {
          setMetrics(m => ({ ...m, lcp: entry.startTime }));
        }
        if (entry.entryType === 'first-input') {
          setMetrics(m => ({ ...m, fid: (entry as any).processingStart - entry.startTime }));
        }
        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          setMetrics(m => ({ ...m, cls: (m.cls || 0) + (entry as any).value }));
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (e) {
      // Fallback for browsers that don't support all types
      observer.observe({ entryTypes: ['paint'] });
    }

    // Get navigation timing
    window.addEventListener('load', () => {
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navTiming) {
        setMetrics(m => ({
          ...m,
          ttfb: navTiming.responseStart - navTiming.requestStart,
          loadTime: navTiming.loadEventEnd - navTiming.fetchStart
        }));
      }
    });

    return () => observer.disconnect();
  }, []);

  if (import.meta.env.PROD || !show) {
    return (
      <button
        onClick={() => setShow(!show)}
        className="fixed bottom-4 right-4 z-[9999] w-12 h-12 rounded-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-blue-300 text-xs font-mono flex items-center justify-center transition-all"
        title="Show performance metrics"
      >
        ⚡
      </button>
    );
  }

  const formatMs = (ms?: number) => ms ? `${Math.round(ms)}ms` : '-';
  const getColor = (value: number, good: number, poor: number) => {
    if (value <= good) return 'text-green-400';
    if (value <= poor) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-slate-900/95 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-xs font-mono shadow-2xl max-w-xs">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold">⚡ Performance</h3>
        <button
          onClick={() => setShow(false)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-slate-400">FCP:</span>
          <span className={getColor(metrics.fcp || 0, 1800, 3000)}>
            {formatMs(metrics.fcp)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-slate-400">LCP:</span>
          <span className={getColor(metrics.lcp || 0, 2500, 4000)}>
            {formatMs(metrics.lcp)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-slate-400">FID:</span>
          <span className={getColor(metrics.fid || 0, 100, 300)}>
            {formatMs(metrics.fid)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-slate-400">CLS:</span>
          <span className={getColor((metrics.cls || 0) * 1000, 100, 250)}>
            {metrics.cls?.toFixed(3) || '-'}
          </span>
        </div>
        
        <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
          <span className="text-slate-400">TTFB:</span>
          <span className={getColor(metrics.ttfb || 0, 800, 1800)}>
            {formatMs(metrics.ttfb)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-slate-400">Load:</span>
          <span className={getColor(metrics.loadTime || 0, 3000, 5000)}>
            {formatMs(metrics.loadTime)}
          </span>
        </div>
      </div>
      
      <div className="mt-3 pt-2 border-t border-white/10 text-[10px] text-slate-500">
        <div className="flex gap-3">
          <span className="text-green-400">● Good</span>
          <span className="text-amber-400">● Needs Improvement</span>
          <span className="text-red-400">● Poor</span>
        </div>
      </div>
    </div>
  );
};
