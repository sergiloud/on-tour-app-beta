import { useEffect, useRef, useState } from 'react';

interface Options {
  duration?: number; // ms
  easing?: (t: number) => number;
  format?: (v: number) => string;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function useAnimatedNumber(target: number, { duration = 1400, easing = easeOutCubic, format }: Options = {}) {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  const targetRef = useRef(target);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    fromRef.current = value;
    targetRef.current = target;
    const start = performance.now();

    const step = () => {
      const now = performance.now();
      const p = Math.min(1, (now - start) / duration);
      const eased = easing(p);
      const next = fromRef.current + (targetRef.current - fromRef.current) * eased;
      setValue(next);
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  return () => { if (raf.current != null) cancelAnimationFrame(raf.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  const display = format ? format(value) : value.toFixed(0);
  return display;
}
