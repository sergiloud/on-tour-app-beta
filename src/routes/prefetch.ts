// Lightweight route prefetch helpers to warm lazy-loaded chunks on intent
// Safe to call in event handlers (hover/focus/visible). Failures are ignored.

type Loader = () => Promise<unknown>;

const loaders: Record<string, Loader> = {
  '/dashboard': () => import('../pages/Dashboard'),
  '/dashboard/finance': () => import('../pages/dashboard/Finance'),
  '/dashboard/financeV2': () => import('../pages/dashboard/FinanceV2'),
  '/dashboard/contacts': () => import('../pages/dashboard/Contacts'),
  '/dashboard/shows': () => import('../pages/dashboard/Shows'),
  '/dashboard/show': () => import('../pages/dashboard/ShowDetails'), // prefix match for details
  '/dashboard/travel': () => import('../pages/dashboard/TravelV2'),
  '/dashboard/travel/workspace': () => import('../pages/dashboard/TravelWorkspacePage'),
  '/dashboard/mission/lab': () => import('../pages/dashboard/MissionControlLab'),
  '/dashboard/calendar': () => import('../pages/dashboard/Calendar'),
  '/dashboard/settings': () => import('../pages/dashboard/Settings'),
  '/dashboard/profile': () => import('../pages/profile/ProfileSettings'),
  '/dashboard/org': () => import('../pages/org/OrgOverviewNew'),
  // '/login' is statically imported in AppRouter, no need to prefetch
  '/register': () => import('../pages/Register'),
  '/onboarding': () => import('../pages/OnboardingSimple'),
};

// Prefetch cache para evitar cargar la misma ruta múltiples veces
const prefetchedPaths = new Set<string>();

export function prefetchByPath(path: string) {
  try {
    if (!path) return;

    // Skip if already prefetched
    if (prefetchedPaths.has(path)) return;

    // Normalize to handle dynamic segments (e.g., /dashboard/shows/:id)
    const key = path.startsWith('/dashboard/shows/') ? '/dashboard/show' : path;
    const load = loaders[key];
    if (load) {
      prefetchedPaths.add(path);
      void load(); // fire-and-forget
    }
  } catch {
    // ignore
  }
}

export const prefetch = {
  dashboard: () => prefetchByPath('/dashboard'),
  finance: () => prefetchByPath('/dashboard/financeV2'),
  contacts: () => prefetchByPath('/dashboard/contacts'),
  shows: () => prefetchByPath('/dashboard/shows'),
  showDetails: () => prefetchByPath('/dashboard/show'),
  travel: () => prefetchByPath('/dashboard/travel'),
  travelWorkspace: () => prefetchByPath('/dashboard/travel/workspace'),
  calendar: () => prefetchByPath('/dashboard/calendar'),
  settings: () => prefetchByPath('/dashboard/settings'),
  profile: () => prefetchByPath('/dashboard/profile'),
  org: () => prefetchByPath('/dashboard/org'),
  login: () => prefetchByPath('/login'),
  register: () => prefetchByPath('/register'),
  onboarding: () => prefetchByPath('/onboarding'),
};
