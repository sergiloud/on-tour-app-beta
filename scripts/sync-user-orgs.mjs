#!/usr/bin/env node
/**
 * Sync User Organizations to Firestore
 * 
 * Creates organization documents and member records in Firestore
 * based on the user's actual data.
 * 
 * Run: node scripts/sync-user-orgs.mjs <userId> <email>
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync('./firebase-admin-key.json', 'utf8')
);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// Owner permissions
const OWNER_PERMISSIONS = [
  'finance.read', 'finance.write', 'finance.delete', 'finance.export',
  'shows.read', 'shows.write', 'shows.delete',
  'calendar.read', 'calendar.write', 'calendar.delete',
  'travel.read', 'travel.write', 'travel.delete', 'travel.book',
  'contacts.read', 'contacts.write', 'contacts.delete',
  'contracts.read', 'contracts.write', 'contracts.delete',
  'members.manage_roles', 'members.invite', 'members.remove',
  'settings.manage',
];

async function syncUserOrganizations() {
  const userId = process.argv[2];
  const userEmail = process.argv[3];

  if (!userId || !userEmail) {
    console.log('\n❌ Usage: node scripts/sync-user-orgs.mjs <userId> <email>');
    console.log('\nExample: node scripts/sync-user-orgs.mjs ooaTPnc4KvSzsWQxxfqnOdLvKU92 user@example.com\n');
    process.exit(1);
  }

  console.log('\n🔄 Syncing User Organizations to Firestore...\n');
  console.log(`User ID: ${userId}`);
  console.log(`Email: ${userEmail}\n`);

  try {
    // Check if user document exists
    const userRef = db.doc(`users/${userId}`);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log('⚠️  Creating user document...');
      await userRef.set({
        email: userEmail,
        displayName: userEmail.split('@')[0],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      console.log('✅ User document created\n');
    } else {
      console.log('✓ User document exists\n');
    }

    // Organization to create
    const org = {
      id: 'org_artist_prophecy',
      name: 'The Prophecy',
      type: 'artist',
      settings: {
        currency: 'EUR',
        timezone: 'Europe/Madrid',
        language: 'es',
      },
    };

    console.log(`📁 Creating organization: ${org.name}`);

    // Create organization document
    const orgRef = db.doc(`organizations/${org.id}`);
    const orgDoc = await orgRef.get();

    if (!orgDoc.exists) {
      await orgRef.set({
        name: org.name,
        type: org.type,
        createdBy: userId,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        settings: org.settings,
        metadata: {
          seatLimit: 10,
          guestLimit: 5,
        },
      });
      console.log(`   ✅ Organization created`);
    } else {
      console.log(`   ℹ️  Organization already exists`);
    }

    // Create member document (owner)
    const memberRef = orgRef.collection('members').doc(userId);
    const memberDoc = await memberRef.get();

    if (!memberDoc.exists) {
      await memberRef.set({
        userId,
        email: userEmail,
        displayName: userEmail.split('@')[0],
        role: 'owner',
        permissions: OWNER_PERMISSIONS,
        joinedAt: FieldValue.serverTimestamp(),
        status: 'active',
        invitedBy: userId,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      console.log(`   ✅ Owner member created`);
    } else {
      console.log(`   ℹ️  Member already exists`);
    }

    // Create organization membership cache for user
    const membershipRef = db.doc(`users/${userId}/organization_memberships/${org.id}`);
    const membershipDoc = await membershipRef.get();

    if (!membershipDoc.exists) {
      await membershipRef.set({
        orgId: org.id,
        orgName: org.name,
        role: 'owner',
        joinedAt: FieldValue.serverTimestamp(),
        status: 'active',
      });
      console.log(`   ✅ Membership cache created`);
    } else {
      console.log(`   ℹ️  Membership cache already exists`);
    }

    console.log(`\n✅ Organization synced successfully!`);
    console.log(`\n📋 Summary:`);
    console.log(`   User: ${userEmail} (${userId})`);
    console.log(`   Organization: ${org.name} (${org.id})`);
    console.log(`   Role: owner`);
    console.log(`\n🔄 Please reload your browser to see the changes.\n`);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the sync
syncUserOrganizations();
