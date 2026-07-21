import { emitNavigationDiagnostic } from './navigationTelemetry';

const ALLOWED_URL_PROTOCOLS: ReadonlySet<string> = new Set(['http:', 'https:', 'mailto:', 'tel:']);
const MAILTO_HTML_RE = /<[^>]*>/;
const ROOT_RELATIVE_URL_RE = /^\/[^/]/;
const RELATIVE_URL_RE = /^(?:\.\.?\/|[a-zA-Z0-9_\-%][^:]*$)/;

export interface IUrlSanitizationResult {
  sanitizedUrl: string | undefined;
  rejectedReason: string | undefined;
}

export function sanitizeUrl(url: string | undefined): string | undefined {
  return sanitizeUrlWithDiagnostics(url).sanitizedUrl;
}

export function sanitizeUrlWithDiagnostics(url: string | undefined): IUrlSanitizationResult {
  if (!url) {
    return { sanitizedUrl: undefined, rejectedReason: undefined };
  }

  const trimmed = url.trim();

  if (trimmed.length === 0) {
    return { sanitizedUrl: undefined, rejectedReason: 'empty-url' };
  }

  if (ROOT_RELATIVE_URL_RE.test(trimmed) || trimmed.startsWith('//')) {
    return { sanitizedUrl: trimmed, rejectedReason: undefined };
  }

  if (RELATIVE_URL_RE.test(trimmed)) {
    logRejectedUrl(trimmed, 'ambiguous-relative-url');
    return { sanitizedUrl: undefined, rejectedReason: 'ambiguous-relative-url' };
  }

  try {
    const parsed = new URL(trimmed, window.location.origin);

    if (!ALLOWED_URL_PROTOCOLS.has(parsed.protocol)) {
      logRejectedUrl(trimmed, `disallowed-protocol:${parsed.protocol}`);
      return { sanitizedUrl: undefined, rejectedReason: `disallowed-protocol:${parsed.protocol}` };
    }

    if (parsed.protocol === 'mailto:' && MAILTO_HTML_RE.test(trimmed)) {
      logRejectedUrl(trimmed, 'mailto-html-injection');
      return { sanitizedUrl: undefined, rejectedReason: 'mailto-html-injection' };
    }

    return { sanitizedUrl: trimmed, rejectedReason: undefined };
  } catch {
    logRejectedUrl(trimmed, 'parse-error');
    return { sanitizedUrl: undefined, rejectedReason: 'parse-error' };
  }
}

export function parseUrl(url: string): URL | undefined {
  if (!url) {
    return undefined;
  }

  const trimmed = url.trim();

  if (!trimmed) {
    return undefined;
  }

  try {
    return new URL(trimmed, window.location.origin);
  } catch {
    return undefined;
  }
}

function logRejectedUrl(url: string, reason: string): void {

  const preview = url.length > 40 ? `${url.slice(0, 20)}...${url.slice(-10)}` : url;

  emitNavigationDiagnostic({
    action: 'url-sanitization-rejected',
    level: 'service',
    reason,
    metadata: {
      urlPreview: preview
    }
  });
}
