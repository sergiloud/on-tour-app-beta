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
  const patterns: Record<string, string[]> = {
    '/dashboard/shows': ['/dashboard/calendar', '/dashboard/finance'],
    '/dashboard/calendar': ['/dashboard/travel', '/dashboard/shows'],
    '/dashboard/finance': ['/dashboard/shows', '/dashboard/calendar'],
    '/dashboard/contacts': ['/dashboard/calendar', '/dashboard/shows'],
    '/dashboard': ['/dashboard/shows', '/dashboard/calendar', '/dashboard/finance'],
  };
  
  const likelyNext = currentPath ? patterns[currentPath] : undefined;
  if (likelyNext) {
    // Prefetch during idle time
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        likelyNext.forEach((path: string) => prefetchByPath(path));
      }, { timeout: 2000 });
    } else {
      setTimeout(() => {
        likelyNext.forEach((path: string) => prefetchByPath(path));
      }, 1000);
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
