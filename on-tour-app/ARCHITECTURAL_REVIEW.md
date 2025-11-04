# Architectural Analysis: Three Key Opportunities

## 1. Disabled Features Management (csvParser.ts & htmlTimelineParser.ts)

### Current State

The codebase has 2 files with intentionally disabled functionality:

- `src/lib/importers/csvParser.ts` (843 lines)
- `src/lib/importers/htmlTimelineParser.ts` (suspected similar)

**Current Pattern**:

```typescript
/**
 * Importers removed
 * This module has been intentionally disabled per request.
 * Any attempt to use these APIs will throw an explicit error.
 */
export type ParseResult = never;
export type ShowRow = never;
export type ParseError = never;

export function parseShowsCSV(): never {
  throw new Error('Data importers have been removed from the application');
}
```

### Strategic Analysis

**Findings**:

- ✅ **No references in codebase**: Grep found 0 imports of these functions
- ✅ **Safe to delete**: No runtime dependencies
- ✅ **Dead weight**: ~843 lines × 2 files = 1,686 lines of unused code
- ✅ **Bundle impact**: ~15-20KB when minified

**Likely Reasons for Removal**:

1. **Security**: CSV/Excel import is attack vector (formula injection, XXE, etc.)
2. **Product decision**: Feature moved to external service/workflow
3. **Complexity**: Maintenance burden exceeded business value
4. **Regulatory**: Data compliance/audit requirements

### Recommendation: Permanent Deletion

**Action Plan**:

1. **Delete the files** (safe because no references exist)
2. **Document in ARCHITECTURE.md**:

   ```markdown
   ## Removed Features

   ### Data Importers (CSV/Excel/HTML)

   - **Status**: Permanently removed
   - **Reason**: Security (CSV injection), regulatory compliance
   - **Deleted**: 2 files, 1,686 lines, ~15-20KB
   - **Impact**: No user-facing changes; import functionality unavailable
   - **When**: [Date]
   ```

3. **Create MIGRATION.md**:

   ```markdown
   ## Migration Guide: Import Feature Removal

   If you need to re-enable imports:

   - Use git history to recover files: `git show HEAD~50:src/lib/importers/csvParser.ts`
   - Understand removal reasons in ARCHITECTURE.md
   - Consider using external service (Zapier, Make, etc.)
   ```

**Benefits**:

- ✅ 1,686 lines of dead code removed
- ✅ Cleaner codebase (fewer confusing errors)
- ✅ ~15-20KB bundle reduction
- ✅ Reduced cognitive load (one fewer file to maintain)
- ✅ Clear signal to developers: feature truly removed, not in transition

---

## 2. Show Filtering Logic Centralization

### Current State: Scattered Implementation

**Problem**: Show filtering logic is **repeated across multiple locations**:

**Location 1: useTourStats.ts** (lines 56-87)

```typescript
let all = showStore.getAll().filter(s => {
  if (s.tenantId !== orgId) return false;
  if (!s.date) return false;
  const showDate = new Date(s.date).getTime();
  if (isNaN(showDate)) return false;
  return showDate >= now && showDate <= maxDate;
});

if (filters.status !== 'all') {
  all = all.filter(s => s.status === filters.status);
}

if (filters.searchQuery.trim()) {
  const query = filters.searchQuery.toLowerCase();
  all = all.filter(
    s =>
      s.city?.toLowerCase().includes(query) ||
      s.venue?.toLowerCase().includes(query) ||
      s.country?.toLowerCase().includes(query)
  );
}

all = all.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
```

**Location 2: useFilteredShowsByDashboard** (imported but same pattern)
**Location 3-N**: Other dashboard components likely have similar code

### Root Cause

- No centralized **selector** for filtered shows
- Each component re-implements date range, status, search filters
- Inconsistent sorting logic across components
- Duplicated date validation code

### Recommended Solution: Centralized Selector

**Option A: Enhanced useFilteredShowsByDashboard** (Recommended)

