/**
 * Fix Prophecy Profile - Save to CORRECT Firestore location
 * 
 * The app reads from: users/{userId}/profile/main
 * But migration saved to: users/{userId} (root)
 * 
 * This script saves the profile to the correct location.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDCKhH8TMdoK5ioFS_ABmPsVzacKk7WDmo",
  authDomain: "on-tour-app-712e2.firebaseapp.com",
  projectId: "on-tour-app-712e2",
  storageBucket: "on-tour-app-712e2.firebasestorage.app",
  messagingSenderId: "728535007953",
  appId: "1:728535007953:web:b83c4146ebf42c177bfbf0",
};

const PROPHECY_EMAIL = 'booking@prophecyofficial.com';
const PROPHECY_PASSWORD = 'Casillas123!';
const CORRECT_ORG_ID = 'org_artist_prophecy';

async function fixProfileLocation() {
  console.log('🔧 Fixing Prophecy profile location in Firestore...\n');

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  try {
    // Sign in
    console.log(`🔐 Signing in as ${PROPHECY_EMAIL}...`);
    const userCredential = await signInWithEmailAndPassword(auth, PROPHECY_EMAIL, PROPHECY_PASSWORD);
    const user = userCredential.user;
    console.log(`✅ Signed in. UID: ${user.uid}\n`);

    // Read from root (where migration saved)
    const rootDocRef = doc(db, 'users', user.uid);
    const rootDoc = await getDoc(rootDocRef);

    console.log('📄 Root document (users/{uid}):');
    if (rootDoc.exists()) {
      console.log(JSON.stringify(rootDoc.data(), null, 2));
    } else {
      console.log('   Does not exist');
    }
    console.log('');

    // Read from correct location (where app reads)
    const profileDocRef = doc(db, `users/${user.uid}/profile/main`);
    const profileDoc = await getDoc(profileDocRef);

    console.log('📄 Profile document (users/{uid}/profile/main):');
    if (profileDoc.exists()) {
      console.log(JSON.stringify(profileDoc.data(), null, 2));
      console.log('');
      
      const currentOrgId = profileDoc.data().defaultOrgId;
      console.log(`🔍 Current defaultOrgId: ${currentOrgId}`);
      
      if (currentOrgId === CORRECT_ORG_ID) {
        console.log('✅ Already correct! No changes needed.');
        return;
      }
    } else {
      console.log('   ❌ Does not exist! Creating...');
    }
    console.log('');

    // Create/update profile in correct location
    const correctProfile = {
      name: 'Prophecy',
      email: PROPHECY_EMAIL,
      bio: 'Electronic music producer and DJ',
      defaultOrgId: CORRECT_ORG_ID,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    console.log('📝 Writing to users/{uid}/profile/main:');
    console.log(JSON.stringify(correctProfile, null, 2));
    console.log('');

    await setDoc(profileDocRef, correctProfile);
    console.log('✅ Profile saved to correct location!');

    // Also save preferences
    const prefsDocRef = doc(db, `users/${user.uid}/profile/preferences`);
    const prefsDoc = await getDoc(prefsDocRef);

    if (!prefsDoc.exists()) {
      console.log('\n📝 Creating preferences document...');
      const preferences = {
        theme: 'dark',
        language: 'en',
        currency: 'EUR',
        timezone: 'Europe/Madrid',
        notifications: true,
        emailNotifications: true,
        updatedAt: Timestamp.now()
      };
      await setDoc(prefsDocRef, preferences);
      console.log('✅ Preferences created!');
    }

    // Verify
    console.log('\n🔍 Verifying...');
    const verifyDoc = await getDoc(profileDocRef);
    if (verifyDoc.exists()) {
      const data = verifyDoc.data();
      console.log('✅ Verified!');
      console.log(`   defaultOrgId: ${data.defaultOrgId}`);
      console.log(`   name: ${data.name}`);
    } else {
      console.log('❌ Verification failed - document not found!');
    }

    console.log('\n✨ Done! Clear browser cache and login again.');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixProfileLocation();
