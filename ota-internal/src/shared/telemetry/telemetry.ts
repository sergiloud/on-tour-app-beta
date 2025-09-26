// Simple telemetry aggregator (in-memory)
interface PerfSample { name: string; dur: number; ts: number; }
const perfBuffer: PerfSample[] = [];
const counters: Record<string, number> = {};

export function perf<T>(name: string, fn: () => T): T {
  const t0 = performance.now();
  try { return fn(); } finally {
    const dur = performance.now() - t0;
    perfBuffer.push({ name, dur, ts: Date.now() });
    if (perfBuffer.length > 500) perfBuffer.splice(0, perfBuffer.length - 500);
    if (dur > 32) console.debug('[perf]', name, dur.toFixed(1)+'ms');
  }
}

export function incr(name: string, by = 1){ counters[name] = (counters[name]||0)+by; }
export function getCounters(){ return { ...counters }; }
export function getPerfRecent(name?: string){ return perfBuffer.filter(s => !name || s.name === name); }

// Optional export to window for debugging
if (typeof window !== 'undefined'){
  (window as any).telemetry = { getCounters, getPerfRecent };
}
