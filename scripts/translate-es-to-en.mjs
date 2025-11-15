#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';

const i18n = readFileSync('src/lib/i18n.ts', 'utf-8');

// Extract ES translations
const esMatch = i18n.match(/es:\s*{([\s\S]*?)},\s*\/\/\s*=+/);
const esSection = esMatch[1];

// Load missing keys
const lines = readFileSync('/tmp/missing-in-en-keys.txt', 'utf-8').split('\n');
const keys = lines.filter(l => l && !l.includes('Keys USED') && !l.includes('//') && /^[a-z]/.test(l.trim()));

console.log(`Processing ${keys.length} keys...`);

// Translation dictionary
const dict = {
  'Sin ': 'No ',
  'Añadir': 'Add',
  'Crear': 'Create',
  'Editar': 'Edit',
  'Eliminar': 'Delete',
  'Duplicar': 'Duplicate',
  'Cancelar': 'Cancel',
  'Guardar': 'Save',
  'Cerrar': 'Close',
  'Exportar': 'Export',
  'Importar': 'Import',
  'Mover': 'Move',
  'Copiar': 'Copy',
  'Resolver': 'Resolve',
  'Vincular': 'Link',
  'Total': 'Total',
  'Título': 'Title',
  'Subtítulo': 'Subtitle',
  'Descripción': 'Description',
  'elementos': 'items',
  'días': 'days',
  'semanas': 'weeks',
  'Feed de actividad': 'Activity Feed',
  'Actividad reciente': 'Recent activity',
  'Justo ahora': 'Just now',
  'Hecho': 'Done',
  'Entendido': 'Got it',
  'Invitar': 'Invite',
  'año': 'year',
  'mes': 'month',
  'precio': 'price',
  'origen': 'origin',
  'destino': 'dest',
  'caracteres': 'characters',
  'vs mes pasado': 'vs last month',
  'vs año pasado': 'vs last year',
  'Sin nombre': 'Unnamed',
  'show': 'show',
  'viaje': 'travel',
  'día': 'day',
  'Buenos días': 'Good morning',
  'Buenas tardes': 'Good afternoon',
  'Buenas noches': 'Good evening',
  'Nombre': 'Name',
  'Rol': 'Role',
  'Conexiones': 'Connections',
  'Facturación': 'Billing',
  'Branding': 'Branding',
  'Integraciones': 'Integrations',
  'Equipos': 'Teams',
  'Miembros': 'Members',
  'Documentos': 'Documents',
  'Enlaces': 'Links',
  'Informes': 'Reports',
  'Clientes': 'Clients',
  'selección': 'selection',
  'eventos': 'events',
  'evento': 'event',
  'creado': 'created',
  'campos personalizados': 'custom fields',
  'Conflictos': 'Conflicts',
  'dependencias': 'dependencies',
  'todo': 'all',
  'más': 'more',
  'Ver ': 'View ',
};

const results = [];

keys.forEach(key => {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`'${escapedKey}':\\s*'([^']*)'`);
  const match = esSection.match(regex);
  
  if (match) {
    let esValue = match[1];
    let enValue = esValue;
    
    // Apply dictionary
    for (const [es, en] of Object.entries(dict)) {
      enValue = enValue.replace(new RegExp(es, 'gi'), en);
    }
    
    results.push(`    , '${key}': '${enValue}'`);
  }
});

const output = results.join('\n');
writeFileSync('/tmp/new-en-keys.txt', output);
console.log(`✅ Generated ${results.length} translations`);
console.log('Preview:');
console.log(results.slice(0, 20).join('\n'));
