import React, { useEffect, useRef } from 'react';
import { TimedEvent, useEventLayout } from '../../hooks/useEventLayout';
import EventChip from './EventChip';
import type { CalEvent } from './types';
import { t } from '../../lib/i18n';

type Props = {
  day: string; // YYYY-MM-DD
  events: CalEvent[];
  onOpen: (ev: CalEvent) => void;
  tz?: string;
};

const DayGrid: React.FC<Props> = ({ day, events, onOpen, tz }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const timed: TimedEvent[] = events.filter(e=> !e.allDay && e.start && e.end).map(e=> ({ id: e.id, start: new Date(e.start!), end: new Date(e.end!) }));
  const layout = useEventLayout(timed);
  const nowRef = useRef<HTMLDivElement|null>(null);
  useEffect(()=>{
    const tick = () => {
      const now = new Date();
      // Compare today using tz if provided
      const parts = (()=>{
        try {
          const p = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' })
            .formatToParts(now)
            .reduce<Record<string,string>>((acc,p)=>{ if (p.type!=='literal') acc[p.type]=p.value; return acc; }, {});
          if (p.year && p.month && p.day) return `${p.year}-${p.month}-${p.day}`;
        } catch {}
        return now.toISOString().slice(0,10);
      })();
      if (parts !== day) return;
      let minutes: number;
      try {
        const partsHM = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false })
          .formatToParts(now)
          .reduce<Record<string,string>>((acc,p)=>{ if (p.type!=='literal') acc[p.type]=p.value; return acc; }, {});
        const hh = parseInt(partsHM.hour || String(now.getHours()), 10);
        const mm = parseInt(partsHM.minute || String(now.getMinutes()), 10);
        minutes = hh*60 + mm;
      } catch {
        minutes = now.getHours()*60 + now.getMinutes();
      }
      const top = (minutes/ (24*60)) * 100; // percent
      if (nowRef.current) nowRef.current.style.top = `calc(${top}% + 2rem)`;
    };
    tick();
    const id = setInterval(tick, 60*1000);
    return ()=> clearInterval(id);
  }, [day, tz]);

  return (
  <div className="glass rounded-xl overflow-hidden border border-white/10" role="grid" aria-label="Day">
      <div className="grid" style={{ gridTemplateColumns: '80px 1fr' }}>
        <div></div>
        <div className="px-2 py-2 text-sm border-b border-white/10" role="columnheader" aria-label={new Date(day).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', timeZone: tz })} aria-current={(()=>{ try { const now = new Date(); const p = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now).reduce<Record<string,string>>((acc,p)=>{ if (p.type!=='literal') acc[p.type]=p.value; return acc; }, {}); const today = p.year&&p.month&&p.day? `${p.year}-${p.month}-${p.day}` : now.toISOString().slice(0,10); return today===day ? 'date' : undefined; } catch { return undefined; } })()}>
          {new Date(day).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', timeZone: tz })}
        </div>
        <div>
          {hours.map(h => (
            <div key={h} className="h-16 border-b border-white/[0.06] text-[11px] pr-2 text-right opacity-70">{String(h).padStart(2,'0')}:00</div>
          ))}
        </div>
  <div className="relative" role="gridcell" aria-label={`${new Date(day).toLocaleDateString(undefined, { weekday: 'long', timeZone: tz })} ${parseInt(day.slice(-2))}, ${events.length} ${events.length===1?(t('calendar.event.one')||'event'):(t('calendar.event.many')||'events')}`}>
          {(()=>{ try { const now = new Date(); const p = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now).reduce<Record<string,string>>((acc,p)=>{ if (p.type!=='literal') acc[p.type]=p.value; return acc; }, {}); const today = p.year&&p.month&&p.day? `${p.year}-${p.month}-${p.day}` : now.toISOString().slice(0,10); return today===day; } catch { return false; } })() && (
            <div ref={nowRef} className="absolute left-0 right-0 h-[1px] bg-accent-500/70" />
          )}
          {layout.map((l) => {
            const e = timed.find(te=> te.id===l.id)!;
            const startM = e.start.getHours()*60 + e.start.getMinutes();
            const endM = e.end.getHours()*60 + e.end.getMinutes();
            const top = (startM/(24*60))*100;
            const height = Math.max(2, ((endM-startM)/(24*60))*100);
            const width = 100 / l.columns;
            const left = l.column * width;
            const weekEv = events.find(it=> it.id===l.id)!;
            return (
              <div key={l.id} className="absolute px-1" style={{ top: `calc(${top}% + 2rem)`, height: `calc(${height}% - 2px)`, left: `${left}%`, width: `${width}%` }}>
                <EventChip title={weekEv.title} kind={weekEv.kind} status={weekEv.status} city={weekEv.kind==='show' ? weekEv.title.split(',')[0] : undefined} startIso={weekEv.start} endIso={weekEv.end} meta={weekEv.meta} />
              </div>
            );
          })}
          <div className="px-2 py-1 space-y-1">
            {events.filter(e=> e.allDay || !e.start || !e.end).map(ev => (
              <EventChip key={ev.id} title={ev.title} kind={ev.kind} status={ev.status} city={ev.kind==='show' ? ev.title.split(',')[0] : undefined} onClick={()=> onOpen(ev)} meta={ev.meta} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayGrid;
