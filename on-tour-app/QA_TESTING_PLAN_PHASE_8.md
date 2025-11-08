# QA Testing Plan - Dashboard Modernization Phase 8

## Testing Phases Overview

### Phase 1: Smoke Testing (Immediate)

**Objective**: Verify all pages load without critical errors
**Duration**: 30 minutes

#### Test Cases

1. **Calendar Page Load**
   - ✓ Navigate to `/dashboard/calendar`
   - ✓ Verify all calendar views load (month, week, day, agenda, timeline)
   - ✓ Confirm animations run smoothly
   - ✓ Check responsive layout (mobile, tablet, desktop)

2. **Shows Page Load**
   - ✓ Navigate to `/dashboard/shows`
   - ✓ Verify stats panel displays (5 KPI cards)
   - ✓ Confirm quick filters render
   - ✓ Test bulk actions availability
   - ✓ Check responsive design

3. **Finance Page Load**
   - ✓ Navigate to `/dashboard/finance`
   - ✓ Verify section navigation works
   - ✓ Confirm KPI cards display
   - ✓ Test period selector
   - ✓ Check responsive layout

### Phase 2: Cross-Page Navigation Testing

**Objective**: Verify seamless navigation between dashboard pages
**Duration**: 45 minutes

#### Test Cases

1. **Navigation Flow**
   - ✓ Calendar → Shows → Finance → Calendar
   - ✓ Verify state preservation
   - ✓ Check browser back/forward button
   - ✓ Confirm URL updates correctly
   - ✓ Test URL deep-linking

2. **Route Protection**
   - ✓ Verify access control (read-only users)
   - ✓ Test permission-based UI hiding
   - ✓ Confirm guarded actions work

### Phase 3: Responsive Design Testing

**Objective**: Verify layouts work across all device sizes
**Duration**: 60 minutes

#### Breakpoints to Test

1. **Mobile (320px - 640px)**
   - ✓ Shows.tsx: Stats cards stack to 2 columns
   - ✓ Finance.tsx: Section nav becomes collapsible
   - ✓ Calendar.tsx: Month view becomes scrollable
   - ✓ All buttons maintain accessibility
   - ✓ Text remains readable (no overflow)

2. **Tablet (641px - 1024px)**
   - ✓ Shows.tsx: Stats cards display 3-4 columns
   - ✓ Finance.tsx: Better layout for landscape
   - ✓ Calendar.tsx: Balanced view
   - ✓ Touch targets properly sized (>44px)

3. **Desktop (1025px+)**
   - ✓ Shows.tsx: Full 5-column grid
   - ✓ Finance.tsx: Complete section display
   - ✓ Calendar.tsx: Optimal spacing

#### Testing Tools

- Chrome DevTools device emulation
- Safari device previews
- Firefox responsive design mode
- Physical device testing if available

### Phase 4: Animation Performance Testing

**Objective**: Verify animations run smoothly at 60fps
**Duration**: 45 minutes

#### Performance Metrics

1. **Chrome DevTools Profiling**
   - ✓ Record 10 seconds of shows page interaction
   - ✓ Check FPS (target: 55+ fps average)
   - ✓ Verify no dropped frames during animations
   - ✓ Monitor CPU usage (<30% for animations)
   - ✓ Check memory usage (no leaks)

2. **Animation Specific Tests**
   - ✓ Stats card hover animations (spring effect)
   - ✓ Quick filter button animations
   - ✓ Bulk action button transitions
   - ✓ Header fade-in on page load
   - ✓ Modal/drawer open/close animations

3. **Core Web Vitals**
   - ✓ LCP (Largest Contentful Paint): <2.5s
   - ✓ FID (First Input Delay): <100ms
   - ✓ CLS (Cumulative Layout Shift): <0.1

#### Tools

- Chrome DevTools Performance tab
- Lighthouse
- WebPageTest
- React Profiler (DevTools)

### Phase 5: Accessibility Testing

**Objective**: Verify WCAG 2.1 AA compliance
**Duration**: 60 minutes

#### Automated Testing

1. **axe DevTools**
   - ✓ Run on all three pages
   - ✓ Fix any violations (Priority 1-2)
   - ✓ Document limitations for Priority 3

