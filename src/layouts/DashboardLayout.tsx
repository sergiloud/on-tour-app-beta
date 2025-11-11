import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { prefetchByPath } from '../routes/prefetch';
import { useTheme } from '../hooks/useTheme';
import GlobalFilters from '../components/dashboard/GlobalFilters';
import GlobalFilterPills from '../components/dashboard/GlobalFilterPills';
import { useHighContrast } from '../context/HighContrastContext';
import { useSettings } from '../context/SettingsContext';
import { setLang as setLangI18n } from '../lib/i18n';
import { MissionControlProvider } from '../context/MissionControlContext';
import { t } from '../lib/i18n';
import { ensureDemoTenants, getCurrentOrgId, getOrgName, setCurrentOrgId, ORG_ARTIST_PROPHECY, ORG_AGENCY_A2G, isAgencyCurrent, isViewingAs, endViewAs, getViewAs, getOrgById, getOrgs } from '../lib/tenants';
import { trackEvent, startViewVitals, Events } from '../lib/telemetry';
import CommandPalette from '../components/common/CommandPalette';
import ShortcutsOverlay from '../components/common/ShortcutsOverlay';
import UserMenu from '../components/common/UserMenu';
import { useAuth } from '../context/AuthContext';
import { useOrg } from '../context/OrgContext';
import SubNav from '../components/common/SubNav';
import FirestoreUserPreferencesService from '../services/firestoreUserPreferencesService';

function useNavItems(collapsed: boolean) {
  const { org } = useOrg();
  
  // Type for navigation items
  type NavItem = { 
    to: string; 
    labelKey: string; 
    end?: boolean; 
    section?: string; 
    separator?: boolean; 
    separatorLabel?: string;
  };
  
  // Always show basic navigation items, even without org
  const commonStart: NavItem[] = [{ to: '/dashboard', labelKey: 'nav.dashboard', end: true }];
  
  // If no org, show minimal navigation (user can still access dashboard/onboarding)
  if (!org) {
    return [
      ...commonStart,
      { to: '/dashboard/shows', labelKey: 'nav.shows' },
      { to: '/dashboard/travel', labelKey: 'nav.travel' },
      { to: '/dashboard/calendar', labelKey: 'nav.calendar' },
      { to: '/dashboard/finance', labelKey: 'nav.finance' },
      { to: '/dashboard/contacts', labelKey: 'nav.contacts' },
      { to: '', labelKey: '', separator: true, separatorLabel: collapsed ? '' : 'En desarrollo' },
      { to: '/dashboard/org/members', labelKey: 'nav.members', section: 'org' },
      { to: '/dashboard/org/teams', labelKey: 'nav.teams', section: 'org' },
      { to: '/dashboard/org/clients', labelKey: 'nav.clients', section: 'org' },
      { to: '/dashboard/org/branding', labelKey: 'nav.branding', section: 'org' },
      { to: '/dashboard/org/billing', labelKey: 'nav.billing', section: 'org' },
      { to: '/dashboard/org/integrations', labelKey: 'nav.integrations', section: 'org' },
      { to: '/dashboard/org/documents', labelKey: 'nav.documents', section: 'org' },
      { to: '/dashboard/org/reports', labelKey: 'nav.reports', section: 'org' },
      { to: '/dashboard/org/links', labelKey: 'nav.links', section: 'org' },
    ] as NavItem[];
  }
  
  // Both artist and agency get full access to all sections
  return [
    ...commonStart,
    { to: '/dashboard/org', labelKey: 'nav.overview', section: 'org' },
    { to: '/dashboard/shows', labelKey: 'nav.shows' },
    { to: '/dashboard/travel', labelKey: 'nav.travel' },
    { to: '/dashboard/calendar', labelKey: 'nav.calendar' },
    { to: '/dashboard/finance', labelKey: 'nav.finance' },
    { to: '/dashboard/contacts', labelKey: 'nav.contacts' },
    { to: '', labelKey: '', separator: true, separatorLabel: collapsed ? '' : 'En desarrollo' },
    { to: '/dashboard/org/members', labelKey: 'nav.members', section: 'org' },
    { to: '/dashboard/org/teams', labelKey: 'nav.teams', section: 'org' },
    { to: '/dashboard/org/clients', labelKey: 'nav.clients', section: 'org' },
    { to: '/dashboard/org/branding', labelKey: 'nav.branding', section: 'org' },
    { to: '/dashboard/org/billing', labelKey: 'nav.billing', section: 'org' },
    { to: '/dashboard/org/integrations', labelKey: 'nav.integrations', section: 'org' },
    { to: '/dashboard/org/documents', labelKey: 'nav.documents', section: 'org' },
    { to: '/dashboard/org/reports', labelKey: 'nav.reports', section: 'org' },
    { to: '/dashboard/org/links', labelKey: 'nav.links', section: 'org' },
  ] as NavItem[];
}

