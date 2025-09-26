import React from 'react';

export const LazyVisible: React.FC<{ height?: number; children: React.ReactNode }>=({ height = 300, children }) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    if (!ref.current || visible) return;
    const el = ref.current;
    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { setVisible(true); obs.disconnect(); break; }
      }
    }, { rootMargin: '100px' });
    try { obs.observe(el); } catch {}
    return () => { try { obs.disconnect(); } catch {} };
  }, [visible]);
  return (
    <div ref={ref} style={{ minHeight: height }}>
      {visible ? children : <div className="w-full h-full animate-pulse rounded-md bg-white/5" />}
    </div>
  );
};

export default LazyVisible;
