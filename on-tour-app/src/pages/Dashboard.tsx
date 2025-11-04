import React from 'react';
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
import { getCurrentOrgId } from '../lib/tenants';
import { showStore } from '../shared/showStore';
import type { Show } from '../lib/shows';

// Lazy imports para componentes del Mission Control
const InteractiveMap = React.lazy(() => import('../components/mission/InteractiveMap'));
const ActionHubPro = React.lazy(() => import('../components/dashboard/ActionHubPro'));
const TourAgenda = React.lazy(() => import('../components/dashboard/TourAgenda'));

// Loading fallback consistente y compacto
const LoadingCard: React.FC<{ height?: string }> = ({ height = 'h-48' }) => (
  <div className={`${height} glass rounded-lg border border-white/10 flex items-center justify-center`}>
    <div className="text-sm opacity-60">{t('common.loading') || 'Loading...'}</div>
  </div>
);

// Componente principal del Mission Control Dashboard con layout optimizado
const MissionControlDashboard: React.FC = () => {
  const [mapKey, setMapKey] = React.useState(0);
  const [showLegend, setShowLegend] = React.useState(true);

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
        {/* Dashboard Filters - Full Width */}
        <DashboardFilters />

        <motion.div
          className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-5"
          variants={staggerFast}
          initial="hidden"
          animate="visible"
        >
          {/* Mobile: Tour Agenda primero (más importante) */}
          <div className="lg:hidden">
            <motion.div variants={slideUp} className="gpu-accelerate">
              <ErrorBoundary fallback={<LoadingCard height="h-auto" />}>
                <React.Suspense fallback={<LoadingCard height="h-full" />}>
                  <TourAgenda />
                </React.Suspense>
              </ErrorBoundary>
            </motion.div>
          </div>

          {/* Columna Principal: Mapa + Action Hub */}
          <div className="lg:col-span-8 flex flex-col gap-4 lg:gap-5">
            {/* Mapa Interactivo - Más grande y prominente */}
            <motion.div
              variants={slideUp}
              className="group gpu-accelerate"
            >
              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-accent-500/5">
                {/* Map Header elegante */}
                <div className="relative px-6 pt-5 pb-4 border-b border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-6 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
                      <h2 className="text-lg font-semibold tracking-tight">
                        {t('dashboard.map.title') || 'Tour Map'}
                      </h2>
                    </div>
                    <div className="text-xs opacity-60 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Live
                    </div>
                  </div>
                </div>

                {/* Map Container */}
                <div className="relative">
                  <ErrorBoundary
                    fallback={
                      <div className="h-80 md:h-96 bg-gradient-to-br from-slate-800/50 to-slate-900/50 flex flex-col items-center justify-center gap-3">
                        <svg className="w-16 h-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <div className="text-sm opacity-70">{t('hud.mapLoadError') || 'Map failed to load'}</div>
                        <button
                          onClick={() => setMapKey(k => k + 1)}
                          className="px-4 py-2 rounded-lg bg-accent-500/20 hover:bg-accent-500/30 border border-accent-500/30 text-sm font-medium"
                        >
                          {t('common.retry') || 'Retry'}
                        </button>
                      </div>
                    }
                  >
                    <React.Suspense fallback={<LoadingCard height="h-80 md:h-96" />}>
                      <InteractiveMap key={mapKey} className="h-80 md:h-96 w-full" />
                    </React.Suspense>
                  </ErrorBoundary>

                  {/* Map Legend - Collapsible floating overlay */}
                  <motion.div
                    initial={false}
                    animate={{
                      width: showLegend ? 'auto' : '40px',
                      height: showLegend ? 'auto' : '40px'
                    }}
                    className="absolute bottom-4 left-4 backdrop-blur-md bg-slate-900/80 border border-white/20 rounded-xl shadow-xl overflow-hidden"
                  >
                    {showLegend ? (
                      <div className="px-4 py-3">
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="text-[10px] uppercase tracking-wider opacity-60 font-semibold">Status</div>
                          <button
                            onClick={() => setShowLegend(false)}
                            className="opacity-60 hover:opacity-100 transition-opacity"
                            aria-label="Hide legend"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2.5 group cursor-pointer">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-lg shadow-green-500/50 group-hover:scale-125 transition-transform" />
                            <span className="text-xs font-medium">Confirmed</span>
                          </div>
                          <div className="flex items-center gap-2.5 group cursor-pointer">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50 group-hover:scale-125 transition-transform" />
                            <span className="text-xs font-medium">Pending</span>
                          </div>
                          <div className="flex items-center gap-2.5 group cursor-pointer">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50 group-hover:scale-125 transition-transform" />
                            <span className="text-xs font-medium">Offer</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowLegend(true)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-white/10 transition-colors"
                        aria-label="Show legend"
                        title="Show Legend"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Action Hub - Debajo del mapa */}
            <motion.div variants={slideUp} className="gpu-accelerate">
              <ErrorBoundary fallback={<LoadingCard height="h-64" />}>
                <React.Suspense fallback={<LoadingCard height="h-64" />}>
                  <ActionHubPro />
                </React.Suspense>
              </ErrorBoundary>
            </motion.div>
          </div>

          {/* Columna Lateral: Tour Agenda (Desktop only - mobile ya lo muestra arriba) */}
          <div className="hidden lg:block lg:col-span-4">
            <motion.div variants={slideUp} className="gpu-accelerate">

              <ErrorBoundary fallback={<LoadingCard height="h-auto" />}>
                <React.Suspense fallback={<LoadingCard height="h-full" />}>
                  <TourAgenda />
                </React.Suspense>
              </ErrorBoundary>
            </motion.div>
          </div>
        </motion.div>
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
