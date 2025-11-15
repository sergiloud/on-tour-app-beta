import { readFileSync } from 'fs';

const i18n = readFileSync('src/lib/i18n.ts', 'utf8');

// Extract EN section
const enStart = i18n.indexOf("en: {");
const esStart = i18n.indexOf(", es: {");
const enSection = i18n.substring(enStart + 5, esStart);

// Extract ES section  
const frStart = i18n.indexOf(", fr: {");
const esSection = i18n.substring(esStart + 7, frStart);

// Extract all keys from each section
const extractKeys = (text) => {
  const keys = [];
  const regex = /'([^']+)':/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    keys.push(match[1]);
  }
  return keys;
};

const enKeys = extractKeys(enSection);
const esKeys = extractKeys(esSection);

const missingInEs = enKeys.filter(k => !esKeys.includes(k));
const missingInEn = esKeys.filter(k => !enKeys.includes(k));

console.log(`✅ EN keys: ${enKeys.length}`);
console.log(`✅ ES keys: ${esKeys.length}`);
console.log(`\n❌ Missing in ES: ${missingInEs.length}`);

if (missingInEs.length > 0) {
  console.log('\nFirst 100 missing keys in ES:');
  missingInEs.slice(0, 100).forEach((key, i) => {
    console.log(`${i + 1}. '${key}'`);
  });
}

console.log(`\n⚠️  Keys in ES not in EN: ${missingInEn.length}`);
if (missingInEn.length > 0) {
  console.log('\nKeys only in ES (should review):');
  missingInEn.slice(0, 20).forEach(key => {
    console.log(`  - '${key}'`);
  });
}
