#!/usr/bin/env node

import { readFileSync } from 'fs';

const content = readFileSync('src/lib/i18n.ts', 'utf-8');

// Extract EN keys - from "en: {" to "},\n  es: {"
const enMatch = content.match(/en:\s*{([\s\S]*?)},\s*es:\s*{/);
const enSection = enMatch ? enMatch[1] : '';
const enKeys = [...enSection.matchAll(/'([^']+)':/g)].map(m => m[1]);

// Extract ES keys - from "es: {" to "},\n  // ===" or "},\n  fr: {"
const esMatch = content.match(/es:\s*{([\s\S]*?)},\s*\/\/\s*=+/);
const esSection = esMatch ? esMatch[1] : '';
const esKeys = [...esSection.matchAll(/'([^']+)':/g)].map(m => m[1]);

console.log('EN keys:', enKeys.length);
console.log('ES keys:', esKeys.length);

// Find missing in ES
const esSet = new Set(esKeys);
const missingInES = enKeys.filter(k => !esSet.has(k));

console.log(`\nMissing in ES (${missingInES.length}):`);
if (missingInES.length > 0) {
  missingInES.slice(0, 100).forEach(k => console.log('  -', k));
  if (missingInES.length > 100) {
    console.log(`  ... and ${missingInES.length - 100} more`);
  }
} else {
  console.log('  ✅ None! ES has all EN keys.');
}

// Find extra in ES (not in EN)
const enSet = new Set(enKeys);
const extraInES = esKeys.filter(k => !enSet.has(k));

console.log(`\nExtra in ES (${extraInES.length}):`);
if (extraInES.length > 0) {
  extraInES.slice(0, 50).forEach(k => console.log('  +', k));
  if (extraInES.length > 50) {
    console.log(`  ... and ${extraInES.length - 50} more`);
  }
}
