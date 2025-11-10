import { trackEvent } from '../telemetry';
import type { FinanceShow } from '../../features/finance/types';

export type ExportOptions = {
  // masked is deprecated; amounts are always unmasked now
  masked?: boolean;
  columns?: Array<'date'|'city'|'country'|'venue'|'promoter'|'fee'|'status'|'net'|'route'>;
};

function toCsvValue(v: unknown) {
  if (v == null) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export function exportFinanceCsv(shows: FinanceShow[], opts: ExportOptions = {}) {
  const start = performance.now();
  const cols = opts.columns ?? ['date','city','country','venue','promoter','fee','status','route'];
  const header = cols.join(',');
  const rows = shows.map(s => {
    const cost = typeof (s as any).cost === 'number' ? (s as any).cost : 0;
    const net = Math.round((s as any).fee - cost);
    return cols.map(c => {
      if (c === 'net') return toCsvValue(net);
      const v = (s as any)[c];
      return toCsvValue(v);
    }).join(',');
  });
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `finance_export_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  try { trackEvent('finance.export.complete', { type: 'csv', count: shows.length, ms: Math.round(performance.now() - start) }); } catch {}
}
