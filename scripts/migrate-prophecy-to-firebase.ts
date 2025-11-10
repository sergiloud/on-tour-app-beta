/**
 * Script para migrar datos de Prophecy desde localStorage a Firebase
 * 
 * ANTES DE EJECUTAR:
 * 1. Crear usuario en Firebase Auth: booking@prophecyofficial.com
 * 2. Obtener el UID del usuario desde Firebase Console
 * 3. Reemplazar PROPHECY_FIREBASE_UID con el UID real
 * 
 * EJECUTAR:
 * npm run dev
 * Abrir browser console
 * Copiar y pegar este código
 */

const PROPHECY_FIREBASE_UID = 'TU_FIREBASE_UID_AQUI'; // ⚠️ CAMBIAR ESTO

async function migrateProphecyData() {
  console.log('🚀 Iniciando migración de Prophecy a Firebase...');
  
  try {
    // 1. Migrar Shows
    console.log('📊 Migrando shows...');
    const { FirestoreShowService } = await import('../src/services/firestoreShowService');
    const showCount = await FirestoreShowService.migrateFromLocalStorage(PROPHECY_FIREBASE_UID);
    console.log(`✅ ${showCount} shows migrados`);

    // 2. Migrar Contactos
    console.log('👥 Migrando contactos...');
    const { FirestoreContactService } = await import('../src/services/firestoreContactService');
    const contactCount = await FirestoreContactService.migrateFromLocalStorage(PROPHECY_FIREBASE_UID);
    console.log(`✅ ${contactCount} contactos migrados`);

    // 3. Migrar Finanzas
    console.log('💰 Migrando transacciones...');
    const { FirestoreFinanceService } = await import('../src/services/firestoreFinanceService');
    const financeCount = await FirestoreFinanceService.migrateFromLocalStorage(PROPHECY_FIREBASE_UID);
    console.log(`✅ ${financeCount} transacciones migradas`);

    // 4. Migrar Travel
    console.log('✈️ Migrando itinerarios...');
    const { FirestoreTravelService } = await import('../src/services/firestoreTravelService');
    const travelCount = await FirestoreTravelService.migrateFromLocalStorage(PROPHECY_FIREBASE_UID);
    console.log(`✅ ${travelCount} itinerarios migrados`);

    // 5. Migrar Organizaciones
    console.log('🏢 Migrando organizaciones...');
    const { FirestoreOrgService } = await import('../src/services/firestoreOrgService');
    const orgCount = await FirestoreOrgService.migrateFromLocalStorage(PROPHECY_FIREBASE_UID);
    console.log(`✅ ${orgCount} organizaciones migradas`);

    // 6. Migrar Perfil de Usuario
    console.log('👤 Migrando perfil de usuario...');
    const { FirestoreUserService } = await import('../src/services/firestoreUserService');
    await FirestoreUserService.migrateFromLocalStorage(PROPHECY_FIREBASE_UID);
    console.log(`✅ Perfil migrado`);

    console.log('');
    console.log('🎉 ¡Migración completada exitosamente!');
    console.log('');
    console.log('📋 Resumen:');
    console.log(`   - Shows: ${showCount}`);
    console.log(`   - Contactos: ${contactCount}`);
    console.log(`   - Transacciones: ${financeCount}`);
    console.log(`   - Itinerarios: ${travelCount}`);
    console.log(`   - Organizaciones: ${orgCount}`);
    console.log('');
    console.log('✅ Verificar en Firebase Console:');
    console.log(`   https://console.firebase.google.com/project/on-tour-app-712e2/firestore/data/users/${PROPHECY_FIREBASE_UID}`);

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    console.error('');
    console.error('💡 Troubleshooting:');
    console.error('   1. Verificar que PROPHECY_FIREBASE_UID sea correcto');
    console.error('   2. Verificar Firebase credentials en .env');
    console.error('   3. Verificar Firestore security rules');
    console.error('   4. Verificar que el usuario esté autenticado en Firebase Auth');
  }
}

// Ejecutar migración
migrateProphecyData();
