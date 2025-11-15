import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from 'firestore';
import * as dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkActivities() {
  console.log('🔍 Checking activities collection...\n');

  try {
    // Query 1: ALL documents (no filter)
    console.log('Query 1: ALL activities (no organizationId filter)');
    const allSnapshot = await getDocs(collection(db, 'activities'));
    console.log(`Total documents: ${allSnapshot.size}\n`);

    if (allSnapshot.empty) {
      console.log('❌ Collection is empty!');
      return;
    }

    // Show first few documents
    console.log('Sample documents:');
    allSnapshot.docs.slice(0, 3).forEach((doc, i) => {
      const data = doc.data();
      console.log(`\n[${i + 1}] ID: ${doc.id}`);
      console.log(`    organizationId: ${data.organizationId || 'MISSING ❌'}`);
      console.log(`    module: ${data.module}`);
      console.log(`    action: ${data.action}`);
      console.log(`    title: ${data.title}`);
      console.log(`    timestamp: ${data.timestamp?.toDate?.() || data.timestamp}`);
    });

    // Query 2: WITH organizationId filter
    console.log('\n\nQuery 2: With organizationId filter');
    const orgIds = new Set();
    allSnapshot.docs.forEach(doc => {
      const orgId = doc.data().organizationId;
      if (orgId) orgIds.add(orgId);
    });

    console.log(`\nFound ${orgIds.size} unique organizationIds:`);
    orgIds.forEach(id => console.log(`  - ${id}`));

    if (orgIds.size > 0) {
      const firstOrgId = Array.from(orgIds)[0];
      console.log(`\nTesting query with orgId: ${firstOrgId}`);
      
      const q = query(
        collection(db, 'activities'),
        where('organizationId', '==', firstOrgId),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      
      const orgSnapshot = await getDocs(q);
      console.log(`✅ Query returned: ${orgSnapshot.size} documents`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error(`Code: ${error.code}`);
    }
  } finally {
    process.exit(0);
  }
}

checkActivities();
