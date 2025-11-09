import React from 'react';
import type { FlightSearchParams, FlightResult } from '../../../travel/providers/types';
import { searchFlights } from '../../../travel/providers';
import { t } from '../../../../lib/i18n';
import { loadJSON, saveJSON } from '../../../../lib/persist';
import { useRecentSearches } from '../../../../lib/useRecentSearches';
import type { FlightSearch as RecentFlightSearch } from '../../../../lib/useRecentSearches';
import AirportAutocomplete from './AirportAutocomplete';
import { parseTravelQuery } from '../../nlp/parse';
import { getLang } from '../../../../lib/i18n';
import { countryLabel } from '../../../../lib/countries';
import { addSegment } from '../../../../services/trips';
import { announce } from '../../../../lib/announcer';
import { trackEvent } from '../../../../lib/telemetry';
import QuickTripPicker from '../../../../components/travel/QuickTripPicker';

const ArrowUpIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
  </svg>
);

const ArrowDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
  </svg>
);
import { Button } from '../../../../ui/Button';
import { buildGoogleFlightsMultiUrl } from '../../../../lib/travel/deeplink';
import { showStore } from '../../../../shared/showStore';
import type { Show } from '../../../../lib/shows';
import { findAirport } from '../../../../lib/airports';
import FlightResults from './FlightResults';
import FlightResultsSkeleton from './FlightResultsSkeleton';
import { getCurrentOrgId } from '../../../../lib/tenants';

export type SmartFlightSearchHandle = { openAddToTrip: (r: FlightResult) => void };
type SmartFlightSearchProps = {
  initial?: Partial<FlightSearchParams>;
  onTripSelected?: (tripId: string) => void;
  onResultsChange?: (results: FlightResult[]) => void;
  onGroupedChange?: (grouped?: Record<string, FlightResult[]>) => void;
  onDeepLinkChange?: (url?: string) => void;
  onLoadingChange?: (loading: boolean) => void;
  onErrorChange?: (error?: string) => void;
  onParamsChange?: (params: Partial<FlightSearchParams>) => void;
};

