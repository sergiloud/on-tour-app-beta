#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Read keys to check
const keysFile = process.argv[2] || '/tmp/check-keys.txt';
const keys = fs.readFileSync(keysFile, 'utf8').split('\n').filter(Boolean);

// Read i18n file
const i18nPath = path.join(__dirname, '..', 'src', 'lib', 'i18n.ts');
const content = fs.readFileSync(i18nPath, 'utf8');
const lines = content.split('\n');

// Find ES section
const esStart = lines.findIndex(l => l.trim() === 'es: {');
const esEnd = lines.findIndex((l, i) => i > esStart && l.includes('// FRENCH (FR)'));
const esSection = lines.slice(esStart, esEnd).join('\n');

const missing = [];
const existing = [];

keys.forEach(key => {
  const escapedKey = key.replace(/\./g, '\\.');
  const regex = new RegExp(`['"]${escapedKey}['"]\\s*:`);
  
  if (regex.test(esSection)) {
    existing.push(key);
  } else {
    missing.push(key);
  }
});

console.log(`✅ Ya existen en ES: ${existing.length}`);
existing.forEach(k => console.log(`  ${k}`));

console.log(`\n❌ Faltan en ES: ${missing.length}`);
missing.forEach(k => console.log(`  ${k}`));

// Save missing keys
fs.writeFileSync('/tmp/truly-missing-shows.txt', missing.join('\n'));
console.log(`\n📝 Guardadas ${missing.length} claves faltantes en /tmp/truly-missing-shows.txt`);
