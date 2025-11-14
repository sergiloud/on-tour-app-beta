/**
 * Offline Status Indicator
 * 
 * Shows:
 * - Online/Offline status
 * - Pending sync count
 * - Sync progress
 * - Manual sync button
 */

import { useBackgroundSync } from '../hooks/useBackgroundSync';
import { WifiOff, Wifi, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function OfflineIndicator() {
  const { isOnline, isSyncing, pendingCount, lastSyncTime, errors, manualSync } = useBackgroundSync();

  // Don't show if online and nothing pending
  if (isOnline && pendingCount === 0 && errors.length === 0) {
    return null;
  }

  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        style={{ position: 'fixed', top: '4rem', right: '1rem', zIndex: 50, maxWidth: '24rem' }}
      >
        <div className={`
          rounded-lg shadow-xl border backdrop-blur-sm p-4
          ${isOnline 
            ? 'bg-white/90 dark:bg-[#0f1419]/90 border-gray-200 dark:border-gray-800' 
            : 'bg-orange-50/90 dark:bg-orange-950/90 border-orange-200 dark:border-orange-800'
          }
        `}>
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <WifiOff className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              )}
              <span className="font-medium text-sm">
                {isOnline ? 'Online' : 'Offline Mode'}
              </span>
            </div>

            {isOnline && pendingCount > 0 && (
              <button
                onClick={manualSync}
                disabled={isSyncing}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 
                         disabled:opacity-50 transition-colors"
                title="Sync now"
              >
                <RefreshCw 
                  className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} 
                />
              </button>
            )}
          </div>

          {/* Pending count */}
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 text-sm mb-2">
              <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="text-gray-700 dark:text-gray-300">
                {pendingCount} {pendingCount === 1 ? 'change' : 'changes'} pending sync
              </span>
            </div>
          )}

          {/* Syncing progress */}
          {isSyncing && (
            <div className="mb-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Syncing...</span>
              </div>
              <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  style={{ height: '100%', background: 'var(--primary)' }}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, ease: 'easeInOut' }}
                />
              </div>
            </div>
          )}

          {/* Last sync time */}
          {isOnline && !isSyncing && lastSyncTime && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Last sync: {formatLastSync(lastSyncTime)}</span>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-red-600 dark:text-red-400 space-y-1">
                {errors.map((error: string, i: number) => (
                  <div key={i} className="flex items-start gap-1">
                    <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Offline message */}
          {!isOnline && (
            <div className="mt-3 pt-3 border-t border-orange-200 dark:border-orange-800">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Changes will sync automatically when connection is restored
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Compact version for mobile
export function OfflineIndicatorCompact() {
  const { isOnline, pendingCount } = useBackgroundSync();

  if (isOnline && pendingCount === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '5rem',
        right: '1rem',
        zIndex: 50
      }}
      className={`
        px-3 py-2 rounded-full shadow-lg
        flex items-center gap-2 text-sm font-medium
        ${isOnline 
          ? 'bg-white dark:bg-gray-900' 
          : 'bg-orange-100 dark:bg-orange-900'
        }
      `}
    >
      {isOnline ? (
        <Wifi className="w-4 h-4 text-green-600" />
      ) : (
        <WifiOff className="w-4 h-4 text-orange-600" />
      )}
      
      {pendingCount > 0 && (
        <span className="text-xs">
          {pendingCount}
        </span>
      )}
    </div>
  );
}
