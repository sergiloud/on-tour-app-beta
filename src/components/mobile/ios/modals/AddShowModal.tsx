import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, DollarSign, Save } from 'lucide-react';
import { showStore } from '../../../../shared/showStore';
import { useSettings } from '../../../../context/SettingsContext';
import type { Show } from '../../../../lib/shows';

interface AddShowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddShowModal: React.FC<AddShowModalProps> = ({ isOpen, onClose }) => {
  const { currency } = useSettings();
  
  // Form state
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState('');
  const [fee, setFee] = useState('');
  const [status, setStatus] = useState<Show['status']>('pending');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!city.trim() || !date) {
      return;
    }

    setIsSaving(true);

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    try {
      const newShow: Show = {
        id: `show_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        city: city.trim(),
        country: country.trim() || 'Unknown',
        venue: venue.trim(),
        date: date,
        fee: parseFloat(fee) || 0,
        status: status,
        lat: 0,
        lng: 0,
        __version: 0,
        __modifiedAt: Date.now(),
        __modifiedBy: 'user',
      };

      showStore.addShow(newShow);

      // Success haptic
      if (navigator.vibrate) {
        navigator.vibrate([10, 50, 10]);
      }

      // Reset form
      setCity('');
      setCountry('');
      setVenue('');
      setDate('');
      setFee('');
      setStatus('pending');
      
      onClose();
    } catch (error) {
      console.error('Error adding show:', error);
      // Error haptic
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    } finally {
      setIsSaving(false);
    }
  }, [city, country, venue, date, fee, status, onClose]);

  const handleClose = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate(5);
    }
    onClose();
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            className="w-full bg-ink-900 rounded-t-3xl max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle Bar */}
            <div className="pt-3 pb-2 px-5">
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto" />
            </div>

            {/* Header */}
            <div className="px-5 pb-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Add Show</h2>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center touch-target"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-white/70" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* City */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/70">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  City *
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Barcelona"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-500 touch-target"
                  autoFocus
                />
              </div>

              {/* Country */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/70">
                  Country
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Spain"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-500 touch-target"
                />
              </div>

              {/* Venue */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/70">
                  Venue
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Razzmatazz"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-500 touch-target"
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/70">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-500 touch-target"
                />
              </div>

              {/* Fee */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/70">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Fee ({currency})
                </label>
                <input
                  type="number"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  placeholder="5000"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-500 touch-target"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/70">
                  Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['offer', 'pending', 'confirmed'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`px-4 py-3 rounded-xl font-medium transition-all touch-target ${
                        status === s
                          ? 'bg-accent-500 text-black'
                          : 'bg-white/5 text-white/70 border border-white/10'
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spacer for safe area */}
              <div className="h-20" />
            </form>

            {/* Footer - Fixed */}
            <div className="sticky bottom-0 px-5 py-4 bg-ink-900/95 backdrop-blur-xl border-t border-white/10">
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={!city.trim() || !date || isSaving}
                className="w-full py-4 bg-accent-500 text-black font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-target instant-feedback"
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Add Show</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
