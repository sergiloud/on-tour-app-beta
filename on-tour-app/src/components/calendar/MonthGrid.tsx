import React, { useEffect, useRef } from 'react';
import { announce } from '../../lib/announcer';
import { t } from '../../lib/i18n';
import StatusBadge from '../../ui/StatusBadge';
import EventChip from './EventChip';
import MorePopover from './MorePopover';
import QuickAdd from './QuickAdd';
import ContextMenu from './ContextMenu';
import { trackEvent } from '../../lib/telemetry';
import { useShows } from '../../hooks/useShows';
import type { CalEvent } from './types';

type Props = {
  grid: Array<Array<{ dateStr: string; inMonth: boolean; weekend: boolean }>>;
  eventsByDay: Map<string, CalEvent[]>;
  today: string;
  selectedDay: string;
  setSelectedDay: (d: string) => void;
  onOpen: (ev: CalEvent) => void;
  locale?: string;
  tz?: string;
  onOpenDay?: (dateStr: string) => void;
  onMoveShow?: (showId: string, toDate: string, duplicate?: boolean) => void;
  onQuickAdd?: (dateStr: string) => void; // request to open quick add at date
  onQuickAddSave?: (dateStr: string, data: { city: string; country: string; fee?: number }) => void;
  ariaDescribedBy?: string; // id of hidden hint text
  heatmapMode?: 'none'|'financial'|'activity';
  shows?: Array<{ id: string; date: string; fee: number; status: string }>; // Add shows for financial calculations
};

