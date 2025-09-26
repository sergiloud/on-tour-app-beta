import { getUpcomingTravel } from '../../../data/demo';
import { getShowsCached } from '../../../shared/store';
import { computeShowFinance } from '../../../features/shows';
import { euros } from '../../../data/demo';
import { t, ti, tp } from '../../../shared/i18n';
import { perf } from '../../../shared/telemetry';
import { events } from '../core/events';
import { DashComponent, DashComponentCtx, registerComponent } from '../core/component-registry';
import { announce } from '../../../shared/announcer';

let prevActionCount: number | undefined;
let prevRiskCount: number = 0;

interface ActionItem { id: string; kind: string; label: string; meta?: string; score: number; date?: string; icon: string; dismissKey: string; explain?: string; }
interface ActionProviderCtx { now: Date; shows: ReturnType<typeof getShowsCached>; travel: ReturnType<typeof getUpcomingTravel>; }
export type ActionProvider = (c: ActionProviderCtx) => ActionItem[];

const actionProviders: ActionProvider[] = [];
export function registerActionProvider(p: ActionProvider){ actionProviders.push(p); }

// Built-in provider (moved from dashboard.ts)
registerActionProvider(({ now, shows, travel }) => {
  const DAY = 86400000; const nowTs = +now; const items: ActionItem[] = [];
  const feeWeight = (fee: number) => Math.min(60, Math.log10(1 + Math.max(0, fee)) * 18);
  // Overdue
  shows.filter(s => String(s.status).toLowerCase() === 'overdue').forEach(s => {
    const diff = Math.max(1, Math.round((nowTs - +new Date(s.date))/DAY));
    const score = 120 + diff + feeWeight(s.feeEUR);
    items.push({ id: s.id, kind: 'risk', label: ti('ac.label.invoiceOverdue', { city: s.city, venue: s.venue }), meta: ti('ac.meta.overdue', { days: tp('count.days', diff), amount: euros(s.feeEUR) }), score, date:s.date, icon:'alert-triangle', dismissKey:'risk:'+s.id, explain:t('dashboard.actionCenter.kind.risk') });
  });
  // Pending soon
  shows.filter(s => ['pending','tentative','offer'].includes(String(s.status).toLowerCase())).forEach(s => {
    const diffDays = Math.round((+new Date(s.date)-nowTs)/DAY);
    if (diffDays >=0 && diffDays <= 10){
      const score = 70 + (10-diffDays) + feeWeight(s.feeEUR);
      const dayLabel = diffDays===0 ? t('upcoming.bucket.today') : tp('count.days', diffDays);
      items.push({ id:s.id, kind:'urgency', label: ti('ac.label.upcomingShow', { status: String(s.status).toLowerCase(), city: s.city }), meta: ti('ac.meta.daysAmount', { days: dayLabel, amount: euros(s.feeEUR) }), score, date:s.date, icon:'clock', dismissKey:'urg:'+s.id, explain:t('dashboard.actionCenter.kind.urgency') });
    }
  });
  // Confirmed missing travel
  shows.filter(s => String(s.status).toLowerCase()==='confirmed').forEach(s => {
    const diffDays = Math.round((+new Date(s.date)-nowTs)/DAY);
    if (diffDays >=0 && diffDays <=14){
      const hasTravel = travel.some(t => { const td = new Date(t.date); return Math.abs((+td - +new Date(s.date))/DAY) <= 1; });
      if (!hasTravel){
        const score = 55 + (14-diffDays) + feeWeight(s.feeEUR)/2;
        items.push({ id:s.id, kind:'opportunity', label: ti('ac.label.addTravel', { city: s.city, venue: s.venue }), meta: ti('ac.meta.daysAmount', { days: tp('count.days', diffDays), amount: euros(s.feeEUR) }), score, date:s.date, icon:'plane', dismissKey:'opp:'+s.id, explain:t('dashboard.actionCenter.kind.opportunity') });
      }
    }
  });
  // Financial risk
  shows.filter(s => new Date(s.date) >= now).forEach(s => { try { const fin = computeShowFinance(s.id); if (!fin) return; if (fin.net < 0){ const diff = Math.round((+new Date(s.date)-nowTs)/DAY); const decay = Math.max(0, 30-diff); const score = 90 + decay + feeWeight(Math.abs(fin.net)); items.push({ id:s.id, kind:'finrisk', label: ti('ac.label.projectedLoss', { city: s.city, venue: s.venue }), meta: ti('ac.meta.netDays', { net: euros(fin.net), days: tp('count.days', diff) }), score, date:s.date, icon:'trending-down', dismissKey:'fin:'+s.id, explain:t('dashboard.actionCenter.kind.finrisk') }); } } catch {} });
  // Offer follow-up further out
  shows.filter(s => ['tentative','offer'].includes(String(s.status).toLowerCase())).forEach(s => { const diffDays = Math.round((+new Date(s.date)-nowTs)/DAY); if (diffDays >=5 && diffDays <=30){ const score = 65 + (25 - Math.min(diffDays,25)) + feeWeight(s.feeEUR)/3; items.push({ id:s.id, kind:'offer', label: ti('ac.label.followOffer', { city: s.city, venue: s.venue }), meta: ti('ac.meta.daysOut', { days: tp('count.days', diffDays) }), score, date:s.date, icon:'handshake', dismissKey:'off:'+s.id, explain:t('dashboard.actionCenter.kind.offer') }); } });
  return items;
});

