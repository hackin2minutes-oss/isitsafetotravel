import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  
  if (!lat || !lon) {
    return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
  }

  try {
    // Look for Magnitude 5.0+ earthquakes within 150km in the last 7 days
    // A 7-day window is more realistic for "recent devastating earthquake"
    // Also expanding radius to 150km.
    const endTime = new Date().toISOString();
    const startTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    // USGS FDSN API (100% Free, No Key Required)
    const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${lat}&longitude=${lon}&maxradiuskm=150&minmagnitude=5.0&starttime=${startTime}&endtime=${endTime}`;
    
    const response = await fetch(url, { next: { revalidate: 1800 } }); // Cache 30m

    if (!response.ok) {
      console.warn(`Disaster API returned ${response.status}`);
      return NextResponse.json({ features: [] }); // Safe fallback
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('DISASTER_PROXY_ERROR:', error);
    return NextResponse.json({ features: [] });
  }
}