const weekdays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const MonthGrid: React.FC<Props> = ({ grid, eventsByDay, today, selectedDay, setSelectedDay, onOpen, locale = 'en-US', tz, onOpenDay, onMoveShow, onQuickAdd, onQuickAddSave, ariaDescribedBy, heatmapMode = 'none', shows = [] }) => {
  const { shows: allShows } = useShows();
  const gridRef = useRef<HTMLDivElement|null>(null);
  const [moreOpen, setMoreOpen] = React.useState(false);
  const [moreList, setMoreList] = React.useState<CalEvent[]>([]);
  const [moreDay, setMoreDay] = React.useState<string>('');
  const [qaDay, setQaDay] = React.useState<string>('');
  const [dragOverDay, setDragOverDay] = React.useState<string>('');
  const [kbdDragFrom, setKbdDragFrom] = React.useState<string>('');
  const dragImgRef = React.useRef<HTMLDivElement|null>(null);
  const [isSelecting, setIsSelecting] = React.useState(false);
  const [selectionStart, setSelectionStart] = React.useState<string>('');
  const [selectionEnd, setSelectionEnd] = React.useState<string>('');
  const [dragStart, setDragStart] = React.useState<string>('');
  
  // Context menu state
  const [contextMenu, setContextMenu] = React.useState<{
    x: number;
    y: number;
    dateStr: string;
    events: CalEvent[];
  } | null>(null);

  useEffect(()=>{
    const root = gridRef.current; if (!root) return;
    const onKey = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null; if (!active || active.getAttribute('data-cal-cell') !== '1') return;
      const dateStr = active.getAttribute('data-date') || '';
      const d = new Date(dateStr);
      if (e.key === 'ArrowRight') d.setDate(d.getDate()+1);
      else if (e.key === 'ArrowLeft') d.setDate(d.getDate()-1);
      else if (e.key === 'ArrowDown') d.setDate(d.getDate()+7);
      else if (e.key === 'ArrowUp') d.setDate(d.getDate()-7);
      else if (e.key === 'Home' && (e.ctrlKey || e.metaKey)) { // Ctrl+Home: first of month
        e.preventDefault();
        const first = new Date(dateStr.slice(0,7) + '-01');
        const nextStr = first.toISOString().slice(0,10);
        const nextBtn = root.querySelector(`[data-date="${nextStr}"]`) as HTMLElement | null;
        if (nextBtn){ nextBtn.focus(); announce((t('calendar.day.focus')||'Focused {d}').replace('{d}', nextStr)); }
        return;
      }
      else if (e.key === 'End' && (e.ctrlKey || e.metaKey)) { // Ctrl+End: last of month
        e.preventDefault();
        const ym = dateStr.slice(0,7);
        const y = Number(ym.slice(0,4)); const m = Number(ym.slice(5,7));
        const last = new Date(y, m, 0);
        const nextStr = last.toISOString().slice(0,10);
        const nextBtn = root.querySelector(`[data-date="${nextStr}"]`) as HTMLElement | null;
        if (nextBtn){ nextBtn.focus(); announce((t('calendar.day.focus')||'Focused {d}').replace('{d}', nextStr)); }
        return;
      }
      else if (e.key === 'Home') { // start of week (Mon)
        e.preventDefault();
        const day = d.getDay();
        const mondayDelta = (day + 6) % 7;
        d.setDate(d.getDate() - mondayDelta);
      }
      else if (e.key === 'End') { // end of week (Sun)
        e.preventDefault();
        const day = d.getDay();
        const mondayDelta = (day + 6) % 7;
        const sundayDelta = 6 - mondayDelta;
        d.setDate(d.getDate() + sundayDelta);
      }
      else if (e.key === 'PageUp') { e.preventDefault(); const ev = new CustomEvent('cal:prev'); window.dispatchEvent(ev); return; }
      else if (e.key === 'PageDown') { e.preventDefault(); const ev = new CustomEvent('cal:next'); window.dispatchEvent(ev); return; }
      else if (e.key === 't' || e.key === 'T') { const ev = new CustomEvent('cal:today'); window.dispatchEvent(ev); return; }
      else if (e.key === 'Enter' || e.key === ' ') {
        if (kbdDragFrom) {
          // Drop here
          const duplicate = !!(e.ctrlKey || e.metaKey);
          if (onMoveShow) {
            // Only move the first show of the origin day for simplicity in prototype
            const originEvents = eventsByDay.get(kbdDragFrom) || [];
            const firstShow = originEvents.find(ev=> ev.kind==='show');
            if (firstShow) {
              const id = firstShow.id.startsWith('show:') ? firstShow.id.slice(5) : firstShow.id;
              onMoveShow(id, dateStr, duplicate);
              announce((duplicate ? (t('calendar.announce.copied')||'Duplicated show to {d}') : (t('calendar.announce.moved')||'Moved show to {d}')).replace('{d}', dateStr));
            } else {
              announce(t('calendar.kbdDnD.none')||'No show to move from selected origin');
            }
          }
          setKbdDragFrom('');
          e.preventDefault();
          return;
        }
        setSelectedDay(dateStr);
        announce((t('calendar.day.select')||'Selected {d}').replace('{d}', dateStr));
        e.preventDefault();
        return;
      }
      else if (e.key === 'm' || e.key === 'M') {
        // Toggle mark for keyboard move/copy from current focused day
        if (kbdDragFrom === dateStr) {
          setKbdDragFrom('');
          announce(t('calendar.kbdDnD.cancel')||'Cancelled move/copy mode');
        } else {
          setKbdDragFrom(dateStr);
          announce((t('calendar.kbdDnD.marked')||'Marked {d} as origin. Use Enter on target day to drop. Hold Ctrl/Cmd to copy.').replace('{d}', dateStr));
        }
        e.preventDefault();
        return;
      }
      else return;
      e.preventDefault();
      const nextStr = new Date(d).toISOString().slice(0,10);
      const nextBtn = root.querySelector(`[data-date="${nextStr}"]`) as HTMLElement | null;
      if (nextBtn){ nextBtn.focus(); announce((t('calendar.day.focus')||'Focused {d}').replace('{d}', nextStr)); }
    };
    root.addEventListener('keydown', onKey);
    return () => root.removeEventListener('keydown', onKey);
  }, [gridRef.current]);

  // Context menu handler
  const handleContextMenu = (e: React.MouseEvent, dateStr: string) => {
    e.preventDefault();
    const events = eventsByDay.get(dateStr) || [];
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      dateStr,
      events
    });
  };

  // Generate context menu items
  const getContextMenuItems = (dateStr: string, events: CalEvent[]) => {
    const items = [];

    // Add show option
    items.push({
      label: t('calendar.context.addShow') || 'Add Show',
      icon: '🎵',
      action: () => {
        setQaDay(dateStr);
        setSelectionStart('');
        setSelectionEnd('');
      }
    });

    // Add travel option
    items.push({
      label: t('calendar.context.addTravel') || 'Plan Travel',
      icon: '✈️',
      action: () => {
        // For now, just open quick add - could be extended to open travel planning
        setQaDay(dateStr);
        setSelectionStart('');
        setSelectionEnd('');
      }
    });

    // Separator if there are events
    if (events.length > 0) {
      items.push({ separator: true } as any);
    }

    // Event-specific actions
    events.forEach(event => {
      if (event.kind === 'show') {
        items.push({
          label: `${t('calendar.context.edit') || 'Edit'} ${event.title}`,
          icon: '✏️',
          action: () => onOpen(event)
        });

        items.push({
          label: `${t('calendar.context.duplicate') || 'Duplicate'} ${event.title}`,
          icon: '📋',
          action: () => {
            // Find the show and duplicate it
            const show = allShows.find(s => `show:${s.id}` === event.id);
            if (show && onQuickAddSave) {
              onQuickAddSave(dateStr, {
                city: show.city,
                country: show.country,
                fee: show.fee
              });
            }
          }
        });
      } else if (event.kind === 'travel') {
        items.push({
          label: `${t('calendar.context.edit') || 'Edit'} ${event.title}`,
          icon: '✏️',
          action: () => onOpen(event)
        });
      }
    });

    // Day navigation
    items.push({ separator: true } as any);
    items.push({
      label: t('calendar.context.viewDay') || 'View Day',
      icon: '📅',
      action: () => {
        if (onOpenDay) onOpenDay(dateStr);
      }
    });

    return items;
  };

  return (
    <div className="glass rounded-xl overflow-hidden border border-white/10">
      <div className="grid grid-cols-7 text-[11px] uppercase tracking-wide border-b border-white/10 py-1.5 px-2 sticky top-0 bg-ink-900/30 backdrop-blur supports-[backdrop-filter]:bg-ink-900/25">
        {weekdays.map(w => (
          <div key={w} role="columnheader" className="px-2">{t(`calendar.wd.${w.toLowerCase()}`) || w}</div>
        ))}
      </div>
  <div role="grid" aria-label="Month" ref={gridRef} className="grid grid-cols-7 auto-rows-[minmax(7rem,1fr)]" {...(ariaDescribedBy ? { 'aria-describedby': ariaDescribedBy } : {})}>
        {grid.map((row, i) => (
          <div role="row" className="contents" key={i}>
            {row.map(cell => {
              const events = eventsByDay.get(cell.dateStr) || [];
              const active = selectedDay === cell.dateStr;
              const isToday = cell.dateStr === today;
              const weekdayLabel = new Date(cell.dateStr).toLocaleDateString(locale, { weekday: 'long', timeZone: tz });
              const dayNum = parseInt(cell.dateStr.slice(-2));
              const abbrev = new Date(cell.dateStr).toLocaleDateString(locale, { weekday: 'short', timeZone: tz }).slice(0,3);
              return (
                <div
                  key={cell.dateStr}
                  role="gridcell"
                  aria-label={`${weekdayLabel} ${dayNum}${isToday? ' • '+(t('common.today')||'Today'):''}${active? ' • '+(t('common.selected')||'Selected'):''}, ${events.length} ${events.length===1?(t('calendar.event.one')||'event'):(t('calendar.event.many')||'events')}`}
                  className={`relative p-2 border border-white/5 ${cell.weekend ? 'bg-white/[0.02]' : ''} ${!cell.inMonth ? 'bg-white/[0.03] text-white/60' : ''} ${dragOverDay===cell.dateStr ? 'ring-2 ring-accent-500/60' : ''}`}
                  onClick={()=> { setSelectedDay(cell.dateStr); setQaDay(cell.dateStr); }}
                  onDragOver={(e)=> { if (events.length>=0) { e.preventDefault(); setDragOverDay(cell.dateStr); const duplicate = !!(e.ctrlKey || e.metaKey); try { (e.dataTransfer as DataTransfer).dropEffect = duplicate ? 'copy' : 'move'; } catch {} } }}
                  onDragEnter={() => { setDragOverDay(cell.dateStr); announce((t('calendar.dnd.enter')||'Drop here to place event on {d}').replace('{d}', cell.dateStr)); }}
                  onDragLeave={() => { setDragOverDay(''); announce(t('calendar.dnd.leave')||'Leaving drop target'); }}
                  onDrop={(e)=> {
                    e.preventDefault();
                    const data = e.dataTransfer.getData('text/plain');
                    if (data && data.startsWith('show:') && typeof onMoveShow==='function') {
                      const id = data.slice(5);
                      const duplicate = !!(e.ctrlKey || e.metaKey);
                      onMoveShow(id, cell.dateStr, duplicate);
                      try { trackEvent(duplicate? 'cal.drag.duplicate' : 'cal.drag.move', { id, day: cell.dateStr }); } catch {}
                      announce((duplicate ? (t('calendar.announce.copied')||'Duplicated show to {d}') : (t('calendar.announce.moved')||'Moved show to {d}')).replace('{d}', cell.dateStr));
                    }
                    setDragOverDay('');
                  }}
                  onContextMenu={(e) => handleContextMenu(e, cell.dateStr)} // Add context menu handler
                >
                  <div className="flex items-start justify-between">
                    <button
                      className={`w-7 h-7 text-xs rounded flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-1 focus-visible:ring-offset-ink-900 ${isToday ? 'ring-2 ring-offset-1 ring-offset-ink-900 ring-accent-500' : ''} ${active ? 'bg-accent-500 text-black shadow-glow' : 'bg-white/5'} hover:bg-white/10 transition`}
                      onClick={()=> { setSelectedDay(cell.dateStr); announce((t('calendar.day.select')||'Selected {d}').replace('{d}', cell.dateStr)); }}
                      data-date={cell.dateStr}
                      data-cal-cell="1"
                      aria-current={isToday ? 'date' : undefined}
                      aria-selected={active}
                      title={kbdDragFrom===cell.dateStr ? (t('calendar.kbdDnD.origin')||'Origin (keyboard move/copy active)') : undefined}
                    >{parseInt(cell.dateStr.slice(-2))}</button>
                    <span className="text-[10px] uppercase tracking-wide mt-0.5 opacity-60" aria-hidden>{abbrev}</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {events.slice(0,3).map(ev => (
                      <div
                        key={ev.id}
                        draggable={ev.kind==='show'}
                        onDragStart={(e)=> { if (ev.kind==='show'){ e.dataTransfer.setData('text/plain', ev.id); e.dataTransfer.effectAllowed = 'copyMove';
                          // ghost label: Move/Copy
                          try {
                            const duplicate = !!(e.ctrlKey || e.metaKey);
                            const ghost = document.createElement('div');
                            ghost.textContent = duplicate ? (t('common.copy')||'Copy') : (t('common.move')||'Move');
                            ghost.style.position = 'fixed';
                            ghost.style.top = '-1000px';
                            ghost.style.left = '-1000px';
                            ghost.style.padding = '2px 6px';
                            ghost.style.fontSize = '12px';
                            ghost.style.borderRadius = '6px';
                            ghost.style.background = 'rgba(99,102,241,0.9)';
                            ghost.style.color = '#000';
                            ghost.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.2)';
                            document.body.appendChild(ghost);
                            dragImgRef.current = ghost;
                            e.dataTransfer.setDragImage(ghost, 8, 8);
                          } catch {}
                        } }}
                        onDragEnd={()=> { if (dragImgRef.current){ try { document.body.removeChild(dragImgRef.current); } catch {} dragImgRef.current = null; } setDragOverDay(''); }}
                        onClick={(e)=> { e.stopPropagation(); onOpen(ev); }}
                      >
                        <EventChip
                          title={ev.title}
                          kind={ev.kind}
                          status={ev.status}
                          city={ev.kind==='show' ? ev.title.split(',')[0] : undefined}
                        />
                      </div>
                    ))}
                    {events.length > 3 && (
                      <button
                        className="text-[11px] underline opacity-80 hover:opacity-100"
                        onClick={(e)=> { e.stopPropagation(); setMoreList(events); setMoreDay(cell.dateStr); setMoreOpen(true); try { trackEvent('cal.more.open', { count: events.length-3 }); } catch {} }}
                      >
                        +{events.length-3} {t('calendar.more')||'more'}
                      </button>
                    )}
                  </div>
                  {qaDay===cell.dateStr && (
                    <QuickAdd
                      dateStr={cell.dateStr}
                      onSave={(data)=> { setQaDay(''); if (typeof (onQuickAddSave) === 'function') onQuickAddSave(cell.dateStr, data); }}
                      onCancel={()=> setQaDay('')}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <MorePopover
        open={moreOpen}
        onClose={()=> setMoreOpen(false)}
        events={moreList}
        onOpen={onOpen}
        onOpenDay={()=>{ if (onOpenDay && moreDay) onOpenDay(moreDay); }}
        dayLabel={moreDay ? new Date(moreDay).toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric', timeZone: tz }) : undefined}
      />
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={getContextMenuItems(contextMenu.dateStr, contextMenu.events)}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

export default MonthGrid;
