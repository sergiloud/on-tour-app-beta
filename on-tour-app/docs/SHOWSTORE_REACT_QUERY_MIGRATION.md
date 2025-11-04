# ShowStore → React Query Migration Guide

**Status**: Phase 1 Complete ✅  
**Date**: November 3, 2025  
**Priority**: High (Architectural Simplification)

---

## Executive Summary

The `showStore` has been successfully wrapped with React Query hooks, providing a migration path from manual client-side state management to centralized, standardized state management. This enables better caching, offline support, and eliminates duplicate state management logic.

### What's New

**New File**: `src/hooks/useShowsQuery.ts` (200+ LOC)

- 6 React Query hooks with proper cache management
- Drop-in replacements for showStore methods
- Automatic cache invalidation
- Proper TypeScript types

**New Tests**: `src/__tests__/useShowsQuery.integration.test.ts` (380+ LOC)

- 16 test cases covering all hooks
- Full coverage of mutations and queries
- Cache invalidation validation
- ✅ All passing

---

## Migration Path

### Current State (During Transition)

```
showStore (manual client cache in localStorage)
    ↓
useShowsQuery hooks (React Query wrapper)
    ↓
Components (transparent replacement)
```

**Key**: During transition, `useShowsQuery` still uses `showStore` internally, ensuring backward compatibility.

### Future State (Post-Migration)

```
API Endpoint: /api/shows
    ↓
React Query useShowsQuery (automatic caching)
    ↓
Components (same interface, better architecture)
```

---

## Available Hooks

### 1. `useShowsQuery()` - Replaces `showStore.getAll()`

**Before**:

```tsx
import { showStore } from '../shared/showStore';

const shows = showStore.getAll();
```

**After**:

```tsx
import { useShowsQuery } from '../hooks/useShowsQuery';

const { data: shows = [], isLoading, error } = useShowsQuery();

if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;
```

**Benefits**:

- Automatic loading state
- Error handling
- Cache management
- Offline support (data persists)
- Refetch capability

---

### 2. `useShowQuery(id)` - Replaces `showStore.getById(id)`

**Before**:

```tsx
const show = showStore.getById('show-123');
```

**After**:

```tsx
const { data: show, isLoading } = useShowQuery('show-123');
```

**Benefits**:

- Query enabled only when ID is provided
- Proper cache keying for single shows
- Loading state

---

### 3. `useAddShowMutation()` - Replaces `showStore.addShow()`

**Before**:

```tsx
const handleAddShow = newShow => {
  showStore.addShow(newShow);
  // Manual UI update
};
```

**After**:

```tsx
const addMutation = useAddShowMutation();

const handleAddShow = newShow => {
  addMutation.mutate(newShow); // Cache auto-invalidates
};

// Usage in JSX
<button onClick={() => addMutation.mutate(newShow)} disabled={addMutation.isPending}>
  {addMutation.isPending ? 'Adding...' : 'Add Show'}
</button>;
```

**Benefits**:

- Automatic cache invalidation
- Loading state during mutation
- Error handling
- Success/error callbacks available

---

### 4. `useUpdateShowMutation()` - Replaces `showStore.updateShow()`

**Before**:

```tsx
showStore.updateShow(id, { fee: 5000, status: 'confirmed' });
```

**After**:

```tsx
const updateMutation = useUpdateShowMutation();

updateMutation.mutate({
  id,
  patch: { fee: 5000, status: 'confirmed' },
});
```

**Benefits**:

- Type-safe field whitelisting
- Automatic cache sync
- Mutation loading state
- Error handling

---

### 5. `useRemoveShowMutation()` - Replaces `showStore.removeShow()`

**Before**:

```tsx
showStore.removeShow('show-123');
```

**After**:

```tsx
const removeMutation = useRemoveShowMutation();

removeMutation.mutate('show-123');
```

**Benefits**:

- Automatic cache invalidation
- Loading state
- Error handling
- Optimistic updates possible

---

### 6. `useSetAllShowsMutation()` - Replaces `showStore.setAll()`

**Before**:

```tsx
showStore.setAll(newShowsArray);
```

**After**:

