/**
 * Safety Score Calculation Engine
 * 
 * Uses Weighted Geometric Mean with Safety Nets architecture
 * Score Range: 1.0 (Dangerous) to 10.0 (Safe)
 */

import { CountryData, PillarScores, RawScore } from './types';

// Pillar weights - must sum to 1.0
export const PILLAR_WEIGHTS: Record<keyof PillarScores, number> = {
  conflict: 0.30,   // 30% - Active conflicts, terrorism
  crime: 0.25,      // 25% - Personal safety, theft, violent crime
  health: 0.20,     // 20% - Healthcare quality, disease prevalence
  governance: 0.15,  // 15% - Rule of law, corruption, stability
  environment: 0.10, // 10% - Natural disasters, climate risk
};

// Safety thresholds
const HARD_CAP_THRESHOLD = 0.40; // Level 4 advisory percentage that triggers hard cap
const HARD_CAP_SCORE = 2.0;       // Maximum score when hard cap is active
const CRITICAL_FLOOR_MULTIPLIER = 1.5;
const CRITICAL_PILLAR_THRESHOLD = 0.25;
const MIN_PILLAR_VALUE = 0.001;   // Prevent ln(0)
const DECAY_HALF_LIFE_DAYS = 30; // Data loses half its weight after 30 days

// Normalization functions for different raw score types
export const normalizers = {
  /**
   * World Bank Governance Indicators (approx -2.5 to 2.5)
   */
  governance: (raw: number): number => {
    // Normalize from [-2.5, 2.5] to [0, 1]
    const normalized = (raw + 2.5) / 5;
    return Math.max(0, Math.min(1, normalized));
  },

  /**
   * Global Peace Index (1.0 to 5.0, lower is better)
   */
  peaceIndex: (raw: number): number => {
    // Invert and normalize: 5.0 -> 0, 1.0 -> 1
    const normalized = 1 - ((raw - 1) / 4);
    return Math.max(0, Math.min(1, normalized));
  },

  /**
   * GDACS/Disaster frequency (0 to N events)
   */
  disasterRisk: (raw: number): number => {
    // Higher frequency = lower score
    // Assume max ~50 events/year is extremely bad
    const normalized = Math.max(0, 1 - (raw / 50));
    return Math.max(0, Math.min(1, normalized));
  },

  /**
   * Crime rate per 100,000 population
   */
  crimeRate: (raw: number): number => {
    // Assume >100 per 100k is maximum danger
    const normalized = Math.max(0, 1 - (raw / 100));
    return Math.max(0, Math.min(1, normalized));
  },

  /**
   * Travel advisory levels (1-4 to 0-1)
   * Level 1: Exercise Normal Precautions -> 1.0
   * Level 2: Exercise Increased Precautions -> 0.66
   * Level 3: Reconsider Travel -> 0.33
   * Level 4: Do Not Travel -> 0.0
   */
  travelAdvisory: (level: number): number => {
    if (level <= 1) return 1.0;
    if (level >= 4) return 0.0;
    return (4 - level) / 3;
  },

  /**
   * Healthcare Quality Index (0-100)
   */
  healthcareQuality: (raw: number): number => {
    return Math.max(0, Math.min(1, raw / 100));
  },

  /**
   * Environmental risk score (0-10, lower is better)
   */
  environmentalRisk: (raw: number): number => {
    return Math.max(0, Math.min(1, 1 - (raw / 10)));
  },
};

/**
 * Calculate the decay factor based on data age
 * @param lastUpdated - ISO date string
 * @returns Decay factor between 0 and 1
 */
