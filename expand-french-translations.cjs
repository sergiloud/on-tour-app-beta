#!/usr/bin/env node

/**
 * AI-Assisted French Translation Expander
 * On Tour App v2.2.1 - I18N Expansion Plan Implementation
 * 
 * This script expands French translations from 316 entries to comprehensive coverage
 * with proper touring industry terminology and French localization patterns.
 */

const fs = require('fs');

// Read the current i18n file
const filePath = './src/lib/i18n.ts';
const content = fs.readFileSync(filePath, 'utf-8');

// Extract English translations
const enStart = content.indexOf('en: {');
const esStart = content.indexOf('es: {');
const enSection = content.slice(enStart, esStart);

// Parse English translations
const enLines = enSection.split('\n').slice(1, -1); // Remove 'en: {' and closing
const enTranslations = {};

enLines.forEach(line => {
  const match = line.match(/\s*[,]?\s*'([^']+)':\s*'([^']*)'/);
  if (match) {
    const [, key, value] = match;
    enTranslations[key] = value;
  }
});

console.log('📖 Extracted', Object.keys(enTranslations).length, 'English translations');

// Extract existing French translations
const frStart = content.indexOf('fr: {');
const deStart = content.indexOf('de: {');
const frSection = content.slice(frStart, deStart);

const existingFrTranslations = {};
const frLines = frSection.split('\n');
frLines.forEach(line => {
  const match = line.match(/\s*[,]?\s*'([^']+)':\s*'([^']*)'/);
  if (match) {
    const [, key, value] = match;
    existingFrTranslations[key] = value;
  }
});

console.log('🇫🇷 Existing French translations:', Object.keys(existingFrTranslations).length);

