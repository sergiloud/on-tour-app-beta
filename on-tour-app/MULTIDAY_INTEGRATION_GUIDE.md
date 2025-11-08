# 📋 NEXT STEPS: Multi-Day Event Rendering Integration

**Current Status:** ✅ Foundation Complete  
**Build Status:** ✅ Passing  
**Test Status:** ✅ Passing

---

## 🎯 What Was Delivered This Session

✅ Fixed React forwardRef warning in EventChip.tsx  
✅ Refined EventResizeHandle with professional visual states  
✅ Updated MonthGrid with multi-day event separation logic  
✅ Created MultiDayEventStripe component for expanded rendering  
✅ All tests passing, build clean

---

## 🚀 To Complete Multi-Day Visual Expansion

Follow these steps in the next session to actually render the expanded multi-day bars:

### Step 1: Add MultiDayEventStripe Import & Rendering

In `MonthGrid.tsx`, find the section where we render single-day events and add a section BEFORE it to render multi-day events:

```tsx
// INSIDE the motion.div[role="gridcell"]
// Add this BEFORE the single-day events rendering

{
  /* Multi-day events spanning this cell */
}
{
  (() => {
    // Get all multi-day events that span this date
    const allEvents = Array.from(eventsByDay.values()).flat();
    const multiDaySpans = allEvents
      .filter(
        ev =>
          isMultiDayEvent(ev) &&
          new Date(ev.date) <= new Date(cell.dateStr) &&
          new Date(ev.endDate || ev.date) >= new Date(cell.dateStr)
      )
      .filter(
        (ev, idx, arr) => idx === 0 || ev.id !== arr[idx - 1].id // Only first occurrence per event
      );

    return multiDaySpans.map(ev => {
      const eventStart = new Date(ev.date);
      const eventEnd = new Date(ev.endDate || ev.date);

      // Calculate span
      const spanStart = eventStart < new Date(cell.dateStr) ? new Date(cell.dateStr) : eventStart;
      const spanEnd = new Date(cell.dateStr);
      const spanDays =
        Math.floor((eventEnd.getTime() - spanStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      return (
        <MultiDayEventStripe
          key={`${ev.id}-multiday`}
          event={ev}
          startDate={cell.dateStr}
          endDate={ev.endDate || ev.date}
          spanDays={spanDays}
          isSpanStart={eventStart.toDateString() === new Date(cell.dateStr).toDateString()}
          isSpanEnd={eventEnd.toDateString() === new Date(cell.dateStr).toDateString()}
          dayWidth={100} // Adjust based on actual cell width
          onOpen={() => onOpen(ev)}
          onResizeStart={(e, dir) => {
            e.dataTransfer!.effectAllowed = 'move';
            e.dataTransfer!.setData('text/plain', `resize:${ev.id}:${dir}`);
            e.stopPropagation();
          }}
          isSelected={selectedEventIds.has(ev.id)}
          onMultiSelect={selected => onMultiSelectEvent?.(ev.id, selected)}
        />
      );
    });
  })();
}
```

### Step 2: Calculate Proper Day Width

The `dayWidth` prop in MultiDayEventStripe needs to be calculated from actual CSS measurements:

```tsx
// Add this state near top of MonthGrid
const [cellDimensions, setCellDimensions] = React.useState({ width: 100, height: 100 });

// Add this ref to the grid container
const cellSampleRef = useRef<HTMLDivElement | null>(null);

// Add this useEffect to measure
useEffect(() => {
  if (cellSampleRef.current) {
    const rect = cellSampleRef.current.getBoundingClientRect();
    setCellDimensions({
      width: Math.floor(rect.width),
      height: Math.floor(rect.height),
    });
  }
}, [grid]);
```

### Step 3: Position MultiDayEventStripe Correctly

The component needs CSS positioning adjustments. Update its styling in MultiDayEventStripe.tsx:

```tsx
// Inside the motion.div
style={{
  width: `calc(${dayWidth}px * ${spanDays})`,
  left: 0, // Position at start of first cell
  pointerEvents: 'auto',
}}
```

### Step 4: Handle Resize for Multi-Day Events

