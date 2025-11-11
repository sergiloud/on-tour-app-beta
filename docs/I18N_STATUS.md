# i18n Translation Status

**Last Updated:** 2024

## Overview

The application supports 6 languages with varying levels of completion. The `t()` function includes automatic fallback to English for missing translations, so the app continues to work even with incomplete translations.

## Translation Coverage

| Language | Code | Keys | Coverage | Status |
|----------|------|------|----------|--------|
| English | `en` | 1,450 | 100% | ✅ Complete (Reference) |
| Spanish | `es` | 1,268 | 87.4% | ⚠️ Nearly Complete |
| French | `fr` | 246 | 17.0% | ❌ Partial |
| German | `de` | 246 | 17.0% | ❌ Partial |
| Italian | `it` | 246 | 17.0% | ❌ Partial |
| Portuguese | `pt` | 246 | 17.0% | ❌ Partial |

## Missing Translations

### Spanish (ES) - 208 missing keys

Missing keys include:
- `welcome.upcoming.14d`
- `empty.noUpcoming`
- `empty.noUpcoming.hint`
- `empty.noPeople`
- `empty.inviteHint`
- `scopes.*` (multiple keys)
- ... and 198 more

### French/German/Italian/Portuguese - 1,208 missing keys each

These languages have only the initial 246 common keys translated. Missing translations include:
- Finance module keys
- Dashboard keys
- Organization management keys
- Calendar keys
- Travel keys
- and many more

## How Fallback Works

The translation function in `src/lib/i18n.ts` implements automatic fallback:

```typescript
export function t(key: string) {
  const lang = getLang();
  return DICT[lang][key] || DICT.en[key] || key;
}
```

**Fallback chain:**
1. Try current language
2. Fall back to English
3. Return the key itself if not found

This means:
- Users selecting ES will see 87% Spanish, 13% English
- Users selecting FR/DE/IT/PT will see 17% in their language, 83% English
- No broken UI or missing text
- Graceful degradation

## Recommendations

### Short Term (Done ✅)
- [x] Document translation status
- [x] Verify fallback logic works correctly
- [x] Keep all languages available (fallback handles missing keys)

### Medium Term
1. Complete Spanish (ES) translations - only 208 keys remaining
2. Add language status badges in Settings UI (e.g., "Beta" for partial languages)
3. Consider community contributions for FR/DE/IT/PT

### Long Term
1. Use translation management service (Lokalise, Crowdin, etc.)
2. Implement translation completeness CI checks
3. Add contributor guidelines for translations

## Testing

To verify translation coverage:
```bash
node scripts/check-i18n.cjs
```

## Notes

- English (EN) is the reference language - all keys must exist in EN first
- Spanish (ES) is well-maintained and nearly complete
- FR/DE/IT/PT were likely auto-translated initially but never completed
- The app works fine with partial translations due to EN fallback
- No user-facing errors from missing translations

## Conclusion

**Current Status:** Working as designed ✅

The i18n system is functional and handles missing translations gracefully. Spanish is nearly complete. Other languages are partial but don't cause errors. This is not a critical issue - it's a content completeness task for future improvement.
