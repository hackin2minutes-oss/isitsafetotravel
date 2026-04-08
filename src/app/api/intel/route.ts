import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countryCode = searchParams.get('code');

  if (!countryCode) {
    return NextResponse.json({ error: 'Country code is required' }, { status: 400 });
  }

  try {
    const code = countryCode.toUpperCase();

    // Parallel fetch from public global datasets
    const [restRes, emergRes] = await Promise.all([
      fetch(`https://restcountries.com/v3.1/alpha/${code}`).catch(() => null),
      fetch(`https://emergencynumberapi.com/api/country/${code}`).catch(() => null),
    ]);

    let currencies = 'Local Currency';
    let languages = 'Primary Local';
    let timezones = ['Local Time'];

    if (restRes && restRes.ok) {
      const restData = await restRes.json();
      if (restData && restData[0]) {
        if (restData[0].currencies) {
          currencies = Object.values(restData[0].currencies)
            .map((c: any) => `${c.name} (${c.symbol})`)
            .join(', ');
        }
        if (restData[0].languages) {
          languages = Object.values(restData[0].languages).join(', ');
        }
        if (restData[0].timezones) {
          timezones = restData[0].timezones;
        }
      }
    }

    let emergency = {
      police: '112',
      ambulance: '112',
      fire: '112',
      helpline: '112'
    };

    if (emergRes && emergRes.ok) {
      const emergData = await emergRes.json();
      if (emergData && emergData.data) {
        emergency.police = emergData.data.police?.all?.[0] || emergency.police;
        emergency.ambulance = emergData.data.ambulance?.all?.[0] || emergency.ambulance;
        emergency.fire = emergData.data.fire?.all?.[0] || emergency.fire;
        emergency.helpline = emergData.data.dispatch?.all?.[0] || emergency.helpline;
      }
    }

    return NextResponse.json({
      currencies,
      languages,
      timezones,
      emergency
    });

  } catch (error) {
    console.error('Intel fetch error:', error);
    return NextResponse.json({
      currencies: 'Local Currency',
      languages: 'Primary Local',
      timezones: ['Local'],
      emergency: {
        police: '112', ambulance: '112', fire: '112', helpline: '112'
      }
    });
  }
}