export function calculateFreshnessDecay(lastUpdated: string): number {
  const updateDate = new Date(lastUpdated);
  const now = new Date();
  const daysSinceUpdate = Math.floor((now.getTime() - updateDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Half-life decay: after 30 days, weight is 0.5
  const decay = Math.pow(0.5, daysSinceUpdate / DECAY_HALF_LIFE_DAYS);
  return Math.max(0.1, decay); // Minimum 10% weight even for very old data
}

/**
 * Apply freshness decay to pillar scores
 */
export function applyFreshnessDecay(
  pillars: PillarScores,
  timestamps: Record<keyof PillarScores, string>
): PillarScores {
  const decayed: PillarScores = { conflict: 0, crime: 0, health: 0, governance: 0, environment: 0 };
  
  (Object.keys(pillars) as Array<keyof PillarScores>).forEach((key) => {
    const decayFactor = calculateFreshnessDecay(timestamps[key]);
    decayed[key] = pillars[key] * decayFactor;
  });
  
  return decayed;
}

/**
 * Calculate Weighted Geometric Mean
 * 
 * Formula: Score = exp(Σ(wi × ln(Pi)))
 * 
 * This ensures that a single low pillar significantly drags down the overall score
 * (unlike arithmetic mean where low values can be offset by high values)
 */
export function calculateWeightedGeometricMean(pillars: PillarScores): number {
  let weightedLogSum = 0;
  
  (Object.keys(PILLAR_WEIGHTS) as Array<keyof PillarScores>).forEach((key) => {
    const weight = PILLAR_WEIGHTS[key];
    const value = Math.max(pillars[key], MIN_PILLAR_VALUE);
    weightedLogSum += weight * Math.log(value);
  });
  
  return Math.exp(weightedLogSum);
}

/**
 * Check if hard cap should be applied
 * If >50% of government advisories are Level 4, cap score at 2.0
 */
export function checkHardCap(advisories: { level: number; weight?: number }[]): boolean {
  if (advisories.length === 0) return false;
  
  let level4Weight = 0;
  let totalWeight = 0;
  
  advisories.forEach(({ level, weight = 1 }) => {
    totalWeight += weight;
    if (level === 4) {
      level4Weight += weight;
    }
  });
  
  return (level4Weight / totalWeight) > HARD_CAP_THRESHOLD;
}

/**
 * Calculate Critical Floor
 * If any pillar < 0.25, final score cannot exceed min(pillar) × 1.5
 */
export function calculateCriticalFloor(pillars: PillarScores): number | null {
  const minPillar = Math.min(...Object.values(pillars));
  
  if (minPillar < CRITICAL_PILLAR_THRESHOLD) {
    return minPillar * CRITICAL_FLOOR_MULTIPLIER * 9 + 1;
  }
  
  return null;
}

/**
 * Main composite score calculation
 * 
 * @param pillars - Pillar scores (0-1 scale)
 * @param advisories - Government travel advisories (optional)
 * @param timestamps - Last update timestamps for decay calculation
 * @returns Composite safety score (1.0 to 10.0)
 */
export function calculateCompositeScore(
  pillars: PillarScores,
  advisories?: { level: number; weight?: number }[],
  timestamps?: Record<keyof PillarScores, string>
): RawScore {
  // Apply freshness decay if timestamps provided
  const effectivePillars = timestamps 
    ? applyFreshnessDecay(pillars, timestamps)
    : pillars;
  
  // Step 1: Calculate Weighted Geometric Mean
  const geometricMean = calculateWeightedGeometricMean(effectivePillars);
  
  // Step 2: Scale to 1-10 range
  let score = geometricMean * 9 + 1;
  
  // Step 3: Apply Critical Floor
  const criticalFloor = calculateCriticalFloor(effectivePillars);
  if (criticalFloor !== null) {
    score = Math.min(score, criticalFloor);
  }
  
  // Step 4: Apply Hard Cap if >50% Level 4 advisories
  if (advisories && checkHardCap(advisories)) {
    score = Math.min(score, HARD_CAP_SCORE);
  }
  
  // Round to 1 decimal place
  const finalScore = Math.round(score * 10) / 10;
  
  // Clamp to valid range
  const clampedScore = Math.max(1.0, Math.min(10.0, finalScore));
  
  // Calculate pillar scores for display
  const pillarScores = (Object.keys(PILLAR_WEIGHTS) as Array<keyof PillarScores>).map((key) => ({
    name: key,
    value: Math.round(effectivePillars[key] * 10) / 10,
    weight: PILLAR_WEIGHTS[key],
    displayName: key.charAt(0).toUpperCase() + key.slice(1),
  }));
  
  return {
    score: clampedScore,
    pillarScores,
    isHardCapped: advisories ? checkHardCap(advisories) : false,
    isFloorLimited: criticalFloor !== null,
    rawGeometricMean: geometricMean,
  };
}

/**
 * Get score rating category
 */
export function getScoreRating(score: number): {
  category: 'CRITICAL' | 'DANGEROUS' | 'CAUTION' | 'MODERATE' | 'SAFE' | 'VERY_SAFE';
  color: string;
  description: string;
} {
  if (score < 2) return { category: 'CRITICAL', color: '#DC2626', description: 'Do Not Travel' };
  if (score < 4) return { category: 'DANGEROUS', color: '#EF4444', description: 'High Risk' };
  if (score < 6) return { category: 'CAUTION', color: '#F59E0B', description: 'Exercise Caution' };
  if (score < 8) return { category: 'MODERATE', color: '#10B981', description: 'Generally Safe' };
  if (score < 9) return { category: 'SAFE', color: '#059669', description: 'Safe' };
  return { category: 'VERY_SAFE', color: '#047857', description: 'Very Safe' };
}

/**
 * Calculate scores for multiple countries
 */
export function calculateBatchScores(
  countryData: Map<string, {
    pillars: PillarScores;
    advisories?: { level: number; weight?: number }[];
    timestamps?: Record<keyof PillarScores, string>;
  }>
): Map<string, RawScore> {
  const results = new Map<string, RawScore>();
  
  countryData.forEach((data, countryCode) => {
    results.set(countryCode, calculateCompositeScore(data.pillars, data.advisories, data.timestamps));
  });
  
  return results;
}

/**
 * Test the scoring engine with known scenarios
 */
export function runScoringTests(): void {
  console.log('=== Safety Score Engine Tests ===\n');
  
  // Test 1: Perfect scores
  const perfect: PillarScores = { conflict: 1, crime: 1, health: 1, governance: 1, environment: 1 };
  console.log('Test 1 - Perfect Scores:', calculateCompositeScore(perfect));
  
  // Test 2: One terrible pillar (0.1)
  const oneBad: PillarScores = { conflict: 0.1, crime: 1, health: 1, governance: 1, environment: 1 };
  console.log('Test 2 - 0.1 Conflict (should be very low):', calculateCompositeScore(oneBad));
  
  // Test 3: All moderate (0.5)
  const moderate: PillarScores = { conflict: 0.5, crime: 0.5, health: 0.5, governance: 0.5, environment: 0.5 };
  console.log('Test 3 - All Moderate (0.5):', calculateCompositeScore(moderate));
  
  // Test 4: One bad with critical floor
  const criticalFloor: PillarScores = { conflict: 0.2, crime: 1, health: 1, governance: 1, environment: 1 };
  const result = calculateCompositeScore(criticalFloor);
  console.log('Test 4 - Critical Floor (<0.25):', result);
  console.log('  Is Floor Limited:', result.isFloorLimited);
  
  // Test 5: Hard cap with many Level 4 advisories
  const withAdvisories = calculateCompositeScore(moderate, [
    { level: 4, weight: 0.6 }, // 60% Level 4
    { level: 2, weight: 0.4 },
  ]);
  console.log('Test 5 - Hard Cap (>50% Level 4):', withAdvisories);
  console.log('  Is Hard Capped:', withAdvisories.isHardCapped);
  
  console.log('\n=== Tests Complete ===');
}

// Run tests if executed directly
if (require.main === module) {
  runScoringTests();
}
