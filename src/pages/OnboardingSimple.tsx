import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { trackEvent } from '../lib/telemetry';
import { useAuth } from '../context/AuthContext';
import { setCurrentOrgId } from '../lib/tenants';
import { t } from '../lib/i18n';

interface OnboardingData {
    fullName: string;
    businessType: 'artist' | 'agency' | 'venue' | '';
    companyName: string;
    country: string;
    timezone: string;
    currency: string;
}

const OnboardingPage: React.FC = () => {
    const navigate = useNavigate();
    const { updateProfile } = useAuth();
    const [step, setStep] = React.useState(1);
    const [isCompleting, setIsCompleting] = React.useState(false);

    const [data, setData] = React.useState<OnboardingData>({
        fullName: '',
        businessType: '',
        companyName: '',
        country: '',
        timezone: '',
        currency: ''
    });

    const updateData = <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
        setData(prev => ({ ...prev, [key]: value }));
    };

    // Countries with timezone and currency mapping
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
        { code: 'AE', name: 'United Arab Emirates', timezone: 'Asia/Dubai', currency: 'AED' },
        { code: 'IL', name: 'Israel', timezone: 'Asia/Jerusalem', currency: 'ILS' },
        // Oceania
        { code: 'AU', name: 'Australia', timezone: 'Australia/Sydney', currency: 'AUD' },
        { code: 'NZ', name: 'New Zealand', timezone: 'Pacific/Auckland', currency: 'NZD' },
        // Africa
        { code: 'ZA', name: 'South Africa', timezone: 'Africa/Johannesburg', currency: 'ZAR' }
    ];

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
        { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
        { code: 'ILS', name: 'Israeli Shekel', symbol: '₪' },
        { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
        { code: 'ZAR', name: 'South African Rand', symbol: 'R' }
    ];

    const businessTypes = [
        { id: 'artist' as const, label: 'Artist / Musician', description: 'Manage your tours and performances' },
        { id: 'agency' as const, label: 'Agency / Management', description: 'Manage multiple artists and bookings' },
        { id: 'venue' as const, label: 'Venue Manager', description: 'Manage venue operations and bookings' }
    ];

    const handleCountryChange = (countryCode: string) => {
        const selectedCountry = countries.find(c => c.code === countryCode);
        if (selectedCountry) {
            updateData('country', countryCode);
            updateData('timezone', selectedCountry.timezone);
            updateData('currency', selectedCountry.currency);
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

        const newOrgId = `org_${data.businessType}_${Date.now()}`;

        updateProfile?.({
            defaultOrgId: newOrgId,
            name: data.fullName
        });

        setCurrentOrgId(newOrgId);

        localStorage.setItem('onboarding:completed', 'true');
        localStorage.setItem('onboarding:data', JSON.stringify(data));
        localStorage.setItem('demo:lastOrg', newOrgId);
        localStorage.setItem('demo:currentOrg', newOrgId);
        localStorage.setItem('user:businessType', data.businessType);
        localStorage.setItem('user:companyName', data.companyName);
        localStorage.setItem('user:country', data.country);
        localStorage.setItem('user:timezone', data.timezone);
        localStorage.setItem('user:currency', data.currency);
        localStorage.setItem('user:isNew', 'true'); // Mark as new user with no demo data

        await new Promise(resolve => setTimeout(resolve, 1000));
        navigate('/dashboard');
    };

    const isStepValid = () => {
        switch (step) {
            case 1: return data.fullName.trim().length > 0 && data.businessType !== '';
            case 2: return data.country !== '';
            case 3: return true;
            default: return false;
        }
    };

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1);
            trackEvent('onboarding.step_complete', { step });
        } else {
            handleComplete();
        }
    };

    return (
        <div className="hero-gradient min-h-screen flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-2xl">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-3">
                        <div className="logo-bubble text-xl">OTA</div>
                        <span className="text-2xl font-bold">On Tour App</span>
                    </Link>
                </div>

                {/* Progress */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Step {step} of 3</span>
                        <span className="text-sm opacity-60">{Math.round((step / 3) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-accent-500 to-blue-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${(step / 3) * 100}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>

                {/* Main Card */}
                <motion.div
                    className="glass p-8 rounded-2xl border border-white/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <AnimatePresence mode="wait">
                        {/* Step 1: Profile & Business */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <h2 className="text-2xl font-bold mb-6">Let's get started</h2>

                                <div className="space-y-6">
                                    {/* Full Name */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Your Name</label>
                                        <input
                                            type="text"
                                            value={data.fullName}
                                            onChange={(e) => updateData('fullName', e.target.value)}
                                            placeholder={t('placeholder.name')}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all outline-none"
                                        />
                                    </div>

                                    {/* Business Type */}
                                    <div>
                                        <label className="block text-sm font-medium mb-3">I am a...</label>
                                        <div className="space-y-2">
                                            {businessTypes.map((type) => (
                                                <button
                                                    key={type.id}
                                                    onClick={() => updateData('businessType', type.id)}
                                                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${data.businessType === type.id
                                                        ? 'border-accent-500 bg-accent-500/10'
                                                        : 'border-slate-200 dark:border-white/10 bg-white/5 hover:border-white/20'
                                                        }`}
                                                >
                                                    <div className="font-semibold mb-1">{type.label}</div>
                                                    <div className="text-sm opacity-70">{type.description}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Company Name */}
                                    {data.businessType && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                        >
                                            <label className="block text-sm font-medium mb-2">
                                                {data.businessType === 'artist' ? 'Artist/Band Name' :
                                                    data.businessType === 'agency' ? 'Agency Name' : 'Venue Name'}
                                                <span className="opacity-50"> (optional)</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.companyName}
                                                onChange={(e) => updateData('companyName', e.target.value)}
                                                placeholder={data.businessType === 'artist' ? 'e.g., The Rolling Stones' : ''}
                                                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all outline-none"
                                            />
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Location */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <h2 className="text-2xl font-bold mb-6">Where are you based?</h2>

                                <div className="space-y-6">
                                    {/* Country */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Country</label>
                                        <select
                                            value={data.country}
                                            onChange={(e) => handleCountryChange(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all outline-none"
                                        >
                                            <option value="">Select your country</option>
                                            {countries.map(country => (
                                                <option key={country.code} value={country.code}>{country.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Auto-detected info */}
                                    {data.timezone && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="p-4 rounded-xl bg-accent-500/10 border border-accent-500/20"
                                        >
                                            <div className="text-sm space-y-1">
                                                <div className="opacity-70">We've automatically configured:</div>
                                                <div><strong>Timezone:</strong> {data.timezone}</div>
                                                <div><strong>Currency:</strong> {currencies.find(c => c.code === data.currency)?.name}</div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Summary */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="text-center mb-8">
                                    <CheckCircle className="w-16 h-16 text-accent-500 mx-auto mb-4" />
                                    <h2 className="text-2xl font-bold">You're all set!</h2>
                                    <p className="opacity-70 mt-2">Ready to start managing your tours</p>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/5">
                                        <div className="opacity-60 mb-1">Name</div>
                                        <div className="font-medium">{data.fullName}</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/5">
                                        <div className="opacity-60 mb-1">Type</div>
                                        <div className="font-medium">{businessTypes.find(t => t.id === data.businessType)?.label}</div>
                                    </div>
                                    {data.companyName && (
                                        <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/5">
                                            <div className="opacity-60 mb-1">Company</div>
                                            <div className="font-medium">{data.companyName}</div>
                                        </div>
                                    )}
                                    <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/5">
                                        <div className="opacity-60 mb-1">Location</div>
                                        <div className="font-medium">{countries.find(c => c.code === data.country)?.name}</div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                        <div>
                            {step > 1 && (
                                <button
                                    onClick={() => setStep(step - 1)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 dark:bg-white/5 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back
                                </button>
                            )}
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={!isStepValid() || isCompleting}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-500 to-blue-500 text-black font-semibold hover:from-accent-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isCompleting ? (
                                'Setting up...'
                            ) : step === 3 ? (
                                <>Complete</>
                            ) : (
                                <>
                                    Continue
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default OnboardingPage;
