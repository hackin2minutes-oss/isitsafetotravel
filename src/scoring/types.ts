/**
 * Type definitions for the Safety Score Engine
 */

// Pillar scores (normalized 0-1 scale)
export interface PillarScores {
  conflict: number;    // Conflict/terrorism risk
  crime: number;      // Crime rate
  health: number;     // Healthcare quality
  governance: number; // Rule of law, corruption
  environment: number; // Natural disaster risk
}

// Government travel advisory
export interface TravelAdvisory {
  countryCode: string;
  source: string;           // e.g., 'US', 'UK', 'AU'
  level: 1 | 2 | 3 | 4;
  updatedAt: string;       // ISO date string
  url?: string;
}

// Baseline data (annual/datasets)
export interface BaselineData {
  countryCode: string;
  peaceIndex?: number;           // Global Peace Index (1-5)
  governanceScore?: number;      // World Bank Governance (approx -2.5 to 2.5)
  corruptionIndex?: number;      // Transparency Int'l (0-100)
  healthcareIndex?: number;      // Healthcare Quality Index (0-100)
  crimeIndex?: number;          // Crime Index (0-100)
  naturalDisasterRisk?: number; // Environmental Risk (0-10)
  population?: number;
  lastUpdated: string;
}

// Signal data (daily/realtime)
export interface SignalData {
  countryCode: string;
  activeConflicts?: ConflictEvent[];
  naturalDisasters?: DisasterEvent[];
  healthAlerts?: HealthAlert[];
  advisories: TravelAdvisory[];
  lastUpdated: string;
}

// Conflict event
export interface ConflictEvent {
  id: string;
  type: 'war' | 'armed_conflict' | 'civil_unrest' | 'terrorism';
  severity: 'low' | 'medium' | 'high' | 'extreme';
  fatalities?: number;
  startDate: string;
  lastUpdated: string;
}

// Natural disaster event
export interface DisasterEvent {
  id: string;
  type: 'earthquake' | 'flood' | 'hurricane' | 'wildfire' | 'other';
  severity: 'low' | 'medium' | 'high' | 'extreme';
  affectedPopulation?: number;
  startDate: string;
  lastUpdated: string;
}

// Health alert
export interface HealthAlert {
  id: string;
  disease: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cases?: number;
  deaths?: number;
  startDate: string;
  lastUpdated: string;
}

// Combined country data
export interface CountryData {
  code: string;               // ISO 3166-1 alpha-2
  name: string;
  region?: string;
  baselines: BaselineData;
  signals: SignalData;
  advisories: TravelAdvisory[];
}

// Calculated pillar with metadata
export interface PillarScore {
  name: string;
  displayName: string;
  value: number;     // 0-1 scale
  weight: number;     // percentage
  sources?: string[]; // Data sources used
}

// Raw score result
export interface RawScore {
  score: number;           // 1-10 scale
  pillarScores: PillarScore[];
  isHardCapped: boolean;   // Triggered by >50% Level 4 advisories
  isFloorLimited: boolean; // Triggered by pillar < 0.25
  rawGeometricMean: number;
  calculationDetails?: {
    weightedLogSum: number;
    criticalFloor?: number;
    hardCapReason?: string;
  };
}

// Country with calculated score
export interface ScoredCountry extends CountryData {
  score: RawScore;
  rank?: number;
  change?: 'up' | 'down' | 'stable';
  previousScore?: number;
}

// API response formats
export interface CountryScoreResponse {
  country: ScoredCountry;
  timestamp: string;
  dataFreshness: 'current' | 'stale' | 'outdated';
}

export interface WorldMapResponse {
  countries: ScoredCountry[];
  timestamp: string;
  totalCountries: number;
  generatedAt: string;
}

// Comparison types
export interface ComparisonResult {
  countries: [ScoredCountry, ScoredCountry];
  differences: {
    pillar: keyof PillarScores;
    diff: number;       // Absolute difference (0-1)
    winner: 0 | 1 | 2;  // 0 = tie, 1 = first country, 2 = second country
  }[];
  overallWinner: 0 | 1 | 2;
  scoreDifference: number;
}

// Caching types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// Score history for trend analysis
export interface ScoreHistory {
  countryCode: string;
  history: {
    date: string;
    score: number;
    pillarScores: PillarScores;
  }[];
}

// World Bank API response types
export interface WorldBankResponse {
  id: string;
  indicator: { id: string; value: string };
  country: { id: string; value: string };
  date: string;
  value: number | null;
}

// GDACS API response types
export interface GDACSEvent {
  id: string;
  name: string;
  eventtype: string;
  alertlevel: 'green' | 'yellow' | 'orange' | 'red';
  date: string;
  iso: string;  // Country code
}

// ReliefWeb API response types
export interface ReliefWebOembed {
  title: string;
  url: string;
  date: string;
  country: { id: string; name: string }[];
  theme: { id: string; name: string }[];
}
