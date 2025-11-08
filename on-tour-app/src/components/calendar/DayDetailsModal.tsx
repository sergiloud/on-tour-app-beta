import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { t } from '../../lib/i18n';
import StatusBadge from '../../ui/StatusBadge';
import { CalEvent } from './types';
import { EventType } from './EventCreationModal';

interface Props {
  open: boolean;
  day?: string; // YYYY-MM-DD
  locale?: string;
  events: CalEvent[];
  onClose: () => void;
  onCreateEvent?: (type: EventType) => void;
  onEditEvent?: (event: CalEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
  onViewDay?: () => void;
}

const eventTypeLabels: Record<string, string> = {
  show: 'Show',
  travel: 'Travel',
  meeting: 'Meeting',
  rehearsal: 'Rehearsal',
  break: 'Break'
};

const eventTypeColors: Record<string, string> = {
  show: 'from-amber-400 to-orange-500',
  travel: 'from-blue-400 to-cyan-500',
  meeting: 'from-purple-400 to-pink-500',
  rehearsal: 'from-green-400 to-emerald-500',
  break: 'from-rose-400 to-red-500'
};

const eventTypeQuickAddColors: Record<string, string> = {
  show: 'bg-amber-500/20 text-amber-100 hover:bg-amber-500/30 border-amber-500/30',
  travel: 'bg-blue-500/20 text-blue-100 hover:bg-blue-500/30 border-blue-500/30',
  meeting: 'bg-purple-500/20 text-purple-100 hover:bg-purple-500/30 border-purple-500/30',
  rehearsal: 'bg-green-500/20 text-green-100 hover:bg-green-500/30 border-green-500/30',
  break: 'bg-rose-500/20 text-rose-100 hover:bg-rose-500/30 border-rose-500/30'
};

const DayDetailsModal: React.FC<Props> = ({
  open,
  day,
  locale = 'en-US',
  events,
  onClose,
  onCreateEvent,
  onEditEvent,
  onDeleteEvent,
  onViewDay
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const eventsByType = events.reduce((acc, event) => {
    const kind = (event.kind || 'show') as string;
    if (!acc[kind]) acc[kind] = [];
    acc[kind].push(event);
    return acc;
  }, {} as Record<string, CalEvent[]>);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString(locale, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            ref={dialogRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="w-full max-w-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-6 border-b border-white/5">
                <h2 className="text-2xl font-bold text-white">{formatDate(day)}</h2>
                <p className="text-sm text-slate-400 mt-1">{events.length} events scheduled</p>
              </div>

              {/* Content */}
              <div className="px-8 py-6 max-h-[calc(100vh-280px)] overflow-y-auto">
                {/* Events by Type */}
                {Object.keys(eventTypeLabels).map((type) => {
                  const typeEvents = eventsByType[type] || [];
                  if (typeEvents.length === 0) return null;

                  return (
                    <motion.div
                      key={type}
                      className="mb-6 last:mb-0"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h3 className={`text-sm font-semibold bg-gradient-to-r ${eventTypeColors[type]} bg-clip-text text-transparent mb-3`}>
                        {eventTypeLabels[type]}
                      </h3>
                      <div className="space-y-2">
                        {typeEvents.map((event) => (
                          <motion.div
                            key={event.id}
                            className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all group"
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">{event.title}</p>
                                {event.meta && <p className="text-xs text-slate-400 mt-0.5">{event.meta}</p>}
                              </div>
                              {event.status && (
                                <StatusBadge status={event.status as any} className="flex-shrink-0">
                                  {event.status}
                                </StatusBadge>
                              )}
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {onEditEvent && (
                                  <button
                                    onClick={() => onEditEvent(event)}
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
                                    title="Edit"
                                  >
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                )}
                                {onDeleteEvent && (
                                  <button
                                    onClick={() => onDeleteEvent(event.id)}
                                    className="p-1.5 hover:bg-red-500/20 rounded-lg transition-all"
                                    title="Delete"
                                  >
                                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}

                {/* No events state */}
                {events.length === 0 && (
                  <motion.div
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <p className="text-slate-400">No events for this day</p>
                    <p className="text-xs text-slate-500 mt-1">Create one using the buttons below</p>
                  </motion.div>
                )}
              </div>

              {/* Quick Add Buttons */}
              <div className="px-8 py-5 bg-white/2 border-t border-white/5">
                <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Create Event</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {(Object.keys(eventTypeLabels) as EventType[]).map((type) => (
                    <motion.button
                      key={type}
                      onClick={() => onCreateEvent?.(type)}
                      className={`px-3 py-2.5 rounded-lg font-medium text-sm border transition-all ${eventTypeQuickAddColors[type]}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {eventTypeLabels[type]}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-4 bg-white/2 border-t border-white/5 flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-lg font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DayDetailsModal;
