/**
 * Service Worker Performance Monitor
 * 
 * Task 6: Service Worker Optimization - Simplified UI
 * 
 * Basic React component for monitoring Service Worker performance
 * without complex UI dependencies.
 */

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Database, 
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useServiceWorker } from '../../lib/serviceWorkerManager';

const ServiceWorkerMonitor: React.FC = () => {
  const { isOnline, swStatus, metrics, refreshMetrics, clearCache } = useServiceWorker();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Auto-refresh metrics every 30 seconds
    const interval = setInterval(refreshMetrics, 30000);
    return () => clearInterval(interval);
  }, [refreshMetrics]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshMetrics();
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatCacheHitRate = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  if (!swStatus?.supported) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-medium">Service Worker Not Supported</h3>
        <p className="text-red-600 text-sm mt-1">PWA features are not available in this browser.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Service Worker Monitor</h2>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {isOnline ? <Wifi className="h-4 w-4 text-green-600" /> : <WifiOff className="h-4 w-4 text-red-600" />}
              <span className="text-sm">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              swStatus?.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {swStatus?.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cache Hit Rate */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Database className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-green-700 font-medium">Cache Hit Rate</p>
              <p className="text-2xl font-bold text-green-800">
                {formatCacheHitRate(metrics?.cacheHitRate || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Response Time */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-700 font-medium">Avg Response</p>
              <p className="text-2xl font-bold text-blue-800">
                {formatDuration(metrics?.avgResponseTime || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Pending Syncs */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <RefreshCw className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-sm text-yellow-700 font-medium">Pending Syncs</p>
              <p className="text-2xl font-bold text-yellow-800">
                {metrics?.syncStatus?.pending || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Failed Syncs */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm text-red-700 font-medium">Failed Syncs</p>
              <p className="text-2xl font-bold text-red-800">
                {metrics?.syncStatus?.failed || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-medium mb-3">Service Worker Status</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm font-medium">Registered</span>
            <div className="flex items-center space-x-1">
              {swStatus?.registered ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">{swStatus?.registered ? 'Yes' : 'No'}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm font-medium">Active</span>
            <div className="flex items-center space-x-1">
              {swStatus?.active ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">{swStatus?.active ? 'Yes' : 'No'}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm font-medium">Installing</span>
            <span className="text-sm">{swStatus?.installing ? 'Yes' : 'No'}</span>
          </div>
          
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm font-medium">Update Waiting</span>
            <span className="text-sm">{swStatus?.waiting ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {metrics?.metrics && metrics.metrics.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium">Recent Activity</h3>
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm">Refresh</span>
            </button>
          </div>
          
          <div className="space-y-2">
            {metrics.metrics.slice(-5).map((metric: any, index: number) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    metric.cacheHit 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {metric.cacheHit ? 'HIT' : 'MISS'}
                  </span>
                  <span className="text-sm text-gray-700">{metric.event}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>{formatDuration(metric.duration)}</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                    {metric.networkStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-medium mb-3">Actions</h3>
        <div className="flex space-x-2">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Metrics</span>
          </button>
          
          <button 
            onClick={clearCache}
            className="flex items-center space-x-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            <AlertCircle className="h-4 w-4" />
            <span>Clear Cache</span>
          </button>
        </div>
      </div>

      {/* Cache Strategy Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-medium mb-3">Cache Strategy</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p><strong>Intelligent Multi-Layer Caching:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-xs ml-4">
            <li><strong>Static Assets:</strong> Cache-first strategy (7 days TTL)</li>
            <li><strong>API Responses:</strong> Network-first with fallback (5 min TTL)</li>
            <li><strong>User Data:</strong> Stale-while-revalidate (30 min TTL)</li>
            <li><strong>Images:</strong> Cache-first with compression (30 days TTL)</li>
          </ul>
          
          <p className="mt-3"><strong>Background Sync Features:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-xs ml-4">
            <li>Automatic retry with exponential backoff</li>
            <li>Network-aware synchronization strategies</li>
            <li>Priority-based queue management</li>
            <li>Conflict resolution for offline changes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ServiceWorkerMonitor;