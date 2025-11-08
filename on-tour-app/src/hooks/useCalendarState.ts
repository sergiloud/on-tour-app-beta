import { useEffect, useMemo, useState } from 'react';

export type CalendarView = 'month'|'week'|'day'|'agenda'|'timeline';

export type CalendarFilters = {
  kinds: { shows: boolean; travel: boolean };
  status: { confirmed: boolean; pending: boolean; offer: boolean };
};

export function useCalendarState() {
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

  useEffect(()=>{ try { localStorage.setItem('calendar:view', view); } catch {} }, [view]);
  useEffect(()=>{ try { localStorage.setItem('calendar:month', cursor); } catch {} }, [cursor]);
  useEffect(()=>{ try { localStorage.setItem('calendar:tz', tz); } catch {} }, [tz]);
  useEffect(()=>{ try { localStorage.setItem('calendar:filters', JSON.stringify(filters)); } catch {} }, [filters]);

  const today = useMemo(()=> new Date().toISOString().slice(0,10), []);

  return { view, setView, cursor, setCursor, tz, setTz, filters, setFilters, today };
}
