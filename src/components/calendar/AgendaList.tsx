import React from 'react';
import { motion } from 'framer-motion';
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
    return (
      <motion.div
        className="glass rounded-lg p-3 md:p-4 text-xs opacity-70 hover:opacity-100 transition-all duration-300"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {t('calendar.noEvents') || 'No events for this day'}
      </motion.div>
    );
  }
  return (
    <motion.div
      className="space-y-3 md:space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {days.map((d, index) => {
        const list = (eventsByDay.get(d) || []) as CalEvent[];
        const shows = list.filter(e=> e.kind==='show');
        const travel = list.filter(e=> e.kind==='travel');
        const date = new Date(d);
        const isToday = d === new Date().toISOString().slice(0, 10);

        return (
          <motion.div
            key={d}
            className={`glass rounded-xl border backdrop-blur-md p-3.5 md:p-4 transition-all duration-200 ${
              isToday
                ? 'bg-gradient-to-br from-white/15 to-white/8 border-accent-500/40 shadow-lg'
                : 'bg-gradient-to-br from-white/6 to-white/3 border-white/10 hover:border-white/20 shadow-sm'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.01, transition: { duration: 0.15 } }}
          >
            {/* Date header */}
            <div className="flex items-center justify-between mb-3 md:mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="text-sm md:text-base font-semibold text-white">
                  {date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                {isToday && (
                  <span className="inline-block px-2 py-0.5 rounded-md bg-accent-500/20 border border-accent-500/40 text-[9px] md:text-[10px] font-semibold text-accent-200">
                    {t('common.today') || 'Today'}
                  </span>
                )}
              </div>
              <div className="text-[9px] md:text-[10px] px-2 py-1 rounded-lg bg-white/10 border border-white/15 font-semibold text-white/80">
                {list.length} {list.length === 1 ? (t('calendar.event.one') || 'event') : (t('calendar.event.many') || 'events')}
              </div>
            </div>

            {/* Events */}
            <div className="space-y-3 md:space-y-3.5">
              {shows.length > 0 && (
                <div>
                  <div className="text-[10px] md:text-xs uppercase tracking-widest opacity-75 font-semibold text-white/70 mb-2">
                    {t('calendar.show.shows') || 'Shows'}
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    {shows.map((ev, idx) => (
                      <motion.div
                        key={ev.id}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.05 }}
                      >
                        <EventChip
                          title={ev.title}
                          kind={ev.kind}
                          status={ev.status}
                          onClick={() => onOpen(ev)}
                          meta={ev.meta}
                          color={ev.color}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
              {travel.length > 0 && (
                <div>
                  <div className="text-[10px] md:text-xs uppercase tracking-widest opacity-75 font-semibold text-white/70 mb-2">
                    {t('calendar.show.travel') || 'Travel'}
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    {travel.map((ev, idx) => (
                      <motion.div
                        key={ev.id}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: (shows.length * 0.05) + (idx * 0.05) }}
                      >
                        <EventChip
                          title={ev.title}
                          kind={ev.kind}
                          status={ev.status}
                          onClick={() => onOpen(ev)}
                          meta={ev.meta}
                          color={ev.color}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default React.memo(AgendaList);
