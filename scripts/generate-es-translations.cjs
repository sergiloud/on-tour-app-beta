const fs = require('fs');

const content = fs.readFileSync('src/lib/i18n.ts', 'utf-8');
const lines = content.split('\n');

// Extract keys with their values
function extractKeysWithValues(startLine, endLine) {
  const sectionContent = lines.slice(startLine, endLine).join('\n');
  const keys = {};
  
  // Match 'key': 'value' pattern, handling escaped quotes
  const regex = /'([^']+)'\s*:\s*'([^'\\]*(?:\\.[^'\\]*)*)'/g;
  let match;
  
  while ((match = regex.exec(sectionContent)) !== null) {
    keys[match[1]] = match[2];
  }
  
  return keys;
}

const enKeys = extractKeysWithValues(125, 1591);
const esKeys = extractKeysWithValues(1591, 2873);

const missing = [];
for (const key in enKeys) {
  if (!esKeys[key]) {
    missing.push(key);
  }
}

console.log(`Found ${missing.length} missing ES keys`);

// Generate Spanish translations
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
  'cmd.go.profile': 'Ir al perfil',
  'cmd.go.preferences': 'Ir a preferencias',
  'common.copyLink': 'Copiar enlace',
  'common.learnMore': 'Saber más',
  'nav.dashboard': 'Panel',
  'nav.shows': 'Shows',
  'nav.travel': 'Viajes',
  'nav.calendar': 'Calendario',
  'nav.finance': 'Finanzas',
  'nav.settings': 'Ajustes',
  'insights.thisMonthTotal': 'Total Este Mes',
  'insights.statusBreakdown': 'Desglose por estado',
  'insights.upcoming14d': 'Próximos 14d',
  'common.openShow': 'Abrir show',
  'common.centerMap': 'Centrar mapa',
  'common.dismiss': 'Descartar',
  'common.snooze7': 'Posponer 7 días',
  'common.snooze30': 'Posponer 30 días',
  'common.back': 'Volver',
  'common.date': 'Fecha',
  'common.fee': 'Tarifa',
  'common.status': 'Estado',
  'common.on': 'activo',
  'common.off': 'inactivo',
  'common.hide': 'Ocultar',
  'common.pin': 'Fijar',
  'common.unpin': 'Desfijar',
  'common.name': 'Nombre',
  'common.email': 'Email',
  'common.map': 'Mapa',
  'common.close': 'Cerrar',
  'common.language': 'Idioma',
  'layout.invite': 'Invitar',
  'layout.build': 'Build: preview',
  'layout.demo': 'Estado: demo feed',
  'alerts.title': 'Centro de Alertas',
  'alerts.anySeverity': 'Cualquier severidad',
  'alerts.anyRegion': 'Cualquier región',
  'alerts.anyTeam': 'Cualquier equipo',
  'alerts.copySlack': 'Copiar Slack',
  'alerts.copied': 'Copiado ✓',
  'alerts.noAlerts': 'Sin alertas',
  'map.openInDashboard': 'Abrir en panel',
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
  'login.quick.agency': 'Entrar como Shalizi (agencia)',
  'login.quick.artist': 'Entrar como Danny (artista)',
  'login.remember': 'Recordarme',
  'login.usernameOrEmail': 'Usuario o Email',
  'role.agencyManager': 'Manager de Agencia',
  'role.artistOwner': 'Artista (Propietario)',
  'role.artistManager': 'Equipo de Artista (Manager)',
  'scope.shows.write': 'shows: escritura',
  'scope.shows.read': 'shows: lectura',
  'scope.travel.book': 'viajes: reservar',
  'scope.travel.read': 'viajes: lectura',
  'scope.finance.read': 'finanzas: lectura',
  'scope.finance.none': 'finanzas: ninguno',
};

// Output only missing keys with translations
const output = missing
  .map(key => {
    const translation = translations[key] || enKeys[key]; // Use manual translation or fallback to EN
    return `    , '${key}': '${translation}'`;
  })
  .join('\n');

fs.writeFileSync('missing-es-translations.txt', output);
console.log('\nSaved to missing-es-translations.txt');
console.log('You can copy these into the ES section');
