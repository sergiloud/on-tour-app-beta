#!/usr/bin/env node

/**
 * Script to clean up Italian translation duplicates and extract proper structure
 * On Tour App v2.2.1 - I18N Expansion Plan Implementation
 */

const fs = require('fs');

// Read the current i18n file
const filePath = './src/lib/i18n.ts';
const content = fs.readFileSync(filePath, 'utf-8');

// Find the Italian section boundaries
const itStart = content.indexOf('it: {');
const ptStart = content.indexOf('pt: {');

if (itStart === -1 || ptStart === -1) {
  console.error('Could not find Italian or Portuguese section boundaries');
  process.exit(1);
}

const beforeIt = content.slice(0, itStart);
const afterIt = content.slice(ptStart);
const itSection = content.slice(itStart, ptStart);

console.log('🔍 Analyzing Italian section...');
console.log('Italian section length:', itSection.length, 'characters');

// Split into lines and analyze structure
const lines = itSection.split('\n');
console.log('Total lines in Italian section:', lines.length);

// Find actual Italian translations (those that come after comments mentioning "IT")
let cleanItLines = ['it: {'];
let inItalianSection = false;
let italianKeyCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Start Italian section when we see IT comment
  if (line.includes('// Permissions & Roles (IT)') || 
      line.includes('// ITALIAN (IT)') ||
      line.includes('(IT)')) {
    inItalianSection = true;
    cleanItLines.push(line);
    continue;
  }
  
  // Stop if we hit another language section
  if (inItalianSection && (
      line.includes('// Permissions & Roles (EN)') ||
      line.includes('// Permissions & Roles (ES)') ||
      line.includes('// Permissions & Roles (FR)') ||
      line.includes('// Permissions & Roles (DE)') ||
      line.includes('// Landing / Home') && i > 100
    )) {
    inItalianSection = false;
    continue;
  }
  
  // Include lines that are in Italian section
  if (inItalianSection) {
    // Skip empty lines and closing braces at section end
    if (line.trim() === '' || line.trim() === '},' || line.trim() === '}') {
      if (line.trim() === '},' || line.trim() === '}') {
        cleanItLines.push('  }');
        break;
      }
      continue;
    }
    
    // Count actual translation keys
    if (line.includes("': '") || line.includes('": "')) {
      italianKeyCount++;
    }
    
    cleanItLines.push(line);
  }
}

console.log('✅ Found', italianKeyCount, 'actual Italian translation keys');
console.log('📋 Clean Italian section preview:');
console.log(cleanItLines.slice(0, 20).join('\n'));
console.log('...');
console.log(cleanItLines.slice(-10).join('\n'));

// Create backup
const backupPath = './src/lib/i18n.ts.backup';
fs.writeFileSync(backupPath, content);
console.log('💾 Created backup at:', backupPath);

// Write cleaned version
const cleanContent = beforeIt + cleanItLines.join('\n') + '\n  },\n\n  ' + afterIt;
fs.writeFileSync(filePath, cleanContent);

console.log('🎉 Cleaned Italian section! Removed duplicates.');
console.log('📊 New structure ready for completion.');