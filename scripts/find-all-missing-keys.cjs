const fs = require('fs');
const { execSync } = require('child_process');

// Extract all i18n keys from source code
const usedKeys = new Set();

try {
  const grepResult = execSync(
    `grep -r "t('" src/ --include="*.tsx" --include="*.ts" | grep -o "t('[^']*')" | grep -o "'[^']*'" | sed "s/'//g"`,
    { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
  );
  
  grepResult.split('\n').forEach(key => {
    if (key.trim()) usedKeys.add(key.trim());
  });
} catch (e) {
  // Continue with alternative patterns
}

// Also search for direct key references
try {
  const directKeys = execSync(
    `grep -rE "['\\\"]([a-z]+\\.)+[a-zA-Z.]+['\\\"]" src/ --include="*.tsx" --include="*.ts" | grep -oE "[a-z]+\\.[a-zA-Z.]+" | sort -u`,
    { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
  );
  
  directKeys.split('\n').forEach(key => {
    if (key.trim() && key.includes('.')) {
      // Filter only likely i18n keys
      const prefix = key.split('.')[0];
      if (['nav', 'shows', 'calendar', 'finance', 'common', 'settings', 'auth', 'error', 'validation'].includes(prefix)) {
        usedKeys.add(key.trim());
      }
    }
  });
} catch (e) {
  // Continue
}

// Load existing keys from i18n.ts
const i18nContent = fs.readFileSync('src/lib/i18n.ts', 'utf-8');
const lines = i18nContent.split('\n');

const existingKeys = new Set();

// ES section: lines 1592-3093
for (let i = 1592; i <= 3093; i++) {
  const m = lines[i].match(/'([^']+)'\s*:/);
  if (m) existingKeys.add(m[1]);
}

// Find missing keys
const missing = [...usedKeys].filter(k => !existingKeys.has(k));

console.log(`Total keys used in code: ${usedKeys.size}`);
console.log(`Total keys in ES i18n: ${existingKeys.size}`);
console.log(`Missing keys: ${missing.length}\n`);

if (missing.length > 0) {
  // Group by prefix
  const groups = {};
  missing.forEach(key => {
    const prefix = key.split('.')[0];
    if (!groups[prefix]) groups[prefix] = [];
    groups[prefix].push(key);
  });

  Object.keys(groups).sort().forEach(prefix => {
    console.log(`\n## ${prefix.toUpperCase()} (${groups[prefix].length} keys):`);
    groups[prefix].sort().forEach(k => console.log(`  - ${k}`));
  });

  fs.writeFileSync('missing-keys-used-in-code.txt', missing.sort().join('\n'));
  console.log(`\n✅ Full list saved to missing-keys-used-in-code.txt`);
}
