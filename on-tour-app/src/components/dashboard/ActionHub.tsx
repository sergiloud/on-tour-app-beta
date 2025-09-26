import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useNavigate, Link } from 'react-router-dom';
import { prefetchByPath } from '../../routes/prefetch';
import { Chip } from '../../ui/Chip';
import { Card } from '../../ui/Card';
import { useFilteredShows, regionOf, teamOf } from '../../features/shows/selectors';
import { useMissionControl } from '../../context/MissionControlContext';
import { useSettings } from '../../context/SettingsContext';
import type { DemoShow } from '../../lib/demoShows';
import { announce } from '../../lib/announcer';
import { t } from '../../lib/i18n';
import { fetchItinerariesCached, type Itinerary } from '../../services/travelApi';
import { trackEvent, Events } from '../../lib/telemetry';
import { copyText, downloadTextFile } from '../../lib/clipboard';
import { loadJSON, saveJSON } from '../../lib/persist';
import { useToast } from '../../ui/Toast';
const AlertCenter = React.lazy(() => import('./AlertCenter'));
import { computeActions as computeActionsLocal, type HubAction, type Kind } from './computeActions';

// Use SettingsContext.fmtMoney instead of a local euros() helper

function relTime(dateISO?: string) {
  if (!dateISO) return '';
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  const now = Date.now();
  const diffMs = new Date(dateISO).getTime() - now;
  const days = Math.round(diffMs / 86400000);
  return rtf.format(days, 'day');
}

