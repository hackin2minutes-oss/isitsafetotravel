import { WeatherData, AirQualityData, SecurityData, SafetyAssessment, Location, IntelData, NewsData } from '@/types';
import { generateIntelligenceData } from '@/services/intelligenceService';

export function getRatingFromScore(score: number): SafetyAssessment['rating'] {
  if (score >= 90) return 'VERY SAFE';
  if (score >= 75) return 'SAFE';
  if (score >= 60) return 'MODERATE';
  if (score >= 40) return 'CAUTION';
  if (score >= 20) return 'DANGEROUS';
  return 'CRITICAL';
}

export function calculateWeatherScore(data: WeatherData): number {
  let score = 100;
  if (data.temperature > 35) score -= 15;
  if (data.temperature < 0) score -= 10;
  if (data.windSpeed > 40) score -= 20;
  if (data.riskFactors?.length > 0) score -= 15;
  return Math.max(0, score);
}

export function calculateAQIScore(aqi: number): number {
  if (aqi <= 50) return 100;
  if (aqi <= 100) return 80;
  if (aqi <= 150) return 40;
  return 0;
}

export function calculateSecurityScore(data: SecurityData): number {
  let score = 100;
  score -= (data.violenceIndex / 100) * 40;
  const terrorismPoints: Record<string, number> = { low: 0, moderate: 20, high: 45, critical: 60 };
  score -= terrorismPoints[data.terrorismRisk] || 0;
  const warPoints: Record<string, number> = { peaceful: 0, tensions: 15, skirmishes: 30, active_war: 70 };
  score -= warPoints[data.warStatus] || 0;
  return Math.max(0, score);
}

export function calculateOverallSafetyScore(
  weatherScore: number,
  aqiScore: number,
  securityScore: number,
  weatherData: WeatherData | null,
  securityData: SecurityData | null,
  originCountry: string = 'US',
  destinationCountry: string = 'US'
): { finalScore: number, overrideReason?: string } {
  let weightedScore = Math.round(weatherScore * 0.2 + aqiScore * 0.1 + securityScore * 0.7);
  
  // 0. Bilateral Tension Penalty
  const BILATERAL_TENSIONS: Record<string, string[]> = {
    'US': ['RU', 'IR', 'KP', 'SY', 'AF'],
    'UA': ['RU', 'BY'],
    'IL': ['LB', 'SY', 'IR', 'IQ', 'YE'],
    'TW': ['CN'],
    'IN': ['PK'],
    'KR': ['KP'],
    'CN': ['US', 'TW', 'JP'],
  };

  const hasTension = BILATERAL_TENSIONS[originCountry]?.includes(destinationCountry) || 
                    BILATERAL_TENSIONS[destinationCountry]?.includes(originCountry);

  if (hasTension) {
    weightedScore -= 25; // Significant diplomatic risk penalty
  }
  
  // ==========================================
  // DISASTER & WAR CIRCUIT BREAKERS (OVERRIDES)
  // ==========================================

  // 1. War and Conflict Overrides
  if (securityData) {
    if (securityData.warStatus === 'active_war' || securityData.threatLevel === 'critical') {
      return { finalScore: 15, overrideReason: 'CRITICAL OVERRIDE: ACTIVE CONFLICT ZONE' };
    }
    if (securityData.warStatus === 'skirmishes' || securityData.threatLevel === 'high') {
      if (weightedScore > 35) return { finalScore: 35, overrideReason: 'DANGEROUS OVERRIDE: SEVERE INSTABILITY' };
    }
  }

  // 2. Natural Disaster Overrides
  if (weatherData) {
    const hasEarthquake = weatherData.riskFactors.some(f => f.includes('Earthquake'));
    if (hasEarthquake) {
      return { finalScore: 15, overrideReason: 'CRITICAL OVERRIDE: RECENT SEISMIC DISASTER DETECTED' };
    }

    const hasSevereStorm = weatherData.windSpeed > 80 || weatherData.riskFactors.includes('Thunderstorm');
    if (hasSevereStorm) {
       if (weightedScore > 30) return { finalScore: 30, overrideReason: 'DANGEROUS OVERRIDE: EXTREME WEATHER EVENT' };
    }
  }

  // Baseline Security breaker
  if (securityScore < 70 && weightedScore > securityScore) {
    weightedScore = securityScore;
  }
  
  return { finalScore: Math.max(0, weightedScore) };
}

