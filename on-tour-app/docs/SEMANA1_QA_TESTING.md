# Semana 1 QA Testing Guide

## Overview

Testing checklist for Semana 1 deliverables:
1. **Settings Persistence**: useSettingsSync multi-tab sync
2. **i18n Migration**: i18next setup and compatibility
3. **Integration**: ProfilePage + UserMenu work with both systems

---

## Section 1: Settings Persistence Testing

### Test 1.1: Single Tab Settings Persistence

**Objective**: Verify settings save and reload in same tab

**Steps**:
1. Open app in Chrome/Firefox
2. Navigate to `/dashboard/profile`
3. Go to "Preferences" tab
4. Change "Language" from "English" to "Español"
5. Observe UI updates to Spanish immediately
6. **Expected**: UI changes are instant, debounce indicator appears

**Validation**:
```javascript
// In DevTools Console:
localStorage.getItem('ota.settings.data')
// Should show: {..., lang: "es", __version: 1, __timestamp: timestamp}

// Verify secureStorage contains it:
secureStorage.getItem('ota.settings.data')
// Should return same data (encrypted)
```

**Pass Criteria**: 
- ✅ Language changes immediately
- ✅ Settings appear in localStorage after 300ms debounce
- ✅ localStorage shows __version and __timestamp

### Test 1.2: Multi-Tab Settings Sync

**Objective**: Verify settings sync between two browser tabs

**Steps**:
1. Open app in Tab A at `/dashboard/profile`
2. Open same URL in Tab B
3. In Tab A, go to "Preferences" tab
4. Change currency from "EUR" to "USD"
5. Switch to Tab B within 2 seconds
6. **Expected**: Tab B shows "USD" without page refresh

**Validation**:
```javascript
// Tab A: Verify change queued
window.ota_debug = { isDirty: true, isSyncing: true };

// Tab B: Verify CustomEvent received
window.addEventListener('ota:settings:sync-complete', (e) => {
  console.log('Sync received:', e.detail);
  // Should log: {data: {..., currency: "USD"}, timestamp: ...}
});
```

**Pass Criteria**:
- ✅ Tab B updates without manual refresh
- ✅ Both tabs show same currency value after sync
- ✅ Update completes within 500ms

### Test 1.3: Settings Persistence Across Refresh

**Objective**: Verify settings load on page refresh

**Steps**:
1. In ProfilePage/Preferences, change theme to "Dark"
2. Press F5 to refresh page
3. Wait for page load
4. Navigate back to ProfilePage
5. **Expected**: Theme setting is still "Dark"

**Validation**:
```javascript
// After refresh:
localStorage.getItem('ota.settings.data')
// Should show: {..., theme: "dark", __version: 1}

// Check SettingsContext:
window.ctx = useSettings(); // In component
console.log(ctx.presentationMode); // Should show saved value
```

**Pass Criteria**:
- ✅ Settings persist after refresh
- ✅ SettingsContext loads correct values
- ✅ No console errors on load

### Test 1.4: Settings Clear Function

**Objective**: Verify clear() method resets to defaults

**Steps**:
1. Change multiple settings (lang, currency, theme)
2. Call `await sync.clear()` (add test button to profile)
3. Page should reload with defaults
4. Check localStorage is cleared

**Pass Criteria**:
- ✅ All settings reset to initial values
- ✅ localStorage keys removed (ota.settings.*)
- ✅ SettingsContext reflects reset

### Test 1.5: Settings Reload Function

**Objective**: Verify reload() reloads from storage

**Steps**:
1. In Tab A, change language to "es"
2. In Tab B console, call `await sync.reload()`
3. Tab B should update to "es" from storage
4. No manual refresh required

**Pass Criteria**:
- ✅ reload() updates local state from storage
- ✅ UI reflects reloaded values
- ✅ Works without page refresh

---

## Section 2: i18n Migration Testing

### Test 2.1: Language Detection

**Objective**: Verify browser language detection works

**Steps**:
1. Clear all app storage: `localStorage.clear()`
2. Refresh page
3. Check DevTools Console for detected language
4. **Expected**: Detected language matches browser language (or falls back to English)

**Validation**:
```javascript
// In console:
i18next.language // Should match browser lang or 'en'
secureStorage.getItem('app.language') // Should now be saved
```

**Pass Criteria**:
- ✅ Detected language matches browser setting
- ✅ Falls back to English if browser lang not supported
- ✅ Language persists after refresh

