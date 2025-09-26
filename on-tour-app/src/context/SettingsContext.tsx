import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { trackEvent } from '../lib/telemetry';
import { loadSettings, saveSettings, SETTINGS_KEY } from '../lib/persist';
import type { PeriodPreset } from '../features/finance/period';

type Currency = 'EUR'|'USD'|'GBP';
type DistanceUnit = 'km'|'mi';
export type Region = 'all'|'AMER'|'EMEA'|'APAC';
export type DateRange = { from: string; to: string };
export type DashboardView = 'default'|'finance'|'operations'|'promo'|`custom:${string}`;

export type AgencyTerritoryMode = 'worldwide'|'continents'|'countries';
export type ContinentCode = 'NA'|'SA'|'EU'|'AF'|'AS'|'OC';
export interface AgencyConfig {
  id: string;          // stable id
  name: string;        // display name
  type: 'booking'|'management';
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
  lang: 'en'|'es';
  setLang: (l: 'en'|'es') => void;
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
  selectedStatuses: Array<'confirmed'|'pending'|'offer'|'canceled'|'archived'|'postponed'>;
  setSelectedStatuses: (s: Array<'confirmed'|'pending'|'offer'|'canceled'|'archived'|'postponed'>) => void;
  bookingAgencies: AgencyConfig[];
  managementAgencies: AgencyConfig[];
  addAgency: (a: Omit<AgencyConfig,'id'>) => { ok: boolean; reason?: string; agency?: AgencyConfig };
  updateAgency: (id: string, patch: Partial<AgencyConfig>) => void;
  removeAgency: (id: string) => void;
};

