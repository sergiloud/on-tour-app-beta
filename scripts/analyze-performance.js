#!/usr/bin/env node

/**
 * Performance Analysis Script
 * Analyzes bundle sizes and identifies optimization opportunities
 */

import { readdir, stat, readFile } from 'fs/promises';
import { join } from 'path';

const DIST_DIR = './dist/assets';
const WARN_SIZE_KB = 500;
const ERROR_SIZE_KB = 1000;

async function getFileSize(path) {
  const stats = await stat(path);
  return stats.size;
}

async function analyzeBundle() {
  try {
    const files = await readdir(DIST_DIR);
    const assets = [];

    for (const file of files) {
      const path = join(DIST_DIR, file);
      const size = await getFileSize(path);
      const sizeKB = (size / 1024).toFixed(2);

      if (file.endsWith('.js')) {
        assets.push({
          name: file,
          size: parseFloat(sizeKB),
          type: 'js',
        });
      } else if (file.endsWith('.css')) {
        assets.push({
          name: file,
          size: parseFloat(sizeKB),
          type: 'css',
        });
      }
    }

    // Sort by size
    assets.sort((a, b) => b.size - a.size);

    console.log('\n📊 Bundle Size Analysis\n');
    console.log('═'.repeat(70));

    let totalJS = 0;
    let totalCSS = 0;

    assets.forEach((asset) => {
      const icon = asset.size > ERROR_SIZE_KB ? '🔴' : asset.size > WARN_SIZE_KB ? '🟡' : '🟢';
      console.log(`${icon} ${asset.name.padEnd(45)} ${asset.size.toFixed(2).padStart(10)} KB`);

      if (asset.type === 'js') totalJS += asset.size;
      if (asset.type === 'css') totalCSS += asset.size;
    });

    console.log('═'.repeat(70));
    console.log(`Total JavaScript: ${totalJS.toFixed(2)} KB`);
    console.log(`Total CSS: ${totalCSS.toFixed(2)} KB`);
    console.log(`Total Assets: ${(totalJS + totalCSS).toFixed(2)} KB\n`);

    // Recommendations
    console.log('💡 Recommendations:\n');
    
    const largeAssets = assets.filter(a => a.size > ERROR_SIZE_KB);
    if (largeAssets.length > 0) {
      console.log(`⚠️  ${largeAssets.length} asset(s) exceed 1MB - consider code splitting`);
    }

    const mediumAssets = assets.filter(a => a.size > WARN_SIZE_KB && a.size <= ERROR_SIZE_KB);
    if (mediumAssets.length > 0) {
      console.log(`⚠️  ${mediumAssets.length} asset(s) exceed 500KB - review for optimization`);
    }

    if (totalJS > 3000) {
      console.log('⚠️  Total JS exceeds 3MB - consider lazy loading more routes');
    }

    if (totalCSS > 300) {
      console.log('⚠️  Total CSS exceeds 300KB - consider purging unused styles');
    }

    console.log('');
  } catch (error) {
    console.error('Error analyzing bundle:', error);
    process.exit(1);
  }
}

analyzeBundle();
