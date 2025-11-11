import admin from 'firebase-admin';
import { readFile } from 'fs/promises';

// Inicializar Firebase Admin SDK
const serviceAccount = JSON.parse(
  await readFile(new URL('./firebase-admin-key.json', import.meta.url))
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const TARGET_USER_ID = 'ooaTPnc4KvSzsWQxxfqnOdLvKU92';

async function migrateShows() {
  console.log('🔍 Buscando shows en la colección raíz...');
  
  // Obtener shows de la colección raíz
  const rootShowsSnapshot = await db.collection('shows').get();
  
  console.log(`📦 Encontrados ${rootShowsSnapshot.size} shows en la colección raíz`);
  
  if (rootShowsSnapshot.empty) {
    console.log('✅ No hay shows para migrar');
    return;
  }
  
  let moved = 0;
  let errors = 0;
  
  for (const showDoc of rootShowsSnapshot.docs) {
    try {
      const showData = showDoc.data();
      const showId = showDoc.id;
      
      console.log(`📝 Moviendo show: ${showId} (${showData.city || 'sin ciudad'})`);
      
      // Crear en la subcolección del usuario
      await db
        .collection('users')
        .doc(TARGET_USER_ID)
        .collection('shows')
        .doc(showId)
        .set(showData, { merge: true });
      
      // Eliminar de la colección raíz
      await db.collection('shows').doc(showId).delete();
      
      moved++;
      console.log(`✅ Movido: ${showId}`);
    } catch (error) {
      errors++;
      console.error(`❌ Error moviendo ${showDoc.id}:`, error.message);
    }
  }
  
  console.log('\n📊 Resumen:');
  console.log(`   ✅ Shows movidos: ${moved}`);
  console.log(`   ❌ Errores: ${errors}`);
  console.log(`   📍 Usuario destino: ${TARGET_USER_ID}`);
}

migrateShows()
  .then(() => {
    console.log('\n🎉 Migración completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error en la migración:', error);
    process.exit(1);
  });
