import { useEffect, useMemo, useState } from 'react';
import { Show } from '../lib/shows';
import { showStore } from '../shared/showStore';
import { getCurrentOrgId } from '../lib/tenants';

export function useShows() {
  const [allShows, setAllShows] = useState<Show[]>(() => {
    const current = showStore.getAll();
    if (current.length) return current;
    // If the store is empty (likely constructed before tests seeded localStorage), hydrate from storage now.
    try {
      const raw = localStorage.getItem('shows-store-v3') || localStorage.getItem('demo:shows');
      const list = raw ? JSON.parse(raw) : [];
      if (Array.isArray(list) && list.length) {
        // Update the store so future subscribers get the same data
        showStore.setAll(list);
        return list as Show[];
      }
    } catch {}
    return current;
  });
  const [orgId, setOrgId] = useState<string>(()=>{ 
    try { 
      return getCurrentOrgId();
    } catch { return ''; } 
  });
  
  // Subscribe to showStore updates
  useEffect(() => showStore.subscribe(setAllShows), []);
  
  // Subscribe to Firebase real-time updates
  useEffect(() => {
    const handleShowsUpdated = (e: Event) => {
      const shows = (e as CustomEvent).detail as Show[];
      if (Array.isArray(shows)) {
        showStore.setAll(shows);
        setAllShows(shows);
      }
    };
    
    window.addEventListener('shows-updated', handleShowsUpdated);
    return () => window.removeEventListener('shows-updated', handleShowsUpdated);
  }, []);
  
  // React to tenant switch within the same tab
  useEffect(() => {
    const onTenant = (e: Event) => {
      try { 
        const id = (e as CustomEvent).detail?.id as string | undefined; 
        setOrgId(id || getCurrentOrgId());
      } catch { setOrgId(getCurrentOrgId()); }
    };
    window.addEventListener('tenant:changed' as any, onTenant);
    return () => window.removeEventListener('tenant:changed' as any, onTenant);
  }, []);
  
  // Derive tenant-scoped shows; default to artist data if missing tenantId for backward compat
  const shows = useMemo(() => allShows.filter(s => !s.tenantId || s.tenantId === orgId), [allShows, orgId]);
  const add = (s: Show) => showStore.addShow(s);
  const setAll = (list: Show[]) => showStore.setAll(list);
  const update = (id: string, patch: Partial<Show> & Record<string, unknown>) => showStore.updateShow(id, patch);
  const remove = (id: string) => showStore.removeShow(id);
  return { shows, add, setAll, update, remove };
}
