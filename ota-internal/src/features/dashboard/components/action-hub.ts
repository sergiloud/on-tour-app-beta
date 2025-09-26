// Action Hub Component with Enhanced Tabs
import { DashComponent, DashComponentCtx, registerComponent } from '../core/component-registry';
import { t } from '../../../shared/i18n';
import { events } from '../core/events';

interface TabContent {
  id: string;
  label: string;
  icon: string;
  content: string;
  count?: number;
}

class ActionHubComponent implements DashComponent {
  id = 'action-hub';
  private activeTab = 'actions';
  private tabs: TabContent[] = [
    {
      id: 'actions',
  label: t('dashboard.actionHub.tabs.actions') || 'Actions',
      icon: 'zap',
      content: 'actions'
    },
    {
      id: 'insights',
  label: t('dashboard.actionHub.tabs.insights') || 'Insights',
      icon: 'bar-chart-3',
      content: 'insights'
    },
    {
      id: 'performance',
  label: t('dashboard.actionHub.tabs.performance') || 'Performance',
      icon: 'trending-up',
      content: 'performance'
    }
  ];

  mount(container: HTMLElement): void {
    this.bindEvents(container);
  }

  update(ctx: DashComponentCtx): void {
    this.render(ctx.now);
  }

  private render(now: Date) {
    const container = document.getElementById(this.id);
    if (!container) return;

    const activeTabContent = this.tabs.find(tab => tab.id === this.activeTab);

    container.innerHTML = `
      <div class="panel-head action-hub-header">
        <div class="action-hub-title">
          <h2><i class="lucide-${activeTabContent?.icon || 'zap'}"></i> ${activeTabContent?.label || t('dashboard.actionHub.tabs.actions')}</h2>
          <div class="action-hub-stats">
            <span class="stat-pill success"><i class="lucide-check-circle"></i> 12 Active</span>
            <span class="stat-pill"><i class="lucide-clock"></i> 3 Pending</span>
          </div>
        </div>
        <div class="action-hub-controls">
          <button class="btn-ghost" title="Refresh"><i class="lucide-refresh-cw"></i></button>
          <button class="btn-ghost" title="Settings"><i class="lucide-settings"></i></button>
          <button class="btn-primary"><i class="lucide-plus"></i> ${t('dashboard.actionHub.newAction') || 'New Action'}</button>
        </div>
      </div>
      <div class="panel-body action-hub-body">
        <div class="action-hub-tabs">
          ${this.tabs.map(tab => `
            <button class="tab-btn ${tab.id === this.activeTab ? 'active' : ''}" data-tab="${tab.id}">
              <i class="lucide-${tab.icon}"></i>
              ${tab.label}
              ${tab.count ? `<span class="tab-count">${tab.count}</span>` : ''}
            </button>
          `).join('')}
        </div>
        <div class="action-tab-content">
          ${this.renderTabContent(this.activeTab, now)}
        </div>
      </div>
    `;
  }

  private renderTabContent(tabId: string, now: Date): string {
    switch (tabId) {
      case 'actions':
        return this.renderActionsTab(now);
      case 'insights':
        return this.renderInsightsTab(now);
      case 'performance':
        return this.renderPerformanceTab(now);
      default:
        return this.renderActionsTab(now);
    }
  }

  private renderActionsTab(now: Date): string {
    return `
      <div class="section-header">
  <h3><i class="lucide-zap"></i> ${t('dashboard.actionHub.priorityActions') || 'Priority Actions'}</h3>
        <div class="section-actions">
          <button class="btn-ghost"><i class="lucide-filter"></i> ${t('dashboard.actionHub.filter') || 'Filter'}</button>
          <button class="btn-ghost"><i class="lucide-sort-desc"></i> ${t('dashboard.actionHub.sort') || 'Sort'}</button>
        </div>
      </div>
      <ul class="card-list enhanced">
        <li>
          <div class="action-item">
            <div class="action-icon risk"><i class="lucide-alert-triangle"></i></div>
            <div class="action-content">
              <div class="action-title">Invoice overdue for Madrid show</div>
              <div class="action-meta">5 days overdue • €2,450</div>
            </div>
            <div class="action-actions">
              <button class="btn-ghost"><i class="lucide-external-link"></i></button>
            </div>
          </div>
        </li>
        <li>
          <div class="action-item">
            <div class="action-icon urgency"><i class="lucide-clock"></i></div>
            <div class="action-content">
              <div class="action-title">Barcelona show pending confirmation</div>
              <div class="action-meta">Due in 3 days • €1,800</div>
            </div>
            <div class="action-actions">
              <button class="btn-ghost"><i class="lucide-external-link"></i></button>
            </div>
          </div>
        </li>
        <li>
          <div class="action-item">
            <div class="action-icon opportunity"><i class="lucide-plane"></i></div>
            <div class="action-content">
              <div class="action-title">Add travel for Valencia show</div>
              <div class="action-meta">Show in 7 days • €950</div>
            </div>
            <div class="action-actions">
              <button class="btn-ghost"><i class="lucide-plus"></i></button>
            </div>
          </div>
        </li>
      </ul>
    `;
  }

