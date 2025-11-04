# i18next Migration Guide

## Overview

Migration from custom i18n system to i18next with backward compatibility.

### Why i18next?

- **Namespaces**: Organize translations by feature (profile, finance, travel, common)
- **Lazy Loading**: Load only needed languages/namespaces
- **Scalability**: Better for enterprise multi-language support
- **Ecosystem**: Rich plugin ecosystem, active community
- **Backward Compatible**: Custom i18n continues to work during transition

## Architecture

```
┌─────────────────────────────────────────────┐
│         App (main.tsx)                       │
│    ├─ I18nProvider (wraps i18next)          │
│    └─ Components (use useI18nWithNext)      │
└─────────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
   ┌────▼────┐          ┌────▼──────┐
   │ i18next  │ ◄─────► │ Custom i18n│
   │ (NEW)    │ fallback│ (OLD)      │
   └────┬────┘          └────┬──────┘
        │                     │
   ┌────▼──────────┐     ┌───▼────────┐
   │ locales/      │     │ src/lib/   │
   │ en/           │     │ i18n.ts    │
   │ ├─common.json │     │ (3795 lines)
   │ ├─profile.json│     └───────────┘
   │ ├─finance.json│
   │ └─travel.json │
   └───────────────┘
```

## Installation

Already done via `npm install`:

- i18next
- react-i18next
- i18next-browser-languagedetector

## Setup

### 1. Provider in main.tsx

```typescript
import { I18nProvider } from './components/I18nProvider';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>
);
```

### 2. Configuration (src/lib/i18n/config.ts)

Already created with:

- 4 namespaces: common, profile, finance, travel
- Language detection (browser + secureStorage preference)
- Lazy loading backend
- Fallback to English

## Migration Strategy

### Phase 1: Gradual Component Migration (Current - Semana 1)

Migrate components one at a time, using `useI18nWithNext()` hook:

```typescript
// Old way (still works):
import { useI18n } from '../lib/i18n';

export function OldComponent() {
  const { t } = useI18n();
  return <div>{t('cmd.go.profile')}</div>;
}

// New way (during migration):
import { useI18nWithNext } from '../hooks/useI18nWithNext';

export function MigratingComponent() {
  const { t } = useI18nWithNext();

  // Old-style keys still work (fallback to custom i18n):
  return <div>{t('cmd.go.profile')}</div>;

  // New-style with namespaces also work:
  // return <div>{t('profile:profile.tabs.overview')}</div>;
}
```

### Recommended Migration Order

1. **UserMenu** (nav component) - high visibility, few keys
2. **ProfilePage** - complex, showcase new capabilities
3. **Dashboard** - finance + travel namespaces
4. **Remaining components** - gradual refactor

## Translation Keys

### Namespace: common

Global navigation and common UI elements:

```json
{
  "cmd.go.profile": "Go to Profile",
  "nav.profile": "Profile",
  "common.save": "Save",
  "auth.login": "Login"
}
```

### Namespace: profile

Profile page and settings:

```json
{
  "profile.title": "Profile",
  "profile.tabs.overview": "Overview",
  "profile.tabs.preferences": "Preferences",
  "profile.preferences.language": "Language"
}
```

### Namespace: finance

Finance dashboard and reports:

```json
{
  "finance.title": "Finance",
  "finance.revenue": "Revenue",
  "finance.agencies": "Agencies"
}
```

### Namespace: travel

Travel calendar and itinerary:

```json
{
  "travel.title": "Travel",
  "travel.calendar": "Calendar",
  "travel.itinerary": "Itinerary"
}
```

## Usage Patterns

### Pattern 1: Simple Key (Backward Compatible)

```typescript
const { t } = useI18nWithNext();

// Works with custom i18n (falls back):
<span>{t('cmd.go.profile')}</span>
```

### Pattern 2: Namespaced Key (New Way)

```typescript
const { t } = useI18nWithNext();

// Uses i18next namespace:
<span>{t('profile:profile.title')}</span>
```

### Pattern 3: Language Change

