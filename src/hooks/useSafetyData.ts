import { useCallback, useState } from 'react';
import { useSafetyStore } from '@/store/safetyStore';
import { getWeatherData } from '@/services/weatherService';
import { getAirQualityData } from '@/services/aqiService';
import { getSecurityData } from '@/services/securityService';
import { calculateSafetyAssessment } from '@/utils/scoreCalculator';
import { reverseGeocode } from '@/services/locationService';
import { fetchWithRetry } from '@/utils/fetchWithRetry';
import { Location, SafetyAssessment, IntelData, NewsData, AviationData } from '@/types';
import { fetchWithCache } from '@/utils/performance';

const MAX_RETRIES = 2;
const RETRY_STATUSES = [408, 429, 500, 502, 503, 504];

export function useSafetyData() {
  const { 
    selectedLocation, 
    assessment, 
    originCountry,
    isAnalyzing, 
    error,
    setSelectedLocation, 
    setAssessment, 
    setIsAnalyzing, 
    setError 
  } = useSafetyStore();

  const [weatherLoading, setWeatherLoading] = useState(false);
  const [aqiLoading, setAqiLoading] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const fetchSafetyData = useCallback(async (location: Location): Promise<SafetyAssessment | null> => {
    console.log('useSafetyData: fetchSafetyData called', location);
    setIsAnalyzing(true);
    setError(null);
    setWeatherLoading(true);
    setAqiLoading(true);
    setSecurityLoading(true);
    setRetryCount(0);

    const attemptFetch = async (attempt: number): Promise<SafetyAssessment | null> => {
      try {
        let finalLocation = { ...location };
        const { latitude, longitude } = location.coordinates;

        if (!finalLocation.countryId) {
          const geocoded = await reverseGeocode(latitude, longitude);
          if (geocoded) {
            finalLocation = { ...geocoded };
          }
        }

        const countryName = finalLocation.countryName || finalLocation.name || 'Unknown';
        const countryCode = (finalLocation.countryId || '').toUpperCase();

        const apiBase = typeof window !== 'undefined' ? window.location.origin : '';
        const intelUrl = `${apiBase}/api/intel?code=${countryCode}`;
        const newsUrl = `${apiBase}/api/news?q=${encodeURIComponent(countryName)}`;
        const aviationUrl = `${apiBase}/api/aviation?country=${encodeURIComponent(countryName)}`;

        const [weather, aqi, security, intel, news, aviation] = await Promise.all([
          getWeatherData(latitude, longitude).catch(() => null),
          getAirQualityData(latitude, longitude).catch(() => null),
          getSecurityData(countryName, countryCode).catch(() => null),
          countryCode
            ? fetchWithCache<IntelData>(intelUrl).catch(() => null)
            : Promise.resolve(null),
          fetchWithCache<NewsData>(newsUrl).catch(() => null),
          fetchWithCache<AviationData>(aviationUrl).catch(() => null),
        ]);

        setWeatherLoading(false);
        setAqiLoading(false);
        setSecurityLoading(false);

        const result = calculateSafetyAssessment(weather, aqi, security, finalLocation, intel, news, aviation, originCountry);
        console.log('useSafetyData: Assessment calculated', result?.score);
        
        setAssessment(result);
        setSelectedLocation(finalLocation);
        setIsAnalyzing(false);
        setRetryCount(0);
        
        return result;
      } catch (err) {
        console.error(`Safety data fetch error (attempt ${attempt + 1}):`, err);

        if (attempt < MAX_RETRIES) {
          setRetryCount(attempt + 1);
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return attemptFetch(attempt + 1);
        }

        setIsAnalyzing(false);
        setWeatherLoading(false);
        setAqiLoading(false);
        setSecurityLoading(false);
        setRetryCount(0);
        
        const errorMessage = attempt > 0
          ? `Failed after ${attempt + 1} attempts. Please check your connection and try again.`
          : 'Failed to fetch safety data. Please try again.';
        setError(errorMessage);
        return null;
      }
    };

    return attemptFetch(0);
  }, [setSelectedLocation, setAssessment, setIsAnalyzing, setError, originCountry]);

  return {
    selectedLocation,
    assessment,
    isAnalyzing,
    weatherLoading,
    aqiLoading,
    securityLoading,
    error,
    retryCount,
    fetchSafetyData,
  };
}