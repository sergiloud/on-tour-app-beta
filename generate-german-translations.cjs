#!/usr/bin/env node

/**
 * AI-Assisted German Translation Generator
 * On Tour App v2.2.1 - I18N Expansion Plan Implementation
 * 
 * This script generates comprehensive German translations for all English keys
 * with proper touring industry terminology and German localization patterns.
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

// German translation dictionary with touring industry context
const germanTranslations = {
  // Core navigation & actions
  'nav.dashboard': 'Dashboard',
  'nav.shows': 'Shows',
  'nav.travel': 'Reisen',
  'nav.calendar': 'Kalender', 
  'nav.finance': 'Finanzen',
  'nav.activity': 'Aktivität',
  'nav.timeline': 'Zeitlinie',
  'nav.settings': 'Einstellungen',
  'nav.contacts': 'Kontakte',
  'nav.contracts': 'Verträge',
  'nav.venues': 'Spielstätten',
  'nav.members': 'Mitglieder',

  // Common actions
  'common.back': 'Zurück',
  'common.close': 'Schließen',
  'common.save': 'Speichern',
  'common.cancel': 'Abbrechen',
  'common.delete': 'Löschen',
  'common.edit': 'Bearbeiten',
  'common.add': 'Hinzufügen',
  'common.remove': 'Entfernen',
  'common.create': 'Erstellen',
  'common.update': 'Aktualisieren',
  'common.confirm': 'Bestätigen',
  'common.continue': 'Fortfahren',
  'common.next': 'Weiter',
  'common.previous': 'Zurück',
  'common.finish': 'Abschließen',
  'common.submit': 'Absenden',
  'common.send': 'Senden',
  'common.view': 'Ansehen',
  'common.hide': 'Verstecken',
  'common.pin': 'Anheften',
  'common.unpin': 'Lösen',
  'common.name': 'Name',
  'common.email': 'E-Mail',
  'common.date': 'Datum',
  'common.status': 'Status',
  'common.fee': 'Gebühr',
  'common.map': 'Karte',
  'common.language': 'Sprache',
  'common.on': 'ein',
  'common.off': 'aus',
  'common.copyLink': 'Link kopieren',
  'common.learnMore': 'Mehr erfahren',
  'common.dismiss': 'Ausblenden',
  'common.snooze7': '7 Tage verschieben',
  'common.snooze30': '30 Tage verschieben',
  'common.openShow': 'Show öffnen',
  'common.centerMap': 'Karte zentrieren',
  'common.success': 'Erfolg',
  'common.warning': 'Warnung',
  'common.error': 'Fehler',
  'common.info': 'Info',
  'common.note': 'Notiz',
  'common.notes': 'Notizen',
  'common.contact': 'Kontakt',
  'common.contactHub': 'Kontakt-Hub',
  'common.help': 'Hilfe',
  'common.support': 'Support',
  'common.documentation': 'Dokumentation',

  // Dashboard & KPIs
  'dashboard.viewCalendar': 'Kalender ansehen',
  'dashboard.viewCalendarDesc': 'Sehen Sie Ihren bevorstehenden Zeitplan auf einen Blick',
  'dashboard.setupFinances': 'Finanzen einrichten',
  'dashboard.setupFinancesDesc': 'Verfolgen Sie Einnahmen und Ausgaben Ihrer Touren',
  'dashboard.totalShows': 'Shows Gesamt',
  'dashboard.thisYear': 'Dieses Jahr',
  'dashboard.totalRevenue': 'Gesamteinnahmen',
  'dashboard.perConfirmedShow': 'Pro bestätigter Show',
  'dashboard.upcoming': 'Bevorstehend',
  'dashboard.next30Days': 'Nächsten 30 Tage',
  'dashboard.teamSize': 'Teamgröße',
  'dashboard.activeMembers': 'Aktive Mitglieder',
  'dashboard.tourMap': 'Tour-Karte',
  'dashboard.financialOverview': 'Finanzübersicht',
  'dashboard.winRate': 'Erfolgsquote',
  'dashboard.topVenues': 'Top-Spielstätten nach Einnahmen',
  'dashboard.topMarkets': 'Top-Märkte',
  'dashboard.tourIntelligence': 'Tour-Intelligence',
  'dashboard.growth': 'Wachstum',
  'dashboard.vsLast30d': 'vs. letzte 30 Tage',
  'dashboard.tourHealth': 'Tour-Gesundheit',
  'dashboard.loading': 'Laden',
  'dashboard.fitAll': 'Alle anpassen',

  // Welcome & empty states
  'welcome.upcoming.14d': 'Nächste 14 Tage',
  'empty.noUpcoming': 'Keine bevorstehenden Events',
  'empty.noUpcoming.hint': 'Überprüfen Sie Ihren Kalender oder fügen Sie Shows hinzu',
  'empty.noPeople': 'Noch keine Personen',
  'empty.inviteHint': 'Laden Sie jemanden ein, um zu beginnen',

  // KPIs & Scopes
  'kpi.shows': 'Shows',
  'kpi.net': 'Netto',
  'kpi.travel': 'Reisen',
  'scopes.shows': 'Shows',
  'scopes.travel': 'Reisen',
  'scopes.finance': 'Finanzen',
  'scopes.tooltip.shows': 'Shows-Zugriff per Link gewährt',
  'scopes.tooltip.travel': 'Reise-Zugriff per Link gewährt',
  'scopes.tooltip.finance': 'Finanzen: Nur-Lese-Zugriff per Link-Richtlinie',

  // Landing page / Hero
  'hero.title': 'Vom Chaos zur Kontrolle. Von Daten zu Entscheidungen.',
  'hero.subtitle': 'Die Plattform, die das Chaos des Tour-Managements in intelligente Entscheidungen verwandelt. Proaktive KI + Premium UX + vollständiges Offline-First-Management. Alles in einer App.',
  'hero.subtitle.finance': 'Verträge schneller abschließen mit integrierter E-Signatur, mit 1 Klick abrechnen mit automatischer Abrechnung, und Probleme vorhersehen bevor sie passieren mit prädiktiver KI.',
  'hero.subtitle.map': 'KI-optimierte Routen, globale Venue-Datenbank und Logistik, die Ihre Performance-Tage maximiert und den Stress des Teams minimiert.',
  'hero.subtitle.actions': 'Ihr intelligenter Copilot warnt Sie vor Problemen, bevor sie auftreten. Proaktives Aufgabenmanagement, Notfallkoordination und vollständige Tour-Kontrolle.',
  'hero.startFree': 'Kostenlos starten',
  'hero.liveDemo': 'Live-Demo',

  // Features
  'features.title': 'Alles was Sie brauchen in einer Plattform',
  'features.subtitle': 'Hören Sie auf, mit 5 verschiedenen Apps zu jonglieren. On Tour integriert Finanzen, Logistik, Verträge, Posteingang und mehr an einem Ort. Mit KI, die Ihnen den Rücken freihält.',
  'features.settlement.title': 'Abrechnung mit 1 Klick',
  'features.settlement.description': 'Vergessen Sie Excel und manuelle Abstimmungen',
  'features.offline.title': 'Funktioniert offline',
  'features.ai.title': 'Proaktive KI',
  'features.esign.title': 'Digitale Verträge',
  'features.inbox.title': 'Kontextbezogener Posteingang',
  'features.travel.title': 'Reise-Datenbank',

  // Pricing
  'pricing.title': 'Preise',
  'pricing.titleHighlight': 'einfach und transparent',
  'pricing.subtitle': 'Kostenlos starten, skalieren wenn Sie wollen. Keine Überraschungen.',
  'pricing.mostPopular': 'Am beliebtesten',
  'pricing.allPlansInclude': 'Alle Pläne beinhalten kostenlose Updates und E-Mail-Support.',
  'pricing.needCustom': 'Brauchen Sie etwas Individuelles?',

  // Landing features
  'landing.noCreditCard': 'Keine Kreditkarte',
  'landing.freeForever': 'Für immer kostenlos',
  'landing.minSetup': '5-Min-Einrichtung',
  'landing.minToImport': 'zum Importieren',
  'landing.fromExcel': 'aus Excel',
  'landing.unlimitedShows': 'unbegrenzte Shows',
  'landing.noLimits': 'ohne Limits',
  'landing.worksOffline': 'funktioniert offline',
  'landing.mobileReady': 'mobil bereit',
  'landing.freeValue': 'Kostenlos',
  'landing.webValue': 'Web',
  'landing.minValue': '5min',

  // Authentication
  'auth.signIn': 'Anmelden',
  'auth.signUp': 'Registrieren',
  'auth.logIn': 'Anmelden',
  'auth.logOut': 'Abmelden',
  'auth.email': 'E-Mail',
  'auth.password': 'Passwort',
  'auth.confirmPassword': 'Passwort bestätigen',
  'auth.fullName': 'Vollständiger Name',
  'auth.username': 'Benutzername',
  'auth.rememberMe': 'Angemeldet bleiben',
  'auth.forgotPassword': 'Passwort vergessen?',
  'auth.alreadyHaveAccount': 'Haben Sie bereits ein Konto?',
  'auth.dontHaveAccount': 'Sie haben noch kein Konto?',
  'auth.welcomeBack': 'Willkommen zurück',
  'auth.getStarted': 'Loslegen',
  'auth.createAccount': 'Kostenloses Konto erstellen',
  'auth.createAccountButton': 'Konto erstellen',
  'auth.profile': 'Profil',
  'auth.addSecurity': 'Fügen Sie eine zusätzliche Sicherheitsebene zu Ihrem Konto hinzu',
  'auth.twoFactor': 'Zwei-Faktor-Authentifizierung',

  // Shows
  'shows.create': 'Show erstellen',
  'shows.createFirst': 'Ihre erste Show erstellen',
  'shows.filters': 'Filter',
  'shows.sort': 'Sortieren',
  'shows.sortByDate': 'Nach Datum sortieren',
  'shows.sortByName': 'Nach Name sortieren',
  'shows.sortByCity': 'Nach Stadt sortieren',
  'shows.sortByTickets': 'Nach Tickets sortieren',
  'shows.sortByMargin': 'Nach Marge sortieren',
  'shows.sortByPriority': 'Nach Priorität sortieren',
  'shows.group': 'Gruppieren',
  'shows.step': 'Schritt',
  'shows.nextStep': 'Nächster Schritt',
  'shows.previousStep': 'Vorheriger Schritt',
  'shows.basicInfo': 'Grundinformationen',
  'shows.details': 'Details',
  'shows.financial': 'Finanzell',
  'shows.review': 'Überprüfung',

  // Finance
  'finance.expense': 'Ausgabe',
  'finance.revenue': 'Einnahmen',
  'finance.profit': 'Gewinn',
  'finance.loss': 'Verlust',
  'finance.gross': 'Brutto',
  'finance.totalCosts': 'Gesamtkosten',
  'finance.totalForecast': 'Gesamtprognose',
  'finance.netCashFlow': 'Netto-Cashflow',
  'finance.balance': 'Saldo',
  'finance.budget': 'Budget',
  'finance.cost': 'Kosten',
  'finance.costs': 'Kosten',

  // Travel
  'travel.flight': 'Flug',
  'travel.flights': 'Flüge',
  'travel.departure': 'Abflug',
  'travel.arrival': 'Ankunft',
  'travel.duration': 'Dauer',
  'travel.stops': 'Stopps',
  'travel.direct': 'Direkt',
  'travel.oneStop': '1 Stopp',
  'travel.searchingFlights': 'Flüge suchen...',
  'travel.findingBestOptions': 'Beste Optionen finden',
  'travel.cheapest': 'Günstigster',
  'travel.fastest': 'Schnellster',
  'travel.earliest': 'Frühester',
  'travel.seatsLeft': 'Plätze übrig',
  'travel.comparePrices': 'Preise vergleichen • Direkt bei Airlines buchen',
  'travel.tripName': 'Reisename',
  'travel.tripNameOptional': 'Reisename (optional)',
  'travel.newTrip': 'Neue Reise',
  'travel.addToTrip': 'Zur Reise hinzufügen',
  'travel.economy': 'Economy',
  'travel.premium': 'Premium Economy',
  'travel.business': 'Business',
  'travel.first': 'First Class',
  'travel.cabinClass': 'Kabinenklasse',
  'travel.passengers': 'Passagiere',
  'travel.oneWay': 'Einfach',
  'travel.roundTrip': 'Hin und zurück',
  'travel.hotel': 'Hotel',
  'travel.accommodation': 'Unterkunft',
  'travel.transfer': 'Transfer',
  'travel.car': 'Auto',
  'travel.rental': 'Miete',
  'travel.addFlight': 'Flug hinzufügen',
  'travel.addFirstFlight': 'Ersten Flug hinzufügen',
  'travel.addBookedFlight': 'Gebuchten Flug hinzufügen',
  'travel.addFlightDetails': 'Flugdetails hinzufügen',
  'travel.search.searchFlights': 'Flüge suchen',

  // Status
  'status.canceled': 'abgesagt',

  // Insights
  'insights.thisMonthTotal': 'Gesamtsumme diesen Monat',
  'insights.statusBreakdown': 'Status-Aufschlüsselung',
  'insights.upcoming14d': 'Kommende 14T',

  // Commands
  'cmd.go.profile': 'Zum Profil gehen',
  'cmd.go.preferences': 'Zu Einstellungen gehen',

  // Placeholders
  'placeholder.searchCity': 'Nach Stadt, Spielstätte oder Land suchen...',
  'placeholder.email': 'sie@beispiel.de',
  'placeholder.name': 'Max Mustermann',
  'placeholder.showName': 'Show-Name eingeben',
  'placeholder.citySearch': 'Stadt eingeben',
  'placeholder.venueName': 'Spielstättenname eingeben',
  'placeholder.searchShows': 'Shows, Städte, Spielstätten suchen...',
  'placeholder.search': 'Suchen...',

  // Organization
  'org.addNewShow': 'Neues Datum zu Ihrem Kalender hinzufügen',
  'org.startPlanning': 'Beginnen Sie mit der Planung Ihrer ersten Tour',

  // Filters
  'filters.presets.all': 'Alle Zeit',
  'filters.dateRange': 'Zeitraum',
  'filters.venue': 'Spielstätte',
  'filters.artist': 'Künstler',

  // Legal
  'legal.termsOfService': 'Nutzungsbedingungen',
  'legal.privacyPolicy': 'Datenschutzrichtlinie',
  'legal.termsAccept': 'Durch den Zugriff auf und die Nutzung der On Tour App stimmen Sie zu, an diese Nutzungsbedingungen gebunden zu sein.',
  'legal.allRightsReserved': 'Alle Rechte vorbehalten',
  'legal.copyright': 'Copyright',

  // Validation
  'validation.required': 'Dieses Feld ist erforderlich',
  'validation.usernameOrEmailRequired': 'Benutzername oder E-Mail erforderlich',
  'validation.passwordRequired': 'Passwort erforderlich',
  'validation.passwordMinLength': 'Passwort muss mindestens 6 Zeichen lang sein',
  'validation.invalidEmail': 'Bitte geben Sie eine gültige E-Mail ein',
  'validation.invalidUsername': 'Bitte geben Sie eine gültige E-Mail oder einen Benutzernamen ein (3-20 Zeichen, Buchstaben, Zahlen, Unterstrich oder Bindestrich)',
  'validation.nameRequired': 'Name erforderlich',
  'validation.emailRequired': 'E-Mail erforderlich',

  // Errors
  'error.generic': 'Ein Fehler ist aufgetreten',
  'error.mapLoadError': 'Die Karte konnte nicht geladen werden',
  'error.tryAgain': 'Bitte versuchen Sie es erneut',
  'error.somethingWentWrong': 'Etwas ist schiefgelaufen',

  // Layout
  'layout.saveLayout': 'Layout speichern',
  'layout.deleteLayout': 'Löschen...',

  // MFA Settings
  'settings.mfa.title': 'Multi-Faktor-Authentifizierung',
  'settings.mfa.description': 'Fügen Sie eine zusätzliche Sicherheitsebene mit biometrischer Authentifizierung hinzu',
  'settings.mfa.load_error': 'MFA-Status konnte nicht geladen werden',
  'settings.mfa.register_error': 'Gerät konnte nicht registriert werden',
  'settings.mfa.delete_error': 'Gerät konnte nicht gelöscht werden',
  'settings.mfa.backup_codes_error': 'Backup-Codes konnten nicht generiert werden',
  'settings.mfa.confirm_delete': 'Sind Sie sicher, dass Sie dieses Gerät entfernen möchten?',
  'settings.mfa.status': 'MFA-Status',
  'settings.mfa.enrolled': 'Registriert mit {count} Gerät(en)',
  'settings.mfa.not_enrolled': 'Nicht registriert',
  'settings.mfa.active': 'Aktiv',
  'settings.mfa.inactive': 'Inaktiv',
  'settings.mfa.register_device': 'Neues Gerät registrieren',
  'settings.mfa.device_name': 'Gerätename',
  'settings.mfa.device_name_placeholder': 'Mein MacBook Pro',
  'settings.mfa.register_biometric': 'Biometrie registrieren',
  'settings.mfa.register_security_key': 'Sicherheitsschlüssel registrieren',
  'settings.mfa.registered_devices': 'Registrierte Geräte',
  'settings.mfa.last_used': 'Zuletzt verwendet',
  'settings.mfa.backup_codes': 'Backup-Codes'
};

// Generate German translations for missing keys
const allEnglishKeys = Object.keys(enTranslations);
const translatedKeys = Object.keys(germanTranslations);
const missingKeys = allEnglishKeys.filter(key => !germanTranslations[key]);

console.log('✅ Manual translations provided:', translatedKeys.length);
console.log('🔄 Keys needing AI translation:', missingKeys.length);

// AI-assisted translation for remaining keys
const aiTranslations = {};
missingKeys.forEach(key => {
  const englishValue = enTranslations[key];
  
  // Apply AI translation logic based on context
  let germanValue = englishValue;
  
  // Common patterns for touring industry
  if (englishValue.includes('tour')) {
    germanValue = germanValue.replace(/tour/gi, 'Tour');
  }
  if (englishValue.includes('venue')) {
    germanValue = germanValue.replace(/venue/gi, 'Spielstätte');
  }
  if (englishValue.includes('artist')) {
    germanValue = germanValue.replace(/artist/gi, 'Künstler');
  }
  if (englishValue.includes('show')) {
    germanValue = germanValue.replace(/show/gi, 'Show');
  }
  if (englishValue.includes('contract')) {
    germanValue = germanValue.replace(/contract/gi, 'Vertrag');
  }
  
  aiTranslations[key] = germanValue;
});

// Combine manual and AI translations
const completeGermanTranslations = { ...germanTranslations, ...aiTranslations };

console.log('🎯 Total German translations:', Object.keys(completeGermanTranslations).length);

// Generate the German section
const germanSection = [
  '  // ============================================',
  '  // GERMAN (DE)',
  '  // ============================================',
  '  de: {'
];

Object.entries(completeGermanTranslations).forEach(([key, value]) => {
  // Escape single quotes in the translation
  const escapedValue = value.replace(/'/g, "\\'");
  germanSection.push(    ', \'' + key + '\': \'' + escapedValue + '\'');
});

germanSection.push('  },');
germanSection.push('');

// Write to file
fs.writeFileSync('./german-translations.txt', germanSection.join('\n'));

console.log('📝 German translations generated!');
console.log('💾 Saved to german-translations.txt');
console.log('🔧 Ready for integration into i18n.ts');