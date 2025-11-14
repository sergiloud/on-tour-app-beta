// Intelligent route prefetch with user behavior tracking
// Prefetches routes based on navigation patterns and idle time

type Loader = () => Promise<unknown>;

const loaders: Record<string, Loader> = {
  '/dashboard': () => import('../pages/Dashboard'),
  '/dashboard/finance': () => import('../pages/dashboard/Finance'),
  '/dashboard/financeV2': () => import('../pages/dashboard/FinanceV2'),
  '/dashboard/contacts': () => import('../pages/dashboard/Contacts'),
  '/dashboard/shows': () => import('../pages/dashboard/Shows'),
  '/dashboard/show': () => import('../pages/dashboard/ShowDetails'),
  '/dashboard/travel': () => import('../pages/dashboard/TravelV2'),
  '/dashboard/travel/workspace': () => import('../pages/dashboard/TravelWorkspacePage'),
  '/dashboard/mission/lab': () => import('../pages/dashboard/MissionControlLab'),
  '/dashboard/calendar': () => import('../pages/dashboard/Calendar'),
  '/dashboard/settings': () => import('../pages/dashboard/Settings'),
  '/dashboard/profile': () => import('../pages/profile/ProfileSettings'),
  '/dashboard/org': () => import('../pages/org/OrgOverviewNew'),
  '/register': () => import('../pages/Register'),
  '/onboarding': () => import('../pages/OnboardingSimple'),
};

// Prefetch cache
const prefetchedPaths = new Set<string>();

// User behavior tracking
const navigationHistory: string[] = [];
const MAX_HISTORY = 10;

// Track navigation patterns
export function trackNavigation(path: string) {
  navigationHistory.push(path);
  if (navigationHistory.length > MAX_HISTORY) {
    navigationHistory.shift();
  }
  
  // Predict next route based on patterns
  predictAndPrefetch();
}

// Predict next likely route
function predictAndPrefetch() {
  if (navigationHistory.length < 2) return;
  
  const currentPath = navigationHistory[navigationHistory.length - 1];
  
  // Common patterns: shows → calendar, finance → shows, calendar → travel
  // Priority-based prefetching (higher priority = more likely)
  const patterns: Record<string, Array<{ path: string; priority: number }>> = {
    '/dashboard/shows': [
      { path: '/dashboard/calendar', priority: 90 },
      { path: '/dashboard/finance', priority: 70 },
      { path: '/dashboard/contacts', priority: 50 },
    ],
    '/dashboard/calendar': [
      { path: '/dashboard/travel', priority: 85 },
      { path: '/dashboard/shows', priority: 80 },
      { path: '/dashboard/contacts', priority: 40 },
    ],
    '/dashboard/finance': [
      { path: '/dashboard/shows', priority: 75 },
      { path: '/dashboard/calendar', priority: 65 },
    ],
    '/dashboard/contacts': [
      { path: '/dashboard/calendar', priority: 60 },
      { path: '/dashboard/shows', priority: 55 },
    ],
    '/dashboard': [
      { path: '/dashboard/shows', priority: 95 },
      { path: '/dashboard/calendar', priority: 90 },
      { path: '/dashboard/finance', priority: 85 },
      { path: '/dashboard/org', priority: 70 },
    ],
    '/dashboard/org': [
      { path: '/dashboard', priority: 60 },
      { path: '/dashboard/shows', priority: 50 },
    ],
  };
  
  const likelyNext = currentPath ? patterns[currentPath] : undefined;
  if (likelyNext) {
    // Prefetch during idle time, high priority first
    const sortedByPriority = likelyNext.sort((a, b) => b.priority - a.priority);
    
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        sortedByPriority.forEach(({ path }) => prefetchByPath(path));
      }, { timeout: 1500 });
    } else {
      setTimeout(() => {
        sortedByPriority.forEach(({ path }) => prefetchByPath(path));
      }, 500);
    }
  }
}

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
