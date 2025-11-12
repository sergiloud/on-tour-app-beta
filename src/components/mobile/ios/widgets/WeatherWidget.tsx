import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Sun, CloudRain, Wind, Droplets, Eye, CloudSnow, CloudLightning } from 'lucide-react';
import { getWeather, getMockWeather, type WeatherData } from '../../../../services/weatherService';
import { showStore } from '../../../../shared/showStore';
import type { Show } from '../../../../lib/shows';

interface WeatherWidgetProps {
  className?: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ className = '' }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchWeather() {
      setLoading(true);
      
      // Get next show for fallback location
      const shows = showStore.getAll();
      const upcomingShows = shows
        .filter((s: Show) => s.date && new Date(s.date) >= new Date())
        .sort((a: Show, b: Show) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
      
      const nextShow = upcomingShows[0];
      
      const weatherData = await getWeather(nextShow);
      
      if (!cancelled) {
        if (weatherData) {
          setWeather(weatherData);
        } else {
          // Fallback to mock data if API fails
          setWeather(getMockWeather(nextShow?.city ? `${nextShow.city}, ${nextShow.country}` : undefined));
        }
        setLoading(false);
      }
    }

    fetchWeather();

    return () => {
      cancelled = true;
    };
  }, []);

  const getWeatherIcon = () => {
    if (!weather) return Sun;
    
    switch (weather.condition) {
      case 'sunny':
        return Sun;
      case 'cloudy':
        return Cloud;
      case 'rainy':
        return CloudRain;
      case 'windy':
        return Wind;
      case 'snowy':
        return CloudSnow;
      case 'stormy':
        return CloudLightning;
      default:
        return Sun;
    }
  };

  const getWeatherColor = () => {
    if (!weather) return { bg: 'from-yellow-500/20 to-orange-500/20', icon: 'text-yellow-400', glow: 'shadow-yellow-500/20' };
    
    switch (weather.condition) {
      case 'sunny':
        return { bg: 'from-yellow-500/20 to-orange-500/20', icon: 'text-yellow-400', glow: 'shadow-yellow-500/20' };
      case 'cloudy':
        return { bg: 'from-slate-500/20 to-gray-500/20', icon: 'text-slate-300', glow: 'shadow-slate-500/20' };
      case 'rainy':
        return { bg: 'from-blue-500/20 to-indigo-500/20', icon: 'text-blue-400', glow: 'shadow-blue-500/20' };
      case 'windy':
        return { bg: 'from-cyan-500/20 to-teal-500/20', icon: 'text-cyan-400', glow: 'shadow-cyan-500/20' };
      case 'snowy':
        return { bg: 'from-blue-300/20 to-white/20', icon: 'text-blue-200', glow: 'shadow-blue-300/20' };
      case 'stormy':
        return { bg: 'from-purple-500/20 to-gray-700/20', icon: 'text-purple-300', glow: 'shadow-purple-500/20' };
      default:
        return { bg: 'from-yellow-500/20 to-orange-500/20', icon: 'text-yellow-400', glow: 'shadow-yellow-500/20' };
    }
  };

  const getWeatherConditionText = (condition: WeatherData['condition']): string => {
    switch (condition) {
      case 'sunny': return 'Soleado';
      case 'cloudy': return 'Nublado';
      case 'rainy': return 'Lluvioso';
      case 'windy': return 'Ventoso';
      case 'snowy': return 'Nevado';
      case 'stormy': return 'Tormentoso';
      default: return 'Soleado';
    }
  };

  const WeatherIcon = getWeatherIcon();
  const colors = getWeatherColor();

  // Loading state
  if (loading || !weather) {
    return (
      <div className={`relative bg-white/5 backdrop-blur-md rounded-[28px] border border-white/10 overflow-hidden shadow-xl gpu-accelerate ${className}`}>
        <div className="relative p-4">
          <div className="flex items-center justify-center h-48">
            <div className="text-white/40 text-sm">Cargando clima...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-white/5 backdrop-blur-md rounded-[28px] border border-white/10 overflow-hidden shadow-xl gpu-accelerate ${className}`}>
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-50`} />

      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Clima</h2>
            <p className="text-[10px] text-white/50 font-medium">{weather.location}</p>
          </div>
          <motion.div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors.bg} flex items-center justify-center ${colors.glow} shadow-lg`}
            animate={{
              rotate: weather.condition === 'sunny' ? [0, 360] : 0,
              scale: [1, 1.05, 1],
            }}
            transition={{
              rotate: {
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              },
              scale: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
          >
            <WeatherIcon className={`w-6 h-6 ${colors.icon}`} strokeWidth={2} />
          </motion.div>
        </div>

        {/* Main temperature */}
        <div className="mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-bold text-white tracking-tight">
              {weather.temp}
            </span>
            <span className="text-2xl text-white/70 font-light">°C</span>
          </div>
          <p className="text-sm text-white/70 font-medium capitalize mt-1">
            {getWeatherConditionText(weather.condition)}
          </p>
        </div>

        {/* Weather details */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <Droplets className="w-3.5 h-3.5 text-blue-400" strokeWidth={2.5} />
              <span className="text-[9px] text-white/50 font-medium uppercase tracking-wide">Humedad</span>
            </div>
            <p className="text-sm font-bold text-white">{weather.humidity}%</p>
          </div>

          <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <Wind className="w-3.5 h-3.5 text-cyan-400" strokeWidth={2.5} />
              <span className="text-[9px] text-white/50 font-medium uppercase tracking-wide">Viento</span>
            </div>
            <p className="text-sm font-bold text-white">{weather.wind} km/h</p>
          </div>

          <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <Eye className="w-3.5 h-3.5 text-purple-400" strokeWidth={2.5} />
              <span className="text-[9px] text-white/50 font-medium uppercase tracking-wide">Visib.</span>
            </div>
            <p className="text-sm font-bold text-white">{weather.visibility} km</p>
          </div>
        </div>

        {/* Forecast hint */}
        <div className="mt-3 pt-3 border-t border-white/5">
          <p className="text-[10px] text-white/40 text-center font-medium">
            Actualizado {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
};