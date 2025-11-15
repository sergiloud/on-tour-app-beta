#!/usr/bin/env node

/**
 * Auto-translate missing keys from ES to FR/DE/IT/PT
 * Uses basic word mapping for common tourism/finance/music terms
 */

const fs = require('fs');
const path = require('path');

// Read the i18n file
const i18nPath = path.join(__dirname, '../src/lib/i18n.ts');
const content = fs.readFileSync(i18nPath, 'utf8');

// Extract ES dictionary (our most complete translation after EN)
const esMatch = content.match(/es: \{([^}]+(?:\}[^}]*)*)\}/s);
if (!esMatch) {
  console.error('Could not find ES dictionary');
  process.exit(1);
}

const esDict = esMatch[1];

// Parse ES keys
const esKeys = {};
const keyMatches = esDict.matchAll(/'([^']+)':\s*'([^']+)'/g);
for (const match of keyMatches) {
  esKeys[match[1]] = match[2];
}

console.log(`📚 Found ${Object.keys(esKeys).length} ES keys`);

// Simple translation mappings (ES -> target language)
const translations = {
  fr: {
    // Common terms
    'Calendario': 'Calendrier',
    'calendario': 'calendrier',
    'Finanzas': 'Finances',
    'finanzas': 'finances',
    'Shows': 'Spectacles',
    'shows': 'spectacles',
    'Viajes': 'Voyages',
    'viajes': 'voyages',
    'Miembros': 'Membres',
    'miembros': 'membres',
    'Ajustes': 'Paramètres',
    'ajustes': 'paramètres',
    'Configuración': 'Configuration',
    'configuración': 'configuration',
    'Organización': 'Organisation',
    'organización': 'organisation',
    'Equipos': 'Équipes',
    'equipos': 'équipes',
    'Guardar': 'Enregistrer',
    'guardar': 'enregistrer',
    'Cancelar': 'Annuler',
    'cancelar': 'annuler',
    'Eliminar': 'Supprimer',
    'eliminar': 'supprimer',
    'Editar': 'Modifier',
    'editar': 'modifier',
    'Invitar': 'Inviter',
    'invitar': 'inviter',
    'Aceptar': 'Accepter',
    'aceptar': 'accepter',
    'Rechazar': 'Refuser',
    'rechazar': 'refuser',
    'Nombre': 'Nom',
    'nombre': 'nom',
    'Email': 'Email',
    'Descripción': 'Description',
    'descripción': 'description',
    'Tipo': 'Type',
    'tipo': 'type',
    'Tour': 'Tournée',
    'Banda': 'Groupe',
    'banda': 'groupe',
    'Venue': 'Lieu',
    'Agencia': 'Agence',
    'agencia': 'agence',
    'Propietario': 'Propriétaire',
    'propietario': 'propriétaire',
    'Administrador': 'Administrateur',
    'administrador': 'administrateur',
    'Miembro': 'Membre',
    'miembro': 'membre',
    'Visor': 'Visualiseur',
    'visor': 'visualiseur',
    'Invitación': 'Invitation',
    'invitación': 'invitation',
    'Actividad': 'Activité',
    'actividad': 'activité',
    'Estadísticas': 'Statistiques',
    'estadísticas': 'statistiques',
    'Básica': 'Basique',
    'básica': 'basique',
    'Creado': 'Créé',
    'creado': 'créé',
    'Solo lectura': 'Lecture seule',
    'solo lectura': 'lecture seule',
    'Guardado exitosamente': 'Enregistré avec succès',
    'Error al guardar': 'Erreur lors de l\\'enregistrement',
    'Por favor': 'S\\'il vous plaît',
    'Zona de Peligro': 'Zone Dangereuse',
    'Esta acción no se puede deshacer': 'Cette action ne peut pas être annulée',
    'Escribe': 'Tapez',
    'para confirmar': 'pour confirmer',
    'Sí, Eliminar Definitivamente': 'Oui, Supprimer Définitivement',
    'Eliminando...': 'Suppression...',
    'Guardando...': 'Enregistrement...',
    'Enviando...': 'Envoi...',
    'Procesando...': 'Traitement...',
    'Expirado': 'Expiré',
    'expirado': 'expiré',
    'Pendiente': 'En attente',
    'pendiente': 'en attente',
    'Aceptada': 'Acceptée',
    'aceptada': 'acceptée',
    'Rechazada': 'Refusée',
    'rechazada': 'refusée',
  },
  de: {
    'Calendario': 'Kalender',
    'calendario': 'kalender',
    'Finanzas': 'Finanzen',
    'finanzas': 'finanzen',
    'Shows': 'Shows',
    'shows': 'shows',
    'Viajes': 'Reisen',
    'viajes': 'reisen',
    'Miembros': 'Mitglieder',
    'miembros': 'mitglieder',
    'Ajustes': 'Einstellungen',
    'ajustes': 'einstellungen',
    'Configuración': 'Konfiguration',
    'configuración': 'konfiguration',
    'Organización': 'Organisation',
    'organización': 'organisation',
    'Equipos': 'Teams',
    'equipos': 'teams',
    'Guardar': 'Speichern',
    'guardar': 'speichern',
    'Cancelar': 'Abbrechen',
    'cancelar': 'abbrechen',
    'Eliminar': 'Löschen',
    'eliminar': 'löschen',
    'Editar': 'Bearbeiten',
    'editar': 'bearbeiten',
    'Invitar': 'Einladen',
    'invitar': 'einladen',
    'Aceptar': 'Akzeptieren',
    'aceptar': 'akzeptieren',
    'Rechazar': 'Ablehnen',
    'rechazar': 'ablehnen',
    'Nombre': 'Name',
    'nombre': 'name',
    'Email': 'E-Mail',
    'Descripción': 'Beschreibung',
    'descripción': 'beschreibung',
    'Tipo': 'Typ',
    'tipo': 'typ',
    'Tour': 'Tour',
    'Banda': 'Band',
    'banda': 'band',
    'Venue': 'Veranstaltungsort',
    'Agencia': 'Agentur',
    'agencia': 'agentur',
    'Propietario': 'Eigentümer',
    'propietario': 'eigentümer',
    'Administrador': 'Administrator',
    'administrador': 'administrator',
    'Miembro': 'Mitglied',
    'miembro': 'mitglied',
    'Visor': 'Betrachter',
    'visor': 'betrachter',
    'Invitación': 'Einladung',
    'invitación': 'einladung',
    'Actividad': 'Aktivität',
    'actividad': 'aktivität',
    'Estadísticas': 'Statistiken',
    'estadísticas': 'statistiken',
    'Básica': 'Grundlegend',
    'básica': 'grundlegend',
    'Creado': 'Erstellt',
    'creado': 'erstellt',
    'Solo lectura': 'Nur lesen',
    'solo lectura': 'nur lesen',
    'Guardado exitosamente': 'Erfolgreich gespeichert',
    'Error al guardar': 'Fehler beim Speichern',
    'Por favor': 'Bitte',
    'Zona de Peligro': 'Gefahrenzone',
    'Esta acción no se puede deshacer': 'Diese Aktion kann nicht rückgängig gemacht werden',
    'Escribe': 'Geben Sie ein',
    'para confirmar': 'zur Bestätigung',
    'Sí, Eliminar Definitivamente': 'Ja, Endgültig Löschen',
    'Eliminando...': 'Wird gelöscht...',
    'Guardando...': 'Wird gespeichert...',
    'Enviando...': 'Wird gesendet...',
    'Procesando...': 'Wird verarbeitet...',
    'Expirado': 'Abgelaufen',
    'expirado': 'abgelaufen',
    'Pendiente': 'Ausstehend',
    'pendiente': 'ausstehend',
    'Aceptada': 'Akzeptiert',
    'aceptada': 'akzeptiert',
    'Rechazada': 'Abgelehnt',
    'rechazada': 'abgelehnt',
  },
  it: {
    'Calendario': 'Calendario',
    'calendario': 'calendario',
    'Finanzas': 'Finanze',
    'finanzas': 'finanze',
    'Shows': 'Spettacoli',
    'shows': 'spettacoli',
    'Viajes': 'Viaggi',
    'viajes': 'viaggi',
    'Miembros': 'Membri',
    'miembros': 'membri',
    'Ajustes': 'Impostazioni',
    'ajustes': 'impostazioni',
    'Configuración': 'Configurazione',
    'configuración': 'configurazione',
    'Organización': 'Organizzazione',
    'organización': 'organizzazione',
    'Equipos': 'Squadre',
    'equipos': 'squadre',
    'Guardar': 'Salvare',
    'guardar': 'salvare',
    'Cancelar': 'Annullare',
    'cancelar': 'annullare',
    'Eliminar': 'Eliminare',
    'eliminar': 'eliminare',
    'Editar': 'Modificare',
    'editar': 'modificare',
    'Invitar': 'Invitare',
    'invitar': 'invitare',
    'Aceptar': 'Accettare',
    'aceptar': 'accettare',
    'Rechazar': 'Rifiutare',
    'rechazar': 'rifiutare',
    'Nombre': 'Nome',
    'nombre': 'nome',
    'Email': 'Email',
    'Descripción': 'Descrizione',
    'descripción': 'descrizione',
    'Tipo': 'Tipo',
    'tipo': 'tipo',
    'Tour': 'Tour',
    'Banda': 'Gruppo',
    'banda': 'gruppo',
    'Venue': 'Luogo',
    'Agencia': 'Agenzia',
    'agencia': 'agenzia',
    'Propietario': 'Proprietario',
    'propietario': 'proprietario',
    'Administrador': 'Amministratore',
    'administrador': 'amministratore',
    'Miembro': 'Membro',
    'miembro': 'membro',
    'Visor': 'Visualizzatore',
    'visor': 'visualizzatore',
    'Invitación': 'Invito',
    'invitación': 'invito',
    'Actividad': 'Attività',
    'actividad': 'attività',
    'Estadísticas': 'Statistiche',
    'estadísticas': 'statistiche',
    'Básica': 'Base',
    'básica': 'base',
    'Creado': 'Creato',
    'creado': 'creato',
    'Solo lectura': 'Solo lettura',
    'solo lectura': 'solo lettura',
    'Guardado exitosamente': 'Salvato con successo',
    'Error al guardar': 'Errore durante il salvataggio',
    'Por favor': 'Per favore',
    'Zona de Peligro': 'Zona Pericolosa',
    'Esta acción no se puede deshacer': 'Questa azione non può essere annullata',
    'Escribe': 'Digita',
    'para confirmar': 'per confermare',
    'Sí, Eliminar Definitivamente': 'Sì, Elimina Definitivamente',
    'Eliminando...': 'Eliminazione...',
    'Guardando...': 'Salvataggio...',
    'Enviando...': 'Invio...',
    'Procesando...': 'Elaborazione...',
    'Expirado': 'Scaduto',
    'expirado': 'scaduto',
    'Pendiente': 'In attesa',
    'pendiente': 'in attesa',
    'Aceptada': 'Accettata',
    'aceptada': 'accettata',
    'Rechazada': 'Rifiutata',
    'rechazada': 'rifiutata',
  },
  pt: {
    'Calendario': 'Calendário',
    'calendario': 'calendário',
    'Finanzas': 'Finanças',
    'finanzas': 'finanças',
    'Shows': 'Shows',
    'shows': 'shows',
    'Viajes': 'Viagens',
    'viajes': 'viagens',
    'Miembros': 'Membros',
    'miembros': 'membros',
    'Ajustes': 'Configurações',
    'ajustes': 'configurações',
    'Configuración': 'Configuração',
    'configuración': 'configuração',
    'Organización': 'Organização',
    'organización': 'organização',
    'Equipos': 'Equipes',
    'equipos': 'equipes',
    'Guardar': 'Salvar',
    'guardar': 'salvar',
    'Cancelar': 'Cancelar',
    'cancelar': 'cancelar',
    'Eliminar': 'Eliminar',
    'eliminar': 'eliminar',
    'Editar': 'Editar',
    'editar': 'editar',
    'Invitar': 'Convidar',
    'invitar': 'convidar',
    'Aceptar': 'Aceitar',
    'aceptar': 'aceitar',
    'Rechazar': 'Rejeitar',
    'rechazar': 'rejeitar',
    'Nombre': 'Nome',
    'nombre': 'nome',
    'Email': 'Email',
    'Descripción': 'Descrição',
    'descripción': 'descrição',
    'Tipo': 'Tipo',
    'tipo': 'tipo',
    'Tour': 'Tour',
    'Banda': 'Banda',
    'banda': 'banda',
    'Venue': 'Local',
    'Agencia': 'Agência',
    'agencia': 'agência',
    'Propietario': 'Proprietário',
    'propietario': 'proprietário',
    'Administrador': 'Administrador',
    'administrador': 'administrador',
    'Miembro': 'Membro',
    'miembro': 'membro',
    'Visor': 'Visualizador',
    'visor': 'visualizador',
    'Invitación': 'Convite',
    'invitación': 'convite',
    'Actividad': 'Atividade',
    'actividad': 'atividade',
    'Estadísticas': 'Estatísticas',
    'estadísticas': 'estatísticas',
    'Básica': 'Básica',
    'básica': 'básica',
    'Creado': 'Criado',
    'creado': 'criado',
    'Solo lectura': 'Somente leitura',
    'solo lectura': 'somente leitura',
    'Guardado exitosamente': 'Salvo com sucesso',
    'Error al guardar': 'Erro ao salvar',
    'Por favor': 'Por favor',
    'Zona de Peligro': 'Zona de Perigo',
    'Esta acción no se puede deshacer': 'Esta ação não pode ser desfeita',
    'Escribe': 'Digite',
    'para confirmar': 'para confirmar',
    'Sí, Eliminar Definitivamente': 'Sim, Eliminar Definitivamente',
    'Eliminando...': 'Eliminando...',
    'Guardando...': 'Salvando...',
    'Enviando...': 'Enviando...',
    'Procesando...': 'Processando...',
    'Expirado': 'Expirado',
    'expirado': 'expirado',
    'Pendiente': 'Pendente',
    'pendiente': 'pendente',
    'Aceptada': 'Aceita',
    'aceptada': 'aceita',
    'Rechazada': 'Rejeitada',
    'rechazada': 'rejeitada',
  }
};

// Auto-translate function
function autoTranslate(text, lang) {
  if (!translations[lang]) return text;
  
  let translated = text;
  const mapping = translations[lang];
  
  // Replace all matched terms
  Object.entries(mapping).forEach(([es, target]) => {
    // Use word boundaries to avoid partial matches
    const regex = new RegExp(es, 'g');
    translated = translated.replace(regex, target);
  });
  
  return translated;
}

// Generate translations for critical keys (those in org.*, permissions.*, roles.*, invitations.*)
const criticalPrefixes = [
  'org.',
  'permissions.',
  'roles.',
  'invitations.',
  'common.',
  'nav.',
  'settings.',
  'dashboard.',
  'finance.',
  'shows.',
  'calendar.',
  'members.',
  'activity.'
];

const newTranslations = {
  fr: [],
  de: [],
  it: [],
  pt: []
};

Object.entries(esKeys).forEach(([key, value]) => {
  // Check if this is a critical key
  const isCritical = criticalPrefixes.some(prefix => key.startsWith(prefix));
  
  if (isCritical) {
    Object.keys(newTranslations).forEach(lang => {
      const translated = autoTranslate(value, lang);
      newTranslations[lang].push(`    , '${key}': '${translated}'`);
    });
  }
});

console.log('\\n📝 Generated translations:');
Object.entries(newTranslations).forEach(([lang, lines]) => {
  console.log(`${lang.toUpperCase()}: ${lines.length} keys`);
});

// Output to console (you can pipe this to a file)
console.log('\\n\\n=== FRENCH (FR) ADDITIONS ===');
console.log(newTranslations.fr.join('\\n'));

console.log('\\n\\n=== GERMAN (DE) ADDITIONS ===');
console.log(newTranslations.de.join('\\n'));

console.log('\\n\\n=== ITALIAN (IT) ADDITIONS ===');
console.log(newTranslations.it.join('\\n'));

console.log('\\n\\n=== PORTUGUESE (PT) ADDITIONS ===');
console.log(newTranslations.pt.join('\\n'));

console.log('\\n\\n✅ Done! Copy the translations above into src/lib/i18n.ts');
