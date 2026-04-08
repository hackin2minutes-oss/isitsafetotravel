import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') || searchParams.get('country');
  
  if (!name) {
    return NextResponse.json({ error: 'Missing country name (use ?name= or ?country=)' }, { status: 400 });
  }

  try {
    const rssUrl = 'https://travel.state.gov/_res/rss/TAsTWs.xml';
    const response = await fetch(rssUrl, { next: { revalidate: 3600 } }); // Cache for 1 hour

    if (!response.ok) throw new Error(`RSS fetch error: ${response.status}`);
    
    let text = await response.text();
    text = text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1'); // Clean CDATA
    
    // We want to find: <title>Bahrain - Level 3: Reconsider Travel</title>
    // Escape the country name for regex
    const safeName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`<title>\\s*${safeName}(?:\\s+Travel Advisory)?\\s*-\\s*Level\\s*(\\d)\\s*:\\s*([^<]+)<\\/title>`, 'i');
    
    const match = text.match(regex);
    let level = 1;
    let message = "Standard travel precautions apply (Level 1).";
    let identified = false;

    if (match && match.length >= 3) {
      level = parseInt(match[1]);
      message = match[2].trim();
      identified = true;
    } else {
      // Fallback: If not exactly prefixed, do a loose search for the country
      const looseRegex = new RegExp(`<title>[^<]*${safeName}[^<]*- Level (\\d):([^<]+)<\\/title>`, 'i');
      const looseMatch = text.match(looseRegex);
      if (looseMatch && looseMatch.length >= 3) {
         level = parseInt(looseMatch[1]);
         message = looseMatch[2].trim();
         identified = true;
      }
    }

    return NextResponse.json({
      data: {
        score: level, // 1 to 4
        message: message,
        updated: new Date().toISOString(),
        identified: identified
      }
    });

  } catch (error) {
    console.error('SEC_RSS_PROXY_ERROR:', error);
    // Safe fallback if the RSS breaks
    return NextResponse.json({
      data: {
        score: 1, 
        message: "Unable to retrieve real-time US State Dept advisory. Proceed with caution.",
        updated: new Date().toISOString(),
         identified: false
      }
    });
  }
}
