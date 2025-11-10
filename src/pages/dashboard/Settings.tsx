import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { useHighContrast } from '../../context/HighContrastContext';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import { getUserMemberships, setCurrentOrgId, isAgencyCurrent } from '../../lib/tenants';
import { showStore } from '../../shared/showStore';
import { clearAndReseedAuth } from '../../lib/demoAuth';
import { ensureDemoTenants } from '../../lib/tenants';
import { t, LANGUAGES } from '../../lib/i18n';
import OrgTeams from '../org/OrgTeams';
import OrgMembers from '../org/OrgMembers';
import OrgBranding from '../org/OrgBranding';
import OrgIntegrations from '../org/OrgIntegrations';
import OrgBilling from '../org/OrgBilling';
import OrgClients from '../org/OrgClients';
import OrgLinks from '../org/OrgLinks';
import OrgDocuments from '../org/OrgDocuments';
import OrgReports from '../org/OrgReports';

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  tabIndex?: number;
  children: React.ReactNode
}> = ({ active, onClick, onKeyDown, tabIndex = 0, children }) => (
  <button
    onClick={onClick}
    onKeyDown={onKeyDown}
    tabIndex={tabIndex}
    role="tab"
    aria-selected={active}
    className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:ring-offset-2 focus:ring-offset-ink-900 transition-all ${
      active
        ? 'border-accent-500 text-accent-500 bg-accent-500/5'
        : 'border-transparent text-slate-500 dark:text-white/70 hover:text-white hover:bg-white/5'
    }`}
  >
    {children}
  </button>
);

const SubTabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  tabIndex?: number;
  children: React.ReactNode
}> = ({ active, onClick, onKeyDown, tabIndex = 0, children }) => (
  <button
    onClick={onClick}
    onKeyDown={onKeyDown}
    tabIndex={tabIndex}
    role="tab"
    aria-selected={active}
    className={`px-3 py-2 text-xs font-medium rounded border focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:ring-offset-2 focus:ring-offset-ink-900 transition-all ${
      active
        ? 'bg-accent-500 text-black border-accent-500 shadow-sm'
        : 'border-slate-300 dark:border-white/20 text-slate-500 dark:text-white/70 hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 hover:border-white/30'
    }`}
  >
    {children}
  </button>
);

const Settings: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'organization' | 'connections'>('profile');
  const [orgSubTab, setOrgSubTab] = useState<'members' | 'teams' | 'branding' | 'documents' | 'integrations'>('members');
  const [connectionsSubTab, setConnectionsSubTab] = useState<'clients' | 'links' | 'billing' | 'reports'>('clients');

  const isAgency = isAgencyCurrent();

  // Initialize tabs from URL parameters
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const subtabParam = searchParams.get('subtab');

    if (tabParam && ['profile', 'preferences', 'organization', 'connections'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }

    if (subtabParam) {
      if (tabParam === 'organization' && ['members', 'teams', 'branding', 'documents', 'integrations'].includes(subtabParam)) {
        setOrgSubTab(subtabParam as any);
      } else if (tabParam === 'connections' && ['clients', 'links', 'billing', 'reports'].includes(subtabParam)) {
        setConnectionsSubTab(subtabParam as any);
      }
    }

    // Clean up URL parameters after setting state
    if (tabParam || subtabParam) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('tab');
      newSearchParams.delete('subtab');
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Define main tabs configuration
  const mainTabs = [
    { id: 'profile' as const, label: t('settings.profile') || 'Profile' },
    { id: 'preferences' as const, label: t('settings.preferences') || 'Preferences' },
    { id: 'organization' as const, label: t('settings.organization') || 'Organization' },
    ...(isAgency ? [{ id: 'connections' as const, label: t('settings.connections') || 'Connections' }] : [])
  ];

  // Handle keyboard navigation for main tabs
  const handleMainTabKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : mainTabs.length - 1;
      const prevTab = mainTabs[prevIndex];
      if (prevTab) setActiveTab(prevTab.id);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = currentIndex < mainTabs.length - 1 ? currentIndex + 1 : 0;
      const nextTab = mainTabs[nextIndex];
      if (nextTab) setActiveTab(nextTab.id);
    }
  };

  return (
    <div className="min-h-screen bg-ink-900">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Page Header */}
        <div className="glass rounded-xl border border-slate-200 dark:border-white/10 backdrop-blur-sm mb-6 overflow-hidden hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300">
          <div className="bg-gradient-to-r from-transparent via-white/5 to-transparent px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="w-1 h-10 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
              <h1 className="text-2xl font-semibold tracking-tight">
                {t('nav.settings') || 'Settings'}
              </h1>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="space-y-6">
          <div className="flex border-b border-white/10" role="tablist" aria-label="Settings tabs">
            {mainTabs.map((tab, index) => (
              <TabButton
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => handleMainTabKeyDown(e, index)}
                tabIndex={activeTab === tab.id ? 0 : -1}
              >
                {tab.label}
              </TabButton>
            ))}
          </div>

          {/* Tab Content */}
          <div role="tabpanel" aria-labelledby={activeTab}>
            {activeTab === 'profile' && <ProfileTab />}
            {activeTab === 'preferences' && <PreferencesTab />}
            {activeTab === 'organization' && (
              <OrganizationTab
                activeSubTab={orgSubTab}
                onSubTabChange={setOrgSubTab}
              />
            )}
            {isAgency && activeTab === 'connections' && (
              <ConnectionsTab
                activeSubTab={connectionsSubTab}
                onSubTabChange={setConnectionsSubTab}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileTab: React.FC = () => {
  const { profile, prefs, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: profile.name, email: profile.email, avatarUrl: profile.avatarUrl || '', bio: profile.bio || '' });
  const [notifyEmail, setNotifyEmail] = useState<boolean>(profile.notifyEmail ?? true);
  const [notifySlack, setNotifySlack] = useState<boolean>(profile.notifySlack ?? false);
  const [saved, setSaved] = useState<string>('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const memberships = getUserMemberships(profile.id);

  React.useEffect(() => {
    setForm({ name: profile.name, email: profile.email, avatarUrl: profile.avatarUrl || '', bio: profile.bio || '' });
    setNotifyEmail(profile.notifyEmail ?? true);
    setNotifySlack(profile.notifySlack ?? false);
  }, [profile]);

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { name?: string; email?: string } = {};
    if (!form.name.trim()) errs.name = t('profile.error.name') || 'Name is required';
    if (!form.email.trim()) errs.email = t('profile.error.email') || 'Email is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    updateProfile({ ...profile, ...form, notifyEmail, notifySlack });
    setSaved(t('profile.saved') || 'Saved');
    setTimeout(() => setSaved(''), 2000);
  };

  return (
    <form onSubmit={onSave} className="space-y-4">
      <section className="glass rounded p-4 border border-slate-200 dark:border-white/10 space-y-3">
        <h2 className="text-sm font-semibold">{t('profile.personal') || 'Personal'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="opacity-80">{t('common.name') || 'Name'}</span>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="px-3 py-2 rounded bg-slate-100 dark:bg-white/5 border border-white/12 hover:border-slate-300 dark:border-white/20 focus-ring" aria-invalid={!!errors.name} />
            {errors.name && <div className="text-xs text-red-300 mt-1" aria-live="polite">{errors.name}</div>}
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="opacity-80">{t('common.email') || 'Email'}</span>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="px-3 py-2 rounded bg-slate-100 dark:bg-white/5 border border-white/12 hover:border-slate-300 dark:border-white/20 focus-ring" aria-invalid={!!errors.email} />
            {errors.email && <div className="text-xs text-red-300 mt-1" aria-live="polite">{errors.email}</div>}
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="opacity-80">{t('profile.avatarUrl') || 'Avatar URL'}</span>
            <input value={form.avatarUrl} onChange={e => setForm(f => ({ ...f, avatarUrl: e.target.value }))} className="px-3 py-2 rounded bg-slate-100 dark:bg-white/5 border border-white/12 hover:border-slate-300 dark:border-white/20 focus-ring" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="opacity-80">{t('profile.bio') || 'Bio'}</span>
            <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} className="px-3 py-2 rounded bg-slate-100 dark:bg-white/5 border border-white/12 hover:border-slate-300 dark:border-white/20 focus-ring" rows={3} />
          </label>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="px-3 py-2 rounded bg-accent-500 text-black hover:brightness-95">{t('profile.save') || 'Save'}</button>
        </div>
      </section>
      <section className="glass rounded p-4 border border-slate-200 dark:border-white/10 space-y-3">
        <h2 className="text-sm font-semibold">{t('profile.memberships') || 'Memberships'}</h2>
        <ul className="text-sm grid grid-cols-1 gap-2">
          {memberships.map(m => (
            <li key={m.org.id} className="flex items-center justify-between gap-2 p-2 rounded bg-slate-100 dark:bg-white/5 border border-white/10">
              <div>
                <div className="font-medium">{m.org.name}</div>
                <div className="text-xs opacity-70">{m.role}</div>
              </div>
              <button type="button" className="px-2 py-1 text-xs rounded border border-slate-300 dark:border-white/20 hover:bg-slate-200 dark:bg-white/10"
                onClick={() => { updateProfile({ defaultOrgId: m.org.id }); setSaved(t('profile.saved') || 'Saved'); setTimeout(() => setSaved(''), 1500); }}>
                {t('profile.setDefault') || 'Set default'}
              </button>
            </li>
          ))}
        </ul>
        {profile.defaultOrgId && (
          <p className="text-xs opacity-70 mt-2">{t('profile.defaultOrg') || 'Default organization'}: <span className="opacity-100 font-medium">{memberships.find(m => m.org.id === profile.defaultOrgId)?.org.name || profile.defaultOrgId}</span></p>
        )}
        <div className="flex gap-2 mt-2">
          <button type="button" className="px-2 py-1 text-xs rounded bg-accent-500 text-black hover:brightness-95" onClick={() => profile.defaultOrgId && setCurrentOrgId(profile.defaultOrgId!)}>
            {t('nav.changeOrg') || 'Change organization'}
          </button>
        </div>
      </section>
      <section className="glass rounded p-4 border border-slate-200 dark:border-white/10 space-y-3">
        <h2 className="text-sm font-semibold">{t('profile.notifications') || 'Notifications'}</h2>
        <div className="flex flex-col gap-2">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={notifyEmail} onChange={e => setNotifyEmail(e.target.checked)} />
            <span>{t('profile.notify.email') || 'Email updates'}</span>
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={notifySlack} onChange={e => setNotifySlack(e.target.checked)} />
            <span>{t('profile.notify.slack') || 'Slack notifications'}</span>
          </label>
          <p className="text-xs opacity-70">{t('profile.notify.hint') || '(Demo) We\'ll use these to tailor messages.'}</p>
        </div>
      </section>
      <section className="glass rounded p-4 border border-slate-200 dark:border-white/10 space-y-3">
        <h2 className="text-sm font-semibold">{t('profile.dataPrivacy') || 'Data & privacy'}</h2>
        <div className="flex flex-wrap gap-2 text-sm">
          <button type="button" className="px-3 py-2 rounded border border-slate-300 dark:border-white/20 hover:bg-slate-200 dark:bg-white/10" onClick={() => {
            try {
              const data = {
                profile,
                prefs,
                shows: showStore.getAll(),
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = 'on-tour-demo-data.json'; a.click(); URL.revokeObjectURL(url);
              setSaved(t('profile.export.ready') || 'Export ready');
            } catch { }
          }}>{t('profile.exportData') || 'Export my demo data'}</button>
          <button type="button" className="px-3 py-2 rounded border border-red-400 text-red-200 hover:bg-red-500/10" onClick={() => {
            try {
              // Clear app demo stores: shows and tenants + reseed
              localStorage.removeItem('shows-store-v3');
              clearAndReseedAuth();
              // Clear tenants and reseed
              localStorage.removeItem('demo:orgs');
              localStorage.removeItem('demo:users');
              localStorage.removeItem('demo:memberships');
              localStorage.removeItem('demo:teams');
              localStorage.removeItem('demo:links');
              localStorage.removeItem('demo:currentOrg');
              ensureDemoTenants();
              // reload to pick up fresh state cleanly
              location.reload();
            } catch { }
          }}>{t('profile.clearData') || 'Clear and reseed demo data'}</button>
        </div>
      </section>
      {saved && <div className="text-sm text-green-300" aria-live="polite">{saved}</div>}
    </form>
  );
};

const PreferencesTab: React.FC = () => {
  const { lang, setLang, currency, setCurrency, unit, setUnit, presentationMode, setPresentationMode, comparePrev, setComparePrev, region, setRegion } = useSettings();
  const { highContrast, toggleHC } = useHighContrast();
  const { theme, mode, setMode } = useTheme();

  return (
    <div className="space-y-4">
      <section className="glass rounded p-4 border border-slate-200 dark:border-white/10 space-y-3">
        <h2 className="text-sm font-semibold">{t('prefs.appearance') || 'Appearance'}</h2>
        <div className="space-y-2">
          <label className="flex items-center justify-between gap-3 text-sm">
            <span className="opacity-80">{t('prefs.language') || 'Language'}</span>
            <select value={lang} onChange={e => setLang(e.target.value as any)} className="bg-slate-100 dark:bg-white/5 border border-white/12 rounded px-2 py-1">
              {LANGUAGES.map(language => (
                <option key={language.code} value={language.code}>
                  {language.flag} {language.nativeName}
                </option>
              ))}
            </select>
          </label>
          <p className="text-[11px] opacity-70">{t('prefs.help.language') || 'Affects labels and date/number formatting.'}</p>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span className="opacity-80">{t('prefs.theme') || 'Theme'}</span>
            <select value={mode} onChange={e => setMode(e.target.value as any)} className="bg-slate-100 dark:bg-white/5 border border-white/12 rounded px-2 py-1">
              <option value="auto">Auto (System)</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </label>
          <p className="text-[11px] opacity-70">
            {mode === 'auto'
              ? `Auto mode active. Currently using ${theme} theme based on system preferences.`
              : t('prefs.help.theme') || 'Choose light or dark based on your environment.'}
          </p>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span className="opacity-80">{t('prefs.highContrast') || 'High contrast'}</span>
            <button onClick={toggleHC} className="px-2 py-1 rounded bg-slate-100 dark:bg-white/5 border border-white/12" aria-pressed={highContrast}>{highContrast ? 'On' : 'Off'}</button>
          </label>
          <p className="text-[11px] opacity-70">{t('prefs.help.highContrast') || 'Improves contrast and focus rings for readability.'}</p>
        </div>
      </section>
      <section className="glass rounded p-4 border border-slate-200 dark:border-white/10 space-y-3">
        <h2 className="text-sm font-semibold">{t('finance.quicklook') || 'Finance'}</h2>
        <div className="space-y-2">
          <label className="flex items-center justify-between gap-3 text-sm">
            <span className="opacity-80">{t('prefs.finance.currency') || 'Currency'}</span>
            <select value={currency} onChange={e => setCurrency(e.target.value as any)} className="bg-slate-100 dark:bg-white/5 border border-white/12 rounded px-2 py-1">
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
            </select>
          </label>
          <p className="text-[11px] opacity-70">{t('prefs.help.currency') || 'Sets default currency for dashboards and exports.'}</p>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span className="opacity-80">{t('prefs.units') || 'Distance units'}</span>
            <select value={unit} onChange={e => setUnit(e.target.value as any)} className="bg-slate-100 dark:bg-white/5 border border-white/12 rounded px-2 py-1">
              <option value="km">km</option>
              <option value="mi">mi</option>
            </select>
          </label>
          <p className="text-[11px] opacity-70">{t('prefs.help.units') || 'Used for travel distances and map overlays.'}</p>
        </div>
      </section>
      <section className="glass rounded p-4 border border-slate-200 dark:border-white/10 space-y-3">
        <h2 className="text-sm font-semibold">{t('prefs.presentation') || 'Presentation'}</h2>
        <div className="space-y-2">
          <label className="flex items-center justify-between gap-3 text-sm">
            <span className="opacity-80">{t('prefs.presentation') || 'Presentation mode'}</span>
            <input type="checkbox" checked={presentationMode} onChange={e => setPresentationMode(e.target.checked)} />
          </label>
          <p className="text-[11px] opacity-70">{t('prefs.help.presentation') || 'Larger text, simplified animations for demos.'}</p>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span className="opacity-80">{t('prefs.comparePrev') || 'Compare vs previous'}</span>
            <input type="checkbox" checked={comparePrev} onChange={e => setComparePrev(e.target.checked)} />
          </label>
          <p className="text-[11px] opacity-70">{t('prefs.help.comparePrev') || 'Shows deltas against the previous period.'}</p>
        </div>
      </section>
      <section className="glass rounded p-4 border border-slate-200 dark:border-white/10 space-y-3">
        <h2 className="text-sm font-semibold">{t('prefs.defaultRegion') || 'Default region'}</h2>
        <div className="space-y-2">
          <label className="flex items-center justify-between gap-3 text-sm">
            <span className="opacity-80">{t('filters.region') || 'Region'}</span>
            <select value={region} onChange={e => setRegion(e.target.value as any)} className="bg-slate-100 dark:bg-white/5 border border-white/12 rounded px-2 py-1">
              <option value="all">All</option>
              <option value="AMER">Americas</option>
              <option value="EMEA">EMEA</option>
              <option value="APAC">APAC</option>
            </select>
          </label>
          <p className="text-[11px] opacity-70">{t('prefs.help.region') || 'Preselects region filters in dashboards.'}</p>
        </div>
      </section>
    </div>
  );
};

const OrganizationTab: React.FC<{
  activeSubTab: 'members' | 'teams' | 'branding' | 'documents' | 'integrations';
  onSubTabChange: (tab: 'members' | 'teams' | 'branding' | 'documents' | 'integrations') => void
}> = ({ activeSubTab, onSubTabChange }) => {
  // Define organization sub-tabs configuration
  const orgSubTabs = [
    { id: 'members' as const, label: t('org.members') || 'Members' },
    { id: 'teams' as const, label: t('org.teams') || 'Teams' },
    { id: 'branding' as const, label: t('org.branding') || 'Branding' },
    { id: 'documents' as const, label: t('org.documents') || 'Documents' },
    { id: 'integrations' as const, label: t('org.integrations') || 'Integrations' }
  ];

  // Handle keyboard navigation for organization sub-tabs
  const handleOrgSubTabKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : orgSubTabs.length - 1;
      const prevTab = orgSubTabs[prevIndex];
      if (prevTab) onSubTabChange(prevTab.id);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = currentIndex < orgSubTabs.length - 1 ? currentIndex + 1 : 0;
      const nextTab = orgSubTabs[nextIndex];
      if (nextTab) onSubTabChange(nextTab.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub-tabs for Organization */}
      <div className="flex border-b border-slate-100 dark:border-white/5 mb-4" role="tablist" aria-label="Organization settings">
        {orgSubTabs.map((tab, index) => (
          <SubTabButton
            key={tab.id}
            active={activeSubTab === tab.id}
            onClick={() => onSubTabChange(tab.id)}
            onKeyDown={(e) => handleOrgSubTabKeyDown(e, index)}
            tabIndex={activeSubTab === tab.id ? 0 : -1}
          >
            {tab.label}
          </SubTabButton>
        ))}
      </div>

      {/* Sub-tab Content */}
      {activeSubTab === 'members' && <OrgMembers />}
      {activeSubTab === 'teams' && <OrgTeams />}
      {activeSubTab === 'branding' && <OrgBranding />}
      {activeSubTab === 'documents' && <OrgDocuments />}
      {activeSubTab === 'integrations' && <OrgIntegrations />}
    </div>
  );
};

const ConnectionsTab: React.FC<{
  activeSubTab: 'clients' | 'links' | 'billing' | 'reports';
  onSubTabChange: (tab: 'clients' | 'links' | 'billing' | 'reports') => void
}> = ({ activeSubTab, onSubTabChange }) => {
  // Define connections sub-tabs configuration
  const connectionsSubTabs = [
    { id: 'clients' as const, label: t('org.clients') || 'Clients' },
    { id: 'links' as const, label: t('org.links') || 'Links' },
    { id: 'billing' as const, label: t('org.billing') || 'Billing' },
    { id: 'reports' as const, label: t('org.reports') || 'Reports' }
  ];

  // Handle keyboard navigation for connections sub-tabs
  const handleConnectionsSubTabKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : connectionsSubTabs.length - 1;
      const prevTab = connectionsSubTabs[prevIndex];
      if (prevTab) onSubTabChange(prevTab.id);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = currentIndex < connectionsSubTabs.length - 1 ? currentIndex + 1 : 0;
      const nextTab = connectionsSubTabs[nextIndex];
      if (nextTab) onSubTabChange(nextTab.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub-tabs for Connections */}
      <div className="flex border-b border-slate-100 dark:border-white/5 mb-4" role="tablist" aria-label="Connections settings">
        {connectionsSubTabs.map((tab, index) => (
          <SubTabButton
            key={tab.id}
            active={activeSubTab === tab.id}
            onClick={() => onSubTabChange(tab.id)}
            onKeyDown={(e) => handleConnectionsSubTabKeyDown(e, index)}
            tabIndex={activeSubTab === tab.id ? 0 : -1}
          >
            {tab.label}
          </SubTabButton>
        ))}
      </div>

      {/* Sub-tab Content */}
      {activeSubTab === 'clients' && <OrgClients />}
      {activeSubTab === 'links' && <OrgLinks />}
      {activeSubTab === 'billing' && <OrgBilling />}
      {activeSubTab === 'reports' && <OrgReports />}
    </div>
  );
};

export default Settings;
