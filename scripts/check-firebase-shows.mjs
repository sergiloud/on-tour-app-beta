#!/usr/bin/env node

/**
 * Script para verificar si los shows en Firebase tienen mgmtAgency y bookingAgency
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

async function checkShows() {
  try {
    // Get demo user ID (adjust if needed)
    const userId = 'demo-user'; // or get from args
    
    console.log(`\n🔍 Checking shows for user: ${userId}\n`);
    console.log('='.repeat(80));
    
    const showsRef = db.collection(`users/${userId}/shows`);
    const snapshot = await showsRef.get();
    
    if (snapshot.empty) {
      console.log('❌ No shows found in Firestore\n');
      return;
    }
    
    console.log(`\n✅ Found ${snapshot.size} shows\n`);
    
    let withMgmt = 0;
    let withBooking = 0;
    let withBoth = 0;
    let withNeither = 0;
    
    const showsSample = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const hasMgmt = !!data.mgmtAgency;
      const hasBooking = !!data.bookingAgency;
      
      if (hasMgmt) withMgmt++;
      if (hasBooking) withBooking++;
      if (hasMgmt && hasBooking) withBoth++;
      if (!hasMgmt && !hasBooking) withNeither++;
      
      // Collect first 5 shows for detailed view
      if (showsSample.length < 5) {
        showsSample.push({
          id: doc.id,
          name: data.name || 'Unnamed',
          city: data.city || 'Unknown',
          date: data.date || 'No date',
          fee: data.fee || 0,
          status: data.status || 'unknown',
          mgmtAgency: data.mgmtAgency || null,
          bookingAgency: data.bookingAgency || null,
          hasMgmt,
          hasBooking
        });
      }
    });
    
    // Summary
    console.log('📊 SUMMARY:');
    console.log('─'.repeat(80));
    console.log(`Total shows:              ${snapshot.size}`);
    console.log(`With mgmtAgency:          ${withMgmt} (${((withMgmt/snapshot.size)*100).toFixed(1)}%)`);
    console.log(`With bookingAgency:       ${withBooking} (${((withBooking/snapshot.size)*100).toFixed(1)}%)`);
    console.log(`With both agencies:       ${withBoth} (${((withBoth/snapshot.size)*100).toFixed(1)}%)`);
    console.log(`With NO agencies:         ${withNeither} (${((withNeither/snapshot.size)*100).toFixed(1)}%)`);
    console.log('─'.repeat(80));
    
    // Detailed view of sample shows
    console.log('\n📋 SAMPLE SHOWS (first 5):\n');
    showsSample.forEach((show, idx) => {
      console.log(`${idx + 1}. ${show.name} - ${show.city} (${show.date})`);
      console.log(`   ID: ${show.id}`);
      console.log(`   Fee: €${show.fee} | Status: ${show.status}`);
      console.log(`   mgmtAgency: ${show.hasMgmt ? '✅ ' + show.mgmtAgency : '❌ NOT SET'}`);
      console.log(`   bookingAgency: ${show.hasBooking ? '✅ ' + show.bookingAgency : '❌ NOT SET'}`);
      console.log('');
    });
    
    // Check if problem is widespread
    if (withNeither > snapshot.size * 0.5) {
      console.log('⚠️  WARNING: More than 50% of shows have NO agencies assigned!');
      console.log('   This is likely why commissions are not appearing in Finance tab.\n');
      console.log('💡 SOLUTION: You need to either:');
      console.log('   1. Edit each show and assign agencies, OR');
      console.log('   2. Run a migration script to auto-assign agencies based on territory\n');
    } else if (withNeither > 0) {
      console.log(`ℹ️  Note: ${withNeither} shows have no agencies assigned.\n`);
    } else {
      console.log('✅ All shows have at least one agency assigned!\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkShows().then(() => {
  console.log('Done!\n');
  process.exit(0);
});
