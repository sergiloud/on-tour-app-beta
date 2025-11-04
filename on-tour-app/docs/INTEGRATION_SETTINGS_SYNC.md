# Integration Guide: useSettingsSync for ProfilePage

## Overview

The `useSettingsSync` hook provides multi-tab synchronized settings persistence with automatic debouncing and versioning. This guide explains how to integrate it into the ProfilePage and other components.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   ProfilePage Component                  │
│  (7 tabs: Overview, Preferences, Appearance, etc.)      │
└────────────────┬────────────────────────────────────────┘
                 │ (uses useSettingsWithSync)
┌────────────────▼────────────────────────────────────────┐
│            useSettingsWithSync Hook                      │
│  - Wraps SettingsContext                                │
│  - Enables multi-tab sync                               │
│  - Tracks dirty/syncing state                           │
└────────────────┬────────────────────────────────────────┘
                 │ (delegates to)
┌────────────────▼────────────────────────────────────────┐
│              useSettingsSync Hook                        │
│  - Debounced writes (300ms default)                     │
│  - Handles storage events + CustomEvent broadcast      │
│  - Version tracking and userId support                  │
│  - secureStorage (encrypted localStorage)              │
└─────────────────────────────────────────────────────────┘
```

## API Reference

### useSettingsSync

```typescript
const {
  data, // Current settings object
  isDirty, // True if unsaved changes
  isSyncing, // True while debounce timer active
  save, // (partialData) => Promise<void>
  clear, // () => Promise<void>
  reload, // () => Promise<void>
} = useSettingsSync(initialData, options);
```

**Options:**

- `debounceMs` (number, default: 300): Wait time before persisting
- `userId` (string, optional): User identifier for multi-user storage
- `onError` (function, optional): Error callback
- `onSync` (function, optional): Called after successful persist

### useSettingsWithSync

```typescript
const settingsContext = useSettingsWithSync({ debounceMs: 300 });
// Returns full SettingsContext object plus:
// - isDirty: boolean
// - isSyncing: boolean
// - reload: () => Promise<void>
// - clear: () => Promise<void>
```

## Integration Steps

### Step 1: Import in ProfilePage

```typescript
import { useSettingsWithSync } from '../hooks/useSettingsWithSync';
import { useSettings } from '../context/SettingsContext';
```

### Step 2: Add state tracking for form fields

In `ProfilePage.tsx`, update the component to track sync state:

```typescript
export function ProfilePage() {
  const sync = useSettingsWithSync({ debounceMs: 300 });
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="relative">
      {/* Dirty indicator */}
      {sync.isDirty && (
        <div className="fixed top-4 right-4 flex items-center gap-2 text-sm">
          <span className="animate-pulse">●</span>
          <span>Saving changes...</span>
        </div>
      )}

      {/* Syncing indicator */}
      {sync.isSyncing && (
        <div className="fixed bottom-4 right-4 text-xs text-gray-500">
          Synced across tabs
        </div>
      )}

      {/* Tab content with form fields bound to sync */}
      {activeTab === 'preferences' && (
        <PreferencesTab sync={sync} />
      )}
    </div>
  );
}
```

### Step 3: Update individual tabs to use sync

Example for PreferencesTab:

```typescript
interface PreferencesTabProps {
  sync: ReturnType<typeof useSettingsWithSync>;
}

function PreferencesTab({ sync }: PreferencesTabProps) {
  const handleLanguageChange = (lang: 'en' | 'es') => {
    sync.setLang(lang);
    // Already debounced and synced!
  };

  const handleCurrencyChange = (currency: 'EUR' | 'USD' | 'GBP') => {
    sync.setCurrency(currency);
    // Already debounced and synced!
  };

  return (
    <div className="space-y-4">
      <SettingRow
        icon={<Globe size={20} />}
        title="Language"
        description="Choose your preferred language"
        control={
          <select
            value={sync.lang}
            onChange={(e) => handleLanguageChange(e.target.value as any)}
            className={sync.isDirty ? 'opacity-75' : ''}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        }
      />

      <SettingRow
        icon={<DollarSign size={20} />}
        title="Currency"
        description="Primary currency for amounts"
        control={
          <select
            value={sync.currency}
            onChange={(e) => handleCurrencyChange(e.target.value as any)}
          >
            <option value="EUR">EUR €</option>
            <option value="USD">USD $</option>
            <option value="GBP">GBP £</option>
          </select>
        }
      />
    </div>
  );
}
```

## Multi-Tab Sync Behavior

When a setting is changed:

1. **Immediately** (0ms):
   - UI updates with new value
   - Local state reflects change

2. **Debounce period** (300ms):
   - No writes to storage during this time
   - Subsequent changes are merged
   - `isDirty` is true

3. **After debounce**:
   - Write to secureStorage
   - Broadcast CustomEvent to all tabs
   - `isDirty` becomes false
   - `isSyncing` pulse completes

4. **In other tabs**:
   - Listen for CustomEvent or storage events
   - Update local state automatically
   - No user action required

### Example: User Changes Language in Tab A

```
Tab A (Active)                    Tab B (Background)
─────────────                     ──────────────────
User selects "Español"
│
├─ Update UI immediately
├─ Set lang='es'
├─ isDirty = true
│
  ├─ 300ms debounce...
  │
  └─ Write to storage
     ├─ Broadcast CustomEvent
     └─ isDirty = false
                                  CustomEvent received
                                  ├─ Update local state
                                  ├─ lang = 'es'
                                  └─ UI reflects change
