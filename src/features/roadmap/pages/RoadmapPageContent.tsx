/**
 * Roadmap Main Page - Roadmap Feature Entry Point
 * 
 * Página principal que integra todos los componentes del roadmap
 * con navegación, stores, y lazy loading.
 */

import React, { useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar,
  BarChart3,
  Users,
  Settings,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { RoadmapView } from '../components/RoadmapView';
import { GanttChart } from '../components/GanttChart';
import { useRoadmapStore, useRoadmapSimulation } from '../stores/roadmapStoreV2';
import { t } from '../../../lib/i18n';

// Lazy load para optimization (component will be created later)
// const RoadmapSettings = React.lazy(() => import('../components/RoadmapSettings'));

const RoadmapPage: React.FC = () => {
  
  const {
    // State
    nodes,
    dependencies,
    filters,
    viewConfig,
    users,
    isLoading,
    error,
    
    // Actions
    fetchRoadmap,
    setFilters,
    setViewConfig
  } = useRoadmapStore();

  const {
    isSimulationMode,
    financialImpact,
    startSimulation,
    endSimulation,
    simulateNodeMove,
    confirmSimulation,
    discardSimulation
  } = useRoadmapSimulation();

  // Load data on mount
  useEffect(() => {
    fetchRoadmap();
  }, [fetchRoadmap]);

  const handleNodeClick = (node: any) => {
    // TODO: Open node detail modal/sidebar
    console.log('Node clicked:', node);
  };

  const handleNodeEdit = (node: any) => {
    // TODO: Open edit modal
    console.log('Node edit:', node);
  };



  const handleSimulationToggle = () => {
    if (isSimulationMode) {
      endSimulation();
    } else {
      startSimulation();
    }
  };

  const handleSimulationConfirm = async () => {
    await confirmSimulation();
  };

  const handleSimulationDiscard = () => {
    discardSimulation();
  };

  const handleNodeDrop = async (nodeId: string, newDate: string) => {
    if (isSimulationMode) {
      await simulateNodeMove(nodeId, newDate);
    }
  };

  const currentNodes = nodes;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      
      {/* Page Header */}
      <div className="sticky top-0 z-40 bg-gray-900/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            
            {/* Title & Breadcrumb */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center border border-white/10">
                <BarChart3 className="w-6 h-6 text-accent-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Project Roadmap</h1>
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <span>Dashboard</span>
                  <span>•</span>
                  <span className="text-accent-400">Roadmap</span>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-3">
              
              {/* Refresh Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchRoadmap()}
                disabled={isLoading}
                className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-white/60 hover:text-white/80 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </motion.button>

              {/* Settings Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-white/60 hover:text-white/80 transition-all"
              >
                <Settings className="w-5 h-5" />
              </motion.button>

              {/* Users Overview */}
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                <Users className="w-4 h-4 text-white/60" />
                <span className="text-sm font-medium text-white/80">{users.length}</span>
                <span className="text-xs text-white/40">members</span>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl border border-red-500/30 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Error Loading Roadmap</h3>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchRoadmap()}
              className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all"
            >
              Try Again
            </motion.button>
          </motion.div>
        )}

        {/* Roadmap Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Total Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-xl border border-white/10 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white tabular-nums">
                {currentNodes.length}
              </div>
            </div>
            <div className="text-sm font-medium text-white/80">Total Events</div>
            <div className="text-xs text-white/40">Across all modules</div>
          </motion.div>

          {/* Dependencies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-xl border border-white/10 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white tabular-nums">
                {dependencies.length}
              </div>
            </div>
            <div className="text-sm font-medium text-white/80">Dependencies</div>
            <div className="text-xs text-white/40">Smart connections</div>
          </motion.div>

          {/* Active Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl border border-white/10 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white tabular-nums">
                {users.length}
              </div>
            </div>
            <div className="text-sm font-medium text-white/80">Team Members</div>
            <div className="text-xs text-white/40">Currently assigned</div>
          </motion.div>

          {/* Cost Impact (Simulation) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-xl border border-white/10 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center">
                <Settings className="w-5 h-5 text-amber-400" />
              </div>
              <div className={`text-2xl font-bold tabular-nums ${
                financialImpact?.totalCostChange 
                  ? financialImpact.totalCostChange > 0 ? 'text-red-400' : 'text-emerald-400'
                  : 'text-white'
              }`}>
                {financialImpact?.totalCostChange 
                  ? `${financialImpact.totalCostChange > 0 ? '+' : ''}$${Math.abs(financialImpact.totalCostChange).toLocaleString()}`
                  : '$0'
                }
              </div>
            </div>
            <div className="text-sm font-medium text-white/80">Cost Impact</div>
            <div className="text-xs text-white/40">
              {isSimulationMode ? 'Simulation active' : 'No changes'}
            </div>
          </motion.div>

        </div>

        {/* Main Roadmap Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {viewConfig.viewType === 'gantt' ? (
            <GanttChart
              nodes={currentNodes}
              dependencies={dependencies}
              config={viewConfig}
              users={users}
              selectedNodeId={null}
              isSimulationMode={isSimulationMode}
              onNodeClick={handleNodeClick}
              onNodeDrop={handleNodeDrop}
            />
          ) : (
            <RoadmapView
              nodes={currentNodes}
              dependencies={dependencies}
              filters={filters}
              viewConfig={viewConfig}
              users={users}
              isLoading={isLoading}
              error={error}
              isSimulationMode={isSimulationMode}
              financialImpact={financialImpact}
              onFiltersChange={setFilters}
              onViewConfigChange={setViewConfig}
              onNodeClick={handleNodeClick}
              onNodeEdit={handleNodeEdit}
              onNodeDrop={handleNodeDrop}
              onSimulationToggle={handleSimulationToggle}
              onSimulationConfirm={handleSimulationConfirm}
              onSimulationDiscard={handleSimulationDiscard}
            />
          )}
        </motion.div>

        {/* Settings Panel */}
        <Suspense fallback={
          <div className="glass rounded-xl border border-white/10 p-6 animate-pulse">
            <div className="h-32 bg-white/5 rounded-lg"></div>
          </div>
        }>
          {/* Settings component will be loaded lazily when needed */}
        </Suspense>

      </div>

    </div>
  );
};

export default RoadmapPage;