// Comprehensive French translations with touring industry context
const newFrenchTranslations = {
  // Missing common actions and navigation
  'common.save': 'Enregistrer',
  'common.cancel': 'Annuler',
  'common.delete': 'Supprimer',
  'common.edit': 'Modifier',
  'common.add': 'Ajouter',
  'common.remove': 'Supprimer',
  'common.create': 'Créer',
  'common.update': 'Mettre à jour',
  'common.open': 'Ouvrir',
  'common.apply': 'Appliquer',
  'common.retry': 'Réessayer',
  'common.loading': 'Chargement…',
  'common.none': 'Aucun',
  'common.all': 'Tous',
  'common.today': 'Aujourd\'hui',
  'common.tomorrow': 'Demain',
  'common.yesterday': 'Hier',
  'common.go': 'Aller',
  'common.show': 'Afficher',
  'common.search': 'Rechercher',
  'common.copy': 'Copier',
  'common.move': 'Déplacer',
  'common.clear': 'Effacer',
  'common.reset': 'Réinitialiser',
  'common.done': 'Terminé',
  'common.current': 'Actuel',
  'common.compare': 'Comparer',
  'common.list': 'Liste',
  'common.optional': 'Optionnel',
  'common.income': 'Revenus',
  'common.net': 'Net',
  'common.costs': 'Coûts',
  'common.total': 'Total',
  'common.more': 'Plus',
  'common.less': 'Moins',
  'common.filter': 'Filtrer',
  'common.filters': 'Filtres',
  'common.sort': 'Trier',
  'common.group': 'Grouper',
  'common.export': 'Exporter',
  'common.import': 'Importer',
  'common.upload': 'Télécharger',
  'common.download': 'Télécharger',
  'common.print': 'Imprimer',
  'common.share': 'Partager',
  'common.invite': 'Inviter',
  'common.join': 'Rejoindre',
  'common.leave': 'Quitter',
  'common.settings': 'Paramètres',
  'common.preferences': 'Préférences',
  'common.profile': 'Profil',
  'common.account': 'Compte',
  'common.organization': 'Organisation',
  'common.team': 'Équipe',
  'common.member': 'Membre',
  'common.members': 'Membres',
  'common.role': 'Rôle',
  'common.permission': 'Permission',
  'common.permissions': 'Permissions',
  'common.access': 'Accès',
  'common.security': 'Sécurité',
  'common.privacy': 'Confidentialité',
  'common.terms': 'Conditions',
  'common.policy': 'Politique',

  // Missing KPIs and dashboard elements
  'kpi.activeMembers': 'Membres actifs',
  'kpi.totalRevenue': 'Revenus totaux',
  'kpi.netIncome': 'Revenus nets',
  'kpi.totalShows': 'Shows totaux',
  'kpi.avgFee': 'Cachet moyen',
  'kpi.growthRate': 'Taux de croissance',
  'kpi.thisMonth': 'Ce mois',
  'kpi.yearTotal': 'Total annuel',
  'kpi.upcoming': 'À venir',
  'kpi.active': 'Actif',
  'kpi.managed': 'Géré',
  'kpi.artists': 'Artistes',
  'kpi.documents': 'Documents',

  // Missing dashboard components
  'dashboard.title': 'Centre de Contrôle de Tournée',
  'dashboard.subtitle': 'Surveillez les performances de votre tournée, le statut de la mission et agissez sur ce qui compte le plus',
  'dashboard.map.title': 'Carte de Tournée',
  'dashboard.activity.title': 'Activité Récente',
  'dashboard.actions.title': 'Actions Rapides',
  'dashboard.actions.newShow': 'Ajouter Nouveau Show',
  'dashboard.actions.quickFinance': 'Contrôle Finance Rapide',
  'dashboard.actions.travelBooking': 'Réserver Voyage',
  'dashboard.areas.finance.title': 'Finance',
  'dashboard.areas.finance.description': 'Suivre les revenus, les coûts et la rentabilité',
  'dashboard.areas.shows.title': 'Shows & Événements',
  'dashboard.areas.shows.description': 'Gérer les performances et les salles',
  'dashboard.areas.travel.title': 'Voyage & Logistique',
  'dashboard.areas.travel.description': 'Planifier et suivre les arrangements de voyage',
  'dashboard.kpi.financialHealth': 'Santé Financière',
  'dashboard.kpi.nextEvent': 'Prochain Événement Critique',
  'dashboard.kpi.ticketSales': 'Ventes de Billets',

  // Missing show management
  'shows.title': 'Shows',
  'shows.notFound': 'Show non trouvé',
  'shows.add': 'Ajouter Show',
  'shows.edit': 'Modifier',
  'shows.delete': 'Supprimer',
  'shows.duplicate': 'Dupliquer',
  'shows.archive': 'Archiver',
  'shows.restore': 'Restaurer',
  'shows.promote': 'Promouvoir',
  'shows.empty': 'Aucun Show ne correspond à vos filtres',
  'shows.empty.add': 'Ajouter votre premier Show',
  'shows.count.singular': 'Show',
  'shows.count.plural': 'Shows',
  'shows.summary.upcoming': 'À venir',
  'shows.summary.totalFees': 'Cachets Totaux',
  'shows.summary.estNet': 'Net Estimé',
  'shows.summary.avgWht': 'Retenue Moy.',
  'shows.summary.avgFee': 'Cachet Moyen',
  'shows.summary.avgMargin': 'Marge Moyenne',
  'shows.table.date': 'Date',
  'shows.table.name': 'Show',
  'shows.table.city': 'Ville',
  'shows.table.country': 'Pays',
  'shows.table.venue': 'Salle',
  'shows.table.promoter': 'Promoteur',
  'shows.table.fee': 'Cachet',
  'shows.table.wht': 'Retenue %',
  'shows.table.net': 'Net',
  'shows.table.margin': 'Marge %',
  'shows.table.status': 'Statut',
  'shows.table.notes': 'Notes',

  // Missing show editor
  'shows.editor.title.add': 'Ajouter Show',
  'shows.editor.title.edit': 'Modifier Show',
  'shows.editor.tab.details': 'Détails',
  'shows.editor.tab.finance': 'Finance',
  'shows.editor.tab.costs': 'Coûts',
  'shows.editor.label.name': 'Nom du Show',
  'shows.editor.label.date': 'Date',
  'shows.editor.label.time': 'Heure',
  'shows.editor.label.city': 'Ville',
  'shows.editor.label.country': 'Pays',
  'shows.editor.label.venue': 'Salle',
  'shows.editor.label.promoter': 'Promoteur',
  'shows.editor.label.fee': 'Cachet',
  'shows.editor.label.wht': 'Retenue %',
  'shows.editor.label.status': 'Statut',
  'shows.editor.label.notes': 'Notes',
  'shows.editor.placeholder.name': 'Nom du festival ou du show',
  'shows.editor.placeholder.venue': 'Nom de la salle',
  'shows.editor.placeholder.promoter': 'Nom du promoteur ou société',
  'shows.editor.placeholder.notes': 'Ajouter des notes pertinentes, exigences ou conditions spéciales...',
  'shows.editor.help.fee': 'Cachet brut convenu (avant taxes, commissions, coûts)',
  'shows.editor.help.wht': 'Pourcentage de retenue fiscale locale (auto-suggéré par pays)',
  'shows.editor.help.notes': 'Notes internes visibles seulement par vous',
  'shows.editor.save': 'Enregistrer',
  'shows.editor.saving': 'Enregistrement…',
  'shows.editor.saved': 'Enregistré ✓',

  // Missing finance
  'finance.title': 'Finance',
  'finance.overview': 'Aperçu financier',
  'finance.ledger': 'Grand livre',
  'finance.pipeline': 'Pipeline',
  'finance.targets': 'Objectifs',
  'finance.quicklook': 'Aperçu rapide',
  'finance.thisMonth': 'Ce mois',
  'finance.income': 'Revenus',
  'finance.expenses': 'Dépenses',
  'finance.net': 'Net',
  'finance.confirmed': 'Confirmé',
  'finance.pending': 'En attente',
  'finance.offer': 'Offre',
  'finance.shows': 'Shows',
  'finance.date': 'Date',
  'finance.description': 'Description',
  'finance.category': 'Catégorie',
  'finance.amount': 'Montant',
  'finance.transactions': 'transactions',
  'finance.noTransactions': 'Aucune transaction trouvée',

  // Missing travel
  'travel.title': 'Voyage',
  'travel.trips': 'Voyages',
  'travel.trip.new': 'Nouveau Voyage',
  'travel.segments': 'Segments',
  'travel.timeline.title': 'Chronologie de Voyage',
  'travel.hub.title': 'Recherche',
  'travel.hub.upcoming': 'À venir',
  'travel.results.title': 'Résultats',
  'travel.compare': 'Comparer',
  'travel.pin': 'Épingler',
  'travel.unpin': 'Désépingler',
  'travel.provider': 'Fournisseur',
  'travel.adult': 'Adulte',
  'travel.multicity': 'Multi-villes',
  'travel.window': 'Fenêtre',
  'travel.nonstop': 'Sans escale',

  // Missing calendar
  'calendar.title': 'Calendrier',
  'calendar.prev': 'Mois précédent',
  'calendar.next': 'Mois suivant',
  'calendar.today': 'Aujourd\'hui',
  'calendar.goto': 'Aller à la date',
  'calendar.view.month': 'Mois',
  'calendar.view.week': 'Semaine',
  'calendar.view.day': 'Jour',
  'calendar.view.agenda': 'Agenda',
  'calendar.timezone': 'Fuseau horaire',
  'calendar.noEvents': 'Aucun événement pour ce jour',
  'calendar.kind.show': 'Show',
  'calendar.kind.travel': 'Voyage',
  'calendar.kind.meeting': 'Réunion',
  'calendar.kind.rehearsal': 'Répétition',
  'calendar.kind.break': 'Pause',
  'calendar.kind.other': 'Autre Événement',

  // Missing settings
  'settings.title': 'Paramètres',
  'settings.personal': 'Personnel',
  'settings.preferences': 'Préférences',
  'settings.security': 'Sécurité',
  'settings.organization': 'Organisation',
  'settings.billing': 'Facturation',
  'settings.currency': 'Devise',
  'settings.language': 'Langue',
  'settings.language.en': 'Anglais',
  'settings.language.es': 'Espagnol',
  'settings.language.fr': 'Français',
  'settings.language.de': 'Allemand',
  'settings.language.it': 'Italien',
  'settings.language.pt': 'Portugais',

  // Missing organization
  'org.overview.title': 'Aperçu de l\'Organisation',
  'org.members.title': 'Membres',
  'org.teams.title': 'Équipes',
  'org.links.title': 'Liens',
  'org.reports.title': 'Rapports',
  'org.documents.title': 'Documents',
  'org.integrations.title': 'Intégrations',
  'org.billing.title': 'Facturation',
  'org.branding.title': 'Image de marque',

  // Missing status values
  'status.confirmed': 'Confirmé',
  'status.pending': 'En attente',
  'status.offer': 'Offre',
  'status.canceled': 'Annulé',
  'status.archived': 'Archivé',
  'status.postponed': 'Reporté',

  // Missing permissions and roles
  'permissions.canEdit': 'Peut modifier',
  'permissions.edit': 'Modifier',
  'permissions.full': 'Complet',
  'permissions.fullAccess': 'Accès complet',
  'permissions.insufficientAccess': 'Accès insuffisant',
  'permissions.locked': 'Verrouillé',
  'permissions.noAccess': 'Aucun accès',
  'permissions.none': 'Aucun',
  'permissions.read': 'Lecture',
  'permissions.readOnly': 'Lecture seule',
  'permissions.restricted': 'Restreint',
  'permissions.viewOnly': 'Affichage uniquement',
  'permissions.write': 'Écriture',
  'permissions.yourRole': 'Votre rôle',
  'roles.admin': 'Administrateur',
  'roles.finance': 'Finance',
  'roles.member': 'Membre',
  'roles.owner': 'Propriétaire',
  'roles.viewer': 'Visualiseur',

  // Missing error messages
  'error.generic': 'Une erreur s\'est produite',
  'error.mapLoadError': 'La carte n\'a pas pu se charger',
  'error.tryAgain': 'Veuillez réessayer',
  'error.somethingWentWrong': 'Quelque chose s\'est mal passé',

  // Missing validation
  'validation.required': 'Ce champ est requis',
  'validation.emailRequired': 'E-mail requis',
  'validation.nameRequired': 'Nom requis',
  'validation.passwordRequired': 'Mot de passe requis',
  'validation.passwordMinLength': 'Le mot de passe doit contenir au moins 6 caractères',
  'validation.invalidEmail': 'Veuillez entrer un e-mail valide',

  // Missing empty states
  'empty.noUpcoming': 'Aucun événement à venir',
  'empty.noPeople': 'Aucune personne encore',
  'empty.noMembers': 'Aucun membre',
  'empty.noTeams': 'Aucune équipe',
  'empty.noResults': 'Aucun résultat'
};

// Combine existing with new translations, giving priority to existing ones
const combinedTranslations = { ...newFrenchTranslations, ...existingFrTranslations };

console.log('✨ New French translations to add:', Object.keys(newFrenchTranslations).length);
console.log('📊 Total French translations after expansion:', Object.keys(combinedTranslations).length);

// Generate the complete French section
const frenchSection = [
  '  fr: {'
];

Object.entries(combinedTranslations).forEach(([key, value]) => {
  // Escape single quotes in the translation
  const escapedValue = value.replace(/'/g, "\\'");
  frenchSection.push('    , \'' + key + '\': \'' + escapedValue + '\'');
});

frenchSection.push('  },');
frenchSection.push('');

// Write to file for manual integration
fs.writeFileSync('./french-translations-expanded.txt', frenchSection.join('\n'));

console.log('📝 Expanded French translations generated!');
console.log('💾 Saved to french-translations-expanded.txt');
console.log('🔧 Ready for integration into i18n.ts');
console.log('📈 Completion will increase from ~12% to ~' + Math.round((Object.keys(combinedTranslations).length / Object.keys(enTranslations).length) * 100) + '%');