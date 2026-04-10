export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Location {
  id: string;
  name: string;
  type: 'country' | 'region' | 'city';
  countryId?: string;
  countryName?: string;
  regionId?: string;
  coordinates: Coordinates;
  population?: number;
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  visibility: number;
  uvIndex: number;
  riskFactors: string[];
}

export interface AirQualityData {
  aqi: number;
  category: string;
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
  so2: number;
}

export interface SecurityData {
  threatLevel: string;
  violenceIndex: number;
  terrorismRisk: string;
  warStatus: string;
  crimeRate: number;
  recentIncidents: number;
  lastIncidentDate?: string;
  conflictLabel?: string;
  conflictSince?: string;
}

export interface IntelData {
  currencies: string;
  languages: string;
  timezones: string[];
  emergency: {
    police: string;
    ambulance: string;
    fire: string;
    helpline: string;
  };
}

export interface LogisticStatus {
  airspace: 'open' | 'restricted' | 'closed';
  transport: 'nominal' | 'disrupted' | 'critical';
  details: string;
}

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  source: string;
  date: string;
  relevance: 'high' | 'moderate' | 'low';
}

export interface NewsData {
  items: NewsItem[];
  lastUpdated: string;
}

export interface AviationData {
  status: 'open' | 'restricted' | 'closed';
  headline?: string;
  warning?: string | null;
  source?: string;
  sourceUrl?: string;
  lastUpdated?: string;
  error?: string;
}

export interface DimensionData {
  score: number;
  source: string;
  justification: string;
}

export interface Dimensions {
  atmospheric: DimensionData;
  meteorological: DimensionData;
  geopolitical: DimensionData;
  security: DimensionData;
  airQualityIndex: DimensionData;
  womenSafety: DimensionData;
  lgbtqSafety: DimensionData;
  childSafety: DimensionData;
}

export interface Advisory {
  level: 'low' | 'moderate' | 'high';
  icon: string;
  title: string;
  detail: string;
}

export interface EmergencyContacts {
  police: string;
  ambulance: string;
  fire: string;
  helpline: string;
}

export interface TravelRequirements {
  visa: string;
  passport: string;
  vaccinations: string;
  insurance: string;
  covid: string;
}

export interface QuickFacts {
  advisoryLevel: string;
  bestTime: string;
  currency: string;
  language: string;
  timeZone: string;
  callingCode: string;
  population: string;
  landArea: string;
}

export interface OperationalHazard {
  id: string;
  title: string;
  severity: 'high' | 'moderate' | 'low';
  description: string;
}

export interface SafetyAssessment {
  score: number;
  rating: 'VERY SAFE' | 'SAFE' | 'MODERATE' | 'CAUTION' | 'DANGEROUS' | 'CRITICAL';
  summary: string;
  
  weather: { score: number; status: string; data: WeatherData; };
  airQuality: { score: number; status: string; data: AirQualityData; };
  security: { score: number; status: string; data: SecurityData; };
  
  // New 8-Dimension Data Models
  dimensions: Dimensions;
  advisories: Advisory[];
  requirements: TravelRequirements;
  quickFacts: QuickFacts;
  tips: string[];
  emergency: EmergencyContacts;
  news: NewsItem[];
  logistics: LogisticStatus;
  hazards: OperationalHazard[];
  
  recommendation: string;
  lastUpdated: string;
}

export interface SearchResult {
  type: 'country' | 'region' | 'city';
  name: string;
  subName?: string;
  id: string;
  coordinates: Coordinates;
}