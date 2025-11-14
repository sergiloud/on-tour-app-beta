# Zustand Migration Guide

## Why Zustand?

Moving from React Context to Zustand provides several key benefits:

### 1. **No Provider Hell**
**Before (Context):**
```tsx
<AuthProvider>
  <SettingsProvider>
    <ThemeProvider>
      <FinanceProvider>
        <ShowsProvider>
          <App />
        </ShowsProvider>
      </FinanceProvider>
    </ThemeProvider>
  </SettingsProvider>
</AuthProvider>
```

**After (Zustand):**
```tsx
<App /> // Clean, no providers needed
```

### 2. **Granular Subscriptions = Better Performance**
**Before (Context):**
```tsx
// Every component consuming SettingsContext re-renders
// when ANY setting changes
const { theme, lang, currency, region, ... } = useSettings();
```

**After (Zustand):**
```tsx
// Component only re-renders when theme changes
const theme = useSettingsStore(state => state.theme);

// Or use selector for even more control
const theme = useTheme(); // Custom hook with selector
```

### 3. **Cleaner API**
**Before (Context):**
```tsx
const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider: React.FC<Props> = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [lang, setLang] = useState('en');
  // ... 20 more state variables
  
  return (
    <SettingsContext.Provider value={{ theme, setTheme, lang, setLang, ... }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
```

**After (Zustand):**
```tsx
export const useSettingsStore = create<SettingsState>()((set) => ({
  theme: 'light',
  lang: 'en',
  setTheme: (theme) => set({ theme }),
  setLang: (lang) => set({ lang }),
}));

// Usage: const theme = useSettingsStore(state => state.theme);
```

### 4. **Built-in DevTools & Middleware**
```tsx
import { devtools, persist } from 'zustand/middleware';

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set) => ({ /* state */ }),
      { name: 'settings-store' }
    ),
    { name: 'SettingsStore' }
  )
);
```

## Migration Strategy

### Phase 1: Create Zustand Stores (✅ DONE)

Created stores:
- `src/stores/showsStore.ts` - Shows management
- `src/stores/settingsStore.ts` - App settings

### Phase 2: Gradual Migration (IN PROGRESS)

#### Step 1: Add Zustand alongside Context
- Keep existing Context providers
- New components use Zustand stores
- Old components continue using Context

#### Step 2: Migrate Components One-by-One

**Example: Migrating FinanceOverview**

**Before:**
```tsx
import { useSettings } from '../context/SettingsContext';

const FinanceOverview = () => {
  const { currency, fmtMoney, comparePrev } = useSettings();
  
  return <div>{fmtMoney(5000)}</div>;
};
```

**After:**
```tsx
import { useSettingsStore } from '../stores/settingsStore';

const FinanceOverview = () => {
  const currency = useSettingsStore(state => state.currency);
  const fmtMoney = useSettingsStore(state => state.fmtMoney);
  const comparePrev = useSettingsStore(state => state.comparePrev);
  
  return <div>{fmtMoney(5000)}</div>;
};
```

**Optimized (Granular Subscriptions):**
```tsx
// Component only re-renders when fmtMoney or comparePrev changes
const FinanceOverview = () => {
  const fmtMoney = useSettingsStore(state => state.fmtMoney);
  const comparePrev = useSettingsStore(state => state.comparePrev);
  
  return <div>{fmtMoney(5000)}</div>;
};
```

#### Step 3: Remove Context Providers
Once all components migrated:
- Remove `<SettingsProvider>` from `App.tsx`
- Delete `src/context/SettingsContext.tsx`
- Update imports

### Phase 3: Advanced Patterns

#### Computed Selectors
```tsx
// In settingsStore.ts
export const selectThemeClass = (state: SettingsState) => 
  state.theme === 'system' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : state.theme;

// Usage
const themeClass = useSettingsStore(selectThemeClass);
```

#### Actions with Side Effects
```tsx
setTheme: (theme) => {
  set({ theme });
  
  // Update DOM
  document.documentElement.classList.toggle('dark', theme === 'dark');
  
  // Track analytics
  trackEvent('theme_changed', { theme });
},
```

#### Zustand + TanStack Query Integration
```tsx
const shows = useShowsStore(state => state.shows);
const { data: serverShows } = useQuery({
  queryKey: ['shows'],
  queryFn: fetchShows
});

// Sync server data to local store
useEffect(() => {
  if (serverShows) {
    useShowsStore.getState().setShows(serverShows);
  }
}, [serverShows]);
```

## Stores to Create

### ✅ Completed
- `showsStore` - Shows management
- `settingsStore` - App settings

### 🚧 Recommended Next
- `authStore` - Auth state (user, token, loading)
- `uiStore` - UI state (modals, toasts, sidebar)
- `financeStore` - Finance targets, filters, view state

### Future
- `calendarStore` - Calendar view state, filters
- `travelStore` - Travel bookings, routes

## Testing Zustand Stores

```tsx
import { renderHook, act } from '@testing-library/react';
import { useShowsStore } from '../stores/showsStore';

describe('ShowsStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useShowsStore.setState({ shows: [] });
  });

  it('should add show', () => {
    const { result } = renderHook(() => useShowsStore());
    
    act(() => {
      result.current.addShow({
        id: '1',
        name: 'Test Show',
        city: 'Barcelona',
        // ...
      });
    });
    
    expect(result.current.shows).toHaveLength(1);
    expect(result.current.shows[0].name).toBe('Test Show');
  });
});
```

## Performance Comparison

### Context Re-renders
```tsx
// All 3 components re-render when ANY setting changes
const ComponentA = () => {
  const { theme } = useSettings();
  return <div className={theme}>A</div>;
};

const ComponentB = () => {
  const { lang } = useSettings();
  return <div>Language: {lang}</div>;
};

const ComponentC = () => {
  const { currency } = useSettings();
  return <div>Currency: {currency}</div>;
};
```

### Zustand Selective Re-renders
```tsx
// Component A only re-renders when theme changes
const ComponentA = () => {
  const theme = useSettingsStore(state => state.theme);
  return <div className={theme}>A</div>;
};

// Component B only re-renders when lang changes
const ComponentB = () => {
  const lang = useSettingsStore(state => state.lang);
  return <div>Language: {lang}</div>;
};

// Component C only re-renders when currency changes
const ComponentC = () => {
  const currency = useSettingsStore(state => state.currency);
  return <div>Currency: {currency}</div>;
};
```

**Result:** 3x fewer re-renders!

## Migration Checklist

### Shows
- [ ] Update `src/components/shows/ShowsList.tsx`
- [ ] Update `src/pages/dashboard/Shows.tsx`
- [ ] Update `src/context/FinanceContext.tsx` (uses showStore)
- [ ] Remove `src/shared/showStore.ts` (legacy)

### Settings
- [ ] Update all components using `useSettings()`
- [ ] Update `src/components/Header.tsx`
- [ ] Update `src/pages/Preferences.tsx`
- [ ] Remove `src/context/SettingsContext.tsx`
- [ ] Remove SettingsProvider from `App.tsx`

### Auth
- [ ] Create `src/stores/authStore.ts`
- [ ] Migrate components using `useAuth()`
- [ ] Remove `src/context/AuthContext.tsx`

## Resources

- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Zustand vs Context Performance](https://github.com/pmndrs/zustand#why-zustand-over-context)
- [Testing Zustand](https://github.com/pmndrs/zustand/blob/main/docs/guides/testing.md)
