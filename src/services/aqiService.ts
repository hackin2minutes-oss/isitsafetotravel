import axios from 'axios';
import { AirQualityData } from '@/types';

/**
 * AQI_SERVICE v3.0 (Open-Meteo Edition)
 * Uses internal Next.js API Proxy to bypass CORS and uses 100% free API.
 */
export async function getAirQualityData(lat: number, lon: number): Promise<AirQualityData | null> {
  try {
    const response = await axios.get(`/api/aqi`, {
      params: { lat, lon }
    });

    const data = response.data;
    if (!data || !data.current) return null;

    const current = data.current;
    const aqi = current.us_aqi;

    // US EPA AQI Scale categorization
    const getCategory = (aqi: number): any => {
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