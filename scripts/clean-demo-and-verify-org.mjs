#!/usr/bin/env node

/**
 * Clean demo organizations from Firestore and verify real organization
 * - Deletes Shalizi Agency demo org
 * - Verifies The Prophecy organization has correct data
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync('./firebase-admin-key.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

const REAL_ORG_ID = 'org_artist_prophecy';
const DEMO_ORG_ID = 'org_agency_shalizi';

async function deleteDemoOrg() {
  console.log(`\n🗑️  Deleting demo organization: ${DEMO_ORG_ID}...`);
  
  try {
    // Delete members subcollection
    const membersSnapshot = await db.collection(`organizations/${DEMO_ORG_ID}/members`).get();
    const batch = db.batch();
    membersSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    if (membersSnapshot.size > 0) {
      await batch.commit();
      console.log(`   ✅ Deleted ${membersSnapshot.size} member documents`);
    }
    
    // Delete organization document
    await db.doc(`organizations/${DEMO_ORG_ID}`).delete();
    console.log(`   ✅ Deleted organization document`);
    
    // Delete from user memberships cache
    const usersSnapshot = await db.collection('users').get();
    const cacheBatch = db.batch();
    let cacheDeletes = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const membershipDoc = db.doc(`users/${userDoc.id}/organization_memberships/${DEMO_ORG_ID}`);
      const membershipSnap = await membershipDoc.get();
      if (membershipSnap.exists) {
        cacheBatch.delete(membershipDoc);
        cacheDeletes++;
      }
    }
    
    if (cacheDeletes > 0) {
      await cacheBatch.commit();
      console.log(`   ✅ Deleted ${cacheDeletes} membership cache entries`);
    }
    
    console.log(`✅ Demo organization deleted successfully\n`);
  } catch (error) {
    console.error(`❌ Error deleting demo org:`, error.message);
  }
}

async function verifyRealOrg() {
  console.log(`\n🔍 Verifying real organization: ${REAL_ORG_ID}...`);
  
  try {
    const orgDoc = await db.doc(`organizations/${REAL_ORG_ID}`).get();
    
    if (!orgDoc.exists) {
      console.log(`❌ Organization does not exist!`);
      return;
    }
    
    const orgData = orgDoc.data();
    console.log(`\n📊 Current organization data:`);
    console.log(`   ID: ${orgDoc.id}`);
    console.log(`   Name: ${orgData.name}`);
    console.log(`   Type: ${orgData.type}`);
    console.log(`   Created By: ${orgData.createdBy}`);
    console.log(`   Created At: ${orgData.createdAt?.toDate()}`);
    
    // Check if name needs to be updated
    if (orgData.name === 'Demo Artist Org' || orgData.name === 'The Prophecy (Demo)') {
      console.log(`\n🔄 Updating organization name to "The Prophecy"...`);
      await db.doc(`organizations/${REAL_ORG_ID}`).update({
        name: 'The Prophecy',
        updatedAt: FieldValue.serverTimestamp(),
      });
      console.log(`✅ Organization name updated`);
    } else {
      console.log(`✅ Organization name is correct`);
    }
    
    // Check members
    const membersSnapshot = await db.collection(`organizations/${REAL_ORG_ID}/members`).get();
    console.log(`\n👥 Members (${membersSnapshot.size}):`);
    membersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`   - ${doc.id}: ${data.email} (${data.role})`);
    });
    
    console.log(`\n✅ Organization verification complete\n`);
  } catch (error) {
    console.error(`❌ Error verifying organization:`, error.message);
  }
}

async function main() {
  console.log('🧹 Cleaning demo organizations and verifying real organization\n');
  console.log('='.repeat(60));
  
  await deleteDemoOrg();
  await verifyRealOrg();
  
  console.log('='.repeat(60));
  console.log('\n✅ Done!\n');
  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
