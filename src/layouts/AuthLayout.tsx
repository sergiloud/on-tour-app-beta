import React, { Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
const Login = React.lazy(() => import('../pages/Login'));
import DashboardLayout from '../layouts/DashboardLayout';
import { OrgProvider } from '../context/OrgContext';
import { isAuthed } from '../lib/demoAuth';
import { useNavigate } from 'react-router-dom';

interface AuthLayoutProps {
  children?: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [showLogin, setShowLogin] = React.useState(true);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  // Check authentication status
  React.useEffect(() => {
    const checkAuth = () => {
      try {
        // Check if user is actually authenticated using the demo auth system
        const authenticated = isAuthed();
        const hasStoredUser = localStorage.getItem('demo:lastUser');

        if (authenticated || hasStoredUser) {
          setIsAuthenticated(true);
          setShowLogin(false);
        } else {
          setIsAuthenticated(false);
          setShowLogin(true);
          // Redirect to login page if not authenticated
          navigate('/login', { replace: true });
        }
      } catch {
        setIsAuthenticated(false);
        setShowLogin(true);
        navigate('/login', { replace: true });
      }
    };

    checkAuth();

    // Listen for auth changes
    const handleAuthChange = () => checkAuth();
    window.addEventListener('storage', handleAuthChange);

    // Also listen for auth transition events
    const handleAuthTransition = (event: CustomEvent) => {
      if (event.detail?.type === 'loginSuccess') {
        checkAuth();
      }
    };
    window.addEventListener('authTransition', handleAuthTransition as EventListener);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('authTransition', handleAuthTransition as EventListener);
    };
  }, [userId, navigate]);

  // Handle login success transition
  React.useEffect(() => {
    const handleLoginSuccess = () => {
      setIsTransitioning(true);
      // Allow transition animation to complete (fast in dev, smooth in prod)
      const transitionDelay = import.meta.env.PROD ? 2000 : 200;
      setTimeout(() => {
        setIsAuthenticated(true);
        setShowLogin(false);
        setIsTransitioning(false);
      }, transitionDelay);
    };

    // Listen for custom login success event
    const handleCustomEvent = (event: CustomEvent) => {
      if (event.detail?.type === 'loginSuccess') {
        handleLoginSuccess();
      }
    };

    window.addEventListener('authTransition', handleCustomEvent as EventListener);

    return () => window.removeEventListener('authTransition', handleCustomEvent as EventListener);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-ink-950 text-ink-50">
      {/* Skip link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 bg-ink-800/95 backdrop-blur px-4 py-2 rounded-md shadow-lg focus:ring-2 focus:ring-accent-500/60"
      >Skip to main content</a>

      <AnimatePresence mode="wait">
        {showLogin ? (
          <Suspense key="login-suspense" fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-accent-500">Cargando...</div></div>}>
            <Login key="login" />
          </Suspense>
        ) : (
          <OrgProvider key="dashboard">
            {children}
          </OrgProvider>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthLayout;
