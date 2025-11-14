import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./firebase-admin-key.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const userId = 'ooaTPnc4KvSzsWQxxfqnOdLvKU92';

console.log('🔍 Checking Firestore data for user:', userId);

// Check legacy shows path
try {
  const legacyShowsRef = db.collection(`users/${userId}/shows`);
  const legacySnapshot = await legacyShowsRef.get();
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
  const orgsRef = db.collection(`users/${userId}/organizations`);
  const orgsSnapshot = await orgsRef.get();
  console.log(`\n🏢 Organizations:`, orgsSnapshot.size);
  
  for (const orgDoc of orgsSnapshot.docs) {
    const orgData = orgDoc.data();
    console.log(`\n  Organization: ${orgDoc.id}`);
    console.log(`    Name: ${orgData.name}`);
    
    // Check shows in this org
    const orgShowsRef = db.collection(`users/${userId}/organizations/${orgDoc.id}/shows`);
    const orgShowsSnapshot = await orgShowsRef.get();
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
