// Full test of agencies flow - create, save, load from Firestore
// Run with: node scripts/test-agencies-flow.mjs YOUR_EMAIL YOUR_PASSWORD

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read .env file
let firebaseConfig = null;
try {
  const envPath = join(__dirname, '..', '.env');
  const envContent = readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  const env = {};
  
  lines.forEach(line => {
    const match = line.match(/^VITE_FIREBASE_(\w+)=(.+)$/);
    if (match) {
      env[match[1]] = match[2].trim();
    }
  });
  
  firebaseConfig = {
    apiKey: env.API_KEY,
    authDomain: env.AUTH_DOMAIN,
    projectId: env.PROJECT_ID,
    storageBucket: env.STORAGE_BUCKET,
    messagingSenderId: env.MESSAGING_SENDER_ID,
    appId: env.APP_ID
  };
  
  console.log('Loaded Firebase config from .env');
} catch (error) {
  console.error('Could not read .env file:', error.message);
  console.log('Using hardcoded config...');
  
  // Fallback to hardcoded (use your actual values)
  firebaseConfig = {
    apiKey: "AIzaSyDOFKhbZ7B8gZQxwGQl8rJGy6H8l0uKbpA",
    authDomain: "on-tour-app-712e2.firebaseapp.com",
    projectId: "on-tour-app-712e2",
    storageBucket: "on-tour-app-712e2.firebasestorage.app",
    messagingSenderId: "649639976056",
    appId: "1:649639976056:web:f5e7cd43a78d38cdbb8b60"
  };
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testAgenciesFlow() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.log('Usage: node scripts/test-agencies-flow.mjs YOUR_EMAIL YOUR_PASSWORD');
    process.exit(1);
  }

  try {
    // 1. Login
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 Step 1: Logging in...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;
    console.log('✅ Logged in as:', email);
    console.log('   User ID:', userId);

    // 2. Read current state
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📖 Step 2: Reading current settings...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const settingsRef = doc(db, `users/${userId}/profile/settings`);
    let settingsSnap = await getDoc(settingsRef);
    
    if (settingsSnap.exists()) {
      const data = settingsSnap.data();
      console.log('Current state:');
      console.log('  Booking agencies:', data.bookingAgencies?.length || 0);
      console.log('  Management agencies:', data.managementAgencies?.length || 0);
      if (data.bookingAgencies?.length > 0) {
        data.bookingAgencies.forEach((a, i) => {
          console.log(`    ${i + 1}. ${a.name} - ${a.commissionPct}%`);
        });
      }
      if (data.managementAgencies?.length > 0) {
        data.managementAgencies.forEach((a, i) => {
          console.log(`    ${i + 1}. ${a.name} - ${a.commissionPct}%`);
        });
      }
    } else {
      console.log('⚠️  No settings document exists');
    }

    // 3. Create test agencies
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('➕ Step 3: Creating test agencies...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const testData = {
      bookingAgencies: [
        {
          id: `booking-test-${Date.now()}`,
          name: 'Test Booking Agency',
          type: 'booking',
          commissionPct: 15,
          territoryMode: 'worldwide',
          notes: 'Created by test script'
        }
      ],
      managementAgencies: [
        {
          id: `management-test-${Date.now()}`,
          name: 'Test Management Agency',
          type: 'management',
          commissionPct: 20,
          territoryMode: 'worldwide',
          notes: 'Created by test script'
        }
      ],
      updatedAt: new Date().toISOString()
    };

    await setDoc(settingsRef, testData, { merge: true });
    console.log('✅ Test agencies created:');
    console.log('  - 1 booking agency (15%)');
    console.log('  - 1 management agency (20%)');

    // 4. Read back to verify
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✓ Step 4: Verifying save...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    settingsSnap = await getDoc(settingsRef);
    if (settingsSnap.exists()) {
      const data = settingsSnap.data();
      console.log('✅ Successfully saved to Firestore!');
      console.log('  Booking agencies:', data.bookingAgencies?.length || 0);
      console.log('  Management agencies:', data.managementAgencies?.length || 0);
      
      if (data.bookingAgencies?.length !== 1 || data.managementAgencies?.length !== 1) {
        console.log('❌ ERROR: Expected 1 of each type!');
      }
    } else {
      console.log('❌ ERROR: Document not found after save!');
    }

    // 5. Test loading (simulate app reload)
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 Step 5: Simulating app reload...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    settingsSnap = await getDoc(settingsRef);
    if (settingsSnap.exists()) {
      const data = settingsSnap.data();
      
      // This is what the app should do
      let loadedBooking = [];
      let loadedManagement = [];
      
      if (data.bookingAgencies !== undefined) {
        loadedBooking = data.bookingAgencies;
      }
      if (data.managementAgencies !== undefined) {
        loadedManagement = data.managementAgencies;
      }
      
      console.log('✅ Loaded from Firestore:');
      console.log('  Booking agencies:', loadedBooking.length);
      console.log('  Management agencies:', loadedManagement.length);
      
      if (loadedBooking.length === 1 && loadedManagement.length === 1) {
        console.log('✅ TEST PASSED! Agencies persist correctly.');
      } else {
        console.log('❌ TEST FAILED! Agencies not loading correctly.');
      }
    }

    // 6. Cleanup
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧹 Step 6: Cleanup (optional)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Test agencies remain in Firestore.');
    console.log('To remove them, refresh the app and delete via UI.');
    console.log('Or run: node scripts/clear-agencies.mjs', email, password);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ TEST COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nNow refresh your app and check if agencies appear!');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testAgenciesFlow();