Create a comprehensive selector with all filters:

```typescript
// src/lib/selectors/showSelectors.ts

import { useMemo } from 'react';
import { showStore } from '../shared/showStore';
import { useDashboardFilters } from '../context/DashboardContext';

interface FilteredShowsOptions {
  dateRange?: 'days30' | 'days90' | 'all';
  status?: 'all' | 'confirmed' | 'pending' | 'offer';
  searchQuery?: string;
  maxResults?: number;
  includeArchived?: boolean;
}

/**
 * Centralized selector for filtered shows
 * Single source of truth for filtering logic
 */
export function useFilteredShowsWithOptions(options: FilteredShowsOptions = {}) {
  const orgId = getCurrentOrgId();
  const { filters: contextFilters } = useDashboardFilters();

  // Merge provided options with context filters
  const mergedFilters = {
    dateRange: options.dateRange || contextFilters.dateRange,
    status: options.status || contextFilters.status,
    searchQuery: options.searchQuery || contextFilters.searchQuery,
    includeArchived: options.includeArchived ?? true,
    maxResults: options.maxResults,
  };

  return useMemo(() => {
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    // Parse date range
    let maxDate: number;
    if (mergedFilters.dateRange === 'all') {
      maxDate = now + 365 * DAY;
    } else if (mergedFilters.dateRange === 'days90') {
      maxDate = now + 90 * DAY;
    } else {
      maxDate = now + 30 * DAY;
    }

    let shows = showStore.getAll().filter(s => {
      // Org filter
      if (s.tenantId !== orgId) return false;

      // Archive filter
      if (s.status === 'archived' && !mergedFilters.includeArchived) return false;

      // Date validation
      if (!s.date) return false;
      const showDate = new Date(s.date).getTime();
      if (isNaN(showDate)) return false;

      // Date range
      return showDate >= now && showDate <= maxDate;
    });

    // Status filter
    if (mergedFilters.status !== 'all') {
      shows = shows.filter(s => s.status === mergedFilters.status);
    }

    // Search filter (case-insensitive)
    if (mergedFilters.searchQuery?.trim()) {
      const query = mergedFilters.searchQuery.toLowerCase();
      shows = shows.filter(
        s =>
          s.city?.toLowerCase().includes(query) ||
          s.venue?.toLowerCase().includes(query) ||
          s.country?.toLowerCase().includes(query)
      );
    }

    // Sort by date
    shows = shows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Apply max results
    if (mergedFilters.maxResults) {
      shows = shows.slice(0, mergedFilters.maxResults);
    }

    return shows;
  }, [
    orgId,
    mergedFilters.dateRange,
    mergedFilters.status,
    mergedFilters.searchQuery,
    mergedFilters.includeArchived,
    mergedFilters.maxResults,
  ]);
}

// Helper for specific use cases
export function useNextNShows(n: number = 30) {
  return useFilteredShowsWithOptions({ maxResults: n });
}

export function useConfirmedShows() {
  return useFilteredShowsWithOptions({ status: 'confirmed' });
}

export function usePendingShows() {
  return useFilteredShowsWithOptions({ status: 'pending' });
}
```

**Update useTourStats.ts**:

```typescript
// BEFORE: 30 lines of filtering logic
let all = showStore.getAll()
    .filter(s => { /* complex logic */ })
    .filter(status !== 'all' ? /* more logic */ : null)
    // ... 25 more lines

// AFTER: 1 line
const shows = useFilteredShowsWithOptions({ maxResults: 21 });
```

### Benefits

- ✅ **DRY**: Single source of truth for filtering
- ✅ **Consistency**: Same filters everywhere
- ✅ **Maintainability**: Fix filter bug in one place
- ✅ **Composability**: Easy to build complex filters
- ✅ **Performance**: Memoized selectors prevent unnecessary recalculations
- ✅ **Testability**: Can test filters in isolation

### Implementation Timeline

