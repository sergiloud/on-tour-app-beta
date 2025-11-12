import { useState, useEffect } from 'react';

export interface DeviceInfo {
  platform: 'ios' | 'android' | 'web';
  hasNotch: boolean;
  model: string;
  supportsVibration: boolean;
  battery: {
    level: number;
    charging: boolean;
    supported: boolean;
  };
}

/**
 * Hook para detectar información real del dispositivo
 */
export function useDeviceInfo(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    // Detección inicial basada en userAgent
    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);
    
    // Modelos con notch conocidos
    const hasNotch = 
      /iphone (1[0-9]|x)/i.test(ua) || // iPhone X, 11, 12, 13, 14, 15
      /iphone (se \(3rd generation\))/i.test(ua) || // iPhone SE 3
      // Android con notch (algunos flagship)
      (/android/.test(ua) && window.screen.height / window.screen.width > 2);

    // Detectar modelo específico
    let model = 'unknown';
    if (isIOS) {
      const match = ua.match(/iphone os (\d+)_(\d+)/);
      if (match) {
        model = `iOS ${match[1]}.${match[2]}`;
      }
    } else if (isAndroid) {
      const match = ua.match(/android (\d+\.?\d*)/);
      if (match) {
        model = `Android ${match[1]}`;
      }
    }

    return {
      platform: isIOS ? 'ios' : isAndroid ? 'android' : 'web',
      hasNotch,
      model,
      supportsVibration: 'vibrate' in navigator,
      battery: {
        level: 100,
        charging: false,
        supported: 'getBattery' in navigator,
      },
    };
  });

  useEffect(() => {
    // Obtener información real de batería si está disponible
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBattery = () => {
          setDeviceInfo(prev => ({
            ...prev,
            battery: {
              level: Math.round(battery.level * 100),
              charging: battery.charging,
              supported: true,
            },
          }));
        };

        updateBattery();

        // Listeners para cambios en batería
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);

        return () => {
          battery.removeEventListener('levelchange', updateBattery);
          battery.removeEventListener('chargingchange', updateBattery);
        };
      }).catch(() => {
        // Si falla, mantener valores por defecto
      });
    }
  }, []);

  return deviceInfo;
}
