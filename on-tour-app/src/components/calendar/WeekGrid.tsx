import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { TimedEvent } from '../../hooks/useEventLayout';
import { computeEventLayout } from '../../hooks/useEventLayout';
import EventChip from './EventChip';
import type { CalEvent } from './types';
import { t } from '../../lib/i18n';
import { DragToMoveHandler } from './DragToMoveHandler';
import { useMultiSelect, MultiSelectPanel } from './MultiSelectManager';

type Props = {
  weekStart: string; // Monday as YYYY-MM-DD
  eventsByDay: Map<string, CalEvent[]>;
  tz?: string;
  onOpen: (ev: CalEvent) => void;
  onCreateEvent?: (date: string, startHour: number, duration?: number) => void;
  onMoveEvent?: (eventId: string, toDate: string, newStartHour?: number) => void;
  onDeleteEvent?: (eventId: string) => void;
  onBulkMove?: (eventIds: string[], newDate: string) => void;
  onBulkDelete?: (eventIds: string[]) => void;
};

const hours = Array.from({ length: 24 }, (_, i) => i);

const HOUR_HEIGHT = 56; // h-14 = 56px

/**
 * Enhanced Week Grid Component
 * - Drag-to-create events in time slots
 * - Visual resize handles for timed events
 * - Better time-slot visualization
 * - Current time indicator
 */
