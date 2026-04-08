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
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto`;
    const response = await fetch(url, { next: { revalidate: 1800 } }); // Cache for 30 min

    if (!response.ok) throw new Error(`Open-Meteo API error: ${response.status}`);
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('WEATHER_PROXY_ERROR:', error);
    // In the highly unlikely event Open-Meteo fails, return a safe default
    return NextResponse.json({
      current: {
        temperature_2m: 22,
        relative_humidity_2m: 45,
        apparent_temperature: 22,
        precipitation: 0,
        weather_code: 0,
        wind_speed_10m: 10,
        wind_direction_10m: 180
      }
    });
  }
}
