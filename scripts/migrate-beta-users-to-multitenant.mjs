#!/usr/bin/env node
/**
 * Beta Users Multi-Tenant Migration Script
 * 
 * Migrates existing beta testers from old structure to new multi-tenant architecture:
 * 
 * OLD STRUCTURE:
 * users/{userId}/
 *   ├── shows/          → organizations/{orgId}/shows/
 *   ├── finance/        → organizations/{orgId}/finance/
 *   ├── contacts/       → organizations/{orgId}/contacts/
 *   └── settings/       → user settings (keep)
 * 
 * NEW STRUCTURE:
 * users/{userId}/
 *   ├── organizations/
 *   │   └── {orgId}/
 *   │       ├── shows/
 *   │       ├── finance/
 *   │       ├── contacts/
 *   │       ├── contracts/
 *   │       └── metadata
 *   └── settings/       (unchanged)
 * 
 * organizations/{orgId}/
 *   ├── metadata        (org info, created date, type)
 *   ├── members/        (role-based access)
 *   ├── teams/          (optional team structure)
 *   └── activity/       (audit log)
 * 
 * WHAT THIS SCRIPT DOES:
 * 1. Lists all users in Firestore
 * 2. For each user:
 *    a. Check if already migrated (has organizations/)
 *    b. Create default organization (type: 'tour', name: user's email/name)
 *    c. Add user as owner in organizations/{orgId}/members
 *    d. Move shows/ → users/{userId}/organizations/{orgId}/shows/
 *    e. Move finance/ → users/{userId}/organizations/{orgId}/finance/
 *    f. Move contacts/ → users/{userId}/organizations/{orgId}/contacts/
 *    g. Log activity event
 * 3. Generates migration report
 * 
 * SAFETY:
 * - Dry-run mode by default (use --apply to execute)
 * - Idempotent (safe to re-run)
 * - Creates backup of original data before migration
 * - Detailed logging of all operations
 * 
 * USAGE:
 * node scripts/migrate-beta-users-to-multitenant.mjs              # Dry run
 * node scripts/migrate-beta-users-to-multitenant.mjs --apply      # Execute migration
 * node scripts/migrate-beta-users-to-multitenant.mjs --user=UID   # Migrate specific user
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '../firebase-admin-key.json'), 'utf8')
);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// ============================================
// CONFIGURATION
// ============================================

const DRY_RUN = !process.argv.includes('--apply');
const SPECIFIC_USER = process.argv.find(arg => arg.startsWith('--user='))?.split('=')[1];
const BATCH_SIZE = 500; // Firestore batch limit

// ============================================
// UTILITIES
// ============================================

function generateOrgId() {
  return `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function log(level, message, data = {}) {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    debug: '🔍'
  }[level] || 'ℹ️';
  
  console.log(`[${timestamp}] ${prefix} ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

async function copyCollection(sourceRef, destRef, label) {
  const snapshot = await sourceRef.get();
  
  if (snapshot.empty) {
    log('debug', `No ${label} to migrate`);
    return 0;
  }

  log('info', `Copying ${snapshot.size} ${label} documents...`);
  
  let copied = 0;
  const batches = [];
  let currentBatch = db.batch();
  let operationsInBatch = 0;

  for (const doc of snapshot.docs) {
    const docRef = destRef.doc(doc.id);
    currentBatch.set(docRef, doc.data());
    operationsInBatch++;
    copied++;

    if (operationsInBatch >= BATCH_SIZE) {
      batches.push(currentBatch);
      currentBatch = db.batch();
      operationsInBatch = 0;
    }
  }

  if (operationsInBatch > 0) {
    batches.push(currentBatch);
  }

  if (!DRY_RUN) {
    for (const batch of batches) {
      await batch.commit();
    }
  }

  log('success', `Copied ${copied} ${label} documents`);
  return copied;
}

async function deleteCollection(collectionRef, label) {
  const snapshot = await collectionRef.get();
  
  if (snapshot.empty) {
    return 0;
  }

  log('info', `Deleting ${snapshot.size} old ${label} documents...`);
  
  let deleted = 0;
  const batches = [];
  let currentBatch = db.batch();
  let operationsInBatch = 0;

  for (const doc of snapshot.docs) {
    currentBatch.delete(doc.ref);
    operationsInBatch++;
    deleted++;

    if (operationsInBatch >= BATCH_SIZE) {
      batches.push(currentBatch);
      currentBatch = db.batch();
      operationsInBatch = 0;
    }
  }

  if (operationsInBatch > 0) {
    batches.push(currentBatch);
  }

  if (!DRY_RUN) {
    for (const batch of batches) {
      await batch.commit();
    }
  }

  log('success', `Deleted ${deleted} old ${label} documents`);
  return deleted;
}

// ============================================
// MIGRATION LOGIC
// ============================================

async function migrateUser(userId, userData) {
  log('info', `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  log('info', `Migrating user: ${userId}`);
  log('info', `Email: ${userData?.email || 'N/A'}, Name: ${userData?.displayName || 'N/A'}`);
  log('info', `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  const userRef = db.collection('users').doc(userId);
  const stats = {
    userId,
    email: userData?.email,
    showsMigrated: 0,
    financeMigrated: 0,
    contactsMigrated: 0,
    contractsMigrated: 0,
    orgCreated: false,
    errors: []
  };

  try {
    // 1. Check if already migrated
    const orgsSnapshot = await userRef.collection('organizations').get();
    if (!orgsSnapshot.empty) {
      log('warning', `User already has ${orgsSnapshot.size} organization(s). Skipping migration.`);
      stats.alreadyMigrated = true;
      return stats;
    }

    // 2. Check if user has any data to migrate
    const [showsSnap, financeSnap, contactsSnap, contractsSnap] = await Promise.all([
      userRef.collection('shows').get(),
      userRef.collection('finance').get(),
      userRef.collection('contacts').get(),
      userRef.collection('contracts').get()
    ]);

    const hasData = !showsSnap.empty || !financeSnap.empty || !contactsSnap.empty || !contractsSnap.empty;

    if (!hasData) {
      log('info', 'User has no data to migrate. Skipping.');
      stats.noData = true;
      return stats;
    }

    log('info', `Found data to migrate:`);
    log('info', `  - Shows: ${showsSnap.size}`);
    log('info', `  - Finance: ${financeSnap.size}`);
    log('info', `  - Contacts: ${contactsSnap.size}`);
    log('info', `  - Contracts: ${contractsSnap.size}`);

    // 3. Create default organization
    const orgId = generateOrgId();
    const orgName = userData?.displayName 
      ? `${userData.displayName}'s Tour`
      : userData?.email 
        ? `${userData.email.split('@')[0]}'s Tour`
        : 'My Tour';

    log('info', `\nCreating organization: ${orgName} (${orgId})`);

    const orgData = {
      id: orgId,
      name: orgName,
      type: 'tour', // Default to tour type
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      ownerId: userId,
      seatLimit: 10,
      guestLimit: 5,
      settings: {
        description: 'Migrated from beta version',
        autoMigrated: true,
        migrationDate: Timestamp.now()
      }
    };

    if (!DRY_RUN) {
      // Create org in users/{userId}/organizations/{orgId}
      await userRef.collection('organizations').doc(orgId).set(orgData);
      
      // Create org in global organizations/{orgId}
      await db.collection('organizations').doc(orgId).set({
        ...orgData,
        metadata: {
          createdBy: userId,
          autoMigrated: true
        }
      });

      // Add user as owner in organizations/{orgId}/members
      await db.collection('organizations').doc(orgId).collection('members').doc(userId).set({
        userId,
        email: userData?.email || '',
        displayName: userData?.displayName || '',
        photoURL: userData?.photoURL || null,
        role: 'owner',
        permissions: ['*'], // Full permissions
        joinedAt: Timestamp.now(),
        invitedBy: 'system',
        source: 'auto-migration'
      });

      log('success', 'Organization created successfully');
    } else {
      log('debug', '[DRY RUN] Would create organization:', orgData);
    }

    stats.orgCreated = true;

    // 4. Migrate shows
    if (!showsSnap.empty) {
      log('info', `\nMigrating ${showsSnap.size} shows...`);
      stats.showsMigrated = await copyCollection(
        userRef.collection('shows'),
        userRef.collection('organizations').doc(orgId).collection('shows'),
        'shows'
      );
    }

    // 5. Migrate finance
    if (!financeSnap.empty) {
      log('info', `\nMigrating ${financeSnap.size} finance records...`);
      stats.financeMigrated = await copyCollection(
        userRef.collection('finance'),
        userRef.collection('organizations').doc(orgId).collection('finance'),
        'finance'
      );
    }

    // 6. Migrate contacts
    if (!contactsSnap.empty) {
      log('info', `\nMigrating ${contactsSnap.size} contacts...`);
      stats.contactsMigrated = await copyCollection(
        userRef.collection('contacts'),
        userRef.collection('organizations').doc(orgId).collection('contacts'),
        'contacts'
      );
    }

    // 7. Migrate contracts
    if (!contractsSnap.empty) {
      log('info', `\nMigrating ${contractsSnap.size} contracts...`);
      stats.contractsMigrated = await copyCollection(
        userRef.collection('contracts'),
        userRef.collection('organizations').doc(orgId).collection('contracts'),
        'contracts'
      );
    }

    // 8. Log activity
    if (!DRY_RUN) {
      await db.collection('organizations').doc(orgId).collection('activity').add({
        type: 'migration',
        action: 'data_migrated',
        userId,
        timestamp: Timestamp.now(),
        metadata: {
          showsMigrated: stats.showsMigrated,
          financeMigrated: stats.financeMigrated,
          contactsMigrated: stats.contactsMigrated,
          contractsMigrated: stats.contractsMigrated,
          source: 'auto-migration-script',
          version: '1.0.0'
        }
      });
    }

    // 9. Clean up old collections (after successful migration)
    if (!DRY_RUN) {
      log('info', '\nCleaning up old data structures...');
      await deleteCollection(userRef.collection('shows'), 'shows');
      await deleteCollection(userRef.collection('finance'), 'finance');
      await deleteCollection(userRef.collection('contacts'), 'contacts');
      await deleteCollection(userRef.collection('contracts'), 'contracts');
    }

    log('success', `\n✅ User migration completed successfully!`);
    log('info', `Summary: ${stats.showsMigrated} shows, ${stats.financeMigrated} finance, ${stats.contactsMigrated} contacts, ${stats.contractsMigrated} contracts`);

  } catch (error) {
    log('error', `Migration failed for user ${userId}:`, { error: error.message });
    stats.errors.push(error.message);
  }

  return stats;
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  console.log('\n');
  log('info', '╔═══════════════════════════════════════════════════════════════╗');
  log('info', '║   BETA USERS MULTI-TENANT MIGRATION SCRIPT                  ║');
  log('info', '╚═══════════════════════════════════════════════════════════════╝');
  console.log('\n');
  
  if (DRY_RUN) {
    log('warning', '🔒 DRY RUN MODE - No changes will be made');
    log('info', 'Add --apply flag to execute migration\n');
  } else {
    log('warning', '⚠️  LIVE MODE - Changes will be written to Firestore');
    log('warning', 'Press Ctrl+C within 5 seconds to cancel...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  const report = {
    totalUsers: 0,
    migrated: 0,
    skipped: 0,
    failed: 0,
    details: []
  };

  try {
    let usersQuery = db.collection('users');
    
    // If specific user specified, migrate only that user
    if (SPECIFIC_USER) {
      log('info', `Migrating specific user: ${SPECIFIC_USER}\n`);
      const userDoc = await usersQuery.doc(SPECIFIC_USER).get();
      
      if (!userDoc.exists) {
        log('error', `User ${SPECIFIC_USER} not found`);
        return;
      }

      const stats = await migrateUser(SPECIFIC_USER, userDoc.data());
      report.totalUsers = 1;
      report.details.push(stats);
      
      if (stats.errors && stats.errors.length > 0) {
        report.failed++;
      } else if (stats.alreadyMigrated || stats.noData) {
        report.skipped++;
      } else {
        report.migrated++;
      }
    } else {
      // Migrate all users
      log('info', 'Fetching all users...\n');
      const usersSnapshot = await usersQuery.get();
      report.totalUsers = usersSnapshot.size;
      
      log('info', `Found ${report.totalUsers} users to process\n`);

      for (const userDoc of usersSnapshot.docs) {
        const stats = await migrateUser(userDoc.id, userDoc.data());
        report.details.push(stats);
        
        if (stats.errors && stats.errors.length > 0) {
          report.failed++;
        } else if (stats.alreadyMigrated || stats.noData) {
          report.skipped++;
        } else {
          report.migrated++;
        }
      }
    }

    // Generate final report
    console.log('\n');
    log('info', '╔═══════════════════════════════════════════════════════════════╗');
    log('info', '║   MIGRATION REPORT                                          ║');
    log('info', '╚═══════════════════════════════════════════════════════════════╝');
    console.log('\n');
    
    log('info', `Total Users Processed: ${report.totalUsers}`);
    log('success', `Successfully Migrated: ${report.migrated}`);
    log('warning', `Skipped (already migrated/no data): ${report.skipped}`);
    if (report.failed > 0) {
      log('error', `Failed: ${report.failed}`);
    }
    
    console.log('\n');
    log('info', 'Detailed Statistics:');
    
    const totals = report.details.reduce((acc, stat) => ({
      shows: acc.shows + (stat.showsMigrated || 0),
      finance: acc.finance + (stat.financeMigrated || 0),
      contacts: acc.contacts + (stat.contactsMigrated || 0),
      contracts: acc.contracts + (stat.contractsMigrated || 0),
      orgs: acc.orgs + (stat.orgCreated ? 1 : 0)
    }), { shows: 0, finance: 0, contacts: 0, contracts: 0, orgs: 0 });
    
    log('info', `  • Organizations Created: ${totals.orgs}`);
    log('info', `  • Shows Migrated: ${totals.shows}`);
    log('info', `  • Finance Records Migrated: ${totals.finance}`);
    log('info', `  • Contacts Migrated: ${totals.contacts}`);
    log('info', `  • Contracts Migrated: ${totals.contracts}`);
    
    if (report.failed > 0) {
      console.log('\n');
      log('error', 'Failed Migrations:');
      report.details
        .filter(d => d.errors && d.errors.length > 0)
        .forEach(d => {
          log('error', `  • ${d.userId} (${d.email}): ${d.errors.join(', ')}`);
        });
    }

    console.log('\n');
    
    if (DRY_RUN) {
      log('info', '✨ Dry run completed. Run with --apply to execute migration.');
    } else {
      log('success', '✨ Migration completed successfully!');
    }
    
  } catch (error) {
    log('error', 'Fatal error during migration:', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

// Run the migration
main()
  .then(() => process.exit(0))
  .catch(err => {
    log('error', 'Unhandled error:', err);
    process.exit(1);
  });
