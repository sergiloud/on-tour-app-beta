#!/usr/bin/env node

/**
 * Script para generar un JWT_SECRET criptográficamente seguro
 * 
 * Uso:
 * node scripts/generate-jwt-secret.js
 * 
 * O añadir directamente al .env:
 * node scripts/generate-jwt-secret.js >> .env
 */

import crypto from 'crypto';

// Generar 64 bytes aleatorios y convertir a hexadecimal
const jwtSecret = crypto.randomBytes(64).toString('hex');

console.log('# JWT Secret generado criptográficamente');
console.log('# Reemplaza el JWT_SECRET en tu archivo .env con el siguiente valor:');
console.log('');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log('');
console.log('# Este secret tiene 128 caracteres hexadecimales (512 bits de entropía)');
console.log('# Guárdalo de forma segura y nunca lo compartas públicamente');