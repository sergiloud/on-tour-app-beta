type Lang = 'en'|'es';

const DICT: Record<Lang, Record<string,string>> = {
  en: {
  'nav.dashboard': 'Dashboard',
  'nav.shows': 'Shows',
  'nav.travel': 'Travel',
  'nav.calendar': 'Calendar',
  'nav.finance': 'Finance',
  'nav.settings': 'Settings',
  'insights.thisMonthTotal': 'This Month Total',
  'insights.statusBreakdown': 'Status breakdown',
  'insights.upcoming14d': 'Upcoming 14d',
  'common.openShow': 'Open show',
  'common.centerMap': 'Center map',
  'common.dismiss': 'Dismiss',
  'common.snooze7': 'Snooze 7 days',
  'common.snooze30': 'Snooze 30 days',
  'common.back': 'Back',
  'common.date': 'Date',
  'common.fee': 'Fee',
  'common.status': 'Status',
  'common.on': 'on',
  'common.off': 'off',
  'common.hide': 'Hide',
  'common.map': 'Map',
  'common.close': 'Close',
  'common.language': 'Language',
  'layout.invite': 'Invite',
  'layout.build': 'Build: preview',
  'layout.demo': 'Status: demo feed',
  'alerts.title': 'Alert Center',
  'alerts.anySeverity': 'Any severity',
  'alerts.anyRegion': 'Any region',
  'alerts.anyTeam': 'Any team',
  'alerts.copySlack': 'Copy Slack',
  'alerts.copied': 'Copied \u2713',
  'alerts.noAlerts': 'No alerts',
  'map.openInDashboard': 'Open in dashboard',
  'common.skipToContent': 'Skip to content',
  'alerts.slackCopied': 'Slack payload copied',
  'alerts.copyManual': 'Open window to copy manually',
    'ah.title': 'Action Hub',
    'ah.tab.pending': 'Pending',
    'ah.tab.shows': 'This Month',
    'ah.tab.travel': 'Travel',
    'ah.tab.insights': 'Insights',
    'ah.filter.all': 'All',
    'ah.filter.risk': 'Risk',
    'ah.filter.urgency': 'Urgency',
    'ah.filter.opportunity': 'Opportunity',
    'ah.filter.offer': 'Offer',
    'ah.filter.finrisk': 'Finrisk',
    'ah.cta.addTravel': 'Add travel',
    'ah.cta.followUp': 'Follow up',
    'ah.cta.review': 'Review',
  'ah.cta.open': 'Open',
  'ah.empty': 'All caught up!',
  'ah.openTravel': 'Open Travel',
  'ah.done': 'Done',
  'ah.typeFilter': 'Type filter',
  'ah.why': 'Why?',
  'ah.why.title': 'Why this priority?',
  'ah.why.score': 'Score',
  'ah.why.impact': 'Impact',
  'ah.why.amount': 'Amount',
  'ah.why.inDays': 'In',
  'ah.why.overdue': 'Overdue',
  'ah.why.kind': 'Type',
  'finance.quicklook': 'Finance Quicklook',
  'finance.ledger': 'Ledger',
  'finance.targets': 'Targets',
  'finance.targets.month': 'Monthly targets',
  'finance.targets.year': 'Yearly targets',
  'finance.pipeline': 'Pipeline',
  'finance.pipeline.subtitle': 'Expected value (weighted by stage)',
  'finance.openFull': 'Open full finance',
  'finance.pivot': 'Pivot',
  'finance.pivot.group': 'Group',
  'finance.ar.view': 'View',
  'finance.ar.remind': 'Remind',
  'finance.ar.reminder.queued': 'Reminder queued',
  'finance.thisMonth': 'This Month',
  'finance.income': 'Income',
  'finance.expenses': 'Expenses',
  'finance.net': 'Net',
  'finance.byStatus': 'By status',
  'finance.byMonth': 'by month',
  'finance.confirmed': 'Confirmed',
  'finance.pending': 'Pending',
  'finance.compare': 'Compare prev',
  'charts.resetZoom': 'Reset zoom',
  'common.current': 'Current',
  'common.compare': 'Compare',
  'common.reminder': 'Reminder',
  'finance.ui.view': 'View',
  'finance.ui.classic': 'Classic',
  'finance.ui.beta': 'New (beta)',
  'finance.offer': 'Offer',
  'finance.shows': 'shows',
  'finance.noShowsMonth': 'No shows this month',
  'finance.hideAmounts': 'Hide amounts',
  'finance.hidden': 'Hidden',
  'common.open': 'Open',
  'common.apply': 'Apply',
  'common.saveView': 'Save view',
  'common.import': 'Import',
  'common.export': 'Export',
  'common.copied': 'Copied ✓',
  'common.markDone': 'Mark done',
  'common.hideItem': 'Hide',
  'views.import.invalidShape': 'Invalid views JSON shape',
  'views.import.invalidJson': 'Invalid JSON',
  'common.today': 'Today',
  'common.tomorrow': 'Tomorrow',
  'common.go': 'Go',
  'common.show': 'Show',
  'common.search': 'Search',
  'hud.next3weeks': 'Next 3 weeks',
  'hud.noTrips3weeks': 'No upcoming trips in 3 weeks',
  'hud.openShow': 'open show',
  'hud.openTrip': 'open travel',
  'hud.view.whatsnext': "What's Next",
  'hud.view.month': 'This Month',
  'hud.view.financials': 'Financials',
  'hud.view.whatsnext.desc': 'Upcoming 14 day summary',
  'hud.view.month.desc': 'Monthly financial & show snapshot',
  'hud.view.financials.desc': 'Financial intelligence breakdown',
  'hud.layer.heat': 'Heat',
  'hud.layer.status': 'Status',
  'hud.layer.route': 'Route',
  'hud.views': 'HUD views',
  'hud.layers': 'Map layers',
  'hud.missionControl': 'Mission Control',
  'hud.subtitle': 'Realtime map and upcoming shows',
  'hud.risks': 'Risks',
  'hud.assignProducer': 'Assign producer',
  'hud.mapLoadError': 'Map failed to load. Please retry.',
  'common.retry': 'Retry',
  'hud.viewChanged': 'View changed to',
  'hud.openEvent': 'open event'
  , 'hud.type.flight': 'Flight'
  , 'hud.type.ground': 'Ground'
  , 'hud.type.event': 'Event'
  , 'hud.fin.avgNetMonth': 'Avg Net (Month)'
  , 'hud.fin.runRateYear': 'Run Rate (Year)'
  , 'finance.forecast': 'Forecast vs Actual'
  , 'finance.forecast.legend.actual': 'Actual net'
  , 'finance.forecast.legend.p50': 'Forecast p50'
  , 'finance.forecast.legend.band': 'Confidence band'
  , 'finance.forecast.alert.under': 'Under forecast by'
  , 'finance.forecast.alert.above': 'Above optimistic by'
  , 'map.toggle.status': 'Toggle status markers'
  , 'map.toggle.route': 'Toggle route line'
  , 'map.toggle.heat': 'Toggle heat circles'
  , 'shows.exportCsv': 'Export CSV'
  , 'shows.filters.from': 'From'
  , 'shows.filters.to': 'To'
  , 'shows.items': 'items'
  , 'shows.date.presets': 'Presets'
  , 'shows.date.thisMonth': 'This Month'
  , 'shows.date.nextMonth': 'Next Month'
  , 'shows.tooltip.net': 'Fee minus WHT, commissions, and costs'
  , 'shows.tooltip.margin': 'Net divided by Fee (%)'
  , 'shows.table.margin': 'Margin %'
  , 'shows.editor.margin.formula': 'Margin % = Net/Fee'
  , 'shows.tooltip.wht': 'Withholding tax percentage applied to the fee'
  , 'shows.editor.label.name': 'Show name'
  , 'shows.editor.placeholder.name': 'Festival or show name'
  , 'shows.editor.placeholder.venue': 'Venue name'
  , 'shows.editor.help.venue': 'Optional venue / room name'
  , 'shows.editor.help.fee': 'Gross fee agreed (before taxes, commissions, costs)'
  , 'shows.editor.help.wht': 'Local withholding tax percentage (auto-suggested by country)'
  , 'shows.editor.saving': 'Saving…'
  , 'shows.editor.saved': 'Saved ✓'
  , 'shows.editor.save.error': 'Save failed'
  , 'shows.editor.cost.templates': 'Templates'
  , 'shows.editor.cost.addTemplate': 'Add template'
  , 'shows.editor.cost.subtotals': 'Subtotals'
  , 'shows.editor.status.help': 'Current lifecycle state of the show'
  , 'shows.editor.cost.template.travel': 'Travel basics'
  , 'shows.editor.cost.template.production': 'Production basics'
  , 'shows.editor.cost.template.marketing': 'Marketing basics'
  , 'shows.editor.quick.label': 'Quick entry (beta)'
  , 'shows.editor.quick.hint': 'Quick entry (beta) — paste or type then apply'
  , 'shows.editor.quick.placeholder': '20/04/2025 "Name" Madrid ES fee 12k wht 15%'
  , 'shows.editor.quick.preview.summary': 'Will set: {fields}'
  , 'shows.editor.quick.apply': 'Apply'
  , 'shows.editor.quick.parseError': 'Cannot interpret'
  , 'shows.editor.quick.applied': 'Quick entry applied'
  , 'shows.editor.bulk.title': 'Bulk add costs'
  , 'shows.editor.bulk.open': 'Bulk add'
  , 'shows.editor.bulk.placeholder': 'Type, Amount, Description\nTravel, 1200, Flights BCN-MAD\nProduction\t500\tBackline'
  , 'shows.editor.bulk.preview': 'Preview'
  , 'shows.editor.bulk.parsed': 'Parsed {count} lines'
  , 'shows.editor.bulk.add': 'Add costs'
  , 'shows.editor.bulk.cancel': 'Cancel'
  , 'shows.editor.bulk.invalidLine': 'Invalid line {n}'
  , 'shows.editor.bulk.empty': 'No valid lines'
  , 'shows.editor.bulk.help': 'Paste CSV or tab-separated lines: Type, Amount, Description (amount optional)'
  , 'shows.editor.restored': 'Restored draft'
  , 'shows.editor.quick.icon.date': 'Date'
  , 'shows.editor.quick.icon.city': 'City'
  , 'shows.editor.quick.icon.country': 'Country'
  , 'shows.editor.quick.icon.fee': 'Fee'
  , 'shows.editor.quick.icon.whtPct': 'WHT %'
  , 'shows.editor.quick.icon.name': 'Name'
  , 'shows.editor.cost.templateMenu': 'Cost templates'
  , 'shows.editor.cost.template.applied': 'Template applied'
  , 'shows.editor.cost.duplicate': 'Duplicate'
  , 'shows.editor.cost.moveUp': 'Move up'
  , 'shows.editor.cost.moveDown': 'Move down'
  , 'shows.editor.costs.title': 'Costs'
  , 'shows.editor.costs.empty': 'No costs yet — add one'
  , 'shows.editor.costs.recent': 'Recent'
  , 'shows.editor.costs.templates': 'Templates'
  , 'shows.editor.costs.subtotal': 'Subtotal {category}'
  , 'shows.editor.wht.suggest': 'Suggest {pct}%'
  , 'shows.editor.wht.apply': 'Apply {pct}%'
  , 'shows.editor.wht.suggest.applied': 'Suggestion applied'
  , 'shows.editor.wht.tooltip.es': 'Typical IRPF in ES: 15% (editable)'
  , 'shows.editor.wht.tooltip.generic': 'Typical withholding suggestion'
  , 'shows.editor.status.hint': 'Change here or via badge'
  , 'shows.editor.wht.hint.es': 'Typical ES withholding: 15% (editable)'
  , 'shows.editor.wht.hint.generic': 'Withholding percentage (editable)'
  , 'shows.editor.commission.default': 'Default {pct}%'
  , 'shows.editor.commission.overridden': 'Override'
  , 'shows.editor.commission.overriddenIndicator': 'Commission overridden'
  , 'shows.editor.commission.reset': 'Reset to default'
  , 'shows.editor.label.currency': 'Currency'
  , 'shows.editor.help.currency': 'Contract currency'
  , 'shows.editor.fx.rateOn': 'Rate'
  , 'shows.editor.fx.convertedFee': '≈ {amount} {base}'
  , 'shows.editor.fx.unavailable': 'Rate unavailable'
  , 'shows.editor.actions.promote': 'Promote'
  , 'shows.editor.actions.planTravel': 'Plan travel'
  , 'shows.editor.state.hint': 'Use the badge or this selector'
  , 'shows.editor.save.create': 'Save'
  , 'shows.editor.save.edit': 'Save changes'
  , 'shows.editor.save.retry': 'Retry'
  , 'shows.editor.tab.active': 'Tab {label} active'
  , 'shows.editor.tab.restored': 'Restored last tab: {label}'
  , 'shows.editor.errors.count': 'There are {n} errors'
  , 'shows.totals.fees': 'Fees'
  , 'shows.totals.net': 'Net'
  , 'shows.totals.hide': 'Hide'
  , 'shows.totals.show': 'Show totals'
  , 'shows.view.list': 'List'
  , 'shows.view.board': 'Board'
  , 'shows.views.none': 'Views'
  , 'views.manage': 'Manage views'
  , 'views.saved': 'Saved'
  , 'views.apply': 'Apply'
  , 'views.none': 'No saved views'
  , 'views.deleted': 'Deleted'
  , 'views.export': 'Export'
  , 'views.import': 'Import'
  , 'views.import.hint': 'Paste JSON of views to import'
  , 'views.openLab': 'Open Layout Lab'
  , 'views.share': 'Copy share link'
  , 'views.export.copied': 'Export copied'
  , 'views.imported': 'Views imported'
  , 'views.import.invalid': 'Invalid JSON'
  , 'views.label': 'View'
  , 'views.names.default': 'Default'
  , 'views.names.finance': 'Finance'
  , 'views.names.operations': 'Operations'
  , 'views.names.promo': 'Promotion'
  , 'demo.banner': 'Demo data • No live sync'
  , 'demo.load': 'Load demo data'
  , 'demo.loaded': 'Demo data loaded'
  , 'demo.clear': 'Clear data'
  , 'demo.cleared': 'All data cleared'
  , 'demo.password.prompt': 'Enter demo password'
  , 'demo.password.invalid': 'Incorrect password'
  , 'shows.views.delete': 'Delete'
  , 'shows.views.namePlaceholder': 'View name'
  , 'shows.views.save': 'Save'
  , 'shows.status.canceled': 'Canceled'
  , 'shows.status.archived': 'Archived'
  , 'shows.status.offer': 'Offer'
  , 'shows.status.pending': 'Pending'
  , 'shows.status.confirmed': 'Confirmed'
  , 'shows.status.postponed': 'Postponed'
  , 'shows.bulk.selected': 'selected'
  , 'shows.bulk.confirm': 'Confirm'
  , 'shows.bulk.promote': 'Promote'
  , 'shows.bulk.export': 'Export'
  , 'shows.notes': 'Notes'
  , 'shows.virtualized.hint': 'Virtualized list active'
  , 'story.title': 'Story mode'
  , 'story.timeline': 'Timeline'
  , 'story.play': 'Play'
  , 'story.pause': 'Pause'
  , 'story.cta': 'Story mode'
  , 'story.scrub': 'Scrub timeline'
  , 'finance.overview': 'Finance overview'
  , 'shows.title': 'Shows'
  , 'shows.notFound': 'Show not found'
  , 'shows.search.placeholder': 'Search city/country'
  , 'shows.add': 'Add show'
  , 'shows.edit': 'Edit'
  , 'shows.summary.upcoming': 'Upcoming'
  , 'shows.summary.totalFees': 'Total Fees'
  , 'shows.summary.estNet': 'Est. Net'
  , 'shows.summary.avgWht': 'Avg WHT'
  , 'shows.table.date': 'Date'
  , 'shows.table.name': 'Show'
  , 'shows.table.city': 'City'
  , 'shows.table.country': 'Country'
  , 'shows.table.venue': 'Venue'
  , 'shows.table.promoter': 'Promoter'
  , 'shows.table.wht': 'WHT %'
  , 'shows.table.type': 'Type'
  , 'shows.table.description': 'Description'
  , 'shows.table.amount': 'Amount'
  , 'shows.table.remove': 'Remove'
  , 'shows.table.agency.mgmt': 'Mgmt'
  , 'shows.table.agency.booking': 'Booking'
  , 'shows.table.agencies': 'Agencies'
  , 'shows.table.notes': 'Notes'
  , 'shows.table.fee': 'Fee'
  , 'shows.table.net': 'Net'
  , 'shows.table.status': 'Status'
  , 'shows.selectAll': 'Select all'
  , 'shows.selectRow': 'Select row'
  , 'shows.editor.tabs': 'Editor tabs'
  , 'shows.editor.tab.details': 'Details'
  , 'shows.editor.tab.finance': 'Finance'
  , 'shows.editor.tab.costs': 'Costs'
  , 'shows.editor.finance.commissions': 'Commissions'
  , 'shows.editor.add': 'Add show'
  , 'shows.editor.edit': 'Edit show'
  , 'shows.editor.subtitleAdd': 'Create a new event'
  , 'shows.editor.label.status': 'Status'
  , 'shows.editor.label.date': 'Date'
  , 'shows.editor.label.city': 'City'
  , 'shows.editor.label.country': 'Country'
  , 'shows.editor.label.venue': 'Venue'
  , 'shows.editor.label.promoter': 'Promoter'
  , 'shows.editor.label.fee': 'Fee'
  , 'shows.editor.label.wht': 'WHT %'
  , 'shows.editor.label.mgmt': 'Mgmt Agency'
  , 'shows.editor.label.booking': 'Booking Agency'
  , 'shows.editor.label.notes': 'Notes'
  , 'shows.editor.validation.cityRequired': 'City is required'
  , 'shows.editor.validation.countryRequired': 'Country is required'
  , 'shows.editor.validation.dateRequired': 'Date is required'
  , 'shows.editor.validation.feeGtZero': 'Fee must be greater than 0'
  , 'shows.editor.validation.whtRange': 'WHT must be between 0% and 50%'
  , 'shows.dialog.close': 'Close'
  , 'shows.dialog.cancel': 'Cancel'
  , 'shows.dialog.save': 'Save'
  , 'shows.dialog.saveChanges': 'Save changes'
  , 'shows.dialog.delete': 'Delete'
  , 'shows.editor.validation.fail': 'Fix errors to continue'
  , 'shows.editor.toast.saved': 'Saved'
  , 'shows.editor.toast.deleted': 'Deleted'
  , 'shows.editor.toast.undo': 'Undo'
  , 'shows.editor.toast.restored': 'Restored'
  , 'shows.editor.toast.deleting': 'Deleting…'
  , 'shows.editor.toast.discarded': 'Changes discarded'
  , 'shows.editor.toast.validation': 'Please correct the highlighted errors'
  , 'shows.editor.summary.fee': 'Fee'
  , 'shows.editor.summary.wht': 'WHT'
  , 'shows.editor.summary.costs': 'Costs'
  , 'shows.editor.summary.net': 'Est. Net'
  , 'shows.editor.discard.title': 'Discard changes?'
  , 'shows.editor.discard.body': 'You have unsaved changes. They will be lost.'
  , 'shows.editor.discard.cancel': 'Keep editing'
  , 'shows.editor.discard.confirm': 'Discard'
  , 'shows.editor.delete.confirmTitle': 'Delete show?'
  , 'shows.editor.delete.confirmBody': 'This action cannot be undone.'
  , 'shows.editor.delete.confirm': 'Delete'
  , 'shows.editor.delete.cancel': 'Cancel'
  , 'shows.noCosts': 'No costs yet'
  , 'shows.filters.region': 'Region'
  , 'shows.filters.region.all': 'All'
  , 'shows.filters.region.AMER': 'AMER'
  , 'shows.filters.region.EMEA': 'EMEA'
  , 'shows.filters.region.APAC': 'APAC'
  , 'shows.filters.feeMin': 'Min fee'
  , 'shows.filters.feeMax': 'Max fee'
  , 'shows.views.export': 'Export views'
  , 'shows.views.import': 'Import views'
  , 'shows.views.applied': 'View applied'
  , 'shows.bulk.delete': 'Delete selected'
  , 'shows.bulk.setWht': 'Set WHT %'
  , 'shows.bulk.applyWht': 'Apply WHT'
  , 'shows.bulk.setStatus': 'Set status'
  , 'shows.bulk.apply': 'Apply'
  , 'shows.travel.title': 'Location'
  , 'shows.travel.quick': 'Travel'
  , 'shows.travel.soon': 'Upcoming confirmed show — consider adding travel.'
  , 'shows.travel.soonConfirmed': 'Upcoming confirmed show — consider adding travel.'
  , 'shows.travel.soonGeneric': 'Upcoming show — consider planning travel.'
  , 'shows.travel.tripExists': 'Trip already scheduled around this date'
  , 'shows.travel.noCta': 'No travel action needed'
  , 'shows.travel.plan': 'Plan travel'
  , 'cmd.dialog': 'Command palette'
  , 'cmd.placeholder': 'Search shows or actions…'
  , 'cmd.type.show': 'Show'
  , 'cmd.type.action': 'Action'
  , 'cmd.noResults': 'No results'
  , 'cmd.footer.hint': 'Enter to run • Esc to close'
  , 'cmd.footer.tip': 'Tip: press ? for shortcuts'
  , 'cmd.openFilters': 'Open Filters'
  , 'cmd.mask.enable': 'Enable Mask'
  , 'cmd.mask.disable': 'Disable Mask'
  , 'cmd.presentation.enable': 'Enable Presentation Mode'
  , 'cmd.presentation.disable': 'Disable Presentation Mode'
  , 'cmd.shortcuts': 'Show Shortcuts Overlay'
  , 'cmd.switch.default': 'Switch View: Default'
  , 'cmd.switch.finance': 'Switch View: Finance'
  , 'cmd.switch.operations': 'Switch View: Operations'
  , 'cmd.switch.promo': 'Switch View: Promotion'
  , 'cmd.openAlerts': 'Open Alert Center'
  , 'cmd.go.shows': 'Go to Shows'
  , 'cmd.go.travel': 'Go to Travel'
  , 'cmd.go.finance': 'Go to Finance'
  , 'shortcuts.dialog': 'Keyboard shortcuts'
  , 'shortcuts.title': 'Shortcuts'
  , 'shortcuts.desc': 'Use these to move faster. Press Esc to close.'
  , 'shortcuts.openPalette': 'Open Command Palette'
  , 'shortcuts.showOverlay': 'Show this overlay'
  , 'shortcuts.closeDialogs': 'Close dialogs/popups'
  , 'alerts.open': 'Open Alerts'
  , 'alerts.loading': 'Loading alerts…'
  , 'actions.exportCsv': 'Export CSV'
  , 'actions.copyDigest': 'Copy Digest'
  , 'actions.digest.title': 'Weekly Alerts Digest'
  , 'actions.toast.csv': 'CSV copied'
  , 'actions.toast.digest': 'Digest copied'
  , 'actions.toast.share': 'Link copied'
  , 'shows.toast.bulk.status': 'Status: {status} ({n})'
  , 'shows.toast.bulk.confirm': 'Confirmed'
  , 'shows.toast.bulk.setStatus': 'Status applied'
  , 'shows.toast.bulk.setWht': 'WHT applied'
  , 'shows.toast.bulk.export': 'Export started'
  , 'shows.toast.bulk.delete': 'Deleted'
  , 'shows.toast.bulk.confirmed': 'Confirmed ({n})'
  , 'shows.toast.bulk.wht': 'WHT {pct}% ({n})'
  , 'filters.clear': 'Clear'
  , 'filters.more': 'More filters'
  , 'filters.cleared': 'Filters cleared'
  , 'filters.presets': 'Presets'
  , 'filters.presets.last7': 'Last 7 days'
  , 'filters.presets.last30': 'Last 30 days'
  , 'filters.presets.last90': 'Last 90 days'
  , 'filters.presets.mtd': 'Month to date'
  , 'filters.presets.ytd': 'Year to date'
  , 'filters.presets.qtd': 'Quarter to date'
  , 'filters.applied': 'Filters applied'
  , 'common.team': 'Team'
  , 'common.region': 'Region'
  , 'ah.planTravel': 'Plan travel'
  , 'map.cssWarning': 'Map styles failed to load. Using basic fallback.'
  , 'travel.offline': 'Offline mode: showing cached itineraries.'
  , 'travel.refresh.error': "Couldn't refresh travel. Showing cached data."
  
  , 'travel.search.title': 'Search'
  , 'travel.search.open_in_google': 'Open in Google Flights'
  , 'travel.search.mode.form': 'Form'
  , 'travel.search.mode.text': 'Text'
  , 'travel.search.show_text': 'Write query'
  , 'travel.search.hide_text': 'Hide text input'
  , 'travel.search.text.placeholder': 'e.g., From MAD to CDG 2025-10-12 2 adults business'
  , 'travel.nlp': 'NLP'
  , 'travel.search.origin': 'Origin'
  , 'travel.search.destination': 'Destination'
  , 'travel.search.departure_date': 'Departure date'
  , 'travel.search.searching': 'Searching flights…'
  , 'travel.search.show_more_options': 'Open externally'
  , 'travel.advanced.show': 'More options'
  , 'travel.advanced.hide': 'Hide advanced options'
  , 'travel.flight_card.nonstop': 'nonstop'
  , 'travel.flight_card.stop': 'stop'
  , 'travel.flight_card.stops': 'stops'
  , 'travel.flight_card.select_for_planning': 'Select for planning'
  , 'travel.add_to_trip': 'Add to trip'
  , 'travel.swap': 'Swap'
  , 'travel.round_trip': 'Round trip'
  , 'travel.share_search': 'Share search'
  , 'travel.from': 'From'
  , 'travel.to': 'To'
  , 'travel.depart': 'Depart'
  , 'travel.return': 'Return'
  , 'travel.adults': 'Adults'
  , 'travel.bag': 'bag'
  , 'travel.bags': 'Bags'
  , 'travel.cabin': 'Cabin'
  , 'travel.stops_ok': 'Stops ok'
  , 'travel.deeplink.preview': 'Preview link'
  , 'travel.deeplink.copy': 'Copy link'
  , 'travel.deeplink.copied': 'Copied ✓'
  , 'travel.sort.menu': 'Sort by'
  , 'travel.sort.priceAsc': 'Price (low→high)'
  , 'travel.sort.priceDesc': 'Price (high→low)'
  , 'travel.sort.duration': 'Duration'
  , 'travel.sort.stops': 'Stops'
  , 'travel.badge.nonstop': 'Nonstop'
  , 'travel.badge.baggage': 'Bag included'
  , 'travel.arrival.sameDay': 'Arrives same day'
  , 'travel.arrival.nextDay': 'Arrives next day'
  , 'travel.recent.clear': 'Clear recent'
  , 'travel.recent.remove': 'Remove'
  , 'travel.form.invalid': 'Please fix errors to search'
  , 'travel.nlp.hint': 'Free-form input — press Shift+Enter to apply'
  , 'travel.flex.days': '±{n} days'
  , 'travel.compare.grid.title': 'Compare flights'
  , 'travel.compare.empty': 'Pin flights to compare them here.'
  , 'travel.compare.hint': 'Review pinned flights side-by-side.'
  , 'travel.co2.label': 'CO₂'
  // duplicate 'common.copied' removed (defined earlier with checkmark)
  
  , 'travel.window': 'Window'
  , 'travel.flex_window': 'Flex window'
  , 'travel.flex_hint': "We'll explore ±%d in-app"
  , 'travel.one_way': 'One-way'
  , 'travel.nonstop': 'Nonstop'
  , 'travel.pin': 'Pin'
  , 'travel.unpin': 'Unpin'
  , 'travel.compare.title': 'Compare pinned'
  , 'travel.compare.show': 'Compare'
  , 'travel.compare.hide': 'Hide'
  , 'travel.compare.add_to_trip': 'Add to trip'
  , 'travel.trip.added': 'Added to trip'
  , 'travel.trip.create_drop': 'Drop here to create new trip'
  , 'travel.related_show': 'Related show'
  , 'travel.multicity.toggle': 'Multicity'
  , 'travel.multicity': 'Multi-city'
  , 'travel.multicity.add_leg': 'Add leg'
  , 'travel.multicity.remove': 'Remove'
  , 'travel.multicity.move_up': 'Move up'
  , 'travel.multicity.move_down': 'Move down'
  , 'travel.multicity.open': 'Open route in Google Flights'
  , 'travel.multicity.hint': 'Add at least two legs to build a route'
  
  , 'travel.trips': 'Trips'
  , 'travel.trip.new': 'New Trip'
  , 'travel.trip.to': 'Trip to'
  , 'travel.segments': 'Segments'
  , 'common.actions': 'Actions'
  , 'travel.status.planned': 'Planned'
  , 'travel.status.requested': 'Requested'
  , 'travel.status.booked': 'Booked'
  , 'travel.hub.title': 'Search'
  , 'travel.hub.needs_planning': 'Suggestions'
  , 'travel.hub.upcoming': 'Upcoming'
  , 'travel.hub.open_multicity': 'Open multicity'
  , 'travel.hub.plan_trip_cta': 'Plan Trip'
  , 'travel.error.same_route': 'Origin and destination are the same'
  , 'travel.error.return_before_depart': 'Return is before departure'
  , 'travel.segment.type': 'Type'
  , 'travel.segment.flight': 'Flight'
  , 'travel.segment.hotel': 'Hotel'
  , 'travel.segment.ground': 'Ground'
  , 'copy.manual.title': 'Manual copy'
  , 'copy.manual.desc': 'Copy the text below if clipboard is blocked.'
  , 'common.noResults': 'No results'
  , 'tripDetail.currency': 'Currency'
  , 'cost.category.flight': 'Flight'
  , 'cost.category.hotel': 'Hotel'
  , 'cost.category.ground': 'Ground'
  , 'cost.category.taxes': 'Taxes'
  , 'cost.category.fees': 'Fees'
  , 'cost.category.other': 'Other'
  , 'travel.workspace.placeholder': 'Select a trip to see details or perform a search.'
  , 'travel.open_in_provider': 'Open in provider'
  , 'common.loading': 'Loading…'
  , 'common.results': 'results'
  , 'travel.no_trips_yet': 'No trips planned yet. Use the search to get started!'
  , 'travel.provider': 'Provider'
  , 'provider.mock': 'In-app (mock)'
  , 'provider.google': 'Google Flights'
  , 'travel.alert.checkin': 'Check-in opens in %s'
  , 'travel.alert.priceDrop': 'Price dropped by %s'
  , 'travel.workspace.open': 'Open Travel Workspace'
  , 'travel.workspace.timeline': 'Timeline view'
  , 'travel.workspace.trip_builder.beta': 'Trip Builder (beta)'
  , 'common.list': 'List'
  , 'common.clear': 'Clear'
  , 'common.reset': 'Reset'
  , 'calendar.timeline': 'Week'
  , 'common.moved': 'Moved'
  , 'travel.drop.hint': 'Drag to another day'
  , 'travel.search.summary': 'Search summary'
  , 'travel.search.route': '{from} → {to}'
  , 'travel.search.paxCabin': '{pax} pax · {cabin}'
  , 'travel.results.countForDate': '{count} results for {date}'
  , 'travel.compare.bestPrice': 'Best price'
  , 'travel.compare.bestTime': 'Fastest'
  , 'travel.compare.bestBalance': 'Best balance'
  , 'travel.co2.estimate': '~{kg} kg CO₂ (est.)'
  , 'travel.mobile.sticky.results': 'Results'
  , 'travel.mobile.sticky.compare': 'Compare'
  , 'travel.tooltips.flex': 'Explore ± days around the selected date'
  , 'travel.tooltips.nonstop': 'Only show flights without stops'
  , 'travel.tooltips.cabin': 'Seat class preference'
  , 'travel.move.prev': 'Move to previous day'
  , 'travel.move.next': 'Move to next day'
  , 'travel.rest.short': 'Short rest before next show'
  , 'travel.rest.same_day': 'Same-day show risk'
  , 'calendar.title': 'Calendar'
  , 'calendar.prev': 'Previous month'
  , 'calendar.next': 'Next month'
  , 'calendar.today': 'Today'
  , 'calendar.goto': 'Go to date'
  , 'calendar.more': 'more'
  , 'calendar.more.title': 'More events'
  , 'calendar.more.openDay': 'Open day'
  , 'calendar.more.openFullDay': 'Open full day'
  , 'calendar.announce.moved': 'Moved show to {d}'
  , 'calendar.announce.copied': 'Duplicated show to {d}'
  , 'calendar.quickAdd.hint': 'Enter to add • Esc to cancel'
  , 'calendar.quickAdd.advanced': 'Advanced'
  , 'calendar.quickAdd.simple': 'Simple'
  , 'calendar.quickAdd.placeholder': 'City CC Fee (optional)… e.g., Madrid ES 12000'
  , 'calendar.quickAdd.recent': 'Recent'
  , 'calendar.quickAdd.parseError': "Can't understand — try 'Madrid ES 12000'"
  , 'calendar.quickAdd.countryMissing': 'Add 2-letter country code'
  , 'calendar.goto.hint': 'Enter to go • Esc to close'
  , 'calendar.view.switch': 'Change calendar view'
  , 'calendar.view.month': 'Month'
  , 'calendar.view.week': 'Week'
  , 'calendar.view.day': 'Day'
  , 'calendar.view.agenda': 'Agenda'
  , 'calendar.view.announce': '{v} view'
  , 'calendar.timezone': 'Time zone'
  , 'calendar.tz.local': 'Local'
  , 'calendar.tz.localLabel': 'Local'
  , 'calendar.tz.changed': 'Time zone set to {tz}'
  , 'calendar.goto.shortcut': '⌘/Ctrl + G'
  , 'calendar.shortcut.pgUp': 'PgUp / Alt+←'
  , 'calendar.shortcut.pgDn': 'PgDn / Alt+→'
  , 'calendar.shortcut.today': 'T'
  , 'common.move': 'Move'
  , 'common.copy': 'Copy'
  , 'calendar.more.filter': 'Filter events'
  , 'calendar.more.empty': 'No results'
  , 'calendar.kb.hint': 'Keyboard: Arrow keys move day, PageUp/PageDown change month, T go to today, Enter or Space select day.'
  , 'calendar.day.select': 'Selected {d}'
  , 'calendar.day.focus': 'Focused {d}'
  , 'calendar.event.one': 'event'
  , 'calendar.event.many': 'events'
  , 'calendar.noEvents': 'No events for this day'
  , 'calendar.show.shows': 'Shows'
  , 'calendar.show.travel': 'Travel'
  , 'calendar.kind': 'Kind'
  , 'calendar.kind.show': 'Show'
  , 'calendar.kind.travel': 'Travel'
  , 'calendar.status': 'Status'
  , 'calendar.dnd.enter': 'Drop here to place event on {d}'
  , 'calendar.dnd.leave': 'Leaving drop target'
  , 'calendar.kbdDnD.marked': 'Marked {d} as origin. Use Enter on target day to drop. Hold Ctrl/Cmd to copy.'
  , 'calendar.kbdDnD.cancel': 'Cancelled move/copy mode'
  , 'calendar.kbdDnD.origin': 'Origin (keyboard move/copy active)'
  , 'calendar.kbdDnD.none': 'No show to move from selected origin'
  , 'calendar.weekStart': 'Week starts on'
  , 'calendar.weekStart.mon': 'Mon'
  , 'calendar.weekStart.sun': 'Sun'
  , 'common.selected': 'Selected'
  , 'calendar.import': 'Import'
  , 'calendar.import.ics': 'Import .ics'
  , 'calendar.import.done': 'Imported {n} events'
  , 'calendar.import.error': 'Failed to import .ics'
  , 'calendar.wd.mon': 'Mon'
  , 'calendar.wd.tue': 'Tue'
  , 'calendar.wd.wed': 'Wed'
  , 'calendar.wd.thu': 'Thu'
  , 'calendar.wd.fri': 'Fri'
  , 'calendar.wd.sat': 'Sat'
  , 'calendar.wd.sun': 'Sun'
  , 'shows.costs.type': 'Type'
  , 'shows.costs.placeholder': 'Travel / Production / Marketing'
  , 'shows.costs.amount': 'Amount'
  , 'shows.costs.desc': 'Description'
  , 'common.optional': 'Optional'
  , 'common.add': 'Add'
  // duplicate 'common.apply' removed (defined earlier)
  , 'common.income': 'Income'
  , 'common.wht': 'WHT'
  , 'common.commissions': 'Commissions'
  , 'common.net': 'Net'
  , 'common.costs': 'Costs'
  , 'common.total': 'Total'
  , 'shows.promote': 'Promote'
  , 'shows.editor.status.promote': 'Promoted to'
  , 'shows.margin.tooltip': 'Net divided by Fee (%)'
  , 'shows.empty': 'No shows match your filters'
  , 'shows.empty.add': 'Add your first show'
  , 'shows.export.csv.success': 'CSV exported ✓'
  , 'shows.export.xlsx.success': 'XLSX exported ✓'
  , 'shows.sort.tooltip': 'Sort by column'
  , 'shows.filters.statusGroup': 'Status filters'
  , 'shows.relative.inDays': 'In {n} days'
  , 'shows.relative.daysAgo': '{n} days ago'
  , 'shows.relative.yesterday': 'Yesterday'
  , 'shows.row.menu': 'Row actions'
  , 'shows.action.edit': 'Edit'
  , 'shows.action.promote': 'Promote'
  , 'shows.action.duplicate': 'Duplicate'
  , 'shows.action.archive': 'Archive'
  , 'shows.action.delete': 'Delete'
  , 'shows.action.restore': 'Restore'
  , 'shows.board.header.net': 'Net'
  , 'shows.board.header.count': 'Shows'
  , 'shows.datePreset.thisMonth': 'This Month'
  , 'shows.datePreset.nextMonth': 'Next Month'
  , 'shows.columns.config': 'Columns'
  , 'shows.columns.wht': 'WHT %'
  , 'shows.totals.pin': 'Pin totals'
  , 'shows.totals.unpin': 'Unpin totals'
  , 'shows.totals.avgFee': 'Avg Fee'
  , 'shows.totals.avgFee.tooltip': 'Average fee per show'
  , 'shows.totals.avgMargin': 'Avg Margin %'
  , 'shows.totals.avgMargin.tooltip': 'Average margin % across shows with fee'
  , 'shows.wht.hide': 'Hide WHT column'
  , 'shows.sort.aria.sortedDesc': 'Sorted descending'
  , 'shows.sort.aria.sortedAsc': 'Sorted ascending'
  , 'shows.sort.aria.notSorted': 'Not sorted'
  , 'shows.sort.aria.activateDesc': 'Activate to sort descending'
  , 'shows.sort.aria.activateAsc': 'Activate to sort ascending'
  , 'export.options': 'Export options'
  , 'export.columns': 'Columns'
  , 'export.csv': 'CSV'
  , 'export.xlsx': 'XLSX'
  , 'common.exporting': 'Exporting…'
  , 'charts.viewTable': 'View data as table'
  , 'charts.hideTable': 'Hide table'
  , 'finance.period.mtd': 'MTD'
  , 'finance.period.lastMonth': 'Last month'
  , 'finance.period.ytd': 'YTD'
  , 'finance.period.custom': 'Custom'
  , 'finance.period.closed': 'Closed'
  , 'finance.period.open': 'Open'
  , 'finance.closeMonth': 'Close Month'
  , 'finance.reopenMonth': 'Reopen Month'
  , 'finance.closed.help': 'Month is closed. Reopen to make changes.'
  , 'finance.kpi.mtdNet': 'MTD Net'
  , 'finance.kpi.ytdNet': 'YTD Net'
  , 'finance.kpi.forecastEom': 'Forecast EOM'
  , 'finance.kpi.deltaTarget': 'Δ vs Target'
  , 'finance.kpi.gm': 'GM%'
  , 'finance.kpi.dso': 'DSO'
  , 'finance.comparePrev': 'Compare vs previous'
  , 'finance.export.csv.success': 'CSV exported ✓'
  , 'finance.export.xlsx.success': 'XLSX exported ✓'
  , 'finance.v2.footer': 'AR top debtors and row actions coming next.'
  , 'finance.pl.caption': 'Profit and Loss ledger. Use column headers to sort. Virtualized list shows a subset of rows.'
  , 'common.rowsVisible': 'Rows visible'
  , 'finance.whtPct': 'WHT %'
  , 'finance.wht': 'WHT'
  , 'finance.mgmtPct': 'Mgmt %'
  , 'finance.bookingPct': 'Booking %'
  , 'finance.breakdown.by': 'Breakdown by'
  , 'finance.breakdown.empty': 'No breakdown available'
  , 'finance.delta': 'Δ'
  , 'finance.deltaVsPrev': 'Δ vs prev'
  , 'common.comingSoon': 'Coming soon'
  , 'finance.expected': 'Expected (stage-weighted)'
  , 'finance.ar.title': 'AR aging & top debtors'
  , 'common.moreActions': 'More actions'
  , 'actions.copyRow': 'Copy row'
  , 'actions.exportRowCsv': 'Export row (CSV)'
  , 'actions.goToShow': 'Go to show'
  , 'actions.openCosts': 'Open costs'
  , 'shows.table.route': 'Route'
  , 'finance.targets.title': 'Targets'
  , 'finance.targets.revenue': 'Revenue target'
  , 'finance.targets.net': 'Net target'
  , 'finance.targets.hint': 'Targets are local to this device for now.'
  , 'finance.targets.noNegative': 'Targets cannot be negative'
  },
  es: {
  'nav.dashboard': 'Panel',
  'finance.v2.footer': 'Próximamente: principales deudores y acciones por fila.'
  , 'finance.pl.caption': 'Libro de Pérdidas y Ganancias. Usa las cabeceras para ordenar. La lista virtualizada muestra un subconjunto de filas.'
  , 'common.rowsVisible': 'Filas visibles'
  , 'finance.whtPct': 'IRPF %'
  , 'finance.wht': 'IRPF'
  , 'finance.mgmtPct': 'Gestión %'
  , 'finance.bookingPct': 'Booking %'
  , 'finance.breakdown.by': 'Desglose por'
  , 'finance.breakdown.empty': 'Sin desglose disponible'
  , 'finance.delta': 'Δ'
  , 'finance.deltaVsPrev': 'Δ vs anterior'
  , 'common.comingSoon': 'Próximamente'
  , 'finance.expected': 'Esperado (ponderado por etapa)'
  , 'finance.ar.title': 'Antigüedad de cobros y deudores'
  , 'common.moreActions': 'Más acciones'
  , 'actions.copyRow': 'Copiar fila'
  , 'actions.exportRowCsv': 'Exportar fila (CSV)'
  , 'actions.goToShow': 'Ir al show'
  , 'actions.openCosts': 'Abrir costos'
  , 'shows.table.route': 'Ruta'
  , 'finance.targets.title': 'Objetivos'
  , 'finance.targets.revenue': 'Objetivo de ingresos'
  , 'finance.targets.net': 'Objetivo de neto'
  , 'finance.targets.hint': 'Los objetivos se guardan localmente en este dispositivo.'
  , 'finance.targets.noNegative': 'Los objetivos no pueden ser negativos',
  'demo.banner': 'Datos de demo • Sin sincronización en vivo',
  'demo.load': 'Cargar datos de demo',
  'demo.loaded': 'Datos de demo cargados',
  'demo.clear': 'Borrar datos',
  'demo.cleared': 'Todos los datos borrados',
  'demo.password.prompt': 'Introduce la contraseña de demo',
  'demo.password.invalid': 'Contraseña incorrecta',
  'nav.shows': 'Shows',
  'nav.travel': 'Viajes',
  'nav.calendar': 'Calendario',
  'nav.finance': 'Finanzas',
  'nav.settings': 'Ajustes',
  'insights.thisMonthTotal': 'Total del mes',
  'insights.statusBreakdown': 'Desglose por estado',
  'insights.upcoming14d': 'Próximos 14 días',
  'common.openShow': 'Abrir show',
  'common.centerMap': 'Centrar mapa',
  'common.dismiss': 'Descartar',
  'common.snooze7': 'Posponer 7 días',
  'common.snooze30': 'Posponer 30 días',
  'common.back': 'Volver',
  'common.date': 'Fecha',
  'common.fee': 'Cachet',
  'common.status': 'Estado',
  'common.on': 'activado',
  'common.off': 'desactivado',
  'common.hide': 'Ocultar',
  'common.map': 'Mapa',
  'common.close': 'Cerrar',
  'common.language': 'Idioma',
  'layout.invite': 'Invitar',
  'layout.build': 'Compilación: preview',
  'layout.demo': 'Estado: feed demo',
  'alerts.title': 'Centro de alertas',
  'alerts.anySeverity': 'Cualquier severidad',
  'alerts.anyRegion': 'Cualquier región',
  'alerts.anyTeam': 'Cualquier equipo',
  'alerts.copySlack': 'Copiar Slack',
  'alerts.copied': 'Copiado \u2713',
  'alerts.noAlerts': 'Sin alertas',
  'map.openInDashboard': 'Abrir en el panel',
  'common.skipToContent': 'Saltar al contenido',
  'alerts.slackCopied': 'Carga de Slack copiada',
  'alerts.copyManual': 'Abrir ventana para copiar manualmente',
    'ah.title': 'Centro de acciones',
    'ah.tab.pending': 'Pendientes',
    'ah.tab.shows': 'Este mes',
    'ah.tab.travel': 'Viajes',
    'ah.tab.insights': 'Insights',
    'ah.filter.all': 'Todo',
    'ah.filter.risk': 'Riesgo',
    'ah.filter.urgency': 'Urgente',
    'ah.filter.opportunity': 'Oportunidad',
    'ah.filter.offer': 'Oferta',
    'ah.filter.finrisk': 'Riesgo fin.',
    'ah.cta.addTravel': 'Añadir viaje',
    'ah.cta.followUp': 'Hacer seguimiento',
    'ah.cta.review': 'Revisar',
  'ah.cta.open': 'Abrir',
  'ah.empty': '¡Todo al día!',
  'ah.openTravel': 'Abrir viajes',
  'ah.done': 'Hecho',
  'ah.typeFilter': 'Filtrar por tipo',
  'ah.why': '¿Por qué?',
  'ah.why.title': '¿Por qué esta prioridad?',
  'ah.why.score': 'Puntuación',
  'ah.why.impact': 'Impacto',
  'ah.why.amount': 'Importe',
  'ah.why.inDays': 'En',
  'ah.why.overdue': 'Atrasado',
  'ah.why.kind': 'Tipo',
  'finance.quicklook': 'Resumen financiero',
  'finance.ledger': 'Libro mayor',
  'finance.targets': 'Objetivos',
  'finance.targets.month': 'Objetivos mensuales',
  'finance.targets.year': 'Objetivos anuales',
  'finance.pipeline': 'Pipeline',
  'finance.pipeline.subtitle': 'Valor esperado (ponderado por etapa)',
  'finance.openFull': 'Abrir finanzas completas',
  'finance.income': 'Ingresos',
  'finance.expenses': 'Gastos',
  'finance.net': 'Neto',
  'finance.byStatus': 'Por estado',
  'finance.byMonth': 'por mes',
  'finance.compare': 'Comparar anterior',
  'charts.resetZoom': 'Reiniciar zoom',
  'common.current': 'Actual',
  'common.compare': 'Anterior',
  'common.reminder': 'Recordatorio',
  'finance.ui.view': 'Vista',
  'finance.ui.classic': 'Clásica',
  'finance.ui.beta': 'Nueva (beta)',
  'finance.confirmed': 'Confirmado',
  'finance.pending': 'Pendiente',
  'finance.offer': 'Oferta',
  'finance.shows': 'shows',
  'finance.noShowsMonth': 'No hay shows este mes',
  'finance.hideAmounts': 'Ocultar importes',
  'finance.hidden': 'Oculto',
  'common.open': 'Abrir',
  'common.today': 'Hoy',
  'common.tomorrow': 'Mañana',
  'common.cancel': 'Cancelar',
  'common.go': 'Ir',
  'common.show': 'Mostrar',
  'common.search': 'Buscar',
  'hud.next3weeks': 'Próximas 3 semanas',
  'hud.noTrips3weeks': 'No hay viajes en las próximas 3 semanas',
  'hud.openShow': 'abrir show',
  'hud.openTrip': 'abrir viaje',
  'hud.view.whatsnext': 'Qué viene',
  'hud.view.month': 'Este mes',
  'hud.view.financials': 'Finanzas',
  'hud.view.whatsnext.desc': 'Resumen de 14 días',
  'hud.view.month.desc': 'Instantánea mensual de finanzas y shows',
  'hud.view.financials.desc': 'Desglose de inteligencia financiera',
  'hud.layer.heat': 'Calor',
  'hud.layer.status': 'Estado',
  'hud.layer.route': 'Ruta',
  'hud.views': 'Vistas HUD',
  'hud.layers': 'Capas del mapa',
  'hud.missionControl': 'Control de misión',
  'hud.subtitle': 'Mapa en tiempo real y próximos shows',
  'hud.risks': 'Riesgos',
  'hud.assignProducer': 'Asignar productor',
  'hud.mapLoadError': 'No se pudo cargar el mapa. Inténtalo de nuevo.',
  'common.retry': 'Reintentar',
  'hud.viewChanged': 'Vista cambiada a',
  'hud.openEvent': 'ver evento'
  , 'hud.type.flight': 'Vuelo'
  , 'hud.type.ground': 'Terrestre'
  , 'hud.type.event': 'Evento'
  , 'hud.fin.avgNetMonth': 'Neto medio (Mes)'
  , 'hud.fin.runRateYear': 'Run Rate (Año)'
  , 'finance.forecast': 'Previsión vs Real'
  , 'finance.forecast.legend.actual': 'Neto real'
  , 'finance.forecast.legend.p50': 'Previsión p50'
  , 'finance.forecast.legend.band': 'Banda de confianza'
  , 'finance.forecast.alert.under': 'Por debajo de la previsión'
  , 'finance.forecast.alert.above': 'Por encima del optimista'
  , 'map.toggle.status': 'Mostrar/ocultar marcadores de estado'
  , 'map.toggle.route': 'Mostrar/ocultar ruta'
  , 'map.toggle.heat': 'Mostrar/ocultar calor'
  , 'shows.exportCsv': 'Exportar CSV'
  , 'shows.filters.from': 'Desde'
  , 'shows.filters.to': 'Hasta'
  , 'shows.items': 'elementos'
  , 'shows.date.presets': 'Atajos'
  , 'shows.date.thisMonth': 'Este mes'
  , 'shows.date.nextMonth': 'Próximo mes'
  , 'shows.tooltip.net': 'Cachet menos IRPF/retención, comisiones y costes'
  , 'shows.tooltip.margin': 'Neto dividido entre Cachet (%)'
  , 'shows.table.margin': 'Margen %'
  , 'shows.editor.margin.formula': 'Margen % = Neto/Cachet'
  , 'shows.tooltip.wht': 'Porcentaje de retención aplicado al cachet'
  , 'shows.editor.label.name': 'Nombre del show'
  , 'shows.editor.placeholder.name': 'Nombre del festival o show'
  , 'shows.editor.placeholder.venue': 'Nombre de la sala'
  , 'shows.editor.help.venue': 'Sala / recinto (opcional)'
  , 'shows.editor.help.fee': 'Cachet bruto acordado (antes de impuestos, comisiones, costes)'
  , 'shows.editor.help.wht': 'Porcentaje de retención local (auto-sugerido por país)'
  , 'shows.editor.saving': 'Guardando…'
  , 'shows.editor.saved': 'Guardado ✓'
  , 'shows.editor.save.error': 'Error al guardar'
  , 'shows.editor.cost.templates': 'Plantillas'
  , 'shows.editor.cost.addTemplate': 'Añadir plantilla'
  , 'shows.editor.cost.subtotals': 'Subtotales'
  , 'shows.editor.status.help': 'Estado de ciclo de vida del show'
  , 'shows.editor.cost.template.travel': 'Básicos viaje'
  , 'shows.editor.cost.template.production': 'Básicos producción'
  , 'shows.editor.cost.template.marketing': 'Básicos marketing'
  , 'shows.editor.quick.label': 'Entrada rápida (beta)'
  , 'shows.editor.quick.hint': 'Ej: 20/04/2025 Madrid ES fee 12k irpf 15%'
  , 'shows.editor.quick.placeholder': '20/04/2025 "Nombre" Madrid ES fee 12k irpf 15%'
  , 'shows.editor.quick.apply': 'Aplicar'
  , 'shows.editor.quick.parseError': 'No se puede interpretar'
  , 'shows.editor.quick.applied': 'Entrada rápida aplicada'
  , 'shows.editor.quick.preview.summary': 'Se aplicará: {fields}'
  , 'shows.editor.bulk.title': 'Añadir costes en bloque'
  , 'shows.editor.bulk.open': 'Añadir en bloque'
  , 'shows.editor.bulk.placeholder': 'Tipo, Importe, Descripción\nViaje, 1200, Vuelos BCN-MAD\nProducción\t500\tBackline'
  , 'shows.editor.bulk.preview': 'Vista previa'
  , 'shows.editor.bulk.parsed': '{count} líneas interpretadas'
  , 'shows.editor.bulk.add': 'Añadir costes'
  , 'shows.editor.bulk.cancel': 'Cancelar'
  , 'shows.editor.bulk.invalidLine': 'Línea inválida {n}'
  , 'shows.editor.bulk.empty': 'Sin líneas válidas'
  , 'shows.editor.bulk.help': 'Pega líneas CSV o tab: Tipo, Importe, Descripción (importe opcional)'
  , 'shows.editor.restored': 'Borrador restaurado'
  , 'shows.editor.quick.icon.date': 'Fecha'
  , 'shows.editor.quick.icon.city': 'Ciudad'
  , 'shows.editor.quick.icon.country': 'País'
  , 'shows.editor.quick.icon.fee': 'Cachet'
  , 'shows.editor.quick.icon.whtPct': 'IRPF %'
  , 'shows.editor.quick.icon.name': 'Nombre'
  , 'shows.editor.cost.templateMenu': 'Plantillas de coste'
  , 'shows.editor.cost.template.applied': 'Plantilla aplicada'
  , 'shows.editor.cost.duplicate': 'Duplicar'
  , 'shows.editor.cost.moveUp': 'Subir'
  , 'shows.editor.cost.moveDown': 'Bajar'
  , 'shows.editor.wht.suggest': 'Sugerir {pct}%'
  , 'shows.editor.wht.apply': 'Aplicar {pct}%'
  , 'shows.editor.wht.suggest.applied': 'Sugerencia aplicada'
  , 'shows.editor.wht.tooltip.es': 'IRPF típico en ES: 15% (editable)'
  , 'shows.editor.wht.tooltip.generic': 'Sugerencia de retención típica'
  , 'shows.editor.status.hint': 'Cámbialo aquí o desde el badge'
  , 'shows.promote': 'Promover'
  , 'shows.editor.wht.hint.es': 'IRPF típico en ES: 15% (editable)'
  , 'shows.editor.wht.hint.generic': 'Porcentaje de retención (editable)'
  , 'shows.editor.commission.default': 'Por defecto {pct}%'
  , 'shows.editor.commission.overridden': 'Anulado'
  , 'shows.editor.commission.overriddenIndicator': 'Comisión modificada'
  , 'shows.editor.commission.reset': 'Restaurar por defecto'
  , 'shows.editor.label.currency': 'Moneda'
  , 'shows.editor.help.currency': 'Moneda del contrato'
  , 'shows.editor.fx.rateOn': 'Cambio'
  , 'shows.editor.fx.convertedFee': '≈ {amount} {base}'
  , 'shows.editor.fx.unavailable': 'Cambio no disponible'
  , 'shows.editor.costs.title': 'Costes'
  , 'shows.editor.costs.empty': 'Sin costes aún — añade uno'
  , 'shows.editor.costs.recent': 'Recientes'
  , 'shows.editor.costs.templates': 'Plantillas'
  , 'shows.editor.costs.subtotal': 'Subtotal {category}'
  , 'shows.editor.actions.promote': 'Promocionar'
  , 'shows.editor.actions.planTravel': 'Plan viaje'
  , 'shows.editor.state.hint': 'Usa el badge o este selector'
  , 'shows.editor.save.create': 'Guardar'
  , 'shows.editor.save.edit': 'Guardar cambios'
  , 'shows.editor.save.retry': 'Reintentar'
  , 'shows.editor.toast.undo': 'Deshacer'
  , 'shows.editor.tab.active': 'Pestaña {label} activa'
  , 'shows.editor.tab.restored': 'Última pestaña restaurada: {label}'
  , 'shows.editor.errors.count': 'Hay {n} errores'
  , 'shows.editor.discard.title': '¿Descartar cambios?'
  , 'shows.editor.discard.body': 'Tienes cambios sin guardar. Se perderán.'
  , 'shows.editor.discard.cancel': 'Seguir editando'
  , 'shows.editor.discard.confirm': 'Descartar'
  , 'shows.editor.delete.confirmTitle': '¿Borrar show?'
  , 'shows.editor.delete.confirmBody': 'Esta acción no se puede deshacer.'
  , 'shows.editor.delete.confirm': 'Borrar'
  , 'shows.editor.delete.cancel': 'Cancelar'
  , 'shows.noCosts': 'Sin costes aún'
  , 'shows.filters.region': 'Región'
  , 'shows.filters.region.all': 'Todas'
  , 'shows.filters.region.AMER': 'AMER'
  , 'shows.filters.region.EMEA': 'EMEA'
  , 'shows.filters.region.APAC': 'APAC'
  , 'shows.filters.feeMin': 'Cachet mín.'
  , 'shows.filters.feeMax': 'Cachet máx.'
  , 'shows.views.export': 'Exportar vistas'
  , 'shows.views.import': 'Importar vistas'
  , 'shows.views.applied': 'Vista aplicada'
  , 'shows.bulk.delete': 'Borrar seleccionados'
  , 'shows.bulk.setWht': 'Fijar % IRPF'
  , 'shows.bulk.applyWht': 'Aplicar IRPF'
  , 'shows.bulk.setStatus': 'Cambiar estado'
  , 'shows.bulk.apply': 'Aplicar'
  , 'shows.travel.title': 'Ubicación'
  , 'shows.travel.quick': 'Viaje'
  , 'shows.travel.soon': 'Show confirmado próximo — considera añadir viaje.'
  , 'shows.travel.soonConfirmed': 'Show confirmado próximo — considera añadir viaje.'
  , 'shows.travel.soonGeneric': 'Show próximo — considera planificar viaje.'
  , 'shows.travel.tripExists': 'Ya hay un viaje planificado en estas fechas'
  , 'shows.travel.noCta': 'No se requiere acción de viaje'
  , 'shows.travel.plan': 'Planificar viaje'
  , 'cmd.dialog': 'Paleta de comandos'
  , 'cmd.placeholder': 'Buscar shows o acciones…'
  , 'cmd.type.show': 'Show'
  , 'cmd.type.action': 'Acción'
  , 'cmd.noResults': 'Sin resultados'
  , 'cmd.footer.hint': 'Enter para ejecutar • Esc para cerrar'
  , 'cmd.footer.tip': 'Sugerencia: pulsa ? para atajos'
  , 'cmd.openFilters': 'Abrir filtros'
  , 'cmd.mask.enable': 'Activar enmascarado'
  , 'cmd.mask.disable': 'Desactivar enmascarado'
  , 'cmd.presentation.enable': 'Activar modo presentación'
  , 'cmd.presentation.disable': 'Desactivar modo presentación'
  , 'cmd.shortcuts': 'Mostrar panel de atajos'
  , 'cmd.switch.default': 'Cambiar vista: Predeterminada'
  , 'cmd.switch.finance': 'Cambiar vista: Finanzas'
  , 'cmd.switch.operations': 'Cambiar vista: Operaciones'
  , 'cmd.switch.promo': 'Cambiar vista: Promoción'
  , 'cmd.openAlerts': 'Abrir centro de alertas'
  , 'cmd.go.shows': 'Ir a Shows'
  , 'cmd.go.travel': 'Ir a Viajes'
  , 'cmd.go.finance': 'Ir a Finanzas'
  , 'shortcuts.dialog': 'Atajos de teclado'
  , 'shortcuts.title': 'Atajos'
  , 'shortcuts.desc': 'Úsalos para moverte más rápido. Pulsa Esc para cerrar.'
  , 'shortcuts.openPalette': 'Abrir paleta de comandos'
  , 'shortcuts.showOverlay': 'Mostrar este panel'
  , 'shortcuts.closeDialogs': 'Cerrar diálogos/ventanas'
  , 'alerts.open': 'Abrir alertas'
  , 'alerts.loading': 'Cargando alertas…'
  , 'actions.exportCsv': 'Exportar CSV'
  , 'actions.copyDigest': 'Copiar resumen'
  , 'actions.digest.title': 'Resumen semanal de alertas'
  , 'actions.toast.csv': 'CSV copiado'
  , 'actions.toast.digest': 'Resumen copiado'
  , 'finance.pivot': 'Pivote'
  , 'finance.pivot.group': 'Grupo'
  , 'finance.ar.view': 'Ver'
  , 'finance.ar.remind': 'Recordar'
  , 'finance.ar.reminder.queued': 'Recordatorio en cola'
  , 'actions.toast.share': 'Enlace copiado'
  , 'shows.toast.bulk.status': 'Estado: {status} ({n})'
  , 'shows.toast.bulk.confirm': 'Confirmados'
  , 'shows.toast.bulk.setStatus': 'Estado aplicado'
  , 'shows.toast.bulk.setWht': 'IRPF aplicado'
  , 'shows.toast.bulk.export': 'Exportación iniciada'
  , 'shows.toast.bulk.delete': 'Eliminados'
  , 'shows.toast.bulk.confirmed': 'Confirmados ({n})'
  , 'shows.toast.bulk.wht': 'IRPF {pct}% ({n})'
  , 'filters.clear': 'Limpiar'
  , 'filters.more': 'Más filtros'
  , 'filters.cleared': 'Filtros restablecidos'
  , 'filters.presets': 'Atajos'
  , 'filters.presets.last7': 'Últimos 7 días'
  , 'filters.presets.last30': 'Últimos 30 días'
  , 'filters.presets.last90': 'Últimos 90 días'
  , 'filters.presets.mtd': 'Mes hasta hoy'
  , 'filters.presets.ytd': 'Año hasta hoy'
  , 'filters.presets.qtd': 'Trimestre hasta hoy'
  , 'filters.applied': 'Filtros aplicados'
  , 'common.team': 'Equipo'
  , 'common.region': 'Región'
  , 'ah.planTravel': 'Planificar viaje'
  , 'map.cssWarning': 'No se pudo cargar el CSS del mapa. Usando estilo básico.'
  , 'travel.offline': 'Modo sin conexión: mostrando itinerarios en caché.'
  , 'travel.refresh.error': 'No se pudo actualizar viajes. Mostrando datos en caché.'
  
  , 'travel.search.title': 'Buscador'
  , 'travel.search.open_in_google': 'Abrir en Google Flights'
  , 'travel.search.mode.form': 'Formulario'
  , 'travel.search.mode.text': 'Texto'
  , 'travel.search.show_text': 'Entrada libre (opcional)'
  , 'travel.search.hide_text': 'Ocultar entrada libre'
  , 'travel.search.text.placeholder': 'p. ej., De MAD a CDG 2025-10-12 2 adultos business'
  , 'travel.nlp': 'NLP'
  , 'travel.search.origin': 'Origen'
  , 'travel.search.destination': 'Destino'
  , 'travel.search.departure_date': 'Fecha de salida'
  , 'travel.search.searching': 'Buscando vuelos…'
  , 'travel.search.show_more_options': 'Abrir externamente'
  , 'travel.advanced.show': 'Más opciones'
  , 'travel.advanced.hide': 'Ocultar opciones avanzadas'
  , 'travel.flight_card.nonstop': 'sin escalas'
  , 'travel.flight_card.stop': 'escala'
  , 'travel.flight_card.stops': 'escalas'
  , 'travel.flight_card.select_for_planning': 'Seleccionar para planificar'
  , 'travel.add_to_trip': 'Añadir al viaje'
  , 'travel.swap': 'Invertir'
  , 'travel.round_trip': 'Ida y vuelta'
  , 'travel.share_search': 'Compartir búsqueda'
  , 'travel.from': 'Origen'
  , 'travel.to': 'Destino'
  , 'travel.depart': 'Salida'
  , 'travel.return': 'Vuelta'
  , 'travel.adults': 'Adultos'
  , 'travel.bag': 'bulto'
  , 'travel.bags': 'Bultos'
  , 'travel.cabin': 'Clase'
  , 'travel.stops_ok': 'Con escalas'
  , 'travel.deeplink.preview': 'Ver enlace'
  , 'travel.deeplink.copy': 'Copiar enlace'
  , 'travel.deeplink.copied': 'Copiado ✓'
  , 'travel.sort.menu': 'Ordenar por'
  , 'travel.sort.priceAsc': 'Precio (asc)'
  , 'travel.sort.priceDesc': 'Precio (desc)'
  , 'travel.sort.duration': 'Duración'
  , 'travel.sort.stops': 'Paradas'
  , 'travel.badge.nonstop': 'Sin escalas'
  , 'travel.badge.baggage': 'Equipaje incluido'
  , 'travel.arrival.sameDay': 'Llega el mismo día'
  , 'travel.arrival.nextDay': 'Llega al día siguiente'
  , 'travel.recent.clear': 'Borrar recientes'
  , 'travel.recent.remove': 'Eliminar'
  , 'travel.form.invalid': 'Corrige los errores para buscar'
  , 'travel.nlp.hint': 'Entrada libre — pulsa Shift+Enter para aplicar'
  , 'travel.flex.days': '±{n} días'
  , 'travel.compare.grid.title': 'Comparar vuelos'
  , 'travel.compare.empty': 'Fija vuelos para compararlos aquí.'
  , 'travel.compare.hint': 'Revisa vuelos fijados en paralelo.'
  , 'travel.co2.label': 'CO₂'
  , 'common.copied': 'Copiado'
  
  , 'travel.window': 'Ventana'
  , 'travel.flex_window': 'Ventana flexible'
  , 'travel.flex_hint': 'Exploraremos ±%d en la app'
  , 'travel.one_way': 'Sólo ida'
  , 'travel.nonstop': 'Sin escalas'
  , 'travel.pin': 'Fijar'
  , 'travel.unpin': 'Quitar'
  , 'travel.compare.title': 'Comparar fijados'
  , 'travel.compare.show': 'Comparar'
  , 'travel.compare.hide': 'Ocultar'
  , 'travel.compare.add_to_trip': 'Añadir al viaje'
  , 'travel.trip.added': 'Añadido al viaje'
  , 'travel.trip.create_drop': 'Suelta aquí para crear nuevo viaje'
  , 'travel.related_show': 'Show relacionado'
  , 'travel.multicity.toggle': 'Multiciudad'
  , 'travel.multicity': 'Multi-ciudad'
  , 'travel.multicity.add_leg': 'Añadir tramo'
  , 'travel.multicity.remove': 'Eliminar'
  , 'travel.multicity.move_up': 'Subir'
  , 'travel.multicity.move_down': 'Bajar'
  , 'travel.multicity.open': 'Abrir ruta en Google Flights'
  , 'travel.multicity.hint': 'Añade al menos dos tramos para construir la ruta'
  
  , 'travel.trips': 'Viajes'
  , 'travel.trip.new': 'Nuevo viaje'
  , 'travel.trip.to': 'Viaje a'
  , 'travel.segments': 'Segmentos'
  , 'common.actions': 'Acciones'
  , 'travel.status.planned': 'Planificado'
  , 'travel.status.requested': 'Solicitado'
  , 'travel.status.booked': 'Reservado'
  , 'travel.hub.title': 'Buscador'
  , 'travel.hub.needs_planning': 'Sugerencias'
  , 'travel.hub.upcoming': 'Próximos'
  , 'travel.hub.open_multicity': 'Abrir multicity'
  , 'travel.hub.plan_trip_cta': 'Planificar viaje'
  , 'travel.error.same_route': 'Origen y destino son iguales'
  , 'travel.error.return_before_depart': 'La vuelta es anterior a la salida'
  , 'travel.segment.type': 'Tipo'
  , 'travel.segment.flight': 'Vuelo'
  , 'travel.segment.hotel': 'Hotel'
  , 'travel.segment.ground': 'Terrestre'
  , 'copy.manual.title': 'Copia manual'
  , 'copy.manual.desc': 'Copia el texto de abajo si el portapapeles está bloqueado.'
  , 'common.noResults': 'Sin resultados'
  , 'tripDetail.currency': 'Moneda'
  , 'cost.category.flight': 'Vuelo'
  , 'cost.category.hotel': 'Hotel'
  , 'cost.category.ground': 'Terrestre'
  , 'cost.category.taxes': 'Impuestos'
  , 'cost.category.fees': 'Comisiones'
  , 'cost.category.other': 'Otros'
  , 'travel.workspace.placeholder': 'Selecciona un viaje para ver detalles o realiza una búsqueda.'
  , 'travel.open_in_provider': 'Abrir en proveedor'
  , 'common.loading': 'Cargando…'
  , 'common.results': 'resultados'
  , 'travel.no_trips_yet': 'No hay viajes aún. ¡Usa la búsqueda para empezar!'
  , 'travel.provider': 'Proveedor'
  , 'provider.mock': 'En la app (mock)'
  , 'provider.google': 'Google Flights'
  , 'travel.alert.checkin': 'El check-in abre en %s'
  , 'travel.alert.priceDrop': 'El precio bajó %s'
  , 'travel.workspace.open': 'Abrir Travel Workspace'
  , 'travel.workspace.timeline': 'Vista de cronología'
  , 'travel.workspace.trip_builder.beta': 'Constructor de viajes (beta)'
  , 'common.list': 'Lista'
  , 'common.clear': 'Limpiar'
  , 'common.reset': 'Restablecer'
  , 'calendar.timeline': 'Semana'
  , 'common.moved': 'Movido'
  , 'travel.drop.hint': 'Arrastra a otro día'
  , 'travel.search.summary': 'Resumen de búsqueda'
  , 'travel.search.route': '{from} → {to}'
  , 'travel.search.paxCabin': '{pax} pax · {cabin}'
  , 'travel.results.countForDate': '{count} resultados para {date}'
  , 'travel.compare.bestPrice': 'Mejor precio'
  , 'travel.compare.bestTime': 'Más rápido'
  , 'travel.compare.bestBalance': 'Mejor equilibrio'
  , 'travel.co2.estimate': '~{kg} kg CO₂ (est.)'
  , 'travel.mobile.sticky.results': 'Resultados'
  , 'travel.mobile.sticky.compare': 'Comparar'
  , 'travel.tooltips.flex': 'Explora ± días alrededor de la fecha seleccionada'
  , 'travel.tooltips.nonstop': 'Solo vuelos sin escalas'
  , 'travel.tooltips.cabin': 'Preferencia de clase'
  , 'travel.move.prev': 'Mover al día anterior'
  , 'travel.move.next': 'Mover al día siguiente'
  , 'travel.rest.short': 'Descanso corto antes del siguiente show'
  , 'travel.rest.same_day': 'Riesgo: show el mismo día'
  , 'calendar.title': 'Calendario'
  , 'calendar.prev': 'Mes anterior'
  , 'calendar.next': 'Mes siguiente'
  , 'calendar.today': 'Hoy'
  , 'calendar.goto': 'Ir a fecha'
  , 'calendar.more': 'más'
  , 'calendar.more.title': 'Más eventos'
  , 'calendar.more.openDay': 'Abrir día'
  , 'calendar.more.openFullDay': 'Abrir día completo'
  , 'calendar.announce.moved': 'Show movido a {d}'
  , 'calendar.announce.copied': 'Show duplicado a {d}'
  , 'calendar.quickAdd.hint': 'Enter para añadir • Esc para cancelar'
  , 'calendar.quickAdd.advanced': 'Avanzado'
  , 'calendar.quickAdd.simple': 'Simple'
  , 'calendar.quickAdd.placeholder': 'Ciudad CC Fee (opcional)… p. ej., Madrid ES 12000'
  , 'calendar.quickAdd.recent': 'Recientes'
  , 'calendar.quickAdd.parseError': "No entiendo — prueba 'Madrid ES 12000'"
  , 'calendar.quickAdd.countryMissing': 'Añade el código de país (2 letras)'
  , 'calendar.goto.hint': 'Enter para ir • Esc para cerrar'
  , 'calendar.view.switch': 'Cambiar vista del calendario'
  , 'calendar.view.month': 'Mes'
  , 'calendar.view.week': 'Semana'
  , 'calendar.view.day': 'Día'
  , 'calendar.view.agenda': 'Agenda'
  , 'calendar.view.announce': 'Vista {v}'
  , 'calendar.timezone': 'Zona horaria'
  , 'calendar.tz.local': 'Local'
  , 'calendar.tz.localLabel': 'Local'
  , 'calendar.tz.changed': 'Zona horaria cambiada a {tz}'
  , 'calendar.goto.shortcut': '⌘/Ctrl + G'
  , 'calendar.shortcut.pgUp': 'Re Pág / Alt+←'
  , 'calendar.shortcut.pgDn': 'Av Pág / Alt+→'
  , 'calendar.shortcut.today': 'T'
  , 'common.move': 'Mover'
  , 'common.copy': 'Copiar'
  , 'calendar.more.filter': 'Filtrar eventos'
  , 'calendar.more.empty': 'Sin resultados'
  , 'calendar.kb.hint': 'Teclado: Flechas mueve el día, PageUp/PageDown cambia mes, T ir a hoy, Enter o Espacio selecciona día.'
  , 'calendar.day.select': 'Seleccionado {d}'
  , 'calendar.day.focus': 'Foco {d}'
  , 'calendar.event.one': 'evento'
  , 'calendar.event.many': 'eventos'
  , 'calendar.noEvents': 'No hay eventos para este día'
  , 'calendar.show.shows': 'Shows'
  , 'calendar.show.travel': 'Viajes'
  , 'calendar.kind': 'Tipo'
  , 'calendar.kind.show': 'Show'
  , 'calendar.kind.travel': 'Viaje'
  , 'calendar.status': 'Estado'
  , 'calendar.dnd.enter': 'Soltar aquí para colocar el evento en {d}'
  , 'calendar.dnd.leave': 'Saliendo del destino de soltado'
  , 'calendar.kbdDnD.marked': 'Marcado {d} como origen. Pulsa Enter en el día destino para soltar. Mantén Ctrl/Cmd para copiar.'
  , 'calendar.kbdDnD.cancel': 'Modo mover/copiar cancelado'
  , 'calendar.kbdDnD.origin': 'Origen (modo mover/copiar por teclado activo)'
  , 'calendar.kbdDnD.none': 'No hay show que mover desde el origen seleccionado'
  , 'calendar.weekStart': 'Inicio de semana'
  , 'calendar.weekStart.mon': 'Lun'
  , 'calendar.weekStart.sun': 'Dom'
  , 'common.selected': 'Seleccionado'
  , 'calendar.import': 'Importar'
  , 'calendar.import.ics': 'Importar .ics'
  , 'calendar.import.done': 'Importados {n} eventos'
  , 'calendar.import.error': 'Error al importar .ics'
  , 'calendar.wd.mon': 'Lun'
  , 'calendar.wd.tue': 'Mar'
  , 'calendar.wd.wed': 'Mié'
  , 'calendar.wd.thu': 'Jue'
  , 'calendar.wd.fri': 'Vie'
  , 'calendar.wd.sat': 'Sáb'
  , 'calendar.wd.sun': 'Dom'
  , 'shows.costs.type': 'Tipo'
  , 'shows.costs.placeholder': 'Viaje / Producción / Marketing'
  , 'shows.costs.amount': 'Importe'
  , 'shows.costs.desc': 'Descripción'
  , 'common.optional': 'Opcional'
  , 'common.add': 'Añadir'
  , 'common.apply': 'Aplicar'
  , 'common.income': 'Ingresos'
  , 'common.wht': 'IRPF'
  , 'common.commissions': 'Comisiones'
  , 'common.net': 'Neto'
  , 'common.costs': 'Costes'
  , 'common.total': 'Total'
  , 'shows.editor.status.promote': 'Promocionado a'
  , 'export.options': 'Opciones de exportación'
  , 'export.columns': 'Columnas'
  , 'export.csv': 'CSV'
  , 'export.xlsx': 'XLSX'
  , 'common.exporting': 'Exportando…'
  , 'charts.viewTable': 'Ver datos como tabla'
  , 'charts.hideTable': 'Ocultar tabla'
  , 'finance.period.mtd': 'Mes hasta hoy'
  , 'finance.period.lastMonth': 'Mes pasado'
  , 'finance.period.ytd': 'Año hasta hoy'
  , 'finance.period.custom': 'Personalizado'
  , 'finance.period.closed': 'Cerrado'
  , 'finance.period.open': 'Abierto'
  , 'finance.closeMonth': 'Cerrar mes'
  , 'finance.reopenMonth': 'Reabrir mes'
  , 'finance.closed.help': 'Mes cerrado. Reábrelo para hacer cambios.'
  , 'finance.kpi.mtdNet': 'Neto MTD'
  , 'finance.kpi.ytdNet': 'Neto YTD'
  , 'finance.kpi.forecastEom': 'Previsión fin de mes'
  , 'finance.kpi.deltaTarget': 'Δ vs objetivo'
  , 'finance.kpi.gm': 'GM%'
  , 'finance.kpi.dso': 'DSO'
  , 'finance.comparePrev': 'Comparar con anterior'
  , 'shows.margin.tooltip': 'Neto dividido por Cachet (%)'
  , 'shows.empty': 'No hay shows con esos filtros'
  , 'shows.empty.add': 'Añade tu primer show'
  , 'shows.export.csv.success': 'CSV exportado ✓'
  , 'shows.export.xlsx.success': 'XLSX exportado ✓'
  , 'finance.export.csv.success': 'CSV exportado ✓'
  , 'finance.export.xlsx.success': 'XLSX exportado ✓'
  , 'shows.sort.tooltip': 'Ordenar por columna'
  , 'shows.filters.statusGroup': 'Filtros de estado'
  , 'shows.relative.inDays': 'En {n} días'
  , 'shows.relative.daysAgo': 'Hace {n} días'
  , 'shows.relative.yesterday': 'Ayer'
  , 'shows.row.menu': 'Acciones de fila'
  , 'shows.action.edit': 'Editar'
  , 'shows.action.promote': 'Promover'
  , 'shows.action.duplicate': 'Duplicar'
  , 'shows.action.archive': 'Archivar'
  , 'shows.action.delete': 'Eliminar'
  , 'shows.action.restore': 'Restaurar'
  , 'shows.board.header.net': 'Neto'
  , 'shows.board.header.count': 'Shows'
  , 'shows.datePreset.thisMonth': 'Este mes'
  , 'shows.datePreset.nextMonth': 'Próximo mes'
  , 'shows.columns.config': 'Columnas'
  , 'shows.columns.wht': 'IRPF %'
  , 'shows.totals.pin': 'Fijar totales'
  , 'shows.totals.unpin': 'Desfijar totales'
  , 'shows.totals.avgFee': 'Cachet medio'
  , 'shows.totals.avgFee.tooltip': 'Cachet medio por show'
  , 'shows.totals.avgMargin': 'Margen medio %'
  , 'shows.totals.avgMargin.tooltip': 'Margen medio % en shows con cachet'
  , 'shows.wht.hide': 'Ocultar columna IRPF'
  , 'shows.sort.aria.sortedDesc': 'Orden descendente'
  , 'shows.sort.aria.sortedAsc': 'Orden ascendente'
  , 'shows.sort.aria.notSorted': 'Sin ordenar'
  , 'shows.sort.aria.activateDesc': 'Activar para ordenar descendente'
  , 'shows.sort.aria.activateAsc': 'Activar para ordenar ascendente'
  }
};

let current: Lang = 'en';
export function setLang(l: Lang){ current = l; try { localStorage.setItem('lang', l); } catch {}
}
export function getLang(): Lang { try { return (localStorage.getItem('lang') as Lang) || current; } catch { return current; } }
export function t(key: string){ const lang = getLang(); return DICT[lang][key] || DICT.en[key] || key; }