```

## Storage Structure

Settings are stored in secureStorage (encrypted localStorage) with this structure:

```json
{
  "ota.settings.data": {
    "currency": "EUR",
    "unit": "km",
    "lang": "es",
    "presentationMode": false,
    "region": "EMEA",
    "dateRange": { "from": "2025-01-01", "to": "2025-01-31" },
    "periodPreset": "MTD",
    "comparePrev": true,
    "selectedStatuses": ["confirmed", "pending"],
    "dashboardView": "default",
    "kpiTickerHidden": false,
    "bookingAgencies": [...],
    "managementAgencies": [...],
    "__version": 1,
    "__timestamp": 1704067200000,
    "_userId": "danny_avila"
  },
  "ota.settings.version": 1,
  "ota.settings.timestamp": "1704067200000",
  "ota.settings.userId": "danny_avila"
}
```

## Testing

### Unit Tests

Run useSettingsSync tests:

```bash
npm run test -- src/__tests__/useSettingsSync.test.ts
```

### Manual Multi-Tab Testing

1. Open app in Chrome/Firefox
2. Open DevTools and go to Application → Local Storage
3. Open same app in another tab
4. Change a setting in Tab A
5. Observe change appears in Tab B within 300ms
6. Check storage shows version and timestamp updated

### Debugging

Enable logging in browser console:

```javascript
// In SettingsContext or ProfilePage
console.log('[useSettingsSync]', {
  isDirty,
  isSyncing,
  data,
  timestamp: getSettingsLastSync(),
  version: getSettingsVersion(),
});
```

## Performance Considerations

1. **Debouncing**: 300ms prevents excessive writes during rapid changes
2. **Partial Updates**: Only changed fields are merged
3. **Encryption**: secureStorage encrypts all data at rest
4. **Version Tracking**: Enables future migrations without data loss
5. **Multi-tab**: CustomEvent broadcasts to other tabs without re-fetch

## Migration Notes

### From Current ProfilePage

Current ProfilePage uses local state only:

```typescript
// Before: Local state, no persistence
const [theme, setTheme] = useState(settingsContext.theme);
```

Updated to use sync:

```typescript
// After: Synced state, automatic persistence
const sync = useSettingsWithSync();
// Use sync.theme directly or call sync methods
```

### Backward Compatibility

The SettingsContext continues to work as before. The sync layer is additive:

- Existing code continues to work
- New components can use `useSettingsWithSync` for enhanced persistence
- Legacy `useSettings()` hook still works

## FAQ

**Q: What happens if storage quota is exceeded?**
A: `onError` callback is triggered, UI continues to work, change stays in memory.

**Q: Can I use this outside ProfilePage?**
A: Yes! Any component can use `useSettingsSync` or `useSettingsWithSync`.

**Q: Does this work offline?**
A: Yes. Changes are persisted locally and synced when storage is available.

**Q: What's the version field for?**
A: Allows future schema migrations. When you change the structure, bump SETTINGS_VERSION and add migration logic.

**Q: Why debounce?**
A: Prevents excessive localStorage writes (storage quota, performance). 300ms feels instant to users but batches rapid changes.

---

## Next Steps

1. Update ProfilePage to import and use `useSettingsWithSync`
2. Run test suite: `npm run test`
3. Test multi-tab sync manually
4. Deploy and monitor error tracking

See `docs/ROADMAP_MVP_ENTERPRISE.md` Semana 1 for timeline.
