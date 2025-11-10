import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, deleteDoc, doc, setDoc, Timestamp } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDCKhH8TMdoK5ioFS_ABmPsVzacKk7WDmo",
  authDomain: "on-tour-app-712e2.firebaseapp.com",
  projectId: "on-tour-app-712e2",
  storageBucket: "on-tour-app-712e2.firebasestorage.app",
  messagingSenderId: "728535007953",
  appId: "1:728535007953:web:b83c4146ebf42c177bfbf0",
};

const PROPHECY_EMAIL = 'booking@prophecyofficial.com';
const PROPHECY_PASSWORD = 'Casillas123!';
const PROPHECY_ORG_ID = 'org_artist_prophecy';

async function cleanAndReimportContacts() {
  try {
    console.log('🚀 Starting contacts cleanup and reimport...\n');

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Authenticate
    console.log('🔐 Authenticating...');
    const userCredential = await signInWithEmailAndPassword(auth, PROPHECY_EMAIL, PROPHECY_PASSWORD);
    const PROPHECY_USER_ID = userCredential.user.uid;
    console.log(`✅ Authenticated as ${PROPHECY_EMAIL} (UID: ${PROPHECY_USER_ID})\n`);

    // ========================================
    // STEP 1: DELETE ALL EXISTING CONTACTS
    // ========================================
    console.log('🗑️  STEP 1: Deleting all existing contacts from Firestore...');
    const contactsRef = collection(db, `users/${PROPHECY_USER_ID}/contacts`);
    const snapshot = await getDocs(contactsRef);
    
    console.log(`   Found ${snapshot.size} contacts to delete`);
    
    let deleteCount = 0;
    for (const docSnapshot of snapshot.docs) {
      await deleteDoc(docSnapshot.ref);
      deleteCount++;
      
      if (deleteCount % 50 === 0) {
        console.log(`   🗑️  Deleted ${deleteCount}/${snapshot.size} contacts...`);
      }
    }
    
    console.log(`✅ Deleted ${deleteCount} contacts from Firestore\n`);

    // ========================================
    // STEP 2: LOAD CONTACTS FROM DATASET
    // ========================================
    console.log('📇 STEP 2: Loading contacts from TypeScript dataset...');
    const contactsPath = join(__dirname, '../src/lib/prophecyContactsDataset.ts');
    const contactsContent = readFileSync(contactsPath, 'utf-8');
    
    const contactBlocks = contactsContent.split(/\{\s*firstName:/).slice(1);
    console.log(`   Found ${contactBlocks.length} contact blocks in file`);
    
    // Parse contacts
    const contacts = [];
    const seenEmails = new Set(); // Para evitar duplicados
    
    for (let i = 0; i < contactBlocks.length; i++) {
      const block = '{' + 'firstName:' + contactBlocks[i].split('},')[0] + '}';
      
      try {
        const extractField = (field, defaultValue = '') => {
          // Intentar con comillas simples
          let regex = new RegExp(`${field}:\\s*'([^']*)'`, 'i');
          let match = block.match(regex);
          if (match) return match[1];
          
          // Intentar con comillas dobles
          regex = new RegExp(`${field}:\\s*"([^"]*)"`, 'i');
          match = block.match(regex);
          if (match) return match[1];
          
          // Intentar con backticks
          regex = new RegExp(`${field}:\\s*\`([^\`]*)\``, 'i');
          match = block.match(regex);
          if (match) return match[1];
          
          return defaultValue;
        };
        
        const firstName = extractField('firstName');
        const lastName = extractField('lastName');
        const email = extractField('email');
        const phone = extractField('phone', '');
        const company = extractField('company', '');
        const position = extractField('position', '');
        const type = extractField('type', 'promoter');
        const city = extractField('city', '');
        const country = extractField('country', '');
        const priority = extractField('priority', 'medium');
        const status = extractField('status', 'active');
        
        // Validar campos requeridos
        if (firstName && email) {
          // Evitar duplicados por email
          if (seenEmails.has(email.toLowerCase())) {
            console.log(`   ⚠️  Skipping duplicate email: ${email}`);
            continue;
          }
          
          seenEmails.add(email.toLowerCase());
          
          contacts.push({
            id: `contact_prophecy_${String(contacts.length + 1).padStart(4, '0')}`,
            firstName,
            lastName: lastName || '',
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
        // Silenciosamente continuar
      }
    }
    
    console.log(`✅ Parsed ${contacts.length} unique contacts (removed duplicates)\n`);

    // ========================================
    // STEP 3: IMPORT CLEAN CONTACTS
    // ========================================
    console.log(`📇 STEP 3: Importing ${contacts.length} contacts to Firestore...`);
    
    let importCount = 0;
    for (const contact of contacts) {
      try {
        const contactRef = doc(db, `users/${PROPHECY_USER_ID}/contacts/${contact.id}`);
        await setDoc(contactRef, contact);
        importCount++;
        
        if (importCount % 50 === 0) {
          console.log(`   ✅ Imported ${importCount}/${contacts.length} contacts...`);
        }
      } catch (error) {
        console.error(`   ❌ Failed to import ${contact.email}:`, error.message);
      }
    }
    
    console.log(`\n✅ Successfully imported ${importCount}/${contacts.length} contacts!`);
    console.log('\n🎉 Cleanup and reimport complete!\n');
    
    console.log('📊 Summary:');
    console.log(`   🗑️  Deleted: ${deleteCount} old contacts`);
    console.log(`   ✅ Imported: ${importCount} new contacts`);
    console.log(`   📧 Unique emails: ${seenEmails.size}`);

  } catch (error) {
    console.error('❌ Script failed:', error);
    throw error;
  }
}

cleanAndReimportContacts()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
