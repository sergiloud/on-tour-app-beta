// Dashboard module (Refactored Phase 1 – clean)
import { getUpcomingTravel, euros } from '../../../data/demo';
import { events } from './events';
import { focusShow } from './mission-control';
import { computeShowFinance } from '../../../features/shows';
import { ensureStoreBoot, selectors, subscribe, updateShow, getShowsCached } from '../../../shared/store';
import { t, tp, ti } from '../../../shared/i18n';
import { perf } from '../../../shared/telemetry';
import { applyTranslations } from '../../../shared/i18n';
import { updateComponent, mountComponent } from './component-registry';
import '../components/pending'; // side-effect registration for pending panel
import '../components/month-shows'; // side-effect registration for month shows panel
import '../../travel/components/travel'; // side-effect registration for travel panel
import '../components/upcoming'; // side-effect registration for upcoming feed panel
import '../components/action-center'; // side-effect registration for action center panel
import '../components/action-hub'; // side-effect registration for action hub panel

function el<T extends HTMLElement>(id: string): T | null { return document.getElementById(id) as T | null; }

// Keyed diff utility
// (List diff utility moved to components/dom-utils.ts)

export function renderDashboard(now = new Date()){
  ensureStoreBoot();
  if (!(window as any)._dashReactive){
    (window as any)._dashReactive = true;
  events.on('shows:updated', () => { const d = new Date(); updateComponent('pending-actions', { now: d }); updateComponent('month-shows', { now: d }); updateComponent('upcoming-feed', { now: d }); updateComponent('action-center', { now: d }); updateComponent('action-hub', { now: d }); updateComponent('tour-overview-card', { now: d }); });
  events.on('travel:updated', () => { const d = new Date(); updateComponent('month-travel', { now: d }); updateComponent('upcoming-feed', { now: d }); updateComponent('action-center', { now: d }); updateComponent('action-hub', { now: d }); updateComponent('tour-overview-card', { now: d }); });
    subscribe(() => {/* could diff subsets later */});
  }
  // Componentized panels (incremental extraction)
  mountComponent('pending-actions', { now });
  updateComponent('pending-actions', { now });
  mountComponent('month-shows', { now });
  updateComponent('month-shows', { now });
  mountComponent('month-travel', { now });
  updateComponent('month-travel', { now });
  mountComponent('upcoming-feed', { now });
  updateComponent('upcoming-feed', { now });
  mountComponent('action-center', { now });
  updateComponent('action-center', { now });
  mountComponent('action-hub', { now });
  updateComponent('action-hub', { now });
  mountComponent('tour-overview-card', { now });
  updateComponent('tour-overview-card', { now });
  applyTranslations();
}

// Pending panel extracted into components/pending.ts

// Month shows panel extracted into components/month-shows.ts

// Travel panel extracted into components/travel.ts

// Upcoming feed panel extracted into components/upcoming.ts

// Action Center providers
interface ActionItem { id: string; kind: string; label: string; meta?: string; score: number; date?: string; icon: string; dismissKey: string; explain?: string; }
interface ActionProviderCtx { now: Date; shows: ReturnType<typeof getShowsCached>; travel: ReturnType<typeof getUpcomingTravel>; }
type ActionProvider = (c: ActionProviderCtx) => ActionItem[];
const actionProviders: ActionProvider[] = [];
export function registerActionProvider(p: ActionProvider){ actionProviders.push(p); }

