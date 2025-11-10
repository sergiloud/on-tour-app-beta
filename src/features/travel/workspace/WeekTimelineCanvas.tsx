import React, { useEffect, useMemo, useState } from 'react';
import { t } from '../../../lib/i18n';
import type { FlightResult } from '../providers/types';
import FlightResultCard from '../components/SmartFlightSearch/FlightResultCard';
import { showStore } from '../../../shared/showStore';
import { getCurrentOrgId } from '../../../lib/tenants';

export type WeekTimelineCanvasProps = {
  grouped?: Record<string, FlightResult[]>;
  results: FlightResult[]; // fallback
  pinnedIds: Set<string>;
  onAdd: (r: FlightResult) => void;
  onPin: (r: FlightResult) => void;
};

function fmtDayLabel(iso: string) {
  const d = new Date(iso);
  const wd = d.toLocaleDateString(undefined, { weekday: 'short' });
  const day = d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
  return `${wd}\n${day}`;
}

const WeekTimelineCanvas: React.FC<WeekTimelineCanvasProps> = ({ grouped, results, pinnedIds, onAdd, onPin }) => {
  const days = useMemo(() => {
    if (grouped && Object.keys(grouped).length) {
      const keys = Object.keys(grouped).sort();
      if (keys.length <= 7) return keys;
      // limit to 7 centered around median
      const mid = Math.floor(keys.length / 2);
      const start = Math.max(0, mid - 3);
      return keys.slice(start, start + 7);
    }
    // No grouping (single day) -> derive day from first result
    if (results.length) {
      const firstResult = results[0];
      if (firstResult) {
        const date = firstResult.dep.slice(0, 10);
        return [date];
      }
    }
    return [] as string[];
  }, [grouped, results]);

  // Build base mapping and id->base date
  const baseByDate: Record<string, FlightResult[]> = useMemo(() => {
    const map: Record<string, FlightResult[]> = {};
    if (grouped && Object.keys(grouped).length) {
      for (const k of Object.keys(grouped)) {
        const group = grouped[k];
        if (group) map[k] = group.slice();
      }
    } else {
      for (const r of results) {
        const d = r.dep.slice(0, 10);
        (map[d] ||= []).push(r);
      }
    }
    return map;
  }, [grouped, results]);
  const baseOf: Record<string, string> = useMemo(() => {
    const m: Record<string, string> = {};
    for (const [d, list] of Object.entries(baseByDate)) {
      for (const r of list) m[r.id] = d;
    }
    return m;
  }, [baseByDate]);

  // What-if placements (id -> date)
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const placeOn = (id: string, date: string) => setPlacements(p => ({ ...p, [id]: date }));
  const clearPlacement = (id: string) => setPlacements(p => { const c = { ...p }; delete c[id]; return c; });

  // Shows for rest-time hints
  const [orgId, setOrgId] = useState<string>(() => { try { return getCurrentOrgId(); } catch { return ''; } });
  useEffect(() => {
    const onTenant = (e: Event) => {
      try { const id = (e as CustomEvent).detail?.id as string | undefined; setOrgId(id || getCurrentOrgId()); } catch { setOrgId(getCurrentOrgId()); }
    };
    window.addEventListener('tenant:changed' as any, onTenant);
    return () => window.removeEventListener('tenant:changed' as any, onTenant);
  }, []);
  const shows = useMemo(() => showStore.getAll().filter((s: any) => !s.tenantId || s.tenantId === orgId).slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [orgId]);
  const nextShowAfter = (isoDate: string): Date | null => {
    const ts = new Date(isoDate).getTime();
    for (const s of shows) { if (new Date(s.date).getTime() >= ts) return new Date(s.date); }
    return null;
  };
  const restHint = (dropDate: string) => {
    const next = nextShowAfter(dropDate + 'T00:00:00Z');
    if (!next) return null;
    const diffH = (next.getTime() - new Date(dropDate + 'T00:00:00Z').getTime()) / 36e5;
    if (diffH <= 0) return 'same_day';
    if (diffH < 12) return 'short';
    return null;
  };

  // Compute items per rendered day applying placements
  const itemsForDay = (date: string): FlightResult[] => {
    const out: FlightResult[] = [];
    const placedHere = Object.entries(placements).filter(([, d]) => d === date).map(([id]) => id);
    // add placed items
    for (const [id, d] of Object.entries(placements)) {
      if (d !== date) continue;
      const baseDate = baseOf[id];
      const src = baseDate ? baseByDate[baseDate] : undefined;
      const it = src?.find(r => r.id === id) || results.find(r => r.id === id);
      if (it) out.push(it);
    }
    // add base items not moved away
    const base = baseByDate[date] || [];
    for (const r of base) {
      if ((placements[r.id] && placements[r.id] !== date)) continue; // moved away
      out.push(r);
    }
    return out;
  };

  const [ariaMsg, setAriaMsg] = useState<string>('');
  const onDragStart = (e: React.DragEvent, id: string) => { e.dataTransfer.setData('text/plain', id); };
  const onDropOn = (e: React.DragEvent, date: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;
    placeOn(id, date);
    setAriaMsg(`${t('common.moved') || 'Moved'} → ${date}`);
  };
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); };

  if (!days.length) {
    return (
      <div className="text-center py-10">
        <p className="text-sm opacity-70">{t('common.noResults')}</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-lg p-3">
      <div className="mb-2 text-xs opacity-80" aria-hidden>
        {t('travel.workspace.timeline')}
      </div>
      <div className="sr-only" aria-live="polite">{ariaMsg}</div>
      <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
        {days.map(date => (
          <div
            key={date}
            className="rounded bg-slate-100 dark:bg-white/5 p-2 min-h-[120px]"
            onDrop={(e) => onDropOn(e, date)}
            onDragOver={onDragOver}
            aria-dropeffect="move"
          >
            <div className="text-[11px] font-semibold opacity-80 whitespace-pre leading-tight mb-2">
              {fmtDayLabel(date)}
            </div>
            {/* Column results with basic DnD and rest hints */}
            <div className="space-y-2">
              {itemsForDay(date).map(r => (
                <div key={r.id} draggable onDragStart={(e) => onDragStart(e, r.id)} aria-grabbed={false}>
                  <FlightResultCard r={r} onAdd={onAdd} onPin={onPin} pinned={pinnedIds?.has(r.id)} />
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[10px] opacity-60">{t('travel.drop.hint') || 'Drag to another day'}</span>
                    <div className="inline-flex gap-1">
                      <button className="text-[10px] px-1 py-0.5 rounded bg-slate-200 dark:bg-white/10" onClick={() => {
                        const idx = days.indexOf(date);
                        const prevDay = days[idx - 1];
                        if (idx > 0 && prevDay) placeOn(r.id, prevDay);
                      }} aria-label={t('travel.move.prev') || 'Move to previous day'}>◀︎</button>
                      <button className="text-[10px] px-1 py-0.5 rounded bg-slate-200 dark:bg-white/10" onClick={() => {
                        const idx = days.indexOf(date);
                        const nextDay = days[idx + 1];
                        if (idx < days.length - 1 && nextDay) placeOn(r.id, nextDay);
                      }} aria-label={t('travel.move.next') || 'Move to next day'}>▶︎</button>
                    </div>
                  </div>
                  {/* Rest hint */}
                  {(() => {
                    const hint = restHint(date); if (!hint) return null; return (
                      <div className={`mt-1 text-[11px] ${hint === 'same_day' ? 'text-amber-300' : 'text-amber-200'}`}>
                        {hint === 'same_day' ? (t('travel.rest.same_day') || 'Same-day show risk') : (t('travel.rest.short') || 'Short rest before next show')}
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekTimelineCanvas;
