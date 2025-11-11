#!/usr/bin/env node
/**
 * Find i18n keys used in code but not in i18n.ts (both EN and ES)
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

console.log('🔍 Finding real missing i18n keys...\n');

// Get all t('...') calls from source
const tCalls = execSync(
  `grep -rh "t('" src/ 2>/dev/null | grep -oE "t\\('[a-zA-Z0-9._-]+'" | sed "s/t('\\(.*\\)'/\\1/" | sort -u`,
  { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
).trim().split('\n').filter(Boolean);

console.log(`Found ${tCalls.length} unique t('...') calls in source code\n`);

// Read i18n file
const i18nPath = path.join(__dirname, '..', 'src', 'lib', 'i18n.ts');
const i18nContent = fs.readFileSync(i18nPath, 'utf8');

// Check each key
const missingInEN = [];
const missingInES = [];
const existsInBoth = [];

// Extract EN and ES sections
const lines = i18nContent.split('\n');
const enStart = lines.findIndex(l => l.trim() === 'en: {');
const esStart = lines.findIndex(l => l.trim() === 'es: {');
const esEnd = lines.findIndex((l, i) => i > esStart && l.includes('// FRENCH (FR)'));

const enSection = lines.slice(enStart, esStart).join('\n');
const esSection = lines.slice(esStart, esEnd).join('\n');

tCalls.forEach(key => {
  const escapedKey = key.replace(/\./g, '\\.');
  const regex = new RegExp(`['"]${escapedKey}['"]\\s*:`);
  
  const inEN = regex.test(enSection);
  const inES = regex.test(esSection);
  
  if (!inEN && !inES) {
    missingInEN.push(key);
    missingInES.push(key);
  } else if (!inEN) {
    missingInEN.push(key);
  } else if (!inES) {
    missingInES.push(key);
  } else {
    existsInBoth.push(key);
  }
});

console.log(`✅ Exists in both EN & ES: ${existsInBoth.length}`);
console.log(`⚠️  Missing from EN only: ${missingInEN.length}`);
console.log(`⚠️  Missing from ES only: ${missingInES.length}\n`);

if (missingInEN.length > 0 && missingInES.length > 0) {
  // Keys missing from both
  const missingBoth = missingInEN.filter(k => missingInES.includes(k));
  console.log(`❌ Missing from BOTH EN & ES (${missingBoth.length}):`);
  missingBoth.slice(0, 50).forEach(k => console.log(`  ${k}`));
  if (missingBoth.length > 50) {
    console.log(`  ... and ${missingBoth.length - 50} more`);
  }
}

if (missingInES.length > 0 && missingInES.length <= 100) {
  console.log(`\n❌ Missing from ES (${missingInES.length}):`);
  missingInES.forEach(k => console.log(`  ${k}`));
  
  // Save to file
  fs.writeFileSync(
    path.join(__dirname, 'missing-from-es.txt'),
    missingInES.join('\n')
  );
  console.log(`\n📝 Saved to missing-from-es.txt`);
}

if (missingInEN.length > 0 && missingInEN.length <= 100) {
  console.log(`\n❌ Missing from EN (${missingInEN.length}):`);
  missingInEN.forEach(k => console.log(`  ${k}`));
  
  // Save to file
  fs.writeFileSync(
    path.join(__dirname, 'missing-from-en.txt'),
    missingInEN.join('\n')
  );
  console.log(`\n📝 Saved to missing-from-en.txt`);
}
