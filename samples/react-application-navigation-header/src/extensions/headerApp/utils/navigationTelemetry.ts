import { Log } from '@microsoft/sp-core-library';

export interface INavigationTelemetryDetail {
  action: string;
  itemId?: string;
  itemLabel?: string;
  level?: 'desktop' | 'mobile' | 'service';
  targetUrl?: string;
  termSetName?: string;
  reason?: string;
  metadata?: Record<string, string | number | boolean | undefined>;
}

interface INavigationTelemetryEnvelope {
  applicationName: string;
  detail: INavigationTelemetryDetail;
  eventName: string;
  occurredAt: string;
}

export interface INavigationTelemetryConfiguration {
  applicationName?: string;
  emitBrowserEvents?: boolean;
  endpointUrl?: string;
  
  endpointAllowlist?: string;
}

const NAVIGATION_EVENT_NAME: string = 'header:navigation';
const DIAGNOSTIC_EVENT_NAME: string = 'header:diagnostic';
const DEFAULT_CONFIGURATION: Required<Pick<INavigationTelemetryConfiguration, 'applicationName' | 'emitBrowserEvents'>> &
  Pick<INavigationTelemetryConfiguration, 'endpointUrl' | 'endpointAllowlist'> = {
  applicationName: 'header',
  emitBrowserEvents: true,
  endpointUrl: undefined,
  endpointAllowlist: undefined
};

let telemetryConfiguration: typeof DEFAULT_CONFIGURATION = { ...DEFAULT_CONFIGURATION };

export function configureNavigationTelemetry(configuration: INavigationTelemetryConfiguration): void {
  telemetryConfiguration = {
    ...telemetryConfiguration,
    ...configuration
  };
}

export function emitNavigationTelemetry(detail: INavigationTelemetryDetail): void {
  dispatchTelemetryEvent(NAVIGATION_EVENT_NAME, detail);
}

export function emitNavigationDiagnostic(detail: INavigationTelemetryDetail): void {
  dispatchTelemetryEvent(DIAGNOSTIC_EVENT_NAME, detail);

  Log.info('header', `[${detail.action}] termSet=${detail.termSetName ?? 'n/a'} reason=${detail.reason ?? 'n/a'}`);

  if (
    typeof window !== 'undefined' &&
    window.location.hostname.indexOf('localhost') >= 0
  ) {
    Log.info('header', `Telemetry diagnostic event emitted: ${JSON.stringify(detail)}`);
  }
}

function dispatchTelemetryEvent(eventName: string, detail: INavigationTelemetryDetail): void {
  const envelope: INavigationTelemetryEnvelope = {
    applicationName: telemetryConfiguration.applicationName,
    detail,
    eventName,
    occurredAt: new Date().toISOString()
  };

  if (
    telemetryConfiguration.emitBrowserEvents &&
    typeof window !== 'undefined' &&
    typeof window.dispatchEvent === 'function' &&
    typeof CustomEvent !== 'undefined'
  ) {
    window.dispatchEvent(new CustomEvent<INavigationTelemetryDetail>(eventName, { detail }));
  }

  if (telemetryConfiguration.endpointUrl) {
    sendTelemetryEnvelope(telemetryConfiguration.endpointUrl, envelope);
  }
}

const TELEMETRY_BACKOFF_MS = 30000;
let telemetryFailureTimestamp: number | undefined;

function isTelemetryEndpointAllowed(endpointUrl: string): boolean {
  try {
    const parsed = new URL(endpointUrl, window.location.origin);

    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false;
    }

    if (parsed.origin === window.location.origin) {
      return true;
    }

    const allowlistPatterns = parseAllowlist(telemetryConfiguration.endpointAllowlist);

    if (allowlistPatterns.length > 0) {
      return allowlistPatterns.some((pattern) => hostnameMatchesPattern(parsed.hostname, pattern));
    }

    return false;
  } catch {
    return false;
  }
}

function parseAllowlist(allowlist: string | undefined): string[] {
  if (!allowlist) return [];
  return allowlist.split(',').map((pattern) => pattern.trim().toLowerCase()).filter((pattern) => pattern.length > 0);
}

function hostnameMatchesPattern(hostname: string, pattern: string): boolean {
  const normalizedHostname = hostname.toLowerCase();
  const normalizedPattern = pattern.toLowerCase().replace(/^\*\./, '');

  if (pattern.startsWith('*.')) {
    return normalizedHostname === normalizedPattern || normalizedHostname.endsWith(`.${normalizedPattern}`);
  }

  return normalizedHostname === normalizedPattern;
}

function sendTelemetryEnvelope(endpointUrl: string, envelope: INavigationTelemetryEnvelope): void {
  if (!isTelemetryEndpointAllowed(endpointUrl)) {
    emitNavigationDiagnostic({
      action: 'telemetry-endpoint-rejected',
      level: 'service',
      reason: 'endpoint-not-allowed',
      metadata: {
        endpointOrigin: getEndpointOriginPreview(endpointUrl)
      }
    });
    return;
  }

  if (telemetryFailureTimestamp !== undefined && Date.now() - telemetryFailureTimestamp < TELEMETRY_BACKOFF_MS) {
    return;
  }

  telemetryFailureTimestamp = undefined;
  const payload: string = JSON.stringify(envelope);

  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    const beaconPayload: Blob = new Blob([payload], { type: 'application/json' });

    if (navigator.sendBeacon(endpointUrl, beaconPayload)) {
      return;
    }
  }

  if (typeof fetch === 'function') {
    void fetch(endpointUrl, {
      body: payload,
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      keepalive: true,
      method: 'POST'
    }).catch((error: unknown) => {
      telemetryFailureTimestamp = Date.now();
      Log.error('header', new Error(`Telemetry delivery failed: ${String(error)}`));
    });
  }
}

function getEndpointOriginPreview(endpointUrl: string): string {
  try {
    return new URL(endpointUrl, window.location.origin).origin;
  } catch {
    return 'invalid';
  }
}
