import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { prefetchByPath } from '../../routes/prefetch';
import { useMissionControl } from '../../context/MissionControlContext';
import { Chip } from '../../ui/Chip';
import { Card } from '../../ui/Card';
import { announce } from '../../lib/announcer';
import StatusBadge from '../../ui/StatusBadge';
import { t } from '../../lib/i18n';
import { regionOf } from '../../features/shows/selectors';
import { useSettings } from '../../context/SettingsContext';
import { useShows } from '../../hooks/useShows';
import { fetchItinerariesCached, type Itinerary } from '../../services/travelApi';

const makeViews = () => ([
  { id: 'upcoming', label: t('hud.view.whatsnext'), desc: t('hud.view.whatsnext.desc') },
]);

export const MissionHud: React.FC = () => {
  const { view, setView, setFocus, layers, toggleLayer } = useMissionControl() as any;
  const views = makeViews();
  // Use unfiltered shows (region-only), not date-range limited, so What's Next can include early next month
  const { shows: allShows } = useShows();
  const { fmtMoney, region } = useSettings();
  const shows = useMemo(() => region==='all' ? allShows : allShows.filter(s => regionOf(s.country) === region), [allShows, region]);
  const [itins, setItins] = useState<Itinerary[]>([]);

  // Load confirmed itineraries for the next 3 weeks (prototype data). If none, we'll fallback to shows.
  useEffect(() => {
    let mounted = true; const ac = new AbortController();
    const DAY = 86400000; const now = Date.now();
    const from = new Date(now).toISOString().slice(0,10);
    const to = new Date(now + 21*DAY).toISOString().slice(0,10);
    const timer = setTimeout(async () => {
      try {
        const { data } = await fetchItinerariesCached({ from, to, team: 'all' }, { signal: ac.signal, ttlMs: 2*60*1000 });
        if (mounted) setItins(data.filter(i => String(i.status||'').toLowerCase() === 'confirmed'));
      } catch (e:any) { /* swallow */ }
    }, 120);
    return () => { mounted = false; ac.abort(); clearTimeout(timer); };
  }, []);

  const onKeyTabs = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowRight','ArrowLeft','Home','End'].includes(e.key)) return;
    e.preventDefault();
    const order = views.map(v=>v.id);
    let idx = order.indexOf(view);
    if (e.key==='ArrowRight') idx = (idx + 1) % order.length;
    if (e.key==='ArrowLeft') idx = (idx - 1 + order.length) % order.length;
    if (e.key==='Home') idx = 0;
    if (e.key==='End') idx = order.length -1;
    const next = order[idx] as any;
    setView(next);
    announce(`View changed to ${views.find(v=>v.id===next)?.label ?? next}`);
  };

  // Build a daily agenda grouped by day and city. Primary source: confirmed itineraries; fallback: upcoming shows.
  type AgendaItem = { date: string; title: string; city: string };
  type AgendaGroup = { day: string; rel: string; groups: Array<{ city: string; items: AgendaItem[] }> };
  const agenda = useMemo<AgendaGroup[]>(() => {
    const DAY = 86400000; const now = Date.now();
    const windowDays = [21, 45];
    // Merge sources: prefer itineraries; otherwise search shows with widening window; as a last resort, take next few upcoming regardless of window.
    let source: AgendaItem[] = [];
    if (itins.length) {
      source = itins.map(it => ({ date: it.date, title: it.title || 'Trip', city: it.city || '—' }));
    } else {
      // Try region-filtered shows within windows
      for (const days of windowDays) {
        const end = now + days*DAY;
        const within = (shows as any[])
          .filter((s: any) => { const t = new Date(s.date).getTime(); return t >= now && t <= end; })
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map((s: any) => ({ date: s.date, title: (s.name || (s.venue) || s.city || 'Show'), city: s.city || '—' }));
        if (within.length) { source = within; break; }
      }
      // If still empty, ignore region and take next few upcoming shows globally
      if (!source.length) {
        const global = (allShows as any[])
          .filter((s: any) => new Date(s.date).getTime() >= now)
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 8)
          .map((s: any) => ({ date: s.date, title: (s.name || (s.venue) || s.city || 'Show'), city: s.city || '—' }));
        source = global;
      }
    }
    if (!source.length) return [];
    // Group by day, then by city
    const byDay = new Map<string, AgendaItem[]>();
    for (const it of source) {
      const d = new Date(it.date);
      const day = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().slice(0,10);
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day)!.push(it);
    }
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
    const dayKeys = Array.from(byDay.keys()).sort();
    const out: AgendaGroup[] = [];
    for (const day of dayKeys) {
      const items = byDay.get(day)!.slice().sort((a,b)=> new Date(a.date).getTime() - new Date(b.date).getTime());
      const byCity = new Map<string, AgendaItem[]>();
      for (const it of items) { const c = it.city || '—'; if (!byCity.has(c)) byCity.set(c, []); byCity.get(c)!.push(it); }
      const groups = Array.from(byCity.entries()).map(([city, items]) => ({ city, items }));
      const diffDays = Math.round((new Date(day).getTime() - Date.now()) / 86400000);
      out.push({ day, rel: rtf.format(diffDays, 'day'), groups });
    }
    return out;
  }, [itins, shows]);

  const rtf = useMemo(()=> new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' }), []);
  const rel = (iso:string) => { const diff = new Date(iso).getTime() - Date.now(); return rtf.format(Math.round(diff/86400000), 'day'); };

  const nextShow = useMemo(()=>{
    const now = Date.now();
    const upcoming = shows.filter(s => new Date(s.date).getTime() >= now);
    // Prefer active pipeline statuses
    const primary = upcoming.filter(s => ['confirmed','pending','offer'].includes(s.status));
    const base = (primary.length? primary : upcoming.filter(s=> s.status==='postponed'))
      .sort((a,b)=> new Date(a.date).getTime() - new Date(b.date).getTime());
    return base[0] || null;
  }, [shows]);

  const safeView = views.some(v=>v.id===view) ? view : 'upcoming';

  return (
    <Card className="p-3 flex flex-col gap-3 text-[12px]" aria-label="Mission HUD">
      <div className="flex flex-wrap gap-1.5 text-[12px]" role="tablist" aria-label={t('hud.views')} onKeyDown={onKeyTabs}>
        {views.map((v) => {
          const id = `hud-tab-${v.id}`;
          const panelId = `hud-panel-${v.id}`;
          const Icon = ({ id }: { id: string }) => (
            <span aria-hidden className="w-4 h-4 mr-1.5 inline-grid place-items-center">
              {id==='upcoming' && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-90">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <path d="M16 2v4M8 2v4M3 10h18"/>
                  <circle cx="16" cy="16" r="3"/>
                  <path d="M16 14v2l1 1"/>
                </svg>
              )}
            </span>
          );
          return (
            <Chip
              key={v.id}
              id={id}
              role="tab"
              aria-controls={panelId}
              tabIndex={safeView===v.id?0:-1}
              aria-selected={safeView === v.id}
              onClick={() => { setView(v.id as any); announce(`${t('hud.viewChanged')} ${v.label}`); }}
              size="sm"
              variant={safeView===v.id ? 'solid' : 'ghost'}
              tone={safeView===v.id ? 'accent' : 'default'}
              active={safeView===v.id}
              title={`${v.label} — ${v.desc}`}
              aria-label={`${v.label}. ${v.desc}`}
            >
              <Icon id={v.id} />
              {v.label}
            </Chip>
          );
        })}
      </div>

  <div className="flex flex-wrap gap-1.5 text-[12px] items-center">
        <div className="flex-1" />
        <button
          className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20"
          disabled={!nextShow}
          onClick={() => {
            if (!nextShow) return;
            setFocus({ id: nextShow.id, lng: nextShow.lng, lat: nextShow.lat });
            const date = new Date(nextShow.date).toLocaleDateString();
            announce(`${t('common.centerMap')}: ${nextShow.city}, ${date}`);
          }}
          title={t('common.centerMap')}
          aria-label={t('common.centerMap')}
        >{t('common.centerMap')}</button>
        {/* Quick layer toggles */}
        <div className="inline-flex items-center gap-1">
          <button
            className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20"
            onClick={() => { try { toggleLayer('route'); announce(`${t('map.toggle.route')}`); } catch {} }}
            title={t('map.toggle.route')}
            aria-label={t('map.toggle.route')}
          >{t('hud.layer.route')}: {layers?.route ? t('common.on') : t('common.off')}</button>
        </div>
        {/* Risks entry */}
        <button
          className="px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-100 hover:bg-rose-500/30"
          onClick={() => { announce(t('hud.risks')); }}
          title={t('hud.risks')}
          aria-label={t('hud.risks')}
        >{t('hud.risks')}</button>
      </div>

      <div>
        {views.map(v => {
          const panelId = `hud-panel-${v.id}`; const tabId = `hud-tab-${v.id}`;
          return (
            <section key={v.id} id={panelId} role="tabpanel" aria-labelledby={tabId} hidden={safeView!==v.id} aria-label={v.label} className="space-y-2 focus:outline-none">
              <h3 className="text-[12px] font-semibold tracking-tight" style={{color:'var(--text-primary)'}}>{v.label}</h3>
              <p className="text-[11px] opacity-70" style={{color:'var(--text-secondary)'}}>{v.desc}</p>
              {v.id === 'upcoming' && (
                <div className="text-[12px] space-y-2" aria-label={t('hud.next3weeks')}>
                  {/* Mini legend */}
                  <div className="flex items-center gap-3 text-[11px] opacity-75">
                    <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"/> {t('hud.layer.status')}: {t('finance.confirmed')}</span>
                    <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"/> {t('finance.pending')}</span>
                    <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block"/> {t('finance.offer')}</span>
                  </div>
                  {agenda.map(day => (
                    <div key={day.day} className="border border-white/10 rounded-md overflow-hidden">
                      <div className="px-2 py-1 bg-white/5 flex items-center justify-between">
                        <span className="font-medium">{new Date(day.day + 'T00:00:00').toLocaleDateString()}</span>
                        <span className="opacity-70">{day.rel}</span>
                      </div>
                      <ul className="divide-y divide-white/5">
                        {day.groups.map(g => {
                          const match = (shows as any[]).find(s => s.city === g.city);
                          const canPin = !!match;
                          return (
                            <li key={g.city} className="p-2">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="px-1 py-0.5 rounded bg-white/10 whitespace-nowrap text-[11px]">{g.city}</span>
                                  <div className="truncate opacity-80 text-[12px]">{g.items.map(it => new Date(it.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })).join(' · ')} — {g.items.map(it => it.title).join(' · ')}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button className="text-[11px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50" disabled={!canPin} onClick={()=>{
                                    if (!match) return; setFocus({ id: match.id, lng: match.lng, lat: match.lat });
                                    announce(`${t('common.centerMap')}: ${match.city}`);
                                  }}>{t('common.centerMap')}</button>
                                  <button className="text-[11px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20" onClick={()=>{
                                    // stub: assign a producer; announce only for now
                                    announce(`${t('hud.assignProducer')}: ${g.city}`);
                                  }}>{t('hud.assignProducer')}</button>
                                  <Link to="/dashboard/travel" onMouseEnter={()=>prefetchByPath('/dashboard/travel')} className="text-[11px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10">{t('hud.openTrip')}</Link>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                  {agenda.length===0 && (
                    <div className="text-[12px] opacity-70">{t('hud.noTrips3weeks')}</div>
                  )}
                </div>
              )}
            </section>
          );})}
      </div>
    </Card>
  );
};

export default MissionHud;