### Test 2.2: Translation Loading (i18next)

**Objective**: Verify namespaced translations load

**Steps**:
1. In component console:
```javascript
i18next.getResourceBundle('en', 'common')
i18next.getResourceBundle('en', 'profile')
i18next.getResourceBundle('es', 'finance')
```
2. Verify each returns proper translation object
3. Check that all keys are present

**Pass Criteria**:
- ✅ All namespaces load without errors
- ✅ Translations contain expected keys
- ✅ No 404 errors for locale files

### Test 2.3: Translation Key Lookup (Backward Compatible)

**Objective**: Verify custom i18n fallback works

**Steps**:
1. In component using `useI18nWithNext()`:
```typescript
const { t } = useI18nWithNext();
const cmdProfile = t('cmd.go.profile'); // Old-style key
const profileTitle = t('profile:profile.title'); // New-style key
```
2. Both should return correct translations

**Pass Criteria**:
- ✅ Old-style keys work (fallback to custom i18n)
- ✅ New-style keys work (use i18next)
- ✅ Unknown keys return key itself (not error)

### Test 2.4: Language Change Persistence

**Objective**: Verify language change persists

**Steps**:
1. In ProfilePage/Preferences, change language to "Français"
2. Observe UI updates to French immediately
3. Refresh page
4. **Expected**: UI still shows French

**Validation**:
```javascript
// After refresh:
i18next.language === 'fr' // true
secureStorage.getItem('app.language') // 'fr'
```

**Pass Criteria**:
- ✅ Language change updates i18next
- ✅ Language persists in secureStorage
- ✅ UI shows new language after refresh

### Test 2.5: Multi-Tab Language Sync

**Objective**: Verify language change syncs to other tabs

**Steps**:
1. Open app in Tab A and Tab B
2. In Tab A/ProfilePage, change language to "Italiano"
3. Switch to Tab B within 2 seconds
4. **Expected**: Tab B shows Italian without refresh

**Pass Criteria**:
- ✅ Tab B updates language automatically
- ✅ UI in Tab B switches to Italian
- ✅ Both tabs in sync

---

## Section 3: Component Integration Testing

### Test 3.1: UserMenu Language Switch

**Objective**: Verify UserMenu shows language option that syncs

**Steps**:
1. Open UserMenu (top right dropdown)
2. Select "Español" from language selector
3. Click elsewhere to close menu
4. **Expected**: Entire app switches to Spanish

**Validation**:
- Header text in Spanish
- Navigation labels in Spanish
- All visible text translated
- ProfilePage also shows Spanish

**Pass Criteria**:
- ✅ All UI text updates to Spanish
- ✅ ProfilePage reflects language change
- ✅ No console errors

### Test 3.2: ProfilePage Settings Apply

**Objective**: Verify ProfilePage settings changes apply

**Steps**:
1. Go to ProfilePage/Preferences
2. Change currency to "GBP"
3. Change region to "EMEA"
4. Navigate away from ProfilePage
5. Return to ProfilePage
6. **Expected**: Settings remain as selected

**Validation**:
```javascript
const settings = useSettings();
console.log(settings.currency); // 'GBP'
console.log(settings.region); // 'EMEA'
```

**Pass Criteria**:
- ✅ Settings persist
- ✅ SettingsContext updated
- ✅ No lost changes on navigation

### Test 3.3: ProfilePage Dirty State

**Objective**: Verify dirty indicator works while saving

**Steps**:
1. In ProfilePage/Preferences
2. Change language quickly multiple times
3. Observe "Saving changes..." indicator appears
4. Indicator disappears after ~500ms
5. Settings are actually saved

**Pass Criteria**:
- ✅ Dirty indicator shows during save
- ✅ Indicator clears after debounce completes
- ✅ Settings actually persisted

### Test 3.4: ProfilePage Multi-Tab Awareness

**Objective**: Verify ProfilePage detects changes from other tabs

**Steps**:
1. Open ProfilePage in Tab A and Tab B
2. In Tab A, change theme to "Dark"
3. Switch to Tab B
4. **Expected**: Tab B theme selector updates to "Dark"

**Pass Criteria**:
- ✅ Tab B detects change from Tab A
- ✅ UI updates without refresh
- ✅ SettingsContext synced

---

## Section 4: Error Handling & Edge Cases

