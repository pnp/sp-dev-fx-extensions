import { SPHttpClient } from '@microsoft/sp-http';
import type { SPHttpClientResponse, ISPHttpClientOptions } from '@microsoft/sp-http';

const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 500;
const MAX_BACKOFF_MS = 8000;
const RETRYABLE_STATUS = new Set<number>([429, 503, 502]);

export interface ISpHttpRetryOptions {
  maxRetries?: number;
  baseBackoffMs?: number;
}

function parseRetryAfter(response: SPHttpClientResponse): number | undefined {
  const raw = response.headers.get('Retry-After');
  if (!raw) {
    return undefined;
  }

  const seconds = parseInt(raw, 10);
  if (!Number.isNaN(seconds)) {
    return seconds * 1000;
  }

  const date = Date.parse(raw);
  if (!Number.isNaN(date)) {
    return Math.max(0, date - Date.now());
  }

  return undefined;
}

function jitteredBackoff(attempt: number, baseMs: number): number {
  const exp = Math.min(baseMs * Math.pow(2, attempt), MAX_BACKOFF_MS);
  return Math.round(exp * (0.75 + Math.random() * 0.5));
}

async function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise<void>((resolve) => {
    const root: typeof window | undefined = typeof window !== 'undefined' ? window : undefined;
    const timer = root ? root.setTimeout(resolve, ms) : setTimeout(resolve, ms) as unknown as number;
    if (signal) {
      signal.addEventListener('abort', () => {
        if (root) {
          root.clearTimeout(timer);
        } else {
          clearTimeout(timer);
        }
        resolve();
      }, { once: true });
    }
  });
}

export async function spGetWithRetry(
  spHttpClient: SPHttpClient,
  url: string,
  options?: ISpHttpRetryOptions & { signal?: AbortSignal }
): Promise<SPHttpClientResponse> {
  const maxRetries = options?.maxRetries ?? MAX_RETRIES;
  const baseBackoff = options?.baseBackoffMs ?? BASE_BACKOFF_MS;

  let attempt = 0;
  let lastResponse: SPHttpClientResponse;

  do {
    lastResponse = await spHttpClient.get(url, SPHttpClient.configurations.v1);

    if (lastResponse.ok || !RETRYABLE_STATUS.has(lastResponse.status)) {
      return lastResponse;
    }

    if (attempt >= maxRetries) {
      return lastResponse;
    }

    const retryAfter = parseRetryAfter(lastResponse);
    const backoff = retryAfter ?? jitteredBackoff(attempt, baseBackoff);

    try {
      await lastResponse.json();
    } catch { void 0; }

    await delay(backoff, options?.signal);
    attempt += 1;
  } while (attempt <= maxRetries);

  return lastResponse;
}

export async function spPostWithRetry(
  spHttpClient: SPHttpClient,
  url: string,
  postOptions: ISPHttpClientOptions,
  options?: ISpHttpRetryOptions & { signal?: AbortSignal }
): Promise<SPHttpClientResponse> {
  const maxRetries = options?.maxRetries ?? MAX_RETRIES;
  const baseBackoff = options?.baseBackoffMs ?? BASE_BACKOFF_MS;

  let attempt = 0;
  let lastResponse: SPHttpClientResponse;

  do {
    lastResponse = await spHttpClient.post(url, SPHttpClient.configurations.v1, postOptions as Record<string, unknown>);

    if (lastResponse.ok || !RETRYABLE_STATUS.has(lastResponse.status)) {
      return lastResponse;
    }

    if (attempt >= maxRetries) {
      return lastResponse;
    }

    const retryAfter = parseRetryAfter(lastResponse);
    const backoff = retryAfter ?? jitteredBackoff(attempt, baseBackoff);

    try {
      await lastResponse.json();
    } catch { void 0; }

    await delay(backoff, options?.signal);
    attempt += 1;
  } while (attempt <= maxRetries);

  return lastResponse;
}