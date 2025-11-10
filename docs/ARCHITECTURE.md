# Architecture Decision Matrix: State Management

**Date**: November 2, 2025  
**Status**: ✅ CANONICAL REFERENCE  
**Audience**: All Engineering Team  
**Purpose**: Single source of truth for where each state type belongs

---

## 🎯 The Problem We're Solving

Currently, On-Tour-App has **3 state management systems coexisting**:

1. **React Context** - For UI state, settings, auth user
2. **Custom ShowStore** - Manual caching with localStorage
3. **React Query** - Server state caching

This creates confusion: **Where does new state go?**

**This document answers that question definitively.**

---

## ✅ Decision Matrix: Where Does State Go?

This matrix is **canonical**. Reference it for every new piece of state.

```
┌─────────────────────────────────────────────────────────────────┐
│                    STATE PLACEMENT DECISION MATRIX              │
├──────────────────────┬────────┬──────────┬───────────┬──────────┤
│ State Type           │Context │ShowStore │React Q    │ Rationale│
├──────────────────────┼────────┼──────────┼───────────┼──────────┤
│ UI State             │ ✅     │ ❌       │ ❌        │ Local,   │
│ (modals, tabs,       │        │          │           │ ephemeral│
│ expanded menus)      │        │          │           │          │
├──────────────────────┼────────┼──────────┼───────────┼──────────┤
│ User Settings        │ ✅     │ ❌       │ ❌        │ Synced   │
│ (language, currency) │ + sync │          │           │ with     │
│                      │        │          │           │ server   │
├──────────────────────┼────────┼──────────┼───────────┼──────────┤
│ Authenticated User   │ ✅     │ ❌       │ ❌        │ Slow-    │
│ (email, roles)       │        │          │           │ changing │
│                      │        │          │           │ critical │
├──────────────────────┼────────┼──────────┼───────────┼──────────┤
│ Domain Data          │ ❌     │ MIGRATE  │ ✅ NEW    │ Server   │
│ (shows, finances,    │        │ to RQ    │           │ source   │
│ travel info)         │        │          │           │ of truth │
├──────────────────────┼────────┼──────────┼───────────┼──────────┤
│ Cache State          │ ❌     │ ❌       │ ✅        │ Derived  │
│ (filtered, sorted,   │        │          │           │ from     │
│ paginated results)   │        │          │           │ server   │
├──────────────────────┼────────┼──────────┼───────────┼──────────┤
│ Optimistic Updates   │ ❌     │ ❌       │ ✅        │ Mutations│
│ (temp UI changes     │        │          │           │ in       │
│ during sync)         │        │          │           │ flight   │
├──────────────────────┼────────┼──────────┼───────────┼──────────┤
│ Offline Persistence  │ ❌     │ ❌       │ ✅        │ React Q  │
│ (cache in storage)   │        │          │ persister │ persister│
└──────────────────────┴────────┴──────────┴───────────┴──────────┘
```

---

## 📚 Examples by Type

### UI State → USE CONTEXT ✅

**What**: Modals, dropdowns, expanded panels, tabs, form state (non-persisted)

**Why**: Local to component tree, doesn't need server sync, fast to change

**Example**:

```typescript
// ✅ CORRECT: Context for UI state
const [isModalOpen, setIsModalOpen] = useState(false);
const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

// Or use Context for shared UI state
export const UIContext = createContext({
  isModalOpen: false,
  setIsModalOpen: () => {},
  expandedRows: new Set<string>(),
  setExpandedRows: () => {},
});
```

**Anti-pattern**:

```typescript
// ❌ WRONG: Don't store UI state in React Query
const { data: isModalOpen } = useQuery(['ui', 'modalOpen']);
```

---

### User Settings → USE CONTEXT + SYNC ✅

**What**: Language preference, currency, theme, timezone

**Why**: User-specific, persists across sessions, syncs with server

**Current**: `SettingsContext` with `useSettingsSync()`

**Example**:

```typescript
// ✅ CORRECT: Context for settings + sync
export const useSettings = () => {
  const context = useContext(SettingsContext);
  useSettingsSync(); // Handles server sync
  return context.settings;
};

// Component usage
const { currency, language } = useSettings();
```

**Anti-pattern**:

```typescript
// ❌ WRONG: Don't manually fetch settings on every component
const [settings, setSettings] = useState(null);
useEffect(() => {
  fetch('/api/settings').then(setSettings);
}, []);
```

---

### Authenticated User → USE CONTEXT ✅

**What**: Current user's email, roles, permissions, profile

**Why**: Critical, loaded once, slow-changing, used everywhere

**Current**: `SettingsContext.user`

**Example**:

