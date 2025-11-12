import { ReactNode, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TabBar, TabId } from './ios/TabBar';
import { getSafeTop, getSafeBottom } from '../../lib/safeArea';
import { pageTransitionsParallax } from '../../lib/transitions';
import { useSwipeBack } from '../../hooks/useSwipeBack';

interface MobileLayoutProps {
  children: ReactNode;
  /** Show tab bar (default: true) */
  showTabBar?: boolean;
  /** Custom background color */
  backgroundColor?: string;
  /** Enable swipe-back gesture (default: true) */
  enableSwipeBack?: boolean;
}

/**
 * Master layout for mobile apps
 * Includes: Tab Bar, Safe Areas, Page Transitions, Swipe-back
 * 
 * @example
 * ```tsx
 * <MobileLayout>
 *   <ShowsApp />
 * </MobileLayout>
 * ```
 */
export const MobileLayout = ({
  children,
  showTabBar = true,
  backgroundColor = 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800',
  enableSwipeBack = true,
}: MobileLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('home');

  // Map current route to active tab
  useEffect(() => {
    const path = location.pathname;
    
    if (path.includes('/dashboard/shows')) {
      setActiveTab('shows');
    } else if (path.includes('/dashboard/finance')) {
      setActiveTab('finance');
    } else if (path.includes('/dashboard/map') || path.includes('/dashboard/travel')) {
      setActiveTab('map');
    } else if (path.includes('/settings') || path.includes('/profile')) {
      setActiveTab('settings');
    } else if (path.includes('/dashboard')) {
      setActiveTab('home');
    }
  }, [location.pathname]);

  // Handle tab changes with navigation
  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    
    // Navigate to corresponding route
    const routes: Record<TabId, string> = {
      home: '/dashboard',
      shows: '/dashboard/shows',
      finance: '/dashboard/finance',
      map: '/dashboard/travel',
      settings: '/settings/profile',
    };
    
    navigate(routes[tabId]);
  };

  // Swipe-back gesture (navigate back in history)
  useSwipeBack({
    onSwipeBack: () => navigate(-1),
    enabled: enableSwipeBack,
  });

  return (
    <div 
      className={`fixed inset-0 ${backgroundColor} overflow-hidden`}
      style={{
        paddingTop: getSafeTop(),
        paddingBottom: showTabBar ? getSafeBottom() : 0,
      }}
    >
      {/* Main content with transitions */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          variants={pageTransitionsParallax}
          initial="initial"
          animate="animate"
          exit="exit"
          className="h-full w-full overflow-hidden"
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Tab Bar */}
      {showTabBar && (
        <div 
          className="fixed bottom-0 left-0 right-0 z-50"
          style={{ paddingBottom: getSafeBottom() }}
        >
          <TabBar 
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
      )}
    </div>
  );
};

/**
 * Lightweight wrapper for pages that need safe areas but no tab bar
 * (e.g., modals, full-screen views)
 */
export const SafeAreaContainer = ({
  children,
  className = '',
  backgroundColor = 'bg-transparent',
}: {
  children: ReactNode;
  className?: string;
  backgroundColor?: string;
}) => {
  return (
    <div 
      className={`${backgroundColor} ${className}`}
      style={{
        paddingTop: getSafeTop(),
        paddingBottom: getSafeBottom(),
      }}
    >
      {children}
    </div>
  );
};
