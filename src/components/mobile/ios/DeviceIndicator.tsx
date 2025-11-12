import React, { useState } from 'react';
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
    <div className="fixed bottom-24 right-4 z-[100]">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-ink-900/90 backdrop-blur-xl border border-accent-500/30 rounded-2xl px-3 py-2 flex items-center gap-2 shadow-lg text-white text-xs"
      >
        <Smartphone className="w-4 h-4 text-accent-500" strokeWidth={2} />
        <span className="font-medium">{deviceInfo.platform.toUpperCase()}</span>
        {isExpanded ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronUp className="w-3 h-3" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-2 bg-ink-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl text-xs space-y-2 min-w-[200px]">
          <div className="flex justify-between">
            <span className="text-white/60">Platform:</span>
            <span className="text-accent-500 font-medium">{deviceInfo.platform}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Model:</span>
            <span className="text-white font-medium">{deviceInfo.model}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Notch:</span>
            <span className={deviceInfo.hasNotch ? 'text-green-400' : 'text-white/40'}>
              {deviceInfo.hasNotch ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Battery:</span>
            <span className="text-white font-medium">
              {deviceInfo.battery.level}%
              {deviceInfo.battery.charging && ' ⚡'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Vibration:</span>
            <span className={deviceInfo.supportsVibration ? 'text-green-400' : 'text-white/40'}>
              {deviceInfo.supportsVibration ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Battery API:</span>
            <span className={deviceInfo.battery.supported ? 'text-green-400' : 'text-white/40'}>
              {deviceInfo.battery.supported ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
