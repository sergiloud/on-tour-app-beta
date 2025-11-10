/**
 * Fix Prophecy User Profile - Set correct defaultOrgId
 * 
 * The user booking@prophecyofficial.com should have:
 * - defaultOrgId: org_artist_prophecy (NOT org_agency_shalizi_group)
 * 
 * This fixes the issue where shows aren't appearing because
 * the orgId filter was using the wrong organization.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

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

async function fixProphecyOrg() {
  console.log('🔧 Fixing Prophecy user profile organization...\n');

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  try {
    // Sign in
    console.log(`🔐 Signing in as ${PROPHECY_EMAIL}...`);
    const userCredential = await signInWithEmailAndPassword(auth, PROPHECY_EMAIL, PROPHECY_PASSWORD);
    const user = userCredential.user;
    console.log(`✅ Signed in successfully. UID: ${user.uid}\n`);

    // Get current profile
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.error('❌ User profile not found in Firestore!');
      process.exit(1);
    }

    const currentData = userDoc.data();
    console.log('📄 Current profile data:');
    console.log(JSON.stringify(currentData, null, 2));
    console.log('');

    const currentOrgId = currentData.profile?.defaultOrgId;
    console.log(`🔍 Current defaultOrgId: ${currentOrgId}`);
    console.log(`🎯 Correct defaultOrgId: ${CORRECT_ORG_ID}`);

    if (currentOrgId === CORRECT_ORG_ID) {
      console.log('\n✅ Organization ID is already correct! No changes needed.');
      process.exit(0);
    }

    // Update profile
    console.log(`\n📝 Updating defaultOrgId to ${CORRECT_ORG_ID}...`);
    await updateDoc(userDocRef, {
      'profile.defaultOrgId': CORRECT_ORG_ID
    });

    console.log('✅ Profile updated successfully!');

    // Verify update
    const updatedDoc = await getDoc(userDocRef);
    const updatedData = updatedDoc.data();
    console.log('\n📄 Updated profile data:');
    console.log(JSON.stringify(updatedData, null, 2));

    console.log('\n✨ Done! Now login again and shows should appear.');
    console.log('   Clear browser cache if needed.');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixProphecyOrg();
