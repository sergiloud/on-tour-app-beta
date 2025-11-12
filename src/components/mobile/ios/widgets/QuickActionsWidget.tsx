import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, DollarSign, MapPin, Users, Plane } from 'lucide-react';
import { hapticButton } from '../../../../lib/haptics';

interface QuickAction {
  id: string;
  label: string;
  icon: any;
  color: string;
  bgColor: string;
  action: () => void;
}

interface QuickActionsWidgetProps {
  className?: string;
  onActionPress?: (actionId: string) => void;
}

const ACTIONS: QuickAction[] = [
  {
    id: 'new-show',
    label: 'Nuevo Show',
    icon: Plus,
    color: 'text-accent-500',
    bgColor: 'bg-accent-500/20',
    action: () => console.log('New show'),
  },
  {
    id: 'new-expense',
    label: 'Gasto',
    icon: DollarSign,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    action: () => console.log('New expense'),
  },
  {
    id: 'calendar',
    label: 'Calendario',
    icon: Calendar,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    action: () => console.log('Calendar'),
  },
  {
    id: 'map',
    label: 'Mapa',
    icon: MapPin,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    action: () => console.log('Map'),
  },
  {
    id: 'team',
    label: 'Equipo',
    icon: Users,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    action: () => console.log('Team'),
  },
  {
    id: 'travel',
    label: 'Viajes',
    icon: Plane,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    action: () => console.log('Travel'),
  },
];

export const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({ 
  className = '',
  onActionPress,
}) => {
  const handleAction = (action: QuickAction) => {
    hapticButton();
    
    if (onActionPress) {
      onActionPress(action.id);
    } else {
      action.action();
    }
  };

  return (
    <div className={`relative bg-white/5 backdrop-blur-md rounded-[28px] border border-white/10 overflow-hidden shadow-xl p-4 gpu-accelerate ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-accent-500/20 flex items-center justify-center">
          <Plus className="w-4 h-4 text-accent-500" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-bold text-white tracking-tight">Acciones Rápidas</h2>
          <p className="text-[10px] text-white/50 font-medium">Accesos directos</p>
        </div>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-3 gap-3">
        {ACTIONS.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              onClick={() => handleAction(action)}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`w-12 h-12 rounded-xl ${action.bgColor} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${action.color}`} strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-semibold text-white text-center leading-tight">
                {action.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
