const fs = require('fs');

const content = fs.readFileSync('src/lib/i18n.ts', 'utf-8');
const lines = content.split('\n');

function extractKeys(lang) {
  const keys = new Set();
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
    
    // Extract keys
    const match = line.match(/'([^']+)'\s*:/);
    if (match) {
      keys.add(match[1]);
    }
    
    // If we close all braces, section ended
    if (inLang && braceCount < 0) {
      break;
    }
  }
  
  return keys;
}

const languageKeys = {
  en: extractKeys('en'),
  es: extractKeys('es'),
  fr: extractKeys('fr'),
  de: extractKeys('de'),
  it: extractKeys('it'),
  pt: extractKeys('pt')
};

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
