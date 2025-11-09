import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { getUserMemberships, setCurrentOrgId, getOrgById } from '../../lib/tenants';
import { showStore } from '../../shared/showStore';
import { t } from '../../lib/i18n';
import { User, Mail, Bell, Shield, Database, Upload, Palette, Globe, Clock, DollarSign, Save, CheckCircle2, Camera, Phone, MapPin, Link as LinkIcon, Monitor, Moon, Sun } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { useTheme } from '../../hooks/useTheme';
import { useHighContrast } from '../../context/HighContrastContext';

// Modern Toggle Switch Component
const Toggle: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label?: string; description?: string }> = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between">
    {(label || description) && (
      <div className="flex-1">
        {label && <div className="text-sm font-medium text-slate-700 dark:text-white/90">{label}</div>}
        {description && <div className="text-xs text-slate-300 dark:text-white/50 mt-0.5">{description}</div>}
      </div>
    )}
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-dark-900 ${
        checked ? 'bg-accent-500' : 'bg-white/10'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

// Modern Input Component
const Input: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  description?: string;
  icon?: React.ReactNode;
  error?: string;
}> = ({ label, value, onChange, type = 'text', placeholder, description, icon, error }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-slate-700 dark:text-white/90">{label}</label>
    {description && <p className="text-xs text-slate-300 dark:text-white/50">{description}</p>}
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300 dark:text-white/40">
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-lg bg-white/5 border ${
          error ? 'border-red-500/50 focus:border-red-500' : 'border-slate-200 dark:border-white/10 focus:border-accent-500'
        } text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all`}
      />
    </div>
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);

// Modern Select Component
const Select: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  description?: string;
  icon?: React.ReactNode;
}> = ({ label, value, onChange, options, description, icon }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-slate-700 dark:text-white/90">{label}</label>
    {description && <p className="text-xs text-slate-300 dark:text-white/50">{description}</p>}
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300 dark:text-white/40">
          {icon}
        </div>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-10 py-2.5 rounded-lg bg-white/5 border border-slate-200 dark:border-white/10 focus:border-accent-500 text-white focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all appearance-none cursor-pointer`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-dark-800">
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className="h-4 w-4 text-slate-300 dark:text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
);

