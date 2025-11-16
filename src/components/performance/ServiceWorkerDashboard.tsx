/**
 * Enhanced Service Worker Dashboard Component
 * 
 * Task 6: Service Worker Optimization - UI Integration
 * 
 * React component that provides real-time monitoring and control
 * of the advanced Service Worker capabilities including:
 * - Live performance metrics visualization
 * - Cache management controls
 * - Background sync status monitoring
 * - Network quality indicators
 * - PWA update management
 * 
 * @author On Tour App Performance Team
 * @version 2.0.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Database, 
  Zap, 
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Download,
  Trash2
} from 'lucide-react';
import { useServiceWorker } from '../../lib/serviceWorkerManager';

interface NetworkQualityIndicatorProps {
  quality: 'fast' | 'normal' | 'slow' | 'offline';
  isOnline: boolean;
}

const NetworkQualityIndicator: React.FC<NetworkQualityIndicatorProps> = ({ quality, isOnline }) => {
  const getQualityColor = () => {
    if (!isOnline) return 'bg-red-500';
    switch (quality) {
      case 'fast': return 'bg-green-500';
      case 'normal': return 'bg-yellow-500';
      case 'slow': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getQualityIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4" />;
    return <Wifi className="h-4 w-4" />;
  };

  return (
    <div className="flex items-center space-x-2">
      {getQualityIcon()}
      <div className="flex space-x-1">
        {[1, 2, 3].map((bar) => (
          <div
            key={bar}
            className={`w-1 h-4 rounded-sm ${
              !isOnline 
                ? 'bg-red-500' 
                : quality === 'fast' || (quality === 'normal' && bar <= 2) || (quality === 'slow' && bar === 1)
                  ? getQualityColor()
                  : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-medium capitalize">
        {isOnline ? quality : 'Offline'}
      </span>
    </div>
  );
};

interface PerformanceMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  color?: 'green' | 'red' | 'blue' | 'yellow';
}

const PerformanceMetricCard: React.FC<PerformanceMetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'blue'
}) => {
  const colorClasses = {
    green: 'text-green-600 bg-green-50 border-green-200',
    red: 'text-red-600 bg-red-50 border-red-200',
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200'
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg`}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${colorClasses[color]}`}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
        {trend && (
          <div className={`flex items-center ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            <TrendingUp className={`h-4 w-4 ${trend === 'down' ? 'rotate-180' : ''}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export const ServiceWorkerDashboard: React.FC = () => {
  const {
    isOnline,
    swStatus,
    metrics,
    updateAvailable,
    refreshMetrics,
    syncData,
    updateApp,
    clearCache,
    checkForUpdates
  } = useServiceWorker();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [networkQuality, setNetworkQuality] = useState<'fast' | 'normal' | 'slow'>('normal');

  // Auto-refresh metrics every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshMetrics();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshMetrics]);

  // Detect network quality
  useEffect(() => {
    const updateNetworkQuality = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        const effectiveType = connection?.effectiveType || 'unknown';
        
        if (effectiveType === '4g') {
          setNetworkQuality('fast');
        } else if (effectiveType === '3g') {
          setNetworkQuality('normal');
        } else {
          setNetworkQuality('slow');
        }
      }
    };

    updateNetworkQuality();
    if ('connection' in navigator) {
      (navigator as any).connection?.addEventListener('change', updateNetworkQuality);
    }

    return () => {
      if ('connection' in navigator) {
        (navigator as any).connection?.removeEventListener('change', updateNetworkQuality);
      }
    };
  }, []);

  const handleRefreshMetrics = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshMetrics();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshMetrics]);

  const handleClearCache = useCallback(async () => {
    setIsClearingCache(true);
    try {
      await clearCache();
      await refreshMetrics();
    } finally {
      setIsClearingCache(false);
    }
  }, [clearCache, refreshMetrics]);

  const handleCheckUpdates = useCallback(async () => {
    setIsCheckingUpdates(true);
    try {
      await checkForUpdates();
    } finally {
      setIsCheckingUpdates(false);
    }
  }, [checkForUpdates]);

  const handleUpdateApp = useCallback(async () => {
    try {
      await updateApp();
    } catch (error) {
      console.error('Update failed:', error);
    }
  }, [updateApp]);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatCacheHitRate = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  if (!swStatus?.supported) {
    return (
      <div className="border border-red-200 bg-red-50 rounded-lg p-6">
        <h2 className="text-red-600 text-lg font-semibold mb-2">Service Worker Not Supported</h2>
        <p className="text-red-500">
          Your browser doesn't support Service Workers. PWA features are not available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <div className="border border-gray-200 bg-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="flex items-center space-x-2 text-lg font-semibold">
              <Activity className="h-5 w-5" />
              <span>Service Worker Dashboard</span>
            </h2>
            <p className="text-gray-600 mt-1">
              Advanced PWA performance monitoring and control
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <NetworkQualityIndicator quality={networkQuality} isOnline={isOnline} />
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              swStatus?.active 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {swStatus?.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Update Available Banner */}
      {updateAvailable && (
        <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Download className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Update Available</p>
                <p className="text-sm text-blue-700">A new version of the app is ready to install.</p>
              </div>
            </div>
            <button 
              onClick={handleUpdateApp} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
            >
              Update Now
            </button>
          </div>
        </div>
      )}

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PerformanceMetricCard
          title="Cache Hit Rate"
          value={formatCacheHitRate(metrics?.cacheHitRate || 0)}
          subtitle="Cache effectiveness"
          icon={<Database className="h-4 w-4" />}
          color="green"
          trend={metrics?.cacheHitRate && metrics.cacheHitRate > 0.7 ? 'up' : 'down'}
        />
        
        <PerformanceMetricCard
          title="Avg Response"
          value={formatDuration(metrics?.avgResponseTime || 0)}
          subtitle="Request latency"
          icon={<Clock className="h-4 w-4" />}
          color="blue"
          trend={metrics?.avgResponseTime && metrics.avgResponseTime < 1000 ? 'up' : 'down'}
        />
        
        <PerformanceMetricCard
          title="Pending Syncs"
          value={metrics?.syncStatus?.pending || 0}
          subtitle="Background operations"
          icon={<RefreshCw className="h-4 w-4" />}
          color={metrics?.syncStatus?.pending && metrics.syncStatus.pending > 0 ? 'yellow' : 'green'}
        />
        
        <PerformanceMetricCard
          title="Failed Syncs"
          value={metrics?.syncStatus?.failed || 0}
          subtitle="Sync failures"
          icon={<AlertCircle className="h-4 w-4" />}
          color={metrics?.syncStatus?.failed && metrics.syncStatus.failed > 0 ? 'red' : 'green'}
        />
      </div>

      {/* Detailed Metrics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="cache">Cache Management</TabsTrigger>
          <TabsTrigger value="sync">Background Sync</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Worker Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Registered</span>
                  <Badge variant={swStatus?.registered ? 'default' : 'secondary'}>
                    {swStatus?.registered ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                    {swStatus?.registered ? 'Yes' : 'No'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active</span>
                  <Badge variant={swStatus?.active ? 'default' : 'secondary'}>
                    {swStatus?.active ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                    {swStatus?.active ? 'Yes' : 'No'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Installing</span>
                  <Badge variant={swStatus?.installing ? 'default' : 'secondary'}>
                    {swStatus?.installing ? 'Yes' : 'No'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Update Waiting</span>
                  <Badge variant={swStatus?.waiting ? 'default' : 'secondary'}>
                    {swStatus?.waiting ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Performance Metrics</CardTitle>
                <Button 
                  onClick={handleRefreshMetrics} 
                  disabled={isRefreshing}
                  size="sm"
                  variant="outline"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {metrics?.metrics && metrics.metrics.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-600 mb-2">
                    Last {metrics.metrics.length} requests
                  </div>
                  {metrics.metrics.slice(-10).map((metric, index) => (
                    <div key={index} className="flex items-center justify-between py-1 border-b border-gray-100">
                      <div className="flex items-center space-x-2">
                        <Badge variant={metric.cacheHit ? 'default' : 'secondary'} size="sm">
                          {metric.cacheHit ? 'HIT' : 'MISS'}
                        </Badge>
                        <span className="text-sm text-gray-600">{metric.event}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{formatDuration(metric.duration)}</span>
                        <Badge variant="outline" size="sm">{metric.networkStatus}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No performance metrics available yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Cache Management</CardTitle>
                <Button 
                  onClick={handleClearCache} 
                  disabled={isClearingCache}
                  size="sm"
                  variant="destructive"
                >
                  <Trash2 className={`h-4 w-4 mr-2 ${isClearingCache ? 'animate-spin' : ''}`} />
                  Clear All Cache
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Cache Hit Rate</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCacheHitRate(metrics?.cacheHitRate || 0)}
                    </span>
                  </div>
                  <Progress 
                    value={(metrics?.cacheHitRate || 0) * 100} 
                    className="h-2"
                  />
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Average Response</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatDuration(metrics?.avgResponseTime || 0)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Lower is better
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <p className="mb-2">
                  <strong>Cache Strategy:</strong> Intelligent multi-layer caching with TTL management
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Static assets: Cache-first (7 days TTL)</li>
                  <li>API responses: Network-first (5 min TTL)</li>
                  <li>User data: Stale-while-revalidate (30 min TTL)</li>
                  <li>Images: Cache-first with compression (30 days TTL)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Background Sync Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-800">Pending Operations</span>
                    <span className="text-2xl font-bold text-green-600">
                      {metrics?.syncStatus?.pending || 0}
                    </span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Operations waiting for sync
                  </p>
                </div>
                
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-red-800">Failed Operations</span>
                    <span className="text-2xl font-bold text-red-600">
                      {metrics?.syncStatus?.failed || 0}
                    </span>
                  </div>
                  <p className="text-xs text-red-600 mt-1">
                    Operations that failed to sync
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Network Status</span>
                  <Badge variant={isOnline ? 'default' : 'destructive'}>
                    {isOnline ? 'Online' : 'Offline'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Sync Capability</span>
                  <Badge variant="default">
                    <Zap className="h-3 w-3 mr-1" />
                    Background Sync Enabled
                  </Badge>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <p className="mb-2">
                  <strong>Sync Features:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Automatic retry with exponential backoff</li>
                  <li>Network-aware synchronization strategies</li>
                  <li>Conflict resolution for offline changes</li>
                  <li>Priority-based queue management</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>
            Manage Service Worker updates and maintenance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Button 
              onClick={handleCheckUpdates} 
              disabled={isCheckingUpdates}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isCheckingUpdates ? 'animate-spin' : ''}`} />
              Check for Updates
            </Button>
            
            <Button 
              onClick={handleRefreshMetrics} 
              disabled={isRefreshing}
              variant="outline"
            >
              <Activity className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Metrics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceWorkerDashboard;