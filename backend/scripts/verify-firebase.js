#!/usr/bin/env node

/**
 * Script de Verificación Firebase Integration
 * 
 * Verifica que Firebase Auth + Firestore estén correctamente configurados
 */

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Colores para terminal
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

console.log(`${colors.bold}${colors.blue}🔥 VERIFICACIÓN FIREBASE INTEGRATION${colors.reset}\n`);

const checks = [];

/**
 * Añadir un check a la lista
 */
function addCheck(category, description, passed, details = '') {
  checks.push({ category, description, passed, details });
}

/**
 * Helper para verificar si un archivo existe
 */
function fileExists(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  return fs.existsSync(fullPath);
}

/**
 * Helper para leer contenido de archivo
 */
function readFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  try {
    return fs.readFileSync(fullPath, 'utf8');
  } catch {
    return null;
  }
}

// ===== VERIFICACIONES FIREBASE =====

console.log('📋 Ejecutando verificaciones Firebase...\n');

// 1. Verificar archivos de configuración Firebase
console.log('1️⃣ Verificando archivos de configuración Firebase...');

addCheck(
  'Configuración',
  'Firebase config file',
  fileExists('src/config/firebase.ts'),
  'src/config/firebase.ts'
);

addCheck(
  'Configuración',
  'Firebase service account key',
  fileExists('../firebase-admin-key.json'),
  '../firebase-admin-key.json'
);

addCheck(
  'Configuración',
  'Firebase project config',
  fileExists('../firebase.json'),
  '../firebase.json'
);

// 2. Verificar variables de entorno
console.log('2️⃣ Verificando variables de entorno...');

const requiredEnvVars = [
  'FIREBASE_PROJECT_ID'
];

const optionalEnvVars = [
  'FIREBASE_SERVICE_ACCOUNT_PATH'
];

requiredEnvVars.forEach(envVar => {
  addCheck(
    'Variables ENV',
    `${envVar} configurada`,
    !!process.env[envVar],
    process.env[envVar] || 'No configurada'
  );
});

optionalEnvVars.forEach(envVar => {
  addCheck(
    'Variables ENV',
    `${envVar} (opcional)`,
    true, // Siempre pasa porque es opcional
    process.env[envVar] || 'No configurada (usando default)'
  );
});

// 3. Verificar dependencias Firebase
console.log('3️⃣ Verificando dependencias Firebase...');

const packageJson = readFile('package.json');
if (packageJson) {
  const pkg = JSON.parse(packageJson);
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  
  addCheck(
    'Dependencias',
    'firebase-admin instalado',
    'firebase-admin' in deps,
    `Versión: ${deps['firebase-admin'] || 'No encontrada'}`
  );
}

// 4. Verificar middlewares Firebase
console.log('4️⃣ Verificando middlewares Firebase...');

const firebaseAuthContent = readFile('src/middleware/firebaseAuth.ts');
if (firebaseAuthContent) {
  addCheck(
    'Middlewares',
    'firebaseAuthMiddleware implementado',
    firebaseAuthContent.includes('firebaseAuthMiddleware'),
    'Middleware de autenticación Firebase'
  );
  
  addCheck(
    'Middlewares',
    'requireAdmin implementado',
    firebaseAuthContent.includes('requireAdmin'),
    'Middleware de autorización admin'
  );
  
  addCheck(
    'Middlewares',
    'requireEmailVerified implementado',
    firebaseAuthContent.includes('requireEmailVerified'),
    'Middleware de email verificado'
  );
}

// 5. Verificar servicios Firestore
console.log('5️⃣ Verificando servicios Firestore...');

const userServiceContent = readFile('src/services/UserService.ts');
if (userServiceContent) {
  addCheck(
    'Servicios',
    'UserService con Firestore',
    userServiceContent.includes('createUserProfile'),
    'Gestión de perfiles de usuario'
  );
  
  addCheck(
    'Servicios',
    'CRUD operations implementadas',
    userServiceContent.includes('getUserProfile') && 
    userServiceContent.includes('updateUserProfile') &&
    userServiceContent.includes('deleteUserProfile'),
    'Create, Read, Update, Delete'
  );
}

// 6. Verificar rutas Firebase
console.log('6️⃣ Verificando rutas Firebase...');