const ActionCenterComponent: DashComponent = {
  id: 'action-center',
  mount(panelEl: HTMLElement){
    const list = panelEl.querySelector<HTMLUListElement>('#actionCenterList');
    if (list && !(list as any)._acEvt){
      (list as any)._acEvt = true;
      list.addEventListener('click', (e) => {
        const li = (e.target as HTMLElement).closest('li.ac-item') as HTMLElement | null; if (!li) return;
        const dismissBtn = (e.target as HTMLElement).closest('button.ac-dismiss');
        if (dismissBtn){
          const k = li.getAttribute('data-key');
          if (k){
            try {
              const raw = localStorage.getItem('ac:dismissed');
              const dismissed: string[] = raw ? JSON.parse(raw) : [];
              const set = new Set(dismissed); set.add(k);
              localStorage.setItem('ac:dismissed', JSON.stringify([...set]));
            } catch {}
            li.classList.add('ac-leave');
            setTimeout(()=>{ li.remove(); /* update of empty state occurs on next update cycle */ }, 300);
          }
          return;
        }
        const id = li.getAttribute('data-id'); if (!id) return; const kind = li.getAttribute('data-kind'); const initialTab = kind === 'finrisk' ? 'financials' : 'details';
        events.emit('ui:openShowModal', { id, initialTab });
      });
    }
  },
  update(ctx: DashComponentCtx){
    return perf('dash:actionCenter', () => {
      const list = document.getElementById('actionCenterList') as HTMLUListElement | null; if (!list) return;
      list.setAttribute('aria-busy','true');
      const empty = document.getElementById('actionCenterEmpty') as HTMLDivElement | null;
      const shows = getShowsCached();
      const travel = getUpcomingTravel(ctx.now);
      const dismissedRaw = (()=>{ try { return localStorage.getItem('ac:dismissed'); } catch { return null; } })();
      const dismissed: string[] = dismissedRaw ? JSON.parse(dismissedRaw) : [];
      const existing = new Map<string, HTMLElement>(); Array.from(list.querySelectorAll('li.ac-item')).forEach(li => { const k = li.getAttribute('data-key'); if (k) existing.set(k, li as HTMLElement); });
      const items = actionProviders.flatMap(p => { try { return p({ now: ctx.now, shows, travel }); } catch(err){ console.error('[actionProvider]', err); return []; } });
  const filtered = items.filter(i => !dismissed.includes(i.dismissKey)).sort((a,b)=> b.score - a.score || (a.date||'').localeCompare(b.date||''));
      const nextKeys = new Set(filtered.map(i => i.dismissKey));
      existing.forEach((li,key) => { if (!nextKeys.has(key) && !li.classList.contains('ac-leave')){ li.classList.add('ac-leave'); setTimeout(()=>{ li.remove(); updateEmptyState(); }, 300); } });
      function updateEmptyState(){ if (!list) return; const has = list.querySelector('li.ac-item:not(.ac-leave)'); if (!has){ list.style.display='none'; if (empty) empty.style.display='block'; } }
      if (!filtered.length){
        const had = prevActionCount;
        updateEmptyState(); const panel = document.getElementById('action-center'); if (panel) panel.classList.remove('populated'); list.removeAttribute('aria-busy');
        try { if (had && had > 0) announce(t('aria.ac.empty')); } catch {}
        prevActionCount = 0; prevRiskCount = 0;
        return;
      }
      list.style.display='block'; if (empty) empty.style.display='none';
      let cursor: HTMLElement | null = null;
      filtered.forEach(it => {
        const ex = existing.get(it.dismissKey);
        if (ex){
          const nameEl = ex.querySelector('.ac-label'); if (nameEl && nameEl.textContent !== it.label) nameEl.textContent = it.label;
          const metaEl = ex.querySelector('.ac-meta'); if (metaEl && metaEl.textContent !== (it.meta||'')) metaEl.textContent = it.meta||'';
          if (cursor){ if (cursor.nextSibling !== ex) list.insertBefore(ex, cursor.nextSibling); } else if (list.firstChild !== ex) list.insertBefore(ex, list.firstChild);
          cursor = ex; return;
        }
        const li = document.createElement('li');
        li.className = `ac-item ac-${it.kind}`; li.setAttribute('data-kind', it.kind); li.setAttribute('data-id', it.id); li.setAttribute('data-key', it.dismissKey);
        const explain = it.explain || t('ac.defaultExplain');
        li.setAttribute('title', explain); li.setAttribute('aria-label', `${it.label}. ${explain}`);
        li.innerHTML = `<div class=\"ac-icon\" aria-hidden=\"true\"><i data-lucide=\"${it.icon}\"></i></div><div class=\"ac-main\"><div class=\"ac-label\">${it.label}</div><div class=\"ac-meta muted\">${it.meta||''}</div></div><div class=\"ac-kind-tag\">${t('ac.kind.'+it.kind) }</div><button class=\"ac-dismiss ghost tiny\" title=\"${t('btn.dismiss')}\" aria-label=\"${t('aria.dismissAction')}\"><i data-lucide=\"x\"></i></button>`;
        li.classList.add('ac-enter');
        if (cursor){ list.insertBefore(li, cursor.nextSibling); } else list.insertBefore(li, list.firstChild);
        cursor = li;
      });
      const panel = document.getElementById('action-center'); if (panel) panel.classList.add('populated');
      list.removeAttribute('aria-busy');

      // Announcements
      try {
        const riskCount = filtered.filter(f => f.kind === 'risk').length;
        if (prevActionCount !== undefined){
          if (filtered.length !== prevActionCount){
            const msgKey = `aria.ac.count.${filtered.length===1?'one':'other'}`;
            announce(ti(msgKey, { count: filtered.length }));
          }
          if (riskCount > 0 && prevRiskCount === 0){
            announce(t('aria.ac.newRisk'), { assertive: true });
          }
        } else {
          // Initial render with items present
            const initKey = `aria.ac.count.${filtered.length===1?'one':'other'}`;
            announce(ti(initKey, { count: filtered.length }), { dedupeWindowMs: 1000 });
            if (riskCount > 0) announce(t('aria.ac.newRisk'), { assertive: true });
        }
        prevActionCount = filtered.length; prevRiskCount = riskCount;
      } catch {}
    });
  }
};

registerComponent(ActionCenterComponent);

export {};