// Built-in provider
registerActionProvider(({ now, shows, travel }) => {
  const DAY = 86400000; const nowTs = +now; const items: ActionItem[] = [];
  const feeWeight = (fee: number) => Math.min(60, Math.log10(1 + Math.max(0, fee)) * 18);
  // Overdue
  shows.filter(s => String(s.status).toLowerCase() === 'overdue').forEach(s => {
    const diff = Math.max(1, Math.round((nowTs - +new Date(s.date))/DAY));
    const score = 120 + diff + feeWeight(s.feeEUR);
    items.push({
      id: s.id,
      kind: 'risk',
      label: ti('ac.label.invoiceOverdue', { city: s.city, venue: s.venue }),
      meta: ti('ac.meta.overdue', { days: tp('count.days', diff), amount: euros(s.feeEUR) }),
      score,
      date:s.date,
      icon:'alert-triangle',
      dismissKey:'risk:'+s.id,
      explain:t('dashboard.actionCenter.kind.risk')
    });
  });
  // Pending soon
  shows.filter(s => ['pending','tentative','offer'].includes(String(s.status).toLowerCase())).forEach(s => {
    const diffDays = Math.round((+new Date(s.date)-nowTs)/DAY);
    if (diffDays >=0 && diffDays <= 10){
      const score = 70 + (10-diffDays) + feeWeight(s.feeEUR);
      const dayLabel = diffDays===0 ? t('upcoming.bucket.today') : tp('count.days', diffDays);
      items.push({
        id:s.id,
        kind:'urgency',
        label: ti('ac.label.upcomingShow', { status: String(s.status).toLowerCase(), city: s.city }),
        meta: ti('ac.meta.daysAmount', { days: dayLabel, amount: euros(s.feeEUR) }),
        score,
        date:s.date,
        icon:'clock',
        dismissKey:'urg:'+s.id,
        explain:t('dashboard.actionCenter.kind.urgency')
      });
    }
  });
  // Confirmed missing travel
  shows.filter(s => String(s.status).toLowerCase()==='confirmed').forEach(s => {
    const diffDays = Math.round((+new Date(s.date)-nowTs)/DAY);
    if (diffDays >=0 && diffDays <=14){
      const hasTravel = travel.some(t => { const td = new Date(t.date); return Math.abs((+td - +new Date(s.date))/DAY) <= 1; });
      if (!hasTravel){
        const score = 55 + (14-diffDays) + feeWeight(s.feeEUR)/2;
        items.push({
          id:s.id,
          kind:'opportunity',
          label: ti('ac.label.addTravel', { city: s.city, venue: s.venue }),
          meta: ti('ac.meta.daysAmount', { days: tp('count.days', diffDays), amount: euros(s.feeEUR) }),
          score,
          date:s.date,
          icon:'plane',
          dismissKey:'opp:'+s.id,
          explain:t('dashboard.actionCenter.kind.opportunity')
        });
      }
    }
  });
  // Financial risk
  shows.filter(s => new Date(s.date) >= now).forEach(s => { try { const fin = computeShowFinance(s.id); if (!fin) return; if (fin.net < 0){ const diff = Math.round((+new Date(s.date)-nowTs)/DAY); const decay = Math.max(0, 30-diff); const score = 90 + decay + feeWeight(Math.abs(fin.net)); items.push({ id:s.id, kind:'finrisk', label: ti('ac.label.projectedLoss', { city: s.city, venue: s.venue }), meta: ti('ac.meta.netDays', { net: euros(fin.net), days: tp('count.days', diff) }), score, date:s.date, icon:'trending-down', dismissKey:'fin:'+s.id, explain:t('dashboard.actionCenter.kind.finrisk') }); } } catch {} });
  // Offer follow-up further out
  shows.filter(s => ['tentative','offer'].includes(String(s.status).toLowerCase())).forEach(s => { const diffDays = Math.round((+new Date(s.date)-nowTs)/DAY); if (diffDays >=5 && diffDays <=30){ const score = 65 + (25 - Math.min(diffDays,25)) + feeWeight(s.feeEUR)/3; items.push({ id:s.id, kind:'offer', label: ti('ac.label.followOffer', { city: s.city, venue: s.venue }), meta: ti('ac.meta.daysOut', { days: tp('count.days', diffDays) }), score, date:s.date, icon:'handshake', dismissKey:'off:'+s.id, explain:t('dashboard.actionCenter.kind.offer') }); } });
  return items;
});

// Action Center panel extracted into components/action-center.ts
