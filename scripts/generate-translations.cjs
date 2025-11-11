const fs = require('fs');
const lines = fs.readFileSync('src/lib/i18n.ts', 'utf-8').split('\n');

// Simple translations dictionary
const translations = {
  // Shows
  'shows.totals.fees': 'Honorarios',
  'shows.totals.net': 'Neto',
  'shows.totals.hide': 'Ocultar',
  'shows.totals.show': 'Mostrar totales',
  'shows.view.list': 'Lista',
  'shows.view.board': 'Tablero',
  'shows.views.none': 'Vistas',
  'shows.views.delete': 'Eliminar',
  'shows.views.namePlaceholder': 'Nombre de vista',
  'shows.views.save': 'Guardar',
  'shows.bulk.selected': 'seleccionados',
  'shows.bulk.confirm': 'Confirmar',
  'shows.bulk.promote': 'Promocionar',
  'shows.bulk.export': 'Exportar',
  'shows.notes': 'Notas',
  'shows.virtualized.hint': 'Lista virtualizada activa',
  'shows.title': 'Shows',
  'shows.notFound': 'Show no encontrado',
  'shows.search.placeholder': 'Buscar ciudad/país',
  'shows.add': 'Añadir show',
  'shows.edit': 'Editar',
  'shows.summary.upcoming': 'Próximos',
  'shows.summary.totalFees': 'Honorarios Totales',
  'shows.summary.estNet': 'Neto Est.',
  'shows.summary.avgWht': 'IRPF Promedio',
  'shows.table.date': 'Fecha',
  'shows.table.name': 'Show',
  'shows.table.city': 'Ciudad',
  'shows.table.country': 'País',
  'shows.table.venue': 'Venue',
  'shows.table.promoter': 'Promotor',
  'shows.table.wht': 'IRPF %',
  'shows.table.type': 'Tipo',
  'shows.table.description': 'Descripción',
  'shows.table.amount': 'Cantidad',
  'shows.table.remove': 'Eliminar',
  'shows.table.agency.mgmt': 'Gestión',
  'shows.table.agency.booking': 'Booking',
  'shows.table.agencies': 'Agencias',
  'shows.table.notes': 'Notas',
  'shows.table.fee': 'Honorario',
  'shows.selected': 'seleccionados',
  'shows.count.singular': 'show',
  'shows.count.plural': 'shows',
  // Story
  'story.title': 'Modo historia',
  'story.timeline': 'Línea de tiempo',
  'story.play': 'Reproducir',
  'story.pause': 'Pausar',
  'story.cta': 'Modo historia',
  'story.scrub': 'Arrastrar línea de tiempo',
  // Testimonials
  'testimonials.title': 'Confiado por Líderes de la Industria',
  'testimonials.subtitle': 'Historias reales de la industria del touring',
  'testimonials.subtitle.artist': 'Mira cómo artistas toman el control de sus carreras',
  'testimonials.subtitle.agency': 'Descubre cómo agencias están transformando sus operaciones',
  // Views
  'views.import.invalidShape': 'Formato de vista inválido',
  'views.import.invalidJson': 'JSON inválido',
  'views.manage': 'Gestionar vistas',
  'views.saved': 'Guardado',
  'views.apply': 'Aplicar',
  'views.none': 'Sin vistas guardadas',
  'views.deleted': 'Eliminado',
  'views.export': 'Exportar',
  'views.import': 'Importar',
  'views.import.hint': 'Pega JSON de vistas para importar',
  'views.openLab': 'Abrir Laboratorio de Diseño',
  'views.share': 'Copiar enlace compartir',
  'views.export.copied': 'Exportación copiada',
  'views.imported': 'Vistas importadas',
  'views.import.invalid': 'JSON inválido',
  'views.label': 'Vista',
  'views.names.default': 'Por defecto',
  'views.names.finance': 'Finanzas',
  'views.names.operations': 'Operaciones',
  'views.names.promo': 'Promoción',
  // Welcome
  'welcome.change.linkEdited': 'Enlace editado',
  'welcome.change.memberInvited': 'Miembro invitado',
  'welcome.change.docUploaded': 'Documento subido',
  'welcome.cta.inviteManager': 'Invitar manager',
  'welcome.cta.connectArtist': 'Conectar artista',
  'welcome.cta.createTeam': 'Crear equipo',
  'welcome.cta.completeBranding': 'Completar branding',
  'welcome.cta.reviewShows': 'Revisar shows',
  'welcome.cta.connectCalendar': 'Conectar calendario',
  'welcome.assign': 'Asignar',
};

// Extract existing ES keys
const esKeys = new Set();
for (let i = 1592; i <= 2964; i++) {
  const m = lines[i].match(/'([^']+)'\s*:/);
  if (m) esKeys.add(m[1]);
}

// Filter to only missing keys
const toAdd = [];
for (const [key, value] of Object.entries(translations)) {
  if (!esKeys.has(key)) {
    toAdd.push({ key, value });
  }
}

console.log(`Found ${toAdd.length} keys to add:\n`);
toAdd.forEach(({ key, value }) => {
  console.log(`    , '${key}': '${value}'`);
});
