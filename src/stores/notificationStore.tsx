import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useMemoryManagement, useListenerCleanup } from '../lib/memoryManagement';

export interface Notification {
  id: string;
  type: 'show' | 'task' | 'finance' | 'system';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
  icon?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = 'notifications-storage';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Memory management for notification provider
  const { isMounted, safeSetState } = useMemoryManagement('NotificationProvider');
  const { addListener } = useListenerCleanup('notification-events');
  
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [unreadCount, setUnreadCount] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const notifs: Notification[] = JSON.parse(stored);
        return notifs.filter(n => !n.read).length;
      } catch {
        return 0;
      }
    }
    return 0;
  });
  
  // Safe state setters
  const safeSetNotifications = safeSetState(setNotifications);
  const safeSetUnreadCount = safeSetState(setUnreadCount);

  // Persist to localStorage safely
  useEffect(() => {
    if (!isMounted()) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
      safeSetUnreadCount(notifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to persist notifications:', error);
    }
  }, [notifications, isMounted, safeSetUnreadCount]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    if (!isMounted()) return;
    
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: false,
    };

    safeSetNotifications(prev => [newNotification, ...prev].slice(0, 50));

    // Show browser notification if supported (with cleanup)
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotif = new Notification(newNotification.title, {
        body: newNotification.message,
        icon: '/logo-192.png',
        badge: '/logo-192.png',
        tag: newNotification.id,
      });
      
      // Auto-close and cleanup after 5 seconds
      const cleanup = () => {
        try {
          browserNotif.close();
        } catch {}
      };
      
      setTimeout(cleanup, 5000);
      addListener(cleanup);
    }

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([10, 50, 10]);
    }
  }, [isMounted, safeSetNotifications, addListener]);

  const markAsRead = useCallback((id: string) => {
    if (!isMounted()) return;
    safeSetNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, [isMounted, safeSetNotifications]);

  const markAllAsRead = useCallback(() => {
    if (!isMounted()) return;
    safeSetNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, [isMounted, safeSetNotifications]);

  const deleteNotification = useCallback((id: string) => {
    if (!isMounted()) return;
    safeSetNotifications(prev => prev.filter(n => n.id !== id));
  }, [isMounted, safeSetNotifications]);

  const clearAll = useCallback(() => {
    if (!isMounted()) return;
    safeSetNotifications([]);
  }, [isMounted, safeSetNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// Helper function to request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};
