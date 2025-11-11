#!/usr/bin/env node
/**
 * Check which keys from a list already exist in ES section of i18n.ts
 */

const fs = require('fs');
const path = require('path');

// Keys from screenshots and code scan that we want to add
const keysToCheck = [
  // From screenshots (PRIORITY)
  'nav.contacts',
  'nav.members',
  'shows.stats.overview',
  'shows.stats.filtered',
  'shows.stats.totalFees',
  'shows.stats.estNet',
  'shows.stats.avgWht',
  'shows.stats.avgMargin',
  'shows.board.title',
  'shows.board.dragHint',
  'shows.filters.title',
  'shows.filters.all',
  'shows.filters.upcoming',
  'shows.filters.dateRange',
  'shows.filters.feeRange',
  'shows.filters.highValue',
  'shows.filters.quickFilters',
  'shows.filters.thisMonth',
  // Additional shows.* keys
  'shows.archive',
  'shows.delete',
  'shows.duplicate',
  'shows.search',
  'shows.sort.date',
  'shows.sort.fee',
  'shows.sort.venue',
  'shows.empty.title',
  'shows.empty.description',
  'shows.empty.action',
];

const i18nPath = path.join(__dirname, '..', 'src', 'lib', 'i18n.ts');
const content = fs.readFileSync(i18nPath, 'utf8');

// Extract ES section (lines 1592-3093 approx)
const lines = content.split('\n');
const esStart = lines.findIndex(l => l.trim() === 'es: {');
// Find end by looking for the next language section marker
const esEnd = lines.findIndex((l, i) => i > esStart && l.includes('// FRENCH (FR)'));

if (esStart === -1 || esEnd === -1) {
  console.error('Could not find ES section boundaries');
  console.error(`esStart: ${esStart}, esEnd: ${esEnd}`);
  process.exit(1);
}

const esSection = lines.slice(esStart, esEnd + 1).join('\n');

console.log(`ES section: lines ${esStart}-${esEnd}`);
console.log(`Checking ${keysToCheck.length} keys...\n`);

const missing = [];
const existing = [];

keysToCheck.forEach(key => {
  // Check if key exists in ES section
  const regex = new RegExp(`['"]${key.replace(/\./g, '\\.')}['"]\\s*:`);
  if (regex.test(esSection)) {
    existing.push(key);
  } else {
    missing.push(key);
  }
});

console.log(`✅ Existing in ES (${existing.length}):`);
existing.forEach(k => console.log(`  ${k}`));

console.log(`\n❌ Missing from ES (${missing.length}):`);
missing.forEach(k => console.log(`  ${k}`));

// Write missing keys to file
fs.writeFileSync(
  path.join(__dirname, 'truly-missing-keys.txt'),
  missing.join('\n')
);

console.log(`\n📝 Wrote ${missing.length} missing keys to truly-missing-keys.txt`);
