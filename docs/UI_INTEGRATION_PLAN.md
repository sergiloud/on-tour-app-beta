# UI Integration Plan: Scalable Firestore Hooks

## Current State

The app currently uses:
- `FinanceContext` → builds snapshot from `shows` array (in-memory)
- `showStore` → localStorage-based show management
- `firestoreFinanceService.ts` → direct Firestore queries (flat structure)

## New Architecture

With scalable hooks (`useFirestoreScalable.ts`):
- `useTransactionsPaginated(snapshotId, pageSize)` → cursor-based pagination
- `useTransactionsByDateRange(snapshotId, startDate, endDate)` → filtered queries
- `useShows(options)`, `useCalendarEvents(options)`, `useContacts()` → real-time updates
- CRUD: `createTransaction()`, `updateTransaction()`, `deleteTransaction()`

## Integration Strategy

### Phase 1: Add Pagination Controls (Finance)

**Files to update:**
- `src/pages/dashboard/FinanceOverview.tsx`
- `src/components/finance/TransactionList.tsx` (if exists)

**Changes:**
```tsx
// OLD: Load all transactions from context
const { snapshot } = useFinance();

// NEW: Paginated transactions with hooks
const { 
  transactions, 
  loadMore, 
  hasMore, 
  isLoading 
} = useTransactionsPaginated('ytd-2025', 50);

return (
  <div>
    {transactions.map(tx => <TransactionRow key={tx.id} {...tx} />)}
    {hasMore && (
      <button onClick={loadMore} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Load More'}
      </button>
    )}
  </div>
);
```

### Phase 2: Add Date Range Filters

**Files to update:**
- `src/components/finance/PeriodSelector.tsx`
- `src/context/FinancePeriodContext.tsx`

**Changes:**
```tsx
// Use date range hook instead of full snapshot
const { startDate, endDate } = useFinancePeriod();
const { 
  transactions, 
  isLoading 
} = useTransactionsByDateRange('ytd-2025', startDate, endDate);
```

### Phase 3: Refactor FinanceContext

**Goal:** Keep snapshot computation but fetch from sub-collections

**Options:**

#### Option A: Hybrid (Recommended)
- Keep `FinanceContext` for computed snapshot (KPIs, charts)
- Replace data source: `firestoreFinanceService` → `useTransactionsPaginated`
- Gradual migration: UI works with both old and new data sources

```tsx
// In FinanceContext
const { transactions } = useTransactionsPaginated('ytd-2025', 1000);
const snapshot = useMemo(() => 
  buildFinanceSnapshotFromTransactions(transactions, new Date()),
  [transactions]
);
```

#### Option B: Full Refactor
- Remove `FinanceContext` entirely
- Components fetch data directly via hooks
- More modular but requires larger UI refactor

### Phase 4: Shows & Calendar

**Shows:**
- Replace `showStore` localStorage with `useShows()` hook
- Add status filter dropdown
- Add pagination for large tour lists

**Calendar:**
- Replace local event state with `useCalendarEvents()` hook
- Add type filter (show/travel/meeting/other)
- Real-time sync across tabs

### Phase 5: Cleanup

- Run migration script for all users
- Verify data in production (30 days)
- Delete old Firestore paths
- Remove old hooks/services

## File Checklist

### Finance Module
- [ ] `src/pages/dashboard/FinanceOverview.tsx` - Add pagination controls
- [ ] `src/pages/dashboard/Finance.tsx` - Update transaction list
- [ ] `src/pages/dashboard/FinanceV2.tsx` - Add date range filters
- [ ] `src/context/FinanceContext.tsx` - Refactor to use new hooks
- [ ] `src/services/firestoreFinanceService.ts` - Deprecate or adapt

### Shows Module
- [ ] `src/components/shows/ShowsList.tsx` - Use `useShows()` hook
- [ ] `src/shared/showStore.ts` - Deprecate localStorage, migrate to Firestore

### Calendar Module
- [ ] `src/pages/dashboard/Calendar.tsx` - Use `useCalendarEvents()` hook
- [ ] `src/components/calendar/CalendarView.tsx` - Add real-time updates

### Migration
- [ ] Run migration script for production users
- [ ] Monitor Firestore usage (should decrease with pagination)
- [ ] Verify data integrity
- [ ] Delete old structure after 30 days

## Testing Plan

1. **Unit Tests:** Test new hooks with mock Firestore
2. **Integration Tests:** Test pagination, filtering, CRUD operations
3. **E2E Tests:** Test full user flows (add transaction, filter, export)
4. **Performance:** Measure query times, bundle size impact
5. **Rollback Plan:** Keep old code paths active during transition

## Rollout Plan

1. **Week 1:** Implement Phase 1 (pagination) - beta users only
2. **Week 2:** Add date range filters, monitor performance
3. **Week 3:** Refactor FinanceContext, full beta rollout
4. **Week 4:** Production rollout, migrate user data
5. **Week 5-8:** Monitor, fix bugs, optimize queries
6. **Week 9:** Cleanup old structure

## Success Metrics

- ✅ Query time < 500ms (95th percentile)
- ✅ Firestore reads reduced by 60% (pagination)
- ✅ No data loss during migration
- ✅ 0 critical bugs in production
- ✅ User satisfaction maintained (NPS)

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Data loss during migration | Non-destructive migration, keep old data 30 days |
| Performance degradation | A/B test, rollback flag, gradual rollout |
| Breaking changes | Feature flags, backward compatibility layer |
| User confusion | In-app tooltips, changelog, support docs |

## Next Immediate Actions

1. ✅ Create `useTransactionsPaginated` hook - DONE
2. ✅ Create migration script - DONE
3. ✅ Update Firestore rules - DONE
4. 🚧 **Next:** Update `FinanceOverview.tsx` to add "Load More" button
5. ⏳ Test pagination in development
6. ⏳ Run dry-run migration on test account
