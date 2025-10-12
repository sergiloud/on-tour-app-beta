import React from 'react';
import { t } from '../../../lib/i18n';
import type { FlightResult } from '../providers/types';
import FlightResults from '../components/SmartFlightSearch/FlightResults';

export type PlanningCanvasProps = {
  activeTripId: string | null;
  isLoading: boolean;
  error?: string;
  deepLink?: string;
  results: FlightResult[];
  grouped?: Record<string, FlightResult[]>;
  pinnedIds: Set<string>;
  onAdd: (r: FlightResult) => void;
  onPin: (r: FlightResult) => void;
};

const PlanningCanvas: React.FC<PlanningCanvasProps> = ({
  activeTripId,
  isLoading,
  error,
  deepLink,
  results,
  grouped,
  pinnedIds,
  onAdd,
  onPin,
}) => {
  if (activeTripId) {
    // Trip detail is rendered by parent; canvas idles
    return null;
  }

  return (
    <div className="glass rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm">
        {deepLink && (
          <a className="underline opacity-80 hover:opacity-100" href={deepLink} target="_blank" rel="noreferrer">
            {t('travel.open_in_provider')}
          </a>
        )}
      </div>
      {error && (
        <div className="text-xs text-red-300" role="alert">{t(`errors.${error}`) || 'Search failed. Try again.'}</div>
      )}
      {isLoading && results.length === 0 ? (
        <div className="animate-pulse space-y-2" aria-busy>
          <div className="h-16 rounded bg-white/5" />
          <div className="h-16 rounded bg-white/5" />
          <div className="h-16 rounded bg-white/5" />
        </div>
      ) : grouped && Object.keys(grouped).length > 0 ? (
        <div className="space-y-4" aria-label={t('travel.workspace.timeline')}>
          {Object.keys(grouped).sort().map(date => {
            const d = new Date(date);
            const label = d.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
            const dateResults = grouped[date] ?? [];
            return (
              <div key={date} className="space-y-2">
                <div className="text-xs font-semibold opacity-80">{label}</div>
                <FlightResults results={dateResults} onAdd={onAdd} onPin={onPin} pinnedIds={pinnedIds} />
              </div>
            );
          })}
        </div>
      ) : results.length > 0 ? (
        <FlightResults results={results} onAdd={onAdd} onPin={onPin} pinnedIds={pinnedIds} />
      ) : (
        <div className="text-center py-10">
          <p className="text-sm opacity-70">{t('common.noResults')}</p>
        </div>
      )}
    </div>
  );
};

export default PlanningCanvas;
