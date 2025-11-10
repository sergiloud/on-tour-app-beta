import React, { useState } from 'react';
import { HybridShowService } from '../services/hybridShowService';
import StorageStatus from '../components/common/StorageStatus';
import { useAuth } from '../context/AuthContext';
import { Shield, Database, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export const DataSecurityPage: React.FC = () => {
  const { userId } = useAuth();
  const [status] = useState(() => HybridShowService.getStatus());

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Data Security & Storage
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Understand where your data is stored and how it's protected
        </p>
      </div>

      {/* Current Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Current Storage Status
          </h2>
        </div>
        
        <StorageStatus className="mb-4" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Local Storage</h3>
            <p className="text-2xl font-bold text-blue-600">{status.localStorage}</p>
            <p className="text-sm text-gray-500">Shows stored locally</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Cloud Sync</h3>
            <div className="flex items-center gap-2">
              {status.cloudEnabled ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              )}
              <p className="text-sm font-medium">
                {status.cloudEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">User ID</h3>
            <p className="text-sm font-mono text-gray-600 dark:text-gray-400 truncate">
              {userId}
            </p>
          </div>
        </div>
      </div>

      {/* Data Storage Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Where Data is Stored */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Where Your Data Lives
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Browser Storage</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your data is stored locally in your browser for fast access and offline use.
              </p>
            </div>
            
            {status.cloudEnabled && (
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Google Cloud Firestore</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Securely backed up to Google's cloud infrastructure with enterprise-grade security.
                </p>
              </div>
            )}
            
            {!status.cloudEnabled && (
              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Local Only</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Data is only stored locally. If you clear your browser data, you'll lose your shows.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Security Features */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Security Features
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">User Isolation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your data is completely isolated from other users.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Encrypted Storage</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sensitive data is encrypted before being stored locally.
                </p>
              </div>
            </div>
            
            {status.cloudEnabled && (
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Firebase Security</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Cloud data protected by Google's security infrastructure.
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">No Third-Party Sharing</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your data is never shared with third parties or used for advertising.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      {!status.cloudEnabled && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6 mt-8">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
              Recommendation: Enable Cloud Backup
            </h3>
          </div>
          <p className="text-orange-800 dark:text-orange-200 mb-4">
            Currently, your data is only stored locally. If you clear your browser data or use a different device, 
            you'll lose access to your shows. We recommend enabling cloud backup for data safety.
          </p>
          <p className="text-sm text-orange-700 dark:text-orange-300">
            Contact your administrator to configure Firebase for automatic cloud backup and cross-device sync.
          </p>
        </div>
      )}
    </div>
  );
};

export default DataSecurityPage;