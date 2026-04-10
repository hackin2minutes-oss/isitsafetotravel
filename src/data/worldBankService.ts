/**
 * World Bank API Data Fetcher
 * 
 * Fetches governance and development indicators
 */

import { WorldBankResponse, BaselineData } from '../scoring/types';

const WORLD_BANK_BASE_URL = 'https://api.worldbank.org/v2';
const FORMAT = 'json';

// World Bank indicator codes
export const INDICATORS = {
  GOVERNANCE: 'PV.EST',
  RULE_OF_LAW: 'RL.EST',
  CORRUPTION: 'CC.EST',
  POLITICAL_STABILITY: 'PS.EST',
  GOVERNMENT_EFFECTIVENESS: 'GE.EST',
} as const;

interface WorldBankDataPoint {
  date: string;
  value: number;
}

/**
 * Fetch World Bank indicator data for a country
 */
async function fetchIndicator(
  countryCode: string,
  indicator: string
): Promise<WorldBankDataPoint | null> {
  try {
    const response = await fetch(
      `${WORLD_BANK_BASE_URL}/country/${countryCode}/indicator/${indicator}?format=${FORMAT}&per_page=1&date=2023`,
      { next: { revalidate: 86400 } } // Cache for 24 hours
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data[1] && data[1].length > 0 && data[1][0].value !== null) {
      return {
        date: data[1][0].date,
        value: data[1][0].value,
      };
    }
    
    return null;
  } catch (error) {
    console.error(`World Bank API error for ${countryCode}:`, error);
    return null;
  }
}

/**
 * Fetch all governance indicators for a country
 */
export async function fetchGovernanceData(countryCode: string): Promise<{
  governance: number | null;
  ruleOfLaw: number | null;
  corruption: number | null;
  politicalStability: number | null;
  governmentEffectiveness: number | null;
}> {
  const [governance, ruleOfLaw, corruption, politicalStability, governmentEffectiveness] = await Promise.all([
    fetchIndicator(countryCode, INDICATORS.GOVERNANCE),
    fetchIndicator(countryCode, INDICATORS.RULE_OF_LAW),
    fetchIndicator(countryCode, INDICATORS.CORRUPTION),
    fetchIndicator(countryCode, INDICATORS.POLITICAL_STABILITY),
    fetchIndicator(countryCode, INDICATORS.GOVERNMENT_EFFECTIVENESS),
  ]);
  
  return {
    governance: governance?.value ?? null,
    ruleOfLaw: ruleOfLaw?.value ?? null,
    corruption: corruption?.value ?? null,
    politicalStability: politicalStability?.value ?? null,
    governmentEffectiveness: governmentEffectiveness?.value ?? null,
  };
}

/**
 * Fetch baseline data for all countries (batch)
 */
export async function fetchAllCountriesBaseline(
  countryCodes: string[]
): Promise<Map<string, BaselineData>> {
  const results = new Map<string, BaselineData>();
  
  // Fetch in batches of 50 to avoid rate limiting
  const batchSize = 50;
  
  for (let i = 0; i < countryCodes.length; i += batchSize) {
    const batch = countryCodes.slice(i, i + batchSize);
    const codesParam = batch.join(';');
    
    try {
      // Fetch multiple indicators in parallel
      const responses = await Promise.all(
        Object.entries(INDICATORS).map(([key, indicator]) =>
          fetch(`${WORLD_BANK_BASE_URL}/country/${codesParam}/indicator/${indicator}?format=${FORMAT}&per_page=100&date=2023`)
            .then(r => r.json())
            .catch(() => null)
        )
      );
      
      // Process responses
      batch.forEach(code => {
        const countryIndicators: Record<string, number | null> = {};
        
        responses.forEach((data, index) => {
          if (data && data[1]) {
            const countryData = data[1].find((d: WorldBankResponse) => 
              d.country.id === code || d.country.value === code
            );
            if (countryData && countryData.value !== null) {
              countryIndicators[Object.keys(INDICATORS)[index]] = countryData.value;
            }
          }
        });
        
        // Average governance indicators
        const governanceValues = Object.entries(countryIndicators)
          .filter(([key]) => key !== 'corruption')
          .map(([, value]) => value)
          .filter((v): v is number => v !== null);
        
        const avgGovernance = governanceValues.length > 0
          ? governanceValues.reduce((a, b) => a + b, 0) / governanceValues.length
          : null;
        
        results.set(code, {
          countryCode: code,
          governanceScore: avgGovernance ?? undefined,
          corruptionIndex: countryIndicators.corruption ?? undefined,
          lastUpdated: new Date().toISOString(),
        });
      });
      
      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Batch fetch error:', error);
    }
  }
  
  return results;
}
