import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface ShowEventData {
  id?: string;
  date: string;
  title: string;
  city: string;
  country: string;
  status?: 'confirmed' | 'pending' | 'offer';
  notes?: string;
  time?: string;
  venue?: string;
  ticketPrice?: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  initialData?: Partial<ShowEventData>;
  onSave: (data: ShowEventData) => void;
}

const ShowEventModal: React.FC<Props> = ({ open, onClose, initialData, onSave }) => {
  const [formData, setFormData] = useState<ShowEventData>({
    id: initialData?.id,
    date: initialData?.date || new Date().toISOString().slice(0, 10),
    title: initialData?.title || '',
    city: initialData?.city || '',
    country: initialData?.country || '',
    status: initialData?.status || 'pending',
    notes: initialData?.notes || '',
    time: initialData?.time || '',
    venue: initialData?.venue || '',
    ticketPrice: initialData?.ticketPrice,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.city || !formData.country) {
      alert('City and country are required');
      return;
    }
    onSave(formData);
    onClose();
  };

  if (!open) return null;

  return (
    <div role="dialog" aria-labelledby="show-modal-title" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="relative glass rounded-xl border border-white/20 shadow-2xl w-full max-w-lg overflow-hidden"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 id="show-modal-title" className="text-xl font-semibold text-white">
            {initialData?.id ? 'Edit Show' : 'New Show Event'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close dialog"
          >
            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-accent-500/50 outline-none transition-colors"
              required
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Show Time</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-accent-500/50 outline-none transition-colors"
            />
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-accent-500/50 outline-none transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Country</label>
              <input
                type="text"
                placeholder="e.g., ES, US, FR"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-accent-500/50 outline-none transition-colors"
                required
                maxLength={2}
              />
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Venue</label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              placeholder="e.g., Palau Sant Jordi"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-accent-500/50 outline-none transition-colors"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'confirmed' | 'pending' | 'offer' })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-accent-500/50 outline-none transition-colors"
            >
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="offer">Offer</option>
            </select>
          </div>

          {/* Ticket Price */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Ticket Price</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-white/60">€</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.ticketPrice || ''}
                onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-accent-500/50 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional details about the show"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-accent-500/50 outline-none transition-colors resize-none"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent-500 to-accent-600 text-black text-sm font-semibold hover:shadow-lg hover:shadow-accent-500/30 transition-all hover:scale-105"
            >
              {initialData?.id ? 'Update' : 'Create'} Show
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ShowEventModal;
