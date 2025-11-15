#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';

const content = readFileSync('src/lib/i18n.ts', 'utf-8');

// Extract ES section
const esMatch = content.match(/es:\s*{([\s\S]*?)},\s*\/\/\s*=+/);
const esSection = esMatch ? esMatch[1] : '';

// Load missing keys
const missingKeys = readFileSync('/tmp/missing-in-en-keys.txt', 'utf-8')
  .split('\n')
  .filter(line => line.trim().length > 0 && !line.includes('Keys USED') && !line.trim().startsWith('//'));

console.log(`Extracting ${missingKeys.length} ES translations to add to EN...`);

const translations = {};

// Extract each missing key from ES
missingKeys.forEach(key => {
  const regex = new RegExp(`'${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}':\\s*'([^']*)'`, 'g');
  const match = regex.exec(esSection);
  if (match) {
    translations[key] = match[1];
  }
});

// Simple translation map (ES -> EN) for common words
const simpleTranslations = {
  'Sin ': 'No ',
  'elementos': 'items',
  'Actividad reciente': 'Recent activity',
  'Feed de actividad': 'Activity Feed',
  'Ver todo': 'View all',
  'Añadir show': 'Add show',
  'Añadir viaje': 'Add travel',
  'Duplicar': 'Duplicate',
  'Editar': 'Edit',
  'Eliminar': 'Delete',
  'Ver día': 'View day',
  'Exportar': 'Export',
  'Importar': 'Import',
  'Cancelar': 'Cancel',
  'Guardar': 'Save',
  'Hecho': 'Done',
  'días': 'days',
  'Cerrar': 'Close',
  'Total': 'Total',
  'Título': 'Title',
  'Subtítulo': 'Subtitle',
  'Descripción': 'Description',
};

console.log('\nGenerating EN translations:\n');

const enTranslations = [];
Object.entries(translations).forEach(([key, esValue]) => {
  let enValue = esValue;
  
  // Apply simple translations
  Object.entries(simpleTranslations).forEach(([es, en]) => {
    enValue = enValue.replace(new RegExp(es, 'g'), en);
  });
  
  enTranslations.push(`    , '${key}': '${enValue}'`);
  console.log(`'${key}': '${enValue}'`);
});

writeFileSync('/tmp/new-en-translations.txt', enTranslations.join('\n'));
console.log(`\n✅ Generated ${enTranslations.length} EN translations`);
console.log('Saved to /tmp/new-en-translations.txt');
