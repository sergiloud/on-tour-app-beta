// Tour Overview Component
import { DashComponent, DashComponentCtx, registerComponent } from '../core/component-registry';
import { getMonthShows, getNextShow } from '../../shows/core/shows';
import { computeMonthSummary, formatEuro } from '../../finance/core/finance';
import { t } from '../../../shared/i18n';

class TourOverviewComponent implements DashComponent {
  id = 'tour-overview-card';

  mount(container: HTMLElement): void {
    // Component mounts but rendering is handled by update
  }

  update(ctx: DashComponentCtx): void {
    this.render(ctx.now);
  }

  private render(now: Date) {
    const container = document.getElementById(this.id);
    if (!container) return;

    const shows = getMonthShows();
    const summary = computeMonthSummary();
    const nextShow = getNextShow();

    // Calculate metrics
    const totalShows = shows.length;
    const totalRevenue = summary.income || 0;
    const citiesVisited = new Set(shows.map(s => s.city)).size;

    // Calculate days remaining (until last show of the month)
    let daysRemaining = 0;
    if (shows.length > 0) {
      const lastShow = shows.reduce((latest, show) =>
        new Date(show.date) > new Date(latest.date) ? show : latest
      );
      const lastShowDate = new Date(lastShow.date);
      daysRemaining = Math.max(0, Math.ceil((lastShowDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    }

    // Calculate completed shows (past shows)
    const completedShows = shows.filter(s => new Date(s.date) < now).length;
    const progressPercent = totalShows > 0 ? (completedShows / totalShows) * 100 : 0;

    // Generate highlights
    const highlights = this.generateHighlights(shows, summary, nextShow, now);

    // Update DOM
    this.updateMetric('tourTotalShows', totalShows.toString());
    this.updateMetric('tourTotalRevenue', formatEuro(totalRevenue));
    this.updateMetric('tourCitiesVisited', citiesVisited.toString());
    this.updateMetric('tourDaysRemaining', daysRemaining.toString());
    this.updateProgress(progressPercent, completedShows, totalShows);
    this.updateHighlights(highlights);
  }

  private updateMetric(id: string, value: string) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  private updateProgress(percent: number, completed: number, total: number) {
    const fillEl = document.getElementById('tourProgressFill');
    const textEl = document.getElementById('tourProgressText');

    if (fillEl) {
      fillEl.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    }

    if (textEl) {
      textEl.textContent = `${completed} of ${total} shows completed`;
    }
  }

  private updateHighlights(highlights: string[]) {
    const container = document.getElementById('tourHighlights');
    if (!container) return;

    container.innerHTML = highlights.map(highlight => `
      <div class="highlight-item">
        <i data-lucide="star"></i>
        <span>${highlight}</span>
      </div>
    `).join('');
  }

  private generateHighlights(shows: any[], summary: any, nextShow: any, now: Date): string[] {
    const highlights: string[] = [];

    // Revenue highlight
    if (summary.income > 0) {
      highlights.push(`Total revenue: ${formatEuro(summary.income)} this month`);
    }

    // Next show highlight
    if (nextShow) {
      const daysUntil = Math.ceil((new Date(nextShow.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntil === 0) {
        highlights.push('Next show is today!');
      } else if (daysUntil === 1) {
        highlights.push('Next show is tomorrow');
      } else if (daysUntil > 0) {
        highlights.push(`Next show in ${daysUntil} days`);
      }
    }

    // Cities highlight
    const uniqueCities = new Set(shows.map(s => s.city)).size;
    if (uniqueCities > 0) {
      highlights.push(`Visiting ${uniqueCities} cities this month`);
    }

    // Performance highlight
    if (summary.net !== undefined) {
      if (summary.net > 0) {
        highlights.push(`Projected net profit: ${formatEuro(summary.net)}`);
      } else if (summary.net < 0) {
        highlights.push(`Projected loss: ${formatEuro(Math.abs(summary.net))}`);
      }
    }

    // Default highlights if none generated
    if (highlights.length === 0) {
      highlights.push('Tour planning in progress');
      highlights.push('Monitor upcoming shows');
      highlights.push('Track financial performance');
    }

    return highlights.slice(0, 3); // Limit to 3 highlights
  }
}

registerComponent(new TourOverviewComponent());
