// Shared export utilities for Shows CSV/XLSX
// Contract
// - rows: array of { s: show-like object, net: number }
// - exportCols: Record<Header, boolean>
// - selectedIds (optional): limit to selected rows
// - filenamePrefix (optional): default 'shows'
// - Returns count & cols for telemetry

export type ShowRow = { s: any; net: number };

const HEADERS = ['Date','City','Country','Venue','WHT %','Fee','Net','Status','Notes'] as const;
export type Header = typeof HEADERS[number];

function pickHeaders(exportCols: Record<string, boolean>){
  const picked = HEADERS.filter(h => exportCols[h]);
  // If user managed to unselect all, fall back to all headers to avoid empty files
  return picked.length > 0 ? picked : [...HEADERS];
}

function buildSource(rows: ShowRow[], selectedIds?: Set<string>){
  const src = selectedIds && selectedIds.size>0 ? rows.filter(r=> selectedIds.has(r.s.id)) : rows;
  return src.map(({ s, net }) => ({
    'Date': String(s.date||'').slice(0,10),
    'City': s.city,
    'Country': s.country,
    'Venue': (s as any).venue || '',
    'WHT %': (s as any).whtPct || 0,
    'Fee': s.fee,
    'Net': Math.round(net),
    'Status': s.status,
    'Notes': (s as any).notes || ''
  } satisfies Record<Header, any>));
}

export function exportShowsCsv(rows: ShowRow[], exportCols: Record<string, boolean>, selectedIds?: Set<string>, filenamePrefix = 'shows'){
  const picked = pickHeaders(exportCols);
  const data = buildSource(rows, selectedIds);
  const esc = (v:any)=>{ const s = String(v??''); return /[",\n]/.test(s) ? '"'+s.replace(/"/g,'""')+'"' : s; };
  const out = [picked.join(',')];
  for(const row of data){ out.push(picked.map(h=> esc((row as any)[h])).join(',')); }
  const blob = new Blob([out.join('\n')], { type:'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filenamePrefix}-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  setTimeout(()=> URL.revokeObjectURL(url), 1000);
  return { count: data.length, cols: picked.length };
}

export async function exportShowsXlsx(rows: ShowRow[], exportCols: Record<string, boolean>, selectedIds?: Set<string>, filenamePrefix = 'shows'){
  const picked = pickHeaders(exportCols);
  const data = buildSource(rows, selectedIds).map(row => {
    const o: any = {};
    picked.forEach(h => { o[h] = (row as any)[h]; });
    return o;
  });
  try {
    const XLSX: any = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Shows');
    const out = XLSX.write(wb, { type:'array', bookType:'xlsx' });
    const blob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filenamePrefix}-${new Date().toISOString().slice(0,10)}.xlsx`;
    a.click();
    setTimeout(()=> URL.revokeObjectURL(url), 1000);
    return { count: data.length, cols: picked.length };
  } catch (e){
    // Re-throw so caller can report error
    throw e;
  }
}
