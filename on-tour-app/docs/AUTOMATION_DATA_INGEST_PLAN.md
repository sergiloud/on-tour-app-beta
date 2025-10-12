# Automation Plan: Data Ingest from Real Sources
**Date**: January 11, 2025  
**Priority**: Next Sprint  
**Objective**: Replace manual demoDataset updates with automated import from Excel/Google Sheets

---

## Current Pain Points

### Manual Data Entry Process ❌
1. Danny provides show list via Excel/email
2. Developer manually copies to `demoDataset.ts`
3. Format conversion required (dates, currencies, coordinates)
4. Prone to typos and inconsistencies
5. Time-consuming (30+ minutes per update)
6. No version control for source data

### Consequences
- **Stale Data**: Demo doesn't reflect Danny's current tour
- **Errors**: Manual transcription mistakes
- **Scalability**: Won't work for multiple artists
- **Collaboration**: Can't share live updates with team

---

## Proposed Solution: Automated Import Pipeline

### Architecture Overview
```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Google Sheets  │────▶│  Import API  │────▶│  On Tour App    │
│  (Danny's File) │     │  (Backend)   │     │  (Frontend)     │
└─────────────────┘     └──────────────┘     └─────────────────┘
        │                      │                      │
        │                      │                      │
    Real-time               Validate              localStorage
    Updates                Transform              Auto-refresh
```

### Benefits ✅
1. **Real-Time Sync**: Changes in Sheet → App within minutes
2. **Error Prevention**: Validation rules catch bad data
3. **Multi-Artist**: Each artist gets their own Sheet
4. **Version Control**: Sheet history tracks all changes
5. **Collaboration**: Danny's team can update directly
6. **Audit Trail**: See who changed what and when

---

## Implementation Options

### Option 1: Google Sheets API (RECOMMENDED) 🌟
**Pros**:
- ✅ Real-time collaboration (Danny + team)
- ✅ Familiar interface (everyone knows Sheets)
- ✅ Built-in validation (data types, dropdowns)
- ✅ Version history (revert mistakes)
- ✅ Mobile-friendly (Danny can update on phone)
- ✅ Free (no additional cost)

**Cons**:
- ⚠️ Requires Google account
- ⚠️ OAuth setup needed
- ⚠️ API rate limits (100 requests/100 seconds)

**Tech Stack**:
```typescript
// Dependencies
npm install googleapis
npm install @google-cloud/local-auth

// Libraries
- Google Sheets API v4
- OAuth 2.0 authentication
- Service account credentials
```

**Implementation Steps**:
1. Create Google Cloud project
2. Enable Sheets API
3. Create service account
4. Share target Sheet with service account email
5. Build import function in `/src/lib/importShows.ts`
6. Add "Import from Sheets" button in Shows page
7. Validate data format before applying
8. Store Sheet ID in settings

**Cost**: FREE (within quota)  
**Time**: 4-6 hours development  
**Complexity**: Medium

---

### Option 2: Excel File Upload
**Pros**:
- ✅ No cloud dependency
- ✅ Works offline
- ✅ Private (file never leaves user)
- ✅ Simple implementation

**Cons**:
- ❌ No real-time sync
- ❌ Requires manual upload each time
- ❌ No collaboration features
- ❌ No version history

**Tech Stack**:
```typescript
// Dependencies
npm install xlsx
npm install file-saver

// Libraries
- SheetJS (xlsx) for parsing
- File input component
- Drag-and-drop zone
```

**Implementation Steps**:
1. Build file upload UI (`<input type="file" accept=".xlsx,.xls" />`)
2. Parse Excel with SheetJS
3. Map columns to Show type
4. Validate data format
5. Preview before applying
6. Merge or replace existing shows

**Cost**: FREE  
**Time**: 2-3 hours development  
**Complexity**: Low

---

### Option 3: CSV Import (SIMPLEST)
**Pros**:
- ✅ Universal format (Excel, Sheets, Numbers all export CSV)
- ✅ Human-readable
- ✅ Tiny file size
- ✅ Git-friendly (can version control)
- ✅ Easy to test

