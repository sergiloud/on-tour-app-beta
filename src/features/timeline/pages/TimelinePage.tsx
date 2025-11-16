import React, { useEffect, Suspense } from 'react';
import { t } from '../../../lib/i18n';
import { useTimelineData, useTimelineSimulation } from '../hooks/useTimelineData';
import { Loader, AlertCircle, Calendar, Filter, Settings, Play, Square } from 'lucide-react';

// Lazy load heavy components
const MasterTimelineView = React.lazy(() => import('../components/MasterTimelineView'));
const TimelineFilters = React.lazy(() => import('../components/TimelineFilters'));
const SimulationControls = React.lazy(() => import('../components/SimulationControls'));

/**
 * Timeline Maestro v3.0 - Main Page
 * Unified view of all timeline entities with simulation capabilities
 */
export default function TimelinePage() {
  const { 
    items, 
    permissions, 
    loading, 
    error, 
    fetchTimeline 
  } = useTimelineData();

  const {
    isSimulationMode,
    hasChanges,
    enterSimulationMode,
    exitSimulationMode,
    commitSimulation,
    discardSimulation
  } = useTimelineSimulation();

  // Fetch timeline data on component mount
  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  // Handle loading state
  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-accent-500" />
          <p className="text-gray-600 dark:text-gray-400">
            {t('timelineMaestro.loading')}
          </p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('timelineMaestro.error.title')}
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          <button
            onClick={() => fetchTimeline()}
            className="w-full bg-accent-500 hover:bg-accent-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {t('timelineMaestro.error.retry')}
          </button>
        </div>
      </div>
    );
  }

  // Check permissions
  if (permissions && !permissions.canView) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('timelineMaestro.permissions.denied')}
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {t('timelineMaestro.permissions.message')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Title and Info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-accent-500" />
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t('timelineMaestro.title')}
                </h1>
              </div>
              
              {/* Version badge */}
              <span className="px-2 py-1 bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300 text-xs font-medium rounded">
                v3.0
              </span>
              
              {/* Simulation mode indicator */}
              {isSimulationMode && (
                <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-full">
                  <Play className="w-3 h-3" />
                  <span className="text-xs font-medium">
                    {t('timelineMaestro.simulation.active')}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Simulation Controls */}
              {permissions?.canSimulate && (
                <div className="flex items-center gap-2">
                  {!isSimulationMode ? (
                    <button
                      onClick={enterSimulationMode}
                      className="flex items-center gap-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      {t('timelineMaestro.simulation.enter')}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={commitSimulation}
                        disabled={!hasChanges}
                        className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                      >
                        {t('timelineMaestro.simulation.commit')}
                      </button>
                      <button
                        onClick={discardSimulation}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                      >
                        <Square className="w-4 h-4" />
                        {t('timelineMaestro.simulation.discard')}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* View Controls */}
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Filter className="w-5 h-5" />
              </button>
              
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
        {/* Sidebar - Filters */}
        <div className="w-full lg:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-4">
            <Suspense fallback={
              <div className="flex items-center justify-center py-8">
                <Loader className="w-6 h-6 animate-spin text-accent-500" />
              </div>
            }>
              <TimelineFilters />
            </Suspense>
          </div>
        </div>

        {/* Main Timeline View */}
        <div className="flex-1 overflow-hidden">
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-4">
                <Loader className="w-8 h-8 animate-spin text-accent-500" />
                <p className="text-gray-600 dark:text-gray-400">
                  {t('timelineMaestro.loading.timeline')}
                </p>
              </div>
            </div>
          }>
            <MasterTimelineView />
          </Suspense>
        </div>
      </div>

      {/* Simulation Controls Panel */}
      {isSimulationMode && (
        <div className="fixed bottom-4 right-4 z-50">
          <Suspense fallback={
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <Loader className="w-6 h-6 animate-spin text-accent-500" />
            </div>
          }>
            <SimulationControls />
          </Suspense>
        </div>
      )}
    </div>
  );
}