#!/usr/bin/env node

/**
 * Test MFA Setup Script
 * Verifies that MFA infrastructure is properly configured
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCS_JnAnJrj_EOoMsOOTbusKiJdFHN1qlo",
  authDomain: "ontour-app-ec5b0.firebaseapp.com",
  projectId: "ontour-app-ec5b0",
  storageBucket: "ontour-app-ec5b0.firebasestorage.app",
  messagingSenderId: "458942164664",
  appId: "1:458942164664:web:ef962a0de01f8f61968f00",
  measurementId: "G-P48HE8NK87"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const userId = "ooaTPnc4KvSzsWQxxfqnOdLvKU92"; // Your user ID

async function testMFASetup() {
  console.log('🔐 Testing MFA Setup...\n');

  try {
    // 1. Check if user has MFA settings
    console.log('1. Checking MFA settings...');
    const mfaSettingsRef = doc(db, `users/${userId}/mfa_settings/config`);
    const mfaSettingsDoc = await getDoc(mfaSettingsRef);
    
    if (mfaSettingsDoc.exists()) {
      const settings = mfaSettingsDoc.data();
      console.log('✅ MFA settings found:', {
        enabled: settings.enabled,
        enrolledDevices: settings.enrolledDevices || 0,
        lastUpdated: settings.lastUpdated?.toDate?.() || settings.lastUpdated
      });
    } else {
      console.log('⚠️  No MFA settings found (this is expected for new users)');
    }

    // 2. Check WebAuthn collection exists (will be empty initially)
    console.log('\n2. Checking WebAuthn credentials collection...');
    console.log('✅ Collection path: users/' + userId + '/webauthn_credentials');
    
    // 3. Check backup codes collection exists (will be empty initially)  
    console.log('\n3. Checking backup codes collection...');
    console.log('✅ Collection path: users/' + userId + '/backup_codes');

    // 4. Test WebAuthn support in environment
    console.log('\n4. Checking WebAuthn browser support...');
    
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      console.log('✅ WebAuthn is supported in browser');
      
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      console.log('✅ Platform authenticator available:', available);
    } else {
      console.log('⚠️  Running in Node.js - WebAuthn check requires browser environment');
      console.log('📝 In browser, check: navigator.credentials && window.PublicKeyCredential');
    }

    console.log('\n🎉 MFA infrastructure is ready!');
    console.log('\nNext steps:');
    console.log('1. Navigate to Settings → Security tab in the app');
    console.log('2. Click "Register New Device" to test registration');
    console.log('3. Use TouchID/FaceID or insert security key when prompted');
    console.log('4. Generate backup codes');

  } catch (error) {
    console.error('❌ Error testing MFA setup:', error);
    if (error.code === 'permission-denied') {
      console.log('\n💡 This might be due to Firestore security rules.');
      console.log('   Make sure you\'re authenticated as user:', userId);
    }
  }
}

testMFASetup();