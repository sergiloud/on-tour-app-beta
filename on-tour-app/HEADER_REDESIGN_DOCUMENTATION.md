# 🎨 Header Redesign - Dynamic & Contextual

## Overview

Completely redesigned the Show Editor modal header to be **more dynamic, contextual, and action-oriented**, providing users with:

- **Immediate identification** of the show being edited
- **Key context** (location, date, status) visible at all times
- **Quick access** to primary actions (Promote, Plan Travel, More)
- **Non-intrusive action menu** for secondary operations (Duplicate, Archive, Delete)

## Before → After

### Before

```
[Icon] Edit Show: Barcelona
   Country • Date • Status Badge (small, hard to see)

   [Status Badge] [Promote] [Duplicate] [Close]
```

### After

```
[Icon] Barcelona (Spain) • Nov 8, 2025 • CONFIRMED
   Primary Title: Show Name or City

   [Promote] [✈️ Plan Travel] [⋯ More] [Close]
   └─ Duplicate
   └─ Archive
   └─ Delete
```

## Key Improvements

### 1. **Title Now Shows the Most Important Info**

- **Before**: Generic "Edit Show: Barcelona"
- **After**: Show name (if available) or city name
- **Why**: Users immediately know which show they're editing without reading field values

### 2. **Context Row - Location • Date • Status**

- **Location**: City + Country code (compact)
- **Date**: Formatted as "Nov 8, 2025" (readable, not ISO)
- **Status**: Color-coded badge matching status color
- **Why**: All critical context visible without scrolling or tab switching

### 3. **Status-Colored Border**

- Top border color matches status (green for confirmed, blue for pending, etc.)
- **Why**: Visual reinforcement of show status at a glance

### 4. **Primary Actions in Header**

- **Promote**: Available for Offer/Pending status
  - Quick button to move show up the workflow (Offer → Pending → Confirmed)
  - Visible only when applicable
- **Plan Travel** (✈️): Opens travel planning
  - Only shows when date is set
  - Compact emoji icon
- **Why**: Most common actions right where users expect them

### 5. **More Actions Menu** (⋯)

- **Dropdown**: Appears on hover (non-intrusive)
- **Contents**:
  - **Duplicate**: Copy show details, clear date for new show
  - **Archive**: Move completed/past shows to archive
  - **Delete**: Remove show entirely
- **Why**: Secondary actions don't clutter header, still easily accessible
- **Only in Edit Mode**: Hidden when adding new shows

### 6. **Date Conflict Indicator**

- Pulsing warning icon appears next to title if date conflicts detected
- **Why**: Continuous visual reminder of scheduling issue

### 7. **Compact Layout**

- All elements fit in single header row
- Responsive: Actions adjust on smaller screens
- No wrapping or overflow
- **Why**: Professional, clean appearance

## Layout Structure

```
┌─ Header (status-colored top border) ───────────────────────────────┐
│                                                                      │
│  [Icon] Show Name         City (Country) • Date • Status [⚠️ Icon]  │
│          Location & Date Context Row (subtitle)                      │
│
│                                         [Promote] [✈️] [⋯] [✕]      │
│                                         Actions Buttons              │
│
├──────────────────────────────────────────────────────────────────────┤
│ [Details] [Finance] [Costs] Tab Navigation                          │
└─ Rest of Modal ────────────────────────────────────────────────────┘
```

## Color & Status System

### Status Badges (in header context row)

- **Confirmed**: Green (✓ ready to go)
- **Pending**: Blue (⏳ waiting for confirmation)
- **Offer**: Amber/Gold (💬 proposal sent)
- **Postponed**: Orange (🔄 rescheduled)
- **Canceled**: Red (✕ canceled)
- **Archived**: Slate/Gray (📦 historical)

### Border Colors (top border)

- Matches badge colors exactly for visual consistency

## Styling Details

### Title Area

- Font: `text-sm font-bold`
- Color: `text-white`
- Icon: Accent-colored (blue/teal)
- Icon size: `w-8 h-8`

### Context Row (Location • Date • Status)

- Font: `text-[10px] text-white/60`
- Status badge: `text-[9px] font-bold uppercase tracking-wide`
- Spacing: Single row, items separated by `•`
- Compact: All on one line, truncates if needed

### Action Buttons

- **Promote**: `px-2 py-1 bg-accent-500/20 border-accent-400/30`
- **Travel**: `px-2 py-1 bg-white/10 border-white/20`
- **Menu**: Standard icon button `p-1.5`
- **Close**: Standard icon button `p-1.5`
- Hover effects: `bg-*/30`, color transitions
- Focus ring: Standard accessibility focus outline

### More Actions Menu

- **Trigger**: Dots icon (⋯) button
- **Display**: Invisible until hover
- **Style**: Dark glass (`bg-neutral-900/95`)
- **Items**:
  - Duplicate: Icon + text, white text
  - Archive: Icon + text, white text (only if not archived)
  - Delete: Icon + text, red text (danger action)
