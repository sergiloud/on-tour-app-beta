/**
 * Test script para crear eventos de actividad en Timeline
 * Ejecutar con: node create-test-activities.mjs
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Firebase config (usar las mismas variables de entorno)
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
const auth = getAuth(app);

const TEST_ORGANIZATION_ID = 'org-demo-001';
const TEST_USER_EMAIL = 'demo@ontourapp.com';
const TEST_USER_PASSWORD = 'demo123456';

async function createTestActivities() {
  try {
    console.log('🔐 Signing in...');
    const userCredential = await signInWithEmailAndPassword(auth, TEST_USER_EMAIL, TEST_USER_PASSWORD);
    const user = userCredential.user;

    console.log(`✅ Signed in as: ${user.email}`);

    const activitiesRef = collection(db, 'activities');

    // Create 10 test events
    const events = [
      {
        module: 'shows',
        action: 'create',
        title: 'Nuevo show creado: Arctic Monkeys - Madison Square Garden',
        description: 'Show confirmado para el 15 de Junio 2025',
        importance: 'high',
        relatedId: 'show-001',
        relatedName: 'Arctic Monkeys - Madison Square Garden',
        metadata: {
          showDate: '2025-06-15',
          venue: 'Madison Square Garden',
          artist: 'Arctic Monkeys',
          status: 'confirmed',
        },
      },
      {
        module: 'contacts',
        action: 'create',
        title: 'Nuevo contacto: John Smith (Promoter)',
        description: 'Contacto añadido desde el módulo CRM',
        importance: 'medium',
        relatedId: 'contact-001',
        relatedName: 'John Smith',
        metadata: {
          type: 'promoter',
          email: 'john@livenation.com',
          phone: '+1-555-0123',
        },
      },
      {
        module: 'shows',
        action: 'status_change',
        title: 'Show Billie Eilish: estado cambió a on_sale',
        description: 'Las entradas ya están disponibles',
        importance: 'high',
        relatedId: 'show-002',
        relatedName: 'Billie Eilish - The O2',
        metadata: {
          showDate: '2025-07-20',
          venue: 'The O2',
          artist: 'Billie Eilish',
          status: 'on_sale',
        },
      },
      {
        module: 'contracts',
        action: 'create',
        title: 'Nuevo contrato: Taylor Swift World Tour 2025',
        description: 'Contrato creado con AEG Presents',
        importance: 'high',
        relatedId: 'contract-001',
        relatedName: 'Taylor Swift World Tour 2025',
        metadata: {
          status: 'pending',
          amount: 5000000,
        },
      },
      {
        module: 'venues',
        action: 'update',
        title: 'Venue actualizado: Wembley Stadium',
        description: 'Capacidad actualizada a 90,000',
        importance: 'low',
        relatedId: 'venue-001',
        relatedName: 'Wembley Stadium',
        metadata: {
          city: 'London',
          country: 'GB',
          capacity: 90000,
        },
      },
      {
        module: 'finance',
        action: 'payment',
        title: 'Pago registrado: €250,000',
        description: 'Anticipo recibido para show de Ed Sheeran',
        importance: 'high',
        relatedId: 'payment-001',
        relatedName: 'Anticipo Ed Sheeran',
        metadata: {
          amount: 250000,
          currency: 'EUR',
          type: 'advance',
        },
      },
      {
        module: 'shows',
        action: 'update',
        title: 'Show actualizado: The Weeknd - SoFi Stadium',
        description: 'Detalles técnicos actualizados',
        importance: 'low',
        relatedId: 'show-003',
        relatedName: 'The Weeknd - SoFi Stadium',
        metadata: {
          showDate: '2025-08-10',
          venue: 'SoFi Stadium',
          artist: 'The Weeknd',
          status: 'confirmed',
        },
      },
      {
        module: 'contacts',
        action: 'update',
        title: 'Contacto actualizado: Sarah Johnson',
        description: 'Email y teléfono actualizados',
        importance: 'low',
        relatedId: 'contact-002',
        relatedName: 'Sarah Johnson',
        metadata: {
          type: 'agent',
          email: 'sarah.new@caa.com',
          phone: '+1-555-9999',
        },
      },
      {
        module: 'shows',
        action: 'delete',
        title: 'Show eliminado: Drake - Cancelled Tour',
        description: 'Show cancelado por problemas logísticos',
        importance: 'medium',
        relatedId: 'show-004',
        relatedName: 'Drake - Cancelled Tour',
        metadata: {
          showDate: '2025-09-01',
          venue: 'Scotiabank Arena',
          artist: 'Drake',
          status: 'cancelled',
        },
      },
      {
        module: 'contracts',
        action: 'status_change',
        title: 'Contrato Bad Bunny Tour: signed',
        description: 'Contrato firmado y activo',
        importance: 'high',
        relatedId: 'contract-002',
        relatedName: 'Bad Bunny World Tour 2025',
        metadata: {
          status: 'signed',
          amount: 8000000,
        },
      },
    ];

    console.log(`\n📝 Creating ${events.length} test activities...\n`);

    for (let i = 0; i < events.length; i++) {
      const event = events[i];

      const activity = {
        organizationId: TEST_ORGANIZATION_ID,
        userId: user.uid,
        userName: user.displayName || user.email,
        userEmail: user.email,
        ...event,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(activitiesRef, activity);
      
      console.log(`✅ [${i + 1}/${events.length}] ${event.title}`);
      console.log(`   Module: ${event.module} | Action: ${event.action} | ID: ${docRef.id}`);

      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`\n🎉 Successfully created ${events.length} test activities!`);
    console.log(`\n📍 Next steps:`);
    console.log(`   1. Go to https://on-tour-app-beta.vercel.app/dashboard/timeline`);
    console.log(`   2. You should see ${events.length} events in the Timeline`);
    console.log(`   3. Try filtering by module, importance, or user`);
    console.log(`\n💡 Tip: Events are grouped by "Today", "This Week", "This Month", "Earlier"`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
  } finally {
    process.exit(0);
  }
}

createTestActivities();
