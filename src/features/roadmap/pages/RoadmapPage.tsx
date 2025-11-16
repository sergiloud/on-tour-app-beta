/**
 * RoadmapPage - Safe Wrapper
 * 
 * Wrapper con error boundaries y fallbacks para prevenir crashes
 */

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, AlertTriangle } from 'lucide-react';

// Lazy load the new RoadmapPage with real data integration
const RoadmapPageContent = React.lazy(() => import('./RoadmapPageV2'));

const RoadmapPageFallback: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center mx-auto mb-4 border border-white/10">
        <BarChart3 className="w-8 h-8 text-accent-400 animate-pulse" />
      </div>
      <h2 className="text-lg font-semibold text-white mb-2">Loading Roadmap...</h2>
      <p className="text-sm text-white/40">Preparing your project timeline</p>
    </div>
  </div>
);

const RoadmapPageError: React.FC = () => (
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
        
        <h1 className="text-2xl font-bold text-white mb-4">Roadmap Temporarily Unavailable</h1>
        <p className="text-white/60 mb-6 max-w-md mx-auto">
          We're experiencing technical difficulties with the roadmap feature. 
          Our team is working to resolve this quickly.
        </p>
        
        <div className="flex gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all font-medium"
          >
            Retry
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-xl bg-white/5 text-white/60 border border-white/10 hover:border-white/20 hover:text-white/80 transition-all font-medium"
          >
            Go Back
          </motion.button>
        </div>
      </motion.div>
    </div>
  </div>
);

class RoadmapErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('[RoadmapPage] Error caught by boundary:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[RoadmapPage] Component error details:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      return <RoadmapPageError />;
    }

    return this.props.children;
  }
}

const RoadmapPage: React.FC = () => {
  return (
    <RoadmapErrorBoundary>
      <Suspense fallback={<RoadmapPageFallback />}>
        <RoadmapPageContent />
      </Suspense>
    </RoadmapErrorBoundary>
  );
};

export default RoadmapPage;