import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { FirestoreProfileService } from '../../services/firestoreProfileService';
import { t } from '../../lib/i18n';
import { 
  User, Mail, Phone, MapPin, Link as LinkIcon, Globe, 
  Bell, Shield, Database, Download, Trash2, Save, 
  Camera, Check, X, Settings, Lock, Eye, EyeOff,
  Palette, Monitor, Sun, Moon, DollarSign, Languages,
  Calendar, Clock, Zap, TrendingUp, FileText, Key,
  UserCheck, Activity, AlertCircle, CheckCircle2,
  Twitter, Instagram, Facebook, Linkedin, Music, Upload,
  Smartphone, MessageSquare, Plane, Users
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useHighContrast } from '../../context/HighContrastContext';
import PageHeader from '../../components/common/PageHeader';

type Tab = 'profile' | 'account' | 'preferences' | 'agencies' | 'notifications' | 'privacy' | 'integrations' | 'data';

// Modern Toggle Switch
const Toggle: React.FC<{ 
  checked: boolean; 
  onChange: (checked: boolean) => void; 
  label?: string; 
  description?: string;
  disabled?: boolean;
}> = ({ checked, onChange, label, description, disabled }) => (
  <div className="flex items-center justify-between">
    {(label || description) && (
      <div className="flex-1">
        {label && <div className="text-sm font-medium text-slate-700 dark:text-white/90">{label}</div>}
        {description && <div className="text-xs text-slate-500 dark:text-white/50 mt-0.5">{description}</div>}
      </div>
    )}
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 dark:focus:ring-offset-dark-900 ${
        checked ? 'bg-accent-500' : 'bg-white/10'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
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
  disabled?: boolean;
}> = ({ label, value, onChange, type = 'text', placeholder, description, icon, error, disabled }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-slate-700 dark:text-white/90">{label}</label>
    {description && <p className="text-xs text-slate-500 dark:text-white/50">{description}</p>}
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-white/40">
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-lg bg-white/5 border ${
          error ? 'border-red-500/50 focus:border-red-500' : 'border-slate-200 dark:border-white/10 focus:border-accent-500'
        } text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
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
  disabled?: boolean;
}> = ({ label, value, onChange, options, description, icon, disabled }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-slate-700 dark:text-white/90">{label}</label>
    {description && <p className="text-xs text-slate-500 dark:text-white/50">{description}</p>}
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-white/40">
          {icon}
        </div>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-10 py-2.5 rounded-lg bg-white/5 border border-slate-200 dark:border-white/10 focus:border-accent-500 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all appearance-none cursor-pointer ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-white dark:bg-dark-800">
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className="h-5 w-5 text-slate-400 dark:text-white/40" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  </div>
);

// Section Card Component
const Section: React.FC<{ 
  title: string; 
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, description, icon, children }) => (
  <div className="glass rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent">
      <div className="flex items-center gap-3">
        {icon && <div className="text-accent-500">{icon}</div>}
        <div className="flex-1">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
          {description && <p className="text-xs text-slate-500 dark:text-white/60 mt-0.5">{description}</p>}
        </div>
      </div>
    </div>
    <div className="p-6 space-y-4">
      {children}
    </div>
  </div>
);

