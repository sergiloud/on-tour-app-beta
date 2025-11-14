#!/usr/bin/env node

/**
 * Find simple framer-motion usage that can be replaced with CSS
 * Identifies motion.div with only basic props (opacity, y, scale)
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';

const srcDir = 'src';
const excludeDirs = ['node_modules', 'dist', '.git', 'coverage'];

const simpleAnimations = [];
const complexAnimations = [];

function scanDirectory(dir) {
  const entries = readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!excludeDirs.includes(entry)) {
        scanDirectory(fullPath);
      }
    } else if (entry.match(/\.(tsx|jsx)$/)) {
      analyzeFile(fullPath);
    }
  }
}

function analyzeFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // Skip if no framer-motion import
    if (!content.includes('framer-motion')) return;
    
    // Count motion.div usage
    const motionDivMatches = content.match(/<motion\.\w+/g) || [];
    if (motionDivMatches.length === 0) return;
    
    // Check for complex animations
    const hasGestures = /whileDrag|whileTap|drag|onDrag/.test(content);
    const hasComplexVariants = /variants\s*=/.test(content);
    const hasCustom = /custom|useMotionValue|useTransform|useSpring/.test(content);
    const hasLayout = /layout(Id)?=/.test(content);
    
    // Simple patterns we can replace:
    // - initial + animate with just opacity/y/x/scale
    // - whileHover with just scale
    // - AnimatePresence with simple exit
    
    const hasSimpleInitial = /initial=\{\{\s*(opacity|y|x|scale)/.test(content);
    const hasSimpleAnimate = /animate=\{\{\s*(opacity|y|x|scale)/.test(content);
    const hasSimpleHover = /whileHover=\{\{\s*scale/.test(content);
    
    const isSimple = (hasSimpleInitial || hasSimpleAnimate || hasSimpleHover) && 
                     !hasGestures && !hasComplexVariants && !hasCustom && !hasLayout;
    
    const info = {
      file: filePath,
      count: motionDivMatches.length,
      hasGestures,
      hasComplexVariants,
      hasCustom,
      hasLayout,
      hasSimpleInitial,
      hasSimpleAnimate,
      hasSimpleHover,
    };
    
    if (isSimple) {
      simpleAnimations.push(info);
    } else {
      complexAnimations.push(info);
    }
  } catch (error) {
    // Skip files that can't be read
  }
}

console.log('🔍 Scanning for framer-motion usage...\n');

scanDirectory(srcDir);

console.log('📊 Results:\n');
console.log('═'.repeat(80));

const totalFiles = simpleAnimations.length + complexAnimations.length;
const totalMotionElements = [...simpleAnimations, ...complexAnimations]
  .reduce((sum, f) => sum + f.count, 0);

console.log(`\n📚 Total files using framer-motion: ${totalFiles}`);
console.log(`📦 Total motion elements: ${totalMotionElements}\n`);

console.log('✅ SIMPLE (Can replace with CSS):');
console.log('─'.repeat(80));
const simpleCount = simpleAnimations.reduce((sum, f) => sum + f.count, 0);
console.log(`${simpleAnimations.length} files (${simpleCount} motion elements)\n`);

// Group by directory
const byDir = {};
simpleAnimations.forEach(f => {
  const dir = f.file.split('/').slice(0, -1).join('/');
  if (!byDir[dir]) byDir[dir] = [];
  byDir[dir].push(f);
});

Object.entries(byDir)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 10)
  .forEach(([dir, files]) => {
    const count = files.reduce((sum, f) => sum + f.count, 0);
    console.log(`  ${dir}/ (${files.length} files, ${count} elements)`);
  });

console.log('\n\n⚠️  COMPLEX (Keep framer-motion):');
console.log('─'.repeat(80));
const complexCount = complexAnimations.reduce((sum, f) => sum + f.count, 0);
console.log(`${complexAnimations.length} files (${complexCount} motion elements)\n`);

const complexReasons = {
  gestures: complexAnimations.filter(f => f.hasGestures).length,
  variants: complexAnimations.filter(f => f.hasComplexVariants).length,
  custom: complexAnimations.filter(f => f.hasCustom).length,
  layout: complexAnimations.filter(f => f.hasLayout).length,
};

console.log('Reasons to keep:');
console.log(`  Gestures (drag/tap): ${complexReasons.gestures} files`);
console.log(`  Complex variants: ${complexReasons.variants} files`);
console.log(`  Custom hooks: ${complexReasons.custom} files`);
console.log(`  Layout animations: ${complexReasons.layout} files`);

console.log('\n\n💡 Recommendations:\n');
console.log('═'.repeat(80));
console.log(`1. Replace ${simpleCount} simple motion elements with CSS`);
console.log(`   - Use .animate-fade-in, .animate-slide-up, .hover-scale`);
console.log(`   - Potential savings: ~${Math.round(simpleCount * 0.5)}KB (estimated)`);
console.log(`\n2. Keep ${complexCount} complex animations with framer-motion`);
console.log(`   - Gestures, layout, variants need framer-motion`);
console.log(`\n3. Target directories with most simple usage first:`);

Object.entries(byDir)
  .sort((a, b) => {
    const aCount = b[1].reduce((sum, f) => sum + f.count, 0);
    const bCount = a[1].reduce((sum, f) => sum + f.count, 0);
    return bCount - aCount;
  })
  .slice(0, 5)
  .forEach(([dir, files], i) => {
    const count = files.reduce((sum, f) => sum + f.count, 0);
    console.log(`   ${i + 1}. ${dir}/ (${count} elements)`);
  });

// Save detailed report
const report = {
  summary: {
    totalFiles,
    totalMotionElements,
    simpleFiles: simpleAnimations.length,
    simpleElements: simpleCount,
    complexFiles: complexAnimations.length,
    complexElements: complexCount,
  },
  simple: simpleAnimations.map(f => ({
    file: f.file,
    count: f.count,
    patterns: {
      initial: f.hasSimpleInitial,
      animate: f.hasSimpleAnimate,
      hover: f.hasSimpleHover,
    }
  })),
  complex: complexAnimations.map(f => ({
    file: f.file,
    count: f.count,
    reasons: {
      gestures: f.hasGestures,
      variants: f.hasComplexVariants,
      custom: f.hasCustom,
      layout: f.hasLayout,
    }
  })),
};

writeFileSync('framer-motion-report.json', JSON.stringify(report, null, 2));
console.log(`\n\n📄 Detailed report saved to: framer-motion-report.json`);
console.log('\n');
