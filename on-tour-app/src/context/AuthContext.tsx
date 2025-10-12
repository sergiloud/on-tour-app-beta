import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ensureDemoAuth, getCurrentUserId, getUserPrefs, getUserProfile, readAllPrefs, setCurrentUserId, upsertUserPrefs, upsertUserProfile, type UserPrefs, type UserProfile } from '../lib/demoAuth';
import { ensureDemoTenants } from '../lib/tenants';
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
  const [userId, setUserIdState] = useState<string>(()=>{ try { ensureDemoAuth(); ensureDemoTenants(); return getCurrentUserId() || ''; } catch { return ''; } });
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

  const setUserId = (id: string) => {
    setCurrentUserId(id);
    setUserIdState(id);
    activityTracker.setUserId(id);
  };
  const updateProfile = (patch: Partial<UserProfile>) => { const next = { ...profile, ...patch } as UserProfile; setProfile(next); upsertUserProfile(next); };
  const updatePrefs = (patch: Partial<UserPrefs>) => { const next = upsertUserPrefs(userId, patch); setPrefs(next); };

  const value = useMemo(()=> ({ userId, profile, prefs, setUserId, updateProfile, updatePrefs }), [userId, profile, prefs]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
