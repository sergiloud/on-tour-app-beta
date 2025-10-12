import React from 'react';
import { t } from '../../lib/i18n';
import { getTravelRiskIndicator } from '../../lib/calendar';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  title: string;
  status?: 'confirmed'|'pending'|'offer'|string;
  kind: 'show'|'travel';
  onClick?: () => void;
  className?: string;
  startIso?: string; // optional ISO start (for tooltip)
  endIso?: string; // optional ISO end
  city?: string; // for show/travel location enrichment
  country?: string; // ISO country for enrichment
  meta?: string; // additional metadata (used for risk indicators)
};

const tone = (status?: string, kind?: 'show'|'travel') => {
  let baseStyle = '';
  
  // Base styles by status
  if (status === 'confirmed') baseStyle = 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30';
  else if (status === 'pending') baseStyle = 'bg-amber-500/20 text-amber-200 border-amber-500/30 border-dashed';
  else baseStyle = 'bg-sky-500/20 text-sky-200 border-sky-500/30';
  
  // Additional styles by kind
  if (kind === 'show') {
    // Shows: solid and opaque
    baseStyle = baseStyle.replace('/20', '/30').replace('/30', '/40');
  } else if (kind === 'travel') {
    // Travel: striped pattern
    baseStyle += ' bg-stripes-travel';
  }
  
  return baseStyle;
};

const fmtTime = (iso?: string) => {
  if (!iso) return undefined;
  try { return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }); } catch { return undefined; }
};

const EventChip: React.FC<Props> = ({ title, status, kind, onClick, className, startIso, endIso, city, country, meta, ...rest }) => {
  const timeRange = (()=>{
    const a = fmtTime(startIso); const b = fmtTime(endIso);
    if (a && b) return `${a} – ${b}`;
    if (a) return a;
    return undefined;
  })();
  const loc = city ? (country ? `${city.toUpperCase()} ${country.toUpperCase()}` : city.toUpperCase()) : undefined;
  const tooltipParts = [title, timeRange, loc].filter(Boolean);
  const tooltip = tooltipParts.join(' • ');

  // Detect travel risk from meta
  const riskMatch = meta?.match(/\[(OVERLAP|ISOLATED|PENDING)\]/);
  const risk = riskMatch?.[1]?.toLowerCase() as 'overlap' | 'isolated' | 'pending' | null;
  const riskIndicator = kind === 'travel' ? getTravelRiskIndicator(risk) : null;

  const aria = (()=>{
    const parts: string[] = [];
    parts.push(kind==='show' ? (t('calendar.kind.show')||'Show') : (t('calendar.kind.travel')||'Travel'));
    parts.push(title);
    if (timeRange) parts.push(timeRange);
    if (status) parts.push(status);
    return parts.join(' · ');
  })();
  return (
    <button type="button" onClick={onClick}
      className={`w-full text-left inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[11px] truncate ${tone(status, kind)} ${className||''}`}
      title={tooltip}
      aria-label={aria}
      {...rest}
    >
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${kind==='show' ? 'bg-white/80' : 'bg-cyan-200'}`} aria-hidden />
      {riskIndicator && (
        <span className={`text-[10px] ${riskIndicator.color}`} title={riskIndicator.tooltip} aria-label={`Risk: ${riskIndicator.tooltip}`}>
          {riskIndicator.icon}
        </span>
      )}
      <span className="truncate">{title}</span>
    </button>
  );
};

export default EventChip;
