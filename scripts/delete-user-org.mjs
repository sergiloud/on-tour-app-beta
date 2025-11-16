#!/usr/bin/env node

/**
 * Delete user's organization membership
 * User should not belong to any organization
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

const USER_ID = 'ooaTPnc4KvSzsWQxxfqnOdLvKU92';
const ORG_ID = 'org_artist_prophecy';

async function deleteUserOrganization() {
  console.log(`\n🗑️  Removing user from organization...\n`);
  console.log('='.repeat(60));
  
  try {
    // 1. Delete membership cache from user
    const membershipRef = db.doc(`users/${USER_ID}/organization_memberships/${ORG_ID}`);
    const membershipSnap = await membershipRef.get();
    
    if (membershipSnap.exists) {
      await membershipRef.delete();
      console.log(`✅ Deleted membership cache: users/${USER_ID}/organization_memberships/${ORG_ID}`);
    } else {
      console.log(`⚠️  Membership cache doesn't exist`);
    }
    
    // 2. Delete member document from organization
    const memberRef = db.doc(`organizations/${ORG_ID}/members/${USER_ID}`);
    const memberSnap = await memberRef.get();
    
    if (memberSnap.exists) {
      await memberRef.delete();
      console.log(`✅ Deleted member document: organizations/${ORG_ID}/members/${USER_ID}`);
    } else {
      console.log(`⚠️  Member document doesn't exist`);
    }
    
    // 3. Check if organization has any other members
    const membersSnapshot = await db.collection(`organizations/${ORG_ID}/members`).get();
    
    if (membersSnapshot.empty) {
      console.log(`\n🗑️  Organization has no members, deleting organization...`);
      await db.doc(`organizations/${ORG_ID}`).delete();
      console.log(`✅ Deleted organization: ${ORG_ID}`);
    } else {
      console.log(`\n⚠️  Organization still has ${membersSnapshot.size} member(s), keeping it`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ User removed from organization\n');
    console.log('The user now has no organization memberships.');
    console.log('The organization selector should show "Create Organization" button.\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

deleteUserOrganization();
