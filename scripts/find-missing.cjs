const fs = require('fs');
const content = fs.readFileSync('src/lib/i18n.ts', 'utf-8');

// Extract keys from EN section (lines 126-1591)
const enSection = content.split('\n').slice(125, 1591).join('\n');
const enKeys = new Set();
const enMatches = enSection.matchAll(/'([^']+)'\s*:/g);
for (const match of enMatches) {
  enKeys.add(match[1]);
}

// Extract keys from ES section (lines 1592-2933) - updated boundary
const esSection = content.split('\n').slice(1591, 2933).join('\n');
const esKeys = new Set();
const esMatches = esSection.matchAll(/'([^']+)'\s*:/g);
for (const match of esMatches) {
  esKeys.add(match[1]);
}

// Find missing
const missing = [...enKeys].filter(k => !esKeys.has(k));

console.log(`EN: ${enKeys.size} keys`);
console.log(`ES: ${esKeys.size} keys`);
console.log(`Missing: ${missing.length} keys\n`);

if (missing.length > 0) {
  console.log('Missing keys:');
  missing.slice(0, 50).forEach(k => console.log(`  ${k}`));
  if (missing.length > 50) console.log(`  ... and ${missing.length - 50} more`);
}
