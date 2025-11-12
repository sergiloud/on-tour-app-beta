# Calendar.tsx Refactoring Plan - P5

**Status:** 🟡 IN PROGRESS - Foundation Complete, Integration Pending  
**Started:** November 12, 2025  
**Component Size:** 1403 lines (God Component anti-pattern)

---

## Executive Summary

Calendar.tsx is a **"God Component"** that violates Single Responsibility Principle by managing:
- Data fetching & subscriptions (shows, travel)
- 15+ modal states
- Business logic (CRUD operations, bulk actions, drag-drop)
- Rendering for 5 different view modes
- Nested component definitions

**Impact:**
- **Mantenibilidad:** Extremely difficult to modify without side effects
- **Rendimiento:** Any state change triggers re-evaluation of 1403 lines
- **Colaboración:** Bottleneck for parallel development

**Solution:** Decompose into specialized modules with clear responsibilities.

---

## Current State Analysis

### Component Breakdown (Lines of Code)

| Section | Lines | Responsibility | Status |
|---------|-------|----------------|--------|
| Imports & Types | 1-75 | Setup | ✅ Clean |
| State Declarations | 76-120 | 15+ useState hooks | 🔴 BLOATED |
| Data Fetching | 121-145 | Travel fetch + subscriptions | 🔴 MIXED CONCERNS |
| Event Handlers | 146-550 | CRUD, bulk ops, drag-drop | 🟡 COMPLEX BUT LOGICAL |
| Modal Definitions | 551-800 | Nested components | 🔴 SHOULD BE EXTRACTED |
| View Rendering | 801-1350 | Conditional rendering for 5 views | 🟡 COULD BE CLEANER |
| Modal JSX | 1351-1403 | 6 modal components | 🔴 REPETITIVE |

### State Management Audit

**15 useState Declarations:**
1. `selectedDay` - Selected date
2. `eventCreationOpen` - Event creation modal
3. `eventCreationDate` - Modal data
4. `eventCreationType` - Modal data
5. `eventCreationInitialData` - Modal data
6. `editingTravelId` - Travel editing state
7. `dayDetailsOpen` - Day details modal
8. `dayDetailsDate` - Modal data
9. `showEventModalOpen` - Show event modal
10. `showEventData` - Modal data
11. `travelFlightModalOpen` - Travel modal
12. `travelEventData` - Modal data
13. `eventEditorOpen` - Event editor modal
14. `editingEvent` - Modal data
15. `travel` - Travel events data
16. `travelError` - Error state
17. `gotoOpen` - Go-to-date modal
18. `debouncedCursor` - Debounced month cursor
19. `weekStartsOn` - Week start preference
20. `heatmapMode` - Heatmap mode

**Problem:** Modal state management alone accounts for 10+ useState hooks. This creates:
- Verbose code (setters, getters everywhere)
- Difficult to track which modal is open
- Easy to forget to reset state on close
- No centralized modal coordination

---

## Refactoring Strategy

### Phase 1: Extract Hook Modules ✅ COMPLETE

#### 1.1 useCalendarData ✅
**File:** `src/hooks/useCalendarData.ts`

**Responsibilities:**
- Fetch shows (via useShows)
- Fetch & subscribe to travel events
- Merge into unified eventsByDay structure
- Provide CRUD operations
- Handle loading/error states

**Benefits:**
- Removes 30+ lines of data logic from Calendar.tsx
- Testable in isolation
- Reusable in other calendar contexts

**Interface:**
```typescript
const {
  shows,
  travel,
  eventsByDay,
  travelLoading,
  travelError,
  showOperations: { add, update, remove },
  travelOperations: { save, remove },
} = useCalendarData({ debouncedCursor, filters, lang, tz, toDateOnlyTz });
```

#### 1.2 useCalendarModals ✅
**File:** `src/hooks/useCalendarModals.ts`

**Responsibilities:**
- Manage all modal open/close states
- Track modal-specific data (dates, IDs, initial data)
- Provide type-safe modal operations
- Centralized modal coordination

