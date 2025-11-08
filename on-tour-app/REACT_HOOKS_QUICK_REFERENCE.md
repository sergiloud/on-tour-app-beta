# 🚀 Quick Reference - React Hooks Rules

## The Golden Rule

**All hooks must be called at the TOP LEVEL of a function component, never inside conditionals or loops.**

---

## ❌ Common Mistakes

### 1. Hook Inside Conditional

```tsx
// ❌ WRONG
const Component = () => {
  if (someCondition) {
    const value = useMemo(() => expensive(), []); // ERROR!
  }
};
```

### 2. Hook Inside Loop

```tsx
// ❌ WRONG
const Component = () => {
  for (let i = 0; i < 5; i++) {
    const [state, setState] = useState(0); // ERROR!
  }
};
```

### 3. Hook Inside Nested Function

```tsx
// ❌ WRONG
const Component = () => {
  const handleClick = () => {
    const [state, setState] = useState(0); // ERROR!
  };
};
```

### 4. Hook Inside JSX Conditional

```tsx
// ❌ WRONG
const Component = () => {
  return (
    <div>
      {condition && (
        <Child data={useMemo(() => expensive(), [])} /> // ERROR!
      )}
    </div>
  );
};
```

---

## ✅ Correct Patterns

### 1. All Hooks at Top Level

```tsx
// ✅ CORRECT
const Component = () => {
  const [state, setState] = useState(0);
  const memoValue = useMemo(() => expensive(), []);
  useEffect(() => {}, []);

  if (condition) {
    return <Fallback />;
  }

  return <Component data={memoValue} />;
};
```

### 2. Conditional Rendering, Not Conditional Hooks

```tsx
// ✅ CORRECT
const Component = () => {
  const memoValue = useMemo(() => expensive(), []);

  return <div>{condition && <Child data={memoValue} />}</div>;
};
```

### 3. Early Return Before Hooks is Fine

```tsx
// ✅ CORRECT (Early return before any hooks)
const Component = ({ disabled }) => {
  if (disabled) {
    return <p>Disabled</p>; // Early return, no hooks called yet
  }

  const [state, setState] = useState(0); // OK - only called when not disabled
  return <div>{state}</div>;
};
```

---

## 🎯 Calendar.tsx Example

### The Problem (Before)

```tsx
{
  view === 'agenda' && (
    <AgendaList
      eventsByDay={useMemo(() => {
        // ❌ Hook inside conditional
        const filtered = new Map();
        // ... filtering logic
        return filtered;
      }, [eventsByDay, cursor])}
    />
  );
}
```

**Why it fails:**

- First render: `useMemo` is called (1 hook)
- When `view !== 'agenda'`: No `useMemo` (0 hooks)
- Back to `view === 'agenda'`: Hook called again (1 hook)
- React sees: 0 hooks → 1 hook → inconsistent! ❌

### The Solution (After)

```tsx
// At top level (always called in same order)
const agendaEventsByDay = useMemo(() => {
  const filtered = new Map();
  // ... filtering logic
  return filtered;
}, [eventsByDay, cursor, year, month]);

// In JSX (conditional rendering, not conditional hooks)
{
  view === 'agenda' && (
    <AgendaList eventsByDay={agendaEventsByDay} /> // ✅ Using pre-calculated value
  );
}
```

**Why it works:**

- Every render: `useMemo` is called in same order ✅
- Conditional is only in JSX output ✅
- React tracks hooks consistently ✅

---

## 🔧 How to Fix Hooks Errors

### Step 1: Identify the Hook

Look at the error message - it tells you which hook is wrong:

```
Warning: React has detected a change in the order of Hooks called by Calendar.
...
at useMemo (chunk-YHPANKLD.js:1094:29)
at Calendar (Calendar.tsx:593:24)
```

**The problem hook:** `useMemo` at line 593

### Step 2: Check if it's in a Conditional

```tsx
// Search for the hook in if/for/ternary/JSX conditional
{condition && <Component data={useMemo(...)} />}  // ❌ Found it!
```

### Step 3: Move to Top Level

```tsx
const memoValue = useMemo(...);  // Move here

{condition && <Component data={memoValue} />}  // Use pre-calculated value
```

### Step 4: Verify Hook Order

Make sure all hooks are in the same order on every render:

```tsx
useState(); // 1st hook (always called)
useEffect(); // 2nd hook (always called)
useMemo(); // 3rd hook (always called) ✅
```

### Step 5: Build & Test

```bash
npm run build     # Should pass
npm run test:run  # Should pass
```

---

## 📋 Hooks Affected by This Rule

All React hooks must follow this rule:

- `useState`
- `useEffect`
- `useContext`
- `useReducer`
- `useCallback`
- `useMemo`
- `useRef`
- `useLayoutEffect`
- Custom hooks (they internally use hooks)

---

## 💡 Pro Tips

1. **Use ESLint:** Install `eslint-plugin-react-hooks` to catch these errors during development

   ```bash
   npm install --save-dev eslint-plugin-react-hooks
   ```

2. **Think "Top-Level First":** When writing a component, place all hooks before any conditional logic

3. **Extract Logic:** If you need conditional hooks, extract to a separate component

   ```tsx
   // Instead of conditional hook in one component
   // Create separate components:
   const ConditionalComponent = () => {
     const memoValue = useMemo(...);
     return ...;
   };

   const MainComponent = ({ condition }) => {
     return condition ? <ConditionalComponent /> : <Fallback />;
   };
   ```

4. **Dependencies Matter:** Don't forget the dependency array!
   ```tsx
   const value = useMemo(
     () => expensive(a, b), // Function
     [a, b] // Dependencies - add all values used inside!
   );
   ```

---

## 🔗 Resources

- [React Docs: Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
- [React Hooks API Reference](https://react.dev/reference/react)
- [ESLint React Hooks Plugin](https://www.npmjs.com/package/eslint-plugin-react-hooks)

---

**Remember:** When in doubt, move your hook to the TOP LEVEL! 🚀
