import React, { useEffect, useMemo, useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
// Demo data removed: start with no shows.
import { MapPreview, type MapMarker } from '../../components/map/MapPreview';
import { t } from '../../lib/i18n';
import { Card } from '../../ui/Card';
import { trackEvent } from '../../lib/telemetry';
import { announce } from '../../lib/announcer';

// Story mode: sync finance monthly timeline with an animated route preview
const Story: React.FC = () => {
  const { monthlySeries, snapshot } = useFinance();
  type MiniShow = { id: string; city: string; date: string; lat: number; lng: number };
  const shows: MiniShow[] = useMemo(() => [], []); // clean slate
  const [idx, setIdx] = useState(() => Math.max(0, monthlySeries.months.length - 1));
  const [playing, setPlaying] = useState(true);
  const [rm, setRm] = useState(false);
  useEffect(() => {
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const on = () => setRm(!!mq.matches);
      on(); mq.addEventListener('change', on);
      return () => mq.removeEventListener('change', on);
    } catch {
      return undefined;
    }
  }, []);
  useEffect(() => {
    if (!playing || rm || monthlySeries.months.length === 0) return;
    const id = setInterval(() => setIdx(i => (i + 1) % monthlySeries.months.length), 1800);
    return () => clearInterval(id);
  }, [playing, rm, monthlySeries.months.length]);

  const monthKey = monthlySeries.months[idx] ?? '';
  const monthLabel = useMemo(() => {
    const [y, m] = (monthKey || snapshot.asOf.slice(0, 7)).split('-').map(Number);
    const d = new Date(y ?? 2024, (m ?? 1) - 1, 1);
    return d.toLocaleString(undefined, { month: 'short', year: 'numeric' });
  }, [monthKey, snapshot.asOf]);

  // Shows for the selected month (to accent)
  const monthShows = useMemo<MiniShow[]>(() => {
    if (!shows.length) return [];
    const [y, m] = (monthKey || snapshot.asOf.slice(0, 7)).split('-').map(Number);
    const year = y ?? 2024;
    const month = m ?? 1;
    return shows.filter(s => {
      const d = new Date(s.date); return d.getFullYear() === year && (d.getMonth() + 1) === month;
    });
  }, [shows, monthKey, snapshot.asOf]);
  // Visible markers are cumulative up to the selected month (story progression)
  const visibleMarkers: MapMarker[] = useMemo(() => {
    if (!shows.length) return [];
    const cutoff = monthKey || snapshot.asOf.slice(0, 7);
    const [cy, cm] = cutoff.split('-').map(Number);
    const cur = new Date(cy ?? 2024, (cm ?? 1) - 1, 1).getTime();
    return shows.filter(s => {
      const d = new Date(s.date);
      const t = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      return t <= cur;
    }).map(s => ({ id: s.id, label: s.city, lat: s.lat, lng: s.lng, accent: monthShows.some(ms => ms.id === s.id) }));
  }, [shows, monthKey, snapshot.asOf, monthShows]);
  const center = useMemo(() => {
    if (!monthShows.length) return { lat: 20, lng: 0 };
    const mid = monthShows[Math.floor(monthShows.length / 2)];
    if (!mid) return { lat: 20, lng: 0 };
    return { lat: mid.lat, lng: mid.lng };
  }, [monthShows]);

  // Announce month changes for assistive tech
  useEffect(() => {
    const count = monthShows.length;
    announce(`${monthLabel}: ${count} shows`);
  }, [monthLabel, monthShows.length]);

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold">{t('story.title')}</h2>
        <div className="flex items-center gap-2 text-xs">
          <button
            className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-slate-200 dark:bg-white/20"
            onClick={() => { trackEvent('story.toggle', { next: !playing }); setPlaying(p => !p); }}
            aria-pressed={playing}
          >{playing ? t('story.pause') : t('story.play')}</button>
          <span className="opacity-70">{monthLabel}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <Card className="p-3">
            <MapPreview
              className="h-72 md:h-96"
              center={center}
              markers={visibleMarkers}
              reduceMotion={rm}
              decorative
            />
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="p-4 space-y-3">
            <div className="text-xs opacity-80">{t('story.timeline')}</div>
            <input
              aria-label={t('story.scrub')}
              type="range"
              min={0}
              max={Math.max(0, monthlySeries.months.length - 1)}
              value={idx}
              onChange={(e) => { const next = Number(e.target.value); setIdx(next); trackEvent('story.scrub', { idx: next, month: monthlySeries.months[next] }); }}
              className="w-full"
            />
            <ul className="max-h-56 overflow-y-auto text-xs divide-y divide-slate-200 dark:divide-white/5">
              {monthlySeries.months.map((m, k) => {
                const active = k === idx;
                const net = monthlySeries.net[k] ?? 0;
                return (
                  <li key={m} className={`flex items-center justify-between py-2 ${active ? 'text-accent-300' : 'opacity-80'}`}>
                    <span>{m}</span>
                    <span className="tabular-nums">{net.toLocaleString()}</span>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Story;