const SmartFlightSearch = React.forwardRef<SmartFlightSearchHandle, SmartFlightSearchProps>(function SmartFlightSearch({ initial, onTripSelected, onResultsChange, onGroupedChange, onDeepLinkChange, onLoadingChange, onErrorChange, onParamsChange }, ref) {
  const lang = getLang();
  const [p, setP] = React.useState<Partial<FlightSearchParams>>({ adults: 1, bags: 1, cabin: 'E', nonstop: true, ...initial });
  const [state, setState] = React.useState<{ loading: boolean; results: FlightResult[]; deepLink?: string; error?: string; grouped?: Record<string, FlightResult[]> }>({ loading: false, results: [] });
  const debRef = React.useRef<number | undefined>(undefined);
  const [roundTrip, setRoundTrip] = React.useState<boolean>(() => !!initial?.retDate || new URLSearchParams(window.location.search).has('retDate'));
  const flexCtrlsRef = React.useRef<AbortController[]>([]);
  const [flexDays, setFlexDays] = React.useState<number>(() => {
    const sp = new URLSearchParams(window.location.search);
    const v = Number(sp.get('flex') || 0);
    return Number.isFinite(v) ? Math.max(0, Math.min(3, v)) : 0;
  });
  // Discreet text entry panel (optional)
  const [showText, setShowText] = React.useState<boolean>(false);
  const [text, setText] = React.useState<string>('');
  const [advancedOpen, setAdvancedOpen] = React.useState<boolean>(() => loadJSON('travel.advancedOpen', false));
  const [errors, setErrors] = React.useState<string[]>([]);
  const { recentSearches, addRecentSearch } = useRecentSearches();
  // Optional association with a show
  const [relatedShowId, setRelatedShowId] = React.useState<string | undefined>(undefined);

  // Multi-city builder state
  const [multiOpen, setMultiOpen] = React.useState<boolean>(() => loadJSON('travel.multicity.open', false));
  const [segments, setSegments] = React.useState<{ from: string; to: string; date: string }[]>(() => loadJSON('travel.multicity.segments', []) || []);
  const addLeg = () => setSegments(list => {
    const lastLeg = list[list.length - 1];
    const from = list.length ? (lastLeg?.to || '') : (p.origin || '');
    const to = list.length ? '' : (p.dest || '');
    const date = list.length ? '' : (p.date || '');
    return [...list, { from, to, date }];
  });
  const removeLeg = (i: number) => setSegments(list => list.filter((_, idx) => idx !== i));
  const updateLeg = (i: number, patch: Partial<{ from: string; to: string; date: string }>) => setSegments(list => list.map((it, idx) => idx === i ? { ...it, ...patch } : it));
  const moveLeg = (i: number, dir: -1 | 1) => setSegments(list => {
    const j = i + dir; if (j < 0 || j >= list.length) return list;
    const copy = list.slice();
    const [it] = copy.splice(i, 1);
    if (!it) return list;
    copy.splice(j, 0, it);
    return copy;
  });
  const canOpenMulti = segments.length >= 2 && segments.every(s => s.from && s.to && s.date);
  const openMulti = () => {
    if (!canOpenMulti) return;
    if (!segments[0]) return;
    const { url } = buildGoogleFlightsMultiUrl({ legs: segments.map(s => ({ from: s.from, to: s.to, date: s.date })), adults: p.adults || 1, bags: p.bags || 0, cabin: (p.cabin === 'E' ? 'ECONOMY' : p.cabin === 'W' ? 'PREMIUM_ECONOMY' : p.cabin === 'B' ? 'BUSINESS' : 'FIRST') as any });
    window.open(url, '_blank', 'noreferrer');
  };

  React.useEffect(() => { saveJSON('travel.advancedOpen', advancedOpen); }, [advancedOpen]);
  // Persist multicity UI state
  React.useEffect(() => { saveJSON('travel.multicity.open', multiOpen); }, [multiOpen]);
  React.useEffect(() => { saveJSON('travel.multicity.segments', segments); }, [segments]);
  // Seed segments from current single search when opening multicity
  React.useEffect(() => {
    if (multiOpen && segments.length === 0) {
      if (p.origin && p.dest && p.date) {
        const base = [{ from: p.origin, to: p.dest, date: p.date }];
        const rt = p.retDate ? [{ from: p.dest!, to: p.origin!, date: p.retDate! }] : [];
        setSegments([...base, ...rt]);
      } else {
        setSegments([{ from: p.origin || '', to: p.dest || '', date: p.date || '' }]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multiOpen]);
  React.useEffect(() => { // persist core advanced fields
    saveJSON('travel.pref.cabin', p.cabin);
    saveJSON('travel.pref.bags', p.bags);
    saveJSON('travel.pref.nonstop', p.nonstop);
  }, [p.cabin, p.bags, p.nonstop]);

  // Hydrate from URL on mount if not provided
  React.useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const next: Partial<FlightSearchParams> = {};
    const or = sp.get('origin'); if (or) next.origin = or;
    const de = sp.get('dest'); if (de) next.dest = de;
    const dt = sp.get('date'); if (dt) next.date = dt;
    const rt = sp.get('retDate'); if (rt) next.retDate = rt;
    const ad = sp.get('adults'); if (ad) next.adults = Number(ad);
    const bg = sp.get('bags'); if (bg) next.bags = Number(bg);
    const cb = sp.get('cabin'); if (cb) next.cabin = cb as any;
    const ns = sp.get('nonstop'); if (ns) next.nonstop = ns === '1' || ns === 'true';
    if (Object.keys(next).length) setP(q => ({ ...q, ...next }));
    // hydrate adv prefs
    setP(q => ({
      ...q,
      cabin: (loadJSON('travel.pref.cabin', q.cabin) || q.cabin) as any,
      bags: (loadJSON('travel.pref.bags', q.bags) || q.bags) as any,
      nonstop: (loadJSON('travel.pref.nonstop', q.nonstop) || q.nonstop) as any,
    }));
  }, []);

  const syncUrl = React.useCallback((params: Partial<FlightSearchParams>) => {
    const u = new URL(window.location.href);
    const setOrDel = (k: string, v?: string | number | boolean) => {
      if (v === undefined || v === '' || v === false) u.searchParams.delete(k);
      else u.searchParams.set(k, String(v));
    };
    setOrDel('origin', params.origin);
    setOrDel('dest', params.dest);
    setOrDel('date', params.date);
    setOrDel('retDate', params.retDate);
    setOrDel('adults', params.adults);
    setOrDel('bags', params.bags);
    setOrDel('cabin', params.cabin);
    setOrDel('nonstop', params.nonstop ? 1 : undefined);
    window.history.replaceState({}, '', u.toString());
  }, []);

  const run = React.useCallback((params: Partial<FlightSearchParams>) => {
    if (!params.origin || !params.dest || !params.date) return;
    // Basic visible validation
    const errs: string[] = [];
    if (params.origin && params.dest && params.origin === params.dest) errs.push('same_route');
    if (params.date && params.retDate && params.retDate < params.date) errs.push('return_before_depart');
    setErrors(errs);
    if (errs.length) return;
    if (debRef.current) window.clearTimeout(debRef.current);
    const full = params as FlightSearchParams;
    debRef.current = window.setTimeout(() => {
      setState(s => ({ ...s, loading: true, error: undefined }));
      try { onLoadingChange?.(true); } catch { }
      try { onErrorChange?.(undefined); } catch { }
      try { onDeepLinkChange?.(undefined); } catch { }
      try { onGroupedChange?.(undefined); } catch { }
      syncUrl(params);
      const start = performance.now();
      try { trackEvent('travel.search.started', { origin: full.origin, dest: full.dest }); } catch { }
      // If flex window active, run parallel searches for ±N days
      if (flexDays > 0) {
        // Abort any previous flex controllers
        try { flexCtrlsRef.current.forEach(c => c.abort()); } catch { }
        flexCtrlsRef.current = [];
        const offsets = Array.from({ length: 2 * flexDays + 1 }, (_, i) => i - flexDays);
        const shiftISO = (iso: string, delta: number) => {
          const [y, m, d] = iso.split('-').map(Number);
          const base = new Date(y ?? 2024, ((m ?? 1) - 1), d ?? 1);
          base.setDate(base.getDate() + delta);
          const yy = base.getFullYear();
          const mm = String(base.getMonth() + 1).padStart(2, '0');
          const dd = String(base.getDate()).padStart(2, '0');
          return `${yy}-${mm}-${dd}`;
        };
        const calls = offsets.map(off => {
          const ctrl = new AbortController();
          flexCtrlsRef.current.push(ctrl);
          const req = { ...full, date: shiftISO(full.date, off) } as FlightSearchParams;
          return searchFlights(req, { signal: ctrl.signal })
            .then(res => ({ off, date: req.date, res }))
            .catch(err => ({ off, date: req.date, err }));
        });
        Promise.all(calls).then(items => {
          const grouped: Record<string, FlightResult[]> = {};
          let baseResults: FlightResult[] = [];
          let baseLink: string | undefined = undefined;
          for (const it of items) {
            if ('res' in it && it.res && Array.isArray(it.res.results)) {
              grouped[it.date] = it.res.results;
              if (it.off === 0) {
                baseResults = it.res.results;
                baseLink = it.res.deepLink;
              }
            }
          }
          setState({ loading: false, results: baseResults, deepLink: baseLink, grouped });
          try { onLoadingChange?.(false); } catch { }
          try { onResultsChange?.(baseResults); } catch { }
          try { onGroupedChange?.(grouped); } catch { }
          try { onDeepLinkChange?.(baseLink); } catch { }
          try { trackEvent('travel.search.completed', { ms: Math.round(performance.now() - start), count: baseResults.length, flex: flexDays }); } catch { }
          addRecentSearch({ origin: full.origin, destination: full.dest, departDate: full.date, returnDate: full.retDate });
        }).catch(err => {
          if (err?.name === 'AbortError') return;
          setState({ loading: false, results: [], deepLink: undefined, error: 'search_failed' });
          try { onLoadingChange?.(false); } catch { }
          try { onResultsChange?.([]); } catch { }
          try { onErrorChange?.('search_failed'); } catch { }
          try { trackEvent('travel.search.error'); } catch { }
        });
        return;
      }
      // Default single-day search
      const ac = new AbortController();
      searchFlights(full, { signal: ac.signal }).then(res => {
        setState({ loading: false, results: res.results, deepLink: res.deepLink, grouped: undefined });
        try { onLoadingChange?.(false); } catch { }
        try { onResultsChange?.(res.results); } catch { }
        try { onGroupedChange?.(undefined); } catch { }
        try { onDeepLinkChange?.(res.deepLink); } catch { }
        try { trackEvent('travel.search.completed', { ms: Math.round(performance.now() - start), count: res.results.length }); } catch { }
        addRecentSearch({ origin: full.origin, destination: full.dest, departDate: full.date, returnDate: full.retDate });
      }).catch(err => {
        if (err?.name === 'AbortError') return;
        setState({ loading: false, results: [], deepLink: undefined, error: 'search_failed' });
        try { onLoadingChange?.(false); } catch { }
        try { onResultsChange?.([]); } catch { }
        try { onErrorChange?.('search_failed'); } catch { }
        try { trackEvent('travel.search.error'); } catch { }
      });
    }, 250) as any;
  }, []);

  React.useEffect(() => { run(p); }, [p.origin, p.dest, p.date, p.retDate, p.adults, p.bags, p.cabin, p.nonstop]);
  // In test environment, if we already have origin/dest/date on mount, run immediately to populate results earlier
  React.useEffect(() => {
    const isTest = typeof import.meta !== 'undefined' && (import.meta as any).env?.MODE === 'test';
    if (isTest && p.origin && p.dest && p.date && state.results.length === 0 && !state.loading) {
      run(p);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.origin, p.dest, p.date]);
  React.useEffect(() => { try { onParamsChange?.(p); } catch { } }, [p.origin, p.dest, p.date, p.retDate, p.adults, p.bags, p.cabin, p.nonstop]);

  const formatDateInput = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Share search URL
  const [copied, setCopied] = React.useState(false);
  const [shareError, setShareError] = React.useState<string | undefined>(undefined);
  const shareSearch = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareError(undefined);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      setShareError('clipboard_blocked');
    }
  };

  // Add-to-trip modal using QuickTripPicker
  const [pendingAdd, setPendingAdd] = React.useState<FlightResult | null>(null);
  React.useImperativeHandle(ref, () => ({ openAddToTrip: (r: FlightResult) => setPendingAdd(r) }), []);
  const closeAddModal = () => setPendingAdd(null);
  const confirmAddToTrip = (tripId: string) => {
    const r = pendingAdd; if (!r) return;
    addSegment(tripId, { type: 'flight', from: r.origin, to: r.dest, dep: r.dep, arr: r.arr, carrier: r.carrier, price: r.price, currency: (r.currency as any) });
    announce(t('travel.trip.added') || 'Added to trip');
    try { trackEvent('travel.trip.addSegment', { type: 'flight' }); } catch { }
    setPendingAdd(null);
    try { onTripSelected?.(tripId); } catch { }
  };

  // Helpers for summaries
  const cabinLabel = (c: any) => c === 'W' ? 'Premium Economy' : c === 'B' ? 'Business' : c === 'F' ? 'First' : 'Economy';
  const bagsLabel = (n: number | undefined) => `${n || 0} ${n === 1 ? (t('travel.bag') || 'bag') : (t('travel.bags') || 'bags')}`;
  return (
    <div className="space-y-2">
      <div className="space-y-2">
        <div className="text-sm font-medium opacity-80">{t('travel.search.title') || 'Buscador'}</div>

        {/* Related show autocomplete */}
        <ShowAutocomplete
          label={t('travel.related_show') || 'Relacionado con show'}
          onSelect={(show) => {
            setRelatedShowId(show.id);
            const cand = findAirport(show.city);
            const firstAirport = cand?.[0];
            const best = firstAirport ? firstAirport.iata : '';
            const d = new Date(show.date);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            setP(q => ({ ...q, dest: best || q.dest, date: `${y}-${m}-${day}` }));
            try { trackEvent('travel.related.show.select', { id: show.id, city: show.city }); } catch { }
          }}
        />

        {/* Main form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-base">
          <AirportAutocomplete
            label={t('travel.search.origin') || t('travel.from') || 'Origin'}
            altLabel="From"
            value={p.origin || ''}
            placeholder="MAD"
            onChange={(v) => setP(q => ({ ...q, origin: v }))}
            invalid={!!p.origin && !!p.dest && p.origin === p.dest}
            describedBy={errors.length ? 'travel-errors' : undefined}
          />
          <AirportAutocomplete
            label={t('travel.search.destination') || t('travel.to') || 'Destination'}
            altLabel="To"
            value={p.dest || ''}
            placeholder="JFK"
            onChange={(v) => setP(q => ({ ...q, dest: v }))}
            invalid={!!p.origin && !!p.dest && p.origin === p.dest}
            describedBy={errors.length ? 'travel-errors' : undefined}
          />
          <label className="flex flex-col gap-1">
            <span className="text-xs opacity-70">{t('common.date') || 'Date'}</span>
            <input
              type="date"
              value={p.date || ''}
              onChange={e => setP(q => ({ ...q, date: e.target.value }))}
              className="bg-slate-100 dark:bg-white/5 rounded px-3 py-2"
              aria-invalid={errors.includes('return_before_depart')}
              aria-describedby={errors.length ? 'travel-errors' : undefined}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs opacity-70">{t('travel.adults') || 'Adults'}</span>
            <input type="number" min={1} max={8} value={p.adults || 1} onChange={e => setP(q => ({ ...q, adults: Number(e.target.value) }))} className="bg-slate-100 dark:bg-white/5 rounded px-3 py-2" />
          </label>
          {roundTrip && (
            <label className="flex flex-col gap-1 md:col-span-1">
              <span className="text-xs opacity-70">{t('travel.return') || 'Return'}</span>
              <input type="date" value={p.retDate || ''} onChange={e => setP(q => ({ ...q, retDate: e.target.value }))} className="bg-slate-100 dark:bg-white/5 rounded px-3 py-2" aria-invalid={errors.includes('return_before_depart')} aria-describedby={errors.length ? 'travel-errors' : undefined} />
            </label>
          )}
        </div>

        {/* Quick actions row */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Button type="button" variant="ghost" size="sm" data-testid="swap-route" aria-label={t('travel.swap') || 'Swap'} onClick={() => setP(q => ({ ...q, origin: q.dest, dest: q.origin }))}>{t('travel.swap') || 'Swap'}</Button>
          <div className="inline-flex items-center gap-2">
            <div role="group" aria-label="Trip type" className="inline-flex rounded-full bg-slate-100 dark:bg-white/5 p-0.5">
              <Button
                type="button"
                variant={roundTrip ? 'ghost' : 'primary'}
                size="sm"
                aria-pressed={!roundTrip}
                aria-label={t('travel.one_way') || 'One-way'}
                onClick={() => { setRoundTrip(false); setP(q => ({ ...q, retDate: undefined })); }}
              >{t('travel.one_way') || 'One-way'}</Button>
              <Button
                type="button"
                variant={roundTrip ? 'primary' : 'ghost'}
                size="sm"
                aria-pressed={roundTrip}
                aria-label={t('travel.round_trip') || 'Round trip'}
                onClick={() => setRoundTrip(r => {
                  if (r) { // toggle off
                    setP(q => ({ ...q, retDate: undefined }));
                    return false;
                  }
                  return true;
                })}
              >{t('travel.round_trip') || 'Round trip'}</Button>
            </div>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => { const d = new Date(); d.setDate(d.getDate() + 1); setP(q => ({ ...q, date: formatDateInput(d) })); }}>{t('common.tomorrow') || 'Tomorrow'}</Button>
          <div className="ml-auto inline-flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={shareSearch} aria-live="polite">{copied ? (t('common.copied') || 'Copied') : (t('travel.share_search') || 'Share search')}</Button>
            <Button type="button" variant="primary" size="sm" onClick={() => run(p)} disabled={!!errors.length || !p.origin || !p.dest || !p.date}>{t('common.search') || 'Search'}</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setMultiOpen(v => !v)} aria-expanded={multiOpen}>{t('travel.multicity.toggle') || 'Multicity'}</Button>
          </div>
        </div>

        {/* Discreet text entry link under form */}
        <button type="button" className="text-xs underline opacity-80 hover:opacity-100" onClick={() => setShowText(v => !v)} aria-expanded={showText} aria-controls="travel-text-panel">
          {showText ? (t('travel.search.hide_text') || 'Ocultar entrada libre') : (t('travel.search.show_text') || 'Entrada libre (opcional)')}
        </button>
        {showText && (
          <div id="travel-text-panel" className="space-y-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs opacity-70">{t('travel.nlp') || 'NLP'}</span>
              <input
                type="text"
                className="bg-slate-100 dark:bg-white/5 rounded px-2 py-1"
                placeholder={t('travel.search.text.placeholder') || 'Ej: 2 adultos MAD a CDG mañana sin escalas'}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const parsed = parseTravelQuery(text, getLang());
                    setP(q => ({
                      ...q,
                      origin: parsed.origin ?? q.origin,
                      dest: parsed.dest ?? q.dest,
                      date: parsed.date ?? q.date,
                      retDate: parsed.retDate ?? q.retDate,
                      adults: parsed.adults ?? q.adults,
                      bags: parsed.bags ?? q.bags,
                      cabin: parsed.cabin ?? q.cabin,
                      nonstop: parsed.nonstop ?? q.nonstop,
                    }));
                  }
                }}
              />
            </label>
            {text.trim() && (() => {
              const parsed = parseTravelQuery(text, getLang());
              const chips = [];
              if (parsed.origin) chips.push({ key: 'origin', label: t('travel.from') || 'From', value: parsed.origin });
              if (parsed.dest) chips.push({ key: 'dest', label: t('travel.to') || 'To', value: parsed.dest });
              if (parsed.date) chips.push({ key: 'date', label: t('common.date') || 'Date', value: new Date(parsed.date).toLocaleDateString() });
              if (parsed.retDate) chips.push({ key: 'retDate', label: t('travel.return') || 'Return', value: new Date(parsed.retDate).toLocaleDateString() });
              if (parsed.adults) chips.push({ key: 'adults', label: t('travel.adults') || 'Adults', value: parsed.adults.toString() });
              if (parsed.cabin) chips.push({ key: 'cabin', label: t('travel.cabin') || 'Cabin', value: parsed.cabin });
              if (parsed.nonstop !== undefined) chips.push({ key: 'nonstop', label: t('travel.nonstop') || 'Nonstop', value: parsed.nonstop ? 'Yes' : 'No' });

              return chips.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-2">
                  {chips.map(chip => (
                    <span
                      key={chip.key}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-accent-500/20 text-accent-100 rounded-full border border-accent-500/30"
                    >
                      <span className="opacity-70">{chip.label}:</span>
                      <span className="font-medium">{chip.value}</span>
                    </span>
                  ))}
                </div>
              ) : null;
            })()}
            <div className="text-xs opacity-70">{t('common.optional') || 'Optional'} — Enter para aplicar</div>
          </div>
        )}

        {/* recent searches */}
        <RecentChips onPick={(r) => setP(r)} items={recentSearches} />

        {/* Advanced options accordion */}
        <div className="text-xs">
          <button
            type="button"
            className="underline opacity-80 hover:opacity-100"
            aria-expanded={advancedOpen}
            aria-controls="travel-advanced"
            onClick={() => setAdvancedOpen(v => !v)}
          >
            {advancedOpen ? (t('travel.advanced.hide') || 'Ocultar opciones avanzadas') : (t('travel.advanced.show') || 'Más opciones')}
          </button>
          {!advancedOpen && (
            <span className="ml-2 opacity-70">
              {(p.nonstop ? (t('travel.nonstop') || 'Nonstop') : (t('travel.stops_ok') || 'Stops ok'))}
              {' • '}{bagsLabel(p.bags)}
              {' • '}{cabinLabel(p.cabin)}
              {flexDays > 0 ? ` • ±${flexDays}d` : ''}
            </span>
          )}
          {advancedOpen && (
            <div id="travel-advanced" className="mt-2 flex flex-wrap items-center gap-2 opacity-90">
              <button type="button" className={`inline-flex items-center gap-1 rounded px-2 py-1 ${p.nonstop ? 'bg-white/10' : 'bg-white/5'}`} onClick={() => setP(q => ({ ...q, nonstop: !q.nonstop }))} aria-pressed={!!p.nonstop}>
                <span>•</span>
                <span>{t('travel.nonstop') || 'Nonstop'}</span>
              </button>
              <label className="inline-flex items-center gap-1 bg-slate-100 dark:bg-white/5 rounded px-2 py-1">
                <span role="img" aria-label="Bags">🧳</span>
                <span>{t('travel.bags') || 'Bags'}</span>
                <input type="number" min={0} max={4} value={p.bags || 0} onChange={e => setP(q => ({ ...q, bags: Number(e.target.value) }))} className="w-14 bg-transparent" />
              </label>
              <label className="inline-flex items-center gap-1 bg-slate-100 dark:bg-white/5 rounded px-2 py-1">
                <span role="img" aria-label="Cabin">💺</span>
                <span>{t('travel.cabin') || 'Cabin'}</span>
                <select value={(p.cabin as any) || 'E'} onChange={e => setP(q => ({ ...q, cabin: e.target.value as any }))} className="bg-transparent">
                  <option value="E">Economy</option>
                  <option value="W">Premium Economy</option>
                  <option value="B">Business</option>
                  <option value="F">First</option>
                </select>
              </label>
              <label className="inline-flex items-center gap-1 bg-slate-100 dark:bg-white/5 rounded px-2 py-1">
                <span>{t('travel.flex_window') || 'Flex window'}</span>
                <input type="number" min={0} max={3} value={flexDays} onChange={(e) => {
                  const val = Math.max(0, Math.min(3, Number(e.target.value)));
                  setFlexDays(val);
                  const u = new URL(window.location.href);
                  if (val > 0) u.searchParams.set('flex', String(val)); else u.searchParams.delete('flex');
                  window.history.replaceState({}, '', u.toString());
                }} className="w-14 bg-transparent" />
              </label>
              <span className="opacity-60">{flexDays > 0 ? t('travel.flex_hint').replace('%d', String(flexDays)) : (t('common.optional') || 'Optional')}</span>
            </div>
          )}
        </div>

        {!!errors.length && (
          <div id="travel-errors" className="flex flex-wrap gap-2 text-sm mt-1" role="alert">
            {errors.includes('same_route') && (
              <span className="px-2 py-1 rounded bg-red-500/20 border border-red-500/30">{t('travel.error.same_route') || 'Origin and destination are the same'}</span>
            )}
            {errors.includes('return_before_depart') && (
              <span className="px-2 py-1 rounded bg-red-500/20 border border-red-500/30">{t('travel.error.return_before_depart') || 'Return before departure'}</span>
            )}
          </div>
        )}

        {shareError && (
          <div className="mt-2 text-xs" role="alert">
            <div className="font-semibold">{t('copy.manual.title') || 'Manual copy'}</div>
            <div className="opacity-80">{t('copy.manual.desc') || 'Copy the text below if clipboard is blocked.'}</div>
            <div className="mt-1 p-2 rounded bg-slate-100 dark:bg-white/5 select-all break-all">{window.location.href}</div>
          </div>
        )}

        {/* Results list (embedded for test expectations) */}
        {state.loading ? <FlightResultsSkeleton /> : <FlightResults results={state.results} onAdd={(r) => setPendingAdd(r)} />}
      </div>

      {/* Multi-city builder (still part of controls) */}
      {multiOpen && (
        <div className="mt-0 p-3 rounded bg-slate-100 dark:bg-white/5 space-y-2" aria-label="Multi-city builder">
          <div className="text-xs font-semibold opacity-80">{t('travel.multicity') || 'Multi-city'}</div>
          <div className="space-y-2">
            {segments.map((s, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                <AirportAutocomplete label={t('travel.from') || 'From'} value={s.from} placeholder="MAD" onChange={(v) => updateLeg(i, { from: v })} />
                <AirportAutocomplete label={t('travel.to') || 'To'} value={s.to} placeholder="JFK" onChange={(v) => updateLeg(i, { to: v })} />
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] opacity-70">{t('common.date') || 'Date'}</span>
                  <input type="date" value={s.date} onChange={e => updateLeg(i, { date: e.target.value })} className="bg-slate-100 dark:bg-white/5 rounded px-2 py-1" />
                </label>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="ghost" onClick={() => moveLeg(i, -1)} aria-label={t('travel.multicity.move_up') || 'Move up'}><ArrowUpIcon /></Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => moveLeg(i, +1)} aria-label={t('travel.multicity.move_down') || 'Move down'}><ArrowDownIcon /></Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => removeLeg(i)}>{t('travel.multicity.remove') || 'Remove'}</Button>
                  {i === segments.length - 1 && (
                    <Button type="button" size="sm" variant="ghost" onClick={addLeg}>{t('travel.multicity.add_leg') || 'Add leg'}</Button>
                  )}
                </div>
              </div>
            ))}
            {segments.length === 0 && (
              <div className="text-[11px] opacity-70">{t('travel.multicity.hint') || 'Add at least two legs to build a route'}</div>
            )}
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="ghost" onClick={addLeg}>{t('travel.multicity.add_leg') || 'Add leg'}</Button>
              <Button type="button" size="sm" variant="primary" disabled={!canOpenMulti} onClick={openMulti}>{t('travel.multicity.open') || 'Open route in Google Flights'}</Button>
            </div>
          </div>
        </div>
      )}

      {pendingAdd && (
        <QuickTripPicker
          onCancel={closeAddModal}
          onConfirm={confirmAddToTrip}
          defaultTitle={`${t('travel.trip.to') || 'Trip to'} ${pendingAdd.dest}`}
        />
      )}
    </div>
  );
});