export const DashboardLayout: React.FC = () => {
  // Preferences are centralized in Profile/Preferences; remove inline toggles from dashboard header
  const { /* theme, */ toggle } = useTheme();
  const { /* highContrast, */ toggleHC } = useHighContrast();
  const { /* lang, setLang */ } = useSettings();
  const { prefs, userId } = useAuth();
  const { org } = useOrg();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  // When arriving with ?landing=1 we clean the query and stay on /dashboard.
  // This ref avoids restoring last section immediately after that cleaning replace.
  const skipRestoreOnceRef = React.useRef(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [gPressed, setGPressed] = useState(false);
  useEffect(() => { try { startViewVitals('dashboard'); } catch { } }, []);
  // DISABLED FOR PRODUCTION BETA - demo tenants no longer needed
  // useEffect(() => { try { ensureDemoTenants(); } catch { } }, []);
  // Persist last visited section per org; only restore when explicitly requested
  useEffect(() => {
    if (!org) return;
    try {
      const key = `demo:lastSection:${org.id}`;
      // Save current section when navigating within dashboard
      if (location.pathname.startsWith('/dashboard') && location.pathname !== '/dashboard') {
        localStorage.setItem(key, location.pathname);
      }
      if (location.pathname === '/dashboard') {
        const params = new URLSearchParams(location.search);
        // Clean landing flag and do not restore
        if (params.has('landing')) {
          params.delete('landing');
          const next = `/dashboard${params.toString() ? `?${params.toString()}` : ''}`;
          if (next !== location.pathname + location.search) navigate(next, { replace: true });
          skipRestoreOnceRef.current = true;
          return;
        }
        if (skipRestoreOnceRef.current) { skipRestoreOnceRef.current = false; return; }
        // Restore only if explicitly requested
        const wantsRestore = params.get('restore') === '1';
        if (wantsRestore) {
          // When viewing as an artist, we want to restore *their* last section, not the agency's.
          const viewAsState = getViewAs();
          const effectiveOrgId = viewAsState?.artistOrgId || org.id;
          const restoreKey = `demo:lastSection:${effectiveOrgId}`;

          const saved = localStorage.getItem(restoreKey);
          if (saved && saved !== '/dashboard') {
            navigate(saved, { replace: true });
            return;
          }
          // No saved; clean the param
          params.delete('restore');
          const next = `/dashboard${params.toString() ? `?${params.toString()}` : ''}`;
          if (next !== location.pathname + location.search) navigate(next, { replace: true });
        }
      }
    } catch { }
  }, [org?.id, org?.type, location.pathname, location.search, navigate, org]);

  // Demo: org selection and persistence
  const [orgId, setOrgId] = useState<string>(() => {
    try {
      const currentOrg = getCurrentOrgId();
      return currentOrg || (profile?.defaultOrgId ?? '');
    } catch {
      return profile?.defaultOrgId ?? '';
    }
  });
  const { profile } = useAuth();
  useEffect(() => {
    try {
      if (profile?.defaultOrgId && profile.defaultOrgId !== orgId) {
        setOrgId(profile.defaultOrgId);
      }
    } catch { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.defaultOrgId]);
  useEffect(() => {
    try { setCurrentOrgId(orgId); } catch { }
    try { trackEvent('org.switch', { orgId }); } catch { }
  }, [orgId]);

  // Sidebar collapsed state - Load from Firebase first, fallback to localStorage
  useEffect(() => {
    if (userId) {
      FirestoreUserPreferencesService.getUserPreferences(userId)
        .then(prefs => {
          if (prefs?.ui?.sidebarCollapsed !== undefined) {
            setCollapsed(prefs.ui.sidebarCollapsed);
            localStorage.setItem('dash-sidebar-collapsed', prefs.ui.sidebarCollapsed ? '1' : '0');
          }
        })
        .catch(err => console.error('Failed to load UI preferences:', err));
    } else {
      // Fallback to localStorage if not logged in
      const stored = localStorage.getItem('dash-sidebar-collapsed');
      if (stored) setCollapsed(stored === '1');
    }
  }, [userId]);
  
  // Sync sidebar state to Firebase + localStorage
  useEffect(() => {
    localStorage.setItem('dash-sidebar-collapsed', collapsed ? '1' : '0');
    
    if (userId) {
      FirestoreUserPreferencesService.saveUIPreferences(userId, { sidebarCollapsed: collapsed })
        .catch(err => console.error('Failed to sync sidebar state:', err));
    }
  }, [collapsed, userId]);
  
  // Global shortcuts: Cmd/Ctrl+K for command palette; '?' for shortcuts overlay; 'g' then key to navigate
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      const mod = isMac ? e.metaKey : e.ctrlKey;
      const key = e.key.toLowerCase();
      if (mod && key === 'k') { e.preventDefault(); setCmdOpen(true); try { Events.shortcutUsed('cmdk', { view: 'dashboard' }); } catch { } return; }
      // Show overlay on '?'. Keyboards may emit '/' with Shift
      if (e.key === '?' || (e.shiftKey && e.key === '/')) { e.preventDefault(); setShortcutsOpen(true); try { Events.shortcutUsed('?', { view: 'dashboard' }); } catch { } return; }
      // g then key shortcuts
      if (key === 'g') {
        setGPressed(true);
        // reset after a short window
        window.setTimeout(() => setGPressed(false), 1200);
        return;
      }
      if (gPressed) {
        // artist: o=org, s=shows, t=travel, c=calendar, f=finance
        // agency: o=org, c=clients, r=reports
        const pathMapArtist: Record<string, string> = { o: '/dashboard/org', s: '/dashboard/shows', t: '/dashboard/travel', c: '/dashboard/calendar', f: '/dashboard/finance' };
        const pathMapAgency: Record<string, string> = { o: '/dashboard/org', c: '/dashboard/org/clients', r: '/dashboard/org/reports' };
        const map = (org && org.type === 'agency') ? pathMapAgency : pathMapArtist;
        const dest = map[key];
        if (dest) {
          e.preventDefault();
          (document.activeElement as HTMLElement | null)?.blur?.();
          navigate(dest);
        }
        setGPressed(false);
        return;
      }
    };
    window.addEventListener('keydown', onKey);
    const onOpen = () => setShortcutsOpen(true);
    window.addEventListener('shortcuts:open' as any, onOpen as any);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('shortcuts:open' as any, onOpen as any); };
  }, [gPressed, org?.type, navigate]);
  const navItems = useNavItems(collapsed);
  return (
    <MissionControlProvider>
      <div className="min-h-screen flex bg-dark-900">
        {/* Skip to content for keyboard users */}
        <a href="#dash-main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:rounded-md focus:bg-accent-500 focus:text-black">{t('common.skipToContent') || 'Skip to content'}</a>
        {/* Persistent View-As Banner */}
        {isViewingAs() && <ViewAsBanner />}
        <aside className={`hidden md:flex flex-col border-r border-slate-100 dark:border-white/5 bg-ink-900/35 backdrop-blur-xl glass p-4 gap-5 transition-all duration-300 ${collapsed ? 'w-20' : 'w-60'} fixed top-0 bottom-0 left-0 overflow-y-auto`} aria-label="Dashboard navigation" aria-expanded={!collapsed}>
          <div className="flex items-center justify-between gap-2">
            <div className="font-bold tracking-tight text-accent-500 text-sm truncate" aria-hidden={collapsed}>{collapsed ? 'OT' : 'OnTour'}</div>
            <div className="flex items-center gap-1 ml-auto">
              {/* Theme toggle removed from dashboard header */}
              <button
                onClick={() => setCollapsed(c => !c)}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className="text-xs opacity-70 hover:opacity-100 transition"
                title={collapsed ? 'Expand' : 'Collapse'}
              >{collapsed ? '»' : '«'}</button>
            </div>
          </div>
          <nav className="flex flex-col gap-1.5 text-sm" aria-label="Dashboard navigation">
            {navItems.map((item, index) => (
              item.separator ? (
                <div key={`separator-${index}`} className="my-2">
                  <div className="border-t border-slate-200 dark:border-white/10"></div>
                  {item.separatorLabel && !collapsed && (
                    <div className="text-[10px] text-slate-400 dark:text-white/30 uppercase tracking-wider px-3 py-2 font-semibold">
                      {item.separatorLabel}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={!!(item as any).end}
                  className={({ isActive }) => `rounded-md px-3 py-2 font-medium flex items-center gap-2 motion-safe:transition-colors ${isActive ? 'bg-accent-500 text-black shadow-glow' : 'opacity-80 hover:opacity-100 hover:bg-white/6'}`}
                  onMouseEnter={() => prefetchByPath(item.to)}
                  onFocus={() => prefetchByPath(item.to)}
                >
                  <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-200 dark:bg-white/10 flex items-center justify-center text-[10px] uppercase">{firstGrapheme(t(item.labelKey))}</span>
                  {!collapsed && <span>{t(item.labelKey)}</span>}
                </NavLink>
              )
            ))}
          </nav>
          <div className="mt-auto text-[10px] leading-relaxed opacity-60 space-y-0.5">
            <div>{t('layout.build')}</div>
            <div>{t('layout.demo')}</div>
          </div>
        </aside>
        <div className="flex-1 flex flex-col min-w-0 md:ml-[var(--sidebar-width,15rem)]" style={{ '--sidebar-width': collapsed ? '5rem' : '15rem' } as any}>
          <header className="px-3 md:px-5 py-3 md:py-3.5 flex items-center justify-between border-b border-slate-100 dark:border-white/5 backdrop-blur-xl bg-ink-900/25">
            <h1 className="text-base md:text-lg font-semibold tracking-tight">{t('nav.dashboard')}</h1>
            <div className="flex items-center gap-3.5 text-[11px] md:text-xs opacity-85">
              {/* Quick Search Hint */}
              <button
                onClick={() => {
                  // Trigger command palette
                  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
                  trackEvent('commandPalette.clickHint');
                }}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all group"
                title="Quick search (CMD+K)"
              >
                <svg className="w-3.5 h-3.5 text-slate-400 dark:text-white/60 group-hover:text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-[10px] text-slate-300 dark:text-white/50 group-hover:text-slate-500 dark:text-white/70">Search</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-200 dark:bg-white/10 text-[9px] text-slate-400 dark:text-white/40 font-mono">⌘K</kbd>
              </button>
              <UserMenu />
              {/* Language and High-contrast toggles moved to Preferences */}
              <button className="btn-ghost px-3 py-1.5 md:px-4 md:py-2 text-xs" onClick={() => { prefetchByPath('/dashboard/org/members'); navigate('/dashboard/org/members'); }}>{t('layout.invite')}</button>
            </div>
          </header>
          <UrlFilterSync />
          <GlobalFilters />
          <main className={`flex-1 overflow-y-auto pr-2 md:pr-3 pl-2 md:pl-3 ${prefs.compactView ? 'py-3 md:py-4 pb-16 md:pb-4' : 'py-6 md:py-8 pb-20 md:pb-8'}`} id="dash-main">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.3,
                  ease: [0.25, 0.46, 0.45, 0.94] // easeOutQuart for smooth animation
                }}
                className={`h-full ${prefs.compactView ? 'compact-view' : ''}`}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
          {/* Mobile bottom bar navigation - Enhanced with icons and active states */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[21] border-t border-slate-200 dark:border-white/10 bg-ink-900/95 backdrop-blur-xl shadow-2xl" role="navigation" aria-label="Primary mobile navigation">
            <ul className="grid grid-cols-5 gap-0" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.25rem)' } as any}>
              {org?.type === 'agency' ? (
                <>
                  <li>
                    <button
                      className={`w-full flex flex-col items-center gap-1 py-2.5 min-h-[44px] ${location.pathname === '/dashboard/org' || location.pathname === '/dashboard' ? 'text-accent-500' : 'text-white/60'} active:scale-95 transition-all`}
                      onClick={() => navigate('/dashboard/org')}
                      onMouseEnter={() => prefetchByPath('/dashboard/org')}
                      aria-label={t('nav.overview')}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                      <span className="text-[10px] font-medium">{t('nav.overview')}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full flex flex-col items-center gap-1 py-2.5 min-h-[44px] ${location.pathname.startsWith('/dashboard/org/clients') ? 'text-accent-500' : 'text-white/60'} active:scale-95 transition-all`}
                      onClick={() => navigate('/dashboard/org/clients')}
                      onMouseEnter={() => prefetchByPath('/dashboard/org/clients')}
                      aria-label={t('nav.clients')}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      <span className="text-[10px] font-medium">{t('nav.clients')}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full flex flex-col items-center gap-1 py-2.5 min-h-[44px] ${location.pathname.startsWith('/dashboard/org/reports') ? 'text-accent-500' : 'text-white/60'} active:scale-95 transition-all`}
                      onClick={() => navigate('/dashboard/org/reports')}
                      onMouseEnter={() => prefetchByPath('/dashboard/org/reports')}
                      aria-label={t('nav.reports')}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      <span className="text-[10px] font-medium">{t('nav.reports')}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className="w-full flex flex-col items-center gap-1 py-2.5 min-h-[44px] text-slate-400 dark:text-white/60 active:scale-95 transition-all"
                      onClick={() => setCmdOpen(true)}
                      aria-label="More options"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                      <span className="text-[10px] font-medium">More</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full flex flex-col items-center gap-1 py-2.5 min-h-[44px] ${location.pathname.startsWith('/dashboard/settings') ? 'text-accent-500' : 'text-white/60'} active:scale-95 transition-all`}
                      onClick={() => navigate('/dashboard/settings')}
                      onMouseEnter={() => prefetchByPath('/dashboard/settings')}
                      aria-label={t('nav.settings')}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <span className="text-[10px] font-medium">{t('nav.settings')}</span>
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <button
                      className={`w-full flex flex-col items-center gap-1 py-2.5 min-h-[44px] ${location.pathname === '/dashboard/org' || location.pathname === '/dashboard' ? 'text-accent-500' : 'text-white/60'} active:scale-95 transition-all`}
                      onClick={() => navigate('/dashboard/org')}
                      onMouseEnter={() => prefetchByPath('/dashboard/org')}
                      aria-label={t('nav.overview')}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                      <span className="text-[10px] font-medium">{t('nav.overview')}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full flex flex-col items-center gap-1 py-2.5 min-h-[44px] ${location.pathname.startsWith('/dashboard/shows') ? 'text-accent-500' : 'text-white/60'} active:scale-95 transition-all`}
                      onClick={() => navigate('/dashboard/shows')}
                      onMouseEnter={() => prefetchByPath('/dashboard/shows')}
                      aria-label={t('nav.shows')}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                      <span className="text-[10px] font-medium">{t('nav.shows')}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full flex flex-col items-center gap-1 py-2.5 min-h-[44px] ${location.pathname.startsWith('/dashboard/finance') ? 'text-accent-500' : 'text-white/60'} active:scale-95 transition-all`}
                      onClick={() => navigate('/dashboard/finance')}
                      onMouseEnter={() => prefetchByPath('/dashboard/finance')}
                      aria-label={t('nav.finance')}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="text-[10px] font-medium">{t('nav.finance')}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className="w-full flex flex-col items-center gap-1 py-2.5 min-h-[44px] text-slate-400 dark:text-white/60 active:scale-95 transition-all"
                      onClick={() => setCmdOpen(true)}
                      aria-label="More options"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                      <span className="text-[10px] font-medium">More</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full flex flex-col items-center gap-1 py-2.5 min-h-[44px] ${location.pathname.startsWith('/dashboard/settings') ? 'text-accent-500' : 'text-white/60'} active:scale-95 transition-all`}
                      onClick={() => navigate('/dashboard/settings')}
                      onMouseEnter={() => prefetchByPath('/dashboard/settings')}
                      aria-label={t('nav.settings')}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <span className="text-[10px] font-medium">{t('nav.settings')}</span>
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      <ShortcutsOverlay open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </MissionControlProvider>
  );
};