**Cons**:
- ❌ No cell formulas
- ❌ Limited data types
- ❌ Encoding issues (UTF-8 vs ANSI)

**Tech Stack**:
```typescript
// No dependencies needed!
// Use native browser APIs
const csvText = await file.text();
const rows = csvText.split('\n').map(row => row.split(','));
```

**Implementation Steps**:
1. Define CSV format spec (header row required)
2. Build parser with validation
3. Handle edge cases (quotes, commas in text)
4. Add preview table before import
5. Support append vs replace modes

**Cost**: FREE  
**Time**: 1-2 hours development  
**Complexity**: Very Low

---

## Recommended Approach: Hybrid Strategy 🎯

### Phase 1: CSV Import (Immediate - 1-2 hours)
**Goal**: Unblock manual updates quickly

**Scope**:
- Simple CSV parser
- Basic validation (required fields)
- Preview before import
- Append or replace options

**CSV Format**:
```csv
date,city,country,fee,feeCurrency,status,paid,venue,promoter,notes
2025-07-15,London,GB,8500,GBP,confirmed,false,Fabric,XYZ Promotions,Main stage
2025-07-20,Berlin,DE,12000,EUR,pending,false,Berghain,ABC Events,Techno night
```

**Deliverables**:
- [ ] CSV parser function (`parseShowsCsv()`)
- [ ] Upload UI component (`<ShowsImporter />`)
- [ ] Validation rules (date format, required fields)
- [ ] Preview table with diff highlighting
- [ ] "Import" button with confirmation
- [ ] Test with sample CSV (10 shows)

**Success Criteria**:
- Danny can export Excel → CSV → Upload in < 5 minutes
- Validation catches malformed data
- No manual coding required

---

### Phase 2: Google Sheets Sync (Next Sprint - 4-6 hours)
**Goal**: Enable real-time collaboration

**Scope**:
- Google Sheets API integration
- OAuth authentication flow
- Automatic sync (every 5 minutes)
- Conflict resolution (Sheet vs App)

**Sheet Structure**:
```
Tab 1: Shows (main data)
Tab 2: Expenses (costs per show)
Tab 3: Settings (WHT rates, currencies)
Tab 4: Changelog (auto-generated)
```

**Deliverables**:
- [ ] Google Cloud project setup
- [ ] OAuth consent screen
- [ ] Service account credentials
- [ ] Import function with retry logic
- [ ] Settings page: "Connect Google Sheet"
- [ ] Background sync worker
- [ ] Conflict resolution UI
- [ ] Test with live Sheet (30+ shows)

**Success Criteria**:
- Danny edits Sheet → App updates within 5 minutes
- Multiple users can edit without conflicts
- Errors logged and reported
- Works on mobile

---

### Phase 3: Advanced Features (Future - 8-10 hours)
**Goal**: Professional-grade data management

**Scope**:
- Bi-directional sync (App → Sheet)
- Field mapping UI (custom columns)
- Data validation rules (custom logic)
- Scheduled imports (daily/weekly)
- Multi-source aggregation (multiple Sheets)
- Export back to Excel/Sheets

**Deliverables**:
- [ ] Visual field mapper
- [ ] Custom validation builder
- [ ] Sync scheduler with cron syntax
- [ ] Data transformation rules (e.g., "USD → EUR")
- [ ] Conflict resolution strategies (last write wins, manual merge)
- [ ] Audit log with rollback

**Success Criteria**:
- Non-technical users can configure imports
- Handles 1000+ shows without performance issues
- Supports multiple artists (multi-tenant)
- Complete audit trail

---

## Data Validation Requirements

