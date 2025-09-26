import { getUpcomingTravel } from '../../../data/demo';
import { t } from '../../../shared/i18n';
import { perf } from '../../../shared/telemetry';
import { DashComponent, DashComponentCtx, registerComponent } from '../core/component-registry';
import { patchList } from '../core/dom-utils';

const TravelComponent: DashComponent = {
  id: 'month-travel',
  mount(panelEl: HTMLElement){ /* no listeners yet */ },
  update(ctx: DashComponentCtx){
    return perf('dash:travel', () => {
      const list = document.getElementById('travelList') as HTMLUListElement | null; if (!list) return;
      list.setAttribute('aria-busy','true');
      const segs = getUpcomingTravel(ctx.now);
      const frag = document.createElement('ul');
      if (!segs.length){ frag.innerHTML = `<li class=\"muted\">${t('dashboard.monthTravel.empty')}</li>`; }
      else segs.forEach(seg => {
        const li = document.createElement('li');
        li.className = 'card-row travel-card'; li.setAttribute('data-travel-id', seg.id);
        const icon = seg.kind === 'flight' ? 'plane' : seg.kind === 'hotel' ? 'bed-double' : 'bus';
        li.innerHTML = `<div class=\"card-content\"><div class=\"primary-line\"><i data-lucide=\"${icon}\"></i><strong>${seg.title}</strong></div><div class=\"muted secondary-line\">${new Date(seg.date).toLocaleString()} · ${seg.meta}</div></div>`;
        frag.appendChild(li);
      });
      patchList(list, frag);
      list.removeAttribute('aria-busy');
    });
  }
};

registerComponent(TravelComponent);

export {};
