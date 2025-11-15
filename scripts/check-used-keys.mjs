#!/usr/bin/env node

import { readFileSync } from 'fs';

const content = readFileSync('src/lib/i18n.ts', 'utf-8');

// Extract EN keys
const enMatch = content.match(/en:\s*{([\s\S]*?)},\s*es:\s*{/);
const enSection = enMatch ? enMatch[1] : '';
const enKeys = [...enSection.matchAll(/'([^']+)':/g)].map(m => m[1]);

// Extract ES keys
const esMatch = content.match(/es:\s*{([\s\S]*?)},\s*\/\/\s*=+/);
const esSection = esMatch ? esMatch[1] : '';
const esKeys = [...esSection.matchAll(/'([^']+)':/g)].map(m => m[1]);

// Load used keys
const usedKeys = readFileSync('/tmp/real-keys.txt', 'utf-8')
  .split('\n')
  .map(k => k.trim())
  .filter(k => k.length > 0 && /^[a-z]/.test(k));

console.log('Keys used in code:', usedKeys.length);
console.log('Keys in EN:', enKeys.length);
console.log('Keys in ES:', esKeys.length);
console.log('');

// Find used keys missing in EN
const usedMissingEN = usedKeys.filter(k => !enKeys.includes(k));
console.log('Used keys MISSING in EN (' + usedMissingEN.length + '):');
usedMissingEN.slice(0, 30).forEach(k => console.log('  -', k));
if (usedMissingEN.length > 30) console.log('  ... and', usedMissingEN.length - 30, 'more');
console.log('');

// Find used keys missing in ES
const usedMissingES = usedKeys.filter(k => !esKeys.includes(k));
console.log('Used keys MISSING in ES (' + usedMissingES.length + '):');
usedMissingES.slice(0, 30).forEach(k => console.log('  -', k));
if (usedMissingES.length > 30) console.log('  ... and', usedMissingES.length - 30, 'more');