**Benefits:**
- Replaces 15+ useState declarations with single state object
- Clear modal operations (open/close/closeAll)
- Prevents state leak (auto-reset on close)
- Reduces Calendar.tsx by 50+ lines

**Interface:**
```typescript
const modals = useCalendarModals();

// Usage
modals.openEventCreation('2025-11-12', 'show');
modals.closeEventCreation();
modals.state.eventCreation.isOpen; // boolean
```

### Phase 2: Extract Component Modules 🟡 IN PROGRESS

#### 2.1 CalendarViewRouter 🟡
**File:** `src/components/calendar/CalendarViewRouter.tsx`

**Responsibilities:**
- Route to correct view component based on `view` prop
- Pass processed data and handlers
- Isolate view-specific rendering logic

**Challenge Identified:**
- View components (MonthGrid, WeekGrid, DayGrid) have **different prop interfaces**
- Example: MonthGrid expects `setSelectedDay`, WeekGrid expects `weekStart`, DayGrid expects `day`
- Simple prop pass-through won't work

**Solutions:**
1. **Adapter Pattern (RECOMMENDED):** Create thin adapters for each view
2. **Normalize Interfaces:** Refactor view components to accept common props
3. **Hybrid:** Keep direct rendering in Calendar.tsx, extract only shared logic

**Decision:** DEFER CalendarViewRouter until view component interfaces are normalized in separate PR.

#### 2.2 CalendarEventHandlers 📋 PLANNED
**File:** `src/hooks/useCalendarEventHandlers.ts`

**Responsibilities:**
- Event click handlers
- Drag-drop logic
- Bulk operations
- Span adjustment
- ICS import

**Benefits:**
- Removes 200+ lines of handler logic
- Testable event manipulation
- Clear separation of UI from business logic

#### 2.3 CalendarModals Component 📋 PLANNED
**File:** `src/components/calendar/CalendarModals.tsx`

**Responsibilities:**
- Render all modal components
- Wire modal state to components
- Centralize modal JSX (currently 50+ lines of repetitive code)

**Benefits:**
- Removes repetitive modal JSX from Calendar.tsx
- Single file for all calendar modals
- Easier to add new modals

---

## Phase 1 Results (Foundation Complete)

### Files Created ✅

1. **src/hooks/useCalendarData.ts** (144 lines)
   - Encapsulates data fetching & subscriptions
   - Type-safe CRUD operations
   - Loading/error state management

2. **src/hooks/useCalendarModals.ts** (240 lines)
   - Single state object for all modals
   - Type-safe modal operations
   - Auto-reset on close

3. **src/components/calendar/CalendarViewRouter.tsx** (180 lines) ⚠️ NEEDS ADJUSTMENT
   - View routing logic extracted
   - **Issue:** Interface mismatch with existing view components
   - **Status:** Postponed until view interfaces normalized

### Metrics

| Metric | Before | After Phase 1 | Improvement |
|--------|--------|---------------|-------------|
| Calendar.tsx lines | 1403 | ~1400* | 0% (integration pending) |
| useState declarations | 20 | ~8* | 60% reduction planned |
| Data logic lines | ~50 | 0* | 100% extraction planned |
| Modals managed | 6 | 6 | Same (centralized) |

*Projected after Phase 2 integration

---

## Phase 2 Plan (Integration)

### Step 2.1: Integrate useCalendarData
**Target:** Replace inline data fetching

**Changes Required:**
```tsx
// BEFORE
const [travel, setTravel] = useState<Itinerary[]>([]);
const [travelError, setTravelError] = useState(false);
useEffect(() => {
  // 30 lines of fetch + subscription logic
}, [debouncedCursor]);

// AFTER
const { travel, travelError, travelLoading, showOperations, travelOperations } = useCalendarData({
  debouncedCursor,
  filters,
  lang,
  tz,
  toDateOnlyTz,
});
```

