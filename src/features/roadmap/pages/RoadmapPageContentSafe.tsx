/**
 * RoadmapPageContent - Safe Simple Implementation
 * 
 * Version simplificada para evitar errores de React hooks
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar,
  BarChart3,
  Users,
  Settings,
  RefreshCw,
  AlertTriangle,
  Plus
} from 'lucide-react';

interface RoadmapNode {
  id: string;
  title: string;
  type: 'milestone' | 'show' | 'travel' | 'task';
  startDate: string;
  endDate?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
}

const RoadmapPageContent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nodes, setNodes] = useState<RoadmapNode[]>([]);

  // Simulate data loading
  useEffect(() => {
    const loadRoadmapData = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data for now
        const mockNodes: RoadmapNode[] = [
          {
            id: '1',
            title: 'Summer Tour 2025 Planning',
            type: 'milestone',
            startDate: '2025-02-01',
            endDate: '2025-02-15',
            status: 'pending',
            priority: 'high'
          },
          {
            id: '2', 
            title: 'Venue Bookings - Madrid',
            type: 'show',
            startDate: '2025-03-15',
            status: 'confirmed',
            priority: 'medium'
          },
          {
            id: '3',
            title: 'Travel Arrangements - Spain',
            type: 'travel',
            startDate: '2025-03-10',
            endDate: '2025-03-20',
            status: 'pending',
            priority: 'medium'
          }
        ];
        
        setNodes(mockNodes);
        setIsLoading(false);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load roadmap');
        setIsLoading(false);
      }
    };

    loadRoadmapData();
  }, []);

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl border border-red-500/30 p-8 text-center"
          >
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Error Loading Roadmap</h2>
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all"
            >
              Retry
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main content
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.reload()}
                disabled={isLoading}
                className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-white/60 hover:text-white/80 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-white/60 hover:text-white/80 transition-all"
              >
                <Settings className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Statistics Cards */}
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
                {nodes.length}
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
              <div className="text-2xl font-bold text-white tabular-nums">0</div>
            </div>
            <div className="text-sm font-medium text-white/80">Dependencies</div>
            <div className="text-xs text-white/40">Smart connections</div>
          </motion.div>

          {/* Team Members */}
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
              <div className="text-2xl font-bold text-white tabular-nums">3</div>
            </div>
            <div className="text-sm font-medium text-white/80">Team Members</div>
            <div className="text-xs text-white/40">Currently assigned</div>
          </motion.div>

          {/* Status */}
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
              <div className="text-2xl font-bold text-emerald-400 tabular-nums">OK</div>
            </div>
            <div className="text-sm font-medium text-white/80">System Status</div>
            <div className="text-xs text-white/40">All systems operational</div>
          </motion.div>

        </div>

        {/* Main Roadmap View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-xl border border-white/10 overflow-hidden"
        >
          
          {/* Roadmap Header */}
          <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-accent-400" />
                <div>
                  <h2 className="text-lg font-semibold text-white">Project Timeline</h2>
                  <div className="text-xs text-white/40">Interactive roadmap view</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-500/20 text-accent-400 border border-accent-500/30 hover:bg-accent-500/30 transition-all text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Event
                </motion.button>
              </div>
            </div>
          </div>

          {/* Roadmap Content */}
          <div className="p-6">
            {isLoading ? (
              
              // Loading State
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center animate-pulse mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-accent-400" />
                  </div>
                  <div className="text-lg font-semibold text-white mb-2">Loading Timeline...</div>
                  <div className="text-sm text-white/40">Aggregating events from all modules</div>
                </div>
              </div>
              
            ) : nodes.length === 0 ? (
              
              // Empty State
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-white/40" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No Events Found</h3>
                <p className="text-sm text-white/40 mb-6 max-w-md mx-auto">
                  Your roadmap is empty. Add some shows, tasks, or milestones to get started.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-xl bg-accent-500/20 text-accent-400 border border-accent-500/30 hover:bg-accent-500/30 transition-all font-medium"
                >
                  Create First Event
                </motion.button>
              </div>
              
            ) : (
              
              // Roadmap Events List (Simple View)
              <div className="space-y-4">
                <div className="text-sm text-white/60 mb-6">
                  Found {nodes.length} events in your roadmap
                </div>
                
                {nodes.map((node, index) => (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass rounded-lg border border-white/5 p-4 hover:border-white/10 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`
                          w-3 h-3 rounded-full 
                          ${node.type === 'show' ? 'bg-emerald-400' : 
                            node.type === 'travel' ? 'bg-blue-400' : 
                            node.type === 'milestone' ? 'bg-amber-400' : 'bg-purple-400'
                          }
                        `} />
                        
                        <div>
                          <h3 className="font-semibold text-white group-hover:text-accent-400 transition-colors">
                            {node.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-white/40 mt-1">
                            <span className="capitalize">{node.type}</span>
                            <span>•</span>
                            <span>{new Date(node.startDate).toLocaleDateString()}</span>
                            {node.endDate && (
                              <>
                                <span>→</span>
                                <span>{new Date(node.endDate).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`
                          px-2 py-1 rounded text-xs font-medium border
                          ${node.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                            node.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                            'bg-white/5 text-white/60 border-white/10'
                          }
                        `}>
                          {node.status}
                        </span>
                        
                        <span className={`
                          px-2 py-1 rounded text-xs font-medium border
                          ${node.priority === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                            node.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                            'bg-green-500/20 text-green-400 border-green-500/30'
                          }
                        `}>
                          {node.priority}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
            )}
          </div>

        </motion.div>

        {/* Development Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-xl border border-blue-500/30 p-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center">
              <Settings className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Roadmap Feature in Development</h3>
              <p className="text-sm text-blue-400 mt-1">
                Advanced Gantt charts, simulation mode, and dependency management coming soon. 
                This simplified view shows your current roadmap structure.
              </p>
            </div>
          </div>
        </motion.div>

      </div>

    </div>
  );
};

export default RoadmapPageContent;