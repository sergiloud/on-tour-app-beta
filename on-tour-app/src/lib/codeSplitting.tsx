/**
 * Code Splitting Configuration
 *
 * Granular lazy loading strategy to reduce initial bundle size
 * Split heavy components and routes into separate chunks
 */

import { lazy, Suspense, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

// ========================================
// Loading Components
// ========================================

export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
      <p className="text-gray-500">Loading page...</p>
    </div>
  </div>
);

export const ComponentLoader = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
  </div>
);

export const InlineLoader = () => (
  <div className="flex items-center gap-2 text-sm text-gray-500">
    <Loader2 className="h-4 w-4 animate-spin" />
    <span>Loading...</span>
  </div>
);

// ========================================
// Lazy Load Wrapper with Error Boundary
// ========================================

interface LazyOptions {
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
}

export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options?: LazyOptions
) {
  const LazyComponent = lazy(importFunc);
  const fallback = options?.fallback || <ComponentLoader />;

  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

// ========================================
// Lazy Route Components (Pages)
// ========================================

// Dashboard route
// export const LazyDashboard = lazyLoad(
//   () => import('@/pages/Dashboard'),
//   { fallback: <PageLoader /> }
// );

// Shows routes
// export const LazyShows = lazyLoad(
//   () => import('@/pages/Shows'),
//   { fallback: <PageLoader /> }
// );

// export const LazyShowEditor = lazyLoad(
//   () => import('@/features/shows/components/ShowEditor'),
//   { fallback: <ComponentLoader /> }
// );

// Finance routes
// export const LazyFinance = lazyLoad(
//   () => import('@/pages/Finance'),
//   { fallback: <PageLoader /> }
// );

// export const LazyFinanceQuicklook = lazyLoad(
//   () => import('@/features/finance/components/FinanceQuicklook'),
//   { fallback: <ComponentLoader /> }
// );

// export const LazyFinanceReports = lazyLoad(
//   () => import('@/features/finance/components/FinanceReports'),
//   { fallback: <ComponentLoader /> }
// );

// Travel routes
// export const LazyTravel = lazyLoad(
//   () => import('@/pages/Travel'),
//   { fallback: <PageLoader /> }
// );

// export const LazyTravelMap = lazyLoad(
//   () => import('@/features/travel/components/InteractiveMap'),
//   { fallback: <ComponentLoader /> }
// );

// Mission Control routes
// export const LazyMissionControl = lazyLoad(
//   () => import('@/pages/MissionControl'),
//   { fallback: <PageLoader /> }
// );

// export const LazyActionHub = lazyLoad(
//   () => import('@/features/mission/components/ActionHubPro'),
//   { fallback: <ComponentLoader /> }
// );

// Settings routes
// export const LazySettings = lazyLoad(
//   () => import('@/pages/Settings'),
//   { fallback: <PageLoader /> }
// );

// export const LazyAgenciesSettings = lazyLoad(
//   () => import('@/features/settings/components/AgenciesSettings'),
//   { fallback: <ComponentLoader /> }
// );

// ========================================
// Heavy Components (Charts, Maps, etc.)
// ========================================

// Excel Export (large library)
// export const LazyExcelExport = lazyLoad(
//   () => import('@/components/common/ExcelExport'),
//   { fallback: <InlineLoader /> }
// );

// Map Component (MapLibre)
// export const LazyMapView = lazyLoad(
//   () => import('@/components/common/MapView'),
//   { fallback: <ComponentLoader /> }
// );

// Chart Components (if using heavy chart library)
// export const LazyLineChart = lazyLoad(
//   () => import('@/components/charts/LineChart'),
//   { fallback: <ComponentLoader /> }
// );

// export const LazyBarChart = lazyLoad(
//   () => import('@/components/charts/BarChart'),
//   { fallback: <ComponentLoader /> }
// );

// Calendar Component (if heavy)
// export const LazyCalendar = lazyLoad(
//   () => import('@/components/common/Calendar'),
//   { fallback: <ComponentLoader /> }
// );

// ========================================
// Prefetch Strategy
// ========================================

/**
 * Prefetch a lazy component on hover/focus
 */
export function prefetchOnHover(importFunc: () => Promise<any>) {
  let prefetched = false;

  return {
    onMouseEnter: () => {
      if (!prefetched) {
        importFunc();
        prefetched = true;
      }
    },
    onFocus: () => {
      if (!prefetched) {
        importFunc();
        prefetched = true;
      }
    }
  };
}

/**
 * Prefetch a lazy component on idle
 */
export function prefetchOnIdle(importFunc: () => Promise<any>, delay = 2000) {
  if (typeof window === 'undefined') return;

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      setTimeout(() => importFunc(), delay);
    });
  } else {
    setTimeout(() => importFunc(), delay);
  }
}

