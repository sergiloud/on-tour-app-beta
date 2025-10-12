# i18n Completion Plan: Close Translation Gaps
**Date**: January 11, 2025  
**Priority**: Next Sprint  
**Objective**: Complete translations for all 6 languages to enable safe language toggle

---

## Current State Analysis

### Supported Languages (Infrastructure Ready) ✅
```typescript
export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' }
];
```

### Translation Coverage (Estimated)

| Language | Strings | Coverage | Status |
|----------|---------|----------|--------|
| **English** | ~1,500 | 100% | ✅ Complete (reference) |
| **Spanish** | ~1,200 | 80% | 🟡 Mostly complete |
| **French** | ~600 | 40% | 🟠 Partial |
| **German** | ~600 | 40% | 🟠 Partial |
| **Italian** | ~600 | 40% | 🟠 Partial |
| **Portuguese** | ~600 | 40% | 🟠 Partial |

### Recent Additions (Panorama Alpha Quick Win) ✅
```typescript
// English
, 'shows.selected': 'selected'
, 'shows.count.singular': 'show'
, 'shows.count.plural': 'shows'

// Spanish
, 'shows.selected': 'seleccionados'
, 'shows.count.singular': 'show'
, 'shows.count.plural': 'shows'
```

---

## Gap Analysis: Missing Translations

### Critical Gaps (Production Blockers) 🔴

#### 1. Navigation & Core UI
**Missing in FR/DE/IT/PT**:
- Dashboard tabs (Shows, Finance, Travel, Calendar)
- Settings pages (Profile, Preferences, Organization)
- Modal buttons (Save, Cancel, Delete, Confirm)
- Form labels (Name, Email, Date, Fee, Status)

**Impact**: Users can't navigate app in their language

#### 2. Finance Module
**Missing in FR/DE/IT/PT**:
- KPI labels (Net, Margin, DSO, Pipeline)
- Chart tooltips ("Revenue", "Expenses", "Forecast")
- Export warnings ("DRAFT EXPORT", "Currencies not harmonized")
- Period selectors ("This Month", "Last 30 Days", "All Time")

**Impact**: Financial data incomprehensible in non-EN/ES

#### 3. Shows Management
**Missing in FR/DE/IT/PT**:
- Status labels (confirmed, pending, offer, canceled)
- Bulk actions ("Select All", "Confirm {n} shows")
- Filter labels ("Date Range", "Region", "Fee Range")
- Table headers (Date, City, Venue, Promoter, Notes)

**Impact**: Can't manage shows in user's language

### Medium Priority (UX Issues) 🟡

#### 4. Travel & Calendar
**Missing in FR/DE/IT/PT**:
- Month names (already handled by browser, but custom labels missing)
- Travel types ("Flight", "Ground", "Hotel")
- Calendar views ("Month", "Week", "Agenda")

**Impact**: Travel planning harder but functional

#### 5. Alerts & Notifications
**Missing in FR/DE/IT/PT**:
- Alert types ("Risk", "Urgency", "Opportunity")
- Toast messages ("Saved ✓", "Error", "Copied to clipboard")
- Confirmation dialogs ("Are you sure?", "This action cannot be undone")

**Impact**: Users miss important notifications

#### 6. Authentication
**Missing in FR/DE/IT/PT**:
- Login prompts ("Enter as {name}", "Remember me")
- Role labels ("Artist (Owner)", "Agency Manager")
- Scope descriptions ("Finance: read-only", "Edit shows/travel")

**Impact**: Confusing login experience

---

## Translation Strategy

### Approach 1: Machine Translation + Human Review (RECOMMENDED) 🌟
**Process**:
1. Extract all English strings to JSON
2. Use Google Translate API for initial translation
3. Human review by native speakers (FR/DE/IT/PT)
4. A/B test with real users
5. Iterate based on feedback

**Pros**:
- ✅ Fast (hours, not weeks)
- ✅ Cost-effective (~$0.02 per 1000 chars)
- ✅ 80-90% accuracy for common phrases
- ✅ Scalable (can add more languages easily)

