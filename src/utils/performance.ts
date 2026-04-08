'use client';

/**
 * Simple in-memory cache for API responses
 * Reducing redundant network requests for common travel destinations
 */
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes standard intelligence TTL

export const fetchWithCache = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const cached = cache.get(url);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  cache.set(url, { data, timestamp: Date.now() });
  return data;
};

/**
 * Clear specific cache entry or entire cache
 */
export const clearCache = (url?: string) => {
  if (url) {
    cache.delete(url);
  } else {
    cache.clear();
  }
};

/**
 * Image optimization utility (placeholder for CDN integration)
 */
export const optimizeImage = (url: string, width: number): string => {
  return `${url}?w=${width}&q=80&auto=format`;
};

/**
 * Web Vitals metrics interface
 */
interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

/**
 * Web Vitals reporting for performance tracking
 * Measures LCP, FID, CLS, TTFB, FCP
 */
export const reportWebVitals = (onPerfEntry?: (metric: WebVitalsMetric) => void) => {
  if (typeof window === 'undefined') return;

  // Use Web Vitals library if available
  const webVitalsLoaded = window.document.readyState === 'complete';

  const handleWebVitals = async (metric: WebVitalsMetric) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const displayName = metric.name === 'INP' ? 'FID (INP)' : metric.name;
      console.log(`[Web Vitals] ${displayName}:`, {
        value: metric.value.toFixed(2),
        rating: metric.rating,
        delta: metric.delta.toFixed(2),
      });
    }

    // Send to analytics if callback provided
    if (onPerfEntry && typeof onPerfEntry === 'function') {
      onPerfEntry(metric);
    }
  };

  // Dynamically import web-vitals to avoid blocking initial render
  if (webVitalsLoaded) {
    import('web-vitals').then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
      onCLS(handleWebVitals);
      onINP(handleWebVitals);
      onLCP(handleWebVitals);
      onFCP(handleWebVitals);
      onTTFB(handleWebVitals);
    }).catch(() => {
      // web-vitals not available, continue without metrics
    });
  } else {
    window.addEventListener('load', () => {
      import('web-vitals').then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
        onCLS(handleWebVitals);
        onINP(handleWebVitals);
        onLCP(handleWebVitals);
        onFCP(handleWebVitals);
        onTTFB(handleWebVitals);
      }).catch(() => {
        // web-vitals not available, continue without metrics
      });
    }, { once: true });
  }
};

/**
 * Performance marks for custom timing
 */
export const performanceMark = (markName: string) => {
  if (typeof performance !== 'undefined' && 'mark' in performance) {
    performance.mark(markName);
  }
};

/**
 * Performance measures between two marks
 */
export const performanceMeasure = (measureName: string, startMark: string, endMark: string) => {
  if (typeof performance !== 'undefined' && 'measure' in performance) {
    try {
      performance.measure(measureName, startMark, endMark);
    } catch (e) {
      console.warn('Performance measure failed:', e);
    }
  }
};
