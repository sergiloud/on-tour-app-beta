import React from 'react';
import { useAirportsSearch, Airport } from '../../hooks/useAirportsSearch';
import { t } from '../../../../lib/i18n';

type Props = {
  label: string; // visible label
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  invalid?: boolean;
  describedBy?: string;
  altLabel?: string; // optional extra sr-only label text appended for accessible name (e.g., canonical 'From'/'To')
};

const AirportAutocomplete: React.FC<Props> = ({ label, altLabel, value, placeholder, onChange, invalid=false, describedBy }) => {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const results = useAirportsSearch(value).slice(0, 6);
  const listId = React.useId();
  const liveId = React.useId();

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) setOpen(true);
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i=> Math.min(i+1, Math.max(0, results.length-1))); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(i=> Math.max(0, i-1)); }
    else if (e.key === 'Enter') { e.preventDefault(); const pick = results[active]; if (pick) onChange(pick.iata); setOpen(false); }
    else if (e.key === 'Escape') { setOpen(false); }
  };

  const pick = (a: Airport) => { onChange(a.iata); setOpen(false); };

  // Click outside to close
  const rootRef = React.useRef<HTMLLabelElement>(null);
  React.useEffect(()=>{
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return ()=> document.removeEventListener('mousedown', onDocClick);
  }, []);

  const q = value?.toLowerCase() || '';
  const highlight = (text: string) => {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q);
    if (idx<0) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-transparent text-white font-semibold">
          {text.slice(idx, idx+q.length)}
        </mark>
        {text.slice(idx+q.length)}
      </>
    ) as unknown as string;
  };
  // Announce results count changes
  const [announce, setAnnounce] = React.useState('');
  React.useEffect(()=>{
    if (!open) return;
    setAnnounce(results.length>0 ? `${results.length}` : (t('common.noResults')||'No results'));
  }, [open, results.length]);

  return (
    <label ref={rootRef} className="relative flex flex-col gap-1">
      <span className="text-xs opacity-70">{label}{altLabel && <span className="sr-only"> {altLabel}</span>}</span>
      <input
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && results[active] ? `${listId}-opt-${active}` : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        value={value}
        onChange={e=> { onChange(e.target.value.toUpperCase()); setOpen(true); setActive(0); }}
        onFocus={()=> setOpen(true)}
        onBlur={(e)=>{ if (!rootRef.current?.contains(e.relatedTarget as Node)) setOpen(false); }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={`bg-white/5 rounded px-2 py-1 ${invalid?'ring-1 ring-red-500/60':''}`}
      />
      <div id={liveId} className="sr-only" aria-live="polite">{announce}</div>
      {open && (
        <ul role="listbox" id={listId} className="absolute top-full z-20 mt-1 w-full rounded border border-white/10 bg-black/70 backdrop-blur p-1 max-h-60 overflow-auto">
          {results.length===0 && (
            <li className="px-2 py-1 text-xs opacity-70" aria-disabled>{t('common.noResults')||'No results'}</li>
          )}
          {results.map((a, i)=> (
            <li
              key={a.iata+String(i)}
              id={`${listId}-opt-${i}`}
              role="option"
              aria-selected={i===active}
              className={`px-2 py-1 rounded cursor-pointer ${i===active?'bg-white/10':''}`}
              onMouseEnter={()=> setActive(i)}
              onMouseDown={(e)=> { e.preventDefault(); pick(a); }}
            >
              <div className="text-xs">{highlight(a.display)}</div>
            </li>
          ))}
        </ul>
      )}
    </label>
  );
};

export default AirportAutocomplete;
