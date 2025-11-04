# FASE 5 Quick Start - Multi-Tab Sync & Offline Support

> **Status**: ✅ Core infrastructure COMPLETE - 56/56 tests passing, build GREEN

## Overview

FASE 5 implements production-ready multi-tab synchronization and offline-first support using:

- **BroadcastChannel API** for cross-tab communication
- **localStorage** for persistent operation queues
- **Online/Offline detection** with automatic retry logic
- **React hooks** for seamless component integration

## Quick Reference

### 1. Access Sync Status in Components

```typescript
import { useSync } from '@/hooks/useSync';

function ShowsComponent() {
  const {
    syncStatus,        // 'idle' | 'syncing' | 'synced' | 'conflict' | 'offline' | 'error'
    isOnline,          // boolean
    queuedOperations,  // OfflineOperation[]
    failedOperations,  // OfflineOperation[]
    timeSinceLastSync, // number (ms)
    forceSync,         // () => void
    retryFailedOperation, // (id: string) => void
    clearOfflineQueue,  // () => void
  } = useSync();

  return (
    <div>
      <p>Status: {syncStatus}</p>
      <p>Online: {isOnline ? '✅' : '❌'}</p>
      <p>Queued operations: {queuedOperations.length}</p>
      {syncStatus === 'synced' && <p>Last sync: {timeSinceLastSync}ms ago</p>}
    </div>
  );
}
```

### 2. Queue Operations While Offline

```typescript
import { useOfflineOperation } from '@/hooks/useSync';

function UpdateShowForm() {
  const { queueOperation, syncOperations } = useOfflineOperation('show');

  const handleUpdate = async (showId: string, data: any) => {
    // This automatically queues if offline
    const operation = queueOperation('update', showId, data);

    // Optionally trigger sync when reconnected
    if (navigator.onLine) {
      await syncOperations();
    }
  };

  return (
    <button onClick={() => handleUpdate('show-1', { name: 'New Name' })}>
      Update Show
    </button>
  );
}
```

### 3. Listen to Specific Sync Events

```typescript
import { useSyncEvent } from '@/hooks/useSync';

function ConflictNotifier() {
  useSyncEvent('conflict-detected', (payload) => {
    console.log('Conflict detected:', payload);
    // Show conflict resolution UI
  });

  useSyncEvent('sync-complete', (payload) => {
    console.log('Sync completed:', payload);
    // Show success message
  });

  return <div>Listening to sync events...</div>;
}
```

### 4. Access Managers Directly (Advanced)

```typescript
import { multiTabSync } from '@/lib/multiTabSync';
import { offlineManager } from '@/lib/offlineManager';

// Multi-tab synchronization
const stats = multiTabSync.getStats();
console.log(`Events in queue: ${stats.queueSize}`);
console.log(`Conflicts detected: ${stats.conflictCount}`);

// Offline management
const state = offlineManager.getState();
console.log(`Queued ops: ${state.queuedOperations.length}`);
console.log(`Failed ops: ${state.failedOperations.length}`);

// Force sync
multiTabSync.forceSync();
await offlineManager.syncQueuedOperations();
```

## Architecture

### Multi-Tab Synchronization (`multiTabSync`)

**Broadcasting events to all tabs**:

```typescript
import { multiTabSync } from '@/lib/multiTabSync';

// Broadcast to all other tabs
multiTabSync.broadcast({
  type: 'shows-updated',
  payload: { id: 'show-1', name: 'Updated Show' },
});

// Subscribe to events
const unsubscribe = multiTabSync.subscribe('shows-updated', event => {
  console.log('Show updated in another tab:', event.payload);
});
```

**Conflict resolution**:

```typescript
const local = { __version: 1, __modifiedAt: 100, name: 'Show 1' };
const remote = { __version: 2, __modifiedAt: 200, name: 'Show 2' };

// Detect conflict
if (multiTabSync.detectConflict(local, remote)) {
  // Resolve with strategy: 'local', 'remote', or 'merge'
  const resolved = multiTabSync.resolveConflict(
    'show-id',
    local,
    remote,
    'merge' // Smart merge strategy
  );
}
```

### Offline Management (`offlineManager`)

**Queue operations while offline**:

```typescript
import { offlineManager } from '@/lib/offlineManager';

// Queue operation (automatically queued if offline)
const operation = offlineManager.queueOperation(
  'update', // operation type
  'show', // resource type
  'show-123', // resource ID
  { name: 'New Name' } // data
);

// Later, when online...
await offlineManager.syncQueuedOperations();
```

**Subscribe to state changes**:

```typescript
const unsubscribe = offlineManager.subscribe(state => {
  console.log('Is online:', state.isOnline);
  console.log('Queued ops:', state.queuedOperations.length);
  console.log('Failed ops:', state.failedOperations.length);
});
```

## Integration Checklist

### ✅ What's Done

- [x] multiTabSync.ts core module (354 lines)
- [x] offlineManager.ts core module (320 lines)
- [x] useSync React hooks (164 lines)
- [x] 56 comprehensive tests (all passing ✅)
- [x] Build verification (GREEN ✅)

### 📋 What's Next

- [ ] Integrate multiTabSync with showStore.ts
- [ ] Integrate offlineManager with useShowsMutations.ts
- [ ] Create UI components for sync status display
- [ ] Create UI components for offline indicators
- [ ] Create integration tests for multi-tab scenarios
- [ ] Documentation and usage examples

## Testing

### Run All Tests

```bash
npm run test:run -- src/__tests__/multiTabSync.test.ts src/__tests__/offlineManager.test.ts
```

### Expected Output

```
Test Files  2 passed (2)
Tests      56 passed (56)
```

### Build Check

```bash
npm run build
```

Should output: ✅ Build succeeded

## Key Files

| File                                   | Purpose         | Lines | Status   |
| -------------------------------------- | --------------- | ----- | -------- |
| `src/lib/multiTabSync.ts`              | Cross-tab sync  | 354   | ✅       |
| `src/lib/offlineManager.ts`            | Offline mgmt    | 320   | ✅       |
| `src/hooks/useSync.ts`                 | React hooks     | 164   | ✅       |
| `src/__tests__/multiTabSync.test.ts`   | Multi-tab tests | 400+  | 27/27 ✅ |
| `src/__tests__/offlineManager.test.ts` | Offline tests   | 350+  | 29/29 ✅ |

## Performance Tips

### 1. Optimize Queue Size

```typescript
// multiTabSync maintains max 1000 events
// offlineManager has configurable max retries (default 3)
// Both persist to localStorage (max 500 log entries)
```

### 2. Batch Operations

```typescript
// ✅ GOOD - Queue multiple ops before syncing
offlineManager.queueOperation('update', 'show', 'id1', {...});
offlineManager.queueOperation('update', 'show', 'id2', {...});
await offlineManager.syncQueuedOperations();

// ❌ AVOID - Syncing after each operation
offlineManager.queueOperation(...);
await offlineManager.syncQueuedOperations();
offlineManager.queueOperation(...);
await offlineManager.syncQueuedOperations();
```

### 3. Monitor Queue Size

```typescript
const stats = offlineManager.getStats();
if (stats.queuedCount > 100) {
  console.warn('Large queue size - consider force syncing');
  await offlineManager.syncQueuedOperations();
}
```

## Troubleshooting

### Operations not syncing?

```typescript
// Check online status
console.log('Is online:', navigator.onLine);

// Check queue manually
const state = offlineManager.getState();
console.log('Queued:', state.queuedOperations);
console.log('Failed:', state.failedOperations);

// Force sync
await offlineManager.syncQueuedOperations();
```

### Conflicts not resolving?

```typescript
// Check conflict detection
const hasConflict = multiTabSync.detectConflict(local, remote);
console.log('Has conflict:', hasConflict);

// Check conflict log
const conflicts = multiTabSync.getConflictLog();
console.log('Conflict history:', conflicts);

// Force resolve
const resolved = multiTabSync.resolveConflict(
  'id',
  local,
  remote,
  'merge' // Try merge strategy
);
```

### localStorage quota exceeded?

```typescript
// Clear old sync logs
const logs = multiTabSync.getSyncLogs();
console.log(`Logs: ${logs.length}`); // Limited to 500

// Clear offline queue if needed
offlineManager.clearQueue();

// Check localStorage usage
const usage = new Blob(Object.values(localStorage).map(v => v.toString())).size;
console.log(`localStorage usage: ${(usage / 1024).toFixed(2)}KB`);
```

## Documentation

- 📖 Full API Reference: `FASE_5_PROGRESS.md`
- 🧪 Test Examples: `src/__tests__/multiTabSync.test.ts` and `offlineManager.test.ts`
- 💡 Integration Examples: This file
- 🏗️ Architecture: `docs/FASE_5_PROGRESS.md`

---

**Status**: ✅ Ready for Integration
**Build**: ✅ GREEN
**Tests**: ✅ 56/56 PASSING
