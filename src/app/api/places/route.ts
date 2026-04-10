import { NextRequest, NextResponse } from 'next/server';

const OVERPASS_QUERIES: Record<string, string> = {
  attractions: '[out:json][timeout:15];(node["tourism"](around:$RADIUS$,$LAT$,$LON$);way["tourism"](around:$RADIUS$,$LAT$,$LON$););out center $LIMIT$;',
  restaurants: '[out:json][timeout:15];(node["amenity"="restaurant"](around:$RADIUS$,$LAT$,$LON$);node["amenity"="cafe"](around:$RADIUS$,$LAT$,$LON$);way["amenity"="restaurant"](around:$RADIUS$,$LAT$,$LON$);way["amenity"="cafe"](around:$RADIUS$,$LAT$,$LON$););out center $LIMIT$;',
  hotels: '[out:json][timeout:15];(node["tourism"="hotel"](around:$RADIUS$,$LAT$,$LON$);node["tourism"="hostel"](around:$RADIUS$,$LAT$,$LON$);way["tourism"="hotel"](around:$RADIUS$,$LAT$,$LON$);way["tourism"="hostel"](around:$RADIUS$,$LAT$,$LON$););out center $LIMIT$;',
  shopping: '[out:json][timeout:15];(node["shop"](around:$RADIUS$,$LAT$,$LON$);way["shop"](around:$RADIUS$,$LAT$,$LON$););out center $LIMIT$;',
  nightlife: '[out:json][timeout:15];(node["amenity"="nightclub"](around:$RADIUS$,$LAT$,$LON$);node["amenity"="bar"](around:$RADIUS$,$LAT$,$LON$);way["amenity"="nightclub"](around:$RADIUS$,$LAT$,$LON$);way["amenity"="bar"](around:$RADIUS$,$LAT$,$LON$););out center $LIMIT$;',
  transport: '[out:json][timeout:15];(node["amenity"="bus_station"](around:$RADIUS$,$LAT$,$LON$);node["railway"="station"](around:$RADIUS$,$LAT$,$LON$);way["railway"="station"](around:$RADIUS$,$LAT$,$LON$););out center $LIMIT$;',
  banks: '[out:json][timeout:15];(node["amenity"="bank"](around:$RADIUS$,$LAT$,$LON$);node["amenity"="atm"](around:$RADIUS$,$LAT$,$LON$);way["amenity"="bank"](around:$RADIUS$,$LAT$,$LON$););out center $LIMIT$;',
  hospitals: '[out:json][timeout:15];(node["amenity"="hospital"](around:$RADIUS$,$LAT$,$LON$);node["amenity"="clinic"](around:$RADIUS$,$LAT$,$LON$);way["amenity"="hospital"](around:$RADIUS$,$LAT$,$LON$););out center $LIMIT$;',
};

const OVERPASS_ENDPOINTS = [
  'https://lz4.overpass-api.de/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
  'https://overpass-api.de/api/interpreter',
];

const SAMPLE_PLACES: Record<string, any[]> = {
  attractions: [
    { id: '1', name: 'Statue of Liberty', type: 'monument', lat: 40.6892, lon: -74.0445, address: 'Liberty Island, New York, NY', description: 'Iconic copper statue on Liberty Island' },
    { id: '2', name: 'Central Park', type: 'park', lat: 40.7829, lon: -73.9654, address: 'Manhattan, New York, NY', description: 'Iconic urban park in Manhattan' },
    { id: '3', name: 'Empire State Building', type: 'attraction', lat: 40.7484, lon: -73.9857, address: '350 Fifth Avenue, New York, NY', description: 'Historic 102-story skyscraper' },
    { id: '4', name: 'Times Square', type: 'attraction', lat: 40.7580, lon: -73.9855, address: 'Manhattan, New York, NY', description: 'Famous commercial intersection' },
    { id: '5', name: 'Brooklyn Bridge', type: 'bridge', lat: 40.7061, lon: -73.9969, address: 'Brooklyn Bridge, New York, NY', description: 'Historic bridge connecting Manhattan and Brooklyn' },
  ],
  restaurants: [
    { id: '1', name: 'Local Restaurant', type: 'restaurant', lat: 40.7128, lon: -74.0060, address: 'Downtown', description: 'Popular local dining spot' },
    { id: '2', name: 'City Cafe', type: 'cafe', lat: 40.7140, lon: -74.0080, address: 'Main Street', description: 'Cozy coffee shop' },
  ],
  hotels: [
    { id: '1', name: 'City Hotel', type: 'hotel', lat: 40.7150, lon: -74.0050, address: 'Business District', description: 'Modern accommodations' },
  ],
  default: [
    { id: '1', name: 'Local Attraction', type: 'attraction', lat: 40.7128, lon: -74.0060, address: 'City Center', description: 'Popular local destination' },
  ],
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const category = searchParams.get('category') || 'attractions';
  const radius = parseInt(searchParams.get('radius') || '3000');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 30);

  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 });
  }

  const queryTemplate = OVERPASS_QUERIES[category] || OVERPASS_QUERIES.attractions;
  const overpassQuery = queryTemplate
    .replace(/\$LAT\$/g, lat)
    .replace(/\$LON\$/g, lon)
    .replace(/\$RADIUS\$/g, String(radius))
    .replace(/\$LIMIT\$/g, String(limit));

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(overpassQuery)}`,
        signal: AbortSignal.timeout(18000),
      });

      if (!response.ok) continue;

      const text = await response.text();
      if (!text.includes('"elements"')) continue;

      const data = JSON.parse(text);
      const elements = data.elements || [];

      if (elements.length > 0) {
        const places = elements.map((el: any) => ({
          id: String(el.id),
          name: el.tags?.name || el.tags?.['name:en'] || 'Unknown Place',
          type: el.tags?.amenity || el.tags?.tourism || el.tags?.shop || category,
          lat: el.lat || el.center?.lat,
          lon: el.lon || el.center?.lon,
          address: formatAddress(el.tags),
          description: el.tags?.description || el.tags?.['description:en'] || el.tags?.wikipedia || '',
        })).filter((p: any) => p.name && p.name !== 'Unknown Place' && p.lat && p.lon).slice(0, limit);

        return NextResponse.json({ 
          places, 
          count: places.length,
          category,
          source: 'OpenStreetMap'
        });
      }
    } catch (error) {
      console.log(`Endpoint ${endpoint} failed`);
      continue;
    }
  }

  const samplePlaces = SAMPLE_PLACES[category] || SAMPLE_PLACES.default;
  const adjustedPlaces = samplePlaces.slice(0, limit).map((p: any) => ({
    ...p,
    lat: parseFloat(lat) + (Math.random() - 0.5) * 0.05,
    lon: parseFloat(lon) + (Math.random() - 0.5) * 0.05,
  }));

  return NextResponse.json({ 
    places: adjustedPlaces, 
    count: adjustedPlaces.length,
    category,
    source: 'Sample Data (API unavailable)',
    isSample: true
  });
}

function formatAddress(tags: any): string {
  const parts = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:city'],
    tags['addr:postcode'],
  ].filter(Boolean);
  return parts.join(', ') || tags['addr:full'] || '';
}
