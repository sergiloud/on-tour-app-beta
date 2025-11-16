import React, { useState, useEffect } from 'react';
import { HybridShowService } from '../../services/hybridShowService';
import { Cloud, HardDrive, Wifi, WifiOff } from 'lucide-react';
import { useEventListeners } from '../../hooks/useCleanup';

interface StorageStatusProps {
  className?: string;
}

export const StorageStatus: React.FC<StorageStatusProps> = ({ className = '' }) => {
  const [status, setStatus] = useState({
    localStorage: 0,
    cloudEnabled: false,
    userId: 'unknown'
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const listeners = useEventListeners();

  useEffect(() => {
    // Update status
    const updateStatus = () => {
      setStatus(HybridShowService.getStatus());
    };

    updateStatus();
    
    // Setup event listeners with automatic cleanup
    const handleShowsUpdate = () => updateStatus();
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    listeners.add(window, 'shows-updated', handleShowsUpdate);
    listeners.add(window, 'online', handleOnline);
    listeners.add(window, 'offline', handleOffline);
  }, [listeners]);

  const getStorageIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4 text-gray-400" />;
    if (status.cloudEnabled) return <Cloud className="w-4 h-4 text-blue-500" />;
    return <HardDrive className="w-4 h-4 text-orange-500" />;
  };

  const getStorageText = () => {
    if (!isOnline) return 'Offline Mode';
    if (status.cloudEnabled) return 'Cloud Storage';
    return 'Local Only';
  };

  const getStorageDescription = () => {
    if (!isOnline) return 'Working offline. Changes will sync when online.';
    if (status.cloudEnabled) return 'Your data is safely stored in the cloud and syncs across devices.';
    return 'Data is stored locally. Configure Firebase for cloud sync.';
  };

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      {getStorageIcon()}
      <div className="flex flex-col">
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {getStorageText()}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {status.localStorage} shows • {getStorageDescription()}
        </span>
      </div>
    </div>
  );
};

export default StorageStatus;