import { sanitizeUrl, sanitizeUrlWithDiagnostics } from './url';

describe('sanitizeUrl', () => {
  it('returns undefined for empty/whitespace input', () => {
    expect(sanitizeUrl(undefined)).toBeUndefined();
    expect(sanitizeUrl('')).toBeUndefined();
    expect(sanitizeUrl('   ')).toBeUndefined();
  });

  it('allows http and https URLs', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    expect(sanitizeUrl('http://example.com/path')).toBe('http://example.com/path');
  });

  it('allows mailto URLs', () => {
    expect(sanitizeUrl('mailto:user@example.com')).toBe('mailto:user@example.com');
  });

  it('allows tel URLs', () => {
    expect(sanitizeUrl('tel:+468123456')).toBe('tel:+468123456');
  });

  it('allows root-relative URLs', () => {
    expect(sanitizeUrl('/sites/foo')).toBe('/sites/foo');
  });

  it('allows protocol-relative URLs', () => {
    expect(sanitizeUrl('//example.com/path')).toBe('//example.com/path');
  });

  it('rejects javascript: URLs', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBeUndefined();
  });

  it('rejects data: URLs', () => {
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBeUndefined();
  });

  it('rejects mailto URLs containing HTML', () => {
    expect(sanitizeUrl('mailto:user@example.com"><script>alert(1)</script>')).toBeUndefined();
  });

  it('rejects ambiguous relative URLs', () => {
    expect(sanitizeUrl('foo/bar')).toBeUndefined();
  });
});

describe('sanitizeUrlWithDiagnostics', () => {
  it('returns rejected reason for disallowed protocols', () => {
    const result = sanitizeUrlWithDiagnostics('javascript:alert(1)');
    expect(result.sanitizedUrl).toBeUndefined();
    expect(result.rejectedReason).toContain('disallowed-protocol');
  });

  it('returns no rejected reason for valid URLs', () => {
    const result = sanitizeUrlWithDiagnostics('https://example.com');
    expect(result.sanitizedUrl).toBe('https://example.com');
    expect(result.rejectedReason).toBeUndefined();
  });
});