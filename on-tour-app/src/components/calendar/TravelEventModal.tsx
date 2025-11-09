import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { t } from '../../lib/i18n';

export interface TravelEventData {
  id?: string;
  date: string;
  origin: string;
  destination: string;
  title: string;
  startTime?: string;
  endTime?: string;
  locator?: string;
  airline?: string;
  flightNumber?: string;
  bookingReference?: string;
  notes?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  initialData?: Partial<TravelEventData>;
  onSave: (data: TravelEventData) => void;
}

const TravelEventModal: React.FC<Props> = ({ open, onClose, initialData, onSave }) => {
  const [formData, setFormData] = useState<TravelEventData>({
    id: initialData?.id,
    date: initialData?.date || new Date().toISOString().slice(0, 10),
    origin: initialData?.origin || '',
    destination: initialData?.destination || '',
    title: initialData?.title || '',
    startTime: initialData?.startTime || '',
    endTime: initialData?.endTime || '',
    locator: initialData?.locator || '',
    airline: initialData?.airline || '',
    flightNumber: initialData?.flightNumber || '',
    bookingReference: initialData?.bookingReference || '',
    notes: initialData?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.origin || !formData.destination) {
      alert('Origin and destination are required');
      return;
    }
    onSave(formData);
    onClose();
  };

  if (!open) return null;

  return (
    <div role="dialog" aria-labelledby="travel-modal-title" aria-modal="true" className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="relative glass rounded-xl border border-slate-300 dark:border-white/20 shadow-2xl w-full max-w-lg overflow-hidden"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 id="travel-modal-title" className="text-xl font-semibold text-slate-900 dark:text-white">
            {initialData?.id ? 'Edit Travel' : 'New Travel Event'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:bg-white/10 transition-colors"
            aria-label="Close dialog"
          >
            <svg className="w-5 h-5 text-slate-400 dark:text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-white/80 mb-2">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-white text-sm focus:border-accent-500/50 outline-none transition-colors"
              required
            />
          </div>

          {/* Route */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-white/80 mb-2">From (Origin)</label>
              <input
                type="text"
                placeholder="e.g., MAD"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-white text-sm focus:border-accent-500/50 outline-none transition-colors"
                required
                maxLength={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-white/80 mb-2">To (Destination)</label>
              <input
                type="text"
                placeholder="e.g., NYC"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-white text-sm focus:border-accent-500/50 outline-none transition-colors"
                required
                maxLength={3}
              />
            </div>
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-white/80 mb-2">Departure Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-white text-sm focus:border-accent-500/50 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-white/80 mb-2">Arrival Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-white text-sm focus:border-accent-500/50 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Flight Details */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-white/80 mb-2">Booking Locator / Reference</label>
            <input
              type="text"
              placeholder="e.g., ABC123 or 6A9K2L"
              value={formData.locator || formData.bookingReference || ''}
              onChange={(e) => setFormData({ ...formData, locator: e.target.value, bookingReference: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-white text-sm focus:border-accent-500/50 outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-white/80 mb-2">Airline</label>
              <input
                type="text"
                placeholder="e.g., IB, UA, LH"
                value={formData.airline}
                onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-white text-sm focus:border-accent-500/50 outline-none transition-colors"
                maxLength={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-white/80 mb-2">Flight Number</label>
              <input
                type="text"
                placeholder="e.g., IB6045"
                value={formData.flightNumber}
                onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-white text-sm focus:border-accent-500/50 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-white/80 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional details, seat number, etc."
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-white text-sm focus:border-accent-500/50 outline-none transition-colors resize-none"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-white text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent-500 to-accent-600 text-black text-sm font-semibold hover:shadow-lg hover:shadow-accent-500/30 transition-all hover:scale-105"
            >
              {initialData?.id ? 'Update' : 'Create'} Travel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default TravelEventModal;
