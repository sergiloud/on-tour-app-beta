# 📖 Developer Guide - Calendar Component Architecture

**Version:** 1.0  
**Last Updated:** November 6, 2025  
**Status:** ✅ STABLE

---

## 📍 Overview

The Calendar component (`src/pages/dashboard/Calendar.tsx`) is the main interface for managing shows, travel events, and other calendar-based activities. This guide explains the architecture and how to maintain it properly.

---

## 🗂️ Component Structure

```
Calendar.tsx (784 lines)
├── State Management
│   ├── View state (month/week/day/agenda/timeline)
│   ├── Navigation state (cursor, selectedDay)
│   ├── Modal states (4 modals for different views)
│   ├── Travel data state
│   └── Settings state (timezone, week start, heatmap)
│
├── Hooks (At top level - CRITICAL!)
│   ├── useShows - Get shows from backend
│   ├── useCalendarState - Manage calendar state
│   ├── useCalendarMatrix - Calculate month grid
│   ├── useCalendarEvents - Merge shows + travel
│   ├── 5x useMemo - Derived state calculations
│   ├── 4x useEffect - Side effects
│   └── useRef - DOM references
│
├── Render Logic
│   ├── Conditional views (month/week/day/agenda/timeline)
│   ├── Modal dialogs (4 different modals)
│   ├── Event handlers (open/create/edit/delete)
│   └── Toolbar + filters
│
└── Features
    ├── Drag-to-create events
    ├── Multi-select events
    ├── Custom event types
    ├── Import/Export ICS
    ├── Travel integration
    └── Timezone handling
```

---

## ⚡ Critical: React Hooks Rules

### The Rule

**ALL hooks must be called at the TOP LEVEL of the component, NEVER inside conditionals, loops, or nested functions.**

### Top-Level Hooks in Calendar.tsx

```tsx
// Line 1: useShows (gets shows data)
const { shows, add, update, remove } = useShows();

// Lines 53-68: useState for modals and navigation
const [eventCreationOpen, setEventCreationOpen] = useState(false);
const [showEventModalOpen, setShowEventModalOpen] = useState(false);
// ... more state

// Lines 77-85: useEffect for travel sync
useEffect(() => {
  // Fetch travel events
}, [debouncedCursor]);

// Lines 93-302: useMemo for derived state
const eventsByDay = useCalendarEvents({...});
const agendaEventsByDay = useMemo(() => {...}, []);
// ... more memos

// Rest of component
```

### Common Mistake to Avoid

```tsx
// ❌ WRONG - Hook inside conditional
{view === 'agenda' && (
  <AgendaList
    eventsByDay={useMemo(() => {...}, [])}  // ERROR!
  />
)}

// ✅ CORRECT - Hook at top level
const agendaEventsByDay = useMemo(() => {...}, []);
{view === 'agenda' && (
  <AgendaList eventsByDay={agendaEventsByDay} />
)}
```

---

## 🧩 Memoized Values (Must be at top level!)

| Memo                | Purpose                        | Line | Dependencies                                |
| ------------------- | ------------------------------ | ---- | ------------------------------------------- |
| `weekLabel`         | Format week date range         | 253  | selectedDay, cursor, lang, tz, weekStartsOn |
| `weekStart`         | Calculate week start date      | 268  | selectedDay, cursor, weekStartsOn           |
| `weekEventsByDay`   | Transform events for week view | 278  | eventsByDay                                 |
| `dayEvents`         | Get events for selected day    | 286  | selectedDay, cursor, eventsByDay            |
| `agendaEventsByDay` | Filter events by month         | 293  | eventsByDay, cursor, year, month            |

### Important: Dependency Arrays

Each `useMemo` has a **dependency array** that tells React when to recalculate:

```tsx
const agendaEventsByDay = useMemo(() => {
  // This function runs when dependencies change
  return filtered;
}, [eventsByDay, cursor, year, month]); // Dependencies
```

**If dependencies are wrong:**

- Component will be slow (memoization not working)
- Or stale data will be shown (missing dependencies)

---

## 📋 Modal System

The Calendar has 4 modals:

### 1. EventCreationModal

```tsx
<EventCreationModal
  open={eventCreationOpen}
  initialDate={eventCreationDate}
  initialType={eventCreationType}
  onClose={() => {
    setEventCreationOpen(false);
  }}
  onSave={handleSaveEvent}
/>
```

**Purpose:** Create new events (shows, travel, meetings, etc.)

### 2. DayDetailsModal

```tsx
<DayDetailsModal
  open={dayDetailsOpen}
  day={dayDetailsDate}
  events={dayDetailsDate ? eventsByDay.get(dayDetailsDate) || [] : []}
  onClose={() => {
    setDayDetailsOpen(false);
  }}
  onCreateEvent={handleCreateEvent}
/>
```

**Purpose:** View details for a specific day

### 3. ShowEventModal

```tsx
<ShowEventModal
  open={showEventModalOpen}
  onClose={() => { setShowEventModalOpen(false); }}
  initialData={showEventData}
  onSave={(data) => { update(data.id, {...}); }}
/>
```

**Purpose:** Edit/create show events inline

### 4. TravelEventModal

```tsx
<TravelEventModal
  open={travelEventModalOpen}
  onClose={() => {
    setTravelEventModalOpen(false);
  }}
  initialData={travelEventData}
  onSave={data => {
    console.log('Save travel:', data);
  }}
/>
```

**Purpose:** Edit/create travel events inline

---

## 🎬 Event Flow

### Creating a Show Event

