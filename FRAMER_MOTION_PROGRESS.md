# Framer Motion Optimization Progress

## Objective
Reduce framer-motion usage from 209 files to ~50 files (complex usage only).
Target bundle size reduction: ~94KB → ~20KB (~74KB savings).

## Current Status
- **Files optimized**: 15 of 64 simple files (23.4%)
- **Estimated savings**: ~23KB of ~94KB target (~24% progress)
- **Bundle size**: 1,572.15 kB total
  - vendor-framer: 69.94 kB
  - vendor main: 1,035.64 kB

## Phase Breakdown

### Phase 1 ✅ (Commit 7e0527d)
- ShowsSummaryCard.tsx
- Created analyze-framer-motion.mjs tool
- Established CSS animations-simple.css utilities

### Phase 2 ✅ (Commit 1af2de0)
Dashboard components (7 files):
- FinanceSummaryCard.tsx
- MissionControlSummaryCard.tsx
- QuickActions.tsx
- NextCriticalEventKPI.tsx
- KeyPerformanceKPI.tsx
- HeroSection.tsx
- DashboardFilters.tsx

### Phase 3 ✅ (Commit 4d6d134)
Finance components (2 files):
- ErrorStates.tsx (4 error variants)
- KpiCards.tsx (KPI grid with stagger)

### Phase 4 ✅ (Commit 1487d5d)
Home components (2 files):
- FinalCta.tsx (landing CTA)
- Pricing.tsx (pricing grid)

### CRITICAL FIX ✅ (Commit e0139af)
- **Pricing.tsx**: Removed `useReducedMotion` import causing circular dependency
- **Solution**: Replaced with native `window.matchMedia('(prefers-reduced-motion: reduce)')`
- **Error fixed**: "Cannot access 'je' before initialization" in vendor bundle

### CRITICAL FIX #2 ✅ (Commit 43ee71d)
- **vite.config.ts**: Reordered chunk dependencies (React BEFORE framer-motion)
- **Reason**: Prevent circular TDZ errors in vendor bundle initialization

### Phase 5 ✅ (Commit 42eab2e) - IN PROGRESS
Home components (3 files):
- FeaturesSection.tsx ✅
- PricingTable.tsx ✅
- TrustSection.tsx ✅
- DashboardTeaser.tsx ❌ SKIPPED (uses layoutId, infinite animations - complex)

Vite config improvements:
- Added `hoistTransitiveImports: false` to prevent import hoisting issues
- Clean rebuild to eliminate cached artifacts

### Next Targets (Phase 6)
Dashboard components (5 files):
- AnalyticsPanel.tsx
- TourOverviewCard.tsx
- ProactiveDashboard.tsx
- FinancialHealthKPI.tsx
- EventDetailDrawer.tsx

Finance components (2 files):
- Summary.tsx
- PLTable.tsx

## Known Complex Files (KEEP framer-motion)
These files use advanced framer-motion features and should NOT be optimized:

### AnimatePresence Usage
- AddTransactionModal.tsx
- EditTransactionModal.tsx
- EditBudgetModal.tsx
- CalendarEventModal.tsx
- EventCreationModal.tsx
- ContactEditorModal.tsx
- EventEditorModal.tsx

### Layout Animations
- DashboardTeaser.tsx (layoutId for metamorphosis)
- MetamorphosisZenith.tsx (complex layout + MotionValue)
- MetamorphosisContainer.tsx (useScroll, useTransform)

### Complex Interactions
- InteractiveCanvas.tsx (useMotionValue, useSpring, useAnimation)
- ControlPanel.tsx (advanced motion controls)
- ChaosHero.tsx (complex gestures)
- TrustBar.tsx (advanced transforms)

### Scroll Animations
- ChaosSection.tsx (useScroll, useTransform)
- StorytellingSection.tsx (AnimatePresence)

### Essential UI Components
- AnimatedButton.tsx (whileHover, whileTap, infinite glow animation)
- TestimonialsSection.tsx (staggerChildren with custom variants)
- FeatureGallery.tsx (intersection observer + motion)

## Optimization Pattern

### Before (framer-motion)
```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
  whileHover={{ scale: 1.02 }}
>
```

### After (CSS animations)
```tsx
<div className="animate-slide-up hover-lift">
```

### CSS Utilities (animations-simple.css)
- `.animate-fade-in` - opacity 0 → 1
- `.animate-slide-up` - slide from bottom with fade
- `.animate-slide-down` - slide from top with fade
- `.animate-slide-in-right` - slide from right with fade
- `.animate-stagger` - sequential child animations
- `.hover-scale` - scale on hover
- `.hover-lift` - lift (translateY) on hover
- `.active-scale` - scale on click

All animations are GPU-accelerated (transform, opacity only) and respect `prefers-reduced-motion`.

## Critical Lessons Learned

### ❌ NEVER DO THIS
```tsx
// WRONG: Partial import causes circular dependency
import { useReducedMotion } from 'framer-motion';
// ... but not using motion components
```

### ✅ ALWAYS DO THIS
```tsx
// RIGHT: Use native API instead
const prefersReducedMotion = useMemo(() => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}, []);
```

### ❌ AVOID
- Partial framer-motion imports without using motion components
- Mixing CSS animations with framer-motion in same component
- useReducedMotion hook when not using motion components

### ✅ BEST PRACTICES
- Remove ALL framer-motion imports when optimizing to CSS
- Use inline `style={{ animationDelay: '100ms' }}` for sequencing
- Keep complex animations (AnimatePresence, layoutId, gestures) in framer
- Always test build after optimization
- Clean vite cache (`rm -rf node_modules/.vite`) if builds fail

## Bundle Analysis
Run `node scripts/analyze-framer-motion.mjs` to identify optimization targets.

**Files still using framer-motion**: 194 files
- Simple usage (can optimize): 49 files remaining
- Complex usage (must keep): 145 files

## Progress Tracker
- [x] Phase 1: 1 file (shows/)
- [x] Phase 2: 7 files (dashboard/)
- [x] Phase 3: 2 files (finance/)
- [x] Phase 4: 2 files (home/)
- [x] Phase 5: 3 files (home/) - DashboardTeaser skipped (complex)
- [ ] Phase 6: 7 files (dashboard/ + finance/)
- [ ] Phase 7: Remaining simple files
- [ ] Phase 8: Final bundle analysis

**Total progress**: 15/64 simple files optimized (23.4%)
**Remaining work**: 49 simple files to optimize

---
Last updated: 2025-11-14 (Phase 5 - Commit 42eab2e)