// removed local GlobalFiltersPanel in favor of shared GlobalFilters
export default DashboardLayout;

// Extract the first grapheme of a string safely (CJK/emoji)
function firstGrapheme(s: string): string {
  try {
    // Intl.Segmenter groups grapheme clusters correctly
    // @ts-ignore
    const seg = (Intl as any).Segmenter ? new (Intl as any).Segmenter(undefined, { granularity: 'grapheme' }) : null;
    if (seg) {
      const it = (seg as any).segment(s)[Symbol.iterator]();
      const n = it.next();
      return n && n.value ? n.value.segment : s.slice(0, 1);
    }
  } catch { }
  // Fallback using Array.from which splits by code points reasonably well
  try { return Array.from(s)[0] || ''; } catch { return s.slice(0, 1); }
}

// Keeps SettingsContext filters in sync with the URL query params
const UrlFilterSync: React.FC = () => {
  const { region, setRegion, dateRange, setDateRange, currency, setCurrency, dashboardView, setDashboardView } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();

  // 1) On mount and when URL changes externally, hydrate settings from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const r = params.get('r');
    const from = params.get('from');
    const to = params.get('to');
    const cur = params.get('cur');
    if (r === 'all' || r === 'AMER' || r === 'EMEA' || r === 'APAC') {
      if (r !== region) setRegion(r as any);
    }
    const viewRaw = params.get('view');
    const view = viewRaw === 'promotion' ? 'promo' : viewRaw; // accept alias `promotion`
    if (view === 'default' || view === 'finance' || view === 'operations' || view === 'promo') {
      if (view !== dashboardView) setDashboardView(view as any);
    }
    if (from && to) {
      if (from !== dateRange.from || to !== dateRange.to) setDateRange({ from, to });
    }
    if (cur === 'EUR' || cur === 'USD' || cur === 'GBP') {
      if (cur !== currency) setCurrency(cur as any);
    }
    // mask param removed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // 2) When settings change, reflect into URL (replace to avoid history spam)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.set('r', region);
    if (dateRange.from && dateRange.to) {
      params.set('from', dateRange.from);
      params.set('to', dateRange.to);
    }
    params.set('cur', currency);
    params.set('view', dashboardView);
    const next = `${location.pathname}?${params.toString()}`;
    // Avoid unnecessary replaces: compare string equality
    if (next !== location.pathname + location.search) {
      navigate(next, { replace: true });
    }
  }, [region, dateRange.from, dateRange.to, currency, dashboardView, location.pathname]);
  return null;
};

