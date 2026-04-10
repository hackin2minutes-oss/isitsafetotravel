import type { Location, SafetyAssessment } from '@/types';

export const mockLocation: Location = {
  id: 'city_uk_london',
  name: 'London',
  type: 'city',
  countryId: 'GB',
  countryName: 'United Kingdom',
  regionId: 'uk',
  coordinates: { latitude: 51.5074, longitude: -0.1278 },
  population: 9000000,
};

export const mockAssessment: SafetyAssessment = {
  score: 85,
  rating: 'SAFE',
  summary: 'London is a generally safe city with moderate crime rates in certain areas.',
  weather: {
    score: 90,
    status: 'Good',
    data: {
      temperature: 15,
      feelsLike: 14,
      condition: 'Partly cloudy',
      humidity: 72,
      windSpeed: 12,
      windDirection: 'SW',
      visibility: 10,
      uvIndex: 4,
      riskFactors: [],
    },
  },
  airQuality: {
    score: 85,
    status: 'Good',
    data: {
      aqi: 42,
      category: 'Good',
      pm25: 12,
      pm10: 25,
      no2: 30,
      o3: 35,
      so2: 5,
    }
  },
  security: {
    score: 82,
    status: 'Moderate',
    data: {
      threatLevel: 'Low',
      violenceIndex: 2.1,
      terrorismRisk: 'Low',
      warStatus: 'none',
      crimeRate: 32,
      recentIncidents: 5,
      lastIncidentDate: '2024-11-15',
    },
  },
  dimensions: {
    atmospheric: { score: 7, source: 'Mock', justification: 'Average.' },
    meteorological: { score: 8, source: 'Mock', justification: 'Good.' },
    geopolitical: { score: 9, source: 'Mock', justification: 'Stable.' },
    security: { score: 6, source: 'Mock', justification: 'Moderate risk.' },
    airQualityIndex: { score: 9, source: 'Mock', justification: 'Clear.' },
    womenSafety: { score: 8, source: 'Mock', justification: 'Safe.' },
    lgbtqSafety: { score: 7, source: 'Mock', justification: 'Accepting.' },
    childSafety: { score: 8, source: 'Mock', justification: 'Child friendly.' },
  },
  advisories: [
    {
      level: 'low',
      icon: 'info',
      title: 'Petty Theft',
      detail: 'Be cautious of pickpockets in crowded tourist areas.',
    },
  ],
  requirements: {
    visa: 'Required for most nationalities',
    passport: 'Valid for 6 months beyond arrival',
    vaccinations: 'None required',
    insurance: 'Recommended',
    covid: 'Not required',
  },
  quickFacts: {
    advisoryLevel: 'Exercise Normal Security Precautions',
    bestTime: 'May to September',
    currency: 'British Pound (GBP)',
    language: 'English',
    timeZone: 'GMT/ BST',
    callingCode: '+44',
    population: '9,000,000',
    landArea: '1,572 km²',
  },
  tips: [
    'Keep valuables secure in crowded areas.',
    'Use registered taxi services.',
    'Stay aware of your surroundings.',
  ],
  emergency: {
    police: '999',
    ambulance: '999',
    fire: '999',
    helpline: '111',
  },
  news: [
    {
      id: 'news_1',
      title: 'London announces new cycling infrastructure',
      link: 'https://example.com/news/1',
      source: 'Travel News',
      date: '2025-01-15',
      relevance: 'moderate',
    },
  ],
  logistics: {
    airspace: 'open',
    transport: 'nominal',
    details: 'All transport services operating normally.',
  },
  recommendation: 'London is recommended for travel with standard precautions.',
  lastUpdated: '2025-01-20T12:00:00Z',
};

export const mockWarZoneLocation: Location = {
  id: 'city_ua_mariupol',
  name: 'Mariupol',
  type: 'city',
  countryId: 'UA',
  countryName: 'Ukraine',
  coordinates: { latitude: 47.0971, longitude: 37.5434 },
};

export const mockWarZoneAssessment: SafetyAssessment = {
  ...mockAssessment,
  score: 15,
  rating: 'CRITICAL',
  summary: 'This region is experiencing active armed conflict.',
  security: {
    score: 10,
    status: 'Extreme',
    data: {
      ...mockAssessment.security.data,
      threatLevel: 'Extreme',
      warStatus: 'active_war',
      conflictLabel: 'Russia-Ukraine Conflict',
      conflictSince: 'February 2022',
    },
  },
};

export const createMockAssessment = (overrides: Partial<SafetyAssessment> = {}): SafetyAssessment => ({
  ...mockAssessment,
  ...overrides,
});

export const createMockLocation = (overrides: Partial<Location> = {}): Location => ({
  ...mockLocation,
  ...overrides,
});
