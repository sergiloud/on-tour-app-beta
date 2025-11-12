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
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Notification Panel */}
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute top-0 left-0 right-0 z-50"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-b-3xl shadow-2xl max-h-[80vh] overflow-hidden">
              {/* Header */}
              <div className="sticky top-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-accent-500" />
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      Notificaciones
                    </h2>
                    {unreadCount > 0 && (
                      <span className="bg-accent-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  </button>
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="mt-2 text-sm text-accent-500 hover:text-accent-600 font-medium"
                  >
                    Marcar todas como leídas
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="overflow-y-auto max-h-[calc(80vh-100px)]">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-neutral-500 dark:text-neutral-400">
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
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                          className={`
                            relative border-b border-neutral-200 dark:border-neutral-700 px-6 py-4
                            ${!notification.read ? 'bg-accent-50 dark:bg-accent-950/20' : ''}
                          `}
                        >
                          <div className="flex gap-3">
                            <div className={`
                              flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                              ${notification.type === 'show' ? 'bg-blue-100 dark:bg-blue-900/30' : ''}
                              ${notification.type === 'task' ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''}
                              ${notification.type === 'finance' ? 'bg-green-100 dark:bg-green-900/30' : ''}
                              ${notification.type === 'system' ? 'bg-neutral-100 dark:bg-neutral-800' : ''}
                            `}>
                              <Icon className={`
                                w-5 h-5
                                ${notification.type === 'show' ? 'text-blue-600 dark:text-blue-400' : ''}
                                ${notification.type === 'task' ? 'text-yellow-600 dark:text-yellow-400' : ''}
                                ${notification.type === 'finance' ? 'text-green-600 dark:text-green-400' : ''}
                                ${notification.type === 'system' ? 'text-neutral-600 dark:text-neutral-400' : ''}
                              `} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                  {notification.title}
                                </h3>
                                <span className="text-xs text-neutral-500 dark:text-neutral-400 flex-shrink-0">
                                  {formatTime(notification.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                                {notification.message}
                              </p>

                              <div className="flex items-center gap-2 mt-2">
                                {!notification.read && (
                                  <button
                                    onClick={() => markAsRead(notification.id)}
                                    className="text-xs text-accent-500 hover:text-accent-600 font-medium"
                                  >
                                    Marcar como leída
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteNotification(notification.id)}
                                  className="text-xs text-red-500 hover:text-red-600 font-medium"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          </div>

                          {!notification.read && (
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 w-2 h-2 bg-accent-500 rounded-full" />
                          )}
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
