import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { announce } from '../../lib/announcer';
import { t } from '../../lib/i18n';
import StatusBadge from '../../ui/StatusBadge';
import EventChip from './EventChip';
import MorePopover from './MorePopover';
import ContextMenu from './ContextMenu';
import QuickEventCreator from './QuickEventCreator';
import EventCreationSuccess from './EventCreationSuccess';
import { trackEvent } from '../../lib/telemetry';
import { useShows } from '../../hooks/useShows';
import useSoundFeedback from '../../hooks/useSoundFeedback';
import { calculateEventSpans, isMultiDayEvent } from '../../lib/eventSpanCalculator';
import type { CalEvent } from './types';
import type { EventButton } from './DraggableEventButtons';

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
  onDeleteShow?: (showId: string) => void; // delete when dragged outside grid
  onQuickAdd?: (dateStr: string) => void; // request to open quick add at date
  onQuickAddSave?: (dateStr: string, data: { city: string; country: string; fee?: number }) => void;
  ariaDescribedBy?: string; // id of hidden hint text
  heatmapMode?: 'none'|'financial'|'activity';
  shows?: Array<{ id: string; date: string; fee: number; status: string }>; // Add shows for financial calculations
  onSpanAdjust?: (id: string, direction: 'start'|'end', delta: number) => void;
  selectedEventIds?: Set<string>; // Multi-selection support
  onMultiSelectEvent?: (eventId: string, isSelected: boolean) => void; // Multi-selection callback
};

