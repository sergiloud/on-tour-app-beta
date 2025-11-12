import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Home, Smartphone, Bell, Shield, LogOut } from 'lucide-react';
import type { AppComponentProps } from '../../../../types/mobileOS';

const WIDGETS_KEY = 'mobileOS:widgets';

interface SettingItem {
  label: string;
  description?: string;
  enabled?: boolean;
  onToggle?: () => void;
  type?: 'link' | 'action' | 'toggle';
  danger?: boolean;
}

interface SettingsSection {
  title: string;
  icon: any;
  items: SettingItem[];
}

export const SettingsApp: React.FC<AppComponentProps> = () => {
  const [widgets, setWidgets] = useState({
    whatsNext: true,
    quickStats: false,
  });

  // Load widgets config
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WIDGETS_KEY);
      if (stored) {
        setWidgets(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load widgets config:', error);
    }
  }, []);

  // Save widgets config
  const toggleWidget = (widgetName: 'whatsNext' | 'quickStats') => {
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

  const settingsSections: SettingsSection[] = [
    {
      title: 'Widgets',
      icon: Home,
      items: [
        {
          label: "What's Next",
          description: 'Próximos eventos',
          enabled: widgets.whatsNext,
          onToggle: () => toggleWidget('whatsNext'),
          type: 'toggle',
        },
        {
          label: 'Quick Stats',
          description: 'Estadísticas rápidas',
          enabled: widgets.quickStats,
          onToggle: () => toggleWidget('quickStats'),
          type: 'toggle',
        },
      ],
    },
    {
      title: 'General',
      icon: SettingsIcon,
      items: [
        {
          label: 'Dispositivo',
          description: 'Información del dispositivo',
          type: 'link',
        },
        {
          label: 'Notificaciones',
          description: 'Gestionar alertas',
          type: 'link',
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 350,
              damping: 30,
              delay: sectionIndex * 0.1,
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
                <div
                  key={item.label}
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
                    <div className="text-white/30">›</div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* App Info */}
        <div className="text-center text-white/40 text-xs pt-4">
          <p>On Tour App</p>
          <p className="mt-1">Version 2.0.0</p>
        </div>
      </div>
    </div>
  );
};
