import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type EventType = 'show' | 'travel' | 'meeting' | 'rehearsal' | 'break';

export interface EventData {
  type: EventType;
  date: string;
  dateEnd?: string;
  city?: string;
  country?: string;
  title?: string;
  description?: string;
  fee?: number;
  status?: 'pending' | 'confirmed' | 'cancelled';
  time?: string;
  timeEnd?: string;
  location?: string;
  attendees?: string[];
  travelMode?: 'flight' | 'train' | 'car' | 'bus';
  origin?: string;
  destination?: string;
  confirmationCode?: string;
  departureTime?: string;
  arrivalTime?: string;
  flightNumber?: string;
  airline?: string;
  departureTerminal?: string;
  arrivalTerminal?: string;
  seat?: string;
  notes?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: EventData) => void;
  initialDate?: string;
  initialType?: EventType;
  initialData?: EventData;
}

const eventTypeConfig: Record<EventType, { label: string; description: string }> = {
  show: { label: 'Show', description: 'Performance or concert' },
  travel: { label: 'Travel', description: 'Trip or transportation' },
  meeting: { label: 'Meeting', description: 'Meeting or appointment' },
  rehearsal: { label: 'Rehearsal', description: 'Practice or rehearsal' },
  break: { label: 'Break', description: 'Time off or break' }
};

