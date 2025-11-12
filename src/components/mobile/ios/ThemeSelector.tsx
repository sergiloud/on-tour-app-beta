import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useTheme, ThemeColor } from '../../../stores/themeStore';

interface ThemeOption {
  color: ThemeColor;
  name: string;
  gradient: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    color: 'accent',
    name: 'Lime',
    gradient: 'from-lime-400 to-yellow-300',
  },
  {
    color: 'blue',
    name: 'Ocean',
    gradient: 'from-blue-400 to-cyan-300',
  },
  {
    color: 'purple',
    name: 'Purple',
    gradient: 'from-purple-400 to-pink-300',
  },
  {
    color: 'pink',
    name: 'Rose',
    gradient: 'from-pink-400 to-rose-300',
  },
  {
    color: 'orange',
    name: 'Sunset',
    gradient: 'from-orange-400 to-amber-300',
  },
  {
    color: 'green',
    name: 'Forest',
    gradient: 'from-green-400 to-emerald-300',
  },
];

export const ThemeSelector: React.FC = () => {
  const { theme, setThemeColor } = useTheme();

  const handleSelect = (color: ThemeColor) => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([10, 30, 10]);
    }
    setThemeColor(color);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-white/70 px-1">Color del tema</h3>
      <div className="grid grid-cols-3 gap-3">
        {THEME_OPTIONS.map((option, index) => {
          const isSelected = theme.color === option.color;
          
          return (
            <motion.button
              key={option.color}
              onClick={() => handleSelect(option.color)}
              className="relative flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Color Preview */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.gradient} shadow-lg relative`}>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Name */}
              <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-white/70'}`}>
                {option.name}
              </span>

              {/* Selected Ring */}
              {isSelected && (
                <motion.div
                  layoutId="selected-theme"
                  className="absolute inset-0 rounded-2xl ring-2 ring-accent-500 ring-offset-2 ring-offset-ink-900"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
