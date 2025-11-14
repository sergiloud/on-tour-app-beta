#!/usr/bin/env node
/**
 * Clean console.log/console.error statements and replace with logger
 * 
 * This script finds all console.* statements in src/ and replaces them
 * with the proper logger equivalent
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns to replace
const replacements = [
  // console.error -> logger.error
  {
    pattern: /console\.error\(['"`](.+?)['"`],\s*(.+?)\);/g,
    replacement: (match, msg, error) => `logger.error('${msg}', ${error});`
  },
  // console.warn -> logger.warn  
  {
    pattern: /console\.warn\(['"`](.+?)['"`],\s*(.+?)\);/g,
    replacement: (match, msg, context) => `logger.warn('${msg}', ${context});`
  },
  // console.log for success -> logger.info
  {
    pattern: /console\.log\(['"`]✅(.+?)['"`]\);/g,
    replacement: (match, msg) => `logger.info('✅${msg}');`
  },
  // console.log for errors -> logger.error
  {
    pattern: /console\.log\(['"`]❌(.+?)['"`],\s*(.+?)\);/g,
    replacement: (match, msg, error) => `logger.error('❌${msg}', ${error});`
  },
];

// Files to process (exclude backend for now)
const files = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['**/node_modules/**', '**/dist/**', '**/lib/logger.ts', '**/lib/sentry.ts']
});

let totalReplacements = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let fileChanged = false;
  let needsLoggerImport = false;

  // Apply replacements
  replacements.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      fileChanged = true;
      needsLoggerImport = true;
      totalReplacements++;
    }
  });

  // Add logger import if needed
  if (needsLoggerImport && !content.includes("from '../lib/logger'") && !content.includes('from \'../lib/logger\'')) {
    // Find first import statement
    const firstImportMatch = content.match(/^import .+ from .+;$/m);
    if (firstImportMatch) {
      const insertPos = content.indexOf(firstImportMatch[0]) + firstImportMatch[0].length;
      content = content.slice(0, insertPos) + "\nimport { logger } from '../lib/logger';" + content.slice(insertPos);
    }
  }

  if (fileChanged) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`✅ Cleaned ${file}`);
  }
});

console.log(`\n✅ Total replacements: ${totalReplacements} in ${files.length} files`);
