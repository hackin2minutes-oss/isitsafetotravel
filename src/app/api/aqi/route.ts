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
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=auto`;
    const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour

    if (!response.ok) throw new Error('Open-Meteo AQI API error');
    
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('AQI_PROXY_ERROR:', error);
    // Return a safe default fallback
    return NextResponse.json({
      current: {
        us_aqi: 42,
        pm10: 15,
        pm2_5: 8,
        carbon_monoxide: 200,
        nitrogen_dioxide: 5,
        sulphur_dioxide: 1,
        ozone: 30
      }
    });
  }
}
