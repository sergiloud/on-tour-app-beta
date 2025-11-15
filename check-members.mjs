#!/usr/bin/env node
/**
 * Check if organizations have members documents
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(
  readFileSync('./firebase-admin-key.json', 'utf8')
);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function checkMembers() {
  console.log('\n🔍 Checking organizations and members...\n');

  // Get all organizations
  const orgsSnap = await db.collection('organizations').get();
  
  console.log(`Found ${orgsSnap.size} organizations\n`);

  for (const orgDoc of orgsSnap.docs) {
    const orgData = orgDoc.data();
    console.log(`\n📦 Organization: ${orgData.name} (${orgDoc.id})`);
    console.log(`   Type: ${orgData.type}`);
    console.log(`   Created by: ${orgData.createdBy}`);

    // Check members sub-collection
    const membersSnap = await db
      .collection(`organizations/${orgDoc.id}/members`)
      .get();

    if (membersSnap.empty) {
      console.log(`   ❌ NO MEMBERS FOUND - This will cause permission errors!`);
    } else {
      console.log(`   ✅ ${membersSnap.size} members found:`);
      membersSnap.docs.forEach(memberDoc => {
        const memberData = memberDoc.data();
        console.log(`      - ${memberDoc.id}: ${memberData.role} (${memberData.permissions?.length || 0} permissions)`);
      });
    }

    // Check organization_memberships for creator
    if (orgData.createdBy) {
      const membershipDoc = await db
        .doc(`users/${orgData.createdBy}/organization_memberships/${orgDoc.id}`)
        .get();
      
      if (membershipDoc.exists()) {
        console.log(`   ✅ Membership document exists in users/${orgData.createdBy}/organization_memberships/${orgDoc.id}`);
      } else {
        console.log(`   ❌ Membership document MISSING in users/${orgData.createdBy}/organization_memberships/${orgDoc.id}`);
      }
    }
  }
}

checkMembers()
  .then(() => {
    console.log('\n✅ Check complete\n');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Error:', err);
    process.exit(1);
  });
