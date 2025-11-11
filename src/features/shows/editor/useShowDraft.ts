import { useEffect, useMemo, useRef, useState } from 'react';
import type { Show } from '../../../lib/shows';
import type { Cost } from '../../../types/shows';
import { useAuth } from '../../../context/AuthContext';
import FirestoreUserPreferencesService from '../../../services/firestoreUserPreferencesService';

export type ShowDraft = Partial<Show> & {
  whtPct?: number;
  venue?: string;
  mgmtAgency?: string;
  bookingAgency?: string;
  mgmtPct?: number; // management commission %
  bookingPct?: number; // booking commission %
  notes?: string;
  costs?: Cost[];
  fxRateToBase?: number; // FX rate locked for this show
  fxRateDate?: string; // ISO date when rate was locked
  fxRateSource?: string; // 'locked' | 'today' | 'system'
};

export type ValidationErrors = Record<string,string>;

function stableStringify(obj: any){
  try {
    return JSON.stringify(obj, Object.keys(obj).sort());
  } catch { return ''; }
}

export function validateDraft(d: ShowDraft): ValidationErrors {
  const errs: ValidationErrors = {};
  if (!d.city) errs.city = 'shows.editor.validation.cityRequired';
  if (!d.country) errs.country = 'shows.editor.validation.countryRequired';
  const date = String(d.date||'').slice(0,10);
  if (!date) errs.date = 'shows.editor.validation.dateRequired';
  if (d.fee == null || Number(d.fee) < 0) errs.fee = 'shows.editor.validation.feeGtEqZero';
  if (d.whtPct!=null){
    if (d.whtPct < 0 || d.whtPct > 50) errs.whtPct = 'shows.editor.validation.whtRange';
  }
  return errs;
}

