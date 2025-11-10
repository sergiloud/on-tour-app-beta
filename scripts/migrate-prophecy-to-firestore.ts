/**
 * Prophecy Data Migration Script
 * 
 * This script imports all Prophecy data (shows, contacts, user profile, organization)
 * directly into Firestore for the user: booking@prophecyofficial.com
 * 
 * Run this script ONCE after creating the Firestore composite index.
 * 
 * Usage:
 *   npm run migrate:prophecy
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, Timestamp } from 'firebase/firestore';
import { PROPHECY_SHOWS } from '../src/lib/prophecyDataset';
import { PROPHECY_CONTACTS } from '../src/lib/prophecyContactsDataset';

// Firebase config (same as in src/lib/firebase.ts)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Prophecy user UID (from Firebase Auth)
const PROPHECY_USER_ID = 'ooaTPnc4KvSzsWQxxfqnOdLvKU92';
const PROPHECY_ORG_ID = 'org_artist_prophecy';

async function migrateAllData() {
  console.log('🚀 Starting Prophecy data migration to Firestore...\n');

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  try {
    // 1. Create user profile
    console.log('📝 Creating user profile...');
    const userProfileRef = doc(db, `users/${PROPHECY_USER_ID}`);
    await setDoc(userProfileRef, {
      profile: {
        name: 'Prophecy',
        email: 'booking@prophecyofficial.com',
        defaultOrgId: PROPHECY_ORG_ID,
        bio: 'Electronic music producer and DJ',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      preferences: {
        theme: 'dark',
        language: 'en',
        currency: 'EUR',
        timezone: 'Europe/Madrid'
      }
    });
    console.log('✅ User profile created\n');

    // 2. Create organization
    console.log('🏢 Creating organization...');
    const orgRef = doc(db, `users/${PROPHECY_USER_ID}/organizations/${PROPHECY_ORG_ID}`);
    await setDoc(orgRef, {
      id: PROPHECY_ORG_ID,
      name: 'Prophecy',
      type: 'artist',
      ownerId: PROPHECY_USER_ID,
      members: [
        {
          userId: PROPHECY_USER_ID,
          role: 'owner',
          email: 'booking@prophecyofficial.com',
          addedAt: Timestamp.now()
        }
      ],
      settings: {
        branding: {
          logoUrl: '',
          color: '#6366f1',
          shortBio: 'Electronic music producer and DJ'
        },
        defaults: {
          currency: 'EUR',
          timezone: 'Europe/Madrid'
        }
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    console.log('✅ Organization created\n');

    // 3. Import shows
    console.log(`🎵 Importing ${PROPHECY_SHOWS.length} shows...`);
    let showCount = 0;
    for (const show of PROPHECY_SHOWS) {
      try {
        const showRef = doc(db, `users/${PROPHECY_USER_ID}/shows/${show.id}`);
        await setDoc(showRef, {
          ...show,
          userId: PROPHECY_USER_ID,
          tenantId: PROPHECY_ORG_ID,
          __modifiedBy: PROPHECY_USER_ID,
          __modifiedAt: new Date(show.date).getTime(),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        showCount++;
        if (showCount % 10 === 0) {
          console.log(`  ⏳ Imported ${showCount}/${PROPHECY_SHOWS.length} shows...`);
        }
      } catch (error) {
        console.error(`  ❌ Failed to import show ${show.id}:`, error);
      }
    }
    console.log(`✅ Imported ${showCount}/${PROPHECY_SHOWS.length} shows\n`);

    // 4. Import contacts
    console.log(`👥 Importing ${PROPHECY_CONTACTS.length} contacts...`);
    let contactCount = 0;
    for (let i = 0; i < PROPHECY_CONTACTS.length; i++) {
      try {
        const contact = PROPHECY_CONTACTS[i];
        const contactId = `prophecy-contact-${i + 1}`;
        const contactRef = doc(db, `users/${PROPHECY_USER_ID}/contacts/${contactId}`);
        
        await setDoc(contactRef, {
          ...contact,
          id: contactId,
          tenantId: PROPHECY_ORG_ID,
          createdAt: Timestamp.fromDate(new Date(contact.createdAt)),
          updatedAt: Timestamp.fromDate(new Date(contact.updatedAt)),
          lastContactedAt: contact.lastContactedAt ? Timestamp.fromDate(new Date(contact.lastContactedAt)) : null
        });
        contactCount++;
        if (contactCount % 100 === 0) {
          console.log(`  ⏳ Imported ${contactCount}/${PROPHECY_CONTACTS.length} contacts...`);
        }
      } catch (error) {
        console.error(`  ❌ Failed to import contact ${i + 1}:`, error);
      }
    }
    console.log(`✅ Imported ${contactCount}/${PROPHECY_CONTACTS.length} contacts\n`);

    // Summary
    console.log('🎉 Migration complete!\n');
    console.log('Summary:');
    console.log(`  ✅ User profile: 1/1`);
    console.log(`  ✅ Organization: 1/1`);
    console.log(`  ✅ Shows: ${showCount}/${PROPHECY_SHOWS.length}`);
    console.log(`  ✅ Contacts: ${contactCount}/${PROPHECY_CONTACTS.length}`);
    console.log('\nYou can now login with booking@prophecyofficial.com');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateAllData()
  .then(() => {
    console.log('\n✅ Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
  });
