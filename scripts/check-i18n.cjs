const fs = require('fs');

const content = fs.readFileSync('src/lib/i18n.ts', 'utf-8');
const lines = content.split('\n');

// Language sections based on grep findings
const sections = {
  en: [125, 1591],
  es: [1591, 2873],
  fr: [2876, 3125],
  de: [3128, 3377],
  it: [3380, 3629],
  pt: [3632, 3881]
};

function extractKeys(startLine, endLine) {
  const sectionContent = lines.slice(startLine, endLine).join('\n');
  const keys = new Set();
  const keyRegex = /'([^']+)'\s*:/g;
  let match;
  while ((match = keyRegex.exec(sectionContent)) !== null) {
    keys.add(match[1]);
  }
  return keys;
}

const languageKeys = {};
for (const [lang, [start, end]] of Object.entries(sections)) {
  languageKeys[lang] = extractKeys(start, end);
}

const enKeys = languageKeys.en;
console.log('📊 Translation Coverage Report\n');
console.log(`Total EN keys (reference): ${enKeys.size}\n`);

const results = [];
for (const [lang, keys] of Object.entries(languageKeys)) {
  if (lang === 'en') continue;
  
  const missing = [...enKeys].filter(k => !keys.has(k));
  const coverage = ((keys.size / enKeys.size) * 100).toFixed(1);
  
  results.push({ lang, total: keys.size, missing: missing.length, coverage, missingKeys: missing });
  
  const status = missing.length === 0 ? '✅' : missing.length < 100 ? '⚠️' : '❌';
  console.log(`${status} ${lang.toUpperCase()}: ${keys.size} keys (${coverage}% coverage)`);
  
  if (missing.length > 0) {
    console.log(`   Missing: ${missing.length} keys`);
    if (missing.length <= 10) {
      missing.forEach(k => console.log(`      - ${k}`));
    } else {
      console.log('   First 10 missing keys:');
      missing.slice(0, 10).forEach(k => console.log(`      - ${k}`));
      console.log(`      ... and ${missing.length - 10} more`);
    }
  }
  console.log('');
}

// Critical issues
console.log('\n⚠️  CRITICAL ISSUES:');
const criticalLangs = results.filter(r => r.missing > 50);
if (criticalLangs.length > 0) {
  criticalLangs.forEach(({ lang, missing, coverage }) => {
    console.log(`   - ${lang.toUpperCase()} is missing ${missing} translations (${coverage}% coverage)`);
  });
} else {
  console.log('   None!');
}

// Recommendations
console.log('\n💡 RECOMMENDATIONS:');
if (results.find(r => r.lang === 'es' && r.missing > 0)) {
  const esMissing = results.find(r => r.lang === 'es').missing;
  console.log(`   1. Complete Spanish (ES) first - only ${esMissing} keys missing`);
}
if (criticalLangs.length > 0) {
  console.log(`   2. Consider removing incomplete languages (FR, DE, IT, PT) or mark them as "beta"`);
  console.log(`   3. Use EN as fallback for missing translations (already implemented via t() function)`);
}
