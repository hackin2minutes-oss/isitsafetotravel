import { SecurityData } from '@/types';

/**
 * ACTIVE_WAR_ZONES — April 2026 (ISO Alpha-2 Codes)
 * Countries currently experiencing active armed conflict, civil war,
 * or declared military operations with civilian casualties.
 * Source: ACLED, UNOCHA, SIPRI, Wikipedia active conflicts.
 */
const ACTIVE_WAR_ZONES: Record<string, { label: string; since: string }> = {
  UA: { label: 'Russia-Ukraine War', since: '2022' },
  RU: { label: 'Russia-Ukraine War / Chechen Ops', since: '2022' },
  PS: { label: 'Gaza / Israel-Palestine Conflict', since: '2023' },
  IL: { label: 'Israel-Hamas / Lebanon Operations', since: '2023' },
  SD: { label: 'Sudanese Civil War', since: '2023' },
  YE: { label: 'Yemen Civil War', since: '2015' },
  SY: { label: 'Syrian Civil War', since: '2011' },
  MM: { label: 'Myanmar Civil War', since: '2021' },
  SO: { label: 'Somali Civil War / Al-Shabaab', since: '1991' },
  AF: { label: 'Afghan Armed Conflict', since: '2021' },
  SS: { label: 'South Sudan Civil War', since: '2013' },
  CD: { label: 'DRC Eastern Congo Conflict', since: '2003' },
  ET: { label: 'Ethiopian Tigray / Amhara Conflict', since: '2020' },
  ML: { label: 'Malian Armed Conflict', since: '2012' },
  BF: { label: 'Burkina Faso Insurgency', since: '2015' },
  NE: { label: 'Niger Insurgency / Coup', since: '2023' },
  MZ: { label: 'Mozambique Cabo Delgado Insurgency', since: '2017' },
  LY: { label: 'Libyan Civil War', since: '2014' },
  IQ: { label: 'Iraq Ongoing Armed Groups', since: '2014' },
  LB: { label: 'Lebanon-Israel Tensions', since: '2023' },
  NG: { label: 'Nigeria Boko Haram / Bandit Conflict', since: '2009' },
  CF: { label: 'Central African Republic Armed Conflict', since: '2013' },
  TD: { label: 'Chad Armed Conflict', since: '2009' },
  GN: { label: 'Guinea Coup Instability', since: '2021' },
  HT: { label: 'Haiti Gang Warfare', since: '2022' },
  MX: { label: 'Mexico Cartel Wars (Critical Zones)', since: '2006' },
  PK: { label: 'Pakistan FATA / Balochistan Armed Groups', since: '2007' },
};

/**
 * Countries NOT in active war but with severe ongoing tensions, terrorism, 
 * or civil unrest warranting DANGEROUS (Level 3 → high/skirmishes) override.
 */
const HIGH_TENSION_ZONES: Record<string, string> = {
  IR: 'Iran Regional Tensions',
  KP: 'North Korea Nuclear Standoff',
  VE: 'Venezuela Political Crisis',
  BY: 'Belarus Authoritarian Crackdown',
  BA: 'Bosnia Ethnic Tensions',
  ZW: 'Zimbabwe Political Instability',
  TN: 'Tuareg Conflict Spillover',
};

/**
 * SECURITY_SERVICE v4.0
 * RSS-driven with HARD warzone override layer.
 */
export async function getSecurityData(countryName: string, countryCode?: string): Promise<SecurityData> {
  const safeName = countryName || 'Unknown';
  const safeCode = (countryCode || '').toUpperCase();
  
  // ============================================================
  // LAYER 1: HARD WARZONE OVERRIDE (Before RSS lookup)
  // ============================================================
  if (safeCode && ACTIVE_WAR_ZONES[safeCode]) {
    const conflict = ACTIVE_WAR_ZONES[safeCode];
    console.log(`SEC_SERVICE: WARZONE OVERRIDE for ${safeCode} — ${conflict.label}`);
    return {
      threatLevel: 'critical',
      violenceIndex: 95,
      terrorismRisk: 'critical',
      warStatus: 'active_war',
      crimeRate: 80,
      recentIncidents: 50,
      lastIncidentDate: new Date().toISOString(),
      conflictLabel: conflict.label,
      conflictSince: conflict.since,
    };
  }

  if (safeCode && HIGH_TENSION_ZONES[safeCode]) {
    const label = HIGH_TENSION_ZONES[safeCode];
    console.log(`SEC_SERVICE: HIGH_TENSION OVERRIDE for ${safeCode} — ${label}`);
    return {
      threatLevel: 'high',
      violenceIndex: 65,
      terrorismRisk: 'high',
      warStatus: 'skirmishes',
      crimeRate: 50,
      recentIncidents: 15,
      lastIncidentDate: new Date().toISOString(),
      conflictLabel: label,
    };
  }
  
  // ============================================================
  // LAYER 2: RSS ADVISORY FEED (dynamic live data)
  // ============================================================
  try {
    console.log('SEC_SERVICE: Fetching RSS:', safeName);
    const response = await fetch(`/api/security?name=${encodeURIComponent(safeName)}`);
    if (!response.ok) { throw new Error('Security RSS proxy failure'); }
    
    const json = await response.json();
    const data = json.data;
    const levelScore = data.score as number; // 1, 2, 3, or 4

    const mapToThreat = (s: number): SecurityData['threatLevel'] => {
      if (s >= 4) return 'critical';
      if (s >= 3) return 'high';
      if (s >= 2) return 'moderate';
      return 'low';
    };

    const mapToWar = (s: number): SecurityData['warStatus'] => {
      if (s >= 4) return 'active_war';
      if (s >= 3) return 'skirmishes';
      if (s >= 2) return 'tensions';
      return 'peaceful';
    };

    const calcViolence = (s: number) => {
      if (s === 4) return 90;
      if (s === 3) return 60;
      if (s === 2) return 30;
      return 10;
    };

    return {
      threatLevel: mapToThreat(levelScore),
      violenceIndex: calcViolence(levelScore),
      terrorismRisk: levelScore >= 3 ? 'high' : levelScore === 2 ? 'moderate' : 'low',
      warStatus: mapToWar(levelScore),
      crimeRate: levelScore * 20,
      recentIncidents: levelScore >= 3 ? 10 : levelScore === 2 ? 3 : 0,
      lastIncidentDate: data.updated || new Date().toISOString(),
    };
  } catch (error) {
    console.error('SERVER_SIDE_SEC_ERROR:', error);
    return {
      threatLevel: 'none',
      violenceIndex: 10,
      terrorismRisk: 'low',
      warStatus: 'peaceful',
      crimeRate: 5,
      recentIncidents: 0,
    };
  }
}

export async function getSecurityDataForCoordinates(
  lat: number,
  lon: number,
  countryName: string,
  countryCode?: string
): Promise<SecurityData> {
  return getSecurityData(countryName, countryCode);
}