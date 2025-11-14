import React, { useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { t } from '../lib/i18n';
import { trackPageView } from '../lib/activityTracker';
import { Card } from '../ui/Card';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { DashboardProvider } from '../context/DashboardContext';
import { DashboardFilters } from '../components/dashboard/DashboardFilters';
import { DashboardWithFAB } from '../components/dashboard/DashboardWithFAB';
import { staggerFast, slideUp, fadeIn } from '../lib/animations';
import { useAuth } from '../context/AuthContext';
import { useOrg } from '../context/OrgContext';
import { getCurrentOrgId } from '../lib/tenants';
import { showStore } from '../shared/showStore';
import type { Show } from '../lib/shows';
import { Building2, MapPin, Activity } from 'lucide-react';

// Lazy imports para componentes del Mission Control
// Priority loading: defer non-critical components
const InteractiveMap = React.lazy(() => import('../components/mission/InteractiveMap'));
const ActionHubPro = React.lazy(() => import('../components/dashboard/ActionHubPro'));
const TourAgenda = React.lazy(() => import('../components/dashboard/TourAgenda'));

// Loading fallback consistente y compacto - GPU optimized
const LoadingCard: React.FC<{ height?: string }> = ({ height = 'h-48' }) => (
  <div className={`${height} glass rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center will-animate`}>
    <div className="text-sm opacity-60 animate-pulse-fast">{t('common.loading') || 'Loading...'}</div>
  </div>
);

// Componente principal del Mission Control Dashboard con layout optimizado
// Progressive loading: critical content first (filters, agenda), defer secondary (map, action hub)
const MissionControlDashboard: React.FC = () => {
  const [mapKey, setMapKey] = React.useState(0);
  const [showLegend, setShowLegend] = React.useState(true);
  const { org } = useOrg();

  // Progressive loading state - render all components immediately
  const [showMap, setShowMap] = useState(true);
  const [showActionHub, setShowActionHub] = useState(true);

  const handleMapRetry = useCallback(() => {
    setMapKey(k => k + 1);
  }, []);

  const handleToggleLegend = useCallback(() => {
    setShowLegend(prev => !prev);
  }, []);

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent-500 focus:text-white focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>

      <div id="main-content" className="flex flex-col gap-4 lg:gap-5">
        {/* Dashboard Header with Organization Info */}
        {org && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl border border-theme backdrop-blur-sm overflow-hidden hover:border-theme-strong transition-all duration-300"
          >
            <div className="bg-gradient-to-r from-transparent via-interactive to-transparent px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-1 h-12 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-theme-heading">
                      Mission Control
                    </h1>
                    <div className="flex items-center gap-2 mt-1 text-xs text-theme-secondary">
                      <Building2 className="w-3.5 h-3.5" />
                      <span className="font-medium">{org.name}</span>
                      <span className="text-theme-muted">•</span>
                      <span className="capitalize">{org.type}</span>
                    </div>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-lg bg-interactive border border-theme flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-xs font-medium">Live Dashboard</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Dashboard Filters */}
        <DashboardFilters />

        {/* Remove stagger animation to prevent conflicts with child animations */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-5">
          {/* PRIORITY 2: Tour Agenda primero (mobile) - Critical above-the-fold content */}
          <div className="lg:hidden">
            <ErrorBoundary fallback={<LoadingCard height="h-auto" />}>
              <React.Suspense fallback={<LoadingCard height="h-full" />}>
                <TourAgenda />
              </React.Suspense>
            </ErrorBoundary>
          </div>

          {/* Columna Principal: Mapa + Action Hub */}
          <div className="lg:col-span-8 flex flex-col gap-4 lg:gap-5">
            {/* Tour Map */}
            <div className="group">
              {showMap ? (
                <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-sm transition-all duration-200 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-lg hover:shadow-accent-500/5">
                  {/* Map Header */}
                  <div className="relative px-6 pt-5 pb-4 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-6 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
                        <h2 className="text-lg font-semibold tracking-tight">
                          {t('dashboard.map.title') || 'Tour Map'}
                        </h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs text-slate-400 dark:text-white/60 font-medium">Live</span>
                      </div>
                    </div>
                  </div>

                  {/* Map Container */}
                  <div className="relative h-[600px]">
                  <ErrorBoundary
                    fallback={
                      <div className="h-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 flex flex-col items-center justify-center gap-3">
                        <MapPin className="w-16 h-16 text-slate-200 dark:text-white/30" />
                        <div className="text-sm text-slate-500 dark:text-white/70">{t('hud.mapLoadError') || 'Map failed to load'}</div>
                        <button
                          onClick={handleMapRetry}
                          className="px-4 py-2 rounded-lg bg-accent-500/20 hover:bg-accent-500/30 border border-accent-500/30 text-sm font-medium transition-all"
                        >
                          {t('common.retry') || 'Retry'}
                        </button>
                      </div>
                    }
                  >
                    <React.Suspense fallback={<LoadingCard height="h-full" />}>
                      <InteractiveMap key={mapKey} className="h-full w-full" />
                    </React.Suspense>
                  </ErrorBoundary>

                  {/* Map Legend - Refined floating overlay */}
                  <motion.div
                    initial={false}
                    animate={{
                      width: showLegend ? 'auto' : '40px',
                      height: showLegend ? 'auto' : '40px'
                    }}
                    className="absolute bottom-4 left-4 backdrop-blur-md bg-slate-900/90 border border-slate-300 dark:border-white/20 rounded-xl shadow-xl overflow-hidden"
                  >
                    {showLegend ? (
                      <div className="px-4 py-3">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/60 font-semibold">
                            Show Status
                          </div>
                          <button
                            onClick={handleToggleLegend}
                            className="text-slate-400 dark:text-white/60 hover:text-slate-700 dark:hover:text-white/90 transition-colors"
                            aria-label="Hide legend"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-2.5 group cursor-default">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium text-theme-primary">Confirmed</span>
                          </div>
                          <div className="flex items-center gap-2.5 group cursor-default">
                            <div className="w-3 h-3 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium text-theme-primary">Pending</span>
                          </div>
                          <div className="flex items-center gap-2.5 group cursor-default">
                            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium text-theme-primary">Offer</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={handleToggleLegend}
                        className="w-10 h-10 flex items-center justify-center hover:bg-interactive transition-colors"
                        aria-label="Show legend"
                        title="Show Legend"
                      >
                        <svg className="w-5 h-5 text-slate-500 dark:text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    )}
                  </motion.div>
                </div>
              </div>
              ) : (
                <LoadingCard height="h-80 md:h-96" />
              )}
            </div>

            {/* PRIORITY 4: Action Hub - Progressive loading (deferred 300ms) */}
            <div>
              {showActionHub ? (
                <ErrorBoundary fallback={<LoadingCard height="h-64" />}>
                  <React.Suspense fallback={<LoadingCard height="h-64" />}>
                    <ActionHubPro />
                  </React.Suspense>
                </ErrorBoundary>
              ) : (
                <LoadingCard height="h-64" />
              )}
            </div>
          </div>

          {/* Columna Lateral: Tour Agenda (Desktop only - mobile ya lo muestra arriba) */}
          <div className="hidden lg:block lg:col-span-4">
            <ErrorBoundary fallback={<LoadingCard height="h-auto" />}>
              <React.Suspense fallback={<LoadingCard height="h-full" />}>
                <TourAgenda />
              </React.Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </>
  );
};

export const DashboardOverview: React.FC = () => {
  // Activity tracking
  React.useEffect(() => {
    trackPageView('dashboard');
  }, []);

  return (
    <DashboardProvider>
      <DashboardWithFAB>
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-4 md:py-6">
          {/* Mission Control Dashboard - Sin header redundante */}
          <MissionControlDashboard />
        </div>
      </DashboardWithFAB>
    </DashboardProvider>
  );
};

export default DashboardOverview;