export function useShowDraft(initial: ShowDraft){
  const { userId } = useAuth();
  const [draft, setDraft] = useState<ShowDraft>(initial);
  const initialSnap = useRef(stableStringify(normalize(initial)));
  const prevIdRef = useRef<string|undefined>((initial as any).id);
  const storageKeyRef = useRef<string>(`shows.editor.draft.${(initial as any).id}`);
  const [restored, setRestored] = useState(false);
  const validation = useMemo(()=> validateDraft(draft), [draft]);
  const isValid = Object.keys(validation).length===0;
  const dirty = useMemo(()=> initialSnap.current !== stableStringify(normalize(draft)), [draft]);

  function normalize(d: ShowDraft){
    // Normalize date: accept string or Date; output stable YYYY-MM-DD (no TZ shift).
    let date: string | undefined;
    if (d.date && typeof d.date === 'object' && 'getFullYear' in d.date) {
      const dt = d.date as unknown as Date;
      const y = dt.getFullYear();
      const m = String(dt.getMonth()+1).padStart(2,'0');
      const day = String(dt.getDate()).padStart(2,'0');
      date = `${y}-${m}-${day}`;
    } else if (typeof d.date === 'string') {
      date = d.date.slice(0,10) || undefined;
    } else if (d.date != null) {
      // Fallback
      date = String(d.date).slice(0,10) || undefined;
    }

    // Fee: empty string or NaN -> undefined (avoid treating '' as 0 masking validation)
    let fee: number | undefined;
    if (d.fee == null) {
      fee = undefined;
    } else if (typeof d.fee === 'number') {
      fee = isNaN(d.fee) ? undefined : d.fee;
    } else {
      // If somehow a string slips in, attempt parse
      const parsed = Number((d.fee as any));
      fee = isNaN(parsed) ? undefined : parsed;
    }

    const clampPct = (v: any) => v==null || v==='' ? undefined : Math.min(50, Math.max(0, Number(v)));
    const whtPct = clampPct(d.whtPct);
    const mgmtPct = clampPct(d.mgmtPct);
    const bookingPct = clampPct(d.bookingPct);
  const costs = (d.costs||[]).map((c: Cost)=>({ id: c.id, type: c.type, amount: c.amount, desc: c.desc }));
  // sort costs for stable compare: by type then description then id to avoid false dirty when ids differ ordering
  costs.sort((a: Cost, b: Cost)=> (a.type||'').localeCompare(b.type||'') || (a.desc||'').localeCompare(b.desc||'') || a.id.localeCompare(b.id));
  const feeCurrency = (d as any).feeCurrency as ('EUR'|'USD'|'GBP'|'AUD'|undefined);
  
  // Preserve promoter/venue fields
  const promoter = (d as any).promoter;
  const promoterId = (d as any).promoterId;
  const venue = (d as any).venue;
  const venueId = (d as any).venueId;
  
  return { ...d, date, fee, feeCurrency, whtPct, mgmtPct, bookingPct, costs, promoter, promoterId, venue, venueId };
  }

  function reset(newInitial: ShowDraft){
    setDraft(newInitial);
    initialSnap.current = stableStringify(normalize(newInitial));
    // Update autosave key to the new id
    storageKeyRef.current = `shows.editor.draft.${(newInitial as any).id}`;
    setRestored(false);
  }

  // Restore from autosave on mount/id change
  useEffect(()=>{
    const currentId = (initial as any).id;
    if (prevIdRef.current !== currentId){
      // Show changed externally -> reset baseline and attempt restore for new id
      prevIdRef.current = currentId;
      reset(initial);
    }
    storageKeyRef.current = `shows.editor.draft.${currentId}`;
    
    // Try Firebase first
    if (userId && currentId) {
      FirestoreUserPreferencesService.getShowDraft(userId, currentId)
        .then(firebaseDraft => {
          if (firebaseDraft) {
            const normalizedSaved = normalize(firebaseDraft);
            if (stableStringify(normalize(initial)) !== stableStringify(normalizedSaved)){
              setDraft((prev: ShowDraft)=> ({ ...prev, ...normalizedSaved }));
              setRestored(true);
              // Also update localStorage for backwards compatibility
              const payload = { v: 1, ts: Date.now(), data: firebaseDraft };
              localStorage.setItem(storageKeyRef.current, JSON.stringify(payload));
            }
          }
        })
        .catch(err => {
          console.warn('[useShowDraft] Firebase restore failed, trying localStorage:', err);
          // Fallback to localStorage
          tryLocalStorageRestore();
        });
    } else {
      // No userId - fallback to localStorage
      tryLocalStorageRestore();
    }
    
    function tryLocalStorageRestore() {
      try {
        const raw = localStorage.getItem(storageKeyRef.current);
        if (raw){
          try {
            const payload = JSON.parse(raw) as { v:number; ts:number; data: ShowDraft };
            if (payload && payload.data){
              // Only restore if it differs from current initial (i.e., truly unsaved work)
              const normalizedSaved = normalize(payload.data);
              if (stableStringify(normalize(initial)) !== stableStringify(normalizedSaved)){
                setDraft((prev: ShowDraft)=> ({ ...prev, ...normalizedSaved }));
                setRestored(true);
              }
            }
          } catch { /* ignore corrupted payload */ }
        }
      } catch { /* SSR/tests/localStorage unavailable */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ (initial as any).id, userId ]);

  // Autosave with debounce when draft changes
  const saveTimerRef = useRef<number|undefined>(undefined);
  useEffect(()=>{
    // Clear pending timer
    if (saveTimerRef.current){
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = undefined;
    }
    
    const currentId = (draft as any).id;
    
    // If content matches baseline, clear saved draft
    if (!dirty){
      try {
        localStorage.removeItem(storageKeyRef.current);
      } catch { /* ignore */ }
      
      // Also remove from Firebase
      if (userId && currentId) {
        FirestoreUserPreferencesService.removeShowDraft(userId, currentId)
          .catch(err => console.warn('[useShowDraft] Failed to remove Firebase draft:', err));
      }
      return;
    }

    // Debounce write to avoid excessive churn while typing
    saveTimerRef.current = window.setTimeout(()=>{
      try {
        const data = normalize(draft);
        const payload = { v: 1, ts: Date.now(), data };
        
        // Save to localStorage (backwards compatibility)
        localStorage.setItem(storageKeyRef.current, JSON.stringify(payload));
        
        // Also save to Firebase
        if (userId && currentId) {
          FirestoreUserPreferencesService.saveShowDraft(userId, currentId, data)
            .catch(err => console.warn('[useShowDraft] Failed to save to Firebase:', err));
        }
      } catch { /* ignore */ }
    }, 600);

    return ()=> {
      if (saveTimerRef.current){
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = undefined;
      }
    };
  }, [draft, dirty, userId]);

  function discardSavedDraft(){
    try { localStorage.removeItem(storageKeyRef.current); } catch { /* ignore */ }
    
    // Also remove from Firebase
    const currentId = (draft as any).id;
    if (userId && currentId) {
      FirestoreUserPreferencesService.removeShowDraft(userId, currentId)
        .catch(err => console.warn('[useShowDraft] Failed to remove Firebase draft:', err));
    }
    
    setRestored(false);
  }

  return { draft, setDraft, validation, isValid, dirty, reset, restored, discardSavedDraft };
}
