#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';

const filePath = './src/lib/i18n.ts';
const content = readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

// Translations to add
const missingTranslations = {
  'access.readOnly': 'Solo lectura',
  'access.readOnly.tooltip': 'No puedes editar en modo solo lectura',
  'common.back': 'Volver',
  'common.centerMap': 'Centrar mapa',
  'common.date': 'Fecha',
  'common.dismiss': 'Descartar',
  'common.email': 'Email',
  'common.fee': 'Cachet',
  'common.hide': 'Ocultar',
  'common.map': 'Mapa',
  'common.name': 'Nombre',
  'common.off': 'Desactivado',
  'common.on': 'Activado',
  'common.openShow': 'Abrir show',
  'common.snooze30': 'Posponer 30 días',
  'common.snooze7': 'Posponer 7 días',
  'common.status': 'Estado',
  'demo.banner': 'Modo demo activo',
  'demo.clear': 'Limpiar datos demo',
  'demo.cleared': 'Datos demo eliminados',
  'demo.load': 'Cargar datos demo',
  'demo.loaded': 'Datos demo cargados',
  'demo.password.invalid': 'Contraseña incorrecta',
  'demo.password.prompt': 'Introduce la contraseña demo',
  'filters.appliedRange': 'Rango aplicado',
  'filters.currency': 'Moneda',
  'filters.from': 'Desde',
  'filters.presentation': 'Presentación',
  'filters.region': 'Región',
  'filters.shortcutHint': 'Atajo de teclado',
  'filters.title': 'Filtros',
  'filters.to': 'Hasta',
  'hero.title': 'Del caos al control. De los datos a las decisiones.',
  'insights.statusBreakdown': 'Desglose por estado',
  'insights.thisMonthTotal': 'Total este mes',
  'insights.upcoming14d': 'Próximos 14 días',
  'layout.highContrast': 'Alto contraste',
  'layout.team': 'Equipo',
  'layout.tenant': 'Organización',
  'layout.viewAsExit': 'Salir de vista como',
  'layout.viewingAs': 'Viendo como',
  'nav.activity': 'Actividad',
  'nav.calendar': 'Calendario',
  'nav.finance': 'Finanzas',
  'nav.settings': 'Ajustes',
  'nav.shows': 'Shows',
  'nav.travel': 'Viajes',
  'settings.title': 'Ajustes'
};

// Find ES section end (line before "  }," that closes es: {})
// ES starts at line 1975, we need to find where it ends
let esEndLine = -1;
for (let i = 1975; i < lines.length; i++) {
  if (lines[i].trim() === '},') {
    // Check if next lines indicate start of FR section
    if (i + 1 < lines.length && lines[i + 3]?.includes('fr: {')) {
      esEndLine = i;
      break;
    }
  }
}

if (esEndLine === -1) {
  console.error('Could not find ES section end');
  process.exit(1);
}

console.log(`Found ES section end at line ${esEndLine + 1}`);

// Insert translations before the closing }
const translationLines = Object.entries(missingTranslations).map(
  ([key, value]) => `    , '${key}': '${value}'`
);

// Add comment before translations
translationLines.unshift('    // Missing translations added');

// Insert at esEndLine
const newLines = [
  ...lines.slice(0, esEndLine),
  ...translationLines,
  ...lines.slice(esEndLine)
];

writeFileSync(filePath, newLines.join('\n'), 'utf-8');

console.log(`✅ Added ${Object.keys(missingTranslations).length} missing Spanish translations`);