```
1. User clicks date on MonthGrid
   ↓
2. handleOpenDayDetails(date) called
3. Sets dayDetailsDate state
4. DayDetailsModal opens
   ↓
5. User clicks "Create Show"
   ↓
6. handleCreateEvent() called
7. ShowEventModal opens
   ↓
8. User fills form and clicks Save
9. handleSaveEvent() called
10. add(newShow) called via useShows hook
    ↓
11. Backend API called to save
12. shows state updated
13. Modal closes
14. Calendar re-renders with new event
```

### Editing a Travel Event

```
1. User clicks travel event on WeekGrid
   ↓
2. onOpen handler fires
3. Extracts travel data from travel array
4. Sets travelEventData state
5. TravelEventModal opens with initial data
   ↓
6. User edits fields and clicks Save
7. onSave handler called
8. Currently just logs to console (backend integration pending)
```

---

## 🔍 Debugging Tips

### If Agenda View is Empty

1. Check `agendaEventsByDay` is being used (not `eventsByDay`)
2. Verify `cursor` is in correct format: `YYYY-MM`
3. Check browser console for date range calculations
4. Ensure shows/travel have dates within current month

### If Modal Doesn't Open

1. Check modal state variable is set correctly
2. Verify event data is extracted from shows/travel array
3. Ensure `onOpen` handler is being called
4. Check console for JavaScript errors

### If React Hooks Error Appears

1. Search file for hooks inside conditionals
2. Move any hooks to component top level
3. Verify all hooks are called in same order every render
4. Run ESLint to catch rule violations

### Performance Issues

1. Check if all memos have correct dependencies
2. Use React DevTools Profiler to identify slow renders
3. Look for unnecessary re-renders of child components
4. Consider using `useCallback` for event handlers

---

## 📝 Common Modifications

### Adding a New View

1. Add view type to `useCalendarState`
2. Create view component (e.g., `CustomView.tsx`)
3. Add conditional rendering in Calendar JSX:
   ```tsx
   {
     view === 'custom' && <CustomView events={eventsByDay} />;
   }
   ```
4. Update toolbar to show view button
5. Add keyboard shortcuts if needed

### Adding a New Modal

1. Create modal component (e.g., `CustomModal.tsx`)
2. Add state for modal in Calendar:
   ```tsx
   const [customModalOpen, setCustomModalOpen] = useState(false);
   const [customModalData, setCustomModalData] = useState(undefined);
   ```
3. Add modal to Calendar JSX:
   ```tsx
   <CustomModal
     open={customModalOpen}
     onClose={() => setCustomModalOpen(false)}
     onSave={data => {
       /* handle save */
     }}
   />
   ```
4. Update event handlers to open modal

### Adding Event Filtering

1. Check if filter should be in `useCalendarEvents` hook
2. Or add useMemo for post-filtering:
   ```tsx
   const filteredEvents = useMemo(() => {
     // Apply filters
     return filtered;
   }, [eventsByDay, filters]);
   ```
3. Pass filtered events to views

---

## 🧪 Testing Guidelines

### Unit Tests

- Test memoized values with different dependencies
- Test event handlers in isolation
- Test modal state management

### Integration Tests

- Test full user flows (create → edit → delete)
- Test keyboard shortcuts
- Test timezone changes

### E2E Tests

- Test complete workflows in browser
- Test modal opening/closing
- Test data persistence

---

## 🚀 Performance Optimization

### Current Optimizations

- ✅ `useMemo` for expensive calculations
- ✅ `useCallback` for event handlers (todo)
- ✅ `useCalendarMatrix` for month calculations
- ✅ Map data structure for O(1) date lookups

### Future Optimizations

- Virtual scrolling for long event lists
- Lazy loading of travel data
- Code splitting for views
- Image optimization for calendar

---

## 🔗 Related Files

| File                                           | Purpose                   | Status    |
| ---------------------------------------------- | ------------------------- | --------- |
| `src/hooks/useCalendarState.tsx`               | Calendar state management | ✅ Active |
| `src/hooks/useCalendarMatrix.tsx`              | Month grid calculation    | ✅ Active |
| `src/hooks/useCalendarEvents.tsx`              | Show + travel merging     | ✅ Active |
| `src/components/calendar/MonthGrid.tsx`        | Month view component      | ✅ Active |
| `src/components/calendar/WeekGrid.tsx`         | Week view component       | ✅ Active |
| `src/components/calendar/DayGrid.tsx`          | Day view component        | ✅ Active |
| `src/components/calendar/AgendaList.tsx`       | Agenda view component     | ✅ Active |
| `src/components/calendar/ShowEventModal.tsx`   | Show editor modal         | ✅ Active |
| `src/components/calendar/TravelEventModal.tsx` | Travel editor modal       | ✅ Active |

---

## 📞 Support & Questions

**For React Hooks issues:**

- See `REACT_HOOKS_QUICK_REFERENCE.md`
- Run ESLint to catch violations

**For feature requests:**

- Check `CALENDAR_UX_FIXES.md` for recent updates
- Review todo list in project root

**For bugs:**

1. Create minimal reproduction
2. Check browser console for errors
3. Verify dependencies in memos
4. Check hook order in component

---

## ✅ Checklist for Modifications

When modifying Calendar.tsx:

- [ ] No hooks inside conditionals
- [ ] All hooks at top level, consistent order
- [ ] Dependency arrays are complete
- [ ] No console errors or warnings
- [ ] Tests still passing
- [ ] Build still passing
- [ ] Documentation updated

---

**Last Reviewed:** November 6, 2025  
**Status:** ✅ STABLE & DOCUMENTED  
**Maintainer:** Development Team
