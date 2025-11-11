import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { trackEvent } from '../lib/telemetry';
import { loadSettings, saveSettings, SETTINGS_KEY } from '../lib/persist';
import type { PeriodPreset } from '../features/finance/period';
import { setLang as setI18nLang } from '../lib/i18n';
import { ensureDemoAuth, getCurrentUserId } from '../lib/demoAuth';
import { upsertUserPrefs, readAllPrefs } from '../lib/demoAuth';
import { auth } from '../lib/firebase';

type Currency = 'EUR' | 'USD' | 'GBP';
type DistanceUnit = 'km' | 'mi';
export type Region = 'all' | 'AMER' | 'EMEA' | 'APAC';
export type DateRange = { from: string; to: string };
export type DashboardView = 'default' | 'finance' | 'operations' | 'promo' | `custom:${string}`;

export type AgencyTerritoryMode = 'worldwide' | 'continents' | 'countries';
export type ContinentCode = 'NA' | 'SA' | 'EU' | 'AF' | 'AS' | 'OC';
export interface AgencyConfig {
  id: string;          // stable id
  name: string;        // display name
  type: 'booking' | 'management';
  commissionPct: number; // 0-100
  territoryMode: AgencyTerritoryMode;
  continents?: ContinentCode[]; // if territoryMode = continents
  countries?: string[]; // ISO2 if territoryMode = countries
  notes?: string;
}

type Settings = {
  currency: Currency;
  unit: DistanceUnit;
  setCurrency: (c: Currency) => void;
  setUnit: (u: DistanceUnit) => void;
  fmtMoney: (n: number) => string;
  fmtDistance: (km: number) => string;
  lang: 'en' | 'es';
  setLang: (l: 'en' | 'es') => void;
  maskAmounts: boolean; // deprecated; amounts are always visible
  setMaskAmounts: (v: boolean) => void; // deprecated no-op
  dashboardView: DashboardView;
  setDashboardView: (v: DashboardView) => void;
  presentationMode: boolean;
  setPresentationMode: (v: boolean) => void;
  region: Region;
  setRegion: (r: Region) => void;
  dateRange: DateRange;
  setDateRange: (dr: DateRange) => void;
  periodPreset: PeriodPreset;
  setPeriodPreset: (p: PeriodPreset) => void;
  comparePrev: boolean;
  setComparePrev: (v: boolean) => void;
  selectedStatuses: Array<'confirmed' | 'pending' | 'offer' | 'canceled' | 'archived' | 'postponed'>;
  setSelectedStatuses: (s: Array<'confirmed' | 'pending' | 'offer' | 'canceled' | 'archived' | 'postponed'>) => void;
  bookingAgencies: AgencyConfig[];
  managementAgencies: AgencyConfig[];
  addAgency: (a: Omit<AgencyConfig, 'id'>) => { ok: boolean; reason?: string; agency?: AgencyConfig };
  updateAgency: (id: string, patch: Partial<AgencyConfig>) => void;
  removeAgency: (id: string) => void;
  // UI prefs
  kpiTickerHidden: boolean;
  setKpiTickerHidden: (v: boolean) => void;
};