```tsx
const setAllMutation = useSetAllShowsMutation();

setAllMutation.mutate(newShowsArray); // Auto-sorts by date
```

**Benefits**:

- Bulk operations with validation
- Automatic sorting
- Cache invalidation

---

## Migration Phases

### Phase 1: Infrastructure (✅ COMPLETE)

- [x] Create `useShowsQuery` hooks (200+ LOC)
- [x] Create integration tests (16 tests, all passing)
- [x] Verify build integrity (Exit Code: 0)
- [x] Document all hooks

**Effort**: 2 hours  
**Status**: Ready for Phase 2

---

### Phase 2: Replace High-Impact Usage (Next)

**Target Files** (In order of impact):

1. `src/lib/demoDataset.ts` (7 usages)
   - Replace `showStore.setAll()` with `useSetAllShowsMutation()`
   - Effort: 1 hour
   - Impact: Demo data initialization

2. `src/services/financeApi.ts` (1 usage)
   - Replace `showStore.getAll()` with `useShowsQuery()`
   - Effort: 30 min
   - Impact: Financial calculations

3. `src/pages/profile/ProfilePage.tsx` (2 usages)
   - Replace `showStore.getAll()` with `useShowsQuery()`
   - Effort: 1 hour
   - Impact: Profile page shows count

**Subtotal**: 2.5 hours

---

### Phase 3: Replace Test Usage (Next)

**Target Files**:

1. `src/__tests__/showStore.test.ts` (5 usages)
   - Replace with mock React Query setup
   - Effort: 1 hour

2. `src/__tests__/demoDataset.integrity.test.ts` (1 usage)
   - Replace with mocked hook
   - Effort: 30 min

3. `src/__tests__/cta.navigation.test.ts` (1 usage)
   - Replace with mocked hook
   - Effort: 30 min

**Subtotal**: 2 hours

---

### Phase 4: Clean Up (Final)

- Delete `src/shared/showStore.ts` (87 LOC)
- Remove showStore import statements
- Verify all tests pass
- Verify build clean

**Effort**: 1 hour

---

## Migration Timeline

```
┌─────────────────────────────────────────────────────┐
│ TODAY (Nov 3): Phase 1 - Infrastructure ✅ COMPLETE │
│ Effort: 2 hours                                     │
│ - Create hooks & tests                              │
│ - All 16 tests passing                              │
│ - Build clean                                       │
└─────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────┐
│ TOMORROW (Nov 4): Phase 2 - High Impact Usage       │
│ Effort: 2.5 hours                                   │
│ - Replace demoDataset.ts (7 usages)                 │
│ - Replace financeApi.ts (1 usage)                   │
│ - Replace ProfilePage.tsx (2 usages)                │
└─────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────┐
│ DAY 3 (Nov 5): Phase 3 - Test Usage                 │
│ Effort: 2 hours                                     │
│ - Replace test mocks                                │
│ - Update test utilities                             │
│ - All tests still passing                           │
└─────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────┐
│ DAY 4 (Nov 6): Phase 4 - Clean Up                   │
│ Effort: 1 hour                                      │
│ - Delete showStore.ts                               │
│ - Remove unused imports                             │
│ - Final verification                                │
└─────────────────────────────────────────────────────┘

Total Effort: 7.5 hours
```

---

## Implementation Checklist

### Phase 2: High-Impact Usage

- [ ] `src/lib/demoDataset.ts`
  - [ ] Replace `showStore.getAll()` → `useShowsQuery()`
  - [ ] Replace `showStore.setAll()` → `useSetAllShowsMutation()`
  - [ ] Handle component hooks vs service file complexity
  - [ ] Tests passing

- [ ] `src/services/financeApi.ts`
  - [ ] Replace `showStore.getAll()` with hook in consumers
  - [ ] Update type annotations
  - [ ] Tests passing

- [ ] `src/pages/profile/ProfilePage.tsx`
  - [ ] Replace `showStore.getAll()` → `useShowsQuery()`
  - [ ] Handle loading state
  - [ ] Tests passing

### Phase 3: Test Usage

- [ ] `src/__tests__/showStore.test.ts`
  - [ ] Migrate to React Query test patterns
  - [ ] Use `renderHook` with QueryClient provider
  - [ ] All tests passing

