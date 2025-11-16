#!/usr/bin/env node
/**
 * Delete Demo Organizations
 * 
 * Removes demo organizations from Firestore
 * 
 * Run: node scripts/delete-demo-orgs.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync('./firebase-admin-key.json', 'utf8')
);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// Demo user ID
const DEMO_USER_ID = 'ooaTPnc4KvSzsWQxxfqnOdLvKU92';

// Demo organization IDs
const ORG_ARTIST_PROPHECY = 'org_artist_prophecy';
const ORG_AGENCY_SHALIZI = 'org_agency_shalizi';

async function deleteCollection(collectionRef, batchSize = 100) {
  const query = collectionRef.limit(batchSize);
  
  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(query, resolve) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    resolve();
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  process.nextTick(() => {
    deleteQueryBatch(query, resolve);
  });
}

async function deleteDemoOrganizations() {
  console.log('\n🗑️  Deleting Demo Organizations...\n');

  try {
    const demoOrgs = [
      { id: ORG_ARTIST_PROPHECY, name: 'The Prophecy (Demo)' },
      { id: ORG_AGENCY_SHALIZI, name: 'Shalizi Agency (Demo)' },
    ];

    for (const org of demoOrgs) {
      console.log(`\n📁 Deleting organization: ${org.name}`);

      const orgRef = db.doc(`organizations/${org.id}`);
      const orgDoc = await orgRef.get();

      if (!orgDoc.exists) {
        console.log(`   ℹ️  Organization doesn't exist`);
        continue;
      }

      // Delete members subcollection
      console.log(`   🗑️  Deleting members...`);
      const membersRef = orgRef.collection('members');
      await deleteCollection(membersRef);
      console.log(`   ✅ Members deleted`);

      // Delete shows subcollection
      console.log(`   🗑️  Deleting shows...`);
      const showsRef = orgRef.collection('shows');
      await deleteCollection(showsRef);
      console.log(`   ✅ Shows deleted`);

      // Delete finance_snapshots subcollection
      console.log(`   🗑️  Deleting finance snapshots...`);
      const financeRef = orgRef.collection('finance_snapshots');
      await deleteCollection(financeRef);
      console.log(`   ✅ Finance snapshots deleted`);

      // Delete contacts subcollection
      console.log(`   🗑️  Deleting contacts...`);
      const contactsRef = orgRef.collection('contacts');
      await deleteCollection(contactsRef);
      console.log(`   ✅ Contacts deleted`);

      // Delete contracts subcollection
      console.log(`   🗑️  Deleting contracts...`);
      const contractsRef = orgRef.collection('contracts');
      await deleteCollection(contractsRef);
      console.log(`   ✅ Contracts deleted`);

      // Delete venues subcollection
      console.log(`   🗑️  Deleting venues...`);
      const venuesRef = orgRef.collection('venues');
      await deleteCollection(venuesRef);
      console.log(`   ✅ Venues deleted`);

      // Delete organization document
      console.log(`   🗑️  Deleting organization document...`);
      await orgRef.delete();
      console.log(`   ✅ Organization deleted`);

      // Delete membership cache
      console.log(`   🗑️  Deleting membership cache...`);
      const membershipRef = db.doc(`users/${DEMO_USER_ID}/organization_memberships/${org.id}`);
      const membershipDoc = await membershipRef.get();
      if (membershipDoc.exists) {
        await membershipRef.delete();
        console.log(`   ✅ Membership cache deleted`);
      }
    }

    console.log(`\n✅ Demo organizations deleted successfully!`);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the deletion
deleteDemoOrganizations();
