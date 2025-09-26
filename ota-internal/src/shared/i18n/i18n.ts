// Minimal i18n scaffolding (Phase 1)
// Usage: import { t } from './i18n'; element.textContent = t('dashboard.pending.empty');

type Dict = Record<string,string>;
const en: Dict = {
  'dashboard.pending.header': 'Pending Actions',
  'dashboard.pending.empty': 'All caught up!',
  'dashboard.pending.markPaid': 'Mark as paid',
  'dashboard.monthShows.header': 'This Month\'s Shows',
  'dashboard.monthShows.empty': 'No shows this month',
  'dashboard.monthTravel.header': 'This Month\'s Travel',
  'dashboard.monthTravel.empty': 'No travel scheduled in the next 30 days.',
  'dashboard.upcoming.header': 'Upcoming',
  'dashboard.upcoming.empty': 'Nothing upcoming',
  'dashboard.actionCenter.header': 'Action Center',
  'dashboard.actionCenter.empty': 'No prioritized actions right now.',
  'dashboard.actionCenter.kind.risk': 'Overdue invoice. Collect to improve cashflow.',
  'dashboard.actionCenter.kind.urgency': 'Upcoming show still pending. Confirm or update its status.',
  'dashboard.actionCenter.kind.opportunity': 'Confirmed show missing travel plan. Add logistics.',
  'dashboard.actionCenter.kind.finrisk': 'Negative financial projection. Review fee, commissions, or costs.',
  'dashboard.actionCenter.kind.offer': 'Follow up on offer/tentative to secure the date.',
  // Dashboard section labels / titles (UI structure)
  'dashboard.pending.sectionLabel': 'Pending Actions',
  'dashboard.pending.title': 'Pending Actions',
  'dashboard.monthShows.sectionLabel': "This Month's Shows",
  'dashboard.monthShows.title': "This Month's Shows",
  'dashboard.monthTravel.sectionLabel': 'This Month\'s Travel',
  'dashboard.monthTravel.title': 'This Month\'s Travel',
  'dashboard.upcoming.title': 'Upcoming',
  'dashboard.actionCenter.title': 'Action Center',
  // Upcoming buckets
  'upcoming.bucket.past': 'Past',
  'upcoming.bucket.today': 'Today',
  'upcoming.bucket.tomorrow': 'Tomorrow',
  'upcoming.bucket.thisWeek': 'This Week',
  'upcoming.bucket.nextWeek': 'Next Week',
  'upcoming.bucket.later': 'Later',
  // Headings & labels added in HTML
  'dashboard.missionControl.title': 'Mission Control',
  'dashboard.actionHub.title': 'Action Hub',
  // Action Hub tabs & labels
  'dashboard.actionHub.tabs.actions': 'Actions',
  'dashboard.actionHub.tabs.insights': 'Insights',
  'dashboard.actionHub.tabs.performance': 'Performance',
  'dashboard.actionHub.priorityActions': 'Priority Actions',
  'dashboard.actionHub.filter': 'Filter',
  'dashboard.actionHub.sort': 'Sort',
  'dashboard.actionHub.newAction': 'New Action',
  'dashboard.actionHub.businessInsights': 'Business Insights',
  'dashboard.actionHub.thisMonth': 'This Month',
  'dashboard.actionHub.export': 'Export',
  'dashboard.actionHub.performanceMetrics': 'Performance Metrics',
  'dashboard.actionHub.details': 'Details',
  'dashboard.actionHub.share': 'Share',
  'dashboard.kpi.yearNet': 'Year Net',
  'dashboard.kpi.pending': 'Pending',
  'dashboard.kpi.expensesMonth': 'Expenses (Month)',
  'dashboard.kpi.netMonth': 'Net (Month)',
  'dashboard.map.nextShow': 'Next Show',
  'dashboard.map.monthlySummary': 'Monthly Summary',
  'dashboard.map.financialIntelligence': 'Financial Intelligence',
  // Generic
  'generic.cancel': 'Cancel',
  'generic.save': 'Save',
  'settings.locale.label': 'Language',
  'settings.locale.en': 'English',
  'settings.locale.es': 'Spanish',
  'nav.dashboard': 'Dashboard',
  'nav.manager': 'Manager',
  'nav.commandCenter': 'Command Center',
  'nav.calendar': 'Calendar',
  'nav.finance': 'Finance',
  'nav.settings': 'Settings',
  // HUD / dashboard labels
  'hud.nextShow': 'Next Show',
  'hud.monthlySummary': 'Monthly Summary',
  'hud.financialIntelligence': 'Financial Intelligence',
  'hud.label.income': 'Income',
  'hud.label.expenses': 'Expenses',
  'hud.label.net': 'Net',
  'hud.label.commissions': 'Commissions',
  'hud.label.costs': 'Costs',
  'hud.label.wht': 'WHT',
  'hud.label.total': 'Total',
  'btn.focus': 'Focus',
  'btn.exitFocus': 'Exit Focus',
  'btn.addHotel': 'Add hotel',
  'btn.addTravel': 'Add travel item',
  'btn.openShow': 'Open Show',
  'btn.financeBreakdown': 'Finance breakdown',
  'btn.language': 'Language',
  'btn.dismiss': 'Dismiss',
  'aria.dismissAction': 'Dismiss action',
  'ac.defaultExplain': 'Priority action.',
  'auth.logout': 'Logout',
  'kpi.monthNet.unchanged': 'Monthly net {value} unchanged versus previous month.',
  'kpi.monthNet.changed': 'Monthly net {value} {trend} {diff} versus previous month.',
  'trend.up': 'up',
  'trend.down': 'down',
  'trend.unchanged': 'unchanged',
  'modal.travel.title': 'Add travel',
  'modal.travel.legend': 'Travel Details',
  'form.title': 'Title',
  'form.details': 'Details',
  'form.dateTime': 'Date & time',
  'btn.cancel': 'Cancel',
  'btn.save': 'Save',
  // KPI title tooltips
  'kpi.title.financeYear': 'View full year financial breakdown',
  'kpi.title.pending': 'Jump to pending actions',
  'kpi.title.expensesMonth': 'Open monthly expenses breakdown',
  'kpi.title.netMonth': 'Open monthly net detail',
  // Plurals
  'count.items.one': '{count} item',
  'count.items.other': '{count} items',
  'count.days.one': '{count} day',
  'count.days.other': '{count} days',
  'count.pending.one': '{count} pending',
  'count.pending.other': '{count} pending',
  'ac.label.invoiceOverdue': 'Invoice overdue: {city} — {venue}',
  'ac.meta.overdue': '{days} overdue · {amount}',
  'ac.label.upcomingShow': 'Upcoming {status} show: {city}',
  'ac.meta.daysAmount': '{days} · {amount}',
  'ac.label.addTravel': 'Add travel plan: {city} — {venue}',
  'ac.meta.daysAmountNet': '{days} · {amount}',
  'ac.label.projectedLoss': 'Projected loss: {city} — {venue}',
  'ac.meta.netDays': '{net} net · {days}',
  'ac.label.followOffer': 'Follow up offer: {city} — {venue}',
  'ac.meta.daysOut': '{days} out',
  // Action center kinds short tags
  'ac.kind.risk': 'Risk',
  'ac.kind.urgency': 'Urgent',
  'ac.kind.opportunity': 'Opportunity',
  'ac.kind.finrisk': 'Fin Risk',
  'ac.kind.offer': 'Offer',
  // Accessibility / live region announcements
  'aria.pending.count.one': '1 pending action.',
  'aria.pending.count.other': '{count} pending actions.',
  'aria.pending.cleared': 'All pending actions resolved.',
  'aria.ac.count.one': '1 prioritized action.',
  'aria.ac.count.other': '{count} prioritized actions.',
  'aria.ac.empty': 'No prioritized actions.',
  'aria.ac.newRisk': 'New overdue invoice risk.',
};