// Agencies Manager Component
const AgenciesManager: React.FC<{ type: 'booking' | 'management' }> = ({ type }) => {
  const { bookingAgencies, managementAgencies, addAgency, updateAgency, removeAgency } = useSettings();
  const agencies = type === 'booking' ? bookingAgencies : managementAgencies;
  const maxAgencies = 5;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    commissionPct: 15,
    territoryMode: 'worldwide' as 'worldwide' | 'continents' | 'countries',
    continents: [] as string[],
    countries: [] as string[],
    notes: ''
  });

  const handleAdd = () => {
    if (agencies.length >= maxAgencies) {
      alert(`Maximum ${maxAgencies} ${type} agencies allowed`);
      return;
    }

    const result = addAgency({
      name: formData.name || `${type} Agency ${agencies.length + 1}`,
      type,
      commissionPct: formData.commissionPct,
      territoryMode: formData.territoryMode,
      continents: formData.continents.length > 0 ? formData.continents as any : undefined,
      countries: formData.countries.length > 0 ? formData.countries : undefined,
      notes: formData.notes || undefined
    });

    if (result.ok) {
      resetForm();
    } else {
      alert(result.reason || 'Could not add agency');
    }
  };

  const handleUpdate = (id: string) => {
    updateAgency(id, {
      name: formData.name,
      commissionPct: formData.commissionPct,
      territoryMode: formData.territoryMode,
      continents: formData.continents.length > 0 ? formData.continents as any : undefined,
      countries: formData.countries.length > 0 ? formData.countries : undefined,
      notes: formData.notes || undefined
    });
    setEditingId(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this agency?')) {
      removeAgency(id);
      console.log('[ProfileSettings] ✅ Agency deleted');
    }
  };

  const handleEdit = (agency: any) => {
    setEditingId(agency.id);
    setFormData({
      name: agency.name,
      commissionPct: agency.commissionPct,
      territoryMode: agency.territoryMode || 'worldwide',
      continents: agency.continents || [],
      countries: agency.countries || [],
      notes: agency.notes || ''
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      commissionPct: 15,
      territoryMode: 'worldwide',
      continents: [],
      countries: [],
      notes: ''
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      {/* Agency List */}
      <div className="space-y-3">
        {agencies.map((agency) => (
          <div key={agency.id} className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-accent-500/30 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-medium text-slate-900 dark:text-white">{agency.name}</h4>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-accent-500/20 text-accent-700 dark:text-accent-300">
                    {agency.commissionPct}%
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-600 dark:text-white/60 space-y-0.5">
                  <div>Territory: {agency.territoryMode === 'worldwide' ? 'Worldwide' : agency.territoryMode === 'continents' ? `Continents (${agency.continents?.length || 0})` : `Countries (${agency.countries?.length || 0})`}</div>
                  {agency.notes && <div>Notes: {agency.notes}</div>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(agency)}
                  className="p-2 rounded-lg hover:bg-white/10 text-slate-600 dark:text-white/70 hover:text-accent-500"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(agency.id)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-slate-600 dark:text-white/70 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form */}
      {(agencies.length < maxAgencies || editingId) && (
        <div className="p-4 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-slate-900 dark:text-white">
              {editingId ? 'Edit Agency' : `Add ${type.charAt(0).toUpperCase() + type.slice(1)} Agency`}
            </h4>
            {editingId && (
              <button onClick={resetForm} className="text-xs text-slate-600 dark:text-white/60 hover:text-accent-500">
                Cancel
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Agency Name"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              placeholder={`e.g., ${type === 'booking' ? 'CAA' : 'Management Co'}`}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-white/90">
                Commission %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={formData.commissionPct}
                onChange={(e) => setFormData({ ...formData, commissionPct: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-slate-200 dark:border-white/10 focus:border-accent-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all"
              />
            </div>
          </div>

          {type === 'booking' && (
            <div className="space-y-3">
              <Select
                label="Territory Mode"
                value={formData.territoryMode}
                onChange={(value) => setFormData({ ...formData, territoryMode: value as any })}
                options={[
                  { value: 'worldwide', label: 'Worldwide' },
                  { value: 'continents', label: 'Specific Continents' },
                  { value: 'countries', label: 'Specific Countries' }
                ]}
              />

              {formData.territoryMode === 'continents' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-white/90">
                    Continents (comma-separated: NA, SA, EU, AF, AS, OC)
                  </label>
                  <input
                    type="text"
                    value={formData.continents.join(', ')}
                    onChange={(e) => setFormData({ ...formData, continents: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    placeholder="e.g., NA, EU"
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-slate-200 dark:border-white/10 focus:border-accent-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all"
                  />
                </div>
              )}

              {formData.territoryMode === 'countries' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-white/90">
                    Countries (comma-separated ISO2 codes)
                  </label>
                  <input
                    type="text"
                    value={formData.countries.join(', ')}
                    onChange={(e) => setFormData({ ...formData, countries: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    placeholder="e.g., US, GB, FR"
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-slate-200 dark:border-white/10 focus:border-accent-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all"
                  />
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-white/90">
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              placeholder="Additional notes..."
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-slate-200 dark:border-white/10 focus:border-accent-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all resize-none"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={editingId ? () => handleUpdate(editingId) : handleAdd}
              disabled={!formData.name.trim()}
              className="px-4 py-2 rounded-lg bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingId ? 'Update' : 'Add'} Agency
            </button>
          </div>
        </div>
      )}

      {agencies.length === 0 && !editingId && (
        <div className="text-center py-8 text-slate-500 dark:text-white/50">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No {type} agencies added yet</p>
          <p className="text-xs mt-1">Add up to {maxAgencies} agencies</p>
        </div>
      )}

      {agencies.length >= maxAgencies && !editingId && (
        <p className="text-xs text-center text-slate-500 dark:text-white/50">
          Maximum {maxAgencies} {type} agencies reached
        </p>
      )}
    </div>
  );
};

export const ProfileSettings: React.FC = () => {
  const { profile, updateProfile, updatePrefs, prefs, userId } = useAuth();
  const settings = useSettings();
  const { theme, setTheme } = useTheme();
  const { highContrast, toggleHC } = useHighContrast();

  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  
  // Profile form state
  const [formData, setFormData] = useState({
    name: profile.name || '',
    email: profile.email || '',
    bio: profile.bio || '',
    phone: profile.phone || '',
    location: profile.location || '',
    website: profile.website || '',
    twitter: profile.twitter || '',
    instagram: profile.instagram || '',
    facebook: profile.facebook || '',
    linkedin: profile.linkedin || '',
    spotify: profile.spotify || '',
  });

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    notifyEmail: profile.notifyEmail ?? true,
    notifyPush: profile.notifyPush ?? true,
    notifyInApp: profile.notifyInApp ?? true,
    notifySlack: profile.notifySlack ?? false,
    notifyShowUpdates: profile.notifyShowUpdates ?? true,
    notifyFinanceAlerts: profile.notifyFinanceAlerts ?? true,
    notifyTravelChanges: profile.notifyTravelChanges ?? true,
    notifyTeamActivity: profile.notifyTeamActivity ?? false,
    notifySystemUpdates: profile.notifySystemUpdates ?? true,
  });

  // Privacy settings state
  const [privacy, setPrivacy] = useState({
    profileVisibility: profile.profileVisibility || 'team',
    showEmail: profile.showEmail ?? false,
    showPhone: profile.showPhone ?? false,
  });

  // Avatar upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Handle form field changes
  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Website must start with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      // Update local state
      updateProfile(formData);

      // Save to Firebase (if authenticated)
      try {
        await FirestoreProfileService.saveProfile(userId, formData);
      } catch (error) {
        console.log('Firestore save failed (demo mode):', error);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Save notifications
  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      updateProfile(notifications);

      try {
        await FirestoreProfileService.saveProfile(userId, notifications);
      } catch (error) {
        console.log('Firestore save failed (demo mode):', error);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving notifications:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Save privacy settings
  const handleSavePrivacy = async () => {
    setIsSaving(true);
    try {
      updateProfile(privacy);

      try {
        await FirestoreProfileService.saveProfile(userId, privacy);
      } catch (error) {
        console.log('Firestore save failed (demo mode):', error);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving privacy:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Save preferences
  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      try {
        await FirestoreProfileService.savePreferences(userId, prefs);
      } catch (error) {
        console.log('Firestore save failed (demo mode):', error);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const avatarUrl = await FirestoreProfileService.uploadAvatar(userId, file);
      updateProfile({ avatarUrl });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      alert(error.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Export data
  const handleExportData = async () => {
    try {
      const data = await FirestoreProfileService.exportUserData(userId);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ontour-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const tabs = [
    { id: 'profile' as Tab, label: 'Profile', icon: User },
    { id: 'account' as Tab, label: 'Account', icon: Settings },
    { id: 'preferences' as Tab, label: 'Preferences', icon: Palette },
    { id: 'agencies' as Tab, label: 'Agencies & Commissions', icon: Users },
    { id: 'notifications' as Tab, label: 'Notifications', icon: Bell },
    { id: 'privacy' as Tab, label: 'Privacy & Security', icon: Shield },
    { id: 'data' as Tab, label: 'Data & Export', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-dark-800/30">
      <PageHeader
        title={t('profile.settings.title') || 'Settings'}
      />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 pb-20">
        {/* Tabs */}
        <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-2 mb-6 overflow-x-auto shadow-sm">
          <div className="flex gap-2 min-w-max">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/20'
                      : 'text-slate-700 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Save Success Banner */}
        <AnimatePresence>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                {t('profile.settings.saved') || 'Settings saved successfully!'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Avatar Section */}
                <Section
                  title="Profile Picture"
                  description="Upload a profile picture to personalize your account"
                  icon={<Camera className="w-5 h-5" />}
                >
                  <div className="flex items-start gap-6">
                    <div className="relative group">
                      <div className="w-28 h-28 rounded-full bg-gradient-to-br from-accent-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden ring-4 ring-slate-200 dark:ring-white/10">
                        {profile.avatarUrl ? (
                          <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="select-none">{profile.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      {uploadingAvatar && (
                        <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      {!uploadingAvatar && (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute inset-0 bg-black/0 hover:bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                        >
                          <Camera className="w-6 h-6 text-white drop-shadow-lg" />
                        </button>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingAvatar}
                            className="px-4 py-2.5 rounded-lg bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium transition-all disabled:opacity-50 shadow-sm hover:shadow-md"
                          >
                            {uploadingAvatar ? (
                              <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Uploading...
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                Upload Photo
                              </span>
                            )}
                          </button>
                          {profile.avatarUrl && !uploadingAvatar && (
                            <button
                              onClick={async () => {
                                if (confirm('Remove profile picture?')) {
                                  try {
                                    await FirestoreProfileService.deleteAvatar(userId, profile.avatarUrl!);
                                  } catch (error) {
                                    updateProfile({ avatarUrl: undefined });
                                  }
                                }
                              }}
                              className="px-4 py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium transition-all border border-red-500/20"
                            >
                              <span className="flex items-center gap-2">
                                <Trash2 className="w-4 h-4" />
                                Remove
                              </span>
                            </button>
                          )}
                        </div>
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-slate-400 dark:text-white/40 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-slate-500 dark:text-white/50">
                            JPG, PNG or GIF. Max size 5MB. Recommended: 400x400px for best quality.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Section>

                {/* Basic Info */}
                <Section
                  title="Basic Information"
                  description="Your personal details"
                  icon={<User className="w-5 h-5" />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      value={formData.name}
                      onChange={(v) => handleFieldChange('name', v)}
                      icon={<User className="w-4 h-4" />}
                      placeholder="Enter your full name"
                      error={errors.name}
                    />
                    <Input
                      label="Email"
                      value={formData.email}
                      onChange={(v) => handleFieldChange('email', v)}
                      type="email"
                      icon={<Mail className="w-4 h-4" />}
                      placeholder="your@email.com"
                      error={errors.email}
                    />
                    <Input
                      label="Phone"
                      value={formData.phone}
                      onChange={(v) => handleFieldChange('phone', v)}
                      type="tel"
                      icon={<Phone className="w-4 h-4" />}
                      placeholder="+1 (555) 123-4567"
                    />
                    <Input
                      label="Location"
                      value={formData.location}
                      onChange={(v) => handleFieldChange('location', v)}
                      icon={<MapPin className="w-4 h-4" />}
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-white/90 mb-2">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleFieldChange('bio', e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-slate-200 dark:border-white/10 focus:border-accent-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all resize-none"
                    />
                  </div>
                </Section>

                {/* Links & Social */}
                <Section
                  title="Links & Social Media"
                  description="Connect your online presence"
                  icon={<Globe className="w-5 h-5" />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Website"
                      value={formData.website}
                      onChange={(v) => handleFieldChange('website', v)}
                      type="url"
                      icon={<LinkIcon className="w-4 h-4" />}
                      placeholder="https://yourwebsite.com"
                      error={errors.website}
                    />
                    <Input
                      label="Twitter"
                      value={formData.twitter}
                      onChange={(v) => handleFieldChange('twitter', v)}
                      icon={<Twitter className="w-4 h-4" />}
                      placeholder="@username"
                    />
                    <Input
                      label="Instagram"
                      value={formData.instagram}
                      onChange={(v) => handleFieldChange('instagram', v)}
                      icon={<Instagram className="w-4 h-4" />}
                      placeholder="@username"
                    />
                    <Input
                      label="Facebook"
                      value={formData.facebook}
                      onChange={(v) => handleFieldChange('facebook', v)}
                      icon={<Facebook className="w-4 h-4" />}
                      placeholder="facebook.com/username"
                    />
                    <Input
                      label="LinkedIn"
                      value={formData.linkedin}
                      onChange={(v) => handleFieldChange('linkedin', v)}
                      icon={<Linkedin className="w-4 h-4" />}
                      placeholder="linkedin.com/in/username"
                    />
                    <Input
                      label="Spotify"
                      value={formData.spotify}
                      onChange={(v) => handleFieldChange('spotify', v)}
                      icon={<Music className="w-4 h-4" />}
                      placeholder="spotify.com/artist/..."
                    />
                  </div>
                </Section>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-medium transition-all shadow-lg shadow-accent-500/20 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <Section
                  title="Account Information"
                  description="View your account details and metadata"
                  icon={<User className="w-5 h-5" />}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-lg glass border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent-500/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-accent-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">User ID</div>
                          <div className="text-xs text-slate-500 dark:text-white/50 font-mono mt-0.5">{userId}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(userId);
                          alert('User ID copied to clipboard!');
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    {profile.createdAt && (
                      <div className="flex items-center gap-3 p-4 rounded-lg glass border border-white/10">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">Member Since</div>
                          <div className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
                            {new Date(profile.createdAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                    {profile.lastLoginAt && (
                      <div className="flex items-center gap-3 p-4 rounded-lg glass border border-white/10">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                          <Activity className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">Last Login</div>
                          <div className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
                            {new Date(profile.lastLoginAt).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                    {profile.timezone && (
                      <div className="flex items-center gap-3 p-4 rounded-lg glass border border-white/10">
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                          <Globe className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">Timezone</div>
                          <div className="text-xs text-slate-500 dark:text-white/50 mt-0.5">{profile.timezone}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </Section>

                <Section
                  title="Password & Security"
                  description="Manage your account security and authentication"
                  icon={<Lock className="w-5 h-5" />}
                >
                  <div className="space-y-3">
                    <button 
                      onClick={() => setShowPasswordChange(true)}
                      className="w-full flex items-center justify-between p-4 rounded-lg glass border border-white/10 hover:bg-white/10 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent-500/10 flex items-center justify-center">
                          <Key className="w-5 h-5 text-accent-500" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">Change Password</div>
                          <div className="text-xs text-slate-500 dark:text-white/50">Update your account password</div>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white/70 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    <button className="w-full flex items-center justify-between p-4 rounded-lg glass border border-white/10 hover:bg-white/10 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                            Two-Factor Authentication
                            <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full">Recommended</span>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-white/50">Add an extra layer of security</div>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white/70 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    <button className="w-full flex items-center justify-between p-4 rounded-lg glass border border-white/10 hover:bg-white/10 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                          <Activity className="w-5 h-5 text-purple-500" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">Active Sessions</div>
                          <div className="text-xs text-slate-500 dark:text-white/50">Manage devices and logout remotely</div>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white/70 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </Section>

                {/* Password Change Modal */}
                <AnimatePresence>
                  {showPasswordChange && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowPasswordChange(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                      >
                        <div className="glass rounded-2xl border border-slate-200 dark:border-white/10 p-6 max-w-md w-full shadow-2xl">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Change Password</h3>
                            <button
                              onClick={() => setShowPasswordChange(false)}
                              className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
                            >
                              <X className="w-5 h-5 text-slate-500 dark:text-white/50" />
                            </button>
                          </div>
                          <div className="space-y-4">
                            <Input
                              label="Current Password"
                              value=""
                              onChange={() => {}}
                              type="password"
                              icon={<Lock className="w-4 h-4" />}
                              placeholder="Enter current password"
                            />
                            <Input
                              label="New Password"
                              value=""
                              onChange={() => {}}
                              type="password"
                              icon={<Key className="w-4 h-4" />}
                              placeholder="Enter new password"
                            />
                            <Input
                              label="Confirm New Password"
                              value=""
                              onChange={() => {}}
                              type="password"
                              icon={<Key className="w-4 h-4" />}
                              placeholder="Confirm new password"
                            />
                            <div className="flex gap-3 pt-2">
                              <button
                                onClick={() => setShowPasswordChange(false)}
                                className="flex-1 px-4 py-2.5 rounded-lg bg-white dark:bg-dark-800 text-slate-700 dark:text-white/90 font-medium hover:bg-white/10 transition-all"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => {
                                  alert('Password change functionality will be implemented with Firebase Auth');
                                  setShowPasswordChange(false);
                                }}
                                className="flex-1 px-4 py-2.5 rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-medium transition-all shadow-sm"
                              >
                                Update Password
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <Section
                  title="Appearance"
                  description="Customize how OnTour looks"
                  icon={<Palette className="w-5 h-5" />}
                >
                  <div className="space-y-4">
                    <Select
                      label="Theme"
                      value={theme}
                      onChange={(v) => setTheme(v as any)}
                      options={[
                        { value: 'auto', label: 'Auto (System)' },
                        { value: 'light', label: 'Light' },
                        { value: 'dark', label: 'Dark' },
                      ]}
                      icon={<Monitor className="w-4 h-4" />}
                      description="Choose your preferred color theme"
                    />

                    <div className="p-4 rounded-lg glass border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <Eye className="w-5 h-5 text-purple-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">High Contrast</div>
                            <div className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
                              Increase contrast for better visibility
                            </div>
                          </div>
                        </div>
                        <Toggle
                          checked={highContrast}
                          onChange={() => toggleHC()}
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-lg glass border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">Compact View</div>
                            <div className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
                              Show more content in less space
                            </div>
                          </div>
                        </div>
                        <Toggle
                          checked={prefs.compactView || false}
                          onChange={(v) => updatePrefs({ compactView: v })}
                        />
                      </div>
                    </div>
                  </div>
                </Section>

                <Section
                  title="Localization"
                  description="Language and regional settings"
                  icon={<Globe className="w-5 h-5" />}
                >
                  <Select
                    label="Language"
                    value={settings.lang}
                    onChange={(v) => settings.setLang(v as any)}
                    options={[
                      { value: 'en', label: 'English' },
                      { value: 'es', label: 'Español' },
                    ]}
                    icon={<Languages className="w-4 h-4" />}
                  />
                  <Select
                    label="Currency"
                    value={settings.currency}
                    onChange={(v) => settings.setCurrency(v as any)}
                    options={[
                      { value: 'EUR', label: 'EUR (€)' },
                      { value: 'USD', label: 'USD ($)' },
                      { value: 'GBP', label: 'GBP (£)' },
                    ]}
                    icon={<DollarSign className="w-4 h-4" />}
                  />
                  <Select
                    label="Date Format"
                    value={prefs.dateFormat || 'DD/MM/YYYY'}
                    onChange={(v) => updatePrefs({ dateFormat: v as any })}
                    options={[
                      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
                      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)' },
                      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
                    ]}
                    icon={<Calendar className="w-4 h-4" />}
                  />
                  <Select
                    label="Time Format"
                    value={prefs.timeFormat || '24h'}
                    onChange={(v) => updatePrefs({ timeFormat: v as any })}
                    options={[
                      { value: '12h', label: '12-hour (AM/PM)' },
                      { value: '24h', label: '24-hour' },
                    ]}
                    icon={<Clock className="w-4 h-4" />}
                  />
                  <Select
                    label="First Day of Week"
                    value={String(prefs.firstDayOfWeek || 1)}
                    onChange={(v) => updatePrefs({ firstDayOfWeek: Number(v) as any })}
                    options={[
                      { value: '0', label: 'Sunday' },
                      { value: '1', label: 'Monday' },
                    ]}
                    icon={<Calendar className="w-4 h-4" />}
                  />
                </Section>

                <Section
                  title="Application Behavior"
                  description="Configure app features and performance"
                  icon={<Zap className="w-5 h-5" />}
                >
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg glass border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent-500/10 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-accent-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">Show Tutorials</div>
                            <div className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
                              Display helpful tips and guides for new features
                            </div>
                          </div>
                        </div>
                        <Toggle
                          checked={prefs.showTutorials ?? true}
                          onChange={(v) => updatePrefs({ showTutorials: v })}
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-lg glass border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">Analytics</div>
                            <div className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
                              Help improve OnTour with anonymous usage data
                            </div>
                          </div>
                        </div>
                        <Toggle
                          checked={prefs.enableAnalytics ?? true}
                          onChange={(v) => updatePrefs({ enableAnalytics: v })}
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-lg glass border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-orange-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">Crash Reports</div>
                            <div className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
                              Automatically send crash reports to help us fix bugs
                            </div>
                          </div>
                        </div>
                        <Toggle
                          checked={prefs.enableCrashReports ?? true}
                          onChange={(v) => updatePrefs({ enableCrashReports: v })}
                        />
                      </div>
                    </div>

                    <Select
                      label="Auto-save Interval"
                      value={String(prefs.autoSaveInterval || 5)}
                      onChange={(v) => updatePrefs({ autoSaveInterval: Number(v) })}
                      options={[
                        { value: '1', label: 'Every minute' },
                        { value: '5', label: 'Every 5 minutes (Recommended)' },
                        { value: '10', label: 'Every 10 minutes' },
                        { value: '0', label: 'Disabled' },
                      ]}
                      description="How often to automatically save your work"
                    />
                  </div>
                </Section>

                <div className="flex justify-end">
                  <button
                    onClick={handleSavePreferences}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-medium transition-all shadow-lg shadow-accent-500/20 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Preferences
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Agencies & Commissions Tab */}
            {activeTab === 'agencies' && (
              <div className="space-y-6">
                <Section
                  title="Management Agencies"
                  description="Add up to 5 management agencies with their commission rates"
                  icon={<Users className="w-5 h-5" />}
                >
                  <AgenciesManager type="management" />
                </Section>

                <Section
                  title="Booking Agencies"
                  description="Add up to 5 booking agencies with their commission rates and territories"
                  icon={<Users className="w-5 h-5" />}
                >
                  <AgenciesManager type="booking" />
                </Section>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <Section
                  title="Notification Channels"
                  description="Choose how you want to be notified"
                  icon={<Bell className="w-5 h-5" />}
                >
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg glass border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Mail className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">Email Notifications</div>
                            <div className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
                              Receive updates via email
                            </div>
                          </div>
                        </div>
                        <Toggle
                          checked={notifications.notifyEmail}
                          onChange={(v) => setNotifications(prev => ({ ...prev, notifyEmail: v }))}
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-lg glass border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <Smartphone className="w-5 h-5 text-emerald-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">Push Notifications</div>
                            <div className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
                              Receive browser push notifications
                            </div>
                          </div>
                        </div>
                        <Toggle
                          checked={notifications.notifyPush}
                          onChange={(v) => setNotifications(prev => ({ ...prev, notifyPush: v }))}
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-lg glass border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent-500/10 flex items-center justify-center">
                            <Bell className="w-5 h-5 text-accent-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">In-App Notifications</div>
                            <div className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
                              Show notifications inside the app
                            </div>
                          </div>
                        </div>
                        <Toggle
                          checked={notifications.notifyInApp}
                          onChange={(v) => setNotifications(prev => ({ ...prev, notifyInApp: v }))}
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-lg glass border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-purple-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">Slack Notifications</div>
                            <div className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
                              Send notifications to Slack
                            </div>
                          </div>
                        </div>
                        <Toggle
                          checked={notifications.notifySlack}
                          onChange={(v) => setNotifications(prev => ({ ...prev, notifySlack: v }))}
                        />
                      </div>
                    </div>
                  </div>
                </Section>

                <Section
                  title="Notification Types"
                  description="Control what you get notified about"
                  icon={<AlertCircle className="w-5 h-5" />}
                >
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg glass border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent-500/10 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-accent-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">Show Updates</div>
                            <div className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
                              Tour dates, venue changes, cancellations
                            </div>
                          </div>
                        </div>
                        <Toggle
                          checked={notifications.notifyShowUpdates}
                          onChange={(v) => setNotifications(prev => ({ ...prev, notifyShowUpdates: v }))}
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-lg glass border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-emerald-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">Finance Alerts</div>
                            <div className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
                              Payment reminders, budget alerts
                            </div>
                          </div>
                        </div>
                        <Toggle
                          checked={notifications.notifyFinanceAlerts}
                          onChange={(v) => setNotifications(prev => ({ ...prev, notifyFinanceAlerts: v }))}
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-lg glass border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Plane className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">Travel Changes</div>
                            <div className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
                              Flight updates, accommodation confirmations
                            </div>
                          </div>
                        </div>
                        <Toggle
                          checked={notifications.notifyTravelChanges}
                          onChange={(v) => setNotifications(prev => ({ ...prev, notifyTravelChanges: v }))}
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-lg glass border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">Team Activity</div>
                            <div className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
                              When team members make changes
                            </div>
                          </div>
                        </div>
                        <Toggle
                          checked={notifications.notifyTeamActivity}
                          onChange={(v) => setNotifications(prev => ({ ...prev, notifyTeamActivity: v }))}
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-lg glass border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-orange-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">System Updates</div>
                            <div className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
                              New features, maintenance notices
                            </div>
                          </div>
                        </div>
                        <Toggle
                          checked={notifications.notifySystemUpdates}
                          onChange={(v) => setNotifications(prev => ({ ...prev, notifySystemUpdates: v }))}
                        />
                      </div>
                    </div>
                  </div>
                </Section>

                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 text-sm text-blue-600 dark:text-blue-400">
                      <p className="font-medium mb-1">Smart Notification Digest</p>
                      <p className="text-xs opacity-90">
                        To avoid notification fatigue, we'll group similar notifications and send you a daily digest at 9:00 AM in your timezone.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNotifications}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-medium transition-all shadow-lg shadow-accent-500/20 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Notifications
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <Section
                  title="Profile Visibility"
                  description="Control who can see your profile and information"
                  icon={<Eye className="w-5 h-5" />}
                >
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg glass border border-white/10">
                      <Select
                        label="Profile Visibility"
                        value={privacy.profileVisibility}
                        onChange={(v) => setPrivacy(prev => ({ ...prev, profileVisibility: v as any }))}
                        options={[
                          { value: 'public', label: 'Public - Anyone can view' },
                          { value: 'team', label: 'Team Only - Only team members' },
                          { value: 'private', label: 'Private - Only you' },
                        ]}
                      />
                      <p className="text-xs text-slate-500 dark:text-white/50 mt-2">
                        Who can view your profile information and activity
                      </p>
                    </div>

                    <div className="p-4 rounded-lg glass border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Mail className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">Show Email Address</div>
                            <div className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
                              Display email on your public profile
                            </div>
                          </div>
                        </div>
                        <Toggle
                          checked={privacy.showEmail}
                          onChange={(v) => setPrivacy(prev => ({ ...prev, showEmail: v }))}
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-lg glass border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <Phone className="w-5 h-5 text-emerald-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">Show Phone Number</div>
                            <div className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
                              Display phone on your public profile
                            </div>
                          </div>
                        </div>
                        <Toggle
                          checked={privacy.showPhone}
                          onChange={(v) => setPrivacy(prev => ({ ...prev, showPhone: v }))}
                        />
                      </div>
                    </div>
                  </div>
                </Section>

                <Section
                  title="Data & Privacy Controls"
                  description="Manage how your data is used and protected"
                  icon={<Shield className="w-5 h-5" />}
                >
                  <div className="space-y-4">
                    <div className="p-5 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                      <div className="flex items-start gap-3">
                        <Shield className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 text-sm text-blue-600 dark:text-blue-400">
                          <p className="font-semibold mb-2">Your privacy matters to us</p>
                          <ul className="text-xs opacity-90 space-y-2">
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              <span>All data is encrypted in transit and at rest using AES-256</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              <span>We never share your data with third parties without explicit consent</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              <span>Full GDPR compliance - request your data or deletion anytime</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              <span>Regular security audits and penetration testing</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-4 rounded-lg glass border border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <Lock className="w-4 h-4 text-purple-500" />
                          </div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">Data Encryption</div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-white/50">
                          End-to-end encryption for all sensitive data
                        </p>
                      </div>

                      <div className="p-4 rounded-lg glass border border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          </div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">GDPR Compliant</div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-white/50">
                          Full compliance with data protection regulations
                        </p>
                      </div>

                      <div className="p-4 rounded-lg glass border border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Eye className="w-4 h-4 text-blue-500" />
                          </div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">Audit Logs</div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-white/50">
                          Track all access to your account and data
                        </p>
                      </div>

                      <div className="p-4 rounded-lg glass border border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                          </div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">Security Alerts</div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-white/50">
                          Instant notifications for suspicious activity
                        </p>
                      </div>
                    </div>
                  </div>
                </Section>

                <div className="flex justify-end">
                  <button
                    onClick={handleSavePrivacy}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-medium transition-all shadow-lg shadow-accent-500/20 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Privacy Settings
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Data & Export Tab */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <Section
                  title="Export Your Data"
                  description="Download a copy of all your data in JSON format (GDPR compliant)"
                  icon={<Download className="w-5 h-5" />}
                >
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 text-sm text-blue-600 dark:text-blue-400">
                          <p className="font-medium mb-1">What's included in your export?</p>
                          <ul className="text-xs opacity-90 space-y-1 list-disc list-inside">
                            <li>Profile information and preferences</li>
                            <li>All shows, contacts, and venues</li>
                            <li>Financial data and transactions</li>
                            <li>Travel itineraries and bookings</li>
                            <li>Organization settings</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleExportData}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-medium transition-all shadow-lg shadow-accent-500/20 hover:shadow-xl"
                    >
                      <Download className="w-5 h-5" />
                      Export All Data (JSON)
                    </button>
                    <p className="text-xs text-slate-500 dark:text-white/50 text-center">
                      Your data will be downloaded as a JSON file that you can import into other services.
                    </p>
                  </div>
                </Section>

                <Section
                  title="Data Management"
                  description="Manage your stored data and cache"
                  icon={<Database className="w-5 h-5" />}
                >
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg glass border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <Database className="w-5 h-5 text-purple-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">Clear Cache</div>
                            <div className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
                              Remove temporary files and cached data
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            if (confirm('Clear all cached data? This will not delete your account data.')) {
                              localStorage.removeItem('on-tour-cache');
                              alert('Cache cleared successfully!');
                            }
                          }}
                          className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 border border-slate-300 dark:border-white/10 text-sm font-medium transition-all"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg glass border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">Storage Usage</div>
                            <div className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
                              View your storage consumption
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">2.4 MB</div>
                          <div className="text-xs text-slate-500 dark:text-white/50">of 100 MB</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Section>

                <Section
                  title="Danger Zone"
                  description="Irreversible actions - proceed with caution"
                  icon={<AlertCircle className="w-5 h-5" />}
                >
                  <div className="space-y-3">
                    <div className="p-5 rounded-lg bg-red-500/10 border border-red-500/30">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">Delete Account</div>
                          <div className="text-xs text-red-600/80 dark:text-red-400/80 mb-4">
                            Once you delete your account, there is no going back. This will permanently delete:
                          </div>
                          <ul className="text-xs text-red-600/80 dark:text-red-400/80 space-y-1 list-disc list-inside mb-4">
                            <li>All your profile information and preferences</li>
                            <li>All shows, contacts, and venues</li>
                            <li>All financial and travel data</li>
                            <li>All organization memberships</li>
                          </ul>
                          <button
                            onClick={() => {
                              if (confirm('Are you absolutely sure you want to delete your account?\n\nThis action CANNOT be undone and all your data will be permanently deleted.')) {
                                if (confirm('This is your last chance. Type YES in the next dialog to confirm.')) {
                                  const confirmation = prompt('Type "DELETE" to confirm account deletion:');
                                  if (confirmation === 'DELETE') {
                                    alert('Account deletion is not available in demo mode. In production, this would delete your account permanently.');
                                  }
                                }
                              }
                            }}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all shadow-lg shadow-red-500/20"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete My Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Section>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfileSettings;
