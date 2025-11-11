import { db } from '../lib/firebase';
import { doc, setDoc, getDoc, onSnapshot, collection, query, where, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import type { UserProfile, UserPrefs } from '../lib/demoAuth';
import { upsertUserProfile, upsertUserPrefs } from '../lib/demoAuth';

/**
 * Firestore Profile Service
 * Handles user profile and preferences synchronization with Firebase
 * Includes avatar upload to Firebase Storage
 */
export class FirestoreProfileService {
  private static storage = getStorage();
  private static unsubscribeProfile: (() => void) | null = null;
  private static unsubscribePrefs: (() => void) | null = null;

  /**
   * Initialize profile sync for a user
   * Sets up real-time listeners for profile and preferences
   */
  static async initialize(userId: string): Promise<void> {
    try {
      console.log('[FirestoreProfileService] Initializing for user:', userId);
      
      // Clean up existing listeners
      this.cleanup();
      
      // Load initial profile from Firestore
      await this.loadProfile(userId);
      await this.loadPreferences(userId);
      
      // Set up real-time listeners
      this.setupProfileListener(userId);
      this.setupPreferencesListener(userId);
      
      console.log('[FirestoreProfileService] Initialized successfully');
    } catch (error) {
      console.error('[FirestoreProfileService] Initialization error:', error);
      throw error;
    }
  }

  /**
   * Load user profile from Firestore
   */
  private static async loadProfile(userId: string): Promise<UserProfile | null> {
    try {
      if (!db) throw new Error('Firestore not initialized');
      
      const profileRef = doc(db, 'users', userId, 'profile', 'data');
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        const data = profileSnap.data() as UserProfile;
        console.log('[FirestoreProfileService] Profile loaded:', data);
        upsertUserProfile(data);
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('[FirestoreProfileService] Error loading profile:', error);
      return null;
    }
  }

  /**
   * Load user preferences from Firestore
   */
  private static async loadPreferences(userId: string): Promise<UserPrefs | null> {
    try {
      if (!db) throw new Error('Firestore not initialized');
      
      const prefsRef = doc(db, 'users', userId, 'preferences', 'data');
      const prefsSnap = await getDoc(prefsRef);
      
      if (prefsSnap.exists()) {
        const data = prefsSnap.data() as UserPrefs;
        console.log('[FirestoreProfileService] Preferences loaded:', data);
        upsertUserPrefs(userId, data);
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('[FirestoreProfileService] Error loading preferences:', error);
      return null;
    }
  }

  /**
   * Set up real-time listener for profile changes
   */
  private static setupProfileListener(userId: string): void {
    if (!db) return;
    
    const profileRef = doc(db, 'users', userId, 'profile', 'data');
    
    this.unsubscribeProfile = onSnapshot(
      profileRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as UserProfile;
          console.log('[FirestoreProfileService] Profile updated:', data);
          upsertUserProfile(data);
        }
      },
      (error) => {
        console.error('[FirestoreProfileService] Profile listener error:', error);
      }
    );
  }

  /**
   * Set up real-time listener for preferences changes
   */
  private static setupPreferencesListener(userId: string): void {
    if (!db) return;
    
    const prefsRef = doc(db, 'users', userId, 'preferences', 'data');
    
    this.unsubscribePrefs = onSnapshot(
      prefsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as UserPrefs;
          console.log('[FirestoreProfileService] Preferences updated:', data);
          upsertUserPrefs(userId, data);
        }
      },
      (error) => {
        console.error('[FirestoreProfileService] Preferences listener error:', error);
      }
    );
  }

  /**
   * Save user profile to Firestore
   */
  static async saveProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
    try {
      if (!db) throw new Error('Firestore not initialized');
      
      const profileRef = doc(db, 'users', userId, 'profile', 'data');
      
      await setDoc(profileRef, {
        ...profile,
        id: userId,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      console.log('[FirestoreProfileService] Profile saved');
      
      // Update local storage
      const currentProfile = await this.loadProfile(userId);
      if (currentProfile) {
        upsertUserProfile({ ...currentProfile, ...profile });
      }
    } catch (error) {
      console.error('[FirestoreProfileService] Error saving profile:', error);
      throw error;
    }
  }

  /**
   * Save user preferences to Firestore
   */
  static async savePreferences(userId: string, prefs: Partial<UserPrefs>): Promise<void> {
    try {
      if (!db) throw new Error('Firestore not initialized');
      
      const prefsRef = doc(db, 'users', userId, 'preferences', 'data');
      
      await setDoc(prefsRef, {
        ...prefs,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      console.log('[FirestoreProfileService] Preferences saved');
      
      // Update local storage
      upsertUserPrefs(userId, prefs);
    } catch (error) {
      console.error('[FirestoreProfileService] Error saving preferences:', error);
      throw error;
    }
  }

  /**
   * Upload avatar to Firebase Storage
   * @param userId User ID
   * @param file Image file
   * @returns URL of the uploaded image
   */
  static async uploadAvatar(userId: string, file: File): Promise<string> {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('File size must be less than 5MB');
      }

      // Create a reference to the avatar
      const ext = file.name.split('.').pop();
      const fileName = `avatar_${Date.now()}.${ext}`;
      const avatarRef = ref(this.storage, `users/${userId}/avatars/${fileName}`);

      // Upload the file
      console.log('[FirestoreProfileService] Uploading avatar...');
      await uploadBytes(avatarRef, file);

      // Get the download URL
      const downloadURL = await getDownloadURL(avatarRef);
      console.log('[FirestoreProfileService] Avatar uploaded:', downloadURL);

      // Update profile with new avatar URL
      await this.saveProfile(userId, { avatarUrl: downloadURL });

      return downloadURL;
    } catch (error) {
      console.error('[FirestoreProfileService] Error uploading avatar:', error);
      throw error;
    }
  }

  /**
   * Delete avatar from Firebase Storage
   */
  static async deleteAvatar(userId: string, avatarUrl: string): Promise<void> {
    try {
      // Extract path from URL
      const pathMatch = avatarUrl.match(/\/o\/(.+?)\?/);
      if (!pathMatch || !pathMatch[1]) {
        throw new Error('Invalid avatar URL');
      }

      const path = decodeURIComponent(pathMatch[1]);
      const avatarRef = ref(this.storage, path);

      // Delete the file
      await deleteObject(avatarRef);
      console.log('[FirestoreProfileService] Avatar deleted');

      // Update profile to remove avatar URL
      await this.saveProfile(userId, { avatarUrl: undefined });
    } catch (error) {
      console.error('[FirestoreProfileService] Error deleting avatar:', error);
      throw error;
    }
  }

  /**
   * Migrate local storage data to Firestore
   */
  static async migrateFromLocalStorage(userId: string): Promise<void> {
    try {
      if (!db) throw new Error('Firestore not initialized');
      
      console.log('[FirestoreProfileService] Migrating local data to Firestore...');
      
      // Check if already migrated
      const profileRef = doc(db, 'users', userId, 'profile', 'data');
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        console.log('[FirestoreProfileService] Data already migrated');
        return;
      }

      // Get local data
      const { getUserProfile, getUserPrefs } = await import('../lib/demoAuth');
      const localProfile = getUserProfile(userId);
      const localPrefs = getUserPrefs(userId);

      // Save to Firestore
      if (localProfile) {
        await this.saveProfile(userId, localProfile);
      }

      if (localPrefs) {
        await this.savePreferences(userId, localPrefs);
      }

      console.log('[FirestoreProfileService] Migration completed');
    } catch (error) {
      console.error('[FirestoreProfileService] Migration error:', error);
    }
  }

  /**
   * Export user data (GDPR compliance)
   */
  static async exportUserData(userId: string): Promise<Record<string, any>> {
    try {
      const profile = await this.loadProfile(userId);
      const prefs = await this.loadPreferences(userId);

      return {
        profile,
        preferences: prefs,
        exportedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('[FirestoreProfileService] Error exporting data:', error);
      throw error;
    }
  }

  /**
   * Delete all user data (GDPR right to be forgotten)
   */
  static async deleteUserData(userId: string): Promise<void> {
    try {
      if (!db) throw new Error('Firestore not initialized');
      
      console.log('[FirestoreProfileService] Deleting user data...');
      
      // Delete profile
      const profileRef = doc(db, 'users', userId, 'profile', 'data');
      await setDoc(profileRef, { deleted: true, deletedAt: serverTimestamp() });

      // Delete preferences
      const prefsRef = doc(db, 'users', userId, 'preferences', 'data');
      await setDoc(prefsRef, { deleted: true, deletedAt: serverTimestamp() });

      // Note: Avatar deletion should be handled separately
      // as we need the URL to delete from Storage

      console.log('[FirestoreProfileService] User data deleted');
    } catch (error) {
      console.error('[FirestoreProfileService] Error deleting data:', error);
      throw error;
    }
  }

  /**
   * Cleanup listeners
   */
  static cleanup(): void {
    if (this.unsubscribeProfile) {
      this.unsubscribeProfile();
      this.unsubscribeProfile = null;
    }
    if (this.unsubscribePrefs) {
      this.unsubscribePrefs();
      this.unsubscribePrefs = null;
    }
  }
}
