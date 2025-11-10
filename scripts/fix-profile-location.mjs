/**
 * Fix Prophecy Profile Location
 * 
 * The app reads from users/{uid}/profile/main
 * But the migration script wrote to users/{uid}
 * 
 * This script copies the data to the correct location.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';

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

async function fixProfileLocation() {
  console.log('🔧 Fixing Prophecy profile location in Firestore...\n');

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  try {
    console.log(`🔐 Signing in as ${PROPHECY_EMAIL}...`);
    const userCredential = await signInWithEmailAndPassword(auth, PROPHECY_EMAIL, PROPHECY_PASSWORD);
    const user = userCredential.user;
    console.log(`✅ Signed in. UID: ${user.uid}\n`);

    // Write profile to the CORRECT location: users/{uid}/profile/main
    console.log('📝 Writing profile to users/{uid}/profile/main...');
    const profileRef = doc(db, `users/${user.uid}/profile/main`);
    await setDoc(profileRef, {
      name: 'Prophecy',
      email: 'booking@prophecyofficial.com',
      defaultOrgId: 'org_artist_prophecy', // ✅ CORRECT ORG
      bio: 'Electronic music producer and DJ',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    console.log('✅ Profile saved to correct location!\n');

    // Write preferences to users/{uid}/preferences/main
    console.log('📝 Writing preferences to users/{uid}/preferences/main...');
    const preferencesRef = doc(db, `users/${user.uid}/preferences/main`);
    await setDoc(preferencesRef, {
      theme: 'dark',
      language: 'en',
      currency: 'EUR',
      timezone: 'Europe/Madrid',
      notifications: true,
      updatedAt: Timestamp.now()
    });
    console.log('✅ Preferences saved!\n');

    console.log('✨ Done! Now the app will read from the correct location.');
    console.log('   defaultOrgId is set to: org_artist_prophecy');
    console.log('   Login again and shows should appear!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixProfileLocation();
