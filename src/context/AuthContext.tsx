import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { getCurrentUserId, getUserPrefs, getUserProfile, readAllPrefs, setCurrentUserId, upsertUserPrefs, upsertUserProfile, type UserPrefs, type UserProfile, PROPHECY_USER } from '../lib/demoAuth';
// DISABLED FOR PRODUCTION BETA - all data comes from Firestore now
// import { ensureDemoAuth, ensureDemoTenants } from '../lib/demoAuth';
import { activityTracker } from '../lib/activityTracker';

interface AuthCtx {
  userId: string;
  profile: UserProfile;
  prefs: UserPrefs;
  setUserId: (id: string) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  updatePrefs: (patch: Partial<UserPrefs>) => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // DISABLED FOR PRODUCTION BETA - getCurrentUserId will handle Firebase users
  const [userId, setUserIdState] = useState<string>(()=>{ try { return getCurrentUserId() || ''; } catch { return ''; } });
  const [profile, setProfile] = useState(()=> getUserProfile(userId) || { id: userId, name: 'User', email: 'user@example.com' });
  const [prefs, setPrefs] = useState(()=> readAllPrefs(userId));

  useEffect(()=>{
    try {
      const p = getUserProfile(userId);
      setProfile(p || { id: userId, name: 'User', email: 'user@example.com' });
      setPrefs(readAllPrefs(userId));
    } catch {}
  }, [userId]);

  useEffect(()=>{
    const onProfile = () => { try { const p = getUserProfile(userId); if (p) setProfile(p); } catch {} };
    const onPrefs = () => { try { setPrefs(readAllPrefs(userId)); } catch {} };
    window.addEventListener('profile:updated' as any, onProfile);
    window.addEventListener('prefs:updated' as any, onPrefs);
    return () => { window.removeEventListener('profile:updated' as any, onProfile); window.removeEventListener('prefs:updated' as any, onPrefs); };
  }, [userId]);

  const setUserId = useCallback((id: string) => {
    setCurrentUserId(id);
    setUserIdState(id);
    activityTracker.setUserId(id);
    
    // Skip Firebase sync for demo users
    const isDemoUser = id.startsWith('demo_') || id.includes('@demo.com');
    
    if (!isDemoUser) {
      // Initialize profile service for real users
      try {
        import('../services/firestoreProfileService').then(({ FirestoreProfileService }) => {
          FirestoreProfileService.initialize(id);
        });
      } catch (e) {
        console.warn('Could not initialize profile service:', e);
      }

      // Initialize ALL hybrid services for real users
      try {
        import('../services/hybridShowService').then(({ HybridShowService }) => {
          HybridShowService.initialize(id);
        });
      } catch (e) {
        console.warn('Could not initialize hybrid show service:', e);
      }
      
      try {
        import('../services/hybridContactService').then(({ HybridContactService }) => {
          HybridContactService.initialize(id);
        });
      } catch (e) {
        console.warn('Could not initialize hybrid contact service:', e);
      }

      try {
        import('../services/hybridVenueService').then(({ HybridVenueService }) => {
          HybridVenueService.initialize(id);
        });
      } catch (e) {
        console.warn('Could not initialize hybrid venue service:', e);
      }

      // TODO: Initialize finance, travel, org, and user services
      // These will be created as hybrid services following the same pattern
      try {
        import('../services/firestoreUserService').then(({ FirestoreUserService }) => {
          FirestoreUserService.migrateFromLocalStorage(id);
        });
      } catch (e) {
        console.warn('Could not initialize user service:', e);
      }

      try {
        import('../services/firestoreFinanceService').then(({ FirestoreFinanceService }) => {
          FirestoreFinanceService.migrateFromLocalStorage(id);
        });
      } catch (e) {
        console.warn('Could not initialize finance service:', e);
      }

      try {
        import('../services/firestoreTravelService').then(({ FirestoreTravelService }) => {
          FirestoreTravelService.migrateFromLocalStorage(id);
        });
      } catch (e) {
        console.warn('Could not initialize travel service:', e);
      }

      try {
        import('../services/firestoreOrgService').then(({ FirestoreOrgService }) => {
          FirestoreOrgService.migrateFromLocalStorage(id);
        });
      } catch (e) {
        console.warn('Could not initialize org service:', e);
      }
    }
    
    // Load Prophecy data if switching to Prophecy user
    if (id === PROPHECY_USER) {
      try {
        const { loadProphecyData } = require('../lib/prophecyDataset');
        loadProphecyData();
      } catch (e) {
        console.warn('Could not load frontend Prophecy data:', e);
      }

      // DISABLED FOR PRODUCTION BETA
      // Initialize backend data asynchronously
      /* try {
        import('../services/prophecyBackendService').then(({ ProphecyBackendService }) => {
          ProphecyBackendService.initializeProphecyUser('org_artist_prophecy');
        });
      } catch (e) {
        console.warn('Could not initialize backend Prophecy data:', e);
      } */
    }
  }, []);

  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setProfile(prev => {
      const next = { ...prev, ...patch } as UserProfile;
      upsertUserProfile(next);
      return next;
    });
  }, []);

  const updatePrefs = useCallback((patch: Partial<UserPrefs>) => {
    const next = upsertUserPrefs(userId, patch);
    setPrefs(next);
  }, [userId]);

  const value = useMemo(()=> ({ userId, profile, prefs, setUserId, updateProfile, updatePrefs }), [userId, profile, prefs, setUserId, updateProfile, updatePrefs]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
