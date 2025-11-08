# Calendar - Dashboard Synchronization

## Overview

El Calendario es ahora la **fuente de verdad única** para todos los eventos. El Dashboard lee directamente del calendario en tiempo real sin necesidad de refrescar.

## Architecture

### Data Flow

```
Calendar.tsx (useShows + useCalendarEvents)
    ↓
showStore (real-time updates)
    ↓
useCalendarStats hook (new!)
    ↓
TourAgenda component
    ↓
Dashboard displays events
```

### Key Change

- **Before**: Dashboard used `useTourStats()` → Read from `showStore.getAll()` → Potentially stale data
- **After**: Dashboard uses `useCalendarStats()` → Reads same source as Calendar → Always in sync

## Implementation

### File: `src/hooks/useCalendarStats.ts` (NEW)

New hook that mirrors the exact logic the Calendar uses:

**Key Features:**

- Uses `useShows()` for real-time show data (same as Calendar.tsx line 49)
- Filters shows identically to Calendar
- Respects dashboard filters (status, search, date range)
- Returns same data structure as TourAgenda expects
- Automatically re-computes when shows change

**Dependencies:**

```typescript
[shows, orgId, filters.dateRange, filters.status, filters.searchQuery];
```

When any shows change (via WebSocket), the hook recomputes automatically.

### File: `src/components/dashboard/TourAgenda.tsx` (UPDATED)

**Before:**

```typescript
import { useTourStats } from '../../hooks/useTourStats';
const data = useTourStats();
```

**After:**

```typescript
import { useCalendarStats } from '../../hooks/useCalendarStats';
const data = useCalendarStats();
```

## How It Works

### Real-Time Synchronization Flow

1. **User creates event in Calendar**

   ```
   Click "Add Show" in Calendar
   → onQuickAddSave() callback fires
   → add(newShow) called via useShows()
   → showStore updates all subscribers
   ```

2. **useCalendarStats receives update**

   ```
   shows dependency changes
   → useMemo recomputes
   → Returns updated stats
   ```

3. **TourAgenda re-renders**

   ```
   data changes
   → Component receives new props
   → Shows new event in agenda
   ```

4. **User sees result instantly**
   ```
   No API calls needed
   No page refresh needed
   No cache invalidation needed
   ```

## Verification

### What Should Update Instantly

- ✅ New shows appear in Tour Agenda
- ✅ Show counts update in real-time
- ✅ Revenue calculations recalculate
- ✅ "Next show" indicator changes
- ✅ Confirmed/Pending/Offer counts update
- ✅ Agenda grouping by date updates
- ✅ Gap detection re-runs
- ✅ All status badges update

### Testing

1. Open Calendar in one window
2. Open Dashboard in another window
3. Create a new show in Calendar
4. **Result**: Should appear in Tour Agenda immediately (no refresh)

## Technical Details

### Why This Works Better

- **Single Source of Truth**: Calendar determines what events exist
- **Same Logic**: Both Calendar and Dashboard use `useShows()`
- **Real-Time**: WebSocket updates flow through showStore to all subscribers
- **No Stale Data**: Dependencies ensure recomputation on any change
- **Efficient**: Memoization prevents unnecessary recalculations

### Performance

- O(n) filter operations (where n = shows count)
- Memoized to prevent redundant computations
- WebSocket-driven updates (no polling)
- No database queries (all in-memory calculations)

## Backwards Compatibility

- ✅ No breaking changes to TourAgenda component
- ✅ Return type identical to useTourStats
- ✅ All Dashboard features work unchanged
- ✅ Can revert to useTourStats if needed

## Files Changed

1. **NEW**: `src/hooks/useCalendarStats.ts` (Source of truth hook)
2. **UPDATED**: `src/components/dashboard/TourAgenda.tsx` (Uses new hook)
3. **UNCHANGED**: `src/pages/dashboard/Calendar.tsx` (Still works same way)
4. **STILL WORKS**: `src/hooks/useTourStats.ts` (Kept for backwards compat)
