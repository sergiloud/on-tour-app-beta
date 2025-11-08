import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { t } from '../../lib/i18n';
import { Show } from '../../lib/api/services/shows';
import { Itinerary } from '../../services/travelApi';

interface EventEditorModalProps {
  open: boolean;
  event: (Show & { kind: 'show' }) | (Itinerary & { kind: 'travel' }) | null;
  onClose: () => void;
  onSave: (event: Show | Itinerary) => Promise<void>;
}

const EventEditorModal: React.FC<EventEditorModalProps> = ({ open, event, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && event) {
      if (event.kind === 'show') {
        setTitle(event.city || '');
        setDescription('');
        setLocation('');
      } else {
        setTitle(event.title || '');
        setDescription(event.description || '');
        setLocation((event as any).location || '');
      }
      setTimeout(() => titleRef.current?.focus(), 100);
    }
  }, [open, event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !event) return;

    setIsSaving(true);
    try {
      const updated = event.kind === 'show'
        ? { ...event, city: title.trim() }
        : { ...event, title: title.trim(), description: description.trim(), location: location.trim() };

      await onSave(updated);
      onClose();
    } catch (err) {
      console.error('Failed to save event:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const eventTypeLabel = event?.kind === 'show'
    ? 'Show'
    : (event && 'btnType' in event)
    ? (event.btnType?.charAt(0).toUpperCase() + event.btnType?.slice(1)) || 'Event'
    : 'Event';

  const buttonColor = ((event && 'buttonColor' in event ? event.buttonColor : undefined) || 'emerald') as string;
  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    emerald: { bg: 'bg-emerald-500/25', text: 'text-emerald-100', border: 'border-emerald-500/40' },
    amber: { bg: 'bg-amber-500/25', text: 'text-amber-100', border: 'border-amber-500/40' },
    sky: { bg: 'bg-sky-500/25', text: 'text-sky-100', border: 'border-sky-500/40' },
    rose: { bg: 'bg-rose-500/25', text: 'text-rose-100', border: 'border-rose-500/40' },
    purple: { bg: 'bg-purple-500/25', text: 'text-purple-100', border: 'border-purple-500/40' },
    cyan: { bg: 'bg-cyan-500/25', text: 'text-cyan-100', border: 'border-cyan-500/40' },
  };

  const colors = colorClasses[buttonColor];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="relative rounded-xl border border-white/15 shadow-2xl w-full max-w-2xl bg-gradient-to-br from-white/5 via-white/3 to-transparent backdrop-blur-xl max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, type: 'spring', stiffness: 350, damping: 30 }}
          >
            {/* Header */}
            <div className="sticky top-0 px-6 py-6 border-b border-white/10 flex items-start justify-between bg-gradient-to-b from-white/4 to-transparent backdrop-blur-sm">
              <div className="flex-1">
                <h2 className="text-base font-bold text-white tracking-tight">Edit Event</h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${colors?.bg || 'bg-emerald-500/25'} ${colors?.text || 'text-emerald-100'} border ${colors?.border || 'border-emerald-500/40'}`}>
                    {eventTypeLabel}
                  </div>
                  {event && (
                    <span className="text-xs text-white/60">
                      {event.kind === 'show' ? event.date : event.date}
                    </span>
                  )}
                </div>
              </div>
              <motion.button
                type="button"
                onClick={onClose}
                className="ml-4 p-1.5 rounded-md hover:bg-white/10 transition-colors flex-shrink-0"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
              >
                <svg className="w-5 h-5 text-white/50 hover:text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
              {/* Title */}
              <div className="flex flex-col gap-2">
                <label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-white/70">
                  Event Name <span className="text-red-400">*</span>
                </label>
                <input
                  ref={titleRef}
                  id="title"
                  type="text"
                  maxLength={80}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={event?.kind === 'show' ? 'e.g., Barcelona, Madrid...' : 'e.g., Team Meeting, Bus Tour...'}
                  className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/20 hover:border-white/30 focus:border-accent-500/50 focus:bg-white/10 transition-all placeholder:text-white/30 text-white text-sm focus:outline-none"
                />
                <div className="flex justify-between">
                  <span className="text-[10px] text-white/50">
                    {event?.kind === 'show' ? 'City or venue name' : 'Event title or name'}
                  </span>
                  <span className="text-[10px] text-white/50">{title.length}/80</span>
                </div>
              </div>

              {/* Description (only for non-show events) */}
              {event?.kind !== 'show' && (
                <div className="flex flex-col gap-2">
                  <label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-white/70">
                    Description
                  </label>
                  <textarea
                    id="description"
                    maxLength={500}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add notes, details, or additional information about this event..."
                    rows={4}
                    className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/20 hover:border-white/30 focus:border-accent-500/50 focus:bg-white/10 transition-all placeholder:text-white/30 text-white text-sm focus:outline-none resize-none"
                  />
                  <div className="flex justify-between">
                    <span className="text-[10px] text-white/50">Add any additional details about this event</span>
                    <span className="text-[10px] text-white/50">{description.length}/500</span>
                  </div>
                </div>
              )}

              {/* Location (only for non-show events) */}
              {event?.kind !== 'show' && (
                <div className="flex flex-col gap-2">
                  <label htmlFor="location" className="text-xs font-semibold uppercase tracking-wider text-white/70">
                    Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    maxLength={100}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Studio A, Grand Hall, Conference Room 3..."
                    className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/20 hover:border-white/30 focus:border-accent-500/50 focus:bg-white/10 transition-all placeholder:text-white/30 text-white text-sm focus:outline-none"
                  />
                  <div className="flex justify-between">
                    <span className="text-[10px] text-white/50">Venue, room, or place where the event occurs</span>
                    <span className="text-[10px] text-white/50">{location.length}/100</span>
                  </div>
                </div>
              )}

              {/* Event Info */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-1">Date</p>
                  <p className="text-sm text-white/80">
                    {event && new Date(event.date).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                {event?.kind === 'show' && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-1">Status</p>
                    <p className="text-sm text-white/80 capitalize">{(event as Show).status || 'pending'}</p>
                  </div>
                )}
                {event?.kind !== 'show' && 'btnType' in event && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-1">Type</p>
                    <p className="text-sm text-white/80 capitalize">{event.btnType || 'event'}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <motion.button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/20 hover:bg-white/10 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={!title.trim() || isSaving}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EventEditorModal;
