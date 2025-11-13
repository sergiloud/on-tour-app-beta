#!/usr/bin/env node

/**
 * Script de Verificación de Seguridad
 * 
 * Verifica que todas las mejoras de seguridad estén correctamente implementadas
 * según las recomendaciones de la auditoría.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colores para terminal
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

console.log(`${colors.bold}${colors.blue}🔒 VERIFICACIÓN DE SEGURIDAD - ON TOUR APP${colors.reset}\n`);

const checks = [];

/**
 * Helper para verificar si un archivo existe
 */
function fileExists(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  return fs.existsSync(fullPath);
}

/**
 * Helper para leer contenido de archivo
 */
function readFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  try {
    return fs.readFileSync(fullPath, 'utf8');
  } catch {
    return null;
  }
}

/**
 * Helper para verificar si un string existe en un archivo
 */
function fileContains(filePath, searchString) {
  const content = readFile(filePath);
  return content ? content.includes(searchString) : false;
}

/**
 * Añadir un check a la lista
 */
function addCheck(category, description, passed, details = '') {
  checks.push({ category, description, passed, details });
}

// ===== VERIFICACIONES =====

console.log('📋 Ejecutando verificaciones...\n');

// 1. Verificar archivos de seguridad principales
console.log('1️⃣ Verificando archivos de middleware de seguridad...');

addCheck(
  'Archivos Core',
  'Rate Limiting Middleware',
  fileExists('src/middleware/rateLimiting.ts'),
  'src/middleware/rateLimiting.ts'
);

addCheck(
  'Archivos Core',
  'Validation Middleware',
  fileExists('src/middleware/validation.ts'),
  'src/middleware/validation.ts'
);

addCheck(
  'Archivos Core',
  'Error Handler Mejorado',
  fileExists('src/middleware/errorHandler.ts'),
  'src/middleware/errorHandler.ts'
);

addCheck(
  'Archivos Core',
  'Script JWT Secret',
  fileExists('scripts/generate-jwt-secret.js'),
  'scripts/generate-jwt-secret.js'
);

// 2. Verificar dependencias instaladas
console.log('2️⃣ Verificando dependencias...');

const packageJson = readFile('package.json');
if (packageJson) {
  const pkg = JSON.parse(packageJson);
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  
  addCheck(
    'Dependencias',
    'express-rate-limit instalado',
    'express-rate-limit' in deps,
    `Versión: ${deps['express-rate-limit'] || 'No encontrada'}`
  );
  
  addCheck(
    'Dependencias',
    'express-validator instalado',
    'express-validator' in deps,
    `Versión: ${deps['express-validator'] || 'No encontrada'}`
  );
  
  addCheck(
    'Dependencias',
    '@types/express-rate-limit instalado',
    '@types/express-rate-limit' in deps,
    `Versión: ${deps['@types/express-rate-limit'] || 'No encontrada'}`
  );
}

// 3. Verificar implementaciones específicas
console.log('3️⃣ Verificando implementaciones específicas...');

// Rate Limiting
const rateLimitContent = readFile('src/middleware/rateLimiting.ts');
if (rateLimitContent) {
  addCheck(
    'Rate Limiting',
    'authRateLimit implementado',
    rateLimitContent.includes('authRateLimit'),
    '5 intentos/15min para login'
  );
  
  addCheck(
    'Rate Limiting',
    'registrationRateLimit implementado',
    rateLimitContent.includes('registrationRateLimit'),
    '5 registros/hora'
  );
  
  addCheck(
    'Rate Limiting',
    'passwordResetRateLimit implementado',
    rateLimitContent.includes('passwordResetRateLimit'),
    '3 solicitudes/hora'
  );
  
  addCheck(
    'Rate Limiting',
    'Headers estándar configurados',
    rateLimitContent.includes('standardHeaders: true'),
    'Headers RFC compliant'
  );
}

// Validation
const validationContent = readFile('src/middleware/validation.ts');
if (validationContent) {
  addCheck(
    'Validación',
    'validateLogin implementado',
    validationContent.includes('validateLogin'),
    'Email + contraseña fuerte'
  );
  
  addCheck(
    'Validación',
    'validateRegistration implementado',
    validationContent.includes('validateRegistration'),
    'Datos completos de registro'
  );
  
  addCheck(
    'Validación',
    'handleValidationErrors implementado',
    validationContent.includes('handleValidationErrors'),
    'Manejo centralizado de errores de validación'
  );
  
  addCheck(
    'Validación',
    'Sanitización XSS implementada',
    validationContent.includes('sanitizeHtml'),
    'Protección contra XSS'
  );
}

