import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, ChevronDown, ChevronUp } from 'lucide-react';
import { useDeviceInfo } from '../../../hooks/useDeviceInfo';

/**
 * Indicador de información del dispositivo (solo desarrollo)
 * Muestra detalles técnicos del dispositivo detectado
 */
export const DeviceIndicator: React.FC = () => {
  const deviceInfo = useDeviceInfo();
  const [isExpanded, setIsExpanded] = useState(false);

  // Solo mostrar en desarrollo
  if (import.meta.env.PROD) return null;

  return (
    <motion.div 
      className="fixed bottom-32 right-4 z-[100]"
      initial={{ opacity: 0, scale: 0.8, x: 100 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 400, 
        damping: 25,
        delay: 0.5
      }}
    >
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-ink-900/80 backdrop-blur-xl border border-accent-500/20 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 shadow-lg hover:border-accent-500/40 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Smartphone className="w-3.5 h-3.5 text-accent-500" strokeWidth={2} />
        <span className="text-white font-medium text-[10px]">{deviceInfo.platform.toUpperCase()}</span>
        {isExpanded ? (
          <ChevronDown className="w-3 h-3 text-white/60" />
        ) : (
          <ChevronUp className="w-3 h-3 text-white/60" />
        )}
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="mt-2 bg-ink-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl text-[10px] space-y-1.5 min-w-[160px]"
          >
            <div className="flex justify-between items-center">
              <span className="text-white/50">Platform</span>
              <span className="text-accent-500 font-semibold">{deviceInfo.platform}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/50">Model</span>
              <span className="text-white font-medium text-[9px]">{deviceInfo.model}</span>
            </div>
            <div className="h-px bg-white/5" />
            <div className="flex justify-between items-center">
              <span className="text-white/50">Notch</span>
              <span className={deviceInfo.hasNotch ? 'text-green-400 font-medium' : 'text-white/30'}>
                {deviceInfo.hasNotch ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/50">Vibration</span>
              <span className={deviceInfo.supportsVibration ? 'text-green-400 font-medium' : 'text-white/30'}>
                {deviceInfo.supportsVibration ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/50">Battery API</span>
              <span className={deviceInfo.battery.supported ? 'text-green-400 font-medium' : 'text-white/30'}>
                {deviceInfo.battery.supported ? '✓' : '✗'}
              </span>
            </div>
            {deviceInfo.battery.supported && (
              <>
                <div className="h-px bg-white/5" />
                <div className="flex justify-between items-center">
                  <span className="text-white/50">Battery</span>
                  <span className="text-white font-medium">
                    {deviceInfo.battery.level}%
                    {deviceInfo.battery.charging && ' ⚡'}
                  </span>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
