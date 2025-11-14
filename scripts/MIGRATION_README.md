# Firestore Migration: Sub-Collections

## Overview

This migration converts the flat Firestore structure to a scalable sub-collection architecture.

### What Changes

**Before (Flat Structure):**
```
users/{uid}/organizations/{orgId}/
  └─ transactions/{txId}
```

**After (Sub-Collections):**
```
users/{uid}/organizations/{orgId}/
  └─ finance_snapshots/{snapshotId}/
      └─ transactions/{txId}
```

### Why?

- **Scalability**: Firestore documents have a 1MB limit. Arrays in documents can't scale beyond ~10,000 transactions.
- **Pagination**: Sub-collections enable efficient cursor-based pagination.
- **Filtering**: Server-side queries with `where()` clauses on sub-collections are much faster.
- **Unlimited Growth**: Sub-collections can contain millions of documents.

## Usage

### 1. Dry Run (Recommended First)

Test the migration without making changes:

```bash
npm run migrate:subcollections -- --userId=YOUR_USER_ID --orgId=YOUR_ORG_ID --dryRun
```

### 2. Live Migration

Run the actual migration:

```bash
npm run migrate:subcollections -- --userId=YOUR_USER_ID --orgId=YOUR_ORG_ID
```

### 3. Verify Data

After migration, verify:
- Transaction count matches in new location
- All fields preserved (date, amount, category, etc.)
- createdAt/updatedAt timestamps intact

### 4. Update App Code

Once verified, update components to use new hooks:
- `useTransactionsPaginated()` - paginated transactions
- `useTransactionsByDateRange()` - filtered by date
- `createTransaction()`, `updateTransaction()`, `deleteTransaction()` - CRUD operations

### 5. Clean Up Old Data

**Only after thorough verification:**
```typescript
// TODO: Create cleanup script to delete old transactions collection
```

## Migration Process

The script:
1. ✅ Creates a default finance snapshot (`ytd-2025`)
2. ✅ Copies all transactions to new sub-collection
3. ✅ Preserves all original data
4. ✅ Normalizes Timestamp fields
5. ✅ Logs all operations
6. ⚠️  **Does NOT delete** old structure (manual cleanup later)

## Example Output

```
🚀 Starting Firestore Sub-Collection Migration
===============================================
Mode: LIVE MIGRATION
Scope: Single user (abc123/org456)
===============================================

📊 Processing user: abc123, org: org456
   📝 Found 1,234 transactions to migrate
   ✅ Created snapshot: ytd-2025
   ⏳ Migrated 50 transactions...
   ⏳ Migrated 100 transactions...
   ...
   ✅ Migrated 1,234 transactions to new structure

===============================================
📊 Migration Summary
===============================================
Users processed: 1
Snapshots created: 1
Transactions migrated: 1,234
Errors: 0
Duration: 12.34s

✅ Migration completed successfully!
```

## Troubleshooting

### "Firebase not initialized"
- Check `.env` file has all Firebase config vars
- Ensure `VITE_FIREBASE_API_KEY` and `VITE_FIREBASE_PROJECT_ID` are set

### "Permission denied"
- Verify Firestore rules allow write access
- Ensure user is authenticated with proper permissions

### "Transaction already exists"
- Safe to re-run - uses `setDoc()` which merges data
- Old data won't be duplicated

## Safety

✅ **Non-destructive**: Original data remains untouched
✅ **Idempotent**: Safe to run multiple times
✅ **Dry-run mode**: Test before live migration
✅ **Audit trail**: Comprehensive logging
✅ **Error handling**: Continues on individual failures

## Next Steps

After migration:
1. Update Finance UI components
2. Update Shows/Calendar if needed
3. Test pagination in production
4. Monitor Firestore usage metrics
5. Delete old structure after 30 days verification period
