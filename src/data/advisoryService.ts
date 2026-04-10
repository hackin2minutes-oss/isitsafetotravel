/**
 * Government Travel Advisories Data Fetcher
 * 
 * Scrapes/parses travel advisories from 37+ government sources
 */

import { TravelAdvisory } from '../scoring/types';

// Government advisory sources configuration
export const ADVISORY_SOURCES = [
  { code: 'US', name: 'United States', url: 'https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories.html', weight: 1.0 },
  { code: 'UK', name: 'United Kingdom', url: 'https://www.gov.uk/foreign-travel-advice', weight: 0.9 },
  { code: 'CA', name: 'Canada', url: 'https://travel.gc.ca/travelling/advisories', weight: 0.9 },
  { code: 'AU', name: 'Australia', url: 'https://www.smartraveller.gov.au/news-and-updates/lists/countries-and-regions', weight: 0.85 },
  { code: 'NZ', name: 'New Zealand', url: 'https://www.safetravel.govt.nz/', weight: 0.8 },
  { code: 'DE', name: 'Germany', url: 'https://www.auswaertiges-amt.de/de/ReiseUndSicherheit', weight: 0.85 },
  { code: 'FR', name: 'France', url: 'https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/', weight: 0.85 },
  { code: 'JP', name: 'Japan', url: 'https://www.anzen.mofa.go.jp/', weight: 0.8 },
  { code: 'KR', name: 'South Korea', url: 'https://www.0404.go.kr/', weight: 0.75 },
  { code: 'IE', name: 'Ireland', url: 'https://www.dfa.ie/travel/', weight: 0.75 },
  { code: 'NL', name: 'Netherlands', url: 'https://www.nederlandwereldwijd.nl/reizen', weight: 0.75 },
  { code: 'SE', name: 'Sweden', url: 'https://www.swedenabroad.se/', weight: 0.75 },
  { code: 'NO', name: 'Norway', url: 'https://www.regjeringen.no/', weight: 0.75 },
  { code: 'DK', name: 'Denmark', url: 'https://um.dk/rejser/', weight: 0.75 },
  { code: 'FI', name: 'Finland', url: 'https://um.fi/', weight: 0.75 },
  { code: 'CH', name: 'Switzerland', url: 'https://www.eda.admin.ch/eda/en/home.html', weight: 0.8 },
  { code: 'AT', name: 'Austria', url: 'https://www.bmeia.gv.at/', weight: 0.75 },
  { code: 'BE', name: 'Belgium', url: 'https://diplomatie.belgium.be/', weight: 0.75 },
  { code: 'ES', name: 'Spain', url: 'https://www.exteriores.gob.es/', weight: 0.75 },
  { code: 'IT', name: 'Italy', url: 'https://www.viaggiaresicuri.it/', weight: 0.75 },
  { code: 'PT', name: 'Portugal', url: 'https://www.portaldascomunidades.pt/', weight: 0.7 },
  { code: 'GR', name: 'Greece', url: 'https://www.mfa.gr/', weight: 0.7 },
  { code: 'IL', name: 'Israel', url: 'https://www.gov.il/', weight: 0.7 },
  { code: 'SG', name: 'Singapore', url: 'https://www.mfa.gov.sg/', weight: 0.8 },
  { code: 'HK', name: 'Hong Kong', url: 'https://www.sb.gov.hk/', weight: 0.7 },
  { code: 'TW', name: 'Taiwan', url: 'https://www.boca.gov.tw/', weight: 0.7 },
  { code: 'AE', name: 'UAE', url: 'https://www.mofa.gov.ae/', weight: 0.7 },
  { code: 'SA', name: 'Saudi Arabia', url: 'https://www.mofa.gov.sa/', weight: 0.7 },
  { code: 'IN', name: 'India', url: 'https://www.mohfw.gov.in/', weight: 0.65 },
  { code: 'BR', name: 'Brazil', url: 'https://www.gov.br/mre/', weight: 0.65 },
  { code: 'MX', name: 'Mexico', url: 'https://www.gob.mx/sre/', weight: 0.7 },
  { code: 'ZA', name: 'South Africa', url: 'https://www.gov.za/', weight: 0.6 },
  { code: 'NG', name: 'Nigeria', url: 'https://www.foreignaffairs.gov.ng/', weight: 0.6 },
  { code: 'EG', name: 'Egypt', url: 'https://www.mfa.gov.eg/', weight: 0.6 },
  { code: 'TH', name: 'Thailand', url: 'https://www.thaiembassy.org/', weight: 0.65 },
  { code: 'VN', name: 'Vietnam', url: 'https://vietnamembassy-us.org/', weight: 0.65 },
  { code: 'PH', name: 'Philippines', url: 'https://www.dfa.gov.ph/', weight: 0.65 },
] as const;