### Test 4.1: localStorage Quota Exceeded

**Objective**: Verify graceful error handling when storage full

**Steps**:
1. Run in console:
```javascript
// Fill storage until quote exceeded
for (let i = 0; i < 1000; i++) {
  localStorage.setItem(`test_${i}`, 'x'.repeat(100000));
}
```
2. Try to change a setting in ProfilePage
3. Check error handling

**Pass Criteria**:
- ✅ Doesn't crash app
- ✅ Error logged to console
- ✅ onError callback triggered
- ✅ UI remains responsive

### Test 4.2: Corrupted Storage Data

**Objective**: Verify app handles malformed storage data

**Steps**:
1. In console: `localStorage.setItem('ota.settings.data', 'CORRUPTED')`
2. Refresh page
3. App should load with defaults

**Pass Criteria**:
- ✅ App doesn't crash
- ✅ Defaults used
- ✅ Warning logged
- ✅ Can still change settings

### Test 4.3: Missing Locale Files

**Objective**: Verify fallback when locale file missing

**Steps**:
1. Rename `src/locales/es/common.json` to `.backup`
2. In app, switch to Spanish
3. Should fall back to English

**Pass Criteria**:
- ✅ Doesn't crash
- ✅ Error logged to console
- ✅ Falls back to English
- ✅ App functional

---

## Section 5: Performance Testing

### Test 5.1: Settings Update Performance

**Objective**: Verify settings updates are instant (< 100ms)

**Steps**:
1. In ProfilePage/Preferences
2. Measure time between click and UI update:
```javascript
const start = performance.now();
// Change setting via click
const end = performance.now();
console.log('Update took:', end - start, 'ms');
```

**Pass Criteria**:
- ✅ UI update within 100ms
- ✅ Storage write debounced (not blocking UI)
- ✅ No janky animations

### Test 5.2: Multi-Tab Sync Performance

**Objective**: Verify inter-tab sync within 500ms

**Steps**:
1. Change setting in Tab A
2. In Tab B console, measure time to update:
```javascript
const listener = () => console.log('Synced in', Date.now() - start, 'ms');
window.addEventListener('ota:settings:sync-complete', listener);
const start = Date.now();
// Setting changed in Tab A
```

**Pass Criteria**:
- ✅ Sync within 500ms
- ✅ Responsive feel
- ✅ No blocking

### Test 5.3: i18next Load Time

**Objective**: Verify i18next initialization < 2s

**Steps**:
1. Open DevTools Performance tab
2. Reload page
3. Check i18next.init() time in timeline

**Pass Criteria**:
- ✅ init() completes in < 2s
- ✅ I18nProvider doesn't block rendering
- ✅ Lazy loading works

---

## Test Execution Checklist

### Pre-Testing
- [ ] Clear localStorage: `localStorage.clear()`
- [ ] Clear secureStorage if possible
- [ ] Open DevTools Console
- [ ] Test on Chrome, Firefox, Safari (if possible)

### Test Sections to Run
- [ ] Section 1: Settings Persistence (5 tests)
- [ ] Section 2: i18n Migration (5 tests)
- [ ] Section 3: Component Integration (4 tests)
- [ ] Section 4: Error Handling (3 tests)
- [ ] Section 5: Performance (3 tests)

### Passing Criteria
- **All tests pass** → Ready for Semana 2
- **1-2 minor failures** → Document in IMPROVEMENTS.md
- **>2 major failures** → Fix before Semana 2

### Regression Testing
- [ ] Dashboard still loads
- [ ] Finance page works
- [ ] Travel calendar functions
- [ ] No broken imports
- [ ] Build succeeds: `npm run build`

---

## Test Results

Document your test runs here:

### Test Run 1
- Date: ___________
- Browser: ___________
- Result: PASS / FAIL
- Issues: 

### Test Run 2
- Date: ___________
- Browser: ___________
- Result: PASS / FAIL
- Issues: 

---

## Sign-Off

When all tests pass:
1. [ ] Update todo list (mark Semana 1 QA as completed)
2. [ ] Run `npm run build` successfully
3. [ ] Git commit: `docs: complete Semana 1 QA testing`
4. [ ] Ready for Semana 2

---

**Documentation**: `docs/SEMANA1_QA_TESTING.md`
**Updated**: 2025-01-XX
**Status**: ⏳ Ready for testing