**Cons**:
- ⚠️ Some awkward phrasing (needs review)
- ⚠️ May miss cultural nuances
- ⚠️ Technical terms may be wrong

**Cost**: ~$50 (translation) + $500 (review) = $550 total  
**Time**: 1 week (translation) + 2 weeks (review) = 3 weeks

---

### Approach 2: Professional Translation Service
**Options**:
- Gengo: $0.06-0.10 per word (human translators)
- Smartling: $0.15-0.25 per word (CAT tools + humans)
- Local freelancers: $0.08-0.15 per word

**Estimated Cost**:
- English: ~1,500 strings × 5 words/string = 7,500 words
- Target: 4 languages (FR/DE/IT/PT)
- Total: 7,500 × 4 × $0.10 = **$3,000**

**Pros**:
- ✅ High quality (native speakers)
- ✅ Cultural adaptation included
- ✅ Technical terminology handled
- ✅ QA included

**Cons**:
- ❌ Expensive ($3,000+)
- ❌ Slow (2-4 weeks turnaround)
- ❌ Overhead (project management, revisions)

**Time**: 2-4 weeks  
**Cost**: $3,000-5,000

---

### Approach 3: Community Translation (Crowdsourcing)
**Process**:
1. Create public translation interface (Crowdin, POEditor)
2. Invite community to contribute
3. Gamify with points/badges
4. Moderators review submissions
5. Vote on best translations

**Pros**:
- ✅ Free (community volunteers)
- ✅ High engagement (users invested)
- ✅ Cultural accuracy (native speakers)
- ✅ Multiple options (vote on best)

**Cons**:
- ❌ Slow (depends on community)
- ❌ Inconsistent quality
- ❌ Requires moderation
- ❌ Not suitable for private beta

**Time**: 4-8 weeks (unpredictable)  
**Cost**: Free (+ moderation time)

---

## Recommended Hybrid Approach 🎯

### Phase 1: Machine Translation (Week 1)
**Goal**: 100% coverage, 80% quality

**Steps**:
1. Extract all English strings from `i18n.ts`
2. Use Google Cloud Translation API
3. Batch translate to FR/DE/IT/PT
4. Automated import back to codebase
5. Mark as "machine-translated" in code

**Script** (`scripts/translate.js`):
```javascript
const { Translate } = require('@google-cloud/translate').v2;
const translate = new Translate({ key: process.env.GOOGLE_API_KEY });

async function batchTranslate(strings, targetLang) {
  const [translations] = await translate.translate(strings, targetLang);
  return translations;
}

// Extract EN strings
const enStrings = Object.keys(DICT.en);
const enValues = Object.values(DICT.en);

// Translate to FR
const frValues = await batchTranslate(enValues, 'fr');
DICT.fr = Object.fromEntries(enStrings.map((k, i) => [k, frValues[i]]));

// Repeat for DE, IT, PT...
```

**Deliverables**:
- [ ] Translation script (`scripts/translate.js`)
- [ ] 100% coverage for FR/DE/IT/PT
- [ ] Flag machine-translated strings in code

**Cost**: $50 (Google Translate API)  
**Time**: 1 day

---

### Phase 2: Human Review (Weeks 2-3)
**Goal**: Fix critical errors, improve quality

**Priority Review Areas**:
1. **Navigation** (high visibility)
2. **Finance** (technical accuracy critical)
3. **CTAs** ("Save", "Delete" - must be clear)
4. **Errors** (confusing errors = bad UX)

**Reviewers Needed**:
- 1 native French speaker (8 hours)
- 1 native German speaker (8 hours)
- 1 native Italian speaker (8 hours)
- 1 native Portuguese speaker (8 hours)

**Review Process**:
```
1. Provide spreadsheet: EN | FR (machine) | FR (reviewed)
2. Reviewer flags issues:
   - 🔴 Wrong (critical error)
   - 🟡 Awkward (improve if time)
   - ✅ Good (no change needed)
3. Developer applies corrections
4. Re-test in UI
```

**Cost**: 4 reviewers × 8 hours × $50/hour = $1,600  
**Time**: 2 weeks (parallel)

---

