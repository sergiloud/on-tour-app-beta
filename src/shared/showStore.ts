import { DemoShow, Show, normalizeShow } from '../lib/shows';
import { multiTabSync } from '../lib/multiTabSync';
import { offlineManager } from '../lib/offlineManager';
import { HybridShowService } from '../services/hybridShowService';

type Listener = (shows: Show[]) => void;

// Primary storage key for shows
const LS_KEY = 'shows-store-v3';
// Legacy key used by older tests/utilities
const LEGACY_KEY = 'demo:shows';

// Cross-tab synchronization via BroadcastChannel
const BROADCAST_CHANNEL_NAME = 'shows-sync';

/**
 * FASE 5.4: ShowStore Integration with Multi-Tab Sync & Offline Manager
 *
 * This enhanced ShowStore now:
 * 1. Integrates with multiTabSync for cross-tab event broadcasting
 * 2. Integrates with offlineManager for offline operation queuing
 * 3. Maintains version tracking for conflict detection (__version, __modifiedAt, __modifiedBy)
 * 4. Handles optimistic updates with sync status feedback
 */
class ShowStore {
  private shows: Show[] = [];
  private listeners = new Set<Listener>();
  private broadcastChannel: BroadcastChannel | null = null;
  private currentUserId: string = 'user-' + Math.random().toString(36).substr(2, 9);
  private syncUnsubscribe: (() => void) | null = null;

  constructor() {
    try {
      // Prefer primary key; fall back to legacy if present
      const raw = localStorage.getItem(LS_KEY);
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (raw) {
        this.shows = JSON.parse(raw).map((s: any) => normalizeShow(s));
      } else if (legacy) {
        this.shows = JSON.parse(legacy).map((s: any) => normalizeShow(s));
        // Migrate to new key for consistency
        try { localStorage.setItem(LS_KEY, legacy); } catch {}
      } else {
        this.shows = [];
      }
    } catch {
      this.shows = [];
    }

    // Setup cross-tab sync with BroadcastChannel
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        this.broadcastChannel.onmessage = (event) => {
          if (event.data.type === 'shows-updated' && event.data.source !== this.currentUserId) {
            // Another tab updated shows, sync locally
            this.shows = event.data.payload.map((s: any) => normalizeShow(s));
            this.notifyListeners();
          }
        };
      } catch (e) {
        // BroadcastChannel not available (older browsers)
        console.warn('BroadcastChannel not available, cross-tab sync disabled', e);
      }
    }

    // Subscribe to multiTabSync events for show updates from other tabs
    try {
      this.syncUnsubscribe = multiTabSync.subscribe('shows-updated', (event: any) => {
        if (event.source !== this.currentUserId) {
          this.shows = event.payload.map((s: any) => normalizeShow(s));
          this.notifyListeners();
        }
      });
    } catch (e) {
      console.warn('multiTabSync integration failed', e);
    }
  }

  private notifyListeners() {
    for (const l of this.listeners) l(this.shows.slice());
  }

  private emit() {
    const payload = JSON.stringify(this.shows);
    try { localStorage.setItem(LS_KEY, payload); } catch {}
    // Keep legacy key in sync for tests or tools that still read it
    try { localStorage.setItem(LEGACY_KEY, payload); } catch {}

    // Broadcast to other tabs via native BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'shows-updated',
          payload: this.shows,
          timestamp: Date.now(),
          source: this.currentUserId
        });
      } catch (e) {
        console.warn('Failed to broadcast shows update', e);
      }
    }

    // Also broadcast via multiTabSync for centralized event tracking
    try {
      multiTabSync.broadcast({
        type: 'shows-updated',
        payload: this.shows
      });
    } catch (e) {
      console.warn('Failed to broadcast via multiTabSync', e);
    }

    this.notifyListeners();
  }

  getAll() { return this.shows.slice(); }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    fn(this.getAll());
    return () => { this.listeners.delete(fn); };
  }

  setAll(next: Show[]) {
    this.shows = next
      .slice()
      .map(s => normalizeShow(s))
      .sort((a,b)=> new Date(a.date).getTime() - new Date(b.date).getTime());
    this.emit();
  }

  addShow(s: Show) {
    const normalized = normalizeShow(s);
    this.setAll([...this.shows, normalized]);
    
    // Sync to Firebase
    if (HybridShowService) {
      HybridShowService.saveShow(normalized).catch((err: Error) => {
        console.warn('Failed to sync show to Firebase:', err);
      });
    }
  }

  getById(id: string) {
    return this.shows.find(s => s.id === id);
  }

  updateShow(id: string, patch: Partial<Show> & Record<string, unknown>) {
    const idx = this.shows.findIndex(s => s.id === id);
    if (idx === -1) return;
    const current = this.shows[idx] as Show & Record<string, unknown>;
    // Whitelist patchable fields to prevent stray props from entering the store
    const allowed: (keyof Show | 'venue' | 'venueId' | 'promoter' | 'promoterId' | 'whtPct' | 'mgmtAgency' | 'bookingAgency' | 'notes' | 'costs' | 'feeCurrency' | 'archivedAt' | 'createdAt')[] = [
      'id','city','country','date','endDate','fee','lat','lng','status','name',
      'venue','venueId','promoter','promoterId','whtPct','mgmtAgency','bookingAgency','notes','costs','feeCurrency','archivedAt','createdAt'
    ];
    const safePatch: Record<string, unknown> = {};
    for (const k of allowed) {
      if (k in patch) safePatch[k as string] = (patch as any)[k];
    }

    // Increment version and update modification timestamp
    const next = {
      ...current,
      ...safePatch,
      __version: current.__version + 1,
      __modifiedAt: Date.now(),
      __modifiedBy: this.currentUserId
    } as Show;

    const copy = this.shows.slice();
    copy[idx] = next;
    this.setAll(copy);

    // Queue for backend sync
    this.queueOfflineOperation('update', id, safePatch);
    
    // Sync to Firebase
    if (HybridShowService) {
      HybridShowService.saveShow(next).catch((err: Error) => {
        console.warn('Failed to sync show update to Firebase:', err);
      });
    }
  }

  async removeShow(id: string) {
    // Optimistically remove from UI first
    const next = this.shows.filter(s => s.id !== id);
    this.setAll(next);
    
    // Sync deletion to Firebase
    if (HybridShowService) {
      try {
        await HybridShowService.deleteShow(id);
      } catch (err) {
        console.warn('Failed to sync show deletion to Firebase:', err);
        // Optionally: rollback the optimistic update here if needed
      }
    }
  }

  /**
   * Queue an offline operation (FASE 5.4: OfflineManager Integration)
   * Used by useShowsMutations to queue operations when offline
   */
  queueOfflineOperation(type: 'create' | 'update' | 'delete', showId: string, data?: Partial<Show>) {
    try {
      const operation = offlineManager.queueOperation(
        type,
        'show',
        showId,
        data || {}
      );
      return operation;
    } catch (e) {
      console.warn('Failed to queue offline operation', e);
      return null;
    }
  }

  /**
   * Get offline sync status
   */
  getOfflineStatus() {
    try {
      return offlineManager.getState();
    } catch (e) {
      console.warn('Failed to get offline status', e);
      return null;
    }
  }

  /**
   * Cleanup resources (call when app unmounts)
   */
  destroy() {
    if (this.syncUnsubscribe) {
      this.syncUnsubscribe();
      this.syncUnsubscribe = null;
    }
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }
    this.listeners.clear();
  }
}

export const showStore = new ShowStore();