2. **Lighthouse Accessibility Audit**
   - ✓ Target score: 90+
   - ✓ Review all recommendations
   - ✓ Fix high-impact issues

#### Manual Testing

1. **Keyboard Navigation**
   - ✓ Tab through all interactive elements
   - ✓ Verify focus indicators visible
   - ✓ Test Enter/Space activating buttons
   - ✓ Test Escape closing modals
   - ✓ Verify logical tab order

2. **Screen Reader Testing** (NVDA on Windows / VoiceOver on Mac)
   - ✓ All page sections announced
   - ✓ Form labels associated with inputs
   - ✓ Button purposes clear
   - ✓ Status updates announced
   - ✓ Errors described clearly

3. **Color Contrast**
   - ✓ Text on backgrounds (4.5:1 minimum)
   - ✓ UI components (3:1 minimum)
   - ✓ Glassmorphism overlays readable
   - ✓ Use axe or WebAIM contrast checker

### Phase 6: Browser Compatibility Testing

**Objective**: Verify functionality across browsers
**Duration**: 60 minutes

#### Browsers to Test

1. **Chrome/Edge (Latest)**
   - ✓ Full feature test
   - ✓ Animation rendering
   - ✓ CSS features support

2. **Firefox (Latest)**
   - ✓ Layout verification
   - ✓ Animation smoothness
   - ✓ Backdrop-filter support

3. **Safari (macOS & iOS)**
   - ✓ Layout on Safari
   - ✓ iOS-specific touch gestures
   - ✓ iOS viewport behavior

#### Feature Compatibility

- ✓ CSS backdrop-filter (graceful degradation)
- ✓ CSS gradients
- ✓ Framer Motion animations
- ✓ Web APIs (localStorage, drag-and-drop)

### Phase 7: Data & Error State Testing

**Objective**: Verify error handling and edge cases
**Duration**: 60 minutes

#### Shows.tsx Tests

1. **Empty State**
   - ✓ No shows in system
   - ✓ Stats show 0 values
   - ✓ Filters display properly
   - ✓ Empty message shows

2. **Filter Edge Cases**
   - ✓ All shows filtered out
   - ✓ Single show remains
   - ✓ Date range with no matches
   - ✓ Fee range with no matches

3. **Bulk Operations**
   - ✓ Select all, delete (with confirmation)
   - ✓ Bulk status change
   - ✓ Export with different column combinations
   - ✓ Error handling (permission denied)

#### Finance.tsx Tests

1. **No Data State**
   - ✓ No shows confirmed
   - ✓ No expenses entered
   - ✓ Stats show N/A or 0

2. **Period States**
   - ✓ Open month normal flow
   - ✓ Closed month prevents edits
   - ✓ Reopen month works

#### Calendar.tsx Tests

1. **Edge Dates**
   - ✓ Month boundaries
   - ✓ Year boundaries
   - ✓ Leap years
   - ✓ Multi-day events spanning months

### Phase 8: Visual Regression Testing

**Objective**: Verify visual design consistency
**Duration**: 90 minutes

#### Screenshots to Compare

1. **Shows.tsx**
   - ✓ Header section
   - ✓ Stats panel
   - ✓ Quick filters
   - ✓ Bulk action toolbar
   - ✓ Table view
   - ✓ Board view

2. **Finance.tsx**
   - ✓ Page header
   - ✓ Each section (7 total)
   - ✓ KPI cards
   - ✓ Period selector

3. **Calendar.tsx**
   - ✓ Month view
   - ✓ Week view
   - ✓ Day view
   - ✓ Agenda view
   - ✓ Toolbar

#### Tools & Approach

- **Percy.io** (cloud-based visual testing)
  - Automated visual regression detection
  - Cross-browser screenshot comparison
  - Baseline management

- **BackstopJS** (local alternative)
  - Self-hosted visual regression testing
  - Git-based configuration
  - Batch processing capability

- **Manual Pixel-Perfect Review**
  - Spacing verification (grids, padding, margins)
  - Font rendering consistency
  - Color accuracy
  - Shadow/glass effect appearance

### Phase 9: Performance Load Testing

**Objective**: Verify performance under load
**Duration**: 45 minutes

#### Scenarios

