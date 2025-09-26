import { selectors } from '../../../shared/store';
import { getUpcomingTravel, euros } from '../../../data/demo';
import { t } from '../../../shared/i18n';
import { perf } from '../../../shared/telemetry';
import { focusShow } from '../core/mission-control';
import { DashComponent, DashComponentCtx, registerComponent } from '../core/component-registry';
import { patchList } from '../core/dom-utils';

const UpcomingComponent: DashComponent = {
  id: 'upcoming-feed',
  mount(panelEl: HTMLElement){
    const feed = panelEl.querySelector<HTMLUListElement>('#upcomingList');
    if (feed && !(feed as any)._upcEvt){
      (feed as any)._upcEvt = true;
      feed.addEventListener('click', (e) => {
        const li = (e.target as HTMLElement).closest('li.upcoming-item') as HTMLElement | null; if (!li) return; const type = li.getAttribute('data-type'); const id = li.getAttribute('data-id'); if (type === 'show' && id) focusShow(id);
      });
    }
  },
  update(ctx: DashComponentCtx){
    return perf('dash:upcoming', () => {
      const feed = document.getElementById('upcomingList') as HTMLUListElement | null; if (!feed) return;
      feed.setAttribute('aria-busy','true');
      const now = ctx.now;
      const upcomingShows = selectors.upcomingMonthShows(now).filter(s => new Date(s.date) >= now).map(s => ({ type:'show', id:s.id, date:s.date, label:`Show: ${s.city} — ${s.venue}`, meta: euros(s.feeEUR) }));
      const travel = getUpcomingTravel(now).map(seg => ({ type: 'travel', id: seg.id, date: seg.date, label: seg.title, meta: seg.meta }));
      const all = [...upcomingShows, ...travel].sort((a,b)=> a.date.localeCompare(b.date));
      const frag = document.createElement('ul');
      if (!all.length){ frag.innerHTML = `<li class=\"muted\">${t('dashboard.upcoming.empty')}</li>`; }
      else {
        const DAY = 86400000; const nowTs = +now;
        const bucket = (d: Date) => {
          const diff = Math.floor((+d - nowTs)/DAY);
            if (diff < 0) return t('upcoming.bucket.past');
            if (diff === 0) return t('upcoming.bucket.today');
            if (diff === 1) return t('upcoming.bucket.tomorrow');
            if (diff < 7) return t('upcoming.bucket.thisWeek');
            if (diff < 14) return t('upcoming.bucket.nextWeek');
            if (d.getMonth() === now.getMonth()) return t('dashboard.monthShows.header');
            return t('upcoming.bucket.later');
        };
        let last = '';
        all.forEach(item => {
          const d = new Date(item.date); const header = bucket(d);
          if (header !== last){ const h = document.createElement('li'); h.className = 'feed-header'; h.textContent = header; frag.appendChild(h); last = header; }
          const icon = item.type === 'show' ? 'music' : 'plane';
          const li = document.createElement('li');
          li.className = 'feed-item upcoming-item'; li.setAttribute('data-type', item.type); li.setAttribute('data-id', item.id);
          li.innerHTML = `<div class=\"feed-title\"><i data-lucide=\"${icon}\"></i> ${item.label}</div><div class=\"feed-meta\">${d.toLocaleDateString()} · ${item.meta || ''}</div>`;
          frag.appendChild(li);
        });
      }
      patchList(feed, frag);
      feed.removeAttribute('aria-busy');
    });
  }
};

registerComponent(UpcomingComponent);

export {};