**Impact:**
- -30 lines from Calendar.tsx
- -2 useState declarations
- +1 hook call

### Step 2.2: Integrate useCalendarModals
**Target:** Replace modal state management

**Changes Required:**
```tsx
// BEFORE
const [eventCreationOpen, setEventCreationOpen] = useState(false);
const [eventCreationDate, setEventCreationDate] = useState<string | undefined>(undefined);
const [eventCreationType, setEventCreationType] = useState<EventType | null>(null);
// ... 12 more modal states

// AFTER
const modals = useCalendarModals();

// Usage in handlers
const handleCreateEvent = (date: string) => {
  modals.openEventCreation(date);
};
```

**Impact:**
- -50 lines from Calendar.tsx
- -15 useState declarations
- +1 hook call
- Cleaner handler code

### Step 2.3: Extract Event Handlers
**Target:** Create useCalendarEventHandlers hook

**Responsibilities:**
- `handleCreateEvent`
- `handleMoveEvent`
- `handleDeleteEvent`
- `handleBulkDelete`
- `handleBulkMove`
- `handleSpanAdjust`
- `handleImportICS`
- `handleOpenEventEditor`
- `handleSaveEditedEvent`

**Impact:**
- -200 lines from Calendar.tsx
- Handlers become testable
- Business logic separated from UI

### Step 2.4: Create CalendarModals Component
**Target:** Centralize modal JSX

**Before (50+ lines):**
```tsx
<EventCreationModal
  open={eventCreationOpen}
  date={eventCreationDate}
  type={eventCreationType}
  initialData={eventCreationInitialData}
  onClose={closeEventCreation}
  onSave={handleSave}
/>
// ... 5 more modals
```

**After (5 lines):**
```tsx
<CalendarModals
  modals={modals}
  handlers={eventHandlers}
  data={{ shows, travel }}
/>
```

**Impact:**
- -45 lines from Calendar.tsx
- Centralized modal management
- Easier to add/remove modals

---

## Final Projected Structure

### Calendar.tsx (Target: ~400 lines)
```tsx
const Calendar: React.FC = () => {
  // Performance monitoring
  usePerfMonitor('Calendar:render');
  
  // Settings & navigation
  const { lang } = useSettings();
  const navigate = useNavigate();
  const { view, setView, cursor, setCursor, tz, setTz, filters, setFilters, today } = useCalendarState();
  
  // Data management
  const calendarData = useCalendarData({ debouncedCursor, filters, lang, tz, toDateOnlyTz });
  
  // Modal management
  const modals = useCalendarModals();
  
  // Event handlers
  const eventHandlers = useCalendarEventHandlers({
    calendarData,
    modals,
    navigate,
  });
  
  // UI state
  const { selectedEventIds, clearSelection, toggleSelection, isSelected } = useEventSelection();
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [weekStartsOn, setWeekStartsOn] = useState<0 | 1>(1);
  const [heatmapMode, setHeatmapMode] = useState<'none' | 'financial' | 'activity'>('none');
  
  // Calendar matrix
  const grid = useCalendarMatrix(year, month, weekStartsOn);
  
  return (
    <div className="calendar-container">
      <CalendarToolbar {...toolbarProps} />
      
      {/* View rendering - kept inline for now (interfaces incompatible) */}
      {view === 'month' && <MonthGrid {...monthProps} />}
      {view === 'week' && <WeekGrid {...weekProps} />}
      {view === 'day' && <DayGrid {...dayProps} />}
      {view === 'agenda' && <AgendaList {...agendaProps} />}
      {view === 'timeline' && <TimelineView {...timelineProps} />}
      
      <CalendarModals modals={modals} handlers={eventHandlers} data={calendarData} />
      <BulkOperationsToolbar {...bulkProps} />
    </div>
  );
};
```

