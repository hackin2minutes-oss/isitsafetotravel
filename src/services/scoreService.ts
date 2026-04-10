/**
 * Main Safety Score Service
 * 
 * Combines all data sources and calculates composite scores
 */

import { 
  CountryData, 
  ScoredCountry, 
  PillarScores, 
  RawScore,
  TravelAdvisory,
  CacheEntry 
} from '../scoring/types';
import { 
  calculateCompositeScore, 
  normalizers,
  PILLAR_WEIGHTS 
} from '../scoring/scoring';
import { fetchAllCountriesBaseline, fetchGovernanceData } from '../data/worldBankService';
import { fetchGDACSAlertsForCountries, calculateDisasterRiskScore } from '../data/disasterService';
import { fetchAllTravelAdvisories, getAggregatedAdvisoryLevel } from '../data/advisoryService';
import { WORLD_CENSUS_DB } from '../data/worldDatabase';

// In-memory cache
const scoreCache = new Map<string, CacheEntry<ScoredCountry>>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// All country codes
const ALL_COUNTRY_CODES = Object.keys(WORLD_CENSUS_DB);

/**
 * Add to cache
 */
function cacheSet(key: string, data: ScoredCountry): void {
  scoreCache.set(key, {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

/**
 * Get from cache
 */
function cacheGet(key: string): ScoredCountry | null {
  const entry = scoreCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    scoreCache.delete(key);
    return null;
  }
  return entry.data;
}

/**
 * Calculate pillar scores from raw data
 */
async function calculatePillarScores(
  countryCode: string,
  baselineData: any,
  gdacsEvents: any[],
  advisories: TravelAdvisory[]
): Promise<{ pillars: PillarScores; timestamps: Record<keyof PillarScores, string> }> {
  // Conflict pillar: weighted average of conflict events + advisory levels
  const { level: conflictLevel, weightedLevel: weightedConflict } = getAggregatedAdvisoryLevel(advisories);
  const conflictFromAdvisories = normalizers.travelAdvisory(conflictLevel);
  
  // Crime pillar: from baseline + adjustment from advisories
  const crimeBase = baselineData?.crimeIndex 
    ? normalizers.crimeRate(baselineData.crimeIndex / 100) 
    : 0.7;
  const crimeAdjustment = 1 - (weightedConflict - 1) * 0.2; // Reduce for high conflict areas
  const crime = Math.max(0, Math.min(1, crimeBase * crimeAdjustment));
  
  // Health pillar: from healthcare index
  const health = baselineData?.healthcareIndex 
    ? normalizers.healthcareQuality(baselineData.healthcareIndex)
    : 0.7;
  
  // Governance pillar: from World Bank data
  const governance = baselineData?.governanceScore !== undefined
    ? normalizers.governance(baselineData.governanceScore)
    : 0.5;
  
  // Environment pillar: from GDACS natural disasters
  const disasterRisk = calculateDisasterRiskScore(gdacsEvents);
  const envBase = baselineData?.naturalDisasterRisk !== undefined
    ? normalizers.environmentalRisk(baselineData.naturalDisasterRisk)
    : 0.7;
  const environment = Math.min(envBase, disasterRisk);
  
  const pillars: PillarScores = {
    conflict: conflictFromAdvisories,
    crime,
    health,
    governance,
    environment,
  };
  
  const timestamps: Record<keyof PillarScores, string> = {
    conflict: new Date().toISOString(),
    crime: baselineData?.lastUpdated || new Date().toISOString(),
    health: baselineData?.lastUpdated || new Date().toISOString(),
    governance: baselineData?.lastUpdated || new Date().toISOString(),
    environment: new Date().toISOString(),
  };
  
  return { pillars, timestamps };
}

/**
 * Calculate score for a single country
 */
export async function calculateCountryScore(
  countryCode: string
): Promise<ScoredCountry | null> {
  // Check cache first
  const cached = cacheGet(countryCode);
  if (cached) return cached;
  
  try {
    // Fetch data from sources
    const [baselineData, gdacsEvents, advisoriesMap] = await Promise.all([
      fetchGovernanceData(countryCode),
      fetchGDACSAlertsForCountries([countryCode]).then(m => m.get(countryCode) || []),
      fetchAllTravelAdvisories().then(m => m.get(countryCode) || []),
    ]);
    
    // Combine baseline with governance data
    const combinedBaseline = {
      ...baselineData,
      countryCode,
      lastUpdated: new Date().toISOString(),
    };
    
    // Calculate pillar scores
    const { pillars, timestamps } = await calculatePillarScores(
      countryCode,
      combinedBaseline,
      gdacsEvents,
      advisoriesMap
    );
    
    // Calculate composite score
    const rawScore = calculateCompositeScore(
      pillars,
      advisoriesMap.map(a => ({ level: a.level as 1|2|3|4 })),
      timestamps
    );
    
    // Get country name from census data
    const censusData = WORLD_CENSUS_DB[countryCode];
    const countryName = censusData ? getCountryNameFromCode(countryCode) : countryCode;
    
    const scoredCountry: ScoredCountry = {
      code: countryCode,
      name: countryName,
      baselines: combinedBaseline,
      signals: {
        countryCode,
        advisories: advisoriesMap,
        lastUpdated: new Date().toISOString(),
      },
      advisories: advisoriesMap,
      score: rawScore,
    };
    
    // Cache the result
    cacheSet(countryCode, scoredCountry);
    
    return scoredCountry;
  } catch (error) {
    console.error(`Error calculating score for ${countryCode}:`, error);
    return null;
  }
}

/**
 * Calculate scores for all countries
 */
export async function calculateAllCountryScores(): Promise<ScoredCountry[]> {
  const results: ScoredCountry[] = [];
  
  // Process in batches
  const batchSize = 20;
  
  for (let i = 0; i < ALL_COUNTRY_CODES.length; i += batchSize) {
    const batch = ALL_COUNTRY_CODES.slice(i, i + batchSize);
    
    const batchResults = await Promise.all(
      batch.map(code => calculateCountryScore(code))
    );
    
    batchResults.forEach(result => {
      if (result) results.push(result);
    });
    
    // Update rankings
    results.sort((a, b) => b.score.score - a.score.score);
    results.forEach((country, index) => {
      country.rank = index + 1;
    });
    
    console.log(`Processed ${Math.min(i + batchSize, ALL_COUNTRY_CODES.length)}/${ALL_COUNTRY_CODES.length} countries`);
  }
  
  return results;
}

/**
 * Get country by code
 */
export async function getCountryByCode(code: string): Promise<ScoredCountry | null> {
  return calculateCountryScore(code);
}

/**
 * Get top/bottom N countries
 */
export async function getTopCountries(n: number = 10): Promise<ScoredCountry[]> {
  const allScores = await calculateAllCountryScores();
  return allScores.slice(0, n);
}

export async function getBottomCountries(n: number = 10): Promise<ScoredCountry[]> {
  const allScores = await calculateAllCountryScores();
  return allScores.slice(-n).reverse();
}

/**
 * Compare two countries
 */
export async function compareCountries(
  code1: string,
  code2: string
): Promise<{ country1: ScoredCountry; country2: ScoredCountry } | null> {
  const [country1, country2] = await Promise.all([
    calculateCountryScore(code1),
    calculateCountryScore(code2),
  ]);
  
  if (!country1 || !country2) return null;
  
  return { country1, country2 };
}

/**
 * Clear cache
 */
export function clearScoreCache(): void {
  scoreCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; oldestEntry: number | null } {
  let oldestEntry: number | null = null;
  
  scoreCache.forEach(entry => {
    if (oldestEntry === null || entry.timestamp < oldestEntry) {
      oldestEntry = entry.timestamp;
    }
  });
  
  return {
    size: scoreCache.size,
    oldestEntry,
  };
}

// Helper to get country name from ISO code
function getCountryNameFromCode(code: string): string {
  const nameMap: Record<string, string> = {
    US: 'United States', GB: 'United Kingdom', CA: 'Canada', AU: 'Australia',
    DE: 'Germany', FR: 'France', JP: 'Japan', KR: 'South Korea', IN: 'India',
    CN: 'China', BR: 'Brazil', MX: 'Mexico', RU: 'Russia', UA: 'Ukraine',
    IL: 'Israel', AE: 'UAE', SA: 'Saudi Arabia', NG: 'Nigeria', ZA: 'South Africa',
    EG: 'Egypt', TH: 'Thailand', VN: 'Vietnam', PH: 'Philippines', ID: 'Indonesia',
    MY: 'Malaysia', SG: 'Singapore', NZ: 'New Zealand', IT: 'Italy', ES: 'Spain',
    PT: 'Portugal', GR: 'Greece', NL: 'Netherlands', BE: 'Belgium', AT: 'Austria',
    CH: 'Switzerland', SE: 'Sweden', NO: 'Norway', DK: 'Denmark', FI: 'Finland',
    PL: 'Poland', CZ: 'Czech Republic', HU: 'Hungary', RO: 'Romania',
    TR: 'Turkey', AR: 'Argentina', CL: 'Chile', CO: 'Colombia', PE: 'Peru',
    // Add more as needed
  };
  
  return nameMap[code] || code;
}