- [ ] `src/__tests__/demoDataset.integrity.test.ts`
  - [ ] Mock `useShowsQuery`
  - [ ] Tests passing

- [ ] `src/__tests__/cta.navigation.test.ts`
  - [ ] Mock `useShowsQuery`
  - [ ] Tests passing

### Phase 4: Clean Up

- [ ] Delete `src/shared/showStore.ts` (verify no remaining imports)
- [ ] Remove showStore exports from index files
- [ ] Run full test suite: ✅ All passing
- [ ] Run build: ✅ Clean (Exit Code: 0)
- [ ] Verify no console warnings

---

## Technical Details

### Query Keys Strategy

All queries use consistent query keys for cache management:

```typescript
showsQueryKeys = {
  all: ['shows'], // Used by useShowsQuery()
  lists: () => [...all, 'list'], // Future: filtered lists
  list: filters => [...lists(), filters],
  details: () => [...all, 'detail'],
  detail: id => [...details(), id], // Used by useShowQuery(id)
};
```

This enables:

- Precise cache invalidation (only specific queries update)
- Hierarchical cache management
- Easy addition of filtered queries later

### Cache Settings

```typescript
staleTime: 5 * 60 * 1000; // Data fresh for 5 minutes
gcTime: 10 * 60 * 1000; // Keep in memory for 10 minutes
enabled: true; // Always enabled by default
```

Rationale:

- 5min stale time = Good balance between freshness and performance
- 10min gc time = User typically doesn't stay away for >10min
- Offline support via React Query persister (Phase 2)

### Error Handling

All hooks include error state:

```typescript
const { data, error, isLoading } = useShowsQuery();

if (error) {
  // Error handling
}
```

Future: Add error boundary + toast notifications

---

## Benefits Summary

| Aspect                 | Before (showStore)    | After (React Query)   |
| ---------------------- | --------------------- | --------------------- |
| **Caching**            | Manual                | Automatic             |
| **Cache Invalidation** | Manual (error-prone)  | Automatic (reliable)  |
| **Loading State**      | Must track separately | Built-in              |
| **Error State**        | Not tracked           | Built-in              |
| **Offline Support**    | Manual localStorage   | React Query persister |
| **DevTools**           | None                  | React Query DevTools  |
| **Typescript**         | Partial               | Full coverage         |
| **Testability**        | Hard (singleton)      | Easy (testable hooks) |
| **API Migration**      | Hard (manual cache)   | Easy (swap queryFn)   |

---

## Next Steps

1. **Today**: Verify Phase 1 is complete ✅
   - Tests running: 16/16 passing
   - Build clean: Exit Code 0
   - Documentation complete

2. **Tomorrow**: Start Phase 2
   - Priority: demoDataset.ts (highest impact)
   - Estimated time: 1 hour

3. **Week End**: All phases complete
   - showStore.ts deleted
   - Full React Query adoption
   - Architecture simplified

---

## Questions & Answers

**Q**: Will this break existing code?  
**A**: No. During Phase 1-3, showStore still works. Phase 4 removes it after all usage is migrated.

**Q**: Do I need to use hooks everywhere?  
**A**: No. Non-React files can still call showStore directly during transition. After Phase 4, they must be refactored.

**Q**: How do I handle optimistic updates?  
**A**: Use React Query's `onMutate` callback with `setQueryData`. Example coming in Phase 2.

**Q**: What about multi-tab synchronization?  
**A**: Included in `useShowsSubscription()` hook. Listens to storage events for cross-tab sync.

**Q**: Performance impact?  
**A**: Positive. React Query caching is more efficient than showStore's approach.

---

## Reference

- **Hooks Documentation**: `src/hooks/useShowsQuery.ts`
- **Test Examples**: `src/__tests__/useShowsQuery.integration.test.ts`
- **Phase 1 Deliverables**: 2 files, 580+ LOC, 16 tests
- **Architecture**: docs/ARCHITECTURE.md (State Management section)

---

**Owner**: Frontend Architecture  
**Created**: November 3, 2025  
**Version**: 1.0  
**Status**: Phase 1 Complete, Ready for Phase 2
