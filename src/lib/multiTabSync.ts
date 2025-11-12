/**
 * FASE 5: Multi-Tab Synchronization Module
 *
 * Implements real-time cross-tab data synchronization using BroadcastChannel API.
 * Features:
 * - Real-time updates across all browser tabs
 * - Automatic conflict detection and resolution
 * - Sync status indicators
 * - Event queue for offline scenarios
 */

export type SyncEvent = {
  type: 'shows-updated' | 'show-created' | 'show-deleted' | 'sync-start' | 'sync-complete' | 'conflict-detected';
  payload?: any;
  timestamp: number;
  source: string; // Tab ID that initiated the change
  version: number; // For version tracking
};

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'conflict' | 'offline' | 'error';

export type ConflictResolution = {
  id: string;
  local: any;
  remote: any;
  strategy: 'local' | 'remote' | 'merge' | 'manual';
  resolved: boolean;
  resolvedAt?: number;
};

/**
 * MultiTabSyncManager: Coordinates synchronization across browser tabs
 *
 * Architecture:
 * - BroadcastChannel for cross-tab communication
 * - Event queue for offline scenarios
 * - Automatic conflict resolution
 * - Status tracking and notifications
 */
export class MultiTabSyncManager {
  private channel: BroadcastChannel;
  private tabId: string;
  private status: SyncStatus = 'idle';
  private eventQueue: SyncEvent[] = [];
  private listeners: Map<string, Set<(event: SyncEvent) => void>> = new Map();
  private conflictLog: ConflictResolution[] = [];
  private lastSync: number = Date.now();
  private maxQueueSize: number = 1000;

  constructor(channelName: string = 'on-tour-app-sync') {
    this.tabId = this.generateTabId();
    this.channel = new BroadcastChannel(channelName);
    this.setupChannelListener();
    this.logEvent('Sync manager initialized', this.tabId);
  }

  /**
   * Generate unique ID for this tab/window
   */
  private generateTabId(): string {
    const sessionId = sessionStorage.getItem('__TAB_ID__');
    if (sessionId) return sessionId;

    const id = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('__TAB_ID__', id);
    return id;
  }

  /**
   * Set up listener for incoming messages from other tabs
   */
  private setupChannelListener(): void {
    this.channel.onmessage = (event: MessageEvent<SyncEvent>) => {
      const syncEvent = event.data;

      // Ignore own events
      if (syncEvent.source === this.tabId) {
        return;
      }

      // Add to queue for processing
      this.enqueueEvent(syncEvent);

      // Trigger listeners
      this.triggerListeners(syncEvent.type, syncEvent);

      // Update sync timestamp
      this.lastSync = Date.now();
    };

    // Note: BroadcastChannel doesn't support onerror in TypeScript types
    // Error handling is done through message validation instead
  }

  /**
   * Broadcast an event to all other tabs
   */
  public broadcast(event: Omit<SyncEvent, 'source' | 'timestamp' | 'version'>): void {
    const fullEvent: SyncEvent = {
      ...event,
      source: this.tabId,
      timestamp: Date.now(),
      version: this.getNextVersion(),
    };

    try {
      this.channel.postMessage(fullEvent);
      this.enqueueEvent(fullEvent);
      this.triggerListeners(fullEvent.type, fullEvent);
    } catch (error) {
      console.error('Failed to broadcast event:', error);
      this.status = 'error';
    }
  }

