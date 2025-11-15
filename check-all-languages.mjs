#!/usr/bin/env node

import { readFileSync } from 'fs';

const content = readFileSync('./src/lib/i18n.ts', 'utf-8');
const lines = content.split('\n');

// Find section boundaries
const sections = {
  en: { start: 125, end: 1973 },
  es: { start: 1975, end: 3953 },
  fr: { start: 3959, end: null },
  de: { start: null, end: null },
  it: { start: null, end: null },
  pt: { start: null, end: null }
};

// Find FR, DE, IT, PT sections
for (let i = 3959; i < lines.length; i++) {
  if (lines[i].includes('de: {')) {
    sections.fr.end = i - 1;
    sections.de.start = i + 2;
  } else if (lines[i].includes('it: {')) {
    sections.de.end = i - 1;
    sections.it.start = i + 2;
  } else if (lines[i].includes('pt: {')) {
    sections.it.end = i - 1;
    sections.pt.start = i + 2;
  } else if (lines[i] === '};' && sections.pt.start && !sections.pt.end) {
    sections.pt.end = i - 1;
    break;
  }
}

console.log('Section boundaries:');
Object.entries(sections).forEach(([lang, {start, end}]) => {
  console.log(`  ${lang.toUpperCase()}: lines ${start}-${end}`);
});

// Extract keys from a section
function extractKeys(startLine, endLine) {
  const keys = new Set();
  const keyRegex = /^\s*,?\s*'([^']+)':\s*'/;
  
  for (let i = startLine - 1; i < endLine; i++) {
    const match = lines[i].match(keyRegex);
    if (match) {
      keys.add(match[1]);
    }
  }
  
  return keys;
}

// Extract keys for all languages
const keysByLang = {};
for (const [lang, {start, end}] of Object.entries(sections)) {
  if (start && end) {
    keysByLang[lang] = extractKeys(start, end);
  }
}

// Compare all languages against EN
const enKeys = keysByLang.en;

console.log('\n📊 Translation Coverage:\n');
for (const [lang, keys] of Object.entries(keysByLang)) {
  if (lang === 'en') continue;
  
  const missing = [...enKeys].filter(k => !keys.has(k));
  const extra = [...keys].filter(k => !enKeys.has(k));
  const coverage = ((enKeys.size - missing.length) / enKeys.size * 100).toFixed(1);
  
  console.log(`${lang.toUpperCase()}:`);
  console.log(`  Total keys: ${keys.size}`);
  console.log(`  Coverage: ${coverage}% (${enKeys.size - missing.length}/${enKeys.size})`);
  console.log(`  Missing: ${missing.length}`);
  console.log(`  Extra: ${extra.length}`);
  
  if (missing.length > 0 && missing.length <= 20) {
    console.log(`  Missing keys:`);
    missing.sort().forEach(k => console.log(`    - ${k}`));
  } else if (missing.length > 20) {
    console.log(`  Missing keys (first 20):`);
    missing.sort().slice(0, 20).forEach(k => console.log(`    - ${k}`));
    console.log(`    ... and ${missing.length - 20} more`);
  }
  console.log();
}
