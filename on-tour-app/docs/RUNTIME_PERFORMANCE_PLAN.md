# Runtime Performance Optimization Plan
**Date**: October 10, 2025  
**Goal**: Optimize React component rendering and computation performance

## 🎯 Target Components for Optimization

### High Priority (Heavy Re-renders)
1. **Shows.tsx** - Large list with virtualization, frequent filters
2. **PLTable.tsx** - Finance table with complex calculations
3. **ActionHub.tsx** - Real-time action computation
4. **InteractiveMap.tsx** - Map rendering with many markers
5. **ShowEditorDrawer.tsx** - Complex form with many calculations

### Medium Priority
6. **PLPivot.tsx** - Pivot table with aggregations
7. **StatusBreakdown.tsx** - Financial aggregations
8. **ForecastPanel.tsx** - Chart calculations
9. **TourAgenda.tsx** - Timeline rendering
10. **GlobalKPIBar.tsx** - Real-time metrics

---

## 🔧 Optimization Strategies

### 1. React.memo for Pure Components
**Target**: Components that receive same props but re-render unnecessarily

```typescript
// BEFORE
const ActionCard: React.FC<Props> = ({ action, onClick }) => {
  return <div onClick={onClick}>...</div>;
};

// AFTER
const ActionCard = React.memo<Props>(({ action, onClick }) => {
  return <div onClick={onClick}>...</div>;
}, (prevProps, nextProps) => {
  // Custom comparison if needed
  return prevProps.action.id === nextProps.action.id;
});
```

**Benefits**:
- Prevents unnecessary re-renders when parent re-renders
- Especially useful for list items (Show rows, finance rows)
- Reduces reconciliation work for React

---

### 2. useMemo for Expensive Calculations
**Target**: Complex filtering, sorting, aggregations

```typescript
// BEFORE - Recalculates on every render
const filteredShows = shows.filter(s => s.status === 'confirmed')
  .sort((a, b) => b.fee - a.fee);
const totalRevenue = filteredShows.reduce((sum, s) => sum + s.fee, 0);

// AFTER - Only recalculates when dependencies change
const filteredShows = useMemo(() => 
  shows.filter(s => s.status === 'confirmed')
    .sort((a, b) => b.fee - a.fee),
  [shows]
);

const totalRevenue = useMemo(() => 
  filteredShows.reduce((sum, s) => sum + s.fee, 0),
  [filteredShows]
);
```

**Benefits**:
- Avoids redundant calculations
- Critical for large datasets (100+ shows)
- Reduces CPU usage during renders

---

### 3. useCallback for Event Handlers
**Target**: Functions passed as props to memoized children

```typescript
// BEFORE - Creates new function on every render
const handleClick = (id: string) => {
  updateShow(id, { status: 'confirmed' });
};

// AFTER - Stable function reference
const handleClick = useCallback((id: string) => {
  updateShow(id, { status: 'confirmed' });
}, [updateShow]);
```

**Benefits**:
- Prevents child re-renders when used with React.memo
- Maintains stable function references
- Essential for list items with callbacks

---

### 4. Context Value Memoization
**Target**: Context providers that cause cascading re-renders

```typescript
// BEFORE - New object on every render
<FinanceContext.Provider value={{
  snapshot,
  loading,
  updateShow,
  addShow
}}>

// AFTER - Memoized value
const contextValue = useMemo(() => ({
  snapshot,
  loading,
  updateShow,
  addShow
}), [snapshot, loading, updateShow, addShow]);

<FinanceContext.Provider value={contextValue}>
```

**Benefits**:
- Prevents unnecessary context consumer re-renders
- Critical for app-wide contexts (Finance, Settings)
- Reduces render cascades

---

### 5. Virtualization Optimization
**Target**: Long lists that already use virtualization

```typescript
// BEFORE - Large overscan
const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 44,
  overscan: 20 // Too many pre-rendered items
});

// AFTER - Optimized overscan
const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 44,
  overscan: 5 // Just enough for smooth scrolling
});
```

**Benefits**:
- Renders fewer DOM nodes
- Faster initial render
- Lower memory usage

---

## 📊 Expected Performance Gains

### Before Optimization (Estimated)
- **Shows List**: ~150ms render with 200 items
- **Finance Table**: ~200ms render with complex calculations
- **Action Hub**: ~80ms computation per update
- **Context Updates**: Cascade to 10-15 components

