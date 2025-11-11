/**
 * Firestore User Service - Cloud sync for user profile and preferences
 * Handles profile data, preferences, settings
 * Data isolation: users/{userId}/profile
 */

import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  Timestamp,
  type Unsubscribe
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  defaultOrgId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  language: 'en' | 'es';
  currency: 'EUR' | 'USD' | 'GBP';
  timezone: string;
  notifications: boolean;
  emailNotifications?: boolean;
  updatedAt: string;
}

export type AgencyTerritoryMode = 'worldwide' | 'continents' | 'countries';
export type ContinentCode = 'NA' | 'SA' | 'EU' | 'AF' | 'AS' | 'OC';
export interface AgencyConfig {
  id: string;
  name: string;
  type: 'booking' | 'management';
  commissionPct: number;
  territoryMode: AgencyTerritoryMode;
  continents?: ContinentCode[];
  countries?: string[];
  notes?: string;
}

export interface UserSettings {
  showPreferences?: {
    defaultView: 'grid' | 'list' | 'calendar';
    defaultSort: string;
    defaultFilters: Record<string, any>;
  };
  mapPreferences?: {
    defaultZoom: number;
    defaultCenter: [number, number];
    defaultLayers: string[];
  };
  uiPreferences?: {
    collapsedPanels: string[];
    sidebarWidth: number;
  };
  bookingAgencies?: AgencyConfig[];
  managementAgencies?: AgencyConfig[];
  updatedAt: string;
}

export interface UserData {
  profile: UserProfile;
  preferences: UserPreferences;
  settings?: UserSettings;
}

export class FirestoreUserService {
  /**
   * Save user profile to Firestore
   */
  static async saveProfile(profile: UserProfile, userId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const profileRef = doc(db, `users/${userId}/profile/main`);
    const profileData = {
      ...profile,
      updatedAt: Timestamp.now()
    };

    await setDoc(profileRef, profileData);
  }

