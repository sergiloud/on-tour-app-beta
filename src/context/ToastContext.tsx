import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast: Toast = { id, message, type, duration };
    
    setToasts((prev) => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  const success = useCallback((message: string, duration = 3000) => {
    addToast(message, 'success', duration);
  }, [addToast]);

  const error = useCallback((message: string, duration = 4000) => {
    addToast(message, 'error', duration);
  }, [addToast]);

  const warning = useCallback((message: string, duration = 3500) => {
    addToast(message, 'warning', duration);
  }, [addToast]);

  const info = useCallback((message: string, duration = 3000) => {
    addToast(message, 'info', duration);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const { type, message, id } = toast;

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  // Design system integrado - colores y estilos consistentes con la app
  const styles = {
    success: {
      bg: 'from-accent-500/95 to-accent-600/95',
      border: 'border-accent-400/40',
      shadow: 'shadow-xl shadow-accent-500/25',
      iconColor: 'text-ink-950',
      textColor: 'text-ink-950',
      closeColor: 'text-ink-950/70 hover:text-ink-950',
    },
    error: {
      bg: 'from-red-500/95 to-red-600/95',
      border: 'border-red-400/40',
      shadow: 'shadow-xl shadow-red-500/25',
      iconColor: 'text-white',
      textColor: 'text-white',
      closeColor: 'text-white/70 hover:text-white',
    },
    warning: {
      bg: 'from-amber-500/95 to-amber-600/95',
      border: 'border-amber-400/40',
      shadow: 'shadow-xl shadow-amber-500/25',
      iconColor: 'text-ink-950',
      textColor: 'text-ink-950',
      closeColor: 'text-ink-950/70 hover:text-ink-950',
    },
    info: {
      bg: 'from-slate-800/95 to-slate-900/95',
      border: 'border-white/20',
      shadow: 'shadow-xl shadow-black/40',
      iconColor: 'text-accent-500',
      textColor: 'text-white',
      closeColor: 'text-white/70 hover:text-white',
    },
  };

  const Icon = icons[type];
  const style = styles[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9, y: -20 }}
      animate={{ opacity: 1, x: 0, scale: 1, y: 0 }}
      exit={{ opacity: 0, x: 100, scale: 0.9, y: -20 }}
      transition={{ 
        type: 'spring', 
        stiffness: 400, 
        damping: 30,
        mass: 0.8
      }}
      className={`pointer-events-auto min-w-[320px] max-w-md bg-gradient-to-r ${style.bg} backdrop-blur-xl border ${style.border} rounded-xl ${style.shadow}`}
    >
      <div className="flex items-start gap-3 p-4">
        <div className={`flex-shrink-0 ${style.iconColor}`}>
          <Icon className="w-5 h-5 mt-0.5" strokeWidth={2.5} />
        </div>
        <p className={`${style.textColor} text-sm font-semibold flex-1 leading-relaxed`}>
          {message}
        </p>
        <button
          onClick={() => onRemove(id)}
          className={`${style.closeColor} transition-all flex-shrink-0 hover:scale-110 active:scale-95`}
          aria-label="Cerrar notificación"
        >
          <X className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>
    </motion.div>
  );
};
