import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { t } from '../lib/i18n';
import { ORG_AGENCY_SHALIZI, ORG_ARTIST_DANNY, ORG_ARTIST_DANNY_V2, ORG_ARTIST_PROPHECY, setCurrentOrgId } from '../lib/tenants';
import { trackEvent, Events } from '../lib/telemetry';
import { setAuthed } from '../lib/demoAuth';
import { loadDemoData } from '../lib/demoDataset';
import { loadDemoExpenses } from '../lib/expenses';
import { loadDemoAgencies } from '../lib/agencies';
import { loadProphecyData } from '../lib/prophecyDataset';
import { loadProphecyContacts } from '../lib/prophecyContactsDataset';
import { DashboardTeaser } from '../components/home/DashboardTeaser';
import { Button } from '../ui/Button';
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle, Zap, Chrome, Apple } from 'lucide-react';
import { secureStorage } from '../lib/secureStorage';
import * as authService from '../services/authService';
import { isFirebaseConfigured } from '../lib/firebase';

// Animation timing - fast in development, full experience in production
const ANIMATION_DELAYS = {
  ssoSimulation: import.meta.env.PROD ? 1200 : 100,
  demoSimulation: import.meta.env.PROD ? 800 : 100,
  fluidTransition: import.meta.env.PROD ? 800 : 100,
  authTransition: import.meta.env.PROD ? 2500 : 200,
  navigationDelay: import.meta.env.PROD ? 3000 : 300,
};

// Estados finitos para login
type LoginState = 'idle' | 'loading' | 'error' | 'success' | 'transitioning' | 'fluidTransition';

interface LoginStateData {
  state: LoginState;
  error?: string;
  userData?: { userId: string; orgId: string; displayName: string };
}

type LoginAction =
  | { type: 'START_LOADING' }
  | { type: 'SET_SUCCESS'; payload: { userId: string; orgId: string; displayName: string } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'START_TRANSITION' }
  | { type: 'START_FLUID_TRANSITION' }
  | { type: 'RESET' };

