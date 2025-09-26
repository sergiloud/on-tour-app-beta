// Tiny .ics (iCalendar) importer for VEVENT DTSTART/DTEND/SUMMARY/LOCATION
// This is a minimal parser for demo purposes; it supports unfolded lines and simple properties.

export type IcsEvent = {
  summary?: string;
  location?: string;
  dtStart?: string; // ISO
  dtEnd?: string;   // ISO
};

function unfoldLines(text: string): string[] {
  // RFC5545: lines may be folded with CRLF followed by a single space or tab
  const raw = text.replace(/\r\n[ \t]/g, '');
  return raw.split(/\r?\n/);
}

function parseDate(val: string): string | undefined {
  // Supports: YYYYMMDD or YYYYMMDDTHHMMSSZ
  const v = val.trim();
  if (/^\d{8}$/.test(v)) {
    const y = v.slice(0,4), m = v.slice(4,6), d = v.slice(6,8);
    return `${y}-${m}-${d}T00:00:00Z`;
  }
  if (/^\d{8}T\d{6}Z?$/.test(v)) {
    const y = v.slice(0,4), m = v.slice(4,6), d = v.slice(6,8);
    const hh = v.slice(9,11), mm = v.slice(11,13), ss = v.slice(13,15);
    const z = v.endsWith('Z') ? 'Z' : '';
    return `${y}-${m}-${d}T${hh}:${mm}:${ss}${z}`;
  }
  // Attempt fallback via Date parse
  try { const iso = new Date(v).toISOString(); return iso; } catch { return undefined; }
}

export function parseICS(text: string): IcsEvent[] {
  const lines = unfoldLines(text);
  const out: IcsEvent[] = [];
  let cur: IcsEvent | null = null;
  for (const line of lines) {
    if (line.startsWith('BEGIN:VEVENT')) { cur = {}; continue; }
    if (line.startsWith('END:VEVENT')) { if (cur) out.push(cur); cur = null; continue; }
    if (!cur) continue;
    const [rawKey, ...rest] = line.split(':');
    const value = rest.join(':');
    const key = rawKey.split(';')[0].toUpperCase();
    if (key === 'SUMMARY') cur.summary = value;
    else if (key === 'LOCATION') cur.location = value;
    else if (key === 'DTSTART') cur.dtStart = parseDate(value);
    else if (key === 'DTEND') cur.dtEnd = parseDate(value);
  }
  return out;
}
