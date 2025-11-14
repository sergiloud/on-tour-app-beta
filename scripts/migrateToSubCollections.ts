/**
 * Migration Script: Flat Collections → Sub-Collections
 * 
 * Migrates existing Firestore data to new scalable architecture:
 * 
 * OLD:
 * - users/{uid}/organizations/{orgId}/transactions/{txId}
 * 
 * NEW:
 * - users/{uid}/organizations/{orgId}/finance_snapshots/{snapshotId}/transactions/{txId}
 * 
 * This migration:
 * 1. Creates a default finance snapshot (year-to-date)
 * 2. Moves all transactions to the new sub-collection
 * 3. Preserves original data (does not delete old structure until verified)
 * 4. Logs all operations for audit trail
 * 
 * Usage:
 *   npm run migrate:subcollections -- --userId=<uid> --orgId=<orgId> [--dryRun]
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  query,
  Timestamp,
} from 'firebase/firestore';

// Firebase config from environment
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface MigrationStats {
  usersProcessed: number;
  transactionsMigrated: number;
  snapshotsCreated: number;
  errors: string[];
  startTime: Date;
  endTime?: Date;
}

interface OldTransaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  category: string;
  showId?: string;
  description: string;
  date: any; // Timestamp or string
  createdAt: any;
  updatedAt: any;
  [key: string]: any;
}

/**
 * Migrate transactions for a single user/org
 */
async function migrateUserOrg(
  userId: string,
  orgId: string,
  dryRun: boolean,
  stats: MigrationStats
): Promise<void> {
  console.log(`\n📊 Processing user: ${userId}, org: ${orgId}`);

  // 1. Fetch all existing transactions from old structure
  const oldPath = `users/${userId}/organizations/${orgId}/transactions`;
  const oldTransactionsRef = collection(db, oldPath);
  const oldTransactionsSnap = await getDocs(oldTransactionsRef);

  if (oldTransactionsSnap.empty) {
    console.log(`   ℹ️  No transactions found in old structure - skipping`);
    return;
  }

  const transactions: OldTransaction[] = oldTransactionsSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as OldTransaction[];

  console.log(`   📝 Found ${transactions.length} transactions to migrate`);

  // 2. Create default finance snapshot (year-to-date)
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const snapshotId = `ytd-${now.getFullYear()}`;
  const snapshotPath = `users/${userId}/organizations/${orgId}/finance_snapshots/${snapshotId}`;

  const snapshotMetadata = {
    id: snapshotId,
    name: `Year to Date ${now.getFullYear()}`,
    startDate: Timestamp.fromDate(yearStart),
    endDate: Timestamp.fromDate(now),
    status: 'active' as const,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    transactionCount: transactions.length,
  };

  if (!dryRun) {
    await setDoc(doc(db, snapshotPath), snapshotMetadata);
    console.log(`   ✅ Created snapshot: ${snapshotId}`);
    stats.snapshotsCreated++;
  } else {
    console.log(`   [DRY RUN] Would create snapshot: ${snapshotId}`);
  }

  // 3. Migrate each transaction to new sub-collection
  for (const tx of transactions) {
    try {
      const newTxPath = `${snapshotPath}/transactions/${tx.id}`;

      // Normalize date fields
      const normalizedTx = {
        ...tx,
        date: tx.date instanceof Timestamp ? tx.date : Timestamp.fromDate(new Date(tx.date)),
        createdAt: tx.createdAt instanceof Timestamp ? tx.createdAt : Timestamp.fromDate(new Date(tx.createdAt || now)),
        updatedAt: tx.updatedAt instanceof Timestamp ? tx.updatedAt : Timestamp.now(),
      };

      if (!dryRun) {
        await setDoc(doc(db, newTxPath), normalizedTx);
        stats.transactionsMigrated++;
      }

      if (stats.transactionsMigrated % 50 === 0) {
        console.log(`   ⏳ Migrated ${stats.transactionsMigrated} transactions...`);
      }
    } catch (err) {
      const errorMsg = `Failed to migrate transaction ${tx.id}: ${err}`;
      console.error(`   ❌ ${errorMsg}`);
      stats.errors.push(errorMsg);
    }
  }

  if (!dryRun) {
    console.log(`   ✅ Migrated ${transactions.length} transactions to new structure`);
  } else {
    console.log(`   [DRY RUN] Would migrate ${transactions.length} transactions`);
  }

  stats.usersProcessed++;
}

/**
 * Parse command line arguments
 */
function parseArgs(): { userId?: string; orgId?: string; dryRun: boolean; all: boolean } {
  const args = process.argv.slice(2);
  const result: { userId?: string; orgId?: string; dryRun: boolean; all: boolean } = {
    dryRun: false,
    all: false,
  };

  for (const arg of args) {
    if (arg === '--dryRun') {
      result.dryRun = true;
    } else if (arg === '--all') {
      result.all = true;
    } else if (arg.startsWith('--userId=')) {
      result.userId = arg.split('=')[1];
    } else if (arg.startsWith('--orgId=')) {
      result.orgId = arg.split('=')[1];
    }
  }

  return result;
}

/**
 * Main migration function
 */
async function migrate() {
  const { userId, orgId, dryRun, all } = parseArgs();

  console.log('🚀 Starting Firestore Sub-Collection Migration');
  console.log('===============================================');
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE MIGRATION'}`);
  console.log(`Scope: ${all ? 'ALL USERS' : `Single user (${userId}/${orgId})`}`);
  console.log('===============================================\n');

  if (!all && (!userId || !orgId)) {
    console.error('❌ Error: Must provide --userId and --orgId, or use --all flag');
    console.error('Usage: npm run migrate:subcollections -- --userId=<uid> --orgId=<orgId> [--dryRun]');
    console.error('   or: npm run migrate:subcollections -- --all [--dryRun]');
    process.exit(1);
  }

  const stats: MigrationStats = {
    usersProcessed: 0,
    transactionsMigrated: 0,
    snapshotsCreated: 0,
    errors: [],
    startTime: new Date(),
  };

  try {
    if (all) {
      // Migrate all users (fetch from users collection)
      console.log('⚠️  --all flag not yet implemented. Use individual user migration for now.');
      process.exit(1);
    } else {
      // Migrate single user/org
      await migrateUserOrg(userId!, orgId!, dryRun, stats);
    }

    stats.endTime = new Date();

    // Print summary
    console.log('\n===============================================');
    console.log('📊 Migration Summary');
    console.log('===============================================');
    console.log(`Users processed: ${stats.usersProcessed}`);
    console.log(`Snapshots created: ${stats.snapshotsCreated}`);
    console.log(`Transactions migrated: ${stats.transactionsMigrated}`);
    console.log(`Errors: ${stats.errors.length}`);
    console.log(`Duration: ${((stats.endTime.getTime() - stats.startTime.getTime()) / 1000).toFixed(2)}s`);

    if (stats.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      stats.errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    }

    if (dryRun) {
      console.log('\n⚠️  This was a DRY RUN - no changes were made to Firestore');
      console.log('   Remove --dryRun flag to perform actual migration');
    } else {
      console.log('\n✅ Migration completed successfully!');
      console.log('   Old data preserved at: users/{uid}/organizations/{orgId}/transactions/');
      console.log('   New data location: users/{uid}/organizations/{orgId}/finance_snapshots/{snapshotId}/transactions/');
      console.log('\n⚠️  Verify new data before deleting old structure!');
    }

    process.exit(stats.errors.length > 0 ? 1 : 0);
  } catch (err) {
    console.error('\n❌ Migration failed:', err);
    process.exit(1);
  }
}

// Run migration
migrate();
