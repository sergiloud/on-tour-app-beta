import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBBnB2ZIwbMl6cNOJpCU-vBWNqUy8DIHXE",
  authDomain: "on-tour-app-712e2.firebaseapp.com",
  projectId: "on-tour-app-712e2",
  storageBucket: "on-tour-app-712e2.firebasestorage.app",
  messagingSenderId: "439166297619",
  appId: "1:439166297619:web:d49c3c90ca99deb12c7a3e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('Checking activities collection...');

const q = query(collection(db, 'activities'));
const snapshot = await getDocs(q);

console.log(`Found ${snapshot.docs.length} activities`);

snapshot.docs.slice(0, 5).forEach(doc => {
  const data = doc.data();
  console.log('\nActivity:', doc.id);
  console.log('  organizationId:', data.organizationId);
  console.log('  type:', data.type);
  console.log('  title:', data.title);
  console.log('  timestamp:', data.timestamp);
  console.log('  Full data:', JSON.stringify(data, null, 2));
});

process.exit(0);
