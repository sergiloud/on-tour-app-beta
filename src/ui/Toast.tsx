import React from 'react';

type ToastTone = 'info' | 'success' | 'warn' | 'error';
type ToastItem = { id: number; message: string; tone: ToastTone; timeout: number };

type ToastContextValue = {
  show: (message: string, opts?: { tone?: ToastTone; timeout?: number }) => void;
  info: (m: string, t?: number) => void;
  success: (m: string, t?: number) => void;
  warn: (m: string, t?: number) => void;
  error: (m: string, t?: number) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = React.useState<ToastItem[]>([]);
  const idRef = React.useRef(1);

  const remove = React.useCallback((id: number) => {
    setItems((list) => list.filter((i) => i.id !== id));
  }, []);

  const show = React.useCallback((message: string, opts?: { tone?: ToastTone; timeout?: number }) => {
    const id = idRef.current++;
    const tone = opts?.tone ?? 'info';
    const timeout = Math.max(1200, Math.min(8000, opts?.timeout ?? (tone === 'error' ? 5000 : 2500)));
    setItems((list) => [...list, { id, message, tone, timeout }]);
    window.setTimeout(() => remove(id), timeout);
  }, [remove]);

  const value: ToastContextValue = React.useMemo(() => ({
    show,
    info: (m, t) => show(m, { tone: 'info', timeout: t }),
    success: (m, t) => show(m, { tone: 'success', timeout: t }),
    warn: (m, t) => show(m, { tone: 'warn', timeout: t }),
    error: (m, t) => show(m, { tone: 'error', timeout: t }),
  }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" aria-relevant="additions" className="fixed bottom-3 right-3 z-[var(--z-popover)] flex flex-col gap-2">
        {items.map((it) => (
          <ToastView key={it.id} item={it} onClose={() => remove(it.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const toneStyles: Record<ToastTone, string> = {
  info: 'bg-slate-200 dark:bg-white/10 border-slate-300 dark:border-white/20 text-white',
  success: 'bg-emerald-500/20 border-emerald-400/30 text-emerald-100',
  warn: 'bg-amber-500/25 border-amber-400/30 text-amber-100',
  error: 'bg-rose-600/25 border-rose-400/30 text-rose-100',
};

const toneIcon: Record<ToastTone, string> = {
  info: 'ℹ️',
  success: '✔︎',
  warn: '⚠️',
  error: '⨯',
};

const ToastView: React.FC<{ item: ToastItem; onClose: () => void }> = ({ item, onClose }) => {
  const { message, tone } = item;
  return (
    <div role="status" className={`glass rounded-md border px-3 py-2 shadow-md text-sm min-w-[200px] ${toneStyles[tone]}`}>
      <div className="flex items-start gap-2">
        <span aria-hidden className="select-none leading-5">{toneIcon[tone]}</span>
        <div className="grow">{message}</div>
        <button aria-label="Close" className="opacity-70 hover:opacity-100" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default ToastProvider;