// Modern Card Section
const Card: React.FC<{ title: string; description?: string; icon?: React.ReactNode; children: React.ReactNode }> = ({
  title,
  description,
  icon,
  children,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass rounded-xl border border-slate-200 dark:border-white/10 p-6 hover:border-slate-300 dark:hover:border-white/20 transition-all"
  >
    <div className="flex items-start gap-4 mb-6">
      {icon && (
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center flex-shrink-0 border border-accent-500/20">
          {icon}
        </div>
      )}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-white/95">{title}</h3>
        {description && <p className="text-sm text-slate-300 dark:text-white/50 mt-1">{description}</p>}
      </div>
    </div>
    <div className="space-y-4">{children}</div>
  </motion.div>
);

const Users: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ProfilePage: React.FC = () => {
  const { profile, prefs, updateProfile, updatePrefs } = useAuth();
  const { currency, setCurrency, unit, setUnit, lang, setLang, presentationMode, setPresentationMode } = useSettings();
  const { mode: themeMode, setMode: setThemeMode } = useTheme();
  const { highContrast, toggleHC } = useHighContrast();

  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'notifications' | 'security' | 'data'>('profile');
  const [saved, setSaved] = useState(false);
  const liveRef = useRef<HTMLDivElement>(null);

  // Profile form - synced with AuthContext
  const [form, setForm] = useState({
    name: profile.name || '',
    email: profile.email || '',
    avatarUrl: profile.avatarUrl || '',
    bio: profile.bio || '',
    phone: '',
    location: '',
    website: '',
  });

  // Preferences - synced with SettingsContext and UserPrefs
  const [timezone, setTimezone] = useState('UTC');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');

  // Notifications - synced with profile
  const [emailNotifications, setEmailNotifications] = useState(profile.notifyEmail ?? true);
  const [slackNotifications, setSlackNotifications] = useState(profile.notifySlack ?? false);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  // Advanced - synced with prefs
  const [animations, setAnimations] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  useEffect(() => {
    setForm({
      name: profile.name || '',
      email: profile.email || '',
      avatarUrl: profile.avatarUrl || '',
      bio: profile.bio || '',
      phone: '',
      location: '',
      website: '',
    });
  }, [profile]);

  const handleSave = () => {
    const newErrors: typeof errors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Update profile
    updateProfile?.({
      ...profile,
      name: form.name,
      email: form.email,
      avatarUrl: form.avatarUrl,
      bio: form.bio,
      notifyEmail: emailNotifications,
      notifySlack: slackNotifications,
    });

    // Update preferences - sync all context values
    updatePrefs?.({
      presentationMode,
      highContrast,
      theme: themeMode,
      currency,
      unit,
      lang,
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    if (liveRef.current) {
      liveRef.current.textContent = t('profile.saved') || 'Saved successfully';
      setTimeout(() => {
        if (liveRef.current) liveRef.current.textContent = '';
      }, 2000);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'preferences', label: 'Preferences', icon: <Globe className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'data', label: 'Data', icon: <Database className="w-4 h-4" /> },
  ] as const;

  const memberships = getUserMemberships(profile.id);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Profile & Settings"
        subtitle="Manage your personal information and preferences"
      />

      {/* Tabs Navigation */}
      <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-accent-500 text-black shadow-lg shadow-accent-500/20'
                  : 'text-slate-400 dark:text-white/60 hover:text-slate-700 dark:text-slate-700 dark:text-white/90 hover:bg-white/5'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'profile' && (
          <>
            {/* Avatar & Basic Info */}
            <Card title="Personal Information" description="Your basic profile information" icon={<User className="w-5 h-5 text-accent-400" />}>
              {/* Avatar */}
              <div className="flex items-center gap-6 pb-6 border-b border-white/5">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-500/30 to-accent-600/20 flex items-center justify-center text-2xl font-bold text-accent-100 border-2 border-accent-500/30">
                    {form.avatarUrl ? (
                      <img src={form.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      form.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <button
                    type="button"
                    className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Camera className="w-5 h-5 text-slate-900 dark:text-white" />
                  </button>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-white/90">{form.name || 'Your Name'}</h4>
                  <p className="text-xs text-slate-300 dark:text-white/50 mt-0.5">{form.email || 'your@email.com'}</p>
                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt('Enter avatar URL:');
                      if (url) setForm({ ...form, avatarUrl: url });
                    }}
                    className="mt-2 text-xs text-accent-400 hover:text-accent-300 font-medium"
                  >
                    Change Avatar
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={form.name}
                  onChange={(val) => setForm({ ...form, name: val })}
                  icon={<User className="w-4 h-4" />}
                  error={errors.name}
                  placeholder="John Doe"
                />
                <Input
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(val) => setForm({ ...form, email: val })}
                  icon={<Mail className="w-4 h-4" />}
                  error={errors.email}
                  placeholder="john@example.com"
                />
                <Input
                  label="Phone"
                  type="tel"
                  value={form.phone}
                  onChange={(val) => setForm({ ...form, phone: val })}
                  icon={<Phone className="w-4 h-4" />}
                  placeholder="+1 (555) 000-0000"
                />
                <Input
                  label="Location"
                  value={form.location}
                  onChange={(val) => setForm({ ...form, location: val })}
                  icon={<MapPin className="w-4 h-4" />}
                  placeholder="New York, NY"
                />
              </div>

              <Input
                label="Website"
                type="url"
                value={form.website}
                onChange={(val) => setForm({ ...form, website: val })}
                icon={<LinkIcon className="w-4 h-4" />}
                placeholder="https://yourwebsite.com"
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-white/90">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-accent-500 text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all resize-none"
                />
              </div>
            </Card>

            {/* Organizations */}
            {memberships.length > 0 && (
              <Card
                title="Organizations"
                description="Teams and organizations you're part of"
                icon={<Users className="w-5 h-5 text-accent-400" />}
              >
                <div className="space-y-2">
                  {memberships.map((membership) => {
                    const org = membership.org;
                    return (
                      <div
                        key={org.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 transition-all cursor-pointer"
                        onClick={() => setCurrentOrgId(org.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center text-sm font-bold text-accent-100 border border-accent-500/20">
                            {org.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-700 dark:text-white/90">{org.name}</div>
                            <div className="text-xs text-slate-300 dark:text-white/50 capitalize">{org.type}</div>
                          </div>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-accent-500/10 text-accent-300 border border-accent-500/20 capitalize">
                          {membership.role}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </>
        )}

        {activeTab === 'preferences' && (
          <>
            <Card title="Regional Settings" description="Customize your regional preferences" icon={<Globe className="w-5 h-5 text-accent-400" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Language"
                  value={lang}
                  onChange={(val) => setLang(val as 'en' | 'es')}
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'es', label: 'Español' },
                    { value: 'fr', label: 'Français' },
                  ]}
                  icon={<Globe className="w-4 h-4" />}
                  description="Application language"
                />
                <Select
                  label="Timezone"
                  value={timezone}
                  onChange={setTimezone}
                  options={[
                    { value: 'UTC', label: 'UTC' },
                    { value: 'America/New_York', label: 'Eastern Time' },
                    { value: 'America/Los_Angeles', label: 'Pacific Time' },
                    { value: 'Europe/London', label: 'London' },
                    { value: 'Europe/Madrid', label: 'Madrid' },
                  ]}
                  icon={<Clock className="w-4 h-4" />}
                />
                <Select
                  label="Date Format"
                  value={dateFormat}
                  onChange={setDateFormat}
                  options={[
                    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                  ]}
                />
                <Select
                  label="Currency"
                  value={currency}
                  onChange={(val) => setCurrency(val as typeof currency)}
                  options={[
                    { value: 'USD', label: 'USD ($)' },
                    { value: 'EUR', label: 'EUR (€)' },
                    { value: 'GBP', label: 'GBP (£)' },
                  ]}
                  icon={<DollarSign className="w-4 h-4" />}
                  description="Default currency for shows and finances"
                />
                <Select
                  label="Distance Unit"
                  value={unit}
                  onChange={(val) => setUnit(val as typeof unit)}
                  options={[
                    { value: 'km', label: 'Kilometers (km)' },
                    { value: 'mi', label: 'Miles (mi)' },
                  ]}
                  description="Travel distance measurement"
                />
              </div>
            </Card>

            <Card title="Appearance" description="Customize the look and feel" icon={<Palette className="w-5 h-5 text-accent-400" />}>
              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-white/90">Theme</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setThemeMode('dark')}
                      className={`p-4 rounded-lg border transition-all ${
                        themeMode === 'dark'
                          ? 'bg-dark-800 border-accent-500 shadow-lg shadow-accent-500/20 text-white'
                          : 'bg-white/5 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-white/70'
                      }`}
                    >
                      <Moon className={`w-6 h-6 mx-auto mb-2 ${themeMode === 'dark' ? 'text-white' : 'text-white/70'}`} />
                      <div className="text-xs font-medium">Dark</div>
                    </button>
                    <button
                      onClick={() => setThemeMode('light')}
                      className={`p-4 rounded-lg border transition-all ${
                        themeMode === 'light'
                          ? 'bg-white border-accent-500 shadow-lg shadow-accent-500/20 text-black'
                          : 'bg-white/5 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-white/70'
                      }`}
                    >
                      <Sun className={`w-6 h-6 mx-auto mb-2 ${themeMode === 'light' ? 'text-black' : 'text-white/70'}`} />
                      <div className="text-xs font-medium">Light</div>
                    </button>
                    <button
                      onClick={() => setThemeMode('auto')}
                      className={`p-4 rounded-lg border transition-all ${
                        themeMode === 'auto'
                          ? 'bg-gradient-to-br from-dark-800 to-white/20 border-accent-500 shadow-lg shadow-accent-500/20 text-white'
                          : 'bg-white/5 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-white/70'
                      }`}
                    >
                      <Monitor className={`w-6 h-6 mx-auto mb-2 ${themeMode === 'auto' ? 'text-white' : 'text-white/70'}`} />
                      <div className="text-xs font-medium">Auto</div>
                    </button>
                  </div>
                </div>
                <Toggle
                  checked={highContrast}
                  onChange={toggleHC}
                  label="High Contrast"
                  description="Increase contrast for better visibility"
                />
                <Toggle
                  checked={presentationMode}
                  onChange={setPresentationMode}
                  label="Presentation Mode"
                  description="Optimize for presentations and demos"
                />
                <Toggle checked={animations} onChange={setAnimations} label="Animations" description="Enable smooth animations and transitions" />
                <Toggle checked={compactMode} onChange={setCompactMode} label="Compact Mode" description="Reduce spacing for more content" />
              </div>
            </Card>
          </>
        )}

        {activeTab === 'notifications' && (
          <Card
            title="Notification Preferences"
            description="Choose how you want to be notified"
            icon={<Bell className="w-5 h-5 text-accent-400" />}
          >
            <Toggle
              checked={emailNotifications}
              onChange={setEmailNotifications}
              label="Email Notifications"
              description="Receive updates via email"
            />
            <Toggle
              checked={slackNotifications}
              onChange={setSlackNotifications}
              label="Slack Notifications"
              description="Get notified in Slack"
            />
            <Toggle checked={pushNotifications} onChange={setPushNotifications} label="Push Notifications" description="Browser push notifications" />
            <Toggle checked={weeklyDigest} onChange={setWeeklyDigest} label="Weekly Digest" description="Get a weekly summary of your activity" />
            <Toggle checked={autoSave} onChange={setAutoSave} label="Auto-Save" description="Automatically save changes" />
          </Card>
        )}

        {activeTab === 'security' && (
          <Card title="Security Settings" description="Manage your account security" icon={<Shield className="w-5 h-5 text-accent-400" />}>
            <div className="p-6 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-6 h-6 text-blue-400" />
                <h4 className="font-semibold text-slate-700 dark:text-white/90">Two-Factor Authentication</h4>
              </div>
              <p className="text-sm text-slate-400 dark:text-white/60 mb-4">Add an extra layer of security to your account</p>
              <button className="px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 font-medium transition-all text-sm">
                Enable 2FA
              </button>
            </div>
            <div className="p-6 rounded-lg bg-slate-100 dark:bg-white/5 border border-white/10">
              <h4 className="font-semibold text-slate-700 dark:text-slate-700 dark:text-white/90 mb-2">Password</h4>
              <p className="text-sm text-slate-400 dark:text-white/60 mb-4">Change your password regularly to keep your account secure</p>
              <button className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-white/20 text-slate-700 dark:text-slate-700 dark:text-white/90 font-medium transition-all text-sm">
                Change Password
              </button>
            </div>
          </Card>
        )}

        {activeTab === 'data' && (
          <>
            <Card title="Export Data" description="Download your data" icon={<Database className="w-5 h-5 text-accent-400" />}>
              <div className="space-y-3">
                <p className="text-sm text-slate-400 dark:text-white/60">Export all your shows, contacts, and settings as JSON</p>
                <button
                  onClick={() => {
                    const data = { profile, shows: showStore.getAll() };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'on-tour-data.json';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 font-medium transition-all text-sm"
                >
                  Export JSON
                </button>
              </div>
            </Card>

            <Card title="Import Data" description="Import shows and data" icon={<Upload className="w-5 h-5 text-accent-400" />}>
              <div className="p-8 rounded-lg bg-gradient-to-br from-accent-500/10 to-purple-500/10 border border-accent-500/20 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-accent-400" />
                <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-700 dark:text-white/90 mb-2">Import Shows & Data</h4>
                <p className="text-sm text-slate-400 dark:text-white/60 mb-4">CSV, Excel, and calendar sync coming soon</p>
              </div>
            </Card>

            <Card title="Danger Zone" description="Irreversible actions" icon={<Shield className="w-5 h-5 text-red-400" />}>
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <h4 className="font-semibold text-red-300 mb-2">Clear All Data</h4>
                <p className="text-sm text-slate-400 dark:text-white/60 mb-3">This will permanently delete all your shows and data</p>
                <button
                  onClick={() => {
                    if (confirm('Are you sure? This cannot be undone!')) {
                      localStorage.removeItem('on-tour-shows');
                      window.location.reload();
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 font-medium transition-all text-sm"
                >
                  Clear All Data
                </button>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Save Button - Fixed at bottom */}
      {(activeTab === 'profile' || activeTab === 'preferences' || activeTab === 'notifications') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky bottom-6 z-10"
        >
          <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {saved && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2 text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Saved successfully!</span>
                  </motion.div>
                )}
              </div>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold shadow-lg shadow-accent-500/20 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div id="profile-live" ref={liveRef} className="sr-only" aria-live="polite" />
    </div>
  );
};

export default ProfilePage;
