#!/usr/bin/env node

/**
 * Script para configurar variables de entorno en Vercel
 * usando las credenciales de firebase-admin-key.json
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Leer credenciales de Firebase
const firebaseKey = JSON.parse(
  readFileSync(join(rootDir, 'firebase-admin-key.json'), 'utf-8')
);

const projectId = firebaseKey.project_id;
const clientEmail = firebaseKey.client_email;
const privateKey = firebaseKey.private_key;

console.log('\n🔧 Configuración de variables de entorno para Vercel\n');
console.log('Proyecto Firebase:', projectId);
console.log('Client Email:', clientEmail);
console.log('\n📋 Copia estas variables en Vercel Dashboard:\n');
console.log('https://vercel.com/sergi-9177/on-tour-app-beta/settings/environment-variables\n');
console.log('──────────────────────────────────────────────────────────────\n');

console.log('Variable 1:');
console.log('Name: FIREBASE_PROJECT_ID');
console.log('Value:', projectId);
console.log('Environment: Production, Preview, Development');
console.log('\n──────────────────────────────────────────────────────────────\n');

console.log('Variable 2:');
console.log('Name: FIREBASE_CLIENT_EMAIL');
console.log('Value:', clientEmail);
console.log('Environment: Production, Preview, Development');
console.log('\n──────────────────────────────────────────────────────────────\n');

console.log('Variable 3:');
console.log('Name: FIREBASE_PRIVATE_KEY');
console.log('Value:');
console.log(privateKey);
console.log('Environment: Production, Preview, Development');
console.log('\n──────────────────────────────────────────────────────────────\n');

console.log('⚠️  IMPORTANTE:');
console.log('   - Copia FIREBASE_PRIVATE_KEY exactamente como aparece arriba');
console.log('   - Incluye los \\n (Vercel los interpreta correctamente)');
console.log('   - Marca todas las opciones de Environment (Production, Preview, Development)');
console.log('   - Después de guardar las 3 variables, haz Redeploy\n');

// También guardar en archivo .env.local para referencia
const envContent = `# Firebase Admin SDK - Para Vercel Serverless Functions
FIREBASE_PROJECT_ID=${projectId}
FIREBASE_CLIENT_EMAIL=${clientEmail}
FIREBASE_PRIVATE_KEY="${privateKey}"
`;

console.log('✅ Variables también guardadas en .env.local para desarrollo local\n');
import { writeFileSync } from 'fs';
writeFileSync(join(rootDir, '.env.local'), envContent);
