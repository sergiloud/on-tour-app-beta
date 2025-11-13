/**
 * 🎯 EVENT DETAIL DRAWER
 * 
 * Panel lateral compacto que coincide exactamente con el diseño del Dashboard
 * Usa los mismos patrones de TourAgenda: border-theme, gradientes sutiles, spacing consistente
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar, Clock, Users, Plane, Music, Tag, DollarSign, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { sanitizeName } from '../../lib/sanitize';

interface EventDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    id: string;
    type: 'show' | 'travel' | 'meeting' | 'rehearsal' | 'break' | 'other';
    title?: string;
    date: string;
    endDate?: string;
    city?: string;
    venue?: string;
    status?: 'confirmed' | 'pending' | 'offer';
    fee?: number;
    origin?: string;
    destination?: string;
    time?: string;
    location?: string;
    description?: string;
    color?: string;
  } | null;
}

const EventDetailDrawer: React.FC<EventDetailDrawerProps> = ({ isOpen, onClose, event }) => {
  const navigate = useNavigate();
  const { fmtMoney } = useSettings();

  if (!event) return null;

  // Configuración por tipo de evento - matches dashboard colors
  const eventConfig = {
    show: { 
      icon: Music, 
      label: 'Show',
      color: 'green'
    },
    travel: { 
      icon: Plane, 
      label: 'Travel',
      color: 'blue'
    },
    meeting: { 
      icon: Users, 
      label: 'Meeting',
      color: 'purple'
    },
    rehearsal: { 
      icon: Music, 
      label: 'Rehearsal',
      color: 'yellow'
    },
    break: { 
      icon: Clock, 
      label: 'Break',
      color: 'slate'
    },
    other: { 
      icon: Tag, 
      label: 'Event',
      color: 'accent'
    },
  };

  // Fallback to 'other' if type is undefined or unknown
  const eventType = event.type || 'other';
  const config = eventConfig[eventType] || eventConfig.other;
  const Icon = config.icon;
  const displayColor = event.color || config.color;

  const handleEditInCalendar = () => {
    navigate('/dashboard/calendar', {
      state: {
        selectedDate: event.date,
        selectedEventId: event.id,
        selectedEventType: eventType,
      }
    });
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - matches dashboard overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Drawer Panel - matches dashboard card styling */}
          <motion.div
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-gradient-to-br from-slate-950/95 to-slate-900/90 backdrop-blur-md border-l border-theme shadow-2xl z-50 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 35, stiffness: 400 }}
          >
            {/* Gradiente decorativo sutil - exactly like TourAgenda */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent-500/8 via-transparent to-transparent pointer-events-none" />

            {/* Header - matches TourAgenda header */}
            <div className="relative px-5 py-4 border-b border-theme flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Accent bar - like TourAgenda */}
                <div className={`w-1 h-6 rounded-full bg-gradient-to-b ${
                  displayColor === 'green' ? 'from-green-500 to-emerald-500' :
                  displayColor === 'blue' ? 'from-blue-500 to-cyan-500' :
                  displayColor === 'purple' ? 'from-purple-500 to-pink-500' :
                  displayColor === 'yellow' ? 'from-yellow-500 to-amber-500' :
                  displayColor === 'red' ? 'from-red-500 to-rose-500' :
                  'from-accent-500 to-blue-500'
                }`} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Icon className={`w-3 h-3 flex-shrink-0 opacity-70 ${
                      displayColor === 'green' ? 'text-green-400' :
                      displayColor === 'blue' ? 'text-blue-400' :
                      displayColor === 'purple' ? 'text-purple-400' :
                      displayColor === 'yellow' ? 'text-yellow-400' :
                      displayColor === 'red' ? 'text-red-400' :
                      'text-accent-400'
                    }`} />
                    <span className="text-[10px] font-medium uppercase tracking-wide opacity-60">
                      {config.label}
                    </span>
                    {eventType === 'show' && event.status && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide ${
                        event.status === 'confirmed' ? 'bg-green-500/25 text-green-300' :
                        event.status === 'pending' ? 'bg-amber-500/25 text-amber-300' :
                        'bg-blue-500/25 text-blue-300'
                      }`}>
                        {event.status}
                      </span>
                    )}
                  </div>
                  <h2 className={`font-semibold tracking-tight truncate ${
                    eventType === 'show' ? 'text-lg' : 'text-base'
                  }`}>
                    {sanitizeName(event.title || event.city || 'Untitled Event')}
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white flex-shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content - matches dashboard spacing */}
            <div className="relative flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {/* Date Card - matches dashboard stats card */}
              <div className="p-3 border border-theme rounded-lg bg-gradient-to-r from-white/8 to-white/[0.15] hover:border-accent-500/30 transition-fast">
                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-white/50 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] opacity-70 mb-0.5 font-medium uppercase tracking-wide">Date</div>
                    <div className="text-sm font-semibold">
                      {formatDate(event.date)}
                    </div>
                    {event.endDate && event.endDate !== event.date && (
                      <div className="text-[11px] text-slate-400 dark:text-white/60 mt-0.5">
                        → {formatDate(event.endDate)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Time - if exists */}
              {event.time && (
                <div className="p-3 border border-theme rounded-lg bg-gradient-to-r from-white/8 to-white/[0.15]">
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-white/50 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] opacity-70 mb-0.5 font-medium uppercase tracking-wide">Time</div>
                      <div className="text-sm font-semibold">{event.time}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Show-specific details */}
              {eventType === 'show' && (
                <>
                  {event.city && (
                    <div className="p-3 border border-theme rounded-lg bg-gradient-to-r from-white/8 to-white/[0.15]">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-white/50 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] opacity-70 mb-0.5 font-medium uppercase tracking-wide">Location</div>
                          <div className="text-sm font-semibold">
                            {sanitizeName(event.city)}
                          </div>
                          {event.venue && event.venue !== 'TBA' && (
                            <div className="text-[11px] text-slate-400 dark:text-white/60 mt-0.5">{sanitizeName(event.venue)}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {event.fee && event.fee > 0 && (
                    <div className="p-3 border border-theme rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
                      <div className="flex items-start gap-2.5">
                        <DollarSign className="w-4 h-4 text-green-400/60 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] opacity-60 mb-0.5 font-medium uppercase tracking-wide">Fee</div>
                          <div className="text-base font-bold bg-gradient-to-br from-green-400 to-emerald-500 bg-clip-text text-transparent">
                            {fmtMoney(event.fee)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Travel-specific details */}
              {eventType === 'travel' && (
                <div className="p-3 border border-theme rounded-lg bg-gradient-to-r from-white/8 to-white/[0.15]">
                  <div className="flex items-start gap-2.5">
                    <Plane className="w-4 h-4 text-white/50 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] opacity-70 mb-0.5 font-medium uppercase tracking-wide">Route</div>
                      <div className="text-sm font-semibold">
                        {sanitizeName(event.origin || 'Origin')} 
                        <span className="text-slate-300 dark:text-white/30 mx-1.5">→</span> 
                        {sanitizeName(event.destination || 'Destination')}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Other events location */}
              {['meeting', 'rehearsal', 'break', 'other'].includes(eventType) && event.location && (
                <div className="p-3 border border-theme rounded-lg bg-gradient-to-r from-white/8 to-white/[0.15]">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-white/50 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] opacity-70 mb-0.5 font-medium uppercase tracking-wide">Location</div>
                      <div className="text-sm font-semibold">
                        {sanitizeName(event.location)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Description - if exists */}
              {event.description && (
                <div className="p-3 border border-theme rounded-lg bg-gradient-to-r from-white/8 to-white/[0.15]">
                  <div className="text-[10px] opacity-70 mb-2 font-medium uppercase tracking-wide">Notes</div>
                  <div className="text-[11px] text-slate-400 dark:text-white/70 leading-relaxed">
                    {event.description}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions - matches dashboard buttons */}
            <div className="relative px-5 py-3 border-t border-theme flex gap-2 flex-shrink-0 bg-white/[0.02]">
              <button
                onClick={onClose}
                className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-accent-500/20 border border-theme hover:border-accent-500/30 transition-all duration-300 font-medium"
              >
                Close
              </button>
              <button
                onClick={handleEditInCalendar}
                className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-accent-500/20 hover:bg-accent-500/30 border border-accent-500/30 transition-all duration-300 font-medium flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EventDetailDrawer;