```typescript
// ✅ CORRECT: Context for authenticated user
export const useAuth = () => {
  const { user } = useContext(SettingsContext);
  return user;
};

// Component usage
const user = useAuth();
if (!user.isAdmin) return <Forbidden />;
```

**Anti-pattern**:

```typescript
// ❌ WRONG: Don't query user on every page
const { data: user } = useQuery(['user', 'current']);
```

---

### Domain Data (Shows, Finances, Travel) → USE REACT QUERY ✅

**What**: Shows, finances, travel info, any data that comes from server API

**Why**: Server is source of truth, React Query handles sync + caching

**Replacing**: `showStore.getAll()` → `useQuery(['shows'])`

**Example**:

```typescript
// ✅ CORRECT: React Query for server data
export const useShowsQuery = () => {
  return useQuery(['shows'], () => api.get('/api/shows'), {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000,
  });
};

// Component usage
const { data: shows = [] } = useShowsQuery();

// Or with filtering
const { data: confirmedShows = [] } = useQuery(['shows', { status: 'confirmed' }], () =>
  api.get('/api/shows?status=confirmed')
);
```

**Anti-pattern**:

```typescript
// ❌ WRONG: Manual state for server data
const [shows, setShows] = useState([]);
useEffect(() => {
  fetch('/api/shows').then(setShows);
}, []);
```

---

### Filtered/Sorted Results → USE REACT QUERY ✅

**What**: Filtered table results, sorted lists, paginated data

**Why**: Derived from server data, React Query cache handles it

**Example**:

```typescript
// ✅ CORRECT: Query with filter params
export const useFilteredShows = (filter: { status?: string; days?: number }) => {
  return useQuery(['shows', filter], () => api.get('/api/shows', { params: filter }), {
    staleTime: 5 * 60 * 1000,
  });
};

// Component usage
const { data: filtered } = useFilteredShows({ status: 'confirmed', days: 30 });
```

**Anti-pattern**:

```typescript
// ❌ WRONG: Manual filtering in component
const [allShows, setAllShows] = useState([]);
const filtered = useMemo(() => allShows.filter(s => s.status === 'confirmed'), [allShows]);
```

---

### Optimistic Updates → USE REACT QUERY MUTATIONS ✅

**What**: Temporary UI state during API calls (before server confirms)

**Why**: React Query handles rollback if server rejects

**Current**: `useOptimisticMutation` hooks

**Example**:

```typescript
// ✅ CORRECT: React Query mutation with optimistic update
export const useOptimisticShowUpdate = (showId: string) => {
  const queryClient = useQueryClient();

  return useMutation(updates => api.patch(`/api/shows/${showId}`, updates), {
    onMutate: async updates => {
      // Cancel ongoing queries
      await queryClient.cancelQueries(['shows']);

      // Snapshot old data
      const old = queryClient.getQueryData(['shows', showId]);

      // Optimistic update
      queryClient.setQueryData(['shows', showId], prev => ({
        ...prev,
        ...updates,
      }));

      return old; // For rollback
    },
    onError: (error, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['shows', showId], context);
    },
    onSuccess: () => {
      // Re-sync on success
      queryClient.invalidateQueries(['shows']);
    },
  });
};

// Component usage
const { mutate, isLoading } = useOptimisticShowUpdate(id);
mutate({ city: 'Barcelona' });
```

---

### Offline Persistence → USE REACT QUERY PERSISTER ✅

**What**: Cache data to secureStorage for offline access

**Why**: Automatic, integrated into React Query cache lifecycle

**Example**:

```typescript
// ✅ CORRECT: React Query persister
import { createSecureStoragePersister } from '@tanstack/react-query-persist-client';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      persister: createSecureStoragePersister(),
    },
  },
});

// Offline data available automatically:
// 1. User goes offline
// 2. Old React Query cache persisted to secureStorage
// 3. Next visit with cache: loaded from storage
// 4. User comes online: queries re-sync
```

---

## 🚫 Anti-Patterns (What NOT to Do)

### ❌ Anti-Pattern 1: Store Domain Data in Context

```typescript
// WRONG
export const DataContext = createContext();
export const DataProvider = ({ children }) => {
  const [shows, setShows] = useState([]);

  useEffect(() => {
    fetch('/api/shows').then(setShows);
  }, []);

  return <DataContext.Provider value={shows}>{children}</DataContext.Provider>;
};
```

**Why it's bad**:

- Duplicate work (React Query already does this)
- No error handling
- No caching strategy
- No optimistic updates
- No offline support
- No retry logic

**Fix**: Use React Query instead

---

### ❌ Anti-Pattern 2: Manually Implement Caching

