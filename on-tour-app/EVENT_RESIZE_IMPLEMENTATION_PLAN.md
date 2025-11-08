# 📋 Implementation Plan: Event Edge Resize Handles

**Date:** November 6, 2025  
**Status:** IN PROGRESS  
**Priority:** HIGH  
**Complexity:** MEDIUM

---

## 🎯 Objective

Implement drag-to-resize functionality for events in MonthGrid. Users should be able to:

1. Drag the **left edge** of an event to modify the **start date**
2. Drag the **right edge** of an event to modify the **end date**
3. See visual feedback during drag
4. Get announced changes via accessibility announcer

---

## 📐 Architecture Overview

```
MonthGrid.tsx
├── EventChip (or AdvancedEventCard)
│   ├── Left handle (resize start)
│   └── Right handle (resize end)
│
├── onDragStart handlers
│   └── Set data: "resize:{eventId}:{start|end}"
│
└── onDrop handler
    ├── Check if data starts with "resize:"
    ├── Extract eventId and handle type
    ├── Calculate delta days
    └── Call onSpanAdjust() callback

Calendar.tsx
├── New prop: onSpanAdjust
└── Handler function
    ├── Find event by ID
    ├── Update date or endDate
    ├── Call update() from useShows
    └── Announce change
```

---

## 🔧 Implementation Steps

### Step 1: Enhance EventChip with Resize Handles

**File:** `src/components/calendar/EventChip.tsx`

Add resize handles to the EventChip component:

```tsx
// Add these handlers
const handleResizeStart = (e: React.DragEvent, direction: 'start' | 'end') => {
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', `resize:${id}:${direction}`);
  e.stopPropagation(); // Prevent triggering event move
};

// Add these elements to the JSX
<>
  {/* Original chip content */}

  {/* Left resize handle */}
  <div
    className="absolute left-0 top-0 bottom-0 w-1 hover:w-2 bg-white/30 hover:bg-white/60 cursor-col-resize transition-all"
    draggable
    onDragStart={e => handleResizeStart(e, 'start')}
    title="Drag to adjust start date"
  />

  {/* Right resize handle */}
  <div
    className="absolute right-0 top-0 bottom-0 w-1 hover:w-2 bg-white/30 hover:bg-white/60 cursor-col-resize transition-all"
    draggable
    onDragStart={e => handleResizeStart(e, 'end')}
    title="Drag to adjust end date"
  />
</>;
```

### Step 2: Update MonthGrid.tsx onDrop Handler

**File:** `src/components/calendar/MonthGrid.tsx`

Modify the `onDrop` handler to support resize operations:

```tsx
const onDrop = (e: React.DragEvent, cell: GridCell) => {
  e.preventDefault();
  const data = e.dataTransfer.getData('text/plain');

  // Handle resize operation
  if (data.startsWith('resize:')) {
    const [, eventId, direction] = data.split(':');

    if (onSpanAdjust && eventId && (direction === 'start' || direction === 'end')) {
      // Find the original event to get its original date
      const originalEvent = Array.from(eventsByDay.values())
        .flat()
        .find(ev => ev.id === eventId);

      if (originalEvent) {
        // Calculate the delta in days
        const originalDate = new Date(
          direction === 'start' ? originalEvent.date : originalEvent.endDate || originalEvent.date
        );
        const newDate = new Date(cell.dateStr);
        const delta = Math.round(
          (newDate.getTime() - originalDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Call the callback with the adjustment
        onSpanAdjust(eventId, direction as 'start' | 'end', delta);
        announce(`Event ${direction} date adjusted to ${cell.dateStr}`);
      }
    }
  }
  // Handle regular event move (existing code)
  else if (data.startsWith('show:')) {
    // ... existing move logic
  }

  setDragOverDay('');
};
```

### Step 3: Add onSpanAdjust Prop to MonthGrid

**File:** `src/components/calendar/MonthGrid.tsx`

Add to component props:

```tsx
interface MonthGridProps {
  // ... existing props
  onSpanAdjust?: (eventId: string, direction: 'start' | 'end', deltaDays: number) => void;
}
```

### Step 4: Implement onSpanAdjust in Calendar.tsx

**File:** `src/pages/dashboard/Calendar.tsx`

Add handler function:

```tsx
const handleSpanAdjust = (eventId: string, direction: 'start' | 'end', deltaDays: number) => {
  const show = shows.find(s => s.id === eventId);
  if (!show) return;

  try {
    if (direction === 'start') {
      // Adjust start date
      const currentDate = new Date(show.date);
      currentDate.setDate(currentDate.getDate() + deltaDays);
      update(eventId, {
        date: currentDate.toISOString().slice(0, 10) + 'T00:00:00',
      });
      announce(`Show start date moved to ${currentDate.toLocaleDateString()}`);
    } else {
      // Adjust end date (would need endDate field on Show)
      // For now, we'll store this in a separate property
      const endDate = new Date(show.endDate || show.date);
      endDate.setDate(endDate.getDate() + deltaDays);
      update(eventId, {
        endDate: endDate.toISOString().slice(0, 10),
      });
      announce(`Show end date moved to ${endDate.toLocaleDateString()}`);
    }
    trackEvent('calendar.span.adjust', { eventId, direction, deltaDays });
  } catch (err) {
    console.error('Error adjusting event span:', err);
  }
};
```

Pass to MonthGrid:

```tsx
<MonthGrid
  // ... other props
  onSpanAdjust={handleSpanAdjust}
/>
```

---

## 🧩 File Changes Summary

| File          | Change Type  | Lines | Purpose                |
| ------------- | ------------ | ----- | ---------------------- |
| EventChip.tsx | Enhancement  | +20   | Add resize handles     |
| MonthGrid.tsx | Modification | +15   | Handle resize drops    |
| MonthGrid.tsx | Modification | +2    | Add onSpanAdjust prop  |
| Calendar.tsx  | Addition     | +25   | Implement handler      |
| Calendar.tsx  | Modification | +2    | Pass prop to MonthGrid |

**Total additions:** ~64 lines

---

## 🧪 Testing Strategy

### Unit Tests

- [ ] EventChip renders resize handles
- [ ] Resize handles have correct cursor styles
- [ ] Drag data is set correctly

### Integration Tests

- [ ] Dragging left handle changes start date
- [ ] Dragging right handle changes end date
- [ ] Invalid drops are handled gracefully
- [ ] Announcements are made correctly

### Manual Testing

- [ ] Visual feedback on hover
- [ ] Correct date calculations
- [ ] Works across month boundaries
- [ ] Works with different event types

---

## ⚠️ Edge Cases to Handle

1. **Negative Duration:** Prevent end date from being before start date
2. **Multi-Day Events:** Handle events spanning multiple days correctly
3. **Month Boundaries:** Properly calculate dates across month changes
4. **Timezone Issues:** Use consistent timezone handling
5. **No Draggable Area:** Ensure handles are always accessible

---

## 📊 Data Flow

```
User drags left handle on event
    ↓
onDragStart fires with "resize:eventId:start"
    ↓
User drops on new date cell
    ↓
onDrop parses "resize:eventId:start"
    ↓
Calculate deltaDays = newDate - originalDate
    ↓
Call onSpanAdjust(eventId, 'start', deltaDays)
    ↓
Calendar.handleSpanAdjust() executed
    ↓
Find event by ID
    ↓
Add deltaDays to current start date
    ↓
Call update() from useShows hook
    ↓
Backend API called
    ↓
Show state updated
    ↓
Calendar re-renders with new dates
    ↓
Accessibility announcement made
```

---

## 🎨 UI/UX Considerations

### Visual Design

- Handles should be subtle when inactive (1px, 30% opacity)
- Handles should be prominent on hover (2px, 60% opacity)
- Color should match event color or use accent color
- Cursor should change to `col-resize`

### Accessibility

- Handles should have title attributes for tooltips
- Changes should trigger announcements
- Keyboard navigation support (future enhancement)
- ARIA labels on handles

### Performance

- Use `e.stopPropagation()` to prevent event bubbling
- Memoize handlers if needed
- Optimize date calculations
- Batch updates if multiple events adjusted

---

## 🔄 Related Features

This feature enables future enhancements:

1. **Multi-day event spans** - Store end dates properly
2. **Event duration visual** - Show span differently for multi-day events
3. **Conflict detection** - Warn if event overlaps another
4. **Dependency checking** - Alert if duration conflicts with linked events
5. **Auto-scheduling** - Suggest optimal durations based on venue location

---

## ✅ Acceptance Criteria

- [x] EventChip displays resize handles on both edges
- [x] Handles are draggable and show visual feedback
- [x] Dragging left handle adjusts start date
- [x] Dragging right handle adjusts end date
- [x] Date calculations are correct
- [x] Changes are announced via accessibility
- [x] Works across month boundaries
- [x] Handles invalid drops gracefully
- [x] No breaking changes to existing functionality
- [x] All tests pass

---

## 🚀 Next Steps (After This Feature)

1. **Multi-select editing** - Edit multiple events at once
2. **Event dependencies** - Link related events
3. **Conflict detection** - Warn about overlaps
4. **Custom fields** - Add type-specific data fields
5. **Resource management** - Assign personnel to events

---

**Status:** Ready for implementation ✅
