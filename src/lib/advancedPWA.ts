// import { registerSW } from 'virtual:pwa-register'; // Will be enabled after PWA plugin setup
import { toast } from 'sonner';
import { t } from './pwaI18n';

// Temporary mock for registerSW until PWA plugin is fully configured
const registerSW = (options: any) => {
  console.log('🔧 PWA Service Worker registration (mock mode)', options);
  return () => Promise.resolve();
};

export interface PWAInstallPrompt {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWACapabilities {
  isStandalone: boolean;
  isInstallable: boolean;
  isOnline: boolean;
  hasNotifications: boolean;
  hasBackgroundSync: boolean;
  hasPushMessaging: boolean;
}

class AdvancedPWAService {
  private updateSW: ((reloadPage?: boolean) => Promise<void>) | null = null;
  private installPrompt: PWAInstallPrompt | null = null;
  private isOfflineMode = false;
  private syncQueue: Array<{ action: string; data: any; timestamp: number }> = [];

  constructor() {
    this.initializeServiceWorker();
    this.setupInstallPrompt();
    this.setupOfflineHandling();
    this.setupBackgroundSync();
  }

  private initializeServiceWorker(): void {
    if ('serviceWorker' in navigator) {
      this.updateSW = registerSW({
        onNeedRefresh: () => {
          toast.info(t('pwa.updateAvailable'), {
            description: t('pwa.updateDescription'),
            action: {
              label: t('pwa.updateNow'),
              onClick: () => this.updateSW?.(true),
            },
            duration: 10000,
          });
        },
        onOfflineReady: () => {
          toast.success(t('pwa.offlineReady'), {
            description: t('pwa.offlineDescription'),
            duration: 5000,
          });
        },
        onRegistered: (registration: ServiceWorkerRegistration) => {
          console.log('✅ SW registered:', registration);
          this.setupPeriodicSync(registration);
        },
        onRegisterError: (error: Error) => {
          console.error('❌ SW registration failed:', error);
        },
      });
    }
  }

  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e as any;
      