const WeekGrid: React.FC<Props> = ({ weekStart, eventsByDay, tz, onOpen, onCreateEvent, onMoveEvent, onDeleteEvent, onBulkMove, onBulkDelete }) => {
  const [dragStart, setDragStart] = useState<{ day: string; hour: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ day: string; hour: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Multi-select functionality
  const multiSelect = useMultiSelect();

  const days = useMemo(()=>{
    const start = new Date(weekStart);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start); d.setDate(d.getDate()+i);
      return d.toISOString().slice(0,10);
    });
  }, [weekStart]);

  const nowRef = useRef<HTMLDivElement|null>(null);
  const todayTz = useMemo(()=>{
    try {
      const now = new Date();
      const parts = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' })
        .formatToParts(now)
        .reduce<Record<string,string>>((acc,p)=>{ if (p.type!=='literal') acc[p.type]=p.value; return acc; }, {});
      if (parts.year && parts.month && parts.day) return `${parts.year}-${parts.month}-${parts.day}`;
    } catch {}
    return new Date().toISOString().slice(0,10);
  }, [tz]);

  useEffect(()=>{
    const tick = () => {
      const now = new Date();
      let minutes: number;
      if (tz) {
        try {
          const parts = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false })
            .formatToParts(now)
            .reduce<Record<string,string>>((acc,p)=>{ if (p.type!=='literal') acc[p.type]=p.value; return acc; }, {});
          const hh = parseInt(parts.hour || String(now.getHours()), 10);
          const mm = parseInt(parts.minute || String(now.getMinutes()), 10);
          minutes = hh*60 + mm;
        } catch {
          minutes = now.getHours()*60 + now.getMinutes();
        }
      } else {
        minutes = now.getHours()*60 + now.getMinutes();
      }
      const top = (minutes/ (24*60)) * 100;
      if (nowRef.current) nowRef.current.style.top = `calc(${top}% + 2rem)`;
    };
    tick();
    const id = setInterval(tick, 60*1000);
    return ()=> clearInterval(id);
  }, [tz]);

  // Handle drag to create event
  const handleDragStart = useCallback((day: string, hour: number, e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setDragStart({ day, hour });
    setDragEnd({ day, hour });
    setIsDragging(true);
  }, []);

  const handleDragOver = useCallback((day: string, hour: number) => {
    if (!isDragging || !dragStart) return;
    setDragEnd({ day, hour });
  }, [isDragging, dragStart]);

  const handleDragEnd = useCallback(() => {
    if (!dragStart || !dragEnd || !isDragging) {
      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
      return;
    }

    const startHour = dragStart.hour;
    const endHour = dragEnd.hour;
    const duration = Math.max(1, Math.abs(endHour - startHour));

    if (onCreateEvent) {
      onCreateEvent(dragStart.day, startHour, duration);
    }

    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  }, [dragStart, dragEnd, isDragging, onCreateEvent]);

  return (
  <motion.div
    className="glass rounded-lg overflow-hidden border border-white/10 hover:border-white/20 shadow-xl backdrop-blur-md transition-all duration-300"
    role="grid"
    aria-label="Week"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
      <div className="grid" style={{ gridTemplateColumns: '80px repeat(7, 1fr)' }}>
        {/* Header */}
        <div></div>
        {days.map(d => {
          const isToday = d === todayTz;
          return (
            <motion.div
              key={d}
              className={`px-2 md:px-3 py-2 md:py-2.5 text-xs md:text-sm border-b border-white/10 ${isToday ? 'ring-2 ring-accent-500/60 rounded-lg shadow-md' : ''} hover:bg-white/5 transition-all duration-200`}
              role="columnheader"
              aria-label={new Date(d).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', timeZone: tz })}
              aria-current={isToday ? 'date' : undefined}
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
              transition={{ duration: 0.2 }}
            >
              {new Date(d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', timeZone: tz })}
            </motion.div>
          );
        })}
        {/* Body */}
        <div className="relative">
          {hours.map(h => (
            <motion.div
              key={h}
              className="h-14 border-b border-white/[0.06] text-[10px] md:text-xs pr-2 md:pr-2.5 text-right opacity-70 hover:opacity-100 transition-opacity duration-200"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: h * 0.02 }}
            >
              {String(h).padStart(2,'0')}:00
            </motion.div>
          ))}
        </div>
        {days.map(d => {
          const items = (eventsByDay.get(d) || []) as CalEvent[];
          const timed: TimedEvent[] = items.filter(e=> !e.allDay && e.start && e.end).map(e=> ({ id: e.id, start: new Date(e.start!), end: new Date(e.end!) }));
          const layout = computeEventLayout(timed);

          // Calculate drag selection range
          const isDaySelected = dragStart?.day === d;
          const minHour = isDaySelected ? Math.min(dragStart.hour, dragEnd?.hour ?? dragStart.hour) : -1;
          const maxHour = isDaySelected ? Math.max(dragStart.hour, dragEnd?.hour ?? dragStart.hour) : -1;

          return (
            <motion.div
              key={d}
              className="relative hover:bg-white/[0.02] transition-colors duration-200 rounded-lg"
              role="gridcell"
              aria-label={`${new Date(d).toLocaleDateString(undefined, { weekday: 'long', timeZone: tz })} ${parseInt(d.slice(-2))}, ${items.length} ${items.length===1?(t('calendar.event.one')||'event'):(t('calendar.event.many')||'events')}`}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              transition={{ duration: 0.2 }}
            >
              {/* Time slots for drag-to-create */}
              {hours.map(h => (
                <motion.div
                  key={`slot-${h}`}
                  data-time-slot={h}
                  data-date={d}
                  className={`absolute left-0 right-0 transition-all ${
                    isDaySelected && h >= minHour && h <= maxHour
                      ? 'bg-accent-500/20 border-l-2 border-accent-500'
                      : 'hover:bg-white/[0.03]'
                  }`}
                  style={{
                    top: `calc(${h * HOUR_HEIGHT}px + 2rem)`,
                    height: `${HOUR_HEIGHT}px`,
                  }}
                  onMouseDown={(e) => handleDragStart(d, h, e)}
                  onMouseEnter={() => isDragging && handleDragOver(d, h)}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={() => {}}
                />
              ))}

              {/* Working hours highlight */}
              <div className="absolute inset-x-0 pointer-events-none" style={{ top: 'calc(9 * 4rem + 2rem)', height: 'calc(9 * 4rem)' }} aria-hidden />

              {/* Current time line */}
              {d === todayTz && (
                <div ref={nowRef} className="absolute left-0 right-0 h-[1px] bg-accent-500/70 z-10" />
              )}

              {/* Timed events */}
              {layout.map((l) => {
                const e = timed.find(te=> te.id===l.id)!;
                const startM = e.start.getHours()*60 + e.start.getMinutes();
                const endM = e.end.getHours()*60 + e.end.getMinutes();
                const top = (startM/(24*60))*100;
                const height = Math.max(2, ((endM-startM)/(24*60))*100);
                const width = 100 / l.columns;
                const left = l.column * width;
                const weekEv = items.find(it=> it.id===l.id)!;

                return (
                  <DragToMoveHandler
                    key={l.id}
                    event={weekEv}
                    onMove={(eventId, newDate, newStartHour) => {
                      // Handle moving event to new time
                      console.log(`Move event ${eventId} to ${newDate} at ${newStartHour}:00`);
                      // TODO: Call parent handler
                    }}
                    onCopy={(eventId, newDate) => {
                      // Handle copying event
                      console.log(`Copy event ${eventId} to ${newDate}`);
                      // TODO: Call parent handler
                    }}
                  >
                    <motion.div
                      className="absolute px-1.5 md:px-2 group w-full h-full"
                      style={{
                        top: `calc(${top}% + 2rem)`,
                        height: `calc(${height}% - 2px)`,
                        left: `${left}%`,
                        width: `${width}%`,
                      }}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="h-full relative">
                        <EventChip
                          title={weekEv.title}
                          kind={weekEv.kind}
                          status={weekEv.status}
                          city={weekEv.kind==='show' ? weekEv.title.split(',')[0] : undefined}
                          startIso={weekEv.start}
                          endIso={weekEv.end}
                          meta={weekEv.meta}
                          isSelected={multiSelect.isSelected(weekEv.id)}
                          onMultiSelect={(isSelected) => multiSelect.toggleSelection(weekEv.id, true)}
                        />
                        {/* Resize handle bottom */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 hover:bg-accent-500/50 cursor-row-resize opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg" title="Drag to resize" />
                      </div>
                    </motion.div>
                  </DragToMoveHandler>
                );
              })}

              {/* All-day events section */}
              <div className="px-3 md:px-4 py-2 md:py-3 space-y-2 md:space-y-3 pointer-events-auto relative z-5">
                {items.filter(e=> e.allDay || !e.start || !e.end).map(ev => (
                  <EventChip
                    key={ev.id}
                    title={ev.title}
                    kind={ev.kind}
                    status={ev.status}
                    city={ev.kind==='show' ? ev.title.split(',')[0] : undefined}
                    onClick={()=> onOpen(ev)}
                    meta={ev.meta}
                    isSelected={multiSelect.isSelected(ev.id)}
                    onMultiSelect={(isSelected) => multiSelect.toggleSelection(ev.id, true)}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Multi-Select Panel */}
      <MultiSelectPanel
        selectedCount={multiSelect.count}
        onMove={() => {
          // Move selected events to a date (would open date picker in real implementation)
          console.log('Move selected:', Array.from(multiSelect.selectedIds));
        }}
        onCopy={() => {
          // Copy selected events
          console.log('Copy selected:', Array.from(multiSelect.selectedIds));
        }}
        onDelete={() => {
          // Delete selected events
          Array.from(multiSelect.selectedIds).forEach((id) => {
            onDeleteEvent?.(id);
          });
          multiSelect.clearSelection();
        }}
        onClear={multiSelect.clearSelection}
      />
    </motion.div>
  );
};

export default WeekGrid;