/**
 * Prefetch all lazy components for a route
 *
 * Example implementation - customize based on your app structure:
 *
 * const routePrefetchMap: Record<string, Array<() => Promise<any>>> = {
 *   '/dashboard': [
 *     () => import('@/pages/Dashboard'),
 *     () => import('@/features/finance/components/FinanceQuicklook')
 *   ],
 *   '/shows': [
 *     () => import('@/pages/Shows'),
 *     () => import('@/features/shows/components/ShowEditor')
 *   ]
 * };
 */
export function prefetchRoute(route: string) {
  const routePrefetchMap: Record<string, Array<() => Promise<any>>> = {
    // Add your routes here
  };

  const prefetchers = routePrefetchMap[route];
  if (prefetchers) {
    prefetchers.forEach(prefetch => prefetch());
  }
}

// ========================================
// Usage Examples
// ========================================

/*
// Example 1: Lazy load page component
import { LazyDashboard } from '@/lib/codeSplitting';

<Route path="/dashboard" element={<LazyDashboard />} />

// Example 2: Lazy load heavy component inside page
import { LazyExcelExport } from '@/lib/codeSplitting';

function FinancePage() {
  const [showExport, setShowExport] = useState(false);

  return (
    <div>
      <button onClick={() => setShowExport(true)}>Export</button>
      {showExport && <LazyExcelExport data={data} />}
    </div>
  );
}

// Example 3: Prefetch on hover
import { prefetchOnHover } from '@/lib/codeSplitting';

<Link
  to="/finance"
  {...prefetchOnHover(() => import('@/pages/Finance'))}
>
  Finance
</Link>

// Example 4: Prefetch on idle
import { prefetchOnIdle } from '@/lib/codeSplitting';

useEffect(() => {
  // Prefetch finance page after 2 seconds of idle
  prefetchOnIdle(() => import('@/pages/Finance'), 2000);
}, []);

// Example 5: Prefetch entire route
import { prefetchRoute } from '@/lib/codeSplitting';

<Link
  to="/finance"
  onMouseEnter={() => prefetchRoute('/finance')}
>
  Finance
</Link>
*/

// ========================================
// Performance Monitoring
// ========================================

export class CodeSplitMonitor {
  private static chunks: Map<string, { loaded: boolean; time: number }> = new Map();

  static trackChunkLoad(chunkName: string, loadTime: number) {
    this.chunks.set(chunkName, { loaded: true, time: loadTime });

    if (import.meta.env.DEV) {
      // console.log(`[Code Split] ${chunkName} loaded in ${loadTime}ms`);
    }
  }

  static getStats() {
    const stats = Array.from(this.chunks.entries()).map(([name, info]) => ({
      name,
      ...info
    }));

    const totalTime = stats.reduce((sum, s) => sum + s.time, 0);
    const avgTime = totalTime / stats.length;

    return {
      totalChunks: stats.length,
      totalLoadTime: totalTime,
      averageLoadTime: avgTime,
      chunks: stats.sort((a, b) => b.time - a.time)
    };
  }

  static getSlowestChunks(count = 5) {
    return this.getStats().chunks.slice(0, count);
  }
}

// Track all lazy imports (development only)
// Uncomment to enable chunk load monitoring:
/*
if (import.meta.env.DEV) {
  const originalImport = (window as any).import || ((s: string) => import(s));

  (window as any).import = async (specifier: string) => {
    const start = performance.now();
    const module = await originalImport(specifier);
    const duration = performance.now() - start;

    CodeSplitMonitor.trackChunkLoad(specifier, duration);

    return module;
  };
}
*/
