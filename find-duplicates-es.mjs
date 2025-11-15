#!/usr/bin/env node

import { readFileSync } from 'fs';

const content = readFileSync('./src/lib/i18n.ts', 'utf-8');
const lines = content.split('\n');

// Extract keys with line numbers from ES section
function extractKeysWithLines(startLine, endLine) {
  const keyMap = new Map(); // key -> [line numbers]
  const keyRegex = /^\s*,\s*'([^']+)':\s*'/;
  
  for (let i = startLine - 1; i < endLine; i++) {
    const match = lines[i].match(keyRegex);
    if (match) {
      const key = match[1];
      if (!keyMap.has(key)) {
        keyMap.set(key, []);
      }
      keyMap.get(key).push(i + 1); // Line numbers are 1-indexed
    }
  }
  
  return keyMap;
}

console.log('Analyzing ES section (lines 1975-4003)...\n');
const esKeyMap = extractKeysWithLines(1975, 4003);

// Find duplicates
const duplicates = [];
for (const [key, lineNumbers] of esKeyMap.entries()) {
  if (lineNumbers.length > 1) {
    duplicates.push({ key, lines: lineNumbers });
  }
}

console.log(`Found ${duplicates.length} duplicate keys in ES:\n`);
duplicates.sort((a, b) => a.key.localeCompare(b.key));

for (const { key, lines } of duplicates) {
  console.log(`  ${key}`);
  console.log(`    Lines: ${lines.join(', ')}`);
  // Show the values
  for (const line of lines) {
    const content = lines[line - 1] || '';
    console.log(`      L${line}: ${content.trim().substring(0, 60)}...`);
  }
  console.log();
}