const loginReducer = (state: LoginStateData, action: LoginAction): LoginStateData => {
  switch (action.type) {
    case 'START_LOADING':
      return { state: 'loading' };
    case 'SET_SUCCESS':
      return { state: 'success', userData: action.payload };
    case 'SET_ERROR':
      return { state: 'error', error: action.payload };
    case 'START_TRANSITION':
      return { ...state, state: 'transitioning' };
    case 'START_FLUID_TRANSITION':
      return { ...state, state: 'fluidTransition' };
    case 'RESET':
    default:
      return state;
  }
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showForgotPassword, setShowForgotPassword] = React.useState(false);
  const [resetEmail, setResetEmail] = React.useState('');
  const [resetState, setResetState] = React.useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [resetError, setResetError] = React.useState('');
  const location = useLocation();
  const { setUserId, updateProfile } = useAuth();

  // Form state
  const [usernameOrEmail, setUsernameOrEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [remember, setRemember] = React.useState(false);

  // Validation state
  const [fieldErrors, setFieldErrors] = React.useState<{ usernameOrEmail?: string; password?: string }>({});
  const [touched, setTouched] = React.useState<{ usernameOrEmail?: boolean; password?: boolean }>({});

  // Finite state machine for login
  const [loginState, dispatch] = React.useReducer(loginReducer, { state: 'idle' });

  // Demo users map (email and username-based)
  const usersMap = React.useMemo(() => ({
    // Email-based users
    'agency@demo.com': { userId: 'user_agency', orgId: ORG_AGENCY_SHALIZI, displayName: 'Agency User' },
    'artist@demo.com': { userId: 'user_artist', orgId: ORG_ARTIST_DANNY, displayName: 'Artist User' },
    'demo@demo.com': { userId: 'user_demo', orgId: ORG_AGENCY_SHALIZI, displayName: 'Demo User' },
    // Real users
    'danny@djdannyavila.com': { userId: 'danny_avila', orgId: ORG_ARTIST_DANNY, displayName: 'Danny Avila' },
    'booking@prophecyofficial.com': { userId: 'user_prophecy', orgId: ORG_ARTIST_PROPHECY, displayName: 'Prophecy' },
    // Username-based users
    'agency': { userId: 'user_agency', orgId: ORG_AGENCY_SHALIZI, displayName: 'Agency User' },
    'artist': { userId: 'user_artist', orgId: ORG_ARTIST_DANNY, displayName: 'Artist User' },
    'demo': { userId: 'user_demo', orgId: ORG_AGENCY_SHALIZI, displayName: 'Demo User' }
  }), []);

  // Generic SSO handler - uses Firebase if configured
  const handleSSOLogin = React.useCallback(async (provider: 'google' | 'apple' | 'microsoft') => {
    if (loginState.state === 'loading') return;

    dispatch({ type: 'START_LOADING' });
    try { trackEvent(`login.sso.${provider}`, {}); } catch { }

    try {
      // Try Firebase SSO if configured
      if (isFirebaseConfigured() && (provider === 'google' || provider === 'apple')) {
        let authUser;

        if (provider === 'google') {
          authUser = await authService.signInWithGoogle();
        } else if (provider === 'apple') {
          authUser = await authService.signInWithApple();
        }

        if (authUser) {
          const defaultOrg = ORG_AGENCY_SHALIZI;

          setUserId(authUser.uid);
          updateProfile?.({
            id: authUser.uid,
            name: authUser.displayName || authUser.email || 'User',
            email: authUser.email || '',
            defaultOrgId: defaultOrg
          });
          setCurrentOrgId(defaultOrg);
          secureStorage.setItem('demo:lastUser', authUser.uid);
          secureStorage.setItem('demo:lastOrg', defaultOrg);

          trackEvent(`login.sso.success.${provider}`, { userId: authUser.uid });

          dispatch({ type: 'SET_SUCCESS', payload: {
            userId: authUser.uid,
            orgId: defaultOrg,
            displayName: authUser.displayName || authUser.email || 'User'
          }});

          setTimeout(() => {
            dispatch({ type: 'START_FLUID_TRANSITION' });
          }, ANIMATION_DELAYS.fluidTransition);

          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('authTransition', { detail: { type: 'loginSuccess' } }));
          }, ANIMATION_DELAYS.authTransition);

          return;
        }
      }

      // Fallback to demo SSO
      await new Promise(resolve => setTimeout(resolve, ANIMATION_DELAYS.ssoSimulation));

      // Map provider to demo user
      const userKey = {
        google: 'agency@demo.com' as const,
        apple: 'artist@demo.com' as const,
        microsoft: 'demo@demo.com' as const
      }[provider];

      const user = usersMap[userKey];
      setUserId(user.userId);
      updateProfile?.({ id: user.userId, defaultOrgId: user.orgId });
      setCurrentOrgId(user.orgId);
      setAuthed(true);
      secureStorage.setItem('demo:lastUser', user.userId);
      secureStorage.setItem('demo:lastOrg', user.orgId);
      trackEvent('login.sso.success', { provider, userId: user.userId });
      Events.loginSelect(user.userId, user.orgId);

      dispatch({ type: 'SET_SUCCESS', payload: user });

      setTimeout(() => {
        dispatch({ type: 'START_FLUID_TRANSITION' });
      }, ANIMATION_DELAYS.fluidTransition);

      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('authTransition', { detail: { type: 'loginSuccess' } }));
      }, ANIMATION_DELAYS.authTransition);
    } catch (error: any) {
      console.error('SSO error:', error);
      let errorMessage = `${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-in failed. Please try again.`;

      if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Pop-up blocked. Please allow pop-ups for this site and try again.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in cancelled. Please try again.';
      }

      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      trackEvent(`login.sso.error.${provider}`, { code: error.code });
    }
  }, [loginState.state, setUserId, updateProfile, usersMap]);

  // SSO handlers
  const handleGoogleLogin = React.useCallback(() => handleSSOLogin('google'), [handleSSOLogin]);
  const handleAppleLogin = React.useCallback(() => handleSSOLogin('apple'), [handleSSOLogin]);
  const handleMicrosoftLogin = React.useCallback(() => handleSSOLogin('microsoft'), [handleSSOLogin]);

  // Demo login handler for Danny Avila
  const handleDannyAvilaLogin = React.useCallback(async () => {
    if (loginState.state === 'loading') return;

    dispatch({ type: 'START_LOADING' });
    try { trackEvent('login.demo.danny_avila', {}); } catch { }

    // Simulate network delay for better UX (fast in dev, realistic in prod)
    await new Promise(resolve => setTimeout(resolve, ANIMATION_DELAYS.demoSimulation));

    const user = usersMap['artist@demo.com'];
    try {
      setUserId(user.userId);
      updateProfile?.({ id: user.userId, defaultOrgId: user.orgId });
      setCurrentOrgId(user.orgId);
      setAuthed(true);
      secureStorage.setItem('demo:lastUser', user.userId);
      secureStorage.setItem('demo:lastOrg', user.orgId);
      trackEvent('login.demo.success', { userId: user.userId, orgId: user.orgId });
      Events.loginSelect(user.userId, user.orgId);

      // Load demo data for Danny Avila
            const expensesResult = await loadDemoExpenses();
      const agenciesResult = await loadDemoAgencies();
    } catch { }

    dispatch({ type: 'SET_SUCCESS', payload: user });

    setTimeout(() => {
      dispatch({ type: 'START_FLUID_TRANSITION' });
    }, ANIMATION_DELAYS.fluidTransition);

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('authTransition', { detail: { type: 'loginSuccess' } }));
    }, ANIMATION_DELAYS.authTransition);

    // Navigate to dashboard after login (fast in dev, smooth in prod)
    setTimeout(() => {
      navigate('/dashboard');
    }, ANIMATION_DELAYS.navigationDelay);
  }, [loginState.state, setUserId, updateProfile, usersMap, navigate]);

  // Demo login handler for Danny Avila 2 (HTML Import Version)
  const handleDannyAvila2Login = React.useCallback(async () => {
    if (loginState.state === 'loading') return;

    dispatch({ type: 'START_LOADING' });
    try { trackEvent('login.demo.danny_avila_v2', {}); } catch { }

    // Simulate network delay for better UX (fast in dev, realistic in prod)
    await new Promise(resolve => setTimeout(resolve, ANIMATION_DELAYS.demoSimulation));

    const user = { userId: 'user_danny_v2', orgId: ORG_ARTIST_DANNY_V2, displayName: 'Danny Avila 2' };
    try {
      setUserId(user.userId);
      updateProfile?.({ id: user.userId, defaultOrgId: user.orgId });
      setCurrentOrgId(user.orgId);
      setAuthed(true);
      secureStorage.setItem('demo:lastUser', user.userId);
      secureStorage.setItem('demo:lastOrg', user.orgId);
      trackEvent('login.demo.success', { userId: user.userId, orgId: user.orgId });
      Events.loginSelect(user.userId, user.orgId);

      // NOTE: No carga demo data - será importado desde HTML

    } catch { }

    dispatch({ type: 'SET_SUCCESS', payload: user });

    setTimeout(() => {
      dispatch({ type: 'START_FLUID_TRANSITION' });
    }, ANIMATION_DELAYS.fluidTransition);

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('authTransition', { detail: { type: 'loginSuccess' } }));
    }, ANIMATION_DELAYS.authTransition);

    // Navigate to dashboard after login (fast in dev, smooth in prod)
    setTimeout(() => {
      navigate('/dashboard');
    }, ANIMATION_DELAYS.navigationDelay);
  }, [loginState.state, setUserId, updateProfile, navigate]);

  // Demo login handler for Prophecy (Empty/Clean Version)
  const handleProphecyLogin = React.useCallback(async () => {
    if (loginState.state === 'loading') return;

    dispatch({ type: 'START_LOADING' });
    try { trackEvent('login.demo.prophecy', {}); } catch { }

    // Simulate network delay for better UX (fast in dev, realistic in prod)
    await new Promise(resolve => setTimeout(resolve, ANIMATION_DELAYS.demoSimulation));

    const user = { userId: 'user_prophecy', orgId: ORG_ARTIST_PROPHECY, displayName: 'Prophecy' };
    try {
      setUserId(user.userId);
      updateProfile?.({ id: user.userId, defaultOrgId: user.orgId });
      setCurrentOrgId(user.orgId);
      setAuthed(true);
      secureStorage.setItem('demo:lastUser', user.userId);
      secureStorage.setItem('demo:lastOrg', user.orgId);
      trackEvent('login.demo.success', { userId: user.userId, orgId: user.orgId });
      Events.loginSelect(user.userId, user.orgId);

      // Load Prophecy demo data
      const showsResult = loadProphecyData();

      // Load Prophecy CRM contacts
      const contactsResult = loadProphecyContacts();
    } catch { }

    dispatch({ type: 'SET_SUCCESS', payload: user });

    setTimeout(() => {
      dispatch({ type: 'START_FLUID_TRANSITION' });
    }, ANIMATION_DELAYS.fluidTransition);

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('authTransition', { detail: { type: 'loginSuccess' } }));
    }, ANIMATION_DELAYS.authTransition);

    // Navigate to dashboard after login (fast in dev, smooth in prod)
    setTimeout(() => {
      navigate('/dashboard');
    }, ANIMATION_DELAYS.navigationDelay);
  }, [loginState.state, setUserId, updateProfile, navigate]);

  // Input sanitization
  const sanitizeInput = React.useCallback((value: string) => {
    return value.trim().replace(/[<>]/g, ''); // Basic XSS prevention
  }, []);

  // Enhanced validation functions
  const validateUsernameOrEmail = React.useCallback((value: string) => {
    const sanitized = sanitizeInput(value);
    if (!sanitized) return 'Username or email is required';
    if (sanitized.length > 254) return 'Username or email is too long';

    // Check if it's an email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(sanitized);

    // Check if it's a valid username (alphanumeric, underscore, dash, 3-20 chars)
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    const isUsername = usernameRegex.test(sanitized);

    if (!isEmail && !isUsername) {
      return 'Please enter a valid email address or username (3-20 characters, letters, numbers, underscore, or dash)';
    }
    return '';
  }, [sanitizeInput]);

  const validatePassword = React.useCallback((value: string) => {
    const sanitized = sanitizeInput(value);
    if (!sanitized) return 'Password is required';
    if (sanitized.length < 6) return 'Password must be at least 6 characters';
    if (sanitized.length > 128) return 'Password is too long';
    return '';
  }, [sanitizeInput]);

  // Check if form is valid
  const isFormValid = React.useMemo(() => {
    return usernameOrEmail.trim() && password.trim() && !fieldErrors.usernameOrEmail && !fieldErrors.password;
  }, [usernameOrEmail, password, fieldErrors]);

  // Field change handlers with validation
  const handleUsernameOrEmailChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeInput(e.target.value);
    setUsernameOrEmail(sanitizedValue);

    if (touched.usernameOrEmail) {
      const error = validateUsernameOrEmail(sanitizedValue);
      setFieldErrors(prev => ({ ...prev, usernameOrEmail: error }));
    }
  }, [touched.usernameOrEmail, validateUsernameOrEmail, sanitizeInput]);

  const handleUsernameOrEmailBlur = React.useCallback(() => {
    setTouched(prev => ({ ...prev, usernameOrEmail: true }));
    const error = validateUsernameOrEmail(usernameOrEmail);
    setFieldErrors(prev => ({ ...prev, usernameOrEmail: error }));
  }, [usernameOrEmail, validateUsernameOrEmail]);

  const handlePasswordChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeInput(e.target.value);
    setPassword(sanitizedValue);

    if (touched.password) {
      const error = validatePassword(sanitizedValue);
      setFieldErrors(prev => ({ ...prev, password: error }));
    }
  }, [touched.password, validatePassword, sanitizeInput]);

  const handlePasswordBlur = React.useCallback(() => {
    setTouched(prev => ({ ...prev, password: true }));
    const error = validatePassword(password);
    setFieldErrors(prev => ({ ...prev, password: error }));
  }, [password, validatePassword]);

  // Submit handler - uses Firebase if configured, falls back to demo
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginState.state === 'loading') return; // Prevent multiple submissions

    const u = (usernameOrEmail || '').trim().toLowerCase();
    const p = password;
    const rec = remember;

    console.log('[LOGIN] Starting login process...', { email: u, hasPassword: !!p, isFirebaseConfigured: isFirebaseConfigured() });

    dispatch({ type: 'START_LOADING' });

    try { trackEvent('login.submit', { u }); } catch { }

    // Validate all fields before submission
    const usernameOrEmailError = validateUsernameOrEmail(u);
    const passwordError = validatePassword(p);

    if (usernameOrEmailError || passwordError) {
      console.log('[LOGIN] Validation errors:', { usernameOrEmailError, passwordError });
      setFieldErrors({ usernameOrEmail: usernameOrEmailError, password: passwordError });
      setTouched({ usernameOrEmail: true, password: true });
      dispatch({ type: 'SET_ERROR', payload: usernameOrEmailError || passwordError || '' });
      return;
    }

    // Enhanced error messages
    if (!u) {
      dispatch({ type: 'SET_ERROR', payload: 'Please enter your username or email address to continue.' });
      return;
    }
    if (!p) {
      dispatch({ type: 'SET_ERROR', payload: 'Please enter your password to continue.' });
      return;
    }

    try {
      // Try Firebase authentication first if configured
      if (isFirebaseConfigured()) {
        console.log('[LOGIN] Attempting Firebase login...');
        try {
          const authUser = await authService.signIn(u, p);
          console.log('[LOGIN] Firebase login successful:', { uid: authUser.uid, email: authUser.email });

          // Determine default org based on email
          let defaultOrg = ORG_AGENCY_SHALIZI;
          if (authUser.email === 'booking@prophecyofficial.com') {
            defaultOrg = ORG_ARTIST_PROPHECY;
          } else if (authUser.email === 'danny@djdannyavila.com') {
            defaultOrg = ORG_ARTIST_DANNY;
          }

          // Load user profile from Firestore
          let userProfile = null;
          try {
            const { FirestoreUserService } = await import('../services/firestoreUserService');
            const userData = await FirestoreUserService.getUserData(authUser.uid);
            if (userData) {
              userProfile = userData.profile;
              // Update local preferences if available
              if (userData.preferences) {
                // Apply user preferences (theme, language, etc.)
                if (userData.preferences.language) {
                  const { setLang } = await import('../lib/i18n');
                  setLang(userData.preferences.language);
                }
              }
            }
          } catch (e) {
            console.warn('Could not load user profile from Firestore:', e);
          }

          const finalOrgId = userProfile?.defaultOrgId || defaultOrg;

          setUserId(authUser.uid);
          updateProfile?.({
            id: authUser.uid,
            name: userProfile?.name || authUser.displayName || authUser.email || 'User',
            email: authUser.email || '',
            bio: userProfile?.bio,
            avatarUrl: userProfile?.avatarUrl,
            defaultOrgId: finalOrgId
          });
          setCurrentOrgId(finalOrgId);

          // Load demo data based on email
          if (authUser.email === 'booking@prophecyofficial.com') {
            console.log('[LOGIN] Loading Prophecy data...');
            // Load data asynchronously but don't wait (will complete in background)
            loadProphecyData().then(result => {
              console.log(`[LOGIN] Prophecy shows loaded: ${result.added}/${result.total}`);
            }).catch(err => {
              console.error('[LOGIN] Failed to load Prophecy shows:', err);
            });
            loadProphecyContacts().then(result => {
              console.log(`[LOGIN] Prophecy contacts loaded: ${result.added}/${result.total}`);
            }).catch(err => {
              console.error('[LOGIN] Failed to load Prophecy contacts:', err);
            });
          } else if (authUser.email === 'danny@djdannyavila.com') {
            console.log('[LOGIN] Loading Danny Avila data...');
            loadDemoData();
            loadDemoExpenses();
            loadDemoAgencies();
          }

          if (rec) secureStorage.setItem('demo:authed', '1');
          secureStorage.setItem('demo:lastUser', authUser.uid);
          secureStorage.setItem('demo:lastOrg', finalOrgId);

          trackEvent('login.success.firebase', { userId: authUser.uid });

          dispatch({ type: 'SET_SUCCESS', payload: {
            userId: authUser.uid,
            orgId: finalOrgId,
            displayName: userProfile?.name || authUser.displayName || authUser.email || 'User'
          }});

          // Start fluid transition
          setTimeout(() => {
            dispatch({ type: 'START_FLUID_TRANSITION' });
          }, ANIMATION_DELAYS.fluidTransition);

          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('authTransition', { detail: { type: 'loginSuccess' } }));
          }, ANIMATION_DELAYS.authTransition);

          // Navigate to dashboard after login (fast in dev, smooth in prod)
          setTimeout(() => {
            navigate('/dashboard');
          }, ANIMATION_DELAYS.navigationDelay);

          return;
        } catch (firebaseError: any) {
          // Firebase auth failed - show appropriate error
          console.log('[LOGIN] Firebase auth error:', firebaseError);
          let errorMessage = 'Login failed. Please check your credentials.';

          if (firebaseError.code === 'auth/user-not-found') {
            errorMessage = "We don't recognize this email address. Don't have an account? Sign up instead.";
          } else if (firebaseError.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect password. Please try again or reset your password.';
          } else if (firebaseError.code === 'auth/invalid-email') {
            errorMessage = 'Please enter a valid email address.';
          } else if (firebaseError.code === 'auth/too-many-requests') {
            errorMessage = 'Too many failed login attempts. Please try again later.';
          } else if (firebaseError.code === 'auth/invalid-credential') {
            errorMessage = 'Invalid credentials. Please check your email and password.';
          }

          dispatch({ type: 'SET_ERROR', payload: errorMessage });
          trackEvent('login.error.firebase', { code: firebaseError.code });
          return;
        }
      }

      // Fallback to demo authentication if Firebase not configured
      console.log('[LOGIN] Using demo authentication fallback...');
      await new Promise(resolve => setTimeout(resolve, 800));

      const match = (usersMap as any)[u] as { userId: string; orgId: string; displayName: string } | undefined;

      // Password validation: demo users use username as password, real users have specific passwords
      const passwordMap: Record<string, string> = {
        'danny@djdannyavila.com': 'Indahouse69!',
        'booking@prophecyofficial.com': 'Casillas123!'
      };

      console.log('[LOGIN] Demo fallback - checking credentials...', { 
        email: u, 
        hasMatch: !!match,
        expectedPassword: passwordMap[u],
        providedPassword: p,
        passwordsMatch: passwordMap[u] === p
      });

      const isValidPassword = match && (
        (passwordMap[u] && p === passwordMap[u]) || // Real user with specific password
        (!passwordMap[u] && p === u) // Demo user with username as password
      );

      if (!match || !isValidPassword) {
        // Provide specific error messages based on the situation
        console.log('[LOGIN] Demo auth failed:', { hasMatch: !!match, isValidPassword });
        if (!match) {
          dispatch({ type: 'SET_ERROR', payload: "We don't recognize this email address. Don't have an account? Sign up instead." });
        } else {
          dispatch({ type: 'SET_ERROR', payload: 'Incorrect password. Please try again or reset your password.' });
        }
        try { trackEvent('login.error', { u }); } catch { }
        return;
      }

      console.log('[LOGIN] Demo auth successful, setting user...', match);

      setUserId(match.userId);
      updateProfile?.({ id: match.userId, defaultOrgId: match.orgId });
      setCurrentOrgId(match.orgId);
      setAuthed(true);
      if (rec) secureStorage.setItem('demo:authed', '1');
      secureStorage.setItem('demo:lastUser', match.userId);
      secureStorage.setItem('demo:lastOrg', match.orgId);
      trackEvent('login.success', { userId: match.userId, orgId: match.orgId });
      Events.loginSelect(match.userId, match.orgId);

      // Load demo data for Danny Avila
      if (match.userId === 'danny_avila') {
        loadDemoData();
        loadDemoExpenses();
        const agenciesResult = loadDemoAgencies();
      }

      // Load Prophecy data for Prophecy user
      if (match.userId === 'user_prophecy') {
        loadProphecyData();
        loadProphecyContacts();
      }

      // Show success state briefly
      dispatch({ type: 'SET_SUCCESS', payload: match });

      // Start fluid transition: form fades out, teaser expands
      setTimeout(() => {
        dispatch({ type: 'START_FLUID_TRANSITION' });
      }, 1000);

      // Complete transition and navigate
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('authTransition', { detail: { type: 'loginSuccess' } }));
      }, 2500);

    } catch (error) {
      console.error('Login error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'An unexpected error occurred. Please try again.' });
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

      {/* Floating elements for depth */}
      <motion.div
        className="absolute top-20 left-10 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand */}
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
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm"
          >
            Welcome back! Let's get you organized.
          </motion.p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass p-8 rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl"
          style={{
            boxShadow: '0 0 60px rgba(0, 0, 0, 0.3), 0 0 100px rgba(191, 255, 0, 0.1)'
          }}
        >
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-2xl font-bold mb-6 text-center"
          >
            Sign in to your account
          </motion.h1>

          {/* Error Alert */}
          {loginState.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-200">{loginState.error}</p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <label htmlFor="usernameOrEmail" className="block text-sm font-medium mb-2">
                {t('login.usernameOrEmail') || 'Email or Username'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 opacity-40" />
                </div>
                <input
                  id="usernameOrEmail"
                  type="text"
                  value={usernameOrEmail}
                  onChange={handleUsernameOrEmailChange}
                  onBlur={handleUsernameOrEmailBlur}
                  required
                  autoComplete="username"
                  autoFocus
                  placeholder="you@example.com or username"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all outline-none"
                />
              </div>
              {fieldErrors.usernameOrEmail && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-400 mt-2 flex items-start gap-1"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{fieldErrors.usernameOrEmail}</span>
                </motion.p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                {t('login.password') || 'Password'}
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
                  onBlur={handlePasswordBlur}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:opacity-70 transition-opacity"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 opacity-40" />
                  ) : (
                    <Eye className="w-5 h-5 opacity-40" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-400 mt-2 flex items-start gap-1"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{fieldErrors.password}</span>
                </motion.p>
              )}
            </motion.div>            {/* Remember & Forgot */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex items-center justify-between text-sm"
            >
              <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-white/5 text-accent-500 focus:ring-accent-500/50"
                />
                <span className="opacity-70">{t('login.remember') || 'Remember me'}</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-accent-500 hover:text-accent-400 transition-colors font-medium"
              >
                Forgot password?
              </button>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <motion.button
                type="submit"
                disabled={loginState.state === 'loading' || !!fieldErrors.usernameOrEmail || !!fieldErrors.password || !usernameOrEmail.trim() || !password.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-xl bg-accent-500 text-black font-semibold hover:bg-accent-400 transition-all flex items-center justify-center gap-2 shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginState.state === 'loading' ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full"
                    />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </motion.div>

            {/* Divider "Or continue with" */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.75 }}
              className="relative my-6"
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-slate-900/50 text-slate-300 dark:text-white/50 uppercase tracking-wider">
                  Or continue with
                </span>
              </div>
            </motion.div>

            {/* SSO Buttons - Simplified */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="grid grid-cols-2 gap-3 mb-6"
            >
              {/* Google */}
              <motion.button
                onClick={handleGoogleLogin}
                disabled={loginState.state === 'loading'}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-gray-50 text-gray-900 font-medium border border-gray-200 transition-all disabled:opacity-50"
              >
                <Chrome className="w-5 h-5" />
                <span>Google</span>
              </motion.button>

              {/* Apple */}
              <motion.button
                onClick={handleAppleLogin}
                disabled={loginState.state === 'loading'}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-black hover:bg-gray-900 text-white font-medium border border-gray-700 transition-all disabled:opacity-50"
              >
                <Apple className="w-5 h-5" />
                <span>Apple</span>
              </motion.button>
            </motion.div>

          </form>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="relative my-8"
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900/50 text-slate-300 dark:text-white/50">
                Don't have an account?
              </span>
            </div>
          </motion.div>

          {/* Sign Up Link */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <Link
              to="/register"
              className="w-full py-3.5 rounded-xl border border-slate-300 dark:border-white/20 hover:border-accent-500/50 transition-all flex items-center justify-center gap-2 font-medium hover:bg-slate-100 dark:bg-white/5"
            >
              <span>Create free account</span>
              <Zap className="w-4 h-4 text-accent-500" />
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
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
        </motion.div>

        {/* Back to home link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="text-center mt-6"
        >
          <Link
            to="/"
            className="text-sm text-slate-300 dark:text-white/50 hover:text-slate-600 dark:text-white/80 transition-colors inline-flex items-center gap-1"
          >
            ← Back to home
          </Link>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => {
              if (resetState !== 'sending') {
                setShowForgotPassword(false);
                setResetState('idle');
                setResetEmail('');
                setResetError('');
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-900/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl max-w-md w-full p-8 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {resetState !== 'sent' ? (
                <>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Reset Password</h2>
                  <p className="text-slate-400 dark:text-white/60 mb-6">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-500 dark:text-white/70 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-white/40" />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={e => {
                          setResetEmail(e.target.value);
                          setResetError('');
                        }}
                        placeholder="your@email.com"
                        className="w-full pl-11 pr-4 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-white placeholder:text-slate-400 dark:placeholder:text-slate-300 dark:text-white/30 focus:outline-none focus:border-accent-500/50 focus:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 transition-all"
                        disabled={resetState === 'sending'}
                      />
                    </div>
                    {resetError && (
                      <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {resetError}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setResetState('idle');
                        setResetEmail('');
                        setResetError('');
                      }}
                      disabled={resetState === 'sending'}
                      className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-white font-medium hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!resetEmail.trim()) {
                          setResetError('Please enter your email address');
                          return;
                        }
                        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
                          setResetError('Please enter a valid email address');
                          return;
                        }

                        setResetState('sending');

                        // Simulate API call (replace with real backend call)
                        await new Promise(resolve => setTimeout(resolve, 1500));

                        try {
                          trackEvent('auth.password_reset.request', { email: resetEmail });
                        } catch { }

                        setResetState('sent');
                      }}
                      disabled={resetState === 'sending' || !resetEmail.trim()}
                      className="flex-1 py-3 rounded-xl bg-accent-500 text-black font-semibold hover:bg-accent-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resetState === 'sending' ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full"
                          />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Reset Link</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="w-16 h-16 rounded-full bg-accent-500/20 border-2 border-accent-500 flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle className="w-8 h-8 text-accent-500" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Check Your Email</h2>
                    <p className="text-slate-400 dark:text-white/60 mb-6">
                      We've sent a password reset link to <strong className="text-slate-900 dark:text-white">{resetEmail}</strong>
                    </p>
                    <p className="text-sm text-slate-300 dark:text-white/50 mb-8">
                      Didn't receive the email? Check your spam folder or try again.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetState('idle');
                      setResetEmail('');
                      setResetError('');
                    }}
                    className="w-full py-3 rounded-xl bg-accent-500 text-black font-semibold hover:bg-accent-400 transition-all"
                  >
                    Got it
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
