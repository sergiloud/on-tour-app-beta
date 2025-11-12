#!/usr/bin/env node

/**
 * Script para listar todos los usuarios y sus shows en Firebase
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// Load service account key
let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync('./firebase-admin-key.json', 'utf8'));
} catch (e) {
  console.error('❌ Error loading firebase-admin-key.json:', e.message);
  process.exit(1);
}

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function listUsers() {
  try {
    console.log('\n🔍 Scanning Firebase for users with shows...\n');
    console.log('='.repeat(80));
    
    const usersRef = db.collection('users');
    const usersSnapshot = await usersRef.get();
    
    if (usersSnapshot.empty) {
      console.log('❌ No users found in Firestore\n');
      return;
    }
    
    console.log(`\n✅ Found ${usersSnapshot.size} users\n`);
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      
      // Check if user has shows
      const showsRef = db.collection(`users/${userId}/shows`);
      const showsSnapshot = await showsRef.get();
      
      if (showsSnapshot.empty) {
        console.log(`📂 User: ${userId}`);
        console.log(`   Email: ${userData.email || 'N/A'}`);
        console.log(`   Shows: 0`);
        console.log('');
        continue;
      }
      
      console.log(`📂 User: ${userId}`);
      console.log(`   Email: ${userData.email || 'N/A'}`);
      console.log(`   Shows: ${showsSnapshot.size}`);
      
      // Check agency data
      let withMgmt = 0;
      let withBooking = 0;
      const sampleShow = showsSnapshot.docs[0]?.data();
      
      showsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.mgmtAgency) withMgmt++;
        if (data.bookingAgency) withBooking++;
      });
      
      console.log(`   ├─ With mgmtAgency: ${withMgmt}/${showsSnapshot.size}`);
      console.log(`   ├─ With bookingAgency: ${withBooking}/${showsSnapshot.size}`);
      
      if (sampleShow) {
        console.log(`   └─ Sample show:`);
        console.log(`      Name: ${sampleShow.name || 'Unnamed'}`);
        console.log(`      Date: ${sampleShow.date || 'N/A'}`);
        console.log(`      mgmtAgency: ${sampleShow.mgmtAgency || '❌ NOT SET'}`);
        console.log(`      bookingAgency: ${sampleShow.bookingAgency || '❌ NOT SET'}`);
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

listUsers().then(() => {
  console.log('Done!\n');
  process.exit(0);
});
