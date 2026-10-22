import { Store } from "@tanstack/store";

const uuidRegex =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function isValidUuid(uuid: string) {
  return uuidRegex.test(uuid);
}

/**
 * Returns the query string for a given URL, minus the leading `"?"` character. When the URL has no
 * query string, returns the empty string.
 *
 * This function does not use the `URL` class due to known issues in React Native's implementation
 * of `URL`.
 *
 * @param url a valid string URL. For example, `"https://example.com/test?hello=world"`.
 */
export function getQueryString(url: string): string {
  const idx = url.indexOf("?");
  return idx === -1 ? "" : url.slice(idx + 1);
}

/**
 * Appends a query string to a given URL. Note that this does not dedupe query params.
 *
 * This function does not use the `URL` class due to known issues in React Native's implementation
 * of `URL`.
 *
 * @param url a valid string URL.
 * @param queryString a query string, minus any leading `"?"` character.
 */
export function appendQueryString(url: string, queryString: string): string {
  return queryString
    ? `${url}${url.includes("?") ? "&" : "?"}${queryString}`
    : url;
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
  const store = new Store<T | null>(null);

  const get = async (...args: Args) => {
    const cached = store.state;
    if (cached && cached.expiresAt - CACHE_EXPIRY_PADDING_MS > Date.now()) {
      return cached;
    }
    const value = await fetchFunc(...args);
    store.setState(() => value);
    return value;
  };

  const invalidate = () => {
    store.setState(() => null);
  };

  return { get, invalidate };
}
