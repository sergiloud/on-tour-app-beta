#!/usr/bin/env node
/**
 * Fix Organization Members
 * 
 * This script ensures that member documents exist in organizations/{orgId}/members/{userId}
 * for all users who have organization_memberships cached.
 * 
 * Run: node scripts/fix-org-members.mjs
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

// Default permissions for each role
const ROLE_PERMISSIONS = {
  owner: [
    'finance.read', 'finance.write', 'finance.delete', 'finance.export',
    'shows.read', 'shows.write', 'shows.delete',
    'calendar.read', 'calendar.write', 'calendar.delete',
    'travel.read', 'travel.write', 'travel.delete', 'travel.book',
    'contacts.read', 'contacts.write', 'contacts.delete',
    'contracts.read', 'contracts.write', 'contracts.delete',
    'members.manage_roles', 'members.invite', 'members.remove',
    'settings.manage',
  ],
  admin: [
    'finance.read', 'finance.write', 'finance.export',
    'shows.read', 'shows.write', 'shows.delete',
    'calendar.read', 'calendar.write', 'calendar.delete',
    'travel.read', 'travel.write', 'travel.book',
    'contacts.read', 'contacts.write', 'contacts.delete',
    'contracts.read', 'contracts.write', 'contracts.delete',
    'members.invite',
  ],
  member: [
    'finance.read',
    'shows.read', 'shows.write',
    'calendar.read', 'calendar.write',
    'travel.read',
    'contacts.read', 'contacts.write',
    'contracts.read',
  ],
  finance: [
    'finance.read', 'finance.write', 'finance.export',
    'shows.read',
    'calendar.read',
    'travel.read',
    'contacts.read',
    'contracts.read',
  ],
  viewer: [
    'finance.read',
    'shows.read',
    'calendar.read',
    'travel.read',
    'contacts.read',
    'contracts.read',
  ],
};

async function fixOrganizationMembers() {
  console.log('\n🔧 Fixing Organization Member Documents...\n');

  try {
    // Get all users
    const usersSnapshot = await db.collection('users').get();
    
    let totalFixed = 0;
    let totalChecked = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      
      console.log(`\n👤 Checking user: ${userData.email || userId}`);

      // Get user's organization memberships
      const membershipsSnapshot = await db
        .collection(`users/${userId}/organization_memberships`)
        .get();

      if (membershipsSnapshot.empty) {
        console.log('   ℹ️  No organization memberships');
        continue;
      }

      for (const membershipDoc of membershipsSnapshot.docs) {
        totalChecked++;
        const orgId = membershipDoc.id;
        const membershipData = membershipDoc.data();
        
        console.log(`   📁 Org: ${orgId} (role: ${membershipData.role})`);

        // Check if member document exists in organization
        const memberDocRef = db.doc(`organizations/${orgId}/members/${userId}`);
        const memberDoc = await memberDocRef.get();

        if (!memberDoc.exists) {
          console.log(`   ⚠️  Member document missing - creating...`);

          // Create member document
          const memberData = {
            userId,
            email: userData.email,
            displayName: userData.displayName || userData.email,
            role: membershipData.role || 'member',
            permissions: ROLE_PERMISSIONS[membershipData.role || 'member'] || ROLE_PERMISSIONS.member,
            joinedAt: membershipData.joinedAt || FieldValue.serverTimestamp(),
            status: 'active',
            invitedBy: membershipData.invitedBy || userId,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          };

          await memberDocRef.set(memberData);
          console.log(`   ✅ Created member document`);
          totalFixed++;
        } else {
          console.log(`   ✓ Member document exists`);
        }
      }
    }

    console.log(`\n✅ Complete!`);
    console.log(`   Checked: ${totalChecked} memberships`);
    console.log(`   Fixed: ${totalFixed} missing member documents`);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the fix
fixOrganizationMembers();
