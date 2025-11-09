import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Shield, ArrowRight, Zap } from 'lucide-react';
import { t } from '../lib/i18n';
import { trackEvent } from '../lib/telemetry';
import { useAuth } from '../context/AuthContext';
import { setAuthed } from '../lib/demoAuth';
import { secureStorage } from '../lib/secureStorage';

// Estados para el registro
type RegisterState = 'idle' | 'loading' | 'error' | 'success';

interface RegisterStateData {
  state: RegisterState;
  error?: string;
  fieldErrors?: { [key: string]: string };
}

type RegisterAction =
  | { type: 'START_LOADING' }
  | { type: 'SET_SUCCESS' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_FIELD_ERROR'; payload: { field: string; message: string } }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'RESET' };

const registerReducer = (state: RegisterStateData, action: RegisterAction): RegisterStateData => {
  switch (action.type) {
    case 'START_LOADING':
      return { state: 'loading' };
    case 'SET_SUCCESS':
      return { state: 'success' };
    case 'SET_ERROR':
      return { state: 'error', error: action.payload };
    case 'SET_FIELD_ERROR':
      return {
        ...state,
        fieldErrors: {
          ...state.fieldErrors,
          [action.payload.field]: action.payload.message
        }
      };
    case 'CLEAR_ERRORS':
      return { state: 'idle', fieldErrors: {} };
    case 'RESET':
    default:
      return { state: 'idle', fieldErrors: {} };
  }
};

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { setUserId, updateProfile } = useAuth();

  // Form state
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [agreeToTerms, setAgreeToTerms] = React.useState(false);

  // Modal states
  const [showTermsModal, setShowTermsModal] = React.useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = React.useState(false);

  // Password requirements state
  const [passwordRequirements, setPasswordRequirements] = React.useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  // Finite state machine for register
  const [registerState, dispatch] = React.useReducer(registerReducer, { state: 'idle' });

  // Validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check password requirements in real-time
  React.useEffect(() => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
    setPasswordRequirements(requirements);
  }, [password]);

  // Clear field errors when user starts typing
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (registerState.fieldErrors?.name) {
      dispatch({ type: 'CLEAR_ERRORS' });
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (registerState.fieldErrors?.email) {
      dispatch({ type: 'CLEAR_ERRORS' });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (registerState.fieldErrors?.password) {
      dispatch({ type: 'CLEAR_ERRORS' });
    }
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerState.state === 'loading') return;

    dispatch({ type: 'CLEAR_ERRORS' });

    // Validation
    let hasErrors = false;

    if (!name.trim()) {
      dispatch({ type: 'SET_FIELD_ERROR', payload: { field: 'name', message: 'Name is required' } });
      hasErrors = true;
    }

    if (!email.trim()) {
      dispatch({ type: 'SET_FIELD_ERROR', payload: { field: 'email', message: 'Email is required' } });
      hasErrors = true;
    } else if (!isValidEmail(email)) {
      dispatch({ type: 'SET_FIELD_ERROR', payload: { field: 'email', message: 'Please enter a valid email address' } });
      hasErrors = true;
    }

    if (!password) {
      dispatch({ type: 'SET_FIELD_ERROR', payload: { field: 'password', message: 'Password is required' } });
      hasErrors = true;
    } else if (!Object.values(passwordRequirements).every(Boolean)) {
      dispatch({ type: 'SET_FIELD_ERROR', payload: { field: 'password', message: 'Password does not meet requirements' } });
      hasErrors = true;
    }

    if (!agreeToTerms) {
      dispatch({ type: 'SET_FIELD_ERROR', payload: { field: 'terms', message: 'You must agree to the terms and conditions' } });
      hasErrors = true;
    }

    if (hasErrors) {
      try { trackEvent('register.validation_error', {}); } catch { }
      return;
    }

    dispatch({ type: 'START_LOADING' });

    try { trackEvent('register.submit', {}); } catch { }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // For demo purposes, simulate successful registration
    // In real app, this would call an API
    try {
      // Create a new user ID based on email
      const newUserId = `user_${email.split('@')[0]}_${Date.now()}`;

      // Authenticate the new user
      setUserId(newUserId);
      updateProfile?.({
        id: newUserId,
        name: name,
        email: email
      });
      setAuthed(true);

      // Store registration data (ENCRYPTED)
      secureStorage.setItem('user:name', name);
      secureStorage.setItem('user:email', email);
      secureStorage.setItem('demo:authed', '1');

      trackEvent('register.success', {});
      dispatch({ type: 'SET_SUCCESS' });

      // Redirect to onboarding after success
      setTimeout(() => {
        navigate('/onboarding');
      }, 2000);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Registration failed. Please try again.' });
      try { trackEvent('register.error', {}); } catch { }
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

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity">
            <div className="logo-bubble text-xl">OTA</div>
            <span className="text-2xl font-bold tracking-tight">On Tour App</span>
          </Link>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold mb-2"
          >
            De caos a control en 5 minutos
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm opacity-70"
          >
            Únete a 120+ tour managers que ya dejaron Excel atrás
          </motion.p>

          {/* Trust Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-6 mt-6 text-xs"
          >
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-medium text-slate-600 dark:text-white/80">4.8/5 rating</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/30" />
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-accent-400" />
              <span className="font-medium text-slate-600 dark:text-white/80">8h/week saved</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Form Card */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass p-8 rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl"
          style={{
            boxShadow: '0 0 60px rgba(0, 0, 0, 0.3), 0 0 100px rgba(191, 255, 0, 0.1)'
          }}
        >
          {/* Error Alert */}
          {registerState.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-200">{registerState.error}</p>
              </div>
            </motion.div>
          )}
          {/* Name Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="w-5 h-5 opacity-40" />
              </div>
              <input
                id="name"
                type="text"
                value={name}
                onChange={handleNameChange}
                autoFocus
                placeholder={t('placeholder.name')}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all outline-none"
                autoComplete="name"
              />
            </div>
            {registerState.fieldErrors?.name && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-400 mt-2 flex items-start gap-1"
              >
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <span>{registerState.fieldErrors.name}</span>
              </motion.p>
            )}
          </motion.div>

          {/* Email Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-6"
          >
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address {email && isValidEmail(email) && (
                <CheckCircle className="inline w-4 h-4 text-green-400 ml-1" />
              )}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 opacity-40" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all outline-none"
                autoComplete="email"
              />
            </div>
            {registerState.fieldErrors?.email && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-400 mt-2 flex items-start gap-1"
              >
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <span>{registerState.fieldErrors.email}</span>
              </motion.p>
            )}
          </motion.div>

          {/* Password Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-6"
          >
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 opacity-40" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all outline-none"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center hover:opacity-70 transition-opacity"
              >
                {showPassword ? <EyeOff className="w-5 h-5 opacity-40" /> : <Eye className="w-5 h-5 opacity-40" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <motion.div
                className="mt-3 p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-white/10"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-accent-500" />
                    <span className="text-xs font-medium">Password Strength</span>
                  </div>
                  <span className={`text-xs font-semibold ${Object.values(passwordRequirements).filter(Boolean).length <= 2
                    ? 'text-red-400'
                    : Object.values(passwordRequirements).filter(Boolean).length <= 4
                      ? 'text-yellow-400'
                      : 'text-green-400'
                    }`}>
                    {Object.values(passwordRequirements).filter(Boolean).length <= 2
                      ? 'Weak'
                      : Object.values(passwordRequirements).filter(Boolean).length <= 4
                        ? 'Good'
                        : 'Strong'}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden mb-3">
                  <motion.div
                    className={`h-full transition-all duration-300 ${Object.values(passwordRequirements).filter(Boolean).length <= 2
                      ? 'bg-red-500'
                      : Object.values(passwordRequirements).filter(Boolean).length <= 4
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                      }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(Object.values(passwordRequirements).filter(Boolean).length / 5) * 100}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`flex items-center gap-1.5 ${passwordRequirements.length ? 'text-green-400' : 'text-white/40'}`}>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>8+ characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordRequirements.uppercase ? 'text-green-400' : 'text-white/40'}`}>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Uppercase</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordRequirements.lowercase ? 'text-green-400' : 'text-white/40'}`}>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Lowercase</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordRequirements.number ? 'text-green-400' : 'text-white/40'}`}>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Number</span>
                  </div>
                  <div className={`flex items-center gap-1.5 col-span-2 ${passwordRequirements.special ? 'text-green-400' : 'text-white/40'}`}>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Special character</span>
                  </div>
                </div>
              </motion.div>
            )}
            {registerState.fieldErrors?.password && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-400 mt-2 flex items-start gap-1"
              >
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <span>{registerState.fieldErrors.password}</span>
              </motion.p>
            )}
          </motion.div>

          {/* Terms Agreement */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mb-6"
          >
            <label className="flex items-start gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-white/5 text-accent-500 focus:ring-accent-500/50"
              />
              <span className="text-sm opacity-70">
                I agree to the{' '}
                <button
                  type="button"
                  className="text-accent-500 hover:text-accent-400 transition-colors font-medium"
                  onClick={() => setShowTermsModal(true)}
                >
                  Terms of Service
                </button>
                {' '}and{' '}
                <button
                  type="button"
                  className="text-accent-500 hover:text-accent-400 transition-colors font-medium"
                  onClick={() => setShowPrivacyModal(true)}
                >
                  Privacy Policy
                </button>
              </span>
            </label>
            {registerState.fieldErrors?.terms && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-400 mt-2"
              >
                {registerState.fieldErrors.terms}
              </motion.p>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={registerState.state === 'loading' || !!registerState.fieldErrors?.name || !!registerState.fieldErrors?.email || !!registerState.fieldErrors?.password || !name.trim() || !email.trim() || !password.trim() || !agreeToTerms}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="w-full py-3.5 rounded-xl bg-accent-500 text-black font-semibold hover:bg-accent-400 transition-all flex items-center justify-center gap-2 shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {registerState.state === 'loading' ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full"
                />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>

          {/* Success State */}
          <AnimatePresence>
            {registerState.state === 'success' && (
              <motion.div
                className="mt-6 p-6 rounded-xl bg-green-500/10 border border-green-500/20 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-green-400 mb-2">Account Created!</h3>
                <p className="text-sm opacity-70">Welcome to On Tour. Redirecting you...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 pt-6 border-t border-white/10"
          >
            <div className="flex items-center justify-center gap-6 text-xs opacity-60">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-accent-500" />
                <span>Free forever</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-accent-500" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-accent-500" />
                <span>5 min setup</span>
              </div>
            </div>
          </motion.div>
        </motion.form>

        {/* Sign in link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900/50 text-slate-300 dark:text-white/50">
                Already have an account?
              </span>
            </div>
          </div>

          <Link
            to="/login"
            className="w-full py-3.5 rounded-xl border border-slate-300 dark:border-white/20 hover:border-accent-500/50 transition-all flex items-center justify-center gap-2 font-medium hover:bg-slate-100 dark:bg-white/5"
          >
            <span>Sign in to your account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <motion.div className="text-center mt-6">
            <Link
              to="/"
              className="text-sm text-slate-300 dark:text-white/50 hover:text-slate-600 dark:text-white/80 transition-colors inline-flex items-center gap-1"
            >
              ← Back to home
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Terms of Service Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowTermsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-900/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-8 border-b border-white/10">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Terms of Service</h2>
                <p className="text-slate-400 dark:text-white/60 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
              </div>

              <div className="p-8 overflow-y-auto max-h-[calc(80vh-180px)] prose prose-invert prose-sm">
                <h3 className="text-lg font-semibold text-white mb-3">1. Acceptance of Terms</h3>
                <p className="text-slate-500 dark:text-white/70 mb-4">
                  By accessing and using On Tour App, you accept and agree to be bound by these Terms of Service.
                  If you do not agree to these terms, please do not use our service.
                </p>

                <h3 className="text-lg font-semibold text-white mb-3">2. Use License</h3>
                <p className="text-slate-500 dark:text-white/70 mb-4">
                  We grant you a limited, non-exclusive, non-transferable license to use On Tour App for managing
                  your tour operations. This license does not include any resale or commercial use of our service.
                </p>

                <h3 className="text-lg font-semibold text-white mb-3">3. User Accounts</h3>
                <p className="text-slate-500 dark:text-white/70 mb-4">
                  You are responsible for maintaining the confidentiality of your account and password. You agree to
                  accept responsibility for all activities that occur under your account.
                </p>

                <h3 className="text-lg font-semibold text-white mb-3">4. Data Ownership</h3>
                <p className="text-slate-500 dark:text-white/70 mb-4">
                  You retain all rights to the data you input into On Tour App. We claim no intellectual property
                  rights over the content you provide. Your data remains yours.
                </p>

                <h3 className="text-lg font-semibold text-white mb-3">5. Service Availability</h3>
                <p className="text-slate-500 dark:text-white/70 mb-4">
                  We strive to maintain 99.9% uptime but do not guarantee uninterrupted access. We may perform
                  maintenance that temporarily suspends access to the service.
                </p>

                <h3 className="text-lg font-semibold text-white mb-3">6. Limitation of Liability</h3>
                <p className="text-slate-500 dark:text-white/70 mb-4">
                  On Tour App shall not be liable for any indirect, incidental, special, consequential or punitive
                  damages resulting from your use of or inability to use the service.
                </p>

                <h3 className="text-lg font-semibold text-white mb-3">7. Modifications to Terms</h3>
                <p className="text-slate-500 dark:text-white/70 mb-4">
                  We reserve the right to modify these terms at any time. We will notify users of any material changes
                  via email or through the application.
                </p>

                <h3 className="text-lg font-semibold text-white mb-3">8. Contact</h3>
                <p className="text-slate-500 dark:text-white/70">
                  For questions about these Terms, please contact us at legal@ontourapp.com
                </p>
              </div>

              <div className="p-6 border-t border-white/10">
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="w-full py-3 rounded-xl bg-accent-500 text-black font-semibold hover:bg-accent-400 transition-all"
                >
                  I Understand
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {showPrivacyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowPrivacyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-900/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-8 border-b border-white/10">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Privacy Policy</h2>
                <p className="text-slate-400 dark:text-white/60 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
              </div>

              <div className="p-8 overflow-y-auto max-h-[calc(80vh-180px)] prose prose-invert prose-sm">
                <h3 className="text-lg font-semibold text-white mb-3">1. Information We Collect</h3>
                <p className="text-slate-500 dark:text-white/70 mb-4">
                  We collect information you provide directly to us, including name, email address, and tour data.
                  We also automatically collect device information, log data, and usage statistics.
                </p>

                <h3 className="text-lg font-semibold text-white mb-3">2. How We Use Your Information</h3>
                <p className="text-slate-500 dark:text-white/70 mb-4">
                  We use your information to provide, maintain, and improve our services, to process transactions,
                  send technical notices, and respond to your requests.
                </p>

                <h3 className="text-lg font-semibold text-white mb-3">3. Data Security</h3>
                <p className="text-slate-500 dark:text-white/70 mb-4">
                  We implement industry-standard security measures to protect your data. All data is encrypted in
                  transit using TLS and at rest using AES-256 encryption.
                </p>

                <h3 className="text-lg font-semibold text-white mb-3">4. Data Sharing</h3>
                <p className="text-slate-500 dark:text-white/70 mb-4">
                  We do not sell your personal information. We may share data with service providers who assist in
                  operating our platform, subject to confidentiality agreements.
                </p>

                <h3 className="text-lg font-semibold text-white mb-3">5. Your Rights</h3>
                <p className="text-slate-500 dark:text-white/70 mb-4">
                  You have the right to access, correct, or delete your personal data. You can export your data at
                  any time through the application settings.
                </p>

                <h3 className="text-lg font-semibold text-white mb-3">6. Data Retention</h3>
                <p className="text-slate-500 dark:text-white/70 mb-4">
                  We retain your data for as long as your account is active. Upon account deletion, we will delete
                  your data within 30 days, except where required by law.
                </p>

                <h3 className="text-lg font-semibold text-white mb-3">7. Cookies and Tracking</h3>
                <p className="text-slate-500 dark:text-white/70 mb-4">
                  We use essential cookies for authentication and preferences. We use analytics to understand how
                  users interact with our service to improve user experience.
                </p>

                <h3 className="text-lg font-semibold text-white mb-3">8. GDPR Compliance</h3>
                <p className="text-slate-500 dark:text-white/70 mb-4">
                  For EU users, we comply with GDPR requirements. You have rights to data portability, erasure,
                  and restriction of processing. Contact our DPO at privacy@ontourapp.com
                </p>

                <h3 className="text-lg font-semibold text-white mb-3">9. Contact Us</h3>
                <p className="text-slate-500 dark:text-white/70">
                  For privacy-related questions, email us at privacy@ontourapp.com or write to our Data Protection
                  Officer at the address listed on our website.
                </p>
              </div>

              <div className="p-6 border-t border-white/10">
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="w-full py-3 rounded-xl bg-accent-500 text-black font-semibold hover:bg-accent-400 transition-all"
                >
                  I Understand
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Register;
