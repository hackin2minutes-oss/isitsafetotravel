import { NextResponse } from 'next/server';

export const runtime = 'edge';

function formatPlaces(places: any[]): string {
  if (!places || places.length === 0) return '';
  return places.slice(0, 8).map((p: any, i: number) => `${i + 1}. ${p.name} (${p.type})`).join('\n');
}

function getFallbackResponse(query: string, location: any, wikiData: any[], placesData: any, assessment: any): string {
  const q = query.toLowerCase();
  const locName = location?.name || 'this destination';
  const country = location?.countryName || '';

  // Places to visit
  if (q.includes('place') || q.includes('visit') || q.includes('tourist') || q.includes('attraction') || q.includes('things to do')) {
    const attractions = placesData?.attractions || [];
    if (attractions.length > 0) {
      return `Top places to visit in ${locName}:\n\n${formatPlaces(attractions)}`;
    }
    // Use Wikipedia data
    const tourismData = wikiData?.find((a: any) => 
      a.title.toLowerCase().includes('tourism') || a.title.toLowerCase().includes('attraction')
    );
    if (tourismData?.extract) {
      return `Places to visit in ${locName}:\n\n${tourismData.extract.substring(0, 500)}`;
    }
    return `For places to visit in ${locName}, ${country}:\n\n• Search "top tourist attractions ${locName}" on Google\n• Check TripAdvisor for reviews\n• Look up UNESCO sites nearby`;
  }

  // Food & cuisine
  if (q.includes('food') || q.includes('cuisine') || q.includes('eat') || q.includes('dish') || q.includes('restaurant')) {
    const foodData = wikiData?.find((a: any) => 
      a.title.toLowerCase().includes('cuisine') || a.title.toLowerCase().includes('food')
    );
    if (foodData?.extract) {
      return `Local cuisine in ${country}:\n\n${foodData.extract.substring(0, 500)}`;
    }
    return `For local food in ${locName}, ${country}:\n\n• Check Yelp or Google Maps for restaurants\n• Search "best local food ${country}"\n• Ask locals for recommendations`;
  }
  
  // Weather
  if (q.includes('weather') || q.includes('temperature')) {
    return `Weather in ${locName}: ${assessment?.weather?.data?.temperature || 'N/A'}°C, ${assessment?.weather?.data?.condition || 'Unknown'}`;
  }
  
  // Safety
  if (q.includes('safe') || q.includes('danger') || q.includes('risk')) {
    return `Safety: ${assessment?.score || 'N/A'}/100 (${assessment?.rating || 'Unknown'}). Emergency: ${assessment?.emergency?.police || 'N/A'}`;
  }
  
  // General info from Wikipedia
  if (wikiData && wikiData.length > 0) {
    const info = wikiData[0]?.extract || wikiData[0]?.description || '';
    if (info) {
      return `${info.substring(0, 400)}...`;
    }
  }
  
  return `Ask about places to visit, food, weather, or safety in ${locName}.`;
}

export async function POST(request: Request) {
  let location, assessment, wikiData, placesData;
  try {
    const json = await request.json();
    location = json.location;
    assessment = json.assessment;
    wikiData = json.wikiData;
    placesData = json.placesData;
    const messages = json.messages;
    const userQuery = messages?.[messages.length - 1]?.content || 'Hello';

    const wikiText = wikiData?.map((a: any) => `${a.title}: ${a.extract || a.description || ''}`).join('\n') || '';
    const placesText = formatPlaces(placesData?.attractions || []);

    const context = `
You are a helpful Travel Assistant.
Destination: ${location?.name || 'unknown'}, ${location?.countryName || ''}
Safety Score: ${assessment?.score || 'N/A'}/100
Weather: ${assessment?.weather?.data?.temperature || 'N/A'}°C
${placesText ? `Nearby places:\n${placesText}` : ''}
${wikiText ? `\nInfo:\n${wikiText.substring(0, 500)}` : ''}

Answer based on the data above. Be helpful and concise. List specific place names when available.
`;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ content: getFallbackResponse(userQuery, location, wikiData, placesData, assessment) });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: context + "\n\nQ: " + userQuery + "\n\nA:" }] }],
          generationConfig: { maxOutputTokens: 150, temperature: 0.2 }
        })
      }
    );

    if (!response.ok) {
      return NextResponse.json({ 
        content: getFallbackResponse(userQuery, location, wikiData, placesData, assessment) 
      });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text || text.length < 5) {
      return NextResponse.json({ 
        content: getFallbackResponse(userQuery, location, wikiData, placesData, assessment) 
      });
    }

    return NextResponse.json({ content: text });

  } catch (error: any) {
    console.error('Chat Error:', error);
    return NextResponse.json({ 
      content: getFallbackResponse('help', location, wikiData, placesData, assessment)
    });
  }
}
