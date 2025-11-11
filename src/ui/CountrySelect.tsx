import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { COUNTRIES } from '../lib/countries';
import { t } from '../lib/i18n';
import { useSettings } from '../context/SettingsContext';
import * as telemetry from '../lib/telemetry';
import { TE } from '../lib/telemetryEvents';

// Accessible combobox country selector with search by name or code and emoji flag.
// Persists last used country in localStorage for convenience.
export interface CountrySelectProps {
  value?: string;
  onChange: (code: string) => void;
  id?: string;
  required?: boolean;
  'data-field'?: string;
}

function flagEmoji(cc: string) {
  if (!cc || cc.length !== 2) return '🏳️';
  const codePoints = cc.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

const STORAGE_KEY = 'lastCountry';

export const CountrySelect: React.FC<CountrySelectProps> = ({ value, onChange, id, required, ...rest }) => {
  // Safely resolve telemetry function even when tests mock the module without trackEvent/track
  const getTrack = () => {
    try {
      const m: any = telemetry;
      const fn = m?.trackEvent ?? m?.track;
      return typeof fn === 'function' ? fn : (() => { });
    } catch {
      return () => { };
    }
  };
  const list = Object.keys(COUNTRIES);
  const { lang } = useSettings();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [listStyle, setListStyle] = useState<React.CSSProperties>({});
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const internalId = useId();
  const cid = id || internalId;
  const lastSearchRef = useRef<string>('');
  const liveRef = useRef<HTMLDivElement | null>(null);
  const [liveMsg, setLiveMsg] = useState('');
  const announceTimer = useRef<number | null>(null);

  // Precompute lowercased labels once per lang for perf (avoid per-keystroke toLowerCase allocations)
  const lowerCacheRef = useRef<Record<string, { label: string; lower: string }>>({});
  if (Object.keys(lowerCacheRef.current).length === 0) {
    const cache: Record<string, { label: string; lower: string }> = {};
    for (const code of list) {
      const label = COUNTRIES[code]?.[lang];
      if (label) cache[code] = { label, lower: label.toLowerCase() };
    }
    lowerCacheRef.current = cache;
  }
  // If language changes, rebuild cache
  useEffect(() => {
    const cache: Record<string, { label: string; lower: string }> = {};
    for (const code of list) {
      const label = COUNTRIES[code]?.[lang];
      if (label) cache[code] = { label, lower: label.toLowerCase() };
    }
    lowerCacheRef.current = cache;
  }, [lang]);

  const qLower = query.toLowerCase();
  const items = list
    .map(code => {
      const cached = lowerCacheRef.current[code];
      if (!cached) return null;
      return { code, label: cached.label, lower: cached.lower };
    })
    .filter((it): it is NonNullable<typeof it> => it !== null)
    .filter(it => !query
      || it.code.toLowerCase().includes(qLower)
      || it.lower.includes(qLower)
    )
    .slice(0, 50);

  useEffect(() => {
    if (!value) {
      try { const last = localStorage.getItem(STORAGE_KEY); if (last) onChange(last); } catch { }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (value) { try { localStorage.setItem(STORAGE_KEY, value); } catch { } }
  }, [value]);

  useEffect(() => { if (open) { setActiveIndex(0); } }, [open, query]);

  // Adjust dropdown height/position so scroll can reach the bottom of viewport.
  useEffect(() => {
    if (!open) return;
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const spaceBelow = viewportH - rect.bottom - 8; // padding
    const desiredMax = Math.max(160, spaceBelow); // ensure at least previous ~208px (52*4)
    
    // Update dropdown position for portal
    setDropdownPosition({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      width: rect.width
    });
    
    // If spaceBelow too small (e.g., near bottom), try opening upward.
    if (spaceBelow < 120) {
      const spaceAbove = rect.top - 8;
      if (spaceAbove > spaceBelow) {
        setListStyle({ maxHeight: spaceAbove });
        setDropdownPosition({
          top: rect.top + window.scrollY - 4,
          left: rect.left + window.scrollX,
          width: rect.width
        });
        return;
      }
    }
    setListStyle({ maxHeight: desiredMax });
  }, [open, query, items.length]);

  function select(code: string) {
    onChange(code);
    setOpen(false);
    setQuery('');
    inputRef.current?.focus();
    getTrack()(TE.COUNTRY_SELECT, { code });
  }

  // Outside click to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: Event) => {
      if (!rootRef.current) return;
      if (e.target instanceof Node && rootRef.current.contains(e.target)) return;
      setOpen(false);
      setQuery('');
    };
    window.addEventListener('mousedown', handler as any, true);
    window.addEventListener('pointerdown', handler as any, true);
    return () => {
      window.removeEventListener('mousedown', handler as any, true);
      window.removeEventListener('pointerdown', handler as any, true);
    };
  }, [open]);

  // Close on any page scroll (user intent changed / reposition risk)
  useEffect(() => {
    if (!open) return;
    const onScroll = () => { setOpen(false); setQuery(''); };
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, [open]);

  const hasValue = !!value;
  const showClear = hasValue || (!!query && open);
  function clear() {
    onChange('');
    setQuery('');
    setOpen(true); // reopen to allow immediate new selection
    setActiveIndex(0);
    inputRef.current?.focus();
    getTrack()(TE.COUNTRY_CLEAR);
  }

  // Emit search telemetry when query changes (debounced-ish & only for length >1)
  useEffect(() => {
    if (!open) return; // only while dropdown open
    if (query.length <= 1) return;
    if (query === lastSearchRef.current) return;
    lastSearchRef.current = query;
    getTrack()(TE.COUNTRY_SEARCH, { q: query, len: query.length, results: items.length });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, open]);

  // Aria-live announcement of result count (debounced) for screen reader users
  useEffect(() => {
    if (!open) return; // only while user interacting
    if (announceTimer.current != null) window.clearTimeout(announceTimer.current);
    // Debounce to avoid chatter while typing quickly
    announceTimer.current = window.setTimeout(() => {
      if (!open) return;
      if (!query) { setLiveMsg(''); return; }
      const count = items.length;
      if (count === 0) {
        setLiveMsg((t('common.noResults') || 'No results') + '.');
      } else if (count === 1) {
        setLiveMsg('1 ' + (t('common.result') || 'result'));
      } else {
        // Attempt i18n key; fallback English
        const tpl = t('common.results.count');
        if (tpl) {
          setLiveMsg(tpl.replace('{count}', String(count)));
        } else {
          setLiveMsg(count + ' ' + (t('common.results') || 'results'));
        }
      }
    }, 250);
    return () => { if (announceTimer.current != null) window.clearTimeout(announceTimer.current); };
  }, [query, items.length, open, lang]);

  return (
    <div ref={rootRef} className="relative" aria-haspopup="listbox" aria-expanded={open}>
      <input
        ref={inputRef}
        id={cid}
        role="combobox"
        aria-autocomplete="list"
        aria-controls={open ? cid + '-list' : undefined}
        aria-activedescendant={open ? cid + '-opt-' + activeIndex : undefined}
        placeholder={t('shows.editor.label.country') || 'Country'}
        className="px-3 py-1.5 pr-8 rounded-md bg-slate-100 dark:bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-white/15 focus:border-accent-500 focus:bg-slate-300 dark:bg-white/15 focus:shadow-lg focus:shadow-accent-500/10 focus:ring-1 focus:ring-accent-500/20 transition-all uppercase w-full text-sm"
        value={open ? query : (value || '')}
        data-country-value={value || ''}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={e => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActiveIndex(i => Math.min(items.length - 1, i + 1)); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(0, i - 1)); }
          else if (e.key === 'PageDown') { e.preventDefault(); setOpen(true); setActiveIndex(i => Math.min(items.length - 1, i + 10)); }
          else if (e.key === 'PageUp') { e.preventDefault(); setActiveIndex(i => Math.max(0, i - 10)); }
          else if (e.key === 'Home') { e.preventDefault(); setActiveIndex(0); }
          else if (e.key === 'End') { e.preventDefault(); setActiveIndex(items.length - 1); }
          else if (e.key === 'Enter') { if (open) { e.preventDefault(); const it = items[activeIndex]; if (it) select(it.code); } }
          else if (e.key === 'Escape') { if (open) { e.preventDefault(); setOpen(false); } }
          else if (e.key === 'Backspace' && !query && value) { onChange(''); }
        }}
        {...rest}
      />
      {value && !open && (
        <span className="absolute right-7 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] flex items-center gap-0.5 text-slate-400 dark:text-white/60" aria-hidden="true">
          <span>{flagEmoji(value)}</span>
          <span className="hidden sm:inline text-[9px] opacity-70">{value}</span>
        </span>
      )}
      {showClear && (
        <button
          type="button"
          aria-label={t('filters.clear') || 'Clear'}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 rounded hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 flex items-center justify-center text-[10px]"
          onClick={clear}
        >×</button>
      )}
      {open && items.length > 0 && createPortal(
        <ul
          ref={listRef}
          id={cid + '-list'}
          role="listbox"
          style={{
            ...listStyle,
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            zIndex: 10001
          }}
          className="overflow-auto bg-ink-900 border border-white/15 rounded shadow-lg text-xs"
        >
          {items.map((it, idx) => (
            <li
              id={cid + '-opt-' + idx}
              key={it.code}
              role="option"
              aria-selected={value === it.code}
              onMouseDown={e => { e.preventDefault(); select(it.code); }}
              className={`px-2 py-1 cursor-pointer flex items-center gap-2 ${idx === activeIndex ? 'bg-white/15' : ''}`}
              onMouseEnter={() => setActiveIndex(idx)}
            >
              <span>{flagEmoji(it.code)}</span>
              <span className="flex-1 truncate">{it.label}</span>
              <span className="opacity-60 text-[10px]">{it.code}</span>
            </li>
          ))}
        </ul>,
        document.body
      )}
      {open && items.length === 0 && createPortal(
        <div 
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            zIndex: 10001
          }}
          className="bg-ink-900 border border-white/15 rounded shadow-lg text-xs p-2 opacity-70" 
          role="status"
        >
          {t('common.noResults') || 'No results'}
        </div>,
        document.body
      )}
      {/* Visually hidden aria-live region for announcing count updates */}
      <div aria-live="polite" className="sr-only" ref={liveRef}>{liveMsg}</div>
    </div>
  );
};

export default CountrySelect;
