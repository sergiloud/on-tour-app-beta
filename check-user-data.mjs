import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./firebase-admin-key.json', 'utf8'));

const firebaseConfig = {
  apiKey: "AIzaSyA7YN8wt_yhCJb9pRzOMJGAuThxA-_aXyg",
  authDomain: "on-tour-app-712e2.firebaseapp.com",
  projectId: "on-tour-app-712e2",
  storageBucket: "on-tour-app-712e2.firebasestorage.app",
  messagingSenderId: "460476814848",
  appId: "1:460476814848:web:cd52d50b1d8cc7e4bc2db6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const userId = 'ooaTPnc4KvSzsWQxxfqnOdLvKU92';

console.log('🔍 Checking Firestore data for user:', userId);

// Check legacy shows path
try {
  const legacyShowsRef = collection(db, `users/${userId}/shows`);
  const legacySnapshot = await getDocs(legacyShowsRef);
  console.log(`\n📦 Legacy shows (users/${userId}/shows):`, legacySnapshot.size);
  legacySnapshot.docs.forEach(doc => {
    const data = doc.data();
    console.log(`  - ${doc.id}: ${data.city}, ${data.country} (${data.date})`);
  });
} catch (error) {
  console.log('❌ Error reading legacy shows:', error.message);
}

// Check organizations
try {
  const orgsRef = collection(db, `users/${userId}/organizations`);
  const orgsSnapshot = await getDocs(orgsRef);
  console.log(`\n🏢 Organizations:`, orgsSnapshot.size);
  
  for (const orgDoc of orgsSnapshot.docs) {
    const orgData = orgDoc.data();
    console.log(`\n  Organization: ${orgDoc.id}`);
    console.log(`    Name: ${orgData.name}`);
    
    // Check shows in this org
    const orgShowsRef = collection(db, `users/${userId}/organizations/${orgDoc.id}/shows`);
    const orgShowsSnapshot = await getDocs(orgShowsRef);
    console.log(`    Shows: ${orgShowsSnapshot.size}`);
    orgShowsSnapshot.docs.forEach(showDoc => {
      const showData = showDoc.data();
      console.log(`      - ${showDoc.id}: ${showData.city}, ${showData.country}`);
    });
  }
} catch (error) {
  console.log('❌ Error reading organizations:', error.message);
}

process.exit(0);
