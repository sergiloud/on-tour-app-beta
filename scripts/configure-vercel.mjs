#!/usr/bin/env node

/**
 * Script para configurar automáticamente las variables de entorno en Vercel
 * usando la REST API de Vercel
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Leer token de Vercel
let token;
try {
  // Intentar ambas ubicaciones posibles
  let authPath = join(homedir(), '.config/vercel/auth.json');
  try {
    readFileSync(authPath);
  } catch {
    authPath = join(homedir(), 'Library/Application Support/com.vercel.cli/auth.json');
  }
  
  const authFile = readFileSync(authPath, 'utf-8');
  token = JSON.parse(authFile).token;
} catch (error) {
  console.error('❌ No se pudo leer el token de Vercel.');
  console.error('   Ejecuta: vercel login');
  process.exit(1);
}

// Leer credenciales de Firebase
const firebaseKey = JSON.parse(
  readFileSync(join(rootDir, 'firebase-admin-key.json'), 'utf-8')
);

const PROJECT_NAME = 'on-tour-app-beta';

// Función para hacer request a Vercel API
async function vercelAPI(endpoint, method = 'GET', body = null) {
  const url = `https://api.vercel.com${endpoint}`;
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Vercel API error: ${response.status} - ${error}`);
  }
  
  return response.json();
}

// Obtener lista de proyectos
async function getProjectId() {
  const projects = await vercelAPI('/v9/projects');
  const project = projects.projects.find(p => p.name === PROJECT_NAME);
  
  if (!project) {
    throw new Error(`Proyecto "${PROJECT_NAME}" no encontrado`);
  }
  
  return project.id;
}

// Crear o actualizar variable de entorno
async function setEnvVar(projectId, key, value, target = ['production', 'preview', 'development']) {
  console.log(`📝 Configurando ${key}...`);
  
  try {
    // Primero intentar eliminar si existe
    await vercelAPI(`/v9/projects/${projectId}/env/${key}`, 'DELETE').catch(() => {});
    
    // Crear nueva variable
    await vercelAPI(`/v9/projects/${projectId}/env`, 'POST', {
      key,
      value,
      target,
      type: 'encrypted',
    });
    
    console.log(`✅ ${key} configurada correctamente`);
  } catch (error) {
    console.error(`❌ Error configurando ${key}:`, error.message);
    throw error;
  }
}

// Main
async function main() {
  console.log('\n🚀 Configurando variables de entorno en Vercel...\n');
  
  try {
    const projectId = await getProjectId();
    console.log(`✅ Proyecto encontrado: ${PROJECT_NAME} (${projectId})\n`);
    
    // Configurar las 3 variables
    await setEnvVar(projectId, 'FIREBASE_PROJECT_ID', firebaseKey.project_id);
    await setEnvVar(projectId, 'FIREBASE_CLIENT_EMAIL', firebaseKey.client_email);
    await setEnvVar(projectId, 'FIREBASE_PRIVATE_KEY', firebaseKey.private_key);
    
    console.log('\n✅ Todas las variables configuradas correctamente!\n');
    console.log('🔄 Ahora necesitas hacer un redeploy en Vercel:');
    console.log('   https://vercel.com/sergi-9177/on-tour-app-beta\n');
    console.log('   O ejecuta: vercel --prod\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
