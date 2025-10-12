import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserMemberships, setCurrentOrgId } from '../../lib/tenants';
import { showStore } from '../../shared/showStore';
import { clearAndReseedAuth } from '../../lib/demoAuth';
import { ensureDemoTenants } from '../../lib/tenants';
import { t } from '../../lib/i18n';

const Field: React.FC<{ label: string; children: React.ReactNode; description?: string }>=({label, children, description})=> (
  <label className="flex flex-col gap-2">
    <div>
      <span className="text-sm font-medium">{label}</span>
      {description && <p className="text-xs opacity-60 mt-0.5">{description}</p>}
    </div>
    {children}
  </label>
);

const Section: React.FC<{ title: string; description?: string; children: React.ReactNode; icon?: string }>=({title, description, children, icon})=> (
  <section className="glass rounded-xl p-6 border border-white/10">
    <div className="flex items-start gap-3 mb-5">
      {icon && (
        <div className="w-10 h-10 rounded-lg bg-accent-500/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
      )}
      <div className="flex-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && <p className="text-sm opacity-60 mt-1">{description}</p>}
      </div>
    </div>
    {children}
  </section>
);

const SettingRow: React.FC<{
  icon: string;
  title: string;
  description: string;
  children: React.ReactNode;
  accent?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}> = ({ icon, title, description, children, accent = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-400',
    green: 'bg-green-500/10 text-green-400',
    purple: 'bg-purple-500/10 text-purple-400',
    orange: 'bg-orange-500/10 text-orange-400',
    red: 'bg-red-500/10 text-red-400',
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-dark-500/30 border border-white/5 hover:border-white/10 transition-all">
      <div className={`w-12 h-12 rounded-xl ${colors[accent]} flex items-center justify-center flex-shrink-0`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs opacity-60 mt-0.5">{description}</p>
      </div>
      <div className="flex-shrink-0">
        {children}
      </div>
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const { profile, prefs, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: profile.name, email: profile.email, avatarUrl: profile.avatarUrl||'', bio: profile.bio||'', phone: '', location: '', website: '' });
  const [notifyEmail, setNotifyEmail] = useState<boolean>(profile.notifyEmail ?? true);
  const [notifySlack, setNotifySlack] = useState<boolean>(profile.notifySlack ?? false);
  const [saved, setSaved] = useState<string>('');
  const [errors, setErrors] = useState<{name?: string; email?: string}>({});
  const liveRef = useRef<HTMLDivElement>(null);
  const memberships = getUserMemberships(profile.id);
  const [activeTab, setActiveTab] = useState<'overview' | 'preferences' | 'appearance' | 'notifications' | 'security' | 'data' | 'import'>('overview');

  // Settings states
  const [theme, setTheme] = useState<'dark' | 'light' | 'auto'>('dark');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('America/New_York');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');
  const [currency, setCurrency] = useState('USD');
  const [compactMode, setCompactMode] = useState(false);
  const [animations, setAnimations] = useState(true);
  const [soundEffects, setSoundEffects] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [showTips, setShowTips] = useState(true);

  useEffect(()=>{
    setForm({ name: profile.name, email: profile.email, avatarUrl: profile.avatarUrl||'', bio: profile.bio||'', phone: '', location: '', website: '' });
    setNotifyEmail(profile.notifyEmail ?? true);
    setNotifySlack(profile.notifySlack ?? false);
  }, [profile]);

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: {name?: string; email?: string} = {};
    if (!form.name.trim()) errs.name = t('profile.error.name') || 'Name is required';
    if (!form.email.trim()) errs.email = t('profile.error.email') || 'Email is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    updateProfile({ ...profile, ...form, notifyEmail, notifySlack });
    setSaved(t('profile.saved')||'Saved');
    setTimeout(()=> setSaved(''), 2000);
  };

  return (
    <div className="min-h-screen">
      {/* Sidebar Navigation */}
      <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6 max-w-7xl mx-auto">
        {/* Left Sidebar */}
        <div className="lg:w-64 flex-shrink-0 space-y-4">
          {/* Profile Card */}
          <div className="glass rounded-xl p-6 border border-white/10">
            <div className="flex flex-col items-center text-center">
              <div className="relative group mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-500 via-purple-500 to-pink-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-dark-600 flex items-center justify-center">
                    {profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold bg-gradient-to-br from-accent-400 to-purple-400 bg-clip-text text-transparent">
                        {profile.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <button className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 flex items-center justify-center shadow-lg transition-all transform hover:scale-110 group-hover:rotate-12">
                  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              <h2 className="text-xl font-bold mb-1">{profile.name}</h2>
              <p className="text-xs opacity-60 mb-3">{profile.email}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-accent-500/20 to-purple-500/20 text-accent-400 text-[10px] font-medium border border-accent-500/30">
                  Artist
                </span>
                <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 text-[10px] font-medium border border-blue-500/30">
                  {memberships.length} Orgs
                </span>
                <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 text-[10px] font-medium border border-purple-500/30">
                  {showStore.getAll().length} Shows
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="glass rounded-xl border border-white/10 p-2">
            {[
              { id: 'overview', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
              { id: 'preferences', label: 'Preferences', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
              { id: 'appearance', label: 'Appearance', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
              { id: 'notifications', label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
              { id: 'security', label: 'Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
              { id: 'data', label: 'Data & Privacy', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
              { id: 'import', label: 'Import & Export', icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-accent-500/20 to-purple-500/10 text-accent-400 shadow-lg shadow-accent-500/10'
                    : 'hover:bg-white/5 opacity-70 hover:opacity-100'
                }`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeTab === tab.id ? 2.5 : 2} d={tab.icon} />
                </svg>
                <span className="text-sm font-medium">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          <form onSubmit={onSave} aria-describedby="profile-live">

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <Section
                  title="Personal Information"
                  description="Manage your account details and public profile"
                  icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Full Name" description="Your display name across the platform">
                      <input
                        value={form.name}
                        onChange={e=> setForm(f=> ({...f, name: e.target.value}))}
                        className="px-4 py-3 rounded-lg bg-dark-500/50 border border-white/10 hover:border-white/20 focus:border-accent-500 focus:outline-none transition-colors"
                        aria-invalid={!!errors.name}
                      />
                      {errors.name && <div className="text-xs text-red-400 mt-1">{errors.name}</div>}
                    </Field>

                    <Field label="Email Address" description="Primary contact email">
                      <input
                        type="email"
                        value={form.email}
                        onChange={e=> setForm(f=> ({...f, email: e.target.value}))}
                        className="px-4 py-3 rounded-lg bg-dark-500/50 border border-white/10 hover:border-white/20 focus:border-accent-500 focus:outline-none transition-colors"
                        aria-invalid={!!errors.email}
                      />
                      {errors.email && <div className="text-xs text-red-400 mt-1">{errors.email}</div>}
                    </Field>

                    <Field label="Phone Number" description="Optional contact number">
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e=> setForm(f=> ({...f, phone: e.target.value}))}
                        placeholder="+1 (555) 000-0000"
                        className="px-4 py-3 rounded-lg bg-dark-500/50 border border-white/10 hover:border-white/20 focus:border-accent-500 focus:outline-none transition-colors"
                      />
                    </Field>

                    <Field label="Location" description="City, Country">
                      <input
                        value={form.location}
                        onChange={e=> setForm(f=> ({...f, location: e.target.value}))}
                        placeholder="Madrid, Spain"
                        className="px-4 py-3 rounded-lg bg-dark-500/50 border border-white/10 hover:border-white/20 focus:border-accent-500 focus:outline-none transition-colors"
                      />
                    </Field>

                    <Field label="Website" description="Your personal or professional website">
                      <input
                        type="url"
                        value={form.website}
                        onChange={e=> setForm(f=> ({...f, website: e.target.value}))}
                        placeholder="https://yourwebsite.com"
                        className="px-4 py-3 rounded-lg bg-dark-500/50 border border-white/10 hover:border-white/20 focus:border-accent-500 focus:outline-none transition-colors"
                      />
                    </Field>

                    <Field label="Avatar URL" description="Profile picture URL">
                      <input
                        type="url"
                        value={form.avatarUrl}
                        onChange={e=> setForm(f=> ({...f, avatarUrl: e.target.value}))}
                        placeholder="https://..."
                        className="px-4 py-3 rounded-lg bg-dark-500/50 border border-white/10 hover:border-white/20 focus:border-accent-500 focus:outline-none transition-colors"
                      />
                    </Field>
                  </div>

                  <Field label="Bio" description="Tell us about yourself (max 500 characters)">
                    <textarea
                      value={form.bio}
                      onChange={e=> setForm(f=> ({...f, bio: e.target.value}))}
                      rows={4}
                      maxLength={500}
                      placeholder="Share your story, interests, or professional background..."
                      className="px-4 py-3 rounded-lg bg-dark-500/50 border border-white/10 hover:border-white/20 focus:border-accent-500 focus:outline-none transition-colors resize-none"
                    />
                    <div className="text-xs opacity-50 mt-1">{form.bio.length}/500 characters</div>
                  </Field>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    {saved && (
                      <div className="flex items-center gap-2 text-green-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium">{saved}</span>
                      </div>
                    )}
                    <button type="submit" className="ml-auto px-6 py-3 rounded-lg bg-gradient-to-r from-accent-500 to-purple-500 hover:from-accent-600 hover:to-purple-600 text-black font-semibold transition-all transform hover:scale-105 shadow-lg">
                      Save Changes
                    </button>
                  </div>
                </Section>

                <Section
                  title="Organizations"
                  description="Manage your organization memberships"
                  icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {memberships.map(m => {
                      const isDefault = m.org.id === profile.defaultOrgId;
                      return (
                        <div
                          key={m.org.id}
                          className="relative p-5 rounded-xl bg-gradient-to-br from-dark-500/50 to-dark-600/30 border border-white/10 hover:border-accent-500/50 transition-all group"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent-500 to-purple-500 flex items-center justify-center text-2xl font-bold shadow-lg">
                              {m.org.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-semibold mb-1 truncate">{m.org.name}</h3>
                              <p className="text-xs opacity-60 capitalize">{m.role}</p>
                              {isDefault && (
                                <div className="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-md bg-accent-500/20 text-accent-400 text-[10px] font-medium">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Default Organization
                                </div>
                              )}
                              {!isDefault && (
                                <button
                                  type="button"
                                  onClick={()=> { updateProfile({ defaultOrgId: m.org.id }); setSaved('Updated default organization'); setTimeout(()=> setSaved(''), 2000); }}
                                  className="mt-2 text-xs text-accent-400 hover:text-accent-300 font-medium"
                                >
                                  Set as Default →
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Section>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <Section
                  title="Regional Settings"
                  description="Customize date, time, and regional preferences"
                  icon="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                >
                  <div className="space-y-4">
                    <SettingRow
                      icon="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                      title="Language"
                      description="Interface language"
                      accent="purple"
                    >
                      <select
                        value={language}
                        onChange={e => setLanguage(e.target.value)}
                        className="px-4 py-2 rounded-lg bg-dark-500/50 border border-white/10 focus:border-accent-500 focus:outline-none text-sm"
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="it">Italiano</option>
                        <option value="pt">Português</option>
                      </select>
                    </SettingRow>

                    <SettingRow
                      icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      title="Timezone"
                      description="Your local timezone"
                      accent="blue"
                    >
                      <select
                        value={timezone}
                        onChange={e => setTimezone(e.target.value)}
                        className="px-4 py-2 rounded-lg bg-dark-500/50 border border-white/10 focus:border-accent-500 focus:outline-none text-sm"
                      >
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Europe/Madrid">Madrid (CET)</option>
                        <option value="Europe/Paris">Paris (CET)</option>
                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                      </select>
                    </SettingRow>

                    <SettingRow
                      icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      title="Date Format"
                      description="How dates are displayed"
                      accent="green"
                    >
                      <select
                        value={dateFormat}
                        onChange={e => setDateFormat(e.target.value)}
                        className="px-4 py-2 rounded-lg bg-dark-500/50 border border-white/10 focus:border-accent-500 focus:outline-none text-sm"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        <option value="DD MMM YYYY">DD MMM YYYY</option>
                      </select>
                    </SettingRow>

                    <SettingRow
                      icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      title="Time Format"
                      description="12-hour or 24-hour clock"
                      accent="orange"
                    >
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setTimeFormat('12h')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            timeFormat === '12h'
                              ? 'bg-accent-500 text-black'
                              : 'bg-dark-500/50 border border-white/10 hover:border-white/20'
                          }`}
                        >
                          12h
                        </button>
                        <button
                          type="button"
                          onClick={() => setTimeFormat('24h')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            timeFormat === '24h'
                              ? 'bg-accent-500 text-black'
                              : 'bg-dark-500/50 border border-white/10 hover:border-white/20'
                          }`}
                        >
                          24h
                        </button>
                      </div>
                    </SettingRow>

                    <SettingRow
                      icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      title="Default Currency"
                      description="Primary currency for financial calculations"
                      accent="green"
                    >
                      <select
                        value={currency}
                        onChange={e => setCurrency(e.target.value)}
                        className="px-4 py-2 rounded-lg bg-dark-500/50 border border-white/10 focus:border-accent-500 focus:outline-none text-sm"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                        <option value="AUD">AUD - Australian Dollar</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                      </select>
                    </SettingRow>
                  </div>
                </Section>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <Section
                  title="Theme & Display"
                  description="Customize the look and feel of your interface"
                  icon="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                >
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold mb-3">Color Theme</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {(['dark', 'light', 'auto'] as const).map(t => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setTheme(t)}
                            className={`p-6 rounded-xl border-2 transition-all ${
                              theme === t
                                ? 'border-accent-500 bg-accent-500/10'
                                : 'border-white/10 hover:border-white/20 bg-dark-500/30'
                            }`}
                          >
                            <div className={`w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center ${
                              t === 'dark' ? 'bg-gray-900' :
                              t === 'light' ? 'bg-gray-100' :
                              'bg-gradient-to-br from-gray-100 to-gray-900'
                            }`}>
                              {t === 'dark' && (
                                <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                </svg>
                              )}
                              {t === 'light' && (
                                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                                </svg>
                              )}
                              {t === 'auto' && (
                                <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div className="text-sm font-medium capitalize">{t}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <SettingRow
                        icon="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                        title="Compact Mode"
                        description="Reduce spacing for more content"
                        accent="blue"
                      >
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={compactMode}
                            onChange={e => setCompactMode(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-dark-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-500"></div>
                        </label>
                      </SettingRow>

                      <SettingRow
                        icon="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        title="Animations"
                        description="Enable smooth transitions and effects"
                        accent="purple"
                      >
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={animations}
                            onChange={e => setAnimations(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-dark-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-500"></div>
                        </label>
                      </SettingRow>

                      <SettingRow
                        icon="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 0012.728 0"
                        title="Sound Effects"
                        description="Play sounds for actions and notifications"
                        accent="orange"
                      >
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={soundEffects}
                            onChange={e => setSoundEffects(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-dark-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-500"></div>
                        </label>
                      </SettingRow>
                    </div>
                  </div>
                </Section>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <Section
                  title="Notification Preferences"
                  description="Control how and when you receive updates"
                  icon="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                >
                  <div className="space-y-4">
                    <SettingRow
                      icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      title="Email Notifications"
                      description="Receive updates and alerts via email"
                      accent="blue"
                    >
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifyEmail}
                          onChange={e => setNotifyEmail(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-dark-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-500"></div>
                      </label>
                    </SettingRow>

                    <SettingRow
                      icon="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      title="Slack Notifications"
                      description="Get notified in your Slack workspace"
                      accent="purple"
                    >
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifySlack}
                          onChange={e => setNotifySlack(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-dark-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-500"></div>
                      </label>
                    </SettingRow>

                    <SettingRow
                      icon="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      title="Auto-Save"
                      description="Automatically save changes as you work"
                      accent="green"
                    >
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoSave}
                          onChange={e => setAutoSave(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-dark-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-500"></div>
                      </label>
                    </SettingRow>

                    <SettingRow
                      icon="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      title="Show Tips"
                      description="Display helpful tips and tutorials"
                      accent="orange"
                    >
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showTips}
                          onChange={e => setShowTips(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-dark-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-500"></div>
                      </label>
                    </SettingRow>
                  </div>
                </Section>
              </div>
            )}

            {/* Security, Data & Import tabs remain similar but with new Section component style */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <Section
                  title="Security Settings"
                  description="Protect your account and manage sessions"
                  icon="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                >
                  <p className="text-sm opacity-60">Two-factor authentication and session management coming soon...</p>
                </Section>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6">
                <Section
                  title="Data Management"
                  description="Export or clear your application data"
                  icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                >
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={()=>{
                        const data = { profile, prefs, shows: showStore.getAll() };
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'on-tour-data.json';
                        a.click();
                        URL.revokeObjectURL(url);
                        setSaved('Exported successfully');
                        setTimeout(()=> setSaved(''), 2000);
                      }}
                      className="px-6 py-3 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 font-medium transition-all"
                    >
                      Export JSON
                    </button>
                    <button
                      type="button"
                      onClick={()=>{
                        if (confirm('Clear all data?')) {
                          localStorage.removeItem('on-tour-shows');
                          window.location.reload();
                        }
                      }}
                      className="px-6 py-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-medium transition-all"
                    >
                      Clear Data
                    </button>
                  </div>
                </Section>
              </div>
            )}

            {activeTab === 'import' && (
              <div className="space-y-6">
                <Section
                  title="Import & Export"
                  description="Data importers coming soon"
                  icon="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                >
                  <div className="p-8 rounded-xl bg-gradient-to-br from-accent-500/10 to-purple-500/10 border border-accent-500/20 text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h3 className="text-xl font-bold mb-2">Intelligent Data Import</h3>
                    <p className="text-sm opacity-70">HTML timelines, CSV files, and calendar sync coming soon</p>
                  </div>
                </Section>
              </div>
            )}

          </form>
        </div>
      </div>

      <div id="profile-live" ref={liveRef} className="sr-only" aria-live="polite">{saved}</div>
    </div>
  );
};

export default ProfilePage;
