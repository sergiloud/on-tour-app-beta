import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CalendarEvent, getEventDateRange, colorMap, getEventsForDay } from './AdvancedCalendarTypes';

interface TimelineViewProps {
  events: CalendarEvent[];
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  onEventClick: (event: CalendarEvent) => void;
  density?: 'compact' | 'normal' | 'spacious';
}

/**
 * Timeline view for calendar - shows events in chronological order
 * Great for planning tours with a clear sequential view
 */
export const TimelineView: React.FC<TimelineViewProps> = ({
  events,
  from,
  to,
  onEventClick,
  density = 'normal',
}) => {
  const sortedEvents = useMemo(() => {
    return [...events]
      .filter((e) => {
        const eventFrom = e.date;
        const eventTo = e.endDate || e.date;
        return eventFrom <= to && eventTo >= from;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events, from, to]);

  const paddingMap = {
    compact: 'py-2',
    normal: 'py-3',
    spacious: 'py-4',
  };

  const textSizeMap = {
    compact: 'text-xs',
    normal: 'text-sm',
    spacious: 'text-base',
  };

  // Group events by date for visual clustering
  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, CalendarEvent[]>();
    sortedEvents.forEach((event) => {
      const key = event.date;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(event);
    });
    return grouped;
  }, [sortedEvents]);

  const dateKeys = Array.from(eventsByDate.keys()).sort();

  return (
    <motion.div className="space-y-3 md:space-y-4">
      {dateKeys.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-8 text-center rounded-xl bg-gradient-to-br from-white/6 to-white/3 border border-white/10 backdrop-blur-md shadow-lg"
        >
          <p className="text-white/50 text-sm font-medium">No events in this period</p>
        </motion.div>
      ) : (
        dateKeys.map((dateKey, dateIdx) => {
          const dayEvents = eventsByDate.get(dateKey) || [];
          const date = new Date(dateKey);
          const isToday =
            dateKey === new Date().toISOString().slice(0, 10);

          return (
            <motion.div
              key={dateKey}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dateIdx * 0.08 }}
              className={`glass rounded-xl border backdrop-blur-md px-3.5 md:px-4 py-3.5 md:py-4 shadow-lg transition-all duration-300 ${
                isToday
                  ? 'bg-gradient-to-br from-white/15 to-white/8 border-accent-500/40 ring-1 ring-accent-500/20'
                  : 'bg-gradient-to-br from-white/6 to-white/3 border-white/10 hover:border-white/20'
              }`}
            >
              {/* Date Header */}
              <div className="flex items-center justify-between gap-3 mb-3 md:mb-3.5">
                <div>
                  <p className={`text-sm md:text-base font-semibold tracking-tight ${isToday ? 'text-accent-300' : 'text-white/90'}`}>
                    {date.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: dateIdx === 0 ? 'numeric' : undefined,
                    })}
                  </p>
                  {isToday && (
                    <motion.span
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="inline-block mt-1 px-2.5 py-0.5 rounded-full
                        bg-accent-500/25 border border-accent-500/40
                        text-accent-200 text-xs font-semibold"
                    >
                      Today
                    </motion.span>
                  )}
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold text-xs text-center ${
                    isToday
                      ? 'bg-accent-500/20 text-accent-200 border border-accent-500/30'
                      : 'bg-white/10 text-white/70 border border-white/15'
                  }`}
                >
                  {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
                </motion.div>
              </div>

              {/* Events for this day - grouped by type */}
              <div className="space-y-2.5">
                {/* Shows first */}
                {dayEvents.filter(e => e.kind === 'show').length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider font-semibold text-white/50 mb-1.5 pl-1">Shows</p>
                    <div className="space-y-2">
                      {dayEvents.filter(e => e.kind === 'show').map((event, eventIdx) => {
                        const dateRange = getEventDateRange(event);
                        const isMultiDay = dateRange.length > 1;
                        const isFirst = dateRange[0] === dateKey;
                        const isLast = dateRange[dateRange.length - 1] === dateKey;

                        return (
                          <motion.button
                            key={event.id}
                            onClick={() => onEventClick(event)}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: (dateIdx * 0.08) + (eventIdx * 0.03),
                            }}
                            whileHover={{ scale: 1.01, y: -1 }}
                            whileTap={{ scale: 0.99 }}
                            className={`w-full text-left p-2.5 md:p-3 rounded-lg border backdrop-blur-sm transition-all duration-200 group
                              bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-emerald-600/8
                              border-emerald-500/25 hover:border-emerald-500/40 hover:shadow-lg
                              hover:bg-gradient-to-r hover:from-emerald-500/20 hover:via-emerald-500/15 hover:to-emerald-600/12`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm md:text-base font-semibold text-white truncate group-hover:text-emerald-100 transition">
                                  {event.title}
                                  {event.pinned && <span className="ml-1">📌</span>}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap mt-1">
                                  {event.city && (
                                    <span className="text-xs text-white/70">
                                      {event.city}
                                    </span>
                                  )}
                                  {event.status && (
                                    <span
                                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium
                                      ${event.status === 'confirmed'
                                        ? 'bg-green-500/25 text-green-200'
                                        : event.status === 'cancelled'
                                          ? 'bg-red-500/25 text-red-200'
                                          : 'bg-yellow-500/25 text-yellow-200'
                                      }`}
                                    >
                                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                    </span>
                                  )}
                                  {isMultiDay && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full
                                      bg-blue-500/25 text-blue-200 font-medium">
                                      {isFirst && !isLast
                                        ? 'Starts'
                                        : isLast && !isFirst
                                          ? 'Ends'
                                          : 'Continues'}{' '}
                                      ({dateRange.length}d)
                                    </span>
                                  )}
                                </div>
                                {event.notes && (
                                  <p className="text-xs text-white/50 mt-1.5 line-clamp-2">
                                    {event.notes}
                                  </p>
                                )}
                              </div>
                              <div className="text-white/30 group-hover:text-white/60 transition text-lg mt-0.5 flex-shrink-0">
                                →
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Travel */}
                {dayEvents.filter(e => e.kind === 'travel').length > 0 && (
                  <div className={dayEvents.filter(e => e.kind === 'show').length > 0 ? 'mt-2.5 pt-2.5 border-t border-white/10' : ''}>
                    <p className="text-xs uppercase tracking-wider font-semibold text-white/50 mb-1.5 pl-1">Travel</p>
                    <div className="space-y-2">
                      {dayEvents.filter(e => e.kind === 'travel').map((event, eventIdx) => {
                        const dateRange = getEventDateRange(event);
                        const isMultiDay = dateRange.length > 1;
                        const isFirst = dateRange[0] === dateKey;
                        const isLast = dateRange[dateRange.length - 1] === dateKey;

                        return (
                          <motion.button
                            key={event.id}
                            onClick={() => onEventClick(event)}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: (dateIdx * 0.08) + (dayEvents.filter(e => e.kind === 'show').length * 0.03) + (eventIdx * 0.03),
                            }}
                            whileHover={{ scale: 1.01, y: -1 }}
                            whileTap={{ scale: 0.99 }}
                            className={`w-full text-left p-2.5 md:p-3 rounded-lg border backdrop-blur-sm transition-all duration-200 group
                              bg-gradient-to-r from-sky-500/15 via-sky-500/10 to-sky-600/8
                              border-sky-500/25 hover:border-sky-500/40 hover:shadow-lg
                              hover:bg-gradient-to-r hover:from-sky-500/20 hover:via-sky-500/15 hover:to-sky-600/12`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm md:text-base font-semibold text-white truncate group-hover:text-sky-100 transition">
                                  {event.title}
                                  {event.pinned && <span className="ml-1">📌</span>}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap mt-1">
                                  {event.city && (
                                    <span className="text-xs text-white/70">
                                      {event.city}
                                    </span>
                                  )}
                                  {isMultiDay && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full
                                      bg-blue-500/25 text-blue-200 font-medium">
                                      {isFirst && !isLast
                                        ? 'Starts'
                                        : isLast && !isFirst
                                          ? 'Ends'
                                          : '→ Continues'}{' '}
                                      ({dateRange.length}d)
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-white/30 group-hover:text-white/60 transition text-lg mt-0.5 flex-shrink-0">
                                →
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })
      )}
    </motion.div>
  );
};
