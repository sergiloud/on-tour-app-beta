// Test script to check if agencies are being saved to Firestore
// Run with: node scripts/check-firestore-agencies.mjs

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDOFKhbZ7B8gZQxwGQl8rJGy6H8l0uKbpA",
  authDomain: "on-tour-app-712e2.firebaseapp.com",
  projectId: "on-tour-app-712e2",
  storageBucket: "on-tour-app-712e2.firebasestorage.app",
  messagingSenderId: "649639976056",
  appId: "1:649639976056:web:f5e7cd43a78d38cdbb8b60"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function checkAgencies() {
  try {
    // Get current user
    const user = auth.currentUser;
    
    if (!user) {
      console.log('❌ No user logged in');
      console.log('Please provide email and password as arguments:');
      console.log('node scripts/check-firestore-agencies.mjs your@email.com yourpassword');
      
      // Try to login if credentials provided
      const email = process.argv[2];
      const password = process.argv[3];
      
      if (email && password) {
        console.log(`\nAttempting login with ${email}...`);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('✅ Login successful!');
        console.log('User ID:', userCredential.user.uid);
        await checkUserSettings(userCredential.user.uid);
      }
      return;
    }
    
    console.log('✅ User logged in:', user.uid);
    await checkUserSettings(user.uid);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function checkUserSettings(userId) {
  try {
    // Check settings document
    const settingsRef = doc(db, `users/${userId}/profile/settings`);
    console.log(`\nChecking: users/${userId}/profile/settings`);
    
    const settingsSnap = await getDoc(settingsRef);
    
    if (!settingsSnap.exists()) {
      console.log('❌ No settings document found');
      console.log('\nTrying to create a test agency...');
      await createTestAgency(userId);
      return;
    }
    
    const data = settingsSnap.data();
    console.log('\n✅ Settings document found!');
    console.log('\nDocument data:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.bookingAgencies) {
      console.log(`\n✅ Booking agencies: ${data.bookingAgencies.length}`);
      data.bookingAgencies.forEach((agency, i) => {
        console.log(`  ${i + 1}. ${agency.name} - ${agency.commissionPct}% (${agency.territoryMode})`);
      });
    } else {
      console.log('\n⚠️  No booking agencies found');
    }
    
    if (data.managementAgencies) {
      console.log(`\n✅ Management agencies: ${data.managementAgencies.length}`);
      data.managementAgencies.forEach((agency, i) => {
        console.log(`  ${i + 1}. ${agency.name} - ${agency.commissionPct}%`);
      });
    } else {
      console.log('\n⚠️  No management agencies found');
    }
    
  } catch (error) {
    console.error('❌ Error reading settings:', error);
  }
}

async function createTestAgency(userId) {
  try {
    const testData = {
      bookingAgencies: [
        {
          id: `test-booking-${Date.now()}`,
          name: 'Test Booking Agency (Created by script)',
          type: 'booking',
          commissionPct: 15,
          territoryMode: 'worldwide',
          notes: 'Created by check-firestore-agencies.mjs'
        }
      ],
      managementAgencies: [],
      updatedAt: new Date().toISOString()
    };
    
    const settingsRef = doc(db, `users/${userId}/profile/settings`);
    await setDoc(settingsRef, testData, { merge: true });
    
    console.log('✅ Test agency created!');
    console.log('\nNow try reading it again...');
    
    await checkUserSettings(userId);
  } catch (error) {
    console.error('❌ Error creating test agency:', error);
  }
}

// Run the check
checkAgencies();
