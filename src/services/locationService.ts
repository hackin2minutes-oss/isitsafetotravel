import { Location } from '@/types';
import axios from 'axios';

/**
 * LOCATION_SERVICE v2.0
 * Uses internal Next.js API Proxy to bypass CORS.
 */
export async function reverseGeocode(lat: number, lon: number): Promise<Location | null> {
  try {
    console.log('LOC_SERVICE: Reverse geocoding...', { lat, lon });
    const response = await axios.get(`/api/location`, {
      params: { lat, lon, format: 'json' }
    });

    if (!response.data || response.data.error) {
      console.error('LOC_SERVICE: API error or empty', response.data?.error);
      return null;
    }

    const data = response.data;
    const address = data.address || {};
    
    const name = address.city || address.town || address.village || address.suburb || address.state || 'Selected Region';
    const countryName = address.country;
    const countryCode = address.country_code?.toUpperCase();

    return {
      id: `osm-${data.place_id || Date.now()}`,
      name: name,
      type: 'city',
      countryId: countryCode,
      countryName: countryName,
      coordinates: { latitude: lat, longitude: lon },
    };
  } catch (error) {
    console.error('CLIENT_LOCATION_ERROR:', error);
    return null;
  }
}

/**
 * Searches for global locations using internal API Proxy.
 */
export async function searchLocations(query: string): Promise<Location[]> {
  const normalizedQuery = query.toLowerCase().trim();
  if (normalizedQuery.length < 3) return [];

  try {
    console.log('LOC_SERVICE: Searching...', query);
    const response = await axios.get(`/api/location`, {
      params: { q: normalizedQuery, format: 'json' }
    });

    if (!Array.isArray(response.data)) {
       console.error('LOC_SERVICE: Search failed', response.data);
       return [];
    }

    return response.data.map((res: any) => {
      // Defensive check for crucial display data
      if (!res || !res.display_name) return null;

      const address = res.address || {};
      const countryCode = address.country_code?.toUpperCase();
      
      // Attempt to parse coordinates safely
      const lat = parseFloat(res.lat);
      const lon = parseFloat(res.lon);
      
      if (isNaN(lat) || isNaN(lon)) return null;

      return {
        id: `osm-${res.place_id || Math.random()}`,
        name: res.display_name.split(',')[0] || 'Unknown Region',
        type: res.type || 'city',
        countryId: countryCode,
        countryName: address.country || 'Global Territory',
        coordinates: { latitude: lat, longitude: lon },
      } as Location;
    }).filter((loc): loc is Location => loc !== null);
  } catch (error) {
    console.error('CLIENT_SEARCH_ERROR:', error);
    return [];
  }
}
