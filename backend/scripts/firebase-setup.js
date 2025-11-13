#!/usr/bin/env node

/**
 * 🔧 FIREBASE SETUP HELPER
 * 
 * Ayuda a configurar las variables de entorno necesarias
 * para completar la integración de Firebase
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('\n🔥 FIREBASE SETUP HELPER\n');

// Verificar archivos existentes
const envPath = path.join(__dirname, '../.env');
const serviceAccountPath = path.join(__dirname, '../firebase-admin-key.json');
const firebaseConfigPath = path.join(__dirname, '../firebase.json');

const checks = [
  {
    name: '📁 Archivo .env',
    path: envPath,
    exists: fs.existsSync(envPath),
    required: true
  },
  {
    name: '🔑 Service Account Key',
    path: serviceAccountPath, 
    exists: fs.existsSync(serviceAccountPath),
    required: true
  },
  {
    name: '⚙️ Firebase Config',
    path: firebaseConfigPath,
    exists: fs.existsSync(firebaseConfigPath),
    required: false
  }
];

let missingFiles = 0;

console.log('📋 VERIFICACIÓN DE ARCHIVOS:\n');
checks.forEach(check => {
  const status = check.exists ? '✅' : '❌';
  const required = check.required ? '(REQUERIDO)' : '(OPCIONAL)';
  
  console.log(`${status} ${check.name} ${required}`);
  console.log(`   📍 ${check.path}`);
  
  if (!check.exists && check.required) {
    missingFiles++;
  }
  
  console.log('');
});

// Verificar variables de entorno
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasProjectId = envContent.includes('FIREBASE_PROJECT_ID=');
  const hasServicePath = envContent.includes('FIREBASE_SERVICE_ACCOUNT_PATH=');
  
  console.log('🔍 VARIABLES DE ENTORNO:\n');
  console.log(`${hasProjectId ? '✅' : '❌'} FIREBASE_PROJECT_ID`);
  console.log(`${hasServicePath ? '✅' : '❌'} FIREBASE_SERVICE_ACCOUNT_PATH`);
  
  if (!hasProjectId) {
    console.log('\n⚠️  FALTA FIREBASE_PROJECT_ID');
    console.log('📝 Añade esta línea a tu .env:');
    console.log('   FIREBASE_PROJECT_ID=your-firebase-project-id\n');
  }
  
  if (!hasServicePath) {
    console.log('\n💡 OPCIONAL: Puedes especificar la ruta del service account:');
    console.log('   FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-admin-key.json\n');
  }
}

// Instrucciones según el estado
if (missingFiles > 0) {
  console.log('🚨 ARCHIVOS FALTANTES DETECTADOS\n');
  
  if (!fs.existsSync(envPath)) {
    console.log('1️⃣ CREAR ARCHIVO .env:');
    console.log('   touch .env');
    console.log('   # Añadir variables de entorno necesarias\n');
  }
  
  if (!fs.existsSync(serviceAccountPath)) {
    console.log('2️⃣ OBTENER SERVICE ACCOUNT KEY:');
    console.log('   • Ve a Firebase Console > Project Settings > Service Accounts');
    console.log('   • Genera una nueva private key');
    console.log('   • Guarda el archivo como firebase-admin-key.json\n');
  }
} else {
  console.log('🎉 TODOS LOS ARCHIVOS ESTÁN PRESENTES\n');
  
  console.log('📋 PRÓXIMOS PASOS:');
  console.log('1️⃣ Configurar FIREBASE_PROJECT_ID en .env');
  console.log('2️⃣ Ejecutar: npm run firebase:verify');
  console.log('3️⃣ Probar endpoints de autenticación');
  console.log('4️⃣ Integrar con frontend Firebase SDK\n');
}

// Comandos útiles
console.log('🔧 COMANDOS ÚTILES:\n');
console.log('# Verificar integración Firebase');
console.log('npm run firebase:verify\n');

console.log('# Verificar toda la seguridad');  
console.log('npm run security:verify\n');

console.log('# Probar registro (después de configurar)');
console.log('curl -X POST http://localhost:3000/api/auth/register \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'{"email":"test@example.com","password":"Test123!","name":"Test"}\'\\n');

console.log('# Ver documentación completa');
console.log('cat FIREBASE_INTEGRATION.md\n');

console.log('🔥 Setup Helper completado\n');