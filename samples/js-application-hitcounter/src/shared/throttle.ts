/**
 * Backing off when SharePoint throttles (scope 14, risk 7). SharePoint answers
 * 429 (too many requests) or 503 (server busy) with a Retry-After header;
 * callers wait that long before trying again. Pure, so it can be unit-tested.
 */

/** Longest wait the dashboard accepts for one retry. */
export const MAX_RETRY_WAIT_MS: number = 120000;

export function isThrottled(status: number): boolean {
  return status === 429 || status === 503;
}

/**
 * How long to wait before retry number `attempt` (1 = first retry).
 * Uses Retry-After (seconds, or an HTTP date) when given, otherwise
 * 2, 4, 8, 16... seconds. Always between 0.5 seconds and `capMs`.
 */
export function retryDelayMs(retryAfter: string | undefined, attempt: number, nowMs: number, capMs: number = MAX_RETRY_WAIT_MS): number {
  let wait: number = NaN;
  const value: string = (retryAfter || '').trim();
  if (value) {
    if (/^\d+(\.\d+)?$/.test(value)) {
      wait = parseFloat(value) * 1000;
    } else {
      const at: number = new Date(value).getTime();
      if (!isNaN(at)) {
        wait = at - nowMs;
      }
    }
  }
  if (isNaN(wait)) {
    wait = Math.pow(2, Math.max(1, attempt)) * 1000;
  }
  return Math.max(500, Math.min(capMs, Math.round(wait)));
}