### Phase 3: Contextual Testing (Week 4)
**Goal**: Validate translations in real UI

**Test Plan**:
1. Switch language to FR
2. Navigate all major pages (Dashboard, Shows, Finance, Travel)
3. Trigger all modals, toasts, errors
4. Screenshot any issues
5. Fix and re-test

**Test Cases**:
| Page | Action | Check |
|------|--------|-------|
| Login | View hero text | Sounds natural ✅ |
| Dashboard | Read KPI labels | Matches EN meaning ✅ |
| Shows | Open "Add Show" modal | All buttons translated ✅ |
| Finance | Export CSV | Warning in target language ✅ |
| Settings | Change language | Toggle works ✅ |

**Deliverables**:
- [ ] Test report with screenshots
- [ ] List of UI bugs (truncation, alignment)
- [ ] Final corrections applied

**Time**: 3 days  
**Cost**: Internal (no external cost)

---

## Translation Tooling

### Recommended Tools

#### 1. Google Cloud Translation API (Machine) 🤖
**Use Case**: Initial bulk translation

```bash
# Setup
npm install @google-cloud/translate
export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"

# Usage
node scripts/translate.js --source=en --target=fr,de,it,pt
```

**Cost**: $20 per 1M characters (~$50 for full project)

#### 2. Crowdin (Human Review) 👥
**Use Case**: Collaborative review platform

**Features**:
- Web-based translation editor
- Context screenshots
- Translation memory (reuse past translations)
- QA checks (missing variables, punctuation)
- GitHub integration (PR per language)

**Cost**: Free for open-source, $40/month for private  
**Recommendation**: Use if open-sourcing, else skip

#### 3. i18n-tasks Gem (QA) 🔍
**Use Case**: Find missing/unused translations

```bash
# Install
npm install -g i18n-tasks

# Check for missing translations
i18n-tasks missing

# Check for unused translations
i18n-tasks unused

# Health report
i18n-tasks health
```

**Output**:
```
Missing translations (FR):
  - finance.export.draft.warning
  - shows.bulk.actions.confirm
  
Unused translations (EN):
  - old.deprecated.key
```

---

## Implementation Plan

### Week 1: Machine Translation
**Day 1-2**: Setup & Script Development
- [ ] Create Google Cloud project
- [ ] Enable Translation API
- [ ] Write `scripts/translate.js`
- [ ] Test with 10 strings (sanity check)

**Day 3-4**: Bulk Translation
- [ ] Run full translation for FR
- [ ] Run full translation for DE
- [ ] Run full translation for IT
- [ ] Run full translation for PT

**Day 5**: Integration & Testing
- [ ] Import translations to `i18n.ts`
- [ ] Build app and verify no errors
- [ ] Smoke test language toggle (each lang)
- [ ] Document machine-translated keys

---

### Week 2-3: Human Review (Parallel)
**Reviewer Tasks** (each language):
- [ ] Review navigation strings (50 strings, 1 hour)
- [ ] Review finance module (200 strings, 3 hours)
- [ ] Review shows management (150 strings, 2 hours)
- [ ] Review authentication (50 strings, 1 hour)
- [ ] Review common UI (100 strings, 1 hour)

**Developer Tasks**:
- [ ] Apply corrections from reviewers
- [ ] Update `i18n.ts` with reviewed translations
- [ ] Mark strings as "human-reviewed" (comment)
- [ ] Re-build and test

---

### Week 4: QA & Launch
**Day 1-2**: Contextual Testing
- [ ] Test FR in UI (all pages)
- [ ] Test DE in UI (all pages)
- [ ] Test IT in UI (all pages)
- [ ] Test PT in UI (all pages)

**Day 3**: Bug Fixes
- [ ] Fix truncation issues (long translations)
- [ ] Fix alignment (RTL if needed, though not for these langs)
- [ ] Fix pluralization edge cases

**Day 4**: Documentation
- [ ] Update README with i18n instructions
- [ ] Create translation contributor guide
- [ ] Document how to add new strings

**Day 5**: Launch
- [ ] Enable language toggle in production
- [ ] Announce in release notes
- [ ] Monitor for user feedback

