import axios from 'axios';
import { WeatherData } from '@/types';

/**
 * WEATHER_SERVICE v3.0 (Open-Meteo Edition)
 * Uses internal Next.js API Proxy to fetch 100% free data without keys.
 */
export async function getWeatherData(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    // Fetch both Weather and Disaster data concurrently
    const [weatherRes, disasterRes] = await Promise.all([
      axios.get(`/api/weather`, { params: { lat, lon } }).catch(() => null),
      axios.get(`/api/disaster`, { params: { lat, lon } }).catch(() => null)
    ]);

    const data = weatherRes?.data;
    if (!data || !data.current) return null;
    
    const current = data.current;
    const initialRiskFactors = getRiskFactors(current.weather_code);
    
    // Inject Earthquake Data if available
    const extraRiskFactors: string[] = [];
    if (disasterRes?.data?.features && disasterRes.data.features.length > 0) {
      const quakes = disasterRes.data.features;
      // Get the highest magnitude recent quake
      const worstQuake = quakes.reduce((prev: any, current: any) => {
        return (prev.properties.mag > current.properties.mag) ? prev : current;
      });
      extraRiskFactors.push(`Recent Earthquake: Mag ${worstQuake.properties.mag} (${worstQuake.properties.place})`);
    }

    return {
      temperature: Math.round(current.temperature_2m),
      condition: getConditionFromWmo(current.weather_code),
      humidity: Math.round(current.relative_humidity_2m),
      windSpeed: Math.round(current.wind_speed_10m), 
      windDirection: getWindDirection(current.wind_direction_10m),
      feelsLike: Math.round(current.apparent_temperature),
      visibility: 10, 
      uvIndex: 0, 
      riskFactors: [...initialRiskFactors, ...extraRiskFactors]
    };
  } catch (error) {
    console.error('CLIENT_WEATHER_ERROR:', error);
    return null;
  }
}

function getWindDirection(degree: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(degree / 45) % 8];
}

// Map WMO Weather Codes to String Conditions
function getConditionFromWmo(code: number): string {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Cloudy';
  if (code <= 49) return 'Foggy';
  if (code <= 59) return 'Drizzle';
  if (code <= 69) return 'Rain';
  if (code <= 79) return 'Snow';
  if (code <= 82) return 'Rain Showers';
  if (code <= 86) return 'Snow Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Unknown';
}

function getRiskFactors(code: number): string[] {
  const factors: string[] = [];
  if (code >= 95) factors.push('Thunderstorm');
  if (code === 63 || code === 65 || code === 67 || code === 82) factors.push('Heavy Rain');
  if (code === 73 || code === 75 || code === 77 || code === 86 || code === 85) factors.push('Heavy Snow');
  if (code === 66 || code === 67 || code === 56 || code === 57) factors.push('Freezing Rain/Drizzle');
  return factors;
}