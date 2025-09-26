// Lightweight route prefetch helpers to warm lazy-loaded chunks on intent
// Safe to call in event handlers (hover/focus/visible). Failures are ignored.

type Loader = () => Promise<unknown>;

const loaders: Record<string, Loader> = {
  '/dashboard': () => import('../pages/Dashboard'),
  '/dashboard/finance': () => import('../pages/dashboard/Finance'),
  '/dashboard/shows': () => import('../pages/dashboard/Shows'),
  '/dashboard/show': () => import('../pages/dashboard/ShowDetails'), // prefix match for details
  '/dashboard/travel': () => import('../pages/dashboard/Travel'),
  '/dashboard/travel/workspace': () => import('../pages/dashboard/TravelWorkspacePage'),
  '/dashboard/mission/lab': () => import('../pages/dashboard/MissionControlLab'),
  '/dashboard/calendar': () => import('../pages/dashboard/Calendar'),
  '/dashboard/settings': () => import('../pages/dashboard/Settings'),
};

export function prefetchByPath(path: string) {
  try {
    if (!path) return;
    // Normalize to handle dynamic segments (e.g., /dashboard/shows/:id)
    const key = path.startsWith('/dashboard/shows/') ? '/dashboard/show' : path;
    const load = loaders[key];
    if (load) {
      void load(); // fire-and-forget
    }
  } catch {
    // ignore
  }
}

export const prefetch = {
  dashboard: () => prefetchByPath('/dashboard'),
  finance: () => prefetchByPath('/dashboard/finance'),
  shows: () => prefetchByPath('/dashboard/shows'),
  showDetails: () => prefetchByPath('/dashboard/show'),
  travel: () => prefetchByPath('/dashboard/travel'),
  travelWorkspace: () => prefetchByPath('/dashboard/travel/workspace'),
  calendar: () => prefetchByPath('/dashboard/calendar'),
  settings: () => prefetchByPath('/dashboard/settings'),
};
