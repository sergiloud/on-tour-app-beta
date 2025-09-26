import type { FlightResult, FlightSearchParams } from './types';

const carriers = ['IB', 'AF', 'LH', 'BA', 'KL', 'SK', 'TK', 'UX', 'U2', 'FR'];

function rnd(seed: number) { return () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }; }

function pick<T>(arr: T[], r: () => number) { return arr[Math.floor(r() * arr.length)]; }

export async function mockSearch(p: FlightSearchParams, opts?: { signal?: AbortSignal }): Promise<FlightResult[]> {
  // Simulate latency and allow abort
  const start = Date.now();
  const r = rnd(start + p.origin.length*17 + p.dest.length*13 + (p.nonstop?7:3));
  const base = 60 * (2 + Math.floor(r()*6)); // base minutes 2-7h
  const count = 6 + Math.floor(r()*5); // 6-10 results
  const out: FlightResult[] = [];
  for (let i=0;i<count;i++){
    if (opts?.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    const nonstop = p.nonstop ? true : r() > 0.35; // ~65% nonstop unless forced
    const stops = nonstop ? 0 : (r()>0.7 ? 2 : 1);
    const durationM = base + (stops? 60 * stops * (0.6 + r()) : Math.floor(r()*50));
    const dep = new Date(`${p.date}T0${8 + Math.floor(r()*12)}:${Math.floor(r()*60).toString().padStart(2,'0')}:00Z`);
    const arr = new Date(dep.getTime() + durationM*60000);
    const price = Math.round((120 + r()*260) * (1 + (stops? 0.15*stops : 0)));
    out.push({
      id: `${p.origin}-${p.dest}-${i}`,
      origin: p.origin,
      dest: p.dest,
      dep: dep.toISOString(),
      arr: arr.toISOString(),
      durationM,
      stops,
      price,
      currency: 'EUR',
      carrier: pick(carriers, r)
    });
  }
  // Fake network delay 180-420ms
  const delay = 180 + Math.floor(r()*240);
  await new Promise((res, rej)=>{
    const t = setTimeout(res, delay);
    opts?.signal?.addEventListener('abort', () => { clearTimeout(t); rej(new DOMException('Aborted', 'AbortError')); });
  });
  return out;
}
