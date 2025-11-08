import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-labelledby={titleId}
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        <motion.div
          ref={dialogRef}
          className="relative glass rounded-xl p-3 md:p-4 w-[460px] max-w-[90vw] max-h-[80vh] border border-white/10 shadow-2xl backdrop-blur-md flex flex-col bg-gradient-to-br from-white/8 via-white/4 to-white/2"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut", type: "spring", stiffness: 300 }}
        >
        <div className="flex items-start justify-between mb-2 gap-2">
          <div>
            <div id={titleId} className="text-xs font-medium flex items-center gap-1.5">
              <span>{t('calendar.more.title')||'More events'}</span>
              {dayLabel && <span className="text-[11px] opacity-70 font-normal">{dayLabel}</span>}
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 font-normal">{events.length} {(events.length===1?(t('calendar.event.one')||'event'):(t('calendar.event.many')||'events'))}</span>
            </div>
            <div className="mt-1.5 md:mt-2 flex flex-wrap gap-1.5 md:gap-2">
              <div className="flex items-center gap-1.5 text-[10px] md:text-xs">
                <label className="opacity-70 font-medium">{t('calendar.kind')||'Kind'}:</label>
                <div className="flex gap-1 md:gap-1.5">
                  {['all','show','travel'].map(k => (
                    <motion.button
                      key={k}
                      onClick={()=> setKindFilter(k as any)}
                      className={`px-2 md:px-3 py-1 md:py-1.5 rounded-lg border text-[10px] md:text-xs font-semibold transition-all duration-200 ${kindFilter===k? 'bg-gradient-to-r from-accent-500 to-accent-600 text-white border-accent-400 shadow-lg':'border-white/20 bg-white/6 hover:bg-white/12 hover:border-white/30'}`}
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.15, type: 'spring', stiffness: 300 }}
                    >
                      {k}
                    </motion.button>
                  ))}
                </div>
              </div>
              {statuses.length>1 && (
                <div className="flex items-center gap-1.5 text-[10px] md:text-xs">
                  <label className="opacity-70 font-medium">{t('calendar.status')||'Status'}:</label>
                  <div className="flex gap-1 md:gap-1.5">
                    <motion.button
                      onClick={()=> setStatusFilter('all')}
                      className={`px-2 md:px-3 py-1 md:py-1.5 rounded-lg border text-[10px] md:text-xs font-semibold transition-all duration-200 ${statusFilter==='all'? 'bg-gradient-to-r from-accent-500 to-accent-600 text-white border-accent-400 shadow-lg':'border-white/20 bg-white/6 hover:bg-white/12 hover:border-white/30'}`}
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.15, type: 'spring', stiffness: 300 }}
                    >
                      {t('common.all')||'All'}
                    </motion.button>
                    {statuses.map(s=> (
                      <motion.button
                        key={s}
                        onClick={()=> setStatusFilter(s||'')}
                        className={`px-2 md:px-3 py-1 md:py-1.5 rounded-lg border text-[10px] md:text-xs font-semibold capitalize transition-all duration-200 ${statusFilter===s? 'bg-gradient-to-r from-accent-500 to-accent-600 text-white border-accent-400 shadow-lg':'border-white/20 bg-white/6 hover:bg-white/12 hover:border-white/30'}`}
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.15, type: 'spring', stiffness: 300 }}
                      >
                        {s}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-2.5">
            {onOpenDay && (
              <motion.button
                className="text-[11px] md:text-xs underline opacity-80 hover:opacity-100 font-medium transition-all duration-200 hover:text-accent-400"
                onClick={onOpenDay}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
              >
                {t('calendar.more.openFullDay')||t('calendar.more.openDay')||'Open full day'}
              </motion.button>
            )}
            <motion.button
              className="text-[11px] md:text-xs underline opacity-80 hover:opacity-100 font-medium transition-all duration-200 hover:text-accent-400"
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
            >
              {t('shows.dialog.close')||'Close'}
            </motion.button>
          </div>
        </div>
        <div className="mb-3 md:mb-4">
          <input
            ref={inputRef}
            type="search"
            placeholder={t('common.search')||'Search'}
            value={q}
            onChange={e=> setQ(e.target.value)}
            className="w-full rounded-lg bg-white/8 border border-white/15 hover:border-white/25 focus:border-accent-400 focus:bg-white/12 px-3 md:px-3.5 py-2 md:py-2.5 text-xs md:text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-400/50 backdrop-blur-sm"
            aria-label={t('calendar.more.filter')||'Filter events'}
          />
        </div>
        <div
          className="space-y-1.5 md:space-y-2 overflow-auto"
          style={{ maxHeight: listH }}
          onScroll={e=> setScrollTop((e.target as HTMLDivElement).scrollTop)}
        >
          {filtered.length===0 ? (
            <div className="text-xs md:text-sm opacity-70 px-2 md:px-3 py-3 md:py-4 text-center">{t('calendar.more.empty')||'No results'}</div>
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MorePopover;
