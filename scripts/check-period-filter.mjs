#!/usr/bin/env node

/**
 * Test period filter - verifica qué shows caen dentro del período de agencias
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

// Copy of isWithinAgencyPeriod from agencies.ts
function isWithinAgencyPeriod(showDate) {
  try {
    const date = new Date(showDate);
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-07-31');
    return date >= startDate && date <= endDate;
  } catch {
    return false;
  }
}

async function testPeriodFilter() {
  try {
    const userId = 'ooaTPnc4KvSzsWQxxfqnOdLvKU92';
    
    console.log('\n🔍 Probando filtro de período de agencias (2025-01-01 to 2025-07-31)...\n');
    console.log('='.repeat(80));
    
    const showsRef = db.collection(`users/${userId}/shows`);
    const snapshot = await showsRef.orderBy('date', 'desc').get();
    
    const inPeriod = [];
    const outPeriod = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const show = {
        id: doc.id,
        name: data.name || 'Unnamed',
        date: data.date,
        status: data.status,
        fee: data.fee || 0,
        mgmtAgency: data.mgmtAgency,
        bookingAgency: data.bookingAgency
      };
      
      if (isWithinAgencyPeriod(show.date)) {
        inPeriod.push(show);
      } else {
        outPeriod.push(show);
      }
    });
    
    const inPeriodWithAgencies = inPeriod.filter(s => s.mgmtAgency || s.bookingAgency);
    const inPeriodConfirmed = inPeriod.filter(s => s.status !== 'offer');
    const inPeriodConfirmedWithAgencies = inPeriodConfirmed.filter(s => s.mgmtAgency || s.bookingAgency);
    
    console.log('\n📊 RESUMEN:');
    console.log('─'.repeat(80));
    console.log(`Shows en período (2025-01-01 to 2025-07-31): ${inPeriod.length}`);
    console.log(`Shows FUERA del período: ${outPeriod.length}`);
    console.log('');
    console.log(`En período CON agencias: ${inPeriodWithAgencies.length}`);
    console.log(`En período confirmados/pending: ${inPeriodConfirmed.length}`);
    console.log(`En período confirmados CON agencias: ${inPeriodConfirmedWithAgencies.length}`);
    
    const totalFees = inPeriodConfirmedWithAgencies.reduce((sum, s) => sum + s.fee, 0);
    const estimatedCommission = totalFees * 0.125;
    
    console.log('');
    console.log(`Total fees: €${totalFees.toLocaleString()}`);
    console.log(`Comisión estimada (12.5%): €${estimatedCommission.toLocaleString()}`);
    console.log('─'.repeat(80));
    
    console.log('\n✅ Shows EN período CON agencias:');
    inPeriodConfirmedWithAgencies.forEach(show => {
      console.log(`  ${show.date} | ${show.name} | €${show.fee}`);
    });
    
    console.log('\n❌ Shows FUERA del período (con agencias):');
    outPeriod.filter(s => s.mgmtAgency || s.bookingAgency).slice(0, 5).forEach(show => {
      console.log(`  ${show.date} | ${show.name} | €${show.fee}`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('💡 DIAGNÓSTICO:');
    console.log('='.repeat(80));
    if (estimatedCommission > 1500) {
      console.log(`Si ves ~€${estimatedCommission.toLocaleString()} → TODO FUNCIONA BIEN`);
    }
    console.log(`Si ves €1,110 → BUG: solo cuenta ${Math.round(1110 / 0.125)} fees`);
    console.log('='.repeat(80));
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testPeriodFilter().then(() => {
  process.exit(0);
});
