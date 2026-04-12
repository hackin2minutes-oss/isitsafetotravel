import { NextResponse } from 'next/server';

export const runtime = 'edge';

const TIME_DISTRIBUTED_ACTIVITIES: Record<string, string[]> = {
  morning: ['Early morning market visit', 'Sunrise photography walk', 'Morning yoga in park', 'Breakfast at local cafe', 'Visit to morning farmers market'],
  afternoon: ['Guided city tour', 'Museum visit', 'Local shopping district', 'Historic walking tour', 'Art gallery exploration', 'Architecture appreciation walk'],
  evening: ['Sunset viewpoint visit', 'Rooftop drinks', 'Local theater or performance', 'Evening food tour', 'Street food discovery walk'],
};

const ACTIVITY_BY_INTEREST: Record<string, string[]> = {
  culture: ['Visit national museum', 'Explore historic old town', 'Attend cultural performance', 'Join local cooking class', 'Tour ancient ruins', 'Visit UNESCO heritage site'],
  food: ['Street food walking tour', 'Local market exploration', 'Wine/food pairing experience', 'Visit famous local restaurant', 'Food tour with local guide', 'Cooking class'],
  nature: ['Hike scenic trail', 'Visit botanical gardens', 'Beach day', 'Nature reserve exploration', 'Scenic boat ride', 'Park and picnic'],
  adventure: ['Water sports activity', 'Mountain/rock climbing', 'Zip lining or similar', 'Diving or snorkeling trip', 'Off-road adventure tour', 'Kayaking or canoeing'],
  nightlife: ['Rooftop bar hopping', 'Live music venue', 'Night market exploration', 'Club or DJ night', 'Evening show or theater', 'Late night food crawl'],
  photography: ['Golden hour photo walk', 'Street photography tour', 'Hidden gems discovery', 'Iconic landmarks session', 'Sunrise shoot', 'Urban exploration walk'],
};

const MEALS = {
  breakfast: ['Local bakery breakfast', 'Hotel breakfast buffet', 'Traditional breakfast spot', 'Cafe morning coffee & pastries', 'Fresh fruit & coffee'],
  lunch: ['Casual local restaurant', 'Food court with local options', 'Market lunch stalls', 'Quick sandwich & salad', 'Traditional dish of the day'],
  dinner: ['Fine dining restaurant', 'Local family restaurant', 'Waterfront dining', 'Rooftop dinner experience', 'Traditional cuisine dinner', 'Street food dinner tour'],
};

const TIPS = {
  culture: 'Book museum tickets online to skip lines. Many offer free entry on specific days.',
  food: 'Eat where locals eat - look for busy restaurants with no photos on the menu.',
  nature: 'Start outdoor activities early to avoid crowds and midday heat. Bring water.',
  adventure: 'Book adventure activities through your hotel or reputable local operators.',
  nightlife: 'Use licensed taxis or rideshare apps late at night. Keep ID on you.',
  photography: 'Golden hour (1 hour before sunset) offers the best light. Wake up early for empty tourist spots.',
};

function generateSmartItinerary(stops: any[], preferences: any) {
  const { interests, budget, travelers } = preferences;
  const dailyBudgetPerPerson = budget === 'luxury' ? 250 : budget === 'moderate' ? 120 : 60;
  const budgetMultiplier = budget === 'luxury' ? 1.5 : budget === 'moderate' ? 1 : 0.7;

  const itinerary = [];
  let dayCounter = 1;

  for (const stop of stops) {
    const stopDays = stop.startDate && stop.endDate 
      ? Math.ceil((new Date(stop.endDate).getTime() - new Date(stop.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
      : 3;

    for (let d = 0; d < stopDays; d++) {
      const dayInterest = interests[d % Math.max(interests.length, 1)] || 'culture';
      const availableActivities = ACTIVITY_BY_INTEREST[dayInterest] || ACTIVITY_BY_INTEREST.culture;
      
      const activities = [
        `${TIME_DISTRIBUTED_ACTIVITIES.morning[Math.floor(Math.random() * TIME_DISTRIBUTED_ACTIVITIES.morning.length)]}`,
        availableActivities[Math.floor(Math.random() * availableActivities.length)],
        `${TIME_DISTRIBUTED_ACTIVITIES.afternoon[Math.floor(Math.random() * TIME_DISTRIBUTED_ACTIVITIES.afternoon.length)]}`,
        availableActivities[(Math.floor(Math.random() * availableActivities.length) + 2) % availableActivities.length],
      ];

      const meals = [
        `${MEALS.breakfast[Math.floor(Math.random() * MEALS.breakfast.length)]}`,
        `${MEALS.lunch[Math.floor(Math.random() * MEALS.lunch.length)]}`,
        `${MEALS.dinner[Math.floor(Math.random() * MEALS.dinner.length)]}`,
      ];

      const dailyCost = Math.round(dailyBudgetPerPerson * travelers * budgetMultiplier);
      const locationName = stop.destination || 'Your Destination';

      itinerary.push({
        day: dayCounter++,
        location: locationName,
        activities,
        meals,
        tips: TIPS[dayInterest as keyof typeof TIPS] || TIPS.culture,
        estimatedCost: dailyCost,
        timeOfDay: 'Full Day',
      });
    }
  }

  const totalBudget = itinerary.reduce((sum, day) => sum + day.estimatedCost, 0);

  return { itinerary, totalBudget };
}

export async function POST(request: Request) {
  try {
    const { stops, preferences } = await request.json();

    if (!stops || !stops.length || !stops[0]?.destination) {
      return NextResponse.json({ error: 'Please provide at least one destination' }, { status: 400 });
    }

    const { itinerary, totalBudget } = generateSmartItinerary(stops, preferences);

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (apiKey) {
      try {
        const destinations = stops.map((s: any) => s.destination).join(', ');
        const prompt = `Create a realistic day-by-day itinerary for ${destinations}.
Duration: ${itinerary.length} days
Interests: ${preferences.interests?.join(', ') || 'General sightseeing'}
Budget: ${preferences.budget}
Travelers: ${preferences.travelers || 1}

For each day, provide:
- Time-distributed activities (morning, afternoon, evening)
- Specific restaurant types or cuisines
- One practical travel tip
- Realistic cost estimate in USD

Return ONLY valid JSON like this:
{
  "itinerary": [
    {
      "day": 1,
      "location": "City",
      "activities": ["Morning activity", "Afternoon activity", "Evening activity"],
      "meals": ["Breakfast suggestion", "Lunch suggestion", "Dinner suggestion"],
      "tips": "Practical tip",
      "estimatedCost": 150
    }
  ],
  "totalBudget": 1050
}`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { maxOutputTokens: 1500, temperature: 0.4 }
            })
          }
        );

        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (text) {
            try {
              const jsonMatch = text.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.itinerary?.length > 0) {
                  return NextResponse.json(parsed);
                }
              }
            } catch {
              // AI response wasn't valid JSON, use fallback
            }
          }
        }
      } catch {
        // AI failed, use fallback
      }
    }

    return NextResponse.json({ itinerary, totalBudget, enhanced: false });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 });
  }
}
