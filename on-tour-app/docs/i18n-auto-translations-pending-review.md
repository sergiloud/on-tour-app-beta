# i18n Translation Gaps - Manual Translation Guide

📝 **Manual translation required** - Fill in missing translations below

Generated: 2025-10-11

## Summary

| Language | Current Coverage | Missing Keys | Status |
|----------|------------------|--------------|--------|
| ES | 91.2% | 152 | ⚠️ Needs translation |
| FR | 17.6% | 1155 | ⚠️ Needs translation |
| DE | 17.6% | 1155 | ⚠️ Needs translation |
| IT | 17.6% | 1155 | ⚠️ Needs translation |
| PT | 17.6% | 1155 | ⚠️ Needs translation |

---

## ES - 152 Missing Translations

**Translation guidelines:**
- Keep technical terms consistent (e.g., "show", "fee", "status")
- Match tone: professional but friendly
- Consider context: these appear in UI buttons, labels, and messages
- Preserve placeholders: `{name}`, `{count}`, etc.

### Quick Copy Format (for src/lib/i18n.ts)

```typescript
    , 'scopes.tooltip.shows': '' // TODO: translate "Shows access granted by link"
    , 'scopes.tooltip.travel': '' // TODO: translate "Travel access granted by link"
    , 'scopes.tooltip.finance': '' // TODO: translate "Finance: read-only per link policy"
    , 'kpi.shows': '' // TODO: translate "Shows"
    , 'kpi.net': '' // TODO: translate "Net"
    , 'kpi.travel': '' // TODO: translate "Travel"
    , 'cmd.go.profile': '' // TODO: translate "Go to profile"
    , 'cmd.go.preferences': '' // TODO: translate "Go to preferences"
    , 'common.copyLink': '' // TODO: translate "Copy link"
    , 'common.learnMore': '' // TODO: translate "Learn more"
    , 'testimonials.title': '' // TODO: translate "Trusted by Industry Leaders"
    , 'testimonials.subtitle': '' // TODO: translate "Real stories from the touring industry"
    , 'testimonials.subtitle.artist': '' // TODO: translate "See how artists are taking control of their careers"
    , 'testimonials.subtitle.agency': '' // TODO: translate "Discover how agencies are transforming their operations"
    , 'finance.pivot': '' // TODO: translate "Pivot"
    , 'finance.pivot.group': '' // TODO: translate "Group"
    , 'finance.ar.view': '' // TODO: translate "View"
    , 'finance.ar.remind': '' // TODO: translate "Remind"
    , 'finance.ar.reminder.queued': '' // TODO: translate "Reminder queued"
    , 'finance.thisMonth': '' // TODO: translate "This Month"
    , 'common.saveView': '' // TODO: translate "Save view"
    , 'common.import': '' // TODO: translate "Import"
    , 'common.export': '' // TODO: translate "Export"
    , 'common.markDone': '' // TODO: translate "Mark done"
    , 'common.hideItem': '' // TODO: translate "Hide"
    , 'views.import.invalidShape': '' // TODO: translate "Invalid views JSON shape"
    , 'views.import.invalidJson': '' // TODO: translate "Invalid JSON"
    , 'shows.totals.fees': '' // TODO: translate "Fees"
    , 'shows.totals.net': '' // TODO: translate "Net"
    , 'shows.totals.hide': '' // TODO: translate "Hide"
    , 'shows.totals.show': '' // TODO: translate "Show totals"
    , 'shows.view.list': '' // TODO: translate "List"
    , 'shows.view.board': '' // TODO: translate "Board"
    , 'shows.views.none': '' // TODO: translate "Views"
    , 'views.manage': '' // TODO: translate "Manage views"
    , 'views.saved': '' // TODO: translate "Saved"
    , 'views.apply': '' // TODO: translate "Apply"
    , 'views.none': '' // TODO: translate "No saved views"
    , 'views.deleted': '' // TODO: translate "Deleted"
    , 'views.export': '' // TODO: translate "Export"
    , 'views.import': '' // TODO: translate "Import"
    , 'views.import.hint': '' // TODO: translate "Paste JSON of views to import"
    , 'views.openLab': '' // TODO: translate "Open Layout Lab"
    , 'views.share': '' // TODO: translate "Copy share link"
    , 'views.export.copied': '' // TODO: translate "Export copied"
    , 'views.imported': '' // TODO: translate "Views imported"
    , 'views.import.invalid': '' // TODO: translate "Invalid JSON"
    , 'views.label': '' // TODO: translate "View"
    , 'views.names.default': '' // TODO: translate "Default"
    , 'views.names.finance': '' // TODO: translate "Finance"
    , 'views.names.operations': '' // TODO: translate "Operations"
    , 'views.names.promo': '' // TODO: translate "Promotion"
    , 'shows.views.delete': '' // TODO: translate "Delete"
    , 'shows.views.namePlaceholder': '' // TODO: translate "View name"
    , 'shows.views.save': '' // TODO: translate "Save"
    , 'shows.bulk.selected': '' // TODO: translate "selected"
    , 'shows.bulk.confirm': '' // TODO: translate "Confirm"
    , 'shows.bulk.promote': '' // TODO: translate "Promote"
    , 'shows.bulk.export': '' // TODO: translate "Export"
    , 'shows.notes': '' // TODO: translate "Notes"
    , 'shows.virtualized.hint': '' // TODO: translate "Virtualized list active"
    , 'story.title': '' // TODO: translate "Story mode"
    , 'story.timeline': '' // TODO: translate "Timeline"
    , 'story.play': '' // TODO: translate "Play"
    , 'story.pause': '' // TODO: translate "Pause"
    , 'story.cta': '' // TODO: translate "Story mode"
    , 'story.scrub': '' // TODO: translate "Scrub timeline"
    , 'finance.overview': '' // TODO: translate "Finance overview"
    , 'shows.title': '' // TODO: translate "Shows"
    , 'shows.notFound': '' // TODO: translate "Show not found"
    , 'shows.search.placeholder': '' // TODO: translate "Search city/country"
    , 'shows.add': '' // TODO: translate "Add show"
    , 'shows.edit': '' // TODO: translate "Edit"
    , 'shows.summary.upcoming': '' // TODO: translate "Upcoming"
    , 'shows.summary.totalFees': '' // TODO: translate "Total Fees"
    , 'shows.summary.estNet': '' // TODO: translate "Est. Net"
    , 'shows.summary.avgWht': '' // TODO: translate "Avg WHT"
    , 'shows.table.date': '' // TODO: translate "Date"
    , 'shows.table.name': '' // TODO: translate "Show"
    , 'shows.table.city': '' // TODO: translate "City"
    , 'shows.table.country': '' // TODO: translate "Country"
    , 'shows.table.venue': '' // TODO: translate "Venue"
    , 'shows.table.promoter': '' // TODO: translate "Promoter"
    , 'shows.table.wht': '' // TODO: translate "WHT %"
    , 'shows.table.type': '' // TODO: translate "Type"
    , 'shows.table.description': '' // TODO: translate "Description"
    , 'shows.table.amount': '' // TODO: translate "Amount"
    , 'shows.table.remove': '' // TODO: translate "Remove"
    , 'shows.table.agency.mgmt': '' // TODO: translate "Mgmt"
    , 'shows.table.agency.booking': '' // TODO: translate "Booking"
    , 'shows.table.agencies': '' // TODO: translate "Agencies"
    , 'shows.table.net': '' // TODO: translate "Net"
    , 'shows.table.status': '' // TODO: translate "Status"
    , 'shows.selectAll': '' // TODO: translate "Select all"
    , 'shows.selectRow': '' // TODO: translate "Select row"
    , 'shows.editor.tabs': '' // TODO: translate "Editor tabs"
    , 'shows.editor.tab.details': '' // TODO: translate "Details"
    , 'shows.editor.tab.finance': '' // TODO: translate "Finance"
    , 'shows.editor.tab.costs': '' // TODO: translate "Costs"
    , 'shows.editor.finance.commissions': '' // TODO: translate "Commissions"
    , 'shows.editor.add': '' // TODO: translate "Add show"
    , 'shows.editor.edit': '' // TODO: translate "Edit show"
    , 'shows.editor.subtitleAdd': '' // TODO: translate "Create a new event"
    , 'shows.editor.label.status': '' // TODO: translate "Status"
    , 'shows.editor.label.date': '' // TODO: translate "Date"
    , 'shows.editor.label.city': '' // TODO: translate "City"
    , 'shows.editor.label.country': '' // TODO: translate "Country"
    , 'shows.editor.label.venue': '' // TODO: translate "Venue"
    , 'shows.editor.label.promoter': '' // TODO: translate "Promoter"
    , 'shows.editor.label.fee': '' // TODO: translate "Fee"
    , 'shows.editor.label.wht': '' // TODO: translate "WHT %"
    , 'shows.editor.label.mgmt': '' // TODO: translate "Mgmt Agency"
    , 'shows.editor.label.booking': '' // TODO: translate "Booking Agency"
    , 'shows.editor.label.notes': '' // TODO: translate "Notes"
    , 'shows.editor.validation.cityRequired': '' // TODO: translate "City is required"
    , 'shows.editor.validation.countryRequired': '' // TODO: translate "Country is required"
    , 'shows.editor.validation.dateRequired': '' // TODO: translate "Date is required"
    , 'shows.editor.validation.feeGtZero': '' // TODO: translate "Fee must be greater than 0"
    , 'shows.editor.validation.whtRange': '' // TODO: translate "WHT must be between 0% and 50%"
    , 'shows.dialog.close': '' // TODO: translate "Close"
    , 'shows.dialog.cancel': '' // TODO: translate "Cancel"
    , 'shows.dialog.save': '' // TODO: translate "Save"
    , 'shows.dialog.saveChanges': '' // TODO: translate "Save changes"
    , 'shows.dialog.delete': '' // TODO: translate "Delete"
    , 'shows.editor.validation.fail': '' // TODO: translate "Fix errors to continue"
    , 'shows.editor.toast.saved': '' // TODO: translate "Saved"
    , 'shows.editor.toast.deleted': '' // TODO: translate "Deleted"
    , 'shows.editor.toast.restored': '' // TODO: translate "Restored"
    , 'shows.editor.toast.deleting': '' // TODO: translate "Deleting…"
    , 'shows.editor.toast.discarded': '' // TODO: translate "Changes discarded"
    , 'shows.editor.toast.validation': '' // TODO: translate "Please correct the highlighted errors"
    , 'shows.editor.summary.fee': '' // TODO: translate "Fee"
    , 'shows.editor.summary.wht': '' // TODO: translate "WHT"
    , 'shows.editor.summary.costs': '' // TODO: translate "Costs"
    , 'shows.editor.summary.net': '' // TODO: translate "Est. Net"
    , 'welcome.change.linkEdited': '' // TODO: translate "Link scopes edited for Danny"
    , 'welcome.change.memberInvited': '' // TODO: translate "New manager invited"
    , 'welcome.change.docUploaded': '' // TODO: translate "New document uploaded"
    , 'empty.noRecent': '' // TODO: translate "No recent items"
    , 'welcome.cta.inviteManager': '' // TODO: translate "Invite manager"
    , 'welcome.cta.connectArtist': '' // TODO: translate "Connect artist"
    , 'welcome.cta.createTeam': '' // TODO: translate "Create team"
    , 'welcome.cta.completeBranding': '' // TODO: translate "Complete branding"
    , 'welcome.cta.reviewShows': '' // TODO: translate "Review shows"
    , 'welcome.cta.connectCalendar': '' // TODO: translate "Connect calendar"
    , 'welcome.assign': '' // TODO: translate "Assign"
    , 'org.documents.title': '' // TODO: translate "Documents"
    , 'org.reports.title': '' // TODO: translate "Reports"
    , 'org.integrations.title': '' // TODO: translate "Integrations"
    , 'org.billing.title': '' // TODO: translate "Billing"
    , 'labels.seats.used': '' // TODO: translate "Seats used"
    , 'labels.seats.guests': '' // TODO: translate "Guests"
```

### Detailed Translation Table

| Key | English Original | Your Translation |
|-----|------------------|------------------|
| `scopes.tooltip.shows` | Shows access granted by link | _[translate here]_ |
| `scopes.tooltip.travel` | Travel access granted by link | _[translate here]_ |
| `scopes.tooltip.finance` | Finance: read-only per link policy | _[translate here]_ |
| `kpi.shows` | Shows | _[translate here]_ |
| `kpi.net` | Net | _[translate here]_ |
| `kpi.travel` | Travel | _[translate here]_ |
| `cmd.go.profile` | Go to profile | _[translate here]_ |
| `cmd.go.preferences` | Go to preferences | _[translate here]_ |
| `common.copyLink` | Copy link | _[translate here]_ |
| `common.learnMore` | Learn more | _[translate here]_ |
| `testimonials.title` | Trusted by Industry Leaders | _[translate here]_ |
| `testimonials.subtitle` | Real stories from the touring industry | _[translate here]_ |
| `testimonials.subtitle.artist` | See how artists are taking control of their careers | _[translate here]_ |
| `testimonials.subtitle.agency` | Discover how agencies are transforming their operations | _[translate here]_ |
| `finance.pivot` | Pivot | _[translate here]_ |
| `finance.pivot.group` | Group | _[translate here]_ |
| `finance.ar.view` | View | _[translate here]_ |
| `finance.ar.remind` | Remind | _[translate here]_ |
| `finance.ar.reminder.queued` | Reminder queued | _[translate here]_ |
| `finance.thisMonth` | This Month | _[translate here]_ |
| `common.saveView` | Save view | _[translate here]_ |
| `common.import` | Import | _[translate here]_ |
| `common.export` | Export | _[translate here]_ |
| `common.markDone` | Mark done | _[translate here]_ |
| `common.hideItem` | Hide | _[translate here]_ |
| `views.import.invalidShape` | Invalid views JSON shape | _[translate here]_ |
| `views.import.invalidJson` | Invalid JSON | _[translate here]_ |
| `shows.totals.fees` | Fees | _[translate here]_ |
| `shows.totals.net` | Net | _[translate here]_ |
| `shows.totals.hide` | Hide | _[translate here]_ |
| `shows.totals.show` | Show totals | _[translate here]_ |
| `shows.view.list` | List | _[translate here]_ |
| `shows.view.board` | Board | _[translate here]_ |
| `shows.views.none` | Views | _[translate here]_ |
| `views.manage` | Manage views | _[translate here]_ |
| `views.saved` | Saved | _[translate here]_ |
| `views.apply` | Apply | _[translate here]_ |
| `views.none` | No saved views | _[translate here]_ |
| `views.deleted` | Deleted | _[translate here]_ |
| `views.export` | Export | _[translate here]_ |
| `views.import` | Import | _[translate here]_ |
| `views.import.hint` | Paste JSON of views to import | _[translate here]_ |
| `views.openLab` | Open Layout Lab | _[translate here]_ |
| `views.share` | Copy share link | _[translate here]_ |
| `views.export.copied` | Export copied | _[translate here]_ |
| `views.imported` | Views imported | _[translate here]_ |
| `views.import.invalid` | Invalid JSON | _[translate here]_ |
| `views.label` | View | _[translate here]_ |
| `views.names.default` | Default | _[translate here]_ |
| `views.names.finance` | Finance | _[translate here]_ |
| `views.names.operations` | Operations | _[translate here]_ |
| `views.names.promo` | Promotion | _[translate here]_ |
| `shows.views.delete` | Delete | _[translate here]_ |
| `shows.views.namePlaceholder` | View name | _[translate here]_ |
| `shows.views.save` | Save | _[translate here]_ |
| `shows.bulk.selected` | selected | _[translate here]_ |
| `shows.bulk.confirm` | Confirm | _[translate here]_ |
| `shows.bulk.promote` | Promote | _[translate here]_ |
| `shows.bulk.export` | Export | _[translate here]_ |
| `shows.notes` | Notes | _[translate here]_ |
| `shows.virtualized.hint` | Virtualized list active | _[translate here]_ |
| `story.title` | Story mode | _[translate here]_ |
| `story.timeline` | Timeline | _[translate here]_ |
| `story.play` | Play | _[translate here]_ |
| `story.pause` | Pause | _[translate here]_ |
| `story.cta` | Story mode | _[translate here]_ |
| `story.scrub` | Scrub timeline | _[translate here]_ |
| `finance.overview` | Finance overview | _[translate here]_ |
| `shows.title` | Shows | _[translate here]_ |
| `shows.notFound` | Show not found | _[translate here]_ |
| `shows.search.placeholder` | Search city/country | _[translate here]_ |
| `shows.add` | Add show | _[translate here]_ |
| `shows.edit` | Edit | _[translate here]_ |
| `shows.summary.upcoming` | Upcoming | _[translate here]_ |
| `shows.summary.totalFees` | Total Fees | _[translate here]_ |
| `shows.summary.estNet` | Est. Net | _[translate here]_ |
| `shows.summary.avgWht` | Avg WHT | _[translate here]_ |
| `shows.table.date` | Date | _[translate here]_ |
| `shows.table.name` | Show | _[translate here]_ |
| `shows.table.city` | City | _[translate here]_ |
| `shows.table.country` | Country | _[translate here]_ |
| `shows.table.venue` | Venue | _[translate here]_ |
| `shows.table.promoter` | Promoter | _[translate here]_ |
| `shows.table.wht` | WHT % | _[translate here]_ |
| `shows.table.type` | Type | _[translate here]_ |
| `shows.table.description` | Description | _[translate here]_ |
| `shows.table.amount` | Amount | _[translate here]_ |
| `shows.table.remove` | Remove | _[translate here]_ |
| `shows.table.agency.mgmt` | Mgmt | _[translate here]_ |
| `shows.table.agency.booking` | Booking | _[translate here]_ |
| `shows.table.agencies` | Agencies | _[translate here]_ |
| `shows.table.net` | Net | _[translate here]_ |
| `shows.table.status` | Status | _[translate here]_ |
| `shows.selectAll` | Select all | _[translate here]_ |
| `shows.selectRow` | Select row | _[translate here]_ |
| `shows.editor.tabs` | Editor tabs | _[translate here]_ |
| `shows.editor.tab.details` | Details | _[translate here]_ |
| `shows.editor.tab.finance` | Finance | _[translate here]_ |
| `shows.editor.tab.costs` | Costs | _[translate here]_ |
| `shows.editor.finance.commissions` | Commissions | _[translate here]_ |
| `shows.editor.add` | Add show | _[translate here]_ |
| `shows.editor.edit` | Edit show | _[translate here]_ |
| `shows.editor.subtitleAdd` | Create a new event | _[translate here]_ |
| `shows.editor.label.status` | Status | _[translate here]_ |
| `shows.editor.label.date` | Date | _[translate here]_ |
| `shows.editor.label.city` | City | _[translate here]_ |
| `shows.editor.label.country` | Country | _[translate here]_ |
| `shows.editor.label.venue` | Venue | _[translate here]_ |
| `shows.editor.label.promoter` | Promoter | _[translate here]_ |
| `shows.editor.label.fee` | Fee | _[translate here]_ |
| `shows.editor.label.wht` | WHT % | _[translate here]_ |
| `shows.editor.label.mgmt` | Mgmt Agency | _[translate here]_ |
| `shows.editor.label.booking` | Booking Agency | _[translate here]_ |
| `shows.editor.label.notes` | Notes | _[translate here]_ |
| `shows.editor.validation.cityRequired` | City is required | _[translate here]_ |
| `shows.editor.validation.countryRequired` | Country is required | _[translate here]_ |
| `shows.editor.validation.dateRequired` | Date is required | _[translate here]_ |
| `shows.editor.validation.feeGtZero` | Fee must be greater than 0 | _[translate here]_ |
| `shows.editor.validation.whtRange` | WHT must be between 0% and 50% | _[translate here]_ |
| `shows.dialog.close` | Close | _[translate here]_ |
| `shows.dialog.cancel` | Cancel | _[translate here]_ |
| `shows.dialog.save` | Save | _[translate here]_ |
| `shows.dialog.saveChanges` | Save changes | _[translate here]_ |
| `shows.dialog.delete` | Delete | _[translate here]_ |
| `shows.editor.validation.fail` | Fix errors to continue | _[translate here]_ |
| `shows.editor.toast.saved` | Saved | _[translate here]_ |
| `shows.editor.toast.deleted` | Deleted | _[translate here]_ |
| `shows.editor.toast.restored` | Restored | _[translate here]_ |
| `shows.editor.toast.deleting` | Deleting… | _[translate here]_ |
| `shows.editor.toast.discarded` | Changes discarded | _[translate here]_ |
| `shows.editor.toast.validation` | Please correct the highlighted errors | _[translate here]_ |
| `shows.editor.summary.fee` | Fee | _[translate here]_ |
| `shows.editor.summary.wht` | WHT | _[translate here]_ |
| `shows.editor.summary.costs` | Costs | _[translate here]_ |
| `shows.editor.summary.net` | Est. Net | _[translate here]_ |
| `welcome.change.linkEdited` | Link scopes edited for Danny | _[translate here]_ |
| `welcome.change.memberInvited` | New manager invited | _[translate here]_ |
| `welcome.change.docUploaded` | New document uploaded | _[translate here]_ |
| `empty.noRecent` | No recent items | _[translate here]_ |
| `welcome.cta.inviteManager` | Invite manager | _[translate here]_ |
| `welcome.cta.connectArtist` | Connect artist | _[translate here]_ |
| `welcome.cta.createTeam` | Create team | _[translate here]_ |
| `welcome.cta.completeBranding` | Complete branding | _[translate here]_ |
| `welcome.cta.reviewShows` | Review shows | _[translate here]_ |
| `welcome.cta.connectCalendar` | Connect calendar | _[translate here]_ |
| `welcome.assign` | Assign | _[translate here]_ |
| `org.documents.title` | Documents | _[translate here]_ |
| `org.reports.title` | Reports | _[translate here]_ |
| `org.integrations.title` | Integrations | _[translate here]_ |
| `org.billing.title` | Billing | _[translate here]_ |
| `labels.seats.used` | Seats used | _[translate here]_ |
| `labels.seats.guests` | Guests | _[translate here]_ |

## FR - 1155 Missing Translations

**Translation guidelines:**
- Keep technical terms consistent (e.g., "show", "fee", "status")
- Match tone: professional but friendly
- Consider context: these appear in UI buttons, labels, and messages
- Preserve placeholders: `{name}`, `{count}`, etc.

### Quick Copy Format (for src/lib/i18n.ts)

```typescript
    , 'scopes.tooltip.shows': '' // TODO: translate "Shows access granted by link"
    , 'scopes.tooltip.travel': '' // TODO: translate "Travel access granted by link"
    , 'scopes.tooltip.finance': '' // TODO: translate "Finance: read-only per link policy"
    , 'kpi.shows': '' // TODO: translate "Shows"
    , 'kpi.net': '' // TODO: translate "Net"
    , 'kpi.travel': '' // TODO: translate "Travel"
    , 'cmd.go.profile': '' // TODO: translate "Go to profile"
    , 'cmd.go.preferences': '' // TODO: translate "Go to preferences"
    , 'common.copyLink': '' // TODO: translate "Copy link"
    , 'common.learnMore': '' // TODO: translate "Learn more"
    , 'insights.thisMonthTotal': '' // TODO: translate "This Month Total"
    , 'insights.statusBreakdown': '' // TODO: translate "Status breakdown"
    , 'insights.upcoming14d': '' // TODO: translate "Upcoming 14d"
    , 'common.openShow': '' // TODO: translate "Open show"
    , 'common.centerMap': '' // TODO: translate "Center map"
    , 'common.dismiss': '' // TODO: translate "Dismiss"
    , 'common.snooze7': '' // TODO: translate "Snooze 7 days"
    , 'common.snooze30': '' // TODO: translate "Snooze 30 days"
    , 'common.on': '' // TODO: translate "on"
    , 'common.off': '' // TODO: translate "off"
    , 'common.hide': '' // TODO: translate "Hide"
    , 'common.pin': '' // TODO: translate "Pin"
    , 'common.unpin': '' // TODO: translate "Unpin"
    , 'common.map': '' // TODO: translate "Map"
    , 'layout.invite': '' // TODO: translate "Invite"
    , 'layout.build': '' // TODO: translate "Build: preview"
    , 'layout.demo': '' // TODO: translate "Status: demo feed"
    , 'alerts.title': '' // TODO: translate "Alert Center"
    , 'alerts.anySeverity': '' // TODO: translate "Any severity"
    , 'alerts.anyRegion': '' // TODO: translate "Any region"
    , 'alerts.anyTeam': '' // TODO: translate "Any team"
    , 'alerts.copySlack': '' // TODO: translate "Copy Slack"
    , 'alerts.copied': '' // TODO: translate "Copied \u2713"
    , 'alerts.noAlerts': '' // TODO: translate "No alerts"
    , 'map.openInDashboard': '' // TODO: translate "Open in dashboard"
    , 'auth.login': '' // TODO: translate "Login"
    , 'auth.chooseUser': '' // TODO: translate "Choose a demo user"
    , 'auth.enterAs': '' // TODO: translate "Enter as {name}"
    , 'auth.role.owner': '' // TODO: translate "Artist (Owner)"
    , 'auth.role.agencyManager': '' // TODO: translate "Agency Manager"
    , 'auth.role.artistManager': '' // TODO: translate "Artist Team (Manager)"
    , 'auth.scope.finance.ro': '' // TODO: translate "Finance: read-only"
    , 'auth.scope.edit.showsTravel': '' // TODO: translate "Edit shows/travel"
    , 'auth.scope.full': '' // TODO: translate "Full access"
    , 'login.title': '' // TODO: translate "Welcome to On Tour"
    , 'login.subtitle': '' // TODO: translate "Your tour management command center"
    , 'login.enterAs': '' // TODO: translate "Enter as {name}"
    , 'login.quick.agency': '' // TODO: translate "Enter as Shalizi (agency)"
    , 'login.quick.artist': '' // TODO: translate "Enter as Danny (artist)"
    , 'login.remember': '' // TODO: translate "Remember me"
    , 'login.usernameOrEmail': '' // TODO: translate "Username or Email"
    , 'role.agencyManager': '' // TODO: translate "Agency Manager"
    , 'role.artistOwner': '' // TODO: translate "Artist (Owner)"
    , 'role.artistManager': '' // TODO: translate "Artist Team (Manager)"
    , 'scope.shows.write': '' // TODO: translate "shows: write"
    , 'scope.shows.read': '' // TODO: translate "shows: read"
    , 'scope.travel.book': '' // TODO: translate "travel: book"
    , 'scope.travel.read': '' // TODO: translate "travel: read"
    , 'scope.finance.read': '' // TODO: translate "finance: read"
    , 'scope.finance.none': '' // TODO: translate "finance: none"
    , 'hero.enter': '' // TODO: translate "Enter"
    , 'marketing.nav.features': '' // TODO: translate "Features"
    , 'marketing.nav.product': '' // TODO: translate "Product"
    , 'marketing.nav.pricing': '' // TODO: translate "Pricing"
    , 'marketing.nav.testimonials': '' // TODO: translate "Testimonials"
    , 'marketing.nav.cta': '' // TODO: translate "Get started"
    , 'marketing.cta.primary': '' // TODO: translate "Start free"
    , 'marketing.cta.secondary': '' // TODO: translate "Watch demo"
    , 'marketing.cta.login': '' // TODO: translate "Log in"
    , 'hero.demo.artist': '' // TODO: translate "View demo as Danny"
    , 'hero.demo.agency': '' // TODO: translate "View demo as Adam"
    , 'hero.persona.question': '' // TODO: translate "I am a..."
    , 'hero.persona.artist': '' // TODO: translate "Artist / Manager"
    , 'hero.persona.agency': '' // TODO: translate "Agency"
    , 'hero.subtitle.artist': '' // TODO: translate "Take control of your finances and tour logistics. See your career from a single dashboard."
    , 'hero.subtitle.agency': '' // TODO: translate "Manage your entire roster from one place. Give your artists visibility and generate reports in seconds."
    , 'home.action.title': '' // TODO: translate "Stop Surviving. Start Commanding."
    , 'home.action.subtitle': '' // TODO: translate "See how On Tour App can transform your next tour."
    , 'home.action.cta': '' // TODO: translate "Request a Personalized Demo"
    , 'inside.map.desc.artist': '' // TODO: translate "Visualize your tour route and anticipate travel needs"
    , 'inside.finance.desc.artist': '' // TODO: translate "Track your earnings, expenses and profitability in real-time"
    , 'inside.actions.desc.artist': '' // TODO: translate "Stay on top of contracts, payments and upcoming deadlines"
    , 'inside.map.desc.agency': '' // TODO: translate "Monitor all your artists\"
    , 'inside.finance.desc.agency': '' // TODO: translate "Consolidated financial overview across your entire roster"
    , 'inside.actions.desc.agency': '' // TODO: translate "Centralized task management for team coordination and client updates"
    , 'inside.title': '' // TODO: translate "What you"
    , 'shows.summary.avgFee': '' // TODO: translate "Avg Fee"
    , 'shows.summary.avgMargin': '' // TODO: translate "Avg Margin"
    , 'inside.map.title': '' // TODO: translate "Map"
    , 'inside.map.desc': '' // TODO: translate "Live HUD with shows, route and risks"
    , 'inside.finance.title': '' // TODO: translate "Finance"
    , 'inside.finance.desc': '' // TODO: translate "Monthly KPIs, pipeline and forecast"
    , 'inside.actions.title': '' // TODO: translate "Actions"
    , 'inside.actions.desc': '' // TODO: translate "Action Hub with priorities and shortcuts"
    , 'how.title': '' // TODO: translate "How it works"
    , 'how.step.invite': '' // TODO: translate "Invite your team"
    , 'how.step.connect': '' // TODO: translate "Connect with artists or agencies"
    , 'how.step.views': '' // TODO: translate "Work by views: HUD, Finance, Shows"
    , 'how.step.connectData': '' // TODO: translate "Connect your data"
    , 'how.step.connectData.desc': '' // TODO: translate "Import shows, connect calendar, or get invited by your agency"
    , 'how.step.visualize': '' // TODO: translate "Visualize your world"
    , 'how.step.visualize.desc': '' // TODO: translate "Your tour comes alive on the map, finances clarify in the dashboard"
    , 'how.step.act': '' // TODO: translate "Act with intelligence"
    , 'how.step.connectData.artist': '' // TODO: translate "Import your shows, connect your calendar, or get invited by your agency. Your tour data in one place."
    , 'how.step.connectData.agency': '' // TODO: translate "Invite your artists and connect their data. Centralize all tour information across your roster."
    , 'how.step.visualize.artist': '' // TODO: translate "Your tour comes alive on the map, finances clarify in your personal dashboard. See your career at a glance."
    , 'how.step.visualize.agency': '' // TODO: translate "Monitor all artists\"
    , 'how.step.act.artist': '' // TODO: translate "Receive proactive alerts about contracts, payments, and deadlines. Make data-driven decisions with confidence."
    , 'how.step.act.agency': '' // TODO: translate "Prioritize team tasks, generate reports instantly, and keep all stakeholders informed with real-time updates."
    , 'how.multiTenant': '' // TODO: translate "Multi-tenant demo: switch between Agency and Artist contexts"
    , 'trust.privacy': '' // TODO: translate "Privacy: local demo (your browser)"
    , 'trust.accessibility': '' // TODO: translate "Accessibility: shortcuts “?”"
    , 'trust.support': '' // TODO: translate "Support"
    , 'trust.demo': '' // TODO: translate "Local demo — no data uploaded"
    , 'testimonials.title': '' // TODO: translate "Trusted by Industry Leaders"
    , 'testimonials.subtitle': '' // TODO: translate "Real stories from the touring industry"
    , 'testimonials.subtitle.artist': '' // TODO: translate "See how artists are taking control of their careers"
    , 'testimonials.subtitle.agency': '' // TODO: translate "Discover how agencies are transforming their operations"
    , 'common.skipToContent': '' // TODO: translate "Skip to content"
    , 'alerts.slackCopied': '' // TODO: translate "Slack payload copied"
    , 'alerts.copyManual': '' // TODO: translate "Open window to copy manually"
    , 'ah.title': '' // TODO: translate "Action Hub"
    , 'ah.tab.pending': '' // TODO: translate "Pending"
    , 'ah.tab.shows': '' // TODO: translate "This Month"
    , 'ah.tab.travel': '' // TODO: translate "Travel"
    , 'ah.tab.insights': '' // TODO: translate "Insights"
    , 'ah.filter.all': '' // TODO: translate "All"
    , 'ah.filter.risk': '' // TODO: translate "Risk"
    , 'ah.filter.urgency': '' // TODO: translate "Urgency"
    , 'ah.filter.opportunity': '' // TODO: translate "Opportunity"
    , 'ah.filter.offer': '' // TODO: translate "Offer"
    , 'ah.filter.finrisk': '' // TODO: translate "Finrisk"
    , 'ah.cta.addTravel': '' // TODO: translate "Add travel"
    , 'ah.cta.followUp': '' // TODO: translate "Follow up"
    , 'ah.cta.review': '' // TODO: translate "Review"
    , 'ah.cta.open': '' // TODO: translate "Open"
    , 'ah.empty': '' // TODO: translate "All caught up!"
    , 'ah.openTravel': '' // TODO: translate "Open Travel"
    , 'ah.done': '' // TODO: translate "Done"
    , 'ah.typeFilter': '' // TODO: translate "Type filter"
    , 'ah.why': '' // TODO: translate "Why?"
    , 'ah.why.title': '' // TODO: translate "Why this priority?"
    , 'ah.why.score': '' // TODO: translate "Score"
    , 'ah.why.impact': '' // TODO: translate "Impact"
    , 'ah.why.amount': '' // TODO: translate "Amount"
    , 'ah.why.inDays': '' // TODO: translate "In"
    , 'ah.why.overdue': '' // TODO: translate "Overdue"
    , 'ah.why.kind': '' // TODO: translate "Type"
    , 'finance.quicklook': '' // TODO: translate "Finance Quicklook"
    , 'finance.ledger': '' // TODO: translate "Ledger"
    , 'finance.targets': '' // TODO: translate "Targets"
    , 'finance.targets.month': '' // TODO: translate "Monthly targets"
    , 'finance.targets.year': '' // TODO: translate "Yearly targets"
    , 'finance.pipeline': '' // TODO: translate "Pipeline"
    , 'finance.pipeline.subtitle': '' // TODO: translate "Expected value (weighted by stage)"
    , 'finance.openFull': '' // TODO: translate "Open full finance"
    , 'finance.pivot': '' // TODO: translate "Pivot"
    , 'finance.pivot.group': '' // TODO: translate "Group"
    , 'finance.ar.view': '' // TODO: translate "View"
    , 'finance.ar.remind': '' // TODO: translate "Remind"
    , 'finance.ar.reminder.queued': '' // TODO: translate "Reminder queued"
    , 'finance.thisMonth': '' // TODO: translate "This Month"
    , 'finance.income': '' // TODO: translate "Income"
    , 'finance.expenses': '' // TODO: translate "Expenses"
    , 'finance.net': '' // TODO: translate "Net"
    , 'finance.byStatus': '' // TODO: translate "By status"
    , 'finance.byMonth': '' // TODO: translate "by month"
    , 'finance.confirmed': '' // TODO: translate "Confirmed"
    , 'finance.pending': '' // TODO: translate "Pending"
    , 'finance.compare': '' // TODO: translate "Compare prev"
    , 'charts.resetZoom': '' // TODO: translate "Reset zoom"
    , 'common.current': '' // TODO: translate "Current"
    , 'common.compare': '' // TODO: translate "Compare"
    , 'common.reminder': '' // TODO: translate "Reminder"
    , 'finance.ui.view': '' // TODO: translate "View"
    , 'finance.ui.classic': '' // TODO: translate "Classic"
    , 'finance.ui.beta': '' // TODO: translate "New (beta)"
    , 'finance.offer': '' // TODO: translate "Offer"
    , 'finance.shows': '' // TODO: translate "shows"
    , 'finance.noShowsMonth': '' // TODO: translate "No shows this month"
    , 'finance.hideAmounts': '' // TODO: translate "Hide amounts"
    , 'finance.hidden': '' // TODO: translate "Hidden"
    , 'common.open': '' // TODO: translate "Open"
    , 'common.apply': '' // TODO: translate "Apply"
    , 'common.saveView': '' // TODO: translate "Save view"
    , 'common.import': '' // TODO: translate "Import"
    , 'common.export': '' // TODO: translate "Export"
    , 'common.copied': '' // TODO: translate "Copied ✓"
    , 'common.markDone': '' // TODO: translate "Mark done"
    , 'common.hideItem': '' // TODO: translate "Hide"
    , 'views.import.invalidShape': '' // TODO: translate "Invalid views JSON shape"
    , 'views.import.invalidJson': '' // TODO: translate "Invalid JSON"
    , 'common.tomorrow': '' // TODO: translate "Tomorrow"
    , 'common.go': '' // TODO: translate "Go"
    , 'common.show': '' // TODO: translate "Show"
    , 'common.search': '' // TODO: translate "Search"
    , 'hud.next3weeks': '' // TODO: translate "Next 3 weeks"
    , 'hud.noTrips3weeks': '' // TODO: translate "No upcoming trips in 3 weeks"
    , 'hud.openShow': '' // TODO: translate "open show"
    , 'hud.openTrip': '' // TODO: translate "open travel"
    , 'hud.view.whatsnext': '' // TODO: translate "What"
    , 'hud.view.month': '' // TODO: translate "This Month"
    , 'hud.view.financials': '' // TODO: translate "Financials"
    , 'hud.view.whatsnext.desc': '' // TODO: translate "Upcoming 14 day summary"
    , 'hud.view.month.desc': '' // TODO: translate "Monthly financial & show snapshot"
    , 'hud.view.financials.desc': '' // TODO: translate "Financial intelligence breakdown"
    , 'hud.layer.heat': '' // TODO: translate "Heat"
    , 'hud.layer.status': '' // TODO: translate "Status"
    , 'hud.layer.route': '' // TODO: translate "Route"
    , 'hud.views': '' // TODO: translate "HUD views"
    , 'hud.layers': '' // TODO: translate "Map layers"
    , 'hud.missionControl': '' // TODO: translate "Mission Control"
    , 'hud.subtitle': '' // TODO: translate "Realtime map and upcoming shows"
    , 'hud.risks': '' // TODO: translate "Risks"
    , 'hud.assignProducer': '' // TODO: translate "Assign producer"
    , 'hud.mapLoadError': '' // TODO: translate "Map failed to load. Please retry."
    , 'common.retry': '' // TODO: translate "Retry"
    , 'hud.viewChanged': '' // TODO: translate "View changed to"
    , 'hud.openEvent': '' // TODO: translate "open event"
    , 'hud.type.flight': '' // TODO: translate "Flight"
    , 'hud.type.ground': '' // TODO: translate "Ground"
    , 'hud.type.event': '' // TODO: translate "Event"
    , 'hud.fin.avgNetMonth': '' // TODO: translate "Avg Net (Month)"
    , 'hud.fin.runRateYear': '' // TODO: translate "Run Rate (Year)"
    , 'finance.forecast': '' // TODO: translate "Forecast vs Actual"
    , 'finance.forecast.legend.actual': '' // TODO: translate "Actual net"
    , 'finance.forecast.legend.p50': '' // TODO: translate "Forecast p50"
    , 'finance.forecast.legend.band': '' // TODO: translate "Confidence band"
    , 'finance.forecast.alert.under': '' // TODO: translate "Under forecast by"
    , 'finance.forecast.alert.above': '' // TODO: translate "Above optimistic by"
    , 'map.toggle.status': '' // TODO: translate "Toggle status markers"
    , 'map.toggle.route': '' // TODO: translate "Toggle route line"
    , 'map.toggle.heat': '' // TODO: translate "Toggle heat circles"
    , 'shows.exportCsv': '' // TODO: translate "Export CSV"
    , 'shows.filters.from': '' // TODO: translate "From"
    , 'shows.filters.to': '' // TODO: translate "To"
    , 'shows.items': '' // TODO: translate "items"
    , 'shows.date.presets': '' // TODO: translate "Presets"
    , 'shows.date.thisMonth': '' // TODO: translate "This Month"
    , 'shows.date.nextMonth': '' // TODO: translate "Next Month"
    , 'shows.tooltip.net': '' // TODO: translate "Fee minus WHT, commissions, and costs"
    , 'shows.tooltip.margin': '' // TODO: translate "Net divided by Fee (%)"
    , 'shows.table.margin': '' // TODO: translate "Margin %"
    , 'shows.editor.margin.formula': '' // TODO: translate "Margin % = Net/Fee"
    , 'shows.tooltip.wht': '' // TODO: translate "Withholding tax percentage applied to the fee"
    , 'shows.editor.label.name': '' // TODO: translate "Show name"
    , 'shows.editor.placeholder.name': '' // TODO: translate "Festival or show name"
    , 'shows.editor.placeholder.venue': '' // TODO: translate "Venue name"
    , 'shows.editor.help.venue': '' // TODO: translate "Optional venue / room name"
    , 'shows.editor.help.fee': '' // TODO: translate "Gross fee agreed (before taxes, commissions, costs)"
    , 'shows.editor.help.wht': '' // TODO: translate "Local withholding tax percentage (auto-suggested by country)"
    , 'shows.editor.saving': '' // TODO: translate "Saving…"
    , 'shows.editor.saved': '' // TODO: translate "Saved ✓"
    , 'shows.editor.save.error': '' // TODO: translate "Save failed"
    , 'shows.editor.cost.templates': '' // TODO: translate "Templates"
    , 'shows.editor.cost.addTemplate': '' // TODO: translate "Add template"
    , 'shows.editor.cost.subtotals': '' // TODO: translate "Subtotals"
    , 'shows.editor.cost.type': '' // TODO: translate "Type"
    , 'shows.editor.cost.amount': '' // TODO: translate "Amount"
    , 'shows.editor.cost.desc': '' // TODO: translate "Description"
    , 'shows.editor.status.help': '' // TODO: translate "Current lifecycle state of the show"
    , 'shows.editor.cost.template.travel': '' // TODO: translate "Travel basics"
    , 'shows.editor.cost.template.production': '' // TODO: translate "Production basics"
    , 'shows.editor.cost.template.marketing': '' // TODO: translate "Marketing basics"
    , 'shows.editor.quick.label': '' // TODO: translate "Quick add costs"
    , 'shows.editor.quick.hint': '' // TODO: translate "e.g., Hotel 1200"
    , 'shows.editor.quick.placeholder': '' // TODO: translate "20/04/2025 "
    , 'shows.editor.quick.preview.summary': '' // TODO: translate "Will set: {fields}"
    , 'shows.editor.quick.apply': '' // TODO: translate "Apply"
    , 'shows.editor.quick.parseError': '' // TODO: translate "Cannot interpret"
    , 'shows.editor.quick.applied': '' // TODO: translate "Quick entry applied"
    , 'shows.editor.bulk.title': '' // TODO: translate "Bulk add costs"
    , 'shows.editor.bulk.open': '' // TODO: translate "Bulk add"
    , 'shows.editor.bulk.placeholder': '' // TODO: translate "Type, Amount, Description\nTravel, 1200, Flights BCN-MAD\nProduction\t500\tBackline"
    , 'shows.editor.bulk.preview': '' // TODO: translate "Preview"
    , 'shows.editor.bulk.parsed': '' // TODO: translate "Parsed {count} lines"
    , 'shows.editor.bulk.add': '' // TODO: translate "Add costs"
    , 'shows.editor.bulk.cancel': '' // TODO: translate "Cancel"
    , 'shows.editor.bulk.invalidLine': '' // TODO: translate "Invalid line {n}"
    , 'shows.editor.bulk.empty': '' // TODO: translate "No valid lines"
    , 'shows.editor.bulk.help': '' // TODO: translate "Paste CSV or tab-separated lines: Type, Amount, Description (amount optional)"
    , 'shows.editor.restored': '' // TODO: translate "Restored draft"
    , 'shows.editor.quick.icon.date': '' // TODO: translate "Date"
    , 'shows.editor.quick.icon.city': '' // TODO: translate "City"
    , 'shows.editor.quick.icon.country': '' // TODO: translate "Country"
    , 'shows.editor.quick.icon.fee': '' // TODO: translate "Fee"
    , 'shows.editor.quick.icon.whtPct': '' // TODO: translate "WHT %"
    , 'shows.editor.quick.icon.name': '' // TODO: translate "Name"
    , 'shows.editor.cost.templateMenu': '' // TODO: translate "Cost templates"
    , 'shows.editor.cost.template.applied': '' // TODO: translate "Template applied"
    , 'shows.editor.cost.duplicate': '' // TODO: translate "Duplicate"
    , 'shows.editor.cost.moveUp': '' // TODO: translate "Move up"
    , 'shows.editor.cost.moveDown': '' // TODO: translate "Move down"
    , 'shows.editor.costs.title': '' // TODO: translate "Costs"
    , 'shows.editor.costs.empty': '' // TODO: translate "No costs yet — add one"
    , 'shows.editor.costs.recent': '' // TODO: translate "Recent"
    , 'shows.editor.costs.templates': '' // TODO: translate "Templates"
    , 'shows.editor.costs.subtotal': '' // TODO: translate "Subtotal {category}"
    , 'shows.editor.wht.suggest': '' // TODO: translate "Suggest {pct}%"
    , 'shows.editor.wht.apply': '' // TODO: translate "Apply {pct}%"
    , 'shows.editor.wht.suggest.applied': '' // TODO: translate "Suggestion applied"
    , 'shows.editor.wht.tooltip.es': '' // TODO: translate "Typical IRPF in ES: 15% (editable)"
    , 'shows.editor.wht.tooltip.generic': '' // TODO: translate "Typical withholding suggestion"
    , 'shows.editor.status.hint': '' // TODO: translate "Change here or via badge"
    , 'shows.editor.wht.hint.es': '' // TODO: translate "Typical ES withholding: 15% (editable)"
    , 'shows.editor.wht.hint.generic': '' // TODO: translate "Withholding percentage (editable)"
    , 'shows.editor.commission.default': '' // TODO: translate "Default {pct}%"
    , 'shows.editor.commission.overridden': '' // TODO: translate "Override"
    , 'shows.editor.commission.overriddenIndicator': '' // TODO: translate "Commission overridden"
    , 'shows.editor.commission.reset': '' // TODO: translate "Reset to default"
    , 'shows.editor.label.currency': '' // TODO: translate "Currency"
    , 'shows.editor.help.currency': '' // TODO: translate "Contract currency"
    , 'shows.editor.fx.rateOn': '' // TODO: translate "Rate"
    , 'shows.editor.fx.convertedFee': '' // TODO: translate "≈ {amount} {base}"
    , 'shows.editor.fx.unavailable': '' // TODO: translate "Rate unavailable"
    , 'shows.editor.actions.promote': '' // TODO: translate "Promote"
    , 'shows.editor.actions.planTravel': '' // TODO: translate "Plan travel"
    , 'shows.editor.state.hint': '' // TODO: translate "Use the badge or this selector"
    , 'shows.editor.save.create': '' // TODO: translate "Save"
    , 'shows.editor.save.edit': '' // TODO: translate "Save changes"
    , 'shows.editor.save.retry': '' // TODO: translate "Retry"
    , 'shows.editor.tab.active': '' // TODO: translate "Tab {label} active"
    , 'shows.editor.tab.restored': '' // TODO: translate "Restored last tab: {label}"
    , 'shows.editor.errors.count': '' // TODO: translate "There are {n} errors"
    , 'shows.totals.fees': '' // TODO: translate "Fees"
    , 'shows.totals.net': '' // TODO: translate "Net"
    , 'shows.totals.hide': '' // TODO: translate "Hide"
    , 'shows.totals.show': '' // TODO: translate "Show totals"
    , 'shows.view.list': '' // TODO: translate "List"
    , 'shows.view.board': '' // TODO: translate "Board"
    , 'shows.views.none': '' // TODO: translate "Views"
    , 'views.manage': '' // TODO: translate "Manage views"
    , 'views.saved': '' // TODO: translate "Saved"
    , 'views.apply': '' // TODO: translate "Apply"
    , 'views.none': '' // TODO: translate "No saved views"
    , 'views.deleted': '' // TODO: translate "Deleted"
    , 'views.export': '' // TODO: translate "Export"
    , 'views.import': '' // TODO: translate "Import"
    , 'views.import.hint': '' // TODO: translate "Paste JSON of views to import"
    , 'views.openLab': '' // TODO: translate "Open Layout Lab"
    , 'views.share': '' // TODO: translate "Copy share link"
    , 'views.export.copied': '' // TODO: translate "Export copied"
    , 'views.imported': '' // TODO: translate "Views imported"
    , 'views.import.invalid': '' // TODO: translate "Invalid JSON"
    , 'views.label': '' // TODO: translate "View"
    , 'views.names.default': '' // TODO: translate "Default"
    , 'views.names.finance': '' // TODO: translate "Finance"
    , 'views.names.operations': '' // TODO: translate "Operations"
    , 'views.names.promo': '' // TODO: translate "Promotion"
    , 'demo.banner': '' // TODO: translate "Demo data • No live sync"
    , 'demo.load': '' // TODO: translate "Load demo data"
    , 'demo.loaded': '' // TODO: translate "Demo data loaded"
    , 'demo.clear': '' // TODO: translate "Clear data"
    , 'demo.cleared': '' // TODO: translate "All data cleared"
    , 'demo.password.prompt': '' // TODO: translate "Enter demo password"
    , 'demo.password.invalid': '' // TODO: translate "Incorrect password"
    , 'shows.views.delete': '' // TODO: translate "Delete"
    , 'shows.views.namePlaceholder': '' // TODO: translate "View name"
    , 'shows.views.save': '' // TODO: translate "Save"
    , 'shows.status.canceled': '' // TODO: translate "Canceled"
    , 'shows.status.archived': '' // TODO: translate "Archived"
    , 'shows.status.offer': '' // TODO: translate "Offer"
    , 'shows.status.pending': '' // TODO: translate "Pending"
    , 'shows.status.confirmed': '' // TODO: translate "Confirmed"
    , 'shows.status.postponed': '' // TODO: translate "Postponed"
    , 'shows.bulk.selected': '' // TODO: translate "selected"
    , 'shows.bulk.confirm': '' // TODO: translate "Confirm"
    , 'shows.bulk.promote': '' // TODO: translate "Promote"
    , 'shows.bulk.export': '' // TODO: translate "Export"
    , 'shows.notes': '' // TODO: translate "Notes"
    , 'shows.virtualized.hint': '' // TODO: translate "Virtualized list active"
    , 'story.title': '' // TODO: translate "Story mode"
    , 'story.timeline': '' // TODO: translate "Timeline"
    , 'story.play': '' // TODO: translate "Play"
    , 'story.pause': '' // TODO: translate "Pause"
    , 'story.cta': '' // TODO: translate "Story mode"
    , 'story.scrub': '' // TODO: translate "Scrub timeline"
    , 'finance.overview': '' // TODO: translate "Finance overview"
    , 'shows.title': '' // TODO: translate "Shows"
    , 'shows.notFound': '' // TODO: translate "Show not found"
    , 'shows.search.placeholder': '' // TODO: translate "Search city/country"
    , 'shows.add': '' // TODO: translate "Add show"
    , 'shows.edit': '' // TODO: translate "Edit"
    , 'shows.summary.upcoming': '' // TODO: translate "Upcoming"
    , 'shows.summary.totalFees': '' // TODO: translate "Total Fees"
    , 'shows.summary.estNet': '' // TODO: translate "Est. Net"
    , 'shows.summary.avgWht': '' // TODO: translate "Avg WHT"
    , 'shows.table.date': '' // TODO: translate "Date"
    , 'shows.table.name': '' // TODO: translate "Show"
    , 'shows.table.city': '' // TODO: translate "City"
    , 'shows.table.country': '' // TODO: translate "Country"
    , 'shows.table.venue': '' // TODO: translate "Venue"
    , 'shows.table.promoter': '' // TODO: translate "Promoter"
    , 'shows.table.wht': '' // TODO: translate "WHT %"
    , 'shows.table.type': '' // TODO: translate "Type"
    , 'shows.table.description': '' // TODO: translate "Description"
    , 'shows.table.amount': '' // TODO: translate "Amount"
    , 'shows.table.remove': '' // TODO: translate "Remove"
    , 'shows.table.agency.mgmt': '' // TODO: translate "Mgmt"
    , 'shows.table.agency.booking': '' // TODO: translate "Booking"
    , 'shows.table.agencies': '' // TODO: translate "Agencies"
    , 'shows.table.notes': '' // TODO: translate "Notes"
    , 'shows.table.fee': '' // TODO: translate "Fee"
    , 'shows.selected': '' // TODO: translate "selected"
    , 'shows.count.singular': '' // TODO: translate "show"
    , 'shows.count.plural': '' // TODO: translate "shows"
    , 'settings.title': '' // TODO: translate "Settings"
    , 'settings.personal': '' // TODO: translate "Personal"
    , 'settings.preferences': '' // TODO: translate "Preferences"
    , 'settings.organization': '' // TODO: translate "Organization"
    , 'settings.billing': '' // TODO: translate "Billing"
    , 'settings.currency': '' // TODO: translate "Currency"
    , 'settings.units': '' // TODO: translate "Distance units"
    , 'settings.agencies': '' // TODO: translate "Agencies"
    , 'settings.localNote': '' // TODO: translate "Preferences are saved locally on this device."
    , 'settings.language': '' // TODO: translate "Language"
    , 'settings.language.en': '' // TODO: translate "English"
    , 'settings.language.es': '' // TODO: translate "Spanish"
    , 'settings.dashboardView': '' // TODO: translate "Default Dashboard View"
    , 'settings.presentation': '' // TODO: translate "Presentation mode"
    , 'settings.comparePrev': '' // TODO: translate "Compare vs previous period"
    , 'settings.defaultStatuses': '' // TODO: translate "Default status filters"
    , 'settings.defaultRegion': '' // TODO: translate "Default region"
    , 'settings.region.all': '' // TODO: translate "All"
    , 'settings.region.AMER': '' // TODO: translate "Americas"
    , 'settings.region.EMEA': '' // TODO: translate "EMEA"
    , 'settings.region.APAC': '' // TODO: translate "APAC"
    , 'settings.agencies.booking': '' // TODO: translate "Booking Agencies"
    , 'settings.agencies.management': '' // TODO: translate "Management Agencies"
    , 'settings.agencies.add': '' // TODO: translate "Add"
    , 'settings.agencies.hideForm': '' // TODO: translate "Hide form"
    , 'settings.agencies.none': '' // TODO: translate "No agencies"
    , 'settings.agencies.name': '' // TODO: translate "Name"
    , 'settings.agencies.commission': '' // TODO: translate "Commission %"
    , 'settings.agencies.territoryMode': '' // TODO: translate "Territory Mode"
    , 'settings.agencies.continents': '' // TODO: translate "Continents"
    , 'settings.agencies.countries': '' // TODO: translate "Countries (comma or space separated ISO2)"
    , 'settings.agencies.addBooking': '' // TODO: translate "Add booking"
    , 'settings.agencies.addManagement': '' // TODO: translate "Add management"
    , 'settings.agencies.reset': '' // TODO: translate "Reset"
    , 'settings.agencies.remove': '' // TODO: translate "Remove agency"
    , 'settings.agencies.limitReached': '' // TODO: translate "Limit reached (max 3)"
    , 'settings.agencies.countries.invalid': '' // TODO: translate "Countries must be 2-letter ISO codes (e.g., US ES DE), separated by commas or spaces."
    , 'settings.continent.NA': '' // TODO: translate "North America"
    , 'settings.continent.SA': '' // TODO: translate "South America"
    , 'settings.continent.EU': '' // TODO: translate "Europe"
    , 'settings.continent.AF': '' // TODO: translate "Africa"
    , 'settings.continent.AS': '' // TODO: translate "Asia"
    , 'settings.continent.OC': '' // TODO: translate "Oceania"
    , 'settings.territory.worldwide': '' // TODO: translate "Worldwide"
    , 'settings.territory.continents': '' // TODO: translate "Continents"
    , 'settings.territory.countries': '' // TODO: translate "Countries"
    , 'settings.export': '' // TODO: translate "Export settings"
    , 'settings.import': '' // TODO: translate "Import settings"
    , 'settings.reset': '' // TODO: translate "Reset to defaults"
    , 'settings.preview': '' // TODO: translate "Preview"
    , 'shows.table.net': '' // TODO: translate "Net"
    , 'shows.table.status': '' // TODO: translate "Status"
    , 'shows.selectAll': '' // TODO: translate "Select all"
    , 'shows.selectRow': '' // TODO: translate "Select row"
    , 'shows.editor.tabs': '' // TODO: translate "Editor tabs"
    , 'shows.editor.tab.details': '' // TODO: translate "Details"
    , 'shows.editor.tab.finance': '' // TODO: translate "Finance"
    , 'shows.editor.tab.costs': '' // TODO: translate "Costs"
    , 'shows.editor.finance.commissions': '' // TODO: translate "Commissions"
    , 'shows.editor.add': '' // TODO: translate "Add show"
    , 'shows.editor.edit': '' // TODO: translate "Edit show"
    , 'shows.editor.subtitleAdd': '' // TODO: translate "Create a new event"
    , 'shows.editor.label.status': '' // TODO: translate "Status"
    , 'shows.editor.label.date': '' // TODO: translate "Date"
    , 'shows.editor.label.city': '' // TODO: translate "City"
    , 'shows.editor.label.country': '' // TODO: translate "Country"
    , 'shows.editor.label.venue': '' // TODO: translate "Venue"
    , 'shows.editor.label.promoter': '' // TODO: translate "Promoter"
    , 'shows.editor.label.fee': '' // TODO: translate "Fee"
    , 'shows.editor.label.wht': '' // TODO: translate "WHT %"
    , 'shows.editor.label.mgmt': '' // TODO: translate "Mgmt Agency"
    , 'shows.editor.label.booking': '' // TODO: translate "Booking Agency"
    , 'shows.editor.label.notes': '' // TODO: translate "Notes"
    , 'shows.editor.validation.cityRequired': '' // TODO: translate "City is required"
    , 'shows.editor.validation.countryRequired': '' // TODO: translate "Country is required"
    , 'shows.editor.validation.dateRequired': '' // TODO: translate "Date is required"
    , 'shows.editor.validation.feeGtZero': '' // TODO: translate "Fee must be greater than 0"
    , 'shows.editor.validation.whtRange': '' // TODO: translate "WHT must be between 0% and 50%"
    , 'shows.dialog.close': '' // TODO: translate "Close"
    , 'shows.dialog.cancel': '' // TODO: translate "Cancel"
    , 'shows.dialog.save': '' // TODO: translate "Save"
    , 'shows.dialog.saveChanges': '' // TODO: translate "Save changes"
    , 'shows.dialog.delete': '' // TODO: translate "Delete"
    , 'shows.editor.validation.fail': '' // TODO: translate "Fix errors to continue"
    , 'shows.editor.toast.saved': '' // TODO: translate "Saved"
    , 'shows.editor.toast.deleted': '' // TODO: translate "Deleted"
    , 'shows.editor.toast.undo': '' // TODO: translate "Undo"
    , 'shows.editor.toast.restored': '' // TODO: translate "Restored"
    , 'shows.editor.toast.deleting': '' // TODO: translate "Deleting…"
    , 'shows.editor.toast.discarded': '' // TODO: translate "Changes discarded"
    , 'shows.editor.toast.validation': '' // TODO: translate "Please correct the highlighted errors"
    , 'shows.editor.summary.fee': '' // TODO: translate "Fee"
    , 'shows.editor.summary.wht': '' // TODO: translate "WHT"
    , 'shows.editor.summary.costs': '' // TODO: translate "Costs"
    , 'shows.editor.summary.net': '' // TODO: translate "Est. Net"
    , 'shows.editor.discard.title': '' // TODO: translate "Discard changes?"
    , 'shows.editor.discard.body': '' // TODO: translate "You have unsaved changes. They will be lost."
    , 'shows.editor.discard.cancel': '' // TODO: translate "Keep editing"
    , 'shows.editor.discard.confirm': '' // TODO: translate "Discard"
    , 'shows.editor.delete.confirmTitle': '' // TODO: translate "Delete show?"
    , 'shows.editor.delete.confirmBody': '' // TODO: translate "This action cannot be undone."
    , 'shows.editor.delete.confirm': '' // TODO: translate "Delete"
    , 'shows.editor.delete.cancel': '' // TODO: translate "Cancel"
    , 'shows.noCosts': '' // TODO: translate "No costs yet"
    , 'shows.filters.region': '' // TODO: translate "Region"
    , 'shows.filters.region.all': '' // TODO: translate "All"
    , 'shows.filters.region.AMER': '' // TODO: translate "AMER"
    , 'shows.filters.region.EMEA': '' // TODO: translate "EMEA"
    , 'shows.filters.region.APAC': '' // TODO: translate "APAC"
    , 'shows.filters.feeMin': '' // TODO: translate "Min fee"
    , 'shows.filters.feeMax': '' // TODO: translate "Max fee"
    , 'shows.views.export': '' // TODO: translate "Export views"
    , 'shows.views.import': '' // TODO: translate "Import views"
    , 'shows.views.applied': '' // TODO: translate "View applied"
    , 'shows.bulk.delete': '' // TODO: translate "Delete selected"
    , 'shows.bulk.setWht': '' // TODO: translate "Set WHT %"
    , 'shows.bulk.applyWht': '' // TODO: translate "Apply WHT"
    , 'shows.bulk.setStatus': '' // TODO: translate "Set status"
    , 'shows.bulk.apply': '' // TODO: translate "Apply"
    , 'shows.travel.title': '' // TODO: translate "Location"
    , 'shows.travel.quick': '' // TODO: translate "Travel"
    , 'shows.travel.soon': '' // TODO: translate "Upcoming confirmed show — consider adding travel."
    , 'shows.travel.soonConfirmed': '' // TODO: translate "Upcoming confirmed show — consider adding travel."
    , 'shows.travel.soonGeneric': '' // TODO: translate "Upcoming show — consider planning travel."
    , 'shows.travel.tripExists': '' // TODO: translate "Trip already scheduled around this date"
    , 'shows.travel.noCta': '' // TODO: translate "No travel action needed"
    , 'shows.travel.plan': '' // TODO: translate "Plan travel"
    , 'cmd.dialog': '' // TODO: translate "Command palette"
    , 'cmd.placeholder': '' // TODO: translate "Search shows or actions…"
    , 'cmd.type.show': '' // TODO: translate "Show"
    , 'cmd.type.action': '' // TODO: translate "Action"
    , 'cmd.noResults': '' // TODO: translate "No results"
    , 'cmd.footer.hint': '' // TODO: translate "Enter to run • Esc to close"
    , 'cmd.footer.tip': '' // TODO: translate "Tip: press ? for shortcuts"
    , 'cmd.openFilters': '' // TODO: translate "Open Filters"
    , 'cmd.mask.enable': '' // TODO: translate "Enable Mask"
    , 'cmd.mask.disable': '' // TODO: translate "Disable Mask"
    , 'cmd.presentation.enable': '' // TODO: translate "Enable Presentation Mode"
    , 'cmd.presentation.disable': '' // TODO: translate "Disable Presentation Mode"
    , 'cmd.shortcuts': '' // TODO: translate "Show Shortcuts Overlay"
    , 'cmd.switch.default': '' // TODO: translate "Switch View: Default"
    , 'cmd.switch.finance': '' // TODO: translate "Switch View: Finance"
    , 'cmd.switch.operations': '' // TODO: translate "Switch View: Operations"
    , 'cmd.switch.promo': '' // TODO: translate "Switch View: Promotion"
    , 'cmd.openAlerts': '' // TODO: translate "Open Alert Center"
    , 'cmd.go.shows': '' // TODO: translate "Go to Shows"
    , 'cmd.go.travel': '' // TODO: translate "Go to Travel"
    , 'cmd.go.finance': '' // TODO: translate "Go to Finance"
    , 'cmd.go.org': '' // TODO: translate "Go to Org Overview"
    , 'cmd.go.members': '' // TODO: translate "Go to Org Members"
    , 'cmd.go.clients': '' // TODO: translate "Go to Org Clients"
    , 'cmd.go.teams': '' // TODO: translate "Go to Org Teams"
    , 'cmd.go.links': '' // TODO: translate "Go to Org Links"
    , 'cmd.go.reports': '' // TODO: translate "Go to Org Reports"
    , 'cmd.go.documents': '' // TODO: translate "Go to Org Documents"
    , 'cmd.go.integrations': '' // TODO: translate "Go to Org Integrations"
    , 'cmd.go.billing': '' // TODO: translate "Go to Org Billing"
    , 'cmd.go.branding': '' // TODO: translate "Go to Org Branding"
    , 'shortcuts.dialog': '' // TODO: translate "Keyboard shortcuts"
    , 'shortcuts.title': '' // TODO: translate "Shortcuts"
    , 'shortcuts.desc': '' // TODO: translate "Use these to move faster. Press Esc to close."
    , 'shortcuts.openPalette': '' // TODO: translate "Open Command Palette"
    , 'shortcuts.showOverlay': '' // TODO: translate "Show this overlay"
    , 'shortcuts.closeDialogs': '' // TODO: translate "Close dialogs/popups"
    , 'shortcuts.goTo': '' // TODO: translate "Quick nav: g then key"
    , 'alerts.open': '' // TODO: translate "Open Alerts"
    , 'alerts.loading': '' // TODO: translate "Loading alerts…"
    , 'actions.exportCsv': '' // TODO: translate "Export CSV"
    , 'actions.copyDigest': '' // TODO: translate "Copy Digest"
    , 'actions.digest.title': '' // TODO: translate "Weekly Alerts Digest"
    , 'actions.toast.csv': '' // TODO: translate "CSV copied"
    , 'actions.toast.digest': '' // TODO: translate "Digest copied"
    , 'actions.toast.share': '' // TODO: translate "Link copied"
    , 'welcome.title': '' // TODO: translate "Welcome, {name}"
    , 'welcome.subtitle.agency': '' // TODO: translate "Manage your managers and artists"
    , 'welcome.subtitle.artist': '' // TODO: translate "All set for your upcoming shows"
    , 'welcome.cta.dashboard': '' // TODO: translate "Go to dashboard"
    , 'welcome.section.team': '' // TODO: translate "Your team"
    , 'welcome.section.clients': '' // TODO: translate "Your artists"
    , 'welcome.section.assignments': '' // TODO: translate "Managers per artist"
    , 'welcome.section.links': '' // TODO: translate "Connections & scopes"
    , 'welcome.section.kpis': '' // TODO: translate "This month"
    , 'welcome.seats.usage': '' // TODO: translate "Seats used"
    , 'welcome.gettingStarted': '' // TODO: translate "Getting started"
    , 'welcome.recentlyViewed': '' // TODO: translate "Recently viewed"
    , 'welcome.changesSince': '' // TODO: translate "Changes since your last visit"
    , 'welcome.noChanges': '' // TODO: translate "No changes"
    , 'welcome.change.linkEdited': '' // TODO: translate "Link scopes edited for Danny"
    , 'welcome.change.memberInvited': '' // TODO: translate "New manager invited"
    , 'welcome.change.docUploaded': '' // TODO: translate "New document uploaded"
    , 'empty.noRecent': '' // TODO: translate "No recent items"
    , 'welcome.cta.inviteManager': '' // TODO: translate "Invite manager"
    , 'welcome.cta.connectArtist': '' // TODO: translate "Connect artist"
    , 'welcome.cta.createTeam': '' // TODO: translate "Create team"
    , 'welcome.cta.completeBranding': '' // TODO: translate "Complete branding"
    , 'welcome.cta.reviewShows': '' // TODO: translate "Review shows"
    , 'welcome.cta.connectCalendar': '' // TODO: translate "Connect calendar"
    , 'welcome.cta.switchOrg': '' // TODO: translate "Change organization"
    , 'welcome.cta.completeSetup': '' // TODO: translate "Complete setup"
    , 'welcome.progress.complete': '' // TODO: translate "Setup complete"
    , 'welcome.progress.incomplete': '' // TODO: translate "{completed}/{total} steps completed"
    , 'welcome.tooltip.inviteManager': '' // TODO: translate "Invite team members to collaborate on shows and finances"
    , 'welcome.tooltip.connectArtist': '' // TODO: translate "Link with artists to manage their tours"
    , 'welcome.tooltip.completeBranding': '' // TODO: translate "Set up your organization\"
    , 'welcome.tooltip.connectCalendar': '' // TODO: translate "Sync your calendar for automatic show scheduling"
    , 'welcome.tooltip.switchOrg': '' // TODO: translate "Switch between different organizations you manage"
    , 'welcome.gettingStarted.invite': '' // TODO: translate "Invite a manager"
    , 'welcome.gettingStarted.connect': '' // TODO: translate "Connect an artist"
    , 'welcome.gettingStarted.review': '' // TODO: translate "Review teams & links"
    , 'welcome.gettingStarted.branding': '' // TODO: translate "Complete branding"
    , 'welcome.gettingStarted.shows': '' // TODO: translate "Review shows"
    , 'welcome.gettingStarted.calendar': '' // TODO: translate "Connect calendar"
    , 'welcome.dontShowAgain': '' // TODO: translate "Don"
    , 'welcome.openArtistDashboard': '' // TODO: translate "Open {artist} dashboard"
    , 'welcome.assign': '' // TODO: translate "Assign"
    , 'shows.toast.bulk.status': '' // TODO: translate "Status: {status} ({n})"
    , 'shows.toast.bulk.confirm': '' // TODO: translate "Confirmed"
    , 'shows.toast.bulk.setStatus': '' // TODO: translate "Status applied"
    , 'shows.toast.bulk.setWht': '' // TODO: translate "WHT applied"
    , 'shows.toast.bulk.export': '' // TODO: translate "Export started"
    , 'shows.toast.bulk.delete': '' // TODO: translate "Deleted"
    , 'shows.toast.bulk.confirmed': '' // TODO: translate "Confirmed ({n})"
    , 'shows.toast.bulk.wht': '' // TODO: translate "WHT {pct}% ({n})"
    , 'filters.clear': '' // TODO: translate "Clear"
    , 'filters.more': '' // TODO: translate "More filters"
    , 'filters.cleared': '' // TODO: translate "Filters cleared"
    , 'filters.presets': '' // TODO: translate "Presets"
    , 'filters.presets.last7': '' // TODO: translate "Last 7 days"
    , 'filters.presets.last30': '' // TODO: translate "Last 30 days"
    , 'filters.presets.last90': '' // TODO: translate "Last 90 days"
    , 'filters.presets.mtd': '' // TODO: translate "Month to date"
    , 'filters.presets.ytd': '' // TODO: translate "Year to date"
    , 'filters.presets.qtd': '' // TODO: translate "Quarter to date"
    , 'filters.applied': '' // TODO: translate "Filters applied"
    , 'common.team': '' // TODO: translate "Team"
    , 'common.region': '' // TODO: translate "Region"
    , 'ah.planTravel': '' // TODO: translate "Plan travel"
    , 'map.cssWarning': '' // TODO: translate "Map styles failed to load. Using basic fallback."
    , 'travel.offline': '' // TODO: translate "Offline mode: showing cached itineraries."
    , 'travel.refresh.error': '' // TODO: translate "Couldn"
    , 'travel.search.title': '' // TODO: translate "Search"
    , 'travel.search.open_in_google': '' // TODO: translate "Open in Google Flights"
    , 'travel.search.mode.form': '' // TODO: translate "Form"
    , 'travel.search.mode.text': '' // TODO: translate "Text"
    , 'travel.search.show_text': '' // TODO: translate "Write query"
    , 'travel.search.hide_text': '' // TODO: translate "Hide text input"
    , 'travel.search.text.placeholder': '' // TODO: translate "e.g., From MAD to CDG 2025-10-12 2 adults business"
    , 'travel.nlp': '' // TODO: translate "NLP"
    , 'travel.search.origin': '' // TODO: translate "Origin"
    , 'travel.search.destination': '' // TODO: translate "Destination"
    , 'travel.search.departure_date': '' // TODO: translate "Departure date"
    , 'travel.search.searching': '' // TODO: translate "Searching flights…"
    , 'travel.search.searchMyFlight': '' // TODO: translate "Search My Flight"
    , 'travel.search.searchAgain': '' // TODO: translate "Search Again"
    , 'travel.search.error': '' // TODO: translate "Error searching flights"
    , 'travel.addPurchasedFlight': '' // TODO: translate "Add Purchased Flight"
    , 'travel.addFlightDescription': '' // TODO: translate "Enter your booking reference or flight number to add it to your schedule"
    , 'travel.emptyStateDescription': '' // TODO: translate "Add your booked flights or search for new ones to start managing your trips."
    , 'features.settlement.benefit': '' // TODO: translate "8h/week saved on financial reports"
    , 'features.offline.description': '' // TODO: translate "IndexedDB + robust sync. Manage your tour on the plane, backstage, or anywhere. When internet returns, everything syncs automatically."
    , 'features.offline.benefit': '' // TODO: translate "24/7 access, no connection dependency"
    , 'features.ai.description': '' // TODO: translate "NLP Quick Entry, intelligent ActionHub, predictive Health Score. Warns you of problems before they happen. Your tour copilot."
    , 'features.ai.benefit': '' // TODO: translate "Anticipates problems 72h in advance"
    , 'features.esign.description': '' // TODO: translate "Integrated e-sign, templates by country (US/UK/EU/ES), full-text search with OCR. Close deals faster, no paper printing."
    , 'features.esign.benefit': '' // TODO: translate "Close contracts 3x faster"
    , 'features.inbox.description': '' // TODO: translate "Emails organized by show, smart threading, rich text reply. All your context in one place, no Gmail searching."
    , 'features.inbox.benefit': '' // TODO: translate "Zero inbox with full context"
    , 'features.travel.description': '' // TODO: translate "Integrated Amadeus API, global venue database, optimized routing. Plan efficient routes with real data."
    , 'features.travel.benefit': '' // TODO: translate "12% savings on travel costs"
    , 'org.addShowToCalendar': '' // TODO: translate "Add a new show to your calendar"
    , 'travel.validation.completeFields': '' // TODO: translate "Please complete origin, destination and departure date"
    , 'travel.validation.returnDate': '' // TODO: translate "Select return date for round trip"
    , 'travel.search.show_more_options': '' // TODO: translate "Open externally"
    , 'travel.advanced.show': '' // TODO: translate "More options"
    , 'travel.advanced.hide': '' // TODO: translate "Hide advanced options"
    , 'travel.flight_card.nonstop': '' // TODO: translate "nonstop"
    , 'travel.flight_card.stop': '' // TODO: translate "stop"
    , 'travel.flight_card.stops': '' // TODO: translate "stops"
    , 'travel.flight_card.select_for_planning': '' // TODO: translate "Select for planning"
    , 'travel.add_to_trip': '' // TODO: translate "Add to trip"
    , 'travel.swap': '' // TODO: translate "Swap"
    , 'travel.round_trip': '' // TODO: translate "Round trip"
    , 'travel.share_search': '' // TODO: translate "Share search"
    , 'travel.from': '' // TODO: translate "From"
    , 'travel.to': '' // TODO: translate "To"
    , 'travel.depart': '' // TODO: translate "Depart"
    , 'travel.return': '' // TODO: translate "Return"
    , 'travel.adults': '' // TODO: translate "Adults"
    , 'travel.bag': '' // TODO: translate "bag"
    , 'travel.bags': '' // TODO: translate "Bags"
    , 'travel.cabin': '' // TODO: translate "Cabin"
    , 'travel.stops_ok': '' // TODO: translate "Stops ok"
    , 'travel.deeplink.preview': '' // TODO: translate "Preview link"
    , 'travel.deeplink.copy': '' // TODO: translate "Copy link"
    , 'travel.deeplink.copied': '' // TODO: translate "Copied ✓"
    , 'travel.sort.menu': '' // TODO: translate "Sort by"
    , 'travel.sort.priceAsc': '' // TODO: translate "Price (low→high)"
    , 'travel.sort.priceDesc': '' // TODO: translate "Price (high→low)"
    , 'travel.sort.duration': '' // TODO: translate "Duration"
    , 'travel.sort.stops': '' // TODO: translate "Stops"
    , 'travel.badge.nonstop': '' // TODO: translate "Nonstop"
    , 'travel.badge.baggage': '' // TODO: translate "Bag included"
    , 'travel.arrival.sameDay': '' // TODO: translate "Arrives same day"
    , 'travel.arrival.nextDay': '' // TODO: translate "Arrives next day"
    , 'travel.recent.clear': '' // TODO: translate "Clear recent"
    , 'travel.recent.remove': '' // TODO: translate "Remove"
    , 'travel.form.invalid': '' // TODO: translate "Please fix errors to search"
    , 'travel.nlp.hint': '' // TODO: translate "Free-form input — press Shift+Enter to apply"
    , 'travel.flex.days': '' // TODO: translate "±{n} days"
    , 'travel.compare.grid.title': '' // TODO: translate "Compare flights"
    , 'travel.compare.empty': '' // TODO: translate "Pin flights to compare them here."
    , 'travel.compare.hint': '' // TODO: translate "Review pinned flights side-by-side."
    , 'travel.co2.label': '' // TODO: translate "CO₂"
    , 'travel.window': '' // TODO: translate "Window"
    , 'travel.flex_window': '' // TODO: translate "Flex window"
    , 'travel.flex_hint': '' // TODO: translate "We"
    , 'travel.one_way': '' // TODO: translate "One-way"
    , 'travel.nonstop': '' // TODO: translate "Nonstop"
    , 'travel.pin': '' // TODO: translate "Pin"
    , 'travel.unpin': '' // TODO: translate "Unpin"
    , 'travel.compare.title': '' // TODO: translate "Compare pinned"
    , 'travel.compare.show': '' // TODO: translate "Compare"
    , 'travel.compare.hide': '' // TODO: translate "Hide"
    , 'travel.compare.add_to_trip': '' // TODO: translate "Add to trip"
    , 'travel.trip.added': '' // TODO: translate "Added to trip"
    , 'travel.trip.create_drop': '' // TODO: translate "Drop here to create new trip"
    , 'travel.related_show': '' // TODO: translate "Related show"
    , 'travel.multicity.toggle': '' // TODO: translate "Multicity"
    , 'travel.multicity': '' // TODO: translate "Multi-city"
    , 'travel.multicity.add_leg': '' // TODO: translate "Add leg"
    , 'travel.multicity.remove': '' // TODO: translate "Remove"
    , 'travel.multicity.move_up': '' // TODO: translate "Move up"
    , 'travel.multicity.move_down': '' // TODO: translate "Move down"
    , 'travel.multicity.open': '' // TODO: translate "Open route in Google Flights"
    , 'travel.multicity.hint': '' // TODO: translate "Add at least two legs to build a route"
    , 'travel.trips': '' // TODO: translate "Trips"
    , 'travel.trip.new': '' // TODO: translate "New Trip"
    , 'travel.trip.to': '' // TODO: translate "Trip to"
    , 'travel.segments': '' // TODO: translate "Segments"
    , 'common.actions': '' // TODO: translate "Actions"
    , 'travel.timeline.title': '' // TODO: translate "Travel Timeline"
    , 'travel.timeline.free_day': '' // TODO: translate "Free day"
    , 'travel.hub.title': '' // TODO: translate "Search"
    , 'travel.hub.needs_planning': '' // TODO: translate "Suggestions"
    , 'travel.hub.upcoming': '' // TODO: translate "Upcoming"
    , 'travel.hub.open_multicity': '' // TODO: translate "Open multicity"
    , 'travel.hub.plan_trip_cta': '' // TODO: translate "Plan Trip"
    , 'travel.error.same_route': '' // TODO: translate "Origin and destination are the same"
    , 'travel.error.return_before_depart': '' // TODO: translate "Return is before departure"
    , 'travel.segment.type': '' // TODO: translate "Type"
    , 'travel.segment.flight': '' // TODO: translate "Flight"
    , 'travel.segment.hotel': '' // TODO: translate "Hotel"
    , 'travel.segment.ground': '' // TODO: translate "Ground"
    , 'copy.manual.title': '' // TODO: translate "Manual copy"
    , 'copy.manual.desc': '' // TODO: translate "Copy the text below if clipboard is blocked."
    , 'common.noResults': '' // TODO: translate "No results"
    , 'tripDetail.currency': '' // TODO: translate "Currency"
    , 'cost.category.flight': '' // TODO: translate "Flight"
    , 'cost.category.hotel': '' // TODO: translate "Hotel"
    , 'cost.category.ground': '' // TODO: translate "Ground"
    , 'cost.category.taxes': '' // TODO: translate "Taxes"
    , 'cost.category.fees': '' // TODO: translate "Fees"
    , 'cost.category.other': '' // TODO: translate "Other"
    , 'travel.workspace.placeholder': '' // TODO: translate "Select a trip to see details or perform a search."
    , 'travel.open_in_provider': '' // TODO: translate "Open in provider"
    , 'common.loading': '' // TODO: translate "Loading…"
    , 'common.results': '' // TODO: translate "results"
    , 'travel.no_trips_yet': '' // TODO: translate "No trips planned yet. Use the search to get started!"
    , 'travel.provider': '' // TODO: translate "Provider"
    , 'provider.mock': '' // TODO: translate "In-app (mock)"
    , 'provider.google': '' // TODO: translate "Google Flights"
    , 'travel.alert.checkin': '' // TODO: translate "Check-in opens in %s"
    , 'travel.alert.priceDrop': '' // TODO: translate "Price dropped by %s"
    , 'travel.workspace.open': '' // TODO: translate "Open Travel Workspace"
    , 'travel.workspace.timeline': '' // TODO: translate "Timeline view"
    , 'travel.workspace.trip_builder.beta': '' // TODO: translate "Trip Builder (beta)"
    , 'common.list': '' // TODO: translate "List"
    , 'common.clear': '' // TODO: translate "Clear"
    , 'common.reset': '' // TODO: translate "Reset"
    , 'calendar.timeline': '' // TODO: translate "Week"
    , 'common.moved': '' // TODO: translate "Moved"
    , 'travel.drop.hint': '' // TODO: translate "Drag to another day"
    , 'travel.search.summary': '' // TODO: translate "Search summary"
    , 'travel.search.route': '' // TODO: translate "{from} → {to}"
    , 'travel.search.paxCabin': '' // TODO: translate "{pax} pax · {cabin}"
    , 'travel.results.countForDate': '' // TODO: translate "{count} results for {date}"
    , 'travel.compare.bestPrice': '' // TODO: translate "Best price"
    , 'travel.compare.bestTime': '' // TODO: translate "Fastest"
    , 'travel.compare.bestBalance': '' // TODO: translate "Best balance"
    , 'travel.co2.estimate': '' // TODO: translate "~{kg} kg CO₂ (est.)"
    , 'travel.mobile.sticky.results': '' // TODO: translate "Results"
    , 'travel.mobile.sticky.compare': '' // TODO: translate "Compare"
    , 'travel.tooltips.flex': '' // TODO: translate "Explore ± days around the selected date"
    , 'travel.tooltips.nonstop': '' // TODO: translate "Only show flights without stops"
    , 'travel.tooltips.cabin': '' // TODO: translate "Seat class preference"
    , 'travel.move.prev': '' // TODO: translate "Move to previous day"
    , 'travel.move.next': '' // TODO: translate "Move to next day"
    , 'travel.rest.short': '' // TODO: translate "Short rest before next show"
    , 'travel.rest.same_day': '' // TODO: translate "Same-day show risk"
    , 'calendar.title': '' // TODO: translate "Calendar"
    , 'calendar.prev': '' // TODO: translate "Previous month"
    , 'calendar.next': '' // TODO: translate "Next month"
    , 'calendar.today': '' // TODO: translate "Today"
    , 'calendar.goto': '' // TODO: translate "Go to date"
    , 'calendar.more': '' // TODO: translate "more"
    , 'calendar.more.title': '' // TODO: translate "More events"
    , 'calendar.more.openDay': '' // TODO: translate "Open day"
    , 'calendar.more.openFullDay': '' // TODO: translate "Open full day"
    , 'calendar.announce.moved': '' // TODO: translate "Moved show to {d}"
    , 'calendar.announce.copied': '' // TODO: translate "Duplicated show to {d}"
    , 'calendar.quickAdd.hint': '' // TODO: translate "Enter to add • Esc to cancel"
    , 'calendar.quickAdd.advanced': '' // TODO: translate "Advanced"
    , 'calendar.quickAdd.simple': '' // TODO: translate "Simple"
    , 'calendar.quickAdd.placeholder': '' // TODO: translate "City CC Fee (optional)… e.g., Madrid ES 12000"
    , 'calendar.quickAdd.recent': '' // TODO: translate "Recent"
    , 'calendar.quickAdd.parseError': '' // TODO: translate "Can"
    , 'calendar.quickAdd.countryMissing': '' // TODO: translate "Add 2-letter country code"
    , 'calendar.goto.hint': '' // TODO: translate "Enter to go • Esc to close"
    , 'calendar.view.switch': '' // TODO: translate "Change calendar view"
    , 'calendar.view.month': '' // TODO: translate "Month"
    , 'calendar.view.week': '' // TODO: translate "Week"
    , 'calendar.view.day': '' // TODO: translate "Day"
    , 'calendar.view.agenda': '' // TODO: translate "Agenda"
    , 'calendar.view.announce': '' // TODO: translate "{v} view"
    , 'calendar.timezone': '' // TODO: translate "Time zone"
    , 'calendar.tz.local': '' // TODO: translate "Local"
    , 'calendar.tz.localLabel': '' // TODO: translate "Local"
    , 'calendar.tz.changed': '' // TODO: translate "Time zone set to {tz}"
    , 'calendar.goto.shortcut': '' // TODO: translate "⌘/Ctrl + G"
    , 'calendar.shortcut.pgUp': '' // TODO: translate "PgUp / Alt+←"
    , 'calendar.shortcut.pgDn': '' // TODO: translate "PgDn / Alt+→"
    , 'calendar.shortcut.today': '' // TODO: translate "T"
    , 'common.move': '' // TODO: translate "Move"
    , 'common.copy': '' // TODO: translate "Copy"
    , 'calendar.more.filter': '' // TODO: translate "Filter events"
    , 'calendar.more.empty': '' // TODO: translate "No results"
    , 'calendar.kb.hint': '' // TODO: translate "Keyboard: Arrow keys move day, PageUp/PageDown change month, T go to today, Enter or Space select day."
    , 'calendar.day.select': '' // TODO: translate "Selected {d}"
    , 'calendar.day.focus': '' // TODO: translate "Focused {d}"
    , 'calendar.noEvents': '' // TODO: translate "No events for this day"
    , 'calendar.show.shows': '' // TODO: translate "Shows"
    , 'calendar.show.travel': '' // TODO: translate "Travel"
    , 'calendar.kind': '' // TODO: translate "Kind"
    , 'calendar.kind.show': '' // TODO: translate "Show"
    , 'calendar.kind.travel': '' // TODO: translate "Travel"
    , 'calendar.status': '' // TODO: translate "Status"
    , 'calendar.dnd.enter': '' // TODO: translate "Drop here to place event on {d}"
    , 'calendar.dnd.leave': '' // TODO: translate "Leaving drop target"
    , 'calendar.kbdDnD.marked': '' // TODO: translate "Marked {d} as origin. Use Enter on target day to drop. Hold Ctrl/Cmd to copy."
    , 'calendar.kbdDnD.cancel': '' // TODO: translate "Cancelled move/copy mode"
    , 'calendar.kbdDnD.origin': '' // TODO: translate "Origin (keyboard move/copy active)"
    , 'calendar.kbdDnD.none': '' // TODO: translate "No show to move from selected origin"
    , 'calendar.weekStart': '' // TODO: translate "Week starts on"
    , 'calendar.weekStart.mon': '' // TODO: translate "Mon"
    , 'calendar.weekStart.sun': '' // TODO: translate "Sun"
    , 'calendar.import': '' // TODO: translate "Import"
    , 'calendar.import.ics': '' // TODO: translate "Import .ics"
    , 'calendar.import.done': '' // TODO: translate "Imported {n} events"
    , 'calendar.import.error': '' // TODO: translate "Failed to import .ics"
    , 'calendar.wd.mon': '' // TODO: translate "Mon"
    , 'calendar.wd.tue': '' // TODO: translate "Tue"
    , 'calendar.wd.wed': '' // TODO: translate "Wed"
    , 'calendar.wd.thu': '' // TODO: translate "Thu"
    , 'calendar.wd.fri': '' // TODO: translate "Fri"
    , 'calendar.wd.sat': '' // TODO: translate "Sat"
    , 'calendar.wd.sun': '' // TODO: translate "Sun"
    , 'shows.costs.type': '' // TODO: translate "Type"
    , 'shows.costs.placeholder': '' // TODO: translate "Travel / Production / Marketing"
    , 'shows.costs.amount': '' // TODO: translate "Amount"
    , 'shows.costs.desc': '' // TODO: translate "Description"
    , 'common.optional': '' // TODO: translate "Optional"
    , 'common.add': '' // TODO: translate "Add"
    , 'common.income': '' // TODO: translate "Income"
    , 'common.wht': '' // TODO: translate "WHT"
    , 'common.commissions': '' // TODO: translate "Commissions"
    , 'common.net': '' // TODO: translate "Net"
    , 'common.costs': '' // TODO: translate "Costs"
    , 'common.total': '' // TODO: translate "Total"
    , 'shows.promote': '' // TODO: translate "Promote"
    , 'shows.editor.status.promote': '' // TODO: translate "Promoted to"
    , 'shows.margin.tooltip': '' // TODO: translate "Net divided by Fee (%)"
    , 'shows.empty': '' // TODO: translate "No shows match your filters"
    , 'shows.empty.add': '' // TODO: translate "Add your first show"
    , 'shows.export.csv.success': '' // TODO: translate "CSV exported ✓"
    , 'shows.export.xlsx.success': '' // TODO: translate "XLSX exported ✓"
    , 'shows.sort.tooltip': '' // TODO: translate "Sort by column"
    , 'shows.filters.statusGroup': '' // TODO: translate "Status filters"
    , 'shows.relative.inDays': '' // TODO: translate "In {n} days"
    , 'shows.relative.daysAgo': '' // TODO: translate "{n} days ago"
    , 'shows.relative.yesterday': '' // TODO: translate "Yesterday"
    , 'shows.row.menu': '' // TODO: translate "Row actions"
    , 'shows.action.edit': '' // TODO: translate "Edit"
    , 'shows.action.promote': '' // TODO: translate "Promote"
    , 'shows.action.duplicate': '' // TODO: translate "Duplicate"
    , 'shows.action.archive': '' // TODO: translate "Archive"
    , 'shows.action.delete': '' // TODO: translate "Delete"
    , 'shows.action.restore': '' // TODO: translate "Restore"
    , 'shows.board.header.net': '' // TODO: translate "Net"
    , 'shows.board.header.count': '' // TODO: translate "Shows"
    , 'shows.datePreset.thisMonth': '' // TODO: translate "This Month"
    , 'shows.datePreset.nextMonth': '' // TODO: translate "Next Month"
    , 'shows.columns.config': '' // TODO: translate "Columns"
    , 'shows.columns.wht': '' // TODO: translate "WHT %"
    , 'shows.totals.pin': '' // TODO: translate "Pin totals"
    , 'shows.totals.unpin': '' // TODO: translate "Unpin totals"
    , 'shows.totals.avgFee': '' // TODO: translate "Avg Fee"
    , 'shows.totals.avgFee.tooltip': '' // TODO: translate "Average fee per show"
    , 'shows.totals.avgMargin': '' // TODO: translate "Avg Margin %"
    , 'shows.totals.avgMargin.tooltip': '' // TODO: translate "Average margin % across shows with fee"
    , 'shows.wht.hide': '' // TODO: translate "Hide WHT column"
    , 'shows.sort.aria.sortedDesc': '' // TODO: translate "Sorted descending"
    , 'shows.sort.aria.sortedAsc': '' // TODO: translate "Sorted ascending"
    , 'shows.sort.aria.notSorted': '' // TODO: translate "Not sorted"
    , 'shows.sort.aria.activateDesc': '' // TODO: translate "Activate to sort descending"
    , 'shows.sort.aria.activateAsc': '' // TODO: translate "Activate to sort ascending"
    , 'nav.overview': '' // TODO: translate "Overview"
    , 'nav.clients': '' // TODO: translate "Clients"
    , 'nav.teams': '' // TODO: translate "Teams"
    , 'nav.links': '' // TODO: translate "Links"
    , 'nav.reports': '' // TODO: translate "Reports"
    , 'nav.documents': '' // TODO: translate "Documents"
    , 'nav.integrations': '' // TODO: translate "Integrations"
    , 'nav.billing': '' // TODO: translate "Billing"
    , 'nav.branding': '' // TODO: translate "Branding"
    , 'nav.connections': '' // TODO: translate "Connections"
    , 'org.overview.title': '' // TODO: translate "Organization Overview"
    , 'org.overview.subtitle.agency': '' // TODO: translate "KPIs by client, tasks, and active links"
    , 'org.overview.subtitle.artist': '' // TODO: translate "Upcoming shows and travel, monthly KPIs"
    , 'org.members.title': '' // TODO: translate "Members"
    , 'members.invite': '' // TODO: translate "Invite"
    , 'members.seats.usage': '' // TODO: translate "Seat usage: 5/5 internal, 0/5 guests"
    , 'org.clients.title': '' // TODO: translate "Clients"
    , 'org.teams.title': '' // TODO: translate "Teams"
    , 'org.links.title': '' // TODO: translate "Links"
    , 'org.branding.title': '' // TODO: translate "Branding"
    , 'org.documents.title': '' // TODO: translate "Documents"
    , 'org.reports.title': '' // TODO: translate "Reports"
    , 'org.integrations.title': '' // TODO: translate "Integrations"
    , 'org.billing.title': '' // TODO: translate "Billing"
    , 'labels.seats.used': '' // TODO: translate "Seats used"
    , 'labels.seats.guests': '' // TODO: translate "Guests"
    , 'export.options': '' // TODO: translate "Export options"
    , 'export.columns': '' // TODO: translate "Columns"
    , 'export.csv': '' // TODO: translate "CSV"
    , 'export.xlsx': '' // TODO: translate "XLSX"
    , 'common.exporting': '' // TODO: translate "Exporting…"
    , 'charts.viewTable': '' // TODO: translate "View data as table"
    , 'charts.hideTable': '' // TODO: translate "Hide table"
    , 'finance.period.mtd': '' // TODO: translate "MTD"
    , 'finance.period.lastMonth': '' // TODO: translate "Last month"
    , 'finance.period.ytd': '' // TODO: translate "YTD"
    , 'finance.period.custom': '' // TODO: translate "Custom"
    , 'finance.period.closed': '' // TODO: translate "Closed"
    , 'finance.period.open': '' // TODO: translate "Open"
    , 'finance.closeMonth': '' // TODO: translate "Close Month"
    , 'finance.reopenMonth': '' // TODO: translate "Reopen Month"
    , 'finance.closed.help': '' // TODO: translate "Month is closed. Reopen to make changes."
    , 'finance.kpi.mtdNet': '' // TODO: translate "MTD Net"
    , 'finance.kpi.ytdNet': '' // TODO: translate "YTD Net"
    , 'finance.kpi.forecastEom': '' // TODO: translate "Forecast EOM"
    , 'finance.kpi.deltaTarget': '' // TODO: translate "Δ vs Target"
    , 'finance.kpi.gm': '' // TODO: translate "GM%"
    , 'finance.kpi.dso': '' // TODO: translate "DSO"
    , 'finance.comparePrev': '' // TODO: translate "Compare vs previous"
    , 'finance.export.csv.success': '' // TODO: translate "CSV exported ✓"
    , 'finance.export.xlsx.success': '' // TODO: translate "XLSX exported ✓"
    , 'finance.v2.footer': '' // TODO: translate "AR top debtors and row actions coming next."
    , 'finance.pl.caption': '' // TODO: translate "Profit and Loss ledger. Use column headers to sort. Virtualized list shows a subset of rows."
    , 'common.rowsVisible': '' // TODO: translate "Rows visible"
    , 'finance.whtPct': '' // TODO: translate "WHT %"
    , 'finance.wht': '' // TODO: translate "WHT"
    , 'finance.mgmtPct': '' // TODO: translate "Mgmt %"
    , 'finance.bookingPct': '' // TODO: translate "Booking %"
    , 'finance.breakdown.by': '' // TODO: translate "Breakdown by"
    , 'finance.breakdown.empty': '' // TODO: translate "No breakdown available"
    , 'finance.delta': '' // TODO: translate "Δ"
    , 'finance.deltaVsPrev': '' // TODO: translate "Δ vs prev"
    , 'common.comingSoon': '' // TODO: translate "Coming soon"
    , 'finance.expected': '' // TODO: translate "Expected (stage-weighted)"
    , 'finance.ar.title': '' // TODO: translate "AR aging & top debtors"
    , 'common.moreActions': '' // TODO: translate "More actions"
    , 'actions.copyRow': '' // TODO: translate "Copy row"
    , 'actions.exportRowCsv': '' // TODO: translate "Export row (CSV)"
    , 'actions.goToShow': '' // TODO: translate "Go to show"
    , 'actions.openCosts': '' // TODO: translate "Open costs"
    , 'shows.table.route': '' // TODO: translate "Route"
    , 'finance.targets.title': '' // TODO: translate "Targets"
    , 'finance.targets.revenue': '' // TODO: translate "Revenue target"
    , 'finance.targets.net': '' // TODO: translate "Net target"
    , 'finance.targets.hint': '' // TODO: translate "Targets are local to this device for now."
    , 'finance.targets.noNegative': '' // TODO: translate "Targets cannot be negative"
    , 'filters.title': '' // TODO: translate "Filters"
    , 'filters.region': '' // TODO: translate "Region"
    , 'filters.from': '' // TODO: translate "From"
    , 'filters.to': '' // TODO: translate "To"
    , 'filters.currency': '' // TODO: translate "Currency"
    , 'filters.presentation': '' // TODO: translate "Presentation mode"
    , 'filters.shortcutHint': '' // TODO: translate "Ctrl/Cmd+K – open filters"
    , 'filters.appliedRange': '' // TODO: translate "Applied range"
    , 'layout.team': '' // TODO: translate "Team"
    , 'layout.highContrast': '' // TODO: translate "High Contrast"
    , 'layout.tenant': '' // TODO: translate "Tenant"
    , 'access.readOnly': '' // TODO: translate "read-only"
    , 'layout.viewingAs': '' // TODO: translate "Viewing as"
    , 'layout.viewAsExit': '' // TODO: translate "Exit"
    , 'access.readOnly.tooltip': '' // TODO: translate "Finance exports disabled for agency demo"
    , 'lab.drag': '' // TODO: translate "Drag"
    , 'lab.moveUp': '' // TODO: translate "Move up"
    , 'lab.moveDown': '' // TODO: translate "Move down"
    , 'lab.reset': '' // TODO: translate "Reset to template"
    , 'lab.back': '' // TODO: translate "Back to Dashboard"
    , 'lab.layoutName': '' // TODO: translate "Layout name"
    , 'lab.save': '' // TODO: translate "Save layout"
    , 'lab.apply': '' // TODO: translate "Apply…"
    , 'lab.delete': '' // TODO: translate "Delete…"
    , 'lab.export': '' // TODO: translate "Export"
    , 'lab.import': '' // TODO: translate "Import"
    , 'lab.dropHere': '' // TODO: translate "Drop widgets here"
    , 'lab.header': '' // TODO: translate "Mission Control Lab"
    , 'lab.subheader': '' // TODO: translate "Drag, reorder, and resize dashboard widgets. Experimental."
    , 'lab.template': '' // TODO: translate "Template"
    , 'lab.resetToTemplate': '' // TODO: translate "Reset to template"
    , 'lab.backToDashboard': '' // TODO: translate "Back to Dashboard"
    , 'lab.applySaved': '' // TODO: translate "Apply…"
    , 'lab.deleteSaved': '' // TODO: translate "Delete…"
    , 'dashboard.title': '' // TODO: translate "Tour Command Center"
    , 'dashboard.subtitle': '' // TODO: translate "Monitor your tour performance, mission status, and take action on what matters most"
    , 'dashboard.map.title': '' // TODO: translate "Tour Map"
    , 'dashboard.activity.title': '' // TODO: translate "Recent Activity"
    , 'dashboard.actions.title': '' // TODO: translate "Quick Actions"
    , 'dashboard.actions.newShow': '' // TODO: translate "Add New Show"
    , 'dashboard.actions.quickFinance': '' // TODO: translate "Quick Finance Check"
    , 'dashboard.actions.travelBooking': '' // TODO: translate "Book Travel"
    , 'dashboard.areas.finance.title': '' // TODO: translate "Finance"
    , 'dashboard.areas.finance.description': '' // TODO: translate "Track revenue, costs, and profitability"
    , 'dashboard.areas.shows.title': '' // TODO: translate "Shows & Events"
    , 'dashboard.areas.shows.description': '' // TODO: translate "Manage performances and venues"
    , 'dashboard.areas.travel.title': '' // TODO: translate "Travel & Logistics"
    , 'dashboard.areas.travel.description': '' // TODO: translate "Plan and track travel arrangements"
    , 'dashboard.areas.missionControl.title': '' // TODO: translate "Mission Control Lab"
    , 'dashboard.areas.missionControl.description': '' // TODO: translate "Advanced mission control with customizable widgets"
    , 'dashboard.kpi.financialHealth': '' // TODO: translate "Financial Health"
    , 'dashboard.kpi.nextEvent': '' // TODO: translate "Next Critical Event"
    , 'dashboard.kpi.ticketSales': '' // TODO: translate "Ticket Sales"
    , 'actions.toast.export': '' // TODO: translate "Export copied"
    , 'actions.import.prompt': '' // TODO: translate "Paste Lab layouts JSON"
    , 'actions.toast.imported': '' // TODO: translate "Imported"
    , 'actions.toast.import_invalid': '' // TODO: translate "Invalid JSON"
    , 'actions.newArtist': '' // TODO: translate "New artist"
    , 'actions.connectExisting': '' // TODO: translate "Connect existing"
    , 'actions.editScopes': '' // TODO: translate "Edit scopes"
    , 'actions.revoke': '' // TODO: translate "Revoke"
    , 'actions.exportPdf': '' // TODO: translate "Export PDF"
    , 'branding.uploadLogo': '' // TODO: translate "Upload logo"
    , 'branding.editColors': '' // TODO: translate "Edit colors"
    , 'common.upload': '' // TODO: translate "Upload"
    , 'common.newFolder': '' // TODO: translate "New folder"
    , 'live.up': '' // TODO: translate "up"
    , 'live.down': '' // TODO: translate "down"
    , 'live.flat': '' // TODO: translate "flat"
    , 'nav.profile': '' // TODO: translate "Profile"
    , 'nav.changeOrg': '' // TODO: translate "Change organization"
    , 'nav.logout': '' // TODO: translate "Logout"
    , 'profile.title': '' // TODO: translate "Profile"
    , 'profile.personal': '' // TODO: translate "Personal"
    , 'profile.security': '' // TODO: translate "Security"
    , 'profile.notifications': '' // TODO: translate "Notifications"
    , 'profile.save': '' // TODO: translate "Save"
    , 'profile.saved': '' // TODO: translate "Saved ✓"
    , 'profile.avatarUrl': '' // TODO: translate "Avatar URL"
    , 'profile.bio': '' // TODO: translate "Bio"
    , 'profile.notify.email': '' // TODO: translate "Email updates"
    , 'profile.notify.slack': '' // TODO: translate "Slack notifications"
    , 'profile.notify.hint': '' // TODO: translate "These preferences affect demo notifications only"
    , 'profile.memberships': '' // TODO: translate "Memberships"
    , 'profile.defaultOrg': '' // TODO: translate "Default organization"
    , 'profile.setDefault': '' // TODO: translate "Set default"
    , 'profile.dataPrivacy': '' // TODO: translate "Data & privacy"
    , 'profile.exportData': '' // TODO: translate "Export my demo data"
    , 'profile.clearData': '' // TODO: translate "Clear and reseed demo data"
    , 'profile.export.ready': '' // TODO: translate "Data export ready"
    , 'profile.error.name': '' // TODO: translate "Name is required"
    , 'profile.error.email': '' // TODO: translate "Email is required"
    , 'prefs.title': '' // TODO: translate "Preferences"
    , 'prefs.appearance': '' // TODO: translate "Appearance"
    , 'prefs.language': '' // TODO: translate "Language"
    , 'prefs.theme': '' // TODO: translate "Theme"
    , 'prefs.highContrast': '' // TODO: translate "High contrast"
    , 'prefs.finance.currency': '' // TODO: translate "Currency"
    , 'prefs.units': '' // TODO: translate "Distance units"
    , 'prefs.presentation': '' // TODO: translate "Presentation mode"
    , 'prefs.comparePrev': '' // TODO: translate "Compare vs previous"
    , 'prefs.defaultRegion': '' // TODO: translate "Default region"
    , 'prefs.defaultStatuses': '' // TODO: translate "Default statuses"
    , 'prefs.help.language': '' // TODO: translate "Affects labels and date/number formatting."
    , 'prefs.help.theme': '' // TODO: translate "Choose light or dark based on your environment."
    , 'prefs.help.highContrast': '' // TODO: translate "Improves contrast and focus rings for readability."
    , 'prefs.help.currency': '' // TODO: translate "Sets default currency for dashboards and exports."
    , 'prefs.help.units': '' // TODO: translate "Used for travel distances and map overlays."
    , 'prefs.help.presentation': '' // TODO: translate "Larger text, simplified animations for demos."
    , 'prefs.help.comparePrev': '' // TODO: translate "Shows deltas against the previous period."
    , 'prefs.help.region': '' // TODO: translate "Preselects region filters in dashboards."
    , 'subnav.ariaLabel': '' // TODO: translate "Sections"
    , 'breadcrumb.home': '' // TODO: translate "Home"
    , 'home.seo.title': '' // TODO: translate "On Tour App - Tour Management & Finance Dashboard"
    , 'home.seo.description': '' // TODO: translate "Professional tour management platform with real-time finance tracking, venue booking, and performance analytics for artists and managers."
    , 'home.seo.keywords': '' // TODO: translate "tour management, concert booking, artist finance, venue management, performance analytics, live music"
    , 'comparison.title': '' // TODO: translate "From Spreadsheet Chaos to App Clarity"
    , 'comparison.subtitle': '' // TODO: translate "See how your tour management evolves from fragmented Excel files to a unified, intelligent platform."
    , 'comparison.excel.title': '' // TODO: translate "Excel Chaos"
    , 'comparison.excel.problem1': '' // TODO: translate "Scattered files across devices and emails"
    , 'comparison.excel.problem2': '' // TODO: translate "Manual calculations prone to errors"
    , 'comparison.excel.problem3': '' // TODO: translate "No real-time collaboration or notifications"
    , 'comparison.excel.problem4': '' // TODO: translate "Lost context in endless tabs and comments"
    , 'comparison.app.title': '' // TODO: translate "App Clarity"
    , 'comparison.app.benefit1': '' // TODO: translate "Unified dashboard with live data sync"
    , 'comparison.app.benefit2': '' // TODO: translate "Automated calculations and error detection"
    , 'comparison.app.benefit3': '' // TODO: translate "Real-time collaboration and smart notifications"
    , 'comparison.app.benefit4': '' // TODO: translate "Context-aware insights and predictive alerts"
    , 'comparison.benefit1.title': '' // TODO: translate "Smart Finance Tracking"
    , 'comparison.benefit1.desc': '' // TODO: translate "Automatic profit calculations, cost analysis, and budget alerts."
    , 'comparison.benefit2.title': '' // TODO: translate "Live Tour Mapping"
    , 'comparison.benefit2.desc': '' // TODO: translate "Interactive maps with route optimization and venue intelligence."
    , 'comparison.benefit3.title': '' // TODO: translate "Instant Insights"
    , 'comparison.benefit3.desc': '' // TODO: translate "AI-powered recommendations and risk detection in real-time."
    , 'metamorphosis.title': '' // TODO: translate "From scattered noise to a living control panel"
    , 'metamorphosis.subtitle': '' // TODO: translate "Instead of spreadsheets mutating chaotically and critical context buried in comments, every data point flows into a single orchestrated surface. The system reconciles, validates, and highlights what matters."
    , 'dashboard.offerConfirmed': '' // TODO: translate "Offer → Confirmed"
    , 'dashboard.tourHealthScore': '' // TODO: translate "Tour Health Score"
    , 'dashboard.healthFactors': '' // TODO: translate "Health Factors"
    , 'dashboard.keyInsights': '' // TODO: translate "Key Insights"
    , 'dashboard.confidence': '' // TODO: translate "Confidence"
    , 'dashboard.current': '' // TODO: translate "Current"
    , 'dashboard.predicted': '' // TODO: translate "Predicted"
    , 'dashboard.expectedChange': '' // TODO: translate "Expected change"
    , 'dashboard.scheduleGap': '' // TODO: translate "Schedule gap"
    , 'dashboard.allSystemsReady': '' // TODO: translate "All systems ready"
    , 'dashboard.loadingMap': '' // TODO: translate "Loading map…"
    , 'placeholder.username': '' // TODO: translate "you@example.com or username"
    , 'placeholder.bio': '' // TODO: translate "Tell us a bit about yourself and what you do..."
    , 'placeholder.cityName': '' // TODO: translate "Enter city name..."
    , 'placeholder.notes': '' // TODO: translate "Add any additional notes..."
    , 'placeholder.searchCommand': '' // TODO: translate "Search shows, navigate, or type a command..."
    , 'placeholder.expenseDescription': '' // TODO: translate "e.g., Flight tickets, Hotel booking..."
    , 'placeholder.expenseDetails': '' // TODO: translate "Add any additional details, invoice numbers, or context..."
    , 'placeholder.origin': '' // TODO: translate "Origin (e.g., BCN)"
    , 'placeholder.destination': '' // TODO: translate "Destination (e.g., AMS)"
    , 'placeholder.bookingRef': '' // TODO: translate "Booking reference or flight number"
    , 'placeholder.airport': '' // TODO: translate "City or airport..."
```

### Detailed Translation Table

| Key | English Original | Your Translation |
|-----|------------------|------------------|
| `scopes.tooltip.shows` | Shows access granted by link | _[translate here]_ |
| `scopes.tooltip.travel` | Travel access granted by link | _[translate here]_ |
| `scopes.tooltip.finance` | Finance: read-only per link policy | _[translate here]_ |
| `kpi.shows` | Shows | _[translate here]_ |
| `kpi.net` | Net | _[translate here]_ |
| `kpi.travel` | Travel | _[translate here]_ |
| `cmd.go.profile` | Go to profile | _[translate here]_ |
| `cmd.go.preferences` | Go to preferences | _[translate here]_ |
| `common.copyLink` | Copy link | _[translate here]_ |
| `common.learnMore` | Learn more | _[translate here]_ |
| `insights.thisMonthTotal` | This Month Total | _[translate here]_ |
| `insights.statusBreakdown` | Status breakdown | _[translate here]_ |
| `insights.upcoming14d` | Upcoming 14d | _[translate here]_ |
| `common.openShow` | Open show | _[translate here]_ |
| `common.centerMap` | Center map | _[translate here]_ |
| `common.dismiss` | Dismiss | _[translate here]_ |
| `common.snooze7` | Snooze 7 days | _[translate here]_ |
| `common.snooze30` | Snooze 30 days | _[translate here]_ |
| `common.on` | on | _[translate here]_ |
| `common.off` | off | _[translate here]_ |
| `common.hide` | Hide | _[translate here]_ |
| `common.pin` | Pin | _[translate here]_ |
| `common.unpin` | Unpin | _[translate here]_ |
| `common.map` | Map | _[translate here]_ |
| `layout.invite` | Invite | _[translate here]_ |
| `layout.build` | Build: preview | _[translate here]_ |
| `layout.demo` | Status: demo feed | _[translate here]_ |
| `alerts.title` | Alert Center | _[translate here]_ |
| `alerts.anySeverity` | Any severity | _[translate here]_ |
| `alerts.anyRegion` | Any region | _[translate here]_ |
| `alerts.anyTeam` | Any team | _[translate here]_ |
| `alerts.copySlack` | Copy Slack | _[translate here]_ |
| `alerts.copied` | Copied \u2713 | _[translate here]_ |
| `alerts.noAlerts` | No alerts | _[translate here]_ |
| `map.openInDashboard` | Open in dashboard | _[translate here]_ |
| `auth.login` | Login | _[translate here]_ |
| `auth.chooseUser` | Choose a demo user | _[translate here]_ |
| `auth.enterAs` | Enter as {name} | _[translate here]_ |
| `auth.role.owner` | Artist (Owner) | _[translate here]_ |
| `auth.role.agencyManager` | Agency Manager | _[translate here]_ |
| `auth.role.artistManager` | Artist Team (Manager) | _[translate here]_ |
| `auth.scope.finance.ro` | Finance: read-only | _[translate here]_ |
| `auth.scope.edit.showsTravel` | Edit shows/travel | _[translate here]_ |
| `auth.scope.full` | Full access | _[translate here]_ |
| `login.title` | Welcome to On Tour | _[translate here]_ |
| `login.subtitle` | Your tour management command center | _[translate here]_ |
| `login.enterAs` | Enter as {name} | _[translate here]_ |
| `login.quick.agency` | Enter as Shalizi (agency) | _[translate here]_ |
| `login.quick.artist` | Enter as Danny (artist) | _[translate here]_ |
| `login.remember` | Remember me | _[translate here]_ |
| `login.usernameOrEmail` | Username or Email | _[translate here]_ |
| `role.agencyManager` | Agency Manager | _[translate here]_ |
| `role.artistOwner` | Artist (Owner) | _[translate here]_ |
| `role.artistManager` | Artist Team (Manager) | _[translate here]_ |
| `scope.shows.write` | shows: write | _[translate here]_ |
| `scope.shows.read` | shows: read | _[translate here]_ |
| `scope.travel.book` | travel: book | _[translate here]_ |
| `scope.travel.read` | travel: read | _[translate here]_ |
| `scope.finance.read` | finance: read | _[translate here]_ |
| `scope.finance.none` | finance: none | _[translate here]_ |
| `hero.enter` | Enter | _[translate here]_ |
| `marketing.nav.features` | Features | _[translate here]_ |
| `marketing.nav.product` | Product | _[translate here]_ |
| `marketing.nav.pricing` | Pricing | _[translate here]_ |
| `marketing.nav.testimonials` | Testimonials | _[translate here]_ |
| `marketing.nav.cta` | Get started | _[translate here]_ |
| `marketing.cta.primary` | Start free | _[translate here]_ |
| `marketing.cta.secondary` | Watch demo | _[translate here]_ |
| `marketing.cta.login` | Log in | _[translate here]_ |
| `hero.demo.artist` | View demo as Danny | _[translate here]_ |
| `hero.demo.agency` | View demo as Adam | _[translate here]_ |
| `hero.persona.question` | I am a... | _[translate here]_ |
| `hero.persona.artist` | Artist / Manager | _[translate here]_ |
| `hero.persona.agency` | Agency | _[translate here]_ |
| `hero.subtitle.artist` | Take control of your finances and tour logistics. See your career from a single dashboard. | _[translate here]_ |
| `hero.subtitle.agency` | Manage your entire roster from one place. Give your artists visibility and generate reports in seconds. | _[translate here]_ |
| `home.action.title` | Stop Surviving. Start Commanding. | _[translate here]_ |
| `home.action.subtitle` | See how On Tour App can transform your next tour. | _[translate here]_ |
| `home.action.cta` | Request a Personalized Demo | _[translate here]_ |
| `inside.map.desc.artist` | Visualize your tour route and anticipate travel needs | _[translate here]_ |
| `inside.finance.desc.artist` | Track your earnings, expenses and profitability in real-time | _[translate here]_ |
| `inside.actions.desc.artist` | Stay on top of contracts, payments and upcoming deadlines | _[translate here]_ |
| `inside.map.desc.agency` | Monitor all your artists\ | _[translate here]_ |
| `inside.finance.desc.agency` | Consolidated financial overview across your entire roster | _[translate here]_ |
| `inside.actions.desc.agency` | Centralized task management for team coordination and client updates | _[translate here]_ |
| `inside.title` | What you | _[translate here]_ |
| `shows.summary.avgFee` | Avg Fee | _[translate here]_ |
| `shows.summary.avgMargin` | Avg Margin | _[translate here]_ |
| `inside.map.title` | Map | _[translate here]_ |
| `inside.map.desc` | Live HUD with shows, route and risks | _[translate here]_ |
| `inside.finance.title` | Finance | _[translate here]_ |
| `inside.finance.desc` | Monthly KPIs, pipeline and forecast | _[translate here]_ |
| `inside.actions.title` | Actions | _[translate here]_ |
| `inside.actions.desc` | Action Hub with priorities and shortcuts | _[translate here]_ |
| `how.title` | How it works | _[translate here]_ |
| `how.step.invite` | Invite your team | _[translate here]_ |
| `how.step.connect` | Connect with artists or agencies | _[translate here]_ |
| `how.step.views` | Work by views: HUD, Finance, Shows | _[translate here]_ |
| `how.step.connectData` | Connect your data | _[translate here]_ |
| `how.step.connectData.desc` | Import shows, connect calendar, or get invited by your agency | _[translate here]_ |
| `how.step.visualize` | Visualize your world | _[translate here]_ |
| `how.step.visualize.desc` | Your tour comes alive on the map, finances clarify in the dashboard | _[translate here]_ |
| `how.step.act` | Act with intelligence | _[translate here]_ |
| `how.step.connectData.artist` | Import your shows, connect your calendar, or get invited by your agency. Your tour data in one place. | _[translate here]_ |
| `how.step.connectData.agency` | Invite your artists and connect their data. Centralize all tour information across your roster. | _[translate here]_ |
| `how.step.visualize.artist` | Your tour comes alive on the map, finances clarify in your personal dashboard. See your career at a glance. | _[translate here]_ |
| `how.step.visualize.agency` | Monitor all artists\ | _[translate here]_ |
| `how.step.act.artist` | Receive proactive alerts about contracts, payments, and deadlines. Make data-driven decisions with confidence. | _[translate here]_ |
| `how.step.act.agency` | Prioritize team tasks, generate reports instantly, and keep all stakeholders informed with real-time updates. | _[translate here]_ |
| `how.multiTenant` | Multi-tenant demo: switch between Agency and Artist contexts | _[translate here]_ |
| `trust.privacy` | Privacy: local demo (your browser) | _[translate here]_ |
| `trust.accessibility` | Accessibility: shortcuts “?” | _[translate here]_ |
| `trust.support` | Support | _[translate here]_ |
| `trust.demo` | Local demo — no data uploaded | _[translate here]_ |
| `testimonials.title` | Trusted by Industry Leaders | _[translate here]_ |
| `testimonials.subtitle` | Real stories from the touring industry | _[translate here]_ |
| `testimonials.subtitle.artist` | See how artists are taking control of their careers | _[translate here]_ |
| `testimonials.subtitle.agency` | Discover how agencies are transforming their operations | _[translate here]_ |
| `common.skipToContent` | Skip to content | _[translate here]_ |
| `alerts.slackCopied` | Slack payload copied | _[translate here]_ |
| `alerts.copyManual` | Open window to copy manually | _[translate here]_ |
| `ah.title` | Action Hub | _[translate here]_ |
| `ah.tab.pending` | Pending | _[translate here]_ |
| `ah.tab.shows` | This Month | _[translate here]_ |
| `ah.tab.travel` | Travel | _[translate here]_ |
| `ah.tab.insights` | Insights | _[translate here]_ |
| `ah.filter.all` | All | _[translate here]_ |
| `ah.filter.risk` | Risk | _[translate here]_ |
| `ah.filter.urgency` | Urgency | _[translate here]_ |
| `ah.filter.opportunity` | Opportunity | _[translate here]_ |
| `ah.filter.offer` | Offer | _[translate here]_ |
| `ah.filter.finrisk` | Finrisk | _[translate here]_ |
| `ah.cta.addTravel` | Add travel | _[translate here]_ |
| `ah.cta.followUp` | Follow up | _[translate here]_ |
| `ah.cta.review` | Review | _[translate here]_ |
| `ah.cta.open` | Open | _[translate here]_ |
| `ah.empty` | All caught up! | _[translate here]_ |
| `ah.openTravel` | Open Travel | _[translate here]_ |
| `ah.done` | Done | _[translate here]_ |
| `ah.typeFilter` | Type filter | _[translate here]_ |
| `ah.why` | Why? | _[translate here]_ |
| `ah.why.title` | Why this priority? | _[translate here]_ |
| `ah.why.score` | Score | _[translate here]_ |
| `ah.why.impact` | Impact | _[translate here]_ |
| `ah.why.amount` | Amount | _[translate here]_ |
| `ah.why.inDays` | In | _[translate here]_ |
| `ah.why.overdue` | Overdue | _[translate here]_ |
| `ah.why.kind` | Type | _[translate here]_ |
| `finance.quicklook` | Finance Quicklook | _[translate here]_ |
| `finance.ledger` | Ledger | _[translate here]_ |
| `finance.targets` | Targets | _[translate here]_ |
| `finance.targets.month` | Monthly targets | _[translate here]_ |
| `finance.targets.year` | Yearly targets | _[translate here]_ |
| `finance.pipeline` | Pipeline | _[translate here]_ |
| `finance.pipeline.subtitle` | Expected value (weighted by stage) | _[translate here]_ |
| `finance.openFull` | Open full finance | _[translate here]_ |
| `finance.pivot` | Pivot | _[translate here]_ |
| `finance.pivot.group` | Group | _[translate here]_ |
| `finance.ar.view` | View | _[translate here]_ |
| `finance.ar.remind` | Remind | _[translate here]_ |
| `finance.ar.reminder.queued` | Reminder queued | _[translate here]_ |
| `finance.thisMonth` | This Month | _[translate here]_ |
| `finance.income` | Income | _[translate here]_ |
| `finance.expenses` | Expenses | _[translate here]_ |
| `finance.net` | Net | _[translate here]_ |
| `finance.byStatus` | By status | _[translate here]_ |
| `finance.byMonth` | by month | _[translate here]_ |
| `finance.confirmed` | Confirmed | _[translate here]_ |
| `finance.pending` | Pending | _[translate here]_ |
| `finance.compare` | Compare prev | _[translate here]_ |
| `charts.resetZoom` | Reset zoom | _[translate here]_ |
| `common.current` | Current | _[translate here]_ |
| `common.compare` | Compare | _[translate here]_ |
| `common.reminder` | Reminder | _[translate here]_ |
| `finance.ui.view` | View | _[translate here]_ |
| `finance.ui.classic` | Classic | _[translate here]_ |
| `finance.ui.beta` | New (beta) | _[translate here]_ |
| `finance.offer` | Offer | _[translate here]_ |
| `finance.shows` | shows | _[translate here]_ |
| `finance.noShowsMonth` | No shows this month | _[translate here]_ |
| `finance.hideAmounts` | Hide amounts | _[translate here]_ |
| `finance.hidden` | Hidden | _[translate here]_ |
| `common.open` | Open | _[translate here]_ |
| `common.apply` | Apply | _[translate here]_ |
| `common.saveView` | Save view | _[translate here]_ |
| `common.import` | Import | _[translate here]_ |
| `common.export` | Export | _[translate here]_ |
| `common.copied` | Copied ✓ | _[translate here]_ |
| `common.markDone` | Mark done | _[translate here]_ |
| `common.hideItem` | Hide | _[translate here]_ |
| `views.import.invalidShape` | Invalid views JSON shape | _[translate here]_ |
| `views.import.invalidJson` | Invalid JSON | _[translate here]_ |
| `common.tomorrow` | Tomorrow | _[translate here]_ |
| `common.go` | Go | _[translate here]_ |
| `common.show` | Show | _[translate here]_ |
| `common.search` | Search | _[translate here]_ |
| `hud.next3weeks` | Next 3 weeks | _[translate here]_ |
| `hud.noTrips3weeks` | No upcoming trips in 3 weeks | _[translate here]_ |
| `hud.openShow` | open show | _[translate here]_ |
| `hud.openTrip` | open travel | _[translate here]_ |
| `hud.view.whatsnext` | What | _[translate here]_ |
| `hud.view.month` | This Month | _[translate here]_ |
| `hud.view.financials` | Financials | _[translate here]_ |
| `hud.view.whatsnext.desc` | Upcoming 14 day summary | _[translate here]_ |
| `hud.view.month.desc` | Monthly financial & show snapshot | _[translate here]_ |
| `hud.view.financials.desc` | Financial intelligence breakdown | _[translate here]_ |
| `hud.layer.heat` | Heat | _[translate here]_ |
| `hud.layer.status` | Status | _[translate here]_ |
| `hud.layer.route` | Route | _[translate here]_ |
| `hud.views` | HUD views | _[translate here]_ |
| `hud.layers` | Map layers | _[translate here]_ |
| `hud.missionControl` | Mission Control | _[translate here]_ |
| `hud.subtitle` | Realtime map and upcoming shows | _[translate here]_ |
| `hud.risks` | Risks | _[translate here]_ |
| `hud.assignProducer` | Assign producer | _[translate here]_ |
| `hud.mapLoadError` | Map failed to load. Please retry. | _[translate here]_ |
| `common.retry` | Retry | _[translate here]_ |
| `hud.viewChanged` | View changed to | _[translate here]_ |
| `hud.openEvent` | open event | _[translate here]_ |
| `hud.type.flight` | Flight | _[translate here]_ |
| `hud.type.ground` | Ground | _[translate here]_ |
| `hud.type.event` | Event | _[translate here]_ |
| `hud.fin.avgNetMonth` | Avg Net (Month) | _[translate here]_ |
| `hud.fin.runRateYear` | Run Rate (Year) | _[translate here]_ |
| `finance.forecast` | Forecast vs Actual | _[translate here]_ |
| `finance.forecast.legend.actual` | Actual net | _[translate here]_ |
| `finance.forecast.legend.p50` | Forecast p50 | _[translate here]_ |
| `finance.forecast.legend.band` | Confidence band | _[translate here]_ |
| `finance.forecast.alert.under` | Under forecast by | _[translate here]_ |
| `finance.forecast.alert.above` | Above optimistic by | _[translate here]_ |
| `map.toggle.status` | Toggle status markers | _[translate here]_ |
| `map.toggle.route` | Toggle route line | _[translate here]_ |
| `map.toggle.heat` | Toggle heat circles | _[translate here]_ |
| `shows.exportCsv` | Export CSV | _[translate here]_ |
| `shows.filters.from` | From | _[translate here]_ |
| `shows.filters.to` | To | _[translate here]_ |
| `shows.items` | items | _[translate here]_ |
| `shows.date.presets` | Presets | _[translate here]_ |
| `shows.date.thisMonth` | This Month | _[translate here]_ |
| `shows.date.nextMonth` | Next Month | _[translate here]_ |
| `shows.tooltip.net` | Fee minus WHT, commissions, and costs | _[translate here]_ |
| `shows.tooltip.margin` | Net divided by Fee (%) | _[translate here]_ |
| `shows.table.margin` | Margin % | _[translate here]_ |
| `shows.editor.margin.formula` | Margin % = Net/Fee | _[translate here]_ |
| `shows.tooltip.wht` | Withholding tax percentage applied to the fee | _[translate here]_ |
| `shows.editor.label.name` | Show name | _[translate here]_ |
| `shows.editor.placeholder.name` | Festival or show name | _[translate here]_ |
| `shows.editor.placeholder.venue` | Venue name | _[translate here]_ |
| `shows.editor.help.venue` | Optional venue / room name | _[translate here]_ |
| `shows.editor.help.fee` | Gross fee agreed (before taxes, commissions, costs) | _[translate here]_ |
| `shows.editor.help.wht` | Local withholding tax percentage (auto-suggested by country) | _[translate here]_ |
| `shows.editor.saving` | Saving… | _[translate here]_ |
| `shows.editor.saved` | Saved ✓ | _[translate here]_ |
| `shows.editor.save.error` | Save failed | _[translate here]_ |
| `shows.editor.cost.templates` | Templates | _[translate here]_ |
| `shows.editor.cost.addTemplate` | Add template | _[translate here]_ |
| `shows.editor.cost.subtotals` | Subtotals | _[translate here]_ |
| `shows.editor.cost.type` | Type | _[translate here]_ |
| `shows.editor.cost.amount` | Amount | _[translate here]_ |
| `shows.editor.cost.desc` | Description | _[translate here]_ |
| `shows.editor.status.help` | Current lifecycle state of the show | _[translate here]_ |
| `shows.editor.cost.template.travel` | Travel basics | _[translate here]_ |
| `shows.editor.cost.template.production` | Production basics | _[translate here]_ |
| `shows.editor.cost.template.marketing` | Marketing basics | _[translate here]_ |
| `shows.editor.quick.label` | Quick add costs | _[translate here]_ |
| `shows.editor.quick.hint` | e.g., Hotel 1200 | _[translate here]_ |
| `shows.editor.quick.placeholder` | 20/04/2025  | _[translate here]_ |
| `shows.editor.quick.preview.summary` | Will set: {fields} | _[translate here]_ |
| `shows.editor.quick.apply` | Apply | _[translate here]_ |
| `shows.editor.quick.parseError` | Cannot interpret | _[translate here]_ |
| `shows.editor.quick.applied` | Quick entry applied | _[translate here]_ |
| `shows.editor.bulk.title` | Bulk add costs | _[translate here]_ |
| `shows.editor.bulk.open` | Bulk add | _[translate here]_ |
| `shows.editor.bulk.placeholder` | Type, Amount, Description\nTravel, 1200, Flights BCN-MAD\nProduction\t500\tBackline | _[translate here]_ |
| `shows.editor.bulk.preview` | Preview | _[translate here]_ |
| `shows.editor.bulk.parsed` | Parsed {count} lines | _[translate here]_ |
| `shows.editor.bulk.add` | Add costs | _[translate here]_ |
| `shows.editor.bulk.cancel` | Cancel | _[translate here]_ |
| `shows.editor.bulk.invalidLine` | Invalid line {n} | _[translate here]_ |
| `shows.editor.bulk.empty` | No valid lines | _[translate here]_ |
| `shows.editor.bulk.help` | Paste CSV or tab-separated lines: Type, Amount, Description (amount optional) | _[translate here]_ |
| `shows.editor.restored` | Restored draft | _[translate here]_ |
| `shows.editor.quick.icon.date` | Date | _[translate here]_ |
| `shows.editor.quick.icon.city` | City | _[translate here]_ |
| `shows.editor.quick.icon.country` | Country | _[translate here]_ |
| `shows.editor.quick.icon.fee` | Fee | _[translate here]_ |
| `shows.editor.quick.icon.whtPct` | WHT % | _[translate here]_ |
| `shows.editor.quick.icon.name` | Name | _[translate here]_ |
| `shows.editor.cost.templateMenu` | Cost templates | _[translate here]_ |
| `shows.editor.cost.template.applied` | Template applied | _[translate here]_ |
| `shows.editor.cost.duplicate` | Duplicate | _[translate here]_ |
| `shows.editor.cost.moveUp` | Move up | _[translate here]_ |
| `shows.editor.cost.moveDown` | Move down | _[translate here]_ |
| `shows.editor.costs.title` | Costs | _[translate here]_ |
| `shows.editor.costs.empty` | No costs yet — add one | _[translate here]_ |
| `shows.editor.costs.recent` | Recent | _[translate here]_ |
| `shows.editor.costs.templates` | Templates | _[translate here]_ |
| `shows.editor.costs.subtotal` | Subtotal {category} | _[translate here]_ |
| `shows.editor.wht.suggest` | Suggest {pct}% | _[translate here]_ |
| `shows.editor.wht.apply` | Apply {pct}% | _[translate here]_ |
| `shows.editor.wht.suggest.applied` | Suggestion applied | _[translate here]_ |
| `shows.editor.wht.tooltip.es` | Typical IRPF in ES: 15% (editable) | _[translate here]_ |
| `shows.editor.wht.tooltip.generic` | Typical withholding suggestion | _[translate here]_ |
| `shows.editor.status.hint` | Change here or via badge | _[translate here]_ |
| `shows.editor.wht.hint.es` | Typical ES withholding: 15% (editable) | _[translate here]_ |
| `shows.editor.wht.hint.generic` | Withholding percentage (editable) | _[translate here]_ |
| `shows.editor.commission.default` | Default {pct}% | _[translate here]_ |
| `shows.editor.commission.overridden` | Override | _[translate here]_ |
| `shows.editor.commission.overriddenIndicator` | Commission overridden | _[translate here]_ |
| `shows.editor.commission.reset` | Reset to default | _[translate here]_ |
| `shows.editor.label.currency` | Currency | _[translate here]_ |
| `shows.editor.help.currency` | Contract currency | _[translate here]_ |
| `shows.editor.fx.rateOn` | Rate | _[translate here]_ |
| `shows.editor.fx.convertedFee` | ≈ {amount} {base} | _[translate here]_ |
| `shows.editor.fx.unavailable` | Rate unavailable | _[translate here]_ |
| `shows.editor.actions.promote` | Promote | _[translate here]_ |
| `shows.editor.actions.planTravel` | Plan travel | _[translate here]_ |
| `shows.editor.state.hint` | Use the badge or this selector | _[translate here]_ |
| `shows.editor.save.create` | Save | _[translate here]_ |
| `shows.editor.save.edit` | Save changes | _[translate here]_ |
| `shows.editor.save.retry` | Retry | _[translate here]_ |
| `shows.editor.tab.active` | Tab {label} active | _[translate here]_ |
| `shows.editor.tab.restored` | Restored last tab: {label} | _[translate here]_ |
| `shows.editor.errors.count` | There are {n} errors | _[translate here]_ |
| `shows.totals.fees` | Fees | _[translate here]_ |
| `shows.totals.net` | Net | _[translate here]_ |
| `shows.totals.hide` | Hide | _[translate here]_ |
| `shows.totals.show` | Show totals | _[translate here]_ |
| `shows.view.list` | List | _[translate here]_ |
| `shows.view.board` | Board | _[translate here]_ |
| `shows.views.none` | Views | _[translate here]_ |
| `views.manage` | Manage views | _[translate here]_ |
| `views.saved` | Saved | _[translate here]_ |
| `views.apply` | Apply | _[translate here]_ |
| `views.none` | No saved views | _[translate here]_ |
| `views.deleted` | Deleted | _[translate here]_ |
| `views.export` | Export | _[translate here]_ |
| `views.import` | Import | _[translate here]_ |
| `views.import.hint` | Paste JSON of views to import | _[translate here]_ |
| `views.openLab` | Open Layout Lab | _[translate here]_ |
| `views.share` | Copy share link | _[translate here]_ |
| `views.export.copied` | Export copied | _[translate here]_ |
| `views.imported` | Views imported | _[translate here]_ |
| `views.import.invalid` | Invalid JSON | _[translate here]_ |
| `views.label` | View | _[translate here]_ |
| `views.names.default` | Default | _[translate here]_ |
| `views.names.finance` | Finance | _[translate here]_ |
| `views.names.operations` | Operations | _[translate here]_ |
| `views.names.promo` | Promotion | _[translate here]_ |
| `demo.banner` | Demo data • No live sync | _[translate here]_ |
| `demo.load` | Load demo data | _[translate here]_ |
| `demo.loaded` | Demo data loaded | _[translate here]_ |
| `demo.clear` | Clear data | _[translate here]_ |
| `demo.cleared` | All data cleared | _[translate here]_ |
| `demo.password.prompt` | Enter demo password | _[translate here]_ |
| `demo.password.invalid` | Incorrect password | _[translate here]_ |
| `shows.views.delete` | Delete | _[translate here]_ |
| `shows.views.namePlaceholder` | View name | _[translate here]_ |
| `shows.views.save` | Save | _[translate here]_ |
| `shows.status.canceled` | Canceled | _[translate here]_ |
| `shows.status.archived` | Archived | _[translate here]_ |
| `shows.status.offer` | Offer | _[translate here]_ |
| `shows.status.pending` | Pending | _[translate here]_ |
| `shows.status.confirmed` | Confirmed | _[translate here]_ |
| `shows.status.postponed` | Postponed | _[translate here]_ |
| `shows.bulk.selected` | selected | _[translate here]_ |
| `shows.bulk.confirm` | Confirm | _[translate here]_ |
| `shows.bulk.promote` | Promote | _[translate here]_ |
| `shows.bulk.export` | Export | _[translate here]_ |
| `shows.notes` | Notes | _[translate here]_ |
| `shows.virtualized.hint` | Virtualized list active | _[translate here]_ |
| `story.title` | Story mode | _[translate here]_ |
| `story.timeline` | Timeline | _[translate here]_ |
| `story.play` | Play | _[translate here]_ |
| `story.pause` | Pause | _[translate here]_ |
| `story.cta` | Story mode | _[translate here]_ |
| `story.scrub` | Scrub timeline | _[translate here]_ |
| `finance.overview` | Finance overview | _[translate here]_ |
| `shows.title` | Shows | _[translate here]_ |
| `shows.notFound` | Show not found | _[translate here]_ |
| `shows.search.placeholder` | Search city/country | _[translate here]_ |
| `shows.add` | Add show | _[translate here]_ |
| `shows.edit` | Edit | _[translate here]_ |
| `shows.summary.upcoming` | Upcoming | _[translate here]_ |
| `shows.summary.totalFees` | Total Fees | _[translate here]_ |
| `shows.summary.estNet` | Est. Net | _[translate here]_ |
| `shows.summary.avgWht` | Avg WHT | _[translate here]_ |
| `shows.table.date` | Date | _[translate here]_ |
| `shows.table.name` | Show | _[translate here]_ |
| `shows.table.city` | City | _[translate here]_ |
| `shows.table.country` | Country | _[translate here]_ |
| `shows.table.venue` | Venue | _[translate here]_ |
| `shows.table.promoter` | Promoter | _[translate here]_ |
| `shows.table.wht` | WHT % | _[translate here]_ |
| `shows.table.type` | Type | _[translate here]_ |
| `shows.table.description` | Description | _[translate here]_ |
| `shows.table.amount` | Amount | _[translate here]_ |
| `shows.table.remove` | Remove | _[translate here]_ |
| `shows.table.agency.mgmt` | Mgmt | _[translate here]_ |
| `shows.table.agency.booking` | Booking | _[translate here]_ |
| `shows.table.agencies` | Agencies | _[translate here]_ |
| `shows.table.notes` | Notes | _[translate here]_ |
| `shows.table.fee` | Fee | _[translate here]_ |
| `shows.selected` | selected | _[translate here]_ |
| `shows.count.singular` | show | _[translate here]_ |
| `shows.count.plural` | shows | _[translate here]_ |
| `settings.title` | Settings | _[translate here]_ |
| `settings.personal` | Personal | _[translate here]_ |
| `settings.preferences` | Preferences | _[translate here]_ |
| `settings.organization` | Organization | _[translate here]_ |
| `settings.billing` | Billing | _[translate here]_ |
| `settings.currency` | Currency | _[translate here]_ |
| `settings.units` | Distance units | _[translate here]_ |
| `settings.agencies` | Agencies | _[translate here]_ |
| `settings.localNote` | Preferences are saved locally on this device. | _[translate here]_ |
| `settings.language` | Language | _[translate here]_ |
| `settings.language.en` | English | _[translate here]_ |
| `settings.language.es` | Spanish | _[translate here]_ |
| `settings.dashboardView` | Default Dashboard View | _[translate here]_ |
| `settings.presentation` | Presentation mode | _[translate here]_ |
| `settings.comparePrev` | Compare vs previous period | _[translate here]_ |
| `settings.defaultStatuses` | Default status filters | _[translate here]_ |
| `settings.defaultRegion` | Default region | _[translate here]_ |
| `settings.region.all` | All | _[translate here]_ |
| `settings.region.AMER` | Americas | _[translate here]_ |
| `settings.region.EMEA` | EMEA | _[translate here]_ |
| `settings.region.APAC` | APAC | _[translate here]_ |
| `settings.agencies.booking` | Booking Agencies | _[translate here]_ |
| `settings.agencies.management` | Management Agencies | _[translate here]_ |
| `settings.agencies.add` | Add | _[translate here]_ |
| `settings.agencies.hideForm` | Hide form | _[translate here]_ |
| `settings.agencies.none` | No agencies | _[translate here]_ |
| `settings.agencies.name` | Name | _[translate here]_ |
| `settings.agencies.commission` | Commission % | _[translate here]_ |
| `settings.agencies.territoryMode` | Territory Mode | _[translate here]_ |
| `settings.agencies.continents` | Continents | _[translate here]_ |
| `settings.agencies.countries` | Countries (comma or space separated ISO2) | _[translate here]_ |
| `settings.agencies.addBooking` | Add booking | _[translate here]_ |
| `settings.agencies.addManagement` | Add management | _[translate here]_ |
| `settings.agencies.reset` | Reset | _[translate here]_ |
| `settings.agencies.remove` | Remove agency | _[translate here]_ |
| `settings.agencies.limitReached` | Limit reached (max 3) | _[translate here]_ |
| `settings.agencies.countries.invalid` | Countries must be 2-letter ISO codes (e.g., US ES DE), separated by commas or spaces. | _[translate here]_ |
| `settings.continent.NA` | North America | _[translate here]_ |
| `settings.continent.SA` | South America | _[translate here]_ |
| `settings.continent.EU` | Europe | _[translate here]_ |
| `settings.continent.AF` | Africa | _[translate here]_ |
| `settings.continent.AS` | Asia | _[translate here]_ |
| `settings.continent.OC` | Oceania | _[translate here]_ |
| `settings.territory.worldwide` | Worldwide | _[translate here]_ |
| `settings.territory.continents` | Continents | _[translate here]_ |
| `settings.territory.countries` | Countries | _[translate here]_ |
| `settings.export` | Export settings | _[translate here]_ |
| `settings.import` | Import settings | _[translate here]_ |
| `settings.reset` | Reset to defaults | _[translate here]_ |
| `settings.preview` | Preview | _[translate here]_ |
| `shows.table.net` | Net | _[translate here]_ |
| `shows.table.status` | Status | _[translate here]_ |
| `shows.selectAll` | Select all | _[translate here]_ |
| `shows.selectRow` | Select row | _[translate here]_ |
| `shows.editor.tabs` | Editor tabs | _[translate here]_ |
| `shows.editor.tab.details` | Details | _[translate here]_ |
| `shows.editor.tab.finance` | Finance | _[translate here]_ |
| `shows.editor.tab.costs` | Costs | _[translate here]_ |
| `shows.editor.finance.commissions` | Commissions | _[translate here]_ |
| `shows.editor.add` | Add show | _[translate here]_ |
| `shows.editor.edit` | Edit show | _[translate here]_ |
| `shows.editor.subtitleAdd` | Create a new event | _[translate here]_ |
| `shows.editor.label.status` | Status | _[translate here]_ |
| `shows.editor.label.date` | Date | _[translate here]_ |
| `shows.editor.label.city` | City | _[translate here]_ |
| `shows.editor.label.country` | Country | _[translate here]_ |
| `shows.editor.label.venue` | Venue | _[translate here]_ |
| `shows.editor.label.promoter` | Promoter | _[translate here]_ |
| `shows.editor.label.fee` | Fee | _[translate here]_ |
| `shows.editor.label.wht` | WHT % | _[translate here]_ |
| `shows.editor.label.mgmt` | Mgmt Agency | _[translate here]_ |
| `shows.editor.label.booking` | Booking Agency | _[translate here]_ |
| `shows.editor.label.notes` | Notes | _[translate here]_ |
| `shows.editor.validation.cityRequired` | City is required | _[translate here]_ |
| `shows.editor.validation.countryRequired` | Country is required | _[translate here]_ |
| `shows.editor.validation.dateRequired` | Date is required | _[translate here]_ |
| `shows.editor.validation.feeGtZero` | Fee must be greater than 0 | _[translate here]_ |
| `shows.editor.validation.whtRange` | WHT must be between 0% and 50% | _[translate here]_ |
| `shows.dialog.close` | Close | _[translate here]_ |
| `shows.dialog.cancel` | Cancel | _[translate here]_ |
| `shows.dialog.save` | Save | _[translate here]_ |
| `shows.dialog.saveChanges` | Save changes | _[translate here]_ |
| `shows.dialog.delete` | Delete | _[translate here]_ |
| `shows.editor.validation.fail` | Fix errors to continue | _[translate here]_ |
| `shows.editor.toast.saved` | Saved | _[translate here]_ |
| `shows.editor.toast.deleted` | Deleted | _[translate here]_ |
| `shows.editor.toast.undo` | Undo | _[translate here]_ |
| `shows.editor.toast.restored` | Restored | _[translate here]_ |
| `shows.editor.toast.deleting` | Deleting… | _[translate here]_ |
| `shows.editor.toast.discarded` | Changes discarded | _[translate here]_ |
| `shows.editor.toast.validation` | Please correct the highlighted errors | _[translate here]_ |
| `shows.editor.summary.fee` | Fee | _[translate here]_ |
| `shows.editor.summary.wht` | WHT | _[translate here]_ |
| `shows.editor.summary.costs` | Costs | _[translate here]_ |
| `shows.editor.summary.net` | Est. Net | _[translate here]_ |
| `shows.editor.discard.title` | Discard changes? | _[translate here]_ |
| `shows.editor.discard.body` | You have unsaved changes. They will be lost. | _[translate here]_ |
| `shows.editor.discard.cancel` | Keep editing | _[translate here]_ |
| `shows.editor.discard.confirm` | Discard | _[translate here]_ |
| `shows.editor.delete.confirmTitle` | Delete show? | _[translate here]_ |
| `shows.editor.delete.confirmBody` | This action cannot be undone. | _[translate here]_ |
| `shows.editor.delete.confirm` | Delete | _[translate here]_ |
| `shows.editor.delete.cancel` | Cancel | _[translate here]_ |
| `shows.noCosts` | No costs yet | _[translate here]_ |
| `shows.filters.region` | Region | _[translate here]_ |
| `shows.filters.region.all` | All | _[translate here]_ |
| `shows.filters.region.AMER` | AMER | _[translate here]_ |
| `shows.filters.region.EMEA` | EMEA | _[translate here]_ |
| `shows.filters.region.APAC` | APAC | _[translate here]_ |
| `shows.filters.feeMin` | Min fee | _[translate here]_ |
| `shows.filters.feeMax` | Max fee | _[translate here]_ |
| `shows.views.export` | Export views | _[translate here]_ |
| `shows.views.import` | Import views | _[translate here]_ |
| `shows.views.applied` | View applied | _[translate here]_ |
| `shows.bulk.delete` | Delete selected | _[translate here]_ |
| `shows.bulk.setWht` | Set WHT % | _[translate here]_ |
| `shows.bulk.applyWht` | Apply WHT | _[translate here]_ |
| `shows.bulk.setStatus` | Set status | _[translate here]_ |
| `shows.bulk.apply` | Apply | _[translate here]_ |
| `shows.travel.title` | Location | _[translate here]_ |
| `shows.travel.quick` | Travel | _[translate here]_ |
| `shows.travel.soon` | Upcoming confirmed show — consider adding travel. | _[translate here]_ |
| `shows.travel.soonConfirmed` | Upcoming confirmed show — consider adding travel. | _[translate here]_ |
| `shows.travel.soonGeneric` | Upcoming show — consider planning travel. | _[translate here]_ |
| `shows.travel.tripExists` | Trip already scheduled around this date | _[translate here]_ |
| `shows.travel.noCta` | No travel action needed | _[translate here]_ |
| `shows.travel.plan` | Plan travel | _[translate here]_ |
| `cmd.dialog` | Command palette | _[translate here]_ |
| `cmd.placeholder` | Search shows or actions… | _[translate here]_ |
| `cmd.type.show` | Show | _[translate here]_ |
| `cmd.type.action` | Action | _[translate here]_ |
| `cmd.noResults` | No results | _[translate here]_ |
| `cmd.footer.hint` | Enter to run • Esc to close | _[translate here]_ |
| `cmd.footer.tip` | Tip: press ? for shortcuts | _[translate here]_ |
| `cmd.openFilters` | Open Filters | _[translate here]_ |
| `cmd.mask.enable` | Enable Mask | _[translate here]_ |
| `cmd.mask.disable` | Disable Mask | _[translate here]_ |
| `cmd.presentation.enable` | Enable Presentation Mode | _[translate here]_ |
| `cmd.presentation.disable` | Disable Presentation Mode | _[translate here]_ |
| `cmd.shortcuts` | Show Shortcuts Overlay | _[translate here]_ |
| `cmd.switch.default` | Switch View: Default | _[translate here]_ |
| `cmd.switch.finance` | Switch View: Finance | _[translate here]_ |
| `cmd.switch.operations` | Switch View: Operations | _[translate here]_ |
| `cmd.switch.promo` | Switch View: Promotion | _[translate here]_ |
| `cmd.openAlerts` | Open Alert Center | _[translate here]_ |
| `cmd.go.shows` | Go to Shows | _[translate here]_ |
| `cmd.go.travel` | Go to Travel | _[translate here]_ |
| `cmd.go.finance` | Go to Finance | _[translate here]_ |
| `cmd.go.org` | Go to Org Overview | _[translate here]_ |
| `cmd.go.members` | Go to Org Members | _[translate here]_ |
| `cmd.go.clients` | Go to Org Clients | _[translate here]_ |
| `cmd.go.teams` | Go to Org Teams | _[translate here]_ |
| `cmd.go.links` | Go to Org Links | _[translate here]_ |
| `cmd.go.reports` | Go to Org Reports | _[translate here]_ |
| `cmd.go.documents` | Go to Org Documents | _[translate here]_ |
| `cmd.go.integrations` | Go to Org Integrations | _[translate here]_ |
| `cmd.go.billing` | Go to Org Billing | _[translate here]_ |
| `cmd.go.branding` | Go to Org Branding | _[translate here]_ |
| `shortcuts.dialog` | Keyboard shortcuts | _[translate here]_ |
| `shortcuts.title` | Shortcuts | _[translate here]_ |
| `shortcuts.desc` | Use these to move faster. Press Esc to close. | _[translate here]_ |
| `shortcuts.openPalette` | Open Command Palette | _[translate here]_ |
| `shortcuts.showOverlay` | Show this overlay | _[translate here]_ |
| `shortcuts.closeDialogs` | Close dialogs/popups | _[translate here]_ |
| `shortcuts.goTo` | Quick nav: g then key | _[translate here]_ |
| `alerts.open` | Open Alerts | _[translate here]_ |
| `alerts.loading` | Loading alerts… | _[translate here]_ |
| `actions.exportCsv` | Export CSV | _[translate here]_ |
| `actions.copyDigest` | Copy Digest | _[translate here]_ |
| `actions.digest.title` | Weekly Alerts Digest | _[translate here]_ |
| `actions.toast.csv` | CSV copied | _[translate here]_ |
| `actions.toast.digest` | Digest copied | _[translate here]_ |
| `actions.toast.share` | Link copied | _[translate here]_ |
| `welcome.title` | Welcome, {name} | _[translate here]_ |
| `welcome.subtitle.agency` | Manage your managers and artists | _[translate here]_ |
| `welcome.subtitle.artist` | All set for your upcoming shows | _[translate here]_ |
| `welcome.cta.dashboard` | Go to dashboard | _[translate here]_ |
| `welcome.section.team` | Your team | _[translate here]_ |
| `welcome.section.clients` | Your artists | _[translate here]_ |
| `welcome.section.assignments` | Managers per artist | _[translate here]_ |
| `welcome.section.links` | Connections & scopes | _[translate here]_ |
| `welcome.section.kpis` | This month | _[translate here]_ |
| `welcome.seats.usage` | Seats used | _[translate here]_ |
| `welcome.gettingStarted` | Getting started | _[translate here]_ |
| `welcome.recentlyViewed` | Recently viewed | _[translate here]_ |
| `welcome.changesSince` | Changes since your last visit | _[translate here]_ |
| `welcome.noChanges` | No changes | _[translate here]_ |
| `welcome.change.linkEdited` | Link scopes edited for Danny | _[translate here]_ |
| `welcome.change.memberInvited` | New manager invited | _[translate here]_ |
| `welcome.change.docUploaded` | New document uploaded | _[translate here]_ |
| `empty.noRecent` | No recent items | _[translate here]_ |
| `welcome.cta.inviteManager` | Invite manager | _[translate here]_ |
| `welcome.cta.connectArtist` | Connect artist | _[translate here]_ |
| `welcome.cta.createTeam` | Create team | _[translate here]_ |
| `welcome.cta.completeBranding` | Complete branding | _[translate here]_ |
| `welcome.cta.reviewShows` | Review shows | _[translate here]_ |
| `welcome.cta.connectCalendar` | Connect calendar | _[translate here]_ |
| `welcome.cta.switchOrg` | Change organization | _[translate here]_ |
| `welcome.cta.completeSetup` | Complete setup | _[translate here]_ |
| `welcome.progress.complete` | Setup complete | _[translate here]_ |
| `welcome.progress.incomplete` | {completed}/{total} steps completed | _[translate here]_ |
| `welcome.tooltip.inviteManager` | Invite team members to collaborate on shows and finances | _[translate here]_ |
| `welcome.tooltip.connectArtist` | Link with artists to manage their tours | _[translate here]_ |
| `welcome.tooltip.completeBranding` | Set up your organization\ | _[translate here]_ |
| `welcome.tooltip.connectCalendar` | Sync your calendar for automatic show scheduling | _[translate here]_ |
| `welcome.tooltip.switchOrg` | Switch between different organizations you manage | _[translate here]_ |
| `welcome.gettingStarted.invite` | Invite a manager | _[translate here]_ |
| `welcome.gettingStarted.connect` | Connect an artist | _[translate here]_ |
| `welcome.gettingStarted.review` | Review teams & links | _[translate here]_ |
| `welcome.gettingStarted.branding` | Complete branding | _[translate here]_ |
| `welcome.gettingStarted.shows` | Review shows | _[translate here]_ |
| `welcome.gettingStarted.calendar` | Connect calendar | _[translate here]_ |
| `welcome.dontShowAgain` | Don | _[translate here]_ |
| `welcome.openArtistDashboard` | Open {artist} dashboard | _[translate here]_ |
| `welcome.assign` | Assign | _[translate here]_ |
| `shows.toast.bulk.status` | Status: {status} ({n}) | _[translate here]_ |
| `shows.toast.bulk.confirm` | Confirmed | _[translate here]_ |
| `shows.toast.bulk.setStatus` | Status applied | _[translate here]_ |
| `shows.toast.bulk.setWht` | WHT applied | _[translate here]_ |
| `shows.toast.bulk.export` | Export started | _[translate here]_ |
| `shows.toast.bulk.delete` | Deleted | _[translate here]_ |
| `shows.toast.bulk.confirmed` | Confirmed ({n}) | _[translate here]_ |
| `shows.toast.bulk.wht` | WHT {pct}% ({n}) | _[translate here]_ |
| `filters.clear` | Clear | _[translate here]_ |
| `filters.more` | More filters | _[translate here]_ |
| `filters.cleared` | Filters cleared | _[translate here]_ |
| `filters.presets` | Presets | _[translate here]_ |
| `filters.presets.last7` | Last 7 days | _[translate here]_ |
| `filters.presets.last30` | Last 30 days | _[translate here]_ |
| `filters.presets.last90` | Last 90 days | _[translate here]_ |
| `filters.presets.mtd` | Month to date | _[translate here]_ |
| `filters.presets.ytd` | Year to date | _[translate here]_ |
| `filters.presets.qtd` | Quarter to date | _[translate here]_ |
| `filters.applied` | Filters applied | _[translate here]_ |
| `common.team` | Team | _[translate here]_ |
| `common.region` | Region | _[translate here]_ |
| `ah.planTravel` | Plan travel | _[translate here]_ |
| `map.cssWarning` | Map styles failed to load. Using basic fallback. | _[translate here]_ |
| `travel.offline` | Offline mode: showing cached itineraries. | _[translate here]_ |
| `travel.refresh.error` | Couldn | _[translate here]_ |
| `travel.search.title` | Search | _[translate here]_ |
| `travel.search.open_in_google` | Open in Google Flights | _[translate here]_ |
| `travel.search.mode.form` | Form | _[translate here]_ |
| `travel.search.mode.text` | Text | _[translate here]_ |
| `travel.search.show_text` | Write query | _[translate here]_ |
| `travel.search.hide_text` | Hide text input | _[translate here]_ |
| `travel.search.text.placeholder` | e.g., From MAD to CDG 2025-10-12 2 adults business | _[translate here]_ |
| `travel.nlp` | NLP | _[translate here]_ |
| `travel.search.origin` | Origin | _[translate here]_ |
| `travel.search.destination` | Destination | _[translate here]_ |
| `travel.search.departure_date` | Departure date | _[translate here]_ |
| `travel.search.searching` | Searching flights… | _[translate here]_ |
| `travel.search.searchMyFlight` | Search My Flight | _[translate here]_ |
| `travel.search.searchAgain` | Search Again | _[translate here]_ |
| `travel.search.error` | Error searching flights | _[translate here]_ |
| `travel.addPurchasedFlight` | Add Purchased Flight | _[translate here]_ |
| `travel.addFlightDescription` | Enter your booking reference or flight number to add it to your schedule | _[translate here]_ |
| `travel.emptyStateDescription` | Add your booked flights or search for new ones to start managing your trips. | _[translate here]_ |
| `features.settlement.benefit` | 8h/week saved on financial reports | _[translate here]_ |
| `features.offline.description` | IndexedDB + robust sync. Manage your tour on the plane, backstage, or anywhere. When internet returns, everything syncs automatically. | _[translate here]_ |
| `features.offline.benefit` | 24/7 access, no connection dependency | _[translate here]_ |
| `features.ai.description` | NLP Quick Entry, intelligent ActionHub, predictive Health Score. Warns you of problems before they happen. Your tour copilot. | _[translate here]_ |
| `features.ai.benefit` | Anticipates problems 72h in advance | _[translate here]_ |
| `features.esign.description` | Integrated e-sign, templates by country (US/UK/EU/ES), full-text search with OCR. Close deals faster, no paper printing. | _[translate here]_ |
| `features.esign.benefit` | Close contracts 3x faster | _[translate here]_ |
| `features.inbox.description` | Emails organized by show, smart threading, rich text reply. All your context in one place, no Gmail searching. | _[translate here]_ |
| `features.inbox.benefit` | Zero inbox with full context | _[translate here]_ |
| `features.travel.description` | Integrated Amadeus API, global venue database, optimized routing. Plan efficient routes with real data. | _[translate here]_ |
| `features.travel.benefit` | 12% savings on travel costs | _[translate here]_ |
| `org.addShowToCalendar` | Add a new show to your calendar | _[translate here]_ |
| `travel.validation.completeFields` | Please complete origin, destination and departure date | _[translate here]_ |
| `travel.validation.returnDate` | Select return date for round trip | _[translate here]_ |
| `travel.search.show_more_options` | Open externally | _[translate here]_ |
| `travel.advanced.show` | More options | _[translate here]_ |
| `travel.advanced.hide` | Hide advanced options | _[translate here]_ |
| `travel.flight_card.nonstop` | nonstop | _[translate here]_ |
| `travel.flight_card.stop` | stop | _[translate here]_ |
| `travel.flight_card.stops` | stops | _[translate here]_ |
| `travel.flight_card.select_for_planning` | Select for planning | _[translate here]_ |
| `travel.add_to_trip` | Add to trip | _[translate here]_ |
| `travel.swap` | Swap | _[translate here]_ |
| `travel.round_trip` | Round trip | _[translate here]_ |
| `travel.share_search` | Share search | _[translate here]_ |
| `travel.from` | From | _[translate here]_ |
| `travel.to` | To | _[translate here]_ |
| `travel.depart` | Depart | _[translate here]_ |
| `travel.return` | Return | _[translate here]_ |
| `travel.adults` | Adults | _[translate here]_ |
| `travel.bag` | bag | _[translate here]_ |
| `travel.bags` | Bags | _[translate here]_ |
| `travel.cabin` | Cabin | _[translate here]_ |
| `travel.stops_ok` | Stops ok | _[translate here]_ |
| `travel.deeplink.preview` | Preview link | _[translate here]_ |
| `travel.deeplink.copy` | Copy link | _[translate here]_ |
| `travel.deeplink.copied` | Copied ✓ | _[translate here]_ |
| `travel.sort.menu` | Sort by | _[translate here]_ |
| `travel.sort.priceAsc` | Price (low→high) | _[translate here]_ |
| `travel.sort.priceDesc` | Price (high→low) | _[translate here]_ |
| `travel.sort.duration` | Duration | _[translate here]_ |
| `travel.sort.stops` | Stops | _[translate here]_ |
| `travel.badge.nonstop` | Nonstop | _[translate here]_ |
| `travel.badge.baggage` | Bag included | _[translate here]_ |
| `travel.arrival.sameDay` | Arrives same day | _[translate here]_ |
| `travel.arrival.nextDay` | Arrives next day | _[translate here]_ |
| `travel.recent.clear` | Clear recent | _[translate here]_ |
| `travel.recent.remove` | Remove | _[translate here]_ |
| `travel.form.invalid` | Please fix errors to search | _[translate here]_ |
| `travel.nlp.hint` | Free-form input — press Shift+Enter to apply | _[translate here]_ |
| `travel.flex.days` | ±{n} days | _[translate here]_ |
| `travel.compare.grid.title` | Compare flights | _[translate here]_ |
| `travel.compare.empty` | Pin flights to compare them here. | _[translate here]_ |
| `travel.compare.hint` | Review pinned flights side-by-side. | _[translate here]_ |
| `travel.co2.label` | CO₂ | _[translate here]_ |
| `travel.window` | Window | _[translate here]_ |
| `travel.flex_window` | Flex window | _[translate here]_ |
| `travel.flex_hint` | We | _[translate here]_ |
| `travel.one_way` | One-way | _[translate here]_ |
| `travel.nonstop` | Nonstop | _[translate here]_ |
| `travel.pin` | Pin | _[translate here]_ |
| `travel.unpin` | Unpin | _[translate here]_ |
| `travel.compare.title` | Compare pinned | _[translate here]_ |
| `travel.compare.show` | Compare | _[translate here]_ |
| `travel.compare.hide` | Hide | _[translate here]_ |
| `travel.compare.add_to_trip` | Add to trip | _[translate here]_ |
| `travel.trip.added` | Added to trip | _[translate here]_ |
| `travel.trip.create_drop` | Drop here to create new trip | _[translate here]_ |
| `travel.related_show` | Related show | _[translate here]_ |
| `travel.multicity.toggle` | Multicity | _[translate here]_ |
| `travel.multicity` | Multi-city | _[translate here]_ |
| `travel.multicity.add_leg` | Add leg | _[translate here]_ |
| `travel.multicity.remove` | Remove | _[translate here]_ |
| `travel.multicity.move_up` | Move up | _[translate here]_ |
| `travel.multicity.move_down` | Move down | _[translate here]_ |
| `travel.multicity.open` | Open route in Google Flights | _[translate here]_ |
| `travel.multicity.hint` | Add at least two legs to build a route | _[translate here]_ |
| `travel.trips` | Trips | _[translate here]_ |
| `travel.trip.new` | New Trip | _[translate here]_ |
| `travel.trip.to` | Trip to | _[translate here]_ |
| `travel.segments` | Segments | _[translate here]_ |
| `common.actions` | Actions | _[translate here]_ |
| `travel.timeline.title` | Travel Timeline | _[translate here]_ |
| `travel.timeline.free_day` | Free day | _[translate here]_ |
| `travel.hub.title` | Search | _[translate here]_ |
| `travel.hub.needs_planning` | Suggestions | _[translate here]_ |
| `travel.hub.upcoming` | Upcoming | _[translate here]_ |
| `travel.hub.open_multicity` | Open multicity | _[translate here]_ |
| `travel.hub.plan_trip_cta` | Plan Trip | _[translate here]_ |
| `travel.error.same_route` | Origin and destination are the same | _[translate here]_ |
| `travel.error.return_before_depart` | Return is before departure | _[translate here]_ |
| `travel.segment.type` | Type | _[translate here]_ |
| `travel.segment.flight` | Flight | _[translate here]_ |
| `travel.segment.hotel` | Hotel | _[translate here]_ |
| `travel.segment.ground` | Ground | _[translate here]_ |
| `copy.manual.title` | Manual copy | _[translate here]_ |
| `copy.manual.desc` | Copy the text below if clipboard is blocked. | _[translate here]_ |
| `common.noResults` | No results | _[translate here]_ |
| `tripDetail.currency` | Currency | _[translate here]_ |
| `cost.category.flight` | Flight | _[translate here]_ |
| `cost.category.hotel` | Hotel | _[translate here]_ |
| `cost.category.ground` | Ground | _[translate here]_ |
| `cost.category.taxes` | Taxes | _[translate here]_ |
| `cost.category.fees` | Fees | _[translate here]_ |
| `cost.category.other` | Other | _[translate here]_ |
| `travel.workspace.placeholder` | Select a trip to see details or perform a search. | _[translate here]_ |
| `travel.open_in_provider` | Open in provider | _[translate here]_ |
| `common.loading` | Loading… | _[translate here]_ |
| `common.results` | results | _[translate here]_ |
| `travel.no_trips_yet` | No trips planned yet. Use the search to get started! | _[translate here]_ |
| `travel.provider` | Provider | _[translate here]_ |
| `provider.mock` | In-app (mock) | _[translate here]_ |
| `provider.google` | Google Flights | _[translate here]_ |
| `travel.alert.checkin` | Check-in opens in %s | _[translate here]_ |
| `travel.alert.priceDrop` | Price dropped by %s | _[translate here]_ |
| `travel.workspace.open` | Open Travel Workspace | _[translate here]_ |
| `travel.workspace.timeline` | Timeline view | _[translate here]_ |
| `travel.workspace.trip_builder.beta` | Trip Builder (beta) | _[translate here]_ |
| `common.list` | List | _[translate here]_ |
| `common.clear` | Clear | _[translate here]_ |
| `common.reset` | Reset | _[translate here]_ |
| `calendar.timeline` | Week | _[translate here]_ |
| `common.moved` | Moved | _[translate here]_ |
| `travel.drop.hint` | Drag to another day | _[translate here]_ |
| `travel.search.summary` | Search summary | _[translate here]_ |
| `travel.search.route` | {from} → {to} | _[translate here]_ |
| `travel.search.paxCabin` | {pax} pax · {cabin} | _[translate here]_ |
| `travel.results.countForDate` | {count} results for {date} | _[translate here]_ |
| `travel.compare.bestPrice` | Best price | _[translate here]_ |
| `travel.compare.bestTime` | Fastest | _[translate here]_ |
| `travel.compare.bestBalance` | Best balance | _[translate here]_ |
| `travel.co2.estimate` | ~{kg} kg CO₂ (est.) | _[translate here]_ |
| `travel.mobile.sticky.results` | Results | _[translate here]_ |
| `travel.mobile.sticky.compare` | Compare | _[translate here]_ |
| `travel.tooltips.flex` | Explore ± days around the selected date | _[translate here]_ |
| `travel.tooltips.nonstop` | Only show flights without stops | _[translate here]_ |
| `travel.tooltips.cabin` | Seat class preference | _[translate here]_ |
| `travel.move.prev` | Move to previous day | _[translate here]_ |
| `travel.move.next` | Move to next day | _[translate here]_ |
| `travel.rest.short` | Short rest before next show | _[translate here]_ |
| `travel.rest.same_day` | Same-day show risk | _[translate here]_ |
| `calendar.title` | Calendar | _[translate here]_ |
| `calendar.prev` | Previous month | _[translate here]_ |
| `calendar.next` | Next month | _[translate here]_ |
| `calendar.today` | Today | _[translate here]_ |
| `calendar.goto` | Go to date | _[translate here]_ |
| `calendar.more` | more | _[translate here]_ |
| `calendar.more.title` | More events | _[translate here]_ |
| `calendar.more.openDay` | Open day | _[translate here]_ |
| `calendar.more.openFullDay` | Open full day | _[translate here]_ |
| `calendar.announce.moved` | Moved show to {d} | _[translate here]_ |
| `calendar.announce.copied` | Duplicated show to {d} | _[translate here]_ |
| `calendar.quickAdd.hint` | Enter to add • Esc to cancel | _[translate here]_ |
| `calendar.quickAdd.advanced` | Advanced | _[translate here]_ |
| `calendar.quickAdd.simple` | Simple | _[translate here]_ |
| `calendar.quickAdd.placeholder` | City CC Fee (optional)… e.g., Madrid ES 12000 | _[translate here]_ |
| `calendar.quickAdd.recent` | Recent | _[translate here]_ |
| `calendar.quickAdd.parseError` | Can | _[translate here]_ |
| `calendar.quickAdd.countryMissing` | Add 2-letter country code | _[translate here]_ |
| `calendar.goto.hint` | Enter to go • Esc to close | _[translate here]_ |
| `calendar.view.switch` | Change calendar view | _[translate here]_ |
| `calendar.view.month` | Month | _[translate here]_ |
| `calendar.view.week` | Week | _[translate here]_ |
| `calendar.view.day` | Day | _[translate here]_ |
| `calendar.view.agenda` | Agenda | _[translate here]_ |
| `calendar.view.announce` | {v} view | _[translate here]_ |
| `calendar.timezone` | Time zone | _[translate here]_ |
| `calendar.tz.local` | Local | _[translate here]_ |
| `calendar.tz.localLabel` | Local | _[translate here]_ |
| `calendar.tz.changed` | Time zone set to {tz} | _[translate here]_ |
| `calendar.goto.shortcut` | ⌘/Ctrl + G | _[translate here]_ |
| `calendar.shortcut.pgUp` | PgUp / Alt+← | _[translate here]_ |
| `calendar.shortcut.pgDn` | PgDn / Alt+→ | _[translate here]_ |
| `calendar.shortcut.today` | T | _[translate here]_ |
| `common.move` | Move | _[translate here]_ |
| `common.copy` | Copy | _[translate here]_ |
| `calendar.more.filter` | Filter events | _[translate here]_ |
| `calendar.more.empty` | No results | _[translate here]_ |
| `calendar.kb.hint` | Keyboard: Arrow keys move day, PageUp/PageDown change month, T go to today, Enter or Space select day. | _[translate here]_ |
| `calendar.day.select` | Selected {d} | _[translate here]_ |
| `calendar.day.focus` | Focused {d} | _[translate here]_ |
| `calendar.noEvents` | No events for this day | _[translate here]_ |
| `calendar.show.shows` | Shows | _[translate here]_ |
| `calendar.show.travel` | Travel | _[translate here]_ |
| `calendar.kind` | Kind | _[translate here]_ |
| `calendar.kind.show` | Show | _[translate here]_ |
| `calendar.kind.travel` | Travel | _[translate here]_ |
| `calendar.status` | Status | _[translate here]_ |
| `calendar.dnd.enter` | Drop here to place event on {d} | _[translate here]_ |
| `calendar.dnd.leave` | Leaving drop target | _[translate here]_ |
| `calendar.kbdDnD.marked` | Marked {d} as origin. Use Enter on target day to drop. Hold Ctrl/Cmd to copy. | _[translate here]_ |
| `calendar.kbdDnD.cancel` | Cancelled move/copy mode | _[translate here]_ |
| `calendar.kbdDnD.origin` | Origin (keyboard move/copy active) | _[translate here]_ |
| `calendar.kbdDnD.none` | No show to move from selected origin | _[translate here]_ |
| `calendar.weekStart` | Week starts on | _[translate here]_ |
| `calendar.weekStart.mon` | Mon | _[translate here]_ |
| `calendar.weekStart.sun` | Sun | _[translate here]_ |
| `calendar.import` | Import | _[translate here]_ |
| `calendar.import.ics` | Import .ics | _[translate here]_ |
| `calendar.import.done` | Imported {n} events | _[translate here]_ |
| `calendar.import.error` | Failed to import .ics | _[translate here]_ |
| `calendar.wd.mon` | Mon | _[translate here]_ |
| `calendar.wd.tue` | Tue | _[translate here]_ |
| `calendar.wd.wed` | Wed | _[translate here]_ |
| `calendar.wd.thu` | Thu | _[translate here]_ |
| `calendar.wd.fri` | Fri | _[translate here]_ |
| `calendar.wd.sat` | Sat | _[translate here]_ |
| `calendar.wd.sun` | Sun | _[translate here]_ |
| `shows.costs.type` | Type | _[translate here]_ |
| `shows.costs.placeholder` | Travel / Production / Marketing | _[translate here]_ |
| `shows.costs.amount` | Amount | _[translate here]_ |
| `shows.costs.desc` | Description | _[translate here]_ |
| `common.optional` | Optional | _[translate here]_ |
| `common.add` | Add | _[translate here]_ |
| `common.income` | Income | _[translate here]_ |
| `common.wht` | WHT | _[translate here]_ |
| `common.commissions` | Commissions | _[translate here]_ |
| `common.net` | Net | _[translate here]_ |
| `common.costs` | Costs | _[translate here]_ |
| `common.total` | Total | _[translate here]_ |
| `shows.promote` | Promote | _[translate here]_ |
| `shows.editor.status.promote` | Promoted to | _[translate here]_ |
| `shows.margin.tooltip` | Net divided by Fee (%) | _[translate here]_ |
| `shows.empty` | No shows match your filters | _[translate here]_ |
| `shows.empty.add` | Add your first show | _[translate here]_ |
| `shows.export.csv.success` | CSV exported ✓ | _[translate here]_ |
| `shows.export.xlsx.success` | XLSX exported ✓ | _[translate here]_ |
| `shows.sort.tooltip` | Sort by column | _[translate here]_ |
| `shows.filters.statusGroup` | Status filters | _[translate here]_ |
| `shows.relative.inDays` | In {n} days | _[translate here]_ |
| `shows.relative.daysAgo` | {n} days ago | _[translate here]_ |
| `shows.relative.yesterday` | Yesterday | _[translate here]_ |
| `shows.row.menu` | Row actions | _[translate here]_ |
| `shows.action.edit` | Edit | _[translate here]_ |
| `shows.action.promote` | Promote | _[translate here]_ |
| `shows.action.duplicate` | Duplicate | _[translate here]_ |
| `shows.action.archive` | Archive | _[translate here]_ |
| `shows.action.delete` | Delete | _[translate here]_ |
| `shows.action.restore` | Restore | _[translate here]_ |
| `shows.board.header.net` | Net | _[translate here]_ |
| `shows.board.header.count` | Shows | _[translate here]_ |
| `shows.datePreset.thisMonth` | This Month | _[translate here]_ |
| `shows.datePreset.nextMonth` | Next Month | _[translate here]_ |
| `shows.columns.config` | Columns | _[translate here]_ |
| `shows.columns.wht` | WHT % | _[translate here]_ |
| `shows.totals.pin` | Pin totals | _[translate here]_ |
| `shows.totals.unpin` | Unpin totals | _[translate here]_ |
| `shows.totals.avgFee` | Avg Fee | _[translate here]_ |
| `shows.totals.avgFee.tooltip` | Average fee per show | _[translate here]_ |
| `shows.totals.avgMargin` | Avg Margin % | _[translate here]_ |
| `shows.totals.avgMargin.tooltip` | Average margin % across shows with fee | _[translate here]_ |
| `shows.wht.hide` | Hide WHT column | _[translate here]_ |
| `shows.sort.aria.sortedDesc` | Sorted descending | _[translate here]_ |
| `shows.sort.aria.sortedAsc` | Sorted ascending | _[translate here]_ |
| `shows.sort.aria.notSorted` | Not sorted | _[translate here]_ |
| `shows.sort.aria.activateDesc` | Activate to sort descending | _[translate here]_ |
| `shows.sort.aria.activateAsc` | Activate to sort ascending | _[translate here]_ |
| `nav.overview` | Overview | _[translate here]_ |
| `nav.clients` | Clients | _[translate here]_ |
| `nav.teams` | Teams | _[translate here]_ |
| `nav.links` | Links | _[translate here]_ |
| `nav.reports` | Reports | _[translate here]_ |
| `nav.documents` | Documents | _[translate here]_ |
| `nav.integrations` | Integrations | _[translate here]_ |
| `nav.billing` | Billing | _[translate here]_ |
| `nav.branding` | Branding | _[translate here]_ |
| `nav.connections` | Connections | _[translate here]_ |
| `org.overview.title` | Organization Overview | _[translate here]_ |
| `org.overview.subtitle.agency` | KPIs by client, tasks, and active links | _[translate here]_ |
| `org.overview.subtitle.artist` | Upcoming shows and travel, monthly KPIs | _[translate here]_ |
| `org.members.title` | Members | _[translate here]_ |
| `members.invite` | Invite | _[translate here]_ |
| `members.seats.usage` | Seat usage: 5/5 internal, 0/5 guests | _[translate here]_ |
| `org.clients.title` | Clients | _[translate here]_ |
| `org.teams.title` | Teams | _[translate here]_ |
| `org.links.title` | Links | _[translate here]_ |
| `org.branding.title` | Branding | _[translate here]_ |
| `org.documents.title` | Documents | _[translate here]_ |
| `org.reports.title` | Reports | _[translate here]_ |
| `org.integrations.title` | Integrations | _[translate here]_ |
| `org.billing.title` | Billing | _[translate here]_ |
| `labels.seats.used` | Seats used | _[translate here]_ |
| `labels.seats.guests` | Guests | _[translate here]_ |
| `export.options` | Export options | _[translate here]_ |
| `export.columns` | Columns | _[translate here]_ |
| `export.csv` | CSV | _[translate here]_ |
| `export.xlsx` | XLSX | _[translate here]_ |
| `common.exporting` | Exporting… | _[translate here]_ |
| `charts.viewTable` | View data as table | _[translate here]_ |
| `charts.hideTable` | Hide table | _[translate here]_ |
| `finance.period.mtd` | MTD | _[translate here]_ |
| `finance.period.lastMonth` | Last month | _[translate here]_ |
| `finance.period.ytd` | YTD | _[translate here]_ |
| `finance.period.custom` | Custom | _[translate here]_ |
| `finance.period.closed` | Closed | _[translate here]_ |
| `finance.period.open` | Open | _[translate here]_ |
| `finance.closeMonth` | Close Month | _[translate here]_ |
| `finance.reopenMonth` | Reopen Month | _[translate here]_ |
| `finance.closed.help` | Month is closed. Reopen to make changes. | _[translate here]_ |
| `finance.kpi.mtdNet` | MTD Net | _[translate here]_ |
| `finance.kpi.ytdNet` | YTD Net | _[translate here]_ |
| `finance.kpi.forecastEom` | Forecast EOM | _[translate here]_ |
| `finance.kpi.deltaTarget` | Δ vs Target | _[translate here]_ |
| `finance.kpi.gm` | GM% | _[translate here]_ |
| `finance.kpi.dso` | DSO | _[translate here]_ |
| `finance.comparePrev` | Compare vs previous | _[translate here]_ |
| `finance.export.csv.success` | CSV exported ✓ | _[translate here]_ |
| `finance.export.xlsx.success` | XLSX exported ✓ | _[translate here]_ |
| `finance.v2.footer` | AR top debtors and row actions coming next. | _[translate here]_ |
| `finance.pl.caption` | Profit and Loss ledger. Use column headers to sort. Virtualized list shows a subset of rows. | _[translate here]_ |
| `common.rowsVisible` | Rows visible | _[translate here]_ |
| `finance.whtPct` | WHT % | _[translate here]_ |
| `finance.wht` | WHT | _[translate here]_ |
| `finance.mgmtPct` | Mgmt % | _[translate here]_ |
| `finance.bookingPct` | Booking % | _[translate here]_ |
| `finance.breakdown.by` | Breakdown by | _[translate here]_ |
| `finance.breakdown.empty` | No breakdown available | _[translate here]_ |
| `finance.delta` | Δ | _[translate here]_ |
| `finance.deltaVsPrev` | Δ vs prev | _[translate here]_ |
| `common.comingSoon` | Coming soon | _[translate here]_ |
| `finance.expected` | Expected (stage-weighted) | _[translate here]_ |
| `finance.ar.title` | AR aging & top debtors | _[translate here]_ |
| `common.moreActions` | More actions | _[translate here]_ |
| `actions.copyRow` | Copy row | _[translate here]_ |
| `actions.exportRowCsv` | Export row (CSV) | _[translate here]_ |
| `actions.goToShow` | Go to show | _[translate here]_ |
| `actions.openCosts` | Open costs | _[translate here]_ |
| `shows.table.route` | Route | _[translate here]_ |
| `finance.targets.title` | Targets | _[translate here]_ |
| `finance.targets.revenue` | Revenue target | _[translate here]_ |
| `finance.targets.net` | Net target | _[translate here]_ |
| `finance.targets.hint` | Targets are local to this device for now. | _[translate here]_ |
| `finance.targets.noNegative` | Targets cannot be negative | _[translate here]_ |
| `filters.title` | Filters | _[translate here]_ |
| `filters.region` | Region | _[translate here]_ |
| `filters.from` | From | _[translate here]_ |
| `filters.to` | To | _[translate here]_ |
| `filters.currency` | Currency | _[translate here]_ |
| `filters.presentation` | Presentation mode | _[translate here]_ |
| `filters.shortcutHint` | Ctrl/Cmd+K – open filters | _[translate here]_ |
| `filters.appliedRange` | Applied range | _[translate here]_ |
| `layout.team` | Team | _[translate here]_ |
| `layout.highContrast` | High Contrast | _[translate here]_ |
| `layout.tenant` | Tenant | _[translate here]_ |
| `access.readOnly` | read-only | _[translate here]_ |
| `layout.viewingAs` | Viewing as | _[translate here]_ |
| `layout.viewAsExit` | Exit | _[translate here]_ |
| `access.readOnly.tooltip` | Finance exports disabled for agency demo | _[translate here]_ |
| `lab.drag` | Drag | _[translate here]_ |
| `lab.moveUp` | Move up | _[translate here]_ |
| `lab.moveDown` | Move down | _[translate here]_ |
| `lab.reset` | Reset to template | _[translate here]_ |
| `lab.back` | Back to Dashboard | _[translate here]_ |
| `lab.layoutName` | Layout name | _[translate here]_ |
| `lab.save` | Save layout | _[translate here]_ |
| `lab.apply` | Apply… | _[translate here]_ |
| `lab.delete` | Delete… | _[translate here]_ |
| `lab.export` | Export | _[translate here]_ |
| `lab.import` | Import | _[translate here]_ |
| `lab.dropHere` | Drop widgets here | _[translate here]_ |
| `lab.header` | Mission Control Lab | _[translate here]_ |
| `lab.subheader` | Drag, reorder, and resize dashboard widgets. Experimental. | _[translate here]_ |
| `lab.template` | Template | _[translate here]_ |
| `lab.resetToTemplate` | Reset to template | _[translate here]_ |
| `lab.backToDashboard` | Back to Dashboard | _[translate here]_ |
| `lab.applySaved` | Apply… | _[translate here]_ |
| `lab.deleteSaved` | Delete… | _[translate here]_ |
| `dashboard.title` | Tour Command Center | _[translate here]_ |
| `dashboard.subtitle` | Monitor your tour performance, mission status, and take action on what matters most | _[translate here]_ |
| `dashboard.map.title` | Tour Map | _[translate here]_ |
| `dashboard.activity.title` | Recent Activity | _[translate here]_ |
| `dashboard.actions.title` | Quick Actions | _[translate here]_ |
| `dashboard.actions.newShow` | Add New Show | _[translate here]_ |
| `dashboard.actions.quickFinance` | Quick Finance Check | _[translate here]_ |
| `dashboard.actions.travelBooking` | Book Travel | _[translate here]_ |
| `dashboard.areas.finance.title` | Finance | _[translate here]_ |
| `dashboard.areas.finance.description` | Track revenue, costs, and profitability | _[translate here]_ |
| `dashboard.areas.shows.title` | Shows & Events | _[translate here]_ |
| `dashboard.areas.shows.description` | Manage performances and venues | _[translate here]_ |
| `dashboard.areas.travel.title` | Travel & Logistics | _[translate here]_ |
| `dashboard.areas.travel.description` | Plan and track travel arrangements | _[translate here]_ |
| `dashboard.areas.missionControl.title` | Mission Control Lab | _[translate here]_ |
| `dashboard.areas.missionControl.description` | Advanced mission control with customizable widgets | _[translate here]_ |
| `dashboard.kpi.financialHealth` | Financial Health | _[translate here]_ |
| `dashboard.kpi.nextEvent` | Next Critical Event | _[translate here]_ |
| `dashboard.kpi.ticketSales` | Ticket Sales | _[translate here]_ |
| `actions.toast.export` | Export copied | _[translate here]_ |
| `actions.import.prompt` | Paste Lab layouts JSON | _[translate here]_ |
| `actions.toast.imported` | Imported | _[translate here]_ |
| `actions.toast.import_invalid` | Invalid JSON | _[translate here]_ |
| `actions.newArtist` | New artist | _[translate here]_ |
| `actions.connectExisting` | Connect existing | _[translate here]_ |
| `actions.editScopes` | Edit scopes | _[translate here]_ |
| `actions.revoke` | Revoke | _[translate here]_ |
| `actions.exportPdf` | Export PDF | _[translate here]_ |
| `branding.uploadLogo` | Upload logo | _[translate here]_ |
| `branding.editColors` | Edit colors | _[translate here]_ |
| `common.upload` | Upload | _[translate here]_ |
| `common.newFolder` | New folder | _[translate here]_ |
| `live.up` | up | _[translate here]_ |
| `live.down` | down | _[translate here]_ |
| `live.flat` | flat | _[translate here]_ |
| `nav.profile` | Profile | _[translate here]_ |
| `nav.changeOrg` | Change organization | _[translate here]_ |
| `nav.logout` | Logout | _[translate here]_ |
| `profile.title` | Profile | _[translate here]_ |
| `profile.personal` | Personal | _[translate here]_ |
| `profile.security` | Security | _[translate here]_ |
| `profile.notifications` | Notifications | _[translate here]_ |
| `profile.save` | Save | _[translate here]_ |
| `profile.saved` | Saved ✓ | _[translate here]_ |
| `profile.avatarUrl` | Avatar URL | _[translate here]_ |
| `profile.bio` | Bio | _[translate here]_ |
| `profile.notify.email` | Email updates | _[translate here]_ |
| `profile.notify.slack` | Slack notifications | _[translate here]_ |
| `profile.notify.hint` | These preferences affect demo notifications only | _[translate here]_ |
| `profile.memberships` | Memberships | _[translate here]_ |
| `profile.defaultOrg` | Default organization | _[translate here]_ |
| `profile.setDefault` | Set default | _[translate here]_ |
| `profile.dataPrivacy` | Data & privacy | _[translate here]_ |
| `profile.exportData` | Export my demo data | _[translate here]_ |
| `profile.clearData` | Clear and reseed demo data | _[translate here]_ |
| `profile.export.ready` | Data export ready | _[translate here]_ |
| `profile.error.name` | Name is required | _[translate here]_ |
| `profile.error.email` | Email is required | _[translate here]_ |
| `prefs.title` | Preferences | _[translate here]_ |
| `prefs.appearance` | Appearance | _[translate here]_ |
| `prefs.language` | Language | _[translate here]_ |
| `prefs.theme` | Theme | _[translate here]_ |
| `prefs.highContrast` | High contrast | _[translate here]_ |
| `prefs.finance.currency` | Currency | _[translate here]_ |
| `prefs.units` | Distance units | _[translate here]_ |
| `prefs.presentation` | Presentation mode | _[translate here]_ |
| `prefs.comparePrev` | Compare vs previous | _[translate here]_ |
| `prefs.defaultRegion` | Default region | _[translate here]_ |
| `prefs.defaultStatuses` | Default statuses | _[translate here]_ |
| `prefs.help.language` | Affects labels and date/number formatting. | _[translate here]_ |
| `prefs.help.theme` | Choose light or dark based on your environment. | _[translate here]_ |
| `prefs.help.highContrast` | Improves contrast and focus rings for readability. | _[translate here]_ |
| `prefs.help.currency` | Sets default currency for dashboards and exports. | _[translate here]_ |
| `prefs.help.units` | Used for travel distances and map overlays. | _[translate here]_ |
| `prefs.help.presentation` | Larger text, simplified animations for demos. | _[translate here]_ |
| `prefs.help.comparePrev` | Shows deltas against the previous period. | _[translate here]_ |
| `prefs.help.region` | Preselects region filters in dashboards. | _[translate here]_ |
| `subnav.ariaLabel` | Sections | _[translate here]_ |
| `breadcrumb.home` | Home | _[translate here]_ |
| `home.seo.title` | On Tour App - Tour Management & Finance Dashboard | _[translate here]_ |
| `home.seo.description` | Professional tour management platform with real-time finance tracking, venue booking, and performance analytics for artists and managers. | _[translate here]_ |
| `home.seo.keywords` | tour management, concert booking, artist finance, venue management, performance analytics, live music | _[translate here]_ |
| `comparison.title` | From Spreadsheet Chaos to App Clarity | _[translate here]_ |
| `comparison.subtitle` | See how your tour management evolves from fragmented Excel files to a unified, intelligent platform. | _[translate here]_ |
| `comparison.excel.title` | Excel Chaos | _[translate here]_ |
| `comparison.excel.problem1` | Scattered files across devices and emails | _[translate here]_ |
| `comparison.excel.problem2` | Manual calculations prone to errors | _[translate here]_ |
| `comparison.excel.problem3` | No real-time collaboration or notifications | _[translate here]_ |
| `comparison.excel.problem4` | Lost context in endless tabs and comments | _[translate here]_ |
| `comparison.app.title` | App Clarity | _[translate here]_ |
| `comparison.app.benefit1` | Unified dashboard with live data sync | _[translate here]_ |
| `comparison.app.benefit2` | Automated calculations and error detection | _[translate here]_ |
| `comparison.app.benefit3` | Real-time collaboration and smart notifications | _[translate here]_ |
| `comparison.app.benefit4` | Context-aware insights and predictive alerts | _[translate here]_ |
| `comparison.benefit1.title` | Smart Finance Tracking | _[translate here]_ |
| `comparison.benefit1.desc` | Automatic profit calculations, cost analysis, and budget alerts. | _[translate here]_ |
| `comparison.benefit2.title` | Live Tour Mapping | _[translate here]_ |
| `comparison.benefit2.desc` | Interactive maps with route optimization and venue intelligence. | _[translate here]_ |
| `comparison.benefit3.title` | Instant Insights | _[translate here]_ |
| `comparison.benefit3.desc` | AI-powered recommendations and risk detection in real-time. | _[translate here]_ |
| `metamorphosis.title` | From scattered noise to a living control panel | _[translate here]_ |
| `metamorphosis.subtitle` | Instead of spreadsheets mutating chaotically and critical context buried in comments, every data point flows into a single orchestrated surface. The system reconciles, validates, and highlights what matters. | _[translate here]_ |
| `dashboard.offerConfirmed` | Offer → Confirmed | _[translate here]_ |
| `dashboard.tourHealthScore` | Tour Health Score | _[translate here]_ |
| `dashboard.healthFactors` | Health Factors | _[translate here]_ |
| `dashboard.keyInsights` | Key Insights | _[translate here]_ |
| `dashboard.confidence` | Confidence | _[translate here]_ |
| `dashboard.current` | Current | _[translate here]_ |
| `dashboard.predicted` | Predicted | _[translate here]_ |
| `dashboard.expectedChange` | Expected change | _[translate here]_ |
| `dashboard.scheduleGap` | Schedule gap | _[translate here]_ |
| `dashboard.allSystemsReady` | All systems ready | _[translate here]_ |
| `dashboard.loadingMap` | Loading map… | _[translate here]_ |
| `placeholder.username` | you@example.com or username | _[translate here]_ |
| `placeholder.bio` | Tell us a bit about yourself and what you do... | _[translate here]_ |
| `placeholder.cityName` | Enter city name... | _[translate here]_ |
| `placeholder.notes` | Add any additional notes... | _[translate here]_ |
| `placeholder.searchCommand` | Search shows, navigate, or type a command... | _[translate here]_ |
| `placeholder.expenseDescription` | e.g., Flight tickets, Hotel booking... | _[translate here]_ |
| `placeholder.expenseDetails` | Add any additional details, invoice numbers, or context... | _[translate here]_ |
| `placeholder.origin` | Origin (e.g., BCN) | _[translate here]_ |
| `placeholder.destination` | Destination (e.g., AMS) | _[translate here]_ |
| `placeholder.bookingRef` | Booking reference or flight number | _[translate here]_ |
| `placeholder.airport` | City or airport... | _[translate here]_ |

## DE - 1155 Missing Translations

**Translation guidelines:**
- Keep technical terms consistent (e.g., "show", "fee", "status")
- Match tone: professional but friendly
- Consider context: these appear in UI buttons, labels, and messages
- Preserve placeholders: `{name}`, `{count}`, etc.

### Quick Copy Format (for src/lib/i18n.ts)

```typescript
    , 'scopes.tooltip.shows': '' // TODO: translate "Shows access granted by link"
    , 'scopes.tooltip.travel': '' // TODO: translate "Travel access granted by link"
    , 'scopes.tooltip.finance': '' // TODO: translate "Finance: read-only per link policy"
    , 'kpi.shows': '' // TODO: translate "Shows"
    , 'kpi.net': '' // TODO: translate "Net"
    , 'kpi.travel': '' // TODO: translate "Travel"
    , 'cmd.go.profile': '' // TODO: translate "Go to profile"
    , 'cmd.go.preferences': '' // TODO: translate "Go to preferences"
    , 'common.copyLink': '' // TODO: translate "Copy link"
    , 'common.learnMore': '' // TODO: translate "Learn more"
    , 'insights.thisMonthTotal': '' // TODO: translate "This Month Total"
    , 'insights.statusBreakdown': '' // TODO: translate "Status breakdown"
    , 'insights.upcoming14d': '' // TODO: translate "Upcoming 14d"
    , 'common.openShow': '' // TODO: translate "Open show"
    , 'common.centerMap': '' // TODO: translate "Center map"
    , 'common.dismiss': '' // TODO: translate "Dismiss"
    , 'common.snooze7': '' // TODO: translate "Snooze 7 days"
    , 'common.snooze30': '' // TODO: translate "Snooze 30 days"
    , 'common.on': '' // TODO: translate "on"
    , 'common.off': '' // TODO: translate "off"
    , 'common.hide': '' // TODO: translate "Hide"
    , 'common.pin': '' // TODO: translate "Pin"
    , 'common.unpin': '' // TODO: translate "Unpin"
    , 'common.map': '' // TODO: translate "Map"
    , 'layout.invite': '' // TODO: translate "Invite"
    , 'layout.build': '' // TODO: translate "Build: preview"
    , 'layout.demo': '' // TODO: translate "Status: demo feed"
    , 'alerts.title': '' // TODO: translate "Alert Center"
    , 'alerts.anySeverity': '' // TODO: translate "Any severity"
    , 'alerts.anyRegion': '' // TODO: translate "Any region"
    , 'alerts.anyTeam': '' // TODO: translate "Any team"
    , 'alerts.copySlack': '' // TODO: translate "Copy Slack"
    , 'alerts.copied': '' // TODO: translate "Copied \u2713"
    , 'alerts.noAlerts': '' // TODO: translate "No alerts"
    , 'map.openInDashboard': '' // TODO: translate "Open in dashboard"
    , 'auth.login': '' // TODO: translate "Login"
    , 'auth.chooseUser': '' // TODO: translate "Choose a demo user"
    , 'auth.enterAs': '' // TODO: translate "Enter as {name}"
    , 'auth.role.owner': '' // TODO: translate "Artist (Owner)"
    , 'auth.role.agencyManager': '' // TODO: translate "Agency Manager"
    , 'auth.role.artistManager': '' // TODO: translate "Artist Team (Manager)"
    , 'auth.scope.finance.ro': '' // TODO: translate "Finance: read-only"
    , 'auth.scope.edit.showsTravel': '' // TODO: translate "Edit shows/travel"
    , 'auth.scope.full': '' // TODO: translate "Full access"
    , 'login.title': '' // TODO: translate "Welcome to On Tour"
    , 'login.subtitle': '' // TODO: translate "Your tour management command center"
    , 'login.enterAs': '' // TODO: translate "Enter as {name}"
    , 'login.quick.agency': '' // TODO: translate "Enter as Shalizi (agency)"
    , 'login.quick.artist': '' // TODO: translate "Enter as Danny (artist)"
    , 'login.remember': '' // TODO: translate "Remember me"
    , 'login.usernameOrEmail': '' // TODO: translate "Username or Email"
    , 'role.agencyManager': '' // TODO: translate "Agency Manager"
    , 'role.artistOwner': '' // TODO: translate "Artist (Owner)"
    , 'role.artistManager': '' // TODO: translate "Artist Team (Manager)"
    , 'scope.shows.write': '' // TODO: translate "shows: write"
    , 'scope.shows.read': '' // TODO: translate "shows: read"
    , 'scope.travel.book': '' // TODO: translate "travel: book"
    , 'scope.travel.read': '' // TODO: translate "travel: read"
    , 'scope.finance.read': '' // TODO: translate "finance: read"
    , 'scope.finance.none': '' // TODO: translate "finance: none"
    , 'hero.enter': '' // TODO: translate "Enter"
    , 'marketing.nav.features': '' // TODO: translate "Features"
    , 'marketing.nav.product': '' // TODO: translate "Product"
    , 'marketing.nav.pricing': '' // TODO: translate "Pricing"
    , 'marketing.nav.testimonials': '' // TODO: translate "Testimonials"
    , 'marketing.nav.cta': '' // TODO: translate "Get started"
    , 'marketing.cta.primary': '' // TODO: translate "Start free"
    , 'marketing.cta.secondary': '' // TODO: translate "Watch demo"
    , 'marketing.cta.login': '' // TODO: translate "Log in"
    , 'hero.demo.artist': '' // TODO: translate "View demo as Danny"
    , 'hero.demo.agency': '' // TODO: translate "View demo as Adam"
    , 'hero.persona.question': '' // TODO: translate "I am a..."
    , 'hero.persona.artist': '' // TODO: translate "Artist / Manager"
    , 'hero.persona.agency': '' // TODO: translate "Agency"
    , 'hero.subtitle.artist': '' // TODO: translate "Take control of your finances and tour logistics. See your career from a single dashboard."
    , 'hero.subtitle.agency': '' // TODO: translate "Manage your entire roster from one place. Give your artists visibility and generate reports in seconds."
    , 'home.action.title': '' // TODO: translate "Stop Surviving. Start Commanding."
    , 'home.action.subtitle': '' // TODO: translate "See how On Tour App can transform your next tour."
    , 'home.action.cta': '' // TODO: translate "Request a Personalized Demo"
    , 'inside.map.desc.artist': '' // TODO: translate "Visualize your tour route and anticipate travel needs"
    , 'inside.finance.desc.artist': '' // TODO: translate "Track your earnings, expenses and profitability in real-time"
    , 'inside.actions.desc.artist': '' // TODO: translate "Stay on top of contracts, payments and upcoming deadlines"
    , 'inside.map.desc.agency': '' // TODO: translate "Monitor all your artists\"
    , 'inside.finance.desc.agency': '' // TODO: translate "Consolidated financial overview across your entire roster"
    , 'inside.actions.desc.agency': '' // TODO: translate "Centralized task management for team coordination and client updates"
    , 'inside.title': '' // TODO: translate "What you"
    , 'shows.summary.avgFee': '' // TODO: translate "Avg Fee"
    , 'shows.summary.avgMargin': '' // TODO: translate "Avg Margin"
    , 'inside.map.title': '' // TODO: translate "Map"
    , 'inside.map.desc': '' // TODO: translate "Live HUD with shows, route and risks"
    , 'inside.finance.title': '' // TODO: translate "Finance"
    , 'inside.finance.desc': '' // TODO: translate "Monthly KPIs, pipeline and forecast"
    , 'inside.actions.title': '' // TODO: translate "Actions"
    , 'inside.actions.desc': '' // TODO: translate "Action Hub with priorities and shortcuts"
    , 'how.title': '' // TODO: translate "How it works"
    , 'how.step.invite': '' // TODO: translate "Invite your team"
    , 'how.step.connect': '' // TODO: translate "Connect with artists or agencies"
    , 'how.step.views': '' // TODO: translate "Work by views: HUD, Finance, Shows"
    , 'how.step.connectData': '' // TODO: translate "Connect your data"
    , 'how.step.connectData.desc': '' // TODO: translate "Import shows, connect calendar, or get invited by your agency"
    , 'how.step.visualize': '' // TODO: translate "Visualize your world"
    , 'how.step.visualize.desc': '' // TODO: translate "Your tour comes alive on the map, finances clarify in the dashboard"
    , 'how.step.act': '' // TODO: translate "Act with intelligence"
    , 'how.step.connectData.artist': '' // TODO: translate "Import your shows, connect your calendar, or get invited by your agency. Your tour data in one place."
    , 'how.step.connectData.agency': '' // TODO: translate "Invite your artists and connect their data. Centralize all tour information across your roster."
    , 'how.step.visualize.artist': '' // TODO: translate "Your tour comes alive on the map, finances clarify in your personal dashboard. See your career at a glance."
    , 'how.step.visualize.agency': '' // TODO: translate "Monitor all artists\"
    , 'how.step.act.artist': '' // TODO: translate "Receive proactive alerts about contracts, payments, and deadlines. Make data-driven decisions with confidence."
    , 'how.step.act.agency': '' // TODO: translate "Prioritize team tasks, generate reports instantly, and keep all stakeholders informed with real-time updates."
    , 'how.multiTenant': '' // TODO: translate "Multi-tenant demo: switch between Agency and Artist contexts"
    , 'trust.privacy': '' // TODO: translate "Privacy: local demo (your browser)"
    , 'trust.accessibility': '' // TODO: translate "Accessibility: shortcuts “?”"
    , 'trust.support': '' // TODO: translate "Support"
    , 'trust.demo': '' // TODO: translate "Local demo — no data uploaded"
    , 'testimonials.title': '' // TODO: translate "Trusted by Industry Leaders"
    , 'testimonials.subtitle': '' // TODO: translate "Real stories from the touring industry"
    , 'testimonials.subtitle.artist': '' // TODO: translate "See how artists are taking control of their careers"
    , 'testimonials.subtitle.agency': '' // TODO: translate "Discover how agencies are transforming their operations"
    , 'common.skipToContent': '' // TODO: translate "Skip to content"
    , 'alerts.slackCopied': '' // TODO: translate "Slack payload copied"
    , 'alerts.copyManual': '' // TODO: translate "Open window to copy manually"
    , 'ah.title': '' // TODO: translate "Action Hub"
    , 'ah.tab.pending': '' // TODO: translate "Pending"
    , 'ah.tab.shows': '' // TODO: translate "This Month"
    , 'ah.tab.travel': '' // TODO: translate "Travel"
    , 'ah.tab.insights': '' // TODO: translate "Insights"
    , 'ah.filter.all': '' // TODO: translate "All"
    , 'ah.filter.risk': '' // TODO: translate "Risk"
    , 'ah.filter.urgency': '' // TODO: translate "Urgency"
    , 'ah.filter.opportunity': '' // TODO: translate "Opportunity"
    , 'ah.filter.offer': '' // TODO: translate "Offer"
    , 'ah.filter.finrisk': '' // TODO: translate "Finrisk"
    , 'ah.cta.addTravel': '' // TODO: translate "Add travel"
    , 'ah.cta.followUp': '' // TODO: translate "Follow up"
    , 'ah.cta.review': '' // TODO: translate "Review"
    , 'ah.cta.open': '' // TODO: translate "Open"
    , 'ah.empty': '' // TODO: translate "All caught up!"
    , 'ah.openTravel': '' // TODO: translate "Open Travel"
    , 'ah.done': '' // TODO: translate "Done"
    , 'ah.typeFilter': '' // TODO: translate "Type filter"
    , 'ah.why': '' // TODO: translate "Why?"
    , 'ah.why.title': '' // TODO: translate "Why this priority?"
    , 'ah.why.score': '' // TODO: translate "Score"
    , 'ah.why.impact': '' // TODO: translate "Impact"
    , 'ah.why.amount': '' // TODO: translate "Amount"
    , 'ah.why.inDays': '' // TODO: translate "In"
    , 'ah.why.overdue': '' // TODO: translate "Overdue"
    , 'ah.why.kind': '' // TODO: translate "Type"
    , 'finance.quicklook': '' // TODO: translate "Finance Quicklook"
    , 'finance.ledger': '' // TODO: translate "Ledger"
    , 'finance.targets': '' // TODO: translate "Targets"
    , 'finance.targets.month': '' // TODO: translate "Monthly targets"
    , 'finance.targets.year': '' // TODO: translate "Yearly targets"
    , 'finance.pipeline': '' // TODO: translate "Pipeline"
    , 'finance.pipeline.subtitle': '' // TODO: translate "Expected value (weighted by stage)"
    , 'finance.openFull': '' // TODO: translate "Open full finance"
    , 'finance.pivot': '' // TODO: translate "Pivot"
    , 'finance.pivot.group': '' // TODO: translate "Group"
    , 'finance.ar.view': '' // TODO: translate "View"
    , 'finance.ar.remind': '' // TODO: translate "Remind"
    , 'finance.ar.reminder.queued': '' // TODO: translate "Reminder queued"
    , 'finance.thisMonth': '' // TODO: translate "This Month"
    , 'finance.income': '' // TODO: translate "Income"
    , 'finance.expenses': '' // TODO: translate "Expenses"
    , 'finance.net': '' // TODO: translate "Net"
    , 'finance.byStatus': '' // TODO: translate "By status"
    , 'finance.byMonth': '' // TODO: translate "by month"
    , 'finance.confirmed': '' // TODO: translate "Confirmed"
    , 'finance.pending': '' // TODO: translate "Pending"
    , 'finance.compare': '' // TODO: translate "Compare prev"
    , 'charts.resetZoom': '' // TODO: translate "Reset zoom"
    , 'common.current': '' // TODO: translate "Current"
    , 'common.compare': '' // TODO: translate "Compare"
    , 'common.reminder': '' // TODO: translate "Reminder"
    , 'finance.ui.view': '' // TODO: translate "View"
    , 'finance.ui.classic': '' // TODO: translate "Classic"
    , 'finance.ui.beta': '' // TODO: translate "New (beta)"
    , 'finance.offer': '' // TODO: translate "Offer"
    , 'finance.shows': '' // TODO: translate "shows"
    , 'finance.noShowsMonth': '' // TODO: translate "No shows this month"
    , 'finance.hideAmounts': '' // TODO: translate "Hide amounts"
    , 'finance.hidden': '' // TODO: translate "Hidden"
    , 'common.open': '' // TODO: translate "Open"
    , 'common.apply': '' // TODO: translate "Apply"
    , 'common.saveView': '' // TODO: translate "Save view"
    , 'common.import': '' // TODO: translate "Import"
    , 'common.export': '' // TODO: translate "Export"
    , 'common.copied': '' // TODO: translate "Copied ✓"
    , 'common.markDone': '' // TODO: translate "Mark done"
    , 'common.hideItem': '' // TODO: translate "Hide"
    , 'views.import.invalidShape': '' // TODO: translate "Invalid views JSON shape"
    , 'views.import.invalidJson': '' // TODO: translate "Invalid JSON"
    , 'common.tomorrow': '' // TODO: translate "Tomorrow"
    , 'common.go': '' // TODO: translate "Go"
    , 'common.show': '' // TODO: translate "Show"
    , 'common.search': '' // TODO: translate "Search"
    , 'hud.next3weeks': '' // TODO: translate "Next 3 weeks"
    , 'hud.noTrips3weeks': '' // TODO: translate "No upcoming trips in 3 weeks"
    , 'hud.openShow': '' // TODO: translate "open show"
    , 'hud.openTrip': '' // TODO: translate "open travel"
    , 'hud.view.whatsnext': '' // TODO: translate "What"
    , 'hud.view.month': '' // TODO: translate "This Month"
    , 'hud.view.financials': '' // TODO: translate "Financials"
    , 'hud.view.whatsnext.desc': '' // TODO: translate "Upcoming 14 day summary"
    , 'hud.view.month.desc': '' // TODO: translate "Monthly financial & show snapshot"
    , 'hud.view.financials.desc': '' // TODO: translate "Financial intelligence breakdown"
    , 'hud.layer.heat': '' // TODO: translate "Heat"
    , 'hud.layer.status': '' // TODO: translate "Status"
    , 'hud.layer.route': '' // TODO: translate "Route"
    , 'hud.views': '' // TODO: translate "HUD views"
    , 'hud.layers': '' // TODO: translate "Map layers"
    , 'hud.missionControl': '' // TODO: translate "Mission Control"
    , 'hud.subtitle': '' // TODO: translate "Realtime map and upcoming shows"
    , 'hud.risks': '' // TODO: translate "Risks"
    , 'hud.assignProducer': '' // TODO: translate "Assign producer"
    , 'hud.mapLoadError': '' // TODO: translate "Map failed to load. Please retry."
    , 'common.retry': '' // TODO: translate "Retry"
    , 'hud.viewChanged': '' // TODO: translate "View changed to"
    , 'hud.openEvent': '' // TODO: translate "open event"
    , 'hud.type.flight': '' // TODO: translate "Flight"
    , 'hud.type.ground': '' // TODO: translate "Ground"
    , 'hud.type.event': '' // TODO: translate "Event"
    , 'hud.fin.avgNetMonth': '' // TODO: translate "Avg Net (Month)"
    , 'hud.fin.runRateYear': '' // TODO: translate "Run Rate (Year)"
    , 'finance.forecast': '' // TODO: translate "Forecast vs Actual"
    , 'finance.forecast.legend.actual': '' // TODO: translate "Actual net"
    , 'finance.forecast.legend.p50': '' // TODO: translate "Forecast p50"
    , 'finance.forecast.legend.band': '' // TODO: translate "Confidence band"
    , 'finance.forecast.alert.under': '' // TODO: translate "Under forecast by"
    , 'finance.forecast.alert.above': '' // TODO: translate "Above optimistic by"
    , 'map.toggle.status': '' // TODO: translate "Toggle status markers"
    , 'map.toggle.route': '' // TODO: translate "Toggle route line"
    , 'map.toggle.heat': '' // TODO: translate "Toggle heat circles"
    , 'shows.exportCsv': '' // TODO: translate "Export CSV"
    , 'shows.filters.from': '' // TODO: translate "From"
    , 'shows.filters.to': '' // TODO: translate "To"
    , 'shows.items': '' // TODO: translate "items"
    , 'shows.date.presets': '' // TODO: translate "Presets"
    , 'shows.date.thisMonth': '' // TODO: translate "This Month"
    , 'shows.date.nextMonth': '' // TODO: translate "Next Month"
    , 'shows.tooltip.net': '' // TODO: translate "Fee minus WHT, commissions, and costs"
    , 'shows.tooltip.margin': '' // TODO: translate "Net divided by Fee (%)"
    , 'shows.table.margin': '' // TODO: translate "Margin %"
    , 'shows.editor.margin.formula': '' // TODO: translate "Margin % = Net/Fee"
    , 'shows.tooltip.wht': '' // TODO: translate "Withholding tax percentage applied to the fee"
    , 'shows.editor.label.name': '' // TODO: translate "Show name"
    , 'shows.editor.placeholder.name': '' // TODO: translate "Festival or show name"
    , 'shows.editor.placeholder.venue': '' // TODO: translate "Venue name"
    , 'shows.editor.help.venue': '' // TODO: translate "Optional venue / room name"
    , 'shows.editor.help.fee': '' // TODO: translate "Gross fee agreed (before taxes, commissions, costs)"
    , 'shows.editor.help.wht': '' // TODO: translate "Local withholding tax percentage (auto-suggested by country)"
    , 'shows.editor.saving': '' // TODO: translate "Saving…"
    , 'shows.editor.saved': '' // TODO: translate "Saved ✓"
    , 'shows.editor.save.error': '' // TODO: translate "Save failed"
    , 'shows.editor.cost.templates': '' // TODO: translate "Templates"
    , 'shows.editor.cost.addTemplate': '' // TODO: translate "Add template"
    , 'shows.editor.cost.subtotals': '' // TODO: translate "Subtotals"
    , 'shows.editor.cost.type': '' // TODO: translate "Type"
    , 'shows.editor.cost.amount': '' // TODO: translate "Amount"
    , 'shows.editor.cost.desc': '' // TODO: translate "Description"
    , 'shows.editor.status.help': '' // TODO: translate "Current lifecycle state of the show"
    , 'shows.editor.cost.template.travel': '' // TODO: translate "Travel basics"
    , 'shows.editor.cost.template.production': '' // TODO: translate "Production basics"
    , 'shows.editor.cost.template.marketing': '' // TODO: translate "Marketing basics"
    , 'shows.editor.quick.label': '' // TODO: translate "Quick add costs"
    , 'shows.editor.quick.hint': '' // TODO: translate "e.g., Hotel 1200"
    , 'shows.editor.quick.placeholder': '' // TODO: translate "20/04/2025 "
    , 'shows.editor.quick.preview.summary': '' // TODO: translate "Will set: {fields}"
    , 'shows.editor.quick.apply': '' // TODO: translate "Apply"
    , 'shows.editor.quick.parseError': '' // TODO: translate "Cannot interpret"
    , 'shows.editor.quick.applied': '' // TODO: translate "Quick entry applied"
    , 'shows.editor.bulk.title': '' // TODO: translate "Bulk add costs"
    , 'shows.editor.bulk.open': '' // TODO: translate "Bulk add"
    , 'shows.editor.bulk.placeholder': '' // TODO: translate "Type, Amount, Description\nTravel, 1200, Flights BCN-MAD\nProduction\t500\tBackline"
    , 'shows.editor.bulk.preview': '' // TODO: translate "Preview"
    , 'shows.editor.bulk.parsed': '' // TODO: translate "Parsed {count} lines"
    , 'shows.editor.bulk.add': '' // TODO: translate "Add costs"
    , 'shows.editor.bulk.cancel': '' // TODO: translate "Cancel"
    , 'shows.editor.bulk.invalidLine': '' // TODO: translate "Invalid line {n}"
    , 'shows.editor.bulk.empty': '' // TODO: translate "No valid lines"
    , 'shows.editor.bulk.help': '' // TODO: translate "Paste CSV or tab-separated lines: Type, Amount, Description (amount optional)"
    , 'shows.editor.restored': '' // TODO: translate "Restored draft"
    , 'shows.editor.quick.icon.date': '' // TODO: translate "Date"
    , 'shows.editor.quick.icon.city': '' // TODO: translate "City"
    , 'shows.editor.quick.icon.country': '' // TODO: translate "Country"
    , 'shows.editor.quick.icon.fee': '' // TODO: translate "Fee"
    , 'shows.editor.quick.icon.whtPct': '' // TODO: translate "WHT %"
    , 'shows.editor.quick.icon.name': '' // TODO: translate "Name"
    , 'shows.editor.cost.templateMenu': '' // TODO: translate "Cost templates"
    , 'shows.editor.cost.template.applied': '' // TODO: translate "Template applied"
    , 'shows.editor.cost.duplicate': '' // TODO: translate "Duplicate"
    , 'shows.editor.cost.moveUp': '' // TODO: translate "Move up"
    , 'shows.editor.cost.moveDown': '' // TODO: translate "Move down"
    , 'shows.editor.costs.title': '' // TODO: translate "Costs"
    , 'shows.editor.costs.empty': '' // TODO: translate "No costs yet — add one"
    , 'shows.editor.costs.recent': '' // TODO: translate "Recent"
    , 'shows.editor.costs.templates': '' // TODO: translate "Templates"
    , 'shows.editor.costs.subtotal': '' // TODO: translate "Subtotal {category}"
    , 'shows.editor.wht.suggest': '' // TODO: translate "Suggest {pct}%"
    , 'shows.editor.wht.apply': '' // TODO: translate "Apply {pct}%"
    , 'shows.editor.wht.suggest.applied': '' // TODO: translate "Suggestion applied"
    , 'shows.editor.wht.tooltip.es': '' // TODO: translate "Typical IRPF in ES: 15% (editable)"
    , 'shows.editor.wht.tooltip.generic': '' // TODO: translate "Typical withholding suggestion"
    , 'shows.editor.status.hint': '' // TODO: translate "Change here or via badge"
    , 'shows.editor.wht.hint.es': '' // TODO: translate "Typical ES withholding: 15% (editable)"
    , 'shows.editor.wht.hint.generic': '' // TODO: translate "Withholding percentage (editable)"
    , 'shows.editor.commission.default': '' // TODO: translate "Default {pct}%"
    , 'shows.editor.commission.overridden': '' // TODO: translate "Override"
    , 'shows.editor.commission.overriddenIndicator': '' // TODO: translate "Commission overridden"
    , 'shows.editor.commission.reset': '' // TODO: translate "Reset to default"
    , 'shows.editor.label.currency': '' // TODO: translate "Currency"
    , 'shows.editor.help.currency': '' // TODO: translate "Contract currency"
    , 'shows.editor.fx.rateOn': '' // TODO: translate "Rate"
    , 'shows.editor.fx.convertedFee': '' // TODO: translate "≈ {amount} {base}"
    , 'shows.editor.fx.unavailable': '' // TODO: translate "Rate unavailable"
    , 'shows.editor.actions.promote': '' // TODO: translate "Promote"
    , 'shows.editor.actions.planTravel': '' // TODO: translate "Plan travel"
    , 'shows.editor.state.hint': '' // TODO: translate "Use the badge or this selector"
    , 'shows.editor.save.create': '' // TODO: translate "Save"
    , 'shows.editor.save.edit': '' // TODO: translate "Save changes"
    , 'shows.editor.save.retry': '' // TODO: translate "Retry"
    , 'shows.editor.tab.active': '' // TODO: translate "Tab {label} active"
    , 'shows.editor.tab.restored': '' // TODO: translate "Restored last tab: {label}"
    , 'shows.editor.errors.count': '' // TODO: translate "There are {n} errors"
    , 'shows.totals.fees': '' // TODO: translate "Fees"
    , 'shows.totals.net': '' // TODO: translate "Net"
    , 'shows.totals.hide': '' // TODO: translate "Hide"
    , 'shows.totals.show': '' // TODO: translate "Show totals"
    , 'shows.view.list': '' // TODO: translate "List"
    , 'shows.view.board': '' // TODO: translate "Board"
    , 'shows.views.none': '' // TODO: translate "Views"
    , 'views.manage': '' // TODO: translate "Manage views"
    , 'views.saved': '' // TODO: translate "Saved"
    , 'views.apply': '' // TODO: translate "Apply"
    , 'views.none': '' // TODO: translate "No saved views"
    , 'views.deleted': '' // TODO: translate "Deleted"
    , 'views.export': '' // TODO: translate "Export"
    , 'views.import': '' // TODO: translate "Import"
    , 'views.import.hint': '' // TODO: translate "Paste JSON of views to import"
    , 'views.openLab': '' // TODO: translate "Open Layout Lab"
    , 'views.share': '' // TODO: translate "Copy share link"
    , 'views.export.copied': '' // TODO: translate "Export copied"
    , 'views.imported': '' // TODO: translate "Views imported"
    , 'views.import.invalid': '' // TODO: translate "Invalid JSON"
    , 'views.label': '' // TODO: translate "View"
    , 'views.names.default': '' // TODO: translate "Default"
    , 'views.names.finance': '' // TODO: translate "Finance"
    , 'views.names.operations': '' // TODO: translate "Operations"
    , 'views.names.promo': '' // TODO: translate "Promotion"
    , 'demo.banner': '' // TODO: translate "Demo data • No live sync"
    , 'demo.load': '' // TODO: translate "Load demo data"
    , 'demo.loaded': '' // TODO: translate "Demo data loaded"
    , 'demo.clear': '' // TODO: translate "Clear data"
    , 'demo.cleared': '' // TODO: translate "All data cleared"
    , 'demo.password.prompt': '' // TODO: translate "Enter demo password"
    , 'demo.password.invalid': '' // TODO: translate "Incorrect password"
    , 'shows.views.delete': '' // TODO: translate "Delete"
    , 'shows.views.namePlaceholder': '' // TODO: translate "View name"
    , 'shows.views.save': '' // TODO: translate "Save"
    , 'shows.status.canceled': '' // TODO: translate "Canceled"
    , 'shows.status.archived': '' // TODO: translate "Archived"
    , 'shows.status.offer': '' // TODO: translate "Offer"
    , 'shows.status.pending': '' // TODO: translate "Pending"
    , 'shows.status.confirmed': '' // TODO: translate "Confirmed"
    , 'shows.status.postponed': '' // TODO: translate "Postponed"
    , 'shows.bulk.selected': '' // TODO: translate "selected"
    , 'shows.bulk.confirm': '' // TODO: translate "Confirm"
    , 'shows.bulk.promote': '' // TODO: translate "Promote"
    , 'shows.bulk.export': '' // TODO: translate "Export"
    , 'shows.notes': '' // TODO: translate "Notes"
    , 'shows.virtualized.hint': '' // TODO: translate "Virtualized list active"
    , 'story.title': '' // TODO: translate "Story mode"
    , 'story.timeline': '' // TODO: translate "Timeline"
    , 'story.play': '' // TODO: translate "Play"
    , 'story.pause': '' // TODO: translate "Pause"
    , 'story.cta': '' // TODO: translate "Story mode"
    , 'story.scrub': '' // TODO: translate "Scrub timeline"
    , 'finance.overview': '' // TODO: translate "Finance overview"
    , 'shows.title': '' // TODO: translate "Shows"
    , 'shows.notFound': '' // TODO: translate "Show not found"
    , 'shows.search.placeholder': '' // TODO: translate "Search city/country"
    , 'shows.add': '' // TODO: translate "Add show"
    , 'shows.edit': '' // TODO: translate "Edit"
    , 'shows.summary.upcoming': '' // TODO: translate "Upcoming"
    , 'shows.summary.totalFees': '' // TODO: translate "Total Fees"
    , 'shows.summary.estNet': '' // TODO: translate "Est. Net"
    , 'shows.summary.avgWht': '' // TODO: translate "Avg WHT"
    , 'shows.table.date': '' // TODO: translate "Date"
    , 'shows.table.name': '' // TODO: translate "Show"
    , 'shows.table.city': '' // TODO: translate "City"
    , 'shows.table.country': '' // TODO: translate "Country"
    , 'shows.table.venue': '' // TODO: translate "Venue"
    , 'shows.table.promoter': '' // TODO: translate "Promoter"
    , 'shows.table.wht': '' // TODO: translate "WHT %"
    , 'shows.table.type': '' // TODO: translate "Type"
    , 'shows.table.description': '' // TODO: translate "Description"
    , 'shows.table.amount': '' // TODO: translate "Amount"
    , 'shows.table.remove': '' // TODO: translate "Remove"
    , 'shows.table.agency.mgmt': '' // TODO: translate "Mgmt"
    , 'shows.table.agency.booking': '' // TODO: translate "Booking"
    , 'shows.table.agencies': '' // TODO: translate "Agencies"
    , 'shows.table.notes': '' // TODO: translate "Notes"
    , 'shows.table.fee': '' // TODO: translate "Fee"
    , 'shows.selected': '' // TODO: translate "selected"
    , 'shows.count.singular': '' // TODO: translate "show"
    , 'shows.count.plural': '' // TODO: translate "shows"
    , 'settings.title': '' // TODO: translate "Settings"
    , 'settings.personal': '' // TODO: translate "Personal"
    , 'settings.preferences': '' // TODO: translate "Preferences"
    , 'settings.organization': '' // TODO: translate "Organization"
    , 'settings.billing': '' // TODO: translate "Billing"
    , 'settings.currency': '' // TODO: translate "Currency"
    , 'settings.units': '' // TODO: translate "Distance units"
    , 'settings.agencies': '' // TODO: translate "Agencies"
    , 'settings.localNote': '' // TODO: translate "Preferences are saved locally on this device."
    , 'settings.language': '' // TODO: translate "Language"
    , 'settings.language.en': '' // TODO: translate "English"
    , 'settings.language.es': '' // TODO: translate "Spanish"
    , 'settings.dashboardView': '' // TODO: translate "Default Dashboard View"
    , 'settings.presentation': '' // TODO: translate "Presentation mode"
    , 'settings.comparePrev': '' // TODO: translate "Compare vs previous period"
    , 'settings.defaultStatuses': '' // TODO: translate "Default status filters"
    , 'settings.defaultRegion': '' // TODO: translate "Default region"
    , 'settings.region.all': '' // TODO: translate "All"
    , 'settings.region.AMER': '' // TODO: translate "Americas"
    , 'settings.region.EMEA': '' // TODO: translate "EMEA"
    , 'settings.region.APAC': '' // TODO: translate "APAC"
    , 'settings.agencies.booking': '' // TODO: translate "Booking Agencies"
    , 'settings.agencies.management': '' // TODO: translate "Management Agencies"
    , 'settings.agencies.add': '' // TODO: translate "Add"
    , 'settings.agencies.hideForm': '' // TODO: translate "Hide form"
    , 'settings.agencies.none': '' // TODO: translate "No agencies"
    , 'settings.agencies.name': '' // TODO: translate "Name"
    , 'settings.agencies.commission': '' // TODO: translate "Commission %"
    , 'settings.agencies.territoryMode': '' // TODO: translate "Territory Mode"
    , 'settings.agencies.continents': '' // TODO: translate "Continents"
    , 'settings.agencies.countries': '' // TODO: translate "Countries (comma or space separated ISO2)"
    , 'settings.agencies.addBooking': '' // TODO: translate "Add booking"
    , 'settings.agencies.addManagement': '' // TODO: translate "Add management"
    , 'settings.agencies.reset': '' // TODO: translate "Reset"
    , 'settings.agencies.remove': '' // TODO: translate "Remove agency"
    , 'settings.agencies.limitReached': '' // TODO: translate "Limit reached (max 3)"
    , 'settings.agencies.countries.invalid': '' // TODO: translate "Countries must be 2-letter ISO codes (e.g., US ES DE), separated by commas or spaces."
    , 'settings.continent.NA': '' // TODO: translate "North America"
    , 'settings.continent.SA': '' // TODO: translate "South America"
    , 'settings.continent.EU': '' // TODO: translate "Europe"
    , 'settings.continent.AF': '' // TODO: translate "Africa"
    , 'settings.continent.AS': '' // TODO: translate "Asia"
    , 'settings.continent.OC': '' // TODO: translate "Oceania"
    , 'settings.territory.worldwide': '' // TODO: translate "Worldwide"
    , 'settings.territory.continents': '' // TODO: translate "Continents"
    , 'settings.territory.countries': '' // TODO: translate "Countries"
    , 'settings.export': '' // TODO: translate "Export settings"
    , 'settings.import': '' // TODO: translate "Import settings"
    , 'settings.reset': '' // TODO: translate "Reset to defaults"
    , 'settings.preview': '' // TODO: translate "Preview"
    , 'shows.table.net': '' // TODO: translate "Net"
    , 'shows.table.status': '' // TODO: translate "Status"
    , 'shows.selectAll': '' // TODO: translate "Select all"
    , 'shows.selectRow': '' // TODO: translate "Select row"
    , 'shows.editor.tabs': '' // TODO: translate "Editor tabs"
    , 'shows.editor.tab.details': '' // TODO: translate "Details"
    , 'shows.editor.tab.finance': '' // TODO: translate "Finance"
    , 'shows.editor.tab.costs': '' // TODO: translate "Costs"
    , 'shows.editor.finance.commissions': '' // TODO: translate "Commissions"
    , 'shows.editor.add': '' // TODO: translate "Add show"
    , 'shows.editor.edit': '' // TODO: translate "Edit show"
    , 'shows.editor.subtitleAdd': '' // TODO: translate "Create a new event"
    , 'shows.editor.label.status': '' // TODO: translate "Status"
    , 'shows.editor.label.date': '' // TODO: translate "Date"
    , 'shows.editor.label.city': '' // TODO: translate "City"
    , 'shows.editor.label.country': '' // TODO: translate "Country"
    , 'shows.editor.label.venue': '' // TODO: translate "Venue"
    , 'shows.editor.label.promoter': '' // TODO: translate "Promoter"
    , 'shows.editor.label.fee': '' // TODO: translate "Fee"
    , 'shows.editor.label.wht': '' // TODO: translate "WHT %"
    , 'shows.editor.label.mgmt': '' // TODO: translate "Mgmt Agency"
    , 'shows.editor.label.booking': '' // TODO: translate "Booking Agency"
    , 'shows.editor.label.notes': '' // TODO: translate "Notes"
    , 'shows.editor.validation.cityRequired': '' // TODO: translate "City is required"
    , 'shows.editor.validation.countryRequired': '' // TODO: translate "Country is required"
    , 'shows.editor.validation.dateRequired': '' // TODO: translate "Date is required"
    , 'shows.editor.validation.feeGtZero': '' // TODO: translate "Fee must be greater than 0"
    , 'shows.editor.validation.whtRange': '' // TODO: translate "WHT must be between 0% and 50%"
    , 'shows.dialog.close': '' // TODO: translate "Close"
    , 'shows.dialog.cancel': '' // TODO: translate "Cancel"
    , 'shows.dialog.save': '' // TODO: translate "Save"
    , 'shows.dialog.saveChanges': '' // TODO: translate "Save changes"
    , 'shows.dialog.delete': '' // TODO: translate "Delete"
    , 'shows.editor.validation.fail': '' // TODO: translate "Fix errors to continue"
    , 'shows.editor.toast.saved': '' // TODO: translate "Saved"
    , 'shows.editor.toast.deleted': '' // TODO: translate "Deleted"
    , 'shows.editor.toast.undo': '' // TODO: translate "Undo"
    , 'shows.editor.toast.restored': '' // TODO: translate "Restored"
    , 'shows.editor.toast.deleting': '' // TODO: translate "Deleting…"
    , 'shows.editor.toast.discarded': '' // TODO: translate "Changes discarded"
    , 'shows.editor.toast.validation': '' // TODO: translate "Please correct the highlighted errors"
    , 'shows.editor.summary.fee': '' // TODO: translate "Fee"
    , 'shows.editor.summary.wht': '' // TODO: translate "WHT"
    , 'shows.editor.summary.costs': '' // TODO: translate "Costs"
    , 'shows.editor.summary.net': '' // TODO: translate "Est. Net"
    , 'shows.editor.discard.title': '' // TODO: translate "Discard changes?"
    , 'shows.editor.discard.body': '' // TODO: translate "You have unsaved changes. They will be lost."
    , 'shows.editor.discard.cancel': '' // TODO: translate "Keep editing"
    , 'shows.editor.discard.confirm': '' // TODO: translate "Discard"
    , 'shows.editor.delete.confirmTitle': '' // TODO: translate "Delete show?"
    , 'shows.editor.delete.confirmBody': '' // TODO: translate "This action cannot be undone."
    , 'shows.editor.delete.confirm': '' // TODO: translate "Delete"
    , 'shows.editor.delete.cancel': '' // TODO: translate "Cancel"
    , 'shows.noCosts': '' // TODO: translate "No costs yet"
    , 'shows.filters.region': '' // TODO: translate "Region"
    , 'shows.filters.region.all': '' // TODO: translate "All"
    , 'shows.filters.region.AMER': '' // TODO: translate "AMER"
    , 'shows.filters.region.EMEA': '' // TODO: translate "EMEA"
    , 'shows.filters.region.APAC': '' // TODO: translate "APAC"
    , 'shows.filters.feeMin': '' // TODO: translate "Min fee"
    , 'shows.filters.feeMax': '' // TODO: translate "Max fee"
    , 'shows.views.export': '' // TODO: translate "Export views"
    , 'shows.views.import': '' // TODO: translate "Import views"
    , 'shows.views.applied': '' // TODO: translate "View applied"
    , 'shows.bulk.delete': '' // TODO: translate "Delete selected"
    , 'shows.bulk.setWht': '' // TODO: translate "Set WHT %"
    , 'shows.bulk.applyWht': '' // TODO: translate "Apply WHT"
    , 'shows.bulk.setStatus': '' // TODO: translate "Set status"
    , 'shows.bulk.apply': '' // TODO: translate "Apply"
    , 'shows.travel.title': '' // TODO: translate "Location"
    , 'shows.travel.quick': '' // TODO: translate "Travel"
    , 'shows.travel.soon': '' // TODO: translate "Upcoming confirmed show — consider adding travel."
    , 'shows.travel.soonConfirmed': '' // TODO: translate "Upcoming confirmed show — consider adding travel."
    , 'shows.travel.soonGeneric': '' // TODO: translate "Upcoming show — consider planning travel."
    , 'shows.travel.tripExists': '' // TODO: translate "Trip already scheduled around this date"
    , 'shows.travel.noCta': '' // TODO: translate "No travel action needed"
    , 'shows.travel.plan': '' // TODO: translate "Plan travel"
    , 'cmd.dialog': '' // TODO: translate "Command palette"
    , 'cmd.placeholder': '' // TODO: translate "Search shows or actions…"
    , 'cmd.type.show': '' // TODO: translate "Show"
    , 'cmd.type.action': '' // TODO: translate "Action"
    , 'cmd.noResults': '' // TODO: translate "No results"
    , 'cmd.footer.hint': '' // TODO: translate "Enter to run • Esc to close"
    , 'cmd.footer.tip': '' // TODO: translate "Tip: press ? for shortcuts"
    , 'cmd.openFilters': '' // TODO: translate "Open Filters"
    , 'cmd.mask.enable': '' // TODO: translate "Enable Mask"
    , 'cmd.mask.disable': '' // TODO: translate "Disable Mask"
    , 'cmd.presentation.enable': '' // TODO: translate "Enable Presentation Mode"
    , 'cmd.presentation.disable': '' // TODO: translate "Disable Presentation Mode"
    , 'cmd.shortcuts': '' // TODO: translate "Show Shortcuts Overlay"
    , 'cmd.switch.default': '' // TODO: translate "Switch View: Default"
    , 'cmd.switch.finance': '' // TODO: translate "Switch View: Finance"
    , 'cmd.switch.operations': '' // TODO: translate "Switch View: Operations"
    , 'cmd.switch.promo': '' // TODO: translate "Switch View: Promotion"
    , 'cmd.openAlerts': '' // TODO: translate "Open Alert Center"
    , 'cmd.go.shows': '' // TODO: translate "Go to Shows"
    , 'cmd.go.travel': '' // TODO: translate "Go to Travel"
    , 'cmd.go.finance': '' // TODO: translate "Go to Finance"
    , 'cmd.go.org': '' // TODO: translate "Go to Org Overview"
    , 'cmd.go.members': '' // TODO: translate "Go to Org Members"
    , 'cmd.go.clients': '' // TODO: translate "Go to Org Clients"
    , 'cmd.go.teams': '' // TODO: translate "Go to Org Teams"
    , 'cmd.go.links': '' // TODO: translate "Go to Org Links"
    , 'cmd.go.reports': '' // TODO: translate "Go to Org Reports"
    , 'cmd.go.documents': '' // TODO: translate "Go to Org Documents"
    , 'cmd.go.integrations': '' // TODO: translate "Go to Org Integrations"
    , 'cmd.go.billing': '' // TODO: translate "Go to Org Billing"
    , 'cmd.go.branding': '' // TODO: translate "Go to Org Branding"
    , 'shortcuts.dialog': '' // TODO: translate "Keyboard shortcuts"
    , 'shortcuts.title': '' // TODO: translate "Shortcuts"
    , 'shortcuts.desc': '' // TODO: translate "Use these to move faster. Press Esc to close."
    , 'shortcuts.openPalette': '' // TODO: translate "Open Command Palette"
    , 'shortcuts.showOverlay': '' // TODO: translate "Show this overlay"
    , 'shortcuts.closeDialogs': '' // TODO: translate "Close dialogs/popups"
    , 'shortcuts.goTo': '' // TODO: translate "Quick nav: g then key"
    , 'alerts.open': '' // TODO: translate "Open Alerts"
    , 'alerts.loading': '' // TODO: translate "Loading alerts…"
    , 'actions.exportCsv': '' // TODO: translate "Export CSV"
    , 'actions.copyDigest': '' // TODO: translate "Copy Digest"
    , 'actions.digest.title': '' // TODO: translate "Weekly Alerts Digest"
    , 'actions.toast.csv': '' // TODO: translate "CSV copied"
    , 'actions.toast.digest': '' // TODO: translate "Digest copied"
    , 'actions.toast.share': '' // TODO: translate "Link copied"
    , 'welcome.title': '' // TODO: translate "Welcome, {name}"
    , 'welcome.subtitle.agency': '' // TODO: translate "Manage your managers and artists"
    , 'welcome.subtitle.artist': '' // TODO: translate "All set for your upcoming shows"
    , 'welcome.cta.dashboard': '' // TODO: translate "Go to dashboard"
    , 'welcome.section.team': '' // TODO: translate "Your team"
    , 'welcome.section.clients': '' // TODO: translate "Your artists"
    , 'welcome.section.assignments': '' // TODO: translate "Managers per artist"
    , 'welcome.section.links': '' // TODO: translate "Connections & scopes"
    , 'welcome.section.kpis': '' // TODO: translate "This month"
    , 'welcome.seats.usage': '' // TODO: translate "Seats used"
    , 'welcome.gettingStarted': '' // TODO: translate "Getting started"
    , 'welcome.recentlyViewed': '' // TODO: translate "Recently viewed"
    , 'welcome.changesSince': '' // TODO: translate "Changes since your last visit"
    , 'welcome.noChanges': '' // TODO: translate "No changes"
    , 'welcome.change.linkEdited': '' // TODO: translate "Link scopes edited for Danny"
    , 'welcome.change.memberInvited': '' // TODO: translate "New manager invited"
    , 'welcome.change.docUploaded': '' // TODO: translate "New document uploaded"
    , 'empty.noRecent': '' // TODO: translate "No recent items"
    , 'welcome.cta.inviteManager': '' // TODO: translate "Invite manager"
    , 'welcome.cta.connectArtist': '' // TODO: translate "Connect artist"
    , 'welcome.cta.createTeam': '' // TODO: translate "Create team"
    , 'welcome.cta.completeBranding': '' // TODO: translate "Complete branding"
    , 'welcome.cta.reviewShows': '' // TODO: translate "Review shows"
    , 'welcome.cta.connectCalendar': '' // TODO: translate "Connect calendar"
    , 'welcome.cta.switchOrg': '' // TODO: translate "Change organization"
    , 'welcome.cta.completeSetup': '' // TODO: translate "Complete setup"
    , 'welcome.progress.complete': '' // TODO: translate "Setup complete"
    , 'welcome.progress.incomplete': '' // TODO: translate "{completed}/{total} steps completed"
    , 'welcome.tooltip.inviteManager': '' // TODO: translate "Invite team members to collaborate on shows and finances"
    , 'welcome.tooltip.connectArtist': '' // TODO: translate "Link with artists to manage their tours"
    , 'welcome.tooltip.completeBranding': '' // TODO: translate "Set up your organization\"
    , 'welcome.tooltip.connectCalendar': '' // TODO: translate "Sync your calendar for automatic show scheduling"
    , 'welcome.tooltip.switchOrg': '' // TODO: translate "Switch between different organizations you manage"
    , 'welcome.gettingStarted.invite': '' // TODO: translate "Invite a manager"
    , 'welcome.gettingStarted.connect': '' // TODO: translate "Connect an artist"
    , 'welcome.gettingStarted.review': '' // TODO: translate "Review teams & links"
    , 'welcome.gettingStarted.branding': '' // TODO: translate "Complete branding"
    , 'welcome.gettingStarted.shows': '' // TODO: translate "Review shows"
    , 'welcome.gettingStarted.calendar': '' // TODO: translate "Connect calendar"
    , 'welcome.dontShowAgain': '' // TODO: translate "Don"
    , 'welcome.openArtistDashboard': '' // TODO: translate "Open {artist} dashboard"
    , 'welcome.assign': '' // TODO: translate "Assign"
    , 'shows.toast.bulk.status': '' // TODO: translate "Status: {status} ({n})"
    , 'shows.toast.bulk.confirm': '' // TODO: translate "Confirmed"
    , 'shows.toast.bulk.setStatus': '' // TODO: translate "Status applied"
    , 'shows.toast.bulk.setWht': '' // TODO: translate "WHT applied"
    , 'shows.toast.bulk.export': '' // TODO: translate "Export started"
    , 'shows.toast.bulk.delete': '' // TODO: translate "Deleted"
    , 'shows.toast.bulk.confirmed': '' // TODO: translate "Confirmed ({n})"
    , 'shows.toast.bulk.wht': '' // TODO: translate "WHT {pct}% ({n})"
    , 'filters.clear': '' // TODO: translate "Clear"
    , 'filters.more': '' // TODO: translate "More filters"
    , 'filters.cleared': '' // TODO: translate "Filters cleared"
    , 'filters.presets': '' // TODO: translate "Presets"
    , 'filters.presets.last7': '' // TODO: translate "Last 7 days"
    , 'filters.presets.last30': '' // TODO: translate "Last 30 days"
    , 'filters.presets.last90': '' // TODO: translate "Last 90 days"
    , 'filters.presets.mtd': '' // TODO: translate "Month to date"
    , 'filters.presets.ytd': '' // TODO: translate "Year to date"
    , 'filters.presets.qtd': '' // TODO: translate "Quarter to date"
    , 'filters.applied': '' // TODO: translate "Filters applied"
    , 'common.team': '' // TODO: translate "Team"
    , 'common.region': '' // TODO: translate "Region"
    , 'ah.planTravel': '' // TODO: translate "Plan travel"
    , 'map.cssWarning': '' // TODO: translate "Map styles failed to load. Using basic fallback."
    , 'travel.offline': '' // TODO: translate "Offline mode: showing cached itineraries."
    , 'travel.refresh.error': '' // TODO: translate "Couldn"
    , 'travel.search.title': '' // TODO: translate "Search"
    , 'travel.search.open_in_google': '' // TODO: translate "Open in Google Flights"
    , 'travel.search.mode.form': '' // TODO: translate "Form"
    , 'travel.search.mode.text': '' // TODO: translate "Text"
    , 'travel.search.show_text': '' // TODO: translate "Write query"
    , 'travel.search.hide_text': '' // TODO: translate "Hide text input"
    , 'travel.search.text.placeholder': '' // TODO: translate "e.g., From MAD to CDG 2025-10-12 2 adults business"
    , 'travel.nlp': '' // TODO: translate "NLP"
    , 'travel.search.origin': '' // TODO: translate "Origin"
    , 'travel.search.destination': '' // TODO: translate "Destination"
    , 'travel.search.departure_date': '' // TODO: translate "Departure date"
    , 'travel.search.searching': '' // TODO: translate "Searching flights…"
    , 'travel.search.searchMyFlight': '' // TODO: translate "Search My Flight"
    , 'travel.search.searchAgain': '' // TODO: translate "Search Again"
    , 'travel.search.error': '' // TODO: translate "Error searching flights"
    , 'travel.addPurchasedFlight': '' // TODO: translate "Add Purchased Flight"
    , 'travel.addFlightDescription': '' // TODO: translate "Enter your booking reference or flight number to add it to your schedule"
    , 'travel.emptyStateDescription': '' // TODO: translate "Add your booked flights or search for new ones to start managing your trips."
    , 'features.settlement.benefit': '' // TODO: translate "8h/week saved on financial reports"
    , 'features.offline.description': '' // TODO: translate "IndexedDB + robust sync. Manage your tour on the plane, backstage, or anywhere. When internet returns, everything syncs automatically."
    , 'features.offline.benefit': '' // TODO: translate "24/7 access, no connection dependency"
    , 'features.ai.description': '' // TODO: translate "NLP Quick Entry, intelligent ActionHub, predictive Health Score. Warns you of problems before they happen. Your tour copilot."
    , 'features.ai.benefit': '' // TODO: translate "Anticipates problems 72h in advance"
    , 'features.esign.description': '' // TODO: translate "Integrated e-sign, templates by country (US/UK/EU/ES), full-text search with OCR. Close deals faster, no paper printing."
    , 'features.esign.benefit': '' // TODO: translate "Close contracts 3x faster"
    , 'features.inbox.description': '' // TODO: translate "Emails organized by show, smart threading, rich text reply. All your context in one place, no Gmail searching."
    , 'features.inbox.benefit': '' // TODO: translate "Zero inbox with full context"
    , 'features.travel.description': '' // TODO: translate "Integrated Amadeus API, global venue database, optimized routing. Plan efficient routes with real data."
    , 'features.travel.benefit': '' // TODO: translate "12% savings on travel costs"
    , 'org.addShowToCalendar': '' // TODO: translate "Add a new show to your calendar"
    , 'travel.validation.completeFields': '' // TODO: translate "Please complete origin, destination and departure date"
    , 'travel.validation.returnDate': '' // TODO: translate "Select return date for round trip"
    , 'travel.search.show_more_options': '' // TODO: translate "Open externally"
    , 'travel.advanced.show': '' // TODO: translate "More options"
    , 'travel.advanced.hide': '' // TODO: translate "Hide advanced options"
    , 'travel.flight_card.nonstop': '' // TODO: translate "nonstop"
    , 'travel.flight_card.stop': '' // TODO: translate "stop"
    , 'travel.flight_card.stops': '' // TODO: translate "stops"
    , 'travel.flight_card.select_for_planning': '' // TODO: translate "Select for planning"
    , 'travel.add_to_trip': '' // TODO: translate "Add to trip"
    , 'travel.swap': '' // TODO: translate "Swap"
    , 'travel.round_trip': '' // TODO: translate "Round trip"
    , 'travel.share_search': '' // TODO: translate "Share search"
    , 'travel.from': '' // TODO: translate "From"
    , 'travel.to': '' // TODO: translate "To"
    , 'travel.depart': '' // TODO: translate "Depart"
    , 'travel.return': '' // TODO: translate "Return"
    , 'travel.adults': '' // TODO: translate "Adults"
    , 'travel.bag': '' // TODO: translate "bag"
    , 'travel.bags': '' // TODO: translate "Bags"
    , 'travel.cabin': '' // TODO: translate "Cabin"
    , 'travel.stops_ok': '' // TODO: translate "Stops ok"
    , 'travel.deeplink.preview': '' // TODO: translate "Preview link"
    , 'travel.deeplink.copy': '' // TODO: translate "Copy link"
    , 'travel.deeplink.copied': '' // TODO: translate "Copied ✓"
    , 'travel.sort.menu': '' // TODO: translate "Sort by"
    , 'travel.sort.priceAsc': '' // TODO: translate "Price (low→high)"
    , 'travel.sort.priceDesc': '' // TODO: translate "Price (high→low)"
    , 'travel.sort.duration': '' // TODO: translate "Duration"
    , 'travel.sort.stops': '' // TODO: translate "Stops"
    , 'travel.badge.nonstop': '' // TODO: translate "Nonstop"
    , 'travel.badge.baggage': '' // TODO: translate "Bag included"
    , 'travel.arrival.sameDay': '' // TODO: translate "Arrives same day"
    , 'travel.arrival.nextDay': '' // TODO: translate "Arrives next day"
    , 'travel.recent.clear': '' // TODO: translate "Clear recent"
    , 'travel.recent.remove': '' // TODO: translate "Remove"
    , 'travel.form.invalid': '' // TODO: translate "Please fix errors to search"
    , 'travel.nlp.hint': '' // TODO: translate "Free-form input — press Shift+Enter to apply"
    , 'travel.flex.days': '' // TODO: translate "±{n} days"
    , 'travel.compare.grid.title': '' // TODO: translate "Compare flights"
    , 'travel.compare.empty': '' // TODO: translate "Pin flights to compare them here."
    , 'travel.compare.hint': '' // TODO: translate "Review pinned flights side-by-side."
    , 'travel.co2.label': '' // TODO: translate "CO₂"
    , 'travel.window': '' // TODO: translate "Window"
    , 'travel.flex_window': '' // TODO: translate "Flex window"
    , 'travel.flex_hint': '' // TODO: translate "We"
    , 'travel.one_way': '' // TODO: translate "One-way"
    , 'travel.nonstop': '' // TODO: translate "Nonstop"
    , 'travel.pin': '' // TODO: translate "Pin"
    , 'travel.unpin': '' // TODO: translate "Unpin"
    , 'travel.compare.title': '' // TODO: translate "Compare pinned"
    , 'travel.compare.show': '' // TODO: translate "Compare"
    , 'travel.compare.hide': '' // TODO: translate "Hide"
    , 'travel.compare.add_to_trip': '' // TODO: translate "Add to trip"
    , 'travel.trip.added': '' // TODO: translate "Added to trip"
    , 'travel.trip.create_drop': '' // TODO: translate "Drop here to create new trip"
    , 'travel.related_show': '' // TODO: translate "Related show"
    , 'travel.multicity.toggle': '' // TODO: translate "Multicity"
    , 'travel.multicity': '' // TODO: translate "Multi-city"
    , 'travel.multicity.add_leg': '' // TODO: translate "Add leg"
    , 'travel.multicity.remove': '' // TODO: translate "Remove"
    , 'travel.multicity.move_up': '' // TODO: translate "Move up"
    , 'travel.multicity.move_down': '' // TODO: translate "Move down"
    , 'travel.multicity.open': '' // TODO: translate "Open route in Google Flights"
    , 'travel.multicity.hint': '' // TODO: translate "Add at least two legs to build a route"
    , 'travel.trips': '' // TODO: translate "Trips"
    , 'travel.trip.new': '' // TODO: translate "New Trip"
    , 'travel.trip.to': '' // TODO: translate "Trip to"
    , 'travel.segments': '' // TODO: translate "Segments"
    , 'common.actions': '' // TODO: translate "Actions"
    , 'travel.timeline.title': '' // TODO: translate "Travel Timeline"
    , 'travel.timeline.free_day': '' // TODO: translate "Free day"
    , 'travel.hub.title': '' // TODO: translate "Search"
    , 'travel.hub.needs_planning': '' // TODO: translate "Suggestions"
    , 'travel.hub.upcoming': '' // TODO: translate "Upcoming"
    , 'travel.hub.open_multicity': '' // TODO: translate "Open multicity"
    , 'travel.hub.plan_trip_cta': '' // TODO: translate "Plan Trip"
    , 'travel.error.same_route': '' // TODO: translate "Origin and destination are the same"
    , 'travel.error.return_before_depart': '' // TODO: translate "Return is before departure"
    , 'travel.segment.type': '' // TODO: translate "Type"
    , 'travel.segment.flight': '' // TODO: translate "Flight"
    , 'travel.segment.hotel': '' // TODO: translate "Hotel"
    , 'travel.segment.ground': '' // TODO: translate "Ground"
    , 'copy.manual.title': '' // TODO: translate "Manual copy"
    , 'copy.manual.desc': '' // TODO: translate "Copy the text below if clipboard is blocked."
    , 'common.noResults': '' // TODO: translate "No results"
    , 'tripDetail.currency': '' // TODO: translate "Currency"
    , 'cost.category.flight': '' // TODO: translate "Flight"
    , 'cost.category.hotel': '' // TODO: translate "Hotel"
    , 'cost.category.ground': '' // TODO: translate "Ground"
    , 'cost.category.taxes': '' // TODO: translate "Taxes"
    , 'cost.category.fees': '' // TODO: translate "Fees"
    , 'cost.category.other': '' // TODO: translate "Other"
    , 'travel.workspace.placeholder': '' // TODO: translate "Select a trip to see details or perform a search."
    , 'travel.open_in_provider': '' // TODO: translate "Open in provider"
    , 'common.loading': '' // TODO: translate "Loading…"
    , 'common.results': '' // TODO: translate "results"
    , 'travel.no_trips_yet': '' // TODO: translate "No trips planned yet. Use the search to get started!"
    , 'travel.provider': '' // TODO: translate "Provider"
    , 'provider.mock': '' // TODO: translate "In-app (mock)"
    , 'provider.google': '' // TODO: translate "Google Flights"
    , 'travel.alert.checkin': '' // TODO: translate "Check-in opens in %s"
    , 'travel.alert.priceDrop': '' // TODO: translate "Price dropped by %s"
    , 'travel.workspace.open': '' // TODO: translate "Open Travel Workspace"
    , 'travel.workspace.timeline': '' // TODO: translate "Timeline view"
    , 'travel.workspace.trip_builder.beta': '' // TODO: translate "Trip Builder (beta)"
    , 'common.list': '' // TODO: translate "List"
    , 'common.clear': '' // TODO: translate "Clear"
    , 'common.reset': '' // TODO: translate "Reset"
    , 'calendar.timeline': '' // TODO: translate "Week"
    , 'common.moved': '' // TODO: translate "Moved"
    , 'travel.drop.hint': '' // TODO: translate "Drag to another day"
    , 'travel.search.summary': '' // TODO: translate "Search summary"
    , 'travel.search.route': '' // TODO: translate "{from} → {to}"
    , 'travel.search.paxCabin': '' // TODO: translate "{pax} pax · {cabin}"
    , 'travel.results.countForDate': '' // TODO: translate "{count} results for {date}"
    , 'travel.compare.bestPrice': '' // TODO: translate "Best price"
    , 'travel.compare.bestTime': '' // TODO: translate "Fastest"
    , 'travel.compare.bestBalance': '' // TODO: translate "Best balance"
    , 'travel.co2.estimate': '' // TODO: translate "~{kg} kg CO₂ (est.)"
    , 'travel.mobile.sticky.results': '' // TODO: translate "Results"
    , 'travel.mobile.sticky.compare': '' // TODO: translate "Compare"
    , 'travel.tooltips.flex': '' // TODO: translate "Explore ± days around the selected date"
    , 'travel.tooltips.nonstop': '' // TODO: translate "Only show flights without stops"
    , 'travel.tooltips.cabin': '' // TODO: translate "Seat class preference"
    , 'travel.move.prev': '' // TODO: translate "Move to previous day"
    , 'travel.move.next': '' // TODO: translate "Move to next day"
    , 'travel.rest.short': '' // TODO: translate "Short rest before next show"
    , 'travel.rest.same_day': '' // TODO: translate "Same-day show risk"
    , 'calendar.title': '' // TODO: translate "Calendar"
    , 'calendar.prev': '' // TODO: translate "Previous month"
    , 'calendar.next': '' // TODO: translate "Next month"
    , 'calendar.today': '' // TODO: translate "Today"
    , 'calendar.goto': '' // TODO: translate "Go to date"
    , 'calendar.more': '' // TODO: translate "more"
    , 'calendar.more.title': '' // TODO: translate "More events"
    , 'calendar.more.openDay': '' // TODO: translate "Open day"
    , 'calendar.more.openFullDay': '' // TODO: translate "Open full day"
    , 'calendar.announce.moved': '' // TODO: translate "Moved show to {d}"
    , 'calendar.announce.copied': '' // TODO: translate "Duplicated show to {d}"
    , 'calendar.quickAdd.hint': '' // TODO: translate "Enter to add • Esc to cancel"
    , 'calendar.quickAdd.advanced': '' // TODO: translate "Advanced"
    , 'calendar.quickAdd.simple': '' // TODO: translate "Simple"
    , 'calendar.quickAdd.placeholder': '' // TODO: translate "City CC Fee (optional)… e.g., Madrid ES 12000"
    , 'calendar.quickAdd.recent': '' // TODO: translate "Recent"
    , 'calendar.quickAdd.parseError': '' // TODO: translate "Can"
    , 'calendar.quickAdd.countryMissing': '' // TODO: translate "Add 2-letter country code"
    , 'calendar.goto.hint': '' // TODO: translate "Enter to go • Esc to close"
    , 'calendar.view.switch': '' // TODO: translate "Change calendar view"
    , 'calendar.view.month': '' // TODO: translate "Month"
    , 'calendar.view.week': '' // TODO: translate "Week"
    , 'calendar.view.day': '' // TODO: translate "Day"
    , 'calendar.view.agenda': '' // TODO: translate "Agenda"
    , 'calendar.view.announce': '' // TODO: translate "{v} view"
    , 'calendar.timezone': '' // TODO: translate "Time zone"
    , 'calendar.tz.local': '' // TODO: translate "Local"
    , 'calendar.tz.localLabel': '' // TODO: translate "Local"
    , 'calendar.tz.changed': '' // TODO: translate "Time zone set to {tz}"
    , 'calendar.goto.shortcut': '' // TODO: translate "⌘/Ctrl + G"
    , 'calendar.shortcut.pgUp': '' // TODO: translate "PgUp / Alt+←"
    , 'calendar.shortcut.pgDn': '' // TODO: translate "PgDn / Alt+→"
    , 'calendar.shortcut.today': '' // TODO: translate "T"
    , 'common.move': '' // TODO: translate "Move"
    , 'common.copy': '' // TODO: translate "Copy"
    , 'calendar.more.filter': '' // TODO: translate "Filter events"
    , 'calendar.more.empty': '' // TODO: translate "No results"
    , 'calendar.kb.hint': '' // TODO: translate "Keyboard: Arrow keys move day, PageUp/PageDown change month, T go to today, Enter or Space select day."
    , 'calendar.day.select': '' // TODO: translate "Selected {d}"
    , 'calendar.day.focus': '' // TODO: translate "Focused {d}"
    , 'calendar.noEvents': '' // TODO: translate "No events for this day"
    , 'calendar.show.shows': '' // TODO: translate "Shows"
    , 'calendar.show.travel': '' // TODO: translate "Travel"
    , 'calendar.kind': '' // TODO: translate "Kind"
    , 'calendar.kind.show': '' // TODO: translate "Show"
    , 'calendar.kind.travel': '' // TODO: translate "Travel"
    , 'calendar.status': '' // TODO: translate "Status"
    , 'calendar.dnd.enter': '' // TODO: translate "Drop here to place event on {d}"
    , 'calendar.dnd.leave': '' // TODO: translate "Leaving drop target"
    , 'calendar.kbdDnD.marked': '' // TODO: translate "Marked {d} as origin. Use Enter on target day to drop. Hold Ctrl/Cmd to copy."
    , 'calendar.kbdDnD.cancel': '' // TODO: translate "Cancelled move/copy mode"
    , 'calendar.kbdDnD.origin': '' // TODO: translate "Origin (keyboard move/copy active)"
    , 'calendar.kbdDnD.none': '' // TODO: translate "No show to move from selected origin"
    , 'calendar.weekStart': '' // TODO: translate "Week starts on"
    , 'calendar.weekStart.mon': '' // TODO: translate "Mon"
    , 'calendar.weekStart.sun': '' // TODO: translate "Sun"
    , 'calendar.import': '' // TODO: translate "Import"
    , 'calendar.import.ics': '' // TODO: translate "Import .ics"
    , 'calendar.import.done': '' // TODO: translate "Imported {n} events"
    , 'calendar.import.error': '' // TODO: translate "Failed to import .ics"
    , 'calendar.wd.mon': '' // TODO: translate "Mon"
    , 'calendar.wd.tue': '' // TODO: translate "Tue"
    , 'calendar.wd.wed': '' // TODO: translate "Wed"
    , 'calendar.wd.thu': '' // TODO: translate "Thu"
    , 'calendar.wd.fri': '' // TODO: translate "Fri"
    , 'calendar.wd.sat': '' // TODO: translate "Sat"
    , 'calendar.wd.sun': '' // TODO: translate "Sun"
    , 'shows.costs.type': '' // TODO: translate "Type"
    , 'shows.costs.placeholder': '' // TODO: translate "Travel / Production / Marketing"
    , 'shows.costs.amount': '' // TODO: translate "Amount"
    , 'shows.costs.desc': '' // TODO: translate "Description"
    , 'common.optional': '' // TODO: translate "Optional"
    , 'common.add': '' // TODO: translate "Add"
    , 'common.income': '' // TODO: translate "Income"
    , 'common.wht': '' // TODO: translate "WHT"
    , 'common.commissions': '' // TODO: translate "Commissions"
    , 'common.net': '' // TODO: translate "Net"
    , 'common.costs': '' // TODO: translate "Costs"
    , 'common.total': '' // TODO: translate "Total"
    , 'shows.promote': '' // TODO: translate "Promote"
    , 'shows.editor.status.promote': '' // TODO: translate "Promoted to"
    , 'shows.margin.tooltip': '' // TODO: translate "Net divided by Fee (%)"
    , 'shows.empty': '' // TODO: translate "No shows match your filters"
    , 'shows.empty.add': '' // TODO: translate "Add your first show"
    , 'shows.export.csv.success': '' // TODO: translate "CSV exported ✓"
    , 'shows.export.xlsx.success': '' // TODO: translate "XLSX exported ✓"
    , 'shows.sort.tooltip': '' // TODO: translate "Sort by column"
    , 'shows.filters.statusGroup': '' // TODO: translate "Status filters"
    , 'shows.relative.inDays': '' // TODO: translate "In {n} days"
    , 'shows.relative.daysAgo': '' // TODO: translate "{n} days ago"
    , 'shows.relative.yesterday': '' // TODO: translate "Yesterday"
    , 'shows.row.menu': '' // TODO: translate "Row actions"
    , 'shows.action.edit': '' // TODO: translate "Edit"
    , 'shows.action.promote': '' // TODO: translate "Promote"
    , 'shows.action.duplicate': '' // TODO: translate "Duplicate"
    , 'shows.action.archive': '' // TODO: translate "Archive"
    , 'shows.action.delete': '' // TODO: translate "Delete"
    , 'shows.action.restore': '' // TODO: translate "Restore"
    , 'shows.board.header.net': '' // TODO: translate "Net"
    , 'shows.board.header.count': '' // TODO: translate "Shows"
    , 'shows.datePreset.thisMonth': '' // TODO: translate "This Month"
    , 'shows.datePreset.nextMonth': '' // TODO: translate "Next Month"
    , 'shows.columns.config': '' // TODO: translate "Columns"
    , 'shows.columns.wht': '' // TODO: translate "WHT %"
    , 'shows.totals.pin': '' // TODO: translate "Pin totals"
    , 'shows.totals.unpin': '' // TODO: translate "Unpin totals"
    , 'shows.totals.avgFee': '' // TODO: translate "Avg Fee"
    , 'shows.totals.avgFee.tooltip': '' // TODO: translate "Average fee per show"
    , 'shows.totals.avgMargin': '' // TODO: translate "Avg Margin %"
    , 'shows.totals.avgMargin.tooltip': '' // TODO: translate "Average margin % across shows with fee"
    , 'shows.wht.hide': '' // TODO: translate "Hide WHT column"
    , 'shows.sort.aria.sortedDesc': '' // TODO: translate "Sorted descending"
    , 'shows.sort.aria.sortedAsc': '' // TODO: translate "Sorted ascending"
    , 'shows.sort.aria.notSorted': '' // TODO: translate "Not sorted"
    , 'shows.sort.aria.activateDesc': '' // TODO: translate "Activate to sort descending"
    , 'shows.sort.aria.activateAsc': '' // TODO: translate "Activate to sort ascending"
    , 'nav.overview': '' // TODO: translate "Overview"
    , 'nav.clients': '' // TODO: translate "Clients"
    , 'nav.teams': '' // TODO: translate "Teams"
    , 'nav.links': '' // TODO: translate "Links"
    , 'nav.reports': '' // TODO: translate "Reports"
    , 'nav.documents': '' // TODO: translate "Documents"
    , 'nav.integrations': '' // TODO: translate "Integrations"
    , 'nav.billing': '' // TODO: translate "Billing"
    , 'nav.branding': '' // TODO: translate "Branding"
    , 'nav.connections': '' // TODO: translate "Connections"
    , 'org.overview.title': '' // TODO: translate "Organization Overview"
    , 'org.overview.subtitle.agency': '' // TODO: translate "KPIs by client, tasks, and active links"
    , 'org.overview.subtitle.artist': '' // TODO: translate "Upcoming shows and travel, monthly KPIs"
    , 'org.members.title': '' // TODO: translate "Members"
    , 'members.invite': '' // TODO: translate "Invite"
    , 'members.seats.usage': '' // TODO: translate "Seat usage: 5/5 internal, 0/5 guests"
    , 'org.clients.title': '' // TODO: translate "Clients"
    , 'org.teams.title': '' // TODO: translate "Teams"
    , 'org.links.title': '' // TODO: translate "Links"
    , 'org.branding.title': '' // TODO: translate "Branding"
    , 'org.documents.title': '' // TODO: translate "Documents"
    , 'org.reports.title': '' // TODO: translate "Reports"
    , 'org.integrations.title': '' // TODO: translate "Integrations"
    , 'org.billing.title': '' // TODO: translate "Billing"
    , 'labels.seats.used': '' // TODO: translate "Seats used"
    , 'labels.seats.guests': '' // TODO: translate "Guests"
    , 'export.options': '' // TODO: translate "Export options"
    , 'export.columns': '' // TODO: translate "Columns"
    , 'export.csv': '' // TODO: translate "CSV"
    , 'export.xlsx': '' // TODO: translate "XLSX"
    , 'common.exporting': '' // TODO: translate "Exporting…"
    , 'charts.viewTable': '' // TODO: translate "View data as table"
    , 'charts.hideTable': '' // TODO: translate "Hide table"
    , 'finance.period.mtd': '' // TODO: translate "MTD"
    , 'finance.period.lastMonth': '' // TODO: translate "Last month"
    , 'finance.period.ytd': '' // TODO: translate "YTD"
    , 'finance.period.custom': '' // TODO: translate "Custom"
    , 'finance.period.closed': '' // TODO: translate "Closed"
    , 'finance.period.open': '' // TODO: translate "Open"
    , 'finance.closeMonth': '' // TODO: translate "Close Month"
    , 'finance.reopenMonth': '' // TODO: translate "Reopen Month"
    , 'finance.closed.help': '' // TODO: translate "Month is closed. Reopen to make changes."
    , 'finance.kpi.mtdNet': '' // TODO: translate "MTD Net"
    , 'finance.kpi.ytdNet': '' // TODO: translate "YTD Net"
    , 'finance.kpi.forecastEom': '' // TODO: translate "Forecast EOM"
    , 'finance.kpi.deltaTarget': '' // TODO: translate "Δ vs Target"
    , 'finance.kpi.gm': '' // TODO: translate "GM%"
    , 'finance.kpi.dso': '' // TODO: translate "DSO"
    , 'finance.comparePrev': '' // TODO: translate "Compare vs previous"
    , 'finance.export.csv.success': '' // TODO: translate "CSV exported ✓"
    , 'finance.export.xlsx.success': '' // TODO: translate "XLSX exported ✓"
    , 'finance.v2.footer': '' // TODO: translate "AR top debtors and row actions coming next."
    , 'finance.pl.caption': '' // TODO: translate "Profit and Loss ledger. Use column headers to sort. Virtualized list shows a subset of rows."
    , 'common.rowsVisible': '' // TODO: translate "Rows visible"
    , 'finance.whtPct': '' // TODO: translate "WHT %"
    , 'finance.wht': '' // TODO: translate "WHT"
    , 'finance.mgmtPct': '' // TODO: translate "Mgmt %"
    , 'finance.bookingPct': '' // TODO: translate "Booking %"
    , 'finance.breakdown.by': '' // TODO: translate "Breakdown by"
    , 'finance.breakdown.empty': '' // TODO: translate "No breakdown available"
    , 'finance.delta': '' // TODO: translate "Δ"
    , 'finance.deltaVsPrev': '' // TODO: translate "Δ vs prev"
    , 'common.comingSoon': '' // TODO: translate "Coming soon"
    , 'finance.expected': '' // TODO: translate "Expected (stage-weighted)"
    , 'finance.ar.title': '' // TODO: translate "AR aging & top debtors"
    , 'common.moreActions': '' // TODO: translate "More actions"
    , 'actions.copyRow': '' // TODO: translate "Copy row"
    , 'actions.exportRowCsv': '' // TODO: translate "Export row (CSV)"
    , 'actions.goToShow': '' // TODO: translate "Go to show"
    , 'actions.openCosts': '' // TODO: translate "Open costs"
    , 'shows.table.route': '' // TODO: translate "Route"
    , 'finance.targets.title': '' // TODO: translate "Targets"
    , 'finance.targets.revenue': '' // TODO: translate "Revenue target"
    , 'finance.targets.net': '' // TODO: translate "Net target"
    , 'finance.targets.hint': '' // TODO: translate "Targets are local to this device for now."
    , 'finance.targets.noNegative': '' // TODO: translate "Targets cannot be negative"
    , 'filters.title': '' // TODO: translate "Filters"
    , 'filters.region': '' // TODO: translate "Region"
    , 'filters.from': '' // TODO: translate "From"
    , 'filters.to': '' // TODO: translate "To"
    , 'filters.currency': '' // TODO: translate "Currency"
    , 'filters.presentation': '' // TODO: translate "Presentation mode"
    , 'filters.shortcutHint': '' // TODO: translate "Ctrl/Cmd+K – open filters"
    , 'filters.appliedRange': '' // TODO: translate "Applied range"
    , 'layout.team': '' // TODO: translate "Team"
    , 'layout.highContrast': '' // TODO: translate "High Contrast"
    , 'layout.tenant': '' // TODO: translate "Tenant"
    , 'access.readOnly': '' // TODO: translate "read-only"
    , 'layout.viewingAs': '' // TODO: translate "Viewing as"
    , 'layout.viewAsExit': '' // TODO: translate "Exit"
    , 'access.readOnly.tooltip': '' // TODO: translate "Finance exports disabled for agency demo"
    , 'lab.drag': '' // TODO: translate "Drag"
    , 'lab.moveUp': '' // TODO: translate "Move up"
    , 'lab.moveDown': '' // TODO: translate "Move down"
    , 'lab.reset': '' // TODO: translate "Reset to template"
    , 'lab.back': '' // TODO: translate "Back to Dashboard"
    , 'lab.layoutName': '' // TODO: translate "Layout name"
    , 'lab.save': '' // TODO: translate "Save layout"
    , 'lab.apply': '' // TODO: translate "Apply…"
    , 'lab.delete': '' // TODO: translate "Delete…"
    , 'lab.export': '' // TODO: translate "Export"
    , 'lab.import': '' // TODO: translate "Import"
    , 'lab.dropHere': '' // TODO: translate "Drop widgets here"
    , 'lab.header': '' // TODO: translate "Mission Control Lab"
    , 'lab.subheader': '' // TODO: translate "Drag, reorder, and resize dashboard widgets. Experimental."
    , 'lab.template': '' // TODO: translate "Template"
    , 'lab.resetToTemplate': '' // TODO: translate "Reset to template"
    , 'lab.backToDashboard': '' // TODO: translate "Back to Dashboard"
    , 'lab.applySaved': '' // TODO: translate "Apply…"
    , 'lab.deleteSaved': '' // TODO: translate "Delete…"
    , 'dashboard.title': '' // TODO: translate "Tour Command Center"
    , 'dashboard.subtitle': '' // TODO: translate "Monitor your tour performance, mission status, and take action on what matters most"
    , 'dashboard.map.title': '' // TODO: translate "Tour Map"
    , 'dashboard.activity.title': '' // TODO: translate "Recent Activity"
    , 'dashboard.actions.title': '' // TODO: translate "Quick Actions"
    , 'dashboard.actions.newShow': '' // TODO: translate "Add New Show"
    , 'dashboard.actions.quickFinance': '' // TODO: translate "Quick Finance Check"
    , 'dashboard.actions.travelBooking': '' // TODO: translate "Book Travel"
    , 'dashboard.areas.finance.title': '' // TODO: translate "Finance"
    , 'dashboard.areas.finance.description': '' // TODO: translate "Track revenue, costs, and profitability"
    , 'dashboard.areas.shows.title': '' // TODO: translate "Shows & Events"
    , 'dashboard.areas.shows.description': '' // TODO: translate "Manage performances and venues"
    , 'dashboard.areas.travel.title': '' // TODO: translate "Travel & Logistics"
    , 'dashboard.areas.travel.description': '' // TODO: translate "Plan and track travel arrangements"
    , 'dashboard.areas.missionControl.title': '' // TODO: translate "Mission Control Lab"
    , 'dashboard.areas.missionControl.description': '' // TODO: translate "Advanced mission control with customizable widgets"
    , 'dashboard.kpi.financialHealth': '' // TODO: translate "Financial Health"
    , 'dashboard.kpi.nextEvent': '' // TODO: translate "Next Critical Event"
    , 'dashboard.kpi.ticketSales': '' // TODO: translate "Ticket Sales"
    , 'actions.toast.export': '' // TODO: translate "Export copied"
    , 'actions.import.prompt': '' // TODO: translate "Paste Lab layouts JSON"
    , 'actions.toast.imported': '' // TODO: translate "Imported"
    , 'actions.toast.import_invalid': '' // TODO: translate "Invalid JSON"
    , 'actions.newArtist': '' // TODO: translate "New artist"
    , 'actions.connectExisting': '' // TODO: translate "Connect existing"
    , 'actions.editScopes': '' // TODO: translate "Edit scopes"
    , 'actions.revoke': '' // TODO: translate "Revoke"
    , 'actions.exportPdf': '' // TODO: translate "Export PDF"
    , 'branding.uploadLogo': '' // TODO: translate "Upload logo"
    , 'branding.editColors': '' // TODO: translate "Edit colors"
    , 'common.upload': '' // TODO: translate "Upload"
    , 'common.newFolder': '' // TODO: translate "New folder"
    , 'live.up': '' // TODO: translate "up"
    , 'live.down': '' // TODO: translate "down"
    , 'live.flat': '' // TODO: translate "flat"
    , 'nav.profile': '' // TODO: translate "Profile"
    , 'nav.changeOrg': '' // TODO: translate "Change organization"
    , 'nav.logout': '' // TODO: translate "Logout"
    , 'profile.title': '' // TODO: translate "Profile"
    , 'profile.personal': '' // TODO: translate "Personal"
    , 'profile.security': '' // TODO: translate "Security"
    , 'profile.notifications': '' // TODO: translate "Notifications"
    , 'profile.save': '' // TODO: translate "Save"
    , 'profile.saved': '' // TODO: translate "Saved ✓"
    , 'profile.avatarUrl': '' // TODO: translate "Avatar URL"
    , 'profile.bio': '' // TODO: translate "Bio"
    , 'profile.notify.email': '' // TODO: translate "Email updates"
    , 'profile.notify.slack': '' // TODO: translate "Slack notifications"
    , 'profile.notify.hint': '' // TODO: translate "These preferences affect demo notifications only"
    , 'profile.memberships': '' // TODO: translate "Memberships"
    , 'profile.defaultOrg': '' // TODO: translate "Default organization"
    , 'profile.setDefault': '' // TODO: translate "Set default"
    , 'profile.dataPrivacy': '' // TODO: translate "Data & privacy"
    , 'profile.exportData': '' // TODO: translate "Export my demo data"
    , 'profile.clearData': '' // TODO: translate "Clear and reseed demo data"
    , 'profile.export.ready': '' // TODO: translate "Data export ready"
    , 'profile.error.name': '' // TODO: translate "Name is required"
    , 'profile.error.email': '' // TODO: translate "Email is required"
    , 'prefs.title': '' // TODO: translate "Preferences"
    , 'prefs.appearance': '' // TODO: translate "Appearance"
    , 'prefs.language': '' // TODO: translate "Language"
    , 'prefs.theme': '' // TODO: translate "Theme"
    , 'prefs.highContrast': '' // TODO: translate "High contrast"
    , 'prefs.finance.currency': '' // TODO: translate "Currency"
    , 'prefs.units': '' // TODO: translate "Distance units"
    , 'prefs.presentation': '' // TODO: translate "Presentation mode"
    , 'prefs.comparePrev': '' // TODO: translate "Compare vs previous"
    , 'prefs.defaultRegion': '' // TODO: translate "Default region"
    , 'prefs.defaultStatuses': '' // TODO: translate "Default statuses"
    , 'prefs.help.language': '' // TODO: translate "Affects labels and date/number formatting."
    , 'prefs.help.theme': '' // TODO: translate "Choose light or dark based on your environment."
    , 'prefs.help.highContrast': '' // TODO: translate "Improves contrast and focus rings for readability."
    , 'prefs.help.currency': '' // TODO: translate "Sets default currency for dashboards and exports."
    , 'prefs.help.units': '' // TODO: translate "Used for travel distances and map overlays."
    , 'prefs.help.presentation': '' // TODO: translate "Larger text, simplified animations for demos."
    , 'prefs.help.comparePrev': '' // TODO: translate "Shows deltas against the previous period."
    , 'prefs.help.region': '' // TODO: translate "Preselects region filters in dashboards."
    , 'subnav.ariaLabel': '' // TODO: translate "Sections"
    , 'breadcrumb.home': '' // TODO: translate "Home"
    , 'home.seo.title': '' // TODO: translate "On Tour App - Tour Management & Finance Dashboard"
    , 'home.seo.description': '' // TODO: translate "Professional tour management platform with real-time finance tracking, venue booking, and performance analytics for artists and managers."
    , 'home.seo.keywords': '' // TODO: translate "tour management, concert booking, artist finance, venue management, performance analytics, live music"
    , 'comparison.title': '' // TODO: translate "From Spreadsheet Chaos to App Clarity"
    , 'comparison.subtitle': '' // TODO: translate "See how your tour management evolves from fragmented Excel files to a unified, intelligent platform."
    , 'comparison.excel.title': '' // TODO: translate "Excel Chaos"
    , 'comparison.excel.problem1': '' // TODO: translate "Scattered files across devices and emails"
    , 'comparison.excel.problem2': '' // TODO: translate "Manual calculations prone to errors"
    , 'comparison.excel.problem3': '' // TODO: translate "No real-time collaboration or notifications"
    , 'comparison.excel.problem4': '' // TODO: translate "Lost context in endless tabs and comments"
    , 'comparison.app.title': '' // TODO: translate "App Clarity"
    , 'comparison.app.benefit1': '' // TODO: translate "Unified dashboard with live data sync"
    , 'comparison.app.benefit2': '' // TODO: translate "Automated calculations and error detection"
    , 'comparison.app.benefit3': '' // TODO: translate "Real-time collaboration and smart notifications"
    , 'comparison.app.benefit4': '' // TODO: translate "Context-aware insights and predictive alerts"
    , 'comparison.benefit1.title': '' // TODO: translate "Smart Finance Tracking"
    , 'comparison.benefit1.desc': '' // TODO: translate "Automatic profit calculations, cost analysis, and budget alerts."
    , 'comparison.benefit2.title': '' // TODO: translate "Live Tour Mapping"
    , 'comparison.benefit2.desc': '' // TODO: translate "Interactive maps with route optimization and venue intelligence."
    , 'comparison.benefit3.title': '' // TODO: translate "Instant Insights"
    , 'comparison.benefit3.desc': '' // TODO: translate "AI-powered recommendations and risk detection in real-time."
    , 'metamorphosis.title': '' // TODO: translate "From scattered noise to a living control panel"
    , 'metamorphosis.subtitle': '' // TODO: translate "Instead of spreadsheets mutating chaotically and critical context buried in comments, every data point flows into a single orchestrated surface. The system reconciles, validates, and highlights what matters."
    , 'dashboard.offerConfirmed': '' // TODO: translate "Offer → Confirmed"
    , 'dashboard.tourHealthScore': '' // TODO: translate "Tour Health Score"
    , 'dashboard.healthFactors': '' // TODO: translate "Health Factors"
    , 'dashboard.keyInsights': '' // TODO: translate "Key Insights"
    , 'dashboard.confidence': '' // TODO: translate "Confidence"
    , 'dashboard.current': '' // TODO: translate "Current"
    , 'dashboard.predicted': '' // TODO: translate "Predicted"
    , 'dashboard.expectedChange': '' // TODO: translate "Expected change"
    , 'dashboard.scheduleGap': '' // TODO: translate "Schedule gap"
    , 'dashboard.allSystemsReady': '' // TODO: translate "All systems ready"
    , 'dashboard.loadingMap': '' // TODO: translate "Loading map…"
    , 'placeholder.username': '' // TODO: translate "you@example.com or username"
    , 'placeholder.bio': '' // TODO: translate "Tell us a bit about yourself and what you do..."
    , 'placeholder.cityName': '' // TODO: translate "Enter city name..."
    , 'placeholder.notes': '' // TODO: translate "Add any additional notes..."
    , 'placeholder.searchCommand': '' // TODO: translate "Search shows, navigate, or type a command..."
    , 'placeholder.expenseDescription': '' // TODO: translate "e.g., Flight tickets, Hotel booking..."
    , 'placeholder.expenseDetails': '' // TODO: translate "Add any additional details, invoice numbers, or context..."
    , 'placeholder.origin': '' // TODO: translate "Origin (e.g., BCN)"
    , 'placeholder.destination': '' // TODO: translate "Destination (e.g., AMS)"
    , 'placeholder.bookingRef': '' // TODO: translate "Booking reference or flight number"
    , 'placeholder.airport': '' // TODO: translate "City or airport..."
```

### Detailed Translation Table

| Key | English Original | Your Translation |
|-----|------------------|------------------|
| `scopes.tooltip.shows` | Shows access granted by link | _[translate here]_ |
| `scopes.tooltip.travel` | Travel access granted by link | _[translate here]_ |
| `scopes.tooltip.finance` | Finance: read-only per link policy | _[translate here]_ |
| `kpi.shows` | Shows | _[translate here]_ |
| `kpi.net` | Net | _[translate here]_ |
| `kpi.travel` | Travel | _[translate here]_ |
| `cmd.go.profile` | Go to profile | _[translate here]_ |
| `cmd.go.preferences` | Go to preferences | _[translate here]_ |
| `common.copyLink` | Copy link | _[translate here]_ |
| `common.learnMore` | Learn more | _[translate here]_ |
| `insights.thisMonthTotal` | This Month Total | _[translate here]_ |
| `insights.statusBreakdown` | Status breakdown | _[translate here]_ |
| `insights.upcoming14d` | Upcoming 14d | _[translate here]_ |
| `common.openShow` | Open show | _[translate here]_ |
| `common.centerMap` | Center map | _[translate here]_ |
| `common.dismiss` | Dismiss | _[translate here]_ |
| `common.snooze7` | Snooze 7 days | _[translate here]_ |
| `common.snooze30` | Snooze 30 days | _[translate here]_ |
| `common.on` | on | _[translate here]_ |
| `common.off` | off | _[translate here]_ |
| `common.hide` | Hide | _[translate here]_ |
| `common.pin` | Pin | _[translate here]_ |
| `common.unpin` | Unpin | _[translate here]_ |
| `common.map` | Map | _[translate here]_ |
| `layout.invite` | Invite | _[translate here]_ |
| `layout.build` | Build: preview | _[translate here]_ |
| `layout.demo` | Status: demo feed | _[translate here]_ |
| `alerts.title` | Alert Center | _[translate here]_ |
| `alerts.anySeverity` | Any severity | _[translate here]_ |
| `alerts.anyRegion` | Any region | _[translate here]_ |
| `alerts.anyTeam` | Any team | _[translate here]_ |
| `alerts.copySlack` | Copy Slack | _[translate here]_ |
| `alerts.copied` | Copied \u2713 | _[translate here]_ |
| `alerts.noAlerts` | No alerts | _[translate here]_ |
| `map.openInDashboard` | Open in dashboard | _[translate here]_ |
| `auth.login` | Login | _[translate here]_ |
| `auth.chooseUser` | Choose a demo user | _[translate here]_ |
| `auth.enterAs` | Enter as {name} | _[translate here]_ |
| `auth.role.owner` | Artist (Owner) | _[translate here]_ |
| `auth.role.agencyManager` | Agency Manager | _[translate here]_ |
| `auth.role.artistManager` | Artist Team (Manager) | _[translate here]_ |
| `auth.scope.finance.ro` | Finance: read-only | _[translate here]_ |
| `auth.scope.edit.showsTravel` | Edit shows/travel | _[translate here]_ |
| `auth.scope.full` | Full access | _[translate here]_ |
| `login.title` | Welcome to On Tour | _[translate here]_ |
| `login.subtitle` | Your tour management command center | _[translate here]_ |
| `login.enterAs` | Enter as {name} | _[translate here]_ |
| `login.quick.agency` | Enter as Shalizi (agency) | _[translate here]_ |
| `login.quick.artist` | Enter as Danny (artist) | _[translate here]_ |
| `login.remember` | Remember me | _[translate here]_ |
| `login.usernameOrEmail` | Username or Email | _[translate here]_ |
| `role.agencyManager` | Agency Manager | _[translate here]_ |
| `role.artistOwner` | Artist (Owner) | _[translate here]_ |
| `role.artistManager` | Artist Team (Manager) | _[translate here]_ |
| `scope.shows.write` | shows: write | _[translate here]_ |
| `scope.shows.read` | shows: read | _[translate here]_ |
| `scope.travel.book` | travel: book | _[translate here]_ |
| `scope.travel.read` | travel: read | _[translate here]_ |
| `scope.finance.read` | finance: read | _[translate here]_ |
| `scope.finance.none` | finance: none | _[translate here]_ |
| `hero.enter` | Enter | _[translate here]_ |
| `marketing.nav.features` | Features | _[translate here]_ |
| `marketing.nav.product` | Product | _[translate here]_ |
| `marketing.nav.pricing` | Pricing | _[translate here]_ |
| `marketing.nav.testimonials` | Testimonials | _[translate here]_ |
| `marketing.nav.cta` | Get started | _[translate here]_ |
| `marketing.cta.primary` | Start free | _[translate here]_ |
| `marketing.cta.secondary` | Watch demo | _[translate here]_ |
| `marketing.cta.login` | Log in | _[translate here]_ |
| `hero.demo.artist` | View demo as Danny | _[translate here]_ |
| `hero.demo.agency` | View demo as Adam | _[translate here]_ |
| `hero.persona.question` | I am a... | _[translate here]_ |
| `hero.persona.artist` | Artist / Manager | _[translate here]_ |
| `hero.persona.agency` | Agency | _[translate here]_ |
| `hero.subtitle.artist` | Take control of your finances and tour logistics. See your career from a single dashboard. | _[translate here]_ |
| `hero.subtitle.agency` | Manage your entire roster from one place. Give your artists visibility and generate reports in seconds. | _[translate here]_ |
| `home.action.title` | Stop Surviving. Start Commanding. | _[translate here]_ |
| `home.action.subtitle` | See how On Tour App can transform your next tour. | _[translate here]_ |
| `home.action.cta` | Request a Personalized Demo | _[translate here]_ |
| `inside.map.desc.artist` | Visualize your tour route and anticipate travel needs | _[translate here]_ |
| `inside.finance.desc.artist` | Track your earnings, expenses and profitability in real-time | _[translate here]_ |
| `inside.actions.desc.artist` | Stay on top of contracts, payments and upcoming deadlines | _[translate here]_ |
| `inside.map.desc.agency` | Monitor all your artists\ | _[translate here]_ |
| `inside.finance.desc.agency` | Consolidated financial overview across your entire roster | _[translate here]_ |
| `inside.actions.desc.agency` | Centralized task management for team coordination and client updates | _[translate here]_ |
| `inside.title` | What you | _[translate here]_ |
| `shows.summary.avgFee` | Avg Fee | _[translate here]_ |
| `shows.summary.avgMargin` | Avg Margin | _[translate here]_ |
| `inside.map.title` | Map | _[translate here]_ |
| `inside.map.desc` | Live HUD with shows, route and risks | _[translate here]_ |
| `inside.finance.title` | Finance | _[translate here]_ |
| `inside.finance.desc` | Monthly KPIs, pipeline and forecast | _[translate here]_ |
| `inside.actions.title` | Actions | _[translate here]_ |
| `inside.actions.desc` | Action Hub with priorities and shortcuts | _[translate here]_ |
| `how.title` | How it works | _[translate here]_ |
| `how.step.invite` | Invite your team | _[translate here]_ |
| `how.step.connect` | Connect with artists or agencies | _[translate here]_ |
| `how.step.views` | Work by views: HUD, Finance, Shows | _[translate here]_ |
| `how.step.connectData` | Connect your data | _[translate here]_ |
| `how.step.connectData.desc` | Import shows, connect calendar, or get invited by your agency | _[translate here]_ |
| `how.step.visualize` | Visualize your world | _[translate here]_ |
| `how.step.visualize.desc` | Your tour comes alive on the map, finances clarify in the dashboard | _[translate here]_ |
| `how.step.act` | Act with intelligence | _[translate here]_ |
| `how.step.connectData.artist` | Import your shows, connect your calendar, or get invited by your agency. Your tour data in one place. | _[translate here]_ |
| `how.step.connectData.agency` | Invite your artists and connect their data. Centralize all tour information across your roster. | _[translate here]_ |
| `how.step.visualize.artist` | Your tour comes alive on the map, finances clarify in your personal dashboard. See your career at a glance. | _[translate here]_ |
| `how.step.visualize.agency` | Monitor all artists\ | _[translate here]_ |
| `how.step.act.artist` | Receive proactive alerts about contracts, payments, and deadlines. Make data-driven decisions with confidence. | _[translate here]_ |
| `how.step.act.agency` | Prioritize team tasks, generate reports instantly, and keep all stakeholders informed with real-time updates. | _[translate here]_ |
| `how.multiTenant` | Multi-tenant demo: switch between Agency and Artist contexts | _[translate here]_ |
| `trust.privacy` | Privacy: local demo (your browser) | _[translate here]_ |
| `trust.accessibility` | Accessibility: shortcuts “?” | _[translate here]_ |
| `trust.support` | Support | _[translate here]_ |
| `trust.demo` | Local demo — no data uploaded | _[translate here]_ |
| `testimonials.title` | Trusted by Industry Leaders | _[translate here]_ |
| `testimonials.subtitle` | Real stories from the touring industry | _[translate here]_ |
| `testimonials.subtitle.artist` | See how artists are taking control of their careers | _[translate here]_ |
| `testimonials.subtitle.agency` | Discover how agencies are transforming their operations | _[translate here]_ |
| `common.skipToContent` | Skip to content | _[translate here]_ |
| `alerts.slackCopied` | Slack payload copied | _[translate here]_ |
| `alerts.copyManual` | Open window to copy manually | _[translate here]_ |
| `ah.title` | Action Hub | _[translate here]_ |
| `ah.tab.pending` | Pending | _[translate here]_ |
| `ah.tab.shows` | This Month | _[translate here]_ |
| `ah.tab.travel` | Travel | _[translate here]_ |
| `ah.tab.insights` | Insights | _[translate here]_ |
| `ah.filter.all` | All | _[translate here]_ |
| `ah.filter.risk` | Risk | _[translate here]_ |
| `ah.filter.urgency` | Urgency | _[translate here]_ |
| `ah.filter.opportunity` | Opportunity | _[translate here]_ |
| `ah.filter.offer` | Offer | _[translate here]_ |
| `ah.filter.finrisk` | Finrisk | _[translate here]_ |
| `ah.cta.addTravel` | Add travel | _[translate here]_ |
| `ah.cta.followUp` | Follow up | _[translate here]_ |
| `ah.cta.review` | Review | _[translate here]_ |
| `ah.cta.open` | Open | _[translate here]_ |
| `ah.empty` | All caught up! | _[translate here]_ |
| `ah.openTravel` | Open Travel | _[translate here]_ |
| `ah.done` | Done | _[translate here]_ |
| `ah.typeFilter` | Type filter | _[translate here]_ |
| `ah.why` | Why? | _[translate here]_ |
| `ah.why.title` | Why this priority? | _[translate here]_ |
| `ah.why.score` | Score | _[translate here]_ |
| `ah.why.impact` | Impact | _[translate here]_ |
| `ah.why.amount` | Amount | _[translate here]_ |
| `ah.why.inDays` | In | _[translate here]_ |
| `ah.why.overdue` | Overdue | _[translate here]_ |
| `ah.why.kind` | Type | _[translate here]_ |
| `finance.quicklook` | Finance Quicklook | _[translate here]_ |
| `finance.ledger` | Ledger | _[translate here]_ |
| `finance.targets` | Targets | _[translate here]_ |
| `finance.targets.month` | Monthly targets | _[translate here]_ |
| `finance.targets.year` | Yearly targets | _[translate here]_ |
| `finance.pipeline` | Pipeline | _[translate here]_ |
| `finance.pipeline.subtitle` | Expected value (weighted by stage) | _[translate here]_ |
| `finance.openFull` | Open full finance | _[translate here]_ |
| `finance.pivot` | Pivot | _[translate here]_ |
| `finance.pivot.group` | Group | _[translate here]_ |
| `finance.ar.view` | View | _[translate here]_ |
| `finance.ar.remind` | Remind | _[translate here]_ |
| `finance.ar.reminder.queued` | Reminder queued | _[translate here]_ |
| `finance.thisMonth` | This Month | _[translate here]_ |
| `finance.income` | Income | _[translate here]_ |
| `finance.expenses` | Expenses | _[translate here]_ |
| `finance.net` | Net | _[translate here]_ |
| `finance.byStatus` | By status | _[translate here]_ |
| `finance.byMonth` | by month | _[translate here]_ |
| `finance.confirmed` | Confirmed | _[translate here]_ |
| `finance.pending` | Pending | _[translate here]_ |
| `finance.compare` | Compare prev | _[translate here]_ |
| `charts.resetZoom` | Reset zoom | _[translate here]_ |
| `common.current` | Current | _[translate here]_ |
| `common.compare` | Compare | _[translate here]_ |
| `common.reminder` | Reminder | _[translate here]_ |
| `finance.ui.view` | View | _[translate here]_ |
| `finance.ui.classic` | Classic | _[translate here]_ |
| `finance.ui.beta` | New (beta) | _[translate here]_ |
| `finance.offer` | Offer | _[translate here]_ |
| `finance.shows` | shows | _[translate here]_ |
| `finance.noShowsMonth` | No shows this month | _[translate here]_ |
| `finance.hideAmounts` | Hide amounts | _[translate here]_ |
| `finance.hidden` | Hidden | _[translate here]_ |
| `common.open` | Open | _[translate here]_ |
| `common.apply` | Apply | _[translate here]_ |
| `common.saveView` | Save view | _[translate here]_ |
| `common.import` | Import | _[translate here]_ |
| `common.export` | Export | _[translate here]_ |
| `common.copied` | Copied ✓ | _[translate here]_ |
| `common.markDone` | Mark done | _[translate here]_ |
| `common.hideItem` | Hide | _[translate here]_ |
| `views.import.invalidShape` | Invalid views JSON shape | _[translate here]_ |
| `views.import.invalidJson` | Invalid JSON | _[translate here]_ |
| `common.tomorrow` | Tomorrow | _[translate here]_ |
| `common.go` | Go | _[translate here]_ |
| `common.show` | Show | _[translate here]_ |
| `common.search` | Search | _[translate here]_ |
| `hud.next3weeks` | Next 3 weeks | _[translate here]_ |
| `hud.noTrips3weeks` | No upcoming trips in 3 weeks | _[translate here]_ |
| `hud.openShow` | open show | _[translate here]_ |
| `hud.openTrip` | open travel | _[translate here]_ |
| `hud.view.whatsnext` | What | _[translate here]_ |
| `hud.view.month` | This Month | _[translate here]_ |
| `hud.view.financials` | Financials | _[translate here]_ |
| `hud.view.whatsnext.desc` | Upcoming 14 day summary | _[translate here]_ |
| `hud.view.month.desc` | Monthly financial & show snapshot | _[translate here]_ |
| `hud.view.financials.desc` | Financial intelligence breakdown | _[translate here]_ |
| `hud.layer.heat` | Heat | _[translate here]_ |
| `hud.layer.status` | Status | _[translate here]_ |
| `hud.layer.route` | Route | _[translate here]_ |
| `hud.views` | HUD views | _[translate here]_ |
| `hud.layers` | Map layers | _[translate here]_ |
| `hud.missionControl` | Mission Control | _[translate here]_ |
| `hud.subtitle` | Realtime map and upcoming shows | _[translate here]_ |
| `hud.risks` | Risks | _[translate here]_ |
| `hud.assignProducer` | Assign producer | _[translate here]_ |
| `hud.mapLoadError` | Map failed to load. Please retry. | _[translate here]_ |
| `common.retry` | Retry | _[translate here]_ |
| `hud.viewChanged` | View changed to | _[translate here]_ |
| `hud.openEvent` | open event | _[translate here]_ |
| `hud.type.flight` | Flight | _[translate here]_ |
| `hud.type.ground` | Ground | _[translate here]_ |
| `hud.type.event` | Event | _[translate here]_ |
| `hud.fin.avgNetMonth` | Avg Net (Month) | _[translate here]_ |
| `hud.fin.runRateYear` | Run Rate (Year) | _[translate here]_ |
| `finance.forecast` | Forecast vs Actual | _[translate here]_ |
| `finance.forecast.legend.actual` | Actual net | _[translate here]_ |
| `finance.forecast.legend.p50` | Forecast p50 | _[translate here]_ |
| `finance.forecast.legend.band` | Confidence band | _[translate here]_ |
| `finance.forecast.alert.under` | Under forecast by | _[translate here]_ |
| `finance.forecast.alert.above` | Above optimistic by | _[translate here]_ |
| `map.toggle.status` | Toggle status markers | _[translate here]_ |
| `map.toggle.route` | Toggle route line | _[translate here]_ |
| `map.toggle.heat` | Toggle heat circles | _[translate here]_ |
| `shows.exportCsv` | Export CSV | _[translate here]_ |
| `shows.filters.from` | From | _[translate here]_ |
| `shows.filters.to` | To | _[translate here]_ |
| `shows.items` | items | _[translate here]_ |
| `shows.date.presets` | Presets | _[translate here]_ |
| `shows.date.thisMonth` | This Month | _[translate here]_ |
| `shows.date.nextMonth` | Next Month | _[translate here]_ |
| `shows.tooltip.net` | Fee minus WHT, commissions, and costs | _[translate here]_ |
| `shows.tooltip.margin` | Net divided by Fee (%) | _[translate here]_ |
| `shows.table.margin` | Margin % | _[translate here]_ |
| `shows.editor.margin.formula` | Margin % = Net/Fee | _[translate here]_ |
| `shows.tooltip.wht` | Withholding tax percentage applied to the fee | _[translate here]_ |
| `shows.editor.label.name` | Show name | _[translate here]_ |
| `shows.editor.placeholder.name` | Festival or show name | _[translate here]_ |
| `shows.editor.placeholder.venue` | Venue name | _[translate here]_ |
| `shows.editor.help.venue` | Optional venue / room name | _[translate here]_ |
| `shows.editor.help.fee` | Gross fee agreed (before taxes, commissions, costs) | _[translate here]_ |
| `shows.editor.help.wht` | Local withholding tax percentage (auto-suggested by country) | _[translate here]_ |
| `shows.editor.saving` | Saving… | _[translate here]_ |
| `shows.editor.saved` | Saved ✓ | _[translate here]_ |
| `shows.editor.save.error` | Save failed | _[translate here]_ |
| `shows.editor.cost.templates` | Templates | _[translate here]_ |
| `shows.editor.cost.addTemplate` | Add template | _[translate here]_ |
| `shows.editor.cost.subtotals` | Subtotals | _[translate here]_ |
| `shows.editor.cost.type` | Type | _[translate here]_ |
| `shows.editor.cost.amount` | Amount | _[translate here]_ |
| `shows.editor.cost.desc` | Description | _[translate here]_ |
| `shows.editor.status.help` | Current lifecycle state of the show | _[translate here]_ |
| `shows.editor.cost.template.travel` | Travel basics | _[translate here]_ |
| `shows.editor.cost.template.production` | Production basics | _[translate here]_ |
| `shows.editor.cost.template.marketing` | Marketing basics | _[translate here]_ |
| `shows.editor.quick.label` | Quick add costs | _[translate here]_ |
| `shows.editor.quick.hint` | e.g., Hotel 1200 | _[translate here]_ |
| `shows.editor.quick.placeholder` | 20/04/2025  | _[translate here]_ |
| `shows.editor.quick.preview.summary` | Will set: {fields} | _[translate here]_ |
| `shows.editor.quick.apply` | Apply | _[translate here]_ |
| `shows.editor.quick.parseError` | Cannot interpret | _[translate here]_ |
| `shows.editor.quick.applied` | Quick entry applied | _[translate here]_ |
| `shows.editor.bulk.title` | Bulk add costs | _[translate here]_ |
| `shows.editor.bulk.open` | Bulk add | _[translate here]_ |
| `shows.editor.bulk.placeholder` | Type, Amount, Description\nTravel, 1200, Flights BCN-MAD\nProduction\t500\tBackline | _[translate here]_ |
| `shows.editor.bulk.preview` | Preview | _[translate here]_ |
| `shows.editor.bulk.parsed` | Parsed {count} lines | _[translate here]_ |
| `shows.editor.bulk.add` | Add costs | _[translate here]_ |
| `shows.editor.bulk.cancel` | Cancel | _[translate here]_ |
| `shows.editor.bulk.invalidLine` | Invalid line {n} | _[translate here]_ |
| `shows.editor.bulk.empty` | No valid lines | _[translate here]_ |
| `shows.editor.bulk.help` | Paste CSV or tab-separated lines: Type, Amount, Description (amount optional) | _[translate here]_ |
| `shows.editor.restored` | Restored draft | _[translate here]_ |
| `shows.editor.quick.icon.date` | Date | _[translate here]_ |
| `shows.editor.quick.icon.city` | City | _[translate here]_ |
| `shows.editor.quick.icon.country` | Country | _[translate here]_ |
| `shows.editor.quick.icon.fee` | Fee | _[translate here]_ |
| `shows.editor.quick.icon.whtPct` | WHT % | _[translate here]_ |
| `shows.editor.quick.icon.name` | Name | _[translate here]_ |
| `shows.editor.cost.templateMenu` | Cost templates | _[translate here]_ |
| `shows.editor.cost.template.applied` | Template applied | _[translate here]_ |
| `shows.editor.cost.duplicate` | Duplicate | _[translate here]_ |
| `shows.editor.cost.moveUp` | Move up | _[translate here]_ |
| `shows.editor.cost.moveDown` | Move down | _[translate here]_ |
| `shows.editor.costs.title` | Costs | _[translate here]_ |
| `shows.editor.costs.empty` | No costs yet — add one | _[translate here]_ |
| `shows.editor.costs.recent` | Recent | _[translate here]_ |
| `shows.editor.costs.templates` | Templates | _[translate here]_ |
| `shows.editor.costs.subtotal` | Subtotal {category} | _[translate here]_ |
| `shows.editor.wht.suggest` | Suggest {pct}% | _[translate here]_ |
| `shows.editor.wht.apply` | Apply {pct}% | _[translate here]_ |
| `shows.editor.wht.suggest.applied` | Suggestion applied | _[translate here]_ |
| `shows.editor.wht.tooltip.es` | Typical IRPF in ES: 15% (editable) | _[translate here]_ |
| `shows.editor.wht.tooltip.generic` | Typical withholding suggestion | _[translate here]_ |
| `shows.editor.status.hint` | Change here or via badge | _[translate here]_ |
| `shows.editor.wht.hint.es` | Typical ES withholding: 15% (editable) | _[translate here]_ |
| `shows.editor.wht.hint.generic` | Withholding percentage (editable) | _[translate here]_ |
| `shows.editor.commission.default` | Default {pct}% | _[translate here]_ |
| `shows.editor.commission.overridden` | Override | _[translate here]_ |
| `shows.editor.commission.overriddenIndicator` | Commission overridden | _[translate here]_ |
| `shows.editor.commission.reset` | Reset to default | _[translate here]_ |
| `shows.editor.label.currency` | Currency | _[translate here]_ |
| `shows.editor.help.currency` | Contract currency | _[translate here]_ |
| `shows.editor.fx.rateOn` | Rate | _[translate here]_ |
| `shows.editor.fx.convertedFee` | ≈ {amount} {base} | _[translate here]_ |
| `shows.editor.fx.unavailable` | Rate unavailable | _[translate here]_ |
| `shows.editor.actions.promote` | Promote | _[translate here]_ |
| `shows.editor.actions.planTravel` | Plan travel | _[translate here]_ |
| `shows.editor.state.hint` | Use the badge or this selector | _[translate here]_ |
| `shows.editor.save.create` | Save | _[translate here]_ |
| `shows.editor.save.edit` | Save changes | _[translate here]_ |
| `shows.editor.save.retry` | Retry | _[translate here]_ |
| `shows.editor.tab.active` | Tab {label} active | _[translate here]_ |
| `shows.editor.tab.restored` | Restored last tab: {label} | _[translate here]_ |
| `shows.editor.errors.count` | There are {n} errors | _[translate here]_ |
| `shows.totals.fees` | Fees | _[translate here]_ |
| `shows.totals.net` | Net | _[translate here]_ |
| `shows.totals.hide` | Hide | _[translate here]_ |
| `shows.totals.show` | Show totals | _[translate here]_ |
| `shows.view.list` | List | _[translate here]_ |
| `shows.view.board` | Board | _[translate here]_ |
| `shows.views.none` | Views | _[translate here]_ |
| `views.manage` | Manage views | _[translate here]_ |
| `views.saved` | Saved | _[translate here]_ |
| `views.apply` | Apply | _[translate here]_ |
| `views.none` | No saved views | _[translate here]_ |
| `views.deleted` | Deleted | _[translate here]_ |
| `views.export` | Export | _[translate here]_ |
| `views.import` | Import | _[translate here]_ |
| `views.import.hint` | Paste JSON of views to import | _[translate here]_ |
| `views.openLab` | Open Layout Lab | _[translate here]_ |
| `views.share` | Copy share link | _[translate here]_ |
| `views.export.copied` | Export copied | _[translate here]_ |
| `views.imported` | Views imported | _[translate here]_ |
| `views.import.invalid` | Invalid JSON | _[translate here]_ |
| `views.label` | View | _[translate here]_ |
| `views.names.default` | Default | _[translate here]_ |
| `views.names.finance` | Finance | _[translate here]_ |
| `views.names.operations` | Operations | _[translate here]_ |
| `views.names.promo` | Promotion | _[translate here]_ |
| `demo.banner` | Demo data • No live sync | _[translate here]_ |
| `demo.load` | Load demo data | _[translate here]_ |
| `demo.loaded` | Demo data loaded | _[translate here]_ |
| `demo.clear` | Clear data | _[translate here]_ |
| `demo.cleared` | All data cleared | _[translate here]_ |
| `demo.password.prompt` | Enter demo password | _[translate here]_ |
| `demo.password.invalid` | Incorrect password | _[translate here]_ |
| `shows.views.delete` | Delete | _[translate here]_ |
| `shows.views.namePlaceholder` | View name | _[translate here]_ |
| `shows.views.save` | Save | _[translate here]_ |
| `shows.status.canceled` | Canceled | _[translate here]_ |
| `shows.status.archived` | Archived | _[translate here]_ |
| `shows.status.offer` | Offer | _[translate here]_ |
| `shows.status.pending` | Pending | _[translate here]_ |
| `shows.status.confirmed` | Confirmed | _[translate here]_ |
| `shows.status.postponed` | Postponed | _[translate here]_ |
| `shows.bulk.selected` | selected | _[translate here]_ |
| `shows.bulk.confirm` | Confirm | _[translate here]_ |
| `shows.bulk.promote` | Promote | _[translate here]_ |
| `shows.bulk.export` | Export | _[translate here]_ |
| `shows.notes` | Notes | _[translate here]_ |
| `shows.virtualized.hint` | Virtualized list active | _[translate here]_ |
| `story.title` | Story mode | _[translate here]_ |
| `story.timeline` | Timeline | _[translate here]_ |
| `story.play` | Play | _[translate here]_ |
| `story.pause` | Pause | _[translate here]_ |
| `story.cta` | Story mode | _[translate here]_ |
| `story.scrub` | Scrub timeline | _[translate here]_ |
| `finance.overview` | Finance overview | _[translate here]_ |
| `shows.title` | Shows | _[translate here]_ |
| `shows.notFound` | Show not found | _[translate here]_ |
| `shows.search.placeholder` | Search city/country | _[translate here]_ |
| `shows.add` | Add show | _[translate here]_ |
| `shows.edit` | Edit | _[translate here]_ |
| `shows.summary.upcoming` | Upcoming | _[translate here]_ |
| `shows.summary.totalFees` | Total Fees | _[translate here]_ |
| `shows.summary.estNet` | Est. Net | _[translate here]_ |
| `shows.summary.avgWht` | Avg WHT | _[translate here]_ |
| `shows.table.date` | Date | _[translate here]_ |
| `shows.table.name` | Show | _[translate here]_ |
| `shows.table.city` | City | _[translate here]_ |
| `shows.table.country` | Country | _[translate here]_ |
| `shows.table.venue` | Venue | _[translate here]_ |
| `shows.table.promoter` | Promoter | _[translate here]_ |
| `shows.table.wht` | WHT % | _[translate here]_ |
| `shows.table.type` | Type | _[translate here]_ |
| `shows.table.description` | Description | _[translate here]_ |
| `shows.table.amount` | Amount | _[translate here]_ |
| `shows.table.remove` | Remove | _[translate here]_ |
| `shows.table.agency.mgmt` | Mgmt | _[translate here]_ |
| `shows.table.agency.booking` | Booking | _[translate here]_ |
| `shows.table.agencies` | Agencies | _[translate here]_ |
| `shows.table.notes` | Notes | _[translate here]_ |
| `shows.table.fee` | Fee | _[translate here]_ |
| `shows.selected` | selected | _[translate here]_ |
| `shows.count.singular` | show | _[translate here]_ |
| `shows.count.plural` | shows | _[translate here]_ |
| `settings.title` | Settings | _[translate here]_ |
| `settings.personal` | Personal | _[translate here]_ |
| `settings.preferences` | Preferences | _[translate here]_ |
| `settings.organization` | Organization | _[translate here]_ |
| `settings.billing` | Billing | _[translate here]_ |
| `settings.currency` | Currency | _[translate here]_ |
| `settings.units` | Distance units | _[translate here]_ |
| `settings.agencies` | Agencies | _[translate here]_ |
| `settings.localNote` | Preferences are saved locally on this device. | _[translate here]_ |
| `settings.language` | Language | _[translate here]_ |
| `settings.language.en` | English | _[translate here]_ |
| `settings.language.es` | Spanish | _[translate here]_ |
| `settings.dashboardView` | Default Dashboard View | _[translate here]_ |
| `settings.presentation` | Presentation mode | _[translate here]_ |
| `settings.comparePrev` | Compare vs previous period | _[translate here]_ |
| `settings.defaultStatuses` | Default status filters | _[translate here]_ |
| `settings.defaultRegion` | Default region | _[translate here]_ |
| `settings.region.all` | All | _[translate here]_ |
| `settings.region.AMER` | Americas | _[translate here]_ |
| `settings.region.EMEA` | EMEA | _[translate here]_ |
| `settings.region.APAC` | APAC | _[translate here]_ |
| `settings.agencies.booking` | Booking Agencies | _[translate here]_ |
| `settings.agencies.management` | Management Agencies | _[translate here]_ |
| `settings.agencies.add` | Add | _[translate here]_ |
| `settings.agencies.hideForm` | Hide form | _[translate here]_ |
| `settings.agencies.none` | No agencies | _[translate here]_ |
| `settings.agencies.name` | Name | _[translate here]_ |
| `settings.agencies.commission` | Commission % | _[translate here]_ |
| `settings.agencies.territoryMode` | Territory Mode | _[translate here]_ |
| `settings.agencies.continents` | Continents | _[translate here]_ |
| `settings.agencies.countries` | Countries (comma or space separated ISO2) | _[translate here]_ |
| `settings.agencies.addBooking` | Add booking | _[translate here]_ |
| `settings.agencies.addManagement` | Add management | _[translate here]_ |
| `settings.agencies.reset` | Reset | _[translate here]_ |
| `settings.agencies.remove` | Remove agency | _[translate here]_ |
| `settings.agencies.limitReached` | Limit reached (max 3) | _[translate here]_ |
| `settings.agencies.countries.invalid` | Countries must be 2-letter ISO codes (e.g., US ES DE), separated by commas or spaces. | _[translate here]_ |
| `settings.continent.NA` | North America | _[translate here]_ |
| `settings.continent.SA` | South America | _[translate here]_ |
| `settings.continent.EU` | Europe | _[translate here]_ |
| `settings.continent.AF` | Africa | _[translate here]_ |
| `settings.continent.AS` | Asia | _[translate here]_ |
| `settings.continent.OC` | Oceania | _[translate here]_ |
| `settings.territory.worldwide` | Worldwide | _[translate here]_ |
| `settings.territory.continents` | Continents | _[translate here]_ |
| `settings.territory.countries` | Countries | _[translate here]_ |
| `settings.export` | Export settings | _[translate here]_ |
| `settings.import` | Import settings | _[translate here]_ |
| `settings.reset` | Reset to defaults | _[translate here]_ |
| `settings.preview` | Preview | _[translate here]_ |
| `shows.table.net` | Net | _[translate here]_ |
| `shows.table.status` | Status | _[translate here]_ |
| `shows.selectAll` | Select all | _[translate here]_ |
| `shows.selectRow` | Select row | _[translate here]_ |
| `shows.editor.tabs` | Editor tabs | _[translate here]_ |
| `shows.editor.tab.details` | Details | _[translate here]_ |
| `shows.editor.tab.finance` | Finance | _[translate here]_ |
| `shows.editor.tab.costs` | Costs | _[translate here]_ |
| `shows.editor.finance.commissions` | Commissions | _[translate here]_ |
| `shows.editor.add` | Add show | _[translate here]_ |
| `shows.editor.edit` | Edit show | _[translate here]_ |
| `shows.editor.subtitleAdd` | Create a new event | _[translate here]_ |
| `shows.editor.label.status` | Status | _[translate here]_ |
| `shows.editor.label.date` | Date | _[translate here]_ |
| `shows.editor.label.city` | City | _[translate here]_ |
| `shows.editor.label.country` | Country | _[translate here]_ |
| `shows.editor.label.venue` | Venue | _[translate here]_ |
| `shows.editor.label.promoter` | Promoter | _[translate here]_ |
| `shows.editor.label.fee` | Fee | _[translate here]_ |
| `shows.editor.label.wht` | WHT % | _[translate here]_ |
| `shows.editor.label.mgmt` | Mgmt Agency | _[translate here]_ |
| `shows.editor.label.booking` | Booking Agency | _[translate here]_ |
| `shows.editor.label.notes` | Notes | _[translate here]_ |
| `shows.editor.validation.cityRequired` | City is required | _[translate here]_ |
| `shows.editor.validation.countryRequired` | Country is required | _[translate here]_ |
| `shows.editor.validation.dateRequired` | Date is required | _[translate here]_ |
| `shows.editor.validation.feeGtZero` | Fee must be greater than 0 | _[translate here]_ |
| `shows.editor.validation.whtRange` | WHT must be between 0% and 50% | _[translate here]_ |
| `shows.dialog.close` | Close | _[translate here]_ |
| `shows.dialog.cancel` | Cancel | _[translate here]_ |
| `shows.dialog.save` | Save | _[translate here]_ |
| `shows.dialog.saveChanges` | Save changes | _[translate here]_ |
| `shows.dialog.delete` | Delete | _[translate here]_ |
| `shows.editor.validation.fail` | Fix errors to continue | _[translate here]_ |
| `shows.editor.toast.saved` | Saved | _[translate here]_ |
| `shows.editor.toast.deleted` | Deleted | _[translate here]_ |
| `shows.editor.toast.undo` | Undo | _[translate here]_ |
| `shows.editor.toast.restored` | Restored | _[translate here]_ |
| `shows.editor.toast.deleting` | Deleting… | _[translate here]_ |
| `shows.editor.toast.discarded` | Changes discarded | _[translate here]_ |
| `shows.editor.toast.validation` | Please correct the highlighted errors | _[translate here]_ |
| `shows.editor.summary.fee` | Fee | _[translate here]_ |
| `shows.editor.summary.wht` | WHT | _[translate here]_ |
| `shows.editor.summary.costs` | Costs | _[translate here]_ |
| `shows.editor.summary.net` | Est. Net | _[translate here]_ |
| `shows.editor.discard.title` | Discard changes? | _[translate here]_ |
| `shows.editor.discard.body` | You have unsaved changes. They will be lost. | _[translate here]_ |
| `shows.editor.discard.cancel` | Keep editing | _[translate here]_ |
| `shows.editor.discard.confirm` | Discard | _[translate here]_ |
| `shows.editor.delete.confirmTitle` | Delete show? | _[translate here]_ |
| `shows.editor.delete.confirmBody` | This action cannot be undone. | _[translate here]_ |
| `shows.editor.delete.confirm` | Delete | _[translate here]_ |
| `shows.editor.delete.cancel` | Cancel | _[translate here]_ |
| `shows.noCosts` | No costs yet | _[translate here]_ |
| `shows.filters.region` | Region | _[translate here]_ |
| `shows.filters.region.all` | All | _[translate here]_ |
| `shows.filters.region.AMER` | AMER | _[translate here]_ |
| `shows.filters.region.EMEA` | EMEA | _[translate here]_ |
| `shows.filters.region.APAC` | APAC | _[translate here]_ |
| `shows.filters.feeMin` | Min fee | _[translate here]_ |
| `shows.filters.feeMax` | Max fee | _[translate here]_ |
| `shows.views.export` | Export views | _[translate here]_ |
| `shows.views.import` | Import views | _[translate here]_ |
| `shows.views.applied` | View applied | _[translate here]_ |
| `shows.bulk.delete` | Delete selected | _[translate here]_ |
| `shows.bulk.setWht` | Set WHT % | _[translate here]_ |
| `shows.bulk.applyWht` | Apply WHT | _[translate here]_ |
| `shows.bulk.setStatus` | Set status | _[translate here]_ |
| `shows.bulk.apply` | Apply | _[translate here]_ |
| `shows.travel.title` | Location | _[translate here]_ |
| `shows.travel.quick` | Travel | _[translate here]_ |
| `shows.travel.soon` | Upcoming confirmed show — consider adding travel. | _[translate here]_ |
| `shows.travel.soonConfirmed` | Upcoming confirmed show — consider adding travel. | _[translate here]_ |
| `shows.travel.soonGeneric` | Upcoming show — consider planning travel. | _[translate here]_ |
| `shows.travel.tripExists` | Trip already scheduled around this date | _[translate here]_ |
| `shows.travel.noCta` | No travel action needed | _[translate here]_ |
| `shows.travel.plan` | Plan travel | _[translate here]_ |
| `cmd.dialog` | Command palette | _[translate here]_ |
| `cmd.placeholder` | Search shows or actions… | _[translate here]_ |
| `cmd.type.show` | Show | _[translate here]_ |
| `cmd.type.action` | Action | _[translate here]_ |
| `cmd.noResults` | No results | _[translate here]_ |
| `cmd.footer.hint` | Enter to run • Esc to close | _[translate here]_ |
| `cmd.footer.tip` | Tip: press ? for shortcuts | _[translate here]_ |
| `cmd.openFilters` | Open Filters | _[translate here]_ |
| `cmd.mask.enable` | Enable Mask | _[translate here]_ |
| `cmd.mask.disable` | Disable Mask | _[translate here]_ |
| `cmd.presentation.enable` | Enable Presentation Mode | _[translate here]_ |
| `cmd.presentation.disable` | Disable Presentation Mode | _[translate here]_ |
| `cmd.shortcuts` | Show Shortcuts Overlay | _[translate here]_ |
| `cmd.switch.default` | Switch View: Default | _[translate here]_ |
| `cmd.switch.finance` | Switch View: Finance | _[translate here]_ |
| `cmd.switch.operations` | Switch View: Operations | _[translate here]_ |
| `cmd.switch.promo` | Switch View: Promotion | _[translate here]_ |
| `cmd.openAlerts` | Open Alert Center | _[translate here]_ |
| `cmd.go.shows` | Go to Shows | _[translate here]_ |
| `cmd.go.travel` | Go to Travel | _[translate here]_ |
| `cmd.go.finance` | Go to Finance | _[translate here]_ |
| `cmd.go.org` | Go to Org Overview | _[translate here]_ |
| `cmd.go.members` | Go to Org Members | _[translate here]_ |
| `cmd.go.clients` | Go to Org Clients | _[translate here]_ |
| `cmd.go.teams` | Go to Org Teams | _[translate here]_ |
| `cmd.go.links` | Go to Org Links | _[translate here]_ |
| `cmd.go.reports` | Go to Org Reports | _[translate here]_ |
| `cmd.go.documents` | Go to Org Documents | _[translate here]_ |
| `cmd.go.integrations` | Go to Org Integrations | _[translate here]_ |
| `cmd.go.billing` | Go to Org Billing | _[translate here]_ |
| `cmd.go.branding` | Go to Org Branding | _[translate here]_ |
| `shortcuts.dialog` | Keyboard shortcuts | _[translate here]_ |
| `shortcuts.title` | Shortcuts | _[translate here]_ |
| `shortcuts.desc` | Use these to move faster. Press Esc to close. | _[translate here]_ |
| `shortcuts.openPalette` | Open Command Palette | _[translate here]_ |
| `shortcuts.showOverlay` | Show this overlay | _[translate here]_ |
| `shortcuts.closeDialogs` | Close dialogs/popups | _[translate here]_ |
| `shortcuts.goTo` | Quick nav: g then key | _[translate here]_ |
| `alerts.open` | Open Alerts | _[translate here]_ |
| `alerts.loading` | Loading alerts… | _[translate here]_ |
| `actions.exportCsv` | Export CSV | _[translate here]_ |
| `actions.copyDigest` | Copy Digest | _[translate here]_ |
| `actions.digest.title` | Weekly Alerts Digest | _[translate here]_ |
| `actions.toast.csv` | CSV copied | _[translate here]_ |
| `actions.toast.digest` | Digest copied | _[translate here]_ |
| `actions.toast.share` | Link copied | _[translate here]_ |
| `welcome.title` | Welcome, {name} | _[translate here]_ |
| `welcome.subtitle.agency` | Manage your managers and artists | _[translate here]_ |
| `welcome.subtitle.artist` | All set for your upcoming shows | _[translate here]_ |
| `welcome.cta.dashboard` | Go to dashboard | _[translate here]_ |
| `welcome.section.team` | Your team | _[translate here]_ |
| `welcome.section.clients` | Your artists | _[translate here]_ |
| `welcome.section.assignments` | Managers per artist | _[translate here]_ |
| `welcome.section.links` | Connections & scopes | _[translate here]_ |
| `welcome.section.kpis` | This month | _[translate here]_ |
| `welcome.seats.usage` | Seats used | _[translate here]_ |
| `welcome.gettingStarted` | Getting started | _[translate here]_ |
| `welcome.recentlyViewed` | Recently viewed | _[translate here]_ |
| `welcome.changesSince` | Changes since your last visit | _[translate here]_ |
| `welcome.noChanges` | No changes | _[translate here]_ |
| `welcome.change.linkEdited` | Link scopes edited for Danny | _[translate here]_ |
| `welcome.change.memberInvited` | New manager invited | _[translate here]_ |
| `welcome.change.docUploaded` | New document uploaded | _[translate here]_ |
| `empty.noRecent` | No recent items | _[translate here]_ |
| `welcome.cta.inviteManager` | Invite manager | _[translate here]_ |
| `welcome.cta.connectArtist` | Connect artist | _[translate here]_ |
| `welcome.cta.createTeam` | Create team | _[translate here]_ |
| `welcome.cta.completeBranding` | Complete branding | _[translate here]_ |
| `welcome.cta.reviewShows` | Review shows | _[translate here]_ |
| `welcome.cta.connectCalendar` | Connect calendar | _[translate here]_ |
| `welcome.cta.switchOrg` | Change organization | _[translate here]_ |
| `welcome.cta.completeSetup` | Complete setup | _[translate here]_ |
| `welcome.progress.complete` | Setup complete | _[translate here]_ |
| `welcome.progress.incomplete` | {completed}/{total} steps completed | _[translate here]_ |
| `welcome.tooltip.inviteManager` | Invite team members to collaborate on shows and finances | _[translate here]_ |
| `welcome.tooltip.connectArtist` | Link with artists to manage their tours | _[translate here]_ |
| `welcome.tooltip.completeBranding` | Set up your organization\ | _[translate here]_ |
| `welcome.tooltip.connectCalendar` | Sync your calendar for automatic show scheduling | _[translate here]_ |
| `welcome.tooltip.switchOrg` | Switch between different organizations you manage | _[translate here]_ |
| `welcome.gettingStarted.invite` | Invite a manager | _[translate here]_ |
| `welcome.gettingStarted.connect` | Connect an artist | _[translate here]_ |
| `welcome.gettingStarted.review` | Review teams & links | _[translate here]_ |
| `welcome.gettingStarted.branding` | Complete branding | _[translate here]_ |
| `welcome.gettingStarted.shows` | Review shows | _[translate here]_ |
| `welcome.gettingStarted.calendar` | Connect calendar | _[translate here]_ |
| `welcome.dontShowAgain` | Don | _[translate here]_ |
| `welcome.openArtistDashboard` | Open {artist} dashboard | _[translate here]_ |
| `welcome.assign` | Assign | _[translate here]_ |
| `shows.toast.bulk.status` | Status: {status} ({n}) | _[translate here]_ |
| `shows.toast.bulk.confirm` | Confirmed | _[translate here]_ |
| `shows.toast.bulk.setStatus` | Status applied | _[translate here]_ |
| `shows.toast.bulk.setWht` | WHT applied | _[translate here]_ |
| `shows.toast.bulk.export` | Export started | _[translate here]_ |
| `shows.toast.bulk.delete` | Deleted | _[translate here]_ |
| `shows.toast.bulk.confirmed` | Confirmed ({n}) | _[translate here]_ |
| `shows.toast.bulk.wht` | WHT {pct}% ({n}) | _[translate here]_ |
| `filters.clear` | Clear | _[translate here]_ |
| `filters.more` | More filters | _[translate here]_ |
| `filters.cleared` | Filters cleared | _[translate here]_ |
| `filters.presets` | Presets | _[translate here]_ |
| `filters.presets.last7` | Last 7 days | _[translate here]_ |
| `filters.presets.last30` | Last 30 days | _[translate here]_ |
| `filters.presets.last90` | Last 90 days | _[translate here]_ |
| `filters.presets.mtd` | Month to date | _[translate here]_ |
| `filters.presets.ytd` | Year to date | _[translate here]_ |
| `filters.presets.qtd` | Quarter to date | _[translate here]_ |
| `filters.applied` | Filters applied | _[translate here]_ |
| `common.team` | Team | _[translate here]_ |
| `common.region` | Region | _[translate here]_ |
| `ah.planTravel` | Plan travel | _[translate here]_ |
| `map.cssWarning` | Map styles failed to load. Using basic fallback. | _[translate here]_ |
| `travel.offline` | Offline mode: showing cached itineraries. | _[translate here]_ |
| `travel.refresh.error` | Couldn | _[translate here]_ |
| `travel.search.title` | Search | _[translate here]_ |
| `travel.search.open_in_google` | Open in Google Flights | _[translate here]_ |
| `travel.search.mode.form` | Form | _[translate here]_ |
| `travel.search.mode.text` | Text | _[translate here]_ |
| `travel.search.show_text` | Write query | _[translate here]_ |
| `travel.search.hide_text` | Hide text input | _[translate here]_ |
| `travel.search.text.placeholder` | e.g., From MAD to CDG 2025-10-12 2 adults business | _[translate here]_ |
| `travel.nlp` | NLP | _[translate here]_ |
| `travel.search.origin` | Origin | _[translate here]_ |
| `travel.search.destination` | Destination | _[translate here]_ |
| `travel.search.departure_date` | Departure date | _[translate here]_ |
| `travel.search.searching` | Searching flights… | _[translate here]_ |
| `travel.search.searchMyFlight` | Search My Flight | _[translate here]_ |
| `travel.search.searchAgain` | Search Again | _[translate here]_ |
| `travel.search.error` | Error searching flights | _[translate here]_ |
| `travel.addPurchasedFlight` | Add Purchased Flight | _[translate here]_ |
| `travel.addFlightDescription` | Enter your booking reference or flight number to add it to your schedule | _[translate here]_ |
| `travel.emptyStateDescription` | Add your booked flights or search for new ones to start managing your trips. | _[translate here]_ |
| `features.settlement.benefit` | 8h/week saved on financial reports | _[translate here]_ |
| `features.offline.description` | IndexedDB + robust sync. Manage your tour on the plane, backstage, or anywhere. When internet returns, everything syncs automatically. | _[translate here]_ |
| `features.offline.benefit` | 24/7 access, no connection dependency | _[translate here]_ |
| `features.ai.description` | NLP Quick Entry, intelligent ActionHub, predictive Health Score. Warns you of problems before they happen. Your tour copilot. | _[translate here]_ |
| `features.ai.benefit` | Anticipates problems 72h in advance | _[translate here]_ |
| `features.esign.description` | Integrated e-sign, templates by country (US/UK/EU/ES), full-text search with OCR. Close deals faster, no paper printing. | _[translate here]_ |
| `features.esign.benefit` | Close contracts 3x faster | _[translate here]_ |
| `features.inbox.description` | Emails organized by show, smart threading, rich text reply. All your context in one place, no Gmail searching. | _[translate here]_ |
| `features.inbox.benefit` | Zero inbox with full context | _[translate here]_ |
| `features.travel.description` | Integrated Amadeus API, global venue database, optimized routing. Plan efficient routes with real data. | _[translate here]_ |
| `features.travel.benefit` | 12% savings on travel costs | _[translate here]_ |
| `org.addShowToCalendar` | Add a new show to your calendar | _[translate here]_ |
| `travel.validation.completeFields` | Please complete origin, destination and departure date | _[translate here]_ |
| `travel.validation.returnDate` | Select return date for round trip | _[translate here]_ |
| `travel.search.show_more_options` | Open externally | _[translate here]_ |
| `travel.advanced.show` | More options | _[translate here]_ |
| `travel.advanced.hide` | Hide advanced options | _[translate here]_ |
| `travel.flight_card.nonstop` | nonstop | _[translate here]_ |
| `travel.flight_card.stop` | stop | _[translate here]_ |
| `travel.flight_card.stops` | stops | _[translate here]_ |
| `travel.flight_card.select_for_planning` | Select for planning | _[translate here]_ |
| `travel.add_to_trip` | Add to trip | _[translate here]_ |
| `travel.swap` | Swap | _[translate here]_ |
| `travel.round_trip` | Round trip | _[translate here]_ |
| `travel.share_search` | Share search | _[translate here]_ |
| `travel.from` | From | _[translate here]_ |
| `travel.to` | To | _[translate here]_ |
| `travel.depart` | Depart | _[translate here]_ |
| `travel.return` | Return | _[translate here]_ |
| `travel.adults` | Adults | _[translate here]_ |
| `travel.bag` | bag | _[translate here]_ |
| `travel.bags` | Bags | _[translate here]_ |
| `travel.cabin` | Cabin | _[translate here]_ |
| `travel.stops_ok` | Stops ok | _[translate here]_ |
| `travel.deeplink.preview` | Preview link | _[translate here]_ |
| `travel.deeplink.copy` | Copy link | _[translate here]_ |
| `travel.deeplink.copied` | Copied ✓ | _[translate here]_ |
| `travel.sort.menu` | Sort by | _[translate here]_ |
| `travel.sort.priceAsc` | Price (low→high) | _[translate here]_ |
| `travel.sort.priceDesc` | Price (high→low) | _[translate here]_ |
| `travel.sort.duration` | Duration | _[translate here]_ |
| `travel.sort.stops` | Stops | _[translate here]_ |
| `travel.badge.nonstop` | Nonstop | _[translate here]_ |
| `travel.badge.baggage` | Bag included | _[translate here]_ |
| `travel.arrival.sameDay` | Arrives same day | _[translate here]_ |
| `travel.arrival.nextDay` | Arrives next day | _[translate here]_ |
| `travel.recent.clear` | Clear recent | _[translate here]_ |
| `travel.recent.remove` | Remove | _[translate here]_ |
| `travel.form.invalid` | Please fix errors to search | _[translate here]_ |
| `travel.nlp.hint` | Free-form input — press Shift+Enter to apply | _[translate here]_ |
| `travel.flex.days` | ±{n} days | _[translate here]_ |
| `travel.compare.grid.title` | Compare flights | _[translate here]_ |
| `travel.compare.empty` | Pin flights to compare them here. | _[translate here]_ |
| `travel.compare.hint` | Review pinned flights side-by-side. | _[translate here]_ |
| `travel.co2.label` | CO₂ | _[translate here]_ |
| `travel.window` | Window | _[translate here]_ |
| `travel.flex_window` | Flex window | _[translate here]_ |
| `travel.flex_hint` | We | _[translate here]_ |
| `travel.one_way` | One-way | _[translate here]_ |
| `travel.nonstop` | Nonstop | _[translate here]_ |
| `travel.pin` | Pin | _[translate here]_ |
| `travel.unpin` | Unpin | _[translate here]_ |
| `travel.compare.title` | Compare pinned | _[translate here]_ |
| `travel.compare.show` | Compare | _[translate here]_ |
| `travel.compare.hide` | Hide | _[translate here]_ |
| `travel.compare.add_to_trip` | Add to trip | _[translate here]_ |
| `travel.trip.added` | Added to trip | _[translate here]_ |
| `travel.trip.create_drop` | Drop here to create new trip | _[translate here]_ |
| `travel.related_show` | Related show | _[translate here]_ |
| `travel.multicity.toggle` | Multicity | _[translate here]_ |
| `travel.multicity` | Multi-city | _[translate here]_ |
| `travel.multicity.add_leg` | Add leg | _[translate here]_ |
| `travel.multicity.remove` | Remove | _[translate here]_ |
| `travel.multicity.move_up` | Move up | _[translate here]_ |
| `travel.multicity.move_down` | Move down | _[translate here]_ |
| `travel.multicity.open` | Open route in Google Flights | _[translate here]_ |
| `travel.multicity.hint` | Add at least two legs to build a route | _[translate here]_ |
| `travel.trips` | Trips | _[translate here]_ |
| `travel.trip.new` | New Trip | _[translate here]_ |
| `travel.trip.to` | Trip to | _[translate here]_ |
| `travel.segments` | Segments | _[translate here]_ |
| `common.actions` | Actions | _[translate here]_ |
| `travel.timeline.title` | Travel Timeline | _[translate here]_ |
| `travel.timeline.free_day` | Free day | _[translate here]_ |
| `travel.hub.title` | Search | _[translate here]_ |
| `travel.hub.needs_planning` | Suggestions | _[translate here]_ |
| `travel.hub.upcoming` | Upcoming | _[translate here]_ |
| `travel.hub.open_multicity` | Open multicity | _[translate here]_ |
| `travel.hub.plan_trip_cta` | Plan Trip | _[translate here]_ |
| `travel.error.same_route` | Origin and destination are the same | _[translate here]_ |
| `travel.error.return_before_depart` | Return is before departure | _[translate here]_ |
| `travel.segment.type` | Type | _[translate here]_ |
| `travel.segment.flight` | Flight | _[translate here]_ |
| `travel.segment.hotel` | Hotel | _[translate here]_ |
| `travel.segment.ground` | Ground | _[translate here]_ |
| `copy.manual.title` | Manual copy | _[translate here]_ |
| `copy.manual.desc` | Copy the text below if clipboard is blocked. | _[translate here]_ |
| `common.noResults` | No results | _[translate here]_ |
| `tripDetail.currency` | Currency | _[translate here]_ |
| `cost.category.flight` | Flight | _[translate here]_ |
| `cost.category.hotel` | Hotel | _[translate here]_ |
| `cost.category.ground` | Ground | _[translate here]_ |
| `cost.category.taxes` | Taxes | _[translate here]_ |
| `cost.category.fees` | Fees | _[translate here]_ |
| `cost.category.other` | Other | _[translate here]_ |
| `travel.workspace.placeholder` | Select a trip to see details or perform a search. | _[translate here]_ |
| `travel.open_in_provider` | Open in provider | _[translate here]_ |
| `common.loading` | Loading… | _[translate here]_ |
| `common.results` | results | _[translate here]_ |
| `travel.no_trips_yet` | No trips planned yet. Use the search to get started! | _[translate here]_ |
| `travel.provider` | Provider | _[translate here]_ |
| `provider.mock` | In-app (mock) | _[translate here]_ |
| `provider.google` | Google Flights | _[translate here]_ |
| `travel.alert.checkin` | Check-in opens in %s | _[translate here]_ |
| `travel.alert.priceDrop` | Price dropped by %s | _[translate here]_ |
| `travel.workspace.open` | Open Travel Workspace | _[translate here]_ |
| `travel.workspace.timeline` | Timeline view | _[translate here]_ |
| `travel.workspace.trip_builder.beta` | Trip Builder (beta) | _[translate here]_ |
| `common.list` | List | _[translate here]_ |
| `common.clear` | Clear | _[translate here]_ |
| `common.reset` | Reset | _[translate here]_ |
| `calendar.timeline` | Week | _[translate here]_ |
| `common.moved` | Moved | _[translate here]_ |
| `travel.drop.hint` | Drag to another day | _[translate here]_ |
| `travel.search.summary` | Search summary | _[translate here]_ |
| `travel.search.route` | {from} → {to} | _[translate here]_ |
| `travel.search.paxCabin` | {pax} pax · {cabin} | _[translate here]_ |
| `travel.results.countForDate` | {count} results for {date} | _[translate here]_ |
| `travel.compare.bestPrice` | Best price | _[translate here]_ |
| `travel.compare.bestTime` | Fastest | _[translate here]_ |
| `travel.compare.bestBalance` | Best balance | _[translate here]_ |
| `travel.co2.estimate` | ~{kg} kg CO₂ (est.) | _[translate here]_ |
| `travel.mobile.sticky.results` | Results | _[translate here]_ |
| `travel.mobile.sticky.compare` | Compare | _[translate here]_ |
| `travel.tooltips.flex` | Explore ± days around the selected date | _[translate here]_ |
| `travel.tooltips.nonstop` | Only show flights without stops | _[translate here]_ |
| `travel.tooltips.cabin` | Seat class preference | _[translate here]_ |
| `travel.move.prev` | Move to previous day | _[translate here]_ |
| `travel.move.next` | Move to next day | _[translate here]_ |
| `travel.rest.short` | Short rest before next show | _[translate here]_ |
| `travel.rest.same_day` | Same-day show risk | _[translate here]_ |
| `calendar.title` | Calendar | _[translate here]_ |
| `calendar.prev` | Previous month | _[translate here]_ |
| `calendar.next` | Next month | _[translate here]_ |
| `calendar.today` | Today | _[translate here]_ |
| `calendar.goto` | Go to date | _[translate here]_ |
| `calendar.more` | more | _[translate here]_ |
| `calendar.more.title` | More events | _[translate here]_ |
| `calendar.more.openDay` | Open day | _[translate here]_ |
| `calendar.more.openFullDay` | Open full day | _[translate here]_ |
| `calendar.announce.moved` | Moved show to {d} | _[translate here]_ |
| `calendar.announce.copied` | Duplicated show to {d} | _[translate here]_ |
| `calendar.quickAdd.hint` | Enter to add • Esc to cancel | _[translate here]_ |
| `calendar.quickAdd.advanced` | Advanced | _[translate here]_ |
| `calendar.quickAdd.simple` | Simple | _[translate here]_ |
| `calendar.quickAdd.placeholder` | City CC Fee (optional)… e.g., Madrid ES 12000 | _[translate here]_ |
| `calendar.quickAdd.recent` | Recent | _[translate here]_ |
| `calendar.quickAdd.parseError` | Can | _[translate here]_ |
| `calendar.quickAdd.countryMissing` | Add 2-letter country code | _[translate here]_ |
| `calendar.goto.hint` | Enter to go • Esc to close | _[translate here]_ |
| `calendar.view.switch` | Change calendar view | _[translate here]_ |
| `calendar.view.month` | Month | _[translate here]_ |
| `calendar.view.week` | Week | _[translate here]_ |
| `calendar.view.day` | Day | _[translate here]_ |
| `calendar.view.agenda` | Agenda | _[translate here]_ |
| `calendar.view.announce` | {v} view | _[translate here]_ |
| `calendar.timezone` | Time zone | _[translate here]_ |
| `calendar.tz.local` | Local | _[translate here]_ |
| `calendar.tz.localLabel` | Local | _[translate here]_ |
| `calendar.tz.changed` | Time zone set to {tz} | _[translate here]_ |
| `calendar.goto.shortcut` | ⌘/Ctrl + G | _[translate here]_ |
| `calendar.shortcut.pgUp` | PgUp / Alt+← | _[translate here]_ |
| `calendar.shortcut.pgDn` | PgDn / Alt+→ | _[translate here]_ |
| `calendar.shortcut.today` | T | _[translate here]_ |
| `common.move` | Move | _[translate here]_ |
| `common.copy` | Copy | _[translate here]_ |
| `calendar.more.filter` | Filter events | _[translate here]_ |
| `calendar.more.empty` | No results | _[translate here]_ |
| `calendar.kb.hint` | Keyboard: Arrow keys move day, PageUp/PageDown change month, T go to today, Enter or Space select day. | _[translate here]_ |
| `calendar.day.select` | Selected {d} | _[translate here]_ |
| `calendar.day.focus` | Focused {d} | _[translate here]_ |
| `calendar.noEvents` | No events for this day | _[translate here]_ |
| `calendar.show.shows` | Shows | _[translate here]_ |
| `calendar.show.travel` | Travel | _[translate here]_ |
| `calendar.kind` | Kind | _[translate here]_ |
| `calendar.kind.show` | Show | _[translate here]_ |
| `calendar.kind.travel` | Travel | _[translate here]_ |
| `calendar.status` | Status | _[translate here]_ |
| `calendar.dnd.enter` | Drop here to place event on {d} | _[translate here]_ |
| `calendar.dnd.leave` | Leaving drop target | _[translate here]_ |
| `calendar.kbdDnD.marked` | Marked {d} as origin. Use Enter on target day to drop. Hold Ctrl/Cmd to copy. | _[translate here]_ |
| `calendar.kbdDnD.cancel` | Cancelled move/copy mode | _[translate here]_ |
| `calendar.kbdDnD.origin` | Origin (keyboard move/copy active) | _[translate here]_ |
| `calendar.kbdDnD.none` | No show to move from selected origin | _[translate here]_ |
| `calendar.weekStart` | Week starts on | _[translate here]_ |
| `calendar.weekStart.mon` | Mon | _[translate here]_ |
| `calendar.weekStart.sun` | Sun | _[translate here]_ |
| `calendar.import` | Import | _[translate here]_ |
| `calendar.import.ics` | Import .ics | _[translate here]_ |
| `calendar.import.done` | Imported {n} events | _[translate here]_ |
| `calendar.import.error` | Failed to import .ics | _[translate here]_ |
| `calendar.wd.mon` | Mon | _[translate here]_ |
| `calendar.wd.tue` | Tue | _[translate here]_ |
| `calendar.wd.wed` | Wed | _[translate here]_ |
| `calendar.wd.thu` | Thu | _[translate here]_ |
| `calendar.wd.fri` | Fri | _[translate here]_ |
| `calendar.wd.sat` | Sat | _[translate here]_ |
| `calendar.wd.sun` | Sun | _[translate here]_ |
| `shows.costs.type` | Type | _[translate here]_ |
| `shows.costs.placeholder` | Travel / Production / Marketing | _[translate here]_ |
| `shows.costs.amount` | Amount | _[translate here]_ |
| `shows.costs.desc` | Description | _[translate here]_ |
| `common.optional` | Optional | _[translate here]_ |
| `common.add` | Add | _[translate here]_ |
| `common.income` | Income | _[translate here]_ |
| `common.wht` | WHT | _[translate here]_ |
| `common.commissions` | Commissions | _[translate here]_ |
| `common.net` | Net | _[translate here]_ |
| `common.costs` | Costs | _[translate here]_ |
| `common.total` | Total | _[translate here]_ |
| `shows.promote` | Promote | _[translate here]_ |
| `shows.editor.status.promote` | Promoted to | _[translate here]_ |
| `shows.margin.tooltip` | Net divided by Fee (%) | _[translate here]_ |
| `shows.empty` | No shows match your filters | _[translate here]_ |
| `shows.empty.add` | Add your first show | _[translate here]_ |
| `shows.export.csv.success` | CSV exported ✓ | _[translate here]_ |
| `shows.export.xlsx.success` | XLSX exported ✓ | _[translate here]_ |
| `shows.sort.tooltip` | Sort by column | _[translate here]_ |
| `shows.filters.statusGroup` | Status filters | _[translate here]_ |
| `shows.relative.inDays` | In {n} days | _[translate here]_ |
| `shows.relative.daysAgo` | {n} days ago | _[translate here]_ |
| `shows.relative.yesterday` | Yesterday | _[translate here]_ |
| `shows.row.menu` | Row actions | _[translate here]_ |
| `shows.action.edit` | Edit | _[translate here]_ |
| `shows.action.promote` | Promote | _[translate here]_ |
| `shows.action.duplicate` | Duplicate | _[translate here]_ |
| `shows.action.archive` | Archive | _[translate here]_ |
| `shows.action.delete` | Delete | _[translate here]_ |
| `shows.action.restore` | Restore | _[translate here]_ |
| `shows.board.header.net` | Net | _[translate here]_ |
| `shows.board.header.count` | Shows | _[translate here]_ |
| `shows.datePreset.thisMonth` | This Month | _[translate here]_ |
| `shows.datePreset.nextMonth` | Next Month | _[translate here]_ |
| `shows.columns.config` | Columns | _[translate here]_ |
| `shows.columns.wht` | WHT % | _[translate here]_ |
| `shows.totals.pin` | Pin totals | _[translate here]_ |
| `shows.totals.unpin` | Unpin totals | _[translate here]_ |
| `shows.totals.avgFee` | Avg Fee | _[translate here]_ |
| `shows.totals.avgFee.tooltip` | Average fee per show | _[translate here]_ |
| `shows.totals.avgMargin` | Avg Margin % | _[translate here]_ |
| `shows.totals.avgMargin.tooltip` | Average margin % across shows with fee | _[translate here]_ |
| `shows.wht.hide` | Hide WHT column | _[translate here]_ |
| `shows.sort.aria.sortedDesc` | Sorted descending | _[translate here]_ |
| `shows.sort.aria.sortedAsc` | Sorted ascending | _[translate here]_ |
| `shows.sort.aria.notSorted` | Not sorted | _[translate here]_ |
| `shows.sort.aria.activateDesc` | Activate to sort descending | _[translate here]_ |
| `shows.sort.aria.activateAsc` | Activate to sort ascending | _[translate here]_ |
| `nav.overview` | Overview | _[translate here]_ |
| `nav.clients` | Clients | _[translate here]_ |
| `nav.teams` | Teams | _[translate here]_ |
| `nav.links` | Links | _[translate here]_ |
| `nav.reports` | Reports | _[translate here]_ |
| `nav.documents` | Documents | _[translate here]_ |
| `nav.integrations` | Integrations | _[translate here]_ |
| `nav.billing` | Billing | _[translate here]_ |
| `nav.branding` | Branding | _[translate here]_ |
| `nav.connections` | Connections | _[translate here]_ |
| `org.overview.title` | Organization Overview | _[translate here]_ |
| `org.overview.subtitle.agency` | KPIs by client, tasks, and active links | _[translate here]_ |
| `org.overview.subtitle.artist` | Upcoming shows and travel, monthly KPIs | _[translate here]_ |
| `org.members.title` | Members | _[translate here]_ |
| `members.invite` | Invite | _[translate here]_ |
| `members.seats.usage` | Seat usage: 5/5 internal, 0/5 guests | _[translate here]_ |
| `org.clients.title` | Clients | _[translate here]_ |
| `org.teams.title` | Teams | _[translate here]_ |
| `org.links.title` | Links | _[translate here]_ |
| `org.branding.title` | Branding | _[translate here]_ |
| `org.documents.title` | Documents | _[translate here]_ |
| `org.reports.title` | Reports | _[translate here]_ |
| `org.integrations.title` | Integrations | _[translate here]_ |
| `org.billing.title` | Billing | _[translate here]_ |
| `labels.seats.used` | Seats used | _[translate here]_ |
| `labels.seats.guests` | Guests | _[translate here]_ |
| `export.options` | Export options | _[translate here]_ |
| `export.columns` | Columns | _[translate here]_ |
| `export.csv` | CSV | _[translate here]_ |
| `export.xlsx` | XLSX | _[translate here]_ |
| `common.exporting` | Exporting… | _[translate here]_ |
| `charts.viewTable` | View data as table | _[translate here]_ |
| `charts.hideTable` | Hide table | _[translate here]_ |
| `finance.period.mtd` | MTD | _[translate here]_ |
| `finance.period.lastMonth` | Last month | _[translate here]_ |
| `finance.period.ytd` | YTD | _[translate here]_ |
| `finance.period.custom` | Custom | _[translate here]_ |
| `finance.period.closed` | Closed | _[translate here]_ |
| `finance.period.open` | Open | _[translate here]_ |
| `finance.closeMonth` | Close Month | _[translate here]_ |
| `finance.reopenMonth` | Reopen Month | _[translate here]_ |
| `finance.closed.help` | Month is closed. Reopen to make changes. | _[translate here]_ |
| `finance.kpi.mtdNet` | MTD Net | _[translate here]_ |
| `finance.kpi.ytdNet` | YTD Net | _[translate here]_ |
| `finance.kpi.forecastEom` | Forecast EOM | _[translate here]_ |
| `finance.kpi.deltaTarget` | Δ vs Target | _[translate here]_ |
| `finance.kpi.gm` | GM% | _[translate here]_ |
| `finance.kpi.dso` | DSO | _[translate here]_ |
| `finance.comparePrev` | Compare vs previous | _[translate here]_ |
| `finance.export.csv.success` | CSV exported ✓ | _[translate here]_ |
| `finance.export.xlsx.success` | XLSX exported ✓ | _[translate here]_ |
| `finance.v2.footer` | AR top debtors and row actions coming next. | _[translate here]_ |
| `finance.pl.caption` | Profit and Loss ledger. Use column headers to sort. Virtualized list shows a subset of rows. | _[translate here]_ |
| `common.rowsVisible` | Rows visible | _[translate here]_ |
| `finance.whtPct` | WHT % | _[translate here]_ |
| `finance.wht` | WHT | _[translate here]_ |
| `finance.mgmtPct` | Mgmt % | _[translate here]_ |
| `finance.bookingPct` | Booking % | _[translate here]_ |
| `finance.breakdown.by` | Breakdown by | _[translate here]_ |
| `finance.breakdown.empty` | No breakdown available | _[translate here]_ |
| `finance.delta` | Δ | _[translate here]_ |
| `finance.deltaVsPrev` | Δ vs prev | _[translate here]_ |
| `common.comingSoon` | Coming soon | _[translate here]_ |
| `finance.expected` | Expected (stage-weighted) | _[translate here]_ |
| `finance.ar.title` | AR aging & top debtors | _[translate here]_ |
| `common.moreActions` | More actions | _[translate here]_ |
| `actions.copyRow` | Copy row | _[translate here]_ |
| `actions.exportRowCsv` | Export row (CSV) | _[translate here]_ |
| `actions.goToShow` | Go to show | _[translate here]_ |
| `actions.openCosts` | Open costs | _[translate here]_ |
| `shows.table.route` | Route | _[translate here]_ |
| `finance.targets.title` | Targets | _[translate here]_ |
| `finance.targets.revenue` | Revenue target | _[translate here]_ |
| `finance.targets.net` | Net target | _[translate here]_ |
| `finance.targets.hint` | Targets are local to this device for now. | _[translate here]_ |
| `finance.targets.noNegative` | Targets cannot be negative | _[translate here]_ |
| `filters.title` | Filters | _[translate here]_ |
| `filters.region` | Region | _[translate here]_ |
| `filters.from` | From | _[translate here]_ |
| `filters.to` | To | _[translate here]_ |
| `filters.currency` | Currency | _[translate here]_ |
| `filters.presentation` | Presentation mode | _[translate here]_ |
| `filters.shortcutHint` | Ctrl/Cmd+K – open filters | _[translate here]_ |
| `filters.appliedRange` | Applied range | _[translate here]_ |
| `layout.team` | Team | _[translate here]_ |
| `layout.highContrast` | High Contrast | _[translate here]_ |
| `layout.tenant` | Tenant | _[translate here]_ |
| `access.readOnly` | read-only | _[translate here]_ |
| `layout.viewingAs` | Viewing as | _[translate here]_ |
| `layout.viewAsExit` | Exit | _[translate here]_ |
| `access.readOnly.tooltip` | Finance exports disabled for agency demo | _[translate here]_ |
| `lab.drag` | Drag | _[translate here]_ |
| `lab.moveUp` | Move up | _[translate here]_ |
| `lab.moveDown` | Move down | _[translate here]_ |
| `lab.reset` | Reset to template | _[translate here]_ |
| `lab.back` | Back to Dashboard | _[translate here]_ |
| `lab.layoutName` | Layout name | _[translate here]_ |
| `lab.save` | Save layout | _[translate here]_ |
| `lab.apply` | Apply… | _[translate here]_ |
| `lab.delete` | Delete… | _[translate here]_ |
| `lab.export` | Export | _[translate here]_ |
| `lab.import` | Import | _[translate here]_ |
| `lab.dropHere` | Drop widgets here | _[translate here]_ |
| `lab.header` | Mission Control Lab | _[translate here]_ |
| `lab.subheader` | Drag, reorder, and resize dashboard widgets. Experimental. | _[translate here]_ |
| `lab.template` | Template | _[translate here]_ |
| `lab.resetToTemplate` | Reset to template | _[translate here]_ |
| `lab.backToDashboard` | Back to Dashboard | _[translate here]_ |
| `lab.applySaved` | Apply… | _[translate here]_ |
| `lab.deleteSaved` | Delete… | _[translate here]_ |
| `dashboard.title` | Tour Command Center | _[translate here]_ |
| `dashboard.subtitle` | Monitor your tour performance, mission status, and take action on what matters most | _[translate here]_ |
| `dashboard.map.title` | Tour Map | _[translate here]_ |
| `dashboard.activity.title` | Recent Activity | _[translate here]_ |
| `dashboard.actions.title` | Quick Actions | _[translate here]_ |
| `dashboard.actions.newShow` | Add New Show | _[translate here]_ |
| `dashboard.actions.quickFinance` | Quick Finance Check | _[translate here]_ |
| `dashboard.actions.travelBooking` | Book Travel | _[translate here]_ |
| `dashboard.areas.finance.title` | Finance | _[translate here]_ |
| `dashboard.areas.finance.description` | Track revenue, costs, and profitability | _[translate here]_ |
| `dashboard.areas.shows.title` | Shows & Events | _[translate here]_ |
| `dashboard.areas.shows.description` | Manage performances and venues | _[translate here]_ |
| `dashboard.areas.travel.title` | Travel & Logistics | _[translate here]_ |
| `dashboard.areas.travel.description` | Plan and track travel arrangements | _[translate here]_ |
| `dashboard.areas.missionControl.title` | Mission Control Lab | _[translate here]_ |
| `dashboard.areas.missionControl.description` | Advanced mission control with customizable widgets | _[translate here]_ |
| `dashboard.kpi.financialHealth` | Financial Health | _[translate here]_ |
| `dashboard.kpi.nextEvent` | Next Critical Event | _[translate here]_ |
| `dashboard.kpi.ticketSales` | Ticket Sales | _[translate here]_ |
| `actions.toast.export` | Export copied | _[translate here]_ |
| `actions.import.prompt` | Paste Lab layouts JSON | _[translate here]_ |
| `actions.toast.imported` | Imported | _[translate here]_ |
| `actions.toast.import_invalid` | Invalid JSON | _[translate here]_ |
| `actions.newArtist` | New artist | _[translate here]_ |
| `actions.connectExisting` | Connect existing | _[translate here]_ |
| `actions.editScopes` | Edit scopes | _[translate here]_ |
| `actions.revoke` | Revoke | _[translate here]_ |
| `actions.exportPdf` | Export PDF | _[translate here]_ |
| `branding.uploadLogo` | Upload logo | _[translate here]_ |
| `branding.editColors` | Edit colors | _[translate here]_ |
| `common.upload` | Upload | _[translate here]_ |
| `common.newFolder` | New folder | _[translate here]_ |
| `live.up` | up | _[translate here]_ |
| `live.down` | down | _[translate here]_ |
| `live.flat` | flat | _[translate here]_ |
| `nav.profile` | Profile | _[translate here]_ |
| `nav.changeOrg` | Change organization | _[translate here]_ |
| `nav.logout` | Logout | _[translate here]_ |
| `profile.title` | Profile | _[translate here]_ |
| `profile.personal` | Personal | _[translate here]_ |
| `profile.security` | Security | _[translate here]_ |
| `profile.notifications` | Notifications | _[translate here]_ |
| `profile.save` | Save | _[translate here]_ |
| `profile.saved` | Saved ✓ | _[translate here]_ |
| `profile.avatarUrl` | Avatar URL | _[translate here]_ |
| `profile.bio` | Bio | _[translate here]_ |
| `profile.notify.email` | Email updates | _[translate here]_ |
| `profile.notify.slack` | Slack notifications | _[translate here]_ |
| `profile.notify.hint` | These preferences affect demo notifications only | _[translate here]_ |
| `profile.memberships` | Memberships | _[translate here]_ |
| `profile.defaultOrg` | Default organization | _[translate here]_ |
| `profile.setDefault` | Set default | _[translate here]_ |
| `profile.dataPrivacy` | Data & privacy | _[translate here]_ |
| `profile.exportData` | Export my demo data | _[translate here]_ |
| `profile.clearData` | Clear and reseed demo data | _[translate here]_ |
| `profile.export.ready` | Data export ready | _[translate here]_ |
| `profile.error.name` | Name is required | _[translate here]_ |
| `profile.error.email` | Email is required | _[translate here]_ |
| `prefs.title` | Preferences | _[translate here]_ |
| `prefs.appearance` | Appearance | _[translate here]_ |
| `prefs.language` | Language | _[translate here]_ |
| `prefs.theme` | Theme | _[translate here]_ |
| `prefs.highContrast` | High contrast | _[translate here]_ |
| `prefs.finance.currency` | Currency | _[translate here]_ |
| `prefs.units` | Distance units | _[translate here]_ |
| `prefs.presentation` | Presentation mode | _[translate here]_ |
| `prefs.comparePrev` | Compare vs previous | _[translate here]_ |
| `prefs.defaultRegion` | Default region | _[translate here]_ |
| `prefs.defaultStatuses` | Default statuses | _[translate here]_ |
| `prefs.help.language` | Affects labels and date/number formatting. | _[translate here]_ |
| `prefs.help.theme` | Choose light or dark based on your environment. | _[translate here]_ |
| `prefs.help.highContrast` | Improves contrast and focus rings for readability. | _[translate here]_ |
| `prefs.help.currency` | Sets default currency for dashboards and exports. | _[translate here]_ |
| `prefs.help.units` | Used for travel distances and map overlays. | _[translate here]_ |
| `prefs.help.presentation` | Larger text, simplified animations for demos. | _[translate here]_ |
| `prefs.help.comparePrev` | Shows deltas against the previous period. | _[translate here]_ |
| `prefs.help.region` | Preselects region filters in dashboards. | _[translate here]_ |
| `subnav.ariaLabel` | Sections | _[translate here]_ |
| `breadcrumb.home` | Home | _[translate here]_ |
| `home.seo.title` | On Tour App - Tour Management & Finance Dashboard | _[translate here]_ |
| `home.seo.description` | Professional tour management platform with real-time finance tracking, venue booking, and performance analytics for artists and managers. | _[translate here]_ |
| `home.seo.keywords` | tour management, concert booking, artist finance, venue management, performance analytics, live music | _[translate here]_ |
| `comparison.title` | From Spreadsheet Chaos to App Clarity | _[translate here]_ |
| `comparison.subtitle` | See how your tour management evolves from fragmented Excel files to a unified, intelligent platform. | _[translate here]_ |
| `comparison.excel.title` | Excel Chaos | _[translate here]_ |
| `comparison.excel.problem1` | Scattered files across devices and emails | _[translate here]_ |
| `comparison.excel.problem2` | Manual calculations prone to errors | _[translate here]_ |
| `comparison.excel.problem3` | No real-time collaboration or notifications | _[translate here]_ |
| `comparison.excel.problem4` | Lost context in endless tabs and comments | _[translate here]_ |
| `comparison.app.title` | App Clarity | _[translate here]_ |
| `comparison.app.benefit1` | Unified dashboard with live data sync | _[translate here]_ |
| `comparison.app.benefit2` | Automated calculations and error detection | _[translate here]_ |
| `comparison.app.benefit3` | Real-time collaboration and smart notifications | _[translate here]_ |
| `comparison.app.benefit4` | Context-aware insights and predictive alerts | _[translate here]_ |
| `comparison.benefit1.title` | Smart Finance Tracking | _[translate here]_ |
| `comparison.benefit1.desc` | Automatic profit calculations, cost analysis, and budget alerts. | _[translate here]_ |
| `comparison.benefit2.title` | Live Tour Mapping | _[translate here]_ |
| `comparison.benefit2.desc` | Interactive maps with route optimization and venue intelligence. | _[translate here]_ |
| `comparison.benefit3.title` | Instant Insights | _[translate here]_ |
| `comparison.benefit3.desc` | AI-powered recommendations and risk detection in real-time. | _[translate here]_ |
| `metamorphosis.title` | From scattered noise to a living control panel | _[translate here]_ |
| `metamorphosis.subtitle` | Instead of spreadsheets mutating chaotically and critical context buried in comments, every data point flows into a single orchestrated surface. The system reconciles, validates, and highlights what matters. | _[translate here]_ |
| `dashboard.offerConfirmed` | Offer → Confirmed | _[translate here]_ |
| `dashboard.tourHealthScore` | Tour Health Score | _[translate here]_ |
| `dashboard.healthFactors` | Health Factors | _[translate here]_ |
| `dashboard.keyInsights` | Key Insights | _[translate here]_ |
| `dashboard.confidence` | Confidence | _[translate here]_ |
| `dashboard.current` | Current | _[translate here]_ |
| `dashboard.predicted` | Predicted | _[translate here]_ |
| `dashboard.expectedChange` | Expected change | _[translate here]_ |
| `dashboard.scheduleGap` | Schedule gap | _[translate here]_ |
| `dashboard.allSystemsReady` | All systems ready | _[translate here]_ |
| `dashboard.loadingMap` | Loading map… | _[translate here]_ |
| `placeholder.username` | you@example.com or username | _[translate here]_ |
| `placeholder.bio` | Tell us a bit about yourself and what you do... | _[translate here]_ |
| `placeholder.cityName` | Enter city name... | _[translate here]_ |
| `placeholder.notes` | Add any additional notes... | _[translate here]_ |
| `placeholder.searchCommand` | Search shows, navigate, or type a command... | _[translate here]_ |
| `placeholder.expenseDescription` | e.g., Flight tickets, Hotel booking... | _[translate here]_ |
| `placeholder.expenseDetails` | Add any additional details, invoice numbers, or context... | _[translate here]_ |
| `placeholder.origin` | Origin (e.g., BCN) | _[translate here]_ |
| `placeholder.destination` | Destination (e.g., AMS) | _[translate here]_ |
| `placeholder.bookingRef` | Booking reference or flight number | _[translate here]_ |
| `placeholder.airport` | City or airport... | _[translate here]_ |

## IT - 1155 Missing Translations

**Translation guidelines:**
- Keep technical terms consistent (e.g., "show", "fee", "status")
- Match tone: professional but friendly
- Consider context: these appear in UI buttons, labels, and messages
- Preserve placeholders: `{name}`, `{count}`, etc.

### Quick Copy Format (for src/lib/i18n.ts)

```typescript
    , 'scopes.tooltip.shows': '' // TODO: translate "Shows access granted by link"
    , 'scopes.tooltip.travel': '' // TODO: translate "Travel access granted by link"
    , 'scopes.tooltip.finance': '' // TODO: translate "Finance: read-only per link policy"
    , 'kpi.shows': '' // TODO: translate "Shows"
    , 'kpi.net': '' // TODO: translate "Net"
    , 'kpi.travel': '' // TODO: translate "Travel"
    , 'cmd.go.profile': '' // TODO: translate "Go to profile"
    , 'cmd.go.preferences': '' // TODO: translate "Go to preferences"
    , 'common.copyLink': '' // TODO: translate "Copy link"
    , 'common.learnMore': '' // TODO: translate "Learn more"
    , 'insights.thisMonthTotal': '' // TODO: translate "This Month Total"
    , 'insights.statusBreakdown': '' // TODO: translate "Status breakdown"
    , 'insights.upcoming14d': '' // TODO: translate "Upcoming 14d"
    , 'common.openShow': '' // TODO: translate "Open show"
    , 'common.centerMap': '' // TODO: translate "Center map"
    , 'common.dismiss': '' // TODO: translate "Dismiss"
    , 'common.snooze7': '' // TODO: translate "Snooze 7 days"
    , 'common.snooze30': '' // TODO: translate "Snooze 30 days"
    , 'common.on': '' // TODO: translate "on"
    , 'common.off': '' // TODO: translate "off"
    , 'common.hide': '' // TODO: translate "Hide"
    , 'common.pin': '' // TODO: translate "Pin"
    , 'common.unpin': '' // TODO: translate "Unpin"
    , 'common.map': '' // TODO: translate "Map"
    , 'layout.invite': '' // TODO: translate "Invite"
    , 'layout.build': '' // TODO: translate "Build: preview"
    , 'layout.demo': '' // TODO: translate "Status: demo feed"
    , 'alerts.title': '' // TODO: translate "Alert Center"
    , 'alerts.anySeverity': '' // TODO: translate "Any severity"
    , 'alerts.anyRegion': '' // TODO: translate "Any region"
    , 'alerts.anyTeam': '' // TODO: translate "Any team"
    , 'alerts.copySlack': '' // TODO: translate "Copy Slack"
    , 'alerts.copied': '' // TODO: translate "Copied \u2713"
    , 'alerts.noAlerts': '' // TODO: translate "No alerts"
    , 'map.openInDashboard': '' // TODO: translate "Open in dashboard"
    , 'auth.login': '' // TODO: translate "Login"
    , 'auth.chooseUser': '' // TODO: translate "Choose a demo user"
    , 'auth.enterAs': '' // TODO: translate "Enter as {name}"
    , 'auth.role.owner': '' // TODO: translate "Artist (Owner)"
    , 'auth.role.agencyManager': '' // TODO: translate "Agency Manager"
    , 'auth.role.artistManager': '' // TODO: translate "Artist Team (Manager)"
    , 'auth.scope.finance.ro': '' // TODO: translate "Finance: read-only"
    , 'auth.scope.edit.showsTravel': '' // TODO: translate "Edit shows/travel"
    , 'auth.scope.full': '' // TODO: translate "Full access"
    , 'login.title': '' // TODO: translate "Welcome to On Tour"
    , 'login.subtitle': '' // TODO: translate "Your tour management command center"
    , 'login.enterAs': '' // TODO: translate "Enter as {name}"
    , 'login.quick.agency': '' // TODO: translate "Enter as Shalizi (agency)"
    , 'login.quick.artist': '' // TODO: translate "Enter as Danny (artist)"
    , 'login.remember': '' // TODO: translate "Remember me"
    , 'login.usernameOrEmail': '' // TODO: translate "Username or Email"
    , 'role.agencyManager': '' // TODO: translate "Agency Manager"
    , 'role.artistOwner': '' // TODO: translate "Artist (Owner)"
    , 'role.artistManager': '' // TODO: translate "Artist Team (Manager)"
    , 'scope.shows.write': '' // TODO: translate "shows: write"
    , 'scope.shows.read': '' // TODO: translate "shows: read"
    , 'scope.travel.book': '' // TODO: translate "travel: book"
    , 'scope.travel.read': '' // TODO: translate "travel: read"
    , 'scope.finance.read': '' // TODO: translate "finance: read"
    , 'scope.finance.none': '' // TODO: translate "finance: none"
    , 'hero.enter': '' // TODO: translate "Enter"
    , 'marketing.nav.features': '' // TODO: translate "Features"
    , 'marketing.nav.product': '' // TODO: translate "Product"
    , 'marketing.nav.pricing': '' // TODO: translate "Pricing"
    , 'marketing.nav.testimonials': '' // TODO: translate "Testimonials"
    , 'marketing.nav.cta': '' // TODO: translate "Get started"
    , 'marketing.cta.primary': '' // TODO: translate "Start free"
    , 'marketing.cta.secondary': '' // TODO: translate "Watch demo"
    , 'marketing.cta.login': '' // TODO: translate "Log in"
    , 'hero.demo.artist': '' // TODO: translate "View demo as Danny"
    , 'hero.demo.agency': '' // TODO: translate "View demo as Adam"
    , 'hero.persona.question': '' // TODO: translate "I am a..."
    , 'hero.persona.artist': '' // TODO: translate "Artist / Manager"
    , 'hero.persona.agency': '' // TODO: translate "Agency"
    , 'hero.subtitle.artist': '' // TODO: translate "Take control of your finances and tour logistics. See your career from a single dashboard."
    , 'hero.subtitle.agency': '' // TODO: translate "Manage your entire roster from one place. Give your artists visibility and generate reports in seconds."
    , 'home.action.title': '' // TODO: translate "Stop Surviving. Start Commanding."
    , 'home.action.subtitle': '' // TODO: translate "See how On Tour App can transform your next tour."
    , 'home.action.cta': '' // TODO: translate "Request a Personalized Demo"
    , 'inside.map.desc.artist': '' // TODO: translate "Visualize your tour route and anticipate travel needs"
    , 'inside.finance.desc.artist': '' // TODO: translate "Track your earnings, expenses and profitability in real-time"
    , 'inside.actions.desc.artist': '' // TODO: translate "Stay on top of contracts, payments and upcoming deadlines"
    , 'inside.map.desc.agency': '' // TODO: translate "Monitor all your artists\"
    , 'inside.finance.desc.agency': '' // TODO: translate "Consolidated financial overview across your entire roster"
    , 'inside.actions.desc.agency': '' // TODO: translate "Centralized task management for team coordination and client updates"
    , 'inside.title': '' // TODO: translate "What you"
    , 'shows.summary.avgFee': '' // TODO: translate "Avg Fee"
    , 'shows.summary.avgMargin': '' // TODO: translate "Avg Margin"
    , 'inside.map.title': '' // TODO: translate "Map"
    , 'inside.map.desc': '' // TODO: translate "Live HUD with shows, route and risks"
    , 'inside.finance.title': '' // TODO: translate "Finance"
    , 'inside.finance.desc': '' // TODO: translate "Monthly KPIs, pipeline and forecast"
    , 'inside.actions.title': '' // TODO: translate "Actions"
    , 'inside.actions.desc': '' // TODO: translate "Action Hub with priorities and shortcuts"
    , 'how.title': '' // TODO: translate "How it works"
    , 'how.step.invite': '' // TODO: translate "Invite your team"
    , 'how.step.connect': '' // TODO: translate "Connect with artists or agencies"
    , 'how.step.views': '' // TODO: translate "Work by views: HUD, Finance, Shows"
    , 'how.step.connectData': '' // TODO: translate "Connect your data"
    , 'how.step.connectData.desc': '' // TODO: translate "Import shows, connect calendar, or get invited by your agency"
    , 'how.step.visualize': '' // TODO: translate "Visualize your world"
    , 'how.step.visualize.desc': '' // TODO: translate "Your tour comes alive on the map, finances clarify in the dashboard"
    , 'how.step.act': '' // TODO: translate "Act with intelligence"
    , 'how.step.connectData.artist': '' // TODO: translate "Import your shows, connect your calendar, or get invited by your agency. Your tour data in one place."
    , 'how.step.connectData.agency': '' // TODO: translate "Invite your artists and connect their data. Centralize all tour information across your roster."
    , 'how.step.visualize.artist': '' // TODO: translate "Your tour comes alive on the map, finances clarify in your personal dashboard. See your career at a glance."
    , 'how.step.visualize.agency': '' // TODO: translate "Monitor all artists\"
    , 'how.step.act.artist': '' // TODO: translate "Receive proactive alerts about contracts, payments, and deadlines. Make data-driven decisions with confidence."
    , 'how.step.act.agency': '' // TODO: translate "Prioritize team tasks, generate reports instantly, and keep all stakeholders informed with real-time updates."
    , 'how.multiTenant': '' // TODO: translate "Multi-tenant demo: switch between Agency and Artist contexts"
    , 'trust.privacy': '' // TODO: translate "Privacy: local demo (your browser)"
    , 'trust.accessibility': '' // TODO: translate "Accessibility: shortcuts “?”"
    , 'trust.support': '' // TODO: translate "Support"
    , 'trust.demo': '' // TODO: translate "Local demo — no data uploaded"
    , 'testimonials.title': '' // TODO: translate "Trusted by Industry Leaders"
    , 'testimonials.subtitle': '' // TODO: translate "Real stories from the touring industry"
    , 'testimonials.subtitle.artist': '' // TODO: translate "See how artists are taking control of their careers"
    , 'testimonials.subtitle.agency': '' // TODO: translate "Discover how agencies are transforming their operations"
    , 'common.skipToContent': '' // TODO: translate "Skip to content"
    , 'alerts.slackCopied': '' // TODO: translate "Slack payload copied"
    , 'alerts.copyManual': '' // TODO: translate "Open window to copy manually"
    , 'ah.title': '' // TODO: translate "Action Hub"
    , 'ah.tab.pending': '' // TODO: translate "Pending"
    , 'ah.tab.shows': '' // TODO: translate "This Month"
    , 'ah.tab.travel': '' // TODO: translate "Travel"
    , 'ah.tab.insights': '' // TODO: translate "Insights"
    , 'ah.filter.all': '' // TODO: translate "All"
    , 'ah.filter.risk': '' // TODO: translate "Risk"
    , 'ah.filter.urgency': '' // TODO: translate "Urgency"
    , 'ah.filter.opportunity': '' // TODO: translate "Opportunity"
    , 'ah.filter.offer': '' // TODO: translate "Offer"
    , 'ah.filter.finrisk': '' // TODO: translate "Finrisk"
    , 'ah.cta.addTravel': '' // TODO: translate "Add travel"
    , 'ah.cta.followUp': '' // TODO: translate "Follow up"
    , 'ah.cta.review': '' // TODO: translate "Review"
    , 'ah.cta.open': '' // TODO: translate "Open"
    , 'ah.empty': '' // TODO: translate "All caught up!"
    , 'ah.openTravel': '' // TODO: translate "Open Travel"
    , 'ah.done': '' // TODO: translate "Done"
    , 'ah.typeFilter': '' // TODO: translate "Type filter"
    , 'ah.why': '' // TODO: translate "Why?"
    , 'ah.why.title': '' // TODO: translate "Why this priority?"
    , 'ah.why.score': '' // TODO: translate "Score"
    , 'ah.why.impact': '' // TODO: translate "Impact"
    , 'ah.why.amount': '' // TODO: translate "Amount"
    , 'ah.why.inDays': '' // TODO: translate "In"
    , 'ah.why.overdue': '' // TODO: translate "Overdue"
    , 'ah.why.kind': '' // TODO: translate "Type"
    , 'finance.quicklook': '' // TODO: translate "Finance Quicklook"
    , 'finance.ledger': '' // TODO: translate "Ledger"
    , 'finance.targets': '' // TODO: translate "Targets"
    , 'finance.targets.month': '' // TODO: translate "Monthly targets"
    , 'finance.targets.year': '' // TODO: translate "Yearly targets"
    , 'finance.pipeline': '' // TODO: translate "Pipeline"
    , 'finance.pipeline.subtitle': '' // TODO: translate "Expected value (weighted by stage)"
    , 'finance.openFull': '' // TODO: translate "Open full finance"
    , 'finance.pivot': '' // TODO: translate "Pivot"
    , 'finance.pivot.group': '' // TODO: translate "Group"
    , 'finance.ar.view': '' // TODO: translate "View"
    , 'finance.ar.remind': '' // TODO: translate "Remind"
    , 'finance.ar.reminder.queued': '' // TODO: translate "Reminder queued"
    , 'finance.thisMonth': '' // TODO: translate "This Month"
    , 'finance.income': '' // TODO: translate "Income"
    , 'finance.expenses': '' // TODO: translate "Expenses"
    , 'finance.net': '' // TODO: translate "Net"
    , 'finance.byStatus': '' // TODO: translate "By status"
    , 'finance.byMonth': '' // TODO: translate "by month"
    , 'finance.confirmed': '' // TODO: translate "Confirmed"
    , 'finance.pending': '' // TODO: translate "Pending"
    , 'finance.compare': '' // TODO: translate "Compare prev"
    , 'charts.resetZoom': '' // TODO: translate "Reset zoom"
    , 'common.current': '' // TODO: translate "Current"
    , 'common.compare': '' // TODO: translate "Compare"
    , 'common.reminder': '' // TODO: translate "Reminder"
    , 'finance.ui.view': '' // TODO: translate "View"
    , 'finance.ui.classic': '' // TODO: translate "Classic"
    , 'finance.ui.beta': '' // TODO: translate "New (beta)"
    , 'finance.offer': '' // TODO: translate "Offer"
    , 'finance.shows': '' // TODO: translate "shows"
    , 'finance.noShowsMonth': '' // TODO: translate "No shows this month"
    , 'finance.hideAmounts': '' // TODO: translate "Hide amounts"
    , 'finance.hidden': '' // TODO: translate "Hidden"
    , 'common.open': '' // TODO: translate "Open"
    , 'common.apply': '' // TODO: translate "Apply"
    , 'common.saveView': '' // TODO: translate "Save view"
    , 'common.import': '' // TODO: translate "Import"
    , 'common.export': '' // TODO: translate "Export"
    , 'common.copied': '' // TODO: translate "Copied ✓"
    , 'common.markDone': '' // TODO: translate "Mark done"
    , 'common.hideItem': '' // TODO: translate "Hide"
    , 'views.import.invalidShape': '' // TODO: translate "Invalid views JSON shape"
    , 'views.import.invalidJson': '' // TODO: translate "Invalid JSON"
    , 'common.tomorrow': '' // TODO: translate "Tomorrow"
    , 'common.go': '' // TODO: translate "Go"
    , 'common.show': '' // TODO: translate "Show"
    , 'common.search': '' // TODO: translate "Search"
    , 'hud.next3weeks': '' // TODO: translate "Next 3 weeks"
    , 'hud.noTrips3weeks': '' // TODO: translate "No upcoming trips in 3 weeks"
    , 'hud.openShow': '' // TODO: translate "open show"
    , 'hud.openTrip': '' // TODO: translate "open travel"
    , 'hud.view.whatsnext': '' // TODO: translate "What"
    , 'hud.view.month': '' // TODO: translate "This Month"
    , 'hud.view.financials': '' // TODO: translate "Financials"
    , 'hud.view.whatsnext.desc': '' // TODO: translate "Upcoming 14 day summary"
    , 'hud.view.month.desc': '' // TODO: translate "Monthly financial & show snapshot"
    , 'hud.view.financials.desc': '' // TODO: translate "Financial intelligence breakdown"
    , 'hud.layer.heat': '' // TODO: translate "Heat"
    , 'hud.layer.status': '' // TODO: translate "Status"
    , 'hud.layer.route': '' // TODO: translate "Route"
    , 'hud.views': '' // TODO: translate "HUD views"
    , 'hud.layers': '' // TODO: translate "Map layers"
    , 'hud.missionControl': '' // TODO: translate "Mission Control"
    , 'hud.subtitle': '' // TODO: translate "Realtime map and upcoming shows"
    , 'hud.risks': '' // TODO: translate "Risks"
    , 'hud.assignProducer': '' // TODO: translate "Assign producer"
    , 'hud.mapLoadError': '' // TODO: translate "Map failed to load. Please retry."
    , 'common.retry': '' // TODO: translate "Retry"
    , 'hud.viewChanged': '' // TODO: translate "View changed to"
    , 'hud.openEvent': '' // TODO: translate "open event"
    , 'hud.type.flight': '' // TODO: translate "Flight"
    , 'hud.type.ground': '' // TODO: translate "Ground"
    , 'hud.type.event': '' // TODO: translate "Event"
    , 'hud.fin.avgNetMonth': '' // TODO: translate "Avg Net (Month)"
    , 'hud.fin.runRateYear': '' // TODO: translate "Run Rate (Year)"
    , 'finance.forecast': '' // TODO: translate "Forecast vs Actual"
    , 'finance.forecast.legend.actual': '' // TODO: translate "Actual net"
    , 'finance.forecast.legend.p50': '' // TODO: translate "Forecast p50"
    , 'finance.forecast.legend.band': '' // TODO: translate "Confidence band"
    , 'finance.forecast.alert.under': '' // TODO: translate "Under forecast by"
    , 'finance.forecast.alert.above': '' // TODO: translate "Above optimistic by"
    , 'map.toggle.status': '' // TODO: translate "Toggle status markers"
    , 'map.toggle.route': '' // TODO: translate "Toggle route line"
    , 'map.toggle.heat': '' // TODO: translate "Toggle heat circles"
    , 'shows.exportCsv': '' // TODO: translate "Export CSV"
    , 'shows.filters.from': '' // TODO: translate "From"
    , 'shows.filters.to': '' // TODO: translate "To"
    , 'shows.items': '' // TODO: translate "items"
    , 'shows.date.presets': '' // TODO: translate "Presets"
    , 'shows.date.thisMonth': '' // TODO: translate "This Month"
    , 'shows.date.nextMonth': '' // TODO: translate "Next Month"
    , 'shows.tooltip.net': '' // TODO: translate "Fee minus WHT, commissions, and costs"
    , 'shows.tooltip.margin': '' // TODO: translate "Net divided by Fee (%)"
    , 'shows.table.margin': '' // TODO: translate "Margin %"
    , 'shows.editor.margin.formula': '' // TODO: translate "Margin % = Net/Fee"
    , 'shows.tooltip.wht': '' // TODO: translate "Withholding tax percentage applied to the fee"
    , 'shows.editor.label.name': '' // TODO: translate "Show name"
    , 'shows.editor.placeholder.name': '' // TODO: translate "Festival or show name"
    , 'shows.editor.placeholder.venue': '' // TODO: translate "Venue name"
    , 'shows.editor.help.venue': '' // TODO: translate "Optional venue / room name"
    , 'shows.editor.help.fee': '' // TODO: translate "Gross fee agreed (before taxes, commissions, costs)"
    , 'shows.editor.help.wht': '' // TODO: translate "Local withholding tax percentage (auto-suggested by country)"
    , 'shows.editor.saving': '' // TODO: translate "Saving…"
    , 'shows.editor.saved': '' // TODO: translate "Saved ✓"
    , 'shows.editor.save.error': '' // TODO: translate "Save failed"
    , 'shows.editor.cost.templates': '' // TODO: translate "Templates"
    , 'shows.editor.cost.addTemplate': '' // TODO: translate "Add template"
    , 'shows.editor.cost.subtotals': '' // TODO: translate "Subtotals"
    , 'shows.editor.cost.type': '' // TODO: translate "Type"
    , 'shows.editor.cost.amount': '' // TODO: translate "Amount"
    , 'shows.editor.cost.desc': '' // TODO: translate "Description"
    , 'shows.editor.status.help': '' // TODO: translate "Current lifecycle state of the show"
    , 'shows.editor.cost.template.travel': '' // TODO: translate "Travel basics"
    , 'shows.editor.cost.template.production': '' // TODO: translate "Production basics"
    , 'shows.editor.cost.template.marketing': '' // TODO: translate "Marketing basics"
    , 'shows.editor.quick.label': '' // TODO: translate "Quick add costs"
    , 'shows.editor.quick.hint': '' // TODO: translate "e.g., Hotel 1200"
    , 'shows.editor.quick.placeholder': '' // TODO: translate "20/04/2025 "
    , 'shows.editor.quick.preview.summary': '' // TODO: translate "Will set: {fields}"
    , 'shows.editor.quick.apply': '' // TODO: translate "Apply"
    , 'shows.editor.quick.parseError': '' // TODO: translate "Cannot interpret"
    , 'shows.editor.quick.applied': '' // TODO: translate "Quick entry applied"
    , 'shows.editor.bulk.title': '' // TODO: translate "Bulk add costs"
    , 'shows.editor.bulk.open': '' // TODO: translate "Bulk add"
    , 'shows.editor.bulk.placeholder': '' // TODO: translate "Type, Amount, Description\nTravel, 1200, Flights BCN-MAD\nProduction\t500\tBackline"
    , 'shows.editor.bulk.preview': '' // TODO: translate "Preview"
    , 'shows.editor.bulk.parsed': '' // TODO: translate "Parsed {count} lines"
    , 'shows.editor.bulk.add': '' // TODO: translate "Add costs"
    , 'shows.editor.bulk.cancel': '' // TODO: translate "Cancel"
    , 'shows.editor.bulk.invalidLine': '' // TODO: translate "Invalid line {n}"
    , 'shows.editor.bulk.empty': '' // TODO: translate "No valid lines"
    , 'shows.editor.bulk.help': '' // TODO: translate "Paste CSV or tab-separated lines: Type, Amount, Description (amount optional)"
    , 'shows.editor.restored': '' // TODO: translate "Restored draft"
    , 'shows.editor.quick.icon.date': '' // TODO: translate "Date"
    , 'shows.editor.quick.icon.city': '' // TODO: translate "City"
    , 'shows.editor.quick.icon.country': '' // TODO: translate "Country"
    , 'shows.editor.quick.icon.fee': '' // TODO: translate "Fee"
    , 'shows.editor.quick.icon.whtPct': '' // TODO: translate "WHT %"
    , 'shows.editor.quick.icon.name': '' // TODO: translate "Name"
    , 'shows.editor.cost.templateMenu': '' // TODO: translate "Cost templates"
    , 'shows.editor.cost.template.applied': '' // TODO: translate "Template applied"
    , 'shows.editor.cost.duplicate': '' // TODO: translate "Duplicate"
    , 'shows.editor.cost.moveUp': '' // TODO: translate "Move up"
    , 'shows.editor.cost.moveDown': '' // TODO: translate "Move down"
    , 'shows.editor.costs.title': '' // TODO: translate "Costs"
    , 'shows.editor.costs.empty': '' // TODO: translate "No costs yet — add one"
    , 'shows.editor.costs.recent': '' // TODO: translate "Recent"
    , 'shows.editor.costs.templates': '' // TODO: translate "Templates"
    , 'shows.editor.costs.subtotal': '' // TODO: translate "Subtotal {category}"
    , 'shows.editor.wht.suggest': '' // TODO: translate "Suggest {pct}%"
    , 'shows.editor.wht.apply': '' // TODO: translate "Apply {pct}%"
    , 'shows.editor.wht.suggest.applied': '' // TODO: translate "Suggestion applied"
    , 'shows.editor.wht.tooltip.es': '' // TODO: translate "Typical IRPF in ES: 15% (editable)"
    , 'shows.editor.wht.tooltip.generic': '' // TODO: translate "Typical withholding suggestion"
    , 'shows.editor.status.hint': '' // TODO: translate "Change here or via badge"
    , 'shows.editor.wht.hint.es': '' // TODO: translate "Typical ES withholding: 15% (editable)"
    , 'shows.editor.wht.hint.generic': '' // TODO: translate "Withholding percentage (editable)"
    , 'shows.editor.commission.default': '' // TODO: translate "Default {pct}%"
    , 'shows.editor.commission.overridden': '' // TODO: translate "Override"
    , 'shows.editor.commission.overriddenIndicator': '' // TODO: translate "Commission overridden"
    , 'shows.editor.commission.reset': '' // TODO: translate "Reset to default"
    , 'shows.editor.label.currency': '' // TODO: translate "Currency"
    , 'shows.editor.help.currency': '' // TODO: translate "Contract currency"
    , 'shows.editor.fx.rateOn': '' // TODO: translate "Rate"
    , 'shows.editor.fx.convertedFee': '' // TODO: translate "≈ {amount} {base}"
    , 'shows.editor.fx.unavailable': '' // TODO: translate "Rate unavailable"
    , 'shows.editor.actions.promote': '' // TODO: translate "Promote"
    , 'shows.editor.actions.planTravel': '' // TODO: translate "Plan travel"
    , 'shows.editor.state.hint': '' // TODO: translate "Use the badge or this selector"
    , 'shows.editor.save.create': '' // TODO: translate "Save"
    , 'shows.editor.save.edit': '' // TODO: translate "Save changes"
    , 'shows.editor.save.retry': '' // TODO: translate "Retry"
    , 'shows.editor.tab.active': '' // TODO: translate "Tab {label} active"
    , 'shows.editor.tab.restored': '' // TODO: translate "Restored last tab: {label}"
    , 'shows.editor.errors.count': '' // TODO: translate "There are {n} errors"
    , 'shows.totals.fees': '' // TODO: translate "Fees"
    , 'shows.totals.net': '' // TODO: translate "Net"
    , 'shows.totals.hide': '' // TODO: translate "Hide"
    , 'shows.totals.show': '' // TODO: translate "Show totals"
    , 'shows.view.list': '' // TODO: translate "List"
    , 'shows.view.board': '' // TODO: translate "Board"
    , 'shows.views.none': '' // TODO: translate "Views"
    , 'views.manage': '' // TODO: translate "Manage views"
    , 'views.saved': '' // TODO: translate "Saved"
    , 'views.apply': '' // TODO: translate "Apply"
    , 'views.none': '' // TODO: translate "No saved views"
    , 'views.deleted': '' // TODO: translate "Deleted"
    , 'views.export': '' // TODO: translate "Export"
    , 'views.import': '' // TODO: translate "Import"
    , 'views.import.hint': '' // TODO: translate "Paste JSON of views to import"
    , 'views.openLab': '' // TODO: translate "Open Layout Lab"
    , 'views.share': '' // TODO: translate "Copy share link"
    , 'views.export.copied': '' // TODO: translate "Export copied"
    , 'views.imported': '' // TODO: translate "Views imported"
    , 'views.import.invalid': '' // TODO: translate "Invalid JSON"
    , 'views.label': '' // TODO: translate "View"
    , 'views.names.default': '' // TODO: translate "Default"
    , 'views.names.finance': '' // TODO: translate "Finance"
    , 'views.names.operations': '' // TODO: translate "Operations"
    , 'views.names.promo': '' // TODO: translate "Promotion"
    , 'demo.banner': '' // TODO: translate "Demo data • No live sync"
    , 'demo.load': '' // TODO: translate "Load demo data"
    , 'demo.loaded': '' // TODO: translate "Demo data loaded"
    , 'demo.clear': '' // TODO: translate "Clear data"
    , 'demo.cleared': '' // TODO: translate "All data cleared"
    , 'demo.password.prompt': '' // TODO: translate "Enter demo password"
    , 'demo.password.invalid': '' // TODO: translate "Incorrect password"
    , 'shows.views.delete': '' // TODO: translate "Delete"
    , 'shows.views.namePlaceholder': '' // TODO: translate "View name"
    , 'shows.views.save': '' // TODO: translate "Save"
    , 'shows.status.canceled': '' // TODO: translate "Canceled"
    , 'shows.status.archived': '' // TODO: translate "Archived"
    , 'shows.status.offer': '' // TODO: translate "Offer"
    , 'shows.status.pending': '' // TODO: translate "Pending"
    , 'shows.status.confirmed': '' // TODO: translate "Confirmed"
    , 'shows.status.postponed': '' // TODO: translate "Postponed"
    , 'shows.bulk.selected': '' // TODO: translate "selected"
    , 'shows.bulk.confirm': '' // TODO: translate "Confirm"
    , 'shows.bulk.promote': '' // TODO: translate "Promote"
    , 'shows.bulk.export': '' // TODO: translate "Export"
    , 'shows.notes': '' // TODO: translate "Notes"
    , 'shows.virtualized.hint': '' // TODO: translate "Virtualized list active"
    , 'story.title': '' // TODO: translate "Story mode"
    , 'story.timeline': '' // TODO: translate "Timeline"
    , 'story.play': '' // TODO: translate "Play"
    , 'story.pause': '' // TODO: translate "Pause"
    , 'story.cta': '' // TODO: translate "Story mode"
    , 'story.scrub': '' // TODO: translate "Scrub timeline"
    , 'finance.overview': '' // TODO: translate "Finance overview"
    , 'shows.title': '' // TODO: translate "Shows"
    , 'shows.notFound': '' // TODO: translate "Show not found"
    , 'shows.search.placeholder': '' // TODO: translate "Search city/country"
    , 'shows.add': '' // TODO: translate "Add show"
    , 'shows.edit': '' // TODO: translate "Edit"
    , 'shows.summary.upcoming': '' // TODO: translate "Upcoming"
    , 'shows.summary.totalFees': '' // TODO: translate "Total Fees"
    , 'shows.summary.estNet': '' // TODO: translate "Est. Net"
    , 'shows.summary.avgWht': '' // TODO: translate "Avg WHT"
    , 'shows.table.date': '' // TODO: translate "Date"
    , 'shows.table.name': '' // TODO: translate "Show"
    , 'shows.table.city': '' // TODO: translate "City"
    , 'shows.table.country': '' // TODO: translate "Country"
    , 'shows.table.venue': '' // TODO: translate "Venue"
    , 'shows.table.promoter': '' // TODO: translate "Promoter"
    , 'shows.table.wht': '' // TODO: translate "WHT %"
    , 'shows.table.type': '' // TODO: translate "Type"
    , 'shows.table.description': '' // TODO: translate "Description"
    , 'shows.table.amount': '' // TODO: translate "Amount"
    , 'shows.table.remove': '' // TODO: translate "Remove"
    , 'shows.table.agency.mgmt': '' // TODO: translate "Mgmt"
    , 'shows.table.agency.booking': '' // TODO: translate "Booking"
    , 'shows.table.agencies': '' // TODO: translate "Agencies"
    , 'shows.table.notes': '' // TODO: translate "Notes"
    , 'shows.table.fee': '' // TODO: translate "Fee"
    , 'shows.selected': '' // TODO: translate "selected"
    , 'shows.count.singular': '' // TODO: translate "show"
    , 'shows.count.plural': '' // TODO: translate "shows"
    , 'settings.title': '' // TODO: translate "Settings"
    , 'settings.personal': '' // TODO: translate "Personal"
    , 'settings.preferences': '' // TODO: translate "Preferences"
    , 'settings.organization': '' // TODO: translate "Organization"
    , 'settings.billing': '' // TODO: translate "Billing"
    , 'settings.currency': '' // TODO: translate "Currency"
    , 'settings.units': '' // TODO: translate "Distance units"
    , 'settings.agencies': '' // TODO: translate "Agencies"
    , 'settings.localNote': '' // TODO: translate "Preferences are saved locally on this device."
    , 'settings.language': '' // TODO: translate "Language"
    , 'settings.language.en': '' // TODO: translate "English"
    , 'settings.language.es': '' // TODO: translate "Spanish"
    , 'settings.dashboardView': '' // TODO: translate "Default Dashboard View"
    , 'settings.presentation': '' // TODO: translate "Presentation mode"
    , 'settings.comparePrev': '' // TODO: translate "Compare vs previous period"
    , 'settings.defaultStatuses': '' // TODO: translate "Default status filters"
    , 'settings.defaultRegion': '' // TODO: translate "Default region"
    , 'settings.region.all': '' // TODO: translate "All"
    , 'settings.region.AMER': '' // TODO: translate "Americas"
    , 'settings.region.EMEA': '' // TODO: translate "EMEA"
    , 'settings.region.APAC': '' // TODO: translate "APAC"
    , 'settings.agencies.booking': '' // TODO: translate "Booking Agencies"
    , 'settings.agencies.management': '' // TODO: translate "Management Agencies"
    , 'settings.agencies.add': '' // TODO: translate "Add"
    , 'settings.agencies.hideForm': '' // TODO: translate "Hide form"
    , 'settings.agencies.none': '' // TODO: translate "No agencies"
    , 'settings.agencies.name': '' // TODO: translate "Name"
    , 'settings.agencies.commission': '' // TODO: translate "Commission %"
    , 'settings.agencies.territoryMode': '' // TODO: translate "Territory Mode"
    , 'settings.agencies.continents': '' // TODO: translate "Continents"
    , 'settings.agencies.countries': '' // TODO: translate "Countries (comma or space separated ISO2)"
    , 'settings.agencies.addBooking': '' // TODO: translate "Add booking"
    , 'settings.agencies.addManagement': '' // TODO: translate "Add management"
    , 'settings.agencies.reset': '' // TODO: translate "Reset"
    , 'settings.agencies.remove': '' // TODO: translate "Remove agency"
    , 'settings.agencies.limitReached': '' // TODO: translate "Limit reached (max 3)"
    , 'settings.agencies.countries.invalid': '' // TODO: translate "Countries must be 2-letter ISO codes (e.g., US ES DE), separated by commas or spaces."
    , 'settings.continent.NA': '' // TODO: translate "North America"
    , 'settings.continent.SA': '' // TODO: translate "South America"
    , 'settings.continent.EU': '' // TODO: translate "Europe"
    , 'settings.continent.AF': '' // TODO: translate "Africa"
    , 'settings.continent.AS': '' // TODO: translate "Asia"
    , 'settings.continent.OC': '' // TODO: translate "Oceania"
    , 'settings.territory.worldwide': '' // TODO: translate "Worldwide"
    , 'settings.territory.continents': '' // TODO: translate "Continents"
    , 'settings.territory.countries': '' // TODO: translate "Countries"
    , 'settings.export': '' // TODO: translate "Export settings"
    , 'settings.import': '' // TODO: translate "Import settings"
    , 'settings.reset': '' // TODO: translate "Reset to defaults"
    , 'settings.preview': '' // TODO: translate "Preview"
    , 'shows.table.net': '' // TODO: translate "Net"
    , 'shows.table.status': '' // TODO: translate "Status"
    , 'shows.selectAll': '' // TODO: translate "Select all"
    , 'shows.selectRow': '' // TODO: translate "Select row"
    , 'shows.editor.tabs': '' // TODO: translate "Editor tabs"
    , 'shows.editor.tab.details': '' // TODO: translate "Details"
    , 'shows.editor.tab.finance': '' // TODO: translate "Finance"
    , 'shows.editor.tab.costs': '' // TODO: translate "Costs"
    , 'shows.editor.finance.commissions': '' // TODO: translate "Commissions"
    , 'shows.editor.add': '' // TODO: translate "Add show"
    , 'shows.editor.edit': '' // TODO: translate "Edit show"
    , 'shows.editor.subtitleAdd': '' // TODO: translate "Create a new event"
    , 'shows.editor.label.status': '' // TODO: translate "Status"
    , 'shows.editor.label.date': '' // TODO: translate "Date"
    , 'shows.editor.label.city': '' // TODO: translate "City"
    , 'shows.editor.label.country': '' // TODO: translate "Country"
    , 'shows.editor.label.venue': '' // TODO: translate "Venue"
    , 'shows.editor.label.promoter': '' // TODO: translate "Promoter"
    , 'shows.editor.label.fee': '' // TODO: translate "Fee"
    , 'shows.editor.label.wht': '' // TODO: translate "WHT %"
    , 'shows.editor.label.mgmt': '' // TODO: translate "Mgmt Agency"
    , 'shows.editor.label.booking': '' // TODO: translate "Booking Agency"
    , 'shows.editor.label.notes': '' // TODO: translate "Notes"
    , 'shows.editor.validation.cityRequired': '' // TODO: translate "City is required"
    , 'shows.editor.validation.countryRequired': '' // TODO: translate "Country is required"
    , 'shows.editor.validation.dateRequired': '' // TODO: translate "Date is required"
    , 'shows.editor.validation.feeGtZero': '' // TODO: translate "Fee must be greater than 0"
    , 'shows.editor.validation.whtRange': '' // TODO: translate "WHT must be between 0% and 50%"
    , 'shows.dialog.close': '' // TODO: translate "Close"
    , 'shows.dialog.cancel': '' // TODO: translate "Cancel"
    , 'shows.dialog.save': '' // TODO: translate "Save"
    , 'shows.dialog.saveChanges': '' // TODO: translate "Save changes"
    , 'shows.dialog.delete': '' // TODO: translate "Delete"
    , 'shows.editor.validation.fail': '' // TODO: translate "Fix errors to continue"
    , 'shows.editor.toast.saved': '' // TODO: translate "Saved"
    , 'shows.editor.toast.deleted': '' // TODO: translate "Deleted"
    , 'shows.editor.toast.undo': '' // TODO: translate "Undo"
    , 'shows.editor.toast.restored': '' // TODO: translate "Restored"
    , 'shows.editor.toast.deleting': '' // TODO: translate "Deleting…"
    , 'shows.editor.toast.discarded': '' // TODO: translate "Changes discarded"
    , 'shows.editor.toast.validation': '' // TODO: translate "Please correct the highlighted errors"
    , 'shows.editor.summary.fee': '' // TODO: translate "Fee"
    , 'shows.editor.summary.wht': '' // TODO: translate "WHT"
    , 'shows.editor.summary.costs': '' // TODO: translate "Costs"
    , 'shows.editor.summary.net': '' // TODO: translate "Est. Net"
    , 'shows.editor.discard.title': '' // TODO: translate "Discard changes?"
    , 'shows.editor.discard.body': '' // TODO: translate "You have unsaved changes. They will be lost."
    , 'shows.editor.discard.cancel': '' // TODO: translate "Keep editing"
    , 'shows.editor.discard.confirm': '' // TODO: translate "Discard"
    , 'shows.editor.delete.confirmTitle': '' // TODO: translate "Delete show?"
    , 'shows.editor.delete.confirmBody': '' // TODO: translate "This action cannot be undone."
    , 'shows.editor.delete.confirm': '' // TODO: translate "Delete"
    , 'shows.editor.delete.cancel': '' // TODO: translate "Cancel"
    , 'shows.noCosts': '' // TODO: translate "No costs yet"
    , 'shows.filters.region': '' // TODO: translate "Region"
    , 'shows.filters.region.all': '' // TODO: translate "All"
    , 'shows.filters.region.AMER': '' // TODO: translate "AMER"
    , 'shows.filters.region.EMEA': '' // TODO: translate "EMEA"
    , 'shows.filters.region.APAC': '' // TODO: translate "APAC"
    , 'shows.filters.feeMin': '' // TODO: translate "Min fee"
    , 'shows.filters.feeMax': '' // TODO: translate "Max fee"
    , 'shows.views.export': '' // TODO: translate "Export views"
    , 'shows.views.import': '' // TODO: translate "Import views"
    , 'shows.views.applied': '' // TODO: translate "View applied"
    , 'shows.bulk.delete': '' // TODO: translate "Delete selected"
    , 'shows.bulk.setWht': '' // TODO: translate "Set WHT %"
    , 'shows.bulk.applyWht': '' // TODO: translate "Apply WHT"
    , 'shows.bulk.setStatus': '' // TODO: translate "Set status"
    , 'shows.bulk.apply': '' // TODO: translate "Apply"
    , 'shows.travel.title': '' // TODO: translate "Location"
    , 'shows.travel.quick': '' // TODO: translate "Travel"
    , 'shows.travel.soon': '' // TODO: translate "Upcoming confirmed show — consider adding travel."
    , 'shows.travel.soonConfirmed': '' // TODO: translate "Upcoming confirmed show — consider adding travel."
    , 'shows.travel.soonGeneric': '' // TODO: translate "Upcoming show — consider planning travel."
    , 'shows.travel.tripExists': '' // TODO: translate "Trip already scheduled around this date"
    , 'shows.travel.noCta': '' // TODO: translate "No travel action needed"
    , 'shows.travel.plan': '' // TODO: translate "Plan travel"
    , 'cmd.dialog': '' // TODO: translate "Command palette"
    , 'cmd.placeholder': '' // TODO: translate "Search shows or actions…"
    , 'cmd.type.show': '' // TODO: translate "Show"
    , 'cmd.type.action': '' // TODO: translate "Action"
    , 'cmd.noResults': '' // TODO: translate "No results"
    , 'cmd.footer.hint': '' // TODO: translate "Enter to run • Esc to close"
    , 'cmd.footer.tip': '' // TODO: translate "Tip: press ? for shortcuts"
    , 'cmd.openFilters': '' // TODO: translate "Open Filters"
    , 'cmd.mask.enable': '' // TODO: translate "Enable Mask"
    , 'cmd.mask.disable': '' // TODO: translate "Disable Mask"
    , 'cmd.presentation.enable': '' // TODO: translate "Enable Presentation Mode"
    , 'cmd.presentation.disable': '' // TODO: translate "Disable Presentation Mode"
    , 'cmd.shortcuts': '' // TODO: translate "Show Shortcuts Overlay"
    , 'cmd.switch.default': '' // TODO: translate "Switch View: Default"
    , 'cmd.switch.finance': '' // TODO: translate "Switch View: Finance"
    , 'cmd.switch.operations': '' // TODO: translate "Switch View: Operations"
    , 'cmd.switch.promo': '' // TODO: translate "Switch View: Promotion"
    , 'cmd.openAlerts': '' // TODO: translate "Open Alert Center"
    , 'cmd.go.shows': '' // TODO: translate "Go to Shows"
    , 'cmd.go.travel': '' // TODO: translate "Go to Travel"
    , 'cmd.go.finance': '' // TODO: translate "Go to Finance"
    , 'cmd.go.org': '' // TODO: translate "Go to Org Overview"
    , 'cmd.go.members': '' // TODO: translate "Go to Org Members"
    , 'cmd.go.clients': '' // TODO: translate "Go to Org Clients"
    , 'cmd.go.teams': '' // TODO: translate "Go to Org Teams"
    , 'cmd.go.links': '' // TODO: translate "Go to Org Links"
    , 'cmd.go.reports': '' // TODO: translate "Go to Org Reports"
    , 'cmd.go.documents': '' // TODO: translate "Go to Org Documents"
    , 'cmd.go.integrations': '' // TODO: translate "Go to Org Integrations"
    , 'cmd.go.billing': '' // TODO: translate "Go to Org Billing"
    , 'cmd.go.branding': '' // TODO: translate "Go to Org Branding"
    , 'shortcuts.dialog': '' // TODO: translate "Keyboard shortcuts"
    , 'shortcuts.title': '' // TODO: translate "Shortcuts"
    , 'shortcuts.desc': '' // TODO: translate "Use these to move faster. Press Esc to close."
    , 'shortcuts.openPalette': '' // TODO: translate "Open Command Palette"
    , 'shortcuts.showOverlay': '' // TODO: translate "Show this overlay"
    , 'shortcuts.closeDialogs': '' // TODO: translate "Close dialogs/popups"
    , 'shortcuts.goTo': '' // TODO: translate "Quick nav: g then key"
    , 'alerts.open': '' // TODO: translate "Open Alerts"
    , 'alerts.loading': '' // TODO: translate "Loading alerts…"
    , 'actions.exportCsv': '' // TODO: translate "Export CSV"
    , 'actions.copyDigest': '' // TODO: translate "Copy Digest"
    , 'actions.digest.title': '' // TODO: translate "Weekly Alerts Digest"
    , 'actions.toast.csv': '' // TODO: translate "CSV copied"
    , 'actions.toast.digest': '' // TODO: translate "Digest copied"
    , 'actions.toast.share': '' // TODO: translate "Link copied"
    , 'welcome.title': '' // TODO: translate "Welcome, {name}"
    , 'welcome.subtitle.agency': '' // TODO: translate "Manage your managers and artists"
    , 'welcome.subtitle.artist': '' // TODO: translate "All set for your upcoming shows"
    , 'welcome.cta.dashboard': '' // TODO: translate "Go to dashboard"
    , 'welcome.section.team': '' // TODO: translate "Your team"
    , 'welcome.section.clients': '' // TODO: translate "Your artists"
    , 'welcome.section.assignments': '' // TODO: translate "Managers per artist"
    , 'welcome.section.links': '' // TODO: translate "Connections & scopes"
    , 'welcome.section.kpis': '' // TODO: translate "This month"
    , 'welcome.seats.usage': '' // TODO: translate "Seats used"
    , 'welcome.gettingStarted': '' // TODO: translate "Getting started"
    , 'welcome.recentlyViewed': '' // TODO: translate "Recently viewed"
    , 'welcome.changesSince': '' // TODO: translate "Changes since your last visit"
    , 'welcome.noChanges': '' // TODO: translate "No changes"
    , 'welcome.change.linkEdited': '' // TODO: translate "Link scopes edited for Danny"
    , 'welcome.change.memberInvited': '' // TODO: translate "New manager invited"
    , 'welcome.change.docUploaded': '' // TODO: translate "New document uploaded"
    , 'empty.noRecent': '' // TODO: translate "No recent items"
    , 'welcome.cta.inviteManager': '' // TODO: translate "Invite manager"
    , 'welcome.cta.connectArtist': '' // TODO: translate "Connect artist"
    , 'welcome.cta.createTeam': '' // TODO: translate "Create team"
    , 'welcome.cta.completeBranding': '' // TODO: translate "Complete branding"
    , 'welcome.cta.reviewShows': '' // TODO: translate "Review shows"
    , 'welcome.cta.connectCalendar': '' // TODO: translate "Connect calendar"
    , 'welcome.cta.switchOrg': '' // TODO: translate "Change organization"
    , 'welcome.cta.completeSetup': '' // TODO: translate "Complete setup"
    , 'welcome.progress.complete': '' // TODO: translate "Setup complete"
    , 'welcome.progress.incomplete': '' // TODO: translate "{completed}/{total} steps completed"
    , 'welcome.tooltip.inviteManager': '' // TODO: translate "Invite team members to collaborate on shows and finances"
    , 'welcome.tooltip.connectArtist': '' // TODO: translate "Link with artists to manage their tours"
    , 'welcome.tooltip.completeBranding': '' // TODO: translate "Set up your organization\"
    , 'welcome.tooltip.connectCalendar': '' // TODO: translate "Sync your calendar for automatic show scheduling"
    , 'welcome.tooltip.switchOrg': '' // TODO: translate "Switch between different organizations you manage"
    , 'welcome.gettingStarted.invite': '' // TODO: translate "Invite a manager"
    , 'welcome.gettingStarted.connect': '' // TODO: translate "Connect an artist"
    , 'welcome.gettingStarted.review': '' // TODO: translate "Review teams & links"
    , 'welcome.gettingStarted.branding': '' // TODO: translate "Complete branding"
    , 'welcome.gettingStarted.shows': '' // TODO: translate "Review shows"
    , 'welcome.gettingStarted.calendar': '' // TODO: translate "Connect calendar"
    , 'welcome.dontShowAgain': '' // TODO: translate "Don"
    , 'welcome.openArtistDashboard': '' // TODO: translate "Open {artist} dashboard"
    , 'welcome.assign': '' // TODO: translate "Assign"
    , 'shows.toast.bulk.status': '' // TODO: translate "Status: {status} ({n})"
    , 'shows.toast.bulk.confirm': '' // TODO: translate "Confirmed"
    , 'shows.toast.bulk.setStatus': '' // TODO: translate "Status applied"
    , 'shows.toast.bulk.setWht': '' // TODO: translate "WHT applied"
    , 'shows.toast.bulk.export': '' // TODO: translate "Export started"
    , 'shows.toast.bulk.delete': '' // TODO: translate "Deleted"
    , 'shows.toast.bulk.confirmed': '' // TODO: translate "Confirmed ({n})"
    , 'shows.toast.bulk.wht': '' // TODO: translate "WHT {pct}% ({n})"
    , 'filters.clear': '' // TODO: translate "Clear"
    , 'filters.more': '' // TODO: translate "More filters"
    , 'filters.cleared': '' // TODO: translate "Filters cleared"
    , 'filters.presets': '' // TODO: translate "Presets"
    , 'filters.presets.last7': '' // TODO: translate "Last 7 days"
    , 'filters.presets.last30': '' // TODO: translate "Last 30 days"
    , 'filters.presets.last90': '' // TODO: translate "Last 90 days"
    , 'filters.presets.mtd': '' // TODO: translate "Month to date"
    , 'filters.presets.ytd': '' // TODO: translate "Year to date"
    , 'filters.presets.qtd': '' // TODO: translate "Quarter to date"
    , 'filters.applied': '' // TODO: translate "Filters applied"
    , 'common.team': '' // TODO: translate "Team"
    , 'common.region': '' // TODO: translate "Region"
    , 'ah.planTravel': '' // TODO: translate "Plan travel"
    , 'map.cssWarning': '' // TODO: translate "Map styles failed to load. Using basic fallback."
    , 'travel.offline': '' // TODO: translate "Offline mode: showing cached itineraries."
    , 'travel.refresh.error': '' // TODO: translate "Couldn"
    , 'travel.search.title': '' // TODO: translate "Search"
    , 'travel.search.open_in_google': '' // TODO: translate "Open in Google Flights"
    , 'travel.search.mode.form': '' // TODO: translate "Form"
    , 'travel.search.mode.text': '' // TODO: translate "Text"
    , 'travel.search.show_text': '' // TODO: translate "Write query"
    , 'travel.search.hide_text': '' // TODO: translate "Hide text input"
    , 'travel.search.text.placeholder': '' // TODO: translate "e.g., From MAD to CDG 2025-10-12 2 adults business"
    , 'travel.nlp': '' // TODO: translate "NLP"
    , 'travel.search.origin': '' // TODO: translate "Origin"
    , 'travel.search.destination': '' // TODO: translate "Destination"
    , 'travel.search.departure_date': '' // TODO: translate "Departure date"
    , 'travel.search.searching': '' // TODO: translate "Searching flights…"
    , 'travel.search.searchMyFlight': '' // TODO: translate "Search My Flight"
    , 'travel.search.searchAgain': '' // TODO: translate "Search Again"
    , 'travel.search.error': '' // TODO: translate "Error searching flights"
    , 'travel.addPurchasedFlight': '' // TODO: translate "Add Purchased Flight"
    , 'travel.addFlightDescription': '' // TODO: translate "Enter your booking reference or flight number to add it to your schedule"
    , 'travel.emptyStateDescription': '' // TODO: translate "Add your booked flights or search for new ones to start managing your trips."
    , 'features.settlement.benefit': '' // TODO: translate "8h/week saved on financial reports"
    , 'features.offline.description': '' // TODO: translate "IndexedDB + robust sync. Manage your tour on the plane, backstage, or anywhere. When internet returns, everything syncs automatically."
    , 'features.offline.benefit': '' // TODO: translate "24/7 access, no connection dependency"
    , 'features.ai.description': '' // TODO: translate "NLP Quick Entry, intelligent ActionHub, predictive Health Score. Warns you of problems before they happen. Your tour copilot."
    , 'features.ai.benefit': '' // TODO: translate "Anticipates problems 72h in advance"
    , 'features.esign.description': '' // TODO: translate "Integrated e-sign, templates by country (US/UK/EU/ES), full-text search with OCR. Close deals faster, no paper printing."
    , 'features.esign.benefit': '' // TODO: translate "Close contracts 3x faster"
    , 'features.inbox.description': '' // TODO: translate "Emails organized by show, smart threading, rich text reply. All your context in one place, no Gmail searching."
    , 'features.inbox.benefit': '' // TODO: translate "Zero inbox with full context"
    , 'features.travel.description': '' // TODO: translate "Integrated Amadeus API, global venue database, optimized routing. Plan efficient routes with real data."
    , 'features.travel.benefit': '' // TODO: translate "12% savings on travel costs"
    , 'org.addShowToCalendar': '' // TODO: translate "Add a new show to your calendar"
    , 'travel.validation.completeFields': '' // TODO: translate "Please complete origin, destination and departure date"
    , 'travel.validation.returnDate': '' // TODO: translate "Select return date for round trip"
    , 'travel.search.show_more_options': '' // TODO: translate "Open externally"
    , 'travel.advanced.show': '' // TODO: translate "More options"
    , 'travel.advanced.hide': '' // TODO: translate "Hide advanced options"
    , 'travel.flight_card.nonstop': '' // TODO: translate "nonstop"
    , 'travel.flight_card.stop': '' // TODO: translate "stop"
    , 'travel.flight_card.stops': '' // TODO: translate "stops"
    , 'travel.flight_card.select_for_planning': '' // TODO: translate "Select for planning"
    , 'travel.add_to_trip': '' // TODO: translate "Add to trip"
    , 'travel.swap': '' // TODO: translate "Swap"
    , 'travel.round_trip': '' // TODO: translate "Round trip"
    , 'travel.share_search': '' // TODO: translate "Share search"
    , 'travel.from': '' // TODO: translate "From"
    , 'travel.to': '' // TODO: translate "To"
    , 'travel.depart': '' // TODO: translate "Depart"
    , 'travel.return': '' // TODO: translate "Return"
    , 'travel.adults': '' // TODO: translate "Adults"
    , 'travel.bag': '' // TODO: translate "bag"
    , 'travel.bags': '' // TODO: translate "Bags"
    , 'travel.cabin': '' // TODO: translate "Cabin"
    , 'travel.stops_ok': '' // TODO: translate "Stops ok"
    , 'travel.deeplink.preview': '' // TODO: translate "Preview link"
    , 'travel.deeplink.copy': '' // TODO: translate "Copy link"
    , 'travel.deeplink.copied': '' // TODO: translate "Copied ✓"
    , 'travel.sort.menu': '' // TODO: translate "Sort by"
    , 'travel.sort.priceAsc': '' // TODO: translate "Price (low→high)"
    , 'travel.sort.priceDesc': '' // TODO: translate "Price (high→low)"
    , 'travel.sort.duration': '' // TODO: translate "Duration"
    , 'travel.sort.stops': '' // TODO: translate "Stops"
    , 'travel.badge.nonstop': '' // TODO: translate "Nonstop"
    , 'travel.badge.baggage': '' // TODO: translate "Bag included"
    , 'travel.arrival.sameDay': '' // TODO: translate "Arrives same day"
    , 'travel.arrival.nextDay': '' // TODO: translate "Arrives next day"
    , 'travel.recent.clear': '' // TODO: translate "Clear recent"
    , 'travel.recent.remove': '' // TODO: translate "Remove"
    , 'travel.form.invalid': '' // TODO: translate "Please fix errors to search"
    , 'travel.nlp.hint': '' // TODO: translate "Free-form input — press Shift+Enter to apply"
    , 'travel.flex.days': '' // TODO: translate "±{n} days"
    , 'travel.compare.grid.title': '' // TODO: translate "Compare flights"
    , 'travel.compare.empty': '' // TODO: translate "Pin flights to compare them here."
    , 'travel.compare.hint': '' // TODO: translate "Review pinned flights side-by-side."
    , 'travel.co2.label': '' // TODO: translate "CO₂"
    , 'travel.window': '' // TODO: translate "Window"
    , 'travel.flex_window': '' // TODO: translate "Flex window"
    , 'travel.flex_hint': '' // TODO: translate "We"
    , 'travel.one_way': '' // TODO: translate "One-way"
    , 'travel.nonstop': '' // TODO: translate "Nonstop"
    , 'travel.pin': '' // TODO: translate "Pin"
    , 'travel.unpin': '' // TODO: translate "Unpin"
    , 'travel.compare.title': '' // TODO: translate "Compare pinned"
    , 'travel.compare.show': '' // TODO: translate "Compare"
    , 'travel.compare.hide': '' // TODO: translate "Hide"
    , 'travel.compare.add_to_trip': '' // TODO: translate "Add to trip"
    , 'travel.trip.added': '' // TODO: translate "Added to trip"
    , 'travel.trip.create_drop': '' // TODO: translate "Drop here to create new trip"
    , 'travel.related_show': '' // TODO: translate "Related show"
    , 'travel.multicity.toggle': '' // TODO: translate "Multicity"
    , 'travel.multicity': '' // TODO: translate "Multi-city"
    , 'travel.multicity.add_leg': '' // TODO: translate "Add leg"
    , 'travel.multicity.remove': '' // TODO: translate "Remove"
    , 'travel.multicity.move_up': '' // TODO: translate "Move up"
    , 'travel.multicity.move_down': '' // TODO: translate "Move down"
    , 'travel.multicity.open': '' // TODO: translate "Open route in Google Flights"
    , 'travel.multicity.hint': '' // TODO: translate "Add at least two legs to build a route"
    , 'travel.trips': '' // TODO: translate "Trips"
    , 'travel.trip.new': '' // TODO: translate "New Trip"
    , 'travel.trip.to': '' // TODO: translate "Trip to"
    , 'travel.segments': '' // TODO: translate "Segments"
    , 'common.actions': '' // TODO: translate "Actions"
    , 'travel.timeline.title': '' // TODO: translate "Travel Timeline"
    , 'travel.timeline.free_day': '' // TODO: translate "Free day"
    , 'travel.hub.title': '' // TODO: translate "Search"
    , 'travel.hub.needs_planning': '' // TODO: translate "Suggestions"
    , 'travel.hub.upcoming': '' // TODO: translate "Upcoming"
    , 'travel.hub.open_multicity': '' // TODO: translate "Open multicity"
    , 'travel.hub.plan_trip_cta': '' // TODO: translate "Plan Trip"
    , 'travel.error.same_route': '' // TODO: translate "Origin and destination are the same"
    , 'travel.error.return_before_depart': '' // TODO: translate "Return is before departure"
    , 'travel.segment.type': '' // TODO: translate "Type"
    , 'travel.segment.flight': '' // TODO: translate "Flight"
    , 'travel.segment.hotel': '' // TODO: translate "Hotel"
    , 'travel.segment.ground': '' // TODO: translate "Ground"
    , 'copy.manual.title': '' // TODO: translate "Manual copy"
    , 'copy.manual.desc': '' // TODO: translate "Copy the text below if clipboard is blocked."
    , 'common.noResults': '' // TODO: translate "No results"
    , 'tripDetail.currency': '' // TODO: translate "Currency"
    , 'cost.category.flight': '' // TODO: translate "Flight"
    , 'cost.category.hotel': '' // TODO: translate "Hotel"
    , 'cost.category.ground': '' // TODO: translate "Ground"
    , 'cost.category.taxes': '' // TODO: translate "Taxes"
    , 'cost.category.fees': '' // TODO: translate "Fees"
    , 'cost.category.other': '' // TODO: translate "Other"
    , 'travel.workspace.placeholder': '' // TODO: translate "Select a trip to see details or perform a search."
    , 'travel.open_in_provider': '' // TODO: translate "Open in provider"
    , 'common.loading': '' // TODO: translate "Loading…"
    , 'common.results': '' // TODO: translate "results"
    , 'travel.no_trips_yet': '' // TODO: translate "No trips planned yet. Use the search to get started!"
    , 'travel.provider': '' // TODO: translate "Provider"
    , 'provider.mock': '' // TODO: translate "In-app (mock)"
    , 'provider.google': '' // TODO: translate "Google Flights"
    , 'travel.alert.checkin': '' // TODO: translate "Check-in opens in %s"
    , 'travel.alert.priceDrop': '' // TODO: translate "Price dropped by %s"
    , 'travel.workspace.open': '' // TODO: translate "Open Travel Workspace"
    , 'travel.workspace.timeline': '' // TODO: translate "Timeline view"
    , 'travel.workspace.trip_builder.beta': '' // TODO: translate "Trip Builder (beta)"
    , 'common.list': '' // TODO: translate "List"
    , 'common.clear': '' // TODO: translate "Clear"
    , 'common.reset': '' // TODO: translate "Reset"
    , 'calendar.timeline': '' // TODO: translate "Week"
    , 'common.moved': '' // TODO: translate "Moved"
    , 'travel.drop.hint': '' // TODO: translate "Drag to another day"
    , 'travel.search.summary': '' // TODO: translate "Search summary"
    , 'travel.search.route': '' // TODO: translate "{from} → {to}"
    , 'travel.search.paxCabin': '' // TODO: translate "{pax} pax · {cabin}"
    , 'travel.results.countForDate': '' // TODO: translate "{count} results for {date}"
    , 'travel.compare.bestPrice': '' // TODO: translate "Best price"
    , 'travel.compare.bestTime': '' // TODO: translate "Fastest"
    , 'travel.compare.bestBalance': '' // TODO: translate "Best balance"
    , 'travel.co2.estimate': '' // TODO: translate "~{kg} kg CO₂ (est.)"
    , 'travel.mobile.sticky.results': '' // TODO: translate "Results"
    , 'travel.mobile.sticky.compare': '' // TODO: translate "Compare"
    , 'travel.tooltips.flex': '' // TODO: translate "Explore ± days around the selected date"
    , 'travel.tooltips.nonstop': '' // TODO: translate "Only show flights without stops"
    , 'travel.tooltips.cabin': '' // TODO: translate "Seat class preference"
    , 'travel.move.prev': '' // TODO: translate "Move to previous day"
    , 'travel.move.next': '' // TODO: translate "Move to next day"
    , 'travel.rest.short': '' // TODO: translate "Short rest before next show"
    , 'travel.rest.same_day': '' // TODO: translate "Same-day show risk"
    , 'calendar.title': '' // TODO: translate "Calendar"
    , 'calendar.prev': '' // TODO: translate "Previous month"
    , 'calendar.next': '' // TODO: translate "Next month"
    , 'calendar.today': '' // TODO: translate "Today"
    , 'calendar.goto': '' // TODO: translate "Go to date"
    , 'calendar.more': '' // TODO: translate "more"
    , 'calendar.more.title': '' // TODO: translate "More events"
    , 'calendar.more.openDay': '' // TODO: translate "Open day"
    , 'calendar.more.openFullDay': '' // TODO: translate "Open full day"
    , 'calendar.announce.moved': '' // TODO: translate "Moved show to {d}"
    , 'calendar.announce.copied': '' // TODO: translate "Duplicated show to {d}"
    , 'calendar.quickAdd.hint': '' // TODO: translate "Enter to add • Esc to cancel"
    , 'calendar.quickAdd.advanced': '' // TODO: translate "Advanced"
    , 'calendar.quickAdd.simple': '' // TODO: translate "Simple"
    , 'calendar.quickAdd.placeholder': '' // TODO: translate "City CC Fee (optional)… e.g., Madrid ES 12000"
    , 'calendar.quickAdd.recent': '' // TODO: translate "Recent"
    , 'calendar.quickAdd.parseError': '' // TODO: translate "Can"
    , 'calendar.quickAdd.countryMissing': '' // TODO: translate "Add 2-letter country code"
    , 'calendar.goto.hint': '' // TODO: translate "Enter to go • Esc to close"
    , 'calendar.view.switch': '' // TODO: translate "Change calendar view"
    , 'calendar.view.month': '' // TODO: translate "Month"
    , 'calendar.view.week': '' // TODO: translate "Week"
    , 'calendar.view.day': '' // TODO: translate "Day"
    , 'calendar.view.agenda': '' // TODO: translate "Agenda"
    , 'calendar.view.announce': '' // TODO: translate "{v} view"
    , 'calendar.timezone': '' // TODO: translate "Time zone"
    , 'calendar.tz.local': '' // TODO: translate "Local"
    , 'calendar.tz.localLabel': '' // TODO: translate "Local"
    , 'calendar.tz.changed': '' // TODO: translate "Time zone set to {tz}"
    , 'calendar.goto.shortcut': '' // TODO: translate "⌘/Ctrl + G"
    , 'calendar.shortcut.pgUp': '' // TODO: translate "PgUp / Alt+←"
    , 'calendar.shortcut.pgDn': '' // TODO: translate "PgDn / Alt+→"
    , 'calendar.shortcut.today': '' // TODO: translate "T"
    , 'common.move': '' // TODO: translate "Move"
    , 'common.copy': '' // TODO: translate "Copy"
    , 'calendar.more.filter': '' // TODO: translate "Filter events"
    , 'calendar.more.empty': '' // TODO: translate "No results"
    , 'calendar.kb.hint': '' // TODO: translate "Keyboard: Arrow keys move day, PageUp/PageDown change month, T go to today, Enter or Space select day."
    , 'calendar.day.select': '' // TODO: translate "Selected {d}"
    , 'calendar.day.focus': '' // TODO: translate "Focused {d}"
    , 'calendar.noEvents': '' // TODO: translate "No events for this day"
    , 'calendar.show.shows': '' // TODO: translate "Shows"
    , 'calendar.show.travel': '' // TODO: translate "Travel"
    , 'calendar.kind': '' // TODO: translate "Kind"
    , 'calendar.kind.show': '' // TODO: translate "Show"
    , 'calendar.kind.travel': '' // TODO: translate "Travel"
    , 'calendar.status': '' // TODO: translate "Status"
    , 'calendar.dnd.enter': '' // TODO: translate "Drop here to place event on {d}"
    , 'calendar.dnd.leave': '' // TODO: translate "Leaving drop target"
    , 'calendar.kbdDnD.marked': '' // TODO: translate "Marked {d} as origin. Use Enter on target day to drop. Hold Ctrl/Cmd to copy."
    , 'calendar.kbdDnD.cancel': '' // TODO: translate "Cancelled move/copy mode"
    , 'calendar.kbdDnD.origin': '' // TODO: translate "Origin (keyboard move/copy active)"
    , 'calendar.kbdDnD.none': '' // TODO: translate "No show to move from selected origin"
    , 'calendar.weekStart': '' // TODO: translate "Week starts on"
    , 'calendar.weekStart.mon': '' // TODO: translate "Mon"
    , 'calendar.weekStart.sun': '' // TODO: translate "Sun"
    , 'calendar.import': '' // TODO: translate "Import"
    , 'calendar.import.ics': '' // TODO: translate "Import .ics"
    , 'calendar.import.done': '' // TODO: translate "Imported {n} events"
    , 'calendar.import.error': '' // TODO: translate "Failed to import .ics"
    , 'calendar.wd.mon': '' // TODO: translate "Mon"
    , 'calendar.wd.tue': '' // TODO: translate "Tue"
    , 'calendar.wd.wed': '' // TODO: translate "Wed"
    , 'calendar.wd.thu': '' // TODO: translate "Thu"
    , 'calendar.wd.fri': '' // TODO: translate "Fri"
    , 'calendar.wd.sat': '' // TODO: translate "Sat"
    , 'calendar.wd.sun': '' // TODO: translate "Sun"
    , 'shows.costs.type': '' // TODO: translate "Type"
    , 'shows.costs.placeholder': '' // TODO: translate "Travel / Production / Marketing"
    , 'shows.costs.amount': '' // TODO: translate "Amount"
    , 'shows.costs.desc': '' // TODO: translate "Description"
    , 'common.optional': '' // TODO: translate "Optional"
    , 'common.add': '' // TODO: translate "Add"
    , 'common.income': '' // TODO: translate "Income"
    , 'common.wht': '' // TODO: translate "WHT"
    , 'common.commissions': '' // TODO: translate "Commissions"
    , 'common.net': '' // TODO: translate "Net"
    , 'common.costs': '' // TODO: translate "Costs"
    , 'common.total': '' // TODO: translate "Total"
    , 'shows.promote': '' // TODO: translate "Promote"
    , 'shows.editor.status.promote': '' // TODO: translate "Promoted to"
    , 'shows.margin.tooltip': '' // TODO: translate "Net divided by Fee (%)"
    , 'shows.empty': '' // TODO: translate "No shows match your filters"
    , 'shows.empty.add': '' // TODO: translate "Add your first show"
    , 'shows.export.csv.success': '' // TODO: translate "CSV exported ✓"
    , 'shows.export.xlsx.success': '' // TODO: translate "XLSX exported ✓"
    , 'shows.sort.tooltip': '' // TODO: translate "Sort by column"
    , 'shows.filters.statusGroup': '' // TODO: translate "Status filters"
    , 'shows.relative.inDays': '' // TODO: translate "In {n} days"
    , 'shows.relative.daysAgo': '' // TODO: translate "{n} days ago"
    , 'shows.relative.yesterday': '' // TODO: translate "Yesterday"
    , 'shows.row.menu': '' // TODO: translate "Row actions"
    , 'shows.action.edit': '' // TODO: translate "Edit"
    , 'shows.action.promote': '' // TODO: translate "Promote"
    , 'shows.action.duplicate': '' // TODO: translate "Duplicate"
    , 'shows.action.archive': '' // TODO: translate "Archive"
    , 'shows.action.delete': '' // TODO: translate "Delete"
    , 'shows.action.restore': '' // TODO: translate "Restore"
    , 'shows.board.header.net': '' // TODO: translate "Net"
    , 'shows.board.header.count': '' // TODO: translate "Shows"
    , 'shows.datePreset.thisMonth': '' // TODO: translate "This Month"
    , 'shows.datePreset.nextMonth': '' // TODO: translate "Next Month"
    , 'shows.columns.config': '' // TODO: translate "Columns"
    , 'shows.columns.wht': '' // TODO: translate "WHT %"
    , 'shows.totals.pin': '' // TODO: translate "Pin totals"
    , 'shows.totals.unpin': '' // TODO: translate "Unpin totals"
    , 'shows.totals.avgFee': '' // TODO: translate "Avg Fee"
    , 'shows.totals.avgFee.tooltip': '' // TODO: translate "Average fee per show"
    , 'shows.totals.avgMargin': '' // TODO: translate "Avg Margin %"
    , 'shows.totals.avgMargin.tooltip': '' // TODO: translate "Average margin % across shows with fee"
    , 'shows.wht.hide': '' // TODO: translate "Hide WHT column"
    , 'shows.sort.aria.sortedDesc': '' // TODO: translate "Sorted descending"
    , 'shows.sort.aria.sortedAsc': '' // TODO: translate "Sorted ascending"
    , 'shows.sort.aria.notSorted': '' // TODO: translate "Not sorted"
    , 'shows.sort.aria.activateDesc': '' // TODO: translate "Activate to sort descending"
    , 'shows.sort.aria.activateAsc': '' // TODO: translate "Activate to sort ascending"
    , 'nav.overview': '' // TODO: translate "Overview"
    , 'nav.clients': '' // TODO: translate "Clients"
    , 'nav.teams': '' // TODO: translate "Teams"
    , 'nav.links': '' // TODO: translate "Links"
    , 'nav.reports': '' // TODO: translate "Reports"
    , 'nav.documents': '' // TODO: translate "Documents"
    , 'nav.integrations': '' // TODO: translate "Integrations"
    , 'nav.billing': '' // TODO: translate "Billing"
    , 'nav.branding': '' // TODO: translate "Branding"
    , 'nav.connections': '' // TODO: translate "Connections"
    , 'org.overview.title': '' // TODO: translate "Organization Overview"
    , 'org.overview.subtitle.agency': '' // TODO: translate "KPIs by client, tasks, and active links"
    , 'org.overview.subtitle.artist': '' // TODO: translate "Upcoming shows and travel, monthly KPIs"
    , 'org.members.title': '' // TODO: translate "Members"
    , 'members.invite': '' // TODO: translate "Invite"
    , 'members.seats.usage': '' // TODO: translate "Seat usage: 5/5 internal, 0/5 guests"
    , 'org.clients.title': '' // TODO: translate "Clients"
    , 'org.teams.title': '' // TODO: translate "Teams"
    , 'org.links.title': '' // TODO: translate "Links"
    , 'org.branding.title': '' // TODO: translate "Branding"
    , 'org.documents.title': '' // TODO: translate "Documents"
    , 'org.reports.title': '' // TODO: translate "Reports"
    , 'org.integrations.title': '' // TODO: translate "Integrations"
    , 'org.billing.title': '' // TODO: translate "Billing"
    , 'labels.seats.used': '' // TODO: translate "Seats used"
    , 'labels.seats.guests': '' // TODO: translate "Guests"
    , 'export.options': '' // TODO: translate "Export options"
    , 'export.columns': '' // TODO: translate "Columns"
    , 'export.csv': '' // TODO: translate "CSV"
    , 'export.xlsx': '' // TODO: translate "XLSX"
    , 'common.exporting': '' // TODO: translate "Exporting…"
    , 'charts.viewTable': '' // TODO: translate "View data as table"
    , 'charts.hideTable': '' // TODO: translate "Hide table"
    , 'finance.period.mtd': '' // TODO: translate "MTD"
    , 'finance.period.lastMonth': '' // TODO: translate "Last month"
    , 'finance.period.ytd': '' // TODO: translate "YTD"
    , 'finance.period.custom': '' // TODO: translate "Custom"
    , 'finance.period.closed': '' // TODO: translate "Closed"
    , 'finance.period.open': '' // TODO: translate "Open"
    , 'finance.closeMonth': '' // TODO: translate "Close Month"
    , 'finance.reopenMonth': '' // TODO: translate "Reopen Month"
    , 'finance.closed.help': '' // TODO: translate "Month is closed. Reopen to make changes."
    , 'finance.kpi.mtdNet': '' // TODO: translate "MTD Net"
    , 'finance.kpi.ytdNet': '' // TODO: translate "YTD Net"
    , 'finance.kpi.forecastEom': '' // TODO: translate "Forecast EOM"
    , 'finance.kpi.deltaTarget': '' // TODO: translate "Δ vs Target"
    , 'finance.kpi.gm': '' // TODO: translate "GM%"
    , 'finance.kpi.dso': '' // TODO: translate "DSO"
    , 'finance.comparePrev': '' // TODO: translate "Compare vs previous"
    , 'finance.export.csv.success': '' // TODO: translate "CSV exported ✓"
    , 'finance.export.xlsx.success': '' // TODO: translate "XLSX exported ✓"
    , 'finance.v2.footer': '' // TODO: translate "AR top debtors and row actions coming next."
    , 'finance.pl.caption': '' // TODO: translate "Profit and Loss ledger. Use column headers to sort. Virtualized list shows a subset of rows."
    , 'common.rowsVisible': '' // TODO: translate "Rows visible"
    , 'finance.whtPct': '' // TODO: translate "WHT %"
    , 'finance.wht': '' // TODO: translate "WHT"
    , 'finance.mgmtPct': '' // TODO: translate "Mgmt %"
    , 'finance.bookingPct': '' // TODO: translate "Booking %"
    , 'finance.breakdown.by': '' // TODO: translate "Breakdown by"
    , 'finance.breakdown.empty': '' // TODO: translate "No breakdown available"
    , 'finance.delta': '' // TODO: translate "Δ"
    , 'finance.deltaVsPrev': '' // TODO: translate "Δ vs prev"
    , 'common.comingSoon': '' // TODO: translate "Coming soon"
    , 'finance.expected': '' // TODO: translate "Expected (stage-weighted)"
    , 'finance.ar.title': '' // TODO: translate "AR aging & top debtors"
    , 'common.moreActions': '' // TODO: translate "More actions"
    , 'actions.copyRow': '' // TODO: translate "Copy row"
    , 'actions.exportRowCsv': '' // TODO: translate "Export row (CSV)"
    , 'actions.goToShow': '' // TODO: translate "Go to show"
    , 'actions.openCosts': '' // TODO: translate "Open costs"
    , 'shows.table.route': '' // TODO: translate "Route"
    , 'finance.targets.title': '' // TODO: translate "Targets"
    , 'finance.targets.revenue': '' // TODO: translate "Revenue target"
    , 'finance.targets.net': '' // TODO: translate "Net target"
    , 'finance.targets.hint': '' // TODO: translate "Targets are local to this device for now."
    , 'finance.targets.noNegative': '' // TODO: translate "Targets cannot be negative"
    , 'filters.title': '' // TODO: translate "Filters"
    , 'filters.region': '' // TODO: translate "Region"
    , 'filters.from': '' // TODO: translate "From"
    , 'filters.to': '' // TODO: translate "To"
    , 'filters.currency': '' // TODO: translate "Currency"
    , 'filters.presentation': '' // TODO: translate "Presentation mode"
    , 'filters.shortcutHint': '' // TODO: translate "Ctrl/Cmd+K – open filters"
    , 'filters.appliedRange': '' // TODO: translate "Applied range"
    , 'layout.team': '' // TODO: translate "Team"
    , 'layout.highContrast': '' // TODO: translate "High Contrast"
    , 'layout.tenant': '' // TODO: translate "Tenant"
    , 'access.readOnly': '' // TODO: translate "read-only"
    , 'layout.viewingAs': '' // TODO: translate "Viewing as"
    , 'layout.viewAsExit': '' // TODO: translate "Exit"
    , 'access.readOnly.tooltip': '' // TODO: translate "Finance exports disabled for agency demo"
    , 'lab.drag': '' // TODO: translate "Drag"
    , 'lab.moveUp': '' // TODO: translate "Move up"
    , 'lab.moveDown': '' // TODO: translate "Move down"
    , 'lab.reset': '' // TODO: translate "Reset to template"
    , 'lab.back': '' // TODO: translate "Back to Dashboard"
    , 'lab.layoutName': '' // TODO: translate "Layout name"
    , 'lab.save': '' // TODO: translate "Save layout"
    , 'lab.apply': '' // TODO: translate "Apply…"
    , 'lab.delete': '' // TODO: translate "Delete…"
    , 'lab.export': '' // TODO: translate "Export"
    , 'lab.import': '' // TODO: translate "Import"
    , 'lab.dropHere': '' // TODO: translate "Drop widgets here"
    , 'lab.header': '' // TODO: translate "Mission Control Lab"
    , 'lab.subheader': '' // TODO: translate "Drag, reorder, and resize dashboard widgets. Experimental."
    , 'lab.template': '' // TODO: translate "Template"
    , 'lab.resetToTemplate': '' // TODO: translate "Reset to template"
    , 'lab.backToDashboard': '' // TODO: translate "Back to Dashboard"
    , 'lab.applySaved': '' // TODO: translate "Apply…"
    , 'lab.deleteSaved': '' // TODO: translate "Delete…"
    , 'dashboard.title': '' // TODO: translate "Tour Command Center"
    , 'dashboard.subtitle': '' // TODO: translate "Monitor your tour performance, mission status, and take action on what matters most"
    , 'dashboard.map.title': '' // TODO: translate "Tour Map"
    , 'dashboard.activity.title': '' // TODO: translate "Recent Activity"
    , 'dashboard.actions.title': '' // TODO: translate "Quick Actions"
    , 'dashboard.actions.newShow': '' // TODO: translate "Add New Show"
    , 'dashboard.actions.quickFinance': '' // TODO: translate "Quick Finance Check"
    , 'dashboard.actions.travelBooking': '' // TODO: translate "Book Travel"
    , 'dashboard.areas.finance.title': '' // TODO: translate "Finance"
    , 'dashboard.areas.finance.description': '' // TODO: translate "Track revenue, costs, and profitability"
    , 'dashboard.areas.shows.title': '' // TODO: translate "Shows & Events"
    , 'dashboard.areas.shows.description': '' // TODO: translate "Manage performances and venues"
    , 'dashboard.areas.travel.title': '' // TODO: translate "Travel & Logistics"
    , 'dashboard.areas.travel.description': '' // TODO: translate "Plan and track travel arrangements"
    , 'dashboard.areas.missionControl.title': '' // TODO: translate "Mission Control Lab"
    , 'dashboard.areas.missionControl.description': '' // TODO: translate "Advanced mission control with customizable widgets"
    , 'dashboard.kpi.financialHealth': '' // TODO: translate "Financial Health"
    , 'dashboard.kpi.nextEvent': '' // TODO: translate "Next Critical Event"
    , 'dashboard.kpi.ticketSales': '' // TODO: translate "Ticket Sales"
    , 'actions.toast.export': '' // TODO: translate "Export copied"
    , 'actions.import.prompt': '' // TODO: translate "Paste Lab layouts JSON"
    , 'actions.toast.imported': '' // TODO: translate "Imported"
    , 'actions.toast.import_invalid': '' // TODO: translate "Invalid JSON"
    , 'actions.newArtist': '' // TODO: translate "New artist"
    , 'actions.connectExisting': '' // TODO: translate "Connect existing"
    , 'actions.editScopes': '' // TODO: translate "Edit scopes"
    , 'actions.revoke': '' // TODO: translate "Revoke"
    , 'actions.exportPdf': '' // TODO: translate "Export PDF"
    , 'branding.uploadLogo': '' // TODO: translate "Upload logo"
    , 'branding.editColors': '' // TODO: translate "Edit colors"
    , 'common.upload': '' // TODO: translate "Upload"
    , 'common.newFolder': '' // TODO: translate "New folder"
    , 'live.up': '' // TODO: translate "up"
    , 'live.down': '' // TODO: translate "down"
    , 'live.flat': '' // TODO: translate "flat"
    , 'nav.profile': '' // TODO: translate "Profile"
    , 'nav.changeOrg': '' // TODO: translate "Change organization"
    , 'nav.logout': '' // TODO: translate "Logout"
    , 'profile.title': '' // TODO: translate "Profile"
    , 'profile.personal': '' // TODO: translate "Personal"
    , 'profile.security': '' // TODO: translate "Security"
    , 'profile.notifications': '' // TODO: translate "Notifications"
    , 'profile.save': '' // TODO: translate "Save"
    , 'profile.saved': '' // TODO: translate "Saved ✓"
    , 'profile.avatarUrl': '' // TODO: translate "Avatar URL"
    , 'profile.bio': '' // TODO: translate "Bio"
    , 'profile.notify.email': '' // TODO: translate "Email updates"
    , 'profile.notify.slack': '' // TODO: translate "Slack notifications"
    , 'profile.notify.hint': '' // TODO: translate "These preferences affect demo notifications only"
    , 'profile.memberships': '' // TODO: translate "Memberships"
    , 'profile.defaultOrg': '' // TODO: translate "Default organization"
    , 'profile.setDefault': '' // TODO: translate "Set default"
    , 'profile.dataPrivacy': '' // TODO: translate "Data & privacy"
    , 'profile.exportData': '' // TODO: translate "Export my demo data"
    , 'profile.clearData': '' // TODO: translate "Clear and reseed demo data"
    , 'profile.export.ready': '' // TODO: translate "Data export ready"
    , 'profile.error.name': '' // TODO: translate "Name is required"
    , 'profile.error.email': '' // TODO: translate "Email is required"
    , 'prefs.title': '' // TODO: translate "Preferences"
    , 'prefs.appearance': '' // TODO: translate "Appearance"
    , 'prefs.language': '' // TODO: translate "Language"
    , 'prefs.theme': '' // TODO: translate "Theme"
    , 'prefs.highContrast': '' // TODO: translate "High contrast"
    , 'prefs.finance.currency': '' // TODO: translate "Currency"
    , 'prefs.units': '' // TODO: translate "Distance units"
    , 'prefs.presentation': '' // TODO: translate "Presentation mode"
    , 'prefs.comparePrev': '' // TODO: translate "Compare vs previous"
    , 'prefs.defaultRegion': '' // TODO: translate "Default region"
    , 'prefs.defaultStatuses': '' // TODO: translate "Default statuses"
    , 'prefs.help.language': '' // TODO: translate "Affects labels and date/number formatting."
    , 'prefs.help.theme': '' // TODO: translate "Choose light or dark based on your environment."
    , 'prefs.help.highContrast': '' // TODO: translate "Improves contrast and focus rings for readability."
    , 'prefs.help.currency': '' // TODO: translate "Sets default currency for dashboards and exports."
    , 'prefs.help.units': '' // TODO: translate "Used for travel distances and map overlays."
    , 'prefs.help.presentation': '' // TODO: translate "Larger text, simplified animations for demos."
    , 'prefs.help.comparePrev': '' // TODO: translate "Shows deltas against the previous period."
    , 'prefs.help.region': '' // TODO: translate "Preselects region filters in dashboards."
    , 'subnav.ariaLabel': '' // TODO: translate "Sections"
    , 'breadcrumb.home': '' // TODO: translate "Home"
    , 'home.seo.title': '' // TODO: translate "On Tour App - Tour Management & Finance Dashboard"
    , 'home.seo.description': '' // TODO: translate "Professional tour management platform with real-time finance tracking, venue booking, and performance analytics for artists and managers."
    , 'home.seo.keywords': '' // TODO: translate "tour management, concert booking, artist finance, venue management, performance analytics, live music"
    , 'comparison.title': '' // TODO: translate "From Spreadsheet Chaos to App Clarity"
    , 'comparison.subtitle': '' // TODO: translate "See how your tour management evolves from fragmented Excel files to a unified, intelligent platform."
    , 'comparison.excel.title': '' // TODO: translate "Excel Chaos"
    , 'comparison.excel.problem1': '' // TODO: translate "Scattered files across devices and emails"
    , 'comparison.excel.problem2': '' // TODO: translate "Manual calculations prone to errors"
    , 'comparison.excel.problem3': '' // TODO: translate "No real-time collaboration or notifications"
    , 'comparison.excel.problem4': '' // TODO: translate "Lost context in endless tabs and comments"
    , 'comparison.app.title': '' // TODO: translate "App Clarity"
    , 'comparison.app.benefit1': '' // TODO: translate "Unified dashboard with live data sync"
    , 'comparison.app.benefit2': '' // TODO: translate "Automated calculations and error detection"
    , 'comparison.app.benefit3': '' // TODO: translate "Real-time collaboration and smart notifications"
    , 'comparison.app.benefit4': '' // TODO: translate "Context-aware insights and predictive alerts"
    , 'comparison.benefit1.title': '' // TODO: translate "Smart Finance Tracking"
    , 'comparison.benefit1.desc': '' // TODO: translate "Automatic profit calculations, cost analysis, and budget alerts."
    , 'comparison.benefit2.title': '' // TODO: translate "Live Tour Mapping"
    , 'comparison.benefit2.desc': '' // TODO: translate "Interactive maps with route optimization and venue intelligence."
    , 'comparison.benefit3.title': '' // TODO: translate "Instant Insights"
    , 'comparison.benefit3.desc': '' // TODO: translate "AI-powered recommendations and risk detection in real-time."
    , 'metamorphosis.title': '' // TODO: translate "From scattered noise to a living control panel"
    , 'metamorphosis.subtitle': '' // TODO: translate "Instead of spreadsheets mutating chaotically and critical context buried in comments, every data point flows into a single orchestrated surface. The system reconciles, validates, and highlights what matters."
    , 'dashboard.offerConfirmed': '' // TODO: translate "Offer → Confirmed"
    , 'dashboard.tourHealthScore': '' // TODO: translate "Tour Health Score"
    , 'dashboard.healthFactors': '' // TODO: translate "Health Factors"
    , 'dashboard.keyInsights': '' // TODO: translate "Key Insights"
    , 'dashboard.confidence': '' // TODO: translate "Confidence"
    , 'dashboard.current': '' // TODO: translate "Current"
    , 'dashboard.predicted': '' // TODO: translate "Predicted"
    , 'dashboard.expectedChange': '' // TODO: translate "Expected change"
    , 'dashboard.scheduleGap': '' // TODO: translate "Schedule gap"
    , 'dashboard.allSystemsReady': '' // TODO: translate "All systems ready"
    , 'dashboard.loadingMap': '' // TODO: translate "Loading map…"
    , 'placeholder.username': '' // TODO: translate "you@example.com or username"
    , 'placeholder.bio': '' // TODO: translate "Tell us a bit about yourself and what you do..."
    , 'placeholder.cityName': '' // TODO: translate "Enter city name..."
    , 'placeholder.notes': '' // TODO: translate "Add any additional notes..."
    , 'placeholder.searchCommand': '' // TODO: translate "Search shows, navigate, or type a command..."
    , 'placeholder.expenseDescription': '' // TODO: translate "e.g., Flight tickets, Hotel booking..."
    , 'placeholder.expenseDetails': '' // TODO: translate "Add any additional details, invoice numbers, or context..."
    , 'placeholder.origin': '' // TODO: translate "Origin (e.g., BCN)"
    , 'placeholder.destination': '' // TODO: translate "Destination (e.g., AMS)"
    , 'placeholder.bookingRef': '' // TODO: translate "Booking reference or flight number"
    , 'placeholder.airport': '' // TODO: translate "City or airport..."
```

### Detailed Translation Table

| Key | English Original | Your Translation |
|-----|------------------|------------------|
| `scopes.tooltip.shows` | Shows access granted by link | _[translate here]_ |
| `scopes.tooltip.travel` | Travel access granted by link | _[translate here]_ |
| `scopes.tooltip.finance` | Finance: read-only per link policy | _[translate here]_ |
| `kpi.shows` | Shows | _[translate here]_ |
| `kpi.net` | Net | _[translate here]_ |
| `kpi.travel` | Travel | _[translate here]_ |
| `cmd.go.profile` | Go to profile | _[translate here]_ |
| `cmd.go.preferences` | Go to preferences | _[translate here]_ |
| `common.copyLink` | Copy link | _[translate here]_ |
| `common.learnMore` | Learn more | _[translate here]_ |
| `insights.thisMonthTotal` | This Month Total | _[translate here]_ |
| `insights.statusBreakdown` | Status breakdown | _[translate here]_ |
| `insights.upcoming14d` | Upcoming 14d | _[translate here]_ |
| `common.openShow` | Open show | _[translate here]_ |
| `common.centerMap` | Center map | _[translate here]_ |
| `common.dismiss` | Dismiss | _[translate here]_ |
| `common.snooze7` | Snooze 7 days | _[translate here]_ |
| `common.snooze30` | Snooze 30 days | _[translate here]_ |
| `common.on` | on | _[translate here]_ |
| `common.off` | off | _[translate here]_ |
| `common.hide` | Hide | _[translate here]_ |
| `common.pin` | Pin | _[translate here]_ |
| `common.unpin` | Unpin | _[translate here]_ |
| `common.map` | Map | _[translate here]_ |
| `layout.invite` | Invite | _[translate here]_ |
| `layout.build` | Build: preview | _[translate here]_ |
| `layout.demo` | Status: demo feed | _[translate here]_ |
| `alerts.title` | Alert Center | _[translate here]_ |
| `alerts.anySeverity` | Any severity | _[translate here]_ |
| `alerts.anyRegion` | Any region | _[translate here]_ |
| `alerts.anyTeam` | Any team | _[translate here]_ |
| `alerts.copySlack` | Copy Slack | _[translate here]_ |
| `alerts.copied` | Copied \u2713 | _[translate here]_ |
| `alerts.noAlerts` | No alerts | _[translate here]_ |
| `map.openInDashboard` | Open in dashboard | _[translate here]_ |
| `auth.login` | Login | _[translate here]_ |
| `auth.chooseUser` | Choose a demo user | _[translate here]_ |
| `auth.enterAs` | Enter as {name} | _[translate here]_ |
| `auth.role.owner` | Artist (Owner) | _[translate here]_ |
| `auth.role.agencyManager` | Agency Manager | _[translate here]_ |
| `auth.role.artistManager` | Artist Team (Manager) | _[translate here]_ |
| `auth.scope.finance.ro` | Finance: read-only | _[translate here]_ |
| `auth.scope.edit.showsTravel` | Edit shows/travel | _[translate here]_ |
| `auth.scope.full` | Full access | _[translate here]_ |
| `login.title` | Welcome to On Tour | _[translate here]_ |
| `login.subtitle` | Your tour management command center | _[translate here]_ |
| `login.enterAs` | Enter as {name} | _[translate here]_ |
| `login.quick.agency` | Enter as Shalizi (agency) | _[translate here]_ |
| `login.quick.artist` | Enter as Danny (artist) | _[translate here]_ |
| `login.remember` | Remember me | _[translate here]_ |
| `login.usernameOrEmail` | Username or Email | _[translate here]_ |
| `role.agencyManager` | Agency Manager | _[translate here]_ |
| `role.artistOwner` | Artist (Owner) | _[translate here]_ |
| `role.artistManager` | Artist Team (Manager) | _[translate here]_ |
| `scope.shows.write` | shows: write | _[translate here]_ |
| `scope.shows.read` | shows: read | _[translate here]_ |
| `scope.travel.book` | travel: book | _[translate here]_ |
| `scope.travel.read` | travel: read | _[translate here]_ |
| `scope.finance.read` | finance: read | _[translate here]_ |
| `scope.finance.none` | finance: none | _[translate here]_ |
| `hero.enter` | Enter | _[translate here]_ |
| `marketing.nav.features` | Features | _[translate here]_ |
| `marketing.nav.product` | Product | _[translate here]_ |
| `marketing.nav.pricing` | Pricing | _[translate here]_ |
| `marketing.nav.testimonials` | Testimonials | _[translate here]_ |
| `marketing.nav.cta` | Get started | _[translate here]_ |
| `marketing.cta.primary` | Start free | _[translate here]_ |
| `marketing.cta.secondary` | Watch demo | _[translate here]_ |
| `marketing.cta.login` | Log in | _[translate here]_ |
| `hero.demo.artist` | View demo as Danny | _[translate here]_ |
| `hero.demo.agency` | View demo as Adam | _[translate here]_ |
| `hero.persona.question` | I am a... | _[translate here]_ |
| `hero.persona.artist` | Artist / Manager | _[translate here]_ |
| `hero.persona.agency` | Agency | _[translate here]_ |
| `hero.subtitle.artist` | Take control of your finances and tour logistics. See your career from a single dashboard. | _[translate here]_ |
| `hero.subtitle.agency` | Manage your entire roster from one place. Give your artists visibility and generate reports in seconds. | _[translate here]_ |
| `home.action.title` | Stop Surviving. Start Commanding. | _[translate here]_ |
| `home.action.subtitle` | See how On Tour App can transform your next tour. | _[translate here]_ |
| `home.action.cta` | Request a Personalized Demo | _[translate here]_ |
| `inside.map.desc.artist` | Visualize your tour route and anticipate travel needs | _[translate here]_ |
| `inside.finance.desc.artist` | Track your earnings, expenses and profitability in real-time | _[translate here]_ |
| `inside.actions.desc.artist` | Stay on top of contracts, payments and upcoming deadlines | _[translate here]_ |
| `inside.map.desc.agency` | Monitor all your artists\ | _[translate here]_ |
| `inside.finance.desc.agency` | Consolidated financial overview across your entire roster | _[translate here]_ |
| `inside.actions.desc.agency` | Centralized task management for team coordination and client updates | _[translate here]_ |
| `inside.title` | What you | _[translate here]_ |
| `shows.summary.avgFee` | Avg Fee | _[translate here]_ |
| `shows.summary.avgMargin` | Avg Margin | _[translate here]_ |
| `inside.map.title` | Map | _[translate here]_ |
| `inside.map.desc` | Live HUD with shows, route and risks | _[translate here]_ |
| `inside.finance.title` | Finance | _[translate here]_ |
| `inside.finance.desc` | Monthly KPIs, pipeline and forecast | _[translate here]_ |
| `inside.actions.title` | Actions | _[translate here]_ |
| `inside.actions.desc` | Action Hub with priorities and shortcuts | _[translate here]_ |
| `how.title` | How it works | _[translate here]_ |
| `how.step.invite` | Invite your team | _[translate here]_ |
| `how.step.connect` | Connect with artists or agencies | _[translate here]_ |
| `how.step.views` | Work by views: HUD, Finance, Shows | _[translate here]_ |
| `how.step.connectData` | Connect your data | _[translate here]_ |
| `how.step.connectData.desc` | Import shows, connect calendar, or get invited by your agency | _[translate here]_ |
| `how.step.visualize` | Visualize your world | _[translate here]_ |
| `how.step.visualize.desc` | Your tour comes alive on the map, finances clarify in the dashboard | _[translate here]_ |
| `how.step.act` | Act with intelligence | _[translate here]_ |
| `how.step.connectData.artist` | Import your shows, connect your calendar, or get invited by your agency. Your tour data in one place. | _[translate here]_ |
| `how.step.connectData.agency` | Invite your artists and connect their data. Centralize all tour information across your roster. | _[translate here]_ |
| `how.step.visualize.artist` | Your tour comes alive on the map, finances clarify in your personal dashboard. See your career at a glance. | _[translate here]_ |
| `how.step.visualize.agency` | Monitor all artists\ | _[translate here]_ |
| `how.step.act.artist` | Receive proactive alerts about contracts, payments, and deadlines. Make data-driven decisions with confidence. | _[translate here]_ |
| `how.step.act.agency` | Prioritize team tasks, generate reports instantly, and keep all stakeholders informed with real-time updates. | _[translate here]_ |
| `how.multiTenant` | Multi-tenant demo: switch between Agency and Artist contexts | _[translate here]_ |
| `trust.privacy` | Privacy: local demo (your browser) | _[translate here]_ |
| `trust.accessibility` | Accessibility: shortcuts “?” | _[translate here]_ |
| `trust.support` | Support | _[translate here]_ |
| `trust.demo` | Local demo — no data uploaded | _[translate here]_ |
| `testimonials.title` | Trusted by Industry Leaders | _[translate here]_ |
| `testimonials.subtitle` | Real stories from the touring industry | _[translate here]_ |
| `testimonials.subtitle.artist` | See how artists are taking control of their careers | _[translate here]_ |
| `testimonials.subtitle.agency` | Discover how agencies are transforming their operations | _[translate here]_ |
| `common.skipToContent` | Skip to content | _[translate here]_ |
| `alerts.slackCopied` | Slack payload copied | _[translate here]_ |
| `alerts.copyManual` | Open window to copy manually | _[translate here]_ |
| `ah.title` | Action Hub | _[translate here]_ |
| `ah.tab.pending` | Pending | _[translate here]_ |
| `ah.tab.shows` | This Month | _[translate here]_ |
| `ah.tab.travel` | Travel | _[translate here]_ |
| `ah.tab.insights` | Insights | _[translate here]_ |
| `ah.filter.all` | All | _[translate here]_ |
| `ah.filter.risk` | Risk | _[translate here]_ |
| `ah.filter.urgency` | Urgency | _[translate here]_ |
| `ah.filter.opportunity` | Opportunity | _[translate here]_ |
| `ah.filter.offer` | Offer | _[translate here]_ |
| `ah.filter.finrisk` | Finrisk | _[translate here]_ |
| `ah.cta.addTravel` | Add travel | _[translate here]_ |
| `ah.cta.followUp` | Follow up | _[translate here]_ |
| `ah.cta.review` | Review | _[translate here]_ |
| `ah.cta.open` | Open | _[translate here]_ |
| `ah.empty` | All caught up! | _[translate here]_ |
| `ah.openTravel` | Open Travel | _[translate here]_ |
| `ah.done` | Done | _[translate here]_ |
| `ah.typeFilter` | Type filter | _[translate here]_ |
| `ah.why` | Why? | _[translate here]_ |
| `ah.why.title` | Why this priority? | _[translate here]_ |
| `ah.why.score` | Score | _[translate here]_ |
| `ah.why.impact` | Impact | _[translate here]_ |
| `ah.why.amount` | Amount | _[translate here]_ |
| `ah.why.inDays` | In | _[translate here]_ |
| `ah.why.overdue` | Overdue | _[translate here]_ |
| `ah.why.kind` | Type | _[translate here]_ |
| `finance.quicklook` | Finance Quicklook | _[translate here]_ |
| `finance.ledger` | Ledger | _[translate here]_ |
| `finance.targets` | Targets | _[translate here]_ |
| `finance.targets.month` | Monthly targets | _[translate here]_ |
| `finance.targets.year` | Yearly targets | _[translate here]_ |
| `finance.pipeline` | Pipeline | _[translate here]_ |
| `finance.pipeline.subtitle` | Expected value (weighted by stage) | _[translate here]_ |
| `finance.openFull` | Open full finance | _[translate here]_ |
| `finance.pivot` | Pivot | _[translate here]_ |
| `finance.pivot.group` | Group | _[translate here]_ |
| `finance.ar.view` | View | _[translate here]_ |
| `finance.ar.remind` | Remind | _[translate here]_ |
| `finance.ar.reminder.queued` | Reminder queued | _[translate here]_ |
| `finance.thisMonth` | This Month | _[translate here]_ |
| `finance.income` | Income | _[translate here]_ |
| `finance.expenses` | Expenses | _[translate here]_ |
| `finance.net` | Net | _[translate here]_ |
| `finance.byStatus` | By status | _[translate here]_ |
| `finance.byMonth` | by month | _[translate here]_ |
| `finance.confirmed` | Confirmed | _[translate here]_ |
| `finance.pending` | Pending | _[translate here]_ |
| `finance.compare` | Compare prev | _[translate here]_ |
| `charts.resetZoom` | Reset zoom | _[translate here]_ |
| `common.current` | Current | _[translate here]_ |
| `common.compare` | Compare | _[translate here]_ |
| `common.reminder` | Reminder | _[translate here]_ |
| `finance.ui.view` | View | _[translate here]_ |
| `finance.ui.classic` | Classic | _[translate here]_ |
| `finance.ui.beta` | New (beta) | _[translate here]_ |
| `finance.offer` | Offer | _[translate here]_ |
| `finance.shows` | shows | _[translate here]_ |
| `finance.noShowsMonth` | No shows this month | _[translate here]_ |
| `finance.hideAmounts` | Hide amounts | _[translate here]_ |
| `finance.hidden` | Hidden | _[translate here]_ |
| `common.open` | Open | _[translate here]_ |
| `common.apply` | Apply | _[translate here]_ |
| `common.saveView` | Save view | _[translate here]_ |
| `common.import` | Import | _[translate here]_ |
| `common.export` | Export | _[translate here]_ |
| `common.copied` | Copied ✓ | _[translate here]_ |
| `common.markDone` | Mark done | _[translate here]_ |
| `common.hideItem` | Hide | _[translate here]_ |
| `views.import.invalidShape` | Invalid views JSON shape | _[translate here]_ |
| `views.import.invalidJson` | Invalid JSON | _[translate here]_ |
| `common.tomorrow` | Tomorrow | _[translate here]_ |
| `common.go` | Go | _[translate here]_ |
| `common.show` | Show | _[translate here]_ |
| `common.search` | Search | _[translate here]_ |
| `hud.next3weeks` | Next 3 weeks | _[translate here]_ |
| `hud.noTrips3weeks` | No upcoming trips in 3 weeks | _[translate here]_ |
| `hud.openShow` | open show | _[translate here]_ |
| `hud.openTrip` | open travel | _[translate here]_ |
| `hud.view.whatsnext` | What | _[translate here]_ |
| `hud.view.month` | This Month | _[translate here]_ |
| `hud.view.financials` | Financials | _[translate here]_ |
| `hud.view.whatsnext.desc` | Upcoming 14 day summary | _[translate here]_ |
| `hud.view.month.desc` | Monthly financial & show snapshot | _[translate here]_ |
| `hud.view.financials.desc` | Financial intelligence breakdown | _[translate here]_ |
| `hud.layer.heat` | Heat | _[translate here]_ |
| `hud.layer.status` | Status | _[translate here]_ |
| `hud.layer.route` | Route | _[translate here]_ |
| `hud.views` | HUD views | _[translate here]_ |
| `hud.layers` | Map layers | _[translate here]_ |
| `hud.missionControl` | Mission Control | _[translate here]_ |
| `hud.subtitle` | Realtime map and upcoming shows | _[translate here]_ |
| `hud.risks` | Risks | _[translate here]_ |
| `hud.assignProducer` | Assign producer | _[translate here]_ |
| `hud.mapLoadError` | Map failed to load. Please retry. | _[translate here]_ |
| `common.retry` | Retry | _[translate here]_ |
| `hud.viewChanged` | View changed to | _[translate here]_ |
| `hud.openEvent` | open event | _[translate here]_ |
| `hud.type.flight` | Flight | _[translate here]_ |
| `hud.type.ground` | Ground | _[translate here]_ |
| `hud.type.event` | Event | _[translate here]_ |
| `hud.fin.avgNetMonth` | Avg Net (Month) | _[translate here]_ |
| `hud.fin.runRateYear` | Run Rate (Year) | _[translate here]_ |
| `finance.forecast` | Forecast vs Actual | _[translate here]_ |
| `finance.forecast.legend.actual` | Actual net | _[translate here]_ |
| `finance.forecast.legend.p50` | Forecast p50 | _[translate here]_ |
| `finance.forecast.legend.band` | Confidence band | _[translate here]_ |
| `finance.forecast.alert.under` | Under forecast by | _[translate here]_ |
| `finance.forecast.alert.above` | Above optimistic by | _[translate here]_ |
| `map.toggle.status` | Toggle status markers | _[translate here]_ |
| `map.toggle.route` | Toggle route line | _[translate here]_ |
| `map.toggle.heat` | Toggle heat circles | _[translate here]_ |
| `shows.exportCsv` | Export CSV | _[translate here]_ |
| `shows.filters.from` | From | _[translate here]_ |
| `shows.filters.to` | To | _[translate here]_ |
| `shows.items` | items | _[translate here]_ |
| `shows.date.presets` | Presets | _[translate here]_ |
| `shows.date.thisMonth` | This Month | _[translate here]_ |
| `shows.date.nextMonth` | Next Month | _[translate here]_ |
| `shows.tooltip.net` | Fee minus WHT, commissions, and costs | _[translate here]_ |
| `shows.tooltip.margin` | Net divided by Fee (%) | _[translate here]_ |
| `shows.table.margin` | Margin % | _[translate here]_ |
| `shows.editor.margin.formula` | Margin % = Net/Fee | _[translate here]_ |
| `shows.tooltip.wht` | Withholding tax percentage applied to the fee | _[translate here]_ |
| `shows.editor.label.name` | Show name | _[translate here]_ |
| `shows.editor.placeholder.name` | Festival or show name | _[translate here]_ |
| `shows.editor.placeholder.venue` | Venue name | _[translate here]_ |
| `shows.editor.help.venue` | Optional venue / room name | _[translate here]_ |
| `shows.editor.help.fee` | Gross fee agreed (before taxes, commissions, costs) | _[translate here]_ |
| `shows.editor.help.wht` | Local withholding tax percentage (auto-suggested by country) | _[translate here]_ |
| `shows.editor.saving` | Saving… | _[translate here]_ |
| `shows.editor.saved` | Saved ✓ | _[translate here]_ |
| `shows.editor.save.error` | Save failed | _[translate here]_ |
| `shows.editor.cost.templates` | Templates | _[translate here]_ |
| `shows.editor.cost.addTemplate` | Add template | _[translate here]_ |
| `shows.editor.cost.subtotals` | Subtotals | _[translate here]_ |
| `shows.editor.cost.type` | Type | _[translate here]_ |
| `shows.editor.cost.amount` | Amount | _[translate here]_ |
| `shows.editor.cost.desc` | Description | _[translate here]_ |
| `shows.editor.status.help` | Current lifecycle state of the show | _[translate here]_ |
| `shows.editor.cost.template.travel` | Travel basics | _[translate here]_ |
| `shows.editor.cost.template.production` | Production basics | _[translate here]_ |
| `shows.editor.cost.template.marketing` | Marketing basics | _[translate here]_ |
| `shows.editor.quick.label` | Quick add costs | _[translate here]_ |
| `shows.editor.quick.hint` | e.g., Hotel 1200 | _[translate here]_ |
| `shows.editor.quick.placeholder` | 20/04/2025  | _[translate here]_ |
| `shows.editor.quick.preview.summary` | Will set: {fields} | _[translate here]_ |
| `shows.editor.quick.apply` | Apply | _[translate here]_ |
| `shows.editor.quick.parseError` | Cannot interpret | _[translate here]_ |
| `shows.editor.quick.applied` | Quick entry applied | _[translate here]_ |
| `shows.editor.bulk.title` | Bulk add costs | _[translate here]_ |
| `shows.editor.bulk.open` | Bulk add | _[translate here]_ |
| `shows.editor.bulk.placeholder` | Type, Amount, Description\nTravel, 1200, Flights BCN-MAD\nProduction\t500\tBackline | _[translate here]_ |
| `shows.editor.bulk.preview` | Preview | _[translate here]_ |
| `shows.editor.bulk.parsed` | Parsed {count} lines | _[translate here]_ |
| `shows.editor.bulk.add` | Add costs | _[translate here]_ |
| `shows.editor.bulk.cancel` | Cancel | _[translate here]_ |
| `shows.editor.bulk.invalidLine` | Invalid line {n} | _[translate here]_ |
| `shows.editor.bulk.empty` | No valid lines | _[translate here]_ |
| `shows.editor.bulk.help` | Paste CSV or tab-separated lines: Type, Amount, Description (amount optional) | _[translate here]_ |
| `shows.editor.restored` | Restored draft | _[translate here]_ |
| `shows.editor.quick.icon.date` | Date | _[translate here]_ |
| `shows.editor.quick.icon.city` | City | _[translate here]_ |
| `shows.editor.quick.icon.country` | Country | _[translate here]_ |
| `shows.editor.quick.icon.fee` | Fee | _[translate here]_ |
| `shows.editor.quick.icon.whtPct` | WHT % | _[translate here]_ |
| `shows.editor.quick.icon.name` | Name | _[translate here]_ |
| `shows.editor.cost.templateMenu` | Cost templates | _[translate here]_ |
| `shows.editor.cost.template.applied` | Template applied | _[translate here]_ |
| `shows.editor.cost.duplicate` | Duplicate | _[translate here]_ |
| `shows.editor.cost.moveUp` | Move up | _[translate here]_ |
| `shows.editor.cost.moveDown` | Move down | _[translate here]_ |
| `shows.editor.costs.title` | Costs | _[translate here]_ |
| `shows.editor.costs.empty` | No costs yet — add one | _[translate here]_ |
| `shows.editor.costs.recent` | Recent | _[translate here]_ |
| `shows.editor.costs.templates` | Templates | _[translate here]_ |
| `shows.editor.costs.subtotal` | Subtotal {category} | _[translate here]_ |
| `shows.editor.wht.suggest` | Suggest {pct}% | _[translate here]_ |
| `shows.editor.wht.apply` | Apply {pct}% | _[translate here]_ |
| `shows.editor.wht.suggest.applied` | Suggestion applied | _[translate here]_ |
| `shows.editor.wht.tooltip.es` | Typical IRPF in ES: 15% (editable) | _[translate here]_ |
| `shows.editor.wht.tooltip.generic` | Typical withholding suggestion | _[translate here]_ |
| `shows.editor.status.hint` | Change here or via badge | _[translate here]_ |
| `shows.editor.wht.hint.es` | Typical ES withholding: 15% (editable) | _[translate here]_ |
| `shows.editor.wht.hint.generic` | Withholding percentage (editable) | _[translate here]_ |
| `shows.editor.commission.default` | Default {pct}% | _[translate here]_ |
| `shows.editor.commission.overridden` | Override | _[translate here]_ |
| `shows.editor.commission.overriddenIndicator` | Commission overridden | _[translate here]_ |
| `shows.editor.commission.reset` | Reset to default | _[translate here]_ |
| `shows.editor.label.currency` | Currency | _[translate here]_ |
| `shows.editor.help.currency` | Contract currency | _[translate here]_ |
| `shows.editor.fx.rateOn` | Rate | _[translate here]_ |
| `shows.editor.fx.convertedFee` | ≈ {amount} {base} | _[translate here]_ |
| `shows.editor.fx.unavailable` | Rate unavailable | _[translate here]_ |
| `shows.editor.actions.promote` | Promote | _[translate here]_ |
| `shows.editor.actions.planTravel` | Plan travel | _[translate here]_ |
| `shows.editor.state.hint` | Use the badge or this selector | _[translate here]_ |
| `shows.editor.save.create` | Save | _[translate here]_ |
| `shows.editor.save.edit` | Save changes | _[translate here]_ |
| `shows.editor.save.retry` | Retry | _[translate here]_ |
| `shows.editor.tab.active` | Tab {label} active | _[translate here]_ |
| `shows.editor.tab.restored` | Restored last tab: {label} | _[translate here]_ |
| `shows.editor.errors.count` | There are {n} errors | _[translate here]_ |
| `shows.totals.fees` | Fees | _[translate here]_ |
| `shows.totals.net` | Net | _[translate here]_ |
| `shows.totals.hide` | Hide | _[translate here]_ |
| `shows.totals.show` | Show totals | _[translate here]_ |
| `shows.view.list` | List | _[translate here]_ |
| `shows.view.board` | Board | _[translate here]_ |
| `shows.views.none` | Views | _[translate here]_ |
| `views.manage` | Manage views | _[translate here]_ |
| `views.saved` | Saved | _[translate here]_ |
| `views.apply` | Apply | _[translate here]_ |
| `views.none` | No saved views | _[translate here]_ |
| `views.deleted` | Deleted | _[translate here]_ |
| `views.export` | Export | _[translate here]_ |
| `views.import` | Import | _[translate here]_ |
| `views.import.hint` | Paste JSON of views to import | _[translate here]_ |
| `views.openLab` | Open Layout Lab | _[translate here]_ |
| `views.share` | Copy share link | _[translate here]_ |
| `views.export.copied` | Export copied | _[translate here]_ |
| `views.imported` | Views imported | _[translate here]_ |
| `views.import.invalid` | Invalid JSON | _[translate here]_ |
| `views.label` | View | _[translate here]_ |
| `views.names.default` | Default | _[translate here]_ |
| `views.names.finance` | Finance | _[translate here]_ |
| `views.names.operations` | Operations | _[translate here]_ |
| `views.names.promo` | Promotion | _[translate here]_ |
| `demo.banner` | Demo data • No live sync | _[translate here]_ |
| `demo.load` | Load demo data | _[translate here]_ |
| `demo.loaded` | Demo data loaded | _[translate here]_ |
| `demo.clear` | Clear data | _[translate here]_ |
| `demo.cleared` | All data cleared | _[translate here]_ |
| `demo.password.prompt` | Enter demo password | _[translate here]_ |
| `demo.password.invalid` | Incorrect password | _[translate here]_ |
| `shows.views.delete` | Delete | _[translate here]_ |
| `shows.views.namePlaceholder` | View name | _[translate here]_ |
| `shows.views.save` | Save | _[translate here]_ |
| `shows.status.canceled` | Canceled | _[translate here]_ |
| `shows.status.archived` | Archived | _[translate here]_ |
| `shows.status.offer` | Offer | _[translate here]_ |
| `shows.status.pending` | Pending | _[translate here]_ |
| `shows.status.confirmed` | Confirmed | _[translate here]_ |
| `shows.status.postponed` | Postponed | _[translate here]_ |
| `shows.bulk.selected` | selected | _[translate here]_ |
| `shows.bulk.confirm` | Confirm | _[translate here]_ |
| `shows.bulk.promote` | Promote | _[translate here]_ |
| `shows.bulk.export` | Export | _[translate here]_ |
| `shows.notes` | Notes | _[translate here]_ |
| `shows.virtualized.hint` | Virtualized list active | _[translate here]_ |
| `story.title` | Story mode | _[translate here]_ |
| `story.timeline` | Timeline | _[translate here]_ |
| `story.play` | Play | _[translate here]_ |
| `story.pause` | Pause | _[translate here]_ |
| `story.cta` | Story mode | _[translate here]_ |
| `story.scrub` | Scrub timeline | _[translate here]_ |
| `finance.overview` | Finance overview | _[translate here]_ |
| `shows.title` | Shows | _[translate here]_ |
| `shows.notFound` | Show not found | _[translate here]_ |
| `shows.search.placeholder` | Search city/country | _[translate here]_ |
| `shows.add` | Add show | _[translate here]_ |
| `shows.edit` | Edit | _[translate here]_ |
| `shows.summary.upcoming` | Upcoming | _[translate here]_ |
| `shows.summary.totalFees` | Total Fees | _[translate here]_ |
| `shows.summary.estNet` | Est. Net | _[translate here]_ |
| `shows.summary.avgWht` | Avg WHT | _[translate here]_ |
| `shows.table.date` | Date | _[translate here]_ |
| `shows.table.name` | Show | _[translate here]_ |
| `shows.table.city` | City | _[translate here]_ |
| `shows.table.country` | Country | _[translate here]_ |
| `shows.table.venue` | Venue | _[translate here]_ |
| `shows.table.promoter` | Promoter | _[translate here]_ |
| `shows.table.wht` | WHT % | _[translate here]_ |
| `shows.table.type` | Type | _[translate here]_ |
| `shows.table.description` | Description | _[translate here]_ |
| `shows.table.amount` | Amount | _[translate here]_ |
| `shows.table.remove` | Remove | _[translate here]_ |
| `shows.table.agency.mgmt` | Mgmt | _[translate here]_ |
| `shows.table.agency.booking` | Booking | _[translate here]_ |
| `shows.table.agencies` | Agencies | _[translate here]_ |
| `shows.table.notes` | Notes | _[translate here]_ |
| `shows.table.fee` | Fee | _[translate here]_ |
| `shows.selected` | selected | _[translate here]_ |
| `shows.count.singular` | show | _[translate here]_ |
| `shows.count.plural` | shows | _[translate here]_ |
| `settings.title` | Settings | _[translate here]_ |
| `settings.personal` | Personal | _[translate here]_ |
| `settings.preferences` | Preferences | _[translate here]_ |
| `settings.organization` | Organization | _[translate here]_ |
| `settings.billing` | Billing | _[translate here]_ |
| `settings.currency` | Currency | _[translate here]_ |
| `settings.units` | Distance units | _[translate here]_ |
| `settings.agencies` | Agencies | _[translate here]_ |
| `settings.localNote` | Preferences are saved locally on this device. | _[translate here]_ |
| `settings.language` | Language | _[translate here]_ |
| `settings.language.en` | English | _[translate here]_ |
| `settings.language.es` | Spanish | _[translate here]_ |
| `settings.dashboardView` | Default Dashboard View | _[translate here]_ |
| `settings.presentation` | Presentation mode | _[translate here]_ |
| `settings.comparePrev` | Compare vs previous period | _[translate here]_ |
| `settings.defaultStatuses` | Default status filters | _[translate here]_ |
| `settings.defaultRegion` | Default region | _[translate here]_ |
| `settings.region.all` | All | _[translate here]_ |
| `settings.region.AMER` | Americas | _[translate here]_ |
| `settings.region.EMEA` | EMEA | _[translate here]_ |
| `settings.region.APAC` | APAC | _[translate here]_ |
| `settings.agencies.booking` | Booking Agencies | _[translate here]_ |
| `settings.agencies.management` | Management Agencies | _[translate here]_ |
| `settings.agencies.add` | Add | _[translate here]_ |
| `settings.agencies.hideForm` | Hide form | _[translate here]_ |
| `settings.agencies.none` | No agencies | _[translate here]_ |
| `settings.agencies.name` | Name | _[translate here]_ |
| `settings.agencies.commission` | Commission % | _[translate here]_ |
| `settings.agencies.territoryMode` | Territory Mode | _[translate here]_ |
| `settings.agencies.continents` | Continents | _[translate here]_ |
| `settings.agencies.countries` | Countries (comma or space separated ISO2) | _[translate here]_ |
| `settings.agencies.addBooking` | Add booking | _[translate here]_ |
| `settings.agencies.addManagement` | Add management | _[translate here]_ |
| `settings.agencies.reset` | Reset | _[translate here]_ |
| `settings.agencies.remove` | Remove agency | _[translate here]_ |
| `settings.agencies.limitReached` | Limit reached (max 3) | _[translate here]_ |
| `settings.agencies.countries.invalid` | Countries must be 2-letter ISO codes (e.g., US ES DE), separated by commas or spaces. | _[translate here]_ |
| `settings.continent.NA` | North America | _[translate here]_ |
| `settings.continent.SA` | South America | _[translate here]_ |
| `settings.continent.EU` | Europe | _[translate here]_ |
| `settings.continent.AF` | Africa | _[translate here]_ |
| `settings.continent.AS` | Asia | _[translate here]_ |
| `settings.continent.OC` | Oceania | _[translate here]_ |
| `settings.territory.worldwide` | Worldwide | _[translate here]_ |
| `settings.territory.continents` | Continents | _[translate here]_ |
| `settings.territory.countries` | Countries | _[translate here]_ |
| `settings.export` | Export settings | _[translate here]_ |
| `settings.import` | Import settings | _[translate here]_ |
| `settings.reset` | Reset to defaults | _[translate here]_ |
| `settings.preview` | Preview | _[translate here]_ |
| `shows.table.net` | Net | _[translate here]_ |
| `shows.table.status` | Status | _[translate here]_ |
| `shows.selectAll` | Select all | _[translate here]_ |
| `shows.selectRow` | Select row | _[translate here]_ |
| `shows.editor.tabs` | Editor tabs | _[translate here]_ |
| `shows.editor.tab.details` | Details | _[translate here]_ |
| `shows.editor.tab.finance` | Finance | _[translate here]_ |
| `shows.editor.tab.costs` | Costs | _[translate here]_ |
| `shows.editor.finance.commissions` | Commissions | _[translate here]_ |
| `shows.editor.add` | Add show | _[translate here]_ |
| `shows.editor.edit` | Edit show | _[translate here]_ |
| `shows.editor.subtitleAdd` | Create a new event | _[translate here]_ |
| `shows.editor.label.status` | Status | _[translate here]_ |
| `shows.editor.label.date` | Date | _[translate here]_ |
| `shows.editor.label.city` | City | _[translate here]_ |
| `shows.editor.label.country` | Country | _[translate here]_ |
| `shows.editor.label.venue` | Venue | _[translate here]_ |
| `shows.editor.label.promoter` | Promoter | _[translate here]_ |
| `shows.editor.label.fee` | Fee | _[translate here]_ |
| `shows.editor.label.wht` | WHT % | _[translate here]_ |
| `shows.editor.label.mgmt` | Mgmt Agency | _[translate here]_ |
| `shows.editor.label.booking` | Booking Agency | _[translate here]_ |
| `shows.editor.label.notes` | Notes | _[translate here]_ |
| `shows.editor.validation.cityRequired` | City is required | _[translate here]_ |
| `shows.editor.validation.countryRequired` | Country is required | _[translate here]_ |
| `shows.editor.validation.dateRequired` | Date is required | _[translate here]_ |
| `shows.editor.validation.feeGtZero` | Fee must be greater than 0 | _[translate here]_ |
| `shows.editor.validation.whtRange` | WHT must be between 0% and 50% | _[translate here]_ |
| `shows.dialog.close` | Close | _[translate here]_ |
| `shows.dialog.cancel` | Cancel | _[translate here]_ |
| `shows.dialog.save` | Save | _[translate here]_ |
| `shows.dialog.saveChanges` | Save changes | _[translate here]_ |
| `shows.dialog.delete` | Delete | _[translate here]_ |
| `shows.editor.validation.fail` | Fix errors to continue | _[translate here]_ |
| `shows.editor.toast.saved` | Saved | _[translate here]_ |
| `shows.editor.toast.deleted` | Deleted | _[translate here]_ |
| `shows.editor.toast.undo` | Undo | _[translate here]_ |
| `shows.editor.toast.restored` | Restored | _[translate here]_ |
| `shows.editor.toast.deleting` | Deleting… | _[translate here]_ |
| `shows.editor.toast.discarded` | Changes discarded | _[translate here]_ |
| `shows.editor.toast.validation` | Please correct the highlighted errors | _[translate here]_ |
| `shows.editor.summary.fee` | Fee | _[translate here]_ |
| `shows.editor.summary.wht` | WHT | _[translate here]_ |
| `shows.editor.summary.costs` | Costs | _[translate here]_ |
| `shows.editor.summary.net` | Est. Net | _[translate here]_ |
| `shows.editor.discard.title` | Discard changes? | _[translate here]_ |
| `shows.editor.discard.body` | You have unsaved changes. They will be lost. | _[translate here]_ |
| `shows.editor.discard.cancel` | Keep editing | _[translate here]_ |
| `shows.editor.discard.confirm` | Discard | _[translate here]_ |
| `shows.editor.delete.confirmTitle` | Delete show? | _[translate here]_ |
| `shows.editor.delete.confirmBody` | This action cannot be undone. | _[translate here]_ |
| `shows.editor.delete.confirm` | Delete | _[translate here]_ |
| `shows.editor.delete.cancel` | Cancel | _[translate here]_ |
| `shows.noCosts` | No costs yet | _[translate here]_ |
| `shows.filters.region` | Region | _[translate here]_ |
| `shows.filters.region.all` | All | _[translate here]_ |
| `shows.filters.region.AMER` | AMER | _[translate here]_ |
| `shows.filters.region.EMEA` | EMEA | _[translate here]_ |
| `shows.filters.region.APAC` | APAC | _[translate here]_ |
| `shows.filters.feeMin` | Min fee | _[translate here]_ |
| `shows.filters.feeMax` | Max fee | _[translate here]_ |
| `shows.views.export` | Export views | _[translate here]_ |
| `shows.views.import` | Import views | _[translate here]_ |
| `shows.views.applied` | View applied | _[translate here]_ |
| `shows.bulk.delete` | Delete selected | _[translate here]_ |
| `shows.bulk.setWht` | Set WHT % | _[translate here]_ |
| `shows.bulk.applyWht` | Apply WHT | _[translate here]_ |
| `shows.bulk.setStatus` | Set status | _[translate here]_ |
| `shows.bulk.apply` | Apply | _[translate here]_ |
| `shows.travel.title` | Location | _[translate here]_ |
| `shows.travel.quick` | Travel | _[translate here]_ |
| `shows.travel.soon` | Upcoming confirmed show — consider adding travel. | _[translate here]_ |
| `shows.travel.soonConfirmed` | Upcoming confirmed show — consider adding travel. | _[translate here]_ |
| `shows.travel.soonGeneric` | Upcoming show — consider planning travel. | _[translate here]_ |
| `shows.travel.tripExists` | Trip already scheduled around this date | _[translate here]_ |
| `shows.travel.noCta` | No travel action needed | _[translate here]_ |
| `shows.travel.plan` | Plan travel | _[translate here]_ |
| `cmd.dialog` | Command palette | _[translate here]_ |
| `cmd.placeholder` | Search shows or actions… | _[translate here]_ |
| `cmd.type.show` | Show | _[translate here]_ |
| `cmd.type.action` | Action | _[translate here]_ |
| `cmd.noResults` | No results | _[translate here]_ |
| `cmd.footer.hint` | Enter to run • Esc to close | _[translate here]_ |
| `cmd.footer.tip` | Tip: press ? for shortcuts | _[translate here]_ |
| `cmd.openFilters` | Open Filters | _[translate here]_ |
| `cmd.mask.enable` | Enable Mask | _[translate here]_ |
| `cmd.mask.disable` | Disable Mask | _[translate here]_ |
| `cmd.presentation.enable` | Enable Presentation Mode | _[translate here]_ |
| `cmd.presentation.disable` | Disable Presentation Mode | _[translate here]_ |
| `cmd.shortcuts` | Show Shortcuts Overlay | _[translate here]_ |
| `cmd.switch.default` | Switch View: Default | _[translate here]_ |
| `cmd.switch.finance` | Switch View: Finance | _[translate here]_ |
| `cmd.switch.operations` | Switch View: Operations | _[translate here]_ |
| `cmd.switch.promo` | Switch View: Promotion | _[translate here]_ |
| `cmd.openAlerts` | Open Alert Center | _[translate here]_ |
| `cmd.go.shows` | Go to Shows | _[translate here]_ |
| `cmd.go.travel` | Go to Travel | _[translate here]_ |
| `cmd.go.finance` | Go to Finance | _[translate here]_ |
| `cmd.go.org` | Go to Org Overview | _[translate here]_ |
| `cmd.go.members` | Go to Org Members | _[translate here]_ |
| `cmd.go.clients` | Go to Org Clients | _[translate here]_ |
| `cmd.go.teams` | Go to Org Teams | _[translate here]_ |
| `cmd.go.links` | Go to Org Links | _[translate here]_ |
| `cmd.go.reports` | Go to Org Reports | _[translate here]_ |
| `cmd.go.documents` | Go to Org Documents | _[translate here]_ |
| `cmd.go.integrations` | Go to Org Integrations | _[translate here]_ |
| `cmd.go.billing` | Go to Org Billing | _[translate here]_ |
| `cmd.go.branding` | Go to Org Branding | _[translate here]_ |
| `shortcuts.dialog` | Keyboard shortcuts | _[translate here]_ |
| `shortcuts.title` | Shortcuts | _[translate here]_ |
| `shortcuts.desc` | Use these to move faster. Press Esc to close. | _[translate here]_ |
| `shortcuts.openPalette` | Open Command Palette | _[translate here]_ |
| `shortcuts.showOverlay` | Show this overlay | _[translate here]_ |
| `shortcuts.closeDialogs` | Close dialogs/popups | _[translate here]_ |
| `shortcuts.goTo` | Quick nav: g then key | _[translate here]_ |
| `alerts.open` | Open Alerts | _[translate here]_ |
| `alerts.loading` | Loading alerts… | _[translate here]_ |
| `actions.exportCsv` | Export CSV | _[translate here]_ |
| `actions.copyDigest` | Copy Digest | _[translate here]_ |
| `actions.digest.title` | Weekly Alerts Digest | _[translate here]_ |
| `actions.toast.csv` | CSV copied | _[translate here]_ |
| `actions.toast.digest` | Digest copied | _[translate here]_ |
| `actions.toast.share` | Link copied | _[translate here]_ |
| `welcome.title` | Welcome, {name} | _[translate here]_ |
| `welcome.subtitle.agency` | Manage your managers and artists | _[translate here]_ |
| `welcome.subtitle.artist` | All set for your upcoming shows | _[translate here]_ |
| `welcome.cta.dashboard` | Go to dashboard | _[translate here]_ |
| `welcome.section.team` | Your team | _[translate here]_ |
| `welcome.section.clients` | Your artists | _[translate here]_ |
| `welcome.section.assignments` | Managers per artist | _[translate here]_ |
| `welcome.section.links` | Connections & scopes | _[translate here]_ |
| `welcome.section.kpis` | This month | _[translate here]_ |
| `welcome.seats.usage` | Seats used | _[translate here]_ |
| `welcome.gettingStarted` | Getting started | _[translate here]_ |
| `welcome.recentlyViewed` | Recently viewed | _[translate here]_ |
| `welcome.changesSince` | Changes since your last visit | _[translate here]_ |
| `welcome.noChanges` | No changes | _[translate here]_ |
| `welcome.change.linkEdited` | Link scopes edited for Danny | _[translate here]_ |
| `welcome.change.memberInvited` | New manager invited | _[translate here]_ |
| `welcome.change.docUploaded` | New document uploaded | _[translate here]_ |
| `empty.noRecent` | No recent items | _[translate here]_ |
| `welcome.cta.inviteManager` | Invite manager | _[translate here]_ |
| `welcome.cta.connectArtist` | Connect artist | _[translate here]_ |
| `welcome.cta.createTeam` | Create team | _[translate here]_ |
| `welcome.cta.completeBranding` | Complete branding | _[translate here]_ |
| `welcome.cta.reviewShows` | Review shows | _[translate here]_ |
| `welcome.cta.connectCalendar` | Connect calendar | _[translate here]_ |
| `welcome.cta.switchOrg` | Change organization | _[translate here]_ |
| `welcome.cta.completeSetup` | Complete setup | _[translate here]_ |
| `welcome.progress.complete` | Setup complete | _[translate here]_ |
| `welcome.progress.incomplete` | {completed}/{total} steps completed | _[translate here]_ |
| `welcome.tooltip.inviteManager` | Invite team members to collaborate on shows and finances | _[translate here]_ |
| `welcome.tooltip.connectArtist` | Link with artists to manage their tours | _[translate here]_ |
| `welcome.tooltip.completeBranding` | Set up your organization\ | _[translate here]_ |
| `welcome.tooltip.connectCalendar` | Sync your calendar for automatic show scheduling | _[translate here]_ |
| `welcome.tooltip.switchOrg` | Switch between different organizations you manage | _[translate here]_ |
| `welcome.gettingStarted.invite` | Invite a manager | _[translate here]_ |
| `welcome.gettingStarted.connect` | Connect an artist | _[translate here]_ |
| `welcome.gettingStarted.review` | Review teams & links | _[translate here]_ |
| `welcome.gettingStarted.branding` | Complete branding | _[translate here]_ |
| `welcome.gettingStarted.shows` | Review shows | _[translate here]_ |
| `welcome.gettingStarted.calendar` | Connect calendar | _[translate here]_ |
| `welcome.dontShowAgain` | Don | _[translate here]_ |
| `welcome.openArtistDashboard` | Open {artist} dashboard | _[translate here]_ |
| `welcome.assign` | Assign | _[translate here]_ |
| `shows.toast.bulk.status` | Status: {status} ({n}) | _[translate here]_ |
| `shows.toast.bulk.confirm` | Confirmed | _[translate here]_ |
| `shows.toast.bulk.setStatus` | Status applied | _[translate here]_ |
| `shows.toast.bulk.setWht` | WHT applied | _[translate here]_ |
| `shows.toast.bulk.export` | Export started | _[translate here]_ |
| `shows.toast.bulk.delete` | Deleted | _[translate here]_ |
| `shows.toast.bulk.confirmed` | Confirmed ({n}) | _[translate here]_ |
| `shows.toast.bulk.wht` | WHT {pct}% ({n}) | _[translate here]_ |
| `filters.clear` | Clear | _[translate here]_ |
| `filters.more` | More filters | _[translate here]_ |
| `filters.cleared` | Filters cleared | _[translate here]_ |
| `filters.presets` | Presets | _[translate here]_ |
| `filters.presets.last7` | Last 7 days | _[translate here]_ |
| `filters.presets.last30` | Last 30 days | _[translate here]_ |
| `filters.presets.last90` | Last 90 days | _[translate here]_ |
| `filters.presets.mtd` | Month to date | _[translate here]_ |
| `filters.presets.ytd` | Year to date | _[translate here]_ |
| `filters.presets.qtd` | Quarter to date | _[translate here]_ |
| `filters.applied` | Filters applied | _[translate here]_ |
| `common.team` | Team | _[translate here]_ |
| `common.region` | Region | _[translate here]_ |
| `ah.planTravel` | Plan travel | _[translate here]_ |
| `map.cssWarning` | Map styles failed to load. Using basic fallback. | _[translate here]_ |
| `travel.offline` | Offline mode: showing cached itineraries. | _[translate here]_ |
| `travel.refresh.error` | Couldn | _[translate here]_ |
| `travel.search.title` | Search | _[translate here]_ |
| `travel.search.open_in_google` | Open in Google Flights | _[translate here]_ |
| `travel.search.mode.form` | Form | _[translate here]_ |
| `travel.search.mode.text` | Text | _[translate here]_ |
| `travel.search.show_text` | Write query | _[translate here]_ |
| `travel.search.hide_text` | Hide text input | _[translate here]_ |
| `travel.search.text.placeholder` | e.g., From MAD to CDG 2025-10-12 2 adults business | _[translate here]_ |
| `travel.nlp` | NLP | _[translate here]_ |
| `travel.search.origin` | Origin | _[translate here]_ |
| `travel.search.destination` | Destination | _[translate here]_ |
| `travel.search.departure_date` | Departure date | _[translate here]_ |
| `travel.search.searching` | Searching flights… | _[translate here]_ |
| `travel.search.searchMyFlight` | Search My Flight | _[translate here]_ |
| `travel.search.searchAgain` | Search Again | _[translate here]_ |
| `travel.search.error` | Error searching flights | _[translate here]_ |
| `travel.addPurchasedFlight` | Add Purchased Flight | _[translate here]_ |
| `travel.addFlightDescription` | Enter your booking reference or flight number to add it to your schedule | _[translate here]_ |
| `travel.emptyStateDescription` | Add your booked flights or search for new ones to start managing your trips. | _[translate here]_ |
| `features.settlement.benefit` | 8h/week saved on financial reports | _[translate here]_ |
| `features.offline.description` | IndexedDB + robust sync. Manage your tour on the plane, backstage, or anywhere. When internet returns, everything syncs automatically. | _[translate here]_ |
| `features.offline.benefit` | 24/7 access, no connection dependency | _[translate here]_ |
| `features.ai.description` | NLP Quick Entry, intelligent ActionHub, predictive Health Score. Warns you of problems before they happen. Your tour copilot. | _[translate here]_ |
| `features.ai.benefit` | Anticipates problems 72h in advance | _[translate here]_ |
| `features.esign.description` | Integrated e-sign, templates by country (US/UK/EU/ES), full-text search with OCR. Close deals faster, no paper printing. | _[translate here]_ |
| `features.esign.benefit` | Close contracts 3x faster | _[translate here]_ |
| `features.inbox.description` | Emails organized by show, smart threading, rich text reply. All your context in one place, no Gmail searching. | _[translate here]_ |
| `features.inbox.benefit` | Zero inbox with full context | _[translate here]_ |
| `features.travel.description` | Integrated Amadeus API, global venue database, optimized routing. Plan efficient routes with real data. | _[translate here]_ |
| `features.travel.benefit` | 12% savings on travel costs | _[translate here]_ |
| `org.addShowToCalendar` | Add a new show to your calendar | _[translate here]_ |
| `travel.validation.completeFields` | Please complete origin, destination and departure date | _[translate here]_ |
| `travel.validation.returnDate` | Select return date for round trip | _[translate here]_ |
| `travel.search.show_more_options` | Open externally | _[translate here]_ |
| `travel.advanced.show` | More options | _[translate here]_ |
| `travel.advanced.hide` | Hide advanced options | _[translate here]_ |
| `travel.flight_card.nonstop` | nonstop | _[translate here]_ |
| `travel.flight_card.stop` | stop | _[translate here]_ |
| `travel.flight_card.stops` | stops | _[translate here]_ |
| `travel.flight_card.select_for_planning` | Select for planning | _[translate here]_ |
| `travel.add_to_trip` | Add to trip | _[translate here]_ |
| `travel.swap` | Swap | _[translate here]_ |
| `travel.round_trip` | Round trip | _[translate here]_ |
| `travel.share_search` | Share search | _[translate here]_ |
| `travel.from` | From | _[translate here]_ |
| `travel.to` | To | _[translate here]_ |
| `travel.depart` | Depart | _[translate here]_ |
| `travel.return` | Return | _[translate here]_ |
| `travel.adults` | Adults | _[translate here]_ |
| `travel.bag` | bag | _[translate here]_ |
| `travel.bags` | Bags | _[translate here]_ |
| `travel.cabin` | Cabin | _[translate here]_ |
| `travel.stops_ok` | Stops ok | _[translate here]_ |
| `travel.deeplink.preview` | Preview link | _[translate here]_ |
| `travel.deeplink.copy` | Copy link | _[translate here]_ |
| `travel.deeplink.copied` | Copied ✓ | _[translate here]_ |
| `travel.sort.menu` | Sort by | _[translate here]_ |
| `travel.sort.priceAsc` | Price (low→high) | _[translate here]_ |
| `travel.sort.priceDesc` | Price (high→low) | _[translate here]_ |
| `travel.sort.duration` | Duration | _[translate here]_ |
| `travel.sort.stops` | Stops | _[translate here]_ |
| `travel.badge.nonstop` | Nonstop | _[translate here]_ |
| `travel.badge.baggage` | Bag included | _[translate here]_ |
| `travel.arrival.sameDay` | Arrives same day | _[translate here]_ |
| `travel.arrival.nextDay` | Arrives next day | _[translate here]_ |
| `travel.recent.clear` | Clear recent | _[translate here]_ |
| `travel.recent.remove` | Remove | _[translate here]_ |
| `travel.form.invalid` | Please fix errors to search | _[translate here]_ |
| `travel.nlp.hint` | Free-form input — press Shift+Enter to apply | _[translate here]_ |
| `travel.flex.days` | ±{n} days | _[translate here]_ |
| `travel.compare.grid.title` | Compare flights | _[translate here]_ |
| `travel.compare.empty` | Pin flights to compare them here. | _[translate here]_ |
| `travel.compare.hint` | Review pinned flights side-by-side. | _[translate here]_ |
| `travel.co2.label` | CO₂ | _[translate here]_ |
| `travel.window` | Window | _[translate here]_ |
| `travel.flex_window` | Flex window | _[translate here]_ |
| `travel.flex_hint` | We | _[translate here]_ |
| `travel.one_way` | One-way | _[translate here]_ |
| `travel.nonstop` | Nonstop | _[translate here]_ |
| `travel.pin` | Pin | _[translate here]_ |
| `travel.unpin` | Unpin | _[translate here]_ |
| `travel.compare.title` | Compare pinned | _[translate here]_ |
| `travel.compare.show` | Compare | _[translate here]_ |
| `travel.compare.hide` | Hide | _[translate here]_ |
| `travel.compare.add_to_trip` | Add to trip | _[translate here]_ |
| `travel.trip.added` | Added to trip | _[translate here]_ |
| `travel.trip.create_drop` | Drop here to create new trip | _[translate here]_ |
| `travel.related_show` | Related show | _[translate here]_ |
| `travel.multicity.toggle` | Multicity | _[translate here]_ |
| `travel.multicity` | Multi-city | _[translate here]_ |
| `travel.multicity.add_leg` | Add leg | _[translate here]_ |
| `travel.multicity.remove` | Remove | _[translate here]_ |
| `travel.multicity.move_up` | Move up | _[translate here]_ |
| `travel.multicity.move_down` | Move down | _[translate here]_ |
| `travel.multicity.open` | Open route in Google Flights | _[translate here]_ |
| `travel.multicity.hint` | Add at least two legs to build a route | _[translate here]_ |
| `travel.trips` | Trips | _[translate here]_ |
| `travel.trip.new` | New Trip | _[translate here]_ |
| `travel.trip.to` | Trip to | _[translate here]_ |
| `travel.segments` | Segments | _[translate here]_ |
| `common.actions` | Actions | _[translate here]_ |
| `travel.timeline.title` | Travel Timeline | _[translate here]_ |
| `travel.timeline.free_day` | Free day | _[translate here]_ |
| `travel.hub.title` | Search | _[translate here]_ |
| `travel.hub.needs_planning` | Suggestions | _[translate here]_ |
| `travel.hub.upcoming` | Upcoming | _[translate here]_ |
| `travel.hub.open_multicity` | Open multicity | _[translate here]_ |
| `travel.hub.plan_trip_cta` | Plan Trip | _[translate here]_ |
| `travel.error.same_route` | Origin and destination are the same | _[translate here]_ |
| `travel.error.return_before_depart` | Return is before departure | _[translate here]_ |
| `travel.segment.type` | Type | _[translate here]_ |
| `travel.segment.flight` | Flight | _[translate here]_ |
| `travel.segment.hotel` | Hotel | _[translate here]_ |
| `travel.segment.ground` | Ground | _[translate here]_ |
| `copy.manual.title` | Manual copy | _[translate here]_ |
| `copy.manual.desc` | Copy the text below if clipboard is blocked. | _[translate here]_ |
| `common.noResults` | No results | _[translate here]_ |
| `tripDetail.currency` | Currency | _[translate here]_ |
| `cost.category.flight` | Flight | _[translate here]_ |
| `cost.category.hotel` | Hotel | _[translate here]_ |
| `cost.category.ground` | Ground | _[translate here]_ |
| `cost.category.taxes` | Taxes | _[translate here]_ |
| `cost.category.fees` | Fees | _[translate here]_ |
| `cost.category.other` | Other | _[translate here]_ |
| `travel.workspace.placeholder` | Select a trip to see details or perform a search. | _[translate here]_ |
| `travel.open_in_provider` | Open in provider | _[translate here]_ |
| `common.loading` | Loading… | _[translate here]_ |
| `common.results` | results | _[translate here]_ |
| `travel.no_trips_yet` | No trips planned yet. Use the search to get started! | _[translate here]_ |
| `travel.provider` | Provider | _[translate here]_ |
| `provider.mock` | In-app (mock) | _[translate here]_ |
| `provider.google` | Google Flights | _[translate here]_ |
| `travel.alert.checkin` | Check-in opens in %s | _[translate here]_ |
| `travel.alert.priceDrop` | Price dropped by %s | _[translate here]_ |
| `travel.workspace.open` | Open Travel Workspace | _[translate here]_ |
| `travel.workspace.timeline` | Timeline view | _[translate here]_ |
| `travel.workspace.trip_builder.beta` | Trip Builder (beta) | _[translate here]_ |
| `common.list` | List | _[translate here]_ |
| `common.clear` | Clear | _[translate here]_ |
| `common.reset` | Reset | _[translate here]_ |
| `calendar.timeline` | Week | _[translate here]_ |
| `common.moved` | Moved | _[translate here]_ |
| `travel.drop.hint` | Drag to another day | _[translate here]_ |
| `travel.search.summary` | Search summary | _[translate here]_ |
| `travel.search.route` | {from} → {to} | _[translate here]_ |
| `travel.search.paxCabin` | {pax} pax · {cabin} | _[translate here]_ |
| `travel.results.countForDate` | {count} results for {date} | _[translate here]_ |
| `travel.compare.bestPrice` | Best price | _[translate here]_ |
| `travel.compare.bestTime` | Fastest | _[translate here]_ |
| `travel.compare.bestBalance` | Best balance | _[translate here]_ |
| `travel.co2.estimate` | ~{kg} kg CO₂ (est.) | _[translate here]_ |
| `travel.mobile.sticky.results` | Results | _[translate here]_ |
| `travel.mobile.sticky.compare` | Compare | _[translate here]_ |
| `travel.tooltips.flex` | Explore ± days around the selected date | _[translate here]_ |
| `travel.tooltips.nonstop` | Only show flights without stops | _[translate here]_ |
| `travel.tooltips.cabin` | Seat class preference | _[translate here]_ |
| `travel.move.prev` | Move to previous day | _[translate here]_ |
| `travel.move.next` | Move to next day | _[translate here]_ |
| `travel.rest.short` | Short rest before next show | _[translate here]_ |
| `travel.rest.same_day` | Same-day show risk | _[translate here]_ |
| `calendar.title` | Calendar | _[translate here]_ |
| `calendar.prev` | Previous month | _[translate here]_ |
| `calendar.next` | Next month | _[translate here]_ |
| `calendar.today` | Today | _[translate here]_ |
| `calendar.goto` | Go to date | _[translate here]_ |
| `calendar.more` | more | _[translate here]_ |
| `calendar.more.title` | More events | _[translate here]_ |
| `calendar.more.openDay` | Open day | _[translate here]_ |
| `calendar.more.openFullDay` | Open full day | _[translate here]_ |
| `calendar.announce.moved` | Moved show to {d} | _[translate here]_ |
| `calendar.announce.copied` | Duplicated show to {d} | _[translate here]_ |
| `calendar.quickAdd.hint` | Enter to add • Esc to cancel | _[translate here]_ |
| `calendar.quickAdd.advanced` | Advanced | _[translate here]_ |
| `calendar.quickAdd.simple` | Simple | _[translate here]_ |
| `calendar.quickAdd.placeholder` | City CC Fee (optional)… e.g., Madrid ES 12000 | _[translate here]_ |
| `calendar.quickAdd.recent` | Recent | _[translate here]_ |
| `calendar.quickAdd.parseError` | Can | _[translate here]_ |
| `calendar.quickAdd.countryMissing` | Add 2-letter country code | _[translate here]_ |
| `calendar.goto.hint` | Enter to go • Esc to close | _[translate here]_ |
| `calendar.view.switch` | Change calendar view | _[translate here]_ |
| `calendar.view.month` | Month | _[translate here]_ |
| `calendar.view.week` | Week | _[translate here]_ |
| `calendar.view.day` | Day | _[translate here]_ |
| `calendar.view.agenda` | Agenda | _[translate here]_ |
| `calendar.view.announce` | {v} view | _[translate here]_ |
| `calendar.timezone` | Time zone | _[translate here]_ |
| `calendar.tz.local` | Local | _[translate here]_ |
| `calendar.tz.localLabel` | Local | _[translate here]_ |
| `calendar.tz.changed` | Time zone set to {tz} | _[translate here]_ |
| `calendar.goto.shortcut` | ⌘/Ctrl + G | _[translate here]_ |
| `calendar.shortcut.pgUp` | PgUp / Alt+← | _[translate here]_ |
| `calendar.shortcut.pgDn` | PgDn / Alt+→ | _[translate here]_ |
| `calendar.shortcut.today` | T | _[translate here]_ |
| `common.move` | Move | _[translate here]_ |
| `common.copy` | Copy | _[translate here]_ |
| `calendar.more.filter` | Filter events | _[translate here]_ |
| `calendar.more.empty` | No results | _[translate here]_ |
| `calendar.kb.hint` | Keyboard: Arrow keys move day, PageUp/PageDown change month, T go to today, Enter or Space select day. | _[translate here]_ |
| `calendar.day.select` | Selected {d} | _[translate here]_ |
| `calendar.day.focus` | Focused {d} | _[translate here]_ |
| `calendar.noEvents` | No events for this day | _[translate here]_ |
| `calendar.show.shows` | Shows | _[translate here]_ |
| `calendar.show.travel` | Travel | _[translate here]_ |
| `calendar.kind` | Kind | _[translate here]_ |
| `calendar.kind.show` | Show | _[translate here]_ |
| `calendar.kind.travel` | Travel | _[translate here]_ |
| `calendar.status` | Status | _[translate here]_ |
| `calendar.dnd.enter` | Drop here to place event on {d} | _[translate here]_ |
| `calendar.dnd.leave` | Leaving drop target | _[translate here]_ |
| `calendar.kbdDnD.marked` | Marked {d} as origin. Use Enter on target day to drop. Hold Ctrl/Cmd to copy. | _[translate here]_ |
| `calendar.kbdDnD.cancel` | Cancelled move/copy mode | _[translate here]_ |
| `calendar.kbdDnD.origin` | Origin (keyboard move/copy active) | _[translate here]_ |
| `calendar.kbdDnD.none` | No show to move from selected origin | _[translate here]_ |
| `calendar.weekStart` | Week starts on | _[translate here]_ |
| `calendar.weekStart.mon` | Mon | _[translate here]_ |
| `calendar.weekStart.sun` | Sun | _[translate here]_ |
| `calendar.import` | Import | _[translate here]_ |
| `calendar.import.ics` | Import .ics | _[translate here]_ |
| `calendar.import.done` | Imported {n} events | _[translate here]_ |
| `calendar.import.error` | Failed to import .ics | _[translate here]_ |
| `calendar.wd.mon` | Mon | _[translate here]_ |
| `calendar.wd.tue` | Tue | _[translate here]_ |
| `calendar.wd.wed` | Wed | _[translate here]_ |
| `calendar.wd.thu` | Thu | _[translate here]_ |
| `calendar.wd.fri` | Fri | _[translate here]_ |
| `calendar.wd.sat` | Sat | _[translate here]_ |
| `calendar.wd.sun` | Sun | _[translate here]_ |
| `shows.costs.type` | Type | _[translate here]_ |
| `shows.costs.placeholder` | Travel / Production / Marketing | _[translate here]_ |
| `shows.costs.amount` | Amount | _[translate here]_ |
| `shows.costs.desc` | Description | _[translate here]_ |
| `common.optional` | Optional | _[translate here]_ |
| `common.add` | Add | _[translate here]_ |
| `common.income` | Income | _[translate here]_ |
| `common.wht` | WHT | _[translate here]_ |
| `common.commissions` | Commissions | _[translate here]_ |
| `common.net` | Net | _[translate here]_ |
| `common.costs` | Costs | _[translate here]_ |
| `common.total` | Total | _[translate here]_ |
| `shows.promote` | Promote | _[translate here]_ |
| `shows.editor.status.promote` | Promoted to | _[translate here]_ |
| `shows.margin.tooltip` | Net divided by Fee (%) | _[translate here]_ |
| `shows.empty` | No shows match your filters | _[translate here]_ |
| `shows.empty.add` | Add your first show | _[translate here]_ |
| `shows.export.csv.success` | CSV exported ✓ | _[translate here]_ |
| `shows.export.xlsx.success` | XLSX exported ✓ | _[translate here]_ |
| `shows.sort.tooltip` | Sort by column | _[translate here]_ |
| `shows.filters.statusGroup` | Status filters | _[translate here]_ |
| `shows.relative.inDays` | In {n} days | _[translate here]_ |
| `shows.relative.daysAgo` | {n} days ago | _[translate here]_ |
| `shows.relative.yesterday` | Yesterday | _[translate here]_ |
| `shows.row.menu` | Row actions | _[translate here]_ |
| `shows.action.edit` | Edit | _[translate here]_ |
| `shows.action.promote` | Promote | _[translate here]_ |
| `shows.action.duplicate` | Duplicate | _[translate here]_ |
| `shows.action.archive` | Archive | _[translate here]_ |
| `shows.action.delete` | Delete | _[translate here]_ |
| `shows.action.restore` | Restore | _[translate here]_ |
| `shows.board.header.net` | Net | _[translate here]_ |
| `shows.board.header.count` | Shows | _[translate here]_ |
| `shows.datePreset.thisMonth` | This Month | _[translate here]_ |
| `shows.datePreset.nextMonth` | Next Month | _[translate here]_ |
| `shows.columns.config` | Columns | _[translate here]_ |
| `shows.columns.wht` | WHT % | _[translate here]_ |
| `shows.totals.pin` | Pin totals | _[translate here]_ |
| `shows.totals.unpin` | Unpin totals | _[translate here]_ |
| `shows.totals.avgFee` | Avg Fee | _[translate here]_ |
| `shows.totals.avgFee.tooltip` | Average fee per show | _[translate here]_ |
| `shows.totals.avgMargin` | Avg Margin % | _[translate here]_ |
| `shows.totals.avgMargin.tooltip` | Average margin % across shows with fee | _[translate here]_ |
| `shows.wht.hide` | Hide WHT column | _[translate here]_ |
| `shows.sort.aria.sortedDesc` | Sorted descending | _[translate here]_ |
| `shows.sort.aria.sortedAsc` | Sorted ascending | _[translate here]_ |
| `shows.sort.aria.notSorted` | Not sorted | _[translate here]_ |
| `shows.sort.aria.activateDesc` | Activate to sort descending | _[translate here]_ |
| `shows.sort.aria.activateAsc` | Activate to sort ascending | _[translate here]_ |
| `nav.overview` | Overview | _[translate here]_ |
| `nav.clients` | Clients | _[translate here]_ |
| `nav.teams` | Teams | _[translate here]_ |
| `nav.links` | Links | _[translate here]_ |
| `nav.reports` | Reports | _[translate here]_ |
| `nav.documents` | Documents | _[translate here]_ |
| `nav.integrations` | Integrations | _[translate here]_ |
| `nav.billing` | Billing | _[translate here]_ |
| `nav.branding` | Branding | _[translate here]_ |
| `nav.connections` | Connections | _[translate here]_ |
| `org.overview.title` | Organization Overview | _[translate here]_ |
| `org.overview.subtitle.agency` | KPIs by client, tasks, and active links | _[translate here]_ |
| `org.overview.subtitle.artist` | Upcoming shows and travel, monthly KPIs | _[translate here]_ |
| `org.members.title` | Members | _[translate here]_ |
| `members.invite` | Invite | _[translate here]_ |
| `members.seats.usage` | Seat usage: 5/5 internal, 0/5 guests | _[translate here]_ |
| `org.clients.title` | Clients | _[translate here]_ |
| `org.teams.title` | Teams | _[translate here]_ |
| `org.links.title` | Links | _[translate here]_ |
| `org.branding.title` | Branding | _[translate here]_ |
| `org.documents.title` | Documents | _[translate here]_ |
| `org.reports.title` | Reports | _[translate here]_ |
| `org.integrations.title` | Integrations | _[translate here]_ |
| `org.billing.title` | Billing | _[translate here]_ |
| `labels.seats.used` | Seats used | _[translate here]_ |
| `labels.seats.guests` | Guests | _[translate here]_ |
| `export.options` | Export options | _[translate here]_ |
| `export.columns` | Columns | _[translate here]_ |
| `export.csv` | CSV | _[translate here]_ |
| `export.xlsx` | XLSX | _[translate here]_ |
| `common.exporting` | Exporting… | _[translate here]_ |
| `charts.viewTable` | View data as table | _[translate here]_ |
| `charts.hideTable` | Hide table | _[translate here]_ |
| `finance.period.mtd` | MTD | _[translate here]_ |
| `finance.period.lastMonth` | Last month | _[translate here]_ |
| `finance.period.ytd` | YTD | _[translate here]_ |
| `finance.period.custom` | Custom | _[translate here]_ |
| `finance.period.closed` | Closed | _[translate here]_ |
| `finance.period.open` | Open | _[translate here]_ |
| `finance.closeMonth` | Close Month | _[translate here]_ |
| `finance.reopenMonth` | Reopen Month | _[translate here]_ |
| `finance.closed.help` | Month is closed. Reopen to make changes. | _[translate here]_ |
| `finance.kpi.mtdNet` | MTD Net | _[translate here]_ |
| `finance.kpi.ytdNet` | YTD Net | _[translate here]_ |
| `finance.kpi.forecastEom` | Forecast EOM | _[translate here]_ |
| `finance.kpi.deltaTarget` | Δ vs Target | _[translate here]_ |
| `finance.kpi.gm` | GM% | _[translate here]_ |
| `finance.kpi.dso` | DSO | _[translate here]_ |
| `finance.comparePrev` | Compare vs previous | _[translate here]_ |
| `finance.export.csv.success` | CSV exported ✓ | _[translate here]_ |
| `finance.export.xlsx.success` | XLSX exported ✓ | _[translate here]_ |
| `finance.v2.footer` | AR top debtors and row actions coming next. | _[translate here]_ |
| `finance.pl.caption` | Profit and Loss ledger. Use column headers to sort. Virtualized list shows a subset of rows. | _[translate here]_ |
| `common.rowsVisible` | Rows visible | _[translate here]_ |
| `finance.whtPct` | WHT % | _[translate here]_ |
| `finance.wht` | WHT | _[translate here]_ |
| `finance.mgmtPct` | Mgmt % | _[translate here]_ |
| `finance.bookingPct` | Booking % | _[translate here]_ |
| `finance.breakdown.by` | Breakdown by | _[translate here]_ |
| `finance.breakdown.empty` | No breakdown available | _[translate here]_ |
| `finance.delta` | Δ | _[translate here]_ |
| `finance.deltaVsPrev` | Δ vs prev | _[translate here]_ |
| `common.comingSoon` | Coming soon | _[translate here]_ |
| `finance.expected` | Expected (stage-weighted) | _[translate here]_ |
| `finance.ar.title` | AR aging & top debtors | _[translate here]_ |
| `common.moreActions` | More actions | _[translate here]_ |
| `actions.copyRow` | Copy row | _[translate here]_ |
| `actions.exportRowCsv` | Export row (CSV) | _[translate here]_ |
| `actions.goToShow` | Go to show | _[translate here]_ |
| `actions.openCosts` | Open costs | _[translate here]_ |
| `shows.table.route` | Route | _[translate here]_ |
| `finance.targets.title` | Targets | _[translate here]_ |
| `finance.targets.revenue` | Revenue target | _[translate here]_ |
| `finance.targets.net` | Net target | _[translate here]_ |
| `finance.targets.hint` | Targets are local to this device for now. | _[translate here]_ |
| `finance.targets.noNegative` | Targets cannot be negative | _[translate here]_ |
| `filters.title` | Filters | _[translate here]_ |
| `filters.region` | Region | _[translate here]_ |
| `filters.from` | From | _[translate here]_ |
| `filters.to` | To | _[translate here]_ |
| `filters.currency` | Currency | _[translate here]_ |
| `filters.presentation` | Presentation mode | _[translate here]_ |
| `filters.shortcutHint` | Ctrl/Cmd+K – open filters | _[translate here]_ |
| `filters.appliedRange` | Applied range | _[translate here]_ |
| `layout.team` | Team | _[translate here]_ |
| `layout.highContrast` | High Contrast | _[translate here]_ |
| `layout.tenant` | Tenant | _[translate here]_ |
| `access.readOnly` | read-only | _[translate here]_ |
| `layout.viewingAs` | Viewing as | _[translate here]_ |
| `layout.viewAsExit` | Exit | _[translate here]_ |
| `access.readOnly.tooltip` | Finance exports disabled for agency demo | _[translate here]_ |
| `lab.drag` | Drag | _[translate here]_ |
| `lab.moveUp` | Move up | _[translate here]_ |
| `lab.moveDown` | Move down | _[translate here]_ |
| `lab.reset` | Reset to template | _[translate here]_ |
| `lab.back` | Back to Dashboard | _[translate here]_ |
| `lab.layoutName` | Layout name | _[translate here]_ |
| `lab.save` | Save layout | _[translate here]_ |
| `lab.apply` | Apply… | _[translate here]_ |
| `lab.delete` | Delete… | _[translate here]_ |
| `lab.export` | Export | _[translate here]_ |
| `lab.import` | Import | _[translate here]_ |
| `lab.dropHere` | Drop widgets here | _[translate here]_ |
| `lab.header` | Mission Control Lab | _[translate here]_ |
| `lab.subheader` | Drag, reorder, and resize dashboard widgets. Experimental. | _[translate here]_ |
| `lab.template` | Template | _[translate here]_ |
| `lab.resetToTemplate` | Reset to template | _[translate here]_ |
| `lab.backToDashboard` | Back to Dashboard | _[translate here]_ |
| `lab.applySaved` | Apply… | _[translate here]_ |
| `lab.deleteSaved` | Delete… | _[translate here]_ |
| `dashboard.title` | Tour Command Center | _[translate here]_ |
| `dashboard.subtitle` | Monitor your tour performance, mission status, and take action on what matters most | _[translate here]_ |
| `dashboard.map.title` | Tour Map | _[translate here]_ |
| `dashboard.activity.title` | Recent Activity | _[translate here]_ |
| `dashboard.actions.title` | Quick Actions | _[translate here]_ |
| `dashboard.actions.newShow` | Add New Show | _[translate here]_ |
| `dashboard.actions.quickFinance` | Quick Finance Check | _[translate here]_ |
| `dashboard.actions.travelBooking` | Book Travel | _[translate here]_ |
| `dashboard.areas.finance.title` | Finance | _[translate here]_ |
| `dashboard.areas.finance.description` | Track revenue, costs, and profitability | _[translate here]_ |
| `dashboard.areas.shows.title` | Shows & Events | _[translate here]_ |
| `dashboard.areas.shows.description` | Manage performances and venues | _[translate here]_ |
| `dashboard.areas.travel.title` | Travel & Logistics | _[translate here]_ |
| `dashboard.areas.travel.description` | Plan and track travel arrangements | _[translate here]_ |
| `dashboard.areas.missionControl.title` | Mission Control Lab | _[translate here]_ |
| `dashboard.areas.missionControl.description` | Advanced mission control with customizable widgets | _[translate here]_ |
| `dashboard.kpi.financialHealth` | Financial Health | _[translate here]_ |
| `dashboard.kpi.nextEvent` | Next Critical Event | _[translate here]_ |
| `dashboard.kpi.ticketSales` | Ticket Sales | _[translate here]_ |
| `actions.toast.export` | Export copied | _[translate here]_ |
| `actions.import.prompt` | Paste Lab layouts JSON | _[translate here]_ |
| `actions.toast.imported` | Imported | _[translate here]_ |
| `actions.toast.import_invalid` | Invalid JSON | _[translate here]_ |
| `actions.newArtist` | New artist | _[translate here]_ |
| `actions.connectExisting` | Connect existing | _[translate here]_ |
| `actions.editScopes` | Edit scopes | _[translate here]_ |
| `actions.revoke` | Revoke | _[translate here]_ |
| `actions.exportPdf` | Export PDF | _[translate here]_ |
| `branding.uploadLogo` | Upload logo | _[translate here]_ |
| `branding.editColors` | Edit colors | _[translate here]_ |
| `common.upload` | Upload | _[translate here]_ |
| `common.newFolder` | New folder | _[translate here]_ |
| `live.up` | up | _[translate here]_ |
| `live.down` | down | _[translate here]_ |
| `live.flat` | flat | _[translate here]_ |
| `nav.profile` | Profile | _[translate here]_ |
| `nav.changeOrg` | Change organization | _[translate here]_ |
| `nav.logout` | Logout | _[translate here]_ |
| `profile.title` | Profile | _[translate here]_ |
| `profile.personal` | Personal | _[translate here]_ |
| `profile.security` | Security | _[translate here]_ |
| `profile.notifications` | Notifications | _[translate here]_ |
| `profile.save` | Save | _[translate here]_ |
| `profile.saved` | Saved ✓ | _[translate here]_ |
| `profile.avatarUrl` | Avatar URL | _[translate here]_ |
| `profile.bio` | Bio | _[translate here]_ |
| `profile.notify.email` | Email updates | _[translate here]_ |
| `profile.notify.slack` | Slack notifications | _[translate here]_ |
| `profile.notify.hint` | These preferences affect demo notifications only | _[translate here]_ |
| `profile.memberships` | Memberships | _[translate here]_ |
| `profile.defaultOrg` | Default organization | _[translate here]_ |
| `profile.setDefault` | Set default | _[translate here]_ |
| `profile.dataPrivacy` | Data & privacy | _[translate here]_ |
| `profile.exportData` | Export my demo data | _[translate here]_ |
| `profile.clearData` | Clear and reseed demo data | _[translate here]_ |
| `profile.export.ready` | Data export ready | _[translate here]_ |
| `profile.error.name` | Name is required | _[translate here]_ |
| `profile.error.email` | Email is required | _[translate here]_ |
| `prefs.title` | Preferences | _[translate here]_ |
| `prefs.appearance` | Appearance | _[translate here]_ |
| `prefs.language` | Language | _[translate here]_ |
| `prefs.theme` | Theme | _[translate here]_ |
| `prefs.highContrast` | High contrast | _[translate here]_ |
| `prefs.finance.currency` | Currency | _[translate here]_ |
| `prefs.units` | Distance units | _[translate here]_ |
| `prefs.presentation` | Presentation mode | _[translate here]_ |
| `prefs.comparePrev` | Compare vs previous | _[translate here]_ |
| `prefs.defaultRegion` | Default region | _[translate here]_ |
| `prefs.defaultStatuses` | Default statuses | _[translate here]_ |
| `prefs.help.language` | Affects labels and date/number formatting. | _[translate here]_ |
| `prefs.help.theme` | Choose light or dark based on your environment. | _[translate here]_ |
| `prefs.help.highContrast` | Improves contrast and focus rings for readability. | _[translate here]_ |
| `prefs.help.currency` | Sets default currency for dashboards and exports. | _[translate here]_ |
| `prefs.help.units` | Used for travel distances and map overlays. | _[translate here]_ |
| `prefs.help.presentation` | Larger text, simplified animations for demos. | _[translate here]_ |
| `prefs.help.comparePrev` | Shows deltas against the previous period. | _[translate here]_ |
| `prefs.help.region` | Preselects region filters in dashboards. | _[translate here]_ |
| `subnav.ariaLabel` | Sections | _[translate here]_ |
| `breadcrumb.home` | Home | _[translate here]_ |
| `home.seo.title` | On Tour App - Tour Management & Finance Dashboard | _[translate here]_ |
| `home.seo.description` | Professional tour management platform with real-time finance tracking, venue booking, and performance analytics for artists and managers. | _[translate here]_ |
| `home.seo.keywords` | tour management, concert booking, artist finance, venue management, performance analytics, live music | _[translate here]_ |
| `comparison.title` | From Spreadsheet Chaos to App Clarity | _[translate here]_ |
| `comparison.subtitle` | See how your tour management evolves from fragmented Excel files to a unified, intelligent platform. | _[translate here]_ |
| `comparison.excel.title` | Excel Chaos | _[translate here]_ |
| `comparison.excel.problem1` | Scattered files across devices and emails | _[translate here]_ |
| `comparison.excel.problem2` | Manual calculations prone to errors | _[translate here]_ |
| `comparison.excel.problem3` | No real-time collaboration or notifications | _[translate here]_ |
| `comparison.excel.problem4` | Lost context in endless tabs and comments | _[translate here]_ |
| `comparison.app.title` | App Clarity | _[translate here]_ |
| `comparison.app.benefit1` | Unified dashboard with live data sync | _[translate here]_ |
| `comparison.app.benefit2` | Automated calculations and error detection | _[translate here]_ |
| `comparison.app.benefit3` | Real-time collaboration and smart notifications | _[translate here]_ |
| `comparison.app.benefit4` | Context-aware insights and predictive alerts | _[translate here]_ |
| `comparison.benefit1.title` | Smart Finance Tracking | _[translate here]_ |
| `comparison.benefit1.desc` | Automatic profit calculations, cost analysis, and budget alerts. | _[translate here]_ |
| `comparison.benefit2.title` | Live Tour Mapping | _[translate here]_ |
| `comparison.benefit2.desc` | Interactive maps with route optimization and venue intelligence. | _[translate here]_ |
| `comparison.benefit3.title` | Instant Insights | _[translate here]_ |
| `comparison.benefit3.desc` | AI-powered recommendations and risk detection in real-time. | _[translate here]_ |
| `metamorphosis.title` | From scattered noise to a living control panel | _[translate here]_ |
| `metamorphosis.subtitle` | Instead of spreadsheets mutating chaotically and critical context buried in comments, every data point flows into a single orchestrated surface. The system reconciles, validates, and highlights what matters. | _[translate here]_ |
| `dashboard.offerConfirmed` | Offer → Confirmed | _[translate here]_ |
| `dashboard.tourHealthScore` | Tour Health Score | _[translate here]_ |
| `dashboard.healthFactors` | Health Factors | _[translate here]_ |
| `dashboard.keyInsights` | Key Insights | _[translate here]_ |
| `dashboard.confidence` | Confidence | _[translate here]_ |
| `dashboard.current` | Current | _[translate here]_ |
| `dashboard.predicted` | Predicted | _[translate here]_ |
| `dashboard.expectedChange` | Expected change | _[translate here]_ |
| `dashboard.scheduleGap` | Schedule gap | _[translate here]_ |
| `dashboard.allSystemsReady` | All systems ready | _[translate here]_ |
| `dashboard.loadingMap` | Loading map… | _[translate here]_ |
| `placeholder.username` | you@example.com or username | _[translate here]_ |
| `placeholder.bio` | Tell us a bit about yourself and what you do... | _[translate here]_ |
| `placeholder.cityName` | Enter city name... | _[translate here]_ |
| `placeholder.notes` | Add any additional notes... | _[translate here]_ |
| `placeholder.searchCommand` | Search shows, navigate, or type a command... | _[translate here]_ |
| `placeholder.expenseDescription` | e.g., Flight tickets, Hotel booking... | _[translate here]_ |
| `placeholder.expenseDetails` | Add any additional details, invoice numbers, or context... | _[translate here]_ |
| `placeholder.origin` | Origin (e.g., BCN) | _[translate here]_ |
| `placeholder.destination` | Destination (e.g., AMS) | _[translate here]_ |
| `placeholder.bookingRef` | Booking reference or flight number | _[translate here]_ |
| `placeholder.airport` | City or airport... | _[translate here]_ |

## PT - 1155 Missing Translations

**Translation guidelines:**
- Keep technical terms consistent (e.g., "show", "fee", "status")
- Match tone: professional but friendly
- Consider context: these appear in UI buttons, labels, and messages
- Preserve placeholders: `{name}`, `{count}`, etc.

### Quick Copy Format (for src/lib/i18n.ts)

```typescript
    , 'scopes.tooltip.shows': '' // TODO: translate "Shows access granted by link"
    , 'scopes.tooltip.travel': '' // TODO: translate "Travel access granted by link"
    , 'scopes.tooltip.finance': '' // TODO: translate "Finance: read-only per link policy"
    , 'kpi.shows': '' // TODO: translate "Shows"
    , 'kpi.net': '' // TODO: translate "Net"
    , 'kpi.travel': '' // TODO: translate "Travel"
    , 'cmd.go.profile': '' // TODO: translate "Go to profile"
    , 'cmd.go.preferences': '' // TODO: translate "Go to preferences"
    , 'common.copyLink': '' // TODO: translate "Copy link"
    , 'common.learnMore': '' // TODO: translate "Learn more"
    , 'insights.thisMonthTotal': '' // TODO: translate "This Month Total"
    , 'insights.statusBreakdown': '' // TODO: translate "Status breakdown"
    , 'insights.upcoming14d': '' // TODO: translate "Upcoming 14d"
    , 'common.openShow': '' // TODO: translate "Open show"
    , 'common.centerMap': '' // TODO: translate "Center map"
    , 'common.dismiss': '' // TODO: translate "Dismiss"
    , 'common.snooze7': '' // TODO: translate "Snooze 7 days"
    , 'common.snooze30': '' // TODO: translate "Snooze 30 days"
    , 'common.on': '' // TODO: translate "on"
    , 'common.off': '' // TODO: translate "off"
    , 'common.hide': '' // TODO: translate "Hide"
    , 'common.pin': '' // TODO: translate "Pin"
    , 'common.unpin': '' // TODO: translate "Unpin"
    , 'common.map': '' // TODO: translate "Map"
    , 'layout.invite': '' // TODO: translate "Invite"
    , 'layout.build': '' // TODO: translate "Build: preview"
    , 'layout.demo': '' // TODO: translate "Status: demo feed"
    , 'alerts.title': '' // TODO: translate "Alert Center"
    , 'alerts.anySeverity': '' // TODO: translate "Any severity"
    , 'alerts.anyRegion': '' // TODO: translate "Any region"
    , 'alerts.anyTeam': '' // TODO: translate "Any team"
    , 'alerts.copySlack': '' // TODO: translate "Copy Slack"
    , 'alerts.copied': '' // TODO: translate "Copied \u2713"
    , 'alerts.noAlerts': '' // TODO: translate "No alerts"
    , 'map.openInDashboard': '' // TODO: translate "Open in dashboard"
    , 'auth.login': '' // TODO: translate "Login"
    , 'auth.chooseUser': '' // TODO: translate "Choose a demo user"
    , 'auth.enterAs': '' // TODO: translate "Enter as {name}"
    , 'auth.role.owner': '' // TODO: translate "Artist (Owner)"
    , 'auth.role.agencyManager': '' // TODO: translate "Agency Manager"
    , 'auth.role.artistManager': '' // TODO: translate "Artist Team (Manager)"
    , 'auth.scope.finance.ro': '' // TODO: translate "Finance: read-only"
    , 'auth.scope.edit.showsTravel': '' // TODO: translate "Edit shows/travel"
    , 'auth.scope.full': '' // TODO: translate "Full access"
    , 'login.title': '' // TODO: translate "Welcome to On Tour"
    , 'login.subtitle': '' // TODO: translate "Your tour management command center"
    , 'login.enterAs': '' // TODO: translate "Enter as {name}"
    , 'login.quick.agency': '' // TODO: translate "Enter as Shalizi (agency)"
    , 'login.quick.artist': '' // TODO: translate "Enter as Danny (artist)"
    , 'login.remember': '' // TODO: translate "Remember me"
    , 'login.usernameOrEmail': '' // TODO: translate "Username or Email"
    , 'role.agencyManager': '' // TODO: translate "Agency Manager"
    , 'role.artistOwner': '' // TODO: translate "Artist (Owner)"
    , 'role.artistManager': '' // TODO: translate "Artist Team (Manager)"
    , 'scope.shows.write': '' // TODO: translate "shows: write"
    , 'scope.shows.read': '' // TODO: translate "shows: read"
    , 'scope.travel.book': '' // TODO: translate "travel: book"
    , 'scope.travel.read': '' // TODO: translate "travel: read"
    , 'scope.finance.read': '' // TODO: translate "finance: read"
    , 'scope.finance.none': '' // TODO: translate "finance: none"
    , 'hero.enter': '' // TODO: translate "Enter"
    , 'marketing.nav.features': '' // TODO: translate "Features"
    , 'marketing.nav.product': '' // TODO: translate "Product"
    , 'marketing.nav.pricing': '' // TODO: translate "Pricing"
    , 'marketing.nav.testimonials': '' // TODO: translate "Testimonials"
    , 'marketing.nav.cta': '' // TODO: translate "Get started"
    , 'marketing.cta.primary': '' // TODO: translate "Start free"
    , 'marketing.cta.secondary': '' // TODO: translate "Watch demo"
    , 'marketing.cta.login': '' // TODO: translate "Log in"
    , 'hero.demo.artist': '' // TODO: translate "View demo as Danny"
    , 'hero.demo.agency': '' // TODO: translate "View demo as Adam"
    , 'hero.persona.question': '' // TODO: translate "I am a..."
    , 'hero.persona.artist': '' // TODO: translate "Artist / Manager"
    , 'hero.persona.agency': '' // TODO: translate "Agency"
    , 'hero.subtitle.artist': '' // TODO: translate "Take control of your finances and tour logistics. See your career from a single dashboard."
    , 'hero.subtitle.agency': '' // TODO: translate "Manage your entire roster from one place. Give your artists visibility and generate reports in seconds."
    , 'home.action.title': '' // TODO: translate "Stop Surviving. Start Commanding."
    , 'home.action.subtitle': '' // TODO: translate "See how On Tour App can transform your next tour."
    , 'home.action.cta': '' // TODO: translate "Request a Personalized Demo"
    , 'inside.map.desc.artist': '' // TODO: translate "Visualize your tour route and anticipate travel needs"
    , 'inside.finance.desc.artist': '' // TODO: translate "Track your earnings, expenses and profitability in real-time"
    , 'inside.actions.desc.artist': '' // TODO: translate "Stay on top of contracts, payments and upcoming deadlines"
    , 'inside.map.desc.agency': '' // TODO: translate "Monitor all your artists\"
    , 'inside.finance.desc.agency': '' // TODO: translate "Consolidated financial overview across your entire roster"
    , 'inside.actions.desc.agency': '' // TODO: translate "Centralized task management for team coordination and client updates"
    , 'inside.title': '' // TODO: translate "What you"
    , 'shows.summary.avgFee': '' // TODO: translate "Avg Fee"
    , 'shows.summary.avgMargin': '' // TODO: translate "Avg Margin"
    , 'inside.map.title': '' // TODO: translate "Map"
    , 'inside.map.desc': '' // TODO: translate "Live HUD with shows, route and risks"
    , 'inside.finance.title': '' // TODO: translate "Finance"
    , 'inside.finance.desc': '' // TODO: translate "Monthly KPIs, pipeline and forecast"
    , 'inside.actions.title': '' // TODO: translate "Actions"
    , 'inside.actions.desc': '' // TODO: translate "Action Hub with priorities and shortcuts"
    , 'how.title': '' // TODO: translate "How it works"
    , 'how.step.invite': '' // TODO: translate "Invite your team"
    , 'how.step.connect': '' // TODO: translate "Connect with artists or agencies"
    , 'how.step.views': '' // TODO: translate "Work by views: HUD, Finance, Shows"
    , 'how.step.connectData': '' // TODO: translate "Connect your data"
    , 'how.step.connectData.desc': '' // TODO: translate "Import shows, connect calendar, or get invited by your agency"
    , 'how.step.visualize': '' // TODO: translate "Visualize your world"
    , 'how.step.visualize.desc': '' // TODO: translate "Your tour comes alive on the map, finances clarify in the dashboard"
    , 'how.step.act': '' // TODO: translate "Act with intelligence"
    , 'how.step.connectData.artist': '' // TODO: translate "Import your shows, connect your calendar, or get invited by your agency. Your tour data in one place."
    , 'how.step.connectData.agency': '' // TODO: translate "Invite your artists and connect their data. Centralize all tour information across your roster."
    , 'how.step.visualize.artist': '' // TODO: translate "Your tour comes alive on the map, finances clarify in your personal dashboard. See your career at a glance."
    , 'how.step.visualize.agency': '' // TODO: translate "Monitor all artists\"
    , 'how.step.act.artist': '' // TODO: translate "Receive proactive alerts about contracts, payments, and deadlines. Make data-driven decisions with confidence."
    , 'how.step.act.agency': '' // TODO: translate "Prioritize team tasks, generate reports instantly, and keep all stakeholders informed with real-time updates."
    , 'how.multiTenant': '' // TODO: translate "Multi-tenant demo: switch between Agency and Artist contexts"
    , 'trust.privacy': '' // TODO: translate "Privacy: local demo (your browser)"
    , 'trust.accessibility': '' // TODO: translate "Accessibility: shortcuts “?”"
    , 'trust.support': '' // TODO: translate "Support"
    , 'trust.demo': '' // TODO: translate "Local demo — no data uploaded"
    , 'testimonials.title': '' // TODO: translate "Trusted by Industry Leaders"
    , 'testimonials.subtitle': '' // TODO: translate "Real stories from the touring industry"
    , 'testimonials.subtitle.artist': '' // TODO: translate "See how artists are taking control of their careers"
    , 'testimonials.subtitle.agency': '' // TODO: translate "Discover how agencies are transforming their operations"
    , 'common.skipToContent': '' // TODO: translate "Skip to content"
    , 'alerts.slackCopied': '' // TODO: translate "Slack payload copied"
    , 'alerts.copyManual': '' // TODO: translate "Open window to copy manually"
    , 'ah.title': '' // TODO: translate "Action Hub"
    , 'ah.tab.pending': '' // TODO: translate "Pending"
    , 'ah.tab.shows': '' // TODO: translate "This Month"
    , 'ah.tab.travel': '' // TODO: translate "Travel"
    , 'ah.tab.insights': '' // TODO: translate "Insights"
    , 'ah.filter.all': '' // TODO: translate "All"
    , 'ah.filter.risk': '' // TODO: translate "Risk"
    , 'ah.filter.urgency': '' // TODO: translate "Urgency"
    , 'ah.filter.opportunity': '' // TODO: translate "Opportunity"
    , 'ah.filter.offer': '' // TODO: translate "Offer"
    , 'ah.filter.finrisk': '' // TODO: translate "Finrisk"
    , 'ah.cta.addTravel': '' // TODO: translate "Add travel"
    , 'ah.cta.followUp': '' // TODO: translate "Follow up"
    , 'ah.cta.review': '' // TODO: translate "Review"
    , 'ah.cta.open': '' // TODO: translate "Open"
    , 'ah.empty': '' // TODO: translate "All caught up!"
    , 'ah.openTravel': '' // TODO: translate "Open Travel"
    , 'ah.done': '' // TODO: translate "Done"
    , 'ah.typeFilter': '' // TODO: translate "Type filter"
    , 'ah.why': '' // TODO: translate "Why?"
    , 'ah.why.title': '' // TODO: translate "Why this priority?"
    , 'ah.why.score': '' // TODO: translate "Score"
    , 'ah.why.impact': '' // TODO: translate "Impact"
    , 'ah.why.amount': '' // TODO: translate "Amount"
    , 'ah.why.inDays': '' // TODO: translate "In"
    , 'ah.why.overdue': '' // TODO: translate "Overdue"
    , 'ah.why.kind': '' // TODO: translate "Type"
    , 'finance.quicklook': '' // TODO: translate "Finance Quicklook"
    , 'finance.ledger': '' // TODO: translate "Ledger"
    , 'finance.targets': '' // TODO: translate "Targets"
    , 'finance.targets.month': '' // TODO: translate "Monthly targets"
    , 'finance.targets.year': '' // TODO: translate "Yearly targets"
    , 'finance.pipeline': '' // TODO: translate "Pipeline"
    , 'finance.pipeline.subtitle': '' // TODO: translate "Expected value (weighted by stage)"
    , 'finance.openFull': '' // TODO: translate "Open full finance"
    , 'finance.pivot': '' // TODO: translate "Pivot"
    , 'finance.pivot.group': '' // TODO: translate "Group"
    , 'finance.ar.view': '' // TODO: translate "View"
    , 'finance.ar.remind': '' // TODO: translate "Remind"
    , 'finance.ar.reminder.queued': '' // TODO: translate "Reminder queued"
    , 'finance.thisMonth': '' // TODO: translate "This Month"
    , 'finance.income': '' // TODO: translate "Income"
    , 'finance.expenses': '' // TODO: translate "Expenses"
    , 'finance.net': '' // TODO: translate "Net"
    , 'finance.byStatus': '' // TODO: translate "By status"
    , 'finance.byMonth': '' // TODO: translate "by month"
    , 'finance.confirmed': '' // TODO: translate "Confirmed"
    , 'finance.pending': '' // TODO: translate "Pending"
    , 'finance.compare': '' // TODO: translate "Compare prev"
    , 'charts.resetZoom': '' // TODO: translate "Reset zoom"
    , 'common.current': '' // TODO: translate "Current"
    , 'common.compare': '' // TODO: translate "Compare"
    , 'common.reminder': '' // TODO: translate "Reminder"
    , 'finance.ui.view': '' // TODO: translate "View"
    , 'finance.ui.classic': '' // TODO: translate "Classic"
    , 'finance.ui.beta': '' // TODO: translate "New (beta)"
    , 'finance.offer': '' // TODO: translate "Offer"
    , 'finance.shows': '' // TODO: translate "shows"
    , 'finance.noShowsMonth': '' // TODO: translate "No shows this month"
    , 'finance.hideAmounts': '' // TODO: translate "Hide amounts"
    , 'finance.hidden': '' // TODO: translate "Hidden"
    , 'common.open': '' // TODO: translate "Open"
    , 'common.apply': '' // TODO: translate "Apply"
    , 'common.saveView': '' // TODO: translate "Save view"
    , 'common.import': '' // TODO: translate "Import"
    , 'common.export': '' // TODO: translate "Export"
    , 'common.copied': '' // TODO: translate "Copied ✓"
    , 'common.markDone': '' // TODO: translate "Mark done"
    , 'common.hideItem': '' // TODO: translate "Hide"
    , 'views.import.invalidShape': '' // TODO: translate "Invalid views JSON shape"
    , 'views.import.invalidJson': '' // TODO: translate "Invalid JSON"
    , 'common.tomorrow': '' // TODO: translate "Tomorrow"
    , 'common.go': '' // TODO: translate "Go"
    , 'common.show': '' // TODO: translate "Show"
    , 'common.search': '' // TODO: translate "Search"
    , 'hud.next3weeks': '' // TODO: translate "Next 3 weeks"
    , 'hud.noTrips3weeks': '' // TODO: translate "No upcoming trips in 3 weeks"
    , 'hud.openShow': '' // TODO: translate "open show"
    , 'hud.openTrip': '' // TODO: translate "open travel"
    , 'hud.view.whatsnext': '' // TODO: translate "What"
    , 'hud.view.month': '' // TODO: translate "This Month"
    , 'hud.view.financials': '' // TODO: translate "Financials"
    , 'hud.view.whatsnext.desc': '' // TODO: translate "Upcoming 14 day summary"
    , 'hud.view.month.desc': '' // TODO: translate "Monthly financial & show snapshot"
    , 'hud.view.financials.desc': '' // TODO: translate "Financial intelligence breakdown"
    , 'hud.layer.heat': '' // TODO: translate "Heat"
    , 'hud.layer.status': '' // TODO: translate "Status"
    , 'hud.layer.route': '' // TODO: translate "Route"
    , 'hud.views': '' // TODO: translate "HUD views"
    , 'hud.layers': '' // TODO: translate "Map layers"
    , 'hud.missionControl': '' // TODO: translate "Mission Control"
    , 'hud.subtitle': '' // TODO: translate "Realtime map and upcoming shows"
    , 'hud.risks': '' // TODO: translate "Risks"
    , 'hud.assignProducer': '' // TODO: translate "Assign producer"
    , 'hud.mapLoadError': '' // TODO: translate "Map failed to load. Please retry."
    , 'common.retry': '' // TODO: translate "Retry"
    , 'hud.viewChanged': '' // TODO: translate "View changed to"
    , 'hud.openEvent': '' // TODO: translate "open event"
    , 'hud.type.flight': '' // TODO: translate "Flight"
    , 'hud.type.ground': '' // TODO: translate "Ground"
    , 'hud.type.event': '' // TODO: translate "Event"
    , 'hud.fin.avgNetMonth': '' // TODO: translate "Avg Net (Month)"
    , 'hud.fin.runRateYear': '' // TODO: translate "Run Rate (Year)"
    , 'finance.forecast': '' // TODO: translate "Forecast vs Actual"
    , 'finance.forecast.legend.actual': '' // TODO: translate "Actual net"
    , 'finance.forecast.legend.p50': '' // TODO: translate "Forecast p50"
    , 'finance.forecast.legend.band': '' // TODO: translate "Confidence band"
    , 'finance.forecast.alert.under': '' // TODO: translate "Under forecast by"
    , 'finance.forecast.alert.above': '' // TODO: translate "Above optimistic by"
    , 'map.toggle.status': '' // TODO: translate "Toggle status markers"
    , 'map.toggle.route': '' // TODO: translate "Toggle route line"
    , 'map.toggle.heat': '' // TODO: translate "Toggle heat circles"
    , 'shows.exportCsv': '' // TODO: translate "Export CSV"
    , 'shows.filters.from': '' // TODO: translate "From"
    , 'shows.filters.to': '' // TODO: translate "To"
    , 'shows.items': '' // TODO: translate "items"
    , 'shows.date.presets': '' // TODO: translate "Presets"
    , 'shows.date.thisMonth': '' // TODO: translate "This Month"
    , 'shows.date.nextMonth': '' // TODO: translate "Next Month"
    , 'shows.tooltip.net': '' // TODO: translate "Fee minus WHT, commissions, and costs"
    , 'shows.tooltip.margin': '' // TODO: translate "Net divided by Fee (%)"
    , 'shows.table.margin': '' // TODO: translate "Margin %"
    , 'shows.editor.margin.formula': '' // TODO: translate "Margin % = Net/Fee"
    , 'shows.tooltip.wht': '' // TODO: translate "Withholding tax percentage applied to the fee"
    , 'shows.editor.label.name': '' // TODO: translate "Show name"
    , 'shows.editor.placeholder.name': '' // TODO: translate "Festival or show name"
    , 'shows.editor.placeholder.venue': '' // TODO: translate "Venue name"
    , 'shows.editor.help.venue': '' // TODO: translate "Optional venue / room name"
    , 'shows.editor.help.fee': '' // TODO: translate "Gross fee agreed (before taxes, commissions, costs)"
    , 'shows.editor.help.wht': '' // TODO: translate "Local withholding tax percentage (auto-suggested by country)"
    , 'shows.editor.saving': '' // TODO: translate "Saving…"
    , 'shows.editor.saved': '' // TODO: translate "Saved ✓"
    , 'shows.editor.save.error': '' // TODO: translate "Save failed"
    , 'shows.editor.cost.templates': '' // TODO: translate "Templates"
    , 'shows.editor.cost.addTemplate': '' // TODO: translate "Add template"
    , 'shows.editor.cost.subtotals': '' // TODO: translate "Subtotals"
    , 'shows.editor.cost.type': '' // TODO: translate "Type"
    , 'shows.editor.cost.amount': '' // TODO: translate "Amount"
    , 'shows.editor.cost.desc': '' // TODO: translate "Description"
    , 'shows.editor.status.help': '' // TODO: translate "Current lifecycle state of the show"
    , 'shows.editor.cost.template.travel': '' // TODO: translate "Travel basics"
    , 'shows.editor.cost.template.production': '' // TODO: translate "Production basics"
    , 'shows.editor.cost.template.marketing': '' // TODO: translate "Marketing basics"
    , 'shows.editor.quick.label': '' // TODO: translate "Quick add costs"
    , 'shows.editor.quick.hint': '' // TODO: translate "e.g., Hotel 1200"
    , 'shows.editor.quick.placeholder': '' // TODO: translate "20/04/2025 "
    , 'shows.editor.quick.preview.summary': '' // TODO: translate "Will set: {fields}"
    , 'shows.editor.quick.apply': '' // TODO: translate "Apply"
    , 'shows.editor.quick.parseError': '' // TODO: translate "Cannot interpret"
    , 'shows.editor.quick.applied': '' // TODO: translate "Quick entry applied"
    , 'shows.editor.bulk.title': '' // TODO: translate "Bulk add costs"
    , 'shows.editor.bulk.open': '' // TODO: translate "Bulk add"
    , 'shows.editor.bulk.placeholder': '' // TODO: translate "Type, Amount, Description\nTravel, 1200, Flights BCN-MAD\nProduction\t500\tBackline"
    , 'shows.editor.bulk.preview': '' // TODO: translate "Preview"
    , 'shows.editor.bulk.parsed': '' // TODO: translate "Parsed {count} lines"
    , 'shows.editor.bulk.add': '' // TODO: translate "Add costs"
    , 'shows.editor.bulk.cancel': '' // TODO: translate "Cancel"
    , 'shows.editor.bulk.invalidLine': '' // TODO: translate "Invalid line {n}"
    , 'shows.editor.bulk.empty': '' // TODO: translate "No valid lines"
    , 'shows.editor.bulk.help': '' // TODO: translate "Paste CSV or tab-separated lines: Type, Amount, Description (amount optional)"
    , 'shows.editor.restored': '' // TODO: translate "Restored draft"
    , 'shows.editor.quick.icon.date': '' // TODO: translate "Date"
    , 'shows.editor.quick.icon.city': '' // TODO: translate "City"
    , 'shows.editor.quick.icon.country': '' // TODO: translate "Country"
    , 'shows.editor.quick.icon.fee': '' // TODO: translate "Fee"
    , 'shows.editor.quick.icon.whtPct': '' // TODO: translate "WHT %"
    , 'shows.editor.quick.icon.name': '' // TODO: translate "Name"
    , 'shows.editor.cost.templateMenu': '' // TODO: translate "Cost templates"
    , 'shows.editor.cost.template.applied': '' // TODO: translate "Template applied"
    , 'shows.editor.cost.duplicate': '' // TODO: translate "Duplicate"
    , 'shows.editor.cost.moveUp': '' // TODO: translate "Move up"
    , 'shows.editor.cost.moveDown': '' // TODO: translate "Move down"
    , 'shows.editor.costs.title': '' // TODO: translate "Costs"
    , 'shows.editor.costs.empty': '' // TODO: translate "No costs yet — add one"
    , 'shows.editor.costs.recent': '' // TODO: translate "Recent"
    , 'shows.editor.costs.templates': '' // TODO: translate "Templates"
    , 'shows.editor.costs.subtotal': '' // TODO: translate "Subtotal {category}"
    , 'shows.editor.wht.suggest': '' // TODO: translate "Suggest {pct}%"
    , 'shows.editor.wht.apply': '' // TODO: translate "Apply {pct}%"
    , 'shows.editor.wht.suggest.applied': '' // TODO: translate "Suggestion applied"
    , 'shows.editor.wht.tooltip.es': '' // TODO: translate "Typical IRPF in ES: 15% (editable)"
    , 'shows.editor.wht.tooltip.generic': '' // TODO: translate "Typical withholding suggestion"
    , 'shows.editor.status.hint': '' // TODO: translate "Change here or via badge"
    , 'shows.editor.wht.hint.es': '' // TODO: translate "Typical ES withholding: 15% (editable)"
    , 'shows.editor.wht.hint.generic': '' // TODO: translate "Withholding percentage (editable)"
    , 'shows.editor.commission.default': '' // TODO: translate "Default {pct}%"
    , 'shows.editor.commission.overridden': '' // TODO: translate "Override"
    , 'shows.editor.commission.overriddenIndicator': '' // TODO: translate "Commission overridden"
    , 'shows.editor.commission.reset': '' // TODO: translate "Reset to default"
    , 'shows.editor.label.currency': '' // TODO: translate "Currency"
    , 'shows.editor.help.currency': '' // TODO: translate "Contract currency"
    , 'shows.editor.fx.rateOn': '' // TODO: translate "Rate"
    , 'shows.editor.fx.convertedFee': '' // TODO: translate "≈ {amount} {base}"
    , 'shows.editor.fx.unavailable': '' // TODO: translate "Rate unavailable"
    , 'shows.editor.actions.promote': '' // TODO: translate "Promote"
    , 'shows.editor.actions.planTravel': '' // TODO: translate "Plan travel"
    , 'shows.editor.state.hint': '' // TODO: translate "Use the badge or this selector"
    , 'shows.editor.save.create': '' // TODO: translate "Save"
    , 'shows.editor.save.edit': '' // TODO: translate "Save changes"
    , 'shows.editor.save.retry': '' // TODO: translate "Retry"
    , 'shows.editor.tab.active': '' // TODO: translate "Tab {label} active"
    , 'shows.editor.tab.restored': '' // TODO: translate "Restored last tab: {label}"
    , 'shows.editor.errors.count': '' // TODO: translate "There are {n} errors"
    , 'shows.totals.fees': '' // TODO: translate "Fees"
    , 'shows.totals.net': '' // TODO: translate "Net"
    , 'shows.totals.hide': '' // TODO: translate "Hide"
    , 'shows.totals.show': '' // TODO: translate "Show totals"
    , 'shows.view.list': '' // TODO: translate "List"
    , 'shows.view.board': '' // TODO: translate "Board"
    , 'shows.views.none': '' // TODO: translate "Views"
    , 'views.manage': '' // TODO: translate "Manage views"
    , 'views.saved': '' // TODO: translate "Saved"
    , 'views.apply': '' // TODO: translate "Apply"
    , 'views.none': '' // TODO: translate "No saved views"
    , 'views.deleted': '' // TODO: translate "Deleted"
    , 'views.export': '' // TODO: translate "Export"
    , 'views.import': '' // TODO: translate "Import"
    , 'views.import.hint': '' // TODO: translate "Paste JSON of views to import"
    , 'views.openLab': '' // TODO: translate "Open Layout Lab"
    , 'views.share': '' // TODO: translate "Copy share link"
    , 'views.export.copied': '' // TODO: translate "Export copied"
    , 'views.imported': '' // TODO: translate "Views imported"
    , 'views.import.invalid': '' // TODO: translate "Invalid JSON"
    , 'views.label': '' // TODO: translate "View"
    , 'views.names.default': '' // TODO: translate "Default"
    , 'views.names.finance': '' // TODO: translate "Finance"
    , 'views.names.operations': '' // TODO: translate "Operations"
    , 'views.names.promo': '' // TODO: translate "Promotion"
    , 'demo.banner': '' // TODO: translate "Demo data • No live sync"
    , 'demo.load': '' // TODO: translate "Load demo data"
    , 'demo.loaded': '' // TODO: translate "Demo data loaded"
    , 'demo.clear': '' // TODO: translate "Clear data"
    , 'demo.cleared': '' // TODO: translate "All data cleared"
    , 'demo.password.prompt': '' // TODO: translate "Enter demo password"
    , 'demo.password.invalid': '' // TODO: translate "Incorrect password"
    , 'shows.views.delete': '' // TODO: translate "Delete"
    , 'shows.views.namePlaceholder': '' // TODO: translate "View name"
    , 'shows.views.save': '' // TODO: translate "Save"
    , 'shows.status.canceled': '' // TODO: translate "Canceled"
    , 'shows.status.archived': '' // TODO: translate "Archived"
    , 'shows.status.offer': '' // TODO: translate "Offer"
    , 'shows.status.pending': '' // TODO: translate "Pending"
    , 'shows.status.confirmed': '' // TODO: translate "Confirmed"
    , 'shows.status.postponed': '' // TODO: translate "Postponed"
    , 'shows.bulk.selected': '' // TODO: translate "selected"
    , 'shows.bulk.confirm': '' // TODO: translate "Confirm"
    , 'shows.bulk.promote': '' // TODO: translate "Promote"
    , 'shows.bulk.export': '' // TODO: translate "Export"
    , 'shows.notes': '' // TODO: translate "Notes"
    , 'shows.virtualized.hint': '' // TODO: translate "Virtualized list active"
    , 'story.title': '' // TODO: translate "Story mode"
    , 'story.timeline': '' // TODO: translate "Timeline"
    , 'story.play': '' // TODO: translate "Play"
    , 'story.pause': '' // TODO: translate "Pause"
    , 'story.cta': '' // TODO: translate "Story mode"
    , 'story.scrub': '' // TODO: translate "Scrub timeline"
    , 'finance.overview': '' // TODO: translate "Finance overview"
    , 'shows.title': '' // TODO: translate "Shows"
    , 'shows.notFound': '' // TODO: translate "Show not found"
    , 'shows.search.placeholder': '' // TODO: translate "Search city/country"
    , 'shows.add': '' // TODO: translate "Add show"
    , 'shows.edit': '' // TODO: translate "Edit"
    , 'shows.summary.upcoming': '' // TODO: translate "Upcoming"
    , 'shows.summary.totalFees': '' // TODO: translate "Total Fees"
    , 'shows.summary.estNet': '' // TODO: translate "Est. Net"
    , 'shows.summary.avgWht': '' // TODO: translate "Avg WHT"
    , 'shows.table.date': '' // TODO: translate "Date"
    , 'shows.table.name': '' // TODO: translate "Show"
    , 'shows.table.city': '' // TODO: translate "City"
    , 'shows.table.country': '' // TODO: translate "Country"
    , 'shows.table.venue': '' // TODO: translate "Venue"
    , 'shows.table.promoter': '' // TODO: translate "Promoter"
    , 'shows.table.wht': '' // TODO: translate "WHT %"
    , 'shows.table.type': '' // TODO: translate "Type"
    , 'shows.table.description': '' // TODO: translate "Description"
    , 'shows.table.amount': '' // TODO: translate "Amount"
    , 'shows.table.remove': '' // TODO: translate "Remove"
    , 'shows.table.agency.mgmt': '' // TODO: translate "Mgmt"
    , 'shows.table.agency.booking': '' // TODO: translate "Booking"
    , 'shows.table.agencies': '' // TODO: translate "Agencies"
    , 'shows.table.notes': '' // TODO: translate "Notes"
    , 'shows.table.fee': '' // TODO: translate "Fee"
    , 'shows.selected': '' // TODO: translate "selected"
    , 'shows.count.singular': '' // TODO: translate "show"
    , 'shows.count.plural': '' // TODO: translate "shows"
    , 'settings.title': '' // TODO: translate "Settings"
    , 'settings.personal': '' // TODO: translate "Personal"
    , 'settings.preferences': '' // TODO: translate "Preferences"
    , 'settings.organization': '' // TODO: translate "Organization"
    , 'settings.billing': '' // TODO: translate "Billing"
    , 'settings.currency': '' // TODO: translate "Currency"
    , 'settings.units': '' // TODO: translate "Distance units"
    , 'settings.agencies': '' // TODO: translate "Agencies"
    , 'settings.localNote': '' // TODO: translate "Preferences are saved locally on this device."
    , 'settings.language': '' // TODO: translate "Language"
    , 'settings.language.en': '' // TODO: translate "English"
    , 'settings.language.es': '' // TODO: translate "Spanish"
    , 'settings.dashboardView': '' // TODO: translate "Default Dashboard View"
    , 'settings.presentation': '' // TODO: translate "Presentation mode"
    , 'settings.comparePrev': '' // TODO: translate "Compare vs previous period"
    , 'settings.defaultStatuses': '' // TODO: translate "Default status filters"
    , 'settings.defaultRegion': '' // TODO: translate "Default region"
    , 'settings.region.all': '' // TODO: translate "All"
    , 'settings.region.AMER': '' // TODO: translate "Americas"
    , 'settings.region.EMEA': '' // TODO: translate "EMEA"
    , 'settings.region.APAC': '' // TODO: translate "APAC"
    , 'settings.agencies.booking': '' // TODO: translate "Booking Agencies"
    , 'settings.agencies.management': '' // TODO: translate "Management Agencies"
    , 'settings.agencies.add': '' // TODO: translate "Add"
    , 'settings.agencies.hideForm': '' // TODO: translate "Hide form"
    , 'settings.agencies.none': '' // TODO: translate "No agencies"
    , 'settings.agencies.name': '' // TODO: translate "Name"
    , 'settings.agencies.commission': '' // TODO: translate "Commission %"
    , 'settings.agencies.territoryMode': '' // TODO: translate "Territory Mode"
    , 'settings.agencies.continents': '' // TODO: translate "Continents"
    , 'settings.agencies.countries': '' // TODO: translate "Countries (comma or space separated ISO2)"
    , 'settings.agencies.addBooking': '' // TODO: translate "Add booking"
    , 'settings.agencies.addManagement': '' // TODO: translate "Add management"
    , 'settings.agencies.reset': '' // TODO: translate "Reset"
    , 'settings.agencies.remove': '' // TODO: translate "Remove agency"
    , 'settings.agencies.limitReached': '' // TODO: translate "Limit reached (max 3)"
    , 'settings.agencies.countries.invalid': '' // TODO: translate "Countries must be 2-letter ISO codes (e.g., US ES DE), separated by commas or spaces."
    , 'settings.continent.NA': '' // TODO: translate "North America"
    , 'settings.continent.SA': '' // TODO: translate "South America"
    , 'settings.continent.EU': '' // TODO: translate "Europe"
    , 'settings.continent.AF': '' // TODO: translate "Africa"
    , 'settings.continent.AS': '' // TODO: translate "Asia"
    , 'settings.continent.OC': '' // TODO: translate "Oceania"
    , 'settings.territory.worldwide': '' // TODO: translate "Worldwide"
    , 'settings.territory.continents': '' // TODO: translate "Continents"
    , 'settings.territory.countries': '' // TODO: translate "Countries"
    , 'settings.export': '' // TODO: translate "Export settings"
    , 'settings.import': '' // TODO: translate "Import settings"
    , 'settings.reset': '' // TODO: translate "Reset to defaults"
    , 'settings.preview': '' // TODO: translate "Preview"
    , 'shows.table.net': '' // TODO: translate "Net"
    , 'shows.table.status': '' // TODO: translate "Status"
    , 'shows.selectAll': '' // TODO: translate "Select all"
    , 'shows.selectRow': '' // TODO: translate "Select row"
    , 'shows.editor.tabs': '' // TODO: translate "Editor tabs"
    , 'shows.editor.tab.details': '' // TODO: translate "Details"
    , 'shows.editor.tab.finance': '' // TODO: translate "Finance"
    , 'shows.editor.tab.costs': '' // TODO: translate "Costs"
    , 'shows.editor.finance.commissions': '' // TODO: translate "Commissions"
    , 'shows.editor.add': '' // TODO: translate "Add show"
    , 'shows.editor.edit': '' // TODO: translate "Edit show"
    , 'shows.editor.subtitleAdd': '' // TODO: translate "Create a new event"
    , 'shows.editor.label.status': '' // TODO: translate "Status"
    , 'shows.editor.label.date': '' // TODO: translate "Date"
    , 'shows.editor.label.city': '' // TODO: translate "City"
    , 'shows.editor.label.country': '' // TODO: translate "Country"
    , 'shows.editor.label.venue': '' // TODO: translate "Venue"
    , 'shows.editor.label.promoter': '' // TODO: translate "Promoter"
    , 'shows.editor.label.fee': '' // TODO: translate "Fee"
    , 'shows.editor.label.wht': '' // TODO: translate "WHT %"
    , 'shows.editor.label.mgmt': '' // TODO: translate "Mgmt Agency"
    , 'shows.editor.label.booking': '' // TODO: translate "Booking Agency"
    , 'shows.editor.label.notes': '' // TODO: translate "Notes"
    , 'shows.editor.validation.cityRequired': '' // TODO: translate "City is required"
    , 'shows.editor.validation.countryRequired': '' // TODO: translate "Country is required"
    , 'shows.editor.validation.dateRequired': '' // TODO: translate "Date is required"
    , 'shows.editor.validation.feeGtZero': '' // TODO: translate "Fee must be greater than 0"
    , 'shows.editor.validation.whtRange': '' // TODO: translate "WHT must be between 0% and 50%"
    , 'shows.dialog.close': '' // TODO: translate "Close"
    , 'shows.dialog.cancel': '' // TODO: translate "Cancel"
    , 'shows.dialog.save': '' // TODO: translate "Save"
    , 'shows.dialog.saveChanges': '' // TODO: translate "Save changes"
    , 'shows.dialog.delete': '' // TODO: translate "Delete"
    , 'shows.editor.validation.fail': '' // TODO: translate "Fix errors to continue"
    , 'shows.editor.toast.saved': '' // TODO: translate "Saved"
    , 'shows.editor.toast.deleted': '' // TODO: translate "Deleted"
    , 'shows.editor.toast.undo': '' // TODO: translate "Undo"
    , 'shows.editor.toast.restored': '' // TODO: translate "Restored"
    , 'shows.editor.toast.deleting': '' // TODO: translate "Deleting…"
    , 'shows.editor.toast.discarded': '' // TODO: translate "Changes discarded"
    , 'shows.editor.toast.validation': '' // TODO: translate "Please correct the highlighted errors"
    , 'shows.editor.summary.fee': '' // TODO: translate "Fee"
    , 'shows.editor.summary.wht': '' // TODO: translate "WHT"
    , 'shows.editor.summary.costs': '' // TODO: translate "Costs"
    , 'shows.editor.summary.net': '' // TODO: translate "Est. Net"
    , 'shows.editor.discard.title': '' // TODO: translate "Discard changes?"
    , 'shows.editor.discard.body': '' // TODO: translate "You have unsaved changes. They will be lost."
    , 'shows.editor.discard.cancel': '' // TODO: translate "Keep editing"
    , 'shows.editor.discard.confirm': '' // TODO: translate "Discard"
    , 'shows.editor.delete.confirmTitle': '' // TODO: translate "Delete show?"
    , 'shows.editor.delete.confirmBody': '' // TODO: translate "This action cannot be undone."
    , 'shows.editor.delete.confirm': '' // TODO: translate "Delete"
    , 'shows.editor.delete.cancel': '' // TODO: translate "Cancel"
    , 'shows.noCosts': '' // TODO: translate "No costs yet"
    , 'shows.filters.region': '' // TODO: translate "Region"
    , 'shows.filters.region.all': '' // TODO: translate "All"
    , 'shows.filters.region.AMER': '' // TODO: translate "AMER"
    , 'shows.filters.region.EMEA': '' // TODO: translate "EMEA"
    , 'shows.filters.region.APAC': '' // TODO: translate "APAC"
    , 'shows.filters.feeMin': '' // TODO: translate "Min fee"
    , 'shows.filters.feeMax': '' // TODO: translate "Max fee"
    , 'shows.views.export': '' // TODO: translate "Export views"
    , 'shows.views.import': '' // TODO: translate "Import views"
    , 'shows.views.applied': '' // TODO: translate "View applied"
    , 'shows.bulk.delete': '' // TODO: translate "Delete selected"
    , 'shows.bulk.setWht': '' // TODO: translate "Set WHT %"
    , 'shows.bulk.applyWht': '' // TODO: translate "Apply WHT"
    , 'shows.bulk.setStatus': '' // TODO: translate "Set status"
    , 'shows.bulk.apply': '' // TODO: translate "Apply"
    , 'shows.travel.title': '' // TODO: translate "Location"
    , 'shows.travel.quick': '' // TODO: translate "Travel"
    , 'shows.travel.soon': '' // TODO: translate "Upcoming confirmed show — consider adding travel."
    , 'shows.travel.soonConfirmed': '' // TODO: translate "Upcoming confirmed show — consider adding travel."
    , 'shows.travel.soonGeneric': '' // TODO: translate "Upcoming show — consider planning travel."
    , 'shows.travel.tripExists': '' // TODO: translate "Trip already scheduled around this date"
    , 'shows.travel.noCta': '' // TODO: translate "No travel action needed"
    , 'shows.travel.plan': '' // TODO: translate "Plan travel"
    , 'cmd.dialog': '' // TODO: translate "Command palette"
    , 'cmd.placeholder': '' // TODO: translate "Search shows or actions…"
    , 'cmd.type.show': '' // TODO: translate "Show"
    , 'cmd.type.action': '' // TODO: translate "Action"
    , 'cmd.noResults': '' // TODO: translate "No results"
    , 'cmd.footer.hint': '' // TODO: translate "Enter to run • Esc to close"
    , 'cmd.footer.tip': '' // TODO: translate "Tip: press ? for shortcuts"
    , 'cmd.openFilters': '' // TODO: translate "Open Filters"
    , 'cmd.mask.enable': '' // TODO: translate "Enable Mask"
    , 'cmd.mask.disable': '' // TODO: translate "Disable Mask"
    , 'cmd.presentation.enable': '' // TODO: translate "Enable Presentation Mode"
    , 'cmd.presentation.disable': '' // TODO: translate "Disable Presentation Mode"
    , 'cmd.shortcuts': '' // TODO: translate "Show Shortcuts Overlay"
    , 'cmd.switch.default': '' // TODO: translate "Switch View: Default"
    , 'cmd.switch.finance': '' // TODO: translate "Switch View: Finance"
    , 'cmd.switch.operations': '' // TODO: translate "Switch View: Operations"
    , 'cmd.switch.promo': '' // TODO: translate "Switch View: Promotion"
    , 'cmd.openAlerts': '' // TODO: translate "Open Alert Center"
    , 'cmd.go.shows': '' // TODO: translate "Go to Shows"
    , 'cmd.go.travel': '' // TODO: translate "Go to Travel"
    , 'cmd.go.finance': '' // TODO: translate "Go to Finance"
    , 'cmd.go.org': '' // TODO: translate "Go to Org Overview"
    , 'cmd.go.members': '' // TODO: translate "Go to Org Members"
    , 'cmd.go.clients': '' // TODO: translate "Go to Org Clients"
    , 'cmd.go.teams': '' // TODO: translate "Go to Org Teams"
    , 'cmd.go.links': '' // TODO: translate "Go to Org Links"
    , 'cmd.go.reports': '' // TODO: translate "Go to Org Reports"
    , 'cmd.go.documents': '' // TODO: translate "Go to Org Documents"
    , 'cmd.go.integrations': '' // TODO: translate "Go to Org Integrations"
    , 'cmd.go.billing': '' // TODO: translate "Go to Org Billing"
    , 'cmd.go.branding': '' // TODO: translate "Go to Org Branding"
    , 'shortcuts.dialog': '' // TODO: translate "Keyboard shortcuts"
    , 'shortcuts.title': '' // TODO: translate "Shortcuts"
    , 'shortcuts.desc': '' // TODO: translate "Use these to move faster. Press Esc to close."
    , 'shortcuts.openPalette': '' // TODO: translate "Open Command Palette"
    , 'shortcuts.showOverlay': '' // TODO: translate "Show this overlay"
    , 'shortcuts.closeDialogs': '' // TODO: translate "Close dialogs/popups"
    , 'shortcuts.goTo': '' // TODO: translate "Quick nav: g then key"
    , 'alerts.open': '' // TODO: translate "Open Alerts"
    , 'alerts.loading': '' // TODO: translate "Loading alerts…"
    , 'actions.exportCsv': '' // TODO: translate "Export CSV"
    , 'actions.copyDigest': '' // TODO: translate "Copy Digest"
    , 'actions.digest.title': '' // TODO: translate "Weekly Alerts Digest"
    , 'actions.toast.csv': '' // TODO: translate "CSV copied"
    , 'actions.toast.digest': '' // TODO: translate "Digest copied"
    , 'actions.toast.share': '' // TODO: translate "Link copied"
    , 'welcome.title': '' // TODO: translate "Welcome, {name}"
    , 'welcome.subtitle.agency': '' // TODO: translate "Manage your managers and artists"
    , 'welcome.subtitle.artist': '' // TODO: translate "All set for your upcoming shows"
    , 'welcome.cta.dashboard': '' // TODO: translate "Go to dashboard"
    , 'welcome.section.team': '' // TODO: translate "Your team"
    , 'welcome.section.clients': '' // TODO: translate "Your artists"
    , 'welcome.section.assignments': '' // TODO: translate "Managers per artist"
    , 'welcome.section.links': '' // TODO: translate "Connections & scopes"
    , 'welcome.section.kpis': '' // TODO: translate "This month"
    , 'welcome.seats.usage': '' // TODO: translate "Seats used"
    , 'welcome.gettingStarted': '' // TODO: translate "Getting started"
    , 'welcome.recentlyViewed': '' // TODO: translate "Recently viewed"
    , 'welcome.changesSince': '' // TODO: translate "Changes since your last visit"
    , 'welcome.noChanges': '' // TODO: translate "No changes"
    , 'welcome.change.linkEdited': '' // TODO: translate "Link scopes edited for Danny"
    , 'welcome.change.memberInvited': '' // TODO: translate "New manager invited"
    , 'welcome.change.docUploaded': '' // TODO: translate "New document uploaded"
    , 'empty.noRecent': '' // TODO: translate "No recent items"
    , 'welcome.cta.inviteManager': '' // TODO: translate "Invite manager"
    , 'welcome.cta.connectArtist': '' // TODO: translate "Connect artist"
    , 'welcome.cta.createTeam': '' // TODO: translate "Create team"
    , 'welcome.cta.completeBranding': '' // TODO: translate "Complete branding"
    , 'welcome.cta.reviewShows': '' // TODO: translate "Review shows"
    , 'welcome.cta.connectCalendar': '' // TODO: translate "Connect calendar"
    , 'welcome.cta.switchOrg': '' // TODO: translate "Change organization"
    , 'welcome.cta.completeSetup': '' // TODO: translate "Complete setup"
    , 'welcome.progress.complete': '' // TODO: translate "Setup complete"
    , 'welcome.progress.incomplete': '' // TODO: translate "{completed}/{total} steps completed"
    , 'welcome.tooltip.inviteManager': '' // TODO: translate "Invite team members to collaborate on shows and finances"
    , 'welcome.tooltip.connectArtist': '' // TODO: translate "Link with artists to manage their tours"
    , 'welcome.tooltip.completeBranding': '' // TODO: translate "Set up your organization\"
    , 'welcome.tooltip.connectCalendar': '' // TODO: translate "Sync your calendar for automatic show scheduling"
    , 'welcome.tooltip.switchOrg': '' // TODO: translate "Switch between different organizations you manage"
    , 'welcome.gettingStarted.invite': '' // TODO: translate "Invite a manager"
    , 'welcome.gettingStarted.connect': '' // TODO: translate "Connect an artist"
    , 'welcome.gettingStarted.review': '' // TODO: translate "Review teams & links"
    , 'welcome.gettingStarted.branding': '' // TODO: translate "Complete branding"
    , 'welcome.gettingStarted.shows': '' // TODO: translate "Review shows"
    , 'welcome.gettingStarted.calendar': '' // TODO: translate "Connect calendar"
    , 'welcome.dontShowAgain': '' // TODO: translate "Don"
    , 'welcome.openArtistDashboard': '' // TODO: translate "Open {artist} dashboard"
    , 'welcome.assign': '' // TODO: translate "Assign"
    , 'shows.toast.bulk.status': '' // TODO: translate "Status: {status} ({n})"
    , 'shows.toast.bulk.confirm': '' // TODO: translate "Confirmed"
    , 'shows.toast.bulk.setStatus': '' // TODO: translate "Status applied"
    , 'shows.toast.bulk.setWht': '' // TODO: translate "WHT applied"
    , 'shows.toast.bulk.export': '' // TODO: translate "Export started"
    , 'shows.toast.bulk.delete': '' // TODO: translate "Deleted"
    , 'shows.toast.bulk.confirmed': '' // TODO: translate "Confirmed ({n})"
    , 'shows.toast.bulk.wht': '' // TODO: translate "WHT {pct}% ({n})"
    , 'filters.clear': '' // TODO: translate "Clear"
    , 'filters.more': '' // TODO: translate "More filters"
    , 'filters.cleared': '' // TODO: translate "Filters cleared"
    , 'filters.presets': '' // TODO: translate "Presets"
    , 'filters.presets.last7': '' // TODO: translate "Last 7 days"
    , 'filters.presets.last30': '' // TODO: translate "Last 30 days"
    , 'filters.presets.last90': '' // TODO: translate "Last 90 days"
    , 'filters.presets.mtd': '' // TODO: translate "Month to date"
    , 'filters.presets.ytd': '' // TODO: translate "Year to date"
    , 'filters.presets.qtd': '' // TODO: translate "Quarter to date"
    , 'filters.applied': '' // TODO: translate "Filters applied"
    , 'common.team': '' // TODO: translate "Team"
    , 'common.region': '' // TODO: translate "Region"
    , 'ah.planTravel': '' // TODO: translate "Plan travel"
    , 'map.cssWarning': '' // TODO: translate "Map styles failed to load. Using basic fallback."
    , 'travel.offline': '' // TODO: translate "Offline mode: showing cached itineraries."
    , 'travel.refresh.error': '' // TODO: translate "Couldn"
    , 'travel.search.title': '' // TODO: translate "Search"
    , 'travel.search.open_in_google': '' // TODO: translate "Open in Google Flights"
    , 'travel.search.mode.form': '' // TODO: translate "Form"
    , 'travel.search.mode.text': '' // TODO: translate "Text"
    , 'travel.search.show_text': '' // TODO: translate "Write query"
    , 'travel.search.hide_text': '' // TODO: translate "Hide text input"
    , 'travel.search.text.placeholder': '' // TODO: translate "e.g., From MAD to CDG 2025-10-12 2 adults business"
    , 'travel.nlp': '' // TODO: translate "NLP"
    , 'travel.search.origin': '' // TODO: translate "Origin"
    , 'travel.search.destination': '' // TODO: translate "Destination"
    , 'travel.search.departure_date': '' // TODO: translate "Departure date"
    , 'travel.search.searching': '' // TODO: translate "Searching flights…"
    , 'travel.search.searchMyFlight': '' // TODO: translate "Search My Flight"
    , 'travel.search.searchAgain': '' // TODO: translate "Search Again"
    , 'travel.search.error': '' // TODO: translate "Error searching flights"
    , 'travel.addPurchasedFlight': '' // TODO: translate "Add Purchased Flight"
    , 'travel.addFlightDescription': '' // TODO: translate "Enter your booking reference or flight number to add it to your schedule"
    , 'travel.emptyStateDescription': '' // TODO: translate "Add your booked flights or search for new ones to start managing your trips."
    , 'features.settlement.benefit': '' // TODO: translate "8h/week saved on financial reports"
    , 'features.offline.description': '' // TODO: translate "IndexedDB + robust sync. Manage your tour on the plane, backstage, or anywhere. When internet returns, everything syncs automatically."
    , 'features.offline.benefit': '' // TODO: translate "24/7 access, no connection dependency"
    , 'features.ai.description': '' // TODO: translate "NLP Quick Entry, intelligent ActionHub, predictive Health Score. Warns you of problems before they happen. Your tour copilot."
    , 'features.ai.benefit': '' // TODO: translate "Anticipates problems 72h in advance"
    , 'features.esign.description': '' // TODO: translate "Integrated e-sign, templates by country (US/UK/EU/ES), full-text search with OCR. Close deals faster, no paper printing."
    , 'features.esign.benefit': '' // TODO: translate "Close contracts 3x faster"
    , 'features.inbox.description': '' // TODO: translate "Emails organized by show, smart threading, rich text reply. All your context in one place, no Gmail searching."
    , 'features.inbox.benefit': '' // TODO: translate "Zero inbox with full context"
    , 'features.travel.description': '' // TODO: translate "Integrated Amadeus API, global venue database, optimized routing. Plan efficient routes with real data."
    , 'features.travel.benefit': '' // TODO: translate "12% savings on travel costs"
    , 'org.addShowToCalendar': '' // TODO: translate "Add a new show to your calendar"
    , 'travel.validation.completeFields': '' // TODO: translate "Please complete origin, destination and departure date"
    , 'travel.validation.returnDate': '' // TODO: translate "Select return date for round trip"
    , 'travel.search.show_more_options': '' // TODO: translate "Open externally"
    , 'travel.advanced.show': '' // TODO: translate "More options"
    , 'travel.advanced.hide': '' // TODO: translate "Hide advanced options"
    , 'travel.flight_card.nonstop': '' // TODO: translate "nonstop"
    , 'travel.flight_card.stop': '' // TODO: translate "stop"
    , 'travel.flight_card.stops': '' // TODO: translate "stops"
    , 'travel.flight_card.select_for_planning': '' // TODO: translate "Select for planning"
    , 'travel.add_to_trip': '' // TODO: translate "Add to trip"
    , 'travel.swap': '' // TODO: translate "Swap"
    , 'travel.round_trip': '' // TODO: translate "Round trip"
    , 'travel.share_search': '' // TODO: translate "Share search"
    , 'travel.from': '' // TODO: translate "From"
    , 'travel.to': '' // TODO: translate "To"
    , 'travel.depart': '' // TODO: translate "Depart"
    , 'travel.return': '' // TODO: translate "Return"
    , 'travel.adults': '' // TODO: translate "Adults"
    , 'travel.bag': '' // TODO: translate "bag"
    , 'travel.bags': '' // TODO: translate "Bags"
    , 'travel.cabin': '' // TODO: translate "Cabin"
    , 'travel.stops_ok': '' // TODO: translate "Stops ok"
    , 'travel.deeplink.preview': '' // TODO: translate "Preview link"
    , 'travel.deeplink.copy': '' // TODO: translate "Copy link"
    , 'travel.deeplink.copied': '' // TODO: translate "Copied ✓"
    , 'travel.sort.menu': '' // TODO: translate "Sort by"
    , 'travel.sort.priceAsc': '' // TODO: translate "Price (low→high)"
    , 'travel.sort.priceDesc': '' // TODO: translate "Price (high→low)"
    , 'travel.sort.duration': '' // TODO: translate "Duration"
    , 'travel.sort.stops': '' // TODO: translate "Stops"
    , 'travel.badge.nonstop': '' // TODO: translate "Nonstop"
    , 'travel.badge.baggage': '' // TODO: translate "Bag included"
    , 'travel.arrival.sameDay': '' // TODO: translate "Arrives same day"
    , 'travel.arrival.nextDay': '' // TODO: translate "Arrives next day"
    , 'travel.recent.clear': '' // TODO: translate "Clear recent"
    , 'travel.recent.remove': '' // TODO: translate "Remove"
    , 'travel.form.invalid': '' // TODO: translate "Please fix errors to search"
    , 'travel.nlp.hint': '' // TODO: translate "Free-form input — press Shift+Enter to apply"
    , 'travel.flex.days': '' // TODO: translate "±{n} days"
    , 'travel.compare.grid.title': '' // TODO: translate "Compare flights"
    , 'travel.compare.empty': '' // TODO: translate "Pin flights to compare them here."
    , 'travel.compare.hint': '' // TODO: translate "Review pinned flights side-by-side."
    , 'travel.co2.label': '' // TODO: translate "CO₂"
    , 'travel.window': '' // TODO: translate "Window"
    , 'travel.flex_window': '' // TODO: translate "Flex window"
    , 'travel.flex_hint': '' // TODO: translate "We"
    , 'travel.one_way': '' // TODO: translate "One-way"
    , 'travel.nonstop': '' // TODO: translate "Nonstop"
    , 'travel.pin': '' // TODO: translate "Pin"
    , 'travel.unpin': '' // TODO: translate "Unpin"
    , 'travel.compare.title': '' // TODO: translate "Compare pinned"
    , 'travel.compare.show': '' // TODO: translate "Compare"
    , 'travel.compare.hide': '' // TODO: translate "Hide"
    , 'travel.compare.add_to_trip': '' // TODO: translate "Add to trip"
    , 'travel.trip.added': '' // TODO: translate "Added to trip"
    , 'travel.trip.create_drop': '' // TODO: translate "Drop here to create new trip"
    , 'travel.related_show': '' // TODO: translate "Related show"
    , 'travel.multicity.toggle': '' // TODO: translate "Multicity"
    , 'travel.multicity': '' // TODO: translate "Multi-city"
    , 'travel.multicity.add_leg': '' // TODO: translate "Add leg"
    , 'travel.multicity.remove': '' // TODO: translate "Remove"
    , 'travel.multicity.move_up': '' // TODO: translate "Move up"
    , 'travel.multicity.move_down': '' // TODO: translate "Move down"
    , 'travel.multicity.open': '' // TODO: translate "Open route in Google Flights"
    , 'travel.multicity.hint': '' // TODO: translate "Add at least two legs to build a route"
    , 'travel.trips': '' // TODO: translate "Trips"
    , 'travel.trip.new': '' // TODO: translate "New Trip"
    , 'travel.trip.to': '' // TODO: translate "Trip to"
    , 'travel.segments': '' // TODO: translate "Segments"
    , 'common.actions': '' // TODO: translate "Actions"
    , 'travel.timeline.title': '' // TODO: translate "Travel Timeline"
    , 'travel.timeline.free_day': '' // TODO: translate "Free day"
    , 'travel.hub.title': '' // TODO: translate "Search"
    , 'travel.hub.needs_planning': '' // TODO: translate "Suggestions"
    , 'travel.hub.upcoming': '' // TODO: translate "Upcoming"
    , 'travel.hub.open_multicity': '' // TODO: translate "Open multicity"
    , 'travel.hub.plan_trip_cta': '' // TODO: translate "Plan Trip"
    , 'travel.error.same_route': '' // TODO: translate "Origin and destination are the same"
    , 'travel.error.return_before_depart': '' // TODO: translate "Return is before departure"
    , 'travel.segment.type': '' // TODO: translate "Type"
    , 'travel.segment.flight': '' // TODO: translate "Flight"
    , 'travel.segment.hotel': '' // TODO: translate "Hotel"
    , 'travel.segment.ground': '' // TODO: translate "Ground"
    , 'copy.manual.title': '' // TODO: translate "Manual copy"
    , 'copy.manual.desc': '' // TODO: translate "Copy the text below if clipboard is blocked."
    , 'common.noResults': '' // TODO: translate "No results"
    , 'tripDetail.currency': '' // TODO: translate "Currency"
    , 'cost.category.flight': '' // TODO: translate "Flight"
    , 'cost.category.hotel': '' // TODO: translate "Hotel"
    , 'cost.category.ground': '' // TODO: translate "Ground"
    , 'cost.category.taxes': '' // TODO: translate "Taxes"
    , 'cost.category.fees': '' // TODO: translate "Fees"
    , 'cost.category.other': '' // TODO: translate "Other"
    , 'travel.workspace.placeholder': '' // TODO: translate "Select a trip to see details or perform a search."
    , 'travel.open_in_provider': '' // TODO: translate "Open in provider"
    , 'common.loading': '' // TODO: translate "Loading…"
    , 'common.results': '' // TODO: translate "results"
    , 'travel.no_trips_yet': '' // TODO: translate "No trips planned yet. Use the search to get started!"
    , 'travel.provider': '' // TODO: translate "Provider"
    , 'provider.mock': '' // TODO: translate "In-app (mock)"
    , 'provider.google': '' // TODO: translate "Google Flights"
    , 'travel.alert.checkin': '' // TODO: translate "Check-in opens in %s"
    , 'travel.alert.priceDrop': '' // TODO: translate "Price dropped by %s"
    , 'travel.workspace.open': '' // TODO: translate "Open Travel Workspace"
    , 'travel.workspace.timeline': '' // TODO: translate "Timeline view"
    , 'travel.workspace.trip_builder.beta': '' // TODO: translate "Trip Builder (beta)"
    , 'common.list': '' // TODO: translate "List"
    , 'common.clear': '' // TODO: translate "Clear"
    , 'common.reset': '' // TODO: translate "Reset"
    , 'calendar.timeline': '' // TODO: translate "Week"
    , 'common.moved': '' // TODO: translate "Moved"
    , 'travel.drop.hint': '' // TODO: translate "Drag to another day"
    , 'travel.search.summary': '' // TODO: translate "Search summary"
    , 'travel.search.route': '' // TODO: translate "{from} → {to}"
    , 'travel.search.paxCabin': '' // TODO: translate "{pax} pax · {cabin}"
    , 'travel.results.countForDate': '' // TODO: translate "{count} results for {date}"
    , 'travel.compare.bestPrice': '' // TODO: translate "Best price"
    , 'travel.compare.bestTime': '' // TODO: translate "Fastest"
    , 'travel.compare.bestBalance': '' // TODO: translate "Best balance"
    , 'travel.co2.estimate': '' // TODO: translate "~{kg} kg CO₂ (est.)"
    , 'travel.mobile.sticky.results': '' // TODO: translate "Results"
    , 'travel.mobile.sticky.compare': '' // TODO: translate "Compare"
    , 'travel.tooltips.flex': '' // TODO: translate "Explore ± days around the selected date"
    , 'travel.tooltips.nonstop': '' // TODO: translate "Only show flights without stops"
    , 'travel.tooltips.cabin': '' // TODO: translate "Seat class preference"
    , 'travel.move.prev': '' // TODO: translate "Move to previous day"
    , 'travel.move.next': '' // TODO: translate "Move to next day"
    , 'travel.rest.short': '' // TODO: translate "Short rest before next show"
    , 'travel.rest.same_day': '' // TODO: translate "Same-day show risk"
    , 'calendar.title': '' // TODO: translate "Calendar"
    , 'calendar.prev': '' // TODO: translate "Previous month"
    , 'calendar.next': '' // TODO: translate "Next month"
    , 'calendar.today': '' // TODO: translate "Today"
    , 'calendar.goto': '' // TODO: translate "Go to date"
    , 'calendar.more': '' // TODO: translate "more"
    , 'calendar.more.title': '' // TODO: translate "More events"
    , 'calendar.more.openDay': '' // TODO: translate "Open day"
    , 'calendar.more.openFullDay': '' // TODO: translate "Open full day"
    , 'calendar.announce.moved': '' // TODO: translate "Moved show to {d}"
    , 'calendar.announce.copied': '' // TODO: translate "Duplicated show to {d}"
    , 'calendar.quickAdd.hint': '' // TODO: translate "Enter to add • Esc to cancel"
    , 'calendar.quickAdd.advanced': '' // TODO: translate "Advanced"
    , 'calendar.quickAdd.simple': '' // TODO: translate "Simple"
    , 'calendar.quickAdd.placeholder': '' // TODO: translate "City CC Fee (optional)… e.g., Madrid ES 12000"
    , 'calendar.quickAdd.recent': '' // TODO: translate "Recent"
    , 'calendar.quickAdd.parseError': '' // TODO: translate "Can"
    , 'calendar.quickAdd.countryMissing': '' // TODO: translate "Add 2-letter country code"
    , 'calendar.goto.hint': '' // TODO: translate "Enter to go • Esc to close"
    , 'calendar.view.switch': '' // TODO: translate "Change calendar view"
    , 'calendar.view.month': '' // TODO: translate "Month"
    , 'calendar.view.week': '' // TODO: translate "Week"
    , 'calendar.view.day': '' // TODO: translate "Day"
    , 'calendar.view.agenda': '' // TODO: translate "Agenda"
    , 'calendar.view.announce': '' // TODO: translate "{v} view"
    , 'calendar.timezone': '' // TODO: translate "Time zone"
    , 'calendar.tz.local': '' // TODO: translate "Local"
    , 'calendar.tz.localLabel': '' // TODO: translate "Local"
    , 'calendar.tz.changed': '' // TODO: translate "Time zone set to {tz}"
    , 'calendar.goto.shortcut': '' // TODO: translate "⌘/Ctrl + G"
    , 'calendar.shortcut.pgUp': '' // TODO: translate "PgUp / Alt+←"
    , 'calendar.shortcut.pgDn': '' // TODO: translate "PgDn / Alt+→"
    , 'calendar.shortcut.today': '' // TODO: translate "T"
    , 'common.move': '' // TODO: translate "Move"
    , 'common.copy': '' // TODO: translate "Copy"
    , 'calendar.more.filter': '' // TODO: translate "Filter events"
    , 'calendar.more.empty': '' // TODO: translate "No results"
    , 'calendar.kb.hint': '' // TODO: translate "Keyboard: Arrow keys move day, PageUp/PageDown change month, T go to today, Enter or Space select day."
    , 'calendar.day.select': '' // TODO: translate "Selected {d}"
    , 'calendar.day.focus': '' // TODO: translate "Focused {d}"
    , 'calendar.noEvents': '' // TODO: translate "No events for this day"
    , 'calendar.show.shows': '' // TODO: translate "Shows"
    , 'calendar.show.travel': '' // TODO: translate "Travel"
    , 'calendar.kind': '' // TODO: translate "Kind"
    , 'calendar.kind.show': '' // TODO: translate "Show"
    , 'calendar.kind.travel': '' // TODO: translate "Travel"
    , 'calendar.status': '' // TODO: translate "Status"
    , 'calendar.dnd.enter': '' // TODO: translate "Drop here to place event on {d}"
    , 'calendar.dnd.leave': '' // TODO: translate "Leaving drop target"
    , 'calendar.kbdDnD.marked': '' // TODO: translate "Marked {d} as origin. Use Enter on target day to drop. Hold Ctrl/Cmd to copy."
    , 'calendar.kbdDnD.cancel': '' // TODO: translate "Cancelled move/copy mode"
    , 'calendar.kbdDnD.origin': '' // TODO: translate "Origin (keyboard move/copy active)"
    , 'calendar.kbdDnD.none': '' // TODO: translate "No show to move from selected origin"
    , 'calendar.weekStart': '' // TODO: translate "Week starts on"
    , 'calendar.weekStart.mon': '' // TODO: translate "Mon"
    , 'calendar.weekStart.sun': '' // TODO: translate "Sun"
    , 'calendar.import': '' // TODO: translate "Import"
    , 'calendar.import.ics': '' // TODO: translate "Import .ics"
    , 'calendar.import.done': '' // TODO: translate "Imported {n} events"
    , 'calendar.import.error': '' // TODO: translate "Failed to import .ics"
    , 'calendar.wd.mon': '' // TODO: translate "Mon"
    , 'calendar.wd.tue': '' // TODO: translate "Tue"
    , 'calendar.wd.wed': '' // TODO: translate "Wed"
    , 'calendar.wd.thu': '' // TODO: translate "Thu"
    , 'calendar.wd.fri': '' // TODO: translate "Fri"
    , 'calendar.wd.sat': '' // TODO: translate "Sat"
    , 'calendar.wd.sun': '' // TODO: translate "Sun"
    , 'shows.costs.type': '' // TODO: translate "Type"
    , 'shows.costs.placeholder': '' // TODO: translate "Travel / Production / Marketing"
    , 'shows.costs.amount': '' // TODO: translate "Amount"
    , 'shows.costs.desc': '' // TODO: translate "Description"
    , 'common.optional': '' // TODO: translate "Optional"
    , 'common.add': '' // TODO: translate "Add"
    , 'common.income': '' // TODO: translate "Income"
    , 'common.wht': '' // TODO: translate "WHT"
    , 'common.commissions': '' // TODO: translate "Commissions"
    , 'common.net': '' // TODO: translate "Net"
    , 'common.costs': '' // TODO: translate "Costs"
    , 'common.total': '' // TODO: translate "Total"
    , 'shows.promote': '' // TODO: translate "Promote"
    , 'shows.editor.status.promote': '' // TODO: translate "Promoted to"
    , 'shows.margin.tooltip': '' // TODO: translate "Net divided by Fee (%)"
    , 'shows.empty': '' // TODO: translate "No shows match your filters"
    , 'shows.empty.add': '' // TODO: translate "Add your first show"
    , 'shows.export.csv.success': '' // TODO: translate "CSV exported ✓"
    , 'shows.export.xlsx.success': '' // TODO: translate "XLSX exported ✓"
    , 'shows.sort.tooltip': '' // TODO: translate "Sort by column"
    , 'shows.filters.statusGroup': '' // TODO: translate "Status filters"
    , 'shows.relative.inDays': '' // TODO: translate "In {n} days"
    , 'shows.relative.daysAgo': '' // TODO: translate "{n} days ago"
    , 'shows.relative.yesterday': '' // TODO: translate "Yesterday"
    , 'shows.row.menu': '' // TODO: translate "Row actions"
    , 'shows.action.edit': '' // TODO: translate "Edit"
    , 'shows.action.promote': '' // TODO: translate "Promote"
    , 'shows.action.duplicate': '' // TODO: translate "Duplicate"
    , 'shows.action.archive': '' // TODO: translate "Archive"
    , 'shows.action.delete': '' // TODO: translate "Delete"
    , 'shows.action.restore': '' // TODO: translate "Restore"
    , 'shows.board.header.net': '' // TODO: translate "Net"
    , 'shows.board.header.count': '' // TODO: translate "Shows"
    , 'shows.datePreset.thisMonth': '' // TODO: translate "This Month"
    , 'shows.datePreset.nextMonth': '' // TODO: translate "Next Month"
    , 'shows.columns.config': '' // TODO: translate "Columns"
    , 'shows.columns.wht': '' // TODO: translate "WHT %"
    , 'shows.totals.pin': '' // TODO: translate "Pin totals"
    , 'shows.totals.unpin': '' // TODO: translate "Unpin totals"
    , 'shows.totals.avgFee': '' // TODO: translate "Avg Fee"
    , 'shows.totals.avgFee.tooltip': '' // TODO: translate "Average fee per show"
    , 'shows.totals.avgMargin': '' // TODO: translate "Avg Margin %"
    , 'shows.totals.avgMargin.tooltip': '' // TODO: translate "Average margin % across shows with fee"
    , 'shows.wht.hide': '' // TODO: translate "Hide WHT column"
    , 'shows.sort.aria.sortedDesc': '' // TODO: translate "Sorted descending"
    , 'shows.sort.aria.sortedAsc': '' // TODO: translate "Sorted ascending"
    , 'shows.sort.aria.notSorted': '' // TODO: translate "Not sorted"
    , 'shows.sort.aria.activateDesc': '' // TODO: translate "Activate to sort descending"
    , 'shows.sort.aria.activateAsc': '' // TODO: translate "Activate to sort ascending"
    , 'nav.overview': '' // TODO: translate "Overview"
    , 'nav.clients': '' // TODO: translate "Clients"
    , 'nav.teams': '' // TODO: translate "Teams"
    , 'nav.links': '' // TODO: translate "Links"
    , 'nav.reports': '' // TODO: translate "Reports"
    , 'nav.documents': '' // TODO: translate "Documents"
    , 'nav.integrations': '' // TODO: translate "Integrations"
    , 'nav.billing': '' // TODO: translate "Billing"
    , 'nav.branding': '' // TODO: translate "Branding"
    , 'nav.connections': '' // TODO: translate "Connections"
    , 'org.overview.title': '' // TODO: translate "Organization Overview"
    , 'org.overview.subtitle.agency': '' // TODO: translate "KPIs by client, tasks, and active links"
    , 'org.overview.subtitle.artist': '' // TODO: translate "Upcoming shows and travel, monthly KPIs"
    , 'org.members.title': '' // TODO: translate "Members"
    , 'members.invite': '' // TODO: translate "Invite"
    , 'members.seats.usage': '' // TODO: translate "Seat usage: 5/5 internal, 0/5 guests"
    , 'org.clients.title': '' // TODO: translate "Clients"
    , 'org.teams.title': '' // TODO: translate "Teams"
    , 'org.links.title': '' // TODO: translate "Links"
    , 'org.branding.title': '' // TODO: translate "Branding"
    , 'org.documents.title': '' // TODO: translate "Documents"
    , 'org.reports.title': '' // TODO: translate "Reports"
    , 'org.integrations.title': '' // TODO: translate "Integrations"
    , 'org.billing.title': '' // TODO: translate "Billing"
    , 'labels.seats.used': '' // TODO: translate "Seats used"
    , 'labels.seats.guests': '' // TODO: translate "Guests"
    , 'export.options': '' // TODO: translate "Export options"
    , 'export.columns': '' // TODO: translate "Columns"
    , 'export.csv': '' // TODO: translate "CSV"
    , 'export.xlsx': '' // TODO: translate "XLSX"
    , 'common.exporting': '' // TODO: translate "Exporting…"
    , 'charts.viewTable': '' // TODO: translate "View data as table"
    , 'charts.hideTable': '' // TODO: translate "Hide table"
    , 'finance.period.mtd': '' // TODO: translate "MTD"
    , 'finance.period.lastMonth': '' // TODO: translate "Last month"
    , 'finance.period.ytd': '' // TODO: translate "YTD"
    , 'finance.period.custom': '' // TODO: translate "Custom"
    , 'finance.period.closed': '' // TODO: translate "Closed"
    , 'finance.period.open': '' // TODO: translate "Open"
    , 'finance.closeMonth': '' // TODO: translate "Close Month"
    , 'finance.reopenMonth': '' // TODO: translate "Reopen Month"
    , 'finance.closed.help': '' // TODO: translate "Month is closed. Reopen to make changes."
    , 'finance.kpi.mtdNet': '' // TODO: translate "MTD Net"
    , 'finance.kpi.ytdNet': '' // TODO: translate "YTD Net"
    , 'finance.kpi.forecastEom': '' // TODO: translate "Forecast EOM"
    , 'finance.kpi.deltaTarget': '' // TODO: translate "Δ vs Target"
    , 'finance.kpi.gm': '' // TODO: translate "GM%"
    , 'finance.kpi.dso': '' // TODO: translate "DSO"
    , 'finance.comparePrev': '' // TODO: translate "Compare vs previous"
    , 'finance.export.csv.success': '' // TODO: translate "CSV exported ✓"
    , 'finance.export.xlsx.success': '' // TODO: translate "XLSX exported ✓"
    , 'finance.v2.footer': '' // TODO: translate "AR top debtors and row actions coming next."
    , 'finance.pl.caption': '' // TODO: translate "Profit and Loss ledger. Use column headers to sort. Virtualized list shows a subset of rows."
    , 'common.rowsVisible': '' // TODO: translate "Rows visible"
    , 'finance.whtPct': '' // TODO: translate "WHT %"
    , 'finance.wht': '' // TODO: translate "WHT"
    , 'finance.mgmtPct': '' // TODO: translate "Mgmt %"
    , 'finance.bookingPct': '' // TODO: translate "Booking %"
    , 'finance.breakdown.by': '' // TODO: translate "Breakdown by"
    , 'finance.breakdown.empty': '' // TODO: translate "No breakdown available"
    , 'finance.delta': '' // TODO: translate "Δ"
    , 'finance.deltaVsPrev': '' // TODO: translate "Δ vs prev"
    , 'common.comingSoon': '' // TODO: translate "Coming soon"
    , 'finance.expected': '' // TODO: translate "Expected (stage-weighted)"
    , 'finance.ar.title': '' // TODO: translate "AR aging & top debtors"
    , 'common.moreActions': '' // TODO: translate "More actions"
    , 'actions.copyRow': '' // TODO: translate "Copy row"
    , 'actions.exportRowCsv': '' // TODO: translate "Export row (CSV)"
    , 'actions.goToShow': '' // TODO: translate "Go to show"
    , 'actions.openCosts': '' // TODO: translate "Open costs"
    , 'shows.table.route': '' // TODO: translate "Route"
    , 'finance.targets.title': '' // TODO: translate "Targets"
    , 'finance.targets.revenue': '' // TODO: translate "Revenue target"
    , 'finance.targets.net': '' // TODO: translate "Net target"
    , 'finance.targets.hint': '' // TODO: translate "Targets are local to this device for now."
    , 'finance.targets.noNegative': '' // TODO: translate "Targets cannot be negative"
    , 'filters.title': '' // TODO: translate "Filters"
    , 'filters.region': '' // TODO: translate "Region"
    , 'filters.from': '' // TODO: translate "From"
    , 'filters.to': '' // TODO: translate "To"
    , 'filters.currency': '' // TODO: translate "Currency"
    , 'filters.presentation': '' // TODO: translate "Presentation mode"
    , 'filters.shortcutHint': '' // TODO: translate "Ctrl/Cmd+K – open filters"
    , 'filters.appliedRange': '' // TODO: translate "Applied range"
    , 'layout.team': '' // TODO: translate "Team"
    , 'layout.highContrast': '' // TODO: translate "High Contrast"
    , 'layout.tenant': '' // TODO: translate "Tenant"
    , 'access.readOnly': '' // TODO: translate "read-only"
    , 'layout.viewingAs': '' // TODO: translate "Viewing as"
    , 'layout.viewAsExit': '' // TODO: translate "Exit"
    , 'access.readOnly.tooltip': '' // TODO: translate "Finance exports disabled for agency demo"
    , 'lab.drag': '' // TODO: translate "Drag"
    , 'lab.moveUp': '' // TODO: translate "Move up"
    , 'lab.moveDown': '' // TODO: translate "Move down"
    , 'lab.reset': '' // TODO: translate "Reset to template"
    , 'lab.back': '' // TODO: translate "Back to Dashboard"
    , 'lab.layoutName': '' // TODO: translate "Layout name"
    , 'lab.save': '' // TODO: translate "Save layout"
    , 'lab.apply': '' // TODO: translate "Apply…"
    , 'lab.delete': '' // TODO: translate "Delete…"
    , 'lab.export': '' // TODO: translate "Export"
    , 'lab.import': '' // TODO: translate "Import"
    , 'lab.dropHere': '' // TODO: translate "Drop widgets here"
    , 'lab.header': '' // TODO: translate "Mission Control Lab"
    , 'lab.subheader': '' // TODO: translate "Drag, reorder, and resize dashboard widgets. Experimental."
    , 'lab.template': '' // TODO: translate "Template"
    , 'lab.resetToTemplate': '' // TODO: translate "Reset to template"
    , 'lab.backToDashboard': '' // TODO: translate "Back to Dashboard"
    , 'lab.applySaved': '' // TODO: translate "Apply…"
    , 'lab.deleteSaved': '' // TODO: translate "Delete…"
    , 'dashboard.title': '' // TODO: translate "Tour Command Center"
    , 'dashboard.subtitle': '' // TODO: translate "Monitor your tour performance, mission status, and take action on what matters most"
    , 'dashboard.map.title': '' // TODO: translate "Tour Map"
    , 'dashboard.activity.title': '' // TODO: translate "Recent Activity"
    , 'dashboard.actions.title': '' // TODO: translate "Quick Actions"
    , 'dashboard.actions.newShow': '' // TODO: translate "Add New Show"
    , 'dashboard.actions.quickFinance': '' // TODO: translate "Quick Finance Check"
    , 'dashboard.actions.travelBooking': '' // TODO: translate "Book Travel"
    , 'dashboard.areas.finance.title': '' // TODO: translate "Finance"
    , 'dashboard.areas.finance.description': '' // TODO: translate "Track revenue, costs, and profitability"
    , 'dashboard.areas.shows.title': '' // TODO: translate "Shows & Events"
    , 'dashboard.areas.shows.description': '' // TODO: translate "Manage performances and venues"
    , 'dashboard.areas.travel.title': '' // TODO: translate "Travel & Logistics"
    , 'dashboard.areas.travel.description': '' // TODO: translate "Plan and track travel arrangements"
    , 'dashboard.areas.missionControl.title': '' // TODO: translate "Mission Control Lab"
    , 'dashboard.areas.missionControl.description': '' // TODO: translate "Advanced mission control with customizable widgets"
    , 'dashboard.kpi.financialHealth': '' // TODO: translate "Financial Health"
    , 'dashboard.kpi.nextEvent': '' // TODO: translate "Next Critical Event"
    , 'dashboard.kpi.ticketSales': '' // TODO: translate "Ticket Sales"
    , 'actions.toast.export': '' // TODO: translate "Export copied"
    , 'actions.import.prompt': '' // TODO: translate "Paste Lab layouts JSON"
    , 'actions.toast.imported': '' // TODO: translate "Imported"
    , 'actions.toast.import_invalid': '' // TODO: translate "Invalid JSON"
    , 'actions.newArtist': '' // TODO: translate "New artist"
    , 'actions.connectExisting': '' // TODO: translate "Connect existing"
    , 'actions.editScopes': '' // TODO: translate "Edit scopes"
    , 'actions.revoke': '' // TODO: translate "Revoke"
    , 'actions.exportPdf': '' // TODO: translate "Export PDF"
    , 'branding.uploadLogo': '' // TODO: translate "Upload logo"
    , 'branding.editColors': '' // TODO: translate "Edit colors"
    , 'common.upload': '' // TODO: translate "Upload"
    , 'common.newFolder': '' // TODO: translate "New folder"
    , 'live.up': '' // TODO: translate "up"
    , 'live.down': '' // TODO: translate "down"
    , 'live.flat': '' // TODO: translate "flat"
    , 'nav.profile': '' // TODO: translate "Profile"
    , 'nav.changeOrg': '' // TODO: translate "Change organization"
    , 'nav.logout': '' // TODO: translate "Logout"
    , 'profile.title': '' // TODO: translate "Profile"
    , 'profile.personal': '' // TODO: translate "Personal"
    , 'profile.security': '' // TODO: translate "Security"
    , 'profile.notifications': '' // TODO: translate "Notifications"
    , 'profile.save': '' // TODO: translate "Save"
    , 'profile.saved': '' // TODO: translate "Saved ✓"
    , 'profile.avatarUrl': '' // TODO: translate "Avatar URL"
    , 'profile.bio': '' // TODO: translate "Bio"
    , 'profile.notify.email': '' // TODO: translate "Email updates"
    , 'profile.notify.slack': '' // TODO: translate "Slack notifications"
    , 'profile.notify.hint': '' // TODO: translate "These preferences affect demo notifications only"
    , 'profile.memberships': '' // TODO: translate "Memberships"
    , 'profile.defaultOrg': '' // TODO: translate "Default organization"
    , 'profile.setDefault': '' // TODO: translate "Set default"
    , 'profile.dataPrivacy': '' // TODO: translate "Data & privacy"
    , 'profile.exportData': '' // TODO: translate "Export my demo data"
    , 'profile.clearData': '' // TODO: translate "Clear and reseed demo data"
    , 'profile.export.ready': '' // TODO: translate "Data export ready"
    , 'profile.error.name': '' // TODO: translate "Name is required"
    , 'profile.error.email': '' // TODO: translate "Email is required"
    , 'prefs.title': '' // TODO: translate "Preferences"
    , 'prefs.appearance': '' // TODO: translate "Appearance"
    , 'prefs.language': '' // TODO: translate "Language"
    , 'prefs.theme': '' // TODO: translate "Theme"
    , 'prefs.highContrast': '' // TODO: translate "High contrast"
    , 'prefs.finance.currency': '' // TODO: translate "Currency"
    , 'prefs.units': '' // TODO: translate "Distance units"
    , 'prefs.presentation': '' // TODO: translate "Presentation mode"
    , 'prefs.comparePrev': '' // TODO: translate "Compare vs previous"
    , 'prefs.defaultRegion': '' // TODO: translate "Default region"
    , 'prefs.defaultStatuses': '' // TODO: translate "Default statuses"
    , 'prefs.help.language': '' // TODO: translate "Affects labels and date/number formatting."
    , 'prefs.help.theme': '' // TODO: translate "Choose light or dark based on your environment."
    , 'prefs.help.highContrast': '' // TODO: translate "Improves contrast and focus rings for readability."
    , 'prefs.help.currency': '' // TODO: translate "Sets default currency for dashboards and exports."
    , 'prefs.help.units': '' // TODO: translate "Used for travel distances and map overlays."
    , 'prefs.help.presentation': '' // TODO: translate "Larger text, simplified animations for demos."
    , 'prefs.help.comparePrev': '' // TODO: translate "Shows deltas against the previous period."
    , 'prefs.help.region': '' // TODO: translate "Preselects region filters in dashboards."
    , 'subnav.ariaLabel': '' // TODO: translate "Sections"
    , 'breadcrumb.home': '' // TODO: translate "Home"
    , 'home.seo.title': '' // TODO: translate "On Tour App - Tour Management & Finance Dashboard"
    , 'home.seo.description': '' // TODO: translate "Professional tour management platform with real-time finance tracking, venue booking, and performance analytics for artists and managers."
    , 'home.seo.keywords': '' // TODO: translate "tour management, concert booking, artist finance, venue management, performance analytics, live music"
    , 'comparison.title': '' // TODO: translate "From Spreadsheet Chaos to App Clarity"
    , 'comparison.subtitle': '' // TODO: translate "See how your tour management evolves from fragmented Excel files to a unified, intelligent platform."
    , 'comparison.excel.title': '' // TODO: translate "Excel Chaos"
    , 'comparison.excel.problem1': '' // TODO: translate "Scattered files across devices and emails"
    , 'comparison.excel.problem2': '' // TODO: translate "Manual calculations prone to errors"
    , 'comparison.excel.problem3': '' // TODO: translate "No real-time collaboration or notifications"
    , 'comparison.excel.problem4': '' // TODO: translate "Lost context in endless tabs and comments"
    , 'comparison.app.title': '' // TODO: translate "App Clarity"
    , 'comparison.app.benefit1': '' // TODO: translate "Unified dashboard with live data sync"
    , 'comparison.app.benefit2': '' // TODO: translate "Automated calculations and error detection"
    , 'comparison.app.benefit3': '' // TODO: translate "Real-time collaboration and smart notifications"
    , 'comparison.app.benefit4': '' // TODO: translate "Context-aware insights and predictive alerts"
    , 'comparison.benefit1.title': '' // TODO: translate "Smart Finance Tracking"
    , 'comparison.benefit1.desc': '' // TODO: translate "Automatic profit calculations, cost analysis, and budget alerts."
    , 'comparison.benefit2.title': '' // TODO: translate "Live Tour Mapping"
    , 'comparison.benefit2.desc': '' // TODO: translate "Interactive maps with route optimization and venue intelligence."
    , 'comparison.benefit3.title': '' // TODO: translate "Instant Insights"
    , 'comparison.benefit3.desc': '' // TODO: translate "AI-powered recommendations and risk detection in real-time."
    , 'metamorphosis.title': '' // TODO: translate "From scattered noise to a living control panel"
    , 'metamorphosis.subtitle': '' // TODO: translate "Instead of spreadsheets mutating chaotically and critical context buried in comments, every data point flows into a single orchestrated surface. The system reconciles, validates, and highlights what matters."
    , 'dashboard.offerConfirmed': '' // TODO: translate "Offer → Confirmed"
    , 'dashboard.tourHealthScore': '' // TODO: translate "Tour Health Score"
    , 'dashboard.healthFactors': '' // TODO: translate "Health Factors"
    , 'dashboard.keyInsights': '' // TODO: translate "Key Insights"
    , 'dashboard.confidence': '' // TODO: translate "Confidence"
    , 'dashboard.current': '' // TODO: translate "Current"
    , 'dashboard.predicted': '' // TODO: translate "Predicted"
    , 'dashboard.expectedChange': '' // TODO: translate "Expected change"
    , 'dashboard.scheduleGap': '' // TODO: translate "Schedule gap"
    , 'dashboard.allSystemsReady': '' // TODO: translate "All systems ready"
    , 'dashboard.loadingMap': '' // TODO: translate "Loading map…"
    , 'placeholder.username': '' // TODO: translate "you@example.com or username"
    , 'placeholder.bio': '' // TODO: translate "Tell us a bit about yourself and what you do..."
    , 'placeholder.cityName': '' // TODO: translate "Enter city name..."
    , 'placeholder.notes': '' // TODO: translate "Add any additional notes..."
    , 'placeholder.searchCommand': '' // TODO: translate "Search shows, navigate, or type a command..."
    , 'placeholder.expenseDescription': '' // TODO: translate "e.g., Flight tickets, Hotel booking..."
    , 'placeholder.expenseDetails': '' // TODO: translate "Add any additional details, invoice numbers, or context..."
    , 'placeholder.origin': '' // TODO: translate "Origin (e.g., BCN)"
    , 'placeholder.destination': '' // TODO: translate "Destination (e.g., AMS)"
    , 'placeholder.bookingRef': '' // TODO: translate "Booking reference or flight number"
    , 'placeholder.airport': '' // TODO: translate "City or airport..."
```

### Detailed Translation Table

| Key | English Original | Your Translation |
|-----|------------------|------------------|
| `scopes.tooltip.shows` | Shows access granted by link | _[translate here]_ |
| `scopes.tooltip.travel` | Travel access granted by link | _[translate here]_ |
| `scopes.tooltip.finance` | Finance: read-only per link policy | _[translate here]_ |
| `kpi.shows` | Shows | _[translate here]_ |
| `kpi.net` | Net | _[translate here]_ |
| `kpi.travel` | Travel | _[translate here]_ |
| `cmd.go.profile` | Go to profile | _[translate here]_ |
| `cmd.go.preferences` | Go to preferences | _[translate here]_ |
| `common.copyLink` | Copy link | _[translate here]_ |
| `common.learnMore` | Learn more | _[translate here]_ |
| `insights.thisMonthTotal` | This Month Total | _[translate here]_ |
| `insights.statusBreakdown` | Status breakdown | _[translate here]_ |
| `insights.upcoming14d` | Upcoming 14d | _[translate here]_ |
| `common.openShow` | Open show | _[translate here]_ |
| `common.centerMap` | Center map | _[translate here]_ |
| `common.dismiss` | Dismiss | _[translate here]_ |
| `common.snooze7` | Snooze 7 days | _[translate here]_ |
| `common.snooze30` | Snooze 30 days | _[translate here]_ |
| `common.on` | on | _[translate here]_ |
| `common.off` | off | _[translate here]_ |
| `common.hide` | Hide | _[translate here]_ |
| `common.pin` | Pin | _[translate here]_ |
| `common.unpin` | Unpin | _[translate here]_ |
| `common.map` | Map | _[translate here]_ |
| `layout.invite` | Invite | _[translate here]_ |
| `layout.build` | Build: preview | _[translate here]_ |
| `layout.demo` | Status: demo feed | _[translate here]_ |
| `alerts.title` | Alert Center | _[translate here]_ |
| `alerts.anySeverity` | Any severity | _[translate here]_ |
| `alerts.anyRegion` | Any region | _[translate here]_ |
| `alerts.anyTeam` | Any team | _[translate here]_ |
| `alerts.copySlack` | Copy Slack | _[translate here]_ |
| `alerts.copied` | Copied \u2713 | _[translate here]_ |
| `alerts.noAlerts` | No alerts | _[translate here]_ |
| `map.openInDashboard` | Open in dashboard | _[translate here]_ |
| `auth.login` | Login | _[translate here]_ |
| `auth.chooseUser` | Choose a demo user | _[translate here]_ |
| `auth.enterAs` | Enter as {name} | _[translate here]_ |
| `auth.role.owner` | Artist (Owner) | _[translate here]_ |
| `auth.role.agencyManager` | Agency Manager | _[translate here]_ |
| `auth.role.artistManager` | Artist Team (Manager) | _[translate here]_ |
| `auth.scope.finance.ro` | Finance: read-only | _[translate here]_ |
| `auth.scope.edit.showsTravel` | Edit shows/travel | _[translate here]_ |
| `auth.scope.full` | Full access | _[translate here]_ |
| `login.title` | Welcome to On Tour | _[translate here]_ |
| `login.subtitle` | Your tour management command center | _[translate here]_ |
| `login.enterAs` | Enter as {name} | _[translate here]_ |
| `login.quick.agency` | Enter as Shalizi (agency) | _[translate here]_ |
| `login.quick.artist` | Enter as Danny (artist) | _[translate here]_ |
| `login.remember` | Remember me | _[translate here]_ |
| `login.usernameOrEmail` | Username or Email | _[translate here]_ |
| `role.agencyManager` | Agency Manager | _[translate here]_ |
| `role.artistOwner` | Artist (Owner) | _[translate here]_ |
| `role.artistManager` | Artist Team (Manager) | _[translate here]_ |
| `scope.shows.write` | shows: write | _[translate here]_ |
| `scope.shows.read` | shows: read | _[translate here]_ |
| `scope.travel.book` | travel: book | _[translate here]_ |
| `scope.travel.read` | travel: read | _[translate here]_ |
| `scope.finance.read` | finance: read | _[translate here]_ |
| `scope.finance.none` | finance: none | _[translate here]_ |
| `hero.enter` | Enter | _[translate here]_ |
| `marketing.nav.features` | Features | _[translate here]_ |
| `marketing.nav.product` | Product | _[translate here]_ |
| `marketing.nav.pricing` | Pricing | _[translate here]_ |
| `marketing.nav.testimonials` | Testimonials | _[translate here]_ |
| `marketing.nav.cta` | Get started | _[translate here]_ |
| `marketing.cta.primary` | Start free | _[translate here]_ |
| `marketing.cta.secondary` | Watch demo | _[translate here]_ |
| `marketing.cta.login` | Log in | _[translate here]_ |
| `hero.demo.artist` | View demo as Danny | _[translate here]_ |
| `hero.demo.agency` | View demo as Adam | _[translate here]_ |
| `hero.persona.question` | I am a... | _[translate here]_ |
| `hero.persona.artist` | Artist / Manager | _[translate here]_ |
| `hero.persona.agency` | Agency | _[translate here]_ |
| `hero.subtitle.artist` | Take control of your finances and tour logistics. See your career from a single dashboard. | _[translate here]_ |
| `hero.subtitle.agency` | Manage your entire roster from one place. Give your artists visibility and generate reports in seconds. | _[translate here]_ |
| `home.action.title` | Stop Surviving. Start Commanding. | _[translate here]_ |
| `home.action.subtitle` | See how On Tour App can transform your next tour. | _[translate here]_ |
| `home.action.cta` | Request a Personalized Demo | _[translate here]_ |
| `inside.map.desc.artist` | Visualize your tour route and anticipate travel needs | _[translate here]_ |
| `inside.finance.desc.artist` | Track your earnings, expenses and profitability in real-time | _[translate here]_ |
| `inside.actions.desc.artist` | Stay on top of contracts, payments and upcoming deadlines | _[translate here]_ |
| `inside.map.desc.agency` | Monitor all your artists\ | _[translate here]_ |
| `inside.finance.desc.agency` | Consolidated financial overview across your entire roster | _[translate here]_ |
| `inside.actions.desc.agency` | Centralized task management for team coordination and client updates | _[translate here]_ |
| `inside.title` | What you | _[translate here]_ |
| `shows.summary.avgFee` | Avg Fee | _[translate here]_ |
| `shows.summary.avgMargin` | Avg Margin | _[translate here]_ |
| `inside.map.title` | Map | _[translate here]_ |
| `inside.map.desc` | Live HUD with shows, route and risks | _[translate here]_ |
| `inside.finance.title` | Finance | _[translate here]_ |
| `inside.finance.desc` | Monthly KPIs, pipeline and forecast | _[translate here]_ |
| `inside.actions.title` | Actions | _[translate here]_ |
| `inside.actions.desc` | Action Hub with priorities and shortcuts | _[translate here]_ |
| `how.title` | How it works | _[translate here]_ |
| `how.step.invite` | Invite your team | _[translate here]_ |
| `how.step.connect` | Connect with artists or agencies | _[translate here]_ |
| `how.step.views` | Work by views: HUD, Finance, Shows | _[translate here]_ |
| `how.step.connectData` | Connect your data | _[translate here]_ |
| `how.step.connectData.desc` | Import shows, connect calendar, or get invited by your agency | _[translate here]_ |
| `how.step.visualize` | Visualize your world | _[translate here]_ |
| `how.step.visualize.desc` | Your tour comes alive on the map, finances clarify in the dashboard | _[translate here]_ |
| `how.step.act` | Act with intelligence | _[translate here]_ |
| `how.step.connectData.artist` | Import your shows, connect your calendar, or get invited by your agency. Your tour data in one place. | _[translate here]_ |
| `how.step.connectData.agency` | Invite your artists and connect their data. Centralize all tour information across your roster. | _[translate here]_ |
| `how.step.visualize.artist` | Your tour comes alive on the map, finances clarify in your personal dashboard. See your career at a glance. | _[translate here]_ |
| `how.step.visualize.agency` | Monitor all artists\ | _[translate here]_ |
| `how.step.act.artist` | Receive proactive alerts about contracts, payments, and deadlines. Make data-driven decisions with confidence. | _[translate here]_ |
| `how.step.act.agency` | Prioritize team tasks, generate reports instantly, and keep all stakeholders informed with real-time updates. | _[translate here]_ |
| `how.multiTenant` | Multi-tenant demo: switch between Agency and Artist contexts | _[translate here]_ |
| `trust.privacy` | Privacy: local demo (your browser) | _[translate here]_ |
| `trust.accessibility` | Accessibility: shortcuts “?” | _[translate here]_ |
| `trust.support` | Support | _[translate here]_ |
| `trust.demo` | Local demo — no data uploaded | _[translate here]_ |
| `testimonials.title` | Trusted by Industry Leaders | _[translate here]_ |
| `testimonials.subtitle` | Real stories from the touring industry | _[translate here]_ |
| `testimonials.subtitle.artist` | See how artists are taking control of their careers | _[translate here]_ |
| `testimonials.subtitle.agency` | Discover how agencies are transforming their operations | _[translate here]_ |
| `common.skipToContent` | Skip to content | _[translate here]_ |
| `alerts.slackCopied` | Slack payload copied | _[translate here]_ |
| `alerts.copyManual` | Open window to copy manually | _[translate here]_ |
| `ah.title` | Action Hub | _[translate here]_ |
| `ah.tab.pending` | Pending | _[translate here]_ |
| `ah.tab.shows` | This Month | _[translate here]_ |
| `ah.tab.travel` | Travel | _[translate here]_ |
| `ah.tab.insights` | Insights | _[translate here]_ |
| `ah.filter.all` | All | _[translate here]_ |
| `ah.filter.risk` | Risk | _[translate here]_ |
| `ah.filter.urgency` | Urgency | _[translate here]_ |
| `ah.filter.opportunity` | Opportunity | _[translate here]_ |
| `ah.filter.offer` | Offer | _[translate here]_ |
| `ah.filter.finrisk` | Finrisk | _[translate here]_ |
| `ah.cta.addTravel` | Add travel | _[translate here]_ |
| `ah.cta.followUp` | Follow up | _[translate here]_ |
| `ah.cta.review` | Review | _[translate here]_ |
| `ah.cta.open` | Open | _[translate here]_ |
| `ah.empty` | All caught up! | _[translate here]_ |
| `ah.openTravel` | Open Travel | _[translate here]_ |
| `ah.done` | Done | _[translate here]_ |
| `ah.typeFilter` | Type filter | _[translate here]_ |
| `ah.why` | Why? | _[translate here]_ |
| `ah.why.title` | Why this priority? | _[translate here]_ |
| `ah.why.score` | Score | _[translate here]_ |
| `ah.why.impact` | Impact | _[translate here]_ |
| `ah.why.amount` | Amount | _[translate here]_ |
| `ah.why.inDays` | In | _[translate here]_ |
| `ah.why.overdue` | Overdue | _[translate here]_ |
| `ah.why.kind` | Type | _[translate here]_ |
| `finance.quicklook` | Finance Quicklook | _[translate here]_ |
| `finance.ledger` | Ledger | _[translate here]_ |
| `finance.targets` | Targets | _[translate here]_ |
| `finance.targets.month` | Monthly targets | _[translate here]_ |
| `finance.targets.year` | Yearly targets | _[translate here]_ |
| `finance.pipeline` | Pipeline | _[translate here]_ |
| `finance.pipeline.subtitle` | Expected value (weighted by stage) | _[translate here]_ |
| `finance.openFull` | Open full finance | _[translate here]_ |
| `finance.pivot` | Pivot | _[translate here]_ |
| `finance.pivot.group` | Group | _[translate here]_ |
| `finance.ar.view` | View | _[translate here]_ |
| `finance.ar.remind` | Remind | _[translate here]_ |
| `finance.ar.reminder.queued` | Reminder queued | _[translate here]_ |
| `finance.thisMonth` | This Month | _[translate here]_ |
| `finance.income` | Income | _[translate here]_ |
| `finance.expenses` | Expenses | _[translate here]_ |
| `finance.net` | Net | _[translate here]_ |
| `finance.byStatus` | By status | _[translate here]_ |
| `finance.byMonth` | by month | _[translate here]_ |
| `finance.confirmed` | Confirmed | _[translate here]_ |
| `finance.pending` | Pending | _[translate here]_ |
| `finance.compare` | Compare prev | _[translate here]_ |
| `charts.resetZoom` | Reset zoom | _[translate here]_ |
| `common.current` | Current | _[translate here]_ |
| `common.compare` | Compare | _[translate here]_ |
| `common.reminder` | Reminder | _[translate here]_ |
| `finance.ui.view` | View | _[translate here]_ |
| `finance.ui.classic` | Classic | _[translate here]_ |
| `finance.ui.beta` | New (beta) | _[translate here]_ |
| `finance.offer` | Offer | _[translate here]_ |
| `finance.shows` | shows | _[translate here]_ |
| `finance.noShowsMonth` | No shows this month | _[translate here]_ |
| `finance.hideAmounts` | Hide amounts | _[translate here]_ |
| `finance.hidden` | Hidden | _[translate here]_ |
| `common.open` | Open | _[translate here]_ |
| `common.apply` | Apply | _[translate here]_ |
| `common.saveView` | Save view | _[translate here]_ |
| `common.import` | Import | _[translate here]_ |
| `common.export` | Export | _[translate here]_ |
| `common.copied` | Copied ✓ | _[translate here]_ |
| `common.markDone` | Mark done | _[translate here]_ |
| `common.hideItem` | Hide | _[translate here]_ |
| `views.import.invalidShape` | Invalid views JSON shape | _[translate here]_ |
| `views.import.invalidJson` | Invalid JSON | _[translate here]_ |
| `common.tomorrow` | Tomorrow | _[translate here]_ |
| `common.go` | Go | _[translate here]_ |
| `common.show` | Show | _[translate here]_ |
| `common.search` | Search | _[translate here]_ |
| `hud.next3weeks` | Next 3 weeks | _[translate here]_ |
| `hud.noTrips3weeks` | No upcoming trips in 3 weeks | _[translate here]_ |
| `hud.openShow` | open show | _[translate here]_ |
| `hud.openTrip` | open travel | _[translate here]_ |
| `hud.view.whatsnext` | What | _[translate here]_ |
| `hud.view.month` | This Month | _[translate here]_ |
| `hud.view.financials` | Financials | _[translate here]_ |
| `hud.view.whatsnext.desc` | Upcoming 14 day summary | _[translate here]_ |
| `hud.view.month.desc` | Monthly financial & show snapshot | _[translate here]_ |
| `hud.view.financials.desc` | Financial intelligence breakdown | _[translate here]_ |
| `hud.layer.heat` | Heat | _[translate here]_ |
| `hud.layer.status` | Status | _[translate here]_ |
| `hud.layer.route` | Route | _[translate here]_ |
| `hud.views` | HUD views | _[translate here]_ |
| `hud.layers` | Map layers | _[translate here]_ |
| `hud.missionControl` | Mission Control | _[translate here]_ |
| `hud.subtitle` | Realtime map and upcoming shows | _[translate here]_ |
| `hud.risks` | Risks | _[translate here]_ |
| `hud.assignProducer` | Assign producer | _[translate here]_ |
| `hud.mapLoadError` | Map failed to load. Please retry. | _[translate here]_ |
| `common.retry` | Retry | _[translate here]_ |
| `hud.viewChanged` | View changed to | _[translate here]_ |
| `hud.openEvent` | open event | _[translate here]_ |
| `hud.type.flight` | Flight | _[translate here]_ |
| `hud.type.ground` | Ground | _[translate here]_ |
| `hud.type.event` | Event | _[translate here]_ |
| `hud.fin.avgNetMonth` | Avg Net (Month) | _[translate here]_ |
| `hud.fin.runRateYear` | Run Rate (Year) | _[translate here]_ |
| `finance.forecast` | Forecast vs Actual | _[translate here]_ |
| `finance.forecast.legend.actual` | Actual net | _[translate here]_ |
| `finance.forecast.legend.p50` | Forecast p50 | _[translate here]_ |
| `finance.forecast.legend.band` | Confidence band | _[translate here]_ |
| `finance.forecast.alert.under` | Under forecast by | _[translate here]_ |
| `finance.forecast.alert.above` | Above optimistic by | _[translate here]_ |
| `map.toggle.status` | Toggle status markers | _[translate here]_ |
| `map.toggle.route` | Toggle route line | _[translate here]_ |
| `map.toggle.heat` | Toggle heat circles | _[translate here]_ |
| `shows.exportCsv` | Export CSV | _[translate here]_ |
| `shows.filters.from` | From | _[translate here]_ |
| `shows.filters.to` | To | _[translate here]_ |
| `shows.items` | items | _[translate here]_ |
| `shows.date.presets` | Presets | _[translate here]_ |
| `shows.date.thisMonth` | This Month | _[translate here]_ |
| `shows.date.nextMonth` | Next Month | _[translate here]_ |
| `shows.tooltip.net` | Fee minus WHT, commissions, and costs | _[translate here]_ |
| `shows.tooltip.margin` | Net divided by Fee (%) | _[translate here]_ |
| `shows.table.margin` | Margin % | _[translate here]_ |
| `shows.editor.margin.formula` | Margin % = Net/Fee | _[translate here]_ |
| `shows.tooltip.wht` | Withholding tax percentage applied to the fee | _[translate here]_ |
| `shows.editor.label.name` | Show name | _[translate here]_ |
| `shows.editor.placeholder.name` | Festival or show name | _[translate here]_ |
| `shows.editor.placeholder.venue` | Venue name | _[translate here]_ |
| `shows.editor.help.venue` | Optional venue / room name | _[translate here]_ |
| `shows.editor.help.fee` | Gross fee agreed (before taxes, commissions, costs) | _[translate here]_ |
| `shows.editor.help.wht` | Local withholding tax percentage (auto-suggested by country) | _[translate here]_ |
| `shows.editor.saving` | Saving… | _[translate here]_ |
| `shows.editor.saved` | Saved ✓ | _[translate here]_ |
| `shows.editor.save.error` | Save failed | _[translate here]_ |
| `shows.editor.cost.templates` | Templates | _[translate here]_ |
| `shows.editor.cost.addTemplate` | Add template | _[translate here]_ |
| `shows.editor.cost.subtotals` | Subtotals | _[translate here]_ |
| `shows.editor.cost.type` | Type | _[translate here]_ |
| `shows.editor.cost.amount` | Amount | _[translate here]_ |
| `shows.editor.cost.desc` | Description | _[translate here]_ |
| `shows.editor.status.help` | Current lifecycle state of the show | _[translate here]_ |
| `shows.editor.cost.template.travel` | Travel basics | _[translate here]_ |
| `shows.editor.cost.template.production` | Production basics | _[translate here]_ |
| `shows.editor.cost.template.marketing` | Marketing basics | _[translate here]_ |
| `shows.editor.quick.label` | Quick add costs | _[translate here]_ |
| `shows.editor.quick.hint` | e.g., Hotel 1200 | _[translate here]_ |
| `shows.editor.quick.placeholder` | 20/04/2025  | _[translate here]_ |
| `shows.editor.quick.preview.summary` | Will set: {fields} | _[translate here]_ |
| `shows.editor.quick.apply` | Apply | _[translate here]_ |
| `shows.editor.quick.parseError` | Cannot interpret | _[translate here]_ |
| `shows.editor.quick.applied` | Quick entry applied | _[translate here]_ |
| `shows.editor.bulk.title` | Bulk add costs | _[translate here]_ |
| `shows.editor.bulk.open` | Bulk add | _[translate here]_ |
| `shows.editor.bulk.placeholder` | Type, Amount, Description\nTravel, 1200, Flights BCN-MAD\nProduction\t500\tBackline | _[translate here]_ |
| `shows.editor.bulk.preview` | Preview | _[translate here]_ |
| `shows.editor.bulk.parsed` | Parsed {count} lines | _[translate here]_ |
| `shows.editor.bulk.add` | Add costs | _[translate here]_ |
| `shows.editor.bulk.cancel` | Cancel | _[translate here]_ |
| `shows.editor.bulk.invalidLine` | Invalid line {n} | _[translate here]_ |
| `shows.editor.bulk.empty` | No valid lines | _[translate here]_ |
| `shows.editor.bulk.help` | Paste CSV or tab-separated lines: Type, Amount, Description (amount optional) | _[translate here]_ |
| `shows.editor.restored` | Restored draft | _[translate here]_ |
| `shows.editor.quick.icon.date` | Date | _[translate here]_ |
| `shows.editor.quick.icon.city` | City | _[translate here]_ |
| `shows.editor.quick.icon.country` | Country | _[translate here]_ |
| `shows.editor.quick.icon.fee` | Fee | _[translate here]_ |
| `shows.editor.quick.icon.whtPct` | WHT % | _[translate here]_ |
| `shows.editor.quick.icon.name` | Name | _[translate here]_ |
| `shows.editor.cost.templateMenu` | Cost templates | _[translate here]_ |
| `shows.editor.cost.template.applied` | Template applied | _[translate here]_ |
| `shows.editor.cost.duplicate` | Duplicate | _[translate here]_ |
| `shows.editor.cost.moveUp` | Move up | _[translate here]_ |
| `shows.editor.cost.moveDown` | Move down | _[translate here]_ |
| `shows.editor.costs.title` | Costs | _[translate here]_ |
| `shows.editor.costs.empty` | No costs yet — add one | _[translate here]_ |
| `shows.editor.costs.recent` | Recent | _[translate here]_ |
| `shows.editor.costs.templates` | Templates | _[translate here]_ |
| `shows.editor.costs.subtotal` | Subtotal {category} | _[translate here]_ |
| `shows.editor.wht.suggest` | Suggest {pct}% | _[translate here]_ |
| `shows.editor.wht.apply` | Apply {pct}% | _[translate here]_ |
| `shows.editor.wht.suggest.applied` | Suggestion applied | _[translate here]_ |
| `shows.editor.wht.tooltip.es` | Typical IRPF in ES: 15% (editable) | _[translate here]_ |
| `shows.editor.wht.tooltip.generic` | Typical withholding suggestion | _[translate here]_ |
| `shows.editor.status.hint` | Change here or via badge | _[translate here]_ |
| `shows.editor.wht.hint.es` | Typical ES withholding: 15% (editable) | _[translate here]_ |
| `shows.editor.wht.hint.generic` | Withholding percentage (editable) | _[translate here]_ |
| `shows.editor.commission.default` | Default {pct}% | _[translate here]_ |
| `shows.editor.commission.overridden` | Override | _[translate here]_ |
| `shows.editor.commission.overriddenIndicator` | Commission overridden | _[translate here]_ |
| `shows.editor.commission.reset` | Reset to default | _[translate here]_ |
| `shows.editor.label.currency` | Currency | _[translate here]_ |
| `shows.editor.help.currency` | Contract currency | _[translate here]_ |
| `shows.editor.fx.rateOn` | Rate | _[translate here]_ |
| `shows.editor.fx.convertedFee` | ≈ {amount} {base} | _[translate here]_ |
| `shows.editor.fx.unavailable` | Rate unavailable | _[translate here]_ |
| `shows.editor.actions.promote` | Promote | _[translate here]_ |
| `shows.editor.actions.planTravel` | Plan travel | _[translate here]_ |
| `shows.editor.state.hint` | Use the badge or this selector | _[translate here]_ |
| `shows.editor.save.create` | Save | _[translate here]_ |
| `shows.editor.save.edit` | Save changes | _[translate here]_ |
| `shows.editor.save.retry` | Retry | _[translate here]_ |
| `shows.editor.tab.active` | Tab {label} active | _[translate here]_ |
| `shows.editor.tab.restored` | Restored last tab: {label} | _[translate here]_ |
| `shows.editor.errors.count` | There are {n} errors | _[translate here]_ |
| `shows.totals.fees` | Fees | _[translate here]_ |
| `shows.totals.net` | Net | _[translate here]_ |
| `shows.totals.hide` | Hide | _[translate here]_ |
| `shows.totals.show` | Show totals | _[translate here]_ |
| `shows.view.list` | List | _[translate here]_ |
| `shows.view.board` | Board | _[translate here]_ |
| `shows.views.none` | Views | _[translate here]_ |
| `views.manage` | Manage views | _[translate here]_ |
| `views.saved` | Saved | _[translate here]_ |
| `views.apply` | Apply | _[translate here]_ |
| `views.none` | No saved views | _[translate here]_ |
| `views.deleted` | Deleted | _[translate here]_ |
| `views.export` | Export | _[translate here]_ |
| `views.import` | Import | _[translate here]_ |
| `views.import.hint` | Paste JSON of views to import | _[translate here]_ |
| `views.openLab` | Open Layout Lab | _[translate here]_ |
| `views.share` | Copy share link | _[translate here]_ |
| `views.export.copied` | Export copied | _[translate here]_ |
| `views.imported` | Views imported | _[translate here]_ |
| `views.import.invalid` | Invalid JSON | _[translate here]_ |
| `views.label` | View | _[translate here]_ |
| `views.names.default` | Default | _[translate here]_ |
| `views.names.finance` | Finance | _[translate here]_ |
| `views.names.operations` | Operations | _[translate here]_ |
| `views.names.promo` | Promotion | _[translate here]_ |
| `demo.banner` | Demo data • No live sync | _[translate here]_ |
| `demo.load` | Load demo data | _[translate here]_ |
| `demo.loaded` | Demo data loaded | _[translate here]_ |
| `demo.clear` | Clear data | _[translate here]_ |
| `demo.cleared` | All data cleared | _[translate here]_ |
| `demo.password.prompt` | Enter demo password | _[translate here]_ |
| `demo.password.invalid` | Incorrect password | _[translate here]_ |
| `shows.views.delete` | Delete | _[translate here]_ |
| `shows.views.namePlaceholder` | View name | _[translate here]_ |
| `shows.views.save` | Save | _[translate here]_ |
| `shows.status.canceled` | Canceled | _[translate here]_ |
| `shows.status.archived` | Archived | _[translate here]_ |
| `shows.status.offer` | Offer | _[translate here]_ |
| `shows.status.pending` | Pending | _[translate here]_ |
| `shows.status.confirmed` | Confirmed | _[translate here]_ |
| `shows.status.postponed` | Postponed | _[translate here]_ |
| `shows.bulk.selected` | selected | _[translate here]_ |
| `shows.bulk.confirm` | Confirm | _[translate here]_ |
| `shows.bulk.promote` | Promote | _[translate here]_ |
| `shows.bulk.export` | Export | _[translate here]_ |
| `shows.notes` | Notes | _[translate here]_ |
| `shows.virtualized.hint` | Virtualized list active | _[translate here]_ |
| `story.title` | Story mode | _[translate here]_ |
| `story.timeline` | Timeline | _[translate here]_ |
| `story.play` | Play | _[translate here]_ |
| `story.pause` | Pause | _[translate here]_ |
| `story.cta` | Story mode | _[translate here]_ |
| `story.scrub` | Scrub timeline | _[translate here]_ |
| `finance.overview` | Finance overview | _[translate here]_ |
| `shows.title` | Shows | _[translate here]_ |
| `shows.notFound` | Show not found | _[translate here]_ |
| `shows.search.placeholder` | Search city/country | _[translate here]_ |
| `shows.add` | Add show | _[translate here]_ |
| `shows.edit` | Edit | _[translate here]_ |
| `shows.summary.upcoming` | Upcoming | _[translate here]_ |
| `shows.summary.totalFees` | Total Fees | _[translate here]_ |
| `shows.summary.estNet` | Est. Net | _[translate here]_ |
| `shows.summary.avgWht` | Avg WHT | _[translate here]_ |
| `shows.table.date` | Date | _[translate here]_ |
| `shows.table.name` | Show | _[translate here]_ |
| `shows.table.city` | City | _[translate here]_ |
| `shows.table.country` | Country | _[translate here]_ |
| `shows.table.venue` | Venue | _[translate here]_ |
| `shows.table.promoter` | Promoter | _[translate here]_ |
| `shows.table.wht` | WHT % | _[translate here]_ |
| `shows.table.type` | Type | _[translate here]_ |
| `shows.table.description` | Description | _[translate here]_ |
| `shows.table.amount` | Amount | _[translate here]_ |
| `shows.table.remove` | Remove | _[translate here]_ |
| `shows.table.agency.mgmt` | Mgmt | _[translate here]_ |
| `shows.table.agency.booking` | Booking | _[translate here]_ |
| `shows.table.agencies` | Agencies | _[translate here]_ |
| `shows.table.notes` | Notes | _[translate here]_ |
| `shows.table.fee` | Fee | _[translate here]_ |
| `shows.selected` | selected | _[translate here]_ |
| `shows.count.singular` | show | _[translate here]_ |
| `shows.count.plural` | shows | _[translate here]_ |
| `settings.title` | Settings | _[translate here]_ |
| `settings.personal` | Personal | _[translate here]_ |
| `settings.preferences` | Preferences | _[translate here]_ |
| `settings.organization` | Organization | _[translate here]_ |
| `settings.billing` | Billing | _[translate here]_ |
| `settings.currency` | Currency | _[translate here]_ |
| `settings.units` | Distance units | _[translate here]_ |
| `settings.agencies` | Agencies | _[translate here]_ |
| `settings.localNote` | Preferences are saved locally on this device. | _[translate here]_ |
| `settings.language` | Language | _[translate here]_ |
| `settings.language.en` | English | _[translate here]_ |
| `settings.language.es` | Spanish | _[translate here]_ |
| `settings.dashboardView` | Default Dashboard View | _[translate here]_ |
| `settings.presentation` | Presentation mode | _[translate here]_ |
| `settings.comparePrev` | Compare vs previous period | _[translate here]_ |
| `settings.defaultStatuses` | Default status filters | _[translate here]_ |
| `settings.defaultRegion` | Default region | _[translate here]_ |
| `settings.region.all` | All | _[translate here]_ |
| `settings.region.AMER` | Americas | _[translate here]_ |
| `settings.region.EMEA` | EMEA | _[translate here]_ |
| `settings.region.APAC` | APAC | _[translate here]_ |
| `settings.agencies.booking` | Booking Agencies | _[translate here]_ |
| `settings.agencies.management` | Management Agencies | _[translate here]_ |
| `settings.agencies.add` | Add | _[translate here]_ |
| `settings.agencies.hideForm` | Hide form | _[translate here]_ |
| `settings.agencies.none` | No agencies | _[translate here]_ |
| `settings.agencies.name` | Name | _[translate here]_ |
| `settings.agencies.commission` | Commission % | _[translate here]_ |
| `settings.agencies.territoryMode` | Territory Mode | _[translate here]_ |
| `settings.agencies.continents` | Continents | _[translate here]_ |
| `settings.agencies.countries` | Countries (comma or space separated ISO2) | _[translate here]_ |
| `settings.agencies.addBooking` | Add booking | _[translate here]_ |
| `settings.agencies.addManagement` | Add management | _[translate here]_ |
| `settings.agencies.reset` | Reset | _[translate here]_ |
| `settings.agencies.remove` | Remove agency | _[translate here]_ |
| `settings.agencies.limitReached` | Limit reached (max 3) | _[translate here]_ |
| `settings.agencies.countries.invalid` | Countries must be 2-letter ISO codes (e.g., US ES DE), separated by commas or spaces. | _[translate here]_ |
| `settings.continent.NA` | North America | _[translate here]_ |
| `settings.continent.SA` | South America | _[translate here]_ |
| `settings.continent.EU` | Europe | _[translate here]_ |
| `settings.continent.AF` | Africa | _[translate here]_ |
| `settings.continent.AS` | Asia | _[translate here]_ |
| `settings.continent.OC` | Oceania | _[translate here]_ |
| `settings.territory.worldwide` | Worldwide | _[translate here]_ |
| `settings.territory.continents` | Continents | _[translate here]_ |
| `settings.territory.countries` | Countries | _[translate here]_ |
| `settings.export` | Export settings | _[translate here]_ |
| `settings.import` | Import settings | _[translate here]_ |
| `settings.reset` | Reset to defaults | _[translate here]_ |
| `settings.preview` | Preview | _[translate here]_ |
| `shows.table.net` | Net | _[translate here]_ |
| `shows.table.status` | Status | _[translate here]_ |
| `shows.selectAll` | Select all | _[translate here]_ |
| `shows.selectRow` | Select row | _[translate here]_ |
| `shows.editor.tabs` | Editor tabs | _[translate here]_ |
| `shows.editor.tab.details` | Details | _[translate here]_ |
| `shows.editor.tab.finance` | Finance | _[translate here]_ |
| `shows.editor.tab.costs` | Costs | _[translate here]_ |
| `shows.editor.finance.commissions` | Commissions | _[translate here]_ |
| `shows.editor.add` | Add show | _[translate here]_ |
| `shows.editor.edit` | Edit show | _[translate here]_ |
| `shows.editor.subtitleAdd` | Create a new event | _[translate here]_ |
| `shows.editor.label.status` | Status | _[translate here]_ |
| `shows.editor.label.date` | Date | _[translate here]_ |
| `shows.editor.label.city` | City | _[translate here]_ |
| `shows.editor.label.country` | Country | _[translate here]_ |
| `shows.editor.label.venue` | Venue | _[translate here]_ |
| `shows.editor.label.promoter` | Promoter | _[translate here]_ |
| `shows.editor.label.fee` | Fee | _[translate here]_ |
| `shows.editor.label.wht` | WHT % | _[translate here]_ |
| `shows.editor.label.mgmt` | Mgmt Agency | _[translate here]_ |
| `shows.editor.label.booking` | Booking Agency | _[translate here]_ |
| `shows.editor.label.notes` | Notes | _[translate here]_ |
| `shows.editor.validation.cityRequired` | City is required | _[translate here]_ |
| `shows.editor.validation.countryRequired` | Country is required | _[translate here]_ |
| `shows.editor.validation.dateRequired` | Date is required | _[translate here]_ |
| `shows.editor.validation.feeGtZero` | Fee must be greater than 0 | _[translate here]_ |
| `shows.editor.validation.whtRange` | WHT must be between 0% and 50% | _[translate here]_ |
| `shows.dialog.close` | Close | _[translate here]_ |
| `shows.dialog.cancel` | Cancel | _[translate here]_ |
| `shows.dialog.save` | Save | _[translate here]_ |
| `shows.dialog.saveChanges` | Save changes | _[translate here]_ |
| `shows.dialog.delete` | Delete | _[translate here]_ |
| `shows.editor.validation.fail` | Fix errors to continue | _[translate here]_ |
| `shows.editor.toast.saved` | Saved | _[translate here]_ |
| `shows.editor.toast.deleted` | Deleted | _[translate here]_ |
| `shows.editor.toast.undo` | Undo | _[translate here]_ |
| `shows.editor.toast.restored` | Restored | _[translate here]_ |
| `shows.editor.toast.deleting` | Deleting… | _[translate here]_ |
| `shows.editor.toast.discarded` | Changes discarded | _[translate here]_ |
| `shows.editor.toast.validation` | Please correct the highlighted errors | _[translate here]_ |
| `shows.editor.summary.fee` | Fee | _[translate here]_ |
| `shows.editor.summary.wht` | WHT | _[translate here]_ |
| `shows.editor.summary.costs` | Costs | _[translate here]_ |
| `shows.editor.summary.net` | Est. Net | _[translate here]_ |
| `shows.editor.discard.title` | Discard changes? | _[translate here]_ |
| `shows.editor.discard.body` | You have unsaved changes. They will be lost. | _[translate here]_ |
| `shows.editor.discard.cancel` | Keep editing | _[translate here]_ |
| `shows.editor.discard.confirm` | Discard | _[translate here]_ |
| `shows.editor.delete.confirmTitle` | Delete show? | _[translate here]_ |
| `shows.editor.delete.confirmBody` | This action cannot be undone. | _[translate here]_ |
| `shows.editor.delete.confirm` | Delete | _[translate here]_ |
| `shows.editor.delete.cancel` | Cancel | _[translate here]_ |
| `shows.noCosts` | No costs yet | _[translate here]_ |
| `shows.filters.region` | Region | _[translate here]_ |
| `shows.filters.region.all` | All | _[translate here]_ |
| `shows.filters.region.AMER` | AMER | _[translate here]_ |
| `shows.filters.region.EMEA` | EMEA | _[translate here]_ |
| `shows.filters.region.APAC` | APAC | _[translate here]_ |
| `shows.filters.feeMin` | Min fee | _[translate here]_ |
| `shows.filters.feeMax` | Max fee | _[translate here]_ |
| `shows.views.export` | Export views | _[translate here]_ |
| `shows.views.import` | Import views | _[translate here]_ |
| `shows.views.applied` | View applied | _[translate here]_ |
| `shows.bulk.delete` | Delete selected | _[translate here]_ |
| `shows.bulk.setWht` | Set WHT % | _[translate here]_ |
| `shows.bulk.applyWht` | Apply WHT | _[translate here]_ |
| `shows.bulk.setStatus` | Set status | _[translate here]_ |
| `shows.bulk.apply` | Apply | _[translate here]_ |
| `shows.travel.title` | Location | _[translate here]_ |
| `shows.travel.quick` | Travel | _[translate here]_ |
| `shows.travel.soon` | Upcoming confirmed show — consider adding travel. | _[translate here]_ |
| `shows.travel.soonConfirmed` | Upcoming confirmed show — consider adding travel. | _[translate here]_ |
| `shows.travel.soonGeneric` | Upcoming show — consider planning travel. | _[translate here]_ |
| `shows.travel.tripExists` | Trip already scheduled around this date | _[translate here]_ |
| `shows.travel.noCta` | No travel action needed | _[translate here]_ |
| `shows.travel.plan` | Plan travel | _[translate here]_ |
| `cmd.dialog` | Command palette | _[translate here]_ |
| `cmd.placeholder` | Search shows or actions… | _[translate here]_ |
| `cmd.type.show` | Show | _[translate here]_ |
| `cmd.type.action` | Action | _[translate here]_ |
| `cmd.noResults` | No results | _[translate here]_ |
| `cmd.footer.hint` | Enter to run • Esc to close | _[translate here]_ |
| `cmd.footer.tip` | Tip: press ? for shortcuts | _[translate here]_ |
| `cmd.openFilters` | Open Filters | _[translate here]_ |
| `cmd.mask.enable` | Enable Mask | _[translate here]_ |
| `cmd.mask.disable` | Disable Mask | _[translate here]_ |
| `cmd.presentation.enable` | Enable Presentation Mode | _[translate here]_ |
| `cmd.presentation.disable` | Disable Presentation Mode | _[translate here]_ |
| `cmd.shortcuts` | Show Shortcuts Overlay | _[translate here]_ |
| `cmd.switch.default` | Switch View: Default | _[translate here]_ |
| `cmd.switch.finance` | Switch View: Finance | _[translate here]_ |
| `cmd.switch.operations` | Switch View: Operations | _[translate here]_ |
| `cmd.switch.promo` | Switch View: Promotion | _[translate here]_ |
| `cmd.openAlerts` | Open Alert Center | _[translate here]_ |
| `cmd.go.shows` | Go to Shows | _[translate here]_ |
| `cmd.go.travel` | Go to Travel | _[translate here]_ |
| `cmd.go.finance` | Go to Finance | _[translate here]_ |
| `cmd.go.org` | Go to Org Overview | _[translate here]_ |
| `cmd.go.members` | Go to Org Members | _[translate here]_ |
| `cmd.go.clients` | Go to Org Clients | _[translate here]_ |
| `cmd.go.teams` | Go to Org Teams | _[translate here]_ |
| `cmd.go.links` | Go to Org Links | _[translate here]_ |
| `cmd.go.reports` | Go to Org Reports | _[translate here]_ |
| `cmd.go.documents` | Go to Org Documents | _[translate here]_ |
| `cmd.go.integrations` | Go to Org Integrations | _[translate here]_ |
| `cmd.go.billing` | Go to Org Billing | _[translate here]_ |
| `cmd.go.branding` | Go to Org Branding | _[translate here]_ |
| `shortcuts.dialog` | Keyboard shortcuts | _[translate here]_ |
| `shortcuts.title` | Shortcuts | _[translate here]_ |
| `shortcuts.desc` | Use these to move faster. Press Esc to close. | _[translate here]_ |
| `shortcuts.openPalette` | Open Command Palette | _[translate here]_ |
| `shortcuts.showOverlay` | Show this overlay | _[translate here]_ |
| `shortcuts.closeDialogs` | Close dialogs/popups | _[translate here]_ |
| `shortcuts.goTo` | Quick nav: g then key | _[translate here]_ |
| `alerts.open` | Open Alerts | _[translate here]_ |
| `alerts.loading` | Loading alerts… | _[translate here]_ |
| `actions.exportCsv` | Export CSV | _[translate here]_ |
| `actions.copyDigest` | Copy Digest | _[translate here]_ |
| `actions.digest.title` | Weekly Alerts Digest | _[translate here]_ |
| `actions.toast.csv` | CSV copied | _[translate here]_ |
| `actions.toast.digest` | Digest copied | _[translate here]_ |
| `actions.toast.share` | Link copied | _[translate here]_ |
| `welcome.title` | Welcome, {name} | _[translate here]_ |
| `welcome.subtitle.agency` | Manage your managers and artists | _[translate here]_ |
| `welcome.subtitle.artist` | All set for your upcoming shows | _[translate here]_ |
| `welcome.cta.dashboard` | Go to dashboard | _[translate here]_ |
| `welcome.section.team` | Your team | _[translate here]_ |
| `welcome.section.clients` | Your artists | _[translate here]_ |
| `welcome.section.assignments` | Managers per artist | _[translate here]_ |
| `welcome.section.links` | Connections & scopes | _[translate here]_ |
| `welcome.section.kpis` | This month | _[translate here]_ |
| `welcome.seats.usage` | Seats used | _[translate here]_ |
| `welcome.gettingStarted` | Getting started | _[translate here]_ |
| `welcome.recentlyViewed` | Recently viewed | _[translate here]_ |
| `welcome.changesSince` | Changes since your last visit | _[translate here]_ |
| `welcome.noChanges` | No changes | _[translate here]_ |
| `welcome.change.linkEdited` | Link scopes edited for Danny | _[translate here]_ |
| `welcome.change.memberInvited` | New manager invited | _[translate here]_ |
| `welcome.change.docUploaded` | New document uploaded | _[translate here]_ |
| `empty.noRecent` | No recent items | _[translate here]_ |
| `welcome.cta.inviteManager` | Invite manager | _[translate here]_ |
| `welcome.cta.connectArtist` | Connect artist | _[translate here]_ |
| `welcome.cta.createTeam` | Create team | _[translate here]_ |
| `welcome.cta.completeBranding` | Complete branding | _[translate here]_ |
| `welcome.cta.reviewShows` | Review shows | _[translate here]_ |
| `welcome.cta.connectCalendar` | Connect calendar | _[translate here]_ |
| `welcome.cta.switchOrg` | Change organization | _[translate here]_ |
| `welcome.cta.completeSetup` | Complete setup | _[translate here]_ |
| `welcome.progress.complete` | Setup complete | _[translate here]_ |
| `welcome.progress.incomplete` | {completed}/{total} steps completed | _[translate here]_ |
| `welcome.tooltip.inviteManager` | Invite team members to collaborate on shows and finances | _[translate here]_ |
| `welcome.tooltip.connectArtist` | Link with artists to manage their tours | _[translate here]_ |
| `welcome.tooltip.completeBranding` | Set up your organization\ | _[translate here]_ |
| `welcome.tooltip.connectCalendar` | Sync your calendar for automatic show scheduling | _[translate here]_ |
| `welcome.tooltip.switchOrg` | Switch between different organizations you manage | _[translate here]_ |
| `welcome.gettingStarted.invite` | Invite a manager | _[translate here]_ |
| `welcome.gettingStarted.connect` | Connect an artist | _[translate here]_ |
| `welcome.gettingStarted.review` | Review teams & links | _[translate here]_ |
| `welcome.gettingStarted.branding` | Complete branding | _[translate here]_ |
| `welcome.gettingStarted.shows` | Review shows | _[translate here]_ |
| `welcome.gettingStarted.calendar` | Connect calendar | _[translate here]_ |
| `welcome.dontShowAgain` | Don | _[translate here]_ |
| `welcome.openArtistDashboard` | Open {artist} dashboard | _[translate here]_ |
| `welcome.assign` | Assign | _[translate here]_ |
| `shows.toast.bulk.status` | Status: {status} ({n}) | _[translate here]_ |
| `shows.toast.bulk.confirm` | Confirmed | _[translate here]_ |
| `shows.toast.bulk.setStatus` | Status applied | _[translate here]_ |
| `shows.toast.bulk.setWht` | WHT applied | _[translate here]_ |
| `shows.toast.bulk.export` | Export started | _[translate here]_ |
| `shows.toast.bulk.delete` | Deleted | _[translate here]_ |
| `shows.toast.bulk.confirmed` | Confirmed ({n}) | _[translate here]_ |
| `shows.toast.bulk.wht` | WHT {pct}% ({n}) | _[translate here]_ |
| `filters.clear` | Clear | _[translate here]_ |
| `filters.more` | More filters | _[translate here]_ |
| `filters.cleared` | Filters cleared | _[translate here]_ |
| `filters.presets` | Presets | _[translate here]_ |
| `filters.presets.last7` | Last 7 days | _[translate here]_ |
| `filters.presets.last30` | Last 30 days | _[translate here]_ |
| `filters.presets.last90` | Last 90 days | _[translate here]_ |
| `filters.presets.mtd` | Month to date | _[translate here]_ |
| `filters.presets.ytd` | Year to date | _[translate here]_ |
| `filters.presets.qtd` | Quarter to date | _[translate here]_ |
| `filters.applied` | Filters applied | _[translate here]_ |
| `common.team` | Team | _[translate here]_ |
| `common.region` | Region | _[translate here]_ |
| `ah.planTravel` | Plan travel | _[translate here]_ |
| `map.cssWarning` | Map styles failed to load. Using basic fallback. | _[translate here]_ |
| `travel.offline` | Offline mode: showing cached itineraries. | _[translate here]_ |
| `travel.refresh.error` | Couldn | _[translate here]_ |
| `travel.search.title` | Search | _[translate here]_ |
| `travel.search.open_in_google` | Open in Google Flights | _[translate here]_ |
| `travel.search.mode.form` | Form | _[translate here]_ |
| `travel.search.mode.text` | Text | _[translate here]_ |
| `travel.search.show_text` | Write query | _[translate here]_ |
| `travel.search.hide_text` | Hide text input | _[translate here]_ |
| `travel.search.text.placeholder` | e.g., From MAD to CDG 2025-10-12 2 adults business | _[translate here]_ |
| `travel.nlp` | NLP | _[translate here]_ |
| `travel.search.origin` | Origin | _[translate here]_ |
| `travel.search.destination` | Destination | _[translate here]_ |
| `travel.search.departure_date` | Departure date | _[translate here]_ |
| `travel.search.searching` | Searching flights… | _[translate here]_ |
| `travel.search.searchMyFlight` | Search My Flight | _[translate here]_ |
| `travel.search.searchAgain` | Search Again | _[translate here]_ |
| `travel.search.error` | Error searching flights | _[translate here]_ |
| `travel.addPurchasedFlight` | Add Purchased Flight | _[translate here]_ |
| `travel.addFlightDescription` | Enter your booking reference or flight number to add it to your schedule | _[translate here]_ |
| `travel.emptyStateDescription` | Add your booked flights or search for new ones to start managing your trips. | _[translate here]_ |
| `features.settlement.benefit` | 8h/week saved on financial reports | _[translate here]_ |
| `features.offline.description` | IndexedDB + robust sync. Manage your tour on the plane, backstage, or anywhere. When internet returns, everything syncs automatically. | _[translate here]_ |
| `features.offline.benefit` | 24/7 access, no connection dependency | _[translate here]_ |
| `features.ai.description` | NLP Quick Entry, intelligent ActionHub, predictive Health Score. Warns you of problems before they happen. Your tour copilot. | _[translate here]_ |
| `features.ai.benefit` | Anticipates problems 72h in advance | _[translate here]_ |
| `features.esign.description` | Integrated e-sign, templates by country (US/UK/EU/ES), full-text search with OCR. Close deals faster, no paper printing. | _[translate here]_ |
| `features.esign.benefit` | Close contracts 3x faster | _[translate here]_ |
| `features.inbox.description` | Emails organized by show, smart threading, rich text reply. All your context in one place, no Gmail searching. | _[translate here]_ |
| `features.inbox.benefit` | Zero inbox with full context | _[translate here]_ |
| `features.travel.description` | Integrated Amadeus API, global venue database, optimized routing. Plan efficient routes with real data. | _[translate here]_ |
| `features.travel.benefit` | 12% savings on travel costs | _[translate here]_ |
| `org.addShowToCalendar` | Add a new show to your calendar | _[translate here]_ |
| `travel.validation.completeFields` | Please complete origin, destination and departure date | _[translate here]_ |
| `travel.validation.returnDate` | Select return date for round trip | _[translate here]_ |
| `travel.search.show_more_options` | Open externally | _[translate here]_ |
| `travel.advanced.show` | More options | _[translate here]_ |
| `travel.advanced.hide` | Hide advanced options | _[translate here]_ |
| `travel.flight_card.nonstop` | nonstop | _[translate here]_ |
| `travel.flight_card.stop` | stop | _[translate here]_ |
| `travel.flight_card.stops` | stops | _[translate here]_ |
| `travel.flight_card.select_for_planning` | Select for planning | _[translate here]_ |
| `travel.add_to_trip` | Add to trip | _[translate here]_ |
| `travel.swap` | Swap | _[translate here]_ |
| `travel.round_trip` | Round trip | _[translate here]_ |
| `travel.share_search` | Share search | _[translate here]_ |
| `travel.from` | From | _[translate here]_ |
| `travel.to` | To | _[translate here]_ |
| `travel.depart` | Depart | _[translate here]_ |
| `travel.return` | Return | _[translate here]_ |
| `travel.adults` | Adults | _[translate here]_ |
| `travel.bag` | bag | _[translate here]_ |
| `travel.bags` | Bags | _[translate here]_ |
| `travel.cabin` | Cabin | _[translate here]_ |
| `travel.stops_ok` | Stops ok | _[translate here]_ |
| `travel.deeplink.preview` | Preview link | _[translate here]_ |
| `travel.deeplink.copy` | Copy link | _[translate here]_ |
| `travel.deeplink.copied` | Copied ✓ | _[translate here]_ |
| `travel.sort.menu` | Sort by | _[translate here]_ |
| `travel.sort.priceAsc` | Price (low→high) | _[translate here]_ |
| `travel.sort.priceDesc` | Price (high→low) | _[translate here]_ |
| `travel.sort.duration` | Duration | _[translate here]_ |
| `travel.sort.stops` | Stops | _[translate here]_ |
| `travel.badge.nonstop` | Nonstop | _[translate here]_ |
| `travel.badge.baggage` | Bag included | _[translate here]_ |
| `travel.arrival.sameDay` | Arrives same day | _[translate here]_ |
| `travel.arrival.nextDay` | Arrives next day | _[translate here]_ |
| `travel.recent.clear` | Clear recent | _[translate here]_ |
| `travel.recent.remove` | Remove | _[translate here]_ |
| `travel.form.invalid` | Please fix errors to search | _[translate here]_ |
| `travel.nlp.hint` | Free-form input — press Shift+Enter to apply | _[translate here]_ |
| `travel.flex.days` | ±{n} days | _[translate here]_ |
| `travel.compare.grid.title` | Compare flights | _[translate here]_ |
| `travel.compare.empty` | Pin flights to compare them here. | _[translate here]_ |
| `travel.compare.hint` | Review pinned flights side-by-side. | _[translate here]_ |
| `travel.co2.label` | CO₂ | _[translate here]_ |
| `travel.window` | Window | _[translate here]_ |
| `travel.flex_window` | Flex window | _[translate here]_ |
| `travel.flex_hint` | We | _[translate here]_ |
| `travel.one_way` | One-way | _[translate here]_ |
| `travel.nonstop` | Nonstop | _[translate here]_ |
| `travel.pin` | Pin | _[translate here]_ |
| `travel.unpin` | Unpin | _[translate here]_ |
| `travel.compare.title` | Compare pinned | _[translate here]_ |
| `travel.compare.show` | Compare | _[translate here]_ |
| `travel.compare.hide` | Hide | _[translate here]_ |
| `travel.compare.add_to_trip` | Add to trip | _[translate here]_ |
| `travel.trip.added` | Added to trip | _[translate here]_ |
| `travel.trip.create_drop` | Drop here to create new trip | _[translate here]_ |
| `travel.related_show` | Related show | _[translate here]_ |
| `travel.multicity.toggle` | Multicity | _[translate here]_ |
| `travel.multicity` | Multi-city | _[translate here]_ |
| `travel.multicity.add_leg` | Add leg | _[translate here]_ |
| `travel.multicity.remove` | Remove | _[translate here]_ |
| `travel.multicity.move_up` | Move up | _[translate here]_ |
| `travel.multicity.move_down` | Move down | _[translate here]_ |
| `travel.multicity.open` | Open route in Google Flights | _[translate here]_ |
| `travel.multicity.hint` | Add at least two legs to build a route | _[translate here]_ |
| `travel.trips` | Trips | _[translate here]_ |
| `travel.trip.new` | New Trip | _[translate here]_ |
| `travel.trip.to` | Trip to | _[translate here]_ |
| `travel.segments` | Segments | _[translate here]_ |
| `common.actions` | Actions | _[translate here]_ |
| `travel.timeline.title` | Travel Timeline | _[translate here]_ |
| `travel.timeline.free_day` | Free day | _[translate here]_ |
| `travel.hub.title` | Search | _[translate here]_ |
| `travel.hub.needs_planning` | Suggestions | _[translate here]_ |
| `travel.hub.upcoming` | Upcoming | _[translate here]_ |
| `travel.hub.open_multicity` | Open multicity | _[translate here]_ |
| `travel.hub.plan_trip_cta` | Plan Trip | _[translate here]_ |
| `travel.error.same_route` | Origin and destination are the same | _[translate here]_ |
| `travel.error.return_before_depart` | Return is before departure | _[translate here]_ |
| `travel.segment.type` | Type | _[translate here]_ |
| `travel.segment.flight` | Flight | _[translate here]_ |
| `travel.segment.hotel` | Hotel | _[translate here]_ |
| `travel.segment.ground` | Ground | _[translate here]_ |
| `copy.manual.title` | Manual copy | _[translate here]_ |
| `copy.manual.desc` | Copy the text below if clipboard is blocked. | _[translate here]_ |
| `common.noResults` | No results | _[translate here]_ |
| `tripDetail.currency` | Currency | _[translate here]_ |
| `cost.category.flight` | Flight | _[translate here]_ |
| `cost.category.hotel` | Hotel | _[translate here]_ |
| `cost.category.ground` | Ground | _[translate here]_ |
| `cost.category.taxes` | Taxes | _[translate here]_ |
| `cost.category.fees` | Fees | _[translate here]_ |
| `cost.category.other` | Other | _[translate here]_ |
| `travel.workspace.placeholder` | Select a trip to see details or perform a search. | _[translate here]_ |
| `travel.open_in_provider` | Open in provider | _[translate here]_ |
| `common.loading` | Loading… | _[translate here]_ |
| `common.results` | results | _[translate here]_ |
| `travel.no_trips_yet` | No trips planned yet. Use the search to get started! | _[translate here]_ |
| `travel.provider` | Provider | _[translate here]_ |
| `provider.mock` | In-app (mock) | _[translate here]_ |
| `provider.google` | Google Flights | _[translate here]_ |
| `travel.alert.checkin` | Check-in opens in %s | _[translate here]_ |
| `travel.alert.priceDrop` | Price dropped by %s | _[translate here]_ |
| `travel.workspace.open` | Open Travel Workspace | _[translate here]_ |
| `travel.workspace.timeline` | Timeline view | _[translate here]_ |
| `travel.workspace.trip_builder.beta` | Trip Builder (beta) | _[translate here]_ |
| `common.list` | List | _[translate here]_ |
| `common.clear` | Clear | _[translate here]_ |
| `common.reset` | Reset | _[translate here]_ |
| `calendar.timeline` | Week | _[translate here]_ |
| `common.moved` | Moved | _[translate here]_ |
| `travel.drop.hint` | Drag to another day | _[translate here]_ |
| `travel.search.summary` | Search summary | _[translate here]_ |
| `travel.search.route` | {from} → {to} | _[translate here]_ |
| `travel.search.paxCabin` | {pax} pax · {cabin} | _[translate here]_ |
| `travel.results.countForDate` | {count} results for {date} | _[translate here]_ |
| `travel.compare.bestPrice` | Best price | _[translate here]_ |
| `travel.compare.bestTime` | Fastest | _[translate here]_ |
| `travel.compare.bestBalance` | Best balance | _[translate here]_ |
| `travel.co2.estimate` | ~{kg} kg CO₂ (est.) | _[translate here]_ |
| `travel.mobile.sticky.results` | Results | _[translate here]_ |
| `travel.mobile.sticky.compare` | Compare | _[translate here]_ |
| `travel.tooltips.flex` | Explore ± days around the selected date | _[translate here]_ |
| `travel.tooltips.nonstop` | Only show flights without stops | _[translate here]_ |
| `travel.tooltips.cabin` | Seat class preference | _[translate here]_ |
| `travel.move.prev` | Move to previous day | _[translate here]_ |
| `travel.move.next` | Move to next day | _[translate here]_ |
| `travel.rest.short` | Short rest before next show | _[translate here]_ |
| `travel.rest.same_day` | Same-day show risk | _[translate here]_ |
| `calendar.title` | Calendar | _[translate here]_ |
| `calendar.prev` | Previous month | _[translate here]_ |
| `calendar.next` | Next month | _[translate here]_ |
| `calendar.today` | Today | _[translate here]_ |
| `calendar.goto` | Go to date | _[translate here]_ |
| `calendar.more` | more | _[translate here]_ |
| `calendar.more.title` | More events | _[translate here]_ |
| `calendar.more.openDay` | Open day | _[translate here]_ |
| `calendar.more.openFullDay` | Open full day | _[translate here]_ |
| `calendar.announce.moved` | Moved show to {d} | _[translate here]_ |
| `calendar.announce.copied` | Duplicated show to {d} | _[translate here]_ |
| `calendar.quickAdd.hint` | Enter to add • Esc to cancel | _[translate here]_ |
| `calendar.quickAdd.advanced` | Advanced | _[translate here]_ |
| `calendar.quickAdd.simple` | Simple | _[translate here]_ |
| `calendar.quickAdd.placeholder` | City CC Fee (optional)… e.g., Madrid ES 12000 | _[translate here]_ |
| `calendar.quickAdd.recent` | Recent | _[translate here]_ |
| `calendar.quickAdd.parseError` | Can | _[translate here]_ |
| `calendar.quickAdd.countryMissing` | Add 2-letter country code | _[translate here]_ |
| `calendar.goto.hint` | Enter to go • Esc to close | _[translate here]_ |
| `calendar.view.switch` | Change calendar view | _[translate here]_ |
| `calendar.view.month` | Month | _[translate here]_ |
| `calendar.view.week` | Week | _[translate here]_ |
| `calendar.view.day` | Day | _[translate here]_ |
| `calendar.view.agenda` | Agenda | _[translate here]_ |
| `calendar.view.announce` | {v} view | _[translate here]_ |
| `calendar.timezone` | Time zone | _[translate here]_ |
| `calendar.tz.local` | Local | _[translate here]_ |
| `calendar.tz.localLabel` | Local | _[translate here]_ |
| `calendar.tz.changed` | Time zone set to {tz} | _[translate here]_ |
| `calendar.goto.shortcut` | ⌘/Ctrl + G | _[translate here]_ |
| `calendar.shortcut.pgUp` | PgUp / Alt+← | _[translate here]_ |
| `calendar.shortcut.pgDn` | PgDn / Alt+→ | _[translate here]_ |
| `calendar.shortcut.today` | T | _[translate here]_ |
| `common.move` | Move | _[translate here]_ |
| `common.copy` | Copy | _[translate here]_ |
| `calendar.more.filter` | Filter events | _[translate here]_ |
| `calendar.more.empty` | No results | _[translate here]_ |
| `calendar.kb.hint` | Keyboard: Arrow keys move day, PageUp/PageDown change month, T go to today, Enter or Space select day. | _[translate here]_ |
| `calendar.day.select` | Selected {d} | _[translate here]_ |
| `calendar.day.focus` | Focused {d} | _[translate here]_ |
| `calendar.noEvents` | No events for this day | _[translate here]_ |
| `calendar.show.shows` | Shows | _[translate here]_ |
| `calendar.show.travel` | Travel | _[translate here]_ |
| `calendar.kind` | Kind | _[translate here]_ |
| `calendar.kind.show` | Show | _[translate here]_ |
| `calendar.kind.travel` | Travel | _[translate here]_ |
| `calendar.status` | Status | _[translate here]_ |
| `calendar.dnd.enter` | Drop here to place event on {d} | _[translate here]_ |
| `calendar.dnd.leave` | Leaving drop target | _[translate here]_ |
| `calendar.kbdDnD.marked` | Marked {d} as origin. Use Enter on target day to drop. Hold Ctrl/Cmd to copy. | _[translate here]_ |
| `calendar.kbdDnD.cancel` | Cancelled move/copy mode | _[translate here]_ |
| `calendar.kbdDnD.origin` | Origin (keyboard move/copy active) | _[translate here]_ |
| `calendar.kbdDnD.none` | No show to move from selected origin | _[translate here]_ |
| `calendar.weekStart` | Week starts on | _[translate here]_ |
| `calendar.weekStart.mon` | Mon | _[translate here]_ |
| `calendar.weekStart.sun` | Sun | _[translate here]_ |
| `calendar.import` | Import | _[translate here]_ |
| `calendar.import.ics` | Import .ics | _[translate here]_ |
| `calendar.import.done` | Imported {n} events | _[translate here]_ |
| `calendar.import.error` | Failed to import .ics | _[translate here]_ |
| `calendar.wd.mon` | Mon | _[translate here]_ |
| `calendar.wd.tue` | Tue | _[translate here]_ |
| `calendar.wd.wed` | Wed | _[translate here]_ |
| `calendar.wd.thu` | Thu | _[translate here]_ |
| `calendar.wd.fri` | Fri | _[translate here]_ |
| `calendar.wd.sat` | Sat | _[translate here]_ |
| `calendar.wd.sun` | Sun | _[translate here]_ |
| `shows.costs.type` | Type | _[translate here]_ |
| `shows.costs.placeholder` | Travel / Production / Marketing | _[translate here]_ |
| `shows.costs.amount` | Amount | _[translate here]_ |
| `shows.costs.desc` | Description | _[translate here]_ |
| `common.optional` | Optional | _[translate here]_ |
| `common.add` | Add | _[translate here]_ |
| `common.income` | Income | _[translate here]_ |
| `common.wht` | WHT | _[translate here]_ |
| `common.commissions` | Commissions | _[translate here]_ |
| `common.net` | Net | _[translate here]_ |
| `common.costs` | Costs | _[translate here]_ |
| `common.total` | Total | _[translate here]_ |
| `shows.promote` | Promote | _[translate here]_ |
| `shows.editor.status.promote` | Promoted to | _[translate here]_ |
| `shows.margin.tooltip` | Net divided by Fee (%) | _[translate here]_ |
| `shows.empty` | No shows match your filters | _[translate here]_ |
| `shows.empty.add` | Add your first show | _[translate here]_ |
| `shows.export.csv.success` | CSV exported ✓ | _[translate here]_ |
| `shows.export.xlsx.success` | XLSX exported ✓ | _[translate here]_ |
| `shows.sort.tooltip` | Sort by column | _[translate here]_ |
| `shows.filters.statusGroup` | Status filters | _[translate here]_ |
| `shows.relative.inDays` | In {n} days | _[translate here]_ |
| `shows.relative.daysAgo` | {n} days ago | _[translate here]_ |
| `shows.relative.yesterday` | Yesterday | _[translate here]_ |
| `shows.row.menu` | Row actions | _[translate here]_ |
| `shows.action.edit` | Edit | _[translate here]_ |
| `shows.action.promote` | Promote | _[translate here]_ |
| `shows.action.duplicate` | Duplicate | _[translate here]_ |
| `shows.action.archive` | Archive | _[translate here]_ |
| `shows.action.delete` | Delete | _[translate here]_ |
| `shows.action.restore` | Restore | _[translate here]_ |
| `shows.board.header.net` | Net | _[translate here]_ |
| `shows.board.header.count` | Shows | _[translate here]_ |
| `shows.datePreset.thisMonth` | This Month | _[translate here]_ |
| `shows.datePreset.nextMonth` | Next Month | _[translate here]_ |
| `shows.columns.config` | Columns | _[translate here]_ |
| `shows.columns.wht` | WHT % | _[translate here]_ |
| `shows.totals.pin` | Pin totals | _[translate here]_ |
| `shows.totals.unpin` | Unpin totals | _[translate here]_ |
| `shows.totals.avgFee` | Avg Fee | _[translate here]_ |
| `shows.totals.avgFee.tooltip` | Average fee per show | _[translate here]_ |
| `shows.totals.avgMargin` | Avg Margin % | _[translate here]_ |
| `shows.totals.avgMargin.tooltip` | Average margin % across shows with fee | _[translate here]_ |
| `shows.wht.hide` | Hide WHT column | _[translate here]_ |
| `shows.sort.aria.sortedDesc` | Sorted descending | _[translate here]_ |
| `shows.sort.aria.sortedAsc` | Sorted ascending | _[translate here]_ |
| `shows.sort.aria.notSorted` | Not sorted | _[translate here]_ |
| `shows.sort.aria.activateDesc` | Activate to sort descending | _[translate here]_ |
| `shows.sort.aria.activateAsc` | Activate to sort ascending | _[translate here]_ |
| `nav.overview` | Overview | _[translate here]_ |
| `nav.clients` | Clients | _[translate here]_ |
| `nav.teams` | Teams | _[translate here]_ |
| `nav.links` | Links | _[translate here]_ |
| `nav.reports` | Reports | _[translate here]_ |
| `nav.documents` | Documents | _[translate here]_ |
| `nav.integrations` | Integrations | _[translate here]_ |
| `nav.billing` | Billing | _[translate here]_ |
| `nav.branding` | Branding | _[translate here]_ |
| `nav.connections` | Connections | _[translate here]_ |
| `org.overview.title` | Organization Overview | _[translate here]_ |
| `org.overview.subtitle.agency` | KPIs by client, tasks, and active links | _[translate here]_ |
| `org.overview.subtitle.artist` | Upcoming shows and travel, monthly KPIs | _[translate here]_ |
| `org.members.title` | Members | _[translate here]_ |
| `members.invite` | Invite | _[translate here]_ |
| `members.seats.usage` | Seat usage: 5/5 internal, 0/5 guests | _[translate here]_ |
| `org.clients.title` | Clients | _[translate here]_ |
| `org.teams.title` | Teams | _[translate here]_ |
| `org.links.title` | Links | _[translate here]_ |
| `org.branding.title` | Branding | _[translate here]_ |
| `org.documents.title` | Documents | _[translate here]_ |
| `org.reports.title` | Reports | _[translate here]_ |
| `org.integrations.title` | Integrations | _[translate here]_ |
| `org.billing.title` | Billing | _[translate here]_ |
| `labels.seats.used` | Seats used | _[translate here]_ |
| `labels.seats.guests` | Guests | _[translate here]_ |
| `export.options` | Export options | _[translate here]_ |
| `export.columns` | Columns | _[translate here]_ |
| `export.csv` | CSV | _[translate here]_ |
| `export.xlsx` | XLSX | _[translate here]_ |
| `common.exporting` | Exporting… | _[translate here]_ |
| `charts.viewTable` | View data as table | _[translate here]_ |
| `charts.hideTable` | Hide table | _[translate here]_ |
| `finance.period.mtd` | MTD | _[translate here]_ |
| `finance.period.lastMonth` | Last month | _[translate here]_ |
| `finance.period.ytd` | YTD | _[translate here]_ |
| `finance.period.custom` | Custom | _[translate here]_ |
| `finance.period.closed` | Closed | _[translate here]_ |
| `finance.period.open` | Open | _[translate here]_ |
| `finance.closeMonth` | Close Month | _[translate here]_ |
| `finance.reopenMonth` | Reopen Month | _[translate here]_ |
| `finance.closed.help` | Month is closed. Reopen to make changes. | _[translate here]_ |
| `finance.kpi.mtdNet` | MTD Net | _[translate here]_ |
| `finance.kpi.ytdNet` | YTD Net | _[translate here]_ |
| `finance.kpi.forecastEom` | Forecast EOM | _[translate here]_ |
| `finance.kpi.deltaTarget` | Δ vs Target | _[translate here]_ |
| `finance.kpi.gm` | GM% | _[translate here]_ |
| `finance.kpi.dso` | DSO | _[translate here]_ |
| `finance.comparePrev` | Compare vs previous | _[translate here]_ |
| `finance.export.csv.success` | CSV exported ✓ | _[translate here]_ |
| `finance.export.xlsx.success` | XLSX exported ✓ | _[translate here]_ |
| `finance.v2.footer` | AR top debtors and row actions coming next. | _[translate here]_ |
| `finance.pl.caption` | Profit and Loss ledger. Use column headers to sort. Virtualized list shows a subset of rows. | _[translate here]_ |
| `common.rowsVisible` | Rows visible | _[translate here]_ |
| `finance.whtPct` | WHT % | _[translate here]_ |
| `finance.wht` | WHT | _[translate here]_ |
| `finance.mgmtPct` | Mgmt % | _[translate here]_ |
| `finance.bookingPct` | Booking % | _[translate here]_ |
| `finance.breakdown.by` | Breakdown by | _[translate here]_ |
| `finance.breakdown.empty` | No breakdown available | _[translate here]_ |
| `finance.delta` | Δ | _[translate here]_ |
| `finance.deltaVsPrev` | Δ vs prev | _[translate here]_ |
| `common.comingSoon` | Coming soon | _[translate here]_ |
| `finance.expected` | Expected (stage-weighted) | _[translate here]_ |
| `finance.ar.title` | AR aging & top debtors | _[translate here]_ |
| `common.moreActions` | More actions | _[translate here]_ |
| `actions.copyRow` | Copy row | _[translate here]_ |
| `actions.exportRowCsv` | Export row (CSV) | _[translate here]_ |
| `actions.goToShow` | Go to show | _[translate here]_ |
| `actions.openCosts` | Open costs | _[translate here]_ |
| `shows.table.route` | Route | _[translate here]_ |
| `finance.targets.title` | Targets | _[translate here]_ |
| `finance.targets.revenue` | Revenue target | _[translate here]_ |
| `finance.targets.net` | Net target | _[translate here]_ |
| `finance.targets.hint` | Targets are local to this device for now. | _[translate here]_ |
| `finance.targets.noNegative` | Targets cannot be negative | _[translate here]_ |
| `filters.title` | Filters | _[translate here]_ |
| `filters.region` | Region | _[translate here]_ |
| `filters.from` | From | _[translate here]_ |
| `filters.to` | To | _[translate here]_ |
| `filters.currency` | Currency | _[translate here]_ |
| `filters.presentation` | Presentation mode | _[translate here]_ |
| `filters.shortcutHint` | Ctrl/Cmd+K – open filters | _[translate here]_ |
| `filters.appliedRange` | Applied range | _[translate here]_ |
| `layout.team` | Team | _[translate here]_ |
| `layout.highContrast` | High Contrast | _[translate here]_ |
| `layout.tenant` | Tenant | _[translate here]_ |
| `access.readOnly` | read-only | _[translate here]_ |
| `layout.viewingAs` | Viewing as | _[translate here]_ |
| `layout.viewAsExit` | Exit | _[translate here]_ |
| `access.readOnly.tooltip` | Finance exports disabled for agency demo | _[translate here]_ |
| `lab.drag` | Drag | _[translate here]_ |
| `lab.moveUp` | Move up | _[translate here]_ |
| `lab.moveDown` | Move down | _[translate here]_ |
| `lab.reset` | Reset to template | _[translate here]_ |
| `lab.back` | Back to Dashboard | _[translate here]_ |
| `lab.layoutName` | Layout name | _[translate here]_ |
| `lab.save` | Save layout | _[translate here]_ |
| `lab.apply` | Apply… | _[translate here]_ |
| `lab.delete` | Delete… | _[translate here]_ |
| `lab.export` | Export | _[translate here]_ |
| `lab.import` | Import | _[translate here]_ |
| `lab.dropHere` | Drop widgets here | _[translate here]_ |
| `lab.header` | Mission Control Lab | _[translate here]_ |
| `lab.subheader` | Drag, reorder, and resize dashboard widgets. Experimental. | _[translate here]_ |
| `lab.template` | Template | _[translate here]_ |
| `lab.resetToTemplate` | Reset to template | _[translate here]_ |
| `lab.backToDashboard` | Back to Dashboard | _[translate here]_ |
| `lab.applySaved` | Apply… | _[translate here]_ |
| `lab.deleteSaved` | Delete… | _[translate here]_ |
| `dashboard.title` | Tour Command Center | _[translate here]_ |
| `dashboard.subtitle` | Monitor your tour performance, mission status, and take action on what matters most | _[translate here]_ |
| `dashboard.map.title` | Tour Map | _[translate here]_ |
| `dashboard.activity.title` | Recent Activity | _[translate here]_ |
| `dashboard.actions.title` | Quick Actions | _[translate here]_ |
| `dashboard.actions.newShow` | Add New Show | _[translate here]_ |
| `dashboard.actions.quickFinance` | Quick Finance Check | _[translate here]_ |
| `dashboard.actions.travelBooking` | Book Travel | _[translate here]_ |
| `dashboard.areas.finance.title` | Finance | _[translate here]_ |
| `dashboard.areas.finance.description` | Track revenue, costs, and profitability | _[translate here]_ |
| `dashboard.areas.shows.title` | Shows & Events | _[translate here]_ |
| `dashboard.areas.shows.description` | Manage performances and venues | _[translate here]_ |
| `dashboard.areas.travel.title` | Travel & Logistics | _[translate here]_ |
| `dashboard.areas.travel.description` | Plan and track travel arrangements | _[translate here]_ |
| `dashboard.areas.missionControl.title` | Mission Control Lab | _[translate here]_ |
| `dashboard.areas.missionControl.description` | Advanced mission control with customizable widgets | _[translate here]_ |
| `dashboard.kpi.financialHealth` | Financial Health | _[translate here]_ |
| `dashboard.kpi.nextEvent` | Next Critical Event | _[translate here]_ |
| `dashboard.kpi.ticketSales` | Ticket Sales | _[translate here]_ |
| `actions.toast.export` | Export copied | _[translate here]_ |
| `actions.import.prompt` | Paste Lab layouts JSON | _[translate here]_ |
| `actions.toast.imported` | Imported | _[translate here]_ |
| `actions.toast.import_invalid` | Invalid JSON | _[translate here]_ |
| `actions.newArtist` | New artist | _[translate here]_ |
| `actions.connectExisting` | Connect existing | _[translate here]_ |
| `actions.editScopes` | Edit scopes | _[translate here]_ |
| `actions.revoke` | Revoke | _[translate here]_ |
| `actions.exportPdf` | Export PDF | _[translate here]_ |
| `branding.uploadLogo` | Upload logo | _[translate here]_ |
| `branding.editColors` | Edit colors | _[translate here]_ |
| `common.upload` | Upload | _[translate here]_ |
| `common.newFolder` | New folder | _[translate here]_ |
| `live.up` | up | _[translate here]_ |
| `live.down` | down | _[translate here]_ |
| `live.flat` | flat | _[translate here]_ |
| `nav.profile` | Profile | _[translate here]_ |
| `nav.changeOrg` | Change organization | _[translate here]_ |
| `nav.logout` | Logout | _[translate here]_ |
| `profile.title` | Profile | _[translate here]_ |
| `profile.personal` | Personal | _[translate here]_ |
| `profile.security` | Security | _[translate here]_ |
| `profile.notifications` | Notifications | _[translate here]_ |
| `profile.save` | Save | _[translate here]_ |
| `profile.saved` | Saved ✓ | _[translate here]_ |
| `profile.avatarUrl` | Avatar URL | _[translate here]_ |
| `profile.bio` | Bio | _[translate here]_ |
| `profile.notify.email` | Email updates | _[translate here]_ |
| `profile.notify.slack` | Slack notifications | _[translate here]_ |
| `profile.notify.hint` | These preferences affect demo notifications only | _[translate here]_ |
| `profile.memberships` | Memberships | _[translate here]_ |
| `profile.defaultOrg` | Default organization | _[translate here]_ |
| `profile.setDefault` | Set default | _[translate here]_ |
| `profile.dataPrivacy` | Data & privacy | _[translate here]_ |
| `profile.exportData` | Export my demo data | _[translate here]_ |
| `profile.clearData` | Clear and reseed demo data | _[translate here]_ |
| `profile.export.ready` | Data export ready | _[translate here]_ |
| `profile.error.name` | Name is required | _[translate here]_ |
| `profile.error.email` | Email is required | _[translate here]_ |
| `prefs.title` | Preferences | _[translate here]_ |
| `prefs.appearance` | Appearance | _[translate here]_ |
| `prefs.language` | Language | _[translate here]_ |
| `prefs.theme` | Theme | _[translate here]_ |
| `prefs.highContrast` | High contrast | _[translate here]_ |
| `prefs.finance.currency` | Currency | _[translate here]_ |
| `prefs.units` | Distance units | _[translate here]_ |
| `prefs.presentation` | Presentation mode | _[translate here]_ |
| `prefs.comparePrev` | Compare vs previous | _[translate here]_ |
| `prefs.defaultRegion` | Default region | _[translate here]_ |
| `prefs.defaultStatuses` | Default statuses | _[translate here]_ |
| `prefs.help.language` | Affects labels and date/number formatting. | _[translate here]_ |
| `prefs.help.theme` | Choose light or dark based on your environment. | _[translate here]_ |
| `prefs.help.highContrast` | Improves contrast and focus rings for readability. | _[translate here]_ |
| `prefs.help.currency` | Sets default currency for dashboards and exports. | _[translate here]_ |
| `prefs.help.units` | Used for travel distances and map overlays. | _[translate here]_ |
| `prefs.help.presentation` | Larger text, simplified animations for demos. | _[translate here]_ |
| `prefs.help.comparePrev` | Shows deltas against the previous period. | _[translate here]_ |
| `prefs.help.region` | Preselects region filters in dashboards. | _[translate here]_ |
| `subnav.ariaLabel` | Sections | _[translate here]_ |
| `breadcrumb.home` | Home | _[translate here]_ |
| `home.seo.title` | On Tour App - Tour Management & Finance Dashboard | _[translate here]_ |
| `home.seo.description` | Professional tour management platform with real-time finance tracking, venue booking, and performance analytics for artists and managers. | _[translate here]_ |
| `home.seo.keywords` | tour management, concert booking, artist finance, venue management, performance analytics, live music | _[translate here]_ |
| `comparison.title` | From Spreadsheet Chaos to App Clarity | _[translate here]_ |
| `comparison.subtitle` | See how your tour management evolves from fragmented Excel files to a unified, intelligent platform. | _[translate here]_ |
| `comparison.excel.title` | Excel Chaos | _[translate here]_ |
| `comparison.excel.problem1` | Scattered files across devices and emails | _[translate here]_ |
| `comparison.excel.problem2` | Manual calculations prone to errors | _[translate here]_ |
| `comparison.excel.problem3` | No real-time collaboration or notifications | _[translate here]_ |
| `comparison.excel.problem4` | Lost context in endless tabs and comments | _[translate here]_ |
| `comparison.app.title` | App Clarity | _[translate here]_ |
| `comparison.app.benefit1` | Unified dashboard with live data sync | _[translate here]_ |
| `comparison.app.benefit2` | Automated calculations and error detection | _[translate here]_ |
| `comparison.app.benefit3` | Real-time collaboration and smart notifications | _[translate here]_ |
| `comparison.app.benefit4` | Context-aware insights and predictive alerts | _[translate here]_ |
| `comparison.benefit1.title` | Smart Finance Tracking | _[translate here]_ |
| `comparison.benefit1.desc` | Automatic profit calculations, cost analysis, and budget alerts. | _[translate here]_ |
| `comparison.benefit2.title` | Live Tour Mapping | _[translate here]_ |
| `comparison.benefit2.desc` | Interactive maps with route optimization and venue intelligence. | _[translate here]_ |
| `comparison.benefit3.title` | Instant Insights | _[translate here]_ |
| `comparison.benefit3.desc` | AI-powered recommendations and risk detection in real-time. | _[translate here]_ |
| `metamorphosis.title` | From scattered noise to a living control panel | _[translate here]_ |
| `metamorphosis.subtitle` | Instead of spreadsheets mutating chaotically and critical context buried in comments, every data point flows into a single orchestrated surface. The system reconciles, validates, and highlights what matters. | _[translate here]_ |
| `dashboard.offerConfirmed` | Offer → Confirmed | _[translate here]_ |
| `dashboard.tourHealthScore` | Tour Health Score | _[translate here]_ |
| `dashboard.healthFactors` | Health Factors | _[translate here]_ |
| `dashboard.keyInsights` | Key Insights | _[translate here]_ |
| `dashboard.confidence` | Confidence | _[translate here]_ |
| `dashboard.current` | Current | _[translate here]_ |
| `dashboard.predicted` | Predicted | _[translate here]_ |
| `dashboard.expectedChange` | Expected change | _[translate here]_ |
| `dashboard.scheduleGap` | Schedule gap | _[translate here]_ |
| `dashboard.allSystemsReady` | All systems ready | _[translate here]_ |
| `dashboard.loadingMap` | Loading map… | _[translate here]_ |
| `placeholder.username` | you@example.com or username | _[translate here]_ |
| `placeholder.bio` | Tell us a bit about yourself and what you do... | _[translate here]_ |
| `placeholder.cityName` | Enter city name... | _[translate here]_ |
| `placeholder.notes` | Add any additional notes... | _[translate here]_ |
| `placeholder.searchCommand` | Search shows, navigate, or type a command... | _[translate here]_ |
| `placeholder.expenseDescription` | e.g., Flight tickets, Hotel booking... | _[translate here]_ |
| `placeholder.expenseDetails` | Add any additional details, invoice numbers, or context... | _[translate here]_ |
| `placeholder.origin` | Origin (e.g., BCN) | _[translate here]_ |
| `placeholder.destination` | Destination (e.g., AMS) | _[translate here]_ |
| `placeholder.bookingRef` | Booking reference or flight number | _[translate here]_ |
| `placeholder.airport` | City or airport... | _[translate here]_ |

---

## Workflow

### Option A: Direct Edit (Fastest)
1. Copy the "Quick Copy Format" code blocks above
2. Paste into corresponding language section in `src/lib/i18n.ts`
3. Replace `// TODO: translate` comments with actual translations
4. Test with language selector in app

### Option B: Spreadsheet Translation (Team-Friendly)
1. Export "Detailed Translation Table" to Google Sheets
2. Share with native speakers (1 sheet per language)
3. Collect translations in "Your Translation" column
4. Copy translations back to `src/lib/i18n.ts`

## Estimated Effort

- **French**: ~4-6 hours (native speaker)
- **German**: ~4-6 hours (native speaker)
- **Italian**: ~4-6 hours (native speaker)
- **Portuguese**: ~4-6 hours (native speaker)

**Total**: 16-24 hours for all languages

## Quality Checklist

- [ ] All placeholders preserved (e.g., `{name}`, `{count}`)
- [ ] Technical terms consistent across all strings
- [ ] Tone matches English (professional but friendly)
- [ ] Gender/plural agreement correct for language
- [ ] Tested in-app with language toggle
