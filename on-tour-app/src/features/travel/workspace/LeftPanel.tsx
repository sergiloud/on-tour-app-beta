import React, { forwardRef } from 'react';
import SmartFlightSearch, { type SmartFlightSearchHandle } from '../components/SmartFlightSearch/SmartFlightSearch';
import TravelSuggestions from '../components/TravelSuggestions';
import TripList from '../../../components/travel/TripList';
import { t } from '../../../lib/i18n';
import type { FlightResult } from '../providers/types';

export type LeftPanelProps = {
  smartRef: React.RefObject<SmartFlightSearchHandle | null>;
  onTripSelected: (id: string) => void;
  onLoadingChange: (loading: boolean) => void;
  onErrorChange: (err?: string) => void;
  onResultsChange: (r: FlightResult[]) => void;
  onGroupedChange: (g?: Record<string, FlightResult[]>) => void;
  onDeepLinkChange: (url?: string) => void;
  provider: string;
  setProvider: (p: string) => void;
  activeTripId: string | null;
};

const LeftPanel: React.FC<LeftPanelProps> = ({
  smartRef,
  onTripSelected,
  onLoadingChange,
  onErrorChange,
  onResultsChange,
  onGroupedChange,
  onDeepLinkChange,
  provider,
  setProvider,
  activeTripId,
}) => {
  return (
    <div className="space-y-4">
      <div className="glass rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold opacity-90">{t('travel.search.title')}</h2>
          <label className="inline-flex items-center gap-1 text-xs">
            <span className="opacity-70">{t('travel.provider')}</span>
            <select
              className="bg-white/5 rounded px-2 py-1 text-xs border border-transparent focus-ring"
              value={provider}
              onChange={(e)=> setProvider(e.target.value)}
            >
              <option value="mock">{t('provider.mock')}</option>
              <option value="google">{t('provider.google')}</option>
            </select>
          </label>
        </div>
        <SmartFlightSearch
          key={provider}
          ref={smartRef}
          onTripSelected={onTripSelected}
          onLoadingChange={onLoadingChange}
          onErrorChange={onErrorChange}
          onResultsChange={onResultsChange}
          onGroupedChange={onGroupedChange}
          onDeepLinkChange={onDeepLinkChange}
        />
      </div>

      <div className="glass rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-2">{t('travel.hub.needs_planning')}</h3>
        <TravelSuggestions />
      </div>

      <div className="glass rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">{t('travel.trips')}</h3>
          {/* Placeholder for future Trip Builder entry */}
          <span className="text-[11px] opacity-70">{t('travel.workspace.trip_builder.beta')}</span>
        </div>
        <TripList onSelectTrip={onTripSelected} activeTripId={activeTripId} />
      </div>
    </div>
  );
};

export default LeftPanel;
