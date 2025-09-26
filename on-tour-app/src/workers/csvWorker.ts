/// <reference lib="webworker" />
// CSV builder worker for large exports to keep UI responsive

type Row = { s: any; net: number };

type InMsg = {
  picked: string[];
  rows: Row[];
};

function esc(v: any): string {
  const s = String(v ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

// eslint-disable-next-line no-restricted-globals
self.onmessage = (e: MessageEvent<InMsg>) => {
  try {
    const { picked, rows } = e.data || { picked: [], rows: [] };
    const lines: string[] = [];
    lines.push(picked.join(','));
    for (const { s, net } of rows) {
      const full: Record<string, any> = {
        'Date': (s.date || '').slice(0, 10),
        'City': s.city,
        'Country': s.country,
        'Venue': s.venue || '',
        'WHT %': s.whtPct || 0,
        'Fee': s.fee,
        'Net': Math.round(net),
        'Status': s.status,
        'Notes': s.notes || ''
      };
      const row = picked.map(k => full[k]);
      lines.push(row.map(esc).join(','));
    }
    const csv = lines.join('\n');
    // eslint-disable-next-line no-restricted-globals
    (self as any).postMessage({ csv });
  } catch (err: any) {
    // eslint-disable-next-line no-restricted-globals
    (self as any).postMessage({ error: String(err?.message || err) });
  }
};
