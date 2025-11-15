import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { getCurrentUserId, getUserPrefs, getUserProfile, readAllPrefs, setCurrentUserId, upsertUserPrefs, upsertUserProfile, type UserPrefs, type UserProfile, PROPHECY_USER } from '../lib/demoAuth';
import { getCurrentOrgId } from '../lib/tenants';
// DISABLED FOR PRODUCTION BETA - all data comes from Firestore now
// import { ensureDemoAuth, ensureDemoTenants } from '../lib/demoAuth';
import { activityTracker } from '../lib/activityTracker';
import { HybridShowService } from '../services/hybridShowService';
import { HybridContactService } from '../services/hybridContactService';
import { HybridVenueService } from '../services/hybridVenueService';
import { HybridContractService } from '../services/hybridContractService';
import { FirestoreProfileService } from '../services/firestoreProfileService';
import { logger } from '../lib/logger';

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
        logger.warn('Could not initialize profile service', {
          component: 'AuthContext',
          userId: id,
          error: e instanceof Error ? e.message : String(e)
        });
      }

      // Initialize ALL hybrid services for real users
      // Wait for orgId to be available before initializing
      const initializeServicesWithOrg = () => {
        const orgId = getCurrentOrgId();
        if (!orgId) {
          logger.info('Waiting for organization to be selected before initializing services', { userId: id });
          return;
        }

        try {
          HybridShowService.initialize(id, orgId);
        } catch (e) {
          logger.warn('Could not initialize hybrid show service', {
            component: 'AuthContext',
            userId: id,
            orgId,
            error: e instanceof Error ? e.message : String(e)
          });
        }
        
        try {
          HybridContactService.initialize(id, orgId);
        } catch (e) {
          logger.warn('Could not initialize hybrid contact service', {
            component: 'AuthContext',
            userId: id,
            orgId,
            error: e instanceof Error ? e.message : String(e)
          });
        }

        try {
          HybridVenueService.initialize(id, orgId);
        } catch (e) {
          logger.warn('Could not initialize hybrid venue service', {
            component: 'AuthContext',
            userId: id,
            orgId,
            error: e instanceof Error ? e.message : String(e)
          });
        }

        try {
          HybridContractService.initialize(id, orgId);
        } catch (e) {
          logger.warn('Could not initialize hybrid contract service', {
            component: 'AuthContext',
            userId: id,
            orgId,
            error: e instanceof Error ? e.message : String(e)
          });
        }
      };

      // Try to initialize immediately if orgId exists
      initializeServicesWithOrg();
      
      // Listen for org changes and initialize services
      const handleOrgChange = () => {
        initializeServicesWithOrg();
      };
      window.addEventListener('tenant:changed' as any, handleOrgChange);

      // Preload critical dashboard routes after authentication to eliminate lazy-load delays
      // This dramatically improves perceived performance for tab navigation
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          // Immediate preload - most visited pages
          import('../pages/Dashboard').catch(() => {});
          import('../pages/dashboard/Shows').catch(() => {});
          
          // Delayed preload - secondary pages (after 1s)
          setTimeout(() => {
            import('../pages/dashboard/Calendar').catch(() => {});
            import('../pages/dashboard/Contacts').catch(() => {});
            import('../pages/dashboard/FinanceV2').catch(() => {});
          }, 1000);
        }, { timeout: 2000 });
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
          import('../pages/Dashboard').catch(() => {});
          import('../pages/dashboard/Shows').catch(() => {});
          import('../pages/dashboard/Calendar').catch(() => {});
          import('../pages/dashboard/Contacts').catch(() => {});
          import('../pages/dashboard/FinanceV2').catch(() => {});
        }, 500);
      }

      // Initialize Firestore services for finance, travel, org, user
      // NOTE: These currently use Firestore directly. Hybrid services can be created later if needed.
      try {
        import('../services/firestoreUserService').then(({ FirestoreUserService }) => {
          FirestoreUserService.migrateFromLocalStorage(id);
        });
      } catch (e) {
        logger.warn('Could not initialize user service', {
          component: 'AuthContext',
          userId: id,
          error: e instanceof Error ? e.message : String(e)
        });
      }

      try {
        const orgId = getCurrentOrgId();
        if (orgId) {
          import('../services/firestoreFinanceService').then(({ FirestoreFinanceService }) => {
            FirestoreFinanceService.migrateFromLocalStorage(id, orgId);
          });
        }
      } catch (e) {
        logger.warn('Could not initialize finance service', {
          component: 'AuthContext',
          userId: id,
          error: e instanceof Error ? e.message : String(e)
        });
      }

      try {
        const orgId = getCurrentOrgId();
        if (orgId) {
          import('../services/firestoreTravelService').then(({ FirestoreTravelService }) => {
            FirestoreTravelService.migrateFromLocalStorage(id, orgId);
          });
        }
      } catch (e) {
        logger.warn('Could not initialize travel service', {
          component: 'AuthContext',
          userId: id,
          error: e instanceof Error ? e.message : String(e)
        });
      }

      try {
        import('../services/firestoreOrgService').then(({ FirestoreOrgService }) => {
          FirestoreOrgService.migrateFromLocalStorage(id);
        });
      } catch (e) {
        logger.warn('Could not initialize org service', {
          component: 'AuthContext',
          userId: id,
          error: e instanceof Error ? e.message : String(e)
        });
      }
    }
    
    // Load Prophecy data if switching to Prophecy user
    if (id === PROPHECY_USER) {
      try {
        const { loadProphecyData } = require('../lib/prophecyDataset');
        loadProphecyData();
      } catch (e) {
        logger.warn('Could not load frontend Prophecy data', {
          component: 'AuthContext',
          userId: id,
          error: e instanceof Error ? e.message : String(e)
        });
      }

      // DISABLED FOR PRODUCTION BETA
      // Initialize backend data asynchronously
      /* try {
        import('../services/prophecyBackendService').then(({ ProphecyBackendService }) => {
          ProphecyBackendService.initializeProphecyUser('org_artist_prophecy');
        });
      } catch (e) {
        logger.warn('Could not initialize backend Prophecy data', {
          component: 'AuthContext',
          userId: id,
          error: e instanceof Error ? e.message : String(e)
        });
      } */
    }
  }, []);

  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setProfile(prev => {
      const next = { ...prev, ...patch } as UserProfile;
      // ✅ Update localStorage first (optimistic)
      upsertUserProfile(next);
      
      // ✅ Sync to Firebase in background
      if (userId) {
        FirestoreProfileService.saveProfile(userId, next).catch((err: Error) => {
          logger.warn('Failed to sync profile to Firebase', { userId, error: err });
        });
      }
      
      return next;
    });
  }, [userId]);

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