```typescript
// WRONG
const [cache, setCache] = useState({});
const [loading, setLoading] = useState(false);

const fetch = async id => {
  if (cache[id]) return cache[id];
  setLoading(true);
  const data = await api.get(`/api/shows/${id}`);
  setCache(prev => ({ ...prev, [id]: data }));
  setLoading(false);
  return data;
};
```

**Why it's bad**:

- Reinventing the wheel
- Stale cache problems
- Memory leaks
- Complex error handling
- No invalidation strategy

**Fix**: Use `useQuery` with React Query's cache

---

### ❌ Anti-Pattern 3: Mix State Systems

```typescript
// WRONG: Using multiple systems for one concept
const shows = useContext(ShowContext); // Context
const { data: showDetails } = useQuery(['shows', id]); // React Query
const showMetadata = showStore.get(id); // Manual store

// Now you have 3 sources of truth!
```

**Why it's bad**:

- Confusion about which is authoritative
- Sync problems between systems
- Hard to debug

**Fix**: Pick one system per concept

---

### ❌ Anti-Pattern 4: Server State in localStorage

```typescript
// WRONG
const [shows, setShows] = useState(() => {
  const saved = localStorage.getItem('shows');
  return saved ? JSON.parse(saved) : [];
});

useEffect(() => {
  localStorage.setItem('shows', JSON.stringify(shows));
}, [shows]);
```

**Why it's bad**:

- Manual sync to server
- Stale data problems
- No invalidation strategy
- Complex to manage

**Fix**: Use React Query persister for offline

---

## 📋 Decision Tree: How to Classify New State

```
NEW STATE
  │
  ├─→ Will it change frequently?
  │   ├─ YES → Likely UI state (Context) ✅
  │   └─ NO → Likely user setting or server data
  │
  ├─→ Does it come from the server?
  │   ├─ YES → React Query (useQuery) ✅
  │   └─ NO → Context (probably)
  │
  ├─→ Is it user-specific?
  │   ├─ YES → Context + Sync (SettingsContext) ✅
  │   └─ NO → Might be global UI state
  │
  ├─→ Does it need to persist offline?
  │   ├─ YES → React Query with persister ✅
  │   └─ NO → React Query (in-memory)
  │
  └─→ Does it represent a mutation in flight?
      ├─ YES → React Query mutation ✅
      └─ NO → Not a mutation state
```

---

## 🔄 Migration: ShowStore → React Query

### Current State

```
showStore.getAll()        → Manual cache + localStorage
showStore.updateShow()    → Manual mutation + localStorage sync
showStore.deleteShow()    → Manual mutation + localStorage sync
showStore.filterByDate()  → Manual filtering
```

### Target State

```
useShowsQuery()                    → React Query cache
useOptimisticShowUpdate()          → React Query mutation
useOptimisticShowDelete()          → React Query mutation
useQuery(['shows', { days: 30 }]) → React Query with params
```

### Timeline

**Phase 1 (Week 5-6)**: Create React Query hooks

- `useShowsQuery()` replaces `showStore.getAll()`
- `useShowMutation()` replaces mutations
- Add React Query persister for offline

**Phase 2 (Week 6)**: Replace first showStore usage

- Update 1 component as test case
- Verify it works
- Get team review

**Phase 3 (Week 7)**: Full migration

- Replace all 15-25 showStore usages
- Delete `showStore.ts` file (87 LOC removed)
- Verify build clean

---

## 🎯 How to Use This Document

### For New Features

1. Read the **Decision Matrix** above
2. Find your state type in the table
3. Use the recommended system
4. Reference the example code

### For Code Review

1. Identify the state type
2. Check against the matrix
3. Ask: "Is this in the right system?"
4. Reference this doc if needed

### For Architecture Discussions

1. Link to this document
2. Point to the relevant row in the matrix
3. "According to our decision matrix, this belongs in [Context/React Query]"

---

## 📞 Questions?

**"Where should X state go?"**
→ Use the Decision Matrix table above

**"What's the difference between Context and React Query?"**
→ See Examples by Type section

**"How do I migrate from ShowStore?"**
→ See Migration section

**"What if my state doesn't fit the matrix?"**
→ Ask in team sync or open an issue

---

## ✅ Team Checklist

- [ ] Everyone read this document
- [ ] Link this from README (pinned reference)
- [ ] Reference in code review checklist
- [ ] Add to onboarding for new team members
- [ ] Review quarterly (update as patterns evolve)

---

**Last Updated**: November 2, 2025  
**Status**: ✅ CANONICAL (Single source of truth)  
**Review Cycle**: Quarterly  
**Owner**: Technical Leadership
