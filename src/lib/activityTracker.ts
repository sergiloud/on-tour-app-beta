import { secureStorage } from './secureStorage';

export interface Activity {
  type: 'page_view' | 'show_view' | 'contract_action' | 'finance_view' | 'travel_view' | 'calendar_view' | 'settings_view' | 'report_view';
  item: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export class ActivityTracker {
  private static instance: ActivityTracker;
  private userId: string | null = null;

  static getInstance(): ActivityTracker {
    if (!ActivityTracker.instance) {
      ActivityTracker.instance = new ActivityTracker();
    }
    return ActivityTracker.instance;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  track(activity: Omit<Activity, 'timestamp'>) {
    if (!this.userId) return;

    const activityWithTimestamp: Activity = {
      ...activity,
      timestamp: Date.now()
    };

    try {
      const key = `demo:activity:${this.userId}`;
      const activities = secureStorage.getItem<Activity[]>(key) || [];
      activities.unshift(activityWithTimestamp);

      // Keep only last 50 activities
      if (activities.length > 50) activities.splice(50);

      secureStorage.setItem(key, activities);
    } catch (error) {
      console.warn('Failed to track activity:', error);
    }
  }

  getRecentActivities(limit: number = 10, since?: number): Activity[] {
    if (!this.userId) return [];

    try {
      const key = `demo:activity:${this.userId}`;
      const activities = secureStorage.getItem<Activity[]>(key) || [];
      const filtered = since ? activities.filter(a => a.timestamp > since) : activities;
      return filtered.slice(0, limit);
    } catch {
      return [];
    }
  }

  getActivitiesByType(type: Activity['type'], limit: number = 10): Activity[] {
    if (!this.userId) return [];

    try {
      const key = `demo:activity:${this.userId}`;
      const activities = secureStorage.getItem<Activity[]>(key) || [];
      return activities.filter(a => a.type === type).slice(0, limit);
    } catch {
      return [];
    }
  }

  clearActivities() {
    if (!this.userId) return;

    try {
      const key = `demo:activity:${this.userId}`;
      secureStorage.removeItem(key);
    } catch { }
  }
}

// Convenience functions
export const activityTracker = ActivityTracker.getInstance();

export const trackActivity = (activity: Omit<Activity, 'timestamp'>) => {
  activityTracker.track(activity);
};

export const getRecentActivity = (limit?: number, since?: number): Activity[] => {
  return activityTracker.getRecentActivities(limit, since);
};

export const getActivitiesByType = (type: Activity['type'], limit?: number): Activity[] => {
  return activityTracker.getActivitiesByType(type, limit);
};

// Page view tracking helpers
export const trackPageView = (page: string, metadata?: Record<string, any>) => {
  trackActivity({
    type: 'page_view',
    item: page,
    metadata
  });
};

export const trackShowView = (showId: string, metadata?: Record<string, any>) => {
  trackActivity({
    type: 'show_view',
    item: showId,
    metadata
  });
};

export const trackFinanceView = (section: string, metadata?: Record<string, any>) => {
  trackActivity({
    type: 'finance_view',
    item: section,
    metadata
  });
};

export const trackTravelView = (section: string, metadata?: Record<string, any>) => {
  trackActivity({
    type: 'travel_view',
    item: section,
    metadata
  });
};

export const trackCalendarView = (view: string, metadata?: Record<string, any>) => {
  trackActivity({
    type: 'calendar_view',
    item: view,
    metadata
  });
};

export const trackSettingsView = (section: string, metadata?: Record<string, any>) => {
  trackActivity({
    type: 'settings_view',
    item: section,
    metadata
  });
};

export const trackReportView = (reportType: string, metadata?: Record<string, any>) => {
  trackActivity({
    type: 'report_view',
    item: reportType,
    metadata
  });
};

export const trackContractAction = (action: string, contractId: string, metadata?: Record<string, any>) => {
  trackActivity({
    type: 'contract_action',
    item: `${action}:${contractId}`,
    metadata
  });
};