### After Optimization (Target)
- **Shows List**: ~80ms render (-47%)
- **Finance Table**: ~100ms render (-50%)
- **Action Hub**: ~40ms computation (-50%)
- **Context Updates**: Isolated to 3-5 components (-70%)

### User-Perceived Benefits
- **Smoother Scrolling**: Less jank in virtualized lists
- **Faster Filtering**: Instant response to filter changes
- **Reduced CPU**: Lower battery drain on mobile
- **Better UX**: More responsive interactions

---

## 🎨 Implementation Plan

### Phase 1: Low-Hanging Fruit (2 hours)
1. ✅ Memoize context values (FinanceContext, SettingsContext)
2. ✅ Add useMemo to expensive calculations (totals, aggregations)
3. ✅ Optimize virtualization overscan values
4. ✅ Document changes

### Phase 2: Component Optimization (3 hours)
1. React.memo for list items (ShowRow, PLTableRow, ActionCard)
2. useCallback for event handlers in parent components
3. Split large components into smaller memoized pieces
4. Add performance markers for profiling

### Phase 3: Advanced Optimization (2 hours)
1. Implement windowing for ActionHub updates
2. Debounce expensive recalculations
3. Add React DevTools profiling annotations
4. Create performance regression tests

---

## 🛠️ Tools & Techniques

### React DevTools Profiler
```typescript
// Wrap components to measure performance
<React.Profiler id="ShowsList" onRender={onRenderCallback}>
  <ShowsList />
</React.Profiler>
```

### Performance Markers
```typescript
performance.mark('shows-filter-start');
const filtered = expensiveFilter(shows);
performance.mark('shows-filter-end');
performance.measure('shows-filter', 'shows-filter-start', 'shows-filter-end');
```

### Why-Did-You-Render (Development)
```typescript
import whyDidYouRender from '@welldone-software/why-did-you-render';

if (process.env.NODE_ENV === 'development') {
  whyDidYouRender(React, {
    trackAllPureComponents: true,
  });
}
```

---

## 📈 Success Metrics

### Quantitative
- **Render Time**: <100ms for list components
- **Re-render Count**: -60% unnecessary re-renders
- **Memory Usage**: -30% in list views
- **CPU Usage**: -40% during interactions

### Qualitative
- Smooth 60fps scrolling in lists
- Instant filter/sort response (<50ms)
- No visible lag during typing
- Responsive on mid-range devices

---

## 🚀 Quick Wins to Implement First

### 1. Context Value Memoization (15 minutes)
**Impact**: High - Affects entire app
**Effort**: Low

### 2. Expensive Calculation Memoization (30 minutes)
**Impact**: High - Reduces CPU usage
**Effort**: Low

### 3. List Item Memoization (45 minutes)
**Impact**: High - Fewer re-renders
**Effort**: Medium

### 4. Event Handler useCallback (30 minutes)
**Impact**: Medium - Enables other optimizations
**Effort**: Low

---

## 📝 Testing Strategy

### Manual Testing
1. Open Shows page with 200+ items
2. Filter/sort rapidly
3. Monitor DevTools Performance tab
4. Check for smooth 60fps scrolling

### Automated Testing
```typescript
// Performance test example
test('Shows list renders in < 100ms with 200 items', () => {
  const start = performance.now();
  render(<Shows shows={generate200Shows()} />);
  const duration = performance.now() - start;
  expect(duration).toBeLessThan(100);
});
```

### Profiling
1. Record profile before optimizations
2. Apply optimizations
3. Record profile after
4. Compare flame graphs
5. Verify -50% reduction in render time

---

## 🎯 Priority Matrix

| Component | Impact | Effort | Priority |
|-----------|--------|--------|----------|
| Context Memoization | High | Low | **P0** |
| PLTable Calculations | High | Low | **P0** |
| Shows List Memoization | High | Medium | **P1** |
| ActionHub Optimization | Medium | Medium | **P1** |
| Event Callbacks | Medium | Low | **P1** |
| Map Rendering | Medium | High | P2 |
| Chart Calculations | Low | Medium | P3 |

---

**Next Action**: Begin with Context Memoization (FinanceContext, SettingsContext) as it has the highest impact/effort ratio and affects the entire application.

