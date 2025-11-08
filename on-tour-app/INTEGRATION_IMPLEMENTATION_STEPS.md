# Calendar Integration Implementation Steps

## Overview

This document provides step-by-step instructions for integrating all Phase 3 and Phase 4 calendar improvements into the main Calendar application.

---

## STEP 1: Update Calendar.tsx - Add Imports

**File:** `src/pages/dashboard/Calendar.tsx`

**Add these imports at the top of the file:**

```typescript
// Enhanced Calendar UI Components (Phase 4)
import { EnhancedMonthHeader, EnhancedStatsPanel } from '@/components/calendar/EnhancedCalendarUI';

// Global UI Enhancements
import {
  CalendarUIEnhancements,
  CalendarButton,
} from '@/components/calendar/CalendarUIEnhancements';

// Theme System
import {
  ThemeProvider,
  ThemeSwitcher,
  type CalendarThemeName,
} from '@/components/calendar/CalendarThemes';
```

---

## STEP 2: Add Theme State Management

**In the Calendar component function, add after existing state declarations:**

```typescript
// Theme state
const [currentTheme, setCurrentTheme] = useState<CalendarThemeName>('professional');

// Persist theme to localStorage
useEffect(() => {
  try {
    localStorage.setItem('calendar:theme', currentTheme);
  } catch (error) {
    console.warn('Failed to save theme preference', error);
  }
}, [currentTheme]);

// Load theme from localStorage on mount
useEffect(() => {
  try {
    const saved = localStorage.getItem('calendar:theme') as CalendarThemeName | null;
    if (saved) {
      setCurrentTheme(saved);
    }
  } catch (error) {
    console.warn('Failed to load theme preference', error);
  }
}, []);
```

---

## STEP 3: Calculate Statistics

**Add this useMemo hook for stats calculation:**

```typescript
const stats = useMemo(() => {
  const confirmedCount = shows.filter(s => s.status === 'confirmed').length;
  const pendingCount = shows.filter(s => s.status === 'pending').length;
  const totalRevenue = shows.reduce((sum, s) => sum + (s.fee || 0), 0);

  return [
    {
      label: 'Total Shows',
      value: shows.length,
      icon: '🎭',
      color: 'blue' as const,
      trend: 'up' as const,
    },
    {
      label: 'Confirmed',
      value: confirmedCount,
      icon: '✅',
      color: 'green' as const,
    },
    {
      label: 'Pending',
      value: pendingCount,
      icon: '⏳',
      color: 'amber' as const,
    },
    {
      label: 'Total Revenue',
      value: `€${(totalRevenue / 1000).toFixed(1)}k`,
      icon: '💰',
      color: 'purple' as const,
      trend: 'up' as const,
    },
  ];
}, [shows]);
```

---

## STEP 4: Update Component Return - Wrap with Theme Provider

**Replace the entire return statement with:**

```typescript
return (
  <ThemeProvider theme={currentTheme}>
    <CalendarUIEnhancements enableAnimations={true} enableHeatmap={heatmapMode !== 'none'}>
      <div className="space-y-6 p-6">
        {/* Header with Month Navigation and Theme Switcher */}
        <div className="flex justify-between items-center">
          <EnhancedMonthHeader
            monthName={new Date(year, month - 1).toLocaleString(lang, {
              month: 'long',
              year: 'numeric'
            })}
            year={year}
            onPrev={onPrev}
            onNext={onNext}
            onToday={goToday}
          />
          <ThemeSwitcher
            currentTheme={currentTheme}
            onThemeChange={setCurrentTheme}
          />
        </div>

        {/* Statistics Panel */}
        <EnhancedStatsPanel stats={stats} />

        {/* Calendar Toolbar */}
        <CalendarToolbar
          view={view}
          onViewChange={setView}
          onAddShow={onAddShow}
          heatmapMode={heatmapMode}
          onHeatmapMode={onHeatmapMode}
          weekStartsOn={weekStartsOn}
          onWeekStartsOnChange={onWeekStartsOn}
        />

        {/* Calendar Grids */}
        {view === 'month' && (
          <MonthGrid
            year={year}
            month={month}
            shows={shows}
            eventsByDay={eventsByDay}
            onOpen={onOpen}
            today={today}
            heatmapMode={heatmapMode}
            cursor={cursor}
            onOpenDay={onOpenDay}
          />
        )}
        {view === 'week' && (
          <WeekGrid
            year={year}
            month={month}
            shows={shows}
            dayOfWeek={cursor.getDay()}
            weekStartsOn={weekStartsOn}
            onOpen={onOpen}
          />
        )}
        {view === 'day' && (
          <DayGrid
            date={cursor}
            shows={shows}
            onOpen={onOpen}
          />
        )}
        {view === 'agenda' && (
          <AgendaList
            shows={shows}
            onOpen={onOpen}
          />
        )}
      </div>
    </CalendarUIEnhancements>
  </ThemeProvider>
);
```

---

## STEP 5: Update MonthGrid.tsx - Replace Day Cells

**File:** `src/components/calendar/MonthGrid.tsx`

**Add these imports:**

```typescript
import { EnhancedDayCell, EnhancedEventChip } from './EnhancedCalendarUI';
```

**Add this helper function:**

```typescript
const calculateHeatmapIntensity = (
  dateStr: string,
  eventsByDay: Map<string, any[]>,
  heatmapMode: string
): number => {
  if (heatmapMode === 'none') return 0;

  const events = eventsByDay.get(dateStr) || [];
  if (events.length === 0) return 0;

  if (heatmapMode === 'financial') {
    const revenue = events
      .filter(e => e.kind === 'show')
      .reduce((sum, e) => sum + ((e as any).fee || 0), 0);
    const maxRevenue = 10000;
    return Math.min((revenue / maxRevenue) * 100, 100);
  }

  if (heatmapMode === 'activity') {
    const maxEvents = 5;
    return Math.min((events.length / maxEvents) * 100, 100);
  }

  return 0;
};
```

