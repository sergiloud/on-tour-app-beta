const fs = require('fs');
const lines = fs.readFileSync('src/lib/i18n.ts', 'utf-8').split('\n');

// Complete translations dictionary for remaining keys
const translations = {
  // Calendar (41 keys)
  'calendar.announce.deleted': 'Evento eliminado',
  'calendar.announce.dragDetected': 'Botón de evento detectado en {d}',
  'calendar.dragToCreate': 'Arrastra para crear:',
  'calendar.addButton': 'Añadir',
  'calendar.createButton': 'Crear Botón',
  'calendar.buttonHelp': 'Botón de evento personalizable de arrastrar y soltar',
  'calendar.buttonLabel': 'Etiqueta',
  'calendar.eventType': 'Tipo',
  'calendar.buttonColor': 'Color',
  'calendar.buttonCategory': 'Categoría',
  'calendar.preview': 'Vista previa',
  'calendar.view.timeline': 'Línea de tiempo',
  'calendar.timeline.noEvents': 'No hay eventos en este período',
  'calendar.timeline.today': 'Hoy',
  'calendar.timeline.confirmed': 'Confirmado',
  'calendar.timeline.pending': 'Pendiente',
  'calendar.timeline.offer': 'Oferta',
  'calendar.timeline.cancelled': 'Cancelado',
  'calendar.timeline.starts': 'Empieza',
  'calendar.timeline.ends': 'Termina',
  'calendar.timeline.continues': 'Continúa',
  'calendar.timeline.days': 'd',
  'calendar.extend.start': 'Ajustar fecha de inicio',
  'calendar.extend.start.hint': 'Click para extender inicio • Alt+Click para reducir',
  'calendar.extend.end': 'Ajustar fecha de fin',
  'calendar.extend.end.hint': 'Click para extender fin • Alt+Click para reducir',
  'calendar.date.adjust': 'Ajustar fechas',
  'calendar.multiday.extend': 'Extender evento multi-día',
  'calendar.multiday.shrink': 'Reducir evento multi-día',
  'calendar.range.start': 'Inicio: {d}',
  'calendar.range.end': 'Fin: {d}',
  'calendar.duration': 'Duración: {n} días',
  'calendar.accessibility.dragStart': 'Comenzar arrastre de evento desde {d}',
  'calendar.accessibility.dragOver': 'Arrastrando sobre {d}',
  'calendar.accessibility.drop': 'Soltar evento en {d}',
  'calendar.accessibility.cancel': 'Cancelar arrastre',
  'calendar.button.new': 'Nuevo botón de evento',
  'calendar.button.edit': 'Editar botón',
  'calendar.button.delete': 'Eliminar botón',
  'calendar.button.save': 'Guardar botón',
  'calendar.button.cancel': 'Cancelar',
  
  // Shows (53 keys)
  'shows.table.net': 'Neto',
  'shows.table.status': 'Estado',
  'shows.selectAll': 'Seleccionar todo',
  'shows.selectRow': 'Seleccionar fila',
  'shows.editor.tabs': 'Pestañas',
  'shows.editor.tab.details': 'Detalles',
  'shows.editor.tab.finance': 'Finanzas',
  'shows.editor.tab.costs': 'Costes',
  'shows.editor.finance.commissions': 'Comisiones',
  'shows.editor.add': 'Añadir show',
  'shows.editor.edit': 'Editar show',
  'shows.editor.delete': 'Eliminar show',
  'shows.editor.duplicate': 'Duplicar show',
  'shows.editor.save': 'Guardar',
  'shows.editor.cancel': 'Cancelar',
  'shows.editor.close': 'Cerrar',
  'shows.editor.loading': 'Cargando...',
  'shows.editor.saving': 'Guardando...',
  'shows.editor.saved': 'Guardado',
  'shows.editor.error': 'Error al guardar',
  'shows.editor.confirm': 'Confirmar cambios',
  'shows.editor.discard': 'Descartar cambios',
  'shows.editor.unsaved': 'Cambios sin guardar',
  'shows.editor.details.city': 'Ciudad',
  'shows.editor.details.country': 'País',
  'shows.editor.details.venue': 'Venue',
  'shows.editor.details.date': 'Fecha',
  'shows.editor.details.time': 'Hora',
  'shows.editor.details.promoter': 'Promotor',
  'shows.editor.details.notes': 'Notas',
  'shows.editor.finance.fee': 'Honorario',
  'shows.editor.finance.wht': 'IRPF %',
  'shows.editor.finance.net': 'Neto',
  'shows.editor.finance.currency': 'Moneda',
  'shows.editor.costs.add': 'Añadir coste',
  'shows.editor.costs.total': 'Total costes',
  'shows.editor.costs.empty': 'Sin costes',
  'shows.editor.costs.type': 'Tipo de coste',
  'shows.editor.costs.amount': 'Importe',
  'shows.editor.costs.description': 'Descripción',
  'shows.editor.costs.delete': 'Eliminar coste',
  'shows.editor.validation.cityRequired': 'Ciudad es requerida',
  'shows.editor.validation.dateRequired': 'Fecha es requerida',
  'shows.editor.validation.feeRequired': 'Honorario es requerido',
  'shows.editor.validation.invalidFee': 'Honorario inválido',
  'shows.editor.validation.invalidWht': 'IRPF inválido (0-100)',
  'shows.editor.actions.promote': 'Promocionar',
  'shows.editor.actions.archive': 'Archivar',
  'shows.editor.actions.restore': 'Restaurar',
  'shows.editor.actions.export': 'Exportar',
  'shows.editor.bulk.edit': 'Edición masiva',
  'shows.editor.bulk.delete': 'Eliminar seleccionados',
  'shows.editor.bulk.confirm': 'Confirmar {n} shows',
};

// Extract existing ES keys
const esKeys = new Set();
for (let i = 1592; i <= 3002; i++) {
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
