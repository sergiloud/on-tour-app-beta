/**
 * Debug Prophecy User Profile
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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

async function debugProfile() {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  try {
    const userCredential = await signInWithEmailAndPassword(auth, PROPHECY_EMAIL, PROPHECY_PASSWORD);
    const user = userCredential.user;
    
    console.log('✅ UID:', user.uid);
    console.log('📧 Email:', user.email);
    console.log('');

    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.error('❌ User document does NOT exist in Firestore!');
      process.exit(1);
    }

    const userData = userDoc.data();
    console.log('📄 Full userData:');
    console.log(JSON.stringify(userData, null, 2));
    console.log('');
    
    console.log('🔍 userData.profile:', userData.profile);
    console.log('🔍 userData.profile?.defaultOrgId:', userData.profile?.defaultOrgId);
    console.log('');
    
    // Simulate what Login.tsx does
    let userProfile = null;
    if (userData) {
      userProfile = userData.profile;
    }
    
    const defaultOrg = 'org_agency_shalizi_group'; // fallback
    const finalOrgId = userProfile?.defaultOrgId || defaultOrg;
    
    console.log('🎯 What Login.tsx will use:');
    console.log('   userProfile:', userProfile);
    console.log('   userProfile?.defaultOrgId:', userProfile?.defaultOrgId);
    console.log('   finalOrgId:', finalOrgId);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugProfile();
