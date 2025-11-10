import { trackEvent } from '../telemetry';

export const UIEvents = {
  filtersCleared(ctx?: Record<string, any>) {
    trackEvent('filters.cleared', ctx);
  },
  filtersApplied(ctx?: Record<string, any>) {
    trackEvent('filters.applied', ctx);
  },
  filterPresetUsed(preset: string, ctx?: Record<string, any>) {
    trackEvent('filters.preset', { preset, ...(ctx||{}) });
  },
  viewSaved(name?: string, ctx?: Record<string, any>) {
    trackEvent('views.saved', { name, ...(ctx||{}) });
  },
  viewApplied(name?: string, ctx?: Record<string, any>) {
    trackEvent('views.applied', { name, ...(ctx||{}) });
  },
  viewDeleted(name?: string, ctx?: Record<string, any>) {
    trackEvent('views.deleted', { name, ...(ctx||{}) });
  },
  viewShared(ctx?: Record<string, any>) {
    trackEvent('views.shared', ctx);
  }
};

export default UIEvents;