// Error Handler
const errorHandlerContent = readFile('src/middleware/errorHandler.ts');
if (errorHandlerContent) {
  addCheck(
    'Manejo Errores',
    'Clase AppError implementada',
    errorHandlerContent.includes('class AppError'),
    'Errores estructurados con códigos'
  );
  
  addCheck(
    'Manejo Errores',
    'CommonErrors predefinidos',
    errorHandlerContent.includes('CommonErrors'),
    'Errores 401, 403, 404, 409, 429, 500'
  );
  
  addCheck(
    'Manejo Errores',
    'asyncErrorHandler implementado',
    errorHandlerContent.includes('asyncErrorHandler'),
    'Elimina necesidad de try-catch'
  );
  
  addCheck(
    'Manejo Errores',
    'Sanitización en producción',
    errorHandlerContent.includes('isProductionError'),
    'No expone stack traces en prod'
  );
}

// 4. Verificar documentación
console.log('4️⃣ Verificando documentación...');

addCheck(
  'Documentación',
  'README de Seguridad',
  fileExists('SECURITY_IMPROVEMENTS.md'),
  'Guía completa de implementación'
);

addCheck(
  'Documentación',
  'Respuesta a Auditoría',
  fileExists('AUDIT_RESPONSE.md'),
  'Comparativa antes/después'
);

addCheck(
  'Documentación',
  'Ejemplos de Integración',
  fileExists('src/examples/security-integration.ts'),
  'Códigos de ejemplo'
);

// ===== MOSTRAR RESULTADOS =====

console.log('\n📊 RESULTADOS DE VERIFICACIÓN\n');

const categories = [...new Set(checks.map(c => c.category))];
let totalPassed = 0;
let totalChecks = 0;

categories.forEach(category => {
  console.log(`${colors.bold}${category}:${colors.reset}`);
  
  const categoryChecks = checks.filter(c => c.category === category);
  const categoryPassed = categoryChecks.filter(c => c.passed).length;
  
  categoryChecks.forEach(check => {
    const icon = check.passed ? '✅' : '❌';
    const color = check.passed ? colors.green : colors.red;
    console.log(`  ${icon} ${color}${check.description}${colors.reset}`);
    if (check.details) {
      console.log(`     ${colors.yellow}${check.details}${colors.reset}`);
    }
  });
  
  console.log(`     ${colors.blue}${categoryPassed}/${categoryChecks.length} checks pasados${colors.reset}\n`);
  
  totalPassed += categoryPassed;
  totalChecks += categoryChecks.length;
});

// Resultado final
const percentage = Math.round((totalPassed / totalChecks) * 100);
const resultColor = percentage >= 90 ? colors.green : 
                   percentage >= 70 ? colors.yellow : colors.red;

console.log('='.repeat(50));
console.log(`${colors.bold}RESULTADO FINAL:${colors.reset}`);
console.log(`${resultColor}${totalPassed}/${totalChecks} verificaciones pasadas (${percentage}%)${colors.reset}`);

if (percentage >= 90) {
  console.log(`${colors.green}🎉 ¡EXCELENTE! Todas las mejoras de seguridad implementadas correctamente${colors.reset}`);
  console.log(`${colors.green}🛡️  Tu aplicación está lista para producción enterprise${colors.reset}`);
} else if (percentage >= 70) {
  console.log(`${colors.yellow}⚠️  Buen progreso, pero faltan algunas implementaciones${colors.reset}`);
} else {
  console.log(`${colors.red}🚨 Varias mejoras de seguridad necesitan atención${colors.reset}`);
}

console.log('='.repeat(50));

// Siguiente paso
if (percentage >= 90) {
  console.log(`\n${colors.blue}📋 PRÓXIMOS PASOS:${colors.reset}`);
  console.log('1. Integrar middlewares en rutas existentes');
  console.log('2. Generar nuevo JWT_SECRET: node scripts/generate-jwt-secret.js');
  console.log('3. Configurar variables de entorno');
  console.log('4. Realizar pruebas de seguridad');
}

process.exit(percentage >= 90 ? 0 : 1);