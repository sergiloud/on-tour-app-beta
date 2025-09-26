// Dashboard Feature Barrel Export
// Central entry point for all dashboard-related exports.
// Import from here to avoid deep paths and enable tree-shaking.

export { renderDashboard } from './core/dashboard';
export { events } from './core/events';
export { recordComponentUpdate, getComponentMetrics } from './core/metrics';

// Component exports (for advanced usage)
export { registerComponent, updateComponent, mountComponent } from './core/component-registry';
export { patchList } from './core/dom-utils';