export function calculateSafetyAssessment(
  weather: WeatherData | null,
  aqi: AirQualityData | null,
  security: SecurityData | null,
  location: Location,
  intel?: IntelData | null,
  news?: NewsData | null,
  originCountry: string = 'US'
): SafetyAssessment {
  // Safe Fallbacks
  const sw = weather || { temperature: 22, feelsLike: 22, humidity: 45, windSpeed: 8, riskFactors: [], condition: 'Clear', windDirection: 'N', uvIndex: 4, visibility: 10000 };
  const sa = aqi || { aqi: 42, category: 'Good', pm25: 8, pm10: 15, no2: 5, o3: 30, so2: 1 };
  const ss = security || { threatLevel: 'low', violenceIndex: 10, terrorismRisk: 'low', warStatus: 'peaceful', crimeRate: 15, recentIncidents: 0 };

  const wScore = calculateWeatherScore(sw);
  const aScore = calculateAQIScore(sa.aqi);
  const sScore = calculateSecurityScore(ss);
  
  const destination = (location.countryId || '').toUpperCase();

  // Calculate with new Override engine
  const { finalScore, overrideReason: baseOverride } = calculateOverallSafetyScore(wScore, aScore, sScore, sw, ss, originCountry, destination);
  
  let overrideReason = baseOverride;
  if (!overrideReason && finalScore < Math.round(wScore * 0.2 + aScore * 0.1 + sScore * 0.7)) {
     overrideReason = 'BILATERAL DIPLOMATIC RISK DETECTED';
  }

  const rating = getRatingFromScore(finalScore);

  const statuses = {
    weather: wScore > 80 ? 'Optimal' : wScore > 50 ? 'Variable' : 'Hazardous',
    aqi: aScore > 80 ? 'Pristine' : aScore > 50 ? 'Moderate' : 'Unhealthy',
    security: sScore > 80 ? 'Stable' : sScore > 50 ? 'Elevated' : 'Compromised',
  };

  const summaries: Record<SafetyAssessment['rating'], string> = {
    'VERY SAFE': 'Region currently displays maximum stability. All safety parameters are optimal for international transit.',
    'SAFE': 'General environment is secure. Standard travel procedures are authorized for all sectors.',
    'MODERATE': 'Elevated awareness advised. Monitor local developments and maintain standard cautious protocols.',
    'CAUTION': 'Significant safety variance detected. High-risk zones should be avoided and plans should be reviewed.',
    'DANGEROUS': 'Safety integrity is degraded. Non-essential travel to this region is strongly discouraged.',
    'CRITICAL': 'Global Warning Active. This region is considered high-threat. Abort all transit operations immediately.',
  };

  // 7. Inject Intelligence data
  const intelligence = generateIntelligenceData(location, sw, sa, ss, finalScore, intel);

  return {
    score: finalScore,
    rating,
    summary: overrideReason ? `⚠️ ${overrideReason}. ${summaries[rating]}` : summaries[rating],
    weather: { score: wScore, status: statuses.weather, data: sw },
    airQuality: { score: aScore, status: statuses.aqi, data: sa },
    security: { score: sScore, status: statuses.security, data: ss },
    
    // Extracted Advanced Intelligence
    dimensions: intelligence.dimensions,
    advisories: intelligence.advisories,
    quickFacts: intelligence.quickFacts,
    tips: intelligence.tips,
    emergency: intelligence.emergency,
    requirements: intelligence.requirements,
    news: news?.items || [],
    logistics: intelligence.logistics,
    
    recommendation: overrideReason 
      ? 'EMERGENCY ADVISORY: Do not travel to this region. Follow local consulate directives immediately.' 
      : 'Detailed Advisory: Verify documentation, ensure secondary communication channels are active, and register with your local consulate.',
    lastUpdated: new Date().toISOString(),
  };
}