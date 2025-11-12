import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Home, 
  Smartphone, 
  Bell, 
  Shield, 
  LogOut,
  Moon,
  Palette,
  Vibrate,
  Zap,
  ChevronRight
} from 'lucide-react';
import type { AppComponentProps } from '../../../../types/mobileOS';
import { useNotifications, requestNotificationPermission } from '../../../../stores/notificationStore';
import { ThemeSelector } from '../ThemeSelector';

const WIDGETS_KEY = 'mobileOS:widgets';
const HAPTIC_KEY = 'mobileOS:haptic';
const THEME_KEY = 'mobileOS:theme';

interface SettingItem {
  label: string;
  description?: string;
  enabled?: boolean;
  onToggle?: () => void;
  type?: 'link' | 'action' | 'toggle' | 'custom';
  danger?: boolean;
  onClick?: () => void;
  component?: React.ReactNode;
}

interface SettingsSection {
  title: string;
  icon: any;
  items: SettingItem[];
}

export const SettingsApp: React.FC<AppComponentProps> = () => {
  const { addNotification } = useNotifications();
  
  const [widgets, setWidgets] = useState({
    whatsNext: true,
    quickStats: false,
    tasks: false,
    financeStats: false,
    nearbyShows: false,
    quickActions: false,
  });
  
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [showDeviceInfo, setShowDeviceInfo] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    'Notification' in window && Notification.permission === 'granted'
  );

  // Load widgets config
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WIDGETS_KEY);
      if (stored) {
        setWidgets(JSON.parse(stored));
      }
      
      const haptic = localStorage.getItem(HAPTIC_KEY);
      if (haptic !== null) {
        setHapticEnabled(JSON.parse(haptic));
      }
      
      const theme = localStorage.getItem(THEME_KEY);
      if (theme !== null) {
        setDarkMode(JSON.parse(theme));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  // Save widgets config
  const toggleWidget = (widgetName: 'whatsNext' | 'quickStats' | 'tasks' | 'financeStats' | 'nearbyShows' | 'quickActions') => {
    const newWidgets = {
      ...widgets,
      [widgetName]: !widgets[widgetName],
    };
    setWidgets(newWidgets);
    
    try {
      localStorage.setItem(WIDGETS_KEY, JSON.stringify(newWidgets));
      // Trigger storage event for cross-component sync
      window.dispatchEvent(new StorageEvent('storage', {
        key: WIDGETS_KEY,
        newValue: JSON.stringify(newWidgets),
      }));
    } catch (error) {
      console.error('Failed to save widgets config:', error);
    }
  };

  // Toggle haptic feedback
  const toggleHaptic = () => {
    const newValue = !hapticEnabled;
    setHapticEnabled(newValue);
    localStorage.setItem(HAPTIC_KEY, JSON.stringify(newValue));
    
    if (newValue && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  // Toggle dark mode (placeholder)
  const toggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    localStorage.setItem(THEME_KEY, JSON.stringify(newValue));
    
    if (navigator.vibrate && hapticEnabled) {
      navigator.vibrate(10);
    }
  };

  // Toggle notifications
  const toggleNotifications = async () => {
    if (navigator.vibrate && hapticEnabled) {
      navigator.vibrate(10);
    }

    if (!notificationsEnabled) {
      // Request permission
      const granted = await requestNotificationPermission();
      setNotificationsEnabled(granted);
      
      if (granted) {
        addNotification({
          type: 'system',
          title: 'Notificaciones activadas',
          message: 'Ahora recibirás notificaciones de tus shows y eventos',
          priority: 'low',
        });
      } else {
        // Show alert if denied
        addNotification({
          type: 'system',
          title: 'Notificaciones bloqueadas',
          message: 'Permite las notificaciones en la configuración de tu navegador',
          priority: 'medium',
        });
      }
    } else {
      // Disable notifications
      setNotificationsEnabled(false);
      addNotification({
        type: 'system',
        title: 'Notificaciones desactivadas',
        message: 'Ya no recibirás notificaciones',
        priority: 'low',
      });
    }
  };

  // Test notification
  const sendTestNotification = () => {
    const notifications = [
      {
        type: 'show' as const,
        title: 'Nuevo show añadido',
        message: 'Show en Madrid - 15 de Mayo',
        priority: 'medium' as const,
      },
      {
        type: 'finance' as const,
        title: 'Gasto registrado',
        message: 'Hotel Barcelona - €350',
        priority: 'low' as const,
      },
      {
        type: 'task' as const,
        title: 'Tarea pendiente',
        message: 'Revisar contratos antes del viernes',
        priority: 'high' as const,
      },
    ];

    const random = notifications[Math.floor(Math.random() * notifications.length)];
    if (random) {
      addNotification(random);
    }
  };

  const settingsSections: SettingsSection[] = [
    {
      title: 'Widgets',
      icon: Home,
      items: [
        {
          label: "What's Next",
          description: 'Próximos eventos y calendario',
          enabled: widgets.whatsNext,
          onToggle: () => toggleWidget('whatsNext'),
          type: 'toggle',
        },
        {
          label: 'Quick Stats',
          description: 'Estadísticas rápidas del tour',
          enabled: widgets.quickStats,
          onToggle: () => toggleWidget('quickStats'),
          type: 'toggle',
        },
        {
          label: 'Tareas',
          description: 'Lista de tareas pendientes',
          enabled: widgets.tasks,
          onToggle: () => toggleWidget('tasks'),
          type: 'toggle',
        },
        {
          label: 'Gastos',
          description: 'Últimos gastos registrados',
          enabled: widgets.financeStats,
          onToggle: () => toggleWidget('financeStats'),
          type: 'toggle',
        },
        {
          label: 'Shows Cercanos',
          description: 'Shows próximos cerca de ti',
          enabled: widgets.nearbyShows,
          onToggle: () => toggleWidget('nearbyShows'),
          type: 'toggle',
        },
        {
          label: 'Acciones Rápidas',
          description: 'Accesos directos a funciones',
          enabled: widgets.quickActions,
          onToggle: () => toggleWidget('quickActions'),
          type: 'toggle',
        },
      ],
    },
    {
      title: 'Notificaciones',
      icon: Bell,
      items: [
        {
          label: 'Activar notificaciones',
          description: 'Recibe alertas de shows y eventos',
          enabled: notificationsEnabled,
          onToggle: toggleNotifications,
          type: 'toggle',
        },
        {
          label: 'Probar notificación',
          description: 'Enviar notificación de prueba',
          type: 'action',
          onClick: sendTestNotification,
        },
      ],
    },
    {
      title: 'Apariencia',
      icon: Palette,
      items: [
        {
          label: 'Tema',
          description: 'Personaliza los colores',
          type: 'custom',
          component: <ThemeSelector />,
        },
        {
          label: 'Modo oscuro',
          description: 'Reducir brillo de pantalla',
          enabled: darkMode,
          onToggle: toggleDarkMode,
          type: 'toggle',
        },
        {
          label: 'Retroalimentación háptica',
          description: 'Vibración al tocar',
          enabled: hapticEnabled,
          onToggle: toggleHaptic,
          type: 'toggle',
        },
      ],
    },
    {
      title: 'Interacción',
      icon: Zap,
      items: [
        {
          label: 'Feedback Háptico',
          description: 'Vibraciones al tocar',
          enabled: hapticEnabled,
          onToggle: toggleHaptic,
          type: 'toggle',
        },
      ],
    },
    {
      title: 'Dispositivo',
      icon: Smartphone,
      items: [
        {
          label: 'Información',
          description: 'Detalles del dispositivo',
          type: 'link',
          onClick: () => setShowDeviceInfo(!showDeviceInfo),
        },
      ],
    },
    {
      title: 'Cuenta',
      icon: Shield,
      items: [
        {
          label: 'Privacidad',
          description: 'Configuración de datos',
          type: 'link',
        },
        {
          label: 'Cerrar sesión',
          description: 'Salir de la cuenta',
          type: 'action',
          danger: true,
        },
      ],
    },
  ];

  return (
    <div className="h-full overflow-y-auto bg-ink-950">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-accent-500/20 flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-accent-500" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Ajustes</h1>
            <p className="text-sm text-white/60">Personaliza tu experiencia</p>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="px-4 pb-24 space-y-6">
        {settingsSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.2,
              ease: [0.4, 0, 0.2, 1],
              delay: sectionIndex * 0.05,
            }}
          >
            {/* Section Header */}
            <div className="flex items-center gap-2 px-2 mb-3">
              <section.icon className="w-4 h-4 text-accent-500" strokeWidth={2.5} />
              <h2 className="text-xs font-bold text-white/70 uppercase tracking-wider">
                {section.title}
              </h2>
            </div>

            {/* Section Items */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
              {section.items.map((item, itemIndex) => (
                <div key={item.label}>
                  {/* Custom component rendering */}
                  {item.type === 'custom' && item.component ? (
                    <div className="p-4 border-b border-white/5 last:border-b-0">
                      <div className="mb-3">
                        <div className="font-medium text-white">{item.label}</div>
                        {item.description && (
                          <div className="text-xs text-white/50 mt-0.5">{item.description}</div>
                        )}
                      </div>
                      {item.component}
                    </div>
                  ) : (
                    <div
                      className={`
                        p-4 flex items-center justify-between
                        ${itemIndex !== section.items.length - 1 ? 'border-b border-white/5' : ''}
                        ${item.type !== 'toggle' && !item.danger ? 'hover:bg-white/5 cursor-pointer' : ''}
                        ${item.danger ? 'hover:bg-red-500/10' : ''}
                        transition-colors
                      `}
                      onClick={item.type === 'action' && !item.onToggle ? () => {} : undefined}
                    >
                      <div className="flex-1">
                        <div className={`font-medium ${item.danger ? 'text-red-400' : 'text-white'}`}>
                          {item.label}
                        </div>
                        {item.description && (
                          <div className="text-xs text-white/50 mt-0.5">{item.description}</div>
                        )}
                      </div>

                      {/* Toggle Switch for widgets */}
                      {item.onToggle && (
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            item.onToggle!();
                          }}
                          className={`
                            relative w-12 h-7 rounded-full transition-colors
                            ${item.enabled ? 'bg-accent-500' : 'bg-white/20'}
                          `}
                          whileTap={{ scale: 0.95 }}
                        >
                          <motion.div
                            className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
                            animate={{
                              left: item.enabled ? '26px' : '4px',
                            }}
                            transition={{
                              type: 'spring',
                              stiffness: 500,
                              damping: 30,
                            }}
                          />
                        </motion.button>
                      )}

                      {/* Arrow for links */}
                      {item.type === 'link' && (
                        <ChevronRight className="w-5 h-5 text-white/30" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Device Info Panel */}
        <AnimatePresence>
          {showDeviceInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
                <h3 className="text-white font-semibold mb-3 text-sm">Información del Dispositivo</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/50">User Agent</span>
                    <span className="text-white/80 text-right max-w-[60%] truncate">
                      {navigator.userAgent.split(' ')[0]}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Pantalla</span>
                    <span className="text-white/80">{window.innerWidth}×{window.innerHeight}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Vibración</span>
                    <span className={'vibrate' in navigator ? 'text-green-400' : 'text-white/30'}>
                      {'vibrate' in navigator ? 'Soportado' : 'No soportado'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Online</span>
                    <span className={navigator.onLine ? 'text-green-400' : 'text-red-400'}>
                      {navigator.onLine ? 'Conectado' : 'Desconectado'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* App Info */}
        <div className="text-center text-white/40 text-xs pt-4">
          <p>On Tour App</p>
          <p className="mt-1">Version 2.0.0</p>
        </div>
      </div>
    </div>
  );
};
