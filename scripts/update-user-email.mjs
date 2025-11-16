#!/usr/bin/env node
/**
 * Update User Email
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./firebase-admin-key.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const userId = 'ooaTPnc4KvSzsWQxxfqnOdLvKU92';
const orgId = 'org_artist_prophecy';
const correctEmail = 'booking@prophecyofficial.com';

async function updateEmail() {
  console.log('\n📧 Updating user email...\n');

  // Update user document
  await db.doc(`users/${userId}`).update({
    email: correctEmail,
    updatedAt: FieldValue.serverTimestamp(),
  });
  console.log('✅ User document updated');

  // Update member document
  await db.doc(`organizations/${orgId}/members/${userId}`).update({
    email: correctEmail,
    updatedAt: FieldValue.serverTimestamp(),
  });
  console.log('✅ Member document updated');

  console.log(`\n✅ Email updated to: ${correctEmail}\n`);
  process.exit(0);
}

updateEmail().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
