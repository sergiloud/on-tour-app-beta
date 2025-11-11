const fs = require('fs');
const lines = fs.readFileSync('src/lib/i18n.ts', 'utf-8').split('\n');

const enKeys = new Set();
const esKeys = new Set();

// EN section: lines 126-1591
for (let i = 126; i <= 1591; i++) {
  const m = lines[i].match(/'([^']+)'\s*:/);
  if (m) enKeys.add(m[1]);
}

// ES section: lines 1592-2954
for (let i = 1592; i <= 2954; i++) {
  const m = lines[i].match(/'([^']+)'\s*:/);
  if (m) esKeys.add(m[1]);
}

const missing = [...enKeys].filter(k => !esKeys.has(k));

console.log(`Total EN: ${enKeys.size}`);
console.log(`Total ES: ${esKeys.size}`);
console.log(`Missing: ${missing.length} (${((esKeys.size/enKeys.size)*100).toFixed(1)}% coverage)\n`);

// Group by prefix
const groups = {};
missing.forEach(k => {
  const prefix = k.split('.')[0];
  if (!groups[prefix]) groups[prefix] = [];
  groups[prefix].push(k);
});

Object.keys(groups).sort().forEach(prefix => {
  console.log(`\n${prefix.toUpperCase()} (${groups[prefix].length} keys):`);
  groups[prefix].slice(0, 10).forEach(k => console.log(`  - ${k}`));
  if (groups[prefix].length > 10) {
    console.log(`  ... and ${groups[prefix].length - 10} more`);
  }
});
