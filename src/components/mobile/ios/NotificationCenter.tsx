import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { useNotifications } from '../../../stores/notificationStore';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const iconMap = {
  show: Calendar,
  task: AlertCircle,
  finance: DollarSign,
  system: Bell,
};

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
            onClick={onClose}
          />

          {/* Notification Panel */}
          <motion.div
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35, mass: 0.8 }}
            className="fixed top-0 left-0 right-0 z-[110]"
          >
            <div className="bg-ink-900/95 dark:bg-ink-950/95 backdrop-blur-2xl rounded-b-3xl shadow-2xl max-h-[80vh] overflow-hidden border-b border-white/10">
              {/* Header */}
              <div className="sticky top-0 bg-ink-900/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-accent-500" />
                    <h2 className="text-lg font-semibold text-white">
                      Notificaciones
                    </h2>
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-accent-500 text-black text-xs font-bold px-2 py-0.5 rounded-full"
                      >
                        {unreadCount}
                      </motion.span>
                    )}
                  </div>
                  <motion.button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5 text-white/70" />
                  </motion.button>
                </div>

                {unreadCount > 0 && (
                  <motion.button
                    onClick={markAllAsRead}
                    className="mt-2 text-sm text-accent-500 hover:text-accent-400 font-medium"
                    whileTap={{ scale: 0.95 }}
                  >
                    Marcar todas como leídas
                  </motion.button>
                )}
              </div>

              {/* Notification List */}
              <div className="overflow-y-auto max-h-[calc(80vh-100px)] smooth-scroll">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-white/50">
                    <Bell className="w-12 h-12 mb-3 opacity-40" />
                    <p className="text-sm">No hay notificaciones</p>
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {notifications.map((notification) => {
                      const Icon = iconMap[notification.type];
                      return (
                        <motion.div
                          key={notification.id}
                          layout
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 15, height: 0 }}
                          transition={{ 
                            layout: { duration: 0.25, ease: 'easeOut' },
                            opacity: { duration: 0.15 },
                            x: { duration: 0.2, ease: 'easeOut' }
                          }}
                          className={`
                            relative border-b border-white/5 px-6 py-4 hover:bg-white/5 transition-colors notification-slide card-list-item
                            ${!notification.read ? 'bg-accent-500/10 border-l-4 border-l-accent-500' : ''}
                          `}
                        >
                          <div className="flex gap-3">
                            <div className={`
                              flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                              ${notification.type === 'show' ? 'bg-blue-500/20' : ''}
                              ${notification.type === 'task' ? 'bg-yellow-500/20' : ''}
                              ${notification.type === 'finance' ? 'bg-green-500/20' : ''}
                              ${notification.type === 'system' ? 'bg-white/10' : ''}
                            `}>
                              <Icon className={`
                                w-5 h-5
                                ${notification.type === 'show' ? 'text-blue-400' : ''}
                                ${notification.type === 'task' ? 'text-yellow-400' : ''}
                                ${notification.type === 'finance' ? 'text-green-400' : ''}
                                ${notification.type === 'system' ? 'text-white/70' : ''}
                              `} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h3 className="text-sm font-semibold text-white">
                                  {notification.title}
                                </h3>
                                <span className="text-xs text-white/50 flex-shrink-0">
                                  {formatTime(notification.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm text-white/70 line-clamp-2">
                                {notification.message}
                              </p>

                              <div className="flex items-center gap-2 mt-2">
                                {!notification.read && (
                                  <motion.button
                                    onClick={() => markAsRead(notification.id)}
                                    className="text-xs text-accent-500 hover:text-accent-400 font-medium touch-optimized"
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ duration: 0.1 }}
                                  >
                                    Marcar como leída
                                  </motion.button>
                                )}
                                <motion.button
                                  onClick={() => deleteNotification(notification.id)}
                                  className="text-xs text-red-400 hover:text-red-300 font-medium touch-optimized"
                                  whileTap={{ scale: 0.95 }}
                                  transition={{ duration: 0.1 }}
                                >
                                  Eliminar
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
