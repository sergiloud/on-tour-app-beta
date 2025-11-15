#!/usr/bin/env node

import { readFileSync } from 'fs';

const content = readFileSync('./src/lib/i18n.ts', 'utf-8');
const lines = content.split('\n');

// Extract keys from a section
function extractKeys(startLine, endLine) {
  const keys = new Set();
  // Key patterns: , 'key': 'value' OR 'key': 'value' (first key has no comma)
  const keyRegex = /^\s*,?\s*'([^']+)':\s*'/;
  
  for (let i = startLine - 1; i < endLine; i++) {
    const match = lines[i].match(keyRegex);
    if (match) {
      keys.add(match[1]);
    }
  }
  
  return keys;
}

console.log('Extracting EN keys (lines 125-1973)...');
const enKeys = extractKeys(125, 1973);

console.log('Extracting ES keys (lines 1975-3957)...');
const esKeys = extractKeys(1975, 3957);

console.log(`\n📊 Stats:`);
console.log(`EN keys: ${enKeys.size}`);
console.log(`ES keys: ${esKeys.size}`);

// Find missing in ES
const missingInES = [...enKeys].filter(k => !esKeys.has(k));

// Find extra in ES (not in EN)
const extraInES = [...esKeys].filter(k => !enKeys.has(k));

console.log(`\n❌ Missing in ES: ${missingInES.length}`);
if (missingInES.length > 0) {
  console.log('\nMissing keys:');
  missingInES.sort().forEach(k => console.log(`  - ${k}`));
}

console.log(`\n➕ Extra in ES (not in EN): ${extraInES.length}`);
if (extraInES.length > 0 && extraInES.length < 50) {
  console.log('\nExtra keys:');
  extraInES.sort().forEach(k => console.log(`  - ${k}`));
}
