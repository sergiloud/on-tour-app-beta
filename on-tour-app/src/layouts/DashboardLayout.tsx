import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { prefetchByPath } from '../routes/prefetch';
import { useTheme } from '../hooks/useTheme';
import GlobalFilters from '../components/dashboard/GlobalFilters';
import GlobalFilterPills from '../components/dashboard/GlobalFilterPills';
import { useHighContrast } from '../context/HighContrastContext';
import { useSettings } from '../context/SettingsContext';
import { setLang as setLangI18n } from '../lib/i18n';
import { MissionControlProvider } from '../context/MissionControlContext';
import { t } from '../lib/i18n';
import { trackEvent, startViewVitals, Events } from '../lib/telemetry';
import CommandPalette from '../components/common/CommandPalette';
import ShortcutsOverlay from '../components/common/ShortcutsOverlay';

// Left navigation items ordered per spec: dashboard, mission control, shows, travel, finance, settings
const navItems = [
  { to: '/dashboard', labelKey: 'nav.dashboard', end: true },
  { to: '/dashboard/shows', labelKey: 'nav.shows' },
  { to: '/dashboard/travel', labelKey: 'nav.travel' },
  { to: '/dashboard/calendar', labelKey: 'nav.calendar' },
  { to: '/dashboard/finance', labelKey: 'nav.finance' },
  { to: '/dashboard/settings', labelKey: 'nav.settings' }
];

export const DashboardLayout: React.FC = () => {
  const { toggle, theme } = useTheme();
  const { highContrast, toggleHC } = useHighContrast();
  const { lang, setLang } = useSettings();
  const [collapsed, setCollapsed] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  useEffect(()=>{ try { startViewVitals('dashboard'); } catch {} }, []);
  useEffect(()=>{
    const stored = localStorage.getItem('dash-sidebar-collapsed');
    if (stored) setCollapsed(stored === '1');
  }, []);
  useEffect(()=>{
    localStorage.setItem('dash-sidebar-collapsed', collapsed ? '1' : '0');
  }, [collapsed]);
  // Global shortcuts: Cmd/Ctrl+K for command palette; '?' for shortcuts overlay
  useEffect(()=>{
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      const mod = isMac ? e.metaKey : e.ctrlKey;
      const key = e.key.toLowerCase();
    if (mod && key === 'k') { e.preventDefault(); setCmdOpen(true); try { Events.shortcutUsed('cmdk', { view: 'dashboard' }); } catch {} return; }
  // Show overlay on '?'. Keyboards may emit '/' with Shift
  if (e.key === '?' || (e.shiftKey && e.key === '/')) { e.preventDefault(); setShortcutsOpen(true); try { Events.shortcutUsed('?', { view: 'dashboard' }); } catch {} return; }
    };
    window.addEventListener('keydown', onKey);
    const onOpen = () => setShortcutsOpen(true);
    window.addEventListener('shortcuts:open' as any, onOpen as any);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('shortcuts:open' as any, onOpen as any); };
  }, []);
  return (
    <MissionControlProvider>
    <div className="min-h-screen flex">
  {/* Skip to content for keyboard users */}
  <a href="#dash-main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:rounded-md focus:bg-accent-500 focus:text-black">{t('common.skipToContent') || 'Skip to content'}</a>
  <aside className={`hidden md:flex flex-col border-r border-white/5 bg-ink-900/35 backdrop-blur-xl glass p-4 gap-5 transition-all duration-300 ${collapsed ? 'w-20' : 'w-60'} fixed top-0 bottom-0 left-0 overflow-y-auto`} aria-label="Dashboard navigation" aria-expanded={!collapsed}>
        <div className="flex items-center justify-between gap-2">
          <div className="font-bold tracking-tight text-accent-500 text-sm truncate" aria-hidden={collapsed}>{collapsed ? 'OT' : 'OnTour'}</div>
          <div className="flex items-center gap-1 ml-auto">
              <button onClick={toggle} aria-label="Toggle theme" aria-pressed={theme==='dark'} className="text-xs opacity-70 hover:opacity-100 transition" title="Toggle theme">{theme === 'dark' ? '🌙' : '☀️'}</button>
            <button
              onClick={()=>setCollapsed(c=>!c)}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="text-xs opacity-70 hover:opacity-100 transition"
              title={collapsed ? 'Expand' : 'Collapse'}
            >{collapsed ? '»' : '«'}</button>
          </div>
        </div>
  <nav className="flex flex-col gap-1.5 text-sm" aria-label="Dashboard navigation">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({isActive}) => `rounded-md px-3 py-2 font-medium flex items-center gap-2 motion-safe:transition-colors ${isActive ? 'bg-accent-500 text-black shadow-glow' : 'opacity-80 hover:opacity-100 hover:bg-white/6'}`}
              onMouseEnter={() => prefetchByPath(item.to)}
              onFocus={() => prefetchByPath(item.to)}
            >
              <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-[10px] uppercase">{t(item.labelKey)[0]}</span>
              {!collapsed && <span>{t(item.labelKey)}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto text-[10px] leading-relaxed opacity-60 space-y-0.5">
          <div>{t('layout.build')}</div>
          <div>{t('layout.demo')}</div>
        </div>
      </aside>
  <div className="flex-1 flex flex-col min-w-0 md:ml-[var(--sidebar-width,15rem)]" style={{'--sidebar-width': collapsed ? '5rem' : '15rem'} as any}>
  <header className="px-3 md:px-5 py-3 md:py-3.5 flex items-center justify-between border-b border-white/5 backdrop-blur-xl bg-ink-900/25">
          <h1 className="text-base md:text-lg font-semibold tracking-tight">{t('nav.dashboard')}</h1>
          <div className="flex items-center gap-3.5 text-[11px] md:text-xs opacity-85">
            <span>Team: Demo</span>
            <select
              aria-label={t('common.language')}
              className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[11px] hover:border-white/20 motion-safe:transition-colors"
              value={lang}
              onChange={(e)=>{ const l = e.target.value as 'en'|'es'; setLang(l); setLangI18n(l); }}
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
            </select>
            <button className="btn-ghost px-3 py-1.5 md:px-4 md:py-2 text-xs">{t('layout.invite')}</button>
            <button onClick={toggleHC} className="btn-ghost px-2 py-1 text-[11px]" aria-pressed={highContrast} title="High contrast">HC</button>
          </div>
        </header>
        {/* Filter pills row with Clear + More filters */}
        <GlobalFilterPills />
        <UrlFilterSync />
        <GlobalFilters />
  <main className="flex-1 overflow-y-auto pr-2 md:pr-3 pl-2 md:pl-3 py-6 md:py-8" id="dash-main">
          <Outlet />
        </main>
      </div>
    </div>
  <CommandPalette open={cmdOpen} onClose={()=> setCmdOpen(false)} />
  <ShortcutsOverlay open={shortcutsOpen} onClose={()=> setShortcutsOpen(false)} />
    </MissionControlProvider>
  );
};

  // removed local GlobalFiltersPanel in favor of shared GlobalFilters
export default DashboardLayout;

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