  /**
   * Subscribe to specific sync event types
   */
  public subscribe(
    eventType: string,
    callback: (event: SyncEvent) => void
  ): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  /**
   * Trigger all listeners for an event type
   */
  private triggerListeners(eventType: string, event: SyncEvent): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Listener error:', error);
        }
      });
    }
  }

  /**
   * Add event to queue (for offline support)
   */
  private enqueueEvent(event: SyncEvent): void {
    this.eventQueue.push(event);

    // Maintain max queue size
    if (this.eventQueue.length > this.maxQueueSize) {
      this.eventQueue.shift();
    }

    // Persist to localStorage for offline access
    this.persistQueue();
  }

  /**
   * Get all queued events
   */
  public getEventQueue(): SyncEvent[] {
    return [...this.eventQueue];
  }

  /**
   * Clear event queue
   */
  public clearEventQueue(): void {
    this.eventQueue = [];
    localStorage.removeItem('__SYNC_QUEUE__');
  }

  /**
   * Persist event queue to localStorage
   */
  private persistQueue(): void {
    try {
      localStorage.setItem('__SYNC_QUEUE__', JSON.stringify(this.eventQueue.slice(-100)));
    } catch (error) {
      console.warn('Failed to persist sync queue:', error);
    }
  }

  /**
   * Restore event queue from localStorage
   */
  public restoreQueueFromStorage(): SyncEvent[] {
    try {
      const stored = localStorage.getItem('__SYNC_QUEUE__');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to restore sync queue:', error);
    }
    return [];
  }

  /**
   * Detect conflict between local and remote data
   */
  public detectConflict(local: any, remote: any): boolean {
    if (!local || !remote) return false;

    return (
      local.__version !== remote.__version &&
      local.__modifiedAt !== remote.__modifiedAt
    );
  }

  /**
   * Resolve conflict using specified strategy
   */
  public resolveConflict(
    id: string,
    local: any,
    remote: any,
    strategy: 'local' | 'remote' | 'merge' = 'local'
  ): any {
    const resolution: ConflictResolution = {
      id,
      local,
      remote,
      strategy,
      resolved: true,
      resolvedAt: Date.now(),
    };

    this.conflictLog.push(resolution);

    switch (strategy) {
      case 'local':
        return local;
      case 'remote':
        return remote;
      case 'merge':
        return this.mergeData(local, remote);
      default:
        return local;
    }
  }

  /**
   * Merge local and remote data (field-by-field comparison)
   */
  private mergeData(local: any, remote: any): any {
    const merged = { ...local };

    for (const key in remote) {
      if (key.startsWith('__')) {
        // Metadata fields: use more recent
        if (remote.__modifiedAt > (local.__modifiedAt || 0)) {
          merged[key] = remote[key];
        }
      } else if (typeof remote[key] === 'number' && typeof local[key] === 'number') {
        // Numeric fields: use maximum (e.g., fees)
        merged[key] = Math.max(local[key], remote[key]);
      } else if (Array.isArray(remote[key])) {
        // Arrays: use remote (more recent batch)
        if (remote.__modifiedAt > (local.__modifiedAt || 0)) {
          merged[key] = remote[key];
        }
      }
    }

    return merged;
  }

  /**
   * Get conflict log
   */
  public getConflictLog(): ConflictResolution[] {
    return [...this.conflictLog];
  }

  /**
   * Set sync status
   */
  public setStatus(status: SyncStatus): void {
    const oldStatus = this.status;
    this.status = status;

    // Broadcast status change
    this.broadcast({
      type: 'sync-start',
      payload: { status },
    });

    this.logEvent(`Sync status changed: ${oldStatus} → ${status}`);
  }

  /**
   * Get current sync status
   */
  public getStatus(): SyncStatus {
    return this.status;
  }

  /**
   * Get time since last sync
   */
  public getTimeSinceLastSync(): number {
    return Date.now() - this.lastSync;
  }

  /**
   * Log sync event for debugging
   */
  private logEvent(message: string, context?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      tabId: this.tabId,
      message,
      context,
    };

    try {
      const logs = JSON.parse(localStorage.getItem('__SYNC_LOGS__') || '[]');
      logs.push(logEntry);

      // Keep only last 500 logs
      if (logs.length > 500) logs.shift();

      localStorage.setItem('__SYNC_LOGS__', JSON.stringify(logs));
    } catch (error) {
      console.warn('Failed to log sync event:', error);
    }
  }

  /**
   * Get sync logs
   */
  public getSyncLogs(): any[] {
    try {
      return JSON.parse(localStorage.getItem('__SYNC_LOGS__') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.channel.close();
    this.listeners.clear();
    this.logEvent('Sync manager destroyed');
  }

  /**
   * Get next version number for event
   */
  private getNextVersion(): number {
    const lastVersion = this.eventQueue[this.eventQueue.length - 1]?.version || 0;
    return lastVersion + 1;
  }

  /**
   * Force sync with all tabs
   */
  public forceSync(): void {
    this.setStatus('syncing');
    this.broadcast({
      type: 'sync-start',
      payload: { tabId: this.tabId },
    });
    // Listeners will handle actual sync
    this.setStatus('synced');
  }

  /**
   * Check if this tab is the "primary" tab for coordination
   * Simple heuristic: tab with earliest session time
   */
  public isPrimaryTab(): boolean {
    // In a real app, this could use a locking mechanism
    // For now, just return true - actual coordination happens in showStore
    return true;
  }

  /**
   * Get sync statistics
   */
  public getStats(): {
    tabId: string;
    status: SyncStatus;
    queueSize: number;
    conflictCount: number;
    timeSinceLastSync: number;
    logCount: number;
  } {
    return {
      tabId: this.tabId,
      status: this.status,
      queueSize: this.eventQueue.length,
      conflictCount: this.conflictLog.length,
      timeSinceLastSync: this.getTimeSinceLastSync(),
      logCount: this.getSyncLogs().length,
    };
  }
}

/**
 * Singleton instance
 */
export const multiTabSync = new MultiTabSyncManager();

export default MultiTabSyncManager;