// removed old inline GlobalFiltersPanel in favor of shared GlobalFilters

// Compact breadcrumbs: Org / Section with a11y and sr-only counts
const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const { org, teams, links } = useOrg();
  const parts = location.pathname.replace(/^\/+|\/+$/g, '').split('/');
  // Expected: [ 'dashboard', maybe 'org' | 'shows' | ... ]
  const seg = parts[1] || 'dashboard';
  const map = (s: string) => {
    switch (s) {
      case 'dashboard': return t('nav.dashboard');
      case 'org': return t('nav.overview');
      case 'clients': return t('nav.clients');
      case 'teams': return t('nav.teams');
      case 'links': return t('nav.links');
      case 'reports': return t('nav.reports');
      case 'documents': return t('nav.documents');
      case 'integrations': return t('nav.integrations');
      case 'billing': return t('nav.billing');
      case 'branding': return t('nav.branding');
      case 'shows': return t('nav.shows');
      case 'travel': return t('nav.travel');
      case 'calendar': return t('nav.calendar');
      case 'finance': return t('nav.finance');
      default: return s.charAt(0).toUpperCase() + s.slice(1);
    }
  };
  const sectionLabel = map(seg);
  // Add sr-only counts for certain sections
  let srCount: string | null = null;
  if (seg === 'clients') srCount = String(links.length || 0);
  if (seg === 'teams') srCount = String(teams.length || 0);
  return (
    <nav className="px-4 pt-2 text-xs opacity-70" aria-label="Breadcrumbs">
      <ol className="flex items-center gap-1.5">
        <li>
          <span>{org ? org.name : 'Org'}</span>
          <span className="mx-1">/</span>
        </li>
        <li aria-current="page">
          <span>{sectionLabel}</span>
          {srCount && <span className="sr-only"> ({srCount})</span>}
        </li>
      </ol>
    </nav>
  );
};

// Persistent View-As Banner Component
const ViewAsBanner: React.FC = () => {
  const navigate = useNavigate();
  const st = getViewAs();
  const artist = st?.artistOrgId ? getOrgById(st.artistOrgId) : undefined;
  const handleExit = () => {
    try { endViewAs(); } catch { };
    navigate('/dashboard?landing=1');
  };
  return (
    <div className="bg-amber-500/15 border-b border-amber-400/30 px-4 py-2 text-sm text-amber-200 flex items-center justify-between">
      <span>
        {t('layout.viewingAs') || 'Viewing as'}: <strong>{artist?.name || 'Artist'}</strong>
        <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
          {t('access.readOnly') || 'read-only'}
        </span>
      </span>
      <button
        onClick={handleExit}
        className="underline decoration-dotted hover:no-underline text-amber-100"
        aria-label={t('layout.viewAsExit') || 'Exit'}
      >
        {t('layout.viewAsExit') || 'Exit'}
      </button>
    </div>
  );
};
