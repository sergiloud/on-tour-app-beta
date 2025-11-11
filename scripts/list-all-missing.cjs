const fs = require('fs');

const content = fs.readFileSync('src/lib/i18n.ts', 'utf-8');
const lines = content.split('\n');

function extractKeys(lang) {
  const keys = {};
  let inLang = false;
  let braceCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect start of language section
    if (line.trim().startsWith(`${lang}:`)) {
      inLang = true;
      braceCount = 0;
      continue;
    }
    
    if (!inLang) continue;
    
    // Count braces to know when section ends
    braceCount += (line.match(/\{/g) || []).length;
    braceCount -= (line.match(/\}/g) || []).length;
    
    // Extract key-value pairs
    const match = line.match(/'([^']+)'\s*:\s*'([^']*(?:\\'[^']*)*)'/);
    if (match) {
      keys[match[1]] = match[2].replace(/\\'/g, "'");
    }
    
    // If we close all braces, section ended
    if (inLang && braceCount < 0) {
      break;
    }
  }
  
  return keys;
}

const enKeys = extractKeys('en');
const esKeys = extractKeys('es');

const missing = [];
for (const key in enKeys) {
  if (!esKeys[key]) {
    missing.push({ key, value: enKeys[key] });
  }
}

console.log(`Total missing: ${missing.length}\n`);

// Group by prefix
const groups = {};
missing.forEach(({ key, value }) => {
  const prefix = key.split('.')[0];
  if (!groups[prefix]) groups[prefix] = [];
  groups[prefix].push({ key, value });
});

// Show grouped
Object.keys(groups).sort().forEach(prefix => {
  console.log(`\n## ${prefix.toUpperCase()} (${groups[prefix].length} keys)`);
  groups[prefix].slice(0, 10).forEach(({ key, value }) => {
    console.log(`  - ${key}: ${value.substring(0, 60)}${value.length > 60 ? '...' : ''}`);
  });
  if (groups[prefix].length > 10) {
    console.log(`  ... and ${groups[prefix].length - 10} more`);
  }
});

// Save full list to file
const fullList = missing.map(({ key, value }) => `${key}|${value}`).join('\n');
fs.writeFileSync('missing-es-full.txt', fullList);
console.log(`\n✅ Full list saved to missing-es-full.txt`);