- **Spacing**: `py-0.5` between items
- **Width**: `w-40` (fixed)

## Interactions

### Promote Button

```
Offer (show) → Click Promote
├─ Status changes to "Pending"
├─ Button now shows "Promote" again
└─ Next click: Pending → Confirmed

Confirmed (show) → Promote button hidden
```

### Plan Travel (✈️)

```
If date set → Click ✈️
├─ Calls onPlanTravel(date)
└─ Opens travel planning UI

If no date set → Button hidden
```

### More Menu

```
Hover on ⋯ button
├─ Dropdown appears with options
├─ Click Duplicate
│  ├─ Store draft to localStorage
│  ├─ Close modal
│  └─ Parent opens new show with copied data
│
├─ Click Archive
│  ├─ Set status to 'archived'
│  └─ Button hidden (already archived)
│
└─ Click Delete
   └─ Open delete confirmation dialog
```

### Close Button

```
Click ✕
├─ If dirty (unsaved changes)
│  └─ Show "Discard changes?" confirmation
└─ If no changes → Close immediately
```

## Responsive Behavior

### Desktop (≥1024px)

- All elements visible in header
- Actions aligned right: `[Promote] [✈️] [⋯] [✕]`

### Tablet (640px - 1023px)

- Location text may wrap to second line if long
- Context row remains readable
- All actions visible

### Mobile (<640px)

- Title may truncate
- Context shows essentials: City • Date • Status
- Actions stack/compress as needed
- Menu still functional

## Accessibility Features

- **Semantic HTML**: `<h3>` for title, proper button elements
- **ARIA Labels**: All icon buttons have `aria-label`
- **Focus Ring**: All buttons have proper focus indicators
- **Keyboard Navigation**: Tab through all buttons, Enter/Space to activate
- **Screen Reader**: Title, context, and button purposes announced
- **Color Contrast**: All text meets WCAG AA standards

## Use Cases

### ✅ Scenario 1: Edit Existing Confirmed Show

```
Header shows:
[Icon] Concert in Barcelona (Spain) • Nov 15, 2025 • CONFIRMED

Actions available:
[Promote] ← hidden (already confirmed)
[✈️] ← available for travel planning
[⋯] ← menu: Duplicate, Delete
```

### ✅ Scenario 2: Edit Pending Offer

```
Header shows:
[Icon] Festival Barcelona (Spain) • Dec 1, 2025 • OFFER

Actions available:
[Promote] ← shows "Promote" (can move to Pending)
[✈️] ← available for travel planning
[⋯] ← menu: Duplicate, Archive, Delete
```

### ✅ Scenario 3: Date Conflict Detected

```
Header shows:
[Icon] New Show [⚠️ PULSING] (Spain) • Nov 15, 2025 • PENDING

Plus:
- Warning banner in form
- Yellow/amber warning icon
- User can still save or change date
```

### ✅ Scenario 4: Create New Show (Add Mode)

```
Header shows:
[Icon] Add Show

Actions available:
[Promote] ← hidden (status not set yet)
[✈️] ← hidden (no date yet)
[⋯] ← hidden (not in edit mode)
[✕] ← Close button only
```

## Design Philosophy

1. **Information Hierarchy**: Most important info front and center (show name, location, date, status)
2. **Action Accessibility**: Common actions immediately visible, uncommon actions in menu
3. **Visual Feedback**: Status colors, pulsing indicators, hover effects guide user
4. **Compact Efficiency**: Everything needed in header without clutter or scrolling
5. **Contextual**: Actions only appear when applicable (Promote only for offer/pending)
6. **Non-Blocking**: Warnings inform but don't prevent workflow

## Future Enhancements

1. **Quick Edit Badge**: Click status badge to change status directly
2. **Fee Display**: Show fee next to date for quick reference
3. **Conflict Quick Fix**: Direct link from conflict indicator to date field
4. **Travel Warning**: Show if impossible travel detected (red icon)
5. **Pinned Shows**: Option to pin frequently-edited shows
6. **Keyboard Shortcuts**: Alt+P for Promote, Alt+T for Travel, Alt+D for Delete
7. **Custom Actions**: Allow users to add custom buttons to header
8. **Show History**: Link to show history/edit log

## Files Modified

1. **src/features/shows/editor/ShowEditorDrawer.tsx**
   - Completely redesigned header JSX (~150 lines)
   - Added More Actions dropdown menu
   - Improved context display
   - Status-colored badges in header
   - Responsive layout

## Build Status

✅ **All builds successful**

- No TypeScript errors
- No console warnings
- Full functionality preserved
- Ready for production

---

**Created**: 2025-11-08
**Status**: ✅ COMPLETE
**Impact**: Non-breaking, visual enhancement
**Compatibility**: All browsers, responsive design
