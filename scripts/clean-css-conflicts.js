#!/usr/bin/env node
/**
 * Script para limpiar clases CSS duplicadas en archivos TypeScript/JSX
 * Arregla problemas comunes de Tailwind CSS con clases conflictivas
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patrones de clases conflictivas comunes
const conflictPatterns = [
  // Dark background conflicts
  {
    pattern: /dark:bg-slate-\d+\s+dark:bg-white\/\d+/g,
    fix: (match) => match.replace(/dark:bg-slate-\d+\s+/, '')
  },
  {
    pattern: /dark:bg-white\/\d+\s+hover:bg-slate-\d+\s+dark:bg-white\/\d+/g,
    fix: (match) => {
      const parts = match.split(' ');
      const darkBg = parts.find(p => p.startsWith('dark:bg-white/'));
      const hoverBg = parts.find(p => p.startsWith('hover:bg-slate-'));
      const hoverDarkBg = `dark:hover:bg-white/${parseInt(darkBg.split('/')[1]) + 10}`;
      return `${darkBg} ${hoverBg} ${hoverDarkBg}`;
    }
  },
  // Dark text conflicts
  {
    pattern: /dark:text-white\/\d+\s+group-hover:text-slate-\d+\s+dark:text-white\/\d+/g,
    fix: (match) => {
      const parts = match.split(' ');
      const darkText = parts.find(p => p.startsWith('dark:text-white/'));
      const hoverText = parts.find(p => p.startsWith('group-hover:text-slate-'));
      const hoverDarkText = `dark:group-hover:text-white/${parseInt(darkText.split('/')[1]) + 20}`;
      return `${darkText} ${hoverText} ${hoverDarkText}`;
    }
  },
  // Generic duplicate dark classes
  {
    pattern: /(dark:[a-z-]+\/\d+)(\s+[\w\s:-]+)(\s+\1)/g,
    fix: (match, class1, middle, class2) => class1 + middle
  }
];

function cleanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let cleaned = content;
  let hasChanges = false;

  // Apply each conflict pattern
  conflictPatterns.forEach(({ pattern, fix }) => {
    const matches = cleaned.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const fixed = fix(match);
        if (fixed !== match) {
          cleaned = cleaned.replace(match, fixed);
          hasChanges = true;
          console.log(`Fixed in ${filePath}: "${match}" -> "${fixed}"`);
        }
      });
    }
  });

  if (hasChanges) {
    fs.writeFileSync(filePath, cleaned);
    return true;
  }
  return false;
}

function cleanProject() {
  console.log('🧹 Cleaning CSS class conflicts...');
  
  const files = glob.sync('src/**/*.{tsx,ts,jsx,js}', {
    ignore: ['**/node_modules/**', '**/dist/**', '**/*.d.ts']
  });

  let cleanedCount = 0;
  
  files.forEach(file => {
    if (cleanFile(file)) {
      cleanedCount++;
    }
  });

  console.log(`✅ Cleaned ${cleanedCount} files with CSS conflicts`);
}

if (require.main === module) {
  cleanProject();
}

module.exports = { cleanProject, cleanFile };