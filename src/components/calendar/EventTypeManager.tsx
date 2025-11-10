import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { t } from '../../lib/i18n';

export type EventType = {
  id: string;
  name: string;
  color: string; // Tailwind color class like 'bg-blue-500'
  icon: string; // emoji or icon name
  description?: string;
  isDefault?: boolean;
};

export const DEFAULT_EVENT_TYPES: EventType[] = [
  { id: 'show', name: 'Show', icon: '🎤', color: 'bg-gradient-to-r from-emerald-500 to-green-600', isDefault: true },
  { id: 'travel', name: 'Travel', icon: '✈️', color: 'bg-gradient-to-r from-sky-500 to-blue-600', isDefault: true },
  { id: 'meeting', name: 'Meeting', icon: '📞', color: 'bg-gradient-to-r from-purple-500 to-pink-600', isDefault: true },
  { id: 'rehearsal', name: 'Rehearsal', icon: '🎸', color: 'bg-gradient-to-r from-yellow-500 to-orange-600', isDefault: true },
  { id: 'break', name: 'Break', icon: '☕', color: 'bg-gradient-to-r from-gray-400 to-gray-600', isDefault: true },
];

type Props = {
  eventTypes: EventType[];
  onTypesChange: (types: EventType[]) => void;
};

/**
 * Event Type Manager Component
 * Allows creation, editing, and deletion of custom event types
 * Maintains a collection of event type definitions with colors and icons
 */
const EventTypeManager: React.FC<Props> = ({ eventTypes, onTypesChange }) => {
  const [expanded, setExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeIcon, setNewTypeIcon] = useState('📍');
  const [newTypeColor, setNewTypeColor] = useState('bg-gradient-to-r from-indigo-500 to-purple-600');

  const colors = [
    'bg-gradient-to-r from-red-500 to-pink-600',
    'bg-gradient-to-r from-orange-500 to-red-600',
    'bg-gradient-to-r from-yellow-500 to-orange-600',
    'bg-gradient-to-r from-green-500 to-emerald-600',
    'bg-gradient-to-r from-cyan-500 to-blue-600',
    'bg-gradient-to-r from-blue-500 to-indigo-600',
    'bg-gradient-to-r from-indigo-500 to-purple-600',
    'bg-gradient-to-r from-pink-500 to-rose-600',
    'bg-gradient-to-r from-slate-500 to-gray-600',
    'bg-gradient-to-r from-violet-500 to-purple-600',
  ];

  const icons = ['🎤', '✈️', '📞', '🎸', '☕', '📍', '🏨', '🚗', '🍽️', '💼', '📅', '🎬', '🎥', '📷', '🎵'];

  const handleAddType = useCallback(() => {
    if (!newTypeName.trim()) return;

    const newType: EventType = {
      id: `custom-${Date.now()}`,
      name: newTypeName,
      icon: newTypeIcon,
      color: newTypeColor,
      description: '',
    };

    onTypesChange([...eventTypes, newType]);
    setNewTypeName('');
    setNewTypeIcon('📍');
    setNewTypeColor('bg-gradient-to-r from-indigo-500 to-purple-600');
  }, [newTypeName, newTypeIcon, newTypeColor, eventTypes, onTypesChange]);

  const handleDeleteType = useCallback((id: string) => {
    if (eventTypes.find(t => t.id === id)?.isDefault) {
      alert(t('calendar.eventType.cannotDeleteDefault') || 'Cannot delete default event types');
      return;
    }
    onTypesChange(eventTypes.filter(type => type.id !== id));
  }, [eventTypes, onTypesChange]);

  const handleUpdateType = useCallback((id: string, updates: Partial<EventType>) => {
    onTypesChange(eventTypes.map(type => type.id === id ? { ...type, ...updates } : type));
    setEditingId(null);
  }, [eventTypes, onTypesChange]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg bg-gradient-to-br from-slate-900/30 to-slate-800/20 border border-slate-200 dark:border-white/10 p-4"
    >
      {/* Header */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-slate-600 dark:text-white/80 hover:text-white transition"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🏷️</span>
          <span className="font-semibold">{t('calendar.eventType.manager') || 'Event Types'}</span>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          ▼
        </motion.div>
      </motion.button>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 space-y-4"
          >
            {/* Existing Types */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 dark:text-white/60 uppercase">{t('calendar.eventType.existing') || 'Event Types'}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                {eventTypes.map((type) => (
                  <motion.div
                    key={type.id}
                    whileHover={{ scale: 1.02 }}
                    className={`flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-white/10 ${type.color} bg-opacity-10 hover:bg-opacity-20 transition-all`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{type.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{type.name}</p>
                        {type.description && <p className="text-xs text-slate-400 dark:text-white/60">{type.description}</p>}
                      </div>
                    </div>
                    {!type.isDefault && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteType(type.id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Add New Type */}
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs font-semibold text-slate-400 dark:text-white/60 uppercase mb-3">{t('calendar.eventType.create') || 'Create New Type'}</p>

              <div className="space-y-3">
                {/* Name Input */}
                <input
                  type="text"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder={t('calendar.eventType.namePlaceholder') || 'Event type name (e.g., Photo Shoot)'}
                  className="w-full px-3 py-2 rounded-lg bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/20 text-white placeholder-slate-400 dark:placeholder-slate-400 dark:placeholder-white/40 focus:outline-none focus:border-accent-500/50 transition-colors"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddType()}
                />

                {/* Icon Selector */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 dark:text-white/60 mb-2 block">Icon</label>
                  <div className="grid grid-cols-8 gap-2">
                    {icons.map((icon) => (
                      <motion.button
                        key={icon}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setNewTypeIcon(icon)}
                        className={`p-2 rounded-lg text-xl transition-all ${
                          newTypeIcon === icon
                            ? 'bg-accent-500/30 border border-accent-500/50'
                            : 'bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {icon}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Color Selector */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 dark:text-white/60 mb-2 block">Color</label>
                  <div className="grid grid-cols-5 gap-2">
                    {colors.map((color) => (
                      <motion.button
                        key={color}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setNewTypeColor(color)}
                        className={`p-3 rounded-lg transition-all border-2 ${color} ${
                          newTypeColor === color
                            ? 'border-white/80 shadow-lg'
                            : 'border-slate-300 dark:border-white/20 hover:border-white/40'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Preview */}
                {newTypeName && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg ${newTypeColor} flex items-center gap-2`}
                  >
                    <span className="text-xl">{newTypeIcon}</span>
                    <span className="font-medium text-slate-900 dark:text-white">{newTypeName}</span>
                  </motion.div>
                )}

                {/* Add Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddType}
                  disabled={!newTypeName.trim()}
                  className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-accent-500 to-accent-600 text-black font-semibold disabled:opacity-50 transition-all"
                >
                  <Plus size={16} className="inline mr-2" />
                  {t('calendar.eventType.add') || 'Add Event Type'}
                </motion.button>
              </div>
            </div>

            {/* Info */}
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-slate-300 dark:text-white/50">
                <strong>💡 {t('calendar.eventType.tip') || 'Tip'}:</strong> {t('calendar.eventType.tipText') || 'Create custom event types for your tour (e.g., Photo Shoot, Press Interview, Free Day). Custom types can be deleted anytime.'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EventTypeManager;
