import { Location } from '@/types';

export async function reverseGeocode(lat: number, lon: number): Promise<Location | null> {
  try {
    const data = await fetch(`/api/location?lat=${lat}&lon=${lon}&format=json`).then(r => r.json());

    if (!data || data.error) {
      return null;
    }

    const address = data.address || {};
    const name = address.city || address.town || address.village || address.suburb || address.state || 'Selected Region';

    return {
      id: `osm-${data.place_id || Date.now()}`,
      name: name,
      type: 'city',
      countryId: address.country_code?.toUpperCase(),
      countryName: address.country,
      coordinates: { latitude: lat, longitude: lon },
    };
  } catch (error) {
    console.error('CLIENT_LOCATION_ERROR:', error);
    return null;
  }
}

export async function searchLocations(query: string): Promise<Location[]> {
  if (query.length < 3) return [];

  try {
    const data = await fetch(`/api/location?q=${encodeURIComponent(query)}&format=json`).then(r => r.json());

    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((res: any) => {
      if (!res || !res.display_name) return null;

      const address = res.address || {};
      const lat = parseFloat(res.lat);
      const lon = parseFloat(res.lon);
      
      if (isNaN(lat) || isNaN(lon)) return null;

      return {
        id: `osm-${res.place_id || Math.random()}`,
        name: res.display_name.split(',')[0] || 'Unknown Region',
        type: res.type || 'city',
        countryId: address.country_code?.toUpperCase(),
        countryName: address.country || 'Global Territory',
        coordinates: { latitude: lat, longitude: lon },
      } as Location;
    }).filter((loc): loc is Location => loc !== null);
  } catch (error) {
    console.error('CLIENT_SEARCH_ERROR:', error);
    return [];
  }
}
