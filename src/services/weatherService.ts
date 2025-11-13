/**
 * Weather Service
 * Fetches real weather data from OpenWeatherMap API
 * Uses browser geolocation or show location as fallback
 */

import { Show } from '../lib/shows';
import { logger } from '../lib/logger';

export interface WeatherData {
  temp: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'snowy' | 'stormy';
  humidity: number;
  wind: number;
  visibility: number;
  location: string;
  description: string;
  timestamp: number;
}

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// In-memory cache
let weatherCache: WeatherData | null = null;
let cacheTimestamp = 0;

/**
 * Map OpenWeatherMap condition codes to simplified conditions
 */
function mapWeatherCondition(code: number): WeatherData['condition'] {
  if (code >= 200 && code < 300) return 'stormy'; // Thunderstorm
  if (code >= 300 && code < 500) return 'rainy'; // Drizzle
  if (code >= 500 && code < 600) return 'rainy'; // Rain
  if (code >= 600 && code < 700) return 'snowy'; // Snow
  if (code >= 700 && code < 800) return 'cloudy'; // Atmosphere (fog, mist, etc)
  if (code === 800) return 'sunny'; // Clear sky
  if (code === 801 || code === 802) return 'cloudy'; // Few/scattered clouds
  if (code >= 803) return 'cloudy'; // Broken/overcast clouds
  
  // Check for wind (we can't get this from code, need to check wind speed)
  return 'sunny';
}

/**
 * Get weather by coordinates
 */
async function fetchWeatherByCoords(lat: number, lon: number): Promise<WeatherData | null> {
  if (!OPENWEATHER_API_KEY) {
    logger.warn('[WeatherService] OpenWeatherMap API key not configured');
    return null;
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      logger.error('[WeatherService] API error', new Error(`HTTP ${response.status}`), { status: response.status });
      return null;
    }

    const data = await response.json();

    let condition = mapWeatherCondition(data.weather[0].id);
    
    // Override with windy if wind speed is high
    if (data.wind.speed > 10) {
      condition = 'windy';
    }

    const weatherData: WeatherData = {
      temp: Math.round(data.main.temp),
      condition,
      humidity: data.main.humidity,
      wind: Math.round(data.wind.speed * 3.6), // m/s to km/h
      visibility: Math.round(data.visibility / 1000), // meters to km
      location: data.name ? `${data.name}, ${data.sys.country}` : 'Ubicación actual',
      description: data.weather[0].description,
      timestamp: Date.now(),
    };

    return weatherData;
  } catch (error) {
    logger.error('[WeatherService] Fetch error', error as Error, { lat, lon });
    return null;
  }
}

/**
 * Get user's current location weather
 */
export async function getCurrentLocationWeather(): Promise<WeatherData | null> {
  // Check cache first
  if (weatherCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return weatherCache;
  }

  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      logger.warn('[WeatherService] Geolocation not supported');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const weather = await fetchWeatherByCoords(
          position.coords.latitude,
          position.coords.longitude
        );
        
        if (weather) {
          weatherCache = weather;
          cacheTimestamp = Date.now();
        }
        
        resolve(weather);
      },
      (error) => {
        logger.warn('[WeatherService] Geolocation error', { errorMessage: error.message, code: error.code });
        resolve(null);
      },
      {
        timeout: 5000,
        maximumAge: CACHE_DURATION,
      }
    );
  });
}

/**
 * Get weather for a specific show location
 */
export async function getShowLocationWeather(show: Show): Promise<WeatherData | null> {
  if (!show.lat || !show.lng) {
    logger.warn('[WeatherService] Show missing coordinates', { city: show.city, showId: show.id });
    return null;
  }

  return fetchWeatherByCoords(show.lat, show.lng);
}

/**
 * Get weather - tries current location first, then falls back to next show
 */
export async function getWeather(nextShow?: Show): Promise<WeatherData | null> {
  // Try current location first
  const currentWeather = await getCurrentLocationWeather();
  if (currentWeather) {
    return currentWeather;
  }

  // Fallback to next show location if available
  if (nextShow) {
    return getShowLocationWeather(nextShow);
  }

  return null;
}

/**
 * Mock weather data for when API is not available
 */
export function getMockWeather(location: string = 'Barcelona, ES'): WeatherData {
  return {
    temp: 22,
    condition: 'sunny',
    humidity: 65,
    wind: 12,
    visibility: 10,
    location,
    description: 'Cielo despejado',
    timestamp: Date.now(),
  };
}

/**
 * Clear weather cache (useful for forcing refresh)
 */
export function clearWeatherCache(): void {
  weatherCache = null;
  cacheTimestamp = 0;
}
