import React from 'react';
import type { FlightResult } from '../../../travel/providers/types';
import { useSettings } from '../../../../context/SettingsContext';
import { t } from '../../../../lib/i18n';
import GuardedAction from '../../../../components/common/GuardedAction';
// Icons removed to avoid external dependency; keep minimal text UI

export const FlightResultCard: React.FC<{ r: FlightResult; onAdd: (r: FlightResult)=>void; onPin?: (r: FlightResult)=>void; pinned?: boolean }>=({ r, onAdd, onPin, pinned })=>{
  const { fmtMoney } = useSettings();
  const fmtDuration = (mins:number)=>{ const h=Math.floor(mins/60), m=mins%60; return `${h}h ${m}m`; };
  const depTime = new Date(r.dep).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const arrTime = new Date(r.arr).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const depDate = new Date(r.dep).toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' });
  const arrDate = new Date(r.arr).toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' });
  // Arrival day delta (for overnight / multi-day flights)
  const depDayKey = new Date(r.dep).toISOString().slice(0,10);
  const arrDayKey = new Date(r.arr).toISOString().slice(0,10);
  const dayDiff = Math.round((new Date(arrDayKey).getTime() - new Date(depDayKey).getTime())/86400000);
  const arrivalBadge = dayDiff>0 ? (dayDiff===1 ? (t('travel.arrival.nextDay')||'+1d') : `+${dayDiff}d`) : undefined;
  // Simple CO2 estimate heuristic (placeholder) ~ 0.115 kg CO2 per passenger-minute (adjust later with real distance-based calc)
  const co2EstimateKg = Math.round(r.durationM * 0.115);
  return (
    <div role="listitem" className={`glass rounded-lg p-3 flex flex-col sm:flex-row gap-3 items-start border transition-colors ${pinned?'border-accent-500/70 bg-accent-900/15 shadow-[0_0_0_2px_rgba(99,102,241,0.25)]':'border-white/10'}`}>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className="text-base font-semibold tracking-wide">{r.origin} ✈ {r.dest}</div>
          <div className="ml-auto text-xs opacity-70 flex items-center gap-2">
            {/* Airline logo placeholder via emoji if no CDN logo */}
            <span aria-hidden>🛩️</span>
            <span>{r.carrier}</span>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs opacity-80">
            <div className="flex items-center gap-1.5">
              <span className="opacity-60">⏱</span>
              <span className="font-semibold tabular-nums">{depTime} → {arrTime}</span>
              {arrivalBadge && (
                <span
                  className="ml-1 px-1 py-0.5 rounded bg-amber-500/20 text-amber-100 text-[10px] font-medium"
                  title={`${t('travel.arrival.sameDay')||'Same day'} → ${t('travel.arrival.nextDay')||'Next day'} (${arrivalBadge})`}
                  aria-label={arrivalBadge==='+'+dayDiff+'d'? `${dayDiff} day arrival offset` : arrivalBadge}
                >{arrivalBadge}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5"><span className="opacity-60">📅</span> <span>{depDate}</span></div>
        </div>
        {/* Visual Timeline */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[11px] font-semibold tabular-nums">{fmtDuration(r.durationM)}</span>
          <div className="flex-1 h-1.5 bg-white/10 rounded-full relative overflow-hidden">
             <div className="absolute h-full bg-white/20 w-full" />
            {/* stops markers */}
            {Array.from({ length: Math.max(0, r.stops) }).map((_,i)=> (
              <span key={i} className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-black ring-1 ring-white/50" style={{ left: `${((i+1)/(r.stops+1))*100}%` }} />
            ))}
          </div>
          <span className="text-[11px] opacity-80">{r.stops===0 ? (t('travel.flight_card.nonstop')||'nonstop') : `${r.stops} ${r.stops===1?(t('travel.flight_card.stop')||'stop'):(t('travel.flight_card.stops')||'stops')}`}</span>
          {/* CO2 badge */}
          <span
            className="ml-2 px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-200 text-[10px] font-medium flex items-center gap-0.5"
            title={`${t('travel.co2.label')||'CO₂ estimate'} ≈ ${co2EstimateKg}kg`}
            aria-label={`${t('travel.co2.label')||'CO₂'} ${co2EstimateKg} kilograms`}
          >CO₂ {co2EstimateKg}kg</span>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-xl font-extrabold tabular-nums">{fmtMoney(r.price)}</div>
        <div className="text-xs opacity-70 mb-2">{t('common.total')||'Total'}</div>
        <div className="flex gap-1 mt-1 justify-end">
          {onPin && (
            <button onClick={()=> onPin(r)} className="text-[11px] px-2 py-1 rounded bg-white/10 hover:bg-white/15" aria-pressed={!!pinned}>
              {pinned ? (t('travel.unpin')||'Unpin') : (t('travel.pin')||'Pin')}
            </button>
          )}
            <GuardedAction
              scope="travel:book"
              className="text-[11px] px-2 py-1 rounded bg-accent-500/20 text-accent-100 hover:bg-accent-500/30"
              onClick={()=> onAdd(r)}
            >
              {t('travel.add_to_trip')||'Add to trip'}
            </GuardedAction>
          {r.deepLink && <a href={r.deepLink} target="_blank" rel="noreferrer" className="text-[11px] px-2 py-1 rounded bg-white/10 hover:bg-white/15">{t('common.open')||'Open'}</a>}
        </div>
      </div>
    </div>
  );
};

export default FlightResultCard;