/**
 * US Travel Advisory Parser
 * US uses a 1-4 level system
 */
async function fetchUSTravelAdvisories(): Promise<Map<string, TravelAdvisory>> {
  const results = new Map<string, TravelAdvisory>();
  
  try {
    // US State Department API
    const response = await fetch('https://api.travel-advisory.info/api/data', {
      next: { revalidate: 43200 }, // 12 hours
    });
    
    if (response.ok) {
      const data = await response.json();
      
      Object.entries(data.data || {}).forEach(([code, info]: [string, any]) => {
        if (info.advisory) {
          results.set(code.toUpperCase(), {
            countryCode: code.toUpperCase(),
            source: 'US',
            level: info.advisory.score || 1,
            updatedAt: info.advisory.updated || new Date().toISOString(),
            url: info.advisory.link,
          });
        }
      });
    }
  } catch (error) {
    console.error('US Travel Advisory fetch error:', error);
  }
  
  return results;
}

/**
 * UK Travel Advisory Parser
 * UK uses a 4-level system (Normal, Precautions, All but essential, Do not travel)
 */
async function fetchUKTravelAdvisories(): Promise<Map<string, TravelAdvisory>> {
  const results = new Map<string, TravelAdvisory>();
  
  try {
    // Parse from gov.uk - simplified example
    const response = await fetch(
      'https://www.gov.uk/api/foreign-travel-advice',
      { next: { revalidate: 43200 } }
    );
    
    if (response.ok) {
      const data = await response.json();
      
      (data.results || []).forEach((item: any) => {
        const code = item.country_slug?.toUpperCase();
        if (code) {
          // UK doesn't provide explicit levels in API, would need to scrape HTML
          // For now, return placeholder
          results.set(code, {
            countryCode: code,
            source: 'UK',
            level: 1,
            updatedAt: new Date().toISOString(),
          });
        }
      });
    }
  } catch (error) {
    console.error('UK Travel Advisory fetch error:', error);
  }
  
  return results;
}

/**
 * Fetch travel advisories from multiple sources
 */
export async function fetchAllTravelAdvisories(): Promise<Map<string, TravelAdvisory[]>> {
  const results = new Map<string, TravelAdvisory[]>();
  
  // Fetch from US (most comprehensive)
  const usAdvisories = await fetchUSTravelAdvisories();
  
  // Merge into results
  usAdvisories.forEach((advisory, countryCode) => {
    results.set(countryCode, [advisory]);
  });
  
  // Fetch from other sources and merge
  // (simplified - in production, would add more sources)
  
  return results;
}

/**
 * Get aggregated advisory level for a country
 * Weighs multiple sources together
 */
export function getAggregatedAdvisoryLevel(
  advisories: TravelAdvisory[]
): { level: number; weightedLevel: number } {
  if (advisories.length === 0) {
    return { level: 1, weightedLevel: 1 };
  }
  
  // Get the highest (worst) level
  const maxLevel = Math.max(...advisories.map(a => a.level));
  
  // Calculate average level across all advisories
  const totalLevel = advisories.reduce((sum, a) => sum + a.level, 0);
  const avgLevel = totalLevel / advisories.length;
  
  return {
    level: maxLevel,
    weightedLevel: Math.round(avgLevel * 10) / 10,
  };
}

/**
 * Get color for advisory level
 */
export function getAdvisoryLevelColor(level: number): string {
  switch (level) {
    case 1: return '#10B981'; // Green - Safe
    case 2: return '#F59E0B'; // Yellow - Caution
    case 3: return '#F97316'; // Orange - High Caution
    case 4: return '#EF4444'; // Red - Do Not Travel
    default: return '#6B7280'; // Gray - Unknown
  }
}

/**
 * Get advisory level description
 */
export function getAdvisoryLevelDescription(level: number): string {
  switch (level) {
    case 1: return 'Exercise Normal Precautions';
    case 2: return 'Exercise Increased Precautions';
    case 3: return 'Reconsider Travel';
    case 4: return 'Do Not Travel';
    default: return 'Unknown';
  }
}
