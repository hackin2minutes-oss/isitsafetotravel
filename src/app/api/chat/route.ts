import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { messages, location, assessment } = await request.json();

    const context = `
You are a helpful Travel Safety AI Assistant. Answer questions about ${location?.name || 'this destination'}.

Current Data:
- Safety: ${assessment?.score || 'N/A'}/100 (${assessment?.rating || 'N/A'})
- Weather: ${assessment?.weather?.data?.temperature || 'N/A'}°C
- AQI: ${assessment?.aqi?.data?.aqi || 'N/A'}
- Tips: ${assessment?.tips?.[0] || 'Stay safe'}

Keep responses short and helpful.
`;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ 
        error: 'No API key configured' 
      }, { status: 500 });
    }

    const prompt = `${context}\n\nUser: ${messages?.[messages.length - 1]?.content || 'Hello'}\n\nAssistant:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            maxOutputTokens: 200,
            temperature: 0.7
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', response.status, errorText);
      return NextResponse.json({ 
        error: `Gemini API error: ${response.status}` 
      }, { status: 500 });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                 data.promptFeedback?.blockReason ||
                 'No response from AI';

    return NextResponse.json({ content: text });

  } catch (error: any) {
    console.error('Chat Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to process request' 
    }, { status: 500 });
  }
}
