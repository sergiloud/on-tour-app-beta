import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { t } from '../../lib/i18n';
import { CountrySelect } from '../../ui/CountrySelect';
import { useShows } from '../../hooks/useShows';
import { getCurrentOrgId } from '../../lib/tenants';
import { useSettings } from '../../context/SettingsContext';

type Props = {
  dateStr: string; // YYYY-MM-DD
  selectedRange?: string[]; // Array of selected dates for range creation
  onSave: (data: { city: string; country: string; fee?: number }) => void;
  onCancel: () => void;
};

const QuickAdd: React.FC<Props> = ({ dateStr, selectedRange = [], onSave, onCancel }) => {
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [fee, setFee] = useState<string>('');
  const [advanced, setAdvanced] = useState(false);
  const [error, setError] = useState<string>('');
  const firstRef = useRef<HTMLInputElement|null>(null);
  useEffect(()=>{ firstRef.current?.focus(); }, []);
  const isValid = city.trim() && country.trim();
  const submit = () => { if (!isValid) return; onSave({ city: city.trim(), country: country.trim().toUpperCase().slice(0,2), fee: fee===''? undefined : Number(fee) }); };
  useEffect(()=>{
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  }, [onCancel]);
  // Recent cities from existing shows (city + country), unique and limited
  const { shows } = useShows();
  const recents = useMemo(()=>{
    const seen = new Set<string>();
    const out: { city:string; country:string }[] = [];
    for (let i = shows.length - 1; i >= 0; i--) {
      const s = shows[i] as any;
      const key = (s.city||'')+'|'+(s.country||'');
      if(!s.city || !s.country) continue;
      if(!seen.has(key)) { seen.add(key); out.push({ city: s.city, country: s.country }); }
      if(out.length>=5) break;
    }
    return out;
  }, [shows]);

  // Single-line parser: "Madrid ES 12k" -> { city, country, fee }
  function parseLine(input: string){
    setError('');
    const parts = input.replace(/[,]+/g,' ').trim().split(/\s+/);
    if(parts.length===0) return null;
    let feeParsed: number | undefined;
    let countryParsed: string | undefined;
    // Fee token at end if numeric-ish
    const last = parts[parts.length-1];
    const feeMatch = last?.match(/^([0-9]+(?:[.,][0-9]+)?)([kKmM])?$/);
    if(feeMatch){
      const base = parseFloat(feeMatch[1]!.replace(',','.'));
      const mult = feeMatch[2]?.toLowerCase()==='m' ? 1_000_000 : feeMatch[2]?.toLowerCase()==='k' ? 1_000 : 1;
      feeParsed = Math.round(base * mult);
      parts.pop();
    }
    // Country code (2 letters) now possibly last
    const maybeCc = parts[parts.length-1];
    if(maybeCc && /^[a-zA-Z]{2}$/.test(maybeCc)){
      countryParsed = maybeCc.toUpperCase();
      parts.pop();
    }
    const cityParsed = parts.join(' ').trim();
    if(!cityParsed){ return null; }
    if(!countryParsed){
      // Try to infer by recent unique city match
      const matches = recents.filter(r => r.city.toLowerCase() === cityParsed.toLowerCase());
      const uniqueCountries = Array.from(new Set(matches.map(m=> m.country)));
      if(uniqueCountries.length === 1){
        countryParsed = uniqueCountries[0];
      }
    }
    if(!countryParsed){
      try { const lastCountry = localStorage.getItem('lastCountry'); if(lastCountry) countryParsed = lastCountry; } catch {}
    }
    return { city: cityParsed, country: countryParsed, fee: feeParsed };
  }

  function submitLine(input: string){
    const res = parseLine(input);
    if(!res || !res.city){ setError(t('calendar.quickAdd.parseError')||"Can't understand — try 'Madrid ES 12000'"); return; }
    if(!res.country){ setError(t('calendar.quickAdd.countryMissing')||'Add 2-letter country code'); return; }
    // Persist last used country for future convenience (used by parser fallback and CountrySelect)
    try { if(res.country) localStorage.setItem('lastCountry', res.country); } catch {}
    onSave({ city: res.city, country: res.country, fee: res.fee });
  }

  return (
    <motion.div
      className="absolute inset-x-2 md:inset-x-3 top-8 md:top-9 z-20 glass rounded-lg p-2.5 md:p-3 border border-white/20 shadow-2xl backdrop-blur-md"
      role="dialog"
      aria-label={t('calendar.quickAdd')||'Quick add show'}
      onClick={e=> e.stopPropagation()}
      initial={{ opacity: 0, scale: 0.9, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
    <div className="flex items-center justify-between mb-1.5 md:mb-2">
        <div className="text-[10px] md:text-xs opacity-70 font-medium">
          {selectedRange.length > 1 ? (
            `${selectedRange.length} ${t('calendar.days') || 'days'} • ${new Date(selectedRange[0]!).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${new Date(selectedRange[selectedRange.length - 1]!).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
          ) : (
            new Date(dateStr).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
          )}
        </div>
        <motion.button
          className="text-[10px] md:text-xs underline opacity-80 hover:opacity-100 font-medium transition-all duration-200 hover:text-accent-400"
          onClick={()=> setAdvanced(a=> !a)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.1 }}
        >
          {advanced ? (t('calendar.quickAdd.simple')||'Simple') : (t('calendar.quickAdd.advanced')||'Advanced')}
        </motion.button>
      </div>
      {!advanced ? (
        <SimpleMode
          onSubmit={submitLine}
          onCancel={onCancel}
          error={error}
          recents={recents}
        />
      ) : (
        <AdvancedMode
          city={city}
          setCity={setCity}
          country={country}
          setCountry={setCountry}
          fee={fee}
          setFee={setFee}
          firstRef={firstRef}
          onSubmit={submit}
          onCancel={onCancel}
        />
      )}
      <div className="mt-1.5 md:mt-2 text-[10px] md:text-xs opacity-70 font-medium">{t('calendar.quickAdd.hint') || 'Enter to add • Esc to cancel'}</div>
    </motion.div>
  );
};

export default QuickAdd;

// Simple one-line input with recent chips
const SimpleMode: React.FC<{
  onSubmit: (value: string) => void;
  onCancel: () => void;
  error?: string;
  recents: { city:string; country:string }[];
}> = ({ onSubmit, onCancel, error, recents }) => {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLInputElement|null>(null);
  useEffect(()=>{ ref.current?.focus(); }, []);
  return (
    <div>
      <input
        ref={ref}
        placeholder={t('calendar.quickAdd.placeholder')||'City CC Fee (optional)… e.g., Madrid ES 12000'}
        className="px-2 md:px-2.5 py-1 md:py-1.5 rounded-md bg-white/5 border border-white/10 hover:border-white/20 focus:border-accent-400 text-[10px] md:text-xs w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-400/50"
        value={value}
        onChange={e=> setValue(e.target.value)}
        onKeyDown={e=> { if(e.key==='Enter'){ e.preventDefault(); onSubmit(value); } if(e.key==='Escape'){ e.preventDefault(); onCancel(); } }}
      />
      {error && <div className="mt-1 text-[9px] text-rose-300 font-medium">{error}</div>}
      {recents.length>0 && (
        <div className="mt-1 flex flex-wrap gap-1 items-center">
          <span className="text-[9px] opacity-70 font-medium">{t('calendar.quickAdd.recent')||'Recent'}</span>
          {recents.map(r => (
            <motion.button
              key={r.city+'|'+r.country}
              className="text-[9px] px-1 py-0.5 rounded-sm bg-white/10 border border-white/15 hover:bg-white/15 hover:border-white/20 font-medium transition-all duration-200"
              onClick={()=> onSubmit(`${r.city} ${r.country}`)}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
            >
              {r.city} {r.country}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

// Advanced three-field form
const AdvancedMode: React.FC<{
  city: string;
  setCity: (v:string)=>void;
  country: string;
  setCountry: (v:string)=>void;
  fee: string;
  setFee: (v:string)=>void;
  firstRef: React.RefObject<HTMLInputElement | null>;
  onSubmit: () => void;
  onCancel: () => void;
}> = ({ city, setCity, country, setCountry, fee, setFee, firstRef, onSubmit, onCancel }) => {
  const { currency } = useSettings();
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-1.5 md:gap-2">
      <input ref={firstRef} placeholder={t('shows.editor.label.city')||'City'} className="px-2.5 md:px-3 py-1.5 md:py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 focus:border-accent-400 text-xs md:text-sm w-full md:w-[36%] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-400/50" value={city} onChange={e=> setCity(e.target.value)} onKeyDown={e=>{ if (e.key==='Enter'){ e.preventDefault(); onSubmit(); } if (e.key==='Escape'){ e.preventDefault(); onCancel(); } }} />
      <div className="w-full md:w-[28%] min-w-[140px]">
        <CountrySelect value={country} onChange={code=> setCountry(code)} data-field="quick-country" />
      </div>
      <div className="relative w-full md:w-[22%]">
        <input type="number" min={0} placeholder={t('shows.editor.label.fee')||'Fee'} className="px-2.5 md:px-3 py-1.5 md:py-2 pr-8 md:pr-10 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 focus:border-accent-400 text-xs md:text-sm w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-400/50" value={fee} onChange={e=> setFee(e.target.value)} onKeyDown={e=>{ if (e.key==='Enter'){ e.preventDefault(); onSubmit(); } if (e.key==='Escape'){ e.preventDefault(); onCancel(); } }} />
        <span className="absolute right-2.5 md:right-3 top-1/2 -translate-y-1/2 text-xs md:text-xs opacity-70 font-medium">{currency}</span>
      </div>
      <div className="flex gap-1.5 md:gap-2">
        <motion.button
          className="px-2.5 md:px-3 py-1.5 md:py-2 rounded-lg bg-accent-500 hover:bg-accent-400 text-black text-xs md:text-sm font-semibold shadow-glow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onSubmit}
          disabled={!city.trim() || !country.trim()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.1 }}
        >
          {t('common.add')||'Add'}
        </motion.button>
        <motion.button
          className="px-2.5 md:px-3 py-1.5 md:py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs md:text-sm font-medium transition-all duration-200"
          onClick={onCancel}
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.1 }}
        >
          {t('shows.dialog.cancel')||'Cancel'}
        </motion.button>
      </div>
    </div>
  );
};
