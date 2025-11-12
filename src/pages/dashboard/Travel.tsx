import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { prefetch } from '../../routes/prefetch';
import SmartFlightSearch, { type SmartFlightSearchHandle } from '../../features/travel/components/SmartFlightSearch/SmartFlightSearch';
import { t } from '../../lib/i18n';
import TripList from '../../components/travel/TripList';
import TripDetail from '../../components/travel/TripDetail';
import TravelSuggestions from '../../features/travel/components/TravelSuggestions';
import FlightResults from '../../features/travel/components/SmartFlightSearch/FlightResults';
import PinnedDrawer from '../../features/travel/components/SmartFlightSearch/PinnedDrawer';

const CloseIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const ArrowUpIcon = () => (
  <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
  </svg>
);

const ArrowDownIcon = () => (
  <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
  </svg>
);
import TravelTimeline from '../../features/travel/components/TravelTimeline';
import { findAirport } from '../../lib/airports';
import type { FlightResult, FlightSearchParams } from '../../features/travel/providers/types';
import { loadJSON, saveJSON } from '../../lib/persist';
import { addSegment, createTrip, listTrips } from '../../services/trips';
import { can } from '../../lib/tenants';

const Travel: React.FC = () => {
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const smartRef = useRef<SmartFlightSearchHandle>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [deepLink, setDeepLink] = useState<string | undefined>(undefined);
  const [results, setResults] = useState<FlightResult[]>([]);
  const [grouped, setGrouped] = useState<Record<string, FlightResult[]> | undefined>(undefined);
  const [pinned, setPinned] = useState<FlightResult[]>(() => loadJSON('travel.pinned', []) || []);
  const [params, setParams] = useState<Partial<{ origin: string; dest: string; date: string; retDate?: string; adults?: number; bags?: number; cabin?: string; nonstop?: boolean }>>({});
  const [searchInitial, setSearchInitial] = useState<Partial<FlightSearchParams>>({});
  const [activeTab, setActiveTab] = useState<string>(() => loadJSON('travel.activeTab', 'search'));
  // Results sorting preference (key:direction)
  const [resultsSort, setResultsSort] = useState<string>(() => loadJSON('travel.results.sort', 'price:asc'));
  useEffect(() => { saveJSON('travel.pinned', pinned); }, [pinned]);
  useEffect(() => { saveJSON('travel.activeTab', activeTab); }, [activeTab]);
  useEffect(() => { saveJSON('travel.results.sort', resultsSort); }, [resultsSort]);

  // Provider selection (mock/google) with persistence
  const [provider, setProvider] = useState<string>(() => loadJSON('travel.provider', 'mock'));
  useEffect(() => { saveJSON('travel.provider', provider); }, [provider]);

  const pinnedIds = useMemo(() => new Set(pinned.map(p => p.id)), [pinned]);
  const togglePin = (r: FlightResult) => {
    setPinned(list => list.some(x => x.id === r.id) ? list.filter(x => x.id !== r.id) : [...list, r]);
  };
  const unpinById = (id: string) => setPinned(list => list.filter(x => x.id !== id));
  const openAddToTrip = (r: FlightResult) => smartRef.current?.openAddToTrip(r);

  // Memoized flight sorting function
  const sortedResults = useMemo(() => {
    const [key, direction] = resultsSort.split(':');
    const dir = direction === 'asc' ? 1 : -1;
    return [...results].sort((a, b) => {
      if (key === 'price') return (a.price - b.price) * dir;
      if (key === 'duration') return (a.durationM - b.durationM) * dir;
      if (key === 'stops') return (a.stops - b.stops) * dir;
      return 0;
    });
  }, [results, resultsSort]);

  // Memoized grouped flights sorting
  const sortedGrouped = useMemo(() => {
    if (!grouped) return undefined;
    const [key, direction] = resultsSort.split(':');
    const dir = direction === 'asc' ? 1 : -1;
    const sorted: Record<string, FlightResult[]> = {};
    for (const date of Object.keys(grouped).sort()) {
      sorted[date] = [...(grouped[date] ?? [])].sort((a, b) => {
        if (key === 'price') return (a.price - b.price) * dir;
        if (key === 'duration') return (a.durationM - b.durationM) * dir;
        if (key === 'stops') return (a.stops - b.stops) * dir;
        return 0;
      });
    }
    return sorted;
  }, [grouped, resultsSort]);

  const handleFlightDrop = (flight: FlightResult, date: string) => {
    // Find or create a trip for this date
    const trips = listTrips();
    let trip = trips.find(t => t.segments.some(s => s.dep?.startsWith(date)));

    if (!trip) {
      // Create a new trip for this date
      const dateObj = new Date(date);
      const title = `Trip ${dateObj.toLocaleDateString()}`;
      trip = createTrip({
        title,
        status: 'planned',
        segments: []
      });
    }

    if (trip) {
      // Add the flight as a segment
      addSegment(trip.id, {
        type: 'flight',
        from: flight.origin,
        to: flight.dest,
        dep: flight.dep,
        arr: flight.arr,
        carrier: flight.carrier,
        price: flight.price,
        currency: flight.currency as any
      });

      // Show success feedback
      setLiveMsg(`Flight added to ${trip.title}`);
      setTimeout(() => setLiveMsg(''), 3000);
    }
  };
  // Accessibility announcement text
  const [liveMsg, setLiveMsg] = useState('');
  // Announce when searching begins
  useEffect(() => {
    if (isLoading) {
      setLiveMsg(t('travel.aria.searching') || t('common.loading') || 'Searching flights…');
    }
  }, [isLoading]);
  // Announce result counts when loading completes
  useEffect(() => {
    if (!isLoading) {
      const count = results.length;
      if (count > 0) {
        setLiveMsg(`${count} ${(t('common.results') || 'results')}`);
      } else if (count === 0) {
        setLiveMsg(t('common.noResults') || 'No results');
      }
    }
  }, [isLoading, results]);

  const chips = useMemo(() => {
    const out: Array<{ key: string; label: string }> = [];
    if (params.origin && params.dest) out.push({ key: 'route', label: `${params.origin} → ${params.dest}` });
    if (params.date) out.push({ key: 'date', label: params.retDate ? `${params.date} → ${params.retDate}` : params.date });
    if (params.adults) out.push({ key: 'adults', label: `${params.adults} ${params.adults === 1 ? (t('travel.adult') || 'adult') : (t('travel.adults') || 'adults')}` });
    if (params.bags !== undefined) out.push({ key: 'bags', label: `${params.bags || 0} ${(params.bags || 0) === 1 ? (t('travel.bag') || 'bag') : (t('travel.bags') || 'bags')}` });
    if (params.cabin) out.push({ key: 'cabin', label: params.cabin === 'W' ? 'Premium Economy' : params.cabin === 'B' ? 'Business' : params.cabin === 'F' ? 'First' : 'Economy' });
    if (params.nonstop) out.push({ key: 'nonstop', label: t('travel.nonstop') || 'Nonstop' });
    return out;
  }, [params]);

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Visually hidden aria-live region */}
        <div aria-live="polite" className="sr-only" role="status">{liveMsg}</div>
        {/* Sticky summary bar */}
        <div className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-surface-card/60 bg-surface-card/95 border-b border-theme -mx-4 px-4">
          <div className="flex items-center gap-2 py-2 overflow-x-auto">
            <nav className="flex items-center gap-1 text-sm">
              {(['search', 'compare', 'calendar', 'trips'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  className={`px-3 py-1.5 rounded-full ${activeTab === tab ? 'bg-white/10' : 'hover:bg-interactive'} focus-ring`}
                  aria-pressed={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'search' ? (t('common.search') || 'Search') : tab === 'compare' ? (t('travel.compare') || 'Compare') : tab === 'calendar' ? (t('calendar') || 'Calendar') : (t('travel.trips') || 'Trips')}
                </button>
              ))}
            </nav>
            <div className="ml-2 flex items-center gap-2 text-xs">
              {chips.map(c => (
                <span key={c.key} className="px-2 py-1 rounded-full bg-interactive whitespace-nowrap">{c.label}</span>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              {deepLink && (
                <a className="text-xs underline opacity-80 hover:opacity-100" href={deepLink} target="_blank" rel="noreferrer">
                  {t('travel.open_in_provider') || 'Open in provider'}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left "Control Panel" Column */}
          <div className="lg:col-span-1 space-y-4">
            <div className="glass rounded-lg p-4">
              <SmartFlightSearch
                key={provider}
                ref={smartRef}
                initial={searchInitial}
                onTripSelected={(id) => setActiveTripId(id)}
                onLoadingChange={setIsLoading}
                onErrorChange={setError}
                onResultsChange={setResults}
                onGroupedChange={setGrouped}
                onDeepLinkChange={setDeepLink}
                onParamsChange={setParams}
              />
              <div className="mt-2 text-right">
                <Link
                  to="/dashboard/travel/workspace"
                  onMouseEnter={prefetch.travelWorkspace}
                  onFocus={prefetch.travelWorkspace}
                  className="text-xs underline opacity-70 hover:opacity-100"
                >
                  {t('travel.workspace.open')}
                </Link>
              </div>
            </div>
            <div className="glass rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-2">{t('travel.hub.needs_planning') || 'Suggestions'}</h3>
              <TravelSuggestions />
            </div>
            <div className="glass rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-2">{t('travel.trips') || 'Trips'}</h3>
              <TripList onSelectTrip={setActiveTripId} activeTripId={activeTripId} />
            </div>
          </div>

          {/* Right "Workspace" Column */}
          <div className="lg:col-span-2 relative">
            {activeTripId ? (
              <div className="glass rounded-lg p-4">
                <TripDetail id={activeTripId} onClose={() => setActiveTripId(null)} />
              </div>
            ) : (
              <>
                {/* Timeline View - Always visible */}
                <div className="glass rounded-lg p-4">
                  <TravelTimeline
                    onGapClick={(suggestion: any) => {
                      // Auto-fill search form with travel suggestion
                      const from = (findAirport(suggestion.originCity)[0]?.iata ?? suggestion.originCity).toUpperCase();
                      const to = (findAirport(suggestion.destinationCity)[0]?.iata ?? suggestion.destinationCity).toUpperCase();
                      setSearchInitial({
                        origin: from,
                        dest: to,
                        date: suggestion.fromDate,
                        retDate: suggestion.toDate,
                        adults: 1,
                        bags: 1,
                        nonstop: true,
                        cabin: 'E'
                      });
                      setActiveTab('search');
                    }}
                    onFlightDrop={handleFlightDrop}
                  />
                </div>

                {/* Sliding Results Panel */}
                {activeTab === 'search' && (results.length > 0 || isLoading) && (
                  <div className="absolute inset-0 z-10 bg-black/20 backdrop-blur-sm">
                    <div className="absolute right-0 top-0 bottom-0 w-96 bg-surface-card border-l border-theme p-4 overflow-y-auto">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">{t('travel.results.title') || 'Flight Results'}</h3>
                        <button
                          onClick={() => setActiveTab('timeline')}
                          className="text-sm opacity-70 hover:opacity-100"
                        >
                          <CloseIcon />
                        </button>
                      </div>

                      <div className="space-y-4">
                        {/* Results sorting control */}
                        <label className="inline-flex items-center gap-1 text-sm">
                          <span className="opacity-70">{t('travel.results.sortBy') || 'Sort by'}</span>
                          <select
                            className="bg-interactive rounded px-2 py-1 text-xs border border-transparent focus-ring"
                            value={resultsSort}
                            onChange={(e) => setResultsSort(e.target.value)}
                          >
                            <option value="price:asc">{t('travel.sort.priceAsc') || 'Price (low to high)'}</option>
                            <option value="price:desc">{t('travel.sort.priceDesc') || 'Price (high to low)'}</option>
                            <option value="duration:asc">{t('travel.sort.duration') || 'Duration'} <ArrowUpIcon /></option>
                            <option value="duration:desc">{t('travel.sort.duration') || 'Duration'} <ArrowDownIcon /></option>
                            <option value="stops:asc">{t('travel.sort.stops') || 'Stops'} <ArrowUpIcon /></option>
                            <option value="stops:desc">{t('travel.sort.stops') || 'Stops'} <ArrowDownIcon /></option>
                          </select>
                        </label>

                        {error && (
                          <div className="text-xs text-red-300">{t(`errors.${error}`) || 'Search failed. Try again.'}</div>
                        )}

                        {isLoading && results.length === 0 ? (
                          <div className="animate-pulse space-y-2" aria-busy>
                            <div className="h-16 rounded bg-interactive" />
                            <div className="h-16 rounded bg-interactive" />
                            <div className="h-16 rounded bg-interactive" />
                          </div>
                        ) : sortedGrouped && Object.keys(sortedGrouped).length > 0 ? (
                          <div className="space-y-4">
                            {Object.keys(sortedGrouped).map(date => {
                              const d = new Date(date);
                              const label = d.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
                              return (
                                <div key={date} className="space-y-2">
                                  <div className="text-xs font-semibold opacity-80">{label}</div>
                                  <FlightResults results={sortedGrouped[date] ?? []} onAdd={openAddToTrip} onPin={togglePin} pinnedIds={pinnedIds} />
                                </div>
                              );
                            })}
                          </div>
                        ) : results.length > 0 ? (
                          <FlightResults results={sortedResults} onAdd={openAddToTrip} onPin={togglePin} pinnedIds={pinnedIds} />
                        ) : (
                          <div className="text-center py-10">
                            <p className="text-sm opacity-70">{t('common.noResults') || 'No results'}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Other tab views */}
                {activeTab === 'compare' && (
                  <div className="absolute inset-0 z-10 bg-black/20 backdrop-blur-sm">
                    <div className="absolute right-0 top-0 bottom-0 w-96 bg-surface-card border-l border-theme p-4 overflow-y-auto">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">{t('travel.compare.title') || 'Compare Flights'}</h3>
                        <button
                          onClick={() => setActiveTab('timeline')}
                          className="text-sm opacity-70 hover:opacity-100"
                        >
                          <CloseIcon />
                        </button>
                      </div>
                      <CompareGrid pinned={pinned} onUnpin={unpinById} onAdd={openAddToTrip} />
                    </div>
                  </div>
                )}

                {activeTab === 'calendar' && (
                  <div className="absolute inset-0 z-10 bg-black/20 backdrop-blur-sm">
                    <div className="absolute right-0 top-0 bottom-0 w-96 bg-surface-card border-l border-theme p-4 overflow-y-auto">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">{t('calendar') || 'Calendar'}</h3>
                        <button
                          onClick={() => setActiveTab('timeline')}
                          className="text-sm opacity-70 hover:opacity-100"
                        >
                          <CloseIcon />
                        </button>
                      </div>
                      <div className="text-sm opacity-80">
                        {t('travel.calendar.soon') || 'Calendar view coming soon — pick dates visually and see price trends.'}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'trips' && (
                  <div className="absolute inset-0 z-10 bg-black/20 backdrop-blur-sm">
                    <div className="absolute right-0 top-0 bottom-0 w-96 bg-surface-card border-l border-theme p-4 overflow-y-auto">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">{t('travel.trips') || 'Trips'}</h3>
                        <button
                          onClick={() => setActiveTab('timeline')}
                          className="text-sm opacity-70 hover:opacity-100"
                        >
                          <CloseIcon />
                        </button>
                      </div>
                      <div className="text-sm opacity-80">
                        {t('travel.trips.hint') || 'Use the left panel to open and manage trips.'}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            {/* Floating pinned comparison */}
            <PinnedDrawer items={pinned} onUnpin={unpinById} onAdd={openAddToTrip} />
          </div>
        </div>
      </div>
      {/* Mobile sticky bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
        <div className="pointer-events-auto mx-auto max-w-7xl flex gap-2 p-2">
          <button
            type="button"
            className={`flex-1 px-3 py-2 rounded-full text-sm font-medium ${activeTab === 'search' ? 'bg-accent-500 text-black' : 'glass'}`}
            onClick={() => setActiveTab('search')}
            aria-pressed={activeTab === 'search'}
          >{t('travel.mobile.sticky.results') || 'Results'}</button>
          <button
            type="button"
            className={`flex-1 px-3 py-2 rounded-full text-sm font-medium relative ${activeTab === 'compare' ? 'bg-accent-500 text-black' : 'glass'}`}
            onClick={() => setActiveTab('compare')}
            aria-pressed={activeTab === 'compare'}
          >{t('travel.mobile.sticky.compare') || 'Compare'}
            {pinned.length > 0 && (
              <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[11px] tabular-nums shadow-glow">{pinned.length}</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Travel;

// Compare grid component (pinned flights)
const CompareGrid: React.FC<{ pinned: FlightResult[]; onUnpin: (id: string) => void; onAdd: (r: FlightResult) => void }> = ({ pinned, onUnpin, onAdd }) => {
  const [sortKey, setSortKey] = useState<'price' | 'duration' | 'stops'>('price');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const sorted = useMemo(() => {
    const arr = [...pinned];
    arr.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'price') return (a.price - b.price) * dir;
      if (sortKey === 'duration') return (a.durationM - b.durationM) * dir;
      return (a.stops - b.stops) * dir;
    });
    return arr;
  }, [pinned, sortKey, sortDir]);
  const bestPriceId = useMemo(() => pinned.reduce((m, p) => p.price < m.price ? p : m, pinned[0] || { id: '', price: Infinity } as any).id, [pinned]);
  const bestTimeId = useMemo(() => pinned.reduce((m, p) => p.durationM < m.durationM ? p : m, pinned[0] || { id: '', durationM: Infinity } as any).id, [pinned]);
  const bestBalanceId = bestPriceId; // placeholder heuristic
  if (!pinned.length) return <div className="text-sm opacity-70">{t('travel.compare.empty') || 'Pin flights to compare them here.'}</div>;
  return (
    <div className="space-y-3" aria-label={t('travel.compare.grid.title') || 'Compare flights'}>
      <div className="flex items-center gap-2 text-xs">
        <label className="inline-flex items-center gap-1">
          <span className="opacity-70">{t('travel.sort.menu') || 'Sort by'}</span>
          <select className="bg-interactive rounded px-2 py-1" value={sortKey + ':' + sortDir} onChange={e => { const [k, d] = e.target.value.split(':'); setSortKey(k as any); setSortDir(d as any); }}>
            <option value="price:asc">{t('travel.sort.priceAsc') || 'Price (low to high)'}</option>
            <option value="price:desc">{t('travel.sort.priceDesc') || 'Price (high to low)'}</option>
            <option value="duration:asc">{t('travel.sort.duration') || 'Duration'} <ArrowUpIcon /></option>
            <option value="duration:desc">{t('travel.sort.duration') || 'Duration'} <ArrowDownIcon /></option>
            <option value="stops:asc">{t('travel.sort.stops') || 'Stops'} <ArrowUpIcon /></option>
            <option value="stops:desc">{t('travel.sort.stops') || 'Stops'} <ArrowDownIcon /></option>
          </select>
        </label>
        <div className="ml-auto text-[11px] opacity-70 tabular-nums">{pinned.length} {t('common.results') || 'results'}</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs md:text-sm compare-grid border-separate border-spacing-y-1">
          <thead>
            <tr className="text-left">
              <th className="px-2 py-1">{t('common.origin') || 'Origin'}</th>
              <th className="px-2 py-1">{t('common.dest') || 'Dest'}</th>
              <th className="px-2 py-1">{t('travel.sort.duration') || 'Duration'}</th>
              <th className="px-2 py-1">{t('travel.sort.stops') || 'Stops'}</th>
              <th className="px-2 py-1 text-right">{t('common.price') || 'Price'}</th>
              <th className="px-2 py-1">{t('travel.compare') || 'Compare'}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(r => {
              const isBestPrice = r.id === bestPriceId;
              const isBestTime = r.id === bestTimeId;
              const isBestBalance = r.id === bestBalanceId;
              return (
                <tr key={r.id} className="glass rounded hover:bg-interactive">
                  <td className="px-2 py-1 font-mono text-[11px] md:text-xs">{r.origin}</td>
                  <td className="px-2 py-1 font-mono text-[11px] md:text-xs">{r.dest}</td>
                  <td className="px-2 py-1 tabular-nums">{Math.round(r.durationM / 60)}h{(r.durationM % 60).toString().padStart(2, '0')}</td>
                  <td className="px-2 py-1">{r.stops === 0 ? <span className="inline-block px-1 rounded bg-emerald-600/25 border border-emerald-400/30 text-emerald-200" title={t('travel.badge.nonstop') || 'Nonstop'}>{t('travel.badge.nonstop') || 'Nonstop'}</span> : r.stops}</td>
                  <td className="px-2 py-1 text-right tabular-nums">{r.currency} {r.price}</td>
                  <td className="px-2 py-1 flex items-center gap-1">
                    {isBestPrice && <span className="px-1 py-0.5 rounded bg-accent-500/20 text-accent-100 text-[10px]" title={t('travel.compare.bestPrice') || 'Best price'}>P</span>}
                    {isBestTime && <span className="px-1 py-0.5 rounded bg-indigo-500/20 text-indigo-100 text-[10px]" title={t('travel.compare.bestTime') || 'Fastest'}>T</span>}
                    {isBestBalance && <span className="px-1 py-0.5 rounded bg-amber-500/25 text-amber-100 text-[10px]" title={t('travel.compare.bestBalance') || 'Best balance'}>B</span>}
                    <button className="ml-auto px-2 py-0.5 rounded bg-interactive hover:bg-slate-200 dark:bg-white/10" onClick={() => onAdd(r)}>{t('travel.compare.add_to_trip') || 'Add to trip'}</button>
                    <button className="px-2 py-0.5 rounded bg-interactive hover:bg-slate-200 dark:bg-white/10" onClick={() => onUnpin(r.id)} aria-label="Unpin"><CloseIcon /></button>
                    {r.deepLink && <a href={r.deepLink} target="_blank" rel="noreferrer" className="px-2 py-0.5 rounded bg-interactive hover:bg-slate-200 dark:bg-white/10"><ExternalLinkIcon /></a>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