const weekdays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const MonthGrid: React.FC<Props> = ({ grid, eventsByDay, today, selectedDay, setSelectedDay, onOpen, locale = 'en-US', tz, onOpenDay, onMoveShow, onDeleteShow, onQuickAdd, onQuickAddSave, ariaDescribedBy, heatmapMode = 'none', shows = [], onSpanAdjust, selectedEventIds = new Set(), onMultiSelectEvent }) => {
  const { shows: allShows } = useShows();
  const soundFeedback = useSoundFeedback({ enabled: true, volume: 0.2 });
  const gridRef = useRef<HTMLDivElement|null>(null);
  const dragCounterRef = useRef<{ [key: string]: number }>({});
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
  const [quickCreatorOpen, setQuickCreatorOpen] = React.useState(false);
  const [quickCreatorButton, setQuickCreatorButton] = React.useState<EventButton | undefined>(undefined);
  const [quickCreatorDate, setQuickCreatorDate] = React.useState<string | undefined>(undefined);
  const [successShow, setSuccessShow] = React.useState(false);
  const [successButton, setSuccessButton] = React.useState<EventButton | undefined>(undefined);
  const [successCity, setSuccessCity] = React.useState<string | undefined>(undefined);
  const [successCountry, setSuccessCountry] = React.useState<string | undefined>(undefined);

  // Context menu state
  const [contextMenu, setContextMenu] = React.useState<{
    x: number;
    y: number;
    dateStr: string;
    events: CalEvent[];
  } | null>(null);

  // Resize feedback state
  const [resizeFeedback, setResizeFeedback] = React.useState<{
    active: boolean;
    dateStr?: string;
    delta?: number;
    direction?: 'start' | 'end';
  }>({ active: false });

  // Resize preview state (for visual feedback during drag)
  const [resizingInfo, setResizingInfo] = React.useState<{
    active: boolean;
    eventId?: string;
    direction?: 'start' | 'end';
    anchorDate?: string; // The date that doesn't move
    currentHoverDate?: string; // Current date being hovered
  }>({ active: false });

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
    <motion.div
      ref={gridRef}
      data-grid-calendar
      className="glass rounded-2xl shadow-2xl backdrop-blur-xl transition-all duration-300 bg-gradient-to-br from-white/6 via-white/3 to-white/1 hover:shadow-3xl"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <motion.div
        className="grid grid-cols-7 text-[7px] md:text-[8px] uppercase tracking-[0.15em] px-2.5 md:px-3 py-3 md:py-3.5 bg-gradient-to-r from-white/6 via-white/4 to-white/2 font-semibold text-white/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {weekdays.map((w, idx) => (
          <motion.div
            key={w}
            role="columnheader"
            className="px-0.5 md:px-1 text-white/60 font-medium text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.1 + idx * 0.03 }}
          >
            {t(`calendar.wd.${w.toLowerCase()}`) || w}
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        role="grid"
        aria-label="Month"
        ref={gridRef}
        className="grid grid-cols-7 gap-1 md:gap-1.5 auto-rows-[6.5rem] md:auto-rows-[7rem] px-0 py-2 md:py-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        {...(ariaDescribedBy ? { 'aria-describedby': ariaDescribedBy } : {})}
      >
        {grid.map((row, i) => (
          <motion.div
            role="row"
            className="contents"
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.2 + i * 0.05 }}
          >
            {row.map(cell => {
              const events = eventsByDay.get(cell.dateStr) || [];
              const active = selectedDay === cell.dateStr;
              const isToday = cell.dateStr === today;
              const weekdayLabel = new Date(cell.dateStr).toLocaleDateString(locale, { weekday: 'long', timeZone: tz });
              const dayNum = parseInt(cell.dateStr.slice(-2));
              const abbrev = new Date(cell.dateStr).toLocaleDateString(locale, { weekday: 'short', timeZone: tz }).slice(0,3);

              // Handle drop logic (outside of motion.div to avoid Framer Motion drag event issues)
              const handleCellDrop = (e: React.DragEvent<HTMLDivElement>) => {
                e.preventDefault();
                e.stopPropagation();

                // Clean up drag counter
                dragCounterRef.current[cell.dateStr] = 0;
                setDragOverDay('');
                setResizingInfo({ active: false });

                let button: EventButton | null = null;

                // First try the memory-stored button (most reliable)
                try {
                  const win = window as any;
                  if (win.__draggedEventButton) {
                    button = win.__draggedEventButton;
                  }
                } catch (err) {
                  // Silently fail if not available
                }

                // Fallback: Try dataTransfer JSON
                if (!button) {
                  try {
                    const jsonData = e.dataTransfer.getData('application/json');
                    if (jsonData) {
                      button = JSON.parse(jsonData);
                    }
                  } catch (err) {
                    // Silently fail if not valid JSON
                  }
                }

                // Fallback: Try dataTransfer plain text
                if (!button) {
                  try {
                    const plainData = e.dataTransfer.getData('text/plain');
                    if (plainData && plainData.startsWith('{')) {
                      button = JSON.parse(plainData);
                    }
                  } catch (err) {
                    // Silently fail if not valid JSON
                  }
                }

                // Validate button
                if (button && (button.type === 'show' || button.type === 'travel') && button.label && button.id) {
                  setQuickCreatorButton(button);
                  setQuickCreatorDate(cell.dateStr);
                  setQuickCreatorOpen(true);
                  announce((t('calendar.announce.dragDetected') || 'Event button detected on {d}').replace('{d}', cell.dateStr));
                  trackEvent('cal.drag.detected', { buttonId: button.id, day: cell.dateStr });
                  setDragOverDay('');
                  return;
                }

                // Handle event resize (drag handles on edges)
                const plainData = e.dataTransfer.getData('text/plain');

                if (plainData && plainData.startsWith('resize:') && typeof onSpanAdjust === 'function') {
                  // Format: resize:eventId:direction (eventId can contain colons, so direction is always the last part)
                  const lastColonIndex = plainData.lastIndexOf(':');
                  const direction = plainData.substring(lastColonIndex + 1);
                  const eventIdWithPrefix = plainData.substring(7, lastColonIndex); // Remove 'resize:' prefix

                  if (eventIdWithPrefix && (direction === 'start' || direction === 'end')) {
                    // Find the original event to get its original date
                    const originalEvent = Array.from(eventsByDay.values())
                      .flat()
                      .find(ev => ev.id === eventIdWithPrefix);

                    if (originalEvent) {
                      // For multi-day events, use the correct start/end date based on spanIndex
                      let baseDate: Date;
                      if (direction === 'start') {
                        // For start resize, always use the first day of the span (spanIndex === 0)
                        baseDate = new Date(originalEvent.date);
                      } else {
                        // For end resize, use the last day (spanIndex === spanLength - 1)
                        if (originalEvent.endDate && originalEvent.spanIndex !== undefined && originalEvent.spanLength !== undefined && originalEvent.spanIndex !== originalEvent.spanLength - 1) {
                          // This is a copy in the middle, use endDate instead
                          baseDate = new Date(originalEvent.endDate);
                        } else {
                          baseDate = new Date(originalEvent.endDate || originalEvent.date);
                        }
                      }
                      const newDate = new Date(cell.dateStr);
                      const delta = Math.round(
                        (newDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)
                      );

                      // Show feedback before adjustment
                      setResizeFeedback({
                        active: true,
                        dateStr: cell.dateStr,
                        delta,
                        direction: direction as 'start' | 'end',
                      });

                      // Call the callback with the adjustment
                      onSpanAdjust(eventIdWithPrefix, direction as 'start' | 'end', delta);

                      try { trackEvent('cal.span.adjust', { eventId: eventIdWithPrefix, direction, deltaDays: delta }); } catch {}

                      // Hide feedback after a delay and clear resize info
                      setTimeout(() => {
                        setResizeFeedback({ active: false });
                        setResizingInfo({ active: false });
                      }, 1500);
                    }
                  }
                  setDragOverDay('');
                  setResizingInfo({ active: false });
                  return;
                }

                // Fallback to existing show/travel move logic
                const data = e.dataTransfer.getData('text/plain');
                if (data && (data.startsWith('show:') || data.startsWith('travel:')) && typeof onMoveShow==='function') {
                  // Pass the full event ID (with prefix) to the handler
                  const duplicate = !!(e.ctrlKey || e.metaKey);
                  onMoveShow(data, cell.dateStr, duplicate);
                  try { trackEvent(duplicate? 'cal.drag.duplicate' : 'cal.drag.move', { id: data, day: cell.dateStr }); } catch {}
                  announce((duplicate ? (t('calendar.announce.copied')||'Duplicated show to {d}') : (t('calendar.announce.moved')||'Moved show to {d}')).replace('{d}', cell.dateStr));
                }
                setDragOverDay('');
              };

              return (
                <div
                  key={cell.dateStr}
                  onDragOver={(e)=> {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOverDay(cell.dateStr);

                    // Check if it's a resize operation (visual feedback during drag)
                    try {
                      const plainData = e.dataTransfer.types?.includes('text/plain') ? 'resize' : '';
                      if (plainData) {
                        // Try to extract resize info from custom drag image or data
                        const resizeMatch = e.dataTransfer.getData('text/plain');
                        if (resizeMatch?.startsWith('resize:')) {
                          // Format: resize:eventId:direction (eventId can contain colons, so direction is always the last part)
                          const lastColonIndex = resizeMatch.lastIndexOf(':');
                          const direction = resizeMatch.substring(lastColonIndex + 1);
                          const eventId = resizeMatch.substring(7, lastColonIndex); // Remove 'resize:' prefix

                          if (eventId && (direction === 'start' || direction === 'end')) {
                            // Find original event to get anchor date
                            const originalEvent = Array.from(eventsByDay.values())
                              .flat()
                              .find(ev => ev.id === eventId);

                            if (originalEvent) {
                              const anchorDate = direction === 'start' ?
                                (originalEvent.endDate || originalEvent.date) :
                                originalEvent.date;

                              // Update resize preview state
                              setResizingInfo({
                                active: true,
                                eventId,
                                direction: direction as 'start' | 'end',
                                anchorDate,
                                currentHoverDate: cell.dateStr,
                              });
                            }
                          }
                        }
                      }
                    } catch (err) {
                      // Silently fail - this is just for preview
                    }

                    const duplicate = !!(e.ctrlKey || e.metaKey);
                    try {
                      (e.dataTransfer as DataTransfer).dropEffect = duplicate ? 'copy' : 'move';
                    } catch {}
                  }}
                  onMouseMove={(e) => {
                    // Check if there's a button being dragged
                    if ((window as any).__draggedEventButton && e.buttons === 0) {
                      // Mouse moved with a dragged button but no buttons pressed = drop!
                      const button = (window as any).__draggedEventButton;
                      if (button) {
                        handleCellDrop({
                          preventDefault: () => {},
                          stopPropagation: () => {},
                          clientX: e.clientX,
                          clientY: e.clientY,
                          dataTransfer: { getData: () => '', dropEffect: 'move' }
                        } as any);
                      }
                    }
                  }}
                  onDragEnter={() => {
                    dragCounterRef.current[cell.dateStr] = (dragCounterRef.current[cell.dateStr] || 0) + 1;
                    setDragOverDay(cell.dateStr);
                    announce((t('calendar.dnd.enter')||'Drop here to place event on {d}').replace('{d}', cell.dateStr));
                  }}
                  onDragLeave={() => {
                    const current = dragCounterRef.current[cell.dateStr] || 0;
                    dragCounterRef.current[cell.dateStr] = Math.max(0, current - 1);
                    if ((dragCounterRef.current[cell.dateStr] || 0) <= 0) {
                      dragCounterRef.current[cell.dateStr] = 0;
                      setDragOverDay('');
                      setResizingInfo({ active: false });
                      announce(t('calendar.dnd.leave')||'Leaving drop target');
                    }
                  }}
                  onDrop={handleCellDrop}
                  style={{ pointerEvents: 'auto' }}
                  className="h-full"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    role="gridcell"
                    aria-label={`${weekdayLabel} ${dayNum}${isToday? ' • '+(t('common.today')||'Today'):''}${active? ' • '+(t('common.selected')||'Selected'):''}, ${events.length} ${events.length===1?(t('calendar.event.one')||'event'):(t('calendar.event.many')||'events')}`}
                    className={`relative h-full flex flex-col p-2 md:p-2.5 border transition-all duration-150 overflow-visible ${
                      resizingInfo.active &&
                      resizingInfo.anchorDate &&
                      resizingInfo.currentHoverDate &&
                      (() => {
                        const anchor = new Date(resizingInfo.anchorDate);
                        const current = new Date(resizingInfo.currentHoverDate);
                        const cellDate = new Date(cell.dateStr);
                        const minDate = anchor < current ? anchor : current;
                        const maxDate = anchor > current ? anchor : current;
                        return cellDate >= minDate && cellDate <= maxDate;
                      })()
                      ? 'bg-accent-500/25 border-accent-500/60 ring-1 ring-accent-400/50 shadow-md'
                      : `border-white/5 ${cell.weekend ? 'bg-white/[0.02]' : ''} ${!cell.inMonth ? 'bg-white/[0.015] text-white/40' : ''} ${dragOverDay===cell.dateStr ? 'ring-2 ring-accent-500/60 ring-inset shadow-xl bg-accent-500/10 border-accent-500/30' : 'hover:border-white/10'}`
                    } ${active ? 'bg-gradient-to-br from-accent-500/15 to-accent-600/8 shadow-lg border-accent-500/20' : 'hover:shadow-md'} backdrop-blur-sm`}
                    whileHover={{ scale: 1.01, y: -1, transition: { duration: 0.15 } }}
                    whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
                    onClick={()=> { setSelectedDay(cell.dateStr); if (onOpenDay) onOpenDay(cell.dateStr); }}
                    onContextMenu={(e) => handleContextMenu(e, cell.dateStr)}
                    style={{ pointerEvents: 'auto' }}
                    data-date={cell.dateStr}
                  >
                  <div className="flex items-start justify-between gap-2 mb-1 md:mb-1.5 flex-shrink-0">
                    <motion.button
                      className={`w-6 h-6 md:w-6 md:h-6 text-[8px] md:text-[9px] rounded-lg flex items-center justify-center focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-400 focus-visible:ring-offset-1 focus-visible:ring-offset-ink-900 font-bold transition-all duration-150 ${isToday ? 'ring-2 ring-offset-1 ring-offset-ink-900 ring-accent-400' : ''} ${active ? 'bg-gradient-to-br from-accent-500/90 to-accent-600/80 text-black shadow-lg' : 'bg-white/10 text-white/70 hover:bg-white/15'}`}
                      onClick={()=> { setSelectedDay(cell.dateStr); announce((t('calendar.day.select')||'Selected {d}').replace('{d}', cell.dateStr)); }}
                      whileHover={{ scale: 1.1, y: -1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ duration: 0.12, type: 'spring', stiffness: 400 }}
                      data-date={cell.dateStr}
                      data-cal-cell="1"
                      aria-current={isToday ? 'date' : undefined}
                      aria-selected={active}
                      title={kbdDragFrom===cell.dateStr ? (t('calendar.kbdDnD.origin')||'Origin (keyboard move/copy active)') : undefined}
                    >{parseInt(cell.dateStr.slice(-2))}</motion.button>
                    <span className="text-[6px] md:text-[7px] uppercase tracking-widest mt-0.5 text-white/35 font-semibold" aria-hidden>{abbrev}</span>
                  </div>
                  <div className="flex-1 overflow-visible space-y-0.25 md:space-y-0.5 pr-1 md:pr-1.5">
                    {/* Events already filtered by eventsByDay - just render them */}
                    {(() => {
                      // Render all events (up to 4)
                      const toRender = events.slice(0, 4);
                      return toRender.map((ev, idx) => {
                        const canAdjust = typeof onSpanAdjust === 'function';
                        return (
                          <div
                            key={`${ev.id}-${cell.dateStr}-${ev.spanIndex}`}
                            className="group relative block w-full"
                            draggable={ev.kind==='show' || ev.kind==='travel'}
                            data-event-id={ev.id}
                            data-span-index={ev.spanIndex}
                            onDragStart={(e: React.DragEvent<HTMLDivElement>)=> {
                              if (ev.kind==='show' || ev.kind==='travel'){
                                e.dataTransfer.setData('text/plain', ev.id);
                                e.dataTransfer.effectAllowed = 'copyMove';
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
                            onDragEnd={(e: React.DragEvent<HTMLDivElement>)=> {
                              if (dragImgRef.current){ try { document.body.removeChild(dragImgRef.current); } catch {} dragImgRef.current = null; }
                              setDragOverDay('');

                              // Check if dropped outside grid
                              const gridRef = document.querySelector('[data-grid-calendar]') as HTMLElement | null;
                              if (gridRef && e.clientX && e.clientY) {
                                const rect = gridRef.getBoundingClientRect();
                                const outside = e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom;

                                if (outside && typeof onDeleteShow === 'function') {
                                  onDeleteShow?.(ev.id);
                                  announce((t('calendar.announce.deleted') || 'Event deleted').replace('{d}', ev.title));
                                  try { trackEvent('cal.drag.delete_outside', { id: ev.id }); } catch {}
                                }
                              }
                            }}
                          >
                            {canAdjust && (
                              <button
                                type="button"
                                onClick={(e)=> { e.stopPropagation(); const delta = e.altKey ? -1 : 1; onSpanAdjust?.(ev.id, 'start', delta); }}
                                className="opacity-0 group-hover:opacity-100 transition-all duration-150 absolute -left-2.5 top-1/2 -translate-y-1/2 px-1 py-1 rounded-full bg-white/15 border border-white/25 text-[7px] hover:bg-white/25 hover:border-white/35 shadow-sm hover:shadow-md"
                                title={t('calendar.extend.start.hint') || 'Click to extend start • Alt+Click to shrink'}
                                aria-label={t('calendar.extend.start') || 'Adjust start date'}
                              >
                                ◂
                              </button>
                            )}
                            <EventChip
                              id={ev.id}
                              title={ev.title}
                              kind={ev.kind}
                              status={ev.status}
                              city={ev.kind==='show' ? ev.title.split(',')[0] : undefined}
                              color={ev.color}
                              pinned={ev.pinned}
                              spanLength={ev.spanLength}
                              spanIndex={ev.spanIndex}
                              meta={ev.meta}
                              isSelected={selectedEventIds.has(ev.id)}
                              onClick={() => onOpen(ev)}
                              onMultiSelect={(isSelected) => onMultiSelectEvent?.(ev.id, isSelected)}
                              onResizeStart={(e, direction) => {
                                e.dataTransfer!.effectAllowed = 'move';
                                e.dataTransfer!.setData('text/plain', `resize:${ev.id}:${direction}`);
                                e.stopPropagation();
                              }}
                            />
                            {canAdjust && (
                              <button
                                type="button"
                                onClick={(e)=> { e.stopPropagation(); const delta = e.altKey ? -1 : 1; onSpanAdjust?.(ev.id, 'end', delta); }}
                                className="opacity-0 group-hover:opacity-100 transition-all duration-150 absolute -right-2.5 top-1/2 -translate-y-1/2 px-1 py-1 rounded-full bg-white/15 border border-white/25 text-[7px] hover:bg-white/25 hover:border-white/35 shadow-sm hover:shadow-md"
                                title={t('calendar.extend.end.hint') || 'Click to extend end • Alt+Click to shrink'}
                                aria-label={t('calendar.extend.end') || 'Adjust end date'}
                              >
                                ▸
                              </button>
                            )}
                          </div>
                        );
                      });
                    })()}
                    {events.length > 4 && (
                      <button
                        className="text-[8px] md:text-[9px] font-semibold text-accent-300 hover:text-accent-200 opacity-75 hover:opacity-100 transition-all duration-150"
                        onClick={(e)=> { e.stopPropagation(); setMoreList(events); setMoreDay(cell.dateStr); setMoreOpen(true); try { trackEvent('cal.more.open', { count: events.length-4 }); } catch {} }}
                      >
                        +{events.length-4} more
                      </button>
                    )}
                  </div>
                  {/* QuickAdd moved to EventCreationModal - removed inline form */}
                </motion.div>
                </div>
              );
            })}
          </motion.div>
        ))}
      </motion.div>
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
      <QuickEventCreator
        open={quickCreatorOpen}
        button={quickCreatorButton}
        date={quickCreatorDate}
        onClose={() => {
          setQuickCreatorOpen(false);
          setQuickCreatorButton(undefined);
          setQuickCreatorDate(undefined);
        }}
        onSave={(data) => {
          if (onQuickAddSave && quickCreatorDate) {
            onQuickAddSave(quickCreatorDate, {
              city: data.city,
              country: data.country,
              fee: 0
            });
            announce((t('calendar.announce.eventCreated') || 'Event "{label}" created on {d}').replace('{label}', data.label).replace('{d}', quickCreatorDate));
            trackEvent('cal.event.created', { type: data.type, city: data.city, date: quickCreatorDate });

            // Show success toast
            setSuccessButton(quickCreatorButton);
            setSuccessCity(data.city);
            setSuccessCountry(data.country);
            setSuccessShow(true);
          }
          setQuickCreatorOpen(false);
          setQuickCreatorButton(undefined);
          setQuickCreatorDate(undefined);
        }}
      />
      <EventCreationSuccess
        show={successShow}
        button={successButton}
        city={successCity}
        country={successCountry}
        onDismiss={() => {
          setSuccessShow(false);
          setSuccessButton(undefined);
          setSuccessCity(undefined);
          setSuccessCountry(undefined);
        }}
      />
    </motion.div>
  );
};

export default MonthGrid;