1. **Large Dataset Shows**
   - ✓ Load 500 shows
   - ✓ Load 1000 shows
   - ✓ Verify virtual scrolling works
   - ✓ Check filter performance
   - ✓ Monitor memory usage

2. **Complex Finance Data**
   - ✓ Multi-region analysis
   - ✓ Pivot analysis with 100+ data points
   - ✓ Trend analysis multi-year
   - ✓ Export large dataset

3. **Animation Load**
   - ✓ Rapid page switching
   - ✓ Multiple modals open
   - ✓ Heavy animation sequences
   - ✓ Check CPU/Memory spikes

#### Tools

- Chrome DevTools Network Throttling
- Lighthouse Performance Audit
- Jest/Vitest benchmarks (optional)

### Phase 10: User Interaction Testing

**Objective**: Verify expected user workflows
**Duration**: 90 minutes

#### Shows Workflow

1. **Add Show Flow**
   - ✓ Click add button
   - ✓ Fill form
   - ✓ Submit
   - ✓ Verify in list
   - ✓ Undo/modify

2. **Bulk Confirm Flow**
   - ✓ Select multiple shows
   - ✓ Click confirm
   - ✓ Verify status updates
   - ✓ Deselect all

3. **Export Flow**
   - ✓ Select columns
   - ✓ Export CSV
   - ✓ Export XLSX
   - ✓ Verify file contents

#### Finance Workflow

1. **Section Navigation**
   - ✓ Click different sections
   - ✓ Verify content changes
   - ✓ Check keyboard shortcuts (Ctrl+1-7)

2. **Period Management**
   - ✓ Close current period
   - ✓ Verify UI changes
   - ✓ Reopen period
   - ✓ Verify edits re-enabled

#### Calendar Workflow

1. **Event Management**
   - ✓ Create event
   - ✓ Edit event
   - ✓ Delete event
   - ✓ Drag-and-drop between days

## Test Execution Schedule

### Week 1: Smoke & Navigation

- Day 1-2: Smoke testing
- Day 3-4: Cross-page navigation
- Day 5: Buffer/fixes

### Week 2: Responsive & Performance

- Day 1-2: Responsive design testing
- Day 3-4: Animation performance
- Day 5: Buffer/optimization

### Week 3: Accessibility & Compatibility

- Day 1-2: Accessibility audit
- Day 3-4: Browser compatibility
- Day 5: Buffer/fixes

### Week 4: Regression & Load Testing

- Day 1-2: Visual regression
- Day 3-4: Performance load testing
- Day 5: User workflows & final validation

## Success Criteria

### Must Have (Blocking Release)

- ✓ No critical JavaScript errors in console
- ✓ All pages load within 3 seconds
- ✓ Navigation works across all pages
- ✓ Responsive design functional on mobile
- ✓ No accessibility violations (Level A)
- ✓ Chrome/Firefox/Safari support

### Should Have (Important)

- ✓ 60fps animations
- ✓ WCAG 2.1 AA compliance
- ✓ LCP <2.5s
- ✓ CLS <0.1
- ✓ 90+ Lighthouse score
- ✓ All hover states work

### Nice to Have (Enhancement)

- ✓ 95+ Lighthouse score
- ✓ LCP <1.5s
- ✓ 100% visual regression match
- ✓ Edge/IE11 support
- ✓ Performance budget <300KB

## Defect Tracking Template

```
Title: [Component] Issue description
Severity: Critical | High | Medium | Low
Browser: Chrome | Firefox | Safari | Edge
Device: Desktop | Tablet | Mobile
Steps to Reproduce:
1. ...
2. ...
Expected: ...
Actual: ...
Screenshot: [attach]
```

## Sign-Off Checklist

- [ ] All smoke tests passed
- [ ] Cross-page navigation verified
- [ ] Responsive design confirmed (3+ breakpoints)
- [ ] Animation performance validated (60fps)
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Browser compatibility confirmed (3+ browsers)
- [ ] Visual regression approved
- [ ] Load testing completed
- [ ] User workflows validated
- [ ] Performance metrics within targets
- [ ] Documentation updated
- [ ] Ready for production deployment

---

**QA Lead**: [To be assigned]
**Start Date**: [To be scheduled]
**Target Completion**: [2 weeks]
**Sign-Off Date**: [TBD]
