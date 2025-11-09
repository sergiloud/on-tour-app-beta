import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const LazyVisible: React.FC<{ height?: number; children: React.ReactNode }>=({ height = 300, children }) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = React.useState(false);
  const [hasLoaded, setHasLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current || visible) return;
    const el = ref.current;
    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
          break;
        }
      }
    }, { rootMargin: '100px' });
    try { obs.observe(el); } catch {}
    return () => { try { obs.disconnect(); } catch {} };
  }, [visible]);

  React.useEffect(() => {
    if (visible) {
      // Small delay to ensure content is ready before animating in
      const timer = setTimeout(() => setHasLoaded(true), 100);
      return () => clearTimeout(timer);
    } else {
      setHasLoaded(false);
      return undefined;
    }
  }, [visible]);

  return (
    <div ref={ref} style={{ minHeight: height }}>
      <AnimatePresence mode="wait">
        {!hasLoaded ? (
          <motion.div
            key="placeholder"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full animate-pulse rounded-md bg-slate-100 dark:bg-white/5"
          />
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LazyVisible;
