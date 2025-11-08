import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventData } from './EventCreationModal';

interface Props {
  open: boolean;
  onClose: () => void;
  initialData?: EventData;
  onSave: (data: EventData) => void;
}

const TravelFlightModal: React.FC<Props> = ({ open, onClose, initialData, onSave }) => {
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<EventData>({
    type: 'travel',
    date: initialData?.date || new Date().toISOString().slice(0, 10),
    dateEnd: initialData?.dateEnd,
    origin: initialData?.origin || '',
    destination: initialData?.destination || '',
    travelMode: initialData?.travelMode || 'flight',
    confirmationCode: initialData?.confirmationCode || '',
    departureTime: initialData?.departureTime || '',
    arrivalTime: initialData?.arrivalTime || '',
    flightNumber: initialData?.flightNumber || '',
    airline: initialData?.airline || '',
    departureTerminal: initialData?.departureTerminal || '',
    arrivalTerminal: initialData?.arrivalTerminal || '',
    seat: initialData?.seat || '',
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setTimeout(() => firstFieldRef.current?.focus(), 0);
      setErrors({});
    }
  }, [open]);

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
    if (!formData.origin?.trim()) newErrors.origin = 'Origin is required';
    if (!formData.destination?.trim()) newErrors.destination = 'Destination is required';
    if (!formData.dateEnd) newErrors.dateEnd = 'End date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSave(formData);
    onClose();
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="relative rounded-[10px] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col glass border border-[var(--card-border)] [box-shadow:var(--card-shadow)]"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <motion.div
                className="px-6 py-4 border-b border-[var(--card-border)] flex items-center justify-between flex-shrink-0 bg-white/2"
                layout
              >
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-base font-semibold text-white">
                    {initialData ? 'Edit Travel' : 'New Travel'}
                  </h2>
                  <p className="text-xs text-white/60 mt-0.5">Travel & Flight Information</p>
                </motion.div>
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white flex-shrink-0"
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
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {/* Trip Details Section */}
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wide opacity-70">Trip Details</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-white/80 mb-2 block uppercase tracking-wide opacity-70">Departure Date *</label>
                      <input
                        ref={firstFieldRef}
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm placeholder:text-white/40 focus:outline-none focus:bg-white/8 focus:border-white/20 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-white/80 mb-2 block uppercase tracking-wide opacity-70">Return Date *</label>
                      <input
                        type="date"
                        value={formData.dateEnd || ''}
                        onChange={(e) => setFormData({ ...formData, dateEnd: e.target.value })}
                        className={`w-full px-3 py-2 bg-white/5 border rounded text-white text-sm placeholder:text-white/40 focus:outline-none transition-colors ${
                          errors.dateEnd ? 'border-rose-500/50 focus:bg-rose-500/5 focus:border-rose-500/50' : 'border-white/10 focus:bg-white/8 focus:border-white/20'
                        }`}
                        required
                      />
                      {errors.dateEnd && <p className="text-xs text-rose-400/80 mt-1">{errors.dateEnd}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-white/80 mb-2 block uppercase tracking-wide opacity-70">Origin *</label>
                      <input
                        type="text"
                        value={formData.origin}
                        onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                        placeholder="Madrid"
                        className={`w-full px-3 py-2 bg-white/5 border rounded text-white text-sm placeholder:text-white/40 focus:outline-none transition-colors ${
                          errors.origin ? 'border-rose-500/50 focus:bg-rose-500/5 focus:border-rose-500/50' : 'border-white/10 focus:bg-white/8 focus:border-white/20'
                        }`}
                        required
                      />
                      {errors.origin && <p className="text-xs text-rose-400/80 mt-1">{errors.origin}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-white/80 mb-2 block uppercase tracking-wide opacity-70">Destination *</label>
                      <input
                        type="text"
                        value={formData.destination}
                        onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                        placeholder="Barcelona"
                        className={`w-full px-3 py-2 bg-white/5 border rounded text-white text-sm placeholder:text-white/40 focus:outline-none transition-colors ${
                          errors.destination ? 'border-rose-500/50 focus:bg-rose-500/5 focus:border-rose-500/50' : 'border-white/10 focus:bg-white/8 focus:border-white/20'
                        }`}
                        required
                      />
                      {errors.destination && <p className="text-xs text-rose-400/80 mt-1">{errors.destination}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/80 mb-2 block uppercase tracking-wide opacity-70">Travel Mode</label>
                    <select
                      value={formData.travelMode || 'flight'}
                      onChange={(e) => setFormData({ ...formData, travelMode: e.target.value as any })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:bg-white/8 focus:border-white/20 transition-colors"
                    >
                      <option value="flight">Flight</option>
                      <option value="train">Train</option>
                      <option value="car">Car</option>
                      <option value="bus">Bus</option>
                    </select>
                  </div>
                </motion.div>

                {/* Flight Details Section */}
                {formData.travelMode === 'flight' && (
                  <motion.div
                    className="space-y-4 pt-3 border-t border-white/10"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wide opacity-70">Flight Information</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-white/80 mb-2 block uppercase tracking-wide opacity-70">Confirmation Code</label>
                        <input
                          type="text"
                          value={formData.confirmationCode || ''}
                          onChange={(e) => setFormData({ ...formData, confirmationCode: e.target.value.toUpperCase() })}
                          placeholder="ABC123"
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm placeholder:text-white/40 focus:outline-none focus:bg-white/8 focus:border-white/20 transition-colors uppercase"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-white/80 mb-2 block uppercase tracking-wide opacity-70">Flight Number</label>
                        <input
                          type="text"
                          value={formData.flightNumber || ''}
                          onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value })}
                          placeholder="IB6840"
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm placeholder:text-white/40 focus:outline-none focus:bg-white/8 focus:border-white/20 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-white/80 mb-2 block uppercase tracking-wide opacity-70">Airline</label>
                        <input
                          type="text"
                          value={formData.airline || ''}
                          onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                          placeholder="Iberia"
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm placeholder:text-white/40 focus:outline-none focus:bg-white/8 focus:border-white/20 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-white/80 mb-2 block uppercase tracking-wide opacity-70">Seat</label>
                        <input
                          type="text"
                          value={formData.seat || ''}
                          onChange={(e) => setFormData({ ...formData, seat: e.target.value })}
                          placeholder="12A"
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm placeholder:text-white/40 focus:outline-none focus:bg-white/8 focus:border-white/20 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-white/80 mb-2 block uppercase tracking-wide opacity-70">Departure Time</label>
                        <input
                          type="time"
                          value={formData.departureTime || ''}
                          onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm placeholder:text-white/40 focus:outline-none focus:bg-white/8 focus:border-white/20 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-white/80 mb-2 block uppercase tracking-wide opacity-70">Arrival Time</label>
                        <input
                          type="time"
                          value={formData.arrivalTime || ''}
                          onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm placeholder:text-white/40 focus:outline-none focus:bg-white/8 focus:border-white/20 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-white/80 mb-2 block uppercase tracking-wide opacity-70">Departure Terminal</label>
                        <input
                          type="text"
                          value={formData.departureTerminal || ''}
                          onChange={(e) => setFormData({ ...formData, departureTerminal: e.target.value })}
                          placeholder="T1"
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm placeholder:text-white/40 focus:outline-none focus:bg-white/8 focus:border-white/20 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-white/80 mb-2 block uppercase tracking-wide opacity-70">Arrival Terminal</label>
                        <input
                          type="text"
                          value={formData.arrivalTerminal || ''}
                          onChange={(e) => setFormData({ ...formData, arrivalTerminal: e.target.value })}
                          placeholder="T2"
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm placeholder:text-white/40 focus:outline-none focus:bg-white/8 focus:border-white/20 transition-colors"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Notes Section */}
                <div className="space-y-2 pt-3 border-t border-white/10">
                  <label className="text-xs font-semibold text-white/80 block uppercase tracking-wide opacity-70">Notes</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional travel information, notes, or special requests..."
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm placeholder:text-white/40 focus:outline-none focus:bg-white/8 focus:border-white/20 transition-colors resize-none"
                    rows={3}
                  />
                </div>
              </form>

              {/* Footer */}
              <motion.div
                className="px-6 py-4 bg-white/2 border-t border-[var(--card-border)] flex items-center justify-end gap-2 flex-shrink-0"
                layout
              >
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 rounded text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 bg-transparent border border-white/10 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  onClick={handleSubmit}
                  className="px-3 py-2 rounded text-sm font-medium text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {initialData ? 'Update' : 'Create'} Travel
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TravelFlightModal;
