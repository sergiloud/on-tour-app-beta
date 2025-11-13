import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

interface SnackbarMessage {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * iOS-style Snackbar for notifications
 * Auto-dismisses after duration, supports actions
 * 
 * Usage: Dispatch custom event from anywhere
 * ```tsx
 * window.dispatchEvent(new CustomEvent('showSnackbar', {
 *   detail: {
 *     message: 'Failed to save changes',
 *     type: 'error',
 *     duration: 4000,
 *   }
 * }));
 * ```
 */
export const Snackbar = () => {
  const [message, setMessage] = useState<SnackbarMessage | null>(null);

  useEffect(() => {
    const handleShow = (e: CustomEvent<SnackbarMessage>) => {
      setMessage(e.detail);

      // Auto-dismiss
      const duration = e.detail.duration || 3000;
      setTimeout(() => {
        setMessage(null);
      }, duration);
    };

    window.addEventListener('showSnackbar', handleShow as EventListener);

    return () => {
      window.removeEventListener('showSnackbar', handleShow as EventListener);
    };
  }, []);

  const handleDismiss = () => {
    setMessage(null);
  };

  const handleAction = () => {
    if (message?.action) {
      message.action.onClick();
      handleDismiss();
    }
  };

  const icons = {
    success: <CheckCircle2 size={20} className="text-emerald-400" />,
    error: <XCircle size={20} className="text-red-400" />,
    warning: <AlertTriangle size={20} className="text-amber-400" />,
    info: <Info size={20} className="text-blue-400" />,
  };

  const bgColors = {
    success: 'bg-emerald-500/20 border-emerald-500/30',
    error: 'bg-red-500/20 border-red-500/30',
    warning: 'bg-amber-500/20 border-amber-500/30',
    info: 'bg-blue-500/20 border-blue-500/30',
  };

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
          }}
          className="fixed bottom-20 left-4 right-4 z-50 sm:left-auto sm:right-8 sm:w-96"
        >
          <div
            className={`
              ${bgColors[message.type || 'info']}
              backdrop-blur-xl
              border
              rounded-2xl
              shadow-2xl
              p-4
              flex items-center gap-3
            `}
          >
            {/* Icon */}
            <div className="flex-shrink-0">
              {icons[message.type || 'info']}
            </div>

            {/* Message */}
            <p className="flex-1 text-white text-sm font-medium">
              {message.message}
            </p>

            {/* Action */}
            {message.action && (
              <button
                onClick={handleAction}
                className="flex-shrink-0 px-3 py-1 text-xs font-semibold text-accent-400 hover:text-accent-300 transition-colors"
              >
                {message.action.label}
              </button>
            )}

            {/* Dismiss */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 text-white/40 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
