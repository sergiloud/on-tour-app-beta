import { useMemo } from 'react';
import type { DemoShow } from '../../lib/demoShows';
import { useShows } from '../../hooks/useShows';
import { useSettings, type Region, type DateRange } from '../../context/SettingsContext';

export function regionOf(country?: string): 'AMER'|'EMEA'|'APAC' {
  const c = (country||'').toUpperCase();
  const AMER = ['US','CA','MX','BR','AR','CL','CO'];
  const EMEA = ['GB','FR','DE','ES','PT','EG','KE','ZA','AE'];
  if (AMER.includes(c)) return 'AMER';
  if (EMEA.includes(c)) return 'EMEA';
  return 'APAC';
}

export function applyDateRange(list: DemoShow[], dateRange: DateRange): DemoShow[] {
  const fromTs = dateRange.from ? new Date(dateRange.from).getTime() : -Infinity;
  const toTs = dateRange.to ? new Date(dateRange.to + 'T23:59:59').getTime() : Infinity;
  return list.filter(s => {
    const t = new Date(s.date).getTime();
    return t >= fromTs && t <= toTs;
  });
}

export function applyRegion(list: DemoShow[], region: Region): DemoShow[] {
  if (region === 'all') return list;
  return list.filter(s => regionOf(s.country) === region);
}

export function teamOf(id: string): 'A'|'B' {
  return (id.charCodeAt(0) + id.length) % 2 === 0 ? 'A' : 'B';
}

// Trivial memoization keyed by object identity of inputs + primitive args
let _lastArgs: { listRef: DemoShow[]|null; region: Region; from: string; to: string } = { listRef: null, region: 'all', from: '', to: '' };
let _lastOut: DemoShow[] = [];
export function selectFilteredShows(list: DemoShow[], opts: { region: Region; dateRange: DateRange }): DemoShow[] {
  const from = opts.dateRange.from; const to = opts.dateRange.to; const region = opts.region;
  if (_lastArgs.listRef === list && _lastArgs.region === region && _lastArgs.from === from && _lastArgs.to === to) return _lastOut;
  const res = applyRegion(applyDateRange(list, opts.dateRange), opts.region);
  // Deep-ish memo: if resulting list has same length and same ids in order as previous,
  // return previous array to keep referential equality and avoid downstream re-renders.
  if (_lastOut.length === res.length && _lastOut.length > 0) {
    let same = true;
    for (let i = 0; i < res.length && same; i++) {
      // @ts-ignore DemoShow has id
      if ((_lastOut[i] as any).id !== (res[i] as any).id) same = false;
    }
    if (same) {
      _lastArgs = { listRef: list, region, from, to };
      return _lastOut;
    }
  }
  _lastArgs = { listRef: list, region, from, to };
  _lastOut = res;
  return res;
}

export function useFilteredShows() {
  const { shows } = useShows();
  const { region, dateRange } = useSettings();
  const filtered = useMemo(() => selectFilteredShows(shows, { region, dateRange }), [shows, region, dateRange]);
  return { shows: filtered };
}
