#!/usr/bin/env node
/**
 * Find missing i18n keys by comparing actual usage with ES translations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read all keys used in code
const usedKeysFile = '/tmp/all-used-keys.txt';
const usedKeys = fs.readFileSync(usedKeysFile, 'utf8')
  .split('\n')
  .filter(Boolean)
  .filter(k => k.match(/^[a-z]+\.[a-z]/)); // Valid i18n keys only

console.log(`Found ${usedKeys.length} valid i18n keys in code\n`);

// Read i18n file
const i18nPath = path.join(__dirname, '..', 'src', 'lib', 'i18n.ts');
const content = fs.readFileSync(i18nPath, 'utf8');
const lines = content.split('\n');

// Find ES section
const esStart = lines.findIndex(l => l.trim() === 'es: {');
const esEnd = lines.findIndex((l, i) => i > esStart && l.includes('// FRENCH (FR)'));
const esSection = lines.slice(esStart, esEnd).join('\n');

console.log(`ES section: lines ${esStart + 1}-${esEnd + 1}\n`);

// Check each key
const missing = {};

usedKeys.forEach(key => {
  const escapedKey = key.replace(/\./g, '\\.');
  const regex = new RegExp(`['"]${escapedKey}['"]\\s*:`);
  
  if (!regex.test(esSection)) {
    // Group by prefix
    const prefix = key.split('.')[0];
    if (!missing[prefix]) missing[prefix] = [];
    missing[prefix].push(key);
  }
});

// Sort and display by prefix
const prefixes = Object.keys(missing).sort();
let totalMissing = 0;

console.log('❌ MISSING KEYS BY FEATURE:\n');
prefixes.forEach(prefix => {
  const keys = missing[prefix];
  totalMissing += keys.length;
  console.log(`\n## ${prefix.toUpperCase()} (${keys.length} keys):`);
  keys.slice(0, 20).forEach(k => console.log(`  - ${k}`));
  if (keys.length > 20) {
    console.log(`  ... and ${keys.length - 20} more`);
  }
});

console.log(`\n📊 TOTAL MISSING: ${totalMissing} keys across ${prefixes.length} features\n`);

// Save top priority missing keys (first 100)
const topMissing = [];
['common', 'nav', 'shows', 'calendar', 'finance', 'dashboard', 'travel', 'settings', 'crm'].forEach(prefix => {
  if (missing[prefix]) {
    topMissing.push(...missing[prefix].slice(0, 15));
  }
});

fs.writeFileSync(
  path.join(__dirname, 'priority-missing.txt'),
  topMissing.slice(0, 100).join('\n')
);

console.log(`📝 Saved top 100 priority keys to priority-missing.txt`);
