// Add PWA-related i18n keys to both English and Spanish

// Add these keys to the existing i18n system
export const pwaKeys = {
  en: {
    'pwa.updateAvailable': 'App Update Available',
    'pwa.updateDescription': 'A new version of the app is ready to install',
    'pwa.updateNow': 'Update Now',
    'pwa.offlineReady': 'App Ready for Offline Use',
    'pwa.offlineDescription': 'The app is cached and ready to work offline',
    'pwa.installAvailable': 'Install App Available',
    'pwa.installDescription': 'Install the app for a better experience',
    'pwa.installNow': 'Install Now',
    'pwa.installSuccess': 'App Installed Successfully',
    'pwa.installSuccessDescription': 'You can now use the app from your home screen',
    'pwa.installNotAvailable': 'Installation not available',
    'pwa.installError': 'Installation failed',
    'pwa.backOnline': 'Back Online',
    'pwa.backOnlineDescription': 'Connection restored, syncing data...',
    'pwa.offlineMode': 'Offline Mode',
    'pwa.offlineModeDescription': 'Changes will sync when connection is restored',
    'pwa.notificationsEnabled': 'Notifications Enabled',
    'pwa.notificationsDenied': 'Notifications Denied',
    'pwa.syncComplete': 'Sync Complete',
    'pwa.syncCompleteDescription': 'Synced {count} pending changes',
    'pwa.cacheCleared': 'Cache Cleared',
    'pwa.cacheClearedDescription': 'App cache has been cleared successfully',
  },
  es: {
    'pwa.updateAvailable': 'Actualización Disponible',
    'pwa.updateDescription': 'Una nueva versión de la app está lista para instalar',
    'pwa.updateNow': 'Actualizar Ahora',
    'pwa.offlineReady': 'App Lista para Uso Offline',
    'pwa.offlineDescription': 'La app está guardada y lista para funcionar sin conexión',
    'pwa.installAvailable': 'Instalación Disponible',
    'pwa.installDescription': 'Instala la app para una mejor experiencia',
    'pwa.installNow': 'Instalar Ahora',
    'pwa.installSuccess': 'App Instalada Exitosamente',
    'pwa.installSuccessDescription': 'Ahora puedes usar la app desde tu pantalla principal',
    'pwa.installNotAvailable': 'Instalación no disponible',
    'pwa.installError': 'Error de instalación',
    'pwa.backOnline': 'De Vuelta Online',
    'pwa.backOnlineDescription': 'Conexión restaurada, sincronizando datos...',
    'pwa.offlineMode': 'Modo Offline',
    'pwa.offlineModeDescription': 'Los cambios se sincronizarán cuando se restaure la conexión',
    'pwa.notificationsEnabled': 'Notificaciones Habilitadas',
    'pwa.notificationsDenied': 'Notificaciones Denegadas',
    'pwa.syncComplete': 'Sincronización Completa',
    'pwa.syncCompleteDescription': 'Sincronizados {count} cambios pendientes',
    'pwa.cacheCleared': 'Caché Limpiada',
    'pwa.cacheClearedDescription': 'La caché de la app se ha limpiado exitosamente',
  },
};

// Helper function to get translation with fallback
export const t = (key: string, params?: Record<string, any>): string => {
  // This would integrate with your existing i18n system
  // For now, return the key as placeholder
  let translation = key;
  
  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      translation = translation.replace(`{${paramKey}}`, String(value));
    });
  }
  
  return translation;
};