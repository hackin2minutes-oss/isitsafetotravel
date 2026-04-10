import { WeatherData } from '@/types';

export async function getWeatherData(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const [weatherRes, disasterRes] = await Promise.all([
      fetch(`/api/weather?lat=${lat}&lon=${lon}`).then(r => r.json()).catch(() => null),
      fetch(`/api/disaster?lat=${lat}&lon=${lon}`).then(r => r.json()).catch(() => null)
    ]);

    if (!weatherRes || !weatherRes.current) return null;
    
    const current = weatherRes.current;
    const initialRiskFactors = getRiskFactors(current.weather_code);
    
    const extraRiskFactors: string[] = [];
    if (disasterRes?.features && disasterRes.features.length > 0) {
      const quakes = disasterRes.features;
      const worstQuake = quakes.reduce((prev: any, curr: any) => {
        return (prev.properties.mag > curr.properties.mag) ? prev : curr;
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