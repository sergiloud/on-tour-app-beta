import { useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { trackEvent } from '../lib/telemetry';
import { activityTracker, type Activity } from '../lib/activityTracker';

interface UserBehavior {
  pageVisits: Record<string, number>;
  featureUsage: Record<string, number>;
  lastUpdated: number;
}

interface PersonalizedQuickAccess {
  title: string;
  description: string;
  to: string;
  icon: string;
  priority: number; // 0-1, higher = more relevant
}


// (Deduped duplicate declarations removed)

export function useUserBehavior() {
  const { profile } = useAuth();

  // Get behavior stats from activity tracker
  const behaviorStats = useMemo(() => {
    const recentActivity = activityTracker.getRecentActivities(50);
    const sectionVisits: Record<string, number> = {};
    let totalVisits = 0;

    // Count visits by section
    recentActivity.forEach(activity => {
      if (activity.type === 'page_view') {
        const section = activity.item;
        sectionVisits[section] = (sectionVisits[section] || 0) + 1;
        totalVisits++;
      }
    });

    // Find most visited section
    let mostVisitedSection = '';
    let maxVisits = 0;
    Object.entries(sectionVisits).forEach(([section, visits]) => {
      if (visits > maxVisits) {
        maxVisits = visits;
        mostVisitedSection = section;
      }
    });

    return {
      sectionVisits,
      mostVisitedSection,
      totalVisits,
      recentActivity
    };
  }, [profile?.id]);

  // Track page visits (legacy compatibility)
  const trackPageVisit = (page: string) => {
    if (!profile?.id) return;

    try {
      // Use the activity tracker instead of local storage
      activityTracker.track({
        type: 'page_view',
        item: page
      });
      trackEvent('behavior.pageVisit', { page });
    } catch (error) {
      console.warn('Failed to track user behavior:', error);
    }
  };

  // Track feature usage (legacy compatibility)
  const trackFeatureUsage = (feature: string) => {
    if (!profile?.id) return;

    try {
      // Use the activity tracker instead of local storage
      activityTracker.track({
        type: 'page_view', // Using page_view as generic activity type
        item: `feature:${feature}`
      });
      trackEvent('behavior.featureUsage', { feature });
    } catch (error) {
      console.warn('Failed to track user behavior:', error);
    }
  };

  // Get personalized recommendations
  const personalizedAccess = useMemo((): PersonalizedQuickAccess[] => {
    if (!profile?.id) return [];

    const recommendations: PersonalizedQuickAccess[] = [];

    // Analyze page visit patterns from activity tracker
    const topPages = Object.entries(behaviorStats.sectionVisits)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    // Create personalized quick access based on behavior
    topPages.forEach(([page, visits]) => {
      const priority = Math.min(visits / 10, 1); // Normalize to 0-1

      switch (page) {
        case 'finance':
          recommendations.push({
            title: '💰 Quick Finance Check',
            description: 'Your most visited section - review latest numbers',
            to: '/dashboard/finance',
            icon: '📊',
            priority
          });
          break;
        case 'calendar':
          recommendations.push({
            title: '📅 Calendar Overview',
            description: 'Stay on top of your schedule',
            to: '/dashboard/calendar',
            icon: '📅',
            priority
          });
          break;
        case 'travel':
          recommendations.push({
            title: '✈️ Travel Hub',
            description: 'Manage your travel arrangements',
            to: '/dashboard/travel',
            icon: '✈️',
            priority
          });
          break;
        case 'shows':
          recommendations.push({
            title: '🎵 Shows Management',
            description: 'Keep your performances organized',
            to: '/dashboard/shows',
            icon: '🎵',
            priority
          });
          break;
        case 'org_overview':
          recommendations.push({
            title: '🏢 Organization Hub',
            description: 'Manage your organization overview',
            to: '/dashboard/org',
            icon: '🏢',
            priority
          });
          break;
      }
    });

    return recommendations.sort((a, b) => b.priority - a.priority);
  }, [profile?.id, behaviorStats.sectionVisits]);

  return {
    trackPageVisit,
    trackFeatureUsage,
    personalizedAccess,
    behaviorStats
  };
}

// Hook for getting personalized widget order
export const usePersonalizedWidgetOrder = (defaultOrder: string[]): string[] => {
  const { behaviorStats } = useUserBehavior();

  return useMemo(() => {
    if (!behaviorStats.mostVisitedSection) return defaultOrder;

    // Create a copy of the default order
    const personalizedOrder = [...defaultOrder];

    // Define section-to-widget mapping
    const sectionWidgetMap: Record<string, string> = {
      'shows': 'shows',
      'finance': 'finance',
      'travel': 'travel',
      'calendar': 'calendar',
      'org_overview': 'org'
    };

    const preferredWidget = sectionWidgetMap[behaviorStats.mostVisitedSection];
    if (preferredWidget && personalizedOrder.includes(preferredWidget)) {
      // Move the preferred widget to the front
      const index = personalizedOrder.indexOf(preferredWidget);
      personalizedOrder.splice(index, 1);
      personalizedOrder.unshift(preferredWidget);
    }

    return personalizedOrder;
  }, [defaultOrder, behaviorStats.mostVisitedSection]);
};