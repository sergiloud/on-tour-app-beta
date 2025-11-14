#!/usr/bin/env node

/**
 * Analyze unused imports and tree-shaking opportunities
 * Helps identify code that can be removed to reduce bundle size
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const srcDir = 'src';
const excludeDirs = ['node_modules', 'dist', '.git', 'coverage'];

// Heavy libraries to watch for
const heavyLibraries = [
  'lodash',
  'moment',
  'date-fns',
  'recharts',
  'framer-motion',
  'lucide-react',
  '@tanstack/react-query',
  '@tanstack/react-virtual',
];

// Track import usage
const importStats = new Map();
const fileImports = [];

function scanDirectory(dir) {
  const entries = readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!excludeDirs.includes(entry)) {
        scanDirectory(fullPath);
      }
    } else if (entry.match(/\.(ts|tsx|js|jsx)$/)) {
      analyzeFile(fullPath);
    }
  }
}

function analyzeFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    for (const line of lines) {
      // Match import statements
      const importMatch = line.match(/import\s+(?:{([^}]+)}|(\w+))\s+from\s+['"]([^'"]+)['"]/);
      if (importMatch) {
        const [, namedImports, defaultImport, module] = importMatch;
        const imports = namedImports 
          ? namedImports.split(',').map(i => i.trim()).filter(Boolean)
          : [defaultImport];
        
        fileImports.push({ file: filePath, module, imports });
        
        // Track heavy library usage
        heavyLibraries.forEach(lib => {
          if (module.includes(lib)) {
            if (!importStats.has(lib)) {
              importStats.set(lib, { count: 0, files: new Set(), imports: new Set() });
            }
            const stats = importStats.get(lib);
            stats.count++;
            stats.files.add(filePath);
            imports.forEach(imp => stats.imports.add(imp));
          }
        });
      }
    }
  } catch (error) {
    // Skip files that can't be read
  }
}

console.log('🔍 Analyzing imports...\n');

scanDirectory(srcDir);

console.log('📦 Heavy Library Usage:\n');
console.log('═'.repeat(80));

// Sort by count (most used first)
const sorted = Array.from(importStats.entries())
  .sort((a, b) => b[1].count - a[1].count);

for (const [lib, stats] of sorted) {
  console.log(`\n📚 ${lib}`);
  console.log(`   Imported in: ${stats.count} places across ${stats.files.size} files`);
  console.log(`   Imports: ${Array.from(stats.imports).slice(0, 10).join(', ')}${stats.imports.size > 10 ? '...' : ''}`);
  
  // Suggestions
  if (lib === 'lodash' && stats.count > 0) {
    console.log(`   💡 Consider: Use native JS methods or lodash-es for tree-shaking`);
  }
  if (lib === 'moment' && stats.count > 0) {
    console.log(`   💡 Consider: Switch to date-fns (already in bundle) or native Intl`);
  }
  if (lib === 'lucide-react' && stats.imports.size > 50) {
    console.log(`   💡 Note: Importing ${stats.imports.size} icons. Each adds ~1-2KB`);
  }
  if (lib === 'framer-motion' && stats.count > 10) {
    console.log(`   💡 Consider: Use CSS animations for simple cases (see Skeleton.tsx)`);
  }
}

// Analyze duplicate imports
console.log('\n\n🔄 Potential Optimizations:\n');
console.log('═'.repeat(80));

const moduleUsage = new Map();
for (const { module, imports } of fileImports) {
  if (!moduleUsage.has(module)) {
    moduleUsage.set(module, { count: 0, totalImports: 0 });
  }
  const usage = moduleUsage.get(module);
  usage.count++;
  usage.totalImports += imports.length;
}

const frequentModules = Array.from(moduleUsage.entries())
  .filter(([, { count }]) => count >= 10)
  .sort((a, b) => b[1].count - a[1].count)
  .slice(0, 10);

console.log('\nMost frequently imported modules (>= 10 files):\n');
for (const [module, { count, totalImports }] of frequentModules) {
  console.log(`  ${count}x - ${module} (${totalImports} imports total)`);
  if (module.startsWith('../') && count > 15) {
    console.log(`       💡 Consider: Extract to barrel export or shared module`);
  }
}

console.log('\n\n✅ Analysis complete!\n');
console.log('Next steps:');
console.log('  1. Review heavy library usage above');
console.log('  2. Check if all imports are actually used');
console.log('  3. Consider alternatives for heavy libraries');
console.log('  4. Use dynamic imports for rarely-used features');
console.log('\n');
