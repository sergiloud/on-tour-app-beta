import { trackEvent } from '../telemetry';
import type { FinanceShow } from '../../features/finance/types';

export type ExportOptions = {
  // masked is deprecated; amounts are always unmasked now
  masked?: boolean;
  columns?: Array<'date'|'city'|'country'|'venue'|'promoter'|'fee'|'vatPct'|'vat'|'invoiceTotal'|'whtPct'|'wht'|'status'|'net'|'route'>;
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
  const cols = opts.columns ?? ['date','city','country','venue','promoter','fee','vatPct','vat','invoiceTotal','whtPct','wht','status','net','route'];
  const header = cols.join(',');
  const rows = shows.map(s => {
    const cost = typeof (s as any).cost === 'number' ? (s as any).cost : 0;
    const vatPct = (s as any).vatPct || 0;
    const vatAmount = vatPct > 0 ? s.fee * (vatPct / 100) : 0;
    const invoiceTotal = s.fee + vatAmount;
    const whtPct = (s as any).whtPct || 0;
    const whtAmount = whtPct > 0 ? s.fee * (whtPct / 100) : 0;
    const net = Math.round((s as any).fee - cost);
    
    return cols.map(c => {
      if (c === 'net') return toCsvValue(net);
      if (c === 'vatPct') return toCsvValue(vatPct > 0 ? vatPct : '');
      if (c === 'vat') return toCsvValue(vatAmount > 0 ? Math.round(vatAmount) : '');
      if (c === 'invoiceTotal') return toCsvValue(invoiceTotal > s.fee ? Math.round(invoiceTotal) : '');
      if (c === 'whtPct') return toCsvValue(whtPct > 0 ? whtPct : '');
      if (c === 'wht') return toCsvValue(whtAmount > 0 ? Math.round(whtAmount) : '');
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

export async function exportFinanceXlsx(shows: FinanceShow[], opts: ExportOptions = {}) {
  const start = performance.now();
  const cols = opts.columns ?? ['date','city','country','venue','promoter','fee','vatPct','vat','invoiceTotal','whtPct','wht','status','net','route'];
  const CHUNK_SIZE = 100;
  const isLargeDataset = shows.length > 500;

  try {
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Finance');

    // Set column headers and widths
    worksheet.columns = cols.map(col => {
      let header = col.charAt(0).toUpperCase() + col.slice(1);
      if (col === 'vatPct') header = 'VAT %';
      if (col === 'vat') header = 'VAT Amount';
      if (col === 'invoiceTotal') header = 'Invoice Total';
      if (col === 'whtPct') header = 'WHT %';
      if (col === 'wht') header = 'WHT Amount';
      
      return {
        header,
        key: col,
        width: col === 'venue' ? 25 : col === 'promoter' ? 20 : 15
      };
    });

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' }
    };

    // Prepare data
    const data = shows.map(s => {
      const cost = typeof (s as any).cost === 'number' ? (s as any).cost : 0;
      const vatPct = (s as any).vatPct || 0;
      const vatAmount = vatPct > 0 ? s.fee * (vatPct / 100) : 0;
      const invoiceTotal = s.fee + vatAmount;
      const whtPct = (s as any).whtPct || 0;
      const whtAmount = whtPct > 0 ? s.fee * (whtPct / 100) : 0;
      const net = Math.round((s as any).fee - cost);
      
      const row: any = {};
      cols.forEach(c => {
        if (c === 'net') {
          row[c] = net;
        } else if (c === 'vatPct') {
          row[c] = vatPct > 0 ? vatPct : '';
        } else if (c === 'vat') {
          row[c] = vatAmount > 0 ? Math.round(vatAmount) : '';
        } else if (c === 'invoiceTotal') {
          row[c] = invoiceTotal > s.fee ? Math.round(invoiceTotal) : '';
        } else if (c === 'whtPct') {
          row[c] = whtPct > 0 ? whtPct : '';
        } else if (c === 'wht') {
          row[c] = whtAmount > 0 ? Math.round(whtAmount) : '';
        } else {
          row[c] = (s as any)[c];
        }
      });
      return row;
    });

    // Add rows in chunks for large datasets
    if (isLargeDataset) {
      for (let i = 0; i < data.length; i += CHUNK_SIZE) {
        const chunk = data.slice(i, i + CHUNK_SIZE);
        chunk.forEach(row => worksheet.addRow(row));
        // Allow browser to breathe between chunks
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    } else {
      data.forEach(row => worksheet.addRow(row));
    }

    // Generate buffer with memory optimization for large files
    const buffer = await workbook.xlsx.writeBuffer({
      useSharedStrings: true, // Reduce memory usage
      useStyles: true
    });
    
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance_export_${new Date().toISOString().slice(0,10)}.xlsx`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    
    try { 
      trackEvent('finance.export.complete', { 
        type: 'xlsx', 
        count: shows.length, 
        ms: Math.round(performance.now() - start),
        isLarge: isLargeDataset
      }); 
    } catch {}
    
    return { count: data.length, cols: cols.length };
  } catch (e) {
    console.error('Finance XLSX export failed:', e);
    if (shows.length > 1000) {
      throw new Error(`Export failed: Dataset too large (${shows.length} rows). Try filtering data or use CSV format.`);
    }
    throw e;
  }
}
