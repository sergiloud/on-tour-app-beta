import React, { useMemo } from 'react';
import { InteractiveMap } from '../components/mission/InteractiveMap';
import { MissionHud } from '../components/mission/MissionHud';
import { ActionHub } from '../components/dashboard/ActionHub';
import { Card } from '../ui/Card';
const FinanceQuicklookLazy = React.lazy(() => import('../components/dashboard/FinanceQuicklook'));
import TourOverviewCard from '../components/dashboard/TourOverviewCard';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { t } from '../lib/i18n';
import LazyVisible from '../components/common/LazyVisible';
import { useSettings } from '../context/SettingsContext';
import { copyText } from '../lib/clipboard';
import { announce } from '../lib/announcer';
import { trackEvent } from '../lib/telemetry';
import { type Widget, defaultViews, resolveView, type ViewDefinition } from '../features/dashboard/viewConfig';
import { Link } from 'react-router-dom';
import { prefetchByPath } from '../routes/prefetch';
import { useToast } from '../ui/Toast';
import { UIEvents } from '../lib/telemetry/ui';
import { loadDemoData, clearAllShows, isDemoLoaded } from '../lib/demoDataset';

/**
 * Dashboard widgets contract.
 *
 * Types and expectations:
 * - Widget: { type: 'map'|'actionHub'|'financeQuicklook'|'tourOverview'|'missionHud'; size?: 'sm'|'md'|'lg'; kinds?: string[] }
 * - ViewDefinition: { main: Widget[]; sidebar: Widget[]; mainOrder?: 'order-1'|'order-2'; sidebarOrder?: 'order-1'|'order-2' }
 * - Each widget is rendered via renderWidget(); unknown types are ignored (null).
 * - Lazy-loaded widgets should be wrapped in Suspense with short, accessible fallbacks.
 */