### Projected Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Calendar.tsx lines | 1403 | ~400 | **71% reduction** |
| useState in Calendar.tsx | 20 | 4 | **80% reduction** |
| Responsibilities | 10+ | 3 | **70% reduction** |
| Testability | Low | High | **Isolated modules** |
| Collaboration friction | High | Low | **Parallel development** |

---

## Blockers & Decisions

### Blocker 1: View Component Interface Mismatch ⚠️

**Problem:**
- MonthGrid expects: `setSelectedDay`, `onOpen`, `onOpenDay`, `onMoveShow`
- WeekGrid expects: `weekStart`, `onOpen`, `onCreateEvent`, `onMoveEvent`
- DayGrid expects: `day`, `events`, `onOpen`, `onDeleteEvent`

**Options:**
1. **DEFERRED (CHOSEN):** Keep view rendering in Calendar.tsx, extract only shared logic
2. **Normalize Interfaces:** Refactor all view components to accept common props (separate PR)
3. **Adapter Pattern:** Create thin wrappers for each view (adds complexity)

**Decision:** DEFER CalendarViewRouter. Focus on data/modal/handler extraction first.

### Blocker 2: Circular Dependencies

**Problem:** Event handlers need modals, modals need handlers for onSave callbacks.

**Solution:** Pass callbacks via props, not via hook dependencies:
```tsx
const handlers = useCalendarEventHandlers({ calendarData });
<CalendarModals modals={modals} onSave={handlers.handleSave} />
```

---

## Next Steps

### Immediate (Phase 2)

1. ✅ Create foundation hooks (useCalendarData, useCalendarModals)
2. 📋 Integrate useCalendarData into Calendar.tsx
3. 📋 Integrate useCalendarModals into Calendar.tsx
4. 📋 Extract useCalendarEventHandlers
5. 📋 Create CalendarModals component
6. 📋 Update tests
7. 📋 Build & verify no regressions

### Future (Phase 3)

1. 📋 Normalize view component interfaces
2. 📋 Implement CalendarViewRouter
3. 📋 Extract GoToDateDialog to separate file
4. 📋 Consider Context API for deep prop drilling
5. 📋 Add integration tests for calendar flows

---

## Success Criteria

**Phase 1 (Foundation):** ✅ COMPLETE
- [x] useCalendarData hook created and tested
- [x] useCalendarModals hook created and tested
- [x] CalendarViewRouter created (pending interface normalization)

**Phase 2 (Integration):** 🟡 IN PROGRESS
- [ ] Calendar.tsx reduced to < 500 lines
- [ ] useState count reduced to < 8
- [ ] All data fetching abstracted to useCalendarData
- [ ] All modal management abstracted to useCalendarModals
- [ ] Event handlers extracted to separate hook
- [ ] Build succeeds with no TypeScript errors
- [ ] No visual or functional regressions

**Phase 3 (Polish):** 📋 PLANNED
- [ ] View components accept normalized props
- [ ] CalendarViewRouter integrated
- [ ] Calendar.tsx acts as pure orchestrator (< 300 lines)
- [ ] Integration tests cover major flows
- [ ] Performance metrics stable or improved

---

## Lessons Learned

1. **Interface Alignment is Critical:** Before extracting view routing, ensure view components have compatible interfaces.

2. **Extract Data First:** Data fetching is easiest to extract and provides immediate value.

3. **Modal Management Benefits:** Centralizing modal state reduces cognitive load significantly (15+ states → 1 object).

4. **Incremental Refactoring:** Build foundation, integrate gradually, avoid big-bang rewrites.

5. **Type Safety Pays Off:** TypeScript caught interface mismatches early in CalendarViewRouter.

---

## References

- **Original Component:** `src/pages/dashboard/Calendar.tsx` (1403 lines)
- **Foundation Hooks:** 
  - `src/hooks/useCalendarData.ts`
  - `src/hooks/useCalendarModals.ts`
- **View Router (Deferred):** `src/components/calendar/CalendarViewRouter.tsx`

**Audit Date:** November 12, 2025  
**Next Review:** After Phase 2 integration complete