```typescript
const { t, setLang } = useI18nWithNext();

const handleLanguageChange = async (lang) => {
  await setLang(lang); // Updates both i18next and custom i18n
};

return (
  <select onChange={(e) => handleLanguageChange(e.target.value)}>
    <option value="en">English</option>
    <option value="es">Español</option>
    <option value="fr">Français</option>
  </select>
);
```

### Pattern 4: Advanced i18n Use (with options)

```typescript
const { t, i18n } = useI18nWithNext();

// Formatting with options:
<span>{t('finance:finance.total', {
  amount: 1234.56,
  currency: 'EUR'
})}</span>

// Plural handling:
<span>{t('travel:travel.days', { count: 5 })}</span>

// List items with i18next:
const languages = i18n.options.ns.map(ns => ...);
```

## Storage & Persistence

### Language Preference

Stored in secureStorage with key `app.language`:

```json
{
  "app.language": "es"
}
```

Persists across sessions and syncs with SettingsContext.

### Translation Cache

i18next caches loaded namespaces in memory:

- First load: Async import via lazyLoadBackend
- Subsequent loads: From memory (instant)

## Testing i18n

### Unit Tests

```bash
npm run test -- src/__tests__/i18n.test.ts
```

### Manual Testing

1. **Language Switch**: Change language in app, verify translations update
2. **Multi-tab Sync**: Open two tabs, change language in one, verify other updates
3. **Persistence**: Refresh page, verify saved language remains
4. **Fallback**: Disable i18next, verify custom i18n still works
5. **Missing Keys**: Add unknown key like `t('unknown.key')`, verify it returns key itself

### Browser Testing

Open DevTools → Application → Local Storage:

- Check `app.language` is saved correctly
- Check i18next cache in IndexedDB (if configured)

## Troubleshooting

### Issue: Translations not loading

**Symptom**: Keys appear as-is (e.g., "profile:profile.title")

**Solutions**:

1. Check locale JSON files exist in `src/locales/[lang]/[namespace].json`
2. Check namespace name matches (e.g., "profile" not "profiles")
3. Check key path is exact (JSON must have exact structure)

**Debug**:

```javascript
// In browser console:
i18next.getResourceBundle('es', 'profile');
// Should show translations object
```

### Issue: Language not persisting

**Symptom**: After refresh, language reverts to English

**Solutions**:

1. Check `app.language` in localStorage (DevTools → Storage)
2. Check `secureStorage.setItem` not throwing errors
3. Verify browser allows localStorage writes

### Issue: Fallback not working

**Symptom**: Old i18n keys like `t('cmd.go.profile')` return undefined

**Solutions**:

1. Ensure `useI18nWithNext()` is used (not `useTranslation()` directly)
2. Check custom i18n module is loaded (no import errors)
3. Verify key exists in `src/lib/i18n.ts` dictionary

## Performance Considerations

1. **Lazy Loading**: Only specified namespaces loaded on demand
2. **Debounce**: Language changes debounced with i18next
3. **Caching**: Loaded namespaces stay in memory
4. **Bundle Size**:
   - i18next: ~15 KB (minified)
   - react-i18next: ~10 KB (minified)
   - Translations: ~50 KB (all languages + namespaces)

## Next Steps

1. **Semana 1 (Current)**:
   - ✅ Install packages
   - ✅ Create config + locale files
   - ✅ Create compatibility hook
   - ⏳ Migrate 2-3 key components (UserMenu, ProfilePage)
   - ⏳ QA testing

2. **Semana 2+**:
   - Migrate remaining components
   - Remove custom i18n once all components migrated
   - Add more languages (Portuguese variant, etc.)
   - Add translation management UI

## References

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Guide](https://react.i18next.com/)
- [Browser Language Detector](https://github.com/i18next/i18next-browser-languagedetector)
- [Custom Backend](https://www.i18next.com/misc/creating-own-plugin#backend)

---

**Status**: Semana 1 - Installation & Configuration Complete
**Next Action**: Migrate UserMenu component to use `useI18nWithNext()`
