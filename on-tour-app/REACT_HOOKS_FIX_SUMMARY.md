# 🔧 React Hooks Rule Violation - Critical Fix

**Status:** ✅ FIXED  
**Date Fixed:** November 6, 2025  
**Severity:** CRITICAL - App Crash

---

## 🚨 The Problem

The Calendar component crashed with this error:

```
Warning: React has detected a change in the order of Hooks called by Calendar.
This will lead to bugs and errors if not fixed.

Uncaught Error: Rendered more hooks than during the previous render.
  at updateWorkInProgressHook (chunk-FD5SMSK5.js:11726:21)
  at updateMemo (chunk-FD5SMSK5.js:12247:22)
  at Object.useMemo (chunk-FD5SMSK5.js:12774:24)
  at useMemo (chunk-YHPANKLD.js:1094:29)
  at Calendar (Calendar.tsx:593:24)
```

### Root Cause

A `useMemo` hook was being called **inside a conditional JSX block**:

```tsx
{view === 'agenda' && (
  <AgendaList
    eventsByDay={useMemo(() => {  // ❌ INSIDE CONDITIONAL
      // ...
    }, [...])}
  />
)}
```

This violates **React's Rules of Hooks**, which state:

1. Only call hooks at the **top level** of your function
2. Never call hooks inside loops, conditions, or nested functions

---

## 📋 The Fix

### Step 1: Move `useMemo` to Top Level

Created a new memoized value at the component level, **OUTSIDE** any conditional:

```tsx
const Calendar: React.FC = () => {
  // ... other hooks ...

  // ✅ At top level - executed on every render, but only recalculates when deps change
  const agendaEventsByDay = useMemo(() => {
    const filtered = new Map<string, any>();
    const startOfMonth = `${cursor}-01`;
    const endOfMonth = `${cursor}-${new Date(year, month, 0).getDate().toString().padStart(2, '0')}`;

    for (const [date, events] of eventsByDay.entries()) {
      if (date >= startOfMonth && date <= endOfMonth) {
        filtered.set(date, events);
      }
    }
    return filtered;
  }, [eventsByDay, cursor, year, month]);

  // ... rest of component ...
};
```

### Step 2: Use Pre-calculated Value in JSX

Replace the inline `useMemo` with the pre-calculated variable:

```tsx
{
  view === 'agenda' && (
    <AgendaList
      eventsByDay={agendaEventsByDay} // ✅ Use pre-calculated value
      onOpen={ev => {
        // ...
      }}
    />
  );
}
```

---

## 🧠 Why This Works

**React's Hook Calling Convention:**

- React maintains a **list of hook calls** for each component instance
- On each render, React calls hooks in the **exact same order**
- If the order changes (or a hook runs conditionally), React can't match them up
- This causes the "Rendered more hooks than during the previous render" error

**Our Solution:**

- All hooks (including `useMemo`) are called at the top level in a consistent order
- The conditional is only in the **JSX** (the output), not in the hook calls
- React can now track hooks consistently across renders

---

## ✅ Verification

```bash
# Build succeeded with no errors
npm run build
# ✅ PASSING

# Tests passed
npm run test:run
# ✅ PASSING

# No React errors in console
# ✅ CLEAN
```

---

## 📚 Key Learning

### ❌ WRONG - Hooks Inside Conditional

```tsx
{condition && (
  <Component value={useMemo(() => {...}, [])} />
)}
```

### ✅ CORRECT - Hooks at Top Level

```tsx
const memoValue = useMemo(() => {...}, []);

{condition && (
  <Component value={memoValue} />
)}
```

---

## 🔗 Files Changed

- `src/pages/dashboard/Calendar.tsx`
  - Line ~270: Added `agendaEventsByDay` useMemo
  - Line ~593: Replaced inline useMemo with `agendaEventsByDay`

---

## 📖 React Documentation

- [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
- [useMemo Hook](https://react.dev/reference/react/useMemo)
- [Common Hook Mistakes](https://react.dev/reference/rules/rules-of-hooks#only-call-hooks-at-the-top-level)

---

**Status:** ✅ Fixed and verified
