import React from 'react';
import { useShows } from '../../../hooks/useShows';
import { useTravelSuggestions } from '../hooks/useTravelSuggestions';
import { t } from '../../../lib/i18n';
import { findAirport } from '../../../lib/airports';

const TravelSuggestions: React.FC = () => {
  const { shows } = useShows();
  const suggestions = useTravelSuggestions(shows.filter(s=> s.status==='confirmed'));
  if (!suggestions.length) return <div className="text-xs opacity-70">{t('travel.hub.no_suggestions')||'No suggestions'}</div>;
  return (
    <ul className="text-xs space-y-2">
      {suggestions.slice(0,5).map(s => {
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
  );
};

export default TravelSuggestions;
