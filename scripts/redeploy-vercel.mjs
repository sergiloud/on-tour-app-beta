#!/usr/bin/env node

/**
 * Script para triggerar un redeploy en Vercel via API
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

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

async function triggerRedeploy() {
  console.log('\n🔄 Triggering redeploy en Vercel...\n');
  
  try {
    // Obtener último deployment
    const deployments = await vercelAPI(`/v6/deployments?projectId=${PROJECT_ID}&limit=1`);
    
    if (!deployments.deployments || deployments.deployments.length === 0) {
      throw new Error('No se encontraron deployments');
    }
    
    const latestDeployment = deployments.deployments[0];
    console.log(`📦 Último deployment: ${latestDeployment.url}`);
    
    // Crear nuevo deployment (redeploy)
    const newDeployment = await vercelAPI(`/v13/deployments`, 'POST', {
      name: 'on-tour-app-beta',
      gitSource: {
        type: 'github',
        repo: 'sergiloud/on-tour-app-beta',
        ref: 'main',
      },
      target: 'production',
    });
    
    console.log(`✅ Redeploy iniciado: ${newDeployment.url}`);
    console.log(`🔗 Ver progreso: https://vercel.com/sergi-9177/on-tour-app-beta\n`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n💡 Solución alternativa:');
    console.log('   1. Ve a https://vercel.com/sergi-9177/on-tour-app-beta');
    console.log('   2. Click en "Deployments"');
    console.log('   3. Click en el último deployment');
    console.log('   4. Click en "..." → "Redeploy"\n');
  }
}

triggerRedeploy();
