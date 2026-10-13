const uuidRegex =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function isValidUuid(uuid: string) {
  return uuidRegex.test(uuid);
}

/**
 * Exponential backoff with full jitter and a minimum delay floor.
 *
 * - Uses exponential growth capped at maxDelayMs
 * - Applies full jitter to spread retries uniformly across the window
 * - Enforces a minimum delay to avoid tight retry loops
 *
 * Example (baseDelayMs = 1000):
 *   Try 1:   250ms – 1,000ms
 *   Try 2:   250ms – 2,000ms
 *   Try 3:   250ms – 4,000ms
 *   Try 4:   250ms – 8,000ms
 *   Try 5+:  250ms – maxDelayMs
 */
export function exponentialBackoffFullJitter(
  tries: number,
  {
    baseDelayMs,
    maxDelayMs,
    minDelayMs = 250,
  }: {
    baseDelayMs: number;
    maxDelayMs: number;
    minDelayMs?: number;
  },
): number {
  const exponentialDelay = Math.min(
    maxDelayMs,
    baseDelayMs * Math.pow(2, Math.max(0, tries - 1)),
  );

  if (exponentialDelay <= minDelayMs) {
    return minDelayMs;
  }

  const jitterRange = exponentialDelay - minDelayMs;
  return minDelayMs + Math.floor(Math.random() * jitterRange);
}

export type CachedFetch<Args extends unknown[], T> = {
  /**
   * Returns the cached value if still valid, otherwise calls `fetchFunc` with the same args and
   * caches the result.
   */
  get: (...args: Args) => Promise<T>;
  /**
   * Drops any cached value so the next `get` call fetches again.
   */
  invalidate: () => void;
};

export const CACHE_EXPIRY_PADDING_MS = 5_000;

/**
 * Wraps `fetchFunc` so its result is cached until `expiresAt` (epoch ms), minus
 * `CACHE_EXPIRY_PADDING_MS`.
 */
export function cacheUntilExpired<
  Args extends unknown[],
  T extends { expiresAt: number },
>(fetchFunc: (...args: Args) => Promise<T>): CachedFetch<Args, T> {
  let cached: T | null = null;

  const get = async (...args: Args) => {
    if (cached && cached.expiresAt - CACHE_EXPIRY_PADDING_MS > Date.now()) {
      return cached;
    }
    const value = await fetchFunc(...args);
    cached = value;
    return value;
  };

  const invalidate = () => {
    cached = null;
  };

  return { get, invalidate };
}