The resize handlers in EventChip should work automatically since they pass `resize:${id}:${direction}` data, which MonthGrid already handles in `handleCellDrop`.

Just ensure MultiDayEventStripe receives the resize callbacks:

```tsx
// Already in the pattern:
onResizeStart={(e, dir) => {
  e.dataTransfer!.effectAllowed = 'move';
  e.dataTransfer!.setData('text/plain', `resize:${ev.id}:${dir}`);
}}
```

### Step 5: Test & Iterate

After adding the rendering logic:

1. Create a test event spanning multiple days:
   - Open calendar
   - Create event on day 1
   - Manually set `endDate` in database to day 5
   - Should see bar spanning 5 days

2. Test resize:
   - Drag start handle → event should adjust and animate
   - Drag end handle → event should expand/contract
   - Sound feedback should play
   - Visual feedback should appear

3. Test edge cases:
   - Event starting before visible month
   - Event ending after visible month
   - Event spanning entire visible week
   - Multiple overlapping multi-day events

---

## 🔧 Additional Refinements Needed

### 1. Visual Stacking (Overlap Prevention)

If multiple multi-day events overlap on the same row, they should stack vertically:

```tsx
// Use row property from calculateEventSpans
style={{
  top: `${event.row * 28}px`, // 28px per row (6rem height)
}}
```

### 2. Color Distinction

Multi-day bars should be visually distinct from single-day chips:

```tsx
// In MultiDayEventStripe, wrap EventChip with a special container
<div className="rounded-none">
  {' '}
  {/* Override EventChip roundness */}
  <EventChip {...props} />
</div>
```

### 3. Truncation Handling

For very long events spanning many weeks, consider truncation indicator:

```tsx
// At right edge if event continues
{
  !isSpanEnd && <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l" />;
}
```

---

## 📚 Reference Files

**Key Components:**

- `src/components/calendar/MonthGrid.tsx` - Main grid, event rendering
- `src/components/calendar/EventChip.tsx` - Individual event display
- `src/components/calendar/EventResizeHandle.tsx` - Drag handles
- `src/components/calendar/MultiDayEventStripe.tsx` - Multi-day bar (NEW)

**Utilities:**

- `src/lib/eventSpanCalculator.ts` - Span calculations
- `src/lib/shows.ts` - Show/event type definition (has endDate field)

**Related:**

- `src/pages/dashboard/Calendar.tsx` - Calendar page, handleSpanAdjust
- `src/hooks/useSoundFeedback.ts` - Audio feedback

---

## 💡 Tips for Implementation

1. **Start Small:** First get basic rendering working without positioning
2. **Then Position:** Use grid positioning to place bars correctly
3. **Test Frequently:** Build and test after each step
4. **Use DevTools:** Inspect element to verify CSS positioning
5. **Console Logs:** Add logs to track span calculations

---

## ❓ Common Issues & Solutions

**Issue:** Multi-day bars not appearing  
**Solution:** Check if `isMultiDayEvent()` is correctly detecting events with endDate

**Issue:** Bars misaligned  
**Solution:** Verify `dayWidth` calculation matches actual CSS grid cell width

**Issue:** Events overlap incorrectly  
**Solution:** Implement row-based stacking using `calculateEventSpans().row` property

**Issue:** Resize not working on bars  
**Solution:** Ensure EventChip inside MultiDayEventStripe receives `onResizeStart` prop

---

## ✅ Acceptance Criteria for Completion

- [ ] Multi-day events render as continuous bars (not repeated per day)
- [ ] Bars correctly span multiple calendar cells
- [ ] Bars have proper rounded corners (left on start, right on end)
- [ ] Resize handles work for multi-day events
- [ ] Events can be dragged to new dates
- [ ] Visual feedback shows current resize state
- [ ] Audio feedback plays on drop
- [ ] No console warnings or errors
- [ ] Tests still passing
- [ ] Mobile responsive design maintained

---

## 🎯 Timeline Estimate

- Rendering logic: **30 minutes**
- Positioning fixes: **20 minutes**
- Testing & debugging: **30 minutes**
- Polish & edge cases: **20 minutes**

**Total:** ~2 hours for full implementation

---

**Last Session:** November 6, 2025  
**Status:** Foundation Complete, Ready for Integration
