import React from 'react';
import EventChip from './EventChip';
import { t } from '../../lib/i18n';
import type { CalEvent } from './types';

type Props = {
  eventsByDay: Map<string, CalEvent[]>;
  onOpen: (ev: CalEvent) => void;
};

const AgendaList: React.FC<Props> = ({ eventsByDay, onOpen }) => {
  const days = Array.from(eventsByDay.keys()).sort();
  if (days.length === 0) {
    return <div className="glass rounded-lg p-4 text-sm opacity-70">{t('calendar.noEvents') || 'No events for this day'}</div>;
  }
  return (
    <div className="glass rounded-lg p-2">
      <ul className="divide-y divide-white/10">
        {days.map(d => {
          const list = (eventsByDay.get(d) || []) as CalEvent[];
          const shows = list.filter(e=> e.kind==='show');
          const travel = list.filter(e=> e.kind==='travel');
          return (
            <li key={d} className="py-2 px-2">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs opacity-70">{new Date(d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                <div className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 border border-white/15">
                  {list.length} {list.length===1 ? (t('calendar.event.one')||'event') : (t('calendar.event.many')||'events')}
                </div>
              </div>
              <div className="space-y-1">
                {shows.length>0 && (
                  <div className="mt-1">
                    <div className="text-[11px] uppercase tracking-wide opacity-70">{t('calendar.show.shows')||'Shows'} • {shows.length}</div>
                    <div className="space-y-1 mt-1">
                      {shows.map(ev => (
                        <EventChip key={ev.id} title={ev.title} kind={ev.kind} status={ev.status} onClick={()=> onOpen(ev)} meta={ev.meta} />
                      ))}
                    </div>
                  </div>
                )}
                {travel.length>0 && (
                  <div className="mt-2">
                    <div className="text-[11px] uppercase tracking-wide opacity-70">{t('calendar.show.travel')||'Travel'} • {travel.length}</div>
                    <div className="space-y-1 mt-1">
                      {travel.map(ev => (
                        <EventChip key={ev.id} title={ev.title} kind={ev.kind} status={ev.status} onClick={()=> onOpen(ev)} meta={ev.meta} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AgendaList;
