import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import FirestoreUserPreferencesService from '../services/firestoreUserPreferencesService';

export type CalendarView = 'month'|'week'|'day'|'agenda'|'timeline';

export type CalendarFilters = {
  kinds: { shows: boolean; travel: boolean };
  status: { confirmed: boolean; pending: boolean; offer: boolean };
};

export function useCalendarState() {
  const { userId } = useAuth();
  
  const [view, setView] = useState<CalendarView>(()=>{
    try { return (localStorage.getItem('calendar:view') as CalendarView) || 'month'; } catch { return 'month'; }
  });
  const [cursor, setCursor] = useState<string>(()=>{
    const today = new Date();
    const ym = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`;
    try { return localStorage.getItem('calendar:month') || ym; } catch { return ym; }
  }); // YYYY-MM
  const [tz, setTz] = useState<string>(()=>{
    const local = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    try { return localStorage.getItem('calendar:tz') || local; } catch { return local; }
  });
  const [filters, setFilters] = useState<CalendarFilters>(()=>{
    try {
      return JSON.parse(localStorage.getItem('calendar:filters')||'') || { kinds: { shows:true, travel:true }, status: { confirmed:true, pending:true, offer:true } };
    } catch { return { kinds: { shows:true, travel:true }, status: { confirmed:true, pending:true, offer:true } }; }
  });

  // Load from Firebase on mount
  useEffect(() => {
    if (userId) {
      FirestoreUserPreferencesService.getUserPreferences(userId)
        .then(prefs => {
          if (prefs?.calendar) {
            setView(prefs.calendar.view);
            setCursor(prefs.calendar.month);
            setTz(prefs.calendar.timezone);
            setFilters(prefs.calendar.filters);
            
            // Update localStorage
            localStorage.setItem('calendar:view', prefs.calendar.view);
            localStorage.setItem('calendar:month', prefs.calendar.month);
            localStorage.setItem('calendar:tz', prefs.calendar.timezone);
            localStorage.setItem('calendar:filters', JSON.stringify(prefs.calendar.filters));
          }
        })
        .catch(err => {
          console.error('Failed to load calendar preferences from Firebase:', err);
        });
    }
  }, [userId]);

  // Sync to Firebase with debounce
  useEffect(() => {
    if (userId) {
      const timeoutId = setTimeout(() => {
        const weekStart = localStorage.getItem('calendar:weekStart');
        const heatmap = localStorage.getItem('calendar:heatmap');
        
        FirestoreUserPreferencesService.saveCalendarPreferences(userId, {
          view,
          month: cursor,
          timezone: tz,
          filters,
          weekStartsOn: weekStart === '0' ? 0 : 1,
          heatmapMode: (heatmap as any) || 'none'
        }).catch(err => {
          console.error('Failed to sync calendar preferences to Firebase:', err);
        });
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [userId, view, cursor, tz, filters]);

  useEffect(()=>{ try { localStorage.setItem('calendar:view', view); } catch {} }, [view]);
  useEffect(()=>{ try { localStorage.setItem('calendar:month', cursor); } catch {} }, [cursor]);
  useEffect(()=>{ try { localStorage.setItem('calendar:tz', tz); } catch {} }, [tz]);
  useEffect(()=>{ try { localStorage.setItem('calendar:filters', JSON.stringify(filters)); } catch {} }, [filters]);

  const today = useMemo(()=> new Date().toISOString().slice(0,10), []);

  return { view, setView, cursor, setCursor, tz, setTz, filters, setFilters, today };
}