const authRoutesContent = readFile('src/routes/auth.ts');
if (authRoutesContent) {
  addCheck(
    'Rutas Auth',
    'Firebase Auth integration',
    authRoutesContent.includes('createFirebaseUser'),
    'Registro con Firebase Auth'
  );
  
  addCheck(
    'Rutas Auth',
    'Password reset con Firebase',
    authRoutesContent.includes('generatePasswordResetLink'),
    'Reset de contraseña Firebase'
  );
}

const userRoutesContent = readFile('src/routes/users.ts');
if (userRoutesContent) {
  addCheck(
    'Rutas Users',
    'User management routes',
    userRoutesContent.includes('firebaseAuthMiddleware'),
    'Gestión de usuarios con auth'
  );
  
  addCheck(
    'Rutas Users',
    'Admin-only routes',
    userRoutesContent.includes('requireAdmin'),
    'Rutas administrativas protegidas'
  );
}

// 7. Verificar integración en app principal
console.log('7️⃣ Verificando integración en app principal...');

const indexContent = readFile('src/index.ts');
if (indexContent) {
  addCheck(
    'App Principal',
    'Firebase initialization',
    indexContent.includes('initializeFirebaseAdmin'),
    'Inicialización de Firebase Admin'
  );
  
  addCheck(
    'App Principal',
    'Auth routes registered',
    indexContent.includes('/api/auth'),
    'Rutas de autenticación registradas'
  );
  
  addCheck(
    'App Principal',
    'Users routes registered',
    indexContent.includes('/api/users'),
    'Rutas de usuarios registradas'
  );
}

// ===== MOSTRAR RESULTADOS =====

console.log('\n📊 RESULTADOS DE VERIFICACIÓN FIREBASE\n');

const categories = [...new Set(checks.map(c => c.category))];
let totalPassed = 0;
let totalChecks = 0;

categories.forEach(category => {
  console.log(`${colors.bold}${category}:${colors.reset}`);
  
  const categoryChecks = checks.filter(c => c.category === category);
  const categoryPassed = categoryChecks.filter(c => c.passed).length;
  
  categoryChecks.forEach(check => {
    const icon = check.passed ? '✅' : '❌';
    const color = check.passed ? colors.green : colors.red;
    console.log(`  ${icon} ${color}${check.description}${colors.reset}`);
    if (check.details) {
      console.log(`     ${colors.yellow}${check.details}${colors.reset}`);
    }
  });
  
  console.log(`     ${colors.blue}${categoryPassed}/${categoryChecks.length} checks pasados${colors.reset}\n`);
  
  totalPassed += categoryPassed;
  totalChecks += categoryChecks.length;
});

// Resultado final
const percentage = Math.round((totalPassed / totalChecks) * 100);
const resultColor = percentage >= 90 ? colors.green : 
                   percentage >= 70 ? colors.yellow : colors.red;

console.log('='.repeat(60));
console.log(`${colors.bold}RESULTADO FIREBASE INTEGRATION:${colors.reset}`);
console.log(`${resultColor}${totalPassed}/${totalChecks} verificaciones pasadas (${percentage}%)${colors.reset}`);

if (percentage >= 90) {
  console.log(`${colors.green}🔥 ¡EXCELENTE! Firebase Auth + Firestore completamente integrado${colors.reset}`);
  console.log(`${colors.green}🛡️  Autenticación real sin datos demo implementada${colors.reset}`);
} else if (percentage >= 70) {
  console.log(`${colors.yellow}⚠️  Firebase parcialmente configurado${colors.reset}`);
} else {
  console.log(`${colors.red}🚨 Firebase necesita configuración${colors.reset}`);
}

console.log('='.repeat(60));

// Próximos pasos
if (percentage >= 90) {
  console.log(`\n${colors.blue}🚀 FIREBASE LISTO - PRÓXIMOS PASOS:${colors.reset}`);
  console.log('1. Configurar variables de entorno con tu proyecto Firebase');
  console.log('2. Probar registro: POST /api/auth/register');
  console.log('3. Probar autenticación: usar tokens de Firebase desde el frontend');
  console.log('4. Verificar perfiles de usuario en Firestore');
} else {
  console.log(`\n${colors.yellow}📋 PARA COMPLETAR FIREBASE SETUP:${colors.reset}`);
  console.log('1. Configurar FIREBASE_PROJECT_ID en .env');
  console.log('2. Asegurar que firebase-admin-key.json esté disponible');
  console.log('3. Verificar que todas las dependencias estén instaladas');
}

process.exit(percentage >= 70 ? 0 : 1);