// Minimal show autocomplete using showStore for upcoming shows
const ShowAutocomplete: React.FC<{ label: string; onSelect: (s: Show) => void; }> = ({ label, onSelect }) => {
  const lang = getLang();
  const [shows, setShows] = React.useState<Show[]>([]);
  const [orgId, setOrgId] = React.useState<string>(() => { try { return getCurrentOrgId(); } catch { return ''; } });
  const [q, setQ] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  React.useEffect(() => {
    const unsub = showStore.subscribe((all) => {
      const org = orgId || getCurrentOrgId();
      setShows((all as any[]).filter(s => !s.tenantId || s.tenantId === org) as any);
    });
    const onTenant = (e: Event) => {
      try { const id = (e as CustomEvent).detail?.id as string | undefined; setOrgId(id || getCurrentOrgId()); } catch { setOrgId(getCurrentOrgId()); }
    };
    window.addEventListener('tenant:changed' as any, onTenant);
    return () => { try { unsub(); } catch { }; window.removeEventListener('tenant:changed' as any, onTenant); };
  }, [orgId]);
  const fmt = (d: string) => new Date(d).toISOString().slice(0, 10);
  const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const list = React.useMemo(() => {
    const n = norm(q);
    const upcoming = shows.filter(s => new Date(s.date).getTime() >= Date.now());
    const ranked = upcoming.map(s => ({ s, score: n ? (norm(s.city).startsWith(n) ? 100 : norm(s.city).includes(n) ? 50 : 0) : 1 }))
      .filter(x => x.score > 0)
      .sort((a, b) => (new Date(a.s.date).getTime() - new Date(b.s.date).getTime()) || (b.score - a.score))
      .slice(0, 8)
      .map(x => x.s);
    return ranked;
  }, [q, shows]);
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs opacity-70">{label}</span>
      <div className="relative">
        <input
          type="text"
          className="w-full bg-slate-100 dark:bg-white/5 rounded px-3 py-2"
          role="combobox"
          aria-expanded={open}
          aria-controls="show-ac-list"
          aria-autocomplete="list"
          placeholder="Ej: Paris, Madrid..."
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(0); }}
          onFocus={() => setOpen(list.length > 0)}
          onKeyDown={(e) => {
            if (!open) return;
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, list.length - 1)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
            else if (e.key === 'Enter') { e.preventDefault(); const pick = list[active]; if (pick) { onSelect(pick); setQ(`${pick.city} — ${fmt(pick.date)}`); setOpen(false); } }
            else if (e.key === 'Escape') { setOpen(false); }
          }}
          onBlur={() => setTimeout(() => setOpen(false), 100)}
        />
        {open && list.length > 0 && (
          <ul id="show-ac-list" role="listbox" className="absolute z-10 mt-1 w-full max-h-56 overflow-auto rounded bg-neutral-800 shadow-lg border border-white/10">
            {list.map((s, idx) => (
              <li
                key={s.id}
                role="option"
                aria-selected={idx === active}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-slate-200 dark:bg-white/10 ${idx === active ? 'bg-white/10' : ''}`}
                onMouseEnter={() => setActive(idx)}
                onMouseDown={(e) => { e.preventDefault(); onSelect(s); setQ(`${s.city} — ${fmt(s.date)}`); setOpen(false); }}
              >
                <div className="font-medium">{s.city}</div>
                <div className="opacity-70 text-xs">{fmt(s.date)} · {countryLabel(s.country, lang)}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SmartFlightSearch;

// Compact chips for recent structured searches
const RecentChips: React.FC<{
  items: RecentFlightSearch[];
  onPick: (p: Partial<FlightSearchParams>) => void;
}> = ({ items, onPick }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2 text-xs">
      {items.map((r, idx) => (
        <button
          key={`${r.origin}-${r.destination}-${r.departDate}-${r.returnDate || ''}-${idx}`}
          type="button"
          className="px-2 py-1 rounded bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 focus-ring"
          onClick={() => onPick({ origin: r.origin, dest: r.destination, date: r.departDate, retDate: r.returnDate })}
          aria-label={`${r.origin} to ${r.destination} ${r.departDate}${r.returnDate ? ` to ${r.returnDate}` : ''}`}
        >
          {r.origin}→{r.destination} · {r.departDate}{r.returnDate ? `→${r.returnDate}` : ''}
        </button>
      ))}
    </div>
  );
};

// DayHeader removed; grouping will be rendered in page orchestrator
