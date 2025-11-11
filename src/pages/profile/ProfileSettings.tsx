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
  Twitter, Instagram, Facebook, Linkedin, Music
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useHighContrast } from '../../context/HighContrastContext';
import PageHeader from '../../components/common/PageHeader';

type Tab = 'profile' | 'account' | 'preferences' | 'notifications' | 'privacy' | 'integrations' | 'data';

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

export const ProfileSettings: React.FC = () => {
  const { profile, updateProfile, updatePrefs, prefs, userId } = useAuth();
  const settings = useSettings();
  const { theme, setTheme } = useTheme();
  const { highContrast, toggleHC } = useHighContrast();

  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
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
    { id: 'notifications' as Tab, label: 'Notifications', icon: Bell },
    { id: 'privacy' as Tab, label: 'Privacy & Security', icon: Shield },
    { id: 'data' as Tab, label: 'Data & Export', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900">
      <PageHeader
        title={t('profile.settings.title') || 'Settings'}
      />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        {/* Tabs */}
        <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-2 mb-6 overflow-x-auto">
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
                      : 'text-slate-600 dark:text-white/70 hover:bg-white/50 dark:hover:bg-white/5'
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
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                        {profile.avatarUrl ? (
                          <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                        ) : (
                          profile.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      {uploadingAvatar && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
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
                      <div className="flex gap-3">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingAvatar}
                          className="px-4 py-2 rounded-lg bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium transition-all disabled:opacity-50"
                        >
                          {uploadingAvatar ? 'Uploading...' : 'Upload Photo'}
                        </button>
                        {profile.avatarUrl && (
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
                            className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium transition-all"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-white/50 mt-2">
                        JPG, PNG or GIF. Max size 5MB.
                      </p>
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
                  description="Manage your account details"
                  icon={<User className="w-5 h-5" />}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-slate-200 dark:border-white/10">
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">User ID</div>
                        <div className="text-xs text-slate-500 dark:text-white/50 font-mono mt-1">{userId}</div>
                      </div>
                    </div>
                    {profile.createdAt && (
                      <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-slate-200 dark:border-white/10">
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">Member Since</div>
                          <div className="text-xs text-slate-500 dark:text-white/50 mt-1">
                            {new Date(profile.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    )}
                    {profile.lastLoginAt && (
                      <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-slate-200 dark:border-white/10">
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">Last Login</div>
                          <div className="text-xs text-slate-500 dark:text-white/50 mt-1">
                            {new Date(profile.lastLoginAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Section>

                <Section
                  title="Password & Security"
                  description="Manage your account security"
                  icon={<Lock className="w-5 h-5" />}
                >
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-between p-4 rounded-lg bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-3">
                        <Key className="w-5 h-5 text-accent-500" />
                        <div className="text-left">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">Change Password</div>
                          <div className="text-xs text-slate-500 dark:text-white/50">Update your account password</div>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    <button className="w-full flex items-center justify-between p-4 rounded-lg bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-accent-500" />
                        <div className="text-left">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">Two-Factor Authentication</div>
                          <div className="text-xs text-slate-500 dark:text-white/50">Add an extra layer of security</div>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    <button className="w-full flex items-center justify-between p-4 rounded-lg bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-accent-500" />
                        <div className="text-left">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">Active Sessions</div>
                          <div className="text-xs text-slate-500 dark:text-white/50">Manage your active sessions</div>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </Section>
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
                  <Toggle
                    checked={highContrast}
                    onChange={() => toggleHC()}
                    label="High Contrast"
                    description="Increase contrast for better visibility"
                  />
                  <Toggle
                    checked={prefs.compactView || false}
                    onChange={(v) => updatePrefs({ compactView: v })}
                    label="Compact View"
                    description="Show more content in less space"
                  />
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
                  description="Configure app features"
                  icon={<Zap className="w-5 h-5" />}
                >
                  <Toggle
                    checked={prefs.showTutorials ?? true}
                    onChange={(v) => updatePrefs({ showTutorials: v })}
                    label="Show Tutorials"
                    description="Display helpful tips and guides"
                  />
                  <Toggle
                    checked={prefs.enableAnalytics ?? true}
                    onChange={(v) => updatePrefs({ enableAnalytics: v })}
                    label="Analytics"
                    description="Help improve OnTour with usage data"
                  />
                  <Toggle
                    checked={prefs.enableCrashReports ?? true}
                    onChange={(v) => updatePrefs({ enableCrashReports: v })}
                    label="Crash Reports"
                    description="Automatically send crash reports"
                  />
                  <Select
                    label="Auto-save Interval"
                    value={String(prefs.autoSaveInterval || 5)}
                    onChange={(v) => updatePrefs({ autoSaveInterval: Number(v) })}
                    options={[
                      { value: '1', label: 'Every minute' },
                      { value: '5', label: 'Every 5 minutes' },
                      { value: '10', label: 'Every 10 minutes' },
                      { value: '0', label: 'Disabled' },
                    ]}
                    description="How often to auto-save your work"
                  />
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

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <Section
                  title="Notification Channels"
                  description="Choose how you want to be notified"
                  icon={<Bell className="w-5 h-5" />}
                >
                  <Toggle
                    checked={notifications.notifyEmail}
                    onChange={(v) => setNotifications(prev => ({ ...prev, notifyEmail: v }))}
                    label="Email Notifications"
                    description="Receive notifications via email"
                  />
                  <Toggle
                    checked={notifications.notifyPush}
                    onChange={(v) => setNotifications(prev => ({ ...prev, notifyPush: v }))}
                    label="Push Notifications"
                    description="Receive browser push notifications"
                  />
                  <Toggle
                    checked={notifications.notifyInApp}
                    onChange={(v) => setNotifications(prev => ({ ...prev, notifyInApp: v }))}
                    label="In-App Notifications"
                    description="Show notifications inside the app"
                  />
                  <Toggle
                    checked={notifications.notifySlack}
                    onChange={(v) => setNotifications(prev => ({ ...prev, notifySlack: v }))}
                    label="Slack Notifications"
                    description="Send notifications to Slack"
                  />
                </Section>

                <Section
                  title="Notification Types"
                  description="Control what you get notified about"
                  icon={<AlertCircle className="w-5 h-5" />}
                >
                  <Toggle
                    checked={notifications.notifyShowUpdates}
                    onChange={(v) => setNotifications(prev => ({ ...prev, notifyShowUpdates: v }))}
                    label="Show Updates"
                    description="Tour dates, venue changes, cancellations"
                  />
                  <Toggle
                    checked={notifications.notifyFinanceAlerts}
                    onChange={(v) => setNotifications(prev => ({ ...prev, notifyFinanceAlerts: v }))}
                    label="Finance Alerts"
                    description="Payment reminders, budget alerts"
                  />
                  <Toggle
                    checked={notifications.notifyTravelChanges}
                    onChange={(v) => setNotifications(prev => ({ ...prev, notifyTravelChanges: v }))}
                    label="Travel Changes"
                    description="Flight updates, accommodation confirmations"
                  />
                  <Toggle
                    checked={notifications.notifyTeamActivity}
                    onChange={(v) => setNotifications(prev => ({ ...prev, notifyTeamActivity: v }))}
                    label="Team Activity"
                    description="When team members make changes"
                  />
                  <Toggle
                    checked={notifications.notifySystemUpdates}
                    onChange={(v) => setNotifications(prev => ({ ...prev, notifySystemUpdates: v }))}
                    label="System Updates"
                    description="New features, maintenance notices"
                  />
                </Section>

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
                  description="Control who can see your profile"
                  icon={<Eye className="w-5 h-5" />}
                >
                  <Select
                    label="Profile Visibility"
                    value={privacy.profileVisibility}
                    onChange={(v) => setPrivacy(prev => ({ ...prev, profileVisibility: v as any }))}
                    options={[
                      { value: 'public', label: 'Public - Anyone can view' },
                      { value: 'team', label: 'Team Only - Only team members' },
                      { value: 'private', label: 'Private - Only you' },
                    ]}
                    description="Who can view your profile information"
                  />
                  <Toggle
                    checked={privacy.showEmail}
                    onChange={(v) => setPrivacy(prev => ({ ...prev, showEmail: v }))}
                    label="Show Email Address"
                    description="Display email on your public profile"
                  />
                  <Toggle
                    checked={privacy.showPhone}
                    onChange={(v) => setPrivacy(prev => ({ ...prev, showPhone: v }))}
                    label="Show Phone Number"
                    description="Display phone on your public profile"
                  />
                </Section>

                <Section
                  title="Data & Privacy"
                  description="Manage your data and privacy settings"
                  icon={<Shield className="w-5 h-5" />}
                >
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-600 dark:text-blue-400">
                          <p className="font-medium">Your privacy matters</p>
                          <p className="mt-1 text-xs opacity-90">
                            We take your privacy seriously. All data is encrypted and never shared with third parties without your consent.
                          </p>
                        </div>
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
                  description="Download a copy of your data (GDPR compliant)"
                  icon={<Download className="w-5 h-5" />}
                >
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600 dark:text-white/70">
                      You can export all your data in JSON format. This includes your profile, preferences, shows, contacts, and all other data.
                    </p>
                    <button
                      onClick={handleExportData}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium transition-all"
                    >
                      <Download className="w-4 h-4" />
                      Export All Data
                    </button>
                  </div>
                </Section>

                <Section
                  title="Data Management"
                  description="Manage your stored data"
                  icon={<Database className="w-5 h-5" />}
                >
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-white/5 border border-slate-200 dark:border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">Clear Cache</div>
                          <div className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
                            Remove temporary files and cached data
                          </div>
                        </div>
                        <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-slate-200 dark:border-white/10 text-sm font-medium transition-all">
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>
                </Section>

                <Section
                  title="Danger Zone"
                  description="Irreversible actions"
                  icon={<AlertCircle className="w-5 h-5" />}
                >
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-red-600 dark:text-red-400">Delete Account</div>
                          <div className="text-xs text-red-600/80 dark:text-red-400/80 mt-1">
                            Once you delete your account, there is no going back. Please be certain.
                          </div>
                          <button
                            onClick={() => {
                              if (confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
                                alert('Account deletion is not available in demo mode');
                              }
                            }}
                            className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Account
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
