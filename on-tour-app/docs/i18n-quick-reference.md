# i18n System - Quick Reference

## 🚀 Quick Start

```typescript
import { useI18n } from './lib/i18n';

function MyComponent() {
  const { lang, t } = useI18n();
  
  return <button>{t('common.save')}</button>;
}
```

## 🌍 Supported Languages

| Code | Language | Status |
|------|----------|--------|
| `en` | English 🇬🇧 | ✅ |
| `es` | Español 🇪🇸 | ✅ |
| `fr` | Français 🇫🇷 | ✅ |
| `de` | Deutsch 🇩🇪 | ✅ |
| `it` | Italiano 🇮🇹 | ✅ |
| `pt` | Português 🇵🇹 | ✅ |

## 📚 Main Categories

- **common**: Buttons, actions, states (~40 keys)
- **auth**: Login, signup, password (~19 keys)
- **shows**: Show management (~16 keys)
- **finance**: Financial terms (~14 keys)
- **travel**: Flights, hotels, trips (~34 keys)
- **calendar**: Events, dates (~30 keys)
- **validation**: Form validation (~12 keys)
- **error**: Error messages (~5 keys)

## 💡 Common Patterns

### Translate Text
```typescript
t('common.save')      // "Save" / "Guardar" / "Enregistrer"
t('auth.signIn')      // "Sign in" / "Iniciar sesión"
t('error.generic')    // "An error occurred" / "Ocurrió un error"
```

### Change Language
```typescript
import { setLang } from './lib/i18n';

setLang('es'); // Change to Spanish
```

### Get Current Language
```typescript
import { getLang } from './lib/i18n';

const currentLang = getLang(); // 'en' | 'es' | etc.
```

## 🎯 Most Used Keys

```typescript
// Common
'common.save'
'common.cancel'
'common.delete'
'common.edit'
'common.close'
'common.back'

// Auth
'auth.signIn'
'auth.signUp'
'auth.email'
'auth.password'
'auth.forgotPassword'

// Navigation
'nav.dashboard'
'nav.shows'
'nav.travel'
'nav.calendar'
'nav.finance'
'nav.settings'

// Validation
'validation.required'
'validation.passwordRequired'
'validation.invalidEmail'

// Errors
'error.generic'
'error.tryAgain'
'error.somethingWentWrong'
```

## 📊 Stats

- **Total keys**: 600+
- **Total translations**: 3,600+
- **File size**: ~145 KB
- **Bundle size**: ~4.5 KB gzipped

## 🔗 Full Documentation

See [i18n-system.md](./i18n-system.md) for complete documentation.
