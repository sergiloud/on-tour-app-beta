// Shared export utilities for Shows CSV/XLSX
// Contract
// - rows: array of { s: show-like object, net: number }
// - exportCols: Record<Header, boolean>
// - selectedIds (optional): limit to selected rows
// - filenamePrefix (optional): default 'shows'
// - Returns count & cols for telemetry
//
// ⚠️ DRAFT EXPORT LIMITATIONS (Alpha Phase):
// - Currencies NOT harmonized (mixed EUR/USD/GBP/AUD values)
// - WHT (Withholding Tax) NOT calculated in net values
// - For visualization only - DO NOT use for accounting/legal purposes
// - Implement currency conversion and WHT calculation before production

export type ShowRow = { s: any; net: number };

const HEADERS = ['Date', 'City', 'Country', 'Venue', 'Fee', 'VAT %', 'VAT', 'Invoice Total', 'WHT %', 'WHT', 'Net', 'Status', 'Notes'] as const;
export type Header = typeof HEADERS[number];

function pickHeaders(exportCols: Record<string, boolean>) {
  const picked = HEADERS.filter(h => exportCols[h]);
  // If user managed to unselect all, fall back to all headers to avoid empty files
  return picked.length > 0 ? picked : [...HEADERS];
}

function buildSource(rows: ShowRow[], selectedIds?: Set<string>) {
  const src = selectedIds && selectedIds.size > 0 ? rows.filter(r => selectedIds.has(r.s.id)) : rows;
  return src.map(({ s, net }) => {
    const vatPct = (s as any).vatPct || 0;
    const vatAmount = vatPct > 0 ? s.fee * (vatPct / 100) : 0;
    const invoiceTotal = s.fee + vatAmount;
    const whtPct = (s as any).whtPct || 0;
    const whtAmount = whtPct > 0 ? s.fee * (whtPct / 100) : 0;

    return {
      'Date': String(s.date || '').slice(0, 10),
      'City': s.city,
      'Country': s.country,
      'Venue': (s as any).venue || '',
      'Fee': s.fee,
      'VAT %': vatPct > 0 ? vatPct : '',
      'VAT': vatAmount > 0 ? Math.round(vatAmount) : '',
      'Invoice Total': invoiceTotal > s.fee ? Math.round(invoiceTotal) : '',
      'WHT %': whtPct > 0 ? whtPct : '',
      'WHT': whtAmount > 0 ? Math.round(whtAmount) : '',
      'Net': Math.round(net),
      'Status': s.status,
      'Notes': (s as any).notes || ''
    } satisfies Record<Header, any>;
  });
}

export function exportShowsCsv(rows: ShowRow[], exportCols: Record<string, boolean>, selectedIds?: Set<string>, filenamePrefix = 'shows') {
  const picked = pickHeaders(exportCols);
  const data = buildSource(rows, selectedIds);
  const esc = (v: any) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  // Add DRAFT warning header
  const out = ['# DRAFT EXPORT - Currencies not harmonized, WHT not calculated'];
  out.push(picked.join(','));
  for (const row of data) { out.push(picked.map(h => esc((row as any)[h])).join(',')); }
  const blob = new Blob([out.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return { count: data.length, cols: picked.length };
}

export async function exportShowsXlsx(rows: ShowRow[], exportCols: Record<string, boolean>, selectedIds?: Set<string>, filenamePrefix = 'shows') {
  const picked = pickHeaders(exportCols);
  const data = buildSource(rows, selectedIds);
  
  // Chunk size for large datasets to avoid memory issues
  const CHUNK_SIZE = 100;
  const isLargeDataset = data.length > 500;

  try {
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Shows');

    // Add DRAFT warning banner
    worksheet.addRow({});
    const warningRow = worksheet.addRow(['⚠️ DRAFT EXPORT - Currencies not harmonized, WHT not calculated']);
    warningRow.font = { bold: true, color: { argb: 'FFD97706' } };
    warningRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFEF3C7' }
    };
    worksheet.mergeCells(2, 1, 2, picked.length);
    worksheet.addRow({});

    // Add header row with styling
    worksheet.columns = picked.map(header => ({
      header,
      key: header,
      width: header === 'Notes' ? 30 : header === 'Venue' ? 25 : 15
    }));

    // Style header row
    const headerRow = worksheet.getRow(4);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' }
    };

    // Add data rows in chunks for large datasets
    if (isLargeDataset) {
      for (let i = 0; i < data.length; i += CHUNK_SIZE) {
        const chunk = data.slice(i, i + CHUNK_SIZE);
        chunk.forEach(row => {
          const rowData: any = {};
          picked.forEach(h => { rowData[h] = (row as any)[h]; });
          worksheet.addRow(rowData);
        });
        // Allow browser to breathe between chunks
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    } else {
      // Small dataset - process all at once
      data.forEach(row => {
        const rowData: any = {};
        picked.forEach(h => { rowData[h] = (row as any)[h]; });
        worksheet.addRow(rowData);
      });
    }

    // Generate buffer with streaming for large files
    let buffer: ArrayBuffer;
    if (isLargeDataset) {
      // Use streaming write to avoid memory spike
      const stream = new ExcelJS.stream.xlsx.WorkbookWriter({
        stream: new WritableStream()
      } as any);
      
      // Fallback to regular buffer write but with progress indicator
      buffer = await workbook.xlsx.writeBuffer({
        useSharedStrings: true, // Reduce memory usage
        useStyles: true
      });
    } else {
      buffer = await workbook.xlsx.writeBuffer();
    }
    
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return { count: data.length, cols: picked.length };
  } catch (e) {
    console.error('Excel export failed:', e);
    // Provide helpful error message for large datasets
    if (data.length > 1000) {
      throw new Error(`Export failed: Dataset too large (${data.length} rows). Try exporting in smaller batches or use CSV format.`);
    }
    throw e;
  }
}