### Critical Fields (Must Have)
```typescript
interface ShowImportValidation {
  date: {
    format: 'YYYY-MM-DD',
    min: '2020-01-01',
    max: '2030-12-31',
    required: true
  },
  city: {
    type: 'string',
    minLength: 2,
    maxLength: 100,
    required: true
  },
  country: {
    type: 'ISO 3166-1 alpha-2', // e.g., 'US', 'GB'
    validate: (val) => VALID_COUNTRIES.includes(val),
    required: true
  },
  fee: {
    type: 'number',
    min: 0,
    max: 1000000,
    required: true
  },
  feeCurrency: {
    type: 'enum',
    values: ['USD', 'EUR', 'GBP', 'AUD'],
    default: 'USD',
    required: false
  },
  status: {
    type: 'enum',
    values: ['confirmed', 'pending', 'offer', 'canceled', 'archived', 'postponed'],
    default: 'pending',
    required: false
  }
}
```

### Optional Fields (Nice to Have)
- `venue`: String (0-200 chars)
- `promoter`: String (0-100 chars)
- `notes`: String (0-500 chars)
- `whtPct`: Number (0-100)
- `paid`: Boolean (default: false)
- `lat`, `lng`: Number (geocoded from city/country if missing)

### Validation Rules
1. **Date Logic**: Show date not in past (warning, not error)
2. **Duplicates**: Check ID or date+city combo
3. **Currency**: If fee > 0, require feeCurrency
4. **Status**: If paid = true, require status = 'confirmed'
5. **Geography**: If lat/lng missing, auto-geocode from city/country

---

## Geocoding Strategy

### Problem
CSV/Sheet may not include lat/lng coordinates (needed for map)

### Solution: Auto-Geocoding
**Options**:

1. **Nominatim (OpenStreetMap) - FREE** ✅
   ```typescript
   const geocode = async (city: string, country: string) => {
     const url = `https://nominatim.openstreetmap.org/search?city=${city}&country=${country}&format=json`;
     const res = await fetch(url);
     const data = await res.json();
     return { lat: data[0].lat, lng: data[0].lon };
   };
   ```
   - **Pros**: Free, no API key, good coverage
   - **Cons**: Rate limited (1 req/sec), not always accurate

2. **Google Maps Geocoding API** 💰
   - **Pros**: Highly accurate, fast, reliable
   - **Cons**: Costs money ($5 per 1000 requests)

3. **Manual Fallback**
   - **Pros**: Danny can fix mistakes in UI
   - **Cons**: Requires extra step

**Recommendation**: Nominatim for auto-geocoding, manual correction in UI

---

## Error Handling & User Feedback

### Import Workflow
```
1. User uploads CSV/connects Sheet
   ↓
2. Parse and validate data
   ↓
3. Show preview table with:
   - ✅ Valid rows (green)
   - ⚠️ Warnings (yellow) - e.g., past date
   - ❌ Errors (red) - e.g., missing fee
   ↓
4. User can:
   - Fix errors inline
   - Skip problematic rows
   - Cancel entire import
   ↓
5. Confirm and apply changes
   ↓
6. Show success/failure summary
```

### Error Messages (User-Friendly)
```typescript
// Bad ❌
"Error: Invalid date format in row 7"

// Good ✅
"Row 7: Date must be YYYY-MM-DD format (you entered '07/15/2025')"
"Suggestion: Change to '2025-07-15'"
```

---

## Security Considerations

### Google Sheets Integration
1. **OAuth Scope**: Request minimal permissions (read-only Sheets)
2. **Token Storage**: Encrypt tokens in localStorage using secureStorage
3. **Sheet Access**: Verify user owns Sheet before importing
4. **Rate Limiting**: Max 1 import per minute (prevent abuse)

### File Upload
1. **File Size**: Limit to 10 MB (prevent DoS)
2. **File Type**: Validate MIME type and extension
3. **Content Validation**: Sanitize all text fields (XSS prevention)
4. **Virus Scan**: Optional integration with VirusTotal API

---

## Testing Strategy

### Unit Tests
```typescript
// Test CSV parser
test('parseShowsCsv: valid data', () => {
  const csv = `date,city,country,fee
2025-07-15,London,GB,8500`;
  const shows = parseShowsCsv(csv);
  expect(shows).toHaveLength(1);
  expect(shows[0].city).toBe('London');
});

