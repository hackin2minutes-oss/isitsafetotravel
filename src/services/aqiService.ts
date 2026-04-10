import { AirQualityData } from '@/types';

export async function getAirQualityData(lat: number, lon: number): Promise<AirQualityData | null> {
  try {
    const data = await fetch(`/api/aqi?lat=${lat}&lon=${lon}`).then(r => r.json());

    if (!data || !data.current) return null;

    const current = data.current;
    const aqi = current.us_aqi;

    const getCategory = (aqi: number): string => {
      if (aqi <= 50) return 'Good';
      if (aqi <= 100) return 'Moderate';
      if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
      if (aqi <= 200) return 'Unhealthy';
      if (aqi <= 300) return 'Very Unhealthy';
      return 'Hazardous';
    };

    return {
      aqi: Math.round(aqi),
      category: getCategory(aqi),
      pm25: Math.round(current.pm2_5 || 0),
      pm10: Math.round(current.pm10 || 0),
      no2: Math.round(current.nitrogen_dioxide || 0),
      o3: Math.round(current.ozone || 0),
      so2: Math.round(current.sulphur_dioxide || 0),
    };
  } catch (error) {
    console.error('CLIENT_AQI_ERROR:', error);
    return null;
  }
}