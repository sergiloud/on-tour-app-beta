import { DemoShow } from '../lib/demoShows';

type Listener = (shows: DemoShow[]) => void;

// Bump storage key to avoid loading previous seeded demo data and start fresh.
const LS_KEY = 'shows-store-v3';

class ShowStore {
  private shows: DemoShow[] = [];
  private listeners = new Set<Listener>();

  constructor() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) this.shows = JSON.parse(raw);
      else this.shows = [];
    } catch {
      this.shows = [];
    }
  }

  private emit() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(this.shows)); } catch {}
    for (const l of this.listeners) l(this.shows);
  }

  getAll() { return this.shows.slice(); }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    fn(this.getAll());
    return () => { this.listeners.delete(fn); };
  }

  setAll(next: DemoShow[]) {
    this.shows = next.slice().sort((a,b)=> new Date(a.date).getTime() - new Date(b.date).getTime());
    this.emit();
  }

  addShow(s: DemoShow) {
    this.setAll([...this.shows, s]);
  }

  getById(id: string) {
    return this.shows.find(s => s.id === id);
  }

  updateShow(id: string, patch: Partial<DemoShow> & Record<string, unknown>) {
    const idx = this.shows.findIndex(s => s.id === id);
    if (idx === -1) return;
    const current = this.shows[idx] as DemoShow & Record<string, unknown>;
    // Whitelist patchable fields to prevent stray props from entering the store
    const allowed: (keyof DemoShow | 'venue' | 'whtPct' | 'mgmtAgency' | 'bookingAgency' | 'notes' | 'costs' | 'feeCurrency' | 'archivedAt' | 'createdAt')[] = [
      'id','city','country','date','fee','lat','lng','status','name',
      'venue','whtPct','mgmtAgency','bookingAgency','notes','costs','feeCurrency','archivedAt','createdAt'
    ];
    const safePatch: Record<string, unknown> = {};
    for (const k of allowed) {
      if (k in patch) safePatch[k as string] = (patch as any)[k];
    }
    const next = { ...current, ...safePatch } as DemoShow;
    const copy = this.shows.slice();
    copy[idx] = next;
    this.setAll(copy);
  }

  removeShow(id: string) {
    const next = this.shows.filter(s => s.id !== id);
    this.setAll(next);
  }
}

export const showStore = new ShowStore();