export const DashboardOverview: React.FC = () => {
  const { dashboardView, setDashboardView } = useSettings();
  const toast = useToast();
  // trick to force a remount on retry
  const [mapKey, setMapKey] = React.useState(0);
  const [savedName, setSavedName] = React.useState('');
  const [viewsMenuOpen, setViewsMenuOpen] = React.useState(false);
  const viewsMenuBtnRef = React.useRef<HTMLButtonElement>(null);
  const firstMenuItemRef = React.useRef<HTMLButtonElement>(null);
  const [importOpen, setImportOpen] = React.useState(false);
  const [importText, setImportText] = React.useState('');
  const [savedViews, setSavedViews] = React.useState<Record<string, any>>(()=>{ try { return JSON.parse(localStorage.getItem('dash:savedViews')||'{}'); } catch { return {}; } });
  const [demoLoaded, setDemoLoaded] = React.useState(()=>{ try { return isDemoLoaded(); } catch { return false; } });
  const persistSaved = (next: Record<string, any>)=>{ setSavedViews(next); try { localStorage.setItem('dash:savedViews', JSON.stringify(next)); } catch {} };
  // Import central view config
  const viewConfig = useMemo(() => defaultViews, []);
  const views = useMemo(() => ([
    { id: 'default', label: 'Default' },
    { id: 'finance', label: 'Finance' },
    { id: 'operations', label: 'Operations' },
    { id: 'promo', label: 'Promotion' }
  ]), []);
  const cfg: ViewDefinition = React.useMemo(()=>{
    if (dashboardView.startsWith('custom:')) {
      try {
        const name = dashboardView.slice('custom:'.length);
        const saved = JSON.parse(localStorage.getItem('dash:savedViews')||'{}');
        const c = saved?.[name] as { main: Widget[]; sidebar: Widget[]; mainOrder?: 'order-1'|'order-2'; sidebarOrder?: 'order-1'|'order-2' } | undefined;
        if (c && c.main && c.sidebar) return c;
      } catch {}
    }
    return resolveView(viewConfig, dashboardView);
  }, [dashboardView, viewConfig]);

  const renderWidget = (w: Widget, key: React.Key) => {
    if (w.type === 'map') {
      const h = w.size === 'sm' ? 'h-64 md:h-72' : w.size === 'md' ? 'h-72 md:h-80' : 'h-80 md:h-96';
      return (
        <Card key={key} className="p-4 flex flex-col gap-3 overflow-hidden" aria-label="Mission Control">
          <h2 className="text-lg font-semibold tracking-tight">{t('hud.missionControl')}</h2>
          <ErrorBoundary fallback={<div className="text-xs opacity-80 flex items-center gap-2"><span>{t('hud.mapLoadError')}</span><button className="px-2 py-1 rounded bg-white/10 hover:bg-white/20" onClick={()=>setMapKey(k=>k+1)}>{t('common.retry')}</button></div>}>
            <LazyVisible height={w.size==='lg'?360:w.size==='md'?320:280}>
              <InteractiveMap key={mapKey} className={`w-full ${h}`} />
            </LazyVisible>
          </ErrorBoundary>
        </Card>
      );
    }
    if (w.type === 'actionHub') return <ActionHub key={key} kinds={w.kinds} />;
    if (w.type === 'financeQuicklook') return (
      <React.Suspense key={key} fallback={<Card className="p-4"><div className="h-4 w-28 bg-white/10 rounded mb-2"/><div className="space-y-1">{Array.from({length:3}).map((_,i)=>(<div key={i} className="h-24 bg-white/5 rounded"/>))}</div></Card>}>
        <FinanceQuicklookLazy />
      </React.Suspense>
    );
    if (w.type === 'tourOverview') return <TourOverviewCard key={key} />;
    if (w.type === 'missionHud') return <MissionHud key={key} />;
    return null;
  };

  // Basic LCP/CLS budgets per view (console warn)
  React.useEffect(()=>{
    const budget: Record<string, { lcp: number; cls: number }> = {
      default: { lcp: 3500, cls: 0.1 },
      finance: { lcp: 3800, cls: 0.12 },
      operations: { lcp: 3600, cls: 0.1 },
      promo: { lcp: 3600, cls: 0.1 }
    };
    const b = budget[(dashboardView.includes('custom:') ? 'default' : dashboardView)] || budget.default;
    let lcpMax = 0; let clsMax = 0;
    const perfObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((e:any) => {
        if (e.entryType === 'largest-contentful-paint') lcpMax = Math.max(lcpMax, e.startTime);
        if (e.entryType === 'layout-shift' && !e.hadRecentInput) clsMax += e.value;
      });
    });
    try { perfObserver.observe({ type: 'largest-contentful-paint', buffered: true } as any); perfObserver.observe({ type: 'layout-shift', buffered: true } as any); } catch {}
    const t = setTimeout(()=>{
      if (lcpMax > b.lcp) console.warn(`[perf] LCP ${Math.round(lcpMax)}ms over budget ${b.lcp} for view ${dashboardView}`);
      if (clsMax > b.cls) console.warn(`[perf] CLS ${clsMax.toFixed(3)} over budget ${b.cls} for view ${dashboardView}`);
      try { trackEvent('perf.view', { view: dashboardView, lcp: Math.round(lcpMax), cls: Number(clsMax.toFixed(3)) }); } catch {}
      perfObserver.disconnect();
    }, 4000);
    return ()=>{ clearTimeout(t); try { perfObserver.disconnect(); } catch {} };
  }, [dashboardView]);

  // Saved views: capture current config (layout template + kinds + map sizes)
  const currentConfig = useMemo(()=> cfg, [cfg]);
  const onSaveView = () => {
    const name = savedName.trim() || `view-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}`;
    const next = { ...savedViews, [name]: currentConfig };
    persistSaved(next);
    try { trackEvent('dashboard.view.save', { name }); } catch {}
    try { UIEvents.viewSaved(name, { where: 'dashboard' }); } catch {}
    try { announce(`Saved view: ${name}`); } catch {}
    setSavedName('');
  };
  const onApplyView = (name: string) => {
    const v = savedViews[name];
    if (!v) return;
    // For now, store applied name in view state using custom: prefix for persistence and sharing
    setDashboardView(`custom:${name}` as any);
    try { trackEvent('dashboard.view.apply', { name }); } catch {}
    try { UIEvents.viewApplied(name, { where: 'dashboard' }); } catch {}
  };
  const onDeleteView = (name: string) => {
    const { [name]: _, ...rest } = savedViews;
    persistSaved(rest);
    try { trackEvent('dashboard.view.delete', { name }); } catch {}
    try { UIEvents.viewDeleted(name, { where: 'dashboard' }); } catch {}
  };
  const onExportViews = async () => {
    const json = JSON.stringify(savedViews, null, 2);
    const ok = await copyText(json);
    if (ok) { try { announce(t('actions.toast.share') || 'Link copied'); } catch {} toast.success(t('views.export.copied')||'Export copied'); }
    else { try { announce('Copy failed'); } catch {} toast.error('Copy failed'); }
  };
  const [importError, setImportError] = React.useState<string|null>(null);
  const onImportViews = () => {
    setImportError(null);
    let parsed: any = null;
    try { parsed = JSON.parse(importText); } catch {
      setImportError(t('views.import.invalid')||'Invalid JSON');
      return;
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      setImportError(t('views.import.invalid')||'Invalid JSON');
      return;
    }
    const bad = Object.entries(parsed).some(([_, v]: any)=> !v || typeof v !== 'object' || !Array.isArray((v as any).main) || !Array.isArray((v as any).sidebar));
    if (bad) { setImportError(t('views.import.invalidShape')||'Invalid view shape'); return; }
    persistSaved(parsed);
    try { toast.success(t('views.imported')||'Views imported'); announce(t('views.imported')||'Views imported'); } catch {}
    setImportOpen(false); setImportText('');
  };
  const ImportSection: React.FC<{ importText:string; setImportText:(s:string)=>void; onImport:()=>void; onCancel:()=>void; error:string|null }> = ({ importText, setImportText, onImport, onCancel, error }) => {
    const descId = React.useId();
    return (
      <div className="p-2 border-t border-white/10">
        <label className="block text-[11px] opacity-75 mb-1" htmlFor="views-import">{t('views.import.hint')}</label>
        <textarea
          id="views-import"
          aria-describedby={error ? descId : undefined}
          className={`w-full h-24 bg-white/5 rounded p-2 text-[12px] ${error ? 'outline outline-1 outline-rose-500' : ''}`}
          placeholder={"{\n  \"myView\": { /* ... */ }\n}"}
          value={importText}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>)=> { setImportError(null); setImportText(e.target.value); }}
        />
        {error && <div id={descId} className="mt-1 text-[11px] text-rose-400" role="alert">{error}</div>}
        <div className="mt-2 flex items-center gap-2">
          <button className="px-2 py-1 rounded bg-accent-500/90 text-black hover:bg-accent-500 disabled:opacity-50" onClick={onImport} disabled={!importText.trim()}>{t('views.import')}</button>
          <button className="px-2 py-1 rounded bg-white/10 hover:bg-white/15" onClick={onCancel}>{t('filters.clear')}</button>
        </div>
      </div>
    );
  };
  const onShareLink = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('view', dashboardView);
      copyText(url.toString()).then((ok)=>{
        if (ok) { try { announce(t('actions.toast.share')||'Link copied'); } catch {} toast.success(t('actions.toast.share')||'Link copied'); }
        else { try { announce(url.toString()); } catch {} toast.info(url.toString()); }
        try { UIEvents.viewShared({ where: 'dashboard' }); } catch {}
      });
    } catch {}
  };
  // close menu on outside click / Esc
  React.useEffect(()=>{
    if (!viewsMenuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setViewsMenuOpen(false); viewsMenuBtnRef.current?.focus(); } };
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const menu = document.getElementById('views-menu');
      if (menu && !menu.contains(target) && target !== viewsMenuBtnRef.current) setViewsMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onClick);
    return ()=>{ window.removeEventListener('keydown', onKey); window.removeEventListener('mousedown', onClick); };
  }, [viewsMenuOpen]);
  const onLoadDemo = () => {
    const res = loadDemoData();
    if (res.loaded) { toast.success(t('demo.loaded')); setDemoLoaded(true); }
    else toast.info(t('demo.loaded'));
  };
  const onClearData = () => { clearAllShows(); setDemoLoaded(false); toast.success(t('demo.cleared')); };
  return (
  <div className="max-w-[1400px] mx-auto px-4 md:px-6 space-y-5 text-[13px] md:text-[13px]">
  {/* Hero header */}
  <div className="relative overflow-hidden rounded-xl hero-gradient border border-white/10 p-4 md:p-6">
    <div className="relative z-10">
  <h2 className="section-title text-glow text-2xl md:text-3xl">{t('hud.missionControl')}</h2>
  <p className="subtle mt-1 text-[12px] md:text-[12px]">{t('hud.subtitle')}</p>
  <div className="mt-2 text-[11px]">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-400/30 text-amber-900 dark:text-amber-50 border border-amber-400/40">{t('demo.banner')}</span>
      </div>
      <div className="mt-2 flex gap-2">
        {!demoLoaded && (<button onClick={onLoadDemo} className="px-2.5 py-1 rounded bg-accent-500/90 text-black hover:bg-accent-500 text-[11px]">{t('demo.load')}</button>)}
        {demoLoaded && (
          <>
            <button onClick={onLoadDemo} className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 text-[11px]">{t('demo.load')}</button>
            <button onClick={onClearData} className="px-2.5 py-1 rounded bg-red-500/80 text-white hover:bg-red-500 text-[11px]">{t('demo.clear')}</button>
          </>
        )}
      </div>
  <div className="mt-2 flex items-center gap-2 text-[11px]">
        <span className="opacity-75">{t('views.label')}:</span>
        <div className="flex gap-1">
          {views.map(v => (
            <button key={v.id} onClick={()=> setDashboardView(v.id as any)} aria-pressed={dashboardView===v.id} className={`px-2.5 py-1 rounded border ${dashboardView===v.id ? 'bg-accent-500 text-black border-transparent' : 'bg-white/10 border-white/10 hover:bg-white/15'}`}>{t(`views.names.${v.id}`)}</button>
          ))}
        </div>
        <div className="ml-auto relative">
          <button
            ref={viewsMenuBtnRef}
            className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/15"
            aria-haspopup="menu"
            aria-expanded={viewsMenuOpen}
            aria-controls="views-menu"
            onClick={()=> setViewsMenuOpen(v=>{ const next=!v; if (next) setTimeout(()=> firstMenuItemRef.current?.focus(), 0); return next; })}
          >{dashboardView.startsWith('custom:') ? dashboardView.slice('custom:'.length) : t(`views.names.${dashboardView}`) || t('shows.views.none')} ▾</button>
          {viewsMenuOpen && (
            <div id="views-menu" role="menu" className="absolute right-0 mt-2 w-64 rounded-md border border-white/10 bg-ink-900/95 backdrop-blur-xl shadow-lg p-2 z-20">
              <div className="px-2 py-1 text-[10px] opacity-60">{t('views.manage')}</div>
              <div className="flex items-center gap-1 p-2">
                <input className="bg-white/5 rounded px-2 py-1 w-full" placeholder={t('shows.views.namePlaceholder')} value={savedName} onChange={e=> setSavedName(e.target.value)} aria-label={t('shows.views.namePlaceholder')} />
                <button ref={firstMenuItemRef} className="px-2 py-1 rounded bg-accent-500/90 text-black hover:bg-accent-500" onClick={()=>{ onSaveView(); setViewsMenuOpen(false); toast.success(t('views.saved')||'Saved'); }} role="menuitem" title={t('shows.views.save')}>{t('shows.views.save')}</button>
              </div>
              <div className="grid grid-cols-2 gap-2 p-2">
                <div>
                  <div className="text-[11px] opacity-75 mb-1">{t('views.apply')}</div>
                  <div className="max-h-32 overflow-auto">
                  {Object.keys(savedViews).length===0 ? (<div className="text-[11px] opacity-60">{t('views.none')}</div>) : (
                    Object.keys(savedViews).map(n => (
                      <button key={n} className="w-full text-left px-2 py-1 rounded hover:bg-white/10" onClick={()=>{ onApplyView(n); setViewsMenuOpen(false); toast.success(t('shows.views.applied')); }} role="menuitem" title={t('shows.views.applied')}>{n}</button>
                    ))
                  )}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] opacity-75 mb-1">{t('shows.views.delete')}</div>
                  <div className="max-h-32 overflow-auto">
                  {Object.keys(savedViews).length===0 ? (<div className="text-[11px] opacity-60">—</div>) : (
                    Object.keys(savedViews).map(n => (
                      <button key={n} className="w-full text-left px-2 py-1 rounded hover:bg-white/10" onClick={()=>{ onDeleteView(n); setViewsMenuOpen(false); toast.success(t('views.deleted')||'Deleted'); }} role="menuitem" title={t('shows.views.delete')}>{n}</button>
                    ))
                  )}
                  </div>
                </div>
              </div>
              <div className="border-t border-white/10 my-1" />
              <div className="p-2 grid grid-cols-2 gap-2">
                <button className="px-2 py-1 rounded bg-white/10 hover:bg-white/15" onClick={()=>{ onExportViews(); setViewsMenuOpen(false); }} role="menuitem" title={t('views.export')}>{t('views.export')}</button>
                <button className="px-2 py-1 rounded bg-white/10 hover:bg-white/15" onClick={()=>{ setImportOpen(v=>!v); }} role="menuitem" title={t('views.import')}>{t('views.import')}</button>
                <Link to="/dashboard/mission/lab" onMouseEnter={()=>prefetchByPath('/dashboard/mission/lab')} className="px-2 py-1 rounded bg-white/10 hover:bg-white/15 text-center" role="menuitem" title={t('views.openLab')}>{t('views.openLab')}</Link>
                <button className="px-2 py-1 rounded bg-white/10 hover:bg-white/15" onClick={()=>{ onShareLink(); setViewsMenuOpen(false); }} role="menuitem" title={t('views.share')}>{t('views.share')}</button>
              </div>
              {importOpen && (
                <ImportSection importText={importText} setImportText={setImportText} onImport={onImportViews} onCancel={()=>{ setImportOpen(false); setImportText(''); setImportError(null); }} error={importError} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    {/* Decorative SVG */}
    <svg className="absolute -top-8 -right-8 w-[260px] h-[260px] opacity-30" viewBox="0 0 100 100" aria-hidden>
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#bfff00" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.25" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="none" stroke="url(#g1)" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="url(#g1)" strokeWidth="1" />
      <circle cx="50" cy="50" r="18" fill="none" stroke="url(#g1)" strokeWidth="0.8" />
    </svg>
  </div>
  {/* Grid driven by view config */}
  <div className="dashboard-grid grid gap-4 lg:grid-cols-3 xl:grid-cols-5 auto-rows-auto">
    <div className={`dashboard-main lg:col-span-2 xl:col-span-3 flex flex-col gap-6 ${cfg.mainOrder || 'order-1'}`}>
      {cfg.main.map((w, i) => renderWidget(w, `main-${i}`))}
    </div>
    <div className={`dashboard-sidebar flex flex-col gap-6 self-start xl:col-span-2 ${cfg.sidebarOrder || 'order-2'}`}>
      {cfg.sidebar.map((w, i) => renderWidget(w, `side-${i}`))}
    </div>
  </div>
  </div>
  );
};

export default DashboardOverview;
