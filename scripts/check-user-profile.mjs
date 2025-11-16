#!/usr/bin/env node

/**
 * Check user profile data in Firestore
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

async function checkUserProfile() {
  console.log(`\n🔍 Checking profile for user: ${USER_ID}\n`);
  console.log('='.repeat(60));
  
  try {
    // Check user document
    const userDoc = await db.doc(`users/${USER_ID}`).get();
    
    if (userDoc.exists) {
      console.log('\n📄 User Document:');
      console.log(JSON.stringify(userDoc.data(), null, 2));
    } else {
      console.log('\n❌ User document does not exist');
    }
    
    // Check profile subcollection
    const profileDoc = await db.doc(`users/${USER_ID}/profile/main`).get();
    
    if (profileDoc.exists) {
      console.log('\n👤 Profile Document (users/{userId}/profile/main):');
      console.log(JSON.stringify(profileDoc.data(), null, 2));
    } else {
      console.log('\n❌ Profile document does not exist');
    }
    
    // Check preferences
    const prefsDoc = await db.doc(`users/${USER_ID}/preferences/main`).get();
    
    if (prefsDoc.exists) {
      console.log('\n⚙️  Preferences Document:');
      console.log(JSON.stringify(prefsDoc.data(), null, 2));
    } else {
      console.log('\n❌ Preferences document does not exist');
    }
    
    console.log('\n' + '='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

checkUserProfile();