      toast.info(t('pwa.installAvailable'), {
        description: t('pwa.installDescription'),
        action: {
          label: t('pwa.installNow'),
          onClick: () => this.showInstallPrompt(),
        },
        duration: 15000,
      });
    });

    window.addEventListener('appinstalled', () => {
      toast.success(t('pwa.installSuccess'), {
        description: t('pwa.installSuccessDescription'),
        duration: 5000,
      });
      this.installPrompt = null;
    });
  }

  private setupOfflineHandling(): void {
    const updateOnlineStatus = () => {
      const wasOffline = this.isOfflineMode;
      this.isOfflineMode = !navigator.onLine;
      
      if (wasOffline && navigator.onLine) {
        toast.success(t('pwa.backOnline'), {
          description: t('pwa.backOnlineDescription'),
          duration: 3000,
        });
        this.processSyncQueue();
      } else if (!wasOffline && !navigator.onLine) {
        toast.warning(t('pwa.offlineMode'), {
          description: t('pwa.offlineModeDescription'),
          duration: 5000,
        });
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
  }

  private setupBackgroundSync(): void {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        // Register background sync
        registration.sync.register('background-sync').catch((error) => {
          console.warn('Background sync not supported:', error);
        });
      });
    }
  }

  private setupPeriodicSync(registration: ServiceWorkerRegistration): void {
    if ('periodicSync' in registration) {
      // Request periodic sync for data updates (requires user engagement)
      (registration as any).periodicSync.register('periodic-sync', {
        minInterval: 24 * 60 * 60 * 1000, // 24 hours
      }).then(() => {
        console.log('✅ Periodic sync registered');
      }).catch((error: Error) => {
        console.warn('Periodic sync not supported:', error.message);
      });
    }
  }

  async showInstallPrompt(): Promise<boolean> {
    if (!this.installPrompt) {
      toast.error(t('pwa.installNotAvailable'));
      return false;
    }

    try {
      await this.installPrompt.prompt();
      const choiceResult = await this.installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ User accepted install prompt');
        return true;
      } else {
        console.log('❌ User dismissed install prompt');
        return false;
      }
    } catch (error) {
      console.error('Install prompt failed:', error);
      toast.error(t('pwa.installError'));
      return false;
    } finally {
      this.installPrompt = null;
    }
  }

  getCapabilities(): PWACapabilities {
    return {
      isStandalone: window.matchMedia('(display-mode: standalone)').matches || 
                   (window.navigator as any).standalone === true,
      isInstallable: this.installPrompt !== null,
      isOnline: navigator.onLine,
      hasNotifications: 'Notification' in window,
      hasBackgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      hasPushMessaging: 'PushManager' in window && 'serviceWorker' in navigator,
    };
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    let permission = Notification.permission;
    
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission === 'granted') {
      toast.success(t('pwa.notificationsEnabled'));
    } else {
      toast.warning(t('pwa.notificationsDenied'));
    }

    return permission;
  }

  showNotification(title: string, options?: NotificationOptions): void {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: 'on-tour-notification',
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    }
  }

  addToSyncQueue(action: string, data: any): void {
    this.syncQueue.push({
      action,
      data,
      timestamp: Date.now(),
    });

    // Persist to localStorage for persistence across sessions
    try {
      localStorage.setItem('pwa-sync-queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.warn('Failed to persist sync queue:', error);
    }

    // Try immediate sync if online
    if (navigator.onLine) {
      this.processSyncQueue();
    }
  }

  private async processSyncQueue(): Promise<void> {
    if (this.syncQueue.length === 0) return;

    console.log(`🔄 Processing ${this.syncQueue.length} queued actions...`);
    
    const processedItems: number[] = [];
    
    for (let i = 0; i < this.syncQueue.length; i++) {
      const item = this.syncQueue[i];
      
      if (!item) continue;
      
      try {
        // Simulate API call - replace with actual sync logic
        await this.syncAction(item);
        processedItems.push(i);
        
        console.log(`✅ Synced action: ${item.action}`);
      } catch (error) {
        console.error(`❌ Failed to sync action ${item.action}:`, error);
        
        // Remove items older than 24 hours to prevent infinite queue growth
        const dayOld = Date.now() - (24 * 60 * 60 * 1000);
        if (item.timestamp < dayOld) {
          processedItems.push(i);
        }
      }
    }

    // Remove processed items (in reverse order to maintain indices)
    for (let i = processedItems.length - 1; i >= 0; i--) {
      const index = processedItems[i];
      if (index !== undefined) {
        this.syncQueue.splice(index, 1);
      }
    }

    // Update localStorage
    try {
      if (this.syncQueue.length === 0) {
        localStorage.removeItem('pwa-sync-queue');
      } else {
        localStorage.setItem('pwa-sync-queue', JSON.stringify(this.syncQueue));
      }
    } catch (error) {
      console.warn('Failed to update sync queue storage:', error);
    }

    if (processedItems.length > 0) {
      toast.success(t('pwa.syncComplete'), {
        description: t('pwa.syncCompleteDescription', { count: processedItems.length }),
        duration: 3000,
      });
    }
  }

  private async syncAction(item: { action: string; data: any; timestamp: number }): Promise<void> {
    // Replace with actual API sync logic based on action type
    switch (item.action) {
      case 'save-show':
        // await api.shows.create(item.data);
        break;
      case 'update-show':
        // await api.shows.update(item.data.id, item.data);
        break;
      case 'delete-show':
        // await api.shows.delete(item.data.id);
        break;
      case 'save-transaction':
        // await api.finance.createTransaction(item.data);
        break;
      default:
        console.warn(`Unknown sync action: ${item.action}`);
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  loadSyncQueue(): void {
    try {
      const stored = localStorage.getItem('pwa-sync-queue');
      if (stored) {
        this.syncQueue = JSON.parse(stored);
        console.log(`📥 Loaded ${this.syncQueue.length} items from sync queue`);
      }
    } catch (error) {
      console.warn('Failed to load sync queue:', error);
      this.syncQueue = [];
    }
  }

  async clearCache(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => caches.delete(name))
      );
      
      toast.success(t('pwa.cacheCleared'), {
        description: t('pwa.cacheClearedDescription'),
        duration: 3000,
      });
    }
  }

  async getCacheSize(): Promise<number> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    }
    return 0;
  }

  async getStorageUsage(): Promise<{ used: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        quota: estimate.quota || 0,
      };
    }
    return { used: 0, quota: 0 };
  }
}

// Create singleton instance
export const advancedPWA = new AdvancedPWAService();

// Initialize sync queue on load
advancedPWA.loadSyncQueue();

// Export for use in components  
export { AdvancedPWAService };