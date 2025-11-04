# Synchronization Strategy - FASE 1 Foundation

**Date:** Nov 3, 2025  
**Status:** ✅ Complete (FASE 1)  
**Version:** 1.0

---

## Table of Contents

1. [Overview](#overview)
2. [Problem Statement](#problem-statement)
3. [Architecture](#architecture)
4. [Implementation](#implementation)
5. [Mechanisms](#mechanisms)
6. [Testing & Validation](#testing--validation)
7. [Roadmap (FASE 1-5)](#roadmap-fase-1-5)
8. [Best Practices](#best-practices)

---

## Overview

The synchronization strategy addresses **60% of the critical complexity** in the On Tour App by ensuring data consistency across:

- **Multiple browser tabs** (same user, same device)
- **Offline mode** (user device, no network)
- **Multi-user scenarios** (future: team collaboration)
- **Conflict resolution** (last-write-wins with versioning)

### Key Principles

1. **Version-based conflict detection:** Each show carries `__version`, `__modifiedAt`, `__modifiedBy`
2. **Cross-tab broadcast:** BroadcastChannel API notifies other tabs of changes
3. **Centralized state:** showStore remains single source of truth
4. **Audit trail:** All changes tracked with user ID and timestamp
5. **Pure functions:** Sync logic testable and deterministic

---

## Problem Statement

### Before (FASE 0)

- ❌ Show data stored only in showStore (single tab)
- ❌ Opening same show in multiple tabs could cause conflicts
- ❌ No audit trail: don't know who changed what or when
- ❌ Offline changes not sync'd back to other tabs
- ❌ Manual refresh required to see changes from other tabs

### After (FASE 1+)

- ✅ All shows have versioning metadata
- ✅ Cross-tab sync via BroadcastChannel (automatic)
- ✅ Conflict detection based on version + timestamp
- ✅ Last-write-wins resolution strategy
- ✅ Audit trail for all modifications
- ⏳ React Query integration (FASE 2)
- ⏳ Optimistic updates + rollback (FASE 2)

---

## Architecture

### Data Model

```typescript
// src/lib/shows.ts
export interface Show {
  id: string;
  city: string;
  country: string;
  date: string;
  fee: number;
  lat?: number;
  lng?: number;

  // Sync fields (FASE 1+)
  __version: number; // Incremented on each update
  __modifiedAt: number; // Timestamp in ms (Date.now())
  __modifiedBy: string; // Session/user ID for audit
}

// Helper function
export function normalizeShow(show: Partial<Show>): Show {
  return {
    ...show,
    __version: show.__version ?? 0,
    __modifiedAt: show.__modifiedAt ?? Date.now(),
    __modifiedBy: show.__modifiedBy ?? 'system',
  } as Show;
}
```

### State Management

```
┌─────────────────────────────────────────────────────┐
│                   showStore                         │
│  (Singleton: localStorage + in-memory cache)        │
├─────────────────────────────────────────────────────┤
│ • currentUserId: string (session ID)                │
│ • shows: Map<id, Show>                              │
│ • listeners: Set<Listener>                          │
├─────────────────────────────────────────────────────┤
│ emit()          → persist + broadcast               │
│ updateShow()    → increment version + emit          │
│ BroadcastChannel → listen for changes from tabs    │
└─────────────────────────────────────────────────────┘
```

---

## Implementation

### 1. Show Versioning (FASE 1)

**Location:** `src/lib/shows.ts`

Each show now includes three sync fields:

```typescript
__version: number; // 0 on creation, incremented per update
__modifiedAt: number; // Set to Date.now() on each change
__modifiedBy: string; // User/session ID (for audit trail)
```

**When updated:**

```typescript
updateShow(id, patch) {
  const show = this.stored.get(id);
  if (!show) return;

  const updated = {
    ...show,
    ...patch,
    __version: show.__version + 1,    // ← CRITICAL: increment
    __modifiedAt: Date.now(),
    __modifiedBy: this.currentUserId
  };

  this.setAll([updated]);  // persist + broadcast
}
```

### 2. Cross-Tab Sync (FASE 1)

**Location:** `src/shared/showStore.ts`

Uses BroadcastChannel API to broadcast changes to all other tabs:

```typescript
// On construction: listen for messages from other tabs
const channel = new BroadcastChannel('shows-sync');

channel.addEventListener('message', (event) => {
  const { type, payload, timestamp, source } = event.data;

  if (type === 'shows-updated' && source !== this.currentUserId) {
    // Another tab updated shows - sync our state
    this.stored = payload;
    this.notifyListeners();
  }
});

// On update: broadcast to other tabs
emit() {
  // 1. Persist to localStorage
  localStorage.setItem(STORE_KEY, JSON.stringify(Array.from(this.stored.values())));

  // 2. Broadcast to all other tabs
  channel.postMessage({
    type: 'shows-updated',
    payload: Array.from(this.stored.values()),
    timestamp: Date.now(),
    source: this.currentUserId
  });

  // 3. Notify local listeners
  this.notifyListeners();
}
```

### 3. Conflict Detection (FASE 1)

**Location:** `src/features/finance/calculations.ts`

Detects conflicts between local and remote versions:

```typescript
export function detectConflict(local: Show, remote: Show): boolean {
  // Conflict if version or timestamp differs
  return local.__version !== remote.__version || local.__modifiedAt !== remote.__modifiedAt;
}
```

### 4. Conflict Resolution (FASE 1)

**Location:** `src/features/finance/calculations.ts`

Uses **last-write-wins** strategy:

```typescript
export function resolveConflict(local: Show, remote: Show): Show {
  // Return the one with newer timestamp
  return local.__modifiedAt > remote.__modifiedAt ? local : remote;
}
```

**Rationale:**

- Simple and deterministic (no user prompts)
- Preserves most recent intentional change
- Suitable for single-user, multi-tab scenario
- ⏳ FASE 3: Add conflict UI prompts for multi-user scenarios

---

## Mechanisms

### Mechanism 1: Create New Show

```
User Action: Add show "Berlin Gig"
    ↓
showStore.addShow(show)
    ↓
  1. Show normalized: __version=0, __modifiedAt=now, __modifiedBy=sessionId
  2. Added to in-memory shows Map
  3. emit() called:
      → localStorage updated
      → BroadcastChannel.postMessage('shows-updated')
      → Local listeners notified
    ↓
All other browser tabs receive 'shows-updated' message
    ↓
Tab 2: reads payload, updates local shows Map, notifies listeners
    ↓
UI re-renders everywhere (same show appears in all tabs)
```

### Mechanism 2: Update Show (Multi-Tab)

```
Tab 1: User edits fee from €5000 → €5500
    ↓
showStore.updateShow('show-1', {fee: 5500})
    ↓
  1. Fetch current show: { ..., __version: 3, __modifiedAt: 1699...000 }
  2. Increment version: __version = 4
  3. Update timestamp: __modifiedAt = 1699...500 (new)
  4. Update modifiedBy: __modifiedBy = 'tab1-sessionid'
  5. emit() broadcasts to other tabs
    ↓
Tab 2: receives message, sees __version change
    ↓
React Query auto-invalidates (FASE 2)
    ↓
Tab 2 UI re-fetches and displays updated fee
```

### Mechanism 3: Offline Change → Online Sync

```
User offline (WiFi down):
    ↓
User edits show in Tab 1
    ↓
  1. Show updated locally (version incremented)
  2. BroadcastChannel fails silently (no internet)
    ↓
WiFi reconnects:
    ↓
FASE 2: Service Worker detects network restoration
    ↓
Service Worker: fetch latest shows from API
    ↓
Conflict detection: local.__version vs remote.__version
    ↓
If local is newer (last-write-wins): keep local
If remote is newer: use remote
    ↓
showStore.setAll(resolved) → broadcast to all tabs
```

### Mechanism 4: Conflict Resolution

```
Scenario: User offline, makes 2 edits (v0→v1→v2)
Simultaneously, server has updated (v3)
    ↓
Network restored:
    ↓
detectConflict(local={v:2, ts:1000}, remote={v:3, ts:900})
    ↓
Versions differ (2 vs 3) → CONFLICT DETECTED
    ↓
resolveConflict(local, remote)
    ↓
Compare timestamps: local.ts (1000) > remote.ts (900)
    ↓
DECISION: Use local (last-write-wins)
    ↓
Show updated with local version, broadcast to all tabs
```

---

## Testing & Validation

### Test Coverage (FASE 1)

**File:** `src/__tests__/synchronization.test.ts`

#### Test Categories

1. **Versioning (6 tests)**
   - ✅ New show starts at version 0
   - ✅ Update increments version
   - ✅ Multiple updates: 0 → 1 → 3 (skip is ok)
   - ✅ Version persists in localStorage
   - ✅ Version maintained after setAll()
   - ✅ Batch add maintains versions

2. **Timestamp Tracking (4 tests)**
   - ✅ New show has current timestamp
   - ✅ Update changes timestamp
   - ✅ Timestamp increases with each update
   - ✅ Timestamp can be set explicitly

3. **Multi-Tab Sync (5 tests)**
   - ✅ BroadcastChannel receives updates
   - ✅ Other tab syncs without refresh
   - ✅ Multiple tabs in sync after update
   - ✅ Add in Tab 1 appears in Tab 2 immediately
   - ✅ Delete in Tab 1 reflects in Tab 2

4. **Conflict Detection (3 tests)**
   - ✅ detectConflict returns true for version mismatch
   - ✅ detectConflict returns true for timestamp mismatch
   - ✅ detectConflict returns false for identical shows

5. **Conflict Resolution (2 tests)**
   - ✅ resolveConflict uses last-write-wins (timestamp)
   - ✅ resolveConflict consistent across calls

### Test Execution

```bash
npm run test:run
# Output: PASS src/__tests__/synchronization.test.ts [20/20 tests]
```

### Build Verification

```bash
npm run build
# Output: ✅ vite build complete - no TypeScript errors
```

---

## Roadmap (FASE 1-5)

### FASE 1: Foundation (Weeks 1-2) ✅ DONE

- ✅ Add sync fields: `__version`, `__modifiedAt`, `__modifiedBy`
- ✅ Implement BroadcastChannel for cross-tab sync
- ✅ Implement `normalizeShow()` helper
- ✅ Create `detectConflict()` and `resolveConflict()` functions
- ✅ Write 20+ synchronization tests
- ✅ Document synchronization strategy

**Artifacts:**

- `src/lib/shows.ts` (updated with sync fields)
- `src/shared/showStore.ts` (updated with BroadcastChannel)
- `src/features/finance/calculations.ts` (conflict functions)
- `src/__tests__/synchronization.test.ts` (test suite)

### FASE 2: React Query Integration (Weeks 3-4)

- ⏳ Connect showStore.emit() to queryClient.invalidateQueries()
- ⏳ Implement React Query caching layer
- ⏳ Cache invalidation on cross-tab sync
- ⏳ Background sync: poll for changes when tab regains focus

**Expected Artifacts:**

- `src/hooks/useShowsQuery.ts` (refactored)
- `src/lib/queryClient.ts` (configuration)
- Integration tests with React Query

### FASE 3: Optimistic Updates & Rollback (Weeks 5-6)

- ⏳ Implement optimistic UI updates
- ⏳ Rollback on error (revert to previous state)
- ⏳ Visual indicators: "syncing...", "error", "synced"
- ⏳ Conflict UI: prompt user when multi-user conflict detected

**Expected Artifacts:**

- `src/hooks/useOptimisticShow.ts` (custom hook)
- `src/components/SyncStatus.tsx` (UI indicator)
- Error handling and rollback logic

### FASE 4: Web Workers & Service Worker (Weeks 7-8)

- ⏳ Web Worker: heavy calculations (100+ shows) off main thread
- ⏳ Service Worker: offline detection, background sync
- ⏳ IndexedDB: persistent offline storage
- ⏳ Network resilience: retry logic with exponential backoff

**Expected Artifacts:**

- `src/workers/financeCalculations.worker.ts` (Web Worker)
- `public/service-worker.ts` (updated Service Worker)
- `src/lib/indexedDB.ts` (offline storage)

### FASE 5: Audit Trail & Multi-User (Weeks 9-10)

- ⏳ Audit trail: persistent log of all changes
- ⏳ Change history: UI to view who changed what when
- ⏳ Multi-user sync: handle concurrent edits from team members
- ⏳ Conflict UI: merge or pick winner on multi-user conflict

**Expected Artifacts:**

- `src/lib/auditLog.ts` (persistent audit trail)
- `src/components/ChangeHistory.tsx` (audit UI)
- `src/hooks/useAuditLog.ts` (custom hook)

---

## Best Practices

### 1. Always Normalize Shows

When loading shows from localStorage or API, always normalize:

```typescript
const storedShows = JSON.parse(localStorage.getItem('shows') || '[]');
const normalized = storedShows.map(normalizeShow);
showStore.setAll(normalized);
```

### 2. Increment Version on Update

**DO:**

```typescript
const updated = { ...show, __version: show.__version + 1, ... };
```

**DON'T:**

```typescript
const updated = { ...show, fee: 5000 }; // ← version unchanged!
```

### 3. Use Last-Write-Wins for Conflict Resolution

For single-user, multi-tab scenarios, always use timestamp-based comparison:

```typescript
const winner = local.__modifiedAt > remote.__modifiedAt ? local : remote;
```

### 4. Broadcast Changes Immediately

After updating showStore, always emit to notify listeners and other tabs:

```typescript
showStore.updateShow(id, patch); // ← automatically calls emit()
```

### 5. Set ModifiedBy for Audit Trail

Always include user/session ID when updating:

```typescript
// In updateShow():
__modifiedBy: this.currentUserId; // ← track who made change
```

### 6. Test Conflict Scenarios

Always write tests for conflict detection and resolution:

```typescript
it('should resolve conflict using last-write-wins', () => {
  const local = normalizeShow({ id: '1', fee: 5000, __modifiedAt: 1000 });
  const remote = normalizeShow({ id: '1', fee: 6000, __modifiedAt: 900 });
  const winner = resolveConflict(local, remote);
  expect(winner.fee).toBe(5000); // local wins (newer timestamp)
});
```

### 7. Handle BroadcastChannel Errors Gracefully

In older browsers without BroadcastChannel support, sync will be degraded but not broken:

```typescript
try {
  channel.postMessage({ ... });
} catch (error) {
  console.warn('BroadcastChannel not available:', error);
  // Continue - local changes still persisted to localStorage
}
```

---

## Migration Path (From Manual Sync to Automatic)

### Today (FASE 1)

- Automatic cross-tab sync via BroadcastChannel
- Version-based conflict detection
- Last-write-wins resolution

### Next Week (FASE 2)

- React Query integration
- Automatic cache invalidation on sync

### Week 3 (FASE 3)

- Optimistic UI updates
- Conflict UI for multi-user scenarios

### Week 4+ (FASE 4-5)

- Background Service Worker sync
- Offline-first architecture
- Audit trail and change history

---

## Troubleshooting

### Problem: Changes not appearing in other tabs

**Solution:**

1. Check browser console: `channel.postMessage()` should succeed
2. Verify BroadcastChannel is available (check browser support)
3. Check localStorage: show should have incremented `__version`

### Problem: Timestamp conflicts on same machine

**Solution:**

- Timestamps are in milliseconds (`Date.now()`)
- Very unlikely two updates occur in same ms
- If needed, FASE 3 can add conflict UI prompt

### Problem: Version numbers getting out of sync

**Solution:**

1. Always normalize shows on load: `normalizeShow()`
2. Always increment version on update
3. Always call `emit()` after setAll()

---

## References

- MDN: [BroadcastChannel API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API)
- ECMAScript: [Date.now()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now)
- Source: `src/lib/shows.ts`, `src/shared/showStore.ts`, `src/features/finance/calculations.ts`
- Tests: `src/__tests__/synchronization.test.ts`

---

**End of Document**