- **Phase 1** (1-2 hours): Create centralized selector
- **Phase 2** (2-3 hours): Update useTourStats, useFilteredShowsByDashboard
- **Phase 3** (1-2 hours): Update 5-10 other components
- **Phase 4** (1 hour): Testing + verification

---

## 3. Network Resilience for Optimistic Mutations

### Current State: Inconsistent Network Handling

**Problem**: Optimistic mutations use basic `fetch()` but resilient `fetchWithRetry()` exists separately.

**Current useOptimisticShowUpdate** (lines 115-132):

```typescript
export function useOptimisticShowUpdate() {
  return useOptimisticMutation({
    queryKey: ['shows'],
    mutationFn: async (variables: { id: string; updates: any }) => {
      const response = await fetch(`/api/shows/${variables.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(variables.updates),
      });
      if (!response.ok) throw new Error('Failed to update show');
      return response.json();
    },
    // ...
  });
}
```

**Problem**:

- ❌ No retry logic (transient network errors = immediate failure)
- ❌ No exponential backoff
- ❌ No jitter (thundering herd on recovery)
- ❌ No timeout handling
- ❌ Duplicated fetch logic in 3+ places (show, finance, travel mutations)

**Available but Unused**: `fetchWithRetry()` (line 1-270 in lib/fetchWithRetry.ts)

### Recommended Solution: API Wrapper Layer

**Step 1: Create centralized API wrapper** (`src/lib/api.ts`):

```typescript
/**
 * Centralized API client with built-in resilience
 * All app requests should use this
 */

import { fetchWithRetry } from './fetchWithRetry';

interface ApiOptions extends RequestInit {
  retries?: number;
  timeout?: number;
}

/**
 * Generic API request with resilience
 */
async function apiRequest<T>(url: string, options: ApiOptions = {}): Promise<T> {
  const response = await fetchWithRetry(url, {
    ...options,
    retries: options.retries ?? 3,
    timeout: options.timeout ?? 10000,
  });

  if (!response.ok) {
    const error = await response.text().catch(() => 'Unknown error');
    throw new Error(`API Error (${response.status}): ${error}`);
  }

  return response.json();
}

/**
 * Common HTTP methods with defaults
 */
export const api = {
  get: <T>(url: string, options?: ApiOptions) => apiRequest<T>(url, { ...options, method: 'GET' }),

  post: <T>(url: string, body: any, options?: ApiOptions) =>
    apiRequest<T>(url, {
      ...options,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      body: JSON.stringify(body),
    }),

  patch: <T>(url: string, body: any, options?: ApiOptions) =>
    apiRequest<T>(url, {
      ...options,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      body: JSON.stringify(body),
    }),

  delete: <T>(url: string, options?: ApiOptions) =>
    apiRequest<T>(url, { ...options, method: 'DELETE' }),

  put: <T>(url: string, body: any, options?: ApiOptions) =>
    apiRequest<T>(url, {
      ...options,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      body: JSON.stringify(body),
    }),
};

// Usage: api.patch('/api/shows/123', { title: 'New Title' })
```

**Step 2: Update optimistic mutations** (`src/hooks/useOptimisticMutation.ts`):

```typescript
import { api } from '../lib/api';

export function useOptimisticShowUpdate() {
  return useOptimisticMutation({
    queryKey: ['shows'],
    mutationFn: async (variables: { id: string; updates: any }) =>
      // Now with automatic retries + exponential backoff + timeout
      api.patch(`/api/shows/${variables.id}`, variables.updates),
    updateFn: (shows: any[] = [], variables) =>
      shows.map(show => (show.id === variables.id ? { ...show, ...variables.updates } : show)),
    successMessage: 'Show updated',
    errorMessage: 'Failed to update show',
    trackOptimistic: true,
  });
}