  /**
   * Get user profile from Firestore
   */
  static async getProfile(userId: string): Promise<UserProfile | null> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const profileRef = doc(db, `users/${userId}/profile/main`);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      return null;
    }

    const data = profileSnap.data();
    return {
      ...data,
      id: userId,
      createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt
    } as UserProfile;
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const profileRef = doc(db, `users/${userId}/profile/main`);
    const profileData = {
      ...updates,
      updatedAt: Timestamp.now()
    };

    await setDoc(profileRef, profileData, { merge: true });
  }

  /**
   * Save user preferences to Firestore
   */
  static async savePreferences(preferences: UserPreferences, userId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const prefsRef = doc(db, `users/${userId}/profile/preferences`);
    const prefsData = {
      ...preferences,
      updatedAt: Timestamp.now()
    };

    await setDoc(prefsRef, prefsData);
  }

  /**
   * Get user preferences from Firestore
   */
  static async getPreferences(userId: string): Promise<UserPreferences | null> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const prefsRef = doc(db, `users/${userId}/profile/preferences`);
    const prefsSnap = await getDoc(prefsRef);

    if (!prefsSnap.exists()) {
      return null;
    }

    const data = prefsSnap.data();
    return {
      ...data,
      updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt
    } as UserPreferences;
  }

  /**
   * Update user preferences
   */
  static async updatePreferences(
    userId: string,
    updates: Partial<UserPreferences>
  ): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const prefsRef = doc(db, `users/${userId}/profile/preferences`);
    const prefsData = {
      ...updates,
      updatedAt: Timestamp.now()
    };

    await setDoc(prefsRef, prefsData, { merge: true });
  }

  /**
   * Save user settings to Firestore
   */
  static async saveSettings(settings: UserSettings, userId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    console.log('[FirestoreUserService] Saving settings for user:', userId);
    console.log('[FirestoreUserService] Settings data:', settings);

    // Remove undefined values (Firestore doesn't support them)
    const cleanSettings = JSON.parse(JSON.stringify(settings, (key, value) => 
      value === undefined ? null : value
    ));

    const settingsRef = doc(db, `users/${userId}/profile/settings`);
    const settingsData = {
      ...cleanSettings,
      updatedAt: Timestamp.now()
    };

    await setDoc(settingsRef, settingsData, { merge: true });
    console.log('[FirestoreUserService] Settings saved successfully');
  }

  /**
   * Get user settings from Firestore
   */
  static async getSettings(userId: string): Promise<UserSettings | null> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    console.log('[FirestoreUserService] Loading settings for user:', userId);
    const settingsRef = doc(db, `users/${userId}/profile/settings`);
    const settingsSnap = await getDoc(settingsRef);

    if (!settingsSnap.exists()) {
      console.log('[FirestoreUserService] No settings found for user:', userId);
      return null;
    }

    const data = settingsSnap.data();
    console.log('[FirestoreUserService] Settings loaded:', data);
    return {
      ...data,
      updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt
    } as UserSettings;
  }

  /**
   * Get complete user data (profile + preferences + settings)
   */
  static async getUserData(userId: string): Promise<UserData | null> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const [profile, preferences, settings] = await Promise.all([
      this.getProfile(userId),
      this.getPreferences(userId),
      this.getSettings(userId)
    ]);

    if (!profile) {
      return null;
    }

    return {
      profile,
      preferences: preferences || {
        theme: 'dark',
        language: 'en',
        currency: 'EUR',
        timezone: 'Europe/Madrid',
        notifications: true,
        updatedAt: new Date().toISOString()
      },
      settings: settings || undefined
    };
  }

  /**
   * Subscribe to real-time updates for user profile
   */
  static subscribeToProfile(
    userId: string,
    callback: (profile: UserProfile | null) => void
  ): Unsubscribe {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const profileRef = doc(db, `users/${userId}/profile/main`);

    return onSnapshot(profileRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }

      const data = snapshot.data();
      const profile: UserProfile = {
        id: userId,
        name: data.name || 'User',
        email: data.email || '',
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        defaultOrgId: data.defaultOrgId,
        createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt
      };

      callback(profile);
    });
  }

  /**
   * Subscribe to real-time updates for user preferences
   */
  static subscribeToPreferences(
    userId: string,
    callback: (preferences: UserPreferences | null) => void
  ): Unsubscribe {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const prefsRef = doc(db, `users/${userId}/profile/preferences`);

    return onSnapshot(prefsRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }

      const data = snapshot.data();
      const preferences: UserPreferences = {
        theme: data.theme || 'dark',
        language: data.language || 'en',
        currency: data.currency || 'EUR',
        timezone: data.timezone || 'Europe/Madrid',
        notifications: data.notifications !== false,
        emailNotifications: data.emailNotifications,
        updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt
      };

      callback(preferences);
    });
  }

  /**
   * Migrate localStorage profile and preferences to Firestore
   * Only runs once per user (idempotent)
   */
  static async migrateFromLocalStorage(userId: string): Promise<boolean> {
    if (!db) {
      return false;
    }

    try {
      // Check if user already has profile in Firestore
      const existing = await this.getProfile(userId);
      if (existing) {
        return false; // Already migrated
      }

      // Load profile and preferences from localStorage
      const { getUserProfile, readAllPrefs } = await import('../lib/demoAuth');
      const profile = getUserProfile(userId);
      const prefs = readAllPrefs(userId);

      if (!profile) {
        return false;
      }

      // Migrate profile
      await this.saveProfile({
        ...profile,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, userId);

      // Migrate preferences
      if (prefs) {
        await this.savePreferences({
          theme: (prefs.theme as any) || 'dark',
          language: (prefs.lang as any) || 'en',
          currency: (prefs.currency as any) || 'EUR',
          timezone: 'Europe/Madrid',
          notifications: true,
          updatedAt: new Date().toISOString()
        }, userId);
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to migrate user data:', error);
      return false;
    }
  }
}
