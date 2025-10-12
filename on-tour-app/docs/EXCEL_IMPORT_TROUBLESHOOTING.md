# Excel Import Troubleshooting Guide

## Problem
Excel files (.xlsx) showing errors:
```
Row 2 [id]: Invalid input: expected string, received undefined
Row 2 [city]: Invalid input: expected string, received undefined
...
```

## Root Cause Analysis

The issue occurs when:
1. Excel column headers don't match expected names
2. Headers have spaces, special characters, or different casing
3. Empty cells are treated as undefined instead of empty strings

## Expected Column Headers

The parser expects these **exact** headers (case-insensitive, will be normalized):

### Required Fields
- `id` - Unique show identifier
- `city` - City name
- `country` - 2-letter ISO code or full name (US, United States, etc.)
- `date` - ISO format YYYY-MM-DD or DD/MM/YYYY
- `fee` - Numeric amount
- `status` - One of: confirmed, pending, offer, canceled, archived, postponed

### Optional Fields
- `feeCurrency` - EUR, USD, GBP, or AUD (default: EUR)
- `paid` - true/false/yes/no (default: false)
- `name` - Show or venue name
- `venue` - Venue name
- `promoter` - Promoter name
- `lat` - Latitude (-90 to 90)
- `lng` - Longitude (-180 to 180)
- `whtPct` - Withholding tax percentage (0-100)
- `mgmtAgency` - Management agency
- `bookingAgency` - Booking agency
- `notes` - Additional notes
- `cost` - Show production costs

## Header Normalization

The parser automatically normalizes headers:
- `"ID"` → `"id"`
- `"City Name"` → `"cityName"` ❌ (expects `"city"`)
- `"Show Date"` → `"showDate"` ❌ (expects `"date"`)
- `"Fee Amount"` → `"feeAmount"` ❌ (expects `"fee"`)

**Solution**: Use exact column names listed above

## Debugging Steps

### Step 1: Check Your Excel File

Open your Excel file and verify:
1. **First row** contains headers
2. **Header names** match exactly (id, city, country, date, fee, status)
3. **No merged cells** in header row
4. **No empty columns** between data columns
5. **Data starts on row 2** (row 1 = headers)

### Step 2: Console Logging

When you import the file, open browser DevTools (F12) and check console for:

```
Excel CSV preview: ["id,city,country,date,fee,status", "show-001,London,GB,2025-07-15,10000,confirmed", ...]
Excel converted to CSV, length: 1234
Parsed headers: ["id", "city", "country", "date", "fee", "status"]
First row: {id: "show-001", city: "London", ...}
```

If you see:
- `Parsed headers: ["Column1", "Column2", ...]` → Headers missing
- `Parsed headers: ["Show ID", "City Name", ...]` → Wrong header names
- `First row: {}` → No data parsed

### Step 3: Test with Template

Download the CSV template and test:
1. Click "Download CSV Template" in the importer
2. Open in Excel
3. **Save As** → Excel Workbook (.xlsx)
4. Import the .xlsx file
5. Should work ✅

### Step 4: Manual Header Fix

If your Excel has different headers:

**Option A: Rename in Excel**
1. Open Excel file
2. Change row 1 headers to match expected names exactly:
   ```
   ID → id
   City Name → city
   Show Date → date
   Fee Amount → fee
   ```
3. Save and retry import

**Option B: Add Mapping Feature** (Future Enhancement)
- Field mapper UI to map custom columns to expected fields
- Not yet implemented

## Valid Excel Example

```
| id                      | city    | country | date       | fee   | feeCurrency | status    | paid  |
|-------------------------|---------|---------|------------|-------|-------------|-----------|-------|
| show-2025-07-15-london  | London  | GB      | 2025-07-15 | 10000 | GBP         | confirmed | true  |
| show-2025-08-20-berlin  | Berlin  | DE      | 2025-08-20 | 12000 | EUR         | pending   | false |
```

## Common Mistakes

### ❌ Wrong: Headers with Spaces
```
Show ID | City Name | Country Code | Show Date | Fee Amount
```

### ✅ Correct: Exact Headers
```
id | city | country | date | fee
```

### ❌ Wrong: Empty First Row
```
Row 1: (empty)
Row 2: id, city, country, ...
Row 3: show-001, London, GB, ...
```

### ✅ Correct: Headers on Row 1
```
Row 1: id, city, country, ...
Row 2: show-001, London, GB, ...
```

### ❌ Wrong: Merged Cells
```
|   Show Information    |  Financial  |
| id | city | country  | fee | status |
```

### ✅ Correct: Simple Headers
```
| id | city | country | fee | status |
```

## Quick Fix Script

If you have many Excel files with wrong headers, you can:

1. **Rename columns in Excel**:
   - Select header row
   - Find & Replace all:
     - "Show ID" → "id"
     - "City Name" → "city"
     - "Show Date" → "date"
     - "Fee Amount" → "fee"

2. **Or export to CSV first**:
   - Excel → File → Save As → CSV (UTF-8)
   - Open CSV in text editor
   - Fix first line (headers)
   - Import CSV instead of Excel

## Next Steps After Fix

Once headers match:
1. Import should show **0 errors**
2. Preview table shows all rows
3. Stats show: `Valid: X, Errors: 0`
4. Can proceed with append/replace import

## Contact

If issues persist after following this guide:
- Check browser console for detailed logs
- Share Excel file structure (first 3 rows)
- Share console output from DevTools

---

**Generated**: ${new Date().toISOString()}
