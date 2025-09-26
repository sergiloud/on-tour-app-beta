// Lightweight component update metrics (dev aid)
// Tracks how many times each dashboard component updates + last duration (if perf wrapper used externally)

interface CompMetric { count: number; lastAt: number; }
const componentMetrics: Record<string, CompMetric> = Object.create(null);

export function recordComponentUpdate(id: string){
  const now = Date.now();
  const m = componentMetrics[id] || (componentMetrics[id] = { count:0, lastAt: now });
  m.count++; m.lastAt = now;
}
export function getComponentMetrics(){ return componentMetrics; }

try {
  if ((import.meta as any).env?.DEV){
    (window as any).getComponentMetrics = getComponentMetrics;
  }
} catch {}
