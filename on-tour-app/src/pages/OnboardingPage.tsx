import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Building2, MapPin, Globe, DollarSign, Bell, CheckCircle,
  ArrowRight, ArrowLeft, Sparkles, Camera, Mail, Phone, Music,
  Calendar, Clock, Languages, Palette, Zap, Upload, X
} from 'lucide-react';
import { t } from '../lib/i18n';
import { trackEvent } from '../lib/telemetry';
import { useAuth } from '../context/AuthContext';
import { setCurrentOrgId } from '../lib/tenants';
import { secureStorage } from '../lib/secureStorage';

// Interfaces para los datos del onboarding
interface OnboardingData {
  // Profile
  fullName: string;
  email: string;
  phone: string;
  bio: string;
  avatarUrl: string;

  // Business Type
  businessType: 'artist' | 'agency' | 'venue' | '';
  companyName: string;

  // Regional Settings
  country: string;
  timezone: string;
  currency: string;

  // App Preferences
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
}

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  const [step, setStep] = React.useState(1);
  const [isCompleting, setIsCompleting] = React.useState(false);

  // Onboarding data state
  const [data, setData] = React.useState<OnboardingData>({
    fullName: '',
    email: '',
    phone: '',
    bio: '',
    avatarUrl: '',
    businessType: '',
    companyName: '',
    country: '',
    timezone: '',
    currency: '',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    theme: 'auto'
  });

  // Countries list with timezone and currency mapping
  const countries = [
    // North America
    { code: 'US', name: 'United States', timezone: 'America/New_York', currency: 'USD' },
    { code: 'CA', name: 'Canada', timezone: 'America/Toronto', currency: 'CAD' },
    { code: 'MX', name: 'Mexico', timezone: 'America/Mexico_City', currency: 'MXN' },

    // South America
    { code: 'BR', name: 'Brazil', timezone: 'America/Sao_Paulo', currency: 'BRL' },
    { code: 'AR', name: 'Argentina', timezone: 'America/Argentina/Buenos_Aires', currency: 'ARS' },
    { code: 'CL', name: 'Chile', timezone: 'America/Santiago', currency: 'CLP' },
    { code: 'CO', name: 'Colombia', timezone: 'America/Bogota', currency: 'COP' },
    { code: 'PE', name: 'Peru', timezone: 'America/Lima', currency: 'PEN' },

    // Europe
    { code: 'GB', name: 'United Kingdom', timezone: 'Europe/London', currency: 'GBP' },
    { code: 'DE', name: 'Germany', timezone: 'Europe/Berlin', currency: 'EUR' },
    { code: 'FR', name: 'France', timezone: 'Europe/Paris', currency: 'EUR' },
    { code: 'ES', name: 'Spain', timezone: 'Europe/Madrid', currency: 'EUR' },
    { code: 'IT', name: 'Italy', timezone: 'Europe/Rome', currency: 'EUR' },
    { code: 'NL', name: 'Netherlands', timezone: 'Europe/Amsterdam', currency: 'EUR' },
    { code: 'BE', name: 'Belgium', timezone: 'Europe/Brussels', currency: 'EUR' },
    { code: 'AT', name: 'Austria', timezone: 'Europe/Vienna', currency: 'EUR' },
    { code: 'CH', name: 'Switzerland', timezone: 'Europe/Zurich', currency: 'CHF' },
    { code: 'SE', name: 'Sweden', timezone: 'Europe/Stockholm', currency: 'SEK' },
    { code: 'NO', name: 'Norway', timezone: 'Europe/Oslo', currency: 'NOK' },
    { code: 'DK', name: 'Denmark', timezone: 'Europe/Copenhagen', currency: 'DKK' },
    { code: 'FI', name: 'Finland', timezone: 'Europe/Helsinki', currency: 'EUR' },
    { code: 'PL', name: 'Poland', timezone: 'Europe/Warsaw', currency: 'PLN' },
    { code: 'CZ', name: 'Czech Republic', timezone: 'Europe/Prague', currency: 'CZK' },
    { code: 'PT', name: 'Portugal', timezone: 'Europe/Lisbon', currency: 'EUR' },
    { code: 'IE', name: 'Ireland', timezone: 'Europe/Dublin', currency: 'EUR' },
    { code: 'GR', name: 'Greece', timezone: 'Europe/Athens', currency: 'EUR' },

    // Asia
    { code: 'JP', name: 'Japan', timezone: 'Asia/Tokyo', currency: 'JPY' },
    { code: 'KR', name: 'South Korea', timezone: 'Asia/Seoul', currency: 'KRW' },
    { code: 'CN', name: 'China', timezone: 'Asia/Shanghai', currency: 'CNY' },
    { code: 'IN', name: 'India', timezone: 'Asia/Kolkata', currency: 'INR' },
    { code: 'SG', name: 'Singapore', timezone: 'Asia/Singapore', currency: 'SGD' },
    { code: 'TH', name: 'Thailand', timezone: 'Asia/Bangkok', currency: 'THB' },
    { code: 'MY', name: 'Malaysia', timezone: 'Asia/Kuala_Lumpur', currency: 'MYR' },
    { code: 'ID', name: 'Indonesia', timezone: 'Asia/Jakarta', currency: 'IDR' },
    { code: 'PH', name: 'Philippines', timezone: 'Asia/Manila', currency: 'PHP' },
    { code: 'VN', name: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh', currency: 'VND' },
    { code: 'AE', name: 'United Arab Emirates', timezone: 'Asia/Dubai', currency: 'AED' },
    { code: 'IL', name: 'Israel', timezone: 'Asia/Jerusalem', currency: 'ILS' },

    // Oceania
    { code: 'AU', name: 'Australia', timezone: 'Australia/Sydney', currency: 'AUD' },
    { code: 'NZ', name: 'New Zealand', timezone: 'Pacific/Auckland', currency: 'NZD' },

    // Africa
    { code: 'ZA', name: 'South Africa', timezone: 'Africa/Johannesburg', currency: 'ZAR' },
    { code: 'EG', name: 'Egypt', timezone: 'Africa/Cairo', currency: 'EGP' },
    { code: 'MA', name: 'Morocco', timezone: 'Africa/Casablanca', currency: 'MAD' },
    { code: 'NG', name: 'Nigeria', timezone: 'Africa/Lagos', currency: 'NGN' },
    { code: 'KE', name: 'Kenya', timezone: 'Africa/Nairobi', currency: 'KES' }
  ];

  // Currencies list (expanded)
  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    { code: 'ARS', name: 'Argentine Peso', symbol: 'ARS$' },
    { code: 'CLP', name: 'Chilean Peso', symbol: 'CLP$' },
    { code: 'COP', name: 'Colombian Peso', symbol: 'COP$' },
    { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
    { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
    { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'THB', name: 'Thai Baht', symbol: '฿' },
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
    { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
    { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
    { code: 'ILS', name: 'Israeli Shekel', symbol: '₪' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£' },
    { code: 'MAD', name: 'Moroccan Dirham', symbol: 'MAD' },
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' }
  ];

  // Helper function to auto-set timezone and currency based on country
  const handleCountryChange = (countryCode: string) => {
    const selectedCountry = countries.find(c => c.code === countryCode);
    if (selectedCountry) {
      updateData('country', countryCode);
      updateData('timezone', selectedCountry.timezone);
      updateData('currency', selectedCountry.currency);
    }
  };

  // Business types
  const businessTypes = [
    {
      id: 'artist',
      label: 'Artist/Musician',
      description: 'Solo artist or band managing your own tours and performances',
      icon: Music
    },
    {
      id: 'agency',
      label: 'Agency/Management',
      description: 'Manage multiple artists, bookings, and tour operations',
      icon: Building2
    },
    {
      id: 'venue',
      label: 'Venue Manager',
      description: 'Manage venue operations, bookings, and event scheduling',
      icon: MapPin
    }
  ];

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
      try { trackEvent('onboarding.step_complete', { step }); } catch { }
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);

    try {
      trackEvent('onboarding.complete', {
        businessType: data.businessType,
        country: data.country,
        currency: data.currency
      });
    } catch { }

    // Create a new organization ID for the user
    const newOrgId = `org_${data.businessType}_${Date.now()}`;

    // Update user profile with onboarding data (only fields that exist in UserProfile)
    updateProfile?.({
      defaultOrgId: newOrgId,
      name: data.fullName,
      email: data.email,
      bio: data.bio,
      avatarUrl: data.avatarUrl
    });

    // Set the current organization
    setCurrentOrgId(newOrgId);

    // Store onboarding data including all fields (ENCRYPTED)
    secureStorage.setItem('onboarding:completed', 'true');
    secureStorage.setItem('onboarding:data', data);
    secureStorage.setItem('demo:lastOrg', newOrgId);
    secureStorage.setItem('user:businessType', data.businessType);
    secureStorage.setItem('user:companyName', data.companyName);
    secureStorage.setItem('user:country', data.country);
    secureStorage.setItem('user:timezone', data.timezone);
    secureStorage.setItem('user:currency', data.currency);
    secureStorage.setItem('user:language', data.language);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Navigate to dashboard
    navigate('/dashboard');
  };

  const handleSkip = () => {
    try { trackEvent('onboarding.skip', { step }); } catch { }
    navigate('/dashboard');
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return data.fullName.trim().length > 0 && data.businessType !== '';
      case 2: return data.country !== '' && data.timezone !== '' && data.currency !== '';
      case 3: return true; // Summary
      default: return false;
    }
  };

  return (
    <div className="hero-gradient min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated ambient background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-accent-500/5 via-transparent to-blue-500/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      />

      {/* Floating elements */}
      <motion.div
        className="absolute top-20 left-10 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, delay: 1 }}
      />

      <div className="w-full max-w-2xl relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="logo-bubble text-xl">OTA</div>
            <span className="text-2xl font-bold tracking-tight">On Tour App</span>
          </Link>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {step} of 3</span>
            <span className="text-sm opacity-60">{Math.round((step / 3) * 100)}% Complete</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-accent-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass p-8 rounded-2xl border border-white/10 shadow-2xl"
          style={{
            boxShadow: '0 0 60px rgba(0, 0, 0, 0.3), 0 0 100px rgba(191, 255, 0, 0.1)'
          }}
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Welcome */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent-500/20 mb-6"
                  >
                    <Sparkles className="w-10 h-10 text-accent-500" />
                  </motion.div>

                  <h2 className="text-3xl font-bold mb-4">Welcome to On Tour</h2>
                  <p className="text-lg opacity-70 mb-8">
                    Let's set up your account in just a few minutes. We'll personalize your experience based on your needs.
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <CheckCircle className="w-6 h-6 text-accent-500 mb-2" />
                      <h3 className="font-semibold mb-1">Complete Profile</h3>
                      <p className="text-sm opacity-60">Set up your personal info</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <Building2 className="w-6 h-6 text-accent-500 mb-2" />
                      <h3 className="font-semibold mb-1">Business Setup</h3>
                      <p className="text-sm opacity-60">Choose your account type</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <Globe className="w-6 h-6 text-accent-500 mb-2" />
                      <h3 className="font-semibold mb-1">Regional Settings</h3>
                      <p className="text-sm opacity-60">Currency & timezone</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <Zap className="w-6 h-6 text-accent-500 mb-2" />
                      <h3 className="font-semibold mb-1">App Preferences</h3>
                      <p className="text-sm opacity-60">Customize your experience</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Profile Setup */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Tell us about yourself</h2>
                  <p className="opacity-70">This information will be visible on your profile</p>
                </div>

                <div className="space-y-6">
                  {/* Avatar Upload */}
                  <div className="flex flex-col items-center">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full bg-accent-500/20 flex items-center justify-center border-2 border-accent-500/50 overflow-hidden">
                        {data.avatarUrl ? (
                          <img src={data.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-12 h-12 text-accent-500" />
                        )}
                      </div>
                      <button
                        type="button"
                        className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-accent-500 flex items-center justify-center hover:bg-accent-400 transition-colors"
                        onClick={() => {/* TODO: Implement upload */ }}
                      >
                        <Camera className="w-4 h-4 text-black" />
                      </button>
                    </div>
                    <p className="text-sm opacity-60 mt-2">Click to upload photo</p>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="w-5 h-5 opacity-40" />
                      </div>
                      <input
                        id="fullName"
                        type="text"
                        value={data.fullName}
                        onChange={(e) => updateData('fullName', e.target.value)}
                        placeholder={t('placeholder.name')}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="w-5 h-5 opacity-40" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => updateData('email', e.target.value)}
                        placeholder="john@example.com"
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Phone (Optional) */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-2">
                      Phone <span className="opacity-50">(optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="w-5 h-5 opacity-40" />
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        value={data.phone}
                        onChange={(e) => updateData('phone', e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium mb-2">
                      Bio <span className="opacity-50">(optional)</span>
                    </label>
                    <textarea
                      id="bio"
                      value={data.bio}
                      onChange={(e) => updateData('bio', e.target.value)}
                      placeholder="Tell us a bit about yourself and what you do..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all outline-none resize-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Business Type */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">What brings you to On Tour?</h2>
                  <p className="opacity-70">Choose your primary role to customize your experience</p>
                </div>

                <div className="space-y-3">
                  {businessTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <motion.button
                        key={type.id}
                        onClick={() => updateData('businessType', type.id)}
                        className={`w-full p-5 rounded-xl border-2 transition-all text-left ${data.businessType === type.id
                          ? 'border-accent-500 bg-accent-500/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                          }`}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${data.businessType === type.id
                            ? 'bg-accent-500/20'
                            : 'bg-white/10'
                            }`}>
                            <Icon className={`w-6 h-6 ${data.businessType === type.id ? 'text-accent-500' : 'opacity-60'
                              }`} />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-lg mb-1">{type.label}</div>
                            <div className="text-sm opacity-70">{type.description}</div>
                          </div>
                          {data.businessType === type.id && (
                            <CheckCircle className="w-6 h-6 text-accent-500 flex-shrink-0" />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Company/Artist Name */}
                {data.businessType && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6"
                  >
                    <label htmlFor="companyName" className="block text-sm font-medium mb-2">
                      {data.businessType === 'artist' ? 'Artist/Band Name' :
                        data.businessType === 'agency' ? 'Agency Name' :
                          'Venue Name'} <span className="opacity-50">(optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Building2 className="w-5 h-5 opacity-40" />
                      </div>
                      <input
                        id="companyName"
                        type="text"
                        value={data.companyName}
                        onChange={(e) => updateData('companyName', e.target.value)}
                        placeholder={
                          data.businessType === 'artist' ? 'e.g., The Rolling Stones' :
                            data.businessType === 'agency' ? 'e.g., Creative Artists Agency' :
                              'e.g., Madison Square Garden'
                        }
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all outline-none"
                      />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Step 4: Regional Settings */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Regional Settings</h2>
                  <p className="opacity-70">Set up your location and currency preferences</p>
                </div>

                <div className="space-y-6">
                  {/* Country */}
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium mb-2">
                      Country *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MapPin className="w-5 h-5 opacity-40" />
                      </div>
                      <select
                        id="country"
                        value={data.country}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all outline-none appearance-none"
                      >
                        <option value="">Select a country</option>
                        {countries.map(country => (
                          <option key={country.code} value={country.code}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Timezone (Auto-detected) */}
                  {data.timezone && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Timezone (Auto-detected)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Clock className="w-5 h-5 opacity-40" />
                        </div>
                        <div className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 opacity-70">
                          {data.timezone}
                        </div>
                      </div>
                      <p className="text-xs opacity-50 mt-1">Automatically set based on your country</p>
                    </div>
                  )}

                  {/* Currency (Auto-detected) */}
                  <div>
                    <label htmlFor="currency" className="block text-sm font-medium mb-2">
                      Preferred Currency *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <DollarSign className="w-5 h-5 opacity-40" />
                      </div>
                      <select
                        id="currency"
                        value={data.currency}
                        onChange={(e) => updateData('currency', e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all outline-none appearance-none"
                      >
                        <option value="">Select a currency</option>
                        {currencies.map(curr => (
                          <option key={curr.code} value={curr.code}>
                            {curr.symbol} {curr.name} ({curr.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: App Preferences */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">App Preferences</h2>
                  <p className="opacity-70">Customize how you want to use On Tour</p>
                </div>

                <div className="space-y-6">
                  {/* Language */}
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium mb-2">
                      Language
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Languages className="w-5 h-5 opacity-40" />
                      </div>
                      <select
                        id="language"
                        value={data.language}
                        onChange={(e) => updateData('language', e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all outline-none appearance-none"
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="it">Italiano</option>
                        <option value="pt">Português</option>
                      </select>
                    </div>
                  </div>

                  {/* Notifications */}
                  <div>
                    <label className="block text-sm font-medium mb-3">
                      Notification Preferences
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 opacity-60" />
                          <div>
                            <div className="font-medium">Email Notifications</div>
                            <div className="text-sm opacity-60">Get updates via email</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={data.notifications.email}
                          onChange={(e) => updateData('notifications', { ...data.notifications, email: e.target.checked })}
                          className="w-5 h-5 rounded border-white/20 bg-white/5 text-accent-500 focus:ring-accent-500/50"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 opacity-60" />
                          <div>
                            <div className="font-medium">Push Notifications</div>
                            <div className="text-sm opacity-60">Browser notifications</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={data.notifications.push}
                          onChange={(e) => updateData('notifications', { ...data.notifications, push: e.target.checked })}
                          className="w-5 h-5 rounded border-white/20 bg-white/5 text-accent-500 focus:ring-accent-500/50"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 opacity-60" />
                          <div>
                            <div className="font-medium">SMS Notifications</div>
                            <div className="text-sm opacity-60">Text message updates</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={data.notifications.sms}
                          onChange={(e) => updateData('notifications', { ...data.notifications, sms: e.target.checked })}
                          className="w-5 h-5 rounded border-white/20 bg-white/5 text-accent-500 focus:ring-accent-500/50"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Theme */}
                  <div>
                    <label className="block text-sm font-medium mb-3">
                      Theme Preference
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['light', 'dark', 'auto'] as const).map((theme) => (
                        <button
                          key={theme}
                          onClick={() => updateData('theme', theme)}
                          className={`p-4 rounded-xl border-2 transition-all ${data.theme === theme
                            ? 'border-accent-500 bg-accent-500/10'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                            }`}
                        >
                          <Palette className="w-6 h-6 mx-auto mb-2 opacity-60" />
                          <div className="text-sm font-medium capitalize">{theme}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 6: Summary */}
            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent-500/20 mb-4"
                  >
                    <CheckCircle className="w-10 h-10 text-accent-500" />
                  </motion.div>
                  <h2 className="text-3xl font-bold mb-2">Setup Complete</h2>
                  <p className="text-lg opacity-70">Review your settings before we get started</p>
                </div>

                <div className="space-y-4">
                  {/* Profile Summary */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                      <User className="w-5 h-5 text-accent-500" />
                      <h3 className="font-semibold">Profile</h3>
                    </div>
                    <div className="space-y-2 text-sm opacity-80">
                      <div><span className="opacity-60">Name:</span> {data.fullName || 'Not provided'}</div>
                      {data.email && <div><span className="opacity-60">Email:</span> {data.email}</div>}
                      {data.phone && <div><span className="opacity-60">Phone:</span> {data.phone}</div>}
                    </div>
                  </div>

                  {/* Business Summary */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                      <Building2 className="w-5 h-5 text-accent-500" />
                      <h3 className="font-semibold">Business</h3>
                    </div>
                    <div className="space-y-2 text-sm opacity-80">
                      <div>
                        <span className="opacity-60">Type:</span>{' '}
                        {data.businessType === 'artist' ? 'Artist/Musician' :
                          data.businessType === 'agency' ? 'Agency/Management' :
                            data.businessType === 'venue' ? 'Venue Manager' : 'Not selected'}
                      </div>
                      {data.companyName && <div><span className="opacity-60">Name:</span> {data.companyName}</div>}
                    </div>
                  </div>

                  {/* Regional Summary */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                      <Globe className="w-5 h-5 text-accent-500" />
                      <h3 className="font-semibold">Regional Settings</h3>
                    </div>
                    <div className="space-y-2 text-sm opacity-80">
                      <div>
                        <span className="opacity-60">Country:</span>{' '}
                        {countries.find(c => c.code === data.country)?.name || 'Not selected'}
                      </div>
                      <div>
                        <span className="opacity-60">Timezone:</span>{' '}
                        {data.timezone || 'Not selected'}
                      </div>
                      <div>
                        <span className="opacity-60">Currency:</span>{' '}
                        {currencies.find(c => c.code === data.currency)?.name || 'Not selected'}
                      </div>
                    </div>
                  </div>

                  {/* Preferences Summary */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                      <Zap className="w-5 h-5 text-accent-500" />
                      <h3 className="font-semibold">Preferences</h3>
                    </div>
                    <div className="space-y-2 text-sm opacity-80">
                      <div><span className="opacity-60">Language:</span> {data.language.toUpperCase()}</div>
                      <div><span className="opacity-60">Theme:</span> {data.theme.charAt(0).toUpperCase() + data.theme.slice(1)}</div>
                      <div>
                        <span className="opacity-60">Notifications:</span>{' '}
                        {[
                          data.notifications.email && 'Email',
                          data.notifications.push && 'Push',
                          data.notifications.sms && 'SMS'
                        ].filter(Boolean).join(', ') || 'None'}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <div>
              {step > 1 && (
                <motion.button
                  onClick={handleBack}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </motion.button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {step < 6 && (
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-sm opacity-60 hover:opacity-100 transition-opacity"
                >
                  Skip
                </button>
              )}

              <motion.button
                onClick={handleNext}
                disabled={!isStepValid() || isCompleting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 rounded-xl bg-accent-500 text-black font-semibold hover:bg-accent-400 transition-all flex items-center gap-2 shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCompleting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full"
                    />
                    <span>Setting up...</span>
                  </>
                ) : step === 6 ? (
                  <>
                    <span>Complete Setup</span>
                    <Sparkles className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingPage;
