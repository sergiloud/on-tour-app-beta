#!/usr/bin/env node

/**
 * Script para verificar shows CON agencias y calcular comisiones
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

async function analyzeCommissions() {
  try {
    const userId = 'ooaTPnc4KvSzsWQxxfqnOdLvKU92';
    
    console.log('\n💰 Analyzing shows with agency commissions...\n');
    console.log('='.repeat(80));
    
    const showsRef = db.collection(`users/${userId}/shows`);
    const snapshot = await showsRef.orderBy('date', 'desc').get();
    
    const withAgencies = [];
    const withoutAgencies = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const show = {
        id: doc.id,
        name: data.name || 'Unnamed',
        city: data.city || 'Unknown',
        date: data.date || 'No date',
        fee: data.fee || 0,
        status: data.status || 'unknown',
        mgmtAgency: data.mgmtAgency,
        bookingAgency: data.bookingAgency
      };
      
      if (show.mgmtAgency || show.bookingAgency) {
        withAgencies.push(show);
      } else {
        withoutAgencies.push(show);
      }
    });
    
    console.log(`\n✅ Shows WITH agencies: ${withAgencies.length}`);
    console.log(`❌ Shows WITHOUT agencies: ${withoutAgencies.length}\n`);
    
    console.log('─'.repeat(80));
    console.log('SHOWS WITH AGENCIES (should show commissions):');
    console.log('─'.repeat(80));
    
    withAgencies.slice(0, 10).forEach((show, idx) => {
      console.log(`\n${idx + 1}. ${show.name} - ${show.city}`);
      console.log(`   Date: ${show.date} | Fee: €${show.fee} | Status: ${show.status}`);
      console.log(`   Mgmt: ${show.mgmtAgency || '—'}`);
      console.log(`   Booking: ${show.bookingAgency || '—'}`);
    });
    
    console.log('\n' + '─'.repeat(80));
    console.log('SHOWS WITHOUT AGENCIES (zero commissions):');
    console.log('─'.repeat(80));
    
    withoutAgencies.slice(0, 5).forEach((show, idx) => {
      console.log(`\n${idx + 1}. ${show.name} - ${show.city}`);
      console.log(`   Date: ${show.date} | Fee: €${show.fee} | Status: ${show.status}`);
      console.log(`   ⚠️  NO AGENCIES ASSIGNED`);
    });
    
    // Calculate expected commission for shows with agencies
    const totalFeeWithAgencies = withAgencies
      .filter(s => s.status !== 'offer')
      .reduce((sum, s) => sum + s.fee, 0);
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 FINANCIAL SUMMARY:');
    console.log('='.repeat(80));
    console.log(`Shows with agencies (confirmed): ${withAgencies.filter(s => s.status !== 'offer').length}`);
    console.log(`Total fees (with agencies): €${totalFeeWithAgencies.toLocaleString()}`);
    console.log(`Estimated commission (10-15%): €${(totalFeeWithAgencies * 0.125).toLocaleString()}`);
    console.log('');
    console.log(`⚠️  ${withoutAgencies.length} shows need agencies assigned for accurate commission calculation`);
    console.log('='.repeat(80));
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

analyzeCommissions().then(() => {
  console.log('Done!\n');
  process.exit(0);
});
