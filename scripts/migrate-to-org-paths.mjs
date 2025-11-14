#!/usr/bin/env node

/**
 * Migration Script: Move user data to organization-scoped paths
 * 
 * FROM: users/{userId}/{collection}
 * TO:   users/{userId}/organizations/{orgId}/{collection}
 * 
 * Collections to migrate:
 * - shows
 * - contacts
 * - venues
 * - finance (transactions, budgets, etc)
 * - calendar_events
 * - actions
 * 
 * Usage:
 *   node scripts/migrate-to-org-paths.mjs --userId=USER_ID --orgId=ORG_ID [--dry-run] [--collection=COLLECTION_NAME]
 * 
 * Options:
 *   --userId      User ID to migrate (required)
 *   --orgId       Organization ID to use (required)
 *   --dry-run     Preview changes without applying them
 *   --collection  Migrate only specific collection (default: all)
 *   --batch-size  Number of documents per batch (default: 500)
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.replace(/^--/, '').split('=');
  acc[key] = value || true;
  return acc;
}, {});

const { userId, orgId, 'dry-run': dryRun, collection, 'batch-size': batchSize = 500 } = args;

// Validation
if (!userId || !orgId) {
  console.error('❌ Error: --userId and --orgId are required');
  console.log('\nUsage:');
  console.log('  node scripts/migrate-to-org-paths.mjs --userId=USER_ID --orgId=ORG_ID [--dry-run]');
  process.exit(1);
}

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '..', 'firebase-admin-key.json'), 'utf8')
);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// Collections to migrate
const COLLECTIONS = [
  'shows',
  'contacts',
  'venues',
  'transactions',
  'budgets',
  'calendar_events',
  'actions'
];

const collectionsToMigrate = collection ? [collection] : COLLECTIONS;

/**
 * Migrate a single collection
 */
async function migrateCollection(userId, orgId, collectionName, dryRun = false) {
  console.log(`\n📦 Migrating collection: ${collectionName}`);
  console.log(`   From: users/${userId}/${collectionName}`);
  console.log(`   To:   users/${userId}/organizations/${orgId}/${collectionName}`);
  
  const sourceRef = db.collection(`users/${userId}/${collectionName}`);
  const destRef = db.collection(`users/${userId}/organizations/${orgId}/${collectionName}`);
  
  try {
    // Get all documents from source
    const snapshot = await sourceRef.get();
    
    if (snapshot.empty) {
      console.log(`   ⚠️  No documents found in ${collectionName}`);
      return { migrated: 0, errors: 0 };
    }
    
    console.log(`   📄 Found ${snapshot.size} documents`);
    
    let migrated = 0;
    let errors = 0;
    const batch = db.batch();
    let batchCount = 0;
    
    for (const doc of snapshot.docs) {
      try {
        const data = doc.data();
        
        if (dryRun) {
          console.log(`   [DRY RUN] Would migrate: ${doc.id}`);
        } else {
          // Copy to new location
          const newDocRef = destRef.doc(doc.id);
          batch.set(newDocRef, data);
          
          batchCount++;
          
          // Commit batch every batchSize documents
          if (batchCount >= batchSize) {
            await batch.commit();
            console.log(`   ✓ Committed batch of ${batchCount} documents`);
            batchCount = 0;
          }
        }
        
        migrated++;
      } catch (error) {
        console.error(`   ❌ Error migrating document ${doc.id}:`, error.message);
        errors++;
      }
    }
    
    // Commit remaining documents
    if (batchCount > 0 && !dryRun) {
      await batch.commit();
      console.log(`   ✓ Committed final batch of ${batchCount} documents`);
    }
    
    console.log(`   ✅ Migration complete: ${migrated} migrated, ${errors} errors`);
    
    return { migrated, errors };
  } catch (error) {
    console.error(`   ❌ Error accessing collection:`, error.message);
    return { migrated: 0, errors: 1 };
  }
}

/**
 * Verify migration
 */
async function verifyMigration(userId, orgId, collectionName) {
  const sourceRef = db.collection(`users/${userId}/${collectionName}`);
  const destRef = db.collection(`users/${userId}/organizations/${orgId}/${collectionName}`);
  
  const [sourceSnapshot, destSnapshot] = await Promise.all([
    sourceRef.get(),
    destRef.get()
  ]);
  
  const sourceCount = sourceSnapshot.size;
  const destCount = destSnapshot.size;
  
  if (sourceCount === destCount) {
    console.log(`   ✅ Verification passed: ${destCount} documents in both locations`);
    return true;
  } else {
    console.log(`   ⚠️  Count mismatch: Source=${sourceCount}, Dest=${destCount}`);
    return false;
  }
}

/**
 * Delete source data after successful migration
 */
async function cleanupSource(userId, collectionName, dryRun = false) {
  const sourceRef = db.collection(`users/${userId}/${collectionName}`);
  
  console.log(`\n🧹 Cleaning up source: users/${userId}/${collectionName}`);
  
  if (dryRun) {
    const snapshot = await sourceRef.get();
    console.log(`   [DRY RUN] Would delete ${snapshot.size} documents`);
    return;
  }
  
  // Delete in batches
  const snapshot = await sourceRef.get();
  const batch = db.batch();
  
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  console.log(`   ✅ Deleted ${snapshot.size} documents from source`);
}

/**
 * Main migration function
 */
async function runMigration() {
  console.log('\n🚀 Starting Organization Path Migration');
  console.log('=====================================');
  console.log(`User ID: ${userId}`);
  console.log(`Org ID: ${orgId}`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Collections: ${collectionsToMigrate.join(', ')}`);
  
  const results = {
    total: 0,
    migrated: 0,
    errors: 0
  };
  
  // Migrate each collection
  for (const collectionName of collectionsToMigrate) {
    const result = await migrateCollection(userId, orgId, collectionName, dryRun);
    results.migrated += result.migrated;
    results.errors += result.errors;
    
    // Verify if not dry run
    if (!dryRun && result.migrated > 0) {
      const verified = await verifyMigration(userId, orgId, collectionName);
      
      if (verified) {
        // Optional: Clean up source data
        console.log(`\n⚠️  Source data still exists. Run with --cleanup to remove it.`);
        if (args.cleanup) {
          await cleanupSource(userId, collectionName, dryRun);
        }
      }
    }
  }
  
  // Summary
  console.log('\n=====================================');
  console.log('📊 Migration Summary');
  console.log('=====================================');
  console.log(`Total documents migrated: ${results.migrated}`);
  console.log(`Errors encountered: ${results.errors}`);
  
  if (dryRun) {
    console.log('\n⚠️  This was a DRY RUN. No changes were made.');
    console.log('   Remove --dry-run to execute migration.');
  } else {
    console.log('\n✅ Migration complete!');
  }
  
  process.exit(results.errors > 0 ? 1 : 0);
}

// Run migration
runMigration().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
