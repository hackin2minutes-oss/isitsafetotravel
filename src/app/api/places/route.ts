import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const OVERPASS_QUERIES: Record<string, string> = {
  attractions: '[out:json][timeout:15];(node["tourism"~"attraction|museum|gallery|monument|viewpoint|zoo|theme_park|aquarium|information|artwork"](around:$RADIUS$,$LAT$,$LON$);way["tourism"~"attraction|museum|gallery|monument|viewpoint|zoo|theme_park|aquarium"](around:$RADIUS$,$LAT$,$LON$);node["historic"](around:$RADIUS$,$LAT$,$LON$);way["historic"](around:$RADIUS$,$LAT$,$LON$););out center $LIMIT$;',
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
    { id: '1', name: 'Kingdom Centre', type: 'landmark', lat: 24.7116, lon: 46.6752, address: 'Riyadh, Saudi Arabia', description: 'Iconic skyscraper with sky bridge' },
    { id: '2', name: 'National Museum', type: 'museum', lat: 24.6460, lon: 46.7166, address: 'Riyadh, Saudi Arabia', description: 'Saudi Arabian history and culture' },
    { id: '3', name: 'Masmak Fortress', type: 'historic', lat: 24.6339, lon: 46.7129, address: 'Riyadh, Saudi Arabia', description: '19th-century clay and mud fortress' },
    { id: '4', name: 'Al Masmak Museum', type: 'museum', lat: 24.6340, lon: 46.7130, address: 'Riyadh, Saudi Arabia', description: 'History of Riyadh' },
    { id: '5', name: 'Riyadh Zoo', type: 'zoo', lat: 24.6417, lon: 46.7217, address: 'Riyadh, Saudi Arabia', description: 'Family-friendly animal park' },
    { id: '6', name: 'DIRIYAH', type: 'historic', lat: 24.7456, lon: 46.5844, address: 'Diriyah, Saudi Arabia', description: 'UNESCO heritage site, birthplace of Saudi Arabia' },
    { id: '7', name: 'Boulevard Riyadh City', type: 'attraction', lat: 24.8178, lon: 46.6285, address: 'Riyadh, Saudi Arabia', description: 'Entertainment and shopping destination' },
    { id: '8', name: 'King Abdullah Financial District', type: 'landmark', lat: 24.8036, lon: 46.6275, address: 'Riyadh, Saudi Arabia', description: 'Modern financial district' },
  ],
  restaurants: [
    { id: '1', name: 'The Noodle House', type: 'restaurant', lat: 24.7136, lon: 46.6753, address: 'Riyadh', description: 'Asian cuisine' },
    { id: '2', name: 'Al Orjouan', type: 'restaurant', lat: 24.7115, lon: 46.6740, address: 'Riyadh', description: 'Saudi fine dining' },
  ],
  hotels: [
    { id: '1', name: 'Four Seasons Riyadh', type: 'hotel', lat: 24.7125, lon: 46.6765, address: 'Riyadh', description: 'Luxury hotel' },
  ],
  default: [
    { id: '1', name: 'Kingdom Centre', type: 'landmark', lat: 24.7116, lon: 46.6752, address: 'Riyadh', description: 'Iconic Riyadh landmark' },
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

      if (elements.length >= 5) {
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
