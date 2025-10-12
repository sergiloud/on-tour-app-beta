import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Map as MapIcon, Calendar, Plane } from 'lucide-react';
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
  const shows = useMemo(() => region === 'all' ? allShows : allShows.filter(s => regionOf(s.country) === region), [allShows, region]);
  const [itins, setItins] = useState<Itinerary[]>([]);

  // Load confirmed itineraries for the next 3 weeks (prototype data). If none, we'll fallback to shows.
  useEffect(() => {
    let mounted = true; const ac = new AbortController();
    const DAY = 86400000; const now = Date.now();
    const from = new Date(now).toISOString().slice(0, 10);
    const to = new Date(now + 21 * DAY).toISOString().slice(0, 10);
    const timer = setTimeout(async () => {
      try {
        const { data } = await fetchItinerariesCached({ from, to, team: 'all' }, { signal: ac.signal, ttlMs: 2 * 60 * 1000 });
        if (mounted) setItins(data.filter(i => String(i.status || '').toLowerCase() === 'confirmed'));
      } catch (e: any) { /* swallow */ }
    }, 120);
    return () => { mounted = false; ac.abort(); clearTimeout(timer); };
  }, []);

  const onKeyTabs = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const order = views.map(v => v.id);
    let idx = order.indexOf(view);
    if (e.key === 'ArrowRight') idx = (idx + 1) % order.length;
    if (e.key === 'ArrowLeft') idx = (idx - 1 + order.length) % order.length;
    if (e.key === 'Home') idx = 0;
    if (e.key === 'End') idx = order.length - 1;
    const next = order[idx] as any;
    setView(next);
    announce(`View changed to ${views.find(v => v.id === next)?.label ?? next}`);
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
        const end = now + days * DAY;
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
      const day = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().slice(0, 10);
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day)!.push(it);
    }
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
    const dayKeys = Array.from(byDay.keys()).sort();
    const out: AgendaGroup[] = [];
    for (const day of dayKeys) {
      const items = byDay.get(day)!.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const byCity = new Map<string, AgendaItem[]>();
      for (const it of items) { const c = it.city || '—'; if (!byCity.has(c)) byCity.set(c, []); byCity.get(c)!.push(it); }
      const groups = Array.from(byCity.entries()).map(([city, items]) => ({ city, items }));
      const diffDays = Math.round((new Date(day).getTime() - Date.now()) / 86400000);
      out.push({ day, rel: rtf.format(diffDays, 'day'), groups });
    }
    return out;
  }, [itins, shows]);

  const rtf = useMemo(() => new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' }), []);
  const rel = (iso: string) => { const diff = new Date(iso).getTime() - Date.now(); return rtf.format(Math.round(diff / 86400000), 'day'); };

  const nextShow = useMemo(() => {
    const now = Date.now();
    const upcoming = shows.filter(s => new Date(s.date).getTime() >= now);
    // Prefer active pipeline statuses
    const primary = upcoming.filter(s => ['confirmed', 'pending', 'offer'].includes(s.status));
    const base = (primary.length ? primary : upcoming.filter(s => s.status === 'postponed'))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return base[0] || null;
  }, [shows]);

  const safeView = views.some(v => v.id === view) ? view : 'upcoming';

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-purple-500/5">
      {/* Gradiente decorativo sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative p-5 flex flex-col gap-4" aria-label="Upcoming Agenda">
        {/* Header elegante */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-purple-500 to-blue-500" />
            <div>
              <h2 className="text-lg font-semibold tracking-tight">{t('dashboard.upcomingAgenda')}</h2>
              <p className="text-xs opacity-60 mt-0.5">{t('dashboard.nextShowsEvents')}</p>
            </div>
          </div>
          {nextShow && (
            <div className="text-xs opacity-60 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>{agenda.length} days</span>
            </div>
          )}
        </div>

        {/* Quick actions elegantes */}
        <div className="flex flex-wrap gap-2">
          <button
            className="flex-1 min-w-[110px] px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/30 hover:border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 font-medium text-xs hover:shadow-lg hover:shadow-purple-500/20"
            disabled={!nextShow}
            onClick={() => {
              if (!nextShow) return;
              setFocus({ id: nextShow.id, lng: nextShow.lng, lat: nextShow.lat });
              const date = new Date(nextShow.date).toLocaleDateString();
              announce(`${t('common.centerMap')}: ${nextShow.city}, ${date}`);
            }}
            title={t('common.centerMap')}
            aria-label={t('common.centerMap')}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Center Map</span>
          </button>

          <Link
            to="/dashboard/shows"
            className="flex-1 min-w-[110px] px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-2 font-medium text-xs hover:shadow-lg"
            onMouseEnter={() => prefetchByPath('/dashboard/shows')}
            title="View all shows"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>All Shows</span>
          </Link>

          <button
            className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-2 font-medium text-xs"
            onClick={() => { try { toggleLayer('route'); announce(`${t('map.toggle.route')}`); } catch { } }}
            title={t('map.toggle.route')}
            aria-label={t('map.toggle.route')}
          >
            <Plane className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Agenda section */}
        <div>
          {views.map(v => {
            const panelId = `hud-panel-${v.id}`; const tabId = `hud-tab-${v.id}`;
            return (
              <section key={v.id} id={panelId} role="tabpanel" aria-labelledby={tabId} hidden={safeView !== v.id} aria-label={v.label} className="space-y-3 focus:outline-none">
                {v.id === 'upcoming' && (
                  <div className="text-sm space-y-3" aria-label={t('hud.next3weeks')}>
                    {agenda.map(day => (
                      <div key={day.day} className="group border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-colors">
                        <div className="px-4 py-2.5 bg-gradient-to-r from-white/5 to-transparent flex items-center justify-between">
                          <span className="font-semibold text-sm">{new Date(day.day + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-white/10 font-medium">{day.rel}</span>
                        </div>
                        <ul className="divide-y divide-white/5">
                          {day.groups.map(g => {
                            const match = (shows as any[]).find(s => s.city === g.city);
                            const canPin = !!match;
                            return (
                              <li key={g.city} className="p-3">
                                <div className="flex flex-col gap-2">
                                  {/* Ciudad y detalles */}
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 rounded bg-white/10 whitespace-nowrap text-sm font-medium">{g.city}</span>
                                    <div className="truncate opacity-80 text-sm flex-1">
                                      {g.items.map(it => new Date(it.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })).join(' · ')} — {g.items.map(it => it.title).join(' · ')}
                                    </div>
                                  </div>
                                  {/* Acciones */}
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <button
                                      className="text-xs px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50 flex items-center gap-1"
                                      disabled={!canPin}
                                      onClick={() => {
                                        if (!match) return;
                                        setFocus({ id: match.id, lng: match.lng, lat: match.lat });
                                        announce(`${t('common.centerMap')}: ${match.city}`);
                                      }}
                                    >
                                      <MapPin className="w-3 h-3" />
                                      {t('common.centerMap')}
                                    </button>
                                    <Link
                                      to="/dashboard/travel"
                                      onMouseEnter={() => prefetchByPath('/dashboard/travel')}
                                      className="text-xs px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 flex items-center gap-1"
                                    >
                                      <Plane className="w-3 h-3" />
                                      {t('hud.openTrip')}
                                    </Link>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                    {agenda.length === 0 && (
                      <div className="text-center py-8 text-sm opacity-70">
                        <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <div>{t('hud.noTrips3weeks') || 'No upcoming events in the next 3 weeks'}</div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MissionHud;