**In the day cell rendering loop, REPLACE the existing day button with:**

```typescript
<EnhancedDayCell
  key={dateStr}
  date={dateStr}
  dayNumber={parseInt(dateStr.slice(8))}
  isToday={dateStr === today}
  isCurrentMonth={inMonth}
  isWeekend={weekend}
  eventsCount={(eventsByDay.get(dateStr) || []).length}
  heatmapIntensity={calculateHeatmapIntensity(dateStr, eventsByDay, heatmapMode)}
  onClick={() => onOpenDay?.(dateStr)}
/>
```

**In the event chip rendering, REPLACE with:**

```typescript
{(eventsByDay.get(dateStr) || []).slice(0, 3).map(event => (
  <EnhancedEventChip
    key={event.id}
    title={event.title}
    status={event.status}
    type={event.kind}
    color={event.color}
    duration={event.spanLength}
    pinned={event.pinned}
    onClick={() => onOpen(event)}
  />
))}
```

---

## STEP 6: Update CalendarToolbar.tsx - Replace Buttons

**File:** `src/components/calendar/CalendarToolbar.tsx`

**Add import:**

```typescript
import { CalendarButton } from './CalendarUIEnhancements';
```

**Replace all button elements with CalendarButton:**

```typescript
// Example replacements:
<CalendarButton
  variant="primary"
  size="md"
  onClick={onAddShow}
>
  Add Event
</CalendarButton>

<CalendarButton
  variant="secondary"
  size="sm"
  onClick={() => onViewChange('month')}
  className={view === 'month' ? 'ring-2' : ''}
>
  Month
</CalendarButton>

<CalendarButton
  variant="subtle"
  size="sm"
  onClick={() => onViewChange('week')}
  className={view === 'week' ? 'ring-2' : ''}
>
  Week
</CalendarButton>

<CalendarButton
  variant="subtle"
  size="sm"
  onClick={() => onViewChange('day')}
  className={view === 'day' ? 'ring-2' : ''}
>
  Day
</CalendarButton>

<CalendarButton
  variant="subtle"
  size="sm"
  onClick={() => onViewChange('agenda')}
  className={view === 'agenda' ? 'ring-2' : ''}
>
  Agenda
</CalendarButton>
```

---

## STEP 7: Implement EnhancedEventChip in EventChip.tsx

**File:** `src/components/calendar/EventChip.tsx`

You have two options:

### Option A: Replace EventChip.tsx entirely

Replace the file with EnhancedEventChip from EnhancedCalendarUI.tsx

### Option B: Extend existing EventChip

Enhance the existing EventChip component with animations and improved styling from EnhancedEventChip.

---

## STEP 8: Add EnhancedTimeSlot to DayGrid

**File:** `src/components/calendar/DayGrid.tsx`

**Add import:**

```typescript
import { EnhancedTimeSlot } from './EnhancedCalendarUI';
```

**In time slot rendering, wrap with EnhancedTimeSlot:**

```typescript
{hours.map(hour => (
  <EnhancedTimeSlot
    key={hour}
    time={`${String(hour).padStart(2, '0')}:00`}
    isCurrentTime={isCurrentHour(hour)}
  >
    {/* Event rendering for this hour */}
  </EnhancedTimeSlot>
))}
```

---

## STEP 9: Add EnhancedWeekdayHeader to Grids

**For MonthGrid and WeekGrid:**

```typescript
import { EnhancedWeekdayHeader } from './EnhancedCalendarUI';

// In render:
<div className="grid grid-cols-7 gap-2 mb-4">
  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
    <EnhancedWeekdayHeader
      key={day}
      day={day}
      isWeekend={idx > 4}
    />
  ))}
</div>
```

---

## STEP 10: Integration Testing Checklist

Before deployment, verify:

- [ ] All 6 themes render correctly (professional, vibrant, minimal, dark, nature, ocean)
- [ ] Animations are smooth (60 FPS) on month/week/day views
- [ ] Stats panel updates when shows are added/removed
- [ ] Theme preference persists after refresh
- [ ] Mobile responsive design works correctly
- [ ] Heatmap displays correctly with financial and activity modes
- [ ] Enhanced buttons respond to clicks
- [ ] Event chips display correctly
- [ ] Day cells highlight on hover
- [ ] Month header navigation works
- [ ] No console errors in browser DevTools

---

## STEP 11: Build and Deploy

```bash
# Build the application
npm run build

# If build succeeds, you can deploy
# Verify no TypeScript errors
npm run type-check

# Run tests if available
npm run test
```

---

## Summary

**Files to Modify:**

1. `src/pages/dashboard/Calendar.tsx` - Main component wrapping
2. `src/components/calendar/MonthGrid.tsx` - Day cell and event chip replacement
3. `src/components/calendar/CalendarToolbar.tsx` - Button replacement
4. `src/components/calendar/DayGrid.tsx` - Time slot enhancement (optional)
5. `src/components/calendar/EventChip.tsx` - Event chip enhancement (optional)

**New Files Used (Read-Only):**

1. `src/components/calendar/EnhancedCalendarUI.tsx` - Enhanced components
2. `src/components/calendar/CalendarUIEnhancements.tsx` - Global enhancements
3. `src/components/calendar/CalendarThemes.tsx` - Theme system

**Expected Results:**

- ✅ Modern, professional calendar interface
- ✅ 6 selectable color themes
- ✅ Smooth animations and transitions
- ✅ Enhanced statistics panel
- ✅ Improved event visibility
- ✅ Responsive design across devices