export const ActionHub: React.FC<{ kinds?: Kind[] }> = ({ kinds }) => {
  const toast = useToast();
  const [tab, setTab] = useState<string>(() => loadJSON('ac:tab', 'pending'));
  const [typeFilter, setTypeFilter] = useState<'all'|Kind>(() => loadJSON('ac:filter', 'all'));
  const { shows } = useFilteredShows();
  const [teamFilter, setTeamFilter] = useState<'all'|'A'|'B'>(()=> loadJSON('ac:team', 'all'));
  const [regionFilter, setRegionFilter] = useState<'all'|'AMER'|'EMEA'|'APAC'>(()=> loadJSON('ac:region', 'all'));
  const { setFocus } = useMissionControl();
  const { lang, region: globalRegion, dashboardView, fmtMoney } = useSettings();
  const redact = useCallback((s: any) => String(s), [lang]);
  // tabs will be recomputed later once counts derivable; initialize basic to keep early references valid
  const [tabs, setTabs] = useState(() => ([
    { id: 'pending', label: t('ah.tab.pending') },
    { id: 'shows', label: t('ah.tab.shows') },
    { id: 'travel', label: t('ah.tab.travel') },
    { id: 'insights', label: t('ah.tab.insights') }
  ]));
  const centerOn = useCallback((item: HubAction) => {
    // try to find show by id first, fallback to city match
    const found = (shows as any[]).find(s => s.id === item.id) || (shows as any[]).find(s => s.city === item.city);
    if (found && typeof found.lng === 'number' && typeof found.lat === 'number') {
      setFocus({ id: found.id, lng: found.lng, lat: found.lat });
    }
  }, [shows, setFocus]);
  // Travel itineraries fetched via service (filterable, cached)
  const [travel, setTravel] = useState<Itinerary[]>([]);
  const [travelOffline, setTravelOffline] = useState(false);
  const [manualCopy, setManualCopy] = useState<null | { title: string; content: string }>(null);
  const travelCacheKey = useMemo(() => {
    const DAY = 86400000; const now = Date.now(); const in21 = new Date(now + 21*DAY).toISOString().slice(0,10);
    const today = new Date(now).toISOString().slice(0,10);
    return `${today}:${in21}:${teamFilter}`;
  }, [teamFilter]);
  useEffect(() => {
    let mounted = true;
    const ac = new AbortController();
    let offlineBanner = false;
    const timer = setTimeout(async () => {
      try {
        const [from, to] = travelCacheKey.split(':');
        const res = await fetchItinerariesCached({ from, to, team: teamFilter }, { signal: ac.signal, ttlMs: 2 * 60 * 1000 });
        if (mounted) {
          setTravel(res.data);
          offlineBanner = (typeof navigator !== 'undefined' && navigator.onLine === false) && !!res.fromCache;
          setTravelOffline(offlineBanner);
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          setTravelOffline(true);
          try { trackEvent('travel.fetch.error', { message: String(err?.message || err), team: teamFilter }); } catch {}
        }
      }
    }, 150);
    return () => { mounted = false; ac.abort(); clearTimeout(timer); };
  }, [travelCacheKey, teamFilter]);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>(() => loadJSON('ac:dismissed', []));
  const [snoozed, setSnoozed] = useState<Record<string, number>>(() => loadJSON('ac:snoozed', {}));
  // Perf note banner if compute exceeds budget
  const [perfNote, setPerfNote] = useState<null | { ms:number; count:number; worker:boolean }>(null);

  // dismissed and snoozed are initialized from persisted storage via loadJSON above

  const [actionsAll, setActionsAll] = useState<HubAction[]>([]);
  useEffect(() => {
    let cancelled = false;
    const run = () => {
      try { performance.mark('ah.compute:start'); } catch {}
      const res = computeActionsLocal(new Date(), shows as any, travel as any);
      if (!cancelled) setActionsAll(res);
      try {
        performance.mark('ah.compute:end');
        const m = performance.measure('ah.compute', 'ah.compute:start', 'ah.compute:end');
        const ms = m.duration;
        const count = (shows as any[]).length;
  Events.ahComputeComplete({ count, ms, worker: false, view: dashboardView, region: globalRegion, team: teamFilter });
        // Budget and alert
        const BUDGET_MS = count > 500 ? 200 : 120;
        if (ms > BUDGET_MS) {
          setPerfNote({ ms, count, worker: false });
          try { trackEvent('ah.compute.overBudget', { count, ms, budget: BUDGET_MS, worker: false }); } catch {}
          console.warn(`[ah] compute ${Math.round(ms)}ms over budget ${BUDGET_MS}ms (count=${count})`);
        } else {
          setPerfNote(null);
        }
      } catch {}
    };
    const many = (shows as any[]).length > 500;
    const isTest = typeof import.meta !== 'undefined' && (import.meta as any).env?.MODE === 'test';
    if (many) {
      try {
        const WorkerCtor = (window as any).Worker;
        if (WorkerCtor && !isTest) {
          // @ts-ignore vite new URL pattern
          const worker = new Worker(new URL('../../workers/ahWorker.ts', import.meta.url), { type: 'module' });
          worker.onmessage = (ev: MessageEvent<any>) => {
            if (!cancelled && ev.data?.ok) setActionsAll(ev.data.actions);
            try {
              performance.mark('ah.compute:end');
              const m = performance.measure('ah.compute', 'ah.compute:start', 'ah.compute:end');
              const ms = typeof ev.data?.ms === 'number' ? ev.data.ms : m.duration;
              const count = (shows as any[]).length;
              Events.ahComputeComplete({ count, ms, worker: true, view: dashboardView, region: globalRegion, team: teamFilter });
              const BUDGET_MS = count > 1000 ? 250 : 160;
              if (ms > BUDGET_MS) {
                setPerfNote({ ms, count, worker: true });
                try { trackEvent('ah.compute.overBudget', { count, ms, budget: BUDGET_MS, worker: true }); } catch {}
                console.warn(`[ah] worker compute ${Math.round(ms)}ms over budget ${BUDGET_MS}ms (count=${count})`);
              } else {
                setPerfNote(null);
              }
            } catch {}
            try { worker.terminate(); } catch {}
          };
          try { Events.ahComputeWorker(true, { count: (shows as any[]).length, view: dashboardView, region: globalRegion, team: teamFilter }); } catch {}
          worker.postMessage({ shows, travel });
          return () => { cancelled = true; try { worker.terminate(); } catch {} };
        }
      } catch {}
    }
  try { Events.ahComputeWorker(false, { count: (shows as any[]).length, view: dashboardView, region: globalRegion, team: teamFilter }); } catch {}
    // Fallback to idle callback or immediate
    const ric = (window as any).requestIdleCallback as ((cb:()=>void)=>number) | undefined;
    let id = 0;
    if (ric) { id = ric(run as any); return () => { cancelled = true; try { (window as any).cancelIdleCallback?.(id); } catch {} }; }
    run();
    return () => { cancelled = true; };
  }, [shows, travel]);
  const actions = useMemo(() => kinds && kinds.length ? actionsAll.filter(a => (kinds as Kind[]).includes(a.kind)) : actionsAll, [actionsAll, kinds]);
  // Recompute tab labels with counts after actions/travel are known
  useEffect(()=>{
    const now = new Date();
    const showsCount = (shows as any[]).filter(s=>{ const d=new Date(s.date); return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear(); }).length;
    const counts = {
      pending: actions.length,
      shows: showsCount,
      travel: travel.length,
      insights: 3
    };
    setTabs([
      { id: 'pending', label: `${t('ah.tab.pending')} (${counts.pending})` },
      { id: 'shows', label: `${t('ah.tab.shows')} (${counts.shows})` },
      { id: 'travel', label: `${t('ah.tab.travel')} (${counts.travel})` },
      { id: 'insights', label: `${t('ah.tab.insights')} (${counts.insights})` }
    ]);
  }, [actions.length, travel.length, shows, lang]);

  // regionOf and teamOf imported from shared selectors

  const nowTs = Date.now();
  // Sort by score (desc) then apply filters; keep severity badge aligned visually
  const visibleActions = actions
    .filter(a => typeFilter==='all' || a.kind===typeFilter)
    .filter(a => !dismissed.includes(a.dismissKey))
    .filter(a => {
      const until = snoozed[a.dismissKey];
      return !until || until < nowTs;
    })
    .filter(a => {
      if (teamFilter==='all' && regionFilter==='all') return true;
      const show = (shows as any[]).find(s => s.id === a.id) as any;
      const team = show ? teamOf(show.id) : 'A';
      const region = show ? regionOf(show.country) : 'EMEA';
      const teamOk = teamFilter==='all' || team===teamFilter;
      const regionOk = regionFilter==='all' || region===regionFilter;
      return teamOk && regionOk;
    });

  const switchTab = useCallback((next:string)=>{
    setTab(next);
    try { saveJSON('ac:tab', next); } catch {}
    try {
      const label = tabs.find(t => t.id === next)?.label || next;
      announce(`Tab changed to ${label}`);
    } catch {}
    trackEvent('ah.tab.change', { tab: next });
    setLoading(true);
    setTimeout(()=>setLoading(false), 350); // lightweight simulated loading
  }, []);

  useEffect(()=>{ try { saveJSON('ac:filter', typeFilter); } catch {} }, [typeFilter]);
  useEffect(()=>{ try { saveJSON('ac:team', teamFilter); } catch {} }, [teamFilter]);
  useEffect(()=>{ try { saveJSON('ac:region', regionFilter); } catch {} }, [regionFilter]);
  const thisMonth = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
    const list = (shows as any[])
      .filter(s => { const t = new Date(s.date).getTime(); return t >= start && t <= end; })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const total = list.reduce((sum: number, s: any) => sum + (Number(s.fee) || 0), 0);
    const label = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(now);
    const breakdown = list.reduce((acc: Record<string, number>, s: any) => { const k = String(s.status); acc[k] = (acc[k] || 0) + 1; return acc; }, {} as Record<string, number>);
    return { list, total, label, breakdown };
  }, [shows]);

  // Upcoming travel suggestions within next 3 weeks
  const upcomingTravel = useMemo(() => {
    const DAY = 86400000; const now = Date.now(); const in21 = now + 21 * DAY;
    return (shows as any[])
      .filter(s => { const t = new Date(s.date).getTime(); return t >= now && t <= in21; })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((s: any) => ({ id: 't-' + s.id, date: s.date, title: `Travel for ${s.city}`, status: s.status === 'confirmed' ? 'Needed' : 'Plan soon' }));
  }, [shows]);

  const onKeyTabs = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowRight','ArrowLeft','Home','End'].includes(e.key)) return;
    e.preventDefault();
    const order = tabs.map(t=>t.id);
    let idx = order.indexOf(tab);
    if (e.key==='ArrowRight') idx = (idx+1)%order.length;
    if (e.key==='ArrowLeft') idx = (idx-1+order.length)%order.length;
    if (e.key==='Home') idx = 0; if (e.key==='End') idx = order.length-1;
    switchTab(order[idx]);
  };

  const doneCount = actions.length - visibleActions.length;
  // Multi-select prep
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggleSelected = (key:string) => setSelected(prev=>{ const next=new Set(prev); if (next.has(key)) next.delete(key); else next.add(key); return next; });
  const clearSelected = () => setSelected(new Set());
  const allSelected = selected.size>0 && visibleActions.every(a=> selected.has(a.dismissKey));
  const selectAll = () => setSelected(new Set(visibleActions.map(a=> a.dismissKey)));
  const [alertOpen, setAlertOpen] = useState(false);
  // Support opening alerts from Command Palette
  useEffect(() => {
    const onOpen = () => setAlertOpen(true);
    window.addEventListener('alerts:open' as any, onOpen as any);
    return () => window.removeEventListener('alerts:open' as any, onOpen as any);
  }, []);
  useEffect(()=>{ if (alertOpen) { try { Events.alertsOpen({ view: dashboardView, region: globalRegion, team: teamFilter }); } catch {} } }, [alertOpen, dashboardView, globalRegion, teamFilter]);
  const alerts = useMemo(() => (
    actions.slice(0, 50).map(a => {
      const show = (shows as any[]).find(s => s.id === a.id);
      const country = a.country || show?.country;
      const region = country ? regionOf(country) : (show ? regionOf(show.country) : undefined);
      return { id: a.dismissKey, title: a.label, kind: (a.kind as any) as 'risk'|'urgency'|'opportunity'|'info', date: a.date, meta: a.meta, country, region };
    })
  ), [actions, shows]);

  // Virtualization for medium/long lists (>60). Adaptive overscan for smoother scroll.
  const scrollParentRef = useRef<HTMLDivElement | null>(null);
  const useVirtual = visibleActions.length > 60;
  const rowVirtualizer = useVirtual ? useVirtualizer({
    count: visibleActions.length,
    estimateSize: () => 56,
    getScrollElement: () => scrollParentRef.current,
    overscan: visibleActions.length > 500 ? 12 : 8,
  }) : null;

  return (
    <>
    <Card className="p-3 flex flex-col gap-3 text-[12px]" aria-label="Action Hub">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[12px] font-semibold tracking-tight">{t('ah.title')}</h2>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-1.5 text-[11px]">
            <span className="px-2 py-0.5 rounded-md bg-white/5">{t('ah.tab.pending')} {visibleActions.length}</span>
            <span className="px-2 py-0.5 rounded-md bg-white/5">{t('ah.done')} {doneCount}</span>
          </div>
          {perfNote && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40" title={`Compute ${Math.round(perfNote.ms)}ms for ${perfNote.count} shows${perfNote.worker?' (worker)':''}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12" y2="17"/></svg>
              <span>{Math.round(perfNote.ms)}ms</span>
            </span>
          )}
          <button
            className="text-[11px] px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/15"
            onClick={()=> setAlertOpen(true)}
            onMouseEnter={()=>{ import('./AlertCenter'); }}
            onFocus={()=>{ import('./AlertCenter'); }}
            aria-haspopup="dialog"
          >{t('alerts.open')}</button>
          <button
            className="text-[11px] px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/15"
            onClick={()=>{
              try {
                const rows = [['id','kind','title','date','meta','region']].concat(visibleActions.map(a=>{
                  const show = (shows as any[]).find(s=>s.id===a.id);
                  const region = show ? regionOf(show.country) : '';
                  return [a.id, a.kind, redact(a.label), a.date||'', redact(a.meta||''), region];
                }));
                const esc = (s:any) => ('"'+String(s).replace(/"/g,'""')+'"');
                const csv = rows.map(r=> r.map(esc).join(',')).join('\n');
                copyText(csv).then(ok=>{
                  if (ok) announce(t('actions.toast.csv'));
                  else {
                    downloadTextFile('actions.csv', csv, 'text/csv');
                    setManualCopy({ title: t('copy.manual.title'), content: csv });
                  }
                });
              } catch {}
            }}
          >{t('actions.exportCsv')}</button>
          <button
            className="text-[11px] px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/15"
            onClick={()=>{
              try {
                const top = [...visibleActions].slice(0, 10);
                const lines = top.map((a,i)=> `${i+1}. [${a.kind}] ${redact(a.label)}${a.meta? ' — '+redact(a.meta):''}`);
                const payload = `${t('actions.digest.title')}\n${lines.join('\n')}`;
                copyText(payload).then(ok=>{
                  if (ok) announce(t('actions.toast.digest'));
                  else setManualCopy({ title: t('copy.manual.title'), content: payload });
                });
              } catch {}
            }}
          >{t('actions.copyDigest')}</button>
        </div>
      </header>
      <div className="flex gap-1.5 flex-wrap" role="tablist" aria-label="Action Hub tabs" onKeyDown={onKeyTabs}>
        {tabs.map(t => {
          const id = `ah-tab-${t.id}`; const panel = `ah-panel-${t.id}`;
          return (
            <Chip
              key={t.id}
              id={id}
              role="tab"
              aria-controls={panel}
              tabIndex={tab===t.id?0:-1}
              aria-selected={tab===t.id}
              onClick={()=>switchTab(t.id)}
              size="sm"
              variant={tab===t.id ? 'solid' : 'ghost'}
              tone={tab===t.id ? 'accent' : 'default'}
              active={tab===t.id}
            >{t.label}</Chip>
          );
        })}
      </div>
  <div className="flex-1 min-h-[200px] overflow-auto" ref={scrollParentRef}>
        {tab==='pending' && (
          <section id="ah-panel-pending" role="tabpanel" aria-labelledby="ah-tab-pending" aria-label="Pending Actions" className="space-y-3">
            {selected.size>0 && (
              <div className="flex items-center gap-2 p-2 rounded-md bg-white/5 border border-white/10">
                <span className="text-[11px] opacity-80">{selected.size} {t('shows.bulk.selected')}</span>
                <button className="text-[11px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/15" onClick={selectAll}>{t('shows.selectAll')}</button>
                <button className="text-[11px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/15" onClick={()=>{ const now = Date.now(); const current = loadJSON<Record<string, number>>('ac:snoozed', {}); const next = { ...current }; selected.forEach(k=> next[k]= now + 7*86400000); setSnoozed(next); saveJSON('ac:snoozed', next); clearSelected(); toast.success(t('common.snooze7')); }}>{t('common.snooze7')}</button>
                <button className="text-[11px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/15" onClick={()=>{ const now = Date.now(); const current = loadJSON<Record<string, number>>('ac:snoozed', {}); const next = { ...current }; selected.forEach(k=> next[k]= now + 30*86400000); setSnoozed(next); saveJSON('ac:snoozed', next); clearSelected(); toast.success(t('common.snooze30')); }}>{t('common.snooze30')}</button>
                <button className="text-[11px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/15" onClick={()=>{ const arr = Array.from(selected); setDismissed(prev=>{ const set=new Set(prev); arr.forEach(k=> set.add(k)); const out=[...set]; saveJSON('ac:dismissed', out); return out; }); clearSelected(); toast.success(t('ah.done')); }}>{t('ah.done')}</button>
                <button className="text-[11px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/15" onClick={()=>{ const top = visibleActions.filter(a=> selected.has(a.dismissKey)); const lines = top.map((a,i)=> `${i+1}. [${a.kind}] ${String(a.label)}${a.meta? ' — '+String(a.meta):''}`); const payload = `${t('actions.digest.title')}\n${lines.join('\n')}`; copyText(payload).then(ok=>{ if (ok) toast.success(t('actions.toast.digest')); else toast.info(t('copy.manual.title')); }); }}>{t('actions.copyDigest')}</button>
                <button className="ml-auto text-[11px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/15" onClick={clearSelected}>{t('filters.clear')}</button>
              </div>
            )}
            <div className="flex items-center gap-1 text-[11px] flex-wrap" role="group" aria-label={t('ah.typeFilter')}>
              {(['all','risk','urgency','opportunity','offer','finrisk'] as const).map(k => (
                <Chip
                  key={k}
                  role="button"
                  aria-pressed={typeFilter===k}
                  onClick={()=>{ setTypeFilter(k as any); try { announce(`Filter set to ${String(k)}`); } catch {}; Events.ahKindFilter(k, { view: dashboardView, region: globalRegion, team: teamFilter }); }}
                  size="sm"
                  variant={typeFilter===k?'solid':'ghost'}
                  tone={typeFilter===k?'accent':'default'}
                  active={typeFilter===k}
                  data-kind={k}
                >{t(`ah.filter.${k}`)}</Chip>
              ))}
              <div className="mx-2 w-px h-4 bg-white/10" aria-hidden />
              <label className="inline-flex items-center gap-1 opacity-80">
                <span>{t('common.team')}</span>
                <select className="bg-white/5 rounded px-1 py-0.5" value={teamFilter} onChange={(e)=>{ setTeamFilter(e.target.value as any); trackEvent('ah.filter.team', { team: e.target.value }); }} aria-label={t('common.team')}>
                  <option value="all">{t('ah.filter.all')}</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                </select>
              </label>
              <label className="inline-flex items-center gap-1 opacity-80">
                <span>{t('common.region')}</span>
                <select className="bg-white/5 rounded px-1 py-0.5" value={regionFilter} onChange={(e)=>{ setRegionFilter(e.target.value as any); trackEvent('ah.filter.region', { region: e.target.value }); }} aria-label={t('common.region')}>
                  <option value="all">{t('shows.filters.region.all')}</option>
                  <option value="AMER">{t('shows.filters.region.AMER')}</option>
                  <option value="EMEA">{t('shows.filters.region.EMEA')}</option>
                  <option value="APAC">{t('shows.filters.region.APAC')}</option>
                </select>
              </label>
            </div>
            {loading ? <SkeletonList count={4} /> : (
              useVirtual ? (
                <div style={{ height: rowVirtualizer!.getTotalSize(), position: 'relative' }} role="list" aria-live="polite">
                  {rowVirtualizer!.getVirtualItems().map(vi => {
                    const a = visibleActions[vi.index];
                    return (
                      <div key={a.dismissKey} data-index={vi.index} style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${vi.start}px)` }}>
                        <ActionRow item={a} selected={selected.has(a.dismissKey)} onToggleSelected={()=> toggleSelected(a.dismissKey)} onCenter={centerOn} onDismiss={(k)=>{
                          setDismissed(prev=>{ const set = new Set(prev); set.add(k); const arr=[...set]; try { saveJSON('ac:dismissed', arr); } catch {}; try { announce('Action dismissed'); } catch {} return arr; });
                        }} onMarkDone={(k)=>{
                          setDismissed(prev=>{ const set=new Set(prev); set.add(k); const arr=[...set]; try { saveJSON('ac:dismissed', arr); } catch {}; try { announce(t('ah.done')||'Done'); } catch {}; return arr; });
                          trackEvent('ah.action.done', { id: a.id, kind: a.kind });
                        }} onHide={(k)=>{
                          setDismissed(prev=>{ const set=new Set(prev); set.add(k); const arr=[...set]; try { saveJSON('ac:dismissed', arr); } catch {}; try { announce(t('ah.hidden')||'Hidden'); } catch {}; return arr; });
                          trackEvent('ah.action.hide', { id: a.id, kind: a.kind });
                        }} onSnooze={(key, days)=>{ const until = Date.now() + days*86400000; setSnoozed(prev=>{ const next = { ...prev, [key]: until }; try { saveJSON('ac:snoozed', next); } catch {} return next; }); }} />
                      </div>
                    );
                  })}
                  {visibleActions.length===0 && <div className="text-xs opacity-70">{t('ah.empty')}</div>}
                </div>
              ) : (
                <ul className="space-y-1.5" aria-live="polite">
                  {visibleActions.map(a => (
                    <ActionRow key={a.dismissKey} item={a} selected={selected.has(a.dismissKey)} onToggleSelected={()=> toggleSelected(a.dismissKey)} onCenter={centerOn} onDismiss={(k)=>{
                      setDismissed(prev=>{ const set = new Set(prev); set.add(k); const arr=[...set]; try { saveJSON('ac:dismissed', arr); } catch {}; try { announce('Action dismissed'); } catch {} return arr; });
                    }} onMarkDone={(k)=>{
                      setDismissed(prev=>{ const set=new Set(prev); set.add(k); const arr=[...set]; try { saveJSON('ac:dismissed', arr); } catch {}; try { announce(t('ah.done')||'Done'); } catch {}; return arr; });
                      trackEvent('ah.action.done', { id: a.id, kind: a.kind });
                    }} onHide={(k)=>{
                      setDismissed(prev=>{ const set=new Set(prev); set.add(k); const arr=[...set]; try { saveJSON('ac:dismissed', arr); } catch {}; try { announce(t('ah.hidden')||'Hidden'); } catch {}; return arr; });
                      trackEvent('ah.action.hide', { id: a.id, kind: a.kind });
                    }} onSnooze={(key, days)=>{ const until = Date.now() + days*86400000; setSnoozed(prev=>{ const next = { ...prev, [key]: until }; try { saveJSON('ac:snoozed', next); } catch {} return next; }); }} />
                  ))}
                  {visibleActions.length===0 && (
                    <li className="text-xs opacity-80 flex items-center justify-between bg-white/5 rounded p-2">
                      <span>{t('ah.empty')}</span>
                      <Link to="/dashboard/travel" className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/15 text-[11px]">{t('ah.planTravel')}</Link>
                    </li>
                  )}
                </ul>
              )
            )}
          </section>
        )}
        {tab==='shows' && (
          <section id="ah-panel-shows" role="tabpanel" aria-labelledby="ah-tab-shows" aria-label="This Month's Shows" className="space-y-2.5">
            {loading ? <SkeletonList count={5} /> : (
              <>
                <div className="text-[11px] opacity-70">{thisMonth.label} • {thisMonth.list.length} {t('finance.shows')} • {t('insights.thisMonthTotal')}: {fmtMoney(thisMonth.total)}</div>
                <ul className="space-y-1.5">
                  {thisMonth.list.map((s: any) => <ShowRow key={s.id} item={s} />)}
                  {thisMonth.list.length === 0 && <li className="text-xs opacity-70">{t('finance.noShowsMonth')}</li>}
                </ul>
              </>
            )}
          </section>
        )}
        {tab==='travel' && (
          <section id="ah-panel-travel" role="tabpanel" aria-labelledby="ah-tab-travel" aria-label="Travel Plans" className="space-y-2.5">
            {loading ? <SkeletonList count={4} /> : (
              <>
                <div className="text-[11px] opacity-70">{t('hud.next3weeks')}</div>
                {travelOffline && (
                  <div className="text-[11px] px-2 py-1 rounded bg-amber-400/20 text-amber-900 dark:text-amber-100 border border-amber-400/30">
                    {t('travel.offline')}
                  </div>
                )}
                <ul className="space-y-1.5">
                  {travel.map((t: any) => <TravelRow key={t.id} item={t} />)}
                  {travel.length === 0 && <li className="text-xs opacity-70">{t('hud.noTrips3weeks')}</li>}
                </ul>
                <div className="pt-1">
                  <Link className="text-[11px] px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/15 inline-block" to="/dashboard/travel">{t('ah.openTravel')}</Link>
                </div>
              </>
            )}
          </section>
        )}
        {tab==='insights' && (
          <section id="ah-panel-insights" role="tabpanel" aria-labelledby="ah-tab-insights" aria-label="Performance Insights" className="grid gap-2.5 sm:grid-cols-2">
            {loading ? <SkeletonCards count={3} /> : (<>
              <InsightCard title={t('insights.thisMonthTotal')} metric={fmtMoney(thisMonth.total)} />
              <InsightCard title={t('insights.statusBreakdown')} metric={`C:${thisMonth.breakdown.confirmed||0} · P:${thisMonth.breakdown.pending||0} · O:${thisMonth.breakdown.offer||0}`} />
              {(() => { const DAY=86400000; const now=Date.now(); const in14=now+14*DAY; const ups=(shows as any[]).filter(s=>{const t=new Date(s.date).getTime(); return t>=now && t<=in14;}); const sum=ups.reduce((acc:any,s:any)=>acc+(s.fee||0),0); return <InsightCard title={t('insights.upcoming14d')} metric={`${ups.length} • ${fmtMoney(sum)}`} />; })()}
            </>)}
          </section>
        )}
      </div>
    </Card>
  <React.Suspense fallback={<div className="fixed bottom-4 right-4 px-3 py-2 rounded bg-black/70 text-white/90 text-[12px] border border-white/10">{t('alerts.loading')}</div>}>
      <AlertCenter open={alertOpen} onClose={()=> setAlertOpen(false)} items={alerts} />
    </React.Suspense>
    {manualCopy && (
      <div role="dialog" aria-modal="true" aria-label={t('copy.manual.title')} className="fixed inset-0 z-[var(--z-modal)]">
        <div className="absolute inset-0 bg-black/60" onClick={()=> setManualCopy(null)} />
        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[92vw] max-w-2xl glass rounded-xl border border-white/12 shadow-2xl overflow-hidden text-[12px]">
          <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
            <div className="text-[14px] font-semibold">{t('copy.manual.title')}</div>
            <button className="px-2 py-1 rounded bg-white/10 hover:bg-white/15" onClick={()=> setManualCopy(null)} aria-label="Close">{t('shows.dialog.close')}</button>
          </div>
          <div className="p-3 space-y-2">
            <div className="opacity-80">{t('copy.manual.desc')}</div>
            <textarea readOnly className="w-full min-h-[220px] bg-white/5 rounded p-2 font-mono text-[11px]" value={manualCopy.content} />
          </div>
        </div>
      </div>
    )}
    </>
  );
};

const kindTone: Record<Kind, string> = {
  risk: 'bg-rose-500/80 text-black',
  urgency: 'bg-amber-400/80 text-black',
  opportunity: 'bg-emerald-400/80 text-black',
  offer: 'bg-sky-400/80 text-black',
  finrisk: 'bg-rose-500/80 text-black'
};

const statusTone: Record<string, string> = {
  confirmed: 'bg-emerald-500/20 text-emerald-200',
  pending: 'bg-amber-500/20 text-amber-200',
  offer: 'bg-sky-500/20 text-sky-200'
};

const KindIcon: React.FC<{ kind: Kind }> = ({ kind }) => {
  const title = t(`ah.filter.${kind}`);
  const cls = "w-[14px] h-[14px]";
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <span aria-hidden className="w-5 h-5 grid place-items-center rounded bg-white/8 border border-white/10" title={title}>
      {kind==='risk' && (
        <svg width="14" height="14" viewBox="0 0 24 24" className={cls} {...common}>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12" y2="17"/>
        </svg>
      )}
      {kind==='urgency' && (
        <svg width="14" height="14" viewBox="0 0 24 24" className={cls} {...common}>
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      )}
      {kind==='opportunity' && (
        <svg width="14" height="14" viewBox="0 0 24 24" className={cls} {...common}>
          <path d="M3 12l2-2 4 4 10-10 2 2-12 12z"/>
        </svg>
      )}
      {kind==='offer' && (
        <svg width="14" height="14" viewBox="0 0 24 24" className={cls} {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2"/>
          <path d="M3 10h18"/>
        </svg>
      )}
      {kind==='finrisk' && (
        <svg width="14" height="14" viewBox="0 0 24 24" className={cls} {...common}>
          <path d="M3 3v18h18"/>
          <path d="M19 7l-6 6-3-3-6 6"/>
        </svg>
      )}
    </span>
  );
};

const severityTone: Record<'high'|'med'|'low', string> = {
  high: 'bg-rose-500 text-black',
  med: 'bg-amber-400 text-black',
  low: 'bg-white/10'
};

const ActionRow: React.FC<{ item: HubAction; onDismiss: (key:string)=>void; onCenter: (i:HubAction)=>void; selected: boolean; onToggleSelected: ()=>void; onMarkDone:(key:string)=>void; onHide:(key:string)=>void; onSnooze?: (key:string, days:number)=>void }> = React.memo(({ item, onDismiss, onCenter, selected, onToggleSelected, onMarkDone, onHide, onSnooze }) => {
  const { setFocus } = useMissionControl();
  const hoverTimer = React.useRef<number | null>(null);
  const clearHover = () => { if (hoverTimer.current) { window.clearTimeout(hoverTimer.current); hoverTimer.current = null; } };
  const onHover = () => {
    clearHover();
    hoverTimer.current = window.setTimeout(() => {
      try {
        // best-effort focus using id or city
        const city = (item as any).city as string | undefined;
        // We cannot derive lng/lat here; delegate to onCenter to keep logic consistent using shows selector in parent
        onCenter(item);
      } catch {}
    }, 180);
  };
  const { fmtMoney } = useSettings();
  const navigate = useNavigate();
  const ctaLabel = item.kind==='opportunity' ? t('ah.cta.addTravel') : item.kind==='offer' ? t('ah.cta.followUp') : item.kind==='urgency' ? t('ah.cta.review') : t('ah.cta.open');
  const onPrimary = () => {
    // Real CTAs: open show page; for opportunity, navigate to travel creation with prefill
    if (item.kind==='opportunity') {
      prefetchByPath('/dashboard/travel');
      navigate(`/dashboard/travel?create=1&showId=${encodeURIComponent(item.id)}`);
    } else {
      prefetchByPath(`/dashboard/shows/${item.id}`);
      navigate(`/dashboard/shows/${item.id}`);
    }
  };
  const [open, setOpen] = React.useState(false);
  const menuFirstRef = React.useRef<HTMLButtonElement|null>(null);
  const triggerRef = React.useRef<HTMLButtonElement|null>(null);
  const menuId = React.useId();
  const doReminder = () => { try { announce('Invoice reminder sent'); } catch {}; try { trackEvent('ah.reminder.sent', { id: item.id }); } catch {} };
  const doProposal = () => { try { announce('Proposal sent'); } catch {}; try { trackEvent('ah.proposal.sent', { id: item.id }); } catch {} };
  const snooze = (days:number) => {
    try { onSnooze?.(item.dismissKey, days); } catch {}
    setOpen(false);
  // Announce snooze for screen readers
  try { announce(`Snoozed for ${days} days`); } catch {}
  try { trackEvent('ah.snooze', { id: item.id, days }); } catch {}
  };
  return (
    <li className="text-[12px]" role="listitem" onMouseEnter={onHover} onMouseLeave={clearHover}>
      <Card className="p-2.5 flex flex-col gap-1.5">
        {/* Top row: icon + kind + title + meta */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-start gap-2 min-w-0">
            <KindIcon kind={item.kind} />
              <span className={`px-2 py-0.5 rounded-md text-[11px] whitespace-nowrap ${kindTone[item.kind]}`}>{t(`ah.filter.${item.kind}`)}</span>
            {item.impact && (
              <span className={`px-1.5 py-0.5 rounded-md text-[11px] whitespace-nowrap ${severityTone[item.impact]}`} title={`Impact: ${item.impact}`}>{item.impact.toUpperCase()}</span>
            )}
            <div className="min-w-0">
              <div className="truncate font-medium" title={item.label}>{item.label}</div>
              <div className="opacity-70 text-[11px] truncate">
                {item.date ? `${relTime(item.date)} • ${new Date(item.date).toLocaleDateString()}` : (item.meta || '')}
              </div>
            </div>
          </div>
        </div>
        {/* Bottom row: chips on left, CTAs on right */}
        <div className="flex items-center justify-between gap-1.5 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {item.status && (
              <span
                title={item.status==='offer' ? 'Offer: propuesta enviada' : item.status==='pending' ? 'Pending: a la espera de confirmación' : 'Confirmed: confirmado'}
                className={`px-1.5 py-0.5 rounded ${statusTone[item.status] || 'bg-white/10'}`}
              >{t(`finance.${item.status}`)}</span>
            )}
            {typeof item.amount==='number' && (
              <span className="px-1.5 py-0.5 rounded bg-white/5 tabular-nums text-right min-w-[64px] text-[11px]">{fmtMoney(item.amount)}</span>
            )}
            {item.city && <span className="px-1.5 py-0.5 rounded bg-white/5">{item.city}</span>}
          </div>
          <div className="flex items-center gap-1.5 relative flex-wrap">
              {/* SLA chip + select checkbox */}
              <span className="px-1.5 py-0.5 rounded bg-white/5 text-[11px] tabular-nums">
                {item.date ? relTime(item.date) : (item.meta || '')}
              </span>
              <label className="inline-flex items-center gap-1 text-[11px] opacity-80">
                <input type="checkbox" className="accent-current" checked={selected} onChange={onToggleSelected} aria-label={t('shows.selectRow')} />
                <span className="sr-only">Select</span>
              </label>
            <button className="text-[11px] px-2.5 py-0.5 rounded-md bg-accent-500/90 text-black hover:bg-accent-400" onClick={()=>{ trackEvent('ah.cta.primary', { kind: item.kind, id: item.id }); onPrimary(); }} aria-label={ctaLabel}>{ctaLabel}</button>
            {item.kind==='opportunity' && (
              <Link
                to={`/dashboard/travel?create=1&showId=${encodeURIComponent(item.id)}`}
                onMouseEnter={()=>prefetchByPath('/dashboard/travel')}
                className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10"
              >{t('ah.cta.addTravel')}</Link>
            )}
            {item.kind==='risk' && (
              <button className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10" onClick={()=>{ trackEvent('ah.cta.reminder', { id: item.id }); doReminder(); }}>Send invoice reminder</button>
            )}
            {item.kind==='offer' && (
              <button className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10" onClick={()=>{ trackEvent('ah.cta.proposal', { id: item.id }); doProposal(); }}>Send proposal</button>
            )}
            <button className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10" aria-label={t('common.centerMap')} onClick={()=> onCenter(item)}>{t('common.centerMap')}</button>
            {/* Why popover */}
            <WhyPopover item={item} />
            <button
              className="text-[11px] w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 grid place-items-center"
              aria-haspopup="menu"
              aria-expanded={open}
              aria-controls={menuId}
              ref={triggerRef}
              onClick={()=>{ setOpen(v=>!v); trackEvent('ah.menu.toggle', { open: !open }); setTimeout(()=> menuFirstRef.current?.focus(), 0); }}
              onBlur={(e)=>{
                // close when focus leaves the button and menu
                const related = e.relatedTarget as Node | null;
                const menu = document.getElementById(menuId);
                if (menu && related && menu.contains(related)) return; // keep open if focusing inside menu
                setTimeout(()=> setOpen(false), 0);
              }}
            >⋯</button>
            {open && (
              <div id={menuId} role="menu" className="absolute right-0 top-8 z-10 bg-ink-800/95 border border-white/10 rounded-md shadow-lg p-1 text-[11px] min-w-[170px]" tabIndex={-1}
                onBlur={(e)=>{ const btn = (e.relatedTarget as HTMLElement | null); if (!btn || !btn.closest('[aria-haspopup=\"menu\"]')) { setOpen(false); setTimeout(()=> triggerRef.current?.focus(), 0); } }}
              >
                <button ref={menuFirstRef} className="w-full text-left px-2 py-0.5 rounded hover:bg-white/10" onClick={()=>{ trackEvent('ah.snooze', { days: 7, id: item.id }); snooze(7); }}>{t('common.snooze7')}</button>
                <button className="w-full text-left px-2 py-0.5 rounded hover:bg-white/10" onClick={()=>{ trackEvent('ah.snooze', { days: 30, id: item.id }); snooze(30); }}>{t('common.snooze30')}</button>
                <div className="my-1 h-px bg-white/10" />
                <button className="w-full text-left px-2 py-0.5 rounded hover:bg-white/10" onClick={()=>{ onMarkDone(item.dismissKey); setOpen(false); triggerRef.current?.focus(); }}>{t('ah.markDone')||'Mark done'}</button>
                <button className="w-full text-left px-2 py-0.5 rounded hover:bg-white/10" onClick={()=>{ onHide(item.dismissKey); setOpen(false); triggerRef.current?.focus(); }}>{t('ah.hide')||'Hide'}</button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </li>
  );
});

const WhyPopover: React.FC<{ item: HubAction }> = ({ item }) => {
  const [open, setOpen] = React.useState(false);
  const btnRef = React.useRef<HTMLButtonElement|null>(null);
  const id = React.useId();
  const { fmtMoney } = useSettings();
  useEffect(()=>{
    if (!open) return; const onKey=(e:KeyboardEvent)=>{ if (e.key==='Escape') { setOpen(false); btnRef.current?.focus(); } }; document.addEventListener('keydown', onKey); return ()=> document.removeEventListener('keydown', onKey);
  }, [open]);
  const days = item.date ? Math.round((+new Date(item.date) - Date.now())/86400000) : undefined;
  return (
    <div className="relative inline-block">
      <button ref={btnRef} className="text-[11px] px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/15" aria-expanded={open} aria-controls={id} onClick={()=> setOpen(o=>!o)}>{t('ah.why')||'Why?'}</button>
      {open && (
        <div id={id} role="dialog" className="absolute right-0 top-8 z-10 bg-ink-800/95 border border-white/10 rounded-md shadow-lg p-2 text-[11px] min-w-[220px]">
          <div className="font-semibold mb-1">{t('ah.why.title')||'Why this priority?'}</div>
          <ul className="list-disc pl-4 space-y-0.5">
            <li>{t('ah.why.score')||'Score'}: {Math.round(item.score)}</li>
            {item.impact && <li>{t('ah.why.impact')||'Impact'}: {String(item.impact).toUpperCase()}</li>}
            {typeof item.amount==='number' && <li>{t('ah.why.amount')||'Amount'}: {fmtMoney(item.amount)}</li>}
            {typeof days==='number' && <li>{days>=0 ? t('ah.why.inDays')||'In days' : t('ah.why.overdue')||'Overdue'}: {Math.abs(days)}d</li>}
            <li>{t('ah.why.kind')||'Type'}: {t(`ah.filter.${item.kind}`)}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

const ShowRow: React.FC<{ item: DemoShow }> = React.memo(({ item }) => {
  const { fmtMoney } = useSettings();
  return (
    <li className="text-[12px]" role="listitem">
      <Card className="px-3 py-1.5 flex items-center justify-between">
        <div className="flex flex-col"><span className="font-medium">{item.city}</span><span className="opacity-60 text-[11px]">{new Date(item.date).toLocaleDateString()}</span></div>
        <div className="flex items-center gap-2.5">
          <span className="tabular-nums text-[12px]">{fmtMoney(item.fee || 0)}</span>
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-accent-500/70 text-black">{t(`finance.${item.status}`)}</span>
        </div>
      </Card>
    </li>
  );
});

type SimpleTravel = { id:string; date:string; title:string; status?: string };
const TravelRow: React.FC<{ item: SimpleTravel }> = React.memo(({ item }) => (
  <li className="text-[12px]" role="listitem">
    <Card className="px-3 py-1.5 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
  <div className="flex flex-col"><span className="font-medium">{item.title}</span><span className="opacity-60 text-[11px]">{new Date(item.date).toLocaleString()}</span></div>
  <span className="px-2 py-0.5 rounded-md bg-white/10 text-[11px]">{item.status || 'Planned'}</span>
      </div>
    </Card>
  </li>
));

const InsightCard: React.FC<{ title:string; metric:string }> = ({ title, metric }) => {
  // Deterministic per-title seed to avoid flicker; persist once per session
  const key = `ac:insight:${title}`;
  const [bars] = React.useState<number[]>(() => {
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch {}
    // simple LCG-based deterministic pseudo-random seeded from title
    let seed = 0; for (let i=0;i<title.length;i++) seed = (seed*31 + title.charCodeAt(i)) >>> 0;
    const next = () => { seed = (1103515245 * seed + 12345) >>> 0; return (seed % 100) / 100; };
    const arr = Array.from({length:8}, (_,i)=> 10 + Math.round(next()*70));
    try { sessionStorage.setItem(key, JSON.stringify(arr)); } catch {}
    return arr;
  });
  return (
    <Card className="p-2.5 flex flex-col gap-1 text-[12px]">
      <span className="font-semibold text-[12px]" style={{color:'var(--text-primary)'}}>{title}</span>
      <span className="opacity-70 text-[11px]" style={{color:'var(--text-secondary)'}}>{metric}</span>
      <div className="h-8 w-full flex items-end gap-0.5">
        {bars.map((h,i)=>(<span key={i} className="flex-1 bg-gradient-to-t from-accent-500/20 to-accent-500/70 rounded-sm" style={{height:`${h}%`}} />))}
      </div>
    </Card>
  );
};

const SkeletonList: React.FC<{ count:number }> = ({ count }) => (
  <ul className="space-y-2" aria-hidden="true">
    {Array.from({length:count}).map((_,i)=>(
      <li key={i} className="h-6 rounded-md bg-white/5 animate-pulse" />
    ))}
  </ul>
);

const SkeletonCards: React.FC<{ count:number }> = ({ count }) => (
  <div className="grid gap-3 sm:grid-cols-2" aria-hidden="true">
    {Array.from({length:count}).map((_,i)=>(
      <div key={i} className="h-20 rounded-md bg-white/5 animate-pulse" />
    ))}
  </div>
);

export default ActionHub;
