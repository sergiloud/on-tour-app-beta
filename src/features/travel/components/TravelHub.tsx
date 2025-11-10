import React from 'react';
import { Card } from '../../../ui/Card';
import { t } from '../../../lib/i18n';
import { useShows } from '../../../hooks/useShows';
import { useTravelSuggestions } from '../hooks/useTravelSuggestions';
import SmartFlightSearch from './SmartFlightSearch/SmartFlightSearch';
import { listTrips } from '../../../services/trips';
import { buildGoogleFlightsMultiUrl } from '../../../lib/travel/deeplink';
import { findAirport } from '../../../lib/airports';

type Props = { hideTitle?: boolean };

export const TravelHub: React.FC<Props> = ({ hideTitle }) => {
  const { shows } = useShows();
  const suggestions = useTravelSuggestions(shows.filter(s=> s.status==='confirmed'));
  const trips = listTrips();

  const initial = suggestions[0] ? {
    origin: (findAirport(suggestions[0].originCity)[0]?.iata ?? suggestions[0].originCity).toUpperCase(),
    dest: (findAirport(suggestions[0].destinationCity)[0]?.iata ?? suggestions[0].destinationCity).toUpperCase(),
    date: suggestions[0].fromDate
  } : undefined;
  const multi = (()=>{
    if (suggestions.length < 2) return undefined;
    const legs = suggestions.slice(0, Math.min(4, suggestions.length)).map(s=> ({
      from: (findAirport(s.originCity)[0]?.iata ?? s.originCity).toUpperCase(),
      to: (findAirport(s.destinationCity)[0]?.iata ?? s.destinationCity).toUpperCase(),
      date: s.fromDate
    }));
    try { return buildGoogleFlightsMultiUrl({ legs, adults: 1, bags: 1, cabin: 'ECONOMY' }).url; } catch { return undefined; }
  })();

  return (
    <div className="space-y-4">
      {!hideTitle && (
        <h3 className="text-base font-semibold">{t('travel.hub.title')||'Buscador'}</h3>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.length > 0 && (
        <Card className="p-4 space-y-2">
          <div className="text-sm font-semibold">{t('travel.hub.needs_planning')||'Sugerencias'}</div>
          <ul className="text-xs space-y-2">
            {suggestions.slice(0,3).map(s=> {
              const from = (findAirport(s.originCity)[0]?.iata ?? s.originCity).toUpperCase();
              const to = (findAirport(s.destinationCity)[0]?.iata ?? s.destinationCity).toUpperCase();
              return (
                <li key={`${s.originShowId}-${s.destinationShowId}`} className="glass rounded p-2 flex items-center justify-between">
                  <span className="opacity-80">{s.originCity} → {s.destinationCity} · {s.fromDate} → {s.toDate}</span>
                  <a href={`/dashboard/travel?origin=${encodeURIComponent(from)}&dest=${encodeURIComponent(to)}&date=${s.fromDate}&adults=1&bags=1&nonstop=1&cabin=E`} className="text-[11px] underline">{t('travel.hub.plan_trip_cta')||'Plan Trip'}</a>
                </li>
              );
            })}
          </ul>
          {multi && (
            <a href={multi} target="_blank" rel="noreferrer" className="text-[11px] underline">
              {t('travel.hub.open_multicity')||'Open multicity'}
            </a>
          )}
        </Card>
        )}
        {trips.length>0 && (
        <Card className="p-4 space-y-2">
          <div className="text-sm font-semibold">{t('travel.hub.upcoming')||'Próximos'}</div>
          <ul className="text-xs space-y-1">
              {trips.slice(0,3).map(trip=> (
                <li key={trip.id} className="flex items-center justify-between">
                  <span className="opacity-80">{trip.title}</span>
                  <a href={`/dashboard/travel`} className="text-[11px] underline">{t('common.open')||'Abrir'}</a>
                </li>
              ))}
          </ul>
        </Card>
        )}
      </div>

      <Card className="p-4 space-y-3">
        <div className="text-sm font-semibold">{t('travel.search.title')||'Buscador'}</div>
        <SmartFlightSearch initial={initial} />
      </Card>
    </div>
  );
};

export default TravelHub;