const SettingsContext = createContext<Settings | null>(null);
const LS_KEY = SETTINGS_KEY;

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get current user - prefer Firebase Auth user over demo user
  const [userId, setUserId] = useState<string>(() => {
    try {
      // Try to get Firebase Auth user first
      if (auth?.currentUser) {
        console.log('🔥 [SettingsContext] Using Firebase Auth user:', auth.currentUser.uid);
        console.log('🔥 [SettingsContext] User email:', auth.currentUser.email);
        return auth.currentUser.uid;
      }
      // Fallback to demo auth
      const demoUser = getCurrentUserId();
      console.log('⚠️ [SettingsContext] Using demo user:', demoUser);
      return demoUser;
    } catch {
      console.log('❌ [SettingsContext] Fallback to default_user');
      return 'default_user';
    }
  });

  // Listen for auth state changes
  useEffect(() => {
    if (!auth) return;
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('🔥 [SettingsContext] Auth state changed - user logged in:', user.uid);
        console.log('🔥 [SettingsContext] User email:', user.email);
        // Set loading flag to prevent save before Firestore load completes
        setIsLoadingFromFirestore(true);
        setUserId(user.uid);
      } else {
        console.log('⚠️ [SettingsContext] Auth state changed - user logged out');
        // Fallback to demo user
        const demoUser = getCurrentUserId();
        setUserId(demoUser || 'default_user');
      }
    });

    return () => unsubscribe();
  }, []);

  // Load initial settings
  const legacyInitial = (() => {
    try {
      return loadSettings() as any;
    } catch {
      return {};
    }
  })();

  const userPrefs = (() => { try { return readAllPrefs(userId); } catch { return null as any; } })();

  const [currency, setCurrency] = useState<Currency>((userPrefs?.currency as Currency) || (legacyInitial.currency as any) || 'EUR');
  const [unit, setUnit] = useState<DistanceUnit>((userPrefs?.unit as DistanceUnit) || (legacyInitial.unit as any) || 'km');
  const [lang, setLangState] = useState<'en' | 'es'>((userPrefs?.lang as any) || (legacyInitial.lang as any) || 'en');
  const [maskAmounts, _setMaskAmounts] = useState<boolean>(false);
  const [presentationMode, setPresentationMode] = useState<boolean>(userPrefs?.presentationMode ?? !!legacyInitial.presentationMode);
  const [dashboardView, setDashboardView] = useState<DashboardView>((legacyInitial.dashboardView as DashboardView) || 'default');
  // Build default range for THIS YEAR (Jan 1 - Dec 31 of current year)
  const defaultRange = (() => { const now = new Date(); const y = now.getFullYear(); const from = `${y}-01-01`; const to = `${y}-12-31`; return { from, to }; })();
  const [region, setRegion] = useState<Region>((userPrefs?.defaultRegion as any) || (legacyInitial.region as any) || 'all');
  const [dateRange, setDateRange] = useState<DateRange>(legacyInitial.dateRange && legacyInitial.dateRange.from && legacyInitial.dateRange.to ? legacyInitial.dateRange : defaultRange);
  const [periodPreset, setPeriodPresetState] = useState<PeriodPreset>(((legacyInitial as any).periodPreset as PeriodPreset) || 'YTD');
  const [comparePrev, setComparePrevState] = useState<boolean>(userPrefs?.comparePrev ?? !!(legacyInitial as any).comparePrev);
  const [selectedStatuses, setSelectedStatusesState] = useState<Array<'confirmed' | 'pending' | 'offer' | 'canceled' | 'archived' | 'postponed'>>(userPrefs?.defaultStatuses || (legacyInitial as any).selectedStatuses || ['confirmed', 'pending', 'offer']);
  const [bookingAgencies, setBookingAgencies] = useState<AgencyConfig[]>(() => (legacyInitial as any).bookingAgencies || []);
  const [managementAgencies, setManagementAgencies] = useState<AgencyConfig[]>(() => (legacyInitial as any).managementAgencies || []);
  const [kpiTickerHidden, setKpiTickerHiddenState] = useState<boolean>(!!(legacyInitial as any).kpiTickerHidden);
  // Start as true to prevent save effect from running before Firestore load completes
  const [isLoadingFromFirestore, setIsLoadingFromFirestore] = useState<boolean>(true);

  // Load agencies from Firestore on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        console.log('📥 [SettingsContext] Loading agencies for userId:', userId);
        setIsLoadingFromFirestore(true);
        const { FirestoreUserService } = await import('../services/firestoreUserService');
        const settings = await FirestoreUserService.getSettings(userId);
        console.log('📥 [SettingsContext] Firestore settings received:', settings);
        
        if (isMounted && settings) {
          // Always load arrays from Firestore if they exist (even if empty)
          if (settings.bookingAgencies !== undefined) {
            console.log('📥 [SettingsContext] Loading booking agencies from Firestore:', settings.bookingAgencies);
            setBookingAgencies(settings.bookingAgencies);
          }
          if (settings.managementAgencies !== undefined) {
            console.log('📥 [SettingsContext] Loading management agencies from Firestore:', settings.managementAgencies);
            setManagementAgencies(settings.managementAgencies);
          }
        } else {
          console.log('⚠️ [SettingsContext] No settings found in Firestore for user:', userId);
        }
      } catch (e) {
        console.error('❌ [SettingsContext] Error loading agencies from Firestore:', e);
      } finally {
        if (isMounted) {
          setIsLoadingFromFirestore(false);
        }
      }
    })();
    return () => { isMounted = false; };
  }, [userId]);

  // Initial load migrated above via initial

  // Storage versioning: store a version and allow future migrations to branch cleanly
  const SETTINGS_VERSION = 1 as const;
  useEffect(() => {
    // Skip save during initial load from Firestore
    if (isLoadingFromFirestore) {
      console.log('⏭️ [SettingsContext] Skipping save - loading from Firestore');
      return;
    }

    // Persist to demo user prefs (authoritative for user-specific settings)
    try {
      upsertUserPrefs(userId, {
        lang, currency, unit,
        presentationMode, comparePrev,
        defaultRegion: region,
        defaultStatuses: selectedStatuses,
      });
    } catch { }
    // Also keep legacy settings in sync for backward-compat across the app
    saveSettings({
      currency, unit, lang, maskAmounts, region, dateRange, presentationMode, dashboardView, periodPreset,
      comparePrev, selectedStatuses,
      bookingAgencies, managementAgencies,
      kpiTickerHidden,
      // @ts-ignore
      __version: SETTINGS_VERSION
    } as any);
    
    // Sync agencies to Firestore for real users (only if Firebase Auth is available)
    (async () => {
      try {
        // Skip if using demo user
        if (!auth || !auth.currentUser || userId === 'default_user' || userId.startsWith('demo_')) {
          console.warn('⚠️ [SettingsContext] Skipping Firestore sync - no Firebase Auth user');
          console.warn('   Current userId:', userId);
          console.warn('   auth.currentUser:', auth?.currentUser?.uid);
          return;
        }

        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('🔥 [SettingsContext] SYNCING TO FIRESTORE');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('   Firebase Auth user:', auth.currentUser.uid);
        console.error('   Firebase Auth email:', auth.currentUser.email);
        console.error('   userId state:', userId);
        console.error('   Path: users/' + userId + '/profile/settings');
        console.error('   Booking agencies:', bookingAgencies.length);
        console.error('   Management agencies:', managementAgencies.length);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        const { FirestoreUserService } = await import('../services/firestoreUserService');
        await FirestoreUserService.saveSettings({
          bookingAgencies,
          managementAgencies,
          updatedAt: new Date().toISOString()
        }, userId);
        
        console.error('✅ [SettingsContext] Agencies successfully synced to Firestore');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      } catch (e) {
        console.error('❌ [SettingsContext] Error syncing agencies to Firestore:', e);
        console.error('[SettingsContext] Error details:', {
          name: (e as any)?.name,
          message: (e as any)?.message,
          code: (e as any)?.code,
          stack: (e as any)?.stack
        });
      }
    })();
    
    try { window.dispatchEvent(new CustomEvent('prefs:updated', { detail: { id: userId } } as any)); } catch { }
  }, [isLoadingFromFirestore, userId, currency, unit, lang, maskAmounts, region, dateRange, presentationMode, dashboardView, periodPreset, comparePrev, selectedStatuses, bookingAgencies, managementAgencies, kpiTickerHidden]);

  // Toggle presentation class on body for global style adjustments
  useEffect(() => {
    try {
      document.body.classList.toggle('presentation', presentationMode);
    } catch { }
  }, [presentationMode]);

  // Listen for storage changes to reload agencies
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        // console.log('[SettingsContext] Storage changed, reloading agencies...');
        const settings = loadSettings() as any;
        if (settings.bookingAgencies) {
          // console.log('[SettingsContext] Found booking agencies:', settings.bookingAgencies);
          setBookingAgencies(settings.bookingAgencies);
        }
        if (settings.managementAgencies) {
          // console.log('[SettingsContext] Found management agencies:', settings.managementAgencies);
          setManagementAgencies(settings.managementAgencies);
        }
      } catch (e) {
        console.error('[SettingsContext] Error reloading agencies:', e);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const fmtMoney = useCallback((n: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(n), [currency]);
  const fmtDistance = useCallback((km: number) => unit === 'km' ? `${Math.round(km).toLocaleString()} km` : `${Math.round(km * 0.621371).toLocaleString()} mi`, [unit]);

  const handleSetCurrency = useCallback((c: Currency) => {
    setCurrency(c);
    try { trackEvent('settings.currency', { currency: c }); } catch { }
  }, []);

  const handleSetUnit = useCallback((u: DistanceUnit) => {
    setUnit(u);
    try { trackEvent('settings.unit', { unit: u }); } catch { }
  }, []);

  const handleSetLang = useCallback((l: 'en' | 'es') => {
    setLangState(l);
    try { setI18nLang(l as any); } catch { }
    try { trackEvent('settings.lang', { lang: l }); } catch { }
  }, []);

  const handleSetMaskAmounts = useCallback((_v: boolean) => {
    /* no-op; masking disabled globally */
  }, []);

  const handleSetDashboardView = useCallback((v: DashboardView) => {
    setDashboardView(v);
    try { trackEvent('settings.dashboardView', { view: v }); trackEvent('dashboard.view', { view: v }); } catch { }
  }, []);

  const handleSetPresentationMode = useCallback((v: boolean) => {
    setPresentationMode(v);
    try { trackEvent('settings.presentation', { presentation: v }); } catch { }
  }, []);

  const handleSetRegion = useCallback((r: Region) => {
    setRegion(r);
    try { trackEvent('settings.region', { region: r }); } catch { }
  }, []);

  const handleSetDateRange = useCallback((dr: DateRange) => {
    setDateRange(dr);
    try { trackEvent('settings.daterange', dr as any); } catch { }
  }, []);

  const handleSetPeriodPreset = useCallback((p: PeriodPreset) => {
    setPeriodPresetState(p);
    try { trackEvent('settings.period.preset', { preset: p }); } catch { }
  }, []);

  const handleSetComparePrev = useCallback((v: boolean) => {
    setComparePrevState(v);
    try { trackEvent('finance.compare.toggle', { compare: v }); } catch { }
  }, []);

  const handleSetSelectedStatuses = useCallback((s: Array<'confirmed' | 'pending' | 'offer' | 'canceled' | 'archived' | 'postponed'>) => {
    setSelectedStatusesState(s);
    try { trackEvent('settings.status.filter', { statuses: s.join(',') }); } catch { }
  }, []);

  const handleSetKpiTickerHidden = useCallback((v: boolean) => {
    setKpiTickerHiddenState(v);
    try { trackEvent('settings.kpiTicker', { hidden: v }); } catch { }
  }, []);

  const handleAddAgency = useCallback((a: Omit<AgencyConfig, 'id'>) => {
    console.log('[SettingsContext] handleAddAgency called with:', a);
    const max = 3;
    if (a.type === 'booking') {
      let added: AgencyConfig | undefined;
      setBookingAgencies(prev => {
        console.log('[SettingsContext] Current booking agencies:', prev);
        if (prev.length >= max) {
          console.warn('[SettingsContext] Booking agencies limit reached:', max);
          return prev;
        }
        const pct = Math.max(0, Math.min(100, a.commissionPct));
        const id = `booking-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        // Only include defined fields to avoid Firestore rejecting undefined values
        added = {
          id,
          name: a.name,
          type: a.type,
          commissionPct: pct,
          territoryMode: a.territoryMode,
          ...(a.continents !== undefined && { continents: a.continents }),
          ...(a.countries !== undefined && { countries: a.countries }),
          ...(a.notes !== undefined && { notes: a.notes })
        } as AgencyConfig;
        console.log('[SettingsContext] Adding booking agency:', added);
        return [...prev, added];
      });
      if (!added) { 
        console.error('[SettingsContext] Failed to add booking agency - limit reached');
        try { trackEvent('settings.agency.limit', { type: a.type }); } catch { }
        return { ok: false, reason: 'limit' } as const;
      }
      console.log('[SettingsContext] ✅ Booking agency added successfully:', added);
      try { trackEvent('settings.agency.add', { type: a.type, commission: added.commissionPct, territoryMode: added.territoryMode }); } catch { }
      return { ok: true, agency: added } as const;
    } else {
      let added: AgencyConfig | undefined;
      setManagementAgencies(prev => {
        console.log('[SettingsContext] Current management agencies:', prev);
        if (prev.length >= max) {
          console.warn('[SettingsContext] Management agencies limit reached:', max);
          return prev;
        }
        const pct = Math.max(0, Math.min(100, a.commissionPct));
        const id = `management-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        // Only include defined fields to avoid Firestore rejecting undefined values
        added = {
          id,
          name: a.name,
          type: a.type,
          commissionPct: pct,
          territoryMode: a.territoryMode,
          ...(a.continents !== undefined && { continents: a.continents }),
          ...(a.countries !== undefined && { countries: a.countries }),
          ...(a.notes !== undefined && { notes: a.notes })
        } as AgencyConfig;
        console.log('[SettingsContext] Adding management agency:', added);
        return [...prev, added];
      });
      if (!added) {
        console.error('[SettingsContext] Failed to add management agency - limit reached');
        try { trackEvent('settings.agency.limit', { type: a.type }); } catch { }
        return { ok: false, reason: 'limit' } as const;
      }
      console.log('[SettingsContext] ✅ Management agency added successfully:', added);
      try { trackEvent('settings.agency.add', { type: a.type, commission: added.commissionPct, territoryMode: added.territoryMode }); } catch { }
      return { ok: true, agency: added } as const;
    }
  }, []);

  const handleUpdateAgency = useCallback((id: string, patch: Partial<AgencyConfig>) => {
    console.log('[SettingsContext] handleUpdateAgency called:', id, patch);
    const apply = (arr: AgencyConfig[]) => arr.map(a => a.id === id ? { ...a, ...patch, commissionPct: patch.commissionPct != null ? Math.max(0, Math.min(100, patch.commissionPct)) : a.commissionPct } : a);
    setBookingAgencies(a => apply(a));
    setManagementAgencies(a => apply(a));
    console.log('[SettingsContext] ✅ Agency updated');
    try { trackEvent('settings.agency.update', { id, ...patch }); } catch { }
  }, []);

  const handleRemoveAgency = useCallback((id: string) => {
    console.log('[SettingsContext] handleRemoveAgency called:', id);
    setBookingAgencies(a => a.filter(x => x.id !== id));
    setManagementAgencies(a => a.filter(x => x.id !== id));
    console.log('[SettingsContext] ✅ Agency removed');
    try { trackEvent('settings.agency.remove', { id }); } catch { }
  }, []);

  const value = useMemo(() => ({
    currency, unit,
    setCurrency: handleSetCurrency,
    setUnit: handleSetUnit,
    fmtMoney, fmtDistance,
    lang,
    setLang: handleSetLang,
    maskAmounts,
    setMaskAmounts: handleSetMaskAmounts,
    dashboardView,
    setDashboardView: handleSetDashboardView,
    presentationMode,
    setPresentationMode: handleSetPresentationMode,
    region,
    setRegion: handleSetRegion,
    dateRange,
    setDateRange: handleSetDateRange,
    periodPreset,
    setPeriodPreset: handleSetPeriodPreset,
    comparePrev,
    setComparePrev: handleSetComparePrev,
    selectedStatuses,
    setSelectedStatuses: handleSetSelectedStatuses,
    bookingAgencies,
    managementAgencies,
    kpiTickerHidden,
    setKpiTickerHidden: handleSetKpiTickerHidden,
    addAgency: handleAddAgency,
    updateAgency: handleUpdateAgency,
    removeAgency: handleRemoveAgency
  }), [
    currency, unit, handleSetCurrency, handleSetUnit, fmtMoney, fmtDistance,
    lang, handleSetLang, maskAmounts, handleSetMaskAmounts,
    dashboardView, handleSetDashboardView, presentationMode, handleSetPresentationMode,
    region, handleSetRegion, dateRange, handleSetDateRange,
    periodPreset, handleSetPeriodPreset, comparePrev, handleSetComparePrev,
    selectedStatuses, handleSetSelectedStatuses, bookingAgencies, managementAgencies,
    kpiTickerHidden, handleSetKpiTickerHidden, handleAddAgency, handleUpdateAgency, handleRemoveAgency
  ]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
