import { selectors } from '../../../shared/store';
import { euros } from '../../../data/demo';
import { t } from '../../../shared/i18n';
import { perf } from '../../../shared/telemetry';
import { focusShow } from '../core/mission-control';
import { DashComponent, DashComponentCtx, registerComponent } from '../core/component-registry';
import { patchList } from '../core/dom-utils';

const MonthShowsComponent: DashComponent = {
  id: 'month-shows',
  mount(panelEl: HTMLElement){
    const list = panelEl.querySelector<HTMLUListElement>('#showsList');
    if (list && !(list as any)._showsEvt){
      (list as any)._showsEvt = true;
      list.addEventListener('click', (e) => {
        const li = (e.target as HTMLElement).closest('li[data-show-id]') as HTMLElement | null; if (!li) return; const id = li.getAttribute('data-show-id'); if (id) focusShow(id);
      });
    }
  },
  update(ctx: DashComponentCtx){
    return perf('dash:monthShows', () => {
      const list = document.getElementById('showsList') as HTMLUListElement | null; if (!list) return;
      list.setAttribute('aria-busy','true');
      const shows = selectors.currentMonthShows(ctx.now);
      const frag = document.createElement('ul');
      if (!shows.length){ frag.innerHTML = `<li class="muted">${t('dashboard.monthShows.empty')}</li>`; }
      else shows.slice().sort((a,b)=> a.date.localeCompare(b.date)).forEach(s => {
        const li = document.createElement('li');
        li.className = 'card-row show-card'; li.setAttribute('data-show-id', s.id);
        const dateStr = new Date(s.date).toLocaleDateString();
        li.innerHTML = `<div class="card-content"><div class="primary-line"><strong>${s.city}</strong> — ${s.venue}</div><div class="muted secondary-line">${dateStr}</div></div><div class="card-kpi"><div class="kpi-value">${euros(s.feeEUR)}</div><div class="kpi-label">${s.status}</div></div>`;
        frag.appendChild(li);
      });
      patchList(list, frag);
      list.removeAttribute('aria-busy');
    });
  }
};

registerComponent(MonthShowsComponent);

export {}; // side-effect registration
