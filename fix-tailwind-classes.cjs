#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patrones de clases CSS problemáticas
const patterns = [
  {
    // dark:bg-slate-200 dark:bg-white/10 -> dark:bg-white/10 
    find: /dark:bg-slate-200\s+dark:bg-white\/10/g,
    replace: 'dark:bg-white/10'
  },
  {
    // dark:bg-white/10 hover:bg-slate-300 dark:bg-white/15 -> dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15
    find: /dark:bg-white\/10\s+hover:bg-slate-300\s+dark:bg-white\/15/g,
    replace: 'dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15'
  },
  {
    // dark:text-white/40 group-hover:text-slate-400 dark:text-white/60 -> dark:text-white/40 group-hover:text-slate-600 dark:group-hover:text-white/60
    find: /dark:text-white\/40\s+(\S+\s+)?group-hover:text-slate-400\s+dark:text-white\/60/g,
    replace: 'dark:text-white/40 $1group-hover:text-slate-600 dark:group-hover:text-white/60'
  },
  {
    // dark:text-white/40 hover:text-slate-400 dark:text-white/60 -> dark:text-white/40 hover:text-slate-600 dark:hover:text-white/60
    find: /dark:text-white\/40\s+hover:text-slate-400\s+dark:text-white\/60/g,
    replace: 'dark:text-white/40 hover:text-slate-600 dark:hover:text-white/60'
  },
  {
    // dark:border-white/5 hover:border-slate-200 dark:border-white/10 -> dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10
    find: /dark:border-white\/5\s+hover:border-slate-200\s+dark:border-white\/10/g,
    replace: 'dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10'
  }
];

function fixFile(filePath) {
  console.log(`Fixing ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  patterns.forEach(pattern => {
    if (pattern.find.test(content)) {
      content = content.replace(pattern.find, pattern.replace);
      changed = true;
    }
  });
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ Fixed classes in ${filePath}`);
  }
}

// Buscar archivos TypeScript/TSX con errores
const files = [
  'src/pages/dashboard/FinanceOverview.tsx',
  'src/components/finance/v2/FinanceV4.tsx',
  'src/components/finance/v2/FinanceV5.tsx',
  'src/components/finance/v2/FinanceV3Improved.tsx'
];

files.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    fixFile(fullPath);
  } else {
    console.log(`⚠️  File not found: ${fullPath}`);
  }
});

console.log('🎉 Tailwind class fixes completed!');
