import React, { useMemo, useRef, useState, useEffect } from 'react';
import { t } from '../../../lib/i18n';
import LeftPanel from './LeftPanel';
import PlanningCanvas from './PlanningCanvas';
import WeekTimelineCanvas from './WeekTimelineCanvas';
import TripDetail from '../../../components/travel/TripDetail';
import PinnedDrawer from '../components/SmartFlightSearch/PinnedDrawer';
import type { FlightResult } from '../providers/types';
import type { SmartFlightSearchHandle } from '../components/SmartFlightSearch/SmartFlightSearch';
import { loadJSON, saveJSON } from '../../../lib/persist';

const TravelWorkspace: React.FC = () => {
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const smartRef = useRef<SmartFlightSearchHandle>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string|undefined>(undefined);
  const [deepLink, setDeepLink] = useState<string|undefined>(undefined);
  const [results, setResults] = useState<FlightResult[]>([]);
  const [grouped, setGrouped] = useState<Record<string, FlightResult[]>|undefined>(undefined);
  const [pinned, setPinned] = useState<FlightResult[]>(() => loadJSON('travel.pinned', []) || []);
  useEffect(()=>{ saveJSON('travel.pinned', pinned); }, [pinned]);
  const [view, setView] = useState<'list'|'week'>(()=> loadJSON('travel.workspace.view', 'list'));
  useEffect(()=>{ saveJSON('travel.workspace.view', view); }, [view]);

  // Provider selection (mock/google) with persistence
  const [provider, setProvider] = useState<string>(()=> loadJSON('travel.provider', 'mock'));
  useEffect(()=>{ saveJSON('travel.provider', provider); }, [provider]);

  const pinnedIds = useMemo(()=> new Set(pinned.map(p=> p.id)), [pinned]);
  const togglePin = (r: FlightResult) => {
    setPinned(list => list.some(x=> x.id===r.id) ? list.filter(x=> x.id!==r.id) : [...list, r]);
  };
  const unpinById = (id: string) => setPinned(list => list.filter(x=> x.id!==id));
  const openAddToTrip = (r: FlightResult) => smartRef.current?.openAddToTrip(r);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
      {/* Left panel */}
      <div className="lg:col-span-1">
        <LeftPanel
          smartRef={smartRef}
          onTripSelected={setActiveTripId}
          onLoadingChange={setIsLoading}
          onErrorChange={setError}
          onResultsChange={setResults}
          onGroupedChange={setGrouped}
          onDeepLinkChange={setDeepLink}
          provider={provider}
          setProvider={setProvider}
          activeTripId={activeTripId}
        />
      </div>

      {/* Right canvas / details */}
      <div className="lg:col-span-2">
        {/* View switch */}
        <div className="mb-2 flex justify-end">
          <div role="group" aria-label="View" className="inline-flex rounded-full bg-white/5 p-0.5 text-xs">
            <button className={`px-2 py-1 rounded-full ${view==='list'?'bg-white/10':''}`} onClick={()=> setView('list')}>{t('common.list')||'List'}</button>
            <button className={`px-2 py-1 rounded-full ${view==='week'?'bg-white/10':''}`} onClick={()=> setView('week')}>{t('calendar.timeline')||'Week'}</button>
          </div>
        </div>
        {activeTripId ? (
          <div className="glass rounded-lg p-4">
            <TripDetail id={activeTripId} onClose={() => setActiveTripId(null)} />
          </div>
        ) : (
          <>
            {view==='list' ? (
              <PlanningCanvas
                activeTripId={activeTripId}
                isLoading={isLoading}
                error={error}
                deepLink={deepLink}
                results={results}
                grouped={grouped}
                pinnedIds={pinnedIds}
                onAdd={openAddToTrip}
                onPin={togglePin}
              />
            ) : (
              <WeekTimelineCanvas
                grouped={grouped}
                results={results}
                pinnedIds={pinnedIds}
                onAdd={openAddToTrip}
                onPin={togglePin}
              />
            )}
          </>
        )}
        <PinnedDrawer items={pinned} onUnpin={unpinById} onAdd={openAddToTrip} />
      </div>
    </div>
  );
};

export default TravelWorkspace;