  private renderInsightsTab(now: Date): string {
    return `
      <div class="section-header">
  <h3><i class="lucide-bar-chart-3"></i> ${t('dashboard.actionHub.businessInsights') || 'Business Insights'}</h3>
        <div class="section-actions">
          <button class="btn-ghost"><i class="lucide-calendar"></i> ${t('dashboard.actionHub.thisMonth') || 'This Month'}</button>
          <button class="btn-ghost"><i class="lucide-download"></i> ${t('dashboard.actionHub.export') || 'Export'}</button>
        </div>
      </div>
      <div class="insights-grid">
        <div class="insight-card">
          <div class="insight-icon"><i class="lucide-trending-up"></i></div>
          <div class="insight-content">
            <h4>Revenue Growth</h4>
            <div class="insight-metric">+12.5%</div>
            <div class="insight-chart"></div>
          </div>
        </div>
        <div class="insight-card">
          <div class="insight-icon"><i class="lucide-users"></i></div>
          <div class="insight-content">
            <h4>Audience Size</h4>
            <div class="insight-metric">2,847 avg</div>
            <div class="insight-chart"></div>
          </div>
        </div>
        <div class="insight-card">
          <div class="insight-icon"><i class="lucide-dollar-sign"></i></div>
          <div class="insight-content">
            <h4>Profit Margin</h4>
            <div class="insight-metric">23.4%</div>
            <div class="insight-chart"></div>
          </div>
        </div>
        <div class="insight-card">
          <div class="insight-icon"><i class="lucide-target"></i></div>
          <div class="insight-content">
            <h4>Booking Rate</h4>
            <div class="insight-metric">87.3%</div>
            <div class="insight-chart"></div>
          </div>
        </div>
      </div>
    `;
  }

  private renderPerformanceTab(now: Date): string {
    return `
      <div class="section-header">
  <h3><i class="lucide-trending-up"></i> ${t('dashboard.actionHub.performanceMetrics') || 'Performance Metrics'}</h3>
        <div class="section-actions">
          <button class="btn-ghost"><i class="lucide-bar-chart-3"></i> ${t('dashboard.actionHub.details') || 'Details'}</button>
          <button class="btn-ghost"><i class="lucide-share"></i> ${t('dashboard.actionHub.share') || 'Share'}</button>
        </div>
      </div>
      <div class="performance-content">
        <div class="metric-overview">
          <div class="metric-item">
            <div class="metric-label">Shows This Month</div>
            <div class="metric-value">8</div>
            <div class="metric-change positive">+2 vs last month</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">Total Revenue</div>
            <div class="metric-value">€24,750</div>
            <div class="metric-change positive">+8.3%</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">Avg. Attendance</div>
            <div class="metric-value">2,156</div>
            <div class="metric-change positive">+5.2%</div>
          </div>
        </div>
        <div class="empty-state">
          <i class="lucide-bar-chart-3"></i>
          <h4>Performance Chart</h4>
          <p>Detailed performance analytics will be displayed here</p>
        </div>
      </div>
    `;
  }

  private bindEvents(container: HTMLElement) {
    // Use event delegation for dynamic content
    container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      // Tab switching
      const tabBtn = target.closest('.tab-btn') as HTMLElement;
      if (tabBtn) {
        const tabId = tabBtn.dataset.tab;
        if (tabId) {
          this.switchTab(tabId);
          this.render(new Date());
        }
        return;
      }

      // Action buttons
      if (target.closest('.btn-ghost, .btn-primary')) {
        e.preventDefault();
        // Handle button actions here
        console.log('Action button clicked');
      }
    });
  }

  private switchTab(tabId: string) {
    this.activeTab = tabId;
    // Update URL hash for deep linking (optional)
    if (window.location.hash !== `#${tabId}`) {
      window.location.hash = tabId;
    }
  }
}

registerComponent(new ActionHubComponent());

// Handle URL hash changes for deep linking
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.substring(1);
  if (['actions', 'insights', 'performance'].includes(hash)) {
    const component = new ActionHubComponent();
    component['switchTab'](hash);
    const container = document.getElementById('action-hub');
    if (container) {
      component.update({ now: new Date() });
    }
  }
});