// Test validation
test('validateShow: missing required field', () => {
  const show = { city: 'London', country: 'GB' }; // missing date, fee
  const errors = validateShow(show);
  expect(errors).toContain('date is required');
  expect(errors).toContain('fee is required');
});
```

### Integration Tests
1. Upload sample CSV with 10 shows
2. Verify all shows added to showStore
3. Check validation catches bad data
4. Test conflict resolution (duplicate IDs)

### Manual Test Cases
| Test Case | Input | Expected Output |
|-----------|-------|-----------------|
| Valid CSV | 5 perfect rows | All imported ✅ |
| Missing fee | 1 row without fee | Error shown, skip row ❌ |
| Bad date | `07/15/2025` | Warning + suggestion 📝 |
| Duplicate ID | Same ID twice | Conflict dialog, choose 🔄 |
| Large file | 1000 rows | Progress bar, batch import ⏳ |

---

## Deliverables & Timeline

### Sprint 1 (Week 1) - CSV Import
- [ ] Day 1-2: Build CSV parser + validation (4 hours)
- [ ] Day 3: Create upload UI component (2 hours)
- [ ] Day 4: Add preview table with diff (2 hours)
- [ ] Day 5: Testing + bug fixes (2 hours)
- **Total**: 10 hours

### Sprint 2 (Week 2-3) - Google Sheets
- [ ] Day 1-2: Google Cloud setup + OAuth (4 hours)
- [ ] Day 3-4: Build Sheets API integration (6 hours)
- [ ] Day 5-6: Background sync worker (4 hours)
- [ ] Day 7: Conflict resolution UI (3 hours)
- [ ] Day 8-9: Testing + documentation (3 hours)
- **Total**: 20 hours

### Sprint 3 (Week 4+) - Advanced Features
- [ ] Week 4: Field mapping UI (8 hours)
- [ ] Week 5: Custom validation rules (6 hours)
- [ ] Week 6: Bi-directional sync (10 hours)
- [ ] Week 7: Audit log + rollback (6 hours)
- **Total**: 30 hours

---

## Success Metrics

### Phase 1 (CSV) - Target by Sprint 2
- ✅ Danny can import 30 shows in < 5 minutes
- ✅ 95%+ accuracy (no manual corrections needed)
- ✅ Zero crashes on malformed data

### Phase 2 (Sheets) - Target by Sprint 4
- ✅ Real-time sync < 5 minute latency
- ✅ Zero data loss (all edits preserved)
- ✅ Danny + team can collaborate without conflicts

### Phase 3 (Advanced) - Target by Sprint 8
- ✅ Non-technical users can configure imports
- ✅ Handles 1000+ shows without slowdown
- ✅ Complete audit trail with rollback

---

## Alternatives Considered

### Zapier/Make Integration
**Pros**: No-code solution, pre-built connectors  
**Cons**: Monthly cost ($20-100), vendor lock-in  
**Verdict**: Not suitable for core feature

### Airtable Integration
**Pros**: Better than Sheets (relations, automations)  
**Cons**: Learning curve, limited free tier  
**Verdict**: Consider for future (multi-artist scaling)

### Custom Backend API
**Pros**: Full control, can add business logic  
**Cons**: More infrastructure, maintenance burden  
**Verdict**: Overkill for alpha, revisit for beta

---

## Next Steps

### Immediate Actions (This Week)
1. ✅ Review this plan with Danny
2. ⏸️ Get sample Excel file from Danny (10-20 shows)
3. ⏸️ Convert to CSV format (define column mapping)
4. ⏸️ Start Phase 1: CSV parser implementation

### Before Sprint 2
1. Test CSV import with real data
2. Get feedback from Danny on UX
3. Decide: Proceed with Sheets or stick with CSV?

### Documentation Needed
1. CSV format specification (for Danny's team)
2. Google Sheets template (if using Sheets)
3. Troubleshooting guide (common errors)
4. Video tutorial (3-5 minutes)

---

**Status**: 📋 Plan Complete, Ready for Implementation  
**Recommended Start**: Phase 1 (CSV Import) - 10 hours effort  
**Expected Value**: 80% reduction in data entry time  
**Risk Level**: Low (well-understood problem, proven tech)
