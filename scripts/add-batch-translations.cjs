const fs = require('fs');

console.log('🔍 Analizando traducciones faltantes...\n');

const content = fs.readFileSync('src/lib/i18n.ts', 'utf-8');
const lines = content.split('\n');

// Extract keys from a section
function extractKeys(startLine, endLine) {
  const keys = {};
  for (let i = startLine; i < endLine; i++) {
    const match = lines[i].match(/'([^']+)'\s*:\s*'([^']*(?:\\'[^']*)*)'/);
    if (match) {
      keys[match[1]] = match[2];
    }
  }
  return keys;
}

// Find section boundaries
const enStart = 126;
const enEnd = 1591;
const esStart = 1592;
const esEnd = 2873;

const enKeys = extractKeys(enStart, enEnd);
const esKeys = extractKeys(esStart, esEnd);

console.log(`📊 EN keys: ${Object.keys(enKeys).length}`);
console.log(`📊 ES keys: ${Object.keys(esKeys).length}`);

// Find missing keys
const missing = [];
for (const key in enKeys) {
  if (!esKeys[key]) {
    missing.push(key);
  }
}

console.log(`📊 Missing: ${missing.length}\n`);

// Manual Spanish translations (batch 2 - Navigation & Common)
const translations = {
  'welcome.upcoming.14d': 'Próximos 14 días',
  'empty.noUpcoming': 'No hay eventos próximos',
  'empty.noUpcoming.hint': 'Revisa tu calendario o añade shows',
  'empty.noPeople': 'Aún no hay personas',
  'empty.inviteHint': 'Invita a alguien para empezar',
  'scopes.shows': 'Shows',
  'scopes.travel': 'Viajes',
  'scopes.finance': 'Finanzas',
  'scopes.tooltip.shows': 'Acceso a shows concedido por enlace',
  'scopes.tooltip.travel': 'Acceso a viajes concedido por enlace',
  'scopes.tooltip.finance': 'Finanzas: solo lectura según política de enlace',
  'kpi.shows': 'Shows',
  'kpi.net': 'Neto',
  'kpi.travel': 'Viajes',
  // Batch 2: Navigation & Commands
  'nav.dashboard': 'Panel',
  'nav.shows': 'Shows',
  'nav.travel': 'Viajes',
  'nav.calendar': 'Calendario',
  'nav.finance': 'Finanzas',
  'nav.settings': 'Ajustes',
  'common.back': 'Volver',
  'common.date': 'Fecha',
  'common.fee': 'Tarifa',
  'common.status': 'Estado',
  'common.on': 'activo',
  'common.off': 'inactivo',
  'common.hide': 'Ocultar',
  'common.name': 'Nombre',
  'common.email': 'Email',
  'common.map': 'Mapa',
  'common.close': 'Cerrar',
  'common.language': 'Idioma',
  'common.today': 'Hoy',
  'common.tomorrow': 'Mañana',
  'common.go': 'Ir',
  'common.show': 'Mostrar',
  'common.search': 'Buscar',
  'common.current': 'Actual',
  'common.compare': 'Comparar',
  'common.reminder': 'Recordatorio',
  'common.open': 'Abrir',
  'common.apply': 'Aplicar',
  'common.import': 'Importar',
  'common.export': 'Exportar',
  // Batch 3: Auth & Login
  'auth.login': 'Iniciar sesión',
  'auth.chooseUser': 'Elige un usuario demo',
  'auth.enterAs': 'Entrar como {name}',
  'auth.role.owner': 'Artista (Propietario)',
  'auth.role.agencyManager': 'Manager de Agencia',
  'auth.role.artistManager': 'Equipo de Artista (Manager)',
  'auth.scope.finance.ro': 'Finanzas: solo lectura',
  'auth.scope.edit.showsTravel': 'Editar shows/viajes',
  'auth.scope.full': 'Acceso completo',
  'login.title': 'Bienvenido a On Tour',
  'login.subtitle': 'Tu centro de comando para gestión de giras',
  'login.enterAs': 'Entrar como {name}',
  'login.usernameOrEmail': 'Usuario o Email',
  'role.agencyManager': 'Manager de Agencia',
  'role.artistOwner': 'Artista (Propietario)',
  'role.artistManager': 'Equipo de Artista (Manager)',
  // Batch 4: Scopes & Permissions
  'scope.shows.write': 'shows: escritura',
  'scope.shows.read': 'shows: lectura',
  'scope.travel.book': 'viajes: reservar',
  'scope.travel.read': 'viajes: lectura',
  'scope.finance.read': 'finanzas: lectura',
  'scope.finance.none': 'finanzas: ninguno',
  // Batch 5: Insights
  'insights.thisMonthTotal': 'Total Este Mes',
  'insights.statusBreakdown': 'Desglose por estado',
  'insights.upcoming14d': 'Próximos 14d',
  // Batch 6: Layout
  'layout.invite': 'Invitar',
  'layout.build': 'Build: preview',
  'layout.demo': 'Estado: demo feed',
  // Batch 7: Alerts
  'alerts.title': 'Centro de Alertas',
  'alerts.anySeverity': 'Cualquier severidad',
  'alerts.anyRegion': 'Cualquier región',
  'alerts.anyTeam': 'Cualquier equipo',
  'alerts.noAlerts': 'Sin alertas',
  // Batch 8: Map
  'map.openInDashboard': 'Abrir en panel',
};

// Generate output for manual insertion
const toAdd = missing.filter(key => translations[key]);
console.log(`✅ Traducciones listas para agregar: ${toAdd.length}\n`);

const output = toAdd.map(key => `    , '${key}': '${translations[key]}'`).join('\n');

console.log('📝 Copia estas líneas al inicio de la sección ES (después de "es: {"):\n');
console.log(output);
console.log('\n---\n');
console.log(`Progreso: ${toAdd.length}/${missing.length} traducciones de esta tanda`);
console.log(`Cobertura total después: ${((Object.keys(esKeys).length + toAdd.length) / Object.keys(enKeys).length * 100).toFixed(1)}%`);
