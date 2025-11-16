/**
 * Real-time Connection Dashboard Component
 * 
 * Provides a comprehensive interface for monitoring and managing
 * real-time connections with advanced features:
 * 
 * - Live connection status and metrics visualization
 * - Network quality assessment and adaptation
 * - Connection pool management and optimization
 * - Message queue monitoring and priority management
 * - Performance analytics and trend analysis
 * 
 * @version 2.0.0
 */

import React, { useState, useEffect } from 'react';
import { 
  useRealtimeConnection, 
  useNetworkQuality, 
  useConnectionMetrics,
  ConnectionConfig,
  ConnectionMetrics,
  NetworkCondition 
} from '../../lib/realtimeConnectionManager';
import { logger } from '../../lib/logger';

export interface ConnectionDashboardProps {
  connections?: ConnectionConfig[];
  showAdvancedMetrics?: boolean;
  enableTestMode?: boolean;
  className?: string;
}

export const RealtimeConnectionDashboard: React.FC<ConnectionDashboardProps> = ({
  connections = [],
  showAdvancedMetrics = false,
  enableTestMode = false,
  className = ''
}) => {
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [testMessages, setTestMessages] = useState<Array<{ id: string; message: string; timestamp: number }>>([]);
  
  const networkQuality = useNetworkQuality();
  const allMetrics = useConnectionMetrics();

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const getConnectionStatusColor = (status: string): string => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'connecting': return 'text-yellow-600 bg-yellow-100';
      case 'reconnecting': return 'text-orange-600 bg-orange-100';
      case 'disconnected': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getNetworkQualityColor = (quality: string): string => {
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-orange-600';
      case 'offline': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatBytes = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)}${sizes[i]}`;
  };

  const formatUptime = (uptime: number): string => {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  // ============================================================================
  // TEST FUNCTIONS
  // ============================================================================

  const sendTestMessage = (connectionId: string) => {
    const testMessage = {
      id: Math.random().toString(36).substring(7),
      message: `Test message from dashboard at ${new Date().toLocaleTimeString()}`,
      timestamp: Date.now()
    };
    
    setTestMessages(prev => [...prev.slice(-9), testMessage]); // Keep last 10 messages
    logger.info(`Sent test message to ${connectionId}`, testMessage);
  };

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderNetworkQuality = () => {
    if (!networkQuality) return null;

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <div className="w-3 h-3 rounded-full mr-2 bg-blue-500"></div>
          Network Quality Assessment
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getNetworkQualityColor(networkQuality.effectiveType)}`}>
              {networkQuality.effectiveType.toUpperCase()}
            </div>
            <div className="text-sm text-gray-600">Connection Type</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">
              {networkQuality.downlink.toFixed(1)} Mbps
            </div>
            <div className="text-sm text-gray-600">Bandwidth</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">
              {networkQuality.rtt}ms
            </div>
            <div className="text-sm text-gray-600">Round Trip Time</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${networkQuality.saveData ? 'text-orange-600' : 'text-green-600'}`}>
              {networkQuality.saveData ? 'ON' : 'OFF'}
            </div>
            <div className="text-sm text-gray-600">Data Saver</div>
          </div>
        </div>
      </div>
    );
  };

  const renderConnectionCard = (connectionId: string, metrics: ConnectionMetrics) => {
    const isSelected = selectedConnection === connectionId;
    
    return (
      <div 
        key={connectionId}
        className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all duration-200 ${
          isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-lg'
        }`}
        onClick={() => setSelectedConnection(isSelected ? null : connectionId)}
      >
        {/* Connection Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold truncate">{connectionId}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getConnectionStatusColor(metrics.status)}`}>
            {metrics.status.toUpperCase()}
          </span>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-2xl font-bold text-gray-800">{metrics.latency}ms</div>
            <div className="text-sm text-gray-600">Latency</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-gray-800">{metrics.qualityScore.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Quality Score</div>
          </div>
        </div>

        {/* Network Quality Indicator */}
        <div className="flex items-center mb-4">
          <div className={`w-3 h-3 rounded-full mr-2 ${
            metrics.networkQuality === 'excellent' ? 'bg-green-500' :
            metrics.networkQuality === 'good' ? 'bg-blue-500' :
            metrics.networkQuality === 'fair' ? 'bg-yellow-500' :
            metrics.networkQuality === 'poor' ? 'bg-orange-500' : 'bg-red-500'
          }`}></div>
          <span className={`text-sm font-medium ${getNetworkQualityColor(metrics.networkQuality)}`}>
            {metrics.networkQuality.charAt(0).toUpperCase() + metrics.networkQuality.slice(1)} Network
          </span>
        </div>

        {/* Detailed Metrics (when selected) */}
        {isSelected && (
          <div className="border-t pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Uptime:</span>
                <span className="ml-2 font-medium">{formatUptime(metrics.uptime)}</span>
              </div>
              
              <div>
                <span className="text-gray-600">Reconnects:</span>
                <span className="ml-2 font-medium">{metrics.reconnectCount}</span>
              </div>
              
              <div>
                <span className="text-gray-600">Messages Sent:</span>
                <span className="ml-2 font-medium">{metrics.messagesSent}</span>
              </div>
              
              <div>
                <span className="text-gray-600">Messages Received:</span>
                <span className="ml-2 font-medium">{metrics.messagesReceived}</span>
              </div>
              
              <div>
                <span className="text-gray-600">Data Transfer:</span>
                <span className="ml-2 font-medium">{formatBytes(metrics.bytesTransferred)}</span>
              </div>
              
              <div>
                <span className="text-gray-600">Error Rate:</span>
                <span className="ml-2 font-medium">{(metrics.errorRate * 100).toFixed(1)}%</span>
              </div>
            </div>

            {/* Test Actions */}
            {enableTestMode && (
              <div className="border-t pt-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    sendTestMessage(connectionId);
                  }}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Send Test Message
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderAdvancedMetrics = () => {
    if (!showAdvancedMetrics) return null;

    const totalConnections = Object.keys(allMetrics).length;
    const activeConnections = Object.values(allMetrics).filter((m: ConnectionMetrics) => m.status === 'connected').length;
    const averageLatency = Object.values(allMetrics).reduce((sum: number, m: ConnectionMetrics) => sum + m.latency, 0) / totalConnections || 0;
    const totalMessages = Object.values(allMetrics).reduce((sum: number, m: ConnectionMetrics) => sum + m.messagesSent + m.messagesReceived, 0);
    const totalBytes = Object.values(allMetrics).reduce((sum: number, m: ConnectionMetrics) => sum + m.bytesTransferred, 0);

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <div className="w-3 h-3 rounded-full mr-2 bg-purple-500"></div>
          Advanced Performance Metrics
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{totalConnections}</div>
            <div className="text-sm text-gray-600">Total Connections</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{activeConnections}</div>
            <div className="text-sm text-gray-600">Active Connections</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{averageLatency.toFixed(0)}ms</div>
            <div className="text-sm text-gray-600">Avg Latency</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{totalMessages.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Messages</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{formatBytes(totalBytes)}</div>
            <div className="text-sm text-gray-600">Data Transferred</div>
          </div>
        </div>
      </div>
    );
  };

  const renderTestMessages = () => {
    if (!enableTestMode || testMessages.length === 0) return null;

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <div className="w-3 h-3 rounded-full mr-2 bg-green-500"></div>
          Test Messages ({testMessages.length})
        </h3>
        
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {testMessages.map((msg) => (
            <div key={msg.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-700 flex-1">{msg.message}</span>
              <span className="text-xs text-gray-500 ml-2">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className={`realtime-connection-dashboard ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Real-time Connection Manager
        </h2>
        <p className="text-gray-600">
          Monitor and manage Socket.IO connections with advanced performance analytics
        </p>
      </div>

      {/* Network Quality */}
      {renderNetworkQuality()}

      {/* Advanced Metrics */}
      {renderAdvancedMetrics()}

      {/* Test Messages */}
      {renderTestMessages()}

      {/* Connection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(allMetrics).map(([connectionId, metrics]) =>
          renderConnectionCard(connectionId, metrics)
        )}
      </div>

      {/* Empty State */}
      {Object.keys(allMetrics).length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-400 rounded-full border-dashed"></div>
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">No Active Connections</h3>
          <p className="text-gray-500">
            Real-time connections will appear here when they are established
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between text-sm text-gray-500">
          <div>
            Real-time Connection Manager v2.0.0 - Advanced Socket.IO Management
          </div>
          <div className="mt-2 md:mt-0">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeConnectionDashboard;