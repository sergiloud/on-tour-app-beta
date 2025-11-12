/**
 * Firestore User Preferences Service
 * 
 * Sincroniza preferencias de usuario con Firebase:
 * - Dashboard filters
 * - Calendar preferences (view, timezone, filters)
 * - Shows preferences (recent cities, venues, cost types)
 * - Welcome page checklist/onboarding progress
 * - Custom fields configuration
 * - Saved filter views
 * - UI preferences (sidebar collapsed, last tab, etc.)
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ============================================================================
// Types
// ============================================================================

export interface DashboardFilters {
  statusFilter: string[];
  dateRange: string;
  searchQuery: string;
}

export interface CalendarPreferences {
  view: 'month' | 'week' | 'day' | 'agenda';
  month: string; // YYYY-MM format
  timezone: string;
  filters: {
    kinds: { shows: boolean; travel: boolean };
    status: { confirmed: boolean; pending: boolean; offer: boolean };
  };
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
  heatmapMode: 'none' | 'financial' | 'activity';
}

export interface ShowsPreferences {
  recentCities?: string[];
  recentVenues?: string[];
  recentCostTypes?: string[];
  lastTab?: 'details' | 'overview' | 'finance' | 'costs';
}

export interface OnboardingProgress {
  welcomeSteps: string[]; // Array of completed step IDs
  lastVisit: number; // timestamp
  activities: string[]; // Array of completed activity IDs
}

export interface CustomFieldConfig {
  typeId: string;
  typeName: string;
  fields: Array<{
    id: string;
    name: string;
    type: 'text' | 'number' | 'date' | 'select' | 'checkbox';
    required: boolean;
    options?: string[];
    placeholder?: string;
    defaultValue?: any;
  }>;
  color?: string;
  icon?: string;
}

export interface SavedFilterView {
  id: string;
  name: string;
  isPreset: boolean;
  filters: {
    filterType: 'all' | 'income' | 'expense';
    filterCategory: string;
    filterStatus: 'all' | 'paid' | 'pending';
    searchQuery: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UIPreferences {
  sidebarCollapsed: boolean;
  lastRoute?: string;
}

export interface ShowDraft {
  showId: string;
  draft: any;
  timestamp: number;
}

export interface FinancePreferences {
  closedPeriods: string[]; // Array of closed month keys like "2024-01"
}

export interface MissionControlLayout {
  currentLayout?: any; // Current tiles configuration
  savedLayouts?: Record<string, any>; // Named layouts
}

export interface UserPreferences {
  dashboard?: DashboardFilters;
  calendar?: CalendarPreferences;
  shows?: ShowsPreferences;
  onboarding?: OnboardingProgress;
  finance?: FinancePreferences;
  missionControl?: MissionControlLayout;
  customFields?: CustomFieldConfig[];
  savedViews?: SavedFilterView[];
  ui?: UIPreferences;
  showDrafts?: ShowDraft[];
  updatedAt?: any;
}

// ============================================================================
// Service
// ============================================================================

class FirestoreUserPreferencesService {
  /**
   * Remove undefined values recursively
   */
  private static removeUndefined(obj: any): any {
    if (obj === null || obj === undefined) return null;
    if (Array.isArray(obj)) return obj.map(item => this.removeUndefined(item));
    if (typeof obj !== 'object') return obj;
    
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = this.removeUndefined(value);
      }
    }
    return cleaned;
  }

  /**
   * Get user preferences document reference
   */
  private static getPreferencesRef(userId: string) {
    if (!db) throw new Error('Firestore not initialized');
    return doc(db, `users/${userId}/preferences/app`);
  }

  /**
   * Save/update dashboard filters
   */
  static async saveDashboardFilters(userId: string, filters: DashboardFilters): Promise<void> {
    try {
      const prefsRef = this.getPreferencesRef(userId);
      const data = this.removeUndefined({
        dashboard: filters,
        updatedAt: serverTimestamp()
      });
      
      await setDoc(prefsRef, data, { merge: true });
    } catch (error) {
      console.error('[FirestoreUserPreferencesService] Error saving dashboard filters:', error);
      throw error;
    }
  }

  /**
   * Save/update calendar preferences
   */
  static async saveCalendarPreferences(userId: string, prefs: CalendarPreferences): Promise<void> {
    try {
      const prefsRef = this.getPreferencesRef(userId);
      const data = this.removeUndefined({
        calendar: prefs,
        updatedAt: serverTimestamp()
      });
      
      await setDoc(prefsRef, data, { merge: true });
    } catch (error) {
      console.error('[FirestoreUserPreferencesService] Error saving calendar preferences:', error);
      throw error;
    }
  }

  /**
   * Save/update shows preferences
   */
  static async saveShowsPreferences(userId: string, prefs: ShowsPreferences): Promise<void> {
    try {
      const prefsRef = this.getPreferencesRef(userId);
      const data = this.removeUndefined({
        shows: prefs,
        updatedAt: serverTimestamp()
      });
      
      await setDoc(prefsRef, data, { merge: true });
    } catch (error) {
      console.error('[FirestoreUserPreferencesService] Error saving shows preferences:', error);
      throw error;
    }
  }

  /**
   * Save/update onboarding progress
   */
  static async saveOnboardingProgress(userId: string, progress: OnboardingProgress): Promise<void> {
    try {
      const prefsRef = this.getPreferencesRef(userId);
      const data = this.removeUndefined({
        onboarding: progress,
        updatedAt: serverTimestamp()
      });
      
      await setDoc(prefsRef, data, { merge: true });
    } catch (error) {
      console.error('[FirestoreUserPreferencesService] Error saving onboarding progress:', error);
      throw error;
    }
  }

  /**
   * Save/update custom fields configuration
   */
  static async saveCustomFields(userId: string, fields: CustomFieldConfig[]): Promise<void> {
    try {
      const prefsRef = this.getPreferencesRef(userId);
      const data = this.removeUndefined({
        customFields: fields,
        updatedAt: serverTimestamp()
      });
      
      await setDoc(prefsRef, data, { merge: true });
    } catch (error) {
      console.error('[FirestoreUserPreferencesService] Error saving custom fields:', error);
      throw error;
    }
  }

  /**
   * Save/update saved filter views
   */
  static async saveSavedViews(userId: string, views: SavedFilterView[]): Promise<void> {
    try {
      const prefsRef = this.getPreferencesRef(userId);
      const data = this.removeUndefined({
        savedViews: views,
        updatedAt: serverTimestamp()
      });
      
      await setDoc(prefsRef, data, { merge: true });
    } catch (error) {
      console.error('[FirestoreUserPreferencesService] Error saving filter views:', error);
      throw error;
    }
  }

  /**
   * Save/update UI preferences
   */
  static async saveUIPreferences(userId: string, ui: UIPreferences): Promise<void> {
    try {
      const prefsRef = this.getPreferencesRef(userId);
      const data = this.removeUndefined({
        ui,
        updatedAt: serverTimestamp()
      });
      
      await setDoc(prefsRef, data, { merge: true });
    } catch (error) {
      console.error('[FirestoreUserPreferencesService] Error saving UI preferences:', error);
      throw error;
    }
  }

  /**
   * Save a show draft for autosave
   */
  static async saveShowDraft(userId: string, showId: string, draft: any): Promise<void> {
    try {
      const prefsRef = this.getPreferencesRef(userId);
      const snapshot = await getDoc(prefsRef);
      const currentDrafts = (snapshot.data()?.showDrafts || []) as ShowDraft[];
      
      // Remove old draft for this show
      const filteredDrafts = currentDrafts.filter(d => d.showId !== showId);
      
      // Add new draft - remove undefined fields (Firestore doesn't allow them)
      const cleanDraft = this.removeUndefined(draft);
      
      const newDraft: ShowDraft = {
        showId,
        draft: cleanDraft,
        timestamp: Date.now()
      };
      
      await setDoc(prefsRef, {
        showDrafts: [...filteredDrafts, newDraft],
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('[FirestoreUserPreferencesService] Error saving show draft:', error);
      throw error;
    }
  }

  /**
   * Get a saved show draft
   */
  static async getShowDraft(userId: string, showId: string): Promise<any | null> {
    try {
      const prefsRef = this.getPreferencesRef(userId);
      const snapshot = await getDoc(prefsRef);
      
      if (!snapshot.exists()) {
        return null;
      }
      
      const drafts = (snapshot.data()?.showDrafts || []) as ShowDraft[];
      const found = drafts.find(d => d.showId === showId);
      
      return found?.draft || null;
    } catch (error) {
      console.error('[FirestoreUserPreferencesService] Error getting show draft:', error);
      throw error;
    }
  }

  /**
   * Remove a show draft (when saved or discarded)
   */
  static async removeShowDraft(userId: string, showId: string): Promise<void> {
    try {
      const prefsRef = this.getPreferencesRef(userId);
      const snapshot = await getDoc(prefsRef);
      
      if (!snapshot.exists()) {
        return;
      }
      
      const currentDrafts = (snapshot.data()?.showDrafts || []) as ShowDraft[];
      const filteredDrafts = currentDrafts.filter(d => d.showId !== showId);
      
      await setDoc(prefsRef, {
        showDrafts: filteredDrafts,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('[FirestoreUserPreferencesService] Error removing show draft:', error);
      throw error;
    }
  }

  /**
   * Save finance preferences (closed periods)
   */
  static async saveFinancePreferences(userId: string, finance: FinancePreferences): Promise<void> {
    try {
      const prefsRef = this.getPreferencesRef(userId);
      await setDoc(prefsRef, {
        finance,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('[FirestoreUserPreferencesService] Error saving finance preferences:', error);
      throw error;
    }
  }

  /**
   * Add a closed period to finance preferences
   */
  static async addClosedPeriod(userId: string, periodKey: string): Promise<void> {
    try {
      const prefsRef = this.getPreferencesRef(userId);
      const snapshot = await getDoc(prefsRef);
      const currentPeriods = (snapshot.data()?.finance?.closedPeriods || []) as string[];
      
      if (!currentPeriods.includes(periodKey)) {
        await setDoc(prefsRef, {
          finance: { closedPeriods: [...currentPeriods, periodKey] },
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    } catch (error) {
      console.error('[FirestoreUserPreferencesService] Error adding closed period:', error);
      throw error;
    }
  }

  /**
   * Remove a closed period from finance preferences
   */
  static async removeClosedPeriod(userId: string, periodKey: string): Promise<void> {
    try {
      const prefsRef = this.getPreferencesRef(userId);
      const snapshot = await getDoc(prefsRef);
      const currentPeriods = (snapshot.data()?.finance?.closedPeriods || []) as string[];
      
      await setDoc(prefsRef, {
        finance: { closedPeriods: currentPeriods.filter(p => p !== periodKey) },
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('[FirestoreUserPreferencesService] Error removing closed period:', error);
      throw error;
    }
  }

  /**
   * Save Mission Control layout
   */
  static async saveMissionControlLayout(userId: string, layout: MissionControlLayout): Promise<void> {
    try {
      const prefsRef = this.getPreferencesRef(userId);
      await setDoc(prefsRef, {
        missionControl: layout,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('[FirestoreUserPreferencesService] Error saving Mission Control layout:', error);
      throw error;
    }
  }

  /**
   * Get all user preferences
   */
  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const prefsRef = this.getPreferencesRef(userId);
      const prefsSnap = await getDoc(prefsRef);
      
      if (!prefsSnap.exists()) {
        return null;
      }
      
      return prefsSnap.data() as UserPreferences;
    } catch (error) {
      console.error('[FirestoreUserPreferencesService] Error getting user preferences:', error);
      throw error;
    }
  }

  /**
   * Subscribe to user preferences changes
   */
  static subscribeToUserPreferences(
    userId: string,
    callback: (preferences: UserPreferences | null) => void
  ): Unsubscribe {
    const prefsRef = this.getPreferencesRef(userId);
    
    return onSnapshot(
      prefsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data() as UserPreferences);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('[FirestoreUserPreferencesService] Error in preferences subscription:', error);
        callback(null);
      }
    );
  }

  /**
   * Migrate from localStorage to Firestore
   */
  static async migrateFromLocalStorage(userId: string): Promise<void> {
    try {
      const preferences: UserPreferences = {};

      // Dashboard filters
      try {
        const dashboardFilters = localStorage.getItem('on-tour-dashboard-filters');
        if (dashboardFilters) {
          preferences.dashboard = JSON.parse(dashboardFilters);
        }
      } catch (e) {
        console.warn('Failed to migrate dashboard filters:', e);
      }

      // Calendar preferences
      try {
        const calendarView = localStorage.getItem('calendar:view');
        const calendarMonth = localStorage.getItem('calendar:month');
        const calendarTz = localStorage.getItem('calendar:tz');
        const calendarFilters = localStorage.getItem('calendar:filters');
        const weekStart = localStorage.getItem('calendar:weekStart');
        const heatmap = localStorage.getItem('calendar:heatmap');

        if (calendarView || calendarMonth || calendarTz || calendarFilters) {
          preferences.calendar = {
            view: (calendarView as any) || 'month',
            month: calendarMonth || new Date().toISOString().slice(0, 7),
            timezone: calendarTz || Intl.DateTimeFormat().resolvedOptions().timeZone,
            filters: calendarFilters ? JSON.parse(calendarFilters) : {
              kinds: { shows: true, travel: true },
              status: { confirmed: true, pending: true, offer: true }
            },
            weekStartsOn: weekStart === '0' ? 0 : 1,
            heatmapMode: (heatmap as any) || 'none'
          };
        }
      } catch (e) {
        console.warn('Failed to migrate calendar preferences:', e);
      }

      // Shows preferences
      try {
        const recentCities = localStorage.getItem('shows.recentCities.v1');
        const recentVenues = localStorage.getItem('shows.recentVenues.v1');
        const recentCostTypes = localStorage.getItem('shows.recentCostTypes.v1');
        const lastTab = localStorage.getItem('showEditor.lastTab');

        if (recentCities || recentVenues || recentCostTypes || lastTab) {
          preferences.shows = {
            recentCities: recentCities ? JSON.parse(recentCities) : [],
            recentVenues: recentVenues ? JSON.parse(recentVenues) : [],
            recentCostTypes: recentCostTypes ? JSON.parse(recentCostTypes) : [],
            lastTab: (lastTab as any) || 'details'
          };
        }
      } catch (e) {
        console.warn('Failed to migrate shows preferences:', e);
      }

      // Onboarding progress
      try {
        const welcomeSteps = localStorage.getItem(`demo:welcome:steps:${userId}`);
        const lastVisit = localStorage.getItem(`demo:welcome:lastVisit:${userId}`);
        const activities = localStorage.getItem(`demo:welcome:activities:${userId}`);

        if (welcomeSteps || lastVisit || activities) {
          preferences.onboarding = {
            welcomeSteps: welcomeSteps ? JSON.parse(welcomeSteps) : [],
            lastVisit: lastVisit ? Number(lastVisit) : Date.now(),
            activities: activities ? JSON.parse(activities) : []
          };
        }
      } catch (e) {
        console.warn('Failed to migrate onboarding progress:', e);
      }

      // Custom fields
      try {
        const customFields = localStorage.getItem('custom-fields-config');
        if (customFields) {
          preferences.customFields = JSON.parse(customFields);
        }
      } catch (e) {
        console.warn('Failed to migrate custom fields:', e);
      }

      // Saved filter views
      try {
        const savedViews = localStorage.getItem('saved-filter-views');
        if (savedViews) {
          preferences.savedViews = JSON.parse(savedViews);
        }
      } catch (e) {
        console.warn('Failed to migrate saved views:', e);
      }

      // UI preferences
      try {
        const sidebarCollapsed = localStorage.getItem('dash-sidebar-collapsed');
        const lastRoute = localStorage.getItem(`demo:lastRoute:${userId}`);

        if (sidebarCollapsed || lastRoute) {
          preferences.ui = {
            sidebarCollapsed: sidebarCollapsed === '1',
            lastRoute: lastRoute || '/dashboard'
          };
        }
      } catch (e) {
        console.warn('Failed to migrate UI preferences:', e);
      }

      // Save all migrated preferences
      if (Object.keys(preferences).length > 0) {
        const prefsRef = this.getPreferencesRef(userId);
        const data = this.removeUndefined({
          ...preferences,
          updatedAt: serverTimestamp()
        });
        
        await setDoc(prefsRef, data, { merge: true });
        console.log('[FirestoreUserPreferencesService] Successfully migrated preferences from localStorage');
      }
    } catch (error) {
      console.error('[FirestoreUserPreferencesService] Error migrating from localStorage:', error);
      throw error;
    }
  }
}

export default FirestoreUserPreferencesService;
