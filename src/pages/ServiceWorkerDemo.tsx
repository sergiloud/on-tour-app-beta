/**
 * Service Worker Demo Page
 * 
 * A dedicated page to showcase and test the advanced service worker functionality
 */

import React from 'react';
import ServiceWorkerDashboard from '../components/dashboard/ServiceWorkerDashboard';
import { ServiceWorkerUpdater, PerformanceBadge } from '../components/common/ServiceWorkerUpdater';

export default function ServiceWorkerDemo() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Service Worker Background Components */}
      <ServiceWorkerUpdater />
      <PerformanceBadge show={process.env.NODE_ENV === 'development'} />
      
      {/* Main Content */}
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Service Worker Analytics & Testing
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Monitor and test the advanced service worker implementation with intelligent caching, 
            background sync, and performance monitoring. This dashboard provides real-time insights 
            into cache performance, network status, and offline functionality.
          </p>
        </div>

        {/* Service Worker Dashboard */}
        <ServiceWorkerDashboard />
      </div>
      
      {/* Developer Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black text-white text-xs p-3 rounded-lg max-w-sm">
          <h4 className="font-semibold mb-2">🧑‍💻 Developer Mode</h4>
          <p className="mb-2">Service Worker features available:</p>
          <ul className="space-y-1 text-[10px]">
            <li>• Intelligent caching strategies</li>
            <li>• Background sync testing</li>
            <li>• Real-time performance metrics</li>
            <li>• Network status detection</li>
            <li>• Cache management tools</li>
          </ul>
          <p className="mt-2 text-[10px] opacity-70">
            Open DevTools → Application → Service Workers for detailed inspection
          </p>
        </div>
      )}
    </div>
  );
}