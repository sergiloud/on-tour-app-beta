import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Building2,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock3,
  XCircle,
  Navigation
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { t } from '../../lib/i18n';
import { Show } from '../../lib/shows';

interface ShowDetailModalProps {
  show: Show | null;
  isOpen: boolean;
  onClose: () => void;
}

const ShowDetailModal: React.FC<ShowDetailModalProps> = ({ show, isOpen, onClose }) => {
  const { fmtMoney } = useSettings();

  if (!show) return null;

  // Format date and time
  const showDate = show.date ? new Date(show.date) : null;
  const formattedDate = showDate?.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = showDate?.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Calculate days until show
  const daysUntil = showDate ? Math.ceil((showDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)) : null;
  let countdownText = '';
  let countdownColor = 'text-slate-500';
  
  if (daysUntil !== null) {
    if (daysUntil < 0) {
      countdownText = 'Past event';
      countdownColor = 'text-slate-400';
    } else if (daysUntil === 0) {
      countdownText = 'Today!';
      countdownColor = 'text-red-500';
    } else if (daysUntil === 1) {
      countdownText = 'Tomorrow';
      countdownColor = 'text-orange-500';
    } else if (daysUntil <= 7) {
      countdownText = `In ${daysUntil} days`;
      countdownColor = 'text-yellow-500';
    } else {
      countdownText = `In ${daysUntil} days`;
      countdownColor = 'text-green-500';
    }
  }

  // Status configuration
  const statusConfig: Record<string, { icon: any; label: string; color: string; bgColor: string }> = {
    confirmed: {
      icon: CheckCircle2,
      label: 'Confirmed',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    },
    pending: {
      icon: Clock3,
      label: 'Pending',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
    },
    offer: {
      icon: AlertCircle,
      label: 'Offer',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    },
    canceled: {
      icon: XCircle,
      label: 'Canceled',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
    },
    archived: {
      icon: XCircle,
      label: 'Archived',
      color: 'text-slate-600 dark:text-slate-400',
      bgColor: 'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800'
    },
    postponed: {
      icon: Clock3,
      label: 'Postponed',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
    }
  };

  const currentStatus = statusConfig[show.status] || statusConfig.pending;
  const StatusIcon = currentStatus!.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000]"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[10001] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gradient decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent-500/5 via-transparent to-blue-500/5 pointer-events-none" />
              {/* Header with gradient */}
              <div className="relative px-6 py-5 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>

                <div className="pr-10">
                  {/* Status badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${currentStatus!.bgColor}`}>
                      <StatusIcon className={`w-4 h-4 ${currentStatus!.color}`} />
                      <span className={`text-sm font-semibold ${currentStatus!.color}`}>
                        {currentStatus!.label}
                      </span>
                    </div>
                    {countdownText && (
                      <div className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className={`text-sm font-semibold ${countdownColor}`}>
                          {countdownText}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* City and Venue */}
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                    {show.city || 'Untitled Show'}
                  </h2>
                  {show.venue && (
                    <p className="text-base text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {show.venue}
                    </p>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-6 py-5 space-y-5">
                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-accent-500/30 transition-all">
                    <div className="p-2 rounded-lg bg-accent-100 dark:bg-accent-900/30">
                      <Calendar className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        {t('shows.date') || 'Date'}
                      </p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {formattedDate || 'TBA'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-accent-500/30 transition-all">
                    <div className="p-2 rounded-lg bg-accent-100 dark:bg-accent-900/30">
                      <Clock className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        {t('shows.time') || 'Time'}
                      </p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {formattedTime || 'TBA'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location */}
                {(show.city || show.country) && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-accent-500/30 transition-all">
                    <div className="p-2 rounded-lg bg-accent-100 dark:bg-accent-900/30">
                      <MapPin className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        {t('shows.location') || 'Location'}
                      </p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {[show.city, show.country].filter(Boolean).join(', ')}
                      </p>
                      {show.lng && show.lat && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {show.lat.toFixed(4)}, {show.lng.toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Financial Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {show.fee && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-accent-50 to-accent-100/50 dark:from-accent-900/20 dark:to-accent-800/10 border border-accent-200 dark:border-accent-800 hover:border-accent-500/50 transition-all">
                      <div className="p-2 rounded-lg bg-accent-200 dark:bg-accent-800/50">
                        <DollarSign className="w-5 h-5 text-accent-700 dark:text-accent-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-accent-700 dark:text-accent-300 mb-1">
                          {t('shows.fee') || 'Fee'}
                        </p>
                        <p className="text-lg font-bold text-accent-900 dark:text-accent-100">
                          {fmtMoney(show.fee)}
                        </p>
                      </div>
                    </div>
                  )}

                  {show.cost && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-accent-500/30 transition-all">
                      <div className="p-2 rounded-lg bg-accent-100 dark:bg-accent-900/30">
                        <DollarSign className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                          {t('shows.cost') || 'Production Cost'}
                        </p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {fmtMoney(show.cost)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Promoter Info */}
                {show.promoter && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-1 h-4 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
                      {t('shows.promoter') || 'Promoter'}
                    </h3>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-accent-500/30 transition-all">
                      <Users className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                      <p className="text-sm text-slate-900 dark:text-white">
                        {show.promoter}
                      </p>
                    </div>
                  </div>
                )}

                {/* Agencies */}
                {(show.mgmtAgency || show.bookingAgency) && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-1 h-4 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
                      {t('shows.agencies') || 'Agencies'}
                    </h3>
                    {show.mgmtAgency && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-accent-500/30 transition-all">
                        <Building2 className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Management</p>
                          <p className="text-sm text-slate-900 dark:text-white">{show.mgmtAgency}</p>
                        </div>
                      </div>
                    )}
                    {show.bookingAgency && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-accent-500/30 transition-all">
                        <Building2 className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Booking</p>
                          <p className="text-sm text-slate-900 dark:text-white">{show.bookingAgency}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                {show.notes && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-1 h-4 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
                      {t('shows.notes') || 'Notes'}
                    </h3>
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-accent-500/30 transition-all">
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {show.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex gap-3">
                {show.lng && show.lat && (
                  <button
                    onClick={() => {
                      window.open(`https://www.google.com/maps?q=${show.lat},${show.lng}`, '_blank');
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-semibold text-sm transition-all shadow-lg shadow-accent-500/20 hover:shadow-accent-500/40"
                  >
                    <Navigation className="w-4 h-4" />
                    {t('shows.viewOnMap') || 'View on Map'}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold text-sm transition-all"
                >
                  {t('common.close') || 'Close'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ShowDetailModal;
