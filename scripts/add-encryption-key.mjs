#!/usr/bin/env node

/**
 * Script para añadir solo CALENDAR_ENCRYPTION_KEY a Vercel
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { randomBytes } from 'crypto';

// Leer token de Vercel
let token;
try {
  let authPath = join(homedir(), 'Library/Application Support/com.vercel.cli/auth.json');
  const authFile = readFileSync(authPath, 'utf-8');
  token = JSON.parse(authFile).token;
} catch (error) {
  console.error('❌ No se pudo leer el token de Vercel.');
  process.exit(1);
}

const PROJECT_ID = 'prj_7wyanFinvidWaVTBpV8mhy4oaqP8';

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

async function setEncryptionKey() {
  console.log('\n🔐 Configurando CALENDAR_ENCRYPTION_KEY en Vercel...\n');
  
  try {
    // Generar clave de encriptación
    const encryptionKey = randomBytes(32).toString('hex');
    console.log(`🔑 Clave generada: ${encryptionKey}\n`);
    
    // Intentar crear la variable
    try {
      await vercelAPI(`/v9/projects/${PROJECT_ID}/env`, 'POST', {
        key: 'CALENDAR_ENCRYPTION_KEY',
        value: encryptionKey,
        target: ['production', 'preview', 'development'],
        type: 'encrypted',
      });
      
      console.log('✅ CALENDAR_ENCRYPTION_KEY configurada correctamente!\n');
    } catch (err) {
      if (err.message.includes('ENV_ALREADY_EXISTS')) {
        console.log('ℹ️  CALENDAR_ENCRYPTION_KEY ya existe en Vercel\n');
        console.log('💡 Si necesitas actualizarla:');
        console.log('   1. Ve a https://vercel.com/sergi-9177/on-tour-app-beta/settings/environment-variables');
        console.log('   2. Elimina CALENDAR_ENCRYPTION_KEY');
        console.log('   3. Ejecuta este script de nuevo\n');
      } else {
        throw err;
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

setEncryptionKey();
