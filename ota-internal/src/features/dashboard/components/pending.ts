import { selectors, updateShow } from '../../../shared/store';
import { euros } from '../../../data/demo';
import { tp, t, ti } from '../../../shared/i18n';
import { perf } from '../../../shared/telemetry';
import { events } from '../core/events';
import { DashComponent, DashComponentCtx, registerComponent } from '../core/component-registry';
import { patchList } from '../core/dom-utils';
import { announce } from '../../../shared/announcer';

let prevPendingCount: number | undefined; // track previous count for announcer

function markPendingPaid(li: HTMLElement, id: string){
  li.classList.add('mark-paid-anim');
  setTimeout(() => {
    updateShow(id, { status: 'confirmed' } as any);
    li.addEventListener('transitionend', () => { if (li.parentElement) li.parentElement.removeChild(li); }, { once:true });
    li.classList.add('mark-paid-fade');
  }, 350);
}

const PendingComponent: DashComponent = {
  id: 'pending-actions',
  mount(panelEl: HTMLElement){
    const list = panelEl.querySelector<HTMLUListElement>('#pendingList');
    if (list && !(list as any)._pendingEvt){
      (list as any)._pendingEvt = true;
      list.addEventListener('click', (e) => {
        const btn = (e.target as HTMLElement).closest('button.mark-paid-btn') as HTMLButtonElement | null;
        if (btn){
          e.stopPropagation();
          const li = btn.closest('li[data-show-id]') as HTMLElement | null; if (!li) return;
          const id = li.getAttribute('data-show-id'); if (!id) return;
          markPendingPaid(li, id);
          return;
        }
        const li = (e.target as HTMLElement).closest('li[data-show-id]') as HTMLElement | null; if (!li) return; const id = li.getAttribute('data-show-id'); if (!id) return; events.emit('ui:openShowModal', { id });
      });
    }
  },
  update(ctx: DashComponentCtx){
    return perf('dash:pending', () => {
      const list = document.getElementById('pendingList') as HTMLUListElement | null; if (!list) return;
      list.setAttribute('aria-busy','true');
  const items = selectors.pendingShows();
      const frag = document.createElement('ul');
      if (!items.length){ frag.innerHTML = `<li class="muted">${t('dashboard.pending.empty')}</li>`; }
      else items.slice().sort((a,b)=> a.date.localeCompare(b.date)).forEach(s => {
        const li = document.createElement('li');
        li.className = 'card-row pending-card';
        li.setAttribute('data-show-id', s.id);
        li.innerHTML = `<div class="card-content"><div class="primary-line"><strong>${s.city}</strong> — ${s.venue}</div><div class="muted secondary-line">${new Date(s.date).toLocaleDateString()}</div></div><div class="card-kpi"><div class="kpi-value">${euros(s.feeEUR)}</div><div class="kpi-label">${s.status}</div><button class="tiny ghost mark-paid-btn" data-action="mark-paid" title="${t('dashboard.pending.markPaid')}" aria-label="${t('dashboard.pending.markPaid')}"><i data-lucide="check"></i></button></div>`;
        frag.appendChild(li);
      });
      patchList(list, frag);
      list.removeAttribute('aria-busy');
      const c = document.getElementById('pendingCountLabel'); if (c) c.textContent = tp('count.pending', items.length);

      // Live region announcement (avoid announcing on very first render unless there is content)
      try {
        if (prevPendingCount !== undefined){
          if (items.length === 0 && prevPendingCount > 0){
            announce(t('aria.pending.cleared'));
          } else if (items.length !== prevPendingCount && items.length > 0){
            const msg = ti(`aria.pending.count.${items.length===1?'one':'other'}`, { count: items.length });
            announce(msg);
          }
        } else if (items.length > 0){
          // First render with existing items: give user initial context
          const initMsg = ti(`aria.pending.count.${items.length===1?'one':'other'}`, { count: items.length });
          announce(initMsg, { dedupeWindowMs: 1000 });
        }
      } catch {}
      prevPendingCount = items.length;
    });
  }
};

registerComponent(PendingComponent);

export {}; // side-effect registration
