// Travel module: manage travel items (simple localStorage list)
import type { TravelSegment } from '../../../data/demo';
import { events } from '../../../features/dashboard/core/events';

const KEY = 'ota:travel:v1';
interface TravelState { items: TravelSegment[]; }

function loadState(): TravelState { try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch {}; return { items: [] }; }
function saveState(s: TravelState){ try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }

export function listTravel(): TravelSegment[] { return loadState().items.slice().sort((a,b)=> a.date.localeCompare(b.date)); }

export function addTravel(seg: Omit<TravelSegment,'id'>){
  const st = loadState();
  st.items.push({ ...seg, id: 'trav-' + Math.random().toString(36).slice(2,9) });
  saveState(st);
}

export function bindTravelModal(){
  if ((window as any)._travelBound) return; (window as any)._travelBound = true;
  document.getElementById('saveTravelBtn')?.addEventListener('click', () => {
    const showId = (document.getElementById('travelShowId') as HTMLInputElement | null)?.value || '';
    const kind = (document.getElementById('travelKind') as HTMLInputElement | null)?.value as any || 'flight';
    const title = (document.getElementById('travelTitle') as HTMLInputElement | null)?.value || 'Travel';
    const meta = (document.getElementById('travelMeta') as HTMLInputElement | null)?.value || '';
    const date = (document.getElementById('travelDate') as HTMLInputElement | null)?.value;
    if (!date){ return; }
    addTravel({ date: new Date(date).toISOString(), kind, title, meta });
    // Basic refresh hook placeholder
    (window as any).renderDashboard?.();
  events.emit('data:changed', { source: 'travel:add', kind });
  (window as any).refreshKpis?.();
  });
}