const locales: Record<string,Dict> = { en };
let current = (()=>{ try { return localStorage.getItem('app:locale') || 'en'; } catch { return 'en'; } })();

// Lazy load promise registry (future dynamic imports). We only create a promise when locale not loaded.
const pendingLoads: Record<string, Promise<void>> = Object.create(null);

export async function loadLocale(loc: string){
  if (locales[loc]) return; // already loaded
  if (Object.prototype.hasOwnProperty.call(pendingLoads, loc)) return pendingLoads[loc];
  // Dynamic import chunk
  if (loc === 'es'){
    const p = import('../../locales/es').then(mod => { locales['es'] = mod.default; });
    pendingLoads[loc] = p;
    return p;
  }
  // Fallback: mark as resolved even if unknown
  pendingLoads[loc] = Promise.resolve();
  return pendingLoads[loc];
}

export async function setLocaleAsync(loc: string){
  await loadLocale(loc);
  setLocale(loc);
}

export function setLocale(loc: string){ if (locales[loc]) { current = loc; try { localStorage.setItem('app:locale', loc); } catch {} (window as any).dispatchEvent(new CustomEvent('i18n:changed', { detail:{ locale: loc }})); } }
export function getLocale(){ return current; }
export function t(key: string): string { const loc = locales[current]; if (loc && key in loc) return loc[key]; const base = locales['en']; return base && key in base ? base[key] : key; }

// Interpolation helper: replaces {var} occurrences with provided map values
export function ti(key: string, vars: Record<string,string|number>): string {
  const base = t(key);
  return base.replace(/\{(\w+)\}/g, (_,k)=> vars[k] != null ? String(vars[k]) : `{${k}}`);
}

// Simple pluralization: looks for key.one / key.other
export function tp(baseKey: string, count: number){
  const form = count === 1 ? 'one':'other';
  const key = `${baseKey}.${form}`;
  const template = t(key);
  return template.replace('{count}', String(count));
}

// Expose helper only in development (Vite sets import.meta.env.DEV)
try {
  if ((import.meta as any).env && (import.meta as any).env.DEV){
    (window as any).__i18n = { t, ti, tp, setLocale, getLocale };
  }
} catch {}
