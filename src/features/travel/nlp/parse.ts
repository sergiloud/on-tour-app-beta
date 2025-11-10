import { findAirportByToken } from '../data/airportsSeed';
import { norm } from '../../../lib/travel/text';

export type ParsedQuery = {
  origin?: string;
  dest?: string;
  date?: string;      // YYYY-MM-DD
  retDate?: string;   // YYYY-MM-DD
  adults?: number;
  bags?: number;
  nonstop?: boolean;
  cabin?: 'E' | 'W' | 'B' | 'F';
  errors?: string[];
};

const MONTHS_EN = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const MONTHS_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function toISO(y: number, m: number, d: number) {
  const mm = String(m).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  return `${y}-${mm}-${dd}`;
}

function parseDateToken(tok: string, locale: 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt'): string | undefined {
  // Accept YYYY-MM-DD directly
  if (/^\d{4}-\d{2}-\d{2}$/.test(tok)) return tok;
  const t = tok.toLowerCase();
  // Relative dates: today/hoy, tomorrow/mañana
  const todayWords = locale === 'es' ? ['hoy'] : ['today'];
  const tomorrowWords = locale === 'es' ? ['mañana', 'manana'] : ['tomorrow'];
  const toLocalISO = (d: Date) => toISO(d.getFullYear(), d.getMonth() + 1, d.getDate());
  if (todayWords.includes(t)) {
    const d = new Date();
    return toLocalISO(d);
  }
  if (tomorrowWords.includes(t)) {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return toLocalISO(d);
  }
  // Accept DD/MM/YYYY or DD-MM-YYYY
  let m = t.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m && m[1] && m[2] && m[3]) {
    const d = parseInt(m[1], 10); const mo = parseInt(m[2], 10); const y = parseInt(m[3], 10);
    if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) return toISO(y, mo, d);
  }
  // Accept 12 Oct 2025 / 12 Octubre 2025
  const months = locale === 'es' ? MONTHS_ES : MONTHS_EN;
  m = t.match(/^(\d{1,2})\s+([a-zA-Zñáéíóúü]+)\s+(\d{4})$/);
  if (m && m[1] && m[2] && m[3]) {
    const d = parseInt(m[1], 10); const name = m[2].normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase(); const y = parseInt(m[3], 10);
    const idx = months.findIndex(x => x.startsWith(name));
    if (idx >= 0) return toISO(y, idx + 1, d);
  }
  return undefined;
}

// norm moved to shared util

export function parseTravelQuery(input: string, locale: 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' = 'en'): ParsedQuery {
  const out: ParsedQuery = { errors: [] };
  if (!input || !input.trim()) return out;
  const text = input.trim();
  const lower = norm(text);

  // Adults (singular/plural + pax)
  let m = lower.match(/(\d+)\s*(adulto?s?|adults?|pax)/);
  if (m && m[1]) out.adults = Math.max(1, Math.min(8, parseInt(m[1], 10)));

  // Bags (singular/plural)
  m = lower.match(/(\d+)\s*(bags?|bultos?|maletas?)/);
  if (m && m[1]) out.bags = Math.max(0, Math.min(4, parseInt(m[1], 10)));

  // Cabin
  if (/business|negocios/.test(lower)) out.cabin = 'B';
  else if (/first|primera/.test(lower)) out.cabin = 'F';
  else if (/premium\s*economy/.test(lower)) out.cabin = 'W';
  else if (/economy|turista/.test(lower)) out.cabin = 'E';

  // Nonstop
  if (/non\s*stop|sin\s*escalas|directo/.test(lower)) out.nonstop = true;

  // Dates: parse inline tokens first (YYYY-MM-DD or DD/MM/YYYY)
  const parts = text.split(/[\s,;]+/);
  for (const tok of parts) {
    const iso = parseDateToken(tok, locale);
    if (iso) { if (!out.date) out.date = iso; else if (!out.retDate) out.retDate = iso; }
  }
  // Keywords like depart/salida and return/vuelta supporting multi-token natural dates
  const idxDepart = parts.findIndex(p => /^(depart|salida)$/i.test(p));
  if (idxDepart >= 0) {
    const candidate = [parts[idxDepart + 1], parts[idxDepart + 2], parts[idxDepart + 3]].filter(Boolean).join(' ');
    const nextToken = parts[idxDepart + 1];
    const iso = parseDateToken(candidate.trim(), locale) || (nextToken ? parseDateToken(nextToken, locale) : undefined);
    if (iso) out.date = iso;
  }
  const idxReturn = parts.findIndex(p => /^(return|vuelta)$/i.test(p));
  if (idxReturn >= 0) {
    const candidate = [parts[idxReturn + 1], parts[idxReturn + 2], parts[idxReturn + 3]].filter(Boolean).join(' ');
    const nextToken = parts[idxReturn + 1];
    const iso = parseDateToken(candidate.trim(), locale) || (nextToken ? parseDateToken(nextToken, locale) : undefined);
    if (iso) out.retDate = iso;
  }

  // Origin/Dest using "from X to Y" (allow two-word city names; avoid swallowing keywords)
  m = lower.match(/from\s+([\p{L}]{3,}(?:\s+[\p{L}]{2,})?)\s+to\s+([\p{L}]{3,}(?:\s+(?!depart|return)[\p{L}]{2,})?)/u);
  if (m) {
    const token1 = m[1]; const token2 = m[2];
    if (token1 && token2) {
      const a = findAirportByToken(token1); const b = findAirportByToken(token2);
      if (a) out.origin = a.iata; if (b) out.dest = b.iata;
    }
  }
  // Spanish "de X a Y" pattern (allow two-word city names; avoid swallowing keywords)
  m = lower.match(/de\s+([\p{L}]{3,}(?:\s+[\p{L}]{2,})?)\s+a\s+([\p{L}]{3,}(?:\s+(?!salida|vuelta)[\p{L}]{2,})?)/u);
  if (m) {
    const token1 = m[1]; const token2 = m[2];
    if (token1 && token2) {
      const a = findAirportByToken(token1); const b = findAirportByToken(token2);
      if (a) out.origin = a.iata; if (b) out.dest = b.iata;
    }
  }

  // Fallback: standalone 3-letter tokens become IATA guesses (first two)
  if (!out.origin || !out.dest) {
    const iatas = parts.map(p => p.toUpperCase()).filter(p => /^[A-Z]{3}$/.test(p));
    if (iatas.length >= 2) { if (!out.origin) out.origin = iatas[0]; if (!out.dest) out.dest = iatas[1]; }
  }

  // Basic sanity
  if (out.origin && out.dest && out.origin === out.dest) out.errors!.push('same_route');
  if (out.date && out.retDate && out.retDate < out.date) out.errors!.push('return_before_depart');

  if (!out.errors!.length) delete out.errors; // clean if no errors
  return out;
}
