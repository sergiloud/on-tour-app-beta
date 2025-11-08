# UI Refactorization Implementation Plan

**Status**: In Progress  
**Target Completion**: Session completion  
**Files Modified**: ~15-20  
**Estimated Changes**: ~2000+ lines

---

## Phase 1: Finance Module Refactorization

### Files to Modify:

1. `src/components/finance/v2/KpiBar.tsx` - Already uses KpiCards (good pattern)
2. `src/components/finance/KpiCards.tsx` - Update card styling consistency
3. `src/components/finance/v2/FinanceV2.tsx` - Update header, buttons, spacing
4. `src/components/finance/v2/PLTable.tsx` - Unify table styling
5. `src/components/finance/NetTimeline.tsx` - Add consistent card styling
6. `src/components/finance/StatusBreakdown.tsx` - Unify item styling
7. `src/components/finance/Pipeline.tsx` - Update button and spacing
8. `src/pages/dashboard/Finance.tsx` - Already good, minor refinements

### Key Changes:

- Ensure KPI cards use consistent glass container + p-4 + border-white/10
- Apply consistent button styling (primary: accent-500, secondary: glass, ghost: text-only)
- Update input fields: `bg-white/5 border-white/10` → add focus ring consistency
- Table headers: `text-xs font-semibold uppercase tracking-wider text-white/70`
- Add aria-labels to all icon buttons and filter controls
- Ensure responsive: grid-cols-1 sm:grid-cols-2 lg:grid-cols-N + gap-4

### a11y Improvements:

- ✅ Add `aria-label` to filter buttons
- ✅ Add `focus-ring` class to all form inputs
- ✅ Update button ARIA attributes (aria-expanded, aria-haspopup)
- ✅ Verify color contrast in status badges

---

## Phase 2: Travel Module Refactorization

### Files to Modify:

1. `src/pages/dashboard/TravelV2.tsx` - Add consistent header styling
2. `src/components/travel/AddFlightModal.tsx` - Update form styling
3. `src/components/travel/FlightSearchModal.tsx` - Update modal structure
4. `src/components/travel/FlightCard.tsx` (if exists) - Apply consistent card pattern

### Key Changes:

- Create consistent page header matching Finance/Shows style
- Update search form: use standard input styling from pattern guide
- Flight cards: use glass container + consistent spacing
- Tab controls: apply consistent styling (active: accent-500, inactive: glass)
- Add form labels with semantic HTML
- Filter buttons: glass border style

### a11y Improvements:

- ✅ Add `aria-label` to search inputs
- ✅ Add `aria-expanded` to modal triggers
- ✅ Add `tabindex` management for tab controls
- ✅ Form labels: wrap inputs properly with `<label>` elements

---

## Phase 3: Calendar Module Refactorization

### Files to Modify:

1. `src/pages/dashboard/Calendar.tsx` - Update toolbar and header
2. `src/components/calendar/CalendarToolbar.tsx` - Consistent button styling
3. `src/components/calendar/MonthGrid.tsx` - Event styling consistency
4. `src/components/calendar/WeekGrid.tsx` - Similar updates
5. `src/components/calendar/DayGrid.tsx` - Similar updates

### Key Changes:

- Page header: consistent styling with other pages
- Toolbar buttons: primary (accent-500), secondary (glass)
- Event colors: verify status color consistency
- Date input modals: use standard form styling
- Filter controls: glass + border-white/10 pattern

### a11y Improvements:

- ✅ Add `aria-label` to date navigation buttons
- ✅ Verify calendar grid has proper ARIA attributes
- ✅ Add `role="dialog"` to date picker modals
- ✅ Ensure keyboard navigation through calendar

---

## Phase 4: Settings Module Refactorization

### Files to Modify:

1. `src/pages/dashboard/Settings.tsx` - Main page structure
2. `src/pages/org/OrgMembers.tsx` - Update card styling
3. `src/pages/org/OrgTeams.tsx` - Update card styling
4. `src/pages/org/OrgBranding.tsx` - Update form fields
5. `src/pages/org/OrgIntegrations.tsx` - Update card styling
6. `src/pages/org/OrgBilling.tsx` - Update card styling

### Key Changes:

- Organize sections into glass containers with consistent p-4 padding
- Apply consistent tab styling (current: accent-500/text-accent-500, inactive: text-white/70)
- Form inputs: consistent `bg-white/5 border-white/10` + focus ring
- Toggle switches: add aria-labels
- Buttons: primary (accent), secondary (glass)
- Section headers: use consistent title styling

### a11y Improvements:

- ✅ Add `aria-selected` to active tabs
- ✅ Add `aria-label` to all toggle switches and buttons
- ✅ Ensure proper label-input associations
- ✅ Add focus management for tab panels

---

## Phase 5: Component Library Enhancements

### Files to Create/Update:

1. `src/ui/FormField.tsx` (new) - Wrapper for label + input with consistent styling
2. `src/ui/TabList.tsx` (new) - Reusable tab component
3. `src/ui/Select.tsx` (update) - Ensure consistent styling
4. `src/ui/Button.tsx` (verify) - Already has good variant system
5. `src/ui/Card.tsx` (verify) - Already has tone system

### Components Checklist:

- ✅ Button: primary, secondary, ghost variants with proper a11y
- ✅ Card: glass container with tone variations
- ✅ Input: consistent styling with focus ring and label
- ✅ Select: styled with proper focus states
- ✅ FormField: label + input wrapper
- ✅ TabList: accessible tab component with ARIA attributes

---

## Implementation Order

### Priority 1 (Critical - Affects main navigation):

1. **Finance.tsx + KpiCards** - Visual consistency in dashboard
2. **Settings.tsx + TabList** - Foundational refactor for settings pages

### Priority 2 (High - Visible modules):

3. **TravelV2.tsx** - Major redesign with header + form
4. **Calendar.tsx** - Toolbar + button consistency

### Priority 3 (Supporting):

5. **Sub-components** - Finance v2, Org pages, Travel components
6. **Accessibility** - ARIA labels, focus management, contrast checks

### Priority 4 (Polish):

7. **Component library** - New FormField, TabList components
8. **Testing** - Visual regression, keyboard navigation, screen reader testing

---

## Accessibility Checklist

For each file modified, ensure:

- [ ] All buttons with icons have `aria-label`
- [ ] All form inputs have associated `<label>` with `htmlFor`
- [ ] All interactive elements are keyboard accessible (Tab key)
- [ ] Focus indicators are visible (4px ring with accent color)
- [ ] Color contrast is sufficient (WCAG AA minimum 4.5:1 for text)
- [ ] Modal dialogs have `role="dialog"` and `aria-modal="true"`
- [ ] Tab controls use `role="tablist"` + `role="tab"` + `aria-selected`
- [ ] Dynamic content is announced via `aria-live="polite"`
- [ ] Disabled elements have `disabled` attribute and proper styling
- [ ] Links are distinguished from buttons semantically

---

## Testing Matrix

| Component        | Visual | Keyboard | Screen Reader | Responsive |
| ---------------- | ------ | -------- | ------------- | ---------- |
| Finance KPIs     | TBD    | TBD      | TBD           | TBD        |
| Settings Tabs    | TBD    | TBD      | TBD           | TBD        |
| Travel Forms     | TBD    | TBD      | TBD           | TBD        |
| Calendar Toolbar | TBD    | TBD      | TBD           | TBD        |
| Buttons/Forms    | TBD    | TBD      | TBD           | TBD        |

---

## Expected Outcomes

✅ **Visual Consistency**: All pages follow Dashboard/Shows design system  
✅ **Improved Spacing**: Consistent 4px-based padding/gaps throughout  
✅ **Better Typography**: Clear hierarchy and readable text sizes  
✅ **Enhanced Accessibility**: Full WCAG AA compliance with keyboard nav + screen readers  
✅ **Responsive Design**: Optimized for mobile, tablet, desktop  
✅ **Reusable Components**: FormField, TabList, etc. for future development  
✅ **Performance**: No new dependencies, only Tailwind + existing Framer Motion

---

## Notes

- Focus on **consistency** over new features
- Maintain **existing functionality** - no logic changes
- Use **existing color palette** - no new colors
- Preserve **animation patterns** - motion-safe compliant
- Keep **bundle size stable** - no new libraries
- Ensure **backward compatibility** - don't break existing routes/hooks

---

**Next Steps**: Start with Finance module (Phase 1), then Settings (Priority 1), proceeding to subsequent phases.
