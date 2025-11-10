import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';
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

async function migrateContacts() {
  try {
    console.log('🚀 Starting contacts migration to Firestore...\n');

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Authenticate
    console.log('🔐 Authenticating...');
    const userCredential = await signInWithEmailAndPassword(auth, PROPHECY_EMAIL, PROPHECY_PASSWORD);
    const PROPHECY_USER_ID = userCredential.user.uid;
    console.log(`✅ Authenticated as ${PROPHECY_EMAIL} (UID: ${PROPHECY_USER_ID})\n`);

    // Load contacts from dataset file
    console.log('📇 Loading contacts from TypeScript dataset...');
    const contactsPath = join(__dirname, '../src/lib/prophecyContactsDataset.ts');
    const contactsContent = readFileSync(contactsPath, 'utf-8');
    
    // Count total contacts
    const contactCount = (contactsContent.match(/\{\s*firstName:/g) || []).length;
    console.log(`📇 Found ${contactCount} contact entries in file`);
    
    // Parse contacts from TypeScript file - MISMO CÓDIGO QUE FUNCIONÓ ANTES
    const contacts = [];
    const contactBlocks = contactsContent.split(/\{\s*firstName:/).slice(1);
    
    console.log(`📇 Parsing ${contactBlocks.length} contact blocks...`);
    
    for (let i = 0; i < contactBlocks.length; i++) {
      // Reconstruir el bloque completo con mejor manejo
      const block = '{' + 'firstName:' + contactBlocks[i].split('},')[0] + '}';
      try {
        // Función mejorada para extraer campos con manejo de comillas dobles Y simples
        const extractField = (field, defaultValue = '') => {
          // Intentar con comillas simples primero
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
        
        // Solo requerir firstName y email (lastName puede estar vacío en algunos casos)
        if (firstName && email) {
          contacts.push({
            id: `contact_prophecy_${String(i + 1).padStart(4, '0')}`,
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
        // Silenciosamente continuar con el siguiente
      }
    }
    
    console.log(`✅ Successfully parsed ${contacts.length}/${contactBlocks.length} valid contacts\n`);

    // Import contacts to Firestore
    console.log(`📇 Importing ${contacts.length} contacts to Firestore...`);
    
    let importCount = 0;
    for (const contact of contacts) {
      try {
        const contactRef = doc(db, `users/${PROPHECY_USER_ID}/contacts/${contact.id}`);
        await setDoc(contactRef, contact);
        importCount++;
        
        // Log progress every 50 contacts
        if (importCount % 50 === 0) {
          console.log(`  ✅ Imported ${importCount}/${contacts.length} contacts...`);
        }
      } catch (error) {
        console.error(`  ❌ Failed to import contact ${contact.id} (${contact.email}):`, error.message);
      }
    }
    
    console.log(`\n✅ Successfully imported ${importCount}/${contacts.length} contacts!`);
    
    console.log('\n🎉 Contacts migration complete!\n');
    console.log('⚠️  Remember to create the composite index in Firebase Console:');
    console.log('   Collection: contacts');
    console.log('   Fields: userId (Ascending), lastName (Ascending)');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

migrateContacts()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
