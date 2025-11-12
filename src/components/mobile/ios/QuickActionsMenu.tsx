import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Calendar, DollarSign, MapPin, X, Users, BarChart3, 
  FileText, Music, Building2, Link, StickyNote, Folder, Plane
} from 'lucide-react';
import type { AppDefinition } from '../../../types/mobileOS';

interface QuickAction {
  id: string;
  label: string;
  icon: any;
  color: string;
  bgColor: string;
  action: () => void;
}

interface QuickActionsMenuProps {
  app: AppDefinition;
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
}

// Define quick actions per app
const APP_QUICK_ACTIONS: Record<string, QuickAction[]> = {
  shows: [
    {
      id: 'new-show',
      label: 'Nuevo Show',
      icon: Plus,
      color: 'text-accent-500',
      bgColor: 'bg-accent-500/20',
      action: () => console.log('New show'),
    },
    {
      id: 'view-upcoming',
      label: 'Próximos',
      icon: Calendar,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      action: () => console.log('View upcoming'),
    },
  ],
  calendar: [
    {
      id: 'new-event',
      label: 'Nuevo Evento',
      icon: Plus,
      color: 'text-accent-500',
      bgColor: 'bg-accent-500/20',
      action: () => console.log('New event'),
    },
    {
      id: 'today',
      label: 'Hoy',
      icon: Calendar,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      action: () => console.log('Today'),
    },
  ],
  finance: [
    {
      id: 'new-expense',
      label: 'Nuevo Gasto',
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      action: () => console.log('New expense'),
    },
    {
      id: 'view-summary',
      label: 'Resumen',
      icon: BarChart3,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      action: () => console.log('Summary'),
    },
  ],
  travel: [
    {
      id: 'new-trip',
      label: 'Nuevo Viaje',
      icon: Plus,
      color: 'text-accent-500',
      bgColor: 'bg-accent-500/20',
      action: () => console.log('New trip'),
    },
    {
      id: 'view-map',
      label: 'Ver Mapa',
      icon: MapPin,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      action: () => console.log('View map'),
    },
  ],
  contacts: [
    {
      id: 'new-contact',
      label: 'Nuevo Contacto',
      icon: Plus,
      color: 'text-accent-500',
      bgColor: 'bg-accent-500/20',
      action: () => console.log('New contact'),
    },
    {
      id: 'search',
      label: 'Buscar',
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      action: () => console.log('Search'),
    },
  ],
  reports: [
    {
      id: 'pl-report',
      label: 'Informe P&L',
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      action: () => console.log('P&L Report'),
    },
    {
      id: 'tour-summary',
      label: 'Resumen Tour',
      icon: Music,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      action: () => console.log('Tour Summary'),
    },
    {
      id: 'tax-report',
      label: 'Informe Fiscal',
      icon: FileText,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      action: () => console.log('Tax Report'),
    },
  ],
  files: [
    {
      id: 'upload',
      label: 'Subir Archivo',
      icon: Plus,
      color: 'text-accent-500',
      bgColor: 'bg-accent-500/20',
      action: () => console.log('Upload file'),
    },
    {
      id: 'recent',
      label: 'Recientes',
      icon: Folder,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      action: () => console.log('Recent files'),
    },
  ],
  artists: [
    {
      id: 'new-artist',
      label: 'Nuevo Artista',
      icon: Plus,
      color: 'text-accent-500',
      bgColor: 'bg-accent-500/20',
      action: () => console.log('New artist'),
    },
    {
      id: 'favorites',
      label: 'Favoritos',
      icon: Music,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      action: () => console.log('Favorites'),
    },
  ],
  venues: [
    {
      id: 'new-venue',
      label: 'Nuevo Venue',
      icon: Plus,
      color: 'text-accent-500',
      bgColor: 'bg-accent-500/20',
      action: () => console.log('New venue'),
    },
    {
      id: 'nearby',
      label: 'Cercanos',
      icon: MapPin,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      action: () => console.log('Nearby venues'),
    },
  ],
  links: [
    {
      id: 'new-link',
      label: 'Nuevo Link',
      icon: Plus,
      color: 'text-accent-500',
      bgColor: 'bg-accent-500/20',
      action: () => console.log('New link'),
    },
    {
      id: 'pinned',
      label: 'Fijados',
      icon: Link,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      action: () => console.log('Pinned links'),
    },
  ],
  notes: [
    {
      id: 'new-note',
      label: 'Nueva Nota',
      icon: Plus,
      color: 'text-accent-500',
      bgColor: 'bg-accent-500/20',
      action: () => console.log('New note'),
    },
    {
      id: 'pinned',
      label: 'Fijadas',
      icon: StickyNote,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      action: () => console.log('Pinned notes'),
    },
  ],
};

export const QuickActionsMenu: React.FC<QuickActionsMenuProps> = ({
  app,
  isOpen,
  onClose,
  position,
}) => {
  const actions = APP_QUICK_ACTIONS[app.id] || [];

  if (actions.length === 0) return null;

  const handleAction = (action: QuickAction) => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    action.action();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{
              position: 'fixed',
              left: position.x,
              top: position.y,
              transform: 'translate(-50%, -100%) translateY(-16px)',
            }}
            className="z-50 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-3 min-w-[200px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <app.icon className="w-5 h-5 text-accent-500" strokeWidth={2} />
                <span className="text-sm font-bold text-white">{app.name}</span>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-white/60" strokeWidth={2} />
              </button>
            </div>

            {/* Actions */}
            <div className="space-y-1.5">
              {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.id}
                    onClick={() => handleAction(action)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-left"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className={`w-8 h-8 rounded-xl ${action.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${action.color}`} strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-semibold text-white">{action.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
