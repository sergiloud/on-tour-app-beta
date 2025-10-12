import React, { useEffect, useMemo, useRef } from 'react';
import type { TimedEvent } from '../../hooks/useEventLayout';
import { computeEventLayout } from '../../hooks/useEventLayout';
import EventChip from './EventChip';
import type { CalEvent } from './types';
import { t } from '../../lib/i18n';

type Props = {
  weekStart: string; // Monday as YYYY-MM-DD
  eventsByDay: Map<string, CalEvent[]>;
  tz?: string;
  onOpen: (ev: CalEvent) => void;
};

const hours = Array.from({ length: 24 }, (_, i) => i);

const WeekGrid: React.FC<Props> = ({ weekStart, eventsByDay, tz, onOpen }) => {
  const days = useMemo(()=>{
    const start = new Date(weekStart);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start); d.setDate(d.getDate()+i);
      return d.toISOString().slice(0,10);
    });
  }, [weekStart]);

  const nowRef = useRef<HTMLDivElement|null>(null);
  const todayTz = useMemo(()=>{
    try {
      const now = new Date();
      const parts = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' })
        .formatToParts(now)
        .reduce<Record<string,string>>((acc,p)=>{ if (p.type!=='literal') acc[p.type]=p.value; return acc; }, {});
      if (parts.year && parts.month && parts.day) return `${parts.year}-${parts.month}-${parts.day}`;
    } catch {}
    return new Date().toISOString().slice(0,10);
  }, [tz]);
  useEffect(()=>{
    const tick = () => {
      const now = new Date();
      let minutes: number;
      if (tz) {
        try {
          const parts = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false })
            .formatToParts(now)
            .reduce<Record<string,string>>((acc,p)=>{ if (p.type!=='literal') acc[p.type]=p.value; return acc; }, {});
          const hh = parseInt(parts.hour || String(now.getHours()), 10);
          const mm = parseInt(parts.minute || String(now.getMinutes()), 10);
          minutes = hh*60 + mm;
        } catch {
          minutes = now.getHours()*60 + now.getMinutes();
        }
      } else {
        minutes = now.getHours()*60 + now.getMinutes();
      }
      const top = (minutes/ (24*60)) * 100; // percent of day
      if (nowRef.current) nowRef.current.style.top = `calc(${top}% + 2rem)`; // + header height
    };
    tick();
    const id = setInterval(tick, 60*1000);
    return ()=> clearInterval(id);
  }, []);

  return (
  <div className="glass rounded-xl overflow-hidden border border-white/10" role="grid" aria-label="Week">
      <div className="grid" style={{ gridTemplateColumns: '80px repeat(7, 1fr)' }}>
        {/* Header */}
        <div></div>
        {days.map(d => {
          const isToday = d === todayTz;
          return (
            <div
              key={d}
              className={`px-2 py-2 text-sm border-b border-white/10 ${isToday ? 'ring-1 ring-accent-500/60 rounded-sm' : ''}`}
              role="columnheader"
              aria-label={new Date(d).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', timeZone: tz })}
              aria-current={isToday ? 'date' : undefined}
            >
              {new Date(d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', timeZone: tz })}
            </div>
          );
        })}
        {/* Body */}
        <div className="relative">
          {hours.map(h => (
            <div key={h} className="h-16 border-b border-white/[0.06] text-[11px] pr-2 text-right opacity-70">{String(h).padStart(2,'0')}:00</div>
          ))}
        </div>
        {days.map(d => {
          const items = (eventsByDay.get(d) || []) as CalEvent[];
          // naive conversion: map to timed events if start/end present else allDay
          const timed: TimedEvent[] = items.filter(e=> !e.allDay && e.start && e.end).map(e=> ({ id: e.id, start: new Date(e.start!), end: new Date(e.end!) }));
          // compute layout for overlapping timed events
          const layout = computeEventLayout(timed);
          return (
            <div key={d} className="relative" role="gridcell" aria-label={`${new Date(d).toLocaleDateString(undefined, { weekday: 'long', timeZone: tz })} ${parseInt(d.slice(-2))}, ${items.length} ${items.length===1?(t('calendar.event.one')||'event'):(t('calendar.event.many')||'events')}`}>
              {/* working hours highlight */}
              <div className="absolute inset-x-0" style={{ top: 'calc(9 * 4rem + 2rem)', height: 'calc(9 * 4rem)' }} aria-hidden />
              {/* now line across column if same day */}
              {d === todayTz && (
                <div ref={nowRef} className="absolute left-0 right-0 h-[1px] bg-accent-500/70" />
              )}
              {/* events (timed) */}
              {layout.map((l, idx) => {
                const e = timed.find(te=> te.id===l.id)!;
                const startM = e.start.getHours()*60 + e.start.getMinutes();
                const endM = e.end.getHours()*60 + e.end.getMinutes();
                const top = (startM/(24*60))*100;
                const height = Math.max(2, ((endM-startM)/(24*60))*100);
                const width = 100 / l.columns;
                const left = l.column * width;
                const weekEv = items.find(it=> it.id===l.id)!;
                return (
                  <div key={l.id} className="absolute px-1" style={{ top: `calc(${top}% + 2rem)`, height: `calc(${height}% - 2px)`, left: `${left}%`, width: `${width}%` }}>
                    <EventChip title={weekEv.title} kind={weekEv.kind} status={weekEv.status} city={weekEv.kind==='show' ? weekEv.title.split(',')[0] : undefined} startIso={weekEv.start} endIso={weekEv.end} meta={weekEv.meta} />
                  </div>
                );
              })}
              {/* all-day events row */}
              <div className="px-2 py-1 space-y-1">
                {items.filter(e=> e.allDay || !e.start || !e.end).map(ev => (
                  <EventChip key={ev.id} title={ev.title} kind={ev.kind} status={ev.status} city={ev.kind==='show' ? ev.title.split(',')[0] : undefined} onClick={()=> onOpen(ev)} meta={ev.meta} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekGrid;
