/**
 * Service Worker Analytics Dashboard
 * 
 * A simple dashboard to monitor service worker performance and caching
 */

import React, { useState, useEffect } from 'react';
import { useServiceWorker } from '../../lib/serviceWorkerManager';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';

export function ServiceWorkerDashboard() {
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
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Auto-refresh metrics
  useEffect(() => {
    const interval = setInterval(async () => {
      if (swStatus?.active) {
        await refreshMetrics();
        setLastRefresh(new Date());
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [swStatus?.active, refreshMetrics]);

  const handleRefreshMetrics = async () => {
    setIsRefreshing(true);
    try {
      await refreshMetrics();
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to refresh metrics:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleTestOfflineSync = async () => {
    try {
      const syncId = await syncData({
        url: '/api/test-sync',
        method: 'POST',
        body: { 
          timestamp: Date.now(), 
          test: 'offline sync test',
          data: { value: Math.random() }
        }
      });
      console.log('Test sync queued:', syncId);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Service Worker Analytics</h2>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          <Button
            onClick={handleRefreshMetrics}
            disabled={isRefreshing || !swStatus?.active}
            variant="soft"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Service Worker Status */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            🔧 Service Worker Status
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-gray-500">Status</label>
              <div className="mt-1">
                {swStatus?.active ? (
                  <Badge variant="success">Active</Badge>
                ) : swStatus?.installing ? (
                  <Badge variant="warning">Installing</Badge>
                ) : swStatus?.waiting ? (
                  <Badge variant="neutral">Update Pending</Badge>
                ) : (
                  <Badge variant="danger">Inactive</Badge>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-500">Supported</label>
              <div className="mt-1">
                <Badge variant={swStatus?.supported ? "success" : "danger"}>
                  {swStatus?.supported ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-500">Registered</label>
              <div className="mt-1">
                <Badge variant={swStatus?.registered ? "success" : "neutral"}>
                  {swStatus?.registered ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-500">Update Available</label>
              <div className="mt-1">
                <Badge variant={updateAvailable ? "warning" : "neutral"}>
                  {updateAvailable ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          </div>

          {updateAvailable && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 mb-3">
                A new version of the application is available!
              </p>
              <Button onClick={updateApp} variant="primary">
                Update Now
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Performance Metrics */}
      {metrics && (
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              ⚡ Performance Metrics
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {metrics.cacheHitRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Cache Hit Rate</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {metrics.avgResponseTime}ms
                </div>
                <div className="text-sm text-gray-500">Avg Response</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {metrics.metrics.length}
                </div>
                <div className="text-sm text-gray-500">Total Requests</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {metrics.syncStatus.pending}
                </div>
                <div className="text-sm text-gray-500">Pending Sync</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Recent Network Activity</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {metrics.metrics.slice(-5).reverse().map((metric, index) => (
                  <div
                    key={`${metric.timestamp}-${index}`}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant={metric.cacheHit ? "success" : "neutral"}>
                        {metric.cacheHit ? "HIT" : "MISS"}
                      </Badge>
                      <span className="font-medium">{metric.event}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <span>{metric.duration}ms</span>
                      <Badge variant="neutral">
                        {metric.networkStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Controls */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            🛠️ Cache Management & Testing
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={clearCache} 
              variant="outline"
              disabled={!swStatus?.active}
              className="border-red-500 text-red-500 hover:bg-red-50"
            >
              Clear All Caches
            </Button>
            <Button 
              onClick={checkForUpdates}
              variant="soft"
              disabled={!swStatus?.active}
            >
              Check for Updates
            </Button>
            <Button 
              onClick={handleTestOfflineSync}
              variant="primary"
              disabled={!swStatus?.active}
            >
              Test Offline Sync
            </Button>
          </div>

          {lastRefresh && (
            <div className="text-sm text-gray-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
          )}
        </div>
      </Card>

      {/* Network Status */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">🌐 Network Status</h3>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              <span className="font-medium">{isOnline ? 'Connected' : 'Disconnected'}</span>
            </div>
            {!isOnline && (
              <div className="text-sm text-gray-600">
                Working in offline mode. Changes will sync automatically when connection is restored.
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ServiceWorkerDashboard;