import React from 'react';
import { motion } from 'framer-motion';
import { t } from '../../lib/i18n';
import { getTravelRiskIndicator } from '../../lib/calendar';
import { colorMap } from './AdvancedCalendarTypes';
import EventResizeHandle from './EventResizeHandle';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  title: string;
  status?: 'confirmed'|'pending'|'offer'|string;
  kind: 'show'|'travel'|'meeting'|'rehearsal'|'break';
  id?: string; // Event ID for resize operations
  onClick?: () => void;
  onMultiSelect?: (isSelected: boolean) => void;
  onResizeStart?: (e: React.DragEvent, direction: 'start' | 'end') => void;
  className?: string;
  startIso?: string; // optional ISO start (for tooltip)
  endIso?: string; // optional ISO end
  city?: string; // for show/travel location enrichment
  country?: string; // ISO country for enrichment
  meta?: string; // additional metadata (used for risk indicators)
  color?: 'accent' | 'green' | 'red' | 'blue' | 'yellow' | 'purple';
  pinned?: boolean;
  spanLength?: number;
  spanIndex?: number;
  spanStart?: boolean;
  spanEnd?: boolean;
  isSelected?: boolean;
};

const tone = (status?: string, kind?: 'show'|'travel'|'meeting'|'rehearsal'|'break', color?: Props['color']) => {
  if (color && colorMap[color]) {
    return `bg-gradient-to-r ${colorMap[color]} border`;
  }

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
  } else if (kind === 'meeting') {
    // Meeting: purple accent
    baseStyle = 'bg-purple-500/20 text-purple-200 border-purple-500/30';
  } else if (kind === 'rehearsal') {
    // Rehearsal: green accent
    baseStyle = 'bg-green-500/20 text-green-200 border-green-500/30';
  } else if (kind === 'break') {
    // Break: rose accent
    baseStyle = 'bg-rose-500/20 text-rose-200 border-rose-500/30';
  }

  return baseStyle;
};

const fmtTime = (iso?: string) => {
  if (!iso) return undefined;
  try { return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }); } catch { return undefined; }
};

const EventChipComponent: React.ForwardRefRenderFunction<HTMLButtonElement, Props> = ({
  title,
  status,
  kind,
  id,
  onClick,
  onMultiSelect,
  onResizeStart,
  className,
  startIso,
  endIso,
  city,
  country,
  meta,
  color,
  pinned,
  spanLength,
  spanIndex,
  spanStart = false,
  spanEnd = false,
  isSelected = false,
  ...rest
}, ref) => {
  const timeRange = (()=>{
    const a = fmtTime(startIso); const b = fmtTime(endIso);
    if (a && b) return `${a} – ${b}`;
    if (a) return a;
    return undefined;
  })();
  const loc = city ? (country ? `${city.toUpperCase()} ${country.toUpperCase()}` : city.toUpperCase()) : undefined;
  const spanLabel = spanLength && spanLength > 1 && typeof spanIndex === 'number'
    ? `Day ${spanIndex + 1}/${spanLength}`
    : undefined;

  const isSpanStart = spanLength && spanLength > 1
    ? (spanStart || spanIndex === 0)
    : false;
  const isSpanEnd = spanLength && spanLength > 1
    ? (spanEnd || (typeof spanIndex === 'number' && spanIndex === spanLength - 1))
    : false;
  const spanEdgeClass = spanLength && spanLength > 1
    ? `${isSpanStart ? 'rounded-l-lg' : 'rounded-none'} ${isSpanEnd ? 'rounded-r-lg' : ''}`
    : '';

  const tooltipParts = [title, timeRange, loc, spanLabel].filter(Boolean);
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

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Ctrl/Cmd+Click for multi-select
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      onMultiSelect?.(!isSelected);
    } else {
      onClick?.();
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Left resize handle */}
      <EventResizeHandle
        id={id}
        direction="start"
        onDragStart={(e) => {
          // Data is already set by EventResizeHandle
          onResizeStart?.(e, 'start');
        }}
        isActive={isSelected}
        title={t('calendar.resize.startDate') || 'Drag to adjust start date'}
        aria="Resize start date"
      />

      <motion.button
        type="button"
        onClick={handleClick}
        layoutId={`event-chip-${id}-${spanIndex}`}
        className={`
          w-full text-left flex flex-col justify-start gap-0 px-1.5 py-1
          border text-[9px] transition-all duration-200 rounded-md shadow-sm
          hover:shadow-md relative z-10 group
          ${isSelected ? 'ring-2 ring-accent-500 ring-offset-1 ring-offset-slate-900' : ''}
          ${tone(status, kind, color)}
          ${spanEdgeClass}
          backdrop-blur-sm hover:bg-white/12
          ${className || ''}
        `}
        title={tooltip}
        aria-label={aria}
        aria-selected={isSelected}
        whileHover={{ scale: 1.02, y: -1, transition: { duration: 0.12 } }}
        whileTap={{ scale: 0.96 }}
        initial={{ opacity: 0, y: 1 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        layout
      >
        {/* First row: icon + title */}
        <div className="flex items-center gap-0.5 min-w-0">
          <span className={`inline-block w-1 h-1 rounded-full flex-shrink-0 ${kind==='show' ? 'bg-white/80' : 'bg-cyan-200'}`} aria-hidden />
          {pinned && <span className="text-[9px] flex-shrink-0" aria-hidden>📌</span>}
          {riskIndicator && (
            <span className={`text-[9px] flex-shrink-0 ${riskIndicator.color}`} title={riskIndicator.tooltip} aria-label={`Risk: ${riskIndicator.tooltip}`}>
              {riskIndicator.icon}
            </span>
          )}
          <span className="truncate text-[9px]">{title}</span>
        </div>

        {/* Second row: span label (only for multi-day) */}
        {spanLabel && (
          <span className="text-[7px] uppercase tracking-tight text-white/60 font-semibold leading-tight" aria-hidden>
            {spanLabel}
          </span>
        )}
      </motion.button>

      {/* Right resize handle */}
      <EventResizeHandle
        id={id}
        direction="end"
        onDragStart={(e) => {
          // Data is already set by EventResizeHandle
          onResizeStart?.(e, 'end');
        }}
        isActive={isSelected}
        title={t('calendar.resize.endDate') || 'Drag to adjust end date'}
        aria="Resize end date"
      />
    </div>
  );
};

EventChipComponent.displayName = 'EventChipComponent';

const EventChip = React.forwardRef(EventChipComponent);
EventChip.displayName = 'EventChip';

export default React.memo(EventChip);
