import React, { useState, useEffect } from 'react';
import { Wifi, Battery, BatteryCharging, Signal } from 'lucide-react';
import { useDeviceInfo } from '../../../hooks/useDeviceInfo';

export const StatusBar: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const deviceInfo = useDeviceInfo();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');

  // Calcular color de batería
  const batteryColor = deviceInfo.battery.level > 20 
    ? 'text-white' 
    : 'text-red-500';

  const BatteryIcon = deviceInfo.battery.charging ? BatteryCharging : Battery;

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 px-6 flex items-end"
      style={{
        height: deviceInfo.hasNotch ? '44px' : '20px',
        paddingTop: deviceInfo.hasNotch ? '8px' : '4px',
      }}
    >
      <div className="flex items-center justify-between text-white w-full pb-1">
        {/* Left: Time */}
        <div className="flex-1">
          <span className="font-semibold tracking-tight text-sm">{hours}:{minutes}</span>
        </div>

        {/* Center: Dynamic Island (solo iOS con notch) */}
        {deviceInfo.hasNotch && deviceInfo.platform === 'ios' && (
          <div className="flex-shrink-0 w-32 h-8 bg-black rounded-full -mt-2" />
        )}

        {/* Right: Status icons */}
        <div className="flex-1 flex items-center justify-end gap-1.5">
          <Signal className="w-3.5 h-3.5" strokeWidth={2.5} />
          <Wifi className="w-3.5 h-3.5" strokeWidth={2.5} />
          <div className={`flex items-center gap-0.5 ${batteryColor}`}>
            <BatteryIcon className="w-4 h-4" strokeWidth={2.5} />
            <span className="text-xs font-medium tabular-nums">
              {deviceInfo.battery.level}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