---

## Quality Assurance Checklist

### Before Launch
- [ ] All 6 languages have 100% coverage (no missing strings)
- [ ] No hardcoded strings in UI (all using `t()`)
- [ ] Language toggle works without refresh
- [ ] Pluralization rules correct (show vs shows)
- [ ] Date/number formatting locale-aware
- [ ] Currency symbols correct per locale
- [ ] No truncation in buttons/labels
- [ ] No layout breaks (text overflow)
- [ ] Toast messages translated
- [ ] Error messages translated
- [ ] Export warnings translated (CSV/XLSX)

### Post-Launch Monitoring
- [ ] Track language selection metrics (which langs used most)
- [ ] Monitor error reports per language
- [ ] Collect user feedback on translations
- [ ] Iterate on awkward phrasings
- [ ] Add missing strings as features expand

---

## Ongoing Maintenance

### Process for New Features
1. Developer adds English string to `i18n.ts`
2. Mark as "needs translation" in code comment
3. Weekly batch: translate new strings (machine)
4. Monthly review: human review new translations
5. Quarterly audit: cleanup unused strings

### Translation Memory
**Goal**: Reuse past translations to save time/cost

**Strategy**:
```typescript
// Maintain translation glossary
const GLOSSARY = {
  'show': { fr: 'spectacle', de: 'Show', it: 'spettacolo', pt: 'show' },
  'fee': { fr: 'cachet', de: 'Gage', it: 'compenso', pt: 'cachê' },
  'confirmed': { fr: 'confirmé', de: 'bestätigt', it: 'confermato', pt: 'confirmado' }
};

// Use in translations
const translateWithGlossary = (text, targetLang) => {
  let translated = machineTranslate(text, targetLang);
  Object.entries(GLOSSARY).forEach(([en, translations]) => {
    translated = translated.replace(en, translations[targetLang]);
  });
  return translated;
};
```

---

## Cost Summary

### Recommended Approach (Hybrid)
| Item | Cost | Notes |
|------|------|-------|
| Google Translate API | $50 | Bulk machine translation |
| French reviewer | $400 | 8 hours @ $50/hour |
| German reviewer | $400 | 8 hours @ $50/hour |
| Italian reviewer | $400 | 8 hours @ $50/hour |
| Portuguese reviewer | $400 | 8 hours @ $50/hour |
| **Total** | **$1,650** | **High quality, reasonable cost** |

### Alternative: Full Professional
| Item | Cost |
|------|------|
| Professional service | $3,000-5,000 |

### Alternative: Machine Only
| Item | Cost |
|------|------|
| Google Translate | $50 |
| Risk: Lower quality |

---

## Success Metrics

### Coverage
- ✅ 100% of strings translated in all 6 languages
- ✅ Zero hardcoded English strings in UI
- ✅ Language toggle works for all users

### Quality
- ✅ 95%+ accuracy on critical strings (navigation, CTAs)
- ✅ 85%+ accuracy on general content
- ✅ Zero critical errors (wrong meaning)

### Adoption
- ✅ 10%+ of users switch from default language
- ✅ < 5% support tickets related to translations
- ✅ Positive feedback on translation quality

---

## Next Steps

### Immediate (This Week)
1. ✅ Review this plan with team
2. ⏸️ Decide: Hybrid approach or full professional?
3. ⏸️ Setup Google Cloud Translation API
4. ⏸️ Write translation script (`scripts/translate.js`)
5. ⏸️ Run test translation (10 strings to FR)

### Week 1-2
1. Execute Phase 1 (Machine Translation)
2. Recruit reviewers for Phase 2
3. Prepare review materials (spreadsheets)

### Week 3-4
1. Human review (parallel for all 4 languages)
2. Apply corrections
3. Contextual testing
4. Launch language toggle

---

**Status**: 📋 Plan Complete, Ready for Execution  
**Recommended Budget**: $1,650 (hybrid approach)  
**Timeline**: 4 weeks to full launch  
**Risk Level**: Low (proven approach, manageable scope)  
**Expected Impact**: 🌍 Global accessibility, 10%+ wider reach
