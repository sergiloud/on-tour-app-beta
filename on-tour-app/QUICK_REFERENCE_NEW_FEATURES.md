# ⚡ Quick Reference - New Features

## 🚨 Date Conflict Detection

**What it does:** Warns users when they create scheduling conflicts

**When it appears:**

- When user changes date in Details tab
- If date overlaps with any existing show

**What user sees:**

```
[Modal Title] ⚠️  ← Pulsing amber warning icon
[Tabs]
┌─────────────────────────────────────┐
│ ⚠️ Date Conflict                    │
│ This date overlaps with "Concert in │
│ Barcelona" in Barcelona             │
│ (2025-11-15 - 2025-11-17)          │
└─────────────────────────────────────┘
```

**User can:**

- ✅ Acknowledge & save anyway (not blocking)
- ✅ Change date to resolve conflict
- ✅ Continue editing

**Why it matters:**

- Prevents accidental double-bookings
- Proactive warning (vs. discovering in calendar later)
- Non-intrusive (doesn't block workflow)

---

## 💱 FX Rate Management

**What it does:** Locks exchange rates for tax/accounting compliance

**When it appears:**

- Only when currency ≠ EUR (e.g., USD, GBP, AUD)
- In the Fee Field section

**What user sees:**

```
Fee Field
[€] [500     ]  ← Fee input

💱 Exchange Rate Lock        ← NEW SECTION
┌──────────────────────────┐
│ USD → EUR                │
│ [0.9500]  [📅 Today]    │ ← Rate + Quick button
│ [Date Picker: Nov 8]     │ ← Lock to specific date
│ 🔒 Locked | Nov 8, 2025  │ ← Status badge
│                          │
│ 500 USD @ 0.9500         │ ← Preview
│ = 475.00 EUR             │
└──────────────────────────┘
```

**Three ways to set rate:**

1. **Manual**: Type `0.9500` in rate field (4 decimals)
2. **Today**: Click 📅 Today button (sets today's date)
3. **Custom**: Pick date in calendar (sets as locked)

**What happens on save:**

- Rate persists to Show record
- Date tracked for audit
- Source recorded (locked/today/system)

**Why it matters:**

- Legal requirement: Use rate at transaction date, not reporting date
- Accurate accounting: No approximations
- Audit trail: Show which rate was used and when
- Tax compliance: Ready for accountant/tax filing

---

## 🔄 Integration Examples

### For Parent Components

```tsx
// Pass all shows for conflict detection
<ShowEditorDrawer {...props} allShows={allShowsFromDatabase} />

// FX rate integration happens automatically
// (FeeFieldAdvanced receives props internally)
```

### In Show Data

```typescript
// Saved with FX fields
{
  id: "show-123",
  fee: 500,                    // Amount in original currency
  feeCurrency: "USD",         // Original currency
  fxRateToBase: 0.9500,       // Locked rate
  fxRateDate: "2025-11-08",   // When locked
  fxRateSource: "locked",     // How it was set
}
```

---

## 🎯 User Workflows

### Workflow 1: Prevent Double-Booking

1. User opens show editor
2. Changes date to conflicting date
3. ⚠️ Warning appears immediately
4. User sees: "Overlaps with 'Festival XYZ' in Barcelona"
5. User changes date to non-conflicting date
6. ✅ Warning disappears
7. User saves

### Workflow 2: Lock FX Rate at Contract Time

1. User creates USD show (fee: 500)
2. 💱 FX section appears
3. User enters rate: 0.95
4. User picks date: contract signing date (Nov 8)
5. Preview shows: "500 USD @ 0.95 = 475 EUR"
6. User saves
7. Rate is locked ✅ even if market changes later

### Workflow 3: Use Today's Rate

1. User creates USD show
2. Clicks 📅 Today button
3. Today's date auto-filled
4. Source shows: "📅 Today"
5. User saves
6. If rate API connected, uses today's market rate

---

## 🔍 Testing Quick Checks

### Conflict Detection

- [ ] Create show on Nov 15
- [ ] Create another show on Nov 15
- [ ] ⚠️ Warning should appear
- [ ] Change date to Nov 20
- [ ] ✅ Warning should disappear

### FX Rate Management

- [ ] Create USD show (fee: 100)
- [ ] 💱 Section appears
- [ ] Enter rate: 0.95
- [ ] Preview: "100 USD @ 0.95 = 95.00 EUR"
- [ ] Pick date: Today
- [ ] Badge shows: "📅 Today | Today's date"
- [ ] Save & reopen
- [ ] Rate should be locked

### Edge Cases

- [ ] EUR currency: 💱 section hidden ✓
- [ ] Date conflicts with canceled show: No warning ✓
- [ ] Multiple conflicts: Shows first one ✓
- [ ] Invalid FX rate (≤0): Rejected ✓
- [ ] No shows in database: No errors ✓

---

## 📊 Data Stored Per Feature

### Conflict Detection

- **Storage**: O(1) per show
- **Data**: Date + endDate (already existed)
- **Comparison**: Live calculation vs. all other shows

### FX Rate Management

- **Storage**: ~24 bytes per show
  - fxRateToBase: 8 bytes (float)
  - fxRateDate: 10 bytes (ISO string)
  - fxRateSource: 6 bytes (string: "locked"/"today"/"system")

---

## 🆘 Troubleshooting

### Issue: Conflict warning not appearing

- Check: Are allShows being passed to ShowEditorDrawer?
- Check: Is date actually overlapping?
- Check: Is other show status = 'canceled'? (Won't trigger warning)

### Issue: FX section not appearing

- Check: Is currency = EUR? (Hidden for EUR)
- Check: Is currency prop being passed?
- Check: Is feeCurrency set on draft?

### Issue: Rate not persisting

- Check: Is form submitted properly?
- Check: Are FX props connected to draft state?
- Check: Is backend saving fxRateToBase + fxRateDate + fxRateSource?

---

## 📞 Feature Support

For detailed information, see:

- **Conflicts**: `CONFLICT_DETECTION_FEATURE.md`
- **FX Rates**: `FX_RATE_MANAGEMENT_FEATURE.md`
- **Complete Summary**: `SESSION_COMPLETE_ADVANCED_FEATURES.md`

For code examples:

- Check component props in `FeeFieldAdvanced.tsx`
- Check integration in `ShowEditorDrawer.tsx`
- Check types in `useShowDraft.ts` and `src/lib/shows.ts`

---

**Last Updated**: 2025-11-08
**Status**: ✅ Production Ready
**Build**: Exit Code: 0
