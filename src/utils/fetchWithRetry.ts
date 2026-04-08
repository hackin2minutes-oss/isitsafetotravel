export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableStatuses?: number[];
}

export const defaultRetryOptions: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<T> {
  const config = { ...defaultRetryOptions, ...retryOptions };
  let lastError: Error | null = null;
  let delay = config.initialDelay;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (response.ok) {
        return response.json() as Promise<T>;
      }

      if (!config.retryableStatuses.includes(response.status)) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (attempt < config.maxRetries) {
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      } else {
        throw lastError;
      }
    } catch (err) {
      lastError = err as Error;

      if (attempt < config.maxRetries) {
        await sleep(delay);
        delay = Math.min(delay * config.backoffMultiplier, config.maxDelay);
      }
    }
  }

  throw lastError || new Error('Fetch failed after retries');
}
