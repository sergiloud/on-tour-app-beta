/**
 * RoadmapPage - Real Data Integration with Dashboard Design
 * 
 * Esta página carga datos reales del usuario y usa el mismo diseño que el dashboard
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar,
  BarChart3,
  Users,
  Settings,
  RefreshCw,
  AlertTriangle,
  Plus,
  Filter,
  Search,
  Zap,
  MapPin,
  Activity,
  Clock,
  Target,
  X,
  List,
  Grid
} from 'lucide-react';

import { useRoadmapStore } from '../stores/roadmapStoreV2';
import { RoadmapDataService } from '../services/roadmapDataService';
import { t } from '../../../lib/i18n';
import { Card } from '../../../ui/Card';
import ErrorBoundary from '../../../components/common/ErrorBoundary';
import { staggerFast, slideUp, fadeIn } from '../../../lib/animations';
import { GanttTimeline } from '../components/GanttTimeline';
import { addMonths, startOfMonth, endOfMonth } from 'date-fns';

const RoadmapPageV2: React.FC = () => {
  const {
    nodes,
    dependencies,
    filteredNodes,
    isLoading,
    error,
    isSimulationMode,
    financialImpact,
    fetchRoadmap,
    startSimulation,
    confirmSimulation,
    discardSimulation: endSimulation
  } = useRoadmapStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'gantt' | 'list'>('gantt'); // Vista por defecto: Gantt

  // Calcular rango de fechas INTELIGENTE: desde el primer evento hasta el último
  const { timelineStart, timelineEnd } = React.useMemo(() => {
    if (filteredNodes.length === 0) {
      // Si no hay eventos, mostrar 6 meses desde hoy
      return {
        timelineStart: startOfMonth(addMonths(new Date(), -1)), // 1 mes atrás
        timelineEnd: endOfMonth(addMonths(new Date(), 6)) // 6 meses adelante
      };
    }

    // Encontrar el evento más antiguo y el más futuro
    const allDates = filteredNodes.flatMap(node => [
      new Date(node.startDate),
      node.endDate ? new Date(node.endDate) : new Date(node.startDate)
    ]);

    const earliestDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const latestDate = new Date(Math.max(...allDates.map(d => d.getTime())));

    // Agregar padding: 1 mes antes del primer evento, 1 mes después del último
    return {
      timelineStart: startOfMonth(addMonths(earliestDate, -1)),
      timelineEnd: endOfMonth(addMonths(latestDate, 1))
    };
  }, [filteredNodes]);

  // Filtrar localmente sin usar el store filter system
  const displayNodes = React.useMemo(() => {
    let filtered = filteredNodes;
    
    // Aplicar búsqueda si existe
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(node =>
        node.title.toLowerCase().includes(query) ||
        (node.description && node.description.toLowerCase().includes(query))
      );
    }
    
    // Aplicar filtro de tipo si no es 'all'
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(node => node.type === selectedFilter);
    }
    
    return filtered;
  }, [filteredNodes, searchQuery, selectedFilter]);

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchRoadmap({});
      } catch (error) {
        console.error('Failed to load roadmap:', error);
      }
    };
    
    loadData();
  }, [fetchRoadmap]);

  const handleToggleSimulation = () => {
    if (isSimulationMode) {
      endSimulation();
    } else {
      startSimulation();
    }
  };

  const handleConfirmSimulation = async () => {
    try {
      await confirmSimulation();
    } catch (error) {
      console.error('Failed to confirm simulation:', error);
    }
  };

  // Estadísticas calculadas
  const stats = {
    totalNodes: nodes.length,
    confirmed: nodes.filter(n => n.status === 'confirmed').length,
    pending: nodes.filter(n => n.status === 'pending').length,
    upcoming: nodes.filter(n => new Date(n.startDate) > new Date()).length
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl border border-red-500/30 p-8 text-center"
          >
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-4">Error Loading Roadmap</h1>
            <p className="text-white/60 mb-6 max-w-md mx-auto">{error}</p>
            
            <button
              onClick={() => fetchRoadmap({})}
              className="px-6 py-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all font-medium"
            >
              Try Again
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header - exacto estilo Dashboard */}
      <div className="sticky top-0 z-10 backdrop-blur-lg bg-slate-900/95 border-b border-white/10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 rounded-full bg-gradient-to-b from-accent-500 to-accent-600" />
              <div>
                <h1 className="text-xl font-bold text-white">
                  {t('roadmap.title') || 'Project Roadmap'}
                </h1>
                <p className="text-xs text-white/60 mt-0.5">
                  {t('roadmap.subtitle') || 'Track your tour milestones and timeline'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
                <button
                  onClick={() => setViewMode('gantt')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-all flex items-center gap-1.5 ${
                    viewMode === 'gantt'
                      ? 'bg-accent-500/20 text-accent-400'
                      : 'text-white/50 hover:text-white/70'
                  }`}
                  title="Gantt Timeline View"
                >
                  <Grid className="w-3.5 h-3.5" />
                  Timeline
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-all flex items-center gap-1.5 ${
                    viewMode === 'list'
                      ? 'bg-accent-500/20 text-accent-400'
                      : 'text-white/50 hover:text-white/70'
                  }`}
                  title="List View"
                >
                  <List className="w-3.5 h-3.5" />
                  List
                </button>
              </div>

              {/* Simulation Controls - exacto estilo Dashboard */}
              <AnimatePresence>
                {isSimulationMode && (
                  <motion.div
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-2"
                  >
                    <button
                      onClick={handleConfirmSimulation}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 transition-all"
                    >
                      Confirm Changes
                    </button>
                    <button
                      onClick={() => endSimulation()}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all"
                    >
                      Discard
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <button
                onClick={handleToggleSimulation}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                  isSimulationMode
                    ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/70'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                {isSimulationMode ? 'Simulation' : 'Simulate'}
              </button>
              
              <button
                onClick={() => fetchRoadmap({})}
                disabled={isLoading}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 transition-all disabled:opacity-50"
                title="Refresh roadmap data"
              >
                <RefreshCw className={`w-4 h-4 text-slate-600 dark:text-white/70 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {/* Roadmap Filters - exacto estilo Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-4 rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur-sm"
        >
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search roadmap items by title or description..."
                className="w-full pl-10 pr-10 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/30 text-sm text-white placeholder-white/40 transition-all"
                aria-label="Search roadmap items"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5 opacity-70" />
                </button>
              )}
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-white/50" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/30 text-sm text-white transition-all cursor-pointer"
                aria-label="Filter by type"
              >
                <option value="all" className="bg-slate-900">All types</option>
                <option value="show" className="bg-slate-900">Shows</option>
                <option value="milestone" className="bg-slate-900">Milestones</option>
                <option value="task" className="bg-slate-900">Tasks</option>
              </select>
            </div>

            {/* Reset Filters */}
            {(searchQuery || selectedFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFilter('all');
                }}
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-xs font-medium text-white/70 transition-all flex items-center gap-2"
                aria-label="Reset filters"
              >
                <X className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>

          {/* Active Filters & Stats Summary */}
          {(searchQuery || selectedFilter !== 'all' || stats.totalNodes > 0) && (
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/70">
              <div className="flex items-center gap-3">
                <span className="text-white/50">{stats.totalNodes} items:</span>
                <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {stats.confirmed} confirmed
                </span>
                <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {stats.pending} pending
                </span>
                <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {stats.upcoming} upcoming
                </span>
              </div>
              {(searchQuery || selectedFilter !== 'all') && (
                <div className="flex items-center gap-2">
                  <span className="text-white/50">Active filters:</span>
                  {searchQuery && (
                    <span className="px-2 py-1 rounded bg-accent-500/20 text-accent-300 border border-accent-500/30">
                      "{searchQuery}"
                    </span>
                  )}
                  {selectedFilter !== 'all' && (
                    <span className="px-2 py-1 rounded bg-accent-500/20 text-accent-300 border border-accent-500/30">
                      {selectedFilter}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Main Content - exacto estilo Dashboard grid */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-5">
          {/* Columna Principal: Roadmap Timeline */}
          <div className="lg:col-span-12">
            <ErrorBoundary fallback={
              <div className="p-8 rounded-xl border border-white/10 bg-slate-900/50 text-center">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <X className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Error loading roadmap</h3>
                <p className="text-white/60 mb-4">Something went wrong while loading your roadmap data.</p>
                <button
                  onClick={() => fetchRoadmap({})}
                  className="px-4 py-2 rounded-lg bg-accent-500/20 text-accent-400 border border-accent-500/30 hover:bg-accent-500/30 transition-all text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            }>
              <div className="rounded-xl border border-white/10 bg-slate-900/50 overflow-hidden">
                {isLoading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="w-8 h-8 text-white/40 animate-spin mx-auto mb-4" />
                    <p className="text-white/60">Loading your roadmap data...</p>
                  </div>
                ) : displayNodes.length === 0 ? (
                  <div className="text-center py-12 px-6">
                    <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                      <Calendar className="w-8 h-8 text-white/40" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{t('roadmap.emptyState.title')}</h3>
                    <p className="text-white/60 mb-6">
                      {filteredNodes.length === 0
                        ? t('roadmap.emptyState.noItems')
                        : t('roadmap.emptyState.noResults')
                      }
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {/* TODO: Open create modal */}}
                      className="px-4 py-2 rounded-lg bg-accent-500/20 text-accent-400 border border-accent-500/30 hover:bg-accent-500/30 transition-all text-sm font-medium flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      {t('roadmap.actions.addNew')}
                    </motion.button>
                  </div>
                ) : viewMode === 'gantt' ? (
                  /* Vista Gantt Timeline - estilo Notion */
                  <GanttTimeline 
                    nodes={displayNodes}
                    dependencies={dependencies}
                    startDate={timelineStart}
                    endDate={timelineEnd}
                    isSimulationMode={isSimulationMode}
                    onNodeMove={(nodeId: string, newStart: Date, newEnd: Date) => {
                      console.log('Node moved:', nodeId, newStart, newEnd);
                      // TODO: Implement store action
                    }}
                    onNodeClick={(node: any) => {
                      console.log('Node clicked:', node);
                      // TODO: Open edit modal
                    }}
                  />
                ) : (
                  /* Vista de Lista - original */
                  <div className="p-6">
                    <motion.div
                      variants={staggerFast}
                      initial="initial"
                      animate="animate"
                      className="space-y-3"
                    >
                    {displayNodes.map((node) => (
                      <motion.div
                        key={node.id}
                        variants={slideUp}
                        className="group relative p-4 rounded-lg border border-white/10 hover:border-white/20 transition-all bg-white/[0.02]"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            {/* Status Indicator */}
                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                              node.status === 'confirmed' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' :
                              node.status === 'pending' ? 'bg-amber-500 shadow-lg shadow-amber-500/50' :
                              'bg-red-500 shadow-lg shadow-red-500/50'
                            }`} />
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-white truncate">{node.title}</h4>
                                <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                                  node.type === 'show' ? 'bg-blue-500/20 text-blue-400' :
                                  node.type === 'milestone' ? 'bg-purple-500/20 text-purple-400' :
                                  'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {node.type}
                                </span>
                              </div>
                              
                              {node.description && (
                                <p className="text-sm text-white/60 line-clamp-2 mb-2">{node.description}</p>
                              )}
                              
                              <div className="flex items-center gap-3 text-xs text-white/50">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(node.startDate).toLocaleDateString()}
                                </span>
                                {node.priority && (
                                  <span className={`px-2 py-0.5 rounded-full ${
                                    node.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                    node.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                    'bg-green-500/20 text-green-400'
                                  }`}>
                                    {node.priority}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                              title="Edit roadmap item"
                            >
                              <Settings className="w-4 h-4 text-white/70" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    </motion.div>
                  </div>
                )}
              </div>
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapPageV2;