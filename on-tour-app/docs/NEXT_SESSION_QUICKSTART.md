# 🚀 Next Session Quick Start

**Last Updated:** November 5, 2025  
**Current Phase:** 1 ✅ Complete | 2 ⏳ Ready to Start  
**Progress:** 25% → Target: 50%+

---

## 📋 What Was Done Last Session

✅ **Design Documentation** - Created comprehensive pattern guide (400+ lines)  
✅ **KpiCards Component** - Refactored from dark-bg grid to Card-based layout  
✅ **Settings Page** - Unified header + improved tab styling with ARIA attributes  
✅ **Accessibility** - Added WCAG AA compliance (aria-label, aria-selected, etc.)

**Files Modified:** 2 components + 4 documentation files  
**Changes:** ~135 lines of code + 1000+ lines of documentation

---

## 🎯 Phase 2 Tasks (Pick Up Here)

### Task 1: TravelV2 Module (`src/pages/dashboard/TravelV2.tsx`)

**Estimated Time:** 1.5 hours

**Changes Needed:**

```tsx
// Add unified header (copy from Settings/Finance style)
<div className="glass rounded-xl border border-white/10 backdrop-blur-sm mb-6">
  <div className="bg-gradient-to-r from-transparent via-white/5 to-transparent px-6 py-5">
    <div className="flex items-center gap-4">
      <div className="w-1 h-10 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
      <h1 className="text-2xl font-semibold tracking-tight">Travel</h1>
    </div>
  </div>
</div>

// Update form inputs:
className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 focus:border-accent-500/50 focus:outline-none transition-all"

// Add aria-label to icon buttons:
<button aria-label="Search flights" className="...">
  <SearchIcon />
</button>

// Update tab controls to use accent-500 for active state
```

**Checklist:**

- [ ] Add page header with accent bar
- [ ] Update search form inputs with standard styling
- [ ] Apply aria-label to all icon buttons
- [ ] Update tab styling (active: accent-500, inactive: glass)
- [ ] Apply glass containers to flight cards
- [ ] Test responsive: mobile 375px, tablet 768px, desktop 1280px
- [ ] Test keyboard: Tab through all controls
- [ ] Test screen reader: hear aria-labels

---

### Task 2: Calendar Module (`src/pages/dashboard/Calendar.tsx`)

**Estimated Time:** 1.5 hours

**Changes Needed:**

- Add unified page header (copy pattern from TravelV2)
- Update toolbar buttons styling
- Add aria-label to date navigation buttons
- Verify event colors match status palette
- Update date picker modal styling
- Apply consistent form input styling

**Checklist:**

- [ ] Add page header with accent bar
- [ ] Update toolbar button styling
- [ ] Add aria-label to prev/next buttons
- [ ] Verify calendar grid ARIA attributes
- [ ] Update filter controls styling
- [ ] Test responsive design
- [ ] Test keyboard navigation
- [ ] Test screen reader

---

### Task 3: Settings Tab Content - ProfileTab & PreferencesTab

**Estimated Time:** 1 hour

**Changes Needed:**

- Organize form sections in glass containers
- Update input styling: `bg-white/5 border-white/10`
- Add aria-label to toggle switches
- Apply consistent spacing (gap-3)
- Use semantic `<label htmlFor="...">` for all form inputs
- Update button styling

**Checklist:**

- [ ] Wrap form sections in glass containers
- [ ] Update all input styling
- [ ] Add aria-label to toggles
- [ ] Add htmlFor to all labels
- [ ] Update button styling (primary: accent, secondary: glass)
- [ ] Test form keyboard navigation
- [ ] Test screen reader with form labels

---

## 📚 Reference Documents

Keep these open while working:

1. **`/docs/UI_PATTERN_REFERENCE.md`** - Copy-paste patterns
   - Page header pattern
   - Form input pattern
   - Button patterns
   - Grid patterns
   - Example code

2. **`/docs/REFACTORIZATION_PLAN.md`** - What needs to be done

3. **`/docs/REFACTORIZATION_PROGRESS.md`** - Track progress

---

## 🔍 Quick Copy-Paste Snippets

### Page Header (Use for Travel & Calendar):

```tsx
<div className="glass rounded-xl border border-white/10 backdrop-blur-sm mb-6 overflow-hidden hover:border-white/20 transition-all duration-300">
  <div className="bg-gradient-to-r from-transparent via-white/5 to-transparent px-6 py-5">
    <div className="flex items-center gap-4">
      <div className="w-1 h-10 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
      <h1 className="text-2xl font-semibold tracking-tight">Page Title</h1>
    </div>
  </div>
</div>
```

### Form Input:

```tsx
<input
  type="text"
  placeholder="..."
  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 focus:border-accent-500/50 focus:outline-none transition-all"
/>
```

### Form Label + Input:

```tsx
<div className="flex flex-col gap-2">
  <label className="text-xs font-medium uppercase tracking-wider text-white/70">Field Name</label>
  <input
    type="text"
    className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-accent-500/50 focus:outline-none"
  />
</div>
```

### Icon Button with aria-label:

```tsx
<button
  aria-label="Search flights"
  className="p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500"
>
  <SearchIcon className="w-5 h-5" />
</button>
```

### Active Tab Styling:

```tsx
{
  /* Active: bg-accent-500, inactive: glass border */
}
<button
  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
    active
      ? 'bg-accent-500 text-black'
      : 'glass border border-white/10 hover:border-white/20 text-white/70'
  }`}
>
  Tab Name
</button>;
```

---

## ✅ Testing Checklist

After each file modification, run these tests:

### Visual Test:

```
1. npm run dev
2. Navigate to the modified page
3. Compare with Dashboard/Shows styling
4. Check mobile (375px) ✓
5. Check tablet (768px) ✓
6. Check desktop (1280px) ✓
```

### Keyboard Test:

```
1. Navigate to page
2. Press Tab repeatedly
3. Verify focus is always visible (blue/accent ring)
4. No keyboard traps
5. Can activate buttons with Space/Enter
```

### Screen Reader Test:

```
1. Enable VoiceOver (Mac) or NVDA (Windows)
2. Navigate page
3. Hear descriptive aria-label on buttons
4. Hear form labels before inputs
5. Hear tab state (active/inactive)
```

---

## 🔧 Git Workflow

For each file changed:

```bash
# Before modifying
git checkout src/pages/dashboard/TravelV2.tsx

# After changes
git add src/pages/dashboard/TravelV2.tsx
git commit -m "refactor: unify TravelV2 page header and form styling

- Add glass container header with accent bar
- Update form inputs: bg-white/5 border-white/10 + focus ring
- Add aria-label to search button
- Update tab styling: accent-500 for active state
- Test: responsive 375/768/1280px, keyboard nav, screen reader"
```

---

## 📊 Progress Tracking

Update as you complete tasks:

| Task              | Status | Time   | Notes           |
| ----------------- | ------ | ------ | --------------- |
| TravelV2          | ⏳     | 1.5h   | Start here      |
| Calendar          | ⏳     | 1.5h   | After Travel    |
| Settings tabs     | ⏳     | 1h     | Final task      |
| **Phase 2 Total** | ⏳     | **4h** | ~25% of session |

---

## 🎓 Key Principles to Remember

1. **Consistency**: Copy exact patterns from Dashboard/Shows
2. **Accessibility**: Add aria-label, aria-selected, role attributes
3. **Responsiveness**: Mobile-first, test all breakpoints
4. **Performance**: No new dependencies, use existing Tailwind
5. **No Logic Changes**: Only visual/a11y updates

---

## 🚦 When Stuck

1. **Compare with Dashboard.tsx** - See how it's done there
2. **Check UI_PATTERN_REFERENCE.md** - Find similar pattern
3. **Look at Shows.tsx** - Another good reference
4. **Test with browser devtools** - Verify styling applied
5. **Ask Claude** - Provide code + what you're trying to achieve

---

## 🎯 Success Criteria

When finished with Phase 2:

✅ TravelV2 has unified header and styled forms  
✅ Calendar has unified header and styled toolbar  
✅ Settings ProfileTab/PreferencesTab have consistent form styling  
✅ All changed files have aria-labels and proper ARIA attributes  
✅ No visual regressions (compare with previous design)  
✅ Responsive testing passed (375/768/1280px)  
✅ Keyboard navigation works throughout  
✅ Screen reader announces content correctly

---

## 📞 Handoff Notes

- **Last Modified:** KpiCards.tsx, Settings.tsx
- **Current Focus:** TravelV2 → Calendar → Settings tabs
- **Documentation:** All in `/docs/` folder
- **Patterns:** All in UI_PATTERN_REFERENCE.md
- **Tests:** Visual + keyboard + screen reader

---

## 💡 Pro Tips

1. Use VS Code multi-cursor (Cmd+D) to update multiple form inputs at once
2. Create a snippet for the page header pattern for quick insertion
3. Test in incognito window to avoid cached styles
4. Use Chrome DevTools device emulation for responsive testing
5. Use Firefox with NVDA for screen reader testing (Windows)

---

## 🎉 What's Next After Phase 2

Phase 3: Organization pages (OrgMembers, Teams, Branding, etc.)  
Phase 4: Component library (FormField, TabList, new components)  
Phase 5: Testing & polish

Keep the momentum! Phase 2 should be quick and smooth if you follow the patterns established.

---

**Ready? Let's go! 🚀**

Start with TravelV2 header → Copy page header pattern → Update form inputs → Add aria-labels

Good luck!