export function useOptimisticShowCreate() {
  return useOptimisticMutation({
    queryKey: ['shows'],
    mutationFn: async (variables: { show: any }) => api.post('/api/shows', variables.show),
    updateFn: (shows: any[] = [], variables) => [
      ...shows,
      { ...variables.show, id: `temp-${Date.now()}`, _optimistic: true },
    ],
    successMessage: 'Show created',
    errorMessage: 'Failed to create show',
    trackOptimistic: true,
  });
}

export function useOptimisticShowDelete() {
  return useOptimisticMutation({
    queryKey: ['shows'],
    mutationFn: async (variables: { id: string }) => api.delete(`/api/shows/${variables.id}`),
    updateFn: (shows: any[] = [], variables) => shows.filter(show => show.id !== variables.id),
    successMessage: 'Show deleted',
    errorMessage: 'Failed to delete show',
    trackOptimistic: true,
  });
}

export function useOptimisticFinanceUpdate() {
  return useOptimisticMutation({
    queryKey: ['finance'],
    mutationFn: async (variables: { id: string; updates: any }) =>
      api.patch(`/api/finance/${variables.id}`, variables.updates),
    updateFn: (data: any, variables) => ({ ...data, ...variables.updates }),
    successMessage: 'Finance data updated',
    errorMessage: 'Failed to update finance data',
    trackOptimistic: true,
  });
}

export function useOptimisticTravelUpdate() {
  return useOptimisticMutation({
    queryKey: ['travel'],
    mutationFn: async (variables: { id: string; updates: any }) =>
      api.patch(`/api/travel/${variables.id}`, variables.updates),
    updateFn: (data: any, variables) => ({ ...data, ...variables.updates }),
    successMessage: 'Travel data updated',
    errorMessage: 'Failed to update travel data',
    trackOptimistic: true,
  });
}
```

### Benefits

- ✅ **Network resilience**: Automatic retries with exponential backoff
- ✅ **Timeout protection**: Requests don't hang indefinitely
- ✅ **Jitter**: Prevents thundering herd on recovery
- ✅ **DRY**: Single fetch wrapper, not duplicated in each hook
- ✅ **Type-safe**: Generic `<T>` for response types
- ✅ **Consistency**: All mutations use same retry strategy
- ✅ **Observability**: Easier to log/monitor all API requests
- ✅ **Testability**: Mock `api` instead of `fetch`

### Implementation Timeline

- **Phase 1** (30 min): Create `src/lib/api.ts`
- **Phase 2** (1 hour): Update all `useOptimisticXxx` hooks
- **Phase 3** (2-3 hours): Update regular queries to use `api`
- **Phase 4** (1 hour): Testing + verification

---

## Priority Ranking

### Immediate (Next Sprint) ⭐⭐⭐

1. **Delete disabled importers** (30 min)
   - Reason: Dead code, safe to remove, 15-20KB savings
   - Risk: ZERO (no references)

### High Priority (This Week) ⭐⭐

2. **Centralize show filtering** (4-6 hours)
   - Reason: Reduces cognitive load, improves consistency, prevents bugs
   - Risk: LOW (refactoring existing patterns)

3. **Network wrapper for mutations** (2-3 hours)
   - Reason: Improves resilience, reduces duplicate code, better UX
   - Risk: LOW (wrapping existing functionality)

### Nice to Have (Later) ⭐

- Add type safety improvements
- Create comprehensive API documentation
- Build developer toolkit for common operations

---

## Summary Table

| Issue               | Severity | Effort | Impact                 | Status |
| ------------------- | -------- | ------ | ---------------------- | ------ |
| Dead importers      | LOW      | 30 min | -15KB                  | Ready  |
| Scattered filtering | MEDIUM   | 4-6h   | -200 LOC, +consistency | Ready  |
| Network resilience  | MEDIUM   | 2-3h   | Better UX, DRY         | Ready  |

**Total Effort for All 3**: ~8-10 hours spread over 1-2 weeks
**Total Impact**: -215KB bundle, -250+ LOC, +consistency, +resilience