const SettingsContext = createContext<Settings | null>(null);
const LS_KEY = SETTINGS_KEY;

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>('EUR');
  const [unit, setUnit] = useState<DistanceUnit>('km');
  const initial = (()=>{ try { return loadSettings(); } catch { return {}; } })();
  const [lang, setLangState] = useState<'en'|'es'>(initial.lang || 'en');
  const [maskAmounts, _setMaskAmounts] = useState<boolean>(false);
  const [presentationMode, setPresentationMode] = useState<boolean>(!!initial.presentationMode);
  const [dashboardView, setDashboardView] = useState<DashboardView>((initial.dashboardView as DashboardView) || 'default');
  // Build default range using local date parts to avoid UTC date shifts
  const defaultRange = (()=>{ const now=new Date(); const y=now.getFullYear(); const m=now.getMonth(); const pad=(n:number)=>String(n).padStart(2,'0'); const from=`${y}-${pad(m+1)}-01`; const to=`${y}-${pad(m+1)}-${pad(new Date(y, m+1, 0).getDate())}`; return { from, to }; })();
  const [region, setRegion] = useState<Region>((initial.region as any) || 'all');
  const [dateRange, setDateRange] = useState<DateRange>(initial.dateRange && initial.dateRange.from && initial.dateRange.to ? initial.dateRange : defaultRange);
  const [periodPreset, setPeriodPresetState] = useState<PeriodPreset>(((initial as any).periodPreset as PeriodPreset) || 'MTD');
  const [comparePrev, setComparePrevState] = useState<boolean>(!!(initial as any).comparePrev);
  const [selectedStatuses, setSelectedStatusesState] = useState<Array<'confirmed'|'pending'|'offer'|'canceled'|'archived'|'postponed'>>((initial as any).selectedStatuses || ['confirmed','pending','offer']);
  const [bookingAgencies, setBookingAgencies] = useState<AgencyConfig[]>(() => (initial as any).bookingAgencies || []);
  const [managementAgencies, setManagementAgencies] = useState<AgencyConfig[]>(() => (initial as any).managementAgencies || []);

  // Initial load migrated above via initial

  // Storage versioning: store a version and allow future migrations to branch cleanly
  const SETTINGS_VERSION = 1 as const;
  useEffect(() => {
    saveSettings({
  currency, unit, lang, maskAmounts, region, dateRange, presentationMode, dashboardView, periodPreset,
  comparePrev, selectedStatuses,
  bookingAgencies, managementAgencies,
      // @ts-ignore: persist version alongside settings for future migrations
      __version: SETTINGS_VERSION
    } as any);
  }, [currency, unit, lang, maskAmounts, region, dateRange, presentationMode, dashboardView, periodPreset, comparePrev, selectedStatuses, bookingAgencies, managementAgencies]);

  // Toggle presentation class on body for global style adjustments
  useEffect(()=>{
    try {
      document.body.classList.toggle('presentation', presentationMode);
    } catch {}
  }, [presentationMode]);

  const fmtMoney = useMemo(() => (n: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(n), [currency]);
  const fmtDistance = useMemo(() => (km: number) => unit === 'km' ? `${Math.round(km).toLocaleString()} km` : `${Math.round(km * 0.621371).toLocaleString()} mi`, [unit]);

  const value = useMemo(() => ({
    currency, unit,
    setCurrency: (c: Currency) => { setCurrency(c); try { trackEvent('settings.currency', { currency: c }); } catch {} },
    setUnit: (u: DistanceUnit) => { setUnit(u); try { trackEvent('settings.unit', { unit: u }); } catch {} },
    fmtMoney, fmtDistance,
    lang,
    setLang: (l:'en'|'es')=>{ setLangState(l); try { trackEvent('settings.lang', { lang: l }); } catch {} },
  maskAmounts,
  setMaskAmounts: (_v: boolean) => { /* no-op; masking disabled globally */ },
  dashboardView,
  setDashboardView: (v: DashboardView) => { setDashboardView(v); try { trackEvent('settings.dashboardView', { view: v }); trackEvent('dashboard.view', { view: v }); } catch {} },
    presentationMode,
    setPresentationMode: (v: boolean) => { setPresentationMode(v); try { trackEvent('settings.presentation', { presentation: v }); } catch {} },
    region,
    setRegion: (r: Region) => { setRegion(r); try { trackEvent('settings.region', { region: r }); } catch {} },
    dateRange,
    setDateRange: (dr: DateRange) => { setDateRange(dr); try { trackEvent('settings.daterange', dr as any); } catch {} },
    periodPreset,
    setPeriodPreset: (p: PeriodPreset) => { setPeriodPresetState(p); try { trackEvent('settings.period.preset', { preset: p }); } catch {} },
  comparePrev,
  setComparePrev: (v: boolean) => { setComparePrevState(v); try { trackEvent('finance.compare.toggle', { compare: v }); } catch {} },
  selectedStatuses,
  setSelectedStatuses: (s: Array<'confirmed'|'pending'|'offer'|'canceled'|'archived'|'postponed'>) => { setSelectedStatusesState(s); try { trackEvent('settings.status.filter', { statuses: s.join(',') }); } catch {} },
    bookingAgencies,
    managementAgencies,
    addAgency: (a: Omit<AgencyConfig,'id'>) => {
      const max = 3;
      if (a.type === 'booking') {
        let added: AgencyConfig | undefined;
        setBookingAgencies(prev => {
          if (prev.length >= max) return prev; // limit reached
          const pct = Math.max(0, Math.min(100, a.commissionPct));
            const id = `booking-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
          added = { ...a, commissionPct: pct, id };
          return [...prev, added];
        });
        if (!added) return { ok:false, reason:'limit' } as const;
        try { trackEvent('settings.agency.add', { type: a.type, commission: added.commissionPct, territoryMode: added.territoryMode }); } catch {}
        return { ok:true, agency: added } as const;
      } else {
        let added: AgencyConfig | undefined;
        setManagementAgencies(prev => {
          if (prev.length >= max) return prev;
          const pct = Math.max(0, Math.min(100, a.commissionPct));
          const id = `management-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
          added = { ...a, commissionPct: pct, id };
          return [...prev, added];
        });
        if (!added) return { ok:false, reason:'limit' } as const;
        try { trackEvent('settings.agency.add', { type: a.type, commission: added.commissionPct, territoryMode: added.territoryMode }); } catch {}
        return { ok:true, agency: added } as const;
      }
    },
    updateAgency: (id: string, patch: Partial<AgencyConfig>) => {
      const apply = (arr: AgencyConfig[]) => arr.map(a => a.id===id ? { ...a, ...patch, commissionPct: patch.commissionPct!=null? Math.max(0, Math.min(100, patch.commissionPct)) : a.commissionPct } : a);
      setBookingAgencies(a=> apply(a));
      setManagementAgencies(a=> apply(a));
      try { trackEvent('settings.agency.update', { id, ...patch }); } catch {}
    },
    removeAgency: (id: string) => {
      setBookingAgencies(a=> a.filter(x=> x.id!==id));
      setManagementAgencies(a=> a.filter(x=> x.id!==id));
      try { trackEvent('settings.agency.remove', { id }); } catch {}
    }
  }), [currency, unit, fmtMoney, fmtDistance, lang, maskAmounts, dashboardView, presentationMode, region, dateRange, periodPreset, bookingAgencies, managementAgencies]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
