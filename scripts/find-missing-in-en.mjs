#!/usr/bin/env node

import { readFileSync } from 'fs';

const content = readFileSync('src/lib/i18n.ts', 'utf-8');

const enMatch = content.match(/en:\s*{([\s\S]*?)},\s*es:\s*{/);
const enSection = enMatch ? enMatch[1] : '';
const enKeys = [...enSection.matchAll(/'([^']+)':/g)].map(m => m[1]);

const esMatch = content.match(/es:\s*{([\s\S]*?)},\s*\/\/\s*=+/);
const esSection = esMatch ? esMatch[1] : '';
const esKeys = [...esSection.matchAll(/'([^']+)':/g)].map(m => m[1]);

const usedKeys = readFileSync('/tmp/real-keys.txt', 'utf-8')
  .split('\n')
  .map(k => k.trim())
  .filter(k => k.length > 0 && /^[a-z]/.test(k));

const usedMissingEN = usedKeys.filter(k => !enKeys.includes(k));

// Only show keys that exist in ES but missing in EN
const missingInEN = usedMissingEN.filter(k => esKeys.includes(k));

console.log('Keys USED in code, exist in ES, but MISSING in EN:', missingInEN.length);
console.log('');
missingInEN.forEach(k => console.log(k));
