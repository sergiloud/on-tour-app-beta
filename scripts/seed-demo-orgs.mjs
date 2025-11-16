#!/usr/bin/env node
/**
 * Seed Demo Organizations
 * 
 * Creates demo organizations in Firestore for development/testing
 * 
 * Run: node scripts/seed-demo-orgs.mjs
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

// Demo user ID (from the logs)
const DEMO_USER_ID = 'ooaTPnc4KvSzsWQxxfqnOdLvKU92';
const DEMO_EMAIL = 'demo@ontourapp.com'; // Update if needed

// Demo organization IDs
const ORG_ARTIST_PROPHECY = 'org_artist_prophecy';
const ORG_AGENCY_SHALIZI = 'org_agency_shalizi';

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

async function seedDemoOrganizations() {
  console.log('\n🌱 Seeding Demo Organizations...\n');

  try {
    // Check if user exists
    const userRef = db.doc(`users/${DEMO_USER_ID}`);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log('⚠️  Creating demo user document...');
      await userRef.set({
        email: DEMO_EMAIL,
        displayName: 'Demo User',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    const userData = (await userRef.get()).data();
    const userEmail = userData?.email || DEMO_EMAIL;

    // Demo organizations data
    const demoOrgs = [
      {
        id: ORG_ARTIST_PROPHECY,
        name: 'The Prophecy (Demo)',
        type: 'artist',
        seatLimit: 10,
        guestLimit: 5,
        settings: {
          currency: 'EUR',
          timezone: 'Europe/Madrid',
          language: 'es',
        },
      },
      {
        id: ORG_AGENCY_SHALIZI,
        name: 'Shalizi Agency (Demo)',
        type: 'agency',
        seatLimit: 50,
        guestLimit: 20,
        settings: {
          currency: 'USD',
          timezone: 'America/Los_Angeles',
          language: 'en',
        },
      },
    ];

    for (const org of demoOrgs) {
      console.log(`\n📁 Creating organization: ${org.name}`);

      // Create organization document
      const orgRef = db.doc(`organizations/${org.id}`);
      const orgDoc = await orgRef.get();

      if (!orgDoc.exists) {
        await orgRef.set({
          name: org.name,
          type: org.type,
          createdBy: DEMO_USER_ID,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          settings: org.settings,
          metadata: {
            isDemo: true,
            seatLimit: org.seatLimit,
            guestLimit: org.guestLimit,
          },
        });
        console.log(`   ✅ Organization created`);
      } else {
        console.log(`   ℹ️  Organization already exists`);
      }

      // Create member document (owner)
      const memberRef = orgRef.collection('members').doc(DEMO_USER_ID);
      const memberDoc = await memberRef.get();

      if (!memberDoc.exists) {
        await memberRef.set({
          userId: DEMO_USER_ID,
          email: userEmail,
          displayName: userData?.displayName || 'Demo User',
          role: 'owner',
          permissions: OWNER_PERMISSIONS,
          joinedAt: FieldValue.serverTimestamp(),
          status: 'active',
          invitedBy: DEMO_USER_ID,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
        console.log(`   ✅ Owner member created`);
      } else {
        console.log(`   ℹ️  Member already exists`);
      }

      // Create organization membership cache for user
      const membershipRef = db.doc(`users/${DEMO_USER_ID}/organization_memberships/${org.id}`);
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
    }

    console.log(`\n✅ Demo organizations seeded successfully!`);
    console.log(`\n📋 Summary:`);
    console.log(`   User: ${userEmail} (${DEMO_USER_ID})`);
    console.log(`   Organizations: ${demoOrgs.length}`);
    console.log(`   - ${demoOrgs.map(o => o.name).join('\n   - ')}`);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the seeder
seedDemoOrganizations();
