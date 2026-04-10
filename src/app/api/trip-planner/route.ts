import { NextResponse } from 'next/server';

export const runtime = 'edge';

const ACTIVITY_SUGGESTIONS = {
  culture: ['Museum visits', 'Historic walking tours', 'Local art galleries', 'Architecture tours', 'Cultural performances'],
  food: ['Local food markets', 'Cooking classes', 'Street food tours', 'Fine dining experiences', 'Food tastings'],
  nature: ['National parks', 'Beach activities', 'Hiking trails', 'Nature reserves', 'Scenic drives'],
  adventure: ['Water sports', 'Mountain activities', 'Zip lining', 'Diving/snorkeling', 'Off-road tours'],
  nightlife: ['Rooftop bars', 'Live music venues', 'Night markets', 'Club hopping', 'Evening shows'],
  photography: ['Sunrise spots', 'Iconic landmarks', 'Street photography', 'Hidden gems', 'Golden hour tours'],
};

const MEAL_SUGGESTIONS = [
  ['Local breakfast spot', 'Street food lunch', 'Traditional dinner'],
  ['Brunch at cafe', 'Food market tour', 'Fine dining evening'],
  ['Morning coffee & pastry', 'Casual lunch', 'Sunset dinner'],
];

const TIPS_BY_INTEREST = {
  culture: 'Dress modestly when visiting religious sites. Many museums offer free entry on certain days.',
  food: 'Ask locals for restaurant recommendations - hidden gems are often not in guidebooks.',
  nature: 'Check weather conditions and bring appropriate gear. Start activities early to avoid crowds.',
  adventure: 'Book activities through reputable operators and always prioritize safety equipment.',
  nightlife: 'Use licensed taxis or rideshares late at night. Keep your belongings secure.',
  photography: 'The best light is during golden hour (1 hour before sunset). Wake up early for empty spots.',
};

function generateItinerary(stops: any[], preferences: any) {
  const { interests, budget, travelers } = preferences;
  const budgetMultiplier = budget === 'luxury' ? 3 : budget === 'moderate' ? 1.5 : 0.7;
  const totalDays = stops.reduce((sum: number, stop: any) => {
    if (stop.startDate && stop.endDate) {
      const days = Math.ceil((new Date(stop.endDate).getTime() - new Date(stop.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return sum + days;
    }
    return sum + 3;
  }, 0);

  const itinerary = [];
  let dayCounter = 1;
  const allActivities = interests.length > 0 
    ? interests.flatMap((i: string) => ACTIVITY_SUGGESTIONS[i as keyof typeof ACTIVITY_SUGGESTIONS] || [])
    : ['City exploration', 'Local sightseeing', 'Walking tour', 'Photo stops', 'Relaxation time'];

  for (const stop of stops) {
    const stopDays = stop.startDate && stop.endDate 
      ? Math.ceil((new Date(stop.endDate).getTime() - new Date(stop.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
      : 3;

    for (let d = 0; d < stopDays; d++) {
      const dayActivities = [];
      const usedActivities = new Set<number>();
      
      for (let i = 0; i < 4; i++) {
        let idx = Math.floor(Math.random() * allActivities.length);
        let attempts = 0;
        while (usedActivities.has(idx) && attempts < 10) {
          idx = Math.floor(Math.random() * allActivities.length);
          attempts++;
        }
        usedActivities.add(idx);
        dayActivities.push(allActivities[idx]);
      }

      const meals = MEAL_SUGGESTIONS[Math.floor(Math.random() * MEAL_SUGGESTIONS.length)];
      const baseCost = budget === 'luxury' ? 200 : budget === 'moderate' ? 100 : 50;
      const dailyCost = Math.round(baseCost * travelers * budgetMultiplier + Math.random() * 50);

      const tips = interests.map((i: string) => TIPS_BY_INTEREST[i as keyof typeof TIPS_BY_INTEREST]).filter(Boolean);

      itinerary.push({
        day: dayCounter++,
        location: stop.destination || 'Unknown Destination',
        activities: dayActivities,
        meals,
        tips: tips[Math.floor(Math.random() * tips.length)] || 'Research local customs before visiting.',
        estimatedCost: dailyCost,
      });
    }
  }

  const totalBudget = itinerary.reduce((sum, day) => sum + day.estimatedCost, 0);

  return { itinerary, totalBudget };
}

export async function POST(request: Request) {
  try {
    const { stops, preferences } = await request.json();

    const { itinerary, totalBudget } = generateItinerary(stops, preferences);

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (apiKey && stops[0]?.destination) {
      try {
        const prompt = `Create a detailed ${itinerary.length}-day travel itinerary for ${stops.map((s: any) => s.destination).join(', ')}.
Budget: ${preferences.budget}
Interests: ${preferences.interests.join(', ') || 'General sightseeing'}
Travelers: ${preferences.travelers}

Return a JSON array of daily plans with:
- day number
- location (use destination names from input)
- 4 activities per day
- 3 meals per day
- 1 travel tip
- estimated daily cost in USD

Format as valid JSON with this structure:
{
  "itinerary": [
    {
      "day": 1,
      "location": "City Name",
      "activities": ["Activity 1", "Activity 2", "Activity 3", "Activity 4"],
      "meals": ["Breakfast", "Lunch", "Dinner"],
      "tips": "Travel tip",
      "estimatedCost": 150
    }
  ],
  "totalBudget": 1050
}`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { maxOutputTokens: 2000, temperature: 0.3 }
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (text) {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              if (parsed.itinerary && parsed.totalBudget) {
                return NextResponse.json(parsed);
              }
            }
          }
        }
      } catch (error) {
        console.log('AI generation failed, using fallback');
      }
    }

    return NextResponse.json({ itinerary, totalBudget });

  } catch (error) {
    console.error('Trip planner error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate trip plan' 
    }, { status: 500 });
  }
}