const EventCreationModal: React.FC<Props> = ({
  open,
  onClose,
  onSave,
  initialDate,
  initialType = 'show',
  initialData
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const [eventType, setEventType] = useState<EventType>(initialType);
  const defaultDate = new Date().toISOString().split('T')[0];
  const [data, setData] = useState<EventData>(
    initialData || {
      type: initialType,
      date: (initialDate ?? defaultDate) as string,
      status: 'pending'
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      const finalDate = (initialDate ?? defaultDate) as string;
      setData(
        initialData || { type: initialType, date: finalDate, status: 'pending' }
      );
      setErrors({});
      setEventType(initialType);
      setTimeout(() => firstFieldRef.current?.focus(), 0);
    }
  }, [open, initialDate, initialType, initialData, defaultDate]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    switch (eventType) {
      case 'show':
        if (!data.city?.trim()) newErrors.city = 'City is required';
        if (!data.country?.trim()) newErrors.country = 'Country is required';
        break;
      case 'travel':
        if (!data.dateEnd) newErrors.dateEnd = 'End date is required';
        if (!data.origin?.trim()) newErrors.origin = 'Origin is required';
        if (!data.destination?.trim()) newErrors.destination = 'Destination is required';
        break;
      case 'meeting':
      case 'rehearsal':
        if (!data.title?.trim()) newErrors.title = 'Title is required';
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    onSave({ ...data, type: eventType });
    onClose();
  };

  const isSaveDisabled = !Object.values(data).some(v => v) || Object.keys(errors).length > 0;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
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
              <motion.div
                className="px-6 py-4 border-b border-[var(--card-border)] flex items-center justify-between flex-shrink-0 bg-white/2"
                layout
              >
                <motion.div
                  key={`header-${eventType}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                    {eventTypeConfig[eventType].label}
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-white/60 mt-0.5">
                    {eventTypeConfig[eventType].description}
                  </p>
                </motion.div>
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-slate-200 dark:bg-white/10 transition-colors text-slate-400 dark:text-white/60 hover:text-white flex-shrink-0"
                  aria-label="Close dialog"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </motion.div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {/* Event Type Selector */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-white/80 mb-3 block uppercase tracking-wide opacity-70">
                    Event Type
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {(Object.keys(eventTypeConfig) as EventType[]).map((type) => (
                      <motion.button
                        key={type}
                        onClick={() => {
                          setEventType(type);
                          setData({ ...data, type });
                          setErrors({});
                        }}
                        className={`px-3 py-2 rounded text-xs font-medium transition-all border ${
                          eventType === type
                            ? 'bg-slate-200 dark:bg-white/10 border-slate-300 dark:border-white/20 text-white'
                            : 'bg-white/5 text-slate-500 dark:text-white/70 hover:bg-slate-200 dark:bg-white/10 border-white/10'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {eventTypeConfig[type].label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Common Date Field */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-white/80 mb-2 block uppercase tracking-wide opacity-70">
                    Start Date
                  </label>
                  <input
                    ref={firstFieldRef}
                    type="date"
                    value={data.date}
                    onChange={(e) => setData({ ...data, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-400 dark:text-white/40 focus:outline-none focus:bg-white/8 focus:border-slate-300 dark:border-white/20 transition-colors"
                  />
                </div>

                {/* Show Fields */}
                {eventType === 'show' && (
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-white/80 mb-2 block uppercase tracking-wide opacity-70">
                          City *
                        </label>
                        <input
                          type="text"
                          value={data.city || ''}
                          onChange={(e) => setData({ ...data, city: e.target.value })}
                          placeholder="Madrid"
                          className={`w-full px-3 py-2 bg-white/5 border rounded text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-400 dark:text-white/40 focus:outline-none transition-colors ${
                            errors.city
                              ? 'border-rose-500/50 focus:bg-rose-500/5 focus:border-rose-500/50'
                              : 'border-slate-200 dark:border-white/10 focus:bg-white/8 focus:border-white/20'
                          }`}
                        />
                        {errors.city && <p className="text-xs text-rose-400/80 mt-1">{errors.city}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-white/80 mb-2 block uppercase tracking-wide opacity-70">
                          Country *
                        </label>
                        <input
                          type="text"
                          value={data.country || ''}
                          onChange={(e) => setData({ ...data, country: e.target.value })}
                          placeholder="ES"
                          className={`w-full px-3 py-2 bg-white/5 border rounded text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-400 dark:text-white/40 focus:outline-none transition-colors ${
                            errors.country
                              ? 'border-rose-500/50 focus:bg-rose-500/5 focus:border-rose-500/50'
                              : 'border-slate-200 dark:border-white/10 focus:bg-white/8 focus:border-white/20'
                          }`}
                        />
                        {errors.country && <p className="text-xs text-rose-400/80 mt-1">{errors.country}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-white/80 mb-2 block uppercase tracking-wide opacity-70">
                        Venue
                      </label>
                      <input
                        type="text"
                        value={data.location || ''}
                        onChange={(e) => setData({ ...data, location: e.target.value })}
                        placeholder="e.g., Palau Sant Jordi"
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-400 dark:text-white/40 focus:outline-none focus:bg-white/8 focus:border-slate-300 dark:border-white/20 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-white/80 mb-2 block uppercase tracking-wide opacity-70">
                        Time
                      </label>
                      <input
                        type="time"
                        value={data.time || ''}
                        onChange={(e) => setData({ ...data, time: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded text-white text-sm focus:outline-none focus:bg-white/8 focus:border-slate-300 dark:border-white/20 transition-colors"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Travel Fields */}
                {eventType === 'travel' && (
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-white/80 mb-2 block uppercase tracking-wide opacity-70">
                          Departure Date *
                        </label>
                        <input
                          type="date"
                          value={data.date}
                          onChange={(e) => setData({ ...data, date: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded text-white text-sm focus:outline-none focus:bg-white/8 focus:border-slate-300 dark:border-white/20 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-white/80 mb-2 block uppercase tracking-wide opacity-70">
                          Return Date *
                        </label>
                        <input
                          type="date"
                          value={data.dateEnd || ''}
                          onChange={(e) => setData({ ...data, dateEnd: e.target.value })}
                          className={`w-full px-3 py-2 bg-white/5 border rounded text-white text-sm focus:outline-none transition-colors ${
                            errors.dateEnd
                              ? 'border-rose-500/50 focus:bg-rose-500/5 focus:border-rose-500/50'
                              : 'border-slate-200 dark:border-white/10 focus:bg-white/8 focus:border-white/20'
                          }`}
                        />
                        {errors.dateEnd && <p className="text-xs text-rose-400/80 mt-1">{errors.dateEnd}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-white/80 mb-2 block uppercase tracking-wide opacity-70">
                          Origin *
                        </label>
                        <input
                          type="text"
                          value={data.origin || ''}
                          onChange={(e) => setData({ ...data, origin: e.target.value })}
                          placeholder="Madrid"
                          className={`w-full px-3 py-2 bg-white/5 border rounded text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-400 dark:text-white/40 focus:outline-none transition-colors ${
                            errors.origin
                              ? 'border-rose-500/50 focus:bg-rose-500/5 focus:border-rose-500/50'
                              : 'border-slate-200 dark:border-white/10 focus:bg-white/8 focus:border-white/20'
                          }`}
                        />
                        {errors.origin && <p className="text-xs text-rose-400/80 mt-1">{errors.origin}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-white/80 mb-2 block uppercase tracking-wide opacity-70">
                          Destination *
                        </label>
                        <input
                          type="text"
                          value={data.destination || ''}
                          onChange={(e) => setData({ ...data, destination: e.target.value })}
                          placeholder="Barcelona"
                          className={`w-full px-3 py-2 bg-white/5 border rounded text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-400 dark:text-white/40 focus:outline-none transition-colors ${
                            errors.destination
                              ? 'border-rose-500/50 focus:bg-rose-500/5 focus:border-rose-500/50'
                              : 'border-slate-200 dark:border-white/10 focus:bg-white/8 focus:border-white/20'
                          }`}
                        />
                        {errors.destination && <p className="text-xs text-rose-400/80 mt-1">{errors.destination}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-white/80 mb-2 block uppercase tracking-wide opacity-70">
                        Travel Mode
                      </label>
                      <select
                        value={data.travelMode || 'flight'}
                        onChange={(e) => setData({ ...data, travelMode: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded text-white text-sm focus:outline-none focus:bg-white/8 focus:border-slate-300 dark:border-white/20 transition-colors"
                      >
                        <option value="flight">Flight</option>
                        <option value="train">Train</option>
                        <option value="car">Car</option>
                        <option value="bus">Bus</option>
                      </select>
                    </div>
                  </motion.div>
                )}

                {/* Meeting/Rehearsal Fields */}
                {(eventType === 'meeting' || eventType === 'rehearsal') && (
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-white/80 mb-2 block uppercase tracking-wide opacity-70">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => setData({ ...data, title: e.target.value })}
                        placeholder="Event title"
                        className={`w-full px-3 py-2 bg-white/5 border rounded text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-400 dark:text-white/40 focus:outline-none transition-colors ${
                          errors.title
                            ? 'border-rose-500/50 focus:bg-rose-500/5 focus:border-rose-500/50'
                            : 'border-slate-200 dark:border-white/10 focus:bg-white/8 focus:border-white/20'
                        }`}
                      />
                      {errors.title && <p className="text-xs text-rose-400/80 mt-1">{errors.title}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-white/80 mb-2 block uppercase tracking-wide opacity-70">
                        Location *
                      </label>
                      <input
                        type="text"
                        value={data.location || ''}
                        onChange={(e) => setData({ ...data, location: e.target.value })}
                        placeholder="Address or venue"
                        className={`w-full px-3 py-2 bg-white/5 border rounded text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-400 dark:text-white/40 focus:outline-none transition-colors ${
                          errors.location
                            ? 'border-rose-500/50 focus:bg-rose-500/5 focus:border-rose-500/50'
                            : 'border-slate-200 dark:border-white/10 focus:bg-white/8 focus:border-white/20'
                        }`}
                      />
                      {errors.location && <p className="text-xs text-rose-400/80 mt-1">{errors.location}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-white/80 mb-2 block uppercase tracking-wide opacity-70">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={data.time || ''}
                          onChange={(e) => setData({ ...data, time: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded text-white text-sm focus:outline-none focus:bg-white/8 focus:border-slate-300 dark:border-white/20 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-white/80 mb-2 block uppercase tracking-wide opacity-70">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={data.timeEnd || ''}
                          onChange={(e) => setData({ ...data, timeEnd: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded text-white text-sm focus:outline-none focus:bg-white/8 focus:border-slate-300 dark:border-white/20 transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-white/80 mb-2 block uppercase tracking-wide opacity-70">
                        Description
                      </label>
                      <textarea
                        value={data.description || ''}
                        onChange={(e) => setData({ ...data, description: e.target.value })}
                        placeholder="Add notes..."
                        rows={3}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-400 dark:text-white/40 focus:outline-none focus:bg-white/8 focus:border-slate-300 dark:border-white/20 transition-colors resize-none"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Break Fields */}
                {eventType === 'break' && (
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-white/80 mb-2 block uppercase tracking-wide opacity-70">
                        Title
                      </label>
                      <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => setData({ ...data, title: e.target.value })}
                        placeholder="Break description"
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-400 dark:text-white/40 focus:outline-none focus:bg-white/8 focus:border-slate-300 dark:border-white/20 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-white/80 mb-2 block uppercase tracking-wide opacity-70">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={data.dateEnd || ''}
                        onChange={(e) => setData({ ...data, dateEnd: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded text-white text-sm focus:outline-none focus:bg-white/8 focus:border-slate-300 dark:border-white/20 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-white/80 mb-2 block uppercase tracking-wide opacity-70">
                        Description
                      </label>
                      <textarea
                        value={data.description || ''}
                        onChange={(e) => setData({ ...data, description: e.target.value })}
                        placeholder="Notes about this break..."
                        rows={2}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-400 dark:text-white/40 focus:outline-none focus:bg-white/8 focus:border-slate-300 dark:border-white/20 transition-colors resize-none"
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <motion.div
                className="px-6 py-4 bg-white/2 border-t border-[var(--card-border)] flex items-center justify-end gap-2 flex-shrink-0"
                layout
              >
                <motion.button
                  onClick={onClose}
                  className="px-3 py-2 rounded text-sm font-medium text-slate-500 dark:text-white/70 hover:text-white hover:bg-slate-100 dark:bg-white/5 bg-transparent border border-slate-200 dark:border-white/10 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleSave}
                  disabled={false}
                  className="px-3 py-2 rounded text-sm font-medium text-white bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Save Event
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EventCreationModal;
