// Normalized series helpers for finance charts and tables
export type SeriesPoint = { timestamp: string; label?: string; value: number };

export function toSeries(months: string[], values: number[], labelFmt?: (m: string)=>string): SeriesPoint[] {
  const points: SeriesPoint[] = [];
  for (let i=0;i<months.length;i++) {
    const m = months[i];
    const v = values[i] ?? 0;
    points.push({ timestamp: m, label: labelFmt ? labelFmt(m) : m, value: v });
  }
  return points;
}

export function minMax(points: SeriesPoint[]): { min: number; max: number } {
  if (!points.length) return { min: 0, max: 0 };
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const p of points) { if (p.value < min) min = p.value; if (p.value > max) max = p.value; }
  if (!Number.isFinite(min)) min = 0;
  if (!Number.isFinite(max)) max = 0;
  return { min, max };
}

export function sum(points: SeriesPoint[]): number {
  return points.reduce((a,b)=> a + (Number.isFinite(b.value) ? b.value : 0), 0);
}

export function trend(points: SeriesPoint[]): number {
  if (points.length < 2) return 0;
  const first = points[0].value;
  const last = points[points.length-1].value;
  if (first === 0) return last === 0 ? 0 : 100;
  return Math.round(((last - first) / Math.abs(first)) * 100);
}
