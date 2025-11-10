/**
 * Prophecy Data Migration Script
 * 
 * This script imports all Prophecy data (shows, contacts, user profile, organization)
 * directly into Firestore for the user: booking@prophecyofficial.com
 * 
 * Run this script ONCE after creating the Firestore composite index.
 * 
 * Usage:
 *   node scripts/migrate-prophecy-to-firestore.mjs
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Firebase config - using correct API key from .env
const firebaseConfig = {
  apiKey: "AIzaSyDCKhH8TMdoK5ioFS_ABmPsVzacKk7WDmo",
  authDomain: "on-tour-app-712e2.firebaseapp.com",
  projectId: "on-tour-app-712e2",
  storageBucket: "on-tour-app-712e2.firebasestorage.app",
  messagingSenderId: "728535007953",
  appId: "1:728535007953:web:b83c4146ebf42c177bfbf0",
};

// Prophecy credentials
const PROPHECY_EMAIL = 'booking@prophecyofficial.com';
const PROPHECY_PASSWORD = 'Casillas123!';
const PROPHECY_ORG_ID = 'org_artist_prophecy';

// Load all 32 Prophecy shows from the dataset
const PROPHECY_SHOWS = [
  // 2022
  { id: 'proph_001', name: 'PROPHECY | Danny Avila pres. Mainstage Techno', date: '2022-07-31', city: 'Limassol', country: 'CY', venue: 'Guaba Beach Bar', fee: 0, lat: 34.6851, lng: 33.0436, tenantId: 'org_artist_prophecy', feeCurrency: 'EUR', status: 'confirmed' },
  { id: 'proph_002', name: 'PROPHECY | Mainstage Techno daytime session (tbc)', date: '2022-08-14', city: 'Tokyo', country: 'JP', venue: 'Sel Octagon Tokyo', fee: 0, notes: 'tbc by agency', lat: 35.6762, lng: 139.6503, tenantId: 'org_artist_prophecy', feeCurrency: 'EUR', status: 'confirmed' },
  { id: 'proph_003', name: 'PROPHECY | S2O Taiwan Songkran Music Festival 2022', date: '2022-08-27', city: 'Taipei City', country: 'TW', venue: 'Dajia Riverside Park', fee: 0, lat: 25.0330, lng: 121.5654, tenantId: 'org_artist_prophecy', feeCurrency: 'EUR', status: 'confirmed' },
  { id: 'proph_004', name: 'PROPHECY | S2O Taiwan Songkran Music Festival 2022', date: '2022-08-28', city: 'Taipei City', country: 'TW', venue: 'Dajia Riverside Park', fee: 0, lat: 25.0330, lng: 121.5654, tenantId: 'org_artist_prophecy', feeCurrency: 'EUR', status: 'confirmed' },
  { id: 'proph_005', name: 'PROPHECY | S2O Taiwan Songkran Music Festival 2022 AFTERPARTY', date: '2022-08-28', city: 'Taipei', country: 'TW', venue: 'Wave', fee: 0, lat: 25.0330, lng: 121.5654, tenantId: 'org_artist_prophecy', feeCurrency: 'EUR', status: 'confirmed' },
  { id: 'proph_006', name: 'PROPHECY | Fairground', date: '2022-12-03', city: 'Hannover', country: 'DE', venue: 'Hannover Exhibition Grounds - Hall 2, 3 & 4', fee: 1500, lat: 52.3759, lng: 9.7320, tenantId: 'org_artist_prophecy', feeCurrency: 'EUR', status: 'confirmed' },
  { id: 'proph_007', name: 'PROPHECY | Festival of Lights', date: '2022-12-31', city: 'Timișoara', country: 'RO', venue: 'Maria Theresia Bastion', fee: 0, notes: 'TBC - slot before Danny', lat: 45.7489, lng: 21.2087, tenantId: 'org_artist_prophecy', feeCurrency: 'EUR', status: 'confirmed' },

  // 2023
  { id: 'proph_008', name: 'PROPHECY | Pool Sessions', date: '2023-05-20', city: 'Alicante', country: 'ES', venue: 'Marmarela Club', fee: 2000, notes: "100% headline slot of artists choice", lat: 38.3452, lng: -0.4810, tenantId: 'org_artist_prophecy', feeCurrency: 'EUR', status: 'confirmed' },
  { id: 'proph_009', name: 'PROPHECY | Future Rave at Hï Ibiza', date: '2023-06-23', city: 'Ibiza', country: 'ES', venue: 'Hï Ibiza', fee: 1215, lat: 38.9067, lng: 1.4206, tenantId: 'org_artist_prophecy', feeCurrency: 'EUR', status: 'confirmed' },
  { id: 'proph_009b', name: 'PROPHECY | Future Rave at Hï Ibiza', date: '2023-06-24', city: 'Ibiza', country: 'ES', venue: 'Hï Ibiza', fee: 1215, lat: 38.9067, lng: 1.4206, tenantId: 'org_artist_prophecy', feeCurrency: 'EUR', status: 'confirmed' },
  { id: 'proph_010', name: 'PROPHECY | Marmarela Club', date: '2023-07-08', city: 'Alicante', country: 'ES', venue: 'Marmarela Club', fee: 2000, notes: "100% headline slot of artists choice", lat: 38.3452, lng: -0.4810, tenantId: 'org_artist_prophecy', feeCurrency: 'EUR', status: 'confirmed' },
  { id: 'proph_011', name: 'PROPHECY | Airbeat One 2023', date: '2023-07-15', city: 'Neustadt-Glewe', country: 'DE', venue: 'Flugplatz Neustadt-Glewe', fee: 1000, notes: 'tbc by Agency', lat: 53.3642, lng: 11.5817, tenantId: 'org_artist_prophecy', feeCurrency: 'EUR', status: 'confirmed' },
  { id: 'proph_012', name: 'PROPHECY | Docks', date: '2023-11-11', city: 'Hamburg', country: 'DE', venue: 'Docks', fee: 0, lat: 53.5511, lng: 9.9937, tenantId: 'org_artist_prophecy', feeCurrency: 'EUR', status: 'confirmed' },

  // 2024
  { id: 'proph_013', name: 'PROPHECY | Und draußen tanzt der Bär', date: '2024-05-09', city: 'Schwerin', country: 'DE', venue: 'Freilichtbühne Schwerin', fee: 1000, lat: 53.6355, lng: 11.4013, tenantId: 'org_artist_prophecy', feeCurrency: 'EUR', status: 'confirmed' },
  { id: 'proph_014', name: 'PROPHECY | FUTURE X TEK Pres. DANNY AVILA', date: '2024-05-31', city: 'London', country: 'GB', venue: 'Ministry Of Sound Club', fee: 750, lat: 51.5074, lng: -0.1278, tenantId: 'org_artist_prophecy', feeCurrency: 'GBP', status: 'confirmed' },
  { id: 'proph_015', name: 'PROPHECY | El Ajo 2024', date: '2024-07-05', city: 'Teruel', country: 'ES', venue: 'Peña El Ajo', fee: 2000, lat: 40.3453, lng: -1.1064, tenantId: 'org_artist_prophecy', feeCurrency: 'EUR', status: 'confirmed' },
  { id: 'proph_016', name: 'PROPHECY | Future Rave at Hï Ibiza', date: '2024-07-26', city: 'Ibiza', country: 'ES', venue: 'Hï Ibiza', fee: 1215, lat: 38.9067, lng: 1.4206, tenantId: 'org_artist_prophecy', feeCurrency: 'EUR', status: 'confirmed' },
  { id: 'proph_016b', name: 'PROPHECY | Future Rave at Hï Ibiza', date: '2024-07-27', city: 'Ibiza', country: 'ES', venue: 'Hï Ibiza', fee: 1215, lat: 38.9067, lng: 1.4206, tenantId: 'org_artist_prophecy', feeCurrency: 'EUR', status: 'confirmed' },
  { id: 'proph_017', name: 'PROPHECY | Playa Padre', date: '2024-08-07', city: 'Marbella', country: 'ES', venue: 'Playa Padre', fee: 0, lat: 36.5101, lng: -4.8824, tenantId: 'org_artist_prophecy', feeCurrency: 'EUR', status: 'confirmed' },
  { id: 'proph_018', name: 'PROPHECY | Momento', date: '2024-08-07', city: 'Marbella', country: 'ES', venue: 'Momento Marbella', fee: 0, lat: 36.5101, lng: -4.8824, tenantId: 'org_artist_prophecy', feeCurrency: 'EUR', status: 'confirmed' },
  { id: 'proph_019', name: 'PROPHECY | Epic', date: '2024-10-12', city: 'Prague', country: 'CZ', venue: 'Epic', fee: 500, lat: 50.0755, lng: 14.4378, tenantId: 'org_artist_prophecy', feeCurrency: 'EUR', status: 'confirmed' },
  { id: 'proph_020', name: 'PROPHECY | Bassmnt Madrid', date: '2024-11-01', city: 'Madrid', country: 'ES', venue: 'Bassmnt Madrid', fee: 500, lat: 40.4168, lng: -3.7038, tenantId: 'org_artist_prophecy', feeCurrency: 'EUR', status: 'confirmed' },
  { id: 'proph_021', name: 'PROPHECY | Ultra Taiwan Resistance', date: '2024-11-16', city: 'Taipei', country: 'TW', venue: 'Dajia Riverside Park', fee: 2000, lat: 25.0330, lng: 121.5654, tenantId: 'org_artist_prophecy', feeCurrency: 'USD', status: 'confirmed' },
  { id: 'proph_022', name: 'PROPHECY | Ultra Official Afterparty', date: '2024-11-16', city: 'Xinyi District', country: 'TW', venue: 'Ai Nightclub', fee: 1500, lat: 25.0330, lng: 121.5654, tenantId: 'org_artist_prophecy', feeCurrency: 'USD', status: 'confirmed' },
  { id: 'proph_023', name: 'PROPHECY | Docks w/ Oliver Heldens', date: '2024-11-22', city: 'Hamburg', country: 'DE', venue: 'Docks', fee: 1000, lat: 53.5511, lng: 9.9937, tenantId: 'org_artist_prophecy', feeCurrency: 'EUR', status: 'confirmed' },
  { id: 'proph_023b', name: 'PROPHECY | Docks w/ Oliver Heldens', date: '2024-11-23', city: 'Hamburg', country: 'DE', venue: 'Docks', fee: 1000, lat: 53.5511, lng: 9.9937, tenantId: 'org_artist_prophecy', feeCurrency: 'EUR', status: 'confirmed' },
  { id: 'proph_024', name: 'PROPHECY | Verti Music Hall w/ Timmy Trumpet', date: '2024-11-23', city: 'Berlin', country: 'DE', venue: 'Verti Music Hall', fee: 750, notes: 'tbc', lat: 52.5200, lng: 13.4050, tenantId: 'org_artist_prophecy', feeCurrency: 'EUR', status: 'confirmed' },
  { id: 'proph_025', name: 'PROPHECY | Fairground Festival 2024', date: '2024-11-30', city: 'Hannover', country: 'DE', venue: 'Hannover Exhibition Grounds - Hall 2, 3 & 4', fee: 1500, notes: 'tbc', lat: 52.3759, lng: 9.7320, tenantId: 'org_artist_prophecy', feeCurrency: 'EUR', status: 'confirmed' },

  // 2025
  { id: 'proph_026', name: 'PROPHECY | Bootshaus w/ Morten', date: '2025-01-10', city: 'Cologne', country: 'DE', venue: 'Bootshaus', fee: 1000, lat: 50.9375, lng: 6.9603, tenantId: 'org_artist_prophecy', feeCurrency: 'EUR', status: 'confirmed' },
  { id: 'proph_027', name: 'PROPHECY | Marchica', date: '2025-02-07', city: 'Formigal', country: 'ES', venue: 'Formigal', fee: 3500, lat: 42.7742, lng: -0.3350, tenantId: 'org_artist_prophecy', feeCurrency: 'EUR', status: 'confirmed' },
  { id: 'proph_028', name: 'PROPHECY | S2O Festival Thailand', date: '2025-04-13', city: 'Bangkok', country: 'TH', venue: 'Rajamangala National Stadium', fee: 4000, lat: 13.7563, lng: 100.5018, tenantId: 'org_artist_prophecy', feeCurrency: 'USD', status: 'confirmed' },
  { id: 'proph_029', name: 'PROPHECY | Beats For Love Festival', date: '2025-07-03', city: 'Ostrava', country: 'CZ', venue: 'DOV Industrial site', fee: 2425, lat: 49.8209, lng: 18.2625, tenantId: 'org_artist_prophecy', feeCurrency: 'EUR', status: 'confirmed' },
];

async function migrateAllData() {
  console.log('🚀 Starting Prophecy data migration to Firestore...\n');

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  try {
    // 0. Authenticate with Prophecy account
    console.log('🔐 Authenticating with Prophecy account...');
    const userCredential = await signInWithEmailAndPassword(auth, PROPHECY_EMAIL, PROPHECY_PASSWORD);
    const PROPHECY_USER_ID = userCredential.user.uid;
    console.log(`✅ Authenticated as ${PROPHECY_EMAIL} (UID: ${PROPHECY_USER_ID})\n`);
    // 1. Create user profile
    console.log('📝 Creating user profile...');
    const userProfileRef = doc(db, `users/${PROPHECY_USER_ID}`);
    await setDoc(userProfileRef, {
      profile: {
        name: 'Prophecy',
        email: 'booking@prophecyofficial.com',
        defaultOrgId: PROPHECY_ORG_ID,
        bio: 'Electronic music producer and DJ',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      preferences: {
        theme: 'dark',
        language: 'en',
        currency: 'EUR',
        timezone: 'Europe/Madrid'
      }
    });
    console.log('✅ User profile created\n');

    // 2. Create organization
    console.log('🏢 Creating organization...');
    const orgRef = doc(db, `users/${PROPHECY_USER_ID}/organizations/${PROPHECY_ORG_ID}`);
    await setDoc(orgRef, {
      id: PROPHECY_ORG_ID,
      name: 'Prophecy',
      type: 'artist',
      ownerId: PROPHECY_USER_ID,
      members: [
        {
          userId: PROPHECY_USER_ID,
          role: 'owner',
          email: 'booking@prophecyofficial.com',
          addedAt: Timestamp.now()
        }
      ],
      settings: {
        branding: {
          logoUrl: '',
          color: '#6366f1',
          shortBio: 'Electronic music producer and DJ'
        },
        defaults: {
          currency: 'EUR',
          timezone: 'Europe/Madrid'
        }
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    console.log('✅ Organization created\n');

    // 3. Import shows
    console.log(`🎵 Importing ${PROPHECY_SHOWS.length} shows...`);
    let showCount = 0;
    for (const show of PROPHECY_SHOWS) {
      try {
        const showRef = doc(db, `users/${PROPHECY_USER_ID}/shows/${show.id}`);
        await setDoc(showRef, {
          ...show,
          userId: PROPHECY_USER_ID,
          __modifiedBy: PROPHECY_USER_ID,
          __modifiedAt: new Date(show.date).getTime(),
          __version: 1,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        showCount++;
        console.log(`  ✅ Imported show: ${show.name}`);
      } catch (error) {
        console.error(`  ❌ Failed to import show ${show.id}:`, error);
      }
    }
    console.log(`✅ Imported ${showCount}/${PROPHECY_SHOWS.length} shows\n`);

    // 4. Import contacts
    console.log(`📇 Loading contacts from dataset...`);
    const contactsPath = join(__dirname, '../src/lib/prophecyContactsDataset.ts');
    const contactsContent = readFileSync(contactsPath, 'utf-8');
    
    // Extract the PROPHECY_CONTACTS array (simple regex extraction)
    const contactsMatch = contactsContent.match(/export const PROPHECY_CONTACTS[^=]+=\s*\[([\s\S]*)\];/);
    if (!contactsMatch) {
      console.log('⚠️  Could not parse contacts from dataset file');
    } else {
      console.log(`📇 Importing contacts...`);
      
      // Import contacts from the TypeScript file using a dynamic import approach
      // We'll count them from the file instead of importing the TS module
      const contactCount = (contactsContent.match(/\{\s*firstName:/g) || []).length;
      console.log(`📇 Found ${contactCount} contacts to import...`);
      
      // For now, we'll use a simpler approach - read and transform the data
      // We'll need to parse the TypeScript object literals
      const contacts = [];
      const contactBlocks = contactsContent.split(/\{\s*firstName:/).slice(1);
      
      for (let i = 0; i < contactBlocks.length; i++) {
        const block = '{' + 'firstName:' + contactBlocks[i].split('},')[0] + '}';
        try {
          // Extract fields with regex
          const firstName = block.match(/firstName:\s*['"]([^'"]+)['"]/)?.[1] || '';
          const lastName = block.match(/lastName:\s*['"]([^'"]+)['"]/)?.[1] || '';
          const email = block.match(/email:\s*['"]([^'"]+)['"]/)?.[1] || '';
          const phone = block.match(/phone:\s*['"]([^'"]*)['"]/)?.[1] || '';
          const company = block.match(/company:\s*['"]([^'"]+)['"]/)?.[1] || '';
          const position = block.match(/position:\s*['"]([^'"]+)['"]/)?.[1] || '';
          const type = block.match(/type:\s*['"]([^'"]+)['"]/)?.[1] || 'promoter';
          const city = block.match(/city:\s*['"]([^'"]+)['"]/)?.[1] || '';
          const country = block.match(/country:\s*['"]([^'"]+)['"]/)?.[1] || '';
          const priority = block.match(/priority:\s*['"]([^'"]+)['"]/)?.[1] || 'medium';
          const status = block.match(/status:\s*['"]([^'"]+)['"]/)?.[1] || 'active';
          
          if (firstName && lastName && email) {
            contacts.push({
              id: `contact_prophecy_${i + 1}`,
              firstName,
              lastName,
              email,
              phone,
              company,
              position,
              type,
              city,
              country,
              priority,
              status,
              tags: [type, country.toLowerCase()].filter(Boolean),
              notes: [],
              interactions: [],
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
              userId: PROPHECY_USER_ID,
              tenantId: PROPHECY_ORG_ID
            });
          }
        } catch (e) {
          // Skip malformed entries
          console.log(`  ⚠️  Skipped contact ${i + 1} (parse error)`);
        }
      }
      
      console.log(`📇 Parsed ${contacts.length} valid contacts`);
      console.log(`📇 Importing ${contacts.length} contacts...`);
      
      let contactImportCount = 0;
      for (const contact of contacts) {
        try {
          const contactRef = doc(db, `users/${PROPHECY_USER_ID}/contacts/${contact.id}`);
          await setDoc(contactRef, contact);
          contactImportCount++;
          
          // Log progress every 100 contacts
          if (contactImportCount % 100 === 0) {
            console.log(`  ✅ Imported ${contactImportCount}/${contacts.length} contacts...`);
          }
        } catch (error) {
          console.error(`  ❌ Failed to import contact ${contact.id}:`, error.message);
        }
      }
      console.log(`✅ Imported ${contactImportCount}/${contacts.length} contacts\n`);
    }

    // Summary
    console.log('🎉 Migration complete!\n');
    console.log('Summary:');
    console.log(`  ✅ User profile: created`);
    console.log(`  ✅ Organization: created (Prophecy)`);
    console.log(`  ✅ Shows: ${showCount}/${PROPHECY_SHOWS.length}`);
    console.log(`  ✅ Contacts: imported`);
    console.log('\n✅ You can now login with booking@prophecyofficial.com / Casillas123!');
    console.log('\n⚠️  IMPORTANT: Make sure you have created the Firestore composite indexes:');
    console.log('   1. Collection: shows');
    console.log('      Fields: userId (Ascending), date (Descending)');
    console.log('   2. Collection: contacts');
    console.log('      Fields: userId (Ascending), lastName (Ascending)');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
migrateAllData()
  .then(() => {
    console.log('\n✅ Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
  });
