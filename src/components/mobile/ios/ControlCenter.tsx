import React from 'react';
import { motion } from 'framer-motion';
import { 
  Wifi, 
  Bluetooth, 
  Volume2, 
  Sun, 
  Battery,
  Plane,
  Moon,
  Radio,
  ZapOff,
  Music,
  Flashlight,
  Camera,
  Calculator,
  Timer,
  X
} from 'lucide-react';

interface ControlCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ToggleButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onToggle: () => void;
  size?: 'small' | 'large';
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ 
  icon, 
  label, 
  active, 
  onToggle,
  size = 'small'
}) => {
  const hapticFeedback = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleClick = () => {
    hapticFeedback();
    onToggle();
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`
        relative overflow-hidden rounded-2xl p-4
        ${size === 'large' ? 'col-span-2 row-span-2' : ''}
        ${active 
          ? 'bg-accent-500/90 backdrop-blur-xl' 
          : 'bg-white/10 backdrop-blur-xl'
        }
        border border-white/20
        transition-all duration-200
        active:scale-95
      `}
      whileTap={{ scale: 0.95 }}
    >
      {/* Glow effect when active */}
      {active && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
      )}
      
      <div className="relative flex flex-col h-full justify-between">
        <div className={`${active ? 'text-white' : 'text-white/70'}`}>
          {icon}
        </div>
        <div className={`text-xs font-medium mt-2 ${active ? 'text-white' : 'text-white/70'}`}>
          {label}
        </div>
      </div>
    </motion.button>
  );
};

interface SliderControlProps {
  icon: React.ReactNode;
  value: number;
  onChange: (value: number) => void;
  label: string;
}

const SliderControl: React.FC<SliderControlProps> = ({ icon, value, onChange, label }) => {
  const hapticFeedback = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-white/70">
          {icon}
        </div>
        <span className="text-xs text-white/70 font-medium">{label}</span>
      </div>
      
      <div className="relative h-8 bg-white/10 rounded-full overflow-hidden">
        {/* Filled portion */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent-500 to-accent-400"
          style={{ width: `${value}%` }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
        
        {/* Slider input */}
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => {
            hapticFeedback();
            onChange(Number(e.target.value));
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        {/* Visual handle */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg"
          style={{ left: `calc(${value}% - 12px)` }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      </div>
    </div>
  );
};

export const ControlCenter: React.FC<ControlCenterProps> = ({ isOpen, onClose }) => {
  const [wifi, setWifi] = React.useState(true);
  const [bluetooth, setBluetooth] = React.useState(false);
  const [airplane, setAirplane] = React.useState(false);
  const [dnd, setDnd] = React.useState(false);
  const [flashlight, setFlashlight] = React.useState(false);
  const [volume, setVolume] = React.useState(60);
  const [brightness, setBrightness] = React.useState(75);

  return (
    <motion.div
      initial={{ y: '-100%', opacity: 0 }}
      animate={{ 
        y: isOpen ? '0%' : '-100%',
        opacity: isOpen ? 1 : 0
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 35,
      }}
      className="fixed inset-0 z-[200] pointer-events-none"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto"
      />

      {/* Control Center Panel */}
      <motion.div
        className="absolute top-0 inset-x-0 p-4 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-md mx-auto">
          {/* Close button */}
          <div className="flex justify-end mb-2">
            <motion.button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center"
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5 text-white" />
            </motion.button>
          </div>

          <div className="space-y-3">
            {/* Main toggles grid */}
            <div className="grid grid-cols-2 gap-3">
              <ToggleButton
                icon={<Wifi className="w-6 h-6" />}
                label="Wi-Fi"
                active={wifi}
                onToggle={() => setWifi(!wifi)}
              />
              <ToggleButton
                icon={<Bluetooth className="w-6 h-6" />}
                label="Bluetooth"
                active={bluetooth}
                onToggle={() => setBluetooth(!bluetooth)}
              />
              <ToggleButton
                icon={<Plane className="w-6 h-6" />}
                label="Avión"
                active={airplane}
                onToggle={() => setAirplane(!airplane)}
              />
              <ToggleButton
                icon={<Moon className="w-6 h-6" />}
                label="No molestar"
                active={dnd}
                onToggle={() => setDnd(!dnd)}
              />
            </div>

            {/* Sliders */}
            <SliderControl
              icon={<Sun className="w-5 h-5" />}
              value={brightness}
              onChange={setBrightness}
              label="Brillo"
            />
            
            <SliderControl
              icon={<Volume2 className="w-5 h-5" />}
              value={volume}
              onChange={setVolume}
              label="Volumen"
            />

            {/* Quick actions grid */}
            <div className="grid grid-cols-4 gap-3">
              <ToggleButton
                icon={<Flashlight className="w-5 h-5" />}
                label="Linterna"
                active={flashlight}
                onToggle={() => setFlashlight(!flashlight)}
                size="small"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20"
              >
                <Timer className="w-5 h-5 text-white/70 mb-2" />
                <div className="text-xs text-white/70 font-medium">Timer</div>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20"
              >
                <Calculator className="w-5 h-5 text-white/70 mb-2" />
                <div className="text-xs text-white/70 font-medium">Calc</div>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20"
              >
                <Camera className="w-5 h-5 text-white/70 mb-2" />
                <div className="text-xs text-white/70 font-medium">Cámara</div>
              </motion.button>
            </div>

            {/* Music Player */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-white font-medium">Reproducción en pausa</div>
                  <div className="text-xs text-white/50">Sin reproducción activa</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};