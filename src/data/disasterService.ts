/**
 * GDACS (Global Disaster Alert and Coordination System) Data Fetcher
 * 
 * Fetches real-time natural disaster and conflict data
 */

import { GDACSEvent, DisasterEvent, ConflictEvent } from '../scoring/types';

const GDACS_API_URL = 'https://www.gdacs.org/xml/geojson.php';

/**
 * Fetch active GDACS alerts
 */
export async function fetchGDACSAlerts(): Promise<GDACSEvent[]> {
  try {
    const response = await fetch(GDACS_API_URL, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    
    if (!response.ok) {
      console.error('GDACS API error:', response.status);
      return [];
    }
    
    const data = await response.json();
    
    if (!data.features || !Array.isArray(data.features)) {
      return [];
    }
    
    return data.features.map((feature: any) => ({
      id: feature.properties?.id || String(Math.random()),
      name: feature.properties?.name || 'Unknown Event',
      eventtype: feature.properties?.eventtype || 'Unknown',
      alertlevel: feature.properties?.alertlevel || 'green',
      date: feature.properties?.datebegin || new Date().toISOString(),
      iso: feature.properties?.iso3 || feature.properties?.country || '',
    }));
  } catch (error) {
    console.error('GDACS fetch error:', error);
    return [];
  }
}

/**
 * Fetch alerts for specific countries
 */
export async function fetchGDACSAlertsForCountries(
  countryCodes: string[]
): Promise<Map<string, GDACSEvent[]>> {
  const allAlerts = await fetchGDACSAlerts();
  const results = new Map<string, GDACSEvent[]>();
  
  // Initialize empty arrays for all countries
  countryCodes.forEach(code => results.set(code, []));
  
  // Group alerts by country
  allAlerts.forEach(alert => {
    const codes = countryCodes.filter(code => 
      alert.iso.toLowerCase() === code.toLowerCase()
    );
    codes.forEach(code => {
      results.get(code)?.push(alert);
    });
  });
  
  return results;
}

/**
 * Convert GDACS event to internal DisasterEvent format
 */
export function convertGDACSToDisasterEvent(gdacs: GDACSEvent): DisasterEvent {
  const severityMap: Record<string, DisasterEvent['severity']> = {
    green: 'low',
    yellow: 'medium',
    orange: 'high',
    red: 'extreme',
  };
  
  const typeMap: Record<string, DisasterEvent['type']> = {
    TC: 'hurricane',
    EQ: 'earthquake',
    FL: 'flood',
    WF: 'wildfire',
    DR: 'other', // Drought
    VO: 'other', // Volcanic
  };
  
  return {
    id: gdacs.id,
    type: typeMap[gdacs.eventtype] || 'other',
    severity: severityMap[gdacs.alertlevel] || 'low',
    startDate: gdacs.date,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Calculate disaster risk score from events
 */
export function calculateDisasterRiskScore(
  events: GDACSEvent[]
): number {
  if (events.length === 0) return 1.0; // No recent disasters = high safety
  
  // Weight by severity
  const severityWeights = {
    red: 0.0,    // Extreme
    orange: 0.25, // High
    yellow: 0.5,  // Medium
    green: 0.75, // Low
  };
  
  const totalWeight = events.reduce((sum, event) => {
    return sum + (severityWeights[event.alertlevel] || 0.5);
  }, 0);
  
  const avgScore = totalWeight / events.length;
  
  // Factor in number of events (more events = lower score)
  const countPenalty = Math.min(events.length * 0.05, 0.3);
  
  return Math.max(0, avgScore - countPenalty);
}

/**
 * Conflict/Crisis data fetcher
 * (Placeholder - would integrate with ACLED, UCDP, or other conflict databases)
 */
export async function fetchConflictData(
  countryCodes: string[]
): Promise<Map<string, ConflictEvent[]>> {
  // This is a placeholder - in production, integrate with:
  // - ACLED (Armed Conflict Location & Event Data Project)
  // - UCDP (Uppsala Conflict Data Program)
  // - ReliefWeb API
  
  const results = new Map<string, ConflictEvent[]>();
  
  countryCodes.forEach(code => {
    results.set(code, []);
  });
  
  return results;
}

/**
 * Calculate conflict score from events
 */
export function calculateConflictScore(
  events: ConflictEvent[]
): number {
  if (events.length === 0) return 1.0;
  
  const severityWeights = {
    extreme: 0.0,
    high: 0.2,
    medium: 0.5,
    low: 0.8,
  };
  
  // Check for active war
  const hasWar = events.some(e => e.type === 'war');
  if (hasWar) return 0.1;
  
  // Check for terrorism
  const hasTerrorism = events.some(e => e.type === 'terrorism');
  const terrorismPenalty = hasTerrorism ? 0.2 : 0;
  
  const avgSeverity = events.reduce((sum, event) => {
    return sum + (severityWeights[event.severity] || 0.5);
  }, 0) / events.length;
  
  return Math.max(0, avgSeverity - terrorismPenalty);
}
