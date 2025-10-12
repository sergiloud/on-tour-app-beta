import React, { useEffect, useMemo, useRef, useState } from 'react';
import EventChip from './EventChip';
import { t } from '../../lib/i18n';
import type { CalEvent } from './types';

type Props = {
  open: boolean;
  onClose: () => void;
  events: CalEvent[];
  onOpen: (ev: CalEvent) => void;
  onOpenDay?: () => void;
  dayLabel?: string; // formatted day label e.g. "Mon Sep 24"
};

const ROW_H = 28; // px, approximate height per EventChip row

const MorePopover: React.FC<Props> = ({ open, onClose, events, onOpen, onOpenDay, dayLabel }) => {
  const ref = useRef<HTMLDivElement|null>(null);
  const dialogRef = useRef<HTMLDivElement|null>(null);
  const titleId = 'cal-more-title';
  const [q, setQ] = useState('');
  const [scrollTop, setScrollTop] = useState(0);
  const inputRef = useRef<HTMLInputElement|null>(null);
  useEffect(()=>{
    if (!open) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.key === 'Tab') && dialogRef.current) {
        // simple focus trap
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const first = focusables[0];
        const last = focusables[focusables.length-1];
        if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      }
    };
    window.addEventListener('keydown', key);
    inputRef.current?.focus();
    return ()=> window.removeEventListener('keydown', key);
  }, [open]);
  const [kindFilter, setKindFilter] = useState<'all'|'show'|'travel'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const statuses = useMemo(()=> Array.from(new Set(events.map(e=> e.status).filter(Boolean))) as string[], [events]);
  const filtered = useMemo(()=> {
    let list = q ? events.filter(e => (e.title||'').toLowerCase().includes(q.toLowerCase())) : events;
    if (kindFilter!=='all') list = list.filter(e=> e.kind===kindFilter);
    if (statusFilter!=='all') list = list.filter(e=> e.status===statusFilter);
    return list;
  }, [events, q, kindFilter, statusFilter]);
  const viewportH = 0.7 * (typeof window !== 'undefined' ? window.innerHeight : 600);
  const listH = Math.min(420, viewportH - 120);
  const visibleCount = Math.max(8, Math.floor(listH / ROW_H));
  const start = Math.max(0, Math.floor(scrollTop / ROW_H) - 4);
  const end = Math.min(filtered.length, start + visibleCount + 8);
  const beforeH = start * ROW_H;
  const afterH = Math.max(0, (filtered.length - end) * ROW_H);
  if (!open) return null;
  return (
    <div role="dialog" aria-labelledby={titleId} aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div ref={dialogRef} className="relative glass rounded-lg p-3 w-[420px] max-h-[70vh] border border-white/12">
        <div className="flex items-start justify-between mb-2 gap-2">
          <div>
            <div id={titleId} className="text-sm font-medium flex items-center gap-2">
              <span>{t('calendar.more.title')||'More events'}</span>
              {dayLabel && <span className="text-xs opacity-70 font-normal">{dayLabel}</span>}
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-white/10 font-normal">{events.length} {(events.length===1?(t('calendar.event.one')||'event'):(t('calendar.event.many')||'events'))}</span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              <div className="flex items-center gap-1 text-[11px]">
                <label className="opacity-70">{t('calendar.kind')||'Kind'}:</label>
                <div className="flex gap-1">
                  {['all','show','travel'].map(k => (
                    <button key={k} onClick={()=> setKindFilter(k as any)} className={`px-1.5 py-0.5 rounded border text-[11px] ${kindFilter===k? 'bg-accent-500 text-black border-accent-400':'border-white/15 bg-white/5 hover:bg-white/10'}`}>{k}</button>
                  ))}
                </div>
              </div>
              {statuses.length>1 && (
                <div className="flex items-center gap-1 text-[11px]">
                  <label className="opacity-70">{t('calendar.status')||'Status'}:</label>
                  <div className="flex gap-1">
                    <button onClick={()=> setStatusFilter('all')} className={`px-1.5 py-0.5 rounded border text-[11px] ${statusFilter==='all'? 'bg-accent-500 text-black border-accent-400':'border-white/15 bg-white/5 hover:bg-white/10'}`}>{t('common.all')||'All'}</button>
                    {statuses.map(s=> (
                      <button key={s} onClick={()=> setStatusFilter(s||'')} className={`px-1.5 py-0.5 rounded border text-[11px] capitalize ${statusFilter===s? 'bg-accent-500 text-black border-accent-400':'border-white/15 bg-white/5 hover:bg-white/10'}`}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onOpenDay && (
              <button className="text-xs underline opacity-80 hover:opacity-100" onClick={onOpenDay}>{t('calendar.more.openFullDay')||t('calendar.more.openDay')||'Open full day'}</button>
            )}
            <button className="text-xs underline opacity-80 hover:opacity-100" onClick={onClose}>{t('shows.dialog.close')||'Close'}</button>
          </div>
        </div>
        <div className="mb-2">
          <input
            ref={inputRef}
            type="search"
            placeholder={t('common.search')||'Search'}
            value={q}
            onChange={e=> setQ(e.target.value)}
            className="w-full rounded bg-white/5 px-2 py-1 text-sm"
            aria-label={t('calendar.more.filter')||'Filter events'}
          />
        </div>
        <div
          className="space-y-1 overflow-auto"
          style={{ maxHeight: listH }}
          onScroll={e=> setScrollTop((e.target as HTMLDivElement).scrollTop)}
        >
          {filtered.length===0 ? (
            <div className="text-xs opacity-70 px-1 py-2">{t('calendar.more.empty')||'No results'}</div>
          ) : (
            <>
              <div style={{ height: beforeH }} />
              {filtered.slice(start, end).map(ev => (
                <EventChip
                  key={ev.id}
                  title={ev.title}
                  kind={ev.kind}
                  status={ev.status}
                  city={ev.kind==='show' ? ev.title.split(',')[0] : undefined}
                  onClick={()=> onOpen(ev)}
                  meta={ev.meta}
                />
              ))}
              <div style={{ height: afterH }} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MorePopover;
