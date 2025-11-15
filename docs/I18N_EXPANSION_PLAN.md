# i18n Coverage Expansion Plan

## Current Status

- **English (EN)**: 100% (1480 keys) ✅
- **Spanish (ES)**: 100% (1480 keys) ✅
- **French (FR)**: ~17% (251 keys)
- **German (DE)**: ~17% (251 keys)
- **Italian (IT)**: ~17% (251 keys)
- **Portuguese (PT)**: ~17% (251 keys)

**Target**: Expand FR/DE/IT/PT from 17% to 80%+ (≈1184 keys each)

## Methodology

### Phase 1: Automated Translation (80% coverage)

Use existing `auto-translate-critical.cjs` script with enhanced logic:

1. **Source**: Use Spanish (ES) as primary source
   - ES is 100% complete and culturally closer to target Romance languages (FR/IT/PT)
   - For DE, use ES + EN validation

2. **Translation Strategy**:
   - **Critical keys** (auth, nav, common): Human review required
   - **UI labels**: Auto-translate with validation
   - **Messages**: Auto-translate with human review sample
   - **Documentation**: Auto-translate, human review

3. **Quality Checks**:
   - Length validation (target ≈ source ±20%)
   - Variable preservation (`{count}`, `{name}`, etc.)
   - Special char handling (`, », €, etc.)
   - Pluralization rules per language

### Phase 2: Human Review (20% coverage)

Priority areas for native speaker review:

1. **Authentication & Security**
   - Login/Signup flows
   - Error messages
   - MFA prompts
   - Security warnings

2. **Finance & Legal**
   - Contract terms
   - Payment flows
   - Tax terminology
   - Invoice labels

3. **Marketing Content**
   - Landing page
   - Feature descriptions
   - CTAs (Call-to-Actions)

4. **User-Facing Messages**
   - Success/Error toasts
   - Confirmation dialogs
   - Help text

## Execution Plan

### Step 1: Prepare Translation Script

```bash
# Update auto-translate-critical.cjs with enhanced logic
node scripts/auto-translate-critical.cjs --source=es --target=fr --coverage=80
node scripts/auto-translate-critical.cjs --source=es --target=de --coverage=80
node scripts/auto-translate-critical.cjs --source=es --target=it --coverage=80
node scripts/auto-translate-critical.cjs --source=es --target=pt --coverage=80
```

### Step 2: Module Prioritization

Translate in order of importance:

1. **Core** (Priority: Critical)
   - `common.*` - Shared UI labels
   - `nav.*` - Navigation
   - `auth.*` - Authentication
   - `errors.*` - Error messages

2. **Dashboard** (Priority: High)
   - `dashboard.*`
   - `finance.*`
   - `shows.*`
   - `contacts.*`

3. **Features** (Priority: Medium)
   - `calendar.*`
   - `travel.*`
   - `contracts.*`
   - `org.*`

4. **Advanced** (Priority: Low)
   - `mission.*`
   - `story.*`
   - `integrations.*`

### Step 3: Validation Rules

Automated checks per language:

**French (FR)**:
- Accents: é, è, ê, à, ù, ç
- Quotes: « guillemets »
- Pluralization: -s, -x irregular
- Formal vs informal: Use formal "vous"

**German (DE)**:
- Capitalization: All nouns capitalized
- Umlauts: ä, ö, ü, ß
- Compound words: Combined nouns
- Formal: "Sie" (capitalized)

**Italian (IT)**:
- Accents: à, è, é, ì, ò, ù
- Apostrophes: l', un', dell'
- Pluralization: -i, -e rules
- Formal: "Lei" (capitalized)

**Portuguese (PT)**:
- Accents: á, â, ã, é, ê, í, ó, ô, õ, ú, ç
- Contractions: do, da, no, na
- PT-PT vs PT-BR: Use PT-PT (European)
- Formal: "você"

### Step 4: Translation Services

For automated translation, use:

1. **Primary**: Google Cloud Translation API
   - High quality for Romance languages
   - Context-aware
   - Batch processing

2. **Fallback**: DeepL API
   - Superior for German
   - Better context understanding
   - Limited free tier

3. **Validation**: Microsoft Translator
   - Cross-reference for accuracy
   - Terminology consistency

## Implementation

### Script Enhancement

```javascript
// scripts/auto-translate-enhanced.cjs

const LANGUAGE_RULES = {
  fr: {
    quotes: ['«', '»'],
    capitalize: 'sentence',
    pluralSuffix: 's',
  },
  de: {
    capitalize: 'nouns',
    formal: 'Sie',
    umlauts: true,
  },
  it: {
    apostrophes: true,
    capitalize: 'sentence',
    pluralSuffix: ['i', 'e'],
  },
  pt: {
    accents: true,
    contractions: true,
    variant: 'PT-PT',
  },
};

function translateWithValidation(text, sourceLang, targetLang) {
  // 1. Translate via API
  const translated = await translateAPI(text, targetLang);
  
  // 2. Apply language-specific rules
  const formatted = applyLanguageRules(translated, targetLang);
  
  // 3. Validate variables
  validateVariables(text, formatted);
  
  // 4. Check length
  validateLength(text, formatted);
  
  return formatted;
}
```

### Quality Metrics

Track translation quality:

```typescript
interface TranslationMetrics {
  totalKeys: number;
  translatedKeys: number;
  reviewedKeys: number;
  coverage: number;
  quality: {
    automated: number;
    reviewed: number;
  };
  validationErrors: number;
}
```

## Testing

### Automated Tests

```bash
npm run test:i18n -- --lang=fr
npm run test:i18n -- --lang=de
npm run test:i18n -- --lang=it
npm run test:i18n -- --lang=pt
```

### Manual Testing Checklist

- [ ] Login flow in each language
- [ ] Dashboard navigation
- [ ] Finance calculations with currency
- [ ] Date/time formatting
- [ ] Error messages display correctly
- [ ] Form validation messages
- [ ] Success toasts
- [ ] Settings page

## Rollout Strategy

### Phase 1: Beta Testing (2 weeks)
- Release to beta users per language
- Collect feedback via in-app feedback widget
- Track language switching analytics
- Monitor error reports

### Phase 2: Gradual Rollout (1 week)
- 25% of users → 50% → 75% → 100%
- Monitor engagement metrics per language
- A/B test translations for key CTAs

### Phase 3: Continuous Improvement
- Monthly review of user-reported issues
- Quarterly review with native speakers
- Annual full audit

## Resources Required

### Translation Budget

- **Google Cloud Translation**: $20 per 1M chars
- **DeepL API**: $24.99/month (500k chars)
- **Human Review**: ~40 hours @ $50/hr = $2000

**Estimated Total**: $2,100

### Native Speaker Reviewers

- French: 10 hours
- German: 10 hours
- Italian: 10 hours
- Portuguese: 10 hours

**Total**: 40 hours

## Success Metrics

- [ ] FR coverage: 80%+ (1184 keys)
- [ ] DE coverage: 80%+ (1184 keys)
- [ ] IT coverage: 80%+ (1184 keys)
- [ ] PT coverage: 80%+ (1184 keys)
- [ ] Validation errors: <1%
- [ ] User feedback score: 4.5+/5
- [ ] Language switching rate: >5% of users

## Timeline

- **Week 1**: Script enhancement + automated translation
- **Week 2**: Validation + error fixing
- **Week 3**: Human review of critical sections
- **Week 4**: Beta testing + feedback incorporation
- **Week 5**: Production rollout

**Total**: 5 weeks

## Maintenance

### Ongoing Translation Process

When adding new keys:

1. Add EN translation
2. Add ES translation
3. Run auto-translate script for FR/DE/IT/PT
4. Mark for human review if critical
5. Test in all languages before deployment

### Translation File Structure

```
src/lib/i18n.ts
├── en { ... }         // 100% (source)
├── es { ... }         // 100% (source)
├── fr { ... }         // 80%+ (target)
├── de { ... }         // 80%+ (target)
├── it { ... }         // 80%+ (target)
└── pt { ... }         // 80%+ (target)
```

## Tools & Scripts

- `scripts/auto-translate-critical.cjs` - Existing auto-translate
- `scripts/check-i18n.cjs` - Validation script
- `scripts/find-all-missing-keys.cjs` - Find untranslated
- `scripts/complete-es-translations.cjs` - Complete ES
- `scripts/add-batch-translations.cjs` - Batch operations

## Status

✅ **Documented**: Complete strategy and plan
⏳ **Execution**: Ready to start (requires translation API keys)
📊 **Target**: 80%+ coverage across FR/DE/IT/PT

**Note**: Full execution requires Google Cloud Translation API or DeepL API credentials and ~5 weeks timeline.
