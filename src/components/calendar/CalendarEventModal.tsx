/**
 * 📅 CALENDAR EVENT MODAL
 * 
 * Modal específico para crear/editar eventos de calendario (no shows)
 * Incluye todos los campos necesarios para meetings, rehearsals, breaks, etc.
 * Diseño consistente con ShowEventModal y TravelFlightModal
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarEventType, CalendarEventInput } from '../../services/calendarEventService';
import { useToast } from '../../context/ToastContext';

interface CalendarEventModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CalendarEventInput) => Promise<void>;
  onDelete?: (eventId: string) => Promise<void>;
  initialData?: Partial<CalendarEventInput & { id?: string }>;
  initialType?: CalendarEventType;
  initialDate?: string;
}

const eventTypeLabels: Record<CalendarEventType, { label: string; icon: React.ReactNode }> = {
  meeting: { 
    label: 'Meeting', 
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
  },
  rehearsal: { 
    label: 'Rehearsal', 
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
  },
  break: { 
    label: 'Break', 
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  },
  other: { 
    label: 'Other Event', 
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
  },
  travel: { 
    label: 'Travel', 
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
  }
};

const colorOptions = [
  { value: 'accent', label: 'Accent', color: 'bg-accent-500' },
  { value: 'green', label: 'Green', color: 'bg-green-500' },
  { value: 'red', label: 'Red', color: 'bg-red-500' },
  { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
  { value: 'yellow', label: 'Yellow', color: 'bg-yellow-500' },
  { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
] as const;

const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  initialType = 'other',
  initialDate
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const [formData, setFormData] = useState<CalendarEventInput & { id?: string }>({
    type: initialType,
    title: '',
    date: initialDate || new Date().toISOString().slice(0, 10),
    time: '',
    timeEnd: '',
    location: '',
    description: '',
    attendees: [],
    color: 'accent',
  });

  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && initialData) {
      setFormData({
        id: initialData.id,
        type: initialData.type || initialType,
        title: initialData.title || '',
        date: initialData.date || initialDate || new Date().toISOString().slice(0, 10),
        dateEnd: initialData.dateEnd,
        time: initialData.time || '',
        timeEnd: initialData.timeEnd || '',
        location: initialData.location || '',
        description: initialData.description || '',
        attendees: initialData.attendees || [],
        color: initialData.color || 'accent',
      });
      setTimeout(() => firstFieldRef.current?.focus(), 100);
    } else if (open) {
      setFormData({
        type: initialType,
        title: '',
        date: initialDate || new Date().toISOString().slice(0, 10),
        time: '',
        timeEnd: '',
        location: '',
        description: '',
        attendees: [],
        color: 'accent',
      });
      setTimeout(() => firstFieldRef.current?.focus(), 100);
    }
  }, [open, initialData, initialType, initialDate]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting && !isSaving) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, isDeleting, isSaving]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      toast.warning('Title is required');
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!formData.id || !onDelete) return;
    
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    setIsDeleting(true);
    try {
      await onDelete(formData.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDeleting && !isSaving) {
      onClose();
    }
  };

  const currentEventType = eventTypeLabels[formData.type];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
          />
          <motion.div
            ref={dialogRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            onClick={handleBackdropClick}
          >
            <motion.div
              className="relative rounded-[10px] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col glass border border-[var(--card-border)] [box-shadow:var(--card-shadow)]"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className="px-6 py-4 border-b border-[var(--card-border)] flex items-center justify-between flex-shrink-0"
                style={{
                  background: 'linear-gradient(to right, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03))',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-accent-500/20 border border-accent-500/30 flex items-center justify-center text-accent-400">
                    {currentEventType.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {formData.id ? 'Edit Event' : `New ${currentEventType.label}`}
                    </h2>
                    <p className="text-sm text-white/60">
                      {formData.date} {formData.time && `· ${formData.time}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  disabled={isDeleting || isSaving}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white disabled:opacity-50"
                  aria-label="Close dialog"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <form id="calendar-event-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-5">
                  {/* Event Type Selector */}
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Event Type
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {(Object.entries(eventTypeLabels) as [CalendarEventType, typeof eventTypeLabels[CalendarEventType]][]).map(([type, config]) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, type }))}
                          className={`p-3 rounded-lg border text-center transition-all ${
                            formData.type === type
                              ? 'bg-accent-500/20 border-accent-500/50 text-accent-400'
                              : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex justify-center mb-1">{config.icon}</div>
                          <div className="text-xs font-medium">{config.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label htmlFor="event-title" className="block text-sm font-medium text-white/90 mb-2">
                      Title <span className="text-accent-400">*</span>
                    </label>
                    <input
                      ref={firstFieldRef}
                      id="event-title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500/50 transition-all"
                      placeholder="Enter event title"
                      required
                    />
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="event-date" className="block text-sm font-medium text-white/90 mb-2">
                        Date <span className="text-accent-400">*</span>
                      </label>
                      <input
                        id="event-date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500/50 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="event-date-end" className="block text-sm font-medium text-white/90 mb-2">
                        End Date
                      </label>
                      <input
                        id="event-date-end"
                        type="date"
                        value={formData.dateEnd || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, dateEnd: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500/50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Time Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="event-time" className="block text-sm font-medium text-white/90 mb-2">
                        Start Time
                      </label>
                      <input
                        id="event-time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500/50 transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="event-time-end" className="block text-sm font-medium text-white/90 mb-2">
                        End Time
                      </label>
                      <input
                        id="event-time-end"
                        type="time"
                        value={formData.timeEnd}
                        onChange={(e) => setFormData(prev => ({ ...prev, timeEnd: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500/50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label htmlFor="event-location" className="block text-sm font-medium text-white/90 mb-2">
                      Location
                    </label>
                    <input
                      id="event-location"
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500/50 transition-all"
                      placeholder="Event location or venue"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="event-description" className="block text-sm font-medium text-white/90 mb-2">
                      Description
                    </label>
                    <textarea
                      id="event-description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500/50 transition-all resize-none"
                      placeholder="Add notes or description"
                    />
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Color
                    </label>
                    <div className="flex gap-2">
                      {colorOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, color: option.value as any }))}
                          className={`w-10 h-10 rounded-lg ${option.color} transition-all ${
                            formData.color === option.value
                              ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0f1419] scale-110'
                              : 'opacity-60 hover:opacity-100 hover:scale-105'
                          }`}
                          aria-label={option.label}
                          title={option.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </form>

              {/* Footer */}
              <div
                className="px-6 py-4 border-t border-[var(--card-border)] flex items-center justify-between flex-shrink-0 bg-white/2"
              >
                  <div>
                    {formData.id && onDelete && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isDeleting || isSaving}
                        className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete Event'}
                      </button>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isDeleting || isSaving}
                      className="px-5 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      form="calendar-event-form"
                      disabled={isDeleting || isSaving || !formData.title?.trim()}
                      className="px-5 py-2.5 text-sm font-medium text-white bg-accent-500 hover:bg-accent-600 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent-500/30"
                    >
                      {isSaving ? 'Saving...' : formData.id ? 'Save Changes' : 'Create Event'}
                    </button>
                  </div>
                </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CalendarEventModal;