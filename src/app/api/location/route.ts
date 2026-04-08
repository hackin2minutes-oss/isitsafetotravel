import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const format = searchParams.get('format') || 'json';

  try {
    let url = '';
    if (q) {
      // SEARCH: Include addressdetails=1 and limit to 5 results
      url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=${format}&addressdetails=1&limit=5`;
    } else if (lat && lon) {
      // REVERSE: Include addressdetails=1
      url = `https://nominatim.openstreetmap.org/reverse?format=${format}&lat=${lat}&lon=${lon}&addressdetails=1`;
    }

    if (!url) {
      return NextResponse.json({ error: 'Missing query or coordinates' }, { status: 400 });
    }

    // List of common browsers to rotate user agents and bypass basic cloud-blocking
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    ];
    const selectedAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

    const response = await fetch(url, {
      headers: {
        'User-Agent': selectedAgent,
        'Referer': 'https://is-it-safe.pages.dev/',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (response.status === 403 || response.status === 429) {
      console.warn(`LOC_PROXY: OSM Rate-Limited or Blocked (${response.status})`);
      return NextResponse.json({ 
        error: 'Global search is currently busy. Please try again in 5 minutes.',
        status: response.status 
      }, { status: response.status });
    }

    if (!response.ok) {
      throw new Error(`Location API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('LOC_PROXY_ERROR:', error);
    return NextResponse.json({ error: 'Search infrastructure unavailable' }, { status: 500 });
  }
}
