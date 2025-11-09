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
    <div
      role="dialog"
      aria-labelledby="show-modal-title"
      aria-modal="true"
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4"
      style={{ colorScheme: 'dark' }}
      data-theme="dark"
    >
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="relative bg-[#0f1419] rounded-xl border border-white/20 shadow-2xl w-full max-w-lg overflow-hidden"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        style={{ colorScheme: 'dark' }}
        data-theme="dark"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-white/10"
          style={{
            background: 'linear-gradient(to right, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03))',
            borderBottomColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-accent-500/20 border border-accent-500/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 id="show-modal-title" className="text-lg font-semibold text-white">
                {initialData?.id ? initialData.title || 'Edit Show' : 'New Show Event'}
              </h2>
              {initialData?.city && initialData?.country && (
                <p className="text-sm text-white/60">
                  {initialData.city} ({initialData.country}) · {initialData.date}
                </p>
              )}
            </div>
          </div>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto bg-[#0f1419]" style={{ colorScheme: 'dark' }}>
          {/* Show Name */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">NOMBRE DEL SHOW</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-dark w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors"
              style={{ colorScheme: 'dark' }}
              placeholder="Enter show name"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">DATE</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-dark w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors"
                style={{ colorScheme: 'dark' }}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">TIME</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="input-dark w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">LOCATION</label>
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div>
                <label className="block text-xs text-white/60 mb-1.5">CITY</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="input-dark w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors"
                  style={{ colorScheme: 'dark' }}
                  required
                />
              </div>
              <div className="w-24">
                <label className="block text-xs text-white/60 mb-1.5">COUNTRY</label>
                <input
                  type="text"
                  placeholder="CZ"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value.toUpperCase() })}
                  className="input-dark w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors text-center"
                  style={{ colorScheme: 'dark' }}
                  required
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          {/* Promoter */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">PROMOTER</label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              placeholder="Nombre del promotor o compañía"
              className="input-dark w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          {/* Venue */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              VENUE <span className="text-xs text-white/50">(site / recinto topónimo)</span>
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="DOV Industrial site"
              className="input-dark w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">STATUS</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'confirmed' | 'pending' | 'offer' })}
              className="input-dark w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors appearance-none cursor-pointer"
              style={{
                colorScheme: 'dark',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.6)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '1.25rem'
              }}
            >
              <option value="confirmed" style={{ backgroundColor: '#1a1f2e', color: '#ffffff' }}>Confirmed</option>
              <option value="pending" style={{ backgroundColor: '#1a1f2e', color: '#ffffff' }}>Pending</option>
              <option value="offer" style={{ backgroundColor: '#1a1f2e', color: '#ffffff' }}>Offer</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                if (initialData?.id && confirm('¿Estás seguro de eliminar este show?')) {
                  // Call delete handler if provided
                  onClose();
                }
              }}
              className="px-5 py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium transition-colors"
            >
              Delete
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-accent-500 to-accent-600 text-black text-sm font-semibold hover:shadow-lg hover:shadow-accent-500/30 transition-all hover:scale-105"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ShowEventModal;
