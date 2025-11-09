#!/usr/bin/env node

/**
 * Performance Analysis Script
 * Analiza el bundle y genera reporte de optimización
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const distPath = join(process.cwd(), 'dist', 'assets');

console.log('🔍 Analizando bundle de producción...\n');

if (!existsSync(distPath)) {
  console.log('❌ No se encontró el directorio dist/assets');
  console.log('💡 Ejecuta "npm run build" primero\n');
  process.exit(1);
}

// Leer archivos del bundle
const files = require('fs').readdirSync(distPath);

const jsFiles = files.filter((f) => f.endsWith('.js'));
const cssFiles = files.filter((f) => f.endsWith('.css'));

console.log('📦 Archivos JavaScript:');
console.log('━'.repeat(60));

let totalJsSize = 0;
const jsStats = jsFiles
  .map((file) => {
    const path = join(distPath, file);
    const stats = require('fs').statSync(path);
    const sizeKB = (stats.size / 1024).toFixed(2);
    totalJsSize += stats.size;
    return { file, size: stats.size, sizeKB };
  })
  .sort((a, b) => b.size - a.size);

jsStats.forEach(({ file, sizeKB }) => {
  const icon = parseInt(sizeKB) > 100 ? '🔴' : parseInt(sizeKB) > 50 ? '🟡' : '🟢';
  console.log(`${icon} ${file.padEnd(40)} ${sizeKB.padStart(10)} KB`);
});

console.log('━'.repeat(60));
console.log(`📊 Total JS: ${(totalJsSize / 1024).toFixed(2)} KB\n`);

console.log('🎨 Archivos CSS:');
console.log('━'.repeat(60));

let totalCssSize = 0;
const cssStats = cssFiles
  .map((file) => {
    const path = join(distPath, file);
    const stats = require('fs').statSync(path);
    const sizeKB = (stats.size / 1024).toFixed(2);
    totalCssSize += stats.size;
    return { file, size: stats.size, sizeKB };
  })
  .sort((a, b) => b.size - a.size);

cssStats.forEach(({ file, sizeKB }) => {
  console.log(`  ${file.padEnd(40)} ${sizeKB.padStart(10)} KB`);
});

console.log('━'.repeat(60));
console.log(`📊 Total CSS: ${(totalCssSize / 1024).toFixed(2)} KB\n`);

console.log('📈 Resumen:');
console.log('━'.repeat(60));
console.log(`Total Bundle Size: ${((totalJsSize + totalCssSize) / 1024).toFixed(2)} KB`);
console.log(`Archivos JS: ${jsFiles.length}`);
console.log(`Archivos CSS: ${cssFiles.length}`);

// Recomendaciones
console.log('\n💡 Recomendaciones:');
console.log('━'.repeat(60));

const largeChunks = jsStats.filter((s) => s.size > 100 * 1024);
if (largeChunks.length > 0) {
  console.log('⚠️  Chunks grandes detectados (>100KB):');
  largeChunks.forEach(({ file, sizeKB }) => {
    console.log(`   - ${file}: ${sizeKB} KB`);
  });
  console.log('   Considera lazy loading o code splitting adicional');
} else {
  console.log('✅ No hay chunks excesivamente grandes');
}

if (totalJsSize / 1024 > 500) {
  console.log('\n⚠️  Bundle total grande (>500KB)');
  console.log('   Revisa vendor chunks y considera lazy loading');
} else {
  console.log('\n✅ Tamaño de bundle optimizado');
}

console.log('\n📖 Para análisis detallado:');
console.log('   - Abre dist/stats.html en el navegador');
console.log('   - Ejecuta Lighthouse en el preview\n');
